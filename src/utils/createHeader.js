export const createTableHeader = (data, columnToHide, nonEditableColumns) =>
  Object.keys(data)
    .filter((key) => key !== columnToHide) // Exclude the column you want to hide
    .map((key) => ({
      field: key,
      headerName: key,
      width: 150,
      editable: !nonEditableColumns.includes(key),
    }));
