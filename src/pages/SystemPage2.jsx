import { Box, Breadcrumbs, IconButton, Paper, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useGetAllGLReportAsyncQuery } from "../features/api/reportApi";
import moment from "moment";
import { info } from "../schemas/info";
import "../styles/SystemFolder.scss";
import DateSearchCompoment from "../components/DateSearchCompoment";

const SystemPage2 = () => {
  const params = useParams();
  const { year, month, boaName } = params;

  const breadCrumbData = Object.values(params);
  console.log("object", params);
  return (
    <>
      <Box className="folder">
        <Box className="folder__breadcrumbs">
          {/* <IconButton></IconButton> */}
          <Breadcrumbs aria-label="breadcrumb">
            <Link>{info.systems_title}</Link>
            {breadCrumbData.map((item) => (
              <Link key={item}>{item.toUpperCase()}</Link>
            ))}
          </Breadcrumbs>
        </Box>

        <Box
          className="folder__header__paper__outlet"
          minHeight="100vh"

          //  width="100%"
        >
          <Outlet context={{ year, month, boaName }} />
        </Box>
      </Box>
    </>
  );
};

export default SystemPage2;
