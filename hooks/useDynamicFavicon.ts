import { useEffect } from 'react';
import { config } from '../lib/config';

/**
 * Simple favicon hook - back to basics
 */
const useDynamicFavicon = (merchantSlug?: string) => {
  useEffect(() => {
    console.log('useDynamicFavicon - merchantSlug:', merchantSlug);
    
    if (!merchantSlug) {
      // Não carrega favicon de fallback para evitar flash; deixa o existente (ou nenhum)
      return;
    }

    // Generate logo URL using the same method as MerchantHero
    const logoUrl = config.cdn.cloudfront.images.logo(merchantSlug);
    console.log('useDynamicFavicon - Generated logo URL:', logoUrl);
    
    // Update favicon with merchant logo
    updateFavicon(logoUrl);

    // Cleanup function to reset favicon when component unmounts
    return () => {
      // Não restaura fallback para evitar carregamento extra
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
  
  // Add error handling for failed favicon loads (não tenta fallback para evitar flash)
  link.onerror = () => {
    console.warn(`Failed to load favicon from ${iconUrl}`);
  };

  link.onload = () => {
    console.log('updateFavicon - Successfully loaded favicon:', iconUrl);
  };

  // Append to head
  document.head.appendChild(link);
};

export default useDynamicFavicon;
