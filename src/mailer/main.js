let sendMail = () => {
	console.log("sendMail");

	let statusElement = document.getElementsByClassName("status")[0];

	statusElement.innerHTML = "Sending message...";

	// get element with class "grow-wrap"
	let userText = document.getElementsByClassName("grow-wrap")[0].dataset.replicatedValue;
	let userIdentity = document.getElementById("name").value;

	if (userText == undefined) {
		userText = "";
	}
	if (userText.length < 1000 && userText.length > 0 && userIdentity.length < 30) {
		let jsonData = {
			text: userText,
			name: userIdentity
		};

		let encodedJson = JSON.stringify(jsonData);

		// send userText on json over POST to /sendMail
		fetch("https://mail.pudim.xyz/api/sendMail/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: encodedJson
		})
			.then((response) => {
				console.log(response);

				statusElement.innerHTML = "Message sent!";

				// store username in localStorage
				localStorage.setItem("username", userIdentity);

				// clear status after 5 seconds
				setTimeout(() => {
					statusElement.innerHTML = "⠀";
				}, 3000);

				// clear userText
				document.getElementsByClassName("grow-wrap")[0].dataset.replicatedValue = "";

				// clear textarea
				document.getElementsByClassName("grow-wrap")[0].children[0].value = "";

			});
	} else {
		if (userText.length > 1000) {
			statusElement.innerHTML = "The message cannot be longer than 1000 characters!";
		} else if (userIdentity.length >= 30) {
			statusElement.innerHTML = "The name cannot be longer than 30 characters!";
		} else {
			statusElement.innerHTML = "The message cannot be empty!";
		}

		// clear status after 5 seconds
		setTimeout(() => {
			statusElement.innerHTML = "⠀";
		}, 3000);
	}
}

// check if username is stored on localStorage
if (localStorage.getItem("username") != null) {
	// set username
	document.getElementById("name").value = localStorage.getItem("username");
}


let expertModeEnabled = false;

let expertMode = () => {
	console.log("expertMode");

	let expertModeElement = document.getElementById("expertMode");

	if (expertModeElement.checked) {
		expertModeEnabled = true;

		// store decision on localStorage
		localStorage.setItem("expertMode", "true");
	} else {
		expertModeEnabled = false;

		// store decision on localStorage
		localStorage.setItem("expertMode", "false");
	}
}

// check if expertMode is enabled
if (localStorage.getItem("expertMode") == "true") {
	expertModeEnabled = true;

	// check checkbox
	document.getElementById("expertMode").checked = true;
} else {
	expertModeEnabled = false;

	// uncheck checkbox
	document.getElementById("expertMode").checked = false;
}


document.getElementsByClassName("grow-wrap")[0].children[0].addEventListener("keydown", (event) => {
	if (expertModeEnabled) {
		if (event.key == "Enter" && !event.ctrlKey) {
			event.preventDefault();
			sendMail();
		}
		if (event.key == "Enter" && event.ctrlKey) {
			document.getElementsByClassName("grow-wrap")[0].children[0].value += "\n";
		}
	}
	else {
		if (event.key == "Enter" && event.ctrlKey) {
			event.preventDefault();
			sendMail();
		}
	}
});