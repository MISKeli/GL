/* eslint-disable react/prop-types */
import React from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  setPage,
  setPageNumber,
  setPageSize,
} from "../../../features/slice/authSlice";
import { info } from "../../../schemas/info";
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
import { IosShareRounded } from "@mui/icons-material";
import { useLazyGenerateSystemFolderStructurePageQuery } from "../../../features/api/folderStructureApi";
import useExportData from "../../../components/hooks/useExportData";
import moment from "moment";
import { toast } from "react-toastify";

const JournalBookFolder = ({ data, page, pageSize, isLoading, isFetching }) => {
  const dispatch = useDispatch();
  const param = useParams();

  const handleChangePage = (event, newPage) => {
    dispatch(setPageNumber(newPage));
  };

  const handleChangeRowsPerPage = (event) => {
    dispatch(setPageSize(parseInt(event.target.value, 10)));
    dispatch(setPage(0)); // Reset to first page
  };

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

  const journalBookDebitTotalData =
    data?.value?.lineAmount?.lineAmountDebit || 0;
  const journalBookCreditTotalData =
    data?.value?.lineAmount?.lineAmountCredit || 0;

  const bodyData = data?.value?.journalBook || [];
  const headerColumn = info.journal_book;

  const { journalBookExport } = useExportData();
  const [fetchExportData] = useLazyGenerateSystemFolderStructurePageQuery();
  const header = info.journal_book_export;

  const onExport = async () => {
    try {
      // Trigger lazy query for export
      const exportData = await fetchExportData({
        Year: param.year,
        Month: param.month,
        Boa: param.boaName,
        UsePagination: false, // Disable pagination
      }).unwrap();

      // Use the fetched data for export
      journalBookExport(header, exportData?.value?.journalBook, {
        fromMonth: moment(param.month, "MMM")
          .startOf("month")
          .format("MMMM DD, YYYY"),
        toMonth: moment(param.month, "MMM").endOf("month"),
      });
    } catch (err) {
      toast.error(err.message);
      console.error(err);
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
                    {headerColumn.map((column) => (
                      <TableCell key={column.id}>{column.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isFetching || isLoading ? (
                    Array.from({ length: 8 }).map((_, index) => (
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
                  ) : bodyData.length > 0 ? (
                    <>
                      {bodyData.map((row, index) => (
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
                      {/* Grand Total Row */}
                      <TableRow className="boa__content__table--grandtotal">
                        {info.journal_book.map((col) => (
                          <TableCell
                            key={col.id}
                            style={{
                              color:
                                col.id === "debit"
                                  ? formatNumber(journalBookDebitTotalData)
                                      .color
                                  : col.id === "credit"
                                  ? formatNumber(journalBookCreditTotalData)
                                      .color
                                  : "inherit",
                              fontWeight:
                                col.id === "debit" || col.id === "credit"
                                  ? 600
                                  : "inherit",
                            }}
                          >
                            {col.id === "debit"
                              ? formatNumber(journalBookDebitTotalData)
                                  .formattedNumber
                              : col.id === "credit"
                              ? formatNumber(journalBookCreditTotalData)
                                  .formattedNumber
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
        <Box className="boa__footer">
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={onExport}
              disabled={isLoading || isFetching}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <IosShareRounded />
              }
            >
              {isLoading ? "Exporting..." : "Export"}
            </Button>
          </Box>

          <TablePagination
            component="div"
            count={data?.value.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              {
                label: "All",
                value: data?.value?.totalCount || 0,
              },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default JournalBookFolder;
