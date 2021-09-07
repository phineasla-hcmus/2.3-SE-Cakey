const useMasterKey = { useMasterKey: true };

Parse.Cloud.beforeSaveFile((req) => {
    const { user, file } = req;
    console.log(`SAVING FILE ${file.name()} BY USER ${user?.id}`);
});

Parse.Cloud.afterSaveFile(async (req) => {
    const { user, file, fileSize } = req;
    const filePointer = new Parse.Object("FilePointer");
    await filePointer.save(
        {
            user: user,
            file: file,
            fileSize: fileSize,
        },
        useMasterKey
    );
});

Parse.Cloud.beforeDeleteFile((req) => {
    const { user, file } = req;
    console.log(`DELETING FILE ${file.name()} BY USER ${user?.id}`);
});

Parse.Cloud.afterDeleteFile(async (req) => {
    const { file } = req;
    const query = new Parse.Query("FilePointer");
    query.equalTo("file", file.name());
    const filePointer = await query.first(useMasterKey);
    if (filePointer) await filePointer.destroy(useMasterKey);
});

Parse.Cloud.beforeSave("FilePointer", (req) => {
    const { object } = req;
    if (!object.isNew() && object.dirty()) {
        throw "Modify 'FilePointer' is not allowed";
    }
});

Parse.Cloud.beforeDelete(
    "FilePointer",
    (req) => {
        const { object } = req;
        // throw "'FilePointer' can only be deleted after delete file";
    },
    { requireMaster: true }
);
