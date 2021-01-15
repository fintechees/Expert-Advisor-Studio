registerIndicator("fintechee_crypto_loader", "A plugin to load the specific cryptocurrency's streaming quotes(v1.0)", function (context) {
  // Disclaimer: we are not affiliated with the data providers or the API providers.
  var changeCallback = function (ctx) {
    var symbolName = getExtraSymbolName(ctx)

    if (typeof window.fintecheeCryptoLoader.cryptocurrenciesList[symbolName] != "undefined") {
      var chartId = getChartHandleByContext(ctx)
      var symbol = window.fintecheeCryptoLoader.cryptocurrenciesList[symbolName].symbolName.split("/")
      var baseCurrency = symbol[0]
      var termCurrency = symbol[1]

      setTakeoverMode(chartId)
      changeChartMenuItemName(ctx)
      var timeFrame = getTimeFrame(ctx)

      window.fintecheeCryptoLoader.ticksList.add(baseCurrency)
      window.fintecheeCryptoLoader.ticksList.add(termCurrency)
      var chart = window.fintecheeCryptoLoader.charts[chartId + ""]
      chart.timeFrame = timeFrame
      chart.baseCurrency = baseCurrency
      chart.termCurrency = termCurrency

      $.ajax({
        type: "GET",
        url: "https://api.coincap.io/v2/candles",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: {
          exchange: "poloniex",
          interval: timeFrame.toLowerCase(),
          baseId: baseCurrency,
          quoteId: termCurrency
        },
        success: function (res) {
          if (typeof res.data != "undefined") {
            var data = []

            if (Array.isArray(res.data)) {
              for (var i in res.data) {
                var ohlc = res.data[i]

                data.push({
                  time: Math.floor(ohlc.period / 1000),
                  volume: parseFloat(ohlc.volume),
                  open: parseFloat(ohlc.open),
                  high: parseFloat(ohlc.high),
                  low: parseFloat(ohlc.low),
                  close: parseFloat(ohlc.close)
                })
              }

              takeoverLoad(chartId, data)
            }
          }
        }
      })

      window.fintecheeCryptoLoader.setupSocket()
    } else {
      var chartId = getChartHandleByContext(ctx)
      unsetTakeoverMode(chartId)
      takeoverLoad(chartId, [])
      delete window.fintecheeCryptoLoader.charts[chartId + ""]
    }
  }

  var removeCallback = function (ctx) {
    var chartId = getChartHandleByContext(ctx)
    unsetTakeoverMode(chartId)
    takeoverLoad(chartId, [])
    delete window.fintecheeCryptoLoader.charts[chartId + ""]
  }

  var chartId = getChartHandleByContext(context)

  if (typeof window.fintecheeCryptoLoader == "undefined") {
    window.fintecheeCryptoLoader = {
      cryptocurrenciesList: [],
      charts: [],
      ticksList: new Set(),
      socket: null,
      onTick: function (msg) {
        var ticks = JSON.parse(msg.data)

        for (var i in window.fintecheeCryptoLoader.charts) {
          var chart = window.fintecheeCryptoLoader.charts[i]
          var bUpdatable = false

          for (var j in ticks) {
            if (j == chart.baseCurrency) {
              chart.baseCurrencyPrice = parseFloat(ticks[j])
              bUpdatable = true
            }
            if (j == chart.termCurrency) {
              chart.termCurrencyPrice = parseFloat(ticks[j])
              bUpdatable = true
            }
          }

          if (bUpdatable) {
            if (chart.baseCurrencyPrice != null && chart.termCurrencyPrice != null && chart.baseCurrencyPrice > 0 && chart.termCurrencyPrice > 0) {
              var tick = {
                time: Math.floor(new Date().getTime() / 1000),
                volume: 0,
                price: chart.baseCurrencyPrice / chart.termCurrencyPrice
              }

              if (chart.timeFrame == "M1") {
                takeoverUpdate(chart.chartId, 60, tick)
              } else if (chart.timeFrame == "M5") {
                takeoverUpdate(chart.chartId, 300, tick)
              } else if (chart.timeFrame == "M15") {
                takeoverUpdate(chart.chartId, 900, tick)
              } else if (chart.timeFrame == "M30") {
                takeoverUpdate(chart.chartId, 1800, tick)
              } else if (chart.timeFrame == "H1") {
                takeoverUpdate(chart.chartId, 3600, tick)
              } else if (chart.timeFrame == "H4") {
                takeoverUpdate(chart.chartId, 14400, tick)
              } else if (chart.timeFrame == "D") {
                takeoverUpdate(chart.chartId, 86400, tick)
              } else {
                takeoverUpdate(chart.chartId, 86400, tick)
              }
            }
          }
        }
      },
      setupSocket: function () {
        if (window.fintecheeCryptoLoader.socket != null) {
          if(window.fintecheeCryptoLoader.socket.readyState == WebSocket.OPEN) {
            window.fintecheeCryptoLoader.socket.close()
          }
          window.fintecheeCryptoLoader.socket = null
        }

        var ticksList = Array.from(window.fintecheeCryptoLoader.ticksList)

        if (ticksList.length > 0) {
          window.fintecheeCryptoLoader.socket = new WebSocket("wss://ws.coincap.io/prices?assets=" + ticksList.join(","))
          window.fintecheeCryptoLoader.socket.onclose = function (e) {}
          window.fintecheeCryptoLoader.socket.onmessage = this.onTick
        }

        window.addEventListener("unload", function () {
          if (window.fintecheeCryptoLoader.socket != null) {
            if(window.fintecheeCryptoLoader.socket.readyState == WebSocket.OPEN) {
              window.fintecheeCryptoLoader.socket.close()
            }
            window.fintecheeCryptoLoader.socket = null
          }
        })
      }
    }

    window.fintecheeCryptoLoader.charts[chartId + ""] = {
      chartId: chartId,
      timeFrame: null,
      baseCurrency: null,
      termCurrency: null,
      baseCurrencyPrice: null,
      termCurrencyPrice: null
    }
    createTakeover(chartId, changeCallback, removeCallback)

    var cryptocurrenciesList = [{
      symbolName: "ethereum/bitcoin",
      displayName: "ETH/BTC"
    }]

    for (var i in cryptocurrenciesList) {
      window.fintecheeCryptoLoader.cryptocurrenciesList[cryptocurrenciesList[i].displayName] = cryptocurrenciesList[i]
    }

    addExtraSymbols(cryptocurrenciesList)
  } else if (typeof window.fintecheeCryptoLoader.charts[chartId + ""] == "undefined") {
    window.fintecheeCryptoLoader.charts[chartId + ""] = {
      chartId: chartId,
      baseCurrency: null,
      termCurrency: null,
      baseCurrencyPrice: null,
      termCurrencyPrice: null
    }
    createTakeover(chartId, changeCallback, removeCallback)
  }
},
[],
[{
  name: DATA_NAME.TIME,
  index: 0
}],
[{
  name: "crypto",
  visible: false
}],
WHERE_TO_RENDER.CHART_WINDOW)
