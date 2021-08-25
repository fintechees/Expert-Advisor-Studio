registerEA(
		"sample_using_rsi",
		"A test EA based on rsi(v1.0)",
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
			window.indiHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1, "rsi", [{
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

			var arrRsi = getData(context, window.indiHandle, "rsi")

			var ask = null
			var bid = null
			try {
				ask = getAsk(context, brokerName, accountId, symbolName)
				bid = getBid(context, brokerName, accountId, symbolName)
			} catch (e) {
				// This try-catch is used to bypass the "error throw" when you start the EA too early to call getAsk or getBid(at that time, bid or ask may be not ready yet.)
				printErrorMessage(e.message)
				return
			}

			var limitPrice = 0.0003
			var stopPrice = 0.0003
			var volume = 0.01

			if (30 < arrRsi[arrRsi.length - 3] && 30 > arrRsi[arrRsi.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUYLIMIT, ask-limitPrice, 0, volume, ask+limitPrice, bid-3*stopPrice, "", 0, 0)
			} else if (70 > arrRsi[arrRsi.length - 3] && 70 < arrRsi[arrRsi.length - 2]) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELLLIMIT, bid+limitPrice, 0, volume, bid-limitPrice, ask+3*stopPrice, "", 0, 0)
			}
		}
	)
