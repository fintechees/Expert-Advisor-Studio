registerEA(
		"historical_data_viewer",
		"An EA only used for watching historical data in the backtesting mode(v1.0)",
		[{ // parameters
			name: "symbolName",
	    value: "EUR/USD",
	    required: true,
	    type: PARAMETER_TYPE.STRING,
	    range: null
	  },{
			name: "timeFrame",
	    value: TIME_FRAME.H1,
	    required: true,
	    type: PARAMETER_TYPE.STRING,
	    range: null
		}],
		function (context) { // Init()
			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = getEAParameter(context, "symbolName")
			var timeFrame = getEAParameter(context, "timeFrame")

			context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, timeFrame)
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
		},
		function (context) { // OnTransaction()
		}
	)
