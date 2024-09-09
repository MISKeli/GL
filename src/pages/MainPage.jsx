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
  return (
    <>
      <Box className="main-page">
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
