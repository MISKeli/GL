/* eslint-disable react/prop-types */
import { useCallback } from "react";
import { toast } from "react-toastify";
import { Workbook } from "exceljs";
import moment from "moment";
import { info } from "../../schemas/info";

const useExportData = (headers, exportData, reportData) => {
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
    System: reportData?.selectedSystem || "ALL",
    // ToYear: reportData?.toYear || "",
    // FromYear: reportData?.fromYear || "",
  };
  const currentDate = moment().format("YYYY-MM-DD");
  const numericFields = info.numFormat.numericField;

  const exportToExcel = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `As of ${fillParams.ToMonth || toMonth}`;

        const processedData = exportData.map((item) => ({
          id: item.chartOfAccount,
          chartOfAccount: item.chartOfAccount,
          debit: item.debit,
          credit: item.credit,
          debitVariance: item.debitVariance,
          creditVariance: item.creditVariance,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Trial Balance";
        mainSheet.getCell("A3").value = extraSentence;
        mainSheet.mergeCells("D6:E6");
        mainSheet.getCell("D6").value = "BALANCES";

        const balances = mainSheet.getCell("D6");
        balances.alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // Style the column headers
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 5; col++) {
            const cell = mainSheet.getCell(row, col);
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "95b3d7" },
            };
            cell.font = { color: { argb: "000000" }, size: 10, bold: true };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          }
        }

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.chartOfAccount,
            item.debit || 0,
            item.credit || 0,
            item.debitVariance || 0,
            item.creditVariance || 0,
          ]);

          const debitCell = row.getCell(2);
          const creditCell = row.getCell(3);
          const debitVarianceCell = row.getCell(4);
          const creditVarianceCell = row.getCell(5);
          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;
          debitVarianceCell.numFmt = info.numFormat.number;
          creditVarianceCell.numFmt = info.numFormat.number;

          if (item.debit < 0) {
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.credit < 0) {
            creditCell.font = { color: { argb: "FF0000" } };
          }
          if (item.debitVariance < 0) {
            debitVarianceCell.font = { color: { argb: "FF0000" } };
          }
          if (item.creditVariance < 0) {
            creditVarianceCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Add totals row with formatting
        const totalDebit = processedData.reduce(
          (sum, item) => sum + (item.debit || 0),
          0
        );
        const totalCredit = processedData.reduce(
          (sum, item) => sum + (item.credit || 0),
          0
        );
        const totalDebitVariance = processedData.reduce(
          (sum, item) => sum + (item.debitVariance || 0),
          0
        );
        const totalCreditVariance = processedData.reduce(
          (sum, item) => sum + (item.creditVariance || 0),
          0
        );
        const totalsRow = mainSheet.addRow([
          "Total",
          totalDebit,
          totalCredit,
          totalDebitVariance,
          totalCreditVariance,
        ]);
        totalsRow.font = { bold: true };
        totalsRow.eachCell((cell, colIndex) => {
          cell.numFmt = info.numFormat.number;
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (
            (colIndex === 2 && totalDebit < 0) ||
            (colIndex === 3 && totalCredit < 0) ||
            (colIndex === 4 && totalDebitVariance < 0) ||
            (colIndex === 4 && totalCreditVariance < 0)
          ) {
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `TrialBalance-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );
  const detailedTrailBalanceExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `As of ${fillParams.ToMonth || toMonth}`;

        const processedData = exportData.map((item) => ({
          id: item.chartOfAccount,
          chartOfAccount: item.chartOfAccount,
          openDebit: item.openDebit,
          openCredit: item.openCredit,
          transactionDebit: item.transactionDebit,
          transactionCredit: item.transactionCredit,
          closeDebit: item.closeDebit,
          closeCredit: item.closeCredit,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Detailed Trial Balance";
        mainSheet.getCell("A3").value = extraSentence;
        mainSheet.mergeCells("B6:C6");
        mainSheet.getCell("B6").value = "OPENING BALANCE";
        mainSheet.mergeCells("D6:E6");
        mainSheet.getCell("D6").value = "TRANSACTION DURING BALANCE";
        mainSheet.mergeCells("F6:G6");
        mainSheet.getCell("F6").value = "CLOSING BALANCE";

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // Style the column headers
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 7; col++) {
            const cell = mainSheet.getCell(row, col);
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "95b3d7" },
            };
            cell.font = { color: { argb: "000000" }, size: 10, bold: true };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          }
        }

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.chartOfAccount,
            item.openDebit || 0,
            item.openCredit || 0,
            item.transactionDebit || 0,
            item.transactionCredit || 0,
            item.closeDebit || 0,
            item.closeCredit || 0,
          ]);

          const openDebit = row.getCell(2);
          const openCredit = row.getCell(3);
          const transactionDebit = row.getCell(4);
          const transactionCredit = row.getCell(5);
          const closeDebit = row.getCell(6);
          const closeCredit = row.getCell(7);

          const cellsToFormat = [
            openDebit,
            openCredit,
            transactionDebit,
            transactionCredit,
            closeDebit,
            closeCredit,
          ];
          cellsToFormat.forEach((cell) => {
            cell.numFmt = info.numFormat.number;
          });

          // You can use an array of objects with value references and cell references:
          const cellsToCheck = [
            { value: item.openDebit, cell: openDebit },
            { value: item.openCredit, cell: openCredit },
            { value: item.transactionDebit, cell: transactionDebit },
            { value: item.transactionCredit, cell: transactionCredit },
            { value: item.closeDebit, cell: closeDebit },
            { value: item.closeCredit, cell: closeCredit },
          ];

          // Apply the negative value formatting in one loop:
          cellsToCheck.forEach(({ value, cell }) => {
            if (value < 0) {
              cell.font = { color: { argb: "FF0000" } };
            }
          });
        });

        // Add totals row with formatting
        const totalOpenDebit = processedData.reduce(
          (sum, item) => sum + (item.openDebit || 0),
          0
        );
        const totalOpenCredit = processedData.reduce(
          (sum, item) => sum + (item.openCredit || 0),
          0
        );
        const totalTransactionCredit = processedData.reduce(
          (sum, item) => sum + (item.transactionCredit || 0),
          0
        );
        const totalTransactionDebit = processedData.reduce(
          (sum, item) => sum + (item.transactionDebit || 0),
          0
        );
        const totalCloseDebit = processedData.reduce(
          (sum, item) => sum + (item.closeDebit || 0),
          0
        );
        const totalCloseCredit = processedData.reduce(
          (sum, item) => sum + (item.closeCredit || 0),
          0
        );

        const totalsRow = mainSheet.addRow([
          "Total unadjusted trial Balance",
          totalOpenDebit,
          totalOpenCredit,
          totalTransactionDebit,
          totalTransactionCredit,
          totalCloseDebit,
          totalCloseCredit,
        ]);
        totalsRow.font = { bold: true };
        totalsRow.eachCell((cell, colIndex) => {
          cell.numFmt = info.numFormat.number;
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (
            (colIndex === 2 && totalOpenDebit < 0) ||
            (colIndex === 3 && totalOpenCredit < 0) ||
            (colIndex === 4 && totalTransactionDebit < 0) ||
            (colIndex === 5 && totalTransactionCredit < 0) ||
            (colIndex === 6 && totalCloseDebit < 0) ||
            (colIndex === 7 && totalCloseCredit < 0)
          ) {
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Detailed Trial Balance - as of ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );
  // Updated balanceSheetExcel function
  const balanceSheetExcel = useCallback(
    async (headers, exportData, fileName) => {
      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No data available to export.");
        }

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("Balance Sheet");

        // Add headers
        headers.forEach((title, index) => {
          const columnIndex = index + 1;
          const headerCell = mainSheet.getCell(1, columnIndex);
          headerCell.value = title;
          mainSheet.getColumn(columnIndex).width = Math.max(
            20,
            title.length + 5
          );

          // Style header
          headerCell.font = { color: { argb: "000000" }, bold: true, size: 12 };
          headerCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "95b3d7" },
          };
          headerCell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Add data rows
        exportData.forEach((item, rowIndex) => {
          const rowNumber = rowIndex + 2; // Start from row 2 (after headers)

          // Add data to each column
          mainSheet.getCell(rowNumber, 1).value = item.accountType || "";
          mainSheet.getCell(rowNumber, 2).value = item.accountGroup || "";
          mainSheet.getCell(rowNumber, 3).value = item.accountDetails || "";

          // Handle amount column - special formatting only for Accum Depr
          const amountCell = mainSheet.getCell(rowNumber, 4);
          if (typeof item.amount === "number" && item.amount !== 0) {
            const isAccumDepr =
              item.accountDetails ===
              "Accum Depr - Property, Plant & Equipment";

            if (isAccumDepr) {
              // For Accum Depr: preserve negative value, show in red with parentheses
              amountCell.value = item.amount;
              amountCell.numFmt =
                '_-* #,##0.00_-;[Red]_-* (#,##0.00);_-* "-"??_-;_-@_-';
              amountCell.font = { color: { argb: "FF0000" } }; // Red color
            } else {
              // For all other values: use absolute value, black color
              amountCell.value = Math.abs(item.amount);
              amountCell.numFmt = "#,##0.00"; // Standard positive number format
              amountCell.font = { color: { argb: "000000" } }; // Black color
            }
          } else {
            amountCell.value = item.amount || "";
          }

          // Style total and variance rows differently
          const isTotalRow =
            item.accountType === "TOTAL" ||
            item.accountDetails?.toUpperCase().includes("TOTAL");

          const isVarianceRow =
            item.accountDetails?.toUpperCase().trim() === "VARIANCE";

          if (isTotalRow || isVarianceRow) {
            const row = mainSheet.getRow(rowNumber);
            row.eachCell((cell) => {
              cell.font = { bold: true };
              cell.border = {
                top: { style: "thin" },
                bottom: { style: "double" },
              };
            });
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${fileName}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Export error:", error);
        throw error; // Re-throw to be caught by the calling function
      }
    },
    []
  );

  const purchasesBookExport = useCallback(
    async (headers, exportData, reportData, bookType) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;

        const processedData = exportData.map((item) => {
          const converted = { ...item };

          if (moment(item.transactionDate, "YYYY-MM-DD", true).isValid()) {
            converted.transactionDate = moment(item.transactionDate).format(
              "MM/DD/YYYY"
            ); // Keep it as a Date object
          }

          // Convert numeric fields from string to number
          numericFields.forEach((key) => {
            const value = item[key];

            // Check if value is a string that can safely be converted to a number
            if (
              typeof value === "string" &&
              !isNaN(value) &&
              value.trim() !== ""
            ) {
              converted[key] = Number(value);
            }
          });

          return converted;
        });

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = bookType;
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

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
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
        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.glDate,
            item.transactionDate, // This will now be "2025-04-02" instead of a Date object
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

          const transactionDateCell = row.getCell(2);
          const amountCell = row.getCell(9);
          const debitCell = row.getCell(11);
          const creditCell = row.getCell(12);

          // Format the transaction date cell to display as YYYY-MM-DD but allow filtering
          // This will show "2025-04-02" but Excel will recognize it as April 2nd for filtering
          transactionDateCell.numFmt = "yyyy-mm-dd";

          // Apply number format without modifying the value
          amountCell.numFmt = info.numFormat.number;
          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

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
          cell.numFmt = info.numFormat.number;
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
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `${bookType} ${fromMonth.format("MMMM-YYYY")}.xlsx`
            : `${bookType} ${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        setTimeout(() => {
          link.click();
          document.body.removeChild(link);
        }, 100); // delay just enough to ensure execution

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );

  const purchasesBookSummaryExport = useCallback(
    async (headers, exportData, reportData, bookType) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;

        const processedData = exportData.map((item) => {
          const converted = { ...item };

          if (moment(item.transactionDate, "YYYY-MM-DD", true).isValid()) {
            converted.transactionDate = moment(item.transactionDate).format(
              "MM/DD/YYYY"
            ); // Keep it as a Date object
          }
          // Convert numeric fields from string to number
          numericFields.forEach((key) => {
            const value = item[key];

            // Check if value is a string that can safely be converted to a number
            if (
              typeof value === "string" &&
              !isNaN(value) &&
              value.trim() !== ""
            ) {
              converted[key] = Number(value);
            }
          });

          return converted;
        });

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = bookType;
        mainSheet.getCell("A3").value = extraSentence;
        mainSheet.mergeCells("C6:D6");
        mainSheet.getCell("C6").value = "NAME OF ACCOUNT";

        const ranges = ["A6:A7", "B6:B7"];

        ranges.forEach((range) => {
          // Merge each range individually
          mainSheet.mergeCells(range);

          const cell = mainSheet.getCell(range.split(":")[0]); // Get the top-left cell of each range
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        });

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // header
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 4; col++) {
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
            if (col === 3) {
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
              };
            }
            if (col === 4) {
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
              };
            }
          }
        }
        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.glDate,
            item.nameOfAccount,
            item.debit || 0,
            item.credit || 0,
          ]);

          const debitCell = row.getCell(3);
          const creditCell = row.getCell(4);
          // Apply number format without modifying the value

          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

          if (item.debit < 0) {
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.credit < 0) {
            creditCell.font = { color: { argb: "FF0000" } };
          }
        });

        const totalDebit = processedData.reduce(
          (sum, item) => sum + (item.debit || 0),
          0
        );
        const totalCredit = processedData.reduce(
          (sum, item) => sum + (item.credit || 0),
          0
        );

        const totalsRow = mainSheet.addRow([
          "Grand Total",
          "",

          totalDebit,
          totalCredit,
        ]);

        totalsRow.font = { bold: true };
        totalsRow.eachCell((cell, colIndex) => {
          cell.numFmt = info.numFormat.number;
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (
            (colIndex === 3 && totalDebit < 0) ||
            (colIndex === 4 && totalCredit < 0)
          ) {
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `${bookType} ${fromMonth.format("MMMM-YYYY")}`
            : `${bookType}-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        setTimeout(() => {
          link.click();
          document.body.removeChild(link);
        }, 100); // delay just enough to ensure execution

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );
  const CashDisburstmentBookExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;

        const processedData = exportData.map((item) => ({
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

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Cash Disbursement Book";
        mainSheet.getCell("A3").value = extraSentence;
        mainSheet.mergeCells("J6:K6");
        mainSheet.getCell("J6").value = "NAME OF ACCOUNT";

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
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

        // Style the column headers
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 3; col++) {
            const cell = mainSheet.getCell(row, col);
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "95b3d7" },
            };
            cell.font = { color: { argb: "000000" }, size: 10, bold: true };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          }
        }

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
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
          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

          if (item.debitAmount < 0) {
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.creditAmount < 0) {
            creditCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Add totals row with formatting
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
          cell.numFmt = info.numFormat.number;
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
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `CashDisbursementBook ${fromMonth.format("MMMM-YYYY")}`
            : `CashDisbursementBook-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );

  const CashDisburstmentBookSummaryExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;

        const processedData = exportData.map((item) => ({
          id: item.chequeDate,
          chequeDate: item.chequeDate,
          accountName: item.accountName,
          debitAmount: item.debitAmount,
          creditAmount: item.creditAmount,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Cash Disbursement Book";
        mainSheet.getCell("A3").value = extraSentence;
        mainSheet.mergeCells("C6:D6");
        mainSheet.getCell("C6").value = "NAME OF ACCOUNT";

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        //Merge
        const ranges = ["A6:A7", "B6:B7"];

        ranges.forEach((range) => {
          // Merge each range individually
          mainSheet.mergeCells(range);

          const cell = mainSheet.getCell(range.split(":")[0]); // Get the top-left cell of each range
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        });

        // Style the column headers
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 3; col++) {
            const cell = mainSheet.getCell(row, col);
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "95b3d7" },
            };
            cell.font = { color: { argb: "000000" }, size: 10, bold: true };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          }
        }

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.chequeDate,
            item.accountName,
            item.debitAmount || 0,
            item.creditAmount || 0,
          ]);

          const debitCell = row.getCell(3);
          const creditCell = row.getCell(4);
          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

          if (item.debitAmount < 0) {
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.creditAmount < 0) {
            creditCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Add totals row with formatting
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
          "Grand Total",
          "",
          totalDebit,
          totalCredit,
        ]);

        // style Header
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 4; col++) {
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
            if (col === 3) {
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
              };
            }
            if (col === 4) {
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
              };
            }
          }
        }

        totalsRow.font = { bold: true };
        totalsRow.eachCell((cell, colIndex) => {
          cell.numFmt = info.numFormat.number;
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (
            (colIndex === 3 && totalDebit < 0) ||
            (colIndex === 4 && totalCredit < 0)
          ) {
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `CashDisbursementBook ${fromMonth.format("MMMM-YYYY")}`
            : `CashDisbursementBook-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );

  const exportSystem = useCallback(
    async (headers) => {
      try {
        if (!headers || headers.length === 0) {
          throw new Error("No data available to export.");
        }

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("Sample Templete");

        // // Add Static
        mainSheet.getCell("F2").value = "08/27/2024";
        mainSheet.getCell("F3").value = "08/27/2024";
        mainSheet.getCell("AD2").value = "423394.76";
        mainSheet.getCell("AD3").value = "-7731.78";
        mainSheet.getCell("BA2").value = "Dec";
        mainSheet.getCell("BA3").value = "Dec";
        mainSheet.getCell("BB2").value = "2024";
        mainSheet.getCell("BB3").value = "2024";
        mainSheet.getCell("AG3").value = "Credit";
        mainSheet.getCell("AG2").value = "Debit";

        // Add styles to cells that have data in each column
        headers?.forEach((title, index) => {
          const columnIndex = index + 1;

          // Set the column header
          const headerCell = mainSheet.getCell(1, columnIndex);
          headerCell.value = title;
          mainSheet.getColumn(columnIndex).width = Math.max(10, 20);

          // Style header
          headerCell.font = { color: { argb: "000000" }, bold: true, size: 12 };
          headerCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "95b3d7" },
          };
          headerCell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `sample_template.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers]
  );

  const exportImportSystem = useCallback(
    async (headers, dataKeys, exportData, reportData, selectedSystem) => {
      try {
        // Improved validation
        if (!exportData) {
          throw new Error("Export data is null or undefined");
        }

        if (exportData.length === 0) {
          throw new Error("No data available to export.");
        }

        const fromMonth = reportData.fromMonth;
        const toMonth = reportData.toMonth;
        const system = selectedSystem || "ALL SYSTEM";
        const extraSentence = `For the month of ${fromMonth} to ${toMonth}`;

        // Convert string numbers to actual number types
        const processedData = exportData.map((item) => {
          const converted = { ...item };
          if (moment(item.transactionDate, "YYYY-MM-DD", true).isValid()) {
            converted.transactionDate = moment(item.transactionDate).format(
              "MM/DD/YYYY"
            ); // Keep it as a Date object
          }
          // Make sure numericFields is defined and is an array
          if (Array.isArray(numericFields)) {
            numericFields.forEach((key) => {
              const value = item[key];
              // Check if value is a string that can safely be converted to a number
              if (
                typeof value === "string" &&
                !isNaN(value) &&
                value.trim() !== ""
              ) {
                converted[key] = Number(value);
              }
            });
          }
          return converted;
        });

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = system;
        mainSheet.getCell("A3").value = extraSentence;

        // Style the main headers
        for (let row = 1; row <= 3; row++) {
          // Changed from 2 to 3 to style all three header rows
          for (let col = 1; col <= 2; col++) {
            const headerCell = mainSheet.getCell(row, col);
            headerCell.font = { bold: true, size: 10 };
          }
        }

        // Add styles to cells that have data in each column
        headers.forEach((title, index) => {
          const columnIndex = index + 1;

          // Set the column header
          const headerCell = mainSheet.getCell(5, columnIndex);
          headerCell.value = title;
          mainSheet.getColumn(columnIndex).width = Math.max(10, 20);

          // Style header
          headerCell.font = { color: { argb: "000000" }, bold: true, size: 12 };
          headerCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "95b3d7" },
          };
          headerCell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });

        processedData.forEach((item, rowIndex) => {
          // Create array of values by mapping through dataKeys (IDs)
          const rowValues = dataKeys.map((dataKey) => {
            const value = item[dataKey]; // Use the ID to get the actual data
            if (value === undefined) {
              console.log(
                `Undefined value for data key [${dataKey}] in row ${rowIndex}`
              );
            }
            return value ?? ""; // Replace undefined/null with empty string
          });

          // Add the row to the sheet
          const row = mainSheet.addRow(rowValues);

          // Apply number format to amount column if it exists
          const lineAmountIndex = dataKeys.indexOf("lineAmount");
          if (lineAmountIndex !== -1) {
            const amountColumnIndex = lineAmountIndex + 1;
            const amountCell = row.getCell(amountColumnIndex);

            if (info && info.numFormat && info.numFormat.number) {
              amountCell.numFmt = info.numFormat.number;
            } else {
              amountCell.numFmt = "#,##0.00";
            }

            // Highlight negative values in red for clarity
            if (item.lineAmount && item.lineAmount < 0) {
              amountCell.font = { color: { argb: "FF0000" } };
            }
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const fileName = `${system}_report_${fromMonth}-${toMonth}.xlsx`;

        // More reliable approach for file download
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // For IE browser
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          // For other browsers
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          link.style.display = "none";
          document.body.appendChild(link);

          // Trigger click synchronously
          link.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }

        return true; // Indicate success
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
        return false; // Indicate failure
      }
    },
    [headers, reportData]
  );

  const exportViewSystem = useCallback(
    async (headers, exportData) => {
      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No data available to export.");
        }

        const processedData = exportData?.map((item) => ({
          ...item,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Style the main headers
        for (let row = 1; row <= 1; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // Add styles to cells that have data in each column
        headers?.forEach((title, index) => {
          const columnIndex = index + 1;

          // Set the column header
          const headerCell = mainSheet.getCell(1, columnIndex);
          headerCell.value = title;
          mainSheet.getColumn(columnIndex).width = Math.max(10, 20);

          // Style header
          headerCell.font = { color: { argb: "000000" }, bold: true, size: 12 };
          headerCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "95b3d7" },
          };
          headerCell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });

        processedData.forEach((item) => {
          const row = mainSheet.addRow(Object.values(item));
          const amountCell = row.getCell(30);

          amountCell.numFmt = info.numFormat.number;

          // Highlight negative values in red for clarity
          if (item.lineAmount < 0) {
            amountCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = `General Ledger ${currentDate}.xlsx`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, reportData]
  );

  const salesJournalExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;
        const processedData = exportData.map((item) => ({
          id: item.date,
          date: item.date,
          customerName: item.customerName,
          referenceNumber: item.referenceNumber,
          lineAmount: item.lineAmount,
          chartOfAccount: item.chartOfAccount,
          debit: item.debit,
          credit: item.credit,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Sales Journal";
        mainSheet.getCell("A3").value = extraSentence;
        mainSheet.mergeCells("F6:G6");
        mainSheet.getCell("F6").value = "CHART OF ACCOUNTS";

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

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // Style the column headers
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

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
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
          lineAmountCell.numFmt = info.numFormat.number;
          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

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
          cell.numFmt = info.numFormat.number;
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
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `SalesJournalBook ${fromMonth.format("MMMM-YYYY")}`
            : `SalesJournalBook-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );
  const salesJournalSummaryExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;
        const processedData = exportData.map((item) => ({
          id: item.date,
          date: item.date,
          chartOfAccount: item.chartOfAccount,
          debit: item.debit,
          credit: item.credit,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Sales Journal";
        mainSheet.getCell("A3").value = extraSentence;
        mainSheet.getCell("C6").value = "AMOUNT";

        //Merge
        const ranges = ["A6:A7", "B6:B7", "C6:D6"];

        ranges.forEach((range) => {
          // Merge each range individually
          mainSheet.mergeCells(range);

          const cell = mainSheet.getCell(range.split(":")[0]); // Get the top-left cell of each range
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        });

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // Style the column headers
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 4; col++) {
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

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.date,
            item.chartOfAccount,
            item.debit || 0,
            item.credit || 0,
          ]);

          const debitCell = row.getCell(3);
          const creditCell = row.getCell(4);

          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

          if (item.debit < 0) {
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.credit < 0) {
            creditCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Add totals row with formatting

        const totalDebit = processedData.reduce(
          (sum, item) => sum + (item.debit || 0),
          0
        );
        const totalCredit = processedData.reduce(
          (sum, item) => sum + (item.credit || 0),
          0
        );
        const totalsRow = mainSheet.addRow([
          "Grand Total",

          "",
          totalDebit,
          totalCredit,
        ]);

        totalsRow.font = { bold: true };
        totalsRow.eachCell((cell, colIndex) => {
          cell.numFmt = info.numFormat.number;
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (
            (colIndex === 3 && totalDebit < 0) ||
            (colIndex === 4 && totalCredit < 0)
          ) {
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `SalesJournalBook ${fromMonth.format("MMMM-YYYY")}`
            : `SalesJournalBook-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );

  const journalBookExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;
        const processedData = exportData.map((item) => ({
          id: item.date,
          date: item.date,
          referenceNumber: item.referenceNumber,
          particulars: item.particulars,
          debit: item.debit,
          credit: item.credit,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Journal Book";
        mainSheet.getCell("A3").value = extraSentence;
        // mainSheet.mergeCells("F6:G6");
        // mainSheet.getCell("F6").value = "CHART OF ACCOUNTS";

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

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // Style the column headers
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 5; col++) {
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

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.date,
            item.referenceNumber,
            item.particulars,
            item.debit || 0,
            item.credit || 0,
          ]);

          const debitCell = row.getCell(4);
          const creditCell = row.getCell(5);

          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

          if (item.debit < 0) {
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.credit < 0) {
            creditCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Add totals row with formatting

        const totalDebit = processedData.reduce(
          (sum, item) => sum + (item.debit || 0),
          0
        );
        const totalCredit = processedData.reduce(
          (sum, item) => sum + (item.credit || 0),
          0
        );
        const totalsRow = mainSheet.addRow([
          "",
          "",
          "",
          totalDebit,
          totalCredit,
        ]);

        totalsRow.font = { bold: true };
        totalsRow.eachCell((cell, colIndex) => {
          cell.numFmt = info.numFormat.number;
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (
            (colIndex === 4 && totalDebit < 0) ||
            (colIndex === 5 && totalCredit < 0)
          ) {
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `JournalBook ${fromMonth.format("MMMM-YYYY")}`
            : `JournalBook-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );

  const journalBookSummaryExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      const isWholeMonth =
        fromMonth === moment().startOf("month").format("MMMM DD, YYYY") &&
        toMonth === moment().endOf("month").format("MMMM DD, YYYY");

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;
        const processedData = exportData.map((item) => ({
          id: item.date,
          date: item.date,
          particulars: item.particulars,
          debit: item.debit,
          credit: item.credit,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Journal Book";
        mainSheet.getCell("A3").value = extraSentence;
        // mainSheet.mergeCells("F6:G6");
        // mainSheet.getCell("F6").value = "CHART OF ACCOUNTS";

        //Merge
        const ranges = ["A6:A7", "B6:B7", "C6:C7", "D6:D7"];

        ranges.forEach((range) => {
          // Merge each range individually
          mainSheet.mergeCells(range);

          const cell = mainSheet.getCell(range.split(":")[0]); // Get the top-left cell of each range
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        });

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        // Style the column headers
        for (let row = 6; row <= 7; row++) {
          for (let col = 1; col <= 4; col++) {
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
            if (col === 3) {
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
              };
            }
            if (col === 4) {
              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
              };
            }
          }
        }

        // Add column headers
        headers?.forEach((title, index) => {
          const cell = mainSheet.getCell(7, index + 1);
          cell.value = title;
          mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        });

        // Add data rows with formatting
        processedData.forEach((item) => {
          const row = mainSheet.addRow([
            item.date,
            item.particulars,
            item.debit || 0,
            item.credit || 0,
          ]);

          const debitCell = row.getCell(3);
          const creditCell = row.getCell(4);

          debitCell.numFmt = info.numFormat.number;
          creditCell.numFmt = info.numFormat.number;

          if (item.debit < 0) {
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.credit < 0) {
            creditCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Add totals row with formatting

        const totalDebit = processedData.reduce(
          (sum, item) => sum + (item.debit || 0),
          0
        );
        const totalCredit = processedData.reduce(
          (sum, item) => sum + (item.credit || 0),
          0
        );
        const totalsRow = mainSheet.addRow([
          "Grand Total",
          "",
          totalDebit,
          totalCredit,
        ]);

        totalsRow.font = { bold: true };
        totalsRow.eachCell((cell, colIndex) => {
          cell.numFmt = info.numFormat.number;
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          if (
            (colIndex === 3 && totalDebit < 0) ||
            (colIndex === 4 && totalCredit < 0)
          ) {
            cell.font = { color: { argb: "FF0000" }, bold: true };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          isWholeMonth
            ? `JournalBook ${fromMonth.format("MMMM-YYYY")}`
            : `JournalBook-${fromMonth} to ${toMonth}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData, reportData]
  );

  const commonExport = useCallback(
    async (headers, exportData, modoleName) => {
      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No data available to export.");
        }

        const processedData = exportData?.map((item) => {
          const formattedItem = { ...item };
          if (Array.isArray(item.permissions)) {
            formattedItem.permissions = item.permissions.join(", ");
          }
          return formattedItem;
        });

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add styles to cells that have data in each column
        headers?.forEach((title, index) => {
          const columnIndex = index + 1;

          // Set the column header
          const headerCell = mainSheet.getCell(1, columnIndex);
          headerCell.value = title;
          mainSheet.getColumn(columnIndex).width = Math.max(10, 20);

          // Style header
          headerCell.font = { color: { argb: "000000" }, bold: true, size: 12 };
          headerCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "95b3d7" },
          };
          headerCell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });

        processedData.forEach((item) => {
          const row = mainSheet.addRow(Object.values(item));
          const amountCell = row.getCell(30);

          amountCell.numFmt = info.numFormat.number;

          // Highlight negative values in red for clarity
          if (item.lineAmount < 0) {
            amountCell.font = { color: { argb: "FF0000" } };
          }
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = `${modoleName}.xlsx`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Data exported successfully!");
      } catch (error) {
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [headers, exportData]
  );

  return {
    exportToExcel,
    detailedTrailBalanceExport,
    balanceSheetExcel,
    exportSystem,
    exportImportSystem,
    purchasesBookExport,
    purchasesBookSummaryExport,
    CashDisburstmentBookExport,
    CashDisburstmentBookSummaryExport,
    salesJournalExport,
    salesJournalSummaryExport,
    journalBookExport,
    journalBookSummaryExport,
    commonExport,
    exportViewSystem,
  };
};

export default useExportData;
