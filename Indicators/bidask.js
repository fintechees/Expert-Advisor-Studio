registerIndicator(
"bidask", "Bid and Ask(v1.0)", function (context) {
	var dataInput = getDataInput(context, 0)
	if (dataInput.length == 0) return
	var dataOutputBid = getDataOutput(context, "bid")
	var dataOutputAsk = getDataOutput(context, "ask")
	var pips = getIndiParameter(context, "pips")

	var currPrice = dataInput[dataInput.length - 1]
	var bid = currPrice - pips / 2
	var ask = currPrice + pips / 2
	var dataLen = dataInput.length
	var barNum = typeof context.barNum == "undefined" ? dataInput.length : context.barNum

	for (var i = dataLen - 1; i >= dataLen - 1 - barNum; i--) {
		dataOutputBid[i] = bid
		dataOutputAsk[i] = ask
	}
},[{
	name: "pips",
	value: 0.0001,
	required: true,
	type: PARAMETER_TYPE.NUMBER,
	range: [0, 0.1]
}],
[{
	name: DATA_NAME.CLOSE,
	index: 0
}],
[{
	name: "bid",
	visible: true,
	renderType: RENDER_TYPE.DASHARRAY,
	color: "red"
},{
	name: "ask",
	visible: true,
	renderType: RENDER_TYPE.DASHARRAY,
	color: "green"
}],
WHERE_TO_RENDER.CHART_WINDOW,
function (context) { // Init()
},
function (context) { // Deinit()
},
function (context) { // Render()
  context.barNum = getBarNum(context)
})
