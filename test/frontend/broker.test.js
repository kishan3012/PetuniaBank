const { run } = require('jest');
const { Builder, By, until } = require('selenium-webdriver');

async function runTest() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('http://localhost:3000/broker');
    console.log('Pagina caricata correttamente');
   var container = await driver.wait(until.elementLocated(By.className('container')));
   if (container) {
      console.log('Container di home e logout trovato');
    }   else {
      console.log('Container di home e logout non trovato');
    }
 var graph = await driver.wait(until.elementLocated(By.id('myChart')));
 if (graph) {
      console.log('Grafico trovato');
    } else {
      console.log('Grafico non trovato');
    }

var billButton = await driver.wait(until.elementLocated(By.id('fatturationButton')));
if (billButton) {
      console.log('Pulsante di fatturazione trovato');
    } else {
        console.log('Pulsante di fatturazione non trovato');
    }

  } finally {
    await driver.quit();
  }
}
runTest();
