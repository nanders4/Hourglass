chrome.tabs.onUpdated.addListener(function() {
	let blockedSiteList = [];
	chrome.storage.sync.get("blockedSites", function(data) {
		let sites = data.blockedSites;
		if(Array.isArray(sites)) {
			for(let i=0; i<sites.length; i++) {
				blockedSiteList.push(sites[i]);
			}
		}
		chrome.extension.getBackgroundPage().console.log("blockedSiteList"+ blockedSiteList);
		let currentUrl = "";
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
			currentUrl = tabs[0].url;
			chrome.extension.getBackgroundPage().console.log("url: "+currentUrl);
			for(let i=0; i<blockedSiteList.length; i++) {
				var string1 = "http://"+blockedSiteList[i];
				var string2 = blockedSiteList[i]+"$";
				var regex1 = new RegExp(string1);
				var regex2 = new RegExp(string2);
				if(currentUrl.match(regex1) || currentUrl.match(regex2)) {
					chrome.tabs.update({url: chrome.extension.getURL('blockedPage.html')});
				}
				chrome.extension.getBackgroundPage().console.log("reg1 "+currentUrl.match(regex1));
				chrome.extension.getBackgroundPage().console.log("reg2 "+currentUrl.match(regex2));
			}
		});
	});
});

