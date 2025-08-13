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

export default function RewardProgramCard({ reward, index, total, onSelect }: RewardProgramCardProps) {
  const price = typeof reward.price === 'number' ? reward.price : parseFloat(reward.price || '0');
  const bg = getBgClasses(index, total);
  const qty = Number(reward.quantity) || 1;
  return (
    <div className={`relative rounded-xl border p-2 flex flex-col text-[11px] leading-tight ${bg}`}>
      <div className="flex items-center mb-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/80 text-orange-700 font-semibold text-[10px] tracking-wide shadow-sm">
          {qty} {qty === 1 ? 'Cupom' : 'Cupons'}
        </span>
      </div>
      <div className="font-semibold text-[14px] text-slate-900">Cupom: {reward.reward}</div>
      <div className="text-[11px] text-slate-600">{reward.programRule}</div>
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
      <div className="text-[10px] text-slate-600 mt-auto">Compre 1 cupom e receba {qty} cupons para utilização em dias diferentes.</div>
    </div>
  );
}
