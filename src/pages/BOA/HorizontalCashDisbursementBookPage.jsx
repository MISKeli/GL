import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
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
import React, { useState, useEffect } from "react";
import useDebounce from "../../components/useDebounce";
import { IosShareRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import {
  useExportVerticalCashDisbursementBookPerMonthQuery,
  useGenerateHorizontalCashDisbursementBookPerMonthQuery,
} from "../../features/api/boaApi";
import usePagination from "@mui/material/usePagination/usePagination";

const HorizontalCashDisbursementBookPage = ({ reportData }) => {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [hasDataToExport, setHasDataToExport] = useState(false);
  const [cdbHeader, setCdbHeader] = useState(
    info.cash_disbursement_book_horizontal
  );
  const [transformedData, setTransformedData] = useState([]);
  const debounceValue = useDebounce(search);
  const seenIds = new Set();
  const joinedCdbHeader = cdbHeader
    .map((item) => ({
      ...item,
      id: item.id.split(" ").join(""),
    }))
    .filter((item) => {
      if (seenIds.has(item.id)) {
        return false;
      }
      seenIds.add(item.id);
      return true;
    });

  const headerColumn = joinedCdbHeader;

  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
    ToYear: reportData?.toYear || "",
    FromYear: reportData?.fromYear || "",
  };

  // const { data: exportData, isLoading: isExportLoading } =
  //   useExportVerticalCashDisbursementBookPerMonthQuery({
  //     ...fillParams,
  //   });

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,

    isSuccess,
  } = useGenerateHorizontalCashDisbursementBookPerMonthQuery({
    ...fillParams,
    Search: debounceValue,
    UsePagination: true,
    PageNumber: page + 1,
    PageSize: pageSize,
  });
  // console.log("horizontalCDB", boaData);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // for comma
  const formatNumber = (number) => {
    return Math.abs(number)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (isSuccess) {
      const extraHeaders = boaData?.value?.cashDisbursementBook?.flatMap(
        (item) =>
          item.accountName?.map((headeritem) => ({
            id: headeritem.nameOfAccount,
            name: headeritem.nameOfAccount.toUpperCase(),
            subItems: [
              { id: "debit", name: "DEBIT" },
              { id: "credit", name: "CREDIT" },
            ],
          }))
      );
      const newSetHeaders = [...new Set(extraHeaders)];
      //console.log({ newSetHeaders });
      //.log({ extraHeaders });
      setCdbHeader([
        ...info.cash_disbursement_book_horizontal,
        ...newSetHeaders,
      ]);
    }
  }, [isSuccess, boaData?.value]);

  //console.log("ww", boaData?.value?.cashDisbursementBook);

  useEffect(() => {
    // Simulating API data fetch
    const apiData = boaData?.value?.cashDisbursementBook || [];

    // Transform the data
    const newData = apiData.map((entry) => {
      // Destructure existing fields
      const {
        chequeDate,
        bank,
        cvNumber,
        chequeNumber,
        payee,
        description,
        tagNumber,
        apvNumber,
        accountName,
      } = entry;

      // Process accountName array to create individual fields
      const accounts = accountName.reduce((acc, account) => {
        const { nameOfAccount, debit, credit, drCr } = account;
        acc[nameOfAccount.replace(/\s+/g, "")] = { debit, credit, drCr }; // Removing spaces for key consistency
        return acc;
      }, {});

      // Combine all fields into one object
      return {
        chequeDate,
        bank,
        cvNumber,
        chequeNumber,
        payee,
        description,
        tagNumber,
        apvNumber,
        ...accounts,
      };
    });

    // Set the transformed data to state
    setTransformedData(newData);
  }, [boaData]);

  //console.log("NEW DATA:", transformedData);

  //.log("DATA: ", cdbHeader);

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  return (
    <>
      <Box className="boa">
        <Box className="boa__header">
          <Box className="boa__header__container">
            <Box className="boa__header__container--filter"></Box>
          </Box>
        </Box>
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
                          <Table>
                            <TableHead>
                              <TableRow
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {columnTable.subItems.map((subItem) => (
                                  <TableCell
                                    key={subItem.id}
                                    sx={{
                                      border: "none",
                                      padding: "5px",
                                    }}
                                  >
                                    {subItem.name}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                          </Table>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isboaFetching || isboaloading ? (
                    Array.from({ length: pageSize }).map((_, index) => (
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
                  ) : transformedData.length > 0 ? (
                    transformedData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headerColumn.map((column) => {
                          const value = row[column.id];
                          const isNegative = value < 0; // Check if the number is negative
                          return (
                            <TableCell
                              key={column.id}
                              sx={{
                                color: isNegative ? "red" : "inherit", // Red for negative numbers
                              }}
                            >
                              {value && typeof value === "object" ? (
                                <Table>
                                  <TableBody>
                                    <TableRow
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          border: "none",
                                          padding: "5px",
                                          color:
                                            value.debit < 0 ? "red" : "inherit",
                                        }}
                                      >
                                        {formatNumber(value.debit)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          border: "none",
                                          padding: "5px",
                                          color:
                                            value.credit < 0
                                              ? "red"
                                              : "inherit",
                                        }}
                                      >
                                        {formatNumber(value.credit)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              ) : (
                                value || "—"
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
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
            {/* <Button
              variant="contained"
              color="primary"
              //onClick={onExport}
              disabled={!hasDataToExport || isExportLoading}
              startIcon={
                isExportLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isExportLoading ? "Exporting..." : "Export"}
            </Button> */}

            <Button variant="contained" color="primary" disabled>
              Export
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={boaData?.value?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              { label: "All", value: boaData?.value?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default HorizontalCashDisbursementBookPage;
