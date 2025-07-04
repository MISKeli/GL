/* eslint-disable react/prop-types */
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { info } from "../../schemas/info";

const DataTable = ({ header, rows, isFetching, isLoading, grandTotal }) => {
  const getCellColor = (row, columnId) => {
    const colorKey = `${columnId}Color`;
    return row[colorKey] || "inherit";
  };

  // Helper function to get style for a cell
  const getCellStyle = (row, columnId) => {
    const styleKey = `${columnId}Style`;
    const colorKey = `${columnId}Color`;

    let style = {};

    // If there's a style object, use it
    if (row[styleKey]) {
      style = { ...row[styleKey] };
    }

    // If there's a color, add it to the style object
    if (row[colorKey] && row[colorKey] !== "inherit") {
      style.color = row[colorKey];
    }

    // If this is a subtotal row, make it bold
    if (row.isSubtotal) {
      style.fontWeight = "bold";
    }

    return style;
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TableContainer
        component={Paper}
        sx={{
          flex: 1,
          overflow: "auto",
          maxHeight: "100%",
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {header?.map((column) => (
                <TableCell key={column.id}>{column.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching || isLoading ? (
              Array.from({ length: 1 }).map((_, index) => (
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
                      sx={getCellStyle(row, col.id)}
                      size="small"
                    >
                      {row[col.id] ? row[col.id] : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={header.length} align="center">
                  <Typography variant="h6">{info.system_no_data}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Grand Total Row - positioned at absolute bottom of table */}
      {grandTotal && (
        <Box
          sx={{
            borderTop: "2px solid",
            borderTopColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
            position: "sticky",
            bottom: 0,
            zIndex: 1,
          }}
        >
          <Table>
            <TableBody>
              <TableRow
                sx={{
                  "& .MuiTableCell-root": {
                    fontWeight: "bold",
                    border: "none",
                    paddingTop: 2,
                    paddingBottom: 2,
                   
                  },
                }}
              >
                {header?.map((column) => (
                  <TableCell
                    key={column.id}
                    size="small"
                    sx={
                      grandTotal
                        ? {
                            ...getCellStyle(grandTotal, column.id),
                          
                          }
                        : {}
                    }
                  >
                    {grandTotal?.[column.id] || ""}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
