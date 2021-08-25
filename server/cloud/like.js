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
        let like = await queryLike.first(opts);
        let attrs = { type: params.type };
        if (!like) {
            console.log("NEW LIKE, CREATING ONE NOW");
            like = new Like();
            attrs.user = user;
            attrs.blog = blogPointer;
        }
        // Bypass no-write CLP
        await like.save(attrs, {
            useMasterKey: true,
            // sessionToken: user.getSessionToken(),
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
    async ({ params }) => {
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", params.blogId);
        let like = await queryLike.first();
        if (like === undefined)
            throw `Like/Dislike not found for Blog ${params.blogId}`;
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
    async ({ original, object }) => {
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
        if (blog) {
            for (let i = 0; i < counters.length; i++) {
                if (counters[i] > 0) blog.increment(keys[i]);
                else if (counters[i] < 0) blog.decrement(keys[i]);
            }
            await blog.save(null, { useMasterKey: true });
        } else throw `Invalid Blog for Like ${object.id}`;

        // object
        //     .get("blog")
        //     ?.fetch({ sessionToken: user.getSessionToken() })
        //     .then((blog) => {
        //         for (let i = 0; i < counters.length; i++) {
        //             if (counters[i] > 0) blog.increment(keys[i]);
        //             else if (counters[i] < 0) blog.decrement(keys[i]);
        //         }
        //         return blog.save(null, { useMasterKey: true });
        //     })
        //     .catch(console.error);
    },
    {
        fields: {
            user: { required: true, constant: true },
            blog: { required: true, constant: true },
            type: { required: true },
        },
        // requireUser: true,
        requireMaster: true,
    }
);

/**
 * Currently can only be called through "destroyReactBlog",
 * CLP write is disabled for all user to prevent multiple likes
 * (unique index is not supported in Parse 4.5.0 (Dec 15, 2020))
 */
// Parse.Cloud.afterDelete("Like", async ({ object }) => {
//     // TODO: fetch after get
//     const blog = await object.get("blog");
//     if (blog === undefined) throw `Invalid Blog for Like ${object.id}`;
//     if (object.get("type")) blog.decrement("like");
//     else blog.decrement("dislike");
//     blog.save(null, { useMasterKey: true });
// });
