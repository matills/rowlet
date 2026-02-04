import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Eye, CheckCircle, ClipboardList, Pause, X, Star } from 'lucide-react';
import { useContentDetails } from '@/hooks/useSearch';
import { useAddToLibrary } from '@/hooks/useUserContent';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import './ContentDetail.css';

type ContentStatus = 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';

const STATUS_OPTIONS: Array<{ value: ContentStatus; label: string; icon: React.ReactNode }> = [
  { value: 'watching', label: 'Watching', icon: <Eye size={18} strokeWidth={2.5} /> },
  { value: 'watched', label: 'Watched', icon: <CheckCircle size={18} strokeWidth={2.5} /> },
  { value: 'want_to_watch', label: 'Want to Watch', icon: <ClipboardList size={18} strokeWidth={2.5} /> },
  { value: 'paused', label: 'Paused', icon: <Pause size={18} strokeWidth={2.5} /> },
  { value: 'dropped', label: 'Dropped', icon: <X size={18} strokeWidth={2.5} /> },
];

export function ContentDetail() {
  const navigate = useNavigate();
  const { source, externalId } = useParams<{ source: 'tmdb' | 'anilist'; externalId: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'movie' | 'series' | 'anime' | undefined;

  const [selectedStatus, setSelectedStatus] = useState<ContentStatus>('want_to_watch');
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [episodesWatched, setEpisodesWatched] = useState(0);

  const { data: content, isLoading } = useContentDetails(source!, externalId!, type);
  const addToLibrary = useAddToLibrary();

  const handleAddToLibrary = async () => {
    if (!content) return;

    try {
      await addToLibrary.mutateAsync({
        externalId: content.externalId,
        source: content.source,
        type: content.type,
        status: selectedStatus,
        rating: rating || undefined,
        episodesWatched: content.type !== 'movie' ? episodesWatched : undefined,
        notes: notes || undefined,
        watchedAt: selectedStatus === 'watched' ? new Date().toISOString() : undefined,
      });

      alert('Added to your library!');
      navigate('/catalog');
    } catch (error) {
      console.error('Failed to add to library:', error);
      alert('Failed to add to library. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="error-screen">
        <h2>Content not found</h2>
        <Button onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    );
  }

  return (
    <div className="content-detail">
      <header className="content-detail__header">
        <div className="logo">
          <h1 onClick={() => navigate('/dashboard')}>OWLIST</h1>
        </div>
        <div className="header-actions">
          <Button onClick={() => navigate('/search')} variant="secondary" size="sm">
            Back to Search
          </Button>
        </div>
      </header>

      <div
        className="content-detail__backdrop"
        style={{
          backgroundImage: content.backdropUrl
            ? `linear-gradient(rgba(245, 240, 225, 0.9), rgba(245, 240, 225, 0.95)), url(${content.backdropUrl})`
            : undefined,
        }}
      >
        <div className="content-detail__container">
          <div className="content-detail__poster-section">
            {content.posterUrl ? (
              <img
                src={content.posterUrl}
                alt={content.title}
                className="content-detail__poster"
              />
            ) : (
              <div className="content-detail__poster content-detail__poster--placeholder">
                <span>?</span>
              </div>
            )}
          </div>

          <div className="content-detail__info">
            <div className="content-detail__meta">
              <Badge>{content.type === 'anime' ? 'Anime' : content.type === 'series' ? 'Series' : 'Movie'}</Badge>
              {content.year && <span className="content-detail__year">{content.year}</span>}
              {content.rating && (
                <span className="content-detail__rating">
                  <Star size={16} strokeWidth={2.5} fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {content.rating}
                </span>
              )}
            </div>

            <h1 className="content-detail__title">{content.title}</h1>

            {content.originalTitle !== content.title && (
              <p className="content-detail__original-title">{content.originalTitle}</p>
            )}

            {content.genres.length > 0 && (
              <div className="content-detail__genres">
                {content.genres.map((genre) => (
                  <Badge key={genre}>{genre}</Badge>
                ))}
              </div>
            )}

            {content.overview && (
              <p className="content-detail__overview">{content.overview}</p>
            )}

            {content.type !== 'movie' && (
              <div className="content-detail__stats">
                {content.episodeCount && (
                  <div className="stat">
                    <span className="stat__label">Episodes:</span>
                    <span className="stat__value">{content.episodeCount}</span>
                  </div>
                )}
                {content.seasonCount && (
                  <div className="stat">
                    <span className="stat__label">Seasons:</span>
                    <span className="stat__value">{content.seasonCount}</span>
                  </div>
                )}
                {content.status && (
                  <div className="stat">
                    <span className="stat__label">Status:</span>
                    <span className="stat__value">{content.status}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-detail__actions-container">
        <div className="content-detail__actions">
          <h2 className="actions__title">Add to Your Library</h2>

          <div className="actions__status">
            <label className="actions__label">Status:</label>
            <div className="status-buttons">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`status-button ${selectedStatus === option.value ? 'status-button--active' : ''}`}
                >
                  <span className="status-button__emoji">{option.icon}</span>
                  <span className="status-button__label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="actions__rating">
            <label className="actions__label">Rating (optional):</label>
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r === rating ? null : r)}
                  className={`rating-button ${rating === r ? 'rating-button--active' : ''}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {content.type !== 'movie' && (
            <div className="actions__episodes">
              <label className="actions__label">Episodes watched:</label>
              <input
                type="number"
                min="0"
                max={content.episodeCount || undefined}
                value={episodesWatched}
                onChange={(e) => setEpisodesWatched(parseInt(e.target.value, 10) || 0)}
                className="episodes-input"
              />
            </div>
          )}

          <div className="actions__notes">
            <label className="actions__label">Notes (optional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your thoughts..."
              className="notes-textarea"
              rows={3}
            />
          </div>

          <Button
            onClick={handleAddToLibrary}
            disabled={addToLibrary.isPending}
            fullWidth
            size="lg"
          >
            {addToLibrary.isPending ? 'Adding...' : 'Add to Library'}
          </Button>
        </div>
      </div>
    </div>
  );
}
