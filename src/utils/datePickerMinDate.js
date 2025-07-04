// import moment from "moment";

// export function getDynamicMinDate(selectedDate, daysThreshold = 10, previousMonthOpenDays = 5) {
// 	const today = moment();
// 	const date = selectedDate ? moment(selectedDate) : today;

// 	return date.date() <= daysThreshold
// 		? moment()
// 				.subtract(1, "month")
// 				.endOf("month")
// 				.subtract(previousMonthOpenDays - 1, "days")
// 		: moment().startOf("month");
// }

import moment from "moment";

export function getDynamicMinDate(daysThreshold = 10) {
  const today = moment();
  const currentYear = today.year();

  // If today is before the 10th of the current month, only allow January
  if (today.date() < daysThreshold) {
    return moment(`${currentYear}-01-01`); // Only allow January
  }

  // Otherwise, allow selection from January of the current year onwards
  return moment().startOf("year"); // January 1st of the current year
}

export function shouldDisableMonth(daysThreshold) {
  return (month) => {
    const today = moment();
    const prevMonth = today.clone().subtract(1, "month"); // Previous month
    const isBeforeThreshold = today.date() < daysThreshold; // Check if today is before threshold

    // If before threshold, only January is enabled
    if (isBeforeThreshold) {
      return (
        month.isAfter(today, "month") || // Disable all future months
        month.isSame(today, "month") || // Disable current month
        month.isSame(prevMonth, "month") || // Disable previous month
        !month.isSame(moment().month(0), "month") // Disable all except January
      );
    }

    // After threshold, enable past months but disable current & future months
    return month.isSame(today, "month") || month.isAfter(today, "month");
  };
}

// export function shouldDisableYear(year) {
//   const currentYear = moment().year();
//   const selectedMonth = moment().month(); // Get the current selected month (0 = January)

//   return (
//     year > currentYear || // Disable future years
//     (year < currentYear && selectedMonth !== 0) // Enable previous year only if it's January
//   );
// }

// // year 
// export function shouldDisableYear(year) {
//   const currentYear = moment().year();
//   const selectedMonth = moment().month(); // Get the current selected month (0 = January)

//   return (
//     year !== currentYear || // Only show the current year
//     year > currentYear || // Disable future years
//     (year < currentYear && selectedMonth !== 0) // Enable previous year only if it's January
//   );
// }
export function shouldDisableYear(year, closedDateThreshold) {
  const today = moment();
  const currentYear = today.year();
  const currentMonth = today.month(); // 0 = January
  const currentDay = today.date();
  
  // Use the passed threshold value or default to 10 if not available
  const daysThreshold = closedDateThreshold;
  
  // If we're in January AND before the threshold day, allow previous year
  if (currentMonth === 0 && currentDay <= daysThreshold) {
    return year < currentYear - 1 || year > currentYear; // Allow current year and previous year only
  }
  
  // Otherwise, only allow current year
  return year < currentYear || year > currentYear;
}
