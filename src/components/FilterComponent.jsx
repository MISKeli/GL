import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import dayjs from "dayjs";
import "../styles/FilterComponent.scss";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { reportSchema } from "../schemas/validation";
import { useLazyGetAllGLReportAsyncQuery } from "../features/api/importReportApi";
import moment from "moment";

const FilterComponent = ({ onFetchData, setReportData }) => {
  const currentDate = dayjs();

  const [anchorEl, setAnchorEl] = useState(null);

  const {
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reportSchema),
    defaultValues: {
      DateFrom: currentDate,
      DateTo: currentDate,
    },
  });

  const [triggerFetchGLReport, { isLoading: isGLReportLoading }] =
    useLazyGetAllGLReportAsyncQuery();

  const submitHandler = (formData) => {
    setReportData({
      DateFrom: moment(formData.DateFrom).format("YYYY-MM-DD"),
      DateTo: moment(formData.DateTo).format("YYYY-MM-DD"),
    });
  };

  const clearDate = () => {
    reset({
      DateFrom: currentDate.toDate(),
      DateTo: currentDate.toDate(),
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
                name="DateFrom"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Date From"
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        helperText={errors.DateFrom?.message}
                        error={!!errors.DateFrom}
                      />
                    )}
                  />
                )}
              />
            </MenuItem>
            <MenuItem>
              <Controller
                name="DateTo"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Date To"
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        helperText={errors.DateTo?.message}
                        error={!!errors.DateTo}
                      />
                    )}
                  />
                )}
              />
            </MenuItem>
          </LocalizationProvider>
          <div className="filter__menu__buttons">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isGLReportLoading}
              startIcon={
                isGLReportLoading ? <CircularProgress size={20} /> : null
              }
            >
              {isGLReportLoading ? "Fetching..." : "Submit"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                clearDate(), handleMenuClose();
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Menu>
    </div>
  );
};

export default FilterComponent;
