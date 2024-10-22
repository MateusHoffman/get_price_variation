import moment from "moment";
import "moment-business-days"; // Importa a biblioteca moment-business-days

// Configura o locale para o Brasil
moment.locale("pt-br");

async function fetchAPI(url, options) {
  const maxAttempts = 999;
  const backoffTime = 1000; // 1 segundo
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return await response.json();
      } else {
        // Lidando com código de status 429
        if (response.status === 429) {
          const cooldown = 3000 + attempt * 1000; // 3 segundos + 1 segundo por tentativa
          await delay(cooldown);
          attempt++;
          continue; // Tentar novamente
        }

        // Lidando com erro de servidor
        if (response.status >= 500 && attempt === 0) {
          await delay(backoffTime);
        }

        throw new Error(`Error on request to ${url}: ${response.statusText}`);
      }
    } catch (error) {
      // Implementa jitter no atraso em caso de erro
      if (attempt < maxAttempts - 1) {
        const jitter = Math.random() * 100; // Jitter aleatório entre 0-100ms
        const delayTime = backoffTime * Math.pow(2, attempt) + jitter;
        await delay(delayTime);
      }
      attempt++;
    }
  }
  throw new Error(`Failed to fetch ${url} after ${maxAttempts} attempts`);
}

// Função para criar um atraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPriceHistory(ticker) {
  const url = "https://statusinvest.com.br/acao/tickerpricerange";
  const headers = { "User-Agent": "Mozilla" };
  const body = new URLSearchParams({
    ticker,
    start: "1000-01-01",
    end: "3000-01-01",
  });

  const response = await fetchAPI(url, { method: "POST", headers, body });
  return response?.data[0]?.prices || [];
}

// Cria um objeto com preços em intervalos definidos
function createPricesObject(pricesArray, diasUteisAnual) {
  const result = {};
  const totalElements = pricesArray.length;

  for (let i = 1; i <= Math.ceil(totalElements / diasUteisAnual); i++) {
    result[i] = pricesArray.slice(0, diasUteisAnual * i); // Usa slice para pegar os primeiros 246 * i elementos
  }

  return result;
}

// Calcula a variação percentual entre os preços
function getListVariation(array, periodo) {
  const variations = [];

  for (let index = periodo; index < array.length; index++) {
    const initialPrice = array[index].value; // Preço inicial
    const finalPrice = array[index - periodo].value; // Preço final

    // Cálculo da variação percentual
    const variation = ((finalPrice / initialPrice - 1) * 100).toFixed(2); // Arredonda para 2 casas decimais

    // Adiciona a variação ao array se não for NaN
    if (!isNaN(variation)) {
      variations.push(parseFloat(variation)); // Converte a string para número
    }
  }

  return variations;
}

// Remove elementos menos frequentes com base em um percentual
function keepMostFrequentElements(array, percentile) {
  const sortedArray = array.slice().sort((a, b) => a - b);
  const lowerCount = Math.ceil(array.length * percentile);
  const upperCount = Math.ceil(array.length * percentile);

  // Remove os elementos menos frequentes
  return sortedArray
    .slice(lowerCount, array.length - upperCount)
    .map((num) => parseFloat(num.toFixed(2)));
}

// Calcula a média de um array
function calcularMedia(array) {
  if (array.length === 0) {
    throw new Error("O array não pode estar vazio.");
  }

  const soma = array.reduce((acc, valor) => acc + valor, 0);
  return soma / array.length;
}

// Função principal
export async function run(CONFIG) {
  const FIXO = {
    DIAS_UTEIS_ANUAL: 246,
  };

  const dataInicial = moment(
    CONFIG.HOJE ? moment().format("DD/MM/YYYY") : CONFIG.DATA_INICIAL,
    "DD/MM/YYYY"
  );
  const dataFinal = moment(CONFIG.DATA_FINAL, "DD/MM/YYYY");

  const diasUteisEntreDatas = dataInicial.businessDiff(dataFinal);

  const pricesData = await fetchPriceHistory(CONFIG.TICKER);
  const formattedPrices = pricesData
    .map((e) => ({
      value: e.price,
      date: moment(e.date, "DD/MM/YY HH:mm").format("DD/MM/YYYY"),
      timestamp: moment(e.date, "DD/MM/YY HH:mm").valueOf(),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const pricesObject = createPricesObject(
    formattedPrices,
    FIXO.DIAS_UTEIS_ANUAL
  );

  let arrayHighest = [];
  let arrayLower = [];

  // Calcula as variações e armazena os elementos mais frequentes
  for (const key in pricesObject) {
    const priceArray = pricesObject[key];
    const listVariation = getListVariation(priceArray, diasUteisEntreDatas);

    const mostFrequentElements = keepMostFrequentElements(
      listVariation,
      CONFIG.CHANCE_EXERCICIO
    );

    if (mostFrequentElements.length) {
      arrayHighest.push(mostFrequentElements[mostFrequentElements.length - 1]);
      arrayLower.push(mostFrequentElements[0]);
    }
  }

  const avgHighest = calcularMedia(arrayHighest);
  const strikeHighest = (
    formattedPrices[0].value *
    (1 + avgHighest / 100)
  ).toFixed(2);

  const avgLower = calcularMedia(arrayLower);
  const strikeLower = (formattedPrices[0].value * (1 + avgLower / 100)).toFixed(
    2
  );
  console.log(
    `Faça VENDA DE CAL com strike MAIOR OU IGUAL a R$ ${strikeHighest}`
  );
  console.log(
    `Faça VENDA DE PUT com strike MENOR OU IGUAL a R$ ${strikeLower}`
  );

  console.log("----------------------------------------------------");

  console.log(
    `VENDA DE CAL - Período: ${diasUteisEntreDatas} dias uteis - Variação média: ${avgHighest.toFixed(
      2
    )} `
  );
  console.log(
    `VENDA DE PUT - Período: ${diasUteisEntreDatas} dias uteis - Variação média: ${-avgLower.toFixed(
      2
    )} `
  );
}
