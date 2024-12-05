import React from "react";
import DataFile from "./components/DataFile";
import { Box } from "@mui/material";
import { Link, useOutletContext } from "react-router-dom";
import moment from "moment";

const months = moment.monthsShort();

const MonthsPage = () => {
  const { data } = useOutletContext();
  console.log("you are here", data);

  return (
    <>
      {months.map((month) => (
        <Link
          to={`./${month}`}
          key={month}
          style={{
            textDecoration: "none",
            color: "inherit",
            height:"fit-content"
          }}
        >
          <DataFile name={month} variant="sheet" />
        </Link>
      ))}
    </>
  );
};

export default MonthsPage;
