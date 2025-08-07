// PrintPreviewDialog.jsx
import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import TrialBalancePrint from "./TrialBalancePrint"; // adjust path if needed
import moment from "moment";
import { info } from "../../schemas/info";

const PrintPreviewDialog = ({
  open,
  onClose,
  trialBalanceData,
  reportData,
  debitTotal,
  creditTotal,
  debitBalanceTotal,
  creditBalanceTotal,
}) => {
  const date = moment(reportData.toMonth).format("MMMM YYYY");
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Trial_Balance_Report - ${date}`,
    onAfterPrint: onClose,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Print Preview — {info.trialbalance_title}</DialogTitle>
      <DialogContent dividers>
        <Box ref={printRef}>
          <TrialBalancePrint
            trialBalanceData={trialBalanceData}
            reportData={reportData}
            debitTotal={debitTotal}
            creditTotal={creditTotal}
            debitBalanceTotal={debitBalanceTotal}
            creditBalanceTotal={creditBalanceTotal}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handlePrint} variant="contained" color="primary">
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintPreviewDialog;
