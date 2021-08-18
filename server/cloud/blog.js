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
            const acl = new Parse.ACL(req.user);
            acl.setPublicWriteAccess(false);
            acl.setPublicReadAccess(true);
            object.setACL(acl);
        } else {
            if (original.get("img").url() !== object.get("img").url()) {
                original.get("img").destroy();
            }
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
            const acl = new Parse.ACL(req.user);
            acl.setPublicWriteAccess(false);
            object.setACL(acl);
        } else {
            if (original.get("img").url() !== object.get("img").url()) {
                original.get("img").destroy();
            }
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
            const acl = new Parse.ACL(req.user);
            acl.setPublicWriteAccess(false);
            object.setACL(acl);
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
