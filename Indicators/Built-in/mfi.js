registerIndicator("mfi", "Market Facilitation Index(v1.01)", function (context) {
		var dataInputHigh = getDataInput(context, 0)
		var dataInputLow = getDataInput(context, 1)
		var dataInputVol = getDataInput(context, 2)
		var dataOutput = getDataOutput(context, "mfi")
		var dataOutputH = getDataOutput(context, "highestTmp")
		var dataOutputL = getDataOutput(context, "lowestTmp")
		var dataOutputV = getDataOutput(context, "volSumTmp")
		var period = getIndiParameter(context, "period")

		var calculatedLength = getCalculatedLength(context)

		getHighestOnArray(dataInputHigh, dataOutputH, calculatedLength, period)
		getLowestOnArray(dataInputLow, dataOutputL, calculatedLength, period)
		sumOnArray(dataInputVol, dataOutputV, calculatedLength, period)

		var i = calculatedLength

		if (i != 0) {
			i--
		}

		while (i < dataInputVol.length) {
			if (dataOutputV[i] == 0) {
				dataOutput[i] = 0
			} else {
				dataOutput[i] = (dataOutputH[i] - dataOutputL[i]) / dataOutputV[i]
			}

			i++
		}
	},[{
    name: "period",
    value: 1,
    required: false,
    type: PARAMETER_TYPE.INTEGER,
    range: [1, 100]
	}],
	[{
    name: DATA_NAME.HIGH,
    index: 0
	},{
    name: DATA_NAME.LOW,
    index: 1
	},{
		name: DATA_NAME.VOLUME,
		index: 2
	}],
	[{
		name: "mfi",
		visible: true,
		renderType: RENDER_TYPE.HISTOGRAM,
		color: "steelblue"
	},{
		name: "highestTmp",
		visible: false
	},{
		name: "lowestTmp",
		visible: false
	},{
		name: "volSumTmp",
		visible: false
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
