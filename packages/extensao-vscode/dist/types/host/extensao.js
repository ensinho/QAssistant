"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const nucleo_1 = require("@qassistant/nucleo");
const provedor_painel_1 = require("./painel/provedor-painel");
function activate(contexto) {
    const saida = vscode.window.createOutputChannel('QAssistant');
    saida.appendLine(`${(0, nucleo_1.descreverProduto)()} iniciado.`);
    contexto.subscriptions.push(saida);
    const provedorPainel = new provedor_painel_1.ProvedorPainel(contexto, saida);
    contexto.subscriptions.push(vscode.window.registerWebviewViewProvider(provedor_painel_1.ProvedorPainel.viewType, provedorPainel, {
        webviewOptions: { retainContextWhenHidden: true },
    }));
    contexto.subscriptions.push(vscode.commands.registerCommand('qassistant.abrirPainel', async () => {
        await vscode.commands.executeCommand('workbench.view.extension.qassistant');
        await vscode.commands.executeCommand(`${provedor_painel_1.ProvedorPainel.viewType}.focus`);
    }), vscode.commands.registerCommand('qassistant.inicializarWorkspace', async () => {
        await provedorPainel.inicializarWorkspace();
    }), vscode.commands.registerCommand('qassistant.atualizarPainel', async () => {
        await provedorPainel.atualizar();
    }), vscode.workspace.onDidChangeWorkspaceFolders(() => void provedorPainel.atualizar()));
}
function deactivate() {
    // O VS Code descarta subscriptions automaticamente.
}
//# sourceMappingURL=extensao.js.map