import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';

const ImageGallery = ({ images = [], title = "Property" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const goToPrevious = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="relative group">
        {/* Main Image */}
        <div 
          className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setFullscreenOpen(true)}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Expand button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenOpen(true);
            }}
          >
            <Expand className="w-4 h-4" />
          </Button>
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
          
          {/* Image counter */}
          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goToIndex(idx)}
                className={`
                  flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${currentIndex === idx ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'}
                `}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* Close button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setFullscreenOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Main fullscreen image */}
            <img
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Thumbnails at bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx)}
                  className={`
                    w-12 h-12 rounded overflow-hidden border-2 transition-all
                    ${currentIndex === idx ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'}
                  `}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-4 py-2 rounded-lg">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
