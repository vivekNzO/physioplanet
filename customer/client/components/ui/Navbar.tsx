import React from 'react'

function Navbar() {
  return (
    <div className='px-40 py-14 flex justify-between items-center'>
        <div>
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/435986e1ad6235e7d271e91178b87b2f2a53f084?width=576" alt="Logo"/>
        </div>
        <div>
            <p>ACCOUNT</p>
            <img src='/turnOff.png'/>
        </div>
    </div>
  )
}

export default Navbar