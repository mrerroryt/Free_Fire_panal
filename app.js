import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

// Firebase Console > Project settings > Your apps: paste your Web App config here.
const firebaseConfig={apiKey:"PASTE_API_KEY",authDomain:"PASTE_PROJECT_ID.firebaseapp.com",projectId:"PASTE_PROJECT_ID",appId:"PASTE_APP_ID"};
// Preview is only for checking the UI. Set false before production deployment.
const PREVIEW_MODE=true, PREVIEW_CODE="2323";
const CONTACT_ADMIN_URL="mailto:owner@example.com?subject=MIKU%20Portal%20Support";
const LOGIN_EMAIL_DOMAIN="members.mikuportal.com";
const $=id=>document.getElementById(id);
const ready=!firebaseConfig.apiKey.startsWith("PASTE_")&&!firebaseConfig.projectId.startsWith("PASTE_");
let auth=null,fn=null,preview=false;
if(ready){const app=initializeApp(firebaseConfig);auth=getAuth(app);fn=getFunctions(app);}
function msg(id,text,ok=false){$(id).textContent=text;$(id).classList.toggle("ok",ok);}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2800);}
function view(id){["auth","member","admin"].forEach(x=>$(x).classList.add("hide"));$(id).classList.remove("hide");$("logout").classList.toggle("hide",id==="auth");}
function errorText(e){const c=e?.code||"";if(c.includes("invalid-credential")||c.includes("user-not-found")||c.includes("wrong-password"))return"Incorrect ID or password.";if(c.includes("permission-denied"))return"Access denied. Check your account status.";if(c.includes("too-many-requests"))return"Too many attempts. Wait a moment and try again.";return e?.message||"Something went wrong.";}
function checkFirebase(){if(!ready){toast("Add Firebase Web config in public/app.js first.");return false;}return true;}
const alias=id=>`${id.trim().toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
async function memberLogin(){
 msg("memberMsg","");if(!checkFirebase())return;
 const id=$("uid").value.trim(),password=$("upass").value;
 if(!/^[A-Za-z0-9._-]{3,24}$/.test(id)||!password){msg("memberMsg","Enter a valid User ID and password.");return;}
 $("memberLogin").disabled=true;
 try{await signInWithEmailAndPassword(auth,alias(id),password);const r=await httpsCallable(fn,"activateMembership")({});showMember(r.data);}
 catch(e){msg("memberMsg",errorText(e));if(auth.currentUser)await signOut(auth);}
 finally{$("memberLogin").disabled=false;}
}
async function adminLogin(){
 msg("adminMsg","");if(!checkFirebase())return;
 $("adminLogin").disabled=true;
 try{const c=await signInWithEmailAndPassword(auth,$("aemail").value.trim(),$("apass").value);const token=await c.user.getIdTokenResult(true);if(token.claims.admin!==true){await signOut(auth);throw Error("This account has not been granted the Firebase admin role.");}preview=false;view("admin");await listMembers();}
 catch(e){msg("adminMsg",errorText(e));}finally{$("adminLogin").disabled=false;}
}
function showMember(data){view("member");const expiry=data.expiresAt?new Date(data.expiresAt):null;$("validity").textContent=expiry?Math.max(0,Math.ceil((expiry-Date.now())/86400000))+" DAYS LEFT":"30 DAYS";$("validDate").textContent=expiry?"Valid until "+expiry.toLocaleDateString():"Preview access";}
function previewLogin(){if(!PREVIEW_MODE){toast("Preview mode is disabled.");return;}const code=prompt("Enter preview code");if(code!==PREVIEW_CODE){toast("Wrong preview code.");return;}preview=true;showMember({expiresAt:Date.now()+30*86400000});}
async function logout(){if(auth?.currentUser)await signOut(auth);preview=false;view("auth");}
async function createMember(e){e.preventDefault();if(!checkFirebase())return;const btn=e.submitter;btn.disabled=true;msg("createMsg","");try{const r=await httpsCallable(fn,"adminCreateMember")({userId:$("newId").value.trim(),password:$("newPass").value,note:$("newNote").value.trim()});msg("createMsg","Created "+r.data.userId+". Share credentials privately.",true);$("createForm").reset();await listMembers();}catch(err){msg("createMsg",errorText(err));}finally{btn.disabled=false;}}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function listMembers(){if(preview){$("users").innerHTML='<tr><td colspan="4">Firebase is not connected in preview mode.</td></tr>';return;}try{const r=await httpsCallable(fn,"adminListMembers")({}),members=r.data.members||[];$("total").textContent=members.length;$("active").textContent=members.filter(m=>!m.banned&&!m.expired).length;$("banned").textContent=members.filter(m=>m.banned).length;$("users").innerHTML=members.length?"":'<tr><td colspan="4">No member accounts yet.</td></tr>';for(const m of members){const status=m.banned?"BANNED":m.expired?"EXPIRED":m.activated?"ACTIVE":"NOT STARTED";const tr=document.createElement("tr");tr.innerHTML=`<td>${esc(m.userId)}</td><td><span class="status ${m.banned?"ban":"act"}">${status}</span></td><td>${m.expiresAt?new Date(m.expiresAt).toLocaleDateString():"—"}</td><td><button class="action" data-do="ban" data-uid="${m.uid}" data-value="${!m.banned}">${m.banned?"UNBAN":"BAN"}</button><button class="action" data-do="reset" data-uid="${m.uid}" data-user="${esc(m.userId)}">RESET PW</button></td>`;$("users").appendChild(tr);}}catch(e){toast(errorText(e));}}
async function rowAction(e){const b=e.target.closest("button[data-do]");if(!b)return;try{if(b.dataset.do==="ban"){await httpsCallable(fn,"adminSetMemberBanned")({uid:b.dataset.uid,banned:b.dataset.value==="true"});toast("Account status updated.");}else{const p=prompt("New password for "+b.dataset.user+" (minimum 8 characters):");if(!p)return;if(p.length<8){toast("Password must be at least 8 characters.");return;}await httpsCallable(fn,"adminResetMemberPassword")({uid:b.dataset.uid,newPassword:p});toast("Password changed.");}await listMembers();}catch(e){toast(errorText(e));}}
function contact(){if(CONTACT_ADMIN_URL.includes("owner@example.com")){toast("Set CONTACT_ADMIN_URL in public/app.js.");return;}window.open(CONTACT_ADMIN_URL,"_blank","noopener");}
function bigBasket(){ $("modal").classList.remove("hide");$("progress").style.width="0";$("log").textContent="Starting visual demo…";$("applied").classList.add("hide");$("enable").classList.add("hide");$("openApp").classList.add("hide");$("toggle").classList.remove("on");$("date").textContent=new Date().toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});const caps=["PREPARING DISPLAY","LOADING PANEL DESIGN","CHECKING VISUAL ELEMENTS","READY"],logs=["Loading interface components…","Rendering circular status animation…","Finishing visual demo…","Demo ready."];let i=0;const t=setInterval(()=>{i++;$("progress").style.width=i*25+"%";$("caption").textContent=caps[i-1];$("log").textContent+="\n"+logs[i-1];if(i===4){clearInterval(t);$("applied").classList.remove("hide");$("enable").classList.remove("hide");}},500);}
function petals(){const layer=$("petals"),s=["🌸","✿","❀","✧"];for(let i=0;i<20;i++){const p=document.createElement("span");p.className="petal";p.textContent=s[i%s.length];p.style.left=Math.random()*100+"%";p.style.fontSize=10+Math.random()*13+"px";p.style.animationDuration=14+Math.random()*18+"s";p.style.animationDelay=-Math.random()*28+"s";p.style.setProperty("--drift",(Math.random()*24-12)+"vw");layer.appendChild(p);}}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));$("memberForm").classList.toggle("hide",b.dataset.tab!=="member");$("adminForm").classList.toggle("hide",b.dataset.tab!=="admin");});
document.querySelectorAll("[data-show]").forEach(b=>b.onclick=()=>{const i=$(b.dataset.show);i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"SHOW":"HIDE";});
$("memberLogin").onclick=memberLogin;$("adminLogin").onclick=adminLogin;$("preview").onclick=previewLogin;$("logout").onclick=logout;
$("createForm").onsubmit=createMember;$("refresh").onclick=listMembers;$("users").onclick=rowAction;
$("freefire").onclick=contact;$("instamart").onclick=contact;$("bigbasket").onclick=bigBasket;
$("close").onclick=()=>$("modal").classList.add("hide");$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").classList.add("hide");};
$("toggle").onclick=()=>{$("toggle").classList.toggle("on");$("openApp").classList.toggle("hide",!$("toggle").classList.contains("on"));};
petals();if(!PREVIEW_MODE)$("preview").classList.add("hide");if(!ready)msg("memberMsg","Firebase not configured yet. Use Preview design (code 2323) to inspect the interface.");
