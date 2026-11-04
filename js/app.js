import*as T from 'three';
import{W}from'./words.js';
import{firebaseConfig}from'./firebase-config.js';
import{initializeApp}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import{getDatabase,ref,set,get,query,orderByChild,limitToLast,serverTimestamp}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import{getAuth,onAuthStateChanged,signInWithPopup,GoogleAuthProvider,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
const $=s=>document.querySelector(s),h=s=>$('#main').innerHTML=s,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const L=['A1','A2','B1','B2','C1'],LC={A1:0x3ddc97,A2:0x4cc9f0,B1:0x7c9cff,B2:0xc77dff,C1:0xff6b81};
const dayOf=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},day=()=>dayOf(Date.now()),sh=v=>v.split(/[;,(]/)[0].trim(),rnd=a=>a[Math.random()*a.length|0];
function def(){return{xp:0,streak:0,last:'',day:day(),nn:0,rv:0,cards:{},lv:['A1','A2'],nd:10,acc:'en-GB',auto:false,name:'',upd:0,best:0,owner:'',fx:true,sfx:true}}
let S;try{S=Object.assign(def(),JSON.parse(localStorage.vv))}catch{S=def()}
if(S.day!==day()){S.day=day();S.nn=0;S.rv=0}
const lvl=()=>Math.floor(Math.sqrt(S.xp/50))+1;
/* ---------- Firebase (Auth + Realtime DB) ---------- */
const app=initializeApp(firebaseConfig),db=getDatabase(app),au=getAuth(app);
let usr=null,uid='',cs='Chưa đăng nhập – dữ liệu chỉ lưu trên máy',tm;
const EM={'auth/invalid-credential':'Sai email hoặc mật khẩu','auth/email-already-in-use':'Email đã được đăng ký','auth/weak-password':'Mật khẩu tối thiểu 6 ký tự','auth/invalid-email':'Email không hợp lệ','auth/popup-closed-by-user':'Bạn đã đóng cửa sổ đăng nhập','auth/unauthorized-domain':'Domain chưa được thêm vào Authorized domains (xem README)','auth/network-request-failed':'Mất kết nối mạng'};
const err=e=>EM[e.code]||e.code||e.message;
const refresh=()=>{if(tab=='me'||tab=='home')V[tab]()};
function merge(a,b){const n=a.upd>=b.upd?a:b,r=Object.assign(def(),n),ca=a.cards||{},cb=b.cards||{};r.cards={...cb,...ca};for(const k in cb)if(ca[k]&&(cb[k].ts||0)>(ca[k].ts||0))r.cards[k]=cb[k];
 r.xp=Math.max(a.xp||0,b.xp||0);r.best=Math.max(a.best||0,b.best||0);r.upd=Date.now();if(r.day!==day()){r.day=day();r.nn=0;r.rv=0}return r}
async function push(){await set(ref(db,'users/'+uid),S);await set(ref(db,'leaderboard/'+uid),{n:S.name||'Ẩn danh',xp:S.xp,st:S.streak,lv:lvl(),t:serverTimestamp()})}
async function pull(){cs='⏳ Đang đồng bộ…';refresh();try{const d=(await get(ref(db,'users/'+uid))).val();
 if(d){const nc={};Object.entries(d.cards||{}).forEach(([k,v])=>{if(v)nc[k]=v});d.cards=nc}
 if(S.owner&&S.owner!==uid)S=d?Object.assign(def(),d):def();else S=d?merge(S,d):S;
 S.owner=uid;if(!S.name)S.name=(usr.displayName||'').slice(0,16);localStorage.vv=JSON.stringify(S);await push();cs='☁️ Đã đồng bộ'}catch(e){cs='📴 Lỗi đồng bộ: '+(e.code||e.message)}refresh()}
function cloud(){if(!usr)return;clearTimeout(tm);tm=setTimeout(()=>push().then(()=>cs='☁️ Đã đồng bộ').catch(e=>cs='📴 Lỗi: '+(e.code||'')),2500)}
function save(){S.upd=Date.now();localStorage.vv=JSON.stringify(S);cloud()}
onAuthStateChanged(au,u=>{usr=u;uid=u?u.uid:'';if(u)pull();else{cs='Chưa đăng nhập – dữ liệu chỉ lưu trên máy';refresh()}});
const acct=()=>usr?`<div class="card"><b>☁️ Tài khoản</b><div class="m" style="margin:6px 0">${esc(usr.email||usr.displayName||'')}<br>${cs}</div><button class="btn s" data-a="logout">Đăng xuất</button></div>`
:`<div class="card"><b>Đăng nhập để đồng bộ & lên bảng xếp hạng</b><div class="m" style="margin:6px 0">${cs}</div><button class="btn" data-a="google">Đăng nhập bằng Google</button><input id="em" type="email" placeholder="Email" style="margin-top:10px"><input id="pw" type="password" placeholder="Mật khẩu (từ 6 ký tự)" style="margin-top:8px"><div class="row"><button class="btn s" data-a="login">Đăng nhập</button><button class="btn s" data-a="signup">Đăng ký</button></div><button class="chip" data-a="reset">Quên mật khẩu?</button></div>`;
/* ---------- Logic ---------- */
function addXP(n){if(S.last!==day()){const y=dayOf(Date.now()-864e5);S.streak=S.last===y?S.streak+1:1;S.last=day()}S.xp+=n}
function nxt(c,g){c=Object.assign({n:0,ef:2.5,iv:0,lp:0},c);if(g==0){c.n=0;c.iv=0;c.due=Date.now()+6e4;c.lp++;c.ef=Math.max(1.3,c.ef-.2)}
 else{if(g==1)c.iv=Math.max(1,c.iv*1.2);else if(g==2)c.iv=c.n==0?1:c.n==1?3:Math.round(c.iv*c.ef);else{c.iv=c.n==0?3:Math.round(Math.max(c.iv,1)*c.ef*1.3);c.ef+=.15}c.n++;c.due=Date.now()+c.iv*864e5}c.ts=Date.now();return c}
const ivl=(c,g)=>g==0?'<1p':(n=>n<1?'1 ngày':Math.round(n)+' ngày')(nxt(c,g).iv);
function grade(i,g){const nw=!S.cards[i];S.cards[i]=nxt(S.cards[i],g);nw?S.nn++:S.rv++}
function buildQ(){const now=Date.now();let d=[],n=[];W.forEach((x,i)=>{const c=S.cards[i];if(c){if(c.due<=now)d.push(i)}else if(S.lv.includes(x.c))n.push(i)});d.sort((a,b)=>S.cards[a].due-S.cards[b].due);return[...d.slice(0,40),...n.slice(0,Math.max(0,S.nd-S.nn))]}
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=S.acc;u.rate=.9;speechSynthesis.speak(u)}catch{}}
/* ---------- Âm thanh (Web Audio: tự tạo bằng code, không cần file, chạy offline) ---------- */
let AC=null,MG=null;
function ac(){if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();MG=AC.createGain();MG.gain.value=.6;const cp=AC.createDynamicsCompressor();MG.connect(cp);cp.connect(AC.destination)}if(AC.state=='suspended')AC.resume();return AC}
function tone(f,t0,d,o={}){const c=ac();if(!c)return;const t=c.currentTime+t0,os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.slide)os.frequency.exponentialRampToValueAtTime(f*o.slide,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.2,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);os.connect(g);g.connect(MG);os.start(t);os.stop(t+d+.05)}
const PEN=[0,2,4,7,9,12,14,16];
const SFX={
 ok(c){const f=523.25*Math.pow(2,PEN[Math.min(Math.max(c,1),8)-1]/12);tone(f,0,.16,{v:.18});tone(f*1.5,.07,.26,{v:.14})},
 no(){tone(200,0,.28,{type:'triangle',v:.2,slide:.75});tone(150,.13,.32,{type:'triangle',v:.18,slide:.75})},
 flip(){tone(420,0,.09,{type:'triangle',v:.1,slide:1.7})},
 good(g){const f=[440,440,587,784][g]||587;tone(f,0,.12,{v:.15});if(g==3)tone(f*1.25,.07,.2,{v:.12})},
 again(){tone(240,0,.18,{type:'triangle',v:.12,slide:.8})},
 tick(){tone(1200,0,.05,{type:'square',v:.04})},
 win(){[523,659,784,1047].forEach((f,i)=>tone(f,i*.1,.28,{v:.15}))},
 lose(){tone(392,0,.2,{type:'triangle',v:.16});tone(330,.18,.35,{type:'triangle',v:.16})},
 lvl(){[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,i*.08,.3,{v:.14}))}};
