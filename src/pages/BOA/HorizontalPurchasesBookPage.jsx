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
import React, { useRef, useState, useEffect } from "react";
import useDebounce from "../../components/useDebounce";

import { IosShareRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import {
  useExportVerticalCashDisbursementBookPerMonthQuery,
  useGenerateHorizontalPurchasesBookPerMonthQuery,
} from "../../features/api/boaApi";
const HorizontalPurchasesBookPage = ({ reportData }) => {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [hasDataToExport, setHasDataToExport] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [cdbHeader, setCdbHeader] = useState(info.Purchases_Book_horizontal);
  const [transformedData, setTransformedData] = useState([]);
  const inputRef = useRef(null);
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
  const { data: exportData, isLoading: isExportLoading } =
    useExportVerticalCashDisbursementBookPerMonthQuery({
      Month: reportData.Month,
      Year: reportData.Year,
    });

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,

    isSuccess,
  } = useGenerateHorizontalPurchasesBookPerMonthQuery({
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    Month: reportData.Month,
    Year: reportData.Year,
  });
  // console.log("horizontalPB", boaData);
  // console.log("headerPB", cdbHeader);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  useEffect(() => {
    if (isSuccess) {
      const extraHeaders = boaData?.value?.purchasesBook?.flatMap((item) =>
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
      // console.log({ newSetHeaders });
      // console.log({ extraHeaders });
      setCdbHeader([...info.Purchases_Book_horizontal, ...newSetHeaders]);
    }
  }, [isSuccess, boaData?.value]);

  useEffect(() => {
    // Simulating API data fetch
    const apiData = boaData?.value?.purchasesBook || [];

    // Transform the data
    const newData = apiData.map((entry) => {
      // Destructure existing fields
      const {
        glDate,
        transactionDate,
        nameOfSupplier,
        description,
        poNumber,
        rrNumber,
        apv,
        receiptNumber,
        amount,
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
        glDate,
        transactionDate,
        nameOfSupplier,
        description,
        poNumber,
        rrNumber,
        apv,
        receiptNumber,
        amount,
        ...accounts,
      };
    });

    // Set the transformed data to state
    setTransformedData(newData);
  }, [boaData]);

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 25);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
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
                              <TableRow>
                                {columnTable.subItems.map((subItems) => (
                                  <TableCell
                                    key={subItems.id}
                                    sx={{
                                      textAlign: subItems.credit ? "left" : "",
                                      borderBottom: 0,
                                      padding: "5px",
                                    }}
                                  >
                                    {subItems.name}
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
                          return (
                            <TableCell key={column.id}>
                              {value && typeof value === "object" ? (
                                <Table>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          borderBottom: 0,
                                          padding: "5px",
                                        }}
                                      >
                                        {value.debit}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          textAlign: "center",
                                          borderBottom: 0,
                                          padding: "5px",
                                        }}
                                      >
                                        {value.credit}
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
            <Button
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

export default HorizontalPurchasesBookPage;
