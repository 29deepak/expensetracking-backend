const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
var cors=require('cors')
const sequelize = require('./util/database');
const User = require('./models/users');
const Expense=require('./models/expenses');
const auth=require('./middleware/auth');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const Razorpay=require('razorpay')
const Order=require('./models/orders')
const app = express();
app.use(cors())
app.use(bodyParser.json());
User.hasMany(Expense)
Expense.belongsTo(User)

User.hasMany(Order)
Order.belongsTo(User)
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
function generateAccessToken(id,name){
    return jwt.sign({userId:id,name:name},'secretkeyorbiggervalue')

}
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
                    res.status(200).json({success:true,message:'user logged in successfully',token:generateAccessToken(user[0].id,user[0].name)})
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

app.post('/expense/addexpense',auth,async(req,res,next)=>{
    try{
    const{expenseamount,description,category}=req.body;
    if(isstringinvalid(expenseamount) || isstringinvalid(description) || isstringinvalid(category)){
        return res.status(400).json({success:false,message:'parameter is missing'})
    }
    // req.user.createExpense({expenseamount,description,category})
    await Expense.create({expenseamount,description,category,userId:req.user.id})
    .then(expense=>{
        return res.status(201).json({expense,success:true})
    })
}
    catch{err=>{
        return res.status(500).json({success:false,error:err})
    }
}

})
app.get('/expense/getexpenses',auth,async(req,res,next)=>{
    // req.user.getExpenses().then(result=>{
    //     console.log(result)
    // })
    Expense.findAll({where:{userId:req.user.id}}).then(expenses=>{
        res.status(200).json({expenses,success:true})
    })
    .catch(err=>{
        res.status(500).json({error:err,success:false})
    })
})
app.delete('/expense/deleteexpense/:expenseid',auth,async(req,res,next)=>{
    const expenseid=req.params.expenseid;
    if(isstringinvalid(expenseid)){
       return res.status(400).json({success:false,message:'bad parameter'})
    }
    Expense.destroy({where:{id:expenseid,userId:req.user.id}}).then((noofrows)=>{
        if(noofrows===0){
            return res.status(400).json({success:false,message:'user doesnot belong to their expenses'})
        }
        return res.status(200).json({success:true,message:'Deleted successfully'})
    })
    .catch(err=>{
        return res.status(500).json({success:false,message:"failed"})
    })
})
app.get('/purchase/premiummembership',auth,async(req,res)=>{
    try{
    var rzp = new Razorpay({
        key_id:process.env.RAZORPAY_KEY_ID,
        key_secret:process.env.RAZORPAY_KEY_SECRET
    })
    const amount=2500;
    rzp.orders.create({amount,currency:"INR"},(err,order)=>{
        if(err){
            throw new Error(JSON.stringify(err));
        }
        req.user.createOrder({orderid:order.id,status:'PENDING'}).then(()=>{
            return res.json({order,key_id:rzp.key_id});
        }).catch(err=>{
            throw new Error(err)
        })
    })
}catch{
    console.log(err)
    res.status(500).json({message:'something went wrong',error:err})
}

})
app.post('/purchase/updatetransactionstatus',auth,async(req,res,next)=>{
    try{
    const{payment_id,order_id}=req.body;
    const order = Order.findOne({where:{orderid:order_id}})
    const promise1= order.update({paymentid:payment_id,status:'SUCCESSFULL'})
    const promise2= req.user.update({ispremiumuser:true})
    Promise.all([promise1,promise2]).then(()=>{
       return res.status(202).json({success:true,message:"Transaction Successful"})
    }).catch((err)=>{
        throw new Error(err)
    })
    
            
        
    
}catch{
    res.status(500).json({message:'something went wrong',error:err})
}
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