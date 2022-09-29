registerIndicator("extra_mfi", "Market Facilitation Index Extra Version(v1.0)", function (context) {
  var dataInputHigh = getDataInput(context, 0)
  var dataInputLow = getDataInput(context, 1)
  var dataInputVol = getDataInput(context, 2)
  var dataOutputMfi = getDataOutput(context, "mfi")
  var dataOutput = getDataOutput(context, "extramfi")
  var dataOutputLv = getDataOutput(context, "level")

  var calculatedLength = getCalculatedLength(context)
  var i = calculatedLength

  if (i != 0) {
    i--
  }

  while (i < dataInputVol.length) {
    if (dataInputVol[i] == 0) {
      dataOutputMfi[i] = 0
    } else {
      dataOutputMfi[i] = (dataInputHigh[i] - dataInputLow[i]) / dataInputVol[i]
    }

    dataOutputLv[i] = 0

    if (i > 0) {
      if (dataInputVol[i] > dataInputVol[i - 1] && dataOutputMfi[i] > dataOutputMfi[i - 1]) {
        dataOutput[i] = 3
      } else if (dataInputVol[i] > dataInputVol[i - 1] && dataOutputMfi[i] < dataOutputMfi[i - 1]) {
        dataOutput[i] = 2
        dataOutputLv[i] = 2
      } else if (dataInputVol[i] < dataInputVol[i - 1] && dataOutputMfi[i] > dataOutputMfi[i - 1]) {
        dataOutput[i] = 1
      } else {
        dataOutput[i] = 0
      }
    } else {
      dataOutput[0] = 0
    }

    i++
  }
},[],
[{
  name: DATA_NAME.HIGH,
  index: 0
},{
  name: DATA_NAME.LOW,
  index: 1
},{
  name: DATA_NAME.VOLUME,
  index: 2
}],
[{
  name: "mfi",
  visible: false
},{
  name: "extramfi",
  visible: true,
  renderType: RENDER_TYPE.LINE,
  color: "steelblue"
},{
  name: "level",
  visible: true,
  renderType: RENDER_TYPE.DASHARRAY,
  color: "orange"
}],
WHERE_TO_RENDER.SEPARATE_WINDOW)
