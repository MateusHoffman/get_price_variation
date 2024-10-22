import { run } from "./helpers.js";

(async () => {
  const CONFIG = {
    TICKER: "CMIG4",
    HOJE: true,
    DATA_INICIAL: "",
    DATA_FINAL: "14/11/2024",
    CHANCE_EXERCICIO: 0.3,
  };

  run(CONFIG);
})();
