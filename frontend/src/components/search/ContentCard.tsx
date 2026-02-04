import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { ContentItem } from '@/lib/api';
import './ContentCard.css';

interface ContentCardProps {
  content: ContentItem;
  onClick?: () => void;
}

export function ContentCard({ content, onClick }: ContentCardProps) {
  const yearText = content.year || 'TBA';
  const typeText = content.type === 'anime' ? 'Anime' : content.type === 'series' ? 'Series' : 'Movie';

  return (
    <div className="content-card" onClick={onClick}>
      {content.posterUrl ? (
        <img
          src={content.posterUrl}
          alt={content.title}
          className="content-card__poster"
          loading="lazy"
        />
      ) : (
        <div className="content-card__poster content-card__poster--placeholder">
          <span className="content-card__placeholder-text">?</span>
        </div>
      )}

      <div className="content-card__body">
        <div className="content-card__header">
          <Badge>{typeText}</Badge>
          {content.rating && (
            <span className="content-card__rating">
              <Star size={14} strokeWidth={2.5} fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {content.rating}
            </span>
          )}
        </div>

        <h3 className="content-card__title">{content.title}</h3>

        <div className="content-card__meta">
          <span className="content-card__year">{yearText}</span>
          {content.genres.length > 0 && (
            <>
              <span className="content-card__separator">•</span>
              <span className="content-card__genres">
                {content.genres.slice(0, 2).join(', ')}
              </span>
            </>
          )}
        </div>

        {content.overview && (
          <p className="content-card__overview">
            {content.overview.length > 120
              ? `${content.overview.substring(0, 120)}...`
              : content.overview}
          </p>
        )}
      </div>
    </div>
  );
}
