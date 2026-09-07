const KEY='storeManagerV1';
let db=JSON.parse(localStorage.getItem(KEY)||'{"items":[],"purchases":[],"issues":[]}');
const today=new Date().toISOString().slice(0,10);
document.getElementById('pdate').value=today; document.getElementById('idate').value=today;
document.getElementById('month').value=today.slice(0,7);
function save(){localStorage.setItem(KEY,JSON.stringify(db)); render();}
function money(n){return '₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})}
function item(id){return db.items.find(x=>x.id===id)}
function stock(x){return Number(x.open||0)+db.purchases.filter(p=>p.item==x.id).reduce((a,p)=>a+Number(p.qty),0)-db.issues.filter(p=>p.item==x.id).reduce((a,p)=>a+Number(p.qty),0)}
function addItem(){
 let name=iname.value.trim(); if(!name)return alert('Item name required');
 db.items.push({id:crypto.randomUUID(),name,code:icode.value,cat:icat.value,unit:iunit.value||'pcs',open:Number(iopen.value||0),min:Number(imin.value||0)});
 ['iname','icode','icat','iunit','iopen','imin'].forEach(id=>document.getElementById(id).value=id==='iopen'||id==='imin'?'0':''); save();
}
function modifyItem(id){
 const x=item(id); if(!x)return;
 const name=prompt('Item Name:',x.name); if(name===null)return;
 if(!name.trim())return alert('Item name required.');
 const code=prompt('Item Number / Code:',x.code||''); if(code===null)return;
 const cat=prompt('Category:',x.cat||''); if(cat===null)return;
 const unit=prompt('Unit:',x.unit||'pcs'); if(unit===null)return;
 const open=prompt('Opening Stock:',x.open||0); if(open===null)return;
 const min=prompt('Minimum Stock:',x.min||0); if(min===null)return;
 x.name=name.trim(); x.code=code.trim(); x.cat=cat.trim(); x.unit=unit.trim()||'pcs';
 x.open=Number(open)||0; x.min=Number(min)||0;
 save();
 alert('Item modified successfully.');
}

function modifyPurchase(id){
 const p=db.purchases.find(x=>x.id===id); if(!p)return;
 const date=prompt('Purchase Date (YYYY-MM-DD):',p.date||''); if(date===null)return;
 const itemId=prompt('Item Number / Code:',item(p.item)?.code||''); if(itemId===null)return;
 const found=db.items.find(x=>String(x.code||'').toLowerCase()===itemId.trim().toLowerCase() || x.id===itemId.trim());
 if(!found)return alert('Item Number not found. Purchase not changed.');
 const supplier=prompt('Supplier:',p.supplier||''); if(supplier===null)return;
 const qty=prompt('Quantity:',p.qty); if(qty===null)return;
 const rate=prompt('Per Item Rate (₹):',p.rate); if(rate===null)return;
 const invoice=prompt('Invoice No.:',p.invoice||''); if(invoice===null)return;
 const note=prompt('Remarks:',p.note||''); if(note===null)return;
 if(!date || Number(qty)<=0)return alert('Invalid date or quantity.');
 p.date=date; p.item=found.id; p.supplier=supplier.trim(); p.qty=Number(qty); p.rate=Number(rate)||0; p.invoice=invoice.trim(); p.note=note.trim();
 save();
 alert('Purchase modified successfully. Stock and reports updated.');
}

function addPurchase(){
 if(!pitem.value||!pqty.value)return alert('Item and quantity required');
 db.purchases.push({id:crypto.randomUUID(),date:pdate.value,item:pitem.value,supplier:psupplier.value,qty:Number(pqty.value),rate:Number(prate.value||0),invoice:pinvoice.value,note:pnote.value});
 pqty.value='';prate.value='';pinvoice.value='';pnote.value='';save();
}
function addIssue(){
 if(!iitem.value||!iqty.value)return alert('Item and quantity required');
 let x=item(iitem.value); if(Number(iqty.value)>stock(x)) return alert('Insufficient stock. Available: '+stock(x));
 db.issues.push({id:crypto.randomUUID(),date:idate.value,item:iitem.value,qty:Number(iqty.value),dept:idept.value,note:inote.value});
 iqty.value='';idept.value='';inote.value='';save();
}
function del(type,id){if(!confirm('Delete this entry?'))return;db[type]=db[type].filter(x=>x.id!==id);save()}
function detailOptions(search=''){
  const q=String(search||'').trim().toLowerCase();
  const arr=db.items.filter(x=>
    !q || String(x.code||'').toLowerCase().includes(q) || String(x.name||'').toLowerCase().includes(q) || String(x.cat||'').toLowerCase().includes(q)
  );
  return '<option value="">Select Item Number</option>'+arr.map(x=>`<option value="${x.id}">${x.code||'No Number'} — ${x.name}</option>`).join('');
}

function renderDetailSelect(){
  const s=document.getElementById('detailItem');
  if(!s)return;
  const old=s.value;
  s.innerHTML=detailOptions(document.getElementById('detailSearch')?.value||'');
  if(db.items.some(x=>x.id===old)) s.value=old;
}

function filterDetailItems(){
  renderDetailSelect();
  const s=document.getElementById('detailItem');
  if(s && s.options.length===2) { s.selectedIndex=1; renderItemDetail(); }
}

function openIssueItemDetail(){
  const id=document.getElementById('iitem').value;
  if(!id){ alert('Pehle Issue Item / Item Number select karo.'); return; }
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab==='itemDetail'));
  document.querySelectorAll('section').forEach(x=>x.classList.remove('show'));
  document.getElementById('itemDetail').classList.add('show');
  document.getElementById('detailSearch').value='';
  renderDetailSelect();
  document.getElementById('detailItem').value=id;
  renderItemDetail();
}

