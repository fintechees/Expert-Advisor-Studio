#define INPUT_NUM 10
#define HIDDEN_NUM 10
#define NN_NAME "testcnn"

input string ext_strSymbol = "EUR/USD";
input int ext_iPeriod = 60;
input double ext_dblVolume = 0.01;

datetime currTime = 0;

int cntL = 0;
int cntS = 0;
double totalPlL = 0;
double totalPlS = 0;
double highestPriceL = -DBL_MAX;
double lowestPriceL = DBL_MAX;
double highestPriceS = -DBL_MAX;
double lowestPriceS = DBL_MAX;

datetime upTime = 0;
datetime downTime = 0;
datetime prevClsUpTime = 0;
datetime prevClsDownTime = 0;

void getPosInfo(datetime currTime) {
  cntL = 0;
  cntS = 0;
  totalPlL = 0;
  totalPlS = 0;
  highestPriceL = -DBL_MAX;
  lowestPriceL = DBL_MAX;
  highestPriceS = -DBL_MAX;
  lowestPriceS = DBL_MAX;

  int cnt = OrdersTotal();
  for (int i = cnt - 1; i >= 0; i--) {
    if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) return;

    if (StringCompare(Symbol(), OrderSymbol()) == 0) {
      double openPrice = OrderOpenPrice();
      datetime openTime = OrderOpenTime();

      if (OrderType() == OP_BUY) {
        cntL++;
        totalPlL += OrderProfit();
        if (openPrice > highestPriceL) {
          highestPriceL = openPrice;
        }
        if (openPrice < lowestPriceL) {
          lowestPriceL = openPrice;
        }

        if (openTime > currTime) {
          upTime = currTime;
        }
      }
      if (OrderType() == OP_SELL) {
        cntS++;
        totalPlS += OrderProfit();
        if (openPrice > highestPriceS) {
          highestPriceS = openPrice;
        }
        if (openPrice < lowestPriceS) {
          lowestPriceS = openPrice;
        }

        if (openTime > currTime) {
          downTime = currTime;
        }
      }
    }
  }
}

bool trade(int odrType, double volume, bool bOpen) {
  bool res = false;

  if (bOpen) {
    if (odrType == OP_BUY) {
      OrderSend(ext_strSymbol, OP_BUY, volume, 0, 0, 0, 0, "", 0, 0, Green);
      res = true;
    } else if (odrType == OP_SELL) {
      OrderSend(ext_strSymbol, OP_SELL, volume, 0, 0, 0, 0, "", 0, 0, Red);
      res = true;
    }
  } else {
    bool bClosed = false;

    if (odrType == OP_BUY) {
      int cnt = OrdersTotal();

      for (int i = cnt - 1; i >= 0; i--) {
        if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) return false;

        if (StringCompare(Symbol(), OrderSymbol()) == 0 && OrderType() == OP_BUY) {
          OrderClose(OrderTicket(), volume, 0, 0, Green);
          bClosed = true;
        }
      }
    } else if (odrType == OP_SELL) {
      int cnt = OrdersTotal();

      for (int i = cnt - 1; i >= 0; i--) {
        if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) return false;

        if (StringCompare(Symbol(), OrderSymbol()) == 0 && OrderType() == OP_SELL) {
          OrderClose(OrderTicket(), volume, 0, 0, Red);
          bClosed = true;
        }
      }
    }

    if (bClosed) {
      res = true;
    }
  }

  return res;
}

int OnInit (void) {
  PreventCleanUp();
  LoadCNN(NN_NAME);
  return 0;
}

void OnTick(void) {
  if (currTime == iTime(ext_strSymbol, ext_iPeriod, 0)) return;
  currTime = iTime(ext_strSymbol, ext_iPeriod, 0);

  double arr[INPUT_NUM];
  double highest = -DBL_MAX;
  double lowest = DBL_MAX;
  for (int i = 1; i <= INPUT_NUM; i++) {
    arr[i - 1] = iMACD(ext_strSymbol, ext_iPeriod, 12, 26, 9, PRICE_CLOSE, MODE_MAIN, i);
    if (arr[i - 1] > highest) {
      highest = arr[i - 1];
    }
    if (arr[i - 1] < lowest) {
      lowest = arr[i - 1];
    }
  }
  double height = highest - lowest;
  if (height <= 0) return;

  double input[INPUT_NUM];

  for (int i = 0; i < INPUT_NUM; i++) {
    input[i] = (arr[i] - lowest) / height;
  }

  double result = RunCNN(NN_NAME, input, INPUT_NUM);
  int signal = result >= 0.5 ? 1 : 0;

  getPosInfo(currTime);

  if (upTime > 0 || downTime > 0) {
    if (signal == 1) {
      if (trade(OP_SELL, ext_dblVolume, false)) {
        downTime = 0;
      }
    } else {
      if (trade(OP_BUY, ext_dblVolume, false)) {
        upTime = 0;
      }
    }

    return;
  }

  if (signal == 1) {
    if (trade(OP_BUY, ext_dblVolume, true)) {
      upTime = currTime;
    }
  } else {
    if (trade(OP_SELL, ext_dblVolume, true)) {
      downTime = currTime;
    }
  }
}

void OnDeinit (const int) {
}
