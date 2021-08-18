const util = require("./util");

Parse.Cloud.beforeSave("ProfileIcon", (req) => {
    const { original, object } = req;
    if (object.isNew()) {
    } else {
        util.replaceFile(original.get("icon"), object.get("icon"));
    }
});

Parse.Cloud.beforeDelete("ProfileIcon", (req) => {
    req.object.get("icon").destroy();
});
