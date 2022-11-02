registerEA(
  "callee",
  "A test EA playing the role as a step in the workflow(v1.0)",
  [{
    name: "symbolName",
    value: "EUR/USD",
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  }],
  function(context) { // Init()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)
    var symbolName = getEAParameter(context, "symbolName")

    context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M5)
  },
  function(context) { // Deinit()
  },
  function(context) { // OnTick()
  },
  function(context) { // OnTransaction()
  }
)
