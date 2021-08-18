const utils = require("./utils");

Parse.Cloud.beforeSave("Level", (req) => {
    const { original, object } = req;
    if (object.isNew()) {
    } else {
        utils.replaceFile(original.get("icon"), object.get("icon"));
    }
});

Parse.Cloud.beforeDelete("Level", (req) => {
    utils.destroyFile(req.object.get("icon"));
});
