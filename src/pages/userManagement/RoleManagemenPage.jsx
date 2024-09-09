import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { info } from "../../schemas/info";
import "../../styles/Masterlist.scss";
import useDebounce from "../../components/useDebounce";
import {
  useGetAllUserRolesQuery,
  useUpdateUserRoleStatusMutation,
} from "../../features/api/roleApi";
import {
  AccountTreeOutlined,
  ArchiveOutlined,
  ArchiveRounded,
  EditRounded,
  LibraryAddRounded,
  LockReset,
  MoreVertOutlined,
  RestoreFromTrashOutlined,
  Search,
} from "@mui/icons-material";
import AddRole from "./AddRole";
import { useDispatch, useSelector } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";
import { toast } from "sonner";
import noRecordsFound from "../../assets/images/noRecordsFound.png"

// Styled component for the animated search bar
const AnimatedBox = styled(Box)(({ theme, expanded }) => ({
  display: "flex",
  alignItems: "center",
  width: expanded ? "300px" : "50px", // Change width based on state
  transition: "width 0.3s ease-in-out", // Animate width change
  border: expanded ? `1px solid ${theme.palette.primary.main}` : "none", // Show border when expanded
  borderRadius: "10px", // Optional: round the corners
  padding: "2px 4px",
  position: "relative",
  margin: " 5px 5px",
}));

const RoleManagemenPage = () => {
  const [open, setOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [status, setStatus] = useState("active");
  const [expanded, setExpanded] = useState(false); // State for search bar expansion
  const [userPermission, setUserPermission] = useState(null);

  const dispatch = useDispatch();
  const pokedData = useSelector((state) => state.auth.pokedData);

  const debounceValue = useDebounce(search);
  const TableColumn = [
    { id: "roleName", name: "Role Name" },
    { id: "permissions", name: "Permissions" },
    { id: "addedBy", name: "Added By" },
    { id: "modifiedBy", name: "modified By" },
    { id: "action", name: "Action" },
  ];
  const { data: roleData, isLoading: isRoleLoading } = useGetAllUserRolesQuery(
    {
      Search: debounceValue,
      Status: status === "active" ? true : false,
      PageNumber: page + 1,
      PageSize: pageSize,
    },
    { refetchOnFocus: true }
  );

  //console.log("apple", roleData);

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  //Opening Dialog
  const setOpenTrue = () => setOpen(true);
  //const closePopUp = () => setOpen(false);

  //Status
  const handleToggleStatus = () => {
    setStatus(status === "active" ? "inactive" : "active");
  };

  //Opening Menu
  const handlePopOverOpen = (event, userRole) => {
    //console.log("NEIL", userRole);
    setAnchorEl(event.currentTarget);
    dispatch(setPokedData(userRole));
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };
  //console.log("POKED", pokedData);
  // Update
  const openDialogForUpdate = (data) => {
    //console.log("object", data);
    setOpen(true);
    setIsUpdate(true);
    setViewOnly(false);
    setUserPermission(data);
  };

  const openPopUp = () => {
    setOpen(true);
    setViewOnly(false);
  };
  // Ensure to clear pokedData when closing the popup or when opening for a new role
  const closePopUp = () => {
    setOpen(false);
    setAnchorEl(null);
    //clearPokedData();
  };

  const handlePokedData = (data) => {
    dispatch(setPokedData(data));
  };

  //UpdateUserRoleStatus ARCHIEVED/Restored
  const [UpdateUserRoleStatus] = useUpdateUserRoleStatusMutation();

  const handleUserRoleStatus = () => {
    UpdateUserRoleStatus(pokedData.id)
      .unwrap()
      .then((res) => {
        console.log("res", res);
        toast.success("Role Archieved Successfully");
      })
      .catch((error) => {
        toast.error(error?.message);
      });
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
        {/* {console.log("POKED",pokedData)} */}
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.role_title}
            </Typography>
            <Button
              startIcon={<LibraryAddRounded />}
              variant="contained"
              onClick={() => {
                openPopUp();
                dispatch(setPokedData(null));
              }}
            >
              {info.role_add_button}
            </Button>
          </Box>
        </Box>
        <Box className="masterlist__header__con2">
          <Box className="masterlist__header__con2--archieved">
            <IconButton onClick={handleToggleStatus}>
              {status === "inactive" ? (
                <ArchiveOutlined color="error" />
              ) : (
                <ArchiveRounded color="primary" />
              )}
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
              onBlur={() => search === "" && setExpanded(false)} // Collapse when losing focus if search is empty
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton
              color="primary"
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
            >
              <Search />
            </IconButton>
          </AnimatedBox>
        </Box>
        {/* empty */}
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
                      <TableCell key={roleTable}>{roleTable.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roleData?.value.userRoles.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={TableColumn.length} align="center">
                      <img
                        src={noRecordsFound }// Update this path to the location of your image
                        alt="No Records Found"
                        style={{ width: '250px', height: 'auto' }}
                      />
                    </TableCell>
                  </TableRow>
                  ): (
                    roleData?.value.userRoles.map((userRole, index) => (
                      <TableRow
                        key={index}
                        className={activeRow === userRole.id ? "active" : ""}
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
                            sx={{
                              "& .MuiBadge-dot": { backgroundColor: "#3259c4" },
                            }}
                          >
                            <IconButton>
                              <AccountTreeOutlined />
                            </IconButton>
                          </Badge>
                        </TableCell>
                        <TableCell>{userRole.addedBy}</TableCell>
                        <TableCell>{userRole.modifiedBy}</TableCell>
                        <TableCell>
                          <MoreVertOutlined
                            onClick={(event) => {
                              handlePopOverOpen(event, userRole);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                 
                </TableBody>
              </Table>
            </TableContainer>
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
          <Box className="masterlist__footer"></Box>
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
                    <EditRounded />
                  </ListItemIcon>
                  <ListItemText primary="Edit" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handlePopOverClose();
                    handleUserRoleStatus();
                  }}
                >
                  <ListItemIcon>
                    <ArchiveRounded />
                  </ListItemIcon>
                  <ListItemText primary="Archive" />
                </MenuItem>
              </div>
            ) : (
              <MenuItem
                onClick={() => {
                  handlePopOverClose();
                  handleUserRoleStatus();
                }}
              >
                <ListItemIcon>
                  <RestoreFromTrashOutlined />
                </ListItemIcon>
                <ListItemText primary="Restore" />
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default RoleManagemenPage;
