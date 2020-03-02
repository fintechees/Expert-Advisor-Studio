registerEA(
"verify_custom_indicator_and_data",
"A test EA to verify the custom indicator and the data(v1.0)",
[],
function (context) { // Init()
			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			window.smaHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, "H1", "sma", [{
			    name: "period",
			    value: 20
			}])
		},
function (context) { // Deinit()
			var arrSma = getData(context, window.smaHandle, "sma")

            console.log(arrSma.length)
            for (var i in arrSma){
            	console.log(i + ", " + arrSma[i])
            }

		},
function (context) { // OnTick()
	var arrSma = getData(context, window.smaHandle, "sma")

	if (arrSma.length == 356) {
		for (var i in arrSma){
			console.log(i + ", " + arrSma[i])
		}

	}

})
