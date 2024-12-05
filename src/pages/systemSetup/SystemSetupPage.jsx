import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import React, { useRef, useState } from "react";
import "../../styles/SystemSetupPage.scss";
import DialogSetup from "./DialogSetup";
import { info } from "../../schemas/info";
import noRecordsFound from "../../assets/images/noRecordsFound.png";
import {
  ArchiveOutlined,
  ArchiveRounded,
  ClearRounded,
  EditRounded,
  LibraryAddRounded,
  MoreVertOutlined,
  PreviewRounded,
  RestoreFromTrashOutlined,
  SearchRounded,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";
import useDebounce from "../../components/useDebounce";
import {
  useGetAllSystemsAsyncQuery,
  useUpdateSystemStatusMutation,
} from "../../features/api/systemApi";
import { toast } from "sonner";
import ConfirmedDialog from "../../components/ConfirmedDialog";

const SystemSetupPage = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  // const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const debounceValue = useDebounce(search);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);

  const [params, setParams] = useState({
    Search: debounceValue,
    page: 0,
    PageSize: 10,
    PageNumber: 1,
    status: "active",
  });
  const inputRef = useRef(null); // Create a ref for InputBase
  const dispatch = useDispatch();
  const pokedData = useSelector((state) => state.auth.pokedData);

  //console.log("poked", pokedData);

  const headerColumn = info.setup_table_columns;

  const {
    data: systemData,
    isLoading: isSystemLoading,
    isFetching: isSystemFetching,
  } = useGetAllSystemsAsyncQuery({
    Search: debounceValue,
    Status: params.status === "active" ? true : false,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
  });
  //console.log("apple", systemData);

  const changeStatus = (data) =>
    setParams((currentValue) => ({
      ...currentValue,
      status: data,
    }));

  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  // // Pagination
  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };
  // const handleChangeRowsPerPage = (event) => {
  //   setPageSize(parseInt(event.target.value, 10));
  //   setPage(0); // Reset to the first page when rows per page changes
  // };

  // Status Toggle
  const handleToggleStatus = () => {
    changeStatus(params.status === "active" ? "inactive" : "active");
  };

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

  const openPopUp = () => {
    setOpen(true);
  };

  const closePopUp = () => {
    setOpen(false);
    setAnchorEl(null);
    setIsUpdate(false);
    dispatch(setPokedData(null));
    //clearPokedData();
  };

  // Opening Menu
  const handlePopOverOpen = (event, headerColumn) => {
    setAnchorEl(event.currentTarget);
    dispatch(setPokedData(headerColumn));
    setIsUpdate(true);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
    setIsUpdate(false);
  };

  //Update
  const openDialogForUpdate = () => {
    setOpen(true);
    setIsUpdate(true);
  };

  //Archived
  const [updateSystemStatus] = useUpdateSystemStatusMutation();
  const handleStatus = () => {
    updateSystemStatus({ id: pokedData.id })
      .unwrap()
      .then((res) => {
        console.log(res);
        if (pokedData.isActive === true) {
          toast.success("System Archieved Successfully ");
        } else {
          toast.success("System Restored Successfully ");
        }
        setOpenArchiveDialog(false);
      })
      .catch((error) => {
        //console.log({ error });
        toast.error(error?.message);
      });
  };

  return (
    <>
      <Box className="setup">
        <DialogSetup
          open={open}
          closeHandler={closePopUp}
          isUpdate={isUpdate}
        />

        <Box className="setup__header">
          <Box className="setup__header__con1">
            <Typography variant="h5" className="setup__header__con1--title">
              {info.setup_title}
            </Typography>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <Button
              startIcon={<LibraryAddRounded />}
              variant="contained"
              onClick={() => {
                openPopUp();
                dispatch(setPokedData(null));
              }}
            >
              {info.setup_add_button}
            </Button>
          </Box>
          <Box className="setup__header__con2">
            <Box className="setup__header__con2--archieved">
              <Tooltip title="Archived" placement="left" arrow>
                <IconButton onClick={handleToggleStatus}>
                  {params.status === "inactive" ? (
                    <ArchiveRounded color="primary" />
                  ) : (
                    <ArchiveOutlined color="primary" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              className={`setup__header__con2--search ${
                expanded ? "expanded" : ""
              }`}
              component="form"
              onClick={() => setExpanded(true)}
            >
              <InputBase
                sx={{ ml: 0.5, flex: 1 }}
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                inputRef={inputRef}
                onBlur={() => search === "" && setExpanded(false)}
              />
              {search && (
                <IconButton
                  color="primary"
                  type="button"
                  aria-label="clear"
                  onClick={() => {
                    setSearch("");
                    inputRef.current.focus();
                  }}
                >
                  <ClearRounded />
                </IconButton>
              )}
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
            </Box>
          </Box>
        </Box>
        <Box className="setup__content">
          <Box className="setup__content__table">
          <TableContainer component={Paper} sx={{ overflow: "auto", height: "100%" }}>
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        {headerColumn.map((column) => (
          <TableCell key={column.id}>{column.name}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {isSystemLoading || isSystemFetching
        ? Array.from({ length: pageSize }).map((_, index) => (
            <TableRow key={index}>
              {headerColumn.map((column) => (
                <TableCell key={column.id}>
                  <Skeleton variant="text" animation="wave" />
                </TableCell>
              ))}
            </TableRow>
          ))
        : systemData?.result.map((row) => (
            <TableRow
              key={row.id}
              className={activeRow === row.id ? "active" : ""}
            >
              <TableCell>{row.systemName}</TableCell>
              <TableCell>{row.endpoint}</TableCell>
              <TableCell>
                <Tooltip
                  TransitionComponent={Zoom}
                  arrow
                  title={row.token || "No token available"}
                  className="setup__content__table__tooltip"
                >
                  <IconButton>
                    <PreviewRounded />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip
                  variant="filled"
                  label={
                    params.status === "active" ? "active" : "inactive"
                  }
                  color={params.status === "active" ? "success" : "error"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={(event) => handlePopOverOpen(event, row)}
                >
                  <MoreVertOutlined />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
    </TableBody>
  </Table>
  {systemData?.result && systemData.result.length === 0 ? (
    <Box className="setup__content__table--norecords">
      <img src={noRecordsFound} alt="No Records Found" />
    </Box>
  ) : null}
</TableContainer>

          </Box>
        </Box>
        <Box className="setup__footer">
          <TablePagination
            component="div"
            count={systemData?.totalCount || 0}
            page={params.page}
            rowsPerPage={params.PageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              5,
              10,
              25,
              { label: "All", value: systemData?.totalCount || 0 },
            ]}
          />
        </Box>
      </Box>
      <Menu
        open={Boolean(anchorEl)}
        onClose={handlePopOverClose}
        anchorEl={anchorEl}
      >
        {pokedData?.isActive ? (
          <div>
            <MenuItem
              onClick={() => {
                handlePopOverClose();
                openDialogForUpdate(pokedData);
              }}
            >
              <ListItemIcon>
                <EditRounded fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handlePopOverClose();
                setOpenArchiveDialog(true);
              }}
            >
              <ListItemIcon>
                <ArchiveRounded fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Archive" />
            </MenuItem>
          </div>
        ) : (
          <MenuItem
            onClick={() => {
              setOpenArchiveDialog(true);
              handlePopOverClose();
            }}
          >
            <ListItemIcon>
              <RestoreFromTrashOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Restore" />
          </MenuItem>
        )}
      </Menu>

      <ConfirmedDialog
        open={openArchiveDialog}
        onClose={() => setOpenArchiveDialog(false)}
        onYes={handleStatus} // Call handleUserStatus on confirmation
        title={pokedData?.isActive ? "Archive User" : "Restore User"}
        description={`Are you sure you want to ${
          pokedData?.isActive ? "ARCHIVE" : "RESTORE"
        } ${pokedData?.systemName || "this user"}?`}
      />
    </>
  );
};

export default SystemSetupPage;
