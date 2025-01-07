import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./LoginPage";

export const LoginRoutes = () => {
  const token = sessionStorage.getItem("token");

  //console.log(token);

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  let auth = { token };
  return auth.token ? <Navigate to="/" /> : <LoginPage />;
};
