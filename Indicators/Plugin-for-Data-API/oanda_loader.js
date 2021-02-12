registerIndicator("fintechee_oanda_loader", "A plugin to load Oanda's streaming quotes(v1.0)", function (context) {
  // Disclaimer: we are not affiliated with the data providers or the API providers.
  window.oandaAccountId = getIndiParameter(context, "oandaAccountId")
  window.oandaTradeKey = getIndiParameter(context, "oandaTradeKey")

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
        url: "https://api-fxpractice.oanda.com/v3/instruments/" + chart.baseCurrency + "_" + chart.termCurrency + "/candles?granularity=" + timeFrame.toUpperCase(),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "bearer " + window.oandaTradeKey,
          "Accept-Datetime-Format": "UNIX"
        },
        success: function (res) {
          if (typeof res.data != "undefined") {
            var data = []

            if (Array.isArray(res.candles)) {
              for (var i in res.candles) {
                var ohlc = res.candles[i].mid

                data.push({
                  time: Math.floor(res.candles[i].time / 1000),
                  volume: res.candles[i].volume,
                  open: parseFloat(ohlc.o),
                  high: parseFloat(ohlc.h),
                  low: parseFloat(ohlc.l),
                  close: parseFloat(ohlc.c)
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
                volume: (typeof ticks.volume != "undefined" ? ticks.volume : 0),
                price: Math.round(chart.baseCurrencyPrice / chart.termCurrencyPrice * 100000) / 100000
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
        var that = this
        var ticksList = Array.from(window.fintecheeCryptoLoader.ticksList)

        if (ticksList.length > 0) {
          $.ajax({
            type: "GET",
            url: "https://api-fxpractice.oanda.com/v3/accounts/" + window.oandaAccountId + "/pricing/stream?instruments=" + ticksList.join(",").replaceAll("/", "_"),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
              "Authorization": "bearer " + window.oandaTradeKey,
              "Accept-Datetime-Format": "UNIX"
            },
            success: function (res) {
              if (typeof res.instrument != "undefined") {
                var data = {
                  data: []
                }

                var price = null
                if (Array.isArray(res.asks)) {
                  price = res.asks[0]
                }
                if (Array.isArray(res.bids)) {
                  if (price != null) {
                    price = (price + res.bids[0]) / 2
                  } else {
                    price = res.bids[0]
                  }
                }

                var instrument = res.instrument.split("_")
                data.data[instrument[0]] = price
                data.data[instrument[1]] = 1

                that.onTick(data)
              }
            }
          })
        }

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
      symbolName: "EUR/USD",
      displayName: "EUR/USD"
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
[{
  name: "oandaAccountId",
  value: "XXX-XXX-XXXXXXXX-XXX",
  required: true,
  type: PARAMETER_TYPE.STRING,
  range: null
}, {
  name: "oandaTradeKey",
  value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  required: true,
  type: PARAMETER_TYPE.STRING,
  range: null
}],
[{
  name: DATA_NAME.TIME,
  index: 0
}],
[{
  name: "oanda",
  visible: false
}],
WHERE_TO_RENDER.CHART_WINDOW)
