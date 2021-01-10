registerEA(
  "auto_mm",
  "Automated market maker(v1.0)",
  [{
  	name: "basePlatform",
  	value: "eth",
  	required: true,
  	type: "String",
  	range: null,
  	step: null
  }, {
  	name: "baseCryptocurrency",
  	value: "WEENUS",
  	required: true,
  	type: "String",
  	range: null,
  	step: null
  }, {
  	name: "termPlatform",
  	value: "eos",
  	required: true,
  	type: "String",
  	range: null,
  	step: null
  }, {
  	name: "termCryptocurrency",
  	value: "JUNGLE",
  	required: true,
  	type: "String",
  	range: null,
  	step: null
  }], // parameters
  function (context) { // Init()
    window.ethAccount = "YOUR ETHEREUM ADDRESS"
    window.ethPrivateKey = "YOUR ETHEREUM PRIVATE KEY"
    window.eosAccount = "YOUR EOSIO ACCOUNT"
    window.eosPrivateKey = "YOUR EOSIO PRIVATE KEY"

    window.mailAddr = "test@xcoinch.com"

		window.basePlatform = getEAParameter(context, "basePlatform").toLowerCase()
    window.baseCryptocurrency = getEAParameter(context, "baseCryptocurrency").toUpperCase()
    window.termPlatform = getEAParameter(context, "termPlatform").toLowerCase()
    window.termCryptocurrency = getEAParameter(context, "termCryptocurrency").toUpperCase()

    window.queue = []
    window.tradeInterval = 300000
    window.oneHour = 3600000
    window.contactId = "0"
    window.dexConnected = false
    window.testNet = 1
    window.serverUrl = "https://lmk2m8udud.execute-api.eu-central-1.amazonaws.com/v1"
    window.ethReceiptUrl = null
    var ethRpcUrl = "https://rinkeby.infura.io/v3/467e60929f46412f8ea456d04ab491da"
    var ethWeb3 = "https://www.fintechee.com/js/wallet/web3.min.js"
    var eosRpcUrl = "https://jungle3.cryptolions.io"
    var eosJsSig = "https://www.fintechee.com/js/wallet/eosjs-jssig.min.js"
    var eosRpc = "https://www.fintechee.com/js/wallet/eosjs-jsonrpc.min.js"
    var eosApi = "https://www.fintechee.com/js/wallet/eosjs-api.min.js"

    if (window.basePlatform != "eth" && window.basePlatform != "eos") {
      printErrorMessage("The base platforms is not correct.")
      return
    }

    if (window.termPlatform != "eth" && window.termPlatform != "eos") {
      printErrorMessage("The term platforms is not correct.")
      return
    }

    if (window.ethAccount == null || window.ethAccount == "" || window.eosAccount == null || window.eosAccount == "") {
      printErrorMessage("The account should not be empty.")
      return
    }

    if (window.ethPrivateKey == null || window.ethPrivateKey == "" || window.eosPrivateKey == null || window.eosPrivateKey == "") {
      printErrorMessage("The private key should not be empty.")
      return
    }

    var tags = document.getElementsByTagName("script")
    for (var i = tags.length - 1; i >= 0; i--) {
      if (tags[i] && tags[i].getAttribute("src") != null &&
        (tags[i].getAttribute("src") == eosJsSig || tags[i].getAttribute("src") == eosRpc || tags[i].getAttribute("src") == eosApi || tags[i].getAttribute("src") == ethWeb3)) {
        tags[i].parentNode.removeChild(tags[i])
      }
    }

    var script0 = document.createElement("script")
    document.body.appendChild(script0)
    script0.onload = function () {
      window.eth_api = new Web3(ethRpcUrl)
      window.dexEthLibsLoaded = true
    }
    script0.onerror = function () {}
    script0.async = true
    script0.src = ethWeb3

    var script1 = document.createElement("script")
    document.body.appendChild(script1)
    script1.onload = function () {
      var script2 = document.createElement("script")
      document.body.appendChild(script2)
      script2.onload = function () {
        var script3 = document.createElement("script")
        document.body.appendChild(script3)
        script3.onload = function () {
          window.eosjs_jsonrpc = eosjs_jsonrpc
          window.eos_rpc = new eosjs_jsonrpc.JsonRpc(eosRpcUrl)
          var eos_signatureProvider = new eosjs_jssig.JsSignatureProvider([eosPrivateKey])
          window.eos_api = new eosjs_api.Api({rpc: window.eos_rpc, signatureProvider: eos_signatureProvider})
          window.dexEosLibsLoaded = true
        }
        script3.onerror = function () {}
        script3.async = true
        script3.src = eosJsSig
      }
      script2.onerror = function () {}
      script2.async = true
      script2.src = eosRpc
    }
    script1.onerror = function () {}
    script1.async = true
    script1.src = eosApi

    window.notifier = {
      notificationTimeout: 10000,
      notifyTransactionForModification: function (platform, modificationFeeTrxId, modificationFeeBlockNum, callback) {
        var data = JSON.stringify({
          platform: platform,
          modificationFeeTrxId: modificationFeeTrxId,
          modificationFeeBlockNum: modificationFeeBlockNum,
          contactId: window.contactId
        })

        $.ajax({
          type: "POST",
          url: window.serverUrl + "/notifications/modification",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          data: JSON.stringify({
            type: "M",
            data: data
          }),
          success: function (data) {
            if (typeof data.res == "string" && data.res == "success") {
              callback()
            }
          },
          error: function (request, status, error) {
            setTimeout(function () {
              window.notifier.notifyTransactionForModification(platform, modificationFeeTrxId, modificationFeeBlockNum, callback)
            }, window.notifier.notificationTimeout)
          }
        })
      },
      notifyTransactionForCancellation: function (platform, cancellationFeeTrxId, cancellationFeeBlockNum, callback) {
        var data = JSON.stringify({
          platform: platform,
          cancellationFeeTrxId: cancellationFeeTrxId,
          cancellationFeeBlockNum: cancellationFeeBlockNum,
          contactId: window.contactId
        })

        $.ajax({
          type: "POST",
          url: window.serverUrl + "/notifications/cancellation",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          data: JSON.stringify({
            type: "C",
            data: data
          }),
          success: function (data) {
            if (typeof data.res == "string" && data.res == "success") {
              callback()
            }
          },
          error: function (request, status, error) {
            setTimeout(function () {
              window.notifier.notifyTransactionForCancellation(platform, cancellationFeeTrxId, cancellationFeeBlockNum, callback)
            }, window.notifier.notificationTimeout)
          }
        })
      },
      notifyTransaction: function (mailAddress, platform, feeTrxId, feeBlockNum, trxId, blockNum, callback) {
        var data = JSON.stringify({
          mailAddr: mailAddress,
          platform: platform,
          feeTrxId: feeTrxId,
          feeBlockNum: feeBlockNum,
          trxId: trxId,
          blockNum: blockNum,
          contactId: window.contactId
        })

        $.ajax({
          type: "POST",
          url: window.serverUrl + "/notifications/transaction",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          data: JSON.stringify({
            type: "O",
            data: data
          }),
          success: function (data) {
            if (typeof data.res == "string" && data.res == "success") {
              callback()
            }
          },
          error: function (request, status, error) {
            setTimeout(function () {
              window.notifier.notifyTransaction(mailAddress, platform, feeTrxId, feeBlockNum, trxId, blockNum, callback)
            }, window.notifier.notificationTimeout)
          }
        })
      }
    }

    window.orderStore = {
      storeAddedOrder: function (order) {
        var dexOrders = []
        if (typeof localStorage.dexOrders != "undefined") {
          dexOrders = JSON.parse(localStorage.dexOrders)
        }
        dexOrders.push(order)
        localStorage.dexOrders = JSON.stringify(dexOrders)
      },
      storeUpdatedOrder: function (order) {
        if (typeof localStorage.dexOrders != "undefined") {
          var dexOrders = JSON.parse(localStorage.dexOrders)

          for (var i in dexOrders) {
            if (isNaN(i)) continue

            var oldOrder = dexOrders[i]

            if (oldOrder.trxId == order.oldTrxId && oldOrder.blockNum == order.oldBlockNum) {
              oldOrder.price = order.price
              oldOrder.basePlatform = order.basePlatform
              oldOrder.baseCryptocurrency = order.baseCryptocurrency
              oldOrder.baseAmount = order.baseAmount
              oldOrder.accuBaseAmountTraded = order.accuBaseAmountTraded
              var currentAllowedTimesToTransfer = oldOrder.currentAllowedTimesToTransfer + order.currentAllowedTimesToTransfer
              oldOrder.currentAllowedTimesToTransfer = currentAllowedTimesToTransfer
              order.currentAllowedTimesToTransfer = currentAllowedTimesToTransfer
              oldOrder.expiration = order.expiration
              oldOrder.baseAccount = order.baseAccount
              oldOrder.modificationFeeTrxId = order.modificationFeeTrxId
              oldOrder.modificationFeeBlockNum = order.modificationFeeBlockNum
              oldOrder.state = order.state

              localStorage.dexOrders = JSON.stringify(dexOrders)

              break
            }
          }
        }
      },
      storeRemovedOrder: function (oldTrxId, oldBlockNum, cancellationFeeTrxId, cancellationFeeBlockNum) {
        var currentAllowedTimesToTransfer = null

        if (typeof localStorage.dexOrders != "undefined") {
          var dexOrders = JSON.parse(localStorage.dexOrders)

          for (var i in dexOrders) {
            if (isNaN(i)) continue

            var oldOrder = dexOrders[i]

            if (oldOrder.trxId == oldTrxId && oldOrder.blockNum == oldBlockNum) {
              oldOrder.cancellationFeeTrxId = cancellationFeeTrxId
              oldOrder.cancellationFeeBlockNum = cancellationFeeBlockNum
              oldOrder.currentAllowedTimesToTransfer--
              currentAllowedTimesToTransfer = oldOrder.currentAllowedTimesToTransfer
              oldOrder.state = "PC"
              localStorage.dexOrders = JSON.stringify(dexOrders)

              break
            }
          }
        }

        return currentAllowedTimesToTransfer
      }
    }

    window.platforms = []

    window.platforms["eth"] = {}
    window.platforms["eth"].checkBlockInterval = 20000
    window.platforms["eth"].cryptocurrencies = []
    window.platforms["eth"].latestContext = null
    window.platforms["eth"].notifications = []

    window.platforms["eth"].getSmartContract = function (cryptocurrency) {
      if (typeof this.cryptocurrencies[cryptocurrency] != "undefined") {
        return this.cryptocurrencies[cryptocurrency].smartContract.toLowerCase()
      } else if (cryptocurrency == "ETH") {
        return "ETH"
      }

      return null
    }

    window.platforms["eth"].getActionName = function (cryptocurrency) {
      var actionName = null

      if (typeof this.cryptocurrencies[cryptocurrency] != "undefined") {
        actionName = this.cryptocurrencies[cryptocurrency].actionName
      } else if (cryptocurrency == "ETH") {
        actionName = []
      }

      return actionName
    }

    window.platforms["eth"].getPlatformCurrency = function () {
      return "ETH"
    }

    window.platforms["eth"].getFeeAmountRequired = function () {
      return this.feeAmountRequired * 2.0
    }

    window.platforms["eth"].getFeeAmountRequiredForOperation = function () {
      return this.feeAmountRequired
    }

    window.platforms["eth"].makeAmountAccurate = function (currency, amount) {
      if (typeof this.cryptocurrencies[currency] != "undefined") {
        if (this.cryptocurrencies[currency].accuracy > 0) {
          return Math.round(amount * Math.pow(10, this.cryptocurrencies[currency].accuracy)) + ""
        } else if (this.cryptocurrencies[currency].accuracy < 0) {
          return amount.toFixed(Math.abs(this.cryptocurrencies[currency].accuracy))
        } else {
          return Math.round(amount) + ""
        }
      } else if (currency == "ETH") {
        return Math.round(amount * 1e18) + ""
      }

      return null
    }

    window.platforms["eth"].getNonce = function (address) {
      return new Promise((resolve, reject) => {
        window.eth_api.eth.getTransactionCount(address, (err, data) => {
          if(err)
            reject(err)
          else
            resolve(parseInt(data))
        })
      })
    }

    window.platforms["eth"].getGasPrice = function () {
      return new Promise((resolve, reject) => {
        window.eth_api.eth.getGasPrice((err, data) => {
          if(err)
            reject(err)
          else
            resolve(data)
        })
      })
    }

    window.platforms["eth"].estimateGas = function (txOptions) {
      return new Promise((resolve, reject) => {
        window.eth_api.eth.estimateGas(txOptions, (err, data) => {
          if(err)
            reject(err)
          else
            resolve(data)
        })
      })
    }

    window.platforms["eth"].generateNonce = function () {
      return Math.floor(Math.random() * 10000000000) + ""
    }

    window.platforms["eth"].checkBlock = function (context, callback) {
      $.ajax({
        type: "GET",
        url: window.ethReceiptUrl + window.ethAccount,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
          (async () => {
            if (typeof data.result != "undefined") {
              var result = data.result

              if (Array.isArray(result)) {
                for (var i in result) {
                  if (isNaN(i)) continue

                  var receipt = result[i]

                  if (typeof receipt.from != "undefined" && receipt.from.toLowerCase() == window.ethAccount.toLowerCase() && receipt.to.toLowerCase() == context.that.exchange.toLowerCase()) {
                    var memo = window.eth_api.utils.toUtf8(result[i].input).split(":")
                    var nonce = memo[memo.length - 1]

                    if (context.nonce == nonce) {

                      if (receipt.blockNumber) {
                        context.feeTrxId = receipt.hash
                        context.feeBlockNum = parseInt(receipt.blockNumber)
                      }

                      break
                    }
                  }
                }

                if (!context.feeBlockNum) {
                  await new Promise(resolve => setTimeout(resolve, context.that.checkBlockInterval))

                  context.that.checkBlock(context, callback)
                } else {
                  callback(context)
                }
              }
            }
          })()
        },
        error: function (request, status, error) {
          setTimeout(function () {
            context.that.checkBlock(context, callback)
          }, context.that.checkBlockInterval)
        }
      })
    }

    window.platforms["eth"].notifyOrderbook = function () {
      for (var i in window.platforms["eth"].notifications) {
        if (isNaN(i)) continue

        var notification = window.platforms["eth"].notifications[i]
        var context = notification.context

        if (!notification.done && typeof context != "undefined") {
          if (context.mode == "sendOrder") {
            context.that.checkBlock(context, function (ctx) {
              var notification2 = window.platforms["eth"].notifications[ctx.nonce]

              if (!notification2.done) {
                window.notifier.notifyTransaction(ctx.mailAddr, "eth", ctx.feeTrxId, ctx.feeBlockNum, ctx.trxId, ctx.blockNum, function () {
                  printMessage("Transaction to pay for the fee is pushed! Pending to list on the orderbook.")

                  var order = {
                    price: ctx.price,
                    basePlatform: ctx.basePlatform,
                    baseCryptocurrency: ctx.baseCryptocurrency,
                    baseAmount: ctx.baseAmountTmp,
                    accuBaseAmountTraded: 0,
                    termPlatform: ctx.termPlatform,
                    termCryptocurrency: ctx.termCryptocurrency,
                    termAmount: ctx.termAmountTmp,
                    termCurrentAmount: ctx.termAmountTmp,
                    currentAllowedTimesToTransfer: ctx.currentAllowedTimesToTransfer,
                    expiration: ctx.expiration,
                    baseAccount: ctx.baseAccount,
                    trxId: ctx.trxId,
                    blockNum: ctx.blockNum,
                    feeTrxId: ctx.feeTrxId,
                    feeBlockNum: ctx.feeBlockNum,
                    modificationFeeTrxId: null,
                    modificationFeeBlockNum: null,
                    cancellationFeeTrxId: null,
                    cancellationFeeBlockNum: null,
                    mailAddr: ctx.mailAddr,
                    state: "PO"
                  }

                  window.orderStore.storeAddedOrder(order)
                })

                notification2.done = true
              }
            })
          } else if (context.mode == "modifyOrder") {
            context.that.checkBlock(context, function (ctx) {
              var notification2 = window.platforms["eth"].notifications[ctx.nonce]

              if (!notification2.done) {
                window.notifier.notifyTransactionForModification("eth", ctx.feeTrxId, ctx.feeBlockNum, function () {
                  printMessage("Transaction to modify the order is pushed! Pending to update on the orderbook.")

                  var order = {
                    price: ctx.price,
                    basePlatform: ctx.basePlatform,
                    baseCryptocurrency: ctx.baseCryptocurrency,
                    baseAmount: ctx.baseAmountTmp,
                    accuBaseAmountTraded: 0,
                    currentAllowedTimesToTransfer: ctx.currentAllowedTimesToTransfer,
                    expiration: ctx.expiration,
                    baseAccount: ctx.baseAccount,
                    oldTrxId: ctx.oldTrxId,
                    oldBlockNum: ctx.oldBlockNum,
                    modificationFeeTrxId: ctx.feeTrxId,
                    modificationFeeBlockNum: ctx.feeBlockNum,
                    state: "PU"
                  }

                  window.orderStore.storeUpdatedOrder(order)
                })

                notification2.done = true
              }
            })
          } else if (context.mode == "cancelOrder") {
            context.that.checkBlock(context, function (ctx) {
              var notification2 = window.platforms["eth"].notifications[ctx.nonce]

              if (!notification2.done) {
                window.notifier.notifyTransactionForCancellation("eth", ctx.feeTrxId, ctx.feeBlockNum, function () {
                  printMessage("Transaction to cancel the order is pushed! Pending to remove the order from the orderbook.")

                  window.orderStore.storeRemovedOrder(ctx.oldTrxId, ctx.oldBlockNum, ctx.feeTrxId, ctx.feeBlockNum)
                })

                notification2.done = true
              }
            })
          }
        }
      }
    }

    window.platforms["eth"].sendOrder = async function (mailAddr, smartContract, actionName, termAmount, termCryptocurrency, feeAmount, platformCurrency, memo,
                                                        basePlatform, baseAccount, baseCryptocurrency, baseAmount, termPlatform, price, currentAllowedTimesToTransfer, expiration,
                                                        baseAmountTmp, termAmountTmp) {
      if (!window.dexEthLibsLoaded) return

      var context = {
        mode: "sendOrder",
        that: this,
        mailAddr: mailAddr,
        smartContract: smartContract,
        actionName: actionName,
        termAmount: termAmount,
        termAmountTmp: termAmountTmp,
        termCryptocurrency: termCryptocurrency,
        feeAmount: feeAmount,
        platformCurrency: platformCurrency,
        memo: "O:" + memo,
        trxId: null,
        blockNum: null,
        feeTrxId: null,
        feeBlockNum: null,
        basePlatform: basePlatform,
        baseAccount: baseAccount,
        baseCryptocurrency: baseCryptocurrency,
        baseAmount: baseAmount,
        baseAmountTmp: baseAmountTmp,
        termPlatform: termPlatform,
        price: price,
        currentAllowedTimesToTransfer: currentAllowedTimesToTransfer,
        expiration: expiration
      }

      if (context.smartContract == "ETH") {
        var txParams = {
          to: this.exchange,
          value: termAmount,
          gasPrice: await getGasPrice(),
          nonce: await this.getNonce(window.ethAccount)
        }

        var gasLimit = await this.estimateGas(txParams)
        txParams.gas = Math.round(gasLimit * 1.5)

        const signed = await window.eth_api.eth.accounts.signTransaction(txParams, window.ethPrivateKey)

        window.eth_api.eth.sendSignedTransaction(signed.rawTransaction)
        .then(async function (receipt) {
          var context2 = context
          context.trxId = receipt.transactionHash
          context.blockNum = receipt.blockNumber

          printMessage("Transaction to transfer the collateral is pushed!")

          var funcTmp = async function () {
            var context3 = context2

            while (!context2.blockNum) {
              await new Promise(resolve => setTimeout(resolve, context2.that.checkBlockInterval))

              const result = await window.eth_api.eth.getTransaction(context2.trxId)

              if (result.blockNumber) {
                context2.blockNum = result.blockNumber
                break
              }
            }

            var nonce = context2.that.generateNonce()
            context2.nonce = nonce
            context2.that.notifications[nonce] = {
              context: context2,
              done: false
            }

            var feeTxParams = {
              to: context2.that.feeRecipient,
              value: context2.feeAmount,
              gasPrice: await context2.that.getGasPrice(),
              nonce: await context2.that.getNonce(window.ethAccount),
              data: window.eth_api.utils.toHex(context2.memo + ":" + nonce)
            }

            var feeGasLimit = await context2.that.estimateGas(feeTxParams)
            feeTxParams.gas = Math.round(feeGasLimit * 1.5)

            const feeSigned = await window.eth_api.eth.accounts.signTransaction(feeTxParams, window.ethPrivateKey)

            window.eth_api.eth.sendSignedTransaction(feeSigned.rawTransaction)
            .then(receipt => {})
            .catch(err => {})

            await new Promise(resolve => setTimeout(resolve, context2.that.checkBlockInterval))

            context2.that.notifyOrderbook()
          }

          await funcTmp()
        }).catch(err => {
          printErrorMessage("Error while sending transaction(ETH platform): ", err)
        })
      } else {
        var contract = new window.eth_api.eth.Contract(actionName, smartContract)
        var extraData = await contract.methods.transfer(this.exchange, termAmount)

        const signed = await window.eth_api.eth.accounts.signTransaction({
          to: smartContract,
          value: "0",
          data: extraData.encodeABI(),
          gasPrice: await this.getGasPrice(),
          gas: Math.round((await extraData.estimateGas({from: window.ethAccount})) * 1.5),
          nonce: await this.getNonce(window.ethAccount)
        }, window.ethPrivateKey)

        window.eth_api.eth.sendSignedTransaction(signed.rawTransaction)
        .then(async function (receipt) {
          var context2 = context
          context.trxId = receipt.transactionHash
          context.blockNum = receipt.blockNumber

          printMessage("Transaction to transfer the collateral is pushed!")

          var funcTmp = async function () {
            var context3 = context2

            while (!context2.blockNum) {
              await new Promise(resolve => setTimeout(resolve, context2.that.checkBlockInterval))

              const result = await window.eth_api.eth.getTransaction(context2.trxId)

              if (result.blockNumber) {
                context2.blockNum = result.blockNumber
                break
              }
            }

            var nonce = context2.that.generateNonce()
            context2.nonce = nonce
            context2.that.notifications[nonce] = {
              context: context2,
              done: false
            }

            var feeTxParams = {
              to: context2.that.feeRecipient,
              value: context2.feeAmount,
              gasPrice: await context2.that.getGasPrice(),
              nonce: await context2.that.getNonce(window.ethAccount),
              data: window.eth_api.utils.toHex(context2.memo + ":" + nonce)
            }

            var feeGasLimit = await context2.that.estimateGas(feeTxParams)
            feeTxParams.gas = Math.round(feeGasLimit * 1.5)

            const feeSigned = await window.eth_api.eth.accounts.signTransaction(feeTxParams, window.ethPrivateKey)

            window.eth_api.eth.sendSignedTransaction(feeSigned.rawTransaction)
            .then(receipt => {})
            .catch(err => {})

            await new Promise(resolve => setTimeout(resolve, context2.that.checkBlockInterval))

            context2.that.notifyOrderbook()
          }

          await funcTmp()
        })
        .catch(err => {
          printErrorMessage("Error while sending transaction(ETH platform): ", err)
        })
      }
    }

    window.platforms["eth"].modifyOrder = async function (feeAmount, platformCurrency, memo,
        oldTrxId, oldBlockNum, basePlatform, baseAccount, baseCryptocurrency, baseAmount, price, currentAllowedTimesToTransfer, expiration, baseAmountTmp) {
      if (!window.dexEthLibsLoaded) return

      var context = {
        mode: "modifyOrder",
        that: this,
        feeAmount: feeAmount,
        platformCurrency: platformCurrency,
        memo: "U:" + memo,
        feeTrxId: null,
        feeBlockNum: null,
        oldTrxId: oldTrxId,
        oldBlockNum: oldBlockNum,
        basePlatform: basePlatform,
        baseAccount: baseAccount,
        baseCryptocurrency: baseCryptocurrency,
        baseAmount: baseAmount,
        baseAmountTmp: baseAmountTmp,
        price: price,
        currentAllowedTimesToTransfer: currentAllowedTimesToTransfer,
        expiration: expiration
      }

      var nonce = this.generateNonce()
      context.nonce = nonce
      this.notifications[nonce] = {
        context: context,
        done: false
      }

      var txParams = {
        to: this.feeRecipient,
        value: feeAmount,
        gasPrice: await this.getGasPrice(),
        nonce: await this.getNonce(window.ethAccount),
        data: window.eth_api.utils.toHex(context.memo + ":" + nonce)
      }

      var gasLimit = await this.estimateGas(txParams)
      txParams.gas = Math.round(gasLimit * 1.5)

      const signed = await window.eth_api.eth.accounts.signTransaction(txParams, window.ethPrivateKey)

      window.eth_api.eth.sendSignedTransaction(signed.rawTransaction)
      .then(receipt => {})
      .catch(err => {})

      await new Promise(resolve => setTimeout(resolve, this.checkBlockInterval))

      this.notifyOrderbook()
    }

    window.platforms["eth"].cancelOrder = async function (feeAmount, platformCurrency, memo, oldTrxId, oldBlockNum) {
      if (!window.dexEthLibsLoaded) return

      var context = {
        mode: "cancelOrder",
        that: this,
        feeAmount: feeAmount,
        platformCurrency: platformCurrency,
        memo: "C:" + memo,
        feeTrxId: null,
        feeBlockNum: null,
        oldTrxId: oldTrxId,
        oldBlockNum: oldBlockNum
      }

      var nonce = this.generateNonce()
      context.nonce = nonce
      this.notifications[nonce] = {
        context: context,
        done: false
      }

      var txParams = {
        to: this.feeRecipient,
        value: feeAmount,
        gasPrice: await this.getGasPrice(),
        nonce: await this.getNonce(window.ethAccount),
        data: window.eth_api.utils.toHex(context.memo + ":" + nonce)
      }

      var gasLimit = await this.estimateGas(txParams)
      txParams.gas = Math.round(gasLimit * 1.5)

      const signed = await window.eth_api.eth.accounts.signTransaction(txParams, window.ethPrivateKey)

      window.eth_api.eth.sendSignedTransaction(signed.rawTransaction)
      .then(receipt => {})
      .catch(err => {})

      await new Promise(resolve => setTimeout(resolve, this.checkBlockInterval))

      this.notifyOrderbook()
    }

    window.platforms["eos"] = {}
    window.platforms["eos"].checkBlockInterval = 3000
    window.platforms["eos"].cryptocurrencies = []

    window.platforms["eos"].getSmartContract = function (cryptocurrency) {
      if (typeof this.cryptocurrencies[cryptocurrency] != "undefined") {
        return this.cryptocurrencies[cryptocurrency].smartContract
      } else if (cryptocurrency == "EOS") {
        return "eosio.token"
      }

      return null
    }

    window.platforms["eos"].getActionName = function (cryptocurrency) {
      if (typeof this.cryptocurrencies[cryptocurrency] != "undefined") {
        return this.cryptocurrencies[cryptocurrency].actionName
      } else if (cryptocurrency == "EOS") {
        return "transfer"
      }

      return null
    }

    window.platforms["eos"].getPlatformCurrency = function () {
      return "EOS"
    }

    window.platforms["eos"].getFeeAmountRequired = function () {
      return this.feeAmountRequired * 2.0
    }

    window.platforms["eos"].getFeeAmountRequiredForOperation = function () {
      return this.feeAmountRequired
    }

    window.platforms["eos"].makeAmountAccurate = function (currency, amount) {
      if (typeof this.cryptocurrencies[currency] != "undefined") {
        if (this.cryptocurrencies[currency].accuracy < 0) {
          return amount.toFixed(Math.abs(this.cryptocurrencies[currency].accuracy))
        } else {
          return Math.round(amount) + ""
        }
      } else if (currency == "EOS") {
        return amount.toFixed(4)
      }

      return null
    }

    window.platforms["eos"].sendOrder = function (mailAddr, smartContract, actionName, termAmount, termCryptocurrency, feeAmount, platformCurrency, memo,
                                                  basePlatform, baseAccount, baseCryptocurrency, baseAmount, termPlatform, price, currentAllowedTimesToTransfer, expiration,
                                                  baseAmountTmp, termAmountTmp) {
      if (!window.dexEosLibsLoaded) return

      var context = {
        that: this,
        mailAddr: mailAddr,
        smartContract: smartContract,
        actionName: actionName,
        termAmount: termAmount,
        termAmountTmp: termAmountTmp,
        termCryptocurrency: termCryptocurrency,
        feeAmount: feeAmount,
        platformCurrency: platformCurrency,
        memo: memo,
        trxId: null,
        blockNum: null,
        feeTrxId: null,
        feeBlockNum: null,
        basePlatform: basePlatform,
        baseAccount: baseAccount,
        baseCryptocurrency: baseCryptocurrency,
        baseAmount: baseAmount,
        baseAmountTmp: baseAmountTmp,
        termPlatform: termPlatform,
        price: price,
        currentAllowedTimesToTransfer: currentAllowedTimesToTransfer,
        expiration: expiration
      }

      var context2 = context;

      (async () => {
        try {
          const result = await window.eos_api.transact({
            actions: [{
                account: "eosio.token",
                name: "transfer",
                authorization: [{
                    actor: window.eosAccount,
                    permission: "active",
                }],
                data: {
                    from: window.eosAccount,
                    to: context2.that.feeRecipient,
                    quantity: context2.feeAmount + " " + context2.platformCurrency,
                    memo: "O:" + context2.memo
                }
            }]
          }, {
            blocksBehind: 3,
            expireSeconds: 30
          })

          printMessage("Transaction to pay for the fee is pushed!")
          context2.feeTrxId = result.transaction_id
          var context3 = context2

          var funcTmp = async function () {
            while (!context3.feeBlockNum) {
              await new Promise(resolve => setTimeout(resolve, context3.that.checkBlockInterval))

              const res = await window.eos_rpc.history_get_transaction(context3.feeTrxId)
              printMessage("Fee trx EOS new block number: " + context3.feeTrxId + " " +  + res.block_num)

              if (res != null && typeof res.trx != "undefined" && typeof res.trx.receipt != "undefined" &&
                  typeof res.trx.receipt.status == "string" && res.trx.receipt.status == "executed" &&
                  typeof res.block_num != "undefined" && Number.isInteger(res.block_num)) {
                context3.feeBlockNum = res.block_num
                break
              }
            }
          }

          await funcTmp();

          (async () => {
            try {
              const result = await window.eos_api.transact({
                actions: [{
                    account: context3.smartContract,
                    name: context3.actionName,
                    authorization: [{
                        actor: window.eosAccount,
                        permission: "active",
                    }],
                    data: {
                        from: window.eosAccount,
                        to: context3.that.exchange,
                        quantity: context3.termAmount + " " + context3.termCryptocurrency,
                        memo: ""
                    }
                }]
              }, {
                blocksBehind: 3,
                expireSeconds: 30
              })

              context3.trxId = result.transaction_id
              var context0 = context3

              var funcTmp2 = async function () {
                while (!context0.blockNum) {
                  await new Promise(resolve => setTimeout(resolve, context0.that.checkBlockInterval))

                  const res = await window.eos_rpc.history_get_transaction(context0.trxId)
                  printMessage("Trx EOS new block number: " + context0.trxId + " " + res.block_num)

                  if (res != null && typeof res.trx != "undefined" && typeof res.trx.receipt != "undefined" &&
                      typeof res.trx.receipt.status == "string" && res.trx.receipt.status == "executed" &&
                      typeof res.block_num != "undefined" && Number.isInteger(res.block_num)) {
                    context0.blockNum = res.block_num
                    break
                  }
                }
              }

              await funcTmp2()

              window.notifier.notifyTransaction(context3.mailAddr, "eos", context3.feeTrxId, context3.feeBlockNum, context3.trxId, context3.blockNum, function () {
                printMessage("Transaction to transfer the collateral is pushed! Pending to list on the orderbook.")

                var order = {
                  price: context0.price,
                  basePlatform: context0.basePlatform,
                  baseCryptocurrency: context0.baseCryptocurrency,
                  baseAmount: context0.baseAmountTmp,
                  accuBaseAmountTraded: 0,
                  termPlatform: context0.termPlatform,
                  termCryptocurrency: context0.termCryptocurrency,
                  termAmount: context0.termAmountTmp,
                  termCurrentAmount: context0.termAmountTmp,
                  currentAllowedTimesToTransfer: context0.currentAllowedTimesToTransfer,
                  expiration: context0.expiration,
                  baseAccount: context0.baseAccount,
                  trxId: context0.trxId,
                  blockNum: context0.blockNum,
                  feeTrxId: context0.feeTrxId,
                  feeBlockNum: context0.feeBlockNum,
                  modificationFeeTrxId: null,
                  modificationFeeBlockNum: null,
                  cancellationFeeTrxId: null,
                  cancellationFeeBlockNum: null,
                  mailAddr: context0.mailAddr,
                  state: "PO"
                }

                window.orderStore.storeAddedOrder(order)
              })
            } catch (e) {
              printErrorMessage("Caught exception while sending transaction(EOS platform): " + e)

              if (e instanceof window.eosjs_jsonrpc.RpcError) {
                printErrorMessage(JSON.stringify(e.json, null, 2))
              }
            }
          })()
        } catch (e) {
          printErrorMessage("Caught exception while sending transaction(EOS platform): " + e)

          if (e instanceof window.eosjs_jsonrpc.RpcError) {
            printErrorMessage(JSON.stringify(e.json, null, 2))
          }
        }
      })()
    }

    window.platforms["eos"].modifyOrder = function (feeAmount, platformCurrency, memo,
        oldTrxId, oldBlockNum, basePlatform, baseAccount, baseCryptocurrency, baseAmount, price, currentAllowedTimesToTransfer, expiration, baseAmountTmp) {
      if (!window.dexEosLibsLoaded) return

      var context = {
        that: this,
        feeAmount: feeAmount,
        platformCurrency: platformCurrency,
        memo: memo,
        feeTrxId: null,
        feeBlockNum: null,
        oldTrxId: oldTrxId,
        oldBlockNum: oldBlockNum,
        basePlatform: basePlatform,
        baseAccount: baseAccount,
        baseCryptocurrency: baseCryptocurrency,
        baseAmount: baseAmount,
        baseAmountTmp: baseAmountTmp,
        price: price,
        currentAllowedTimesToTransfer: currentAllowedTimesToTransfer,
        expiration: expiration
      }

      var context2 = context;

      (async () => {
        try {
          const result = await window.eos_api.transact({
            actions: [{
                account: "eosio.token",
                name: "transfer",
                authorization: [{
                    actor: window.eosAccount,
                    permission: "active",
                }],
                data: {
                    from: window.eosAccount,
                    to: context2.that.feeRecipient,
                    quantity: context2.feeAmount + " " + context2.platformCurrency,
                    memo: "U:" + context2.memo
                }
            }]
          }, {
            blocksBehind: 3,
            expireSeconds: 30
          })

          printMessage("Transaction to modify the order is pushed! Pending to update on the orderbook.")
          context2.feeTrxId = result.transaction_id
          var context3 = context2

          var funcTmp = async function () {
            while (!context3.feeBlockNum) {
              await new Promise(resolve => setTimeout(resolve, context3.that.checkBlockInterval))

              const res = await window.eos_rpc.history_get_transaction(context3.feeTrxId)

              if (res != null && typeof res.trx != "undefined" && typeof res.trx.receipt != "undefined" &&
                  typeof res.trx.receipt.status == "string" && res.trx.receipt.status == "executed" &&
                  typeof res.block_num != "undefined" && Number.isInteger(res.block_num)) {
                context3.feeBlockNum = res.block_num
                break
              }
            }
          }

          await funcTmp()

          window.notifier.notifyTransactionForModification("eos", context2.feeTrxId, context2.feeBlockNum, function () {
            var order = {
              price: context3.price,
              basePlatform: context3.basePlatform,
              baseCryptocurrency: context3.baseCryptocurrency,
              baseAmount: context3.baseAmountTmp,
              accuBaseAmountTraded: 0,
              currentAllowedTimesToTransfer: context3.currentAllowedTimesToTransfer,
              expiration: context3.expiration,
              baseAccount: context3.baseAccount,
              oldTrxId: context3.oldTrxId,
              oldBlockNum: context3.oldBlockNum,
              modificationFeeTrxId: context3.feeTrxId,
              modificationFeeBlockNum: context3.feeBlockNum,
              state: "PU"
            }

            window.orderStore.storeUpdatedOrder(order)
          })
        } catch (e) {
          printErrorMessage("Caught exception while sending transaction(EOS platform): " + e)

          if (e instanceof window.eosjs_jsonrpc.RpcError) {
            printErrorMessage(JSON.stringify(e.json, null, 2))
          }
        }
      })()
    }

    window.platforms["eos"].cancelOrder = function (feeAmount, platformCurrency, memo, oldTrxId, oldBlockNum) {
      if (!window.dexEosLibsLoaded) return

      var context = {
        that: this,
        feeAmount: feeAmount,
        platformCurrency: platformCurrency,
        memo: memo,
        feeTrxId: null,
        feeBlockNum: null,
        oldTrxId: oldTrxId,
        oldBlockNum: oldBlockNum
      }

      var context2 = context;

      (async () => {
        try {
          const result = await window.eos_api.transact({
            actions: [{
                account: "eosio.token",
                name: "transfer",
                authorization: [{
                    actor: window.eosAccount,
                    permission: "active",
                }],
                data: {
                    from: window.eosAccount,
                    to: context2.that.feeRecipient,
                    quantity: context2.feeAmount + " " + context2.platformCurrency,
                    memo: "C:" + context2.memo
                }
            }]
          }, {
            blocksBehind: 3,
            expireSeconds: 30
          })

          printMessage("Transaction to cancel the order is pushed! Pending to remove the order from the orderbook.")
          context2.feeTrxId = result.transaction_id
          var context3 = context2

          var funcTmp = async function () {
            while (!context3.feeBlockNum) {
              await new Promise(resolve => setTimeout(resolve, context3.that.checkBlockInterval))

              const res = await window.eos_rpc.history_get_transaction(context3.feeTrxId)

              if (res != null && typeof res.trx != "undefined" && typeof res.trx.receipt != "undefined" &&
                  typeof res.trx.receipt.status == "string" && res.trx.receipt.status == "executed" &&
                  typeof res.block_num != "undefined" && Number.isInteger(res.block_num)) {
                context3.feeBlockNum = res.block_num
                break
              }
            }
          }

          await funcTmp()

          window.notifier.notifyTransactionForCancellation("eos", context2.feeTrxId, context2.feeBlockNum, function () {
            window.orderStore.storeRemovedOrder(context3.oldTrxId, context3.oldBlockNum, context3.feeTrxId, context3.feeBlockNum)
          })
        } catch (e) {
          printErrorMessage("Caught exception while sending transaction(EOS platform): " + e)

          if (e instanceof window.eosjs_jsonrpc.RpcError) {
            printErrorMessage(JSON.stringify(e.json, null, 2))
          }
        }
      })()
    }

    window.marketMaker = {
      sendOrder: function (mailAddr, basePlatform, baseAccount, baseCryptocurrency, baseAmountTmp, termPlatform, termCryptocurrency, termAmountTmp, feeAmountTmp, orderExpirationTmp) {
        var basePlatformObj = window.platforms[basePlatform]
        var termPlatformObj = window.platforms[termPlatform]
        var smartContract = termPlatformObj.getSmartContract(termCryptocurrency)
        if (smartContract == null || smartContract == "") {
          printErrorMessage("The smart contract doesn't exist.")
          return
        }
        var actionName = termPlatformObj.getActionName(termCryptocurrency)
        if (actionName == null) {
          printErrorMessage("The action name doesn't exist.")
          return
        }
        if (baseAmountTmp <= 0) {
          printErrorMessage("The amount of the base cryptocurrency should be greater than zero.")
          return
        }
        var baseAmount = basePlatformObj.makeAmountAccurate(baseCryptocurrency, baseAmountTmp)
        if (baseAmount == null) {
          printErrorMessage("The base cryptocurrency is not supported.")
          return
        }
        if (termAmountTmp <= 0) {
          printErrorMessage("The amount of the term cryptocurrency should be greater than zero.")
          return
        }
        var termAmount = termPlatformObj.makeAmountAccurate(termCryptocurrency, termAmountTmp)
        if (termAmount == null) {
          printErrorMessage("The term cryptocurrency is not supported.")
          return
        }
        var platformCurrency = termPlatformObj.getPlatformCurrency()
        if (platformCurrency == null) {
          printErrorMessage("The platform currency doesn't exist.")
          return
        }
        var feeAmountRequired = termPlatformObj.getFeeAmountRequired()
        if (feeAmountTmp < feeAmountRequired) {
          printErrorMessage("The fee shouldn't be less than " + feeAmountRequired + " " + platformCurrency + ".")
          return
        }
        var feeAmount = termPlatformObj.makeAmountAccurate(platformCurrency, feeAmountTmp)
        var orderExpiration = Math.floor(orderExpirationTmp * window.oneHour)
        if (orderExpiration < window.oneHour) {
          printErrorMessage("The expiration of the order should be greater than or equal to one hour.")
          return
        }
        if (window.platforms[termPlatform].exchange == null || window.platforms[termPlatform].feeRecipient == null || !window.dexConnected) {
          printErrorMessage("The server side is not connected yet.")
          return
        }

        var expiration = Math.round(new Date().getTime() + orderExpiration)
        var memo = baseCryptocurrency + ":" + baseAmount + ":" + termCryptocurrency + ":" + termAmount + ":" + expiration + ":" + basePlatform + ":" + baseAccount

        termPlatformObj.sendOrder(mailAddr, smartContract, actionName, termAmount, termCryptocurrency, feeAmount, platformCurrency, memo,
                                  basePlatform, baseAccount, baseCryptocurrency, baseAmount, termPlatform, termAmountTmp / baseAmountTmp,
                                  Math.round(feeAmountTmp / termPlatformObj.getFeeAmountRequiredForOperation()), expiration, baseAmountTmp, termAmountTmp)
      },
      modifyOrder: function (oldTrxId, oldBlockNum, basePlatform, baseAccount, baseCryptocurrency, baseAmountTmp, termPlatform, termCryptocurrency, termAmountTmp, oldBasePlatform, oldBaseCryptocurrency, feeAmountTmp, orderExpirationTmp) {
        var termPlatformObj = window.platforms[termPlatform]

        if (baseAmountTmp <= 0) {
          printErrorMessage("The amount of the base cryptocurrency should be greater than zero.")
          return
        }
        var basePlatformObj = window.platforms[basePlatform]
        var termPlatformObj = window.platforms[termPlatform]
        var baseAmount = basePlatformObj.makeAmountAccurate(baseCryptocurrency, baseAmountTmp)
        if (baseAmount == null) {
          printErrorMessage("The base cryptocurrency is not supported.")
          return
        }
        var platformCurrency = termPlatformObj.getPlatformCurrency()
        if (platformCurrency == null) {
          printErrorMessage("The platform currency doesn't exist.")
          return
        }
        var feeAmountRequired = termPlatformObj.getFeeAmountRequiredForOperation()
        if (feeAmountTmp < feeAmountRequired) {
          printErrorMessage("The fee shouldn't be less than " + feeAmountRequired + " " + platformCurrency + ".")
          return
        }
        var feeAmount = termPlatformObj.makeAmountAccurate(platformCurrency, feeAmountTmp)
        var orderExpiration = Math.floor(orderExpirationTmp * window.oneHour)
        if (orderExpiration < window.oneHour) {
          printErrorMessage("The expiration of the order should be greater than or equal to one hour.")
          return
        }
        if (window.platforms[termPlatform].exchange == null || window.platforms[termPlatform].feeRecipient == null || !window.dexConnected) {
          printErrorMessage("The server side is not connected yet.")
          return
        }

        var expiration = Math.round(new Date().getTime() + orderExpiration)
        var memo = baseCryptocurrency + ":" + baseAmount + ":" + termCryptocurrency + ":" + oldBasePlatform + ":" + oldBaseCryptocurrency + ":" + oldTrxId + ":" + oldBlockNum + ":" +
                  expiration + ":" + basePlatform + ":" + baseAccount

        termPlatformObj.modifyOrder(feeAmount, platformCurrency, memo,
            oldTrxId, oldBlockNum, basePlatform, baseAccount, baseCryptocurrency, baseAmount, termAmountTmp / baseAmountTmp,
            Math.round(feeAmountTmp / feeAmountRequired), expiration, baseAmountTmp)
      },
      cancelOrder: function (basePlatform, baseCryptocurrency, termPlatform, termCryptocurrency, oldExpiration, trxId, blockNum) {
        var expiration = new Date(oldExpiration).getTime()

        var termPlatformObj = window.platforms[termPlatform]

        if (expiration <= new Date().getTime()) {
          printErrorMessage("The order has expired.")
          return
        }
        var platformCurrency = termPlatformObj.getPlatformCurrency()
        if (platformCurrency == null) {
          printErrorMessage("The platform currency doesn't exist.")
          return
        }
        var feeAmount = termPlatformObj.makeAmountAccurate(platformCurrency, termPlatformObj.getFeeAmountRequiredForOperation())
        if (window.platforms[termPlatform].exchange == null || window.platforms[termPlatform].feeRecipient == null || !window.dexConnected) {
          printErrorMessage("The server side is not connected yet.")
          return
        }

        var memo = basePlatform + ":" + baseCryptocurrency + ":" + termCryptocurrency + ":" + trxId + ":" + blockNum

        termPlatformObj.cancelOrder(feeAmount, platformCurrency, memo, trxId, blockNum)
      }
    }

    function getDex (state) {
      return new Promise((res, rej) => {
        $.ajax({
          type: "POST",
          url: window.serverUrl + "/contacts/listing",
          headers: {"Authorization": "Basic " + btoa("guest:guest")},
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          data: JSON.stringify({
            state: state,
            contactId: window.contactId
          }),
          success: function (data) {
                      if (Array.isArray(data.res)) {
                        if (data.res.length > 0) {
                          res(data.res)
                        } else {
                          res([])
                        }
                      } else {
                        rej()
                      }
                    }
        })
      })
    }

    function getCryptocurrencies (state) {
      return new Promise((res, rej) => {
        $.ajax({
          type: "POST",
          url: window.serverUrl + "/cryptocurrencies/listing",
          headers: {"Authorization": "Basic " + btoa("guest:guest")},
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          data: JSON.stringify({
            state: state,
            contactId: window.contactId
          }),
          success: function (data) {
                      if (Array.isArray(data.res)) {
                        if (data.res.length > 0) {
                          res(data.res)
                        } else {
                          res([])
                        }
                      } else {
                        rej()
                      }
                    }
        })
      })
    }

    getDex("A")
    .then(function (dex) {
      if (dex.length <= 0) {
        return
      }

      var dx = dex[0]

      if (parseInt(window.contactId) != dx.dexKey) {
        return
      }

      window.platforms["eth"].feeRecipient = dx.ethFeeRecipient
      window.platforms["eth"].exchange = dx.ethRecipient
      window.platforms["eth"].feeAmountRequired = dx.ethFeeAmountRequired
      window.platforms["eos"].feeRecipient = dx.eosFeeRecipient
      window.platforms["eos"].exchange = dx.eosRecipient
      window.platforms["eos"].feeAmountRequired = dx.eosFeeAmountRequired
      window.ethReceiptUrl = window.testNet == 1 ? dx.ethReceiptUrl1 : dx.ethReceiptUrl
      window.dexConnected = dx.connected
    })
    .catch(function () {})

    getCryptocurrencies("A")
    .then(function (cryptocurrencies) {
      for (var i in cryptocurrencies) {
        if (isNaN(i)) continue

        var cryptocurrency = cryptocurrencies[i]
        var platform = window.platforms[cryptocurrency.platform]

        if (cryptocurrency.platform == "eth") {
          cryptocurrency.actionName = JSON.parse(cryptocurrency.actionName)
        }
        platform.cryptocurrencies[cryptocurrency.cryptocurrency] = cryptocurrency
      }
    })
    .catch(function () {})

    // This strategy is based on random values.
    window.runStrategy1 = function () {
      var orderType = Math.random() > 0.5 ? "B" : "S"
      var order = null

      if (orderType == "B") {
        order = {
          basePlatform: window.basePlatform,
          baseCryptocurrency: window.baseCryptocurrency,
          termPlatform: window.termPlatform,
          termCryptocurrency: window.termCryptocurrency
        }

        platform = window.platforms[order.termPlatform]
      } else {
        order = {
          basePlatform: window.termPlatform,
          baseCryptocurrency: window.termCryptocurrency,
          termPlatform: window.basePlatform,
          termCryptocurrency: window.baseCryptocurrency
        }
      }

      var platform = window.platforms[order.termPlatform]

      order.baseAccount = order.basePlatform == "eth" ? window.ethAccount : window.eosAccount
      order.baseAmount = 0.1
      order.termAmount = Math.round(order.baseAmount * Math.random() * 100) / 100
      order.termAmount = order.termAmount < 0.01 ? 0.01 : order.termAmount
      order.feeAmount = platform.getFeeAmountRequiredForOperation() * 2
      order.orderExpiration = 30

      window.marketMaker.sendOrder(window.mailAddr, order.basePlatform, order.baseAccount, order.baseCryptocurrency, order.baseAmount,
        order.termPlatform, order.termCryptocurrency, order.termAmount, order.feeAmount, order.orderExpiration)

      setTimeout(window.runStrategy1, window.tradeInterval)
    }
    setTimeout(window.runStrategy1, window.tradeInterval)
  },
  function (context) { // Deinit()
  },
  function (context) { // OnTick()
  }
)
