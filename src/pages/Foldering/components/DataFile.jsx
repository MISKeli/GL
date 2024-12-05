import React, { useState } from "react";
import folderOpen from "../../../assets/icon/folderOpen.svg";
import sheetOpen from "../../../assets/icon/sheetOpen.svg";
import sheetClose from "../../../assets/icon/sheetClose.svg";
import folderClose from "../../../assets/icon/folderClose.svg";
import { Box, Tooltip, Typography } from "@mui/material";

const DataFile = ({ name, onClick, onDoubleClick, variant = "folder" }) => {
  const [imageState, setImageState] = useState(
    variant === "folder" ? folderClose : sheetClose
  );
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    // Toggle the selection state
    setIsSelected((prev) => !prev);
  };

  const handleDoubleClick = () => {
    // Trigger the fetch data function on double-click
    if (onDoubleClick) {
      onDoubleClick(); // Call the provided onDoubleClick function
    }
  };

  return (
    <Box
      onMouseEnter={() => {
        if (variant === "folder") {
          setImageState(folderOpen);
        } else {
          setImageState(sheetOpen);
        }
      }}
      onMouseLeave={() => {
        if (variant === "folder") {
          setImageState(folderClose);
        } else {
          setImageState(sheetClose);
        }
      }}
      onClick={handleClick} // Toggle background color on click
      onDoubleClick={handleDoubleClick} // Fetch data on double-click
      sx={{
        cursor: "pointer",

        borderRadius: "8px",
        transition: "background-color 0.3s",
        "&:hover": {
          backgroundColor: "rgba(0, 123, 255, 0.1)",
        },
      }}
    >
      <Box position={"relative"}>
        <Box width={150}>
          <img src={imageState} width={"100%"} />
        </Box>

        <Box
          position={"absolute"}
          bottom={0}
          width={"130px"}
          display={"flex"}
          justifyContent={"center"}
          
        >
          <Typography>{name}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DataFile;
