registerIndicator(
"fractals",
"Fractals(v1.0)",
function (context) {
	    var dataInputHigh = getDataInput(context, 0)
	    var dataInputLow = getDataInput(context, 1)
	    var dataOutputUp = getDataOutput(context, "fractalsUp")
	    var dataOutputDown = getDataOutput(context, "fractalsDown")

	    var calculatedLength = getCalculatedLength(context)

	    var ptr = null

	    if (calculatedLength > 0) {
	        ptr = calculatedLength - 3
	    } else {
	        for (var i = 0; i < dataInputHigh.length; i++) {
	            dataOutputUp[i] = 0
	            dataOutputDown[i] = 0
	        }

	        ptr = 2
	    }

	    var bFound = false
	    var highest = null
	    var lowest = null

	    while (ptr < dataInputHigh.length - 2) {
	        bFound = false
	        highest = dataInputHigh[ptr]

	        if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
	            bFound = true
	            dataOutputUp[ptr] = highest
	        }
	        if (!bFound && ptr >= 3) {
	            if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr - 3] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
	                bFound = true
	                dataOutputUp[ptr] = highest
	            }
	        }
	        if (!bFound && ptr >= 4) {
	            if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr - 3] && highest > dataInputHigh[ptr - 4] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
	                bFound = true
	                dataOutputUp[ptr] = highest
	            }
	        }
	        if (!bFound && ptr >= 5) {
	            if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr - 3] && highest > dataInputHigh[ptr - 4] && highest > dataInputHigh[ptr - 5] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
	                bFound = true
	                dataOutputUp[ptr] = highest
	            }
	        }
	        if (!bFound && ptr >= 6) {
	            if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr - 3] && highest > dataInputHigh[ptr - 4] && highest > dataInputHigh[ptr - 5] && highest > dataInputHigh[ptr - 6] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
	                bFound = true
	                dataOutputUp[ptr] = highest
	            }
	        }

	        bFound = false
	        lowest = dataInputLow[ptr]

	        if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
	            bFound = true
	            dataOutputDown[ptr] = lowest
	        }
	        if (!bFound && ptr >= 3) {
	            if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr - 3] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
	                bFound = true
	                dataOutputDown[ptr] = lowest
	            }
	        }
	        if (!bFound && ptr >= 4) {
	            if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr - 3] && lowest < dataInputLow[ptr - 4] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
	                bFound = true
	                dataOutputDown[ptr] = lowest
	            }
	        }
	        if (!bFound && ptr >= 5) {
	            if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr - 3] && lowest < dataInputLow[ptr - 4] && lowest < dataInputLow[ptr - 5] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
	                bFound = true
	                dataOutputDown[ptr] = lowest
	            }
	        }
	        if (!bFound && ptr >= 6) {
	            if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr - 3] && lowest < dataInputLow[ptr - 4] && lowest < dataInputLow[ptr - 5] && lowest < dataInputLow[ptr - 6] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
	                bFound = true
	                dataOutputDown[ptr] = lowest
	            }
	        }

	        ptr++
	    }
	},
[], [{
	name: "High",
	index: 0
}, {
	name: "Low",
	index: 1
}], [{
	name: "fractalsUp",
	visible: true,
	renderType: "Round",
	color: "green"
}, {
	name: "fractalsDown",
	visible: true,
	renderType: "Round",
	color: "red"
}],
"CHART_WINDOW")
