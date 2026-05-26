"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function SafeImage({ src, alt, fallbackSrc, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const defaultFallback = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='%233E5A44'/><circle cx='400' cy='250' r='100' fill='%23A3C4D3'/><path d='M0 600 L300 350 L500 500 L800 200 L800 600 Z' fill='%238A9A5B'/><path d='M100 600 L400 400 L600 550 L800 350 L800 600 Z' fill='%232E4332'/><text x='50%' y='90%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23FFFFFF'>Scenic Landscape Placeholder</text></svg>";

  const handleError = () => {
    setImgSrc(fallbackSrc || defaultFallback);
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      onError={handleError} 
      {...props} 
    />
  );
}
