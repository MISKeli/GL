import React, { useEffect, useRef, useState } from "react";
import DataFile from "./components/DataFile";
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/SystemFolder.scss";
import { useGenerateSystemFolderStructurePageQuery } from "../../features/api/folderStructureApi";

const SystemFilepage = () => {
  const params = useParams();

  const { data: folderData } = useGenerateSystemFolderStructurePageQuery({
    Year: params.year,
    Month: params.month,
  });


  const boaName = folderData?.value?.boa?.map((item) => item.books);


  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const containerRef = useRef(null);

  const handleDoubleClick = (boa) => {
    navigate(`./${boa}`);
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
        {boaName?.map((boa) => (
          <DataFile
            isSelected={selectedItem === boa}
            onClick={() => setSelectedItem(boa)}
            key={boa}
            name={boa}
            variant="sheet"
            onDoubleClick={() => handleDoubleClick(boa)}
          />
        ))}
      </Box>
    </>
  );
};

export default SystemFilepage;
