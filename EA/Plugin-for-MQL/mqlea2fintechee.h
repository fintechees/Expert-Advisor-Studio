#include <stdio.h>
#include <stdarg.h>
#include <string>
#include <sstream>
#include <iostream>
#include <map>
#include <vector>
#include <algorithm>
#include <climits>
#include <float.h>
#include <unistd.h>
#include <iomanip>
#include <ctime>
#include <cmath>
#include <chrono>
#include <emscripten.h>
using namespace std;

typedef long datetime;
typedef int color;

enum ENUM_TIMEFRAMES {
  PERIOD_CURRENT = 0,
  PERIOD_M1 = 1,
  PERIOD_M5 = 5,
  PERIOD_M15 = 15,
  PERIOD_M30 = 30,
  PERIOD_H1 = 60,
  PERIOD_H4 = 240,
  PERIOD_D1 = 1440,
  PERIOD_W1 = 10080,
  PERIOD_MN1 = 43200
};
enum ENUM_APPLIED_PRICE {
  PRICE_CLOSE = 0,
  PRICE_OPEN = 1,
  PRICE_HIGH = 2,
  PRICE_LOW = 3,
  PRICE_MEDIAN = 4,
  PRICE_TYPICAL = 5,
  PRICE_WEIGHTED = 6
};
enum ENUM_MA_METHOD {
  MODE_SMA = 0,
  MODE_EMA = 1,
  MODE_SMMA = 2,
  MODE_LWMA = 3
};
int OP_BUY = 0;
int OP_SELL = 1;
int OP_BUYLIMIT = 2;
int OP_SELLLIMIT = 3;
int OP_BUYSTOP = 4;
int OP_SELLSTOP = 5;

int MODE_MAIN = 0;
int MODE_SIGNAL = 1;
int MODE_PLUSDI = 1;
int MODE_MINUSDI = 2;
int MODE_UPPER = 1;
int MODE_LOWER = 2;
int MODE_GATORJAW = 1;
int MODE_GATORTEETH = 2;
int MODE_GATORLIPS = 3;
int MODE_TENKANSEN = 1;
int MODE_KIJUNSEN = 2;
int MODE_SENKOUSPANA = 3;
int MODE_SENKOUSPANB = 4;
int MODE_CHIKOUSPAN = 5;

// MQL has no these enumeration.
int INDI_ADX = 1;
int INDI_ALLIGATOR = 2;
int INDI_BANDS = 3;
int INDI_ENVELOPES = 4;
int INDI_FRACTALS = 5;
int INDI_ICHIMOKU = 6;
int INDI_MACD = 7;
int INDI_RVI = 8;
int INDI_STOCHASTIC = 9;

// MQL may define different values.
int SELECT_BY_POS = 1;
int SELECT_BY_TICKET = 2;
int MODE_TRADES = 1;
int MODE_HISTORY = 2;

int MODE_ASCEND = 1;
int MODE_DESCEND = 2;

int TIME_DATE = 4;
int TIME_MINUTES = 2;
int TIME_SECONDS = 1;

int Green = 0;
int Red = 0;
int Violet = 0;
int White = 0;
int Yellow = 0;
int Blue = 0;
int FireBrick = 0;
int Pink = 0;
int Lime = 0;

int EMPTY = -1;
int EMPTY_VALUE = 0x7FFFFFFF;
int CLR_NONE = -1;
int clrNONE = -1;
int CHARTS_MAX = 100;
int INVALID_HANDLE = -1;
int WHOLE_ARRAY = 0;
int WRONG_VALUE = -1;

enum ENUM_OBJECT {
  OBJ_ARROW_CHECK = 1
};

const char* convertTimeFrame (int timeframe) {
  if (PERIOD_M1 == timeframe) {
    return "M1";
  } else if (PERIOD_M5 == timeframe) {
    return "M5";
  } else if (PERIOD_M15 == timeframe) {
    return "M15";
  } else if (PERIOD_M30 == timeframe) {
    return "M30";
  } else if (PERIOD_H1 == timeframe) {
    return "H1";
  } else if (PERIOD_H4 == timeframe) {
    return "H4";
  } else if (PERIOD_D1 == timeframe) {
    return "D";
  } else if (PERIOD_W1 == timeframe) {
    return "W";
  } else if (PERIOD_MN1 == timeframe) {
    return "M";
  } else {
    return "0";
  }
}
const char* convertMode (int mode, int indi) {
  if (MODE_SIGNAL == mode && (indi == INDI_MACD || indi == INDI_RVI || indi == INDI_STOCHASTIC)) {
    return "signal";
  } else if (MODE_PLUSDI == mode && indi == INDI_ADX) {
    return "plusDi";
  } else if (MODE_MINUSDI == mode && indi == INDI_ADX) {
    return "minusDi";
  } else if (MODE_UPPER == mode && (indi == INDI_BANDS || indi == INDI_ENVELOPES)) {
    return "upper";
  } else if (MODE_LOWER == mode && (indi == INDI_BANDS || indi == INDI_ENVELOPES)) {
    return "lower";
  } else if (MODE_UPPER == mode && indi == INDI_FRACTALS) {
    return "fractalsUp";
  } else if (MODE_LOWER == mode && indi == INDI_FRACTALS) {
    return "fractalsDown";
  } else if (MODE_GATORJAW == mode && indi == INDI_ALLIGATOR) {
    return "jaws";
  } else if (MODE_GATORTEETH == mode && indi == INDI_ALLIGATOR) {
    return "teeth";
  } else if (MODE_GATORLIPS == mode && indi == INDI_ALLIGATOR) {
    return "lips";
  } else if (MODE_TENKANSEN == mode && indi == INDI_ICHIMOKU) {
    return "tenkan";
  } else if (MODE_KIJUNSEN == mode && indi == INDI_ICHIMOKU) {
    return "kijun";
  } else if (MODE_SENKOUSPANA == mode && indi == INDI_ICHIMOKU) {
    return "spana";
  } else if (MODE_SENKOUSPANB == mode && indi == INDI_ICHIMOKU) {
    return "spanb";
  } else if (MODE_CHIKOUSPAN == mode && indi == INDI_ICHIMOKU) {
    return "chikou";
  } else {
    return "main";
  }
}
const char* convertMAMethod (int ma_method) {
  if (MODE_EMA == ma_method) {
    return "ema";
  } else if (MODE_SMMA == ma_method) {
    return "smma";
  } else if (MODE_LWMA == ma_method) {
    return "lwma";
  } else {
    return "sma";
  }
}
const char* convertCmd (int cmd) {
  if (OP_BUY == cmd) {
    return "BUY";
  } else if (OP_SELL == cmd) {
    return "SELL";
  } else if (OP_BUYLIMIT == cmd) {
    return "BUY LIMIT";
  } else if (OP_SELLLIMIT == cmd) {
    return "SELL LIMIT";
  } else if (OP_BUYSTOP == cmd) {
    return "BUY STOP";
  } else {
    return "SELL STOP";
  }
}

