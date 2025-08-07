import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import moment from "moment";

const DetailedTrialBalancePrint = ({
  trialBalanceData,
  reportData,
  totals,
  scale = "medium",
}) => {
  // Scale configurations
  const scaleConfigs = {
    small: {
      pageMargin: "1mm 3mm",
      containerPadding: "8px",
      headerFontSize: "14px",
      subHeaderFontSize: "10px",
      bodyFontSize: "8px",
      tableFontSize: "7px",
      cellPadding: "1px 2px",
      printHeaderFontSize: "12px",
      printSubHeaderFontSize: "8px",
      printBodyFontSize: "6px",
      printTableFontSize: "5px",
      printCellPadding: "1px",
    },
    medium: {
      pageMargin: "2mm 5mm",
      containerPadding: "15px",
      headerFontSize: "20px",
      subHeaderFontSize: "14px",
      bodyFontSize: "11px",
      tableFontSize: "10px",
      cellPadding: "3px 6px",
      printHeaderFontSize: "16px",
      printSubHeaderFontSize: "10px",
      printBodyFontSize: "8px",
      printTableFontSize: "7px",
      printCellPadding: "2px 3px",
    },
    large: {
      pageMargin: "5mm 8mm",
      containerPadding: "25px",
      headerFontSize: "28px",
      subHeaderFontSize: "18px",
      bodyFontSize: "14px",
      tableFontSize: "12px",
      cellPadding: "6px 10px",
      printHeaderFontSize: "20px",
      printSubHeaderFontSize: "14px",
      printBodyFontSize: "11px",
      printTableFontSize: "9px",
      printCellPadding: "3px 5px",
    },
  };

  const currentScale = scaleConfigs[scale] || scaleConfigs.medium;

  // Format number as currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0.00";
    const absoluteValue = Math.abs(value);
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absoluteValue);
  };

  const formatDate = (date) => {
    return moment(date, "MM-DD-YYYY").format("MMMM DD, YYYY");
  };

  // Dynamic print styles based on scale
  const globalPrintStyles = `
    @media print {
      @page {
        size: A4;
        margin: ${currentScale.pageMargin};
      }
      
      .trial-balance-print {
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
      }
      
      .trial-balance-print table {
        width: 100% !important;
        font-size: ${currentScale.printTableFontSize} !important;
      }
      
      .trial-balance-print th,
      .trial-balance-print td {
        font-size: ${currentScale.printTableFontSize} !important;
        padding: ${currentScale.printCellPadding} !important;
        word-wrap: break-word !important;
      }
      
      .trial-balance-print .header-title {
        font-size: ${currentScale.printHeaderFontSize} !important;
      }
      
      .trial-balance-print .header-subtitle {
        font-size: ${currentScale.printSubHeaderFontSize} !important;
      }
      
      .trial-balance-print .header-period {
        font-size: ${currentScale.printBodyFontSize} !important;
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
      <Box
        className="trial-balance-print"
        sx={{
          width: "100%",
          padding: currentScale.containerPadding,
          fontFamily: "Arial, sans-serif",
          backgroundColor: "white",
          color: "black",
          fontSize: currentScale.bodyFontSize,
          "@media print": {
            padding: "8px",
            fontSize: currentScale.printBodyFontSize,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography
            className="header-title"
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontSize: currentScale.headerFontSize,
              "@media print": {
                fontSize: currentScale.printHeaderFontSize,
              },
            }}
          >
            DETAILED TRIAL BALANCE
          </Typography>
          <Typography
            className="header-subtitle"
            variant="h6"
            sx={{
              fontSize: currentScale.subHeaderFontSize,
              "@media print": {
                fontSize: currentScale.printSubHeaderFontSize,
              },
            }}
          >
            RDF, Feed, Livestock and Foods Inc.
          </Typography>
          <Typography
            className="header-period"
            variant="body2"
            sx={{
              fontSize: currentScale.bodyFontSize,
              marginTop: "5px",
              "@media print": {
                fontSize: currentScale.printBodyFontSize,
              },
            }}
          >
            For the period: {formatDate(reportData.fromMonth)} to{" "}
            {formatDate(reportData.toMonth)}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            border: "1px solid #ccc",
            "@media print": {
              border: "1px solid #000",
            },
          }}
        >
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                border: "1px solid #ccc",
                padding: currentScale.cellPadding,
                fontSize: currentScale.tableFontSize,
                "@media print": {
                  border: "1px solid #000",
                  fontSize: currentScale.printTableFontSize,
                  padding: currentScale.printCellPadding,
                },
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    verticalAlign: "middle",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  ACCOUNT NAME
                </TableCell>

                {/* Opening Balance Column Group */}
                <TableCell
                  colSpan={2}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  OPENING BALANCE
                </TableCell>

                {/* Transaction Column Group */}
                <TableCell
                  colSpan={2}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  TRANSACTION DURING PERIOD
                </TableCell>

                {/* Closing Balance Column Group */}
                <TableCell
                  colSpan={2}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  CLOSING BALANCE
                </TableCell>
              </TableRow>

              <TableRow>
                {/* Opening Balance subheaders */}
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  DEBIT
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  CREDIT
                </TableCell>

                {/* Transaction subheaders */}
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  DEBIT
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  CREDIT
                </TableCell>

                {/* Closing Balance subheaders */}
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  DEBIT
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    "@media print": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  CREDIT
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {trialBalanceData && trialBalanceData.length > 0 ? (
                <>
                  {trialBalanceData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ textAlign: "left" }}>
                        {row.chartOfAccount || ""}
                      </TableCell>

                      {/* Opening Balance values */}
                      <TableCell
                        sx={{
                          textAlign: "right",
                          color: (row.openDebit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(row.openDebit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          color: (row.openCredit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(row.openCredit || 0)}
                      </TableCell>

                      {/* Transaction values */}
                      <TableCell
                        sx={{
                          textAlign: "right",
                          color:
                            (row.transactionDebit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(row.transactionDebit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          color:
                            (row.transactionCredit || 0) < 0
                              ? "red"
                              : "inherit",
                        }}
                      >
                        {formatCurrency(row.transactionCredit || 0)}
                      </TableCell>

                      {/* Closing Balance values */}
                      <TableCell
                        sx={{
                          textAlign: "right",
                          color: (row.closeDebit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(row.closeDebit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          color: (row.closeCredit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(row.closeCredit || 0)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Totals row */}
                  {totals && (
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          textAlign: "left",
                          "@media print": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        Total unadjusted trial Balance
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          textAlign: "right",
                          color:
                            (totals?.openDebit || 0) < 0 ? "red" : "inherit",
                          "@media print": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        {formatCurrency(totals?.openDebit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          textAlign: "right",
                          color:
                            (totals?.openCredit || 0) < 0 ? "red" : "inherit",
                          "@media print": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        {formatCurrency(totals?.openCredit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          textAlign: "right",
                          color:
                            (totals?.transactionDebit || 0) < 0
                              ? "red"
                              : "inherit",
                          "@media print": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        {formatCurrency(totals?.transactionDebit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          textAlign: "right",
                          color:
                            (totals?.transactionCredit || 0) < 0
                              ? "red"
                              : "inherit",
                          "@media print": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        {formatCurrency(totals?.transactionCredit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          textAlign: "right",
                          color:
                            (totals?.closeDebit || 0) < 0 ? "red" : "inherit",
                          "@media print": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        {formatCurrency(totals?.closeDebit || 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          textAlign: "right",
                          color:
                            (totals?.closeCredit || 0) < 0 ? "red" : "inherit",
                          "@media print": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        {formatCurrency(totals?.closeCredit || 0)}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box sx={{ marginTop: "15px", textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: currentScale.bodyFontSize,
              color: "#666",
              "@media print": {
                fontSize: currentScale.printBodyFontSize,
              },
            }}
          >
            End of Report
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default DetailedTrialBalancePrint;
