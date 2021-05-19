var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb');
module.exports={

    doSignup:(userData)=>{
        
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.JUDGE_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.ops[0])
            })
            
        })

    },
    doLogin: (userData) => {
        console.log(userData)
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.JUDGE_COLLECTION).findOne({ email: userData.email })
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
    getJudges:()=>{
        return new Promise(async(resolve,reject)=>{
           
            let judgesDetails=await db.get().collection(collection.JUDGE_COLLECTION).find().toArray()
            resolve(judgesDetails)
        })
    },
    addMarks:(chessno,detail)=>{
        var markObj={
            "itemname":detail.itemname,
            "mark":Number(detail.mark)
        }
        
        var chestArr=[Number(chessno)]

        return new Promise(async (resolve, reject) => {

            db.get().collection('registered').updateOne({chessno:chestArr},{$push:{marks:markObj}}).then((data) => {

                resolve(data)

            })
        })
    },
    checkUserChest:(chessno)=>{
        
        var chestArr=[Number(chessno)]
        console.log(chestArr)
        return new Promise(async (resolve, reject) => {

            db.get().collection('registered').findOne({chessno:chestArr}).then((data) => {

                resolve(data)

            })
        })
    },
    
    getUserDatas:(token)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(token)
            await db.get().collection(collection.JUDGE_COLLECTION).findOne({userid:token}).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    

}
