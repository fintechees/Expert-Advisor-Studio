#define ARR_NUM 1001
#define INPUT_NUM 10
#define HIDDEN_NUM 10
#define NN_NAME "testcnn"
#define ITERATIONS 1000
#define BATCH_SIZE 512

input bool ext_bTrain = true; // if testing, set false to it

double macdArr[ARR_NUM * INPUT_NUM];
double oArr[ARR_NUM];
int cursor = 0;
datetime currTime = 0;

int OnInit (void) {
  PreventCleanUp();
  return 0;
}

void OnTick(void) {
  if (cursor >= ARR_NUM) return;
  if (currTime == iTime(NULL, 0, 0)) return;
  currTime = iTime(NULL, 0, 0);

  double arr[INPUT_NUM];
  double highest = -DBL_MAX;
  double lowest = DBL_MAX;
  for (int i = 1; i <= INPUT_NUM; i++) {
    arr[i - 1] = iMACD(NULL, 0, 12, 26, 9, PRICE_CLOSE, MODE_MAIN, i);
    if (arr[i - 1] > highest) {
      highest = arr[i - 1];
    }
    if (arr[i - 1] < lowest) {
      lowest = arr[i - 1];
    }
  }
  double height = highest - lowest;
  if (height <= 0) return;

  for (int i = 0; i < INPUT_NUM; i++) {
    macdArr[cursor * INPUT_NUM + i] = (arr[i] - lowest) / height;
  }
  oArr[cursor] = iOpen(NULL, 0, 0);
  cursor++;
}

void OnDeinit (const int) {
  double trainingSetI[(cursor - 1) * INPUT_NUM];
  double trainingSetO[(cursor - 1) * 2];

  if (ext_bTrain) {
    if (BuildCNN(NN_NAME, INPUT_NUM, HIDDEN_NUM)) {
      for (int i = 0; i < cursor - 1; i++) {
        for (int j = 0; j < INPUT_NUM; j++) {
          trainingSetI[i * INPUT_NUM + j] = macdArr[i * INPUT_NUM + j];
        }

        if (oArr[i] <= oArr[i + 1]) {
          trainingSetO[i * 2] = 1.0;
          trainingSetO[i * 2 + 1] = 0.0;
        } else {
          trainingSetO[i * 2] = 0.0;
          trainingSetO[i * 2 + 1] = 1.0;
        }
      }

      Print("Please be patient with the training progress.");

      if (TrainCNN(NN_NAME, trainingSetI, trainingSetO, cursor - 1, INPUT_NUM, ITERATIONS, BATCH_SIZE, false)) {
        SaveCNN(NN_NAME);
      } else {
        return;
      }
    } else {
      return;
    }
  } else {
    if (!LoadCNN(NN_NAME)) {
      return;
    }
  }

  int longWinCnt = 0;
  int shortWinCnt = 0;
  int longCnt = 0;
  int shortCnt = 0;

  for (int i = 0; i < cursor - 1; i++) {
    double input[INPUT_NUM];
    double output = trainingSetO[i * 2];

    for (int j = 0; j < INPUT_NUM; j++) {
      input[j] = trainingSetI[i * INPUT_NUM + j];
    }

    double result = RunCNN(NN_NAME, input, INPUT_NUM);
    bool resWin = ((result >= 0.5 ? 1.0 : 0.0) == output ? true : false);

    if (resWin) {
      if (output == 1.0) {
        longCnt++;
        longWinCnt++;
      } else {
        shortCnt++;
        shortWinCnt++;
      }
    } else {
      if (output == 1.0) {
        longCnt++;
      } else {
        shortCnt++;
      }
    }
  }

  int lsCount = longCnt + shortCnt;

  Print("Long: ", longCnt, ", ", (longWinCnt * 1.0 / lsCount));
  Print("Short: ", shortCnt, ", ", (shortWinCnt * 1.0 / lsCount));
}
