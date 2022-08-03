registerIndicator("equity_curve", "An indicator to show the equity and the balance of an account(v1.01)", function (context) {
  var dataInput = getDataInput(context, 0)
  var dataOutputEq = getDataOutput(context, "equity")
  var dataOutputBl = getDataOutput(context, "balance")

  if (typeof window.accounts != "undefined" && typeof window.accounts[context.chartHandle] != "undefined" && typeof window.accounts[context.chartHandle].equity != "undefined") {
    context.equity = window.accounts[context.chartHandle].equity
    context.balance = window.accounts[context.chartHandle].balance
  }

  var calculatedLength = getCalculatedLength(context)
  var i = calculatedLength

  if (i > 0) {
    i--
  }

  while (i < dataInput.length) {
    dataOutputEq[i] = typeof context.equity == "undefined" ? 0 : (typeof context.equity[i] == "undefined" ? (i > 0 ? context.equity[i - 1] : 0) : context.equity[i])
    dataOutputBl[i] = typeof context.balance == "undefined" ? 0 : (typeof context.balance[i] == "undefined" ? (i > 0 ? context.balance[i - 1] : 0) : context.balance[i])

    i++
  }
},[{
	name: "chartHandle",
	value: 0,
	required: true,
	type: "Integer",
	range: null,
}],
[{
  name: DATA_NAME.TIME,
  index: 0
}],
[{
  name: "equity",
  visible: true,
  renderType: RENDER_TYPE.DASHARRAY,
  color: "steelblue"
}, {
  name: "balance",
  visible: true,
  renderType: RENDER_TYPE.LINE,
  color: "green"
}],
WHERE_TO_RENDER.SEPARATE_WINDOW,
function (context) { // init
  context.chartHandle = getIndiParameter(context, "chartHandle")

  if (typeof window.accounts != "undefined" && typeof window.accounts[context.chartHandle] != "undefined" && typeof window.accounts[context.chartHandle].equity != "undefined") {
    context.equity = window.accounts[context.chartHandle].equity
    context.balance = window.accounts[context.chartHandle].balance
  } else {
    popupErrorMessage("Please note, this indicator(equity_curve) can't be used independently. An EA called \"equity_curve_viewer\" that serves as an initiator should be used with this one simultaneously. You need to define an window object in the source codes of your EA that tries to refer to this indicator to manage the information about the equity and the balance. Please specify chartHandle as the index number of the window object before getting the handle of this indicator.")
  }
},
function (context) { // deinit
  delete window.accounts[context.chartHandle].equity
  delete window.accounts[context.chartHandle].balance
},
function (context) { // render
})
