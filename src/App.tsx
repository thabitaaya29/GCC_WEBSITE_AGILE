import { Routes, Route } from "react-router";
import Navbar from "./components/layout/navbar";
import LearnPage from "./pages/LearnPage";
import ApplyPage from "./pages/ApplyPage";
import GrowPage from "./pages/GrowPage";

function HomePlaceholder() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold">
        Welcome to GCC
      </h1>
      <p className="mt-4 text-gray-600">
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
