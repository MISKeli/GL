import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { userSchema } from "../../schemas/validation";
import { useAddUserMutation } from "../../features/api/userApi";
import {
  Autocomplete,
  Button,
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
import { Close } from "@mui/icons-material";
import { toast } from "sonner";
import { useLazyGetCedarDataQuery } from "../../features/api/cedarApi";
import { useSelector } from "react-redux";
import { useLazyGetAllUserRoleAsyncQuery } from "../../features/api/roleApi";

const AddUser = ({ open, closeHandler }) => {
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(userSchema),
    code: "onChange",
    defaultValues: {
      idPrefix: "",
      idNumber: "",
      firstName: "",
      lastName: "",
      middleName: "",
      userRoleId: null,
      sex: "",
      username: "",
      password: "",
    },
  });

  const [addUser] = useAddUserMutation();

  const [triggerFetchRole, { data: roleData, isLoading: isRoleLoading }] =
    useLazyGetAllUserRoleAsyncQuery();
  console.log({ roleData });

  const [triggerFetchCedar, { data: cedarData, isLoading: isCedarLoading }] =
    useLazyGetCedarDataQuery();

  const pokedData = useSelector((state) => state.auth.pokedData);

  const handleChangeRegistrationData = (value) => {
    setValue("idPrefix", value?.general_info?.prefix_id || "");
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

  const handleFormValue = () => {
    setValue(
      "cedarData",
      `${pokedData.idPrefix} ${pokedData.idNumber} ${pokedData.lastName} ${pokedData.firstName}` ||
        ""
    );
    setValue("userRoleId", pokedData?.userRoleId || "");
    setValue("idPrefix", pokedData?.idPrefix || "");
    setValue("idNumber", pokedData?.idNumber || "");
    setValue("firstName", pokedData?.firstName || "");
    setValue("middleName", pokedData?.middleName || "");
    setValue("lastName", pokedData?.lastName || "");
    setValue("roleName", pokedData?.roleName || "");
    setValue("sex", pokedData?.sex || "");
    setValue("userRoleId", pokedData?.role.id || "");
    setValue("username", pokedData?.username || "");
  };
  const handleClose = () => {
    reset();
    closeHandler();
  };

  const submitHandler = (userData) => {
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
    addUser(body)
      .unwrap()
      .then((res) => {
        console.log({ res });
        const userAccResMessage = "User Created Successfully";
        toast.success(userAccResMessage);
        reset();
        handleClose();
      })
      .catch((error) => {
        console.log({ error });
        const userAccErrMessage = error?.data?.error.message;
        toast.error(userAccErrMessage);
      });
  };

  return (
    <Dialog
      open={open}
      fullWidth
      onClose={handleClose}
      className="add-user__dialog"
    >
      <DialogTitle className="add-user__header">
        {info.users_dialog_add_title}
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
              <Controller
                name="cedarData"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    loading={isCedarLoading}
                    options={cedarData || []}
                    onChange={(e, data) => {
                      handleChangeRegistrationData(data);
                    }}
                    getOptionLabel={(option) =>
                      option.general_info.full_id_number_full_name
                    }
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
                    getOptionLabel={(option) => option.roleName}
                    onChange={(e, value) => {
                      field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Role"
                        variant="outlined"
                        fullWidth
                        onClick={() =>
                          triggerFetchRole({ preferCacheValue: true })
                        }
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
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions className="add-user__actions">
        <Button color="error" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          form="submit-form"
          disabled={!isValid}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUser;
