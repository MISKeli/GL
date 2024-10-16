import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "../../styles/DialogSetup.scss";
import { info } from "../../schemas/info";
import { Close } from "@mui/icons-material";
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
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false); // New state to track connection success
  const pokedData = useSelector((state) => state.auth.pokedData);

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

  const [AddNewSystem] = useAddNewSystemMutation();
  const [UpdateSystem] = useUpdateSystemMutation();

  const handleClose = () => {
    reset(defaultValue.system);
    setConnectionSuccess(false); // Reset connection success on close
    closeHandler();
  };

  const handleFormValue = () => {
    setValue("systemName", pokedData?.systemName || "");
    setValue("endpoint", pokedData?.endpoint || "");
    setValue("token", pokedData?.token || "");
  };

  useEffect(() => {
    if (open && pokedData) {
      handleFormValue();
    }
  }, [open, pokedData]);

  const confirmSubmit = async (systemData) => {
    setLoading(true);
    const body = {
      systemName: systemData.systemName.toUpperCase(),
      endpoint: systemData.endpoint,
      token: systemData.token,
    };
    const updateBody = {
      systemName: systemData.systemName.toUpperCase(),
      endpoint: systemData.endpoint,
      token: systemData.token,
    };

    try {
      if (isUpdate) {
        await UpdateSystem({ id: pokedData.id, ...updateBody }).unwrap();
        toast.success("System Updated Successfully");
      } else {
        await AddNewSystem(body).unwrap();
        toast.success("System Created Successfully");
      }
      reset();
      handleClose();
    } catch (error) {
      const systemErrMessage = error?.data?.error.message;
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
            ? info.setup_dialog_update_title
            : info.setup_dialog_add_title}
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
                      error={!!errors.token}
                      helperText={errors.token?.message}
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
              disabled={loading || !isValid}
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
              disabled={loading || !isValid}
              startIcon={
                loading ? <CircularProgress color="info" size={20} /> : null
              }
            >
              {loading ? "Processing..." : isUpdate ? "Save" : "Register"}
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
