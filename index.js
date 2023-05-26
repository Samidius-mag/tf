const { spawn } = require('child_process');

const loadPrice = () => {
  const child = spawn('node', ['load.js']);

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

const sendToBot = () => {
  const child = spawn('node', ['bot.js']);

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};
/*
const sendToBot2 = () => {
  const child = spawn('node', ['bot2.js']);

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};
*/
/*
const sendToBot3 = () => {
  const child = spawn('node', ['bot3.js']);

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};
*/
setInterval(loadPrice, 5000);
setInterval(sendToBot, 300000);
//setInterval(sendToBot2, 300000);
//setInterval(sendToBot3, 56000);
