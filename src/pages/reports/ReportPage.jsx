import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  styled,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import React, { useState } from "react";
import { info } from "../../schemas/info";
import { OutboxRounded, SearchRounded } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller } from "react-hook-form";
import Date from "./Date";

const AnimatedBox = styled(Box)(({ theme, expanded }) => ({
  display: "flex",
  alignItems: "center",
  width: expanded ? "300px" : "50px", // Change width based on state
  transition: "width 0.3s ease-in-out", // Animate width change
  border: expanded ? `1px solid ${theme.palette.primary.main}` : "none", // Show border when expanded
  borderRadius: "10px", // Optional: round the corners
  padding: "2px 4px",
  position: "relative",
  margin: " 5px 5px",
}));
const ReportPage = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  return (
    <>
     
      <Box className="masterlist">
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.report_title}
            </Typography>
            <Button
              startIcon={<OutboxRounded />}
              variant="contained"
              // onClick={() => {
              //   openPopUp();
              //   dispatch(setPokedData(null));
              // }}
            >
              {info.report_export_button}
            </Button>
          </Box>
        </Box>
        <Box className="masterlist__header__con2">
          <Box className="masterlist__header__con2--date-picker">
          <Date />
          </Box>
          <AnimatedBox
            className="masterlist__header__con2--search"
            expanded={expanded}
            component="form"
            onClick={() => setExpanded(true)}
          >
            <InputBase
              sx={{ ml: 0.5, flex: 1 }}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => search === "" && setExpanded(false)} // Collapse when losing focus if search is empty
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton
              color="primary"
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
            >
              <SearchRounded />
            </IconButton>
          </AnimatedBox>
        </Box>
        <Box className="masterlist__content"></Box>
        <Box className="masterlist__footer"></Box>
      </Box>
    </>

    //   <LocalizationProvider >
    //   <DatePicker />
    // </LocalizationProvider>
  );
};

export default ReportPage;
