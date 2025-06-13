const express = require("express")
const cors = require("cors")

const { Client } = require("pg")


const app = express()

const dotenv = require("dotenv")
dotenv.config()


const {expressjwt: jwt} = require('express-jwt')
const jwksRsa = require('jwks-rsa')

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({ jwksUri: `${process.env.DOMAIN}.well-known/jwks.json` }),
  audience: process.env.AUDIENCE,
  issuer: process.env.DOMAIN,
  algorithms: ['RS256']
})

app.use(cors({
  origin: process.env.ALLOWED_WEBSITE,  // la tua origine frontend precisa
  credentials: true                 // abilita invio cookie e credenziali
}))


const { auth } = require("express-openid-connect")

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: `http://localhost:${process.env.SERVER_PORT}`,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET, 
  issuerBaseURL: process.env.DOMAIN,
  authorizationParams: {
    response_type: "code",
    scope: 'openid profile email offline_access',
    audience: process.env.AUDIENCE,
  }
}

app.use(auth(config))



const WEB_ACCESS = ["/", "/logout"]

//CORS BYPASS + Only Fetch Requests
app.use((req, res, next) => {
    // if(!WEB_ACCESS.includes(req.path) && req.get("Accept").includes("text/html")){
    //     return res.redirect(`${process.env.ALLOWED_WEBSITE}/app/frontend/`)
    // }

    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_WEBSITE)
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Methods', 'GET, POST')

    next()
})

app.use(express.json())


const bankConfig = {
    minDeposit : 200,
    maxDeposit : 2000,

    maxDailyWithdraws : 1000,

    disableDay : "domenica",

    dateFormat: "it-IT"
}

const ROLES = {
    admin : "danger",
    broker: "warning",
    user: "success"
}

const con = new Client({
    host: "localhost",
    user: "postgres",
    port: process.env.POSTEGRESQL_PORT,
    password: "1234",
    database: "bankaccount"
})

con.connect()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.error("DB connection error:", err))


function returnError(msg){ return {success: false, error: msg} }  
    
function randomNumber(min=0, max=1){ return Math.floor(Math.random() * (max - min + 1)) + min }
    
function getCurrentDate(){ return new Date().toLocaleDateString(bankConfig.dateFormat) }

//MOCK CURRENT DATE
// function mockCurrentDate() { 
//     return `${randomNumber(1,27)}/${randomNumber(1,12)}/${randomNumber(1900, 2025)}`
// }

function getDayArticle(day=bankConfig.disableDay){ return day.charAt(0) == "d" ? "la" : "il" }


function bankBasicCheck(amount){

    if(new Date().toLocaleDateString(bankConfig.dateFormat, {weekday: "long"}) == bankConfig.disableDay){
        throw new Error(`Operazioni disabilitate ${getDayArticle()} ${bankConfig.disableDay.charAt(0).toUpperCase() + bankConfig.disableDay.slice(1)}`)
    }
    
    if(amount <= 0){
        throw new Error("Amount non Valido")
    }
}


const alphabetImport = require('alphabet')
const alphabet = [...alphabetImport.lower, ...alphabetImport.upper]

function getCSRF(){
    let csrf_token = ""

    for(let i=0;i<process.env.CSRF_TOKEN_LENGTH;i++) csrf_token+= alphabet[randomNumber(0, alphabet.length-1)]

    return csrf_token
}


// ROLE MANAGEMENT
function getRoles(req){ return req.oidc.user["bank/roles"] }
function isRole(req, role){ return getRoles(req).includes(role)}

function isAdmin(req){ return isRole(req, "admin")}
function isBroker(req){ return isRole(req, "broker") || isAdmin(req)}



function formatAdminViewQuery(){
    const rolesList = Object.keys(ROLES)
    let cases = ""
    

    for(let i=0;i<rolesList.length;i++){ 
        cases+= `WHEN '${rolesList[i]}' THEN ${i+1} `
    }

    return cases
}


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
    return ((await con.query(`
        SELECT SUM(
	        CASE 
		        WHEN actiontype='deposit' THEN amount
		        WHEN actiontype='withdraw' THEN -amount
		        ELSE 0

	    END) AS balance FROM transactions WHERE oauth_sub = $1`, [oauth_sub])).rows[0]["balance"]) ?? 0
}


async function getAccountInfo(req){
    try {
        const oauth_sub = getOAuthSub(req)
        
        return {
            success: true,
            
            nickname: req.oidc.user.nickname,
            picture: req.oidc.user.picture,
            balance: formatCurrency(await getBalance(oauth_sub)),
            dailyWithdraws: formatCurrency(await getDailyWithdraws(oauth_sub))
        }

    } catch (error) { return returnError("Failed to fetch account") }
}


async function getDailyWithdraws(oauth_sub){
    return ((
        await con.query("SELECT sum(amount) AS dailyWithdraws FROM transactions WHERE oauth_sub = $1 and actiontype='withdraw' and actiondate=$2",

        [oauth_sub, getCurrentDate()])).rows[0]["dailywithdraws"]) ?? 0
}


