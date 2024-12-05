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
import "../styles/TrialBalancePage.scss";
import { info } from "../schemas/info";
import {
  useExportGenerateTrialBalancePerMonthQuery,
  useGenerateTrialBalancePerMonthPaginationQuery,
} from "../features/api/boaApi";
import useDebounce from "../components/useDebounce";
import DateSearchCompoment from "../components/DateSearchCompoment";
import moment from "moment";
import { IosShareRounded } from "@mui/icons-material";
import { toast } from "sonner";
import { Workbook } from "exceljs";
import useExportData from "../components/hooks/useExportData";

const TrialBalancePage = () => {
  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search);
  const [reportData, setReportData] = useState({
    Month: moment().format("MMM"),
    Year: moment().format("YYYY"),
  });

  const { exportToExcel } = useExportData();

  const [params, setParams] = useState({
    Search: debounceValue,
    page: 0,
    PageSize: 25,
    PageNumber: 1,
    Month: reportData.Month,
    Year: reportData.Year,
  });
  const headerColumn = info.trial_balance;
  const { data: exportData, isLoading: isExportLoading } =
    useExportGenerateTrialBalancePerMonthQuery({
      Search: debounceValue,
      Month: reportData.Month,
      Year: reportData.Year,
    });

  const {
    data: trialData,
    isLoading: isTrialLoading,
    isFetching: isTrialFetching,
  } = useGenerateTrialBalancePerMonthPaginationQuery({
    Search: debounceValue,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    Month: reportData.Month,
    Year: reportData.Year,
  });
  console.log("balance: ", exportData);

  const hasData = exportData?.value && exportData.value.length > 0;

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
  const trailBalanceTotalData = exportData?.value || [];

  const grandTotal = {
    debit: trailBalanceTotalData
      .reduce((sum, row) => sum + parseFloat(row.debit || 0), 0)
      .toFixed(2),
    credit: trailBalanceTotalData
      .reduce((sum, row) => sum + parseFloat(row.credit || 0), 0)
      .toFixed(2),
  };

  const headers = info.journal_book_export;

  const onExport = async () => {
    try {
      await exportToExcel(headers, exportData, reportData);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  console.log("info: ", info);
  console.log("exportData: ", exportData);
  console.log("reportData: ", reportData);

  // for comma
  const formatNumber = (number) => {
    const isNegative = number < 0;
    const formattedNumber = Math.abs(number)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return {
      formattedNumber,
      color: isNegative ? "red" : "inherit", // Use "red" for negative numbers
    };
  };

  return (
    <Box className="trial">
      <Box className="trial__header">
        <Typography variant="h5" className="setup__header__con1--title">
          {info.trialbalance_title}
        </Typography>
        <DateSearchCompoment setReportData={setReportData} />
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
                  {headerColumn.map((column) => (
                    <TableCell key={column.id}>{column.name}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isTrialFetching || isTrialLoading ? (
                  Array.from({ length: params.PageSize }).map((_, index) => (
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
                                ? formatNumber(grandTotal.debit).color
                                : col.id === "credit"
                                ? formatNumber(grandTotal.credit).color
                                : "inherit",
                            fontWeight:
                              col.id === "debit" ||
                              col.id === "credit" ||
                              col.id === "chartOfAccount"
                                ? 600
                                : "inherit",
                          }}
                        >
                          {col.id === "debit"
                            ? formatNumber(grandTotal.debit).formattedNumber
                            : col.id === "credit"
                            ? formatNumber(grandTotal.credit).formattedNumber
                            : col.id === "chartOfAccount"
                            ? "Grand Total"
                            : ""}
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onExport();
            }}
            disabled={!hasData || isExportLoading}
            startIcon={
              isTrialLoading ? (
                <CircularProgress size={20} />
              ) : (
                <IosShareRounded />
              )
            }
          >
            {isTrialLoading ? "Exporting..." : "Export"}
          </Button>
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
            { label: "All", value: trialData?.totalCount || 0 },
          ]}
        />
      </Box>
    </Box>
  );
};

export default TrialBalancePage;
