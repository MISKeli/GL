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
import React, { useRef, useState } from "react";
import { useLazyGetAllSystemsAsyncQuery } from "../features/api/systemApi";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { systemDateSchema } from "../schemas/validation";
import { DatePicker } from "@mui/x-date-pickers";

const DropDownComponent = ({
  onChange,
  disabled = false,
  setParams,
  onHandleSync,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(systemDateSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const paramsRef = useRef({});

  const [triggerFetchSystem, { data: systemData, isFetching }] =
    useLazyGetAllSystemsAsyncQuery();

  const handleOnChange = (data) => {
    onChange(data);
    paramsRef.current = {
      ...paramsRef.current,
      systemName: data.systemName,
      endpoint: data.endpoint,
      token: data.token,
    };
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
          value={paramsRef.current.systemName}
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
          {isFetching ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ marginRight: 1 }} /> Loading...
            </MenuItem>
          ) : systemData?.result?.filter((item) => item.isActive).length > 0 ? (
            systemData.result
              .filter((item) => item.isActive)
              .map((item) => (
                <MenuItem key={item.id} value={item}>
                  {item.systemName}
                </MenuItem>
              ))
          ) : (
            <MenuItem disabled>No Systems Available</MenuItem>
          )}
        </Select>
      </FormControl>
      {/* <Divider sx={{ height: 28, m: 0.5 }} /> */}
      <form onSubmit={handleSubmit(submitHandler)}>
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

        <Button
          variant="contained"
          type="submit"
          size="large"
          fullWidth
          disabled={!isValid || isLoading || !paramsRef.current.systemName}
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
