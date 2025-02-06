import React, { useState } from "react";
import folderOpen from "../../../assets/icon/folderOpen.svg";
import sheetOpen from "../../../assets/icon/sheetOpen.svg";
import sheetClose from "../../../assets/icon/sheetClose.svg";
import folderClose from "../../../assets/icon/folderClose.svg";
import { Box, Tooltip, Typography } from "@mui/material";

const DataFile = ({ name, onClick, onDoubleClick, variant = "folder",  isSelected  }) => {
  const [imageState, setImageState] = useState(
    variant === "folder" ? folderClose : sheetClose
  );
 

  // const handleClick = () => {
  //   setIsSelected((prev) => !prev); // Toggle selection
  //   if (onClick) onClick();
  // };

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
      onClick={onClick}
      onDoubleClick={onDoubleClick} 
      // Fetch data on double-click
      sx={{
        cursor: "pointer",

        borderRadius: "8px",
        transition: "background-color 0.3s",
        backgroundColor: isSelected ? "rgba(0, 123, 255, 0.2)" : "transparent",
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
         
          bottom={0}
          width={"130px"}
          display={"flex"}
          justifyContent={"center"}
  
          gap={"2rem"}
        >
          <Typography bottom={0} textAlign={"center"}>
            {name}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DataFile;
