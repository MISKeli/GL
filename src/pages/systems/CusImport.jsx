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

const CusImport = ({ open, onClose }) => {
  const [data, setData] = useState([]); // Holds parsed data
  const [importedData, setImportedData] = useState([]); // Holds data after import
  const [dialogTitle, setDialogTitle] = useState("Review Imported Data");
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // For DataGrid dialog
  const [errorReports, setErrorReports] = useState([]); // Holds error reports for duplicates
  const [isLoading, setIsLoading] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false); // For duplicate dialog

  const [params, setParams] = useState({
    endpoint: null,
    token: null,
    adjustment_month: null,
    bookName: null, // Add this if not already present
    systemName: null, // Add this if not already present
  });

  // console.log({ params });
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
  // console.log("🚀 ~ CusImport ~ rows:", rows);

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
  console.log("🚀 ~ CusImport ~ lineAmountTotal:", lineAmountTotal)

  const roundedTotal = Math.round(lineAmountTotal);
  console.log("🚀 ~ CusImport ~ roundedTotal:", roundedTotal)
  
  

  const { exportSystem, exportViewSystem } = useExportData();

  // Define your custom headers mapping
  const customHeaders = info.custom_header;

  const headers = Object.keys(customHeaders);
  const onExport = async () => {
    try {
      await exportSystem(headers);
      //console.log({ exportSystem });
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };
  const syncExport = async () => {
    try {
      await exportViewSystem(headers, rows);
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
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
        onClose();
      } catch (error) {
        toast.error("Error processing file.");
        console.error("File processing error:", error);
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
    //console.log("🚀 ~ processRowUpdate ~ originalRow:", originalRow);
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
  //console.log("🚀 ~ CusImport ~ requiredKeys:", requiredKeys);

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
      //console.log("DATAAAAAAAAAA", data);
      const response = await triggerTestSystem({
        endpoint: `${params.endpoint}/${params.adjustment_month}`,
        token: data.token,
      }).unwrap();
      console.log({ response });

      toast.success("Establishing Connection Successfully.");
    } catch (error) {
      // toast.error(error?.message || "Error establishing connection");
    }
  };

  // Define onHandleSync function
  const onHandleSync = async () => {
    try {
      const response = await triggerTestSystem(params).unwrap();

      // Add bookName to each row in the response
      const dataWithBookName = response.map((row) => ({
        ...row,
        bookName: `${params.systemName || ""} - ${params.bookName || ""}`, // Combined format
      }));

      setData(dataWithBookName); // setData(response)
      setDialogTitle("Review Synced Data");
      onClose();
      setIsDataGridOpen(true); // Open the dialog first

      setTimeout(() => {
        const hasMissingFields = rows.some(
          (row) => requiredKeys.some((key) => !row[key]) // Check if any required field is empty
        );

        //console.log("🚀 ~ setTimeout ~ hasMissingFields:", hasMissingFields)

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

  //console.log("🚀 ~ CusImport ~ isButtonDisabled:", isButtonDisabled)

  return (
    <>
      <Dialog
        className="customimport"
        open={open}
        fullWidth // Disable full width stretching
      >
        <DialogTitle className="customimport__header--title">
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              sx={{ fontWeight: "900", fontSize: "13px" }}
              icon={<SyncRounded />}
              iconPosition="start"
              label="Sync"
            />

            {/* <Tab
              sx={{ fontWeight: "900", fontSize: "13px" }}
              icon={<SystemUpdateAltRounded />}
              iconPosition="start"
              label="Import"
            /> */}
          </Tabs>

          <Divider className="customimport__divider--horizontal" />
          <Stack>
            <IconButton
              onClick={() => {
                onClose();
                setData([]);
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Box className="customimport__dialog">
            {activeTab === 0 && (
              <Box className="customimport__sync">
                <DropDownComponent
                  onChange={handleChange}
                  onHandleSync={onHandleSync}
                  setParams={setParams}
                />
              </Box>
            )}

            {activeTab === 1 &&
              {
                /* <Box className="customimport__dialog">
            {activeTab === 1 && (
              <Box className="customimport__dialog__import">
                <Typography>
                  Download a sample CSV file{" "}
                  <span
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      marginTop: "20px",
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
                >
                  <input {...getInputProps()} disabled={isLoading} />
                  <Typography className="customimport__dialog__import__content__dropzone--title">
                    Drop a CSV/XLSX file
                  </Typography>
                  <Typography className="customimport__dialog__import__content__dropzone--title">
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

            {activeTab === 0 && (
              <Box className="customimport__sync">
                <DropDownComponent
                  onChange={handleChange}
                  onHandleSync={onHandleSync}
                  setParams={setParams}
                />
              </Box>
            )}
          </Box> */
              }}
          </Box>
        </DialogContent>

        <Divider className="customimport__divider--horizontal" />
        <DialogActions>
          <Button
            disabled={isLoading || isFetching}
            onClick={() => {
              onClose();
              setData([]);
            }}
            variant="contained"
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        className="customimport__content__dialog__viewing"
        maxWidth="xl"
        fullWidth
        open={isDataGridOpen}
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
              // getCellClassName={(params) => {
              //   return nonEditableColumns.includes(params.field)
              //     ? "non-editable-cell"
              //     : "";
              // }}
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
                  isSubmitDisabled
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
    </>
  );
};

export default CusImport;
