import React from 'react';
import Button from './Button';
import { Reward } from '../lib/types';

interface RewardProgramCardProps {
  reward: Reward;
  index: number;
  total: number;
  onSelect?: (reward: Reward) => void; // reservando para futura compra
}

// Função util para formatar preço em R$
function formatCurrency(value: number | string | undefined) {
  if (value === undefined || value === null || value === '') return '0,00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (isNaN(num)) return '0,00';
  return num.toFixed(2).replace('.', ',');
}

// Determina a intensidade da cor conforme ranking de preço (mais barato mais claro)
function getBgClasses(rank: number, total: number) {
  if (total <= 1) return 'bg-orange-50 border-orange-100';
  const step = rank / (total - 1 || 1); // 0 (mais barato) -> 1 (mais caro)
  if (step < 0.25) return 'bg-orange-50 border-orange-100';
  if (step < 0.5) return 'bg-orange-100 border-orange-200';
  if (step < 0.75) return 'bg-orange-200 border-orange-300';
  return 'bg-orange-300/60 border-orange-300';
}

export default function RewardProgramCard({ reward, index, total, onSelect }: RewardProgramCardProps) {
  const price = typeof reward.price === 'number' ? reward.price : parseFloat(reward.price || '0');
  const bg = getBgClasses(index, total);
  return (
    <div className={`relative rounded-xl border p-2 flex flex-col gap-1 text-[11px] leading-tight ${bg}`}>
      {/* Quantidade */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 text-orange-700 font-medium text-[10px] tracking-wide shadow-sm">
          {reward.quantity} {Number(reward.quantity) === 1 ? 'Cupom' : 'Cupons'}
        </span>
      </div>

      {/* Informação principal */}
      <div className="font-semibold text-[12px] text-slate-900 mt-1">
        {reward.reward}
      </div>
      <div className="text-[10px] text-slate-600">
        {reward.programRule}
      </div>

      {/* Preço + Botão */}
      <div className="mt-1 flex items-end justify-between gap-1">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-slate-900">R$ {formatCurrency(price)}</span>
          <span className="text-[10px] font-medium text-teal-600">(pix)</span>
        </div>
        <Button
          type="button"
            size="sm"
            className="!px-2 !py-1 !text-[10px] font-semibold"
            onClick={() => {
              if (onSelect) onSelect(reward);
            }}
          >
          Comprar
        </Button>
      </div>
    </div>
  );
}
