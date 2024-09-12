import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { reportSchema } from "../../schemas/validation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import { Grid } from "@mui/material";
import "../../styles/Date.scss";
import { useGetAllGLReportAsyncQuery } from "../../features/api/reportApi";
import { toast } from "sonner";

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

  const { data: GLReport, isLoading: isGLReportLoading } =
    useGetAllGLReportAsyncQuery();
  const submitHandler = (GLReport) => {
    const body = {
      DateFrom: GLReport.DateFrom,
      DateTo: GLReport.DateTo,
    };
    GLReport(body)
      .unwrap()
      .then((res) => {
        console.log(res);
        toast.success(res);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error);
      });
  };
  console.log({ GLReport });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={1}>
        <Grid item xs={5}>
          <Controller
            name={"DateFrom"}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <DatePicker
                disablePast
                {...rest}
                format="DD/MM/YYYY"
                value={value ? moment(value) : null}
                onChange={(event) => {
                  onChange(event);
                }}
                className="date-picker__input date-picker__input--from"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: errors.date && errors.date?.message,
                    error: !!errors.date,
                    className: "date-picker__text-field",
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={5}>
          <Controller
            name={"DateTo"}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <DatePicker
                disablePast
                {...rest}
                format="DD/MM/YYYY"
                value={value ? moment(value) : null}
                onChange={(event) => {
                  onChange(event);
                }}
                className="date-picker__input date-picker__input--to"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: errors.date && errors.date?.message,
                    error: !!errors.date,
                    className: "date-picker__text-field",
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default Date;
