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
    addMarks:(chessno,details,userGS,item_type,item_subtype)=>{
        var markObj;
        console.log(userGS)
        if(userGS=='solo' && details.mark == "First"){
            markObj={
                "itemname":details.itemname,
                "grouporsolo":userGS,
                "itemtype":item_type,
                "subtype":item_subtype,
                "position":"first",
                "mark":Number(5),
            }
        }
        if(userGS=='solo' && details.mark == "Second"){
            markObj={
                "itemname":details.itemname,
                "grouporsolo":userGS,
                "itemtype":item_type,
                "subtype":item_subtype,
                "position":"second",
                "mark":Number(3),
            }
        }
        if(userGS=='solo' && details.mark == "Third"){
            markObj={
                "itemname":details.itemname,
                "grouporsolo":userGS,
                "itemtype":item_type,
                "subtype":item_subtype,
                "position":"third",
                "mark":Number(1),
            }
        }

        if(userGS=='group' && details.mark == "First"){
            markObj={
                "itemname":details.itemname,
                "grouporsolo":userGS,
                "itemtype":item_type,
                "subtype":item_subtype,
                "position":"first",
                "mark":Number(10),
            }
        }
        if(userGS=='group' && details.mark == "Second"){
            markObj={
                "itemname":details.itemname,
                "grouporsolo":userGS,
                "itemtype":item_type,
                "subtype":item_subtype,
                "position":"second",
                "mark":Number(5),
            }
        }
        if(userGS=='group' && details.mark == "Third"){
            markObj={
                "itemname":details.itemname,
                "grouporsolo":userGS,
                "itemtype":item_type,
                "subtype":item_subtype,
                "position":"third",
                "mark":Number(3),
            }
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
    getWinnerData:(chestno)=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('winner').findOne({chessno:chestno}).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    getGroup_or_Solo:(itemname_)=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('item').findOne({itemname:itemname_}).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    pushWinnerDescription:(chestno,descrip)=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('winner').updateOne({chessno:chestno},{
                $set:{
                    
                    description:descrip,
                    
                }
            }).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    pushItemPostions:(details)=>{
        console.log("---------------------------------------------")
        console.log(details)
        
        if(details.mark == "First"){
            var fStatus="1";
            return new Promise(async(resolve,reject)=>{
           
                await db.get().collection('item').updateOne({itemname:details.itemname},{
                    $set:{
                        
                        firstPrizeStatus:fStatus,
                        
                        
                    }
                }).then((data)=>{
                   
                    resolve(data)
                })
                
            })
        }
        if(details.mark == "Second"){
            var sStatus="1";
            return new Promise(async(resolve,reject)=>{
           
                await db.get().collection('item').updateOne({itemname:details.itemname},{
                    $set:{
                        
                        secondPrizeStatus:sStatus,
                        
                        
                    }
                }).then((data)=>{
                   
                    resolve(data)
                })
                
            })
        }
        if(details.mark == "Third"){
            var tStatus="1";
            return new Promise(async(resolve,reject)=>{
           
                await db.get().collection('item').updateOne({itemname:details.itemname},{
                    $set:{
                        
                        thirdPrizeStatus:tStatus,
                        
                        
                    }
                }).then((data)=>{
                   
                    resolve(data)
                })
                
            })
        }
        
    },
    announceWinners:(winner_announce)=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('admin').updateOne({_id:ObjectId("60a6713de65070afe4cbe825")},{
                $set:{
                    
                    winners:winner_announce,
                    
                }
            }).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    updateWinnerImageStatus:(id,status_)=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('winner').updateOne({_id:ObjectId(id)},{
                $set:{
                    
                    image_:status_,
                    
                }
            }).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    getAnnounceWinner:()=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('admin').findOne({_id:ObjectId("60a6713de65070afe4cbe825")}).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    openRegistration:(value)=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('admin').updateOne({_id:ObjectId("60a69ba7e65070afe4cc65ce")},{
                $set:{
                    
                    registration:value,
                    
                }
            }).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    get_oc_registration:()=>{
        return new Promise(async(resolve,reject)=>{
           
            await db.get().collection('admin').findOne({_id:ObjectId("60a69ba7e65070afe4cc65ce")}).then((data)=>{
                
               console.log(data)
                resolve(data)
            })
            
        })
    },
    pushAttendStatus:(chestno)=>{
        return new Promise(async (resolve, reject) => {

            db.get().collection('registered').updateOne({chessno:chestno},{$push:{attendedEventStatus:"yes"}}).then((data) => {

                resolve(data)

            })
        })
    },
    pushAttendedItems:(chestno,items)=>{
        return new Promise(async (resolve, reject) => {

            db.get().collection('registered').updateOne({chessno:chestno},{$push:{attendedEvent:items}}).then((data) => {

                resolve(data)

            })
        })
    },
    insertWinnerCertificates:(bufferObj)=>{
        return new Promise(async (resolve, reject) => {
             
            db.get().collection('winner-certificates').insertOne(bufferObj).then((data) => {
            
              resolve(data.ops[0].email)

             })
     

        })
        
    },
    insertParticipationCertificates:(bufferObj)=>{
        return new Promise(async (resolve, reject) => {
             
            db.get().collection('participation-certificates').insertOne(bufferObj).then((data) => {
            
              resolve(data.ops[0].email)

             })
     

        })
        
    },
    getAllWinnerCertificates:()=>{
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection('winner-certificates').find().toArray()
            resolve(data)
        })
    },
    removeAllWinnerCertificates:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('winner-certificates').deleteMany({}).then((response)=>{
                resolve(response)
                
            })
        })
    },
    removeAllParticipationCertificates:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('participation-certificates').deleteMany({}).then((response)=>{
                resolve(response)
                
            })
        })
    },
    insertWorkEntries:(details)=>{
        return new Promise(async (resolve, reject) => {
             
            db.get().collection('work-entries').insertOne(details).then((data) => {
            
              resolve(data.ops[0]._id)

             })
     

        })
    },
    
    // pushUserIdToWorkEntries:(findId,userData)=>{
    //     return new Promise(async (resolve, reject) => {

    //         db.get().collection('work-entries').updateOne({_id:ObjectId(findId)},{$push:{userData:userData}}).then((data) => {

    //             resolve(data)

    //         })
    //     })
    // },
    getAllEntries:()=>{
        return new Promise(async(resolve,reject)=>{
           
            let Details=await db.get().collection('work-entries').find().toArray()
            resolve(Details)
        })
    }



    

}