const sfx=(n,a)=>{if(S.sfx===false)return;try{SFX[n](a)}catch{}};
document.addEventListener('pointerdown',()=>{if(S.sfx!==false)ac()},{once:true,capture:true});
const hl=(s,w)=>{const r=new RegExp('\\b'+w.replace(/[^a-z]/gi,'')+'\\w*','i');return esc(s).replace(r,m=>'<mark>'+m+'</mark>')};
/* ---------- Three.js ---------- */
const R=new T.WebGLRenderer({canvas:$('#gl'),antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,200);cam.position.z=14;
let zf=16;const rs=()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
 zf=Math.max(15,Math.min(60,11/(Math.tan(Math.PI/6)*cam.aspect)));/* khoảng cách camera để cả thiên hà vừa chiều ngang màn hình */
 gm.uniforms.k.value=innerHeight*R.getPixelRatio()/(2*Math.tan(Math.PI/6))};
const bg=new T.Group();sc.add(bg);const N=900,pa=new Float32Array(N*3).map(()=>(Math.random()-.5)*50);
const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pa,3));
const pm=new T.PointsMaterial({size:.13,color:0x9db4ff,transparent:true,opacity:.85}),base=new T.Color(0x9db4ff);bg.add(new T.Points(pg,pm));
const cr=new T.Mesh(new T.IcosahedronGeometry(2.4,1),new T.MeshBasicMaterial({color:0x7c9cff,wireframe:true,transparent:true,opacity:.35}));cr.position.set(0,6,-6);bg.add(cr);
const gal=new T.Group();gal.visible=false;sc.add(gal);const GN=W.length,gp=new Float32Array(GN*3),gc=new Float32Array(GN*3),gz=new Float32Array(GN);
/* Mỗi từ có 1 vị trí cố định (seed) nên ngôi sao không nhảy chỗ giữa các lần mở. Cấp độ xếp theo vành: A1 trong cùng → C1 ngoài cùng, 3 nhánh xoắn ốc. */
const rg=(q=>()=>{q=q+0x6D2B79F5|0;let t=Math.imul(q^q>>>15,1|q);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(20240601),gs=()=>(rg()+rg()+rg()-1.5)*.8;
const lc={},ls={};W.forEach((x,i)=>{lc[x.c]=(lc[x.c]||0)+1;if(ls[x.c]==null)ls[x.c]=i});
W.forEach((x,i)=>{const f=(ls[x.c]+rg()*lc[x.c])/GN,r=.6+Math.pow(f,.7)*9.4,a=(rg()*3|0)*2.0944+r*.62+gs()*(.3+.05*r);
 gp[i*3]=Math.cos(a)*r;gp[i*3+1]=gs()*.5*(1.25-r/12);gp[i*3+2]=Math.sin(a)*r});
const gg=new T.BufferGeometry();gg.setAttribute('position',new T.BufferAttribute(gp,3));gg.setAttribute('aCol',new T.BufferAttribute(gc,3));gg.setAttribute('aSize',new T.BufferAttribute(gz,1));
/* Điểm sáng tròn, mờ dần ra rìa (thay cho ô vuông của PointsMaterial); kích thước riêng cho từng sao */
const gm=new T.ShaderMaterial({uniforms:{k:{value:600}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:'attribute vec3 aCol;attribute float aSize;varying vec3 vc;uniform float k;void main(){vc=aCol;vec4 m=modelViewMatrix*vec4(position,1.);gl_PointSize=max(aSize*k/-m.z,1.5);gl_Position=projectionMatrix*m;}',
 fragmentShader:'varying vec3 vc;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(vc,pow(1.-d,1.6));\n#include <colorspace_fragment>\n}'});
gal.add(new T.Points(gg,gm));gal.rotation.x=.5;rs();addEventListener('resize',()=>{rs();if(gal.visible)cam.position.z=zf});
const WH=new T.Color(0xffffff);
/* chưa học: chấm mờ nhỏ · đang học: sáng, to hơn · thuộc lòng: rất sáng, hơi ngả trắng */
function paintGal(){const c=new T.Color();W.forEach((x,i)=>{const d=S.cards[i],m=d&&d.iv>=21;c.setHex(LC[x.c]);if(m)c.lerp(WH,.45);c.multiplyScalar(!d?.28:m?1.5:.95);gc.set([c.r,c.g,c.b],i*3);gz[i]=!d?.14:m?.62:.4});gg.attributes.aCol.needsUpdate=true;gg.attributes.aSize.needsUpdate=true}
let pulse=0,px=0,py=0;const burst=ok=>{pm.color.set(ok?0x3ddc97:0xff6b81);pulse=1};
addEventListener('pointermove',e=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5});
const ptrs=new Map();let pd=0;const cv=$('#gl');
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);pd=0});
const up=e=>{ptrs.delete(e.pointerId);pd=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p||!gal.visible)return;
 if(ptrs.size==1){gal.rotation.y+=(e.clientX-p[0])*.008;gal.rotation.x=Math.max(-1.4,Math.min(1.4,gal.rotation.x+(e.clientY-p[1])*.006))}
 ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(ptrs.size==2){const[a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd&&d)cam.position.z=Math.max(5,Math.min(zf*1.3,cam.position.z*pd/d));pd=d}});
