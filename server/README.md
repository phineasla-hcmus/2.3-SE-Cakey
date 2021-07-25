# Cakey server
Backend for Cakey app
## Local setup
Require Developer Mode (Windows 10) or Administrator Privilege to run
### Installation
 1. Install **Node.js** (if you haven't). Then install **yarn** with `npm install --global yarn`.
 2. `yarn install`: Install all dependencies from `package.json`.
 3. `yarn initdb`: Create directories to store the database.
### Usage
 To start the database and Parse server, use `yarn startdb` then `yarn start`. The database should be created inside `./.mongodb/data` and you can access the server at  port [1337](http://localhost:1337/dashboard).
