registerIndicator("fintechee_oanda_loader", "A plugin to load Oanda's streaming quotes and transactions(v1.11)", function (context) {
  // Deprecated. A new version will be coming soon.
  // Disclaimer: we are not affiliated with the data providers or the API providers.
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
WHERE_TO_RENDER.CHART_WINDOW,
function (context) { // Init
  setDefaultIndicator("fintechee_oanda_loader", true)
  window.oandaDemo = getIndiParameter(context, "oandaDemo")
  window.oandaAccountId = getIndiParameter(context, "oandaAccountId")
  window.oandaTradeKey = getIndiParameter(context, "oandaTradeKey")

  if (typeof window.oandaChangeCallback == "undefined") {
    window.oandaChangeCallback = function (ctx) {
      var symbolName = getExtraSymbolName(ctx)

      if (typeof window.oandaApiLoader.currenciesList[symbolName] != "undefined") {
        var chartId = getChartHandleByContext(ctx)
        var symbol = window.oandaApiLoader.currenciesList[symbolName].symbolName.split("_")
        var baseCurrency = symbol[0]
        var termCurrency = symbol[1]

        setTakeoverMode(chartId)
        changeChartMenuItemName(ctx)
        var timeFrame = getTimeFrame(ctx)

        window.oandaApiLoader.ticksList.add(baseCurrency)
        window.oandaApiLoader.ticksList.add(termCurrency)
        if (typeof window.oandaApiLoader.charts[chartId + ""] == "undefined") {
          window.oandaApiLoader.charts[chartId + ""] = {
            chartId: chartId,
            timeFrame: null,
            baseCurrency: null,
            termCurrency: null,
            baseCurrencyPrice: null,
            termCurrencyPrice: null
          }
        }
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
        window.oandaDataAPI.instruments.candles(window.oandaAccountId, chart.baseCurrency + "_" + chart.termCurrency, {
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
  }

  if (typeof window.oandaRemoveCallback == "undefined") {
    window.oandaRemoveCallback = function (ctx) {
      var chartId = getChartHandleByContext(ctx)
      unsetTakeoverMode(chartId)
      takeoverLoad(chartId, [])
      delete window.oandaApiLoader.charts[chartId + ""]
    }
  }

  var chartId = getChartHandleByContext(context)

  if (typeof window.oandaApiLoader == "undefined") {
    window.oandaApiLoader = {
      currenciesList: [],
      charts: [],
      ticksList: new Set(),
      socket: null,
      sendOrder: function (symbolName, volume) {

      },
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
        for (var i in window.oandaApiLoader.currenciesList) {
          symbolsList.push(window.oandaApiLoader.currenciesList[i].symbolName)
        }

        if (symbolsList.length > 0) {
          var script = document.createElement("script")
          document.body.appendChild(script)
          script.onload = function () {
            window.latestTickTime = 0
            window.oandaDataAPI.addToken(window.oandaDemo, window.oandaAccountId, window.oandaTradeKey)
            window.oandaDataCallback = function (res) {
              window.latestOandaTickTime = new Date().getTime()
              window.oandaLoaded = true

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

                window.oandaApiLoader.oandaQuotes[instrument[0] + "/" + instrument[1]] = {
                  ask: ask,
                  bid: bid
                }

                window.oandaApiLoader.onTick(data)
              }
            }
            window.oandaDataAPI.pricing.stream(window.oandaAccountId, {instruments: symbolsList.join(","), snapshot: false}, window.oandaDataCallback)
            window.oandaOrderAPI.addToken(window.oandaDemo, window.oandaAccountId, window.oandaTradeKey)
            window.oandaOrderCallback = function (res) {
              if (typeof res.type != "undefined") {
                var data = {

                }
                if (res.type == "ORDER_FILL") {

                } else if (res.type == "HEARTBEAT") {
                }

                // {"accountBalance":"6505973.49885","accountID":"<ACCOUNT>","batchID":"777","financing":"0.00000","id":"778","instrument":"EUR_USD","orderID":"777","pl":"0.00000","price":"1.11625","reason":"MARKET_ORDER","time":"2016-09-20T18:18:22.126490230Z","tradeOpened":{"tradeID":"778","units":"100"},"type":"ORDER_FILL","units":"100","userID":1179508}
                window.oandaApiLoader.onTransaction(data)
              }
            }
            window.oandaOrderAPI.transactions.stream(window.oandaAccountId, window.oandaOrderCallback)
          }
          script.onerror = function () {
            alert("Failed to load required libs. Please refresh this page again.")
          }
          script.async = true
          script.src = "https://www.fintechee.com/js/oanda/oanda_wrapper.js"
        }
      },
      resetupSocket: function () {
        var symbolsList = []
        for (var i in window.oandaApiLoader.currenciesList) {
          symbolsList.push(window.oandaApiLoader.currenciesList[i].symbolName)
        }

        if (symbolsList.length > 0) {
          window.oandaDataAPI.pricing.stream(window.oandaAccountId, {instruments: symbolsList.join(","), snapshot: false}, window.oandaDataCallback)
          window.oandaOrderAPI.transactions.stream(window.oandaAccountId, window.oandaOrderCallback)
        }
      }
    }

    var chartIds = getLayout(1).concat(getLayout(2)).concat(getLayout(3)).concat(getLayout(4))
    for (var i in chartIds) {
      if (typeof window.oandaApiLoader.charts[chartIds[i] + ""] == "undefined") {
        window.oandaApiLoader.charts[chartIds[i] + ""] = {
          chartId: chartIds[i],
          timeFrame: null,
          baseCurrency: null,
          termCurrency: null,
          baseCurrencyPrice: null,
          termCurrencyPrice: null
        }
        createTakeover(chartIds[i], window.oandaChangeCallback, window.oandaRemoveCallback)
      }
    }

    var currenciesList = [{
      symbolName: "AUD_CAD",
      displayName: "AUD/CAD (Oanda)"
    }, {
      symbolName: "AUD_CHF",
      displayName: "AUD/CHF (Oanda)"
    }, {
      symbolName: "AUD_JPY",
      displayName: "AUD/JPY (Oanda)"
    }, {
      symbolName: "AUD_USD",
      displayName: "AUD/USD (Oanda)"
    }, {
      symbolName: "EUR_GBP",
      displayName: "EUR/GBP (Oanda)"
    }, {
      symbolName: "EUR_JPY",
      displayName: "EUR/JPY (Oanda)"
    }, {
      symbolName: "EUR_USD",
      displayName: "EUR/USD (Oanda)"
    }, {
      symbolName: "GBP_AUD",
      displayName: "GBP/AUD (Oanda)"
    }, {
      symbolName: "GBP_CHF",
      displayName: "GBP/CHF (Oanda)"
    }, {
      symbolName: "GBP_JPY",
      displayName: "GBP/JPY (Oanda)"
    }, {
      symbolName: "GBP_USD",
      displayName: "GBP/USD (Oanda)"
    }, {
      symbolName: "USD_CAD",
      displayName: "USD/CAD (Oanda)"
    }, {
      symbolName: "USD_CHF",
      displayName: "USD/CHF (Oanda)"
    }, {
      symbolName: "USD_JPY",
      displayName: "USD/JPY (Oanda)"
    }]

    window.oandaApiLoader.oandaQuotes = []

    for (var i in currenciesList) {
      window.oandaApiLoader.currenciesList[currenciesList[i].displayName] = currenciesList[i]
      window.oandaApiLoader.oandaQuotes[currenciesList[i].symbolName.replace("_", "/")] = null
    }

    addExtraSymbols(currenciesList)

    window.oandaApiLoader.setupSocket()
  } else if (typeof window.oandaApiLoader.charts[chartId + ""] == "undefined") {
    window.oandaApiLoader.charts[chartId + ""] = {
      chartId: chartId,
      baseCurrency: null,
      termCurrency: null,
      baseCurrencyPrice: null,
      termCurrencyPrice: null
    }
    createTakeover(chartId, window.oandaChangeCallback, window.oandaRemoveCallback)
  }
},
function (context) { // Deinit

},
function (context) { // Render

})
