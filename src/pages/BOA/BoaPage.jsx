import React, { useState } from "react";
//import ElixirPharmacyPage from "../../pages/systems/ElixirPharmacyPage";
import { Box, IconButton, MenuItem, Select, Tooltip } from "@mui/material";
import "../../styles/BoaPage.scss";
import CashDisbursementBookPage from "./CashDisbursementBookPage";

import HorizontalCashDisbursementBookPage from "./HorizontalCashDisbursementBookPage";

import SalesJournalPage from "./SalesJournalPage";
import HorizontalPurchasesBookPage from "./HorizontalPurchasesBookPage";
import moment from "moment";
import PurchasesBookPage from "./PurchasesBookPage";
import JournalBookPage from "./JournalBookPage";
import GeneralLedgerBookPage from "./GeneralLedgerBookPage";
import CashReceiptsBookPage from "./CashReceiptsBookPage";
import DateSearchCompoment from "../../components/DateSearchCompoment";
const BoaPage = () => {
  const [value, setValue] = useState("option2");
  const [isHorizontalView, setIsHorizontalView] = useState(true);
  const [reportData, setReportData] = useState({
    FromMonth: moment().startOf("month").format("MM-DD-YYYY").toString(),
    ToMonth: moment().endOf("month").format("MM-DD-YYYY").toString(),
  });

  console.log("bago", reportData);

  const handleViewChange = (newViewFormat) => {
    setIsHorizontalView(newViewFormat);
  };
  return (
    <>
      <Box className="view">
        <Box className="view__container">
          <Select
            variant="standard"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="view__container--select"
          >
            <MenuItem value="option1">Cash Disbursement Book</MenuItem>
            <MenuItem value="option2">Purchases Book</MenuItem>
            <MenuItem value="option3">Sales Journal Book</MenuItem>
            <MenuItem value="option4">Journal Book</MenuItem>
            <MenuItem value="option5">General Ledger Book</MenuItem>
            <MenuItem value="option6">Cash Receipt Book</MenuItem>
          </Select>

          <DateSearchCompoment
            onViewChange={handleViewChange}
            setReportData={setReportData}
            hasViewChange="true"
          />
        </Box>

        <Box className="view__table">
          {/* Conditionally render the view based on isHorizontalView */}
          {value === "option1" &&
            (!isHorizontalView ? (
              <HorizontalCashDisbursementBookPage reportData={reportData} />
            ) : (
              <CashDisbursementBookPage reportData={reportData} />
            ))}

          {value === "option2" &&
            (!isHorizontalView ? (
              <HorizontalPurchasesBookPage reportData={reportData} />
            ) : (
              <PurchasesBookPage reportData={reportData} />
            ))}

          {value === "option3" &&
            (!isHorizontalView ? (
              <SalesJournalPage reportData={reportData} />
            ) : (
              <SalesJournalPage reportData={reportData} />
            ))}

          {value === "option4" &&
            (!isHorizontalView ? (
              <JournalBookPage reportData={reportData} />
            ) : (
              <JournalBookPage reportData={reportData} />
            ))}

          {value === "option5" &&
            (!isHorizontalView ? (
              <GeneralLedgerBookPage reportData={reportData} />
            ) : (
              <GeneralLedgerBookPage reportData={reportData} />
            ))}

          {value === "option6" &&
            (!isHorizontalView ? (
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
