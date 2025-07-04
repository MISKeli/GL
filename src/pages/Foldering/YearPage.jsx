import React, { useEffect, useRef, useState } from "react";
import DataFile from "./components/DataFile";

import { useNavigate } from "react-router-dom";
import { useGenerateSystemFolderStructurePageQuery } from "../../features/api/folderStructureApi";
import { Box } from "@mui/material";

const YearPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const containerRef = useRef(null);

  const { data: folderData } = useGenerateSystemFolderStructurePageQuery({
    Year: "",
  });
  const years = folderData?.value?.years;

  const navigate = useNavigate();

  const handleDoubleClick = (year) => {
    navigate(`./${year}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setSelectedItem(null); // Deselect when clicking outside
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Box ref={containerRef} display={"flex"} height={"fit-content"}>
        {years?.map((year) => (
          <DataFile
            isSelected={selectedItem === year}
            onClick={() => setSelectedItem(year)}
            key={year}
            name={year}
            onDoubleClick={() => handleDoubleClick(year)}
          />
        ))}
      </Box>
    </>
  );
};

export default YearPage;
