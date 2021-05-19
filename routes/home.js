var express = require('express');
const session = require('express-session');
var nodemailer = require('nodemailer');
const { registerEvent } = require('../functions/event-functions');
var router = express.Router();
var db = require('../config/connection')
var collection = require('../config/collection')
var eventFunctions = require('../functions/event-functions')
const userFunctions = require('../functions/user-functions')
const judgeFunctions = require('../functions/judge-functions');
const { response } = require('express');

const key = "@fdjjjJHDMNXZHHhVXGA899XBHHN^878(&?wshdhshGhghBVDD"

const verifyLogin = (req, res, next) => {
  if (req.session.user.loggedIn) {
    next()
  } else {
    res.send({ success: logout })
  }
}


router.get('/logout', function (req, res) {
  req.session.user = null
  res.send({ success: true })
})

router.get('/', function (req, res, next) {
  res.render('home')
})
router.get('/app-get-item-list', function (req, res) {
  eventFunctions.getAllItems().then((data) => {
    console.log(data)

    res.send(data)
  })
})

router.get('/app-get-winner', function (req, res) {
  eventFunctions.getAllwinners().then((data) => {
    console.log(data)

    res.send(data)
  })
})

router.get('/app-get-gallery-photos', function (req, res) {
  eventFunctions.getAllimages().then((response) => {
    console.log(response);

    res.send(response)
  })
})
router.get('/app-event-register/:id', function (req, res) {
  console.log(req.params.id)
  var userid = req.params.id
  eventFunctions.getAllItems().then((response) => {
    console.log(response);
    res.render('event-registration', { response, userid })
  })

})

router.get('/app-get-youtube-links', function (req, res) {
  eventFunctions.getAllLinks().then((response) => {
    console.log(response);

    res.send(response)
  })
})

/* GET home page. */
// router.get('/', function (req, res, next) {

//   let user = req.session.user
//   console.log('my    ')
//   console.log(user)

//   eventFunctions.getAllEvents().then((eventDetails) => {
//     eventFunctions.getRegisteredDetails().then((registerDetails) => {

//       eventFunctions.getScoreCSE().then((details) => {
//         console.log(details)
//         console.log("marks")

//         var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
//         console.log(length / 12)
//         var totalCSE = 0
//         for (var i = 0; i < length / 12; i++) {
//           if(details[i].marks != null){
//           try {
//             var scoreObj = details[i].marks[0].marks
//             totalCSE = Number(totalCSE) + Number(scoreObj)
//           } catch (error) {

//           }
//           }

//         }
//         console.log(totalCSE)
//         var percentCSE = totalCSE * totalCSE / 100
//         console.log(percentCSE)
//         // res.render('home', { title: 'Express', user, eventDetails, registerDetails,totalCSE });
//         eventFunctions.getScoreECE().then((details) => {
//           console.log(details)
//           var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
//           console.log(length / 12)
//           var totalECE = 0
//           for (var i = 0; i < length / 12; i++) {

//             var scoreObj = details[i].marks[0].marks
//             totalECE = Number(totalECE) + Number(scoreObj)
//           }
//           console.log(totalECE)
//           var percentECE = totalECE * totalECE / 100
//           console.log(percentECE)

//           eventFunctions.getScoreMECH().then((details)=>{
//             console.log(details)
//             var length=details.reduce((a,obj)=>a+Object.keys(obj).length,0)
//             console.log(length/12)
//             var totalMECH=0

//             for(var i=0;i<length/12;i++){

//               var scoreObj=details[i].marks[0].marks
//               totalMECH=Number(totalMECH)+Number(scoreObj)
//             }https://flutter.dev/docs/get-started/install/windows
//             console.log(totalMECH)
//             var percentMECH=totalMECH*totalMECH/100
//             console.log(percentMECH)
//             eventFunctions.getScoreEEE().then((details)=>{
//               console.log(details)
//               var length=details.reduce((a,obj)=>a+Object.keys(obj).length,0)
//               console.log(length/12)
//               var totalEEE=0
//               for(var i=0;i<length/12;i++){

