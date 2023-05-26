const axios = require('axios');
const fs = require('fs');

const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5000';

axios.get(url)
  .then(response => {
    const data = response.data.map(candle => ({
      time: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
      closeTime: candle[6],
      quoteAssetVolume: candle[7],
      numberOfTrades: candle[8],
      takerBuyBaseAssetVolume: candle[9],
      takerBuyQuoteAssetVolume: candle[10],
    }));

    fs.writeFileSync('price.json', JSON.stringify(data));
    console.log('Data saved to price.json');
  })
  .catch(error => {
    console.error(error);
  });
