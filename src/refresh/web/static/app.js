"use strict";(()=>{function i(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function w(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function y(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function M(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function we(e){return e>0?`+${e}`:String(e)}function it(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var jn="#4aa3ff",Jn="#ffa23a";function Hn(e,t,n,o=96){let a=[],r=n/111320,c=n/(111320*Math.cos(e*Math.PI/180));for(let l=0;l<=o;l++){let d=l/o*2*Math.PI;a.push([t+c*Math.cos(d),e+r*Math.sin(d)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function T(e){return{type:"FeatureCollection",features:e}}function lt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ct(e){e.addSource("walk",{type:"geojson",data:T([])}),e.addSource("stops-now",{type:"geojson",data:T([])}),e.addSource("stops-prop",{type:"geojson",data:T([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Jn,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":jn,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let r=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${r.name}</b><br>${r.side==="current"?"today":"proposed"}
                  \xB7 stop ${r.stop_id} \xB7 ${r.metres} m`).addTo(e)})}function dt(e,t,n,o,a,r){e.getSource("walk").setData(T([Hn(t,n,o)])),e.getSource("stops-now").setData(T(lt(a,"current"))),e.getSource("stops-prop").setData(T(lt(r,"proposed")))}var S=["weekday","saturday","sunday"],Le=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],ut={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},pt=e=>3+3*e,mt=e=>4+3*e,V=e=>5+3*e;var Se=e=>2+2*e,ke=e=>3+2*e;var _e=null,P="weekday";function L(){return P}function ht(e,t=!0){P=e,t&&_e&&$e(_e)}function xe(e){e.innerHTML=`
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
    </div>`}function zn(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Bn(e,t){let n=Math.max(1,...Le.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Le.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,c=r-a,l=c>0?"up":c<0?"down":"flat";return`
      <tr>
        <th>${ut[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${l}">${c===0?"\xB7":we(c)}</td>
      </tr>`}).join("")}function W(e){return e.length?e.map(t=>`<span class="route">${y(t)}</span>`).join(" "):'<span class="muted">none</span>'}function yt(e){return e.first==null?'<span class="muted">no service</span>':`${M(e.first)} \u2013 ${M(e.last)}`}function ft(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var In={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Kn={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Yn(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=W(o.current),r=W(o.proposed),c=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${a}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${y(o.name)}</span>
          <span class="os-status ${y(o.status)}">${In[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${c}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. ${t==="any"?`Counted on any calendar, which is the published measure \u2014 no day
             type enters it.`:`Restricted to routes running on ${Kn[t]??t},
             which is not the published measure \u2014 that one counts a route
             calling here on any calendar.`}
        It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function $e(e){_e=e;let t=document.getElementById("panel"),n=e.current.days[P],o=e.proposed.days[P],a=o.trips-n.trips,r=a>0?"up":a<0?"down":"flat",c=e.place?.hood||e.place?.muni||"this location",l=ft(n),d=ft(o);t.innerHTML=`
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
        ${a===0?"no change":`${we(a)} trips`}
        <div class="muted">${it(n.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${P==="weekday"?"weekday":P}, both directions</div>

    <div class="tiers">${zn(n.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Bn(n,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${yt(n)} <span class="muted">\u2192</span> ${yt(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${l==null?"\u2014":`${l} min`} <span class="muted">\u2192</span> ${d==null?"\u2014":`${d} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${Yn(e.oneseat??[],e.oneseat_day??"any")}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${W(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${W(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var Z={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Oe="change",q="change-dots",U=null,N=new Set;function De(){return U}function Re(e){return N.has(e)}function gt(e,t,n,o,a,r,c){let l={};for(let d of n)l[d]=0;for(let d of e){let p=d[0],m=d[1];if(p<a||p>c||m<o||m>r)continue;let g=n[d[V(t)]];g!==void 0&&l[g]++}return l}function Gn(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>S.some((o,a)=>t[n[V(a)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(S.flatMap((o,a)=>[[`b${a}`,t[n[V(a)]]],[`c${a}`,n[pt(a)]],[`p${a}`,n[mt(a)]]]))}}))}}function j(e,t){let n=Object.entries(Z).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Z.none[t]]}function bt(e){return["interpolate",["linear"],["zoom"],9,["*",j(e,"size"),.45],12,j(e,"size"),16,["*",j(e,"size"),1.9]]}function vt(e){e.addSource(Oe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:q,type:"circle",source:Oe,paint:{"circle-color":j(0,"color"),"circle-radius":bt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function Ce(e,t,n){return U=await w(`/api/change?radius=${t}`),e.getSource(Oe).setData(Gn(U)),Ee(e,n),U}function Ee(e,t){let n=S.indexOf(t);e.setPaintProperty(q,"circle-color",j(n,"color")),e.setPaintProperty(q,"circle-radius",bt(n)),Me(e,t)}function wt(e,t,n){N.has(t)?N.delete(t):N.add(t),Me(e,n)}function Lt(e,t){N.clear(),Me(e,t)}function Me(e,t){let n=S.indexOf(t),o=["none",...N];e.setFilter(q,["!",["in",["get",`b${n}`],["literal",o]]])}function St(e,t,n){let o=S.indexOf(t),a=e[`b${o}`],r=n.find(p=>p.key===a)?.label??a,c=e[`c${o}`],l=e[`p${o}`];return`<b>${r}</b><br>${c} \u2192 ${l} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Te="surface",Q="surface-fill",kt="#6b7280",Pe=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,kt],[.138,kt],[1,"#12a163"],[2,"#0b7a48"]],O="#e8232f",D="#0f79c9",_t=2,X=null,xt=!1;function ee(){return X}function $t(){return xt}function Ot(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-_t,Math.min(_t,n))}function Dt(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Rt(e,t,n,o,a,r,c,l){let d={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=c.lat0+(p[1]+.5)*c.dlat,g=c.lon0+(p[0]+.5)*c.dlon;if(m<o||m>r||g<n||g>a)continue;let _=p[Se(t)],x=p[ke(t)],E=Dt(_,x);if(E!=="none")if(E==="ramp"){let u=Ot(_,x);d[u<-.138?"less":u>.138?"more":"same"]+=l}else d[E]+=l}return d}function Vn(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let c=t+r[1]*o,l=c+o,d=n+r[0]*a,p=d+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[d,c],[p,c],[p,l],[d,l],[d,c]]]},properties:Object.fromEntries(S.flatMap((m,g)=>{let _=r[Se(g)],x=r[ke(g)];return[[`k${g}`,Dt(_,x)],[`v${g}`,Ot(_,x)??0]]}))}})}}function Ct(e){return["case",["==",["get",`k${e}`],"gone"],O,["==",["get",`k${e}`],"new"],D,["interpolate",["linear"],["get",`v${e}`],...Pe.flatMap(([t,n])=>[t,n])]]}function A(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Et(e,t){e.addSource(Te,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Q,type:"fill",source:Te,layout:{visibility:"none"},paint:{"fill-color":Ct(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,A(0,.85),13,A(0,.62),16,A(0,.45)]}},t)}async function Ne(e,t,n){return X=await w(`/api/surface?radius=${t}`),e.getSource(Te).setData(Vn(X)),Ae(e,n),X}function Ae(e,t){let n=S.indexOf(t);e.setPaintProperty(Q,"fill-color",Ct(n)),e.setPaintProperty(Q,"fill-opacity",["interpolate",["linear"],["zoom"],9,A(n,.85),13,A(n,.62),16,A(n,.45)])}function Mt(e,t){xt=t,e.setLayoutProperty(Q,"visibility",t?"visible":"none")}var Fe="corridor",Tt="corridor-lines",oe="#8b929c",Wn="#6f7783",ne={lost:O,added:D,kept:oe};var te=null,Pt=!1;function ae(){return te}function je(){return Pt}function Un(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Nt(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Zn(){let e=t=>["match",["get","klass"],"lost",ne.lost,"added",ne.added,t];return["interpolate",["linear"],["zoom"],9,e(Wn),14,e(oe)]}function qn(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Xn(){return["match",["get","klass"],"kept",.85,.9]}function At(e,t){e.addSource(Fe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Tt,type:"line",source:Fe,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Zn(),"line-width":qn(),"line-opacity":Xn()}},t)}async function Je(e,t){return te=await w(`/api/corridors?day=${t}`),e.getSource(Fe).setData(Un(te)),te}async function Ft(e,t){S.includes(t)&&await Je(e,t)}function jt(e,t){Pt=t,e.setLayoutProperty(Tt,"visibility",t?"visible":"none")}var ze="#2b3038",Jt="#b9bec6",J={loses:{color:O,size:6},gains:{color:D,size:6},keeps:{color:oe,size:3},here:{color:ze,size:3.5},none:{color:Jt,size:1.8}},se=["loses","gains","keeps","none","here"],He="oneseat",Ht="oneseat-dots",re=null,zt=!1;function F(){return re}function Be(){return zt}function Bt(e,t,n,o,a,r){let c={};for(let l of t)c[l]=0;for(let l of e){let d=l[0],p=l[1];if(d<o||d>r||p<n||p>a)continue;let m=t[l[3]];m!==void 0&&c[m]++}return c}function Qn(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function eo(){return["match",["get","status"],...Object.entries(J).flatMap(([e,t])=>[e,t.color]),Jt]}function to(){let e=["match",["get","status"],...Object.entries(J).flatMap(([t,n])=>[t,n.size]),J.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function It(e,t){e.addSource(He,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ht,type:"circle",source:He,layout:{visibility:"none"},paint:{"circle-color":eo(),"circle-radius":to(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function no(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var oo="pin";function Kt(e){return"key"in e?e.key:oo}var ie="any";function ao(e,t,n){return`radius=${e}&${no(t)}&day=${n}`}function Yt(e,t){return e?t:ie}function Gt(e,t){return e!=="oneseat"||t}async function Ie(e,t,n,o=ie){return re=await w(`/api/oneseat?${ao(t,n,o)}`),e.getSource(He).setData(Qn(re)),re}function Vt(e,t){zt=t,e.setLayoutProperty(Ht,"visibility",t?"visible":"none")}function Ke(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Wt(e,t){let n=t.statuses.find(l=>l.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=l=>l.length?l.join(", "):"none",c=Ke(t);return e.status==="here"?`<b>at ${c}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${c}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var Ye={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ro(e){return e.buckets.filter(t=>t.key!=="none")}function so(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Rt(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=l=>l.toFixed(l<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Pe.map(([l,d])=>`${d} ${((l+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${O}"></i>loses all service</span>
        <span><i style="background:${D}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var io=["lost","added","kept"],lo={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},co={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Ut(e,t){let{lostPct:n,addedPct:o}=Nt(t.km),a=l=>l.toFixed(1),c=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${c}</b> km of street, citywide \u2014 ${co[t.day]}
    </div>
    ${io.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${ne[l]}"></i>
        <span class="lg-lab">${y(lo[l])}</span>
        <span class="lg-n">${a(t.km[l])} km</span>
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
      what you can still reach on foot.</div>`}function Zt(e,t,n){let o=t.statuses.map(m=>m.key),a=Bt(t.points,o,n.west,n.south,n.east,n.north),r=m=>t.statuses.find(g=>g.key===m)?.label??m,c=se.reduce((m,g)=>m+(a[g]??0),0),l=Ke(t),d=t.day&&t.day!==ie,p=d?`Restricted to routes running on ${Ye[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${y(l)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${d?` \xB7 ${Ye[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${se.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${J[m].color}"></i>
        <span class="lg-lab">${y(r(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${se.map(m=>`${(t.counts[m]??0).toLocaleString()} ${y(r(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${y(l)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function qt(e,t,n,o,a){let r=t.buckets.map(p=>p.key),c=gt(t.points,t.days.indexOf(n),r,o.west,o.south,o.east,o.north),l=ro(t),d=l.reduce((p,m)=>p+c[m.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${d.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${Ye[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${l.map(p=>`
      <button class="lg-row ${Re(p.key)?"off":""}" data-bucket="${y(p.key)}"
              aria-pressed="${!Re(p.key)}">
        <i style="background:${Z[p.key]?.color??"#666"}"></i>
        <span class="lg-lab">${y(p.label)}</span>
        <span class="lg-n">${c[p.key].toLocaleString()}</span>
      </button>`).join("")}
    ${a?so(a,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var le="ondemand",Ge="ondemand-fill",Ve="ondemand-line",H="#7c5cd6",Xt="#b3a0ec",uo="rgba(124, 92, 214, 0.22)",ce=null,Qt=!1;function We(){return ce}function de(){return Qt}function po(e){return{type:"FeatureCollection",features:e.zones.map(t=>({type:"Feature",geometry:{type:"MultiPolygon",coordinates:t.geometry},properties:{name:t.name,vehicles_weekday:t.vehicles_weekday,weekday_hours:t.weekday_hours,zone_km2:t.zone_km2,lost_km2_inside:t.lost_km2_inside}}))}}function mo(e){return e==null?"an unstated number of vehicles":e===1?"1 vehicle":`${e} vehicles`}function en(e){let t=e.lost_km2_inside,n=e.zone_km2,o=t==null?"":`<div class="muted">${t.toFixed(1)} km\xB2 of it loses all fixed-route service under the plan</div>`;return`<strong>${y(e.name??"On-demand zone")}</strong><div>Proposed on-demand service: ${mo(e.vehicles_weekday)}${n?` for ${n.toFixed(0)} km\xB2`:""}${e.weekday_hours?`, ${y(e.weekday_hours)} weekdays`:""}</div>`+o}function tn(e){let t=e.lost_pct_inside===null?`${e.lost_km2_inside.toFixed(1)} km\xB2 of the ground that loses all fixed-route service is inside one`:`${Math.round(e.lost_pct_inside)}% of the ${e.lost_km2_citywide.toFixed(1)} km\xB2 that loses all fixed-route service is inside one`;return`<div class="lg-foot lg-zone" style="color:${Xt};border-left-color:${H}"><i style="border-color:${H}"></i>${e.zones} proposed on-demand zones. ${t}. All ten together run ${e.vehicles_weekday} vehicles over ${e.zone_km2.toFixed(0)} km\xB2, 7am\u20139pm \u2014 a fallback, not a replacement. Nothing on this map is netted off against them.</div>`}function nn(e,t){e.style.color=t?Xt:"",e.style.background=t?uo:"",e.style.boxShadow=t?`inset 0 0 0 1px ${H}`:""}function on(e,t){e.addSource(le,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ge,type:"fill",source:le,layout:{visibility:"none"},paint:{"fill-color":H,"fill-opacity":.08}},t),e.addLayer({id:Ve,type:"line",source:le,layout:{visibility:"none","line-join":"round"},paint:{"line-color":H,"line-width":2,"line-opacity":.9,"line-dasharray":[3,2]}},t)}async function an(e){return ce=await w("/api/zones"),e.getSource(le).setData(po(ce)),ce}function rn(e,t){Qt=t;for(let n of[Ge,Ve])e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Ue=[Ge,Ve];var Ze="#4aa3ff",mn="#ffa23a",qe="headline",ue="journey",yn="journey-rides",fn="journey-walks",yo=[yn,fn],hn=null,gn=!1;function me(){return hn}function Xe(){return gn}function fo(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let c of r.legs){let l=c.from??e.origin,d=c.to??e.destination,p=[[l.lon,l.lat],[d.lon,d.lat]],m=c.path?.length?c.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:c.kind,route:c.route}})}}return{type:"FeatureCollection",features:o}}function sn(){return["match",["get","side"],"current",Ze,"proposed",mn,Ze]}function ln(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function bn(e,t){e.addSource(ue,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:yn,type:"line",source:ue,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":sn(),"line-width":ln(1),"line-opacity":.85}},t),e.addLayer({id:fn,type:"line",source:ue,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":sn(),"line-width":ln(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function vn(e,t){gn=t;for(let n of yo)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Qe(e,t){hn=t;let n=t?fo(t,qe):{type:"FeatureCollection",features:[]};e.getSource(ue).setData(n)}function wn(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var cn=e=>`${e.toFixed(1)} min`;function Ln(e){return e==null?"\u2014":e===0?"no change":e>0?`${cn(e)} slower`:`${cn(-e)} faster`}function dn(e,t){return e?e.name?y(e.name):`stop ${y(e.stop_id)}`:t}function ho(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=dn(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${y(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${dn(e.to,"the destination")}</span></div>`}function un(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(ho(a,t)),o=a}return n.join("")}var go={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function pe(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function bo(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function vo(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${pe(t.current)} \u2192
        ${pe(t.proposed)} min</span>
        <span class="muted">${Ln(t.change_min)}</span></div>
      ${o}
    </div>`}function pn(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function et(e,t){let n=e.radii[qe],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
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
        <p>${go[n.classification]??""}</p>
      </div>
      ${pn(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${pe(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${pe(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Ln(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${bo(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?un(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?un(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${vo(e)}
    ${pn(e)}`}function Sn(e){return`
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
    </div>`}function kn(e){let t=e?e.radii[qe].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Ze}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${mn}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var tt=" \xB7 ",_n={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"};function xn(e){return _n[e]??e}var wo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Lo=["oneseat","journey"];function So(e){return e!=="journey"}function ko(e){let t=[_n[e.view]??e.view];return Lo.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":wo[e.day]),So(e.view)&&t.push(`${e.radius} m walk`),t.join(tt)}function $n(e){let[t,...n]=ko(e).split(tt);return`<b>${y(t)}</b>${n.map(o=>tt+y(o)).join("")}`}var $=["peek","half","full"],_o=192,xo=.3,$o=.55,Oo=.9,Do=.6,Ro=.45;function ye(e,t){return e==="peek"?Math.min(_o,t*xo):e==="half"?t*$o:t*Oo}function Co(e,t,n=0){let o=$.map(r=>Math.abs(ye(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>Do&&(a=Math.max(0,Math.min($.length-1,a+(n>0?1:-1)))),$[a]}function On(e){return $[($.indexOf(e)+1)%$.length]}function Eo(e,t){return Math.min(e,t*Ro)}function z(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}var Mo=8,To=400;function Dn(e){let t=i("side"),n=i("sheet-handle"),o="peek",a=!1,r=0,c=0,l=0,d={y:0,t:0};function p(){return window.innerHeight}function m(u){t.style.height=`${u}px`,e.onMove(u,Eo(u,p()))}function g(u){o=u,t.dataset.snap=u,m(ye(u,p()))}n.addEventListener("pointerdown",u=>{z()&&(a=!0,r=u.clientY,c=t.getBoundingClientRect().height,l=u.timeStamp,d={y:u.clientY,t:u.timeStamp},t.classList.add("dragging"),n.setPointerCapture(u.pointerId))}),n.addEventListener("pointermove",u=>{if(!a)return;let st=c+(r-u.clientY),G=ye("peek",p()),ve=ye("full",p());m(Math.max(G,Math.min(ve,st))),d={y:u.clientY,t:u.timeStamp}});function _(u){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(u.clientY-r)>Mo)&&u.timeStamp-l<To){g(On(o));return}let G=u.timeStamp-d.t,ve=G>0?(d.y-u.clientY)/G:0;g(Co(t.getBoundingClientRect().height,p(),ve))}n.addEventListener("pointerup",_),n.addEventListener("pointercancel",_),n.addEventListener("keydown",u=>{u.key!=="Enter"&&u.key!==" "||(u.preventDefault(),z()&&g(On(o)))});let x=null;function E(){let u=z();if(u!==x&&(x=u,e.onLayoutChange(u)),!u){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}g(o)}return window.addEventListener("resize",E),E(),{at:()=>z()?o:"full",atLeast(u){z()&&$.indexOf(u)>$.indexOf(o)&&g(u)}}}var Po=[-79.9959,40.4406],No="#e2574c",k=400,B=null,h=null,C=0,v={key:"downtown"},R=null,En=!1,Y=!1,f="dots",Mn,ot=[],s=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Po,zoom:12,attributionControl:{compact:!0}});s.addControl(new maplibregl.NavigationControl,"top-right");s.on("load",()=>{ct(s),vt(s),Et(s,"change-dots"),At(s,"change-dots"),It(s,"walk-fill"),on(s,"change-dots"),bn(s),xe(i("panel")),s.on("click",t=>{if(En){nt({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(r=>s.getLayoutProperty(r,"visibility")!=="none"),o=s.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Fn(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});s.on("mouseenter","change-dots",()=>{s.getCanvas().style.cursor="pointer"}),s.on("mouseleave","change-dots",()=>{s.getCanvas().style.cursor="",e.remove()}),s.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=De();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(St(n.properties,L(),o.buckets)).addTo(s)}),s.on("mouseenter","oneseat-dots",()=>{s.getCanvas().style.cursor="pointer"}),s.on("mouseleave","oneseat-dots",()=>{s.getCanvas().style.cursor="",e.remove()}),s.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=F();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Wt(n.properties,o)).addTo(s)}),s.on("mousemove",Ue[0],t=>{let n=t.features?.[0];!n||!de()||e.setLngLat(t.lngLat).setHTML(en(n.properties)).addTo(s)}),s.on("mouseleave",Ue[0],()=>{e.remove()}),s.on("moveend",b),I("[data-radius]",t=>{k=Number(t.dataset.radius),Ce(s,k,L()).then(b),ee()&&Ne(s,k,L()).then(b),F()&&fe(),h&&K(h.lat,h.lon)}),I("[data-day]",t=>{let n=t.dataset.day;ht(n),Ee(s,n),Ae(s,n),f==="journey"&&h&&at(h.lat,h.lon),ae()&&Ft(s,n).then(b),Y&&F()&&(fe(),h&&K(h.lat,h.lon)),b()}),I("[data-oneseat-day]",t=>{Y=t.dataset.oneseatDay==="selected",Cn(),fe(),h&&K(h.lat,h.lon)}),I("[data-view]",t=>{let n=f;f=t.dataset.view,s.setLayoutProperty("change-dots","visibility",f==="dots"||f==="both"?"visible":"none"),Ho(f==="surface"||f==="both"),Bo(f==="corridors"),Yo(f==="oneseat"),Ko(f==="journey",n==="journey"),Io(f!=="corridors"&&f!=="journey");let o=f==="oneseat"||f==="journey";i("dest-controls").classList.toggle("hidden",!o),i("oneseat-day-controls").classList.toggle("hidden",f!=="oneseat"),Cn(),o||he(!1),Pn()}),i("zone-toggle").addEventListener("click",()=>{zo(!de())}),I("[data-dest]",t=>{let n=t.dataset.dest;if(n==="pin"){he(!0);return}he(!1),nt({key:n})}),i("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(wt(s,n.dataset.bucket,L()),b())}),i("legend-reset").addEventListener("click",()=>{Lt(s,L()),b()}),i("legend-collapse").addEventListener("click",()=>{Rn(!i("legend-box").classList.contains("collapsed"))}),i("side-toggle").addEventListener("click",jo),Mn=Dn({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),s.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Rn}),Ao(),be(),Ce(s,k,L()).then(b),Wo(),Vo()});function I(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n),be()})})}function be(){i("statebar").innerHTML=$n({view:f,day:L(),radius:k,oneSeatRestricted:Y,destination:ge()}),Fo()}function Rn(e){i("legend-box").classList.toggle("collapsed",e);let t=i("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Ao(){let e=t=>{i("app").classList.toggle("controls-open",t),i("controls-toggle").setAttribute("aria-expanded",String(t))};i("controls-toggle").addEventListener("click",()=>{e(!i("app").classList.contains("controls-open"))}),i("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Fo(){i("controls-toggle").firstChild?.remove(),i("controls-toggle").prepend(document.createTextNode(xn(f)))}function jo(){let e=i("app").classList.toggle("side-collapsed"),t=i("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),s.resize()}function b(){if(Jo(),!de())return;let e=We();e&&i("legend").insertAdjacentHTML("beforeend",tn(e.totals))}function Jo(){if(i("legend-reset").classList.toggle("hidden",je()||Be()||Xe()),Xe()){i("legend").innerHTML=kn(me());return}if(je()){let n=ae();n&&Ut(i("legend"),n);return}if(Be()){let n=F();if(!n)return;let o=s.getBounds();Zt(i("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=De();if(!e)return;let t=s.getBounds();qt(i("legend"),e,L(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},$t()?ee():null)}async function Ho(e){if(e&&!ee()){i("legend").classList.add("loading");try{await Ne(s,k,L())}finally{i("legend").classList.remove("loading")}}Mt(s,e),b()}async function zo(e){e&&!We()&&await an(s),rn(s,e),i("zone-toggle").classList.toggle("active",e),nn(i("zone-toggle"),e),b()}async function Bo(e){if(e&&!ae()){i("legend").classList.add("loading");try{await Je(s,L())}finally{i("legend").classList.remove("loading")}}jt(s,e),b()}function Io(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function Ko(e,t=!1){if(vn(s,e),b(),!e){t&&(h?K(h.lat,h.lon):xe(i("panel")));return}me()&&h?i("panel").innerHTML=et(me(),ge()):i("panel").innerHTML=Sn(ge())}async function at(e,t){let n=++C;h={lat:e,lon:t},An(e,t);let o=Nn(),a=y(ge());if(!o){i("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}i("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await w(wn({lat:e,lon:t},o,L()));if(n!==C)return;Qe(s,r),i("panel").innerHTML=et(r,a),b()}catch(r){if(n!==C)return;Qe(s,null),i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function Cn(){i("day-controls").classList.toggle("hidden",!Gt(f,Y))}function rt(){return Yt(Y,L())}async function Yo(e){e&&!F()&&await Tn(()=>Ie(s,k,v,rt())),Vt(s,e),b()}async function fe(){await Tn(()=>Ie(s,k,v,rt())),b()}async function Tn(e){i("legend").classList.add("loading");try{return await e()}finally{i("legend").classList.remove("loading")}}function nt(e){if(v=e,he(!1),Go(),Pn(),be(),f==="journey"){h&&at(h.lat,h.lon),b();return}fe()}function Pn(){let e=Nn();if(!(e!==null&&(f==="journey"||f==="oneseat"&&"lat"in v))){R?.remove(),R=null;return}R?R.setLngLat([e.lon,e.lat]).addTo(s):(R=new maplibregl.Marker({color:ze,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(s),R.on("dragend",()=>{let n=R.getLngLat();nt({lat:n.lat,lon:n.lng})}))}function Go(){let e=Kt(v);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Nn(){if("lat"in v)return{lat:v.lat,lon:v.lon};let e=v.key,t=ot.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ge(){if("lat"in v)return`${v.lat.toFixed(4)}, ${v.lon.toFixed(4)}`;let e=v.key;return ot.find(t=>t.key===e)?.name??e}function he(e){En=e,s.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function K(e,t){let n=++C;h={lat:e,lon:t},i("panel").classList.add("loading"),An(e,t);try{let o="lat"in v?`&dest_lat=${v.lat.toFixed(6)}&dest_lon=${v.lon.toFixed(6)}`:"",a=await w(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${k}${o}&oneseat_day=${rt()}`);if(n!==C)return;dt(s,e,t,k,a.current.stops,a.proposed.stops),$e(a)}catch(o){if(n!==C)return;i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===C&&i("panel").classList.remove("loading")}}function An(e,t){B?B.setLngLat([t,e]):(B=new maplibregl.Marker({color:No,draggable:!0}).setLngLat([t,e]).addTo(s),B.on("dragend",()=>{let n=B.getLngLat();Fn(n.lat,n.lng)}))}function Fn(e,t){if(Mn.atLeast("half"),f==="journey"){at(e,t);return}K(e,t)}async function Vo(){try{ot=await w("/api/destinations"),be()}catch{}}async function Wo(){try{let e=await w("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;i("feedline").textContent=t,i("feedline-methods").textContent=t,i("caveats").innerHTML=e.caveats.map(n=>`<li>${n.text}</li>`).join("")}catch{}}i("methods-open").addEventListener("click",()=>i("methods").classList.add("open"));i("methods-close").addEventListener("click",()=>i("methods").classList.remove("open"));})();