void (*jPrint) (int, const char*);
long (*jChartClose) (int, long);
long (*jChartID) (int);
long (*jChartOpen) (int, const char*, const char*);
int (*jChartPeriod) (int, long);
const char* (*jChartSymbol) (int, long);
int (*jPeriod) (int);
const char* (*jSymbol) (int);
double (*jAccountBalance) (int);
const char* (*jAccountCompany) (int);
const char* (*jAccountCurrency) (int);
double (*jAccountEquity) (int);
double (*jAccountFreeMargin) (int);
double (*jAccountMargin) (int);
double (*jAccountProfit) (int);
int (*jOrdersTotal) (int);
int (*jOrdersHistoryTotal) (int);
int (*jOrderSelect) (int, int, int, int);
double (*jOrderOpenPrice) (int);
int (*jOrderType) (int);
double (*jOrderTakeProfit) (int);
double (*jOrderStopLoss) (int);
double (*jOrderLots) (int);
double (*jOrderProfit) (int);
const char* (*jOrderSymbol) (int);
int (*jOrderTicket) (int);
int (*jOrderMagicNumber) (int);
datetime (*jOrderOpenTime) (int);
void (*jOrderPrint) (int);
int (*jiTimeInit) (int, string, const char*);
datetime (*jiTime) (int, int, int);
int (*jiOpenInit) (int, string, const char*);
double (*jiOpen) (int, int, int);
int (*jiHighInit) (int, string, const char*);
double (*jiHigh) (int, int, int);
int (*jiLowInit) (int, string, const char*);
double (*jiLow) (int, int, int);
int (*jiCloseInit) (int, string, const char*);
double (*jiClose) (int, int, int);
int (*jiVolumeInit) (int, string, const char*);
long (*jiVolume) (int, int, int);
int (*jiACInit) (int, string, const char*);
double (*jiAC) (int, int, int);
int (*jiADXInit) (int, string, const char*, int, int);
double (*jiADX) (int, int, const char*, int);
int (*jiAlligatorInit) (int, string, const char*, int, int, int, int, int, int, const char*, int);
double (*jiAlligator) (int, int, int, int, int, const char*, int);
int (*jiAOInit) (int, string, const char*);
double (*jiAO) (int, int, int);
int (*jiATRInit) (int, string, const char*, int);
double (*jiATR) (int, int, int);
int (*jiBearsPowerInit) (int, string, const char*, int, int);
double (*jiBearsPower) (int, int, int);
int (*jiBandsInit) (int, string, const char*, int, double, int, int);
double (*jiBands) (int, int, int, const char*, int);
double (*jiBandsOnArray) (int, double*, int, int, double, int, const char*, int);
int (*jiBullsPowerInit) (int, string, const char*, int, int);
double (*jiBullsPower) (int, int, int);
int (*jiCCIInit) (int, string, const char*, int, int);
double (*jiCCI) (int, int, int);
double (*jiCCIOnArray) (int, double*, int, int, int);
int (*jiCustomInit) (int, string, const char*, const char*, const char*);
double (*jiCustom) (int, int, const char*, int);
int (*jiDeMarkerInit) (int, string, const char*, int);
double (*jiDeMarker) (int, int, int);
int (*jiEnvelopesInit) (int, string, const char*, int, const char*, int, int, double);
double (*jiEnvelopes) (int, int, int, const char*, int);
double (*jiEnvelopesOnArray) (int, double*, int, int, const char*, int, double, const char*, int);
int (*jiFractalsInit) (int, string, const char*);
double (*jiFractals) (int, int, const char*, int);
int (*jiIchimokuInit) (int, string, const char*, int, int, int);
double (*jiIchimoku) (int, int, int, const char*, int);
int (*jiMAInit) (int, string, const char*, int, int, int, int);
double (*jiMA) (int, int, int, const char*, int);
double (*jiMAOnArray) (int, double*, int, int, int, const char*, int);
int (*jiMACDInit) (int, string, const char*, int, int, int, int);
double (*jiMACD) (int, int, const char*, int);
int (*jiMomentumInit) (int, string, const char*, int, int);
double (*jiMomentum) (int, int, int);
double (*jiMomentumOnArray) (int, double*, int, int, int);
int (*jiRSIInit) (int, string, const char*, int, int);
double (*jiRSI) (int, int, int);
double (*jiRSIOnArray) (int, double*, int, int, int);
int (*jiRVIInit) (int, string, const char*, int);
double (*jiRVI) (int, int, const char*, int);
int (*jiSARInit) (int, string, const char*, double, double);
double (*jiSAR) (int, int, int);
int (*jiStochasticInit) (int, string, const char*, int, int, int, const char*);
double (*jiStochastic) (int, int, const char*, int);
int (*jiWPRInit) (int, string, const char*, int);
double (*jiWPR) (int, int, int);
int (*jARROW_CHECKCreate) (int, long, const char*, datetime, double);
int (*jARROW_CHECKDelete) (int, const char*);
int (*jIsTesting) ();

EM_JS(int, jOrderSend, (int uid, string symbol, const char* cmd, double volume, double price, int slippage, double stoploss, double takeprofit, string comment, int magic, datetime expiration, int arrow_color), {
   return Asyncify.handleSleep(function (wakeUp) {
    try {
      var symbolName = UTF8ToString(symbol);
      const orderType = UTF8ToString(cmd);
      const cmmnt = UTF8ToString(comment);
      var obj = window.mqlEAsBuffer[uid + ""];
      if (symbolName == "") {
        symbolName = obj.symbolName;
      }
      obj.lock = true;
      document.addEventListener("customevent", function (e) {
        window.mqlEAsBuffer[uid + ""].lock = false;
        wakeUp(parseInt(e.detail));
			}, {once: true});
      sendOrder (obj.brokerName, obj.accountId, symbolName, orderType, price, slippage, volume, takeprofit, stoploss, cmmnt);
    } catch (e) {
      printErrorMessage(e.message);
      wakeUp(-1);
    }
  });
});

EM_JS(int, jOrderModify, (int uid, int ticket, double volume, double price, int slippage, double stoploss, double takeprofit, string comment, datetime expiration, int arrow_color), {
  return Asyncify.handleSleep(function (wakeUp) {
    try {
      const cmmnt = UTF8ToString(comment);
      var obj = window.mqlEAsBuffer[uid + ""];
      obj.lock = true;
      if (obj.type == "P") {
        document.addEventListener("customevent", function (e) {
          window.mqlEAsBuffer[uid + ""].lock = false;
          wakeUp(1);
  			}, {once: true});
        modifyOrder (obj.brokerName, obj.accountId, ticket + "", getSymbolName(obj.orderOrTrade), getOrderType(obj.orderOrTrade), price, slippage, volume, takeprofit, stoploss, cmmnt);
      } else if (obj.type == "T") {
        document.addEventListener("customevent", function (e) {
          window.mqlEAsBuffer[uid + ""].lock = false;
          wakeUp(1);
  			}, {once: true});
        modifyTpSlOfTrade (obj.brokerName, obj.accountId, ticket + "", takeprofit, stoploss);
      } else {
        throw new Error("Failed to modify the order.");
      }
    } catch (e) {
      printErrorMessage(e.message);
      wakeUp(0);
    }
  });
});

EM_JS(int, jOrderClose, (int uid, int ticket, double lots, double price, int slippage, int arrow_color), {
  return Asyncify.handleSleep(function (wakeUp) {
    try {
      var obj = window.mqlEAsBuffer[uid + ""];
      obj.lock = true;
      var orderType = getOrderType(obj.orderOrTrade);
      var ask = getAsk(obj.context, obj.brokerName, obj.accountId, obj.symbolName);
      var bid = getBid(obj.context, obj.brokerName, obj.accountId, obj.symbolName);
      if (price == 0 ||
        ((orderType == "BUY" || orderType == "BUY LIMIT" || orderType == "BUY STOP" ) && Math.abs(price - bid) / price < 0.0003) ||
        ((orderType == "SELL" || orderType == "SELL LIMIT" || orderType == "SELL STOP" ) && Math.abs(price - ask) / price < 0.0003)) {
        document.addEventListener("customevent", function (e) {
          window.mqlEAsBuffer[uid + ""].lock = false;
          wakeUp(1);
  			}, {once: true});
        closeTrade (obj.brokerName, obj.accountId, ticket + "");
      } else {
        throw new Error("Failed to close the opened trade.");
      }
    } catch (e) {
      printErrorMessage(e.message);
      wakeUp(0);
    }
  });
});

EM_JS(int, jOrderDelete, (int uid, int ticket, int arrow_color), {
  return Asyncify.handleSleep(function (wakeUp) {
    try {
      var obj = window.mqlEAsBuffer[uid + ""];
      obj.lock = true;
      document.addEventListener("customevent", function (e) {
        window.mqlEAsBuffer[uid + ""].lock = false;
        wakeUp(1);
			}, {once: true});
      cancelOrder (obj.brokerName, obj.accountId, ticket + "");
    } catch (e) {
      printErrorMessage(e.message);
      wakeUp(0);
    }
  });
});

