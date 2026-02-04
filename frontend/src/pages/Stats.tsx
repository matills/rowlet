import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Eye, ClipboardList, Film, Tv, Clapperboard, Star, BarChart3, X, Pause } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { StatCard } from '@/components/stats/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import './Stats.css';

export function Stats() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: stats, isLoading } = useStats();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <header className="stats-header">
        <div className="stats-header__content">
          <div className="logo">
            <h1 onClick={() => navigate('/dashboard')}>OWLIST</h1>
          </div>
          <div className="stats-header__actions">
            <Button onClick={() => navigate('/catalog')} variant="secondary" size="sm">
              Catalog
            </Button>
            <Button onClick={handleSignOut} variant="secondary" size="sm">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="stats-content">
        <div className="stats-container">
          <div className="stats-hero">
            <h2 className="stats-hero__title">Your Statistics</h2>
            <p className="stats-hero__subtitle">
              Your entertainment journey at a glance
            </p>
          </div>

          {/* Overview Stats */}
          <section className="stats-section">
            <h3 className="stats-section__title">Overview</h3>
            <div className="stats-grid stats-grid--4">
              <StatCard
                title="Total Items"
                value={stats?.totalItems || 0}
                icon={<BookOpen size={32} strokeWidth={2.5} />}
                variant="primary"
              />
              <StatCard
                title="Watched"
                value={stats?.byStatus.watched || 0}
                subtitle="Completed"
                icon={<CheckCircle size={32} strokeWidth={2.5} />}
                variant="secondary"
              />
              <StatCard
                title="Currently Watching"
                value={stats?.byStatus.watching || 0}
                subtitle="In progress"
                icon={<Eye size={32} strokeWidth={2.5} />}
                variant="gold"
              />
              <StatCard
                title="Want to Watch"
                value={stats?.byStatus.want_to_watch || 0}
                subtitle="Planned"
                icon={<ClipboardList size={32} strokeWidth={2.5} />}
              />
            </div>
          </section>

          {/* Type Breakdown */}
          <section className="stats-section">
            <h3 className="stats-section__title">Content Types</h3>
            <div className="stats-grid stats-grid--3">
              <StatCard
                title="Movies"
                value={stats?.byType.movie || 0}
                icon={<Film size={32} strokeWidth={2.5} />}
              />
              <StatCard
                title="Series"
                value={stats?.byType.series || 0}
                icon={<Tv size={32} strokeWidth={2.5} />}
              />
              <StatCard
                title="Anime"
                value={stats?.byType.anime || 0}
                icon={<Clapperboard size={32} strokeWidth={2.5} />}
              />
            </div>
          </section>

          {/* Additional Stats */}
          <section className="stats-section">
            <h3 className="stats-section__title">More Stats</h3>
            <div className="stats-grid stats-grid--3">
              <StatCard
                title="Average Rating"
                value={stats?.averageRating ? `${stats.averageRating}/10` : 'N/A'}
                subtitle={stats?.averageRating ? 'Your ratings' : 'No ratings yet'}
                icon={<Star size={32} strokeWidth={2.5} />}
                variant="gold"
              />
              <StatCard
                title="Episodes Watched"
                value={stats?.totalEpisodesWatched || 0}
                subtitle="Series & Anime"
                icon={<BarChart3 size={32} strokeWidth={2.5} />}
              />
              <StatCard
                title="Dropped"
                value={stats?.byStatus.dropped || 0}
                subtitle="Discontinued"
                icon={<X size={32} strokeWidth={2.5} />}
              />
            </div>
          </section>

          {/* Top Genres */}
          {stats?.topGenres && stats.topGenres.length > 0 && (
            <section className="stats-section">
              <h3 className="stats-section__title">Top Genres</h3>
              <div className="genre-list">
                {stats.topGenres.map(({ genre, count }, index) => (
                  <div key={genre} className="genre-item">
                    <div className="genre-item__rank">#{index + 1}</div>
                    <div className="genre-item__info">
                      <span className="genre-item__name">{genre}</span>
                      <span className="genre-item__count">{count} items</span>
                    </div>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Status Breakdown */}
          <section className="stats-section">
            <h3 className="stats-section__title">All Statuses</h3>
            <div className="status-breakdown">
              <div className="status-breakdown__item">
                <span className="status-breakdown__emoji"><CheckCircle size={20} strokeWidth={2.5} /></span>
                <span className="status-breakdown__label">Watched</span>
                <span className="status-breakdown__value">{stats?.byStatus.watched || 0}</span>
              </div>
              <div className="status-breakdown__item">
                <span className="status-breakdown__emoji"><Eye size={20} strokeWidth={2.5} /></span>
                <span className="status-breakdown__label">Watching</span>
                <span className="status-breakdown__value">{stats?.byStatus.watching || 0}</span>
              </div>
              <div className="status-breakdown__item">
                <span className="status-breakdown__emoji"><ClipboardList size={20} strokeWidth={2.5} /></span>
                <span className="status-breakdown__label">Want to Watch</span>
                <span className="status-breakdown__value">{stats?.byStatus.want_to_watch || 0}</span>
              </div>
              <div className="status-breakdown__item">
                <span className="status-breakdown__emoji"><Pause size={20} strokeWidth={2.5} /></span>
                <span className="status-breakdown__label">Paused</span>
                <span className="status-breakdown__value">{stats?.byStatus.paused || 0}</span>
              </div>
              <div className="status-breakdown__item">
                <span className="status-breakdown__emoji"><X size={20} strokeWidth={2.5} /></span>
                <span className="status-breakdown__label">Dropped</span>
                <span className="status-breakdown__value">{stats?.byStatus.dropped || 0}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
