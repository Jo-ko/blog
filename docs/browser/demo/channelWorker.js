let messagePort = null;
let contextIdentifier = null;

function addContextAndSend(data, destination) {
    data.push(contextIdentifier);
    destination.postMessage(data);
}

self.onmessage = ({data, ports}) => {
    if (ports.length) {
        contextIdentifier = data;
        messagePort = ports[0];
        messagePort.onmessage = function ({data}) {
            addContextAndSend(data, self);
        }
    } else {
        addContextAndSend(data, messagePort);
    }
}
