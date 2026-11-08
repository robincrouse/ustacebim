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
const plans=[{name:'Başlangıç',monthly:299,yearly:2870,credits:20,cats:1,areas:1},{name:'Profesyonel',monthly:599,yearly:5750,credits:50,cats:3,areas:5},{name:'Kurumsal',monthly:999,yearly:9590,credits:100,cats:10,areas:'Sınırsız'}];
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
['#formCategory','#requestCategory','#proCategory'].forEach(sel=>fillSelect(sel,categories.map(x=>x[0])));
['#formDistrict','#requestDistrict','#proDistrict'].forEach(sel=>fillSelect(sel,districts));
function buildCategory(cardData){const [name,emoji,desc]=cardData;const card=node('article','category-card');card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',name+' için talep aç');function open(){go('talep-olustur');$('#formCategory').value=name}card.onclick=open;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};add(card,node('span','category-emoji',emoji),node('h3','',name),node('p','',desc),node('span','category-arrow','↗'));return card}
function renderCategories(term=''){const all=$('#allCategories'),feat=$('#featuredCategories');all.replaceChildren();feat.replaceChildren();const list=categories.filter(x=>x.join(' ').toLocaleLowerCase('tr').includes(term.toLocaleLowerCase('tr')));list.forEach(c=>all.append(buildCategory(c)));categories.slice(0,6).forEach(c=>feat.append(buildCategory(c)));if(!list.length)all.append(node('p','', 'Aradığın hizmet kategorisi bulunamadı.'))}
$('#categorySearch').addEventListener('input',e=>renderCategories(e.target.value));renderCategories();
function buildChoices(rootId,items,max,kind){
 const root=$(rootId);root.replaceChildren();
 items.forEach(item=>{
  const label=node('label','choice-pill');const check=document.createElement('input');
  check.type='checkbox';check.value=item;check.name=kind;check.setAttribute('aria-label',item);
  const indicator=node('span','choice-indicator','✓');add(label,check,indicator,node('span','',item));
  check.addEventListener('change',()=>{
   const checked=[...root.querySelectorAll('input:checked')];
   if(checked.length>max){check.checked=false;showToast('En fazla '+max+' '+(kind==='profession'?'meslek':'ilçe')+' seçebilirsin.');return}
   root.querySelectorAll('.choice-pill').forEach(p=>p.classList.toggle('selected',p.querySelector('input').checked));
  });
  root.append(label);
 });
}
function getChoices(name){return [...document.querySelectorAll('input[name="'+name+'"]:checked')].map(x=>x.value)}
function setChoices(name,values){const selected=new Set(values||[]);document.querySelectorAll('input[name="'+name+'"]').forEach(x=>{x.checked=selected.has(x.value);x.closest('.choice-pill').classList.toggle('selected',x.checked)})}
function showToast(message){let el=$('#uiToast');if(!el){el=node('div','ui-toast');el.id='uiToast';el.setAttribute('role','status');document.body.append(el)}el.textContent=message;el.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove('show'),3500)}
buildChoices('#proProfessionChoices',categories.map(x=>x[0]),2,'profession');
buildChoices('#proAreaChoices',districts,3,'area');
fillSelect('#proBusinessDistrict',districts);
function syncProviderType(){
 const type=document.querySelector('input[name="providerType"]:checked')?.value||'individual';
 const show=type!=='individual';
 $('#businessFields').classList.toggle('hidden',!show);
 document.querySelectorAll('.provider-type-option').forEach(l=>l.classList.toggle('selected',l.querySelector('input').checked));
 $('#proLegalName').required=show;
}
document.querySelectorAll('input[name="providerType"]').forEach(r=>r.addEventListener('change',syncProviderType));
syncProviderType();

