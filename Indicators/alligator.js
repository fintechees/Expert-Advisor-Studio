registerIndicator(
    "alligator", "A series of Bill Williams' indicators(v1.02)", function (context) {
		var dataInput = getDataInput(context, 0)
		var dataOutputJaws = getDataOutput(context, "jaws")
		var dataOutputTeeth = getDataOutput(context, "teeth")
		var dataOutputLips = getDataOutput(context, "lips")

		var method = getIndiParameter(context, "method")
		var jawsPeriod = getIndiParameter(context, "jawsPeriod")
		var jawsShift = getIndiParameter(context, "jawsShift")
		var teethPeriod = getIndiParameter(context, "teethPeriod")
		var teethShift = getIndiParameter(context, "teethShift")
		var lipsPeriod = getIndiParameter(context, "lipsPeriod")
		var lipsShift = getIndiParameter(context, "lipsShift")

		var calculatedLength = getCalculatedLength(context)

		if ("smma" == method) {
			smma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			smma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			smma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else if ("sma" == method) {
			sma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			sma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			sma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else if("ema" == method) {
			ema(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			ema(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			ema(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		} else {
			lwma(dataInput, dataOutputJaws, calculatedLength, jawsPeriod)
			lwma(dataInput, dataOutputTeeth, calculatedLength, teethPeriod)
			lwma(dataInput, dataOutputLips, calculatedLength, lipsPeriod)
		}

		if (calculatedLength == 0) {
			setIndiShift(context, "jaws", jawsShift)
			setIndiShift(context, "teeth", teethShift)
			setIndiShift(context, "lips", lipsShift)
		}
	},[{
		name: "jawsPeriod",
		value: 13,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "jawsShift",
		value: 8,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "teethPeriod",
		value: 8,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "teethShift",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "lipsPeriod",
		value: 5,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100]
	},{
		name: "lipsShift",
		value: 3,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [-30, 30]
	},{
		name: "method",
		value: "smma",
		required: true,
		type: PARAMETER_TYPE.STRING
	}],
	[{
		name: DATA_NAME.HL2,
		index: 0
	}],
	[{
		name: "jaws",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "steelblue"
	},{
		name: "teeth",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "#DE5029"
	},{
		name: "lips",
		visible: true,
		renderType: RENDER_TYPE.LINE,
		color: "#4EC2B4"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)
