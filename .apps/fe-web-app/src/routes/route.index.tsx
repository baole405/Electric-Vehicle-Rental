import Home from '@/pages/home/home';
import About from '@/pages/static/about';
import ListVehiclesPage from '@/pages/vehicles/list-vehicles';
import { ROUTES } from '@/routes/route.constants';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<Home />} />
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path={ROUTES.VEHICLE} element={<ListVehiclesPage />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}
