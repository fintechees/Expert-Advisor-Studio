registerEA(
  "equity_curve_viewer",
  "An EA used for watching the information about the equity and the balance of an account(v1.0)",
  [{ // parameters
    name: "symbolName",
    value: "EUR/USD",
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  },{
    name: "timeFrame",
    value: TIME_FRAME.H1,
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  }],
  function (context) { // Init()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)
    var symbolName = getEAParameter(context, "symbolName")
    var timeFrame = getEAParameter(context, "timeFrame")

    context.tradingManager = {
      equity: 0,
      balance: 0,
      getAccountInfo: function (account) {
        this.equity = getEquityOfAccount(account)
        this.balance = getBalanceOfAccount(account) + getPLOfAccount(account)

        var arrEquity = window.accounts[context.chartHandle].equity
        var arrBalance = window.accounts[context.chartHandle].balance
        var arrEquityLen = arrEquity.length
        for (var i = arrEquityLen; i < context.arrEquityLen; i++) {
          arrEquity.push(0)
          arrBalance.push(0)
        }

        arrEquity[context.arrEquityLen - 1] = this.equity
        arrBalance[context.arrEquityLen - 1] = this.balance
      }
    }

    context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, timeFrame)
    if (typeof window.accounts == "undefined") {
      window.accounts = []
    }
    if (typeof window.accounts[context.chartHandle] == "undefined") {
      window.accounts[context.chartHandle] = {
        equity: [],
        balance: []
      }
    } else {
      window.accounts[context.chartHandle].equity = []
      window.accounts[context.chartHandle].balance = []
    }
    context.equityHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, timeFrame, "equity_curve", [{
      name: "chartHandle", value: context.chartHandle}])
  },
  function (context) { // Deinit()
  },
  function (context) { // OnTick()
    var arrTime = getData(context, context.chartHandle, DATA_NAME.TIME)
    context.arrEquityLen = arrTime.length

    var account = getAccount(context, 0)

    context.tradingManager.getAccountInfo(account)
  },
  function (context) { // OnTransaction()
  }
)
