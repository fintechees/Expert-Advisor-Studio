registerIndicator("tutorial_videos", "Embedded tutorial videos(v1.0)", function (context) {
	},[{
		name: "url",
		value: "https://www.youtube.com/embed/EUjAIfttCoA",
		required: true,
		type: PARAMETER_TYPE.STRING,
		range: null
	}],
	[{
		name: DATA_NAME.TIME,
		index: 0
	}],
	[{
		name: "sma",
		visible: false
	}],
	WHERE_TO_RENDER.CHART_WINDOW,
	function (context) { // Init()
		if (getLayoutId() != 2) {
			changeLayout(2)
		}

		window.chartIds = getLayout(2)
		for (var i in window.chartIds) {
			moveLayout(window.chartIds[i], 1)
		}

		embedHtml('<iframe src="' + getIndiParameter(context, "url") + '" style="width:100%;height:100%;border:none"></iframe>', 2)
	},
	function (context) { // Deinit()
		embedHtml("", 2)

		for (var i in window.chartIds) {
			moveLayout(window.chartIds[i], 2)
		}
	})
