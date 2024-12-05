import React, { useState } from "react";
import useDebounce from "../../components/useDebounce";
import { info } from "../../schemas/info";
import "../../styles/BoaPage.scss";
import { useGenerateTrialBalancePerMonthPaginationQuery } from "../../features/api/boaApi";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { IosShareRounded } from "@mui/icons-material";

const CashReceiptsBookPage = ({ reportData }) => {
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

  const headerColumn = info.cash_receipts_book;

  const {
    data: boaData,
    isLoading: isBoaLoading,
    isFetching: isBoaFetching,
  } = useGenerateTrialBalancePerMonthPaginationQuery({
    Search: debounceValue,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    Month: reportData.Month,
    Year: reportData.Year,
  });

  const bodyData = boaData?.value?.cashReceiptsBook || [];

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
    <>
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
                    {headerColumn.map((columnTable) => (
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
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Box className="boa__footer">
        <Box>
            <Button
              variant="contained"
              color="primary"
             // onClick={onExport}
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
            count={boaData?.value?.totalCount || 0}
            page={params.page}
            rowsPerPage={params.PageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: "All", value: boaData?.value?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default CashReceiptsBookPage;
