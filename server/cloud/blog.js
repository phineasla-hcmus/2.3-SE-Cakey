const utils = require("./utils");

Parse.Cloud.beforeSave(
    "Blog",
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
        if (object.dirty("premium")) {
            const opts = { useMasterKey: true };
            acl = utils.premiumACL(
                // req.user is undefined if request comes from Parse Dashboard
                new Parse.ACL(user || object.get("author")),
                object.get("premium")
            );
            // Propagate ACL to BlogContent
            object
                .get("blogContent")
                ?.fetch(opts)
                .then((blogContent) => {
                    blogContent.setACL(acl);
                    return blogContent.save(null, opts);
                })
                .catch(console.error);
            // Only propagate ACL to Step if Blog is not new
            // else let Step handle ACL itself
            if (!object.isNew()) {
                const queryStep = new Parse.Query("Step");
                utils
                    .setAllACL(queryStep, "blog", object, acl, opts)
                    .catch(console.error);
            }
        }
    },
    {
        fields: {
            name: { required: true },
            blogContent: { required: true },
            like: { default: 0, constant: true },
            dislike: { default: 0, constant: true },
            report: { default: 0, constant: true },
            premium: { default: false, constant: true },
        },
        requireUser: true,
    }
);

Parse.Cloud.beforeDelete("Blog", ({ user, master, object }) => {
    const opts = master
        ? { useMasterKey: true }
        : { sessionToken: user.getSessionToken() };
    // Cascade delete to Step and BlogContent
    const queryStep = new Parse.Query("Step");
    utils.destroyAll(queryStep, "blog", object, opts).catch(console.error);
    object
        .get("blogContent")
        ?.fetch(opts)
        .then((blogContent) => {
            return blogContent.destroy(opts);
        })
        .catch(console.error);
    utils.destroyFile(object.get("img"));
});

Parse.Cloud.beforeSave(
    "Step",
    async ({ user, master, original, object }) => {
        if (object.isNew()) {
            const opts = master
                ? { useMasterKey: true }
                : { sessionToken: user.getSessionToken() };
            let acl = utils.authorACL(user);
            const blog = await object.get("blog")?.fetch(opts);
            if (blog) utils.premiumACL(acl, blog.get("premium"));
            object.setACL(acl);
        } else {
            utils.destroyFile(object.get("img"));
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

Parse.Cloud.beforeDelete("Step", (req) => {
    utils.destroyFile(req.object.get("img"));
});
