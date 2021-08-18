const util = require("./util");

function setUserACL(req) {
    const acl = new Parse.ACL(req.user);
    acl.setPublicWriteAccess(false);
    req.object.setACL(acl);
}

Parse.Cloud.beforeSave(
    "Blog",
    (req) => {
        const { original, object } = req;
        if (object.isNew()) {
            object.setACL(util.authorACL(req.user));
        } else {
            util.replaceFile(original.get("img"), object.get("img"));
        }
    },
    {
        fields: {
            name: { required: true },
            like: { default: 0, constant: true },
            dislike: { default: 0, constant: true },
        },
        requireUser: true,
    }
);

Parse.Cloud.beforeSave(
    "Step",
    (req) => {
        const { original, object } = req;
        if (object.isNew()) {
            object.setACL(util.authorACL(req.user));
        } else {
            util.replaceFile(original.get("img"), object.get("img"));
        }
    },
    {
        fields: {
            position: {
                required: true,
                type: Number,
                options: (pos) => {
                    return pos > 0;
                },
                error:
                    "Step position must be an non-negative integer and start from 1",
            },
            text: { required: true },
            blog: { required: true },
        },
        requireUser: true,
    }
);

Parse.Cloud.beforeSave(
    "Ingredient",
    (req) => {
        const { original, object } = req;
        if (object.isNew()) {
            object.setACL(util.authorACL(req.user));
        }
    },
    {
        fields: {
            amount: { required: true },
            name: { required: true },
            blog: { required: true },
        },
        requireUser: true,
    }
);
