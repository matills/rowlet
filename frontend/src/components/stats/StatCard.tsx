import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'gold';
}

export function StatCard({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      {icon && <div className="stat-card__icon">{icon}</div>}
      <div className="stat-card__content">
        <h3 className="stat-card__title">{title}</h3>
        <div className="stat-card__value">{value}</div>
        {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
