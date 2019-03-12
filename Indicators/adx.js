registerIndicator(
    "adx", "Average directional index", function (context) {
        var dataInputClose = getDataInput(context, 0)
        var dataInputHigh = getDataInput(context, 1)
        var dataInputLow = getDataInput(context, 2)

        var tmpLine = getDataOutput(context, "tmp")
        var plusSdiTmp = getDataOutput(context, "plusSdiTmp")
        var minusSdiTmp = getDataOutput(context, "minusSdiTmp")

        var dataOutputAdx = getDataOutput(context, "adx")
        var dataOutputPlusDi = getDataOutput(context, "plusDi")
        var dataOutputMinusDi = getDataOutput(context, "minusDi")

        var period = getIndiParameter(context, "period")
        var smthFctr = 2.0 / (period + 1)

        var startTmp = getCalculatedLength(context)
        var start = startTmp

        if (start > 0) {
            start--
        } else {
            plusSdiTmp[start] = 0
            minusSdiTmp[start] = 0
            start = 1
        }

        var plusDM = null
        var minusDM = null
        var trueRange = null
        var currH = null
        var currL = null
        var prevH = null
        var prevL = null
        var prevC = null

        while (start < dataInputClose.length) {
            currH = dataInputHigh[start]
            currL = dataInputLow[start]
            prevH = dataInputHigh[start - 1]
            prevL = dataInputLow[start - 1]
            prevC = dataInputClose[start - 1]

            plusDM = currH - prevH
            minusDM = prevL - currL
            if (0 > plusDM) {
                plusDM = 0
            }
            if (0 > minusDM) {
                minusDM = 0
            }
            if (plusDM == minusDM) {
                plusDM = 0
                minusDM = 0
            } else if (plusDM < minusDM) {
                plusDM = 0
            } else if (plusDM > minusDM) {
                minusDM = 0
            }

            trueRange = Math.max(Math.abs(currH - currL), Math.abs(currH - prevC))
            trueRange = Math.max(trueRange, Math.abs(currL - prevC))

            if (0 == trueRange) {
                plusSdiTmp[start] = 0
                minusSdiTmp[start] = 0
            }else{
                plusSdiTmp[start] = 100 * plusDM / trueRange
                minusSdiTmp[start] = 100 * minusDM / trueRange
            }

            start++
        }

        start = startTmp

        if (start == 0) {
            dataOutputPlusDi[0] = plusSdiTmp[0]
            dataOutputMinusDi[0] = minusSdiTmp[0]
            start++
        } else if (start == 1) {
        } else {
            start--
        }

        while (start < dataInputClose.length) {
            dataOutputPlusDi[start] = plusSdiTmp[start] * smthFctr + dataOutputPlusDi[start - 1] * (1 - smthFctr)
            dataOutputMinusDi[start] = minusSdiTmp[start] * smthFctr + dataOutputMinusDi[start - 1] * (1 - smthFctr)
            start++
        }

        start = startTmp

        while (start < dataInputClose.length) {
            var tmp = Math.abs(dataOutputPlusDi[start] + dataOutputMinusDi[start])

            if (0 == tmp) {
                tmpLine[start] = 0
            } else {
                tmpLine[start] = 100 * (Math.abs(dataOutputPlusDi[start] - dataOutputMinusDi[start]) / tmp)
            }

            start++
        }

        start = startTmp

        if (start == 0) {
            dataOutputAdx[0] = tmpLine[0]
            start++
        } else if (start == 1) {
        } else {
            start--
        }

        while (start < dataInputClose.length) {
            dataOutputAdx[start] = tmpLine[start] * smthFctr + dataOutputAdx[start - 1] * (1 - smthFctr)
            start++
        }
    },[{
        name: "period",
        value: 14,
        required: true,
        type: PARAMETER_TYPE.NUMBER,
        range: [1, 100]
    }],
    [{
        name: DATA_NAME.CLOSE,
        index: 0
    },{
        name: DATA_NAME.HIGH,
        index: 1
    },{
        name: DATA_NAME.LOW,
        index: 2
    }],
    [{
        name: "tmp",
        visible: false
    },{
        name: "plusSdiTmp",
        visible: false
    },{
        name: "minusSdiTmp",
        visible: false
    },{
        name: "adx",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "white"
    },{
        name: "plusDi",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#4EC2B4"
    },{
        name: "minusDi",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#DE5029"
    }],
    WHERE_TO_RENDER.SEPARATE_WINDOW)