//                 var scoreObj=details[i].marks[0].marks
//                 totalEEE=Number(totalEEE)+Number(scoreObj)
//               }
//               console.log(totalEEE)
//               var percentEEE=totalEEE*totalEEE/100
//               console.log(percentEEE)
//               // res.render('home', { title: 'Express', user, eventDetails, registerDetails, totalCSE, totalECE,totalMECH,totalEEE });
//               eventFunctions.getScoreCIVIL().then((details)=>{
//                 console.log(details)
//                 var length=details.reduce((a,obj)=>a+Object.keys(obj).length,0)
//                 console.log(length/12)
//                 var totalCIVIL=0
//                 for(var i=0;i<length/12;i++){

//                   var scoreObj=details[i].marks[0].marks
//                   totalCIVIL=Number(totalCIVIL)+Number(scoreObj)
//                 }
//                 console.log(totalCIVIL)
//                 var percentCIVIL=totalCIVIL*totalCIVIL/100
//                 console.log(percentCIVIL)
//                 res.render('home', { title: 'Express', user, eventDetails, registerDetails, totalCSE, totalECE,totalMECH,totalEEE,totalCIVIL,percentCSE,percentECE,percentMECH,percentEEE,percentCIVIL });

//               })
//             })
//           })
//         })
//       })

//     })


//   })

// });

router.get('/app-get-score', function (req, res, next) {

  let user = req.session.user
  console.log('my    ')
  console.log(user)

  eventFunctions.getAllEvents().then((eventDetails) => {
    eventFunctions.getRegisteredDetails().then((registerDetails) => {

      eventFunctions.getScoreCSE().then((details) => {
        console.log(details)
        console.log("marks")

        var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
        console.log(length / 12)
        var totalCSE = 0
        for (var i = 0; i < length / 12; i++) {
          if (details[i].marks != null) {
            try {
              var scoreObj = details[i].marks[0].marks
              totalCSE = Number(totalCSE) + Number(scoreObj)
            } catch (error) {
              console.log(error)
            }
          }

        }
        console.log(totalCSE)
        var percentCSE = totalCSE * totalCSE / 100
        console.log(percentCSE)
        // res.render('home', { title: 'Express', user, eventDetails, registerDetails,totalCSE });
        eventFunctions.getScoreECE().then((details) => {
          console.log(details)
          var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
          console.log(length / 12)
          var totalECE = 0
          for (var i = 0; i < length / 12; i++) {

            var scoreObj = details[i].marks[0].marks
            totalECE = Number(totalECE) + Number(scoreObj)
          }
          console.log(totalECE)
          var percentECE = totalECE * totalECE / 100
          console.log(percentECE)

          eventFunctions.getScoreMECH().then((details) => {
            console.log(details)
            var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
            console.log(length / 12)
            var totalMECH = 0

            for (var i = 0; i < length / 12; i++) {

              var scoreObj = details[i].marks[0].marks
              totalMECH = Number(totalMECH) + Number(scoreObj)
            }
            console.log(totalMECH)
            var percentMECH = totalMECH * totalMECH / 100
            console.log(percentMECH)
            eventFunctions.getScoreEEE().then((details) => {
              console.log(details)
              var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
              console.log(length / 12)
              var totalEEE = 0
              for (var i = 0; i < length / 12; i++) {

                var scoreObj = details[i].marks[0].marks
                totalEEE = Number(totalEEE) + Number(scoreObj)
              }
              console.log(totalEEE)
              var percentEEE = totalEEE * totalEEE / 100
              console.log(percentEEE)
              // res.render('home', { title: 'Express', user, eventDetails, registerDetails, totalCSE, totalECE,totalMECH,totalEEE });
              eventFunctions.getScoreCIVIL().then((details) => {
                console.log(details)
                var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
                console.log(length / 12)
                var totalCIVIL = 0
                for (var i = 0; i < length / 12; i++) {

                  var scoreObj = details[i].marks[0].marks
                  totalCIVIL = Number(totalCIVIL) + Number(scoreObj)
                }
                console.log(totalCIVIL)
                var percentCIVIL = totalCIVIL * totalCIVIL / 100
                console.log(percentCIVIL)
                res.send({ totalCSE, totalECE, totalMECH, totalEEE, totalCIVIL, percentCSE, percentECE, percentMECH, percentEEE, percentCIVIL });

              })
            })
          })
        })
      })




    })


  })

});


