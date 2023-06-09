const tf = require('@tensorflow/tfjs');
const fs = require('fs');

// Загрузка данных из файла price.json
const rawData = fs.readFileSync('price.json');
const data = JSON.parse(rawData).map(candle => ({
  open: parseFloat(candle.open),
  high: parseFloat(candle.high),
  low: parseFloat(candle.low),
  close: parseFloat(candle.close),
  volume: parseFloat(candle.volume),
}));

// Проверка, что массив данных не пустой
if (data.length === 0) {
  console.error('Data is empty');
  process.exit(1);
}


// Преобразование данных в формат, подходящий для обучения нейросети
const input = data.map(candle => [candle.open, candle.high, candle.low, candle.close]);
const output = data.map(candle => [candle.close]);

// Создание модели нейросети
const model = tf.sequential();
model.add(tf.layers.dense({ units: 64, inputShape: [4], activation: 'relu' }));
model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

// Обучение нейросети на основе данных
model.fit(tf.tensor2d(input), tf.tensor2d(output), { epochs: 100 })
  .then(() => {
    // Сохранение данных обучения в файл cont.json
    const weights = model.getWeights();
    const cont = { weights: weights.map(w => w.arraySync()) };
    fs.writeFileSync('cont.json', JSON.stringify(cont));
    console.log('Model trained and weights saved to cont.json');
  })
  .catch(error => {
    console.error(error);
  });
