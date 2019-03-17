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

	deleteButton.onclick = function() {
		chrome.tabs.create({url: chrome.extension.getURL('listPage.html')});
	};
}


let blockedSiteList = [];
let idNum = 0;
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
	if(!sites || sites[0]!="chrome://extensions") {
		blockedSiteList.splice(0,0,"chrome://extensions");
		chrome.storage.sync.set({blockedSites: blockedSiteList}, function() {
		chrome.extension.getBackgroundPage().console.log("storage.blockedSiteList="+blockedSiteList);
		});
		addItem(idNum, ul, "chrome://extensions");
		idNum++;
	}
	chrome.extension.getBackgroundPage().console.log("blockedSiteList: "+blockedSiteList);
	//TODO: this is ugly (but works lol). Need to fix with asynchronous stuff?
	for(; idNum<blockedSiteList.length; idNum++) {
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



//chrome.storage.sync.clear();