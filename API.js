/*
[[[[[[[[[[[[[[ READ THE INSTRUCTIONS AND GO TO THE .ENV FILE ]]]]]]]]]]]]]]

[[[[[[[[[[[[[[ DON'T EDIT THIS FILE IF YOU DON'T KNOW WHAT YOU ARE DOING ]]]]]]]]]]]]]]

*/

const express = require("express")
const bodyParser = require("body-parser")
const fetch = require("node-fetch")
const app = express()
require("dotenv")
var session = require('express-session')
const { login, rank, logger, getRank, errorlogger } = require("./recources/connect")

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(session({
  secret: '1048928349387573',
  resave: false,
  saveUninitialized: false,
  expires: 600000,
}));


app.post("/rankUser", async(req, res) => {
  const headers = req.headers
  const body = req.body
  const params = req.params
  var oldRank

  console.log(body)
  
  if(!body["key"]){
    return res.status(404).json({ code: 0, message: "Not found." });

  }

  var Response = await fetch(`https://groups.roblox.com/v2/users/${Number(body.rankInfo.targetId)}/groups/roles?groupid=${Number(body.rankInfo.groupId)}`, {
    method: "get",
    headers: {     
      'Content-Type': 'application/json', 
    }
  }).then(res => res.json())

  if(Response.data){
  Response.data.forEach(async group => {
    if(group.group.id == body.rankInfo.groupId){
      Response = group.role


      


      if(Response.rank == body.rankInfo.rankNumber){
        if(process.env.Webhook_Url){
        errorlogger("The user is already in this rank.", process.env.Webhook_Url)
        }
      return res.status(400).json({ code: 3, message: "The user is already in this rank." });
      }else{

      oldRank = Response


    
  if(body["key"] && body["key"] !== process.env.AUTH_TOKEN){
    return res.status(401).json({ code: 1, message: "Unauthorized request." });
  }else{
    if(req.session && !req.session.xcsrf_token){
      
      await login(process.env.COOKIE, req.session, res).then(async function(response){
        
      await rank(body.rankInfo.targetId, body.rankInfo.rankNumber, body.rankInfo.groupId, process.env.COOKIE, req.session, res).then(async function (response) {

        if(response == 0) {
          if(process.env.Webhook_Url){
          errorlogger(`The requested rank doesn't exists. (Rank: ${body.rankInfo.rankNumber})`, process.env.Webhook_Url)
          }
          return res.status(400).json({ code: 6, message: "The rank doesn't exists." });
        }
        

setTimeout(async() => {
  
          var Response = await fetch(`https://groups.roblox.com/v2/users/${Number(body.rankInfo.targetId)}/groups/roles?groupid=${Number(params.group)}`, {
    method: "get",
    headers: {     
      'Content-Type': 'application/json', 
    }
  }).then(res => res.json())

  if(Response.data){
  Response.data.forEach(async group => {
    
    if(group.group.id == body.rankInfo.groupId){

        console.log(group.role.rank + ", " + body.rankInfo.rankNumber)

        
        if(group.role.rank == body.rankInfo.rankNumber){
         res.status(200).json({ code: 200, message: "Rank claimed." });

        if(process.env.Webhook_Url){
          logger(body.rankInfo.targetId, process.env.Webhook_Url, body.rankInfo.groupId, oldRank)
         }
        }else{
           console.log("The server returned an error please contact our support team.")
        }
        
    }
    })
  }
}, 5000);
       })

    })
   }
  }
  
      }
    }
  })

  }
        
})


app.use(function(req, res, next) {
  if(res.status(404)) {
    return res.json({ code: 0, message: "Not found." });
  }
});

app.listen(2022, function() {
  console.log("API is listening on port 2022")
})
