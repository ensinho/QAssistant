/**
 * Singleton do VS Code API.
 * acquireVsCodeApi() só pode ser chamada UMA vez por webview — centralizamos aqui.
 * Fornecemos fallback para desenvolvimento local no navegador.
 */
const vsCodeApi = typeof acquireVsCodeApi === 'function'
  ? acquireVsCodeApi()
  : ({
      postMessage: (msg: unknown) => {
        console.log('[Dev Webview] postMessage:', msg);
      },
      getState: () => ({}),
      setState: (state: unknown) => state,
    } as unknown as QAssistantVsCodeApi);

export default vsCodeApi;