void Sleep (int  milliseconds) {
  sleep(milliseconds / 1000);
}
int GetLastError () {
  return 0;
}
string ErrorDescription (int code) {
  return "";
}
bool IsStopped () {
  return false;
}
bool IsTradeAllowed () {
  return true;
}
bool IsTradeAllowed (const string symbol, datetime tested_time) {
  return true;
}
bool RefreshRates () {
  return true;
}
double MathAbs (double val) {
  return abs(val);
}
double MathArccos (double val) {
  return acos(val);
}
double MathArcsin (double val) {
  return asin(val);
}
double MathArctan (double val) {
  return atan(val);
}
double MathCeil (double val) {
  return ceil(val);
}
double MathCos (double val) {
  return cos(val);
}
double MathExp (double val) {
  return exp(val);
}
double MathFloor (double val) {
  return floor(val);
}
double MathLog (double val) {
  return log(val);
}
double MathLog10 (double val) {
  return log10(val);
}
double MathMax (double a, double b) {
  return max(a, b);
}
double MathMin (double a, double b) {
  return min(a, b);
}
double MathMod (double a, double b) {
  return fmod(a, b);
}
double MathPow (double base, double exponent) {
  return pow(base, exponent);
}
int MathRand () {
  return rand();
}
double MathRound (double val) {
  return round(val);
}
double MathSin (double val) {
  return sin(val);
}
double MathSqrt (double val) {
  return sqrt(val);
}
void MathSrand (int seed) {
  srand(seed);
}
double MathTan (double val) {
  return tan(val);
}
int StringLen (string string_value) {
  return string_value.length();
}
int StringReplace (string str, const string find, const string replacement) {
  if(find.empty()) {
    return 0;
  }
  size_t start_pos = 0;
  int count = 0;
  while((start_pos = str.find(find, start_pos)) != string::npos) {
    str.replace(start_pos, find.length(), replacement);
    start_pos += replacement.length();
    count++;
  }
  return count;
}
string StringSubstr (const string string_value, int start_pos, int length) {
  if (start_pos < 0 || start_pos >= string_value.length() || length <= 0 || start_pos + length > string_value.length()) {
    return "";
  }
  return string_value.substr(start_pos, length);
}
bool StringToLower (string string_var) {
  transform(string_var.begin(), string_var.end(), string_var.begin(), [](unsigned char c){ return tolower(c);});
  return true;
}
bool StringToUpper (string string_var) {
  transform(string_var.begin(), string_var.end(), string_var.begin(), [](unsigned char c){ return toupper(c);});
  return true;
}
string StringTrimLeft(const string text) {
  string s = text;
  s.erase(s.begin(), find_if(s.begin(), s.end(), [](int c) {return !isspace(c);}));
  return s;
}
string StringTrimRight(const string text) {
  string s = text;
  s.erase(find_if(s.rbegin(), s.rend(), [](int c) {return !isspace(c);}).base(), s.end());
  return s;
}
string DoubleToString (double value, int dijits) {
  stringstream stream;
  stream << fixed << setprecision(dijits) << value;
  return stream.str();
}
string DoubleToString (double value) {
  return DoubleToString(value, 8);
}
string DoubleToStr (double value, int dijits) {
  return DoubleToString(value, dijits);
}
string DoubleToStr (double value) {
  return DoubleToString(value, 8);
}
string IntegerToString (long number, int str_len, unsigned short fill_symbol) {
  return to_string(number);
}
string ShortToString (unsigned short symbol_code) {
  return to_string(symbol_code);
}
string TimeToString (long value, int mode) {
  time_t tim = value;
  tm * ptm = localtime(&tim);
  if (mode == 7 || mode == 5) {
    char buffer[20];
    strftime(buffer, 20, "%Y.%m.%d %H:%M:%S", ptm);
    return string(buffer);
  } else if (mode == 4) {
    char buffer[11];
    strftime(buffer, 11, "%Y.%m.%d", ptm);
    return string(buffer);
  } else if (mode == 3 || mode == 1) {
    char buffer[9];
    strftime(buffer, 9, "%H:%M:%S", ptm);
    return string(buffer);
  } else if (mode == 2) {
    char buffer[6];
    strftime(buffer, 6, "%H:%M", ptm);
    return string(buffer);
  } else {
    char buffer[17];
    strftime(buffer, 17, "%Y.%m.%d %H:%M", ptm);
    return string(buffer);
  }
}
string TimeToString (datetime value) {
  return TimeToString(value, 5);
}
string TimeToStr (datetime value, int mode) {
  return TimeToString(value, mode);
}
string TimeToStr (datetime value) {
  return TimeToString(value, 5);
}
double NormalizeDouble (double value, int digits) {
  return (round(value * pow(10, digits))) / pow(10, digits);
}
double StringToDouble (string value) {
  return stod(value);
}
double StrToDouble (string value) {
  return StringToDouble(value);
}
int StringToInteger (string value) {
  return stoi(value);
}
int StrToInteger (string value) {
  return StringToInteger(value);
}
datetime StringToTime (string value) {
  struct tm tm;
  if (value.length() == 19) {
    strptime(value.c_str(), "%Y.%m.%d %H:%M:%S", &tm);
    return mktime(&tm);
  } else if (value.length() == 10) {
    strptime(value.c_str(), "%Y.%m.%d", &tm);
    return mktime(&tm);
  } else if (value.length() == 16) {
    strptime(value.c_str(), "%Y.%m.%d %H:%M", &tm);
    return mktime(&tm);
  } else {
    return 0;
  }
}
datetime StrToTime (string value) {
  return StringToTime(value);
}
datetime TimeCurrent () {
  return chrono::system_clock::to_time_t(chrono::system_clock::now());
}
datetime TimeGMT () {
  return TimeCurrent();
}
datetime CurTime () {
  return TimeCurrent();
}
int Day () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_mday;
}
int DayOfWeek () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_wday;
}
int DayOfYear () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_yday + 1;
}
int Hour () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_hour;
}
int Minute () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_min;
}
int Month () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_mon + 1;
}
int Seconds () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_sec;
}
int TimeDay (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_mday;
}
int TimeDayOfWeek (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_wday;
}
int TimeDayOfYear (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_yday + 1;
}
int TimeHour (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_hour;
}
int TimeMinute (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_min;
}
int TimeMonth (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_mon + 1;
}
int TimeSeconds (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_sec;
}
int TimeYear (datetime ltime) {
  time_t theTime = ltime;
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_year + 1900;
}
int Year () {
  time_t theTime = time(NULL);
  struct tm *aTime = localtime(&theTime);
  return aTime->tm_year + 1900;
}
int ArrayCopy (char* dst_array, const char* src_array, int dst_start, int src_start, int count) {
  if (count <= 0) {
    return 0;
  } else {
    memcpy(dst_array, src_array, count * (sizeof (char)));
    return count;
  }
}
int ArrayCopy (short* dst_array, const short* src_array, int dst_start, int src_start, int count) {
  if (count <= 0) {
    return 0;
  } else {
    memcpy(dst_array, src_array, count * (sizeof (short)));
    return count;
  }
}
int ArrayCopy (int* dst_array, const int* src_array, int dst_start, int src_start, int count) {
  if (count <= 0) {
    return 0;
  } else {
    memcpy(dst_array, src_array, count * (sizeof (int)));
    return count;
  }
}
int ArrayCopy (long* dst_array, const long* src_array, int dst_start, int src_start, int count) {
  if (count <= 0) {
    return 0;
  } else {
    memcpy(dst_array, src_array, count * (sizeof (long)));
    return count;
  }
}
int ArrayCopy (float* dst_array, const float* src_array, int dst_start, int src_start, int count) {
  if (count <= 0) {
    return 0;
  } else {
    memcpy(dst_array, src_array, count * (sizeof (float)));
    return count;
  }
}
int ArrayCopy (double* dst_array, const double* src_array, int dst_start, int src_start, int count) {
  if (count <= 0) {
    return 0;
  } else {
    memcpy(dst_array, src_array, count * (sizeof (double)));
    return count;
  }
}
int ArrayCopy (bool* dst_array, const bool* src_array, int dst_start, int src_start, int count) {
  if (count <= 0) {
    return 0;
  } else {
    memcpy(dst_array, src_array, count * (sizeof (bool)));
    return count;
  }
}
void ArrayFree (void* array) {
  free(array);
}
void ArrayInitialize (char* array, char value, int count) {
  if (count > 0) {
    for (int i = 0; i < count; i++) {
      array[i] = value;
    }
  }
}
void ArrayInitialize (short* array, short value, int count) {
  if (count > 0) {
    for (int i = 0; i < count; i++) {
      array[i] = value;
    }
  }
}
void ArrayInitialize (int* array, int value, int count) {
  if (count > 0) {
    for (int i = 0; i < count; i++) {
      array[i] = value;
    }
  }
}
void ArrayInitialize (long* array, long value, int count) {
  if (count > 0) {
    for (int i = 0; i < count; i++) {
      array[i] = value;
    }
  }
}
void ArrayInitialize (float* array, float value, int count) {
  if (count > 0) {
    for (int i = 0; i < count; i++) {
      array[i] = value;
    }
  }
}
void ArrayInitialize (double* array, double value, int count) {
  if (count > 0) {
    for (int i = 0; i < count; i++) {
      array[i] = value;
    }
  }
}
void ArrayInitialize (bool* array, bool value, int count) {
  if (count > 0) {
    for (int i = 0; i < count; i++) {
      array[i] = value;
    }
  }
}
void ArrayFill (char* array, int start, int count, char value) {
  ArrayInitialize(array, value, count);
}
void ArrayFill (short* array, int start, int count, short value) {
  ArrayInitialize(array, value, count);
}
void ArrayFill (int* array, int start, int count, int value) {
  ArrayInitialize(array, value, count);
}
void ArrayFill (long* array, int start, int count, long value) {
  ArrayInitialize(array, value, count);
}
void ArrayFill (float* array, int start, int count, float value) {
  ArrayInitialize(array, value, count);
}
void ArrayFill (double* array, int start, int count, double value) {
  ArrayInitialize(array, value, count);
}
void ArrayFill (bool* array, int start, int count, bool value) {
  ArrayInitialize(array, value, count);
}
int ArrayMaximum (const short* array, int count, int start) {
  if (count > 0) {
    short high = SHRT_MIN;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] > high) {
        high = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMaximum (const int* array, int count, int start) {
  if (count > 0) {
    int high = INT_MIN;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] > high) {
        high = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMaximum (const long* array, int count, int start) {
  if (count > 0) {
    long high = LONG_MIN;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] > high) {
        high = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMaximum (const float* array, int count, int start) {
  if (count > 0) {
    float high = FLT_MIN;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] > high) {
        high = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMaximum (const double* array, int count, int start) {
  if (count > 0) {
    double high = DBL_MIN;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] > high) {
        high = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMinimum (const short* array, int count, int start) {
  if (count > 0) {
    short low = SHRT_MAX;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] < low) {
        low = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMinimum (const int* array, int count, int start) {
  if (count > 0) {
    int low = INT_MAX;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] < low) {
        low = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMinimum (const long* array, int count, int start) {
  if (count > 0) {
    long low = LONG_MAX;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] < low) {
        low = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMinimum (const float* array, int count, int start) {
  if (count > 0) {
    float low = FLT_MAX;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] < low) {
        low = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayMinimum (const double* array, int count, int start) {
  if (count > 0) {
    double low = DBL_MAX;
    int index = -1;
    for (int i = 0; i < count; i++) {
      if (array[i] < low) {
        low = array[i];
        index = i;
      }
    }
    return index;
  } else {
    return -1;
  }
}
int ArrayResize (char** array, int new_size, int reserve_size) {
  if (new_size > 0) {
    int size = new_size * (sizeof (char));
    char* newArr = (char*)malloc(size);
    if (*array != NULL) {
      memcpy(newArr, *array, size);
      free(*array);
    }
    *array = newArr;
    return new_size;
  } else {
    return -1;
  }
}
int ArrayResize (short** array, int new_size, int reserve_size) {
  if (new_size > 0) {
    int size = new_size * (sizeof (short));
    short* newArr = (short*)malloc(size);
    if (*array != NULL) {
      memcpy(newArr, *array, size);
      free(*array);
    }
    *array = newArr;
    return new_size;
  } else {
    return -1;
  }
}
int ArrayResize (int** array, int new_size, int reserve_size) {
  if (new_size > 0) {
    int size = new_size * (sizeof (int));
    int* newArr = (int*)malloc(size);
    if (*array != NULL) {
      memcpy(newArr, *array, size);
      free(*array);
    }
    *array = newArr;
    return new_size;
  } else {
    return -1;
  }
}
int ArrayResize (long** array, int new_size, int reserve_size) {
  if (new_size > 0) {
    int size = new_size * (sizeof (long));
    long* newArr = (long*)malloc(size);
    if (*array != NULL) {
      memcpy(newArr, *array, size);
      free(*array);
    }
    *array = newArr;
    return new_size;
  } else {
    return -1;
  }
}
int ArrayResize (float** array, int new_size, int reserve_size) {
  if (new_size > 0) {
    int size = new_size * (sizeof (float));
    float* newArr = (float*)malloc(size);
    if (*array != NULL) {
      memcpy(newArr, *array, size);
      free(*array);
    }
    *array = newArr;
    return new_size;
  } else {
    return -1;
  }
}
int ArrayResize (double** array, int new_size, int reserve_size) {
  if (new_size > 0) {
    int size = new_size * (sizeof (double));
    double* newArr = (double*)malloc(size);
    if (*array != NULL) {
      memcpy(newArr, *array, size);
      free(*array);
    }
    *array = newArr;
    return new_size;
  } else {
    return -1;
  }
}
int ArrayResize (bool** array, int new_size, int reserve_size) {
  if (new_size > 0) {
    int size = new_size * (sizeof (bool));
    bool* newArr = (bool*)malloc(size);
    if (*array != NULL) {
      memcpy(newArr, *array, size);
      free(*array);
    }
    *array = newArr;
    return new_size;
  } else {
    return -1;
  }
}
int ArrayResize (char** array, int new_size) {
  return ArrayResize(array, new_size, 0);
}
int ArrayResize (short** array, int new_size) {
  return ArrayResize(array, new_size, 0);
}
int ArrayResize (int** array, int new_size) {
  return ArrayResize(array, new_size, 0);
}
int ArrayResize (long** array, int new_size) {
  return ArrayResize(array, new_size, 0);
}
int ArrayResize (float** array, int new_size) {
  return ArrayResize(array, new_size, 0);
}
int ArrayResize (double** array, int new_size) {
  return ArrayResize(array, new_size, 0);
}
int ArrayResize (bool** array, int new_size) {
  return ArrayResize(array, new_size, 0);
}
bool ArraySort (char* array, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      sort(array, array + count, greater<char>());
    } else {
      sort(array, array + count);
    }
    return true;
  } else {
    return false;
  }
}
bool ArraySort (short* array, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      sort(array, array + count, greater<short>());
    } else {
      sort(array, array + count);
    }
    return true;
  } else {
    return false;
  }
}
bool ArraySort (int* array, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      sort(array, array + count, greater<int>());
    } else {
      sort(array, array + count);
    }
    return true;
  } else {
    return false;
  }
}
bool ArraySort (long* array, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      sort(array, array + count, greater<long>());
    } else {
      sort(array, array + count);
    }
    return true;
  } else {
    return false;
  }
}
bool ArraySort (float* array, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      sort(array, array + count, greater<float>());
    } else {
      sort(array, array + count);
    }
    return true;
  } else {
    return false;
  }
}
bool ArraySort (double* array, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      sort(array, array + count, greater<double>());
    } else {
      sort(array, array + count);
    }
    return true;
  } else {
    return false;
  }
}
int ArrayBsearch (const char* array, char value, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      for (int i = count - 1; i >= 0; i--) {
        if (array[i] <= value) {
          return i;
        }
      }
      return 0;
    } else {
      for (int i = 0; i < count; i++) {
        if (array[i] >= value) {
          return i;
        }
      }
      return count - 1;
    }
  } else {
    return -1;
  }
}
int ArrayBsearch (const short* array, short value, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      for (int i = count - 1; i >= 0; i--) {
        if (array[i] <= value) {
          return i;
        }
      }
      return 0;
    } else {
      for (int i = 0; i < count; i++) {
        if (array[i] >= value) {
          return i;
        }
      }
      return count - 1;
    }
  } else {
    return -1;
  }
}
int ArrayBsearch (const int* array, int value, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      for (int i = count - 1; i >= 0; i--) {
        if (array[i] <= value) {
          return i;
        }
      }
      return 0;
    } else {
      for (int i = 0; i < count; i++) {
        if (array[i] >= value) {
          return i;
        }
      }
      return count - 1;
    }
  } else {
    return -1;
  }
}
int ArrayBsearch (const long* array, long value, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      for (int i = count - 1; i >= 0; i--) {
        if (array[i] <= value) {
          return i;
        }
      }
      return 0;
    } else {
      for (int i = 0; i < count; i++) {
        if (array[i] >= value) {
          return i;
        }
      }
      return count - 1;
    }
  } else {
    return -1;
  }
}
int ArrayBsearch (const float* array, float value, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      for (int i = count - 1; i >= 0; i--) {
        if (array[i] <= value) {
          return i;
        }
      }
      return 0;
    } else {
      for (int i = 0; i < count; i++) {
        if (array[i] >= value) {
          return i;
        }
      }
      return count - 1;
    }
  } else {
    return -1;
  }
}
int ArrayBsearch (const double* array, double value, int count, int start, int direction) {
  if (count > 0) {
    if (direction == MODE_DESCEND) {
      for (int i = count - 1; i >= 0; i--) {
        if (array[i] <= value) {
          return i;
        }
      }
      return 0;
    } else {
      for (int i = 0; i < count; i++) {
        if (array[i] >= value) {
          return i;
        }
      }
      return count - 1;
    }
  } else {
    return -1;
  }
}

