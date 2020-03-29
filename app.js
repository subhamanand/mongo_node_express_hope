var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const multer = require('multer');
var fs=require('fs');
const uuid=require('uuid/v4');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
})


//adding file filter to reject file types other than .jpeg and .png
const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);

    }
    else {

        cb(null, false);

    }
}

var upload = multer({
    storage: storage,
    //file size restricted to 5MB
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));


//mongodb connection url
var url = "mongodb://localhost:27017/";



//API to fetch user details
app.get('/getUsers', function (req, res) {


    var userId = req.body.userId;
    var userName = req.body.userName;

    var query = { username: userName, id: userId };

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("master");
        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;

            if (result.length == 0) {
                res.send("User not found.");

            }
            else {
                res.send({ user_details: result });


            }



            db.close();
        });
    });



});

//API to fetch user posts details
app.get('/getUserPosts', function (req, res) {


    var userId = req.body.userId;
    var userName = req.body.userName;


    var query = { id: userId };
    var url = "mongodb://localhost:27017/user_db_" + userId;


    var userId = req.body.userId;
    var userName = req.body.userName;

    var query = { username: userName, id: userId };

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("master");
        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;

            if (result.length == 0) {
                res.send("User not found.");

            }
            else {

                var url = "mongodb://localhost:27017/user_db_" + result[0].id;

                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db(db.databaseName);
                    dbo.collection("posts").find({}).toArray(function (err, posts) {
                        if (err) throw err;
                        

                        res.send({ user_posts: posts });

                        db.close();
                      
                    });


                






            });



            db.close();
        }
    });





});
});

//API to fetch all users details : only accessible by admin
app.get('/getAllUsers', function (req, res) {


    var userId = req.body.userId;
    var password = req.body.password;


    var query = { id: userId, password: password };

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("master");
        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;

            if (result.length == 0) {
                res.send("User not found.");

            }
            else {
                if (result[0]['role'] == "admin") {

                    dbo.collection("users").find({}).toArray(function (err, allUsers) {
                        if (err) throw err;

                        if (allUsers.length == 0) {
                            res.send("Users not found.");

                        }
                        else {


                            res.send({ user_details: allUsers });


                        }



                        db.close();
                    });



                }
                else {
                    res.send("You do not have admin access");
                }


            }



            db.close();
        });
    });

});

//API to fetch all user posts details : only accessible by admin
app.get('/getAllPosts', function (req, res) {


    var userId = req.body.userId;
    var password = req.body.password;
    var query = { id: userId, password: password };

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("master");
        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;

            if (result.length == 0) {
                res.send({ error: "User not found." });

            }
            else {
                if (result[0]['role'] == "admin") {


                    dbo.collection("users").find({}).toArray(function (err, allUsers) {
                        if (err) throw err;

                        if (allUsers.length == 0) {
                            res.send("Users not found.");

                        }
                        else {

                            var postsList = [];
                            var index = 0;

                            var response = { user_post_details: [] }

                            try {

                                allUsers.forEach(user => {


                                    var url = "mongodb://localhost:27017/user_db_" + user.id;

                                    MongoClient.connect(url, function (err, db) {
                                        if (err) throw err;
                                        var dbo = db.db(db.databaseName);
                                        dbo.collection("posts").find({}).toArray(function (err, posts) {
                                            if (err) throw err;

                                            var userId = posts[0]['userId'];

                                            var key = "user_id_" + posts[0]['userId'];
                                            var obj = {};
                                            obj[key] = posts;

                                            response['user_post_details'].push(obj);

                                            db.close();

                                            if (index == allUsers.length - 1) {
                                                res.send(response);

                                            }

                                            index += 1;

                                        });


                                    });



                                });

                            } catch (error) {

                                console.log("exception ", error);

                            }




                        }

                        db.close();
                    });

                }
                else {

                    res.send({ error: "You do not have admin access" });


                }
            }

        });

    });
});

//API to add/update user image, picture uploaded goes to /upload directory and is stored in master database
app.post('/uploadPhoto', upload.single('userImage'), function (req, res, next) {


    var file=req.file;

    if(!file)
    {
      
        res.status(400).send({error:"Please upload a file"});
    }
    else
    {
        var profilePic= fs.readFileSync(req.file.path);

        var encodedPic=profilePic.toString('base64');

        var finalImg={


            contentType:req.file.mimetype,
            path:req.file.path,
            image:new Buffer.from(encodedPic,'base64')
        };




        var userId = req.body.userId;
        var userName = req.body.userName;
    
    
        MongoClient.connect(url,{ useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db("master");

            var query = { username: userName, id: userId };
            var image = { $set: {username: userName, id: userId,profilePic: finalImg } };

            dbo.collection("pictures").updateOne(query,image,{upsert:true},function (err, result) {
                if (err) throw err;
                db.close();
            });
        });




        res.status(200).send({message:"File uploaded successfully"});

    }


});




app.get('/login', function (req, res) {


    var userId = req.body.userId;
    var userName = req.body.userName;

    var query = { username: userName, id: userId};

    MongoClient.connect(url,{ useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("master");
        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;

            if (result.length == 0) {
                res.send("User not found.");

            }
            else {

                var uuid4 = uuid();
                var query = { username: userName, id: userId};

                var token = { $set: {token: uuid4} };


                dbo.collection("users").updateOne(query,token,{upsert:true},function (err, result) {
                    if (err) throw err;

                    if(result['result']['nModified']==1)
                    {

                        res.send({ message: "Login Successfull!",token:uuid4});

                    }
                    else
                    {

                        res.send({ message: "Could not login" });

                    }

                    db.close();
                });


            }

        });
    });



});



app.get('/logout', function (req, res) {


    var userId = req.body.userId;
    var userName = req.body.userName;

    var query = { username: userName, id: userId};

    MongoClient.connect(url,{ useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("master");
        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;

            if (result.length == 0) {
                res.send("User not found.");

            }
            else {

                var query = { username: userName, id: userId};



                var token = { $set: {token: null} };


                dbo.collection("users").updateOne(query,token,{upsert:true},function (err, result) {
                    if (err) throw err;

                    if(result['result']['nModified']==1)
                    {

                        res.send({ message: "Logout Successfull!"});

                    }
                    else
                    {

                        res.send({ message: "Could not logout" });

                    }

                    db.close();
                });


            }



        });
    });



});


app.listen(3000, function () {
    console.log('App listening on port 3000!');
});