// Inspect the exact Vercel function locally; no local school data is connected.
import {createServer} from 'node:http';
import handler from '../.vercel/output/functions/orbit.func/handler.mjs';
const port=Number(process.env.PORT||3001);
createServer(handler).listen(port,'127.0.0.1',()=>console.log(`Vercel adapter preview: http://127.0.0.1:${port}`));
