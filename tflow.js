const fs = require('fs');
const tf = require('@tensorflow/tfjs');

// Загрузка данных обучения из файла cont.json
const cont = JSON.parse(fs.readFileSync('cont.json'));
const weights = cont.weights.map(w => tf.tensor(w));

// Создание модели нейросети на основе данных обучения
const model = tf.sequential();
model.add(tf.layers.dense({ units: 64, inputShape: [4], activation: 'relu', weights: [weights[0], weights[1]] }));
model.add(tf.layers.dense({ units: 1, activation: 'linear', weights: [weights[2], weights[3]] }));

// Загрузка данных из файла price.json
const rawData = fs.readFileSync('price.json');
const data = JSON.parse(rawData).map(candle => ({
  open: parseFloat(candle.open),
  high: parseFloat(candle.high),
  low: parseFloat(candle.low),
  close: parseFloat(candle.close),
  volume: parseFloat(candle.volume),
}));

// Преобразование данных в формат, подходящий для использования нейросетью
const input = data.map(candle => [candle.open, candle.high, candle.low, candle.close]);
const output = data.map(candle => [candle.close]);

// Получение прогнозов дальнейшего движения цены
const predictions = model.predict(tf.tensor2d(input)).arraySync().map(p => p[0]);

// Получение прогнозов тренда на 1, 4, 12, 24 часа
const trend1h = predictions.slice(-1)[0] > data.slice(-1)[0].close ? 'bearish' : 'bullish';
const trend4h = predictions.slice(-4).reduce((sum, p) => sum + p, 0) > data.slice(-4).reduce((sum, c) => sum + c.close, 0) ? 'bullish' : 'bearish';
const trend12h = predictions.slice(-12).reduce((sum, p) => sum + p, 0) > data.slice(-12).reduce((sum, c) => sum + c.close, 0) ? 'bullish' : 'bearish';
const trend24h = predictions.slice(-24).reduce((sum, p) => sum + p, 0) > data.slice(-24).reduce((sum, c) => sum + c.close, 0) ? 'bullish' : 'bearish';

// Получение точек разворота
const pivots = [];
let high = data[0].high;
let low = data[0].low;
let pivot = (high + low + data[0].close) / 3;
let resistance1 = 2 * pivot - low;
let support1 = 2 * pivot - high;
let resistance2 = pivot + (high - low);
let support2 = pivot - (high - low);
let resistance3 = high + 2 * (pivot - low);
let support3 = low - 2 * (high - pivot);
for (let i = 1; i < data.length; i++) {
  if (data[i].high > high) {
    high = data[i].high;
    low = data[i].low;
    pivot = (high + low + data[i].close) / 3;
    resistance1 = 2 * pivot - low;
    support1 = 2 * pivot - high;
    resistance2 = pivot + (high - low);
    support2 = pivot - (high - low);
    resistance3 = high + 2 * (pivot - low);
    support3 = low - 2 * (high - pivot);
  } else if (data[i].low < low) {
    high = data[i].high;
    low = data[i].low;
    pivot = (high + low + data[i].close) / 3;
    resistance1 = 2 * pivot - low;
    support1 = 2 * pivot - high;
    resistance2 = pivot + (high - low);
    support2 = pivot - (high - low);
    resistance3 = high + 2 * (pivot - low);
    support3 = low - 2 * (high - pivot);
  }
  pivots.push({ time: data[i].time, pivot, resistance1, support1, resistance2, support2, resistance3, support3 });
}

// Вывод результатов в консоль
console.log('Predictions:', predictions);
console.log('Trend 1h:', trend1h);
console.log('Trend 4h:', trend4h);
console.log('Trend 12h:', trend12h);
console.log('Trend 24h:', trend24h);
console.log('Pivots:', pivots);
