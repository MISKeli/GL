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
import OnExportButton from "../../components/OnExportButton";

const JournalBookPage = ({ reportData }) => {
  //console.log("🚀 ~ JournalBookPage ~ reportData:", reportData);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search);

  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
  };

  const headerColumn = info.journal_book_sumarry;

  const {
    data: boaData,
    isLoading: isBoaLoading,
    isFetching: isBoaFetching,
  } = useGenerateJournalBookPageQuery({
    ...fillParams,
    UsePagination: true,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  const bodyData = boaData?.value?.journalBook || [];

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

  const { journalBookSummaryExport } = useExportData();
  const [
    fetchExportData,
    { isLoading: isExportLoading, isFetching: isExportFetching },
  ] = useLazyGenerateJournalBookPageQuery();

  const hasData = boaData?.value?.journalBook?.length > 0;

  const headers = info.journal_book_export_summary;

  const onExport = async () => {
    if (isExportLoading || isExportFetching) {
      return; // Prevent multiple export attempts while one is in progress
    }
    toast.info("Export started");

    try {
      // Trigger lazy query for export
      const exportData = await fetchExportData({
        UsePagination: false, // Disable pagination
        ...fillParams,
      }).unwrap();

      console.log("journal book expoet", exportData);
      await journalBookSummaryExport(
        headers,
        exportData?.value?.journalBook,
        reportData
      );
      toast.success("Export completed successfully");
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
                    Array.from({ length: 10 }).map((_, index) => (
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
                        {info.journal_book_sumarry.map((col) => (
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
            <OnExportButton
              onExport={onExport}
              hasData={hasData}
              isLoading={isExportLoading}
              isFetching={isExportFetching}
            />
          </Box>

          <TablePagination
            component="div"
            count={boaData?.value.totalCount || 0}
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
