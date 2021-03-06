var modules = require('./setup/all_modules');//require all modules that are shared by all controllers
var router = modules.express.Router();
var config = require('../config/config.js');//require all modules that are shared by all controllers
var appConfig = require('../config/appConfig'); // configure service api urls in dev/prod/beta
var mappings = appConfig();
var loginMiddleWare = require("../middleware/login.js");
var redisClient = require('../helpers/exporters/export_redisClient').redisClient;
var solrClient = require('../helpers/exporters/export_solrClient').solrClient;


var AWS = require('aws-sdk');
AWS.config.region = 'ap-southeast-1';
var AWS_ACCESS_KEY_ID = config.amazonS3key;
var AWS_SECRET_ACCESS_KEY = config.amazonS3secret;
AWS.config.update({accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY});
var s3 = new AWS.S3();

modules.winston.level = 'debug';
modules.winston.log('debug', 'Hello distributed log files!');

modules.winston.add(modules.winston.transports.File, { filename: 'somefile.log' });
modules.winston.remove(modules.winston.transports.Console);

modules.winston.log('debug', 'Hello again distributed log files!');


// WRITEPOST
// ==============================================
router.get('/writePost', function(req, res, next) {

  loginMiddleWare.functions.isLoggedInWithRender(req,res,redisClient,'blog/writePost',null);

});


router.post('/writePost', function(req, res, next) {
    console.log("in the postt",req.body);
    var data = {};
    data.postedBy = loginMiddleWare.functions.getCustomerId(req,res);
    data.categoryId = req.body.category;
    data.subCategoryId = req.body.subcategory;
    data.name = req.body.name;
    data.userAboutus = req.body.about;
    data.blogType = "normal";
    data.title = req.body.title;
    data.isVerified = false;
    data.noOfCommentsCollections = 0;
    data.paragraphs =  [
                            {
                                "imageList": req.body.imageURLs,
                                "paragraphType": "Image"
                            },    
                            {
                                "text": req.body.tinymceText,
                                "paragraphType": "Text"
                            }                 
                        ];

    console.log(JSON.stringify(data));
    modules.request({
        url:mappings['blogService.createBlog'], 
        method: 'POST',
        json: data
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            bodyRet = body; 
            console.log("pring returned bodyyy");
            res.status(200).send(response);

          }
          else{
            console.log("not signed up successfully");
            res.status(404).send(response);

          }
     });

});


// WRITEPOST1
// ==============================================
router.get('/writePost1', function(req, res, next) {

  loginMiddleWare.functions.isLoggedInWithRender(req,res,redisClient,'blog/writePost1',null);

});


router.post('/writePost1', function(req, res, next) {
    console.log("in the post1",req.body);
    var data = {};

    data.postedBy = loginMiddleWare.functions.getCustomerId(req,res);
    data.categoryId = req.body.category;
    data.subCategoryId = req.body.subcategory;
    data.name = req.body.name;
    data.userAboutus = req.body.about;
    data.blogType = "dynamic";
    data.title = req.body.title;
    data.isVerified = false;
    data.noOfCommentsCollections = 0;
    data.paragraphs =  req.body.sirTrevorText;
    console.log(JSON.stringify(data));

    modules.request({
        url:mappings['blogService.createBlog'], 
        method: 'POST',
        json: data
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            bodyRet = body; 
            console.log("pring returned bodyyy");
            res.status(200).send(response);
          }
          else{
            res.status(404).send(response);
            console.log("not signed up successfully");
          }
     });

});


// INDEX
// ==============================================
router.get('/', function(req, res, next) {

  loginMiddleWare.functions.isLoggedInWithRender(req,res,redisClient,'blog/index',null);

});


// INDEX
// ==============================================
router.get('/index', function(req, res, next) {

  loginMiddleWare.functions.isLoggedInWithRender(req,res,redisClient,'blog/index',null);
  
});


// BLOGSUMMARY
// ==============================================
router.get('/blogSummary', function(req, res, next) {
  console.log(req.query);
  if( req.query.status == 200 ){
    res.render('blog/blogSummary', { title: 'Blog successfully submitted' });
  }
  else{
    res.render('blog/blogSummary', { title: 'Blog not successfully submitted' });
  }
  
});


// WRITEPOST OPTIONS
// ==============================================
router.get('/writePostOptions', function(req, res, next) {
  res.render('blog/writePostOptions', { title: 'Cementify Blog' });
});


