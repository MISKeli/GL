/* eslint-disable react/prop-types */
import { FileDownload, KeyboardArrowDown, Print } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useExportData from "../../components/hooks/useExportData";
import useSkipFetchingQuery from "../../components/hooks/useSkipFetchingQuery";
import { useGenerateTrialBalancePerMonthPaginationQuery } from "../../features/api/boaApi";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { info } from "../../schemas/info";
import "../../styles/TrialBalancePage.scss";
import PrintPreviewDialog from "./PrintPreviewDialog";

const TrialBalancePage = ({ reportData, onReportDataChange }) => {
  // Use reportData from props, fallback to default if not provided
  const currentReportData = React.useMemo(() => {
    if (reportData) {
      // Handle both camelCase and PascalCase formats
      return {
        fromMonth: reportData.fromMonth || reportData.FromMonth,
        toMonth: reportData.toMonth || reportData.ToMonth,
        // Legacy support
        FromMonth: reportData.fromMonth || reportData.FromMonth,
        ToMonth: reportData.toMonth || reportData.ToMonth,
      };
    }

    // Default fallback
    const defaultFromMonth = moment("12-01-2024", "MM-DD-YYYY").format(
      "MM-DD-YYYY"
    );
    const defaultToMonth = moment()
      .endOf("month")
      .format("MM-DD-YYYY")
      .toString();

    return {
      fromMonth: defaultFromMonth,
      toMonth: defaultToMonth,
      FromMonth: defaultFromMonth,
      ToMonth: defaultToMonth,
    };
  }, [reportData]);

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const navigate = useNavigate();
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const { isSkip, triggerQuery } = useSkipFetchingQuery();
  const { exportToExcel } = useExportData();

  // Prepare API parameters
  const fillParams = {
    FromMonth: currentReportData.fromMonth || currentReportData.FromMonth || "",
    ToMonth: currentReportData.toMonth || currentReportData.ToMonth || "",
  };

  // Initialize pagination state from URL params
  const getInitialPage = () => {
    const pageFromUrl = parseInt(queryParams.page);
    return !isNaN(pageFromUrl) && pageFromUrl >= 0 ? pageFromUrl : 0;
  };

  const getInitialPageSize = () => {
    const pageSizeFromUrl = parseInt(queryParams.pageSize);
    return !isNaN(pageSizeFromUrl) && pageSizeFromUrl > 0
      ? pageSizeFromUrl
      : 25;
  };

  const [params, setParams] = useState({
    ...fillParams,

    page: getInitialPage(),
    PageSize: getInitialPageSize(),
    PageNumber: getInitialPage() + 1,
  });

  const headerColumn = info.trial_balance;
  const [openPrintPreview, setOpenPrintPreview] = useState(false);

  // Update params when reportData changes
  useEffect(() => {
    const newFillParams = {
      FromMonth:
        currentReportData.fromMonth || currentReportData.FromMonth || "",
      ToMonth: currentReportData.toMonth || currentReportData.ToMonth || "",
    };

    setParams((prevParams) => ({
      ...prevParams,
      ...newFillParams,
    }));

    triggerQuery();
  }, [currentReportData.fromMonth, currentReportData.toMonth]);

  // Update URL when pagination changes
  const updatePaginationInUrl = (newPage, newPageSize) => {
    setQueryParams(
      {
        page: newPage,
        pageSize: newPageSize,
      },
      { retain: true }
    );
  };

  //viewing
  const {
    data: trialData,
    isLoading: isTrialLoading,
    isFetching: isTrialFetching,
  } = useGenerateTrialBalancePerMonthPaginationQuery(
    {
      ...fillParams,

      PageNumber: params.page + 1,
      UsePagination: true,
      PageSize: params.PageSize,
    },
    {
      skip: isSkip,
    }
  );

  //export
  const {
    data: exportData,
    isLoading: isExportLoading,
    isFetching: isExportFetching,
  } = useGenerateTrialBalancePerMonthPaginationQuery(
    {
      ...fillParams,
      UsePagination: false,
    },
    {
      skip: isSkip,
    }
  );

  const hasData =
    exportData?.value.trialBalance && exportData.value.trialBalance.length > 0;

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setParams((currentValue) => ({
      ...currentValue,
      page: newPage, // Update the page index
      PageNumber: newPage + 1, // Update the page number (1-based)
    }));
    // Update URL with new pagination state
    updatePaginationInUrl(newPage, params.PageSize);
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
    updatePaginationInUrl(0, newPageSize); // Update URL with new page size
  };

  const trailBalanceDataPrint = exportData?.value?.trialBalance || [];
  const trailBalanceData = trialData?.value?.trialBalance || [];
  const debitTotal = trialData?.value?.lineAmount?.lineAmountDebit || 0;
  const creditTotal = trialData?.value?.lineAmount?.lineAmountCredit || 0;
  // const debitBalanceTotal = trialData?.value?.lineAmount?.debitBalance || 0;
  // const creditBalanceTotal = trialData?.value?.lineAmount?.creditBalance || 0;

  const headers = info.trial_balance_export;

  const onExport = async () => {
    if (isExportLoading || isExportFetching) {
      return; // Prevent multiple export attempts while one is in progress
    }

    toast.info("Export started");
    try {
      exportToExcel(headers, exportData.value.trialBalance, currentReportData);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  const onPrint = () => {
    setAnchorEl(null); // Close menu
    setOpenPrintPreview(true);
  };

  // Menu handlers
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Check if any action is loading
  const isAnyActionLoading =
    isExportLoading || isExportFetching || isTrialLoading || isTrialFetching;

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
      {/* Removed DateSearchComponent from here */}
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
                    SUB GROUP
                  </TableCell>
                  <TableCell rowSpan={2} style={stickyHeaderStyle}>
                    ACCOUNT NAME
                  </TableCell>
                  {/* <TableCell style={stickyHeaderStyle}></TableCell> */}
                  {/* <TableCell style={stickyHeaderStyle}></TableCell> */}

                  {/* Opening Balance Column Group */}
                  <TableCell
                    colSpan={2}
                    align="center"
                    style={stickyHeaderStyle}
                  >
                    AMOUNT{/* BALANCES */}
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

                  {/* Transaction subheaders
                  <TableCell align="center" style={stickySubHeaderStyle}>
                    DEBIT{" "}
                  </TableCell>
                  <TableCell align="center" style={stickySubHeaderStyle}>
                    CREDIT
                  </TableCell> */}
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
                              onClick={() => {
                                const isClickable =
                                  (col.id === "credit" || col.id === "debit") &&
                                  row[col.id] !== 0;
                                if (isClickable) {
                                  navigate(
                                    `/system/ALL?coa=${encodeURIComponent(
                                      row.chartOfAccount
                                    )}&fromMonth=${
                                      currentReportData.fromMonth
                                    }&toMonth=${
                                      currentReportData.toMonth
                                    }&drCr=${col.id}`
                                  );
                                }
                              }}
                              style={{
                                color: formatNumber(row[col.id]).color,
                                cursor:
                                  (col.id === "credit" || col.id === "debit") &&
                                  row[col.id] !== 0
                                    ? "pointer"
                                    : "default",
                              }}
                            >
                              {col.id === "credit" || col.id === "debit" ? (
                                row[col.id] !== 0 ? (
                                  <Tooltip
                                    title={`Check ${col.name} of ${row.chartOfAccount} Details.`}
                                    arrow
                                    placement="top"
                                    slot={{ transition: "zoom" }}
                                  >
                                    <span>
                                      {isNumber
                                        ? formatNumber(cellValue)
                                            .formattedNumber
                                        : cellValue || "—"}
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <span>
                                    {isNumber
                                      ? formatNumber(cellValue).formattedNumber
                                      : cellValue || "—"}
                                  </span>
                                )
                              ) : isNumber ? (
                                formatNumber(cellValue).formattedNumber
                              ) : (
                                cellValue || "—"
                              )}
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
                                : // : col.id === "debitVariance"
                                  // ? formatNumber(debitBalanceTotal).color
                                  // : col.id === "creditVariance"
                                  // ? formatNumber(creditBalanceTotal).color
                                  "inherit",
                            fontWeight:
                              col.id === "debit" ||
                              col.id === "credit" ||
                              // col.id === "debitVariance" ||
                              // col.id === "creditVariance" ||
                              col.id === "chartOfAccount"
                                ? 600
                                : "inherit",
                          }}
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
            onClick={handleMenuClick}
            disabled={!hasData || isAnyActionLoading}
            endIcon={
              isAnyActionLoading ? (
                <CircularProgress size={16} sx={{ color: "primary" }} />
              ) : (
                <KeyboardArrowDown
                  sx={{
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease-in-out",
                  }}
                />
              )
            }
          >
            {isAnyActionLoading ? "Processing..." : "Export"}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            slotProps={{
              paper: {
                sx: {
                  "& .MuiMenuItem-root": {
                    minHeight: "auto",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                  },
                },
              },
            }}
          >
            <MenuItem
              onClick={onExport}
              disabled={isExportLoading || isExportFetching}
              dense
            >
              <ListItemIcon sx={{ minWidth: "36px" }}>
                {isExportLoading || isExportFetching ? (
                  <CircularProgress size={18} />
                ) : (
                  <FileDownload fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {isExportLoading || isExportFetching ? "Exporting..." : "Excel"}
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={onPrint} dense>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <Print fontSize="small" />
              </ListItemIcon>
              <ListItemText>Print</ListItemText>
            </MenuItem>
          </Menu>
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

        {/* Print Dialog */}
        <PrintPreviewDialog
          open={openPrintPreview}
          onClose={() => setOpenPrintPreview(false)}
          trialBalanceData={trailBalanceDataPrint}
          reportData={currentReportData}
          debitTotal={debitTotal}
          creditTotal={creditTotal}
          // debitBalanceTotal={debitBalanceTotal}
          // creditBalanceTotal={creditBalanceTotal}
        />
      </Box>
    </Box>
  );
};

export default TrialBalancePage;
