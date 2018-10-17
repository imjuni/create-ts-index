export interface IExportSample {
  sample: string;
  age: number;
}

const es: IExportSample = { sample: 'ss', age: 10 };
export const { sample, age } = es;

export class ExportSampleClass {
  public sample: string;
  public age: number;
}

export let esc = new ExportSampleClass();

const arr: Array<string> = ['element01', 'element02'];
export const [first, second] = arr;

const var1 = 'varable_01';
const var2 = 'varable_02';
const var3 = 'varable_03';

export { var1, var2, var3 };

const var4 = 'varable_04';
const var5 = 'varable_05';
const var6 = 'varable_06';

export { var4 as variable04, var5, var6 };

const var7 = 'a';

export default var7;
