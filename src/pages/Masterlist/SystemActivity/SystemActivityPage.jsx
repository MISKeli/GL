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

const SystemActivityPage = () => {
  const [param, setParam] = useState({
    page: 0,
    PageSize: 25,
    PageNumber: 1,
  });

  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();

  const {
    data: monitorData,
    isLoading: isMonitorLoading,
    isFetching: isMonitorFetching,
  } = useGenerateImportedSystemsQuery({
    Year: moment(currentParams.toMonth).format("YYYY"),
    UsePagination: true,
  });


  const mergedRows = useMemo(() => {
    if (!monitorData?.value) return [];

    const { data: importedData = [], system: allSystems = [] } =
      monitorData.value;

    // Helper function to normalize system names to uppercase
    const normalizeSystemName = (name) => name.toUpperCase().trim();

    // Create default month structure with status 0
    const createDefaultMonths = () => {
      const months = {};
      const monthNames = moment.months().map(m => m.toLowerCase());
    

      monthNames.forEach((month) => {
        months[month] = {
          status: 0,
          syncDate: null,
        };
      });

      return months;
    };

    // Create merged dataset
    const mergedData = [];

    // Process all available systems
    allSystems.forEach((systemConfig) => {
      // Find all imported entries for this system-book combination (case-insensitive)
      const matchingImportedEntries = importedData.filter(
        (item) =>
          normalizeSystemName(item.system) ===
            normalizeSystemName(systemConfig.system) &&
          item.bookName.includes(systemConfig.bookName)
      );

      if (matchingImportedEntries.length > 0) {
        // Add all matching imported entries with normalized system name and system config
        matchingImportedEntries.forEach((entry) => {
          mergedData.push({
            ...entry,
            system: systemConfig.system, // Use the uppercase system name from config
            systemStatus: systemConfig.status,
            closeDate: systemConfig.closeDate,
            bookValue: systemConfig.bookValue,
          });
        });
      } else {
        // Create a default entry for systems without imported data
        const defaultEntry = {
          system: systemConfig.system, // Already uppercase from system config
          bookName: systemConfig.bookName,
          boa: systemConfig.bookName,
          systemStatus: systemConfig.status,
          closeDate: systemConfig.closeDate,
          bookValue: systemConfig.bookValue,
          ...createDefaultMonths(),
        };
        mergedData.push(defaultEntry);
      }
    });

    // Add any imported data that doesn't match system config (with normalized system name)
    importedData.forEach((item) => {
      const hasMatchingSystemConfig = allSystems.some(
        (config) =>
          normalizeSystemName(config.system) ===
            normalizeSystemName(item.system) &&
          item.bookName.includes(config.bookName)
      );

      if (!hasMatchingSystemConfig) {
        mergedData.push({
          ...item,
          system: normalizeSystemName(item.system), // Normalize to uppercase
        });
      }
    });

    return mergedData;
  }, [monitorData]);


  const header = info.monitoring.tableColumns;

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

  return (
    <>
      <Box className="activity">
        <Box className="activity__header">
          <Typography variant="h5" className="activity__header--title">
            {info.monitoring.title}
          </Typography>

          <DateSearchCompoment
            initialDate={currentParams.fromMonth}
            setReportData={(data) => {
              setQueryParams(
                {
                  fromMonth: data.fromMonth,
                  toMonth: data.toMonth,
                },
                { retain: true }
              );
            }}
            hasDate={false}
            isYearOnly={true}
          />
        </Box>
        <Box className="activity__content">
          <SystemTable
            header={header}
            data={{
              ...monitorData,
              value: {
                ...monitorData?.value,
                data: mergedRows,
                totalCount: mergedRows.length,
              },
              fromMonth: currentParams.fromMonth,
              toMonth: currentParams.toMonth,
            }}
            rows={mergedRows}
            page={param.page}
            rowsPerPage={param.PageSize}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            isFetching={isMonitorFetching}
            isLoading={isMonitorLoading}
          />
        </Box>
        <Box className="activity__footer"></Box>
      </Box>
    </>
  );
};

export default SystemActivityPage;
