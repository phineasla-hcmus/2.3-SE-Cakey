const utils = require("./utils");

Parse.Cloud.beforeSave("Level", (req) => {
    const { original, object } = req;
    if (!object.isNew() && object.dirty("icon")) {
        utils.destroyFile(original.get("icon"));
    }
});

Parse.Cloud.beforeDelete("Level", (req) => {
    utils.destroyFile(req.object.get("icon"));
});
