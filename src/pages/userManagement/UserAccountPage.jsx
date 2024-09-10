import {
  ArchiveOutlined,
  ArchiveRounded,
  EditRounded,
  LibraryAddRounded,
  LockReset,
  MoreVertOutlined,
  RestoreFromTrashOutlined,
  Search,
} from "@mui/icons-material";
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
import AddUser from "../userManagement/AddUser";
import {
  useGetAllUserQuery,
  useUpdateUserStatusMutation,
} from "../../features/api/userApi";
import useDebounce from "../../components/useDebounce";
import { useResetPasswordMutation } from "../../features/api/passwordApi";
import ConfirmedDialog from "../../components/ConfirmedDialog";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";

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

const UserAccountPage = () => {
  const TableColumn = [
    { id: ["idPrefix", "idNumber"], name: "ID" },
    { id: ["firstName", "middleName", "lastName"], name: "NAME" },
    { id: "sex", name: "SEX" },
    { id: "username", name: "USERNAME" },
    { id: "userRole", name: "ROLE" },
    { id: "status", name: "STATUS" },
    { id: "action", name: "ACTIONS" },
  ];
  const dispatch = useDispatch();
  const pokedData = useSelector((state) => state.auth.pokedData);

  console.log("pokedData from Redux:", pokedData);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [status, setStatus] = useState("active");
  const [expanded, setExpanded] = useState(false); // State for search bar expansion
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const debounceValue = useDebounce(search);

  const { data: userData, isLoading: isUserLoading } = useGetAllUserQuery(
    {
      Search: debounceValue,
      Status: status === "active" ? true : false,
      PageNumber: page + 1,
      PageSize: pageSize,
    },
    { refetchOnFocus: true }
  );
  //console.log("apple", userData);

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

  //Opening Menu
  const handlePopOverOpen = (event, userAcc) => {
    console.log("MOON", userAcc);
    setAnchorEl(event.currentTarget);
    dispatch(setPokedData(userAcc));
    setIsUpdate(true);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
    setIsUpdate(false);
  };

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  //Status
  const handleToggleStatus = () => {
    setStatus(status === "active" ? "inactive" : "active");
  };

  //Opening Dialog
  // const setOpenTrue = () => setOpen(true);
  // const closePopUp = () => setOpen(false);

  //password reset
  const [isReset, setIsReset] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  const handleResetPassword = () => {
    setAnchorEl(null);
    setIsReset(true);
    setOpenPasswordDialog(true);
  };
  const handleReset = () => {
    if (!pokedData?.id) {
      toast.error("User data is missing.");
      return;
    }
    resetPassword(pokedData.id)
      .unwrap()
      .then((res) => {
        console.log("Password Res", res);
        toast.success("Reset Password Successfully"); // Updated message
        setOpenPasswordDialog(false);
      })
      .catch((error) => {
        console.log("Password Err", error);
        toast.error(error?.message);
      });
  };

  //UPDATE
  const [isUpdate, setIsUpdate] = useState(false);
  const openDialogForUpdate = () => {
    setOpen(true);
    setIsUpdate(true);
  };

  // UpdateUserStatus ARCHIVED
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const handleUserStatus = () => {
    updateUserStatus(pokedData.id)
      .unwrap()
      .then((res) => {
        console.log(res);
        if (pokedData.isActive === true) {
          toast.success("User Archieved Successfully ");
        } else {
          toast.success("User Restored Successfully ");
        }
      })
      .catch((error) => {
        console.log({ error });
        toast.error(error?.message);
      });
  };

  return (
    <>
      <Box className="masterlist">
        <AddUser open={open} closeHandler={closePopUp} isUpdate={isUpdate} />
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.users_title}
            </Typography>
            <Button
              startIcon={<LibraryAddRounded />}
              variant="contained"
              onClick={() => {
                openPopUp();
                dispatch(setPokedData(null));
              }}
            >
              {info.users_add_button}
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
        <Box className="masterlist__content">
          <Box className="masterlist__content__table">
            <TableContainer
              component={Paper}
              sx={{ overflow: "auto", height: "100%" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {TableColumn.map((userTable) => (
                      <TableCell key={userTable}>{userTable.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {userData?.value.users.map((userAcc, index) => (
                    <TableRow
                      key={index}
                      className={activeRow === userAcc.id ? "active" : ""}
                    >
                      <TableCell>
                        {userAcc.idPrefix}
                        {"-"}
                        {userAcc.idNumber}
                      </TableCell>
                      <TableCell>
                        {userAcc.firstName} {userAcc.middleName}{" "}
                        {userAcc.lastName}
                      </TableCell>
                      <TableCell>{userAcc.sex}</TableCell>
                      <TableCell>{userAcc.username}</TableCell>
                      <TableCell>{userAcc.userRole}</TableCell>
                      <TableCell>
                        <Chip
                          variant="outlined"
                          label={status === "active" ? "active" : "inactive"}
                          color={status === "active" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <MoreVertOutlined
                          onClick={(event) => {
                            handlePopOverOpen(event, userAcc);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              className="pagination"
              count={userData?.value.totalCount || 0}
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
                    handleUserStatus();
                  }}
                >
                  <ListItemIcon>
                    <ArchiveRounded />
                  </ListItemIcon>
                  <ListItemText primary="Archive" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleResetPassword(pokedData);
                    handlePopOverClose();
                  }}
                >
                  <ListItemIcon>
                    <LockReset />
                  </ListItemIcon>
                  <ListItemText primary="Reset Password" />
                </MenuItem>
              </div>
            ) : (
              <MenuItem
                onClick={() => {
                  handlePopOverClose();
                  handleUserStatus();
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
        <ConfirmedDialog
          open={openPasswordDialog}
          onClose={() => setOpenPasswordDialog(false)}
          onYes={handleReset}
          title={"Reset Password"}
          description={`Are you sure you want to reset this ${
            pokedData?.firstName || "this user's "
          }'s password?`}
        />
      </Box>
    </>
  );
};

export default UserAccountPage;
