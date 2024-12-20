import {
  Box,
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
import React, { useRef, useState, useEffect } from "react";
import useDebounce from "../../components/useDebounce";
import moment from "moment";
import dayjs from "dayjs";
import { ClearRounded, SearchRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import { useGenerateHorizontalCashDisbursementBookPerMonthQuery } from "../../features/api/boaApi";
import BoaFilterComponent from "../../components/BoaFilterComponent";
const ElixirETDPage = () => {
  const currentDate = dayjs();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [cdbHeader, setCdbHeader] = useState(
    info.cash_disbursement_book_horizontal
  );
  const [transformedData, setTransformedData] = useState([]);
  const inputRef = useRef(null);
  const [reportData, setReportData] = useState({
    DateFrom: moment(currentDate).format("YYYY-MM-DD"),
    DateTo: moment(currentDate).format("YYYY-MM-DD"),
  }); // State to hold fetched data
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

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,

    isSuccess,
  } = useGenerateHorizontalCashDisbursementBookPerMonthQuery({
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    System: reportData.System,
    Month: reportData.Month,
    Year: reportData.Year,
  });
  console.log("horizontalCDB", boaData);
  console.log("headerCDB", cdbHeader);

  console.log({ headerColumn });
  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  useEffect(() => {
    if (isSuccess) {
      console.log(" is success");
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
      console.log({ newSetHeaders });
      console.log({ extraHeaders });
      setCdbHeader([
        ...info.cash_disbursement_book_horizontal,
        ...newSetHeaders,
      ]);
    }
  }, [isSuccess, boaData?.value]);

  console.log("ww", boaData?.value?.cashDisbursementBook);

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

  console.log("NEW DATA:", transformedData);

  console.log("DATA: ", cdbHeader);

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

  // Function to handle data fetched from the Date component
  const handleFetchData = (data) => {
    console.log("DATAAA", data);
    console.log(
      "Received MONTH:",
      data.Month,
      "year:",
      data.Year,
      "system",
      data.System
    ); // Debugging
    setReportData(data);
  };

  return (
    <>
      <Box className="boa">
        <Box className="boa__header">
          <Box className="boa__header__container">
            <Box className="boa__header__container--filter">
              <BoaFilterComponent
                onFetchData={handleFetchData}
                setReportData={setReportData}
              />
            </Box>
            <Box
              className={`boa__header__container--search ${
                expanded ? "expanded" : ""
              }`}
              component="form"
              onClick={() => setExpanded(true)}
            >
              <InputBase
                sx={{ ml: 0.5, flex: 1 }}
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                inputRef={inputRef}
                onBlur={() => search === "" && setExpanded(false)} // Collapse when no input
              />
              {search && (
                <IconButton
                  color="primary"
                  type="button"
                  aria-label="clear"
                  onClick={() => {
                    setSearch(""); // Clears the search input
                    inputRef.current.focus(); // Keeps focus on the input after clearing
                  }}
                >
                  <ClearRounded />
                </IconButton>
              )}
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton
                color="primary"
                type="button"
                sx={{ p: "10px" }}
                aria-label="search"
                onClick={handleSearchClick}
              >
                <SearchRounded />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Box className="boa__content">
          <Box className="boa__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader>
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
                                  textAlign: subItems.credit ? "left" : "", // Center subItems text
                                  borderBottom: 0,
                                  padding: "5px", // Ensure proper padding for aesthetics
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
                                <TableRow 
                                style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                >
                                  <TableCell sx={{
                                            textAlign: "center",
                                            borderBottom: 0,
                                            padding: "5px",
                                          }}> {value.debit}</TableCell>
                                  <TableCell sx={{
                                            textAlign: "center",
                                            borderBottom: 0,
                                            padding: "5px",
                                          }}> {value.credit}</TableCell>
                                </TableRow>
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
          {" "}
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

export default ElixirETDPage;
