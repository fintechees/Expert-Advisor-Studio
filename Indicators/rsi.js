registerIndicator(
    "rsi", "Relative strength index(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "rsi")
		var dataOutputHL = getDataOutput(context, "rsiHighLevel")
		var dataOutputLL = getDataOutput(context, "rsiLowLevel")
		var gainTmp = getDataOutput(context, "gainTmp")
		var lossTmp = getDataOutput(context, "lossTmp")

		var period = getIndiParameter(context, "period")
		var highLevel = getIndiParameter(context, "highLevel")
		var lowLevel = getIndiParameter(context, "lowLevel")

		var calculatedLength = getCalculatedLength(context)

		var ptr = null
		var ptr2 = null

		var diff = null
		var gain = null
		var loss = null
		var gainSum = 0
		var lossSum = 0

		if (calculatedLength > 0) {
			ptr = calculatedLength - 1
			ptr2 = calculatedLength - period
		} else {
			for (var i = 0; i < period; i++) {
				dataOutput[i] = 0
				dataOutputHL[i] = highLevel
				dataOutputLL[i] = lowLevel
			}

			ptr = period
			ptr2 = 1

			while (ptr2 <= ptr) {
				diff = dataInput[ptr2] - dataInput[ptr2 - 1]
				if (0 < diff) {
					gainSum += diff
				} else {
					lossSum -= diff
				}
				ptr2++
			}
			gain = gainSum / period
			loss = lossSum / period
			if (0 == (gain + loss)) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = 100 * gain / (gain + loss)
			}
			dataOutputHL[ptr] = highLevel
			dataOutputLL[ptr] = lowLevel
			gainTmp[ptr] = gain
			lossTmp[ptr] = loss
			ptr++
		}

		while (ptr < dataInput.length) {
			gain = gainTmp[ptr - 1] * (period - 1)
			loss = lossTmp[ptr - 1] * (period - 1)

			diff = dataInput[ptr] - dataInput[ptr - 1]
			if (0 < diff) {
				gain += diff
			} else {
				loss -= diff
			}
			gain = gain / period
			loss = loss / period

			if (0 == (gain + loss)) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = 100 * gain / (gain + loss)
			}
			dataOutputHL[ptr] = highLevel
			dataOutputLL[ptr] = lowLevel
			gainTmp[ptr] = gain
			lossTmp[ptr] = loss
			ptr++
		}
	},[{
		name: "period",
		value: 14,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "highLevel",
		value: 70,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "lowLevel",
		value: 30,
		required: false,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	}],
	[{
		name: DATA_NAME.CLOSE,
		index: 0
	}],
	[{
		name: "rsi",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	},{
		name: "rsiHighLevel",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "#AAAAAA"
	},{
		name: "rsiLowLevel",
		visible: true,
		renderType: RENDER_TYPE.DASHARRAY,
		color: "#AAAAAA"
	},{
        name: "gainTmp",
        visible: false
    },{
        name: "lossTmp",
        visible: false
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