const wizardSteps=Array.from(document.querySelectorAll('[data-pro-step]'));
let wizardStep=0;
function wizardSummary(){
 const type=document.querySelector('input[name="providerType"]:checked')?.value||'individual';
 const labels={individual:'Bireysel usta',sole_proprietor:'Şahıs işletmesi',company:'Şirket / firma'};
 const summary=$('#proWizardSummary');summary.replaceChildren();
 const rows=[['Hesap türü',labels[type]],['Profil',($('#proName').value.trim()||'Henüz girilmedi')],['Uzmanlıklar',getChoices('profession').join(', ')||'Henüz seçilmedi'],['Hizmet ilçeleri',getChoices('area').join(', ')||'Henüz seçilmedi']];
 rows.forEach(([label,value])=>{const row=node('div','wizard-summary-row');add(row,node('span','',label),node('strong','',value));summary.append(row)});
 $('#businessWizardBlock').classList.toggle('hidden',type==='individual');
}
function updateWizard(){
 wizardSteps.forEach((panel,i)=>{const active=i===wizardStep;panel.classList.toggle('hidden',!active);panel.setAttribute('aria-hidden',String(!active))});
 const names=['Hesap türü','Profil bilgileri','Hizmet alanların','Son kontrol'];
 $('#proWizardTitle').textContent=names[wizardStep];
 $('#proWizardCounter').textContent=(wizardStep+1)+' / 4';
 $('#proWizardProgress').style.width=((wizardStep+1)*25)+'%';
 $('#proWizardBack').classList.toggle('hidden',wizardStep===0);
 $('#proWizardNext').classList.toggle('hidden',wizardStep===3);
 $('#proWizardSubmit').classList.toggle('hidden',wizardStep!==3);
 $('#proStatus').textContent='';
 if(wizardStep===3)wizardSummary();
}
function getProWebsite(){
 const name=$('#proWebsiteName').value.trim().toLowerCase();
 const ext=$('#proWebsiteTld').value.trim().toLowerCase().replace(/^\.+/,'');
 return {name,ext,url:name&&ext?'https://www.'+name+'.'+ext:''};
}
function setProWebsite(url){
 let hostname='';
 try{hostname=new URL(url).hostname.replace(/^www\./,'')}catch{}
 if(!hostname)return;
 const parts=hostname.split('.');
 $('#proWebsiteName').value=parts.shift()||'';
 $('#proWebsiteTld').value=parts.join('.');
}
function validateWizardStep(step){
 const status=$('#proStatus');
 if(step===1){
  const name=$('#proName').value.trim(),bio=$('#proBio').value.trim();
  if(name.length<3){status.textContent='Lütfen görünen adını en az 3 karakter yaz.';$('#proName').focus();return false}
  if(bio.length<20){status.textContent='Kısaca kendini ve yaptığın işleri anlat (en az 20 karakter).';$('#proBio').focus();return false}
  const {name:domainName,ext}=getProWebsite();
  const validName=/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(domainName);
  const validExt=/^[a-z]{2,}(?:\.[a-z]{2,})*$/.test(ext);
  if((domainName||ext)&&(!validName||!validExt)){status.textContent='Site adı ve uzantıyı kontrol et. Örnek: siteadi + com.tr';$('#proWebsiteName').focus();return false}
  const exp=$('#proExperience'),year=$('#proEstablished');
  if((exp.value&&!exp.checkValidity())||(year.value&&!year.checkValidity())){status.textContent='Deneyim veya kuruluş yılını kontrol et.';return false}
 }
 if(step===2){
  if(!getChoices('profession').length){status.textContent='En az bir uzmanlık seçmelisin.';return false}
  if(!getChoices('area').length){status.textContent='En az bir hizmet ilçesi seçmelisin.';return false}
 }
 if(step===3){
  const type=document.querySelector('input[name="providerType"]:checked')?.value;
  if(type!=='individual'&&$('#proLegalName').value.trim().length<3){status.textContent='İşletmenin resmî unvanını yaz.';$('#proLegalName').focus();return false}
 }
 return true;
}
$('#proWizardBack').addEventListener('click',()=>{wizardStep=Math.max(0,wizardStep-1);updateWizard()});
$('#proWizardNext').addEventListener('click',()=>{if(!validateWizardStep(wizardStep))return;wizardStep=Math.min(3,wizardStep+1);updateWizard()});
updateWizard();

