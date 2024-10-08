import React, { useEffect, useRef, useState } from "react";
import "../../styles/SystemsPage.scss";
import {
  Box,
  Divider,
  IconButton,
  InputBase,
  Menu,
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
import { info } from "../../schemas/info";

import { ClearRounded, SearchRounded } from "@mui/icons-material";
import Date from "./Date";
import {
  useGetAllGLReportAsyncQuery,
  useLazyGetAllGLReportAsyncQuery,
} from "../../features/api/importReportApi";
import useDebounce from "../../components/useDebounce";
import FilterComponent from "../../components/FilterComponent";
import dayjs from "dayjs";
import moment from "moment";

function ElixirPharmacyPage() {
  const currentDate = dayjs();
  const [reportData, setReportData] = useState({
    DateFrom: moment(currentDate).format("YYYY-MM-DD"),
    DateTo: moment(currentDate).format("YYYY-MM-DD"),
  }); // State to hold fetched data
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const inputRef = useRef(null); // Create a ref for InputBase
  const debounceValue = useDebounce(search);
  const headerColumn = info.report_import_table_columns;

  // Lazy fetch to get total count without date filters
  const [fetchTotalCount, { data: totalCountData }] =
    useLazyGetAllGLReportAsyncQuery();

  const {
    data: systemData,
    isLoading: isSystemloading,
    isFetching: isSystemFetching,
  } = useGetAllGLReportAsyncQuery({
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    System: "Elixir_Pharmacy",
    DateFrom: reportData.DateFrom,
    DateTo: reportData.DateTo,
  });
  //console.log("DATEEEE", reportData);
  //console.log("fisto", fistoData);

  // Fetch total count on component mount (without date filtering)
  useEffect(() => {
    fetchTotalCount({
      Search: "",
      PageNumber: 1,
      PageSize: 1, // Only fetching count, so limit page size
      System: "Elixir_Pharmacy",
      DateFrom: "", // Empty to include all data
      DateTo: "", // Empty to include all data
    });
  }, [fetchTotalCount]);

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  // Function to handle data fetched from the Date component
  const handleFetchData = (data) => {
    console.log("DATAAA", data);
    console.log("Received DateFrom:", data.dateFrom, "DateTo:", data.dateTo); // Debugging
    setReportData(data);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };
  return (
    <>
      <Box className="systems">
        <Box className="systems__header">
          <Box className="systems__header__container1">
            <Typography
              variant="h5"
              className="systems__header__container1--title"
            >
              {info.system_ElixirPharmacy_title}
            </Typography>
          </Box>
          <Box className="systems__header__container2">
            <Box className="masterlist__header__con2--date-picker">
              <FilterComponent
                color="primary"
                onFetchData={handleFetchData}
                setReportData={setReportData}
              />
            </Box>
            <Box
              className={`systems__header__container2--search ${
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

        <Box className="systems__content">
          <Box className="systems__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {headerColumn.map((columnTable) => (
                      <TableCell key={columnTable.id}>
                        {columnTable.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isSystemFetching || isSystemloading ? (
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
                  ) : systemData?.reports?.length > 0 ? (
                    systemData?.reports?.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <TableCell key={col.id}>{row[col.id]}</TableCell>
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

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePopOverClose}
        >
          <Box></Box>
          <Date onFetchData={handleFetchData} />
        </Menu>
        <Box className="systems__footer">
          <Typography>
            Total Records: {totalCountData?.totalCount || 0}
          </Typography>
          <TablePagination
            component="div"
            count={systemData?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: "All", value: systemData?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
}

export default ElixirPharmacyPage;
