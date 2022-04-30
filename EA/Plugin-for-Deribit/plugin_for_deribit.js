registerEA(
"cryptocurrency_option_trading_platform",
"A plugin to trade cryptocurrency options(v0.08)",
[{
	name: "interval",
	value: 30,
	required: true,
	type: "Integer",
	range: null,
	step: null
}],
function (context) { // Init()
      var orderBookId = null
      var loaded = false
      var latestHb = null

      var interval = getEAParameter(context, "interval") * 1000

      function convertOptionName (rawName) {
        var name = rawName.split("-")
        var year = name[1].substring(5, 7)
        var mon = name[1].substring(2, 5)
        var dt = name[1].substring(0, 2)
        var month = "00"
        if (mon == "JAN") {
          month = "01"
        } else if (mon == "FEB") {
          month = "02"
        } else if (mon == "MAR") {
          month = "03"
        } else if (mon == "APR") {
          month = "04"
        } else if (mon == "MAY") {
          month = "05"
        } else if (mon == "JUN") {
          month = "06"
        } else if (mon == "JUL") {
          month = "07"
        } else if (mon == "AUG") {
          month = "08"
        } else if (mon == "SEP") {
          month = "09"
        } else if (mon == "OCT") {
          month = "10"
        } else if (mon == "NOV") {
          month = "11"
        } else if (mon == "DEC") {
          month = "12"
        }
        var expiration = parseInt(year + month + dt)
        var optionName2 = name[0] + "-" + dt + mon + year

        return {
          optionName: name[0] + "-" + expiration,
          optionName2: optionName2,
          instrument: name[0],
          expiration: expiration,
          year: year,
          month: month,
          dt: dt,
          strikePrice: parseFloat(name[2]),
          callOrPut: name[3]
        }
      }

      function parseOrderBook (data) {
        var orderBookData = []

        for (var i in data) {
          var optionName = convertOptionName(data[i].instrument_name)

          if (typeof orderBookData[optionName.optionName] == "undefined") {
            orderBookData[optionName.optionName] = {
              optionName: optionName.optionName,
              optionName2: optionName.optionName2,
              instrument: optionName.instrument,
              expiration: optionName.expiration,
              year: optionName.year,
              month: optionName.month,
              dt: optionName.dt,
              prices: [],
              arrPrices: []
            }
          }

          if (typeof orderBookData[optionName.optionName].prices[optionName.strikePrice] == "undefined") {
            orderBookData[optionName.optionName].prices[optionName.strikePrice] = {
              strikePrice: optionName.strikePrice,
              bidC: optionName.callOrPut == "C" ? data[i].bid_price : null,
              askC: optionName.callOrPut == "C" ? data[i].ask_price : null,
              bidP: optionName.callOrPut == "P" ? data[i].bid_price : null,
              askP: optionName.callOrPut == "P" ? data[i].ask_price : null
            }
          } else {
            var price = orderBookData[optionName.optionName].prices[optionName.strikePrice]
            if (price.bidC == null) {
              price.bidC = optionName.callOrPut == "C" ? data[i].bid_price : null
            }
            if (price.askC == null) {
              price.askC = optionName.callOrPut == "C" ? data[i].ask_price : null
            }
            if (price.bidP == null) {
              price.bidP = optionName.callOrPut == "P" ? data[i].bid_price : null
            }
            if (price.askP == null) {
              price.askP = optionName.callOrPut == "P" ? data[i].ask_price : null
            }
          }
        }

        for (var i in orderBookData) {
          for (var j in orderBookData[i].prices) {
            orderBookData[i].arrPrices.push(orderBookData[i].prices[j])
          }
        }

        var expirations = []

        for (var i in orderBookData) {
          expirations.push({
            expiration: orderBookData[i].expiration,
            optionName: orderBookData[i].optionName,
            optionName2: orderBookData[i].optionName2
          })
        }

        expirations.sort(function (a, b) {return a.expiration - b.expiration})

        return {
          expirations: expirations,
          orderBookData: orderBookData
        }
      }

      function showOptions (expirations) {
        var optionsHtml = ""

        for (var i in expirations) {
          optionsHtml += '<div class="item" data-value="' + expirations[i].optionName + '">' + expirations[i].optionName2 + '</div>'
        }

        $("#crypto_options").empty()
        $("#crypto_options").html(optionsHtml)
        $("#crypto_options_dashboard").find(".ui.dropdown").dropdown("clear")
        $("#crypto_options_dashboard").find(".ui.dropdown").dropdown({
          autoFocus: false,
          showOnFocus: false,
          onChange: function (val) {
            for (var i in window.subscriptionIds) {
              unsubscribeIt(i)
            }
            window.subscriptionIds = []
            showOrderBook(val, window.orderBookData.orderBookData)
          }
        })
      }

      function checkHb () {
        if (new Date().getTime() - latestHb > interval) {
          printMessage("Timeout... Refreshing...")
          if (typeof window.wsockOpened != "undefined" && window.wsockOpened) {
            loaded = true
          }
          initCryptoOptionsWS()
        }
      }

      function showOrderBook (optionName, orderBookData) {
        if ($.fn.dataTable.isDataTable("#crypto_options_orderbook")) {
    			$("#crypto_options_orderbook").DataTable().clear().draw()

          for (var i in orderBookData) {
            if (orderBookData[i].optionName == optionName) {
              for (var j in orderBookData[i].arrPrices) {
                $("#crypto_options_orderbook").DataTable().row.add([
                  orderBookData[i].arrPrices[j].bidC != null ? orderBookData[i].arrPrices[j].bidC : "",
                  orderBookData[i].arrPrices[j].askC != null ? orderBookData[i].arrPrices[j].askC : "",
                  orderBookData[i].arrPrices[j].strikePrice,
                  orderBookData[i].arrPrices[j].bidP != null ? orderBookData[i].arrPrices[j].bidP : "",
                  orderBookData[i].arrPrices[j].askP != null ? orderBookData[i].arrPrices[j].askP : "",
                  0,
                  0,
                  0,
                  0
                ]).draw(false)

                subscribeIt(orderBookData[i].optionName2 + "-" + orderBookData[i].arrPrices[j].strikePrice + "-" + "C")
                subscribeIt(orderBookData[i].optionName2 + "-" + orderBookData[i].arrPrices[j].strikePrice + "-" + "P")
              }
            }
          }
        }
      }

      function initCryptoOptionsWS () {
        $("#disconnect_ws").html("Loading...")
        $("#disconnect_ws").addClass("disabled")
        $("#disconnect_ws").addClass("loading")

        if (typeof window.wsock != "undefined" && typeof window.subscriptionIds != "undefined") {
          for (var i in window.subscriptionIds) {
            unsubscribeIt(i)
          }
        }

        window.wsock = new WebSocket("wss://test.deribit.com/ws/api/v2")
        window.wsockOpened = false

        window.wsock.onmessage = function (e) {
          var resData = JSON.parse(e.data)
          if (orderBookId != null && typeof resData.id != "undefined" && orderBookId == resData.id) {
            window.orderBookData = parseOrderBook(resData.result)
            showOptions(window.orderBookData.expirations)
            showOrderBook(window.orderBookData.expirations[0].optionName, window.orderBookData.orderBookData)
            $("#disconnect_ws").html("Disconnect")
            $("#disconnect_ws").removeClass("loading")
            $("#disconnect_ws").removeClass("disabled")
          } else if (typeof resData.params != "undefined" &&
            typeof resData.params.data != "undefined" && typeof resData.params.data.instrument_name != "undefined" &&
            typeof window.subscriptionIds[resData.params.data.instrument_name] != "undefined") {

            latestHb = new Date().getTime()
            var name = resData.params.data.instrument_name.split("-")
            var bid = (resData.params.data.best_bid_price != null && resData.params.data.best_bid_price != 0) ? resData.params.data.best_bid_price : ""
            var ask = (resData.params.data.best_ask_price != null && resData.params.data.best_ask_price != 0) ? resData.params.data.best_ask_price : ""

            var table = $("#crypto_options_orderbook").DataTable()
            var tb = $("#crypto_options_orderbook").dataTable()

            table.columns().eq(0).each(function (index) {
              if (index == 2) {
                var column = table.column(index).data()
                for (var i in column) {
                  var rowId = parseInt(i)

                  var row = table.row(rowId).data()

                  if (column[i] == parseFloat(name[2])) {
                    if (name[3] == "C") {
                      if (row[0] != null && row[0] != "" && bid != "") {
                        tb.fnUpdate(bid - row[0], rowId, 5, false, false)
                      } else {
                        tb.fnUpdate(0, rowId, 5, false, false)
                      }
                      if (row[1] != null && row[1] != "" && ask != "") {
                        tb.fnUpdate(ask - row[1], rowId, 6, false, false)
                      } else {
                        tb.fnUpdate(0, rowId, 6, false, false)
                      }
                      tb.fnUpdate(bid, rowId, 0, false, false)
                      tb.fnUpdate(ask, rowId, 1, false, false)
                    } else if (name[3] == "P") {
                      if (row[3] != null && row[3] != "" && bid != "") {
                        tb.fnUpdate(bid - row[3], rowId, 7, false, false)
                      } else {
                        tb.fnUpdate(0, rowId, 7, false, false)
                      }
                      if (row[4] != null && row[4] != "" && ask != "") {
                        tb.fnUpdate(ask - row[4], rowId, 8, false, false)
                      } else {
                        tb.fnUpdate(0, rowId, 8, false, false)
                      }
                      tb.fnUpdate(bid, rowId, 3, false, false)
                      tb.fnUpdate(ask, rowId, 4, false, false)
                    }
                    break
                  }
                }
              }
            })
          }
        }

        window.wsock.onopen = function () {
          latestHb = new Date().getTime()
          window.wsockOpened = true
          if (loaded) {
            for (var i in window.subscriptionIds) {
              subscribeIt(i)
            }

            $("#disconnect_ws").html("Disconnect")
            $("#disconnect_ws").removeClass("loading")
            $("#disconnect_ws").removeClass("disabled")
          } else {
            getOrderBook("BTC")
          }
        }
      }

      function disconnectCryptoOptionsWS () {
        if (typeof window.wsockOpened != "undefined" && window.wsockOpened) {
          $("#disconnect_ws").html("Disconnected")
          $("#disconnect_ws").addClass("disabled")

          for (var i in window.subscriptionIds) {
            unsubscribeIt(i)
          }

          if (typeof window.wsTimer != "undefined") {
            clearInterval(window.wsTimer)
          }
          window.wsock.close()
          delete window.wsock
          delete window.wsockOpened
          delete window.wsTimer
        }
      }

      function getOrderBook (currency) {
        if (typeof window.wsockOpened != "undefined" && window.wsockOpened) {
          $("#disconnect_ws").html("Loading...")
          $("#disconnect_ws").addClass("disabled")
          $("#disconnect_ws").addClass("loading")

          for (var i in window.subscriptionIds) {
            unsubscribeIt(i)
          }
          window.subscriptionIds = []

          orderBookId = new Date().getTime()

          var msg = {
            jsonrpc: "2.0",
            id: orderBookId,
            method: "public/get_book_summary_by_currency",
            params: {
              currency: currency,
              kind: "option"
            }
          }

          window.wsock.send(JSON.stringify(msg))
        }
      }

      function subscribeIt (instrument) {
        if (typeof window.wsockOpened != "undefined" && window.wsockOpened) {
          window.subscriptionIds[instrument] = new Date().getTime()

          var msg = {
            jsonrpc: "2.0",
            id: window.subscriptionIds[instrument],
            method: "public/subscribe",
            params: {
              channels: [
                "ticker." + instrument + ".raw" // "deribit_price_index.btc_usd"
              ]
            }
          }

          window.wsock.send(JSON.stringify(msg))
        }
      }

      function unsubscribeIt (instrument) {
        if (typeof window.wsockOpened != "undefined" && window.wsockOpened) {
          var msg = {
            jsonrpc: "2.0",
            id: new Date().getTime(),
            method: "public/unsubscribe",
            params: {
              channels: [
                "ticker." + instrument + ".raw" // "deribit_price_index.btc_usd"
              ]
            }
          }

          window.wsock.send(JSON.stringify(msg))
        }
      }

      if (typeof $("#crypto_options_dashboard").html() == "undefined") {
        var panel = '<div class="ui modal" id="crypto_options_dashboard">' +
          '<i class="close icon"></i>' +
          '<div class="content">' +
            '<div class="ui button" id="get_btc">BTC</div>' +
            '<div class="ui button" id="get_eth">ETH</div>' +
            '<div class="ui selection dropdown" style="width:200px">' +
              '<input type="hidden" name="crypto_option">' +
              '<i class="dropdown icon"></i>' +
              '<div class="default text" id="current_crypto_option">Options</div>' +
              '<div class="menu" id="crypto_options">' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="content">' +
            '<div class="description">' +
              '<table id="crypto_options_orderbook" class="cell-border" cellspacing="0">' +
        			'</table>' +
            '</div>' +
          '</div>' +
          '<div class="actions">' +
            '<div class="ui button" id="disconnect_ws">Disconnect</div>' +
          '</div>' +
        '</div>'

        $("#reserved_zone").append(panel)
        window.subscriptionIds = []
      } else {
        loaded = true
      }

      if (!$.fn.dataTable.isDataTable("#crypto_options_orderbook")) {
  			$("#crypto_options_orderbook").DataTable({
  				data: [],
  				columns: [
  					{title: "Bid(C)",
              render: function (data, type, row) {
  							if (row[5] == 0) {
                  return '<p style = "color:#222222" >' + data + '</p>'
                } else if (row[5] > 0) {
  								return '<p style = "color:#21BA45" >' + data + '</p>'
  							} else {
  								return '<p style = "color:#DB2828" >' + data + '</p>'
  							}
  						}
            },
  					{title: "Ask(C)",
              render: function (data, type, row) {
                if (row[6] == 0) {
                  return '<p style = "color:#222222" >' + data + '</p>'
                } else if (row[6] > 0) {
                  return '<p style = "color:#21BA45" >' + data + '</p>'
                } else {
                  return '<p style = "color:#DB2828" >' + data + '</p>'
                }
              }
            },
            {title: "Strike Price"},
  					{title: "Bid(P)",
              render: function (data, type, row) {
                if (row[7] == 0) {
                  return '<p style = "color:#222222" >' + data + '</p>'
                } else if (row[7] > 0) {
                  return '<p style = "color:#21BA45" >' + data + '</p>'
                } else {
                  return '<p style = "color:#DB2828" >' + data + '</p>'
                }
              }
            },
  					{title: "Ask(P)",
              render: function (data, type, row) {
                if (row[8] == 0) {
                  return '<p style = "color:#222222" >' + data + '</p>'
                } else if (row[8] > 0) {
                  return '<p style = "color:#21BA45" >' + data + '</p>'
                } else {
                  return '<p style = "color:#DB2828" >' + data + '</p>'
                }
              }
            },
            {title: "Diff(BC)"},
            {title: "Diff(AC)"},
            {title: "Diff(BP)"},
            {title: "Diff(AP)"}
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
            {width: "20%", targets: 0, className: "dt-body-right"},
            {width: "20%", targets: 1, className: "dt-body-right"},
            {width: "20%", targets: 2, className: "dt-body-center"},
            {width: "20%", targets: 3, className: "dt-body-right"},
            {width: "20%", targets: 4, className: "dt-body-right"},
            {width: "20%", targets: [0, 1, 2, 3, 4], className: "dt-head-center"},
            {targets: [5, 6, 7, 8], visible: false}
          ]
  			})
  		}

      $("#get_btc").on("click", function () {
        getOrderBook("BTC")
      })
      $("#get_eth").on("click", function () {
        getOrderBook("ETH")
      })
      $("#disconnect_ws").on("click", function () {
        disconnectCryptoOptionsWS()
      })

      initCryptoOptionsWS()

      $("#crypto_options_dashboard").modal("show")

      if (typeof window.wsTimer != "undefined") {
        clearInterval(window.wsTimer)
      }
      window.wsTimer = setInterval(function () {
        checkHb()
      }, interval)
		},
function (context) { // Deinit()
		},
function (context) { // OnTick()
		})