struct Parameter {
  char paramType;
  int paramInt;
  double paramDouble;
  bool paramBool;
  const char* paramString;
};

struct GlobalVar {
  datetime time;
  double value;
};

struct ParamHandleItem {
  bool bInit = true;
  vector<struct Parameter> paramList;
  map<string, int> handleList;
  map<string, struct GlobalVar> globalVarList;
};

map<int, struct ParamHandleItem> paramHandleList;
int iFintecheeUID;
int Bars;
double Ask;
double Bid;

void OnTick (void);

void setParam (int uid, const struct Parameter & parameter) {
  if (paramHandleList.find(uid) != paramHandleList.end()) {
    paramHandleList[uid].paramList.push_back(parameter);
  } else {
    struct ParamHandleItem item;
    item.paramList.push_back(parameter);
    paramHandleList[uid] = item;
  }
}

datetime setGlobalVar (int uid, string name, double value) {
  struct GlobalVar globalVar;
  globalVar.time = TimeCurrent();

  if (paramHandleList.find(uid) != paramHandleList.end()) {
    datetime time = paramHandleList[uid].globalVarList.count(name) > 0 ? paramHandleList[uid].globalVarList[name].time : globalVar.time;
    paramHandleList[uid].globalVarList[name] = globalVar;
    return time;
  } else {
    struct ParamHandleItem item;
    item.globalVarList[name] = globalVar;
    paramHandleList[uid] = item;
    return globalVar.time;
  }
}

