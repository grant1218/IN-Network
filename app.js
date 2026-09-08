const seedEvents = [
  {
    id:'barrys-pura', title:"Barry's UES → Pura Vida", desc:"11AM class, then grabbing Pura Vida after. Come for one or both.", when:'SAT · 11:00 AM', place:"Barry's UES", organizer:'Alex Cook', initials:'AC', path:['You','Grant','Alex'], degree:2, people:['Alex','Grant','Hannah','Jess'], joined:false, pin:null,
    messages:[{name:'Alex',text:'Booked 11AM. Pura Vida right after.'},{name:'Grant',text:"I may skip Barry's and meet you guys after 😂"}]
  },
  {
    id:'sheepshead', title:'Sheepshead Bay day', desc:'Heading out around noon. Bring a blanket, snacks and sunscreen. Let’s hang.', when:'TODAY · 12:00 PM', place:'Sheepshead Bay', organizer:'Alex Cook', initials:'AC', path:['You','Marney','Grant','Alex'], degree:3, people:['Alex','Marney','Sofia','Nina','Ben'], joined:false, pin:'Sheepshead Bay — left side of the main lawn',
    messages:[{name:'Alex',text:'I’m wearing a yellow shirt. We’re to the left of the trees.'}]
  },
  {
    id:'moma', title:'MoMA after hours', desc:'Going around 6:30 Thursday. Dinner nearby after if people are feeling it.', when:'THU · 6:30 PM', place:'MoMA', organizer:'Jessica Lee', initials:'JL', path:['You','Caroline','Jessica'], degree:2, people:['Jessica','Caroline','Priya','Maya','Tom','Ari'], joined:false, pin:null,
    messages:[{name:'Jessica',text:'I’ll send the exact entrance once I’m there.'}]
  }
];

let events = JSON.parse(localStorage.getItem('in-network-events') || 'null') || seedEvents;
const feed = document.querySelector('#feed');
const template = document.querySelector('#eventCardTemplate');
const eventDialog = document.querySelector('#eventDialog');
const eventDetail = document.querySelector('#eventDetail');
const createDialog = document.querySelector('#createDialog');
const save = () => localStorage.setItem('in-network-events', JSON.stringify(events));

function renderFeed(){
  feed.innerHTML='';
  events.forEach(event=>{
    const node=template.content.cloneNode(true);
    node.querySelector('.event-time').textContent=event.when;
    node.querySelector('.distance').textContent=`${event.degree}° FROM YOU`;
    node.querySelector('.event-title').textContent=event.title;
    node.querySelector('.event-desc').textContent=event.desc;
    node.querySelector('.organizer').textContent=event.organizer;
    node.querySelector('.avatar').textContent=event.initials;
    node.querySelector('.connection').textContent=`How you're IN: ${event.path.join(' → ')}`;
    node.querySelector('.attendees').textContent=`${event.people.length} PEOPLE IN · ${event.people.slice(0,4).join(' · ')}${event.people.length>4?' + more':''}`;
    const join=node.querySelector('.join-btn');
    join.textContent=event.joined?'YOU’RE IN':"I'M IN";
    if(event.joined) join.classList.add('joined');
    join.addEventListener('click',()=>joinEvent(event.id));
    node.querySelector('.details-btn').addEventListener('click',()=>openEvent(event.id));
    feed.appendChild(node);
  });
}

function joinEvent(id){
  const event=events.find(e=>e.id===id);
  if(!event.joined){
    event.joined=true;
    if(!event.people.includes('You')) event.people.push('You');
    event.messages.push({name:'IN',text:'You joined this IN. The private chat is now open.'});
    save(); renderFeed();
  }
  openEvent(id);
}

