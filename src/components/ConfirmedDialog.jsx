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
          <Typography variant="captiom">{description}</Typography>
        </DialogContent>
        <DialogActions className="dialog__action">
          <Button onClick={onClose} color="primary">
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
