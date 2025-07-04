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
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import useExportData from "../../components/hooks/useExportData";
import OnExportButton from "../../components/OnExportButton";
import useDebounce from "../../components/useDebounce";
import { useGenerateTrialBalancePerMonthPaginationQuery } from "../../features/api/boaApi";
import { info } from "../../schemas/info";
import "../../styles/TrialBalancePage.scss";

const TrialBalancePage = () => {
  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search);
  const [reportData, setReportData] = useState({
    FromMonth: moment().startOf("month").format("MM-DD-YYYY").toString(),

    ToMonth: moment().endOf("month").format("MM-DD-YYYY").toString(),
  });

  const { exportToExcel } = useExportData();
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
  };

  const [params, setParams] = useState({
    ...fillParams,
    Search: debounceValue,
    page: 0,
    PageSize: 25,
    PageNumber: 1,
  });
  const headerColumn = info.trial_balance;

  //viewing
  const {
    data: trialData,
    isLoading: isTrialLoading,
    isFetching: isTrialFetching,
  } = useGenerateTrialBalancePerMonthPaginationQuery({
    ...fillParams,
    Search: debounceValue,
    PageNumber: params.page + 1,
    UsePagination: true,
    PageSize: params.PageSize,
  });

  //export
  const {
    data: exportData,
    isLoading: isExportLoading,
    isFetching: isExportFetching,
  } = useGenerateTrialBalancePerMonthPaginationQuery({
    ...fillParams,
    UsePagination: false,
  });

  const hasData =
    exportData?.value.trialBalance && exportData.value.trialBalance.length > 0;

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setParams((currentValue) => ({
      ...currentValue,
      page: newPage, // Update the page index
      PageNumber: newPage + 1, // Update the page number (1-based)
    }));
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newPageSize = parseInt(event.target.value, 10); // Get the new page size
    setParams((currentValue) => ({
      ...currentValue,
      PageSize: newPageSize, // Update the page size
      page: 0, // Reset to the first page
      PageNumber: 1, // Reset to page number 1
    }));
  };
  const trailBalanceData = trialData?.value?.trialBalance || [];

  const debitTotal = trialData?.value?.lineAmount?.lineAmountDebit || 0;
  const creditTotal = trialData?.value?.lineAmount?.lineAmountCredit || 0;

  const debitBalanceTotal = trialData?.value?.lineAmount?.debitBalance || 0;
  const creditBalanceTotal = trialData?.value?.lineAmount?.creditBalance || 0;

  const headers = info.trial_balance_export;

  const onExport = async () => {
    if (isExportLoading || isExportFetching) {
      return; // Prevent multiple export attempts while one is in progress
    }

    toast.info("Export started");
    try {
      exportToExcel(headers, exportData.value.trialBalance, reportData);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  // for comma
  // Updated formatNumber function with 2 decimal places
  const formatNumber = (number) => {
    const isNegative = number < 0;
    // Round to 2 decimal places and format with commas
    const roundedNumber = parseFloat(Math.abs(number).toFixed(2));
    const formattedNumber = roundedNumber
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return {
      formattedNumber,
      color: isNegative ? "red" : "inherit", // Use "red" for negative numbers
    };
  };

  // Custom styles for sticky headers
  const stickyHeaderStyle = {
    position: "sticky",
    top: 0,
    // backgroundColor: "#fff",
    zIndex: 1,
  };

  const stickySubHeaderStyle = {
    position: "sticky",
    top: "57px", // Adjust this value based on the height of your first header row
    //backgroundColor: "#fff",
    zIndex: 1,
  };

  return (
    <Box className="trial">
      <Box className="trial__header">
        {/* <Typography variant="h5" className="trial__header--title">
          {info.trialbalance_title}
        </Typography> */}
        <DateSearchCompoment
          setReportData={setReportData}
          isTrailBalance={true}
        />
      </Box>
      <Box className="trial__content">
        <Box className="trial__content__table">
          <TableContainer
            component={Paper}
            sx={{ overflow: "auto", height: "100%" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} style={stickyHeaderStyle}>
                    ACCOUNT NAME
                  </TableCell>
                  <TableCell style={stickyHeaderStyle}></TableCell>
                  <TableCell style={stickyHeaderStyle}></TableCell>

                  {/* Opening Balance Column Group */}
                  <TableCell
                    colSpan={8}
                    align="center"
                    style={stickyHeaderStyle}
                  >
                    BALANCES
                  </TableCell>
                </TableRow>

                <TableRow>
                  {/* Opening Balance subheaders */}
                  <TableCell align="center" style={stickySubHeaderStyle}>
                    DEBIT{" "}
                  </TableCell>
                  <TableCell align="center" style={stickySubHeaderStyle}>
                    CREDIT
                  </TableCell>

                  {/* Transaction subheaders */}
                  <TableCell align="center" style={stickySubHeaderStyle}>
                    DEBIT{" "}
                  </TableCell>
                  <TableCell align="center" style={stickySubHeaderStyle}>
                    CREDIT
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isTrialFetching || isTrialLoading ? (
                  Array.from({ length: 12 }).map((_, index) => (
                    <TableRow key={index}>
                      {headerColumn.map((col) => (
                        <TableCell key={col.id}>
                          <Skeleton variant="text" animation="wave" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : trailBalanceData.length > 0 ? (
                  <>
                    {/* Render Data Rows */}
                    {trailBalanceData.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => {
                          const cellValue = row[col.id];
                          const isNumber = typeof cellValue === "number";

                          return (
                            <TableCell
                              key={col.id}
                              style={{
                                color: formatNumber(row[col.id]).color, // Apply color conditionally
                              }}
                            >
                              {isNumber
                                ? formatNumber(cellValue).formattedNumber // Format numbers
                                : cellValue || "—"}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}

                    {/* Render Grand Total Row */}
                    <TableRow className="trial__content__table--grandtotal">
                      {headerColumn.map((col) => (
                        <TableCell
                          key={col.id}
                          style={{
                            color:
                              col.id === "debit"
                                ? formatNumber(debitTotal).color
                                : col.id === "credit"
                                ? formatNumber(creditTotal).color
                                : col.id === "debitVariance"
                                ? formatNumber(debitBalanceTotal).color
                                : col.id === "creditVariance"
                                ? formatNumber(creditBalanceTotal).color
                                : "inherit",
                            fontWeight:
                              col.id === "debit" ||
                              col.id === "credit" ||
                              col.id === "debitVariance" ||
                              col.id === "creditVariance" ||
                              col.id === "chartOfAccount"
                                ? 600
                                : "inherit",
                          }}
                        >
                          {col.id === "debit"
                            ? formatNumber(debitTotal).formattedNumber
                            : col.id === "credit"
                            ? formatNumber(creditTotal).formattedNumber
                            : col.id === "debitVariance"
                            ? formatNumber(debitBalanceTotal).formattedNumber
                            : col.id === "creditVariance"
                            ? formatNumber(creditBalanceTotal).formattedNumber
                            : col.id === "chartOfAccount"
                            ? "Grand Total"
                            : "0.00"}
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
      <Box className="trial__footer">
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
          count={trialData?.value?.totalCount || 0}
          page={params.page}
          rowsPerPage={params.PageSize}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[
            25,
            50,
            100,
            { label: "All", value: trialData?.value?.totalCount || 0 },
          ]}
        />
      </Box>
    </Box>
  );
};

export default TrialBalancePage;
