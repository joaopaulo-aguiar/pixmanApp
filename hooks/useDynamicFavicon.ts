import { useEffect } from 'react';
import { config } from '../lib/config';

/**
 * Simple favicon hook - back to basics
 */
const useDynamicFavicon = (merchantSlug?: string) => {
  useEffect(() => {
    console.log('useDynamicFavicon - merchantSlug:', merchantSlug);
    
    if (!merchantSlug) {
      console.log('useDynamicFavicon - No slug, using default favicon');
      updateFavicon('/favicon.jpg');
      return;
    }

    // Generate logo URL using the same method as MerchantHero
    const logoUrl = config.cdn.cloudfront.images.logo(merchantSlug);
    console.log('useDynamicFavicon - Generated logo URL:', logoUrl);
    
    // Update favicon with merchant logo
    updateFavicon(logoUrl);

    // Cleanup function to reset favicon when component unmounts
    return () => {
      updateFavicon('/favicon.jpg');
    };
  }, [merchantSlug]);
};

/**
 * Simple favicon update function
 */
const updateFavicon = (iconUrl: string) => {
  console.log('updateFavicon - Updating favicon to:', iconUrl);
  
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel*="icon"]');
  console.log('updateFavicon - Removing existing links:', existingLinks.length);
  existingLinks.forEach(link => link.remove());

  // Create new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = iconUrl;
  
  // Add error handling for failed favicon loads
  link.onerror = () => {
    console.warn(`Failed to load favicon from ${iconUrl}, falling back to default`);
    if (iconUrl !== '/favicon.jpg') {
      updateFavicon('/favicon.jpg');
    }
  };

  link.onload = () => {
    console.log('updateFavicon - Successfully loaded favicon:', iconUrl);
  };

  // Append to head
  document.head.appendChild(link);
};

export default useDynamicFavicon;
