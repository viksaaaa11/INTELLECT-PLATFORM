import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { 
  RotateCcw, 
  Expand, 
  X, 
  Play, 
  Pause,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';

const Panorama360Viewer = ({ panoramaUrl, title = "360° View" }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef(null);

  // Auto-rotate effect
  useEffect(() => {
    if (isAutoRotate && !isDragging) {
      const animate = () => {
        setYaw(prev => (prev + 0.2) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoRotate, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setYaw(prev => prev - deltaX * 0.3);
    setPitch(prev => Math.max(-85, Math.min(85, prev + deltaY * 0.3)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(prev => Math.max(50, Math.min(150, prev - e.deltaY * 0.1)));
  };

  const resetView = () => {
    setYaw(0);
    setPitch(0);
    setZoom(100);
    setIsAutoRotate(true);
  };

  const PanoramaContent = ({ fullscreen = false }) => (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl ${fullscreen ? 'w-full h-full' : 'w-full h-64 md:h-80'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* 360 Background using CSS transforms */}
      <div 
        className="absolute inset-0 transition-transform duration-75"
        style={{
          backgroundImage: `url(${panoramaUrl})`,
          backgroundSize: `${zoom * 4}% auto`,
          backgroundPosition: `${50 + yaw * 0.5}% ${50 + pitch * 0.5}%`,
          backgroundRepeat: 'repeat-x',
          filter: 'brightness(1.05)',
        }}
      />

      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

      {/* 360 Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
        <RotateCcw className={`w-3 h-3 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
        360° Panorama
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoRotate(!isAutoRotate);
            }}
          >
            {isAutoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(prev => Math.min(150, prev + 20));
            }}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(prev => Math.max(50, prev - 20));
            }}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          {!fullscreen && (
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
            >
              <Expand className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Drag hint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          <Move className="w-3 h-3" />
          Drag to look around
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="group">
        <PanoramaContent />
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-0 bg-black border-none">
          <div className="relative w-full h-full">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="absolute top-4 left-4 z-50 text-white">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-xs text-white/70">Drag to explore • Scroll to zoom</p>
            </div>
            <PanoramaContent fullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Panorama360Viewer;
