const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var rp = require('request-promise');


// Connection URL
var url = 'mongodb://localhost:27017';
  
fetchUsers();



function fetchUsers()
{

  var options =
  {
    method: 'GET',
    uri: 'https://jsonplaceholder.typicode.com/users',
    headers:
    {
      'User-Agent': 'Request-Promise',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    json: true
  };

  rp(options)
    .then(function (data) {
      // console.log('get users data ==>', data);
      createUserDb(data);

      var url='mongodb://localhost:27017/master';
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
    
    
        var dbo = db.db("master");

        data.forEach(user => {

            if(user['id']%2 == 0)
                
              //every user with an even user id is being given an admin role 

                user['role']='admin';
            
            else
                //every user with an odd user id is being given an viewer role 

                user['role']='viewer';
            

            user['password']=user['username']+user['id'];

            user['token']=null;
            user['profilePic']=null;

            //inserting records in users collection under the master database

            dbo.collection('users').insert(user, function (err, result) {
                if (err)
                   console.log('Error',err);
                else
                   console.log('Success',result);
            }); 
          });
         db.close();
      });



    })
    .catch(function (err) {
      console.log("Error", err)
    });
}



function createUserDb(userData)
{


  userData.forEach(user => {


    var dbName="/user_db_"+user['id'];
    var final_url=url+dbName;

    MongoClient.connect(final_url, function(err, db) {
      if (err) throw err;


      var dbo = db.db(db.databaseName);
      dbo.createCollection("posts", function(err, res) {
        if (err) throw err;
        db.close();
      });
    
 
    });

  });



}





