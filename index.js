const request = require("request");
const requestPromise = require('request-promise');
const domain = 'https://back.bitcointoyou.com/api/v2/'
const CryptoJS = require("crypto-js");
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
/*
You can consult ao API documentation on https://apidoc.bitcointoyou.com/
//Change to you API Key and Secret https://pro.bitcointoyou.com/api
*/
const apiKey = 'XXXXXXXXXXXXXXXXXXXXXX'
const apiSecret = 'XXXXXXXXXXXXXXXXXXX'

start()

async function start()
{
    console.log('running')

    if (apiKey == 'XXXXXXXXXXXXXXXXXXXXXX')
    {
        console.log('You need to write your API Key and Secret. Go to https://pro.bitcointoyou.com/api to get one.')
        return
    }
        

    const pair = 'BTC_BRLC'

    /*
    First calling public endpoints, because don't need to login
     with API Key and Secret
    */

    await getPrice(pair)

    await getTicker(pair)

    await getTrades(pair, 5)

    await getOrderBook(pair, 6)
    


    /*
    Now we will use private endpoints. To call it, you need to 
    create API Key and Secret on https://pro.bitcointoyou.com/api
    Do not share you API Secret with others
    */

    let balance = await getBalance()

    await createLimitOrder(1, 0.000001, pair, 'BUY')
    
    await createLimitOrder(9999999, 0.000001, pair, 'SELL')

    await createMarketOrder(0.000001, pair, 'SELL')

    let orderList = await getOrders(pair)

    let id = orderList.openedOrders[0].orderID
    
    let order = await getOrder(id)

    response = await cancelOrder(id)    

    response = await cancelAllOrders(pair)    

}

async function getOrderBook(pair, depth)
{
    try {
        
        const url = domain + `orderbook?pair=${pair}&depth=${depth}` 
        
        response = await requestPromise(url)
        
        response = JSON.parse(response)
        
        console.log(response)
        return response
        
                
        
    } catch (error) {
        console.log('Bitcointoyou.getBalance', error, 'error')
        console.log('erro when get balance')
        
        //return Promise.reject(error);
    }
}

async function getTrades(pair, depth)
{
    try {
        
        const url = domain + `trades?pair=${pair}&depth=${depth}` 
        
        response = await requestPromise(url)
        
        response = JSON.parse(response)
        
        console.log(response.list)
        return response
        
                
        
    } catch (error) {
        console.log('Bitcointoyou.getBalance', error, 'error')
        console.log('erro when get balance')
        
        //return Promise.reject(error);
    }
}

async function getPrice(pair)
{
    try {
        
        const url = domain + 'price?pair=' + pair
        
        response = await requestPromise(url)
        
        response = JSON.parse(response)
        
        console.log(response)
        return response
        
                
        
    } catch (error) {
        console.log('Bitcointoyou.getBalance', error, 'error')
        console.log('erro when get balance')
        
        //return Promise.reject(error);
    }
}

async function getTicker(pair)
{
    try {
        
        const url = domain + 'ticker?pair=' + pair
        
        response = await requestPromise(url)
        
        response = JSON.parse(response)
        
        console.log(response.summary)
        return response.summary
        
                
        
    } catch (error) {
        console.log('Bitcointoyou.getTicker', error, 'error')
        console.log('erro when get getTicker')
        
        //return Promise.reject(error);
    }
}

async function getOrder(id)
{
    try {
        
        let url = domain + 'getOrder'
        let body = {};
        body.orderID = id      
        config = await getConfigOrder(url, id)
        response = await requestPromise(config)
        response = JSON.parse(response)
        if (response.error == false && response.data.length > 0)
        {
            return response.data[0]
        }
        throw new Error(response)        
    } catch (error) {
        console.log('Bitcointoyou.getOrder', error.message, 'error')        
    }       
}

async function getConfigOrder(url, orderID)
{
    await sleep(1000)    
    let nonce = getNonce()   
    var options = { method: 'POST',
    url: url,
    headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded',
            key: apiKey,
            nonce: nonce,
            signature: generateSignature(nonce)
        },
    form: 
        {             
            orderID: orderID 
        } 
    };

    return options
}

async function getOrders(pair, startDate, status)
{
    try {
        
        let url = domain + 'getOrders'        
        config = await getConfigGetOrders(url, pair, startDate, status)
        response = await requestPromise(config)
        response = JSON.parse(response)
        if (response.error == false)
        {
            return response.data
        }
        throw new Error(response)        
    } catch (error) {
        console.log('Bitcointoyou.getOrder', error.message, 'error')        
    }       
}

