registerEA(
"copy_trading_for_oanda",
"An EA to copy trading for Oanda(v1.0)",
[],
function (context) { // Init()
  if (typeof window.oandaOrderApiLoader == "undefined") {
    window.oandaOrderApiLoader = {
      oandaDemo: true,
      oandaAccountId: "",
      oandaTradeKey: "",
      wrapperLibUrl: "https://www.fintechee.com/js/oanda/oanda_wrapper.js",
      interval: 120000,
      latestHBTime: 0,
      bMonitoring: false,
      bCopyTrading: false,
      sendOrder: function (symbolName, orderType, volume) {
        if (typeof window.oandaOrderAPI != "undefined") {
          window.oandaOrderAPI.orders.openOrder(this.oandaAccountId, {
            units: (orderType == ORDER_TYPE.OP_BUY ? (volume * 100000 + "") : (-volume * 100000 + "")),
            instrument: symbolName.replace("/", "_"),
            timeInForce: "FOK",
            type: "MARKET",
            positionFill: "DEFAULT"
          })
        }
      },
      oandaOrderCallback: function (res) {
        if (typeof window.oandaOrderApiLoader != "undefined") {
          if (typeof res.type != "undefined") {
            if (res.type == "ORDER_FILL") {
              window.oandaOrderApiLoader.updateTrade(res)
            } else if (res.type == "HEARTBEAT") {
              window.oandaOrderApiLoader.latestHBTime = new Date().getTime()
              if (!window.oandaOrderApiLoader.bMonitoring) {
                throw new Error("Disconnected.")
              }
            }
          }
        }
      },
      setupSocket: function () {
        var bLibLoaded = false
        var tags = document.getElementsByTagName("script")
        for (var i = tags.length - 1; i >= 0; i--) {
          if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == this.wrapperLibUrl) {
            bLibLoaded = true
            break
          }
        }

        var that = this

        if (bLibLoaded) {
          if (typeof window.oandaOrderAPI != "undefined") {
            window.oandaOrderAPI.addToken(this.oandaDemo, this.oandaAccountId, this.oandaTradeKey)
            window.oandaOrderAPI.transactions.stream(this.oandaAccountId, this.oandaOrderCallback)
          }

          window.oandaOrderAPI.trades.listOpen(this.oandaAccountId)
          .then(function (res) {
            that.renderTrades(res.trades)
          })
          .catch(function () {})

          this.bMonitoring = true
          $("#connect_to_oanda").prop("disabled", false)
          setTimeout(function () {that.monitorConnection()}, this.interval)
        } else {
          var script = document.createElement("script")

          document.body.appendChild(script)
          script.onload = function () {
            if (typeof window.oandaOrderAPI != "undefined") {
              window.oandaOrderAPI.addToken(that.oandaDemo, that.oandaAccountId, that.oandaTradeKey)
              window.oandaOrderAPI.transactions.stream(that.oandaAccountId, that.oandaOrderCallback)
            }

            window.oandaOrderAPI.trades.listOpen(that.oandaAccountId)
            .then(function (res) {
              that.renderTrades(res.trades)
            })
            .catch(function () {})

            that.bMonitoring = true
            $("#connect_to_oanda").prop("disabled", false)
            setTimeout(function () {that.monitorConnection()}, that.interval)
          }
          script.onerror = function () {
            that.bMonitoring = false
            $("#connect_to_oanda").prop("disabled", false)
            popupErrorMessage("Failed to load required libs.")
          }
          script.async = true
          script.src = this.wrapperLibUrl
        }
      },
      monitorConnection: function () {
        if (this.latestHBTime != 0 && new Date().getTime() - this.latestHBTime >= this.interval) {
          this.resetupSocket()
        }
        if (this.bMonitoring) {
          var that = this
          setTimeout(function () {that.monitorConnection()}, this.interval)
        }
      },
      resetupSocket: function () {
        if (typeof window.oandaOrderAPI != "undefined") {
          window.oandaOrderAPI.addToken(this.oandaDemo, this.oandaAccountId, this.oandaTradeKey)
          window.oandaOrderAPI.transactions.stream(this.oandaAccountId, this.oandaOrderCallback)
        }
      },
      removeSocket: function () {
        if (typeof window.oandaOrderAPI != "undefined") {
          this.bCopyTrading = false
          this.bMonitoring = false
        }
      },
      updateTrade: function (trade) {
        var data = $("#oanda_trades_list").DataTable().rows().data()
        var rowId = -1
        var instrument = trade.instrument.replace("_", "/")
        var currentUnits = 0
        var units = parseFloat(trade.units)

        for (var i in data) {
          if (data[i][0] == instrument) {
            rowId = parseInt(i)
            if (data[i][2] == "Long") {
              currentUnits = data[i][1]
            } else {
              currentUnits = -data[i][1]
            }
            break
          }
        }

        if (rowId != -1) {
          if (units + currentUnits == 0) {
            $("#oanda_trades_list").dataTable().fnDeleteRow(rowId)
          } else if (units + currentUnits > 0) {
            $("#oanda_trades_list").dataTable().fnUpdate(units + currentUnits, rowId, 1, false, false)
            $("#oanda_trades_list").dataTable().fnUpdate("Long", rowId, 2, false, false)
          } else {
            $("#oanda_trades_list").dataTable().fnUpdate(Math.abs(units + currentUnits), rowId, 1, false, false)
            $("#oanda_trades_list").dataTable().fnUpdate("Short", rowId, 2, false, false)
          }
        } else {
          trade.currentUnits = trade.units
          this.addTradeToTable(trade)
        }
      },
      addTradeToTable: function (trade) {
        var currentUnits = parseFloat(trade.currentUnits)
        $("#oanda_trades_list").DataTable().row.add([
          trade.instrument.replace("_", "/"),
          Math.abs(currentUnits),
          currentUnits > 0 ? "Long" : "Short"
        ]).draw(false)
      },
      renderTrades: function (trades) {
        $("#oanda_trades_list").DataTable().clear().draw()

        for (var i in trades) {
          var trade = trades[i]
          trade.units = trade.currentUnits

          this.updateTrade(trade)
        }
      },
      init: function () {
        var that = this

        if (typeof $("#oanda_trades_dashboard").html() == "undefined") {
          var panel = '<div class="ui form modal" id="oanda_trades_dashboard">' +
            '<div class="content">' +
              '<div class="row">' +
                '<div class="ui fluid action input">' +
                  '<div class="ui selection dropdown" id="dropdownOandaDemo">' +
                    '<input type="hidden" id="oandaDemo">' +
                    '<i class="dropdown icon"></i>' +
                    '<div class="default text">Demo (Default)</div>' +
                    '<div class="menu">' +
                      '<div class="item" data-value="true">Demo</div>' +
                      '<div class="item" data-value="false">Live</div>' +
                    '</div>' +
                  '</div>' +
                  '<input type="text" id="oandaAccountId" placeholder="Oanda Account ID">' +
                  '<input type="password" id="oandaTradeKey" placeholder="Token">' +
                  '<button id="connect_to_oanda" class="ui button">Connect</button>' +
                '</div>' +
              '</div>' +
              '<div class="description">' +
                '<table id="oanda_trades_list" class="cell-border" cellspacing="0">' +
                '</table>' +
              '</div>' +
            '</div>' +
            '<div class="actions">' +
              '<div class="ui toggle checkbox">' +
                '<input type="checkbox" id="copy_trading">' +
                '<label></label>' +
              '</div>' +
              '<div class="ui button" id="close_oanda_dashboard">Close</div>' +
            '</div>' +
          '</div>'

          $("#reserved_zone").append(panel)

          $("#dropdownOandaDemo").dropdown()
          $("#copy_trading").checkbox()

          $("#connect_to_oanda").on("click", function () {
            if (that.bMonitoring) {
              $("#copy_trading").prop("checked", false)
              $("#connect_to_oanda").html("Connect")
              that.removeSocket()
            } else {
              that.oandaDemo = $("#oandaDemo").val() == "" || $("#oandaDemo").val() == "true"
              that.oandaAccountId = $("#oandaAccountId").val().trim()
              that.oandaTradeKey = $("#oandaTradeKey").val().trim()

              if (that.oandaAccountId != "" && that.oandaTradeKey != "") {
                $("#connect_to_oanda").prop("disabled", true)
                $("#connect_to_oanda").html("Disconnect")
                that.setupSocket()
              }
            }
          })

          $("#copy_trading").on("change", function () {
            if (!that.bMonitoring) {
              $("#copy_trading").prop("checked", false)
            }
            that.bCopyTrading = $("#copy_trading").prop("checked")
            printMessage(that.bCopyTrading)
          })

          $("#close_oanda_dashboard").on("click", function () {
            $("#oanda_trades_dashboard").modal("hide")
          })
        }

        if (!$.fn.dataTable.isDataTable("#oanda_trades_list")) {
          $("#oanda_trades_list").DataTable({
            data: [],
            columns: [
              {title: "Instrument"},
              {title: "Units"},
              {title: "Type"}
            ],
            ordering: false,
            searching: false,
            bPaginate: false,
            bLengthChange: false,
            bFilter: false,
            bInfo: false,
            scrollY: '50vh',
            scrollCollapse: true,
            paging: false,
            columnDefs: [
              {width: "40%", targets: 0, className: "dt-body-left"},
              {width: "30%", targets: 1, className: "dt-body-left"},
              {width: "30%", targets: 2, className: "dt-body-left"},
              {targets: [0, 1, 2], className: "dt-head-left"}
            ]
          })
        }

        if (typeof window.oandaOrderAPI != "undefined") {
          window.oandaOrderAPI.trades.listOpen(that.oandaAccountId)
          .then(function (res) {
            that.renderTrades(res.trades)
          })
          .catch(function () {})
        }

        $("#oanda_trades_dashboard").modal({autofocus:false}).modal("show")
      }
    }
  }

  window.oandaOrderApiLoader.init()
},
function (context) { // Deinit()
},
function (context) { // OnTick()
},
function (context) { // OnTransaction()
  if (typeof window.oandaOrderApiLoader != "undefined" && window.oandaOrderApiLoader.bCopyTrading) {
    var transType = getLatestTransType(context)
    var trade = getLatestTrans(context)
    var tradeSymbolName = getSymbolName(trade)
    var tradeOrderType = getOrderType(trade)
    var tradeLots = getOpenLots(trade)

    if (transType == "Open Trade") {
      if (tradeOrderType == ORDER_TYPE.OP_BUY || tradeOrderType == ORDER_TYPE.OP_BUYLIMIT || tradeOrderType == ORDER_TYPE.OP_BUYSTOP) {
        window.oandaOrderApiLoader.sendOrder(tradeSymbolName, ORDER_TYPE.OP_BUY, tradeLots)
      } else if (tradeOrderType == ORDER_TYPE.OP_SELL || tradeOrderType == ORDER_TYPE.OP_SELLLIMIT || tradeOrderType == ORDER_TYPE.OP_SELLSTOP) {
        window.oandaOrderApiLoader.sendOrder(tradeSymbolName, ORDER_TYPE.OP_SELL, tradeLots)
      }
    } else if (transType == "Trade Closed") {
      if (tradeOrderType == ORDER_TYPE.OP_BUY || tradeOrderType == ORDER_TYPE.OP_BUYLIMIT || tradeOrderType == ORDER_TYPE.OP_BUYSTOP) {
        window.oandaOrderApiLoader.sendOrder(tradeSymbolName, ORDER_TYPE.OP_SELL, tradeLots)
      } else if (tradeOrderType == ORDER_TYPE.OP_SELL || tradeOrderType == ORDER_TYPE.OP_SELLLIMIT || tradeOrderType == ORDER_TYPE.OP_SELLSTOP) {
        window.oandaOrderApiLoader.sendOrder(tradeSymbolName, ORDER_TYPE.OP_BUY, tradeLots)
      }
    }
  }
})
