import { getAllPriceByTicker } from "./src/models/PriceModel.js"
import { formatListPrice, getListVariation, keepMostFrequentElements, messageGenerator } from "./src/utils/formatData.js";
import { calculateBusinessDays } from "./src/utils/utils.js";

const get_price_variation = async (config) => {
  // OBTER LISTA DE PREÇOS
  const allPrice = await getAllPriceByTicker(config.TICKER)
  // console.log('allPrice:', allPrice)
  // FORMATAR LISTA DE PREÇOS
  const allPriceFormatted = formatListPrice(allPrice)
  console.log('allPriceFormatted:', allPriceFormatted)
  const period = calculateBusinessDays(config.START_DATE, config.END_DATE)
  // GERAR LISTA DE VARIAÇÕES
  const listVariation = getListVariation(allPriceFormatted, period)
  // console.log('listVariation:', listVariation)
  // DELETADO OS VALORES MENOS FREQUENTES
  const mostFrequentElements = keepMostFrequentElements(listVariation, config.CHANCE_EXERCISED)
  // PREÇO MAIS RECENTE
  const currentPrice = allPriceFormatted[0]
  // OBTER O MAIOR VALOR RETIRANDO O CHANCE_EXERCISED
  const highest = mostFrequentElements[mostFrequentElements.length - 1]
  messageGenerator(config, period, highest, currentPrice)
  // OBTER O MENOR VALOR RETIRANDO O CHANCE_EXERCISED
  const lower = mostFrequentElements[0]
  messageGenerator(config, period, lower, currentPrice)
}

const config = {
  TICKER: "CMIG4",
  START_DATE: '16/09/2024',
  END_DATE: '18/10/2024',
  CHANCE_EXERCISED: 0.3,
}

get_price_variation(config)