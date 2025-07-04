import React, { useState } from "react";
import { useGetSystemClosedDateQuery } from "../../features/api/closedDateApi";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
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
import { info } from "../../schemas/info";
import { Edit, IosShareRounded } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";
import ClosedDateDialog from "./closedDateDialog";
import "../../styles/ClosedDate/ClosedDatePage.scss";
const ClosedDatePage = () => {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState({
    page: 0,
    PageSize: 10,
    PageNumber: 1,
  });
  const pokedData = useSelector((state) => state.auth.pokedData);
//   console.log("🚀 ~ ClosedDatePage ~ pokedData:", pokedData);
  const dispatch = useDispatch();

  const openPopUp = () => {
    setOpen(true);
  };

  const closePopUp = () => {
    setOpen(false);
    dispatch(setPokedData(null));
  };

  const tableColumn = info.closedDate.header;
  const {
    data: closedData,
    isLoading,
    isFetching,
  } = useGetSystemClosedDateQuery({
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    UsePagination: true,
  });

  const hasData = closedData?.value?.pagedResult?.length > 0;

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setParams((currentValue) => ({
      ...currentValue,
      page: newPage, // Update the page index
      PageNumber: newPage + 1, // Update the page number (1-based)
    }));
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newPageSize = parseInt(event.target.value, 10); // Get the new page size
    setParams((currentValue) => ({
      ...currentValue,
      PageSize: newPageSize, // Update the page size
      page: 0, // Reset to the first page
      PageNumber: 1, // Reset to page number 1
    }));
  };

  const getOrdinalSuffix = (num) => {
    if (num >= 11 && num <= 13) return "th"; // Special case for 11, 12, 13
    const lastDigit = num % 10;
    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return (
    <>
      <Box className="closed">
        <ClosedDateDialog
          open={open}
          closeHandler={closePopUp}
          data={closedData}
        />
        <Box className="closed__header">
          <Typography variant="h5" className="closed__header--title">
            {info.closedDate.title}
          </Typography>
        </Box>
        <Box className="closed__content">
          <Box className="closed__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {tableColumn.map((header) => (
                      <TableCell key={header.id}>{header.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading || isFetching
                    ? Array.from({ length: 1 }).map((_, index) => (
                        <TableRow key={index}>
                          {tableColumn.map((column) => (
                            <TableCell key={column.id}>
                              <Skeleton variant="text" animation="wave" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : closedData?.value.pagedResult.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Typography component="span" fontWeight="bold">
                              {row.closedDate}
                              {getOrdinalSuffix(row.closedDate)}
                            </Typography>{" "}
                            {""}
                            day of the month.
                          </TableCell>

                          <TableCell>
                            <IconButton
                              onClick={() => {
                                openPopUp(pokedData);
                              }}
                            >
                              <Edit color="primary" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Box className="closed__footer">
          <Box>
            <Button
              variant="contained"
              color="primary"
              // onClick={onExport}
              disabled={hasData || isLoading || isFetching}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <IosShareRounded />
              }
            >
              {isLoading ? "Exporting..." : "Export"}
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={closedData?.value?.totalCount || 0}
            page={params.page}
            rowsPerPage={params.PageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: "All", value: closedData?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default ClosedDatePage;
