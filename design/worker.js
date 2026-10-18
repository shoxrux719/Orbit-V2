import site from './index.js';
import { schoolUser, handleSchool, learningRequest } from './school-server.js';
import { handleCampus } from './campus-server.js';
import { handleAcademy } from './academy-server.js';
const revision='__ORBIT_ASSET_VERSION__';
const styles=['design','learning','school','campus'].map(name=>`<link rel="stylesheet" href="/orbit-${name}-${revision}.css">`).join('');

export default {
  async fetch(request, env, ctx) {
    let user;
    try { user = await schoolUser(request,env); }
    catch { return Response.json({error:'Учебная база недоступна. Повторите попытку.'},{status:503}); }
    const academyResponse = await handleAcademy(request,env,user);
    if(academyResponse) return academyResponse;
    const campusResponse = await handleCampus(request,env,user);
    if(campusResponse) return campusResponse;
    const schoolResponse = await handleSchool(request,env,user);
    if (schoolResponse) return schoolResponse;
    const url = new URL(request.url);
    const rolePaths = {admin:'/admin',teacher:'/teacher',student:'/student'};
    const rolePath = ['/admin','/teacher','/student'].includes(url.pathname);
    const portalPath = rolePath || /^\/people\/[a-zA-Z0-9-]+$/.test(url.pathname);
    if (rolePath && user && rolePaths[user.role] !== url.pathname) return Response.redirect(url.origin+rolePaths[user.role]+'#account',302);
    if (portalPath) url.pathname = '/';
    const forwarded = learningRequest(new Request(url,request),user);
    const response = await site.fetch(forwarded, env, ctx);
    if (!response.headers.get('content-type')?.includes('text/html')) return response;
    if (typeof HTMLRewriter === 'undefined') {
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.set('Cache-Control', 'private, no-store');
      const preload=user?'':`<link rel="preload" as="image" href="/orbit-auth-studio-${revision}.webp" media="(min-width:761px)" fetchpriority="high"><link rel="preload" as="image" href="/orbit-auth-studio-mobile-${revision}.webp" media="(max-width:760px)" fetchpriority="high">`;
      return new Response((await response.text()).replace('</head>', preload+styles+'</head>'), {status:response.status,headers});
    }
    return new HTMLRewriter().on('head', {
      element(element) {
        element.append(styles, { html: true });
      },
    }).transform(response);
  },
};
