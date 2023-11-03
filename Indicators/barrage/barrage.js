registerIndicator("barrage", "A plugin to display barrages on the chart(v1.0)", function(context) {},
  [{
    name: "color",
    value: "#FAE2BE",
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
    name: "barrage",
    visible: false
  }],
  WHERE_TO_RENDER.CHART_WINDOW,
  function(context) { // Init()
    var chartHandle = getChartHandleByContext(context)

    if (typeof window.fintecheeBarrage == "undefined") {
      var barrageStyles = `
        .barrage-class {
          position: absolute;
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          padding: 5px;
          border-radius: 5px;
          font-size: 12px;
        }
      `
      var styleElement = $("<style>").text(barrageStyles);
      $("head").append(styleElement)
      var tooltip = d3.select("body")
        .append("div")
        .attr("class", "barrage-class")
        .style("opacity", 0)

      var tooltipTable = `
      <table id="tooltipTable">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Imp</th>
            <th>Time</th>
            <th>Content</th>
            <th>Actual</th>
            <th>Forecast</th>
            <th>Previous</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      `

      tooltip.html(tooltipTable)

      window.fintecheeBarrage = {
        tooltip: tooltip,
        canvas: [],
        timeArr: [],
        barNum: [],
        cursor: [],
        width: [],
        height: [],
        xScale: [],
        yScale: [],
        timeFrameVal: [],
        context: [],
        data: [],
        callback: function(ctx) {
          var chartHandle = getChartHandleByContext(ctx)
          var color = getIndiParameter(ctx, "color")
          var strokeWidth = getIndiParameter(ctx, "strokeWidth")
          var timeFrameVal = window.fintecheeBarrage.timeFrameVal[chartHandle]
          window.fintecheeBarrage.data[chartHandle] = []
          var data = window.fintecheeBarrage.data[chartHandle]

          for (var i in window.pluginForSns.data) {
            var snsData = window.pluginForSns.data[i]
            for (var j in snsData) {
              var snsItem = snsData[j]
              if (typeof snsItem.data != "string") {
                continue
              }
              var time = Math.floor(new Date(snsItem.data + "Z").getTime() / 1000)
              var content = [snsItem]
              var timeIdx = Math.floor(time / timeFrameVal)

              if (typeof data[timeIdx + ""] != "undefined") {
                content = data[timeIdx + ""].content.concat(content)
              }

              data[timeIdx + ""] = {
                time: time,
                id: 0,
                color: color,
                strokeWidth: strokeWidth,
                radius: 5,
                idx: null,
                content: content
              }
            }
          }

          var timeArr = window.fintecheeBarrage.timeArr[chartHandle]

          for (var i in data) {
            var barrageItem = data[i]

            barrageItem.idx = 0
            var j = 0
            while (j < (timeArr.length - 1)) {
              if (timeArr[j] <= barrageItem.time &&
                timeArr[j + 1] > barrageItem.time) {

                barrageItem.idx = j
                break
              }

              j++
            }
            if (j == (timeArr.length - 1) && timeArr[j] <= barrageItem.time) {
              barrageItem.idx = j + Math.round((barrageItem.time - timeArr[j]) / timeFrameVal)
            }
          }
        },
        formatDate: function (dt) {
          const month = String(dt.getMonth() + 1).padStart(2, '0');
          const day = String(dt.getDate()).padStart(2, '0');
          const hours = String(dt.getHours()).padStart(2, '0');
          const minutes = String(dt.getMinutes()).padStart(2, '0');

          const utcString = `${month}-${day} ${hours}:${minutes}`;
          return utcString;
        },
        formatContent: function(content) {
          var tableBody = $("#tooltipTable tbody")
          tableBody.empty()

          if (content.length == 0) return

          var that = this;

          $.each(content, function (index, item) {
            var row = $("<tr>")
            row.append($("<td>").text(item.economy))
            row.append($("<td>").text(item.impact))
            row.append($("<td>").text(that.formatDate(new Date(item.data + "Z"))))
            row.append($("<td>").text(item.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")))
            row.append($("<td>").text(item.actual))
            row.append($("<td>").text(item.forecast))
            row.append($("<td>").text(item.previous))
            tableBody.append(row)
          })
        },
        render: function(chartHandle) {
          if (this.data.length == 0) return

          var canvas = this.canvas[chartHandle]
          var timeArr = this.timeArr[chartHandle]
          var barNum = this.barNum[chartHandle]
          var cursor = this.cursor[chartHandle]
          var width = this.width[chartHandle]
          var height = this.height[chartHandle]
          var xScale = this.xScale[chartHandle]
          var yScale = this.yScale[chartHandle]
          var data = this.data[chartHandle]

          var renderingData = []
          for (var i in data) {
            renderingData.push(data[i])
          }

          var that = this
          var barrage = canvas.selectAll(".barrage").data(renderingData)
          var symbolGenerator = d3.symbol()
          var symbol = symbolGenerator.type(d3.symbolTriangle)

          barrage
            .attr("id", function(d) {
              return "barrage_" + d.id
            })
            .attr("transform", function(d) {
              return "translate(" + xScale(d.idx - cursor) + ", " + (height - d.radius) + ")"
            })
            .on("mouseover", function(d) {
              var circleX = xScale((d.idx - cursor) <= barNum / 2 ? (d.idx - cursor + 5) : Math.floor(barNum / 2 + 5))
              var circleY = height - (d.content.length - 1) * 30

              that.formatContent(d.content)
              that.tooltip
                .style("left", (circleX + 10) + "px")
                .style("top", (circleY - 10) + "px")
                .transition()
                .duration(200)
                .style("opacity", 0.9)
            })
            .on("mouseout", function(d) {
              that.tooltip.transition()
                .duration(500)
                .style("opacity", 0)
            })

          barrage.enter().append("path")
            .attr("d", symbol)
            .attr("id", function(d) {
              return "barrage_" + d.id
            })
            .attr("class", "barrage")
            .attr("transform", function(d) {
              return "translate(" + xScale(d.idx - cursor) + ", " + (height - d.radius) + ")"
            })
            .attr("opacity", 1.0)
            .attr("stroke", function(d) {
              return d.color
            })
            .attr("fill", function(d) {
              return d.color
            })
            .on("mouseover", function(d) {
              var circleX = xScale((d.idx - cursor) <= barNum / 2 ? (d.idx - cursor + 5) : Math.floor(barNum / 2 + 5))
              var circleY = height - (d.content.length - 1) * 30

              that.formatContent(d.content)
              that.tooltip
                .style("left", (circleX + 10) + "px")
                .style("top", (circleY - 10) + "px")
                .transition()
                .duration(200)
                .style("opacity", 0.9)
            })
            .on("mouseout", function(d) {
              that.tooltip.transition()
                .duration(500)
                .style("opacity", 0)
            })

          barrage.exit().remove()
        }
      }
    }

    window.fintecheeBarrage.canvas[chartHandle] = getSvgCanvas(chartHandle)

    if (typeof window.pluginForSns == "undefined") {
      window.fintecheeBarrage.context[chartHandle] = context
    } else {
      window.pluginForSns.subscribe("barrage-" + chartHandle, window.fintecheeBarrage.callback, context)
    }
  },
  function(context) { // Deinit()
    var chartHandle = getChartHandleByContext(context)
    window.fintecheeBarrage.canvas[chartHandle].selectAll(".barrage").data([]).exit().remove()

    delete window.fintecheeBarrage.timeArr[chartHandle]
    delete window.fintecheeBarrage.canvas[chartHandle]
    delete window.fintecheeBarrage.barNum[chartHandle]
    delete window.fintecheeBarrage.cursor[chartHandle]
    delete window.fintecheeBarrage.width[chartHandle]
    delete window.fintecheeBarrage.height[chartHandle]
    delete window.fintecheeBarrage.xScale[chartHandle]
    delete window.fintecheeBarrage.yScale[chartHandle]
    delete window.fintecheeBarrage.timeFrameVal[chartHandle]
    delete window.fintecheeBarrage.context[chartHandle]
    delete window.fintecheeBarrage.data[chartHandle]

    if (typeof window.pluginForSns != "undefined") {
      window.pluginForSns.unsubscribe("barrage")
    }
  },
  function(context) { // Render()
    if (typeof window.pluginForSns == "undefined") {
      return
    }

    var chartHandle = getChartHandleByContext(context)
    var timeFrame = getTimeFrame(context)
    var timeFrameVal = 0

    if (timeFrame == "M1") {
      timeFrameVal = 60
    } else if (timeFrame == "M5") {
      timeFrameVal = 300
    } else if (timeFrame == "M15") {
      timeFrameVal = 900
    } else if (timeFrame == "M30") {
      timeFrameVal = 1800
    } else if (timeFrame == "H1") {
      timeFrameVal = 3600
    } else if (timeFrame == "H4") {
      timeFrameVal = 14400
    } else if (timeFrame == "D") {
      timeFrameVal = 86400
    } else {
      timeFrameVal = 86400
    }

    window.fintecheeBarrage.timeArr[chartHandle] = getDataInput(context, 0)
    window.fintecheeBarrage.barNum[chartHandle] = getBarNum(context)
    window.fintecheeBarrage.cursor[chartHandle] = getCursor(context)
    window.fintecheeBarrage.width[chartHandle] = getCanvasWidth(context)
    window.fintecheeBarrage.height[chartHandle] = getCanvasHeight(context)
    window.fintecheeBarrage.xScale[chartHandle] = getXScale(context)
    window.fintecheeBarrage.yScale[chartHandle] = getYScale(context)
    window.fintecheeBarrage.timeFrameVal[chartHandle] = timeFrameVal

    window.fintecheeBarrage.render(chartHandle)
  })
