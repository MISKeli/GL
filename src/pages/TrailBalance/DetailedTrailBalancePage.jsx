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
import React, { useState, useEffect } from "react";
import { info } from "../../schemas/info";
import "../../styles/TrialBalancePage.scss";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import moment from "moment";
import useExportData from "../../components/hooks/useExportData";
import { toast } from "sonner";
import useDebounce from "../../components/useDebounce";
import {
  useGenerateDetailedTrialBalanceQuery,
  useLazyGenerateDetailedTrialBalanceQuery,
} from "../../features/api/boaApi";
import { IosShareRounded } from "@mui/icons-material";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";

const DetailedTrailBalancePage = () => {
  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();

  // Get search from URL params
  const searchFromParams = currentParams.search || "";
  const [search, setSearch] = useState(searchFromParams);
  const debounceValue = useDebounce(search);

  // Get date from URL params or use default
  const getDateFromParams = () => {
    if (currentParams.date) {
      const parsed = moment(currentParams.date, "MM-DD-YYYY");
      if (parsed.isValid()) return parsed.format("MM-DD-YYYY");
    }
    if (currentParams.fromDate) {
      const parsed = moment(currentParams.fromDate, "MM-DD-YYYY");
      if (parsed.isValid()) return parsed.format("MM-DD-YYYY");
    }
    return moment().startOf("month").format("MM-DD-YYYY");
  };

  const [reportData, setReportData] = useState({
    fromMonth: getDateFromParams(),
    toMonth: getDateFromParams(),
  });

  // Get page and pageSize from URL params
  const pageFromParams = parseInt(currentParams.page || "0", 10);
  const pageSizeFromParams = parseInt(currentParams.pageSize || "25", 10);

  const [params, setParams] = useState({
    fromMonth: reportData.fromMonth,
    toMonth: reportData.toMonth,
    Search: debounceValue,
    page: pageFromParams,
    PageSize: pageSizeFromParams,
    PageNumber: pageFromParams + 1,
  });

  // Update search when debounced value changes
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      Search: debounceValue,
    }));

    // Update URL params for search
    if (debounceValue === "") {
      const newParams = { ...currentParams };
      delete newParams.search;
      setQueryParams(newParams);
    } else {
      setQueryParams(
        {
          search: debounceValue,
          page: "0", // Reset to first page when searching
        },
        { retain: true }
      );
    }
  }, [debounceValue]);

  // Update params when reportData changes
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      fromMonth: reportData.fromMonth,
      toMonth: reportData.toMonth,
    }));
  }, [reportData]);

  // NEW: Watch for URL param changes and update reportData automatically
  useEffect(() => {
    const dateFromUrl = currentParams.date || currentParams.fromDate;
    if (dateFromUrl) {
      const parsed = moment(dateFromUrl, "MM-DD-YYYY");
      if (parsed.isValid()) {
        const newDate = parsed.format("MM-DD-YYYY");

        // Only update if the date actually changed to avoid infinite loops
        if (newDate !== reportData.fromMonth) {
          setReportData({
            fromMonth: newDate,
            toMonth: newDate,
          });
        }
      }
    }
  }, [currentParams.date, currentParams.fromDate, reportData.fromMonth]);

  // Sync search state with URL params on mount
  useEffect(() => {
    const searchFromUrl = currentParams.search || "";
    if (search !== searchFromUrl) {
      setSearch(searchFromUrl);
    }
  }, [currentParams.search]);

  const fillParams = {
    FromMonth: reportData.fromMonth,
    ToMonth: reportData.toMonth,
  };

  //viewing
  const {
    data: detailedData,
    isLoading: isTrialLoading,
    isFetching: isTrialFetching,
  } = useGenerateDetailedTrialBalanceQuery({
    ...fillParams,
    Search: debounceValue,
    PageNumber: params.page + 1,
    UsePagination: true,
    PageSize: params.PageSize,
  });

  //export data
  const { data: exportData } = useGenerateDetailedTrialBalanceQuery({
    ...fillParams,
    UsePagination: false,
  });

  const hasData =
    exportData?.value.trialBalance && exportData.value.trialBalance.length > 0;

  const [
    fetchExportData,
    { isLoading: isExportLoading, isFetching: isExportFetching },
  ] = useLazyGenerateDetailedTrialBalanceQuery();

  // Get totals from lineAmount instead of calculating manually
  const totals = detailedData?.value?.lineAmount
    ? {
        openDebit: detailedData.value.lineAmount.lineAmountOpenDebit || 0,
        openCredit: detailedData.value.lineAmount.lineAmountOpenCredit || 0,
        transactionDebit:
          detailedData.value.lineAmount.lineAmountTransactDebit || 0,
        transactionCredit:
          detailedData.value.lineAmount.lineAmountTransactCredit || 0,
        closeDebit: detailedData.value.lineAmount.lineAmounCloseDebit || 0,
        closeCredit: detailedData.value.lineAmount.lineAmountCloseCredit || 0,
      }
    : null;

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setParams((currentValue) => ({
      ...currentValue,
      page: newPage,
      PageNumber: newPage + 1,
    }));

    // Update URL params
    setQueryParams(
      {
        page: newPage.toString(),
      },
      { retain: true }
    );
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setParams((currentValue) => ({
      ...currentValue,
      PageSize: newPageSize,
      page: 0,
      PageNumber: 1,
    }));

    // Update URL params
    setQueryParams(
      {
        pageSize: newPageSize.toString(),
        page: "0",
      },
      { retain: true }
    );
  };

  // Handle search change from DateSearchCompoment
  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
  };

  const { detailedTrailBalanceExport } = useExportData();

  // Format number as currency with negative values in red
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0";

    const absoluteValue = Math.abs(value);

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absoluteValue);
  };

  const headers = info.detailedTrailBalance.export;

  const onExport = async () => {
    if (isExportLoading || isExportFetching) {
      return;
    }
    toast.info("Export started");
    try {
      const exportData = await fetchExportData({
        ...fillParams,
        UsePagination: false,
      }).unwrap();

      await detailedTrailBalanceExport(
        headers,
        exportData?.value?.trialBalance,
        reportData
      );
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Custom styles for sticky headers
  const stickyHeaderStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1,
  };

  const stickySubHeaderStyle = {
    position: "sticky",
    top: "57px",
    zIndex: 1,
  };

  return (
    <>
      <Box className="trial">
        <Box className="trial__header">
          <DateSearchCompoment
            setReportData={setReportData}
            hasDetailed={true}
            hasDate={false}
            updateQueryParams={true}
            onSearchChange={handleSearchChange}
            searchValue={search}
            // NEW: Pass current date to sync with the component
            initialDate={moment(reportData.fromMonth, "MM-DD-YYYY")}
          />
        </Box>

        <Box className="trial__content">
          <Box className="trial__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2} style={stickyHeaderStyle}>
                      ACCOUNT NAME
                    </TableCell>

                    {/* Opening Balance Column Group */}
                    <TableCell
                      colSpan={2}
                      align="center"
                      style={stickyHeaderStyle}
                    >
                      OPENING BALANCE
                    </TableCell>

                    {/* Transaction Column Group */}
                    <TableCell
                      colSpan={2}
                      align="center"
                      style={stickyHeaderStyle}
                    >
                      TRANSACTION DURING PERIOD
                    </TableCell>

                    {/* Closing Balance Column Group */}
                    <TableCell
                      colSpan={2}
                      align="center"
                      style={stickyHeaderStyle}
                    >
                      CLOSING BALANCE
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

                    {/* Closing Balance subheaders */}
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
                        {Array.from({ length: 7 }).map((_, colIndex) => (
                          <TableCell key={colIndex}>
                            <Skeleton variant="text" animation="wave" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : detailedData?.value?.trialBalance?.length > 0 ? (
                    <>
                      {detailedData?.value?.trialBalance?.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.chartOfAccount}</TableCell>

                          {/* Opening Balance values */}
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                (row.openDebit || 0) < 0 ? "red" : "inherit",
                            }}
                          >
                            {formatCurrency(row.openDebit || 0)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                (row.openCredit || 0) < 0 ? "red" : "inherit",
                            }}
                          >
                            {formatCurrency(row.openCredit || 0)}
                          </TableCell>

                          {/* Transaction values */}
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                (row.transactionDebit || 0) < 0
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            {formatCurrency(row.transactionDebit || 0)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
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
                            align="right"
                            sx={{
                              color:
                                (row.closeDebit || 0) < 0 ? "red" : "inherit",
                            }}
                          >
                            {formatCurrency(row.closeDebit || 0)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                (row.closeCredit || 0) < 0 ? "red" : "inherit",
                            }}
                          >
                            {formatCurrency(row.closeCredit || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="h6">
                          {info.system_no_data}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {totals && (
                    <TableRow className="trial__content__table--grandtotal">
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Total unadjusted trial Balance
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            (totals?.openDebit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(totals?.openDebit || 0)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            (totals?.openCredit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(totals?.openCredit || 0)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            (totals?.transactionDebit || 0) < 0
                              ? "red"
                              : "inherit",
                        }}
                      >
                        {formatCurrency(totals?.transactionDebit || 0)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            (totals?.transactionCredit || 0) < 0
                              ? "red"
                              : "inherit",
                        }}
                      >
                        {formatCurrency(totals?.transactionCredit || 0)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            (totals?.closeDebit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(totals?.closeDebit || 0)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            (totals?.closeCredit || 0) < 0 ? "red" : "inherit",
                        }}
                      >
                        {formatCurrency(totals?.closeCredit || 0)}
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
              onClick={onExport}
              disabled={!hasData || isExportLoading || isExportFetching}
              startIcon={
                isExportFetching || isExportLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isExportLoading
                ? "Loading..."
                : isExportFetching
                ? "Exporting..."
                : "Export"}
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={detailedData?.value?.totalCount || 0}
            page={params.page}
            rowsPerPage={params.PageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </Box>
      </Box>
    </>
  );
};

export default DetailedTrailBalancePage;
