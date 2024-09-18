import {
  AccountCircleRounded,
  Logout,
  Notifications,
  Password,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import "../../styles/layout/Navbar.scss";
import { useDispatch } from "react-redux";
import { logoutSlice } from "../../features/slice/authSlice";
import PasswordDialog from "../PasswordDialog";

const Navbar = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(false);
  const [open, setopen] = useState(false);

  //Password Dialog
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [isReset, setIsReset] = useState(false);

  //Dialog
  const handleClose = () => {
    setOpenConfirmDialog(false);
    setOpenPasswordDialog(false);
    setopen(false);
  };

  const handleChangePasswordClick = () => {
    setAnchorEl(null);
    setIsReset(false);
    setOpenPasswordDialog(true);
  };

  //Menu
  const handlePopOverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };

  //Logout
  const logout = () => {
    dispatch(logoutSlice());
    sessionStorage.clear();
  };

  // for getting user Data
  const user = JSON.parse(sessionStorage.getItem("user"));

  return (
    <>
      <Box className="navbar">
        <Box className="navbar__container">
          <Typography className="navbar__container--user">
            Fresh Morning, {user.username}
          </Typography>
        </Box>
        <Box className="navbar__container--icon">
          <IconButton>
            <Notifications />
          </IconButton>
          <IconButton>
            <AccountCircleRounded
              onClick={(event) => {
                handlePopOverOpen(event);
              }}
            />
          </IconButton>
        </Box>
      </Box>

      <Menu
        className="navbar__menu"
        open={Boolean(anchorEl)}
        onClose={handlePopOverClose}
        anchorEl={anchorEl}
      >
        <Box className="navbar__menu--title">
          <Typography fontWeight={500}>
            {user.firstName}, {user.lastName}
          </Typography>

          <Typography variant="button">{user.roleName}</Typography>
        </Box>
        <Divider sx={{ m: 0.5, height: 1 }} orientation="horizontal" />

        <Typography className="navbar__menu--title">
          Profile Settings
        </Typography>
        <MenuItem
          className="navbar__menu__item"
          onClick={handleChangePasswordClick}
        >
          <ListItemIcon>
            <Password />
          </ListItemIcon>
          <ListItemText primary="Change Password" />
        </MenuItem>
        <Divider sx={{ m: 0.5, height: 1 }} orientation="horizontal" />
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <Logout className="navbar__menu__item--logout" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            className="navbar__menu__item--logout"
          />
        </MenuItem>
      </Menu>
      <PasswordDialog
        open={openPasswordDialog}
        onClose={handleClose}
        isReset={isReset}
        userId={user.id}
      />
    </>
  );
};

export default Navbar;
