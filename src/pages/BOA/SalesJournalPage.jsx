import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";

import useDebounce from "../../components/useDebounce";
import moment from "moment";
import dayjs from "dayjs";
import { IosShareRounded  } from "@mui/icons-material";
import "../../styles/BoaPage.scss";
import { info } from "../../schemas/info";
import { useGenerateSaleJournalBookPerMonthPaginationQuery } from "../../features/api/boaApi";
const SalesJournalPage = ({ reportData }) => {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const inputRef = useRef(null);
  const debounceValue = useDebounce(search);
  const headerColumn = info.sales_journal;

  const {
    data: boaData,
    isLoading: isboaloading,
    isFetching: isboaFetching,
  } = useGenerateSaleJournalBookPerMonthPaginationQuery({
    System: reportData.System,
    Month: reportData.Month,
    Year: reportData.Year,
    search: debounceValue,
    PageNumber: page + 1,
    PageSize: pageSize,
  });

  console.log("boaData", boaData);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    setPageSize(selectedValue); // Directly set the selected value
    setPage(0); // Reset to first page
  };

  // // SEARCH
  // const handleSearchClick = () => {
  //   setExpanded(true); // Expand the box
  //   inputRef.current?.focus(); // Immediately focus the input field
  // };
  // const handleFetchData = (data) => {
  //   console.log("DATAAA", data);
  //   console.log(
  //     "Received MONTH:",
  //     data.Month,
  //     "year:",
  //     data.Year,
  //     "system",
  //     data.System
  //   ); // Debugging
  //   setReportData(data);
  // };
  return (
    <>
      <Box className="boa">
        <Box className="boa__header">
          
        </Box>
        <Box className="boa__content">
          <Box className="boa__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {headerColumn.map((columnTable) => (
                      <TableCell
                        key={columnTable.id}
                        sx={{
                          textAlign: columnTable.subItems ? "center" : "",
                        }}
                      >
                        {columnTable.name}
                        {columnTable.subItems && (
                          <TableRow style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}>
                            {columnTable.subItems.map((subItems) => (
                              <TableCell
                                key={subItems.id}
                                sx={{
                                  border: "none",
                                }}
                              >
                                {subItems.name}
                              </TableCell>
                            ))}
                          </TableRow>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isboaFetching || isboaloading ? (
                    Array.from({ length: pageSize }).map((_, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <TableCell key={col.id}>
                            <Skeleton
                              variant="text"
                              animation="wave"
                              height={100}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : boaData?.value?.salesJournal?.length > 0 ? (
                    boaData?.value?.salesJournal?.map((row, index) => (
                      <TableRow key={index}>
                        {headerColumn.map((col) => (
                          <React.Fragment key={col.id}>
                            {col.subItems ? (
                              // If the column has subItems (debit and credit), render them in nested cells
                              <TableCell align="center">
                                <TableRow
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  {col.subItems.map((subItem) => (
                                    <TableCell
                                      key={subItem.id}
                                      sx={{
                                        border: "none",
                                      }}
                                    >
                                      {subItem.id === "debit" && row.drCr === "Debit"
                                        ? row.lineAmount
                                        : subItem.id === "credit" && row.drCr === "Credit"
                                        ? row.lineAmount
                                        : "—"}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableCell>
                            ) : (
                              // For regular columns without subItems
                              <TableCell>
                                {row[col.id] ? row[col.id] : "—"}
                              </TableCell>
                            )}
                          </React.Fragment>
                        ))}
                      </TableRow>
                    ))
                    
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headerColumn.length} align="center">
                        <Typography variant="h6">
                          {info.system_no_data}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Box className="boa__footer">
        <Box>
            <Button
              variant="contained"
              color="primary"
             // onClick={onExport}
              disabled
              startIcon={
                isboaloading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isboaloading ? "Exporting..." : "Export"}
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={boaData?.value?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: "All", value: boaData?.value?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default SalesJournalPage;
