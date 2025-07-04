import React, { Suspense, useState } from "react";
import folderOpen from "../../../assets/icon/folderOpen.svg";
import sheetOpen from "../../../assets/icon/sheetOpen.svg";
import sheetClose from "../../../assets/icon/sheetClose.svg";
import folderClose from "../../../assets/icon/folderClose.svg";
import { Box, Skeleton, Typography } from "@mui/material";

// Create a loading skeleton component
const FileLoadingSkeleton = () => (
  <Box width="130px" display="flex" justifyContent="center">
    <Skeleton variant="text" width="80%" height={24} />
  </Box>
);

const DataFile = ({
  name,
  onClick,
  onDoubleClick,
  variant = "folder",
  isSelected,
  
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine the correct image state
  const getImageState = () => {
    if (isHovered || isSelected) {
      return variant === "folder" ? folderOpen : sheetOpen;
    }
    return variant === "folder" ? folderClose : sheetClose;
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
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
          <img src={getImageState()} width={"100%"} alt={name} />
        </Box>

        <Box
          bottom={0}
          width={"130px"}
          display={"flex"}
          justifyContent={"center"}
          gap={"2rem"}
        >
          {/* <Suspense fallback={<FileLoadingSkeleton />}>
            {isLoading ? (
              <FileLoadingSkeleton />
            ) : (
              <Typography textAlign={"center"}>{name}</Typography>
            )}
          </Suspense> */}
         
              <Typography textAlign={"center"}>{name}</Typography>
         
        </Box>
      </Box>
    </Box>
  );
};

export default DataFile;
