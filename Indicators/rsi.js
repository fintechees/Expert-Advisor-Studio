registerIndicator(
    "rsi", "Relative strength index", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutput = getDataOutput(context, "rsi")

		var period = getIndiParameter(context, "period")

		var calculatedLength = getCalculatedLength(context)

		var ptr = null
		var ptr2 = null

		if (calculatedLength > 0) {
			ptr = calculatedLength - 1
			ptr2 = calculatedLength - period
		} else {
			for (var i = 0; i < period - 1; i++) {
				dataOutput[i] = 0
			}

			ptr = period
			ptr2 = 1
		}

		var diff = null
		var gain = null
		var loss = null
		var gainSum = 0
		var lossSum = 0
		var prevGain = null
		var prevLoss = null

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
		prevGain = gain
		prevLoss = loss
		ptr++

		while (ptr < dataInput.length) {
			gain = prevGain * (period - 1)
			loss = prevLoss * (period - 1)

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
			prevGain = gain
			prevLoss = loss
			ptr++
		}

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
	}],
	[{
		name: "rsi",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	}],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
