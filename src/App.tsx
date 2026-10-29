import { Routes, Route } from "react-router";
import Navbar from "./components/layout/navbar";
import LearnPage from "./pages/LearnPage";
import ApplyPage from "./pages/ApplyPage";
import GrowPage from "./pages/GrowPage";
import HomePage from "./pages/HomePage";
import { homepageDraft } from "./data/homepage-draft";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage content={homepageDraft} />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/grow" element={<GrowPage />} />
        <Route path="*" element={<HomePage content={homepageDraft} />} />
      </Routes>
    </>
  );
}
