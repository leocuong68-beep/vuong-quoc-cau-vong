// Lets the game page ask the Mac app to open Minecraft. Nothing else is exposed.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hocVienApp', {
  version: 2,
  openMinecraft: () => ipcRenderer.invoke('open-minecraft'),
});
