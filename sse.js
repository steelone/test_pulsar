const { nanoid } = require("nanoid");
const { topics: pulsarTopics } = require("../pulsar");

const HEADERS = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache"
};

const subscriptions = new Map();

const subscribe = (id, handler) => {
    if (!subscriptions.has(id)) {
        subscriptions.set(id, handler);
    } else {
        console.warn("Trying to resubscribe with already created subscription");
    }
    return {
        unsubscribe: () => subscriptions.delete(id)
    };
};

const sse = ({ onClose } = {}) => {
    const middleware = (req, res) => {
        //set request timeout for 60s
        res.setTimeout(60000);

        res.writeHead(200, HEADERS);
        res.write(`id: ${nanoid()}\n`);
        res.write("retry: 1\n");
        res.write(`data: ${JSON.stringify({ success: true })}\n\n`);
        const { sessionId } = req.params;
        const subscriptionId = nanoid();
        const onMessageHandler = (type, message) => {
            const { sessionId: messageSessionId } = message;
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", type, messageSessionId, sessionId);
            if (messageSessionId === sessionId) {
                res.write(`event: ${type}\n`);
                res.write("retry: 1\n");
                res.write(
                    `data: ${JSON.stringify({
                        subscriptionId,
                        success: true,
                        data: message
                    })}\n`
                );
                res.write(`id: ${nanoid()}\n\n`);
            }
        };
        const subscription = subscribe(subscriptionId, onMessageHandler);
        req.on("close", () => {
            subscription.unsubscribe();
            onClose && onClose();
        });
    };
    return middleware;
};

const sendEvents = (type, message) => {
    for (const onMessage of subscriptions.values()) {
        onMessage(type, message);
    }
};

const test1 = message => {
    sendEvents("test1", message);
};

const test2 = message => {
    sendEvents("test2", message);
};

const test3 = message => {
    sendEvents("test3", message);
};

const test4 = message => {
    sendEvents("test4", message);
};

module.exports = {
    middleware: sse,
    test1,
    test2,
    test3,
    test4
};
