/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useLazyGetAllSystemsAsyncQuery } from "../features/api/systemApi";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { systemDateSchema } from "../schemas/validation";
import { DatePicker } from "@mui/x-date-pickers";
import {
  shouldDisableMonth,
  shouldDisableYear,
} from "../utils/datePickerMinDate";

import moment from "moment";
import { useGenerateImportedSystemsQuery } from "../features/api/folderStructureApi";
import { Circle } from "@mui/icons-material";

const DropDownComponent = ({
  onChange,
  disabled = false,
  setParams,
  onHandleSync,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const {
    data: monitorData,
    isLoading: isMornitorLoading,
    isFetching: isMornitorFetching,
  } = useGenerateImportedSystemsQuery({
    Year: moment().format("YYYY"),
    //BookName: null,
    UsePagination: false,
  });
  

  // Get permissions from session storage
  const user = JSON.parse(sessionStorage.getItem("user"));
  const permissions = user?.permission || [];

  // Function to check if user has permission for a specific book
  const hasBookPermission = (systemName, bookName) => {
    if (!permissions || permissions.length === 0) return false;

    // Check if the specific book permission exists
    const bookPermission = `${systemName} - ${bookName}`;
    return permissions.includes(bookPermission);
  };

  // Calculate default date value - use current month at end of month, otherwise previous month
  const calculateDefaultDate = () => {
    const today = moment();
    const endOfMonth = today.clone().endOf("month");
    const isEndOfMonth = today.isSame(endOfMonth, "day");

    // If it's the last day of the month, use current month
    // Otherwise use previous month
    if (isEndOfMonth) {
      return today.format("YYYY-MM");
    } else {
      return today.subtract(1, "month").format("YYYY-MM");
    }
  };

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(systemDateSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const paramsRef = useRef({});

  const [triggerFetchSystem, { data: systemData, isFetching }] =
    useLazyGetAllSystemsAsyncQuery();
 
  // Watch the adjustment_month field to get the current selected date
  const watchedDate = watch("adjustment_month");

  // Updated function to check if a book is imported for the selected month
  const isBookImported = (systemName, bookName, selectedMonth) => {
    if (!monitorData?.value?.data || !selectedMonth) return false;

    // Get the month number from the selected date (1-12)
    const monthNumber = moment(selectedMonth, "YYYY-MM").month() + 1; // moment().month() returns 0-11, so we add 1

    // Find the book data by matching the boa field with the book key
    const bookData = monitorData.value.data.find(
      (item) => item.boa === bookName
    );

    // Check if the month data exists and status is 1
    if (bookData && bookData.monthlyStatus) {
      const monthData = bookData.monthlyStatus.find(
        (monthStatus) => monthStatus.month === monthNumber
      );
      return monthData && monthData.status === 1;
    }

    return false;
  };

  const getSyncDate = (systemName, bookName, selectedMonth) => {
    if (!monitorData?.value?.data || !selectedMonth) return null;

    const monthNumber = moment(selectedMonth, "YYYY-MM").month() + 1;

    // Match directly using bookName only (as you've fixed it)
    const bookData = monitorData.value.data.find(
      (item) => item.boa === bookName
    );

    const monthData = bookData?.monthlyStatus?.find(
      (m) => m.month === monthNumber
    );

    return monthData?.syncDate || null;
  };

  // Function to render import status chip
  const renderImportStatusChip = (systemName, bookName, selectedMonth) => {
    const isImported = isBookImported(systemName, bookName, selectedMonth);
    const syncDate = getSyncDate(systemName, bookName, selectedMonth);
    

    return (
      <Box display="flex" alignItems={"center"} gap={1}>
        {isImported && syncDate && (
          <Typography
            variant="caption"
            sx={{ fontSize: "0.75rem", color: "text.secondary" }}
          >
            {moment(syncDate).format("YYYY-MM-DD")}
          </Typography>
        )}

        <Circle
          sx={{
            fontSize: "12px",
            color: isImported ? "#4caf50" : "#bdbdbd", // Green for imported, grey for not imported
          }}
        />
      </Box>
    );
  };

  // Function to flatten systems and books into a single array for Autocomplete - WITH PERMISSION FILTERING
  const getAutocompleteOptions = (systemData) => {
    if (!systemData?.value?.result) return [];

    const options = [];

    systemData.value.result
      .filter((item) => item.isActive)
      .forEach((system) => {
        // Parse bookParameter if it exists and is not null/empty
        let books = [];

        if (
          system.bookParameter &&
          system.bookParameter !== "[]" &&
          system.bookParameter !== null
        ) {
          try {
            books = JSON.parse(system.bookParameter);

            // Filter out books where status is false AND filter by permissions
            books = books.filter((book) => {
              const isStatusActive = book.status !== false;
              const hasPermission = hasBookPermission(
                system.systemName,
                book.bookName
              );
              return isStatusActive && hasPermission;
            });
          } catch (error) {
            books = [];
          }
        }

        // Only add system if it has books with status true AND user has permission for at least one book
        if (books.length > 0) {
          // Add system header
          options.push({
            ...system,
            isSystemHeader: true,
            displayText: system.systemName,
          });

          // Add books under this system (already filtered by permission)
          books.forEach((book, bookIndex) => {
            options.push({
              ...system,
              bookName: book.bookName,
              bookValue: book.bookValue,
              closeDate: book.closeDate,
              isSystemHeader: false,
              displayText: `${system.systemName} - ${book.bookName}`,
              uniqueKey: `${system.id}-book-${bookIndex}`,
            });
          });
        }
      });

    return options;
  };

  const handleOnChange = (data) => {
    onChange(data);
    paramsRef.current = {
      ...paramsRef.current,
      systemName: data.systemName,
      endpoint: data.endpoint,
      token: data.token,
      bookName: data.bookName,
    };

    // Also ensure adjustment_month is set when system changes
    const defaultDate = calculateDefaultDate();
    setParams((prev) => ({
      ...prev,
      adjustment_month: watch("adjustment_month"),
      systemName: data.systemName,
      endpoint: data.endpoint,
      token: data.token,
      bookName: data.bookName,
    }));

    // Update the form validation
    setValue("adjustment_month", defaultDate, { shouldValidate: true });
  };

  const submitHandler = async (formDate) => {
    setIsLoading(true);
    try {
      await onHandleSync({ formDate });
    } finally {
      setIsLoading(false);
    }
  };

  // Set default date on component mount
  useEffect(() => {
    const defaultDate = calculateDefaultDate();

    // Set form value and validate
    setValue("adjustment_month", defaultDate, {
      shouldValidate: true,
      shouldDirty: false,
    });

    // Update params
    setParams((prev) => ({
      ...prev,
      adjustment_month: defaultDate,
    }));

    setSelectedDate(defaultDate);
  }, [setValue, setParams]);

  return (
    <>
      <Autocomplete
        fullWidth
        disabled={disabled}
        options={getAutocompleteOptions(systemData)}
        getOptionLabel={(option) => {
          if (option && option.systemName && option.bookName) {
            return `${option.systemName} - ${option.bookName}`;
          }
          return option ? option.systemName || "" : "";
        }}
        renderOption={(props, option) => {
          // Handle system headers
          if (option.isSystemHeader) {
            return (
              <Box
                component="li"
                {...props}
                key={`system-${option.id}`}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  pointerEvents: "none",
                  color: "rgba(0, 0, 0, 0.87)",
                }}
              >
                {option.systemName}
              </Box>
            );
          }

          // Handle book items
          const currentSelectedDate = watchedDate || selectedDate;
          const isImported = isBookImported(
            option.systemName,
            option.bookName,
            currentSelectedDate
          );

          return (
            <Box
              component="li"
              {...props}
              key={option.uniqueKey}
              sx={{
                paddingLeft: 4,
                fontSize: "0.875rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "40px",
                ...(isImported && {
                  opacity: 0.6,
                  backgroundColor: "#f5f5f5",
                }),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <span>&nbsp;&nbsp;- {option.bookName}</span>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", marginLeft: 2 }}
              >
                {renderImportStatusChip(
                  option.systemName,
                  option.bookName,
                  currentSelectedDate
                )}
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="System"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isFetching ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        value={
          paramsRef.current.systemName && paramsRef.current.bookName
            ? getAutocompleteOptions(systemData).find(
                (opt) =>
                  opt.systemName === paramsRef.current.systemName &&
                  opt.bookName === paramsRef.current.bookName &&
                  !opt.isSystemHeader
              )
            : null
        }
        onChange={(event, newValue) => {
          if (newValue && !newValue.isSystemHeader) {
            const selectedBook = newValue;

            // Additional permission check before allowing selection
            if (
              !hasBookPermission(selectedBook.systemName, selectedBook.bookName)
            ) {
              console.warn(
                "User does not have permission for this book:",
                selectedBook
              );
              return;
            }

            const currentSelectedDate = watchedDate || selectedDate;
            const isImported = isBookImported(
              selectedBook.systemName,
              selectedBook.bookName,
              currentSelectedDate
            );

            handleOnChange(selectedBook);

            if (isImported) {
              setValue("adjustment_month", moment().format("YYYY-MM"));
            } else {
              setValue(
                "adjustment_month",
                moment().subtract(1, "months").format("YYYY-MM")
              );
            }

            const fullEndpoint = `${selectedBook.endpoint}/${selectedBook.bookValue}`;

            setParams((prevVal) => ({
              ...prevVal,
              ...selectedBook,
              isImported: isImported,
              endpoint: fullEndpoint,
              token: selectedBook.token,
              systemName: selectedBook.systemName,
              bookName: selectedBook.bookName,
            }));
          }
        }}
        onOpen={() => {
          triggerFetchSystem({}, true);
        }}
        filterOptions={(options, { inputValue }) => {
          // Custom filter logic for searching
          return options.filter((option) => {
            if (option.isSystemHeader) {
              // Always include system headers if any of their books match
              return true;
            }
            return (
              option.systemName
                ?.toLowerCase()
                .includes(inputValue.toLowerCase()) ||
              option.bookName?.toLowerCase().includes(inputValue.toLowerCase())
            );
          });
        }}
        isOptionEqualToValue={(option, value) =>
          option.systemName === value?.systemName &&
          option.bookName === value?.bookName &&
          !option.isSystemHeader
        }
        getOptionDisabled={(option) => {
          // Always disable headers
          if (option.isSystemHeader) return true;

          // Only check books for disabled state
          if (option.systemName && option.bookName) {
            const currentSelectedDate = watchedDate || selectedDate;
            return isBookImported(
              option.systemName,
              option.bookName,
              currentSelectedDate
            );
          }

          // Default: don't disable
          return false;
        }}
        freeSolo={false}
        loading={isFetching}
        noOptionsText={
          isFetching
            ? "Loading..."
            : permissions.length === 0
            ? "No permissions assigned"
            : "No Systems Available"
        }
      />

      <form onSubmit={handleSubmit(submitHandler)}>
        <Controller
          name="adjustment_month"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              sx={{ width: "100%", marginTop: "15px" }}
              label="Date"
              views={["month", "year"]}
              value={value ? dayjs(value) : null}
              minDate={dayjs().startOf("year")}
              maxDate={dayjs().endOf("year")}
              onChange={(newValue) => {
                // Format the value to YYYY-MM and pass it to onChange
                const formattedValue = newValue
                  ? dayjs(newValue).format("YYYY-MM")
                  : null;
                onChange(formattedValue);

                setParams((prevVal) => ({
                  ...prevVal,
                  adjustment_month: formattedValue,
                }));
              }}
              onOpen={() => {
                triggerFetchSystem({}, true);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: errors.adjustment_month?.message,
                  error: !!errors.adjustment_month,
                },
              }}
              renderInput={(params) => (
                <TextField
                  sx={{ width: "20px" }}
                  {...params}
                  helperText={errors.adjustment_month?.message}
                  error={!!errors.adjustment_month}
                />
              )}
            />
          )}
        />

        <Button
          variant="contained"
          type="submit"
          size="large"
          fullWidth
          disabled={!isValid || isLoading || !paramsRef.current.systemName}
          sx={{ alignItems: "center", marginTop: "30px" }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sync"}
        </Button>
      </form>
    </>
  );
};

export default DropDownComponent;
