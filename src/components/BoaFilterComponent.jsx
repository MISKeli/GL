import React, { useRef, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { IconButton, TextField, Box, InputBase, Tooltip } from "@mui/material";

import dayjs from "dayjs";
import "../styles/FilterComponent.scss";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { boaSchema } from "../schemas/validation";
//import { useLazyGetAllSystemsAsyncQuery } from "../features/api/systemApi";
import {
  AlignHorizontalLeftRounded,
  AlignVerticalTopRounded,
  ClearRounded,
  SearchRounded,
} from "@mui/icons-material";

const BoaFilterComponent = ({ setReportData, onViewChange }) => {
  const currentDate = dayjs();

  const inputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [isHorizontalView, setIsHorizontalView] = useState(true);
  const {
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(boaSchema),
    defaultValues: {
      selectedDate: currentDate, // Set default date
    },
  });

  // Updates report data when the date is changed
  const handleDateChange = (selectedDate) => {
    const month = selectedDate.format("MMM");
    const year = selectedDate.format("YYYY");

    setReportData({
      Month: month,
      Year: year,
      Search: search,
    });
  };

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  const tooltipTitle = isHorizontalView ? "Horizontal View" : "Vertical View";

  const toggleViewFormat = () => {
    setIsHorizontalView((prevFormat) => {
      const newFormat = !prevFormat;
      onViewChange(newFormat);
      return newFormat;
    });
  };

  return (
    <div className="filter">
      <Tooltip title={tooltipTitle} placement="left" arrow>
        <IconButton onClick={toggleViewFormat}>
          {isHorizontalView ? (
            <AlignHorizontalLeftRounded color="primary" />
          ) : (
            <AlignVerticalTopRounded color="primary" />
          )}
        </IconButton>
      </Tooltip>

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
          sx={{ p: "10px" }}
          aria-label="search"
          onClick={handleSearchClick}
        >
          <SearchRounded />
        </IconButton>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name="selectedDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              views={["month", "year"]}
              label="Month and Year"
              value={field.value ? dayjs(field.value) : null}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange(date);
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
    </div>
  );
};

export default BoaFilterComponent;
