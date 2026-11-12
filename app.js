import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp, Timestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_Ya9TNyqCDcMwRYrfUl7UudzPUNdji5c",
  authDomain: "miku-portal.firebaseapp.com",
  projectId: "miku-portal",
  storageBucket: "miku-portal.firebasestorage.app",
  messagingSenderId: "604192352317",
  appId: "1:604192352317:web:ea7e18efb0f478e0e9e254",
  measurementId: "G-CLHFK71TXS"
};
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
// Firebase is configured in this build. If startup fails, the browser console will show the exact Firebase error.
const $=id=>document.getElementById(id);
const LOGIN_DOMAIN="@members.mikuportal.com";
let mode="member", secondaryApp=null, memberCache=[];
const emailFor=id=>{const value=id.trim().toLowerCase();return value.includes("@")?value:value.replace(/\s+/g,"")+LOGIN_DOMAIN;};
const say=(id,text,bad=false)=>{const el=$(id);el.textContent=text;el.style.color=bad?"#b4234d":"#a94e70";};
const show=id=>$(id).classList.remove("hidden"), hide=id=>$(id).classList.add("hidden");

document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
 mode=btn.dataset.mode;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
 $("authTitle").textContent=mode==="admin"?"Owner sign in":"Welcome back";
 $("authHint").textContent=mode==="admin"?"Sign in with your private owner ID.":"Enter the member ID provided by your owner.";
 $("loginId").placeholder=mode==="admin"?"Owner email or ID":"Member ID";$("loginForm").querySelector("label[for=loginId]").textContent=mode==="admin"?"ADMIN EMAIL / ID":"MEMBER ID";say("authMessage","");
}));

$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();say("authMessage","Verifying ID and password…");
 const id=$("loginId").value.trim();
 try{
  const cred=await signInWithEmailAndPassword(auth,emailFor(id),$("loginPassword").value);
  const uid=cred.user.uid, ownerSnap=await getDoc(doc(db,"admin",uid));
  if(mode==="admin"){
   if(!ownerSnap.exists()||ownerSnap.data().role!=="owner"){await signOut(auth);throw Error("Owner access not found for this account.");}
   openDashboard(id,true);return;
  }
  if(ownerSnap.exists()){await signOut(auth);throw Error("Please use Admin Login for this ID.");}
  const ref=doc(db,"members",uid);let snap=await getDoc(ref);
  if(!snap.exists()){await signOut(auth);throw Error("Member profile is not active yet. Contact the owner.");}
  let d=snap.data();
  if(d.status!=="active"){await signOut(auth);throw Error("ID VALIDATION WARNING: This member ID is banned or inactive.");}
  if(!d.firstLoginAt){
   await runTransaction(db,async tx=>{
    const fresh=await tx.get(ref);
    if(!fresh.data().firstLoginAt){
     const now=Timestamp.now();
     tx.update(ref,{firstLoginAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(now.toMillis()+30*86400000)});
    }
   });
   snap=await getDoc(ref);d=snap.data();
  }
  if(d.expiresAt&&d.expiresAt.toMillis()<=Date.now()){await signOut(auth);throw Error("ID VALIDATION WARNING: Your 30-day membership has expired.");}
  openDashboard(id,false,d);
 }catch(err){say("authMessage",err.message||"Login failed.",true);}
});

function openDashboard(id,isOwner,d={}){
 hide("authView");show("dashboardView");$("welcomeName").textContent=id;
 if(isOwner){$("membershipInfo").textContent="Owner account · Full member management";show("adminTools");hide("memberStatus");loadMembers();}
 else{
  hide("adminTools");show("memberStatus");
  $("membershipInfo").textContent="Member access · Your private portal";
  const expiry=d.expiresAt?.toDate();updateCountdown(expiry);
  $("statusTitle").textContent="Membership active";
  $("statusDetail").textContent=expiry?"Your ID is valid until "+expiry.toLocaleString():"30-day access period has started.";
 }
}
function updateCountdown(expiry){
 if(!expiry){$("countdown").textContent="30 DAYS";return;}
 const left=Math.max(0,expiry.getTime()-Date.now()),days=Math.floor(left/86400000),hours=Math.floor(left%86400000/3600000);
 $("countdown").textContent=left<=0?"EXPIRED":`${days}D ${hours}H`;
 if(left<=0){$("statusTitle").textContent="Membership expired";$("statusDetail").textContent="Contact the portal owner to renew access.";}
}
$("logoutBtn").addEventListener("click",async()=>{await signOut(auth);hide("dashboardView");show("authView");$("loginPassword").value="";});

