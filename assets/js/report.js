// Word (.docx) değerlendirme raporu. vendor/docx.umd.js ve assets/js/logo.js (PDF varsa pdf.js de) çağrı öncesinde yüklenir.
// FILES: loadFiles() çıktısı { kriterId: [dosya...] }, say: ilerleme mesajı.

const MAX_PDF_PAGES = 40; // dosya başına rapora gömülen en fazla PDF sayfası (tamamı zip pakettedir)

// Görseli docx'e uygun hale getirir (JPEG/PNG doğrudan, diğerleri JPEG'e çevrilir).
async function imageForDocx(f) {
  if (/^image\/(jpeg|png)$/.test(f.type) && f.w && f.h)
    return { type: f.type === 'image/png' ? 'png' : 'jpg', data: new Uint8Array(await f.blob.arrayBuffer()), w: f.w, h: f.h };
  try {
    const bm = await createImageBitmap(f.blob), c = document.createElement('canvas');
    c.width = bm.width; c.height = bm.height;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bm, 0, 0);
    const b = await new Promise(r => c.toBlob(r, 'image/jpeg', .85));
    return { type: 'jpg', data: new Uint8Array(await b.arrayBuffer()), w: c.width, h: c.height };
  } catch (e) { return null; }
}

// PDF sayfalarını JPEG görüntülere çevirir.
async function pdfPages(f, max, say) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await f.blob.arrayBuffer()) }).promise;
    const n = Math.min(pdf.numPages, max), pages = [];
    for (let i = 1; i <= n; i++) {
      say(`PDF işleniyor: ${f.name} (${i}/${n})`);
      const p = await pdf.getPage(i), v1 = p.getViewport({ scale: 1 });
      const vp = p.getViewport({ scale: 1600 / Math.max(v1.width, v1.height) });
      const c = document.createElement('canvas');
      c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await p.render({ canvasContext: x, viewport: vp }).promise;
      const b = await new Promise(r => c.toBlob(r, 'image/jpeg', .8));
      pages.push({ type: 'jpg', data: new Uint8Array(await b.arrayBuffer()), w: c.width, h: c.height });
      p.cleanup();
    }
    const total = pdf.numPages;
    await pdf.destroy();
    return { pages, total };
  } catch (e) { return null; }
}

