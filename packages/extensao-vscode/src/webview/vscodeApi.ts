/**
 * Singleton do VS Code API.
 * acquireVsCodeApi() só pode ser chamada UMA vez por webview — centralizamos aqui.
 */
const vsCodeApi = acquireVsCodeApi();

export default vsCodeApi;
