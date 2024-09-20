// ReportPage.js
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Menu,
  Paper,
  styled,
  Table,
  TableBody, // Add this import
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { info } from "../../schemas/info";
import {
  FilterListRounded,
  OutboxRounded,
  SearchRounded,
  SystemUpdateAltRounded,
} from "@mui/icons-material";
import { Controller } from "react-hook-form";
import Date from "./Date";

const AnimatedBox = styled(Box)(({ theme, expanded }) => ({
  display: "flex",
  alignItems: "center",
  width: expanded ? "300px" : "50px",
  transition: "width 0.3s ease-in-out",
  border: expanded ? `1px solid ${theme.palette.primary.main}` : "none",
  borderRadius: "10px",
  padding: "2px 4px",
  position: "relative",
  margin: " 5px 5px",
}));

const UMPage = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [reportData, setReportData] = useState([]); // State to hold fetched data
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setopen] = useState(false);
  const inputRef = useRef(null); // Create a ref for InputBase

  const GLColumn = info.report_UM_table_column;

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  // Function to handle data fetched from the Date component
  const handleFetchData = (data) => {
    setReportData(data);
  };

  // Opening Menu
  const handlePopOverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <>
      <Box className="masterlist">
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.report_UM_title}
            </Typography>
            <Button startIcon={<SystemUpdateAltRounded />} variant="contained">
              {info.report_import_button}
            </Button>
          </Box>
        </Box>
        <Box className="masterlist__header__con2">
          <Box className="masterlist__header__con2--date-picker">
            <IconButton
              onClick={(event) => {
                handlePopOverOpen(event);
              }}
            >
              <FilterListRounded color="primary" />
            </IconButton>
          </Box>
          <AnimatedBox
            className="masterlist__header__con2--search"
            expanded={expanded}
            component="form"
            onClick={() => setExpanded(true)}
          >
            <InputBase
              sx={{ ml: 0.5, flex: 1 }}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => search === "" && setExpanded(false)}
              inputRef={inputRef} // Assign the ref to InputBase
            />
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
          </AnimatedBox>
        </Box>
        <Box className="masterlist__content">
          <Box className="masterlist__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {GLColumn.map((genledTable) => (
                      <TableCell key={genledTable.id}>
                        {genledTable.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData?.value?.length > 0 ? (
                    reportData?.value?.map((row, index) => (
                      <TableRow key={index}>
                        {GLColumn.map((col) => (
                          <TableCell key={col.id}>{row[col.id]}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={GLColumn.length} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={reportData?.value?.length || 0} // Total count of items
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage + 1}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePopOverClose}
        >
          <Box>
            <Typography>Transaction Date:</Typography>
          </Box>
          <Date onFetchData={handleFetchData} />
        </Menu>
        <Box className="masterlist__footer"></Box>
      </Box>
    </>
  );
};

export default UMPage;
