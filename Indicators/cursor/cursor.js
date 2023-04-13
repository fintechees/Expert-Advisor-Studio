registerIndicator("cursor", "Cursor on hover(v1.0)", function (context) {
  // Please note, this indicator will make scrolling chart disabled. So, if you want to scroll the chart, please remove this indicator from the chart.
},[{
  name: "color",
  value: "#AAA",
  required: true,
  type: PARAMETER_TYPE.STRING,
  range: null
}, {
  name: "strokeWidth",
  value: 2,
  required: true,
  type: PARAMETER_TYPE.INTEGER,
  range: [1, 10]
}],
[{
	name: DATA_NAME.TIME,
	index: 0
}, {
	name: DATA_NAME.CLOSE,
	index: 1
}],
[{
  name: "line",
  visible: false
}],
WHERE_TO_RENDER.CHART_WINDOW,
function (context) { // Init()
  var color = getIndiParameter(context, "color")
  var strokeWidth = getIndiParameter(context, "strokeWidth")

  context.cursor = {
    timeArr: null,
    priceArr: null,
    canvas: null,
    barNum: null,
    cursor: null,
    width: null,
    height: null,
    xScale: null,
    yScale: null,
    color: color,
    xAxis: {
			strokeWidth: strokeWidth,
			val: null
    },
		yAxis: {
			strokeWidth: strokeWidth,
			idx: null,
			time: null
    },
    cursorFrame: null,
    cursorXAxis: null,
    cursorYAxis: null,
    xAxisText: null,
    yAxisText: null,
    xAxisText2: null,
    yAxisText2: null,
		mousemove: function (x, y) {
			if (context.cursor.timeArr == null) return

			var canvas = context.cursor.canvas
			var timeArr = context.cursor.timeArr
			var barNum = context.cursor.barNum
			var cursor = context.cursor.cursor
			var width = context.cursor.width
			var height = context.cursor.height
			var xScale = context.cursor.xScale
			var yScale = context.cursor.yScale

			var idx = Math.round(xScale.invert(x))
			if (idx < 0) {
				idx = 0
			} else if (idx >= barNum) {
				idx = barNum - 1
			}

			var val = y
			if (val < 0) {
				val = 0
			} else if (val > height) {
				val = height
			}

			context.cursor.xAxis.val = yScale.invert(val)
			context.cursor.yAxis.idx = idx
			context.cursor.yAxis.time = (idx + cursor) >= timeArr.length ? timeArr[timeArr.length - 1] : ((idx + cursor) < 0 ? timeArr[0] : timeArr[idx + cursor])

			this.render()
		},
		render: function () {
			var canvas = context.cursor.canvas
			var timeArr = context.cursor.timeArr
      var priceArr = context.cursor.priceArr
			var barNum = context.cursor.barNum
			var cursor = context.cursor.cursor
			var width = context.cursor.width
			var height = context.cursor.height
			var xScale = context.cursor.xScale
			var yScale = context.cursor.yScale

			context.cursor.cursorFrame
				.attr("width", width)
				.attr("height", height)

      var y = yScale(context.cursor.xAxis.val)
			context.cursor.cursorXAxis
				.attr("x1", xScale(0))
				.attr("y1", y)
				.attr("x2", xScale(barNum - 1))
				.attr("y2", y)

      var x = xScale(context.cursor.yAxis.idx)
			context.cursor.cursorYAxis
				.attr("x1", x)
				.attr("y1", 0)
				.attr("x2", x)
				.attr("y2", height)

      context.cursor.xAxisText
        .attr("y", y)
        .text(context.cursor.xAxis.val)

			context.cursor.yAxisText
        .attr("x", x)
        .text(new Date(context.cursor.yAxis.time * 1000).toLocaleString())

      context.cursor.xAxisText2
        .attr("y", y)
        .text(context.cursor.xAxis.val - priceArr[priceArr.length - 1])

			context.cursor.yAxisText2
        .attr("x", x)
        .text(timeArr.length - 1 - (cursor + context.cursor.yAxis.idx))
		}
  }

	var chartHandle = getChartHandleByContext(context)
  context.cursor.canvas = getSvgCanvas(chartHandle)
},
function (context) { // Deinit()
  var chartHandle = getChartHandleByContext(context)

	context.cursor.canvas.selectAll(".cursorFrame").data([]).exit().remove()
  context.cursor.canvas.selectAll(".cursorXAxis").data([]).exit().remove()
	context.cursor.canvas.selectAll(".cursorYAxis").data([]).exit().remove()
  context.cursor.canvas.selectAll(".cursorXAxisText").data([]).exit().remove()
	context.cursor.canvas.selectAll(".cursorYAxisText").data([]).exit().remove()
  context.cursor.canvas.selectAll(".cursorXAxisText2").data([]).exit().remove()
	context.cursor.canvas.selectAll(".cursorYAxisText2").data([]).exit().remove()
},
function (context) { // Render()
  var barNum = getBarNum(context)
  var cursor = getCursor(context)
  var width = getCanvasWidth(context)
  var height = getCanvasHeight(context)
  var xScale = getXScale(context)
  var yScale = getYScale(context)

	if (getCalculatedLength(context) == 0) {
    var timeArr = getDataInput(context, 0)
		context.cursor.timeArr = timeArr
    context.cursor.priceArr = getDataInput(context, 1)
		context.cursor.xAxis.val = yScale.invert(height / 2)
		context.cursor.yAxis.idx = Math.floor(xScale.invert(width / 2))
		context.cursor.yAxis.time = (context.cursor.yAxis.idx + cursor) >= timeArr.length ? timeArr[timeArr.length - 1] : ((context.cursor.yAxis.idx + cursor) < 0 ? timeArr[0] : timeArr[context.cursor.yAxis.idx + cursor])

		var canvas = context.cursor.canvas

		context.cursor.cursorFrame = canvas.selectAll(".cursorFrame").data([{}]).enter().append("rect")
			.attr("class", "cursorFrame")
			.attr("width", width)
			.attr("height", height)
			.attr("opacity", 0)
			.on("mousemove", function () {
        var mouseX = d3.mouse(context.cursor.cursorFrame.node())[0] - context.cursor.cursorFrame.attr("x")
        var mouseY = d3.mouse(context.cursor.cursorFrame.node())[1] - context.cursor.cursorFrame.attr("y")
				context.cursor.mousemove(mouseX, mouseY)
			})

		context.cursor.cursorXAxis = canvas.selectAll(".cursorXAxis").data([context.cursor.xAxis]).enter().append("line")
			.attr("class", "cursorXAxis")
			.attr("x1", function (d) {return xScale(0)})
			.attr("y1", function (d) {return yScale(d.val)})
			.attr("x2", function (d) {return xScale(barNum - 1)})
			.attr("y2", function (d) {return yScale(d.val)})
      .attr("stroke", context.cursor.color)
			.attr("strokeWidth", function (d) {return d.strokeWidth})

		context.cursor.cursorYAxis = canvas.selectAll(".cursorYAxis").data([context.cursor.yAxis]).enter().append("line")
			.attr("class", "cursorYAxis")
			.attr("x1", function (d) {return xScale(d.idx)})
			.attr("y1", 0)
			.attr("x2", function (d) {return xScale(d.idx)})
			.attr("y2", height)
			.attr("stroke", context.cursor.color)
			.attr("strokeWidth", function (d) {return d.strokeWidth})

    context.cursor.xAxisText = canvas.selectAll(".cursorXAxisText").data([context.cursor.xAxis]).enter().append("text")
      .attr("class", "cursorXAxisText")
      .attr("width", "50px")
      .attr("height", "10px")
      .attr("x", width - 30)
      .attr("y", function (d) {return yScale(d.val)})
      .attr("dx", -15)
      .attr("dy", -5)
      .attr("fill", context.cursor.color)
      .attr("textAnchor", "start")
      .style("font-size", "12px")
      .text(function (d) {return d.val})

    context.cursor.yAxisText = canvas.selectAll(".cursorYAxisText").data([context.cursor.yAxis]).enter().append("text")
      .attr("class", "cursorYAxisText")
      .attr("width", "50px")
      .attr("height", "10px")
      .attr("x", function (d) {return xScale(d.idx)})
      .attr("y", 10)
      .attr("dx", 5)
      .attr("dy", 3)
      .attr("fill", context.cursor.color)
      .attr("textAnchor", "start")
      .style("font-size", "12px")
      .text(function (d) {return new Date(d.time * 1000).toLocaleString()})

    context.cursor.xAxisText2 = canvas.selectAll(".cursorXAxisText2").data([context.cursor.xAxis]).enter().append("text")
      .attr("class", "cursorXAxisText2")
      .attr("width", "50px")
      .attr("height", "10px")
      .attr("x", width - 30)
      .attr("y", function (d) {return yScale(d.val)})
      .attr("dx", -15)
      .attr("dy", 10)
      .attr("fill", context.cursor.color)
      .attr("textAnchor", "start")
      .style("font-size", "12px")
      .text(function (d) {return d.val - context.cursor.priceArr[context.cursor.priceArr.length - 1]})

    context.cursor.yAxisText2 = canvas.selectAll(".cursorYAxisText2").data([context.cursor.yAxis]).enter().append("text")
      .attr("class", "cursorYAxisText2")
      .attr("width", "50px")
      .attr("height", "10px")
      .attr("x", function (d) {return xScale(d.idx)})
      .attr("y", 10)
      .attr("dx", 5)
      .attr("dy", 15)
      .attr("fill", context.cursor.color)
      .attr("textAnchor", "start")
      .style("font-size", "12px")
      .text(function (d) {return timeArr.length - 1 - (cursor + d.idx)})
  }

	context.cursor.barNum = barNum
  context.cursor.cursor = cursor
  context.cursor.width = width
  context.cursor.height = height
  context.cursor.xScale = xScale
  context.cursor.yScale = yScale

  context.cursor.render()
})
