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
import React, { useState } from "react";

import { IosShareRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import { useGenerateVerticalPurchasesBookPerMonthPaginationQuery } from "../../features/api/boaApi";
import { toast } from "sonner";

import useExportData from "../../components/hooks/useExportData";

const PurchasesBookPage = ({ reportData }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { purchasesBookExport } = useExportData();
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
  };

  const headerColumn = info.Purchases_Book;

  const {
    data: exportData,
    isLoading: isExportLoading,
    isFetching: isExportFetching,
  } = useGenerateVerticalPurchasesBookPerMonthPaginationQuery({
    ...fillParams,
    UsePagination: false,
  });

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateVerticalPurchasesBookPerMonthPaginationQuery({
    ...fillParams,
    search: reportData.Search,
    UsePagination: true,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  console.log("✌", boaData);

  // console.log("EBoaData", boaData);
  // console.log("sdsdsdsd", fillParams);
  console.log("Export Data", exportData);

  // Check if data is available and user has selected a month and year
  const hasData =
    exportData?.value?.purchasesBook &&
    exportData?.value?.purchasesBook?.length > 0;

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10)); // Directly set the selected value
    setPage(0);
  };

  // for comma
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

  const purchasesBookDebitTotalData =
    boaData?.value?.lineAmount?.lineAmountDebit || 0;
  const purchasesBookCreditTotalData =
    boaData?.value?.lineAmount?.lineAmountCredit || 0;

  const grandTotal = purchasesBookDebitTotalData + purchasesBookCreditTotalData;

  const header = info.Purchases_Book_Export;

  const onExport = async () => {
    try {
      purchasesBookExport(header, exportData.value.purchasesBook, reportData);
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
                                  //padding: "5px", // Ensure proper padding for aesthetics
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
                  {isboaFetching || isboaloading ? (
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
                  ) : boaData?.value?.purchasesBook?.length > 0 ? (
                    <>
                      {boaData?.value?.purchasesBook?.map((row, index) => (
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
                                  {formatNumber(grandTotal).formattedNumber}
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
              onClick={onExport}
              disabled={!hasData || isExportLoading || isExportFetching}
              startIcon={
                isExportLoading ? (
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

export default PurchasesBookPage;
