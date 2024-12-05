import React, { useEffect, useState } from "react";
import DataFile from "./components/DataFile";
import { Box } from "@mui/material";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../styles/SystemFolder.scss";

const boaName = [
  "Purchases Book",
  "Cash Disbursement Book",
  "Sales Journal Book",
  "Cash Receipt Book",
  "General Ledger Book",
  "Journal Book",
];

const SystemFilepage = () => {
  console.log("system: ", boaName);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(null);
  const folderUrl = useSelector((state) => state.misc.folderUrl);

  console.log("folder", folderUrl);

  const handleDoubleClick = (boa) => {
    navigate(`./${boa}`);
  };

  return (
    <>
      {boaName.map((boa) => (
        <Box
          key={boa}
          onDoubleClick={() => handleDoubleClick(boa)}
          sx={{
            backgroundColor: isSelected?.boa === boa ? "red" : "",
            height: "fit-content",
          
          }}
          onClick={() => {
            setIsSelected(boa);
          }}
        >
          <DataFile name={boa} />
        </Box>
      ))}
      <Box></Box>
    </>
  );
};

export default SystemFilepage;
