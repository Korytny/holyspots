
import { useState } from 'react';
import { MediaItem } from '../types/models';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon,
  Video,
  Music
} from 'lucide-react';

interface MediaGalleryProps {
  media: MediaItem[];
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  if (!media || media.length === 0) {
    return (
      <div className="flex items-center justify-center bg-muted h-[300px] rounded-lg">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 mb-2" />
          <p>No media available</p>
        </div>
      </div>
    );
  }

  const activeItem = media[activeIndex];
  
  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? media.length - 1 : current - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((current) => (current === media.length - 1 ? 0 : current + 1));
  };
  
  const renderMediaItem = (item: MediaItem) => {
    switch (item.type) {
      case 'image':
        return <img src={item.url} alt={item.title || ''} className="w-full h-full object-cover" />;
      case 'video':
        return (
          <video controls className="w-full h-full object-contain bg-black">
            <source src={item.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full bg-muted p-4">
            <Music className="h-16 w-16 mb-4 text-primary" />
            <p className="text-lg font-medium mb-2">{item.title || 'Audio Track'}</p>
            <audio controls className="w-full max-w-md">
              <source src={item.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      default:
        return null;
    }
  };
  
  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return null;
    }
  };
  
  return (
    <div className="relative rounded-lg overflow-hidden bg-muted">
      {/* Main media display */}
      <div className="relative h-[400px]">
        {renderMediaItem(activeItem)}
        
        {/* Navigation buttons */}
        {media.length > 1 && (
          <>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex p-2 gap-2 overflow-x-auto bg-white/90">
          {media.map((item, idx) => (
            <div 
              key={item.id || idx} 
              className={`flex-shrink-0 w-16 h-16 rounded cursor-pointer border-2 ${activeIndex === idx ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setActiveIndex(idx)}
            >
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover rounded" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                  {getMediaIcon(item.type)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Caption */}
      {activeItem.title && (
        <div className="p-3 bg-white">
          <h4 className="font-medium">{activeItem.title}</h4>
          {activeItem.description && <p className="text-sm text-gray-600">{activeItem.description}</p>}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
