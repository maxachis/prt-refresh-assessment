"use strict";(()=>{function u(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function f(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Q(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Z(e){return e>0?`+${e}`:String(e)}function Oe(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var vt="#4aa3ff",Lt="#ffa23a";function St(e,t,n,o=96){let a=[],s=n/111320,c=n/(111320*Math.cos(e*Math.PI/180));for(let r=0;r<=o;r++){let l=r/o*2*Math.PI;a.push([t+c*Math.cos(l),e+s*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function w(e){return{type:"FeatureCollection",features:e}}function xe(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Ce(e){e.addSource("walk",{type:"geojson",data:w([])}),e.addSource("stops-now",{type:"geojson",data:w([])}),e.addSource("stops-prop",{type:"geojson",data:w([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Lt,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":vt,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function Re(e,t,n,o,a,s){e.getSource("walk").setData(w([St(t,n,o)])),e.getSource("stops-now").setData(w(xe(a,"current"))),e.getSource("stops-prop").setData(w(xe(s,"proposed")))}var g=["weekday","saturday","sunday"],ee=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],De={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},_e=e=>3+3*e,Ee=e=>4+3*e,P=e=>5+3*e;var te=e=>2+2*e,ne=e=>3+2*e;var oe=null,k="weekday";function h(){return k}function Te(e,t=!0){k=e,t&&oe&&ae(oe)}function Be(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of four ways depending on
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
      <p>Click anywhere on the map for the full before-and-after.</p>
      <p class="muted">Both networks are measured inside the same circle, so
         renumbered routes and consolidated stops don't distort the comparison.
         Switch day type in the toolbar: some places keep every weekday bus and
         lose the weekend entirely.</p>
    </div>`}function wt(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function kt(e,t){let n=Math.max(1,...ee.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return ee.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,c=s-a,r=c>0?"up":c<0?"down":"flat";return`
      <tr>
        <th>${De[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${r}">${c===0?"\xB7":Z(c)}</td>
      </tr>`}).join("")}function T(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Me(e){return e.first==null?'<span class="muted">no service</span>':`${Q(e.first)} \u2013 ${Q(e.last)}`}function Pe(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var $t={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"};function Ot(e){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(n=>{let o=T(n.current),a=T(n.proposed),s=n.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${o}</div>
         <div class="rrow"><span class="rlab">proposed</span>${a}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(n.name)}</span>
          <span class="os-status ${p(n.status)}">${$t[n.status]??n.status}</span>
        </div>
        <div class="os-routes">${s}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function ae(e){oe=e;let t=document.getElementById("panel"),n=e.current.days[k],o=e.proposed.days[k],a=o.trips-n.trips,s=a>0?"up":a<0?"down":"flat",c=e.place?.hood||e.place?.muni||"this location",r=Pe(n),l=Pe(o);t.innerHTML=`
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
      <div class="hl-delta ${s}">
        ${a===0?"no change":`${Z(a)} trips`}
        <div class="muted">${Oe(n.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${k==="weekday"?"weekday":k}, both directions</div>

    <div class="tiers">${wt(n.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${kt(n,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${Me(n)} <span class="muted">\u2192</span> ${Me(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${r==null?"\u2014":`${r} min`} <span class="muted">\u2192</span> ${l==null?"\u2014":`${l} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${Ot(e.oneseat??[])}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${T(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${T(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var F={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},re="change",A="change-dots",B=null,$=new Set;function se(){return B}function ie(e){return $.has(e)}function Fe(e,t,n,o,a,s,c){let r={};for(let l of n)r[l]=0;for(let l of e){let d=l[0],y=l[1];if(d<a||d>c||y<o||y>s)continue;let b=n[l[P(t)]];b!==void 0&&r[b]++}return r}function xt(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>g.some((o,a)=>t[n[P(a)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(g.flatMap((o,a)=>[[`b${a}`,t[n[P(a)]]],[`c${a}`,n[_e(a)]],[`p${a}`,n[Ee(a)]]]))}}))}}function D(e,t){let n=Object.entries(F).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,F.none[t]]}function Ae(e){return["interpolate",["linear"],["zoom"],9,["*",D(e,"size"),.45],12,D(e,"size"),16,["*",D(e,"size"),1.9]]}function Ne(e){e.addSource(re,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:A,type:"circle",source:re,paint:{"circle-color":D(0,"color"),"circle-radius":Ae(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function le(e,t,n){return B=await f(`/api/change?radius=${t}`),e.getSource(re).setData(xt(B)),ce(e,n),B}function ce(e,t){let n=g.indexOf(t);e.setPaintProperty(A,"circle-color",D(n,"color")),e.setPaintProperty(A,"circle-radius",Ae(n)),de(e,t)}function ze(e,t,n){$.has(t)?$.delete(t):$.add(t),de(e,n)}function He(e,t){$.clear(),de(e,t)}function de(e,t){let n=g.indexOf(t),o=["none",...$];e.setFilter(A,["!",["in",["get",`b${n}`],["literal",o]]])}function je(e,t,n){let o=g.indexOf(t),a=e[`b${o}`],s=n.find(d=>d.key===a)?.label??a,c=e[`c${o}`],r=e[`p${o}`];return`<b>${s}</b><br>${c} \u2192 ${r} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var ue="surface",z="surface-fill",Ke="#6b7280",pe=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Ke],[.138,Ke],[1,"#12a163"],[2,"#0b7a48"]],L="#e8232f",S="#0f79c9",Ge=2,N=null,Je=!1;function H(){return N}function Ve(){return Je}function Ye(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Ge,Math.min(Ge,n))}function Ie(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function We(e,t,n,o,a,s,c,r){let l={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let y=c.lat0+(d[1]+.5)*c.dlat,b=c.lon0+(d[0]+.5)*c.dlon;if(y<o||y>s||b<n||b>a)continue;let C=d[te(t)],R=d[ne(t)],X=Ie(C,R);if(X!=="none")if(X==="ramp"){let $e=Ye(C,R);l[$e<-.138?"less":$e>.138?"more":"same"]+=r}else l[X]+=r}return l}function Ct(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let c=t+s[1]*o,r=c+o,l=n+s[0]*a,d=l+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,c],[d,c],[d,r],[l,r],[l,c]]]},properties:Object.fromEntries(g.flatMap((y,b)=>{let C=s[te(b)],R=s[ne(b)];return[[`k${b}`,Ie(C,R)],[`v${b}`,Ye(C,R)??0]]}))}})}}function Ue(e){return["case",["==",["get",`k${e}`],"gone"],L,["==",["get",`k${e}`],"new"],S,["interpolate",["linear"],["get",`v${e}`],...pe.flatMap(([t,n])=>[t,n])]]}function O(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function qe(e,t){e.addSource(ue,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:z,type:"fill",source:ue,layout:{visibility:"none"},paint:{"fill-color":Ue(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,O(0,.85),13,O(0,.62),16,O(0,.45)]}},t)}async function me(e,t,n){return N=await f(`/api/surface?radius=${t}`),e.getSource(ue).setData(Ct(N)),ye(e,n),N}function ye(e,t){let n=g.indexOf(t);e.setPaintProperty(z,"fill-color",Ue(n)),e.setPaintProperty(z,"fill-opacity",["interpolate",["linear"],["zoom"],9,O(n,.85),13,O(n,.62),16,O(n,.45)])}function Xe(e,t){Je=t,e.setLayoutProperty(z,"visibility",t?"visible":"none")}var fe="corridor",Qe="corridor-lines",G="#8b929c",Rt="#6f7783",K={lost:L,added:S,kept:G};var j=null,Ze=!1;function J(){return j}function ge(){return Ze}function Dt(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function et(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function _t(){let e=t=>["match",["get","klass"],"lost",K.lost,"added",K.added,t];return["interpolate",["linear"],["zoom"],9,e(Rt),14,e(G)]}function Et(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Mt(){return["match",["get","klass"],"kept",.85,.9]}function tt(e,t){e.addSource(fe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Qe,type:"line",source:fe,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":_t(),"line-width":Et(),"line-opacity":Mt()}},t)}async function be(e,t){return j=await f(`/api/corridors?day=${t}`),e.getSource(fe).setData(Dt(j)),j}async function nt(e,t){g.includes(t)&&await be(e,t)}function ot(e,t){Ze=t,e.setLayoutProperty(Qe,"visibility",t?"visible":"none")}var ve="#2b3038",at="#b9bec6",_={loses:{color:L,size:6},gains:{color:S,size:6},keeps:{color:G,size:3},here:{color:ve,size:3.5},none:{color:at,size:1.8}},Y=["loses","gains","keeps","none","here"],he="oneseat",rt="oneseat-dots",V=null,st=!1;function E(){return V}function Le(){return st}function it(e,t,n,o,a,s){let c={};for(let r of t)c[r]=0;for(let r of e){let l=r[0],d=r[1];if(l<o||l>s||d<n||d>a)continue;let y=t[r[3]];y!==void 0&&c[y]++}return c}function Pt(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Tt(){return["match",["get","status"],...Object.entries(_).flatMap(([e,t])=>[e,t.color]),at]}function Bt(){let e=["match",["get","status"],...Object.entries(_).flatMap(([t,n])=>[t,n.size]),_.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function lt(e,t){e.addSource(he,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:rt,type:"circle",source:he,layout:{visibility:"none"},paint:{"circle-color":Tt(),"circle-radius":Bt(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ft(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}async function Se(e,t,n){return V=await f(`/api/oneseat?radius=${t}&${Ft(n)}`),e.getSource(he).setData(Pt(V)),V}function ct(e,t){st=t,e.setLayoutProperty(rt,"visibility",t?"visible":"none")}function we(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function dt(e,t){let n=t.statuses.find(r=>r.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=r=>r.length?r.join(", "):"none",c=we(t);return e.status==="here"?`<b>at ${c}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${c}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var At={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Nt(e){return e.buckets.filter(t=>t.key!=="none")}function zt(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=We(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${pe.map(([r,l])=>`${l} ${((r+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${L}"></i>loses all service</span>
        <span><i style="background:${S}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var Ht=["lost","added","kept"],jt={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Kt={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ut(e,t){let{lostPct:n,addedPct:o}=et(t.km),a=r=>r.toFixed(1),c=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${c}</b> km of street, citywide \u2014 ${Kt[t.day]}
    </div>
    ${Ht.map(r=>`
      <div class="lg-row lg-static">
        <i style="background:${K[r]}"></i>
        <span class="lg-lab">${p(jt[r])}</span>
        <span class="lg-n">${a(t.km[r])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${a(n)}%</b> of today's pavement lost</span>
      <span><b>${a(o)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A piece of street either has a bus on it or it doesn't \u2014
      this is not a walk-access question, so there is no radius here. A place
      can keep full walk access while a specific street loses its only bus, if
      a parallel block picks up the trip instead. See Locations or Surface for
      what you can still reach on foot.</div>`}function pt(e,t,n){let o=t.statuses.map(l=>l.key),a=it(t.points,o,n.west,n.south,n.east,n.north),s=l=>t.statuses.find(d=>d.key===l)?.label??l,c=Y.reduce((l,d)=>l+(a[d]??0),0),r=we(t);e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(r)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk</span>
    </div>
    ${Y.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${_[l].color}"></i>
        <span class="lg-lab">${p(s(l))}</span>
        <span class="lg-n">${(a[l]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Y.map(l=>`${(t.counts[l]??0).toLocaleString()} ${p(s(l))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${p(r)} without transferring?
      No day type and no travel time enter this \u2014 a route serves a place or it
      doesn't \u2014 so a one-seat ride that survives may still be hourly on a
      Sunday, or take an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function mt(e,t,n,o,a){let s=t.buckets.map(d=>d.key),c=Fe(t.points,t.days.indexOf(n),s,o.west,o.south,o.east,o.north),r=Nt(t),l=r.reduce((d,y)=>d+c[y.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${l.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${At[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${r.map(d=>`
      <button class="lg-row ${ie(d.key)?"off":""}" data-bucket="${p(d.key)}"
              aria-pressed="${!ie(d.key)}">
        <i style="background:${F[d.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(d.label)}</span>
        <span class="lg-n">${c[d.key].toLocaleString()}</span>
      </button>`).join("")}
    ${a?zt(a,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var Gt=[-79.9959,40.4406],v=400,ke=null,U=null,I=0,x={key:"downtown"},M=null,gt=!1,i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Gt,zoom:12});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{Ce(i),Ne(i),qe(i,"change-dots"),tt(i,"change-dots"),lt(i,"walk-fill"),Be(u("panel")),i.on("click",t=>{if(gt){yt({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(s=>i.getLayoutProperty(s,"visibility")!=="none"),o=i.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];ft(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=se();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(je(n.properties,h(),o.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=E();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(dt(n.properties,o)).addTo(i)}),i.on("moveend",m),W("[data-radius]",t=>{v=Number(t.dataset.radius),le(i,v,h()).then(m),H()&&me(i,v,h()).then(m),E()&&bt(),U&&ft(U.lat,U.lon)}),W("[data-day]",t=>{let n=t.dataset.day;Te(n),ce(i,n),ye(i,n),J()&&nt(i,n).then(m),m()}),W("[data-view]",t=>{let n=t.dataset.view;i.setLayoutProperty("change-dots","visibility",n==="dots"||n==="both"?"visible":"none"),Jt(n==="surface"||n==="both"),Vt(n==="corridors"),It(n==="oneseat"),Yt(n!=="corridors"),u("dest-controls").classList.toggle("hidden",n!=="oneseat"),n!=="oneseat"&&q(!1)}),W("[data-dest]",t=>{let n=t.dataset.dest;if(n==="pin"){q(!0);return}q(!1),yt({key:n})}),u("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(ze(i,n.dataset.bucket,h()),m())}),u("legend-reset").addEventListener("click",()=>{He(i,h()),m()}),le(i,v,h()).then(m),Wt()});function W(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n)})})}function m(){if(u("legend-reset").classList.toggle("hidden",ge()||Le()),ge()){let n=J();n&&ut(u("legend"),n);return}if(Le()){let n=E();if(!n)return;let o=i.getBounds();pt(u("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=se();if(!e)return;let t=i.getBounds();mt(u("legend"),e,h(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},Ve()?H():null)}async function Jt(e){if(e&&!H()){u("legend").classList.add("loading");try{await me(i,v,h())}finally{u("legend").classList.remove("loading")}}Xe(i,e),m()}async function Vt(e){if(e&&!J()){u("legend").classList.add("loading");try{await be(i,h())}finally{u("legend").classList.remove("loading")}}ot(i,e),m()}function Yt(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}async function It(e){e&&!E()&&await ht(()=>Se(i,v,x)),ct(i,e),m()}async function bt(){await ht(()=>Se(i,v,x)),m()}async function ht(e){u("legend").classList.add("loading");try{return await e()}finally{u("legend").classList.remove("loading")}}function yt(e){x=e,q(!1),"lat"in e?M?M.setLngLat([e.lon,e.lat]).addTo(i):M=new maplibregl.Marker({color:ve}).setLngLat([e.lon,e.lat]).addTo(i):M&&M.remove(),bt()}function q(e){gt=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function ft(e,t){let n=++I;U={lat:e,lon:t},u("panel").classList.add("loading"),ke?ke.setLngLat([t,e]):ke=new maplibregl.Marker({color:"#e2574c"}).setLngLat([t,e]).addTo(i);try{let o="lat"in x?`&dest_lat=${x.lat.toFixed(6)}&dest_lon=${x.lon.toFixed(6)}`:"",a=await f(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${v}${o}`);if(n!==I)return;Re(i,e,t,v,a.current.stops,a.proposed.stops),ae(a)}catch(o){if(n!==I)return;u("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===I&&u("panel").classList.remove("loading")}}async function Wt(){try{let e=await f("/api/meta");u("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,u("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}u("methods-open").addEventListener("click",()=>u("methods").classList.add("open"));u("methods-close").addEventListener("click",()=>u("methods").classList.remove("open"));})();
