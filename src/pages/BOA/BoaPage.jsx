import React, { useEffect, useState } from "react";
//import ElixirPharmacyPage from "../../pages/systems/ElixirPharmacyPage";
import { Box, MenuItem, Select } from "@mui/material";
import "../../styles/BoaPage.scss";
import CashDisbursementBookPage from "./CashDisbursementBookPage";

import HorizontalCashDisbursementBookPage from "./HorizontalCashDisbursementBookPage";

import moment from "moment";
import notData from "../../assets/images/noRecordsFound.png";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import { useGenerateAvailableBOAPageQuery } from "../../features/api/folderStructureApi";
import CashReceiptsBookPage from "./CashReceiptsBookPage";
import GeneralLedgerBookPage from "./GeneralLedgerBookPage";
import HorizontalPurchasesBookPage from "./HorizontalPurchasesBookPage";
import JournalBookPage from "./JournalBookPage";
import PurchasesBookPage from "./PurchasesBookPage";
import SalesJournalPage from "./SalesJournalPage";

const BoaPage = () => {
  const [value, setValue] = useState("");
  const [isHorizontalView, setIsHorizontalView] = useState(true);
  const [reportData, setReportData] = useState({
    FromMonth: moment().startOf("month").format("MM-DD-YYYY").toString(),
    ToMonth: moment().endOf("month").format("MM-DD-YYYY").toString(),
  });
  const { data: boaName } = useGenerateAvailableBOAPageQuery({
    UsePagination: false,
  });

  useEffect(() => {
    if (boaName?.value?.boa?.length) {
      setValue(boaName.value.boa[0]); // Set to the first available system
    }
  }, [boaName]);

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
            {boaName?.value?.boa?.length ? (
              boaName.value.boa.map((item, index) => (
                <MenuItem key={index} value={item}>
                  {item}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No BOA Data Available.
              </MenuItem>
            )}
          </Select>

          <DateSearchCompoment
            onViewChange={handleViewChange}
            setReportData={setReportData}
            hasViewChange="true"
          />
        </Box>

        <Box className="view__table">
          {value === "" ? (
            <img
              style={{
                height: "auto",
                width: "100vh",
                alignSelf: "center",
              }}
              src={notData}
              alt="No Records Found"
            />
          ) : (
            // Use a mapping to simplify the component rendering
            {
              "Cash Disbursement Book": isHorizontalView ? (
                <CashDisbursementBookPage reportData={reportData} />
              ) : (
                <HorizontalCashDisbursementBookPage reportData={reportData} />
              ),
              "Purchases Book": isHorizontalView ? (
                <PurchasesBookPage reportData={reportData} />
              ) : (
                <HorizontalPurchasesBookPage reportData={reportData} />
              ),
              "Sales Journal": <SalesJournalPage reportData={reportData} />,
              "Journal Book": <JournalBookPage reportData={reportData} />,
              option5: <GeneralLedgerBookPage reportData={reportData} />,
              option6: <CashReceiptsBookPage reportData={reportData} />,
            }[value]
          )}
        </Box>
      </Box>
    </>
  );
};

export default BoaPage;
