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
            object.setACL(acl);
        } else {
            if (original.get("img").url() !== object.get("img").url()) {
                original.get("img").destroy();
            }
        }
    },
    {
        fields: { name: { required: true } },
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
            position: { required: true },
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
