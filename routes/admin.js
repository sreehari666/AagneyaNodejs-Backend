const { response } = require('express');
var express = require('express');
const { addEvent } = require('../functions/event-functions');
var router = express.Router();
var eventFunctions = require('../functions/event-functions')
const judgeFunctions = require('../functions/judge-functions')
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
const fs = require('fs')
var rimraf = require('rimraf')
var cors = require('cors')

const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

const nodemailer = require('nodemailer'),

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "teamartfest@gmail.com",
      pass: "Drishyam3@varun123",
    },
  }),
  EmailTemplate = require('email-templates').EmailTemplate,

  Promise = require('bluebird');


router.use(cors())

const verifyLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next()
  } else {
    res.redirect('admin/admin-login')
  }

}

router.get('/admin-login', function (req, res) {
  if (req.session.adminloggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/admin-login', { "loginErr": req.session.adminLoginErr })
    req.session.adminLoginErr = false
  }

})
router.post('/admin-login', (req, res) => {
  console.log(req.body)
  console.log("login call")
  eventFunctions.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminloggedIn = true
      req.session.admin = response.admin

      res.redirect('/admin')
    } else {
      req.session.adminLoginErr = "Invalid username or password"
      res.redirect('admin-login')
    }
  })
})
router.get('/admin-logout', (req, res) => {
  req.session.adminloggedIn = null
  res.redirect('admin-login')
})

/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  eventFunctions.getAllEvents().then((eventDetails) => {
    eventFunctions.getAllItems().then((items) => {
      console.log(eventDetails)
      var gList = []
      for (var i = 0; i < items.length; i++) {
        if (items[i].firstPrizeStatus == 1 || items[i].secondPrizeStatus == 1 || items[i].thirdPrizeStatus == 1) {
          gList.push(items[i].itemname)
        }
      }
      console.log(items.length)
      console.log(gList.length)
      if (items.length == gList.length) {
        var certificateStatus = "yes"
        res.render('admin/admin-panel', { eventDetails, certificateStatus })
      } else {
        res.render('admin/admin-panel', { eventDetails })
      }
      console.log(items)

    })

  })


});

router.get('/add-winner', function (req, res) {
  res.render('admin/add-winner')
})
router.post('/add-winner', function (req, res) {


  console.log(req.body)
  console.log(req.files.image)


  eventFunctions.addWinner(req.body, (id) => {
    let image = req.files.image;
    console.log(id)
    image.mv('./public/winner-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        judgeFunctions.updateWinnerImageStatus(id, "done").then((data__) => {
          res.render('admin/add-winner')
        })

      } else {
        console.log(err)
      }
    })

  })





});
router.get('/view-winners', function (req, res) {
  eventFunctions.getAllwinners().then((data) => {
    console.log(data)
    res.render('admin/view-winners', { data })
  })

})
router.get('/add-event', function (req, res) {

  res.render('admin/add-event')
});
router.get('/edit-winner/:id', async function (req, res) {
  console.log(req.params.id)
  let winner = await eventFunctions.getWinner(req.params.id)
  console.log(winner)
  res.render('admin/edit-winner', { winner })
});



router.post('/edit-winner/:id', function (req, res) {
  console.log(req.body)
  console.log(req.files.image)
  let id = req.params.id
  eventFunctions.updateWinner(req.params.id, req.body).then(() => {

    if (req.files.image) {
      judgeFunctions.updateWinnerImageStatus(id, "done").then((data__) => {
        let image = req.files.image
        image.mv('./public/winner-images/' + id + '.jpg')
        res.redirect('/admin')
      })


    }
  })

})

router.get('/delete-winner/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.deleteWinner(req.params.id).then((data) => {
    eventFunctions.getAllwinners().then((data) => {
      console.log(data)
      res.render('admin/view-winners', { data })
    })
  })


})

router.get('/edit-event/:id', async function (req, res) {
  let event = await eventFunctions.getEvents(req.params.id)
  console.log(event)
  res.render('admin/edit-event', { event })
});



