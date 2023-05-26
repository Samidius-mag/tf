const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const rawData = fs.readFileSync('price.json');
const data = JSON.parse(rawData).map(candle => ({
  open: parseFloat(candle.open),
  high: parseFloat(candle.high),
  low: parseFloat(candle.low),
  close: parseFloat(candle.close),
  volume: parseFloat(candle.volume),
}));

// Подготовка данных
const prices = data.map(candle => candle.close);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);
const normalizedPrices = prices.map(price => (price - minPrice) / (maxPrice - minPrice));

const windowSize = 720;
const input = [];
const output = [];

for (let i = 0; i < normalizedPrices.length - windowSize; i++) {
  const window = normalizedPrices.slice(i, i + windowSize);
  input.push(window);
  output.push(normalizedPrices[i + windowSize]);
}

const inputTensor = tf.tensor2d(input);
const outputTensor = tf.tensor1d(output);

// Создание модели
const model = tf.sequential();
model.add(tf.layers.dense({ units: 256, inputShape: [windowSize], activation: 'relu' }));
model.add(tf.layers.dense({ units: 2, activation: 'linear' }));
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

// Обучение модели
const epochs = 100;
const batchSize = 128;

model.fit(inputTensor, outputTensor, { epochs, batchSize })
  .then(() => {
    // Прогнозы цены
    const predict = (input, hours) => {
      const normalizedInput = input.map(price => (price - minPrice) / (maxPrice - minPrice));
      const window = normalizedInput.slice(-windowSize);
      const inputTensor = tf.tensor2d([window]);
      const predictedNormalizedPrice = model.predict(inputTensor).dataSync()[0];
      const predictedPrice = predictedNormalizedPrice * (maxPrice - minPrice) + minPrice;
      return predictedPrice * Math.pow(1.01, hours);
    };

    console.log('Price predictions:');
    console.log(`1 hour: ${predict(prices.slice(-windowSize), 1)}`);
    console.log(`4 hours: ${predict(prices.slice(-windowSize), 4)}`);
    console.log(`12 hours: ${predict(prices.slice(-windowSize), 12)}`);
    console.log(`24 hours: ${predict(prices.slice(-windowSize), 24)}`);

    // Прогнозы тренда
    const trend = (input, hours) => {
      const normalizedInput = input.map(price => (price - minPrice) / (maxPrice - minPrice));
      const window = normalizedInput.slice(-windowSize);
      const inputTensor = tf.tensor2d([window]);
      const predictedNormalizedPrice = model.predict(inputTensor).dataSync()[0];
      const predictedPrice = predictedNormalizedPrice * (maxPrice - minPrice) + minPrice;
      return predictedPrice > input[input.length - 1] ? 'up' : 'down';
    };

    console.log('Trend predictions:');
    console.log(`1 hour: ${trend(prices.slice(-windowSize), 1)}`);
    console.log(`4 hours: ${trend(prices.slice(-windowSize), 4)}`);
    console.log(`12 hours: ${trend(prices.slice(-windowSize), 12)}`);
    console.log(`24 hours: ${trend(prices.slice(-windowSize), 24)}`);

    // Прогнозы точек разворота
    const reversalPoints = (input, hours) => {
      const normalizedInput = input.map(price => (price - minPrice) / (maxPrice - minPrice));
      const window = normalizedInput.slice(-windowSize);
      const inputTensor = tf.tensor2d([window]);
      const predictedNormalizedPrice = model.predict(inputTensor).dataSync()[0];
      const predictedPrice = predictedNormalizedPrice * (maxPrice - minPrice) + minPrice;
      const currentPrice = input[input.length - 1];
      const threshold = 0.01;
      if (predictedPrice > currentPrice * (1 + threshold)) {
        return 'up';
      } else if (predictedPrice < currentPrice * (1 - threshold)) {
        return 'down';
      } else {
        return 'none';
      }
    };

    console.log('Reversal point predictions:');
    console.log(`1 hour: ${reversalPoints(prices.slice(-windowSize), 1)}`);
    console.log(`4 hours: ${reversalPoints(prices.slice(-windowSize), 4)}`);
    console.log(`12 hours: ${reversalPoints(prices.slice(-windowSize), 12)}`);
    console.log(`24 hours: ${reversalPoints(prices.slice(-windowSize), 24)}`);

    // Уровни сопротивления и поддержки
    const supportResistanceLevels = (input, hours) => {
      const normalizedInput = input.map(price => (price - minPrice) / (maxPrice - minPrice));
      const window = normalizedInput.slice(-windowSize);
      const inputTensor = tf.tensor2d([window]);
      const predictedNormalizedPrice = model.predict(inputTensor).dataSync()[0];
      const predictedPrice = predictedNormalizedPrice * (maxPrice - minPrice) + minPrice;
      const currentPrice = input[input.length - 1];
      const threshold = 0.01;
      const supportLevel = currentPrice * (1 - threshold);
      const resistanceLevel = currentPrice * (1 + threshold);
      return { supportLevel, resistanceLevel };
    };

    console.log('Support and resistance levels:');
    console.log(`1 hour: ${JSON.stringify(supportResistanceLevels(prices.slice(-windowSize), 1))}`);
    console.log(`4 hours: ${JSON.stringify(supportResistanceLevels(prices.slice(-windowSize), 4))}`);
    console.log(`12 hours: ${JSON.stringify(supportResistanceLevels(prices.slice(-windowSize), 12))}`);
    console.log(`24 hours: ${JSON.stringify(supportResistanceLevels(prices.slice(-windowSize), 24))}`);
  })
  .catch(error => {
    console.error(error);
  });
