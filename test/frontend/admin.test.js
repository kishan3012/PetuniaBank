const { Builder, By, until } = require('selenium-webdriver');

async function runTest() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('http://localhost:3000/admin');
    console.log('Pagina caricata correttamente');

    await driver.wait(until.elementLocated(By.id('userTable')));
    await driver.wait(until.elementLocated(By.id('searchBar')));

    console.log('Barra di ricerca caricata correttamente');
    await driver.wait(until.elementLocated(By.className('container')));
    console.log('Container di home e logout trovati');
    const searchBar = await driver.findElement(By.id('searchBar'));
    await searchBar.sendKeys('test');

    const table = await driver.findElement(By.className('table-responsive'));
    const tableHTML = await table.getAttribute('innerHTML');

    if (tableHTML.includes('test')) {
      console.log('Tabella utenti trovata');
    } else {
      console.log('Tabella utenti non trovata');
    }
  } catch (e) {
    console.error('Errore nel test:', e);


    var catgif = await driver.wait(until.elementLocated(By.id('catGif')));
    if (catgif) {
      console.log('Cat GIF trovata');
    } else {
      console.log('Cat GIF non trovata');
    }
  } finally {
    await driver.quit();
  }
}

runTest(); 
