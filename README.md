# apiExample
Use this example code to call Bitcointoyou API
Full documentation in https://apidoc.bitcointoyou.com/
If you need support go to https://bitcointoyou.com and 
ask by chat or send email to: contato@bitcointoyou.com or support@bitcointoyou.com

Before start, you need to create API Key and API Secret at https://pro.bitcointoyou.com/api
Copy API and secret at line 12 and 13 of file index.js:
const apiKey = 'XXXXXXXXXXXXXXXXXXXXXX'
const apiSecret = 'XXXXXXXXXXXXXXXXXXX'

To create signature:

function generateSignature(key, secret, nonce) {
var message = nonce + key; var hash = CryptoJS.HmacSHA256(message, secret); var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
return hashInBase64; }

Remember to run npm i on folder to install dependencies 

Use this code with your risk, only to educational use.

With this code you can call public endpoints:

await getPrice(pair)

await getTicker(pair)

await getTrades(pair, 5)

await getOrderBook(pair, 6)


With this code you can call private endpoints:

let balance = await getBalance()

await createLimitOrder(1, 0.000001, pair, 'BUY') 

await createLimitOrder(9999999, 0.000001, pair, 'SELL')

await createMarketOrder(0.000001, pair, 'SELL')

let orderList = await getOrders(pair)

let id = orderList.openedOrders[0].orderID

let order = await getOrder(id)

response = await cancelOrder(id)   

response = await cancelAllOrders(pair)


Obs: pair = BTC_BRLC or LTC_USDT or B2U_BRLC or BTC_USDT
