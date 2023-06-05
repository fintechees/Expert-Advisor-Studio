registerIndicator(
"wpr",
"Williams' Percent Range(v1.0)",
function (context) {
	    var dataInputClose = getDataInput(context, 0)
	    var dataInputHigh = getDataInput(context, 1)
	    var dataInputLow = getDataInput(context, 2)
	    var dataOutput = getDataOutput(context, "wpr")
	    var dataOutputHL = getDataOutput(context, "wprHighLevel")
	    var dataOutputLL = getDataOutput(context, "wprLowLevel")
	    var highLevel = getIndiParameter(context, "highLevel")
	    var lowLevel = getIndiParameter(context, "lowLevel")
	    var period = getIndiParameter(context, "period")

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

	    while (ptr < dataInputClose.length) {
	        var maxArr = []

			for (var i = 0; i < period; i++) {
				maxArr.push(dataInputHigh[ptr - i])
			}

			var highest = Math.max.apply(null, maxArr)

			var minArr = []
			for (var i = 0; i < period; i++) {
				minArr.push(dataInputLow[ptr - i])
			}

			var lowest = Math.min.apply(null, minArr)

			if (0 == highest - lowest) {
				dataOutput[ptr] = 0
			} else {
				dataOutput[ptr] = -100 * (highest - dataInputClose[ptr]) / (highest - lowest)
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
	value: -20,
	required: false,
	type: "Number",
	range: [-100, 0]
}, {
	name: "lowLevel",
	value: -80,
	required: false,
	type: "Number",
	range: [-100, 0]
}], [{
	name: "Close",
	index: 0
}, {
	name: "High",
	index: 1
}, {
	name: "Low",
	index: 2
}], [{
	name: "wpr",
	visible: true,
	renderType: "Line",
	color: "steelblue"
}, {
	name: "wprHighLevel",
	visible: true,
	renderType: "Dasharray",
	color: "#AAAAAA"
}, {
	name: "wprLowLevel",
	visible: true,
	renderType: "Dasharray",
	color: "#AAAAAA"
}],
"SEPARATE_WINDOW")
