import React from 'react';
import Button from './Button';
import { Reward } from '../lib/types';

interface RewardProgramCardProps {
  reward: Reward;
  index: number;
  total: number;
  onSelect?: (reward: Reward) => void;
}

function formatCurrency(value: number | string | undefined) {
  if (value === undefined || value === null || value === '') return '0,00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (isNaN(num)) return '0,00';
  return num.toFixed(2).replace('.', ',');
}

function getBgClasses(rank: number, total: number) {
  if (total <= 1) return 'bg-orange-50 border-orange-100';
  const step = rank / (total - 1 || 1);
  if (step < 0.25) return 'bg-orange-50 border-orange-100';
  if (step < 0.5) return 'bg-orange-100 border-orange-200';
  if (step < 0.75) return 'bg-orange-200 border-orange-300';
  return 'bg-orange-300/60 border-orange-300';
}

// Cores sólidas do ticket (escala de intensidade)
// Apenas dois tipos de cupom: básico (mais barato) e premium (mais caro)
function getTicketColor(isPremium: boolean) {
  return isPremium ? 'bg-orange-700' : 'bg-orange-600';
}

export default function RewardProgramCard({ reward, index, total, onSelect }: RewardProgramCardProps) {
  const price = typeof reward.price === 'number' ? reward.price : parseFloat(reward.price || '0');
  const bg = 'bg-white border-slate-200'; // container neutro agora
  const ticketColor = getTicketColor(index === total - 1 && total > 1); // último é o mais caro após ordenação
  const qty = Number(reward.quantity) || 1;
  return (
    <div className={`relative rounded-2xl border p-3 flex flex-col text-[11px] leading-tight ${bg}`}>
      {/* Ticket sólido */}
      <div className="relative mb-3">
        <div className={`relative mx-auto ${ticketColor} rounded-xl px-4 py-4 text-center shadow-sm text-white overflow-hidden`}> 
          {/* Overlay de contraste suave */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0))]"></div>
          {/* Borda tracejada interna levemente inset */}
          <div className="absolute inset-1 rounded-lg border-2 border-dashed border-white/70 pointer-events-none"></div>
          <div className="text-[10px] uppercase tracking-wide font-semibold text-white/90 mb-1">CUPOM</div>
          <div className="text-[18px] font-extrabold leading-none mb-2 drop-shadow-sm">
            {reward.reward}
          </div>
          <div className="text-[11px] leading-snug font-normal text-white/95 mx-auto max-w-[180px]">
            {reward.programRule}
          </div>
        </div>
      </div>
      <div className="mt-3 mb-3">
        <Button
          type="button"
          size="sm"
          className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-600 !px-2 !py-2 !text-[11px] font-semibold rounded-md flex flex-col leading-tight"
          onClick={() => onSelect && onSelect(reward)}
        >
          <span className="text-[18px] font-bold leading-none mb-1">R$ {formatCurrency(price)}</span>
          <span className="text-[10px] font-normal leading-none">pagamento por pix</span>
        </Button>
      </div>
  <div className="text-[12px] text-slate-600 mt-auto">Compre 1 e receba {qty} cupons para utilização em dias diferentes.</div>
    </div>
  );
}
