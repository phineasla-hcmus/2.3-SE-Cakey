const utils = require("./utils");

const Like = Parse.Object.extend("Like");
const Blog = Parse.Object.extend("Blog");
const TYPE = (bool) => (bool ? "like" : "dislike");

Parse.Cloud.beforeSave(
    "Like",
    async ({ user, master, original, object }) => {
        const opts = master
            ? { useMasterKey: true }
            : { sessionToken: user.getSessionToken() };
        const queryLike = new Parse.Query("Like");
        queryLike.equalTo("blog", object.get("blog"));
        queryLike.equalTo("user", user);
        const like = await queryLike.count(opts);
        // Not the prettiest but it gets the job done
        const counters = { dislike: 0, like: 0 };
        // Ensure uniqueness
        if (object.isNew()) {
            if (like) throw "Existed, please query the object and update it";
            else object.setACL(utils.authorACL(user));
        } else {
            counters[TYPE(original.get("type"))]--;
        }
        counters[TYPE(object.get("type"))]++;
        const blog = await object.get("blog")?.fetch(opts);
        if (blog) {
            for (let key in counters) {
                if (counters[key] > 0) blog.increment(key);
                else if (counters[key] < 0) blog.decrement(key);
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
        requireUser: true,
    }
);

Parse.Cloud.afterDelete(
    "Like",
    async ({ user, master, object }) => {
        const opts = master
            ? { useMasterKey: true }
            : { sessionToken: user.getSessionToken() };
        const blog = await object.get("blog")?.fetch(opts);
        if (blog) {
            const type = TYPE(object.get("type"));
            blog.decrement(type);
            blog.save(null, { useMasterKey: true });
        } else throw `Invalid Blog for Like ${object.id}`;
    },
    { requireUser: true }
);
