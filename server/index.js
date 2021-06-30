const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const path = require("path");
const args = process.argv || [];

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
const mountPath = process.env.PARSE_MOUNT || '/parse';

if (!databaseUri) {
    console.log("DATABASE_URI not specified, falling back to localhost.");
}

const config = {
    databaseURI: databaseUri || "mongodb://localhost:27017/dev",
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js",
    appId: process.env.APP_ID || "myAppId",
    masterKey: process.env.MASTER_KEY || "", //Add your master key here. Keep it secret!
    serverURL: process.env.SERVER_URL || "http://localhost:1337/parse", // Don't forget to change to https if needed
    liveQuery: {
        classNames: ["Posts", "Comments"], // List of classes to support for query subscriptions
    },
    appName: "Cakey",
};

const app = express();
// Serve static assets from the /public folder
app.use("/public", express.static(path.join(__dirname, "/public")));

const api = new ParseServer(config);
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get("/", function(req, res) {
    res.status(200).send("Server is live");
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get("/test", function(req, res) {
    res.sendFile(path.join(__dirname, "/public/test.html"));
});

const port = process.env.PORT || 1337;
const httpServer = require("http").createServer(app);
httpServer.listen(port, function() {
    console.log("parse-server-example running on port " + port + ".");
});
// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

module.exports = {
    app,
    config,
};
