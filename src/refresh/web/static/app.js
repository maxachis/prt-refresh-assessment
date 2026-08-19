"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function b(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function v(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function N(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),r=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(r).padStart(2,"0")}${o}`}function z(e){return e>0?`+${e}`:String(e)}function ae(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Te="#4aa3ff",Be="#ffa23a";function Fe(e,t,n,r=96){let o=[],a=n/111320,l=n/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=r;s++){let c=s/r*2*Math.PI;o.push([t+l*Math.cos(c),e+a*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function w(e){return{type:"FeatureCollection",features:e}}function se(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ie(e){e.addSource("walk",{type:"geojson",data:w([])}),e.addSource("stops-now",{type:"geojson",data:w([])}),e.addSource("stops-prop",{type:"geojson",data:w([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Be,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Te,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,r=>{let o=r.features?.[0];if(!o)return;let a=o.properties;t.setLngLat(r.lngLat).setHTML(`<b>${a.name}</b><br>${a.side==="current"?"today":"proposed"}
                  \xB7 stop ${a.stop_id} \xB7 ${a.metres} m`).addTo(e)})}function le(e,t,n,r,o,a){e.getSource("walk").setData(w([Fe(t,n,r)])),e.getSource("stops-now").setData(w(se(o,"current"))),e.getSource("stops-prop").setData(w(se(a,"proposed")))}var m=["weekday","saturday","sunday"],H=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],ce={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ue=e=>3+3*e,de=e=>4+3*e,_=e=>5+3*e;var j=e=>2+2*e,A=e=>3+2*e;var G=null,L="weekday";function f(){return L}function ye(e,t=!0){L=e,t&&G&&J(G)}function ge(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map is coloured by what the Proposed Final Network does to the
         buses within a short walk. Pan and zoom to read a neighbourhood; the
         legend counts what is on screen.</p>
      <p><b>Locations</b> draws one dot per place a bus stops today.
         <b>Surface</b> measures the same comparison at every point on a 100 m
         grid, so it can also show ground the plan adds a bus to \u2014 but it is
         extent, not people: a hillside counts like a city block. The two
         answer different questions and are best read together.</p>
      <p>Click anywhere on the map for the full before-and-after.</p>
      <p class="muted">Both networks are measured inside the same circle, so
         renumbered routes and consolidated stops don't distort the comparison.
         Switch day type in the toolbar: some places keep every weekday bus and
         lose the weekend entirely.</p>
    </div>`}function Ne(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function ze(e,t){let n=Math.max(1,...H.map(r=>Math.max(e.periods[r]??0,t.periods[r]??0)));return H.map(r=>{let o=e.periods[r]??0,a=t.periods[r]??0,l=a-o,s=l>0?"up":l<0?"down":"flat";return`
      <tr>
        <th>${ce[r]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${a/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${a}</td>
        <td class="n ${s}">${l===0?"\xB7":z(l)}</td>
      </tr>`}).join("")}function pe(e){return e.length?e.map(t=>`<span class="route">${v(t)}</span>`).join(" "):'<span class="muted">none</span>'}function me(e){return e.first==null?'<span class="muted">no service</span>':`${N(e.first)} \u2013 ${N(e.last)}`}function fe(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}function J(e){G=e;let t=document.getElementById("panel"),n=e.current.days[L],r=e.proposed.days[L],o=r.trips-n.trips,a=o>0?"up":o<0?"down":"flat",l=e.place?.hood||e.place?.muni||"this location",s=fe(n),c=fe(r);t.innerHTML=`
    <div class="place-head">
      <h2>${v(l)}</h2>
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
        <div class="hl-n">${r.trips}</div>
      </div>
      <div class="hl-delta ${a}">
        ${o===0?"no change":`${z(o)} trips`}
        <div class="muted">${ae(n.trips,r.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${L==="weekday"?"weekday":L}, both directions</div>

    <div class="tiers">${Ne(n.hourly,r.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${ze(n,r)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${me(n)} <span class="muted">\u2192</span> ${me(r)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${c==null?"\u2014":`${c} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${pe(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${pe(r.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var P={gone:{color:"#ff3b47",size:6},halved:{color:"#ff8f6e",size:4.5},less:{color:"#a8756c",size:3},same:{color:"#59606e",size:2.5},more:{color:"#6aa387",size:3},doubled:{color:"#35d98a",size:4.5},new:{color:"#4ec3ff",size:6},none:{color:"#3a3f4a",size:2}},Y="change",R="change-dots",M=null,S=new Set;function W(){return M}function U(e){return S.has(e)}function be(e,t,n,r,o,a,l){let s={};for(let c of n)s[c]=0;for(let c of e){let u=c[0],y=c[1];if(u<o||u>l||y<r||y>a)continue;let p=n[c[_(t)]];p!==void 0&&s[p]++}return s}function He(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>m.some((r,o)=>t[n[_(o)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(m.flatMap((r,o)=>[[`b${o}`,t[n[_(o)]]],[`c${o}`,n[ue(o)]],[`p${o}`,n[de(o)]]]))}}))}}function D(e,t){let n=Object.entries(P).flatMap(([r,o])=>[r,o[t]]);return["match",["get",`b${e}`],...n,P.none[t]]}function he(e){return["interpolate",["linear"],["zoom"],9,["*",D(e,"size"),.45],12,D(e,"size"),16,["*",D(e,"size"),1.9]]}function ve(e){e.addSource(Y,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:R,type:"circle",source:Y,paint:{"circle-color":D(0,"color"),"circle-radius":he(0),"circle-opacity":.85,"circle-stroke-width":.5,"circle-stroke-color":"rgba(10,12,16,.65)"}},"walk-fill")}async function q(e,t,n){return M=await b(`/api/change?radius=${t}`),e.getSource(Y).setData(He(M)),K(e,n),M}function K(e,t){let n=m.indexOf(t);e.setPaintProperty(R,"circle-color",D(n,"color")),e.setPaintProperty(R,"circle-radius",he(n)),I(e,t)}function we(e,t,n){S.has(t)?S.delete(t):S.add(t),I(e,n)}function Le(e,t){S.clear(),I(e,t)}function I(e,t){let n=m.indexOf(t),r=["none",...S];e.setFilter(R,["!",["in",["get",`b${n}`],["literal",r]]])}function Se(e,t,n){let r=m.indexOf(t),o=e[`b${r}`],a=n.find(u=>u.key===o)?.label??o,l=e[`c${r}`],s=e[`p${r}`];return`<b>${a}</b><br>${l} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var V="surface",E="surface-fill",X=[[-2,"#c9142a"],[-1,"#ff8f6e"],[-.138,"#59606e"],[.138,"#59606e"],[1,"#35d98a"],[2,"#0f9c5c"]],Q="#ff3b47",Z="#4ec3ff",$e=2,C=null,ke=!1;function O(){return C}function xe(){return ke}function De(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-$e,Math.min($e,n))}function _e(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Me(e,t,n,r,o,a,l,s){let c={gone:0,less:0,same:0,more:0,new:0};for(let u of e){let y=l.lat0+(u[1]+.5)*l.dlat,p=l.lon0+(u[0]+.5)*l.dlon;if(y<r||y>a||p<n||p>o)continue;let k=u[j(t)],x=u[A(t)],F=_e(k,x);if(F!=="none")if(F==="ramp"){let oe=De(k,x);c[oe<-.138?"less":oe>.138?"more":"same"]+=s}else c[F]+=s}return c}function je(e){let{lat0:t,lon0:n,dlat:r,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(a=>{let l=t+a[1]*r,s=l+r,c=n+a[0]*o,u=c+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,l],[u,l],[u,s],[c,s],[c,l]]]},properties:Object.fromEntries(m.flatMap((y,p)=>{let k=a[j(p)],x=a[A(p)];return[[`k${p}`,_e(k,x)],[`v${p}`,De(k,x)??0]]}))}})}}function Pe(e){return["case",["==",["get",`k${e}`],"gone"],Q,["==",["get",`k${e}`],"new"],Z,["interpolate",["linear"],["get",`v${e}`],...X.flatMap(([t,n])=>[t,n])]]}function $(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Re(e,t){e.addSource(V,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:E,type:"fill",source:V,layout:{visibility:"none"},paint:{"fill-color":Pe(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,$(0,.85),13,$(0,.62),16,$(0,.45)]}},t)}async function ee(e,t,n){return C=await b(`/api/surface?radius=${t}`),e.getSource(V).setData(je(C)),te(e,n),C}function te(e,t){let n=m.indexOf(t);e.setPaintProperty(E,"fill-color",Pe(n)),e.setPaintProperty(E,"fill-opacity",["interpolate",["linear"],["zoom"],9,$(n,.85),13,$(n,.62),16,$(n,.45)])}function Ce(e,t){ke=t,e.setLayoutProperty(E,"visibility",t?"visible":"none")}var Ae={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ge(e){return e.buckets.filter(t=>t.key!=="none")}function Je(e,t,n){let r=e.cell_m*e.cell_m/1e6,o=Me(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,r),a=s=>s.toFixed(s<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${X.map(([s,c])=>`${c} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${Q}"></i>loses all service</span>
        <span><i style="background:${Z}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${a(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${a(o.less)}</b> km\xB2 less</span>
        <span><b>${a(o.more)}</b> km\xB2 more</span>
        <span><b>${a(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}function Ee(e,t,n,r,o){let a=t.buckets.map(u=>u.key),l=be(t.points,t.days.indexOf(n),a,r.west,r.south,r.east,r.north),s=Ge(t),c=s.reduce((u,y)=>u+l[y.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${c.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${Ae[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${s.map(u=>`
      <button class="lg-row ${U(u.key)?"off":""}" data-bucket="${v(u.key)}"
              aria-pressed="${!U(u.key)}">
        <i style="background:${P[u.key]?.color??"#666"}"></i>
        <span class="lg-lab">${v(u.label)}</span>
        <span class="lg-n">${l[u.key].toLocaleString()}</span>
      </button>`).join("")}
    ${o?Je(o,n,r):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var Ye=[-79.9959,40.4406],h=400,ne=null,B=null,T=0,i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Ye,zoom:12});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{ie(i),ve(i),Re(i,"change-dots"),ge(d("panel")),i.on("click",t=>{let n=i.queryRenderedFeatures(t.point,{layers:["change-dots"]})[0],r=n?n.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Oe(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],r=W();!n||!r||e.setLngLat(n.geometry.coordinates).setHTML(Se(n.properties,f(),r.buckets)).addTo(i)}),i.on("moveend",g),re("[data-radius]",t=>{h=Number(t.dataset.radius),q(i,h,f()).then(g),O()&&ee(i,h,f()).then(g),B&&Oe(B.lat,B.lon)}),re("[data-day]",t=>{let n=t.dataset.day;ye(n),K(i,n),te(i,n),g()}),re("[data-view]",t=>{let n=t.dataset.view;i.setLayoutProperty("change-dots","visibility",n==="surface"?"none":"visible"),We(n!=="dots")}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(we(i,n.dataset.bucket,f()),g())}),d("legend-reset").addEventListener("click",()=>{Le(i,f()),g()}),q(i,h,f()).then(g),Ue()});function re(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(r=>r.classList.toggle("active",r===n)),t(n)})})}function g(){let e=W();if(!e)return;let t=i.getBounds();Ee(d("legend"),e,f(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},xe()?O():null)}async function We(e){if(e&&!O()){d("legend").classList.add("loading");try{await ee(i,h,f())}finally{d("legend").classList.remove("loading")}}Ce(i,e),g()}async function Oe(e,t){let n=++T;B={lat:e,lon:t},d("panel").classList.add("loading"),ne?ne.setLngLat([t,e]):ne=new maplibregl.Marker({color:"#e2574c"}).setLngLat([t,e]).addTo(i);try{let r=await b(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${h}`);if(n!==T)return;le(i,e,t,h,r.current.stops,r.proposed.stops),J(r)}catch(r){if(n!==T)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}finally{n===T&&d("panel").classList.remove("loading")}}async function Ue(){try{let e=await b("/api/meta");d("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,d("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