router.post('/edit-event/:id', function (req, res) {
  console.log(req.body)
  console.log(req.files.image)
  let id = req.params.id
  eventFunctions.updateEvent(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.image) {
      let image = req.files.image
      image.mv('./public/event-images/' + id + '.jpg')
    }
  })

})
router.get('/edit-item/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.getItem(req.params.id).then((data) => {
    console.log(data)
    res.render('admin/edit-item', { data })
  })
})


router.post('/edit-item/:id', function (req, res) {
  console.log(" bodyyyy")
  console.log(req.body)
  console.log(req.params.id)

  eventFunctions.updateItem(req.params.id, req.body).then((response) => {
    res.redirect('/admin/get-items')

  })

})

router.get('/delete-item/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.deleteItem(req.params.id).then((data) => {
    eventFunctions.getAllItems().then((data) => {
      console.log(data)
      res.render('admin/view-items', { data })
    })
  })
})

router.post('/add-event', function (req, res) {

  console.log(req.body)
  console.log(req.files.image)


  eventFunctions.addEvent(req.body, (id) => {
    var dt_Obj = {
      "date": req.body.date,
      "time": req.body.time,
      "eventid": id,

    }
    eventFunctions.EventTimeLog(dt_Obj).then((log_) => {
      let image = req.files.image;
      console.log(id)
      image.mv('./public/event-images/' + id + '.jpg', (err, done) => {
        if (!err) {
          res.render('admin/add-event')
        } else {
          console.log(err)
        }
      })
    })

  })


});

router.post('/add-item', function (req, res) {

  console.log(req.body)

  eventFunctions.addItem(req.body).then((data) => {
    console.log(data)
    res.render('admin/add-item')
  })

})
router.get('/add-item', function (req, res) {
  res.render('admin/add-item')
})
router.get('/get-items', (req, res) => {

  eventFunctions.getAllItems().then((data) => {
    console.log(data)
    res.render('admin/view-items', { data })
  })

})


router.get('/add-youtube-link', function (req, res) {

  res.render('admin/add-youtube-link')

})

router.post('/add-youtube-link', function (req, res) {

  console.log(req.body)
  eventFunctions.addYutubeLink(req.body).then((data) => {
    console.log(data)
    res.render('admin/add-youtube-link')
  })

})
router.get('/view-youtube-links', function (req, res) {
  eventFunctions.getAllLinks().then((data) => {
    var dataList=[]
    for(var i=0;i<data.length;i++){
      console.log(data[i])
      var video_id = data[i].ytlink.split('v=')[1];
      var ampersandPosition = video_id.indexOf('&');
      if(ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
      }
      console.log(video_id)
      var videoData="https://www.youtube.com/oembed?url="+data[i].ytlink+"&format=json"
      
      
      var obj={
        _id:data[i]._id,
        ytlink:data[i].ytlink,
        thumbnail:"https://img.youtube.com/vi/"+video_id+"/1.jpg",

      }
      dataList.push(obj)
    }
    console.log(data)
    res.render('admin/view-youtube-links', { dataList })
  })
})

router.get('/edit-link/:id', function (req, res) {

  console.log(req.params.id)
  eventFunctions.getLink(req.params.id).then((data) => {
    console.log(data)
    res.render('admin/edit-youtube-link', { data })
  })
})

router.post('/edit-links/:id', function (req, res) {
  console.log(" bodyyyy")
  console.log(req.body)
  console.log(req.params.id)

  eventFunctions.updateLink(req.params.id, req.body).then((response) => {

    res.redirect('/admin/view-youtube-links')


  })

})

