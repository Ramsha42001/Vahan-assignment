import React from 'react';
import { Outlet, useRoutes } from 'react-router-dom';

import AuthRoute from './userPage/index.jsx';
import Home from '../views/Home.jsx';
import Metrics from '../views/Metrics.jsx';
import Login from '../views/Login.jsx'
import Signup from '../views/Signup.jsx'
import Sidebar from '../components/sidebar.jsx';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full">
      <Sidebar 
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateNewSession={() => {}}
        onLogout={() => {}}
      />
      <div className="flex-1 w-full">
        <Outlet />
      </div>
    </div>
  );
};

const AppRoute = () => {
  let element = useRoutes([
    {
      path: '/',
      element: <Login />
    },
    {
      path: '/signup',
      element: <Signup />
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: 'user/*', element: <AuthRoute /> },
        { path: 'metrics', element: <Metrics /> }
      ]
    }
  ]);
   
  return element;
};

export default AppRoute;