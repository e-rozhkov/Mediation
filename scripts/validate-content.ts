import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {lessonSchema,scenarioSchema,resourceSchema,unique,validateGraph} from '../src/lib/content';
const groups=[['lessons',lessonSchema],['scenarios',scenarioSchema],['resources',resourceSchema]] as const;
const ids:string[]=[];const slugs:string[]=[];
for(const [folder,schema]of groups)for(const file of readdirSync(`src/content/${folder}`).filter(f=>f.endsWith('.json'))){
 const path=`src/content/${folder}/${file}`;
 try{const data=schema.parse(JSON.parse(readFileSync(path,'utf8')));ids.push(data.id);slugs.push(data.slug);
 if('steps'in data)validateGraph(scenarioSchema.parse(data));
 if('choices'in data){unique(data.choices.map(c=>c.id),path);if(data.choices.filter(c=>c.correct).length!==1)throw Error('Нужен один верный ответ');}
 for(const key of ['scenario','resource'] as const)if(key in data){const target=String((data as Record<string,unknown>)[key]);const group=key==='scenario'?'scenarios':'resources';if(!existsSync(`src/content/${group}/${target}.json`))throw Error(`Отсутствует ссылка ${target}`);}
 if('pdf'in data&&!existsSync(`public${data.pdf}`))throw Error(`Нет PDF ${data.pdf}`);
 console.log(`OK ${path}`);
 }catch(e){throw Error(`${path}: ${e}`);}
}
unique(ids,'Материалы');unique(slugs,'Адреса');
