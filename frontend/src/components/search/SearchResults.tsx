import { ContentCard } from './ContentCard';
import type { ContentItem } from '@/lib/api';
import './SearchResults.css';

interface SearchResultsProps {
  results: ContentItem[];
  isLoading: boolean;
  query: string;
  onContentClick: (content: ContentItem) => void;
}

export function SearchResults({ results, isLoading, query, onContentClick }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="search-results">
        <div className="search-results__loading">
          <div className="spinner">Searching...</div>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="search-results">
        <div className="search-results__empty">
          <p className="search-results__empty-text">
            Start typing to search for movies, series, and anime
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results__empty">
          <p className="search-results__empty-text">
            No results found for "{query}"
          </p>
          <p className="search-results__empty-hint">
            Try a different search term
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results__header">
        <h2 className="search-results__title">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </h2>
      </div>

      <div className="search-results__grid">
        {results.map((content) => (
          <ContentCard
            key={`${content.source}-${content.externalId}`}
            content={content}
            onClick={() => onContentClick(content)}
          />
        ))}
      </div>
    </div>
  );
}