$("createMemberForm").addEventListener("submit",async e=>{
 e.preventDefault();say("adminMessage","Creating member ID…");
 const username=$("newMemberId").value.trim().toLowerCase().replace(/\s+/g,""),password=$("newMemberPassword").value;
 if(!/^[a-z0-9._-]{3,32}$/.test(username)){say("adminMessage","ID must be 3–32 characters: letters, numbers, dot, _ or -.",true);return;}
 try{
  if(!secondaryApp)secondaryApp=initializeApp(firebaseConfig,"mikuSecondaryAuth");
  const secondaryAuth=getAuth(secondaryApp);
  const cred=await createUserWithEmailAndPassword(secondaryAuth,emailFor(username),password);
  await setDoc(doc(db,"members",cred.user.uid),{username,email:emailFor(username),status:"active",createdAt:serverTimestamp(),firstLoginAt:null,expiresAt:null});
  await signOut(secondaryAuth);
  $("newMemberId").value="";$("newMemberPassword").value="";
  say("adminMessage",`Member ID "${username}" created. Share the temporary password privately.`);loadMembers();
 }catch(err){say("adminMessage",err.message||"Member creation failed.",true);}
});

async function loadMembers(){
 const body=$("membersTable");body.innerHTML="<tr><td colspan='4'>Loading…</td></tr>";
 try{
  const snap=await getDocs(collection(db,"members"));memberCache=[];
  snap.forEach(s=>memberCache.push({uid:s.id,...s.data()}));
  $("totalMembers").textContent=memberCache.length;
  $("activeMembers").textContent=memberCache.filter(x=>x.status==="active").length;
  $("bannedMembers").textContent=memberCache.filter(x=>x.status!=="active").length;
  renderMembers();
 }catch(err){body.innerHTML=`<tr><td colspan="4">${escapeHtml(err.message)}</td></tr>`;}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderMembers(){
 const body=$("membersTable"),term=$("memberSearch").value.trim().toLowerCase();body.innerHTML="";
 const list=memberCache.filter(m=>(m.username||"").toLowerCase().includes(term));
 if(!list.length){body.innerHTML="<tr><td colspan='4'>No matching members.</td></tr>";return;}
 list.forEach(m=>{
  const tr=document.createElement("tr"),valid=m.expiresAt?.toDate().toLocaleDateString()||"Starts on first login";
  tr.innerHTML=`<td>${escapeHtml(m.username||"member")}</td><td>${m.status==="active"?"<span class='good'>ACTIVE</span>":"<span class='bad'>BANNED</span>"}</td><td>${escapeHtml(valid)}</td><td></td>`;
  const actions=tr.lastElementChild,ban=document.createElement("button");ban.className="action-btn";ban.textContent=m.status==="active"?"Ban ID":"Unban ID";
  ban.onclick=async()=>{try{await updateDoc(doc(db,"members",m.uid),{status:m.status==="active"?"banned":"active"});say("adminMessage",`${m.username} status updated.`);loadMembers();}catch(e){say("adminMessage",e.message,true);}};
  const copy=document.createElement("button");copy.className="action-btn";copy.textContent="Copy ID";
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(m.username||"");say("adminMessage",`Copied member ID: ${m.username}`);}catch(e){say("adminMessage","Copy is unavailable in this browser. You can select the ID from the list.");}};
  actions.append(ban,copy);body.append(tr);
 });
}
$("refreshMembers").addEventListener("click",loadMembers);$("memberSearch").addEventListener("input",renderMembers);

$("bigbasketBtn").addEventListener("click",()=>{show("bigbasketPanel");$("bigbasketPanel").scrollIntoView({behavior:"smooth",block:"start"});});
$("closePanel").addEventListener("click",()=>hide("bigbasketPanel"));
let demoTimer=null;
$("runDemo").addEventListener("click",()=>{
 if(demoTimer)clearInterval(demoTimer);
 const bar=$("progressBar"),title=$("demoTitle"),text=$("demoText"),label=$("progressLabel"),percent=$("progressPercent");
 let n=0;$("runDemo").disabled=true;$("runDemo").textContent="Simulation running…";
 title.textContent="Running visual simulation";text.textContent="Decorative cyber-style animation only. No Pegasus spyware, virus, phone scan, account access or security bypass is being run.";
 label.textContent="SIMULATION";percent.textContent="0%";bar.style.width="0%";
 demoTimer=setInterval(()=>{n=Math.min(100,n+5);bar.style.width=n+"%";percent.textContent=n+"%";if(n===100){clearInterval(demoTimer);title.textContent="DEMO COMPLETED";text.textContent="Visual sequence completed. Enable the official link below if you want to visit BigBasket.";label.textContent="COMPLETE";$("runDemo").disabled=false;$("runDemo").textContent="Replay visual demo ↻";}},120);
});
$("demoToggle").addEventListener("change",e=>$("bigbasketLink").classList.toggle("disabled",!e.target.checked));
$("instamartBtn").addEventListener("click",()=>alert("Instamart — Coming Soon"));
$("freefireBtn").addEventListener("click",()=>alert("Please contact your portal owner for Free Fire access."));
