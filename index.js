import { getAllPriceByTicker } from "./src/models/PriceModel.js"
import { formatListPrice, getListVariation, keepMostFrequentElements, messageGenerator } from "./src/utils/formatData.js";

const get_price_variation = async (config) => {
  // OBTER LISTA DE PREÇOS
  const allPrice = await getAllPriceByTicker(config.TICKER)
  // console.log('allPrice:', allPrice)
  // FORMATAR LISTA DE PREÇOS
  const allPriceFormatted = formatListPrice(allPrice)
  // console.log('allPriceFormatted:', allPriceFormatted)
  // GERAR LISTA DE VARIAÇÕES
  const listVariation = getListVariation(allPriceFormatted, config.PERIOD)
  // console.log('listVariation:', listVariation)
  // DELETADO OS VALORES MENOS FREQUENTES
  const mostFrequentElements = keepMostFrequentElements(listVariation, config.CHANCE_EXERCISED)
  // OBTER O MAIOR VALOR RETIRANDO O CHANCE_EXERCISED
  const highest = mostFrequentElements[mostFrequentElements.length - 1]
  messageGenerator(config, highest)
  // OBTER O MENOR VALOR RETIRANDO O CHANCE_EXERCISED
  const lower = mostFrequentElements[0]
  messageGenerator(config, lower)
}

const config = {
  TICKER: "CMIG4",
  PERIOD: 13,
  CHANCE_EXERCISED: 0.3,
}

get_price_variation(config)