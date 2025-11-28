import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import EmployeePage from "./pages/EmployeePage";
import FreelancerPage from "./pages/FreelancerPage";
import HistoryPage from "./pages/HistoryPage";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/freelancer" element={<FreelancerPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 PayCheck Lab. 모든 계산은 참고용이며 법적 효력이 없습니다.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
