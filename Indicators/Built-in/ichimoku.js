registerIndicator(
"ichimoku",
"Ichimoku Kinko Hyo(v1.0)",
function (context) {
	    var dataInputHigh = getDataInput(context, 0)
	    var dataInputLow = getDataInput(context, 1)
	    var dataInputClose = getDataInput(context, 2)
	    var dataOutputTenkan = getDataOutput(context, "tenkan")
	    var dataOutputKijun = getDataOutput(context, "kijun")
	    var dataOutputChikou = getDataOutput(context, "chikou")
	    var dataOutputSpanA = getDataOutput(context, "spana")
	    var dataOutputSpanB = getDataOutput(context, "spanb")

	    var tenkan = getIndiParameter(context, "tenkan")
	    var kijun = getIndiParameter(context, "kijun")
	    var senkou = getIndiParameter(context, "senkou")
		var spanA;
		if (kijun < tenkan) {
			spanA = tenkan;
		}else{
			spanA = kijun;
		}

	    var calculatedLength = getCalculatedLength(context)
	    var ptr = calculatedLength
	    var maxParam = Math.max(tenkan, kijun, spanA, senkou)

	    if (ptr > 0) {
	        ptr--
	    } else {
	        ptr = maxParam - 1

	        for (var i = 1; i < maxParam; i++) {
				dataOutputTenkan[ptr - i] = 0
				dataOutputKijun[ptr - i] = 0
				dataOutputChikou[ptr - i] = 0
				dataOutputSpanA[ptr - i] = 0
				dataOutputSpanB[ptr - i] = 0
			}
	    }

		var ptr2, tmp, highest, lowest

		while (ptr < dataInputHigh.length) {
	        tmp = null
	        highest = -Number.MAX_VALUE
	        lowest = Number.MAX_VALUE

			ptr2 = ptr - tenkan + 1

			while (ptr2 <= ptr) {
				tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}

				ptr2++
			}

			dataOutputTenkan[ptr] = (highest + lowest) / 2

	        tmp = null
	        highest = -Number.MAX_VALUE
	        lowest = Number.MAX_VALUE

			ptr2 = ptr - kijun + 1

			while (ptr2 <= ptr) {
	            tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}

				ptr2++
			}

			dataOutputKijun[ptr] = (highest + lowest) / 2

			dataOutputSpanA[ptr] = (dataOutputTenkan[ptr] + dataOutputKijun[ptr]) / 2

	        tmp = null
	        highest = -Number.MAX_VALUE
	        lowest = Number.MAX_VALUE

			ptr2 = ptr - senkou + 1

	        while (ptr2 <= ptr) {
	            tmp = dataInputHigh[ptr2]
				if (highest < tmp) {
					highest = tmp
				}

				tmp = dataInputLow[ptr2]
				if (lowest > tmp) {
					lowest = tmp
				}

				ptr2++
			}

			dataOutputSpanB[ptr] = (highest + lowest) / 2

			dataOutputChikou[ptr] = dataInputClose[ptr]

			ptr++
		}

	    if (calculatedLength == 0) {
	        setIndiShift(context, "chikou", -kijun)
	        setIndiShift(context, "spana", kijun)
	        setIndiShift(context, "spanb", kijun)
	    }
	},
[{
	name: "tenkan",
	value: 9,
	required: true,
	type: "Integer",
	range: [1, 100]
}, {
	name: "kijun",
	value: 26,
	required: true,
	type: "Integer",
	range: [1, 100]
}, {
	name: "senkou",
	value: 52,
	required: true,
	type: "Integer",
	range: [1, 100]
}], [{
	name: "High",
	index: 0
}, {
	name: "Low",
	index: 1
}, {
	name: "Close",
	index: 2
}], [{
	name: "tenkan",
	visible: true,
	renderType: "Line",
	color: "#DE5029"
}, {
	name: "kijun",
	visible: true,
	renderType: "Line",
	color: "steelblue"
}, {
	name: "chikou",
	visible: true,
	renderType: "Dasharray",
	color: "#4EC2B4"
}, {
	name: "spana",
	visible: true,
	renderType: "Round",
	color: "steelblue"
}, {
	name: "spanb",
	visible: true,
	renderType: "Round",
	color: "#CCCCCC"
}],
"CHART_WINDOW")
