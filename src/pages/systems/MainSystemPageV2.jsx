/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { defaultValue } from "../../schemas/defaultValue";
import { yupResolver } from "@hookform/resolvers/yup";
import { importSchema } from "../../schemas/validation";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  IconButton,
  Tab,
  Tabs,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import "../../styles/CusImport.scss";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { info } from "../../schemas/info";
import noRecordsFound from "../../assets/images/noRecordsFound.png";
import {
  Close,
  SyncRounded,
  SystemUpdateAltRounded,
  IosShareRounded,
  Dvr,
  DvrRounded,
  ArrowBack,
} from "@mui/icons-material";
import { useImportReportsMutation } from "../../features/api/importReportApi";
import moment from "moment";
import { useLazyTestConnectQuery } from "../../features/api/testerApi";
import { DataGrid } from "@mui/x-data-grid";
import DropDownComponent from "../../components/DropDownComponent";
import { transformRows } from "../../schemas/importReport";
import useExportData from "../../components/hooks/useExportData";
import OnExportButton from "../../components/OnExportButton";
// import SystemMonitoringComponent from "../../components/SystemMonitoringComponent";

const MainSystemPageV2 = () => {
  const [data, setData] = useState([]); // Holds parsed data
  const [importedData, setImportedData] = useState([]); // Holds data after import
  const [dialogTitle, setDialogTitle] = useState("Review Imported Data");
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // For DataGrid dialog
  const [errorReports, setErrorReports] = useState([]); // Holds error reports for duplicates
  const [isLoading, setIsLoading] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false); // For duplicate dialog
  const [isImportButtonDisabled, setIsImportButtonDisabled] = useState(false);

  const [params, setParams] = useState({
    endpoint: null,
    token: null,
    adjustment_month: null,
    bookName: null, // Add this if not already present
    systemName: null, // Add this if not already present
  });

  const { setValue } = useForm({
    defaultValues: {
      addedBy: 0,
      reports: [defaultValue.report],
    },
    resolver: yupResolver(importSchema),
  });

  const hasImportButtonPermission = sessionStorage
    .getItem("user")
    .includes("IMPORT BUTTON");

  const [importData, { isFetching }] = useImportReportsMutation();

  const createHeader = () => {
    if (data.length === 0) return [];
    const columnToHide = "syncId";

    // Get all unique keys across all rows
    const allKeys = data.reduce((keys, row) => {
      Object.keys(row).forEach((key) => {
        if (!keys.includes(key)) keys.push(key);
      });
      return keys;
    }, []);

    return allKeys
      .filter((key) => key !== columnToHide)
      .map((key) => ({
        field: key,
        headerName: key,
        width: 150,
        editable: false,
      }));
  };

  const columns = createHeader();
  //transformRows is a schema
  const rows = transformRows(data);

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
    return acc + (row.lineAmount || 0);
  }, 0);

  const roundedTotal = Math.round(lineAmountTotal);

  const { exportSystem, exportViewSystem } = useExportData();

  // Define your custom headers mapping
  const customHeaders = info.custom_header;

  const headers = Object.keys(customHeaders);
  const onExport = async () => {
    try {
      await exportSystem(headers);

      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };
  const syncExport = async () => {
    try {
      await exportViewSystem(headers, rows);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  //IMPORT
  const onDrop = (acceptedFiles, fileRejections) => {
    if (acceptedFiles.length > 1) {
      toast.error("Importing Multiple Files.");
      return;
    }
    if (fileRejections.length > 0) {
      toast.error("Submitting file is invalid.");
      return;
    }

    setIsLoading(true); // Start loading

    const reader = new FileReader();
    reader.readAsBinaryString(acceptedFiles[0]);
    reader.onload = (e) => {
      try {
        const fileData = e.target.result;
        const workbook = XLSX.read(fileData, {
          type: "binary",
          dateNF: "YYYY-MM-DD",
          cellDates: false,
          raw: true,
          defval: "",
        });

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
                : null;
            } else {
              newRow[key] = row[key]
                ? row[key]
                : typeof row[key] === "number"
                ? 0
                : null;
            }
          }
          return newRow;
        });

        setData(parsedData);
        setDialogTitle("Review Imported Data");

        parsedData.forEach((report, index) => {
          Object.keys(report).forEach((key) => {
            setValue(`reports[${index}].${key}`, report[key]);
          });
        });

        setIsDataGridOpen(true);
      } catch (error) {
        toast.error(error?.message || "Error processing file.");
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: true,
  });

  const processRowUpdate = (newRow) => {
    const originalRow = data[newRow.id];

    const updatedRow = {
      ...originalRow,
      ...newRow,
      transactionDate: newRow.transactionDate
        ? moment(new Date(newRow.transactionDate)).format("YYYY-MM-DD")
        : originalRow.transactionDate,
      chequeDate: newRow.chequeDate
        ? moment(newRow.chequeDate).format("YYYY-MM-DD")
        : originalRow.chequeDate,
      releasedDate: newRow.releasedDate
        ? moment(newRow.releasedDate).format("YYYY-MM-DD")
        : originalRow.releasedDate,
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
    transactionDate: row.transactionDate
      ? moment(row.transactionDate).format("YYYY-MM-DD")
      : null,
    releasedDate: row.releasedDate
      ? moment(row.releasedDate).format("YYYY-MM-DD")
      : null,
    chequeDate: row.chequeDate
      ? moment(row.chequeDate).format("YYYY-MM-DD")
      : null,
  }));
  const columnsDuplicate = createHeaderDuplicate();

  const requiredFields = info.requiredField;
  const requiredKeys = requiredFields.map((field) => info.custom_header[field]);

  const isSubmitDisabled = useMemo(() => {
    if (!rows.length) return true;

    return rows.some(
      (row) => requiredKeys.some((key) => !row[key]) // Check if any required field is empty
    );
  }, [rows]);

  const handleImport = async () => {
    if (isSubmitDisabled) {
      toast.error("There's a missing field.");
      return;
    }

    try {
      setIsLoading(true);
      const transformedRows = rows.map((row) => ({
        ...row,
      }));

      const response = await importData({ reports: transformedRows }).unwrap();
      setImportedData(response);
      setIsDataGridOpen(false);

      toast.success("File imported successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to import data.");
      setErrorReports(error?.data?.value?.duplicateReports || []);
      setIsDuplicateDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const nonEditableColumns = ["syncId", "system", "drcp", "lineAmount"];
  const [triggerTestSystem] = useLazyTestConnectQuery();

  const handleChange = async (data) => {
    // setSelectedValue(data);

    try {
      const response = await triggerTestSystem({
        endpoint: `${params.endpoint}/${params.adjustment_month}`,
        token: data.token,
      }).unwrap();

      toast.success(response || "Establishing Connection Successfully.");
    } catch (error) {
      // toast.error(error?.message || "Error establishing connection");
    }
  };

  // Define onHandleSync function
  const onHandleSync = async (data) => {
    setIsImportButtonDisabled(
      !moment().date(params?.closeDate).isSame(moment()) || params.isImported
    );

    try {
      const response = await triggerTestSystem(params).unwrap();

      // Add bookName to each row in the response
      const dataWithBookName = response.map((row) => ({
        ...row,
        bookName: `${params.systemName || ""} - ${params.bookName || ""}`, // Combined format
      }));

      setData(dataWithBookName); // setData(response)
      setDialogTitle("Review Synced Data");
      setIsDataGridOpen(true); // Open the dialog first

      setTimeout(() => {
        const hasMissingFields = rows.some(
          (row) => requiredKeys.some((key) => !row[key]) // Check if any required field is empty
        );

        if (hasMissingFields) {
          toast.error("There's a missing field.");
        } else {
          toast.success("Establishing Connection Successfully.");
        }
      }, 500); // Delay to show toast after opening the dialog
    } catch (error) {
      toast.error(error?.message || "Error establishing connection");
    }
  };

  const showIcon = dialogTitle === "Review Synced Data";

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get the required headers from your custom header info
  const requiredHeaders = Object.values(info.custom_header);

  // Get the column headers they're providing
  const providedHeaders = columns.map((col) => col.field);

  // Check if ALL required headers are present in the provided columns
  // Extra headers don't matter - we only care if any required ones are missing
  const areAllRequiredHeadersPresent = requiredHeaders.every((requiredHeader) =>
    providedHeaders.includes(requiredHeader)
  );

  // Button should be disabled when required headers are missing
  const isButtonDisabled = !areAllRequiredHeadersPresent;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Page Header */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Box className="customimport__header--title" gap={2}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Data Import System
            </Typography>
          </Box>

          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              sx={{ fontWeight: "900", fontSize: "13px" }}
              icon={<SyncRounded />}
              iconPosition="start"
              label="Sync"
            />
            <Tab
              sx={{ fontWeight: "900", fontSize: "13px" }}
              icon={<SystemUpdateAltRounded />}
              iconPosition="start"
              label="Import"
            />
          </Tabs>
        </Box>
      </Paper>

      {/* Tab Content */}
      <Paper elevation={1} sx={{ p: 3, minHeight: "250px" }}>
        {activeTab === 0 && (
          <Box className="customimport__sync">
            {/* <Typography color={"primary"} variant="h6" gutterBottom>
              Sync Data from External System
            </Typography> */}
            <DropDownComponent
              onChange={handleChange}
              onHandleSync={onHandleSync}
              setParams={setParams}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box className="customimport__dialog__import">
            <Typography variant="h6" gutterBottom>
              Import Data from File
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Download a sample CSV file{" "}
              <span
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "primary.main",
                }}
                onClick={onExport}
              >
                here
              </span>
              .
            </Typography>

            <Box
              {...getRootProps()}
              className="customimport__dialog__import__content__dropzone"
              sx={{
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'grey.50'
                }
              }}
            >
              <input {...getInputProps()} disabled={isLoading} />
              <Typography className="customimport__dialog__import__content__dropzone--title" variant="h6" gutterBottom>
                Drop a CSV/XLSX file here
              </Typography>
              <Typography className="customimport__dialog__import__content__dropzone--title" gutterBottom>
                or
              </Typography>
              <Button
                sx={{ marginTop: 1 }}
                variant="contained"
                color="success"
                size="medium"
                disabled={isLoading || isFetching}
                className="customimport__dialog__import__content__dropzone--button"
                startIcon={
                  isLoading ||
                  (isFetching && (
                    <CircularProgress size={20} color="inherit" />
                  ))
                }
              >
                {isLoading || isFetching ? "Processing..." : "Upload File"}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Data Review Dialog */}
      <Dialog
        className="customimport__content__dialog__viewing"
        maxWidth={false}
        //fullScreen - removed
        //fullWidth - removed
        open={isDataGridOpen}
        sx={{
          "& .MuiDialog-paper": {
            width: "120vw",
            maxWidth: "1584px",
            height: "85vh",
            maxHeight: "900px",
            minHeight: "600px",
            // Responsive breakpoints
            "@media (max-width: 768px)": {
              width: "120vw",
              height: "90vh",
              margin: "16px",
            },
            "@media (max-width: 480px)": {
              width: "120vw",
              height: "95vh",
              margin: "8px",
            },
            // Ensure height is always greater than width
            "@media (min-aspect-ratio: 1/1)": {
              width: "min(120vw, 1584px)",
              height: "min(85vh, 900px)",
            },
          },
        }}
      >
        <DialogTitle
          className="customimport__content__dialog__viewing--title"
          fontWeight={600}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent={showIcon ? "space-between" : "flex-start"}
            width="100%"
          >
            {dialogTitle}
            {showIcon && (
              <Button
                variant="text"
                color="primary"
                onClick={syncExport}
                disabled={isLoading || isFetching}
                startIcon={
                  isLoading || isFetching ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IosShareRounded />
                  )
                }
              >
                {info.download.export}
              </Button>
            )}
          </Box>
        </DialogTitle>

        <DialogContent
          className="customimport__content__dialog__viewing--content"
          sx={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flex: 1, // Takes up remaining space
            overflow: "auto", // Ensures scrolling if content overflows
          }}
        >
          {isFetching || isLoading ? (
            <CircularProgress />
          ) : data.length === 0 ? (
            <Box className="customimport__content__dialog__viewing--norecords">
              <img src={noRecordsFound} alt="No Records Found" />
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns.map((col) => {
                return {
                  ...col,
                  renderHeader: () =>
                    Object.values(info.custom_header)?.some((item) => {
                      return item == col.field;
                    }) ? (
                      <div>{col.headerName}</div>
                    ) : (
                      <strong style={{ color: "red" }}>{col.headerName}</strong>
                    ),
                };
              })}
              processRowUpdate={processRowUpdate}
              getCellClassName={(params) => {
                if (requiredKeys.includes(params.field) && !params.value) {
                  return "missing-required-field"; // Apply red highlight
                }
                return nonEditableColumns.includes(params.field)
                  ? "non-editable-cell"
                  : "";
              }}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25, { value: 99, label: "All" }]}
              disableRowSelectionOnClick
              sx={{
                width: "100%",
                height: "100%",
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bolder",
                },
                "& .MuiDataGrid-row": {
                  backgroundColor: "$background-header",
                },
                "& .missing-required-field": {
                  backgroundColor: "rgba(255, 0, 0, 0.2)", // Light red
                  color: "red",
                  fontWeight: "bold",
                },
              }}
            />
          )}
        </DialogContent>

        <DialogActions className="customimport__content__dialog__viewing--actions">
          <Typography
            variant="h5"
            color={roundedTotal !== 0 ? "error" : "textPrimary"}
          >
            Line Amount: ₱
            {roundedTotal.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "--"}
          </Typography>

          <Box>
            {/* Conditionally render the Import button - hide it if user has IMPORT permission */}
            {hasImportButtonPermission && (
              <Button
                onClick={handleImport}
                variant="contained"
                color="primary"
                disabled={
                  isLoading ||
                  isFetching ||
                  roundedTotal !== 0 ||
                  data.length === 0 ||
                  isSubmitDisabled ||
                  isImportButtonDisabled
                }
              >
                {info.download.import}
              </Button>
            )}{" "}
            <Button
              onClick={() => {
                setIsDataGridOpen(false);
                setData([]);
              }}
              variant="contained"
              color="secondary"
              disabled={isLoading || isFetching}
              aria-hidden="true"
            >
              Cancel
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Duplicate/Error Data Dialog */}
      <Dialog
        className="customimport__content__dialog__viewing"
        open={isDuplicateDialogOpen}
        onClose={() => {
          setIsDuplicateDialogOpen(false);
          setErrorReports([]);
        }}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle
          className="customimport__content__dialog--title"
          fontWeight={600}
        >
          Error Data Found
        </DialogTitle>
        <DialogContent className="customimport__content__dialog--content">
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
        <DialogActions className="customimport__content__dialog__viewing--actions">
          {/*  para lang mapunta sa flex end yung close button */}
          <Box></Box>
          <Button
            onClick={() => {
              setIsDuplicateDialogOpen(false);
              setErrorReports([]);
            }}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MainSystemPageV2;
