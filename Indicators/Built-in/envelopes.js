registerIndicator(
"envelopes",
"Envelopes(v1.0)",
function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataOutput = getDataOutput(context, "ma")
	    var dataOutputUpper = getDataOutput(context, "upper")
	    var dataOutputLower = getDataOutput(context, "lower")

	    var method = getIndiParameter(context, "method")
	    var period = getIndiParameter(context, "period")
	    var deviations = getIndiParameter(context, "deviations")
	    var shift = getIndiParameter(context, "shift")

	    var calculatedLength = getCalculatedLength(context)

	    if ("smma" == method) {
	        smma(dataInput, dataOutput, calculatedLength, period)
	    } else if("ema" == method) {
	        ema(dataInput, dataOutput, calculatedLength, period)
	    } else if ("lwma" == method) {
	        lwma(dataInput, dataOutput, calculatedLength, period)
	    } else {
	        sma(dataInput, dataOutput, calculatedLength, period)
	    }

	    var ptr = null

	    if (calculatedLength > 0) {
	        ptr = calculatedLength - 1
	    } else {
	        for (var i = 0; i < period - 1; i++) {
	            dataOutputUpper[i] = 0
	            dataOutputLower[i] = 0
	        }

	        ptr = period - 1
	    }

	    while (ptr < dataInput.length) {
	        dataOutputUpper[ptr] = (1 + deviations / 100) * dataOutput[ptr]
			dataOutputLower[ptr] = (1 - deviations / 100) * dataOutput[ptr]

	        ptr++
	    }

	    if (calculatedLength == 0) {
	        setIndiShift(context, "ma", shift)
	        setIndiShift(context, "upper", shift)
	        setIndiShift(context, "lower", shift)
	    }
	},
[{
	name: "period",
	value: 5,
	required: true,
	type: "Integer",
	range: [1, 100]
}, {
	name: "deviations",
	value: 0.05,
	required: true,
	type: "Number",
	range: [0, 10]
}, {
	name: "shift",
	value: 0,
	required: true,
	type: "Integer",
	range: [-30, 30]
}, {
	name: "method",
	value: "sma",
	required: true,
	type: "String",
	range: null
}], [{
	name: "Close",
	index: 0
}], [{
	name: "ma",
	visible: true,
	renderType: "Line",
	color: "steelblue"
}, {
	name: "upper",
	visible: true,
	renderType: "Dasharray",
	color: "steelblue"
}, {
	name: "lower",
	visible: true,
	renderType: "Dasharray",
	color: "steelblue"
}],
"CHART_WINDOW")
