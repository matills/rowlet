import React from 'react';
import { BookOpen, Eye, CheckCircle, ClipboardList, Pause, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import './FilterBar.css';

type ContentStatus = 'all' | 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
type ContentType = 'all' | 'movie' | 'series' | 'anime';

const STATUS_FILTERS: Array<{ value: ContentStatus; label: string; icon: React.ReactNode }> = [
  { value: 'all', label: 'All', icon: <BookOpen size={18} strokeWidth={2.5} /> },
  { value: 'watching', label: 'Watching', icon: <Eye size={18} strokeWidth={2.5} /> },
  { value: 'watched', label: 'Watched', icon: <CheckCircle size={18} strokeWidth={2.5} /> },
  { value: 'want_to_watch', label: 'Want to Watch', icon: <ClipboardList size={18} strokeWidth={2.5} /> },
  { value: 'paused', label: 'Paused', icon: <Pause size={18} strokeWidth={2.5} /> },
  { value: 'dropped', label: 'Dropped', icon: <X size={18} strokeWidth={2.5} /> },
];

const TYPE_FILTERS: Array<{ value: ContentType; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'anime', label: 'Anime' },
];

interface FilterBarProps {
  selectedStatus: ContentStatus;
  selectedType: ContentType;
  onStatusChange: (status: ContentStatus) => void;
  onTypeChange: (type: ContentType) => void;
}

export function FilterBar({
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <h3 className="filter-section__title">Status</h3>
        <div className="filter-buttons">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onStatusChange(filter.value)}
              className={`filter-button ${selectedStatus === filter.value ? 'filter-button--active' : ''}`}
            >
              <span className="filter-button__emoji">{filter.icon}</span>
              <span className="filter-button__label">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section__title">Type</h3>
        <div className="filter-chips">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onTypeChange(filter.value)}
              className={`filter-chip ${selectedType === filter.value ? 'filter-chip--active' : ''}`}
            >
              <Badge>
                {filter.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
