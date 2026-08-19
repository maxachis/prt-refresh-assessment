"use strict";(()=>{function u(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function g(e){let t=await fetch(e);if(!t.ok){let r=t.statusText;try{r=(await t.json()).detail??r}catch{}throw new Error(r)}return t.json()}function h(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function K(e){if(e==null)return"\u2014";let t=e%1440,r=Math.floor(t/60),n=Math.round(t%60),o=r<12?"am":"pm";return`${r%12===0?12:r%12}:${String(n).padStart(2,"0")}${o}`}function G(e){return e>0?`+${e}`:String(e)}function ue(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var We="#4aa3ff",Ie="#ffa23a";function qe(e,t,r,n=96){let o=[],a=r/111320,l=r/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=n;s++){let c=s/n*2*Math.PI;o.push([t+l*Math.cos(c),e+a*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function w(e){return{type:"FeatureCollection",features:e}}function pe(e,t){return e.map(r=>({type:"Feature",geometry:{type:"Point",coordinates:[r.lon,r.lat]},properties:{...r,side:t}}))}function me(e){e.addSource("walk",{type:"geojson",data:w([])}),e.addSource("stops-now",{type:"geojson",data:w([])}),e.addSource("stops-prop",{type:"geojson",data:w([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Ie,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":We,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let r of["stops-now-c","stops-prop-c"])e.on("mouseenter",r,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",r,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",r,n=>{let o=n.features?.[0];if(!o)return;let a=o.properties;t.setLngLat(n.lngLat).setHTML(`<b>${a.name}</b><br>${a.side==="current"?"today":"proposed"}
                  \xB7 stop ${a.stop_id} \xB7 ${a.metres} m`).addTo(e)})}function ye(e,t,r,n,o,a){e.getSource("walk").setData(w([qe(t,r,n)])),e.getSource("stops-now").setData(w(pe(o,"current"))),e.getSource("stops-prop").setData(w(pe(a,"proposed")))}var p=["weekday","saturday","sunday"],J=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],fe={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ge=e=>3+3*e,be=e=>4+3*e,O=e=>5+3*e;var Y=e=>2+2*e,V=e=>3+2*e;var W=null,L="weekday";function y(){return L}function Le(e,t=!0){L=e,t&&W&&I(W)}function ke(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of three ways depending on
         the view above. Pan and zoom to read a neighbourhood.</p>
      <p><b>Locations</b> draws one dot per place a bus stops today, coloured
         by what the plan does to the buses within a short walk.
         <b>Surface</b> measures that same walk-access comparison at every
         point on a 100 m grid, so it can also show ground the plan adds a bus
         to \u2014 but it is extent, not people: a hillside counts like a city
         block.</p>
      <p><b>Streets</b> takes no walk radius at all: it colours the street
         itself by whether any bus runs on it today, under the plan, or both.
         Route numbers never enter that call \u2014 a street is served or it isn't,
         regardless of which route does the serving on either side. A place
         can keep full walk access while a specific street loses its only bus,
         if a parallel block a minute's walk away picks up the trip instead:
         real loss of pavement, possibly no loss of access.</p>
      <p>Click anywhere on the map for the full before-and-after.</p>
      <p class="muted">Both networks are measured inside the same circle, so
         renumbered routes and consolidated stops don't distort the comparison.
         Switch day type in the toolbar: some places keep every weekday bus and
         lose the weekend entirely.</p>
    </div>`}function Ue(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Xe(e,t){let r=Math.max(1,...J.map(n=>Math.max(e.periods[n]??0,t.periods[n]??0)));return J.map(n=>{let o=e.periods[n]??0,a=t.periods[n]??0,l=a-o,s=l>0?"up":l<0?"down":"flat";return`
      <tr>
        <th>${fe[n]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/r*100}%"></span>
          <span class="b-prop" style="width:${a/r*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${a}</td>
        <td class="n ${s}">${l===0?"\xB7":G(l)}</td>
      </tr>`}).join("")}function he(e){return e.length?e.map(t=>`<span class="route">${h(t)}</span>`).join(" "):'<span class="muted">none</span>'}function ve(e){return e.first==null?'<span class="muted">no service</span>':`${K(e.first)} \u2013 ${K(e.last)}`}function we(e){let t=Object.values(e.headways).map(r=>r.median).filter(r=>r!=null);return t.length?Math.min(...t):null}function I(e){W=e;let t=document.getElementById("panel"),r=e.current.days[L],n=e.proposed.days[L],o=n.trips-r.trips,a=o>0?"up":o<0?"down":"flat",l=e.place?.hood||e.place?.muni||"this location",s=we(r),c=we(n);t.innerHTML=`
    <div class="place-head">
      <h2>${h(l)}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>

    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${r.trips}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${n.trips}</div>
      </div>
      <div class="hl-delta ${a}">
        ${o===0?"no change":`${G(o)} trips`}
        <div class="muted">${ue(r.trips,n.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${L==="weekday"?"weekday":L}, both directions</div>

    <div class="tiers">${Ue(r.hourly,n.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Xe(r,n)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${ve(r)} <span class="muted">\u2192</span> ${ve(n)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${c==null?"\u2014":`${c} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${he(r.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${he(n.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var P={gone:{color:"#ff3b47",size:6},halved:{color:"#ff8f6e",size:4.5},less:{color:"#a8756c",size:3},same:{color:"#59606e",size:2.5},more:{color:"#6aa387",size:3},doubled:{color:"#35d98a",size:4.5},new:{color:"#4ec3ff",size:6},none:{color:"#3a3f4a",size:2}},q="change",E="change-dots",M=null,k=new Set;function U(){return M}function X(e){return k.has(e)}function Se(e,t,r,n,o,a,l){let s={};for(let c of r)s[c]=0;for(let c of e){let d=c[0],b=c[1];if(d<o||d>l||b<n||b>a)continue;let m=r[c[O(t)]];m!==void 0&&s[m]++}return s}function Qe(e){let t=e.buckets.map(r=>r.key);return{type:"FeatureCollection",features:e.points.filter(r=>p.some((n,o)=>t[r[O(o)]]!=="none")).map(r=>({type:"Feature",geometry:{type:"Point",coordinates:[r[1],r[0]]},properties:{published:r[2],...Object.fromEntries(p.flatMap((n,o)=>[[`b${o}`,t[r[O(o)]]],[`c${o}`,r[ge(o)]],[`p${o}`,r[be(o)]]]))}}))}}function C(e,t){let r=Object.entries(P).flatMap(([n,o])=>[n,o[t]]);return["match",["get",`b${e}`],...r,P.none[t]]}function $e(e){return["interpolate",["linear"],["zoom"],9,["*",C(e,"size"),.45],12,C(e,"size"),16,["*",C(e,"size"),1.9]]}function xe(e){e.addSource(q,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:E,type:"circle",source:q,paint:{"circle-color":C(0,"color"),"circle-radius":$e(0),"circle-opacity":.85,"circle-stroke-width":.5,"circle-stroke-color":"rgba(10,12,16,.65)"}},"walk-fill")}async function Q(e,t,r){return M=await g(`/api/change?radius=${t}`),e.getSource(q).setData(Qe(M)),Z(e,r),M}function Z(e,t){let r=p.indexOf(t);e.setPaintProperty(E,"circle-color",C(r,"color")),e.setPaintProperty(E,"circle-radius",$e(r)),ee(e,t)}function Ce(e,t,r){k.has(t)?k.delete(t):k.add(t),ee(e,r)}function De(e,t){k.clear(),ee(e,t)}function ee(e,t){let r=p.indexOf(t),n=["none",...k];e.setFilter(E,["!",["in",["get",`b${r}`],["literal",n]]])}function Re(e,t,r){let n=p.indexOf(t),o=e[`b${n}`],a=r.find(d=>d.key===o)?.label??o,l=e[`c${n}`],s=e[`p${n}`];return`<b>${a}</b><br>${l} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var te="surface",F="surface-fill",re=[[-2,"#c9142a"],[-1,"#ff8f6e"],[-.138,"#59606e"],[.138,"#59606e"],[1,"#35d98a"],[2,"#0f9c5c"]],D="#ff3b47",R="#4ec3ff",_e=2,T=null,Oe=!1;function A(){return T}function Me(){return Oe}function Pe(e,t){if(e<=0||t<=0)return null;let r=Math.log2(t/e);return Math.max(-_e,Math.min(_e,r))}function Ee(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Te(e,t,r,n,o,a,l,s){let c={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let b=l.lat0+(d[1]+.5)*l.dlat,m=l.lon0+(d[0]+.5)*l.dlon;if(b<n||b>a||m<r||m>o)continue;let $=d[Y(t)],x=d[V(t)],j=Ee($,x);if(j!=="none")if(j==="ramp"){let de=Pe($,x);c[de<-.138?"less":de>.138?"more":"same"]+=s}else c[j]+=s}return c}function Ze(e){let{lat0:t,lon0:r,dlat:n,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(a=>{let l=t+a[1]*n,s=l+n,c=r+a[0]*o,d=c+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,l],[d,l],[d,s],[c,s],[c,l]]]},properties:Object.fromEntries(p.flatMap((b,m)=>{let $=a[Y(m)],x=a[V(m)];return[[`k${m}`,Ee($,x)],[`v${m}`,Pe($,x)??0]]}))}})}}function Fe(e){return["case",["==",["get",`k${e}`],"gone"],D,["==",["get",`k${e}`],"new"],R,["interpolate",["linear"],["get",`v${e}`],...re.flatMap(([t,r])=>[t,r])]]}function S(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Ae(e,t){e.addSource(te,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:F,type:"fill",source:te,layout:{visibility:"none"},paint:{"fill-color":Fe(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,S(0,.85),13,S(0,.62),16,S(0,.45)]}},t)}async function ne(e,t,r){return T=await g(`/api/surface?radius=${t}`),e.getSource(te).setData(Ze(T)),oe(e,r),T}function oe(e,t){let r=p.indexOf(t);e.setPaintProperty(F,"fill-color",Fe(r)),e.setPaintProperty(F,"fill-opacity",["interpolate",["linear"],["zoom"],9,S(r,.85),13,S(r,.62),16,S(r,.45)])}function Be(e,t){Oe=t,e.setLayoutProperty(F,"visibility",t?"visible":"none")}var ae="corridor",Ne="corridor-lines",et="#8b929c",_={lost:D,added:R,kept:et};var B=null,He=!1;function N(){return B}function se(){return He}function tt(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function ze(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function rt(){return["match",["get","klass"],"lost",_.lost,"added",_.added,_.kept]}function nt(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function ot(){return["match",["get","klass"],"kept",.85,.9]}function je(e,t){e.addSource(ae,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ne,type:"line",source:ae,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":rt(),"line-width":nt(),"line-opacity":ot()}},t)}async function ie(e,t){return B=await g(`/api/corridors?day=${t}`),e.getSource(ae).setData(tt(B)),B}async function Ke(e,t){p.includes(t)&&await ie(e,t)}function Ge(e,t){He=t,e.setLayoutProperty(Ne,"visibility",t?"visible":"none")}var at={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function st(e){return e.buckets.filter(t=>t.key!=="none")}function it(e,t,r){let n=e.cell_m*e.cell_m/1e6,o=Te(e.cells,e.days.indexOf(t),r.west,r.south,r.east,r.north,e.origin,n),a=s=>s.toFixed(s<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${re.map(([s,c])=>`${c} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${D}"></i>loses all service</span>
        <span><i style="background:${R}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${a(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${a(o.less)}</b> km\xB2 less</span>
        <span><b>${a(o.more)}</b> km\xB2 more</span>
        <span><b>${a(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var lt=["lost","added","kept"],ct={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},dt={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Je(e,t){let{lostPct:r,addedPct:n}=ze(t.km),o=s=>s.toFixed(1),l=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${l}</b> km of street, citywide \u2014 ${dt[t.day]}
    </div>
    ${lt.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${_[s]}"></i>
        <span class="lg-lab">${h(ct[s])}</span>
        <span class="lg-n">${o(t.km[s])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${o(r)}%</b> of today's pavement lost</span>
      <span><b>${o(n)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A piece of street either has a bus on it or it doesn't \u2014
      this is not a walk-access question, so there is no radius here. A place
      can keep full walk access while a specific street loses its only bus, if
      a parallel block picks up the trip instead. See Locations or Surface for
      what you can still reach on foot.</div>`}function Ye(e,t,r,n,o){let a=t.buckets.map(d=>d.key),l=Se(t.points,t.days.indexOf(r),a,n.west,n.south,n.east,n.north),s=st(t),c=s.reduce((d,b)=>d+l[b.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${c.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${at[r]} \xB7 ${t.radius} m walk</span>
    </div>
    ${s.map(d=>`
      <button class="lg-row ${X(d.key)?"off":""}" data-bucket="${h(d.key)}"
              aria-pressed="${!X(d.key)}">
        <i style="background:${P[d.key]?.color??"#666"}"></i>
        <span class="lg-lab">${h(d.label)}</span>
        <span class="lg-n">${l[d.key].toLocaleString()}</span>
      </button>`).join("")}
    ${o?it(o,r,n):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var ut=[-79.9959,40.4406],v=400,le=null,z=null,H=0,i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ut,zoom:12});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{me(i),xe(i),Ae(i,"change-dots"),je(i,"change-dots"),ke(u("panel")),i.on("click",t=>{let r=i.queryRenderedFeatures(t.point,{layers:["change-dots"]})[0],n=r?r.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Ve(n[1],n[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let r=t.features?.[0],n=U();!r||!n||e.setLngLat(r.geometry.coordinates).setHTML(Re(r.properties,y(),n.buckets)).addTo(i)}),i.on("moveend",f),ce("[data-radius]",t=>{v=Number(t.dataset.radius),Q(i,v,y()).then(f),A()&&ne(i,v,y()).then(f),z&&Ve(z.lat,z.lon)}),ce("[data-day]",t=>{let r=t.dataset.day;Le(r),Z(i,r),oe(i,r),N()&&Ke(i,r).then(f),f()}),ce("[data-view]",t=>{let r=t.dataset.view;i.setLayoutProperty("change-dots","visibility",r==="surface"||r==="corridors"?"none":"visible"),pt(r==="surface"||r==="both"),mt(r==="corridors"),yt(r!=="corridors")}),u("legend").addEventListener("click",t=>{let r=t.target.closest("[data-bucket]");r&&(Ce(i,r.dataset.bucket,y()),f())}),u("legend-reset").addEventListener("click",()=>{De(i,y()),f()}),Q(i,v,y()).then(f),ft()});function ce(e,t){document.querySelectorAll(e).forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(e).forEach(n=>n.classList.toggle("active",n===r)),t(r)})})}function f(){if(u("legend-reset").classList.toggle("hidden",se()),se()){let r=N();r&&Je(u("legend"),r);return}let e=U();if(!e)return;let t=i.getBounds();Ye(u("legend"),e,y(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},Me()?A():null)}async function pt(e){if(e&&!A()){u("legend").classList.add("loading");try{await ne(i,v,y())}finally{u("legend").classList.remove("loading")}}Be(i,e),f()}async function mt(e){if(e&&!N()){u("legend").classList.add("loading");try{await ie(i,y())}finally{u("legend").classList.remove("loading")}}Ge(i,e),f()}function yt(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}async function Ve(e,t){let r=++H;z={lat:e,lon:t},u("panel").classList.add("loading"),le?le.setLngLat([t,e]):le=new maplibregl.Marker({color:"#e2574c"}).setLngLat([t,e]).addTo(i);try{let n=await g(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${v}`);if(r!==H)return;ye(i,e,t,v,n.current.stops,n.proposed.stops),I(n)}catch(n){if(r!==H)return;u("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${n.message}</p></div>`}finally{r===H&&u("panel").classList.remove("loading")}}async function ft(){try{let e=await g("/api/meta");u("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,u("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}u("methods-open").addEventListener("click",()=>u("methods").classList.add("open"));u("methods-close").addEventListener("click",()=>u("methods").classList.remove("open"));})();
