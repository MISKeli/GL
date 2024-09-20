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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
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
import Date from "./Date";
import { Tab } from "@mui/material";
import "../../styles/SystemsPage.scss";

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

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const ArcanaPage = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [reportData, setReportData] = useState([]); // State to hold fetched data
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setValue] = useState(0);
  const inputRef = useRef(null); // Create a ref for InputBase

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
  const tableData = info.report_sample_table_column;
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

  //Tabs
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box className="systems">
      <Box className="systems__header">
        <Box className="systems__header__container1">
          <Typography
            variant="h5"
            className="systems__header__container1--title"
          >
            {info.report_arcana_title}
          </Typography>
          <Button startIcon={<SystemUpdateAltRounded />} variant="contained">
            {info.report_import_button}
          </Button>
        </Box>
        <Box className="systems__header__container2">
          <Box
            //className="report__header__container2__tab"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tabs
              className="systems__header__container2__tab"
              value={value}
              onChange={handleChange}
              aria-label="Arcana Tabs"
            >
              <Tab label="Book 1" />
              <Tab label="Book 2" />
              <Tab label="Book 3" />
            </Tabs>
          </Box>
          <Box className="systems__header__container2__filters">
            <Box className="systems__header__container2__filters--date-picker">
              <IconButton
                onClick={(event) => {
                  handlePopOverOpen(event);
                }}
              >
                <FilterListRounded color="primary" />
              </IconButton>
            </Box>
            <AnimatedBox
              className="systems__header__container2--search"
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
        </Box>
      </Box>
      <Box className="systems__content">
        <TabPanel value={value} index={0}>
          <Box className="systems__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "520px" }}
            >
              <Table stickyHeader aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {tableData.map((sampleTable) => (
                      <TableCell key={sampleTable.id}>
                        {sampleTable.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData?.value?.length > 0 ? (
                    reportData?.value?.map((row, index) => (
                      <TableRow key={index}>
                        {tableData.map((col) => (
                          <TableCell key={col.id}>{row[col.id]}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={tableData.length} align="center">
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          Content for Tab 2
        </TabPanel>
        <TabPanel value={value} index={2}>
          Content for Tab 3
        </TabPanel>
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
      <Box className="systems__footer"></Box>
    </Box>
  );
};

export default ArcanaPage;
