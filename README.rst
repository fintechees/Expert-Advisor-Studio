Expert Advisor Studio
=====================

A repository for trading robots(EA) which can be running on Web browser

Features
--------

#. Javascript SDK, Compatible with C/C++/MQL
#. WEB-based
#. You can import any data(historical/streaming) as long as you have
   data source.
#. Market Maker Bot(You can send transactions to blockchains' SWAP smart
   contracts)
#. Integration with crypto wallets(Scatter & Metamask)
#. Integration with Artificial Intelligence(AI)
#. Integration with DEX and Clearing House
#. Custom Indicators(You can create compound indicators -- make an
   indicator calculated based on another indicator)
#. You can analyze Bitcoin or Ether's options by using our plugins.
#. FIX API individual version(Your browser -> local Java Package -> FIX
   API straightforward)
#. White label enabled
#. MFA - Multiple Factor Authentication
#. Dashboard for broker's manager
#. APP(Android, already listed on our website and published on Google
   Play)
#. Source codes generator
#. Spread betting
#. Price aggregator(automated order router)
#. Multiple accounts management on the frontend(useful for trading
   arbitrage)
#. Multiple charts management(responsive UI layout)
#. Investor mode(guest mode, read-only)

...... Many features, you can explore them on your own

Usage
-----

| I received a lot of questions that asked how to use the Javasacript
files in this repository.
| Actually, the usage is different from Nodejs, so, you DON'T need to
use "node xxx.js" to run it.
| And, it's much EASIER to run them. Because they are browser-based, so,
what you need to do is just open the WEB trader of Fintechee and
copy-paste the source codes into the CONSOLE panel of the WEB trader and
then click the RUN button. Then everything is DONE.
| Each file in this repo is indepenedent to each other. You can use them
respectively.

Live Stream
-----------

We started a live stream on Youtube

| Please access our video stream page to see how we trade arbitrage in
real-time(FIX API quotes vs Oanda).
| Recommendation:
| https://twitter.com/Fintechee1
| |Expert Advisor Studio Trading Arbitrage(FIX API vs Oanda) via
Fintechee|

| |Expert Advisor Studio Trading Arbitrage(FIX API vs Oanda) via
Fintechee|
| Alternative:
| https://www.fintechee.com/videostreaming/

| Please access our demo to run the EAs:
| https://www.fintechee.com

