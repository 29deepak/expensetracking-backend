const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var cors=require('cors')
const sequelize = require('./util/database');
const User = require('./models/users');
const Expense=require('./models/expenses')
const bcrypt=require('bcrypt')
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
    const saltrounds=10
    bcrypt.hash(password,saltrounds,async(err,hash)=>{
        await User.create({name,email,password:hash})
        res.status(201).json({message:'succesfully create new user'})
    })


}
    catch{(err)=>{
        res.status(500).json(err)
    }}
})

app.post('/user/login',async(req,res,next)=>{
    try{
    const{email,password}=req.body;
    console.log(password)
    if(isstringinvalid(email) || isstringinvalid(password)){
        res.status(400).json({message:'email or password is missing',success:false})
    }
    const user=await User.findAll({where:{email}})
        if(user.length>0){
            bcrypt.compare(password,user[0].password,(err,result)=>{
                if(err){
                    throw new Error('something went wrong')
                }
                if(result===true){
                    res.status(200).json({success:true,message:'user logged in successfully'})
                }else{
                    return res.status(400).json({success:false,message:'password is incorrect'})
                }
            })

        }else{
            return res.status(404).json({success:false,message:'user doesnot exist'})
        }
    
   } catch{err=>{
        res.status(500).json({message:err,success:false})
    }}
})

app.post('/expense/addexpense',async(req,res,next)=>{
    try{
    const{expenseamount,description,category}=req.body;
    if(isstringinvalid(expenseamount) || isstringinvalid(description) || isstringinvalid(category)){
        return res.status(400).json({success:false,message:'parameter is missing'})
    }
    await Expense.create({expenseamount,description,category})
    .then(expense=>{
        return res.status(201).json({expense,success:true})
    })
}
    catch{err=>{
        return res.status(500).json({success:false,error:err})
    }
}

})
app.get('/expense/getexpenses',async(req,res,next)=>{
    Expense.findAll().then(expenses=>{
        res.status(200).json({expenses,success:true})
    })
    .catch(err=>{
        res.status(500).json({error:err,success:false})
    })
})
app.delete('/expense/deleteexpense/:expenseid',async(req,res,next)=>{
    const expenseid=req.params.expenseid;
    if(isstringinvalid(expenseid)){
       return res.status(400).json({success:false,message:'bad parameter'})
    }
    Expense.destroy({where:{id:expenseid}}).then(()=>{
        return res.status(200).json({success:true,message:'Deleted successfully'})
    })
    .catch(err=>{
        return res.status(500).json({success:false,message:"failed"})
    })
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