const utils = require("./utils");
const Like = Parse.Object.extend("Like");
const Blog = Parse.Object.extend("Blog");

/**
 * @throws Invalid Blog ID
 */
Parse.Cloud.define(
    "reactBlog",
    async (req) => {
        const { user, params } = req;
        const opts = master
            ? { useMasterKey: true }
            : { sessionToken: user.getSessionToken() };
        // Query first to check if Like existed
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", params.blogId);
        queryLike.equalTo("user", user);
        let like = await queryLike.first(opts);
        let attrs = { type: params.type };
        if (!like) {
            like = new Like();
            attrs.user = user;
            attrs.blog = Blog.createWithoutData(params.blogId);
        }
        // Bypass no-write CLP
        await like.save(attrs, {
            useMasterKey: true,
            sessionToken: user.getSessionToken(),
        });
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
 * Currently can only be called through "reactBlog",
 * CLP write is disabled for all user to prevent multiple likes
 * (unique index is not supported in Parse 4.5.0 (Dec 15, 2020))
 */
Parse.Cloud.beforeSave(
    "Like",
    (req) => {
        const { original, object, user } = req;
        const keys = ["dislike", "like"];
        const counters = [0, 0];
        if (object.isNew()) {
            object.setACL(utils.authorACL(user));
        } else {
            counters[original.get("type")]--;
        }
        counters[object.get("type")]++;
        // const blog = await object.get("blog");
        // if (!blog) throw `Invalid Blog for Like ${object.id}`;
        // for (let i = 0; i < counters.length; i++) {
        //     if (counters[i] > 0) blog.increment(keys[i]);
        //     else if (counters[i] < 0) blog.decrement(keys[i]);
        // }
        // blog.save(null, { useMasterKey: true });
        object
            .get("blog")
            .fetch({ sessionToken: user.getSessionToken() })
            .then((blog) => {
                for (let i = 0; i < counters.length; i++) {
                    if (counters[i] > 0) blog.increment(keys[i]);
                    else if (counters[i] < 0) blog.decrement(keys[i]);
                }
                return blog.save(null, { useMasterKey: true });
            })
            .catch(console.error);
    },
    {
        fields: {
            user: { required: true, constant: true },
            blog: { required: true, constant: true },
            type: { required: true },
        },
        requireUser: true,
        requireMaster: true,
    }
);

/**
 * Currently can only be called through "destroyReactBlog",
 * CLP write is disabled for all user to prevent multiple likes
 * (unique index is not supported in Parse 4.5.0 (Dec 15, 2020))
 */
Parse.Cloud.afterDelete("Like", async (req) => {
    const { object } = req;
    const blog = await object.get("blog");
    if (blog === undefined) throw `Invalid Blog for Like ${object.id}`;
    if (object.get("type")) blog.decrement("like");
    else blog.decrement("dislike");
    blog.save(null, { useMasterKey: true });
});