async function makeReport(S0, FILES = {}, say = () => {}) {
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,HeadingLevel,Header,Footer,PageNumber,TableOfContents,LevelFormat,VerticalAlign,Tab,TabStopType,ImageRun}=docx;
const isZ=isMandatory,mx=maxCredit;
const LOGO=Uint8Array.from(atob(window.LOGO_B64),c=>c.charCodeAt(0));
const G=GRADES,TH=D.th,TIPS_L=['Konut (Lojman)','Ofis','Eğitim','Otel (Misafirhane)','Sağlık','AVM / Ticaret','Diğer'];
const MN={'BBT':'Bütünleşik Bina Tasarımı, Yapım ve Yönetimi','İOK':'İç Ortam Kalitesi','YMD':'Yapı Malzemesi ve Yaşam Döngüsü Değerlendirmesi','EKV':'Enerji Kullanımı ve Verimliliği','SAY':'Su ve Atık Yönetimi','İNO':'İnovasyon'};
const MA={'BBT':'Sürdürülebilir yeşil binaların; tüm sistem ve sürecin projenin başından itibaren planlandığı, tüm paydaşların katılımıyla bütünleşik bir proje teslim süreci içinde, performans beklentilerine uygun olarak tasarlanması, yapılması ve yönetilmesinin sağlanması.',
'İOK':'Görsel, işitsel ve ısıl konfor koşullarının ile iç hava kalitesinin tasarım sürecine dahil edilen değerlendirme ve önlemlerle iyileştirilmesi; kullanıcı sağlığı, konfor, verimlilik ve memnuniyetinin artırılması.',
'YMD':'Kullanılacak yapı malzemelerinin çevresel etkilerinin en aza indirilmesi; çevresel ürün beyanı, sağlıklı ürün beyanı, sorumlu ve yerel kaynak kullanımı ile dayanıklılık ölçütlerinin belirlenmesi.',
'EKV':'Bina enerji ihtiyacının azaltılması, enerjinin etkin kullanılması ve yenilenebilir enerji çözümlerinin değerlendirilmesi yoluyla bina enerji performansının optimize edilmesi.',
'SAY':'Su kullanımında verimlilik ve alternatif su kaynaklarının (yağmur suyu, gri su) değerlendirilmesi; atıkların ayrı biriktirilmesi, yönetiminin planlanması ve uygulanması.',
'İNO':'Mevcut sertifika gereklilikleri dışında kalan yenilikçi ve iyileştirici uygulamaların ile kullanıcıların yaşam kalitesini artıran çözümlerin teşvik edilmesi. Modül puanı toplam ağırlıklı krediye etki etmez.'};
const STG=['—','1. Hazırlık ve Planlama','2. Proje (Bütünleşik Tasarım)','3. Yapıma Yönelik İhale','4. İnşaat Uygulamaları'];
const S=Object.assign({info:{},tip:2,durum:'Y',hedef:2,v:{},z:{},n:{},e:{}},S0);
const filled=Object.keys(S.v).length>0||Object.keys(S.z).length>0;
const R=calc(S),g=S.hedef,info=S.info||{},SG=filled?suggest(S,R,g):{items:[]};
const CH=await drawCharts(R,g,filled);
const NAVY='00527A',BLUE='D74921',LIGHT='E1EDF4',GREY='F2F5FA',GRN='1B8A4B',RED='C0392B',MUT='6B7788';
const W=9638,f2=x=>x.toFixed(2).replace('.',','),n2=x=>String(Math.round(x*100)/100).replace('.',',');
const YY=D.scale==='Y',dur=(S.durum==='Y'?'Yeni ':'Mevcut ')+(YY?'Yerleşme':'Bina'),tip=YY?'Yerleşme':TIPS_L[S.tip];
if(YY)D.mods.forEach(m=>{const th=[...new Set(D.crit.filter(c=>D.mods[c.m]===m).map(c=>c.t))];MN[m]=th.join(' · ');MA[m]='Yerleşme ölçeği modülü. Kapsadığı temalar: '+th.join('; ')+'.'});
const bd={style:BorderStyle.SINGLE,size:4,color:'9FBCCD'},B={top:bd,bottom:bd,left:bd,right:bd};
const dsh={style:BorderStyle.DASHED,size:8,color:BLUE},DB={top:dsh,bottom:dsh,left:dsh,right:dsh};
const run=(t,o={})=>new TextRun({text:String(t),font:'Calibri',size:o.size||21,bold:o.bold,italics:o.it,color:o.color});
const para=(t,o={})=>new Paragraph({children:Array.isArray(t)?t:[run(t,o)],alignment:o.al,keepNext:o.kn,spacing:{before:o.b||0,after:o.a??110,line:288},pageBreakBefore:o.pb,numbering:o.bul?{reference:'bul',level:0}:undefined});
const ph=(t='[Doldurunuz]')=>({t,color:MUT,it:true});
// Rapor bilgileri (açılış formu): dolu alan değeri, boşsa yer tutucu
const RP=repOf(S),K=RP.kunye,hv=x=>x!=null&&String(x).trim()!=='',val=(x,d)=>hv(x)?String(x).trim():ph(d),trd=d=>hv(d)?d.split('-').reverse().join('.'):'';
const lines=t=>String(t||'').split('\n').map(x=>x.trim()).filter(Boolean);
const cell=(c,w,o={})=>{if(c&&c.t!==undefined&&!Array.isArray(c)){o=Object.assign({},o,c);c=c.t}
 const kids=(Array.isArray(c)?c:[c]).map(x=>(typeof x==='string'||typeof x==='number')?para(x,{size:o.size||19,bold:o.bold,color:o.color,it:o.it,al:o.al,a:30}):x);
 return new TableCell({width:{size:w,type:WidthType.DXA},borders:o.dash?DB:B,columnSpan:o.span,verticalAlign:VerticalAlign.CENTER,margins:{top:70,bottom:70,left:110,right:110},shading:o.fill?{type:ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,children:kids})};
const tbl=(ws,head,rows,o={})=>{const s=ws.reduce((a,b)=>a+b,0);
 const hr=head?[new TableRow({tableHeader:true,cantSplit:true,children:head.map((h,i)=>cell(h,ws[i],{fill:NAVY,color:'FFFFFF',bold:true,size:19}))})]:[];
 return new Table({width:{size:s,type:WidthType.DXA},columnWidths:ws,rows:hr.concat(rows.map((r,ri)=>new TableRow({cantSplit:true,children:r.map((c,i)=>cell(c,ws[i],{fill:o.zebra!==false&&ri%2?GREY:undefined,bold:o.b0&&i===0,size:o.size}))})))})};
const kv=(rows,w=[3000,6638])=>tbl(w,null,rows.map(r=>[{t:r[0],fill:LIGHT,bold:true,color:NAVY},r[1]]),{zebra:false});
const h1=(t,pb=true)=>new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:pb,children:[new TextRun({text:t,font:'Calibri',size:32,bold:true,color:NAVY})],spacing:{before:0,after:200},border:{bottom:{style:BorderStyle.SINGLE,size:12,color:BLUE,space:4}}});
const h2=t=>new Paragraph({heading:HeadingLevel.HEADING_2,keepNext:true,children:[new TextRun({text:t,font:'Calibri',size:26,bold:true,color:NAVY})],spacing:{before:260,after:120}});
const h3=(t,pb)=>new Paragraph({heading:HeadingLevel.HEADING_3,keepNext:true,pageBreakBefore:pb,children:[new TextRun({text:t,font:'Calibri',size:22,bold:true,color:NAVY})],spacing:{before:180,after:80}});
const gap=()=>para('',{a:60});
const note=(t)=>para(t,{it:true,color:MUT,size:18});
const idx=reportModuleOrder();
const crit=m=>D.crit.filter(c=>c.m===m);
const eAd=c=>'Ek-'+c.id.replace(/ /g,'');
const zFrom=c=>c.zg?` (${G[c.zg]} ve üstü)`:'';
const cap=c=>isZ(c,S)?(earnableCredit(c,S)?'Zorunlu'+zFrom(c)+' + '+n2(mx(c,S)):(mx(c,S)?`Zorunlu${zFrom(c)} (azami ${n2(mx(c,S))}, kazanılamaz)`:'Zorunlu'+zFrom(c))):n2(mx(c,S));
const alinan=c=>{const id=c.id;if(!filled)return ph('…');if(isZ(c,S)&&!earnableCredit(c,S))return S.z[id]?'Sağlandı':'Sağlanmadı';return n2(givenCredit(c,S))+(isZ(c,S)?(S.z[id]?' · şart ✓':' · şart ✗'):'')};
const ek=c=>S.e[c.id]||(filled?'Yok':'…');
const kids=[];

