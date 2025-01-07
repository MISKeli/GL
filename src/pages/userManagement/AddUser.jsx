import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { userSchema } from "../../schemas/validation";
import {
  useAddUserMutation,
  useUpdateUserMutation,
} from "../../features/api/userApi";
import {
  Autocomplete,
  Button,
  CircularProgress,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import "../../styles/AddUser.scss";
import { info } from "../../schemas/info";
import { Close, Watch } from "@mui/icons-material";
import { toast } from "sonner";
import { useLazyGetCedarDataQuery } from "../../features/api/cedarApi";
import { useDispatch, useSelector } from "react-redux";
import ConfirmedDialog from "../../components/ConfirmedDialog";
import { setPokedData } from "../../features/slice/authSlice";
import { useGetAllUserRoleAsyncQuery } from "../../features/api/roleApi";
import { defaultValue } from "../../schemas/defaultValue";

const AddUser = ({ open = false, closeHandler, data, isUpdate = false }) => {
  const [loading, setLoading] = useState(false); // Add loading state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const {
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(userSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaultValue.userAcc,
  });
  const dispatch = useDispatch();
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const { data: roleData, isLoading: isRoleLoading } =
    useGetAllUserRoleAsyncQuery();

  const [triggerFetchCedar, { data: cedarData, isLoading: isCedarLoading }] =
    useLazyGetCedarDataQuery();

  const pokedData = useSelector((state) => state.auth.pokedData);

  const handleChangeRegistrationData = (value) => {
    setValue("idPrefix", value?.general_info?.prefix_id || "");
    setValue("idNumber", value?.general_info?.id_number || "");
    setValue("firstName", value?.general_info?.first_name || "");
    setValue("middleName", value?.general_info?.middle_name || "");
    setValue("lastName", value?.general_info?.last_name || "");
    setValue("sex", value?.general_info?.gender || "");
    setValue(
      "username",
      value?.general_info
        ? `${value?.general_info?.first_name
            ?.toLowerCase()
            ?.charAt(0)}${value?.general_info?.last_name
            ?.replace(/\s/g, "")
            .toLowerCase()}`
        : ""
    );
  };
  //console.log(watch("userRoleId"));
  const handleFormValue = () => {
    setValue(
      "cedarData",
      `${pokedData.idPrefix} ${pokedData.idNumber} ${pokedData.lastName} ${pokedData.firstName}` ||
        ""
    );

    const roleDataValues = roleData?.value?.find(
      (item) => item?.roleName == pokedData?.userRole
    );

    setValue("userRoleId", roleDataValues || "");
    //console.log("userRole2", pokedData);
    setValue("idPrefix", pokedData?.idPrefix || "");
    setValue("idNumber", pokedData?.idNumber || "");
    setValue("firstName", pokedData?.firstName || "");
    setValue("middleName", pokedData?.middleName || "");
    setValue("lastName", pokedData?.lastName || "");
    setValue("roleName", pokedData?.roleName || "");
    setValue("sex", pokedData?.sex || "");
    setValue("username", pokedData?.username || "");
  };
  const handleClose = () => {
    reset(defaultValue.userAcc);
    closeHandler();
    dispatch(setPokedData(null));
  };

  useEffect(() => {
    if (open == true && pokedData) {
      handleFormValue();
    }
  }, [open]);
  //console.log("IsUPdate", isUpdate);
  const confirmSubmit = async (userData) => {
    setLoading(true); // Set loading to true at the start of submission
    const body = {
      idPrefix: userData.idPrefix,
      idNumber: userData.idNumber,
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      userRoleId: userData.userRoleId.id,
      sex: userData.sex,
      username: userData.username,
      password: userData.username,
    };

    const updateBody = {
      idPrefix: userData.idPrefix,
      idNumber: userData.idNumber,
      firstName: userData.firstName,
      lastName: userData.lastName,
      middleName: userData.middleName,
      userRoleId: userData.userRoleId.id,
      sex: userData.sex,
      username: userData.username,
    };

    try {
      if (isUpdate) {
        await updateUser({ id: pokedData.id, ...updateBody }).unwrap();
        toast.success("User Updated Successfully");
      } else {
        await addUser(body).unwrap();
        toast.success("User Created Successfully");
      }
      reset();
      handleClose();
    } catch (error) {
      const userAccErrMessage = error?.data?.error.message;
      toast.error(userAccErrMessage);
    } finally {
      setLoading(false); // Set loading to false after submission completes
    }
  };

  const submitHandler = (userData) => {
    if (isUpdate) {
      setOpenConfirmDialog(true); // Open confirmation dialog when updating
    } else {
      handleSubmit(confirmSubmit)(userData); // Directly submit when adding new user
    }
  };

  const handleConfirmYes = () => {
    handleSubmit(confirmSubmit)(); // Continue the submission after user confirms
    setOpenConfirmDialog(false); // Close the confirmation dialog
  };

  //filtering Cedar data
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    limit: 10,
  });

  //console.log({ pokedData, roleData });
  return (
    <>
      <Dialog
        open={open}
        fullWidth
        onClose={handleClose}
        className="add-user__dialog"
      >
        <DialogTitle fontWeight={600} className="add-user__header">
          {isUpdate
            ? info.users_dialog_update_title
            : info.users_dialog_add_title}
          <Stack>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent className="add-user__content">
          <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {isUpdate ? (
                  <Controller
                    name="cedarData"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Employee ID"
                        disabled
                        fullWidth
                        variant="outlined"
                        margin="dense"
                        size="small"
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name="cedarData"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        filterOptions={filterOptions}
                        loading={isCedarLoading}
                        options={cedarData || []}
                        onChange={(e, data) => {
                          handleChangeRegistrationData(data);
                        }}
                        getOptionLabel={(option) => {
                          if (!option.general_info) return "Unknown Employee";
                          const { full_id_number, full_name } =
                            option.general_info;
                          return `(${full_id_number || "N/A"}) - ${
                            full_name || "Unknown"
                          }`;
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Employee ID"
                            variant="outlined"
                            fullWidth
                            onClick={() =>
                              triggerFetchCedar({ preferCacheValue: true })
                            }
                            margin="dense"
                            size="small"
                            error={!!errors.idNumber}
                            helperText={errors.idNumber?.message}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="userRoleId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      loading={isRoleLoading}
                      options={roleData?.value || []} // Add your options here
                      getOptionLabel={(option) => {
                        //console.log("Current Option:", option); // Log each option being rendered
                        return option.roleName || option;
                      }}
                      isOptionEqualToValue={(option, value) => {
                        // console.log("Option:", option, "Value:", value); // Log the comparison between option and value
                        return option?.roleName === value; // Adjust this comparison as needed
                      }}
                      onChange={(e, value) => {
                        //console.log("Selected Value:", value); // Log the selected value when a new option is selected
                        field.onChange(value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Role"
                          variant="outlined"
                          fullWidth
                          onClick={() => {
                            //.log("Role Data:", roleData); // Log the role data when the input is clicked
                            triggerFetchCedar({ preferCacheValue: true });
                          }}
                          size="small"
                          error={!!errors.userRoleId}
                          helperText={errors.userRoleId?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="idPrefix"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ID Prefix"
                      variant="outlined"
                      disabled
                      fullWidth
                      size="small"
                      error={!!errors.idPrefix}
                      helperText={errors.idPrefix?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="idNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ID Number"
                      variant="outlined"
                      disabled
                      fullWidth
                      size="small"
                      error={!!errors.idNumber}
                      helperText={errors.idNumber?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      variant="outlined"
                      disabled
                      fullWidth
                      size="small"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      variant="outlined"
                      disabled
                      fullWidth
                      size="small"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="middleName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Middle Name"
                      disabled
                      variant="outlined"
                      fullWidth
                      size="small"
                      error={!!errors.middleName}
                      helperText={errors.middleName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="sex"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Sex"
                      variant="outlined"
                      disabled
                      fullWidth
                      size="small"
                      error={!!errors.sex}
                      helperText={errors.sex?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Username"
                      variant="outlined"
                      fullWidth
                      size="small"
                      error={!!errors.username}
                      helperText={errors.username?.message}
                      onChange={(e) => {
                        field.onChange(e.target.value); // Trigger change and validation
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions className="add-user__actions">
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            form="submit-form"
            disabled={!isValid || loading}
            startIcon={
              loading ? <CircularProgress color="info" size={20} /> : null
            }
          >
            {loading ? "Processing..." : isUpdate ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmedDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        title="Confirm Changes"
        description="Are you sure you want to save the changes?"
        onYes={handleConfirmYes}
      />
    </>
  );
};

export default AddUser;
