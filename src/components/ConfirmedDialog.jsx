import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import "../styles/ConfirmedDialog.scss";
import { Close } from "@mui/icons-material";
import password from "../assets/images/password.png";

const ConfirmedDialog = ({ open, onClose, title, description, onYes }) => {
  return (
    <>
      <Dialog open={open} className="dialog">
        <DialogTitle className="dialog__header">
          {title}
          <Stack>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent className="dialog__content">
          {/* <img
            src={password}
            className="dialog__content--img"
            alt="reset Password"
          /> */}
          <Typography>{description}</Typography>
        </DialogContent>
        <DialogActions className="dialog__action">
          <Button onClick={onClose} color="info">
            No
          </Button>
          <Button onClick={onYes} variant="contained" color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmedDialog;
