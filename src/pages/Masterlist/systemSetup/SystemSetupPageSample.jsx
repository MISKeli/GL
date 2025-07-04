import {
  Box,
  Button,
  Card,
  CardContent,
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
import Collapse from "@mui/material/Collapse";
import React, { useRef, useState } from "react";
import "../../../styles/SystemSetupPage.scss";
import { info } from "../../../schemas/info";
import noRecordsFound from "../../../assets/images/noRecordsFound.png";
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
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setPokedData } from "../../../features/slice/authSlice";
import useDebounce from "../../../components/useDebounce";
import {
  useGetAllSystemsAsyncQuery,
  useLazyGetAllSystemsAsyncQuery,
  useUpdateSystemStatusMutation,
} from "../../../features/api/systemApi";
import { toast } from "sonner";
import useExportData from "../../../components/hooks/useExportData";
import DialogSetupSample from "./DialogSetupSample";
import ConfirmedDialog from "../../../components/ConfirmedDialog";

const SystemSetupPageSample = () => {
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
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Toggle function for expanding/collapsing rows
  const toggleRowExpansion = (rowId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

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
  console.log("🚀 ~ SystemSetupPageSample ~ systemData:", systemData);

  const parameters = systemData?.value?.result.map((system) => ({
    id: system.id,
    bookParameter: system.bookParameter,
  }));
  //console.log("🚀 ~ SystemSetupPageSample ~ parameters:", parameters);

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
        //console.log({ error });
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
      console.log(err);
    }
  };

  return (
    <>
      <Box className="setup">
        <DialogSetupSample
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
                    : systemData?.value?.result.map((row) => {
                        // Parse bookParameter for this specific row
                        const rowParameters = parameters.find(
                          (p) => p.id === row.id
                        );
                        let parsedParams = [];

                        try {
                          if (rowParameters?.bookParameter) {
                            parsedParams = JSON.parse(
                              rowParameters.bookParameter
                            );
                          }
                        } catch (error) {
                          console.error(
                            `Error parsing bookParameter for row ${row.id}:`,
                            error
                          );
                          parsedParams = [];
                        }

                        const hasParameters =
                          parsedParams && parsedParams.length > 0;

                        return (
                          <React.Fragment key={row.id}>
                            {/* Main row */}
                            <TableRow
                              className={activeRow === row.id ? "active" : ""}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                                },
                              }}
                            >
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  {/* Expand/Collapse icon moved before system name */}
                                  {hasParameters && (
                                    <IconButton
                                      onClick={() => toggleRowExpansion(row.id)}
                                      size="small"
                                      color={
                                        expandedRows.has(row.id)
                                          ? "primary"
                                          : "default"
                                      }
                                      sx={{ marginRight: 1 }}
                                    >
                                      {expandedRows.has(row.id) ? (
                                        <ExpandLess />
                                      ) : (
                                        <ExpandMore />
                                      )}
                                    </IconButton>
                                  )}
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
                              <TableCell>
                                <Chip
                                  variant="filled"
                                  label={
                                    params.status === "active"
                                      ? "active"
                                      : "inactive"
                                  }
                                  color={
                                    params.status === "active"
                                      ? "success"
                                      : "error"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  display="flex"
                                  gap={1}
                                  justifyContent="center"
                                >
                                  <IconButton
                                    onClick={(event) => {
                                      handlePopOverOpen(event, row);
                                      dispatch(setPokedData(row));
                                    }}
                                    size="small"
                                  >
                                    <MoreVertOutlined />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>

                            {/* Collapsible row - only render if there are parameters */}
                            {hasParameters && (
                              <TableRow>
                                <TableCell
                                  colSpan={headerColumn.length + 1}
                                  sx={{
                                    paddingBottom: 0,
                                    paddingTop: 0,
                                    backgroundColor: "rgba(25, 118, 210, 0.02)",
                                    borderLeft: "4px solid #1976d2",
                                  }}
                                >
                                  <Collapse
                                    in={expandedRows.has(row.id)}
                                    timeout="auto"
                                    unmountOnExit
                                  >
                                    <Box sx={{ margin: 2 }}>
                                      <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        component="div"
                                        sx={{
                                          fontWeight: 600,
                                          color: "#1976d2",
                                          marginBottom: 2,
                                        }}
                                      >
                                        📚 Parameters ({parsedParams.length})
                                      </Typography>

                                      {parsedParams.length > 0 ? (
                                        <Box
                                          sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                              xs: "1fr",
                                              sm: "repeat(2, 1fr)",
                                              md: "repeat(3, 1fr)",
                                            },
                                            gap: 3,
                                          }}
                                        >
                                          {parsedParams.map((param, index) => (
                                            <Card
                                              key={index}
                                              sx={{
                                                background: "white",
                                                color: "#333",
                                                borderRadius: 3,
                                                overflow: "hidden",
                                                position: "relative",
                                                border: "2px solid #f0f0f0",
                                                minHeight: 200, // Fixed minimum height to prevent layout shifts
                                                maxHeight: 320, // Fixed maximum height
                                                display: "flex",
                                                flexDirection: "column",
                                                "&:hover": {
                                                  transform:
                                                    "translateY(-8px) scale(1.02)",
                                                  boxShadow:
                                                    "0 20px 40px rgba(0, 0, 0, 0.15)",
                                                  borderColor: "#1976d2",
                                                },
                                                "&:hover::before": {
                                                  opacity: 1,
                                                },
                                                "&::before": {
                                                  content: '""',
                                                  position: "absolute",
                                                  top: 0,
                                                  left: 0,
                                                  width: "4px",
                                                  height: "100%",
                                                  background:
                                                    "linear-gradient(180deg, #1976d2 0%, #42a5f5 100%)",
                                                  opacity: 0,
                                                  transition:
                                                    "opacity 0.3s ease",
                                                },
                                                transition:
                                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                cursor: "pointer",
                                              }}
                                            >
                                              {/* Decorative corner element */}
                                              <Box
                                                sx={{
                                                  position: "absolute",
                                                  top: -10,
                                                  right: -10,
                                                  width: 40,
                                                  height: 40,
                                                  borderRadius: "50%",
                                                  background:
                                                    "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                                                  opacity: 0.6,
                                                }}
                                              />

                                              {/* Card number badge */}
                                              <Box
                                                sx={{
                                                  position: "absolute",
                                                  top: 16,
                                                  right: 16,
                                                  background:
                                                    "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                                                  color: "white",
                                                  borderRadius: "50%",
                                                  width: 32,
                                                  height: 32,
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  fontSize: "0.875rem",
                                                  fontWeight: 700,
                                                  boxShadow:
                                                    "0 4px 12px rgba(25, 118, 210, 0.3)",
                                                  // zIndex: 2,
                                                }}
                                              >
                                                {index + 1}
                                              </Box>

                                              <CardContent
                                                sx={{
                                                  padding: 3,
                                                  position: "relative",
                                                  // zIndex: 1,
                                                  flex: 1,
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  overflow: "hidden", // Prevent content overflow
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 2,
                                                    height: "100%",
                                                  }}
                                                >
                                                  {/* Book Name Section */}
                                                  <Box
                                                    sx={{ flex: "0 0 auto" }}
                                                  >
                                                    <Box
                                                      sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        marginBottom: 1,
                                                      }}
                                                    >
                                                      <Box
                                                        sx={{
                                                          background:
                                                            "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                                                          borderRadius: "50%",
                                                          width: 32,
                                                          height: 32,
                                                          display: "flex",
                                                          alignItems: "center",
                                                          justifyContent:
                                                            "center",
                                                          fontSize: "1rem",
                                                          boxShadow:
                                                            "0 2px 8px rgba(0, 0, 0, 0.1)",
                                                        }}
                                                      >
                                                        📖
                                                      </Box>
                                                      <Typography
                                                        variant="caption"
                                                        sx={{
                                                          fontWeight: 600,
                                                          textTransform:
                                                            "uppercase",
                                                          letterSpacing: 1,
                                                          opacity: 0.9,
                                                          color: "#666",
                                                        }}
                                                      >
                                                        Book Name
                                                      </Typography>
                                                    </Box>
                                                    <Typography
                                                      variant="h6"
                                                      title={
                                                        param.bookName ||
                                                        "Untitled Book"
                                                      } // Tooltip for full text
                                                      sx={{
                                                        fontWeight: 700,
                                                        fontSize: "1.1rem",
                                                        lineHeight: 1.3,
                                                        marginBottom: 0.5,
                                                        color: "#1a1a1a",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                          "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        maxWidth: "100%",
                                                      }}
                                                    >
                                                      {param.bookName ||
                                                        "Untitled Book"}
                                                    </Typography>
                                                  </Box>

                                                  {/* Book Value and Close Date */}
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      gap: 1.5,
                                                      flex: 1,
                                                      minHeight: 0, // Allow flex items to shrink
                                                    }}
                                                  >
                                                    {/* Book Value */}
                                                    <Box
                                                      sx={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                      }}
                                                    >
                                                      <Box
                                                        sx={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          gap: 0.5,
                                                          marginBottom: 0.5,
                                                        }}
                                                      >
                                                        <Typography
                                                          variant="caption"
                                                          sx={{
                                                            fontWeight: 500,
                                                            color: "#888",
                                                            fontSize: "0.75rem",
                                                          }}
                                                        >
                                                          ⚖ VALUE
                                                        </Typography>
                                                      </Box>
                                                      <Box
                                                        sx={{
                                                          background:
                                                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                                          borderRadius: 2,
                                                          padding: "10px 14px",
                                                          border:
                                                            "1px solid #e0e0e0",
                                                          boxShadow:
                                                            "inset 0 1px 3px rgba(0, 0, 0, 0.05)",
                                                          height: "fit-content",
                                                          minHeight: 40,
                                                          display: "flex",
                                                          alignItems: "center",
                                                        }}
                                                      >
                                                        <Typography
                                                          variant="body2"
                                                          title={
                                                            param.bookValue ||
                                                            "N/A"
                                                          } // Tooltip for full text
                                                          sx={{
                                                            fontWeight: 600,
                                                            fontSize:
                                                              "0.875rem",
                                                            color: "#1976d2",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                              "ellipsis",
                                                            whiteSpace:
                                                              "nowrap",
                                                            width: "100%",
                                                          }}
                                                        >
                                                          {param.bookValue ||
                                                            "N/A"}
                                                        </Typography>
                                                      </Box>
                                                    </Box>

                                                    {/* Close Date */}
                                                    <Box
                                                      sx={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                      }}
                                                    >
                                                      <Box
                                                        sx={{
                                                          display: "flex",
                                                          alignItems: "center",
                                                          gap: 0.5,
                                                          marginBottom: 0.5,
                                                        }}
                                                      >
                                                        <Typography
                                                          variant="caption"
                                                          sx={{
                                                            fontWeight: 500,
                                                            color: "#888",
                                                            fontSize: "0.75rem",
                                                          }}
                                                        >
                                                          📅 CLOSE
                                                        </Typography>
                                                      </Box>
                                                      <Box
                                                        sx={{
                                                          background:
                                                            "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                                                          borderRadius: 2,
                                                          padding: "10px 14px",
                                                          textAlign: "center",
                                                          boxShadow:
                                                            "0 4px 12px rgba(25, 118, 210, 0.2)",
                                                          height: "fit-content",
                                                          minHeight: 40,
                                                          display: "flex",
                                                          alignItems: "center",
                                                          justifyContent:
                                                            "center",
                                                        }}
                                                      >
                                                        <Typography
                                                          variant="body2"
                                                          title={
                                                            param.closeDate ||
                                                            "N/A"
                                                          } // Tooltip for full text
                                                          sx={{
                                                            fontWeight: 700,
                                                            fontSize: "1rem",
                                                            color: "white",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                              "ellipsis",
                                                            whiteSpace:
                                                              "nowrap",
                                                            width: "100%",
                                                          }}
                                                        >
                                                          {param.closeDate ||
                                                            "N/A"}
                                                        </Typography>
                                                      </Box>
                                                    </Box>
                                                  </Box>
                                                </Box>
                                              </CardContent>

                                              {/* Bottom decorative line */}
                                              {/* <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
                    }}
                  /> */}
                                            </Card>
                                          ))}
                                        </Box>
                                      ) : (
                                        <Box
                                          sx={{
                                            textAlign: "center",
                                            py: 6,
                                            background:
                                              "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                                            borderRadius: 3,
                                            border: "2px dashed #e0e7ff",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              fontSize: "3rem",
                                              marginBottom: 2,
                                              opacity: 0.6,
                                            }}
                                          >
                                            📭
                                          </Box>
                                          <Typography
                                            variant="h6"
                                            sx={{
                                              color: "text.secondary",
                                              fontWeight: 500,
                                              marginBottom: 1,
                                            }}
                                          >
                                            No Parameters Available
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "text.secondary",
                                              opacity: 0.7,
                                            }}
                                          >
                                            This system doesn't have any book
                                            parameters configured yet.
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
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

export default SystemSetupPageSample;