function openIssueItemDetailById(id){
  if(!id)return;
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab==='itemDetail'));
  document.querySelectorAll('section').forEach(x=>x.classList.remove('show'));
  document.getElementById('itemDetail').classList.add('show');
  document.getElementById('detailSearch').value='';
  renderDetailSelect();
  document.getElementById('detailItem').value=id;
  renderItemDetail();
}

function showIssueItemDetail(){
  const id=document.getElementById('iitem').value;
  const box=document.getElementById('issueItemPreview');
  if(!box || !id){ if(box) box.innerHTML=''; return; }
  const x=item(id); if(!x)return;
  box.innerHTML=`Selected Item: <b>${x.code||'No Item Number'}</b> — ${x.name} | Current Stock: <b>${stock(x)} ${x.unit}</b>`;
}

function renderItemDetail(){
  const id=document.getElementById('detailItem')?.value;
  const out=document.getElementById('itemDetailOut');
  if(!out)return;
  if(!id){ out.innerHTML='<div class="card"><p class="muted">Item Number select karo.</p></div>'; return; }
  const x=item(id); if(!x)return;
  const purchases=db.purchases.filter(p=>p.item===id).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const issues=db.issues.filter(p=>p.item===id).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const pq=purchases.reduce((a,p)=>a+Number(p.qty||0),0);
  const iq=issues.reduce((a,p)=>a+Number(p.qty||0),0);
  const pa=purchases.reduce((a,p)=>a+Number(p.qty||0)*Number(p.rate||0),0);
  const avg=pq?pa/pq:0;
  out.innerHTML=`
  <div class="grid">
    <div class="card">Item Number<b>${x.code||'-'}</b></div>
    <div class="card">Item Name<b>${x.name}</b></div>
    <div class="card">Opening Stock<b>${x.open||0} ${x.unit}</b></div>
    <div class="card">Current Stock<b>${stock(x)} ${x.unit}</b></div>
    <div class="card">Total Purchase<b>${pq} ${x.unit}</b></div>
    <div class="card">Total Issue<b>${iq} ${x.unit}</b></div>
    <div class="card">Purchase Amount<b>${money(pa)}</b></div>
    <div class="card">Weighted Avg. Rate<b>${money(avg)}</b></div>
  </div><br>
  <div class="card"><h3>Purchase Detail — ${x.name}</h3>${table(['Date','Qty','Rate / Item','Total','Supplier','Invoice'],purchases.map(p=>[p.date,p.qty+' '+x.unit,money(p.rate),money(p.qty*p.rate),p.supplier||'-',p.invoice||'-']))}</div><br>
  <div class="card"><h3>Issue Detail — ${x.name}</h3>${table(['Date','Qty','Department / Person','Remarks'],issues.map(p=>[p.date,p.qty+' '+x.unit,p.dept||'-',p.note||'-']))}</div>`;
}

