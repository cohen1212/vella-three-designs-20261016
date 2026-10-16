/* VELLA preview-only interactive commerce. No network, payment, account data or production edits. */
(()=>{"use strict";
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const current=document.body.dataset.design||'vella';
const key='vella-preview-'+current;
let items=[],lastOpen=null;
try{const v=JSON.parse(sessionStorage.getItem(key)||"[]");if(Array.isArray(v))items=v.filter(x=>x&&Number.isInteger(x.qty)&&x.qty>0&&x.qty<=9&&Number.isFinite(x.price));}catch{}
const drawer=q('[data-drawer]'),backdrop=q('[data-scrim]'),close=q('[data-close-drawer]');
const money=(n)=>{const v=Number(n);return '₪'+v.toLocaleString('he-IL',{maximumFractionDigits:2,minimumFractionDigits:Number.isInteger(v)?0:2})};
const sum=()=>items.reduce((s,i)=>s+i.price*i.qty,0);
const count=()=>items.reduce((s,i)=>s+i.qty,0);
function update(){
  qa('[data-count]').forEach(el=>el.textContent=String(count()));
  const empty=q('[data-cart-empty]'),list=q('[data-cart-lines]'),total=q('[data-cart-total]');
  if(empty)empty.hidden=count()>0;
  if(list)list.innerHTML=items.map((i,index)=>'<div class="drawer-item"><img alt="" src="'+i.img+'"><div><strong>'+i.title+'</strong><small>'+i.qty+' × '+money(i.price)+'</small><button type="button" data-remove="'+index+'">הסרה</button></div><b>'+money(i.qty*i.price)+'</b></div>').join('');
  if(total)total.textContent=money(sum());
  if(list)qa('[data-remove]',list).forEach(btn=>btn.addEventListener('click',()=>{items.splice(Number(btn.dataset.remove),1);persist()}));
}
function persist(){try{sessionStorage.setItem(key,JSON.stringify(items))}catch{}update();}
function show(from){
 if(!drawer||!backdrop)return;
 lastOpen=from||document.activeElement;
 drawer.inert=false;drawer.setAttribute('aria-hidden','false');drawer.classList.add('active');backdrop.hidden=false;
 document.body.classList.add('drawer-open');close?.focus({preventScroll:true});
}
function hide(){
 if(!drawer||!backdrop)return;drawer.classList.remove('active');drawer.setAttribute('aria-hidden','true');drawer.inert=true;backdrop.hidden=true;document.body.classList.remove('drawer-open');if(lastOpen?.isConnected)lastOpen.focus({preventScroll:true});lastOpen=null;
}
qa('[data-open-drawer]').forEach(btn=>btn.addEventListener('click',()=>show(btn)));
close?.addEventListener('click',hide);backdrop?.addEventListener('click',hide);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer?.classList.contains('active'))hide()});
drawer?.addEventListener('keydown',e=>{if(e.key!=='Tab'||!drawer.classList.contains('active'))return;const f=qa('button:not([disabled]),a[href]',drawer).filter(el=>el.offsetParent!==null);if(!f.length)return;if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus()}});
function add(title,price,qty,img,source){const p=Number(price),n=Math.max(1,Math.min(9,Number(qty)||1));if(!Number.isFinite(p)||p<0)return;const exist=items.find(i=>i.title===title&&i.price===p);if(exist)exist.qty=Math.min(9,exist.qty+n);else items.push({title,price:p,qty:n,img:img||'../assets/product-flat.jpg'});persist();show(source)}
qa('[data-buy-form]').forEach(form=>{
 const quantity=q('[data-qty]',form);
 const number=()=>Math.max(1,Math.min(9,Number.parseInt(quantity?.value||'1',10)||1));
 qa('[data-qty-minus]',form).forEach(btn=>btn.addEventListener('click',()=>{quantity.value=String(Math.max(1,number()-1))}));
 qa('[data-qty-plus]',form).forEach(btn=>btn.addEventListener('click',()=>{quantity.value=String(Math.min(9,number()+1))}));
 quantity?.addEventListener('change',()=>{quantity.value=String(number())});
 form.addEventListener('submit',e=>{e.preventDefault();const choice=q('[data-plan]:checked',form);const price=choice?choice.dataset.price:form.dataset.price;const title=choice?choice.dataset.title:form.dataset.title;const image=choice?.dataset.image||form.dataset.image;add(title,price,number(),image,e.submitter||form)});
});
qa('[data-add-one]').forEach(btn=>btn.addEventListener('click',()=>add(btn.dataset.title||'Vella Smooth',btn.dataset.price||209,1,btn.dataset.image,btn)));
qa('[data-thumb]').forEach(btn=>btn.addEventListener('click',()=>{const img=q('[data-main-image]');if(!img)return;img.src=btn.dataset.src;img.alt=btn.dataset.alt||'Vella Smooth';qa('[data-thumb]').forEach(b=>{const yes=b===btn;b.classList.toggle('current',yes);b.setAttribute('aria-pressed',String(yes))});}));
qa('[data-menu-button]').forEach(btn=>btn.addEventListener('click',()=>{const el=document.getElementById(btn.getAttribute('aria-controls'));if(!el)return;const open=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(open));el.classList.toggle('expanded',open)}));
qa('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{const m=q('[data-menu-button]'),nav=q('.mobile-nav');m?.setAttribute('aria-expanded','false');nav?.classList.remove('expanded')}));
qa('video[data-paused-motion]').forEach(v=>{v.muted=true;v.playsInline=true});
/* Native-product-mapped bundle selection in preview, read from URL; no Shopify write. */
const plans=qa('[data-plan]');
if(plans.length){
 const requested=new URLSearchParams(location.search).get('set');
 const matched=plans.find(x=>x.dataset.set===requested);
 if(matched)matched.checked=true;
 const display=q('[data-plan-price]');
 const sync=()=>{const selected=plans.find(x=>x.checked);if(!selected)return;if(display)display.textContent=money(Number(selected.dataset.price));};
 plans.forEach(x=>x.addEventListener('change',sync));sync();
}
update();
})();
