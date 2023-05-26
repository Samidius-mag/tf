const tf = require('@tensorflow/tfjs');
const data = require('./cont.json');

function prepareData(data) {
  const features = [];
  const labels = [[], [], [], []];
  for (let i = 24; i < data.length - 24; i++) {
    const feature = [
      data[i - 24].close, data[i - 23].close, data[i - 22].close, data[i - 21].close, data[i - 20].close,
      data[i - 19].close, data[i - 18].close, data[i - 17].close, data[i - 16].close, data[i - 15].close,
      data[i - 14].close, data[i - 13].close, data[i - 12].close, data[i - 11].close, data[i - 10].close,
      data[i - 9].close, data[i - 8].close, data[i - 7].close, data[i - 6].close, data[i - 5].close,
      data[i - 4].close, data[i - 3].close, data[i - 2].close, data[i - 1].close,
      data[i - 24].volume, data[i - 23].volume, data[i - 22].volume, data[i - 21].volume, data[i - 20].volume,
      data[i - 19].volume, data[i - 18].volume, data[i - 17].volume, data[i - 16].volume, data[i - 15].volume,
      data[i - 14].volume, data[i - 13].volume, data[i - 12].volume, data[i - 11].volume, data[i - 10].volume,
      data[i - 9].volume, data[i - 8].volume, data[i - 7].volume, data[i - 6].volume, data[i - 5].volume,
      data[i - 4].volume, data[i - 3].volume, data[i - 2].volume, data[i - 1].volume
    ];
    features.push(feature);
    labels[0].push(data[i + 1].close);
    labels[1].push(data[i + 4].close);
    labels[2].push(data[i + 12].close);
    labels[3].push(data[i + 24].close);
  }
  return { features, labels };
}

function predict(model, features, hours) {
  const lastFeature = features[features.length - 1];
  let input = tf.tensor2d([lastFeature]);
  let predictions = [];
  for (let i = 0; i < hours; i++) {
    let prediction = model.predict(input);
    predictions.push(prediction.dataSync()[0]);
    input = tf.tensor2d([[...lastFeature.slice(2), prediction.dataSync()[0], lastFeature[47]]]]);
    lastFeature.shift();
    lastFeature.push(prediction.dataSync()[0]);
  }
  return predictions;
}

function calculatePivots(data) {
  const pivots = [];
  for (let i = 24; i < data.length - 24; i++) {
    const high = Math.max(...data.slice(i - 23, i + 1).map(d => d.high));
    const low = Math.min(...data.slice(i - 23, i + 1).map(d => d.low));
    const close = data[i].close;
    const pivot = (high + low + close) / 3;
    pivots.push(pivot);
  }
  return pivots;
}

function calculateResistanceLevels(data) {
  const pivots = calculatePivots(data);
  const resistanceLevels = [];
  for (let i = 24; i < data.length - 24; i++) {
    const high = Math.max(...data.slice(i - 23, i + 1).map(d => d.high));
    const low = Math.min(...data.slice(i - 23, i + 1).map(d => d.low));
    const pivot = pivots[i - 24];
    const r1 = 2 * pivot - low;
    const r2 = pivot + (high - low);
    const r3 = high + 2 * (pivot - low);
    resistanceLevels.push([r1, r2, r3]);
  }
  return resistanceLevels;
}

function calculateSupportLevels(data) {
  const pivots = calculatePivots(data);
  const supportLevels = [];
  for (let i = 24; i < data.length - 24; i++) {
    const high = Math.max(...data.slice(i - 23, i + 1).map(d => d.high));
    const low = Math.min(...data.slice(i - 23, i + 1).map(d => d.low));
    const pivot = pivots[i - 24];
    const s1 = 2 * pivot - high;
    const s2 = pivot - (high - low);
    const s3 = low - 2 * (high - pivot);
    supportLevels.push([s1, s2, s3]);
  }
  return supportLevels;
}

function getTrend(predictions) {
  const trend = [];
  for (let i = 0; i < predictions.length - 1; i++) {
    if (predictions[i] < predictions[i + 1]) {
      trend.push('Up');
    } else if (predictions[i] > predictions[i + 1]) {
      trend.push('Down');
    } else {
      trend.push('Flat');
    }
  }
  return trend;
}

const { features, labels } = prepareData(data);

const model = tf.sequential();
model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [48] }));
model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
model.add(tf.layers.dense({ units: 4 }));
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

const tensorFeatures = tf.tensor2d(features);
const tensorLabels = tf.tensor2d(labels);
model.fit(tensorFeatures, tensorLabels, { epochs: 100 });

const predictions = predict(model, features, 24);
const pivots = calculatePivots(data);
const resistanceLevels = calculateResistanceLevels(data);
const supportLevels = calculateSupportLevels(data);

console.log('Price predictions:', predictions.slice(0, 4));
console.log('Trend predictions:', getTrend(predictions.slice(0, 4)));
console.log('Pivot points:', pivots.slice(0, 4));
console.log('Resistance levels:', resistanceLevels.slice(0, 4));
console.log('Support levels:', supportLevels.slice(0, 4));
