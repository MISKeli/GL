import React from "react";
import "../styles/NotFound.scss";
import { Box, Button } from "@mui/material";
import notfound from "../assets/images/404.svg";
import { useNavigate } from "react-router-dom";

const Notfound = () => {
  const navigate = useNavigate();

  const handleMainPage = () => {
    navigate("/");
  };
  return (
    <Box className="notfound">
      <img src={notfound} alt="notfound" />
      <Button variant="contained" onClick={handleMainPage}>
        Back to Main Page
      </Button>
    </Box>
  );
};

export default Notfound;
