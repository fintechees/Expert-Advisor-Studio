registerEA(
"plugin_for_trailingstop",
"A plugin to manage trailing stop(v1.0)",
[{
	name: "symbolName", // this parameter to set the symbols that you want to have trailing stops applied
	value: "EUR/USD", // e.g. EUR/USD,GBP/USD
	required: true,
	type: "String",
	range: null,
	step: null
}, {
	name: "trailingStop",
	value: 20,
	required: true,
	type: "Number",
	range: null,
	step: null
}],
function (context) { // Init()
	context.openTrades = []
	var account = getAccount(context, 0)
	var brokerName = getBrokerNameOfAccount(account)
	var accountId = getAccountIdOfAccount(account)
	var symbolNames = getEAParameter(context, "symbolName").split(",")

	for (var i in symbolNames) {
		var symbolName = symbolNames[i]
		getQuotes(context, brokerName, accountId, symbolName)
	}
},
function (context) { // Deinit()
},
function (context) { // OnTick()
  var trailingStop = getEAParameter(context, "trailingStop")

	var tick = getCurrentTick(context)
	var cnt = context.openTrades.length

	for (var i = cnt - 1; i >= 0; i--) {
		var openTrade = context.openTrades[i]

		if (openTrade.brokerName == tick.brokerName && openTrade.accountId == tick.accountId && openTrade.symbolName == tick.symbolName) {
			var toFixed = getSymbolInfo(openTrade.brokerName, openTrade.accountId, openTrade.symbolName).toFixed / 10

			if (openTrade.orderType == "BUY") {
				if (tick.bid - openTrade.stopLoss > trailingStop / toFixed) {
					openTrade.stopLoss = tick.bid - trailingStop / toFixed
				} else if (tick.bid <= openTrade.stopLoss) {
					closeTrade(openTrade.brokerName, openTrade.accountId, openTrade.tradeId, 0, 0)
					context.openTrades.splice(i, 1)
				}
			} else {
				if (openTrade.stopLoss - tick.ask > trailingStop / toFixed) {
					openTrade.stopLoss = tick.ask + trailingStop / toFixed
				} else if (tick.ask >= openTrade.stopLoss) {
					closeTrade(openTrade.brokerName, openTrade.accountId, openTrade.tradeId, 0, 0)
					context.openTrades.splice(i, 1)
				}
			}
		}
	}
},
function (context) { // OnTransaction()
	var trailingStop = getEAParameter(context, "trailingStop")
  var transType = getLatestTransType(context)

  if (transType == "Open Trade") {
		var trans = getLatestTrans(context)
		var transTradeId = getTradeId(trans)
		var transBrokerName = getBrokerName(trans)
	  var transAccountId = getAccountId(trans)
	  var transSymbolName = getSymbolName(trans)
	  var transOrderType = getOrderType(trans).split(" ")[0]
		var transPrice = getOpenPrice(trans)
		var toFixed = getSymbolInfo(transBrokerName, transAccountId, transSymbolName).toFixed / 10

		context.openTrades.push({
			tradeId: transTradeId,
			brokerName: transBrokerName,
			accountId: transAccountId,
			symbolName: transSymbolName,
			orderType: transOrderType,
			price: transPrice,
			stopLoss: (transOrderType == "BUY" ? (transPrice - trailingStop / toFixed) : (transPrice + trailingStop / toFixed))
		})
  }
})
