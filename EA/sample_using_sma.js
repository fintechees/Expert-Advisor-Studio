registerEA(
	"sample_using_sma",
	"A test EA based on sma(v1.0)",
	[{ // parameters
		name: "period",
		value: 20,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	function (context) { // Init()
		var account = getAccount(context, 0)
		var brokerName = getBrokerNameOfAccount(account)
		var accountId = getAccountIdOfAccount(account)
		var symbolName = "EUR/USD"

		getQuotes (context, brokerName, accountId, symbolName)
		window.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1)
		var period = getEAParameter(context, "period")
		window.indiHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1, "sma", [{
			name: "period",
			value: period
		}])
	},
	function (context) { // Deinit()
		delete window.currTime
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

		var arrClose = getData(context, window.chartHandle, DATA_NAME.CLOSE)
		var arrSma = getData(context, window.indiHandle, "sma")

		var ask = getAsk(context, brokerName, accountId, symbolName)
		var bid = getBid(context, brokerName, accountId, symbolName)
		var limitPrice = 0.0003
		var stopPrice = 0.0003
		var volume = 0.01

		if (arrClose[arrClose.length - 3] < arrSma[arrSma.length - 3] && arrClose[arrClose.length - 2] > arrSma[arrSma.length - 2]) {
			sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUYLIMIT, ask-limitPrice, 0, volume, ask+limitPrice, bid-3*stopPrice, "")
		} else if (arrClose[arrClose.length - 3] > arrSma[arrSma.length - 3] && arrClose[arrClose.length - 2] < arrSma[arrSma.length - 2]) {
			sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELLLIMIT, bid+limitPrice, 0, volume, bid-limitPrice, ask+3*stopPrice, "")
		}
	}
)
