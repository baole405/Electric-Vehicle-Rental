import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/home/home';
import About from '../pages/static/about';
import { ROUTES } from './route.constants';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<Home />} />
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};
