import moment from "moment";

export const formatListPrice = (listPrice) => {
  const listPriceFormatted = listPrice
    .map((price) => {
      return {
        price: price.price,
        data: moment(price.date, "DD/MM/YY HH:mm").format("DD/MM/YYYY"),
        timestamp: moment(price.date, "DD/MM/YY HH:mm").valueOf(),
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
  return listPriceFormatted;
};

export function getListVariation(array, periodo) {
  const variacoes = [];

  for (let i = 0; i < array.length - periodo + 1; i++) {
    let soma = 0;
    for (let j = 0; j < periodo; j++) {
      soma += array[i + j].price;
    }
    const media = soma / periodo;
    const variacao = (media - array[i].price) / array[i].price; // Calcula a variação
    variacoes.push(variacao);
  }

  return variacoes;
}

export function keepMostFrequentElements(array, percentile) {
  // Sort the array
  const sortedArray = array.slice().sort((a, b) => a - b);

  // Calculate the number of elements to remove
  const lowerCount = Math.ceil(array.length * percentile);
  const upperCount = Math.ceil(array.length * percentile);

  // Remove the elements
  const resultArray = sortedArray.slice(lowerCount, array.length - upperCount);

  return resultArray.map(n => Math.ceil(n * 100 * 100) / 100);
}
