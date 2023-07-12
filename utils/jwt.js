const jwt= require('jsonwebtoken')
require('dotenv').config()
const {StatusCodes}=require('http-status-codes')

const createJWT=({payload})=>{
    const token= jwt.sign(
        payload,
        process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_LIFETIME
    })
    return token
}

const isTokenValid=(token)=>{
  return  jwt.verify(token,process.env.JWT_SECRET)
}


module.exports={
    createJWT,isTokenValid
}