/* eslint-disable react/prop-types */
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
import React, { useEffect, useState } from "react";
import useDebounce from "../../components/useDebounce";
import { IosShareRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import {
  useExportVerticalCashDisbursementBookPerMonthQuery,
  useGenerateVerticalCashDisbursementBookPerMonthQuery,
} from "../../features/api/boaApi";
import { toast } from "sonner";
import { Workbook } from "exceljs";
import moment from "moment";
import { formatMonth, formatYear } from "../../utils/dataFormat";
const CashDisbursementBookPage = ({ reportData }) => {
  const [hasDataToExport, setHasDataToExport] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const debounceValue = useDebounce(search);

  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
    ToYear: reportData?.toYear || "",
    FromYear: reportData?.fromYear || "",
  };
  const headerColumn = info.cash_disbursement_book;

  const { data: exportData, isLoading: isExportLoading } =
    useExportVerticalCashDisbursementBookPerMonthQuery({
      ...fillParams,
      System: "Fisto",
    });

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateVerticalCashDisbursementBookPerMonthQuery({
    ...fillParams,
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    System: "Fisto",
  });
  console.log("CDB", boaData);
  console.log("CDBExport", exportData);
  console.log("pere", fillParams);

  useEffect(() => {
    const hasData = exportData?.value && exportData.value.length > 0;
    setHasDataToExport(hasData);
  }, [exportData]);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  const cashDisburstmentTotalData = exportData?.value || [];

  const grandTotal = {
    debit: cashDisburstmentTotalData
      .reduce((sum, row) => sum + parseFloat(row.debitAmount || 0), 0)
      .toFixed(2),
    credit: cashDisburstmentTotalData
      .reduce((sum, row) => sum + parseFloat(row.creditAmount || 0), 0)
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

      const processedData = data.map((item) => ({
        id: item.chequeDate,
        chequeDate: item.chequeDate,
        bank: item.bank,
        cvNumber: item.cvNumber,
        chequeNumber: item.chequeNumber,
        payee: item.payee,
        description: item.description,
        tagNumber: item.tagNumber,
        apvNumber: item.apvNumber,
        accountName: item.accountName,
        debitAmount: item.debitAmount,
        creditAmount: item.creditAmount,
      }));

      const headers = info.cash_disbursement_Export;

      const workbook = new Workbook();
      const mainSheet = workbook.addWorksheet("sheet1");
      mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
      mainSheet.getCell("A2").value = "Cash Disbursement Book";
      mainSheet.getCell("A3").value = extraSentence;
      mainSheet.mergeCells("J6:K6");
      mainSheet.getCell("J6").value = "NAME OF ACCOUNT";

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
          item.chequeDate,
          item.bank,
          item.cvNumber,
          item.chequeNumber,
          item.payee,
          item.description,
          item.tagNumber,
          item.apvNumber,
          item.accountName,
          item.debitAmount || 0,
          item.creditAmount || 0,
        ]);

        const debitCell = row.getCell(10);
        const creditCell = row.getCell(11);

        debitCell.numFmt = "#,##0.00;#,##0.00";
        creditCell.numFmt = "#,##0.00;#,##0.00";

        if (item.debitAmount < 0) {
          // debitCell.value = Math.abs(item.debitAmount);
          debitCell.font = { color: { argb: "FF0000" } };
        }
        if (item.creditAmount < 0) {
          creditCell.font = { color: { argb: "FF0000" } };
        }
      });

      const totalDebit = processedData.reduce(
        (sum, item) => sum + (item.debitAmount || 0),
        0
      );
      const totalCredit = processedData.reduce(
        (sum, item) => sum + (item.creditAmount || 0),
        0
      );
      // const BlankRow = mainSheet.addRow([""]);
      // BlankRow.font = { bold: false };

      const totalsRow = mainSheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        totalDebit,
        totalCredit,
      ]);

      // style Header
      for (let row = 6; row <= 7; row++) {
        for (let col = 1; col <= 11; col++) {
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
          if (col === 10) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
          if (col === 11) {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
        }
      }

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
          (colIndex === 10 && totalDebit < 0) ||
          (colIndex === 11 && totalCredit < 0)
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
        `CashDisbursementBook-${fromMonth},${fromYear} to ${toMonth},${toYear}.xlsx`
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
                                  //padding: "5px",
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
                    // Show skeleton loaders when fetching or loading
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
                  ) : boaData?.value?.cashDisbursementBook?.length > 0 ? (
                    <>
                      {boaData?.value?.cashDisbursementBook.map(
                        (row, index) => (
                          <TableRow key={index}>
                            {headerColumn.map((col) => (
                              <React.Fragment key={col.id}>
                                {col.subItems ? (
                                  <TableCell align="center">
                                    <TableRow
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: 0, // Ensure no extra padding for nested rows
                                      }}
                                    >
                                      {col.subItems.map((subItem) => {
                                        const amountValue = row[subItem.id];
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
                                              color: color, // Apply color to the cell
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
                                    {row[col.id] ? row[col.id] : "—"}
                                  </TableCell>
                                )}
                              </React.Fragment>
                            ))}
                          </TableRow>
                        )
                      )}

                      {/* Grand Total Row */}
                      <TableRow>
                        {headerColumn.map((col) => (
                          <TableCell key={col.id} align="center">
                            {col.subItems ? (
                              <TableRow
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: 0, // Ensure no extra padding for nested rows
                                }}
                              >
                                {col.subItems.map((subItem) => {
                                  const value =
                                    subItem.id === "debitAmount"
                                      ? grandTotal.debit
                                      : subItem.id === "creditAmount"
                                      ? grandTotal.credit
                                      : 0;

                                  const { formattedNumber, color } =
                                    formatNumber(value);

                                  return (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        border: "none",
                                        fontWeight: "bold",
                                        color: color,
                                      }}
                                    >
                                      {subItem.id === "debitAmount"
                                        ? formattedNumber
                                        : subItem.id === "creditAmount"
                                        ? formattedNumber // Credit will appear in red
                                        : "0"}
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
              disabled={!hasDataToExport || isExportLoading}
              startIcon={
                isExportLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isExportLoading ? "Exporting..." : "Export"}
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

export default CashDisbursementBookPage;
