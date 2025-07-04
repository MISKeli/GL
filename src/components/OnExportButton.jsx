import { IosShareRounded } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import React from "react";

const OnExportButton = ({ onExport, hasData, isLoading, isFetching }) => {
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={onExport}
        disabled={!hasData || isLoading || isFetching}
        startIcon={
          isLoading || isFetching ? <CircularProgress size={20} /> : <IosShareRounded />
        }
      >
        {isLoading ? "Loading..." : isFetching ? "Exporting..." : "Export"}
      </Button>
    </>
  );
};

export default OnExportButton;
