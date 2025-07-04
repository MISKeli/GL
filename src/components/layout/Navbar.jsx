import {
  AccountCircleRounded,
  KeyboardArrowDown,
  Logout,
  Notifications,
  Password,
  WorkHistoryOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Fade,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "../../styles/layout/Navbar.scss";
import { useDispatch } from "react-redux";
import { logoutSlice } from "../../features/slice/authSlice";
import PasswordDialog from "../PasswordDialog";
import ClosedDateDialogPage from "../../pages/SystemClosedDate/ClosedDateDialogPage";
import moment from "moment";

const Navbar = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(false);
  const popperRef = useRef(null);
  //Password Dialog

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  //Date
  const currentDate = moment().format("dddd, MMMM DD, YYYY");

  //Dialog
  const handleClose = () => {
    setOpenPasswordDialog(false);
  };

  const handleClosedDateDialog = () => {
    setOpenDialog(true);
    setAnchorEl(null);
  };
  const handleChangePasswordClick = () => {
    setAnchorEl(null);
    setIsReset(false);
    setOpenPasswordDialog(true);
  };

  const handleTogglePopper = (event) => {
    setAnchorEl((prevAnchorEl) => (prevAnchorEl ? null : event.currentTarget));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popperRef.current &&
        !popperRef.current.contains(event.target) &&
        anchorEl !== event.target // Ensures the button click also closes the Popper
      ) {
        setAnchorEl(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [anchorEl]);

  //Logout
  const logout = () => {
    dispatch(logoutSlice());
    sessionStorage.clear();
  };

  // for getting user Data
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userPermissions = user?.permission || [];
  //console.log("🚀 ~ Navbar ~ user:", user);

  return (
    <>
      <Box className="navbar">
        <Box className="navbar__container--icon">
          <IconButton>
            <Notifications />
          </IconButton>

          <Typography fontWeight={500}>{currentDate}</Typography>

          <Button onClick={handleTogglePopper}>
            <AccountCircleRounded sx={{ fontSize: 36, marginRight: "10px" }} />
            <Box className="navbar__menu--title" sx={{ textAlign: "left" }}>
              <Typography fontWeight={500}>
                {user.firstName}, {user.lastName}
              </Typography>
              <Typography variant="button">{user.roleName}</Typography>
            </Box>
            <KeyboardArrowDown
              className="navbar__menu--icon"
              sx={{
                transition: "transform 0.3s ease",
                transform: anchorEl ? "rotate(180deg)" : "rotate(0deg)",
                ml: 1,
              }}
            />
          </Button>
        </Box>
      </Box>

      <Popper
        className="navbar__menu"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-end"
        disablePortal
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Box ref={popperRef}>
              <Paper>
                <Typography className="navbar__menu__profile">
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
                {/* Conditionally Render Closed Date if User has Permission */}
                {userPermissions.includes("Closed Date") && (
                  <MenuItem
                    className="navbar__menu__item"
                    onClick={handleClosedDateDialog}
                  >
                    <ListItemIcon>
                      <WorkHistoryOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Closed Date" />
                  </MenuItem>
                )}

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
              </Paper>
            </Box>
          </Fade>
        )}
      </Popper>
      <PasswordDialog
        open={openPasswordDialog}
        onClose={handleClose}
        isReset={isReset}
        userId={user.id}
      />

      {/* Closed Date Dialog */}
      <ClosedDateDialogPage
        onOpen={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </>
  );
};

export default Navbar;
