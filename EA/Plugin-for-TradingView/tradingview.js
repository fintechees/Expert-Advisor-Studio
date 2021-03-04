registerEA(
  "tradingview_widget",
  "A plugin to integrate with the widget of TradingView(v1.0)",
  [],
  function (context) { // Init()
    // Disclaimer: we are not affiliated with the widget providers or the API providers.
    if (getLayoutId() != 3) {
			changeLayout(3)
		}

    window.chartIds = getLayout(2)
		for (var i in window.chartIds) {
			moveLayout(window.chartIds[i], 1)
		}
    embedHtml('<div class="tradingview-widget-container"><div id="tradingview_8ac01"></div><div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/NASDAQ-AAPL/" rel="noopener" target="_blank"></div>', 2)

    var script = document.createElement("script")
    document.body.appendChild(script)
    script.onload = function () {
      new TradingView.widget(
        {
          "width": "100%",
          "height": "105%",
          "symbol": "NASDAQ:AAPL",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_8ac01"
        }
      )
    }
    script.onerror = function () {
      alert("Failed to load required libs. Please re-run this EA again.")
    }
    script.async = true
    script.src = "https://s3.tradingview.com/tv.js"
  },
  function (context) { // Deinit()
    embedHtml("", 2)
    for (var i in window.chartIds) {
			moveLayout(window.chartIds[i], 2)
		}
  },
  function (context) { // OnTick()
  }
)
