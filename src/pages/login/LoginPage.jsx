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
import { useDispatch, useSelector } from "react-redux";
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
  const isAuthenticated = useSelector((state) => state.auth.token);

  const loginHandler = async (data) => {
    setLoading(true);
    try {
      const res = await login(data).unwrap();
      const encryptedToken = encrypt(res.value?.token);
      sessionStorage.setItem("token", encryptedToken);
      dispatch(loginSlice({ token: res?.value?.token, user: res?.value }));
      sessionStorage.setItem("user", JSON.stringify(res.value));
      sessionStorage.setItem("uToken", encrypt(data?.username));
      sessionStorage.setItem("pToken", encrypt(data?.password));

      if (data.username === data.password) {
        setShowPasswordDialog(true);
      } else {
        navigate("/");
        toast.success("Login Successfully");
      }
    } catch (error) {
      toast.error(error?.data.error.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/");
  //   }
  // }, [isAuthenticated, navigate]);

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
                onClose={() => {
                  setShowPassword(false);
                  navigate("/");
                }}
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
