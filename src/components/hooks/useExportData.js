/* eslint-disable react/prop-types */
import { useCallback } from "react";
import { toast } from "react-toastify";
import { Workbook } from "exceljs";
import moment from "moment";
import { formatMonth } from "../../utils/dataFormat";
import { info } from "../../schemas/info";

const useExportData = (headers, exportData, reportData) => {
  const fillParams = {
    FromMonth: reportData?.fromMonth || "",
    ToMonth: reportData?.toMonth || "",
    ToYear: reportData?.toYear || "",
    FromYear: reportData?.fromYear || "",
  };
  const exportToExcel = useCallback(
    async (headers, exportData, reportData) => {
      const { value: data } = exportData || {};

      try {
        if (!data || data.length === 0) {
          throw new Error("No data available to export.");
        }

        const fromMonth = formatMonth(fillParams.FromMonth);
        const toMonth = formatMonth(fillParams.ToMonth);
        const fromYear = formatMonth(fillParams.FromYear);
        const toYear = formatMonth(fillParams.ToYear);

        const extraSentence = `For the month of ${fromMonth},${fromYear} to ${toMonth},${toYear}`;

        const processedData = data.map((item) => ({
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
          `TrialBalance-${fromMonth},${fromYear} to ${toMonth},${toYear}.xlsx`
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

  return { exportToExcel, exportSystem };
};

export default useExportData;