// GALLERYPOST
// ==============================================
router.get('/galleryPost/:id', function(req, res, next) {

  var blogId = req.params.id;
  var blogContentPromise = getBlogContentPromise(blogId);
  var blogCommentsPromise = getBlogCommentsPromise(blogId,1);

  modules.Promise.all([blogContentPromise,blogCommentsPromise]).then(function(results){
    // console.log("data from blog contetn promeis",results[0]);
    // console.log("data from blog contetn promeis",results[1]);
    var combinedData = getCombinedObjects(results[0],results[1]);
    loginMiddleWare.functions.isLoggedInWithRender(req,res,redisClient,'blog/galleryPost',combinedData);
  })
  .catch(function(error){
    //do something with the error and handle it
  });  

});


// GALLERYPOST COMMENTS SAVE
// ==============================================
router.post('/galleryPostComments', function(req, res, next) {
  console.log("in the galleryPostComments",req.body);
  var data = {};
  data.blogId = req.body.blogId;
  data.parentId =req.body.parentId;
  data.comment =  {
                      "postedBy": {
                          "userName": "fdfdf",
                          "userId": loginMiddleWare.functions.getCustomerId(req,res)
                      },
                      "commentContent": {
                          "text": req.body.commentText,
                          "paragraphType": "Text"
                      }
                  };

  modules.request({
      url:mappings['blogService.addComment'], 
      method: 'POST',
      json: data
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          bodyRet = body; 
          console.log("pring returned bodyyy");
          res.status(200).send(body);
        }
        else{
          res.status(404).send(response);
          console.log("not signed up successfully");
        }
   });
});


// GALLERYPOST COMMENT REPLY SAVE
// ==============================================
router.post('/galleryPostCommentReplys', function(req, res, next) {
  console.log("in the galleryPostCommentReplys",req.body);
  var data = {};
  data.blogId = req.body.blogId;
  data.parentId =req.body.parentId;
  data.comment =  {
                      "postedBy": {
                          "userName": "fdfdf",
                          "userId": loginMiddleWare.functions.getCustomerId(req,res)
                      },
                      "commentContent": {
                          "text": req.body.commentText,
                          "paragraphType": "Text"
                      }
                  };

  modules.request({
      url:mappings['blogService.addReplyComment'], 
      method: 'POST',
      json: data
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
                bodyRet = body; 

          console.log("pring returned bodyyy");
          res.status(200).send(body);
        }
        else{
                      res.status(404).send(response);

          console.log("not signed up successfully");
        }
   });
});


// GALLERYPOST COMMENTS SHOW MORE
// ==============================================
router.post('/galleryPostCommentsShowMore', function(req, res, next) {
  console.log("in the galleryPostComments show more",req.body);
  var blogCommentsPromise = getBlogCommentsPromise(req.body.blogId,req.body.currentBlogCollection,req.body.parentId);
  blogCommentsPromise.then(function(data){
    res.status(200).send(data);
  })
  .catch(function(error){
    //do something with the error and handle it
    res.status(404).send("No data retrieved");
  });    


});


// SEARCHTAGS
// ==============================================
router.get('/searchTags', function(req, res, next) {
  console.log("in the searchTags ",req.query);
  var randomNumberGenerator = modules.random.randomNumberGenerator;
  var randomNumber = randomNumberGenerator(30);
  // console.log(randomNumber);
  var arr = [
    {"id":"856","name":"House"},
    {"id":"1035","name":"Desperate Housewives"}
  ]
  
  res.status(200).send(JSON.stringify(arr));

});


