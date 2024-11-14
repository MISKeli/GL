/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import "../../styles/SystemsPage.scss";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Select,
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

import {
  ClearRounded,
  LibraryAddRounded,
  SearchRounded,
} from "@mui/icons-material";
import { useGetAllGLReportAsyncQuery } from "../../features/api/importReportApi";
import useDebounce from "../../components/useDebounce";
import FilterComponent from "../../components/FilterComponent";
import dayjs from "dayjs";
import moment from "moment";
import { useLazyGetAllSystemsAsyncQuery } from "../../features/api/systemApi";

import CusImport from "../../pages/systems/CusImport";
function MainSystemPage() {
  const currentDate = dayjs();
  const [reportData, setReportData] = useState({
    DateFrom: moment(currentDate).format("YYYY-MM-DD"),
    DateTo: moment(currentDate).format("YYYY-MM-DD"),
  }); // State to hold fetched data
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedSystem, setSelectedSystem] = useState(""); // State for selected system

  const [pageSize, setPageSize] = useState(25);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef(null); // Create a ref for InputBase
  const debounceValue = useDebounce(search);
  const headerColumn = info.report_import_table_columns.map((col) => ({
    ...col,
    width: col.width || "auto", // Set default width if not defined
  }));

  // Lazy query to fetch systems
  const [getSystems, { data: systemsData, isLoading: isSystemsLoading }] =
    useLazyGetAllSystemsAsyncQuery();

  // Fetch systems on component mount
  useEffect(() => {
    getSystems(); // Fetch systems
  }, [getSystems]);

  const {
    data: systemData,
    isLoading: isSystemloading,
    isFetching: isSystemFetching,
  } = useGetAllGLReportAsyncQuery({
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    System: selectedSystem,
    DateFrom: reportData.DateFrom,
    DateTo: reportData.DateTo,
  });

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
    const selectedValue = parseInt(event.target.value, 25);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  // Handle system selection
  const handleSystemChange = (event) => {
    setSelectedSystem(event.target.value);
  };

  // Function to open/close the dialog
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  return (
    <>
      <Box className="systems">
        <CusImport
          open={isDialogOpen}
          onClose={handleDialogClose}
          inert={isDialogOpen}
        />
        <Box className="systems__header">
          <Box className="systems__header__container1">
            {/* Dropdown to select system */}
            <Select
              sx={{ borderRadius: "10px" }}
              variant="outlined"
              value={selectedSystem || ""} // Ensure value is defined
              onChange={handleSystemChange}
              displayEmpty
              inputProps={{ "aria-label": "Select System" }}
              className="systems__header__container1--dropdown"
            >
              <MenuItem value="" disabled>
                Select a System
              </MenuItem>
              {systemsData?.result.map((system) => (
                <MenuItem key={system.id} value={system.systemName}>
                  {system.systemName}
                </MenuItem>
              ))}
            </Select>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <Button
              startIcon={<LibraryAddRounded />}
              variant="contained"
              onClick={handleDialogOpen}
            >
              {info.system_import_button}
            </Button>
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
                      <TableCell
                        key={columnTable.id}
                        sx={{
                          whiteSpace:
                            columnTable.id === "itemDescription"
                              ? "nowrap"
                              : "normal",
                        }}
                      >
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
                          <TableCell key={col.id}>
                            {" "}
                            {row[col.id] ? row[col.id] : "—"}
                          </TableCell>
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
        </Menu>
        <Box className="systems__footer">
          <TablePagination
            component="div"
            count={systemData?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              { label: "All", value: systemData?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
}

export default MainSystemPage;
