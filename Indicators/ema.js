registerIndicator(
    "ema", "Exponential moving average", function (context) {
        var dataInput = getDataInput(context, 0)
        var dataOutput = getDataOutput(context, "ema")
        var period = getIndiParameter(context, "period")
        var smthFctr = 2.0 / (period + 1);

        var start = getCalculatedLength(context)

        if (start == 0) {
            dataOutput[0] = dataInput[0]
            start++
        } else if (start == 1) {
        } else {
            start--
        }

        while(start < dataInput.length) {
            dataOutput[start] = dataInput[start] * smthFctr + dataOutput[start - 1] * (1 - smthFctr);
            start++;
        }
    },[{
        name: "period",
        value: 5,
        required: true,
        type: PARAMETER_TYPE.NUMBER,
        range: [1, 100]
    }],
    [{
        name: DATA_NAME.CLOSE,
        index: 0
    }],
    [{
        name: "ema",
        visible: true,
        renderType: RENDER_TYPE.LINE,
        color: "steelblue"
    }],
    WHERE_TO_RENDER.CHART_WINDOW)
