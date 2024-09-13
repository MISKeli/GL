import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { reportSchema } from "../../schemas/validation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button, Divider, Grid, TextField } from "@mui/material";
import "../../styles/Date.scss";
import { useLazyGetAllGLReportAsyncQuery } from "../../features/api/reportApi";
import dayjs from "dayjs";
import moment from "moment";



const Date = ({ onFetchData }) => {
  const currentDate = dayjs(); // Get the current date

  const {
    reset,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reportSchema),
    defaultValues: {
      DateFrom: currentDate.startOf("month").toDate(), // Start of current month
      DateTo: currentDate.endOf("month").toDate(), // End of current month
    },
  });

  const [
    triggerFetchGLReport,
    { data: GLReport, isLoading: isGLReportLoading },
  ] = useLazyGetAllGLReportAsyncQuery();

  const submitHandler = (formData) => {
    const body = {
      DateFrom: moment(formData.DateFrom).format("YYYY-MM-DD"),
      DateTo: moment(formData.DateTo).format("YYYY-MM-DD"),
    };

    console.log("Submitting Form:", body);
    triggerFetchGLReport(body).then((result) => {
      console.log("Fetched GLReport Data:", result.data);
      onFetchData(result.data); // Pass the fetched data to the parent component
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={1}>
          <Grid item xs={5}>
            <Controller
              name="DateFrom"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Date From"
                  value={value ? dayjs(value) : null}
                  onChange={(newValue) => {
                    onChange(newValue ? newValue.toDate() : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      helperText={
                        errors.DateFrom ? errors.DateFrom.message : ""
                      }
                      error={!!errors.DateFrom}
                      className="date-picker__text-field"
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={5}>
            <Controller
              name="DateTo"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Date To"
                  value={value ? dayjs(value) : null}
                  onChange={(newValue) => {
                    onChange(newValue ? newValue.toDate() : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      helperText={errors.DateTo ? errors.DateTo.message : ""}
                      error={!!errors.DateTo}
                      className="date-picker__text-field"
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="horizontal" />
        <Button type="submit">Submit</Button>
      </form>
    </LocalizationProvider>
  );
};

export default Date;
