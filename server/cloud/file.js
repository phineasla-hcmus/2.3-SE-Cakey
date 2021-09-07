const useMasterKey = { useMasterKey: true };
const disableUpdate = {
    constant: true,
    error: "Modify 'FilePointer' is not allowed",
};

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

Parse.Cloud.beforeSave("FilePointer", undefined, {
    fields: {
        user: disableUpdate,
        file: disableUpdate,
        fileSize: disableUpdate,
    },
    validateMasterKey: true,
});

Parse.Cloud.beforeDelete("FilePointer", (req) => {
    const { object } = req;
    throw "'FilePointer' can only be deleted after delete file";
});
