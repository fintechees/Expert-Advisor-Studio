registerIndicator(
"cci",
"Commodity Channel Index(v1.0)",
function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataOutput = getDataOutput(context, "cci")
	    var dataOutputHL = getDataOutput(context, "cciHighLevel")
	    var dataOutputLL = getDataOutput(context, "cciLowLevel")
	    var dataOutputSma = getDataOutput(context, "sma")
	    var highLevel = getIndiParameter(context, "highLevel")
	    var lowLevel = getIndiParameter(context, "lowLevel")
	    var period = getIndiParameter(context, "period")
	    var cciFactor = 0.015 / period;

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

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

	    sma(dataInput, dataOutputSma, calculatedLength, period)

	    var sum, tmp, ptr2

	    while (ptr < dataInput.length) {
	        sum = 0
			ptr2 = ptr - period + 1
			while (ptr2 <= ptr) {
				sum += Math.abs(dataInput[ptr2] - dataOutputSma[ptr])
				ptr2++
			}
			tmp = sum * cciFactor

			if (0 == tmp) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = (dataInput[ptr] - dataOutputSma[ptr]) / tmp
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
	value: 100,
	required: false,
	type: "Number",
	range: [1, 200]
}, {
	name: "lowLevel",
	value: -100,
	required: false,
	type: "Number",
	range: [-200, -1]
}], [{
	name: "HLC3",
	index: 0
}], [{
	name: "cci",
	visible: true,
	renderType: "Line",
	color: "steelblue"
}, {
	name: "cciHighLevel",
	visible: true,
	renderType: "Dasharray",
	color: "#AAAAAA"
}, {
	name: "cciLowLevel",
	visible: true,
	renderType: "Dasharray",
	color: "#AAAAAA"
}, {
	name: "sma",
	visible: false,
	renderType: null,
	color: null
}],
"SEPARATE_WINDOW")
