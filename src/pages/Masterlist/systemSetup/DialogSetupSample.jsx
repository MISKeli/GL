import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import "../../../styles/DialogSetup.scss";

import {
  Add,
  AttachFile,
  Clear,
  Close,
  Delete,
  CheckCircle,
  AddLinkRounded,
  CloudSyncRounded,
} from "@mui/icons-material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { systemSchema } from "../../../schemas/validation";

import { toast } from "sonner";
import { useSelector } from "react-redux";

import ConfirmedDialog from "../../../components/ConfirmedDialog";
import { useLazyTestConnectQuery } from "../../../features/api/testerApi";
import {
  getErrorMessage,
  handleErrorWithToast,
} from "../../../utils/errorMessage";
import { info } from "../../../schemas/info";
import { defaultValue } from "../../../schemas/defaultValue";
import {
  useAddNewSystemMutation,
  useUpdateSystemMutation,
} from "../../../features/api/systemApi";

const DialogSetupSample = ({
  open = false,
  closeHandler,
  data,
  isUpdate = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [deleteFieldIndex, setDeleteFieldIndex] = useState(null);

  const [preview, setPreview] = useState(null);
  const [fieldTestResults, setFieldTestResults] = useState({}); // Track test results for each field
  const [testingFields, setTestingFields] = useState({}); // Track which fields are being tested
  const pokedData = useSelector((state) => state.auth.pokedData);

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(systemSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaultValue.system,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bookParameter",
  });

  const watchedEndpoint = watch("endpoint");
  const watchedToken = watch("token");
  const watchedBookParameters = watch("bookParameter");

  const [triggerTestConnect] = useLazyTestConnectQuery();

  // Check if all fields have been tested successfully
  const allFieldsTestedSuccessfully = useCallback(() => {
    if (!watchedBookParameters || watchedBookParameters.length === 0) {
      return false; // If no parameters, don't allow submission
    }

    return watchedBookParameters.every((_, index) => {
      return fieldTestResults[index] === true;
    });
  }, [watchedBookParameters, fieldTestResults]);

  // Check if user can add new parameter (all existing parameters must be tested successfully)
  const canAddNewParameter = useCallback(() => {
    if (!watchedBookParameters || watchedBookParameters.length === 0) {
      return true; // Can add first parameter
    }

    return watchedBookParameters.every((_, index) => {
      return fieldTestResults[index] === true;
    });
  }, [watchedBookParameters, fieldTestResults]);

  // Updated handleFieldTestClick - much cleaner!
  const handleFieldTestClick = async (fieldIndex, bookValue) => {
    if (!watchedEndpoint || !watchedToken) {
      toast.error("Please provide both endpoint and token.");
      return;
    }

    if (!bookValue) {
      toast.error("Please provide a book value to test.");
      return;
    }

    setTestingFields((prev) => ({ ...prev, [fieldIndex]: true }));

    try {
      const result = await triggerTestConnect({
        endpoint: watchedEndpoint + "/" + bookValue,
        token: watchedToken,
      }).unwrap();

      toast.success(`Connection successful for parameter ${fieldIndex + 1}!`);
      setFieldTestResults((prev) => ({ ...prev, [fieldIndex]: true }));
    } catch (error) {
      // Much simpler error handling!
      handleErrorWithToast(error, toast);
      setFieldTestResults((prev) => ({ ...prev, [fieldIndex]: false }));
    } finally {
      setTestingFields((prev) => ({ ...prev, [fieldIndex]: false }));
    }
  };
  const [AddNewSystem, { isLoading, isFetching }] = useAddNewSystemMutation();
  const [UpdateSystem] = useUpdateSystemMutation();

  const handleClose = () => {
    reset(defaultValue.system);
    setPreview(null);
    setFieldTestResults({});
    setTestingFields({});
    closeHandler();
  };

  // Handle field removal - also remove its test result
  const handleRemoveField = (index) => {
    remove(index);

    // Remove test results for this field and reindex remaining fields
    setFieldTestResults((prev) => {
      const newResults = {};
      Object.keys(prev).forEach((key) => {
        const keyIndex = parseInt(key);
        if (keyIndex < index) {
          newResults[keyIndex] = prev[key];
        } else if (keyIndex > index) {
          newResults[keyIndex - 1] = prev[key];
        }
        // Skip the removed index
      });
      return newResults;
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (index) => {
    setDeleteFieldIndex(index);
    setOpenDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteFieldIndex !== null) {
      handleRemoveField(deleteFieldIndex);
      setDeleteFieldIndex(null);
    }
    setOpenDeleteConfirmDialog(false);
  };

  // Reset test results when bookParameter values change
  useEffect(() => {
    if (watchedBookParameters) {
      setFieldTestResults((prev) => {
        const newResults = {};
        watchedBookParameters.forEach((param, index) => {
          // Keep existing test result if bookValue hasn't changed
          if (prev[index] !== undefined && param.bookValue) {
            newResults[index] = prev[index];
          }
        });
        return newResults;
      });
    }
  }, [watchedBookParameters]);

  // Set form values when data changes
  const handleFormValue = useCallback(() => {
    if (pokedData) {
      setValue("systemName", pokedData?.systemName || "");
      setValue("endpoint", pokedData?.endpoint || "");
      setValue("token", pokedData?.token || "");
      setValue("iconFile", pokedData?.iconUrl || null);
      setValue("id", pokedData?.id || "");

      let bookParameterData = pokedData?.bookParameter || [];

      if (typeof bookParameterData === "string") {
        try {
          bookParameterData = JSON.parse(bookParameterData);
        } catch (error) {
          console.error("Error parsing bookParameter:", error);
          bookParameterData = [];
        }
      }

      setValue("bookParameter", bookParameterData);

      // ✅ If updating, mark all fields as tested
      if (isUpdate) {
        const testResults = {};
        bookParameterData.forEach((_, index) => {
          testResults[index] = true;
        });
        setFieldTestResults(testResults);
      }
    }
  }, [pokedData, setValue, isUpdate]);

  // Update your useEffect to handle iconFile properly
  useEffect(() => {
    if (open && pokedData && isUpdate) {
      // Parse bookParameter data
      let bookParameterData = pokedData?.bookParameter || [];
      if (typeof bookParameterData === "string") {
        try {
          bookParameterData = JSON.parse(bookParameterData);
        } catch (error) {
          bookParameterData = [];
        }
      }

      // Reset form with complete data
      reset({
        systemName: pokedData?.systemName || "",
        endpoint: pokedData?.endpoint || "",
        token: pokedData?.token || "",
        iconFile: null, // Always set to null for existing data since we can't recreate File objects
        id: pokedData?.id || "",
        bookParameter: bookParameterData,
      });

      // Set preview separately if iconUrl exists
      if (pokedData?.iconUrl) {
        setPreview(pokedData.iconUrl);
      }
    }
  }, [open, pokedData, isUpdate, reset]);

  useEffect(() => {
    if (open && pokedData) {
      handleFormValue();
    }
  }, [open, pokedData, handleFormValue]);

  useEffect(() => {
    if (isUpdate && pokedData?.iconUrl) {
      setPreview(pokedData.iconUrl);
    }
  }, [isUpdate, pokedData]);

  // Updated confirmSubmit function - much cleaner!
  const confirmSubmit = async (systemData) => {
    setLoading(true);

    // Create FormData
    const formData = new FormData();
    formData.append("systemName", systemData.systemName.toUpperCase());
    formData.append("endpoint", systemData.endpoint);
    formData.append("token", systemData.token);
    formData.append("id", systemData.id);
    formData.append("bookParameter", JSON.stringify(systemData.bookParameter));

    // Handle icon file
    if (systemData.iconFile instanceof File) {
      formData.append("iconFile", systemData.iconFile);
    }

    try {
      if (isUpdate) {
        await UpdateSystem({ id: systemData.id, formData }).unwrap();
        toast.success("System Updated Successfully");
      } else {
        await AddNewSystem(formData).unwrap();
        toast.success("System Created Successfully");
      }
      reset();
      handleClose();
    } catch (error) {
      // Option 1: Simple usage
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = (systemData) => {
    if (isUpdate) {
      setOpenConfirmDialog(true);
    } else {
      confirmSubmit(systemData);
    }
  };

  const handleConfirmYes = () => {
    const formValues = watch();
    confirmSubmit(formValues);
    setOpenConfirmDialog(false);
  };

  // Check if form is ready for submission
  const isFormReadyForSubmission =
    isValid &&
    allFieldsTestedSuccessfully() &&
    watchedBookParameters?.length > 0;

  return (
    <>
      <Dialog open={open} fullWidth className="dialogsetup" maxWidth="xl">
        <DialogTitle fontWeight={600} className="dialogsetup__dialog__header">
          {isUpdate
            ? info.setup.dialogs.updateTitle
            : info.setup.dialogs.addTitle}
          <Stack>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent className="dialogsetup__dialog__content">
          <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="systemName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="System Name"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      size="small"
                      error={!!errors.systemName}
                      helperText={errors.systemName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ marginTop: "0.5rem" }}>
                <Controller
                  name="iconFile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="System Icon"
                      value={
                        field.value instanceof File
                          ? field.value.name
                          : preview && !field.value && isUpdate
                          ? watch("systemName") || "Current system icon"
                          : preview && !field.value
                          ? "Current icon (from URL)"
                          : ""
                      }
                      InputProps={{
                        startAdornment: preview && (
                          <InputAdornment position="start">
                            <Box
                              component="img"
                              src={preview}
                              alt="SVG Preview"
                              sx={{
                                width: 30,
                                height: 30,
                                marginRight: 1,
                              }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {field.value || preview ? (
                              <IconButton
                                onClick={() => {
                                  setPreview(null);
                                  field.onChange(null);
                                }}
                              >
                                <Clear />
                              </IconButton>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/svg+xml"
                                  style={{ display: "none" }}
                                  id="upload-icon"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const objectUrl =
                                        URL.createObjectURL(file);
                                      setPreview(objectUrl);
                                      field.onChange(file);
                                    }
                                  }}
                                />
                                <label htmlFor="upload-icon">
                                  <IconButton component="span">
                                    <AttachFile />
                                  </IconButton>
                                </label>
                              </>
                            )}
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.iconFile}
                      helperText={errors.iconFile?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="endpoint"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Endpoint"
                      variant="outlined"
                      fullWidth
                      margin="dense"
                      size="small"
                      onChange={(e) => {
                        field.onChange(e);
                        // Reset all test results when endpoint changes
                        setFieldTestResults({});
                      }}
                      error={!!errors.endpoint}
                      helperText={errors.endpoint?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="token"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Token"
                      variant="outlined"
                      fullWidth
                      type="password"
                      margin="dense"
                      size="small"
                      onChange={(e) => {
                        field.onChange(e);
                        // Reset all test results when token changes
                        setFieldTestResults({});
                      }}
                      error={!!errors.token}
                      helperText={errors.token?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} width="100%">
                <Divider
                  sx={{
                    borderColor: "primary.main",
                    width: "100%",
                  }}
                >
                  <Chip
                    label="Parameters"
                    size="small"
                    color="primary"
                    sx={{
                      fontWeight: 500,
                    }}
                  />
                </Divider>
              </Grid>

              {fields.map((field, index) => {
                const uniqueKey = field.id;
                const fieldIndex = index;
                const isFieldTested = fieldTestResults[fieldIndex] === true;
                const isFieldTesting = testingFields[fieldIndex];
                const hasTestFailed = fieldTestResults[fieldIndex] === false;

                return (
                  <>
                    <Box
                      sx={{
                        padding: 1,
                        overflowX: "auto",
                        width: "100%",
                        "&::-webkit-scrollbar": {
                          height: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "#f1f1f1",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#888",
                          borderRadius: "4px",
                          "&:hover": {
                            backgroundColor: "#555",
                          },
                        },
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={2}
                        key={uniqueKey}
                        sx={{
                          minWidth: "800px", // Set minimum width to ensure horizontal scroll
                          flexWrap: "nowrap", // Prevent wrapping to maintain horizontal layout
                        }}
                      >
                        <Grid item xs={4} sx={{ minWidth: "200px" }}>
                          <Controller
                            name={`bookParameter.${fieldIndex}.bookName`}
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Book Name"
                                variant="outlined"
                                fullWidth
                                size="small"
                                error={
                                  !!errors.bookParameter?.[fieldIndex]?.bookName
                                }
                                helperText={
                                  errors.bookParameter?.[fieldIndex]?.bookName
                                    ?.message
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={5} sx={{ minWidth: "250px" }}>
                          <Controller
                            name={`bookParameter.${fieldIndex}.bookValue`}
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Book Value"
                                variant="outlined"
                                fullWidth
                                size="small"
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Reset test result for this field when value changes
                                  setFieldTestResults((prev) => {
                                    const newResults = { ...prev };
                                    delete newResults[fieldIndex];
                                    return newResults;
                                  });
                                }}
                                error={
                                  !!errors.bookParameter?.[fieldIndex]
                                    ?.bookValue
                                }
                                helperText={
                                  errors.bookParameter?.[fieldIndex]?.bookValue
                                    ?.message
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={1} sx={{ minWidth: "120px" }}>
                          <Controller
                            name={`bookParameter.${fieldIndex}.closeDate`}
                            control={control}
                            defaultValue=""
                            rules={{ required: "Close Date is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Close Date"
                                variant="outlined"
                                type="number"
                                fullWidth
                                size="small"
                                inputProps={{ min: 1, max: 31, step: 1 }}
                                value={field.value || ""}
                                onInput={(e) => {
                                  let value = e.target.value.replace(/\D/g, ""); // Only allow digits
                                  if (value.length > 2) {
                                    value = value.slice(0, 2); // Limit to 2 digits
                                  }
                                  if (parseInt(value) > 31) {
                                    value = "31"; // Cap at 31
                                  }
                                  e.target.value = value;
                                  field.onChange(value);
                                }}
                                error={
                                  !!errors.bookParameter?.[fieldIndex]
                                    ?.closeDate
                                }
                                helperText={
                                  errors.bookParameter?.[fieldIndex]?.closeDate
                                    ?.message
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={1} sx={{ minWidth: "100px" }}>
                          <Controller
                            name={`bookParameter.${fieldIndex}.status`}
                            control={control}
                            defaultValue={true}
                            render={({ field }) => (
                              <Tooltip title="Change Status" arrow>
                                <Chip
                                  label={field.value ? "Active" : "Inactive"}
                                  clickable
                                  color={field.value ? "success" : "error"}
                                  variant="filled"
                                  size="small"
                                  onClick={() => field.onChange(!field.value)}
                                  sx={{
                                    minWidth: 60,
                                    height: 24,
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    "&.MuiChip-clickable:hover": {
                                      opacity: 0.8,
                                      transform: "scale(1.05)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                />
                              </Tooltip>
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={1}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            minWidth: "100px",
                          }}
                        >
                          <IconButton
                            onClick={() =>
                              handleFieldTestClick(
                                fieldIndex,
                                watch(`bookParameter.${fieldIndex}.bookValue`)
                              )
                            }
                            size="small"
                            disabled={isFieldTesting}
                            color={
                              isFieldTested
                                ? "success"
                                : hasTestFailed
                                ? "error"
                                : "default"
                            }
                          >
                            {isFieldTesting ? (
                              <CircularProgress size={16} />
                            ) : isFieldTested ? (
                              <CheckCircle />
                            ) : (
                              <CloudSyncRounded />
                            )}
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(fieldIndex)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                );
              })}
              {/* Add Button for Book Parameters */}
              <Grid item xs={12} sx={{ mt: 1, alignItems: "center" }}>
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  size="small"
                  disabled={!canAddNewParameter()}
                  onClick={() =>
                    append({
                      bookName: "",
                      bookValue: "",
                      closeDate: 0,
                      status: true,
                    })
                  }
                >
                  Add Parameter
                </Button>
                {!canAddNewParameter() && watchedBookParameters?.length > 0 && (
                  <Box
                    sx={{ mt: 1, fontSize: "0.75rem", color: "text.secondary" }}
                  >
                    Complete testing all existing parameters before adding new
                    ones
                  </Box>
                )}
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="contained" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="submit-form"
            disabled={loading || isLoading || !isFormReadyForSubmission}
            startIcon={
              loading || isLoading ? (
                <CircularProgress color="info" size={20} />
              ) : null
            }
          >
            {loading || isLoading
              ? "Processing..."
              : isUpdate
              ? "Save"
              : "Register"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmedDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        title="Confirm Changes"
        description="Are you sure you want to save the changes?"
        onYes={handleConfirmYes}
      />
      <ConfirmedDialog
        open={openDeleteConfirmDialog}
        onClose={() => setOpenDeleteConfirmDialog(false)}
        title="Confirm Delete"
        description={
          <Box component="span">
            Are you sure you want to delete{" "}
            <Box
              component="span"
              sx={{ fontWeight: "bold", color: "error.main" }}
            >
              {deleteFieldIndex !== null &&
              watchedBookParameters?.[deleteFieldIndex]?.bookName
                ? watchedBookParameters[deleteFieldIndex].bookName
                : `parameter ${
                    deleteFieldIndex !== null ? deleteFieldIndex + 1 : ""
                  }`}
            </Box>
            ? This action cannot be undone.
          </Box>
        }
        onYes={handleConfirmDelete}
      />
    </>
  );
};

export default DialogSetupSample;
