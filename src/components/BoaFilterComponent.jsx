import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  TextField,
  CircularProgress,
  Box,
  Select,
} from "@mui/material";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import dayjs from "dayjs";
import "../styles/FilterComponent.scss";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { boaSchema } from "../schemas/validation";
import { useLazyGetAllSystemsAsyncQuery } from "../features/api/systemApi";

const BoaFilterComponent = ({ setReportData }) => {
  const currentDate = dayjs();

  const [anchorEl, setAnchorEl] = useState(null);

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

  console.log(errors);
  // Lazy query to fetch systems
  const [getSystems, { data: systemsData, isLoading: isSystemsLoading }] =
    useLazyGetAllSystemsAsyncQuery();

  // Fetch systems on component mount
  useEffect(() => {
    getSystems(); // Fetch systems
  }, [getSystems]);

  const submitHandler = (formData) => {
    const selectedDate = dayjs(formData.selectedDate);
    const month = selectedDate.format("MMM"); // Extract month (e.g., "Jan")
    const year = selectedDate.format("YYYY"); // Extract year (e.g., "2024")

    console.log("Month:", month, "Year:", year); // Log to check values

    setReportData({
      Month: month,
      Year: year,
      System: formData.System,
    });
  };

  const clearDate = () => {
    reset({
      selectedDate: currentDate, // Reset to current date
      System: "",
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="filter__menu__content"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MenuItem>
              <Controller
                name="selectedDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    views={["month", "year"]}
                    label="Month and Year"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={field.onChange}
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
            </MenuItem>
            {/* <MenuItem>
              <Controller
                name="System"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    sx={{ borderRadius: "10px" }}
                    variant="outlined"
                    displayEmpty
                    inputProps={{ "aria-label": "Select System" }}
                    className="systems__header__container1--dropdown"
                  >
                    <MenuItem value="" disabled>
                      Select a System
                    </MenuItem>
                    {systemsData?.result.map((system) => (
                      <MenuItem key={system.id} value={system.systemName}>
                        {system.systemName}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </MenuItem> */}
          </LocalizationProvider>
          <Box className="filter__menu__content__buttons">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={() => {
                handleMenuClose();
              }}
              // disabled={isPurchasesBookLoading || isSystemsLoading}
              // startIcon={
              //   isPurchasesBookLoading ? <CircularProgress size={20} /> : null
              // }
            >
              Submit
              {/* {isPurchasesBookLoading ? "Fetching..." : "Submit"} */}
            </Button>{" "}
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                clearDate();
              }}
            >
              Clear
            </Button>
          </Box>
        </form>
      </Menu>
    </div>
  );
};

export default BoaFilterComponent;
