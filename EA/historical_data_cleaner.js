registerEA(
		"historical_data_cleaner",
		"An EA only used for clearing historical data stored on your local browser(v1.0)",
		[],
		function (context) { // Init()
			var myDB = null
			var requestOpen = window.indexedDB.open("Chart-Coaster")

			requestOpen.onsuccess = function (e) {
				myDB = requestOpen.result

				var requestClear = myDB.transaction("k_o", "readwrite").objectStore("k_o").clear()

				requestClear.onsuccess = function () {
					popupMessage("The data store has been cleared successfully.")
				}

				requestClear.onerror = function (err) {
					popupErrorMessage("Failed to clear the data store.")
				}
			}

			requestOpen.onerror = function (err) {
				popupErrorMessage("Failed to open the data store.")
			}
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
		},
		function (context) { // OnTransaction()
		}
	)
