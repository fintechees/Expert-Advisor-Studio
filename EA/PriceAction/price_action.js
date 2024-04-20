// This EA has a built-in trailing stop management system, so, DO NOT use plugin_for_trailingstop at the same time.
registerEA(
"price_action",
"A strategy based on price action(v1.05)",
[{
	name: "symbolName", // this parameter to set the symbols that you want to have trailing stops applied
	value: "EUR/USD", // e.g. EUR/USD,GBP/USD
	required: true,
	type: "String",
	range: null,
	step: null
}, {
	name: "timeFrame",
	value: TIME_FRAME.M5,
	required: true,
	type: "String",
	range: null,
	step: null
}, {
	name: "candleStickNum",
	value: 8,
	required: true,
	type: "Integer",
	range: [1, 100],
	step: null
}, {
	name: "trailingStop",
	value: 20,
	required: true,
	type: "Number",
	range: [1, 10000],
	step: null
}, {
	name: "volume",
	value: 0.01,
	required: true,
	type: "Number",
	range: [0.01, 10],
	step: null
}],
function (context) { // Init()
	var account = getAccount(context, 0)
	var brokerName = getBrokerNameOfAccount(account)
	var accountId = getAccountIdOfAccount(account)
	var symbolNames = getEAParameter(context, "symbolName").split(",")
	var timeFrame = getEAParameter(context, "timeFrame")
	var candleStickNum = getEAParameter(context, "candleStickNum")
	var trailingStop = getEAParameter(context, "trailingStop")
	var volume = getEAParameter(context, "volume")

	context.priceAction = {
		chartHandles: [],
		candleStickNum: candleStickNum,
		trailingStop: trailingStop,
		volume: volume,
		trendUp: [],
		trendDown: [],
		trendUpLines: [],
		trendDownLines: [],
		trailingStopLines: [],
		openTrades: [],
		checkTrailingStop: function (tick) {
			var cnt = this.openTrades.length

			for (var i = cnt - 1; i >= 0; i--) {
				var openTrade = this.openTrades[i]
				var symbolName = openTrade.symbolName

				if (openTrade.brokerName == tick.brokerName && openTrade.accountId == tick.accountId && symbolName == tick.symbolName) {
					if (openTrade.orderType == "BUY") {
						if (tick.bid - Math.max(openTrade.stopLoss, openTrade.price) > openTrade.trailingStop) {
							openTrade.stopLoss = tick.bid - openTrade.trailingStop
							openTrade.bSlChanged = true

							var chartHandle = this.chartHandles[symbolName]
							var trailingStopId = this.trailingStopLines[openTrade.tradeId]
							setObjectPropPrice1(chartHandle, trailingStopId, openTrade.stopLoss)
							setObjectPropPrice2(chartHandle, trailingStopId, openTrade.stopLoss)
						} else if (tick.bid <= openTrade.stopLoss && openTrade.bSlChanged) {
							closeTrade(openTrade.brokerName, openTrade.accountId, openTrade.tradeId, 0, 0)
							if (openTrade.tradeId == this.openTrades[i].tradeId) { // The reason I added this condition is that during backtesting, closeTrade may trigger onTransaction, which could potentially remove the item after calling syncOpenTrades.
								this.openTrades.splice(i, 1)
							}
						}
					} else {
						if (Math.min(openTrade.stopLoss, openTrade.price) - tick.ask > openTrade.trailingStop) {
							openTrade.stopLoss = tick.ask + openTrade.trailingStop
							openTrade.bSlChanged = true

							var chartHandle = this.chartHandles[symbolName]
							var trailingStopId = this.trailingStopLines[openTrade.tradeId]
							setObjectPropPrice1(chartHandle, trailingStopId, openTrade.stopLoss)
							setObjectPropPrice2(chartHandle, trailingStopId, openTrade.stopLoss)
						} else if (tick.ask >= openTrade.stopLoss && openTrade.bSlChanged) {
							closeTrade(openTrade.brokerName, openTrade.accountId, openTrade.tradeId, 0, 0)
							if (openTrade.tradeId == this.openTrades[i].tradeId) { // The reason I added this condition is that during backtesting, closeTrade may trigger onTransaction, which could potentially remove the item after calling syncOpenTrades.
								this.openTrades.splice(i, 1)
							}
						}
					}
				}
			}
		},
		closeTrades: function (tick, orderType) {
			var cnt = this.openTrades.length
			var reverseCnt = 0

			for (var i = cnt - 1; i >= 0; i--) {
				var openTrade = this.openTrades[i]

				if (openTrade.brokerName == tick.brokerName && openTrade.accountId == tick.accountId && openTrade.symbolName == tick.symbolName) {
					if (openTrade.orderType == orderType) {
						closeTrade(openTrade.brokerName, openTrade.accountId, openTrade.tradeId, 0, 0)
						if (openTrade.tradeId == this.openTrades[i].tradeId) { // The reason I added this condition is that during backtesting, closeTrade may trigger onTransaction, which could potentially remove the item after calling syncOpenTrades.
							this.openTrades.splice(i, 1)
						}
					} else {
						reverseCnt++
					}
				}
			}

			return reverseCnt
		},
		syncOpenTrades: function (tradeId) {
			var cnt = this.openTrades.length

			for (var i = cnt - 1; i >= 0; i--) {
				var openTrade = this.openTrades[i]
				if (openTrade.tradeId == tradeId) {
					this.openTrades.splice(i, 1)
					break
				}
			}
		},
		checkSignals: function (chartHandle, tick, arrTime, arrOpen, arrHigh, arrLow, arrClose) {
			var symbolName = tick.symbolName
			var arrLen = arrOpen.length

			if (arrClose[arrLen - 2] > arrOpen[arrLen - 2] && arrClose[arrLen - 3] < arrOpen[arrLen - 3] && arrClose[arrLen - 4] < arrOpen[arrLen - 4] && arrClose[arrLen - 2] < arrOpen[arrLen - 4]) {
				if (typeof this.trendUp[symbolName] == "undefined") {
					this.trendUpLines[symbolName] = addTrendLine(chartHandle, chartHandle + "_trendUp", arrTime[arrLen - 60], arrHigh[arrLen - 4], arrTime[arrLen - 58], arrHigh[arrLen - 4])
				} else {
					var trendLineId = this.trendUpLines[symbolName]
					setObjectPropTime1(chartHandle, trendLineId, arrTime[arrLen - 60])
					setObjectPropPrice1(chartHandle, trendLineId, arrHigh[arrLen - 4])
					setObjectPropTime2(chartHandle, trendLineId, arrTime[arrLen - 58])
					setObjectPropPrice2(chartHandle, trendLineId, arrHigh[arrLen - 4])
				}

				this.trendUp[symbolName] = arrHigh[arrLen - 4]
			} else if (arrClose[arrLen - 2] < arrOpen[arrLen - 2] && arrClose[arrLen - 3] > arrOpen[arrLen - 3] && arrClose[arrLen - 4] > arrOpen[arrLen - 4] && arrClose[arrLen - 2] > arrOpen[arrLen - 4]) {
				if (typeof this.trendDown[symbolName] == "undefined") {
					this.trendDownLines[symbolName] = addTrendLine(chartHandle, chartHandle + "_trendDown", arrTime[arrLen - 60], arrLow[arrLen - 4], arrTime[arrLen - 58], arrLow[arrLen - 4])
				} else {
					var trendLineId = this.trendDownLines[symbolName]
					setObjectPropTime1(chartHandle, trendLineId, arrTime[arrLen - 60])
					setObjectPropPrice1(chartHandle, trendLineId, arrLow[arrLen - 4])
					setObjectPropTime2(chartHandle, trendLineId, arrTime[arrLen - 58])
					setObjectPropPrice2(chartHandle, trendLineId, arrLow[arrLen - 4])
				}

				this.trendDown[symbolName] = arrLow[arrLen - 4]
			}

			if (typeof this.trendUp[symbolName] == "undefined" || typeof this.trendDown[symbolName] == "undefined") {
				return
			}

			if (arrClose[arrLen - 2] >= this.trendUp[symbolName] && arrClose[arrLen - 3] < this.trendUp[symbolName]) {
				var reverseCnt = this.closeTrades(tick, "SELL")

				if (reverseCnt == 0) {
					var support = Number.MAX_VALUE
					var scope = arrLen - this.candleStickNum
					for (var i = arrLen - 1; i >= scope; i--) {
						if (arrLow[i] < support) {
							support = arrLow[i]
						}
					}

					if (tick.bid - support > 2 / (getSymbolInfo(tick.brokerName, tick.accountId, symbolName).toFixed / 10)) {
						sendOrder(tick.brokerName, tick.accountId, symbolName, ORDER_TYPE.OP_BUY, 0, 0, this.volume, 0, support, "", 0, 0)
					}
				}
			}
			if (arrClose[arrLen - 2] <= this.trendDown[symbolName] && arrClose[arrLen - 3] > this.trendDown[symbolName]) {
				var reverseCnt = this.closeTrades(tick, "BUY")

				if (reverseCnt == 0) {
					var resistance = -Number.MAX_VALUE
					var scope = arrLen - this.candleStickNum
					for (var i = arrLen - 1; i >= scope; i--) {
						if (arrHigh[i] > resistance) {
							resistance = arrHigh[i]
						}
					}

					if (resistance - tick.ask > 2 / (getSymbolInfo(tick.brokerName, tick.accountId, symbolName).toFixed / 10)) {
						sendOrder(tick.brokerName, tick.accountId, symbolName, ORDER_TYPE.OP_SELL, 0, 0, this.volume, 0, resistance, "", 0, 0)
					}
				}
			}
		}
	}

	for (var i in symbolNames) {
		var symbolName = symbolNames[i]
		getQuotes(context, brokerName, accountId, symbolName)
		context.priceAction.chartHandles[symbolName] = getChartHandle(context, brokerName, accountId, symbolName, timeFrame)
	}
},
function (context) { // Deinit()
	for (var i in context.priceAction.chartHandles) {
		var chartHandle = context.priceAction.chartHandles[i]
		removeObject(chartHandle, context.priceAction.trendUpLines[i])
		removeObject(chartHandle, context.priceAction.trendDownLines[i])

		for (var j in context.priceAction.trailingStopLines) {
			removeObject(chartHandle, context.priceAction.trailingStopLines[j])
		}
	}
},
function (context) { // OnTick()
	var tick = getCurrentTick(context)
	context.priceAction.checkTrailingStop(tick)

	var symbolName = tick.symbolName
	var chartHandle = context.priceAction.chartHandles[symbolName]
	var arrTime = getData(context, chartHandle, DATA_NAME.TIME)
	var arrOpen = getData(context, chartHandle, DATA_NAME.OPEN)
	var arrHigh = getData(context, chartHandle, DATA_NAME.HIGH)
	var arrLow = getData(context, chartHandle, DATA_NAME.LOW)
	var arrClose = getData(context, chartHandle, DATA_NAME.CLOSE)

	context.priceAction.checkSignals(chartHandle, tick, arrTime, arrOpen, arrHigh, arrLow, arrClose)
},
function (context) { // OnTransaction()
  var transType = getLatestTransType(context)

  if (transType == "Open Trade") {
		var trans = getLatestTrans(context)
		var transTradeId = getTradeId(trans)
		var transBrokerName = getBrokerName(trans)
	  var transAccountId = getAccountId(trans)
	  var transSymbolName = getSymbolName(trans)
	  var transOrderType = getOrderType(trans).split(" ")[0]
		var transPrice = getOpenPrice(trans)
		var transSl = getStopLoss(trans)

		context.priceAction.openTrades.push({
			tradeId: transTradeId,
			brokerName: transBrokerName,
			accountId: transAccountId,
			symbolName: transSymbolName,
			orderType: transOrderType,
			price: transPrice,
			stopLoss: transSl,
			trailingStop: context.priceAction.trailingStop / (getSymbolInfo(transBrokerName, transAccountId, transSymbolName).toFixed / 10),
			bSlChanged: false
		})

		var chartHandle = context.priceAction.chartHandles[transSymbolName]
		var arrTime = getData(context, chartHandle, DATA_NAME.TIME)
		var arrLen = arrTime.length
		context.priceAction.trailingStopLines[transTradeId] = addTrendLine(chartHandle, transTradeId + "_trailingStop", arrTime[arrLen - 2], transSl, arrTime[arrLen - 1], transSl)
	} else if (transType == "Trade Closed") {
		var trans = getLatestTrans(context)
		context.priceAction.syncOpenTrades(getTradeId(trans))

		var chartHandle = context.priceAction.chartHandles[getSymbolName(trans)]
		removeObject(chartHandle, context.priceAction.trailingStopLines[getTradeId(trans)])
		delete context.priceAction.trailingStopLines[getTradeId(trans)]
  }
})
