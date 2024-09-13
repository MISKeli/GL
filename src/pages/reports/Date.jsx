import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { reportSchema } from "../../schemas/validation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, TextField } from "@mui/material";
import "../../styles/Date.scss";
import { useGetAllGLReportAsyncQuery, useLazyGetAllGLReportAsyncQuery } from "../../features/api/reportApi";
import { toast } from "sonner";
import dayjs from "dayjs"; // Use dayjs instead of moment
import moment from "moment";

const Date = ({ data }) => {
  const {
    reset,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reportSchema),
    defaultValues: { DateFrom: null, DateTo: null },
  });

  const [triggerFetchGLReport, { data: GLReport, isLoading: isGLReportLoading }] =
    useLazyGetAllGLReportAsyncQuery();

  console.log("Fetched GLReport Data:", GLReport); // Debugging output
  const submitHandler = (formData) => {
    console.log({formData})
    const body = {
      DateFrom: moment(formData.DateFrom).format("YYYY-MM-DD"),
      DateTo: moment(formData.DateTo).format("YYYY-MM-DD"),
    };

    // Handle API call or further processing
    console.log("Submitting Form:", body);
    triggerFetchGLReport(body)
;
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
                  value={value ? dayjs(value) : null} // Use dayjs instead of moment
                  onChange={(newValue) => {
                    console.log("DateFrom selected:", newValue); // Debugging output
                    onChange(newValue ? newValue.toDate() : null); // Convert dayjs to JavaScript Date object
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
                  value={value ? dayjs(value) : null} // Use dayjs instead of moment
                  onChange={(newValue) => {
                    console.log("DateTo selected:", newValue); // Debugging output
                    onChange(newValue ? newValue.toDate() : null); // Convert dayjs to JavaScript Date object
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
        <button type="submit">Submit</button>
      </form>
    </LocalizationProvider>
  );
};

export default Date;
