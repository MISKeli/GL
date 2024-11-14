const generateExcelReport = async (report, menuData, sheet) => {
  const year = Math.floor(menuData?.tag_year / 100); // Extract the year
  const month = menuData?.tag_year % 100;
  const date = moment(`${year}-${month}`, "YYYY-MM");

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(`${sheet} Report`);

  worksheet.getCell("A2").value = "RDF FEED, LIVESTOCK & FOODS, INC";
  worksheet.getCell("A3").value = date.format("MMMM YYYY");

  columnTotal.forEach((column) => {
    const cell = worksheet.getCell(`${column}3`);
    cell.value = {
      formula: `SUM(${column}7:${column}${report?.result?.length + 6})`,
      result: parseFloat(cell.value) || 0,
    };
    cell.numFmt = "#,##0.00";
  });

  titleFirstHeader?.map((title, index) => {
    const cell = worksheet.getCell(4, index + 1);
    cell.value = title?.toString();
  });
  titleHeader?.map((title, index) => {
    const cell = worksheet.getCell(6, index + 2);
    cell.value = title?.name?.toString();
    const minWidth = Mtah.max(title?.min, 20);
    worksheet.getColumn(index + 1).width = minWidth;
  });

  report?.result?.forEach((item, index) => {
    const vatValue = {
      nvat_local: item?.nvat_local,
      nvat_service: item?.nvat_service,
      vat_local: item?.vat_local,
      vat_service: item?.vat_service,
    };

    const align = {
      vertical: "middle",
      horizontal: "center",
    };
    const right = {
      vertical: "middle",
      horizontal: "right",
    };

    const taxBased = Object.keys(vatValue).find((key) => vatValue[key] !== 0);
    const rows = worksheet.getRow(index + 7);
    const row = [];
    row.push(
      item?.voucher === "check"
        ? `${item?.transactions?.apTagging?.company_code} - ${item?.transactions?.apTagging?.description}`
        : `${item?.general_journal?.apTagging?.company_code} - ${item?.general_journal?.apTagging?.description}`
    );
    row.push(
      item?.voucher === "check"
        ? item?.transactions?.supplier?.tin
        : item?.general_journal?.supplier?.tin
    );
    row.push(
      item?.voucher === "check"
        ? item?.transactions?.supplier?.company_name
        : item?.general_journal?.supplier?.company_name
    );
    row.push(
      item?.voucher === "check"
        ? item?.transactions?.supplier?.company_address
        : item?.general_journal?.supplier?.company_address
    );
    row.push(item?.coa?.name);
    row.push(
      item?.voucher === "check"
        ? item?.transactions?.description
        : item?.general_journal?.description
    );
    row.push(
      item?.voucher === "check"
        ? `${item?.transactions?.documentType?.code} ${item?.transactions?.invoice_no}`
        : `${item?.general_journal?.documentType?.code} ${item?.general_journal?.invoice_no}`
    );
    row.push(
      moment(
        item?.voucher === "check"
          ? item?.transactions?.date_invoice
          : item?.general_journal?.date_invoice
      )?.format("MMMM DD, YYYY")
    );
    row.push(item?.location?.name);
    row.push(
      item?.voucher === "check"
        ? `${item?.transactions?.tag_year} - ${item?.transactions?.tag_no}`
        : `${item?.general_journal?.tag_year} - ${item?.general_journal?.tag_no}`
    );
    row.push(
      item?.voucher === "check"
        ? item?.transactions?.transactionChecks?.voucher_number
        : item?.general_journal?.voucher_number
    );
    //atc
    row.push(item?.atc?.code);
    row.push(item?.amount);
    row.push(vatValue[taxBased] || 0);
    row.push(item?.wtax_payable_cr);
    row.push(item?.vat_input_tax);
    row.push(item?.supplierType?.wtax);
    row.push(vatValue[taxBased] || 0);
    row.push(item?.wtax_payable_cr);

    rows.values = row;
    rows.font = {
      name: "Century Gothic",
      size: 10,
      bold: false,
    };

    const columnsToAlign = [8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    columnsToAlign.forEach((col) => {
      try {
        const cell = worksheet.getCell(index + 7, col);
        const cellValue = parseFloat(cell.value);
        if (!isNaN(cellValue) && col !== 10) {
          cell.value = cellValue;
          cell.numFmt = "#,##0.00";
        }
        if (!isNaN(cellValue) && col === 17) {
          cell.value = cellValue / 100;
          cell.numFmt = "0%";
        }
        cell.alignment = col >= 13 ? right : align;
      } catch (error) {
        console.error(
          `Error processing cell at row ${index + 7}, col ${col}:`,
          error
        );
      }
    });
  });

  worksheet.mergeCells("R4:S5");
  worksheet.getCell("R4").value = "GRAND TOTAL";

  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 19; col++) {
      const cell = worksheet.getCell(row, col);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" },
      };
      cell.font = {
        name: "Century Gothic",
        size: 10,
        bold: true,
      };
    }
  }

  for (let row = 4; row <= 6; row++) {
    for (let col = 1; col <= 17; col++) {
      const cell = worksheet.getCell(row, col);

      cell.font = {
        name: "Century Gothic",
        size: 10,
        bold: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF99cc00" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      if (row === 4) {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      if (row === 5) {
        cell.border = {
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      if (row === 6) {
        cell.border = {
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }

      for (let row = 4; row <= 6; row++) {
        for (let col = 18; col <= 19; col++) {
          const cell = worksheet.getCell(row, col);
          if (row === 4) {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          }
          if (row === 5) {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          }
          if (row === 6) {
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          }

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFc0c0c0" },
          };
          cell.font = {
            name: "Century Gothic",
            size: 10,
            bold: true,
          };
        }
      }
    }
  }

  const generateDots = (length) => ".".repeat(length);

  let count = 0;

  footer?.forEach((item, index) => {
    const cell = worksheet.getCell(report?.result?.length + 7, index + 1);
    cell.font = {
      name: "Century Gothic",
      size: 10,
      bold: true,
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFc0c0c0" },
    };
    if (item === "Total") {
      cell.value = item;
    } else if (item === "SUM") {
      cell.value = {
        formula: `SUM(${columnTotal[count]}7:${columnTotal[count]}${
          report?.result?.length + 6
        })`,
        result: parseFloat(cell.value) || 0,
      };
      cell.numFmt = "#,##0.00";
      count++;
    } else {
      cell.value = generateDots(1000);
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${sheet} Report.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
