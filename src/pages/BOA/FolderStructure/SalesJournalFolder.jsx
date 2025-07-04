/* eslint-disable react/prop-types */
import React from "react";
import { useDispatch } from "react-redux";
import {
  setPage,
  setPageNumber,
  setPageSize,
} from "../../../features/slice/authSlice";
import "../../../styles/BoaPage.scss";
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
import { info } from "../../../schemas/info";
import useExportData from "../../../components/hooks/useExportData";
import { useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { IosShareRounded } from "@mui/icons-material";
import { useLazyGenerateSystemFolderStructurePageQuery } from "../../../features/api/folderStructureApi";

const SalesJournalFolder = ({
  data,
  page,
  pageSize,
  isLoading,
  isFetching,
}) => {
  const dispatch = useDispatch();
  const param = useParams();
  const headerColumn = info.sales_journal;

  const handleChangePage = (event, newPage) => {
    dispatch(setPageNumber(newPage));
  };

  const handleChangeRowsPerPage = (event) => {
    dispatch(setPageSize(parseInt(event.target.value, 10)));
    dispatch(setPage(0)); // Reset to first page
  };

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
    data?.value?.lineAmount?.lineAmountDebit || 0;
  const trailBalanceCreditTotalData =
    data?.value?.lineAmount?.lineAmountCredit || 0;

  const { salesJournalExport } = useExportData();
  const [
    fetchExportData,
    { isLoading: isExportLoading, isFetching: isExportFetching },
  ] = useLazyGenerateSystemFolderStructurePageQuery();
  const header = info.sale_book_Export;

  const onExport = async () => {
    if (isExportLoading || isExportFetching) {
      return; // Prevent multiple export attempts while one is in progress
    }
    toast.info("Export started");
    try {
      // Trigger lazy query for export
      const exportData = await fetchExportData({
        Year: param.year,
        Month: param.month,
        Boa: param.boaName,
        UsePagination: false, // Disable pagination
      }).unwrap();

      // Use the fetched data for export
      await salesJournalExport(header, exportData?.value?.salesJournalBook, {
        fromMonth: moment(param.month, "MMM")
          .startOf("month")
          .format("MMMM DD, YYYY"),
        toMonth: moment(param.month, "MMM").endOf("month"),
      });
      toast.success("Export completed successfully");
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  return (
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
                  {headerColumn?.map((columnTable) => (
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
                {isFetching || isLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      {headerColumn?.map((col) => (
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
                ) : data?.value?.salesJournalBook?.length > 0 ? (
                  <>
                    {data?.value?.salesJournalBook?.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn?.map((col) => (
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
                                        ? row.lineAmount
                                        : subItem.id === "credit" &&
                                          row.drCr === "Credit"
                                        ? row.lineAmount
                                        : null;
                                    const formatted = formatNumber(
                                      amountValue || 0
                                    ); // Get formatted number
                                    return (
                                      <TableCell
                                        key={subItem.id}
                                        sx={{
                                          border: "none",
                                          color: formatted.color, // Apply the color
                                        }}
                                      >
                                        {formatted.formattedNumber}{" "}
                                        {/* Display formatted number */}
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
                                  ? col.id === "lineAmount" // Apply formatting only for numeric columns
                                    ? formatNumber(row[col.id]).formattedNumber
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
                      {headerColumn?.map((col) => (
                        <TableCell
                          key={col.id}
                          align="center"
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
                                    {formatted.formattedNumber}{" "}
                                    {/* Display formatted grand total */}
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
                    <TableCell colSpan={headerColumn?.length} align="center">
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
          <Button
            variant="contained"
            color="primary"
            disabled={isExportLoading || isExportFetching}
            onClick={onExport}
            startIcon={
              isExportLoading || isExportFetching ? (
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
          count={data?.value?.totalCount || 0}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[
            25,
            50,
            100,
            { label: "All", value: data?.value?.totalCount || 0 },
          ]}
        />
      </Box>
    </Box>
  );
};

export default SalesJournalFolder;
