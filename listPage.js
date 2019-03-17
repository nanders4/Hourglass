continueTimerStop = false;

function continueButtonTimer(continueTime, continueButton) {
	setTimeout(function() {
		chrome.extension.getBackgroundPage().console.log("continueButtonTime:" +continueTime);
		continueButton.innerHTML = "continue? "+continueTime;
		if(continueTime>0 && !continueTimerStop) {
			continueButtonTimer(continueTime-1, continueButton);
		}
		else if (continueTime==0) {
			var footer = document.getElementById("footer");
			while(footer.firstChild) {
				footer.removeChild(footer.firstChild);
			}
		}
	}, 1000);
}

function progressTimer(progressTime, text, num) {
	setTimeout(function() {
		chrome.extension.getBackgroundPage().console.log("progressTime:" +progressTime);
		text.innerHTML = progressTime+" "+num+"/3:";
		if(progressTime>0) {
			progressTimer(progressTime-1, text, num);
		}
	}, 1000);
}

//delete button onclick function preserving scope
function deleteButtonOnClick(idNum, ul) {
	return function() {
		var footer = document.getElementById("footer");
		var item = document.createElement('div');
		item.className = "gridContainer";
		var charButton = document.createElement('button');
		charButton.innerHTML = "Charity";
		charButton.id = "charButton";
		charButton.backgroundColor = "#b74d4d";
		//charButton.onclick = charButtonOnClick();
		var timeButton = document.createElement('button');
		timeButton.innerHTML = "Time";
		timeButton.id = "timeButton";
		timeButton.backgroundColor = "#b74d4d";
		item.appendChild(charButton);
		item.appendChild(timeButton);
		footer.appendChild(item);

		timeButton.onclick = timeButtonOnClick(idNum, ul);
	};
}

//TODO: make deletion happen on a seperate page
function timeButtonOnClick(idNum, ul) {
	return function() {
		var progressTime = 6;
		var footer = document.getElementById("footer");
		while(footer.firstChild) {
			footer.removeChild(footer.firstChild);
		}
		var text = document.createElement('div');
		text.innerHTML = progressTime+" "+1+"/3:";
		progressTimer(progressTime-1, text, 1);
		footer.appendChild(text);
		setTimeout(function() {
			var continueTime = 6;
			var continueButton = document.createElement('button');
			continueButton.id = "continueButton";
			continueButton.innerHTML = "continue? "+ continueTime;
			//change continue timer value
			continueButtonTimer(continueTime-1, continueButton);
			continueButton.onclick = continueButtonOnClick(2, idNum, ul);
			footer.appendChild(continueButton);

			//destroy button after 1 minute
			setTimeout(function() {
				var child = document.getElementById("continueButton");
				if(child) {
					footer.removeChild(child);
				}
			}, 6000);
		}, 6000);
	};
}

function continueButtonOnClick(count, idNum, ul) {
	return function() {
		continueTimerStop = true;
		var progressTime = 6;
		var footer = document.getElementById("footer");
		while(footer.firstChild) {
			footer.removeChild(footer.firstChild);
		}
		if(count==4) {
			deleteItem(idNum, ul);
		}
		else {
			var text = document.createElement('div');
			text.innerHTML = progressTime+" "+count+"/3:";
			progressTimer(progressTime-1, text, count);
			footer.appendChild(text);
			setTimeout(function() {
				continueTimerStop = false;
				var continueTime = 6;
				var continueButton = document.createElement('button');
				continueButton.id = "continueButton";
				continueButton.innerHTML = "continue? "+ continueTime;
				//change continue timer value
				continueButtonTimer(continueTime-1, continueButton);
				continueButton.onclick = continueButtonOnClick(count+1, idNum, ul);
				footer.appendChild(continueButton);

				//destroy button after 1 minute
				setTimeout(function() {
					var child = document.getElementById("continueButton");
					if(child) {
						footer.removeChild(child);
					}
				}, 6000);
			}, 6000);
		}
	};
}

//delete the item in ul of blocked sites with idNum
function deleteItem(idNum, ul) {
	var id = "siteItem"+idNum;
	var index = -1;
	var listItems = ul.childNodes;
	chrome.extension.getBackgroundPage().console.log("listItems: "+listItems);
	for(var i=1; i<listItems.length; i++) {
		chrome.extension.getBackgroundPage().console.log("id: "+id);
		chrome.extension.getBackgroundPage().console.log("listItems[i].id: "+listItems[i].id);
		if(listItems[i].id==id) {
			index = i-1;
		}
	}
	if(index>=0) {
		blockedSiteList.splice(index, 1);
		chrome.extension.getBackgroundPage().console.log("deleted "+id);
		chrome.extension.getBackgroundPage().console.log("blockedSiteList: "+blockedSiteList);
		chrome.storage.sync.clear();
		chrome.storage.sync.set({blockedSites: blockedSiteList});
		var item = document.getElementById(id);
		item.style.visibility = "hidden";
	}
	else {
		chrome.extension.getBackgroundPage().console.log("could not delete. error!");
	}
}

//add blocked site item to DOM
function addItem(idNum, ul, url) {
	var item = document.createElement('div');
	item.className = "gridContainer";
	var text = document.createElement('div');
	text.innerHTML = url;
	item.appendChild(text);
	var deleteButton = document.createElement('button');
	deleteButton.style.width = "20px";
	deleteButton.style.height = "20px";
	deleteButton.style.backgroundColor = "red";

	item.id = "siteItem"+idNum;
	item.appendChild(deleteButton);
	ul.appendChild(item);
	chrome.extension.getBackgroundPage().console.log("added new item to DOM list: "+item.id);

	deleteButton.onclick = deleteButtonOnClick(idNum, ul);
}


let blockedSiteList = [];
let idNum=0;
chrome.extension.getBackgroundPage().console.log("opened popup.js");

//create list elements in DOM from chrome storage
chrome.storage.sync.get("blockedSites", function(data) {
	chrome.extension.getBackgroundPage().console.log("data: "+data.blockedSites);
	let sites = data.blockedSites;
	if(Array.isArray(sites)) {
		for(let i=0; i<sites.length; i++) {
			blockedSiteList.push(sites[i]);
			chrome.extension.getBackgroundPage().console.log("pushed url to list");
		}
	}
	var ul = document.getElementById('blockedSiteUl');
	chrome.extension.getBackgroundPage().console.log("blockedSiteList: "+blockedSiteList);
	//TODO: this is ugly (but works lol). Need to fix with asynchronous stuff?
	for(idNum=0; idNum<blockedSiteList.length; idNum++) {
		addItem(idNum, ul, sites[idNum]);
	}
});

//add functionality to site add button
let ul = document.getElementById('blockedSiteUl');
let addButton = document.getElementById('addButton');
let input = document.getElementById('input');
//add a blocked site element to DOM and push new site list to storage
addButton.onclick = function() {
	let newUrl = input.value;
	blockedSiteList.push(newUrl);
	chrome.storage.sync.set({blockedSites: blockedSiteList}, function() {
		chrome.extension.getBackgroundPage().console.log("storage.blockedSiteList="+blockedSiteList);
	});
	addItem(idNum, ul, newUrl);
	idNum++;
}