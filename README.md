# Expert Advisor Studio
A repository for trading robots(EA) which can be running on Web browser

## Features
1. Javascript SDK, Compatible with C/C++/MQL
2. WEB-based
3. You can import any data(historical/streaming) as long as you have data source.
4. Market Maker Bot(You can send transactions to blockchains' SWAP smart contracts)
5. Integration with crypto wallets(Scatter & Metamask)
6. Integration with Artificial Intelligence(AI)
7. Integration with DEX and Clearing House
8. Custom Indicators(You can create compound indicators -- make an indicator calculated based on another indicator)
9. You can analyze Bitcoin or Ether's options by using our plugins.
10. FIX API individual version(Your browser -> local Java Package -> FIX API straightforward)
11. White label enabled
12. MFA - Multiple Factor Authentication
13. Dashboard for broker's manager
14. APP(Android, already listed on our website, will publish on Google Play soon)
15. Source codes generator

...... Many features, you can explore them on your own

Please access our demo to run the EAs:
https://www.fintechee.com

You don't know how to use these EAs?
Please check out our Youtube Channel, there are tutorials(https://www.youtube.com/channel/UCjBs_l6rUxhtZlfRhDuVGSg)
You can find the source codes for the tutorials here: https://github.com/fintechee/tutorials

Please check our [Github wiki](https://github.com/fintechee/Expert-Advisor-Studio/wiki) to know more details about APIs.

Please check this tutorial(https://www.fintechee.com/expert-advisor-cpp-compiler) to learn how to use our Nodejs package(https://github.com/fintechee/Expert-Advisor-CPP-Compiler) to compile C/C++/MQL-based programs.

![Fintechee Screenshot](https://www.fintechee.com/vpimages/services/newscreenshot1.png)

![Fintechee custom indicator](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/analyzestructure.png)

![Fintechee APP Screenshot1](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile1.png)
![Fintechee APP Screenshot2](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile2.png)
![Fintechee APP Screenshot3](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile3.png)
![Fintechee APP Screenshot4](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile4.png)
![Fintechee APP Screenshot5](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile5.png)
![Fintechee APP Screenshot6](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile6.png)
![Fintechee APP Screenshot7](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile7.png)
![Fintechee APP Screenshot8](https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile8.png)

### Release Notes
2020.7.7 three APIs were modified and added parameters.
1. sendOrder
2. modifyOrder
3. closeTrade

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

Please check our site for details. [Fintechee](https://www.fintechee.com/sdk-trading/)

MIT License
