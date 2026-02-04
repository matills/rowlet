import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import './Dashboard.css';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <h1>OWLIST</h1>
        </div>
        <div className="user-menu">
          <span className="user-email">{user?.email}</span>
          <Button onClick={handleSignOut} variant="secondary">
            Sign out
          </Button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to Owlist!</h2>
          <p>Your media tracking journey begins here.</p>
        </div>

        <div className="placeholder-grid">
          <div className="placeholder-card placeholder-card--clickable" onClick={() => navigate('/search')}>
            <h3><Search size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Search & Track</h3>
            <p>Search for movies, series, and anime to add to your library</p>
            <Button variant="primary" fullWidth>
              Start Searching
            </Button>
          </div>
          <div className="placeholder-card placeholder-card--clickable" onClick={() => navigate('/catalog')}>
            <h3><BookOpen size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Your Catalog</h3>
            <p>View and manage your tracked content</p>
            <Button variant="secondary" fullWidth>
              View Catalog
            </Button>
          </div>
          <div className="placeholder-card placeholder-card--clickable" onClick={() => navigate('/stats')}>
            <h3><BarChart3 size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Statistics</h3>
            <p>See your viewing stats and trends</p>
            <Button variant="gold" fullWidth>
              View Stats
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
