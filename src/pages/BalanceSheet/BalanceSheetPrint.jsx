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

const BalanceSheetPrint = ({
  transformedData = {},
  reportData,
}) => {
  // Format number function for print
  const formatNumber = (number, accountSubGroup = "") => {
    const isNegative = number < 0;
    const isAccumDepr = accountSubGroup === "Accum Depr - Property, Plant & Equipment";
    
    // For Accum Depr, show as negative with parentheses
    const shouldBeRed = isAccumDepr;
    
    const roundedNumber = parseFloat(number.toFixed(2));
    let absoluteValue;
    let displayValue;

    if (isAccumDepr) {
      absoluteValue = Math.abs(roundedNumber);
      displayValue = -absoluteValue;
    } else {
      absoluteValue = isNegative ? parseFloat(roundedNumber.toString().slice(1)) : roundedNumber;
      displayValue = roundedNumber;
    }

    const formattedNumber = absoluteValue
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let finalFormattedNumber;
    if (isAccumDepr) {
      finalFormattedNumber = `(${formattedNumber})`;
    } else if (shouldBeRed && isNegative) {
      finalFormattedNumber = `(${formattedNumber})`;
    } else if (isNegative) {
      finalFormattedNumber = `${formattedNumber}`;
    } else {
      finalFormattedNumber = formattedNumber;
    }

    return {
      formattedNumber: finalFormattedNumber,
      color: shouldBeRed ? "red" : "inherit",
      isNegative: displayValue < 0,
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
    sectionContainer: {
      marginBottom: "20px",
      "@media print": {
        marginBottom: "10px",
        pageBreakInside: "avoid",
      },
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: "bold",
      marginBottom: "8px",
      "@media print": {
        fontSize: "12px",
        marginBottom: "4px",
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
      marginBottom: "10px",
      "@media print": {
        fontSize: "9px",
        width: "100%",
        pageBreakInside: "auto",
        borderCollapse: "collapse",
        marginBottom: "5px",
      },
    },
    headerCell: {
      border: "1px solid #000",
      padding: "6px 4px",
      backgroundColor: "primary",
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "10px",
      "@media print": {
        fontSize: "8px",
        padding: "3px 2px",
        backgroundColor: "primary!important",
      },
    },
    cell: {
      border: "1px solid #000",
      padding: "4px 3px",
      textAlign: "left",
      fontSize: "10px",
      "@media print": {
        fontSize: "8px",
        padding: "2px 1px",
      },
    },
    numberCell: {
      border: "1px solid #000",
      padding: "4px 3px",
      textAlign: "right",
      fontSize: "10px",
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
    subtotalRow: {
      backgroundColor: "#f8f8f8",
      fontWeight: "600",
      "@media print": {
        backgroundColor: "#f8f8f8 !important",
      },
    },
    summarySection: {
      marginTop: "20px",
      border: "1px solid #000",
      padding: "10px",
      "@media print": {
        marginTop: "10px",
        padding: "5px",
      },
    },
    summaryRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      borderBottom: "1px solid #ddd",
      "&:last-child": {
        borderBottom: "none",
      },
      "@media print": {
        padding: "2px 0",
      },
    },
    varianceRow: {
      fontWeight: "bold",
      fontSize: "12px",
      "@media print": {
        fontSize: "10px",
      },
    },
  };

  const globalPrintStyles = `
    @media print {
      @page {
        size: A4;
        margin: 2mm 10mm;
      }
      
      .balance-sheet-print {
        width: 100% !important;
        max-width: none !important;
        overflow: visible !important;
      }
      
      .balance-sheet-print table {
        width: 100% !important;
        font-size: 8px !important;
      }
      
      .balance-sheet-print th,
      .balance-sheet-print td {
        font-size: 8px !important;
        padding: 2px 1px !important;
      }
      
      .balance-sheet-print table,
      .balance-sheet-print th,
      .balance-sheet-print td {
        border: 1px solid #000 !important;
      }
    }
  `;

  const renderTable = (title, rows, grandTotal, columns) => (
    <Box sx={printStyles.sectionContainer}>
      <Typography sx={printStyles.sectionTitle}>{title}</Typography>
      <TableContainer sx={printStyles.tableContainer}>
        <Table sx={printStyles.table}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} sx={printStyles.headerCell}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow 
                key={row.id || index}
                sx={row.isSubtotal ? printStyles.subtotalRow : {}}
              >
                {columns.map((col) => {
                  const cellValue = row[col.id];
                  const isAmount = col.id.includes('Amount');
                  const color = row[col.id + 'Color'] || 'inherit';
                  
                  return (
                    <TableCell
                      key={col.id}
                      sx={{
                        ...(isAmount ? printStyles.numberCell : printStyles.cell),
                        color: color,
                        fontWeight: row.isSubtotal ? 'bold' : 'normal',
                      }}
                    >
                      {cellValue || (isAmount ? "—" : "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            
            {/* Grand Total Row */}
            {grandTotal && (
              <TableRow sx={printStyles.totalRow}>
                {columns.map((col) => {
                  const cellValue = grandTotal[col.id];
                  const isAmount = col.id.includes('Amount');
                  const color = grandTotal[col.id + 'Color'] || 'inherit';
                  
                  return (
                    <TableCell
                      key={col.id}
                      sx={{
                        ...(isAmount ? printStyles.numberCell : printStyles.cell),
                        ...printStyles.totalRow,
                        color: color,
                      }}
                    >
                      {cellValue || (isAmount ? "—" : "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Define columns for each section
  const assetColumns = [
    { id: 'asset', label: 'ASSETS' },
    { id: 'assetData', label: 'ACCOUNT DETAILS' },
    { id: 'assetAmount', label: 'AMOUNT' },
  ];

  const liabilitiesColumns = [
    { id: 'liabilities', label: 'LIABILITIES' },
    { id: 'liabilitiesData', label: 'ACCOUNT DETAILS' },
    { id: 'liabilitiesAmount', label: 'AMOUNT' },
  ];

  const capitalColumns = [
    { id: 'capital', label: 'CAPITAL/EQUITY' },
    { id: 'capitalData', label: 'ACCOUNT DETAILS' },
    { id: 'capitalAmount', label: 'AMOUNT' },
  ];

  return (
    <>
      <style>{globalPrintStyles}</style>
      <Box sx={printStyles.container} className="balance-sheet-print">
        {/* Header */}
        <Box sx={printStyles.header}>
          <Typography sx={printStyles.title}>Balance Sheet</Typography>
          <Typography sx={printStyles.company}>
            RDF, Feed, Livestock and Foods Inc.
          </Typography>
          <Typography sx={printStyles.date}>
            as of {moment(reportData?.toMonth).format("MMMM DD, YYYY")}
          </Typography>
        </Box>

        {/* Assets Section */}
        {renderTable(
          "ASSETS",
          transformedData.assetRows || [],
          transformedData.assetTotal,
          assetColumns
        )}

        {/* Liabilities Section */}
        {renderTable(
          "LIABILITIES",
          transformedData.liabilitiesRows || [],
          transformedData.liabilitiesTotal,
          liabilitiesColumns
        )}

        {/* Capital Section */}
        {renderTable(
          "CAPITAL/EQUITY",
          transformedData.capitalRows || [],
          transformedData.capitalTotal,
          capitalColumns
        )}

        {/* Summary Section */}
        <Box sx={printStyles.summarySection}>
          <Typography sx={printStyles.sectionTitle}>SUMMARY</Typography>
          
          {transformedData.balanceSheetTotal && (
            <Box sx={printStyles.summaryRow}>
              <span>TOTAL LIABILITIES AND EQUITY:</span>
              <span style={{ 
                color: transformedData.balanceSheetTotal.totalAmountColor || 'inherit' 
              }}>
                {transformedData.balanceSheetTotal.totalAmount || "—"}
              </span>
            </Box>
          )}
          
          {transformedData.varianceTotal && (
            <Box sx={{
              ...printStyles.summaryRow,
              ...printStyles.varianceRow,
            }}>
              <span>VARIANCE:</span>
              <span style={{ 
                color: transformedData.varianceTotal.varianceAmountColor || 'inherit' 
              }}>
                {transformedData.varianceTotal.varianceAmount || "—"}
              </span>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default BalanceSheetPrint;