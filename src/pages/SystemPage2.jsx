/* eslint-disable react/prop-types */

import { Box, Breadcrumbs, IconButton, useTheme } from "@mui/material";

import React, { useState } from "react";

import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { ArrowBackIos, NavigateNextRounded } from "@mui/icons-material";
import DateSearchCompoment from "../components/DateSearchCompoment";
import { info } from "../schemas/info";
import "../styles/SystemFolder.scss";

const SystemPage2 = () => {
  const [isHorizontalView, setIsHorizontalView] = useState(true);
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { year, month, boaName } = params;
  const hasViewChange = year && month && boaName;

  const breadCrumbData = Object.entries(params);

  const handleBackClick = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean); // Split and remove empty segments

    // Ensure it's a system path and has at least two dynamic parts (e.g., /system/2025/OCT)
    if (pathSegments.length > 2) {
      // Remove the last segment (e.g., OCT)
      const newPath = "/" + pathSegments.slice(0, -1).join("/");
      navigate(newPath); // Navigate to /system/2025
    } else {
      navigate("/boa_file_manager"); // Fallback: Navigate to /system
    }
  };

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const lastSegment = decodeURIComponent(pathSegments[pathSegments.length - 1]);
  // Function to check if a breadcrumb item matches the last segment of the pathname

  // Function to generate the URL for each breadcrumb item
  const generateBreadcrumbLink = (index) => {
    const pathArray = ["/boa_file_manager"]; // Base path
    for (let i = 0; i <= index; i++) {
      pathArray.push(breadCrumbData[i][1]); // Push the value of each param in order
    }
    return pathArray.join("/"); // Join as URL
  };

  return (
    <>
      <Box className="folder">
        {" "}
        {/*display={"flex"} height={"100%"} flexDirection={"column"} */}
        <Box className="folder__breadcrumbs">
          {" "}
          {/* display={"flex"} justifyContent={"space-between"}*/}
          <Box className="folder__breadcrumbs__container">
            {" "}
            {/* display={"flex"} flexDirection={"row"} alignItems={"center"} bgcolor={"blue"*/}
            <IconButton onClick={handleBackClick}>
              <ArrowBackIos />
            </IconButton>
            <Breadcrumbs
              separator={<NavigateNextRounded fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link
                component="span"
                to="/boa_file_manager"
                style={{
                  fontWeight:
                    location.pathname === "/boa_file_manager"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/boa_file_manager"
                      ? theme.palette.primary.main
                      : "inherit",
                }}
              >
                {info.systems_title}
              </Link>
              {breadCrumbData.map(([key, value], index) => {
                const linkPath = generateBreadcrumbLink(index); // Construct proper breadcrumb path
                const isCurrent = decodeURIComponent(value) === lastSegment;

                return (
                  <Link
                    key={value}
                    component="span"
                    to={linkPath}
                    style={{
                      fontWeight: isCurrent ? "bold" : "normal",
                      color: isCurrent ? theme.palette.primary.main : "inherit",
                    }}
                  >
                    {value.toUpperCase()}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
          {hasViewChange && (
            <DateSearchCompoment
              hasDate={false}
              onViewChange={() => {
                setIsHorizontalView((PREV) => !PREV);
              }}
            />
          )}
        </Box>
        <Box
          // className="folder__header__paper__outlet"
          display={"flex"}
          flexWrap={"wrap"}
          flexDirection={"row"}
          width={"100%"}
          overflow={"hidden"}
        >
          <Outlet context={{ year, month, boaName, isHorizontalView }} />
        </Box>
      </Box>
    </>
  );
};

export default SystemPage2;
