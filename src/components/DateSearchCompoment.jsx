/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import {
  AlignHorizontalLeftRounded,
  AlignVerticalTopRounded,
  ClearRounded,
  SearchRounded,
} from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { boaSchema } from "../schemas/validation";
import "../styles/FilterComponent.scss";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useRememberQueryParams } from "../hooks/useRememberQueryParams";

const DateSearchCompoment = ({
  setReportData,
  hasDate = true,
  onViewChange,
  hasViewChange = false,
  hasImport = false,
  hasDetailed = false,
  isTrailBalance = false,
  isYearOnly = false,
  initialDate = null,
  updateQueryParams = false,
  // New props for search functionality
  onSearchChange,
  searchValue = "",
}) => {
  const currentDate = moment();
  const [currentParams, setQueryParams] = useRememberQueryParams();

  // Initialize dates based on initialDate or current date
  const getInitialFromDate = () => {
    if (initialDate) {
      const date = moment(initialDate);
      return date;
    }
    return currentDate.clone();
  };

  const getInitialToDate = () => {
    if (initialDate) {
      const date = moment(initialDate).endOf("month");
      return date;
    }
    return currentDate.clone().endOf("month");
  };

  const inputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState(searchValue || "");
  const [isHorizontalView, setIsHorizontalView] = useState(false);
  const [fromDate, setFromDate] = useState(() => getInitialFromDate());
  const [toDate, setToDate] = useState(() => getInitialToDate());
  const [year, setYear] = useState(() => getInitialFromDate());
  const [importDate, setImportDate] = useState(() => getInitialFromDate());
  const [loading, setLoading] = useState(false);

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(boaSchema),
    defaultValues: {
      selectedDate: getInitialFromDate(),
    },
  });

  // Update search value when prop changes
  useEffect(() => {
    setSearch(searchValue || "");
  }, [searchValue]);

  // Update dates when initialDate prop changes
  useEffect(() => {
    if (initialDate && moment(initialDate).isValid()) {
      const newFromDate = moment(initialDate);
      const newToDate = moment(initialDate).endOf("month");

      setFromDate(newFromDate);
      setToDate(newToDate);
      setYear(newFromDate);
      setImportDate(newFromDate);
    }
  }, [initialDate?.valueOf()]);

  // Handle search changes with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(search);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [search, onSearchChange]);

  const handleDateChange = async () => {
    console.log("triggering");
    setLoading(true);

    try {
      let reportData = {};
      let selectedDate = null;

      if (isTrailBalance) {
        reportData = {
          fromMonth: "12/01/2024",
          toMonth: toDate.clone().endOf("month").format("MM/DD/YYYY"),
        };
        selectedDate = toDate;
      } else if (hasImport) {
        reportData = {
          fromMonth: importDate.clone().startOf("month").format("MM/DD/YYYY"),
          toMonth: importDate.clone().endOf("month").format("MM/DD/YYYY"),
        };
        selectedDate = importDate;
      } else if (hasDetailed) {
        reportData = {
          fromMonth: fromDate.clone().startOf("month").format("MM/DD/YYYY"),
          toMonth: fromDate.clone().endOf("month").format("MM/DD/YYYY"),
        };
        selectedDate = fromDate;
      } else if (isYearOnly) {
        reportData = {
          fromMonth: year.clone().startOf("year").format("MM/DD/YYYY"),
          toMonth: year.clone().endOf("year").format("MM/DD/YYYY"),
        };
        selectedDate = year;
      } else {
        reportData = {
          fromMonth: fromDate.clone().startOf("month").format("MM/DD/YYYY"),
          toMonth: toDate.clone().endOf("month").format("MM/DD/YYYY"),
        };
        selectedDate = fromDate;
      }

      // Update query parameters if enabled
      if (updateQueryParams && selectedDate) {
        setQueryParams(
          {
            date: selectedDate.format("YYYY-MM-DD"),
          },
          { retain: true }
        );
      }

      await setReportData(reportData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportDateChange = (selectedDate) => {
    setImportDate(moment(selectedDate));
  };

  const handleFromDateChange = (selectedDate) => {
    const newFromDate = moment(selectedDate);
    setFromDate(newFromDate);

    if (toDate.isBefore(newFromDate, "month")) {
      setToDate(newFromDate.clone().endOf("month"));
    }
  };

  const handleToDateChange = (selectedDate) => {
    setToDate(moment(selectedDate));
  };

  const handleDetailedDateChange = (selectedDate) => {
    const selectedMoment = moment(selectedDate);
    setFromDate(selectedMoment.clone().startOf("month"));
    setToDate(selectedMoment.clone().endOf("month"));
  };

  const handleYearChange = (selectedDate) => {
    setYear(moment(selectedDate));
  };

  // Enhanced search handlers
  const handleSearchClick = () => {
    setExpanded(true);
    inputRef.current?.focus();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleSearchClear = () => {
    setSearch("");
    if (onSearchChange) {
      onSearchChange("");
    }
    inputRef.current?.focus();
  };

  const handleSearchBlur = () => {
    if (search === "") {
      setExpanded(false);
    }
  };

  // Auto-expand search if there's a search value
  useEffect(() => {
    if (search) {
      setExpanded(true);
    }
  }, [search]);

  const tooltipTitle = isHorizontalView
    ? "Change Horizontal View"
    : "Change Vertical View";

  const toggleViewFormat = () => {
    setIsHorizontalView((prevFormat) => {
      const newFormat = !prevFormat;
      onViewChange(newFormat);
      return newFormat;
    });
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (isTrailBalance) return false;
    if (hasDate && toDate.isBefore(fromDate, "month")) return true;
    return false;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className="filter">
        {hasImport && (
          <Controller
            name="selectedDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                views={["month", "year"]}
                label="Month and Year"
                value={importDate}
                onChange={(date) => {
                  field.onChange(date);
                  handleImportDateChange(date);
                }}
                slotProps={{
                  textField: {
                    variant: "standard",
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    helperText={errors.selectedDate?.message}
                    error={!!errors.selectedDate}
                  />
                )}
              />
            )}
          />
        )}

        <Box
          className={`filter__search ${expanded ? "expanded" : ""}`}
          component="form"
          onClick={() => setExpanded(true)}
        >
          <InputBase
            sx={{ ml: 0.5, flex: 1 }}
            placeholder="Search BOA, System, or Status..."
            value={search}
            onChange={handleSearchChange}
            inputRef={inputRef}
            onBlur={handleSearchBlur}
          />
          {search && (
            <IconButton
              color="primary"
              type="button"
              aria-label="clear"
              onClick={handleSearchClear}
            >
              <ClearRounded />
            </IconButton>
          )}
          <IconButton
            color="primary"
            type="button"
            aria-label="search"
            onClick={handleSearchClick}
          >
            <SearchRounded />
          </IconButton>
        </Box>

        {hasViewChange && (
          <Tooltip title={tooltipTitle} placement="left" arrow>
            <IconButton onClick={toggleViewFormat}>
              {isHorizontalView ? (
                <AlignHorizontalLeftRounded color="primary" />
              ) : (
                <AlignVerticalTopRounded color="primary" />
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* DatePicker */}
        {hasDate && (
          <>
            <DatePicker
              key={`from-${fromDate?.valueOf()}`}
              views={["month", "year"]}
              label="From (Month and Year)"
              value={isTrailBalance ? moment("12/01/2024") : fromDate}
              disabled={isTrailBalance}
              slotProps={{
                textField: {
                  variant: "standard",
                },
              }}
              onChange={handleFromDateChange}
            />

            <Typography className="filter__dash" fontWeight={600}>
              {" "}
              _{" "}
            </Typography>
            <DatePicker
              key={`to-${toDate?.valueOf()}`}
              views={["month", "year"]}
              label="To (Month and Year)"
              value={toDate}
              minDate={isTrailBalance ? undefined : fromDate}
              slotProps={{
                textField: {
                  variant: "standard",
                },
              }}
              onChange={handleToDateChange}
            />
          </>
        )}

        {hasDetailed && (
          <DatePicker
            views={["month", "year"]}
            label="As of"
            value={fromDate}
            slotProps={{
              textField: {
                variant: "standard",
              },
            }}
            onChange={handleDetailedDateChange}
          />
        )}

        {isYearOnly && (
          <DatePicker
            views={["year"]}
            label="As of"
            value={year}
            slotProps={{
              textField: {
                variant: "standard",
              },
            }}
            onChange={handleYearChange}
          />
        )}

        {/* Submit Button with Loading */}
        {(hasDate || hasImport || hasDetailed || isYearOnly) && (
          <Box className="filter__submit">
            <Button
              variant="contained"
              color="primary"
              onClick={handleDateChange}
              disabled={isSubmitDisabled()}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default DateSearchCompoment;
