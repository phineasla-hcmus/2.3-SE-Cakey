const utils = require("./utils");

Parse.Cloud.beforeSave(
    "Blog",
    ({ user, master, original, object }) => {
        let acl = object.getACL();
        if (object.isNew()) {
            if (!master) {
                utils.authorACL(user, acl);
            }
        } else if (object.dirty("img")) {
            utils.destroyFile(original.get("img"));
        }
        if (object.dirty("premium")) {
            const opts = { useMasterKey: true };
            acl = utils.premiumACL(
                // req.user = undefined if request comes from Parse Dashboard
                new Parse.ACL(user || object.get("author")),
                object.get("premium")
            );
            // Propagate ACL to BlogContent
            // const pointer = object.get("blogContent");
            // if (pointer)
            //     pointer
            //         .fetch(opts)
            //         .then((blogContent) => {
            //             blogContent.setACL(acl);
            //             return blogContent.save(null, opts);
            //         })
            //         .catch(console.error);
            // utils.fetchIfNotNull(
            //     object.get("blogContent"),
            //     opts,
            //     (blogContent) => {
            //         blogContent.setACL(acl);
            //         return blogContent.save(null, opts);
            //     },
            //     console.error
            // );
            object
                .get("blogContent")
                ?.then((blogContent) => {
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
        ?.then((blogContent) => {
            blogContent.setACL(acl);
            return blogContent.save(null, opts);
        })
        .catch(console.error);
    utils.destroyFile(object.get("img"));
    // DEPRECATED
    // const queryIngredient = new Parse.Query("Ingredient");
    // utils.destroyAll(queryIngredient, "blog", req.object).catch(console.log);
});

Parse.Cloud.beforeSave(
    "Step",
    ({ user, original, object }) => {
        if (object.isNew()) {
            let acl = utils.authorACL(user);
            const pointer = object.get("blog");
            if (pointer) pointer.fetch();
            object.setACL(acl);
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