// TYPEAHEAD
// ==============================================
router.get('/searchTypeahead', function(req, res, next) {
  console.log("in the searchTypeahead ",req.query);
  var randomNumberGenerator = modules.random.randomNumberGenerator;
  var randomNumber = randomNumberGenerator(30);
  // console.log(randomNumber);
  var arr = ["Andorra","United Arab Emirates","Afghanistan","Antigua and Barbuda","Anguilla","Albania","Armenia","Angola","Antarctica","Argentina","American Samoa","Austria","Australia","Aruba","Åland","Azerbaijan","Bosnia and Herzegovina","Barbados","Bangladesh","Belgium","Burkina Faso","Bulgaria","Bahrain","Burundi","Benin","Saint Barthélemy","Bermuda","Brunei","Bolivia","Bonaire","Brazil","Bahamas","Bhutan","Bouvet Island","Botswana","Belarus","Belize","Canada","Cocos [Keeling] Islands","Congo","Central African Republic","Republic of the Congo","Switzerland","Ivory Coast","Cook Islands","Chile","Cameroon","China","Colombia","Costa Rica","Cuba","Cape Verde","Curacao","Christmas Island","Cyprus","Czechia","Germany","Djibouti","Denmark","Dominica","Dominican Republic","Algeria","Ecuador","Estonia","Egypt","Western Sahara","Eritrea","Spain","Ethiopia","Finland","Fiji","Falkland Islands","Micronesia","Faroe Islands","France","Gabon","United Kingdom","Grenada","Georgia","French Guiana","Guernsey","Ghana","Gibraltar","Greenland","Gambia","Guinea","Guadeloupe","Equatorial Guinea","Greece","South Georgia and the South Sandwich Islands","Guatemala","Guam","Guinea-Bissau","Guyana","Hong Kong","Heard Island and McDonald Islands","Honduras","Croatia","Haiti","Hungary","Indonesia","Ireland","Israel","Isle of Man","India","British Indian Ocean Territory","Iraq","Iran","Iceland","Italy","Jersey","Jamaica","Jordan","Japan","Kenya","Kyrgyzstan","Cambodia","Kiribati","Comoros","Saint Kitts and Nevis","North Korea","South Korea","Kuwait","Cayman Islands","Kazakhstan","Laos","Lebanon","Saint Lucia","Liechtenstein","Sri Lanka","Liberia","Lesotho","Lithuania","Luxembourg","Latvia","Libya","Morocco","Monaco","Moldova","Montenegro","Saint Martin","Madagascar","Marshall Islands","Macedonia","Mali","Myanmar [Burma]","Mongolia","Macao","Northern Mariana Islands","Martinique","Mauritania","Montserrat","Malta","Mauritius","Maldives","Malawi","Mexico","Malaysia","Mozambique","Namibia","New Caledonia","Niger","Norfolk Island","Nigeria","Nicaragua","Netherlands","Norway","Nepal","Nauru","Niue","New Zealand","Oman","Panama","Peru","French Polynesia","Papua New Guinea","Philippines","Pakistan","Poland","Saint Pierre and Miquelon","Pitcairn Islands","Puerto Rico","Palestine","Portugal","Palau","Paraguay","Qatar","Réunion","Romania","Serbia","Russia","Rwanda","Saudi Arabia","Solomon Islands","Seychelles","Sudan","Sweden","Singapore","Saint Helena","Slovenia","Svalbard and Jan Mayen","Slovakia","Sierra Leone","San Marino","Senegal","Somalia","Suriname","South Sudan","São Tomé and Príncipe","El Salvador","Sint Maarten","Syria","Swaziland","Turks and Caicos Islands","Chad","French Southern Territories","Togo","Thailand","Tajikistan","Tokelau","East Timor","Turkmenistan","Tunisia","Tonga","Turkey","Trinidad and Tobago","Tuvalu","Taiwan","Tanzania","Ukraine","Uganda","U.S. Minor Outlying Islands","United States","Uruguay","Uzbekistan","Vatican City","Saint Vincent and the Grenadines","Venezuela","British Virgin Islands","U.S. Virgin Islands","Vietnam","Vanuatu","Wallis and Futuna","Samoa","Kosovo","Yemen","Mayotte","South Africa","Zambia","Zimbabwe"];

  
  res.status(200).send(JSON.stringify(arr));

});


// INDEX1
// ==============================================
router.get('/index1', function(req, res, next) {
  res.render('blog/index1', { title: 'Cementify Blog' });
});


// INDEX2
// ==============================================
router.get('/index2', function(req, res, next) {
  res.render('blog/index2', { title: 'Cementify Blog' });
});


// ARTICLE
// ==============================================
router.get('/article', function(req, res, next) {
  res.render('blog/article', { title: 'Cementify Blog' });
});


// ARTICLE1
// ==============================================
router.get('/article1', function(req, res, next) {
  res.render('blog/article1', { title: 'Cementify Blog' });
});


// ARTICLE2
// ==============================================
router.get('/article2', function(req, res, next) {
  res.render('blog/article2', { title: 'Cementify Blog' });
});


