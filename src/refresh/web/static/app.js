"use strict";(()=>{function u(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function b(e){let t=await fetch(e);if(!t.ok){let r=t.statusText;try{r=(await t.json()).detail??r}catch{}throw new Error(r)}return t.json()}function h(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function j(e){if(e==null)return"\u2014";let t=e%1440,r=Math.floor(t/60),o=Math.round(t%60),n=r<12?"am":"pm";return`${r%12===0?12:r%12}:${String(o).padStart(2,"0")}${n}`}function G(e){return e>0?`+${e}`:String(e)}function ue(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var qe="#4aa3ff",Ue="#ffa23a";function Xe(e,t,r,o=96){let n=[],a=r/111320,l=r/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=o;s++){let c=s/o*2*Math.PI;n.push([t+l*Math.cos(c),e+a*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[n]},properties:{}}}function L(e){return{type:"FeatureCollection",features:e}}function pe(e,t){return e.map(r=>({type:"Feature",geometry:{type:"Point",coordinates:[r.lon,r.lat]},properties:{...r,side:t}}))}function me(e){e.addSource("walk",{type:"geojson",data:L([])}),e.addSource("stops-now",{type:"geojson",data:L([])}),e.addSource("stops-prop",{type:"geojson",data:L([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Ue,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":qe,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let r of["stops-now-c","stops-prop-c"])e.on("mouseenter",r,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",r,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",r,o=>{let n=o.features?.[0];if(!n)return;let a=n.properties;t.setLngLat(o.lngLat).setHTML(`<b>${a.name}</b><br>${a.side==="current"?"today":"proposed"}
                  \xB7 stop ${a.stop_id} \xB7 ${a.metres} m`).addTo(e)})}function ye(e,t,r,o,n,a){e.getSource("walk").setData(L([Xe(t,r,o)])),e.getSource("stops-now").setData(L(pe(n,"current"))),e.getSource("stops-prop").setData(L(pe(a,"proposed")))}var p=["weekday","saturday","sunday"],J=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],fe={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},be=e=>3+3*e,ge=e=>4+3*e,_=e=>5+3*e;var Y=e=>2+2*e,W=e=>3+2*e;var V=null,w="weekday";function y(){return w}function we(e,t=!0){w=e,t&&V&&I(V)}function Se(e){e.innerHTML=`
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
    </div>`}function Ze(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Qe(e,t){let r=Math.max(1,...J.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return J.map(o=>{let n=e.periods[o]??0,a=t.periods[o]??0,l=a-n,s=l>0?"up":l<0?"down":"flat";return`
      <tr>
        <th>${fe[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${n/r*100}%"></span>
          <span class="b-prop" style="width:${a/r*100}%"></span>
        </td>
        <td class="n">${n}</td>
        <td class="n">${a}</td>
        <td class="n ${s}">${l===0?"\xB7":G(l)}</td>
      </tr>`}).join("")}function he(e){return e.length?e.map(t=>`<span class="route">${h(t)}</span>`).join(" "):'<span class="muted">none</span>'}function ve(e){return e.first==null?'<span class="muted">no service</span>':`${j(e.first)} \u2013 ${j(e.last)}`}function Le(e){let t=Object.values(e.headways).map(r=>r.median).filter(r=>r!=null);return t.length?Math.min(...t):null}function I(e){V=e;let t=document.getElementById("panel"),r=e.current.days[w],o=e.proposed.days[w],n=o.trips-r.trips,a=n>0?"up":n<0?"down":"flat",l=e.place?.hood||e.place?.muni||"this location",s=Le(r),c=Le(o);t.innerHTML=`
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
        <div class="hl-n">${o.trips}</div>
      </div>
      <div class="hl-delta ${a}">
        ${n===0?"no change":`${G(n)} trips`}
        <div class="muted">${ue(r.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${w==="weekday"?"weekday":w}, both directions</div>

    <div class="tiers">${Ze(r.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Qe(r,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${ve(r)} <span class="muted">\u2192</span> ${ve(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${c==null?"\u2014":`${c} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${he(r.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${he(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var P={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},q="change",E="change-dots",O=null,S=new Set;function U(){return O}function X(e){return S.has(e)}function ke(e,t,r,o,n,a,l){let s={};for(let c of r)s[c]=0;for(let c of e){let d=c[0],g=c[1];if(d<n||d>l||g<o||g>a)continue;let m=r[c[_(t)]];m!==void 0&&s[m]++}return s}function et(e){let t=e.buckets.map(r=>r.key);return{type:"FeatureCollection",features:e.points.filter(r=>p.some((o,n)=>t[r[_(n)]]!=="none")).map(r=>({type:"Feature",geometry:{type:"Point",coordinates:[r[1],r[0]]},properties:{published:r[2],...Object.fromEntries(p.flatMap((o,n)=>[[`b${n}`,t[r[_(n)]]],[`c${n}`,r[be(n)]],[`p${n}`,r[ge(n)]]]))}}))}}function C(e,t){let r=Object.entries(P).flatMap(([o,n])=>[o,n[t]]);return["match",["get",`b${e}`],...r,P.none[t]]}function $e(e){return["interpolate",["linear"],["zoom"],9,["*",C(e,"size"),.45],12,C(e,"size"),16,["*",C(e,"size"),1.9]]}function xe(e){e.addSource(q,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:E,type:"circle",source:q,paint:{"circle-color":C(0,"color"),"circle-radius":$e(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function Z(e,t,r){return O=await b(`/api/change?radius=${t}`),e.getSource(q).setData(et(O)),Q(e,r),O}function Q(e,t){let r=p.indexOf(t);e.setPaintProperty(E,"circle-color",C(r,"color")),e.setPaintProperty(E,"circle-radius",$e(r)),ee(e,t)}function Ce(e,t,r){S.has(t)?S.delete(t):S.add(t),ee(e,r)}function De(e,t){S.clear(),ee(e,t)}function ee(e,t){let r=p.indexOf(t),o=["none",...S];e.setFilter(E,["!",["in",["get",`b${r}`],["literal",o]]])}function Re(e,t,r){let o=p.indexOf(t),n=e[`b${o}`],a=r.find(d=>d.key===n)?.label??n,l=e[`c${o}`],s=e[`p${o}`];return`<b>${a}</b><br>${l} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var te="surface",T="surface-fill",_e="#6b7280",re=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,_e],[.138,_e],[1,"#12a163"],[2,"#0b7a48"]],D="#e8232f",R="#0f79c9",Oe=2,M=null,Pe=!1;function A(){return M}function Ee(){return Pe}function Me(e,t){if(e<=0||t<=0)return null;let r=Math.log2(t/e);return Math.max(-Oe,Math.min(Oe,r))}function Te(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Ae(e,t,r,o,n,a,l,s){let c={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let g=l.lat0+(d[1]+.5)*l.dlat,m=l.lon0+(d[0]+.5)*l.dlon;if(g<o||g>a||m<r||m>n)continue;let $=d[Y(t)],x=d[W(t)],K=Te($,x);if(K!=="none")if(K==="ramp"){let de=Me($,x);c[de<-.138?"less":de>.138?"more":"same"]+=s}else c[K]+=s}return c}function tt(e){let{lat0:t,lon0:r,dlat:o,dlon:n}=e.origin;return{type:"FeatureCollection",features:e.cells.map(a=>{let l=t+a[1]*o,s=l+o,c=r+a[0]*n,d=c+n;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,l],[d,l],[d,s],[c,s],[c,l]]]},properties:Object.fromEntries(p.flatMap((g,m)=>{let $=a[Y(m)],x=a[W(m)];return[[`k${m}`,Te($,x)],[`v${m}`,Me($,x)??0]]}))}})}}function Fe(e){return["case",["==",["get",`k${e}`],"gone"],D,["==",["get",`k${e}`],"new"],R,["interpolate",["linear"],["get",`v${e}`],...re.flatMap(([t,r])=>[t,r])]]}function k(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Be(e,t){e.addSource(te,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:T,type:"fill",source:te,layout:{visibility:"none"},paint:{"fill-color":Fe(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,k(0,.85),13,k(0,.62),16,k(0,.45)]}},t)}async function oe(e,t,r){return M=await b(`/api/surface?radius=${t}`),e.getSource(te).setData(tt(M)),ne(e,r),M}function ne(e,t){let r=p.indexOf(t);e.setPaintProperty(T,"fill-color",Fe(r)),e.setPaintProperty(T,"fill-opacity",["interpolate",["linear"],["zoom"],9,k(r,.85),13,k(r,.62),16,k(r,.45)])}function Ne(e,t){Pe=t,e.setLayoutProperty(T,"visibility",t?"visible":"none")}var ae="corridor",ze="corridor-lines",He="#8b929c",rt="#6f7783",B={lost:D,added:R,kept:He};var F=null,Ke=!1;function N(){return F}function se(){return Ke}function ot(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function je(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function nt(){let e=t=>["match",["get","klass"],"lost",B.lost,"added",B.added,t];return["interpolate",["linear"],["zoom"],9,e(rt),14,e(He)]}function at(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function st(){return["match",["get","klass"],"kept",.85,.9]}function Ge(e,t){e.addSource(ae,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ze,type:"line",source:ae,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":nt(),"line-width":at(),"line-opacity":st()}},t)}async function ie(e,t){return F=await b(`/api/corridors?day=${t}`),e.getSource(ae).setData(ot(F)),F}async function Je(e,t){p.includes(t)&&await ie(e,t)}function Ye(e,t){Ke=t,e.setLayoutProperty(ze,"visibility",t?"visible":"none")}var it={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function lt(e){return e.buckets.filter(t=>t.key!=="none")}function ct(e,t,r){let o=e.cell_m*e.cell_m/1e6,n=Ae(e.cells,e.days.indexOf(t),r.west,r.south,r.east,r.north,e.origin,o),a=s=>s.toFixed(s<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${re.map(([s,c])=>`${c} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${D}"></i>loses all service</span>
        <span><i style="background:${R}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${a(n.gone)}</b> km\xB2 lose all service</span>
        <span><b>${a(n.less)}</b> km\xB2 less</span>
        <span><b>${a(n.more)}</b> km\xB2 more</span>
        <span><b>${a(n.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var dt=["lost","added","kept"],ut={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},pt={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function We(e,t){let{lostPct:r,addedPct:o}=je(t.km),n=s=>s.toFixed(1),l=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${l}</b> km of street, citywide \u2014 ${pt[t.day]}
    </div>
    ${dt.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${B[s]}"></i>
        <span class="lg-lab">${h(ut[s])}</span>
        <span class="lg-n">${n(t.km[s])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${n(r)}%</b> of today's pavement lost</span>
      <span><b>${n(o)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A piece of street either has a bus on it or it doesn't \u2014
      this is not a walk-access question, so there is no radius here. A place
      can keep full walk access while a specific street loses its only bus, if
      a parallel block picks up the trip instead. See Locations or Surface for
      what you can still reach on foot.</div>`}function Ve(e,t,r,o,n){let a=t.buckets.map(d=>d.key),l=ke(t.points,t.days.indexOf(r),a,o.west,o.south,o.east,o.north),s=lt(t),c=s.reduce((d,g)=>d+l[g.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${c.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${it[r]} \xB7 ${t.radius} m walk</span>
    </div>
    ${s.map(d=>`
      <button class="lg-row ${X(d.key)?"off":""}" data-bucket="${h(d.key)}"
              aria-pressed="${!X(d.key)}">
        <i style="background:${P[d.key]?.color??"#666"}"></i>
        <span class="lg-lab">${h(d.label)}</span>
        <span class="lg-n">${l[d.key].toLocaleString()}</span>
      </button>`).join("")}
    ${n?ct(n,r,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var mt=[-79.9959,40.4406],v=400,le=null,H=null,z=0,i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:mt,zoom:12});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{me(i),xe(i),Be(i,"change-dots"),Ge(i,"change-dots"),Se(u("panel")),i.on("click",t=>{let r=i.queryRenderedFeatures(t.point,{layers:["change-dots"]})[0],o=r?r.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Ie(o[1],o[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let r=t.features?.[0],o=U();!r||!o||e.setLngLat(r.geometry.coordinates).setHTML(Re(r.properties,y(),o.buckets)).addTo(i)}),i.on("moveend",f),ce("[data-radius]",t=>{v=Number(t.dataset.radius),Z(i,v,y()).then(f),A()&&oe(i,v,y()).then(f),H&&Ie(H.lat,H.lon)}),ce("[data-day]",t=>{let r=t.dataset.day;we(r),Q(i,r),ne(i,r),N()&&Je(i,r).then(f),f()}),ce("[data-view]",t=>{let r=t.dataset.view;i.setLayoutProperty("change-dots","visibility",r==="surface"||r==="corridors"?"none":"visible"),yt(r==="surface"||r==="both"),ft(r==="corridors"),bt(r!=="corridors")}),u("legend").addEventListener("click",t=>{let r=t.target.closest("[data-bucket]");r&&(Ce(i,r.dataset.bucket,y()),f())}),u("legend-reset").addEventListener("click",()=>{De(i,y()),f()}),Z(i,v,y()).then(f),gt()});function ce(e,t){document.querySelectorAll(e).forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===r)),t(r)})})}function f(){if(u("legend-reset").classList.toggle("hidden",se()),se()){let r=N();r&&We(u("legend"),r);return}let e=U();if(!e)return;let t=i.getBounds();Ve(u("legend"),e,y(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},Ee()?A():null)}async function yt(e){if(e&&!A()){u("legend").classList.add("loading");try{await oe(i,v,y())}finally{u("legend").classList.remove("loading")}}Ne(i,e),f()}async function ft(e){if(e&&!N()){u("legend").classList.add("loading");try{await ie(i,y())}finally{u("legend").classList.remove("loading")}}Ye(i,e),f()}function bt(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}async function Ie(e,t){let r=++z;H={lat:e,lon:t},u("panel").classList.add("loading"),le?le.setLngLat([t,e]):le=new maplibregl.Marker({color:"#e2574c"}).setLngLat([t,e]).addTo(i);try{let o=await b(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${v}`);if(r!==z)return;ye(i,e,t,v,o.current.stops,o.proposed.stops),I(o)}catch(o){if(r!==z)return;u("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{r===z&&u("panel").classList.remove("loading")}}async function gt(){try{let e=await b("/api/meta");u("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,u("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}u("methods-open").addEventListener("click",()=>u("methods").classList.add("open"));u("methods-close").addEventListener("click",()=>u("methods").classList.remove("open"));})();
