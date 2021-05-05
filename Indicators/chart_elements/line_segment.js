registerIndicator("line_segment", "A line segment implemented by using custom indicator(v1.0)", function (context) {
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
}],
[{
  name: "line",
  visible: false
}],
WHERE_TO_RENDER.CHART_WINDOW,
function (context) { // Init()
  var color = getIndiParameter(context, "color")
  var strokeWidth = getIndiParameter(context, "strokeWidth")

  window.dragObj = d3.drag()
  .on("start", function (d) {
    d3.select(this).raise().classed("active", true)
  })
  .on("drag", function (d) {
    if (d3.select(this).attr("class").includes("lineSegmentStarts")) {
      window.lineSegment.dragStart(this, d3.event.x, d3.event.y, d)
    } else if (d3.select(this).attr("class").includes("lineSegmentEnds")) {
      window.lineSegment.dragEnd(this, d3.event.x, d3.event.y, d)
    }
  })
  .on("end", function (d) {
    d3.select(this).classed("active", false)
  })

  window.lineSegment = {
    data: [],
    canvas: getSvgCanvas(getIndiHandleByContext(context)),
    dragStart: function (svgObj, x, y, d) {
      var startIdx = Math.round(d.xScale.invert(x))
      if (startIdx < 0) {
        startIdx = 0
      } else if (startIdx >= d.barNum) {
        startIdx = d.barNum - 1
      }

      var val = y
      if (val < 0) {
        val = 0
      } else if (val > d.height) {
        val = d.height
      }
      d.startVal = d.yScale.invert(val)

      d.startIdx = startIdx + d.cursor

      d3.select(svgObj).attr("cx", d.xScale(startIdx)).attr("cy", val)
      d3.select("#lineSegments_" + d.id)
        .attr("x1", d.xScale(startIdx)).attr("y1", val)
    },
    dragEnd: function (svgObj, x, y, d) {
      var endIdx = Math.round(d.xScale.invert(x))
      if (endIdx < 0) {
        endIdx = 0
      } else if (endIdx >= d.barNum) {
        endIdx = d.barNum - 1
      }

      var val = y
      if (val < 0) {
        val = 0
      } else if (val > d.height) {
        val = d.height
      }
      d.endVal = d.yScale.invert(val)

      d.endIdx = endIdx + d.cursor

      d3.select(svgObj).attr("cx", d.xScale(endIdx)).attr("cy", val)
      d3.select("#lineSegments_" + d.id)
        .attr("x2", d.xScale(endIdx)).attr("y2", val)
    },
    render: function () {
      var lineSegmentStarts = this.canvas.selectAll(".lineSegmentStarts").data(this.data)

      lineSegmentStarts
        .attr("cx", function (d) {return d.xScale(d.startIdx - d.cursor)})
        .attr("cy", function (d) {return d.yScale(d.startVal)})
        .attr("r", function (d) {return d.radius})

      lineSegmentStarts.enter().append("circle")
        .attr("id", function (d) {return "lineSegmentStarts_" + d.id})
        .attr("class", "lineSegmentStarts")
        .attr("cx", function (d) {return d.xScale(d.startIdx - d.cursor)})
        .attr("cy", function (d) {return d.yScale(d.startVal)})
        .attr("r", function (d) {return d.radius})
        .attr("fill", function (d) {return d.color})
        .attr("opacity", 1.0)
        .attr("stroke", function (d) {return d.color})
        .call(window.dragObj)

      lineSegmentStarts.exit().remove()

      var lineSegmentEnds = this.canvas.selectAll(".lineSegmentEnds").data(this.data)

      lineSegmentEnds
        .attr("cx", function (d) {return d.xScale(d.endIdx - d.cursor)})
        .attr("cy", function (d) {return d.yScale(d.endVal)})
        .attr("r", function (d) {return d.radius})

      lineSegmentEnds.enter().append("circle")
        .attr("id", function (d) {return "lineSegmentEnds_" + d.id})
        .attr("class", "lineSegmentEnds")
        .attr("cx", function (d) {return d.xScale(d.endIdx - d.cursor)})
        .attr("cy", function (d) {return d.yScale(d.endVal)})
        .attr("r", function (d) {return d.radius})
        .attr("fill", function (d) {return d.color})
        .attr("opacity", 1.0)
        .attr("stroke", function (d) {return d.color})
        .call(window.dragObj)

      lineSegmentEnds.exit().remove()

      var lineSegments = this.canvas.selectAll(".lineSegments").data(this.data)

      lineSegments
        .attr("x1", function (d) {return d.xScale(d.startIdx - d.cursor)})
        .attr("y1", function (d) {return d.yScale(d.startVal)})
        .attr("x2", function (d) {return d.xScale(d.endIdx - d.cursor)})
        .attr("y2", function (d) {return d.yScale(d.endVal)})

      lineSegments.enter().append("line")
        .attr("id", function (d) {return "lineSegments_" + d.id})
        .attr("class", "lineSegments")
        .attr("x1", function (d) {return d.xScale(d.startIdx - d.cursor)})
        .attr("y1", function (d) {return d.yScale(d.startVal)})
        .attr("x2", function (d) {return d.xScale(d.endIdx - d.cursor)})
        .attr("y2", function (d) {return d.yScale(d.endVal)})
        .attr("stroke", function (d) {return d.color})
        .attr("strokeWidth", function (d) {return d.strokeWidth})

      lineSegments.exit().remove()
    }
  }

  window.lineSegment.data.push({
    id: 1,
    color: color,
    strokeWidth: strokeWidth,
    radius: 5
  })
},
function (context) { // Deinit()
  window.lineSegment.data = []
  window.lineSegment.render()
},
function (context) { // Render()
  var barNum = getBarNum(context)
  var cursor = getCursor(context)
  var width = getCanvasWidth(context)
  var height = getCanvasHeight(context)
  var xScale = getXScale(context)
  var yScale = getYScale(context)

  if (getCalculatedLength(context) == 0) {
    for (var i in window.lineSegment.data) {
      var data = window.lineSegment.data[i]

      data.startIdx = xScale.invert(width / 3) + cursor
      data.endIdx = xScale.invert(width * 2 / 3) + cursor
      data.startVal = yScale.invert(height * 2 / 3)
      data.endVal = yScale.invert(height / 3)
    }
  }

  for (var i in window.lineSegment.data) {
    var data = window.lineSegment.data[i]

    data.barNum = barNum
    data.cursor = cursor
    data.width = width
    data.height = height
    data.xScale = xScale
    data.yScale = yScale
  }

  window.lineSegment.render()
})
