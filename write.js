const express = require("express")
const path = require("path")
const multer = require("multer")
const aws     = require('aws-sdk');
const app = express()
const bodyParser = require('body-parser');

require('dotenv').config();
const fs = require('fs');

app.use(bodyParser.urlencoded({extended:true}));
	
// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
	
// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it
	
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Uploads is the Upload_folder_name
		cb(null, "uploads")
	},
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
})
	
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;
	
var upload = multer({ storage: storage }).single("fname");	

// UI specific variables / consts
const bucket   = "";
// s3-bucket name
var s3_bucket = "";
// s3 accesskey
var s3_accesskey = "";
// s3 region
var region       = "";

//s3 secretkey
var s3_secretkey = "";


//  Step 1 : Login page takes the input - right now its dummy!
app.get('/', function(req,res){
    res.render('login');
   });

// Step 2 . Post to secure Login.
// Post to log on to s3
app.post('/login', function(req,res){
    // call back to check that our credentials are correct
    s3_bucket    = req.body.bucket;
    const s3_accesskey = req.body.accesskey;
    const s3_secretkey = req.body.secret;
    const region       = req.body.region;

    aws.config.update({
        accessKeyId: s3_accesskey,
        secretAccessKey: s3_secretkey,
        region: region
    })
    // instantiate s3 with the above aws config  
    var s3 = new aws.S3();

    s3.headBucket({
    Bucket: s3_bucket
    }, function(err, data) {
    if (err) console.log('There is some error in the credentials',err, err.stack); // an error occurred
    else     console.log('You are logged in',data);// successful response
    res.redirect('/load');
    })

})



   // Step 3: Route to Load page...

app.get('/load', function(req,res){
    res.render('load',
{
  bucket: s3_bucket,
  access_key_id:s3_accesskey,
  secret_access_key:s3_secretkey
  });
  // res.render('home')
})


app.post('/load', async (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
        } else {
            var FileName = req.file.filename;
            res.status(200).send(FileName);
                
            // Now load to aws 

var aws = require('aws-sdk');
var fs =  require('fs');
// Bucket names must be unique across all S3 users

// var access_key_id = 'AKIAQT4HBU7563FD4N6E';
// var secret_access_key = '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';

aws.config.update({
    accessKeyId: "AKIAQT4HBU7563FD4N6E",
    secretAccessKey: "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",
    region: 'eu-central-1'
});

var s3 = new aws.S3();

// Bucket names must be unique across all S3 users

var s3_bucket = 'hcp-8da2bd2a-eb08-4998-baf0-3ceae565e40d';

var prefix = req.body.prefix;
var myBucket = s3_bucket + "/" + prefix ;

// var myKey = path.resolve(FileName);
// console.log(myKey);
const name = 'uploads'
var myKey = path.join('.', name, FileName) //'/users/joe/notes.txt'

fs.readFile(myKey, function (err, data) {
    if (err) { throw err; }
  
    params = {Bucket: myBucket, Key: myKey, Body: data };
  
       s3.putObject(params, function(err, data) {
  
           if (err) {
  
               console.log(err)
  
           } else {
  
               console.log(`Successfully uploaded data to ${myBucket}/${myKey}`);
                }
  
        });
  
  });


        }
    })
});
	

// Take any port number of your choice which
// is not taken by any other process
app.listen(8080,function(error) {
	if(error) throw error
		console.log("Server created Successfully on PORT 8080")
})
