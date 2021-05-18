var db = require('../config/connection').get()
const bcrypt=require('bcrypt')
var db = require('../config/connection')
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');
const session = require('express-session');
const generateUniqueId = require('generate-unique-id');
 


module.exports = {
    doLogin: (userData) => {
        console.log(userData)
        
        return new Promise(async (resolve, reject) => {
            var _pass= await bcrypt.hash(userData.password,10)
            console.log(_pass)
            let response = {}
            let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ username: userData.username })
            console.log(user)
            console.log(userData.password)
            
            //console.log(user.password)
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed")
                resolve({ status: false })
            }
        })
    },
    addEvent: (Event, callback) => {
        console.log(Event);
        db.get().collection('event').insertOne(Event).then((data) => {
            callback(data.ops[0]._id)
        })
    },
    addWinner: (winnerDetails, callback) => {
        console.log(winnerDetails);
        db.get().collection('winner').insertOne(winnerDetails).then((data) => {
            callback(data.ops[0]._id)
        })
    },
    addItem: (item, callback) => {
        console.log(item);
        return new Promise(async(resolve,reject)=>{
            
            db.get().collection(collection.ITEM_COLLECTION).insertOne(item).then((data)=>{
                resolve(data.ops[0])
            })
            
        })
    },
    addYutubeLink: (link, callback) => {
        console.log(link);
        return new Promise(async(resolve,reject)=>{
            
            db.get().collection('youtubelink').insertOne(link).then((data)=>{
                resolve(data.ops[0])
            })
            
        })
    },
    addImage: (_data, callback) => {
        
        
        return new Promise(async(resolve,reject)=>{
            
            db.get().collection('gallery').insertOne(_data).then((data)=>{
                
                resolve(data.ops[0])
            })
            
        })
    },
    getAllimages: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection('gallery').find().toArray()
            resolve(data)
        })
    },
    getAllwinners: () => {
        return new Promise(async (resolve, reject) => {
            let Winners = await db.get().collection('winner').find().toArray()
            resolve(Winners)
        })
    },
    getAllItems: () => {
        return new Promise(async (resolve, reject) => {
            let Items = await db.get().collection(collection.ITEM_COLLECTION).find().toArray()
            resolve(Items)
        })
    },
    getAllLinks: () => {
        return new Promise(async (resolve, reject) => {
            let Links = await db.get().collection('youtubelink').find().toArray()
            resolve(Links)
        })
    },
    
    getWinner:(winnerId)=>{
        return new Promise( (resolve, reject) => {
            db.get().collection('winner').findOne({_id:ObjectId(winnerId)}).then((data)=>{
                resolve(data)
            })
            
        })
    },
    getPhoto:(photoId)=>{
        return new Promise( (resolve, reject) => {
            db.get().collection('gallery').findOne({_id:ObjectId(photoId)}).then((data)=>{
                resolve(data)
            })
            
        })
    },
    updatePhoto:(photoId,photoDetails)=>{
        console.log('photo id')
        console.log(photoId)
        return new Promise((resolve,reject)=>{
            db.get().collection('gallery').updateOne({_id:ObjectId(photoId)},{
                $set:{
                    
                    description:photoDetails.description,
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    updateWinner:(winnerId,winnerDetails)=>{
        console.log('winner id')
        console.log(winnerId)
        return new Promise((resolve,reject)=>{
            db.get().collection('winner').updateOne({_id:ObjectId(winnerId)},{
                $set:{
                    name:winnerDetails.name,
                    department:winnerDetails.department,
                    semester:winnerDetails.semester,
                    description:winnerDetails.description,
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    deleteWinner:(winnerId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('winner').removeOne({_id:ObjectId(winnerId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getEvents:(eventId)=>{
        return new Promise( (resolve, reject) => {
            db.get().collection(collection.EVENT_COLLECTION).findOne({_id:ObjectId(eventId)}).then((data)=>{
                resolve(data)
            })
            
        })
    },
    updateEvent:(eventId,eventDetails)=>{
        console.log('event id')
        console.log(eventId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.EVENT_COLLECTION).updateOne({_id:ObjectId(eventId)},{
                $set:{
                    eventname:eventDetails.eventname,
                    date:eventDetails.date,
                    time:eventDetails.time,
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    registerEvent: (registration_details) => {
        
        
        console.log(registration_details);

        return new Promise(async (resolve, reject) => {
             
            
            

                db.get().collection('registered').insertOne(registration_details).then((data) => {
                
                  resolve(data.ops[0]._id)
    
                 })
         

            


        })
    },
    pushChessno: (userid,_chessno)=>{
        return new Promise(async (resolve, reject) => {

            db.get().collection('registered').updateOne({userid:userid},{$push:{chessno:_chessno}}).then((data) => {

                resolve()

            })
        })
    },
    deleteEvent:(eventId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.EVENT_COLLECTION).removeOne({_id:ObjectId(eventId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    deletePhoto:(photoId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('gallery').removeOne({_id:ObjectId(photoId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    deleteLink:(linkId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('youtubelink').removeOne({_id:ObjectId(linkId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    updateItem:(itemId,itemDetails)=>{
        console.log('item id')
        console.log(itemId)
        console.log(itemDetails)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ITEM_COLLECTION).updateOne({_id:ObjectId(itemId)},{
                $set:{
                    itemname:itemDetails.itemname,
                    
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },

    updateLink:(linkId,linkDetails)=>{
        console.log('link id')
        console.log(linkId)
        console.log(linkDetails)
        return new Promise((resolve,reject)=>{
            db.get().collection('youtubelink').updateOne({_id:ObjectId(linkId)},{
                $set:{
                    ytlink:linkDetails.ytlink,
                    
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    deleteItem:(itemId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ITEM_COLLECTION).removeOne({_id:ObjectId(itemId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getItem:(itemId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ITEM_COLLECTION).findOne({_id:ObjectId(itemId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getLink:(linkId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('youtubelink').findOne({_id:ObjectId(linkId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    findLast:()=>{
        
        return new Promise(async (resolve, reject) => {

            db.get().collection('registered').find().sort({$natural:-1}).limit(1).next().then((res)=>{
                console.log('the last one!')
                console.log(res)
                
                resolve(res)
                
            })
           
        })

    },
    getChessNo: (userid) => {
        return new Promise((resolve, reject) => {
            var id = generateUniqueId({
                length: 3,
                useLetters: false,
                useNumbers: true
              });
              
            console.log(id)
            


            console.log('get chess no ')
            console.log(userid)
            var userId = userid

            var current = new Date();

            var hour=current.getHours()
            var minute=current.getMinutes()
            var seconds=current.getSeconds()

            var _time=hour+minute+seconds

            console.log(_time)
            
            var num1 = userId.charCodeAt(23)
            var num2 = userId.charCodeAt(22)
            var num3 = userId.charCodeAt(21)
            var num4 = userId.charCodeAt(20)
            var num5 = userId.charCodeAt(19)
            var num6 = userId.charCodeAt(18)
            var num7 = userId.charCodeAt(17)
            var num8 = userId.charCodeAt(16)

            var total = num1 + num2 + num3 + num4 + num5 + num6 + num7 + num8 +_time+id
            
            console.log(total)
            resolve(total.toString())
        })



    },
    getAllEvents: () => {
        return new Promise(async (resolve, reject) => {
            let eventDetails = await db.get().collection(collection.EVENT_COLLECTION).find().toArray()
            resolve(eventDetails)
        })
    },
    getAllRegisteredDetails: () => {
        return new Promise(async (resolve, reject) => {
            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).find().toArray()
            resolve(registerDetails)
        })
    },
    getRegisteredDetails: (userId) => {
        console.log('user ')
        console.log(userId)

        return new Promise(async (resolve, reject) => {

            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).findOne({ userid: userId })
            resolve(registerDetails)
        })
    },
    checkRegister: (userid) => {
        console.log("check register")
        console.log(userid)
        return new Promise(async (resolve, reject) => {

            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).findOne({ userid: userid })
            console.log(registerDetails)

            resolve(registerDetails)
        })
    },
    getScoreCSE:()=>{
        return new Promise(async (resolve, reject) => {

            var dpt='cse'
            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).find({ department: dpt }).toArray()
            console.log(registerDetails)

            resolve(registerDetails)
        })
    },
    getScoreECE:()=>{
        return new Promise(async (resolve, reject) => {

            var dpt='ece'
            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).find({ department: dpt }).toArray()
            console.log(registerDetails)

            resolve(registerDetails)
        })
    },
    getScoreMECH:()=>{
        return new Promise(async (resolve, reject) => {

            var dpt='mech'
            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).find({ department: dpt }).toArray()
            console.log(registerDetails)

            resolve(registerDetails)
        })
    },
    getScoreEEE:()=>{
        return new Promise(async (resolve, reject) => {

            var dpt='eee'
            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).find({ department: dpt }).toArray()
            console.log(registerDetails)

            resolve(registerDetails)
        })
    },
    getScoreCIVIL:()=>{
        return new Promise(async (resolve, reject) => {

            var dpt='civil'
            let registerDetails = await db.get().collection(collection.REGISTEREVENT_COLLECTION).find({ department: dpt }).toArray()
            console.log(registerDetails)

            resolve(registerDetails)
        })
    },
    
}
