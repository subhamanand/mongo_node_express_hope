const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var rp = require('request-promise');


// Connection URL
const url = 'mongodb://localhost:27017';


fetchPosts();



function fetchPosts() {
  var options =
  {
    method: 'GET',
    uri: 'https://jsonplaceholder.typicode.com/posts',
    headers:
    {
      'User-Agent': 'Request-Promise',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    json: true
  };

  rp(options)
    .then(function (posts) {

      var options =
      {
        method: 'GET',
        uri: 'https://jsonplaceholder.typicode.com/comments',
        headers:
        {
          'User-Agent': 'Request-Promise',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        json: true
      };

      rp(options)
        .then(function (comments) {

          var comment_list = [];

          posts.forEach(post => {


            comments.forEach(comment => {


              if (post['id'] == comment['postId']) {
                comment_list.push(comment);
              }

            });

            post['comments'] = comment_list;

            comment_list = [];


            MongoClient.connect(url, function (err, db) {
              if (err) throw err;

              
              var dbo = db.db("user_db_" + post['userId']);
              
              //inserting records in posts collection under the specific user database
              dbo.collection('posts').insert(post, function (err, result) {
                if (err)
                  console.log('Error', err);
                else
                  console.log('Success', result);
              });
              db.close();
            });

          });

        }

        )
        .catch(function (err) {
          console.log("Error", err)

        });

    })
    .catch(function (err) {
      console.log("Error", err)
    });

}







