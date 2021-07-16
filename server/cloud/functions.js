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

Parse.Cloud.beforeSave(Parse.User, async (request) => {
    const { object: user } = request;
    if (user.isNew()) {
        try {
            const config = await Parse.Config.get();
            const ProfileIcon = Parse.Object.extend("ProfileIcon");
            const iconId = config.get("defaultProfileIcon");
            user.set("level", 1);
            user.set("exp", 0);
            user.set("profileIcon", ProfileIcon.createWithoutData(iconId));
        } catch (error) {
            console.error(error);
        }
    }
});
