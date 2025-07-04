/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CircularProgress,
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
} from "@mui/material";
import React from "react";
import { info } from "../schemas/info";
import { IosShareRounded } from "@mui/icons-material";

const CommonTable = ({
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
                <TableCell key={column.id}>{column.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching || isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <TableRow key={index}>
                  {header.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton variant="text" animation="wave"  />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows?.length > 0 ? (
              rows?.map((row, index) => (
                <TableRow key={index}>
                  {header.map((col) => (
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

export default CommonTable;
