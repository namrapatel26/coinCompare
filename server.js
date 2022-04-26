const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const port = 3000
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// Array to store different costs of each exchange for the selected coin
var coinDetails = [
    { exchangeName:"WazirX", coinPrice:"", brokerage:"", depositFee:"1", totalForN:"", totalFor1:"" },
    { exchangeName:"Binance", coinPrice:"", brokerage:"", depositFee:"0", totalForN:"", totalFor1:"" },
    { exchangeName:"Crypto.com", coinPrice:"", brokerage:"", depositFee:"0", totalForN:"", totalFor1:"" },
    { exchangeName:"Coinbase", coinPrice:"", brokerage:"", depositFee:"", totalForN:"", totalFor1:"" }
];

// Array to store information regarding arbitrage opportunity
var arbitrage = { hIndex:"0", lIndex:"0", profit:"0", quan:"0" };

// Array to store transaction cost percentage (brokerage) of each exchange
const transactionCost = [0.2 , 0.1 , 0.5 , 0.4];

// Array to store transfer fee (to send coin from one wallet to another) in coin quantity
const transferFee = [
    [0.0006, 0.01, 1000000, 1000000, 1101928],
    [0.0005, 0.002, 0.01, 1, 1029965],
    [0.0005, 0.005, 0.0005, 0.5, 800000],
    [0.0003, 0.0029, 0.0004, 0.75, 957225]
];

// Function to send API requests to different exchanges based on selected coin. Result is stored in 'coinDetails' array
async function getPrices(coinName) {
    var baseURL;
    
    // API request to wazirx 
    // "https://api.wazirx.com/sapi/v1/ticker/24hr?symbol=btcinr"
    baseURL = "https://api.wazirx.com/sapi/v1/ticker/24hr?symbol="
    axios.get(baseURL + coinName.toLowerCase() + "usdt").then(
        (response) => {
            if(coinName == "SHIB")
                coinDetails[0].coinPrice = +parseFloat(response.data.lastPrice).toFixed(10).toString();
            else
                coinDetails[0].coinPrice = +parseFloat(response.data.lastPrice).toFixed(5).toString();
        },
        (error) => {
            console.log(error);
        }
    )

    // API request to Binance
    // https://api3.binance.com/api/v3/ticker/price?symbol=BTCUSDT
    baseURL = "https://api.binance.com/api/v3/ticker/price?symbol="
    axios.get(baseURL + coinName.toUpperCase() + "USDT").then(
        (response) => {
            if(coinName == "SHIB")
                coinDetails[1].coinPrice = +parseFloat(response.data.price).toFixed(10).toString();
            else
                coinDetails[1].coinPrice = +parseFloat(response.data.price).toFixed(5).toString();
        },
        (error) => {
            console.log(error)
        }
    )

    // API request to Crypto.com
    // https://api.crypto.com/v1/ticker?symbol=btcusdt
    baseURL = "https://api.crypto.com/v1/ticker?symbol=" ;
    axios.get(baseURL + coinName.toLowerCase() + "usdt").then( 
        (response) => {
            if(coinName == "SHIB")
                coinDetails[2].coinPrice = +parseFloat(response.data.data.last).toFixed(10).toString();
            else
                coinDetails[2].coinPrice = +parseFloat(response.data.data.last).toFixed(5).toString();
        },
        (error) => {
            console.log(error);
        }
    );
    
    // API request to Coinbase
    // https://api.coinbase.com/v2/prices/BTC-USD/spot
    baseURL = "https://api.coinbase.com/v2/prices/";
    axios.get(baseURL + coinName.toUpperCase() + "-USD/spot").then(
        (response) => {
            if(coinName == "SHIB")
                coinDetails[3].coinPrice = +parseFloat(response.data.data.amount).toFixed(10).toString();
            else
                coinDetails[3].coinPrice = +parseFloat(response.data.data.amount).toFixed(5).toString();
        },
        (error) => {
            console.log(error);
        }
    )
    
    return new Promise(resolve => {
        setTimeout(resolve,1000)
    });
}

