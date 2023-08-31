function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

const handleButton = (light) => {
	if (light == 11) {
		httpGetAsync("https://lights.pudim.xyz/1/on", () => {});
	} else if (light == 10) {
		httpGetAsync("https://lights.pudim.xyz/1/off", () => {});
	} else if (light == 21) {
        httpGetAsync("https://lights.pudim.xyz/2/on", () => {});
    } else if (light == 20) {
        httpGetAsync("https://lights.pudim.xyz/2/off", () => {});
    }
}
