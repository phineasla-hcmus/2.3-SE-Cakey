const utils = require("./utils");

Parse.Cloud.beforeSave(
    "Course",
    ({ user, master, original, object }) => {
        let acl = object.getACL();
        if (object.isNew()) {
            if (!master) {
                acl = utils.authorACL(user);
                object.setACL(acl);
            }
        } else if (object.dirty("img")) {
            utils.destroyFile(original.get("img"));
        }
    },
    {
        fields: {
            // name: { required: true },
            like: { default: 0, constant: true },
        },
    }
);

Parse.Cloud.beforeDelete("Course", ({ object }) => {
    utils.destroyFile(object.get("img"));
});