// Function to calculate additional costs like brokerage and deposit fees
function getTotal(coinName){
    // To calculate brokerage cost for all exchanges
    for(var i=0;i<4;i++){
        if(coinName == "SHIB")
            coinDetails[i].brokerage = +(coinDetails[i].coinPrice * transactionCost[i] / 100).toFixed(10).toString();
        else
            coinDetails[i].brokerage = +(coinDetails[i].coinPrice * transactionCost[i] / 100).toFixed(5).toString();
    }
    
    // To calculate the depositing cost for Coinbase
    if(coinName == "SHIB")
        coinDetails[3].depositFee = +((parseFloat(coinDetails[3].coinPrice) + parseFloat(coinDetails[3].brokerage))* 1.49 / 100).toFixed(10).toString();
    else
        coinDetails[3].depositFee = +((parseFloat(coinDetails[3].coinPrice) + parseFloat(coinDetails[3].brokerage))* 1.49 / 100).toFixed(5).toString();

    // To calculate total cost of 1 coin and cost per user specified quantity
    for(var i=0;i<4;i++){
        if(coinName == "SHIB") {
            coinDetails[i].totalFor1 = +(parseFloat(coinDetails[i].coinPrice) + parseFloat(coinDetails[i].brokerage) + parseFloat(coinDetails[i].depositFee)).toFixed(10).toString();
            if(i == 3)
                coinDetails[i].totalForN = +((parseFloat(coinDetails[i].totalFor1)) * parseFloat(arbitrage.quan)).toFixed(10).toString();
            else
                coinDetails[i].totalForN = +((parseFloat(coinDetails[i].totalFor1) - parseFloat(coinDetails[i].depositFee)) * parseFloat(arbitrage.quan) + parseFloat(coinDetails[i].depositFee)).toFixed(10).toString();
        }
        else {
            coinDetails[i].totalFor1 = +(parseFloat(coinDetails[i].coinPrice) + parseFloat(coinDetails[i].brokerage) + parseFloat(coinDetails[i].depositFee)).toFixed(5).toString();
            if(i == 3)
                coinDetails[i].totalForN = +((parseFloat(coinDetails[i].totalFor1)) * parseFloat(arbitrage.quan)).toFixed(5).toString();
            else
                coinDetails[i].totalForN = +((parseFloat(coinDetails[i].totalFor1) - parseFloat(coinDetails[i].depositFee)) * parseFloat(arbitrage.quan) + parseFloat(coinDetails[i].depositFee)).toFixed(5).toString();
        }
    }
}

// Function to scan coin data for arbitrage opportunities and find max profit possible
function findArbitrage(coinName){
    var maxProfit = Number.NEGATIVE_INFINITY, high = -1, low = -1, coin = -1;
    var quantity, profit, i, j;
    
    switch(coinName) {
        case "BTC" : coin=0; break;
        case "ETH" : coin=1; break;
        case "SOL" : coin=2; break;
        case "ADA" : coin=3; break;
        case "SHIB" : coin=4; break;
    }
    
    for(i=0; i<4; i++) {
        quantity = parseFloat(arbitrage.quan) - transferFee[i][coin]
        for(j=0; j<4; j++) {
            if(i == j)
                continue;
            if(i+j == 1)
                quantity = parseFloat(arbitrage.quan);
            if(j == 3) {
                depositFee = parseFloat(coinDetails[j].coinPrice) * quantity * (1+transactionCost[j]/100) * (1.49/100);
                profit = parseFloat(coinDetails[j].coinPrice)*quantity*(1-transactionCost[j]/100) - depositFee - parseFloat(coinDetails[i].totalForN);
            }
            else {
                profit = parseFloat(coinDetails[j].coinPrice)*quantity*(1-transactionCost[j]/100) - parseFloat(coinDetails[j].depositFee) - parseFloat(coinDetails[i].totalForN);
            }
            if(profit > maxProfit) {
                maxProfit = profit;
                low = i;
                high = j;
            }
        }
    }
    
    arbitrage.hIndex = high.toString();
    arbitrage.lIndex = low.toString();
    arbitrage.profit = maxProfit.toFixed(2).toString();
}

// Rendering landing page
app.get("/", (req,res) => {
    var coins  = req;
    console.log(coins);
    res.sendFile(__dirname + "/public/index.html");
});

// Rendering dynamic page after user interaction
app.post("/", async (req,res) =>  {
    // Getting selected coin and quantity from user, then storing it
    const { coins, quantity }  = req.body;
    if(quantity != null)
        arbitrage.quan = quantity;
    else
        arbitrage.quan = 1;

    // Checking if user entered values are valid then sending API calls and calculating arbitrage
    if(coins == null)
        res.render('index.ejs', {obj:coinDetails, coins : {value:"Please Select a Coin!", selected:false},  arbitrage:arbitrage})
    else if(arbitrage.quan <= 0)
        res.render('index.ejs', {obj:coinDetails, coins : {value:"Please enter valid quantity!", selected:false},  arbitrage:arbitrage})
    else {
        await getPrices(coins);
        getTotal(coins);
        findArbitrage(coins);
        res.render('index.ejs', {obj:coinDetails, coins : {value:coins, selected:true}, arbitrage:arbitrage})
    }
});

// Listening on port for clients
app.listen(port, () => {
    console.log("Server Started at port " + port);
})