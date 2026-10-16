import {chatStickers} from './chat-data.js';
export function createStickers(runtime){
 const h=(type,props,...children)=>{const {key,...rest}=props||{};return runtime.jsxs(type,{...rest,...(children.length?{children:children.length===1?children[0]:children}:{})},key);};
 return function Sticker({id,small=false}){
  const sticker=chatStickers.find(item=>item.id===id)||chatStickers[0],{mood,color}=sticker;
  return <div className={'oc-sticker '+(small?'is-small':'')} style={{'--sticker-color':color}} role="img" aria-label={sticker.caption}>
   <svg viewBox="0 0 180 150" fill="none" aria-hidden="true">
    <ellipse cx="89" cy="132" rx="42" ry="6" fill={color} opacity=".12"/>
    <circle cx="89" cy="72" r="49" fill={color} opacity=".1"/>
    <path d="M51 82c-11-29 8-61 37-62 32-1 54 29 45 59-5 19-23 40-44 40S58 100 51 82Z" fill="white" stroke={color} strokeWidth="3"/>
    <path d="M48 78c-25 14-28 28-14 32 21 7 83-19 115-40 22-14 24-28 10-30-8-1-18 0-28 4" stroke={color} strokeWidth="8" strokeLinecap="round"/>
    <path d="M48 78c-25 14-28 28-14 32 21 7 83-19 115-40 22-14 24-28 10-30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    {mood==='love'?<><path d="m69 59 4-4 4 4-4 6Z" fill={color}/><path d="m95 59 4-4 4 4-4 6Z" fill={color}/></>:mood==='party'||mood==='star'?<><path d="m67 62 6-5 6 5m16 0 6-5 6 5" stroke={color} strokeWidth="3.5" strokeLinecap="round"/></>:<><ellipse cx="73" cy="59" rx="3" ry="4" fill={color}/><ellipse cx="101" cy="59" rx="3" ry="4" fill={color}/></>}
    <ellipse cx="63" cy="72" rx="6" ry="3" fill="#ffb6ca" opacity=".65"/><ellipse cx="110" cy="72" rx="6" ry="3" fill="#ffb6ca" opacity=".65"/>
    {mood==='think'?<path d="M83 79h9" stroke={color} strokeWidth="3" strokeLinecap="round"/>:<path d="M80 73q8 10 16 0" stroke={color} strokeWidth="3" strokeLinecap="round"/>}
    {mood==='hello'?<><path d="m134 88 16-15m-7 20 13-7m-17-8 7-12" stroke={color} strokeWidth="4" strokeLinecap="round"/><path d="m151 53 4-7m6 17 7-2" stroke={color} strokeWidth="2" strokeLinecap="round"/></>:mood==='love'?<path d="M134 22c-6-12-20-5-13 6l13 12 13-12c7-11-7-18-13-6Z" fill={color}/>:mood==='think'?<><circle cx="141" cy="32" r="15" fill={color} opacity=".13"/><path d="M137 28c1-7 11-5 10 1-1 3-6 3-6 6m0 5v1" stroke={color} strokeWidth="3" strokeLinecap="round"/></>:mood==='go'?<><path d="m132 27 16-13-3 19-10 7Z" fill={color}/><path d="m132 38-9 9m13-3-6 8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/></>:<><path d="m137 13 4 9 10 1-8 7 2 10-9-5-9 5 2-10-7-7 10-1Z" fill={color}/><path d="m30 24 3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1Z" fill={color} opacity=".6"/></>}
    {mood==='party'&&<><path d="m22 56-6-4m140 51 7 4M52 12l-3-6m69 112 3 6" stroke={color} strokeWidth="3" strokeLinecap="round"/><circle cx="24" cy="83" r="3" fill="#f5b65a"/><circle cx="158" cy="81" r="3" fill="#a58cdd"/></>}
   </svg><span>{sticker.label}</span>
  </div>;
 };
}
