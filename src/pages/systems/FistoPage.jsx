import React, { useRef, useState } from "react";
import "../../styles/SystemsPage.scss";
import { Box, Button, Typography } from "@mui/material";
import { info } from "../../schemas/info";
import * as XLSX from "xlsx";
import { SystemUpdateAltRounded } from "@mui/icons-material";
import useDropImport from "../../components/hooks/useDropImport";
import CustomImport from "../../components/custom/CustomImport";

function FistoPage() {
  const [reportData, setReportData] = useState([]); // State to hold fetched data
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state for CustomImport

  // Function to handle data loaded from CustomImport
  const handleDataLoaded = (data) => {
    setReportData(data);
  };

  // Function to open/close the dialog
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  return (
    <>
      <Box className="systems">
        <Box className="systems__header">
          <Box className="systems__header__container1">
            <Typography
              variant="h5"
              className="systems__header__container1--title"
            >
              {info.report_fisto_title}
            </Typography>
            <Button
              startIcon={<SystemUpdateAltRounded />}
              variant="contained"
              onClick={handleDialogOpen} // Trigger dialog open here
            >
              {info.report_import_button}
            </Button>
          </Box>
        </Box>
        <Box className="systems__content">
          <CustomImport
            open={isDialogOpen}
            onClose={handleDialogClose}
            onDataLoaded={handleDataLoaded}
          />
        </Box>
        <Box className="systems__footer"></Box>
      </Box>
    </>
  );
}

export default FistoPage;
