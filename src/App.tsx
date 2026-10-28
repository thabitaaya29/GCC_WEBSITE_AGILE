import { Routes, Route } from "react-router";
import Navbar from "./components/layout/navbar";
import LearnPage from "./pages/LearnPage";
import ApplyPage from "./pages/ApplyPage";
import GrowPage from "./pages/GrowPage";

function HomePlaceholder() {
  return (
    <main className="page-container page-section">
      <h1 className="page-title">
        Welcome to GCC
      </h1>
      <p className="body-copy mt-4">
        Discover homepage sedang dikembangkan.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/grow" element={<GrowPage />} />
        <Route path="*" element={<HomePlaceholder />} />
      </Routes>
    </>
  );
}
