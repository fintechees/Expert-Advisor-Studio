registerIndicator("extra_fractals", "An extended Fractals(v1.0)", function (context) {
  var dataInputHigh = getDataInput(context, 0)
  var dataInputLow = getDataInput(context, 1)
  var dataInputOpen = getDataInput(context, 2)
  var dataInputClose = getDataInput(context, 3)
  var dataOutputUp = getDataOutput(context, "fractalsUp")
  var dataOutputDown = getDataOutput(context, "fractalsDown")
  var dataOutputZZ = getDataOutput(context, "zigzag")
  var dataOutputZZ2 = getDataOutput(context, "zigzag2")
  var dataOutputZZUp = getDataOutput(context, "zigzagUp")
  var dataOutputZZDown = getDataOutput(context, "zigzagDown")
  var dataOutputZZUpIdx = getDataOutput(context, "zigzagUpIdx")
  var dataOutputZZDownIdx = getDataOutput(context, "zigzagDownIdx")
  var dataOutputZZLine = getDataOutput(context, "zigzagLine")

  var calculatedLength = getCalculatedLength(context)

  var ptr = 0

  if (calculatedLength > 0) {
    ptr = calculatedLength - 4
  } else {
    for (var i = 0; i < dataInputHigh.length; i++) {
      dataOutputUp[i] = 0
      dataOutputDown[i] = 0
      dataOutputZZ[i] = 0
      dataOutputZZ2[i] = 0
      dataOutputZZUp[i] = 0
      dataOutputZZDown[i] = 0
      dataOutputZZUpIdx[i] = 0
      dataOutputZZDownIdx[i] = 0
      dataOutputZZLine[i] = 0
    }

    ptr = 2
  }

  var highest = null
  var lowest = null

  while (ptr < dataInputHigh.length - 3) {
    bHFound = false
    highest = dataInputHigh[ptr]

    if (highest > dataInputHigh[ptr - 1] && highest > dataInputHigh[ptr - 2] && highest > dataInputHigh[ptr + 1] && highest > dataInputHigh[ptr + 2]) {
      bHFound = true
      dataOutputUp[ptr] = highest
    }

    bLFound = false
    lowest = dataInputLow[ptr]

    if (lowest < dataInputLow[ptr - 1] && lowest < dataInputLow[ptr - 2] && lowest < dataInputLow[ptr + 1] && lowest < dataInputLow[ptr + 2]) {
      bLFound = true
      dataOutputDown[ptr] = lowest
    }

    ptr++
  }

  if (calculatedLength == 0) {
    ptr = 2
  } else {
    ptr = calculatedLength - 4
  }

  while (ptr < dataInputHigh.length - 1) {
    if (dataOutputUp[ptr] > 0) {
      if (dataOutputZZUp[ptr - 1] > 0) {
        dataOutputZZUp[ptr] = dataOutputZZUp[ptr - 1]
      } else {
        dataOutputZZUp[ptr] = dataOutputUp[ptr]
      }
      dataOutputZZUpIdx[ptr] = ptr
    } else {
      if (dataOutputUp[ptr - 1] > 0) {
        dataOutputZZUp[ptr] = dataOutputUp[ptr - 1]
      } else {
        dataOutputZZUp[ptr] = dataOutputZZUp[ptr - 1]
      }
      dataOutputZZUpIdx[ptr] = dataOutputZZUpIdx[ptr - 1]
    }

    if (dataOutputDown[ptr] > 0) {
      if (dataOutputZZDown[ptr - 1] > 0) {
        dataOutputZZDown[ptr] = dataOutputZZDown[ptr - 1]
      } else {
        dataOutputZZDown[ptr] = dataOutputDown[ptr]
      }
      dataOutputZZDownIdx[ptr] = ptr
    } else {
      if (dataOutputDown[ptr - 1] > 0) {
        dataOutputZZDown[ptr] = dataOutputDown[ptr - 1]
      } else {
        dataOutputZZDown[ptr] = dataOutputZZDown[ptr - 1]
      }
      dataOutputZZDownIdx[ptr] = dataOutputZZDownIdx[ptr - 1]
    }

    ptr++
  }

  if (ptr == dataInputHigh.length - 1) {
    dataOutputZZUp[ptr] = dataOutputZZUp[ptr - 1]
    dataOutputZZDown[ptr] = dataOutputZZDown[ptr - 1]
    dataOutputZZUpIdx[ptr] = dataOutputZZUpIdx[ptr - 1]
    dataOutputZZDownIdx[ptr] = dataOutputZZDownIdx[ptr - 1]
  }

  var zigzag = []

  if (calculatedLength == 0) {
    ptr = 5
  } else {
    ptr = calculatedLength - 2
    var zzCnt = 0

    while (zzCnt < 2) {
      if (dataOutputZZ[ptr] > 0) {
        zigzag.splice(0, 0, {
          value: dataOutputZZ2[ptr],
          index: ptr
        })

        zzCnt++
      }

      ptr--
    }

    ptr = calculatedLength - 1
  }

  while (ptr < dataInputHigh.length) {
    if (dataOutputZZ[ptr] > 0) {
      ptr++
      continue
    }

    var orientation = -1

    if (((dataInputHigh[ptr] >= dataOutputZZUp[ptr - 2] && dataInputLow[ptr] <= dataOutputZZUp[ptr - 2] && dataInputOpen[ptr] <= dataOutputZZUp[ptr - 2]) ||
        (dataInputOpen[ptr] >= dataOutputZZUp[ptr - 2] && dataInputClose[ptr - 1] < dataOutputZZUp[ptr - 2])) && dataOutputZZ[ptr - 1] == 0 && dataOutputZZ[ptr - 2] == 0 &&
        ((dataInputHigh[ptr] >= dataOutputZZDown[ptr - 2] && dataInputLow[ptr] <= dataOutputZZDown[ptr - 2] && dataInputOpen[ptr] >= dataOutputZZDown[ptr - 2]) ||
        (dataInputClose[ptr - 1] > dataOutputZZDown[ptr - 2] && dataInputOpen[ptr] <= dataOutputZZDown[ptr - 2])) && dataOutputZZ[ptr - 1] == 0 && dataOutputZZ[ptr - 2] == 0) {

      if (dataInputOpen[ptr] > dataInputClose[ptr]) {
        orientation = 1
      } else {
        orientation = 0
      }
    }

    if (orientation != 0 &&
        ((dataInputHigh[ptr] >= dataOutputZZUp[ptr - 2] && dataInputLow[ptr] <= dataOutputZZUp[ptr - 2] && dataInputOpen[ptr] <= dataOutputZZUp[ptr - 2]) ||
        (dataInputOpen[ptr] >= dataOutputZZUp[ptr - 2] && dataInputClose[ptr - 1] < dataOutputZZUp[ptr - 2])) && dataOutputZZ[ptr - 1] == 0 && dataOutputZZ[ptr - 2] == 0) {
      var foundIdx = -1
      var lowestZZ = Number.MAX_VALUE
      var idx = dataOutputZZUpIdx[ptr - 2]

      for (var i = idx; i < ptr; i++) {
        if (dataInputLow[i] < lowestZZ) {
          foundIdx = i
          lowestZZ = dataInputLow[i]
        }
      }

      if (foundIdx != -1) {
        zigzag.push({
          value: dataOutputZZUp[ptr - 2],
          index: ptr
        })
        dataOutputZZ[ptr] = lowestZZ
        dataOutputZZ2[ptr] = dataOutputZZUp[ptr - 2]
      }
    }

    if (orientation != 1 &&
        ((dataInputHigh[ptr] >= dataOutputZZDown[ptr - 2] && dataInputLow[ptr] <= dataOutputZZDown[ptr - 2] && dataInputOpen[ptr] >= dataOutputZZDown[ptr - 2]) ||
        (dataInputClose[ptr - 1] > dataOutputZZDown[ptr - 2] && dataInputOpen[ptr] <= dataOutputZZDown[ptr - 2])) && dataOutputZZ[ptr - 1] == 0 && dataOutputZZ[ptr - 2] == 0) {
      var foundIdx = -1
      var highestZZ = -Number.MAX_VALUE
      var idx = dataOutputZZDownIdx[ptr - 2]

      for (var i = idx; i < ptr; i++) {
        if (dataInputHigh[i] > highestZZ) {
          foundIdx = i
          highestZZ = dataInputHigh[i]
        }
      }

      if (foundIdx != -1) {
        zigzag.push({
          value: dataOutputZZDown[ptr - 2],
          index: ptr
        })
        dataOutputZZ[ptr] = highestZZ
        dataOutputZZ2[ptr] = dataOutputZZDown[ptr - 2]
      }
    }

    ptr++
  }

  for (var i = 1; i < zigzag.length; i++) {
    var step = (zigzag[i].value - zigzag[i - 1].value) / (zigzag[i].index - zigzag[i - 1].index)
    var nextIdx = zigzag[i].index
    var startValue = zigzag[i - 1].value
    var startIdx = zigzag[i - 1].index

    for (var j = zigzag[i - 1].index; j < nextIdx; j++) {
      dataOutputZZLine[j] = startValue + step * (j - startIdx)
    }
  }

},[],
[{
  name: DATA_NAME.HIGH,
  index: 0
},{
  name: DATA_NAME.LOW,
  index: 1
},{
  name: DATA_NAME.OPEN,
  index: 2
},{
  name: DATA_NAME.CLOSE,
  index: 3
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
  name: "zigzag2",
  visible: true,
  renderType: RENDER_TYPE.ROUND,
  color: "orange"
},{
  name: "zigzagUp",
  visible: true,
  renderType: RENDER_TYPE.DASHARRAY,
  color: "green"
},{
  name: "zigzagDown",
  visible: true,
  renderType: RENDER_TYPE.DASHARRAY,
  color: "red"
},{
  name: "zigzagUpIdx",
  visible: false
},{
  name: "zigzagDownIdx",
  visible: false
},{
  name: "fractalsUp",
  visible: true,
  renderType: RENDER_TYPE.ROUND,
  color: "green"
},{
  name: "fractalsDown",
  visible: true,
  renderType: RENDER_TYPE.ROUND,
  color: "red"
}],
WHERE_TO_RENDER.CHART_WINDOW)
