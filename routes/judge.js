var express = require('express');
var router = express.Router();
const session = require('express-session');
const eventFunctions = require('../functions/event-functions');
const judgeFunctions = require('../functions/judge-functions')

const verifyLoginJudge = (req, res, next) => {
  if (req.session.judgeloggedIn) {
    next()
  } else {
    res.redirect('/judge/judge-login/')
  }
}

/* GET home page. */
router.get('/', verifyLoginJudge, function (req, res, next) {

  eventFunctions.getAllRegisteredDetails().then((dataList) => {
    var newList = []
   
    console.log(dataList)
    for (var i = 0; i < dataList.length; i++) {
      var itemList = [];
      if (Array.isArray(dataList[i].itemname) == false) {

        itemList.push(dataList[i].itemname)
      } else {
        itemList = dataList[i].itemname
      }
      console.log(itemList)

      var itemDoneList = []
      console.log(dataList[i].marks)
      if (dataList[i].marks) {

        var markItem = dataList[i].marks;
        for (var j = 0; j < markItem.length; j++) {
          itemDoneList.push(markItem[j].itemname)
        }
      }



      if ((itemList.length - itemDoneList.length) == 0) {
        var newObj = {
          chestno: dataList[i].chessno[0],
          itemnameRegistered: itemList,
          itemnameDone: itemDoneList,
          doneCount: itemDoneList.length,
          remainingCount: (itemList.length - itemDoneList.length),
          eCompleted: "Evaluation Completed",
        }
      } else {
        if (dataList[i].attendedEventStatus) {
          var newObj = {
            chestno: dataList[i].chessno[0],
            itemnameRegistered: itemList,
            itemnameDone: itemDoneList,
            doneCount: itemDoneList.length,
            remainingCount: (itemList.length - itemDoneList.length),
            attendEventStatus: "yes",

          }
        } else {
          var newObj = {
            chestno: dataList[i].chessno[0],
            itemnameRegistered: itemList,
            itemnameDone: itemDoneList,
            doneCount: itemDoneList.length,
            remainingCount: (itemList.length - itemDoneList.length),

          }
        }
      }

      
      newList.push(newObj)
      console.log(newList)
    }
    var disable_chest = "yes"
    var newListLength = newList.length;
    var count = 0
    for (var i = 0; i < newList.length; i++) {
      if (newList[i].eCompleted) {
        count = count + 1
      }
    }
    console.log(count)
    var percent = (count / newListLength) * 100
    console.log(percent)
    var remaining = newListLength - count
    console.log(itemList)
    res.render('judge/judge', { disable_chest, newList,itemList, newListLength, remaining, percent });
  })



});

router.get('/judge-login', function (req, res) {
  if (req.session.judgeloggedIn) {
    res.redirect('/')
  } else {
    res.render('judge/judge-login', { "loginErr": req.session.loginJudgeErr })
    req.session.loginJudgeErr = false
  }

})
router.post('/judge-login', (req, res) => {
  console.log(req.body)
  console.log("login call")
  judgeFunctions.doLogin(req.body).then((response) => {
    console.log(response)
    if (response.status) {
      req.session.judgeloggedIn = true
      req.session.judge = response.judge
      // console.log(req.session.judge);
      // console.log(req.session.judge.judgeloggedIn);
      res.redirect('/judge')
    } else {
      req.session.loginJudgeErr = "Invalid email or password"
      res.redirect('/judge/judge-login')
    }
  })
})
router.get('/judge-logout', (req, res) => {
  req.session.judgeloggedIn = null
  res.redirect('/judge')
})