(function loop(){requestAnimationFrame(loop);pulse*=.94;pm.color.lerp(base,.03);const t=performance.now()/1000;
 if(bg.visible){bg.rotation.y+=(px*.6-bg.rotation.y)*.03+.0008;bg.rotation.x+=(py*.4-bg.rotation.x)*.03;bg.scale.setScalar(1+pulse*.25);cr.rotation.x=t*(.3+S.streak*.03);cr.rotation.y=t*.4}
 if(gal.visible&&!ptrs.size)gal.rotation.y+=.0016;const on=S.fx||tab=='galaxy';cv.style.visibility=on?'visible':'hidden';if(on)R.render(sc,cam)})();
/* ---------- Views ---------- */
let tab='home',Q=null,qi=0,fl=false,G=null;const V={};
const go=t=>{if(G)G.over=1;clearInterval(G?.tm);if(t=='learn'&&tab!='learn')Q=null;tab=t;document.body.classList.toggle('gal',t=='galaxy');bg.visible=t!='galaxy';gal.visible=t=='galaxy';cam.position.z=t=='galaxy'?zf:14;
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==t));$('#main').scrollTop=0;if(t=='galaxy')paintGal();V[t]()};
V.home=()=>{const ids=Object.keys(S.cards),mast=ids.filter(i=>S.cards[i].iv>=21).length,due=ids.filter(i=>S.cards[i].due<=Date.now()).length,nl=Math.max(0,S.nd-S.nn);
 const bars=L.map(l=>{const tot=W.filter(x=>x.c==l).length,k=ids.filter(i=>W[i].c==l).length;return`<div class="m">${l} · ${k}/${tot}</div><div class="bar"><i style="width:${k/tot*100}%;background:#${LC[l].toString(16).padStart(6,0)}"></i></div>`}).join('');
 h(`<h2>Xin chào${S.name?', '+esc(S.name):''} 👋</h2><div class="row"><div class="card st"><b>🔥 ${S.streak}</b><span class="m">ngày liên tiếp</span></div><div class="card st"><b>Lv ${lvl()}</b><span class="m">${S.xp} XP</span></div><div class="card st"><b>${S.nn}/${S.nd}</b><span class="m">từ mới hôm nay</span></div></div>
 <div class="card"><b>Hôm nay</b><div class="m">${due} từ cần ôn · ${nl} từ mới</div><button class="btn" data-a="go" data-v="learn">Bắt đầu học</button><button class="btn s" data-a="go" data-v="play">Chơi luyện tập</button></div>
 <div class="card"><b>Tiến độ Oxford 5000</b> <span class="m">· ${ids.length} đã học · ${mast} thuộc lòng</span><div style="margin-top:8px">${bars}</div></div>
 <div class="card"><b>🔎 Tra từ</b><input id="q" placeholder="Gõ tiếng Anh hoặc tiếng Việt…" style="margin-top:8px"><div id="sr"></div></div>`);
 $('#q').oninput=e=>{const q=e.target.value.trim().toLowerCase();$('#sr').innerHTML=q.length<2?'':W.map((x,i)=>[x,i]).filter(([x])=>x.w.toLowerCase().startsWith(q)||x.v.toLowerCase().includes(q)).slice(0,25).map(([x,i])=>`<div class="lr" data-a="say" data-v="${i}"><span><b>${esc(x.w)}</b> <span class="m">${esc(x.ph)} · ${x.c}</span><br><span class="m">${esc(sh(x.v))}</span></span><span>🔊</span></div>`).join('')}};
