import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import PracticePage from './pages/PracticePage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import WrongQuestionsPage from './pages/WrongQuestionsPage';
import AchievementsPage from './pages/AchievementsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DailyGoalsPage from './pages/DailyGoalsPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="wrong-questions" element={<WrongQuestionsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="daily-goals" element={<DailyGoalsPage />} />
          <Route path="parent" element={<ParentDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