const proMedia={avatar:null,cover:null,gallery:[]};
const mediaUrls=new Set();
function releaseUrl(url){if(url){URL.revokeObjectURL(url);mediaUrls.delete(url)}}
function imageAllowed(file,maxMb){
 return file&&['image/jpeg','image/png','image/webp'].includes(file.type)&&file.size<=maxMb*1024*1024&&file.size>0;
}
function renderMediaPreview(kind,holder){
 const item=proMedia[kind],el=$(holder);el.replaceChildren();
 if(item){
  const img=document.createElement('img');img.src=item.url;img.alt=kind==='avatar'?'Seçilen profil görseli':'Seçilen kapak görseli';el.append(img);
 }else el.textContent=kind==='avatar'?'＋':'▧';
}
function setSingleMedia(kind,file,limit){
 if(!imageAllowed(file,limit)){showToast('Lütfen JPG, PNG veya WebP görseli seç (en fazla '+limit+' MB).');return}
 if(proMedia[kind])releaseUrl(proMedia[kind].url);
 const url=URL.createObjectURL(file);mediaUrls.add(url);proMedia[kind]={url,name:file.name};
 renderMediaPreview(kind,kind==='avatar'?'#proAvatarPreview':'#proCoverPreview');
}
$('#proAvatarFile').addEventListener('change',e=>{if(e.target.files[0])setSingleMedia('avatar',e.target.files[0],2);e.target.value=''});
$('#proCoverFile').addEventListener('change',e=>{if(e.target.files[0])setSingleMedia('cover',e.target.files[0],4);e.target.value=''});
[['#removeAvatar','avatar','#proAvatarPreview'],['#removeCover','cover','#proCoverPreview']].forEach(([buttonId,kind,holder])=>{
 $(buttonId).addEventListener('click',()=>{if(proMedia[kind])releaseUrl(proMedia[kind].url);proMedia[kind]=null;renderMediaPreview(kind,holder)});
});
function renderGallery(){
 const root=$('#proGalleryPreview');root.replaceChildren();
 for(const entry of proMedia.gallery){
  const item=node('div','gallery-item');
  const img=document.createElement('img');img.src=entry.url;img.alt='İş örneği görseli';
  const del=button('×','gallery-remove',()=>{proMedia.gallery=proMedia.gallery.filter(x=>x!==entry);releaseUrl(entry.url);renderGallery()});
  del.setAttribute('aria-label','İş örneğini kaldır');add(item,img,del);root.append(item);
 }
 if(proMedia.gallery.length<6){
  const label=node('label','gallery-add');label.htmlFor='proGalleryFiles';
  add(label,node('span','','＋'),node('small','','İş görseli ekle'));root.append(label);
 }
}
$('#proGalleryFiles').addEventListener('change',e=>{
 const entries=Array.from(e.target.files||[]);
 for(const file of entries){
  if(proMedia.gallery.length>=6){showToast('En fazla 6 iş görseli eklenebilir.');break}
  if(!imageAllowed(file,4)){showToast('Yalnız 4 MB altında JPG, PNG veya WebP görseli ekle.');continue}
  const url=URL.createObjectURL(file);mediaUrls.add(url);
  proMedia.gallery.push({url,name:file.name});
 }
 e.target.value='';renderGallery();
});
window.addEventListener('pagehide',()=>{for(const url of mediaUrls)URL.revokeObjectURL(url);mediaUrls.clear()});


