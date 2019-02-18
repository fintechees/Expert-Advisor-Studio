registerIndicator(
"sma",
"Simple moving average",
function (context) {
			var dataInput = getDataInput(context, 0)
			var dataOutput = getDataOutput(context, "sma")
			var period = getIndiParameter(context, "period")

			var start = getCalculatedLength(context)

			if (start > 0) {
				start--
			} else {
				for (var i = 0; i < period - 1; i++) {
					dataOutput[i] = 0
				}

				start = period - 1
			}

			var sum = 0

			for (var i = start - period + 1; i < start; i++) {
				sum += dataInput[i]
			}

			for (var i = start; i < dataInput.length; i++) {
				sum += dataInput[i]
				dataOutput[i] = sum / period
				sum -= dataInput[i - period + 1]
			}
		},
[{
	name: "period",
	value: 5,
	required: true,
	type: "Number",
	range: [1, 100]
}], [{
	name: "Close",
	index: 0
}], [{
	name: "sma",
	visible: true,
	renderType: "Line",
	color: "steelblue"
}],
"CHART_WINDOW")
