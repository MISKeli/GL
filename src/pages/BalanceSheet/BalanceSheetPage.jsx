import { Box, Button, Typography } from "@mui/material";
import React, { useMemo, useRef, useState } from "react";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import { info } from "../../schemas/info";
import "../../styles/BalanceSheet/BalanceSheetPage.scss";
import moment from "moment";

import DataTable from "../../components/Tables/dataTable";
import OnExportButton from "../../components/OnExportButton";
import { useGenerateBalanceSheetQuery } from "../../features/api/boaApi";
import useExportData from "../../components/hooks/useExportData";

import { useReactToPrint } from "react-to-print";
import { Print } from "@mui/icons-material";
import PrintableBalanceSheet from "./PrintableBalanceSheet";
import { toast } from "sonner";
import useSkipFetchingQuery from "../../components/hooks/useSkipFetchingQuery";

const BalanceSheetPage = () => {
  const [reportData, setReportData] = useState({
    FromMonth: moment().startOf("month").format(info.dateFormat).toString(),
    ToMonth: moment().endOf("month").format(info.dateFormat).toString(),
  });

  // Print functionality
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "AwesomeFileName",
    // onAfterPrint: handleAfterPrint,
    // onBeforePrint: handleBeforePrint,
  });

  const asset = info.balanceSheet.tableColumns.asset;
  const liabilities = info.balanceSheet.tableColumns.liabilities;
  const capital = info.balanceSheet.tableColumns.capital;

  const { isSkip, triggerQuery } = useSkipFetchingQuery();

  //Balance Sheet
  const {
    data: sheetData,
    isLoading: isSheetLoading,
    isFetching: isSheetFetching,
  } = useGenerateBalanceSheetQuery(
    {
      FromMonth: reportData?.fromMonth || "",
      ToMonth: reportData?.toMonth || "",
      UsePagination: false,
    },
    {
      skip: isSkip,
    }
  );

  const balanceSheetData = sheetData?.value?.balanceSheet;

  const hasData = balanceSheetData && balanceSheetData.length > 0;

  const transformedData = useMemo(() => {
    if (!balanceSheetData) {
      return {
        assetRows: [],
        liabilitiesRows: [],
        capitalRows: [],
        assetTotal: null,
        liabilitiesTotal: null,
        capitalTotal: null,
        balanceSheetTotal: null,
        varianceTotal: null,
      };
    }

    const formatNumber = (number, accountSubGroup = "", accountType = "") => {
      const isNegative = number < 0;
      const isAccumDepr =
        accountSubGroup === "Accum Depr - Property, Plant & Equipment";

      // For Accum Depr, show as negative with red color and parentheses
      const shouldBeRed = isAccumDepr;

      // For Accum Depr, use the absolute value but display as negative
      const roundedNumber = parseFloat(number.toFixed(2));
      let absoluteValue;
      let displayValue;

      if (isAccumDepr) {
        // For Accum Depr, we want to show it as negative regardless of the original sign
        absoluteValue = Math.abs(roundedNumber);
        displayValue = -absoluteValue; // Always negative for display
      } else {
        absoluteValue = isNegative
          ? parseFloat(roundedNumber.toString().slice(1))
          : roundedNumber;
        displayValue = roundedNumber;
      }

      const formattedNumber = absoluteValue
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // Format based on color and negative status
      let finalFormattedNumber;
      if (isAccumDepr) {
        // Accum Depr shows in red parentheses
        finalFormattedNumber = `(${formattedNumber})`;
      } else if (shouldBeRed && isNegative) {
        // Red negative values go in parentheses
        finalFormattedNumber = `(${formattedNumber})`;
      } else if (isNegative) {
        // Non-red negative values keep the negative sign
        finalFormattedNumber = `${formattedNumber}`;
      } else {
        // Positive values stay as is
        finalFormattedNumber = formattedNumber;
      }

      return {
        formattedNumber: finalFormattedNumber,
        color: shouldBeRed ? "red" : "inherit",
        rawValue: displayValue, // Store the display value (negative for Accum Depr)
      };
    };

    // Get subtotals first
    const currentAssetTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "ASSET" &&
        item.accountGroup === "Current Assets" &&
        item.accountSubGroup === "Total"
    );

    const nonCurrentAssetTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "ASSET" &&
        item.accountGroup === "Non-Current Assets" &&
        item.accountSubGroup === "Total"
    );

    const currentLiabilitiesTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "LIABILITIES" &&
        item.accountGroup === "Current Liabilities" &&
        item.accountSubGroup === "Total"
    );

    const nonCurrentLiabilitiesTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "LIABILITIES" &&
        item.accountGroup === "Non-Current Liabilities" &&
        item.accountSubGroup === "Total"
    );

    const equityTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "CAPITAL" &&
        item.accountGroup === "Shareholders' Equity" &&
        item.accountSubGroup === "Total"
    );

    // Filter and transform ASSET data
    const assetData = balanceSheetData.filter(
      (item) => item.accountType === "ASSET" && item.accountSubGroup !== "Total"
    );

    const assetRows = [];
    let currentGroup = "";

    assetData.forEach((item, index) => {
      const formatted = formatNumber(
        item.lineAmount,
        item.accountSubGroup,
        item.accountType
      );

      // Show accountGroup only for the first occurrence of each group
      const shouldShowGroup = currentGroup !== item.accountGroup;

      if (shouldShowGroup) {
        currentGroup = item.accountGroup;
      }

      assetRows.push({
        id: `asset-${item.id || index}`, // Include ID
        asset: shouldShowGroup ? item.accountGroup : "",
        assetData: item.accountSubGroup,
        assetAmount: formatted.formattedNumber,
        assetAmountColor: formatted.color,
        rawAmount: formatted.rawValue, // Store raw value
        originalData: item, // Store original data for export
      });

      // Add subtotal after Current Assets group
      if (
        item.accountGroup === "Current Assets" &&
        (index === assetData.length - 1 ||
          assetData[index + 1].accountGroup !== "Current Assets")
      ) {
        if (currentAssetTotal) {
          const subtotalFormatted = formatNumber(
            currentAssetTotal.lineAmount,
            "",
            "ASSET"
          );
          assetRows.push({
            id: `subtotal-current-assets-${currentAssetTotal.id}`,
            asset: "Total Current Assets",
            assetData: "",
            assetAmount: subtotalFormatted.formattedNumber,
            assetAmountColor: subtotalFormatted.color,
            rawAmount: subtotalFormatted.rawValue,
            isSubtotal: true, // Flag to style differently if needed
            originalData: currentAssetTotal,
          });
        }
      }

      // Add subtotal after Non-Current Assets group
      if (
        item.accountGroup === "Non-Current Assets" &&
        (index === assetData.length - 1 ||
          assetData[index + 1].accountGroup !== "Non-Current Assets")
      ) {
        if (nonCurrentAssetTotal) {
          const subtotalFormatted = formatNumber(
            nonCurrentAssetTotal.lineAmount,
            "",
            "ASSET"
          );
          assetRows.push({
            id: `subtotal-non-current-assets-${nonCurrentAssetTotal.id}`,
            asset: "Total Non-Current Assets",
            assetData: "",
            assetAmount: subtotalFormatted.formattedNumber,
            assetAmountColor: subtotalFormatted.color,
            rawAmount: subtotalFormatted.rawValue,
            isSubtotal: true,
            originalData: nonCurrentAssetTotal,
          });
        }
      }
    });

    // Filter and transform LIABILITIES data
    const liabilitiesData = balanceSheetData.filter(
      (item) =>
        item.accountType === "LIABILITIES" && item.accountSubGroup !== "Total"
    );

    const liabilitiesRows = [];
    currentGroup = "";

    liabilitiesData.forEach((item, index) => {
      const formatted = formatNumber(
        item.lineAmount,
        item.accountSubGroup,
        item.accountType
      );

      const shouldShowGroup = currentGroup !== item.accountGroup;

      if (shouldShowGroup) {
        currentGroup = item.accountGroup;
      }

      liabilitiesRows.push({
        id: `liabilities-${item.id || index}`,
        liabilities: shouldShowGroup ? item.accountGroup : "",
        liabilitiesData: item.accountSubGroup,
        liabilitiesAmount: formatted.formattedNumber,
        liabilitiesAmountColor: formatted.color,
        rawAmount: formatted.rawValue,
        originalData: item,
      });

      // Add subtotal after Current Liabilities group
      if (
        item.accountGroup === "Current Liabilities" &&
        (index === liabilitiesData.length - 1 ||
          liabilitiesData[index + 1].accountGroup !== "Current Liabilities")
      ) {
        if (currentLiabilitiesTotal) {
          const subtotalFormatted = formatNumber(
            currentLiabilitiesTotal.lineAmount,
            "",
            "LIABILITIES"
          );
          liabilitiesRows.push({
            id: `subtotal-current-liabilities-${currentLiabilitiesTotal.id}`,
            liabilities: "Total Current Liabilities",
            liabilitiesData: "",
            liabilitiesAmount: subtotalFormatted.formattedNumber,
            liabilitiesAmountColor: subtotalFormatted.color,
            rawAmount: subtotalFormatted.rawValue,
            isSubtotal: true,
            originalData: currentLiabilitiesTotal,
          });
        }
      }

      // Add subtotal after Non-Current Liabilities group
      if (
        item.accountGroup === "Non-Current Liabilities" &&
        (index === liabilitiesData.length - 1 ||
          liabilitiesData[index + 1].accountGroup !== "Non-Current Liabilities")
      ) {
        if (nonCurrentLiabilitiesTotal) {
          const subtotalFormatted = formatNumber(
            nonCurrentLiabilitiesTotal.lineAmount,
            "",
            "LIABILITIES"
          );
          liabilitiesRows.push({
            id: `subtotal-non-current-liabilities-${nonCurrentLiabilitiesTotal.id}`,
            liabilities: "Total Non-Current Liabilities",
            liabilitiesData: "",
            liabilitiesAmount: subtotalFormatted.formattedNumber,
            liabilitiesAmountColor: subtotalFormatted.color,
            rawAmount: subtotalFormatted.rawValue,
            isSubtotal: true,
            originalData: nonCurrentLiabilitiesTotal,
          });
        }
      }
    });

    // Filter and transform CAPITAL data
    const capitalData = balanceSheetData.filter(
      (item) =>
        item.accountType === "CAPITAL" && item.accountSubGroup !== "Total"
    );

    const capitalRows = [];

    capitalData.forEach((item, index) => {
      const formatted = formatNumber(
        item.lineAmount,
        item.accountSubGroup,
        item.accountType
      );

      capitalRows.push({
        id: `capital-${item.id || index}`,
        capital: index === 0 ? "CAPITAL" : "",
        capitalData: item.accountSubGroup,
        capitalAmount: formatted.formattedNumber,
        capitalAmountColor: formatted.color,
        rawAmount: formatted.rawValue,
        originalData: item,
      });

      // Add equity subtotal after Shareholders' Equity group
      if (
        item.accountGroup === "Shareholders' Equity" &&
        (index === capitalData.length - 1 ||
          capitalData[index + 1].accountGroup !== "Shareholders' Equity")
      ) {
        if (equityTotal) {
          const subtotalFormatted = formatNumber(
            equityTotal.lineAmount,
            "",
            "CAPITAL"
          );
          capitalRows.push({
            id: `subtotal-equity-${equityTotal.id}`,
            capital: "Total Shareholders' Equity",
            capitalData: "",
            capitalAmount: subtotalFormatted.formattedNumber,
            capitalAmountColor: subtotalFormatted.color,
            rawAmount: subtotalFormatted.rawValue,
            isSubtotal: true,
            originalData: equityTotal,
          });
        }
      }
    });

    // Get main totals
    const assetTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "ASSET" &&
        item.accountGroup === null &&
        item.accountSubGroup === "Total"
    );

    const liabilitiesTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "LIABILITIES" &&
        item.accountGroup === null &&
        item.accountSubGroup === "Total"
    );

    const capitalTotal = balanceSheetData.find(
      (item) =>
        item.accountType === "CAPITAL" &&
        item.accountGroup === null &&
        item.accountSubGroup === "Total"
    );

    // Calculate balance sheet total
    const calculateBalanceSheetTotal = () => {
      const liabilitiesAmount = liabilitiesTotal
        ? liabilitiesTotal.lineAmount
        : 0;
      const capitalAmount = capitalTotal ? capitalTotal.lineAmount : 0;
      return liabilitiesAmount + capitalAmount;
    };

    const balanceSheetTotalAmount = calculateBalanceSheetTotal();

    // Calculate variance (Total Liabilities & Equity - Total Assets)
    const calculateVariance = () => {
      const totalLiabilitiesAndEquity = Math.abs(balanceSheetTotalAmount);
      const totalAssets = assetTotal ? assetTotal.lineAmount : 0;
      return totalLiabilitiesAndEquity - totalAssets;
    };

    const varianceAmount = calculateVariance();

    return {
      assetRows,
      liabilitiesRows,
      capitalRows,
      assetTotal: assetTotal
        ? (() => {
            const formatted = formatNumber(assetTotal.lineAmount, "", "ASSET");
            return {
              id: `total-assets-${assetTotal.id}`,
              asset: "TOTAL ASSETS",
              assetData: "",
              assetAmount: formatted.formattedNumber,
              assetAmountColor: formatted.color,
              rawAmount: formatted.rawValue,
              originalData: assetTotal,
            };
          })()
        : null,
      liabilitiesTotal: liabilitiesTotal
        ? (() => {
            const formatted = formatNumber(
              liabilitiesTotal.lineAmount,
              "",
              "LIABILITIES"
            );
            return {
              id: `total-liabilities-${liabilitiesTotal.id}`,
              liabilities: "TOTAL LIABILITIES",
              liabilitiesData: "",
              liabilitiesAmount: formatted.formattedNumber,
              liabilitiesAmountColor: formatted.color,
              rawAmount: formatted.rawValue,
              originalData: liabilitiesTotal,
            };
          })()
        : null,
      capitalTotal: capitalTotal
        ? (() => {
            const formatted = formatNumber(
              capitalTotal.lineAmount,
              "",
              "CAPITAL"
            );
            return {
              id: `total-capital-${capitalTotal.id}`,
              capital: "TOTAL CAPITAL",
              capitalData: "",
              capitalAmount: formatted.formattedNumber,
              capitalAmountColor: formatted.color,
              rawAmount: formatted.rawValue,
              originalData: capitalTotal,
            };
          })()
        : null,
      balanceSheetTotal:
        balanceSheetTotalAmount !== 0
          ? {
              id: "balance-sheet-total",
              total: "",
              totalData: "TOTAL LIABILITIES AND EQUITY",
              totalAmount: formatNumber(balanceSheetTotalAmount, "", "TOTAL")
                .formattedNumber,
              totalAmountColor: formatNumber(
                balanceSheetTotalAmount,
                "",
                "TOTAL"
              ).color,
              rawAmount: balanceSheetTotalAmount,
            }
          : null,
      varianceTotal: {
        id: "variance-total",
        variance: "",
        varianceData: "VARIANCE",
        varianceAmount: formatNumber(varianceAmount, "", "VARIANCE")
          .formattedNumber,
        varianceAmountColor:
          Math.abs(varianceAmount) > 0.01 ? "red" : "inherit",
        rawAmount: varianceAmount,
      },
    };
  }, [sheetData]);

  const { balanceSheetExcel } = useExportData();

  const onExport = async () => {
    if (isSheetLoading || isSheetFetching) {
      return;
    }

    toast.info("Export started");

    try {
      // Create proper headers array for balance sheet
      const headers = info.balanceSheet.ExportHeader;

      // Prepare the export data using raw values
      const exportData = prepareBalanceSheetForExport(transformedData);

      const filename = `Balance Sheet as of ${reportData?.toMonth}`;
      await balanceSheetExcel(headers, exportData, filename);

      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message || "Export failed");
    }
  };

  // Helper function to prepare the transformed data for export using raw values
  const prepareBalanceSheetForExport = (transformedData) => {
    const exportRows = [];
    let lastAccountType = "";

    // Add Assets accountType header
    exportRows.push({
      accountType: "ASSETS",
      accountGroup: "",
      accountDetails: "",
      amount: "",
    });
    lastAccountType = "ASSETS";

    // Add asset rows using raw amounts
    transformedData.assetRows.forEach((row) => {
      const currentAccountType = row.isSubtotal ? "" : "ASSETS";
      exportRows.push({
        accountType:
          currentAccountType === lastAccountType ? "" : currentAccountType,
        accountGroup: row.asset,
        accountDetails: row.assetData,
        amount: row.rawAmount || 0,
      });
      if (currentAccountType) lastAccountType = currentAccountType;
    });

    // Add asset total
    if (transformedData.assetTotal) {
      exportRows.push({
        accountType: "",
        accountGroup: "",
        accountDetails: "TOTAL ASSETS",
        amount: transformedData.assetTotal.rawAmount || 0,
      });
    }

    // Add separator
    exportRows.push({
      accountType: "",
      accountGroup: "",
      accountDetails: "",
      amount: "",
    });

    // Add Liabilities accountType header
    exportRows.push({
      accountType: "LIABILITIES",
      accountGroup: "",
      accountDetails: "",
      amount: "",
    });
    lastAccountType = "LIABILITIES";

    // Add liabilities rows using raw amounts
    transformedData.liabilitiesRows.forEach((row) => {
      const currentAccountType = row.isSubtotal ? "" : "LIABILITIES";
      exportRows.push({
        accountType:
          currentAccountType === lastAccountType ? "" : currentAccountType,
        accountGroup: row.liabilities,
        accountDetails: row.liabilitiesData,
        amount: row.rawAmount || 0,
      });
      if (currentAccountType) lastAccountType = currentAccountType;
    });

    // Add liabilities total
    if (transformedData.liabilitiesTotal) {
      exportRows.push({
        accountType: "",
        accountGroup: "",
        accountDetails: "TOTAL LIABILITIES",
        amount: transformedData.liabilitiesTotal.rawAmount || 0,
      });
    }

    // Add separator
    exportRows.push({
      accountType: "",
      accountGroup: "",
      accountDetails: "",
      amount: "",
    });

    // Add Capital accountType header
    exportRows.push({
      accountType: "CAPITAL/EQUITY",
      accountGroup: "",
      accountDetails: "",
      amount: "",
    });
    lastAccountType = "CAPITAL/EQUITY";

    // Add capital rows using raw amounts
    transformedData.capitalRows.forEach((row) => {
      const currentAccountType = row.isSubtotal ? "" : "CAPITAL/EQUITY";
      exportRows.push({
        accountType:
          currentAccountType === lastAccountType ? "" : currentAccountType,
        accountGroup: row.capital,
        accountDetails: row.capitalData,
        amount: row.rawAmount || 0,
      });
      if (currentAccountType) lastAccountType = currentAccountType;
    });

    // Add capital total
    if (transformedData.capitalTotal) {
      exportRows.push({
        accountType: "",
        accountGroup: "",
        accountDetails: "TOTAL CAPITAL",
        amount: transformedData.capitalTotal.rawAmount || 0,
      });
    }

    // Add final balance sheet total
    if (transformedData.balanceSheetTotal) {
      exportRows.push({
        accountType: "",
        accountGroup: "",
        accountDetails: "",
        amount: "",
      });

      exportRows.push({
        accountType: "",
        accountGroup: "",
        accountDetails: transformedData.balanceSheetTotal.totalData,
        amount: transformedData.balanceSheetTotal.rawAmount || 0,
      });
    }

    // Add variance
    if (transformedData.varianceTotal) {
      exportRows.push({
        accountType: "",
        accountGroup: "",
        accountDetails: transformedData.varianceTotal.varianceData,
        amount: transformedData.varianceTotal.rawAmount || 0,
      });
    }

    return exportRows;
  };

  const handleReportDataChange = (newReportData) => {
    setReportData(newReportData);
    triggerQuery();
  };

  return (
    <>
      <Box className="sheet">
        <Box className="sheet__header">
          <Typography variant="h5" className="sheet__header-title">
            {info.balanceSheet.title}
          </Typography>
          <DateSearchCompoment
            setReportData={handleReportDataChange}
            isTrailBalance={true}
          />
        </Box>
        <Box className="sheet__content" gap={1}>
          <Box className="sheet__content-container-1">
            <DataTable
              header={asset}
              rows={transformedData.assetRows}
              isFetching={isSheetFetching}
              isLoading={isSheetLoading}
              grandTotal={transformedData.assetTotal}
            />
          </Box>
          <Box className="sheet__content-container" gap={1}>
            <Box className="sheet__content-container-2">
              <DataTable
                header={liabilities}
                rows={transformedData.liabilitiesRows}
                isFetching={isSheetFetching}
                isLoading={isSheetLoading}
                grandTotal={transformedData.liabilitiesTotal}
              />
            </Box>
            <Box className="sheet__content-container-3">
              <DataTable
                header={capital}
                rows={transformedData.capitalRows}
                isFetching={isSheetFetching}
                isLoading={isSheetLoading}
                grandTotal={transformedData.capitalTotal}
              />
            </Box>
            <Box className="sheet__content-container-4" gap={1}>
              <Typography
                className="sheet__content-container-4--total"
                fontWeight={"bold"}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>TOTAL LIABILITIES AND EQUITY:</span>
                <span>
                  {transformedData.balanceSheetTotal?.totalAmount || "—"}
                </span>
              </Typography>
              <Typography
                className="sheet__content-container-4--variance"
                fontWeight={"bold"}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color:
                    transformedData.varianceTotal?.varianceAmountColor ||
                    "inherit",
                }}
              >
                <span>VARIANCE:</span>
                <span>
                  {transformedData.varianceTotal?.varianceAmount || "—"}
                </span>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className="sheet__footer" gap={2}>
          <OnExportButton
            onExport={onExport}
            hasData={hasData}
            isLoading={isSheetLoading}
            isFetching={isSheetFetching}
          />

          {/* <Button
            variant="contained"
            color="primary"
            startIcon={<Print />}
            onClick={handlePrint}
            disabled={!hasData || isSheetLoading || isSheetFetching}
            sx={{ minWidth: 120 }}
          >
            Print
          </Button> */}
        </Box>
      </Box>
      <div
        style={{
          position: "absolute",
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
        }}
      >
        <div
          ref={printRef}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <PrintableBalanceSheet
            transformedData={transformedData}
            reportData={reportData}
            companyName="RDF" // Optional: customize this
          />
        </div>
      </div>
    </>
  );
};

export default BalanceSheetPage;
