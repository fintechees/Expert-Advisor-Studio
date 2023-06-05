registerIndicator(
"momentum",
"Momentum(v1.0)",
function (context) {
	    var dataInput = getDataInput(context, 0)
	    var dataOutput = getDataOutput(context, "momentum")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period - 1

	        for (var i = 0; i < period - 1; i++) {
	            dataOutput[i] = 0
	        }
	    }

	    while (ptr < dataInput.length) {
	        dataOutput[ptr] = dataInput[ptr] * 100 / dataInput[ptr - period]
	        ptr++
	    }
	},
[{
	name: "period",
	value: 14,
	required: true,
	type: "Integer",
	range: [1, 100]
}], [{
	name: "Close",
	index: 0
}], [{
	name: "momentum",
	visible: true,
	renderType: "Line",
	color: "steelblue"
}],
"SEPARATE_WINDOW")
