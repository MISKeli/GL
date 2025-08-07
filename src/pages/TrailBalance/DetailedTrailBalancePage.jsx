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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { info } from "../../schemas/info";
import "../../styles/TrialBalancePage.scss";
import { toast } from "sonner";

import {
  useGenerateDetailedTrialBalanceQuery,
  useLazyGenerateDetailedTrialBalanceQuery,
} from "../../features/api/boaApi";
import {
  IosShareRounded,
  KeyboardArrowDown,
  FileDownload,
  Print,
} from "@mui/icons-material";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import useSkipFetchingQuery from "../../components/hooks/useSkipFetchingQuery";
import DetailedTrialBalancePrintDialog from "./DetailedTrialBalancePrintDialog";
import useExportData from "../../components/hooks/useExportData";

const DetailedTrailBalancePage = ({ reportData, onReportDataChange }) => {
  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();
  const { isSkip, triggerQuery } = useSkipFetchingQuery();

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Get page and pageSize from URL params
  const pageFromParams = parseInt(currentParams.page || "0", 10);
  const pageSizeFromParams = parseInt(currentParams.pageSize || "25", 10);

  const [params, setParams] = useState({
    fromMonth: reportData?.fromMonth || reportData?.FromMonth,
    toMonth: reportData?.toMonth || reportData?.ToMonth,
    page: pageFromParams,
    PageSize: pageSizeFromParams,
    PageNumber: pageFromParams + 1,
  });

  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  // Update params when reportData changes
  useEffect(() => {
    if (reportData) {
      setParams((prev) => ({
        ...prev,
        fromMonth: reportData.fromMonth || reportData.FromMonth,
        toMonth: reportData.toMonth || reportData.ToMonth,
      }));
    }
    triggerQuery();
  }, [reportData]);

  // Update URL params when reportData changes
  useEffect(() => {
    if (
      reportData?.fromMonth &&
      reportData?.toMonth &&
      (currentParams.fromMonth !== reportData.fromMonth ||
        currentParams.toMonth !== reportData.toMonth)
    ) {
      setQueryParams(
        {
          fromMonth: reportData.fromMonth,
          toMonth: reportData.toMonth,
        },
        { retain: true }
      );
    }
  }, [
    reportData?.fromMonth,
    reportData?.toMonth,
    currentParams,
    setQueryParams,
  ]);

  const fillParams = {
    FromMonth: reportData?.fromMonth || reportData?.FromMonth,
    ToMonth: reportData?.toMonth || reportData?.ToMonth,
  };

  //viewing
  const {
    data: detailedData,
    isLoading: isTrialLoading,
    isFetching: isTrialFetching,
  } = useGenerateDetailedTrialBalanceQuery(
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

  //export data (for both export and print - get all data without pagination)
  const { data: exportData } = useGenerateDetailedTrialBalanceQuery(
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
    setAnchorEl(null); // Close menu
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

  const onPrint = () => {
    setAnchorEl(null); // Close menu
    setPrintDialogOpen(true);
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
      <DetailedTrialBalancePrintDialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        trialBalanceData={exportData?.value?.trialBalance || []}
        reportData={reportData}
        totals={totals}
      />

      <Box className="trial">
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
                  {isExportLoading || isExportFetching
                    ? "Exporting..."
                    : "Excel"}
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