const pages=new Set([...document.querySelectorAll('.page')].map(x=>x.id));
function go(page){const name=pages.has(page)?page:'not-found';document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!==name));document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+name));document.querySelectorAll('[data-mobile-nav]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+name));$('#navlinks').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');if(name==='talepler')renderRequests();if(name==='ustalar')renderPros();if(name==='paketler')renderPlans();if(name==='panel')renderDash();window.scrollTo({top:0,behavior:'instant'});document.title=(name==='anasayfa'?'Hizmet bul, teklif al':({'hizmetler':'Hizmetler','talepler':'İş Talepleri','talep-olustur':'Talep Oluştur','ustalar':'Ustalar','giris':'Giriş Yap','telefon-giris':'Telefonla Giriş','usta-kayit':'Usta Ol','paketler':'Üyelik Paketleri','panel':'Panelim','usta-detay':'Usta Profili'}[name]||'UstaCebim'))+' | UstaCebim'}
function route(){go(decodeURIComponent(location.hash.slice(1)||'anasayfa'))}
window.addEventListener('hashchange',route);
document.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;const target=b.getAttribute('data-page');if(location.hash==='#'+target)go(target);else location.hash=target});
$('#menuToggle').addEventListener('click',()=>{const open=$('#navlinks').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open))});
function requestCard(r){
 const card=node('article','request-card');
 const tag=node('span','tag',r.example?'Örnek iş fırsatı':'Yalnız bu tarayıcıdaki taslak');
 add(card,tag,node('h3','',r.title),node('p','',r.description));
 const meta=node('div','request-foot');
 const left=node('span','',r.category+' · '+r.district+' / Ankara');
 const btn=button('İşi İncele →','btn btn-primary',()=>previewOpportunity(r));
 add(meta,left,btn);card.append(meta);return card
}
function previewOpportunity(request){
 const backdrop=node('div','preview-backdrop'),sheet=node('section','preview-sheet');
 sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label','İş fırsatı önizlemesi');
 const close=()=>{document.removeEventListener('keydown',onKey);backdrop.remove()};
 const onKey=e=>{if(e.key==='Escape')close()};
 document.addEventListener('keydown',onKey);
 backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
 const head=node('div','preview-sheet-top');
 add(head,node('span','overline','İŞ FIRSATI · TASARIM ÖNİZLEMESİ'),button('✕','preview-close',close));
 add(sheet,head,node('h2','',request.title),node('p','opportunity-meta','📍 '+request.district+', Ankara · '+request.category),node('p','',request.description));
 const note=node('div','info-note','Telefon numarası ve açık adres gizlidir. Gerçek sistemde teklifin başarıyla gönderildiğinde 1 hakkın düşecek. Bu önizlemede hiçbir hak düşmez ve müşteriye teklif gitmez.');
 sheet.append(note);
 const form=node('form','preview-offer-form');
 const priceLabel=node('label','', 'Teklif tutarın (TL)');
 const price=node('input');price.type='number';price.min='1';price.max='10000000';price.required=true;price.placeholder='Örn. 2500';
 priceLabel.append(price);
 const messageLabel=node('label','', 'Teklif açıklaman');
 const message=node('textarea');message.maxLength=500;message.minLength=10;message.required=true;message.placeholder='İşi ne zaman ve nasıl yapabileceğini kısaca anlat.';
 messageLabel.append(message);
 const submit=node('button','btn btn-primary full','Teklifi Önizle — 1 Hak');submit.type='submit';
 form.append(priceLabel,messageLabel,submit);
 form.addEventListener('submit',e=>{e.preventDefault();showToast(formatTL(Number(price.value))+' teklif önizlendi. Gerçek teklif gönderilmedi, hak düşmedi.');close()});
 sheet.append(form);backdrop.append(sheet);document.body.append(backdrop);price.focus()
}
function renderRequests(){const root=$('#requestList');root.replaceChildren();const cf=$('#requestCategory').value,df=$('#requestDistrict').value;const matches=[...saved.requests,...mockRequests].filter(x=>(!cf||x.category===cf)&&(!df||x.district===df));matches.forEach(r=>root.append(requestCard(r)));if(!matches.length)root.append(node('div','empty-state','Bu filtrelerde talep bulunamadı.'))}
$('#requestCategory').onchange=renderRequests;$('#requestDistrict').onchange=renderRequests;
$('#requestForm').addEventListener('submit',e=>{e.preventDefault();const category=$('#formCategory').value,district=$('#formDistrict').value,title=$('#formTitle').value.trim(),description=$('#formDetails').value.trim();if(title.length<5||description.length<15){$('#requestStatus').textContent='Lütfen başlığı ve açıklamayı biraz daha ayrıntılı yaz.';return}const r={id:'local-'+Date.now(),category,district,title,description,budget:$('#formBudget').value||null,date:$('#formDate').value||null,createdAt:new Date().toISOString(),example:false};saved.requests.unshift(r);persist();e.target.reset();$('#requestStatus').textContent='Talep tarayıcına demo olarak kaydedildi; sunucuya gönderilmedi.';location.hash='talepler'});
function proCard(pro){const card=node('article','pro-card');const head=node('div','pro-head');const av=node('div','pro-avatar',pro.initial);const details=node('div');add(details,node('h3','',pro.name),node('p','',pro.profession));add(head,av,details);add(card,head,node('p','',pro.bio));const meta=node('div','pro-meta');add(meta,node('span','', '📍 '+pro.district),node('span','', '◷ '+pro.exp+' yıl deneyim'));card.appendChild(meta);card.append(button('Profili İncele →','btn btn-primary',()=>showPro(pro)));const tag=sampleTag();card.prepend(tag);return card}
function allPros(){let result=[...mockPros];if(saved.profile)result.unshift({...saved.profile,id:0,initial:(saved.profile.name||'U').slice(0,1).toLocaleUpperCase('tr'),example:false});return result}
function renderPros(){const root=$('#proList');root.replaceChildren();const cat=$('#proCategory').value,dist=$('#proDistrict').value;const list=allPros().filter(p=>(!cat||(p.professions||[p.profession]).includes(cat))&&(!dist||(p.areas||[p.district]).includes(dist)));list.forEach(p=>root.append(proCard(p)));if(!list.length)root.append(node('div','empty-state','Bu filtrelerde usta profili bulunamadı.'))}
function showPro(pro){const root=$('#proDetail');root.replaceChildren();const banner=node('div','profile-banner'),avatar=node('div','pro-avatar',pro.initial),text=node('div');add(text,node('span','overline',pro.example!==false?'TEMSİLİ PROFİL':'YEREL ÖNİZLEME'),node('h1','',pro.name),node('p','',(pro.professions||[pro.profession]).join(' · ')+' · '+(pro.areas||[pro.district]).join(', ')+' / Ankara'));if(pro.example===false&&proMedia.avatar){const img=document.createElement('img');img.src=proMedia.avatar.url;img.alt='Profil görseli önizlemesi';avatar.replaceChildren(img);avatar.classList.add('profile-image-avatar')}
if(pro.example===false&&proMedia.cover){banner.style.backgroundImage='linear-gradient(90deg,rgba(16,45,58,.87),rgba(16,45,58,.56)),url("'+proMedia.cover.url+'")';banner.style.backgroundSize='cover';banner.style.backgroundPosition='center'}
add(banner,avatar,text);const body=node('div','profile-body'),about=node('article'),aside=node('article');add(about,node('h2','','Hakkında'),node('p','',pro.bio));add(aside,node('h3','','Hizmet bilgileri'),node('p','','Uzmanlık: '+(pro.professions||[pro.profession]).join(', ')),node('p','','Hizmet bölgesi: '+(pro.areas||[pro.district]).join(', ')),node('p','','Deneyim: '+pro.exp+' yıl'),node('p','','Hizmet veren türü: '+({individual:'Bireysel usta',sole_proprietor:'Şahıs işletmesi',company:'Şirket'}[pro.providerType]||'Belirtilmedi')),button('Teklif iste (yakında)','btn btn-primary',()=>alert('Gerçek usta iletişimi henüz aktif değil.')));add(body,about,aside);add(root,banner,body);
if(pro.example===false&&proMedia.gallery.length){
 const gallerySection=node('section','profile-gallery-section');
 gallerySection.append(node('h2','','İş örnekleri · Yerel önizleme'));
 const grid=node('div','profile-gallery-grid');
 for(const media of proMedia.gallery){const pic=document.createElement('img');pic.src=media.url;pic.alt='İş örneği';grid.append(pic)}
 add(gallerySection,grid);root.append(gallerySection);
}
location.hash='usta-detay';if(location.hash==='#usta-detay')go('usta-detay')}
$('#proForm').addEventListener('submit',e=>{
 e.preventDefault();
 for(const step of [1,2,3]){
  if(!validateWizardStep(step)){wizardStep=step;updateWizard();validateWizardStep(step);return}
 }

 const name=$('#proName').value.trim(),bio=$('#proBio').value.trim();
 if(name.length<3||bio.length<20){$('#proStatus').textContent='Lütfen adını ve profil açıklamanı kontrol et.';return}
 const professions=getChoices('profession'),areas=getChoices('area');
 if(!professions.length||!areas.length){$('#proStatus').textContent='En az bir meslek ve bir hizmet ilçesi seçmelisin.';return}
 const providerType=document.querySelector('input[name="providerType"]:checked')?.value||'individual';
 const legalName=$('#proLegalName').value.trim();
 if(providerType!=='individual'&&legalName.length<3){$('#proStatus').textContent='İşletmenin resmî unvanını yaz.';return}
 const website=getProWebsite().url;
 if(website && !/^https?:\/\//i.test(website)){$('#proStatus').textContent='İnternet sitesi http:// veya https:// ile başlamalı.';return}
 // Demo data intentionally excludes tax IDs, personal documents and private phone numbers.
 saved.profile={name,providerType,legalName:providerType==='individual'?'':legalName,
   profession:professions[0],district:areas[0],professions,areas,
   exp:Number($('#proExperience').value)||0,bio,website,
   established:Number($('#proEstablished').value)||null,
   businessCity:providerType==='individual'?'':$('#proBusinessCity').value.trim(),
   businessDistrict:providerType==='individual'?'':$('#proBusinessDistrict').value};
 persist();
 $('#proStatus').textContent='Profil taslağın bu tarayıcıya kaydedildi; gerçek sisteme gönderilmedi.';
 showPro({...saved.profile,initial:name[0].toLocaleUpperCase('tr'),example:false});
});
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
if(dashSection==='profile'){root.append(node('h2','','Usta profilim'));if(!saved.profile)root.append(node('p','', 'Henüz örnek usta profilin yok.'));else{root.append(node('h3','',saved.profile.name));root.append(node('p','',saved.profile.profession+' · '+saved.profile.district));root.append(node('p','',saved.profile.bio))}root.append(button('Profili düzenle →','btn btn-primary',()=>{if(saved.profile){
 const type=saved.profile.providerType||'individual';
 const input=document.querySelector('input[name="providerType"][value="'+type+'"]');if(input)input.checked=true;
 syncProviderType();
 $('#proLegalName').value=saved.profile.legalName||'';
 $('#proBusinessCity').value=saved.profile.businessCity||'Ankara';
 $('#proBusinessDistrict').value=saved.profile.businessDistrict||'';
 setProWebsite(saved.profile.website||'');
 $('#proEstablished').value=saved.profile.established||'';
 $('#proName').value=saved.profile.name;setChoices('profession',saved.profile.professions||[saved.profile.profession]);setChoices('area',saved.profile.areas||[saved.profile.district]);$('#proExperience').value=saved.profile.exp;$('#proBio').value=saved.profile.bio}location.hash='usta-kayit'}))}
if(dashSection==='credits'){root.append(node('h2','','Teklif haklarım'));root.append(node('div','empty-state','Gerçek abonelik ve teklif hakkı bakiyesi, sunucu üyelik sistemi bağlandıktan sonra burada görüntülenecek.'));root.append(button('Paketleri incele →','btn btn-primary',()=>location.hash='paketler'))}}
document.querySelectorAll('[data-dash]').forEach(b=>b.onclick=()=>{dashSection=b.dataset.dash;renderDash()});
document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{const which=b.dataset.auth;document.querySelectorAll('[data-auth]').forEach(x=>x.classList.toggle('active',x===b));$('#authLogin').classList.toggle('hidden',which!=='login');$('#authRegister').classList.toggle('hidden',which!=='register')});
$('#phoneSend').addEventListener('click',()=>{$('#phoneStatus').textContent='SMS gönderilmedi. Bu sürümde Netgsm bağlantısı ve gerçek telefon doğrulaması etkin değil.'});

