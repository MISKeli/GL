import {
    Divider,
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

const DropDownComponent = ({
  label,
  valueKey,
  labelKey,
  onChange,
  disabled = false,
}) => {
  const [dataa, setDataa] = useState(null);

  const [triggerFetchSystem, { data: systemData, isSuccess }] =
    useLazyGetAllSystemsAsyncQuery();
  const handleOnChange = (data) => {
    setDataa(data);
    onChange(data);
  };
  return (
    <>
      <FormControl
        sx={{ width: "25ch" }}
        variant="outlined"
        size="small" 
        disabled={disabled}
      >
        <InputLabel id="systemName">System</InputLabel>
        <Select
          labelId="systemName"
          id="dynamic-dropdown"
          value={dataa}
          onOpen={() => {
            triggerFetchSystem({}, true);
          }}
          onChange={(e) => {
            handleOnChange(e.target.value);
          }}
          label="System"
        >
          {systemData?.result?.map((item) => (
            <MenuItem key={item["id"]} value={item}>
              {item[labelKey]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider sx={{ height: 28, m: 0.5 }} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Date"
          views={["month", "year"]}
          onChange={(newvalue) => onChange(newValue)}
          renderInput={(params) => (
            <TextField
              size="small"
              sx={{ width: "20ch" }} // Adjust the width or other styles here
              {...params}
            />
          )}
        />
      </LocalizationProvider>
    </>
  );
};

export default DropDownComponent;