// ---- Kanıt dosyalarının ön işlenmesi (görseller ve PDF sayfaları rapora gömülür)
const FL=c=>FILES[c.id]||[];
const ext=f=>((f.name.match(/\.([^.]+)$/)||[,'dosya'])[1]).toUpperCase();
const modEk=c=>idx.indexOf(c.m)+1;
const pkgPath=(c,i,f)=>`Ekler/EK-${modEk(c)}_${D.mods[c.m]}/${evidenceNo(c,i)}_${safeName(f.name)}`;
const REN={};
for(const c of D.crit)for(const f of FL(c)){
 if(f.type.startsWith('image/')){say(`Görsel işleniyor: ${f.name}`);const im=await imageForDocx(f);REN[f.key]=im?{kind:'img',pages:[im]}:{kind:'none'}}
 else if(f.type==='application/pdf'&&window.pdfjsLib){const r=await pdfPages(f,MAX_PDF_PAGES,say);REN[f.key]=r?{kind:'pdf',pages:r.pages,total:r.total}:{kind:'none'}}
 else REN[f.key]={kind:'none'}}
say('Rapor oluşturuluyor…');
const presented=f=>{const r=REN[f.key];return r.kind==='img'?'Raporda (görsel)':r.kind==='pdf'?`Raporda (${r.pages.length}${r.total>r.pages.length?' / '+r.total:''} sayfa)`:'Ek pakette'};
const imgPara=im=>{const k=Math.min(1,620/im.w,860/im.h);return new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:60,after:60},children:[new ImageRun({type:im.type,data:im.data,transformation:{width:Math.round(im.w*k),height:Math.round(im.h*k)}})]})};
const cardFiles=c=>FL(c).length?FL(c).map((f,i)=>para(`${evidenceNo(c,i)}  ·  ${f.name}  (${ext(f)}, ${presented(f).toLowerCase()})  →  Bölüm 10, EK-${modEk(c)}`,{size:17,a:20})):[para('Kanıt belgesini (rapor, proje, sözleşme, fotoğraf, belge görüntüsü vb.) bu alana ekleyiniz. Belge adı / tarih / sayfa: …',{size:17,it:true,color:MUT,a:20})];
const CHP=CH?[para('Şekil 1. Modül bazlı ağırlıklı krediler (azami / alınan / hedef şart)',{it:true,color:MUT,size:18,b:140}),new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({type:'png',data:CH.bar,transformation:{width:600,height:260}})]}),para('Şekil 2. Modül doluluk oranları (alınan / azami kredi)',{it:true,color:MUT,size:18,b:140}),new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({type:'png',data:CH.radar,transformation:{width:380,height:360}})]})]:[];

// ---- Kapak ve içindekiler
const cover=[new Paragraph({children:[new ImageRun({type:'png',data:LOGO,transformation:{width:300,height:65}})],spacing:{after:320}}),
 new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({height:{value:4200,rule:'atLeast'},children:[cell([para('YEŞİL SERTİFİKA SİSTEMİ  ·  YeS-TR',{size:24,bold:true,color:'FFD2C2',a:200}),para(`${YY?'YERLEŞME':'BİNA'} DEĞERLENDİRME RAPORU`,{size:56,bold:true,color:'FFFFFF',a:160}),para((YY?dur:`${dur}  ·  ${tip}`),{size:30,color:'FFFFFF',a:200}),para('Kriter bazlı değerlendirme, skorlama ve kanıt dosyası',{size:22,color:'DCE6F2'})],W,{fill:NAVY})]})]}),
 gap(),gap(),
 kv([['Proje adı',info.proje||ph()],['Yapı sahibi / Kurum',info.kurum||ph()],['Hedef sertifika derecesi',G[g]],['Hazırlayan (YESU)',info.yesu||ph()],['Rapor tarihi',info.tarih||ph()],['Rapor no / Sürüm',val(K.raporNo,'YS-0000 / v1.0')]]),
 gap(),note(`Bu rapor, YeS-TR ${YY?'Yerleşme':'Bina'} Değerlendirme Kılavuzu esas alınarak hazırlanan ön değerlendirme ve kanıt dosyasıdır. Sertifika, yalnızca Değerlendirme Kuruluşunun (Türkiye Çevre Ajansı) onayı ile geçerlilik kazanır.`)];
const toc=[h1('İÇİNDEKİLER',false),new TableOfContents('İçindekiler',{hyperlink:true,headingStyleRange:'1-2'}),note('Not: İçindekiler alanı Word\'de açılışta güncellenir (gerekirse alana sağ tıklayıp "Alanı Güncelleştir").')];

// ---- 1 Yönetici özeti
const cnt={};D.crit.forEach(c=>{cnt[c.s]=cnt[c.s]||[0,0];cnt[c.s][0]++;if(S.e[c.id]==='Tamam')cnt[c.s][1]++});
const sumRows=[['Değerlendirme kapsamı',(YY?dur:`${dur} · ${tip}`)],['Hedef derece',`${G[g]} (toplam ≥ ${TH[g]} ağırlıklı kredi ve modül ${YY?'kapsam':'kredi'} şartları)`],
 ['Alınan toplam ağırlıklı kredi',filled?f2(R.total):ph('—')],['Ulaşılan derece',filled?(R.grade<0?'Derece alınamadı':G[R.grade]):ph('—')],
 ['Zorunlu kriterler',filled?(R.miss.length?`${R.miss.length} kriter eksik: ${R.miss.join(', ')}`:'Tümü sağlandı'):ph('—')],
 ['İnovasyon (toplam puana dahil değil)',filled?`${f2(R.mods[5].wc)} / ${f2(R.mods[5].max*R.mods[5].w)}`:ph('—')]];
