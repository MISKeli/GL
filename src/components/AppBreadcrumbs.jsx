import { ArrowForwardIos } from "@mui/icons-material";
import { Breadcrumbs } from "@mui/material";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/AppBreadcrumbs.scss"

const AppBreadcrumbs = () => {
  const location = useLocation();
  //console.log("location", location);

  let crumbLink = "";
  const crumbPath = location.pathname
    .split("/")
    .filter((path) => path !== "")
    .map((crumb, index, arr) => {
      crumbLink += `/${crumb}`;
      const isActive = index === arr.lenght -1;
      return isActive ? (<span className="active" key={crumb}>
        {crumb}
      </span>) :(
        <Link to={crumbLink} key={crumb} className="link">
          {crumb}
        </Link>
      );

      
    });
  //console.log("crumbPath", crumbPath);
  return <Breadcrumbs className="breadcrumbs">{crumbPath}</Breadcrumbs>;
};

export default AppBreadcrumbs;