"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var preload_exports = {};
__export(preload_exports, {
  api: () => api
});
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
var pendingAuthCallbackCode = null;
var authCallbackListeners = /* @__PURE__ */ new Set();
import_electron.ipcRenderer.on("auth:callback", (event, code) => {
  if (authCallbackListeners.size === 0) {
    pendingAuthCallbackCode = code;
    return;
  }
  for (const listener of authCallbackListeners) listener(event, code);
});
var api = {
  getVersion: () => import_electron.ipcRenderer.sendSync("app/version"),
  maximize: () => import_electron.ipcRenderer.send("app/maximize"),
  minimize: () => import_electron.ipcRenderer.send("app/minimize"),
  close: () => import_electron.ipcRenderer.send("app/close"),
  openBrowser: (url) => import_electron.ipcRenderer.send("open:browser", url),
  notifyDesktop: (title, body) => import_electron.ipcRenderer.invoke("notification:show", title, body),
  authV3Callback: (callback) => {
    authCallbackListeners.clear();
    authCallbackListeners.add(callback);
    if (pendingAuthCallbackCode !== null) {
      const code = pendingAuthCallbackCode;
      pendingAuthCallbackCode = null;
      queueMicrotask(() => callback(void 0, code));
    }
    return () => authCallbackListeners.delete(callback);
  },
  onToggleTitlebar: (callback) => import_electron.ipcRenderer.on("toggle-titlebar", (_event, show) => callback(show)),
  openDirectory: () => import_electron.ipcRenderer.send("library:open-directory"),
  handleOpenedDirectory: (callback) => import_electron.ipcRenderer.on("library:directory-selected", callback),
  shippingHash: (path) => import_electron.ipcRenderer.send("library:get-hash", path),
  handleShippingHash: (callback) => import_electron.ipcRenderer.on("library:hash-result", callback),
  openPath: (path) => import_electron.ipcRenderer.send("library:open-path", path),
  openLogs: () => import_electron.ipcRenderer.send("library:open-logs"),
  validateStoragePath: (path, requiredBytes) => import_electron.ipcRenderer.invoke("storage:validate-path", path, requiredBytes),
  selectDownloadPath: () => import_electron.ipcRenderer.invoke("download:select-path"),
  startDownload: (payload) => import_electron.ipcRenderer.send("download:start", payload),
  cancelDownload: () => import_electron.ipcRenderer.send("download:cancel"),
  onDownloadProgress: (callback) => import_electron.ipcRenderer.on("download:progress", callback),
  checkVCRedist: () => import_electron.ipcRenderer.invoke("vcredist:check"),
  cacheWrappedReport: (seasonId, reportData) => import_electron.ipcRenderer.invoke("wrapped:cache-report", seasonId, reportData),
  getCachedWrappedReport: (seasonId) => import_electron.ipcRenderer.invoke("wrapped:get-cached-report", seasonId),
  cacheWrappedAccolades: (accolades) => import_electron.ipcRenderer.invoke("wrapped:cache-accolades", accolades),
  getCachedWrappedAccolades: () => import_electron.ipcRenderer.invoke("wrapped:get-cached-accolades"),
  sentrySetUser: (userId, username, email) => import_electron.ipcRenderer.send("sentry:set-user", userId, username, email),
  sentryClearUser: () => import_electron.ipcRenderer.send("sentry:clear-user"),
  launch: (buildPath, token, env, credentials, buildInfo) => import_electron.ipcRenderer.send("launcher:launch", buildPath, token, env, credentials, buildInfo),
  onLaunched: (callback) => import_electron.ipcRenderer.on("launcher:launch:result", callback),
  onGameClose: (callback) => import_electron.ipcRenderer.on("game:close", callback),
  analyzePaks: (buildPath, buildUuid) => import_electron.ipcRenderer.send("profiler:analyze", buildPath, buildUuid),
  onAnalyzeResult: (callback) => import_electron.ipcRenderer.on("profiler:analyze:result", callback),
  clientFingerprint: (env) => import_electron.ipcRenderer.invoke("client:fingerprint", env),
  disablePaks: (buildPath, files) => import_electron.ipcRenderer.invoke("paks:disable", buildPath, files),
  discord: (presence) => import_electron.ipcRenderer.send("discord:presence", presence),
  checkForContentUpdate: (url, buildPath, buildUuid) => import_electron.ipcRenderer.invoke("content-update:check", url, buildPath, buildUuid),
  onContentUpdateProgress: (callback) => {
    const subscription = (_event, progress) => callback(_event, progress);
    import_electron.ipcRenderer.on("content-update:progress", subscription);
    return () => {
      import_electron.ipcRenderer.removeListener("content-update:progress", subscription);
    };
  },
  forceQuitGame: () => import_electron.ipcRenderer.send("launcher:force-quit"),
  downloadClient: (url, env) => import_electron.ipcRenderer.invoke("download:client", url, env),
  onClientDownloadProgress: (callback) => import_electron.ipcRenderer.on("download:client:progress", callback),
  invoke: (channel, ...args) => import_electron.ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => import_electron.ipcRenderer.send(channel, ...args),
  on: (channel, callback) => {
    const subscription = (_event, ...args) => callback(...args);
    import_electron.ipcRenderer.on(channel, subscription);
    return () => {
      import_electron.ipcRenderer.removeListener(channel, subscription);
    };
  }
};
import_electron.contextBridge.exposeInMainWorld("electron", api);
import_electron.contextBridge.exposeInMainWorld("electronAPI", api);
0 && (module.exports = {
  api
});
