import moment from "moment";

// Function to format month number into full month name
export const formatMonth = (monthNumber) => {
  return moment(monthNumber, "MMM").format("MMMM").toString();
};

// Function to format year
export const formatYear = (year) => {
  return moment(year, "YYYY").format("YYYY");
};
