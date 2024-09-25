import React, { useState } from "react";
import * as XLSX from "xlsx";
import { DataGrid } from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Close, CloudUpload } from "@mui/icons-material";
import "../../styles/customImport.scss"; // Import the SCSS file
import { useImportReportsMutation } from "../../features/api/importReportApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { importSchema } from "../../schemas/validation";
import { useForm } from "react-hook-form";
import { defaultReport } from "../../schemas/defaultValue";
import { info } from "../../schemas/info";
import moment from "moment";

const CustomImport = ({ onDataLoaded, open, onClose }) => {
  const [data, setData] = useState([]); // State to hold parsed data
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // Dialog state for DataGrid

  const {
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      addedBy: 0,
      reports: [defaultReport],
    },
    resolver: yupResolver(importSchema),
  });
  const [importData] = useImportReportsMutation();
  console.log("second", data);
  console.log(watch());

  const headerColumn = info.report_import_table_columns;

  const onDrop = (acceptedFiles) => {
    const reader = new FileReader();
    reader.readAsBinaryString(acceptedFiles[0]);
    reader.onload = (e) => {
      const fileData = e.target.result;
      const workbook = XLSX.read(fileData, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Parse data from the sheet
      let parsedData = XLSX.utils.sheet_to_json(sheet);

      // Define your custom headers mapping
      const customHeaders = info.custom_header;

      // Map the parsed data to use custom headers and handle null values
      parsedData = parsedData.map((row) => {
        const newRow = {};
        for (const key in row) {
          if (customHeaders[key]) {
            newRow[customHeaders[key]] = row[key] ? row[key] : null; // Return null if value is empty
          } else {
            newRow[key] = row[key] ? row[key] : null; // Return null if value is empty
          }
        }
        return newRow;
      });

      setData(parsedData);
      console.log("parsedData", parsedData);
      onDataLoaded(parsedData); // Call parent handler
      setIsDataGridOpen(true); // Open DataGrid dialog
    };
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
  });

  // Update form values based on grid edits
  const processRowUpdate = (newRow) => {
    setData((prevData) => {
      // Find and replace the updated row by comparing the row's unique `id`
      const updatedRows = prevData.map((row, index) => {
        return index === newRow.id ? newRow : row;
      });
      return updatedRows;
    });

    // Update the form values for validation or submission
    Object.keys(newRow).forEach((key) => {
      setValue(`reports[0].${key}`, newRow[key]); // Ensure correct path for updating the form
    });

    return newRow;
  };

  const createHeader = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      field: key,
      headerName: key,
      width: 150,
      editable: true,
    }));
  };

  const columns = createHeader();

  const rows = data.map((row, index) => ({
    ...row,
    id: index, // Unique identifier
    // transactionDate: moment(row.transactionDate).format(),
    accountingTag: row.accountingTag.toString(),
    transactionDate: moment(row.transactionDate, "MM/DD/YYYY")
      .utc()
      .toISOString(),
    mark1: row.mark1 ? row.mark1 : null,
  }));

  const handleImport = () => {
    // Submit data to backend
    handleSubmit(() => {
      console.log("Simulated Data Submission:", rows);
      importData({ reports: rows })
        .unwrap()
        .then((response) => {
          console.log("Data successfully imported:", response);
        })
        .catch((error) => {
          console.error("Error importing data:", error);
        });
    })();
    setIsDataGridOpen(false); // Close DataGrid dialog
    onClose(); // Close main import dialog
  };

  return (
    <>
      {/* First Dialog for File Upload */}
      <Dialog
        open={open}
        onClose={onClose}
        className="custom-import__dialog--main"
      >
        <DialogTitle>
          Import Data
          <Stack>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <div {...getRootProps()} className="custom-import__dropzone">
            <input {...getInputProps()} />
            <p>Drop a CSV/XLSX file or</p>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              color="success"
              className="custom-import__dropzone--button"
            >
              Click to Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Second Dialog for DataGrid */}
      <Dialog
        open={isDataGridOpen}
        onClose={() => setIsDataGridOpen(false)}
        maxWidth="lg"
        fullWidth
        className="custom-import__dialog--data-grid"
      >
        <DialogTitle>Review Imported Data</DialogTitle>
        <DialogContent
          sx={{
            height: "500px", // Set the fixed height
            overflowY: "auto", // Enable scrolling when content overflows
          }}
        >
          {data.length > 0 && (
            <DataGrid
              rows={rows}
              columns={columns}
              processRowUpdate={processRowUpdate} // Handle row updates
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              //pageSizeOptions={[5, 10, { label: "All", value: "" }]}
              checkboxSelection
              disableRowSelectionOnClick
              experimentalFeatures={{ newEditingApi: true }}
            />
          )}
        </DialogContent>
        <DialogActions className="custom-import__actions">
          <Button onClick={handleImport} variant="contained" color="primary">
            Import
          </Button>
          <Button
            onClick={() => setIsDataGridOpen(false)}
            variant="contained"
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomImport;
