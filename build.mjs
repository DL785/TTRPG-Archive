import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const result=await build({entryPoints:['src/App.tsx'],bundle:true,minify:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'inline'});
const js=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const css=await readFile('src/style.css','utf8');
await writeFile('index.html',`<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#15181d"><meta name="description" content="Личная библиотека НРИ, журнал сессий и инфографика"><title>Игровой архив</title><style>${css}</style></head><body><div id="root"></div><noscript>Для работы архива включите JavaScript.</noscript><script>${js}</script></body></html>`);
console.log('Готов index.html: все зависимости включены в файл.');
