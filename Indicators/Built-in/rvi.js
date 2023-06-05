registerIndicator(
"rvi",
"Relative Vigor Index(v1.0)",
function (context) {
	    var dataInputOpen = getDataInput(context, 0)
	    var dataInputHigh = getDataInput(context, 1)
	    var dataInputLow = getDataInput(context, 2)
	    var dataInputClose = getDataInput(context, 3)
	    var dataOutputMain = getDataOutput(context, "main")
	    var dataOutputSignal = getDataOutput(context, "signal")
	    var period = getIndiParameter(context, "period")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period + 2

	        for (var i = 0; i < period + 2; i++) {
	            dataOutputMain[i] = 0
	            dataOutputSignal[i] = 0
	        }
	    }

	    var upTmp, downTmp, tmp, dTmp

	    while (ptr < dataInputOpen.length) {
	        tmp = 0
			dTmp = 0

			for (var i = ptr; i > ptr - period; i--) {
				upTmp = ((dataInputClose[i] - dataInputOpen[i]) + 2 * (dataInputClose[i - 1] - dataInputOpen[i - 1]) + 2 * (dataInputClose[i - 2] - dataInputOpen[i - 2]) + (dataInputClose[i - 3] - dataInputOpen[i - 3])) / 6
				downTmp = ((dataInputHigh[i] - dataInputLow[i]) + 2 * (dataInputHigh[i - 1] - dataInputLow[i - 1]) + 2 * (dataInputHigh[i - 2] - dataInputLow[i - 2]) + (dataInputHigh[i - 3] - dataInputLow[i - 3])) / 6

				tmp += upTmp
				dTmp += downTmp
			}

			if (0 == dTmp) {
				dataOutputMain[ptr] = tmp
			} else {
				dataOutputMain[ptr] = tmp / dTmp
			}

	        ptr++
	    }

	    ptr = calculatedLength

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = period + 2
	    }

	    while (ptr < dataInputOpen.length) {
	        dataOutputSignal[ptr] = (dataOutputMain[ptr] + 2 * dataOutputMain[ptr - 1] + 2 * dataOutputMain[ptr - 2] + dataOutputMain[ptr - 3]) / 6

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
	name: "Open",
	index: 0
}, {
	name: "High",
	index: 1
}, {
	name: "Low",
	index: 2
}, {
	name: "Close",
	index: 3
}], [{
	name: "main",
	visible: true,
	renderType: "Line",
	color: "#6CBA81"
}, {
	name: "signal",
	visible: true,
	renderType: "Line",
	color: "#ECAE93"
}],
"SEPARATE_WINDOW")
