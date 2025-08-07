/* eslint-disable react/prop-types */
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useEffect, useState } from "react";
import moment from "moment";
import TrialBalancePage from "./TrialBalancePage";
import DetailedTrailBalancePage from "./DetailedTrailBalancePage";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import { info } from "../../schemas/info";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";

const TrialBalanceDropDownPage = () => {
  const [queryParams, setQueryParams] =
    useRememberQueryParams();

  // Initialize dates from URL params or use defaults
  const getInitialFromMonth = () => {
    if (queryParams.fromMonth) {
      return queryParams.fromMonth;
    }
    return moment().startOf("month").format("MM-DD-YYYY").toString();
  };

  const getInitialToMonth = () => {
    if (queryParams.toMonth) {
      return queryParams.toMonth;
    }
    return moment().endOf("month").format("MM-DD-YYYY").toString();
  };

  // State for date search data - initialize from URL params
  const [reportData, setReportData] = useState({
    fromMonth: getInitialFromMonth(),
    toMonth: getInitialToMonth(),
  });

  const handleQueryParamsChange = (newParams) => {
    setQueryParams(newParams, { retain: true });
  };

  const handlePageChange = (event) => {
    handleQueryParamsChange({ type: event.target.value });
  };

  // Handle report data change for trial balance
  const handleReportDataChange = (newReportData) => {
    // Ensure consistent date format
    const formattedReportData = {
      fromMonth: newReportData.fromMonth || newReportData.FromMonth,
      toMonth: newReportData.toMonth || newReportData.ToMonth,
    };

    setReportData(formattedReportData);

    // Update URL params to retain dates
    handleQueryParamsChange({
      fromMonth: formattedReportData.fromMonth,
      toMonth: formattedReportData.toMonth,
    });
  };

  // Handle report date change for detailed trial balance
  const handleReportDateChange = (newReportData) => {

    // For detailed view, we might only have fromMonth
    const formattedReportData = {
      fromMonth: newReportData.fromMonth || newReportData.FromMonth,
      toMonth:
        newReportData.toMonth ||
        newReportData.ToMonth ||
        newReportData.fromMonth ||
        newReportData.FromMonth,
    };

    setReportData(formattedReportData);

    // Update URL params to retain dates
    handleQueryParamsChange({
      fromMonth: formattedReportData.fromMonth,
      toMonth: formattedReportData.toMonth,
    });
  };

  // Initialize component state from URL params
  useEffect(() => {
    if (!queryParams.type) {
      setQueryParams({ type: "trial" }, { retain: true });
    }

    // Update reportData if URL params have dates
    if (queryParams.fromMonth || queryParams.toMonth) {
      setReportData((prev) => ({
        fromMonth: queryParams.fromMonth || prev.fromMonth,
        toMonth: queryParams.toMonth || prev.toMonth,
      }));
    }
  }, []); // Run only on mount

  // Update URL when reportData changes (but prevent infinite loops)
  useEffect(() => {
    if (reportData.fromMonth && reportData.toMonth) {
      const currentFromMonth = queryParams.fromMonth;
      const currentToMonth = queryParams.toMonth;

      if (
        currentFromMonth !== reportData.fromMonth ||
        currentToMonth !== reportData.toMonth
      ) {
        handleQueryParamsChange({
          fromMonth: reportData.fromMonth,
          toMonth: reportData.toMonth,
        });
      }
    }
  }, [reportData.fromMonth, reportData.toMonth]);

  const renderDateSearchComponent = () => {
    switch (queryParams.type) {
      case "trial":
        return (
          <DateSearchCompoment
            setReportData={handleReportDataChange}
            isTrailBalance={true}
            updateQueryParams={true} // We handle URL updates manually
            dateKey="toMonth"
            // Pass current reportData to sync
            initialFromDate={ "12-01-2024"}
            initialToDate={moment(reportData.toMonth, "MM-DD-YYYY")}
          />
        );
      case "detailed":
        return (
          <DateSearchCompoment
            setReportData={handleReportDateChange}
            hasDetailed={true}
            hasDate={false}
            updateQueryParams={false} // We handle URL updates manually
            // Pass current date to sync with the component
            initialDate={moment(reportData.fromMonth, "MM-DD-YYYY")}
          />
        );
      default:
        return (
          <DateSearchCompoment
            setReportData={handleReportDataChange}
            isTrailBalance={true}
            updateQueryParams={true} // We handle URL updates manually
            dateKey="toMonth"
            initialFromDate={moment(queryParams.fromMonth, "MM-DD-YYYY")}
            initialToDate={moment(queryParams.toMonth, "MM-DD-YYYY")}
            initialDate={moment(queryParams.toMonth, "MM-DD-YYYY")}
          />
        );
    }
  };

  const renderSelectedPage = () => {
    // Ensure consistent format for child components
    const formattedReportData = {
      fromMonth: reportData.fromMonth,
      toMonth: reportData.toMonth,
      // Also provide legacy format if needed
      FromMonth: reportData.fromMonth,
      ToMonth: reportData.toMonth,
    };

    switch (queryParams.type) {
      case "trial":
        return (
          <TrialBalancePage
            reportData={formattedReportData}
            onReportDataChange={handleReportDataChange}
          />
        );
      case "detailed":
        return (
          <DetailedTrailBalancePage
            reportData={formattedReportData}
            onReportDataChange={handleReportDateChange}
          />
        );
      default:
        return (
          <TrialBalancePage
            reportData={formattedReportData}
            onReportDataChange={handleReportDataChange}
          />
        );
    }
  };

  return (
    <>
      <Box className="dropdown">
        <Box className="dropdown__container">
          <FormControl variant="standard" sx={{ minWidth: 250, mb: 2 }}>
            <InputLabel id="trial-balance-selector-label">
              Select Trial Balance Type
            </InputLabel>
            <Select
              labelId="trial-balance-selector-label"
              id="trial-balance-selector"
              value={queryParams.type || "trial"}
              onChange={handlePageChange}
              label="Select Trial Balance Type"
            >
              <MenuItem value="trial">{info.trialbalance_title}</MenuItem>
              <MenuItem value="detailed">
                {info.detailed_trialbalance_title}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Conditionally render DateSearchComponent based on selected type */}
          {renderDateSearchComponent()}
        </Box>

        <Box className="dropdown__table">{renderSelectedPage()}</Box>
      </Box>
    </>
  );
};

export default TrialBalanceDropDownPage;
