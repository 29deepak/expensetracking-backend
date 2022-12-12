const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var cors=require('cors')
const sequelize = require('./util/database');
const User = require('./models/users');
const app = express();
app.use(cors())
app.use(bodyParser.json());
function isstringinvalid(string){
    if(string==undefined || string.length==0){
        return true
    }else{
        return false
    }
}
app.post('/user/signup',async(req,res,next)=>{
    console.log(req.body)
    const {name,email,password} = req.body
    if(isstringinvalid(name) || isstringinvalid(email) || isstringinvalid(password)){
        res.status(400).json({err:'bad parameter....something went wrong'})
    }
    const user=await User.create({name,email,password})
    .then(()=>{
        res.status(201).json({message:'succesfully create new user'})
    })
    .catch((err)=>{
        res.status(500).json(err)
    })
})
app.get('/user/getelement',async(req,res,next)=>{
    User.findAll()
    .then(
        data=>{
            res.json(data)
        }
    )
    
   
})

sequelize
  .sync()
  .then(result => {
   console.log(result)
   app.listen(4000)
  })
  .catch((err)=>{
    console.log(err)
  })