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
const CashDisbursementBookPage = ({ reportData }) => {
  const [hasDataToExport, setHasDataToExport] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const debounceValue = useDebounce(search);
  const headerColumn = info.cash_disbursement_book;

  const { data: exportData, isLoading: isExportLoading } =
    useExportVerticalCashDisbursementBookPerMonthQuery({
      Month: reportData.Month,
      System: "Fisto",
      Year: reportData.Year,
    });

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateVerticalCashDisbursementBookPerMonthQuery({
    Search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
    System: "Fisto",
    Month: reportData.Month,
    Year: reportData.Year,
  });
  console.log("CDB", boaData);

  useEffect(() => {
    const hasData = exportData?.value && exportData.value.length > 0;
    setHasDataToExport(hasData);
  }, [exportData]);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 25);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  const onExport = async () => {
    const { value: data } = exportData || {};
    try {
      if (!data || data.length === 0) {
        throw new Error("No data available to export.");
      }
      const extraSentence = `For the month of ${reportData.Month} ${reportData.Year}`;

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

      // data
      processedData.forEach((item) => {
        const row = [];
        row.push(item.chequeDate);
        row.push(item.bank);
        row.push(item.cvNumber);
        row.push(item.chequeNumber);
        row.push(item.payee);
        row.push(item.description);
        row.push(item.tagNumber);
        row.push(item.apvNumber);
        row.push(item.accountName);
        row.push(item.debitAmount);
        row.push(item.creditAmount);

        mainSheet.addRow(row);
      });

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
        `CashDisbursementBook-${reportData.Month}-${reportData.Year}.xlsx`
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
              <Table stickyHeader size="small" >
                <TableHead>
                  <TableRow >
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
                                  
                                  textAlign: subItems.credit ? "left" : "", // Center subItems text
                                  borderBottom: 0,
                                  padding: "5px", // Ensure proper padding for aesthetics
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
                  ) : boaData?.value?.cashDisbursementBook?.length > 0 ? (
                    boaData?.value?.cashDisbursementBook.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <React.Fragment key={col.id}>
                            {col.subItems ? (
                              // If the column has subItems (debit and credit), render them in nested cells
                              <TableCell align="center">
                                <TableRow
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {col.subItems.map((subItem) => (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        textAlign: "center",
                                        borderBottom: 0,
                                        padding: "5px",
                                      }}
                                    >
                                      {row[subItem.id] ? row[subItem.id] : "—"}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableCell>
                            ) : (
                              // For regular columns without subItems
                              <TableCell>
                                {row[col.id] ? row[col.id] : "—"}
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