function render(){
 let m=today.slice(0,7), monthP=db.purchases.filter(p=>p.date?.startsWith(m));
 dItems.textContent=db.items.length;dStock.textContent=db.items.reduce((a,x)=>a+stock(x),0);
 dPurchase.textContent=money(monthP.reduce((a,p)=>a+p.qty*p.rate,0));
 dLow.textContent=db.items.filter(x=>stock(x)<=Number(x.min||0)).length;
 lowTable.innerHTML=table(['Item','Stock','Min'],db.items.filter(x=>stock(x)<=Number(x.min||0)).map(x=>[x.name,stock(x)+' '+x.unit,x.min]));
 itemsTable.innerHTML=table(['Code','Item','Category','Unit','Stock','Min','Action'],db.items.map(x=>[x.code||'-',x.name,x.cat||'-',x.unit,stock(x),x.min,`<button class="action" onclick="modifyItem('${x.id}')">✏️ Modify</button> <button class="action danger" onclick="del('items','${x.id}')">Delete</button>`]));
 let opts='<option value="">Select item</option>'+db.items.map(x=>`<option value="${x.id}">${x.code||'No Number'} — ${x.name} (${stock(x)} ${x.unit})</option>`).join('');
 pitem.innerHTML=opts;iitem.innerHTML=opts; renderDetailSelect(); showIssueItemDetail();
 purchaseTable.innerHTML=table(['Date','Item','Supplier','Qty','Rate / Item','Total','Invoice','Action'],db.purchases.slice().reverse().map(p=>[p.date,item(p.item)?.name||'-',p.supplier||'-',p.qty+' '+(item(p.item)?.unit||''),money(p.rate),money(p.qty*p.rate),p.invoice||'-',`<button class="action" onclick="modifyPurchase('${p.id}')">✏️ Modify</button> <button class="action danger" onclick="del('purchases','${p.id}')">Delete</button>`]));
 issueTable.innerHTML=table(['Date','Item Number','Item','Qty','Department/Person','Remarks','Detail','Action'],db.issues.slice().reverse().map(p=>[p.date,item(p.item)?.code||'-',item(p.item)?.name||'-',p.qty+' '+(item(p.item)?.unit||''),p.dept||'-',p.note||'-',`<button class="action" onclick="openIssueItemDetailById('${p.item}')">View</button>`,`<button class="action danger" onclick="del('issues','${p.id}')">Delete</button>`]));
}
function table(head,rows){if(!rows.length)return '<p class="muted">No records yet.</p>';return '<div style="overflow:auto"><table><thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
function renderReport(){
 let m=month.value||today.slice(0,7);
 let ps=db.purchases.filter(p=>p.date?.startsWith(m));
 let is=db.issues.filter(p=>p.date?.startsWith(m));

 let totalPurchaseQty=ps.reduce((a,p)=>a+Number(p.qty),0);
 let totalPurchaseCost=ps.reduce((a,p)=>a+Number(p.qty)*Number(p.rate),0);
 let totalIssueQty=is.reduce((a,p)=>a+Number(p.qty),0);
 let totalIssueValue=0;

 let rows=db.items.map(x=>{
   let pp=ps.filter(p=>p.item==x.id);
   let ii=is.filter(p=>p.item==x.id);

   let opening=Number(x.open||0)
     + db.purchases.filter(p=>p.item==x.id && p.date < m+"-01").reduce((a,p)=>a+Number(p.qty),0)
     - db.issues.filter(p=>p.item==x.id && p.date < m+"-01").reduce((a,p)=>a+Number(p.qty),0);

   let purchased=pp.reduce((a,p)=>a+Number(p.qty),0);
   let purchaseValue=pp.reduce((a,p)=>a+Number(p.qty)*Number(p.rate),0);
   let issued=ii.reduce((a,p)=>a+Number(p.qty),0);
   let avgRate=purchased ? purchaseValue/purchased : 0;
   let issueValue=issued*avgRate;
   let balance=opening+purchased-issued;

   totalIssueValue+=issueValue;

   return [
     x.name,
     opening+" "+x.unit,
     purchased+" "+x.unit,
     money(avgRate),
     issued+" "+x.unit,
     balance+" "+x.unit,
     money(issueValue)
   ];
 });

 let activeRows=rows.filter(r=>r[1]!=="0 pcs" || r[2]!=="0 pcs" || r[4]!=="0 pcs");

 reportOut.innerHTML=`
 <div class="report">
   <div class="card">Opening Stock<b>${db.items.reduce((a,x)=>{
      let op=Number(x.open||0)
       +db.purchases.filter(p=>p.item==x.id && p.date < m+"-01").reduce((q,p)=>q+Number(p.qty),0)
       -db.issues.filter(p=>p.item==x.id && p.date < m+"-01").reduce((q,p)=>q+Number(p.qty),0);
      return a+op;
   },0)}</b></div>
   <div class="card">Purchase<b>${totalPurchaseQty}</b></div>
   <div class="card">Issued<b>${totalIssueQty}</b></div>
   <div class="card">Balance<b>${db.items.reduce((a,x)=>a+Number(x.open||0)
      +db.purchases.filter(p=>p.item==x.id && p.date < m+"-01").reduce((q,p)=>q+Number(p.qty),0)
      +ps.filter(p=>p.item==x.id).reduce((q,p)=>q+Number(p.qty),0)
      -db.issues.filter(p=>p.item==x.id && p.date.startsWith(m)).reduce((q,p)=>q+Number(p.qty),0),0)}</b></div>
   <div class="card">Purchase Total ₹<b>${money(totalPurchaseCost)}</b></div>
   <div class="card">Issue Item Total Rate<b>${money(totalIssueValue)}</b></div>
 </div>
 <div class="card" id="reportPrintArea">
   <h3>${m} — Monthly Stock Report</h3>
   ${table(
     ['Item','Opening Stock','Purchase','Purchase Rate','Issued','Balance','Issue Item Total Rate'],
     activeRows
   )}
   <p class="muted">Balance = Opening Stock + Purchase − Issued. Purchase Rate is the month's average purchase rate for each item. Issue Item Total Rate = Issued Qty × Purchase Rate.</p>
 </div>`;
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('section').forEach(s=>s.classList.remove('show'));document.getElementById(b.dataset.tab).classList.add('show');});
render();