bool checkGlobalVar (int uid, string name) {
  if (paramHandleList.find(uid) != paramHandleList.end()) {
    return paramHandleList[uid].globalVarList.count(name) > 0;
  } else {
    return false;
  }
}

double getGlobalVar (int uid, string name) {
  if (paramHandleList.find(uid) != paramHandleList.end()) {
    return paramHandleList[uid].globalVarList.count(name) > 0 ? paramHandleList[uid].globalVarList[name].value : 0;
  } else {
    return 0;
  }
}

bool delGlobalVar (int uid, string name) {
  if (paramHandleList.find(uid) != paramHandleList.end()) {
    if (paramHandleList[uid].globalVarList.count(name) > 0) {
      paramHandleList[uid].globalVarList.erase(name);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

extern "C" {

EMSCRIPTEN_KEEPALIVE
void setParamInt (int uid, int param) {
  struct Parameter parameter;
  parameter.paramType = 'i';
  parameter.paramInt = param;
  setParam(uid, parameter);
}
EMSCRIPTEN_KEEPALIVE
void setParamDouble (int uid, double param) {
  struct Parameter parameter;
  parameter.paramType = 'd';
  parameter.paramDouble = param;
  setParam(uid, parameter);
}
EMSCRIPTEN_KEEPALIVE
void setParamBool (int uid, bool param) {
  struct Parameter parameter;
  parameter.paramType = 'b';
  parameter.paramBool = param;
  setParam(uid, parameter);
}
EMSCRIPTEN_KEEPALIVE
void setParamString (int uid, const char* param) {
  struct Parameter parameter;
  parameter.paramType = 'b';
  parameter.paramString = param;
  setParam(uid, parameter);
}
EMSCRIPTEN_KEEPALIVE
void setjPrint (void (*f) (int, const char*)) {
  jPrint = f;
}
EMSCRIPTEN_KEEPALIVE
void setjChartClose (long (*f) (int, long)) {
  jChartClose = f;
}
EMSCRIPTEN_KEEPALIVE
void setjChartID (long (*f) (int)) {
  jChartID = f;
}
EMSCRIPTEN_KEEPALIVE
void setjChartOpen (long (*f) (int, const char*, const char*)) {
  jChartOpen = f;
}
EMSCRIPTEN_KEEPALIVE
void setjChartPeriod (int (*f) (int, long)) {
  jChartPeriod = f;
}
EMSCRIPTEN_KEEPALIVE
void setjChartSymbol (const char* (*f) (int, long)) {
  jChartSymbol = f;
}
EMSCRIPTEN_KEEPALIVE
void setjPeriod (int (*f) (int)) {
  jPeriod = f;
}
EMSCRIPTEN_KEEPALIVE
void setjSymbol (const char* (*f) (int)) {
  jSymbol = f;
}
EMSCRIPTEN_KEEPALIVE
void setjAccountBalance (double (*f) (int)) {
  jAccountBalance = f;
}
EMSCRIPTEN_KEEPALIVE
void setjAccountCompany (const char* (*f) (int)) {
  jAccountCompany = f;
}
EMSCRIPTEN_KEEPALIVE
void setjAccountCurrency (const char* (*f) (int)) {
  jAccountCurrency = f;
}
EMSCRIPTEN_KEEPALIVE
void setjAccountEquity (double (*f) (int)) {
  jAccountEquity = f;
}
EMSCRIPTEN_KEEPALIVE
void setjAccountFreeMargin (double (*f) (int)) {
  jAccountFreeMargin = f;
}
EMSCRIPTEN_KEEPALIVE
void setjAccountMargin (double (*f) (int)) {
  jAccountMargin = f;
}
EMSCRIPTEN_KEEPALIVE
void setjAccountProfit (double (*f) (int)) {
  jAccountProfit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrdersTotal (int (*f) (int)) {
  jOrdersTotal = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrdersHistoryTotal (int (*f) (int)) {
  jOrdersHistoryTotal = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderSelect (int (*f) (int, int, int, int)) {
  jOrderSelect = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderOpenPrice (double (*f) (int)) {
  jOrderOpenPrice = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderType (int (*f) (int)) {
  jOrderType = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderTakeProfit (double (*f) (int)) {
  jOrderTakeProfit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderStopLoss (double (*f) (int)) {
  jOrderStopLoss = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderLots (double (*f) (int)) {
  jOrderLots = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderProfit (double (*f) (int)) {
  jOrderProfit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderSymbol (const char* (*f) (int)) {
  jOrderSymbol = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderTicket (int (*f) (int)) {
  jOrderTicket = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderMagicNumber (int (*f) (int)) {
  jOrderMagicNumber = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderOpenTime (datetime (*f) (int)) {
  jOrderOpenTime = f;
}
EMSCRIPTEN_KEEPALIVE
void setjOrderPrint (void (*f) (int)) {
  jOrderPrint = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiTimeInit (int (*f) (int, string, const char*)) {
  jiTimeInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiTime (datetime (*f) (int, int, int)) {
  jiTime = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiOpenInit (int (*f) (int, string, const char*)) {
  jiOpenInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiOpen (double (*f) (int, int, int)) {
  jiOpen = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiHighInit (int (*f) (int, string, const char*)) {
  jiHighInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiHigh (double (*f) (int, int, int)) {
  jiHigh = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiLowInit (int (*f) (int, string, const char*)) {
  jiLowInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiLow (double (*f) (int, int, int)) {
  jiLow = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCloseInit (int (*f) (int, string, const char*)) {
  jiCloseInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiClose (double (*f) (int, int, int)) {
  jiClose = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiVolumeInit (int (*f) (int, string, const char*)) {
  jiVolumeInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiVolume (long (*f) (int, int, int)) {
  jiVolume = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiACInit (int (*f) (int, string, const char*)) {
  jiACInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAC (double (*f) (int, int, int)) {
  jiAC = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiADXInit (int (*f) (int, string, const char*, int, int)) {
  jiADXInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiADX (double (*f) (int, int, const char*, int)) {
  jiADX = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAlligatorInit (int (*f) (int, string, const char*, int, int, int, int, int, int, const char*, int)) {
  jiAlligatorInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAlligator (double (*f) (int, int, int, int, int, const char*, int)) {
  jiAlligator = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAOInit (int (*f) (int, string, const char*)) {
  jiAOInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAO (double (*f) (int, int, int)) {
  jiAO = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiATRInit (int (*f) (int, string, const char*, int)) {
  jiATRInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiATR (double (*f) (int, int, int)) {
  jiATR = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBearsPowerInit (int (*f) (int, string, const char*, int, int)) {
  jiBearsPowerInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBearsPower (double (*f) (int, int, int)) {
  jiBearsPower = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBandsInit (int (*f) (int, string, const char*, int, double, int, int)) {
  jiBandsInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBands (double (*f) (int, int, int, const char*, int)) {
  jiBands = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBandsOnArray (double (*f) (int, double*, int, int, double, int, const char*, int)) {
  jiBandsOnArray = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBullsPowerInit (int (*f) (int, string, const char*, int, int)) {
  jiBullsPowerInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBullsPower (double (*f) (int, int, int)) {
  jiBullsPower = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCCIInit (int (*f) (int, string, const char*, int, int)) {
  jiCCIInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCCI (double (*f) (int, int, int)) {
  jiCCI = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCCIOnArray (double (*f) (int, double*, int, int, int)) {
  jiCCIOnArray = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCustomInit (int (*f) (int, string, const char*, const char*, const char*)) {
  jiCustomInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCustom (double (*f) (int, int, const char*, int)) {
  jiCustom = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiDeMarkerInit (int (*f) (int, string, const char*, int)) {
  jiDeMarkerInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiDeMarker (double (*f) (int, int, int)) {
  jiDeMarker = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiEnvelopesInit (int (*f) (int, string, const char*, int, const char*, int, int, double)) {
  jiEnvelopesInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiEnvelopes (double (*f) (int, int, int, const char*, int)) {
  jiEnvelopes = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiEnvelopesOnArray (double (*f) (int, double*, int, int, const char*, int, double, const char*, int)) {
  jiEnvelopesOnArray = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiFractalsInit (int (*f) (int, string, const char*)) {
  jiFractalsInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiFractals (double (*f) (int, int, const char*, int)) {
  jiFractals = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiIchimokuInit (int (*f) (int, string, const char*, int, int, int)) {
  jiIchimokuInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiIchimoku (double (*f) (int, int, int, const char*, int)) {
  jiIchimoku = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMAInit (int (*f) (int, string, const char*, int, int, int, int)) {
  jiMAInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMA (double (*f) (int, int, int, const char*, int)) {
  jiMA = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMAOnArray (double (*f) (int, double*, int, int, int, const char*, int)) {
  jiMAOnArray = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMACDInit (int (*f) (int, string, const char*, int, int, int, int)) {
  jiMACDInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMACD (double (*f) (int, int, const char*, int)) {
  jiMACD = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMomentumInit (int (*f) (int, string, const char*, int, int)) {
  jiMomentumInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMomentum (double (*f) (int, int, int)) {
  jiMomentum = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMomentumOnArray (double (*f) (int, double*, int, int, int)) {
  jiMomentumOnArray = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiRSIInit (int (*f) (int, string, const char*, int, int)) {
  jiRSIInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiRSI (double (*f) (int, int, int)) {
  jiRSI = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiRSIOnArray (double (*f) (int, double*, int, int, int)) {
  jiRSIOnArray = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiRVIInit (int (*f) (int, string, const char*, int)) {
  jiRVIInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiRVI (double (*f) (int, int, const char*, int)) {
  jiRVI = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiSARInit (int (*f) (int, string, const char*, double, double)) {
  jiSARInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiSAR (double (*f) (int, int, int)) {
  jiSAR = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiStochasticInit (int (*f) (int, string, const char*, int, int, int, const char*)) {
  jiStochasticInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiStochastic (double (*f) (int, int, const char*, int)) {
  jiStochastic = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiWPRInit (int (*f) (int, string, const char*, int)) {
  jiWPRInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiWPR (double (*f) (int, int, int)) {
  jiWPR = f;
}
EMSCRIPTEN_KEEPALIVE
void setjARROW_CHECKCreate (int (*f) (int, long, const char*, datetime, double)) {
  jARROW_CHECKCreate = f;
}
EMSCRIPTEN_KEEPALIVE
void setjARROW_CHECKDelete (int (*f) (int, const char*)) {
  jARROW_CHECKDelete = f;
}
EMSCRIPTEN_KEEPALIVE
void setjIsTesting (int (*f) ()) {
  jIsTesting = f;
}

}

bool ChartClose (long chart_id) {
  if (paramHandleList[iFintecheeUID].bInit) return false;
  long id = jChartClose(iFintecheeUID, chart_id);
  if (id != -1) {
    for (auto const& [key, val] : paramHandleList[iFintecheeUID].handleList) {
      if (val == id) {
        paramHandleList[iFintecheeUID].handleList.erase(key);
        return true;
      }
    }
  }
  return false;
}
bool ChartClose () {
  return ChartClose(0);
}

long ChartID () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jChartID(iFintecheeUID);
}

long ChartOpen (const char* symbol, int timeframe) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jChartOpen(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return handle;
  } else {
    return 0;
  }
}
long ChartOpen (long symbol, int timeframe) {
  return ChartOpen("", timeframe);
}

ENUM_TIMEFRAMES ChartPeriod (long chart_id) {
  if (paramHandleList[iFintecheeUID].bInit) return PERIOD_CURRENT;
  return (ENUM_TIMEFRAMES)jChartPeriod(iFintecheeUID, chart_id);
}
ENUM_TIMEFRAMES ChartPeriod () {
  return ChartPeriod(0);
}

string ChartSymbol (long chart_id) {
  if (paramHandleList[iFintecheeUID].bInit) return "";
  string symbol(jChartSymbol(iFintecheeUID, chart_id));
  return symbol;
}
string ChartSymbol () {
  return ChartSymbol(0);
}

ENUM_TIMEFRAMES Period () {
  if (paramHandleList[iFintecheeUID].bInit) return PERIOD_CURRENT;
  return (ENUM_TIMEFRAMES)jPeriod(iFintecheeUID);
}

string Symbol() {
  if (paramHandleList[iFintecheeUID].bInit) return "";
  string symbol(jSymbol(iFintecheeUID));
  return symbol;
}

double AccountBalance () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jAccountBalance(iFintecheeUID);
}

string AccountCompany () {
  if (paramHandleList[iFintecheeUID].bInit) return "";
  string company(jAccountCompany(iFintecheeUID));
  return company;
}

string AccountCurrency () {
  if (paramHandleList[iFintecheeUID].bInit) return "";
  string currency(jAccountCurrency(iFintecheeUID));
  return currency;
}

double AccountEquity () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jAccountEquity(iFintecheeUID);
}

double AccountFreeMargin () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jAccountFreeMargin(iFintecheeUID);
}

double AccountMargin () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jAccountMargin(iFintecheeUID);
}

double AccountProfit () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jAccountProfit(iFintecheeUID);
}

int OrdersTotal () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrdersTotal(iFintecheeUID);
}

int OrdersHistoryTotal () {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrdersHistoryTotal(iFintecheeUID);
}
int HistoryTotal () {
  return OrdersHistoryTotal();
}

bool OrderSelect(int index, int select, int pool) {
  if (paramHandleList[iFintecheeUID].bInit) return false;
  return jOrderSelect(iFintecheeUID, index, select, pool) == 1;
}

bool OrderSelect(int index, int select) {
  return OrderSelect(index, select, MODE_TRADES) == 1;
}

double OrderOpenPrice() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderOpenPrice(iFintecheeUID);
}

int OrderType() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderType(iFintecheeUID);
}

double OrderTakeProfit() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderTakeProfit(iFintecheeUID);
}

double OrderStopLoss() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderStopLoss(iFintecheeUID);
}

double OrderLots() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderLots(iFintecheeUID);
}

double OrderProfit() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderProfit(iFintecheeUID);
}

string OrderSymbol() {
  if (paramHandleList[iFintecheeUID].bInit) return "";
  string symbol(jOrderSymbol(iFintecheeUID));
  return symbol;
}

int OrderTicket() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderTicket(iFintecheeUID);
}

int OrderMagicNumber() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderMagicNumber(iFintecheeUID);
}

datetime OrderOpenTime() {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return jOrderOpenTime(iFintecheeUID);
}

void OrderPrint() {
  if (paramHandleList[iFintecheeUID].bInit) return;
  jOrderPrint(iFintecheeUID);
}

template <class Type, class... Types>
void Print (const Type & arg, const Types &... args) {
  stringstream s;
  s << arg;
  ((s << args), ..., (s << endl));
  jPrint(iFintecheeUID, s.str().c_str());
}

// todo
template <class Type, class... Types>
void Comment (const Type & arg, const Types &... args) {
  stringstream s;
  s << arg;
  ((s << args), ..., (s << endl));
  jPrint(iFintecheeUID, s.str().c_str());
}

// todo
template <class Type, class... Types>
void Alert (const Type & arg, const Types &... args) {
  stringstream s;
  s << arg;
  ((s << args), ..., (s << endl));
  jPrint(iFintecheeUID, s.str().c_str());
}

bool PlaySound (string name) {
  Print("Playing: ", name);
  return true;
}

datetime iTime (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiTimeInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiTime(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
datetime iTime (long symbol, int timeframe, int shift) {
  return iTime("", timeframe, shift);
}
double iOpen (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiOpenInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiOpen(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iOpen (long symbol, int timeframe, int shift) {
  return iOpen("", timeframe, shift);
}
double iHigh (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiHighInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiHigh(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iHigh (long symbol, int timeframe, int shift) {
  return iHigh("", timeframe, shift);
}
double iLow (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiLowInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiLow(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iLow (long symbol, int timeframe, int shift) {
  return iLow("", timeframe, shift);
}
double iClose (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiCloseInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiClose(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iClose (long symbol, int timeframe, int shift) {
  return iClose("", timeframe, shift);
}
long iVolume (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiVolumeInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiVolume(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
long iVolume (long symbol, int timeframe, int shift) {
  return iVolume("", timeframe, shift);
}

double iAC (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iAC_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiACInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiAC(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iAC (long symbol, int timeframe, int shift) {
  return iAC("", timeframe, shift);
}

double iADX (string symbol, int timeframe, int period, int applied_price, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iADX_") + string(symbol) + string("_") + tf + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiADXInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiADX(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_ADX), shift);
  }
}
double iADX (long symbol, int timeframe, int period, int applied_price, int mode, int shift) {
  return iADX("", timeframe, period, applied_price, mode, shift);
}

double iAlligator (
  string symbol, int timeframe, int jaw_period, int jaw_shift, int teeth_period, int teeth_shift, int lips_period, int lips_shift,
  int ma_method, int applied_price, int mode, int shift) {

  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iAlligator_") + string(symbol) + string("_") + tf + string("_") +
    to_string(jaw_period) + string("_") + to_string(jaw_shift) + string("_") + to_string(teeth_period) + string("_") + to_string(teeth_shift) + string("_") + to_string(lips_period) + string("_") + to_string(lips_shift) + string("_") + to_string(ma_method) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiAlligatorInit(iFintecheeUID, symbol, tf, jaw_period, jaw_shift, teeth_period, teeth_shift, lips_period, lips_shift, convertMAMethod(ma_method), applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiAlligator(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], jaw_shift, teeth_shift, lips_shift, convertMode(mode, INDI_ALLIGATOR), shift);
  }
}
double iAlligator (
  long symbol, int timeframe, int jaw_period, int jaw_shift, int teeth_period, int teeth_shift, int lips_period, int lips_shift,
  int ma_method, int applied_price, int mode, int shift) {
  return iAlligator("", timeframe, jaw_period, jaw_shift, teeth_period, teeth_shift, lips_period, lips_shift, ma_method, applied_price, mode, shift);
}

double iAO (string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iAO_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiAOInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiAO(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iAO (long symbol, int timeframe, int shift) {
  return iAO("", timeframe, shift);
}

double iATR (string symbol, int timeframe, int period, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iATR_") + string(symbol) + string("_") + tf + string("_") + to_string(period);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiATRInit(iFintecheeUID, symbol, tf, period);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiATR(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iATR (long symbol, int timeframe, int period, int shift) {
  return iATR("", timeframe, period, shift);
}

double iBearsPower (string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iBearsPower_") + string(symbol) + string("_") + tf + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiBearsPowerInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiBearsPower(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iBearsPower (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iBearsPower("", timeframe, period, applied_price, shift);
}

double iBands (string symbol, int timeframe, int period, double deviation, int bands_shift, int applied_price, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iBands_") + string(symbol) + string("_") + tf + string("_") + to_string(period) + string("_") + to_string(deviation) + string("_") + to_string(bands_shift) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiBandsInit(iFintecheeUID, symbol, tf, period, deviation, bands_shift, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiBands(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], bands_shift, convertMode(mode, INDI_BANDS), shift);
  }
}
double iBands (long symbol, int timeframe, int period, double deviation, int bands_shift, int applied_price, int mode, int shift) {
  return iBands("", timeframe, period, deviation, bands_shift, applied_price, mode, shift);
}
double iBandsOnArray (double* array, int total, int period, double deviation, int bands_shift, int mode, int shift) {
  if (paramHandleList[iFintecheeUID].bInit) return 0;
  return jiBandsOnArray(iFintecheeUID, array, total, period, deviation, bands_shift, convertMode(mode, INDI_BANDS), shift);
}

double iBullsPower (string  symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iBullsPower_") + string(symbol) + string("_") + tf + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiBullsPowerInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiBullsPower(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iBullsPower (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iBullsPower("", timeframe, period, applied_price, shift);
}

double iCCI (string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iCCI_") + string(symbol) + string("_") + tf + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiCCIInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiCCI(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iCCI (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iCCI("", timeframe, period, applied_price, shift);
}
double iCCIOnArray (double* array, int total, int period, int shift) {
  if (paramHandleList[iFintecheeUID].bInit) return 0;
  return jiCCIOnArray(iFintecheeUID, array, total, period, shift);
}

template<class...Ts>
double iCustom (string symbol, int timeframe, const char* name, Ts&&... args) {
  const char* tf = convertTimeFrame(timeframe);
  stringstream s;
  const char* mode;
  int shift;
  int length = sizeof...(args);

  int i = 0;
  auto loop = [&] (auto && input) {
    if (i >= 0 && i < length - 2) {
      s << input << "|||";
    } else if (i == length - 2) {
      mode = (const char*)input;
    } else if (i == length - 1) {
      shift = (int)input;
    }
    i++;
  };

  (loop(args), ...);

  string strID = string("iCustom_") + string(symbol) + string("_") + tf + string("_") + string(name) + string("_") + s.str();
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiCustomInit(iFintecheeUID, symbol, tf, name, s.str().c_str());
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiCustom(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], mode, shift);
  }
}
template<class...Ts>
double iCustom (long symbol, int timeframe, const char* name, Ts&&... args) {
  return iCustom("", timeframe, name, args...);
}

double iDeMarker (string symbol, int timeframe, int period, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iDeMarker_") + string(symbol) + string("_") + tf + string("_") + to_string(period);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiDeMarkerInit(iFintecheeUID, symbol, tf, period);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiDeMarker(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iDeMarker (long symbol, int timeframe, int period, int shift) {
  return iDeMarker("", timeframe, period, shift);
}

double iEnvelopes (string symbol, int timeframe, int ma_period, int ma_method, int ma_shift, int applied_price, double deviation, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iEnvelopes_") + string(symbol) + string("_") + tf + string("_") + to_string(ma_period) + string("_") + to_string(ma_method) + string("_") + to_string(ma_shift) + string("_") + to_string(applied_price) + string("_") + to_string(deviation);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiEnvelopesInit(iFintecheeUID, symbol, tf, ma_period, convertMAMethod(ma_method), ma_shift, applied_price, deviation);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiEnvelopes(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], ma_shift, convertMode(mode, INDI_ENVELOPES), shift);
  }
}
double iEnvelopes (long symbol, int timeframe, int ma_period, int ma_method, int ma_shift, int applied_price, double deviation, int mode, int shift) {
  return iEnvelopes("", timeframe, ma_period, ma_method, ma_shift, applied_price, deviation, mode, shift);
}
double iEnvelopesOnArray (double* array, int total, int ma_period, int ma_method, int ma_shift, double deviation, int mode, int shift) {
  if (paramHandleList[iFintecheeUID].bInit) return 0;
  return jiEnvelopesOnArray(iFintecheeUID, array, total, ma_period, convertMAMethod(ma_method), ma_shift, deviation, convertMode(mode, INDI_ENVELOPES), shift);
}

double iFractals (string symbol, int timeframe, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iFractals_") + string(symbol) + string("_") + tf;
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiFractalsInit(iFintecheeUID, symbol, tf);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiFractals(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_FRACTALS), shift);
  }
}
double iFractals (long symbol, int timeframe, int mode, int shift) {
  return iFractals("", timeframe, mode, shift);
}

 double iIchimoku (string symbol, int timeframe, int tenkan_sen, int kijun_sen, int senkou_span_b, int mode, int shift) {
   const char* tf = convertTimeFrame(timeframe);
   string strID = string("iIchimoku_") + string(symbol) + string("_") + tf + string("_") + to_string(tenkan_sen) + string("_") + to_string(kijun_sen) + string("_") + to_string(senkou_span_b);
   if (paramHandleList[iFintecheeUID].bInit) {
     int handle = jiIchimokuInit(iFintecheeUID, symbol, tf, tenkan_sen, kijun_sen, senkou_span_b);
     paramHandleList[iFintecheeUID].handleList[strID] = handle;
     return 0;
   } else {
     if (mode == MODE_TENKANSEN) {
       return jiIchimoku(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], 0, convertMode(mode, INDI_ICHIMOKU), shift);
     } else if (mode == MODE_KIJUNSEN) {
       return jiIchimoku(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], 0, convertMode(mode, INDI_ICHIMOKU), shift);
     } else if (mode == MODE_SENKOUSPANA) {
       return jiIchimoku(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], kijun_sen, convertMode(mode, INDI_ICHIMOKU), shift);
     } else if (mode == MODE_SENKOUSPANB) {
       return jiIchimoku(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], kijun_sen, convertMode(mode, INDI_ICHIMOKU), shift);
     } else {
       return jiIchimoku(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], -kijun_sen, convertMode(mode, INDI_ICHIMOKU), shift);
     }
   }
 }
 double iIchimoku (long symbol, int timeframe, int tenkan_sen, int kijun_sen, int senkou_span_b, int mode, int shift) {
   return iIchimoku("", timeframe, tenkan_sen, kijun_sen, senkou_span_b, mode, shift);
 }

double iMA (string symbol, int timeframe, int ma_period, int ma_shift, int ma_method, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iMA_") + string(symbol) + string("_") + tf + string("_") + to_string(ma_period) + string("_") + to_string(ma_shift) + string("_") + to_string(ma_method) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiMAInit(iFintecheeUID, symbol, tf, ma_period, ma_shift, ma_method, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiMA(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], ma_shift, convertMAMethod(ma_method), shift);
  }
}
double iMA (long symbol, int timeframe, int ma_period, int ma_shift, int ma_method, int applied_price, int shift) {
  return iMA("", timeframe, ma_period, ma_shift, ma_method, applied_price, shift);
}
double iMAOnArray (double* array, int total, int ma_period, int ma_shift, int ma_method, int shift) {
  if (paramHandleList[iFintecheeUID].bInit) return 0;
  return jiMAOnArray(iFintecheeUID, array, total, ma_period, ma_shift, convertMAMethod(ma_method), shift);
}

double iMACD (string symbol, int timeframe, int fast_ema_period, int slow_ema_period, int signal_period, int applied_price, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iMACD_") + string(symbol) + string("_") + tf + string("_") + to_string(fast_ema_period) + string("_") + to_string(slow_ema_period) + string("_") + to_string(signal_period) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiMACDInit(iFintecheeUID, symbol, tf, fast_ema_period, slow_ema_period, signal_period, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiMACD(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_MACD), shift);
  }
}
double iMACD (long symbol, int timeframe, int fast_ema_period, int slow_ema_period, int signal_period, int applied_price, int mode, int shift) {
  return iMACD("", timeframe, fast_ema_period, slow_ema_period, signal_period, applied_price, mode, shift);
}

double iMomentum (string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iMomentum_") + string(symbol) + string("_") + tf + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiMomentumInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiMomentum(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iMomentum (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iMomentum("", timeframe, period, applied_price, shift);
}
double iMomentumOnArray (double* array, int total, int period, int shift) {
  if (paramHandleList[iFintecheeUID].bInit) return 0;
  return jiMomentumOnArray(iFintecheeUID, array, total, period, shift);
}

double iRSI (string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iRSI_") + string(symbol) + string("_") + tf + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiRSIInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiRSI(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iRSI (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iRSI("", timeframe, period, applied_price, shift);
}
double iRSIOnArray (double* array, int total, int period, int shift) {
  if (paramHandleList[iFintecheeUID].bInit) return 0;
  return jiRSIOnArray(iFintecheeUID, array, total, period, shift);
}

double iRVI (string symbol, int timeframe, int period, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iRVI_") + string(symbol) + string("_") + tf + string("_") + to_string(period);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiRVIInit(iFintecheeUID, symbol, tf, period);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiRVI(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_RVI), shift);
  }
}
double iRVI (long symbol, int timeframe, int period, int mode, int shift) {
  return iRVI("", timeframe, period, mode, shift);
}

double iSAR (string symbol, int timeframe, double step, double maximum, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iSAR_") + string(symbol) + string("_") + tf + string("_") + to_string(step) + string("_") + to_string(maximum);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiSARInit(iFintecheeUID, symbol, tf, step, maximum);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiSAR(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iSAR (long symbol, int timeframe, double step, double maximum, int shift) {
  return iSAR("", timeframe, step, maximum, shift);
}

double iStochastic (string symbol, int timeframe, int Kperiod, int Dperiod, int slowing, int method, int price_field, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iStochastic_") + string(symbol) + string("_") + tf + string("_") + to_string(Kperiod) + string("_") + to_string(Dperiod) + string("_") + to_string(slowing) + string("_") + to_string(method);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiStochasticInit(iFintecheeUID, symbol, tf, Kperiod, Dperiod, slowing, convertMAMethod(method));
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiStochastic(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_STOCHASTIC), shift);
  }
}
double iStochastic (long symbol, int timeframe, int Kperiod, int Dperiod, int slowing, int method, int price_field, int mode, int shift) {
  return iStochastic("", timeframe, Kperiod, Dperiod, slowing, method, price_field, mode, shift);
}

double iWPR (string symbol, int timeframe, int period, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iWPR_") + string(symbol) + string("_") + tf + string("_") + to_string(period);
  if (paramHandleList[iFintecheeUID].bInit) {
    int handle = jiWPRInit(iFintecheeUID, symbol, tf, period);
    paramHandleList[iFintecheeUID].handleList[strID] = handle;
    return 0;
  } else {
    return jiWPR(iFintecheeUID, paramHandleList[iFintecheeUID].handleList[strID], shift);
  }
}
double iWPR (long symbol, int timeframe, int period, int shift) {
  return iWPR("", timeframe, period, shift);
}

bool ObjectCreate (long chart_id, const char* object_name, ENUM_OBJECT object_type, int sub_window, datetime time, double price) {
  if (paramHandleList[iFintecheeUID].bInit) return false;
  if (object_type == OBJ_ARROW_CHECK) {
    return jARROW_CHECKCreate(iFintecheeUID, chart_id, object_name, time, price) == 1;
  } else {
    return false;
  }
}

bool ObjectDelete (const char* object_name) {
  if (paramHandleList[iFintecheeUID].bInit) return false;
  return jARROW_CHECKDelete(iFintecheeUID, object_name) == 1;
}
bool ObjectDelete (long chart_id, const char* object_name) {
  return ObjectDelete(object_name);
}

int OrderSend (string symbol, int cmd, double volume, double price, int slippage, double stoploss, double takeprofit, string comment, int magic, datetime expiration, int arrow_color) {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  if (cmd == OP_BUY || cmd == OP_SELL) {
    return jOrderSend(iFintecheeUID, symbol, convertCmd(cmd), volume, 0, slippage, stoploss, takeprofit, comment, magic, expiration, arrow_color);
  } else {
    return jOrderSend(iFintecheeUID, symbol, convertCmd(cmd), volume, price, slippage, stoploss, takeprofit, comment, magic, expiration, arrow_color);
  }
}
int OrderSend (long symbol, int cmd, double volume, double price, int slippage, double stoploss, double takeprofit, string comment, int magic, datetime expiration, int arrow_color) {
  if (paramHandleList[iFintecheeUID].bInit) return -1;
  return OrderSend("", cmd, volume, price, slippage, stoploss, takeprofit, comment, magic, expiration, arrow_color);
}

bool OrderModify (int ticket, double price, double stoploss, double takeprofit, datetime expiration, int arrow_color) {
  if (paramHandleList[iFintecheeUID].bInit) return false;
  return jOrderModify (iFintecheeUID, ticket, OrderLots(), price, 0, stoploss, takeprofit, "", expiration, arrow_color) == 1;
}

bool OrderClose(int ticket, double lots, double price, int slippage, int arrow_color) {
  if (paramHandleList[iFintecheeUID].bInit) return false;
  return jOrderClose(iFintecheeUID, ticket, lots, price, slippage, arrow_color) == 1;
}

bool OrderDelete(int ticket, int arrow_color) {
  if (paramHandleList[iFintecheeUID].bInit) return false;
  return jOrderDelete(iFintecheeUID, ticket, arrow_color) == 1;
}

// todo, check whether the logic about the return value is the same as MQL4
datetime GlobalVariableSet (string name, double value) {
  return setGlobalVar(iFintecheeUID, name, value);
}

bool GlobalVariableCheck (string name) {
  return checkGlobalVar(iFintecheeUID, name);
}

double GlobalVariableGet (string name) {
  return getGlobalVar(iFintecheeUID, name);
}

bool GlobalVariableDel (string name) {
  return delGlobalVar(iFintecheeUID, name);
}

bool IsTesting () {
  return jIsTesting() == 1;
}
