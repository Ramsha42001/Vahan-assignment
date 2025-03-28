import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Home from '../../views/Home.jsx'
import Documents from '../../views/Document.jsx'
const AuthRoute=()=>{
    return(
        <Routes>
            <Route path="home" element={<Home />} />
            <Route path="document" element={<Documents />} />
        </Routes>
    )

}

export default AuthRoute;