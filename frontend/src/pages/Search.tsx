import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/Button';
import type { ContentItem } from '@/lib/api';
import './Search.css';

export function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useSearch({
    query,
    type: 'all',
    page: 1,
  });

  const handleContentClick = (content: ContentItem) => {
    navigate(`/content/${content.source}/${content.externalId}?type=${content.type}`);
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="search-header__content">
          <div className="logo">
            <h1 onClick={() => navigate('/dashboard')}>OWLIST</h1>
          </div>
          <div className="search-header__actions">
            <Button onClick={() => navigate('/dashboard')} variant="secondary" size="sm">
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="search-content">
        <div className="search-container">
          <div className="search-hero">
            <h2 className="search-hero__title">Find your next watch</h2>
            <p className="search-hero__subtitle">
              Search across thousands of movies, TV series, and anime
            </p>
          </div>

          <div className="search-main">
            <SearchBar
              onSearch={setQuery}
              placeholder="Search movies, series, anime..."
              autoFocus
            />

            <SearchResults
              results={data?.results || []}
              isLoading={isLoading}
              query={query}
              onContentClick={handleContentClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