| You don't know how to use these EAs?
| Please check out our Youtube Channel, there are
tutorials(\ https://www.youtube.com/channel/UCjBs_l6rUxhtZlfRhDuVGSg)
| You can find the source codes for the tutorials here:
https://github.com/fintechee/tutorials

Please check our `Github
wiki <https://github.com/fintechee/Expert-Advisor-Studio/wiki>`__ to
know more details about APIs.

Please check this
tutorial(\ https://www.fintechee.com/expert-advisor-cpp-compiler) to
learn how to use our Nodejs
package(\ https://github.com/fintechee/Expert-Advisor-CPP-Compiler) to
compile C/C++/MQL-based programs.

|Expert Advisor Studio Fintechee Screenshot|

|Expert Advisor Studio Fintechee's Architecture|

|Expert Advisor Studio Fintechee's Ecosystem|

|Expert Advisor Studio Expert Advisor C/C++/MQL Compiler|

|Expert Advisor Studio Fintechee custom indicator|

| |Expert Advisor Studio Fintechee APP Screenshot1|
| |Expert Advisor Studio Fintechee APP Screenshot2|
| |Expert Advisor Studio Fintechee APP Screenshot3|
| |Expert Advisor Studio Fintechee APP Screenshot4|
| |Expert Advisor Studio Fintechee APP Screenshot0|
| |Expert Advisor Studio Fintechee APP Screenshot5|
| |Expert Advisor Studio Fintechee APP Screenshot6|
| |Expert Advisor Studio Fintechee APP Screenshot7|
| |Expert Advisor Studio Fintechee APP Screenshot8|

Release Notes
~~~~~~~~~~~~~

2020.7.7 three APIs were modified and added parameters.

#. sendOrder
#. modifyOrder
#. closeTrade

#. 2.22 Added one API to improve the performance.
#. getCurrentTick

#. 3.3 two APIs were modified.

#. registerIndicator

We Added three parameters to this API. They are all callback functions:
OnInit, OnDeinit, and OnRender. We added them to extend the functions in
Fintechee and make our indicators much easier to manage and monitor.
When you add an indicator to the chart, the OnInit callback function
would be called. When you remove an indicator from the chart, the
OnDeinit function would be called. After the main callback function is
called, the OnRender function would be triggered. The OnRender function
is very useful to add your own renderer to the platform. Our platform's
renderer is based on D3js. If you are not familiar with it, you can use
other alternative JS chart systems, such as ChartJS.

And, these callback functions are new features. Other platforms have no
these parameters. Fortunately, this API is compatible with the older
versions, so, you don't need to modify your old indicators.

#. registerEA

| We added one more parameter to this API, it's a callback function to
receive a message when the transaction was triggered.
| For example, if you send an order to the backend, you don't need to
block your process. Everything on our platform is ASYNC. So, you can
continue to do analysis and just make this callback function available
to wait for the notification from the backend. If the order is filled
and a new trade is opened, then you will get notified.

And, this callback function is a new feature. Other platforms have no
this parameter. Fortunately, this API is compatible with the older
versions, so, you don't need to modify your old EAs.

.. code:: javascript

    var BROKER_NAME = {
        DEMO: "CC Demo"
    }

    var TIME_FRAME = {
        M1: "M1",
        M5: "M5",
        M15: "M15",
        M30: "M30",
        H1: "H1",
        H4: "H4",
        D: "D",
        W: "W",
        M: "M"
    }

    var ORDER_TYPE = {
        OP_BUY: "BUY",
        OP_SELL: "SELL",
        OP_BUYLIMIT: "BUY LIMIT",
        OP_SELLLIMIT: "SELL LIMIT",
        OP_BUYSTOP: "BUY STOP",
        OP_SELLSTOP: "SELL STOP"
    }

    var WHERE_TO_RENDER = {
        CHART_WINDOW: "CHART_WINDOW",
        SEPARATE_WINDOW: "SEPARATE_WINDOW"
    }

    var DATA_NAME = {
        TIME: "Time",
        OPEN: "Open",
        HIGH: "High",
        LOW: "Low",
        CLOSE: "Close",
        HL2: "HL2",
        HLC3: "HLC3",
        HLCC4: "HLCC4"
    }

    var RENDER_TYPE = {
        HISTOGRAM: "Histogram",
        LINE: "Line",
        ROUND: "Round",
        DASHARRAY: "Dasharray"
    }

    var PARAMETER_TYPE = {
        INTEGER: "Integer",
        NUMBER: "Number",
        BOOLEAN: "Boolean",
        STRING: "String"
    }

Common Function
~~~~~~~~~~~~~~~

.. code:: javascript

    function sma (dataInput, dataOutput, calculatedLength, period) {
        var i = calculatedLength

        if (calculatedLength > 0) {
            i--
        } else {
            for (var j = 0; j < period - 1; j++) {
                dataOutput[j] = 0
            }

            i = period - 1
        }

        var sum = 0

        for (var j = i - period + 1; j < i; j++) {
            sum += dataInput[j]
        }

        for (var j = i; j < dataInput.length; j++) {
            sum += dataInput[j]
            dataOutput[j] = sum / period
            sum -= dataInput[j - period + 1]
        }
    }

    function ema (dataInput, dataOutput, calculatedLength, period) {
        var i = calculatedLength
        var smthFctr = 2.0 / (period + 1)

        if (i == 0) {
            dataOutput[0] = dataInput[0]
            i++
        } else if (i == 1) {
        } else {
            i--
        }

        while (i < dataInput.length) {
            dataOutput[i] = dataInput[i] * smthFctr + dataOutput[i - 1] * (1 - smthFctr)
            i++
        }
    }

    function smma (dataInput, dataOutput, calculatedLength, period) {
        var i = calculatedLength
        var sum = 0

        if (i > 0) {
            i--
        } else {
            i = period - 1

            for (var j = 1; j < period; j++) {
                dataOutput[i - j] = 0
                sum += dataInput[i - j]
            }

            sum += dataInput[i]
            dataOutput[i] = sum / period
            i++
        }

        while (i < dataInput.length) {
            sum = dataOutput[i - 1] * period - dataOutput[i - 1] + dataInput[i]
            dataOutput[i] = sum / period
            i++
        }
    }

    function lwma (dataInput, dataOutput, calculatedLength, period) {
        var i = calculatedLength

        if (i > 0) {
            i--
        } else {
            for (var j = 0; j < period - 1; j++) {
                dataOutput[j] = 0
            }

            i = period - 1
        }

        var sum = 0
        var diffsum = 0
        var weight = 0

        for (var j = 1; j < period; j++) {
            sum += dataInput[i - j] * (period - j)
            diffsum += dataInput[i - j]
            weight += j
        }
        weight += period

        while (i < dataInput.length) {
            sum += dataInput[i] * period
            dataOutput[i] = sum / weight
            diffsum += dataInput[i]
            sum -= diffsum
            diffsum -= dataInput[i - period + 1]
            i++
        }
    }

Please check our site for details.
`Fintechee <https://www.fintechee.com/sdk-trading/>`__

MIT License

.. |Expert Advisor Studio Trading Arbitrage(FIX API vs Oanda) via Fintechee| image:: https://github.com/fintechee/Expert-Advisor-Studio/blob/master/arbitrageyoutube.png
.. |Expert Advisor Studio Trading Arbitrage(FIX API vs Oanda) via Fintechee| image:: https://github.com/fintechee/Expert-Advisor-Studio/blob/master/arbitragechance.png
.. |Expert Advisor Studio Fintechee Screenshot| image:: https://www.fintechee.com/vpimages/services/newscreenshot1.png
.. |Expert Advisor Studio Fintechee's Architecture| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/architecture.png
.. |Expert Advisor Studio Fintechee's Ecosystem| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/ecosystem.png
.. |Expert Advisor Studio Expert Advisor C/C++/MQL Compiler| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/cppcompiler.png
.. |Expert Advisor Studio Fintechee custom indicator| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/analyzestructure.png
.. |Expert Advisor Studio Fintechee APP Screenshot1| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile1.png
.. |Expert Advisor Studio Fintechee APP Screenshot2| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile2.png
.. |Expert Advisor Studio Fintechee APP Screenshot3| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile3.png
.. |Expert Advisor Studio Fintechee APP Screenshot4| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile4.png
.. |Expert Advisor Studio Fintechee APP Screenshot0| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile0.png
.. |Expert Advisor Studio Fintechee APP Screenshot5| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile5.png
.. |Expert Advisor Studio Fintechee APP Screenshot6| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile6.png
.. |Expert Advisor Studio Fintechee APP Screenshot7| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile7.png
.. |Expert Advisor Studio Fintechee APP Screenshot8| image:: https://raw.githubusercontent.com/fintechee/Expert-Advisor-Studio/master/mobile8.png
