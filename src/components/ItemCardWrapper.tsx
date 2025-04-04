
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ItemCard from './ItemCard';
import FavoriteButton from './FavoriteButton';
import { Language } from '../types/models';

interface ItemCardWrapperProps {
  id: string;
  type: 'city' | 'point' | 'route' | 'event';
  name: Record<string, string> | string;
  description?: Record<string, string> | string;
  thumbnail: string;
  location?: string;
  pointCount?: number;
  date?: string;
  spotType?: string;
  extraContent?: React.ReactNode;
  onClick?: () => void;
}

const ItemCardWrapper: React.FC<ItemCardWrapperProps> = (props) => {
  const { id, type, onClick } = props;
  const navigate = useNavigate();
  
  // Ensure name is always a Record<string, string> as required by ItemCard
  const normalizedProps = {
    ...props,
    name: typeof props.name === 'string' 
      ? { en: props.name, ru: props.name, hi: props.name } as Record<Language, string>
      : props.name as Record<Language, string>,
    description: typeof props.description === 'string'
      ? { en: props.description, ru: props.description, hi: props.description } as Record<Language, string>
      : (props.description || { en: '', ru: '', hi: '' }) as Record<Language, string>,
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation based on type if no onClick provided
      switch (type) {
        case 'city':
          navigate(`/cities/${id}`);
          break;
        case 'point':
          navigate(`/points/${id}`);
          break;
        case 'route':
          navigate(`/routes/${id}`);
          break;
        case 'event':
          navigate(`/events/${id}`);
          break;
      }
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleCardClick}>
      <ItemCard {...normalizedProps} onClick={handleCardClick} />
      <div className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <FavoriteButton itemId={id} itemType={type} />
      </div>
    </div>
  );
};

export default ItemCardWrapper;
