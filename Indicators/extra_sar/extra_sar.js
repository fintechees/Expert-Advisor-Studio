registerIndicator("extra_sar", "Parabolic SAR(v1.0)", function (context) {
  var dataInputHigh = getDataInput(context, 0)
  var dataInputLow = getDataInput(context, 1)

  var dataOutput = getDataOutput(context, "sar")
  var dataOutputIsLong = getDataOutput(context, "isLong")
  var dataOutputAf = getDataOutput(context, "af")
  var dataOutputEp = getDataOutput(context, "ep")

  var acceleration = getIndiParameter(context, "acceleration")
  var afMax = getIndiParameter(context, "afMax")
  var shift = getIndiParameter(context, "shift")

  var calculatedLength = getCalculatedLength(context)
  var i = calculatedLength

  var prevH = null
  var prevL = null
  var currH = null
  var currL = null
  var sar = null
  var isLong = null
  var af = acceleration
  var ep = null

  if (i > 0) {
    i -= 2
    prevH = dataInputHigh[i - 1]
    prevL = dataInputLow[i - 1]
    isLong = dataOutputIsLong[i]
    sar = dataOutput[i]
    af = dataOutputAf[i]
    ep = dataOutputEp[i]
  } else {
    dataOutput[i] = 0
    dataOutputIsLong[i] = true
    dataOutputAf[i] = af
    dataOutputEp[i] = 0

    i = 1

    prevH = dataInputHigh[i - 1]
    prevL = dataInputLow[i - 1]
    isLong = true
    sar = prevL
    ep = prevH
  }

  while (i < dataInputHigh.length) {
    currH = dataInputHigh[i]
    currL = dataInputLow[i]

    if (isLong) {
      if (currL <= sar) {
        isLong = false
        sar = Math.max(ep, currH, prevH)

        dataOutput[i] = sar

        af = acceleration
        ep = currL
        sar = sar + af * (ep - sar)
        sar = Math.max(sar, currH, prevH)
      } else {
        dataOutput[i] = sar

        if (currH > ep) {
          ep = currH
          if (af - dataOutputAf[i - 1] <= 0) {
            af += acceleration
          }
          if (af > afMax) {
            af = afMax
          }
        }
        sar = sar + af * (ep - sar)
        sar = Math.min(sar, currL, prevL)
      }
    } else {
      if (currH >= sar) {
        isLong = true
        sar = Math.min(ep, currL, prevL)

        dataOutput[i] = sar

        af = acceleration
        ep = currH
        sar = sar + af * (ep - sar)
        sar = Math.min(sar, currL, prevL)
      } else {
        dataOutput[i] = sar

        if (currL < ep) {
          ep = currL
          if (af - dataOutputAf[i - 1] <= 0) {
            af += acceleration
          }
          if (af > afMax) {
            af = afMax
          }
        }
        sar = sar + af * (ep - sar)
        sar = Math.max(sar, currH, prevH)
      }
    }

    dataOutputIsLong[i] = isLong
    dataOutputAf[i] = af
    dataOutputEp[i] = ep

    i++

    prevH = currH
    prevL = currL
  }

  if (calculatedLength == 0) {
    setIndiShift(context, "sar", shift)
  }
},[{
  name: "acceleration",
  value: 0.01,
  required: true,
  type: PARAMETER_TYPE.NUMBER,
  range: [0.001, 0.1]
},{
  name: "afMax",
  value: 0.05,
  required: true,
  type: PARAMETER_TYPE.NUMBER,
  range: [0.01, 1]
},{
  name: "shift",
  value: 1,
  required: true,
  type: PARAMETER_TYPE.INTEGER,
  range: [0, 20]
}],
[{
  name: DATA_NAME.HIGH,
  index: 0
},{
  name: DATA_NAME.LOW,
  index: 1
}],
[{
  name: "sar",
  visible: true,
  renderType: RENDER_TYPE.ROUND,
  color: "steelblue"
},{
  name: "isLong",
  visible: false
},{
  name: "af",
  visible: false
},{
  name: "ep",
  visible: false
}],
WHERE_TO_RENDER.CHART_WINDOW)
