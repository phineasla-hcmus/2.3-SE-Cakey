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

// Parse.Cloud.afterSave(Parse.User, async (request) => {
//     // https://stackoverflow.com/questions/53325756/parse-server-cloud-code-aftersave-trigger
//     if (!request.original) {
//         const userQuery = new Parse.Query(Parse.User);
//         const iconQuery = new Parse.Query("ProfileIcon");
//         const config = await Parse.Config.get();
//         const userId = request.object.id;
//         const iconId = config.get("defaultProfileIcon");
//         try {
//             let [user, icon] = await Promise.all([
//                 userQuery.get(userId, { useMasterKey: true }),
//                 iconQuery.get(iconId),
//             ]);
//             user.set("level", 1);
//             user.set("exp", 0);
//             user.set("profileIcon", icon);
//             user.save(null, { useMasterKey: true });
//         } catch (error) {
//             console.error(error);
//         }
//     }
// });

Parse.Cloud.beforeSave(Parse.User, (request) => {
    if (!request.original) {
        // New user
        Parse.Config.get()
            .then((config) => {
                const ProfileIcon = Parse.Object.extend("ProfileIcon");
                const iconId = config.get("defaultProfileIcon");
                const user = request.object;
                const useMasterKey = { useMasterKey: true };
                user.set("level", 1, useMasterKey);
                user.set("exp", 0, useMasterKey);
                user.set(
                    "profileIcon",
                    ProfileIcon.createWithoutData(iconId),
                    useMasterKey
                );
            })
            .catch((err) => {
                console.error(err);
            });
    }
});
