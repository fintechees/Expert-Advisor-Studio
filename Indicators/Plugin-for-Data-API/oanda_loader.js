registerIndicator("fintechee_oanda_loader", "A plugin to load Oanda's streaming quotes and transactions(v1.03)", function (context) {
  // Disclaimer: we are not affiliated with the data providers or the API providers.
  window.oandaDemo = getIndiParameter(context, "oandaDemo")
  window.oandaAccountId = getIndiParameter(context, "oandaAccountId")
  window.oandaTradeKey = getIndiParameter(context, "oandaTradeKey")

  var changeCallback = function (ctx) {
    var symbolName = getExtraSymbolName(ctx)

    if (typeof window.oandaApiLoader.cryptocurrenciesList[symbolName] != "undefined") {
      var chartId = getChartHandleByContext(ctx)
      var symbol = window.oandaApiLoader.cryptocurrenciesList[symbolName].symbolName.split("/")
      var baseCurrency = symbol[0]
      var termCurrency = symbol[1]

      setTakeoverMode(chartId)
      changeChartMenuItemName(ctx)
      var timeFrame = getTimeFrame(ctx)

      window.oandaApiLoader.ticksList.add(baseCurrency)
      window.oandaApiLoader.ticksList.add(termCurrency)
      var chart = window.oandaApiLoader.charts[chartId + ""]
      chart.timeFrame = timeFrame
      chart.baseCurrency = baseCurrency
      chart.termCurrency = termCurrency

      // Solution A:
      // Worked as well
      // You can compare the two solutions.
      // $.ajax({
      //   type: "GET",
      //   url: (window.oandaDemo ? "https://api-fxpractice.oanda.com/v3/instruments/" : "https://api-fxtrade.oanda.com/v3/instruments/") + chart.baseCurrency + "_" + chart.termCurrency + "/candles?granularity=" + timeFrame.toUpperCase(),
      //   contentType: "application/json; charset=utf-8",
      //   dataType: "json",
      //   headers: {
      //     "Authorization": "bearer " + window.oandaTradeKey,
      //     "Accept-Datetime-Format": "UNIX"
      //   },
      //   success: function (res) {
      //     var data = []
      //
      //     if (Array.isArray(res.candles)) {
      //       for (var i in res.candles) {
      //         var ohlc = res.candles[i].mid
      //
      //         data.push({
      //           time: Math.floor(res.candles[i].time / 1000),
      //           volume: res.candles[i].volume,
      //           open: parseFloat(ohlc.o),
      //           high: parseFloat(ohlc.h),
      //           low: parseFloat(ohlc.l),
      //           close: parseFloat(ohlc.c)
      //         })
      //       }
      //
      //       takeoverLoad(chartId, data)
      //     }
      //   }
      // })

      // Solution B:
      oandaDataAPI.instruments.candles(window.oandaAccountId, chart.baseCurrency + "_" + chart.termCurrency, {
        granularity: timeFrame.toUpperCase()
      })
      .then(function (res) {
        var data = []

        if (Array.isArray(res.candles)) {
          for (var i in res.candles) {
            var ohlc = res.candles[i].mid

            data.push({
              time: Math.floor(new Date(res.candles[i].time).getTime() / 1000),
              volume: res.candles[i].volume,
              open: parseFloat(ohlc.o),
              high: parseFloat(ohlc.h),
              low: parseFloat(ohlc.l),
              close: parseFloat(ohlc.c)
            })
          }

          takeoverLoad(chartId, data)
        }
      })

    } else {
      var chartId = getChartHandleByContext(ctx)
      unsetTakeoverMode(chartId)
      takeoverLoad(chartId, [])
      delete window.oandaApiLoader.charts[chartId + ""]
    }
  }

  var removeCallback = function (ctx) {
    var chartId = getChartHandleByContext(ctx)
    unsetTakeoverMode(chartId)
    takeoverLoad(chartId, [])
    delete window.oandaApiLoader.charts[chartId + ""]
  }

  var chartId = getChartHandleByContext(context)

  if (typeof window.oandaApiLoader == "undefined") {
    window.oandaApiLoader = {
      cryptocurrenciesList: [],
      charts: [],
      ticksList: new Set(),
      socket: null,
      onTick: function (msg) {
        var ticks = msg.data

        for (var i in window.oandaApiLoader.charts) {
          var chart = window.oandaApiLoader.charts[i]
          var bUpdatable1 = false
          var bUpdatable2 = false

          for (var j in ticks) {
            if (j == chart.baseCurrency) {
              chart.baseCurrencyPrice = parseFloat(ticks[j])
              bUpdatable1 = true
            }
            if (j == chart.termCurrency) {
              chart.termCurrencyPrice = parseFloat(ticks[j])
              bUpdatable2 = true
            }
          }

          if (bUpdatable1 && bUpdatable2) {
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
      onTransaction: function (data) {

      },
      setupSocket: function () {
        var symbolsList = []
        for (var i in window.oandaApiLoader.cryptocurrenciesList) {
          symbolsList.push(window.oandaApiLoader.cryptocurrenciesList[i].symbolName)
        }

        if (symbolsList.length > 0) {
          var script = document.createElement("script")
          document.body.appendChild(script)
          script.onload = function () {
            window.oandaDataAPI.addToken(window.oandaDemo, window.oandaAccountId, window.oandaTradeKey)
            window.oandaDataAPI.pricing.stream(window.oandaAccountId, {instruments: symbolsList.join(","), snapshot: false}, function (res) {
              if (typeof res.instrument != "undefined") {
                var data = {
                  data: []
                }

                var ask = null
                var bid = null
                var price = null
                if (Array.isArray(res.asks)) {
                  ask = parseFloat(res.asks[0].price)
                  price = ask
                }
                if (Array.isArray(res.bids)) {
                  bid = parseFloat(res.bids[0].price)
                  if (price != null) {
                    price = (price + bid) / 2
                  } else {
                    price = bid
                  }
                }

                var instrument = res.instrument.split("_")
                data.data[instrument[0]] = price
                data.data[instrument[1]] = 1

                window.oandaApiLoader.oandaQuotes[res.instrument] = {
                  ask: ask,
                  bid: bid
                }

                window.oandaApiLoader.onTick(data)
              }
            })
            window.oandaOrderAPI.addToken(window.oandaDemo, window.oandaAccountId, window.oandaTradeKey)
            window.oandaOrderAPI.transactions.stream(window.oandaAccountId, function (res) {
              if (typeof res.type != "undefined") {
                var data = {

                }
                if (res.type == "ORDER_FILL") {

                } else if (res.type == "HEARTBEAT") {
                }

                // {"accountBalance":"6505973.49885","accountID":"<ACCOUNT>","batchID":"777","financing":"0.00000","id":"778","instrument":"EUR_USD","orderID":"777","pl":"0.00000","price":"1.11625","reason":"MARKET_ORDER","time":"2016-09-20T18:18:22.126490230Z","tradeOpened":{"tradeID":"778","units":"100"},"type":"ORDER_FILL","units":"100","userID":1179508}
                window.oandaApiLoader.onTransaction(data)
              }
            })
          }
          script.onerror = function () {
            alert("Failed to load required libs. Please refresh this page again.")
          }
          script.async = true
          script.src = "https://www.fintechee.com/js/oanda/oanda_wrapper.js"
        }
      }
    }

    window.oandaApiLoader.charts[chartId + ""] = {
      chartId: chartId,
      timeFrame: null,
      baseCurrency: null,
      termCurrency: null,
      baseCurrencyPrice: null,
      termCurrencyPrice: null
    }
    createTakeover(chartId, changeCallback, removeCallback)

    var cryptocurrenciesList = [{
      symbolName: "AUD/JPY",
      displayName: "AUD/JPY (Oanda)"
    }, {
      symbolName: "GBP/JPY",
      displayName: "GBP/JPY (Oanda)"
    }, {
      symbolName: "GBP/AUD",
      displayName: "GBP/AUD (Oanda)"
    }, {
      symbolName: "USD/JPY",
      displayName: "USD/JPY (Oanda)"
    }, {
      symbolName: "EUR/USD",
      displayName: "EUR/USD (Oanda)"
    }, {
      symbolName: "USD/CHF",
      displayName: "USD/CHF (Oanda)"
    }, {
      symbolName: "AUD/USD",
      displayName: "AUD/USD (Oanda)"
    }, {
      symbolName: "AUD/CAD",
      displayName: "AUD/CAD (Oanda)"
    }, {
      symbolName: "GBP/USD",
      displayName: "GBP/USD (Oanda)"
    }, {
      symbolName: "USD/CAD",
      displayName: "USD/CAD (Oanda)"
    }, {
      symbolName: "EUR/JPY",
      displayName: "EUR/JPY (Oanda)"
    }, {
      symbolName: "AUD/CHF",
      displayName: "AUD/CHF (Oanda)"
    }, {
      symbolName: "EUR/GBP",
      displayName: "EUR/GBP (Oanda)"
    }, {
      symbolName: "GBP/CHF",
      displayName: "GBP/CHF (Oanda)"
    }]

    for (var i in cryptocurrenciesList) {
      window.oandaApiLoader.cryptocurrenciesList[cryptocurrenciesList[i].displayName] = cryptocurrenciesList[i]
    }

    window.oandaApiLoader.oandaQuotes = []

    addExtraSymbols(cryptocurrenciesList)

    window.oandaApiLoader.setupSocket()
  } else if (typeof window.oandaApiLoader.charts[chartId + ""] == "undefined") {
    window.oandaApiLoader.charts[chartId + ""] = {
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
  name: "oandaDemo",
  value: true,
  required: true,
  type: PARAMETER_TYPE.BOOLEAN,
  range: null
}, {
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
