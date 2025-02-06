/* eslint-disable react/prop-types */
import React from "react";
import { useDispatch } from "react-redux";
import { setPageNumber, setPageSize } from "../../../features/slice/authSlice";
import { info } from "../../../schemas/info";
import "../../../styles/BoaPage.scss";
import {
  Box,
  Button,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

const CashReceiptJournalFolder = ({
  data,
  page,
  pageSize,
  isLoading,
  isFetching,
}) => {
  const dispatch = useDispatch();
  const headerColumn = info.cash_receipts_book;
  //   const {  pageSize } = useSelector((state) => state.auth);

  const handleChangePage = (event, newPage) => {
    dispatch(setPageNumber(newPage));
  };

  const handleChangeRowsPerPage = (event) => {
    dispatch(setPageSize(parseInt(event.target.value, 10)));
    dispatch(setPage(0)); // Reset to first page
  };

  const formatNumber = (number) => {
    const isNegative = number < 0;
    const formattedNumber = Math.abs(number)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return {
      formattedNumber,
      color: isNegative ? "red" : "inherit", // Use "red" for negative numbers
    };
  };

  return (
    <>
      <Box className="boa">
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
                          <TableRow
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
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
              // startIcon={
              //   isBoaLoading ? (
              //     <CircularProgress size={20} />
              //   ) : (
              //     <IosShareRounded />
              //   )
              // }
            >
              Export
              {/* {isBoaLoading ? "Exporting..." : "Export"} */}
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={data?.value?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: "All", value: data?.value?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default CashReceiptJournalFolder;