function printStoreReport(){
  window.print();
}

const CLOUD_KEY='storeManagerCloudConfigV1';
let cloudClient=null, cloudChannel=null;
function getCloudConfig(){try{return JSON.parse(localStorage.getItem(CLOUD_KEY)||'null')}catch(e){return null}}
function setCloudStatus(text,ok=true){const el=document.getElementById('cloudStatus'); if(el){el.textContent=text;el.className='cloud-status '+(ok?'ok':'bad')}}
function openCloudSetup(){const c=getCloudConfig()||{}; sbUrl.value=c.url||'';sbKey.value=c.key||'';sbEmail.value=c.email||'';sbPassword.value='';document.getElementById('cloudModal').classList.add('show')}
function closeCloudSetup(){document.getElementById('cloudModal').classList.remove('show')}
function saveCloudSetup(){
 const url=sbUrl.value.trim(),key=sbKey.value.trim(),email=sbEmail.value.trim(),password=sbPassword.value;
 if(!url||!key)return alert('Supabase URL aur Publishable/Anon Key required.');
 localStorage.setItem(CLOUD_KEY,JSON.stringify({url,key,email}));
 closeCloudSetup(); initCloud();
 if(email&&password) cloudLogin(password); else alert('Cloud setup saved. Ab Login button se sign in karo.');
}
async function initCloud(){
 const c=getCloudConfig(); if(!c||!window.supabase){setCloudStatus('Not connected',false);return false}
 try{cloudClient=window.supabase.createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   const {data:{session}}=await cloudClient.auth.getSession();
   if(session){setCloudStatus('Connected: '+(session.user.email||'User')); await pullFromCloud(true); subscribeCloud();}
   else setCloudStatus('Setup saved • Login required',false);
   return true;
 }catch(e){console.error(e);setCloudStatus('Cloud config error',false);return false}
}
async function cloudLogin(pwd){
 const c=getCloudConfig(); if(!c){openCloudSetup();return}
 if(!cloudClient) await initCloud();
 const email=c.email||prompt('Login email:'); const password=pwd||prompt('Password:');
 if(!email||!password)return;
 const {data,error}=await cloudClient.auth.signInWithPassword({email,password});
 if(error)return alert('Login failed: '+error.message);
 setCloudStatus('Connected: '+email,true); await pullFromCloud(true); subscribeCloud();
}
async function cloudLogout(){if(!cloudClient)return; if(cloudChannel) await cloudClient.removeChannel(cloudChannel); await cloudClient.auth.signOut();setCloudStatus('Logged out',false)}
async function ensureAuth(){if(!cloudClient)return false;const {data:{session}}=await cloudClient.auth.getSession();if(!session){setCloudStatus('Login required',false);return false}return true}
async function cloudGet(){
 if(!await ensureAuth())return null;
 const {data,error}=await cloudClient.from('store_data').select('payload,updated_at').eq('id',1).maybeSingle();
 if(error){alert('Cloud read error: '+error.message);return null} return data;
}
async function cloudPut(payload){
 if(!await ensureAuth())return false;
 const {error}=await cloudClient.from('store_data').upsert({id:1,payload,updated_at:new Date().toISOString()});
 if(error){alert('Cloud save error: '+error.message);return false}return true;
}
async function pushLocalToCloud(){const ok=await cloudPut(db);if(ok){setCloudStatus('Synced ✓',true);alert('Current phone data cloud me upload ho gaya.')}}
async function pullFromCloud(silent=false){
 const data=await cloudGet(); if(!data)return;
 if(data.payload){db=data.payload;localStorage.setItem(KEY,JSON.stringify(db));render();setCloudStatus('Synced ✓',true);if(!silent)alert('Cloud data load ho gaya.')}
}
async function syncSave(){
 localStorage.setItem(KEY,JSON.stringify(db)); render();
 if(cloudClient && await ensureAuth()){await cloudPut(db);setCloudStatus('Saved + Cloud Sync ✓',true)}
}
save=syncSave;
async function syncNow(){
  if(!cloudClient){alert('Pehle Cloud Setup aur Login karo.');return;}
  if(!await ensureAuth())return;
  const remote=await cloudGet();
  if(remote && remote.payload){
    const localHas=(db.items?.length||0)+(db.purchases?.length||0)+(db.issues?.length||0);
    const remoteHas=(remote.payload.items?.length||0)+(remote.payload.purchases?.length||0)+(remote.payload.issues?.length||0);
    if(remoteHas>0 || localHas===0){ db=remote.payload; localStorage.setItem(KEY,JSON.stringify(db)); render(); setCloudStatus('Synced ✓',true); alert('Cloud data sync ho gaya.'); }
    else { const ok=await cloudPut(db); if(ok){setCloudStatus('Synced ✓',true); alert('Local data cloud me sync ho gaya.');} }
  } else { const ok=await cloudPut(db); if(ok){setCloudStatus('Synced ✓',true); alert('Local data cloud me sync ho gaya.');} }
}
function subscribeCloud(){
 if(!cloudClient)return;
 if(cloudChannel)cloudClient.removeChannel(cloudChannel);
 cloudChannel=cloudClient.channel('store-manager-sync').on('postgres_changes',{event:'*',schema:'public',table:'store_data',filter:'id=eq.1'},payload=>{
   if(payload.new&&payload.new.payload){db=payload.new.payload;localStorage.setItem(KEY,JSON.stringify(db));render();setCloudStatus('Live synced ✓',true);}
 }).subscribe();
}
(async()=>{const c=getCloudConfig();if(c) await initCloud();else setCloudStatus('Not configured',false)})();
