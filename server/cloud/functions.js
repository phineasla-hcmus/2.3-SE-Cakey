Parse.Cloud.define("hello", (req) => {
    req.log.info(req);
    return "Hi";
});

Parse.Cloud.define("asyncFunction", async (req) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    req.log.info(req);
    return "Hi async";
});

Parse.Cloud.beforeSave("Test", () => {
    throw new Parse.Error(9001, "Saving test objects is not available.");
});

Parse.Cloud.afterSave(Parse.User, (request) => {
    // https://stackoverflow.com/questions/53325756/parse-server-cloud-code-aftersave-trigger
    if (!request.original) {
        const userId = request.object.id;
        const query = new Parse.Query(Parse.User);
        query.get(userId, { useMasterKey: true }).then(function(user) {
            user.set("level", 0);
            user.set("exp", 0);
            user.save();
        });
    }
});
