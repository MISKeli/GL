/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
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
import { useLazyGetSystemClosedDateQuery } from "../features/api/closedDateApi";
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
    BookName: "",
    UsePagination: true,
  });
  const daysThreshold = 30;

  const [triggerFetchClosedDate, { data: closedDataData }] =
    useLazyGetSystemClosedDateQuery();

  // const daysThreshold = closedDataData?.value.map((item) => item.closedDate);

  // Calculate default date value - previous month, but if day exceeds threshold then current month
  const calculateDefaultDate = (threshold) => {
    console.log("🚀 ~ calculateDefaultDate ~ threshold:", threshold);
    const today = moment();
    const currentDay = today.date();
    const thresholdValue = threshold ? parseInt(threshold, 10) : 25;

    // If current day is greater than threshold, use current month
    // Otherwise use previous month
    if (currentDay > thresholdValue) {
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

  // Function to check if a book is imported for the selected month
  const isBookImported = (systemName, bookName, selectedMonth) => {
    if (!monitorData?.value?.data) return false;

    const bookKey = `${systemName} - ${bookName}`;
    const monthName = moment()
      .subtract(1, "months")
      .format("MMMM")
      .toLowerCase();
    const bookData = monitorData.value.data.find(
      (item) => item.bookName === bookKey
    );

    // Check if the month data exists and status is 1
    return bookData && bookData[monthName] && bookData[monthName].status === 1;
  };

  // Function to get sync date for the selected month
  const getSyncDate = (systemName, bookName, selectedMonth) => {
    if (!monitorData?.value?.data) return null;

    const bookKey = `${systemName} - ${bookName}`;
    const monthName = moment()
      .subtract(1, "months")
      .format("MMMM")
      .toLowerCase();
    const bookData = monitorData.value.data.find(
      (item) => item.bookName === bookKey
    );
    // Return syncDate if month data exists and has a syncDate
    if (bookData && bookData[monthName] && !!bookData[monthName].syncDate) {
      return bookData[monthName].syncDate;
    }

    return null;
  };
  // Function to render import status chip
  const renderImportStatusChip = (systemName, bookName, selectedMonth) => {
    const isImported = isBookImported(systemName, bookName, selectedMonth);
    const syncDate = getSyncDate(systemName, bookName, selectedMonth);

    return (
      <Box display="flex" alignItems={"center"}>
        {isImported && syncDate && (
          <Typography variant="caption">
            {moment(syncDate).format("YYYY-MM-DD")}
          </Typography>
        )}

        <Circle
          size="small"
          label={isImported ? "Imported" : "Not Imported"}
          color={isImported ? "success" : "disabled"}
          variant="outlined"
          sx={{
            marginLeft: 1,
            fontSize: "0.7rem",
            height: "20px",
          }}
        />
      </Box>
    );
  };
  // Fetch necessary data when component mounts - only once
  useEffect(() => {
    triggerFetchClosedDate({}, true);
  }, []); // Empty dependency array means this runs once on mount

  const handleOnChange = (data) => {
    onChange(data);
    paramsRef.current = {
      ...paramsRef.current,
      systemName: data.systemName,
      endpoint: data.endpoint,
      token: data.token,
    };

    // Also ensure adjustment_month is set when system changes
    const defaultDate = calculateDefaultDate(daysThreshold);
    setParams((prev) => ({
      ...prev,
      adjustment_month: watch("adjustment_month"),
      systemName: data.systemName,
      endpoint: data.endpoint,
      token: data.token,
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

  // Update params when threshold changes
  useEffect(() => {
    if (daysThreshold) {
      const defaultDate = calculateDefaultDate(daysThreshold);

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
    }
  }, [daysThreshold, setValue, setParams]);
  return (
    <>
      <FormControl
        sx={{ width: "100%" }}
        variant="outlined"
        disabled={disabled}
      >
        <InputLabel id="systemName">System</InputLabel>

        <Select
          fullWidth
          sx={{ width: "100%" }}
          labelId="systemName"
          id="dynamic-dropdown"
          value={paramsRef.current.systemName}
          onOpen={() => {
            triggerFetchSystem({}, true);
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 300, // Set maximum height
                overflow: "auto", // Enable scrolling
              },
            },
          }}
          onChange={(e) => {
            const selectedBook = e.target.value;

            const isImported = isBookImported(
              selectedBook.systemName,
              selectedBook.bookName,
              watchedDate || selectedDate
            );

            handleOnChange(selectedBook);

            if (isImported) {
              setValue("adjustment_month", moment().format("YYYY-MM"));
            } else
              setValue(
                "adjustment_month",
                moment().subtract(1, "months").format("YYYY-MM")
              );
            // Concatenate endpoint + "/" + bookValue
            const fullEndpoint = `${selectedBook.endpoint}/${selectedBook.bookValue}`;

            setParams((prevVal) => {
              return {
                ...prevVal,
                ...selectedBook,
                isImported: isImported,
                endpoint: fullEndpoint,
                token: selectedBook.token,
                systemName: selectedBook.systemName,
                bookName: selectedBook.bookName,
              };
            });
          }}
          renderValue={(selected) => {
            // Display format: "SYSTEMNAME - BOOKNAME"
            if (selected && selected.systemName && selected.bookName) {
              return `${selected.systemName} - ${selected.bookName}`;
            }
            return selected ? selected.systemName || "" : "";
          }}
          label="System"
        >
          {isFetching ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ marginRight: 1 }} /> Loading...
            </MenuItem>
          ) : systemData?.value?.result?.filter((item) => item.isActive)
              .length > 0 ? (
            systemData.value.result
              .filter((item) => item.isActive)
              .map((system) => {
                // Parse bookParameter if it exists and is not null/empty
                let books = [];

                if (
                  system.bookParameter &&
                  system.bookParameter !== "[]" &&
                  system.bookParameter !== null
                ) {
                  try {
                    books = JSON.parse(system.bookParameter);
                    // Filter out books where status is false
                    books = books.filter((book) => book.status !== false);
                  } catch (error) {
                    // console.error("Error parsing bookParameter:", error);
                    books = [];
                  }
                }

                // Only render system if it has books with status true
                if (books.length === 0) {
                  return null;
                }

                return [
                  // System name as a disabled header
                  <MenuItem
                    key={`system-${system.id}`}
                    disabled
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      "&.Mui-disabled": {
                        opacity: 1,
                        color: "rgba(0, 0, 0, 0.87)",
                      },
                    }}
                  >
                    {system.systemName}
                  </MenuItem>,

                  // Books under this system
                  ...books.map((book, bookIndex) => {
                    const isImported = isBookImported(
                      system.systemName,
                      book.bookName,
                      watchedDate || selectedDate
                    );

                    return (
                      <MenuItem
                        key={`${system.id}-book-${bookIndex}`}
                        value={{
                          ...system,
                          bookName: book.bookName,
                          bookValue: book.bookValue,
                          closeDate: book.closeDate,
                        }}
                        // disabled={isImported} // disabled the bookName if already imported
                        sx={{
                          paddingLeft: 4,
                          fontSize: "0.875rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          ...(isImported && {
                            opacity: 0.6,
                            backgroundColor: "#f5f5f5",
                            "&.Mui-disabled": {
                              opacity: 0.6,
                              color: "rgba(0, 0, 0, 0.38)",
                            },
                          }),
                        }}
                      >
                        <span>&nbsp;&nbsp;- {book.bookName}</span>
                        {renderImportStatusChip(
                          system.systemName,
                          book.bookName,
                          watchedDate || selectedDate
                        )}
                      </MenuItem>
                    );
                  }),
                ];
              })
              .filter(Boolean) // Remove null entries from systems with no active books
              .flat() // Flatten the nested arrays
          ) : (
            <MenuItem disabled>No Systems Available</MenuItem>
          )}
        </Select>
        {/* try sample */}
        {/* <Select
          fullWidth
          sx={{ width: "100%" }}
          labelId="systemName"
          id="dynamic-dropdown"
          value={paramsRef.current.systemName}
          onOpen={() => {
            triggerFetchSystem({}, true);
          }}
          onChange={(e) => {
            handleOnChange(e.target.value);

            setParams((prevVal) => ({
              ...prevVal,
              endpoint: e.target.value.endpoint,
              token: e.target.value.token,
            }));
          }}
          label="System"
        >
          {isFetching ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ marginRight: 1 }} /> Loading...
            </MenuItem>
          ) : systemData?.value?.result?.filter((item) => item.isActive)
              .length > 0 ? (
            systemData.value.result
              .filter((item) => item.isActive)
              .map((item) => (
                <MenuItem key={item.id} value={item}>
                  {item.systemName}
                </MenuItem>
              ))
          ) : (
            <MenuItem disabled>No Systems Available</MenuItem>
          )}
        </Select> */}
      </FormControl>
      {/* <Divider sx={{ height: 28, m: 0.5 }} /> */}
      <form onSubmit={handleSubmit(submitHandler)}>
        <Controller
          name="adjustment_month"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              sx={{ width: "100%", marginTop: "15px" }}
              label="Date"
              disabled
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
                // triggerFetchClosedDate({}, true);
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
                  sx={{ width: "20px" }} // Adjust the width or other styles here
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
          {isLoading ? (
            <CircularProgress size={24} color="inherit" /> // Show spinner
          ) : (
            "Sync"
          )}
        </Button>
      </form>
    </>
  );
};

export default DropDownComponent;
