/*
[[[[[[[[[[[[[[ READ THE INSTRUCTIONS AND GO TO THE .ENV FILE ]]]]]]]]]]]]]]

[[[[[[[[[[[[[[ DON'T EDIT THIS FILE IF YOU DON'T KNOW WHAT YOU ARE DOING ]]]]]]]]]]]]]]

*/

const fetch = require('node-fetch');
const { EmbedBuilder, WebhookClient } = require("discord.js")


getRank = async function(group, user){
var promise = new Promise(async function(resolve, reject) {  
  var Response = await fetch(`https://groups.roblox.com/v2/users/${Number(user)}/groups/roles?groupid=${Number(group)}`, {
    method: "get",
    headers: {     
      'Content-Type': 'application/json', 
    }
  }).then(res => res.json())

  if(Response.data){
  Response.data.forEach(async group => {
    if(group.group.id == group){
      resolve(group.role)
    }
    })
  }                                                   
})
return promise;
}

async function login(cookie, session, res){
await fetch("https://auth.roblox.com", {
    method: "post",
    headers: { Cookie: `.ROBLOSECURITY=${cookie};`, "Content-Type": "application/json" }
}).then(async function (res) {
const csrf = res.headers.get("x-csrf-token")
  
if(csrf && res.status === 403){
 session.csrf = csrf
 return csrf; 
}else{
  if(process.env.Webhook_Url){
  errorlogger(`I feel like someone needs to renew his cookie... (Rank: ${rank})`, process.env.Webhook_Url)
  }
  return res.status(300).json({ code: 2, message: "I feel like someone needs to renew his cookie..." });


}
}).catch(async function(err) {
  console.log(err)
  throw new Error(err)
})
}


async function rank(userid, rank, groupid, cookie, session, res){

  var Response = await fetch(`https://groups.roblox.com/v2/users/${Number(userid)}/groups/roles?groupid=${Number(groupid)}`, {
    method: "get",
    headers: {     
      'Content-Type': 'application/json', 
    }
  }).then(res => res.json())


 var ranks = []

  
const res1 = await fetch("https://groups.roblox.com/v1/groups/" + groupid + "/roles", {
  method: "GET",
  headers: { 
    'Content-Type': 'application/json', 
  }
}).then(res => res.json())
res1.roles.forEach(async function(role){
ranks.push(role.rank)
  
if (!ranks.includes(rank) && role.rank == 255){

  if(process.env.Webhook_Url){
  errorlogger(`The requested rank doesn't exists. (Rank: ${rank})`, process.env.Webhook_Url)
  }
  return res.status(400).json({ code: 6, message: "The rank doesn't exists." });
  
  
  //throw new Error(rank + " is not a valid rank within the group.")
}
  
if(rank == role.rank){
  console.log(role)
  const data = JSON.stringify({ roleId: Number(role.id) })
  
  
console.log(data)
await  fetch(`https://groups.roblox.com/v1/groups/${groupid}/users/${userid}`, {
  method: "PATCH", 
  body: data,
  headers: { 
    'Content-Type': 'application/json', 
    "X-CSRF-TOKEN": session.csrf,
    Cookie: `.ROBLOSECURITY=${cookie};`,
 
  }
}).then(async function (res) {
  console.log(res)
if(res.status !== 200){
  console.log(res.statusText)

  if(process.env.Webhook_Url){
  errorlogger(`Error while ranking. (Rank: ${rank})`, process.env.Webhook_Url)
  }
  return res.status(300).json({ code: 2, message: "I had internal issues to complete the order.." });


  
}else if(res.status === 200){

  return res.statusText;
 }
}).catch(async function(err) {
  new Error(err)
})



}
})


}

async function logger(userid, webhook, groupid, oldRank){ 


  var Response = await fetch(`https://groups.roblox.com/v2/users/${Number(userid)}/groups/roles?groupid=${Number(groupid)}`, {
    method: "get",
    headers: {     
      'Content-Type': 'application/json', 
    }
  }).then(res => res.json())

  if(Response.data){
  Response.data.forEach(async group => {
    if(group.group.id == groupid){
      Response = group.role
      console.log(Response)

const webhookClient = new WebhookClient({ url: webhook });


  
  const username = await fetch("https://users.roblox.com/v1/users/" + userid).then(res => res.json());

    const thumb = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userid}&size=180x180&format=Png&isCircular=false`).then(res => res.json())
    



const embed = new EmbedBuilder()
.setTitle("Rank Claimed Successfully")
.setDescription(`${username.name} was ranked!`)
.addFields(
  { name: "New Rank (``" + Response.rank +"``)", value: Response.name, inline: false },
  { name: "Old Rank (``" + oldRank.rank +"``)", value: oldRank.name, inline: false}
)

.setThumbnail(thumb.data[0].imageUrl)
.setColor(0x32CD32)

webhookClient.send({
	embeds: [embed],
});

    }
  })
  }
}


async function errorlogger(err, webhook){ 
const webhookClient = new WebhookClient({ url: webhook });


  
const embed = new EmbedBuilder()
.setTitle("Rank Claim Failed")
.setDescription("Error: " + err)
.setColor(0xFF5733)
webhookClient.send({
	embeds: [embed],
});
}


module.exports.login = login;
module.exports.rank = rank;
module.exports.errorlogger = errorlogger;
module.exports.logger = logger;
module.exports.getRank = getRank
