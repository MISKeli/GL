import {
  ArchiveRounded,
  EditRounded,
  LockReset,
  MoreVertOutlined,
  Search,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  colors,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
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
import { useGetAllUserQuery } from "../../features/api/userApi";
import useDebounce from "../../components/useDebounce";

const UserAccountPage = () => {
  const TableColumn = [
    { id: "userRoleId", name: "Role Id" },
    { id: "idPrefix", name: "Prefix ID" },
    { id: "idNumber", name: "ID No" },
    { id: "firstName", name: "First Name" },
    { id: "lastName", name: "Last Name" },
    { id: "sex", name: "Sex" },
    { id: "username", name: "Username" },
    { id: "status", name: "Status" },
    { id: "action", name: "Action" },
  ];

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [status, setStatus] = useState("active");

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

  //Opening Menu
  const handlePopOverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopOverClose = () => {
    setAnchorEl(null);
  };

  //Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  //Status
  const handleToggleStatus = () => {
    setStatus(status === "active" ? "inactive" : "active");
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  //Opening Dialog
  const setOpenTrue = () => setOpen(true);
  const closePopUp = () => setOpen(false);

  return (
    <>
      <Box className="masterlist">
        <AddUser open={open} closeHandler={closePopUp} />
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.users_title}
            </Typography>
            <Button variant="contained" onClick={setOpenTrue}>
              {info.users_add_button}
            </Button>
          </Box>
        </Box>
        <Box className="masterlist__header__con2">
          <Box className="masterlist__header__con2--archieved">
            <Checkbox
              checked={status === "inactive"}
              onChange={handleToggleStatus}
              color="error"
            />
            <Typography
              variant="button"
              color={status === "active" ? "primary" : "error"}
            >
              Archived
            </Typography>
          </Box>
          <Box
            className="masterlist__header__con2--search"
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "250px",
            }}
          >
            <InputBase
              sx={{ ml: 0.5, flex: 1 }}
              placeholder="Search "
              onChange={(e) => {
                setSearch(e.target.value);
              }}
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
                      <TableCell>{userAcc.roleId}</TableCell>
                      <TableCell>{userAcc.idPrefix}</TableCell>
                      <TableCell>{userAcc.idNumber}</TableCell>
                      <TableCell>{userAcc.firstName}</TableCell>

                      <TableCell>{userAcc.lastName}</TableCell>
                      <TableCell>{userAcc.sex}</TableCell>
                      <TableCell>{userAcc.username}</TableCell>
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
                            handlePopOverOpen(event);
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
            <MenuItem
              onClick={() => {
                handlePopOverClose();
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
              }}
            >
              <ListItemIcon>
                <ArchiveRounded />
              </ListItemIcon>
              <ListItemText primary="Archive" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handlePopOverClose();
              }}
            >
              <ListItemIcon>
                <LockReset />
              </ListItemIcon>
              <ListItemText primary="Reset Password" />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default UserAccountPage;
