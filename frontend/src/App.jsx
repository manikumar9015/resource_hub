// frontend/src/App.jsx
import React, { useState, useContext } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import All Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UploadPage from "./pages/UploadPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import MyBookmarksPage from "./pages/MyBookmarksPage";
import MyUploadsPage from "./pages/MyUploadsPage";
import FacultyDashboardPage from "./pages/FacultyDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import QuizPage from './pages/QuizPage';

import { FiSearch } from "react-icons/fi";

function App() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="bg-black p-4 shadow-md sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 flex-shrink-0">
            DocuMentor AI
          </Link>

          {/* --- SEARCH BAR --- */}
          <div className="flex-grow max-w-xl mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              {/* Updated input with pill shape and seamless background */}
              <input
                type="text"
                placeholder="Search by title or subject code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black text-white px-5 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-white transition-colors duration-300 pr-10"
              />
              {/* Adjusted icon position for pill shape */}
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer" aria-label="Search">
                <FiSearch />
              </button>
            </form>
          </div>

          <div className="flex space-x-4 items-center flex-shrink-0">
            <Link to="/" className="hover:text-gray-300 text-sm cursor-pointer">Home</Link>
            {user ? (
              <>
                {user.role === 'Admin' && (
                  <Link to="/admin-dashboard" className="text-sm font-semibold text-white hover:text-gray-300 cursor-pointer">
                    Admin
                  </Link>
                )}
                {(user.role === 'Faculty' || user.role === 'Admin') && (
                  <Link to="/faculty-dashboard" className="text-sm font-semibold text-white hover:text-gray-300 cursor-pointer">
                    Dashboard
                  </Link>
                )}

                <Link to="/my-bookmarks" className="hover:text-gray-300 text-sm cursor-pointer">My Bookmarks</Link>
                <Link to="/my-uploads" className="hover:text-gray-300 text-sm cursor-pointer">My Uploads</Link>
                
                <span className="font-semibold text-gray-400 text-sm hidden md:block">
                  Welcome, {user.name}!
                </span>
                <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md text-sm font-medium cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-300 text-sm cursor-pointer">Login</Link>
                <Link to="/register" className="bg-white text-black hover:bg-gray-200 px-3 py-1 rounded-md text-sm font-medium cursor-pointer">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/resource/:resourceId" element={<ResourceDetailPage />} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/chat/:resourceId" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
          <Route path="/my-bookmarks" element={<ProtectedRoute><MyBookmarksPage /></ProtectedRoute>} />
          <Route path="/my-uploads" element={<ProtectedRoute><MyUploadsPage /></ProtectedRoute>} />
          <Route path="/faculty-dashboard" element={<ProtectedRoute><FacultyDashboardPage /></ProtectedRoute>} />
          <Route path="/quiz/:resourceId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;