function openEvent(id){
  const event=events.find(e=>e.id===id);
  eventDetail.innerHTML=`
    <div class="detail-head"><div class="eyebrow">IN</div><button class="icon-btn" id="closeEvent">×</button></div>
    <div class="event-meta"><span>${event.when}</span><span>${event.degree}° FROM YOU</span></div>
    <h2 class="detail-title">${event.title}</h2>
    <p class="event-desc">${event.desc}</p>
    <div class="trust-box"><div class="section-kicker">HOW YOU'RE IN</div><div class="trust-path">${event.path.join(' → ')}</div></div>
    <div class="participant-list">${event.people.map(p=>`<span class="person-chip">${p}</span>`).join('')}</div>
    ${event.joined ? joinedView(event) : `<button class="primary wide" id="detailJoin">I'M IN</button>`}
  `;
  eventDialog.showModal();
  document.querySelector('#closeEvent').onclick=()=>eventDialog.close();
  const detailJoin=document.querySelector('#detailJoin'); if(detailJoin) detailJoin.onclick=()=>joinEvent(event.id);
  wireJoinedActions(event);
}

function joinedView(event){
  return `
    <div class="pin-box">
      <div class="section-kicker">MEETING POINT</div>
      ${event.pin ? `<div class="pin-live"><span class="dot"></span> PIN LIVE</div><h3>${event.pin}</h3>` : `<h3>${event.place}</h3><div class="tiny">Organizer has not dropped a live arrival pin yet.</div>`}
      ${event.organizer==='You' ? `<button class="ghost" id="dropPin">${event.pin?'UPDATE PIN':'DROP LIVE PIN'}</button>`:''}
    </div>
    <div class="chat-box">
      <div class="section-kicker">PRIVATE IN CHAT</div>
      <div class="chat-log">${event.messages.map(m=>`<div class="msg"><strong>${m.name}</strong>${m.text}</div>`).join('')}</div>
      <div class="chat-compose"><input id="chatInput" placeholder="Ask where they are, what to bring, hype it up…"><button class="primary" id="sendChat">SEND</button></div>
    </div>
    <div class="stay-box">
      <div class="section-kicker">AFTER YOU GO</div>
      <h3>Want to stay directly IN with someone you met?</h3>
      <div class="post-actions">${event.people.filter(p=>p!=='You').slice(0,4).map(p=>`<div class="request-row"><span>${p}</span><button class="ghost stay-btn" data-person="${p}">STAY IN</button></div>`).join('')}</div>
      <div class="tiny">Direct IN requests are private and only connect when both people choose it.</div>
    </div>`;
}

function wireJoinedActions(event){
  const send=document.querySelector('#sendChat');
  if(send) send.onclick=()=>{
    const input=document.querySelector('#chatInput');
    if(!input.value.trim()) return;
    event.messages.push({name:'You',text:input.value.trim()}); save(); openEvent(event.id);
  };
  const pin=document.querySelector('#dropPin');
  if(pin) pin.onclick=()=>{
    const value=prompt('Where exactly should everyone meet?', event.pin || event.place);
    if(value){event.pin=value; event.messages.push({name:'IN',text:`Live pin updated: ${value}`}); save(); openEvent(event.id);}
  };
  document.querySelectorAll('.stay-btn').forEach(btn=>btn.onclick=()=>{
    btn.textContent='REQUESTED'; btn.disabled=true;
  });
}

document.querySelector('#createOpen').onclick=()=>createDialog.showModal();
document.querySelector('#createForm').addEventListener('submit',e=>{
  e.preventDefault();
  const text=document.querySelector('#planText').value.trim();
  const whenRaw=document.querySelector('#planWhen').value;
  const place=document.querySelector('#planPlace').value.trim();
  const radius=Number(document.querySelector('#planRadius').value);
  if(!text||!whenRaw||!place) return;
  const dt=new Date(whenRaw);
  const when=dt.toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'}).toUpperCase();
  const title=text.split(/[.!?]/)[0].slice(0,58);
  const event={id:`in-${Date.now()}`,title,desc:text,when,place,organizer:'You',initials:'YOU',path:['You'],degree:0,people:['You'],joined:true,pin:null,messages:[{name:'You',text:text}]};
  events.unshift(event); save(); renderFeed(); createDialog.close(); document.querySelector('#createForm').reset(); openEvent(event.id);
});

eventDialog.addEventListener('click',e=>{if(e.target===eventDialog) eventDialog.close();});
createDialog.addEventListener('click',e=>{if(e.target===createDialog) createDialog.close();});
renderFeed();