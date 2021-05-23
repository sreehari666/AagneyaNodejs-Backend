const { response } = require('express');
var express = require('express');
const { addEvent } = require('../functions/event-functions');
var router = express.Router();
var eventFunctions=require('../functions/event-functions')
const judgeFunctions = require('../functions/judge-functions')



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
  req.session.adminloggedIn=null
  res.redirect('admin-login')
})

/* GET users listing. */
router.get('/',verifyLogin, function(req, res, next) {
  eventFunctions.getAllEvents().then((eventDetails)=>{
    console.log(eventDetails)
    res.render('admin/admin-panel',{eventDetails})
  })
  
  
});

router.get('/add-winner',function(req,res) {
  res.render('admin/add-winner')
})
router.post('/add-winner',function(req,res){
  
  
  console.log(req.body)
  console.log(req.files.image)

  
    eventFunctions.addWinner(req.body,(id)=>{
      let image=req.files.image;
      console.log(id)
      image.mv('./public/winner-images/'+id+'.jpg',(err,done)=>{
        if(!err){
          judgeFunctions.updateWinnerImageStatus(id,"done").then((data__)=>{
            res.render('admin/add-winner')
          })
          
        }else{
          console.log(err)
        }
      })
      
    })
    
  
  
  
  
});
router.get('/view-winners',function (req,res) {
  eventFunctions.getAllwinners().then((data)=>{
    console.log(data)
    res.render('admin/view-winners',{data})
  })
  
})
router.get('/add-event',function(req,res){

  res.render('admin/add-event')
});
router.get('/edit-winner/:id',async function(req,res){
  console.log(req.params.id)
  let winner=await eventFunctions.getWinner(req.params.id)
  console.log(winner)
  res.render('admin/edit-winner',{winner})
});



router.post('/edit-winner/:id',function(req,res){
  console.log(req.body)
  console.log(req.files.image)
  let id=req.params.id
  eventFunctions.updateWinner(req.params.id,req.body).then(()=>{
    
    if(req.files.image){
      judgeFunctions.updateWinnerImageStatus(id,"done").then((data__)=>{
        let image=req.files.image
        image.mv('./public/winner-images/'+id+'.jpg')
        res.redirect('/admin')
      })
      
      
    }
  })

})

router.get('/delete-winner/:id',function(req,res){
  console.log(req.params.id)
  eventFunctions.deleteWinner(req.params.id).then((data)=>{
    eventFunctions.getAllwinners().then((data)=>{
      console.log(data)
      res.render('admin/view-winners',{data})
    })
  })


})

router.get('/edit-event/:id',async function(req,res){
  let event=await eventFunctions.getEvents(req.params.id)
  console.log(event)
  res.render('admin/edit-event',{event})
});



router.post('/edit-event/:id',function(req,res){
  console.log(req.body)
  console.log(req.files.image)
  let id=req.params.id
  eventFunctions.updateEvent(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image=req.files.image
      image.mv('./public/event-images/'+id+'.jpg')
    }
  })

})
router.get('/edit-item/:id',verifyLogin,function(req,res){
  console.log(req.params.id)
  eventFunctions.getItem(req.params.id).then((data)=>{
    console.log(data)
    res.render('admin/edit-item',{data})
  })
})


router.post('/edit-item/:id',function(req,res){
  console.log(" bodyyyy")
 console.log(req.body)
  console.log(req.params.id)
 
    eventFunctions.updateItem(req.params.id,req.body).then((response)=>{
      res.redirect('/admin/get-items')
      
    })

})

router.get('/delete-item/:id',function(req,res){
  console.log(req.params.id)
  eventFunctions.deleteItem(req.params.id).then((data)=>{
    eventFunctions.getAllItems().then((data)=>{
      console.log(data)
      res.render('admin/view-items',{data})
    })
  })
})

router.post('/add-event',function(req,res){
  
  console.log(req.body)
  console.log(req.files.image)
  
   
    eventFunctions.addEvent(req.body,(id)=>{
      var dt_Obj={
        "date":req.body.date,
        "time":req.body.time,
        "eventid":id,
    
      }
      eventFunctions.EventTimeLog(dt_Obj).then((log_)=>{
      let image=req.files.image;
      console.log(id)
      image.mv('./public/event-images/'+id+'.jpg',(err,done)=>{
        if(!err){
          res.render('admin/add-event')
        }else{
          console.log(err)
        }
      })
    })
      
    })
  
  
});

