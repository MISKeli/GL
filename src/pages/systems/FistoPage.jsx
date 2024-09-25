import React, { useRef, useState } from "react";
import "../../styles/SystemsPage.scss";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Menu,
  Paper,
  styled,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { info } from "../../schemas/info";
import * as XLSX from "xlsx";
import {
  FilterListRounded,
  SearchRounded,
  SystemUpdateAltRounded,
} from "@mui/icons-material";

import CustomImport from "../../components/custom/CustomImport";
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

function FistoPage() {
  const [reportData, setReportData] = useState([]); // State to hold fetched data
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state for CustomImport
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null); // Create a ref for InputBase

  const headerColumn = info.report_import_table_columns;

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  // Function to handle data fetched from the Date component
  const handleFetchData = (data) => {
    setReportData(data);
  };
  // Function to handle data loaded from CustomImport
  const handleDataLoaded = (data) => {
    setReportData(data);
  };

  // Function to open/close the dialog
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  // Opening Menu
  const handlePopOverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };

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
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <Button
              startIcon={<SystemUpdateAltRounded />}
              variant="contained"
              onClick={handleDialogOpen} // Trigger dialog open here
            >
              {info.report_import_button}
            </Button>
          </Box>
          <Box className="systems__header__container2">
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
        </Box>
        <CustomImport
          open={isDialogOpen}
          onClose={handleDialogClose}
          onDataLoaded={handleDataLoaded}
        />
        <Box className="systems__content">
          <Box className="systems__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {headerColumn.map((columnTable) => (
                      <TableCell key={columnTable.id}>
                        {columnTable.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePopOverClose}
        >
          <Box>
            
          </Box>
          <Date onFetchData={handleFetchData} />
        </Menu>
        <Box className="systems__footer"></Box>
      </Box>
    </>
  );
}

export default FistoPage;
