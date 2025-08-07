/* eslint-disable react/prop-types */
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import moment from "moment";
import { info } from "../../schemas/info";

const TrialBalancePrint = ({
  trialBalanceData = [],
  reportData,
  debitTotal = 0,
  creditTotal = 0,
  debitBalanceTotal = 0,
  creditBalanceTotal = 0,
}) => {
  const headerColumn = info.trial_balance;

  // Format number function for print
  const formatNumber = (number) => {
    const isNegative = number < 0;
    const roundedNumber = parseFloat(Math.abs(number).toFixed(2));
    const formattedNumber = roundedNumber
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Add parentheses for negative numbers
    const displayNumber = isNegative ? `(${formattedNumber})` : formattedNumber;

    return {
      formattedNumber: displayNumber,
      isNegative,
    };
  };

  const printStyles = {
    container: {
      padding: "1rem",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "white",
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      // Print-specific styles
      "@media print": {
        padding: "5mm",
        margin: 0,
        width: "100%",
        minHeight: "auto",
        boxShadow: "none",
      },
    },
    header: {
      textAlign: "center",
      marginBottom: "20px",
      "@media print": {
        marginBottom: "5px",
      },
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "6px",
      textAlign: "center",
      "@media print": {
        fontSize: "16px",
        marginBottom: "4px",
      },
    },
    company: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "6px",
      textAlign: "center",
      "@media print": {
        fontSize: "14px",
        marginBottom: "4px",
      },
    },
    date: {
      fontSize: "14px",
      marginBottom: "20px",
      textAlign: "center",
      "@media print": {
        fontSize: "12px",
        marginBottom: "15px",
      },
    },
    tableContainer: {
      width: "100%",
      overflow: "hidden",
      "@media print": {
        overflow: "visible",
        width: "100%",
      },
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "11px",
      tableLayout: "fixed", // Fixed layout for better control
      "@media print": {
        fontSize: "9px",
        width: "100%",
        pageBreakInside: "auto",
        borderCollapse: "collapse",
      },
    },
    headerCell: {
      border: "1px solid #000",
      padding: "6px 4px",
      backgroundColor: "#f5f5f5",
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "10px",
      wordWrap: "break-word",
      "@media print": {
        fontSize: "8px",
        padding: "3px 2px",
        backgroundColor: "primary !important",
      },
    },
    cell: {
      border: "1px solid #000",
      padding: "4px 3px",
      textAlign: "left",
      fontSize: "10px",
      wordWrap: "break-word",
      overflow: "hidden",
      "@media print": {
        fontSize: "8px",
        padding: "2px 1px",
        wordWrap: "break-word",
        overflow: "visible",
      },
    },
    numberCell: {
      border: "1px solid #000",
      padding: "4px 3px",
      textAlign: "right",
      fontSize: "10px",
      wordWrap: "break-word",
      "@media print": {
        fontSize: "8px",
        padding: "2px 1px",
        textAlign: "right",
      },
    },
    totalRow: {
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
      "@media print": {
        backgroundColor: "#f0f0f0 !important",
      },
    },
    // Column width distribution
    accountNameCol: {
      width: "35%",
    },
    numberCol: {
      width: "16.25%",
    },
  };

  // Global print styles
  const globalPrintStyles = `
    @media print {
      @page {
        size: A4;
        margin: 2mm 10mm;
      }
      
      .trial-balance-print {
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
        
      }
      
      .trial-balance-print table {
        width: 100% !important;
        font-size: 8px !important;
      }
      
      .trial-balance-print th,
      .trial-balance-print td {
        font-size: 8px !important;
        padding: 2px 1px !important;
        word-wrap: break-word !important;
      }
      
      /* Clean borders for print */
      .trial-balance-print table,
      .trial-balance-print th,
      .trial-balance-print td {
        border: 1px solid #000 !important;
      }
    }
  `;

  return (
    <>
      <style>{globalPrintStyles}</style>
      <Box sx={printStyles.container} className="trial-balance-print">
        {/* Header */}
        <Box sx={printStyles.header}>
          <Typography sx={printStyles.title}>Trial Balance</Typography>
          <Typography sx={printStyles.company}>
            RDF, Feed, Livestock and Foods Inc.
          </Typography>
          <Typography sx={printStyles.date}>
            as of {moment(reportData?.toMonth).format("MMMM DD, YYYY")}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={printStyles.tableContainer}>
          <Table sx={printStyles.table}>
            <colgroup>
              <col style={printStyles.accountNameCol} />
              <col style={printStyles.numberCol} />
              <col style={printStyles.numberCol} />
              {/* <col style={printStyles.numberCol} />
              <col style={printStyles.numberCol} /> */}
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} sx={printStyles.headerCell}>
                  SUB GROUP
                </TableCell>
                <TableCell rowSpan={2} sx={printStyles.headerCell}>
                  ACCOUNT NAME
                </TableCell>
                <TableCell colSpan={2} sx={printStyles.headerCell}>
                  AMOUNT
                </TableCell>
                {/* <TableCell colSpan={2} sx={printStyles.headerCell}>
                  BALANCES
                </TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell sx={printStyles.headerCell}>DEBIT</TableCell>
                <TableCell sx={printStyles.headerCell}>CREDIT</TableCell>
                {/* <TableCell sx={printStyles.headerCell}>DEBIT</TableCell>
                <TableCell sx={printStyles.headerCell}>CREDIT</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {trialBalanceData.map((row, index) => (
                <TableRow key={index}>
                  {headerColumn.map((col, colIndex) => {
                    const cellValue = row[col.id];
                    const isNumber = typeof cellValue === "number";
                    const formatted = isNumber ? formatNumber(cellValue) : null;

                    return (
                      <TableCell
                        key={col.id}
                        sx={
                          isNumber
                            ? {
                                ...printStyles.numberCell,
                                color: formatted?.isNegative
                                  ? "red"
                                  : "inherit",
                              }
                            : colIndex === 0 // First column (account name)
                            ? {
                                ...printStyles.cell,
                                ...printStyles.accountNameCol,
                              }
                            : printStyles.cell
                        }
                      >
                        {isNumber
                          ? formatted?.formattedNumber
                          : cellValue || "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* Grand Total Row */}
              <TableRow sx={printStyles.totalRow}>
                {headerColumn.map((col, colIndex) => (
                  <TableCell
                    key={col.id}
                    sx={
                      col.id === "debit" || col.id === "credit"
                        ? // col.id === "debitVariance" ||
                          // col.id === "creditVariance"
                          {
                            ...printStyles.numberCell,
                            ...printStyles.totalRow,
                            color:
                              col.id === "debit"
                                ? formatNumber(debitTotal).isNegative
                                  ? "red"
                                  : "inherit"
                                : col.id === "credit"
                                ? formatNumber(creditTotal).isNegative
                                  ? "red"
                                  : "inherit"
                                : // : col.id === "debitVariance"
                                  // ? formatNumber(debitBalanceTotal).isNegative
                                  //   ? "red"
                                  //   : "inherit"
                                  // : col.id === "creditVariance"
                                  // ? formatNumber(creditBalanceTotal).isNegative
                                  //   ? "red"
                                  //   : "inherit"
                                  "inherit",
                          }
                        : colIndex === 0 // First column (account name)
                        ? {
                            ...printStyles.cell,
                            ...printStyles.totalRow,
                            ...printStyles.accountNameCol,
                          }
                        : {
                            ...printStyles.cell,
                            ...printStyles.totalRow,
                          }
                    }
                  >
                    {col.id === "debit"
                      ? formatNumber(debitTotal).formattedNumber
                      : col.id === "credit"
                      ? formatNumber(creditTotal).formattedNumber
                      : // : col.id === "debitVariance"
                      // ? formatNumber(debitBalanceTotal).formattedNumber
                      // : col.id === "creditVariance"
                      // ? formatNumber(creditBalanceTotal).formattedNumber
                      col.id === "subGroup"
                      ? "Grand Total"
                      : col.id === "chartOfAccount"
                      ? ""
                      : "0.00"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default TrialBalancePrint;
