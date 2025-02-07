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
import React from "react";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import { useState } from "react";
import useDebounce from "../../components/useDebounce";
import {
  useGenerateJournalBookPageQuery,
  useLazyGenerateJournalBookPageQuery,
} from "../../features/api/boaApi";
import { IosShareRounded } from "@mui/icons-material";
import useExportData from "../../components/hooks/useExportData";
import { toast } from "react-toastify";

const JournalBookPage = ({ reportData }) => {
  console.log("🚀 ~ JournalBookPage ~ reportData:", reportData);
  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search);

  const [params, setParams] = useState({
    Search: debounceValue,
    page: 0,
    PageSize: 25,
    PageNumber: 1,
    UsePagination: true,
    FromMonth: reportData.FromMonth,
    ToMonth: reportData.ToMonth,
  });

  const headerColumn = info.journal_book;

  const {
    data: boaData,
    isLoading: isBoaLoading,
    isFetching: isBoaFetching,
  } = useGenerateJournalBookPageQuery({
    ...params,
  });
  const bodyData = boaData?.value?.journalBook || [];

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
    boaData?.value?.lineAmount?.lineAmountDebit || 0;
  const journalBookCreditTotalData =
    boaData?.value?.lineAmount?.lineAmountCredit || 0;

  const { journalBookExport } = useExportData();
  const [fetchExportData] = useLazyGenerateJournalBookPageQuery();

  const hasData =
    boaData?.value?.journalBook && boaData?.value?.journalBook?.length > 0;

  const headers = info.journal_book_export;

  const onExport = async () => {
    try {
      // Trigger lazy query for export
      const exportData = await fetchExportData({
        UsePagination: false, // Disable pagination
        FromMonth: params.FromMonth,
        ToMonth: params.ToMonth,
      }).unwrap();
      await journalBookExport(
        headers,
        exportData?.value?.journalBook,
        reportData
      );
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
                    {headerColumn.map((column) => (
                      <TableCell key={column.id}>{column.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isBoaFetching || isBoaLoading ? (
                    Array.from({ length: params.PageSize }).map((_, index) => (
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
              disabled={!hasData || isBoaLoading || isBoaFetching}
              startIcon={
                isBoaLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isBoaLoading ? "Exporting..." : "Export"}
            </Button>
          </Box>

          <TablePagination
            component="div"
            count={boaData?.value.totalCount || 0}
            page={params.page}
            rowsPerPage={params.PageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              {
                label: "All",
                value: boaData?.value?.totalCount || 0,
              },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default JournalBookPage;
