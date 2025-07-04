/* eslint-disable react/prop-types */
import React, { useState } from "react";
import useDebounce from "../../components/useDebounce";
import { info } from "../../schemas/info";
import "../../styles/BoaPage.scss";
import { useGenerateVerticalCashReceiptBookPerMonthPaginationQuery } from "../../features/api/boaApi";
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

const CashReceiptsBookPage = ({ reportData }) => {
  const [search, setSearch] = useState("");
  const debounceValue = useDebounce(search);
  
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
  };
  // console.log("🚀 ~ CashReceiptsBookPage ~ fillParams:", fillParams);

  const [params, setParams] = useState({
    ...fillParams,
    Search: debounceValue,
    page: 0,
    PageSize: 25,
    PageNumber: 1,
  });

  const headerColumn = info.cash_receipts_book;

  const {
    data: boaData,
    isLoading: isBoaLoading,
    isFetching: isBoaFetching,
  } = useGenerateVerticalCashReceiptBookPerMonthPaginationQuery({
    Search: debounceValue,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    UsePagination: true,
    ...fillParams,
  });
  // console.log("🚀 ~ CashReceiptsBookPage ~ boaData:", boaData);

  const bodyData = boaData?.value?.cashReceiptJournal || [];

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
                <TableBody>
                  {isBoaFetching || isBoaLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
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
                  ) : bodyData?.length > 0 ? (
                    <>
                      {bodyData?.map((row, index) => (
                        <TableRow key={index}>
                          {headerColumn.map((col) => (
                            <React.Fragment key={col.id}>
                              {col.id === "rawMaterials" && col.subItems ? (
                                <TableCell align="center">
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
                                          ? row.amount
                                          : subItem.id === "credit" &&
                                            row.drCr === "Credit"
                                          ? row.amount
                                          : null;

                                      const { formattedNumber, color } =
                                        amountValue
                                          ? formatNumber(amountValue)
                                          : {
                                              formattedNumber: "0",
                                              color: "inherit",
                                            };

                                      return (
                                        <TableCell
                                          key={subItem.id}
                                          sx={{
                                            border: "none",
                                            color: color,
                                          }}
                                        >
                                          {formattedNumber}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                </TableCell>
                              ) : (
                                <TableCell
                                  sx={{
                                    color:
                                      col.id === "amount" && row[col.id] < 0
                                        ? "red"
                                        : "inherit",
                                  }}
                                >
                                  {row[col.id]
                                    ? col.id === "amount" // Apply number formatting only for 'amount'
                                      ? formatNumber(row[col.id])
                                          .formattedNumber
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
                        {headerColumn.map((col) => (
                          <TableCell
                            key={col.id}
                            className="boa__content__table--grandtotal"
                          >
                            {col.id === "rawMaterials" && col.subItems ? (
                              <TableRow
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {col.subItems.map((subItem) => {
                                  const value =
                                    subItem.id === "debit"
                                      ? purchasesBookDebitTotalData
                                      : subItem.id === "credit"
                                      ? purchasesBookCreditTotalData
                                      : 0;

                                  const { formattedNumber, color } =
                                    formatNumber(value);

                                  return (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        color: color,
                                        border: "none",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {formattedNumber}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ) : (
                              col.id === "amount" && (
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {/* {formatNumber(grandTotal).formattedNumber} */}hey
                                </Typography>
                              )
                            )}
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
