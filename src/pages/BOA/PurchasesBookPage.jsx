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
import React, { useRef, useState } from "react";
import useDebounce from "../../components/useDebounce";
import dayjs from "dayjs";
import { IosShareRounded } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import {
  useExportVerticalPurchasesBookPerMonthQuery,
  useGenerateVerticalPurchasesBookPerMonthPaginationQuery,
} from "../../features/api/boaApi";
import { toast } from "sonner";
import { Workbook } from "exceljs";

const PurchasesBookPage = ({ reportData }) => {
  const [hasDataToExport, setHasDataToExport] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const inputRef = useRef(null);
  const debounceValue = useDebounce(search);
  const headerColumn = info.Purchases_Book;
  console.log("PB Report data:", reportData);
  const { data: exportData, isLoading: isExportLoading } =
    useExportVerticalPurchasesBookPerMonthQuery({
      Month: reportData.Month,
      Year: reportData.Year,
    });

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateVerticalPurchasesBookPerMonthPaginationQuery({
    Month: reportData.Month,
    Year: reportData.Year,
    search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  console.log("EBoaData", boaData);
  console.log("Export Data", exportData);

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
    return Math.abs(number)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  const onExport = async () => {
    const { value: data } = exportData || {};
    try {
      if (!data || data.length === 0) {
        throw new Error("No data available to export.");
      }

      const extraSentence = `For the month of ${reportData.Month} ${reportData.Year}`;

      const processedData = data.map((item) => ({
        id: item.glDate,
        glDate: item.glDate,
        transactionDate: item.transactionDate,
        nameOfSupplier: item.nameOfSupplier,
        description: item.description,
        poNumber: item.poNumber,
        rrNumber: item.rrNumber,
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

      processedData.forEach((item) => {
        const row = [];
        row.push(item.glDate);
        row.push(item.transactionDate);
        row.push(item.nameOfSupplier);
        row.push(item.description);
        row.push(item.poNumber);
        row.push(item.rrNumber);
        row.push(item.apv);
        row.push(item.receiptNumber);
        row.push(item.amount);
        row.push(item.nameOfAccount);
        row.push(item.debit);
        row.push(item.credit);

        mainSheet.addRow(row);
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
        `PurchasesBook-${reportData.Month}-${reportData.Year}.xlsx`
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
                  ) : boaData?.value?.purchasesBook?.length > 0 ? (
                    boaData?.value?.purchasesBook?.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <React.Fragment key={col.id}>
                            {/* Check if the column is "rawMaterials" and has subItems (debit and credit) */}
                            {col.id === "rawMaterials" && col.subItems ? (
                              <TableCell align="center">
                                <TableRow
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {/* Iterate over subItems for debit and credit */}
                                  {col.subItems.map((subItem) => {
                                    const amountValue =
                                      subItem.id === "debit" &&
                                      row.drCr === "Debit"
                                        ? row.amount
                                        : subItem.id === "credit" &&
                                          row.drCr === "Credit"
                                        ? row.amount
                                        : null;

                                    const isNegative = amountValue < 0;

                                    return (
                                      <TableCell
                                        key={subItem.id}
                                        sx={{
                                          border: "none",
                                          color: isNegative ? "red" : "inherit",
                                        }}
                                      >
                                        {amountValue !== null
                                          ? formatNumber(amountValue)
                                          : "0"}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              </TableCell>
                            ) : (
                              // For columns without subItems
                              <TableCell
                                sx={{
                                  color:
                                    col.id === "amount" && row[col.id] < 0
                                      ? "red"
                                      : "inherit",
                                }}
                              >
                                {row[col.id]
                                  ? col.id === "amount"
                                    ? formatNumber(row[col.id]) // Format amount column
                                    : row[col.id]
                                  : "—"}
                              </TableCell>
                            )}
                          </React.Fragment>
                        ))}
                      </TableRow>
                    ))
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
              {isExportLoading ? "Exporting..." : "Export"}
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
