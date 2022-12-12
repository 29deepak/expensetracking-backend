const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var cors=require('cors')
const sequelize = require('./util/database');
const User = require('./models/users');
const { truncateSync } = require('fs');
const { where } = require('sequelize');
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
    try{
    console.log(req.body)
    const {name,email,password} = req.body
    if(isstringinvalid(name) || isstringinvalid(email) || isstringinvalid(password)){
        res.status(400).json({err:'bad parameter....something went wrong'})
    }
    const user=await User.create({name,email,password})
        res.status(201).json({message:'succesfully create new user'})

}
    catch{(err)=>{
        res.status(500).json(err)
    }}
})
// app.get('/user/getelement',async(req,res,next)=>{
//     User.findAll()
//     .then(
//         data=>{
//             res.json(data)
//         }
//     )
    
   
// })
app.post('/user/login',async(req,res,next)=>{
    try{
    const{email,password}=req.body;
    console.log(password)
    if(isstringinvalid(email) || isstringinvalid(password)){
        res.status(400).json({message:'email or password is missing',success:false})
    }
    const user=await User.findAll({where:{email}})
        if(user.length>0){
            if(user[0].password==password){
                res.status(200).json({success:true,message:'user logged in successfully'})
            }else{
                return res.status(400).json({success:false,message:'password is incorrect'})
            }

        }else{
            return res.status(404).json({success:false,message:'user doesnot exist'})
        }
    
   } catch{err=>{
        res.status(500).json({message:err,success:false})
    }}
})
// app.get('/user/getelement',async(req,res)=>{
//     User.findAll({where:5}).then(user=>{
//         console.log(user)
//         const name="ghgf"
//         // res.json(user)
//     //    if(user[0].name===name){
//     //     res.json({success:true})
//     //    }
//     console.log(user[0].id)
//         if(user[0].name===name){
//             // console.log('true')
//             res.json({name})
//         }
//     })
// })
sequelize
  .sync()
  .then(result => {
   console.log(result)
   app.listen(4000)
  })
  .catch((err)=>{
    console.log(err)
  })