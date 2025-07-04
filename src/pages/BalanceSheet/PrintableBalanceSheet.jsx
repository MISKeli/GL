/* eslint-disable react/prop-types */
import React from "react";
import moment from "moment";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import "../../styles/BalanceSheet/PrintableBalanceSheet.scss";

const PrintableBalanceSheet = ({
  transformedData,
  reportData,
  companyName,
}) => {
  const renderSection = (block, title, rows, totalRow, type) => (
    <Box className={`${block}__section`} mb={2}>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small" className={`${block}__table`}>
          <TableHead>
            <TableRow>
              <TableCell className={`${block}__th`} sx={{ width: "100%" }}>
                {title}
              </TableCell>
              <TableCell className={`${block}__th`} align="right">
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={`${block}__row ${
                  row.isSubtotal ? `${block}__row--subtotal` : ""
                }`}
              >
                <TableCell>
                  {row[type] && (
                    <Typography fontWeight="bold">{row[type]}</Typography>
                  )}
                  {row[`${type}Data`] && (
                    <Typography variant="body2" sx={{ ml: row[type] ? 2 : 0 }}>
                      {row[`${type}Data`]}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  align="right"
                  className={`${block}__amount ${
                    row[`${type}AmountColor`] === "red"
                      ? `${block}__amount--red`
                      : ""
                  }`}
                >
                  {row[`${type}Amount`]}
                </TableCell>
              </TableRow>
            ))}
            {totalRow && (
              <TableRow className={`${block}__row ${block}__row--total`}>
                <TableCell>
                  <Typography fontWeight="bold">
                    {totalRow[`${type}Data`]}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  className={`${block}__amount ${
                    totalRow[`${type}AmountColor`] === "red"
                      ? `${block}__amount--red`
                      : ""
                  }`}
                >
                  <Typography fontWeight="bold">
                    {totalRow[`${type}Amount`]}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box className="balance-sheet" p={1}>
      <Box className="balance-sheet__header">
        <Typography variant="h6" fontWeight="bold">
          {companyName}
        </Typography>
        <Typography variant="body2">Balance Sheet</Typography>
        <Typography variant="caption">
          As of {moment(reportData?.toMonth).format("MMMM DD, YYYY")}
        </Typography>
      </Box>

      <Box className="balance-sheet__sections" >
        <Box className="balance-sheet__column balance-sheet__column--assets">
          {renderSection(
            "balance-sheet",
            "ASSETS",
            transformedData.assetRows,
            transformedData.assetTotal,
            "asset"
          )}
        </Box>

        <Box className="balance-sheet__column balance-sheet__column--liabilities-equity">
          {renderSection(
            "balance-sheet",
            "LIABILITIES",
            transformedData.liabilitiesRows,
            transformedData.liabilitiesTotal,
            "liabilities"
          )}
          {renderSection(
            "balance-sheet",
            "SHAREHOLDERS' EQUITY",
            transformedData.capitalRows,
            transformedData.capitalTotal,
            "capital"
          )}
        </Box>
      </Box>

      {transformedData.balanceSheetTotal && (
        <Box className="balance-sheet__final-total" >
          <Typography>{transformedData.balanceSheetTotal.totalData}</Typography>
          <Typography
            className={
              transformedData.balanceSheetTotal.totalAmountColor === "red"
                ? "balance-sheet__amount--red"
                : ""
            }
          >
            {transformedData.balanceSheetTotal.totalAmount}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PrintableBalanceSheet;
