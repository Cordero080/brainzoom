import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Explorer from "@/pages/Explorer";
import Library from "@/pages/Library";
import Nav from "@/components/Nav";

function LandingWithNav() {
  return (
    <>
      <Nav />
      <Landing />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWithNav />} />
        <Route path="/explore" element={<Explorer />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
