# mongo_node_express_hope
An application made using node js, express js and mongodb as database. Scripts to fetch json from public API, stores in mongodb. REST APIs to fetch records from mongodb.

Steps to set up and run the application:

1. Run the command: " git clone https://github.com/subhamanand/mongo_node_express_hope.git " in a directory.
2. Make sure Node js and MongoDb is installed on the system. You can follow the given links if it's not installed :

   Node js : https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04
   
   MongoDb : https://docs.mongodb.com/guides/server/install/

   Once Node js and MongoDb are setup we can proceed with the next steps.
   
3. Open the project directory in terminal :  mongo_node_express_hope
4. Now you need to execute the 2 scripts to fetch data from public APIs, and store in local mongodb database. 
   (Note : all the collections and databases will be formed by the scripts).
   
4. Run the command : node user_data_fetch.js 
   This script will do the following tasks:
   i. Fetch user data.
   ii. Create master database in mongoDb
   iii. Create users collection under the master database.
   iv. Store all the user records in the users collection as documents.
   v. Create a separate database for each user distinguished user user id with posts collection under each database.

5. Run the command : node post_data_fetch.js
   This script will do the following tasks:
   i. Fetch posts data.
   ii. Fetch comments data
   iii. Map comments to respective posts.
   iv. Store the posts data under posts collection of respective user database created in step 4.

6. Run the command : node app.js
   This command will run the Node js server and make all the REST APIs accessible. It will run on http://localhost:3000/
   In the browser you can go to http://localhost:3000/ to verify. The application is running it it shows Hello World!
   
7. Import the postman collection :test_requests_hope_research.postman_collection.json under the directory : /mongo_node_express_hope/postman_requests/ in postman


8. From the postman collection you will get sample requests to all REST APIs.







API DETAILS:

/getUsers : To fetch user details of one user , Type: GET

/getUserPosts : To fetch posts of one user,  Type : GET

/getAllUsers : To fetch all user details (only accessible by admins), Type:GET

/getAllPosts : To fetch all posts by all users (only accessible by admins), Type:GET

/uploadPhoto : To upload user image. User can add/update user image by this API. Image is stored in /upload directory and in mongoDb database 'master' under collection 'pictures',  Type: POST

/login : For user to login. A token is generated and stored in user specific document, only if details provided by user in Request is valid. Type: GET

/logout : For user to logout. The token stored in database while login is deleted after successfull logout, Type : GET


