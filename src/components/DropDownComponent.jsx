/* eslint-disable react/prop-types */
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { useLazyGetAllSystemsAsyncQuery } from "../features/api/systemApi";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { systemDateSchema } from "../schemas/validation";

const DropDownComponent = ({
  onChange,
  disabled = false,
  setParams,
  onHandleSync,
}) => {
  const [dataa, setDataa] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    control,

    formState: { errors,isValid },
  } = useForm({
    resolver: yupResolver(systemDateSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [triggerFetchSystem, { data: systemData, isSuccess }] =
    useLazyGetAllSystemsAsyncQuery();
  const handleOnChange = (data) => {
    setDataa(data);
    onChange(data);
  };

  const submitHandler = async (formDate) => {
    console.log("Submitted data:", formDate);
    setIsLoading(true);
    try {
      await onHandleSync();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FormControl
        sx={{ width: "100%" }}
        variant="outlined"
        disabled={disabled}
      >
        <InputLabel id="systemName">System</InputLabel>
        <Select
          fullWidth
          sx={{ width: "100%" }}
          labelId="systemName"
          id="dynamic-dropdown"
          value={dataa}
          onOpen={() => {
            triggerFetchSystem({}, true);
          }}
          onChange={(e) => {
            handleOnChange(e.target.value);
            setParams((prevVal) => ({
              ...prevVal,
              endpoint: e.target.value.endpoint,
              token: e.target.value.token,
            }));
          }}
          label="System"
        >
          {systemData?.result?.map((item) => (
            <MenuItem key={item["id"]} value={item}>
              {item["systemName"]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* <Divider sx={{ height: 28, m: 0.5 }} /> */}
      <form onSubmit={handleSubmit(submitHandler)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            name="adjustment_month"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                sx={{ width: "100%", marginTop: "15px" }}
                label="Date"
                views={["month", "year"]}
                value={value ? dayjs(value) : null}
                onChange={(newValue) => {
                  // Format the value to YYYY-MM and pass it to onChange
                  const formattedValue = newValue
                    ? dayjs(newValue).format("YYYY-MM")
                    : null;
                  onChange(formattedValue);

                  setParams((prevVal) => ({
                    ...prevVal,
                    adjustment_month: formattedValue,
                  }));
                }}
                onOpen={() => {
                  triggerFetchSystem({}, true);
                }}
                renderInput={(params) => (
                  <TextField
                    sx={{ width: "20px" }} // Adjust the width or other styles here
                    {...params}
                    helperText={errors.adjustment_month?.message}
                    error={!!errors.adjustment_month}
                  />
                )}
              />
            )}
          />
        </LocalizationProvider>
        <Button
          variant="contained"
          type="submit"
          size="large"
          fullWidth
          disabled={!isValid || isLoading}
          sx={{ alignItems: "center", marginTop: "30px" }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" /> // Show spinner
          ) : (
            "Sync"
          )}
        </Button>
      </form>
    </>
  );
};

export default DropDownComponent;
