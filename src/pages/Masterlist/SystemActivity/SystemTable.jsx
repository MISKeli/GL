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
  TablePagination,
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
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
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

  const renderCellContent = (row, columnId) => {
    // Check if it's a valid month name using moment
    const bookName = row?.bookName
      ?.substring(row?.bookName?.lastIndexOf("-") + 1)
      .trim();

    const isMonth = moment(columnId, "MMMM", true).isValid();
    const dateSelected = `${columnId}/${moment(currentParams?.fromMonth).format(
      "YYYY"
    )}`;

    const fromMonth = moment(dateSelected)
      .startOf("month")
      .format(info.dateFormat);
    const toMonth = moment(dateSelected).endOf("month").format(info.dateFormat);

    // Handle system status column
    if (columnId === "systemStatus" || columnId === "status") {
      const systemStatus =
        row.systemStatus !== undefined ? row.systemStatus : row.status;
      return (
        <Chip
          label={systemStatus ? "Active" : "Inactive"}
          color={systemStatus ? "success" : "error"}
          variant="filled"
          size="small"
        />
      );
    }

    if (isMonth) {
      // Get the month data object (contains status and syncDate)
      const monthData = row[columnId];
      const status = monthData?.status || 0;
      const syncDate = monthData?.syncDate;

      // Format the sync date for tooltip
      const formattedSyncDate = syncDate
        ? moment(syncDate).format("YYYY-MM-DD hh:mm:ss A")
        : null;

      // Create tooltip content
      const tooltipContent =
        status === 1 && formattedSyncDate
          ? `Imported on: ${formattedSyncDate}`
          : status === 1 && !formattedSyncDate
          ? "Imported (No sync date available)"
          : "Not imported";

      // Create navigation URL - always use /system/ path
      const navigationUrl = `/system/${row.system}?fromMonth=${fromMonth}&toMonth=${toMonth}&book=${bookName}`;

      return (
        <Tooltip title={tooltipContent} arrow placement="top">
          <IconButton
            size="small"
            onClick={() =>
              navigate(navigationUrl, {
                state: { date: `${columnId}` },
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
                    <TableCell key={col.id} align="center">
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
        <TablePagination
          component="div"
          count={data?.value?.totalCount || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[
            25,
            50,
            100,
            { label: "All", value: data?.value?.totalCount || 0 },
          ]}
        />
      </Box>
    </>
  );
};

export default SystemTable;
