const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const ParseDashboard = require("parse-dashboard");
const path = require("path");
const args = process.argv || [];
const fs = require("fs");
require("dotenv").config();

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
const parseMountPath = process.env.PARSE_MOUNT || "/parse";
const dashboardMountPath = process.env.DASHBOARD_MOUNT || "/dashboard";

if (!databaseUri) {
    console.log("DATABASE_URI not specified, falling back to localhost.");
}

const appConfig = {
    appName: process.env.APP_NAME,
    appId: process.env.APP_ID,
    masterKey: process.env.MASTER_KEY,
    serverURL: process.env.SERVER_URL,
};

const config = {
    databaseURI: databaseUri || "mongodb://localhost:27017/dev",
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js",
    appId: process.env.APP_ID || "cakeySE",
    appName: process.env.APP_NAME || "Cakey",
    masterKey: process.env.MASTER_KEY || "", //Add your master key here. Keep it secret!
    serverURL: process.env.SERVER_URL || "http://localhost:1337/parse", // Don't forget to change to https if needed,
    publicServerURL: process.env.PUBLIC_SERVER_URL || "http://localhost:1337",
    liveQuery: {
        classNames: ["Posts", "Comments"], // List of classes to support for query subscriptions
    },
    emailAdapter: {
        module: "parse-server-mailjet-adapter",
        options: {
            apiKey: process.env.MAILJET_API_KEY,
            apiSecret: process.env.MAILJET_API_SECRET,
            // The email to send Mailjet templates bug reports to
            apiErrorEmail: process.env.MAILJET_REPORT_EMAIL,
            fromEmail: process.env.SENDER_EMAIL,
            fromName: process.env.SENDER_NAME,
            passwordResetSubject: "Reset your password",
            passwordResetTextPart:
                "Hi,\n\nYou requested to reset your password for {{var:appName}}.\n\nPlease, click here to set a new password: {{var:link}}",
            passwordResetHtmlPart:
                "Hi,<p>You requested to reset your password for <b>{{var:appName}}</b>.</p><p>Please, click here to set a new password: {{var:link}}</p>",
        },
    },
    passwordPolicy: {
        //optional setting to set a validity duration for password reset links (in seconds)
        resetTokenValidityDuration: 5 * 60,
    },
};

const dashboardConfig = {
    apps: [{ ...appConfig }],
    users: [
        {
            user: process.env.DASHBOARD_USER_ID,
            pass: process.env.DASHBOARD_USER_PASSWORD,
        },
    ],
    useEncryptedPasswords: false,
    // Enable access from Heroku server
    trustProxy: 1,
};

const api = new ParseServer(config);
const dashboard = new ParseDashboard(dashboardConfig);

const app = express();
app.use(parseMountPath, api);
app.use(dashboardMountPath, dashboard);
// Serve static assets from the /public folder
app.use("/public", express.static(path.join(__dirname, "/public")));

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
    console.log("Cakey server running on port " + port + ".");
});
// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

module.exports = {
    app,
    config,
};
