const utils = require("./utils");

Parse.Cloud.beforeSave("ProfileIcon", (req) => {
    const { original, object } = req;
    if (object.isNew()) {
    } else {
        utils.replaceFile(original.get("icon"), object.get("icon"));
    }
});

Parse.Cloud.beforeDelete("ProfileIcon", (req) => {
    utils.destroyFile(req.object.get("icon"));
});
