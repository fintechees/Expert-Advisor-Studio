registerEA(
	"plugin_for_sns",
	"An EA to integrate with Fintechee SNS(v1.0)",
	[],
	function (context) { // Init()
		if (typeof window.pluginForSns == "undefined") {
			window.pluginForSns = {
				data: [],
				defaultTopic: "FintecheeEcoCal",
				topics: [],
				createTopic: function (topic, publishToken) {
					$.ajax({
	          type: "POST",
	          url: "https://ciq1ir66d3.execute-api.eu-central-1.amazonaws.com/v1/register",
	          contentType: "application/json; charset=utf-8",
	          dataType: "json",
	          data: JSON.stringify({
							topic: topic,
							publishToken: publishToken
	          }),
	          success: function (data) {
	            if (typeof data.res == "string") {
	              $("#publishToken").val(data.res)
	            }
	          },
	          error: function (request, status, error) {
							popupErrorMessage(request.responseText)
	          }
	        })
				},
				postToTopic: function (topic, publishToken, content) {
					this.websocket.send(JSON.stringify({
						action: "post",
						topic: topic,
						publishToken: publishToken,
						content: content
					}))
				},
				subscribeToTopic: function (topic) {
					this.websocket.send(JSON.stringify({
						action: "subscribe",
						topic: topic
					}))
					this.topics[topic] = true
					if (typeof this.data[topic] == "undefined") {
						this.data[topic] = []
					}
				},
				subscribers: [],
				subscribe: function (name, callback, ctx) {
					if (typeof name == "string" && typeof callback == "function" && typeof ctx == "object") {
						this.subscribers[name] = {
							callback: callback,
							context: ctx
						}
					}
				},
				unsubscribe: function (name) {
					if (typeof name == "string") {
						delete this.subscribers[name]
					}
				},
				updateData: function (data) {
					if (data.bFull) {
						this.data[data.topic] = data.data
					} else {
						if (data.topic == this.defaultTopic) {
							var oldData = this.data[data.topic]

							for (var i in data.data) {
								var iFound = -1
								var updItem = data.data[i]
								for (var j in oldData) {
									var oldItem = oldData[j]
									if (updItem.data == oldItem.data) {
										iFound = parseInt(j)
										break
									}
								}

								if (iFound != -1) {
									this.data[data.topic][iFound] = data.data[i]
								} else {
									this.data[data.topic].push(data.data[i])
								}
							}
						} else {
							for (var i in data.data) {
								this.data[data.topic].push(data.data[i])
							}
						}
					}

					for (var i in this.subscribers) {
						this.subscribers[i].callback(this.subscribers[i].context)
					}
				},
				bConnected: false,
				websocket: null,
				reconnect: function () {
					var socket = new WebSocket("wss://5k4mgf59ce.execute-api.eu-central-1.amazonaws.com/production")

					var that = this

					socket.onopen = function (e) {
						that.bConnected = true
						console.log("[open] Connection established")
					  console.log("Sending to server")

						var subscriptionCnt = 0

						for (var i in that.topics) {
							if (that.topics[i] && that.bConnected) {
								that.subscribeToTopic(i)
								subscriptionCnt++
							}
						}

						if (subscriptionCnt == 0) {
							that.subscribeToTopic(that.defaultTopic)
						}
					}

					socket.onmessage = function (event) {
					  console.log('[message] Data received from server')
						try {
							that.updateData(JSON.parse(event.data))
						} catch (e) {}
					}

					socket.onclose = function (event) {
						that.bConnected = false
					  if (event.wasClean) {
					    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
					  } else {
					    console.log('[close] Connection down')
							setTimeout(function () {
								that.reconnect()
							}, 1000)
					  }
					}

					socket.onerror = function (error) {
					  console.log(`[error] ${error}`)
					}

					this.websocket = socket
				},
				initDashboard: function () {
					if (typeof $("#sns_dashboard").html() == "undefined") {
						var panel = '<div class="ui form modal" id="sns_dashboard">' +
							'<div class="content">' +
								'<div class="row">' +
									'<div class="ui fluid action input">' +
										'<input type="text" id="topicName" placeholder="Topic">' +
										'<input type="password" id="publishToken" placeholder="Publish Token"><div style="border-top:1px solid #ddd;border-bottom:1px solid #ddd"><i class="eye icon toggle-token" id="tokenToggle" style="color:#ddd"></i></div>' +
										'<button id="btnCreateTopic" class="ui button" style="width:100px">Create</button>' +
									'</div>' +
									'<div class="ui fluid action input" style="margin-top:5px">' +
										'<input type="text" id="topicContent" placeholder="Content">' +
										'<button id="btnPostToTopic" class="ui button" style="width:100px">Post</button>' +
									'</div>' +
									'<div class="ui fluid action input" style="margin-top:5px">' +
										'<input type="text" id="topicToSubscribeTo" placeholder="Topic to Subscribe to">' +
										'<button id="btnSubscribeToTopic" class="ui button" style="width:100px">Subscribe</button>' +
									'</div>' +
								'</div>' +
								'<div class="row">' +
								'</div>' +
							'</div>' +
							'<div class="actions">' +
								'<div class="ui button" id="btnCloseSnsDashboard">Close</div>' +
							'</div>' +
						'</div>'

						$("#reserved_zone").append(panel)

						var that = this

						$("#btnCreateTopic").on("click", function () {
							var topic = $("#topicName").val().trim()
							var publishToken = $("#publishToken").val().trim()

							if (topic != "") {
								that.createTopic(topic, publishToken)
							}
						})

						$("#btnPostToTopic").on("click", function () {
							var topic = $("#topicName").val().trim()
							var publishToken = $("#publishToken").val().trim()
							var content = $("#topicContent").val().trim()

							if (topic != "" && publishToken != "" && content != "" && that.bConnected) {
								that.postToTopic(topic, publishToken, content)
							}
						})

						$("#btnSubscribeToTopic").on("click", function () {
							var topic = $("#topicToSubscribeTo").val().trim()

							if (topic != "" && that.bConnected) {
								that.subscribeToTopic(topic)
							}
						})

						$("#btnCloseSnsDashboard").on("click", function () {
							$("#sns_dashboard").modal("hide")
						})

						$("#tokenToggle").on("click", function() {
				      var tokenInput = $("#publishToken")
				      var icon = $(this)

				      if (tokenInput.attr("type") == "password") {
				        tokenInput.attr("type", "text")
				      } else {
				        tokenInput.attr("type", "password")
				      }
				    })
					}

					$("#sns_dashboard").modal({autofocus:false}).modal("show")

					this.reconnect()
				}
			}
		}

		window.pluginForSns.initDashboard()

		if (typeof window.fintecheeBarrage != "undefined") {
			for (var i in window.fintecheeBarrage.context) {
				window.pluginForSns.subscribe("barrage-" + i, window.fintecheeBarrage.callback, window.fintecheeBarrage.context[i])
			}
		}
	},
	function (context) { // Deinit()
	},
	function (context) { // OnTick()
	}
)
