registerIndicator("volume", "Volume of OHLC(v1.0)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "volume")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i != 0) {
			i--
		}

		while (i < dataInput.length) {
			dataOutput[i] = dataInput[i]
			i++
		}
	},[],
	[{
		name: DATA_NAME.VOLUME,
		index: 0
	}],
	[{
		name: "volume",
		visible: true,
		renderType: RENDER_TYPE.HISTOGRAM,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
