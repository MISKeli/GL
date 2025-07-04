import React, { useEffect, useState } from "react";
import { Box, MenuItem, Select, Skeleton } from "@mui/material";
import moment from "moment";
import notData from "../../assets/images/noRecordsFound.png";
import DateSearchCompoment from "../../components/DateSearchCompoment";
import { useGenerateAvailableBOAPageQuery } from "../../features/api/folderStructureApi";
import CashDisbursementBookPage from "./CashDisbursementBookPage";
import HorizontalCashDisbursementBookPage from "./HorizontalCashDisbursementBookPage";
import CashReceiptsBookPage from "./CashReceiptsBookPage";
import GeneralLedgerBookPage from "./GeneralLedgerBookPage";
import HorizontalPurchasesBookPage from "./HorizontalPurchasesBookPage";
import JournalBookPage from "./JournalBookPage";
import PurchasesBookPage from "./PurchasesBookPage";
import SalesJournalPage from "./SalesJournalPage";
import { info } from "../../schemas/info";
import VouchersPayableBook from "./VouchersPayableBook";

const BoaPage = () => {
  const [value, setValue] = useState("");
  const [isHorizontalView, setIsHorizontalView] = useState(true);
  const [reportData, setReportData] = useState({
    FromMonth: moment().startOf("month").format("MM-DD-YYYY").toString(),
    ToMonth: moment().endOf("month").format("MM-DD-YYYY").toString(),
  });

  const { data: boaName, isFetching } = useGenerateAvailableBOAPageQuery({
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

  // Helper function to find the book type code based on name
  const getBookTypeCode = (bookName) => {
    for (const [code, names] of Object.entries(info.boa)) {
      if (names.includes(bookName)) {
        return { code, name: bookName };
      }
    }
    return { code: null, name: null };
  };

  // Get the book type code for the current value
  const { code: bookTypeCode, name: bookTypeName } = getBookTypeCode(value);

  // Render the appropriate component based on the book code
  const renderBookComponent = () => {
    switch (bookTypeCode) {
      case "pb":
        if (bookTypeName === "Purchases Requisition Book") {
          return isHorizontalView ? (
            <PurchasesBookPage reportData={reportData} />
          ) : (
            <HorizontalPurchasesBookPage reportData={reportData} />
          );
        } else if (bookTypeName === "Vouchers Payable Book") {
          return <VouchersPayableBook reportData={reportData} />;
        }
        return null;
      case "cdb":
        return isHorizontalView ? (
          <CashDisbursementBookPage reportData={reportData} />
        ) : (
          <HorizontalCashDisbursementBookPage reportData={reportData} />
        );
      case "sb":
        return <SalesJournalPage reportData={reportData} />;
      case "jb":
        return <JournalBookPage reportData={reportData} />;
      case "glb": // Assuming this exists in the schema from the other component
        return <GeneralLedgerBookPage reportData={reportData} />;
      case "crj":
        return <CashReceiptsBookPage reportData={reportData} />;
      default:
        return null;
    }
  };

  return (
    <Box className="view">
      <Box className="view__container">
        {isFetching ? (
          <Skeleton
            variant="rounded"
            animation="wave"
            width={250}
            height={"auto"}
          />
        ) : (
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
        )}

        <DateSearchCompoment
          onViewChange={handleViewChange}
          setReportData={setReportData}
          hasViewChange={true}
        />
      </Box>

      <Box className="view__table" sx={{ marginTop: "5px" }}>
        {isFetching ? (
          <Skeleton
            variant="rounded"
            animation="wave"
            width="100%"
            height={750}
          />
        ) : value === "" ? (
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
          renderBookComponent()
        )}
      </Box>
    </Box>
  );
};

export default BoaPage;
