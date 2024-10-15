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
import { Close, CloudUpload, Delete } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { importSchema } from "../schemas/validation";
import { defaultReport } from "../schemas/defaultValue";

import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import "../styles/ImportPage.scss";
import { info } from "../schemas/info";
import { useImportReportsMutation } from "../features/api/importReportApi";
import moment from "moment";
import { toast } from "sonner";

const ImportPage1 = () => {
  const [data, setData] = useState([]); // Holds parsed data
  const [files, setFiles] = useState([]); // Holds dropped files
  const [fileIndex, setFileIndex] = useState(null); // Index of the file being viewed
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // For DataGrid dialog
  const [isFetchingDuplicates, setIsFetchingDuplicates] = useState(false); // Loader state for duplicates
  const [errorReports, setErrorReports] = useState([]); // Holds error reports for duplicates
  const [isLoading, setIsLoading] = useState(false); // Loading state for the import
  const [importedData, setImportedData] = useState([]); // Holds data after import
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false); // For duplicate dialog
  const [selectedFile, setSelectedFile] = useState(null); // File currently being reviewed
  const {
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      addedBy: 0,
      reports: [defaultReport.report],
    },
    resolver: yupResolver(importSchema),
  });
  const [importData, { isFetching }] = useImportReportsMutation();

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
  const createHeaderDuplicate = () => {
    if (errorReports.length === 0) return [];
    return Object.keys(errorReports[0]).map((key) => ({
      field: key,
      headerName: key,
      width: 150,
      editable: true,
    }));
  };
  const lineAmountTotal = rows.reduce((acc, row) => {
    return Math.max(0, acc + (row.lineAmount || 0));
  }, 0);
  console.log("lineAmountTotal", lineAmountTotal);

  // const onDrop = (acceptedFiles) => {

  //   console.log("tanggap", acceptedFiles);
  //   const reader = new FileReader();
  //   reader.readAsBinaryString(acceptedFiles[0]);
  //   reader.onload = (e) => {
  //     const fileData = e.target.result;
  //     const workbook = XLSX.read(fileData, { type: "binary" });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];

  //     // Parse data from the sheet
  //     let parsedData = XLSX.utils.sheet_to_json(sheet);

  //     // Define your custom headers mapping
  //     const customHeaders = info.custom_header;

  //     // Map the parsed data to use custom headers and handle null values
  //     parsedData = parsedData.map((row) => {
  //       const newRow = {};
  //       for (const key in row) {
  //         if (customHeaders[key]) {
  //           newRow[customHeaders[key]] = row[key]
  //             ? row[key]
  //             : typeof row[key] === "number"
  //             ? 0
  //             : null; // Return null if value is empty
  //         } else {
  //           newRow[key] = row[key]
  //             ? row[key]
  //             : typeof row[key] === "number"
  //             ? 0
  //             : null; // Return null if value is empty
  //         }
  //       }
  //       return newRow;
  //     });

  //     setData(parsedData);

  //     // Close the first dialog and open the second dialog for review

  //     setIsDataGridOpen(true); // Open DataGrid dialog for review
  //   };
  // };

  const onDrop = (acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]); // Add new files to the list
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
  });

  // const handleFilePreview = (file, index) => {
  //   const reader = new FileReader();
  //   reader.readAsBinaryString(file);
  //   reader.onload = (e) => {
  //     const fileData = e.target.result;
  //     const workbook = XLSX.read(fileData, { type: "binary" });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];

  //     // Parse data from the sheet
  //     let parsedData = XLSX.utils.sheet_to_json(sheet);

  //     // Define your custom headers mapping
  //     const customHeaders = info.custom_header;

  //     // Map the parsed data to use custom headers and handle null values
  //     parsedData = parsedData.map((row) => {
  //       const newRow = {};
  //       for (const key in row) {
  //         if (customHeaders[key]) {
  //           newRow[customHeaders[key]] = row[key]
  //             ? row[key]
  //             : typeof row[key] === "number"
  //             ? 0
  //             : null; // Return null if value is empty
  //         } else {
  //           newRow[key] = row[key]
  //             ? row[key]
  //             : typeof row[key] === "number"
  //             ? 0
  //             : null; // Return null if value is empty
  //         }
  //       }
  //       return newRow;
  //     });

  //     setData(parsedData);
  //     setFileIndex(index); // Set the current file index being previewed
  //     setIsDataGridOpen(true); // Open DataGrid dialog for review
  //   };
  // };

  const handleFileClick = (file) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const fileData = e.target.result;
      const workbook = XLSX.read(fileData, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      let parsedData = XLSX.utils.sheet_to_json(sheet);

      const customHeaders = info.custom_header;

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

      setData(parsedData);
      setIsDataGridOpen(true); // Open the dialog to review the file

      // Define your custom headers mapping
      // Map the parsed data to use custom headers and handle null values

      setSelectedFile(file); // Set current file
    };
  };

  const handleFileRemove = (fileToRemove) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    setFiles(updatedFiles);
  };

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
      const transformedRows = data.map((row) => ({
        ...row,
        transactionDate: row.transactionDate
          ? moment(row.transactionDate).utc().toISOString()
          : moment().utc().toISOString(),
      }));

      try {
        setIsLoading(true);
        const response = await importData({
          reports: transformedRows,
        }).unwrap();
        toast.success("Imported Successfully.");
        setImportedData(response); // Save imported data
        handleFileRemove(selectedFile); // Remove file from preview section after successful import
        setIsDataGridOpen(false);
      } catch (error) {
        toast.error(error?.data?.message || "Failed to import data.");
      } finally {
        setIsLoading(false);
      }
    })();
  };

  // const handleImport = () => {
  //   handleSubmit(async () => {
  //     const transformedRows = rows.map((row) => ({
  //       ...row,
  //       transactionDate: row.transactionDate
  //         ? moment(row.transactionDate).utc().toISOString()
  //         : moment().utc().toISOString(),
  //     }));
  //     setIsDataGridOpen(false); // Close DataGrid dialog

  //     try {
  //       setIsLoading(true); // Start loading
  //       const response = await importData({
  //         reports: transformedRows,
  //       }).unwrap();
  //       toast.success("Imported Successfully.");
  //       setImportedData(response); // Save imported data
  //       setIsDataGridOpen(false); // Close DataGrid dialog
  //       //onClose(); // Close main import dialog
  //     } catch (error) {
  //       toast.error(error?.data?.message || "Failed to import data.");

  //       // Check for duplicates in the error response

  //       setErrorReports(error?.data?.value.duplicateReports || []);
  //       setIsDuplicateDialogOpen(true); // Open duplicate dialog
  //     } finally {
  //       setIsDataGridOpen(false);
  //       setIsLoading(false); // Stop loading
  //     }
  //   })();
  // };
  return (
    <>
      <Box className="import">
        <Box className="import__header">
          <Typography variant="h5" className="import__header--title">
            Import Data
          </Typography>
        </Box>
        <Box className="import__content">
          <Box {...getRootProps()} className="import__content__dropzone">
            <input {...getInputProps()} multiple />
            <Typography className="import__content__dropzone--title">
              Drop a CSV/XLSX file
            </Typography>
            <Typography className="import__content__dropzone--title">
              or
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              color="success"
              size="large"
              className="import__content__dropzone--button"
            >
              Click to Upload
            </Button>
          </Box>
        </Box>

        {/* Preview Section */}
        {files.length > 0 && (
          <Box className="import__preview">
            {files.map((file, index) => (
              <Box
                key={index}
                className="import__preview__file"
                onClick={() => handleFileClick(file)}
              >
                <Box className="import__preview__file--info">
                  <Typography className="import__preview__file--name">
                    {file.name}
                  </Typography>
                </Box>
                <IconButton
                  className="import__preview__file--actions--delete"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click from opening file
                    handleFileRemove(file);
                  }}
                >
                  <Delete color="secondary" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Second Dialog - DataGrid for Reviewing Imported Data */}
        <Dialog
          open={isDataGridOpen}
          onClose={() => setIsDataGridOpen(false)}
          maxWidth="lg"
          fullWidth
          className="import__content__dialog"
        >
          <DialogTitle
            className="import__content__dialog--title"
            fontWeight={600}
          >
            Review Imported Data
          </DialogTitle>
          <DialogContent className="import__content__dialog--content">
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
          <DialogActions className="import__content__dialog--actions">
            <Typography
              variant="h5"
              color={lineAmountTotal !== 0 ? "error" : "textPrimary"}
            >
              Line Amount: {Math.round(lineAmountTotal)}
            </Typography>
            <Box className="import__content__dialog--actions">
              <Button
                onClick={handleImport}
                variant="contained"
                color="primary"
                disabled={
                  isLoading || isFetching || Math.round(lineAmountTotal) > 0
                } // Disable button while loading
              >
                {isLoading || isFetching ? (
                  <CircularProgress size={24} />
                ) : (
                  "Import"
                )}
              </Button>{" "}
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
          className="import__content__dialogDuplicate"
        >
          <DialogTitle
            className="import__content__dialog--title"
            fontWeight={600}
          >
            Duplicate Data Found
          </DialogTitle>
          <DialogContent
            sx={{
              height: "500px",
              overflowY: "auto",
            }}
          >
            {isFetchingDuplicates || isLoading ? (
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
          <DialogActions className="import__content__dialog--actions">
            <Button
              onClick={() => setIsDuplicateDialogOpen(false)}
              variant="contained"
              color="secondary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Box className="import__footer"></Box>
      </Box>
    </>
  );
};

export default ImportPage1;
