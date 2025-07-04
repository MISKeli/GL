import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "../../styles/DialogSetup.scss";
import { info } from "../../schemas/info";
import { AttachFile, Clear, Close } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { systemSchema } from "../../schemas/validation";

import {
  useAddNewSystemMutation,
  useUpdateSystemMutation,
} from "../../features/api/systemApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { defaultValue } from "../../schemas/defaultValue";
import ConfirmedDialog from "../../components/ConfirmedDialog";
import { useTestConnectQuery } from "../../features/api/testerApi";

const DialogSetup = ({
  open = false,
  closeHandler,
  data,
  isUpdate = false,
}) => {
  console.log("🚀 ~ data:", data);
  const [loading, setLoading] = useState(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false); // New state to track connection success
  const [preview, setPreview] = useState(null);
  const pokedData = useSelector((state) => state.auth.pokedData);
  console.log("🚀 ~ pokedData:", pokedData);

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(systemSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: [defaultValue.system],
  });

  // Query to test connection, manually triggered via refetch
  const {
    data: testData,
    isSuccess: isTestSuccess,
    isError: isTestError,
    refetch,
  } = useTestConnectQuery(
    {
      endpoint: watch("endpoint"),
      token: watch("token"),
    },
    { skip: !watch("endpoint") || !watch("token") }
  );

  const [AddNewSystem, { isLoading, isFetching }] = useAddNewSystemMutation();
  //console.log("🚀 ~ isLoading:", isLoading);
  const [UpdateSystem] = useUpdateSystemMutation();

  const handleClose = () => {
    reset(defaultValue.system);
    setConnectionSuccess(false); // Reset connection success on close
    setPreview(null);
    closeHandler();
  };

  useEffect(() => {
    if (isUpdate && pokedData?.iconUrl) {
      setPreview(pokedData.iconUrl); // Assuming it's a URL
      setValue("iconFile", pokedData.iconUrl);
    }
  }, [isUpdate, pokedData, setValue]);

  const handleFormValue = () => {
    setValue("systemName", pokedData?.systemName || "");
    setValue("endpoint", pokedData?.endpoint || "");
    setValue("token", pokedData?.token || "");
    setValue("iconFile", pokedData?.iconUrl || null);
    setValue("id", pokedData?.id || "");
  };

  useEffect(() => {
    if (open && pokedData) {
      handleFormValue();
    }
  }, [open, pokedData]);

  const confirmSubmit = async (systemData) => {
    console.log("🚀 ~ confirmSubmit ~ systemData:", systemData);

    setLoading(true);

    // Create FormData
    const formData = new FormData();
    formData.append("systemName", systemData.systemName.toUpperCase());
    formData.append("endpoint", systemData.endpoint);
    formData.append("token", systemData.token);
    formData.append("id", systemData.id);

    console.log("watch", watch("systemData"));

    // Append file if it exists
    if (systemData.iconFile) {
      formData.append("iconFile", systemData.iconFile);
    }

    try {
      if (isUpdate) {
        await UpdateSystem({ id: systemData.id, formData }).unwrap();

        toast.success("System Updated Successfully");
      } else {
        await AddNewSystem(formData).unwrap();

        toast.success("System Created Successfully");
      }
      reset();
      handleClose();
    } catch (error) {
      console.log("🚀 ~ confirmSubmit ~ error:", error);
      const systemErrMessage = Object.entries(error?.data?.errors || {})
        .map(([key, messages]) => `${key}: ${messages.join(", ")}`)
        .join("\n");
      toast.error(systemErrMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = (systemData) => {
    if (isUpdate) {
      setOpenConfirmDialog(true);
    } else {
      handleSubmit(confirmSubmit)(systemData);
    }
  };

  const handleTestClick = async () => {
    const endpoint = watch("endpoint");
    const token = watch("token");

    if (!endpoint || !token) {
      toast.error("Please provide both endpoint and token.");
      return;
    }
    setLoading(true);
    try {
      const { isSuccess } = await refetch({ endpoint, token });

      if (isSuccess) {
        toast.success("Connection successful!");
        setConnectionSuccess(true); // Mark connection as successful
      } else {
        toast.error("Connection failed. Please check the endpoint and token.");
      }
    } catch (error) {
      toast.error("An error occurred while testing the connection.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleConfirmYes = () => {
    handleSubmit(confirmSubmit)();
    setOpenConfirmDialog(false);
  };

  return (
    <>
      <Dialog open={open} fullWidth className="dialogsetup">
        <DialogTitle fontWeight={600} className="dialogsetup__dialog__header">
          {isUpdate
            ? info.setup.dialogs.updateTitle
            : info.setup.dialogs.addTitle}
          <Stack>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent className="dialogsetup__dialog__content">
          <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="systemName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="System Name"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      size="small"
                      error={!!errors.systemName}
                      helperText={errors.systemName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="endpoint"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Endpoint"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      size="small"
                      onChange={(e) => {
                        field.onChange(e);
                        setConnectionSuccess(false); // Reset connection success
                      }}
                      error={!!errors.endpoint}
                      helperText={errors.endpoint?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="token"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Token"
                      variant="outlined"
                      fullWidth
                      type="password"
                      margin="dense"
                      size="small"
                      onChange={(e) => {
                        field.onChange(e);
                        setConnectionSuccess(false); // Reset connection success
                      }}
                      error={!!errors.token}
                      helperText={errors.token?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="iconFile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="System Icon"
                      value={
                        typeof field.value === "string"
                          ? field.value
                          : field.value?.name || ""
                      }
                      InputProps={{
                        startAdornment: preview && (
                          <InputAdornment position="start">
                            <Box
                              component="img"
                              src={preview}
                              alt="SVG Preview"
                              sx={{ width: 30, height: 30, marginRight: 1 }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {field.value ? (
                              <IconButton
                                onClick={() => {
                                  setPreview(null);
                                  field.onChange(null);
                                }}
                              >
                                <Clear />
                              </IconButton>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/svg+xml"
                                  style={{ display: "none" }}
                                  id="upload-icon"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const objectUrl =
                                        URL.createObjectURL(file);
                                      setPreview(objectUrl);
                                      field.onChange(file);
                                    }
                                  }}
                                />
                                <label htmlFor="upload-icon">
                                  <IconButton component="span">
                                    <AttachFile />
                                  </IconButton>
                                </label>
                              </>
                            )}
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.iconFile}
                      helperText={errors.iconFile?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="contained" onClick={handleClose}>
            Cancel
          </Button>
          {!connectionSuccess && ( // Hide Test button after successful connection
            <Button
              color="info"
              variant="contained"
              disabled={isLoading || isFetching || !isValid}
              startIcon={
                isLoading || isFetching ? (
                  <CircularProgress color="info" size={20} />
                ) : null
              }
              onClick={handleTestClick}
            >
              Test
            </Button>
          )}
          {connectionSuccess && ( // Show Register button only after successful connection
            <Button
              variant="contained"
              type="submit"
              form="submit-form"
              disabled={isLoading || !isValid}
              startIcon={
                isLoading ? <CircularProgress color="info" size={20} /> : null
              }
            >
              {isLoading ? "Processing..." : isUpdate ? "Save" : "Register"}
            </Button>
          )}
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

export default DialogSetup;
