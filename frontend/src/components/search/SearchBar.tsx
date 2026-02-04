import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, placeholder = 'Search movies, series, anime...', autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="search-bar">
      <div className="search-bar__input-wrapper">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="search-bar__input"
        />
        {query && (
          <button
            onClick={handleClear}
            className="search-bar__clear"
            aria-label="Clear search"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
