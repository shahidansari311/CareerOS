import { Outlet } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';

export function App() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Outlet />
      </div>
    </AppProviders>
  );
}
