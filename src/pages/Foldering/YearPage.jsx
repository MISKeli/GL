import React from "react";
import DataFile from "./components/DataFile";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";

const years = ["2024", "2025", "2026", "2027"];

const YearPage = () => {
  return (
    <>
      {years.map((year) => (
        <Link
          to={`./${year}`}
          key={year}
          style={{
            textDecoration: "none",
            color: "inherit",
            height: "fit-content",
          }}
        >
          <DataFile name={year} />
        </Link>
      ))}
    </>
  );
};

export default YearPage;
