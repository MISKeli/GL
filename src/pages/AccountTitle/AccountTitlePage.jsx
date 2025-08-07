import React, { useState } from "react";
import { useGenerateAccountTitleQuery, useImportAccountTitleMutation, useLazyGenerateAccountTitleQuery } from "../../features/api/accountTitleApi";
import useDebounce from "../../components/useDebounce";
import { info } from "../../schemas/info";
import CommonTable from "../../components/CommonTable";
import "../../styles/AccountTitle/AccountTitle.scss";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import { AllInclusive, CloudSync, PlaylistAddCheckRounded, PlaylistRemoveRounded } from "@mui/icons-material";
import { toast } from "sonner";
import useExportData from "../../components/hooks/useExportData";
import DateSearchCompoment from "../../components/DateSearchCompoment";

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

const AccountTitlePage = () => {
    const headerColumn = info.accountTitle.tableColumns;
  const debounceValue = useDebounce();

  const [params, setParams] = useState({
    Status: "",
    page: 0,
    PageSize: 25,
    PageNumber: 1,
    Search: "",
  });

  const {
    data: accountTitleData,
    isLoading: isCoaLoading,
    isFetching: isCoaFetching,
  } = useGenerateAccountTitleQuery({
    UsePagination: true,
    Status: params.Status,
    PageNumber: params.page + 1,
    PageSize: params.PageSize,
    Search: params.Search,
  });


    const [fetchExportData] = useLazyGenerateAccountTitleQuery();
    const { commonExport } = useExportData();

  const Headers = Object.keys(accountTitleData?.value?.result?.[0] || {});
  const hasData = accountTitleData?.value?.result?.length > 0;

   const [importCharging, {isLoading, isFetching }] =
      useImportAccountTitleMutation();

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
    // Handle search change from DateSearchComponent
  const handleSearchChange = (searchValue) => {
    setParams((prev) => ({
      ...prev,
      Search: searchValue,
      page: 0, // Reset to first page when searching
      PageNumber: 1,
    }));
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
          await commonExport(Headers, exportData?.value?.result, info.accountTitle.title);
          toast.success("Export completed successfully");
        } catch (err) {
          toast.error(err.message);
          console.log(err);
        }
      };

  return (
    <>
      <Box className="accountTitle">
        <Box className="accountTitle__header">
          <Typography variant="h5" className="accountTitle__header--title ">
            {info.accountTitle.title}
          </Typography>
          <Box className="accountTitle__header">
             <DateSearchCompoment
          // Disable all date-related features
          hasDate={false}
          hasImport={false}
          hasDetailed={false}
          isYearOnly={false}
          hasViewChange={false}
          updateQueryParams={false}
          onSearchChange={handleSearchChange}
          searchValue={params.Search}
          // Provide empty function for setReportData since we're not using dates
          setReportData={() => {}}
        />
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
        <Box className="accountTitle__content">
          <Box className="accountTitle__content__table">
            <CommonTable
              header={headerColumn}
              data={accountTitleData}
              rows={accountTitleData?.value?.result}
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
  );;
};

export default AccountTitlePage;
