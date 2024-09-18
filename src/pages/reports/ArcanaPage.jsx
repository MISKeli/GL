import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Menu,
  styled,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { info } from "../../schemas/info";
import {
  FilterListRounded,
  OutboxRounded,
  SearchRounded,
} from "@mui/icons-material";
import Date from "./Date";

const AnimatedBox = styled(Box)(({ theme, expanded }) => ({
  display: "flex",
  alignItems: "center",
  width: expanded ? "300px" : "50px",
  transition: "width 0.3s ease-in-out",
  border: expanded ? `1px solid ${theme.palette.primary.main}` : "none",
  borderRadius: "10px",
  padding: "2px 4px",
  position: "relative",
  margin: " 5px 5px",
}));

const ArcanaPage = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [reportData, setReportData] = useState([]); // State to hold fetched data
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setopen] = useState(false);
  const inputRef = useRef(null); // Create a ref for InputBase

  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  // Function to handle data fetched from the Date component
  const handleFetchData = (data) => {
    setReportData(data);
  };

  // Opening Menu
  const handlePopOverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box className="masterlist">
      <Box className="masterlist__header">
        <Box className="masterlist__header__con1">
          <Typography variant="h5" className="masterlist__header--title">
            {info.report_arcana_title}
          </Typography>
          <Button startIcon={<OutboxRounded />} variant="contained">
            {info.report_export_button}
          </Button>
        </Box>
      </Box>
      <Box className="masterlist__header__con2">
        <Box className="masterlist__header__con2--date-picker">
          <IconButton
            onClick={(event) => {
              handlePopOverOpen(event);
            }}
          >
            <FilterListRounded color="primary" />
          </IconButton>
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
            onBlur={() => search === "" && setExpanded(false)}
            inputRef={inputRef} // Assign the ref to InputBase
          />
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            color="primary"
            type="button"
            sx={{ p: "10px" }}
            aria-label="search"
            onClick={handleSearchClick}
          >
            <SearchRounded />
          </IconButton>
        </AnimatedBox>
      </Box>
      <Box className="masterlist__content"></Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopOverClose}
      >
        <Box>
          <Typography>Transaction Date:</Typography>
        </Box>
        <Date onFetchData={handleFetchData} />
      </Menu>
      <Box className="masterlist__footer"></Box>
    </Box>
  );
};

export default ArcanaPage;
