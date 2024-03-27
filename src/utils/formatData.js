import moment from "moment";

export const formatListPrice = (listPrice) =>
  listPrice
    .map(({ price, date }) => ({
      price,
      data: moment(date, "DD/MM/YY HH:mm").format("DD/MM/YYYY"),
      timestamp: moment(date, "DD/MM/YY HH:mm").valueOf(),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

export function getListVariation(array, periodo) {
  return array
    .slice(0, -periodo + 1)
    .map(
      (_, i) =>
        (array
          .slice(i, i + periodo)
          .reduce((acc, { price }) => acc + price, 0) /
          periodo -
          array[i].price) /
        array[i].price
    );
}

export function keepMostFrequentElements(array, percentile) {
  // Sort the array
  const sortedArray = array.slice().sort((a, b) => a - b);

  // Calculate the number of elements to remove
  const lowerCount = Math.ceil(array.length * percentile);
  const upperCount = Math.ceil(array.length * percentile);

  // Remove the elements
  const resultArray = sortedArray.slice(lowerCount, array.length - upperCount);

  return resultArray.map((n) => Math.ceil(n * 100 * 100) / 100);
}
