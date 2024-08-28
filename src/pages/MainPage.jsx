import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import "../styles/MainPage.scss";
import AppBreadcrumbs from "../components/AppBreadcrumbs";
import { decrypt } from "../utils/encrypt";
import PasswordDialog from "../components/PasswordDialog";

const MainPage = () => {
  const [showPasswordDialog, setShowPassword] = useState(false);
  const handleDialog = () => {
    setShowPassword(true);
  };

  const { decryptedData: decryptedUToken } = decrypt(
    sessionStorage.getItem("uToken")
  );
  const { decryptedData: decryptedPToken } = decrypt(
    sessionStorage.getItem("pToken")
  );
  useEffect(() => {
    if (decryptedUToken === decryptedPToken) {
      handleDialog();
    }
  }, [decryptedUToken, decryptedPToken]);
  return (
    <>
      <Box className="main-page">
        <PasswordDialog
          open={showPasswordDialog}
          onClose={() => {
            setShowPassword(false);
          }}
        />
        <Box className="main-page_sidebar">
          <Sidebar />
        </Box>
        <Box className="main-page__content">
          <Box className="navbar">
            <Navbar />
          </Box>
          {/* < AppBreadcrumbs /> */}
          <Box className="main-page__content-outlet">
            <Outlet />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MainPage;
