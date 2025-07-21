/* eslint-disable react/prop-types */
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Chip,
} from "@mui/material";
import React from "react";
import { Circle, IosShareRounded } from "@mui/icons-material";
import { info } from "../../../schemas/info";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { grey } from "@mui/material/colors";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";

const SystemTable = ({
  header,
  data,
  rows,
  hasData,
  isFetching,
  isLoading,
  exportFetching,
  exportLoading,
  onExport,
}) => {
  const navigate = useNavigate();
  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();

  const totalCount = data?.value?.totalCount || 0;

  const renderCellContent = (row, columnId) => {
    const bookName = row?.boa;

   

    // Map column IDs to month names for comparison
    const monthColumns = {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December",
    };

    const isMonth = monthColumns.hasOwnProperty(columnId);

    // Handle system status column
    if (columnId === "status") {
      // Use the transformed status value (based on systemConfig.status, not sync data)
      const statusValue = row.status;
      const isActive = statusValue === "Active";
      return (
        <Chip
          label={statusValue}
          color={isActive ? "success" : "error"}
          variant="filled"
          size="small"
        />
      );
    }

    if (isMonth) {
      const monthName = monthColumns[columnId];
      const dateSelected = `${monthName}/${moment(
        currentParams?.fromMonth
      ).format("YYYY")}`;

      const fromMonth = moment(dateSelected)
        .startOf("month")
        .format(info.dateFormat);
      const toMonth = moment(dateSelected)
        .endOf("month")
        .format(info.dateFormat);

      // Get the month data from the transformed row data
      const monthValue = row[columnId];

      // Determine status based on the transformed data
      let status = 0;
      let syncDate = null;
      let tooltipContent = "Not imported";

      if (monthValue && monthValue !== "Not Synced") {
        status = 1;
        // Check if it's a date string or just "Synced"
        if (monthValue !== "Synced") {
          syncDate = monthValue;
          const formattedSyncDate = moment(syncDate).format(
            "YYYY-MM-DD hh:mm:ss A"
          );
          tooltipContent = `Imported on: ${formattedSyncDate}`;
        } else {
          tooltipContent = "Imported (No sync date available)";
        }
      }

      // Create navigation URL
      const navigationUrl = `/system/${
        row.system
      }?fromMonth=${fromMonth}&toMonth=${toMonth}&book=${encodeURIComponent(
        bookName
      )}`;

      return (
        <Tooltip title={tooltipContent} arrow placement="top">
          <IconButton
            size="small"
            onClick={() =>
              navigate(navigationUrl, {
                state: { date: monthName },
              })
            }
          >
            <Circle
              fontSize={"inherit"}
              sx={{
                color: status === 1 ? "green" : grey[200],
              }}
            />
          </IconButton>
        </Tooltip>
      );
    }

    // For non-month columns, return the original value or a disabled circle
    return row[columnId] ? row[columnId] : <Circle color="disabled" />;
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ overflow: "auto", height: "100%" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {header?.map((column) => (
                <TableCell align="center" key={column.id}>
                  {column.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching || isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <TableRow key={index}>
                  {header.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton variant="text" animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows?.length > 0 ? (
              rows?.map((row, index) => (
                <TableRow key={index}>
                  {header.map((col) => (
                    <TableCell
                      key={col.id}
                      align={["boa"].includes(col.id) ? "left" : "center"}
                    >
                      {renderCellContent(row, col.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={header.length}
                  align="center"
                  sx={{ position: "sticky" }}
                >
                  <Typography variant="h6">
                    <Box sx={{ position: "sticky" }}>{info.system_no_data}</Box>
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "8px",
        }}
      >
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={onExport}
            disabled={!hasData || exportFetching || exportLoading}
            startIcon={
              exportFetching || exportLoading ? (
                <CircularProgress size={20} />
              ) : (
                <IosShareRounded />
              )
            }
          >
            {exportFetching || exportLoading
              ? info.download.exporting
              : info.download.export}
          </Button>
        </Box>
        <Typography variant="subtitle1" fontWeight={600}>
          Total BOA: {totalCount}
        </Typography>
      </Box>
    </>
  );
};

export default SystemTable;
