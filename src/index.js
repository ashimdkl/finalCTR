import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import DeveloperDocs from './DeveloperDocs';
import Tutorial from './Tutorial';
import AutoEST from './AutoEST';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/developer-docs",
    element: <DeveloperDocs />,
  },
  {
    path: "/tutorial",
    element: <Tutorial />,
  },
  {
    path: "/AutoEST",
    element: <AutoEST />,
  },

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
