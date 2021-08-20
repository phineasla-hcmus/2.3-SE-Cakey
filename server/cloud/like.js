const utils = require("./utils");
const Like = Parse.Object.extend("Like");

/**
 * @throws Invalid Blog ID
 */
Parse.Cloud.define(
    "reactBlog",
    async (req) => {
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", req.params.blogId);
        let like = await queryLike.first();
        let attrs = { type: req.params.type };
        if (like === undefined) {
            // const queryBlog = new Parse.Query("Blog");
            // const blog = await queryBlog.get(req.params.blogId);
            // if (blog === undefined) throw `Invalid Blog ${req.params.blogId}`;
            like = new Like();
            attrs.user = req.user;
            attrs.blog = Like.createWithoutData(req.params.blogId);
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
 * @throws Like/Dislike not existed
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

/**
 * Currently can only be called through "reactBlog", CLP write is disabled for all user
 */
Parse.Cloud.beforeSave(
    "Like",
    async (req) => {
        const { original, object } = req;
        const keys = ["dislike", "like"];
        const counters = [0, 0];
        if (object.isNew()) {
            object.setACL(utils.authorACL(req.user));
        } else {
            counter[original.get("type")]--;
        }
        counter[object.get("type")]++;
        const blog = await object.get("blog");
        if (blog === undefined) throw `Invalid Blog for Like ${object.id}`;
        for (let i = 0; i < counter.length; i++) {
            if (counter[i] > 0) blog.increment(keys[i]);
            else if (counters[i] < 0) blog.decrement(keys[i]);
        }
        blog.save(null, { useMasterKey: true });
    },
    {
        fields: {
            blog: { required: true, constant: true },
            type: { required: true },
        },
    }
);

/**
 * Currently can only be called through "destroyReactBlog", CLP write is disabled for all user
 */
Parse.Cloud.afterDelete("Like", async (req) => {
    const { object } = req;
    const blog = await object.get("blog");
    if (blog === undefined) throw `Invalid Blog for Like ${object.id}`;
    if (object.get("type")) blog.decrement("like");
    else blog.decrement("dislike");
    blog.save(null, { useMasterKey: true });
});
