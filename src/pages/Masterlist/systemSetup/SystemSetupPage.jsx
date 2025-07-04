import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
  IosShareRounded,
  LibraryAddRounded,
  MoreVertOutlined,
  RestoreFromTrashOutlined,
  SearchRounded,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";
import useDebounce from "../../components/useDebounce";
import {
  useGetAllSystemsAsyncQuery,
  useLazyGetAllSystemsAsyncQuery,
  useUpdateSystemStatusMutation,
} from "../../features/api/systemApi";
import { toast } from "sonner";
import ConfirmedDialog from "../../components/ConfirmedDialog";
import useExportData from "../../components/hooks/useExportData";

const SystemSetupPage = () => {
  const { commonExport } = useExportData();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  // const [page, setPage] = useState(0);
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



  const headerColumn = info.setup.header;

  const {
    data: systemData,
    isLoading: isSystemLoading,
    isFetching: isSystemFetching,
  } = useGetAllSystemsAsyncQuery({
    Search: debounceValue,
    Status: params.status === "active" ? true : false,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    UsePagination: false,
  });
  

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
        
        toast.error(error?.message);
      });
  };
  const Headers = info.setup.export;
  const hasData = systemData?.value?.result?.length > 0;
  const [fetchExportData] = useLazyGetAllSystemsAsyncQuery();

  const onExport = async () => {
    try {
      const exportData = await fetchExportData({
        UsePagination: false,
      }).unwrap();
      await commonExport(Headers, exportData?.value?.result, info.setup.title);
    } catch (err) {
      toast.error(err.message);
   
    }
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
              {info.setup.title}
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
              {info.setup.dialogs.addTitle}
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
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
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
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          {headerColumn.map((column) => (
                            <TableCell key={column.id}>
                              <Skeleton variant="text" animation="wave" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : systemData?.value?.result.map((row) => (
                        <TableRow
                          key={row.id}
                          className={activeRow === row.id ? "active" : ""}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              {row.iconUrl && (
                                <img
                                  src={row.iconUrl}
                                  alt="icon"
                                  width={30}
                                  height={30}
                                  style={{ marginRight: 8 }}
                                />
                              )}
                              {row.systemName}
                            </Box>
                          </TableCell>
                          <TableCell>{row.endpoint}</TableCell>
                          {/* <TableCell>
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
              </TableCell> */}
                          <TableCell>
                            <Chip
                              variant="filled"
                              label={
                                params.status === "active"
                                  ? "active"
                                  : "inactive"
                              }
                              color={
                                params.status === "active" ? "success" : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(event) => {
                                handlePopOverOpen(event, row);
                                dispatch(setPokedData(row));
                              }}
                            >
                              <MoreVertOutlined />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
              {systemData?.value?.result &&
              systemData.value?.result.length === 0 ? (
                <Box className="setup__content__table--norecords">
                  <img src={noRecordsFound} alt="No Records Found" />
                </Box>
              ) : null}
            </TableContainer>
          </Box>
        </Box>
        <Box className="setup__footer">
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={onExport}
              disabled={!hasData || isSystemLoading || isSystemFetching}
              startIcon={
                isSystemLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isSystemLoading ? "Exporting..." : "Export"}
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={systemData?.value?.totalCount || 0}
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
