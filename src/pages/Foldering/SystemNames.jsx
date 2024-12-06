import { Box } from "@mui/material";
import React, { useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import FolderCDB from "../BOA/folderCDB";

import FolderCDBHorizontal from "../BOA/FolderCDBHorizontal";

const SystemNames = () => {
  const param = useParams();

  const { year, month, boaName } = param;
  const { isHorizontalView } = useOutletContext();
  console.log("Year:", year); // Logs the year from the URL
  console.log("Month:", month); // Logs the month from the URL
  console.log("BoaName:", boaName); // Logs the BoaName from the URL

  return (
    <Box flex={1} display={"flex"}>
      {boaName === "Cash Disbursement Book" &&
        (isHorizontalView ? <FolderCDBHorizontal /> : <FolderCDB />)}
    </Box>
  );
};

export default SystemNames;