async function nicknameHandler(req){
    const oauth_sub = getOAuthSub(req)

    const auth0Nickname = (await getAccountInfo(req))["nickname"]

    const dbInfo = (await con.query("SELECT * from users WHERE oauth_sub = $1", [oauth_sub])).rows[0]
    
    let userRole = getRoles(req)
    userRole = userRole.length == 0 ? "user" : userRole[0]


    if(dbInfo == undefined){
        return await con.query("INSERT INTO users (oauth_sub, nickname, role) VALUES ($1, $2, $3)", [oauth_sub, auth0Nickname, userRole])
    }

    if(dbInfo["nickname"] != auth0Nickname){
        return await con.query("UPDATE users SET nickname = $1 WHERE oauth_sub = $2", [auth0Nickname, oauth_sub]) 
    }

    if(dbInfo["role"] != userRole){
        return await con.query("UPDATE users SET role = $1 WHERE oauth_sub = $2", [userRole, oauth_sub]) 
    }
}

////////////////////////////////////

//REQUIRES AUTH/ROLE to VIEW PAGES

const { requiresAuth } = require("express-openid-connect")

const requiresRole = (role) => {
  return (req, res, next) => {

    if (!role(req)) { return res.json(returnError("Not Authorized")) }

    next()
  }
}


const requiresAdmin = requiresRole(isAdmin)
const requiresBroker = requiresRole(isBroker)


/* /////////////////////////////////////


USERS

*/


app.get("/", async(req, res) => {
    if(req.oidc.isAuthenticated()){
        await nicknameHandler(req)
    }
    
    res.redirect(`${process.env.ALLOWED_WEBSITE}/app/frontend/${!req.oidc.isAuthenticated() ? "signin.html" : ""}`)
})


app.get("/home/info", async (req, res) => {
    if(req.oidc.accessToken == undefined){
        return res.status(401).json({ error: "Missing Authentication" })
    }
    
    res.header('Authorization', req.oidc.accessToken.access_token)

    res.json({
        permissions: {
            adminView: isAdmin(req),
            brokerView: isBroker(req)
        },

        bankConfig: {
            "Prelievo massimo giornaliero:" : `${bankConfig.maxDailyWithdraws} €`,
            "Deposito minimo:" : `${bankConfig.minDeposit} €`,
            "Deposito massimo:" : `${bankConfig.maxDeposit} €`,
            "Operazioni non permesse" : `${getDayArticle()} ${bankConfig.disableDay}`,

            "Il saldo non può essere negativo" : null,

            "Non è possibile depositare 0 €" : null
        },
    })
})

app.get("/home/me", async (req, res) => {
})


app.get("/logout", checkJwt, (req, res) => {
    req.oidc.logout()
})


/*  
        ONLY FETCH

        */

app.get("/account", checkJwt, async (req, res) => res.json(await getAccountInfo(req)) )

app.post("/account/deposit", checkJwt, async (req, res) => {
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

        res.json({ success: true })

    } catch (error) { res.json(returnError(error.message)) }
})




// manda info account a frontend
app.post("/account/withdraw", checkJwt, async (req, res) => {
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
        
        const dailyWithdraws = await getDailyWithdraws(oauth_sub)

        if(dailyWithdraws+amount > bankConfig.maxDailyWithdraws){
            throw new Error("Limite di Prelievo Raggiunto")
        }
        
        
        await addHistory(oauth_sub, amount, "withdraw")
        
        res.json({ success: true })

    } catch (error) { res.json(returnError(error.message)) }
})


//dd/mm/yyyy
app.get("/account/history", checkJwt, async (req, res) => {
    try {  
        res.json({
            success: true,
            history: (await con.query("SELECT * from transactions WHERE oauth_sub = $1", [getOAuthSub(req)])).rows
        })
        
    } catch (error) { res.json( returnError("Failed to fetch history")) }
})



/* ////////////////////////////////////


ADMIN

*/


app.get("/admin/view", checkJwt, requiresAdmin, async (req, res) => {
    try{
        const usersInfo = []
        const infos = (await con.query(`SELECT * from users ORDER BY CASE role ${formatAdminViewQuery()}END`)).rows
        
        for(row of infos){
            let oauth = row["oauth_sub"]

            usersInfo.push({
                isYou: oauth==getOAuthSub(req),
                
                oauthID : oauth,
                nickname: row["nickname"],
                role: `${ROLES[row["role"]]}-${row["role"]}`,

                balance: formatCurrency(await getBalance(oauth)),
                dailyWithdraws: formatCurrency(await getDailyWithdraws(oauth)),
            })
        }


        res.json({
            success: true,
            usersInfo: usersInfo
        })

    } catch(error){ 
        res.json(returnError("Failed to fetch Users Info")) }
    
})


/* ////////////////////////////////////


BROKER

*/

app.get("/broker/market", checkJwt, requiresBroker, async (req, res) => {
    
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

    } catch(error){ res.json(returnError("Failed to fetch Market Trend")) }
})


//Errors
app.use((err, req, res, next) => {
  if (err.status == 401) { return res.status(401).json({ error: 'Missing Authentication' }) }
  if (err.status == 404) { return res.status(404).json({ error: 'Not Found' }) }
  next(err)
})


app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on http://localhost:${process.env.SERVER_PORT}`)
})    

module.exports = app