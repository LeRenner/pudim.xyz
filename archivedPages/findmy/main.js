var map = L.map('map').setView([-15, -54], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
}).addTo(map);

const ENDPOINT = 'https://home.pudim.xyz:2000/findMyBackend';
let pageState = 0;

function clickFetchHandler() {
    let hashed_key = document.getElementById("hashed_key").value;
    let private_key = document.getElementById("private_key").value;
    let cookie = document.getElementById("cookie").value;

    let query = {
        "hash": hashed_key,
        "priv": private_key,
        "cookie": cookie
    }

	let savedKeyQuery = 1;

	if (JSON.parse(localStorage.getItem("data")) == null) {
	    if (hashed_key == "" || private_key == "" || cookie == "") {
            document.getElementById("status").innerHTML = "Fields are incomplete!";
            document.getElementById("status").style.display = 'block';
			setTimeout(() => {document.getElementById("status").style.display = 'none';}, 2000);

			return;
		}
		savedKeyQuery = 0;
	}

    document.getElementById("status").innerHTML = "Fetching...";
    document.getElementById("status").style.display = 'block';

    fetchData(query).then(d=>{
        locationData = d;
        console.log(d);

        document.getElementById("status").innerHTML = "Fetch Complete! (Key saved)";
        document.getElementById("status").style.display = 'block';
        setTimeout(() => {document.getElementById("status").style.display = 'none';}, 1000);

		if (!savedKeyQuery) {
			localStorage.setItem("data", JSON.stringify(query));
			showSavedKey();
		}
    });
}

async function fetchData(query) {
    var storedQuery = JSON.parse(localStorage.getItem("data"));
    if (storedQuery != null) {
        console.log(storedQuery);
        query = storedQuery;
    }

    let fetchOptions = {
		method: 'POST',
		body: JSON.stringify(query),
        mode: 'cors'
    }

    console.log(fetchOptions)

	let data = await fetch(ENDPOINT, fetchOptions).then(res => res.json());

	return data;
}

function plotData() {
    for (index in locationData["contents"]) {
		if (index == locationData["length"] - 1) {break};
        let point = locationData["contents"][index]
        let marker = L.marker([point.lat, point.lon]).addTo(map);
        marker.bindPopup(new Date(point.timestamp).toString());
    }

	let customIcon = {
		iconUrl: "https://pudim.xyz/findmy/arrow.png",
		iconSize:[50, 50]
	}
	let leCustomIcon = L.icon(customIcon);

	let iconOptions = {
		title: "Last Seen",
		icon: leCustomIcon
	}

	let point = locationData["contents"][locationData["length"]-1]

	let marker = new L.marker([point.lat, point.lon], iconOptions).addTo(map);

    map.setView([locationData["contents"][0].lat, locationData["contents"][0].lon], 12);
    console.log('Plotting Finished!');
}

function hamburguerHandler () {
	if (document.getElementById("inputContainer").style.display == "none") {
		document.getElementById("inputContainer").style.display = "flex";
	} else {
		document.getElementById("inputContainer").style.display = "none";
	}
}

function showTextInput() {
	document.getElementById("textInput").style.display = "block";
	document.getElementById("keyLoaded").style.display = "none";
	pageState = 0;
}

function resetID () {
	localStorage.setItem("data", null);
	showTextInput();
}

function showSavedKey() {
    let message = "Key {";
    message += JSON.parse(localStorage.getItem("data"))["hash"].substring(0, 8);
    message += "} loaded!";

    document.getElementById("loadedMessage").innerHTML = message;


    document.getElementById("textInput").style.display = "none";
    document.getElementById("keyLoaded").style.display = "flex";
    pageState = 1;
}

if (JSON.parse(localStorage.getItem("data")) != null) {
	showSavedKey();
}
else {
	showTextInput();
}