router.get('/delete-link/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.deleteLink(req.params.id).then(() => {
    eventFunctions.getAllLinks().then((data) => {
      console.log(data)
      res.render('admin/view-youtube-links', { data })
    })
  })

})
router.get('/add-gallery-photos', function (req, res) {
  res.render('admin/add-gallery-photos')
})
router.post('/add-gallery-photos', function (req, res) {
  console.log(req.body)

  let image = req.files.image;
  eventFunctions.addImage(req.body).then((data) => {
    console.log(data)
    var id = data._id
    image.mv('./public/gallery-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-gallery-photos')
      } else {
        console.log(err)
      }
    })
  })



})

router.get('/view-gallery-photos', function (req, res) {
  eventFunctions.getAllimages().then((data) => {
    res.render('admin/view-gallery-photos', { data })
  })

})
router.get('/edit-photo/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.getPhoto(req.params.id).then((data) => {
    res.render('admin/edit-photos', { data })
  })

})
router.post('/edit-gallery-photos/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.updatePhoto(req.params.id, req.body).then((data) => {
    eventFunctions.getAllimages().then((data) => {
      res.render('admin/view-gallery-photos', { data })
    })
  })

})

router.get('/delete-photo/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.deletePhoto(req.params.id).then(() => {
    eventFunctions.getAllimages().then((data) => {
      res.render('admin/view-gallery-photos', { data })
    })
  })

})

router.get('/delete-event/:id', function (req, res) {
  console.log(req.params.id)
  eventFunctions.deleteEvent(req.params.id).then(() => {
    res.redirect('/admin')
  })

})
router.get('/view-registered-students', function (req, res) {
  eventFunctions.getAllRegisteredDetails().then((registerDetails) => {
    console.log(registerDetails)
    res.render('admin/view-registered-students', { registerDetails })
  })

})
router.get('/judge-signup', function (req, res) {
  res.render('admin/judge-signup')
})
router.post('/judge-signup', function (req, res) {
  console.log('post is working  ! ')
  console.log(req.body)

  var encryptedPassword = cryptr.encrypt(req.body.password);

  var decryptPassword = cryptr.decrypt(encryptedPassword)

  console.log(encryptedPassword)

  console.log(decryptPassword)

  var signObj = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    REpassword: encryptedPassword,

  }
  judgeFunctions.doSignup(signObj).then((response) => {
    req.session.judge = response
    req.session.judge.loggedIn = true
    console.log(response)
    res.redirect('/admin/judge-signup')
  })
})
router.get('/view-judges', function (req, res) {
  judgeFunctions.getJudges().then((response) => {
    var newList = []
    console.log(response)
    console.log(response[0].REpassword)


    for (var i = 0; i < response.length; i++) {
      var pass = cryptr.decrypt(response[i].REpassword)
      var listObj = {
        name: response[i].name,
        email: response[i].email,
        password: pass,
      }
      newList.push(listObj)
    }
    res.render('admin/view-judges', { newList })
  })

})


