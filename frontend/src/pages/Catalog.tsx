import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContent } from '@/hooks/useUserContent';
import { FilterBar } from '@/components/catalog/FilterBar';
import { CatalogCard } from '@/components/catalog/CatalogCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import './Catalog.css';

type ContentStatus = 'all' | 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
type ContentType = 'all' | 'movie' | 'series' | 'anime';

export function Catalog() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus>('all');
  const [selectedType, setSelectedType] = useState<ContentType>('all');

  const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus;
  const { data, isLoading } = useUserContent(statusFilter);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter by type
  const filteredItems = data?.items?.filter((item: any) => {
    if (selectedType === 'all') return true;
    return item.content.type === selectedType;
  }) || [];

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <div className="catalog-header__content">
          <div className="logo">
            <h1 onClick={() => navigate('/dashboard')}>OWLIST</h1>
          </div>
          <div className="catalog-header__actions">
            <Button onClick={() => navigate('/search')} variant="gold" size="sm">
              Add Content
            </Button>
            <Button onClick={handleSignOut} variant="secondary" size="sm">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="catalog-content">
        <div className="catalog-container">
          <div className="catalog-hero">
            <h2 className="catalog-hero__title">Your Library</h2>
            <p className="catalog-hero__subtitle">
              {data?.count || 0} item{data?.count !== 1 ? 's' : ''} in your collection
            </p>
          </div>

          <FilterBar
            selectedStatus={selectedStatus}
            selectedType={selectedType}
            onStatusChange={setSelectedStatus}
            onTypeChange={setSelectedType}
          />

          {isLoading ? (
            <div className="catalog-loading">
              <div className="spinner">Loading your library...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="catalog-empty">
              <div className="catalog-empty__content">
                <h3>No content found</h3>
                <p>
                  {selectedStatus !== 'all' || selectedType !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start adding content to your library!'}
                </p>
                <Button onClick={() => navigate('/search')} variant="primary">
                  Search Content
                </Button>
              </div>
            </div>
          ) : (
            <div className="catalog-grid">
              {filteredItems.map((item: any) => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  onClick={() =>
                    navigate(
                      `/content/${item.content.source}/${item.content.external_id}?type=${item.content.type}`
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
