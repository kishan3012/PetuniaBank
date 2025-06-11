const { Builder, By, until } = require('selenium-webdriver');

(async function testBancaDigitale() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:3000/index');

        //aspetta finche non si carica il titolo
        await driver.wait(until.titleIs('Banca Digitale - Home'));
        console.log('Titolo pagina corretto');

        //controllo che h1 e' presente ed e' giusto
        let h1 = await driver.findElement(By.css('h1'));
        let h1Text = await h1.getText();
        if (h1Text.includes('Banca Digitale')) {
            console.log("H1 corretto", h1Text);
        } else {
            console.log("H1 non corretto", h1Text);
        }

        //verifica la presenza di btn logout
        let logoutBtn = await driver.findElement(By.css('a[href="/logout"]'));
        let logoutText = await logoutBtn.getText();
        if (logoutText.toLowerCase().includes('logout')) {
            console.log('Btn logout presente');
        } else {
            console.log('Btn logout non trovato o testo sbagliato');
        }

        //controllo del saldo ha un valore numerico
        let balanceElem = await driver.findElement(By.id('balance'));
        let balanceText = await balanceElem.getText();
        console.log('saldo trovato: ', balanceText);

        //controllo validito del saldo
        const saldoValido = /\d+(\.\d{1,2})?\s*€/;
        if (saldoValido.test(balanceText)) {
            console.log("Saldo corretto e formatato bene: ", balanceText);
        } else {
            console.log("Saldo non valido: ", balanceText);

        }

        //controllo del campo input per importo
        let amountInput = await driver.findElement(By.id('amount'));
        let placeholder = await amountInput.getAttribute('placeholder');
        console.log('Campo importo placeholder: ', placeholder);

        //controllo presenza btn prelievo/deposito
        let depositoBtn = await driver.findElement(By.id('deposit-btn'));
        let withdrawBtn = await driver.findElement(By.id('withdraw-btn'));
        console.log('Bottone deposito trovato: ', await depositoBtn.getText());
        console.log('Bottone prelievo trovato: ', await withdrawBtn.getText());

        //coontrolla funzionalita btn deposito/prelievo
        let depositoEnabled = await depositoBtn.isEnabled();
        let withdrawEnabled = await withdrawBtn.isEnabled();
        console.log('Bottone deposito abilitato:', depositoEnabled);
        console.log('Bottone prelievo abilitato:', withdrawEnabled);

        //controllo presenza link condizionali admin/broker
        let adminLink = await driver.wait(until.elementLocated(By.id('admin')));

        if (adminLink) {
            console.log('Link admin presente');
        } else {
            console.log('Link admin non presente');
        }
        let brokerLink = await driver.wait(until.elementLocated(By.id('broker')));
        if (brokerLink) {
            console.log('Link broker presente');
        } else {
            console.log('Link broker non presente');
        }

        //controllo il messaggio Accesso richiesto
        let notAuthMsg = await driver.findElement(By.id('notAuthenticatedMessage')).catch(() => null);
        if (notAuthMsg) {
            let visible = await notAuthMsg.isDisplayed();
            if (visible) {
                console.log("Messaggio di accesso richiesto visibile: utente non autenticato.");
            } else {
                console.log("Messaggio di accesso richiesto nascosto: utente autenticato.");
            }
        }

        //controllo video di sfondo
        let video = await driver.findElement(By.id('bgVideo'));
        let autoplay = await video.getAttribute('autoplay');
        let muted = await video.getAttribute('muted');
        let loop = await video.getAttribute('loop');
        console.log('Video autoplay:', !!autoplay);
        console.log('Video muted:', !!muted);
        console.log('Video loop:', !!loop);


    } catch (e) {
        console.error('Test fallito', e);
    } finally {
        await driver.quit();
    }
})();