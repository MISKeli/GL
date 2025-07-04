/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  Close,
  LockOutlined,
  LockOpenOutlined,
  Add,
  Remove,
  WorkHistoryOutlined,
} from "@mui/icons-material";
import {
  useLazyGetSystemClosedDateQuery,
  usePutSystemClosedDateMutation,
} from "../../features/api/closedDateApi";
import { toast } from "sonner";

const ClosedDateDialogPage = ({ onClose, onOpen }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [closedDate, setClosedDate] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fetchClosedDate, { data: closedData, isFetching }] =
    useLazyGetSystemClosedDateQuery();

  const [UpdateClosedDate] = usePutSystemClosedDateMutation();

  useEffect(() => {
    if (onOpen) {
      fetchClosedDate({ UsePagination: false });
    }
  }, [onOpen, fetchClosedDate]);

  useEffect(() => {
    if (closedData?.value?.length) {
      //setInitialClosedDate(closedData.value[0].closedDate);
      setClosedDate(closedData.value[0].closedDate); // Set initial editable state
    }
  }, [closedData]);
  const getOrdinalSuffix = (num) => {
    if (!num || isNaN(num)) return "";
    if (num >= 11 && num <= 13) return "th";
    const lastDigit = num % 10;
    return ["st", "nd", "rd"][lastDigit - 1] || "th";
  };

  const increaseDate = () => setClosedDate((prev) => Math.min(15, prev + 1));
  const decreaseDate = () => setClosedDate((prev) => Math.max(1, prev - 1));

  const toggleEditMode = async () => {
    if (isEditMode) {
      // If exiting edit mode, save the changes
      setLoading(true);
      try {
        await UpdateClosedDate({
          id: closedData?.value?.[0]?.id,
          closedDate,
        }).unwrap();
        toast.success("Closed Date updated successfully!");
        setIsEditMode(false);
      } catch (error) {
        toast.error(error?.data?.message || "Failed to update Closed Date");
      } finally {
        setLoading(false);
      }
    } else {
      // If entering edit mode, just toggle the state
      setIsEditMode(true);
    }
  };

  return (
    <Dialog open={onOpen} maxWidth="xs" fullWidth>
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: "bold",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <WorkHistoryOutlined color="primary" />
          <Typography color="primary" variant="h6">
            Closed Date Information
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        sx={{
          textAlign: "center",
          height: "30vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isFetching ? (
          <CircularProgress />
        ) : (
          <>
            {/* Controls for Edit Mode - Paper is Centered between Buttons */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              {isEditMode && (
                <IconButton onClick={decreaseDate} disabled={closedDate === 1}>
                  <Remove />
                </IconButton>
              )}

              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  minWidth: 120,
                }}
              >
                {isEditMode ? (
                  <LockOpenOutlined color="primary" fontSize="large" />
                ) : (
                  <LockOutlined color="error" fontSize="large" />
                )}

                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={isEditMode ? "primary" : "error"}
                >
                  {closedDate}
                  {getOrdinalSuffix(closedDate)}
                </Typography>
                <Typography>of the Month</Typography>
              </Paper>

              {isEditMode && (
                <IconButton onClick={increaseDate} disabled={closedDate === 15}>
                  <Add />
                </IconButton>
              )}
            </Box>

            {/* Text Below Paper */}
            <Typography mt={2} color="textSecondary">
              {isEditMode
                ? "Select from 1 to 15 only."
                : "This date is closed for modifications."}
            </Typography>
          </>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" color="error" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={toggleEditMode}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isEditMode ? (
            "Update"
          ) : (
            "Modify"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClosedDateDialogPage;
