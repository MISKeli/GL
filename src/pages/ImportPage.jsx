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
import { Close, CloudUpload } from "@mui/icons-material";
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

const ImportPage = () => {
  const [data, setData] = useState([]); // Holds parsed data
  const [isDataGridOpen, setIsDataGridOpen] = useState(false); // For DataGrid dialog
  const [isFetchingDuplicates, setIsFetchingDuplicates] = useState(false); // Loader state for duplicates
  const [errorReports, setErrorReports] = useState([]); // Holds error reports for duplicates
  const [isLoading, setIsLoading] = useState(false); // Loading state for the import
  const [importedData, setImportedData] = useState([]); // Holds data after import
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false); // For duplicate dialog

  const { handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      addedBy: 0,
      reports: [defaultReport],
    },
    resolver: yupResolver(importSchema),
  });
  console.log(watch());
  const [importData, { isFetching }] = useImportReportsMutation();

  const createHeader = () => {
    if (data.length === 0) return [];
    const columnToHide = "";
    const nonEditableColumns = ["syncId", "system", "drcp"];

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
        editable: !nonEditableColumns.includes(key),
      }));
  };
  const columns = createHeader();

  const rows = data.map((row, index) => ({
    ...row,
    id: row.id || index, // Unique identifier
    // accountingTag: row.accountingTag?.toString(),
    // transactionDate: moment(row.transactionDate, "MM/DD/YYYY")
    //   .utc()
    //   .toISOString(),
    syncId: row.syncId ? row.syncId.toString() : "",
    mark1: row.mark1 ? row.mark1 : "",
    mark2: row.mark2 ? row.mark2 : "",
    assetCIP: row.assetCIP ? row.assetCIP : "",
    accountingTag: row.accountingTag ? row?.accountingTag?.toString() : "",
    transactionDate: row.transactionDate
      ? moment(row.transactionDate, "MM/DD/YYYY").utc().toISOString()
      : "",
    clientSupplier: row.clientSupplier ? row.clientSupplier : "",
    accountTitleCode: row.accountTitleCode ? row.accountTitleCode : "",
    accountTitle: row.accountTitle ? row.accountTitle : "",
    companyCode: row.companyCode ? row.companyCode : "",
    company: row.company ? row.company : "",
    divisionCode: row.divisionCode ? row.divisionCode : "",
    division: row.division ? row.division : "",
    departmentCode: row.departmentCode ? row.departmentCode : "",
    department: row.department ? row.department : "",
    unitCode: row.unitCode ? row.unitCode : "",
    unit: row.unit ? row.unit : "",
    subUnitCode: row.subUnitCode ? row.subUnitCode : "",
    subUnit: row.subUnit ? row.subUnit : "",
    locationCode: row.locationCode ? row.locationCode : "",
    location: row.location ? row.location : "",
    poNumber: row.poNumber ? row.poNumber : "",
    referenceNo: row.referenceNo ? row.referenceNo?.toString() : "",
    itemCode: row.itemCode ? row.itemCode : "",
    itemDescription: row.itemDescription ? row.itemDescription : "",
    quantity: row.quantity ? row.quantity : 0,
    uom: row.uom ? row.uom : "",
    unitPrice: row.unitPrice ? row.unitPrice : 0,
    lineAmount: row.lineAmount ? row.lineAmount : 0,
    voucherJournal: row.voucherJournal ? row.voucherJournal : "",
    accountType: row.accountType ? row.accountType : "",
    drcp: row.drcp ? row.drcp : "",
    assetCode: row.assetCode ? row.assetCode : "",
    asset: row.asset ? row.asset : "",
    serviceProviderCode: row.serviceProviderCode ? row.serviceProviderCode : "",
    serviceProvider: row.serviceProvider ? row.serviceProvider : "",
    boa: row.boa ? row.boa : "",
    allocation: row.allocation ? row.allocation : "",
    accountGroup: row.accountGroup ? row.accountGroup : "",
    accountSubGroup: row.accountSubGroup ? row.accountSubGroup : "",
    financialStatement: row.financialStatement ? row.financialStatement : "",
    unitResponsible: row.unitResponsible ? row.unitResponsible : "",
    batch: row.batch ? row.batch : "",
    remarks: row.remarks ? row.remarks : "",
    payrollPeriod: row.payrollPeriod ? row.payrollPeriod : "",
    position: row.position ? row.position : "",
    payrollType: row.payrollType ? row.payrollType : "",
    payrollType2: row.payrollType2 ? row.payrollType2 : "",
    depreciationDescription: row.depreciationDescription
      ? row.depreciationDescription
      : "",
    remainingDepreciationValue: row.remainingDepreciationValue
      ? row.remainingDepreciationValue
      : "",
    usefulLife: row.usefulLife ? row.usefulLife : "",
    month: row.month ? row.month : "",
    year: row.year ? row.year : "",
    particulars: row.particulars ? row.particulars : "",
    month2: row.month2 ? row.month2 : "",
    farmType: row.farmType ? row.farmType : "",
    jeanRemarks: row.jeanRemarks ? row.jeanRemarks : "",
    from: row.from ? row.from : "",
    changedTo: row.changedTo ? row.changedTo : "",
    reason: row.reason ? row.reason : "",
    checkingRemarks: row.checkingRemarks ? row.checkingRemarks : "",
    boA2: row.boA2 ? row.boA2 : "",
    system: row.system ? row.system : "",
    books: row.books ? row.books : "",
  }));
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
  console.log("lineAmountTotal", roundedTotal);

  const onDrop = (acceptedFiles) => {
    console.log("tanggap", acceptedFiles);
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

      setData(parsedData);
      // Use setValue to update the form with parsed data
      parsedData.forEach((report, index) => {
        Object.keys(report).forEach((key) => {
          // Update the form for each report, assuming the reports are in an array
          setValue(`reports[${index}].${key}`, report[key]);
        });
      });
      // Close the first dialog and open the second dialog for review

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

  const rowsDuplicate = errorReports.map((row, index) => ({
    ...row,
    id: row.id || index, // Unique identifier
    accountingTag: row.accountingTag?.toString(),
    transactionDate: moment(row.transactionDate, "MM/DD/YYYY")
      .utc()
      .toISOString(),
  }));
  const columnsDuplicate = createHeaderDuplicate();

  const handleImport = async () => {
    console.log("test");
    const transformedRows = rows.map((row) => ({
      ...row,
      transactionDate: row.transactionDate
        ? moment(row.transactionDate).utc().toISOString()
        : moment().utc().toISOString(),
    }));
    //setIsDataGridOpen(false); // Close DataGrid dialog

    try {
      setIsLoading(true); // Start loading
      const response = await importData({
        reports: transformedRows,
      }).unwrap();
      console.log("response", response);
      toast.success("Imported Successfully.");
      setImportedData(response); // Save imported data
      setIsDataGridOpen(false); // Close DataGrid dialog
      // onClose(); // Close main import dialog
    } catch (error) {
      toast.error(error?.data?.message || "Failed to import data.");

      // Check for duplicates in the error response

      setErrorReports(error?.data?.value.duplicateReports || []);
      setIsDuplicateDialogOpen(true); // Open duplicate dialog
    } finally {
      setIsDataGridOpen(false);
      setIsLoading(false); // Stop loading
    }
  };
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

        {/* Second Dialog - DataGrid for Reviewing Imported Data */}
        <Dialog
          open={isDataGridOpen}
          // onClose={() => setIsDataGridOpen(false)}
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
          <DialogContent
            className="import__content__dialog--content"
            sx={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
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
          <DialogActions className="import__content__dialog--actions">
            <Typography
              variant="h5"
              color={roundedTotal !== 0 ? "error" : "textPrimary"}
            >
              Line Amount: {roundedTotal}
            </Typography>
            <Box>
              <Button
                onClick={handleImport}
                variant="contained"
                color="primary"
                disabled={isLoading || isFetching || roundedTotal != 0} // Disable button while loading
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
                disabled={isLoading || isFetching}
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
          <DialogContent className="import__content__dialog--content">
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
        <Box className="import__footer"></Box>
      </Box>
    </>
  );
};

export default ImportPage;
