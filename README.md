# EA
A repository for trading robots(EA) which can be running on Web browser

Please access our demo to run the EAs:
https://www.fintechee.com

Please check our [Github wiki](https://github.com/fintechee/EA/wiki) to know more details about APIs.

![Screenshot](https://www.fintechee.com/vpimages/services/newscreenshot1.png)

```javascript
var BROKER_NAME = {
	DEMO: "CC Demo"
}

var TIME_FRAME = {
	M1: "M1",
	M5: "M5",
	M15: "M15",
	M30: "M30",
	H1: "H1",
	H4: "H4",
	D: "D",
	W: "W",
	M: "M"
}

var ORDER_TYPE = {
	OP_BUY: "BUY",
	OP_SELL: "SELL",
	OP_BUYLIMIT: "BUY LIMIT",
	OP_SELLLIMIT: "SELL LIMIT",
	OP_BUYSTOP: "BUY STOP",
	OP_SELLSTOP: "SELL STOP"
}

var WHERE_TO_RENDER = {
	CHART_WINDOW: "CHART_WINDOW",
	SEPARATE_WINDOW: "SEPARATE_WINDOW"
}

var DATA_NAME = {
	TIME: "Time",
	OPEN: "Open",
	HIGH: "High",
	LOW: "Low",
	CLOSE: "Close",
	HL2: "HL2",
	HLC3: "HLC3",
	HLCC4: "HLCC4"
}

var RENDER_TYPE = {
	HISTOGRAM: "Histogram",
	LINE: "Line",
	ROUND: "Round",
	DASHARRAY: "Dasharray"
}

var PARAMETER_TYPE = {
	INTEGER: "Integer",
	NUMBER: "Number",
	BOOLEAN: "Boolean",
	STRING: "String"
}
```
### Common Function

```javascript
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

function ema (dataInput, dataOutput, calculatedLength, period) {
	var i = calculatedLength
	var smthFctr = 2.0 / (period + 1)

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
```

Please check our site for details. [Fintechee](https://www.fintechee.com/material/Document.html)

MIT License
