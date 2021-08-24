function replaceFile(old, cur) {
    if (old === undefined) {
        return;
    }
    if (cur === undefined || old.url() !== cur.url()) {
        old.destroy();
    }
}

function destroyFile(obj) {
    if (obj != null) {
        obj.destroy();
        // The pointer might still exist
    }
}

function destroyAll(query, key, obj, opts) {
    query.equalTo(key, obj);
    return query.findAll(opts).then((res) => {
        return Parse.Object.destroyAll(res, opts);
    });
}

function authorACL(user, acl = new Parse.ACL()) {
    acl.setWriteAccess(user, true);
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(false);
    return acl;
}

function premiumACL(acl = new Parse.ACL(), allowed = true) {
    acl.setPublicReadAccess(!allowed);
    acl.setRoleReadAccess("premium", allowed);
    return acl;
}

module.exports = {
    replaceFile,
    destroyFile,
    destroyAll,
    authorACL,
    premiumACL,
};
