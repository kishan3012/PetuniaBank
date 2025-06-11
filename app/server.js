
const express = require("express")
const { Client } = require("pg")

const app = express()

app.use(express.json())

const dotenv = require("dotenv")
dotenv.config()

const path = require("path")

app.use(express.static(path.join(__dirname, "static")))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "templates"))


const { auth } = require("express-openid-connect")
const port = 3000
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: `http://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
}

app.use(auth(config))

const bankConfig = {
    "minDeposit" : 200,
    "maxDeposit" : 2000,

    "maxDailyWithdraws" : 1000,

    "disableDay" : "domenica"
}


const con = new Client({
    host: "localhost",
    user: "postgres",
    port: 8000,
    password: "1234",
    database: "bankaccount"
})

con.connect()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.error("DB connection error:", err))


    
function randomNumber(min=0, max=1){ return Math.floor(Math.random() * (max - min + 1)) + min }
    
function getCurrentDate(){ return new Date().toLocaleDateString() }

//MOCK CURRENT DATE
function mockCurrentDate() { 
    return `${randomNumber(1,27)}/${randomNumber(1,12)}/${randomNumber(1900, 2025)}`
}


function bankBasicCheck(amount){
    if(new Date().toLocaleDateString("it-IT", {weekday: "long"}) == bankConfig.disableDay){
        throw new Error(`Operazioni disabilitate per ${bankConfig.disableDay.charAt(0).toUpperCase() + bankConfig.disableDay.slice(1)}`)
    }
    
    if(amount <= 0){
        throw new Error("Amount non Valido")
    }
}


// ROLE MANAGEMENT
function getRoles(req){ return req.oidc.user["bank/roles"] }
function isRole(req, role){ return getRoles(req).includes(role)}

function isAdmin(req){ return isRole(req, "admin")}
function isBroker(req){ return isRole(req, "broker") || isAdmin(req)}


function formatCurrency(amount=0){
    return amount.toFixed(2).replace(".", ",")
}

function getOAuthSub(req){
    return req.oidc.user.sub.split("|")[1]
}

async function addHistory(oauth_sub, amount, type){
    await con.query("INSERT INTO transactions (oauth_sub, amount, actiontype, actiondate) VALUES ($1, $2, $3, $4)", [oauth_sub, amount, type, getCurrentDate()])   
}

async function getBalance(oauth_sub){
    let balance = (await con.query(`
        SELECT SUM(
	        CASE 
		        WHEN actiontype='deposit' THEN amount
		        WHEN actiontype='withdraw' THEN -amount
		        ELSE 0

	    END) AS balance FROM transactions WHERE oauth_sub = $1`, [oauth_sub])).rows[0]["balance"]

    return balance ?? 0
}


async function getAccountInfo(req){
    try {
        let oauth_sub = getOAuthSub(req)
        
        return {
            success: true,
            
            nickname: req.oidc.user.nickname,
            picture: req.oidc.user.picture,
            balance: formatCurrency(await getBalance(oauth_sub)),
            dailyWithdraws: formatCurrency(await getDailyWithdraws(oauth_sub))
        }

    } catch (error) {
        return {
            success: false,
            error: "Failed to fetch account"
        }
    }
}


async function getDailyWithdraws(oauth_sub){
    let dailyWithdraws = (await con.query("SELECT sum(amount) AS dailyWithdraws FROM transactions WHERE oauth_sub = $1 and actiontype='withdraw' and actiondate=$2", [oauth_sub, getCurrentDate()])).rows[0]["dailywithdraws"]
    return dailyWithdraws ?? 0
}


async function getUserInfo(oauth_sub){
    return (await con.query("SELECT * from users WHERE oauth_sub = $1", [oauth_sub])).rows[0]
}

async function nicknameHandler(req){
    const oauth_sub = getOAuthSub(req)

    const auth0Nickname = (await getAccountInfo(req))["nickname"]
    const dbNickname = (await getUserInfo(oauth_sub))

    if(dbNickname == undefined){
        return await con.query("INSERT INTO users (oauth_sub, nickname) VALUES ($1, $2)", [oauth_sub, auth0Nickname])
    }

    if(dbNickname["nickname"] != auth0Nickname){
        return await con.query("UPDATE users SET nickname = $1 WHERE oauth_sub = $2", [auth0Nickname, oauth_sub]) 
    }
}

////////////////////////////////////

//REQUIRES AUTH/ROLE to VIEW PAGES

const { requiresAuth } = require("express-openid-connect")

const requiresRole = (role) => {
  return (req, res, next) => {

    if (!role(req)) { return res.redirect("/home") }

    next()
  }
}

const requiresAdmin = requiresRole(isAdmin)
const requiresBroker = requiresRole(isBroker)

/* /////////////////////////////////////


USERS

*/

app.get("/home", async (req, res) => {
    if (!req.oidc.isAuthenticated()) { return res.redirect("/") }
    
    await nicknameHandler(req)
    
    res.render("index", {data : await getAccountInfo(req), permissions: {
                                                                adminView: isAdmin(req),
                                                                brokerView: isBroker(req)
    }})
})

app.get("/", (req, res) => {
    if (req.oidc.isAuthenticated()) { return res.redirect("/home") }
    res.render("signin")
})



app.get("/logout", requiresAuth(), (req, res) => {
    res.oidc.logout()
})


app.get("/account", requiresAuth(), async (req, res) => res.json(await getAccountInfo(req)) )

app.get("/account/finance", requiresAuth(), async (req, res) => {
    try {
        let accountInfo = await getAccountInfo(req)
        
        res.json({
            success: true,
            balance: accountInfo["balance"],
            dailyWithdraws: accountInfo["dailyWithdraws"]
        })

    } catch (error) {
        res.json({
            success: false,
            error: "Failed to fetch finance"
        })
    }
})


app.post("/account/deposit", requiresAuth(), async (req, res) => {
    const { amount } = req.body


    try {
        bankBasicCheck(amount)
        
        if (amount < bankConfig.minDeposit) {
            throw new Error("Errore di Deposito. Importo inferiore al Limite")
        }

        if (amount > bankConfig.maxDeposit) {
            throw new Error("Errore di Deposito. Importo superiore al Limite")
        }

        await addHistory(getOAuthSub(req), amount, "deposit")

        res.json({
            success: true,
        })

    } catch (error) {
        res.json({
            success: false,
            error: error.message
        })
    }
})




// manda info account a frontend
app.post("/account/withdraw", requiresAuth(), async (req, res) => {
    const { amount } = req.body
    
    try {
        bankBasicCheck(amount)
        
        const oauth_sub = getOAuthSub(req)

        if (amount > await getBalance(oauth_sub)) {
            throw new Error("Fondi insufficienti.")
        }
        
        if(amount > bankConfig.maxDailyWithdraws){
            throw new Error("Errore di Prelievo. Limite Massimo Raggiunto")
        }
        
        let dailyWithdraws = await getDailyWithdraws(oauth_sub)

        if(dailyWithdraws+amount > bankConfig.maxDailyWithdraws){
            throw new Error("Limite di Prelievo Raggiunto")
        }
        
        
        await addHistory(oauth_sub, amount, "withdraw")
        
        res.json({
            success: true
        })

    } catch (error) {
        res.json({
            success: false,
            error: error.message
        })
    }
})


//dd/mm/yyyy
app.get("/account/history", requiresAuth(), async (req, res) => {
    try {  
        res.json({
            success: true,
            history: (await con.query("SELECT * from transactions WHERE oauth_sub = $1", [getOAuthSub(req)])).rows
        })
    } catch (error) {
        res.json({
            success: false,
            error: "Failed to fetch history"
        })
    }
})



/* ////////////////////////////////////


ADMIN

*/


app.get("/admin/view", requiresAuth(), requiresAdmin, async (req, res) => {
    try{
        const usersInfo = []
        let oauths = (await con.query("SELECT oauth_sub from users GROUP BY oauth_sub")).rows

        for(let oauth of oauths){
            oauth = oauth["oauth_sub"]

            if(oauth == getOAuthSub(req)){ continue }

            usersInfo.push({
                oauthID : oauth,
                nickname: (await getUserInfo(oauth))["nickname"],
                balance: formatCurrency(await getBalance(oauth)),
                dailyWithdraws: formatCurrency(await getDailyWithdraws(oauth)),
            })
        }

        res.json({
            success: true,
            usersInfo: usersInfo
        })

    }catch(error){
        res.json({
            success: false,
            error: "Failed to fetch Users Info"
        })
    }
    
})


app.get("/admin", requiresAuth(), requiresAdmin, async (req, res) => {
    res.render("admin")
})



/* ////////////////////////////////////


BROKER

*/

app.get("/broker", requiresAuth(), requiresBroker, async (req, res) => {
    res.render("broker")
})

app.get("/broker/market", requiresAuth(), requiresBroker, async (req, res) => {
    
    try{
        const markets = ["Apple Inc", "Remira Srl", "Astri Inc", "Nintendo Ltd"]

        let market = parseInt(req.query?.market)
        market = !isNaN(market) && market < markets.length && market >= 0 ? market : 0

        let yearsCount = parseInt(req.query?.yearsCount)
        yearsCount = !isNaN(yearsCount) && yearsCount <= 10 && yearsCount > 0 ? yearsCount : 5

        const startYear = new Date().getFullYear() - yearsCount
        const backgroundColors = ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)", "rgba(255, 206, 86, 0.5)", "rgba(75, 192, 192, 0.5)", "rgba(153, 102, 255, 0.5)", "rgba(255, 159, 64, 0.5)" ]
        const borderColors = ["rgba(255,99,132,1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"]

        const graphData = []

        for(let i=0; i<yearsCount; i++){
            graphData.push({
                year: startYear+(i+1),
                value: randomNumber(5_000, 50_000),
                backgroundColor: backgroundColors[randomNumber(0, backgroundColors.length-1)],
                borderColor: borderColors[randomNumber(0, borderColors.length-1)]
            })
        }
        

        res.json({success: true,
            graphData : {
                labels: graphData.map(gd => gd.year),
                datasets: [{
                        label: `${markets[market]} - Market Trend`,
                        data: graphData.map(gd => gd.value),
                        backgroundColor: graphData.map(gd => gd.backgroundColor),
                        borderColor: graphData.map(gd => gd.borderColor),
                        borderWidth: 1
                    }]
            }
        })

    }
    
    catch(error){
        res.json({
            success: false,
            error: "Failed to fetch Market Trend"
        })
    }
})


//404 error handler
app.use((req, res) => {
    res.redirect(req.oidc.isAuthenticated() ? "/home" : "/")
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})    

module.exports = app