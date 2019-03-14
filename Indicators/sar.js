registerIndicator(
    "sar", "Parabolic SAR", function (context) {
		var dataInputHigh = getDataInput(context, 0)
		var dataInputLow = getDataInput(context, 1)

		var dataOutput = getDataOutput(context, "sar")

		var acceleration = getIndiParameter(context, "acceleration")
		var af = acceleration
		var afMax = getIndiParameter(context, "afMax")

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i > 0) {
			i--
		} else {
			dataOutput[i] = 0
			i = 1
		}

		var prevH = dataInputHigh[i - 1]
		var prevL = dataInputLow[i - 1]
		var currH = null
		var currL = null

		var isLong = true
		var ep = prevH
		var sar = prevL

		while (i < dataInputHigh.length) {
			currH = dataInputHigh[i]
			currL = dataInputLow[i]

			if (isLong) {
				if (currL <= sar) {
					isLong = false
					sar = Math.max(ep, currH, prevH)

					dataOutput[i] = sar

					af = acceleration
					ep = currL
					sar = sar + af * (ep - sar)
					sar = Math.max(sar, currH, prevH)
				} else {
					dataOutput[i] = sar

					if (currH > ep) {
						ep = currH
						af += acceleration
						if (af > afMax) {
							af = afMax
						}
					}
					sar = sar + af * (ep - sar)
					sar = Math.min(sar, currL, prevL)
				}
			} else {
				if (currH >= sar) {
					isLong = true
					sar = Math.min(ep, currL, prevL)

					dataOutput[i] = sar

					af = acceleration
					ep = currH
					sar = sar + af * (ep - sar)
					sar = Math.min(sar, currL, prevL)
				}else{
					dataOutput[i] = sar

					if (currL < ep) {
						ep = currL
						af += acceleration
						if (af > afMax) {
							af = afMax
						}
					}
					sar = sar + af * (ep - sar)
					sar = Math.max(sar, currH, prevH)
				}
			}
			i++

			prevH = currH
			prevL = currL
		}

	},[{
		name: "acceleration",
		value: 0.02,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0.01, 0.1]
	},{
		name: "afMax",
		value: 0.2,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0.1, 1]
	}],
	[{
		name: DATA_NAME.HIGH,
		index: 0
	},{
		name: DATA_NAME.LOW,
		index: 1
	}],
	[{
		name: "sar",
		visible: true,
		renderType: RENDER_TYPE.ROUND,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)