router.get("/generateReport", (req, res) => {

  var final_studentList = []

  eventFunctions.getAllRegisteredDetails().then((registerDetails_) => {



    var emailList = fs.readdirSync('./certificates')
    console.log("----------------generate report---------------------")
    console.log(emailList)

    console.log(registerDetails_)
    var _length = registerDetails_.length
    for (var i = 0; i < _length; i++) {

      var markList_ = registerDetails_[i].marks
      if (registerDetails_[i].marks) {

        for (var j = 0; j < markList_.length; j++) {
          var position_ = markList_[j].position
          var item_name = markList_[j].itemname

          var stdObj = {
            "name": registerDetails_[i].name,
            "department": registerDetails_[i].department,
            "semester": registerDetails_[i].semester,
            "chestno": registerDetails_[i].chessno[0],
            "email": registerDetails_[i].email,
            "itemname": item_name,
            "position": position_,

          }
          final_studentList.push(stdObj)

          console.log(final_studentList)
        }


      }


    }
    console.log(final_studentList)
    const map = {};
    var new_finalList = []
    final_studentList.forEach(el => {
      if (!map[JSON.stringify(el)]) {
        map[JSON.stringify(el)] = true;
        new_finalList.push(el);
      }
      console.log("-----------------new list--------------------")
      console.log(new_finalList)
      var sum_ = 0;
      for (var k = 0; k < new_finalList.length; k++) {
        console.log("call is here")

        var name_ = new_finalList[k].name
        var department_ = new_finalList[k].department
        var semester_ = new_finalList[k].semester
        var chestno_ = new_finalList[k].chestno
        var item_name = new_finalList[k].itemname
        var position_ = new_finalList[k].position
        var email_ = new_finalList[k].email



        ejs.renderFile(path.join(__dirname, './pdf-template/', "report-template.ejs"), {
          name: name_,
          department: department_,
          semester: semester_,
          chestno: chestno_,
          itemname: item_name,
          position: position_,
          email: email_,
        }, (err, data) => {

          if (err) {
            //res.send(err);
            console.log(err)
          } else {

            console.log("-----data------------")

            let options = {
              "height": "12.0in",
              "width": "9.0in",
              "header": {
                "height": "20mm",
              },
              "footer": {
                "height": "20mm",
              },

            };

            // './certificates/' + email_ + "/" + item_name + chestno_.toString() + '.pdf',
            pdf.create(data, options).toFile('./certificates/' + email_ + "/" + item_name + "&" + chestno_.toString() + '.pdf', function (err, data_) {
              if (err) {
                //res.send(err);
                console.log(err)
              } else {
                console.log(data_)

                if (data_) {
                  sum_ = sum_ + 1
                }
                console.log(sum_)
                if (new_finalList.length == sum_) {
                  res.redirect("/admin/upload-certificates")
                }


              }
            });

          }

        });



      }



    })

  })

})
router.get('/upload-certificates', (req, res) => {
  // judgeFunctions.removeAllWinnerCertificates()
  let bufferList = []
  fs.readdir('./certificates', function (err, data) {
    console.log(data)
    console.log(data.length)
    data.forEach(function (folder) {
      console.log("folder")

      fs.readdir('./certificates/' + folder, function (err, tempList) {
        console.log(tempList)
        for (var i = 0; i < tempList.length; i++) {
          var fileObj = {
            email: folder,
            filename: tempList[i],
            buffer: Buffer.from('./certificates/' + folder + '/' + tempList[i]),
          }
          bufferList.push(fileObj)
          console.log(bufferList)
          if (bufferList.length == tempList.length) {
            console.log("at end")
            var tempCheckList = []
            judgeFunctions.removeAllWinnerCertificates().then((rm) => {

              for (var i = 0; i < bufferList.length; i++) {
                var bufferLength = bufferList.length
                console.log("buffer length" + bufferLength)

                judgeFunctions.insertWinnerCertificates(bufferList[i]).then((d) => {

                  console.log(d)
                  tempCheckList.push(d)

                  console.log("d len")
                  console.log(tempCheckList.length)
                  console.log(bufferLength)
                  if (tempCheckList.length == bufferLength) {
                    res.redirect('/admin/sent-certificates')
                  }

                })


              }
            })
          }
        }


      })



    })

  })

})


