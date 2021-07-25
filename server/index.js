const fs = require("fs");
const path = require("path");
const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const ParseDashboard = require("parse-dashboard");
const args = process.argv || [];

require("dotenv").config();

const parseMountPath = process.env.PARSE_MOUNT || "/parse";
const dashboardMountPath = process.env.DASHBOARD_MOUNT || "/dashboard";
const cloudMountPath =
    process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js";

const generalConfig = {
    appName: process.env.APP_NAME,
    serverURL: process.env.SERVER_URL,
    publicServerURL: process.env.PUBLIC_SERVER_URL,
};

const securityConfig = {
    appId: process.env.APP_ID,
    masterKey: process.env.MASTER_KEY,
};

const serverConfig = {
    ...generalConfig,
    ...securityConfig,
    databaseURI: process.env.DATABASE_URI || process.env.MONGODB_URI,
    cloud: cloudMountPath,
    liveQuery: {
        classNames: ["Blogs", "Comments", "Likes"], // List of classes to support for query subscriptions
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
            passwordResetSubject: "Reset your password for {{var:appName}}",
            passwordResetHtmlPart: fs.readFileSync(
                __dirname + "/email/password_reset.html",
                "utf-8"
            ),
        },
    },
    passwordPolicy: {
        // Enforce a password of at least 6 characters
        validatorPattern: /^.{6,}$/,
        // Set a validity duration for password reset links (in seconds)
        resetTokenValidityDuration: 5 * 60,
    },
};

const dashboardConfig = {
    apps: [{ ...generalConfig, ...securityConfig }],
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

// Disable email adapter if API keys not found
const emailOptions = serverConfig.emailAdapter.options;
for (const key in emailOptions) {
    if (!emailOptions[key]) {
        console.warn("Email adapter is disabled due to missing properties");
        delete serverConfig["emailAdapter"];
        break;
    }
}

const api = new ParseServer(serverConfig);
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
    config: serverConfig,
};
