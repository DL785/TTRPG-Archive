export const KEY='rpg-archive-v1';
export function validateArchive(input){
 const list=Array.isArray(input)?input:input?.systems;
 if(!Array.isArray(list)||list.length>2000)throw Error('В файле нет корректного списка систем.');
 const ids=new Set();
 return list.map(s=>{
  if(!s||typeof s.id!=='string'||ids.has(s.id)||typeof s.name!=='string'||!s.name.trim()||typeof s.owned!=='boolean'||!Array.isArray(s.materials)||!Array.isArray(s.sessions))throw Error('Некорректная карточка системы.');ids.add(s.id);
  if(s.cover&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s.cover))throw Error('Обложки должны быть встроены в файл. Загрузите их заново в HTML-версии.');
  if(!s.materials.every(m=>typeof m==='string'&&m.trim()))throw Error('Некорректный список материалов.');
  const sessionIds=new Set();
  const sessions=s.sessions.map(x=>{if(!x||typeof x.id!=='string'||sessionIds.has(x.id)||typeof x.title!=='string'||!x.title.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(x.time)||!['gm','player'].includes(x.role)||typeof x.hours!=='number'||!Number.isFinite(x.hours)||x.hours<0||x.hours>100)throw Error('Некорректная сессия.');sessionIds.add(x.id);return {...x,campaign:typeof x.campaign==='string'?x.campaign:'',notes:typeof x.notes==='string'?x.notes:''}});
  return {id:s.id,name:s.name.trim(),owned:s.owned,cover:s.cover||'',materials:[...new Set(s.materials.map(m=>m.trim()).filter(m=>m.toLowerCase()!=='corebook'))],sessions};
 });
}
let dbPromise;
function db(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(KEY,1);r.onupgradeneeded=()=>r.result.createObjectStore('archive');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Браузер заблокировал хранилище. Разрешите сохранение данных для этой страницы.'));});return dbPromise}
export async function readLocal(){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('archive','readonly');const r=t.objectStore('archive').get('data');r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error)})}
export async function writeLocal(systems){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('archive','readwrite');t.objectStore('archive').put(systems,'data');t.oncomplete=()=>resolve();t.onerror=()=>reject(Error('Не удалось сохранить данные в браузере. Экспортируйте резервную копию.'));t.onabort=()=>reject(Error('Сохранение отменено браузером. Возможно, закончилось место.'))})}
export function archiveFile(systems){return JSON.stringify({format:'rpg-archive',version:1,exportedAt:new Date().toISOString(),systems},null,2)}
export async function readRepository(){if(location.protocol==='file:')throw Error('При открытии HTML двойным щелчком используйте «Импорт JSON». Загрузка из репозитория работает на GitHub Pages.');const url=new URL('./archive.json',location.href);url.searchParams.set('v',Date.now());const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Не найден archive.json рядом с index.html (HTTP '+r.status+').');return validateArchive(await r.json())}
