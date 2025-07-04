import moment from "moment";

export const transformRows = (data) => {
  return data.map((row, index) => ({
    ...row,
    id: row.id ?? index, // Unique identifier
    syncId: row.syncId ? row.syncId.toString() : "",
    mark1: row.mark1 ? row.mark1.toString() : "",
    mark2: row.mark2 ? row.mark2.toString() : "",
    assetCIP: row.assetCIP ? row.assetCIP.toString() : "",
    accountingTag: row.accountingTag ? row.accountingTag.toString() : "",
    transactionDate: row.transactionDate
      ? moment(row.transactionDate).format("YYYY-MM-DD")
      : null,
    clientSupplier: row.clientSupplier ? row.clientSupplier.toString() : "",
    accountTitleCode: row.accountTitleCode
      ? row.accountTitleCode.toString()
      : "",
    accountTitle: row.accountTitle ? row.accountTitle.toString() : "",
    companyCode: row.companyCode ? row.companyCode.toString() : "",
    company: row.company ? row.company.toString() : "",
    divisionCode: row.divisionCode ? row.divisionCode.toString() : "",
    division: row.division ? row.division.toString() : "",
    departmentCode: row.departmentCode ? row.departmentCode.toString() : "",
    department: row.department ? row.department.toString() : "",
    unitCode: row.unitCode ? row.unitCode.toString() : "",
    unit: row.unit ? row.unit.toString() : "",
    subUnitCode: row.subUnitCode ? row.subUnitCode.toString() : "",
    subUnit: row.subUnit ? row.subUnit.toString() : "",
    locationCode: row.locationCode ? row.locationCode.toString() : "",
    location: row.location ? row.location.toString() : "",
    poNumber: row.poNumber ? row.poNumber.toString() : "",
    rrNumber: Array.isArray(row.rrNumber)
      ? row.rrNumber.join(", ") // Convert to a comma-separated string
      : row.rrNumber
      ? row.rrNumber.toString()
      : "",
    referenceNo: row.referenceNo ? row.referenceNo.toString() : "",
    itemCode: row.itemCode ? row.itemCode.toString() : "",
    itemDescription: row.itemDescription ? row.itemDescription.toString() : "",
    quantity: row.quantity || 0,
    uom: row.uom ? row.uom.toString() : "",
    unitPrice: row.unitPrice || 0,
    lineAmount: row.lineAmount || 0,
    voucherJournal: row.voucherJournal ? row.voucherJournal.toString() : "",
    accountType: row.accountType ? row.accountType.toString() : "",
    drcr: row.drcr ? row.drcr.toString() : "",
    assetCode: row.assetCode ? row.assetCode.toString() : "",
    asset: row.asset ? row.asset.toString() : "",
    serviceProviderCode: row.serviceProviderCode
      ? row.serviceProviderCode.toString()
      : "",
    serviceProvider: row.serviceProvider ? row.serviceProvider.toString() : "",
    boa: row.boa ? row.boa.toString() : "",
    allocation: row.allocation ? row.allocation.toString() : "",
    accountGroup: row.accountGroup ? row.accountGroup.toString() : "",
    accountSubGroup: row.accountSubGroup ? row.accountSubGroup.toString() : "",
    financialStatement: row.financialStatement
      ? row.financialStatement.toString()
      : "",
    unitResponsible: row.unitResponsible ? row.unitResponsible.toString() : "",
    batch: row.batch ? row.batch.toString() : "",
    lineDescription: row.lineDescription ? row.lineDescription.toString() : "",
    payrollPeriod: row.payrollPeriod ? row.payrollPeriod.toString() : "",
    position: row.position ? row.position.toString() : "",
    payrollType: row.payrollType ? row.payrollType.toString() : "",
    payrollType2: row.payrollType2 ? row.payrollType2.toString() : "",
    depreciationDescription: row.depreciationDescription
      ? row.depreciationDescription.toString()
      : "",
    remainingDepreciationValue: row.remainingDepreciationValue
      ? row.remainingDepreciationValue.toString()
      : "",
    usefulLife: row.usefulLife ? row.usefulLife.toString() : "",
    month: row.month ? row.month.toString() : "",
    year: row.year ? row.year.toString() : "",
    particulars: row.particulars ? row.particulars.toString() : "",
    month2: row.month2 ? row.month2.toString() : "",
    farmType: row.farmType ? row.farmType.toString() : "",
    jeanRemarks: row.jeanRemarks ? row.jeanRemarks.toString() : "",
    from: row.from ? row.from.toString() : "",
    changedTo: row.changedTo ? row.changedTo.toString() : "",
    reason: row.reason ? row.reason.toString() : "",
    checkingRemarks: row.checkingRemarks ? row.checkingRemarks.toString() : "",
    bankName: row.bankName ? row.bankName.toString() : "",
    chequeNumber: row.chequeNumber ? row.chequeNumber.toString() : "",
    chequeVoucherNumber: row.chequeVoucherNumber
      ? row.chequeVoucherNumber.toString()
      : "",
    boA2: row.boA2 ? row.boA2.toString() : "",
    chequeDate: row.chequeDate
      ? moment(row.chequeDate).format("YYYY-MM-DD")
      : null,
    releasedDate: row.releasedDate
      ? moment(row.releasedDate).format("YYYY-MM-DD")
      : null,

    system: row.system ? row.system.toString() : "",
    books: row.books ? row.books.toString() : "",
    bookName: row.bookName ? row.bookName.toString() : "",
  }));
};
