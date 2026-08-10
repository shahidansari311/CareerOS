import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '@/pages/public/Landing';
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import OnboardingPage from '@/pages/auth/Onboarding';
import NotFoundPage from '@/pages/public/NotFound';
import { App } from '../App';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/app/Dashboard';
import RoadmapPage from '@/pages/app/Roadmap';
import CodingProfilesPage from '@/pages/app/Coding';
import ProjectsPage from '@/pages/app/Projects';
import StudyRoomPage from '@/pages/app/StudyRoom';
import JobsPage from '@/pages/app/Jobs';
import AIMentorPage from '@/pages/app/AIMentor';
import ProfilePage from '@/pages/app/Profile';
import SettingsPage from '@/pages/app/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'onboarding',
        element: <OnboardingPage />,
      },

      {
        path: 'app',
        element: <DashboardLayout />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'roadmap',
            element: <RoadmapPage />,
          },
          {
            path: 'coding',
            element: <CodingProfilesPage />,
          },
          {
            path: 'projects',
            element: <ProjectsPage />,
          },
          {
            path: 'study-room',
            element: <StudyRoomPage />,
          },
          {
            path: 'jobs',
            element: <JobsPage />,
          },
          {
            path: 'ai-mentor',
            element: <AIMentorPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
