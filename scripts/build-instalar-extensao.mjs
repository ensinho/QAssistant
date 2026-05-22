#!/usr/bin/env node

import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const raizWorkspace = path.resolve(__dirname, '..');
const diretorioExtensao = path.join(raizWorkspace, 'packages', 'extensao-vscode');

const argumentos = new Set(process.argv.slice(2));
const dryRun = argumentos.has('--dry-run');
const skipBuild = argumentos.has('--skip-build');

async function executar(comando, args, cwd = raizWorkspace) {
  await new Promise((resolve, reject) => {
    const child = spawn(comando, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Comando falhou (${comando} ${args.join(' ')}), codigo ${code ?? 'desconhecido'}.`));
    });
  });
}

async function arquivoExecutavelExiste(comando) {
  try {
    await access(comando, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolverCliVsCode() {
  const candidatos = [
    process.env.QASSISTANT_VSCODE_CLI,
    process.env.VSCODE_CLI,
    'code',
    'code-insiders',
  ].filter(Boolean);

  for (const candidato of candidatos) {
    if (candidato.includes(path.sep) && await arquivoExecutavelExiste(candidato)) {
      return candidato;
    }

    try {
      await new Promise((resolve, reject) => {
        const child = spawn(candidato, ['--version'], {
          stdio: 'ignore',
          shell: false,
          env: process.env,
        });
        child.on('error', reject);
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('indisponivel')));
      });
      return candidato;
    } catch {
      // tenta o proximo candidato
    }
  }

  throw new Error(
    'Nao encontrei o CLI do VS Code. Configure QASSISTANT_VSCODE_CLI ou VSCODE_CLI, ou habilite o comando "code" no PATH.'
  );
}

async function localizarVsixMaisRecente() {
  const arquivos = await readdir(diretorioExtensao);
  const candidatos = await Promise.all(
    arquivos
      .filter((nome) => /^qassistant-vscode-.*\.vsix$/i.test(nome))
      .map(async (nome) => {
        const caminho = path.join(diretorioExtensao, nome);
        const info = await stat(caminho);
        return { caminho, mtimeMs: info.mtimeMs };
      })
  );

  if (candidatos.length === 0) {
    throw new Error('Nenhum arquivo VSIX encontrado em packages/extensao-vscode/.');
  }

  candidatos.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidatos[0].caminho;
}

async function main() {
  if (!skipBuild) {
    console.log('> Gerando VSIX mais recente...');
    await executar('npm', ['run', 'package:vsix'], raizWorkspace);
  }

  const vsix = await localizarVsixMaisRecente();
  const cliVsCode = await resolverCliVsCode();

  console.log(`> VSIX selecionada: ${vsix}`);
  console.log(`> CLI do VS Code: ${cliVsCode}`);

  if (dryRun) {
    console.log(`> Dry run: ${cliVsCode} --install-extension ${vsix} --force`);
    return;
  }

  console.log('> Instalando extensao empacotada...');
  await executar(cliVsCode, ['--install-extension', vsix, '--force'], raizWorkspace);
  console.log('> Extensao instalada com sucesso.');
}

main().catch((error) => {
  console.error(`Erro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});