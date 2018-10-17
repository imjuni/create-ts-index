export { var1, var2, var3 } from './export_sample01';
export { variable04 as v04, var5 as v05, var6 as v06 } from './export_sample01';
export { log } from 'console';
export { consoleLog } from './export_sample04';

function defaultExportFunc() {
  console.log('defaultExportFunc');
}

export function exportFunc() {
  console.log('exportFunc');
}

export async function exportAsyncFunc() {
  console.log('exportAsyncFunc');
}

export type integer = number;

export { defaultExportFunc as default };
