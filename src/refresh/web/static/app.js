"use strict";(()=>{function i(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function v(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function y(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function M(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function fe(e){return e>0?`+${e}`:String(e)}function Ze(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Ln="#4aa3ff",kn="#ffa23a";function $n(e,t,n,o=96){let a=[],r=n/111320,c=n/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=o;s++){let d=s/o*2*Math.PI;a.push([t+c*Math.cos(d),e+r*Math.sin(d)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function T(e){return{type:"FeatureCollection",features:e}}function et(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function tt(e){e.addSource("walk",{type:"geojson",data:T([])}),e.addSource("stops-now",{type:"geojson",data:T([])}),e.addSource("stops-prop",{type:"geojson",data:T([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":kn,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Ln,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let r=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${r.name}</b><br>${r.side==="current"?"today":"proposed"}
                  \xB7 stop ${r.stop_id} \xB7 ${r.metres} m`).addTo(e)})}function nt(e,t,n,o,a,r){e.getSource("walk").setData(T([$n(t,n,o)])),e.getSource("stops-now").setData(T(et(a,"current"))),e.getSource("stops-prop").setData(T(et(r,"proposed")))}var L=["weekday","saturday","sunday"],ge=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],ot={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},at=e=>3+3*e,rt=e=>4+3*e,V=e=>5+3*e;var be=e=>2+2*e,we=e=>3+2*e;var ve=null,P="weekday";function S(){return P}function lt(e,t=!0){P=e,t&&ve&&Le(ve)}function Se(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
         the view chosen in the toolbar on the map. Pan and zoom to read a
         neighbourhood.</p>
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
         Switch day type in the toolbar on the map: some places keep every
         weekday bus and lose the weekend entirely. The line above this panel
         always says which day and which walk radius its numbers are
         measured at.</p>
    </div>`}function xn(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function _n(e,t){let n=Math.max(1,...ge.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return ge.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,c=r-a,s=c>0?"up":c<0?"down":"flat";return`
      <tr>
        <th>${ot[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${s}">${c===0?"\xB7":fe(c)}</td>
      </tr>`}).join("")}function G(e){return e.length?e.map(t=>`<span class="route">${y(t)}</span>`).join(" "):'<span class="muted">none</span>'}function st(e){return e.first==null?'<span class="muted">no service</span>':`${M(e.first)} \u2013 ${M(e.last)}`}function it(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var On={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Rn={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Dn(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=G(o.current),r=G(o.proposed),c=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${a}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${y(o.name)}</span>
          <span class="os-status ${y(o.status)}">${On[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${c}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. ${t==="any"?`Counted on any calendar, which is the published measure \u2014 no day
             type enters it.`:`Restricted to routes running on ${Rn[t]??t},
             which is not the published measure \u2014 that one counts a route
             calling here on any calendar.`}
        It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function Le(e){ve=e;let t=document.getElementById("panel"),n=e.current.days[P],o=e.proposed.days[P],a=o.trips-n.trips,r=a>0?"up":a<0?"down":"flat",c=e.place?.hood||e.place?.muni||"this location",s=it(n),d=it(o);t.innerHTML=`
    <div class="place-head">
      <h2>${y(c)}</h2>
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
      <div class="hl-delta ${r}">
        ${a===0?"no change":`${fe(a)} trips`}
        <div class="muted">${Ze(n.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${P==="weekday"?"weekday":P}, both directions</div>

    <div class="tiers">${xn(n.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${_n(n,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${st(n)} <span class="muted">\u2192</span> ${st(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${d==null?"\u2014":`${d} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${Dn(e.oneseat??[],e.oneseat_day??"any")}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${G(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${G(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var U={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ke="change",q="change-dots",W=null,A=new Set;function $e(){return W}function xe(e){return A.has(e)}function ct(e,t,n,o,a,r,c){let s={};for(let d of n)s[d]=0;for(let d of e){let p=d[0],m=d[1];if(p<a||p>c||m<o||m>r)continue;let g=n[d[V(t)]];g!==void 0&&s[g]++}return s}function Cn(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>L.some((o,a)=>t[n[V(a)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(L.flatMap((o,a)=>[[`b${a}`,t[n[V(a)]]],[`c${a}`,n[at(a)]],[`p${a}`,n[rt(a)]]]))}}))}}function N(e,t){let n=Object.entries(U).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,U.none[t]]}function dt(e){return["interpolate",["linear"],["zoom"],9,["*",N(e,"size"),.45],12,N(e,"size"),16,["*",N(e,"size"),1.9]]}function ut(e){e.addSource(ke,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:q,type:"circle",source:ke,paint:{"circle-color":N(0,"color"),"circle-radius":dt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function _e(e,t,n){return W=await v(`/api/change?radius=${t}`),e.getSource(ke).setData(Cn(W)),Oe(e,n),W}function Oe(e,t){let n=L.indexOf(t);e.setPaintProperty(q,"circle-color",N(n,"color")),e.setPaintProperty(q,"circle-radius",dt(n)),Re(e,t)}function pt(e,t,n){A.has(t)?A.delete(t):A.add(t),Re(e,n)}function mt(e,t){A.clear(),Re(e,t)}function Re(e,t){let n=L.indexOf(t),o=["none",...A];e.setFilter(q,["!",["in",["get",`b${n}`],["literal",o]]])}function yt(e,t,n){let o=L.indexOf(t),a=e[`b${o}`],r=n.find(p=>p.key===a)?.label??a,c=e[`c${o}`],s=e[`p${o}`];return`<b>${r}</b><br>${c} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var De="surface",Q="surface-fill",ht="#6b7280",Ce=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,ht],[.138,ht],[1,"#12a163"],[2,"#0b7a48"]],O="#e8232f",R="#0f79c9",ft=2,X=null,gt=!1;function Z(){return X}function bt(){return gt}function wt(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-ft,Math.min(ft,n))}function vt(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function St(e,t,n,o,a,r,c,s){let d={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=c.lat0+(p[1]+.5)*c.dlat,g=c.lon0+(p[0]+.5)*c.dlon;if(m<o||m>r||g<n||g>a)continue;let $=p[be(t)],x=p[we(t)],E=vt($,x);if(E!=="none")if(E==="ramp"){let u=wt($,x);d[u<-.138?"less":u>.138?"more":"same"]+=s}else d[E]+=s}return d}function En(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let c=t+r[1]*o,s=c+o,d=n+r[0]*a,p=d+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[d,c],[p,c],[p,s],[d,s],[d,c]]]},properties:Object.fromEntries(L.flatMap((m,g)=>{let $=r[be(g)],x=r[we(g)];return[[`k${g}`,vt($,x)],[`v${g}`,wt($,x)??0]]}))}})}}function Lt(e){return["case",["==",["get",`k${e}`],"gone"],O,["==",["get",`k${e}`],"new"],R,["interpolate",["linear"],["get",`v${e}`],...Ce.flatMap(([t,n])=>[t,n])]]}function j(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function kt(e,t){e.addSource(De,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Q,type:"fill",source:De,layout:{visibility:"none"},paint:{"fill-color":Lt(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,j(0,.85),13,j(0,.62),16,j(0,.45)]}},t)}async function Ee(e,t,n){return X=await v(`/api/surface?radius=${t}`),e.getSource(De).setData(En(X)),Me(e,n),X}function Me(e,t){let n=L.indexOf(t);e.setPaintProperty(Q,"fill-color",Lt(n)),e.setPaintProperty(Q,"fill-opacity",["interpolate",["linear"],["zoom"],9,j(n,.85),13,j(n,.62),16,j(n,.45)])}function $t(e,t){gt=t,e.setLayoutProperty(Q,"visibility",t?"visible":"none")}var Te="corridor",xt="corridor-lines",ne="#8b929c",Mn="#6f7783",te={lost:O,added:R,kept:ne};var ee=null,_t=!1;function oe(){return ee}function Pe(){return _t}function Tn(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Ot(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Pn(){let e=t=>["match",["get","klass"],"lost",te.lost,"added",te.added,t];return["interpolate",["linear"],["zoom"],9,e(Mn),14,e(ne)]}function An(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function jn(){return["match",["get","klass"],"kept",.85,.9]}function Rt(e,t){e.addSource(Te,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:xt,type:"line",source:Te,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Pn(),"line-width":An(),"line-opacity":jn()}},t)}async function Ae(e,t){return ee=await v(`/api/corridors?day=${t}`),e.getSource(Te).setData(Tn(ee)),ee}async function Dt(e,t){L.includes(t)&&await Ae(e,t)}function Ct(e,t){_t=t,e.setLayoutProperty(xt,"visibility",t?"visible":"none")}var Fe="#2b3038",Et="#b9bec6",J={loses:{color:O,size:6},gains:{color:R,size:6},keeps:{color:ne,size:3},here:{color:Fe,size:3.5},none:{color:Et,size:1.8}},re=["loses","gains","keeps","none","here"],je="oneseat",Mt="oneseat-dots",ae=null,Tt=!1;function F(){return ae}function Ne(){return Tt}function Pt(e,t,n,o,a,r){let c={};for(let s of t)c[s]=0;for(let s of e){let d=s[0],p=s[1];if(d<o||d>r||p<n||p>a)continue;let m=t[s[3]];m!==void 0&&c[m]++}return c}function Fn(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Nn(){return["match",["get","status"],...Object.entries(J).flatMap(([e,t])=>[e,t.color]),Et]}function Jn(){let e=["match",["get","status"],...Object.entries(J).flatMap(([t,n])=>[t,n.size]),J.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function At(e,t){e.addSource(je,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Mt,type:"circle",source:je,layout:{visibility:"none"},paint:{"circle-color":Nn(),"circle-radius":Jn(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Hn(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Bn="pin";function jt(e){return"key"in e?e.key:Bn}var se="any";function In(e,t,n){return`radius=${e}&${Hn(t)}&day=${n}`}function Ft(e,t){return e?t:se}function Nt(e,t){return e!=="oneseat"||t}async function Je(e,t,n,o=se){return ae=await v(`/api/oneseat?${In(t,n,o)}`),e.getSource(je).setData(Fn(ae)),ae}function Jt(e,t){Tt=t,e.setLayoutProperty(Mt,"visibility",t?"visible":"none")}function He(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Ht(e,t){let n=t.statuses.find(s=>s.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=s=>s.length?s.join(", "):"none",c=He(t);return e.status==="here"?`<b>at ${c}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${c}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var Be={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function zn(e){return e.buckets.filter(t=>t.key!=="none")}function Kn(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=St(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=s=>s.toFixed(s<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Ce.map(([s,d])=>`${d} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${O}"></i>loses all service</span>
        <span><i style="background:${R}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var Yn=["lost","added","kept"],Vn={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Gn={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Bt(e,t){let{lostPct:n,addedPct:o}=Ot(t.km),a=s=>s.toFixed(1),c=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${c}</b> km of street, citywide \u2014 ${Gn[t.day]}
    </div>
    ${Yn.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${te[s]}"></i>
        <span class="lg-lab">${y(Vn[s])}</span>
        <span class="lg-n">${a(t.km[s])} km</span>
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
      what you can still reach on foot.</div>`}function It(e,t,n){let o=t.statuses.map(m=>m.key),a=Pt(t.points,o,n.west,n.south,n.east,n.north),r=m=>t.statuses.find(g=>g.key===m)?.label??m,c=re.reduce((m,g)=>m+(a[g]??0),0),s=He(t),d=t.day&&t.day!==se,p=d?`Restricted to routes running on ${Be[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${y(s)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${d?` \xB7 ${Be[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${re.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${J[m].color}"></i>
        <span class="lg-lab">${y(r(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${re.map(m=>`${(t.counts[m]??0).toLocaleString()} ${y(r(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${y(s)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function zt(e,t,n,o,a){let r=t.buckets.map(p=>p.key),c=ct(t.points,t.days.indexOf(n),r,o.west,o.south,o.east,o.north),s=zn(t),d=s.reduce((p,m)=>p+c[m.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${d.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${Be[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${s.map(p=>`
      <button class="lg-row ${xe(p.key)?"off":""}" data-bucket="${y(p.key)}"
              aria-pressed="${!xe(p.key)}">
        <i style="background:${U[p.key]?.color??"#666"}"></i>
        <span class="lg-lab">${y(p.label)}</span>
        <span class="lg-n">${c[p.key].toLocaleString()}</span>
      </button>`).join("")}
    ${a?Kn(a,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var Ie="#4aa3ff",qt="#ffa23a",ze="headline",ie="journey",Xt="journey-rides",Qt="journey-walks",Wn=[Xt,Qt],Zt=null,en=!1;function ce(){return Zt}function Ke(){return en}function Un(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let c of r.legs){let s=c.from??e.origin,d=c.to??e.destination,p=[[s.lon,s.lat],[d.lon,d.lat]],m=c.path?.length?c.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:c.kind,route:c.route}})}}return{type:"FeatureCollection",features:o}}function Kt(){return["match",["get","side"],"current",Ie,"proposed",qt,Ie]}function Yt(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function tn(e,t){e.addSource(ie,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Xt,type:"line",source:ie,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Kt(),"line-width":Yt(1),"line-opacity":.85}},t),e.addLayer({id:Qt,type:"line",source:ie,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Kt(),"line-width":Yt(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function nn(e,t){en=t;for(let n of Wn)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Ye(e,t){Zt=t;let n=t?Un(t,ze):{type:"FeatureCollection",features:[]};e.getSource(ie).setData(n)}function on(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Vt=e=>`${e.toFixed(1)} min`;function an(e){return e==null?"\u2014":e===0?"no change":e>0?`${Vt(e)} slower`:`${Vt(-e)} faster`}function Gt(e,t){return e?e.name?y(e.name):`stop ${y(e.stop_id)}`:t}function qn(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Gt(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${y(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Gt(e.to,"the destination")}</span></div>`}function Wt(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(qn(a,t)),o=a}return n.join("")}var Xn={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function le(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Qn(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Zn(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${le(t.current)} \u2192
        ${le(t.proposed)} min</span>
        <span class="muted">${an(t.change_min)}</span></div>
      ${o}
    </div>`}function Ut(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Ve(e,t){let n=e.radii[ze],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${y(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${M(e.window.start_min)}
        and ${M(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Xn[n.classification]??""}</p>
      </div>
      ${Ut(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${le(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${le(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${an(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Qn(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Wt(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Wt(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Zn(e)}
    ${Ut(e)}`}function rn(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${y(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function sn(e){let t=e?e.radii[ze].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Ie}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${qt}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Ge=" \xB7 ",ln={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"};function cn(e){return ln[e]??e}var eo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},to=["oneseat","journey"];function no(e){return e!=="journey"}function oo(e){let t=[ln[e.view]??e.view];return to.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":eo[e.day]),no(e.view)&&t.push(`${e.radius} m walk`),t.join(Ge)}function dn(e){let[t,...n]=oo(e).split(Ge);return`<b>${y(t)}</b>${n.map(o=>Ge+y(o)).join("")}`}var _=["peek","half","full"],ao=192,ro=.3,so=.55,io=.9,lo=.6,co=.45;function de(e,t){return e==="peek"?Math.min(ao,t*ro):e==="half"?t*so:t*io}function uo(e,t,n=0){let o=_.map(r=>Math.abs(de(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>lo&&(a=Math.max(0,Math.min(_.length-1,a+(n>0?1:-1)))),_[a]}function un(e){return _[(_.indexOf(e)+1)%_.length]}function po(e,t){return Math.min(e,t*co)}function H(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}var mo=8,yo=400;function pn(e){let t=i("side"),n=i("sheet-handle"),o="peek",a=!1,r=0,c=0,s=0,d={y:0,t:0};function p(){return window.innerHeight}function m(u){t.style.height=`${u}px`,e.onMove(u,po(u,p()))}function g(u){o=u,t.dataset.snap=u,m(de(u,p()))}n.addEventListener("pointerdown",u=>{H()&&(a=!0,r=u.clientY,c=t.getBoundingClientRect().height,s=u.timeStamp,d={y:u.clientY,t:u.timeStamp},t.classList.add("dragging"),n.setPointerCapture(u.pointerId))}),n.addEventListener("pointermove",u=>{if(!a)return;let Qe=c+(r-u.clientY),Y=de("peek",p()),he=de("full",p());m(Math.max(Y,Math.min(he,Qe))),d={y:u.clientY,t:u.timeStamp}});function $(u){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(u.clientY-r)>mo)&&u.timeStamp-s<yo){g(un(o));return}let Y=u.timeStamp-d.t,he=Y>0?(d.y-u.clientY)/Y:0;g(uo(t.getBoundingClientRect().height,p(),he))}n.addEventListener("pointerup",$),n.addEventListener("pointercancel",$),n.addEventListener("keydown",u=>{u.key!=="Enter"&&u.key!==" "||(u.preventDefault(),H()&&g(un(o)))});let x=null;function E(){let u=H();if(u!==x&&(x=u,e.onLayoutChange(u)),!u){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}g(o)}return window.addEventListener("resize",E),E(),{at:()=>H()?o:"full",atLeast(u){H()&&_.indexOf(u)>_.indexOf(o)&&g(u)}}}var ho=[-79.9959,40.4406],fo="#e2574c",k=400,B=null,f=null,C=0,b={key:"downtown"},D=null,hn=!1,K=!1,h="dots",fn,Ue=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ho,zoom:12,attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{tt(l),ut(l),kt(l,"change-dots"),Rt(l,"change-dots"),At(l,"walk-fill"),tn(l),Se(i("panel")),l.on("click",t=>{if(hn){We({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(r=>l.getLayoutProperty(r,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Sn(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});l.on("mouseenter","change-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","change-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=$e();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(yt(n.properties,S(),o.buckets)).addTo(l)}),l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=F();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Ht(n.properties,o)).addTo(l)}),l.on("moveend",w),I("[data-radius]",t=>{k=Number(t.dataset.radius),_e(l,k,S()).then(w),Z()&&Ee(l,k,S()).then(w),F()&&ue(),f&&z(f.lat,f.lon)}),I("[data-day]",t=>{let n=t.dataset.day;lt(n),Oe(l,n),Me(l,n),h==="journey"&&f&&qe(f.lat,f.lon),oe()&&Dt(l,n).then(w),K&&F()&&(ue(),f&&z(f.lat,f.lon)),w()}),I("[data-oneseat-day]",t=>{K=t.dataset.oneseatDay==="selected",yn(),ue(),f&&z(f.lat,f.lon)}),I("[data-view]",t=>{let n=h;h=t.dataset.view,l.setLayoutProperty("change-dots","visibility",h==="dots"||h==="both"?"visible":"none"),So(h==="surface"||h==="both"),Lo(h==="corridors"),xo(h==="oneseat"),$o(h==="journey",n==="journey"),ko(h!=="corridors"&&h!=="journey");let o=h==="oneseat"||h==="journey";i("dest-controls").classList.toggle("hidden",!o),i("oneseat-day-controls").classList.toggle("hidden",h!=="oneseat"),yn(),o||pe(!1),bn()}),I("[data-dest]",t=>{let n=t.dataset.dest;if(n==="pin"){pe(!0);return}pe(!1),We({key:n})}),i("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(pt(l,n.dataset.bucket,S()),w())}),i("legend-reset").addEventListener("click",()=>{mt(l,S()),w()}),i("legend-collapse").addEventListener("click",()=>{mn(!i("legend-box").classList.contains("collapsed"))}),i("side-toggle").addEventListener("click",wo),fn=pn({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:mn}),go(),ye(),_e(l,k,S()).then(w),Ro(),Oo()});function I(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n),ye()})})}function ye(){i("statebar").innerHTML=dn({view:h,day:S(),radius:k,oneSeatRestricted:K,destination:me()}),bo()}function mn(e){i("legend-box").classList.toggle("collapsed",e);let t=i("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function go(){let e=t=>{i("app").classList.toggle("controls-open",t),i("controls-toggle").setAttribute("aria-expanded",String(t))};i("controls-toggle").addEventListener("click",()=>{e(!i("app").classList.contains("controls-open"))}),i("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function bo(){i("controls-toggle").firstChild?.remove(),i("controls-toggle").prepend(document.createTextNode(cn(h)))}function wo(){let e=i("app").classList.toggle("side-collapsed"),t=i("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function w(){vo()}function vo(){if(i("legend-reset").classList.toggle("hidden",Pe()||Ne()||Ke()),Ke()){i("legend").innerHTML=sn(ce());return}if(Pe()){let n=oe();n&&Bt(i("legend"),n);return}if(Ne()){let n=F();if(!n)return;let o=l.getBounds();It(i("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=$e();if(!e)return;let t=l.getBounds();zt(i("legend"),e,S(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},bt()?Z():null)}async function So(e){if(e&&!Z()){i("legend").classList.add("loading");try{await Ee(l,k,S())}finally{i("legend").classList.remove("loading")}}$t(l,e),w()}async function Lo(e){if(e&&!oe()){i("legend").classList.add("loading");try{await Ae(l,S())}finally{i("legend").classList.remove("loading")}}Ct(l,e),w()}function ko(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function $o(e,t=!1){if(nn(l,e),w(),!e){t&&(f?z(f.lat,f.lon):Se(i("panel")));return}ce()&&f?i("panel").innerHTML=Ve(ce(),me()):i("panel").innerHTML=rn(me())}async function qe(e,t){let n=++C;f={lat:e,lon:t},vn(e,t);let o=wn(),a=y(me());if(!o){i("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}i("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await v(on({lat:e,lon:t},o,S()));if(n!==C)return;Ye(l,r),i("panel").innerHTML=Ve(r,a),w()}catch(r){if(n!==C)return;Ye(l,null),i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function yn(){i("day-controls").classList.toggle("hidden",!Nt(h,K))}function Xe(){return Ft(K,S())}async function xo(e){e&&!F()&&await gn(()=>Je(l,k,b,Xe())),Jt(l,e),w()}async function ue(){await gn(()=>Je(l,k,b,Xe())),w()}async function gn(e){i("legend").classList.add("loading");try{return await e()}finally{i("legend").classList.remove("loading")}}function We(e){if(b=e,pe(!1),_o(),bn(),ye(),h==="journey"){f&&qe(f.lat,f.lon),w();return}ue()}function bn(){let e=wn();if(!(e!==null&&(h==="journey"||h==="oneseat"&&"lat"in b))){D?.remove(),D=null;return}D?D.setLngLat([e.lon,e.lat]).addTo(l):(D=new maplibregl.Marker({color:Fe,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),D.on("dragend",()=>{let n=D.getLngLat();We({lat:n.lat,lon:n.lng})}))}function _o(){let e=jt(b);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function wn(){if("lat"in b)return{lat:b.lat,lon:b.lon};let e=b.key,t=Ue.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function me(){if("lat"in b)return`${b.lat.toFixed(4)}, ${b.lon.toFixed(4)}`;let e=b.key;return Ue.find(t=>t.key===e)?.name??e}function pe(e){hn=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function z(e,t){let n=++C;f={lat:e,lon:t},i("panel").classList.add("loading"),vn(e,t);try{let o="lat"in b?`&dest_lat=${b.lat.toFixed(6)}&dest_lon=${b.lon.toFixed(6)}`:"",a=await v(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${k}${o}&oneseat_day=${Xe()}`);if(n!==C)return;nt(l,e,t,k,a.current.stops,a.proposed.stops),Le(a)}catch(o){if(n!==C)return;i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===C&&i("panel").classList.remove("loading")}}function vn(e,t){B?B.setLngLat([t,e]):(B=new maplibregl.Marker({color:fo,draggable:!0}).setLngLat([t,e]).addTo(l),B.on("dragend",()=>{let n=B.getLngLat();Sn(n.lat,n.lng)}))}function Sn(e,t){if(fn.atLeast("half"),h==="journey"){qe(e,t);return}z(e,t)}async function Oo(){try{Ue=await v("/api/destinations"),ye()}catch{}}async function Ro(){try{let e=await v("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;i("feedline").textContent=t,i("feedline-methods").textContent=t,i("caveats").innerHTML=e.caveats.map(n=>`<li>${n.text}</li>`).join("")}catch{}}i("methods-open").addEventListener("click",()=>i("methods").classList.add("open"));i("methods-close").addEventListener("click",()=>i("methods").classList.remove("open"));})();
