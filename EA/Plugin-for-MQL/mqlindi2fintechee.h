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

const int MODE_MAIN = 0;
const int MODE_SIGNAL = 1;
const int MODE_PLUSDI = 1;
const int MODE_MINUSDI = 2;
const int MODE_UPPER = 1;
const int MODE_LOWER = 2;
const int MODE_GATORJAW = 1;
const int MODE_GATORTEETH = 2;
const int MODE_GATORLIPS = 3;
const int MODE_TENKANSEN = 1;
const int MODE_KIJUNSEN = 2;
const int MODE_SENKOUSPANA = 3;
const int MODE_SENKOUSPANB = 4;
const int MODE_CHIKOUSPAN = 5;
const int MODE_OPEN = 0;
const int MODE_LOW = 1;
const int MODE_HIGH = 2;
const int MODE_CLOSE = 3;
const int MODE_VOLUME = 4;
const int MODE_TIME = 5;
const int MODE_BID = 9;
const int MODE_ASK = 10;
const int MODE_POINT = 11;
const int MODE_DIGITS = 12;
const int MODE_SPREAD = 13;
const int MODE_SWAPLONG = 18;
const int MODE_SWAPSHORT = 19;
const int MODE_TRADEALLOWED = 22;
const int MODE_MINLOT = 23;
const int MODE_LOTSTEP = 24;
const int MODE_MAXLOT = 25;

// MQL has no these enumerations.
const int INDI_OHLC = 0;
const int INDI_ADX = 1;
const int INDI_ALLIGATOR = 2;
const int INDI_BANDS = 3;
const int INDI_ENVELOPES = 4;
const int INDI_FRACTALS = 5;
const int INDI_ICHIMOKU = 6;
const int INDI_MACD = 7;
const int INDI_RVI = 8;
const int INDI_STOCHASTIC = 9;

const int MODE_ASCEND = 1;
const int MODE_DESCEND = 2;

const int TIME_DATE = 4;
const int TIME_MINUTES = 2;
const int TIME_SECONDS = 1;

const int Green = 0;
const int Red = 0;
const int Violet = 0;
const int White = 0;
const int Yellow = 0;
const int Blue = 0;
const int FireBrick = 0;
const int Pink = 0;
const int Lime = 0;

