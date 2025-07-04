/* eslint-disable react/prop-types */
import {
  Box,
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
import { toast } from "sonner";
import useDebounce from "../../components/useDebounce";
import { useGenerateVerticalCashDisbursementBookPerMonthQuery } from "../../features/api/boaApi";
import { info } from "../../schemas/info";
import "../../styles/BoaPage.scss";

import useExportData from "../../components/hooks/useExportData";
import OnExportButton from "../../components/OnExportButton";
const CashDisbursementBookPage = ({ reportData }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const debounceValue = useDebounce(search);
  const { CashDisburstmentBookSummaryExport } = useExportData();
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
  };
  const headerColumn = info.cash_disbursement_book_sumarry;

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateVerticalCashDisbursementBookPerMonthQuery({
    ...fillParams,
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    UsePagination: true,
    System: "Fisto",
  });

  const {
    data: exportData,
    isLoading: isExportLoading,
    isFetching: isExportFetching,
  } = useGenerateVerticalCashDisbursementBookPerMonthQuery({
    ...fillParams,

    UsePagination: false,
  });

  const hasData =
    exportData?.value?.cashDisbursementBook &&
    exportData?.value?.cashDisbursementBook?.length > 0;

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  const cashDisburstmentDebitTotalData =
    boaData?.value?.lineAmount?.lineAmountDebit || 0;
  const cashDisburstmentCreditTotalData =
    boaData?.value?.lineAmount?.lineAmountCredit || 0;

  const header = info.cash_disbursement_Export_Summary;

  const onExport = async () => {
    if (isExportLoading || isExportFetching) {
      return; // Prevent multiple export attempts while one is in progress
    }
    toast.info("Export started");
    try {
      CashDisburstmentBookSummaryExport(
        header,
        exportData.value.cashDisbursementBook,
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
        <Box className="boa__header"></Box>
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
                                  //padding: "5px",
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
                    Array.from({ length: pageSize }).map((_, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <TableCell key={col.id}>
                            <Skeleton
                              variant="text"
                              animation="wave"
                              height={100}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : boaData?.value?.cashDisbursementBook?.length > 0 ? (
                    <>
                      {boaData?.value?.cashDisbursementBook.map(
                        (row, index) => (
                          <TableRow key={index}>
                            {headerColumn.map((col) => (
                              <React.Fragment key={col.id}>
                                {col.subItems ? (
                                  <TableCell align="center">
                                    <TableRow
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: 0, // Ensure no extra padding for nested rows
                                      }}
                                    >
                                      {col.subItems.map((subItem) => {
                                        const amountValue = row[subItem.id];
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
                                              color: color, // Apply color to the cell
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
                                        col.id === "amount" && row[col.id] < 0
                                          ? "red"
                                          : "inherit",
                                    }}
                                  >
                                    {row[col.id] ? row[col.id] : "—"}
                                  </TableCell>
                                )}
                              </React.Fragment>
                            ))}
                          </TableRow>
                        )
                      )}

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
                                  padding: 0, // Ensure no extra padding for nested rows
                                }}
                              >
                                {col.subItems.map((subItem) => {
                                  const value =
                                    subItem.id === "debitAmount"
                                      ? cashDisburstmentDebitTotalData
                                      : subItem.id === "creditAmount"
                                      ? cashDisburstmentCreditTotalData
                                      : 0;

                                  const { formattedNumber, color } =
                                    formatNumber(value);

                                  return (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        border: "none",
                                        fontWeight: "bold",
                                        color: color,
                                      }}
                                    >
                                      {subItem.id === "debitAmount"
                                        ? formattedNumber
                                        : subItem.id === "creditAmount"
                                        ? formattedNumber // Credit will appear in red
                                        : "0"}
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

export default CashDisbursementBookPage;
