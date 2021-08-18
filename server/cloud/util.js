function replaceFile(old, cur) {
    if (old === undefined) {
        return;
    }
    if (cur === undefined || old.url() !== cur.url()) {
        old.destroy();
    }
}

function authorACL(user) {
    const acl = new Parse.ACL(user);
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(false);
    return acl;
}

module.exports = { replaceFile, authorACL };
