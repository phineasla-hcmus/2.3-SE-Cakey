Parse.Cloud.beforeSave(
    Parse.User,
    async (req) => {
        const { object: user } = req;
        if (user.isNew()) {
            // Parse 4.5.0 (Dec 15, 2020) doesn't have async validator yet
            // https://github.com/parse-community/parse-server/issues/7140
            try {
                const config = await Parse.Config.get();
                // Set default icon for new user from Parse.Config
                const iconId = config.get("defaultProfileIcon");
                const ProfileIcon = Parse.Object.extend("ProfileIcon");
                user.set("profileIcon", ProfileIcon.createWithoutData(iconId));
            } catch (error) {
                console.error(error);
            }
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
