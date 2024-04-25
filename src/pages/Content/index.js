import {
  printLine
} from './modules/print';
let Storage = require("../../utils/Storage.js");

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let localStorage = new Storage();
// content.js
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.method === "getLocalStorage") {
//     console.log('content', request, localStorage.getItem(request.key));
//     sendResponse({
//       data: localStorage.getItem(request.key)
//     });
//   }
// });