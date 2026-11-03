'use strict';
// UstaCebim frontend preview. NO authentication, payments or server-side persistence.
const categories=[
['Elektrikçi','⚡','Priz, aydınlatma, elektrik arızası'],
['Su Tesisatçısı','🚰','Musluk, gider ve kaçak onarımı'],
['Boya ve Badana','🎨','İç cephe ve dış cephe boya işleri'],
['Ev Temizliği','🧹','Ev ve ofis temizlik hizmetleri'],
['Klima Servisi','❄️','Klima bakım, tamir ve montaj'],
['Ev ve Ofis Nakliyesi','🚚','Eşya taşıma ve nakliye'],
['Mobilya Montajı','🪑','Mobilya kurulum ve onarım'],
['Beyaz Eşya Servisi','🔧','Beyaz eşya bakım ve tamiri'],
['Bilgisayar ve Teknoloji','💻','Bilgisayar ve ağ desteği'],
['Kamera ve Güvenlik Sistemleri','📹','Kamera ve alarm montajı'],
['Bahçe ve Peyzaj','🌿','Bahçe düzenleme ve bakım'],
['Özel Ders','📚','Bire bir eğitim ve destek'],
['Organizasyon','🎉','Etkinlik ve kutlama işleri'],
['Web Tasarım','🌐','Web sitesi ve dijital işler'],
['Diğer Hizmetler','✳️','Farklı hizmet talepleri']
];
const districts=['Altındağ','Çankaya','Etimesgut','Gölbaşı','Keçiören','Mamak','Sincan','Yenimahalle'];
const mockRequests=[
{id:'sample1',title:'Mutfak altı su tesisatı kontrolü',category:'Su Tesisatçısı',district:'Çankaya',description:'Mutfak dolabının altında hafif su sızıntısı var. Tesisatın incelenmesini ve gerekli tamirin yapılmasını istiyorum.',example:true},
{id:'sample2',title:'2+1 dairenin boyanması',category:'Boya ve Badana',district:'Yenimahalle',description:'Boş dairenin salon ve odaları boyanacak. Malzeme ve işçilik için ayrı ayrı bilgi almak istiyorum.',example:true},
{id:'sample3',title:'Avize montajı ve priz değişimi',category:'Elektrikçi',district:'Keçiören',description:'İki adet avize kurulumu ve birkaç eski prizin yenilenmesi gerekiyor.',example:true},
{id:'sample4',title:'Koltuk ve yatak odası montajı',category:'Mobilya Montajı',district:'Etimesgut',description:'Yeni alınan mobilyaların montajı ve kontrolü için destek arıyorum.',example:true}
];
const mockPros=[
{id:1,name:'Örnek Elektrik Ustası',profession:'Elektrikçi',district:'Çankaya',exp:12,bio:'Elektrik arızaları, avize montajı ve aydınlatma kurulumlarında hizmet profili örneği.',initial:'E'},
{id:2,name:'Örnek Tesisat Uzmanı',profession:'Su Tesisatçısı',district:'Yenimahalle',exp:9,bio:'Su tesisatı, gider temizliği ve musluk değişimi için hazırlanmış örnek profil.',initial:'T'},
{id:3,name:'Örnek Boya Ekibi',profession:'Boya ve Badana',district:'Keçiören',exp:7,bio:'İç cephe boya, alçı ve badana çalışmalarını tanıtan demo profil.',initial:'B'},
{id:4,name:'Örnek Temizlik Hizmeti',profession:'Ev Temizliği',district:'Çankaya',exp:6,bio:'Ev ve ofis temizliği için temsili hizmet veren profili.',initial:'H'},
{id:5,name:'Örnek Klima Servisi',profession:'Klima Servisi',district:'Etimesgut',exp:10,bio:'Klima bakım, onarım ve montaj konularında örnek hizmet profili.',initial:'K'},
{id:6,name:'Örnek Montaj Ustası',profession:'Mobilya Montajı',district:'Mamak',exp:8,bio:'Mobilya montajı ve küçük ev tamiratlarına yönelik tanıtım profili.',initial:'M'}
];
const plans=[{name:'Başlangıç',monthly:299,yearly:2870,credits:10,cats:1,areas:1},{name:'Profesyonel',monthly:599,yearly:5750,credits:30,cats:3,areas:5},{name:'Kurumsal',monthly:999,yearly:9590,credits:70,cats:10,areas:'Sınırsız'}];
const trialPlan={name:'30 Gün Ücretsiz',credits:15,cats:2,areas:3,days:30};
const extras=[[5,199],[15,499],[30,899]];
const storageKey='ustacebim-ui-preview-v2';
const $=sel=>document.querySelector(sel);
const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const add=(parent,...children)=>{children.forEach(c=>parent.appendChild(c));return parent};
const button=(label,cls,handler)=>{const b=node('button',cls,label);b.type='button';b.addEventListener('click',handler);return b};
const formatTL=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);
let saved={requests:[],profile:null};
try{const v=JSON.parse(localStorage.getItem(storageKey));if(v&&typeof v==='object'){saved.requests=Array.isArray(v.requests)?v.requests:[];saved.profile=v.profile&&typeof v.profile==='object'?v.profile:null}}catch{}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved))}catch{}}
const sampleTag=()=>node('span','tag','Örnek veri');
function fillSelect(id,values){const el=$(id);values.forEach(item=>{const opt=document.createElement('option');opt.value=item;opt.textContent=item;el.appendChild(opt)})}
['#formCategory','#proProfession','#requestCategory','#proCategory'].forEach(sel=>fillSelect(sel,categories.map(x=>x[0])));
['#formDistrict','#proArea','#requestDistrict','#proDistrict'].forEach(sel=>fillSelect(sel,districts));
function buildCategory(cardData){const [name,emoji,desc]=cardData;const card=node('article','category-card');card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',name+' için talep aç');function open(){go('talep-olustur');$('#formCategory').value=name}card.onclick=open;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};add(card,node('span','category-emoji',emoji),node('h3','',name),node('p','',desc),node('span','category-arrow','↗'));return card}
function renderCategories(term=''){const all=$('#allCategories'),feat=$('#featuredCategories');all.replaceChildren();feat.replaceChildren();const list=categories.filter(x=>x.join(' ').toLocaleLowerCase('tr').includes(term.toLocaleLowerCase('tr')));list.forEach(c=>all.append(buildCategory(c)));categories.slice(0,6).forEach(c=>feat.append(buildCategory(c)));if(!list.length)all.append(node('p','', 'Aradığın hizmet kategorisi bulunamadı.'))}
$('#categorySearch').addEventListener('input',e=>renderCategories(e.target.value));renderCategories();
const pages=new Set([...document.querySelectorAll('.page')].map(x=>x.id));
function go(page){const name=pages.has(page)?page:'not-found';document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!==name));document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+name));document.querySelectorAll('[data-mobile-nav]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+name));$('#navlinks').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');if(name==='talepler')renderRequests();if(name==='ustalar')renderPros();if(name==='paketler')renderPlans();if(name==='panel')renderDash();window.scrollTo({top:0,behavior:'instant'});document.title=(name==='anasayfa'?'Hizmet bul, teklif al':({'hizmetler':'Hizmetler','talepler':'İş Talepleri','talep-olustur':'Talep Oluştur','ustalar':'Ustalar','giris':'Giriş Yap','telefon-giris':'Telefonla Giriş','usta-kayit':'Usta Ol','paketler':'Üyelik Paketleri','panel':'Panelim','usta-detay':'Usta Profili'}[name]||'UstaCebim'))+' | UstaCebim'}
function route(){go(decodeURIComponent(location.hash.slice(1)||'anasayfa'))}
window.addEventListener('hashchange',route);
document.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;const target=b.getAttribute('data-page');if(location.hash==='#'+target)go(target);else location.hash=target});
$('#menuToggle').addEventListener('click',()=>{const open=$('#navlinks').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open))});
function requestCard(r){const card=node('article','request-card');add(card,sampleTag(),node('h3','',r.title),node('p','',r.description));const meta=node('div','request-foot');const left=node('span','',r.category+' · '+r.district+' / Ankara');const btn=button('Detayları Gör →','btn btn-primary',()=>{alert('Önizleme sürümü: Gerçek teklif gönderme sistemi henüz aktif değildir.')});add(meta,left,btn);card.appendChild(meta);if(!r.example){card.querySelector('.tag').textContent='Yerel taslak'}return card}
function renderRequests(){const root=$('#requestList');root.replaceChildren();const cf=$('#requestCategory').value,df=$('#requestDistrict').value;const matches=[...saved.requests,...mockRequests].filter(x=>(!cf||x.category===cf)&&(!df||x.district===df));matches.forEach(r=>root.append(requestCard(r)));if(!matches.length)root.append(node('div','empty-state','Bu filtrelerde talep bulunamadı.'))}
$('#requestCategory').onchange=renderRequests;$('#requestDistrict').onchange=renderRequests;
$('#requestForm').addEventListener('submit',e=>{e.preventDefault();const category=$('#formCategory').value,district=$('#formDistrict').value,title=$('#formTitle').value.trim(),description=$('#formDetails').value.trim();if(title.length<5||description.length<15){$('#requestStatus').textContent='Lütfen başlığı ve açıklamayı biraz daha ayrıntılı yaz.';return}const r={id:'local-'+Date.now(),category,district,title,description,budget:$('#formBudget').value||null,date:$('#formDate').value||null,createdAt:new Date().toISOString(),example:false};saved.requests.unshift(r);persist();e.target.reset();$('#requestStatus').textContent='Talep tarayıcına demo olarak kaydedildi; sunucuya gönderilmedi.';location.hash='talepler'});
function proCard(pro){const card=node('article','pro-card');const head=node('div','pro-head');const av=node('div','pro-avatar',pro.initial);const details=node('div');add(details,node('h3','',pro.name),node('p','',pro.profession));add(head,av,details);add(card,head,node('p','',pro.bio));const meta=node('div','pro-meta');add(meta,node('span','', '📍 '+pro.district),node('span','', '◷ '+pro.exp+' yıl deneyim'));card.appendChild(meta);card.append(button('Profili İncele →','btn btn-primary',()=>showPro(pro)));const tag=sampleTag();card.prepend(tag);return card}
function allPros(){let result=[...mockPros];if(saved.profile)result.unshift({...saved.profile,id:0,initial:(saved.profile.name||'U').slice(0,1).toLocaleUpperCase('tr'),example:false});return result}
function renderPros(){const root=$('#proList');root.replaceChildren();const cat=$('#proCategory').value,dist=$('#proDistrict').value;const list=allPros().filter(p=>(!cat||p.profession===cat)&&(!dist||p.district===dist));list.forEach(p=>root.append(proCard(p)));if(!list.length)root.append(node('div','empty-state','Bu filtrelerde usta profili bulunamadı.'))}
function showPro(pro){const root=$('#proDetail');root.replaceChildren();const banner=node('div','profile-banner'),avatar=node('div','pro-avatar',pro.initial),text=node('div');add(text,node('span','overline',pro.example!==false?'TEMSİLİ PROFİL':'YEREL ÖNİZLEME'),node('h1','',pro.name),node('p','',pro.profession+' · '+pro.district+' / Ankara'));add(banner,avatar,text);const body=node('div','profile-body'),about=node('article'),aside=node('article');add(about,node('h2','','Hakkında'),node('p','',pro.bio));add(aside,node('h3','','Hizmet bilgileri'),node('p','','Uzmanlık: '+pro.profession),node('p','','Hizmet bölgesi: '+pro.district),node('p','','Deneyim: '+pro.exp+' yıl'),button('Teklif iste (yakında)','btn btn-primary',()=>alert('Gerçek usta iletişimi henüz aktif değil.')));add(body,about,aside);add(root,banner,body);location.hash='usta-detay';if(location.hash==='#usta-detay')go('usta-detay')}
$('#proForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#proName').value.trim(),bio=$('#proBio').value.trim();if(name.length<3||bio.length<20){$('#proStatus').textContent='Lütfen profil açıklamasını biraz daha ayrıntılı yaz.';return}saved.profile={name,profession:$('#proProfession').value,district:$('#proArea').value,exp:Number($('#proExperience').value)||0,bio};persist();$('#proStatus').textContent='Profilin yerel önizlemesi kaydedildi. Henüz yayımlanmadı.';showPro({...saved.profile,initial:name[0].toLocaleUpperCase('tr'),example:false})});
function renderPlans(){
 const root=$('#pricingList');root.replaceChildren();
 const yearly=$('#billingYear').checked;
 const trial=node('article','price-card trial-card');
 add(trial,node('span','tag','İLK KAYITTA BİR KEZ'),node('h3','',trialPlan.name),node('p','','Profil onayından sonra başlar; otomatik ücretlendirme yok.'));
 const trialPrice=node('div','price','0 TL');trialPrice.append(node('small','',' / 30 gün'));trial.append(trialPrice);
 const trialItems=node('ul');
 [trialPlan.credits+' teklif hakkı / deneme boyunca',trialPlan.cats+' meslek kategorisi',trialPlan.areas+' hizmet ilçesi','Kredi kartı gerekmez','Kalan haklar 30 gün sonunda sona erer'].forEach(s=>trialItems.append(node('li','',s)));
 trial.append(trialItems,button('Ücretsiz Usta Profili Oluştur →','btn btn-primary',()=>location.hash='usta-kayit'));
 root.append(trial);
 plans.forEach((p,i)=>{
  const card=node('article','price-card'+(i===1?' featured':''));
  if(i===1)card.append(node('span','featured-badge','ÖRNEK PAKET'));
  add(card,node('h3','',p.name),node('p','','Deneme sonrasında tercih edilebilir — fiyatlar henüz kesin değil.'));
  const price=node('div','price',formatTL(yearly?p.yearly:p.monthly));
  price.append(node('small','',yearly?' / yıl':' / ay'));card.append(price);
  const ul=node('ul');
  [p.credits+' teklif hakkı / ay',p.cats+' meslek kategorisi',p.areas+' hizmet bölgesi','Profil ve portföy alanı'].forEach(s=>ul.append(node('li','',s)));
  card.append(ul,button('Henüz Satışta Değil','btn btn-primary',()=>alert('Ücretli üyelik ve ödeme sistemi henüz aktif değil.')));
  root.append(card);
 });
 const extra=$('#extraList');extra.replaceChildren();
 extras.forEach(p=>{const c=node('article','extra-card'),left=node('div');add(left,node('h3','',p[0]+' ek teklif hakkı'),node('p','','Örnek ek paket — satışı kapalı'));add(c,left,node('strong','',formatTL(p[1])));extra.append(c)});
}
$('#billingYear').onchange=renderPlans;renderPlans();
let dashSection='overview';function renderDash(){const root=$('#dashboardContent');root.replaceChildren();document.querySelectorAll('[data-dash]').forEach(b=>b.classList.toggle('active',b.dataset.dash===dashSection));if(dashSection==='overview'){add(root,node('h2','','Genel bakış'),node('p','', 'Demo sürümündeki yerel taslakların.'));const stats=node('div','stats-grid');[['Talep taslağı',saved.requests.length],['Usta profili',saved.profile?'1':'0'],['Gerçek teklif hakkı','—']].forEach(x=>{const s=node('div','stat');add(s,node('strong','',x[1]),node('small','',x[0]));stats.append(s)});root.append(stats);root.append(node('p','info-note','Bu bilgiler yalnızca bu tarayıcıda saklanır. Gerçek kullanıcı hesabı ve teklifler henüz bağlı değildir.'))}
if(dashSection==='requests'){root.append(node('h2','','Taleplerim'));if(!saved.requests.length)root.append(node('p','', 'Henüz yerel talep taslağın bulunmuyor.'));saved.requests.forEach(r=>root.append(requestCard(r)));root.append(button('Yeni talep oluştur →','btn btn-primary',()=>location.hash='talep-olustur'))}
if(dashSection==='profile'){root.append(node('h2','','Usta profilim'));if(!saved.profile)root.append(node('p','', 'Henüz örnek usta profilin yok.'));else{root.append(node('h3','',saved.profile.name));root.append(node('p','',saved.profile.profession+' · '+saved.profile.district));root.append(node('p','',saved.profile.bio))}root.append(button('Profili düzenle →','btn btn-primary',()=>{if(saved.profile){$('#proName').value=saved.profile.name;$('#proProfession').value=saved.profile.profession;$('#proArea').value=saved.profile.district;$('#proExperience').value=saved.profile.exp;$('#proBio').value=saved.profile.bio}location.hash='usta-kayit'}))}
if(dashSection==='credits'){root.append(node('h2','','Teklif haklarım'));root.append(node('div','empty-state','Gerçek abonelik ve teklif hakkı bakiyesi, sunucu üyelik sistemi bağlandıktan sonra burada görüntülenecek.'));root.append(button('Paketleri incele →','btn btn-primary',()=>location.hash='paketler'))}}
document.querySelectorAll('[data-dash]').forEach(b=>b.onclick=()=>{dashSection=b.dataset.dash;renderDash()});
document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{const which=b.dataset.auth;document.querySelectorAll('[data-auth]').forEach(x=>x.classList.toggle('active',x===b));$('#authLogin').classList.toggle('hidden',which!=='login');$('#authRegister').classList.toggle('hidden',which!=='register')});
$('#phoneSend').addEventListener('click',()=>{$('#phoneStatus').textContent='SMS gönderilmedi. Bu sürümde Netgsm bağlantısı ve gerçek telefon doğrulaması etkin değil.'});
route();
