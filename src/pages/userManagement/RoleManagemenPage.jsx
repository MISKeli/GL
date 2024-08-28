import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { info } from "../../schemas/info";
import "../../styles/Masterlist.scss";
import useDebounce from "../../components/useDebounce";
import { useGetAllUserRolesQuery } from "../../features/api/roleApi";
import { MoreVertOutlined } from "@mui/icons-material";

const RoleManagemenPage = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [status, setStatus] = useState("active");

  const debounceValue = useDebounce(search);
  const TableColumn = [
    { id: "roleName", name: "Role Name" },
    { id: "permission", name: "Permission" },
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

  console.log("apple", roleData);
  //Opening Dialog
  const setOpenTrue = () => setOpen(true);
  const closePopUp = () => setOpen(false);

  return (
    <>
      <Box className="masterlist">
        <Box className="masterlist__header">
          <Box className="masterlist__header__con1">
            <Typography variant="h5" className="masterlist__header--title">
              {info.role_title}
            </Typography>
            <Button variant="contained" onClick={setOpenTrue}>
              {info.role_add_button}
            </Button>
          </Box>
        </Box>
        <Box className="masterlist__header__con2">
          <Box className="masterlist__header__con2--archieved"></Box>
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
                  {roleData?.value.userRoles.map((userRole, index) => (
                    <TableRow
                      key={index}
                      className={activeRow === userRole.id ? "active" : ""}
                    >
                      <TableCell>{userRole.roleName}</TableCell>
                      <TableCell>{userRole.permissions}</TableCell>
                      <TableCell>{userRole.addedBy}</TableCell>
                      <TableCell>{userRole.modifiedBy}</TableCell>
                      <TableCell><MoreVertOutlined
                          onClick={(event) => {
                            handlePopOverOpen(event);
                          }}
                        /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default RoleManagemenPage;
