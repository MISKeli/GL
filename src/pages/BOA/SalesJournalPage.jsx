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
import React, { useRef, useState } from "react";
import FilterComponent from "../../components/FilterComponent";
import useDebounce from "../../components/useDebounce";
import moment from "moment";
import dayjs from "dayjs";
import { ClearRounded, SearchRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import { useGenerateSaleJournalBookPerMonthPaginationQuery } from "../../features/api/boaApi";
import BoaFilterComponent from "../../components/BoaFilterComponent";
const SalesJournalPage = () => {
  const currentDate = dayjs();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const inputRef = useRef(null);
  const [reportData, setReportData] = useState({
    DateFrom: moment(currentDate).format("YYYY-MM-DD"),
    DateTo: moment(currentDate).format("YYYY-MM-DD"),
  }); // State to hold fetched data
  const debounceValue = useDebounce(search);
  const headerColumn = info.sales_journal;

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateSaleJournalBookPerMonthPaginationQuery({
    System: reportData.System,
    Month: reportData.Month,
    Year: reportData.Year,
    search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  console.log("boaData", boaData);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };
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
                    {headerColumn.map((columnTable) => (
                      <TableCell
                        key={columnTable.id}
                        sx={{
                          textAlign: columnTable.subItems ? "center" : "",
                        }}
                      >
                        {columnTable.name}
                        {columnTable.subItems && (
                          <TableRow style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}>
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
                  ) : boaData?.value?.salesJournal?.length > 0 ? (
                    boaData?.value?.salesJournal?.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <React.Fragment key={col.id}>
                            {col.subItems ? (
                              // If the column has subItems (debit and credit), render them in nested cells
                              <TableCell align="center">
                                <TableRow
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {col.subItems.map((subItem) => (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        textAlign: "center",
                                        borderBottom: 0,
                                        padding: "5px",
                                      }}
                                    >
                                      {subItem.id === "debit" && row.drCr === "Debit"
                                        ? row.lineAmount
                                        : subItem.id === "credit" && row.drCr === "Credit"
                                        ? row.lineAmount
                                        : "—"}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableCell>
                            ) : (
                              // For regular columns without subItems
                              <TableCell>
                                {row[col.id] ? row[col.id] : "—"}
                              </TableCell>
                            )}
                          </React.Fragment>
                        ))}
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

export default SalesJournalPage;
