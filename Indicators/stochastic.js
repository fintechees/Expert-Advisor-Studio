registerIndicator(
    "stochastic", "Stochastic oscillator(v1.01)", function (context) {
		var dataInputClose = getDataInput(context, 0)
		var dataInputHigh = getDataInput(context, 1)
		var dataInputLow = getDataInput(context, 2)

		var highestTmp = getDataOutput(context, "highestTmp")
		var lowestTmp = getDataOutput(context, "lowestTmp")

		var dataOutputMain = getDataOutput(context, "main")
		var dataOutputSignal = getDataOutput(context, "signal")

		var kP = getIndiParameter(context, "KPeriod")
		var slowing = getIndiParameter(context, "slowing")
		var dP = getIndiParameter(context, "DPeriod")
		var method = getIndiParameter(context, "method")

		var calculatedLength = getCalculatedLength(context)
		var ptr = calculatedLength
		var maxParam = Math.max(kP + slowing - 1, dP)

		if (ptr > 0) {
			ptr--
		} else {
			ptr = maxParam - 1

			for (var i = 1; i < maxParam; i++) {
				dataOutputMain[ptr - i] = 0
				highestTmp[ptr - i] = 0
				lowestTmp[ptr - i] = 0
			}
		}

		while (ptr < dataInputClose.length) {
			var tmp = null
			var highest = Number.MIN_VALUE
			var lowest = Number.MAX_VALUE

			for (var ptr2 = (ptr - kP + 1); ptr2 <= ptr; ptr2++){
				tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}
			}

			highestTmp[ptr] = highest
			lowestTmp[ptr] = lowest

			ptr++
		}

		ptr = calculatedLength

		if (ptr > 0) {
			ptr--
		} else {
			ptr = maxParam - 1
		}

		while (ptr < dataInputClose.length) {
			var highestSum = 0
			var lowestSum = 0

			for (var ptr2 = ptr - slowing + 1; ptr2 <= ptr; ptr2++) {
				highestSum += highestTmp[ptr2] - lowestTmp[ptr2]
				lowestSum += dataInputClose[ptr2] - lowestTmp[ptr2]
			}

			if (0 == highestSum) {
				dataOutputMain[ptr] = 100
			}else{
				dataOutputMain[ptr] = lowestSum / highestSum * 100
			}

			ptr++
		}

		if ("sma" == method) {
			sma(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		} else if ("ema" == method) {
			ema(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		} else if ("smma" == method) {
			smma(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		} else {
			lwma(dataOutputMain, dataOutputSignal, calculatedLength, dP)
		}
	},[{
		name: "KPeriod",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "slowing",
		value: 3,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "DPeriod",
		value: 3,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "method",
		value: "sma",
		required: true,
		type: PARAMETER_TYPE.STRING
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
        name: "highestTmp",
        visible: false
    },{
        name: "lowestTmp",
        visible: false
    },{
        name: "main",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#DE5029"
    },{
        name: "signal",
        visible: true,
        renderType: RENDER_TYPE.DASHARRAY,
        color: "#4EC2B4"
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
