import { Merchant } from '../lib/types';
import { config } from '../lib/config';

interface MerchantHeroProps {
  merchant: Merchant;
}

export default function MerchantHero({ merchant }: MerchantHeroProps) {
  const defaultCoverImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
  const defaultLogo = "https://via.placeholder.com/120x120/f97316/ffffff?text=Logo";

  const coverImage = config.cdn.cloudfront.images.cover(merchant.slug);
  const logoImage = config.cdn.cloudfront.images.logo(merchant.slug);

  return (
    <div className="relative">
      <div className="relative h-40 md:h-48 lg:h-56 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1)), url(${coverImage})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
          onError={(e) => {
            const target = e.target as HTMLElement;
            target.style.backgroundImage = `linear-gradient(to bottom right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1)), url(${defaultCoverImage})`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 top-20 translate-y-1/2 z-10">
        <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-white shadow-2xl p-1 border-2 border-white">
          <img 
            src={logoImage} 
            alt={`Logo ${merchant.displayName}`}
            className="w-full h-full object-contain rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultLogo;
            }}
          />
        </div>
      </div>

      <div className="bg-white pt-12 md:pt-14 lg:pt-16 pb-6 px-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {merchant.displayName}
          </h1>
          
          {merchant.address && (
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm md:text-base">
              <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-center">
                <p className="font-medium">{merchant.address.street}</p>
                <p className="text-gray-500">
                  {merchant.address.city}, {merchant.address.state} - CEP {merchant.address.zipCode}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
