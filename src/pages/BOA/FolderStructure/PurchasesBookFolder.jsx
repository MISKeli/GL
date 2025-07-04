/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react";
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
import { IosShareRounded } from "@mui/icons-material";
import "../../../styles/BoaPage.scss";
import { useDispatch } from "react-redux";
import {
  setPage,
  setPageNumber,
  setPageSize,
} from "../../../features/slice/authSlice";
import { useParams } from "react-router-dom";
import useExportData from "../../../components/hooks/useExportData";
import { toast } from "sonner";
import moment from "moment";
import { useLazyGenerateSystemFolderStructurePageQuery } from "../../../features/api/folderStructureApi";

const PurchasesBookFolder = ({
  data,
  page,
  pageSize,
  isLoading,
  isFetching,
  bookType
}) => {
  const dispatch = useDispatch();
  const param = useParams();
  //console.log("🚀 ~ param:", param);

  //   const {  pageSize } = useSelector((state) => state.auth);

  const handleChangePage = (event, newPage) => {
    dispatch(setPageNumber(newPage));
  };

  const handleChangeRowsPerPage = (event) => {
    dispatch(setPageSize(parseInt(event.target.value, 10)));
    dispatch(setPage(0)); // Reset to first page
  };

  console.log("🚀 ~ PurchasesBookFolder ~ data:", data);
  const headerColumn = info.Purchases_Book;

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
    data?.value?.lineAmount?.lineAmountDebit || 0;
  const purchasesBookCreditTotalData =
    data?.value?.lineAmount?.lineAmountCredit || 0;

  const grandTotal = purchasesBookDebitTotalData + purchasesBookCreditTotalData;

  const { purchasesBookExport } = useExportData();
  const [
    fetchExportData,
    { isLoading: isExportLoading, isFetching: isExportFetching },
  ] = useLazyGenerateSystemFolderStructurePageQuery();
  const header = info.Purchases_Book_Export;

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

      await purchasesBookExport(header, exportData?.value?.purchasesBook, {
        fromMonth: moment(param.month, "MMM")
          .startOf("month")
          .format("MMMM DD, YYYY"),
        toMonth: moment(param.month, "MMM").endOf("month"),
      }, bookType);

  
      toast.success("Export completed successfully");
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  return (
    <>
      <Box
        className="boa"
        width={100}
        flex={1}
        display={"flex"}
        flexDirection={"column"}
      >
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
                        {columnTable.name}{" "}
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
                  {isFetching || isLoading ? (
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
                  ) : data?.value?.purchasesBook?.length > 0 ? (
                    <>
                      {data?.value?.purchasesBook?.map((row, index) => (
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
              disabled={isExportLoading || isExportFetching}
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
export default PurchasesBookFolder;
