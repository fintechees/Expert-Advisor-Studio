registerIndicator(
    "atr", "Average true range", function (context) {
        var dataInputClose = getDataInput(context, 0)
		var dataInputHigh = getDataInput(context, 1)
		var dataInputLow = getDataInput(context, 2)
		var tmpLine = getDataOutput(context, "tmp")
		var dataOutput = getDataOutput(context, "atr")

		var period = getIndiParameter(context, "period")

		var start = getCalculatedLength(context)
		var high = null
		var low = null
		var prevClose = null

		if (start > 0) {
			start--
		} else {
			tmpLine[start] = 0
			start = 1
		}

		while (start < dataInputClose.length) {
			high = dataInputHigh[start]
			low = dataInputLow[start]
			prevClose = dataInputClose[start - 1]

			tmpLine[start] = Math.max(high, prevClose) - Math.min(low, prevClose)

			start++
		}

		start = getCalculatedLength(context)

		if (start > 0) {
			start--
		} else {
			for (var i = 0; i < period - 1; i++) {
				dataOutput[i] = 0
			}

			start = period - 1
		}

		var sum = 0

		for (var i = start - period + 1; i < start; i++) {
			sum += tmpLine[i]
		}

		for (var i = start; i < dataInputClose.length; i++) {
			sum += tmpLine[i]
			dataOutput[i] = sum / period
			sum -= tmpLine[i - period + 1]
		}
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
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