V.learn=()=>{if(!Q){Q=buildQ();qi=0}fl=false;
 if(qi>=Q.length){if(Q.length)sfx('win');return h(`<div class="card ct"><div style="font-size:56px">${Q.length?'🎉':'✅'}</div><h2>${Q.length?'Hoàn thành phiên học!':'Không còn thẻ nào'}</h2><p class="m">Có thể đổi số từ mới mỗi ngày hoặc cấp độ trong mục Tôi.</p><button class="btn" data-a="go" data-v="play">Luyện tập thêm 🎮</button><button class="btn s" data-a="go" data-v="home">Trang chủ</button></div>`)}
 const i=Q[qi],x=W[i],c=S.cards[i],bc=['#ff6b81','#ffd166','#3ddc97','#4cc9f0'],lb=['Quên','Khó','Tốt','Dễ'];
 h(`<div class="m ct">${qi+1}/${Q.length} · ${c?'Ôn tập':'Từ mới'}</div><div class="bar"><i style="width:${qi/Q.length*100}%"></i></div>
 <div class="flip" data-a="flip"><div class="fc"><div class="face"><span class="badge">${x.c} · ${x.l.replace('Oxford ','O')}</span><div class="w">${esc(x.w)}</div><div class="m" style="font-size:20px">${esc(x.ph)}</div><button class="sp" data-a="say" data-v="${i}">🔊</button><span class="m">Chạm để lật</span></div>
 <div class="face bk"><div class="m">${esc(x.p)}</div><div style="font-size:22px;font-weight:600;margin:6px 0 14px">${esc(x.v)}</div><div>${hl(x.e,x.w)}</div><div class="m" style="margin-top:4px">${esc(x.t)}</div></div></div></div>
 <div class="gr hide" id="gr">${[0,1,2,3].map(g=>`<button style="background:${bc[g]}" data-a="gr" data-v="${g}">${lb[g]}<small>${ivl(c,g)}</small></button>`).join('')}</div>${c?'':'<button class="btn s" data-a="known">✔ Đã biết từ này</button>'}`);
 if(S.auto)speak(x.w)};
