registerIndicator(
    "macd", "MACD", function (context) {
        var dataInput = getDataInput(context, 0)
        var dataFEMA = getDataOutput(context, "fastEMA")
        var dataSEMA = getDataOutput(context, "slowEMA")
        var dataOutputMain = getDataOutput(context, "macdMain")
        var dataOutputSignal = getDataOutput(context, "macdSignal")

        var fEMA = getIndiParameter(context, "fasteEMA");
        var fSmthFctr = 2.0 / (fEMA + 1);
        var sEMA = getIndiParameter(context, "slowEMA");
        var sSmthFctr = 2.0 / (sEMA + 1);
        var sgnlSMA = getIndiParameter(context, "signalSMA");

        var start = getCalculatedLength(context)

        if (start == 0) {
            dataFEMA[0] = dataInput[0]
            dataSEMA[0] = dataInput[0]
            dataOutputMain[0] = 0
            start++
        } else if (start == 1) {
        } else {
            start--
        }

        while(start < dataInput.length) {
            dataFEMA[start] = dataInput[start] * fSmthFctr + dataFEMA[start - 1] * (1 - fSmthFctr);
            dataSEMA[start] = dataInput[start] * sSmthFctr + dataSEMA[start - 1] * (1 - sSmthFctr);
            dataOutputMain[start] = dataFEMA[start] - dataSEMA[start]
            start++;
        }

        start = getCalculatedLength(context)

        if (start > 0) {
            start--
        } else {
            for (var i = 0; i < sgnlSMA - 1; i++) {
                dataOutputSignal[i] = 0
            }

            start = sgnlSMA - 1
        }

        var sum = 0

        for (var i = start - sgnlSMA + 1; i < start; i++) {
            sum += dataOutputMain[i]
        }

        for (var i = start; i < dataInput.length; i++) {
            sum += dataOutputMain[i]
            dataOutputSignal[i] = sum / sgnlSMA
            sum -= dataOutputMain[i - sgnlSMA + 1]
        }
    },[{
        name: "fasteEMA",
        value: 12,
        required: true,
        type: PARAMETER_TYPE.NUMBER,
        range: [1, 100]
    },{
        name: "slowEMA",
        value: 26,
        required: true,
        type: PARAMETER_TYPE.NUMBER,
        range: [1, 100]
    },{
        name: "signalSMA",
        value: 9,
        required: true,
        type: PARAMETER_TYPE.NUMBER,
        range: [1, 100]
    }],
    [{
        name: DATA_NAME.CLOSE,
        index: 0
    }],
    [{
        name: "fastEMA",
        visible: false
    },{
        name: "slowEMA",
        visible: false
    },{
        name: "macdMain",
        visible: true,
        renderType: RENDER_TYPE.HISTOGRAM,
        color: "#4EC2B4"
    },{
        name: "macdSignal",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "#DE5029"
    }],
    WHERE_TO_RENDER.SEPARATE_WINDOW)
