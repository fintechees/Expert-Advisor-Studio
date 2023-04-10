registerIndicator("heikin-ask", "Heikin-Ashi(v1.0)", function (context) {
  var dataInputO = getDataInput(context, 0)
  var dataInputH = getDataInput(context, 1)
  var dataInputL = getDataInput(context, 2)
  var dataInputC = getDataInput(context, 3)
  var dataOutputO = getDataOutput(context, "ha_open")
  var dataOutputH = getDataOutput(context, "ha_high")
  var dataOutputL = getDataOutput(context, "ha_low")
  var dataOutputC = getDataOutput(context, "ha_close")

  var calculatedLength = getCalculatedLength(context)

  var i = calculatedLength

  if (i > 0) {
    i--
  } else {
    dataOutputC[i] = (dataInputO[i] + dataInputH[i] + dataInputL[i] + dataInputC[i]) / 4
    dataOutputO[i] = (dataInputO[i] + dataInputC[i]) / 2
    dataOutputH[i] = Math.max(dataInputH[i], dataOutputO[i], dataOutputC[i])
    dataOutputL[i] = Math.max(dataInputL[i], dataOutputO[i], dataOutputC[i])
    i = 1
  }

  while (i < dataInputC.length) {
    dataOutputC[i] = (dataInputO[i] + dataInputH[i] + dataInputL[i] + dataInputC[i]) / 4
    dataOutputO[i] = (dataOutputO[i - 1] + dataOutputC[i - 1]) / 2
    dataOutputH[i] = Math.max(dataInputH[i], dataOutputO[i], dataOutputC[i])
    dataOutputL[i] = Math.max(dataInputL[i], dataOutputO[i], dataOutputC[i])

    i++
  }
},[{
  name: "colorLong",
  value: "green",
  required: true,
  type: PARAMETER_TYPE.STRING,
  range: null
}, {
  name: "colorShort",
  value: "red",
  required: true,
  type: PARAMETER_TYPE.STRING,
  range: null
}],
[{
	name: DATA_NAME.OPEN,
	index: 0
}, {
	name: DATA_NAME.HIGH,
	index: 1
}, {
	name: DATA_NAME.LOW,
	index: 2
}, {
	name: DATA_NAME.CLOSE,
	index: 3
}],
[{
  name: "ha_open",
  visible: false
}, {
  name: "ha_high",
  visible: false
}, {
  name: "ha_low",
  visible: false
}, {
  name: "ha_close",
  visible: false
}],
WHERE_TO_RENDER.CHART_WINDOW,
function (context) { // Init()
  var colorLong = getIndiParameter(context, "colorLong")
  var colorShort = getIndiParameter(context, "colorShort")
  var chartHandle = getChartHandleByContext(context)

  context.heikinAshi = {
    colorLong: colorLong,
    colorShort: colorShort,
    canvas: getSvgCanvas(chartHandle)
  }
},
function (context) { // Deinit()
  var chartHandle = getChartHandleByContext(context)

	context.heikinAshi.canvas.selectAll(".haHL").data([]).exit().remove()
  context.heikinAshi.canvas.selectAll(".haOC").data([]).exit().remove()
  if (typeof context.originalOC != "undefined") {
    context.originalOC.attr("opacity", 1)
    context.originalHL.attr("opacity", 1)
  }
},
function (context) { // Render()
  var dataOutputO = getDataOutput(context, "ha_open")
  var dataOutputH = getDataOutput(context, "ha_high")
  var dataOutputL = getDataOutput(context, "ha_low")
  var dataOutputC = getDataOutput(context, "ha_close")
  var barNum = getBarNum(context)
  var cursor = getCursor(context)
  var width = getCanvasWidth(context)
  var height = getCanvasHeight(context)
  var xScale = getXScale(context)
  var yScale = getYScale(context)

  var ha = []
  var cursor2 = Math.min(cursor + barNum, dataOutputC.length)

  for (var i = cursor; i < cursor2; i++) {
    ha.push({
      o: dataOutputO[i],
      h: dataOutputH[i],
      l: dataOutputL[i],
      c: dataOutputC[i]
    })
  }

  var colorLong = context.heikinAshi.colorLong
  var colorShort = context.heikinAshi.colorShort
	var canvas = context.heikinAshi.canvas

  var haHL = canvas.selectAll(".haHL").data(ha)

  haHL.attr("x1", function (d, i) {
      return xScale(i)
    })
    .attr("x2", function (d, i) {
      return xScale(i)
    })
    .attr("y1", function (d) {
      return yScale(d.h)
    })
    .attr("y2", function (d) {
      return yScale(d.l)
    })
    .attr("stroke", function (d) {
      return d.o > d.c ? colorShort : colorLong
    })

  haHL.enter().append("line")
    .attr("class", "haHL")
    .attr("x1", function (d, i) {
      return xScale(i)
    })
    .attr("x2", function (d, i) {
      return xScale(i)
    })
    .attr("y1", function (d) {
      return yScale(d.h)
    })
    .attr("y2", function (d) {
      return yScale(d.l)
    })
    .attr("stroke", function (d) {
      return d.o > d.c ? colorShort : colorLong
    })

  haHL.exit().remove()

  var barWidth = Math.floor(0.8 * width / barNum)
  var halfWidth = barWidth / 2

  var haOC = canvas.selectAll(".haOC").data(ha)

  haOC.attr("x", function (d, i) {
      return xScale(i) - halfWidth
    })
    .attr("y", function (d) {
      return yScale(Math.max(d.o, d.c))
    })
    .attr("width", barWidth)
    .attr("height", function (d) {
      return d.o == d.c ? 1 :
        (yScale(Math.min(d.o, d.c)) - yScale(Math.max(d.o, d.c)))
    })
    .attr("fill", function (d) {
      if (d.o == d.c)
        return "black"
      else
        return d.o > d.c ? colorShort : colorLong
    })
    .attr("stroke", function (d) {
      if (d.o == d.c)
        return "black"
      else
        return d.o > d.c ? colorShort : colorLong
    })

  haOC.enter().append("rect")
    .attr("class", "haOC")
    .attr("x", function (d, i) {
      return xScale(i) - halfWidth
    })
    .attr("y", function (d) {
      return yScale(Math.max(d.o, d.c))
    })
    .attr("width", barWidth)
    .attr("height", function (d) {
      return d.o == d.c ? 1 :
        (yScale(Math.min(d.o, d.c)) - yScale(Math.max(d.o, d.c)))
    })
    .attr("fill", function (d) {
      if (d.o == d.c)
        return "black"
      else
        return d.o > d.c ? colorShort : colorLong
    })
    .attr("stroke", function (d) {
      if (d.o == d.c)
        return "black"
      else
        return d.o > d.c ? colorShort : colorLong
    })
    .attr("strokeWidth", 2)

  haOC.exit().remove()

  if (getCalculatedLength(context) == 0) {
    d3.selectAll(".haHL").select(function() { return this.parentNode; }).select(function() { return this.parentNode; }).each(function (d, i) {
      if (i == 0) {
        context.originalOC = d3.select(this).selectAll(".cc_k_c_oc")
        context.originalHL = d3.select(this).selectAll(".cc_k_c_hl")
      }
    })
  } else {
    context.originalOC.attr("opacity", 0)
    context.originalHL.attr("opacity", 0)
  }
})
