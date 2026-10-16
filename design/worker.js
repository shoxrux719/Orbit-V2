import site from './index.js';
import { schoolUser, handleSchool, learningRequest } from './school-server.js';
import { handleCampus } from './campus-server.js';

export default {
  async fetch(request, env, ctx) {
    let user;
    try { user = await schoolUser(request,env); }
    catch { return Response.json({error:'Учебная база недоступна. Повторите попытку.'},{status:503}); }
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
    return new HTMLRewriter().on('head', {
      element(element) {
        element.append('<link rel="stylesheet" href="/orbit-design.css"><link rel="stylesheet" href="/orbit-learning.css"><link rel="stylesheet" href="/orbit-school.css"><link rel="stylesheet" href="/orbit-campus.css">', { html: true });
      },
    }).transform(response);
  },
};
