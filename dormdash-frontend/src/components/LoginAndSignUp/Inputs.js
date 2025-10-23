import React from 'react'
import './Inputs.css'
export const Inputs = () => {
  return (
    <div>
        <header>
            <text>Login</text>
            <div className='underline'></div>
        </header>
        <div className='inputs'>
            <div className='inputborder'>
                <input type='email'placeholder='email@university.edu'>
                </input>
            </div>
            <div className='inputborder'>
                <input type='password' >
                </input>
            </div>
        </div>
    </div>
  )
}
