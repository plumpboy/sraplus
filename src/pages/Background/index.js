console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.tabs.query({
  active: true,
  currentWindow: true
}, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {
    method: "getLocalStorage",
    key: "accessToken"
  }, function (response) {
    console.log('background', response);
  });
});