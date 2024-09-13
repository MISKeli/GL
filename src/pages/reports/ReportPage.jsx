// ReportPage.js
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
  TableBody, // Add this import
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { info } from "../../schemas/info";
import {
  FilterListRounded,
  OutboxRounded,
  SearchRounded,
} from "@mui/icons-material";
import { Controller } from "react-hook-form";
import Date from "./Date";
import dayjs from "dayjs";

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

const ReportPage = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [reportData, setReportData] = useState([]); // State to hold fetched data
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setopen] = useState(false);

  const GLColumn = [
    { id: "accountTitle", name: "ACCOUNT" },
    { id: "accountTitleCode", name: "CODE" },
    { id: "amount", name: "AMOUNT" },
    { id: "category", name: "CATEGORY" },
    { id: "companyCode", name: "CODE" },
    { id: "companyName", name: "COMPANY" },
    { id: "dateAdded", name: "DATE ADDED" },
    { id: "departmentCode", name: "CODE" },
    { id: "departmentName", name: "DEPARTMENT" },
    { id: "details", name: "DETAILS" },
    { id: "employeeName", name: "NAME" },
    { id: "encoded", name: "ENCODED" },
    { id: "id", name: "ID" },
    { id: "itemCode", name: "CODE" },
    { id: "itemDescription", name: "DESCRIPTION" },
    { id: "locationCode", name: "LOCATION" },
    { id: "mirId", name: "MIR ID" },
    { id: "quantity", name: "QUANTITY" },
    { id: "reason", name: "REASON" },
    { id: "reference", name: "REFERENCE" },
    { id: "source", name: "SOURCE" },
    { id: "status", name: "STATUS" },
    { id: "transactDate", name: "TRANSACT DATE" },
    { id: "transactionType", name: "TRANSACTION TYPE" },
    { id: "unitPrice", name: "UNIT PRICE" },
    { id: "uom", name: "UOM" },
    { id: "warehouseId", name: "WAREHOUSE ID" },
  ];

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
    <>
      <Box className="masterlist">
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.report_title}
            </Typography>
            <Button startIcon={<OutboxRounded />} variant="contained">
              {info.report_export_button}
            </Button>
          </Box>
        </Box>
        <Box className="masterlist__header__con2">
          <Box className="masterlist__header__con2--date-picker">
            <IconButton>
              <FilterListRounded
                onClick={(event) => {
                  handlePopOverOpen(event);
                }}
              />
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
        <Box className="masterlist__content">
          <Box className="masterlist__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {GLColumn.map((genledTable) => (
                      <TableCell key={genledTable.id}>
                        {genledTable.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData?.value?.length > 0 ? (
                    reportData?.value?.map((row, index) => (
                      <TableRow key={index}>
                        {GLColumn.map((col) => (
                          <TableCell key={col.id}>{row[col.id]}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={GLColumn.length} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
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
            <Typography>Transaction Date:</Typography>
          </Box>
          <Date onFetchData={handleFetchData} />
        </Menu>
        <Box className="masterlist__footer"></Box>
      </Box>
    </>
  );
};

export default ReportPage;