const int EMPTY = -1;
const int EMPTY_VALUE = 0x7FFFFFFF;
const int CLR_NONE = -1;
const int clrNONE = -1;
const int CHARTS_MAX = 100;
const int INVALID_HANDLE = -1;
const int WHOLE_ARRAY = 0;
const int WRONG_VALUE = -1;

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
  } else if (MODE_OPEN == mode && indi == INDI_OHLC) {
    return "Open";
  } else if (MODE_LOW == mode && indi == INDI_OHLC) {
    return "Low";
  } else if (MODE_HIGH == mode && indi == INDI_OHLC) {
    return "High";
  } else if (MODE_CLOSE == mode && indi == INDI_OHLC) {
    return "Close";
  } else if (MODE_VOLUME == mode && indi == INDI_OHLC) {
    return "Volume";
  } else if (MODE_TIME == mode && indi == INDI_OHLC) {
    return "Time";
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

void (*jPrint) (int, const string);
void (*jSetIndexShift) (int, int, int);
long (*jChartID) (int);
int (*jChartPeriod) (int, long);
const char* (*jChartSymbol) (int, long);
int (*jPeriod) (int);
const char* (*jSymbol) (int);
int (*jiTimeInit) (int, const string, const char*);
datetime (*jiTime) (int, int, int);
int (*jiOpenInit) (int, const string, const char*);
double (*jiOpen) (int, int, int);
int (*jiHighInit) (int, const string, const char*);
double (*jiHigh) (int, int, int);
int (*jiLowInit) (int, const string, const char*);
double (*jiLow) (int, int, int);
int (*jiCloseInit) (int, const string, const char*);
double (*jiClose) (int, int, int);
int (*jiVolumeInit) (int, const string, const char*);
long (*jiVolume) (int, int, int);
int (*jiHighest) (int, int, const char*, int, int);
int (*jiLowest) (int, int, const char*, int, int);
int (*jiACInit) (int, const string, const char*);
double (*jiAC) (int, int, int);
int (*jiADXInit) (int, const string, const char*, int, int);
double (*jiADX) (int, int, const char*, int);
int (*jiAlligatorInit) (int, const string, const char*, int, int, int, int, int, int, const char*, int);
double (*jiAlligator) (int, int, int, int, int, const char*, int);
int (*jiAOInit) (int, const string, const char*);
double (*jiAO) (int, int, int);
int (*jiATRInit) (int, const string, const char*, int);
double (*jiATR) (int, int, int);
int (*jiBearsPowerInit) (int, const string, const char*, int, int);
double (*jiBearsPower) (int, int, int);
int (*jiBandsInit) (int, const string, const char*, int, double, int, int);
double (*jiBands) (int, int, int, const char*, int);
double (*jiBandsOnArray) (int, double*, int, int, double, int, const char*, int);
int (*jiBullsPowerInit) (int, const string, const char*, int, int);
double (*jiBullsPower) (int, int, int);
int (*jiCCIInit) (int, const string, const char*, int, int);
double (*jiCCI) (int, int, int);
double (*jiCCIOnArray) (int, double*, int, int, int);
int (*jiCustomInit) (int, const string, const char*, const string, const char*);
double (*jiCustom) (int, int, const char*, int);
int (*jiDeMarkerInit) (int, const string, const char*, int);
double (*jiDeMarker) (int, int, int);
int (*jiEnvelopesInit) (int, const string, const char*, int, const char*, int, int, double);
double (*jiEnvelopes) (int, int, int, const char*, int);
double (*jiEnvelopesOnArray) (int, double*, int, int, const char*, int, double, const char*, int);
int (*jiFractalsInit) (int, const string, const char*);
double (*jiFractals) (int, int, const char*, int);
int (*jiIchimokuInit) (int, const string, const char*, int, int, int);
double (*jiIchimoku) (int, int, int, const char*, int);
int (*jiMAInit) (int, const string, const char*, int, int, int, int);
double (*jiMA) (int, int, int, const char*, int);
double (*jiMAOnArray) (int, double*, int, int, int, const char*, int);
int (*jiMACDInit) (int, const string, const char*, int, int, int, int);
double (*jiMACD) (int, int, const char*, int);
int (*jiMomentumInit) (int, const string, const char*, int, int);
double (*jiMomentum) (int, int, int);
double (*jiMomentumOnArray) (int, double*, int, int, int);
int (*jiRSIInit) (int, const string, const char*, int, int);
double (*jiRSI) (int, int, int);
double (*jiRSIOnArray) (int, double*, int, int, int);
int (*jiRVIInit) (int, const string, const char*, int);
double (*jiRVI) (int, int, const char*, int);
int (*jiSARInit) (int, const string, const char*, double, double);
double (*jiSAR) (int, int, int);
int (*jiStochasticInit) (int, const string, const char*, int, int, int, const char*);
double (*jiStochastic) (int, int, const char*, int);
int (*jiWPRInit) (int, const string, const char*, int);
double (*jiWPR) (int, int, int);
double (*jMarketInfo) (int, const string, int);

EM_JS(bool, jVeriSig, (const char* fintechee_data, const char* fintechee_signature, const char* fintechee_public_key), {
  return Asyncify.handleSleep(function (wakeUp) {
    if (typeof veriSig == "undefined") {
      wakeUp(false);
      return;
    }

    const data = UTF8ToString(fintechee_data);
    const signature = UTF8ToString(fintechee_signature);
    const public_key = UTF8ToString(fintechee_public_key);

    veriSig(false, data, signature, public_key)
    .then(function (res) {
      if (res) {
        wakeUp(res);
      } else {
        printErrorMessage("Signature verification failed.");
        wakeUp(res);
      }
    })
    .catch(function (e) {
      printErrorMessage(e.message);
      wakeUp(false);
    })
  });
});

void Sleep (int milliseconds) {
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
int StringLen (const string string_value) {
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
string TimeToString (datetime value, int mode) {
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
double StringToDouble (const string value) {
  return stod(value);
}
double StrToDouble (const string value) {
  return StringToDouble(value);
}
int StringToInteger (const string value) {
  return stoi(value);
}
int StrToInteger (const string value) {
  return StringToInteger(value);
}
datetime StringToTime (const string value) {
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
datetime StrToTime (const string value) {
  return StringToTime(value);
}
int StringCompare (const string str1, const string str2, bool case_sensitive = true) {
  if (case_sensitive) {
    return strcmp(str1.c_str(), str2.c_str());
  } else {
    return strcasecmp(str1.c_str(), str2.c_str());
  }
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
  string paramString;
};

struct DataInput {
  int length;
  double* buffer;
};

struct DataOutput {
  int length;
  double* buffer;
};

struct GlobalVar {
  datetime time;
  double value;
};

struct ParamInputOutputItem {
  vector<struct Parameter> paramList;
  vector<struct DataInput> dataInputList;
  vector<struct DataOutput> dataOutputList;
  map<string, int> handleList;
  map<string, struct GlobalVar> globalVarList;
};

map<int, struct ParamInputOutputItem> paramInputOutputList;
int iFintecheeUID;
int Bars;
double Point;
int Digits;

void setParam (int uid, const struct Parameter & parameter) {
  if (paramInputOutputList.find(uid) != paramInputOutputList.end()) {
    paramInputOutputList[uid].paramList.push_back(parameter);
  } else {
    struct ParamInputOutputItem item;
    item.paramList.push_back(parameter);
    paramInputOutputList[uid] = item;
  }
}

datetime setGlobalVar (int uid, const string name, double value) {
  struct GlobalVar globalVar;
  globalVar.time = TimeCurrent();

  if (paramInputOutputList.find(uid) != paramInputOutputList.end()) {
    datetime time = paramInputOutputList[uid].globalVarList.count(name) > 0 ? paramInputOutputList[uid].globalVarList[name].time : globalVar.time;
    paramInputOutputList[uid].globalVarList[name] = globalVar;
    return time;
  } else {
    struct ParamInputOutputItem item;
    item.globalVarList[name] = globalVar;
    paramInputOutputList[uid] = item;
    return globalVar.time;
  }
}

bool checkGlobalVar (int uid, const string name) {
  if (paramInputOutputList.find(uid) != paramInputOutputList.end()) {
    return paramInputOutputList[uid].globalVarList.count(name) > 0;
  } else {
    return false;
  }
}

double getGlobalVar (int uid, const string name) {
  if (paramInputOutputList.find(uid) != paramInputOutputList.end()) {
    return paramInputOutputList[uid].globalVarList.count(name) > 0 ? paramInputOutputList[uid].globalVarList[name].value : 0;
  } else {
    return 0;
  }
}

bool delGlobalVar (int uid, const string name) {
  if (paramInputOutputList.find(uid) != paramInputOutputList.end()) {
    if (paramInputOutputList[uid].globalVarList.count(name) > 0) {
      paramInputOutputList[uid].globalVarList.erase(name);
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
  parameter.paramType = 's';
  parameter.paramString = param;
  setParam(uid, parameter);
}
EMSCRIPTEN_KEEPALIVE
void setDataInput (int uid, int length, double* buffer) {
  struct DataInput dataInput;
  dataInput.length = length;
  dataInput.buffer = buffer;
  if (paramInputOutputList.find(uid) != paramInputOutputList.end()) {
    paramInputOutputList[uid].dataInputList.push_back(dataInput);
  } else {
    struct ParamInputOutputItem item;
    item.dataInputList.push_back(dataInput);
    paramInputOutputList[uid] = item;
  }
}
EMSCRIPTEN_KEEPALIVE
void setDataOutput (int uid, int length, double* buffer) {
  struct DataOutput dataOutput;
  dataOutput.length = length;
  dataOutput.buffer = buffer;
  if (paramInputOutputList.find(uid) != paramInputOutputList.end()) {
    paramInputOutputList[uid].dataOutputList.push_back(dataOutput);
  } else {
    struct ParamInputOutputItem item;
    item.dataOutputList.push_back(dataOutput);
    paramInputOutputList[uid] = item;
  }
}
EMSCRIPTEN_KEEPALIVE
void setjPrint (void (*f) (int, const string)) {
  jPrint = f;
}
EMSCRIPTEN_KEEPALIVE
void setjSetIndexShift (void (*f) (int, int, int)) {
  jSetIndexShift = f;
}
EMSCRIPTEN_KEEPALIVE
void setjChartID (long (*f) (int)) {
  jChartID = f;
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
void setjiTimeInit (int (*f) (int, const string, const char*)) {
  jiTimeInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiTime (datetime (*f) (int, int, int)) {
  jiTime = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiOpenInit (int (*f) (int, const string, const char*)) {
  jiOpenInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiOpen (double (*f) (int, int, int)) {
  jiOpen = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiHighInit (int (*f) (int, const string, const char*)) {
  jiHighInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiHigh (double (*f) (int, int, int)) {
  jiHigh = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiLowInit (int (*f) (int, const string, const char*)) {
  jiLowInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiLow (double (*f) (int, int, int)) {
  jiLow = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCloseInit (int (*f) (int, const string, const char*)) {
  jiCloseInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiClose (double (*f) (int, int, int)) {
  jiClose = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiVolumeInit (int (*f) (int, const string, const char*)) {
  jiVolumeInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiVolume (long (*f) (int, int, int)) {
  jiVolume = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiHighest (int (*f) (int, int, const char*, int, int)) {
  jiHighest = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiLowest (int (*f) (int, int, const char*, int, int)) {
  jiLowest = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiACInit (int (*f) (int, const string, const char*)) {
  jiACInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAC (double (*f) (int, int, int)) {
  jiAC = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiADXInit (int (*f) (int, const string, const char*, int, int)) {
  jiADXInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiADX (double (*f) (int, int, const char*, int)) {
  jiADX = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAlligatorInit (int (*f) (int, const string, const char*, int, int, int, int, int, int, const char*, int)) {
  jiAlligatorInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAlligator (double (*f) (int, int, int, int, int, const char*, int)) {
  jiAlligator = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAOInit (int (*f) (int, const string, const char*)) {
  jiAOInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiAO (double (*f) (int, int, int)) {
  jiAO = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiATRInit (int (*f) (int, const string, const char*, int)) {
  jiATRInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiATR (double (*f) (int, int, int)) {
  jiATR = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBearsPowerInit (int (*f) (int, const string, const char*, int, int)) {
  jiBearsPowerInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBearsPower (double (*f) (int, int, int)) {
  jiBearsPower = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBandsInit (int (*f) (int, const string, const char*, int, double, int, int)) {
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
void setjiBullsPowerInit (int (*f) (int, const string, const char*, int, int)) {
  jiBullsPowerInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiBullsPower (double (*f) (int, int, int)) {
  jiBullsPower = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCCIInit (int (*f) (int, const string, const char*, int, int)) {
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
void setjiCustomInit (int (*f) (int, const string, const char*, const string, const char*)) {
  jiCustomInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiCustom (double (*f) (int, int, const char*, int)) {
  jiCustom = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiDeMarkerInit (int (*f) (int, const string, const char*, int)) {
  jiDeMarkerInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiDeMarker (double (*f) (int, int, int)) {
  jiDeMarker = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiEnvelopesInit (int (*f) (int, const string, const char*, int, const char*, int, int, double)) {
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
void setjiFractalsInit (int (*f) (int, const string, const char*)) {
  jiFractalsInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiFractals (double (*f) (int, int, const char*, int)) {
  jiFractals = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiIchimokuInit (int (*f) (int, const string, const char*, int, int, int)) {
  jiIchimokuInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiIchimoku (double (*f) (int, int, int, const char*, int)) {
  jiIchimoku = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMAInit (int (*f) (int, const string, const char*, int, int, int, int)) {
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
void setjiMACDInit (int (*f) (int, const string, const char*, int, int, int, int)) {
  jiMACDInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMACD (double (*f) (int, int, const char*, int)) {
  jiMACD = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiMomentumInit (int (*f) (int, const string, const char*, int, int)) {
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
void setjiRSIInit (int (*f) (int, const string, const char*, int, int)) {
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
void setjiRVIInit (int (*f) (int, const string, const char*, int)) {
  jiRVIInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiRVI (double (*f) (int, int, const char*, int)) {
  jiRVI = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiSARInit (int (*f) (int, const string, const char*, double, double)) {
  jiSARInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiSAR (double (*f) (int, int, int)) {
  jiSAR = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiStochasticInit (int (*f) (int, const string, const char*, int, int, int, const char*)) {
  jiStochasticInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiStochastic (double (*f) (int, int, const char*, int)) {
  jiStochastic = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiWPRInit (int (*f) (int, const string, const char*, int)) {
  jiWPRInit = f;
}
EMSCRIPTEN_KEEPALIVE
void setjiWPR (double (*f) (int, int, int)) {
  jiWPR = f;
}
EMSCRIPTEN_KEEPALIVE
void setjMarketInfo (double (*f) (int, const string, int)) {
  jMarketInfo = f;
}

}

template <class Type, class... Types>
void Print (const Type & arg, const Types &... args) {
  stringstream s;
  s << arg;
  ((s << args), ..., (s << endl));
  jPrint(iFintecheeUID, s.str());
}

// todo
template <class Type, class... Types>
void Comment (const Type & arg, const Types &... args) {
  stringstream s;
  s << arg;
  ((s << args), ..., (s << endl));
  jPrint(iFintecheeUID, s.str());
}

// todo
template <class Type, class... Types>
void Alert (const Type & arg, const Types &... args) {
  stringstream s;
  s << arg;
  ((s << args), ..., (s << endl));
  jPrint(iFintecheeUID, s.str());
}

bool PlaySound (const string name) {
  Print("Playing: ", name);
  return true;
}

void SetIndexShift (int index, int shift) {
  jSetIndexShift(iFintecheeUID, index, shift);
}

long ChartID () {
  return jChartID(iFintecheeUID);
}

ENUM_TIMEFRAMES ChartPeriod (long chart_id) {
  return (ENUM_TIMEFRAMES)jChartPeriod(iFintecheeUID, chart_id);
}
ENUM_TIMEFRAMES ChartPeriod () {
  return ChartPeriod(0);
}

string ChartSymbol (long chart_id) {
  string symbol(jChartSymbol(iFintecheeUID, chart_id));
  return symbol;
}
string ChartSymbol () {
  return ChartSymbol(0);
}

ENUM_TIMEFRAMES Period () {
  return (ENUM_TIMEFRAMES)jPeriod(iFintecheeUID);
}

string Symbol () {
  string symbol(jSymbol(iFintecheeUID));
  return symbol;
}

datetime iTime (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiTimeInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiTime(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
datetime iTime (long symbol, int timeframe, int shift) {
  return iTime("", timeframe, shift);
}
double iOpen (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiOpenInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiOpen(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iOpen (long symbol, int timeframe, int shift) {
  return iOpen("", timeframe, shift);
}
double iHigh (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiHighInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiHigh(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iHigh (long symbol, int timeframe, int shift) {
  return iHigh("", timeframe, shift);
}
double iLow (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiLowInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiLow(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iLow (long symbol, int timeframe, int shift) {
  return iLow("", timeframe, shift);
}
double iClose (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiCloseInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiClose(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iClose (long symbol, int timeframe, int shift) {
  return iClose("", timeframe, shift);
}
long iVolume (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiVolumeInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiVolume(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
long iVolume (long symbol, int timeframe, int shift) {
  return iVolume("", timeframe, shift);
}
int iHighest (const string symbol, int timeframe, int type, int count, int start) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiTimeInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiHighest(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], convertMode(type, INDI_OHLC), count, start);
}
int iHighest (long symbol, int timeframe, int type, int count, int start) {
  return iHighest("", timeframe, type, count, start);
}
int Highest (const string symbol, int timeframe, int type, int count, int start) {
  return iHighest (symbol, timeframe, type, count, start);
}
int Highest (long symbol, int timeframe, int type, int count, int start) {
  return iHighest("", timeframe, type, count, start);
}
int iLowest (const string symbol, int timeframe, int type, int count, int start) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("Chart_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiTimeInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiLowest(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], convertMode(type, INDI_OHLC), count, start);
}
int iLowest (long symbol, int timeframe, int type, int count, int start) {
  return iLowest("", timeframe, type, count, start);
}
int Lowest (const string symbol, int timeframe, int type, int count, int start) {
  return iLowest (symbol, timeframe, type, count, start);
}
int Lowest (long symbol, int timeframe, int type, int count, int start) {
  return iLowest("", timeframe, type, count, start);
}

double iAC (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iAC_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiACInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiAC(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iAC (long symbol, int timeframe, int shift) {
  return iAC("", timeframe, shift);
}

double iADX (const string symbol, int timeframe, int period, int applied_price, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iADX_") + symbol + string("_") + string(tf) + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiADXInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiADX(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_ADX), shift);
}
double iADX (long symbol, int timeframe, int period, int applied_price, int mode, int shift) {
  return iADX("", timeframe, period, applied_price, mode, shift);
}

double iAlligator (
  const string symbol, int timeframe, int jaw_period, int jaw_shift, int teeth_period, int teeth_shift, int lips_period, int lips_shift,
  int ma_method, int applied_price, int mode, int shift) {

  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iAlligator_") + symbol + string("_") + string(tf) + string("_") +
    to_string(jaw_period) + string("_") + to_string(jaw_shift) + string("_") + to_string(teeth_period) + string("_") + to_string(teeth_shift) + string("_") + to_string(lips_period) + string("_") + to_string(lips_shift) + string("_") + to_string(ma_method) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiAlligatorInit(iFintecheeUID, symbol, tf, jaw_period, jaw_shift, teeth_period, teeth_shift, lips_period, lips_shift, convertMAMethod(ma_method), applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiAlligator(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], jaw_shift, teeth_shift, lips_shift, convertMode(mode, INDI_ALLIGATOR), shift);
}
double iAlligator (
  long symbol, int timeframe, int jaw_period, int jaw_shift, int teeth_period, int teeth_shift, int lips_period, int lips_shift,
  int ma_method, int applied_price, int mode, int shift) {
  return iAlligator("", timeframe, jaw_period, jaw_shift, teeth_period, teeth_shift, lips_period, lips_shift, ma_method, applied_price, mode, shift);
}

double iAO (const string symbol, int timeframe, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iAO_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiAOInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiAO(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iAO (long symbol, int timeframe, int shift) {
  return iAO("", timeframe, shift);
}

double iATR (const string symbol, int timeframe, int period, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iATR_") + symbol + string("_") + string(tf) + string("_") + to_string(period);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiATRInit(iFintecheeUID, symbol, tf, period);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiATR(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iATR (long symbol, int timeframe, int period, int shift) {
  return iATR("", timeframe, period, shift);
}

double iBearsPower (const string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iBearsPower_") + symbol + string("_") + string(tf) + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiBearsPowerInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiBearsPower(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iBearsPower (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iBearsPower("", timeframe, period, applied_price, shift);
}

double iBands (const string symbol, int timeframe, int period, double deviation, int bands_shift, int applied_price, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iBands_") + symbol + string("_") + string(tf) + string("_") + to_string(period) + string("_") + to_string(deviation) + string("_") + to_string(bands_shift) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiBandsInit(iFintecheeUID, symbol, tf, period, deviation, bands_shift, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiBands(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], bands_shift, convertMode(mode, INDI_BANDS), shift);
}
double iBands (long symbol, int timeframe, int period, double deviation, int bands_shift, int applied_price, int mode, int shift) {
  return iBands("", timeframe, period, deviation, bands_shift, applied_price, mode, shift);
}
double iBandsOnArray (double* array, int total, int period, double deviation, int bands_shift, int mode, int shift) {
  return jiBandsOnArray(iFintecheeUID, array, total, period, deviation, bands_shift, convertMode(mode, INDI_BANDS), shift);
}

double iBullsPower (const string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iBullsPower_") + symbol + string("_") + string(tf) + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiBullsPowerInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiBullsPower(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iBullsPower (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iBullsPower("", timeframe, period, applied_price, shift);
}

double iCCI (const string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iCCI_") + symbol + string("_") + string(tf) + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiCCIInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiCCI(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iCCI (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iCCI("", timeframe, period, applied_price, shift);
}
double iCCIOnArray (double* array, int total, int period, int shift) {
  return jiCCIOnArray(iFintecheeUID, array, total, period, shift);
}

template<class...Ts>
double iCustom (const string symbol, int timeframe, const string name, Ts&&... args) {
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

  string strID = string("iCustom_") + symbol + string("_") + string(tf) + string("_") + string(name) + string("_") + s.str();
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiCustomInit(iFintecheeUID, symbol, tf, name, s.str().c_str());
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiCustom(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], mode, shift);
}
template<class...Ts>
double iCustom (long symbol, int timeframe, const string name, Ts&&... args) {
  return iCustom("", timeframe, name, args...);
}

double iDeMarker (const string symbol, int timeframe, int period, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iDeMarker_") + symbol + string("_") + string(tf) + string("_") + to_string(period);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiDeMarkerInit(iFintecheeUID, symbol, tf, period);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiDeMarker(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iDeMarker (long symbol, int timeframe, int period, int shift) {
  return iDeMarker("", timeframe, period, shift);
}

double iEnvelopes (const string symbol, int timeframe, int ma_period, int ma_method, int ma_shift, int applied_price, double deviation, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iEnvelopes_") + symbol + string("_") + string(tf) + string("_") + to_string(ma_period) + string("_") + to_string(ma_method) + string("_") + to_string(ma_shift) + string("_") + to_string(applied_price) + string("_") + to_string(deviation);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiEnvelopesInit(iFintecheeUID, symbol, tf, ma_period, convertMAMethod(ma_method), ma_shift, applied_price, deviation);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiEnvelopes(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], ma_shift, convertMode(mode, INDI_ENVELOPES), shift);
}
double iEnvelopes (long symbol, int timeframe, int ma_period, int ma_method, int ma_shift, int applied_price, double deviation, int mode, int shift) {
  return iEnvelopes("", timeframe, ma_period, ma_method, ma_shift, applied_price, deviation, mode, shift);
}
double iEnvelopesOnArray (double* array, int total, int ma_period, int ma_method, int ma_shift, double deviation, int mode, int shift) {
  return jiEnvelopesOnArray(iFintecheeUID, array, total, ma_period, convertMAMethod(ma_method), ma_shift, deviation, convertMode(mode, INDI_ENVELOPES), shift);
}

double iFractals (const string symbol, int timeframe, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iFractals_") + symbol + string("_") + string(tf);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiFractalsInit(iFintecheeUID, symbol, tf);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiFractals(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_FRACTALS), shift);
}
double iFractals (long symbol, int timeframe, int mode, int shift) {
  return iFractals("", timeframe, mode, shift);
}

 double iIchimoku (const string symbol, int timeframe, int tenkan_sen, int kijun_sen, int senkou_span_b, int mode, int shift) {
   const char* tf = convertTimeFrame(timeframe);
   string strID = string("iIchimoku_") + symbol + string("_") + string(tf) + string("_") + to_string(tenkan_sen) + string("_") + to_string(kijun_sen) + string("_") + to_string(senkou_span_b);
   if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
     int handle = jiIchimokuInit(iFintecheeUID, symbol, tf, tenkan_sen, kijun_sen, senkou_span_b);
     paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
   }
   if (mode == MODE_TENKANSEN) {
     return jiIchimoku(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], 0, convertMode(mode, INDI_ICHIMOKU), shift);
   } else if (mode == MODE_KIJUNSEN) {
     return jiIchimoku(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], 0, convertMode(mode, INDI_ICHIMOKU), shift);
   } else if (mode == MODE_SENKOUSPANA) {
     return jiIchimoku(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], kijun_sen, convertMode(mode, INDI_ICHIMOKU), shift);
   } else if (mode == MODE_SENKOUSPANB) {
     return jiIchimoku(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], kijun_sen, convertMode(mode, INDI_ICHIMOKU), shift);
   } else {
     return jiIchimoku(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], -kijun_sen, convertMode(mode, INDI_ICHIMOKU), shift);
   }
 }
 double iIchimoku (long symbol, int timeframe, int tenkan_sen, int kijun_sen, int senkou_span_b, int mode, int shift) {
   return iIchimoku("", timeframe, tenkan_sen, kijun_sen, senkou_span_b, mode, shift);
 }

double iMA (const string symbol, int timeframe, int ma_period, int ma_shift, int ma_method, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iMA_") + symbol + string("_") + string(tf) + string("_") + to_string(ma_period) + string("_") + to_string(ma_shift) + string("_") + to_string(ma_method) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiMAInit(iFintecheeUID, symbol, tf, ma_period, ma_shift, ma_method, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiMA(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], ma_shift, convertMAMethod(ma_method), shift);
}
double iMA (long symbol, int timeframe, int ma_period, int ma_shift, int ma_method, int applied_price, int shift) {
  return iMA("", timeframe, ma_period, ma_shift, ma_method, applied_price, shift);
}
double iMAOnArray (double* array, int total, int ma_period, int ma_shift, int ma_method, int shift) {
  return jiMAOnArray(iFintecheeUID, array, total, ma_period, ma_shift, convertMAMethod(ma_method), shift);
}

double iMACD (const string symbol, int timeframe, int fast_ema_period, int slow_ema_period, int signal_period, int applied_price, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iMACD_") + symbol + string("_") + string(tf) + string("_") + to_string(fast_ema_period) + string("_") + to_string(slow_ema_period) + string("_") + to_string(signal_period) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiMACDInit(iFintecheeUID, symbol, tf, fast_ema_period, slow_ema_period, signal_period, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiMACD(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_MACD), shift);
}
double iMACD (long symbol, int timeframe, int fast_ema_period, int slow_ema_period, int signal_period, int applied_price, int mode, int shift) {
  return iMACD("", timeframe, fast_ema_period, slow_ema_period, signal_period, applied_price, mode, shift);
}

double iMomentum (const string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iMomentum_") + symbol + string("_") + string(tf) + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiMomentumInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiMomentum(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iMomentum (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iMomentum("", timeframe, period, applied_price, shift);
}
double iMomentumOnArray (double* array, int total, int period, int shift) {
  return jiMomentumOnArray(iFintecheeUID, array, total, period, shift);
}

double iRSI (const string symbol, int timeframe, int period, int applied_price, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iRSI_") + symbol + string("_") + string(tf) + string("_") + to_string(period) + string("_") + to_string(applied_price);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiRSIInit(iFintecheeUID, symbol, tf, period, applied_price);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiRSI(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iRSI (long symbol, int timeframe, int period, int applied_price, int shift) {
  return iRSI("", timeframe, period, applied_price, shift);
}
double iRSIOnArray (double* array, int total, int period, int shift) {
  return jiRSIOnArray(iFintecheeUID, array, total, period, shift);
}

double iRVI (const string symbol, int timeframe, int period, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iRVI_") + symbol + string("_") + string(tf) + string("_") + to_string(period);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiRVIInit(iFintecheeUID, symbol, tf, period);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiRVI(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_RVI), shift);
}
double iRVI (long symbol, int timeframe, int period, int mode, int shift) {
  return iRVI("", timeframe, period, mode, shift);
}

double iSAR (const string symbol, int timeframe, double step, double maximum, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iSAR_") + symbol + string("_") + string(tf) + string("_") + to_string(step) + string("_") + to_string(maximum);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiSARInit(iFintecheeUID, symbol, tf, step, maximum);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiSAR(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iSAR (long symbol, int timeframe, double step, double maximum, int shift) {
  return iSAR("", timeframe, step, maximum, shift);
}

double iStochastic (const string symbol, int timeframe, int Kperiod, int Dperiod, int slowing, int method, int price_field, int mode, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iStochastic_") + symbol + string("_") + string(tf) + string("_") + to_string(Kperiod) + string("_") + to_string(Dperiod) + string("_") + to_string(slowing) + string("_") + to_string(method);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiStochasticInit(iFintecheeUID, symbol, tf, Kperiod, Dperiod, slowing, convertMAMethod(method));
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiStochastic(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], convertMode(mode, INDI_STOCHASTIC), shift);
}
double iStochastic (long symbol, int timeframe, int Kperiod, int Dperiod, int slowing, int method, int price_field, int mode, int shift) {
  return iStochastic("", timeframe, Kperiod, Dperiod, slowing, method, price_field, mode, shift);
}

double iWPR (const string symbol, int timeframe, int period, int shift) {
  const char* tf = convertTimeFrame(timeframe);
  string strID = string("iWPR_") + symbol + string("_") + string(tf) + string("_") + to_string(period);
  if (paramInputOutputList[iFintecheeUID].handleList.count(strID) == 0) {
    int handle = jiWPRInit(iFintecheeUID, symbol, tf, period);
    paramInputOutputList[iFintecheeUID].handleList[strID] = handle;
  }
  return jiWPR(iFintecheeUID, paramInputOutputList[iFintecheeUID].handleList[strID], shift);
}
double iWPR (long symbol, int timeframe, int period, int shift) {
  return iWPR("", timeframe, period, shift);
}

// todo, check whether the logic about the return value is the same as MQL4
datetime GlobalVariableSet (const string name, double value) {
  return setGlobalVar(iFintecheeUID, name, value);
}

bool GlobalVariableCheck (const string name) {
  return checkGlobalVar(iFintecheeUID, name);
}

double GlobalVariableGet (const string name) {
  return getGlobalVar(iFintecheeUID, name);
}

bool GlobalVariableDel (const string name) {
  return delGlobalVar(iFintecheeUID, name);
}

double MarketInfo (const string symbol, int type) {
  return jMarketInfo(iFintecheeUID, symbol, type);
}
double MarketInfo (long symbol, int type) {
  return MarketInfo("", type);
}

bool VeriSig (const string fintechee_data, const string fintechee_signature, const string fintechee_public_key, const string application_public_key) {
  string data = fintechee_data;
  string signature = fintechee_signature;
  string publicKey = fintechee_public_key;
  string appPublicKey = application_public_key;
  data.erase(std::remove(data.begin(), data.end(), '\n'), data.end());
  signature.erase(std::remove(signature.begin(), signature.end(), '\n'), signature.end());
  publicKey.erase(std::remove(publicKey.begin(), publicKey.end(), '\n'), publicKey.end());
  appPublicKey.erase(std::remove(appPublicKey.begin(), appPublicKey.end(), '\n'), appPublicKey.end());
  data = StringTrimLeft(StringTrimRight(data));
  signature = StringTrimLeft(StringTrimRight(signature));
  publicKey = StringTrimLeft(StringTrimRight(publicKey));
  appPublicKey = StringTrimLeft(StringTrimRight(appPublicKey));

  int dataLen = StringLen(data);
  int signatureLen = StringLen(signature);
  int publicKeyLen = StringLen(publicKey);
  int appPublicKeyLen = StringLen(appPublicKey);
  if (dataLen == 0 || signatureLen == 0 || publicKeyLen == 0 || appPublicKeyLen == 0) return false;
  if (publicKeyLen != appPublicKeyLen) return false;
  if (StringCompare(publicKey, appPublicKey) != 0) return false;
  bool res = jVeriSig(data.c_str(), signature.c_str(), publicKey.c_str());

  if (res) {
    std::vector<string> arr;
    std::stringstream ss(data);

    string s;
    while (std::getline(ss, s, ',')) {
      arr.push_back(s);
    }

    datetime expiryDate = 0;

    if (0 < arr.size()) {
      expiryDate = std::stol(arr[0], nullptr);
    }

    if (expiryDate >= TimeCurrent()) {
      return true;
    }
  }

  return false;
}
