# Scaffold Do Repositorio

Este documento define a primeira versao do projeto novo do QAssistant.

Observacao: este arquivo representa um baseline de scaffold. A implementacao atual pode divergir em detalhes; consulte tambem `01-arquitetura.md` e `99-historico-implementacao.md`.

## Arvore recomendada

```text
QAssistant/
  README.md
  package.json
  tsconfig.base.json
  docs/
    00-visao-do-produto.md
    01-arquitetura.md
    02-scaffold-repositorio.md
    03-estrutura-qassistant-testes.md
    04-fluxos-principais.md
    05-nomenclatura-e-contratos.md
  packages/
    nucleo/
      package.json
      tsconfig.json
      src/
        index.ts
        workspace/
        openproject/
        resumos/
        validacoes/
        testes/
        ia/
        arquivos/
    extensao-vscode/
      package.json
      tsconfig.json
      esbuild.config.cjs
      vite.config.ts
      src/
        host/
          extensao.ts
          comandos/
          controladores/
          servicos/
          contratos/
        webview/
          main.tsx
          app/
          modulos/
          design-system/
          estado/
          contratos/
      media/
        qassistant-logo.png
```

## Pacotes

- `@qassistant/nucleo`: logica reutilizavel, sem dependencia da API do VS Code.
- `qassistant-vscode`: extensao VS Code e VSIX.

## Scripts esperados

- `build`: compila todos os pacotes.
- `build:nucleo`: compila o nucleo.
- `build:extensao`: compila host e webview.
- `dev:webview`: roda Vite para desenvolvimento da webview.
- `package:vsix`: empacota a extensao.
- `test`: roda testes automatizados.

## Fora do escopo inicial

- CLI novo.
- Compatibilidade automatica com `.ai-cli`.
- Compatibilidade automatica com `PROJECT_AI_*`.
- Reaproveitamento direto da webview vanilla antiga.
