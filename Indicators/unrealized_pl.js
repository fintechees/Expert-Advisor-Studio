registerIndicator("unrealized_pl", "An indicator to show the unrealized PL of the account(v1.02)", function (context) {
  var dataInput = getDataInput(context, 0)
  var dataOutputPl = getDataOutput(context, "totalPl")
  var dataOutputPlL = getDataOutput(context, "totalPlL")
  var dataOutputPlS = getDataOutput(context, "totalPlS")

  if (typeof window.accounts != "undefined" && typeof window.accounts[context.chartHandle] != "undefined") {
    context.totalPl = window.accounts[context.chartHandle].totalPl
    context.totalPlL = window.accounts[context.chartHandle].totalPlL
    context.totalPlS = window.accounts[context.chartHandle].totalPlS
  }

  var calculatedLength = getCalculatedLength(context)
  var i = calculatedLength

  if (i > 0) {
    i--
  }

  while (i < dataInput.length) {
    dataOutputPl[i] = typeof context.totalPl == "undefined" ? 0 : (typeof context.totalPl[i] == "undefined" ? 0 : context.totalPl[i])
    dataOutputPlL[i] = typeof context.totalPlL == "undefined" ? 0 : (typeof context.totalPlL[i] == "undefined" ? 0 : context.totalPlL[i])
    dataOutputPlS[i] = typeof context.totalPlS == "undefined" ? 0 : (typeof context.totalPlS[i] == "undefined" ? 0 : context.totalPlS[i])

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
  name: "totalPl",
  visible: true,
  renderType: RENDER_TYPE.LINE,
  color: "steelblue"
}, {
  name: "totalPlL",
  visible: true,
  renderType: RENDER_TYPE.DASHARRAY,
  color: "green"
}, {
  name: "totalPlS",
  visible: true,
  renderType: RENDER_TYPE.DASHARRAY,
  color: "red"
}],
WHERE_TO_RENDER.SEPARATE_WINDOW,
function (context) { // init
  context.chartHandle = getIndiParameter(context, "chartHandle")

  if (typeof window.accounts != "undefined" && typeof window.accounts[context.chartHandle] != "undefined") {
    context.totalPl = window.accounts[context.chartHandle].totalPl
    context.totalPlL = window.accounts[context.chartHandle].totalPlL
    context.totalPlS = window.accounts[context.chartHandle].totalPlS
  } else {
    popupErrorMessage("Please note, this indicator can't be used independently. An EA called \"unrealized_pl_viewer\" that serves as an initiator should be used with this one simultaneously. You need to define an window object in the source codes of your EA that tries to refer to this indicator to manage the information about the unrealized PL. Please specify chartHandle as the index number of the window object before getting the handle of this indicator.")
  }
},
function (context) { // deinit
  delete window.accounts[context.chartHandle]
},
function (context) { // render
})
