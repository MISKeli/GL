import { Box, Breadcrumbs, IconButton, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useGetAllGLReportAsyncQuery } from "../features/api/reportApi";
import moment from "moment";
import { info } from "../schemas/info";
import "../styles/SystemFolder.scss";
import DateSearchCompoment from "../components/DateSearchCompoment";
import { ArrowBackIos, NavigateNextRounded } from "@mui/icons-material";

const SystemPage2 = () => {
  const [isHorizontalView, setIsHorizontalView] = useState(true);
  const params = useParams();
  const { year, month, boaName } = params;
  const hasViewChange = year && month && boaName;

  const breadCrumbData = Object.values(params);
  console.log("object", params);

  return (
    <>
      <Box display={"flex"} flex={1} height={"100%"} flexDirection={"column"}>
        <Box>
          <Box>
            <IconButton>
              <ArrowBackIos />
            </IconButton>
            <Breadcrumbs
              separator={<NavigateNextRounded fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link>{info.systems_title}</Link>
              {breadCrumbData.map((item) => (
                <Link key={item}>{item.toUpperCase()}</Link>
              ))}
            </Breadcrumbs>
          </Box>
          {hasViewChange && (
            <DateSearchCompoment
              hasDate={false}
              hasViewChange={true}
              onViewChange={() => {
                setIsHorizontalView((PREV) => !PREV);
              }}
            />
          )}
        </Box>
        <Box
          // className="folder__header__paper__outlet"
          display={"flex"}
          flex={1}
          overflow={"hidden"}
        >
          <Outlet context={{ year, month, boaName, isHorizontalView }} />
        </Box>
      </Box>
    </>
  );
};

export default SystemPage2;
