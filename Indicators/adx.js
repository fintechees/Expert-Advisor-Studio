registerIndicator(
    "adx", "Average directional index", function (context) {
		var dataInputClose = getDataInput(context, 0)
		var dataInputHigh = getDataInput(context, 1)
		var dataInputLow = getDataInput(context, 2)

		var tmpLine = getDataOutput(context, "tmp")
		var plusSdiTmp = getDataOutput(context, "plusSdiTmp")
		var minusSdiTmp = getDataOutput(context, "minusSdiTmp")

		var dataOutputAdx = getDataOutput(context, "adx")
		var dataOutputPlusDi = getDataOutput(context, "plusDi")
		var dataOutputMinusDi = getDataOutput(context, "minusDi")

		var period = getIndiParameter(context, "period")
		var smthFctr = 2.0 / (period + 1)

		var calculatedLength = getCalculatedLength(context)
		var i = calculatedLength

		if (i > 0) {
			i--
		} else {
			plusSdiTmp[i] = 0
			minusSdiTmp[i] = 0
			i = 1
		}

		var plusDM = null
		var minusDM = null
		var trueRange = null
		var currH = null
		var currL = null
		var prevH = null
		var prevL = null
		var prevC = null

		while (i < dataInputClose.length) {
			currH = dataInputHigh[i]
			currL = dataInputLow[i]
			prevH = dataInputHigh[i - 1]
			prevL = dataInputLow[i - 1]
			prevC = dataInputClose[i - 1]

			plusDM = currH - prevH
			minusDM = prevL - currL
			if (0 > plusDM) {
				plusDM = 0
			}
			if (0 > minusDM) {
				minusDM = 0
			}
			if (plusDM == minusDM) {
				plusDM = 0
				minusDM = 0
			} else if (plusDM < minusDM) {
				plusDM = 0
			} else if (plusDM > minusDM) {
				minusDM = 0
			}

			trueRange = Math.max(Math.abs(currH - currL), Math.abs(currH - prevC))
			trueRange = Math.max(trueRange, Math.abs(currL - prevC))

			if (0 == trueRange) {
				plusSdiTmp[i] = 0
				minusSdiTmp[i] = 0
			}else{
				plusSdiTmp[i] = 100 * plusDM / trueRange
				minusSdiTmp[i] = 100 * minusDM / trueRange
			}

			i++
		}

		ema(plusSdiTmp, dataOutputPlusDi, calculatedLength, smthFctr)
		ema(minusSdiTmp, dataOutputMinusDi, calculatedLength, smthFctr)

		i = calculatedLength
		if (i > 0) {
			i--
		}

		while (i < dataInputClose.length) {
			var tmp = Math.abs(dataOutputPlusDi[i] + dataOutputMinusDi[i])

			if (0 == tmp) {
				tmpLine[i] = 0
			} else {
				tmpLine[i] = 100 * (Math.abs(dataOutputPlusDi[i] - dataOutputMinusDi[i]) / tmp)
			}

			i++
		}

		ema(tmpLine, dataOutputAdx, calculatedLength, smthFctr)
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
        name: "plusSdiTmp",
        visible: false
    },{
        name: "minusSdiTmp",
        visible: false
    },{
        name: "adx",
        visible: true,
        renderType: RENDER_TYPE.DASHARRAY,
        color: "white"
    },{
        name: "plusDi",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#4EC2B4"
    },{
        name: "minusDi",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#DE5029"
    }],
	WHERE_TO_RENDER.SEPARATE_WINDOW)