router.post('/add-item',function(req,res){

  console.log(req.body)

  eventFunctions.addItem(req.body).then((data)=>{
    console.log(data)
    res.render('admin/add-item')
  })

})
router.get('/add-item',function(req,res){
  res.render('admin/add-item')
})
router.get('/get-items',(req,res)=>{
  eventFunctions.getAllItems().then((data)=>{
    console.log(data)
    res.render('admin/view-items',{data})
  })
  
})


router.get('/add-youtube-link',function (req,res) {
  
  res.render('admin/add-youtube-link')

})

router.post('/add-youtube-link',function (req,res) {
  
  console.log(req.body)
  eventFunctions.addYutubeLink(req.body).then((data)=>{
    console.log(data)
    res.render('admin/add-youtube-link')
  })

})
router.get('/view-youtube-links',function (req,res) {
  eventFunctions.getAllLinks().then((data)=>{
    console.log(data)
    res.render('admin/view-youtube-links',{data})
  })
})

router.get('/edit-link/:id',function (req,res) {
  
  console.log(req.params.id)
  eventFunctions.getLink(req.params.id).then((data)=>{
    console.log(data)
    res.render('admin/edit-youtube-link',{data})
  })
})

router.post('/edit-links/:id',function(req,res){
  console.log(" bodyyyy")
 console.log(req.body)
  console.log(req.params.id)
 
    eventFunctions.updateLink(req.params.id,req.body).then((response)=>{
      
        res.redirect('/admin/view-youtube-links')
      
      
    })

})

router.get('/delete-link/:id',function(req,res){
  console.log(req.params.id)
  eventFunctions.deleteLink(req.params.id).then(()=>{
    eventFunctions.getAllLinks().then((data)=>{
      console.log(data)
      res.render('admin/view-youtube-links',{data})
    })
  })
  
})
router.get('/add-gallery-photos',function (req,res) {
  res.render('admin/add-gallery-photos')
})
router.post('/add-gallery-photos',function (req,res) {
  console.log(req.body)
  
  let image=req.files.image;
  eventFunctions.addImage(req.body).then((data)=>{
    console.log(data)
    var id=data._id
    image.mv('./public/gallery-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-gallery-photos')
      }else{
        console.log(err)
      }
    })
  })
  

 
})

router.get('/view-gallery-photos',function (req,res) {
  eventFunctions.getAllimages().then((data)=>{
    res.render('admin/view-gallery-photos',{data})
  })
  
})
router.get('/edit-photo/:id',function (req,res) {
  console.log(req.params.id)
  eventFunctions.getPhoto(req.params.id).then((data)=>{
    res.render('admin/edit-photos',{data})
  })
  
})
router.post('/edit-gallery-photos/:id',function (req,res) {
  console.log(req.params.id)
  eventFunctions.updatePhoto(req.params.id,req.body).then((data)=>{
    eventFunctions.getAllimages().then((data)=>{
      res.render('admin/view-gallery-photos',{data})
    })
  })
  
})

router.get('/delete-photo/:id',function(req,res){
  console.log(req.params.id)
  eventFunctions.deletePhoto(req.params.id).then(()=>{
    eventFunctions.getAllimages().then((data)=>{
      res.render('admin/view-gallery-photos',{data})
    })
  })
  
})

router.get('/delete-event/:id',function(req,res){
  console.log(req.params.id)
  eventFunctions.deleteEvent(req.params.id).then(()=>{
    res.redirect('/admin')
  })
  
})
router.get('/view-registered-students',function(req,res){
  eventFunctions.getAllRegisteredDetails().then((registerDetails)=>{
    res.render('admin/view-registered-students',{registerDetails})
  })
  
})
router.get('/judge-signup', function (req, res) {
  res.render('admin/judge-signup')
})
router.post('/judge-signup',function (req, res) {
  console.log('post is working  ! ')
  console.log(req.body)
  judgeFunctions.doSignup(req.body).then((response) => {
    req.session.judge=response
    req.session.judge.loggedIn=true
    console.log(response)
  })
})
router.get('/view-judges', function (req, res) {
  judgeFunctions.getJudges().then((response)=>{
    console.log(response)
    res.render('admin/view-judges',{response})
  })
  
})
module.exports = router;
