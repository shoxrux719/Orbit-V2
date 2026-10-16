import {chatStickers,chatReactions,emojiGroups} from './chat-data.js';
import {createStickers} from './chat-stickers.jsx';
const roles={admin:'Администрация',teacher:'Учитель',student:'Ученик'};
const fullName=person=>`${person.firstName} ${person.lastName}`.trim();
const preview=message=>!message?'Начни разговор':message.kind==='sticker'?'Стикер · '+(chatStickers.find(s=>s.id===message.sticker_id)?.caption||'ORBIT'):message.body;
const time=stamp=>new Date(stamp).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
const day=stamp=>new Date(stamp).toLocaleDateString('ru-RU',{day:'numeric',month:'long'});

export function createChat(runtime,React,{Avatar,Icon,Notice}){
 const h=(type,props,...children)=>{const {key,...rest}=props||{};return runtime.jsxs(type,{...rest,...(children.length?{children:children.length===1?children[0]:children}:{})},key);};
 const {useState,useEffect,useRef,useCallback}=React,Sticker=createStickers(runtime);
 return function Chat({account,onUnreadChange}){
  const me=account.user.userId,storageKey='orbit:chat:drafts:'+me;
  const [info,setInfo]=useState(null),[recipient,setRecipient]=useState(''),[search,setSearch]=useState(''),[error,setError]=useState(''),[sending,setSending]=useState(false),[picker,setPicker]=useState(''),[emojiTab,setEmojiTab]=useState(0),[reply,setReply]=useState(null),[reactionTarget,setReactionTarget]=useState(''),[newMessages,setNewMessages]=useState(false);
  const [drafts,setDrafts]=useState(()=>{try{const stored=JSON.parse(sessionStorage.getItem(storageKey)||'{}');return stored&&typeof stored==='object'&&!Array.isArray(stored)?Object.fromEntries(Object.entries(stored).filter(([,value])=>typeof value==='string'&&value.length<=3000)):{};}catch{return {};}});
  const thread=useRef(null),input=useRef(null),pickerRef=useRef(null),infoRef=useRef(null),etag=useRef(''),sendingRef=useRef(false),pending=useRef(null),activeRecipient=useRef(''),stickToBottom=useRef(true),previous=useRef({recipient:'',last:''}),onUnreadRef=useRef(onUnreadChange),didAutoSelect=useRef(false);
  onUnreadRef.current=onUnreadChange;activeRecipient.current=recipient;infoRef.current=info;
  const refresh=useCallback(async(signal)=>{
   const response=await fetch('/api/campus/messages',{signal,headers:etag.current?{'If-None-Match':etag.current}:{}});
   if(response.status===304)return;
   const data=await response.json();if(!response.ok)throw Error(data.error||'Не удалось загрузить чат.');
   etag.current=response.headers.get('etag')||'';setInfo(data);setError('');onUnreadRef.current?.(data.messages.filter(m=>m.recipient_id===me&&!m.read_at).length);
  },[me]);
  useEffect(()=>{
   const controller=new AbortController();let timer,closed=false,inFlight=false;
   async function poll(){if(closed||document.hidden||inFlight)return;inFlight=true;try{await refresh(controller.signal);}catch(e){if(e.name!=='AbortError')setError(e.message);}finally{inFlight=false;if(!closed)timer=setTimeout(poll,6000);}}
   const resume=()=>{clearTimeout(timer);if(!document.hidden)poll();};poll();document.addEventListener('visibilitychange',resume);
   return()=>{closed=true;clearTimeout(timer);controller.abort();document.removeEventListener('visibilitychange',resume);};
  },[refresh]);
  useEffect(()=>{try{sessionStorage.setItem(storageKey,JSON.stringify(drafts));}catch{}},[drafts,storageKey]);
  useEffect(()=>{if(didAutoSelect.current||!info||recipient||!info.contacts.length)return;didAutoSelect.current=true;const last=info.messages.at(-1),peer=last&&(last.sender_id===me?last.recipient_id:last.sender_id);setRecipient(info.contacts.some(p=>p.id===peer)?peer:info.contacts[0].id);},[info,recipient]);
  const partner=info?.contacts.find(p=>p.id===recipient),messages=info?.messages.filter(m=>m.sender_id===recipient||m.recipient_id===recipient)||[],draft=drafts[recipient]||'',last=messages.at(-1);
  useEffect(()=>{if(!thread.current||typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(()=>{if(stickToBottom.current)thread.current?.scrollTo({top:thread.current.scrollHeight,behavior:'instant'});});observer.observe(thread.current);return()=>observer.disconnect();},[recipient]);
  useEffect(()=>{
   if(!recipient)return;
   const changed=previous.current.recipient!==recipient||previous.current.last!==last?.id;
   if(changed){const own=last?.sender_id===me;if(stickToBottom.current||own||previous.current.recipient!==recipient){thread.current?.scrollTo({top:thread.current.scrollHeight,behavior:'instant'});setNewMessages(false);}else setNewMessages(true);previous.current={recipient,last:last?.id};}
   const unread=messages.filter(m=>m.recipient_id===me&&!m.read_at);
   if(unread.length&&!document.hidden)fetch('/api/campus/messages/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({senderId:recipient})}).then(r=>{if(!r.ok)throw Error();const read=Date.now();setInfo(current=>current?{...current,messages:current.messages.map(m=>m.recipient_id===me&&m.sender_id===recipient&&!m.read_at?{...m,read_at:read}:m)}:current);onUnreadRef.current?.(infoRef.current?.messages.filter(m=>m.recipient_id===me&&!m.read_at&&m.sender_id!==recipient).length||0);}).catch(()=>{});
  },[recipient,last?.id,info?.messages.filter(m=>m.recipient_id===me&&!m.read_at).length]);
  useEffect(()=>{const listener=e=>{if(e.key==='Escape'){setPicker('');setReactionTarget('');}if(e.type==='pointerdown'&&pickerRef.current&&!pickerRef.current.contains(e.target))setPicker('');};document.addEventListener('keydown',listener);document.addEventListener('pointerdown',listener);return()=>{document.removeEventListener('keydown',listener);document.removeEventListener('pointerdown',listener);};},[]);
  function select(id){setRecipient(id);setReply(null);setPicker('');setReactionTarget('');stickToBottom.current=true;setNewMessages(false);setError('');}
  function changeDraft(value){setDrafts(current=>({...current,[recipient]:value}));pending.current=null;}
  async function send(stickerId){
   if(!partner||sendingRef.current||(!stickerId&&!draft.trim()))return;
   const target=recipient,text=draft,replyId=reply?.id||null;
   const payload={recipientId:target,kind:stickerId?'sticker':'text',...(stickerId?{stickerId}:{body:text}),replyTo:replyId};
   const signature=JSON.stringify(payload);if(pending.current?.signature!==signature)pending.current={signature,clientId:crypto.randomUUID()};payload.clientId=pending.current.clientId;
   sendingRef.current=true;setSending(true);setError('');
   try{
    const response=await fetch('/api/campus/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await response.json();if(!response.ok)throw Error(data.error||'Не удалось отправить сообщение.');
    setInfo(current=>current?{...current,messages:current.messages.some(m=>m.id===data.message.id)?current.messages:[...current.messages,data.message]}:current);
    if(!stickerId)setDrafts(current=>current[target]===text?{...current,[target]:''}:current);
    if(activeRecipient.current===target){setReply(null);setPicker('');stickToBottom.current=true;input.current?.focus();}pending.current=null;
   }catch(e){setError(e.message+' Сообщение можно отправить повторно.');}finally{sendingRef.current=false;setSending(false);}
  }
  async function react(message,emoji){
   const active=!message.reactions?.some(r=>r.userId===me&&r.emoji===emoji);setReactionTarget('');
   try{const response=await fetch('/api/campus/messages/'+encodeURIComponent(message.id)+'/reactions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({emoji,active})});if(!response.ok)throw Error('Не удалось сохранить реакцию.');setInfo(current=>({...current,messages:current.messages.map(m=>m.id===message.id?{...m,reactions:[...(m.reactions||[]).filter(r=>!(r.userId===me&&r.emoji===emoji)),...(active?[{userId:me,emoji}]:[])]}:m)}));}catch(e){setError(e.message);}
  }
  function insertEmoji(emoji){const start=input.current?.selectionStart??draft.length,end=input.current?.selectionEnd??start;changeDraft((draft.slice(0,start)+emoji+draft.slice(end)).slice(0,3000));requestAnimationFrame(()=>{input.current?.focus();input.current?.setSelectionRange(start+emoji.length,start+emoji.length);});}
  const contacts=(info?.contacts||[]).filter(p=>fullName(p).toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(p=>({...p,last:info.messages.findLast(m=>m.sender_id===p.id||m.recipient_id===p.id),unread:info.messages.filter(m=>m.sender_id===p.id&&m.recipient_id===me&&!m.read_at).length})).sort((a,b)=>(b.last?.created_at||0)-(a.last?.created_at||0));
  return <div className={'oc-chat '+(recipient?'has-conversation':'')}>
   <aside className="oc-chat-sidebar"><div className="oc-chat-brand"><span className="oc-eyebrow">A LITTLE CONNECTION.</span><h1>Messages<span>.</span></h1><p>На одной орбите.</p></div><label className="oc-chat-search"><Icon name="search" size={17}/><input aria-label="Поиск чатов" placeholder="Найти человека" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="oc-chat-contacts">
    {!info&&!error&&[1,2,3].map(n=><div key={n} className="oc-chat-skeleton" aria-hidden="true"/>)}
    {contacts.map(person=><button key={person.id} aria-label={'Открыть чат с '+fullName(person)} aria-pressed={recipient===person.id} className={'oc-chat-contact '+(recipient===person.id?'is-active':'')} onClick={()=>select(person.id)}><Avatar person={person} small/><span><b>{fullName(person)}</b><small>{person.last?preview(person.last):roles[person.role]}</small></span><i>{person.unread>0?<em>{person.unread}</em>:person.last&&time(person.last.created_at)}</i></button>)}
    {info&&!contacts.length&&<p className="oc-chat-no-contacts">{search?'Никого не нашли. Попробуй другое имя.':'Ученики и учителя появятся здесь после создания аккаунтов и назначения групп.'}</p>}
   </div><div className="oc-chat-sidebar-footer"><Icon name="lock" size={13}/><span>Только ты и собеседник</span></div></aside>
   <section className="oc-chat-main"><Notice error={error}/>{partner?<>
    <header className="oc-chat-header"><button className="oc-chat-mobile-back" aria-label="К списку чатов" onClick={()=>select('')}><Icon name="arrow"/></button><Avatar person={partner} small/><div><b>{fullName(partner)}</b><small>{roles[partner.role]} · ORBIT Campus</small></div><span className="oc-chat-header-badge"><i/>Личный разговор</span></header>
    <div className="oc-chat-thread" ref={thread} role="log" aria-label={'Разговор с '+fullName(partner)} aria-live="polite" onScroll={()=>{const el=thread.current;stickToBottom.current=el.scrollHeight-el.scrollTop-el.clientHeight<80;if(stickToBottom.current)setNewMessages(false);}}>
     {!messages.length&&<div className="oc-chat-start"><Sticker id="orbit-hello"/><h3>Say hello.</h3><p>Большие открытия начинаются<br/>с маленького сообщения.</p></div>}
     {messages.map((message,index)=>{const own=message.sender_id===me,quote=info.messages.find(m=>m.id===message.reply_to),reactions=chatReactions.map(emoji=>({emoji,count:(message.reactions||[]).filter(r=>r.emoji===emoji).length,mine:message.reactions?.some(r=>r.emoji===emoji&&r.userId===me)})).filter(r=>r.count);return <div key={message.id} className="oc-chat-entry">
      {(index===0||day(messages[index-1].created_at)!==day(message.created_at))&&<div className="oc-chat-day"><span>{day(message.created_at)}</span></div>}
      <article className={'oc-chat-message '+(own?'is-own':'')+' '+(message.kind==='sticker'?'is-sticker':'')}>
       <div className="oc-chat-bubble">{quote&&<div className="oc-chat-quote"><b>{quote.sender_id===me?'Ты':fullName(partner)}</b><span>{preview(quote)}</span></div>}{message.kind==='sticker'?<Sticker id={message.sticker_id}/>:<p>{message.body}</p>}<div className="oc-chat-meta"><time dateTime={new Date(message.created_at).toISOString()}>{time(message.created_at)}</time>{own&&<span className={message.read_at?'is-read':''} title={message.read_at?'Прочитано':'Отправлено'} aria-label={message.read_at?'Прочитано':'Отправлено'}>{message.read_at?'✓✓':'✓'}</span>}</div></div>
       <div className="oc-chat-message-actions"><button aria-label={'Реакция на сообщение '+time(message.created_at)} aria-expanded={reactionTarget===message.id} onClick={()=>setReactionTarget(reactionTarget===message.id?'':message.id)}>☺</button><button aria-label={'Ответить на сообщение '+time(message.created_at)} onClick={()=>{setReply(message);input.current?.focus();}}><Icon name="chat" size={14}/></button></div>
       {reactionTarget===message.id&&<div className="oc-chat-reaction-picker" role="group" aria-label="Выбрать реакцию">{chatReactions.map(emoji=><button key={emoji} aria-label={'Поставить реакцию '+emoji} onClick={()=>react(message,emoji)}>{emoji}</button>)}</div>}
       {reactions.length>0&&<div className="oc-chat-reactions">{reactions.map(r=><button key={r.emoji} className={r.mine?'is-mine':''} aria-label={'Реакция '+r.emoji+', '+r.count} aria-pressed={r.mine} onClick={()=>react(message,r.emoji)}>{r.emoji}<span>{r.count}</span></button>)}</div>}
      </article></div>;})}
    </div>
    {newMessages&&<button className="oc-chat-new" onClick={()=>{thread.current?.scrollTo({top:thread.current.scrollHeight,behavior:'smooth'});setNewMessages(false);}}>Новые сообщения ↓</button>}
    <div className="oc-chat-compose-area" ref={pickerRef}>
     {picker&&<section className="oc-chat-picker" role="dialog" aria-label={picker==='stickers'?'Стикеры ORBIT':'Выбор эмодзи'}><header><div><span className="oc-eyebrow">MADE TO CONNECT.</span><b>{picker==='stickers'?'Little Orbit. Big feelings.':'Добавь настроение'}</b></div><button aria-label="Закрыть стикеры и эмодзи" onClick={()=>setPicker('')}><Icon name="close" size={17}/></button></header>{picker==='stickers'?<div className="oc-chat-sticker-grid">{chatStickers.map(sticker=><button key={sticker.id} disabled={sending} aria-label={'Отправить стикер '+sticker.caption} onClick={()=>send(sticker.id)}><Sticker id={sticker.id} small/></button>)}</div>:<><div className="oc-chat-emoji-tabs" role="tablist" aria-label="Категории эмодзи">{emojiGroups.map((group,index)=><button key={group.name} role="tab" aria-selected={emojiTab===index} onClick={()=>setEmojiTab(index)}>{group.name}</button>)}</div><div className="oc-chat-emoji-grid">{emojiGroups[emojiTab].items.map(emoji=><button key={emoji} aria-label={'Вставить '+emoji} onClick={()=>insertEmoji(emoji)}>{emoji}</button>)}</div></>}</section>}
     {reply&&<div className="oc-chat-reply"><Icon name="chat" size={17}/><div><b>Ответ {reply.sender_id===me?'себе':fullName(partner)}</b><span>{preview(reply)}</span></div><button aria-label="Отменить ответ" onClick={()=>setReply(null)}><Icon name="close" size={16}/></button></div>}
     <form className="oc-chat-compose" onSubmit={e=>{e.preventDefault();send();}}><div className="oc-chat-tools"><button type="button" aria-label="Эмодзи" aria-expanded={picker==='emoji'} onClick={()=>setPicker(picker==='emoji'?'':'emoji')}>☺</button><button type="button" aria-label="Стикеры ORBIT" aria-expanded={picker==='stickers'} onClick={()=>setPicker(picker==='stickers'?'':'stickers')}><Icon name="star" size={20}/></button></div><textarea ref={input} aria-label="Сообщение" placeholder="Напиши что-нибудь хорошее…" value={draft} maxLength={3000} rows={1} onChange={e=>changeDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send();}}}/><button type="submit" className="oc-chat-send" disabled={sending||!draft.trim()} aria-label={sending?'Отправляем сообщение':'Отправить сообщение'}><Icon name={sending?'wave':'send'} size={20}/></button></form><div className="oc-chat-compose-hint"><span>Enter — отправить · Shift + Enter — новая строка</span><span>{draft.length>2700?draft.length+' / 3000':'Слова, которые сближают.'}</span></div>
    </div>
   </>:<div className="oc-chat-welcome"><span className="oc-eyebrow">YOUR PEOPLE. YOUR ORBIT.</span><div className="oc-chat-welcome-art"><Sticker id="orbit-hello"/><span>✦</span><span>✧</span></div><h2>A little closer<span>.</span></h2><p>Спроси о сложном. Поделись успехом.<br/>Просто скажи hello.</p><div className="oc-chat-welcome-note"><Icon name="chat" size={16}/>Выбери человека в списке, чтобы начать разговор.</div><div className="oc-chat-pack-preview">{chatStickers.slice(1,4).map(s=><Sticker key={s.id} id={s.id} small/>)}</div></div>}</section>
  </div>;
 };
}
