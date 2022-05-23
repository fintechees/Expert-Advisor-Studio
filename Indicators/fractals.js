registerIndicator(
"fractals",
"Fractals(v1.01)",
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

	    var bHFound = false
			var bLFound = false
	    var highest = null
	    var lowest = null

	    while (ptr < dataInputHigh.length - 2) {
	        bHFound = false
	        highest = dataInputHigh[ptr]

	        if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
	            bHFound = true
	            dataOutputUp[ptr] = highest
	        }

	        bLFound = false
	        lowest = dataInputLow[ptr]

	        if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
	            bLFound = true
	            dataOutputDown[ptr] = lowest
	        }

	        ptr++
	    }

			if (!bHFound) {
				dataOutputUp[dataInputHigh.length - 3] = 0
			}
			if (!bLFound) {
				dataOutputDown[dataInputLow.length - 3] = 0
			}
	},[],
	[{
	    name: DATA_NAME.HIGH,
	    index: 0
	},{
	    name: DATA_NAME.LOW,
	    index: 1
	}],
	[{
	    name: "fractalsUp",
	    visible: true,
	    renderType: RENDER_TYPE.ROUND,
	    color: "green"
	},{
	    name: "fractalsDown",
	    visible: true,
	    renderType: RENDER_TYPE.ROUND,
	    color: "red"
	}],
	WHERE_TO_RENDER.CHART_WINDOW)
