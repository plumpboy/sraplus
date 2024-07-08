import {
  printLine
} from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");
// content.js
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.method === "getLocalStorage") {
//     console.log('content', request, localStorage.getItem(request.key));
//     sendResponse({
//       data: localStorage.getItem(request.key)
//     });
//   }
// });