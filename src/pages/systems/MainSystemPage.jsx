/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
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
import React, { useState } from "react";
import { info } from "../../schemas/info";
import "../../styles/SystemsPage.scss";

import { CloudSyncRounded } from "@mui/icons-material";

import useDebounce from "../../components/useDebounce";

import moment from "moment";

import { toast } from "sonner";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import useExportData from "../../components/hooks/useExportData";
import OnExportButton from "../../components/OnExportButton";
import {
  useGenerateGLReportPageQuery,
  useLazyGenerateGLReportPageQuery,
} from "../../features/api/reportApi";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import CusImport from "../../pages/systems/CusImport";

function MainSystemPage() {
  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();

  // Get values from query params with fallbacks
  const getSelectedSystem = () => currentParams.system || "";
  const getSelectedBook = () => currentParams.book || "";
  const getPage = () => parseInt(currentParams.page || "0", 10);
  const getPageSize = () => parseInt(currentParams.pageSize || "25", 10);
  const getSearch = () => currentParams.search || "";

  // Computed values based on query params
  const selectedSystem = getSelectedSystem();
  const selectedBook = getSelectedBook();
  const bookKey = selectedBook
    ? `${selectedSystem} - ${selectedBook}`
    : selectedSystem;
  const page = getPage();
  const pageSize = getPageSize();
  const search = getSearch();

  // Get initial date from query params or use current date
  const getInitialDate = () => {
    if (currentParams.date) {
      const parsed = moment(currentParams.date);
      return parsed.isValid() ? parsed : moment();
    }
    return moment();
  };

  const initialDate = getInitialDate();

  // Computed report data from query params
  const getReportData = () => {
    const baseDate = getInitialDate();
    return {
      FromMonth: baseDate.clone().startOf("month").format(info.dateFormat),
      ToMonth: baseDate.clone().endOf("month").format(info.dateFormat),
      System: selectedSystem,
      BookName: bookKey,
    };
  };

  const reportData = getReportData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debounceValue = useDebounce(search);
  const headerColumn = info.report_import_table_columns.map((col) => ({
    ...col,
    width: col.width || "auto",
  }));

  // Get permissions from session storage (same pattern as AccessPermission component)
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userPermissions = user?.permission || [];

  // Parse permissions to get systems and books structure
  const getSystemsAndBooksFromPermissions = () => {
    const systemsMap = new Map();

    userPermissions.forEach((permission) => {
      // Skip non-system permissions
      if (info.nonSystemPermission.includes(permission)) {
        return;
      }

      // Check if it's a system-book combination (contains " - ")
      if (permission.includes(" - ")) {
        const parts = permission.split(" - ");
        const systemName = parts[0];
        const bookName = parts.slice(1).join(" - "); // Handle cases with multiple " - "

        if (!systemsMap.has(systemName)) {
          systemsMap.set(systemName, {
            systemName: systemName,
            books: [],
          });
        }

        systemsMap.get(systemName).books.push({
          bookName: bookName,
          bookValue: bookName,
          status: true,
        });
      } else {
        // It's a standalone system permission
        if (!systemsMap.has(permission)) {
          systemsMap.set(permission, {
            systemName: permission,
            books: [],
          });
        }
      }
    });

    return Array.from(systemsMap.values());
  };

  const systemsFromPermissions = getSystemsAndBooksFromPermissions();

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
    BookName: bookKey,
    FromMonth: reportData.FromMonth,
    ToMonth: reportData.ToMonth,
  });

  const customHeaders = info.custom_header;
  const dataKeys = Object.values(info.custom_header);
  const headers = Object.keys(customHeaders);

  const handleChangePage = (event, newPage) => {
    setQueryParams(
      {
        page: newPage.toString(),
      },
      { retain: true }
    );
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setQueryParams(
      {
        pageSize: selectedValue.toString(),
        page: "0", // Reset to first page when changing page size
      },
      { retain: true }
    );
  };

  // Handle system and book selection
  const handleSystemChange = (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "") {
      // "ALL" option selected - remove system and book params
      removeQueryParams(["system", "book"]);
    } else if (typeof selectedValue === "string") {
      // System name only (for backward compatibility)
      setQueryParams(
        {
          system: selectedValue,
        },
        { retain: true }
      );
      // Remove book if it exists
      removeQueryParams(["book"]);
    } else {
      // Complete system+book object selected
      setQueryParams(
        {
          system: selectedValue.systemName,
          book: selectedValue.bookName,
        },
        { retain: true }
      );
    }
  };

  // Get the selected system data for rendering
  const getSelectedSystemData = () => {
    if (!selectedSystem) return null;
    if (!selectedBook) return selectedSystem;

    // Find the system and return with book info
    const system = systemsFromPermissions.find(
      (s) => s.systemName === selectedSystem
    );
    if (system && selectedBook) {
      return {
        ...system,
        bookName: selectedBook,
        bookValue: selectedBook,
      };
    }
    return selectedSystem;
  };

  const selectedSystemData = getSelectedSystemData();

  // Function to open/close the dialog
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  const { exportImportSystem } = useExportData();
  const [fetchExportData, { isLoading, isFetching }] =
    useLazyGenerateGLReportPageQuery();

  const hasData = systemData?.value?.glreport?.length > 0;

  const onExport = async () => {
    if (isLoading || isFetching) {
      return;
    }

    toast.info("Export started");

    try {
      const exportData = await fetchExportData({
        UsePagination: false,
        System: selectedSystem,
        BookName: bookKey,
        FromMonth: reportData.FromMonth,
        ToMonth: reportData.ToMonth,
      }).unwrap();

      const exportSuccess = await exportImportSystem(
        headers,
        dataKeys,
        exportData.value.glreport,
        reportData,
        selectedSystem
      );

      if (exportSuccess) {
        toast.success("Export completed successfully");
      } else {
        toast.error("Export process failed");
      }
    } catch (err) {
      const errorMessage = err.message || "Export failed";
      toast.error(errorMessage);
    }
  };

  // Handle search input change
  const handleSearchChange = (newSearch) => {
    if (newSearch === "") {
      removeQueryParams(["search"]);
    } else {
      setQueryParams(
        {
          search: newSearch,
          page: "0", // Reset to first page when searching
        },
        { retain: true }
      );
    }
  };

  // Create setReportData function for DateSearchComponent compatibility
  const setReportData = (newReportData) => {
    // The DateSearchComponent will handle updating query params
    // This function exists for compatibility but the actual date state
    // is managed through query parameters
    return Promise.resolve();
  };

  return (
    <>
      <Box className="systems">
        <CusImport
          open={open}
          onClose={handleDialogClose}
          //inert={isDialogOpen}
        />
        <Box className="systems__header">
          <Box className="systems__header__container1">
            <Typography
              variant="h5"
              className="systems__header__container1--title"
            >
              {info.system.title}
            </Typography>

            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

            <Button
              startIcon={<CloudSyncRounded />}
              variant="contained"
              onClick={handleDialogOpen}
            >
              {info.download.sync}
            </Button>
          </Box>
          <Box className="systems__header__container2">
            {/* Enhanced Dropdown with System and Book Selection */}
            <Select
              variant="standard"
              value={selectedSystemData || selectedSystem || ""}
              onChange={handleSystemChange}
              displayEmpty
              inputProps={{ "aria-label": "Select System" }}
              className="systems__header__container1--dropdown"
              renderValue={(selected) => {
                console.log("🚀 ~ MainSystemPage ~ selected:", selected)
                if (!selected) return "Select System";
                if (selected === "") return "ALL";
                if (typeof selected === "string") return selected;
                if (selected.systemName && selected.bookName) {
                  return `${selected.systemName} - ${selected.bookName}`;
                }
                return selected.systemName || "";
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    overflow: "auto",
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                Select System
              </MenuItem>
              <MenuItem value="">ALL</MenuItem>

              {systemsFromPermissions.length > 0 ? (
                systemsFromPermissions
                  .map((system) => {
                    const books = system.books || [];

                    // If no books, show system only
                    if (books.length === 0) {
                      return (
                        <MenuItem
                          key={system.systemName}
                          value={system.systemName}
                        >
                          {system.systemName}
                        </MenuItem>
                      );
                    }

                    return [
                      // System name as a disabled header
                      <MenuItem
                        key={`system-${system.systemName}`}
                        disabled
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          "&.Mui-disabled": {
                            opacity: 1,
                            color: "rgba(0, 0, 0, 0.87)",
                          },
                        }}
                      >
                        {system.systemName}
                      </MenuItem>,

                      // Books under this system
                      ...books.map((book, bookIndex) => (
                        <MenuItem
                          key={`${system.systemName}-book-${bookIndex}`}
                          value={{
                            ...system,
                            bookName: book.bookName,
                            bookValue: book.bookValue,
                          }}
                          sx={{
                            paddingLeft: 4,
                            fontSize: "0.875rem",
                          }}
                        >
                          <span>&nbsp;&nbsp;- {book.bookName}</span>
                        </MenuItem>
                      )),
                    ];
                  })
                  .filter(Boolean)
                  .flat()
              ) : (
                <MenuItem disabled>No Systems Available</MenuItem>
              )}
            </Select>

            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

            <Box className="masterlist__header__con2--date-picker">
              <DateSearchCompoment
                color="primary"
                hasDate={true}
                setReportData={setReportData}
                initialDate={initialDate}
                updateQueryParams={true}
                onSearchChange={handleSearchChange}
                searchValue={search}
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
                        {headerColumn.map((col) => {
                          return (
                            <TableCell key={col.id}>
                              {row[col.id] === "" || row[col.id] === null
                                ? "-"
                                : col?.id === "transactionDate"
                                ? moment(new Date(row[col.id])).format(
                                    "YYYY-MM-DD"
                                  )
                                : row[col.id]}
                            </TableCell>
                          );
                        })}
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
        <Box className="systems__footer">
          <Box>
            <OnExportButton
              onExport={onExport}
              hasData={hasData}
              isLoading={isLoading}
              isFetching={isFetching}
            />
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

export default MainSystemPage;



// /* eslint-disable react/prop-types */
// import {
//   Box,
//   Button,
//   Divider,
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
// import React, { useState } from "react";
// import { info } from "../../schemas/info";
// import "../../styles/SystemsPage.scss";

// import { CloudSyncRounded } from "@mui/icons-material";

// import useDebounce from "../../components/useDebounce";

// import moment from "moment";

// import { toast } from "sonner";
// import DateSearchCompoment from "../../components/DateSearchCompoment";
// import useExportData from "../../components/hooks/useExportData";
// import OnExportButton from "../../components/OnExportButton";
// import {
//   useGenerateGLReportPageQuery,
//   useLazyGenerateGLReportPageQuery,
// } from "../../features/api/reportApi";
// import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
// import CusImport from "../../pages/systems/CusImport";

// function MainSystemPage() {
//   const [currentParams, setQueryParams, removeQueryParams] =
//     useRememberQueryParams();

//   // Get values from query params with fallbacks
//   const getSelectedSystem = () => currentParams.system || "";
//   const getSelectedBook = () => currentParams.book || "";
//   const getPage = () => parseInt(currentParams.page || "0", 10);
//   const getPageSize = () => parseInt(currentParams.pageSize || "25", 10);
//   const getSearch = () => currentParams.search || "";

//   // Computed values based on query params
//   const selectedSystem = getSelectedSystem();
//   const selectedBook = getSelectedBook();
//   const bookKey = selectedBook
//     ? `${selectedSystem} - ${selectedBook}`
//     : selectedSystem;
//   const page = getPage();
//   const pageSize = getPageSize();
//   const search = getSearch();

//   // Get initial date from query params or use current date
//   const getInitialDate = () => {
//     if (currentParams.date) {
//       const parsed = moment(currentParams.date);
//       return parsed.isValid() ? parsed : moment();
//     }
//     return moment();
//   };

//   const initialDate = getInitialDate();

//   // Computed report data from query params
//   const getReportData = () => {
//     const baseDate = getInitialDate();
//     return {
//       FromMonth: baseDate.clone().startOf("month").format(info.dateFormat),
//       ToMonth: baseDate.clone().endOf("month").format(info.dateFormat),
//       System: selectedSystem,
//       BookName: bookKey,
//     };
//   };

//   const reportData = getReportData();

//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const debounceValue = useDebounce(search);
//   const headerColumn = info.report_import_table_columns.map((col) => ({
//     ...col,
//     width: col.width || "auto",
//   }));

//   // Get permissions from session storage (same pattern as AccessPermission component)
//   const user = JSON.parse(sessionStorage.getItem("user"));
//   const userPermissions = user?.permission || [];

//   // Parse permissions to get systems and books structure
//   const getSystemsAndBooksFromPermissions = () => {
//     const systemsMap = new Map();

//     userPermissions.forEach((permission) => {
//       // Skip non-system permissions
//       if (info.nonSystemPermission.includes(permission)) {
//         return;
//       }

//       // Check if it's a system-book combination (contains " - ")
//       if (permission.includes(" - ")) {
//         const parts = permission.split(" - ");
//         const systemName = parts[0];
//         const bookName = parts.slice(1).join(" - "); // Handle cases with multiple " - "

//         if (!systemsMap.has(systemName)) {
//           systemsMap.set(systemName, {
//             systemName: systemName,
//             books: [],
//           });
//         }

//         systemsMap.get(systemName).books.push({
//           bookName: bookName,
//           bookValue: bookName,
//           status: true,
//         });
//       } else {
//         // It's a standalone system permission
//         if (!systemsMap.has(permission)) {
//           systemsMap.set(permission, {
//             systemName: permission,
//             books: [],
//           });
//         }
//       }
//     });

//     return Array.from(systemsMap.values());
//   };

//   const systemsFromPermissions = getSystemsAndBooksFromPermissions();

//   const {
//     data: systemData,
//     isLoading: isSystemloading,
//     isFetching: isSystemFetching,
//   } = useGenerateGLReportPageQuery({
//     Search: debounceValue,
//     PageNumber: page + 1,
//     PageSize: pageSize,
//     UsePagination: true,
//     System: selectedSystem,
//     BookName: bookKey,
//     FromMonth: reportData.FromMonth,
//     ToMonth: reportData.ToMonth,
//   });

//   const customHeaders = info.custom_header;
//   const dataKeys = Object.values(info.custom_header);
//   const headers = Object.keys(customHeaders);

//   const handleChangePage = (event, newPage) => {
//     setQueryParams(
//       {
//         page: newPage.toString(),
//       },
//       { retain: true }
//     );
//   };

//   const handleChangeRowsPerPage = (event) => {
//     const selectedValue = parseInt(event.target.value, 10);
//     setQueryParams(
//       {
//         pageSize: selectedValue.toString(),
//         page: "0", // Reset to first page when changing page size
//       },
//       { retain: true }
//     );
//   };

//   // Handle system and book selection
//   const handleSystemChange = (event) => {
//     const selectedValue = event.target.value;

//     if (selectedValue === "") {
//       // "ALL" option selected - remove system and book params
//       removeQueryParams(["system", "book"]);
//     } else if (typeof selectedValue === "string") {
//       // System name only (for backward compatibility)
//       setQueryParams(
//         {
//           system: selectedValue,
//         },
//         { retain: true }
//       );
//       // Remove book if it exists
//       removeQueryParams(["book"]);
//     } else {
//       // Complete system+book object selected
//       setQueryParams(
//         {
//           system: selectedValue.systemName,
//           book: selectedValue.bookName,
//         },
//         { retain: true }
//       );
//     }
//   };

//   // Get the selected system data for rendering
//   const getSelectedSystemData = () => {
//     if (!selectedSystem) return null;
//     if (!selectedBook) return selectedSystem;

//     // Find the system and return with book info
//     const system = systemsFromPermissions.find(
//       (s) => s.systemName === selectedSystem
//     );
//     if (system && selectedBook) {
//       return {
//         ...system,
//         bookName: selectedBook,
//         bookValue: selectedBook,
//       };
//     }
//     return selectedSystem;
//   };

//   const selectedSystemData = getSelectedSystemData();

//   // Function to open/close the dialog
//   const handleDialogOpen = () => setIsDialogOpen(true);
//   const handleDialogClose = () => setIsDialogOpen(false);

//   const { exportImportSystem } = useExportData();
//   const [fetchExportData, { isLoading, isFetching }] =
//     useLazyGenerateGLReportPageQuery();

//   const hasData = systemData?.value?.glreport?.length > 0;

//   const onExport = async () => {
//     if (isLoading || isFetching) {
//       return;
//     }

//     toast.info("Export started");

//     try {
//       const exportData = await fetchExportData({
//         UsePagination: false,
//         System: selectedSystem,
//         BookName: bookKey,
//         FromMonth: reportData.FromMonth,
//         ToMonth: reportData.ToMonth,
//       }).unwrap();

//       const exportSuccess = await exportImportSystem(
//         headers,
//         dataKeys,
//         exportData.value.glreport,
//         reportData,
//         selectedSystem
//       );

//       if (exportSuccess) {
//         toast.success("Export completed successfully");
//       } else {
//         toast.error("Export process failed");
//       }
//     } catch (err) {
//       const errorMessage = err.message || "Export failed";
//       toast.error(errorMessage);
//     }
//   };

//   // Handle search input change
//   const handleSearchChange = (newSearch) => {
//     if (newSearch === "") {
//       removeQueryParams(["search"]);
//     } else {
//       setQueryParams(
//         {
//           search: newSearch,
//           page: "0", // Reset to first page when searching
//         },
//         { retain: true }
//       );
//     }
//   };

//   // Create setReportData function for DateSearchComponent compatibility
//   const setReportData = (newReportData) => {
//     // The DateSearchComponent will handle updating query params
//     // This function exists for compatibility but the actual date state
//     // is managed through query parameters
//     return Promise.resolve();
//   };

//   return (
//     <>
//       <Box className="systems">
//         <CusImport
//           open={isDialogOpen}
//           onClose={handleDialogClose}
//           inert={isDialogOpen}
//         />
//         <Box className="systems__header">
//           <Box className="systems__header__container1">
//             <Typography
//               variant="h5"
//               className="systems__header__container1--title"
//             >
//               {info.system.title}
//             </Typography>

//             <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

//             <Button
//               startIcon={<CloudSyncRounded />}
//               variant="contained"
//               onClick={handleDialogOpen}
//             >
//               {info.download.sync}
//             </Button>
//           </Box>
//           <Box className="systems__header__container2">
//             {/* Enhanced Dropdown with System and Book Selection */}
//             <Select
//               variant="standard"
//               value={selectedSystemData || selectedSystem || ""}
//               onChange={handleSystemChange}
//               displayEmpty
//               inputProps={{ "aria-label": "Select System" }}
//               className="systems__header__container1--dropdown"
//               renderValue={(selected) => {
//                 console.log("🚀 ~ MainSystemPage ~ selected:", selected)
//                 if (!selected) return "Select System";
//                 if (selected === "") return "ALL";
//                 if (typeof selected === "string") return selected;
//                 if (selected.systemName && selected.bookName) {
//                   return `${selected.systemName} - ${selected.bookName}`;
//                 }
//                 return selected.systemName || "";
//               }}
//               MenuProps={{
//                 PaperProps: {
//                   sx: {
//                     maxHeight: 300,
//                     overflow: "auto",
//                   },
//                 },
//               }}
//             >
//               <MenuItem value="" disabled>
//                 Select System
//               </MenuItem>
//               <MenuItem value="">ALL</MenuItem>

//               {systemsFromPermissions.length > 0 ? (
//                 systemsFromPermissions
//                   .map((system) => {
//                     const books = system.books || [];

//                     // If no books, show system only
//                     if (books.length === 0) {
//                       return (
//                         <MenuItem
//                           key={system.systemName}
//                           value={system.systemName}
//                         >
//                           {system.systemName}
//                         </MenuItem>
//                       );
//                     }

//                     return [
//                       // System name as a disabled header
//                       <MenuItem
//                         key={`system-${system.systemName}`}
//                         disabled
//                         sx={{
//                           fontWeight: "bold",
//                           backgroundColor: "#f5f5f5",
//                           "&.Mui-disabled": {
//                             opacity: 1,
//                             color: "rgba(0, 0, 0, 0.87)",
//                           },
//                         }}
//                       >
//                         {system.systemName}
//                       </MenuItem>,

//                       // Books under this system
//                       ...books.map((book, bookIndex) => (
//                         <MenuItem
//                           key={`${system.systemName}-book-${bookIndex}`}
//                           value={{
//                             ...system,
//                             bookName: book.bookName,
//                             bookValue: book.bookValue,
//                           }}
//                           sx={{
//                             paddingLeft: 4,
//                             fontSize: "0.875rem",
//                           }}
//                         >
//                           <span>&nbsp;&nbsp;- {book.bookName}</span>
//                         </MenuItem>
//                       )),
//                     ];
//                   })
//                   .filter(Boolean)
//                   .flat()
//               ) : (
//                 <MenuItem disabled>No Systems Available</MenuItem>
//               )}
//             </Select>

//             <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

//             <Box className="masterlist__header__con2--date-picker">
//               <DateSearchCompoment
//                 color="primary"
//                 hasDate={true}
//                 setReportData={setReportData}
//                 initialDate={initialDate}
//                 updateQueryParams={true}
//                 onSearchChange={handleSearchChange}
//                 searchValue={search}
//               />
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
//                       <TableCell key={columnTable.id}>
//                         {columnTable.name}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {isSystemFetching || isSystemloading ? (
//                     Array.from({ length: 5 }).map((_, index) => (
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
//                   ) : systemData?.value?.glreport?.length > 0 ? (
//                     systemData?.value?.glreport?.map((row, index) => (
//                       <TableRow key={index}>
//                         {headerColumn.map((col) => {
//                           return (
//                             <TableCell key={col.id}>
//                               {row[col.id] === "" || row[col.id] === null
//                                 ? "-"
//                                 : col?.id === "transactionDate"
//                                 ? moment(new Date(row[col.id])).format(
//                                     "YYYY-MM-DD"
//                                   )
//                                 : row[col.id]}
//                             </TableCell>
//                           );
//                         })}
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell
//                         colSpan={headerColumn.length}
//                         align="center"
//                         sx={{ position: "sticky" }}
//                       >
//                         <Typography variant="h6">
//                           <Box sx={{ position: "sticky" }}>
//                             {info.system_no_data}
//                           </Box>
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Box>
//         <Box className="systems__footer">
//           <Box>
//             <OnExportButton
//               onExport={onExport}
//               hasData={hasData}
//               isLoading={isLoading}
//               isFetching={isFetching}
//             />
//           </Box>
//           <TablePagination
//             component="div"
//             count={systemData?.value?.totalCount || 0}
//             page={page}
//             rowsPerPage={pageSize}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             rowsPerPageOptions={[
//               25,
//               50,
//               100,
//               { label: "All", value: systemData?.value?.totalCount || 0 },
//             ]}
//           />
//         </Box>
//       </Box>
//     </>
//   );
// }

// export default MainSystemPage;
