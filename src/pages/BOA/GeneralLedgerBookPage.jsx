import React, { useState } from "react";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import moment from "moment";
import useDebounce from "../../components/useDebounce";
import { useGenerateVerticalPurchasesBookPerMonthPaginationQuery } from "../../features/api/boaApi";
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

const GeneralLedgerBookPage = () => {
  const [reportData, setReportData] = useState({
    Month: moment().format("MMM"),
    Year: moment().format("YYYY"),
  });

  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search);
  const [params, setParams] = useState({
    Search: debounceValue,
    page: 0,
    PageSize: 25,
    PageNumber: 1,
    Month: reportData.Month,
    Year: reportData.Year,
  });

  const headerColumn = info.general_ledger_book;

  const {
    data: boaData,
    isLoading: isBoaLoading,
    isFetching: isBoaFetching,
  } = useGenerateVerticalPurchasesBookPerMonthPaginationQuery({
    Search: debounceValue,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    Month: reportData.Month,
    Year: reportData.Year,
  });

  const bodyData = boaData?.value?.generalLedgerBook || [];

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

  return (
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
            //onClick={onExport}
            disabled
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
  );
};

export default GeneralLedgerBookPage;
