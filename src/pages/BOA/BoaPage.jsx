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
import JournalBookPage from "./JournalBookPage";
import GeneralLedgerBookPage from "./GeneralLedgerBookPage";
import CashReceiptsBookPage from "./CashReceiptsBookPage";
const BoaPage = () => {
  const [value, setValue] = useState("option6");
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
            sx={{
              marginLeft: "10px",
            }}
          >
            <MenuItem value="option1">Cash Disbursement Book</MenuItem>
            <MenuItem value="option2">Purchases Book</MenuItem>
            <MenuItem value="option3">Sales Journal Book</MenuItem>
            <MenuItem value="option4">Journal Book</MenuItem>
            <MenuItem value="option5">General Ledger Book</MenuItem>
            <MenuItem value="option6">Cash Receipt Book</MenuItem>
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

          {value === "option3" &&
            (isHorizontalView ? (
              <SalesJournalPage reportData={reportData} />
            ) : (
              <SalesJournalPage reportData={reportData} />
            ))}

          {value === "option4" &&
            (isHorizontalView ? (
              <JournalBookPage reportData={reportData} />
            ) : (
              <JournalBookPage reportData={reportData} />
            ))}

          {value === "option5" &&
            (isHorizontalView ? (
              <GeneralLedgerBookPage reportData={reportData} />
            ) : (
              <GeneralLedgerBookPage reportData={reportData} />
            ))}

          {value === "option6" &&
            (isHorizontalView ? (
              <CashReceiptsBookPage reportData={reportData} />
            ) : (
              <CashReceiptsBookPage reportData={reportData} />
            ))}
        </Box>
      </Box>
    </>
  );
};

export default BoaPage;
