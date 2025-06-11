const { Builder, By, until } = require('selenium-webdriver');

(async function testLoginPage() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:3000/signin');

        //controllo titolo
        await driver.wait(until.titleIs('Banca Digitale - Login'), 2000);
        console.log('Titolo pagina corretto');

        //controllo del h1 
        let h1 = await driver.findElement(By.className('rainbow-header'));
        let h1Text = await h1.getText();
        if (h1Text.includes('Login With')) {
            console.log('H1 trovato con testo corretto: ', h1Text)
        } else {
            console.log('H1 testo non corretto: ', h1Text);
        }

        //controllo btn con id auth0LoginBtn
        let auth0Btn = await driver.findElement(By.id('auth0LoginBtn'));
        let btnText = await auth0Btn.getText();
        if (btnText.includes('Accedi con Auth0')) {
            console.log('Bottone Auth0 trovato e testo correto');
        } else {
            console.log('Bottone Auth0 non correto');

        }

        //controllo auth0Btn sia cliccabile
        let isEnabled = await auth0Btn.isEnabled();
        console.log('Bottone Auth0 abilitato:', isEnabled);

        //controlla navigazione da auth0Btn
        await auth0Btn.click();
        await driver.wait(until.urlContains('auth0'), 5000);
        console.log('Rediretto a pagina Auth0 correttamente');

        //verifica che il btn ha icona corretta
        let icon = await auth0Btn.findElement(By.css('i.fas.fa-shield-alt'));
        if (icon) {
            console.log('Icona fontAwesoma presente nel btn');
        } else {
            console.log('Icona fontAwesoma non trovata nel btn');
        }
    } catch (e) {
        console.error(' Test fallito', e);
    } finally {
        await driver.quit();
    }
})();