/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

// copied from testpreload.js
 const { contextBridge, ipcRenderer, ipcMain } = require("electron");

 contextBridge.exposeInMainWorld('electron', {
     ///////////////////////////////////////////////////////////////
    //  checkPlan3DCRT: (MRN, SetupInstruction, PtLastName, PlanName) => {
    //    let MAP = {
    //      '04-20-036674': '83410'
    //    }
    //    let patientId = MAP[MRN]
    //    ipcRenderer.send("check-crt-plan", {patientId, MRN,  SetupInstruction, PtLastName, PlanName})
    //  },
     OpenPlanFolder: () => {
       console.log("open-plan-folder")
       ipcRenderer.send("open-plan-folder", {})
     },
     ListenToPlanLoaded: (listener) => {
       ipcRenderer.on('plan-data-loaded',({sender},{planPath, RcData, MqData, Plan})=>{
         console.log('plan-data-loaded')
         listener(planPath, RcData, MqData, Plan)
       })
     }
 })
 