kids.push(h1('1. YÖNETİCİ ÖZETİ'),
 para(`Bu rapor, ${info.proje||'[Proje adı]'} projesinin Yeşil Sertifika Sistemi (YeS-TR) ${YY?'Yerleşme':'Bina'} Değerlendirme Kılavuzu kapsamındaki değerlendirmesini; modül, tema ve kriter bazında skorlama sonuçlarını, zorunlu kriter kontrolünü ve kriterlere ilişkin kanıt belge durumunu içermektedir.`),
 h2('1.1 Sonuç özeti'),kv(sumRows),
 h2('1.2 Genel değerlendirme'),
 para(filled?`Proje, ${YY?'':tip.toLowerCase()+' tipolojisinde '}${dur.toLowerCase()} olarak değerlendirilmiş; toplam ağırlıklı kredi ${f2(R.total)} olarak hesaplanmıştır. ${R.grade<0?'Mevcut durumda herhangi bir sertifika derecesinin koşulları sağlanmamaktadır.':'Mevcut durumda ulaşılan derece '+G[R.grade]+' seviyesidir.'} Hedef derece (${G[g]}) bakımından eksik kalan başlıklar Bölüm 5.2\'de gösterilmiştir.`:'[Değerlendirme sonuçları tamamlandığında bu paragraf; ulaşılan derece, hedef derece ile aradaki farkın nedenlerini ve öncelikli iyileştirme alanlarını özetleyecektir.]',filled?{}:{it:true,color:MUT}),
 h2('1.3 Önemli bulgular ve öncelikli eylemler'),
 ...(SG.items.length?SG.items.slice(0,3).map(s=>para(`${s.c.c} · ${s.c.n.slice(0,90)} — ${s.why}${s.gain?` (+${f2(s.gain)} ağırlıklı kredi)`:''}`,{bul:true})):[1,2,3].map(i=>para(`[Bulgu / eylem ${i}: ilgili modül ve kriter kodu, mevcut durum, önerilen çözüm]`,{bul:true,it:true,color:MUT}))));

// ---- 2 Proje bilgileri
kids.push(h1('2. PROJE BİLGİLERİ'),
 h2('2.1 Genel bilgiler'),
 kv([['Proje adı',info.proje||ph()],['Yapı sahibi / Kurum',info.kurum||ph()],['Proje konumu (il / ilçe / ada-parsel)',val(K.konum)],[YY?'Ölçek':'Bina tipolojisi',tip],[YY?'Kategori':'Bina kategorisi',dur],['Toplam yapı inşaat alanı (m²)',val(K.alan)],['Kat adedi / kullanıcı kapasitesi',val(K.kat)],['Yapı ruhsat tarihi / no',val(K.ruhsat)],['Mimari proje müellifi',val(K.mimar)],['Yüklenici / Şantiye şefi',val(K.yuklenici)],['Hedef sertifika derecesi',G[g]]]),
 h2('2.2 Sertifikasyon paydaşları'),
 tbl([2400,2400,2400,2438],['Rol','Kurum / Kişi','Belge / Yetki no','İletişim'],[['Yeşil Sertifika Uzmanı (YESU)',val(info.yesu),val(RP.pay.yesu.no),val(RP.pay.yesu.iletisim)],['Yapı sahibi / Yetkilisi',val(info.kurum),val(RP.pay.sahip.no),val(RP.pay.sahip.iletisim)],['Değerlendirme Kuruluşu','Türkiye Çevre Ajansı','—','—'],['Değerlendirme Uzmanları (YESDU)',val(RP.pay.yesdu.kisi),val(RP.pay.yesdu.no),val(RP.pay.yesdu.iletisim)],['Proje müellifleri / Danışmanlar',val(RP.pay.muellif.kisi),val(RP.pay.muellif.no),val(RP.pay.muellif.iletisim)]]),
 h2('2.3 Proje ekibi ve sorumluluk çizelgesi'),note(YY?'Proje ekibi, görev ve sorumlulukları aşağıya işlenir.':'BBT 01 K1 kriteri kapsamında; mimar, inşaat, makine, elektrik-elektronik, çevre mühendisleri ve proje yöneticisinden oluşan ekip, görev ve sorumlulukları ile birlikte aşağıya işlenir.'),
 tbl([2800,2600,2400,1838],['Ad Soyad','Disiplin / Unvan','Görev ve sorumluluk','Oda sicil no'],RP.ekip.length?RP.ekip.map(r=>[val(r.ad,'…'),val(r.disiplin,'…'),val(r.gorev,'…'),val(r.sicil,'…')]):[...Array(4)].map(()=>[ph('…'),ph('…'),ph('…'),ph('…')])));

