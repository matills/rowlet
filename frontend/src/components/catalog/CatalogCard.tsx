import React from 'react';
import { Eye, CheckCircle, ClipboardList, Pause, X, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import './CatalogCard.css';

interface CatalogItem {
  id: string;
  content: {
    id: string;
    external_id: string;
    source: 'tmdb' | 'anilist';
    type: 'movie' | 'series' | 'anime';
    title: string;
    poster_url: string | null;
    rating: number | null;
    year: number | null;
    genres: string[];
  };
  status: string;
  rating: number | null;
  episodes_watched: number;
}

interface CatalogCardProps {
  item: CatalogItem;
  onClick?: () => void;
}

export function CatalogCard({ item, onClick }: CatalogCardProps) {
  const { content } = item;
  const typeLabel = content.type === 'anime' ? 'Anime' : content.type === 'series' ? 'Series' : 'Movie';

  const getStatusIcon = (status: string): React.ReactNode => {
    const size = 20;
    const strokeWidth = 2.5;
    switch (status) {
      case 'watching': return <Eye size={size} strokeWidth={strokeWidth} />;
      case 'watched': return <CheckCircle size={size} strokeWidth={strokeWidth} />;
      case 'want_to_watch': return <ClipboardList size={size} strokeWidth={strokeWidth} />;
      case 'paused': return <Pause size={size} strokeWidth={strokeWidth} />;
      case 'dropped': return <X size={size} strokeWidth={strokeWidth} />;
      default: return null;
    }
  };

  return (
    <div className="catalog-card" onClick={onClick}>
      {content.poster_url ? (
        <img
          src={content.poster_url}
          alt={content.title}
          className="catalog-card__poster"
          loading="lazy"
        />
      ) : (
        <div className="catalog-card__poster catalog-card__poster--placeholder">
          <span>?</span>
        </div>
      )}

      <div className="catalog-card__overlay">
        <div className="catalog-card__status">
          {getStatusIcon(item.status)}
        </div>
      </div>

      <div className="catalog-card__body">
        <div className="catalog-card__header">
          <Badge>{typeLabel}</Badge>
          {item.rating && (
            <span className="catalog-card__user-rating">
              <Star size={14} strokeWidth={2.5} fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {item.rating}
            </span>
          )}
        </div>

        <h3 className="catalog-card__title">{content.title}</h3>

        <div className="catalog-card__meta">
          {content.year && <span>{content.year}</span>}
          {content.rating && (
            <>
              <span>•</span>
              <span className="catalog-card__rating">
                <Star size={14} strokeWidth={2.5} fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {content.rating}
              </span>
            </>
          )}
        </div>

        {item.episodes_watched > 0 && (
          <div className="catalog-card__progress">
            {item.episodes_watched} episodes watched
          </div>
        )}
      </div>
    </div>
  );
}
