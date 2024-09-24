import * as yup from "yup";
export const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required."),
  password: yup.string().required("Password is required."),
});

export const userSchema = yup.object().shape({
  idPrefix: yup.string().required("Id Prefix is required."),
  idNumber: yup.string().required("Id Number is required."),
  firstName: yup.string().required("First Name is required."),
  lastName: yup.string().required("Last Name is required."),
  userRoleId: yup.object().required("User role Id is required."),
  sex: yup.string().required("Sex is required."),
  username: yup.string().required("Username is required."),
  // password: yup.string().required("Password is required."),
});
export const roleSchema = yup.object().shape({
  roleName: yup.string().required("Role Name is required."),
  permissions: yup
    .array()
    .of(yup.string().required())
    .min(1, "At least one permission is required"),
});
export const changePasswordSchema = yup.object().shape({
  oldPassword: yup.string().required("Old Password is required."),
  newPassword: yup.string().required("New Password is required."),
});

export const reportSchema = yup.object().shape({
  DateFrom: yup.string().required("Date is required."),
  DateTo: yup.string().required("Date is required."),
});

export const importSchema = yup.object().shape({
  // syncId
  mark1: yup.string(),
  mark2: yup.string(),
  assetCIP: yup.string(),
  accountingTag: yup.string(),
  transactionDate: yup.date(),
  clientSupplier: yup.string(),
  accountTitleCode: yup.string(),
  accountTitle: yup.string(),
  companyCode: yup.string(),
  company: yup.string(),
  divisionCode: yup.string(),
  division: yup.string(),
  departmentCode: yup.string(),
  department: yup.string(),
  unitCode: yup.string(),
  unit: yup.string(),
  subUnitCode: yup.string(),
  subUnit: yup.string(),
  locationCode: yup.string(),
  location: yup.string(),
  poNumber: yup.string(),
  referenceNo: yup.string(),
  itemCode: yup.string(),
  itemDescription: yup.string(),
  //quantity
  uom: yup.string(),
  //unitPrice
  //lineAmount
  voucherJournal: yup.string(),
  accountType: yup.string(),
  drcp: yup.string(),
  assetCode: yup.string(),
  asset: yup.string(),
  serviceProviderCode: yup.string(),
  serviceProvider: yup.string(),
  boa: yup.string(),
  allocation: yup.string(),
  accountGroup: yup.string(),
  accountSubGroup: yup.string(),
  financialStatement: yup.string(),
  unitResponsible: yup.string(),
  batch: yup.string(),
  remarks: yup.string(),
  payrollPeriod: yup.string(),
  position: yup.string(),
  payrollType: yup.string(),
  payrollType2: yup.string(),
  depreciationDescription: yup.string(),
  remainingDepreciationValue: yup.string(),
  usefulLife: yup.string(),
  month: yup.string(),
  year: yup.string(),
  particulars: yup.string(),
  month2: yup.string(),
  farmType: yup.string(),
  jeanRemarks: yup.string(),
  from: yup.string(),
  changeTo: yup.string(),
  reason: yup.string(),
  checkingRemarks: yup.string(),
  boA2: yup.string(),
  system: yup.string(),
  books: yup.string(),
});