router.get('/sent-certificates', (req, res) => {


  var data = fs.readdirSync('./certificates')


  console.log(data)

  let users = []
  for (var i = 0; i < data.length; i++) {
    console.log(data[i])


    var tempList = fs.readdirSync('./certificates/' + data[i])
    for (var j = 0; j < tempList.length; j++) {
      console.log("----------")
      console.log(data[i])
      console.log(tempList[j])
      console.log("----------")
      emailObj = {
        email: data[i],
        attachment: tempList[j],
      }
      users.push(emailObj)
    }

  }
  console.log(users)

  function sendEmail(obj) {
    return transporter.sendMail(obj);
  }

  function loadTemplate(templateName, contexts) {
    let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
    return Promise.all(contexts.map((context) => {
      return new Promise((resolve, reject) => {
        template.render(context, (err, result) => {
          if (err) reject(err);
          else resolve({
            email: result,
            context,
          });
        });
      });
    }));
  }

  loadTemplate('certificate-template', users).then((results) => {
    return Promise.all(results.map((result) => {
      sendEmail({
        to: result.context.email,
        from: 'Team Athene Arts :)',
        subject: result.email.subject,
        html: result.email.html,
        text: result.email.text,
        attachments: [
          {
            filename: result.context.attachment, // <= Here: made sure file name match
            path: path.join(__dirname, '../certificates/' + result.context.email + '/' + result.context.attachment), // <= Here
            contentType: 'application/pdf'
          }
        ]

      });
    }));
  }).then(async (data) => {
    console.log("----------after sending emails-------------")
    console.log(data.length)
    console.log(data[0])
    console.log('Winner email successfully sent');
    if (await data) {
      res.redirect('/admin/delete-winner-certificate')
    }

  });


})
router.get('/delete-winner-certificate', (req, res) => {

  console.log("call is here to delete")
  res.redirect("/admin")
  setTimeout(function () {
    console.log("I am the third log after 5 seconds");
    var emails = fs.readdirSync('./certificates')
    var files;
    var sum=0

    for (var j = 0; j < emails.length; j++) {
      console.log(fs.readdirSync('./certificates/' + emails[j] + '/'))

      files = fs.readdirSync('./certificates/' + emails[j] + '/')
      for (var i = 0; i < files.length; i++) {
        fs.unlink('./certificates/' + emails[j] + '/' + files[i], function (err) {
          if (err) {
            return console.error(err);
          }
          console.log('successfully deleted');
          sum=sum+1
          if(sum == files.length){
            console.log("end point")
            
          }

        });
      }
    }
  }, 1.2e+6);




})
router.get('/generate-participation-certificates', (req, res) => {
  eventFunctions.getAllRegisteredDetails().then((data) => {
    console.log(data)
    var userList = []
    for (var i = 0; i < data.length; i++) {
      console.log(data[i].attendedEventStatus)
      var attended_events = data[i].attendedEvent

      if (data[i].attendedEventStatus && attended_events && !data[i].marks) {

        var obj = {
          name: data[i].name,
          email: data[i].email,
          department: data[i].department,
          semester: data[i].semester,
          chestno: data[i].chessno[0],
          itemname: attended_events[0].join(),
        }
        console.log(obj)
        userList.push(obj)

      }
    }
    console.log(userList)
    var sum_ = 0;
    for (var j = 0; j < userList.length; j++) {
      var name = userList[j].name
      var department = userList[j].department
      var semester = userList[j].semester
      var chestno = userList[j].chestno
      var itemname = userList[j].itemname
      var email = userList[j].email

      ejs.renderFile(path.join(__dirname, './pdf-template/', "participation-template.ejs"), {
        name: name,
        department: department,
        semester: semester,
        chestno: chestno,
        itemname: itemname,
        email: email,
      }, (err, data) => {

        if (err) {
          //res.send(err);
          console.log(err)
        } else {

          console.log("-----data------------")

          let options = {
            "height": "12.0in",
            "width": "9.0in",
            "header": {
              "height": "20mm",
            },
            "footer": {
              "height": "20mm",
            },

          };

          // './certificates/' + email_ + "/" + item_name + chestno_.toString() + '.pdf',
          pdf.create(data, options).toFile('./certificates-participation/' + email + "/" + itemname + "&" + chestno + '.pdf', function (err, data_) {
            if (err) {

              console.log(err)
            } else {
              console.log(data_)

              if (data_) {
                sum_ = sum_ + 1
              }
              console.log(sum_)
              if (userList.length == sum_) {
                res.redirect("/admin/upload-participation-certificates")
              }


            }
          });

        }

      })
    }
  })
})
router.get('/upload-participation-certificates', (req, res) => {
  // judgeFunctions.removeAllWinnerCertificates()
  let bufferList = []
  fs.readdir('./certificates-participation', function (err, data) {
    console.log(data)
    console.log(data.length)
    data.forEach(function (folder) {
      console.log("folder")

      fs.readdir('./certificates-participation/' + folder, function (err, tempList) {
        console.log(tempList)
        for (var i = 0; i < tempList.length; i++) {
          var fileObj = {
            email: folder,
            filename: tempList[i],
            buffer: Buffer.from('./certificates-participation/' + folder + '/' + tempList[i]),
          }
          bufferList.push(fileObj)
          console.log(bufferList)
          if (bufferList.length == tempList.length) {
            console.log("at end")
            var tempCheckList = []
            judgeFunctions.removeAllParticipationCertificates().then((rm) => {

              for (var i = 0; i < bufferList.length; i++) {
                var bufferLength = bufferList.length
                console.log("buffer length" + bufferLength)

                judgeFunctions.insertParticipationCertificates(bufferList[i]).then((d) => {

                  console.log(d)
                  tempCheckList.push(d)

                  console.log("d len")
                  console.log(tempCheckList.length)
                  console.log(bufferLength)
                  if (tempCheckList.length == bufferLength) {
                    res.redirect('/admin/sent-participation-certificates')
                  }

                })


              }
            })
          }
        }


      })

    })

  })

})

