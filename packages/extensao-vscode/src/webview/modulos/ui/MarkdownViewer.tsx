import type { FC } from 'react';
import { useState, useEffect } from 'react';

interface MarkdownViewerProps {
  conteudo: string;
  className?: string;
}

function decodificarEntidades(texto: string): string {
  if (!texto) return '';
  return texto
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

export const MarkdownViewer: FC<MarkdownViewerProps> = ({ conteudo, className = '' }) => {
  const [htmlRenderizado, setHtmlRenderizado] = useState<string>('');

  useEffect(() => {
    let ativo = true;
    if (!conteudo || !conteudo.trim()) {
      setHtmlRenderizado('');
      return;
    }

    const textoDecodificado = decodificarEntidades(conteudo);

    import('marked')
      .then(({ marked }) => {
        if (ativo) {
          const resultado = marked.parse(textoDecodificado, {
            gfm: true,
            breaks: true,
          });
          if (typeof resultado === 'string') {
            setHtmlRenderizado(resultado);
          } else {
            Promise.resolve(resultado).then((r) => {
              if (ativo) setHtmlRenderizado(r);
            });
          }
        }
      })
      .catch(() => {
        if (ativo) {
          setHtmlRenderizado(textoDecodificado);
        }
      });

    return () => {
      ativo = false;
    };
  }, [conteudo]);

  if (!htmlRenderizado) {
    return <span className="qa-empty-text">Sem conteúdo para exibir.</span>;
  }

  return (
    <div
      className={`qa-markdown-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlRenderizado }}
    />
  );
};
