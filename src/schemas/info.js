import { IosShareRounded, LibraryAddRounded } from "@mui/icons-material";
import moment from "moment";

export const info = {
  role: {
    title: "Role Management",
    addButton: "Add Role",
    dialogs: {
      addTitle: "Add Role",
      updateTitle: "Update Role",
      achiveTitle: "Archive",
      restoreTitle: "Restore",
      achiveRoleTitle: "Archive Role",
      restoreRoleTitle: "Restore Role",
      permissionTitle: "Permission",
      updateDescription: "Are you sure you want to update this role?",
    },
    messages: {
      addSuccess: "Role Created Successfully.",
      updateSuccess: "Role Updated Successfully.",
      addedSuccess: "Role Added Successfully.",
      archiveSuccess: "Role Archived Successfully.",
      restoreSuccess: "Role Restored Successfully.",

      error: "Please select at least one subcategory for each main category.",
    },
    tableColumns: [
      { id: "roleName", name: "ROLE" },
      { id: "permissions", name: "PERMISSIONS" },
      { id: "addedBy", name: "ADDED BY" },
      { id: "modifiedBy", name: "MODIFIED BY" },
      { id: "action", name: "ACTIONS" },
    ],
  },

  users: {
    title: "Users Account",
    addButton: "Add User",
    dialogs: {
      addTitle: "Add Account",
      achiveTitle: "Archive",
      restoreTitle: "Restore",
      updateTitle: "Update Account",
      achiveUserTitle: "Archive User",
      restoreUserTitle: "Restore User",
    },
    messages: {
      addSuccess: "User Created Successfully",
      updateSuccess: "User Updated Successfully",
      archiveSuccess: "User Archived Successfully.",
      restoreSuccess: "User Restored Successfully.",
      passwordSuccess: "Reset Password Successfully.",
      error: "Please select at least one subcategory for each main category.",
    },
    tableColumns: [
      { id: ["idPrefix", "idNumber"], name: "ID" },
      { id: ["firstName", "middleName", "lastName"], name: "NAME" },
      { id: "username", name: "USERNAME" },
      { id: "userRole", name: "ROLE" },
      { id: "status", name: "STATUS" },
      { id: "action", name: "ACTIONS" },
    ],
  },

  system: {
    title: "System",
  },
  button: {
    importButton: { label: "import" },
    exportButton: { label: "export" },
  },

  trialbalance_title: "Trial Balance",
  systems_title: "Book of Accounts",
  setup_title: "System Setup",
  setup_add_button: "Add System",
  setup_dialog_add_title: "Add System",
  setup_dialog_update_title: "Update System",

  setup_table_columns: [
    { id: "systemName", name: "SYSTEM" },
    { id: "endpoint", name: "ENDPOINT" },
    // { id: "token", name: "TOKEN" },
    { id: "status", name: "STATUS" },
    { id: "action", name: "ACTIONS" },
  ],

  password_title: "Change Password",

  system_export_button: "Export",
  system_import_button: "Import",
  system_no_data: "No data available",

  book_purchasesBook: "Purchases Book",
  book_cashDisbursementBook: " Cash Disbursement Book",
  book_salesJournal: "Sales Journal",

  report_import_table_columns: [
    { id: "syncId", name: "ID" },
    { id: "mark1", name: "MARK 1" },
    { id: "mark2", name: "MARK 2" },
    { id: "assetCIP", name: "ASSET/CIP#" },
    { id: "accountingTag", name: "ACCOUNTING TAG" },
    { id: "transactionDate", name: "TRANSACTION DATE" },
    { id: "clientSupplier", name: "CLIENT SUPPLIER" },
    { id: "accountTitleCode", name: "ACCOUNT TITLE CODE" },
    { id: "accountTitle", name: "ACCOUNT TITLE" },
    { id: "companyCode", name: "COMPANY CODE" },
    { id: "company", name: "COMPANY" },
    { id: "divisionCode", name: "DIVISION CODE" },
    { id: "division", name: "DIVISION" },
    { id: "departmentCode", name: "DEPARTMENT CODE" },
    { id: "department", name: "DEPARTMENT" },
    { id: "unitCode", name: "UNIT CODE" },
    { id: "unit", name: "UNIT" },
    { id: "subUnitCode", name: "SUB UNIT CODE" },
    { id: "subUnit", name: "SUB UNIT" },
    { id: "locationCode", name: "LOCATION CODE" },
    { id: "location", name: "LOCATION" },
    { id: "poNumber", name: "PO NO" },
    { id: "rrNumber", name: "RR NO" },
    { id: "referenceNo", name: "REFERENCE NO" },
    { id: "itemCode", name: "ITEM CODE" },
    { id: "itemDescription", name: "ITEM DESCRIPTION" },
    { id: "quantity", name: "QUANTITY" },
    { id: "uom", name: "UOM" },
    { id: "unitPrice", name: "UNIT PRICE" },
    { id: "lineAmount", name: "LINE AMOUNT" },
    { id: "voucherJournal", name: "VOURCHER/JOURNAL" },
    { id: "accountType", name: "ACCOUNT TYPE" },
    { id: "drcr", name: "DR / CR" },
    { id: "assetCode", name: "ASSET CODE" },
    { id: "asset", name: "ASSET" },
    { id: "serviceProviderCode", name: "SERVICE PROVIDER CODE" },
    { id: "serviceProvider", name: "SERVICE PROVIDER" },
    { id: "boa", name: "BOA" },
    { id: "allocation", name: "ALLOCATION" },
    { id: "accountGroup", name: "ACCOUNT GROUP" },
    { id: "accountSubGroup", name: "ACCOUNT SUB GROUP" },
    { id: "financialStatement", name: "FINANCIAL STATEMENT" },
    { id: "unitResponsible", name: "UNIT RESPONSIBLE" },
    { id: "batch", name: "BATCH" },
    { id: "remarks", name: "REMARK" },
    { id: "payrollPeriod", name: "PAYROLL PERIOD" },
    { id: "position", name: "POSITION" },
    { id: "payrollType", name: "PAYROLL TYPE" },
    { id: "payrollType2", name: "PAYROLL TYPE 2" },
    { id: "depreciationDescription", name: "DESPRECIATION DESCRIPTION" },
    { id: "remainingDepreciationValue", name: "REMAINING DEPRECIATION VALUE" },
    { id: "usefulLife", name: "USEFUL LIFE" },
    { id: "month", name: "MONTH" },
    { id: "year", name: "YEAR" },
    { id: "particulars", name: "PARTICULARS" },
    { id: "month2", name: "MONTH 2" },
    { id: "farmType", name: "FARM TYPE" },
    { id: "jeanRemarks", name: "JEAN REMARKS" },
    { id: "from", name: "FROM" },
    { id: "changeTo", name: "CHANGE TO" },
    { id: "reason", name: "REASON" },
    { id: "checkingRemarks", name: "CHEACKING REMARKS" },
    { id: "bankName", name: "BANK NAME" },
    { id: "chequeNumber", name: "CHEQUE NO" },
    { id: "chequeVoucherNumber", name: "CHEQUE VOUCHER NO" },
    { id: "boA2", name: "BOA 2" },
    { id: "system", name: "SYSTEM" },
    { id: "books", name: "BOOKS" },
  ],

  // I edited the company, department , and location...
  custom_header: {
    "Sync Id": "syncId",
    "Mark": "mark1",
    "Mark 2": "mark2",
    "Asset / CIP #": "assetCIP",
    "Accounting Tag": "accountingTag",
    "Transaction Date": "transactionDate",
    "Supplier / Customer": "clientSupplier",
    "Account Title Code": "accountTitleCode",
    "Account Title": "accountTitle",
    "Company Code": "companyCode",
    "Company": "company",
    "Division Code": "divisionCode",
    "Division": "division",
    "Department Code": "departmentCode",
    "Department": "department",
    "Unit Code": "unitCode",
    "Unit": "unit",
    "Sub Unit Code": "subUnitCode",
    "Sub Unit": "subUnit",
    "Location Code": "locationCode",
    "Location": "location",
    "PO No.": "poNumber",
    "RR No.": "rrNumber",
    "Reference No.": "referenceNo",
    "Item Code": "itemCode",
    "Description": "itemDescription",
    "Quantity": "quantity",
    "unit": "uom",
    "Unit Price": "unitPrice",
    "Line Amount": "lineAmount",
    "Voucher / GJ No.": "voucherJournal",
    "Account Type": "accountType",
    "DR / CR": "drcr",
    "Asset Code": "assetCode",
    "Asset": "asset",
    "Service Provider Code": "serviceProviderCode",
    "Service Provider": "serviceProvider",
    "BOA": "boa",
    "Allocation": "allocation",
    "Account Group": "accountGroup",
    "Account SubGroup": "accountSubGroup",
    "Financial Statement": "financialStatement",
    "Unit Responsible": "unitResponsible",
    "Batch": "batch",
    "Remarks": "remarks",
    "Payroll Period": "payrollPeriod",
    "Position": "position",
    "Payroll Type 1": "payrollType",
    "Payroll Type 2": "payrollType2",
    "Additional Description for DEPR": "depreciationDescription",
    "Remaining BV for DEPR": "remainingDepreciationValue",
    "Useful Life": "usefulLife",
    "Month": "month",
    "Year": "year",
    "Particulars": "particulars",
    "Month 2": "month2",
    "Farm Type": "farmType",
    "Jean Remarks": "jeanRemarks",
    "From": "from",
    "Changed To": "changeTo",
    "Reason": "reason",
    "Checking Remarks": "checkingRemarks",
    "Bank Name": "bankName",
    "Cheque No.": "chequeNumber",
    "Cheque Voucher No.": "chequeVoucherNumber",
    "BOA 2": "boA2",
    "System": "system",
    "Books": "books",
  },

  Purchases_Book: [
    { id: "glDate", name: "GL DATE" },
    { id: "transactionDate", name: "TRANSACTION DATE" },
    { id: "nameOfSupplier", name: "NAME OF SUPPLIER" },
    { id: "description", name: "DESCRIPTION" },
    { id: "poNumber", name: "PO #" },
    { id: "rrNumber", name: "RR #" },
    { id: "apv", name: "APV" },
    { id: "receiptNumber", name: "RECEIPT #" },
    { id: "amount", name: "AMOUNT" },
    { id: "nameOfAccount", name: "NAME OF ACCOUNT" },
    {
      id: "rawMaterials",
      name: "NAME OF ACCOUNT",
      subItems: [
        { id: "debit", name: "DEBIT" },
        { id: "credit", name: "CREDIT" },
      ],
    },
    { id: "system", name: "SYSTEMS" },
  ],

  Purchases_Book_Export: [
    "GL DATE",
    "TRANSACTION DATE",
    "NAME OF SUPPLIER",
    "DESCRIPTION",
    "PO #",
    "RR #",
    "APV",
    "RECEIPT #",
    "AMOUNT",
    "NAME OF ACCOUNT",
    "DEBIT",
    "CREDIT",
  ],

  sales_journal: [
    { id: "date", name: "DATE" },
    { id: "customerName", name: "CUSTOMER NAME" },
    { id: "referenceNumber", name: "REFERENCE NO." },
    { id: "lineAmount", name: "AMOUNT" },
    { id: "chartOfAccount", name: "CHART OF ACCOUNTS" },
    { id: "system", name: "SYSTEMS" },
    {
      id: "chartOfAccount",
      name: "CHART OF ACCOUNTS",
      subItems: [
        { id: "debit", name: "DEBIT" },
        { id: "credit", name: "CREDIT" },
      ],
    },
  ],

  sale_book_Export: [
    "DATE",
    "CUSTOMER NAME",
    "REFERENCE NO.",
    "AMOUNT",
    "CHART OF ACCOUNTS",
    "DEBIT",
    "CREDIT",
  ],

  cash_disbursement_book: [
    { id: "chequeDate", name: "CHEQUE DATE" },
    { id: "bank", name: "BANK" },
    { id: "cvNumber", name: "CV NO." },
    { id: "chequeNumber", name: "CHEQUE NO." },
    { id: "payee", name: "PAYEE" },
    { id: "description", name: "DESCRIPTIONS" },
    { id: "tagNumber", name: "TAG NO." },
    { id: "apvNumber", name: "APV NO." },
    { id: "accountName", name: "ACCOUNT NAME" },
    {
      id: "accountName1",
      name: "ACCOUNT NAME",
      subItems: [
        { id: "debitAmount", name: "DEBIT" },
        { id: "creditAmount", name: "CREDIT" },
      ],
    },
    { id: "system", name: "SYSTEMS" },
  ],

  trial_balance: [
    // { id: "chequeDate", name: "ACCOUNT CODE" },
    { id: "chartOfAccount", name: "ACCOUNT NAME" },
    { id: "debit", name: "DEBIT" },
    { id: "credit", name: "CREDIT" },
  ],

  trial_balance_export: ["ACCOUNT NAME", "DEBIT", "CREDIT"],

  journal_book: [
    { id: "date", name: "DATE" },
    { id: "referenceNumber", name: "REF NO." },
    { id: "particulars", name: "PARTICULAR" },
    { id: "debit", name: "DEBIT" },
    { id: "credit", name: "CREDIT" },
    { id: "system", name: "SYSTEMS" },
  ],
  journal_book_export: ["DATE", "REF NO.", "PARTICULAR", "DEBIT", "CREDIT"],
  general_ledger_book: [
    { id: "code", name: "CODE" },
    { id: "nameOfAccount", name: "NAME OF ACCOUNT" },
    { id: "date", name: "DATE" },
    { id: "reference", name: "REFERENCE" },
    { id: "journal", name: "JOURNAL" },
    { id: "transactionDescription", name: "TRANSACTION DESCRIPTION" },
    { id: "debit", name: "DEBIT" },
    { id: "credit", name: "CREDIT" },
  ],

  cash_receipts_book: [
    { id: "date", name: "DATE" },
    { id: "particulars", name: "PARTICULAR" },
    { id: "tin", name: "TIN" },
    { id: "reference", name: "REF NO." },
    {
      id: "cash",
      name: "CASH",
      subItems: [
        { id: "cibDebit", name: "CIB-DEBIT" },
        { id: "amount", name: "AMOUNT" },
      ],
    },
    { id: "system", name: "SYSTEMS" },

    { id: "accountReceivables", name: "ACCOUNT RECEIVABLE" },
    {
      id: "sales",
      name: "SALES",
      subItems: [
        { id: "exemptSale", name: "EXEMPT SALE" },
        { id: "zeroRated", name: "ZERO-RATED" },
        { id: "taxable", name: "TAXABLE" },
      ],
    },
    { id: "outputTax", name: "OUTPUT TAX" },
    { id: "creditableWtax", name: "CREDITABLE WTAX" },
    { id: "totalReceipt", name: "TOTAL RECEIPTS (COH) DEBIT" },
    { id: "cashOnHandDebit", name: "CASH ON HAND DEBIT" },
    {
      id: "clarificationOfSale",
      name: "CLARIFICATION OF SALE",
      subItems: [
        { id: "goods", name: "GOODS" },
        { id: "service", name: "SERVICE" },
      ],
    },
  ],
  cash_disbursement_Export: [
    "CHEQUE DATE",
    "BANK",
    "CV NO.",
    "CHEQUE NO.",
    "PAYEE",
    "DESCRIPTIONS",
    "TAG NO.",
    "APV NO.",
    "ACCOUNT NAME",
    "DEBIT",
    "CREDIT",
  ],

  cash_disbursement_book_horizontal: [
    { id: "chequeDate", name: "CHEQUE DATE" },
    { id: "bank", name: "BANK" },
    { id: "cvNumber", name: "CV NO." },
    { id: "chequeNumber", name: "CHEQUE NO." },
    { id: "payee", name: "PAYEE" },
    { id: "description", name: "DESCRIPTIONS" },
    { id: "tagNumber", name: "TAG NO." },
    { id: "apvNumber", name: "APV NO." },
  ],
  Purchases_Book_horizontal: [
    { id: "glDate", name: "GL DATE" },
    { id: "transactionDate", name: "TRANSACTION DATE" },
    { id: "nameOfSupplier", name: "NAME OF SUPPLIER" },
    { id: "description", name: "DESCRIPTION" },
    { id: "poNumber", name: "PO #" },
    { id: "rrNumber", name: "RR #" },
    { id: "apv", name: "APV" },
    { id: "receiptNumber", name: "RECEIPT #" },
    // { id: "amount", name: "AMOUNT" },
  ],
};
