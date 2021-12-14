self.postMessage('A');
self.close();
self.postMessage('B');
console.log(self.document);
Promise.resolve().then(() => self.postMessage('C'));
setTimeout(() => self.postMessage('D'), 0);
