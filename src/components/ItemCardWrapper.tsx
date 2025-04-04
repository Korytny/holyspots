
import React from 'react';
import ItemCard from './ItemCard';
import FavoriteButton from './FavoriteButton';

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
  const { id, type } = props;
  
  return (
    <div className="relative group">
      <ItemCard {...props} />
      <div className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <FavoriteButton itemId={id} itemType={type} />
      </div>
    </div>
  );
};

export default ItemCardWrapper;
