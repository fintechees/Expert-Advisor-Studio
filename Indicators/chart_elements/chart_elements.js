registerIndicator("chart_elements", "A manager for the chart elements implemented by using custom indicator(v1.02)", function (context) {
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
  var chartHandle = getChartHandleByContext(context)

  if (typeof window.dragObj == "undefined" || window.dragObj == null) {
    window.dragObj = d3.drag()
    .on("start", function (d) {
      d3.select(this).raise().classed("active", true)
    })
    .on("drag", function (d) {
      if (d.type == "lineSegment") {
        if (d3.select(this).attr("class").includes("lineSegmentStarts")) {
          window.chartElements.lineSegment.dragStart(d3.event.x, d3.event.y, d)
        } else if (d3.select(this).attr("class").includes("lineSegmentEnds")) {
          window.chartElements.lineSegment.dragEnd(d3.event.x, d3.event.y, d)
        }
      }
    })
    .on("end", function (d) {
      d3.select(this).classed("active", false)
      window.chartElements.save()
    })
  }

  if (typeof window.chartElements == "undefined" || window.chartElements == null) {
    var elements = []

    if (typeof localStorage.reservedZone != "undefined") {
      var reservedZone = JSON.parse(localStorage.reservedZone)
      if (typeof reservedZone.elements != "undefined") {
        elements = reservedZone.elements
      }
    }

    window.chartElements = {
      newId: (elements.length > 0 ? elements[elements.length - 1].id + 1 : 0),
      timeArr: [],
      data: elements,
      canvas: [],
      barNum: [],
      cursor: [],
      width: [],
      height: [],
      xScale: [],
      yScale: [],
      save: function () {
        if (typeof localStorage.reservedZone == "undefined") {
          localStorage.reservedZone = JSON.stringify({
            elements: this.data
          })
        } else {
          var reservedZone = JSON.parse(localStorage.reservedZone)
          reservedZone.elements = this.data
          localStorage.reservedZone = JSON.stringify(reservedZone)
        }
      },
      remove: function (id) {
        var element = null
        var type = null

        for (var i = this.data.length - 1; i >= 0; i--) {
          element = this.data[i]

          if (element.id == id) {
            type = element.type
            this.data.splice(i, 1)
            break
          }
        }

        this.save()
        if (type == "lineSegment") {
          this.lineSegment.render(element.chartHandle)
        }
      },
      lineSegment: {
        add: function (type, chartHandle, color, strokeWidth) {
          var timeArr = window.chartElements.timeArr[chartHandle]
          var cursor = window.chartElements.cursor[chartHandle]
          var width = window.chartElements.width[chartHandle]
          var height = window.chartElements.height[chartHandle]
          var xScale = window.chartElements.xScale[chartHandle]
          var yScale = window.chartElements.yScale[chartHandle]

          var lineSegment = {
            type: type,
            chartHandle: chartHandle,
            id: window.chartElements.newId,
            color: color,
            strokeWidth: strokeWidth,
            radius: 5,
            startTime: null,
            endTime: null,
            startIdx: null,
            endIdx: null,
            startVal: null,
            endVal: null
          }

          lineSegment.startIdx = Math.floor(xScale.invert(width / 3) + cursor),
          lineSegment.endIdx = Math.floor(xScale.invert(width * 2 / 3) + cursor),
          lineSegment.startVal = yScale.invert(height * 2 / 3),
          lineSegment.endVal = yScale.invert(height / 3),
          lineSegment.startTime = timeArr[lineSegment.startIdx]
          lineSegment.endTime = timeArr[lineSegment.endIdx]

          window.chartElements.data.push(lineSegment)

          window.chartElements.newId++

          window.chartElements.save()
          this.render(chartHandle)
        },
        dragStart: function (x, y, d) {
          var chartHandle = d.chartHandle
          var timeArr = window.chartElements.timeArr[chartHandle]
          var barNum = window.chartElements.barNum[chartHandle]
          var cursor = window.chartElements.cursor[chartHandle]
          var width = window.chartElements.width[chartHandle]
          var height = window.chartElements.height[chartHandle]
          var xScale = window.chartElements.xScale[chartHandle]
          var yScale = window.chartElements.yScale[chartHandle]

          var startIdx = Math.round(xScale.invert(x))
          if (startIdx < 0) {
            startIdx = 0
          } else if (startIdx >= barNum) {
            startIdx = barNum - 1
          }

          var val = y
          if (val < 0) {
            val = 0
          } else if (val > height) {
            val = height
          }
          d.startVal = yScale.invert(val)

          d.startIdx = startIdx + cursor

          d3.select("#lineSegmentStarts_" + d.id)
            .attr("cx", xScale(startIdx)).attr("cy", val)
          d3.select("#lineSegments_" + d.id)
            .attr("x1", xScale(startIdx)).attr("y1", val)
          d3.select("#lineSegmentCloses_" + d.id)
            .attr("cx", function (d) {return xScale((d.startIdx + d.endIdx) / 2.0 - cursor)})
            .attr("cy", function (d) {return yScale((d.startVal + d.endVal) / 2.0)})

          d.startTime = timeArr[d.startIdx]
        },
        dragEnd: function (x, y, d) {
          var chartHandle = d.chartHandle
          var timeArr = window.chartElements.timeArr[chartHandle]
          var barNum = window.chartElements.barNum[chartHandle]
          var cursor = window.chartElements.cursor[chartHandle]
          var width = window.chartElements.width[chartHandle]
          var height = window.chartElements.height[chartHandle]
          var xScale = window.chartElements.xScale[chartHandle]
          var yScale = window.chartElements.yScale[chartHandle]

          var endIdx = Math.round(xScale.invert(x))
          if (endIdx < 0) {
            endIdx = 0
          } else if (endIdx >= barNum) {
            endIdx = barNum - 1
          }

          var val = y
          if (val < 0) {
            val = 0
          } else if (val > height) {
            val = height
          }
          d.endVal = yScale.invert(val)

          d.endIdx = endIdx + cursor

          d3.select("#lineSegmentEnds_" + d.id)
            .attr("cx", xScale(endIdx)).attr("cy", val)
          d3.select("#lineSegments_" + d.id)
            .attr("x2", xScale(endIdx)).attr("y2", val)
          d3.select("#lineSegmentCloses_" + d.id)
            .attr("cx", function (d) {return xScale((d.startIdx + d.endIdx) / 2.0 - cursor)})
            .attr("cy", function (d) {return yScale((d.startVal + d.endVal) / 2.0)})

          d.endTime = timeArr[d.endIdx]
        },
        render: function (chartHandle) {
          var canvas = window.chartElements.canvas[chartHandle]
          var timeArr = window.chartElements.timeArr[chartHandle]
          var barNum = window.chartElements.barNum[chartHandle]
          var cursor = window.chartElements.cursor[chartHandle]
          var width = window.chartElements.width[chartHandle]
          var height = window.chartElements.height[chartHandle]
          var xScale = window.chartElements.xScale[chartHandle]
          var yScale = window.chartElements.yScale[chartHandle]

          var renderingData = []

          for (var i in window.chartElements.data) {
            var element = window.chartElements.data[i]

            if (element.chartHandle == chartHandle && element.type == "lineSegment") {
              renderingData.push(element)
            }
          }

          var lineSegmentStarts = canvas.selectAll(".lineSegmentStarts").data(renderingData)

          lineSegmentStarts
            .attr("id", function (d) {return "lineSegmentStarts_" + d.id})
            .attr("cx", function (d) {return xScale(d.startIdx - cursor)})
            .attr("cy", function (d) {return yScale(d.startVal)})
            .attr("r", function (d) {return d.radius})

          lineSegmentStarts.enter().append("circle")
            .attr("id", function (d) {return "lineSegmentStarts_" + d.id})
            .attr("class", "lineSegmentStarts")
            .attr("cx", function (d) {return xScale(d.startIdx - cursor)})
            .attr("cy", function (d) {return yScale(d.startVal)})
            .attr("r", function (d) {return d.radius})
            .attr("fill", function (d) {return d.color})
            .attr("opacity", 1.0)
            .attr("stroke", function (d) {return d.color})
            .call(window.dragObj)

          lineSegmentStarts.exit().remove()

          var lineSegmentEnds = canvas.selectAll(".lineSegmentEnds").data(renderingData)

          lineSegmentEnds
            .attr("id", function (d) {return "lineSegmentEnds_" + d.id})
            .attr("cx", function (d) {return xScale(d.endIdx - cursor)})
            .attr("cy", function (d) {return yScale(d.endVal)})
            .attr("r", function (d) {return d.radius})

          lineSegmentEnds.enter().append("circle")
            .attr("id", function (d) {return "lineSegmentEnds_" + d.id})
            .attr("class", "lineSegmentEnds")
            .attr("cx", function (d) {return xScale(d.endIdx - cursor)})
            .attr("cy", function (d) {return yScale(d.endVal)})
            .attr("r", function (d) {return d.radius})
            .attr("fill", function (d) {return d.color})
            .attr("opacity", 1.0)
            .attr("stroke", function (d) {return d.color})
            .call(window.dragObj)

          lineSegmentEnds.exit().remove()

          var lineSegments = canvas.selectAll(".lineSegments").data(renderingData)

          lineSegments
            .attr("id", function (d) {return "lineSegments_" + d.id})
            .attr("x1", function (d) {return xScale(d.startIdx - cursor)})
            .attr("y1", function (d) {return yScale(d.startVal)})
            .attr("x2", function (d) {return xScale(d.endIdx - cursor)})
            .attr("y2", function (d) {return yScale(d.endVal)})

          lineSegments.enter().append("line")
            .attr("id", function (d) {return "lineSegments_" + d.id})
            .attr("class", "lineSegments")
            .attr("x1", function (d) {return xScale(d.startIdx - cursor)})
            .attr("y1", function (d) {return yScale(d.startVal)})
            .attr("x2", function (d) {return xScale(d.endIdx - cursor)})
            .attr("y2", function (d) {return yScale(d.endVal)})
            .attr("stroke", function (d) {return d.color})
            .attr("strokeWidth", function (d) {return d.strokeWidth})

          lineSegments.exit().remove()

          var lineSegmentCloses = canvas.selectAll(".lineSegmentCloses").data(renderingData)

          lineSegmentCloses
            .attr("id", function (d) {return "lineSegmentCloses_" + d.id})
            .attr("cx", function (d) {return xScale((d.startIdx + d.endIdx) / 2.0 - cursor)})
            .attr("cy", function (d) {return yScale((d.startVal + d.endVal) / 2.0)})
            .attr("r", function (d) {return d.radius})
            .on("click", function (d) {
              window.chartElements.remove(d.id)
            })

          lineSegmentCloses.enter().append("circle")
            .attr("id", function (d) {return "lineSegmentCloses_" + d.id})
            .attr("class", "lineSegmentCloses")
            .attr("cx", function (d) {return xScale((d.startIdx + d.endIdx) / 2.0 - cursor)})
            .attr("cy", function (d) {return yScale((d.startVal + d.endVal) / 2.0)})
            .attr("r", function (d) {return d.radius})
            .attr("fill", "orange")
            .attr("opacity", 1.0)
            .attr("stroke", function (d) {return d.color})
            .on("click", function (d) {
              window.chartElements.remove(d.id)
            })

          lineSegmentCloses.exit().remove()
        }
      }
    }
  } else {
    var elements = []

    if (typeof localStorage.reservedZone != "undefined") {
      var reservedZone = JSON.parse(localStorage.reservedZone)
      if (typeof reservedZone.elements != "undefined") {
        elements = reservedZone.elements
      }
    }

    window.chartElements.data = elements
  }

  window.chartElements.canvas[chartHandle] = getSvgCanvas(chartHandle)
},
function (context) { // Deinit()
  var chartHandle = getChartHandleByContext(context)
  var elements = window.chartElements.data

  for (var i = elements.length - 1; i >= 0; i--) {
    if (elements[i].chartHandle == chartHandle) {
      elements.splice(i, 1)
    }
  }

  window.chartElements.lineSegment.render(chartHandle)

  window.chartElements.canvas[chartHandle].selectAll(".btnLineSegmentG").data([]).exit().remove()

  delete window.chartElements.timeArr[chartHandle]
  delete window.chartElements.canvas[chartHandle]
  delete window.chartElements.barNum[chartHandle]
  delete window.chartElements.cursor[chartHandle]
  delete window.chartElements.width[chartHandle]
  delete window.chartElements.height[chartHandle]
  delete window.chartElements.xScale[chartHandle]
  delete window.chartElements.yScale[chartHandle]
},
function (context) { // Render()
  var chartHandle = getChartHandleByContext(context)
  var color = getIndiParameter(context, "color")
  var strokeWidth = getIndiParameter(context, "strokeWidth")
  var barNum = getBarNum(context)
  var cursor = getCursor(context)
  var width = getCanvasWidth(context)
  var height = getCanvasHeight(context)
  var xScale = getXScale(context)
  var yScale = getYScale(context)
  var buttons = [{
    chartHandle: chartHandle,
    color: color,
    strokeWidth: strokeWidth,
    label: "L"
  }]
  var btnLineSegmentG = null
  var btnLineSegment = null
  var btnLineSegmentTxt = null

  if (getCalculatedLength(context) == 0) {
    var timeArr = getDataInput(context, 0)
    window.chartElements.timeArr[chartHandle] = timeArr

    btnLineSegmentG = window.chartElements.canvas[chartHandle].append("g")
      .attr("class", "btnLineSegmentG")

    btnLineSegment = btnLineSegmentG.selectAll(".btnLineSegment").data(buttons)
    btnLineSegmentTxt = btnLineSegmentG.selectAll(".btnLineSegmentTxt").data(buttons)

    btnLineSegment
      .enter().append("circle")
      .attr("class", "btnLineSegment")
      .attr("cx", 15)
      .attr("cy", height - 15)
      .attr("r", 10)
      .attr("stroke", "steelblue")
      .attr("fill", "steelblue")
      .style("cursor", "pointer")
      .on("click", function (d) {
        window.chartElements.lineSegment.add("lineSegment", d.chartHandle, d.color, d.strokeWidth)
      })

    btnLineSegmentTxt
      .enter().append("text")
      .attr("class", "btnLineSegmentTxt")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("x", 15)
      .attr("y", height - 15)
      .attr("dx", -5)
      .attr("dy", 5)
      .attr("fill", "white")
      .attr("textAnchor", "start")
      .style("fontSize", "8px")
      .style("cursor", "pointer")
      .text("L")
      .on("click", function (d) {
        window.chartElements.lineSegment.add("lineSegment", d.chartHandle, d.color, d.strokeWidth)
      })

    for (var i in window.chartElements.data) {
      if (window.chartElements.data[i].type == "lineSegment") {
        var lineSegment = window.chartElements.data[i]

        if (lineSegment.chartHandle == chartHandle) {
          var j = timeArr.length - 2
          while (j >= 0) {
            if (timeArr[j] <= lineSegment.startTime &&
              timeArr[j+1] > lineSegment.startTime) {

              break
            }

            j--
          }
          lineSegment.startIdx = j

          j = timeArr.length - 2
          while (j >= 0) {
            if (timeArr[j] <= lineSegment.endTime &&
              timeArr[j+1] > lineSegment.endTime) {

              break
            }

            j--
          }
          lineSegment.endIdx = j
        }
      }
    }
  } else {
    btnLineSegment = window.chartElements.canvas[chartHandle].selectAll(".btnLineSegment").data(buttons)
    btnLineSegmentTxt = window.chartElements.canvas[chartHandle].selectAll(".btnLineSegmentTxt").data(buttons)

    btnLineSegment
      .attr("cy", height - 15)

    btnLineSegmentTxt
      .attr("y", height - 15)
  }

  window.chartElements.barNum[chartHandle] = barNum
  window.chartElements.cursor[chartHandle] = cursor
  window.chartElements.width[chartHandle] = width
  window.chartElements.height[chartHandle] = height
  window.chartElements.xScale[chartHandle] = xScale
  window.chartElements.yScale[chartHandle] = yScale

  window.chartElements.lineSegment.render(chartHandle)
})
