registerEA(
		"copy_trading_for_oanda",
		"An EA to copy trading for Oanda(v1.02)",
		[],
		function (context) { // Init()
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
		},
		function (context) { // OnTransaction()
		  if (typeof window.pluginForOanda != "undefined") {
		    var transType = getLatestTransType(context)

		    if (transType == "Open Trade") {
					var trade = getLatestTrans(context)
			    var tradeSymbolName = getSymbolName(trade)
			    var tradeOrderType = getOrderType(trade)
			    var tradeLots = getOpenLots(trade)

		      if (tradeOrderType == ORDER_TYPE.OP_BUY || tradeOrderType == ORDER_TYPE.OP_BUYLIMIT || tradeOrderType == ORDER_TYPE.OP_BUYSTOP) {
		        window.pluginForOanda.sendOrder(tradeSymbolName, ORDER_TYPE.OP_BUY, tradeLots)
		      } else if (tradeOrderType == ORDER_TYPE.OP_SELL || tradeOrderType == ORDER_TYPE.OP_SELLLIMIT || tradeOrderType == ORDER_TYPE.OP_SELLSTOP) {
		        window.pluginForOanda.sendOrder(tradeSymbolName, ORDER_TYPE.OP_SELL, tradeLots)
		      }
		    } else if (transType == "Trade Closed") {
					var trade = getLatestTrans(context)
			    var tradeSymbolName = getSymbolName(trade)
			    var tradeOrderType = getOrderType(trade)
			    var tradeLots = getOpenLots(trade)

		      if (tradeOrderType == ORDER_TYPE.OP_BUY || tradeOrderType == ORDER_TYPE.OP_BUYLIMIT || tradeOrderType == ORDER_TYPE.OP_BUYSTOP) {
		        window.pluginForOanda.sendOrder(tradeSymbolName, ORDER_TYPE.OP_SELL, tradeLots)
		      } else if (tradeOrderType == ORDER_TYPE.OP_SELL || tradeOrderType == ORDER_TYPE.OP_SELLLIMIT || tradeOrderType == ORDER_TYPE.OP_SELLSTOP) {
		        window.pluginForOanda.sendOrder(tradeSymbolName, ORDER_TYPE.OP_BUY, tradeLots)
		      }
		    }
		  }
		}
	)
