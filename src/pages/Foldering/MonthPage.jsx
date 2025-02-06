import React, { useEffect, useRef, useState } from "react";
import DataFile from "./components/DataFile";
import { useNavigate, useParams } from "react-router-dom";

import { useGenerateSystemFolderStructurePageQuery } from "../../features/api/folderStructureApi";
import { Box } from "@mui/material";

const MonthsPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const containerRef = useRef(null);
  const params = useParams();

  const { data: folderData } = useGenerateSystemFolderStructurePageQuery({
    Year: params.year,
  });

  const months = folderData?.value?.response?.map((item) => item.month);



  const navigate = useNavigate();

  const handleDoubleClick = (month) => {
    navigate(`./${month}`);
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
      <Box ref={containerRef} display={"flex"}>
        {months?.map((month) => (
          <DataFile
            isSelected={selectedItem === month}
            onClick={() => setSelectedItem(month)}
            key={month}
            name={month}
            onDoubleClick={() => handleDoubleClick(month)}
          />
        ))}
      </Box>
    </>
  );
};

export default MonthsPage;
