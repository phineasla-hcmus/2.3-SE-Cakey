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

Parse.Cloud.afterSave(Parse.User, async (request) => {
    // https://stackoverflow.com/questions/53325756/parse-server-cloud-code-aftersave-trigger
    if (!request.original) {
        const userQuery = new Parse.Query(Parse.User).get;
        const iconQuery = new Parse.Query("ProfileIcon").get;
        const config = await Parse.Config.get();
        const userId = request.object.id;
        const iconId = config.get("defaultProfileIcon");
        try {
            let [user, icon] = await Promise.all([
                userQuery(userId, { useMasterKey: true }),
                iconQuery(iconId),
            ]);
            user.set("level", 1);
            user.set("exp", 0);
            user.set("profileIcon", icon);
            user.save(null, { useMasterKey: true });
        } catch (error) {
            console.error(error);
        }
    }
});
