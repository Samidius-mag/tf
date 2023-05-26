const fs = require('fs');
const tf = require('@tensorflow/tfjs');

const data = JSON.parse(fs.readFileSync('price.json'));

// Преобразуем данные в формат, который можно использовать для обучения модели
const input = [];
const output = [];
for (let i = 0; i < data.length - 1; i++) {
  input.push([data[i].open, data[i].high, data[i].low, data[i].close]);
  output.push([data[i + 1].close]);
}

// Создаем модель нейросети
const model = tf.sequential();
model.add(tf.layers.dense({ units: 4, inputShape: [4] }));
model.add(tf.layers.dense({ units: 1 }));

// Компилируем модель
model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

// Обучаем модель
const xs = tf.tensor2d(input);
const ys = tf.tensor2d(output);
model.fit(xs, ys, { epochs: 100 })
  .then(() => {
    // Сохраняем данные обучения в файл
    const weights = model.getWeights();
    const cont = { weights: weights.map(w => w.arraySync()) };
    fs.writeFileSync('cont.json', JSON.stringify(cont));
    console.log('Model trained and saved to cont.json');
  })
  .catch(error => {
    console.error(error);
  });
