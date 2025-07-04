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
        <DialogTitle fontWeight={600} className="dialog__header">
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
          <Typography variant="h6">{description}</Typography>
        </DialogContent>
        <DialogActions className="dialog__action">
          <Button onClick={onClose} variant="contained" color="error">
            No
          </Button>
          <Button onClick={onYes} variant="contained" color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmedDialog;
