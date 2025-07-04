/* eslint-disable react/prop-types */
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";
import TrialBalancePage from "./TrialBalancePage";
import DetailedTrailBalancePage from "./DetailedTrailBalancePage";
import { info } from "../../schemas/info";

const TrialBalanceDropDownPage = () => {
  const [selectedPage, setSelectedPage] = useState("trial"); // Default to trial balance

  const handlePageChange = (event) => {
    setSelectedPage(event.target.value);
  };

  const renderSelectedPage = () => {
    switch (selectedPage) {
      case "trial":
        return <TrialBalancePage />;
      case "detailed":
        return <DetailedTrailBalancePage />;
      default:
        return <TrialBalancePage />;
    }
  };

  return (
    <>
      <Box className="dropdown">
        <Box className="dropdown__container">
          <FormControl variant="standard" sx={{ minWidth: 250, mb: 2 }}>
            <InputLabel id="trial-balance-selector-label">
              Select Trial Balance Type
            </InputLabel>
            <Select
              labelId="trial-balance-selector-label"
              id="trial-balance-selector"
              value={selectedPage}
              onChange={handlePageChange}
              label="Select Trial Balance Type"
            >
              <MenuItem value="trial">{info.trialbalance_title}</MenuItem>
              <MenuItem value="detailed">
                {info.detailed_trialbalance_title}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="dropdown__table">{renderSelectedPage()}</Box>
      </Box>
    </>
  );
};

export default TrialBalanceDropDownPage;