// ---- 3 Dayanak
kids.push(h1('3. DAYANAK, KAPSAM VE YÖNTEM'),
 h2('3.1 Mevzuat ve dayanak dokümanlar'),
 tbl([3800,5838],['Doküman','Açıklama'],[
  ['Binalar ile Yerleşmeler İçin Yeşil Sertifika Yönetmeliği','12.06.2022 tarihli ve 31864 sayılı Resmî Gazete. YeS-TR\'nin yasal çerçevesi.'],
  [`Yeşil Sertifika ${YY?'Yerleşme':'Bina'} Değerlendirme Kılavuzu`,'Modül, tema ve kriterlerin amaç, gereklilik, yöntem ve kredilendirme esasları.'],
  ['Planlı Alanlar İmar Yönetmeliği, madde 57/A','11.03.2025 tarihli ve 32838 sayılı Resmî Gazete ile eklenen hüküm; 01.01.2026 itibarıyla toplam yapı inşaat alanı 10.000 m² ve üzeri yeni kamu sağlık, eğitim, yurt ve hizmet binaları için YeS-TR sertifikası zorunludur.'],
  ['Kamu Binaları için Yeşil Sertifika Uygulama Rehberi','ÇŞİDB Mesleki Hizmetler Genel Müdürlüğü, Mart 2026. Süreç aşamaları ve kriter-kanıt ilişkisi.'],
  ['YeS-TR Puan Hesaplama v1.3 (2025)','Ön değerlendirme hesaplama aracı (v1.3: SAY 01 K1 ve SAY 01 K6 kredileri güncellendi). Bağlayıcı değildir; kılavuz ile farklılık halinde kılavuz geçerlidir.'],
  ['Binalarda Enerji Performansı Yönetmeliği ve BEP-TR','Enerji Kimlik Belgesi ve Ön Hesap Sonuç Formu esasları (EKV modülü).']]),
 h2('3.2 Kapsam'),
 para(`Rapor, ${YY?'yerleşme':'bina'} ölçeğindeki altı modülü (${D.mods.join(', ')}) kapsar. Her kriter için kredi, zorunluluk ve kanıt belge durumu ayrı ayrı izlenir.`),
 h2('3.3 Yöntem'),
 ...[YY?'Yeni/mevcut kategorisine göre kriter kredileri ve modül ağırlıkları belirlenir.':'Bina tipolojisi ve yeni/mevcut kategorisine göre kriter kredileri ve modül ağırlıkları belirlenir.','Her modül için alınan krediler modül ağırlık katsayısı ile çarpılarak ağırlıklı kredi elde edilir; inovasyon modülü toplama dahil edilmez.',`Sertifika derecesi için; tüm zorunlu kriterlerin sağlanması, toplam ağırlıklı kredinin derece aralığında olması ve her modülün derece için tanımlı ${YY?'tema kapsam':'modül kredi'} şartını karşılaması birlikte aranır.`,'Kriterlerin kredi alabilmesi için yalnızca kanıt belgesinin sunulması yetmez; kriter gerekliliklerinin de sağlanması gerekir.'].map(t=>para(t,{bul:true})),
 h2('3.4 Sorumluluk sınırları'),note('Bu doküman tavsiye ve ön değerlendirme niteliğindedir; yürürlükteki mevzuat ve kılavuzla çelişmesi halinde mevzuat geçerlidir. Nihai puanlama Değerlendirme Kuruluşu tarafından yapılır.'));

// ---- 4 Sistem
const wRows=D.mods.map((m,i)=>[m,MN[m],D.w[S.durum][i][S.tip]+'%',m==='İNO'?'—':(D.min?D.min[S.durum][i].join(' / '):'Kapsam şartı')]);
kids.push(h1('4. YeS-TR SERTİFİKA SİSTEMİ'),
 h2('4.1 Modüller ve amaçları'),
 tbl([900,2700,6038],['Kod','Modül','Amaç'],idx.map(i=>[{t:D.mods[i],bold:true,color:NAVY},MN[D.mods[i]],MA[D.mods[i]]])),
 h2('4.2 Modül ağırlıkları ve derece şartları'),
 para(`${YY?dur:tip+' · '+dur} için modül ağırlık katsayıları ve derece bazında (Geçer / İyi / Çok İyi / Ulusal Üstünlük) aranan en az ağırlıklı kredi:`),
 tbl([900,3900,1500,3338],['Kod','Modül','Ağırlık','Modül kredi şartı (G / İ / Çİ / UÜ)'],idx.map(i=>wRows[i])),
 h2('4.3 Sertifika dereceleri'),
 tbl([2600,2400,4638],['Derece','Toplam ağırlıklı kredi','Koşullar'],G.map((n,k)=>[n,k<3?`${TH[k]} ≤ kredi < ${TH[k+1]}`:`kredi ≥ ${TH[3]}`,'Tüm zorunlu kriterler + '+(D.min?'modül kredi şartları':'modül tema kapsam şartları')])),
 ...(YY?[]:[note('Örnek: Toplam ağırlıklı kredi 62,08 olan bir ofis binası, YMD modülünde "Çok İyi" için gereken 8 ağırlıklı krediyi sağlayamazsa (7,68) "İyi" derecesinde sertifikalandırılır.')]));

