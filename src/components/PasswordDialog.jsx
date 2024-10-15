import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { changePasswordSchema } from "../schemas/validation";
import { useChangePasswordMutation } from "../features/api/passwordApi";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { info } from "../schemas/info";
import { decrypt, encrypt } from "../utils/encrypt";
import { toast } from "sonner";
import { Close } from "@mui/icons-material";
import "../styles/PasswordDialog.scss";

const PasswordDialog = ({ open, onClose, isReset, userId, username }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { decryptedData: decryptedUToken } = decrypt(
    sessionStorage.getItem("uToken")
  );
  const { decryptedData: decryptedPToken } = decrypt(
    sessionStorage.getItem("pToken")
  );

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    code: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });
  const [changePassword] = useChangePasswordMutation();

  const onSubmit = (data) => {
    changePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    })
      .unwrap()
      .then((res) => {
        toast.success("Password Change Successfully");
        sessionStorage.setItem("pToken", encrypt(data.new_password));
        console.log({ res });
        reset();
        onClose();
      })
      .catch((err) => {
        toast.error(err?.data?.error?.message);
        console.log({ err });
      });
  };
  const handleClose = () => {
    reset(); // Reset the form fields when closing the dialog
    onClose();
  };
  return (
    <Dialog open={open} fullWidth className="password">
      <DialogTitle className="password__title" fontWeight={600}>
        <Stack direction="row" justifyContent="space-between">
          {info.password_title}
          {decryptedUToken !== decryptedPToken ? (
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          ) : null}
        </Stack>
      </DialogTitle>
      <DialogContent className="password__content">
        <Controller
          name="oldPassword"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              label="Old Password"
              type={showPassword ? "text" : "password"}
              margin="dense"
              {...field}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword ? errors.oldPassword.message : ""}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              margin="dense"
              {...field}
              error={!!errors.newPassword}
              helperText={errors.newPassword ? errors.newPassword.message : ""}
            />
          )}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
          }
          label="Show Passwords"
        />
      </DialogContent>
      <DialogActions className="password__actions">
        {decryptedUToken !== decryptedPToken ? (
          <Button onClick={handleClose} variant="contained" color="error">
            Cancel
          </Button>
        ) : null}
        <Button
          variant="contained"
          
          disabled={!isValid}
          onClick={handleSubmit(onSubmit)}
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordDialog;
