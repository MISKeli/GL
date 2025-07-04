/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { IosShareRounded } from "@mui/icons-material";
import { useGenerateSaleJournalBookPerMonthPaginationQuery } from "../../features/api/boaApi";
import { info } from "../../schemas/info";
import "../../styles/BoaPage.scss";

import { toast } from "react-toastify";
import useExportData from "../../components/hooks/useExportData";
import OnExportButton from "../../components/OnExportButton";
const SalesJournalPage = ({ reportData }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const headerColumn = info.sales_journal_sumarry;
  const { salesJournalSummaryExport } = useExportData();
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
  };

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateSaleJournalBookPerMonthPaginationQuery({
    // System: reportData.System,
    ...fillParams,
    UsePagination: true,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  const {
    data: exportData,
    isLoading: isExportLoading,
    isFetching: isExportFetching,
  } = useGenerateSaleJournalBookPerMonthPaginationQuery({
    // System: reportData.System,
    ...fillParams,
    UsePagination: false,
  });

  const hasData =
    exportData?.value.salesJournalBook &&
    exportData.value.salesJournalBook.length > 0;

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  // for comma
  const formatNumber = (number) => {
    const isNegative = number < 0;
    const formattedNumber = Math.abs(number)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return {
      formattedNumber,
      color: isNegative ? "red" : "inherit", // Use "red" for negative numbers
    };
  };

  const trailBalanceDebitTotalData =
    boaData?.value?.lineAmount?.lineAmountDebit || 0;
  const trailBalanceCreditTotalData =
    boaData?.value?.lineAmount?.lineAmountCredit || 0;

  const headers = info.sale_book_Export_Summary;

  const onExport = async () => {
    try {
      salesJournalSummaryExport(
        headers,
        exportData.value.salesJournalBook,
        reportData
      );
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  return (
    <>
      <Box className="boa">
        <Box className="boa__content">
          <Box className="boa__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {headerColumn.map((columnTable) => (
                      <TableCell
                        key={columnTable.id}
                        sx={{
                          textAlign: columnTable.subItems ? "center" : "",
                        }}
                      >
                        {columnTable.name}
                        {columnTable.subItems && (
                          <TableRow
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {columnTable.subItems.map((subItems) => (
                              <TableCell
                                key={subItems.id}
                                sx={{
                                  border: "none",
                                }}
                              >
                                {subItems.name}
                              </TableCell>
                            ))}
                          </TableRow>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isboaFetching || isboaloading ? (
                    // Show skeleton loaders when fetching or loading
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <TableCell key={col.id}>
                            <Skeleton variant="text" animation="wave" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : boaData?.value?.salesJournalBook?.length > 0 ? (
                    <>
                      {boaData?.value?.salesJournalBook?.map((row, index) => (
                        <TableRow key={index}>
                          {headerColumn.map((col) => (
                            <React.Fragment key={col.id}>
                              {col.subItems ? (
                                <TableCell
                                  colSpan={col.subItems.length}
                                  align="center"
                                >
                                  <TableRow
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    {col.subItems.map((subItem) => {
                                      const amountValue =
                                        subItem.id === "debit" &&
                                        row.drCr === "Debit"
                                          ? row.amount
                                          : subItem.id === "credit" &&
                                            row.drCr === "Credit"
                                          ? row.amount
                                          : null;
                                      const { formattedNumber, color } =
                                        amountValue
                                          ? formatNumber(amountValue)
                                          : {
                                              formattedNumber: "0",
                                              color: "inherit",
                                            };

                                      return (
                                        <TableCell
                                          key={subItem.id}
                                          sx={{
                                            border: "none",
                                            color: color, // Apply the color
                                          }}
                                        >
                                          {formattedNumber}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                </TableCell>
                              ) : (
                                <TableCell
                                  sx={{
                                    color:
                                      col.id === "lineAmount" && row[col.id] < 0
                                        ? "red"
                                        : "inherit",
                                  }}
                                >
                                  {row[col.id]
                                    ? col.id === "lineAmount"
                                      ? formatNumber(row[col.id])
                                          .formattedNumber
                                      : row[col.id]
                                    : "—"}
                                </TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                      ))}

                      {/* Grand Total Row */}
                      <TableRow>
                        {headerColumn.map((col) => (
                          <TableCell
                            key={col.id}
                            className="boa__content__table--grandtotal"
                          >
                            {col.subItems ? (
                              <TableRow
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {col.subItems.map((subItem) => {
                                  let totalValue = 0;
                                  if (subItem.id === "debit") {
                                    totalValue = trailBalanceDebitTotalData;
                                  } else if (subItem.id === "credit") {
                                    totalValue = trailBalanceCreditTotalData;
                                  }

                                  const formatted = formatNumber(totalValue); // Format grand total values
                                  return (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        border: "none",
                                        fontWeight: "bold",
                                        color: formatted.color, // Apply color for grand total
                                      }}
                                    >
                                      {formatted.formattedNumber}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ) : (
                              ""
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headerColumn.length} align="center">
                        <Typography variant="h6">
                          {info.system_no_data}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Box className="boa__footer">
          <Box>
            <OnExportButton
              onExport={onExport}
              hasData={hasData}
              isLoading={isExportLoading}
              isFetching={isExportFetching}
            />
          </Box>
          <TablePagination
            component="div"
            count={boaData?.value?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              { label: "All", value: boaData?.value?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default SalesJournalPage;