// ---- 5 Sonuçlar
const mrows=idx.map(i=>{const x=R.mods[i],m=D.mods[i];return [{t:m,bold:true,color:NAVY},Math.round(x.w*10000)/100+'%',filled?`${n2(x.raw)} / ${n2(x.max)}`:ph(`… / ${n2(x.max)}`),filled?f2(x.wc):ph('…'),m==='İNO'?'—':(x.min?String(x.min[g]):'Kapsam'),m==='İNO'?'—':(filled?{t:x.met[g]?'Sağlandı':'Eksik',color:x.met[g]?GRN:RED,bold:true}:ph('…'))]});
const zrows=D.crit.filter(c=>isZ(c,S)).map(c=>[c.c,c.n+(c.zg?` (${G[c.zg]} ve üstü dereceler için zorunlu)`:''),STG[c.s],filled?{t:S.z[c.id]?'Sağlandı':'Eksik',bold:true,color:S.z[c.id]?GRN:RED}:ph('…')]);
const cond=[['Toplam ağırlıklı kredi',`≥ ${TH[g]}`,filled?f2(R.total):ph('…'),filled?{t:R.total+EPS>=TH[g]?'Sağlandı':'Eksik',bold:true,color:R.total+EPS>=TH[g]?GRN:RED}:ph('…')]];
R.mods.slice(0,5).forEach(x=>cond.push([`${x.m} modül kredisi`,(x.min?`≥ ${x.min[g]}`:'Her temadan ≥1 kredi'),filled?f2(x.wc):ph('…'),filled?{t:x.met[g]?'Sağlandı':'Eksik',bold:true,color:x.met[g]?GRN:RED}:ph('…')]));
cond.push(['Zorunlu kriterler','Tümü sağlanmalı',filled?(R.miss.length?R.miss.length+' eksik':'Tamam'):ph('…'),filled?{t:R.miss.length?'Eksik':'Sağlandı',bold:true,color:R.miss.length?RED:GRN}:ph('…')]);
kids.push(h1('5. DEĞERLENDİRME SONUÇLARI'),
 h2('5.1 Modül bazlı skor tablosu'),
 tbl([1000,1300,1900,1900,1700,1838],['Modül','Ağırlık','Alınan / Maks. kredi','Ağırlıklı kredi',`${G[g]} için şart`,'Durum'],mrows),
 note('Ağırlıklı kredi = alınan kredi × modül ağırlık katsayısı. İNO modülü toplam puana dahil değildir.'),
 filled?para([run('Toplam ağırlıklı kredi (İNO hariç): ',{bold:true}),run(f2(R.total),{bold:true,color:NAVY,size:26})],{b:120}):para('Toplam ağırlıklı kredi: [hesaplanacak]',{it:true,color:MUT}),
 ...CHP,h2(`5.2 Hedef derece (${G[g]}) uygunluk analizi`),
 tbl([3200,2200,2000,2238],['Koşul','Gerekli','Mevcut','Durum'],cond),
 h2('5.3 Zorunlu kriter kontrol listesi'),
 note('Zorunlu kriterlerden biri dahi sağlanmazsa hiçbir sertifika derecesi alınamaz.'+(D.crit.some(c=>c.zg&&isZ(c,S))?' Derece belirtilen zorunlu kriterler yalnızca o derece ve üstü için aranır.':'')),
 tbl([1300,4300,2400,1638],['Kriter','Açıklama','Aşama','Durum'],zrows,{size:18}),
 h2('5.4 Güçlü yönler ve geliştirme alanları'),
 (()=>{const a=lines(RP.guclu),b=lines(RP.gelisim),n=Math.max(a.length,b.length,a.length||b.length?1:3);
  return tbl([4819,4819],['Güçlü yönler','Geliştirme alanları'],[...Array(n)].map((_,i)=>[a[i]?'• '+a[i]:(a.length||i&&b.length?'':ph('[…]')),b[i]?'• '+b[i]:(b.length||i&&a.length?'':ph('[…]'))]))})());

// ---- 6 Süreç
const srow=(i,kap,sor)=>[{t:STG[i],bold:true,color:NAVY},kap,sor,String((cnt[i]||[0])[0]),filled?`${(cnt[i]||[0,0])[1]} / ${(cnt[i]||[0])[0]}`:ph('…')];
kids.push(h1('6. SÜREÇ VE AŞAMA PLANI'),
 para('Kamu binalarında yeşil sertifikalandırma süreci beş aşamada yürütülür. Her kritere ilişkin kanıt belgenin hangi aşamada temin edilebileceği, ilgili kriter kartında belirtilmiştir.'),
 h2('6.1 Proje aşamaları'),
 tbl([2200,3000,1700,900,1838],['Aşama','Kapsam','Sorumlu','Kriter','Kanıt tamam'],[
  srow(1,'Arsa seçimi, mülkiyet, hedef derecenin belirlenmesi, ihtiyaç programı ve ön tasarım','Kamu idaresi, YESU'),
  srow(2,'Disiplinler arası ekip, teknik şartname, proje ihalesi, proje kontrollüğü, yapı ruhsatı, Ön Hesap Sonuç Formu','Kamu idaresi, müellifler, YESU'),
  srow(3,'Yapım ihale dokümanları, YESU sözleşmesi, başvuru ücreti ve başvuru dosyası hazırlığı','Kamu idaresi, YESU'),
  srow(4,'Şantiye ve yapı inşaatı, geçici kabul, YeS-TR başvurusu, değerlendirme ve onay, yapı kullanma izin belgesi','Yüklenici, YESU, Değ. Kuruluşu'),
  [{t:'5. İşletme',bold:true,color:NAVY},'Devreye alma, sistemlerin doğrulanması, işletme-bakım izleme, performans verisinin izlenmesi','İşletme birimi','—','—']]),
 h2('6.2 YeS-TR başvuru ve onay akışı'),
 tbl([2200,7438],['Evre','Adımlar'],[
  [{t:'Sözleşme ve kayıt',bold:true,color:NAVY},'Yapı sahibi YESU ve Türkiye Çevre Ajansı ile sözleşme imzalar; YESU sözleşme ve proje bilgilerini sisteme yükler; proje başvurusu onaylanır, YeS-TR kaydı yapılır.'],
  [{t:'Veri giriş / kontrol',bold:true,color:NAVY},'YESU, modül kriterlerine ait kanıt belgelerini YeS-TR\'ye yükler; modüller ilgili YESDU\'lara havale edilir; YESDU kanıtları inceleyip puanlar; taslak sertifika YESU ile paylaşılır, itiraz varsa süreç tekrarlanır.'],
  [{t:'Sertifika düzenleme',bold:true,color:NAVY},'Sertifika onaylanır, YESDU imzaları alınır, Çevre Ajansı imzalayarak yapı sahibine gönderir; sertifika YeS-TR veri tabanına otomatik kaydedilir.']]),
 h2('6.3 Başvuru takip çizelgesi'),
 tbl([3600,2000,2000,2038],['Adım','Planlanan tarih','Gerçekleşen','Not'],TAKIP_ADIMLAR.map((a,i)=>{const t=RP.takip[i];return [a,hv(t.plan)?trd(t.plan):ph('…'),hv(t.gercek)?trd(t.gercek):ph('…'),val(t.not,'…')]})));

