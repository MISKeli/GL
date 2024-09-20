import React, { useState } from "react";
import * as XLSX from "xlsx";
import { DataGrid } from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "@mui/icons-material";

const CustomImport = ({ onDataLoaded, open, onClose }) => {
  const [data, setData] = useState([]); // State to hold parsed data
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // Dialog state for DataGrid

  const onDrop = (acceptedFiles) => {
    const reader = new FileReader();
    reader.readAsBinaryString(acceptedFiles[0]);
    reader.onload = (e) => {
      const fileData = e.target.result;
      const workbook = XLSX.read(fileData, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setData(parsedData);
      onDataLoaded(parsedData); // Call parent handler
      setIsDataGridOpen(true); // Open DataGrid dialog
    };
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
  });

  // Create DataGrid columns dynamically from parsed data
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
    id: index, // Unique identifier
    ...row,
  }));

  const handleImport = () => {
    // Logic to finalize the import (e.g., saving to the server)
    console.log("Imported Data:", data);
    setIsDataGridOpen(false); // Close DataGrid dialog
    onClose(); // Close main import dialog
  };

  return (
    <>
      {/* First Dialog for File Upload */}
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <div
            {...getRootProps()}
            className="dropzone"
            style={{
              border: "2px dashed #ccc",
              padding: "60px",
              margin: "0 40px",
              textAlign: "center",
              borderRadius: "10px", // Adding some rounded corners for a modern look
              backgroundColor: "#f9f9f9", // Light background
              fontFamily: "Lato",
            }}
          >
            <input {...getInputProps()} />
            <p>Drop a CSV/XLSX file or</p>
            <Button
              variant="contained"
              startIcon={<CloudUpload />} // Upload icon for visual appeal
              color="secondary"
              style={{
                marginTop: "10px",
              }}
            >
              Click to Upload
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained" color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Second Dialog for DataGrid */}
      <Dialog
        open={isDataGridOpen}
        onClose={() => setIsDataGridOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Review Imported Data</DialogTitle>
        <DialogContent>
          {data.length > 0 && (
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImport} variant="contained" color="primary">
            Import
          </Button>
          <Button onClick={() => setIsDataGridOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomImport;
