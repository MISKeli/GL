/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
//import "../../styles/SystemsPage.scss";
import {
  Box,
  Button,
  CircularProgress,
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


import { IosShareRounded, LibraryAddRounded } from "@mui/icons-material";
import { useGetAllGLReportAsyncQuery } from "../features/api/importReportApi";
import useDebounce from "../components/useDebounce";

import moment from "moment";
import { useLazyGetAllSystemsAsyncQuery } from "../features/api/systemApi";

import CusImport from "../pages/systems/CusImport";
import DateSearchCompoment from "../components/DateSearchCompoment";
import useExportData from "../components/hooks/useExportData";
import { toast } from "sonner";
import {
  useGenerateGLReportPageQuery,
  useLazyGenerateGLReportPageQuery,
} from "../features/api/reportApi";
import { info } from "../schemas/info";
function SystemPage() {
  const [selectedSystem, setSelectedSystem] = useState(""); // State for selected system
  const [reportData, setReportData] = useState({
    FromMonth: moment().startOf("month").format("MM/DD/YYYY"),
    ToMonth: moment().endOf("month").format("MM/DD/YYYY"),
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
  } = useGenerateGLReportPageQuery({
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    UsePagination: true,
    System: selectedSystem,
    FromMonth: reportData.fromMonth,
    ToMonth: reportData.toMonth,
  });
  //console.log("🚀 ~ MainSystemPage ~ systemData:", systemData);

  const customHeaders = info.custom_header;

  const headers = Object.keys(customHeaders);

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

  const { exportImportSystem } = useExportData();
  const [fetchExportData] = useLazyGenerateGLReportPageQuery();

  const hasData = systemData?.value?.glreport?.length > 0;

  const onExport = async () => {
    try {
      // Trigger lazy query for export
      const exportData = await fetchExportData({
        UsePagination: false, // Disable pagination
        System: selectedSystem,
        FromMonth: reportData.fromMonth,
        ToMonth: reportData.toMonth,
      }).unwrap();
      await exportImportSystem(
        headers,
        exportData?.value?.glreport,
        reportData,
        selectedSystem
      );
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
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
              {info.system.title}
            </Typography>
          </Box>
          <Box className="systems__header__container2">
            {/* <Select
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
              {systemsData?.value?.result.map((system) => (
                <MenuItem key={system.id} value={system.systemName}>
                  {system.systemName}
                </MenuItem>
              ))}
            </Select> */}
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

            <Box className="masterlist__header__con2--date-picker">
              <DateSearchCompoment
                color="primary"
                hasDate={true}
                setReportData={setReportData}
                hasImport={false}
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
                      <TableCell key={columnTable.id}>
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
                  ) : systemData?.value?.glreport?.length > 0 ? (
                    systemData?.value?.glreport?.map((row, index) => (
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
                      <TableCell
                        colSpan={headerColumn.length}
                        align="center"
                        sx={{ position: "sticky" }}
                      >
                        <Typography variant="h6">
                          <Box sx={{ position: "sticky" }}>
                            {info.system_no_data}
                          </Box>
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
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={onExport}
              disabled={!hasData || isSystemloading || isSystemFetching}
              startIcon={<IosShareRounded />}
            >
              {info.button.exportButton.label}
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={systemData?.value?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              { label: "All", value: systemData?.value?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
}

export default SystemPage;



// import React, { useEffect, useRef, useState } from "react";
// import "../styles/SystemsPage.scss";
// import {
//   Box,
//   Divider,
//   IconButton,
//   InputBase,
//   Menu,
//   MenuItem,
//   Paper,
//   Select,
//   Skeleton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TablePagination,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import { info } from "../schemas/info";

// import { ClearRounded, SearchRounded } from "@mui/icons-material";
// // import Date from "./Date";
// import {
//   useGetAllGLReportAsyncQuery,
//   useLazyGetAllGLReportAsyncQuery,
// } from "../features/api/importReportApi";
// import useDebounce from "../components/useDebounce";
// import FilterComponent from "../components/FilterComponent";
// import dayjs from "dayjs";
// import moment from "moment";
// import { useLazyGetAllSystemsAsyncQuery } from "../features/api/systemApi";
// import { Outlet } from "react-router-dom";

// function SystemPage() {
//   const currentDate = dayjs();
//   const [reportData, setReportData] = useState({
//     DateFrom: moment(currentDate).format("YYYY-MM-DD"),
//     DateTo: moment(currentDate).format("YYYY-MM-DD"),
//   }); // State to hold fetched data
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [expanded, setExpanded] = useState(false);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(0);
//   const [selectedSystem, setSelectedSystem] = useState(""); // State for selected system

//   const [pageSize, setPageSize] = useState(25);
//   const inputRef = useRef(null); // Create a ref for InputBase
//   const debounceValue = useDebounce(search);
//   const headerColumn = info.report_import_table_columns.map((col) => ({
//     ...col,
//     width: col.width || "auto", // Set default width if not defined
//   }));

//   // Lazy query to fetch systems
//   const [getSystems, { data: systemsData, isLoading: isSystemsLoading }] =
//     useLazyGetAllSystemsAsyncQuery();

//   // Fetch systems on component mount
//   useEffect(() => {
//     getSystems(); // Fetch systems
//   }, [getSystems]);

//   const {
//     data: systemData,
//     isLoading: isSystemloading,
//     isFetching: isSystemFetching,
//   } = useGetAllGLReportAsyncQuery({
//     Search: debounceValue,
//     PageNumber: page + 1,
//     PageSize: pageSize,
//     System: selectedSystem,
//     Month: reportData.Month,
//     Year: reportData.Year,
//   });

//   console.log("systemData", systemData);

//   // SEARCH
//   const handleSearchClick = () => {
//     setExpanded(true); // Expand the box
//     inputRef.current?.focus(); // Immediately focus the input field
//   };

//   // Function to handle data fetched from the Date component
//   const handleFetchData = (data) => {
//     console.log("DATAAA", data);
//     console.log("Received DateFrom:", data.dateFrom, "DateTo:", data.dateTo); // Debugging
//     setReportData(data);
//   };
//   const handlePopOverClose = () => {
//     setAnchorEl(null);
//   };
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     const selectedValue = parseInt(event.target.value, 10);
//     setPageSize(selectedValue); // Directly set the selected value
//     setPage(0); // Reset to first page
//   };

//   // Handle system selection
//   const handleSystemChange = (event) => {
//     setSelectedSystem(event.target.value);
//   };
//   return (
//     <>
//       <Outlet />
//       <Box className="systems">
//         <Box className="systems__header">
//           <Box className="systems__header__container1">
//             {/* Dropdown to select system */}
//             <Select
//               sx={{ borderRadius: "10px" }}
//               //color="primary"
//               variant="outlined"
//               value={selectedSystem}
//               onChange={handleSystemChange}
//               displayEmpty
//               inputProps={{ "aria-label": "Select System" }}
//               className="systems__header__container1--dropdown"
//             >
//               <MenuItem value="" disabled>
//                 Select a System
//               </MenuItem>
//               {systemsData?.result.map((system) => (
//                 <MenuItem key={system.id} value={system.systemName}>
//                   {system.systemName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </Box>
//           <Box className="systems__header__container2">
//             <Box className="masterlist__header__con2--date-picker">
//               <FilterComponent color="primary" setReportData={setReportData} />
//             </Box>
//           </Box>
//         </Box>

//         <Box className="systems__content">
//           <Box className="systems__content__table">
//             <TableContainer
//               component={Paper}
//               sx={{ overflow: "auto", height: "100%" }}
//             >
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     {headerColumn.map((columnTable) => (
//                       <TableCell
//                         key={columnTable.id}
//                         sx={{
//                           whiteSpace:
//                             columnTable.id === "itemDescription"
//                               ? "nowrap!important"
//                               : "normal",
//                         }}
//                       >
//                         {columnTable.name}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {isSystemFetching || isSystemloading ? (
//                     Array.from({ length: pageSize }).map((_, index) => (
//                       <TableRow key={index}>
//                         {headerColumn.map((col) => (
//                           <TableCell key={col.id}>
//                             <Skeleton
//                               variant="text"
//                               animation="wave"
//                               height={100}
//                             />
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ))
//                   ) : systemData?.reports?.length > 0 ? (
//                     systemData?.reports?.map((row, index) => (
//                       <TableRow key={index}>
//                         {headerColumn.map((col) => (
//                           <TableCell key={col.id}>
//                             {" "}
//                             {row[col.id] ? row[col.id] : "—"}
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={headerColumn.length} align="center">
//                         <Typography variant="h6">
//                           {info.system_no_data}
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Box>

//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={handlePopOverClose}
//         >
//           <Box></Box>
//           <Date onFetchData={handleFetchData} />
//         </Menu>
//         <Box className="systems__footer">
//           <TablePagination
//             component="div"
//             count={systemData?.totalCount || 0}
//             page={page}
//             rowsPerPage={pageSize}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             rowsPerPageOptions={[
//               25,
//               50,
//               100,
//               { label: "All", value: systemData?.totalCount || 0 },
//             ]}
//           />
//         </Box>
//       </Box>
//     </>
//   );
// }

// export default SystemPage;
