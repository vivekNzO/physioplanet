import { useAuth } from '@/context/AuthContext';
import React from 'react'
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const {logout} = useAuth();
  return (
    <div className='px-[40px] py-[14px] flex justify-between items-center'>
        <div onClick={()=>navigate("/")}>
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/435986e1ad6235e7d271e91178b87b2f2a53f084?width=576" alt="Logo"/>
        </div>
        <div className='flex gap-[15px] font-medium items-center justify-center'>
            <p className='cursor-pointer hover:text-blue-600 transition-colors' onClick={() => navigate("/reception-dashboard")}>DASHBOARD</p>
            <p>ACCOUNT</p>
            <img className='cursor-pointer' onClick={() => logout()} src='/turnOff.png'/>
        </div>
    </div>
  )
}

export default Navbar