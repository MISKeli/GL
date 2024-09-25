import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { reportSchema } from "../../schemas/validation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Button,
  Divider,
  Grid,
  TextField,
  CircularProgress,
} from "@mui/material";
import "../../styles/Date.scss";
import { useLazyGetAllGLReportAsyncQuery } from "../../features/api/reportApi";
import dayjs from "dayjs";
import moment from "moment";

const Date = ({ onFetchData }) => {
  const currentDate = dayjs();

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reportSchema),
    defaultValues: {
      DateFrom: currentDate.toDate(),
      DateTo: currentDate.toDate(),
    },
  });

  const [triggerFetchGLReport, { isLoading: isGLReportLoading }] =
    useLazyGetAllGLReportAsyncQuery();

  const submitHandler = (formData) => {
    const body = {
      DateFrom: moment(formData.DateFrom).format("YYYY-MM-DD"),
      DateTo: moment(formData.DateTo).format("YYYY-MM-DD"),
    };

    triggerFetchGLReport(body).then((result) => {
      onFetchData(result.data);
    });
  };

  const clearHandler = () => {
    reset({
      DateFrom: currentDate.toDate(),
      DateTo: currentDate.toDate(),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={2}>
          <Grid item xs={5} className="date-picker__grid-item">
            <Controller
              name="DateFrom"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Date From"
                  value={value ? dayjs(value) : null}
                  onChange={(newValue) =>
                    onChange(newValue ? newValue.toDate() : null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      className="date-picker__text-field"
                      helperText={errors.DateFrom?.message}
                      error={!!errors.DateFrom}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={5} className="date-picker__grid-item">
            <Controller
              name="DateTo"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Date To"
                  value={value ? dayjs(value) : null}
                  onChange={(newValue) =>
                    onChange(newValue ? newValue.toDate() : null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      className="date-picker__text-field"
                      helperText={errors.DateTo?.message}
                      error={!!errors.DateTo}
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
        <Divider className="date-picker__divider" />
        <Grid container justifyContent="center" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={clearHandler}
              disabled={isGLReportLoading}
              className="date-picker__button"
            >
              Clear
            </Button>
          </Grid>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              disabled={isGLReportLoading}
              className="date-picker__button"
              startIcon={
                isGLReportLoading ? <CircularProgress size={20} /> : null
              }
            >
              {isGLReportLoading ? "Fetching..." : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </LocalizationProvider>
  );
};

export default Date;