/* Registration stays disabled until PHP + MariaDB migration + SMTP are ready. */
const emailRegistrationForm=document.getElementById('authRegister');
async function checkEmailRegistrationReady(){
 const notice=document.getElementById('authServiceNotice');
 try{
  const response=await fetch('./api/status.php',{credentials:'same-origin',cache:'no-store'});
  if(!response.ok)throw new Error('unavailable');
  const config=await response.json();
  const ready=config.registration_enabled===true;
  emailRegistrationForm.querySelectorAll('input,button').forEach(el=>el.disabled=!ready);
  notice.textContent=ready
   ? 'Kayıt için e-posta doğrulaması etkin. Giriş işlemi henüz hazırlanıyor.'
   : 'E-posta kayıt sistemi kuruluyor. SMTP ayarları tamamlanana kadar kayıt açılamaz.';
 }catch{
  emailRegistrationForm.querySelectorAll('input,button').forEach(el=>el.disabled=true);
  notice.textContent='E-posta kayıt hizmeti henüz kullanılamıyor.';
 }
}
emailRegistrationForm.addEventListener('submit',async event=>{
 event.preventDefault();
 const status=document.getElementById('emailRegisterStatus');
 const submit=document.getElementById('emailRegisterSubmit');
 const form=new FormData(emailRegistrationForm);
 const data={action:'register',name:String(form.get('name')||'').trim(),email:String(form.get('email')||'').trim(),password:String(form.get('password')||''),terms:form.has('terms')};
 if(!data.terms){status.textContent='Lütfen onay kutusunu işaretle.';return}
 submit.disabled=true;status.textContent='Kayıt isteği gönderiliyor...';
 try{
  const result=await fetch('./api/email.php',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(data)});
  const response=await result.json();
  status.textContent=response.message||'İşlem tamamlanamadı.';
  status.dataset.state=result.ok?'success':'error';
  if(result.ok){emailRegistrationForm.reset()}
 }catch{
  status.textContent='Bağlantı kurulamadı. Lütfen daha sonra tekrar dene.';
  status.dataset.state='error';
 }finally{submit.disabled=false}
});
checkEmailRegistrationReady();

route();
