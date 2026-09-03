import React, { useState } from "react";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import FeedbackFab from "./components/FeedbackFab";
import Feedback from "./components/Feedback";

import Home from "./pages/Home";
import FGorder from "./pages/FGorder";
import Cto from "./pages/Cto";
import MacbookAir from "./pages/cto-pages/MacbookAir";
import MacbookPro from "./pages/cto-pages/MacbookPro";
import MacbookProTest from "./pages/cto-pages/MacbookProTest";
import MacStudio from "./pages/cto-pages/MacStudio";
import MacStudio2026 from "./pages/cto-pages/MacStudio2026";
import MacMini from "./pages/cto-pages/Macmini";
import MacMini2026 from "./pages/cto-pages/Macmini2026";
import MacPro from "./pages/cto-pages/MacPro";
import Imac from "./pages/cto-pages/Imac";
import Solutorg from "./pages/Solutorg";
import PriceList from "./pages/PriceList";

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
}

function EditorRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  if (!isLoaded || !userLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  const role = user?.publicMetadata?.role;
  if (role !== "admin" && role !== "editor") return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Router>
      {/* NavBar */}
      <div className="navbar-container">
        <NavBar />
      </div>

      {/* Main Content */}
      <div className="main-content-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/stada-sendinga"
            element={
              <ProtectedRoute>
                <FGorder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto"
            element={
              <ProtectedRoute>
                <Cto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/macbook-air"
            element={
              <ProtectedRoute>
                <MacbookAir />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/macbook-pro"
            element={
              <ProtectedRoute>
                <MacbookPro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/macbook-pro-test"
            element={
              <ProtectedRoute>
                <MacbookProTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/imac"
            element={
              <ProtectedRoute>
                <Imac />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/mac-studio"
            element={
              <ProtectedRoute>
                <MacStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/mac-studio-2026"
            element={
              <ProtectedRoute>
                <MacStudio2026 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/mac-mini"
            element={
              <ProtectedRoute>
                <MacMini />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/mac-mini-2026"
            element={
              <ProtectedRoute>
                <MacMini2026 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cto/mac-pro"
            element={
              <ProtectedRoute>
                <MacPro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solutorg"
            element={
              <ProtectedRoute>
                <Solutorg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verdlistar"
            element={
              <EditorRoute>
                <PriceList />
              </EditorRoute>
            }
          />
        </Routes>
      </div>

      {/* Persistent feedback access */}
      <FeedbackFab onFeedbackClick={() => setModalOpen(true)} />

      {/* Feedback modal */}
      {modalOpen && <Feedback closeModal={() => setModalOpen(false)} />}

      <Analytics />
    </Router>
  );
}

export default App;
