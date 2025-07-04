import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Grid,
  Container,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import MISLOGO from "../../assets/images/MISLOGO.png";
import "../../styles/LoginPage.scss";
import { usePostLoginMutation } from "../../features/api/loginApi";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "../../schemas/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { encrypt } from "../../utils/encrypt";
import { loginSlice } from "../../features/slice/authSlice";
import { toast } from "sonner";
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import PasswordDialog from "../../components/PasswordDialog";
import { moduleSchema } from "../../schemas/moduleSchema";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { username: "", password: "" },
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const [login] = usePostLoginMutation();

  // Permission checker utility
  const checkUserPermissions = (userPermissions, moduleSchema) => {
    // console.log(
    //   "🚀 ~ checkUserPermissions ~ userPermissions:",
    //   userPermissions
    // );
    // console.log("🚀 ~ checkUserPermissions ~ moduleSchema:", moduleSchema);
    // Find the first module the user has permission to access
    for (const module of moduleSchema) {
      // Check if user has permission for this module
      if (userPermissions.includes(module.name)) {
        return module.to; // Return the route path
      }

      // If module has subcategories, check those too
      if (module.subCategory) {
        for (const subModule of module.subCategory) {
          if (userPermissions.includes(subModule.name)) {
            return subModule.to; // Return subcategory route
          }
        }
      }
    }

    // If no permissions found, return default dashboard or access denied route
    // return "/access-denied";
  };

  const loginHandler = async (data) => {
    setLoading(true);
    try {
      const res = await login(data).unwrap();
      // console.log("🚀 ~ loginHandler ~ res:", res);

      const encryptedToken = encrypt(res.value?.token);
      sessionStorage.setItem("token", encryptedToken);
      dispatch(loginSlice({ token: res?.value?.token, user: res?.value }));
      sessionStorage.setItem("user", JSON.stringify(res.value));
      sessionStorage.setItem("uToken", encrypt(data?.username));
      sessionStorage.setItem("pToken", encrypt(data?.password));

      // Check if password needs to be changed
      if (data.username === data.password) {
        setShowPasswordDialog(true);
      } else {
        // Check permissions and navigate to first allowed module
        const userPermissions =
          res.value?.permission || res.value?.user?.permission || [];
        // console.log("🚀 ~ loginHandler ~ userPermissions:", userPermissions);

        if (userPermissions.length > 0) {
          const allowedRoute = checkUserPermissions(
            userPermissions,
            moduleSchema
          );
          // console.log("🚀 ~ loginHandler ~ allowedRoute:", allowedRoute);
          navigate(allowedRoute);
        } else {
          // Fallback to dashboard if no specific permissions but login is successful
          navigate("/");
        }

        toast.success("Login Successfully");
      }
    } catch (error) {
      toast.error(error?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle password dialog close with permission check
  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);

    // Get user data from sessionStorage since it was stored during login
    const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userPermissions =
      userData?.permissions || userData?.user?.permissions || [];

    if (userPermissions.length > 0) {
      const allowedRoute = checkUserPermissions(userPermissions, moduleSchema);
      navigate(allowedRoute);
    } else {
      navigate("/");
    }
  };

  return (
    <Box className="login-page">
      <Box className="login-page__container">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} className="login-page__container--logo">
            <img src={logo} alt="Logo" />
            <Typography component="h1" variant="h4">
              GENERAL LEDGER
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            className="login-page__container--textfield"
          >
            <Container>
              <Box className="login-page__container--form">
                <Typography component="h1" variant="h5">
                  Login
                </Typography>
                <form
                  onSubmit={handleSubmit(loginHandler)}
                  id="form-submit"
                  autoComplete="off"
                >
                  <Stack spacing={2} sx={{ width: "100%" }}>
                    <Controller
                      name="username"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccountCircle
                                  sx={{ color: "primary.light", maxWidth: 50 }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          label="Username"
                          fullWidth
                          margin="dense"
                          helperText={errors?.username?.message}
                          error={!!errors?.username?.message}
                        />
                      )}
                    />

                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock sx={{ color: "primary.light" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  sx={{
                                    visibility: watch("password")
                                      ? "visible"
                                      : "hidden",
                                  }}
                                >
                                  {showPassword ? (
                                    <VisibilityOff
                                      sx={{ color: "primary.light" }}
                                    />
                                  ) : (
                                    <Visibility
                                      sx={{ color: "primary.light" }}
                                    />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          fullWidth
                          margin="dense"
                          helperText={errors?.password?.message}
                          error={!!errors?.password?.message}
                        />
                      )}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={!isValid || loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Sign in"}
                    </Button>
                  </Stack>
                </form>
              </Box>
              <PasswordDialog
                open={showPasswordDialog}
                onClose={handlePasswordDialogClose}
              />
              <Box className="login-page__footer">
                <img src={MISLOGO} alt="Side Logo" />
                <Typography variant="caption">
                  Powered By MIS All rights reserved
                </Typography>
                <Typography variant="caption">Copyright © 2024</Typography>
              </Box>
            </Container>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoginPage;
