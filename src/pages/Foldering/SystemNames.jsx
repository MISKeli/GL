import React, { createContext, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useGenerateSystemFolderStructurePageQuery } from "../../features/api/folderStructureApi";

import PurchasesBookFolder from "../BOA/FolderStructure/PurchasesBookFolder";
import { useDispatch, useSelector } from "react-redux";
import CashDisbursementBookFolder from "../BOA/FolderStructure/CashDisbursementBookFolder";
import SalesJournalFolder from "../BOA/FolderStructure/SalesJournalFolder";
import CashReceiptJournalFolder from "../BOA/FolderStructure/CashReceiptJournalFolder";
import JournalBookFolder from "../BOA/FolderStructure/JournalBookFolder";

export const SystemNameContext = createContext(null);

const SystemNames = () => {
  const param = useParams();

  const page = useSelector((state) => state.auth.pageNumber);
  const pageSize = useSelector((state) => state.auth.pageSize);

  const {
    data: folderData,
    isLoading,
    isFetching,
  } = useGenerateSystemFolderStructurePageQuery({
    Year: param.year,
    Month: param.month,
    Boa: param.boaName,
    UsePagination: true,
    PageNumber: page + 1,
    PageSize: pageSize,
  });
  //console.log("🚀 ~ SystemNames ~ folderData:", folderData);

  

  const { year, month, boaName } = param;
  //console.log("🚀 ~ SystemNames ~ boaName:", boaName);
  const { isHorizontalView } = useOutletContext();

  if (boaName === "Purchases Book") {
    return (
      <PurchasesBookFolder
        data={folderData}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    );
  } else if (boaName === "Cash Disbursement Book") {
    return (
      <CashDisbursementBookFolder
        data={folderData}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    );
  } else if (boaName === "Sales Journal") {
    return (
      <SalesJournalFolder
        data={folderData}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    );
  } else if (boaName === "Cash Receipt Journal") {
    return (
      <CashReceiptJournalFolder
        data={folderData}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    );
  } else if (boaName === "Journal Book") {
    return (
      <JournalBookFolder
        data={folderData}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    );
  }
};

export default SystemNames;
