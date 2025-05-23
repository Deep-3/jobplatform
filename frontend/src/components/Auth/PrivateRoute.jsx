import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {

    const {User} = useSelector((state) => state.auth);

    if(User !== null)
        return children
    else
        return <Navigate to="/login" />

}

export default PrivateRoute