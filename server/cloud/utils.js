function replaceFile(old, cur) {
    if (old === undefined) {
        return;
    }
    if (cur === undefined || old.url() !== cur.url()) {
        old.destroy();
    }
}

function destroyFile(obj) {
    if (obj !== undefined) {
        obj.destroy();
        // The pointer might still exist
    }
}

function destroyAll(query, key, obj, useMasterKey = true) {
    const opts = { useMasterKey: useMasterKey }
    query.equalTo(key, obj);
    return query.findAll(opts).then((res) => {
        return Parse.Object.destroyAll(res, opts);
    });
}

function authorACL(user) {
    const acl = new Parse.ACL(user);
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(false);
    return acl;
}

module.exports = { replaceFile, destroyFile, destroyAll, authorACL };
