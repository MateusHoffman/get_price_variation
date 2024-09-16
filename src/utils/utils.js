import moment from "moment";
import 'moment-business-days';

export function calculateBusinessDays(startDate, endDate) {
  // Convert dates from DD/MM/YYYY format to a format that Moment.js understands
  const start = moment(startDate, 'DD/MM/YYYY');
  const end = moment(endDate, 'DD/MM/YYYY');
  
  // Check if the dates are valid
  if (!start.isValid() || !end.isValid()) {
      throw new Error('Invalid date');
  }

  // Calculate the number of business days between start and end
  return start.businessDiff(end);
}