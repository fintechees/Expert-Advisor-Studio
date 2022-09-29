registerIndicator(
    "atr_comparison", "An improved Average True Range(v1.0)", function (context) {
    // Please add atr_exporter to the target charts before you add this indicator to one of the target charts.
    // For example, if you want to compare EUR/USD with AUD/USD, then you need to add atr_exporter to the target charts EUR/USD and AUD/USD respectively.
    // After that, you need to add atr_comparison to either EUR/USD or AUD/USD.
		var name1 = getIndiParameter(context, "name1")
    var name2 = getIndiParameter(context, "name2")

    if (typeof window.inventoryForATR == "undefined" || typeof window.inventoryForATR[name1] == "undefined" || typeof window.inventoryForATR[name2] == "undefined") {
      delete context.bFirstRun
      return
    } else {
      if (typeof context.bFirstRun == "undefined") {
        context.bFirstRun = true
      }
    }

    var dataInput1 = window.inventoryForATR[name1]
    var dataInput2 = window.inventoryForATR[name2]
    var dataOutput1 = getDataOutput(context, "atr1")
    var dataOutput2 = getDataOutput(context, "atr2")
    var dataInputLen1 = dataInput1.length
    var dataInputLen2 = dataInput2.length
    var dataOutputLen1 = dataOutput1.length
    var dataOutputLen2 = dataOutput2.length

    if (context.bFirstRun) {
      var dataLen = 0

      if (dataInputLen1 <= dataInputLen2) {
        dataLen = dataInputLen1
      } else {
        dataLen = dataInputLen2
      }

      for (var i = dataInputLen1 - 1; i >= dataInputLen1 - dataLen; i--) {
        dataOutput1[i] = dataInput1[i]
      }
      for (var i = dataInputLen1 - dataLen - 1; i >= 0; i--) {
        dataOutput1[i] = 0
      }
      for (var i = dataInputLen2 - 1; i >= dataInputLen2 - dataLen; i--) {
        dataOutput2[i] = dataInput2[i]
      }
      for (var i = dataInputLen2 - dataLen - 1; i >= 0; i--) {
        dataOutput2[i] = 0
      }
    } else {
      dataOutput1[dataOutputLen1 - 1] = dataInput1[dataInputLen1 - 1]
      dataOutput2[dataOutputLen2 - 1] = dataInput2[dataInputLen2 - 1]
    }
	},[{
		name: "name1",
		value: "chart1",
		required: true,
		type: PARAMETER_TYPE.STRING,
		range: null
	}, {
		name: "name2",
		value: "chart2",
		required: true,
		type: PARAMETER_TYPE.STRING,
		range: null
	}],
	[{
		name: DATA_NAME.TIME,
		index: 0
	}],
	[{
    name: "atr1",
    visible: true,
    renderType: RENDER_TYPE.LINE,
    color: "steelblue"
  },{
    name: "atr2",
    visible: true,
    renderType: RENDER_TYPE.LINE,
    color: "orange"
  }],
	WHERE_TO_RENDER.SEPARATE_WINDOW,
  function (context) { // Init()
  },
  function (context) { // Deinit()
  },
  function (context) { // Render()
})