async function getConfigGetOrders(url, pair, startDate, status)
{
    await sleep(1000)    
    let nonce = getNonce()   
    var options = { method: 'POST',
    url: url,
    headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded',
            key: apiKey,
            nonce: nonce,
            signature: generateSignature(nonce)
        },
    form: 
        {             
            pair: pair ,
            iniDate: startDate,
            status: status,
        } 
    };

    return options
}

async function createMarketOrder(amount, pair, side)
{
    let response = ''
    
        let url = domain + 'marketOrder'
        config = await getConfigTrade(url, amount, 0, side, pair)
        response = await requestPromise(config)
        response = JSON.parse(response)
        if (response.error == undefined || response.error == false)
        {
            if (response == 'Insuficient balance')
            {
                console.log(response + ' ' + pair.money)
                return ''
            }
            console.log(response.data)
            return response.data
        }        
    
}


async function createLimitOrder(price, amount, pair, side)
{
    let response = ''
    
        let url = domain + 'limitOrder'
        config = await getConfigTrade(url, amount, price, side, pair)
        response = await requestPromise(config)
        response = JSON.parse(response)
        if (response.error == undefined || response.error == false)
        {
            if (response == 'Insuficient balance')
            {
                console.log(response + ' ' + pair.money)
                return ''
            }
            console.log(response.data)
            return response.data
        }        
    
}

async function cancelOrder(id)
{
    try {
        
        let url = domain + 'cancel'
        let body = {};
        body.orderID = id      
        config = await getConfigOrder(url, id)
        response = await requestPromise(config)
        if (response.error == undefined)
        {
            response = JSON.parse(response)
            console.log(response.data)
            return response.data
        }
        throw new Error(response)        
    } catch (error) {
        console.log('Bitcointoyou.cancelOrder', error.message, 'error')        
    }       
}

async function cancelAllOrders(pair)
{
    let response = ''    
    let url = domain + 'cancellall'                
    config = await getConfig(url, pair)
    response = await request(config, function (error, response, body) {
    if (error) throw new Error(error);

    if (response.statusCode != 200)
    {
        console.log('erro ao cancelar ordens')
        console.log(response.statusCode)
        console.log(response)
    }
    response = JSON.parse(response.body)
    console.log(response.data)
    return response.data
})    
}

async function getConfigTrade(url, amount, price, side, pair)
{
    
    await sleep(1000)    
    let nonce = getNonce()
   
    var options = { method: 'POST',
    url: url,
    headers: 
        { 'Postman-Token': '8b5f60fe-baa7-4ff7-82fc-a88fd91a3085',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        key: apiKey,
        nonce: nonce,
        signature: generateSignature(nonce),
        },
    form: 
        { 
        amount: amount,
        price: price,
        side: side,
        pair: pair } 
    };

    return options
}

async function getConfig(url, pair)
{
    await sleep(1000)
    let nonce = getNonce()   
    var options = { method: 'POST',
    url: url,
    headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded',
            key: apiKey,
            nonce: nonce,
            signature: generateSignature(nonce),

        },
    form: 
        {             
            pair: pair 
        } 
    };    
    return options
}

let balancesList = []

async function getBalance(pair)
{
    try {
        
        const url = domain + 'BALANCE'
        
        config = await getConfig(url, pair)
        response = await requestPromise(config)
        if (response.status != undefined && response.status != 200)
        {
            console.log('erro ao obter saldo')
            throw new Error(response.data.error);
        }

        response = JSON.parse(response)
        response.data = response

        balancesList = response.data

        console.log(response.available)
        let balance = {}
        for(i = 0; i < response.available.length; i++)
        {
            
            if (response.available[i].asset == 'USDT')
                balance.usdt = response.available[i].amount
                
        
            if (response.available[i].asset == 'USDC')
                balance.usdc = response.available[i].amount
        
            if (response.available[i].asset == 'BTC')                
                balance.btc = response.available[i].amount
            
            if (response.available[i].asset == 'ETH')
                balance.eth = response.available[i].amount
            
            if (response.available[i].asset == 'LTC')
                balance.ltc = response.available[i].amount
            
            if (response.available[i].asset == 'BRLC')
                balance.brlc = response.available[i].amount
            
        }

        return balance
        
        
                
        
    } catch (error) {
        console.log('Bitcointoyou.getBalance', error, 'error')
        console.log('erro when get balance')
        
        //return Promise.reject(error);
    }
}

function getNonce()
{    
    return new Date().getTime() + 777;
}

function generateSignature(nonce)
{
    var message = nonce + apiKey;
    var hash = CryptoJS.HmacSHA256(message, apiSecret);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    return hashInBase64;
}