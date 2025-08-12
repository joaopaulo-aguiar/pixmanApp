import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Componente que gera QR code no frontend a partir de um string
 */
export default function QRCodeComponent({ 
  value, 
  size = 200, 
  className = "", 
  alt = "QR Code" 
}: QRCodeComponentProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!value) {
      setLoading(false);
      return;
    }

    const generateQRCode = async () => {
      try {
        setLoading(true);
        setError('');
        
        const dataURL = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        setQrCodeDataURL(dataURL);
      } catch (err) {
        console.error('Erro ao gerar QR code:', err);
        setError('Erro ao gerar QR code');
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [value, size]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded ${className}`} style={{ width: size, height: size }}>
        <div className="text-center p-4">
          <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!qrCodeDataURL) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 border border-slate-200 rounded ${className}`} style={{ width: size, height: size }}>
        <p className="text-slate-500 text-sm">QR Code indisponível</p>
      </div>
    );
  }

  return (
    <img 
      src={qrCodeDataURL}
      alt={alt}
      className={`border rounded ${className}`}
      style={{ 
        width: size, 
        height: size,
        imageRendering: 'crisp-edges' 
      }}
    />
  );
}
