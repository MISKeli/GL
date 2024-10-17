export const info = {
  users_title: "Users Account",
  users_add_button: "Add user",
  users_dialog_add_title: "Add Account",
  users_dialog_update_title: "Update Acount",

  users_table_columns: [
    { id: ["idPrefix", "idNumber"], name: "ID" },
    { id: ["firstName", "middleName", "lastName"], name: "NAME" },
    { id: "username", name: "USERNAME" },
    { id: "userRole", name: "ROLE" },
    { id: "status", name: "STATUS" },
    { id: "action", name: "ACTIONS" },
  ],

  role_title: "Role Management",
  role_add_button: "Add Role",
  role_dialog_add_title: "Add Role",
  role_dialog_update_title: "Update Role",
  role_dialog_permission_title: "Permission",
  role_add_message_response: "Role Created Successfully",
  role_update_message_response: "Role Updated Successfully",
  role_error_massage_response:
    "Please select at least one subcategory for each main category.",

  role_table_columns: [
    { id: "roleName", name: "ROLE" },
    { id: "permissions", name: "PERMISSIONS" },
    { id: "addedBy", name: "ADDED BY" },
    { id: "modifiedBy", name: "MODIFIED BY" },

    { id: "action", name: "ACTIONS" },
  ],

  setup_title: "System Setup",
  setup_add_button: "Add System",
  setup_dialog_add_title: "Add System",
  setup_dialog_update_title: "Update System",

  setup_table_columns: [
    { id: "systemName", name: "SYSTEM" },
    { id: "endpoint", name: "ENDPOINT" },
    { id: "token", name: "TOKEN" },
    { id: "status", name: "STATUS" },
    { id: "action", name: "ACTIONS" },
  ],

  password_title: "Change Password",

  system_UM_title: "Ultra Maverick Dry",
  system_ymir_title: "Ymir",
  system_arcana_title: "Arcana",
  system_ElixirETD_title: "Elixir ETD",
  system_ElixirPharmacy_title: "Elixir Pharmacy",
  system_fisto_title: "Fisto",

  system_export_button: "Export",
  system_import_button: "Import",
  system_no_data: "No data available",

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
    { id: "referenceNo", name: "REFERENCE NO" },
    { id: "itemCode", name: "ITEM CODE" },
    { id: "itemDescription", name: "ITEM DESCRIPTION", width: "250px" },
    { id: "quantity", name: "QUANTITY" },
    { id: "uom", name: "UOM" },
    { id: "unitPrice", name: "UNIT PRICE" },
    { id: "lineAmount", name: "LINE AMOUNT" },
    { id: "voucherJournal", name: "VOURCHER/JOURNAL" },
    { id: "accountType", name: "ACCOUNT TYPE" },
    { id: "drcp", name: "DR/CP" },
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
    { id: "boA2", name: "BOA 2" },
    { id: "system", name: "SYSTEM" },
    { id: "books", name: "BOOKS" },
  ],

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
    "Reference No.": "referenceNo",
    "Item Code": "itemCode",
    "Description": "itemDescription",
    "Quantity": "quantity",
    "unit": "uom", // Assuming this is the unit of measure (UOM)
    "Unit Price": "unitPrice",
    "Line Amount": "lineAmount",
    "Voucher / GJ No.": "voucherJournal",
    "Account Type": "accountType",
    "DR / CR": "drcp",
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
    "BOA 2": "boA2",
    "System": "system",
    "Books": "books",
  },
};
