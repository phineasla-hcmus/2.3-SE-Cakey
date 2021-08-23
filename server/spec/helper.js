require("dotenv").config({ path: "./.env.test" });
const Parse = require("parse/node");

beforeAll(() => {
    Parse.initialize(process.env.APP_ID);
    Parse.serverURL = process.env.SERVER_URL;
});

const Blog = Parse.Object.extend("Blog");
const BlogContent = Parse.Object.extend("BlogContent");
const Step = Parse.Object.extend("Step");
const Like = Parse.Object.extend("Like");
const Report = Parse.Object.extend("Report");

module.exports = { Parse, Blog, BlogContent, Step, Like, Report };
