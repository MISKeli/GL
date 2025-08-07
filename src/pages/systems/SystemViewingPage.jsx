/* eslint-disable react/prop-types */
import { Box, Typography, Select, MenuItem } from "@mui/material";
import React, { useState, useEffect } from "react";
import "../../styles/systems/SystemViewingPage.scss";
import CommonTable from "../../components/CommonTable";
import { info } from "../../schemas/info";
import {
  useGenerateGLReportPageQuery,
  useLazyExportGLReportQuery,
} from "../../features/api/reportApi";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AccessPermission from "../../components/AccessPermission";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import NotFound from "../../pages/NotFound";

const SystemViewingPage = () => {
  const params = useParams();

  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();
  console.log("🚀 ~ SystemViewingPage ~ currentParams:", currentParams);

  const location = useLocation();
  const { date } = location?.state || {};

  // Get permissions from session storage (same pattern as AccessPermission component)
  const user = JSON.parse(sessionStorage.getItem("user"));
  const permissions = user?.permission || [];

  // Check if this is the "ALL" case
  const isAllCase = params.to === "ALL";

  // Validate book permission
  const validateBookPermission = () => {
    // If this is the "ALL" case, skip book validation
    if (isAllCase) {
      return true;
    }

    // If no book is selected, just check system permission (handled by AccessPermission wrapper)
    if (!currentParams?.book) {
      return true;
    }

    const currentSystemName = params.to;
    const selectedBook = currentParams.book;

    // Check if any permission in the session storage matches the selected book
    // This handles both trimmed and untrimmed book names
    const hasPermission = permissions.some((permission) => {
      // Check if permission starts with current system name followed by " - "
      if (permission.startsWith(currentSystemName + " - ")) {
        // Extract the book name from the permission
        let permissionBookName = permission.substring(
          currentSystemName.length + 3
        );

        // Trim the permission book name using the same logic as getAvailableBooksFromPermissions
        let trimmedPermissionBookName = permissionBookName;

        // Check if it starts with "GJ " and contains a "-"
        if (
          permissionBookName.startsWith("GJ ") &&
          permissionBookName.includes("-")
        ) {
          // Extract everything up to the first "-"
          const dashIndex = permissionBookName.indexOf("-");

          trimmedPermissionBookName = permissionBookName.substring(
            0,
            dashIndex
          );
        }

        // Check if the trimmed permission book name matches the selected book
        // return trimmedPermissionBookName === selectedBook; BALIK ITO ONCE OK NA SA NAMING
        return selectedBook === selectedBook;
      }

      return false;
    });

    return hasPermission;
  };

  const hasValidBookPermission = validateBookPermission();
  const hasFromAndToMonth = currentParams?.fromMonth && currentParams?.toMonth;

  // Get initial date from query params, location state, or current date
  const getInitialDate = () => {
    if (hasFromAndToMonth) {
      return {
        fromMonth: moment(currentParams.fromMonth, info.dateFormat),
        toMonth: moment(currentParams.toMonth, info.dateFormat),
      };
    }
    if (currentParams?.toMonth) {
      const parsedDate = moment(currentParams.toMonth, info.dateFormat);
      return parsedDate.isValid() ? parsedDate : moment();
    }
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
    fromMonth: hasFromAndToMonth
      ? initialDate.fromMonth
      : initialDate.clone().startOf("month").format(info.dateFormat),
    toMonth: hasFromAndToMonth
      ? initialDate.toMonth
      : initialDate.clone().endOf("month").format(info.dateFormat),
    System: isAllCase ? "" : params.to, // Set to null if "ALL"
  });

  // Update reportData when query params change
  useEffect(() => {
    if (hasFromAndToMonth) {
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

  // Get books from permissions based on current system
  const getAvailableBooksFromPermissions = () => {
    // If this is the "ALL" case, return empty array (no book selection needed)
    if (isAllCase) {
      return [];
    }

    const currentSystemName = params.to;
    const systemBooks = [];
    const seenBooks = new Set(); // Track unique book names

    permissions.forEach((permission) => {
      // Check if permission starts with current system name followed by " - "
      if (permission.startsWith(currentSystemName + " - ")) {
        // Extract the book name (everything after "SYSTEMNAME - ")
        let boaName = permission.substring(currentSystemName.length + 3);

        // Only add if there's actually a book name (not just the system name)
        if (boaName.trim()) {
          // Trim book names that follow the pattern "GJ Something-..." to just "GJ Something"
          let trimmedBookName = boaName;

          // Only add if we haven't seen this trimmed book name before
          if (!seenBooks.has(trimmedBookName)) {
            seenBooks.add(trimmedBookName);

            systemBooks.push({
              boaName: trimmedBookName,
              bookValue: trimmedBookName, // Use trimmed name as value
              fullPermission: `${currentSystemName} - ${trimmedBookName}`,
            });
          }
        }
      }
    });

    return systemBooks;
  };

  const availableBooks = getAvailableBooksFromPermissions();

  // Build book name - handle case where book might be undefined or "ALL" case
  const getBoa = () => {
    if (isAllCase) {
      return null; // Return null for "ALL" case
    }

    return currentParams?.book ? `${currentParams.book}` : params.to;
  };

  const boaName = getBoa();

  // Get system value - null for "ALL" case
  const getSystemValue = () => {
    return isAllCase ? null : params.to;
  };

  const {
    data: systemData,
    isLoading: isSystemloading,
    isFetching: isSystemFetching,
  } = useGenerateGLReportPageQuery({
    PageNumber: param.page + 1,
    PageSize: param.PageSize,
    UsePagination: true,
    System: getSystemValue(), // Pass null for "ALL" case
    Boa: boaName || "", // Pass null for "ALL" case, empty string otherwise
    FromMonth: reportData.fromMonth,
    ToMonth: reportData.toMonth,
    DrCr: currentParams?.drCr,
    AccountTitle: currentParams?.coa,
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

  const [
    fetchExportData,
    { isLoading: isExportLoading, isFetching: isExportFetching },
  ] = useLazyExportGLReportQuery();

  const hasData = systemData?.value?.glreport?.length > 0;

  const onExport = async () => {
    if (isSystemloading || isSystemFetching) {
      return;
    }

    toast.info("Export started");

    try {
      // For "ALL" case, we need to handle the API parameters differently
      const exportParams = {
        UsePagination: false,
        FromMonth: reportData.fromMonth,
        ToMonth: reportData.toMonth,
        Download: true,
      };
      console.log("🚀 ~ onExport ~ exportParams BEFORE:", exportParams);

      // Only add System and Boa if not "ALL" case
      if (!isAllCase) {
        exportParams.System = getSystemValue();
        exportParams.Boa = boaName || "";
      }
      // For "ALL" case, either omit these parameters entirely or set them to null/empty
      // depending on what your API expects

      console.log("🚀 ~ onExport ~ exportParams FINAL:", exportParams);
      console.log("🚀 ~ onExport ~ About to call fetchExportData");

      const result = await fetchExportData(exportParams).unwrap();
      console.log("🚀 ~ onExport ~ fetchExportData result:", result);
      toast.success("Export Successful.");
    } catch (err) {
      console.log("🚀 ~ onExport ~ Error:", err);
      toast.error(err.message || "Export failed");
    }
  };

  const DrCrCoaDisplay = ({ coa, drCr }) => {
    const navigate = useNavigate();

    if (!coa || !drCr) return null;

    return (
      <Box
        onClick={() =>
          navigate(
            `/trial_balance?fromMonth=${currentParams.fromMonth}&toMonth=${currentParams.toMonth}`
          )
        }
        sx={{
          cursor: "pointer",
          width: "fit-content",
          "&:hover": { opacity: 0.8 },
        }}
      >
        <Typography variant="body2" color="textSecondary">
          <Typography component="span" fontWeight="bold" color="textPrimary">
            {coa}
          </Typography>{" "}
          —{" "}
          <Typography component="span" fontWeight="medium" color="primary">
            {drCr.toUpperCase()}
          </Typography>
        </Typography>
      </Box>
    );
  };

  // MODIFIED: Custom setReportData function to update URL query params
  const handleSetReportData = (data) => {
    console.log("BK - Report Data:", data);
    console.log(
      "BK - Setting fromMonth:",
      data.fromMonth,
      "toMonth:",
      data.toMonth
    );

    setReportData(data);

    // Use setTimeout to ensure state updates are processed first
    setTimeout(() => {
      // Update URL query parameters with fromMonth and toMonth
      setQueryParams(
        {
          fromMonth: data.fromMonth,
          toMonth: data.toMonth,
        },
        { retain: true } // Keep existing query params
      );

      console.log("BK - Query params updated");
    }, 0);

    // Remove coa and drCr params as before
    removeQueryParams(["coa", "drCr"]);
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
                <DrCrCoaDisplay
                  coa={currentParams.coa}
                  drCr={currentParams.drCr}
                />
                {/* Only show book selector if not "ALL" case */}
                {!isAllCase && (
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
                      Select Boa
                    </MenuItem>

                    {availableBooks.length > 0 ? (
                      availableBooks.map((book, index) => (
                        <MenuItem key={index} value={book.bookValue}>
                          {book.boaName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No boa found for {params.to}</MenuItem>
                    )}
                  </Select>
                )}
                <DateSearchCompoment
                  setReportData={handleSetReportData} // Use the modified function
                  initialDate={initialDate} // Pass single initialDate prop
                  hasDate={true}
                  updateQueryParams={false} // Disable the component's own query param updates since we're handling it manually
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
