import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  DialogTitle,
} from "@mui/material";
import { Close, Print } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import DetailedTrialBalancePrint from "./DetailedTrialBalancePrint";
import { info } from "../../schemas/info";

const DetailedTrialBalancePrintDialog = ({
  open,
  onClose,
  trialBalanceData,
  reportData,
  totals,
}) => {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Detailed_Trial_Balance_${reportData.fromMonth}_to_${reportData.toMonth}`,
    onAfterPrint: () => {
      console.log("Print completed");
    },
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    `,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        Print Preview — {info.detailed_trialbalance_title}
      </DialogTitle>

      <DialogContent
        sx={{
          padding: 0,
          overflow: "auto",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box
          ref={printRef}
          sx={{
            backgroundColor: "white",
            margin: "20px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          <DetailedTrialBalancePrint
            trialBalanceData={trialBalanceData}
            reportData={reportData}
            totals={totals}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          padding: "8px 16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrint}
            disabled={!trialBalanceData || trialBalanceData?.length === 0}
          >
            Print
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DetailedTrialBalancePrintDialog;