// ARTICLE11
// ==============================================
router.get('/article11', function(req, res, next) {
  res.render('blog/article11', { title: 'Cementify Blog' });
});


// ARTICLE22
// ==============================================
router.get('/article22', function(req, res, next) {
  res.render('blog/article22', { title: 'Cementify Blog' });
});


// CATEGORY
// ==============================================
router.get('/category', function(req, res, next) {
  res.render('blog/category', { title: 'Cementify Blog' });
});


// EDITPOST
// ==============================================
router.get('/editPost', function(req, res, next) {
    res.render('blog/editPost');
});

router.post('/editPost', function(req, res, next) {
    console.log("in the post",req.body);

    res.render('blog/blogSummary', { title: 'Cementify Blog' });


});


// EDITPOST1
// ==============================================
router.get('/editPost1', function(req, res, next) {
    res.render('blog/editPost1');
});

router.post('/editPost1', function(req, res, next) {
    console.log("in the post",req.body);

    res.render('blog/blogSummary', { title: 'Cementify Blog' });


});


// PING
// ==============================================
// router.get('/ping', function(req, res, next) {
//     solrClient.add({ id : 13 },function(err,obj){
//        if(err){
//           console.log(err);
//        }else{
//           console.log('Solr response:', obj);
//        }
//     });

//     var docs = [];
//     for(var i = 0; i <= 10 ; i++){
//        var doc = {
//            id : 12345 + i,
//            title_t : "Title "+ i,
//            description_t : "Text"+ i + "Alice"
//        }
//        docs.push(doc);
//     }

//     // Add documents
//     solrClient.add(docs,function(err,obj){
//       if(err){
//         console.log(err);
//       }else{
//         console.log(obj);
//       }
//     });


//     solrClient.commit(function(err,res){
//        if(err) console.log(err);
//        if(res) console.log(res);
//     });


//     var query = 'q=*:*';
//     solrClient.get('select', query, function(err, obj){
//       if(err){
//         console.log(err);
//       }else{
//         console.log(obj.response.docs);
//       }
//     });
//     res.send(200, 'All good');

// });


// PING
// ============================================== 
router.get('/ping', function(req, res){
  var bodyRet;
  // modules.request(
  //       {url:mappings['blogService.ping']}, 
  //       function (error, response, body) {
  //         if (!error && response.statusCode == 200) {
  //                 bodyRet = body;

  //           console.log("pring returned body1",body);
  //           res.send(body);
  //         }
  //         else{

  //         }
  //    });

   // var data = {};
   //  data.postedBy = 12;
   //  data.categoryId = 11;
   //  data.isVerified = false;
   //  data.noOfCommentsCollections = 0;
   //  data.paragraphs =  [
   //                          {
   //                              "text": "hello mister",
   //                              "paragraphType": "Text"
   //                          }
   //                      ];

   // modules.request({
   //      url:mappings['blogService.createBlog'], 
   //      method: 'POST',
   //      json: data
   //    },
   //      function (error, response, body) {
   //        if (!error && response.statusCode == 200) {
   //                bodyRet = body; 

   //          console.log("pring returned bodyyy");
   //          res.status(200).send(body);
   //        }
   //        else{
   //                      res.status(404).send(response);

   //          console.log("not signed up successfully");
   //        }
   //   });

// {
//     "blogId": "56f96717ebd6a00df7af2021",
//     "comment": {
//         "postedBy": {
//             "userName": "raj",
//             "userId": 1234
//         },
//         "commentContent": {
//             "text": "hellocomment",
//             "paragraphType": "Text"
//         }
//     }
// }

    // var data = {};
    // data.blogId = "5701ebf996311f1bb22035ca";
    // data.parentId = "5701ebf996311f1bb22035ca";
    // data.comment =  {
    //                     "postedBy": {
    //                         "userName": "raj",
    //                         "userId": 1234
    //                     },
    //                     "commentContent": {
    //                         "text": "hellocomment",
    //                         "paragraphType": "Text"
    //                     }
    //                 };

    // modules.request({
    //     url:mappings['blogService.addComment'], 
    //     method: 'POST',
    //     json: data
    //   },
    //     function (error, response, body) {
    //       if (!error && response.statusCode == 200) {
    //               bodyRet = body; 

    //         console.log("pring returned bodyyy");
    //         res.status(200).send(body);
    //       }
    //       else{
    //                     res.status(404).send(response);

    //         console.log("not signed up successfully");
    //       }
    //  });


    // var data = {};
    // data.blogId = "5706648396311f367ef75546";

    // modules.request({
    //     url:mappings['blogService.readBlogs'], 
    //     method: 'POST',
    //     json: data
    //   },
    //     function (error, response, body) {
    //       if (!error && response.statusCode == 200) {
    //         console.log("pring returned bodyyy");
    //         res.status(200).send(body);
    //       }
    //       else{
    //         res.status(404).send(response);
    //         console.log("not signed up successfully");
    //       }
    //  });

    var data = {};
    data.blogId = "5706648396311f367ef75546";
    data.collectionNo = 1;
    modules.request({
        url:mappings['blogService.readComments'], 
        method: 'POST',
        json: data
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log("pring returned bodyyy");
            var comments = body["comments"];
            var obj = comments;
            var arrayComments = new Array();
            for (var i=0; i<obj.length; i++){
              var dataCompressedComments = obj[i]["commentContent"];
              dataCompressedComments.postedByUserName = obj[i]["postedBy"]["userName"];
              dataCompressedComments.postedByUserId = obj[i]["postedBy"]["userId"];
              dataCompressedComments.createdDate = obj[i]["createdDate"];
              dataCompressedComments.modifiedDate = obj[i]["modifiedDate"];
              dataCompressedComments.noOfReplyCommentsCollections = obj[i]["noOfReplyCommentsCollections"];
              dataCompressedComments.softDelete = obj[i]["softDelete"];

              arrayComments.push(dataCompressedComments);
            }
            res.status(200).send(JSON.stringify(body));
          }
          else{
            res.status(404).send(response);
            console.log("not signed up successfully");
          }
     });    
});


