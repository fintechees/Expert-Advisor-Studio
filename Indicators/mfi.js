registerIndicator("mfi", "Market Facilitation Index(v1.0)", function (context) {
		var dataInputHigh = getDataInput(context, 0)
		var dataInputLow = getDataInput(context, 1)
		var dataInputVol = getDataInput(context, 2)
		var dataOutput = getDataOutput(context, "mfi")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i != 0) {
			i--
		}

		while (i < dataInputVol.length) {
			if (dataInputVol[i] == 0) {
				dataOutput[i] = 0
			} else {
				dataOutput[i] = (dataInputHigh[i] - dataInputLow[i]) / dataInputVol[i]
			}

			i++
		}
	},[],
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
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
