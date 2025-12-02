document.addEventListener('DOMContentLoaded', ()=>{
  const modeItems = Array.from(document.querySelectorAll('.mode-item'));
  const cards = Array.from(document.querySelectorAll('.card'));
  let mode = 'volume'; // default mode

  // Mode toggle handlers
  modeItems.forEach(mi=>{
    mi.addEventListener('click', ()=>{
      modeItems.forEach(m=>m.classList.remove('active'));
      mi.classList.add('active');
      mode = mi.dataset.mode || 'volume';
    });
  });

  // Calculation handlers
  document.querySelectorAll('.calc-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const card = btn.closest('.card');
      const shape = card.dataset.shape;
      const inputs = Array.from(card.querySelectorAll('.input'));
      const vals = {};
      inputs.forEach(inp=>{
        const raw = inp.value;
        if(raw === undefined || raw === null || String(raw).trim() === '') {
          vals[inp.name] = undefined;
        } else {
          vals[inp.name] = parseFloat(raw);
        }
      });

      const resEl = card.querySelector('.result');
      resEl.innerHTML = '';

      // reject explicit negative inputs
      const invalidNegative = Object.values(vals).some(v=>typeof v === 'number' && v < 0);
      if(invalidNegative){ resEl.innerHTML = '<strong style="color:#ffb4b4">Enter valid non-negative numbers.</strong>'; return; }

      const fmt = (n)=>Number.isFinite(n)? n.toFixed(3) : '—';

      let volume = NaN, area = NaN;
      switch(shape){
        case 'cube':{
          const s = vals.s||0; volume = Math.pow(s,3); area = 6*Math.pow(s,2); break;
        }
        case 'sphere':{
          const r = vals.r||0; volume = (4/3)*Math.PI*Math.pow(r,3); area = 4*Math.PI*Math.pow(r,2); break;
        }
        case 'cylinder':{
          const r = vals.r||0, h = vals.h||0; volume = Math.PI*Math.pow(r,2)*h; area = 2*Math.PI*r*(r+h); break;
        }
        case 'cone':{
          const r = vals.r||0, h = vals.h||0; volume = (1/3)*Math.PI*Math.pow(r,2)*h; const l = Math.sqrt(r*r + h*h); area = Math.PI*r*(r + l); break;
        }
        case 'rectprism':{
          const l = vals.l||0, w = vals.w||0, h = vals.h||0; volume = l*w*h; area = 2*(l*w + l*h + w*h); break;
        }
        case 'pyramid':{
          // Square pyramid: base side a, height h
          const a = vals.a||0, ph = vals.h||0; volume = (1/3)*Math.pow(a,2)*ph;
          // Surface area = base + 4 * triangle area. slant height s = sqrt((a/2)^2 + h^2)
          const sl = Math.sqrt(Math.pow(a/2,2) + Math.pow(ph,2));
          area = Math.pow(a,2) + 2*a*sl; // base + 4*(1/2*a*sl)
          break;
        }
        case 'triangularprism':{
          // Equilateral triangle base side a, prism length L
          const a = vals.a||0, L = vals.L||0;
          const triArea = (Math.sqrt(3)/4)*Math.pow(a,2);
          volume = triArea * L;
          // Surface area = 2*base + perimeter*L
          const peri = 3*a;
          area = 2*triArea + peri*L;
          break;
        }
        case 'torus':{
          // Torus: major R, minor r
          const R = vals.R||0, r = vals.r||0;
          volume = (2*Math.PI*Math.PI) * R * Math.pow(r,2); // 2*pi^2 * R * r^2
          area = (4*Math.PI*Math.PI) * R * r; // 4*pi^2 * R * r
          break;
        }
        case 'ellipsoid':{
          // Ellipsoid axes a,b,c
          const a = vals.a||0, b = vals.b||0, c = vals.c||0;
          volume = (4/3)*Math.PI*a*b*c;
          // Approximate surface area using Knud Thomsen's formula
          const p = 1.6075;
          area = 4*Math.PI * Math.pow((Math.pow(a*p, p) + Math.pow(b*p, p) + Math.pow(c*p, p))/3, 1/p);
          break;
        }
        case 'hexprism':{
          // Regular hexagon base side a, prism length L
          const a = vals.a||0, L = vals.L||0;
          // base area = (3*sqrt(3)/2) * a^2
          const baseArea = (3*Math.sqrt(3)/2) * Math.pow(a,2);
          volume = baseArea * L;
          // perimeter = 6a -> surface area = 2*base + perimeter*L
          area = 2*baseArea + 6*a*L;
          break;
        }
        default: break;
      }

      if(mode === 'volume'){
        if(!Number.isFinite(volume)) return resEl.innerHTML = '<em>Unable to compute volume with given inputs.</em>';
        resEl.innerHTML = `<div><strong>Volume:</strong> ${fmt(volume)} units³</div>`;
        return;
      }

      if(mode === 'surface'){
        if(!Number.isFinite(area)) return resEl.innerHTML = '<em>Unable to compute surface area with given inputs.</em>';
        resEl.innerHTML = `<div><strong>Surface area:</strong> ${fmt(area)} units²</div>`;
        return;
      }

      // fallback: show both
      if(!Number.isFinite(volume) || !Number.isFinite(area)){
        resEl.innerHTML = '<em>Unable to compute with given inputs.</em>';
        return;
      }

      resEl.innerHTML = `
        <div><strong>Volume:</strong> ${fmt(volume)} units³</div>
        <div><strong>Surface area:</strong> ${fmt(area)} units²</div>
      `;
    });
  });

});
