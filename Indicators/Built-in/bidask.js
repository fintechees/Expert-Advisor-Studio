registerIndicator(
"bidask", "Bid and Ask(v1.01)", function (context) {
	var dataInput = getDataInput(context, 0)
	if (dataInput.length == 0) return
	var dataOutputBid = getDataOutput(context, "bid")
	var dataOutputAsk = getDataOutput(context, "ask")
	var spread = getIndiParameter(context, "spread")

	var currPrice = dataInput[dataInput.length - 1]
	var bid = currPrice - spread / 2
	var ask = currPrice + spread / 2
	var dataLen = dataInput.length
	var barNum = typeof context.barNum == "undefined" ? dataInput.length : context.barNum

	for (var i = dataLen - 1; i >= dataLen - 1 - barNum; i--) {
		dataOutputBid[i] = bid
		dataOutputAsk[i] = ask
	}
},[{
	name: "spread",
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
