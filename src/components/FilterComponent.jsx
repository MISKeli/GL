import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Button, Menu, MenuItem, IconButton, TextField } from "@mui/material";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import dayjs from "dayjs";
import "../styles/FilterComponent.scss";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { reportSchema } from "../schemas/validation";
import {
  useGetAllGLReportAsyncQuery,
  useImportReportsMutation,
} from "../features/api/importReportApi";
import moment from "moment";

const FilterComponent = ({ onFetchData }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const currentDate = dayjs();
  const {
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reportSchema),
    defaultValues: {
      DateFrom: dateFrom,
      DateTo: dateTo,
    },
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Check that the dates are correct before submission
    console.log("Submitting with DateFrom:", dateFrom, "DateTo:", dateTo);

    // Fetch data based on the selected dates
    onFetchData({
      dateFrom: dateFrom
        ? moment(dateFrom).format("YYYY-MM-DD HH:mm:ss")
        : null,
      dateTo: dateTo ? moment(dateTo).format("YYYY-MM-DD HH:mm:ss") : null,
    });

    handleMenuClose(); // Close the menu after submission
  };

  const clearDate = (e) => {
    e.preventDefault(); // Prevent the form from submitting

    // Clear the selected dates
    setDateFrom(null);
    setDateTo(null);

    // Fetch data with null values for the dates to clear the filters
    onFetchData({
      dateFrom: null,
      dateTo: null,
    });

    // Close the menu after clearing the dates
    handleMenuClose();
  };

  return (
    <div className="filter">
      <IconButton onClick={handleMenuOpen} className="filter__icon">
        <FilterListRoundedIcon color="primary" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="filter__menu"
      >
        <form onSubmit={submitHandler} className="filter__menu__content">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MenuItem>
              <DatePicker
                label="Date From"
                value={dateFrom}
                onChange={(newValue) => {
                  console.log(Object.entries(newValue));
                  console.log({ newValue }, new Date(newValue["$d"].toDate()));
                  setDateFrom(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    helperText={errors.DateFrom?.message}
                    error={!!errors.DateFrom}
                  />
                )}
              />
            </MenuItem>
            <MenuItem>
              <DatePicker
                label="Date To"
                value={dateTo}
                onChange={(newValue) => setDateTo(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    helperText={errors.DateTo?.message}
                    error={!!errors.DateTo}
                  />
                )}
              />
            </MenuItem>
          </LocalizationProvider>
          <div className="filter__menu__buttons">
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
            <Button variant="outlined" color="secondary" onClick={clearDate}>
              Clear
            </Button>
          </div>
        </form>
      </Menu>
    </div>
  );
};

export default FilterComponent;
