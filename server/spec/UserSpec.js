require("dotenv").config({ path: "./.env.test" });
const Parse = require("parse/node");

const Blog = Parse.Object.extend("Blog");
const BlogContent = Parse.Object.extend("BlogContent");
const Step = Parse.Object.extend("Step");
const Like = Parse.Object.extend("Like");
const Report = Parse.Object.extend("Report");

describe("Unauthenicated", () => {
    beforeAll(() => {
        Parse.initialize(process.env.APP_ID);
        Parse.serverURL = process.env.SERVER_URL;
    });

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
