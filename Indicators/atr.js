registerIndicator(
    "atr", "Average true range", function (context) {
		var dataInputClose = getDataInput(context, 0)
		var dataInputHigh = getDataInput(context, 1)
		var dataInputLow = getDataInput(context, 2)
		var tmpLine = getDataOutput(context, "tmp")
		var dataOutput = getDataOutput(context, "atr")

		var period = getIndiParameter(context, "period")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength
		var high = null
		var low = null
		var prevClose = null

		if (i > 0) {
			i--
		} else {
			tmpLine[i] = 0
			i = 1
		}

		while (i < dataInputClose.length) {
			high = dataInputHigh[i]
			low = dataInputLow[i]
			prevClose = dataInputClose[i - 1]

			tmpLine[i] = Math.max(high, prevClose) - Math.min(low, prevClose)

			i++
		}

		sma(tmpLine, dataOutput, calculatedLength, period)
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	},{
		name: DATA_NAME.HIGH,
		index: 1
	},{
		name: DATA_NAME.LOW,
		index: 2
	}],
	[{
        name: "tmp",
        visible: false
    },{
        name: "atr",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "steelblue"
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