router.get('/app-getAllEvents', function (req, res) {
  eventFunctions.getAllEvents().then((eventDetails) => {
    console.log(eventDetails)
    //console.log(eventDetails.length)   
    res.json(eventDetails)
  })
})




router.post('/app-student-login', (req, res) => {
  console.log(req.body)
  if (key == req.body.key) {
    userFunctions.doLogin(req.body).then((response) => {
      console.log('response')
      console.log(response)
      if (response.status) {

        req.session.user = response.user
        req.session.user.loggedIn = true
        res.send({ success: true, token: response.user._id })
      } else {
        req.session.loginUserErr = "Invalid username or password"
        console.log("error in login")
        res.send({ success: false, msg: 'Login failed, wrong password' })
      }
    })
  } else {
    console.log("Unauthorized request")
  }
})
router.post('/app-student-signup', (req, res) => {
  //console.log(req.body)
  if (key == req.body.key) {
    userFunctions.checkUser(req.body).then((response) => {

      if (response) {
        res.send({ successs: false, msg: "You already have an account" })
      } else {
        userFunctions.doSignup(req.body).then((response) => {

          console.log("do login")
          console.log(response)

          req.session.user = response
          req.session.user.loggedIn = true

          if (response) {
            res.send({ success: true, msg: 'Signup Success' })
          } else {
            res.send({ success: false, msg: 'Failed to Signup' })
          }
        })
      }

    })
    // userFunctions.doSignup(req.body).then((response) => {
    //   console.log(response)
    //   if(response){
    //     res.send({success: true, msg: 'Signup Success'})
    //   }else{
    //     res.send({success: false, msg: 'Failed to Signup'})
    //   }
    // })
  } else {
    console.log("Unauthorized request")
  }
})




router.post('/app-getUserData', (req, res) => {


  console.log(req.body.token)

  userFunctions.getUserData(req.body.token).then((response) => {

    userFunctions.getUserRegister(req.body.token).then((details) => {

      // console.log(details)
      // 
      // console.log(response)
      if (details == null) {
        res.send({ name: response.name, email: response.email, chessno: null, regno: null, department: null, semester: null, itemnames: null })
      } else {
        res.send({ name: response.name, email: response.email, chessno: details.chessno[0], regno: details.regno, department: details.department, semester: details.semester, itemnames: details.itemname })
      }

      //res.send({name:response.name,email:response.email,chessno:details.chessno[0],regno:details.regno,department:details.department,semester:details.semester,itemnames:details.itemname})
    })



  })
})


// router.post('/register-for-events/:id', function (req, res) {

//   console.log(req.body)

//   eventFunctions.checkRegister(req.params.id).then((response) => {
//    console.log(response)
//     if(response != null) {

//       var msg='You are already registered'
//       res.render('event-registration',{msg})
//     } else {
//       eventFunctions.registerEvent(req.body).then((response)=>{
//         eventFunctions.getChessNo(req.params.id).then((chessno)=>{
//           eventFunctions.pushChessno(req.params.id,chessno).then((_res)=>{
//             console.log(response)
//             var success='Registration done'
//             res.render('event-registration',{success})
//           })
//         })

//       })
//     }

//   })

// })
router.post('/register-for-events/:id', function (req, res) {
  console.log(req.params.id)
  console.log(req.body)

  eventFunctions.checkRegister(req.params.id).then((response) => {
    console.log(response)
    if (response != null) {

      var msg = 'You are already registered'
      res.render('event-registration', { msg })
    } else {

      eventFunctions.findLast().then((res_) => {

        console.log('last document')
        console.log(res_)
        if(res_ == null){

        eventFunctions.registerEvent(req.body).then((response) => {
          console.log(response)
          const _num = 100;
          if(response){
            eventFunctions.pushChessno(req.params.id, _num).then((res1) => {
              var success = 'Registration done'
              res.render('event-registration', { success })
            })
         
          }
            
        })
      }else{

           console.log(res_.chessno[0])
             var chestNew = Number(res_.chessno[0]) + 1
             eventFunctions.registerEvent(req.body).then((response1) => {
                  if(response1){
                    eventFunctions.pushChessno(req.params.id, chestNew).then((res1) => {
                      var success = 'Registration done'
                      res.render('event-registration', { success })
                    })
                  }
                    
             })
      }

      })
    }

  })

})

module.exports = router;

