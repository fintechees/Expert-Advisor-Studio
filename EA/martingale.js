registerEA(
	"sample_martingale",
	"A test EA based on Martingale algorithm(v1.0)",
	[{ // parameters
		name: "period",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	function (context) { // Init()
		var account = getAccount(context, 0)
		var brokerName = getBrokerNameOfAccount(account)
		var accountId = getAccountIdOfAccount(account)
		var symbolName = "EUR/USD"

		window.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1)
		var period = getEAParameter(context, "period")
		window.indiHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1, "sma", [{
			name: "period",
			value: period
		}])
	},
	function (context) { // Deinit()
		delete window.currTime
		delete window.chartHandle
		delete window.indiHandle
	},
	function (context) { // OnTick()
		var arrTime = getData(context, window.chartHandle, DATA_NAME.TIME)
		if (typeof window.currTime == "undefined") {
			window.currTime = arrTime[arrTime.length - 1]
		} else if (window.currTime != arrTime[arrTime.length - 1]) {
			window.currTime = arrTime[arrTime.length - 1]
		} else {
			return
		}

		var account = getAccount(context, 0)
		var brokerName = getBrokerNameOfAccount(account)
		var accountId = getAccountIdOfAccount(account)
		var symbolName = "EUR/USD"

		var count = getOpenTradesListLength(context)
		var totalPL = 0.0
		var highPrice = 0.0
		var lowPrice = 100000000.0
		var orientation = null

		for (var i = count - 1; i >= 0; i--) {
			var openTrade = getOpenTrade(context, i)

			totalPL += getUnrealizedPL(openTrade)

			var openPrice = getOpenPrice(openTrade)

			if (openPrice > highPrice) highPrice = openPrice
			if (openPrice < lowPrice) lowPrice = openPrice
			if (getOrderType(openTrade) == ORDER_TYPE.BUY) orientation = ORDER_TYPE.BUY
			if (getOrderType(openTrade) == ORDER_TYPE.SELL) orientation = ORDER_TYPE.SELL
		}

		var arrClose = getData(context, window.chartHandle, DATA_NAME.CLOSE)
		var arrSma = getData(context, window.indiHandle, "sma")

		var volume = 0.01

		if (count > 0 && totalPL > 0.1 * count) {
			for (var i = count - 1; i >= 0; i--) {
				var openTrade = getOpenTrade(context, i)

				closeTrade(brokerName, accountId, getTradeId(openTrade), 0, 0)
			}
		} else if (count == 0) {
			if (arrClose[arrClose.length - 3] < arrSma[arrSma.length - 3] && arrClose[arrClose.length - 2] > arrSma[arrSma.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUY, 0, 0, volume, 0, 0, "", 0, 0)
			} else if (arrClose[arrClose.length - 3] > arrSma[arrSma.length - 3] && arrClose[arrClose.length - 2] < arrSma[arrSma.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELL, 0, 0, volume, 0, 0, "", 0, 0)
			}
		} else {
			if (orientation == ORDER_TYPE.BUY && (lowPrice - arrClose[arrClose.length - 1]) > 0.0005) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUY, 0, 0, volume, 0, 0, "", 0, 0)
			}
			if (orientation == ORDER_TYPE.SELL && (arrClose[arrClose.length - 1] - highPrice) > 0.0005) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELL, 0, 0, volume, 0, 0, "", 0, 0)
			}
		}
	},
	function (context) { // OnTransaction()
		printMessage("test OnTransaction: " + getLatestTransId(context) + " " + getLatestTransType(context))
	}
)
