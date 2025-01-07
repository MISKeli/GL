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

import { LibraryAddRounded } from "@mui/icons-material";
import { useGetAllGLReportAsyncQuery } from "../../features/api/importReportApi";
import useDebounce from "../../components/useDebounce";
import FilterComponent from "../../components/FilterComponent";
import moment from "moment";
import { useLazyGetAllSystemsAsyncQuery } from "../../features/api/systemApi";

import CusImport from "../../pages/systems/CusImport";
import DateSearchCompoment from "../../components/DateSearchCompoment";
function MainSystemPage() {
  const [selectedSystem, setSelectedSystem] = useState(""); // State for selected system
  const [reportData, setReportData] = useState({
    Month: moment().format("MMM"),
    Year: moment().format("YYYY"),
    System: selectedSystem,
  }); // State to hold fetched data
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(25);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debounceValue = useDebounce(search);
  const headerColumn = info.report_import_table_columns.map((col) => ({
    ...col,
    width: col.width || "auto", // Set default width if not defined
  }));

  // Lazy query to fetch systems
  const [getSystems, { data: systemsData }] = useLazyGetAllSystemsAsyncQuery();

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
    Month: reportData.Month,
    Year: reportData.Year,
  });

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
            <Typography>Hello World</Typography>
            {/* Dropdown to select system */}
            
            
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
          <Select
              variant="standard"
              value={selectedSystem || ""} // Ensure value is defined
              onChange={handleSystemChange}
              displayEmpty
              inputProps={{ "aria-label": "Select System" }}
              className="systems__header__container1--dropdown"
            >
              <MenuItem value="" disabled>
                Select a System
              </MenuItem>
              <MenuItem value="">ALL</MenuItem>
              <MenuItem value="MANUAL">MANUAL</MenuItem>
              {systemsData?.result.map((system) => (
                <MenuItem key={system.id} value={system.systemName}>
                  {system.systemName}
                </MenuItem>
              ))}
            </Select>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

            <Box className="masterlist__header__con2--date-picker">
              <DateSearchCompoment
                color="primary"
                hasDate={false}
                hasImport={true}
                setReportData={setReportData}
              />
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
                    Array.from({ length: 5 }).map((_, index) => (
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
