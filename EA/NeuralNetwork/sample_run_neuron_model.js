registerEA(
		"sample_run_neuron_model",
		"A test EA to run neuron model(v1.04)",
		[{ // parameters
			name: "period",
			value: 20,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [1, 100]
		},{
			name: "inputNum",
			value: 20,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [1, 100]
		},{
			name: "threshold",
			value: 0.3,
			required: true,
			type: PARAMETER_TYPE.NUMBER,
			range: [0, 1]
		},{
			name: "takeProfit",
			value: 0.0001,
			required: true,
			type: PARAMETER_TYPE.NUMBER,
			range: [0, 100]
		}],
		function (context) { // Init()
			// We use localstorage.reservedZone to store the neural network.
			// Please don't change the name "reservedZone" or your data stored in this zone will be removed while the version is updated.
			if (typeof localStorage.reservedZone == "undefined") return

			var reservedZone = JSON.parse(localStorage.reservedZone)
			if (typeof reservedZone.sample_training_neuron_model == "undefined") return
			context.myPerceptron = synaptic.Network.fromJSON(reservedZone.sample_training_neuron_model)

			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			getQuotes (context, brokerName, accountId, symbolName)
			context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1)
			var period = getEAParameter(context, "period")
			context.indiHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1, "rsi", [{
				name: "period",
				value: period
			}])
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
			var arrTime = getData(context, context.chartHandle, DATA_NAME.TIME)
			if (typeof context.currTime == "undefined") {
				context.currTime = arrTime[arrTime.length - 1]
			} else if (context.currTime != arrTime[arrTime.length - 1]) {
				context.currTime = arrTime[arrTime.length - 1]
			} else {
				return
			}

			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			var period = getEAParameter(context, "period")
			var inputNum = getEAParameter(context, "inputNum")
			var threshold = getEAParameter(context, "threshold")
			var takeProfit = getEAParameter(context, "takeProfit")
			var arrRsi = getData(context, context.indiHandle, "rsi")

			if (inputNum + period - 1 > arrRsi.length) throw new Error("No enough data.")

			var input = []

			for (var i = arrRsi.length - inputNum - 1; i < arrRsi.length - 1; i++) {
				input.push(arrRsi[i] / 100)
			}

			var result = context.myPerceptron.activate(input)[0]
			printMessage(result)

			var ask = null
			var bid = null
			var volume = 0.01

			try {
				ask = getAsk(context, brokerName, accountId, symbolName)
				bid = getBid(context, brokerName, accountId, symbolName)
			} catch (e) {
				// This try-catch is used to bypass the "error throw" when you start the EA too early to call getAsk or getBid(at that time, bid or ask may be not ready yet.)
				printErrorMessage(e.message)
				return
			}

			if (result < 0.5 - threshold) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUY, 0, 0, volume, ask+takeProfit, bid-3*takeProfit, "", 0, 0)
			} else if (result > 0.5 + threshold) {
				sendOrder(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELL, 0, 0, volume, bid-takeProfit, ask+3*takeProfit, "", 0, 0)
			}
		}
	)
