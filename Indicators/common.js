function setShift(dataOutput, shift) {
	if (shift > 0) {
		var arr = new Array(shift)
		arr.map(function (x, i) {return 0})
		dataOutput.splice(dataOutput.length - shift, shift)
		arr.concat(dataOutput)
	} else if (shift < 0) {
		var arr = new Array(-shift)
		arr.map(function (x, i) {return 0})
		dataOutput.splice(0, -shift)
		dataOutput.concat(arr)
	}
}

function sma (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength

	if (calculatedLength > 0) {
		i--
	} else {
		for (var j = 0; j < period - 1; j++) {
			dataOutput[j] = 0
		}

		i = period - 1
	}

	var sum = 0

	for (var j = i - period + 1; j < i; j++) {
		sum += dataInput[j]
	}

	for (var j = i; j < dataInput.length; j++) {
		sum += dataInput[j]
		dataOutput[j] = sum / period
		sum -= dataInput[j - period + 1]
	}
}

function ema (dataInput, dataOutput, calculatedLength, smoothFactor) {
	var i = calculatedLength

	if (i == 0) {
		dataOutput[0] = dataInput[0]
		i++
	} else if (i == 1) {
	} else {
		i--
	}

	while (i < dataInput.length) {
		dataOutput[i] = dataInput[i] * smthFctr + dataOutput[i - 1] * (1 - smthFctr)
		i++
	}
}

function smma (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength
	var sum = 0

	if (i > 0) {
		i--
	} else {
		i = period - 1

		for (var j = 1; j < period; j++) {
			dataOutput[i - j] = 0
			sum += dataInput[i - j]
		}

		sum += dataInput[i]
		dataOutput[i] = sum / period
		i++
	}

	while (i < dataInput.length) {
		sum = dataOutput[i - 1] * period - dataOutput[i - 1] + dataInput[i]
		dataOutput[i] = sum / period
		i++
	}
}

function lwma (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength

	if (i > 0) {
		i--
	} else {
		for (var j = 0; j < period - 1; j++) {
			dataOutput[j] = 0
		}

		i = period - 1
	}

	var sum = 0
	var diffsum = 0
	var weight = 0

	for (var j = 1; j < period; j++) {
		sum += dataInput[i - j] * (period - j)
		diffsum += dataInput[i - j]
		weight += j
	}
	weight += period

	while (i < dataInput.length) {
		sum += dataInput[i] * period
		dataOutput[i] = sum / weight
		diffsum += dataInput[i]
		sum -= diffsum
		diffsum -= dataInput[i - period + 1]
		i++
	}
}
