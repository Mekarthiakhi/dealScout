import { useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

/**
 * LazyImage component - loads images only when visible
 * Improves performance by deferring image loading
 */
export function LazyImage({ src, alt, className = '', placeholder }: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23e5e7eb" width="300" height="300"/%3E%3C/svg%3E');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef) {
            setImageSrc(src);
            setIsLoading(false);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imageRef) {
      observer.observe(imageRef);
    }

    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageRef]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'animate-pulse' : ''}`}
      loading="lazy"
      onLoad={() => setIsLoading(false)}
    />
  );
}

export default LazyImage;