router.get('/sent-participation-certificates', (req, res) => {


  console.log("sending emails......")

  var data = fs.readdirSync('./certificates-participation')

  console.log(data)

  let users = []
  for (var i = 0; i < data.length; i++) {
    console.log(data[i])
    console.log(fs.readdirSync('./certificates-participation/' + data[i]))
    var tempList = fs.readdirSync('./certificates-participation/' + data[i])
    for (var j = 0; j < tempList.length; j++) {

      emailObj = {
        email: data[i],
        attachment: tempList[j],
      }
      users.push(emailObj)
    }

  }
  console.log(users)

  function sendEmail(obj) {
    return transporter.sendMail(obj);
  }

  function loadTemplate(templateName, contexts) {
    let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
    return Promise.all(contexts.map((context) => {
      return new Promise((resolve, reject) => {
        template.render(context, (err, result) => {
          if (err) reject(err);
          else resolve({
            email: result,
            context,
          });
        });
      });
    }));
  }

  loadTemplate('certificate-template', users).then((results) => {
    return Promise.all(results.map((result) => {
      sendEmail({
        to: result.context.email,
        from: 'Team Athene Arts :)',
        subject: result.email.subject,
        html: result.email.html,
        text: result.email.text,
        attachments: [
          {
            filename: result.context.attachment, // <= Here: made sure file name match
            path: path.join(__dirname, '../certificates-participation/' + result.context.email + '/' + result.context.attachment), // <= Here
            contentType: 'application/pdf'
          }
        ]

      });
    }));
  }).then(async (data) => {
    console.log("----------after sending emails-------------")
    console.log(data.length)
    console.log(data[0])
    console.log('Winner email successfully sent');
    if (await data) {
      res.redirect('/admin/delete-participation-certificates')
    }

  });

})

router.get('/delete-participation-certificates',(req,res)=>{
  res.redirect('/admin')

  setTimeout(function () {
    console.log("I am the third log after 5 seconds");
    var emails = fs.readdirSync('./certificates-participation')
    var files;
    var sum=0

    for (var j = 0; j < emails.length; j++) {
      console.log(fs.readdirSync('./certificates-participation/' + emails[j] + '/'))

      files = fs.readdirSync('./certificates-participation/' + emails[j] + '/')
      for (var i = 0; i < files.length; i++) {
        fs.unlink('./certificates-participation/' + emails[j] + '/' + files[i], function (err) {
          if (err) {
            return console.error(err);
          }
          console.log('successfully deleted');
          sum=sum+1
          if(sum == files.length){
            console.log("end point")
            
          }

        });
      }
    }
  }, 1.2e+6);



})

module.exports = router;
