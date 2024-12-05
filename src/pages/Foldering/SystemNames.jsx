import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { createTableHeader } from "../../utils/createHeader";
import { DataGrid } from "@mui/x-data-grid";
import moment from "moment";
import HorizontalCashDisbursementBookPage from "../BOA/HorizontalCashDisbursementBookPage";
import CashDisbursementBookPage from "../BOA/CashDisbursementBookPage";
import FolderCDB from "../BOA/folderCDB";

import DateSearchCompoment from "../../components/DateSearchCompoment";
import FolderCDBHorizontal from "../BOA/FolderCDBHorizontal";
import { info } from "../../schemas/info";

const SystemNames = () => {
  const [isHorizontalView, setIsHorizontalView] = useState(true);

  const param = useParams();

  const { year, month, boaName } = param;
  console.log("Year:", year); // Logs the year from the URL
  console.log("Month:", month); // Logs the month from the URL
  console.log("BoaName:", boaName); // Logs the BoaName from the URL

  return (
    <Box height="100%" width="100%" display={"flex"} flexDirection={"column"}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h5" className="folder__header--title">
          {info.systems_title}
        </Typography>
        <DateSearchCompoment
          hasDate={false}
          hasViewChange={true}
          onViewChange={() => {
            setIsHorizontalView((PREV) => !PREV);
          }}
        />
      </Box>
      <Box className="boaTable" flex={1}>
        {boaName === "Cash Disbursement Book" &&
          (isHorizontalView ? <FolderCDBHorizontal /> : <FolderCDB />)}
      </Box>
    </Box>
  );
};

export default SystemNames;
