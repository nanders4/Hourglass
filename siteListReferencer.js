var li = document.createElement('li');
var a = document.createElement('a');
var text = document.createTextNode("Blocked Sites");
a.appendChild(text);
li.appendChild(a);
a.title = "Blocked Sites";
a.href = chrome.extension.getURL('listPage.html');
var menuUl = document.getElementById('menuUl');
menuUl.appendChild(li);