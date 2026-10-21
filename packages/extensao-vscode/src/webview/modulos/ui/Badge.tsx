import type { FC, ReactNode } from 'react';

export type VarianteBadge =
  | 'default'
  | 'sucesso'
  | 'aviso'
  | 'erro'
  | 'info'
  | 'roxo'
  | 'nova';

interface BadgeProps {
  children: ReactNode;
  variante?: VarianteBadge;
  icone?: ReactNode;
  tamanho?: 'sm' | 'md';
}

export const Badge: FC<BadgeProps> = ({
  children,
  variante = 'default',
  icone,
  tamanho = 'sm',
}) => {
  return (
    <span className={`qa-badge qa-badge-${variante} qa-badge-${tamanho}`}>
      {icone && <span className="qa-badge-icon">{icone}</span>}
      <span>{children}</span>
    </span>
  );
};
