import React from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
function RefreshHandler({setIsAuthenticated}) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
     setIsAuthenticated(true)
     if(location.pathname==='/'||location.pathname ==='/login' || location.pathname==='/signup'){
        navigate('/home',{replace:false})
     }
    }
  },[location,navigate,setIsAuthenticated]);
  return null;
}

export default RefreshHandler