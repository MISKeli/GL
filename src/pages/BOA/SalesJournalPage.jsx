import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
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
import React, { useRef, useState } from "react";

import useDebounce from "../../components/useDebounce";
import { toast } from "sonner";
import { Workbook } from "exceljs";

import { IosShareRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import {
  useExportGenerateSaleJournalBookPerMonthQuery,
  useGenerateSaleJournalBookPerMonthPaginationQuery,
} from "../../features/api/boaApi";
import moment from "moment";
import { formatMonth } from "../../utils/dataFormat";
const SalesJournalPage = ({ reportData }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const headerColumn = info.sales_journal;

  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
    ToYear: reportData?.toYear || "",
    FromYear: reportData?.fromYear || "",
  };

  console.log("fill", fillParams);

  const { data: exportData, isLoading: isExportLoading } =
    useExportGenerateSaleJournalBookPerMonthQuery({
      ...fillParams,
    });

  console.log("salesbalance: ", exportData);
  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateSaleJournalBookPerMonthPaginationQuery({
    // System: reportData.System,
    ...fillParams,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  console.log("boaData", boaData);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  // for comma
  const formatNumber = (number) => {
    const isNegative = number < 0;
    const formattedNumber = Math.abs(number)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return {
      formattedNumber,
      color: isNegative ? "red" : "inherit", // Use "red" for negative numbers
    };
  };

  const salesBookTotalData = exportData?.value || [];

  const grandTotal = {
    debit: salesBookTotalData
      .reduce((sum, row) => sum + parseFloat(row.debit || 0), 0)
      .toFixed(2),
    credit: salesBookTotalData
      .reduce((sum, row) => sum + parseFloat(row.credit || 0), 0)
      .toFixed(2),
  };

  const fromMonth = formatMonth(fillParams.FromMonth);
  const toMonth = formatMonth(fillParams.ToMonth);
  const fromYear = formatMonth(fillParams.FromYear);
  const toYear = formatMonth(fillParams.ToYear);

  const onExport = async () => {
    const { value: data } = exportData || {};

    try {
      if (!data || data.length === 0) {
        throw new Error("No data available to export.");
      }
      const extraSentence = `For the month of ${fromMonth} to ${toMonth} ${reportData.Year}`;

      const processedData = data.map((item) => ({
        id: item.date,
        date: item.date,
        customerName: item.customerName,
        referenceNumber: item.referenceNumber,
        lineAmount: item.lineAmount,
        chartOfAccount: item.chartOfAccount,
        debit: item.debit,
        credit: item.credit,
      }));

      const headers = info.sale_book_Export;

      const workbook = new Workbook();
      const mainSheet = workbook.addWorksheet("sheet1");
      mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
      mainSheet.getCell("A2").value = "Sales Book";
      mainSheet.getCell("A3").value = extraSentence;
      mainSheet.mergeCells("F6:G6");
      mainSheet.getCell("F6").value = "CHART OF ACCOUNTS";

      // First header
      for (let row = 1; row <= 2; row++) {
        for (let col = 1; col <= 2; col++) {
          const firstHeader = mainSheet.getCell(row, col);
          firstHeader.font = {
            bold: true,
            size: 10,
          };
        }
      }
      //Merge
      const ranges = ["A6:A7", "B6:B7", "C6:C7", "D6:D7", "E6:E7"];

      ranges.forEach((range) => {
        // Merge each range individually
        mainSheet.mergeCells(range);

        const cell = mainSheet.getCell(range.split(":")[0]); // Get the top-left cell of each range
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      });

      //Header
      headers?.forEach((title, index) => {
        const cell = mainSheet.getCell(7, index + 1);
        cell.value = title;
        const minWidth = Math.max(10, 20);
        mainSheet.getColumn(index + 1).width = minWidth;
      });

      // Add data rows with formatting
      processedData.forEach((item) => {
        const row = mainSheet.addRow([
          item.date,
          item.customerName,
          item.referenceNumber,
          item.lineAmount || 0,
          item.chartOfAccount,
          item.debit || 0,
          item.credit || 0,
        ]);

        const lineAmountCell = row.getCell(4);
        const debitCell = row.getCell(6);
        const creditCell = row.getCell(7);
        lineAmountCell.numFmt = "#,##0.00;#,##0.00";
        debitCell.numFmt = "#,##0.00;#,##0.00";
        creditCell.numFmt = "#,##0.00;#,##0.00";

        if (item.lineAmount < 0) {
          lineAmountCell.font = { color: { argb: "FF0000" } };
        }

        if (item.debit < 0) {
          debitCell.font = { color: { argb: "FF0000" } };
        }
        if (item.credit < 0) {
          creditCell.font = { color: { argb: "FF0000" } };
        }
      });

      // Add totals row with formatting
      const totalLineAmount = processedData.reduce(
        (sum, item) => sum + (item.lineAmount || 0),
        0
      );
      const totalDebit = processedData.reduce(
        (sum, item) => sum + (item.debit || 0),
        0
      );
      const totalCredit = processedData.reduce(
        (sum, item) => sum + (item.credit || 0),
        0
      );
      // const BlankRow = mainSheet.addRow([""]);
      // BlankRow.font = { bold: false };

      const totalsRow = mainSheet.addRow([
        "",
        "",
        "",
        totalLineAmount,
        "",
        totalDebit,
        totalCredit,
      ]);

      totalsRow.font = { bold: true };
      totalsRow.eachCell((cell, colIndex) => {
        cell.numFmt = "#,##0.00;#,##0.00";
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        if (
          (colIndex === 4 && totalLineAmount < 0) ||
          (colIndex === 6 && totalDebit < 0) ||
          (colIndex === 7 && totalCredit < 0)
        ) {
          // cell.value = Math.abs(cell.value);
          cell.font = { color: { argb: "FF0000" }, bold: true };
        }
      });

      // style Header
      for (let row = 6; row <= 7; row++) {
        for (let col = 1; col <= 7; col++) {
          const cell = mainSheet.getCell(row, col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "95b3d7" },
          };
          cell.font = {
            color: { argb: "000000" },
            size: 10,
            bold: true,
          };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (col === 6) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
          if (col === 7) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
        }
      }

      //save excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `SalesJournal-${fromMonth},${fromYear} to ${toMonth},${toYear}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  // // SEARCH
  // const handleSearchClick = () => {
  //   setExpanded(true); // Expand the box
  //   inputRef.current?.focus(); // Immediately focus the input field
  // };
  // const handleFetchData = (data) => {
  //   console.log("DATAAA", data);
  //   console.log(
  //     "Received MONTH:",
  //     data.Month,
  //     "year:",
  //     data.Year,
  //     "system",
  //     data.System
  //   ); // Debugging
  //   setReportData(data);
  // };
  return (
    <>
      <Box className="boa">
        <Box className="boa__header"></Box>
        <Box className="boa__content">
          <Box className="boa__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {headerColumn.map((columnTable) => (
                      <TableCell
                        key={columnTable.id}
                        sx={{
                          textAlign: columnTable.subItems ? "center" : "",
                        }}
                      >
                        {columnTable.name}
                        {columnTable.subItems && (
                          <TableRow
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {columnTable.subItems.map((subItems) => (
                              <TableCell
                                key={subItems.id}
                                sx={{
                                  border: "none",
                                }}
                              >
                                {subItems.name}
                              </TableCell>
                            ))}
                          </TableRow>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isboaFetching || isboaloading ? (
                    Array.from({ length: pageSize }).map((_, index) => (
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
                  ) : boaData?.value?.salesJournal?.length > 0 ? (
                    <>
                      {boaData?.value?.salesJournal?.map((row, index) => (
                        <TableRow key={index}>
                          {headerColumn.map((col) => (
                            <React.Fragment key={col.id}>
                              {col.subItems ? (
                                <TableCell
                                  colSpan={col.subItems.length}
                                  align="center"
                                >
                                  <TableRow
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    {col.subItems.map((subItem) => {
                                      const amountValue =
                                        subItem.id === "debit" &&
                                        row.drCr === "Debit"
                                          ? row.lineAmount
                                          : subItem.id === "credit" &&
                                            row.drCr === "Credit"
                                          ? row.lineAmount
                                          : null;
                                      const formatted = formatNumber(
                                        amountValue || 0
                                      ); // Get formatted number
                                      return (
                                        <TableCell
                                          key={subItem.id}
                                          sx={{
                                            border: "none",
                                            color: formatted.color, // Apply the color
                                          }}
                                        >
                                          {formatted.formattedNumber}{" "}
                                          {/* Display formatted number */}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                </TableCell>
                              ) : (
                                <TableCell
                                  sx={{
                                    color:
                                      col.id === "lineAmount" && row[col.id] < 0
                                        ? "red"
                                        : "inherit",
                                  }}
                                >
                                  {row[col.id]
                                    ? col.id === "lineAmount" // Apply formatting only for numeric columns
                                      ? formatNumber(row[col.id])
                                          .formattedNumber
                                      : row[col.id]
                                    : "—"}
                                </TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                      ))}

                      {/* Grand Total Row */}
                      <TableRow>
                        {headerColumn.map((col) => (
                          <TableCell key={col.id} align="center">
                            {col.subItems ? (
                              <TableRow
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {col.subItems.map((subItem) => {
                                  let totalValue = 0;
                                  if (subItem.id === "debit") {
                                    totalValue = grandTotal.debit;
                                  } else if (subItem.id === "credit") {
                                    totalValue = grandTotal.credit;
                                  }

                                  const formatted = formatNumber(totalValue); // Format grand total values
                                  return (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        border: "none",
                                        fontWeight: "bold",
                                        color: formatted.color, // Apply color for grand total
                                      }}
                                    >
                                      {formatted.formattedNumber}{" "}
                                      {/* Display formatted grand total */}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ) : (
                              ""
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headerColumn.length} align="center">
                        <Typography variant="h6">
                          {info.system_no_data}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Box className="boa__footer">
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={onExport}
              startIcon={
                isboaloading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isboaloading ? "Exporting..." : "Export"}
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={boaData?.value?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              { label: "All", value: boaData?.value?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default SalesJournalPage;
