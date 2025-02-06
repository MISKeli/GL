/* eslint-disable react/prop-types */
import React from "react";
import { useDispatch } from "react-redux";
import { info } from "../../../schemas/info";
import "../../../styles/BoaPage.scss";
import {
  Box,
  Button,
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
import { setPageNumber, setPageSize } from "../../../features/slice/authSlice";
import useExportData from "../../../components/hooks/useExportData";
import moment from "moment";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const CashDisbursementBookFolder = ({
  data,
  page,
  pageSize,
  isLoading,
  isFetching,
}) => {
  const dispatch = useDispatch();
  const param = useParams();

  const handleChangePage = (event, newPage) => {
    dispatch(setPageNumber(newPage));
  };

  const handleChangeRowsPerPage = (event) => {
    dispatch(setPageSize(parseInt(event.target.value, 10)));
    dispatch(setPage(0)); // Reset to first page
  };
  const headerColumn = info.cash_disbursement_book;

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

  const cashDisburstmentDebitTotalData =
    data?.value?.lineAmount?.lineAmountDebit || 0;
  const cashDisburstmentCreditTotalData =
    data?.value?.lineAmount?.lineAmountCredit || 0;

  const { CashDisburstmentBookExport } = useExportData();
  const header = info.cash_disbursement_Export;

  const onExport = async () => {
    try {
      CashDisburstmentBookExport(header, data.value.cashDisbursementBook, {
        fromMonth: moment(param.month, "MMM")
          .startOf("month")
          .format("MMMM DD, YYYY"),
        toMonth: moment(param.month, "MMM").endOf("month"),
      });
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  return (
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
                                //padding: "5px",
                              }}
                            >
                              {" "}
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
                  // Show skeleton loaders when fetching or loading
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
                ) : data?.value?.cashDisbursementBook?.length > 0 ? (
                  <>
                    {data?.value?.cashDisbursementBook.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <React.Fragment key={col.id}>
                            {col.subItems ? (
                              <TableCell align="center">
                                <TableRow
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: 0, // Ensure no extra padding for nested rows
                                  }}
                                >
                                  {col.subItems.map((subItem) => {
                                    const amountValue = row[subItem.id];
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
                                          color: color, // Apply color to the cell
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
                                {row[col.id] ? row[col.id] : "—"}
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
                          {col.subItems ? (
                            <TableRow
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: 0, // Ensure no extra padding for nested rows
                              }}
                            >
                              {col.subItems.map((subItem) => {
                                const value =
                                  subItem.id === "debitAmount"
                                    ? cashDisburstmentDebitTotalData
                                    : subItem.id === "creditAmount"
                                    ? cashDisburstmentCreditTotalData
                                    : 0;

                                const { formattedNumber, color } =
                                  formatNumber(value);

                                return (
                                  <TableCell
                                    key={subItem.id}
                                    sx={{
                                      border: "none",
                                      fontWeight: "bold",
                                      color: color,
                                    }}
                                  >
                                    {subItem.id === "debitAmount"
                                      ? formattedNumber
                                      : subItem.id === "creditAmount"
                                      ? formattedNumber // Credit will appear in red
                                      : "0"}
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
            //disabled
            //   startIcon={
            //     isExportLoading ? (
            //       <CircularProgress size={20} />
            //     ) : (
            //       <IosShareRounded />
            //     )
            //   }
          >
            {isLoading ? "Loading..." : isFetching ? "Exporting..." : "Export"}
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

export default CashDisbursementBookFolder;
