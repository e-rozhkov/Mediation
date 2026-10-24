import { z } from 'zod';
import lessonData from '../content/lessons/kto-pomogaet.json';
import scenarioData from '../content/scenarios/obshee-zadanie.json';
import resourceData from '../content/resources/kak-dogovoritsya.json';
const text=z.string().min(1);
const base=z.object({id:text,slug:text,title:text,audience:z.array(z.enum(['children','parents','teachers'])).min(1),age_min:z.literal(7),age_max:z.literal(10),intro:text});
export const lessonSchema=base.extend({version:z.number().int().positive(),blocks:z.array(text).min(1),question:text,scenario:text,choices:z.array(z.object({id:text,text,correct:z.boolean(),explanation:text})).length(3)});
export const scenarioSchema=base.extend({version:z.number().int().positive(),participants:z.array(text).min(2),skill:text,duration:text,first_step_id:text,resource:text,steps:z.array(z.object({id:text,story:text,question:text,options:z.array(z.object({id:text,text,consequence:text,explanation:text,next_step_id:text.nullable()})).length(3)})).min(1)});
export const resourceSchema=base.extend({topic:text,blocks:z.array(text).min(1),pdf:text});
export type Scenario=z.infer<typeof scenarioSchema>;
export const lesson=lessonSchema.parse(lessonData);
export const scenario=scenarioSchema.parse(scenarioData);
export const resource=resourceSchema.parse(resourceData);
export function unique(ids:string[],label:string){if(new Set(ids).size!==ids.length)throw Error(`${label}: повторяющийся идентификатор`);}
export function validateGraph(s:Scenario){
 unique(s.steps.map(x=>x.id),s.slug);
 const seen=new Set<string>(); const active=new Set<string>();
 function visit(id:string){if(active.has(id))throw Error(`${s.slug}: цикл ${id}`);if(seen.has(id))return;const step=s.steps.find(x=>x.id===id);if(!step)throw Error(`${s.slug}: неизвестный шаг ${id}`);active.add(id);unique(step.options.map(x=>x.id),id);for(const o of step.options)if(o.next_step_id!==null)visit(o.next_step_id);active.delete(id);seen.add(id);}
 visit(s.first_step_id);if(seen.size!==s.steps.length)throw Error(`${s.slug}: недостижимый шаг`);
}
