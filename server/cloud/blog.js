function cleanupFile({ original, object }) {
    if (
        !object.isNew() &&
        object.get("img").url() !== original.get("img").url()
    ) {
        original.get("img").destroy();
        return true;
    }
    return false;
}

Parse.Cloud.beforeSave(
    "Blog",
    (req) => {
        // const { original, object } = req;
        // if (!object.isNew()) {
        //     if (original.get("img").url() !== object.get("img").url()) {
        //         original.get("img").destroy();
        //     }
        // }
        cleanupFile(req);
    },
    {
        fields: { name: { required: true } },
    }
);

Parse.Cloud.beforeSave(
    "Step",
    (req) => {
        cleanupFile(req);
    },
    {
        fields: {
            position: { required: true },
            text: { required: true },
            blog: { required: true },
        },
    }
);

Parse.Cloud.beforeSave("Ingredient", (req) => {}, {
    fields: {
        amount: { required: true },
        name: { required: true },
        blog: { required: true },
    },
});
