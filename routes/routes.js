const pulsar = require("../pulsar");
const sse = require("../sse");

app.use(function(req, res, next) {
    res.error = function(error, message) {
        error.details = message;
        res.statusMessage = error.message;
        res.status(error.status_code || 500).json({ error });
    };

    res.success = function(data) {
        if (!data) data = {};
        data.success = true;
        res.json(data);
    };

    next();
});

/** Default handler */
app.get("/", defaults.index);


app.get("/api/v1/test1", test1);
app.get("/api/v1/subscribe/:sessionId", sse.middleware());
