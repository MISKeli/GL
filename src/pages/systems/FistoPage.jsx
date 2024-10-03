import React, { useRef, useState } from "react";
import "../../styles/SystemsPage.scss";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Menu,
  Paper,
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
import * as XLSX from "xlsx";
import {
  ClearRounded,
  FilterListRounded,
  SearchRounded,
  SystemUpdateAltRounded,
} from "@mui/icons-material";

import CustomImport from "../../components/custom/CustomImport";
import Date from "./Date";
import { useGetAllGLReportAsyncQuery } from "../../features/api/importReportApi";
import useDebounce from "../../components/useDebounce";
import FilterComponent from "../../components/FilterComponent";

function FistoPage() {
  const [reportData, setReportData] = useState([]); // State to hold fetched data
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state for CustomImport
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const inputRef = useRef(null); // Create a ref for InputBase
  const debounceValue = useDebounce(search);
  const headerColumn = info.report_import_table_columns;
  const {
    data: fistoData,
    isLoading: isFistoloading,
    isFetching: isFistoFetching,
  } = useGetAllGLReportAsyncQuery({
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    System: "Fisto",
    ...(reportData.dateFrom ? { DateFrom: reportData.dateFrom } : {}),
    ...(reportData.dateTo ? { DateTo: reportData.dateTo } : {}),
  });
  console.log("DATEEEE", reportData);
  //console.log("fisto", fistoData);
  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  // Function to handle data fetched from the Date component
  const handleFetchData = (data) => {
    console.log("Received DateFrom:", data.dateFrom, "DateTo:", data.dateTo); // Debugging
    setReportData({
      dateFrom: data.dateFrom, // Ensure you're setting the dates explicitly
      dateTo: data.dateTo,
    });
  };

  // Function to handle data loaded from CustomImport
  const handleDataLoaded = (data) => {
    setReportData(data);
  };

  // Function to open/close the dialog
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  // Opening Menu
  const handlePopOverOpen = (event) => {
    setAnchorEl(event.currentTarget);
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
              {info.report_fisto_title}
            </Typography>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <Button
              startIcon={<SystemUpdateAltRounded />}
              variant="contained"
              onClick={handleDialogOpen} // Trigger dialog open here
            >
              {info.report_import_button}
            </Button>
          </Box>
          <Box className="systems__header__container2">
            <Box className="masterlist__header__con2--date-picker">
              <FilterComponent color="primary" onFetchData={handleFetchData} />
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
                  // sx={{ p: "5px" }}
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
        <CustomImport
          open={isDialogOpen}
          onClose={handleDialogClose}
          onDataLoaded={handleDataLoaded}
          system="fisto"
        />
        
        
        <Box className="systems__content">
          {isFistoFetching || isFistoloading ? (
            <Box
              className="systems__content__table"
              
            >
              <CircularProgress size={45}  />
            </Box>
          ) : (
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
                    {fistoData?.reports?.length > 0 ? (
                      fistoData?.reports?.map((row, index) => (
                        <TableRow key={index}>
                          {headerColumn.map((col) => (
                            <TableCell key={col.id}>{row[col.id]}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        {/* <TableCell colSpan={headerColumn.length} align="center">
                        No data available
                      </TableCell> */}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={fistoData?.totalCount || 0} // Total count of items
                page={page}
                rowsPerPage={pageSize}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[
                  5,
                  10,
                  25,
                  { label: "All", value: fistoData?.totalCount || 0 },
                ]} // Dynamically use the total count for "All"
              />
            </Box>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePopOverClose}
        >
          <Box></Box>
          <Date onFetchData={handleFetchData} />
        </Menu>
        <Box className="systems__footer"></Box>
      </Box>
    </>
  );
}

export default FistoPage;
