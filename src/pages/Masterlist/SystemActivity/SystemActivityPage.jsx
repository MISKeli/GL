/* eslint-disable react/prop-types */
import React, { useState, useMemo } from "react";
import { useGenerateImportedSystemsQuery } from "../../../features/api/folderStructureApi";
import { Box, Typography } from "@mui/material";
import "../../../styles/SystemActivity/SystemActivityPage.scss";
import SystemTable from "./SystemTable";
import { info } from "../../../schemas/info";
import DateSearchCompoment from "../../../components/DateSearchCompoment";
import moment from "moment";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useExportData from "../../../components/hooks/useExportData";
import { toast } from "sonner";

const SystemActivityPage = () => {
  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();
  const [searchQuery, setSearchQuery] = useState(""); // Add search state

  const {
    data: monitorData,
    isLoading: isMonitorLoading,
    isFetching: isMonitorFetching,
  } = useGenerateImportedSystemsQuery({
    Year: moment(currentParams.toMonth).format("YYYY"),
    UsePagination: false,
  });

  const { commonExport } = useExportData();

  const mergedRows = useMemo(() => {
    if (!monitorData?.value) return [];

    const { data: importedData = [], system: allSystems = [] } =
      monitorData.value;

    const normalizeSystemName = (name) => name.toUpperCase().trim();

    const createDefaultMonthlyStatus = () => {
      return Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        status: 0,
        syncDate: null,
      }));
    };

    // Helper function to convert monthlyStatus array to month columns
    const convertMonthlyStatusToColumns = (monthlyStatus) => {
      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];

      const monthColumns = {};
      months.forEach((month, index) => {
        const monthData = monthlyStatus[index];
        if (monthData?.syncDate) {
          // Format the date nicely
          monthColumns[month] = new Date(
            monthData.syncDate
          ).toLocaleDateString();
        } else if (monthData?.status === 1) {
          monthColumns[month] = "Synced";
        } else {
          monthColumns[month] = "Not Synced";
        }
      });

      return monthColumns;
    };

    const mergedData = [];

    allSystems.forEach((systemConfig) => {
      const matchingImportedEntries = importedData.filter(
        (item) =>
          normalizeSystemName(item.system) ===
            normalizeSystemName(systemConfig.system) &&
          item.boa === systemConfig.bookName
      );

      if (matchingImportedEntries.length > 0) {
        matchingImportedEntries.forEach((entry) => {
          const monthlyStatus =
            entry.monthlyStatus || createDefaultMonthlyStatus();
          const monthColumns = convertMonthlyStatusToColumns(monthlyStatus);

          const transformedEntry = {
            system: systemConfig.system,
            boa: systemConfig.bookName,
            status: systemConfig.status ? "Active" : "Inactive",
            ...monthColumns, // Spread the month columns
            systemStatus: systemConfig.status,
          };
          mergedData.push(transformedEntry);
        });
      } else {
        const defaultMonthColumns = convertMonthlyStatusToColumns(
          createDefaultMonthlyStatus()
        );
        const defaultEntry = {
          system: systemConfig.system,
          boa: systemConfig.bookName,
          status: systemConfig.status ? "Active" : "Inactive",
          ...defaultMonthColumns,
        };
        mergedData.push(defaultEntry);
      }
    });

    return mergedData;
  }, [monitorData]);

  // Filter the merged rows based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return mergedRows;
    }

    const query = searchQuery.toLowerCase().trim();

    return mergedRows.filter((row) => {
      // Search in BOA (Book of Accounts), System, and Status
      const boa = row.boa?.toLowerCase() || "";
      const system = row.system?.toLowerCase() || "";
      const status = row.status?.toLowerCase() || "";

      return (
        boa.includes(query) || system.includes(query) || status.includes(query)
      );
    });
  }, [mergedRows, searchQuery]);

  const header = info.monitoring.tableColumns;
  const hasData = filteredRows.length > 0;

  const onExport = () => {
    if (isMonitorLoading || isMonitorFetching) {
      return;
    }

    toast.info("Export started");
    try {
      const headers = info.monitoring.tableColumns.map((col) => col.name);

      // Use filtered data for export
      const mappedData = filteredRows.map((row) => {
        const mappedRow = {};

        // Map each header to the corresponding data field
        info.monitoring.tableColumns.forEach((column) => {
          mappedRow[column.name] = row[column.id];
        });

        return mappedRow;
      });

      const exportTitle = searchQuery.trim()
        ? `${info.monitoring.title} - ${moment(currentParams.toMonth).format(
            "YYYY"
          )} - Search: ${searchQuery}`
        : `${info.monitoring.title} - ${moment(currentParams.toMonth).format(
            "YYYY"
          )}`;

      commonExport(headers, mappedData, exportTitle);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  // Handle search from DateSearchComponent
  const handleSearchChange = (searchValue) => {
    setSearchQuery(searchValue);
  };

  // Handle date/year changes from DateSearchComponent
  const handleDateChange = (data) => {
    setQueryParams(
      {
        fromMonth: data.fromMonth,
        toMonth: data.toMonth,
      },
      { retain: true }
    );
  };

  return (
    <>
      <Box className="activity">
        <Box className="activity__header">
          <Typography variant="h5" className="activity__header--title">
            {info.monitoring.title}
          </Typography>
          <Box className="activity__header__container">
            {searchQuery && (
              <Typography variant="body2" color="textSecondary">
                Showing {filteredRows.length} of {mergedRows.length} results for
                "{searchQuery}"
              </Typography>
            )}

            <DateSearchCompoment
              initialDate={currentParams.fromMonth}
              setReportData={handleDateChange}
              hasDate={false}
              hasImport={false}
              hasDetailed={false}
              isYearOnly={true}
              hasViewChange={false}
              updateQueryParams={false}
              onSearchChange={handleSearchChange}
              searchValue={searchQuery}
            />
          </Box>
        </Box>
        <Box className="activity__content">
          <SystemTable
            header={header}
            data={{
              ...monitorData,
              value: {
                ...monitorData?.value,
                data: filteredRows, // Use filtered data
                totalCount: filteredRows.length, // Update count
              },
              fromMonth: currentParams.fromMonth,
              toMonth: currentParams.toMonth,
            }}
            rows={filteredRows} // Use filtered rows
            isFetching={isMonitorFetching}
            isLoading={isMonitorLoading}
            onExport={onExport}
            hasData={hasData}
            searchQuery={searchQuery} // Pass search query to table if needed
          />
        </Box>
        <Box className="activity__footer"></Box>
      </Box>
    </>
  );
};

export default SystemActivityPage;