// ---- 7 Kriter kartları
kids.push(h1('7. KRİTER BAZLI DETAYLI DEĞERLENDİRME'),
 para('Bu bölümde her kriter için; ilgili aşama, alınabilir ve alınan kredi, kriter gerekliliği, proje çözümü ve kanıt ekleme alanı yer almaktadır. Kanıt belgeleri ilgili kriter kartındaki alana, uzun belgeler ise Bölüm 10\'daki ek numarası ile eklenir.'));
let sec=0;
idx.forEach(i=>{const m=D.mods[i];sec++;
 kids.push(h2(`7.${sec} ${m} · ${MN[m]}`),para(MA[m],{it:true,color:MUT}));
 let th='';
 crit(i).forEach(c=>{if(c.t!==th){th=c.t;kids.push(h3(th))}
  kids.push(new Table({width:{size:W,type:WidthType.DXA},columnWidths:[2300,2300,2300,2738],rows:[
   new TableRow({cantSplit:true,children:[cell(`${c.c}${c.g?' (Seçenek '+c.id.slice(-1)+')':''} · ${c.n}`,W,{span:4,fill:NAVY,color:'FFFFFF',bold:true,size:19})]}),
   new TableRow({cantSplit:true,children:['Proje aşaması','Alınabilir kredi','Alınan kredi','Kanıt durumu'].map((t,j)=>cell(t,[2300,2300,2300,2738][j],{fill:LIGHT,bold:true,color:NAVY,size:17}))}),
   new TableRow({cantSplit:true,children:[STG[c.s],cap(c),alinan(c),ek(c)].map((t,j)=>cell(t,[2300,2300,2300,2738][j],{size:19}))}),
   new TableRow({children:[cell([para('Gereklilik',{size:17,bold:true,color:NAVY,a:20}),...(c.r||'Kılavuzdaki kriter gerekliliğine bakınız.').split('\n').map(l=>para(l,{size:18,a:20}))],W,{span:4})]}),
   new TableRow({children:[cell([para('Proje çözümü / uygulama gerekçesi',{size:17,bold:true,color:NAVY,a:20}),para(S.n[c.id]||'[Kriterin projede nasıl karşılandığını, hesap ve kabulleri kısaca açıklayınız.]',{size:18,it:!S.n[c.id],color:S.n[c.id]?undefined:MUT,a:20})],W,{span:4})]}),
   new TableRow({height:{value:1500,rule:'atLeast'},children:[cell([para(FL(c).length?`KANIT BELGELERİ  ·  ${FL(c).length} dosya`:`KANIT EKLEME ALANI  ·  ${eAd(c)}`,{size:17,bold:true,color:BLUE,a:40}),...cardFiles(c)],W,{span:4,dash:true,fill:'F7FAFE'})]})]}),gap())})});

// ---- 8 Kanıt dizini
kids.push(h1('8. KANIT BELGE DİZİNİ'),para('Aşağıdaki dizin, kriter bazında sunulacak kanıt belgelerinin izlenmesi için kullanılır. Ek numaraları Bölüm 10\'daki ek sayfalarıyla eşleşir.'));
const shortN=c=>c.c+' '+(c.n.length>70?c.n.slice(0,68)+'…':c.n);
idx.forEach(i=>{kids.push(h3(`${D.mods[i]} · ${MN[D.mods[i]]}`),tbl([1700,3200,1900,1100,1738],['Ek no','Kriter','Belge adı','Tarih','Durum'],crit(i).flatMap(c=>FL(c).length?FL(c).map((f,j)=>[evidenceNo(c,j),shortN(c),f.name,f.date||'—',ek(c)]):[[eAd(c),shortN(c),ph('…'),ph('…'),ek(c)]]),{size:17}))});