const modes={mc:['🔤','Trắc nghiệm','Anh → Việt'],mc2:['🇻🇳','Đoán từ','Việt → Anh'],listen:['🎧','Nghe & chọn','Luyện nghe'],cloze:['✍️','Điền chỗ trống','Từ trong câu'],type:['⌨️','Gõ từ','Nhớ chính tả'],speed:['⚡','Tốc độ 60s','Kỷ lục: '+S.best]};
V.play=()=>h(`<h2>Chơi & luyện tập</h2><div class="grid">${Object.entries(modes).map(([k,[e,n,s]])=>`<button class="gm" data-a="play" data-v="${k}"><b>${e}</b>${n}<br><span>${s}</span></button>`).join('')}</div><p class="m ct">Mỗi câu đúng +10 XP, combo tăng thêm. Trả lời sai sẽ đưa từ về ôn lại.</p>`);
function startGame(m){let pool=Object.keys(S.cards).map(Number);if(pool.length<12){pool=[];W.forEach((x,i)=>{if(S.lv.includes(x.c)&&pool.length<80)pool.push(i)})}
 G={m,pool,n:0,ok:0,xp:0,combo:0,max:m=='speed'?999:10,end:Date.now()+6e4};if(m=='speed')G.tm=setInterval(()=>{const s=Math.max(0,Math.ceil((G.end-Date.now())/1e3)),e=$('#tm');if(s!=G.ls){G.ls=s;if(s>0&&s<=5)sfx('tick')}if(e)e.textContent='⏱ '+s;if(!s)fin()},250);nextQ()}
