const { Parse, Blog, BlogContent, Step, Like, Report } = require("./helper");

describe("Unauthenicated", () => {
    it("cannot query for Blogs", async () => {
        const query = new Parse.Query(Blog);
        query.limit(1);
        await expectAsync(query.find()).toBeRejected();
    });

    it("cannot query for Like", async () => {
        const query = new Parse.Query(Like);
        query.limit(1);
        await expectAsync(query.find()).toBeRejected();
    });
});
