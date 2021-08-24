const utils = require("./utils");

Parse.Cloud.beforeSave(
    Parse.User,
    async (req) => {
        const { object: user, original } = req;
        if (!user.isNew() && user.dirty("avatar")) {
            utils.destroyFile(original.get("avatar"));
        }
    },
    {
        fields: {
            level: { default: 1, constant: true },
            exp: { default: 0, constant: true },
            premiumExpiresAt: { constant: true },
        },
    }
);
