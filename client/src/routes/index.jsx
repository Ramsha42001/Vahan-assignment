import React from 'react';
import { Outlet, useRoutes } from 'react-router-dom';
import Home from '../views/Home.jsx'; // Import the Home component

const AppRoute = () => {
  let element = useRoutes([
    {
      path: '/',
      element: <Outlet />, // Use Outlet to render child routes
      children: [
        { path: '/', element: <Home /> }, // Add route for Home
      ]
    },
  ]);
   
  return element;
};

export default AppRoute;