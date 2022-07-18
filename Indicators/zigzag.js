registerIndicator("zigzag", "ZigZag based on SAR(v1.0)", function (context) {
  var dataInputHigh = getDataInput(context, 0)
  var dataInputLow = getDataInput(context, 1)

  var dataOutputZZLine = getDataOutput(context, "zigzagLine")
  var dataOutputZZ = getDataOutput(context, "zigzag")
  var dataOutput = getDataOutput(context, "sar")
  var dataOutputIsLong = getDataOutput(context, "isLong")
  var dataOutputAf = getDataOutput(context, "af")
  var dataOutputEp = getDataOutput(context, "ep")

  var acceleration = getIndiParameter(context, "acceleration")
  var afMax = getIndiParameter(context, "afMax")

  var arrLen = dataInputHigh.length
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

  while (i < arrLen) {
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

  var zigzag = []
  var latestZZ = null
  var latestZZIdx = -1

  if (calculatedLength > 0) {
    dataOutputZZ[calculatedLength - 1] = 0
    dataOutputZZLine[calculatedLength - 1] = 0
  } else {
    dataOutputZZ[0] = (dataInputHigh[0] + dataInputLow[0]) / 2
    dataOutputZZLine[0] = dataOutputZZ[0]

    for (i = 1; i < arrLen; i++) {
      dataOutputZZ[i] = 0
    }
  }

  for (i = calculatedLength - 1; i >= 0; i--) {
    if (dataOutputZZ[i] != 0) {
      latestZZ = {
        value: dataOutputZZ[i],
        index: i
      }

      latestZZIdx = i

      break
    }
  }

  i = arrLen - 1

  var foundIdx = -1
  var lowestZZ = Number.MAX_VALUE
  var highestZZ = -Number.MAX_VALUE

  var bPrevLong = dataOutputIsLong[i]

  while (i >= 0 && i > latestZZIdx) {
    if (dataOutputIsLong[i]) {
      if (bPrevLong && i != 0) {
        if (dataInputHigh[i] > highestZZ) {
          foundIdx = i
          highestZZ = dataInputHigh[i]
        }
      } else {
        if (foundIdx != -1) {
          zigzag.splice(0, 0, {
            value: lowestZZ,
            index: foundIdx
          })
        }

        foundIdx = i
        lowestZZ = Number.MAX_VALUE
        highestZZ = dataInputHigh[i]

        bPrevLong = true
      }
    } else {
      if (!bPrevLong && i != 0) {
        if (dataInputLow[i] < lowestZZ) {
          foundIdx = i
          lowestZZ = dataInputLow[i]
        }
      } else {
        if (foundIdx != -1) {
          zigzag.splice(0, 0, {
            value: highestZZ,
            index: foundIdx
          })
        }

        foundIdx = i
        lowestZZ = dataInputLow[i]
        highestZZ = -Number.MAX_VALUE

        bPrevLong = false
      }
    }

    i--
  }

  var zzLen = zigzag.length > 1 ? (zigzag.length - 1) : 1

  for (i = 0; i < zzLen; i++) {
    dataOutputZZ[zigzag[i].index] = zigzag[i].value
  }

  if (arrLen - 1 > zigzag[zigzag.length - 1].index) {
    zigzag.push({
      value: (dataInputHigh[arrLen - 1] + dataInputLow[arrLen - 1]) / 2,
      index: arrLen - 1
    })
  }

  for (i = 1; i < zigzag.length; i++) {
    var step = (zigzag[i].value - zigzag[i - 1].value) / (zigzag[i].index - zigzag[i - 1].index)
    var nextIdx = zigzag[i].index
    var startValue = zigzag[i - 1].value
    var startIdx = zigzag[i - 1].index

    for (var j = zigzag[i - 1].index; j < nextIdx; j++) {
      dataOutputZZLine[j] = startValue + step * (j - startIdx)
    }
  }

  dataOutputZZLine[arrLen - 1] = zigzag[zigzag.length - 1].value
},[{
  name: "acceleration",
  value: 0.02,
  required: true,
  type: PARAMETER_TYPE.NUMBER,
  range: [0.01, 0.1]
},{
  name: "afMax",
  value: 0.2,
  required: true,
  type: PARAMETER_TYPE.NUMBER,
  range: [0.1, 1]
}],
[{
  name: DATA_NAME.HIGH,
  index: 0
},{
  name: DATA_NAME.LOW,
  index: 1
}],
[{
  name: "zigzagLine",
  visible: true,
  renderType: RENDER_TYPE.LINE,
  color: "orange"
},{
  name: "zigzag",
  visible: false
},{
  name: "sar",
  visible: false
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
