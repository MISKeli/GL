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
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Close, CloudUpload } from "@mui/icons-material";
import "../../styles/customImport.scss"; // Import the SCSS file
import { useImportReportsMutation } from "../../features/api/importReportApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { importSchema } from "../../schemas/validation";
import { useForm } from "react-hook-form";
import { defaultValue } from "../../schemas/defaultValue";
import { info } from "../../schemas/info";
import moment from "moment";
import { toast } from "sonner";

const CustomImport = ({ onDataLoaded, open, onClose, system }) => {
  const [data, setData] = useState([]); // Holds parsed data
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // For DataGrid dialog
 // const [isFetchingDuplicates, setIsFetchingDuplicates] = useState(false); // Loader state for duplicates
  const [errorReports, setErrorReports] = useState([]); // Holds error reports for duplicates
  const [isLoading, setIsLoading] = useState(false); // Loading state for the import
  const [importedData, setImportedData] = useState([]); // Holds data after import
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false); // For duplicate dialog

  const {
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      addedBy: 0,
      reports: [defaultValue.report],
    },
    resolver: yupResolver(importSchema),
  });
  //console.log("dup", errorReports);
  //console.log("dup2", data);
  // Import mutation with loading and fetching indicators
  const [importData, { isFetching }] = useImportReportsMutation();

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
            newRow[customHeaders[key]] = row[key]
              ? row[key]
              : typeof row[key] === "number"
              ? 0
              : null; // Return null if value is empty
          } else {
            newRow[key] = row[key]
              ? row[key]
              : typeof row[key] === "number"
              ? 0
              : null; // Return null if value is empty
          }
        }
        return newRow;
      });
      console.log("lineAmount", parsedData?.lineAmount);

      setData(parsedData);
      onDataLoaded(parsedData); // Call parent handler

      // Close the first dialog and open the second dialog for review
      onClose(); // Close the main import dialog
      setIsDataGridOpen(true); // Open DataGrid dialog for review
    };
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
  });

  const processRowUpdate = (newRow) => {
    const originalRow = data[newRow.id];
    const updatedRow = {
      ...originalRow,
      ...newRow,
      transactionDate: newRow.transactionDate
        ? moment(newRow.transactionDate).utc().toISOString()
        : originalRow.transactionDate,
    };

    setData((prevData) => {
      const updatedRows = prevData.map((row, index) => {
        return index === newRow.id ? updatedRow : row;
      });

      return updatedRows;
    });

    Object.keys(updatedRow).forEach((key) => {
      setValue(`reports[0].${key}`, updatedRow[key]);
    });

    return updatedRow;
  };

  const createHeader = () => {
    if (data.length === 0) return [];
    const columnToHide = "syncId"; // Replace "id" with the field you want to hide
    const nonEditableColumns = [
      "syncId",
      "system",
      "drcp",
      "quantity",
      "lineAmount",
      "unitPrice",
    ];
    return Object.keys(data[0])
      .filter((key) => key !== columnToHide) // Exclude the column you want to hide
      .map((key) => ({
        field: key,
        headerName: key,
        width: 150,
        editable: !nonEditableColumns.includes(key),
      }));
  };

  const createHeaderDuplicate = () => {
    if (errorReports.length === 0) return [];
    return Object.keys(errorReports[0]).map((key) => ({
      field: key,
      headerName: key,
      width: 150,
      editable: true,
    }));
  };

  const columns = createHeader();

  const rows = data.map((row, index) => ({
    ...row,
    id: row.id || index, // Unique identifier
    accountingTag: row.accountingTag?.toString(),
    transactionDate: moment(row.transactionDate, "MM/DD/YYYY")
      .utc()
      .toISOString(),
    mark1: row.mark1 ? row.mark1 : null,
  }));
  console.log("Gawang row", rows);

  const lineAmountTotal = rows.reduce((acc, row) => {
    return Math.max(0, acc + (row.lineAmount || 0));
  }, 0);
  console.log("lineAmountTotal", lineAmountTotal);

  const rowsDuplicate = errorReports.map((row, index) => ({
    ...row,
    id: row.id || index, // Unique identifier
    accountingTag: row.accountingTag?.toString(),
    transactionDate: moment(row.transactionDate, "MM/DD/YYYY")
      .utc()
      .toISOString(),
  }));
  const columnsDuplicate = createHeaderDuplicate();

  const handleImport = () => {
    handleSubmit(async () => {
      const transformedRows = rows.map((row) => ({
        ...row,
        transactionDate: row.transactionDate
          ? moment(row.transactionDate).utc().toISOString()
          : moment().utc().toISOString(),
      }));
      setIsDataGridOpen(false); // Close DataGrid dialog

      try {
        setIsLoading(true); // Start loading
        const response = await importData({
          reports: transformedRows,
        }).unwrap();
        toast.success("Imported Successfully.");
        setImportedData(response); // Save imported data
        setIsDataGridOpen(false); // Close DataGrid dialog
        onClose(); // Close main import dialog
      } catch (error) {
        toast.error(error?.data?.message || "Failed to import data.");

        // Check for duplicates in the error response

        setErrorReports(error?.data?.value.duplicateReports || []);
        setIsDuplicateDialogOpen(true); // Open duplicate dialog
      } finally {
        setIsDataGridOpen(false);
        setIsLoading(false); // Stop loading
      }
    })();
  };

  return (
    <>
      <Dialog
        open={open}
        // onClose={() => {
        //   onClose();
        //   setData({});
        // }}
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

      {/* Second Dialog - DataGrid for Reviewing Imported Data */}
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
          {isFetching || isLoading ? (
            <CircularProgress />
          ) : (
            data.length > 0 && (
              <DataGrid
                rows={rows}
                columns={columns}
                processRowUpdate={processRowUpdate}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25, { value: 99, label: "All" }]}
                checkboxSelection
                disableRowSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }}
                sx={{
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bolder",
                  },
                }}
              />
            )
          )}
        </DialogContent>
        <DialogActions
          className="custom-import__actions"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: " 0 18px",
          }}
        >
          <Typography
            variant="h5"
            color={lineAmountTotal !== 0 ? "error" : "textPrimary"}
          >
            Line Amount: {Math.round(lineAmountTotal)}
          </Typography>
          <Box>
            <Button
              onClick={handleImport}
              variant="contained"
              color="primary"
              disabled={isLoading || isFetching || lineAmountTotal > 0} // Disable button while loading
            >
              {isLoading || isFetching ? (
                <CircularProgress size={24} />
              ) : (
                "Import"
              )}
            </Button>
            <Button
              onClick={() => setIsDataGridOpen(false)}
              variant="contained"
              color="secondary"
            >
              Cancel
            </Button>
          </Box>
        </DialogActions>

        {/* New Dialog for Duplicate Reports */}
      </Dialog>
      <Dialog
        open={isDuplicateDialogOpen}
        onClose={() => {
          setIsDuplicateDialogOpen(false);
          setErrorReports({});
        }}
        maxWidth="lg"
        fullWidth
        className="custom-import__dialog--duplicates"
      >
        <DialogTitle>Duplicate Data Found</DialogTitle>
        <DialogContent
          sx={{
            height: "500px",
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <CircularProgress />
          ) : (
            errorReports.length > 0 && (
              <DataGrid
                rows={rowsDuplicate}
                columns={columnsDuplicate.map((column) => ({
                  ...column,

                  editable: false,
                }))} // You may want to customize columns specifically for error reports
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                disableRowSelectionOnClick
                //experimentalFeatures={{ newEditingApi: true }}
                sx={{
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-row": {
                    color: "red",
                  },
                }}
              />
            )
          )}
        </DialogContent>
        <DialogActions className="custom-import__actions">
          <Button
            onClick={() => setIsDuplicateDialogOpen(false)}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomImport;