function mkQ(m,pool){const i=rnd(pool),x=W[i],dis=f=>{const o=[f(x)];let g=0;while(o.length<4&&g++<300){const y=rnd(W),z=f(y);if((y.c==x.c||g>150)&&!o.includes(z))o.push(z)}return o.sort(()=>Math.random()-.5)};
 if(m=='cloze'&&!(/^[a-z]+$/i.test(x.w)&&new RegExp('\\b'+x.w+'\\w*','i').test(x.e)))m='mc';
 if(m=='type'&&!/^[a-z' -]+$/i.test(x.w))m='mc2';
 const q={i,m,a:x.w};
 if(m=='mc'){q.p=`<div class="w">${esc(x.w)}</div><div class="m">${esc(x.ph)}</div>`;q.o=dis(y=>sh(y.v));q.a=sh(x.v);q.s=x.w}
 else if(m=='mc2'){q.p=`<div style="font-size:24px;font-weight:600">${esc(sh(x.v))}</div><div class="m">${esc(x.p)}</div>`;q.o=dis(y=>y.w)}
 else if(m=='listen'){q.p=`<button class="sp" style="width:90px;height:90px;font-size:38px" data-a="spq">🔊</button><div class="m">Chạm để nghe lại</div>`;q.o=dis(y=>y.w);q.s=x.w}
 else if(m=='cloze'){q.p=`<div style="font-size:20px">${esc(x.e).replace(new RegExp('\\b'+x.w+'\\w*','i'),'<mark>_____</mark>')}</div><div class="m" style="margin-top:6px">${esc(x.t)}</div>`;q.o=dis(y=>y.w)}
 else{q.p=`<div style="font-size:24px;font-weight:600">${esc(sh(x.v))}</div><div class="m">${esc(x.p)} · gợi ý: ${esc(x.w[0])}${x.w.slice(1).replace(/[a-z]/gi,' _')}</div>`}
 return q}
function nextQ(){if(G.n>=G.max)return fin();const q=G.q=mkQ(G.m=='speed'?'mc':G.m,G.pool);G.done=false;
 h(`<div class="row m"><span>${G.m=='speed'?'<span id="tm">⏱ 60</span>':G.n+1+'/'+G.max}</span><span style="text-align:center">✅ ${G.ok}</span><span style="text-align:right">🔥 combo ${G.combo}</span></div>
 <div class="card ct" style="min-height:160px;display:flex;flex-direction:column;justify-content:center;align-items:center;margin-top:10px">${q.p}</div>
 ${q.o?q.o.map((o,k)=>`<button class="op" data-a="pick" data-v="${k}">${esc(o)}</button>`).join(''):`<input id="ti" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="Gõ từ tiếng Anh…"><button class="btn" data-a="chk">Kiểm tra</button>`}
 <button class="btn s" data-a="go" data-v="play" style="margin-top:14px">Thoát</button>`);
 if(q.m=='listen')speak(q.s);if($('#ti')){$('#ti').focus();$('#ti').onkeydown=e=>{if(e.key=='Enter')A.chk()}}}
function answer(ok,given){if(G.done||G.over)return;G.done=true;const q=G.q;G.n++;burst(ok);
 if(ok){G.ok++;G.combo++;G.xp+=10+Math.min(G.combo,10)}else G.combo=0;sfx(ok?'ok':'no',G.combo);
 if(S.cards[q.i])S.cards[q.i]=nxt(S.cards[q.i],ok?2:0);if(q.s&&q.m!='listen')speak(W[q.i].w);
 document.querySelectorAll('.op').forEach((b,k)=>{if(q.o[k]==q.a)b.classList.add('ok');else if(k==given)b.classList.add('no')});
 if(q.m=='type'){const t=$('#ti');t.style.borderColor=ok?'#3ddc97':'#ff6b81';if(!ok)t.value=W[q.i].w}
 setTimeout(()=>G&&!G.over&&tab=='play'&&nextQ(),ok?650:1500)}
function fin(){if(G.over)return;G.over=1;clearInterval(G.tm);const bonus=G.ok>=G.max*.8||G.m=='speed'&&G.ok>=10?20:0;G.xp+=bonus;const l0=lvl();addXP(G.xp);if(G.m=='speed'&&G.ok>S.best)S.best=G.ok;save();const m=G.m,n=G.n||1;sfx(lvl()>l0?'lvl':G.ok/n>=.5?'win':'lose');
 h(`<div class="card ct"><div style="font-size:56px">${G.ok/n>=.8?'🏆':'💪'}</div><h2>${G.ok}/${G.n} đúng</h2><p class="m">+${G.xp} XP${bonus?' (gồm thưởng '+bonus+')':''} · Lv ${lvl()}</p><button class="btn" data-a="play" data-v="${m}">Chơi lại</button><button class="btn s" data-a="go" data-v="play">Chọn chế độ khác</button></div>`)}
V.galaxy=()=>{const ids=Object.keys(S.cards),mast=ids.filter(i=>S.cards[i].iv>=21).length;h(`<div class="card" style="pointer-events:none"><h3>🌌 Thiên hà từ vựng</h3><div class="m">Mỗi chấm sáng là một từ bạn đã học · ${ids.length}/${W.length} từ · ${mast} thuộc lòng</div><div style="margin-top:6px">${L.map(l=>`<span style="color:#${LC[l].toString(16).padStart(6,0)}">● ${l} </span>`).join('')}</div><div class="m" style="margin-top:6px">Vuốt để xoay · chụm hai ngón để thu phóng</div></div>`)};
V.me=()=>{h(`<h2>Hồ sơ</h2><div class="card"><div class="m">Tên hiển thị (bảng xếp hạng)</div><input id="nm" value="${esc(S.name)}" maxlength="16" placeholder="Ẩn danh"></div>
 <div class="card"><b>Cấp độ muốn học</b><div>${L.map(l=>`<button class="chip ${S.lv.includes(l)?'on':''}" data-a="lv" data-v="${l}">${l}</button>`).join('')}</div>
 <div class="lr"><span>Từ mới mỗi ngày</span><span><button class="chip" data-a="nd" data-v="-5">−</button><b>${S.nd}</b><button class="chip" data-a="nd" data-v="5">+</button></span></div>
 <div class="lr"><span>Giọng đọc</span><button class="chip on" data-a="acc">${S.acc=='en-GB'?'🇬🇧 Anh':'🇺🇸 Mỹ'}</button></div>
 <div class="lr"><span>Tự động đọc khi học</span><button class="chip ${S.auto?'on':''}" data-a="auto">${S.auto?'Bật':'Tắt'}</button></div>
 <div class="lr"><span>Âm thanh hiệu ứng</span><button class="chip ${S.sfx!==false?'on':''}" data-a="snd">${S.sfx!==false?'Bật':'Tắt'}</button></div></div>
${acct()}<div class="card"><b>Dữ liệu & hiệu năng</b><div class="lr"><span>Hiệu ứng 3D (tốn pin)</span><button class="chip ${S.fx?'on':''}" data-a="fx">${S.fx?'Bật':'Tắt'}</button></div><button class="btn s" data-a="bak">Sao lưu (tải file .json)</button><button class="btn s" data-a="rest">Khôi phục từ file</button></div>
 <div class="card"><b>🏆 Bảng xếp hạng</b><div id="lb" class="m">Đang tải…</div></div>`);
 $('#nm').onchange=e=>{S.name=e.target.value.trim();save()};
 if(db)get(query(ref(db,'leaderboard'),orderByChild('xp'),limitToLast(10))).then(s=>{const a=[];s.forEach(c=>a.push(c.val()));a.reverse();$('#lb').innerHTML=a.map((u,k)=>`<div class="lr"><span>${k+1}. ${esc(u.n)} <span class="m">Lv ${u.lv}</span></span><b>${u.xp} XP</b></div>`).join('')||'Chưa có dữ liệu'}).catch(()=>{$('#lb')&&($('#lb').textContent='Không tải được (kiểm tra Rules của Realtime Database)')});else $('#lb').textContent='Cần kết nối Firebase'};
/* ---------- Actions ---------- */
const A={go,say:i=>speak(W[i].w),spq:()=>speak(G.q.s),
 flip(){if(fl)return;fl=true;sfx('flip');$('.fc').classList.add('f');$('#gr').classList.remove('hide')},
 gr(g){g=+g;burst(g>0);sfx(g?'good':'again',g);grade(Q[qi],g);if(g==0)Q.push(Q[qi]);addXP(g==0?1:g==3?8:5);save();qi++;V.learn()},
 play(m){startGame(m)},pick(k){answer(G.q.o[k]==G.q.a,+k)},
 chk(){const v=$('#ti').value.trim().toLowerCase();answer(v==G.q.a.toLowerCase())},
 lv(l){const s=new Set(S.lv);s.has(l)?s.delete(l):s.add(l);if(!s.size)s.add(l);S.lv=L.filter(x=>s.has(x));save();V.me()},
 nd(d){S.nd=Math.max(5,Math.min(100,S.nd+ +d));save();V.me()},acc(){S.acc=S.acc=='en-GB'?'en-US':'en-GB';save();V.me()},auto(){S.auto=!S.auto;save();V.me()},snd(){S.sfx=S.sfx===false;save();sfx('good',3);V.me()},
 known(){sfx('good',3);const i=Q[qi];S.cards[i]={n:3,ef:2.5,iv:30,lp:0,due:Date.now()+30*864e5,ts:Date.now()};S.nn++;addXP(2);save();qi++;V.learn()},
 fx(){S.fx=!S.fx;save();V.me()},
 async google(){try{await signInWithPopup(au,new GoogleAuthProvider())}catch(x){alert(err(x))}},
 async login(){try{await signInWithEmailAndPassword(au,$('#em').value.trim(),$('#pw').value)}catch(x){alert(err(x))}},
 async signup(){try{await createUserWithEmailAndPassword(au,$('#em').value.trim(),$('#pw').value)}catch(x){alert(err(x))}},
 async reset(){const e=$('#em').value.trim();if(!e)return alert('Nhập email trước');try{await sendPasswordResetEmail(au,e);alert('Đã gửi email đặt lại mật khẩu')}catch(x){alert(err(x))}},
 async logout(){if(!confirm('Đăng xuất? Dữ liệu trên máy sẽ được xoá (bản trên cloud vẫn giữ).'))return;try{clearTimeout(tm);await push()}catch{}await signOut(au);S=def();localStorage.vv=JSON.stringify(S);go('me')},
 bak(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='hoc-tu-vung-backup.json';a.click()},
 rest(){const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=async()=>{try{const d=JSON.parse(await i.files[0].text());if(typeof d.xp!='number')throw 0;S=merge(S,d);save();go('me')}catch{alert('File không hợp lệ')}};i.click()}};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t){e.stopPropagation();A[t.dataset.a](t.dataset.v,t)}});
go('home');if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
