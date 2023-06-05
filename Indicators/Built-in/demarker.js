registerIndicator(
"demarker",
"DeMarker(v1.0)",
function (context) {
	    var dataInputHigh = getDataInput(context, 0)
	    var dataInputLow = getDataInput(context, 1)
	    var dataOutput = getDataOutput(context, "demarker")
	    var dataOutputHL = getDataOutput(context, "highLevel")
	    var dataOutputLL = getDataOutput(context, "lowLevel")
	    var dataOutputMax = getDataOutput(context, "max")
	    var dataOutputMin = getDataOutput(context, "min")
	    var dataOutputMaMax = getDataOutput(context, "maMax")
	    var dataOutputMaMin = getDataOutput(context, "maMin")
	    var highLevel = getIndiParameter(context, "highLevel")
	    var lowLevel = getIndiParameter(context, "lowLevel")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = 1

	        dataOutputMax[0] = 0;
			dataOutputMin[0] = 0;
	    }

	    var tmp = 0

	    while (ptr < dataInputHigh.length) {
			tmp = dataInputHigh[ptr] - dataInputHigh[ptr - 1]
			if (0 > tmp) {
				tmp = 0
			}
			dataOutputMax[ptr] = tmp

			tmp = dataInputLow[ptr - 1] - dataInputLow[ptr]
			if (0 > tmp) {
				tmp = 0
			}
			dataOutputMin[ptr] = tmp

			ptr++
		}

	    sma(dataOutputMax, dataOutputMaMax, calculatedLength, period)
	    sma(dataOutputMin, dataOutputMaMin, calculatedLength, period)

	    ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	            dataOutputHL[i] = highLevel
	            dataOutputLL[i] = lowLevel
	        }
	    }

	    while (ptr < dataInputHigh.length) {
	        tmp = dataOutputMaMax[ptr] + dataOutputMaMin[ptr]

			if (0 == tmp) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = dataOutputMaMax[ptr] / tmp
			}

	        dataOutputHL[ptr] = highLevel
	        dataOutputLL[ptr] = lowLevel

	        ptr++
	    }
	},
[{
	name: "period",
	value: 14,
	required: true,
	type: "Integer",
	range: [1, 100]
}, {
	name: "highLevel",
	value: 0.7,
	required: false,
	type: "Number",
	range: [0, 1]
}, {
	name: "lowLevel",
	value: 0.3,
	required: false,
	type: "Number",
	range: [0, 1]
}], [{
	name: "High",
	index: 0
}, {
	name: "Low",
	index: 1
}], [{
	name: "demarker",
	visible: true,
	renderType: "Line",
	color: "steelblue"
}, {
	name: "highLevel",
	visible: true,
	renderType: "Dasharray",
	color: "#AAAAAA"
}, {
	name: "lowLevel",
	visible: true,
	renderType: "Dasharray",
	color: "#AAAAAA"
}, {
	name: "max",
	visible: false,
	renderType: null,
	color: null
}, {
	name: "min",
	visible: false,
	renderType: null,
	color: null
}, {
	name: "maMax",
	visible: false,
	renderType: null,
	color: null
}, {
	name: "maMin",
	visible: false,
	renderType: null,
	color: null
}],
"SEPARATE_WINDOW")
