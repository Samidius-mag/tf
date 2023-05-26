const fs = require('fs');
const tf = require('@tensorflow/tfjs');

const cont = JSON.parse(fs.readFileSync('cont.json'));

// Создаем модель нейросети на основе данных из контейнера
const model = tf.sequential();
model.add(tf.layers.dense({ units: 4, inputShape: [4] }));
model.add(tf.layers.dense({ units: 1 }));
model.setWeights(cont.weights.map(w => tf.tensor(w)));

// Получаем данные о последней свече
const data = JSON.parse(fs.readFileSync('price.json'));
const lastCandle = data[data.length - 1];

// Создаем функцию для прогнозирования цены через указанное количество часов
function predictPrice(hours) {
  const input = [lastCandle.open, lastCandle.high, lastCandle.low, lastCandle.close];
  let output = model.predict(tf.tensor2d([input])).dataSync()[0];
  for (let i = 0; i < hours; i++) {
    input.shift();
    input.push(output);
    output = model.predict(tf.tensor2d([input])).dataSync()[0];
  }
  return output;
}

// Создаем функцию для прогнозирования тренда на указанное количество часов
function predictTrend(hours) {
  const price1 = predictPrice(hours);
  const price2 = predictPrice(hours * 2);
  return price1 < price2 ? 'up' : 'down';
}

// Создаем функцию для прогнозирования точек разворота на указанное количество часов
function predictTurningPoint(hours) {
  const price1 = predictPrice(hours);
  const price2 = predictPrice(hours * 2);
  const price3 = predictPrice(hours * 3);
  if (price1 < price2 && price2 > price3) {
    return 'top';
  } else if (price1 > price2 && price2 < price3) {
    return 'bottom';
  } else {
    return 'none';
  }
}

// Создаем функцию для прогнозирования уровней сопротивления и поддержки на указанное количество часов
function predictSupportResistance(hours) {
  const price1 = predictPrice(hours);
  const price2 = predictPrice(hours * 2);
  const price3 = predictPrice(hours * 3);
  const price4 = predictPrice(hours * 4);
  const resistance1 = (price1 + price2 + price3) / 3;
  const resistance2 = (price2 + price3 + price4) / 3;
  const support1 = (price1 + price2) / 2;
  const support2 = (price3 + price4) / 2;
  return { resistance1, resistance2, support1, support2 };
}

// Выводим результаты прогнозирования
console.log('Price after 1 hour:', predictPrice(1));
console.log('Price after 4 hours:', predictPrice(4));
console.log('Price after 12 hours:', predictPrice(12));
console.log('Price after 24 hours:', predictPrice(24));
console.log('Trend after 1 hour:', predictTrend(1));
console.log('Trend after 4 hours:', predictTrend(4));
console.log('Trend after 12 hours:', predictTrend(12));
console.log('Trend after 24 hours:', predictTrend(24));
console.log('Turning point after 1 hour:', predictTurningPoint(1));
console.log('Turning point after 4 hours:', predictTurningPoint(4));
console.log('Turning point after 12 hours:', predictTurningPoint(12));
console.log('Turning point after 24 hours:', predictTurningPoint(24));
console.log('Support and resistance after 1 hour:', predictSupportResistance(1));
console.log('Support and resistance after 4 hours:', predictSupportResistance(4));
console.log('Support and resistance after 12 hours:', predictSupportResistance(12));
console.log('Support and resistance after 24 hours:', predictSupportResistance(24));
