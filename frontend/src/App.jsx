import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import OwnerLayout from './layouts/OwnerLayout';

// Public Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected User Pages
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import BookingsPage from './pages/BookingsPage';
import ProtectedRoute from './components/ProtectedRoute';

// Protected Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddPropertyPage from './pages/owner/AddPropertyPage';
import EditPropertyPage from './pages/owner/EditPropertyPage';
import ManageRoomsPage from './pages/owner/ManageRoomsPage';
import ManageFoodMenuPage from './pages/owner/ManageFoodMenuPage';
import ManageFacilitiesRulesPage from './pages/owner/ManageFacilitiesRulesPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Public & Tenant Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected User Routes */}
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Owner Management Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute requireOwner>
                  <OwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/owner/dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboard />} />
              <Route path="bookings" element={<OwnerBookingsPage />} />
              <Route path="properties/add" element={<AddPropertyPage />} />
              <Route path="properties/:id/edit" element={<EditPropertyPage />} />
              <Route path="properties/:propertyId/rooms" element={<ManageRoomsPage />} />
              <Route path="properties/:propertyId/food" element={<ManageFoodMenuPage />} />
              <Route path="properties/:propertyId/facilities-rules" element={<ManageFacilitiesRulesPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
