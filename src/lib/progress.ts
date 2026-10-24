import {z} from 'zod';
import type {Scenario} from './content';
export const KEY='dialogue-progress-v1';
const schema=z.object({schema:z.literal(1),lessonDone:z.boolean(),attempt:z.object({id:z.string(),version:z.number(),choices:z.array(z.object({step:z.string(),option:z.string()}))}).nullable()});
export type Progress=z.infer<typeof schema>;
const empty=():Progress=>({schema:1,lessonDone:false,attempt:null});
let memory=empty();
export let storageWarning='';
export function load():Progress{try{const raw=localStorage.getItem(KEY);if(!raw)return memory;const result=schema.safeParse(JSON.parse(raw));if(!result.success)throw Error();return memory=result.data;}catch{storageWarning='Сохранённые данные недоступны или повреждены. Можно начать заново; прогресс хранится в памяти этой страницы.';return memory;}}
export function save(p:Progress){memory=p;try{localStorage.setItem(KEY,JSON.stringify(p));}catch{storageWarning='Хранилище недоступно. После закрытия страницы прогресс может потеряться.';}}
export function validAttempt(p:Progress,s:Scenario){const a=p.attempt;if(!a||a.id!==s.id||a.version!==s.version)return false;let next:string|null=s.first_step_id;for(const c of a.choices){if(c.step!==next)return false;const o=s.steps.find(x=>x.id===next)?.options.find(x=>x.id===c.option);if(!o)return false;next=o.next_step_id;}return true;}
