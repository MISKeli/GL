/* eslint-disable react/prop-types */
import { useCallback } from "react";
import { toast } from "react-toastify";
import { Workbook } from "exceljs";
import moment from "moment";
import { formatMonth } from "../../utils/dataFormat";
import { info } from "../../schemas/info";

const useExportData = (headers, exportData, reportData) => {
  console.log("report", reportData);
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
    System: reportData?.selectedSystem || "ALL",
    // ToYear: reportData?.toYear || "",
    // FromYear: reportData?.fromYear || "",
  };

  const exportToExcel = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;

        console.log(extraSentence);

        const processedData = exportData.map((item) => ({
          id: item.chartOfAccount,
          chartOfAccount: item.chartOfAccount,
          debit: item.debit,
          credit: item.credit,
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = "Trial Balance";
        mainSheet.getCell("A3").value = extraSentence;

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

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
            item.chartOfAccount,
            item.debit || 0,
            item.credit || 0,
          ]);

          const debitCell = row.getCell(2);
          const creditCell = row.getCell(3);
          debitCell.numFmt = "#,##0.00;#,##0.00";
          creditCell.numFmt = "#,##0.00;#,##0.00";

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
        const totalsRow = mainSheet.addRow(["Total", totalDebit, totalCredit]);
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
            (colIndex === 2 && totalDebit < 0) ||
            (colIndex === 3 && totalCredit < 0)
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
  // Define your custom headers mapping

  const purchasesBookExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;

        console.log(extraSentence);

        const processedData = exportData.map((item) => ({
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

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
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
          `PurchasesBook-${fromMonth} to ${toMonth}.xlsx`
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

  const CashDisburstmentBookExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

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
          debitCell.numFmt = "#,##0.00;#,##0.00";
          creditCell.numFmt = "#,##0.00;#,##0.00";

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
          `CashDisbursementBook-${fromMonth} to ${toMonth}.xlsx`
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
    async (headers, systemData, reportData, selectedSystem) => {
      const { value: data } = systemData || {};
      try {
        if (!data || data.length === 0) {
          throw new Error("No data available to export.");
        }

        const fromMonth = reportData.fromMonth;
        const toMonth = reportData.toMonth;
        const system = selectedSystem || "ALL SYSTEM";

        const extraSentence = `For the month of ${fromMonth} to ${toMonth}`;

        const processedData = data.map((item) => ({
          ...item, // This includes all fields dynamically
        }));

        const workbook = new Workbook();
        const mainSheet = workbook.addWorksheet("sheet1");

        // Add main headers
        mainSheet.getCell("A1").value = "RDF Feed Livestock & Foods Inc.";
        mainSheet.getCell("A2").value = system;
        mainSheet.getCell("A3").value = extraSentence;

        // Style the main headers
        for (let row = 1; row <= 2; row++) {
          for (let col = 1; col <= 2; col++) {
            const firstHeader = mainSheet.getCell(row, col);
            firstHeader.font = { bold: true, size: 10 };
          }
        }

        //   // Style the column headers
        //   for (let row = 6; row <= 7; row++) {
        //     for (let col = 1; col <= 3; col++) {
        //       const cell = mainSheet.getCell(row, col);
        //       cell.fill = {
        //         type: "pattern",
        //         pattern: "solid",
        //         fgColor: { argb: "95b3d7" },
        //       };
        //       cell.font = { color: { argb: "000000" }, size: 10, bold: true };
        //       cell.border = {
        //         top: { style: "thin" },
        //         bottom: { style: "thin" },
        //         left: { style: "thin" },
        //         right: { style: "thin" },
        //       };
        //     }
        //   }

        //     // Add column headers
        // headers?.forEach((title, index) => {
        //   const cell = mainSheet.getCell(7, index + 1);
        //   cell.value = title;
        //   mainSheet.getColumn(index + 1).width = Math.max(10, 20);
        // });

        // // Add data rows with formatting
        // processedData.forEach((item) => {
        //   const row = mainSheet.addRow([
        //     ...item
        //   ]);

        //   const debitCell = row.getCell(2);
        //   const creditCell = row.getCell(3);
        //   debitCell.numFmt = "#,##0.00;#,##0.00";
        //   creditCell.numFmt = "#,##0.00;#,##0.00";

        //   if (item.debit < 0) {
        //     debitCell.font = { color: { argb: "FF0000" } };
        //   }
        //   if (item.credit < 0) {
        //     creditCell.font = { color: { argb: "FF0000" } };
        //   }
        // });

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
    [headers, reportData]
  );

  const salesJournalExport = useCallback(
    async (headers, exportData, reportData) => {
      const { fromMonth, toMonth } = reportData;

      try {
        if (!exportData || exportData.length === 0) {
          throw new Error("No exportData available to export.");
        }

        const extraSentence = `For the month of ${
          fillParams.FromMonth || fromMonth
        } to ${fillParams.ToMonth || toMonth}`;

        console.log(extraSentence);

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
          `SalesJournalBook-${fromMonth} to ${toMonth}.xlsx`
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

  return {
    exportToExcel,
    exportSystem,
    exportImportSystem,
    purchasesBookExport,
    CashDisburstmentBookExport,
    salesJournalExport,
  };
};

export default useExportData;
