// Please check this post to know how to use this EA: https://www.fintecher.org/daily-trading/added-genetic-algorithm-for-trading.html
registerEA(
"nn_example",
"A test EA to run neuron model for XOR(v1.0)",
[
// hidden layer(1st neuron)
{name: "h11", value: 20, required: true, type: "Number", range: [-100, 100], step: 10},
{name: "h12", value: 20, required: true, type: "Number", range: [-100, 100], step: 10},
{name: "b1", value: -10, required: true, type: "Number", range: [-100, 100], step: 10},
// hidden layer(2nd neuron)
{name: "h21", value: -20, required: true, type: "Number", range: [-100, 100], step: 10},
{name: "h22", value: -20, required: true, type: "Number", range: [-100, 100], step: 10},
{name: "b2", value: 30, required: true, type: "Number", range: [-100, 100], step: 10},
// output layer
{name: "o1", value: 20, required: true, type: "Number", range: [-100, 100], step: 10},
{name: "o2", value: 20, required: true, type: "Number", range: [-100, 100], step: 10},
{name: "b", value: -30, required: true, type: "Number", range: [-100, 100], step: 10},
],
function (context) { // Init()
    // Please don;t remove the source codes below, they are required to make an EA get boosted
	var account = getAccount(context, 0)
	var brokerName = getBrokerNameOfAccount(account)
	var accountId = getAccountIdOfAccount(account)
	var symbolName = "EUR/USD"

	getQuotes (context, brokerName, accountId, symbolName)

},
function (context) { // Deinit()
	var h11 = getEAParameter(context, "h11") // weight
	var h12 = getEAParameter(context, "h12") // weight
	var b1 = getEAParameter(context, "b1") // bias
	var h21 = getEAParameter(context, "h21")
	var h22 = getEAParameter(context, "h22")
	var b2 = getEAParameter(context, "b2")
	var o1 = getEAParameter(context, "o1") // weight
	var o2 = getEAParameter(context, "o2") // weight
	var b = getEAParameter(context, "b") // bias

	var sigmoid = function (t) {
		return 1 / (1 + Math.pow(Math.E, -t))
	}

	var nn = function (p1, p2) {
		return sigmoid(o1 * sigmoid(h11 * p1 + h12 * p2 + b1) + o2 * sigmoid(h21 * p1 + h22 * p2 + b2) + b)
	}

	var error = 0

	error += nn(1, 1)
	error += 1 - nn(1, 0)
	error += 1 - nn(0, 1)
	error += nn(0, 0)

	setOptimizationResult(context, -error)

	printMessage("error: " + error + ", " + Math.round(nn(1, 1)) + " " + Math.round(nn(1, 0)) + " " + Math.round(nn(0, 1)) + " " + Math.round(nn(0, 0)))
},
function (context) { // OnTick()
})
