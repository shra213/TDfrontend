import React, { Suspense } from 'react';

import { useEffect, useState } from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { useFriendsStore } from './stores/friendsStore'; // Zustand store

const GamePage = React.lazy(() => import('./components/Game'));
const Home = React.lazy(() => import('./components/Bottle3D'));
const Signup = React.lazy(() => import('./components/Signup'));
const Login = React.lazy(() => import('./components/LoginPage'));
const Otp = React.lazy(() => import('./components/Otp'));
const PartyBackground = React.lazy(() => import('./pages/PartyBackground'));
import Navbar from './components/Navbar';
import Nav from './pages/Nav';
// const Nav = React.lazy(() => import('./pages/Nav'));
const TruthDare = React.lazy(() => import('./components/TruthDare'));
const AvailableRooms = React.lazy(() => import('./components/AvailableRooms'));

import './App.css';

function App() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const showNavbar = !(
    ["/login", "/signup", "/", "/verify-otp", "/404"].includes(location.pathname) ||
    location.pathname.startsWith("/game/")
  );


  // Zustand actions
  const initFriendsListener = useFriendsStore((state) => state.initFriendsListener);
  const clearFriends = useFriendsStore((state) => state.clearFriends);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        initFriendsListener(currentUser.uid); // start listener
      } else {
        clearFriends(); // clear state on logout
      }
    });

    return () => unsubAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Helper to protect routes
  const ProtectedRoute = ({ children }: { children: any }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  return (
    <>
      {showNavbar && <Navbar />}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<Otp />} />

          {/* Protected routes */}
          <Route
            path="/front"
            element={<ProtectedRoute><PartyBackground /></ProtectedRoute>}
          />
          <Route
            path="/create-room"
            element={<ProtectedRoute><Nav /></ProtectedRoute>}
          />
          <Route
            path="/friends"
            element={<ProtectedRoute><Nav /></ProtectedRoute>}
          />
          <Route
            path="/groups"
            element={<ProtectedRoute><Nav /></ProtectedRoute>}
          />
          <Route path="/rooms" element={<AvailableRooms />} />

          <Route
            path="/addFrnds"
            element={<ProtectedRoute><Nav /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Nav /></ProtectedRoute>}
          />
          <Route
            path="/game/:roomId"
            element={<ProtectedRoute><GamePage /></ProtectedRoute>}
          />
          <Route
            path="/pending-requests"
            element={<ProtectedRoute><Nav /></ProtectedRoute>}
          />
          <Route
            path="/test"
            element={<ProtectedRoute><TruthDare /></ProtectedRoute>}
          />

          {/* Error */}
          {/* <Route path="/404" element={<Error404 />} /> */}

          {/* Catch-all redirect to 404 */}
          <Route path="*" element={<Navigate to="/404" />} />

        </Routes >
      </Suspense>
    </>
  );
}

export default App;
