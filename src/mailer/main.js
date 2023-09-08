let sendMail = () => {
	console.log("sendMail");

	let statusElement = document.getElementsByClassName("status")[0];

	statusElement.innerHTML = "Sending message...";

	// get element with class "grow-wrap"
	let userText = document.getElementsByClassName("grow-wrap")[0].dataset.replicatedValue;

	if (userText == undefined) {
		userText = "";
	}
	if (userText.length < 1000 && userText.length > 0) {
		let jsonData = {
			text: userText
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
		} else {
			statusElement.innerHTML = "The message cannot be empty!";
		}

		// clear status after 5 seconds
		setTimeout(() => {
			statusElement.innerHTML = "⠀";
		}, 3000);
	}
}