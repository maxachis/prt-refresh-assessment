"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function v(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function m(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function M(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function P(e){return e>0?`+${e}`:String(e)}function J(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var le="#4aa3ff",de="#ffa23a";function pe(e,t,n,o=96){let r=[],a=n/111320,l=n/(111320*Math.cos(e*Math.PI/180));for(let c=0;c<=o;c++){let s=c/o*2*Math.PI;r.push([t+l*Math.cos(s),e+a*Math.sin(s)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function y(e){return{type:"FeatureCollection",features:e}}function Y(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function G(e){e.addSource("walk",{type:"geojson",data:y([])}),e.addSource("stops-now",{type:"geojson",data:y([])}),e.addSource("stops-prop",{type:"geojson",data:y([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":de,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":le,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let r=o.features?.[0];if(!r)return;let a=r.properties;t.setLngLat(o.lngLat).setHTML(`<b>${a.name}</b><br>${a.side==="current"?"today":"proposed"}
                  \xB7 stop ${a.stop_id} \xB7 ${a.metres} m`).addTo(e)})}function I(e,t,n,o,r,a){e.getSource("walk").setData(y([pe(t,n,o)])),e.getSource("stops-now").setData(y(Y(r,"current"))),e.getSource("stops-prop").setData(y(Y(a,"proposed")))}var f=["weekday","saturday","sunday"],E=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],W={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},q=e=>3+3*e,U=e=>4+3*e,L=e=>5+3*e;var R=null,h="weekday";function p(){return h}function V(e,t=!0){h=e,t&&R&&C(R)}function Z(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>Every dot is a location, coloured by what the Proposed Final Network
         does to the buses within a short walk of it. Pan and zoom to read a
         neighbourhood; the legend counts what is on screen.</p>
      <p>Click a dot \u2014 or anywhere on the map \u2014 for the full before-and-after.</p>
      <p class="muted">Both networks are measured inside the same circle, so
         renumbered routes and consolidated stops don't distort the comparison.
         Switch day type in the toolbar: some places keep every weekday bus and
         lose the weekend entirely.</p>
    </div>`}function ue(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function me(e,t){let n=Math.max(1,...E.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return E.map(o=>{let r=e.periods[o]??0,a=t.periods[o]??0,l=a-r,c=l>0?"up":l<0?"down":"flat";return`
      <tr>
        <th>${W[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${a/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${a}</td>
        <td class="n ${c}">${l===0?"\xB7":P(l)}</td>
      </tr>`}).join("")}function K(e){return e.length?e.map(t=>`<span class="route">${m(t)}</span>`).join(" "):'<span class="muted">none</span>'}function X(e){return e.first==null?'<span class="muted">no service</span>':`${M(e.first)} \u2013 ${M(e.last)}`}function Q(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}function C(e){R=e;let t=document.getElementById("panel"),n=e.current.days[h],o=e.proposed.days[h],r=o.trips-n.trips,a=r>0?"up":r<0?"down":"flat",l=e.place?.hood||e.place?.muni||"this location",c=Q(n),s=Q(o);t.innerHTML=`
    <div class="place-head">
      <h2>${m(l)}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>

    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${n.trips}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${o.trips}</div>
      </div>
      <div class="hl-delta ${a}">
        ${r===0?"no change":`${P(r)} trips`}
        <div class="muted">${J(n.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${h==="weekday"?"weekday":h}, both directions</div>

    <div class="tiers">${ue(n.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${me(n,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${X(n)} <span class="muted">\u2192</span> ${X(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${c==null?"\u2014":`${c} min`} <span class="muted">\u2192</span> ${s==null?"\u2014":`${s} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${K(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${K(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var S={gone:{color:"#ff3b47",size:6},halved:{color:"#ff8f6e",size:4.5},less:{color:"#a8756c",size:3},same:{color:"#59606e",size:2.5},more:{color:"#6aa387",size:3},doubled:{color:"#35d98a",size:4.5},new:{color:"#4ec3ff",size:6},none:{color:"#3a3f4a",size:2}},T="change",x="change-dots",k=null,g=new Set;function O(){return k}function B(e){return g.has(e)}function ee(e,t,n,o,r,a,l){let c={};for(let s of n)c[s]=0;for(let s of e){let u=s[0],j=s[1];if(u<r||u>l||j<o||j>a)continue;let A=n[s[L(t)]];A!==void 0&&c[A]++}return c}function ye(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>f.some((o,r)=>t[n[L(r)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(f.flatMap((o,r)=>[[`b${r}`,t[n[L(r)]]],[`c${r}`,n[q(r)]],[`p${r}`,n[U(r)]]]))}}))}}function w(e,t){let n=Object.entries(S).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,S.none[t]]}function te(e){return["interpolate",["linear"],["zoom"],9,["*",w(e,"size"),.45],12,w(e,"size"),16,["*",w(e,"size"),1.9]]}function ne(e){e.addSource(T,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:x,type:"circle",source:T,paint:{"circle-color":w(0,"color"),"circle-radius":te(0),"circle-opacity":.85,"circle-stroke-width":.5,"circle-stroke-color":"rgba(10,12,16,.65)"}},"walk-fill")}async function F(e,t,n){return k=await v(`/api/change?radius=${t}`),e.getSource(T).setData(ye(k)),H(e,n),k}function H(e,t){let n=f.indexOf(t);e.setPaintProperty(x,"circle-color",w(n,"color")),e.setPaintProperty(x,"circle-radius",te(n)),z(e,t)}function oe(e,t,n){g.has(t)?g.delete(t):g.add(t),z(e,n)}function re(e,t){g.clear(),z(e,t)}function z(e,t){let n=f.indexOf(t),o=["none",...g];e.setFilter(x,["!",["in",["get",`b${n}`],["literal",o]]])}function se(e,t,n){let o=f.indexOf(t),r=e[`b${o}`],a=n.find(u=>u.key===r)?.label??r,l=e[`c${o}`],c=e[`p${o}`];return`<b>${a}</b><br>${l} \u2192 ${c} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var fe={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function he(e){return e.buckets.filter(t=>t.key!=="none")}function ae(e,t,n,o){let r=t.buckets.map(s=>s.key),a=ee(t.points,t.days.indexOf(n),r,o.west,o.south,o.east,o.north),l=he(t),c=l.reduce((s,u)=>s+a[u.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${c.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${fe[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${l.map(s=>`
      <button class="lg-row ${B(s.key)?"off":""}" data-bucket="${m(s.key)}"
              aria-pressed="${!B(s.key)}">
        <i style="background:${S[s.key]?.color??"#666"}"></i>
        <span class="lg-lab">${m(s.label)}</span>
        <span class="lg-n">${a[s.key].toLocaleString()}</span>
      </button>`).join("")}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var ge=[-79.9959,40.4406],$=400,N=null,_=null,D=0,i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ge,zoom:12});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{G(i),ne(i),Z(d("panel")),i.on("click",t=>{let n=i.queryRenderedFeatures(t.point,{layers:["change-dots"]})[0],o=n?n.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];ce(o[1],o[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=O();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(se(n.properties,p(),o.buckets)).addTo(i)}),i.on("moveend",b),ie("[data-radius]",t=>{$=Number(t.dataset.radius),F(i,$,p()).then(b),_&&ce(_.lat,_.lon)}),ie("[data-day]",t=>{let n=t.dataset.day;V(n),H(i,n),b()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(oe(i,n.dataset.bucket,p()),b())}),d("legend-reset").addEventListener("click",()=>{re(i,p()),b()}),F(i,$,p()).then(b),be()});function ie(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n)})})}function b(){let e=O();if(!e)return;let t=i.getBounds();ae(d("legend"),e,p(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()})}async function ce(e,t){let n=++D;_={lat:e,lon:t},d("panel").classList.add("loading"),N?N.setLngLat([t,e]):N=new maplibregl.Marker({color:"#e2574c"}).setLngLat([t,e]).addTo(i);try{let o=await v(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${$}`);if(n!==D)return;I(i,e,t,$,o.current.stops,o.proposed.stops),C(o)}catch(o){if(n!==D)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===D&&d("panel").classList.remove("loading")}}async function be(){try{let e=await v("/api/meta");d("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,d("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
