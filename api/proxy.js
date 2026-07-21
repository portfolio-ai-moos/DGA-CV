const ORIGIN = 'https://moos-dga-cv.moosvoorjou.chatgpt.site';

const EXPERIENCE = `<article><span>Augustus 2024 — nu</span><h3>Freelance AI &amp; Web Specialist</h3><p>Ontwikkeling van AI-webapps, websites en geautomatiseerde workflows.</p></article><article><span>2020 — 2024</span><h3>Founder</h3><p>Eigen bedrijf gericht op webontwikkeling en online marketing voor verschillende klanten.</p></article><article><span>Eerder</span><h3>ICT-beheerder</h3><p>Verantwoordelijk voor het ICT-beheer van een grote kinderopvangorganisatie met ongeveer 50 vestigingen.</p></article><article><span>Ervaring</span><h3>Presentator &amp; Eventmanager</h3><p>Werkzaam geweest voor verschillende organisaties, zowel in loondienst als freelance.</p></article><article><span>Sinds mijn twaalfde</span><h3>Horeca-achtergrond</h3><p>Opgegroeid in een horecafamilie en sinds mijn twaalfde actief in de horeca, in uiteenlopende operationele en leidinggevende rollen.</p></article>`;

const INJECT = `<style>
.portrait>span{overflow:hidden!important;padding:0!important;line-height:0!important}
.portrait>span>img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 28%!important;border-radius:inherit!important}
</style><script>(function(){
const experience=${JSON.stringify(EXPERIENCE)};
function apply(){
  const portrait=document.querySelector('.portrait>span');
  if(portrait && !portrait.querySelector('img')){
    portrait.textContent='';
    const img=document.createElement('img');
    img.src='/profile.jpg';
    img.alt='Moos Poelmans';
    portrait.appendChild(img);
  }
  const timeline=document.querySelector('#ervaring .timeline');
  if(timeline && timeline.dataset.moosExperience!=='1'){
    timeline.innerHTML=experience;
    timeline.dataset.moosExperience='1';
  }
}
function start(){
  apply();
  let count=0;
  const timer=setInterval(()=>{apply(); if(++count>120) clearInterval(timer)},100);
  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(()=>{observer.disconnect();apply()},20000);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();<\/script>`;

export default async function handler(req, res) {
  try {
    const path = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path || '');
    const url = new URL(path ? `${ORIGIN}/${path.replace(/^\/+/, '')}` : `${ORIGIN}/`);
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === 'path' || value === undefined) continue;
      if (Array.isArray(value)) value.forEach(v => url.searchParams.append(key, String(v)));
      else url.searchParams.set(key, String(value));
    }

    const response = await fetch(url, {
      method: req.method || 'GET',
      headers: {
        'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
        accept: req.headers.accept || '*/*',
        'accept-language': req.headers['accept-language'] || 'nl-NL,nl;q=0.9,en;q=0.8'
      },
      redirect: 'follow'
    });

    const type = response.headers.get('content-type') || 'application/octet-stream';
    if (type.includes('text/html')) {
      let html = await response.text();
      html = html.replace(/<div class="timeline">[\s\S]*?<\/div><div class="skill-grid">/, `<div class="timeline">${EXPERIENCE}</div><div class="skill-grid">`);
      html = html.includes('</head>') ? html.replace('</head>', `${INJECT}</head>`) : `${INJECT}${html}`;
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.setHeader('cache-control', 'no-store, max-age=0');
      return res.status(response.status).send(html);
    }

    const data = Buffer.from(await response.arrayBuffer());
    res.setHeader('content-type', type);
    return res.status(response.status).send(data);
  } catch (error) {
    return res.status(500).send(`CV kon niet worden geladen: ${error.message}`);
  }
}
