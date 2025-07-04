/* eslint-disable react/prop-types */
import {
  Badge,
  Box,
  Button,
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
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { info } from "../../schemas/info";
import "../../styles/Masterlist.scss";
import useDebounce from "../../components/useDebounce";
import {
  useGetAllUserRolesQuery,
  useLazyGetAllUserRoleAsyncQuery,
  useUpdateUserRoleStatusMutation,
} from "../../features/api/roleApi";
import {
  AccountTreeOutlined,
  ArchiveOutlined,
  ArchiveRounded,
  EditRounded,
  IosShareRounded,
  LibraryAddRounded,
  MoreVertOutlined,
  RestoreFromTrashOutlined,
  Search,
} from "@mui/icons-material";
import AddRole from "./AddRole";
import { useDispatch, useSelector } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";
import { toast } from "sonner";
import noRecordsFound from "../../assets/images/noRecordsFound.png";
import ConfirmedDialog from "../../components/ConfirmedDialog";
import useExportData from "../../components/hooks/useExportData";

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

const RoleManagemenPage = () => {
  const { commonExport } = useExportData();

  const [open, setOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState("active");
  const [expanded, setExpanded] = useState(false); // State for search bar expansion
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const inputRef = useRef(null); // Create a ref for InputBase

  const dispatch = useDispatch();
  const pokedData = useSelector((state) => state.auth.pokedData);
  const debounceValue = useDebounce(search);
  const TableColumn = info.role.tableColumns;

  const {
    data: roleData,
    isLoading: isRoleLoading,
    isFetching: isRoleFetching,
  } = useGetAllUserRolesQuery(
    {
      Search: debounceValue,
      Status: status === "active" ? true : false,
      PageNumber: page + 1,
      PageSize: pageSize,
      UsePagination: true,
    },
    { refetchOnFocus: true }
  );
  console.log("🚀 ~ RoleManagemenPage ~ roleData:", roleData);
  // SEARCH
  const handleSearchClick = () => {
    setExpanded(true); // Expand the box
    inputRef.current?.focus(); // Immediately focus the input field
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  // Status Toggle
  const handleToggleStatus = () => {
    setStatus(status === "active" ? "inactive" : "active");
  };

  // Opening Menu
  const handlePopOverOpen = (event, userRole) => {
    setAnchorEl(event.currentTarget);
    dispatch(setPokedData(userRole));
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };

  // Update Dialog
  const openDialogForUpdate = () => {
    setOpen(true);
    setIsUpdate(true);
    setViewOnly(false);
    //setUserPermission(data);
  };

  //Opening Dialog
  const openPopUp = () => {
    setOpen(true);
    setViewOnly(false);
  };
  const closePopUp = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handlePokedData = (data) => {
    dispatch(setPokedData(data));
  };

  // Update User Role Status
  const [UpdateUserRoleStatus] = useUpdateUserRoleStatusMutation();

  const handleUserRoleStatus = () => {
    UpdateUserRoleStatus(pokedData.id)
      .unwrap()
      .then((res) => {
        if (pokedData.isActive) {
          toast.success(info.role.messages.archiveSuccess);
        } else {
          toast.success(info.role.messages.restoreSuccess);
        }
        setOpenArchiveDialog(false);
      })
      .catch((error) => {
        toast.error(error?.data?.error?.message);
      });
  };

  const [fetchExportData] = useLazyGetAllUserRoleAsyncQuery();

  const Headers = info.role.export;
  const hasData = roleData?.value?.result?.length > 0;
  const onExport = async () => {
    try {
      const exportData = await fetchExportData({
        UsePagination: false,
      }).unwrap();
      //console.log("🚀 ~ onExport ~ exportData:", exportData)

      await commonExport(Headers, exportData?.value, info.role.title);
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  return (
    <>
      <Box className="masterlist">
        <AddRole
          open={open}
          closeHandler={closePopUp}
          data={pokedData}
          isViewOnly={viewOnly}
          setViewOnly={setViewOnly}
          isUpdate={isUpdate}
          setIsUpdate={setIsUpdate}
        />
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.role.title}
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
              {info.role.addButton}
            </Button>
          </Box>
          <Box className="masterlist__header__con2">
            <Box className="masterlist__header__con2--archieved">
              <Tooltip title="Archived" placement="left" arrow>
                <IconButton onClick={handleToggleStatus}>
                  {status === "inactive" ? (
                    <ArchiveRounded color="primary" />
                  ) : (
                    <ArchiveOutlined color="primary" />
                  )}
                </IconButton>
              </Tooltip>
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                onBlur={() => search === "" && setExpanded(false)} // Collapse when losing focus if search is empty
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
                <Search />
              </IconButton>
            </AnimatedBox>
          </Box>
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
                    {TableColumn.map((roleTable) => (
                      <TableCell key={roleTable.id}>{roleTable.name}</TableCell>
                      
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isRoleLoading || isRoleFetching
                    ? Array.from({ length: pageSize }).map((_, index) => (
                        <TableRow key={index}>
                          {TableColumn.map((column) => (
                            <TableCell key={column.id}>
                              <Skeleton variant="text" animation="wave" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : roleData?.value.result.map((userRole) => (
                        <TableRow
                          key={userRole.id}
                          // className={activeRow === userRole.id ? "active" : ""}
                        >
                          <TableCell>{userRole.roleName}</TableCell>
                          <TableCell
                            onClick={() => {
                              openPopUp();
                              setViewOnly(true);
                              handlePokedData(userRole);
                            }}
                          >
                            <Badge
                              badgeContent={userRole?.permissions?.length}
                              color="error"
                              overlap="circular"
                            >
                              <IconButton>
                                <AccountTreeOutlined />
                              </IconButton>
                            </Badge>
                          </TableCell>
                          <TableCell>{userRole.addedBy}</TableCell>
                          <TableCell>{userRole.modifiedBy}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(event) => {
                                handlePopOverOpen(event, userRole);
                              }}
                            >
                              <MoreVertOutlined />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
              {roleData?.value?.result.length === 0 && !isRoleLoading ? (
                <Box className="masterlist__content__table--norecords">
                  <img src={noRecordsFound} alt="No Records Found" />
                </Box>
              ) : null}
            </TableContainer>
          </Box>
        </Box>
        <Box className="masterlist__footer">
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={onExport}
              disabled={!hasData || isRoleLoading || isRoleFetching}
              startIcon={
                isRoleLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IosShareRounded />
                )
              }
            >
              {isRoleLoading ? "Exporting..." : "Export"}
            </Button>
          </Box>

          <TablePagination
            component="div"
            className="pagination"
            count={roleData?.value.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopOverClose}
      >
        <MenuItem onClick={() => openDialogForUpdate(pokedData)}>
          <ListItemIcon>
            <EditRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenArchiveDialog(true);
            handlePopOverClose();
          }}
        >
          <ListItemIcon>
            {pokedData?.isActive ? (
              <ArchiveOutlined fontSize="small" />
            ) : (
              <RestoreFromTrashOutlined fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {pokedData?.isActive
              ? info.role.dialogs.achiveTitle
              : info.role.dialogs.restoreTitle}
          </ListItemText>
        </MenuItem>
      </Menu>
      <ConfirmedDialog
        open={openArchiveDialog}
        onClose={() => setOpenArchiveDialog(false)}
        onYes={handleUserRoleStatus} // Call handleUserStatus on confirmation
        title={
          pokedData?.isActive
            ? info.role.dialogs.archiveRoleTitle
            : info.role.dialogs.restoreRoleTitle
        }
        description={`Are you sure you want to ${
          pokedData?.isActive
            ? info.role.dialogs.achiveTitle.toUpperCase()
            : info.role.dialogs.restoreTitle.toUpperCase()
        } ${pokedData?.roleName || "this role"}?`}
      />
    </>
  );
};

export default RoleManagemenPage;
