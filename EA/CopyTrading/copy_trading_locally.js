registerEA(
"copytrading_locally",
"A simple EA to copy trading locally(v1.0)",
[{
	name: "fromAccountId",
	value: "XXXXXXXXXX", // e.g. account id:1066149, investor password: 1
	required: true,
	type: "String",
	range: null,
	step: null
}, {
	name: "toAccountId",
	value: "XXXXXXXXXX",
	required: true,
	type: "String",
	range: null,
	step: null
}],
function (context) { // Init()
		},
function (context) { // Deinit()
		},
function (context) { // OnTick()
		},
function (context) { // OnTransaction()
  var account = getAccount(context, 0)
  var brokerName = getBrokerNameOfAccount(account)
  var fromAccountId = getEAParameter(context, "fromAccountId")
  var toAccountId = getEAParameter(context, "toAccountId")
  var volume = 0.01
  var transType = getLatestTransType(context)
  var trade = getLatestTrans(context)
  var tradeAccountId = getAccountId(trade)
  var tradeSymbolName = getSymbolName(trade)
  var tradeOrderType = getOrderType(trade)

  if (transType == "Open Trade" && tradeAccountId == fromAccountId) {
    if (tradeOrderType == ORDER_TYPE.OP_BUY || tradeOrderType == ORDER_TYPE.OP_BUYLIMIT || tradeOrderType == ORDER_TYPE.OP_BUYSTOP) {
      sendOrder(brokerName, toAccountId, tradeSymbolName, ORDER_TYPE.OP_BUY, 0, 0, volume, 0, 0, "", 0, 0)
    } else if (tradeOrderType == ORDER_TYPE.OP_SELL || tradeOrderType == ORDER_TYPE.OP_SELLLIMIT || tradeOrderType == ORDER_TYPE.OP_SELLSTOP) {
      sendOrder(brokerName, toAccountId, tradeSymbolName, ORDER_TYPE.OP_SELL, 0, 0, volume, 0, 0, "", 0, 0)
    }
  } else if (transType == "Trade Closed" && tradeAccountId == fromAccountId) {
    var tradeOrderType2 = null

    if (tradeOrderType == ORDER_TYPE.OP_BUY || tradeOrderType == ORDER_TYPE.OP_BUYLIMIT || tradeOrderType == ORDER_TYPE.OP_BUYSTOP) {
      tradeOrderType2 = ORDER_TYPE.OP_BUY
    } else if (tradeOrderType == ORDER_TYPE.OP_SELL || tradeOrderType == ORDER_TYPE.OP_SELLLIMIT || tradeOrderType == ORDER_TYPE.OP_SELLSTOP) {
      tradeOrderType2 = ORDER_TYPE.OP_SELL
    }

    var count = getOpenTradesListLength(context)
    var tradeId = null

    for (var i = count - 1; i >= 0; i--) {
      var openTrade = getOpenTrade(context, i)
      var accountId = getAccountId(openTrade)
      var symbolName = getSymbolName(openTrade)
      var orderType = getOrderType(openTrade)

      if (accountId == toAccountId && symbolName == tradeSymbolName && tradeOrderType2 == orderType) {
        tradeId = getTradeId(openTrade)
        break
      }
    }

    if (tradeId != null) {
      closeTrade(brokerName, toAccountId, tradeId, 0, 0)
    } else {
      if (tradeOrderType2 == ORDER_TYPE.OP_BUY) {
        sendOrder(brokerName, toAccountId, tradeSymbolName, ORDER_TYPE.OP_SELL, 0, 0, volume, 0, 0, "", 0, 0)
      } else if (tradeOrderType2 == ORDER_TYPE.OP_SELL) {
        sendOrder(brokerName, toAccountId, tradeSymbolName, ORDER_TYPE.OP_BUY, 0, 0, volume, 0, 0, "", 0, 0)
      }
    }
  }
})
