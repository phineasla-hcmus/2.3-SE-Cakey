const { query } = require("express");
const utils = require("./utils");

Parse.Cloud.beforeSave(
    "Blog",
    (req) => {
        const { original, object } = req;
        if (object.isNew()) {
            object.setACL(utils.authorACL(req.user));
        } else if (object.dirty("img")) {
            // utils.replaceFile(original.get("img"), object.get("img"));
            utils.destroyFile(original.get("img"));
        }
    },
    {
        fields: {
            name: { required: true },
            like: { default: 0, constant: true },
            dislike: { default: 0, constant: true },
            report: { default: 0, constant: true },
        },
        requireUser: true,
    }
);

Parse.Cloud.beforeDelete("Blog", (req) => {
    const queryStep = new Parse.Query("Step");
    utils.destroyAll(queryStep, "blog", req.object).catch(console.log);
    const blogContent = req.object.get("blogContent");
    blogContent.destroy().catch(console.log);
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
Parse.Cloud.beforeSave(
    "Ingredient",
    (req) => {
        const { original, object } = req;
        if (object.isNew()) {
            object.setACL(utils.authorACL(req.user));
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
