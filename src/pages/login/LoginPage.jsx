import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Grid,
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
    code: "onChange",
  });

  const [login] = usePostLoginMutation();

  const isAuthenticated = useSelector((state) => state.auth.token);

  const loginHandler = (data) => {
    login(data)
      .unwrap()
      .then((res) => {
        console.log(res);
        sessionStorage.setItem("token", encrypt(res.value?.token));
        dispatch(loginSlice({ token: res?.value?.token, user: res?.value }));
        sessionStorage.setItem("user", JSON.stringify(res.value));

        sessionStorage.setItem("uToken", encrypt(data?.username));
        sessionStorage.setItem("pToken", encrypt(data?.password));
        setShowPasswordDialog(true);
        toast.success("Login Successfully");

        navigate("/");
      })
      .catch((error) => {
        console.log({ error });
        toast.error(error?.data.error.message);
      });
  };
  useEffect(() => {
    if (isAuthenticated) {
      return navigate("/");
    }
  }, [isAuthenticated]);

  return (
    <Box className="login-page">
      <Box className="login-page__container">
        <Grid container spacing={2}>
          <Grid item xs={6} className="login-page__container--logo">
            <img src={logo} alt="Logo" />
            <Typography component={"h1"} variant="h4">
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
                  <Stack spacing={2} sx={{ mr: 3 }}>
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
                          // size="small"
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
                          sx={{ minWidth: 370, maxWidth: 370 }}
                          {...field}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock sx={{ color: "primary.light" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment
                                position="end"
                                sx={!watch("password") && { display: "none" }}
                              >
                                <IconButton
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
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
                          //size="small"
                          helperText={errors?.password?.message}
                          error={!!errors?.password?.message}
                        />
                      )}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2, minWidth: "170px" }}
                      disabled={!isValid}
                    >
                      Sign in
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
                  Powered By MIS All right reserved
                </Typography>
                <Typography variant="caption">Copyrights © 2024</Typography>
              </Box>
            </Container>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LoginPage;
