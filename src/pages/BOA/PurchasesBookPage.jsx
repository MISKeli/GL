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
import React, { useState } from "react";

import { IosShareRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import { formatMonth, formatYear } from "../../utils/dataFormat";
import {
  useExportVerticalPurchasesBookPerMonthQuery,
  useGenerateVerticalPurchasesBookPerMonthPaginationQuery,
} from "../../features/api/boaApi";
import { toast } from "sonner";
import { Workbook } from "exceljs";

const PurchasesBookPage = ({ reportData }) => {
  const [hasDataToExport, setHasDataToExport] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
    ToYear: reportData?.toYear || "",
    FromYear: reportData?.fromYear || "",
  };

  const headerColumn = info.Purchases_Book;
  //console.log("PB Report data:", reportData);
  const {
    data: exportData,
    isLoading: isExportLoading,
    isFetching: isExportFetching,
  } = useExportVerticalPurchasesBookPerMonthQuery({
    ...fillParams,
  });

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateVerticalPurchasesBookPerMonthPaginationQuery({
    ...fillParams,
    search: reportData.Search,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  // console.log("EBoaData", boaData);
  // console.log("sdsdsdsd", fillParams);
  // console.log("Export Data", exportData);

  // Check if data is available and user has selected a month and year
  const hasData = exportData?.value && exportData.value.length > 0;
  // useEffect(() => {
  //   setHasDataToExport(hasData);
  // }, [exportData]);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10)); // Directly set the selected value
    setPage(0);
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

  const purchasesBookTotalData = exportData?.value || [];

  const grandTotal = {
    debit: purchasesBookTotalData
      .reduce((sum, row) => sum + parseFloat(row.debit || 0), 0)
      .toFixed(2),
    credit: purchasesBookTotalData
      .reduce((sum, row) => sum + parseFloat(row.credit || 0), 0)
      .toFixed(2),
  };

  const fromMonth = formatMonth(fillParams.FromMonth);
  const toMonth = formatMonth(fillParams.ToMonth);
  const fromYear = formatYear(fillParams.FromYear);
  const toYear = formatYear(fillParams.ToYear);

  const onExport = async () => {
    const { value: data } = exportData || {};
    try {
      if (!data || data.length === 0) {
        throw new Error("No data available to export.");
      }

      const extraSentence = `For the month of ${fromMonth},${fromYear} to ${toMonth},${toYear}`;

      // console.log("exportDate: ", reportData);
      const processedData = data.map((item) => ({
        id: item.glDate,
        glDate: item.glDate,
        transactionDate: item.transactionDate,
        nameOfSupplier: item.nameOfSupplier,
        description: item.description,
        poNumber: item.poNumber,
        rrNumber: item.rrNumber,
        apv: item.apv,
        receiptNumber: item.receiptNumber,
        amount: item.amount,
        nameOfAccount: item.nameOfAccount,
        debit: item.debit,
        credit: item.credit,
      }));

      const headers = info.Purchases_Book_Export;

      const workbook = new Workbook();
      const mainSheet = workbook.addWorksheet("sheet1");

      mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
      mainSheet.getCell("A2").value = "Purchase Journal";
      mainSheet.getCell("A3").value = extraSentence;
      mainSheet.mergeCells("K6:L6");
      mainSheet.getCell("K6").value = "NAME OF ACCOUNT";

      const ranges = [
        "A6:A7",
        "B6:B7",
        "C6:C7",
        "D6:D7",
        "E6:E7",
        "F6:F7",
        "G6:G7",
        "H6:H7",
        "I6:I7",
        "J6:J7",
      ];

      ranges.forEach((range) => {
        // Merge each range individually
        mainSheet.mergeCells(range);

        const cell = mainSheet.getCell(range.split(":")[0]); // Get the top-left cell of each range
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      });

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

      // header
      for (let row = 6; row <= 7; row++) {
        for (let col = 1; col <= 12; col++) {
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
          if (col === 11) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
          if (col === 12) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
        }
      }

      headers?.forEach((title, index) => {
        const cell = mainSheet.getCell(7, index + 1);
        cell.value = title;
        const minWidth = Math.max(10, 20);
        mainSheet.getColumn(index + 1).width = minWidth;
      });

      // Add data rows with formatting
      processedData.forEach((item) => {
        const row = mainSheet.addRow([
          item.glDate,
          item.transactionDate,
          item.nameOfSupplier,
          item.description,
          item.poNumber,
          item.rrNumber,
          item.apv,
          item.receiptNumber,
          item.amount || 0,
          item.nameOfAccount,
          item.debit || 0,
          item.credit || 0,
        ]);
        const amountCell = row.getCell(9);
        const debitCell = row.getCell(11);
        const creditCell = row.getCell(12);
        // Apply number format without modifying the value
        amountCell.numFmt = "#,##0.00;#,##0.00"; // Display positive for negative values
        debitCell.numFmt = "#,##0.00;#,##0.00";
        creditCell.numFmt = "#,##0.00;#,##0.00";

        // Highlight negative values in red for clarity
        if (item.amount < 0) {
          amountCell.font = { color: { argb: "FF0000" } };
        }
        if (item.debit < 0) {
          debitCell.font = { color: { argb: "FF0000" } };
        }
        if (item.credit < 0) {
          creditCell.font = { color: { argb: "FF0000" } };
        }
      });

      // Add totals row with formatting
      const totalAmount = processedData.reduce(
        (sum, item) => sum + (item.amount || 0),
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
        "Grand Total",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        totalAmount,
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
          (colIndex === 9 && totalAmount < 0) ||
          (colIndex === 11 && totalDebit < 0) ||
          (colIndex === 12 && totalCredit < 0)
        ) {
          // cell.value = Math.abs(cell.value);
          cell.font = { color: { argb: "FF0000" }, bold: true };
        }
      });

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
        `PurchasesBook-${fromMonth},${fromYear} to ${toMonth},${toYear}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  return (
    <>
      <Box className="boa">
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
                                  //padding: "5px", // Ensure proper padding for aesthetics
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
                    Array.from({ length: 5 }).map((_, index) => (
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
                  ) : boaData?.value?.purchasesBook?.length > 0 ? (
                    <>
                      {boaData?.value?.purchasesBook?.map((row, index) => (
                        <TableRow key={index}>
                          {headerColumn.map((col) => (
                            <React.Fragment key={col.id}>
                              {col.id === "rawMaterials" && col.subItems ? (
                                <TableCell align="center">
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
                                          ? row.amount
                                          : subItem.id === "credit" &&
                                            row.drCr === "Credit"
                                          ? row.amount
                                          : null;

                                      const { formattedNumber, color } =
                                        amountValue
                                          ? formatNumber(amountValue)
                                          : {
                                              formattedNumber: "0",
                                              color: "inherit",
                                            };

                                      return (
                                        <TableCell
                                          key={subItem.id}
                                          sx={{
                                            border: "none",
                                            color: color,
                                          }}
                                        >
                                          {formattedNumber}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                </TableCell>
                              ) : (
                                <TableCell
                                  sx={{
                                    color:
                                      col.id === "amount" && row[col.id] < 0
                                        ? "red"
                                        : "inherit",
                                  }}
                                >
                                  {row[col.id]
                                    ? col.id === "amount" // Apply number formatting only for 'amount'
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
                            {col.id === "rawMaterials" && col.subItems ? (
                              <TableRow
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {col.subItems.map((subItem) => {
                                  const value =
                                    subItem.id === "debit"
                                      ? grandTotal.debit
                                      : subItem.id === "credit"
                                      ? grandTotal.credit
                                      : 0;

                                  const { formattedNumber, color } =
                                    formatNumber(value);

                                  return (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        color: color,
                                        border: "none",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {formattedNumber}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ) : (
                              col.id === "amount" && (
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {
                                    formatNumber(grandTotal[col.id] || 0)
                                      .formattedNumber
                                  }
                                </Typography>
                              )
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
              disabled={!hasData || isExportLoading}
              startIcon={
                isExportLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isExportLoading
                ? "Loading..."
                : isExportFetching
                ? "Exporting..."
                : "Export"}
            </Button>
          </Box>

          <TablePagination
            component="div"
            count={boaData?.value.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              25,
              50,
              100,
              {
                label: "All",
                value: boaData?.value?.totalCount || 0,
              },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default PurchasesBookPage;
