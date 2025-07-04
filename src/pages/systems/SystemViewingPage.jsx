/* eslint-disable react/prop-types */
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import "../../styles/systems/SystemViewingPage.scss";
import CommonTable from "../../components/CommonTable";
import { info } from "../../schemas/info";
import {
  useGenerateGLReportPageQuery,
  useLazyGenerateGLReportPageQuery,
} from "../../features/api/reportApi";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import moment from "moment";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import useExportData from "../../components/hooks/useExportData";
import AccessPermission from "../../components/AccessPermission";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import NotFound from "../../pages/NotFound";

const SystemViewingPage = () => {
  const params = useParams();
  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();

  const location = useLocation();
  const { date } = location?.state || {};

  // Get permissions from session storage (same pattern as AccessPermission component)
  const user = JSON.parse(sessionStorage.getItem("user"));
  const permissions = user?.permission || [];

  // Validate book permission
  const validateBookPermission = () => {
    // If no book is selected, just check system permission (handled by AccessPermission wrapper)
    if (!currentParams?.book) {
      return true;
    }

    // Check if the full permission (SYSTEMNAME - BOOKNAME) exists
    const fullPermission = `${params.to} - ${currentParams.book}`;

    return permissions.includes(fullPermission);
  };

  const hasValidBookPermission = validateBookPermission();

  // Get initial date from query params, location state, or current date
  const getInitialDate = () => {
    // Use fromMonth from currentParams if available
    if (currentParams?.fromMonth) {
      const parsedDate = moment(currentParams.fromMonth, info.dateFormat);
      return parsedDate.isValid() ? parsedDate : moment();
    }

    if (currentParams?.date) {
      const parsedDate = moment(currentParams.date);
      return parsedDate.isValid() ? parsedDate : moment();
    }
    if (date) {
      const parsedDate = moment(date);
      return parsedDate.isValid() ? parsedDate : moment();
    }

    return moment();
  };

  const initialDate = getInitialDate();
  const [param, setParam] = useState({
    page: 0,
    PageSize: 25,
    PageNumber: 1,
  });

  // Initialize reportData with proper moment formatting
  const [reportData, setReportData] = useState({
    fromMonth: initialDate.clone().startOf("month").format(info.dateFormat),
    toMonth: initialDate.clone().endOf("month").format(info.dateFormat),
    System: params.to,
  });

  // Update reportData when query params change
  useEffect(() => {
    if (currentParams?.fromMonth && currentParams?.toMonth) {
      const newFromDate = moment(currentParams.fromMonth, info.dateFormat);
      const newToDate = moment(currentParams.toMonth, info.dateFormat);

      if (newFromDate.isValid() && newToDate.isValid()) {
        setReportData((prev) => ({
          ...prev,
          fromMonth: currentParams.fromMonth,
          toMonth: currentParams.toMonth,
        }));
      }
    } else if (currentParams?.date && moment(currentParams.date).isValid()) {
      const newDate = moment(currentParams.date);
      setReportData((prev) => ({
        ...prev,
        fromMonth: newDate.clone().startOf("month").format(info.dateFormat),
        toMonth: newDate.clone().endOf("month").format(info.dateFormat),
      }));
    }
  }, [currentParams?.fromMonth, currentParams?.toMonth, currentParams?.date]);

  const header = info.report_import_table_columns;
  const dataKeys = Object.values(info.custom_header);
  const headers = Object.keys(info.custom_header);

  // Get books from permissions based on current system
  const getAvailableBooksFromPermissions = () => {
    const currentSystemName = params.to;
    const systemBooks = [];

    permissions.forEach((permission) => {
      // Check if permission starts with current system name followed by " - "
      if (permission.startsWith(currentSystemName + " - ")) {
        // Extract the book name (everything after "SYSTEMNAME - ")
        const bookName = permission.substring(currentSystemName.length + 3);
        // Only add if there's actually a book name (not just the system name)
        if (bookName.trim()) {
          systemBooks.push({
            bookName: bookName,
            bookValue: bookName, // Use book name as value
            fullPermission: permission,
          });
        }
      }
    });

    return systemBooks;
  };

  const availableBooks = getAvailableBooksFromPermissions();

  // Build book name - handle case where book might be undefined
  const bookName = currentParams?.book
    ? `${params.to} - ${currentParams.book}`
    : params.to;

  const {
    data: systemData,
    isLoading: isSystemloading,
    isFetching: isSystemFetching,
  } = useGenerateGLReportPageQuery({
    PageNumber: param.page + 1,
    PageSize: param.PageSize,
    UsePagination: true,
    System: params.to,
    BookName: bookName || "", // Handle undefined book
    FromMonth: reportData.fromMonth,
    ToMonth: reportData.toMonth,
  });

  const rows = systemData?.value?.glreport;
  const data = systemData;

  // Handle book selection change - FIX: Use retain: true to keep existing query params
  const handleBookChange = (event) => {
    const selectedBookValue = event.target.value;

    if (selectedBookValue === "") {
      // If empty value selected, remove book from query params
      removeQueryParams(["book"]);
    } else {
      // FIXED: Use retain: true to keep existing date params
      setQueryParams(
        {
          book: selectedBookValue,
        },
        { retain: true }
      );
    }
  };

  // Get current selected book value for the dropdown
  const getCurrentBookValue = () => {
    return currentParams?.book || "";
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setParam((currentValue) => ({
      ...currentValue,
      page: newPage,
      PageNumber: newPage + 1,
    }));
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setParam((currentValue) => ({
      ...currentValue,
      PageSize: newPageSize,
      page: 0,
      PageNumber: 1,
    }));
  };

  const { exportImportSystem } = useExportData();
  const [
    fetchExportData,
    { isLoading: isExportLoading, isFetching: isExportFetching },
  ] = useLazyGenerateGLReportPageQuery();

  const hasData = systemData?.value?.glreport?.length > 0;

  const onExport = async () => {
    if (isSystemloading || isSystemFetching) {
      return;
    }
    toast.info("Export started");
    try {
      const exportData = await fetchExportData({
        UsePagination: false,
        System: params.to,
        BookName: bookName,
        FromMonth: reportData.fromMonth,
        ToMonth: reportData.toMonth,
      }).unwrap();

      const exportSuccess = await exportImportSystem(
        headers,
        dataKeys,
        exportData.value.glreport,
        reportData,
        params.to,
        currentParams?.book
      );

      if (exportSuccess) {
        toast.success("Export completed successfully");
      } else {
        toast.error("Export process failed");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <AccessPermission permission={params.to.toUpperCase()}>
        {/* Check book permission if book is selected */}
        {!hasValidBookPermission ? (
          <NotFound />
        ) : (
          <Box className="viewer">
            <Box className="viewer__header">
              <Box className="viewer__header__container">
                <Typography
                  variant="h5"
                  className="Viewer__header__container--title"
                >
                  {params.to}
                </Typography>
              </Box>
              <Box className="viewer__header__container">
                <Select
                  variant="standard"
                  value={getCurrentBookValue()}
                  onChange={handleBookChange}
                  displayEmpty
                  inputProps={{ "aria-label": "Select Book" }}
                  sx={{ minWidth: 200, ml: 2 }}
                  renderValue={(selected) => {
                    if (!selected) return "Select Book";
                    return selected;
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
                    Select Book
                  </MenuItem>

                  {availableBooks.length > 0 ? (
                    availableBooks.map((book, index) => (
                      <MenuItem key={index} value={book.bookValue}>
                        {book.bookName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No books found for {params.to}</MenuItem>
                  )}
                </Select>
                <DateSearchCompoment
                  setReportData={setReportData}
                  initialDate={initialDate} // Pass single initialDate prop
                  hasDate={true}
                  updateQueryParams={true} // Enable query parameter updates
                />
              </Box>
            </Box>
            <Box className="viewer__content">
              <CommonTable
                header={header}
                data={data}
                rows={rows}
                page={param.page}
                rowsPerPage={param.PageSize}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                isFetching={isSystemFetching}
                isLoading={isSystemloading}
                exportFetching={isExportFetching}
                exportLoading={isExportLoading}
                hasData={hasData}
                onExport={onExport}
              />
            </Box>
          </Box>
        )}
      </AccessPermission>
    </>
  );
};

export default SystemViewingPage;
