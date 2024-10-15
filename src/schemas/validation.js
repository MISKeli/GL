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

export const systemSchema = yup.object().shape({
  systemName: yup.string().required("System Name is required."),
  endpoint: yup.string().required("Endpoint is required."),
  token: yup.string().required("Token is required."),
});

export const importSchema = yup.object().shape({
  syncId: yup.string().required("Sync Id is required."),
  mark1: yup.string().nullable(),
  mark2: yup.string().nullable(),
  assetCIP: yup.string().nullable(),
  accountingTag: yup.string().nullable(),
  transactionDate: yup.date(), //"YYYY-MM-DD HH:mm:ss"
  clientSupplier: yup.string().nullable(),
  accountTitleCode: yup.string().nullable(),
  accountTitle: yup.string().nullable(),
  companyCode: yup.string().nullable(),
  company: yup.string().nullable(),
  divisionCode: yup.string().nullable(),
  division: yup.string().nullable(),
  departmentCode: yup.string().nullable(),
  department: yup.string().nullable(),
  unitCode: yup.string().nullable(),
  unit: yup.string().nullable(),
  subUnitCode: yup.string().nullable(),
  subUnit: yup.string().nullable(),
  locationCode: yup.string().nullable(),
  location: yup.string().nullable(),
  poNumber: yup.number().nullable(),
  referenceNo: yup.string().nullable(),
  itemCode: yup.string().nullable(),
  itemDescription: yup.string().nullable(),
  quantity: yup.number().nullable(),
  uom: yup.string().nullable(),
  unitPrice: yup.number().nullable(),
  lineAmount: yup.number().nullable(),
  voucherJournal: yup.string().nullable(),
  accountType: yup.string().nullable(),
  drcp: yup.string().nullable(),
  assetCode: yup.string().nullable(),
  asset: yup.string().nullable(),
  serviceProviderCode: yup.string().nullable(),
  serviceProvider: yup.string().nullable(),
  boa: yup.string().nullable(),
  allocation: yup.string().nullable(),
  accountGroup: yup.string().nullable(),
  accountSubGroup: yup.string().nullable(),
  financialStatement: yup.string().nullable(),
  unitResponsible: yup.string().nullable(),
  batch: yup.string().nullable(),
  remarks: yup.string().nullable(),
  payrollPeriod: yup.string().nullable(),
  position: yup.string().nullable(),
  payrollType: yup.string().nullable(),
  payrollType2: yup.string().nullable(),
  depreciationDescription: yup.string().nullable(),
  remainingDepreciationValue: yup.string().nullable(),
  usefulLife: yup.string().nullable(),
  month: yup.string().nullable(),
  year: yup.string().nullable(),
  particulars: yup.string().nullable(),
  month2: yup.string().nullable(),
  farmType: yup.string().nullable(),
  jeanRemarks: yup.string().nullable(),
  from: yup.string().nullable(),
  changeTo: yup.string().nullable(),
  reason: yup.string().nullable(),
  checkingRemarks: yup.string().nullable(),
  boA2: yup.string().nullable(),
  system: yup.string().nullable(),
  books: yup.string().nullable(),
});
