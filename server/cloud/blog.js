const utils = require("./utils");

Parse.Cloud.beforeSave(
    "Blog",
    (req) => {
        const { original, object } = req;
        let acl = object.getACL();
        if (object.isNew() && !req.master) {
            acl = utils.authorACL(req.user);
            object.setACL(acl);
        }
        if (object.dirty("img") && !object.isNew()) {
            utils.destroyFile(original.get("img"));
        }
        if (object.dirty("premium")) {
            const opts = { useMasterKey: true };
            // TODO change to blogContent, not blog
            // Propagate ACL to Step and BlogContent
            acl = utils.premiumACL(new Parse.ACL(acl), object.get("premium"));
            // object.setACL(acl);
            object
                .get("blogContent")
                .fetch(opts)
                .then((blogContent) => {
                    blogContent.setACL(acl);
                    blogContent.save(null, opts);
                });
            const queryStep = new Parse.Query("Step");
            utils
                .setAllACL(queryStep, "blog", object, acl, opts)
                .catch(console.error);
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

Parse.Cloud.beforeDelete("Blog", (req) => {
    const { user, master, object } = req;
    opts = master
        ? { useMasterKey: true }
        : { sessionToken: user.getSessionToken() };
    // Cascade delete to Step and BlogContent
    const queryStep = new Parse.Query("Step");
    utils.destroyAll(queryStep, "blog", object, opts).catch(console.error);
    object
        .get("blogContent")
        .fetch(opts)
        .then((blogContent) => {
            blogContent.destroy(opts).catch(console.error);
        });
    utils.destroyFile(object.get("img"));
    // DEPRECATED
    // const queryIngredient = new Parse.Query("Ingredient");
    // utils.destroyAll(queryIngredient, "blog", req.object).catch(console.log);
});

Parse.Cloud.beforeSave(
    "Step",
    (req) => {
        const { original, object } = req;
        if (object.isNew()) {
            object.setACL(utils.authorACL(req.user));
        } else {
            utils.replaceFile(original.get("img"), object.get("img"));
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

// DEPRECATED
// Parse.Cloud.beforeSave(
//     "Ingredient",
//     (req) => {
//         const { original, object } = req;
//         if (object.isNew()) {
//             object.setACL(utils.authorACL(req.user));
//         }
//     },
//     {
//         fields: {
//             amount: { required: true },
//             name: { required: true },
//             blog: { required: true },
//         },
//         requireUser: true,
//     }
// );
