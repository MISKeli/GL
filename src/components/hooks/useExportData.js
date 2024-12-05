import { useCallback } from "react";
import { toast } from "react-toastify";
import { Workbook } from "exceljs";

const useExportData = (headers, exportData, reportData) => {
  const exportToExcel = useCallback(
    async (headers, exportData, reportData) => {
      const { value: data } = exportData || {};

      try {
        if (!data || data.length === 0) {
          throw new Error("No data available to export.");
        }

        const extraSentence = `For the month of ${reportData.Month} ${reportData.Year}`;
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
          debitCell.numFmt = "#,##0.00";
          creditCell.numFmt = "#,##0.00";

          if (item.debit < 0) {
            debitCell.value = Math.abs(item.debit);
            debitCell.font = { color: { argb: "FF0000" } };
          }
          if (item.credit < 0) {
            creditCell.value = Math.abs(item.credit);
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
          cell.numFmt = "#,##0.00";
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
            cell.value = Math.abs(cell.value);
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
          `TrialBalance-${reportData.Month}-${reportData.Year}.xlsx`
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

  return { exportToExcel };
};

export default useExportData;
