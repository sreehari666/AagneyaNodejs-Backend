var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb');

module.exports={
    doSignup:(userData)=>{
        
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                //res.json({success:true,msg:'Successfully saved'})
                resolve(data.ops[0])
            })
            
        })

    },
    doLogin: (userData) => {
        console.log(userData)
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            //console.log(user)
            //console.log(userData.password)
            //console.log(user.password)
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success")
                       
                        response.user = user
                        response.status = true
                        //console.log(response.user._id)
                        resolve(response)
                    } else {
                        console.log("login failed")
                        // res.send({success:false,msg:'login failed ! '})
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed")
                
                resolve({ status: false })
            }
        })
    },
    checkUser:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            
            db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email}).then((data)=>{
               
                resolve(data)
            })
            
        })
    },
    getUserData:(token)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(token)
            await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(token)}).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    getUserRegister:(token)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(token)
            await db.get().collection('registered').findOne({userid:token}).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    
}
