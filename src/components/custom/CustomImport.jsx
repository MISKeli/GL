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

const CustomImport = ({ onDataLoaded, open, onClose }) => {
  const [data, setData] = useState([]); // State to hold parsed data
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // Dialog state for DataGrid

  const {
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reports: [
        {
          syncId: 0,
          mark1: "",
          mark2: "",
          assetCIP: "",
          accountingTag: "",
          transactionDate: Date("YYYY-MM-DD HH:mm:ss"),
          clientSupplier: "",
          accountTitleCode: "",
          accountTitle: "",
          companyCode: "",
          company: "",
          divisionCode: "",
          division: "",
          departmentCode: "",
          department: "",
          unitCode: "",
          unit: "",
          subUnitCode: "",
          subUnit: "",
          locationCode: "",
          location: "",
          poNumber: "",
          referenceNo: "",
          itemCode: "",
          itemDescription: "",
          quantity: 0,
          uom: "",
          unitPrice: 0,
          lineAmount: 0,
          voucherJournal: "",
          accountType: "",
          drcp: "",
          assetCode: "",
          asset: "",
          serviceProviderCode: "",
          serviceProvider: "",
          boa: "",
          allocation: "",
          accountGroup: "",
          accountSubGroup: "",
          financialStatement: "",
          unitResponsible: "",
          batch: "",
          remarks: "",
          payrollPeriod: "",
          position: "",
          payrollType: "",
          payrollType2: "",
          depreciationDescription: "",
          remainingDepreciationValue: "",
          usefulLife: "",
          month: "",
          year: "",
          particulars: "",
          month2: "",
          farmType: "",
          jeanRemarks: "",
          from: "",
          changeTo: "",
          reason: "",
          checkingRemarks: "",
          boA2: "",
          system: "",
          books: "",
        },
      ],
    },
    resolver: yupResolver(importSchema),
  });
  const [importData] = useImportReportsMutation();

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

  // Update form values based on grid edits
  const processRowUpdate = (newRow) => {
    setData((prevData) => {
      const updatedRows = prevData.map((row) =>
        row.id === newRow.id ? newRow : row
      );
      return updatedRows;
    });

    // Update form values for validation
    Object.keys(newRow).forEach((key) => {
      setValue(key, newRow[key]); // Update form with new values
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

  // Columns for DataGrid
  // const columns = Object.keys(data[0] || {}).map((key) => ({
  //   field: key,
  //   headerName: key,
  //   width: 150,
  //   editable: true, // Enable editing for each column
  // }));

  const rows = data.map((row, index) => ({
    id: index, // Unique identifier
    ...row,
  }));

  const handleImport = () => {
    // Submit data to backend
    handleSubmit((formData) => {
      importData(formData)
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

    // console.log("Imported Data:", data);
    // setIsDataGridOpen(false); // Close DataGrid dialog
    // onClose(); // Close main import dialog
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
              color="secondary"
              className="custom-import__dropzone--button"
            >
              Click to Upload
            </Button>
          </div>
        </DialogContent>
        {/* <DialogActions className="custom-import__actions">
          <Button onClick={onClose} variant="contained" color="primary">
            Cancel
          </Button>
        </DialogActions> */}
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
              pageSizeOptions={[5, 10, { label: "All", value: "" }]}
              checkboxSelection
              disableRowSelectionOnClick
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
