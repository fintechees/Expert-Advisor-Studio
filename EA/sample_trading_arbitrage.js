registerEA(
		"sample_trading_arbitrage",
		"Two accounts signed up on the different servers are required to trade arbitrage. Additionally please make sure that you have signed in to both accounts and logged out from the accounts in investor mode.(v1.04)",
		[],// parameters
		function (context) { // Init()
			var account1 = getAccount(context, 0)
			var account2 = getAccount(context, 1)

			var acc1 = {
				brokerName: getBrokerNameOfAccount(account1),
				accountId: getAccountIdOfAccount(account1),
				symbolName: "EUR/USD"
			}
			var acc2 = {
				brokerName: getBrokerNameOfAccount(account2),
				accountId: getAccountIdOfAccount(account2),
				symbolName: "EUR/USD"
			}

			getQuotes (context, acc1.brokerName, acc1.accountId, acc1.symbolName)
			getQuotes (context, acc2.brokerName, acc2.accountId, acc2.symbolName)

			context.acc1 = acc1
			context.acc2 = acc2
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
			var currTime = new Date().getTime()
			if (typeof context.currTime == "undefined") {
				context.currTime = currTime
			} else if (context.currTime <= currTime - 1000) {
				context.currTime = currTime
			} else {
				return
			}

			var acc1 = context.acc1
			var acc2 = context.acc2

			var ask1 = null
			var ask2 = null
			var bid1 = null
			var bid2 = null

			try {
				ask1 = getAsk(context, acc1.brokerName, acc1.accountId, acc1.symbolName)
				ask2 = getAsk(context, acc2.brokerName, acc2.accountId, acc2.symbolName)
				bid1 = getBid(context, acc1.brokerName, acc1.accountId, acc1.symbolName)
				bid2 = getBid(context, acc2.brokerName, acc2.accountId, acc2.symbolName)
			} catch (e) {
				// This try-catch is used to bypass the "error throw" when you start the EA too early to call getAsk or getBid(at that time, bid or ask may be not ready yet.)
				printErrorMessage(e.message)
				return
			}

			var volume = 0.01

			if (ask1 < bid2) {
				var tradeNum = getOpenTradesListLength(context)

				var acc1TradeId = null
				var acc2TradeId = null

				for (var i = tradeNum - 1; i >= 0; i--) {
					var trade = getOpenTrade(context, i)
					var brokerName = getBrokerName(trade)
					var accountId = getAccountId(trade)
					var tradeId = getTradeId(trade)
					var orderType = getOrderType(trade)
					if (brokerName == acc1.brokerName && accountId == acc1.accountId && orderType == ORDER_TYPE.OP_SELL) {
						acc1TradeId = tradeId
					}
					if (brokerName == acc2.brokerName && accountId == acc2.accountId && orderType == ORDER_TYPE.OP_BUY) {
						acc2TradeId = tradeId
					}
				}

				if (acc1TradeId == null) {
					sendOrder(acc1.brokerName, acc1.accountId, acc1.symbolName, ORDER_TYPE.OP_BUY, 0, 0, volume, 0, 0, "", 0, 0)
				} else {
					closeTrade(acc1.brokerName, acc1.accountId, acc1TradeId, 0, 0)
				}

				if (acc2TradeId == null) {
					sendOrder(acc2.brokerName, acc2.accountId, acc2.symbolName, ORDER_TYPE.OP_SELL, 0, 0, volume, 0, 0, "", 0, 0)
				} else {
					closeTrade(acc2.brokerName, acc2.accountId, acc2TradeId, 0, 0)
				}
			} else if (ask2 < bid1) {
				var tradeNum = getOpenTradesListLength(context)

				var acc1TradeId = null
				var acc2TradeId = null

				for (var i = tradeNum - 1; i >= 0; i--) {
					var trade = getOpenTrade(context, i)
					var brokerName = getBrokerName(trade)
					var accountId = getAccountId(trade)
					var tradeId = getTradeId(trade)
					var orderType = getOrderType(trade)
					if (brokerName == acc2.brokerName && accountId == acc2.accountId && orderType == ORDER_TYPE.OP_SELL) {
						acc2TradeId = tradeId
					}
					if (brokerName == acc1.brokerName && accountId == acc1.accountId && orderType == ORDER_TYPE.OP_BUY) {
						acc1TradeId = tradeId
					}
				}

				if (acc2TradeId == null) {
					sendOrder(acc2.brokerName, acc2.accountId, acc2.symbolName, ORDER_TYPE.OP_BUY, 0, 0, volume, 0, 0, "", 0, 0)
				} else {
					closeTrade(acc2.brokerName, acc2.accountId, acc2TradeId, 0, 0)
				}

				if (acc1TradeId == null) {
					sendOrder(acc1.brokerName, acc1.accountId, acc1.symbolName, ORDER_TYPE.OP_SELL, 0, 0, volume, 0, 0, "", 0, 0)
				} else {
					closeTrade(acc1.brokerName, acc1.accountId, acc1TradeId, 0, 0)
				}
			}
		}
	)