router.get('/event_attended/:chestno/:data', (req, res) => {
  
  console.log(req.params.chestno)
  console.log(req.params.data)
 
  var chestno=req.params.chestno
  judgeFunctions.checkUserChest(req.params.chestno).then((r)=>{
    var item_list=[]
    if(Array.isArray(r.itemname) == true){
      item_list=r.itemname
    }else{
      item_list.push(r.itemname)
    }
    console.log("item list ..... ")
    console.log(r)
    res.render('judge/item-select',{item_list,chestno})
  })
  

})
router.post('/add-attended',(req,res)=>{
  console.log(req.body)
  var chest=Number(req.body.chestno)
  var chestL=[]
  chestL.push(chest)
  var itemArray=[]
  
  if(Array.isArray(req.body.itemname) == false){
    itemArray.push(req.body.itemname)
  }else{
    itemArray=req.body.itemname
  }
  console.log(itemArray)
  judgeFunctions.pushAttendStatus(chestL).then((k)=>{
    
      judgeFunctions.pushAttendedItems(chestL,itemArray).then((p)=>{
        res.redirect('/judge')
      })
    
    
  })
})


router.post('/add_marks', verifyLoginJudge, (req, res) => {
  var userGS = '';
  var item_type;
  var item_subtype;

  console.log(req.body)
  judgeFunctions.getGroup_or_Solo(req.body.itemname).then((_gsData) => {
    console.log(_gsData)

    userGS = _gsData.grouporsolo
    item_type = _gsData.itemtype
    item_subtype = _gsData.subtype
  })
  var chestno = req.body.chessno;

  console.log(chestno)
  if (req.body.itemname == "no" && req.body.prize == "no") {
    var display = "yes"
    judgeFunctions.checkUserChest(chestno).then((response) => {


      if (response) {
        var final_itemsList = []
        console.log(response)
        var chestM = response.chessno[0];
        var itemsList = response.itemname;
        console.log(itemsList)
        console.log(Array.isArray(itemsList))
        if (Array.isArray(itemsList) == false) {

          final_itemsList.push(response.itemname)
        } else {
          for (var i = 0; i < itemsList.length; i++) {
            final_itemsList.push(itemsList[i])

          }
        }

        if (chestM && itemsList) {
          res.render('judge/judge', { display, chestM, final_itemsList })

        }


      } else {

        eventFunctions.getAllRegisteredDetails().then((dataList) => {
          var newList = []
          var itemList = [];
          console.log(dataList)
          for (var i = 0; i < dataList.length; i++) {

            if (Array.isArray(dataList[i].itemname) == false) {

              itemList.push(dataList[i].itemname)
            } else {
              itemList = dataList[i].itemname
            }
            console.log(itemList)

            var itemDoneList = []
            if (dataList[i].marks) {

              var markItem = dataList[i].marks;
              for (var j = 0; j < markItem.length; j++) {
                itemDoneList.push(markItem[j].itemname)
              }
            }


            if ((itemList.length - itemDoneList.length) == 0) {
              var newObj = {
                chestno: dataList[i].chessno[0],
                itemnameRegistered: itemList,
                itemnameDone: itemDoneList,
                doneCount: itemDoneList.length,
                remainingCount: (itemList.length - itemDoneList.length),
                eCompleted: "Evaluation Completed",
              }
            } else {

              if (dataList[i].attendedEventStatus) {
                var newObj = {
                  chestno: dataList[i].chessno[0],
                  itemnameRegistered: itemList,
                  itemnameDone: itemDoneList,
                  doneCount: itemDoneList.length,
                  remainingCount: (itemList.length - itemDoneList.length),
                  attendEventStatus: "yes",

                }
              } else {
                var newObj = {
                  chestno: dataList[i].chessno[0],
                  itemnameRegistered: itemList,
                  itemnameDone: itemDoneList,
                  doneCount: itemDoneList.length,
                  remainingCount: (itemList.length - itemDoneList.length),

                }
              }
            }


            newList.push(newObj)
            console.log(newList)
          }
          var disable_chest = "yes"
          var Err = 'User not found'
          var newListLength = newList.length;
          var count = 0
          for (var i = 0; i < newList.length; i++) {
            if (newList[i].eCompleted) {
              count = count + 1
            }
          }
          console.log(count)
          var percent = (count / newListLength) * 100
          console.log(percent)
          var remaining = newListLength - count
          res.render('judge/judge', { Err, disable_chest,itemList, newList, newListLength, remaining,percent });
        })


      }


    })

  } else {

    judgeFunctions.checkUserChest(chestno).then((rest) => {
      if (rest.marks) {
        console.log(rest.marks)
        var markList = rest.marks
        console.log(markList[0].itemname)
        console.log(req.body.itemname)
        console.log(markList.length)

        var item_;
        for (var i = 0; i < markList.length; i++) {
          if (markList[i].itemname == req.body.itemname) {

            item_ = markList[i].itemname;
          }
        }
        if (item_ == req.body.itemname) {

          eventFunctions.getAllRegisteredDetails().then((dataList) => {
            var newList = []
            var itemList = [];
            console.log(dataList)
            for (var i = 0; i < dataList.length; i++) {

              if (Array.isArray(dataList[i].itemname) == false) {

                itemList.push(dataList[i].itemname)
              } else {
                itemList = dataList[i].itemname
              }
              console.log(itemList)
              var itemDoneList = []

              if (dataList[i].marks) {
                var markItem = dataList[i].marks;
                for (var j = 0; j < markItem.length; j++) {
                  itemDoneList.push(markItem[j].itemname)
                }
              }
              if ((itemList.length - itemDoneList.length) == 0) {
                var newObj = {
                  chestno: dataList[i].chessno[0],
                  itemnameRegistered: itemList,
                  itemnameDone: itemDoneList,
                  doneCount: itemDoneList.length,
                  remainingCount: (itemList.length - itemDoneList.length),
                  eCompleted: "Evaluation Completed",
                }
              } else {
                if (dataList[i].attendedEventStatus) {
                  var newObj = {
                    chestno: dataList[i].chessno[0],
                    itemnameRegistered: itemList,
                    itemnameDone: itemDoneList,
                    doneCount: itemDoneList.length,
                    remainingCount: (itemList.length - itemDoneList.length),
                    attendEventStatus: "yes",

                  }
                } else {
                  var newObj = {
                    chestno: dataList[i].chessno[0],
                    itemnameRegistered: itemList,
                    itemnameDone: itemDoneList,
                    doneCount: itemDoneList.length,
                    remainingCount: (itemList.length - itemDoneList.length),

                  }
                }
              }


              newList.push(newObj)
              console.log(newList)
            }
            var disable_chest = "yes"
            var Err = "Evaluation already done"
            var newListLength = newList.length;
            var count = 0
            for (var i = 0; i < newList.length; i++) {
              if (newList[i].eCompleted) {
                count = count + 1
              }
            }
            console.log(count)
            var percent = (count / newListLength) * 100
            console.log(percent)
            var remaining = newListLength - count
            res.render('judge/judge', { Err, disable_chest,itemList, newList, newListLength, remaining,percent });
          })

        } else {
          judgeFunctions.addMarks(chestno, req.body, userGS, item_type, item_subtype).then((data) => {
            judgeFunctions.pushItemPostions(req.body).then((d) => {
              if (data) {
                var disable_chest = "yes"
                var done = "Evaluation Completed"
                judgeFunctions.getWinnerData(chestno).then((winner_d) => {
                  console.log("----------------------------------------------")
                  var winnerDescription = winner_d.description
                  judgeFunctions.checkUserChest(chestno).then((registerDetails) => {

                    var descriptionList = []
                    var descriptionString = '';
                    var prizeString = '';

                    var mark_List = registerDetails.marks
                    console.log("its here")
                    console.log(mark_List)
                    for (var i = 0; i < mark_List.length; i++) {

                      var _item_name = mark_List[i].itemname
                      var _item_gs = mark_List[i].grouporsolo
                      var _item_mark = mark_List[i].mark
                      if (_item_mark == 10 && _item_gs == 'group') {
                        prizeString = "First Prize"
                      }
                      if (_item_mark == 5 && _item_gs == 'group') {
                        prizeString = "Second Prize"
                      }
                      if (_item_mark == 3 && _item_gs == 'group') {
                        prizeString = "Third Prize"
                      }


                      if (_item_mark == 5 && _item_gs == 'solo') {
                        prizeString = "First"
                      }
                      if (_item_mark == 3 && _item_gs == 'solo') {
                        prizeString = "Second"
                      }
                      if (_item_mark == 1 && _item_gs == 'solo') {
                        prizeString = "Third"
                      }
                      console.log(prizeString)
                      descriptionString = prizeString + " prize in " + _item_name
                      console.log(descriptionString)
                      descriptionList.push(descriptionString)

                    }
                    console.log(descriptionList)
                    var finalString = descriptionList.join()
                    console.log(finalString)
                    judgeFunctions.pushWinnerDescription(chestno, finalString).then((data) => {
                      console.log(data)
                      console.log("updated winner description")
                    })

                  })

                })


                eventFunctions.getAllRegisteredDetails().then((dataList) => {
                  var newList = []
                  var itemList = [];
                  console.log(dataList)
                  for (var i = 0; i < dataList.length; i++) {

                    if (Array.isArray(dataList[i].itemname) == false) {

                      itemList.push(dataList[i].itemname)
                    } else {
                      itemList = dataList[i].itemname
                    }
                    console.log(itemList)

                    var itemDoneList = []
                    if (dataList[i].marks) {
                      var markItem = dataList[i].marks;
                      for (var j = 0; j < markItem.length; j++) {
                        itemDoneList.push(markItem[j].itemname)
                      }
                    }


                    if ((itemList.length - itemDoneList.length) == 0) {
                      var newObj = {
                        chestno: dataList[i].chessno[0],
                        itemnameRegistered: itemList,
                        itemnameDone: itemDoneList,
                        doneCount: itemDoneList.length,
                        remainingCount: (itemList.length - itemDoneList.length),
                        eCompleted: "Evaluation Completed",
                      }
                    } else {
                      if (dataList[i].attendedEventStatus) {
                        var newObj = {
                          chestno: dataList[i].chessno[0],
                          itemnameRegistered: itemList,
                          itemnameDone: itemDoneList,
                          doneCount: itemDoneList.length,
                          remainingCount: (itemList.length - itemDoneList.length),
                          attendEventStatus: "yes",

                        }
                      } else {
                        var newObj = {
                          chestno: dataList[i].chessno[0],
                          itemnameRegistered: itemList,
                          itemnameDone: itemDoneList,
                          doneCount: itemDoneList.length,
                          remainingCount: (itemList.length - itemDoneList.length),

                        }
                      }
                    }


                    newList.push(newObj)
                    console.log(newList)
                  }
                  var newListLength = newList.length;
                  var count = 0
                  for (var i = 0; i < newList.length; i++) {
                    if (newList[i].eCompleted) {
                      count = count + 1
                    }
                  }
                  console.log(count)
                  var percent = (count / newListLength) * 100
                  console.log(percent)
                  var remaining = newListLength - count

                  res.render('judge/judge', { done, disable_chest,itemList, newList, newListLength, remaining,percent });
                })

              }
            })


          })
        }
      } else {

        judgeFunctions.addMarks(chestno, req.body, userGS, item_type, item_subtype).then((data) => {

          judgeFunctions.pushItemPostions(req.body).then((da) => {

            if (data) {
              var disable_chest = "yes"
              var done = "Evaluation Completed"

              eventFunctions.getAllRegisteredDetails().then((dataList) => {
                var newList = []
                var itemList = [];
                console.log(dataList)
                for (var i = 0; i < dataList.length; i++) {

                  if (Array.isArray(dataList[i].itemname) == false) {

                    itemList.push(dataList[i].itemname)
                  } else {
                    itemList = dataList[i].itemname
                  }
                  console.log(itemList)

                  var itemDoneList = []
                  if (dataList[i].marks) {
                    var markItem = dataList[i].marks;
                    for (var j = 0; j < markItem.length; j++) {
                      itemDoneList.push(markItem[j].itemname)
                    }
                  }


                  if ((itemList.length - itemDoneList.length) == 0) {
                    var newObj = {
                      chestno: dataList[i].chessno[0],
                      itemnameRegistered: itemList,
                      itemnameDone: itemDoneList,
                      doneCount: itemDoneList.length,
                      remainingCount: (itemList.length - itemDoneList.length),
                      eCompleted: "Evaluation Completed",
                    }
                  } else {
                    if (dataList[i].attendedEventStatus) {
                      var newObj = {
                        chestno: dataList[i].chessno[0],
                        itemnameRegistered: itemList,
                        itemnameDone: itemDoneList,
                        doneCount: itemDoneList.length,
                        remainingCount: (itemList.length - itemDoneList.length),
                        attendEventStatus: "yes",

                      }
                    } else {
                      var newObj = {
                        chestno: dataList[i].chessno[0],
                        itemnameRegistered: itemList,
                        itemnameDone: itemDoneList,
                        doneCount: itemDoneList.length,
                        remainingCount: (itemList.length - itemDoneList.length),

                      }
                    }
                  }


                  newList.push(newObj)
                  console.log(newList)
                }
                var newListLength = newList.length;
                var count = 0
                for (var i = 0; i < newList.length; i++) {
                  if (newList[i].eCompleted) {
                    count = count + 1
                  }
                }
                console.log(count)
                var percent = (count / newListLength) * 100
                console.log(percent)
                var remaining = newListLength - count

                res.render('judge/judge', { done, disable_chest,itemList, newList, newListLength, remaining,percent});
              })


              judgeFunctions.checkUserChest(chestno).then((registeredData) => {
                var descriptionList = []
                var descriptionString = '';
                var prizeString = '';

                var mark_List = registeredData.marks
                console.log("its here")
                console.log(mark_List)
                for (var i = 0; i < mark_List.length; i++) {
                  var _item_name = mark_List[i].itemname
                  var _item_gs = mark_List[i].grouporsolo
                  var _item_mark = mark_List[i].mark
                  if (_item_mark == 10 && _item_gs == 'group') {
                    prizeString = "First Prize"
                  }
                  if (_item_mark == 5 && _item_gs == 'group') {
                    prizeString = "Second Prize"
                  }
                  if (_item_mark == 3 && _item_gs == 'group') {
                    prizeString = "Third Prize"
                  }


                  if (_item_mark == 5 && _item_gs == 'solo') {
                    prizeString = "First"
                  }
                  if (_item_mark == 3 && _item_gs == 'solo') {
                    prizeString = "Second"
                  }
                  if (_item_mark == 1 && _item_gs == 'solo') {
                    prizeString = "Third"
                  }
                  console.log(prizeString)
                  descriptionString = prizeString + " prize in " + _item_name
                  console.log(descriptionString)
                  descriptionList.push(descriptionString)

                }
                console.log(descriptionList)


                console.log(descriptionList[0])

                var winner_Obj = {
                  "name": registeredData.name,
                  "email": registeredData.email,
                  "department": registeredData.department,
                  "semester": registeredData.semester,
                  "chessno": chestno,
                  "image_": "pending",
                  "description": descriptionList[0],
                }

                eventFunctions.addWinner(winner_Obj).then((_data__) => {

                  if (_data__) {
                    console.log("new winner added to winner collection but photo is not uploaded")
                  }
                })

              })


            }

          })


        })
      }




    })


  }
})



module.exports = router;
