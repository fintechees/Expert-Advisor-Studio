registerEA(
  "unrealized_pl_viewer",
  "An EA used for watching the information about the unrealized PL of an account(v1.0)",
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
      totalPlL: 0,
      totalPlS: 0,
      getPosInfo: function (brokerNm, accId, symbolNm) {
        this.totalPlL = 0
        this.totalPlS = 0

        var cnt = getOpenTradesListLength(context)
        for (var i = cnt - 1; i >= 0; i--) {
          var openTrade = getOpenTrade(context, i)
          var symbol = getSymbolName(openTrade)

          if (symbol == symbolNm) {
            var orderType = getOrderType(openTrade)

            if (orderType == ORDER_TYPE.OP_BUY) {
              this.totalPlL += getUnrealizedPL(openTrade)
            } else {
              this.totalPlS += getUnrealizedPL(openTrade)
            }
          }
        }

        var arrTotalPl = window.accounts[context.chartHandle].totalPl
        var arrTotalPlL = window.accounts[context.chartHandle].totalPlL
        var arrTotalPlS = window.accounts[context.chartHandle].totalPlS
        var arrTotalPlLen = arrTotalPl.length
        for (var i = arrTotalPlLen; i < context.arrUnrealizedPlLen; i++) {
          arrTotalPl.push(0)
          arrTotalPlL.push(0)
          arrTotalPlS.push(0)
        }

        arrTotalPl[context.arrUnrealizedPlLen - 1] = this.totalPlL + this.totalPlS
        arrTotalPlL[context.arrUnrealizedPlLen - 1] = this.totalPlL
        arrTotalPlS[context.arrUnrealizedPlLen - 1] = this.totalPlS
      }
    }

    context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, timeFrame)
    if (typeof window.accounts == "undefined") {
      window.accounts = []
    }
    window.accounts[context.chartHandle] = {
      totalPl: [],
      totalPlL: [],
      totalPlS: []
    }
    context.unrealizedPlHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, timeFrame, "unrealized_pl", [{
      name: "chartHandle", value: context.chartHandle}])
  },
  function (context) { // Deinit()
  },
  function (context) { // OnTick()
    var arrTime = getData(context, context.chartHandle, DATA_NAME.TIME)
    context.arrUnrealizedPlLen = arrTime.length

    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)
    var symbolName = getEAParameter(context, "symbolName")

    context.tradingManager.getPosInfo(brokerName, accountId, symbolName)
  },
  function (context) { // OnTransaction()
  }
)
