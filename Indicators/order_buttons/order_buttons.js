registerIndicator("order_buttons", "A chart widget with the buttons to send market orders(v1.0)", function (context) {
},[{
  name: "lotsStep",
  value: 0.01,
  required: true,
  type: PARAMETER_TYPE.NUMBER,
  range: [0.01, 10]
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
  context.lotsStep = getIndiParameter(context, "lotsStep")

  if (typeof window.orderButtons == "undefined" || window.orderButtons == null) {
    window.orderButtons = {
      canvas: [],
      lots: [],
      brokerName: getBrokerNameByContext(context),
      accountId: getAccountIdByContext(context),
      symbolName: []
    }
  }

  window.orderButtons.canvas[chartHandle] = getSvgCanvas(chartHandle)
  window.orderButtons.lots[chartHandle] = context.lotsStep
  window.orderButtons.symbolName[chartHandle] = getChartSymbolNameByContext(context)
},
function (context) { // Deinit()
  var chartHandle = getChartHandleByContext(context)

  window.orderButtons.canvas[chartHandle].selectAll(".btnBuyG").data([]).exit().remove()
  window.orderButtons.canvas[chartHandle].selectAll(".btnIncreaseLotsG").data([]).exit().remove()
  window.orderButtons.canvas[chartHandle].selectAll(".lotsG").data([]).exit().remove()
  window.orderButtons.canvas[chartHandle].selectAll(".btnDecreaseLotsG").data([]).exit().remove()
  window.orderButtons.canvas[chartHandle].selectAll(".btnSellG").data([]).exit().remove()
  delete window.orderButtons.canvas[chartHandle]
  delete window.orderButtons.lots[chartHandle]
  delete window.orderButtons.symbolName[chartHandle]
},
function (context) { // Render()
  var chartHandle = getChartHandleByContext(context)
  var width = getCanvasWidth(context)
  var height = getCanvasHeight(context)

  var buyButton = [{
    chartHandle: chartHandle,
    label: "Buy"
  }]
  var btnBuyG = null
  var btnBuy = null
  var btnBuyTxt = null
  var increaseLotsButton = [{
    chartHandle: chartHandle,
    label: "+"
  }]
  var btnIncreaseLotsG = null
  var btnIncreaseLots = null
  var btnIncreaseLotsTxt = null
  var lotsRect = [{
    chartHandle: chartHandle
  }]
  var lotsG = null
  var lots = null
  var lotsTxt = null
  var decreaseLotsButton = [{
    chartHandle: chartHandle,
    label: "-"
  }]
  var btnDecreaseLotsG = null
  var btnDecreaseLots = null
  var btnDecreaseLotsTxt = null
  var sellButton = [{
    chartHandle: chartHandle,
    label: "Sell"
  }]
  var btnSellG = null
  var btnSell = null
  var btnSellTxt = null

  if (getCalculatedLength(context) == 0) {
    btnBuyG = window.orderButtons.canvas[chartHandle].append("g")
      .attr("class", "btnBuyG")
    btnIncreaseLotsG = window.orderButtons.canvas[chartHandle].append("g")
      .attr("class", "btnIncreaseLotsG")
    lotsG = window.orderButtons.canvas[chartHandle].append("g")
      .attr("class", "lotsG")
    btnDecreaseLotsG = window.orderButtons.canvas[chartHandle].append("g")
      .attr("class", "btnDecreaseLotsG")
    btnSellG = window.orderButtons.canvas[chartHandle].append("g")
      .attr("class", "btnSellG")

    btnBuy = btnBuyG.selectAll(".btnBuy").data(buyButton)
    btnBuyTxt = btnBuyG.selectAll(".btnBuyTxt").data(buyButton)
    btnIncreaseLots = btnIncreaseLotsG.selectAll(".btnIncreaseLots").data(increaseLotsButton)
    btnIncreaseLotsTxt = btnIncreaseLotsG.selectAll(".btnIncreaseLotsTxt").data(increaseLotsButton)
    lots = lotsG.selectAll(".lots").data(lotsRect)
    lotsTxt = lotsG.selectAll(".lotsTxt").data(lotsRect)
    btnDecreaseLots = btnDecreaseLotsG.selectAll(".btnDecreaseLots").data(decreaseLotsButton)
    btnDecreaseLotsTxt = btnDecreaseLotsG.selectAll(".btnDecreaseLotsTxt").data(decreaseLotsButton)
    btnSell = btnSellG.selectAll(".btnSell").data(sellButton)
    btnSellTxt = btnSellG.selectAll(".btnSellTxt").data(sellButton)

    var sendMarketOrder = function (d, orderType) {
      var brokerName = window.orderButtons.brokerName
      var accountId = window.orderButtons.accountId
      var symbolName = window.orderButtons.symbolName[d.chartHandle]
      var volume = window.orderButtons.lots[d.chartHandle]
      sendOrder(brokerName, accountId, symbolName, orderType, 0, 0, volume, 0, 0, "", 0, 0)
    }

    btnBuy
      .enter().append("rect")
      .attr("class", "btnBuy")
      .attr("x", width - 57)
      .attr("y", 7)
      .attr("width", 50)
      .attr("height", 30)
      .attr("stroke", "white")
      .attr("fill", "green")
      .style("cursor", "pointer")
      .on("click", function (d) {
        sendMarketOrder(d, ORDER_TYPE.OP_BUY)
      })

    btnBuyTxt
      .enter().append("text")
      .attr("class", "btnBuyTxt")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("x", width - 37)
      .attr("y", 22)
      .attr("dx", -5)
      .attr("dy", 5)
      .attr("fill", "white")
      .attr("textAnchor", "start")
      .style("fontSize", "8px")
      .style("cursor", "pointer")
      .text(function (d) {
        return d.label
      })
      .on("click", function (d) {
        sendMarketOrder(d, ORDER_TYPE.OP_BUY)
      })

    var increaseLots = function (d) {
      var currLots = parseFloat(window.orderButtons.lots[d.chartHandle])
      currLots += context.lotsStep
      currLots = Math.round(currLots * 100) /  100
      window.orderButtons.lots[d.chartHandle] = currLots
      var currLotsTxt = window.orderButtons.canvas[d.chartHandle].selectAll(".lotsTxt")
      currLotsTxt.text(currLots)
    }

    btnIncreaseLots
      .enter().append("rect")
      .attr("class", "btnIncreaseLots")
      .attr("x", width - 67)
      .attr("y", 7)
      .attr("width", 10)
      .attr("height", 30)
      .attr("stroke", "white")
      .attr("fill", "green")
      .style("cursor", "pointer")
      .on("click", function (d) {
        increaseLots(d)
      })

    btnIncreaseLotsTxt
      .enter().append("text")
      .attr("class", "btnIncreaseLotsTxt")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("x", width - 62)
      .attr("y", 22)
      .attr("dx", -5)
      .attr("dy", 5)
      .attr("fill", "white")
      .attr("textAnchor", "start")
      .style("fontSize", "8px")
      .style("cursor", "pointer")
      .text(function (d) {
        return d.label
      })
      .on("click", function (d) {
        increaseLots(d)
      })

    lots
      .enter().append("rect")
      .attr("class", "lots")
      .attr("x", width - 117)
      .attr("y", 7)
      .attr("width", 50)
      .attr("height", 30)
      .attr("stroke", "white")
      .attr("fill", "white")

    lotsTxt
      .enter().append("text")
      .attr("class", "lotsTxt")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("x", width - 102)
      .attr("y", 22)
      .attr("dx", -5)
      .attr("dy", 5)
      .attr("fill", "black")
      .attr("textAnchor", "start")
      .style("fontSize", "8px")
      .text(function (d) {
        return window.orderButtons.lots[d.chartHandle]
      })

    var decreaseLots = function (d) {
      var currLots = parseFloat(window.orderButtons.lots[d.chartHandle])
      if (currLots - context.lotsStep == 0) return
      currLots -= context.lotsStep
      currLots = Math.round(currLots * 100) /  100
      window.orderButtons.lots[d.chartHandle] = currLots
      var currLotsTxt = window.orderButtons.canvas[d.chartHandle].selectAll(".lotsTxt")
      currLotsTxt.text(currLots)
    }

    btnDecreaseLots
      .enter().append("rect")
      .attr("class", "btnDecreaseLots")
      .attr("x", width - 127)
      .attr("y", 7)
      .attr("width", 10)
      .attr("height", 30)
      .attr("stroke", "white")
      .attr("fill", "red")
      .style("cursor", "pointer")
      .on("click", function (d) {
        decreaseLots(d)
      })

    btnDecreaseLotsTxt
      .enter().append("text")
      .attr("class", "btnDecreaseLotsTxt")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("x", width - 120)
      .attr("y", 22)
      .attr("dx", -5)
      .attr("dy", 5)
      .attr("fill", "white")
      .attr("textAnchor", "start")
      .style("fontSize", "8px")
      .style("cursor", "pointer")
      .text(function (d) {
        return d.label
      })
      .on("click", function (d) {
        decreaseLots(d)
      })

    btnSell
      .enter().append("rect")
      .attr("class", "btnSell")
      .attr("x", width - 177)
      .attr("y", 7)
      .attr("width", 50)
      .attr("height", 30)
      .attr("stroke", "white")
      .attr("fill", "red")
      .style("cursor", "pointer")
      .on("click", function (d) {
        sendMarketOrder(d, ORDER_TYPE.OP_SELL)
      })

    btnSellTxt
      .enter().append("text")
      .attr("class", "btnSellTxt")
      .attr("width", "10px")
      .attr("height", "10px")
      .attr("x", width - 157)
      .attr("y", 22)
      .attr("dx", -5)
      .attr("dy", 5)
      .attr("fill", "white")
      .attr("textAnchor", "start")
      .style("fontSize", "8px")
      .style("cursor", "pointer")
      .text(function (d) {
        return d.label
      })
      .on("click", function (d) {
        sendMarketOrder(d, ORDER_TYPE.OP_SELL)
      })

  } else {
    btnBuy = window.orderButtons.canvas[chartHandle].selectAll(".btnBuy").data(buyButton)
    btnBuyTxt = window.orderButtons.canvas[chartHandle].selectAll(".btnBuyTxt").data(buyButton)

    btnBuy
      .attr("x", width - 57)

    btnBuyTxt
      .attr("x", width - 37)

    btnIncreaseLots = window.orderButtons.canvas[chartHandle].selectAll(".btnIncreaseLots").data(increaseLotsButton)
    btnIncreaseLotsTxt = window.orderButtons.canvas[chartHandle].selectAll(".btnIncreaseLotsTxt").data(increaseLotsButton)

    btnIncreaseLots
      .attr("x", width - 67)

    btnIncreaseLotsTxt
      .attr("x", width - 62)

    lots = window.orderButtons.canvas[chartHandle].selectAll(".lots").data(lotsRect)
    lotsTxt = window.orderButtons.canvas[chartHandle].selectAll(".lotsTxt").data(lotsRect)

    lots
      .attr("x", width - 117)

    lotsTxt
      .attr("x", width - 102)

    btnDecreaseLots = window.orderButtons.canvas[chartHandle].selectAll(".btnDecreaseLots").data(decreaseLotsButton)
    btnDecreaseLotsTxt = window.orderButtons.canvas[chartHandle].selectAll(".btnDecreaseLotsTxt").data(decreaseLotsButton)

    btnDecreaseLots
      .attr("x", width - 127)

    btnDecreaseLotsTxt
      .attr("x", width - 120)

    btnSell = window.orderButtons.canvas[chartHandle].selectAll(".btnSell").data(sellButton)
    btnSellTxt = window.orderButtons.canvas[chartHandle].selectAll(".btnSellTxt").data(sellButton)

    btnSell
      .attr("x", width - 177)

    btnSellTxt
      .attr("x", width - 157)
  }
})
