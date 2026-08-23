"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function g(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function R(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function re(e){return e>0?`+${e}`:String(e)}function He(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Zt="#4aa3ff",en="#ffa23a";function tn(e,t,n,o=96){let r=[],a=n/111320,c=n/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=o;s++){let l=s/o*2*Math.PI;r.push([t+c*Math.cos(l),e+a*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function O(e){return{type:"FeatureCollection",features:e}}function Be(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ze(e){e.addSource("walk",{type:"geojson",data:O([])}),e.addSource("stops-now",{type:"geojson",data:O([])}),e.addSource("stops-prop",{type:"geojson",data:O([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":en,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Zt,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let r=o.features?.[0];if(!r)return;let a=r.properties;t.setLngLat(o.lngLat).setHTML(`<b>${a.name}</b><br>${a.side==="current"?"today":"proposed"}
                  \xB7 stop ${a.stop_id} \xB7 ${a.metres} m`).addTo(e)})}function Ke(e,t,n,o,r,a){e.getSource("walk").setData(O([tn(t,n,o)])),e.getSource("stops-now").setData(O(Be(r,"current"))),e.getSource("stops-prop").setData(O(Be(a,"proposed")))}var w=["weekday","saturday","sunday"],ae=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Ie={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ge=e=>3+3*e,Ve=e=>4+3*e,N=e=>5+3*e;var se=e=>2+2*e,ie=e=>3+2*e;var le=null,C="weekday";function v(){return C}function We(e,t=!0){C=e,t&&le&&ue(le)}function ce(e){e.innerHTML=`
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
    </div>`}function nn(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function on(e,t){let n=Math.max(1,...ae.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return ae.map(o=>{let r=e.periods[o]??0,a=t.periods[o]??0,c=a-r,s=c>0?"up":c<0?"down":"flat";return`
      <tr>
        <th>${Ie[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${a/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${a}</td>
        <td class="n ${s}">${c===0?"\xB7":re(c)}</td>
      </tr>`}).join("")}function A(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Ye(e){return e.first==null?'<span class="muted">no service</span>':`${R(e.first)} \u2013 ${R(e.last)}`}function Ue(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var rn={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"};function an(e){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(n=>{let o=A(n.current),r=A(n.proposed),a=n.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${o}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(n.name)}</span>
          <span class="os-status ${p(n.status)}">${rn[n.status]??n.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function ue(e){le=e;let t=document.getElementById("panel"),n=e.current.days[C],o=e.proposed.days[C],r=o.trips-n.trips,a=r>0?"up":r<0?"down":"flat",c=e.place?.hood||e.place?.muni||"this location",s=Ue(n),l=Ue(o);t.innerHTML=`
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
        ${r===0?"no change":`${re(r)} trips`}
        <div class="muted">${He(n.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${C==="weekday"?"weekday":C}, both directions</div>

    <div class="tiers">${nn(n.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${on(n,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${Ye(n)} <span class="muted">\u2192</span> ${Ye(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${l==null?"\u2014":`${l} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${an(e.oneseat??[])}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${A(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${A(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var B={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},de="change",z="change-dots",H=null,D=new Set;function pe(){return H}function me(e){return D.has(e)}function qe(e,t,n,o,r,a,c){let s={};for(let l of n)s[l]=0;for(let l of e){let u=l[0],b=l[1];if(u<r||u>c||b<o||b>a)continue;let L=n[l[N(t)]];L!==void 0&&s[L]++}return s}function sn(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>w.some((o,r)=>t[n[N(r)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(w.flatMap((o,r)=>[[`b${r}`,t[n[N(r)]]],[`c${r}`,n[Ge(r)]],[`p${r}`,n[Ve(r)]]]))}}))}}function P(e,t){let n=Object.entries(B).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,B.none[t]]}function Xe(e){return["interpolate",["linear"],["zoom"],9,["*",P(e,"size"),.45],12,P(e,"size"),16,["*",P(e,"size"),1.9]]}function Qe(e){e.addSource(de,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:z,type:"circle",source:de,paint:{"circle-color":P(0,"color"),"circle-radius":Xe(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function ye(e,t,n){return H=await g(`/api/change?radius=${t}`),e.getSource(de).setData(sn(H)),fe(e,n),H}function fe(e,t){let n=w.indexOf(t);e.setPaintProperty(z,"circle-color",P(n,"color")),e.setPaintProperty(z,"circle-radius",Xe(n)),he(e,t)}function Ze(e,t,n){D.has(t)?D.delete(t):D.add(t),he(e,n)}function et(e,t){D.clear(),he(e,t)}function he(e,t){let n=w.indexOf(t),o=["none",...D];e.setFilter(z,["!",["in",["get",`b${n}`],["literal",o]]])}function tt(e,t,n){let o=w.indexOf(t),r=e[`b${o}`],a=n.find(u=>u.key===r)?.label??r,c=e[`c${o}`],s=e[`p${o}`];return`<b>${a}</b><br>${c} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var be="surface",I="surface-fill",nt="#6b7280",ge=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,nt],[.138,nt],[1,"#12a163"],[2,"#0b7a48"]],k="#e8232f",$="#0f79c9",ot=2,K=null,rt=!1;function G(){return K}function at(){return rt}function st(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-ot,Math.min(ot,n))}function it(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function lt(e,t,n,o,r,a,c,s){let l={gone:0,less:0,same:0,more:0,new:0};for(let u of e){let b=c.lat0+(u[1]+.5)*c.dlat,L=c.lon0+(u[0]+.5)*c.dlon;if(b<o||b>a||L<n||L>r)continue;let T=u[se(t)],E=u[ie(t)],oe=it(T,E);if(oe!=="none")if(oe==="ramp"){let Ae=st(T,E);l[Ae<-.138?"less":Ae>.138?"more":"same"]+=s}else l[oe]+=s}return l}function ln(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(a=>{let c=t+a[1]*o,s=c+o,l=n+a[0]*r,u=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,c],[u,c],[u,s],[l,s],[l,c]]]},properties:Object.fromEntries(w.flatMap((b,L)=>{let T=a[se(L)],E=a[ie(L)];return[[`k${L}`,it(T,E)],[`v${L}`,st(T,E)??0]]}))}})}}function ct(e){return["case",["==",["get",`k${e}`],"gone"],k,["==",["get",`k${e}`],"new"],$,["interpolate",["linear"],["get",`v${e}`],...ge.flatMap(([t,n])=>[t,n])]]}function M(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function ut(e,t){e.addSource(be,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:I,type:"fill",source:be,layout:{visibility:"none"},paint:{"fill-color":ct(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,M(0,.85),13,M(0,.62),16,M(0,.45)]}},t)}async function we(e,t,n){return K=await g(`/api/surface?radius=${t}`),e.getSource(be).setData(ln(K)),ve(e,n),K}function ve(e,t){let n=w.indexOf(t);e.setPaintProperty(I,"fill-color",ct(n)),e.setPaintProperty(I,"fill-opacity",["interpolate",["linear"],["zoom"],9,M(n,.85),13,M(n,.62),16,M(n,.45)])}function dt(e,t){rt=t,e.setLayoutProperty(I,"visibility",t?"visible":"none")}var Le="corridor",pt="corridor-lines",U="#8b929c",cn="#6f7783",Y={lost:k,added:$,kept:U};var V=null,mt=!1;function W(){return V}function Se(){return mt}function un(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function yt(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function dn(){let e=t=>["match",["get","klass"],"lost",Y.lost,"added",Y.added,t];return["interpolate",["linear"],["zoom"],9,e(cn),14,e(U)]}function pn(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function mn(){return["match",["get","klass"],"kept",.85,.9]}function ft(e,t){e.addSource(Le,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:pt,type:"line",source:Le,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":dn(),"line-width":pn(),"line-opacity":mn()}},t)}async function ke(e,t){return V=await g(`/api/corridors?day=${t}`),e.getSource(Le).setData(un(V)),V}async function ht(e,t){w.includes(t)&&await ke(e,t)}function bt(e,t){mt=t,e.setLayoutProperty(pt,"visibility",t?"visible":"none")}var xe="#2b3038",gt="#b9bec6",j={loses:{color:k,size:6},gains:{color:$,size:6},keeps:{color:U,size:3},here:{color:xe,size:3.5},none:{color:gt,size:1.8}},X=["loses","gains","keeps","none","here"],$e="oneseat",wt="oneseat-dots",q=null,vt=!1;function J(){return q}function _e(){return vt}function Lt(e,t,n,o,r,a){let c={};for(let s of t)c[s]=0;for(let s of e){let l=s[0],u=s[1];if(l<o||l>a||u<n||u>r)continue;let b=t[s[3]];b!==void 0&&c[b]++}return c}function yn(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function fn(){return["match",["get","status"],...Object.entries(j).flatMap(([e,t])=>[e,t.color]),gt]}function hn(){let e=["match",["get","status"],...Object.entries(j).flatMap(([t,n])=>[t,n.size]),j.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function St(e,t){e.addSource($e,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:wt,type:"circle",source:$e,layout:{visibility:"none"},paint:{"circle-color":fn(),"circle-radius":hn(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function bn(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var gn="pin";function kt(e){return"key"in e?e.key:gn}async function Re(e,t,n){return q=await g(`/api/oneseat?radius=${t}&${bn(n)}`),e.getSource($e).setData(yn(q)),q}function $t(e,t){vt=t,e.setLayoutProperty(wt,"visibility",t?"visible":"none")}function Oe(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function xt(e,t){let n=t.statuses.find(s=>s.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),r=(e.proposed||"").split(";").filter(Boolean),a=s=>s.length?s.join(", "):"none",c=Oe(t);return e.status==="here"?`<b>at ${c}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${c}<br>today: ${a(o)}<br>proposed: ${a(r)}`}var wn={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function vn(e){return e.buckets.filter(t=>t.key!=="none")}function Ln(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=lt(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),a=s=>s.toFixed(s<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${ge.map(([s,l])=>`${l} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${k}"></i>loses all service</span>
        <span><i style="background:${$}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${a(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${a(r.less)}</b> km\xB2 less</span>
        <span><b>${a(r.more)}</b> km\xB2 more</span>
        <span><b>${a(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var Sn=["lost","added","kept"],kn={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},$n={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function _t(e,t){let{lostPct:n,addedPct:o}=yt(t.km),r=s=>s.toFixed(1),c=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${c}</b> km of street, citywide \u2014 ${$n[t.day]}
    </div>
    ${Sn.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${Y[s]}"></i>
        <span class="lg-lab">${p(kn[s])}</span>
        <span class="lg-n">${r(t.km[s])} km</span>
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
      what you can still reach on foot.</div>`}function Rt(e,t,n){let o=t.statuses.map(l=>l.key),r=Lt(t.points,o,n.west,n.south,n.east,n.north),a=l=>t.statuses.find(u=>u.key===l)?.label??l,c=X.reduce((l,u)=>l+(r[u]??0),0),s=Oe(t);e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(s)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk</span>
    </div>
    ${X.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${j[l].color}"></i>
        <span class="lg-lab">${p(a(l))}</span>
        <span class="lg-n">${(r[l]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${X.map(l=>`${(t.counts[l]??0).toLocaleString()} ${p(a(l))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${p(s)} without transferring?
      No day type and no travel time enter this \u2014 a route serves a place or it
      doesn't \u2014 so a one-seat ride that survives may still be hourly on a
      Sunday, or take an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Ot(e,t,n,o,r){let a=t.buckets.map(u=>u.key),c=qe(t.points,t.days.indexOf(n),a,o.west,o.south,o.east,o.north),s=vn(t),l=s.reduce((u,b)=>u+c[b.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${l.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${wn[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${s.map(u=>`
      <button class="lg-row ${me(u.key)?"off":""}" data-bucket="${p(u.key)}"
              aria-pressed="${!me(u.key)}">
        <i style="background:${B[u.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(u.label)}</span>
        <span class="lg-n">${c[u.key].toLocaleString()}</span>
      </button>`).join("")}
    ${r?Ln(r,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var Ce="#4aa3ff",jt="#ffa23a",De="headline",Q="journey",Jt="journey-rides",Ft="journey-walks",xn=[Jt,Ft],Nt=null,At=!1;function ee(){return Nt}function Me(){return At}function _n(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let a=n[r].itinerary;if(a)for(let c of a.legs){let s=c.from??e.origin,l=c.to??e.destination,u=[[s.lon,s.lat],[l.lon,l.lat]],b=c.path?.length?c.path:u;o.push({type:"Feature",geometry:{type:"LineString",coordinates:b},properties:{side:r,kind:c.kind,route:c.route}})}}return{type:"FeatureCollection",features:o}}function Ct(){return["match",["get","side"],"current",Ce,"proposed",jt,Ce]}function Dt(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Ht(e,t){e.addSource(Q,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Jt,type:"line",source:Q,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Ct(),"line-width":Dt(1),"line-opacity":.85}},t),e.addLayer({id:Ft,type:"line",source:Q,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Ct(),"line-width":Dt(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Bt(e,t){At=t;for(let n of xn)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Te(e,t){Nt=t;let n=t?_n(t,De):{type:"FeatureCollection",features:[]};e.getSource(Q).setData(n)}function zt(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Mt=e=>`${e.toFixed(1)} min`;function Kt(e){return e==null?"\u2014":e===0?"no change":e>0?`${Mt(e)} slower`:`${Mt(-e)} faster`}function Tt(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function Rn(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Tt(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Tt(e.to,"the destination")}</span></div>`}function Et(e,t){let n=[],o=null;for(let r of e.legs){let a=o?Math.round(r.depart-o.arrive):0;a>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${a} min</span></div>`),n.push(Rn(r,t)),o=r}return n.join("")}var On={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Z(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Cn(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Dn(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Z(t.current)} \u2192
        ${Z(t.proposed)} min</span>
        <span class="muted">${Kt(t.change_min)}</span></div>
      ${o}
    </div>`}function Pt(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Ee(e,t){let n=e.radii[De],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${p(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${R(e.window.start_min)}
        and ${R(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${On[n.classification]??""}</p>
      </div>
      ${Pt(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Z(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Z(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Kt(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Cn(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Et(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Et(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Dn(e)}
    ${Pt(e)}`}function It(e){return`
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
    </div>`}function Gt(e){let t=e?e.radii[De].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Ce}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${jt}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Mn=[-79.9959,40.4406],Tn="#e2574c",S=400,F=null,h=null,_=0,y={key:"downtown"},x=null,Vt=!1,m="dots",Je=[],i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Mn,zoom:12});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{ze(i),Qe(i),ut(i,"change-dots"),ft(i,"change-dots"),St(i,"walk-fill"),Ht(i),ce(d("panel")),i.on("click",t=>{if(Vt){Pe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(a=>i.getLayoutProperty(a,"visibility")!=="none"),o=i.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Qt(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=pe();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(tt(n.properties,v(),o.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=J();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(xt(n.properties,o)).addTo(i)}),i.on("moveend",f),te("[data-radius]",t=>{S=Number(t.dataset.radius),ye(i,S,v()).then(f),G()&&we(i,S,v()).then(f),J()&&Yt(),h&&Ne(h.lat,h.lon)}),te("[data-day]",t=>{let n=t.dataset.day;We(n),fe(i,n),ve(i,n),m==="journey"&&h&&Fe(h.lat,h.lon),W()&&ht(i,n).then(f),f()}),te("[data-view]",t=>{let n=m;m=t.dataset.view,i.setLayoutProperty("change-dots","visibility",m==="dots"||m==="both"?"visible":"none"),En(m==="surface"||m==="both"),Pn(m==="corridors"),Fn(m==="oneseat"),Jn(m==="journey",n==="journey"),jn(m!=="corridors"&&m!=="journey");let o=m==="oneseat"||m==="journey";d("dest-controls").classList.toggle("hidden",!o),o||ne(!1),Wt()}),te("[data-dest]",t=>{let n=t.dataset.dest;if(n==="pin"){ne(!0);return}ne(!1),Pe({key:n})}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(Ze(i,n.dataset.bucket,v()),f())}),d("legend-reset").addEventListener("click",()=>{et(i,v()),f()}),ye(i,S,v()).then(f),Hn(),An()});function te(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n)})})}function f(){if(d("legend-reset").classList.toggle("hidden",Se()||_e()||Me()),Me()){d("legend").innerHTML=Gt(ee());return}if(Se()){let n=W();n&&_t(d("legend"),n);return}if(_e()){let n=J();if(!n)return;let o=i.getBounds();Rt(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=pe();if(!e)return;let t=i.getBounds();Ot(d("legend"),e,v(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},at()?G():null)}async function En(e){if(e&&!G()){d("legend").classList.add("loading");try{await we(i,S,v())}finally{d("legend").classList.remove("loading")}}dt(i,e),f()}async function Pn(e){if(e&&!W()){d("legend").classList.add("loading");try{await ke(i,v())}finally{d("legend").classList.remove("loading")}}bt(i,e),f()}function jn(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function Jn(e,t=!1){if(Bt(i,e),f(),!e){t&&(h?Ne(h.lat,h.lon):ce(d("panel")));return}ee()&&h?d("panel").innerHTML=Ee(ee(),je()):d("panel").innerHTML=It(je())}async function Fe(e,t){let n=++_;h={lat:e,lon:t},Xt(e,t);let o=qt(),r=p(je());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let a=await g(zt({lat:e,lon:t},o,v()));if(n!==_)return;Te(i,a),d("panel").innerHTML=Ee(a,r),f()}catch(a){if(n!==_)return;Te(i,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}}async function Fn(e){e&&!J()&&await Ut(()=>Re(i,S,y)),$t(i,e),f()}async function Yt(){await Ut(()=>Re(i,S,y)),f()}async function Ut(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function Pe(e){if(y=e,ne(!1),Nn(),Wt(),m==="journey"){h&&Fe(h.lat,h.lon),f();return}Yt()}function Wt(){let e=qt();if(!(e!==null&&(m==="journey"||m==="oneseat"&&"lat"in y))){x?.remove(),x=null;return}x?x.setLngLat([e.lon,e.lat]).addTo(i):(x=new maplibregl.Marker({color:xe,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(i),x.on("dragend",()=>{let n=x.getLngLat();Pe({lat:n.lat,lon:n.lng})}))}function Nn(){let e=kt(y);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function qt(){if("lat"in y)return{lat:y.lat,lon:y.lon};let e=y.key,t=Je.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function je(){if("lat"in y)return`${y.lat.toFixed(4)}, ${y.lon.toFixed(4)}`;let e=y.key;return Je.find(t=>t.key===e)?.name??e}function ne(e){Vt=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Ne(e,t){let n=++_;h={lat:e,lon:t},d("panel").classList.add("loading"),Xt(e,t);try{let o="lat"in y?`&dest_lat=${y.lat.toFixed(6)}&dest_lon=${y.lon.toFixed(6)}`:"",r=await g(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${S}${o}`);if(n!==_)return;Ke(i,e,t,S,r.current.stops,r.proposed.stops),ue(r)}catch(o){if(n!==_)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===_&&d("panel").classList.remove("loading")}}function Xt(e,t){F?F.setLngLat([t,e]):(F=new maplibregl.Marker({color:Tn,draggable:!0}).setLngLat([t,e]).addTo(i),F.on("dragend",()=>{let n=F.getLngLat();Qt(n.lat,n.lng)}))}function Qt(e,t){if(m==="journey"){Fe(e,t);return}Ne(e,t)}async function An(){try{Je=await g("/api/destinations")}catch{}}async function Hn(){try{let e=await g("/api/meta");d("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,d("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
