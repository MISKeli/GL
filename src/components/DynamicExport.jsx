import React from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import exportFromJSON from "export-from-json";
import { Button } from "@mui/material";

const DynamicExport = ({
  data,
  fileName,
  fields,
  exportType = "csv",
  month,
  year,
}) => {
  const onExport = () => {
    try {
      if (!data || data?.value?.totalCount === 0) {
        throw new Error("No data available to export.");
      }
      // Processed data for export
      const processedData = data?.value?.map((item) => {
        const processedItem = {};
        for (const [key, label] of Object.entries(fields)) {
          processedItem[label] = item[key];
        }
        return processedItem;
      });

      // Convert month abbreviation to formatted string
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthIndex = monthNames.indexOf(month);
      if (month && monthIndex === -1) {
        throw new Error(
          "Invalid month abbreviation. Please use a valid three-letter abbreviation (e.g., Jan, Feb)."
        );
      }
      const formattedMonth = month ? monthNames[monthIndex] : "";
      const formattedYear = year || new Date().getFullYear();
      const datePart = `${formattedMonth}-${formattedYear}`;

      // Construct final filename
      const finalFileName = `${fileName || "ExportedData"}-${datePart}`;

      // Perform the export
      exportFromJSON({
        data: processedData,
        fileName: finalFileName,
        exportType: exportFromJSON.types[exportType],
      });

      toast.success("Data exported successfully!");
    } catch (error) {
      // Handle errors
      console.error("Export failed:", error.message);
      toast.error(`Export failed: ${error.message}`);
    }
  };
  return (
    <Button variant="contained" color="primary" onClick={onExport}>
      Export Data
    </Button>
  );
};

DynamicExport.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  fileName: PropTypes.string,
  fields: PropTypes.object.isRequired, // Object mapping data keys to export labels
  exportType: PropTypes.oneOf(["csv", "xls", "json", "txt"]), // Supported export types
  month: PropTypes.oneOf([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]), // Expected month number (1 = January, 12 = December)
  year: PropTypes.number, // Expected full year (e.g., 2024)
};

export default DynamicExport;
