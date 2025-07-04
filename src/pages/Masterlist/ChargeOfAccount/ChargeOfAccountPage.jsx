/* eslint-disable react/prop-types */
import { Box, Button, Typography, Chip, Tooltip } from "@mui/material";
import {
  AllInclusive,
  CloudSync,
  PlaylistAddCheckRounded,
  PlaylistRemoveRounded,
} from "@mui/icons-material";
import React, { useState } from "react";
import {
  useGenerateChargingQuery,
  useImportChargingMutation,
  useLazyGenerateChargingQuery,
} from "../../../features/api/chargeOfAccountApi";
import useDebounce from "../../../components/useDebounce";
import "../../../styles/chargeOfAccount/chargeOfAccount.scss";
import { toast } from "sonner";
import { info } from "../../../schemas/info";
import useExportData from "../../../components/hooks/useExportData";
import CommonTable from "../../../components/CommonTable";

const getChipColor = (value) => {
  switch (value) {
    case "true":
      return "success";
    case "false":
      return "error";
    case "all":
    case "":
      return "default";
    default:
      return "default";
  }
};

const getChipLabel = (value) => {
  switch (value) {
    case "true":
      return "ACTIVE";
    case "false":
      return "INACTIVE";
    case "all":
    case "":
      return "ALL";
    default:
      return "Select a Status";
  }
};

const getChipIcon = (value) => {
  switch (value) {
    case "true":
      return <PlaylistAddCheckRounded />;
    case "false":
      return <PlaylistRemoveRounded />;
    case "all":
    case "":
    default:
      return <AllInclusive />;
  }
};

const ChargeOfAccountPage = () => {
  const headerColumn = info.coa.tableColumns;
  const debounceValue = useDebounce();

  const [params, setParams] = useState({
    Status: "",
    page: 0,
    PageSize: 25,
    PageNumber: 1,
    Search: debounceValue,
  });

  const [fetchExportData] = useLazyGenerateChargingQuery();
  const { commonExport } = useExportData();

  const {
    data: coaData,
    isLoading: isCoaLoading,
    isFetching: isCoaFetching,
  } = useGenerateChargingQuery({
    UsePagination: true,
    Status: params.Status,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    Search: params.Search,
  });

  const Headers = Object.keys(coaData?.value?.result?.[0] || {});

  const hasData = coaData?.value?.result?.length > 0;

  const [importCharging, { isLoading, isFetching }] =
    useImportChargingMutation();

  const handleCycleStatus = () => {
    setParams((prev) => {
      let newStatus;
      if (prev.Status === "" || prev.Status === "all") newStatus = "true";
      else if (prev.Status === "true") newStatus = "false";
      else newStatus = "all";

      return {
        ...prev,
        Status: newStatus === "all" ? "" : newStatus,
      };
    });
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setParams((currentValue) => ({
      ...currentValue,
      page: newPage, // Update the page index
      PageNumber: newPage + 1, // Update the page number (1-based)
    }));
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newPageSize = parseInt(event.target.value, 10); // Get the new page size
    setParams((currentValue) => ({
      ...currentValue,
      PageSize: newPageSize, // Update the page size
      page: 0, // Reset to the first page
      PageNumber: 1, // Reset to page number 1
    }));
  };

  const handleImport = () => {
    importCharging()
      .unwrap()
      .then((res) => {
        // Success toast
        toast.success(res?.value);
      })
      .catch((error) => {
        // Error toast
        toast.error(
          `Sync failed: ${error.data?.message || "Unknown error occurred"}`
        );
      });
  };

  const onExport = async () => {
    try {
      const exportData = await fetchExportData({
        UsePagination: false,
      }).unwrap();
      await commonExport(Headers, exportData?.value?.result, info.coa.title);
      toast.success("Export completed successfully");
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  return (
    <>
      <Box className="coa">
        <Box className="coa__header">
          <Typography variant="h5" className="coa__header--title ">
            {info.coa.title}
          </Typography>
          <Box className="coa__header">
            <Button
              onClick={handleImport}
              disabled={isLoading || isFetching}
              variant="text"
              startIcon={<CloudSync />}
            >
              {isLoading || isFetching
                ? info.download.syncing
                : info.download.sync}
            </Button>

            <Tooltip title="Change status" arrow>
              <Chip
                label={getChipLabel(params.Status || "all")}
                color={getChipColor(params.Status || "all")}
                icon={getChipIcon(params.Status || "all")}
                variant="outlined"
                size="small"
                onClick={handleCycleStatus}
                sx={{ cursor: "pointer" }}
              />
            </Tooltip>
          </Box>
        </Box>
        <Box className="coa__content">
          <Box className="coa__content__table">
            <CommonTable
              header={headerColumn}
              data={coaData}
              rows={coaData?.value?.result}
              page={params.page}
              rowsPerPage={params.PageSize}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              isFetching={isCoaLoading}
              isLoading={isCoaFetching}
              hasData={hasData}
              onExport={onExport}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ChargeOfAccountPage;
