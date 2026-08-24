"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function h(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function O(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function ie(e){return e>0?`+${e}`:String(e)}function Ye(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var yn="#4aa3ff",fn="#ffa23a";function hn(e,t,n,o=96){let r=[],a=n/111320,c=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;r.push([t+c*Math.cos(l),e+a*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function R(e){return{type:"FeatureCollection",features:e}}function Ue(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function We(e){e.addSource("walk",{type:"geojson",data:R([])}),e.addSource("stops-now",{type:"geojson",data:R([])}),e.addSource("stops-prop",{type:"geojson",data:R([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":fn,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":yn,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let r=o.features?.[0];if(!r)return;let a=r.properties;t.setLngLat(o.lngLat).setHTML(`<b>${a.name}</b><br>${a.side==="current"?"today":"proposed"}
                  \xB7 stop ${a.stop_id} \xB7 ${a.metres} m`).addTo(e)})}function Ze(e,t,n,o,r,a){e.getSource("walk").setData(R([hn(t,n,o)])),e.getSource("stops-now").setData(R(Ue(r,"current"))),e.getSource("stops-prop").setData(R(Ue(a,"proposed")))}var v=["weekday","saturday","sunday"],le=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],qe={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Xe=e=>3+3*e,Qe=e=>4+3*e,J=e=>5+3*e;var ce=e=>2+2*e,de=e=>3+2*e;var ue=null,D="weekday";function w(){return D}function nt(e,t=!0){D=e,t&&ue&&me(ue)}function pe(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
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
      <p><b>One-seat</b> asks a different kind of question again: from each
         place, can a rider still reach Downtown, Oakland or a point you pick
         <em>without transferring</em>? No day type and no travel time enter
         that \u2014 a route serves a place or it doesn't \u2014 so a surviving one-seat
         ride may still be hourly on a Sunday. It is also the only view that
         counts the T and the inclines, which are unchanged by the Refresh but
         are how much of the South Hills reaches Downtown.</p>
      <p><b>Travel time</b> is the only view here with a clock on it: how many
         minutes the trip from a point to Downtown, Oakland or a point you pick
         actually takes, on each network, with the wait for the bus counted in.
         It is timed from every minute of the morning peak rather than from one
         chosen departure, and it is schedule against schedule \u2014 the proposed
         network has no observed running times and never will.</p>
      <p>Click anywhere on the map for the full before-and-after.</p>
      <p class="muted">Both networks are measured inside the same circle, so
         renumbered routes and consolidated stops don't distort the comparison.
         Switch day type in the toolbar: some places keep every weekday bus and
         lose the weekend entirely.</p>
    </div>`}function bn(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function gn(e,t){let n=Math.max(1,...le.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return le.map(o=>{let r=e.periods[o]??0,a=t.periods[o]??0,c=a-r,i=c>0?"up":c<0?"down":"flat";return`
      <tr>
        <th>${qe[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${a/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${a}</td>
        <td class="n ${i}">${c===0?"\xB7":ie(c)}</td>
      </tr>`}).join("")}function A(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function et(e){return e.first==null?'<span class="muted">no service</span>':`${O(e.first)} \u2013 ${O(e.last)}`}function tt(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var vn={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"};function wn(e){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(n=>{let o=A(n.current),r=A(n.proposed),a=n.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${o}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(n.name)}</span>
          <span class="os-status ${p(n.status)}">${vn[n.status]??n.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function me(e){ue=e;let t=document.getElementById("panel"),n=e.current.days[D],o=e.proposed.days[D],r=o.trips-n.trips,a=r>0?"up":r<0?"down":"flat",c=e.place?.hood||e.place?.muni||"this location",i=tt(n),l=tt(o);t.innerHTML=`
    <div class="place-head">
      <h2>${p(c)}</h2>
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
        ${r===0?"no change":`${ie(r)} trips`}
        <div class="muted">${Ye(n.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${D==="weekday"?"weekday":D}, both directions</div>

    <div class="tiers">${bn(n.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${gn(n,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${et(n)} <span class="muted">\u2192</span> ${et(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${i==null?"\u2014":`${i} min`} <span class="muted">\u2192</span> ${l==null?"\u2014":`${l} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${wn(e.oneseat??[])}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${A(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${A(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var z={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ye="change",B="change-dots",H=null,C=new Set;function fe(){return H}function he(e){return C.has(e)}function ot(e,t,n,o,r,a,c){let i={};for(let l of n)i[l]=0;for(let l of e){let u=l[0],g=l[1];if(u<r||u>c||g<o||g>a)continue;let L=n[l[J(t)]];L!==void 0&&i[L]++}return i}function Ln(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>v.some((o,r)=>t[n[J(r)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(v.flatMap((o,r)=>[[`b${r}`,t[n[J(r)]]],[`c${r}`,n[Xe(r)]],[`p${r}`,n[Qe(r)]]]))}}))}}function P(e,t){let n=Object.entries(z).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,z.none[t]]}function rt(e){return["interpolate",["linear"],["zoom"],9,["*",P(e,"size"),.45],12,P(e,"size"),16,["*",P(e,"size"),1.9]]}function at(e){e.addSource(ye,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:B,type:"circle",source:ye,paint:{"circle-color":P(0,"color"),"circle-radius":rt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function be(e,t,n){return H=await h(`/api/change?radius=${t}`),e.getSource(ye).setData(Ln(H)),ge(e,n),H}function ge(e,t){let n=v.indexOf(t);e.setPaintProperty(B,"circle-color",P(n,"color")),e.setPaintProperty(B,"circle-radius",rt(n)),ve(e,t)}function st(e,t,n){C.has(t)?C.delete(t):C.add(t),ve(e,n)}function it(e,t){C.clear(),ve(e,t)}function ve(e,t){let n=v.indexOf(t),o=["none",...C];e.setFilter(B,["!",["in",["get",`b${n}`],["literal",o]]])}function lt(e,t,n){let o=v.indexOf(t),r=e[`b${o}`],a=n.find(u=>u.key===r)?.label??r,c=e[`c${o}`],i=e[`p${o}`];return`<b>${a}</b><br>${c} \u2192 ${i} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var we="surface",I="surface-fill",ct="#6b7280",Le=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,ct],[.138,ct],[1,"#12a163"],[2,"#0b7a48"]],S="#e8232f",_="#0f79c9",dt=2,K=null,ut=!1;function V(){return K}function pt(){return ut}function mt(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-dt,Math.min(dt,n))}function yt(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function ft(e,t,n,o,r,a,c,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let u of e){let g=c.lat0+(u[1]+.5)*c.dlat,L=c.lon0+(u[0]+.5)*c.dlon;if(g<o||g>a||L<n||L>r)continue;let T=u[ce(t)],E=u[de(t)],se=yt(T,E);if(se!=="none")if(se==="ramp"){let Ge=mt(T,E);l[Ge<-.138?"less":Ge>.138?"more":"same"]+=i}else l[se]+=i}return l}function kn(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(a=>{let c=t+a[1]*o,i=c+o,l=n+a[0]*r,u=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,c],[u,c],[u,i],[l,i],[l,c]]]},properties:Object.fromEntries(v.flatMap((g,L)=>{let T=a[ce(L)],E=a[de(L)];return[[`k${L}`,yt(T,E)],[`v${L}`,mt(T,E)??0]]}))}})}}function ht(e){return["case",["==",["get",`k${e}`],"gone"],S,["==",["get",`k${e}`],"new"],_,["interpolate",["linear"],["get",`v${e}`],...Le.flatMap(([t,n])=>[t,n])]]}function M(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function bt(e,t){e.addSource(we,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:I,type:"fill",source:we,layout:{visibility:"none"},paint:{"fill-color":ht(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,M(0,.85),13,M(0,.62),16,M(0,.45)]}},t)}async function ke(e,t,n){return K=await h(`/api/surface?radius=${t}`),e.getSource(we).setData(kn(K)),Se(e,n),K}function Se(e,t){let n=v.indexOf(t);e.setPaintProperty(I,"fill-color",ht(n)),e.setPaintProperty(I,"fill-opacity",["interpolate",["linear"],["zoom"],9,M(n,.85),13,M(n,.62),16,M(n,.45)])}function gt(e,t){ut=t,e.setLayoutProperty(I,"visibility",t?"visible":"none")}var _e="corridor",vt="corridor-lines",U="#8b929c",Sn="#6f7783",Y={lost:S,added:_,kept:U};var G=null,wt=!1;function W(){return G}function $e(){return wt}function _n(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Lt(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function $n(){let e=t=>["match",["get","klass"],"lost",Y.lost,"added",Y.added,t];return["interpolate",["linear"],["zoom"],9,e(Sn),14,e(U)]}function xn(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function On(){return["match",["get","klass"],"kept",.85,.9]}function kt(e,t){e.addSource(_e,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vt,type:"line",source:_e,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":$n(),"line-width":xn(),"line-opacity":On()}},t)}async function xe(e,t){return G=await h(`/api/corridors?day=${t}`),e.getSource(_e).setData(_n(G)),G}async function St(e,t){v.includes(t)&&await xe(e,t)}function _t(e,t){wt=t,e.setLayoutProperty(vt,"visibility",t?"visible":"none")}var Re="#2b3038",$t="#b9bec6",j={loses:{color:S,size:6},gains:{color:_,size:6},keeps:{color:U,size:3},here:{color:Re,size:3.5},none:{color:$t,size:1.8}},q=["loses","gains","keeps","none","here"],Oe="oneseat",xt="oneseat-dots",Z=null,Ot=!1;function F(){return Z}function De(){return Ot}function Rt(e,t,n,o,r,a){let c={};for(let i of t)c[i]=0;for(let i of e){let l=i[0],u=i[1];if(l<o||l>a||u<n||u>r)continue;let g=t[i[3]];g!==void 0&&c[g]++}return c}function Rn(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Dn(){return["match",["get","status"],...Object.entries(j).flatMap(([e,t])=>[e,t.color]),$t]}function Cn(){let e=["match",["get","status"],...Object.entries(j).flatMap(([t,n])=>[t,n.size]),j.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Dt(e,t){e.addSource(Oe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:xt,type:"circle",source:Oe,layout:{visibility:"none"},paint:{"circle-color":Dn(),"circle-radius":Cn(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Mn(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Tn="pin";function Ct(e){return"key"in e?e.key:Tn}async function Ce(e,t,n){return Z=await h(`/api/oneseat?radius=${t}&${Mn(n)}`),e.getSource(Oe).setData(Rn(Z)),Z}function Mt(e,t){Ot=t,e.setLayoutProperty(xt,"visibility",t?"visible":"none")}function Me(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Tt(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),r=(e.proposed||"").split(";").filter(Boolean),a=i=>i.length?i.join(", "):"none",c=Me(t);return e.status==="here"?`<b>at ${c}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${c}<br>today: ${a(o)}<br>proposed: ${a(r)}`}var En={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Pn(e){return e.buckets.filter(t=>t.key!=="none")}function jn(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=ft(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),a=i=>i.toFixed(i<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Le.map(([i,l])=>`${l} ${((i+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${S}"></i>loses all service</span>
        <span><i style="background:${_}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${a(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${a(r.less)}</b> km\xB2 less</span>
        <span><b>${a(r.more)}</b> km\xB2 more</span>
        <span><b>${a(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var Fn=["lost","added","kept"],Nn={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Jn={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Et(e,t){let{lostPct:n,addedPct:o}=Lt(t.km),r=i=>i.toFixed(1),c=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${c}</b> km of street, citywide \u2014 ${Jn[t.day]}
    </div>
    ${Fn.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${Y[i]}"></i>
        <span class="lg-lab">${p(Nn[i])}</span>
        <span class="lg-n">${r(t.km[i])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${r(n)}%</b> of today's pavement lost</span>
      <span><b>${r(o)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A piece of street either has a bus on it or it doesn't \u2014
      this is not a walk-access question, so there is no radius here. A place
      can keep full walk access while a specific street loses its only bus, if
      a parallel block picks up the trip instead. See Locations or Surface for
      what you can still reach on foot.</div>`}function Pt(e,t,n){let o=t.statuses.map(l=>l.key),r=Rt(t.points,o,n.west,n.south,n.east,n.north),a=l=>t.statuses.find(u=>u.key===l)?.label??l,c=q.reduce((l,u)=>l+(r[u]??0),0),i=Me(t);e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(i)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk</span>
    </div>
    ${q.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${j[l].color}"></i>
        <span class="lg-lab">${p(a(l))}</span>
        <span class="lg-n">${(r[l]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${q.map(l=>`${(t.counts[l]??0).toLocaleString()} ${p(a(l))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${p(i)} without transferring?
      No day type and no travel time enter this \u2014 a route serves a place or it
      doesn't \u2014 so a one-seat ride that survives may still be hourly on a
      Sunday, or take an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function jt(e,t,n,o,r){let a=t.buckets.map(u=>u.key),c=ot(t.points,t.days.indexOf(n),a,o.west,o.south,o.east,o.north),i=Pn(t),l=i.reduce((u,g)=>u+c[g.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${l.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${En[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${i.map(u=>`
      <button class="lg-row ${he(u.key)?"off":""}" data-bucket="${p(u.key)}"
              aria-pressed="${!he(u.key)}">
        <i style="background:${z[u.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(u.label)}</span>
        <span class="lg-n">${c[u.key].toLocaleString()}</span>
      </button>`).join("")}
    ${r?jn(r,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var X="ondemand",Te="ondemand-fill",Ee="ondemand-line",Ft="#7c5cd6",Q=null,Nt=!1;function Pe(){return Q}function ee(){return Nt}function An(e){return{type:"FeatureCollection",features:e.zones.map(t=>({type:"Feature",geometry:{type:"MultiPolygon",coordinates:t.geometry},properties:{name:t.name,vehicles_weekday:t.vehicles_weekday,weekday_hours:t.weekday_hours,zone_km2:t.zone_km2,lost_km2_inside:t.lost_km2_inside}}))}}function Hn(e){return e==null?"an unstated number of vehicles":e===1?"1 vehicle":`${e} vehicles`}function Jt(e){let t=e.lost_km2_inside,n=e.zone_km2,o=t==null?"":`<div class="muted">${t.toFixed(1)} km\xB2 of it loses all fixed-route service under the plan</div>`;return`<strong>${p(e.name??"On-demand zone")}</strong><div>Proposed on-demand service: ${Hn(e.vehicles_weekday)}${n?` for ${n.toFixed(0)} km\xB2`:""}${e.weekday_hours?`, ${p(e.weekday_hours)} weekdays`:""}</div>`+o}function At(e){let t=e.lost_pct_inside===null?`${e.lost_km2_inside.toFixed(1)} km\xB2 of the ground that loses all fixed-route service is inside one`:`${Math.round(e.lost_pct_inside)}% of the ${e.lost_km2_citywide.toFixed(1)} km\xB2 that loses all fixed-route service is inside one`;return`<div class="lg-foot">${e.zones} proposed on-demand zones. ${t}. All ten together run ${e.vehicles_weekday} vehicles over ${e.zone_km2.toFixed(0)} km\xB2, 7am\u20139pm \u2014 a fallback, not a replacement. Nothing on this map is netted off against them.</div>`}function Ht(e,t){e.addSource(X,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Te,type:"fill",source:X,layout:{visibility:"none"},paint:{"fill-color":Ft,"fill-opacity":.08}},t),e.addLayer({id:Ee,type:"line",source:X,layout:{visibility:"none","line-join":"round"},paint:{"line-color":Ft,"line-width":2,"line-opacity":.9,"line-dasharray":[3,2]}},t)}async function zt(e){return Q=await h("/api/zones"),e.getSource(X).setData(An(Q)),Q}function Bt(e,t){Nt=t;for(let n of[Te,Ee])e.setLayoutProperty(n,"visibility",t?"visible":"none")}var je=[Te,Ee];var Fe="#4aa3ff",Wt="#ffa23a",Ne="headline",te="journey",Zt="journey-rides",qt="journey-walks",zn=[Zt,qt],Xt=null,Qt=!1;function oe(){return Xt}function Je(){return Qt}function Bn(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let a=n[r].itinerary;if(a)for(let c of a.legs){let i=c.from??e.origin,l=c.to??e.destination,u=[[i.lon,i.lat],[l.lon,l.lat]],g=c.path?.length?c.path:u;o.push({type:"Feature",geometry:{type:"LineString",coordinates:g},properties:{side:r,kind:c.kind,route:c.route}})}}return{type:"FeatureCollection",features:o}}function Kt(){return["match",["get","side"],"current",Fe,"proposed",Wt,Fe]}function It(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function en(e,t){e.addSource(te,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Zt,type:"line",source:te,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Kt(),"line-width":It(1),"line-opacity":.85}},t),e.addLayer({id:qt,type:"line",source:te,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Kt(),"line-width":It(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function tn(e,t){Qt=t;for(let n of zn)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Ae(e,t){Xt=t;let n=t?Bn(t,Ne):{type:"FeatureCollection",features:[]};e.getSource(te).setData(n)}function nn(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Vt=e=>`${e.toFixed(1)} min`;function on(e){return e==null?"\u2014":e===0?"no change":e>0?`${Vt(e)} slower`:`${Vt(-e)} faster`}function Gt(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function Kn(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Gt(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Gt(e.to,"the destination")}</span></div>`}function Yt(e,t){let n=[],o=null;for(let r of e.legs){let a=o?Math.round(r.depart-o.arrive):0;a>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${a} min</span></div>`),n.push(Kn(r,t)),o=r}return n.join("")}var In={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function ne(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Vn(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Gn(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${ne(t.current)} \u2192
        ${ne(t.proposed)} min</span>
        <span class="muted">${on(t.change_min)}</span></div>
      ${o}
    </div>`}function Ut(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function He(e,t){let n=e.radii[Ne],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${p(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${O(e.window.start_min)}
        and ${O(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${In[n.classification]??""}</p>
      </div>
      ${Ut(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${ne(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${ne(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${on(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Vn(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Yt(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Yt(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Gn(e)}
    ${Ut(e)}`}function rn(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${p(e)}</b>, on today's network and under the plan.</p>
      <p>This is the only view here with a clock on it. The time starts when a
         rider is ready to leave, not when they board, so the wait for the bus
         counts \u2014 which is the one place a changed headway shows up as minutes
         of someone's morning rather than as a trip count.</p>
      <p>The answer is a spread, not a departure: the trip is timed from every
         minute of the morning peak and what is shown is the median, with the
         best and worst minute beside it.</p>
      <p class="muted">It takes a moment \u2014 both networks are routed from
         scratch for the two points you choose, twice over, because the
         connections between buses are not published by either feed and have to
         be assumed.</p>
    </div>`}function an(e){let t=e?e.radii[Ne].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Fe}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Wt}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Yn=[-79.9959,40.4406],Un="#e2574c",k=400,N=null,b=null,x=0,f={key:"downtown"},$=null,sn=!1,m="dots",Ke=[],s=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Yn,zoom:12});s.addControl(new maplibregl.NavigationControl,"top-right");s.on("load",()=>{We(s),at(s),bt(s,"change-dots"),kt(s,"change-dots"),Dt(s,"walk-fill"),Ht(s,"change-dots"),en(s),pe(d("panel")),s.on("click",t=>{if(sn){ze({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(a=>s.getLayoutProperty(a,"visibility")!=="none"),o=s.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];mn(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});s.on("mouseenter","change-dots",()=>{s.getCanvas().style.cursor="pointer"}),s.on("mouseleave","change-dots",()=>{s.getCanvas().style.cursor="",e.remove()}),s.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=fe();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(lt(n.properties,w(),o.buckets)).addTo(s)}),s.on("mouseenter","oneseat-dots",()=>{s.getCanvas().style.cursor="pointer"}),s.on("mouseleave","oneseat-dots",()=>{s.getCanvas().style.cursor="",e.remove()}),s.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=F();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Tt(n.properties,o)).addTo(s)}),s.on("mousemove",je[0],t=>{let n=t.features?.[0];!n||!ee()||e.setLngLat(t.lngLat).setHTML(Jt(n.properties)).addTo(s)}),s.on("mouseleave",je[0],()=>{e.remove()}),s.on("moveend",y),re("[data-radius]",t=>{k=Number(t.dataset.radius),be(s,k,w()).then(y),V()&&ke(s,k,w()).then(y),F()&&ln(),b&&Ve(b.lat,b.lon)}),re("[data-day]",t=>{let n=t.dataset.day;nt(n),ge(s,n),Se(s,n),m==="journey"&&b&&Ie(b.lat,b.lon),W()&&St(s,n).then(y),y()}),re("[data-view]",t=>{let n=m;m=t.dataset.view,s.setLayoutProperty("change-dots","visibility",m==="dots"||m==="both"?"visible":"none"),Zn(m==="surface"||m==="both"),Xn(m==="corridors"),to(m==="oneseat"),eo(m==="journey",n==="journey"),Qn(m!=="corridors"&&m!=="journey");let o=m==="oneseat"||m==="journey";d("dest-controls").classList.toggle("hidden",!o),o||ae(!1),dn()}),d("zone-toggle").addEventListener("click",()=>{qn(!ee())}),re("[data-dest]",t=>{let n=t.dataset.dest;if(n==="pin"){ae(!0);return}ae(!1),ze({key:n})}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(st(s,n.dataset.bucket,w()),y())}),d("legend-reset").addEventListener("click",()=>{it(s,w()),y()}),be(s,k,w()).then(y),ro(),oo()});function re(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n)})})}function y(){if(Wn(),!ee())return;let e=Pe();e&&d("legend").insertAdjacentHTML("beforeend",At(e.totals))}function Wn(){if(d("legend-reset").classList.toggle("hidden",$e()||De()||Je()),Je()){d("legend").innerHTML=an(oe());return}if($e()){let n=W();n&&Et(d("legend"),n);return}if(De()){let n=F();if(!n)return;let o=s.getBounds();Pt(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=fe();if(!e)return;let t=s.getBounds();jt(d("legend"),e,w(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},pt()?V():null)}async function Zn(e){if(e&&!V()){d("legend").classList.add("loading");try{await ke(s,k,w())}finally{d("legend").classList.remove("loading")}}gt(s,e),y()}async function qn(e){e&&!Pe()&&await zt(s),Bt(s,e),d("zone-toggle").classList.toggle("active",e),y()}async function Xn(e){if(e&&!W()){d("legend").classList.add("loading");try{await xe(s,w())}finally{d("legend").classList.remove("loading")}}_t(s,e),y()}function Qn(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function eo(e,t=!1){if(tn(s,e),y(),!e){t&&(b?Ve(b.lat,b.lon):pe(d("panel")));return}oe()&&b?d("panel").innerHTML=He(oe(),Be()):d("panel").innerHTML=rn(Be())}async function Ie(e,t){let n=++x;b={lat:e,lon:t},pn(e,t);let o=un(),r=p(Be());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let a=await h(nn({lat:e,lon:t},o,w()));if(n!==x)return;Ae(s,a),d("panel").innerHTML=He(a,r),y()}catch(a){if(n!==x)return;Ae(s,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}}async function to(e){e&&!F()&&await cn(()=>Ce(s,k,f)),Mt(s,e),y()}async function ln(){await cn(()=>Ce(s,k,f)),y()}async function cn(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function ze(e){if(f=e,ae(!1),no(),dn(),m==="journey"){b&&Ie(b.lat,b.lon),y();return}ln()}function dn(){let e=un();if(!(e!==null&&(m==="journey"||m==="oneseat"&&"lat"in f))){$?.remove(),$=null;return}$?$.setLngLat([e.lon,e.lat]).addTo(s):($=new maplibregl.Marker({color:Re,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(s),$.on("dragend",()=>{let n=$.getLngLat();ze({lat:n.lat,lon:n.lng})}))}function no(){let e=Ct(f);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function un(){if("lat"in f)return{lat:f.lat,lon:f.lon};let e=f.key,t=Ke.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Be(){if("lat"in f)return`${f.lat.toFixed(4)}, ${f.lon.toFixed(4)}`;let e=f.key;return Ke.find(t=>t.key===e)?.name??e}function ae(e){sn=e,s.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Ve(e,t){let n=++x;b={lat:e,lon:t},d("panel").classList.add("loading"),pn(e,t);try{let o="lat"in f?`&dest_lat=${f.lat.toFixed(6)}&dest_lon=${f.lon.toFixed(6)}`:"",r=await h(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${k}${o}`);if(n!==x)return;Ze(s,e,t,k,r.current.stops,r.proposed.stops),me(r)}catch(o){if(n!==x)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===x&&d("panel").classList.remove("loading")}}function pn(e,t){N?N.setLngLat([t,e]):(N=new maplibregl.Marker({color:Un,draggable:!0}).setLngLat([t,e]).addTo(s),N.on("dragend",()=>{let n=N.getLngLat();mn(n.lat,n.lng)}))}function mn(e,t){if(m==="journey"){Ie(e,t);return}Ve(e,t)}async function oo(){try{Ke=await h("/api/destinations")}catch{}}async function ro(){try{let e=await h("/api/meta");d("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,d("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
