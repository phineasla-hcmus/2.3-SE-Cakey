const utils = require("./utils");
const Like = Parse.Object.extend("Like");

/**
@throws Invalid Blog ID
*/
Parse.Cloud.define(
    "reactBlog",
    async (req) => {
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", req.params.blogId);
        let like = await queryLike.first();
        let attrs = { type: req.params.type };
        if (like === undefined) {
            const queryBlog = new Parse.Query("Blog");
            const blog = await queryBlog.get(req.params.blogId);
            if (blog === undefined) throw `Invalid Blog ${req.params.blogId}`;
            like = new Like();
            like.setACL(utils.authorACL(req.user));
            attrs.user = req.user;
            attrs.blog = blog;
        }
        await like.save(attrs);
    },
    {
        fields: {
            blogId: {
                required: true,
                type: String,
            },
            type: {
                required: true,
                type: Boolean,
            },
        },
        requireUser: true,
    }
);

/**
@throws Like/Dislike not existed
*/
Parse.Cloud.define(
    "destroyReactBlog",
    async (req) => {
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", req.params.blogId);
        let like = await queryLike.first();
        if (like === undefined)
            throw `Like/Dislike not found for Blog ${req.params.blogId}`;
        await like.destroy();
    },
    {
        fields: {
            blogId: { required: true, type: String },
        },
        requireUser: true,
    }
);

Parse.Cloud.beforeSave(
    "Like",
    async (req) => {
        const { original, object } = req;
        const counter = [0, 0];
        if (object.isNew()) {
        }
    },
    {
        fields: {
            blog: { required: true, constant: true },
            type: { required: true },
        },
    }
);
