/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import React, { useRef, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { Print, Close } from "@mui/icons-material";
import BalanceSheetPrint from "./BalanceSheetPrint";

const BalanceSheetPrintDialog = ({
  open,
  onClose,
  transformedData,
  reportData,
}) => {
  const printRef = useRef(null);

  // Alternative approach using useCallback
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Balance Sheet as of ${
      reportData?.toMonth || "Current Date"
    }`,
    removeAfterPrint: true,
  });

  // Fallback print handler
  const handlePrintFallback = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Balance Sheet as of ${
              reportData?.toMonth || "Current Date"
            }</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 2mm 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                }
              }
              /* Copy your print styles here */
              .balance-sheet-print {
                width: 100%;
                font-family: Arial, sans-serif;
              }
              .balance-sheet-print table {
                width: 100%;
                border-collapse: collapse;
                font-size: 9px;
              }
              .balance-sheet-print th,
              .balance-sheet-print td {
                border: 1px solid #000;
                padding: 2px 4px;
                font-size: 8px;
              }
              .balance-sheet-print th {
                background-color: "primary";
                font-weight: bold;
                text-align: center;
              }
              .balance-sheet-print td {
                text-align: left;
              }
              .balance-sheet-print .number-cell {
                text-align: right;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const dialogStyles = {
    paper: {
      maxWidth: "90vw",
      maxHeight: "90vh",
      width: "1200px",
      height: "800px",
    },
    content: {
      padding: 0,
      overflow: "auto",
      height: "100%",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#888",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#555",
      },
    },
    title: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e0e0e0",
      padding: "16px 24px",
    },
    actions: {
      padding: "16px 24px",
      borderTop: "1px solid #e0e0e0",
      // gap: 2,
    },
    printPreview: {
      backgroundColor: "#f5f5f5",
      padding: "20px",
      minHeight: "100%",
      display: "flex",
      justifyContent: "center",
    },
    printContainer: {
      backgroundColor: "white",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      maxWidth: "210mm", // A4 width
      width: "100%",
      minHeight: "297mm", // A4 height
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: dialogStyles.paper,
      }}
    >
      <DialogTitle sx={dialogStyles.title}>
        <span>Balance Sheet Preview</span>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={dialogStyles.content}>
        <Box sx={dialogStyles.printPreview}>
          <Box sx={dialogStyles.printContainer}>
            <div ref={printRef}>
              <BalanceSheetPrint
                transformedData={transformedData}
                reportData={reportData}
              />
            </div>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={dialogStyles.actions}>
        <Button variant="text" color="error" onClick={onClose} >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          
          onClick={handlePrint || handlePrintFallback}
          
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BalanceSheetPrintDialog;
