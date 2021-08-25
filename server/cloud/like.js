const utils = require("./utils");
const Like = Parse.Object.extend("Like");
const Blog = Parse.Object.extend("Blog");

/**
 * @throws Invalid Blog ID
 */
Parse.Cloud.define(
    "reactBlog",
    async ({ user, master, params }) => {
        const opts = master
            ? { useMasterKey: true }
            : { sessionToken: user.getSessionToken() };
        const blogPointer = Blog.createWithoutData(params.blogId);
        // Query first to check if Like existed
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", blogPointer);
        queryLike.equalTo("user", user);
        console.log("QUERYING LIKE");
        let like = await queryLike.first(opts);
        console.log("DONE");
        let attrs = { type: params.type };
        if (!like) {
            console.log("OH WOW, NEW LIKE");
            like = new Like();
            attrs.user = user;
            attrs.blog = blogPointer;
        }
        console.log("SAVING");
        // Bypass no-write CLP
        await like.save(attrs, { useMasterKey: true });
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
        // requireUser: true,
    }
);

/**
 * @throws Like/Dislike not existed
 */
Parse.Cloud.define(
    "destroyReactBlog",
    async ({ user, master, params }) => {
        const opts = master
            ? { useMasterKey: true }
            : { sessionToken: user.getSessionToken() };
        const blogPointer = Blog.createWithoutData(params.blogId);
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", blogPointer);
        queryLike.equalTo("user", user);
        let like = await queryLike.first(opts);
        if (like === undefined)
            throw `Like/Dislike not found for Blog ${params.blogId}`;
        await like.destroy({ useMasterKey: true });
    },
    {
        fields: {
            blogId: { required: true, type: String },
        },
        // requireUser: true,
    }
);

/**
 * Currently can only be called through "reactBlog",
 * CLP write is disabled for all user to prevent multiple likes
 * (unique index is not supported in Parse 4.5.0 (Dec 15, 2020))
 */
Parse.Cloud.beforeSave(
    "Like",
    async ({ original, object }) => {
        console.log("IN BEFORESAVE");
        const user = object.get("user");
        // Not the prettiest but it gets the job done
        const keys = ["dislike", "like"];
        const counters = [0, 0];
        if (object.isNew()) {
            object.setACL(utils.authorACL(user));
        } else {
            counters[original.get("type") ? 1 : 0]--;
        }
        counters[object.get("type") ? 1 : 0]++;
        const blog = await object
            .get("blog")
            ?.fetch({ sessionToken: user.getSessionToken() });
        console.log("DONE FETCH BLOG");
        if (blog) {
            for (let i = 0; i < counters.length; i++) {
                if (counters[i] > 0) blog.increment(keys[i]);
                else if (counters[i] < 0) blog.decrement(keys[i]);
            }
            await blog.save(null, { useMasterKey: true });
        } else throw `Invalid Blog for Like ${object.id}`;
    },
    {
        fields: {
            user: { required: true, constant: true },
            blog: { required: true, constant: true },
            type: { required: true },
        },
        requireMaster: true,
        validateMasterKey: true,
    }
);

/**
 * Currently can only be called through "destroyReactBlog",
 * CLP write is disabled for all user to prevent multiple likes
 * (unique index is not supported in Parse 4.5.0 (Dec 15, 2020))
 */
Parse.Cloud.afterDelete(
    "Like",
    async ({ object }) => {
        const user = object.get("user");
        const blog = await object
            .get("blog")
            ?.fetch({ sessionToken: user.getSessionToken() });
        if (!blog) throw `Invalid Blog for Like ${object.id}`;
        if (object.get("type")) blog.decrement("like");
        else blog.decrement("dislike");
        blog.save(null, { useMasterKey: true });
    },
    { requireMaster: true }
);