// ---- 9 Sonuç ve eylem planı
kids.push(h1('9. SONUÇ VE EYLEM PLANI'),
 h2('9.1 Sonuç'),para(filled?`${R.grade<0?'Proje, mevcut durumda hiçbir derece koşulunu sağlamamaktadır.':'Proje, mevcut durumda '+G[R.grade]+' derecesi için gereken koşulları sağlamaktadır.'} Hedef derece ${G[g]} olup ${R.ok[g]?'tüm koşullar bakımından uygun görünmektedir.':'ulaşılması için Bölüm 5.2\'deki eksiklerin giderilmesi gerekmektedir.'}`:'[Değerlendirme tamamlandığında sonuç paragrafı yazılır.]',filled?{}:{it:true,color:MUT}),
 h2('9.2 Eylem planı'),
 tbl([1100,3300,1700,1700,1838],['No','Eylem','Sorumlu','Termin','Kriter'],RP.eylem.length
  ?RP.eylem.map((r,i)=>[String(i+1),val(r.eylem,'…'),val(r.sorumlu,'…'),hv(r.termin)?trd(r.termin):ph('…'),val(r.kriter,'…')])
  :[...Array(8)].map((_,i)=>{const s=SG.items[i];return [String(i+1),s?`${s.c.n.slice(0,80)} (${s.why}${s.gain?`, +${f2(s.gain)} kredi`:''})`:ph('…'),ph('…'),ph('…'),s?s.c.c:ph('…')]})),
 h2('9.3 Onay'),
 tbl([3212,3213,3213],['Hazırlayan (YESU)','Kontrol eden','Onaylayan (Yapı sahibi / Yetkili)'],[['hazirlayan','kontrol','onaylayan'].map(k=>para('Ad Soyad: '+(hv(RP.onay[k])?RP.onay[k].trim():'…'),{size:18})),['hazirlayan','kontrol','onaylayan'].map(k=>para('Tarih: '+(hv(RP.onay[k+'T'])?trd(RP.onay[k+'T']):'…'),{size:18})),[{t:'İmza',it:true,color:MUT},{t:'İmza',it:true,color:MUT},{t:'İmza',it:true,color:MUT}]],{zebra:false}));

// ---- 10 Ekler
kids.push(h1('10. EKLER · KANIT BELGELERİ'),para('Kanıt belgeleri modül sırasıyla ve ek numaralarıyla aşağıda sunulmuştur. Görseller ve PDF belgelerinin sayfaları rapora eklenmiştir; rapora gömülemeyen belge türleri (Word, Excel, DWG vb.) ile tüm orijinal dosyalar, rapor ile birlikte teslim edilen ek paketinde (.zip) aynı ek numaralarıyla yer alır.'));
idx.forEach((i,k)=>{const withF=crit(i).filter(c=>FL(c).length);
 kids.push(h2(`EK-${k+1}  ${D.mods[i]} Modülü Kanıt Belgeleri`));
 if(!withF.length){kids.push(new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({height:{value:1400,rule:'atLeast'},children:[cell([para(`${D.mods[i]} MODÜLÜ EK BELGELERİ`,{size:18,bold:true,color:BLUE,a:40}),para('Bu modül için henüz kanıt dosyası yüklenmemiştir.',{size:17,it:true,color:MUT})],W,{dash:true,fill:'F7FAFE'})]})]}),gap());return}
 kids.push(tbl([1900,1500,4200,2038],['Ek no','Kriter','Belge','Sunum'],withF.flatMap(c=>FL(c).map((f,j)=>[evidenceNo(c,j),c.c,f.name,presented(f)])),{size:17}));
 withF.forEach(c=>FL(c).forEach((f,j)=>{const r=REN[f.key];
  kids.push(h3(`${evidenceNo(c,j)}  ·  ${f.name}`,true),
   note(`${c.c} · ${c.n}`),
   para(`Tür: ${ext(f)}  ·  Boyut: ${(f.size/1048576).toFixed(2).replace('.',',')} MB  ·  Yükleme tarihi: ${f.date||'—'}`,{size:17,color:MUT}));
  if(r.kind==='none')kids.push(note(`Bu belge türü Word raporuna gömülemediğinden ek paketinde "${pkgPath(c,j,f)}" adıyla sunulmuştur.`));
  else{r.pages.forEach(pg=>kids.push(imgPara(pg)));
   if(r.kind==='pdf'&&r.total>r.pages.length)kids.push(note(`Belgenin ilk ${r.pages.length} sayfası rapora eklenmiştir; tamamı (${r.total} sayfa) ek paketinde "${pkgPath(c,j,f)}" adıyla yer alır.`))}}))});

const titleTxt=`YeS-TR ${YY?'Yerleşme':'Bina'} Değerlendirme Raporu`;
const hdr=new Header({children:[new Paragraph({tabStops:[{type:TabStopType.RIGHT,position:W}],border:{bottom:{style:BorderStyle.SINGLE,size:8,color:BLUE,space:4}},children:[new ImageRun({type:'png',data:LOGO,transformation:{width:110,height:24}}),new TextRun({children:[new Tab(),`${titleTxt}  ·  ${info.proje||'[Proje adı]'}`],font:'Calibri',size:17,color:MUT})]})]});
const ftr=new Footer({children:[new Paragraph({tabStops:[{type:TabStopType.RIGHT,position:W}],children:[run('Novera Research & Consultancy  ·  Ön değerlendirme ve kanıt dosyası – bağlayıcı değildir',{size:16,color:MUT}),new TextRun({children:[new Tab(),'Sayfa ',PageNumber.CURRENT,' / ',PageNumber.TOTAL_PAGES],font:'Calibri',size:16,color:MUT})]})]});
const pg={page:{size:{width:11906,height:16838},margin:{top:1300,bottom:1200,left:1134,right:1134}}};
const doc=new Document({creator:'Novera Research & Consultancy',title:titleTxt,features:{updateFields:true},
 styles:{default:{document:{run:{font:'Calibri',size:21}}}},
 numbering:{config:[{reference:'bul',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:270}}}}]}]},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children:cover},{properties:pg,headers:{default:hdr},footers:{default:ftr},children:[...toc,...kids]}]});

return Packer.toBlob(doc);
}
