import React, { useState } from "react";
//import ElixirPharmacyPage from "../../pages/systems/ElixirPharmacyPage";
import { Box, IconButton, MenuItem, Select, Tooltip } from "@mui/material";

import CashDisbursementBookPage from "./CashDisbursementBookPage";

import HorizontalCashDisbursementBookPage from "./HorizontalCashDisbursementBookPage";
import {
  AlignHorizontalLeftRounded,
  AlignVerticalTopRounded,
} from "@mui/icons-material";
import PurchasesBookPage from "./PurchasesBookPage";
import SalesJournalPage from "./SalesJournalPage";
import HorizontalPurchasesBookPage from "./HorizontalPurchasesBookPage";
const BoaPage = () => {
  const [value, setValue] = useState("option1");
  const [isHorizontalView, setIsHorizontalView] = useState(true);

  const toggleViewFormat = () => {
    setIsHorizontalView((prevFormat) => !prevFormat);
  };

  const tooltipTitle = isHorizontalView ? "Horizontal View" : "Vertical View";
  return (
    <>
      <Box className="view" sx={{ overflow: "auto", height: "100%" }}>
        <Tooltip title={tooltipTitle} placement="right">
          <IconButton
            onClick={toggleViewFormat}
            sx={{
              position: "fixed",
              marginLeft: "265px", // 1640px
              marginTop: "10px",
            }}
          >
            {isHorizontalView ? (
              <AlignHorizontalLeftRounded color="primary" />
            ) : (
              <AlignVerticalTopRounded color="primary" />
            )}
          </IconButton>
        </Tooltip>

        <Select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{
            minWidth: "230px",
            width: "250px",
            borderRadius: "10px",
            backgroundColor: "background.header",
            position: "absolute",

            fontWeight: "bold",
            marginLeft: "10px",
          }}
        >
          <MenuItem value="option1">Cash Disbursement Book</MenuItem>
          <MenuItem value="option2">Purchases Book</MenuItem>
          <MenuItem value="option3">Sales Journal Book</MenuItem>
        </Select>

        {/* Conditionally render the view based on isHorizontalView */}
        {value === "option1" &&
          (isHorizontalView ? (
            <HorizontalCashDisbursementBookPage />
          ) : (
            <CashDisbursementBookPage />
          ))}

        {value === "option2" &&
          (isHorizontalView ? (
            <HorizontalPurchasesBookPage />
          ) : (
            <PurchasesBookPage />
          ))}

        {value === "option3" &&
          (isHorizontalView ? (
            <HorizontalCashDisbursementBookPage />
          ) : (
            <SalesJournalPage />
          ))}
      </Box>
    </>
  );
};

export default BoaPage;
