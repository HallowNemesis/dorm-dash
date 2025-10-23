import React, { useState } from 'react'
import './Login.css'
import { Inputs } from '../Inputs'
export const Login = () => {
  return (
    <div className='container'>
        <Inputs/>
       <div className='forgot-password'>Forgot password? <span>Click here</span></div>
        
        <div className='submit-container'>
             <div className='submit'>Sign Up</div>
             <div className='submit'>Login</div>
        </div>
    </div>
  )
}
