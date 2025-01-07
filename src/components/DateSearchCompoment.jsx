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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React, { useRef, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import {
  AlignHorizontalLeftRounded,
  AlignVerticalTopRounded,
  ClearRounded,
  SearchRounded,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { boaSchema } from "../schemas/validation";
import "../styles/FilterComponent.scss";

const DateSearchCompoment = ({
  setReportData,
  hasDate = true,
  onViewChange,
  hasViewChange = false,
  hasImport = false,
}) => {
  const currentDate = dayjs();

  const inputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [isHorizontalView, setIsHorizontalView] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [importDate, setImportDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(boaSchema),
    defaultValues: {
      selectedDate: currentDate, // Set default date
    },
  });

  const handleDateChange = async () => {
    setLoading(true); // Start loading

    const fromMonth = fromDate.format("MMM").toString();
    const fromYear = fromDate.format("YYYY");
    const toMonth = toDate.format("MMM").toString();
    const toYear = toDate.format("YYYY");

    const importMonth = hasImport ? importDate.format("MMM") : null;
    const importYear = hasImport ? importDate.format("YYYY") : null;

    // try {
    //   await setReportData({
    //     fromMonth,
    //     fromYear,
    //     toMonth,
    //     toYear,
    //   });
    // }
    try {
      const reportData = {
        fromMonth,
        fromYear,
        toMonth,
        toYear,
      };

      if (hasImport) {
        reportData.Month = importMonth;
        reportData.Year = importYear;
      }

      await setReportData(reportData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false); // Stop loading after fetching completes
    }
  };

  // Updates report data when the date is changed
  const handleImportDateChange = (selectedDate) => {
    setImportDate(selectedDate);
    // const month = selectedDate.format("MMM");
    // const year = selectedDate.format("YYYY");

    // setReportData({
    //   Month: month,
    //   Year: year,
    //   Search: search,
    // });
  };

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

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

  const currentYear = dayjs();

  return (
    <div className="filter">
      {hasImport && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
        </LocalizationProvider>
      )}
      <Box
        className={`filter__search ${expanded ? "expanded" : ""}`}
        component="form"
        onClick={() => setExpanded(true)}
      >
        <InputBase
          sx={{ ml: 0.5, flex: 1 }}
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          inputRef={inputRef}
          onBlur={() => search === "" && setExpanded(false)} // Collapse when no input
        />
        {search && (
          <IconButton
            color="primary"
            type="button"
            aria-label="clear"
            onClick={() => {
              setSearch(""); // Clears the search input
              inputRef.current.focus(); // Keeps focus on the input after clearing
            }}
          >
            <ClearRounded />
          </IconButton>
        )}
        {/* <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" /> */}
        <IconButton
          color="primary"
          type="button"
          // sx={{ p: "10px" }}
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["month", "year"]}
            label="From (Month and Year)"
            value={fromDate}
            // minDate={pastYear}
            //maxDate={currentYear}
            slotProps={{
              textField: {
                variant: "standard",
              },
            }}
            onChange={(date) => {
              setFromDate(date);
              // handleDateChange(date, toDate);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
          <Typography className="filter__dash" fontWeight={600}>
            {" "}
            _{" "}
          </Typography>
          <DatePicker
            views={["month", "year"]}
            label="To (Month and Year)"
            value={toDate}
            minDate={fromDate}
            slotProps={{
              textField: {
                variant: "standard",
              },
            }}
            onChange={(date) => {
              setToDate(date);
              //handleDateChange(fromDate, date);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      )}
      {/* Submit Button with Loading */}
      {(hasDate || hasImport) && (
        <Box className="filter__submit">
          <Button
            variant="contained"
            color="primary"
            onClick={handleDateChange}
            disabled={loading || toDate.isBefore(fromDate, "month")} // Disable button when loading
            startIcon={loading && <CircularProgress size={16} />} // Show loading spinner
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      )}
    </div>
  );
};

export default DateSearchCompoment;
