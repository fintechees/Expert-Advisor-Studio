registerIndicator(
    "macd", "MACD", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataFEMA = getDataOutput(context, "fastEMA")
		var dataSEMA = getDataOutput(context, "slowEMA")
		var dataOutputMain = getDataOutput(context, "main")
		var dataOutputSignal = getDataOutput(context, "signal")

		var fEMA = getIndiParameter(context, "fasteEMA")
		var fSmthFctr = 2.0 / (fEMA + 1)
		var sEMA = getIndiParameter(context, "slowEMA")
		var sSmthFctr = 2.0 / (sEMA + 1)
		var sgnlSMA = getIndiParameter(context, "signalSMA")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i == 0) {
			dataFEMA[0] = dataInput[0]
			dataSEMA[0] = dataInput[0]
			dataOutputMain[0] = 0
			i++
		} else if (i == 1) {
		} else {
			i--
		}

		ema(dataInput, dataFEMA, calculatedLength, fSmthFctr)
		ema(dataInput, dataSEMA, calculatedLength, sSmthFctr)

		while (i < dataInput.length) {
			dataOutputMain[i] = dataFEMA[i] - dataSEMA[i]
			i++
		}

		sma(dataOutputMain, dataOutputSignal, calculatedLength, sgnlSMA)
	},[{
		name: "fasteEMA",
		value: 12,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "slowEMA",
		value: 26,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "signalSMA",
		value: 9,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "fastEMA",
		visible: false
	},{
		name: "slowEMA",
		visible: false
	},{
        name: "main",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#4EC2B4"
    },{
        name: "signal",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "white"
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
