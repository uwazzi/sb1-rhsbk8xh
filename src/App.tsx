import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CheckSanityPage from './pages/CheckSanityPage';
import ExecuteTestPage from './pages/ExecuteTestPage';
import TestProgressPage from './pages/TestProgressPage';
import ResultsPage from './pages/ResultsPage';
import DocumentationPage from './pages/DocumentationPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage';
import LabPage from './pages/LabPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PESInvestigatorPage from './pages/PESInvestigatorPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="create" element={<CheckSanityPage />} />
        <Route path="test/:id" element={<ExecuteTestPage />} />
        <Route path="lab/:id" element={<LabPage />} />
        <Route path="progress/:id" element={<TestProgressPage />} />
        <Route path="results/:id" element={<ResultsPage />} />
        <Route path="documentation" element={<DocumentationPage />} />
        <Route path="pes-investigator" element={<PESInvestigatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;