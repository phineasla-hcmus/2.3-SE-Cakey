Parse.Cloud.beforeSaveFile((req) => {
    const { file, user } = req;
    console.log(`SAVING FILE ${file.name()} BY USER ${user}`);
});

Parse.Cloud.afterSaveFile(async (req) => {
    const { file, fileSize, user } = req;
    const opts = master
        ? { useMasterKey: true }
        : { sessionToken: user.getSessionToken() };
    const fileMetadata = new Parse.Object("FileMetadata");
    await fileMetadata.save(
        {
            fileName: file.name(),
            fileSize: fileSize,
            user: user,
        },
        opts
    );
});

Parse.Cloud.beforeSaveFile((req) => {
    const { file, user } = req;
    console.log(`DELETING FILE ${file.name()} BY USER ${user}`);
});

Parse.Cloud.afterDeleteFile(async (req) => {
    const { file } = req;
    const opts = { useMasterKey: true };
    const query = new Parse.Query("FileMetadata");
    query.equalTo("fileName", file.name());
    const fileMetadata = await query.first(opts);
    await fileMetadata.destroy(opts);
});