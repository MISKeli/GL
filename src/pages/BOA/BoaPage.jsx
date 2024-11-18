import React, { useState } from "react";
//import ElixirPharmacyPage from "../../pages/systems/ElixirPharmacyPage";
import { Box, IconButton, MenuItem, Select, Tooltip } from "@mui/material";
import "../../styles/BoaPage.scss";
import CashDisbursementBookPage from "./CashDisbursementBookPage";

import HorizontalCashDisbursementBookPage from "./HorizontalCashDisbursementBookPage";

import SalesJournalPage from "./SalesJournalPage";
import HorizontalPurchasesBookPage from "./HorizontalPurchasesBookPage";
import BoaFilterComponent from "../../components/BoaFilterComponent";
import moment from "moment";
import PurchasesBookPage from "./PurchasesBookPage";
const BoaPage = () => {
  const [value, setValue] = useState("option2");
  const [isHorizontalView, setIsHorizontalView] = useState(true);
  const [reportData, setReportData] = useState({
    Month: moment().format("MMM"),
    Year: moment().format("YYYY"),
  });

  const handleViewChange = (newViewFormat) => {
    setIsHorizontalView(newViewFormat);
  };
  return (
    <>
      <Box className="view">
        <Box className="view__container">
          <Select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            
          >
            <MenuItem value="option1">Cash Disbursement Book</MenuItem>
            <MenuItem value="option2">Purchases Book</MenuItem>
            {/* <MenuItem value="option3">Sales Journal Book</MenuItem> */}
          </Select>

          <BoaFilterComponent
            onViewChange={handleViewChange}
            setReportData={setReportData}
          />
        </Box>

        <Box className="view__table">
          {/* Conditionally render the view based on isHorizontalView */}
          {value === "option1" &&
            (isHorizontalView ? (
              <HorizontalCashDisbursementBookPage reportData={reportData} />
            ) : (
              <CashDisbursementBookPage reportData={reportData} />
            ))}

          {value === "option2" &&
            (isHorizontalView ? (
              <HorizontalPurchasesBookPage reportData={reportData} />
            ) : (
              <PurchasesBookPage reportData={reportData} />
            ))}

          {/* {value === "option3" &&
          (isHorizontalView ? (
            <HorizontalCashDisbursementBookPage />
          ) : (
            <SalesJournalPage />
          ))} */}
        </Box>
      </Box>
    </>
  );
};

export default BoaPage;
