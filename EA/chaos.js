registerEA(
  "chaos",
  "An EA based on Chaos theory(v1.0)",
  [{
    name: "symbolName",
    value: "EUR/USD",
    required: true,
    type: "String",
    range: null,
    step: null
  }, {
    name: "volume",
    value: 0.01,
    required: true,
    type: "Number",
    range: [0.01, 1.0],
    step: null
  }, {
    name: "timeFrame",
    value: "H4",
    required: true,
    type: "String",
    range: null,
    step: null
  }],
  function (context) { // Init()
    // Bill Williams' Chaos Trading Strategy is amazing.
    // This EA is based on the theory written in his book "Trading Chaos".

    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)
    var symbolName = getEAParameter(context, "symbolName")
    var timeFrame = getEAParameter(context, "timeFrame")

    context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, timeFrame)
    context.fractalsHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, timeFrame, "fractals", [])
    context.alligatorHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, timeFrame, "alligator", [{
      name: "jawsPeriod", value: 13}, {name: "jawsShift", value: 8}, {
      name: "teethPeriod", value: 8}, {name: "teethShift", value: 5}, {
      name: "lipsPeriod", value: 5}, {name: "lipsShift", value: 3}, {
      name: "method", value: "smma"}])
    context.aoHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, timeFrame, "ao", [])
    context.acHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, timeFrame, "ac", [])

    context.chaos = {
      fractalsUpIdx: -1,
      fractalsDownIdx: -1,
      fractalsUp: 0,
      fractalsDown: 0,
      fractalsUpTriggered: false,
      fractalsDownTriggered: false,
      getFractalsSignal: function (arrUp, arrDown) {
        var cursor = arrUp.length - 4
        var latestUpIdx = -1
        var latestDownIdx = -1

        while (cursor >= 0) {
          if (arrUp[cursor] != 0) {
            if (latestUpIdx == -1) {
              latestUpIdx = cursor
            }
            if (latestDownIdx != -1) {
              break
            }
          }
          if (arrDown[cursor] != 0) {
            if (latestDownIdx == -1) {
              latestDownIdx = cursor
            }
            if (latestUpIdx != -1) {
              break
            }
          }
          cursor--
        }

        if (latestUpIdx != -1 && latestDownIdx != -1) {
          if (latestUpIdx != this.fractalsUpIdx) {
            this.fractalsUpIdx = latestUpIdx
            this.fractalsUpTriggered = false
          }
          if (latestDownIdx != this.fractalsDownIdx) {
            this.fractalsDownIdx = latestDownIdx
            this.fractalsDownTriggered = false
          }
          this.fractalsUp = arrUp[latestUpIdx]
          this.fractalsDown = arrDown[latestDownIdx]
        }
      },
      checkFractalsSignal: function (arrTeeth, currTick) {
        if (this.fractalsUp > 0) {
          if (!this.fractalsUpTriggered) {
            if (currTick > this.fractalsUp && currTick > arrTeeth[arrTeeth.length - 6]) {
              this.fractalsUpTriggered = true
              return 1
            }
          }
        }

        if (this.fractalsDown > 0) {
          if (!this.fractalsDownTriggered) {
            if (currTick < this.fractalsDown && currTick < arrTeeth[arrTeeth.length - 6]) {
              this.fractalsDownTriggered = true
              return 0
            }
          }
        }

        return -1
      },
      aoUpIdx1: -1,
      aoDownIdx1: -1,
      aoUp1: 0,
      aoDown1: 0,
      aoUpTriggered1: false,
      aoDownTriggered1: false,
      aoUpIdx2: -1,
      aoDownIdx2: -1,
      aoUp2: 0,
      aoDown2: 0,
      aoUpTriggered2: false,
      aoDownTriggered2: false,
      aoUpIdx3: -1,
      aoDownIdx3: -1,
      aoUp3: 0,
      aoDown3: 0,
      aoUpTriggered3: false,
      aoDownTriggered3: false,
      getAoSignal: function (arrUp, arrDown, arrHigh, arrLow) {
        var arrLen = arrHigh.length

        if (arrUp[arrLen - 2] > 0 && arrDown[arrLen - 3] > 0 && (arrUp[arrLen - 4] > arrDown[arrLen - 3] || arrDown[arrLen - 4] > arrDown[arrLen - 3])) {
          if (arrLen - 2 != this.aoUpIdx1) {
            this.aoUpIdx1 = arrLen - 2
            this.aoDownIdx1 = -1
            this.aoUp1 = arrHigh[arrLen - 2]
            this.aoDown1 = 0
            this.aoUpTriggered1 = false
            this.aoDownTriggered1 = false
          }
        } else if (arrDown[arrLen - 2] < 0 && arrUp[arrLen - 3] < 0 && (arrUp[arrLen - 4] < arrUp[arrLen - 3] || arrDown[arrLen - 4] < arrUp[arrLen - 3])) {
          if (arrLen - 2 != this.aoDownIdx1) {
            this.aoUpIdx1 = -1
            this.aoDownIdx1 = arrLen - 2
            this.aoUp1 = 0
            this.aoDown1 = arrLow[arrLen - 2]
            this.aoUpTriggered1 = false
            this.aoDownTriggered1 = false
          }
        } else {
          this.aoUpIdx1 = -1
          this.aoDownIdx1 = -1
          this.aoUp1 = 0
          this.aoDown1 = 0
          this.aoUpTriggered1 = false
          this.aoDownTriggered1 = false
        }

        if (arrUp[arrLen - 2] > 0 && (arrUp[arrLen - 3] < 0 || (arrUp[arrLen - 4] < 0 && arrUp[arrLen - 3] == 0 && arrDown[arrLen - 3] == 0))) {
          if (arrLen - 2 != this.aoUpIdx2) {
            this.aoUpIdx2 = arrLen - 2
            this.aoDownIdx2 = -1
            this.aoUp2 = arrHigh[arrLen - 2]
            this.aoDown2 = 0
            this.aoUpTriggered2 = false
            this.aoDownTriggered2 = false
          }
        } else if (arrDown[arrLen - 2] < 0 && (arrDown[arrLen - 3] > 0 || (arrDown[arrLen - 4] > 0 && arrUp[arrLen - 3] == 0 && arrDown[arrLen - 3] == 0))) {
          if (arrLen - 2 != this.aoDownIdx2) {
            this.aoUpIdx2 = -1
            this.aoDownIdx2 = arrLen - 2
            this.aoUp2 = 0
            this.aoDown2 = arrLow[arrLen - 2]
            this.aoUpTriggered2 = false
            this.aoDownTriggered2 = false
          }
        } else {
          this.aoUpIdx2 = -1
          this.aoDownIdx2 = -1
          this.aoUp2 = 0
          this.aoDown2 = 0
          this.aoUpTriggered2 = false
          this.aoDownTriggered2 = false
        }

        var cursor = arrLen - 3
        var latestPeakIdx1 = -1
        var latestPeakIdx2 = -1
        var arrData = []
        var bContinue = true

        while (cursor >= 0) {
          if ((arrUp[cursor] > 0 && arrDown[cursor + 1] > 0) ||
              (arrDown[cursor] > 0 && arrUp[cursor + 1] > 0) ||
              (arrUp[cursor] > 0 && arrUp[cursor + 1] > 0) ||
              (arrDown[cursor] > 0 && arrDown[cursor + 1] > 0) ||
              (arrUp[cursor] < 0 && arrDown[cursor + 1] < 0) ||
              (arrDown[cursor] < 0 && arrUp[cursor + 1] < 0) ||
              (arrUp[cursor] < 0 && arrUp[cursor + 1] < 0) ||
              (arrDown[cursor] < 0 && arrDown[cursor + 1] < 0)) {

          } else {
            bContinue = false
          }

          if (arrUp[cursor + 1] != 0) {
            arrData.push({
              ao: arrUp[cursor + 1],
              idx: cursor + 1
            })
          }
          if (arrDown[cursor + 1] != 0) {
            arrData.push({
              ao: arrDown[cursor + 1],
              idx: cursor + 1
            })
          }

          var arrDataLen = arrData.length

          if (arrDataLen > 1) {
            if (arrData[arrDataLen - 1].ao < 0) {
              if (arrDataLen == 2 && arrData[1].ao > arrData[0].ao) {
                break
              } else {
                if (arrDataLen > 2 && arrData[arrDataLen - 1].ao > arrData[arrDataLen - 2].ao && arrData[arrDataLen - 2].ao < arrData[arrDataLen - 3].ao) {
                  if (latestPeakIdx1 != -1) {
                    latestPeakIdx2 = arrData[arrDataLen - 2].idx
                    break
                  } else {
                    latestPeakIdx1 = arrData[arrDataLen - 2].idx
                  }
                }
              }
            } else {
              if (arrDataLen == 2 && arrData[1].ao < arrData[0].ao) {
                break
              } else {
                if (arrDataLen > 2 && arrData[arrDataLen - 1].ao < arrData[arrDataLen - 2].ao && arrData[arrDataLen - 2].ao > arrData[arrDataLen - 3].ao) {
                  if (latestPeakIdx1 != -1) {
                    latestPeakIdx2 = arrData[arrDataLen - 2].idx
                    break
                  } else {
                    latestPeakIdx1 = arrData[arrDataLen - 2].idx
                  }
                }
              }
            }
          }

          if (!bContinue) {
            break
          }

          cursor--
        }

        if (latestPeakIdx2 != -1) {
          if (arrData[0].ao < 0 && arrDown[latestPeakIdx1] > arrDown[latestPeakIdx2]) {
            if (latestPeakIdx1 + 1 != this.aoUpIdx3) {
              this.aoUpIdx3 = latestPeakIdx1 + 1
              this.aoDownIdx3 = -1
              this.aoUp3 = arrHigh[latestPeakIdx1 + 1]
              this.aoDown3 = 0
              this.aoUpTriggered3 = false
              this.aoDownTriggered3 = false
            }
          } else if (arrData[0].ao > 0 && arrUp[latestPeakIdx1] < arrUp[latestPeakIdx2]) {
            if (latestPeakIdx1 + 1 != this.aoDownIdx3) {
              this.aoUpIdx3 = -1
              this.aoDownIdx3 = latestPeakIdx1 + 1
              this.aoUp3 = 0
              this.aoDown3 = arrLow[latestPeakIdx1 + 1]
              this.aoUpTriggered3 = false
              this.aoDownTriggered3 = false
            }
          } else {
            this.aoUpIdx3 = -1
            this.aoDownIdx3 = -1
            this.aoUp3 = 0
            this.aoDown3 = 0
            this.aoUpTriggered3 = false
            this.aoDownTriggered3 = false
          }
        } else {
          this.aoUpIdx3 = -1
          this.aoDownIdx3 = -1
          this.aoUp3 = 0
          this.aoDown3 = 0
          this.aoUpTriggered3 = false
          this.aoDownTriggered3 = false
        }
      },
      checkAoSignal: function (currTick) {
        var signal1 = -1
        var signal2 = -1
        var signal3 = -1

        if (this.aoUp1 > 0) {
          if (!this.aoUpTriggered1) {
            if (currTick > this.aoUp1) {
              this.aoUpTriggered1 = true
              signal1 = 1
            }
          }
        }

        if (this.aoDown1 > 0) {
          if (!this.aoDownTriggered1) {
            if (currTick < this.aoDown1) {
              this.aoDownTriggered1 = true
              signal1 = 0
            }
          }
        }

        if (this.aoUp2 > 0) {
          if (!this.aoUpTriggered2) {
            if (currTick > this.aoUp2) {
              this.aoUpTriggered2 = true
              signal2 = 1
            }
          }
        }

        if (this.aoDown2 > 0) {
          if (!this.aoDownTriggered2) {
            if (currTick < this.aoDown2) {
              this.aoDownTriggered2 = true
              signal2 = 0
            }
          }
        }

        if (this.aoUp3 > 0) {
          if (!this.aoUpTriggered3) {
            if (currTick > this.aoUp3) {
              this.aoUpTriggered3 = true
              signal3 = 1
            }
          }
        }

        if (this.aoDown3 > 0) {
          if (!this.aoDownTriggered3) {
            if (currTick < this.aoDown3) {
              this.aoDownTriggered3 = true
              signal3 = 0
            }
          }
        }

        return {
          signal1: signal1,
          signal2: signal2,
          signal3: signal3
        }
      },
      acUpIdx1: -1,
      acDownIdx1: -1,
      acUp1: 0,
      acDown1: 0,
      acUpTriggered1: false,
      acDownTriggered1: false,
      acUpIdx2: -1,
      acDownIdx2: -1,
      acUp2: 0,
      acDown2: 0,
      acUpTriggered2: false,
      acDownTriggered2: false,
      getAcSignal: function (arrUp, arrDown, arrHigh, arrLow) {
        var arrLen = arrHigh.length

        if (arrDown[arrLen - 4] != 0 && arrUp[arrLen - 3] != 0 && arrUp[arrLen - 2] > 0) {
          if (arrLen - 2 != this.acUpIdx1) {
            this.acUpIdx1 = arrLen - 2
            this.acDownIdx1 = -1
            this.acUp1 = arrHigh[arrLen - 2]
            this.acDown1 = 0
            this.acUpTriggered1 = false
            this.acDownTriggered1 = false
          }
        } else if (arrUp[arrLen - 4] != 0 && arrDown[arrLen - 3] != 0 && arrDown[arrLen - 2] < 0) {
          if (arrLen - 2 != this.acDownIdx1) {
            this.acUpIdx1 = -1
            this.acDownIdx1 = arrLen - 2
            this.acUp1 = 0
            this.acDown1 = arrLow[arrLen - 2]
            this.acUpTriggered1 = false
            this.acDownTriggered1 = false
          }
        } else {
          this.acUpIdx1 = -1
          this.acDownIdx1 = -1
          this.acUp1 = 0
          this.acDown1 = 0
          this.acUpTriggered1 = false
          this.acDownTriggered1 = false
        }

        if (arrDown[arrLen - 5] < 0 && arrUp[arrLen - 4] < 0 && arrUp[arrLen - 3] < 0 && arrUp[arrLen - 2] != 0) {
          if (arrLen - 2 != this.acUpIdx2) {
            this.acUpIdx2 = arrLen - 2
            this.acDownIdx2 = -1
            this.acUp2 = arrHigh[arrLen - 2]
            this.acDown2 = 0
            this.acUpTriggered2 = false
            this.acDownTriggered2 = false
          }
        } else if (arrUp[arrLen - 5] > 0 && arrDown[arrLen - 4] > 0 && arrDown[arrLen - 3] > 0 && arrDown[arrLen - 2] != 0) {
          if (arrLen - 2 != this.acDownIdx2) {
            this.acUpIdx2 = -1
            this.acDownIdx2 = arrLen - 2
            this.acUp2 = 0
            this.acDown2 = arrLow[arrLen - 2]
            this.acUpTriggered2 = false
            this.acDownTriggered2 = false
          }
        } else {
          this.acUpIdx2 = -1
          this.acDownIdx2 = -1
          this.acUp2 = 0
          this.acDown2 = 0
          this.acUpTriggered2 = false
          this.acDownTriggered2 = false
        }
      },
      checkAcSignal: function (currTick) {
        var signal1 = -1
        var signal2 = -1

        if (this.acUp1 > 0) {
          if (!this.acUpTriggered1) {
            if (currTick > this.acUp1) {
              this.acUpTriggered1 = true
              signal1 = 1
            }
          }
        }

        if (this.acDown1 > 0) {
          if (!this.acDownTriggered1) {
            if (currTick < this.acDown1) {
              this.acDownTriggered1 = true
              signal1 = 0
            }
          }
        }

        if (this.acUp2 > 0) {
          if (!this.acUpTriggered2) {
            if (currTick > this.acUp2) {
              this.acUpTriggered2 = true
              signal2 = 1
            }
          }
        }

        if (this.acDown2 > 0) {
          if (!this.acDownTriggered2) {
            if (currTick < this.acDown2) {
              this.acDownTriggered2 = true
              signal2 = 0
            }
          }
        }

        return {
          signal1: signal1,
          signal2: signal2
        }
      },
      mapUpIdx: -1,
      mapDownIdx: -1,
      mapUp: 0,
      mapDown: 0,
      mapUpTriggered: false,
      mapDownTriggered: false,
      mapUpCnt: 0,
      mapDownCnt: 0,
      mapUpSl: 0,
      mapDownSl: 0,
      mapUpSlTriggered: false,
      mapDownSlTriggered: false,
      getMapSignal: function (arrAoUp, arrAoDown, arrAcUp, arrAcDown, arrClose, arrHigh, arrLow) {
        var arrLen = arrClose.length

        if (arrAoUp[arrLen - 2] != 0 && arrAcUp[arrLen - 2] != 0) {
          if (arrLen - 2 != this.mapUpIdx) {
            if (this.mapUpIdx == -1) {
              this.mapUpCnt = 1
            } else {
              this.mapUpCnt++
            }
            this.mapDownCnt = 0
            this.mapUpIdx = arrLen - 2
            this.mapDownIdx = -1
            this.mapUp = arrClose[arrLen - 2]
            this.mapDown = 0
            this.mapUpTriggered = false
            this.mapDownTriggered = false
            if (this.mapUpCnt >= 6) {
              this.mapUp = 0
              this.mapUpTriggered = false
              this.mapUpSl = arrLow[arrLen - 2]
              this.mapUpSlTriggered = false
            } else {
              this.mapUpSl = 0
              this.mapUpSlTriggered = false
            }
            this.mapDownSl = 0
            this.mapDownSlTriggered = false
          }
        } else if (arrAoDown[arrLen - 2] != 0 && arrAcDown[arrLen - 2] != 0) {
          if (arrLen - 2 != this.mapDownIdx) {
            this.mapUpCnt = 0
            if (this.mapDownIdx == -1) {
              this.mapDownCnt = 1
            } else {
              this.mapDownCnt++
            }
            this.mapUpIdx = -1
            this.mapDownIdx = arrLen - 2
            this.mapUp = 0
            this.mapDown = arrClose[arrLen - 2]
            this.mapUpTriggered = false
            this.mapDownTriggered = false
            this.mapUpSl = 0
            this.mapUpSlTriggered = false
            if (this.mapDownCnt >= 6) {
              this.mapDown = 0
              this.mapDownTriggered = false
              this.mapDownSl = arrHigh[arrLen - 2]
              this.mapDownSlTriggered = false
            } else {
              this.mapDownSl = 0
              this.mapDownSlTriggered = false
            }
          }
        } else {
          this.mapUpIdx = -1
          this.mapDownIdx = -1
          this.mapUp = 0
          this.mapDown = 0
          this.mapUpTriggered = false
          this.mapDownTriggered = false
          if (this.mapUpCnt >= 5) {
            this.mapUpSl = arrLow[arrLen - 2]
            this.mapUpSlTriggered = false
          } else {
            this.mapUpCnt = 0
            this.mapUpSl = 0
            this.mapUpSlTriggered = false
          }
          if (this.mapDownCnt >= 5) {
            this.mapDownSl = arrHigh[arrLen - 2]
            this.mapDownSlTriggered = false
          } else {
            this.mapDownCnt = 0
            this.mapDownSl = 0
            this.mapDownSlTriggered = false
          }
        }
      },
      checkMapSignal: function (currTick, prevHigh, prevLow) {
        var signal = -1

        if (this.mapUp > 0) {
          if (!this.mapUpTriggered) {
            if (currTick > this.mapUp) {
              if (this.mapUpCnt >= 5) {
                this.mapUp = 0
                this.mapUpTriggered = false
                this.mapUpSl = prevLow
                this.mapUpSlTriggered = false
              } else {
                this.mapUpTriggered = true
                this.mapUpSl = 0
                this.mapUpSlTriggered = false
              }
              this.mapDownSl = 0
              this.mapDownSlTriggered = false

              signal = 1
            }
          }
        }

        if (this.mapDown > 0) {
          if (!this.mapDownTriggered) {
            if (currTick < this.mapDown) {
              this.mapUpSl = 0
              this.mapUpSlTriggered = false
              if (this.mapDownCnt >= 5) {
                this.mapDown = 0
                this.mapDownTriggered = false
                this.mapDownSl = prevHigh
                this.mapDownSlTriggered = false
              } else {
                this.mapDownTriggered = true
                this.mapDownSl = 0
                this.mapDownSlTriggered = false
              }

              signal = 0
            }
          }
        }

        if (this.mapUpSl > 0) {
          if (!this.mapUpSlTriggered) {
            if (currTick < this.mapUpSl) {
              this.mapUpSlTriggered = true
              this.mapUpCnt = 0
              signal = 3
            }
          }
        }

        if (this.mapDownSl > 0) {
          if (!this.mapDownSlTriggered) {
            if (currTick > this.mapDownSl) {
              this.mapDownSlTriggered = true
              this.mapDownCnt = 0
              signal = 2
            }
          }
        }

        return signal
      },
      alligatorUpIdx1: -1,
      alligatorDownIdx1: -1,
      alligatorUp1: 0,
      alligatorDown1: 0,
      alligatorUpTriggered1: false,
      alligatorDownTriggered1: false,
      alligatorUpBase1: 0,
      alligatorDownBase1: 0,
      alligatorUpIdx2: -1,
      alligatorDownIdx2: -1,
      alligatorUp2: 0,
      alligatorDown2: 0,
      alligatorUpTriggered2: false,
      alligatorDownTriggered2: false,
      alligatorUpBase2: 0,
      alligatorDownBase2: 0,
      alligatorUpIdx3: -1,
      alligatorDownIdx3: -1,
      alligatorUp3: 0,
      alligatorDown3: 0,
      alligatorUpTriggered3: false,
      alligatorDownTriggered3: false,
      alligatorUpBase3: 0,
      alligatorDownBase3: 0,
      getAlligatorSignal: function (arrHigh, arrLow, currLip, currJaw, currAoUp, currAoDown, currAcUp, currAcDown) {
        var arrLen = arrHigh.length

        if (this.alligatorUpIdx1 != 0) {
          if (this.alligatorUpBase1 > arrHigh[arrLen - 2]) {
            this.alligatorUpIdx1 = -1
            this.alligatorUp1 = 0
            this.alligatorUpTriggered1 = false
            this.alligatorUpBase1 = 0
          }
        }
        if (this.alligatorDownIdx1 != 0) {
          if (this.alligatorDownBase1 < arrLow[arrLen - 2]) {
            this.alligatorDownIdx1 = -1
            this.alligatorDown1 = 0
            this.alligatorDownTriggered1 = false
            this.alligatorDownBase1 = 0
          }
        }

        if (arrHigh[arrLen - 3] > arrHigh[arrLen - 2] && arrHigh[arrLen - 2] > currLip) {
          if (arrLen - 3 != this.alligatorUpIdx1) {
            this.alligatorUpIdx1 = arrLen - 3
            this.alligatorUp1 = arrHigh[arrLen - 3]
            this.alligatorUpTriggered1 = false
            this.alligatorUpBase1 = arrHigh[arrLen - 2]
          }
        } else if (arrLow[arrLen - 3] < arrLow[arrLen - 2] && arrLow[arrLen - 2] < currLip) {
          if (arrLen - 3 != this.alligatorDownIdx1) {
            this.alligatorDownIdx1 = arrLen - 3
            this.alligatorDown1 = arrLow[arrLen - 3]
            this.alligatorDownTriggered1 = false
            this.alligatorDownBase1 = arrLow[arrLen - 2]
          }
        }

        if (this.alligatorUpIdx2 != 0) {
          if (this.alligatorUpBase2 > arrHigh[arrLen - 2]) {
            this.alligatorUpIdx2 = -1
            this.alligatorUp2 = 0
            this.alligatorUpTriggered2 = false
            this.alligatorUpBase2 = 0
          }
        }
        if (this.alligatorDownIdx2 != 0) {
          if (this.alligatorDownBase2 < arrLow[arrLen - 2]) {
            this.alligatorDownIdx2 = -1
            this.alligatorDown2 = 0
            this.alligatorDownTriggered2 = false
            this.alligatorDownBase2 = 0
          }
        }

        if (arrHigh[arrLen - 4] > arrHigh[arrLen - 3] && arrHigh[arrLen - 3] > arrHigh[arrLen - 2] && arrHigh[arrLen - 2] < currJaw &&
            ((currAoUp != 0 && currAcUp != 0) || (currAoUp != 0 && currAcDown != 0) || (currAoDown != 0 && currAcUp != 0))) {
          if (arrLen - 4 != this.alligatorUpIdx2) {
            this.alligatorUpIdx2 = arrLen - 4
            this.alligatorUp2 = arrHigh[arrLen - 4]
            this.alligatorUpTriggered2 = false
            this.alligatorUpBase2 = arrHigh[arrLen - 2]
          }
        } else if (arrLow[arrLen - 4] < arrLow[arrLen - 3] && arrLow[arrLen - 3] < arrLow[arrLen - 2] && arrLow[arrLen - 2] > currJaw &&
            ((currAoDown != 0 && currAcDown != 0) || (currAoUp != 0 && currAcDown != 0) || (currAoDown != 0 && currAcUp != 0))) {
          if (arrLen - 4 != this.alligatorDownIdx2) {
            this.alligatorDownIdx2 = arrLen - 4
            this.alligatorDown2 = arrLow[arrLen - 4]
            this.alligatorDownTriggered2 = false
            this.alligatorDownBase2 = arrLow[arrLen - 2]
          }
        }

        if (this.alligatorUpIdx3 != 0) {
          if (this.alligatorUpBase3 > arrHigh[arrLen - 2]) {
            this.alligatorUpIdx3 = -1
            this.alligatorUp3 = 0
            this.alligatorUpTriggered3 = false
            this.alligatorUpBase3 = 0
          }
        }
        if (this.alligatorDownIdx3 != 0) {
          if (this.alligatorDownBase3 < arrLow[arrLen - 2]) {
            this.alligatorDownIdx3 = -1
            this.alligatorDown3 = 0
            this.alligatorDownTriggered3 = false
            this.alligatorDownBase3 = 0
          }
        }

        if (arrHigh[arrLen - 6] > arrHigh[arrLen - 5] && arrHigh[arrLen - 5] > arrHigh[arrLen - 4] && arrHigh[arrLen - 4] > arrHigh[arrLen - 3] && arrHigh[arrLen - 3] > arrHigh[arrLen - 2] &&
            arrHigh[arrLen - 2] < currJaw && currAoDown != 0 && currAcDown != 0) {
          if (arrLen - 6 != this.alligatorUpIdx3) {
            this.alligatorUpIdx3 = arrLen - 6
            this.alligatorUp3 = arrHigh[arrLen - 6]
            this.alligatorUpTriggered3 = false
            this.alligatorUpBase3 = arrHigh[arrLen - 2]
          }
        } else if (arrLow[arrLen - 6] < arrLow[arrLen - 5] && arrLow[arrLen - 5] < arrLow[arrLen - 4] && arrLow[arrLen - 4] < arrLow[arrLen - 3] && arrLow[arrLen - 3] < arrLow[arrLen - 2] &&
            arrLow[arrLen - 2] > currJaw && currAoUp != 0 && currAcUp != 0) {
          if (arrLen - 6 != this.alligatorDownIdx3) {
            this.alligatorDownIdx3 = arrLen - 6
            this.alligatorDown3 = arrLow[arrLen - 6]
            this.alligatorDownTriggered3 = false
            this.alligatorDownBase3 = arrLow[arrLen - 2]
          }
        }
      },
      checkAlligatorSignal: function (currTick) {
        var signal1 = -1
        var signal2 = -1
        var signal3 = -1

        if (this.alligatorUp1 > 0) {
          if (!this.alligatorUpTriggered1) {
            if (currTick > this.alligatorUp1) {
              this.alligatorUpTriggered1 = true
              signal1 = 1
            }
          }
        }

        if (this.alligatorDown1 > 0) {
          if (!this.alligatorDownTriggered1) {
            if (currTick < this.alligatorDown1) {
              this.alligatorDownTriggered1 = true
              signal1 = 0
            }
          }
        }

        if (this.alligatorUp2 > 0) {
          if (!this.alligatorUpTriggered2) {
            if (currTick > this.alligatorUp2) {
              this.alligatorUpTriggered2 = true
              signal2 = 1
            }
          }
        }

        if (this.alligatorDown2 > 0) {
          if (!this.alligatorDownTriggered2) {
            if (currTick < this.alligatorDown2) {
              this.alligatorDownTriggered2 = true
              signal2 = 0
            }
          }
        }

        if (this.alligatorUp3 > 0) {
          if (!this.alligatorUpTriggered3) {
            if (currTick > this.alligatorUp3) {
              this.alligatorUpTriggered3 = true
              signal3 = 1
            }
          }
        }

        if (this.alligatorDown3 > 0) {
          if (!this.alligatorDownTriggered3) {
            if (currTick < this.alligatorDown3) {
              this.alligatorDownTriggered3 = true
              signal3 = 0
            }
          }
        }

        return {
          signal1: signal1,
          signal2: signal2,
          signal3: signal3
        }
      },
      checkCloseSignal: function (arrTeeth, arrClose) {
        var arrLen = arrClose.length

        if (arrTeeth[arrLen - 7] > arrClose[arrLen - 2] && arrClose[arrLen - 3] >= arrTeeth[arrLen - 8]) {
          return 3
        }
        if (arrTeeth[arrLen - 7] < arrClose[arrLen - 2] && arrClose[arrLen - 3] <= arrTeeth[arrLen - 8]) {
          return 2
        }

        return -1
      },
      trend: -1
    }
  },
  function (context) { // Deinit()
  },
  function (context) { // OnTick()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)
    var symbolName = getEAParameter(context, "symbolName")
    var volume = getEAParameter(context, "volume")
    var arrTime = getData(context, context.chartHandle, DATA_NAME.TIME)
    var arrHigh = getData(context, context.chartHandle, DATA_NAME.HIGH)
    var arrLow = getData(context, context.chartHandle, DATA_NAME.LOW)
    var arrClose = getData(context, context.chartHandle, DATA_NAME.CLOSE)
    var arrTeeth = getData(context, context.alligatorHandle, "teeth")
    var arrLips = getData(context, context.alligatorHandle, "lips")
    var arrJaws = getData(context, context.alligatorHandle, "jaws")
    var arrUp = getData(context, context.fractalsHandle, "fractalsUp")
    var arrDown = getData(context, context.fractalsHandle, "fractalsDown")
    var arrAoUp = getData(context, context.aoHandle, "up")
    var arrAoDown = getData(context, context.aoHandle, "down")
    var arrAcUp = getData(context, context.acHandle, "up")
    var arrAcDown = getData(context, context.acHandle, "down")
    var arrLen = arrTime.length

    if (200 >= arrLen) throw new Error("No enough data.")

    var bGetSignals = false
    if (typeof context.currTime == "undefined") {
      context.currTime = arrTime[arrTime.length - 1]
      bGetSignals = true
    } else if (context.currTime != arrTime[arrTime.length - 1]) {
      context.currTime = arrTime[arrTime.length - 1]
      bGetSignals = true
    }

    if (bGetSignals) {
      context.chaos.getFractalsSignal(arrUp, arrDown)
      context.chaos.getAoSignal(arrAoUp, arrAoDown, arrHigh, arrLow)
      context.chaos.getAcSignal(arrAcUp, arrAcDown, arrHigh, arrLow)
      context.chaos.getMapSignal(arrAoUp, arrAoDown, arrAcUp, arrAcDown, arrClose, arrHigh, arrLow)
      context.chaos.getAlligatorSignal(arrHigh, arrLow, arrLips[arrLen - 2], arrJaws[arrLen - 2], arrAoUp[arrLen - 2], arrAoDown[arrLen - 2], arrAcUp[arrLen - 2], arrAcDown[arrLen - 2])
    }

    var signal = -1

    var fractalsSignal = context.chaos.checkFractalsSignal(arrTeeth, arrClose[arrLen - 1])
    if (fractalsSignal != -1) {
      signal = fractalsSignal
      context.chaos.trend = fractalsSignal
    }

    if (context.chaos.trend == -1) {
      return
    }

    var aoSignal = context.chaos.checkAoSignal(arrClose[arrLen - 1])
    if (aoSignal.signal1 == context.chaos.trend) {
      signal = context.chaos.trend
    }
    if (aoSignal.signal2 == context.chaos.trend) {
      signal = context.chaos.trend
    }
    if (aoSignal.signal3 == context.chaos.trend) {
      signal = context.chaos.trend
    }
    var acSignal = context.chaos.checkAcSignal(arrClose[arrLen - 1])
    if (acSignal.signal1 == context.chaos.trend) {
      signal = context.chaos.trend
    }
    if (acSignal.signal2 == context.chaos.trend) {
      signal = context.chaos.trend
    }
    var mapSignal = context.chaos.checkMapSignal(arrClose[arrLen - 1], arrHigh[arrLen - 2], arrLow[arrLen - 2])
    if (mapSignal == context.chaos.trend) {
      signal = context.chaos.trend
    }
    var alligatorSignal = context.chaos.checkAlligatorSignal(arrClose[arrLen - 1])
    if (alligatorSignal.signal1 == context.chaos.trend) {
      signal = context.chaos.trend
    }
    if (alligatorSignal.signal2 == context.chaos.trend) {
      signal = context.chaos.trend
    }
    if (alligatorSignal.signal3 == context.chaos.trend) {
      signal = context.chaos.trend
    }

    var closeSignal = context.chaos.checkCloseSignal(arrTeeth, arrClose)
    if (closeSignal != -1) {
      signal = closeSignal
    }
    if ((mapSignal == 3 && context.chaos.trend == 1) || (mapSignal == 2 && context.chaos.trend == 0)) {
      signal = mapSignal
    }

    if (signal == 1) {
      popupMessage("You received an OPEN LONG signal!")
    } else if (signal == 0) {
      popupMessage("You received a OPEN SHORT signal!")
    } else if (signal == 3) {
      popupMessage("You received a CLOSE LONG signal!")
    } else if (signal == 2) {
      popupMessage("You received a CLOSE SHORT signal!")
    }
  },
  function (context) { // OnTransaction()
  }
)
