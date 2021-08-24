const utils = require("./utils");

Parse.Cloud.beforeSave(
    "Blog",
    (req) => {
        const { original, object } = req;
        let acl;
        if (object.isNew()) {
            acl = utils.authorACL(req.user);
            acl = utils.premiumACL(acl, object.get("premium"));
        } else if (object.dirty("img")) {
            // utils.replaceFile(original.get("img"), object.get("img"));
            utils.destroyFile(original.get("img"));
        }
        if (object.dirty("premium")) {
            console.log("DIRTY PREMIUM");
            acl = utils.premiumACL(acl, object.get("premium"));
        } else console.log("NEW OBJ => NO DIRTY");
        if (acl) object.setACL(acl);
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
    const queryStep = new Parse.Query("Step");
    utils.destroyAll(queryStep, "blog", req.object).catch(console.log);
    const blogContent = req.object.get("blogContent");
    if (blogContent != null) blogContent.destroy().catch(console.log);
    // DEPRECATED
    // const queryIngredient = new Parse.Query("Ingredient");
    // utils.destroyAll(queryIngredient, "blog", req.object).catch(console.log);
    utils.destroyFile(req.object.get("img"));
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
