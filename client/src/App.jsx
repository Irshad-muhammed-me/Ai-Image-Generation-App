import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

import {logo} from './assets';
import { Home, CreatePost } from './pages';



const App = () => {
  return (
    <BrowserRouter>
      <header className="w-full flex justify-between items-center bg-[#000208] sm:px-8 px-5 py-4 border-b border-b-[#fdfeff]">
        <Link to="/">
          <img src={logo} alt="logo" className="w-50 object-contain" />
        </Link>

        <Link
          to="/create-post"
          className="font-inter font-medium bg-[#ffffff] text-shadow-2xs px-4 py-2 rounded-md hover:scale-105 transition duration-500"
        >
          Create
        </Link>
      </header>
      <main className="sm:p-8 px-4 py-8 w-full bg-[#000208] min-h-[calc(100vh-73px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-post" element={<CreatePost />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App