// GET BLOG COMMENTS PROMISE
// ==============================================
var getBlogCommentsPromise = function(blogId,collectionNo,parentId){
  var data = {};
  data.blogId = blogId;
  data.collectionNo = collectionNo;
  if(parentId == null ){
    data.parentId = blogId;
  }
  else {
    data.parentId = parentId;
  }

  return new modules.Promise(function(resolve, reject){

    modules.request({
        url:mappings['blogService.readComments'], 
        method: 'POST',
        json: data
      },
        function (error, response, body) {
          var arrayComments = new Array();
          if (response.statusCode == 200) {
            console.log("pring returned bodyyy");
            var comments = body["comments"];
            var obj = comments;
            for (var i=0; i<obj.length; i++){
              var dataCompressedComments = obj[i]["commentContent"];
              dataCompressedComments.postedByUserName = obj[i]["postedBy"]["userName"];
              dataCompressedComments.postedByUserId = obj[i]["postedBy"]["userId"];
              dataCompressedComments.createdDate = obj[i]["createdDate"];
              dataCompressedComments.modifiedDate = obj[i]["modifiedDate"];
              dataCompressedComments.noOfReplyCommentsCollections = obj[i]["noOfReplyCommentsCollections"];
              dataCompressedComments.softDelete = obj[i]["softDelete"];
              dataCompressedComments.commentId = obj[i]["commentId"];

              arrayComments.push(dataCompressedComments);
            }
            resolve(JSON.stringify(arrayComments));
          }
          else if( !error ){
            resolve(JSON.stringify(arrayComments));
          }
          else{
            reject(error);
            console.log("could not get the blog comments");
          }
     });     
  });
}


// GET BLOG CONTENT PROMISE
// ==============================================
var getBlogContentPromise = function(blogId){
  var data = {};
  data.blogId = blogId;
  return new modules.Promise(function(resolve, reject){

    modules.request({
        url:mappings['blogService.readBlogs'], 
        method: 'POST',
        json: data
      },
        function (error, response, body) {
          if (response.statusCode == 200) {
            console.log("pring returned bodyyy");
            resolve(JSON.stringify(body));
          }
          else if( !error ){
            resolve(JSON.stringify(body));
          }          
          else{
            reject(error);
            console.log("could not get blog contents from the promise");
          }
     });     
  });
}


// COMBINE OBJECTS
// ==============================================
var getCombinedObjects = function(obj1,obj2){
  var obj3 = {};
  obj3.content = obj1;
  obj3.comments = obj2;
  return obj3;
}

var justPrintSomething = function(){
    console.log("print something");
}

module.exports.router = router;
