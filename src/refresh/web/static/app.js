"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function b(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function m(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function O(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function ye(e){return e>0?`+${e}`:String(e)}function tt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var xn="#4aa3ff",On="#ffa23a";function Dn(e,t,n,o=96){let a=[],r=n/111320,l=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let d=i/o*2*Math.PI;a.push([t+l*Math.cos(d),e+r*Math.sin(d)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function D(e){return{type:"FeatureCollection",features:e}}function nt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ot(e){e.addSource("walk",{type:"geojson",data:D([])}),e.addSource("stops-now",{type:"geojson",data:D([])}),e.addSource("stops-prop",{type:"geojson",data:D([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":On,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":xn,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let r=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${r.name}</b><br>${r.side==="current"?"today":"proposed"}
                  \xB7 stop ${r.stop_id} \xB7 ${r.metres} m`).addTo(e)})}function at(e,t,n,o,a,r){e.getSource("walk").setData(D([Dn(t,n,o)])),e.getSource("stops-now").setData(D(nt(a,"current"))),e.getSource("stops-prop").setData(D(nt(r,"proposed")))}var L=["weekday","saturday","sunday"],fe=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],rt={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},st=e=>3+3*e,it=e=>4+3*e,B=e=>5+3*e;var he=e=>2+2*e,ge=e=>3+2*e;var be=null,R="weekday";function v(){return R}function dt(e,t=!0){R=e,t&&be&&ve(be)}function we(e){e.innerHTML=`
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
    </div>`}function Rn(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Cn(e,t){let n=Math.max(1,...fe.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return fe.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,l=r-a,i=l>0?"up":l<0?"down":"flat";return`
      <tr>
        <th>${rt[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${i}">${l===0?"\xB7":ye(l)}</td>
      </tr>`}).join("")}function K(e){return e.length?e.map(t=>`<span class="route">${m(t)}</span>`).join(" "):'<span class="muted">none</span>'}function lt(e){return e.first==null?'<span class="muted">no service</span>':`${O(e.first)} \u2013 ${O(e.last)}`}function ct(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Tn={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},En={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Mn(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=K(o.current),r=K(o.proposed),l=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${a}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${m(o.name)}</span>
          <span class="os-status ${m(o.status)}">${Tn[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${l}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. ${t==="any"?`Counted on any calendar, which is the published measure \u2014 no day
             type enters it.`:`Restricted to routes running on ${En[t]??t},
             which is not the published measure \u2014 that one counts a route
             calling here on any calendar.`}
        It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function ve(e){be=e;let t=document.getElementById("panel"),n=e.current.days[R],o=e.proposed.days[R],a=o.trips-n.trips,r=a>0?"up":a<0?"down":"flat",l=e.place?.hood||e.place?.muni||"this location",i=ct(n),d=ct(o);t.innerHTML=`
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
      <div class="hl-delta ${r}">
        ${a===0?"no change":`${ye(a)} trips`}
        <div class="muted">${tt(n.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${R==="weekday"?"weekday":R}, both directions</div>

    <div class="tiers">${Rn(n.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Cn(n,o)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${lt(n)} <span class="muted">\u2192</span> ${lt(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${i==null?"\u2014":`${i} min`} <span class="muted">\u2192</span> ${d==null?"\u2014":`${d} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${Mn(e.oneseat??[],e.oneseat_day??"any")}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${K(n.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${K(o.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}var Y={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Le="change",G="change-dots",I=null,C=new Set;function Se(){return I}function ke(e){return C.has(e)}function ut(e,t,n,o,a,r,l){let i={};for(let d of n)i[d]=0;for(let d of e){let u=d[0],p=d[1];if(u<a||u>l||p<o||p>r)continue;let w=n[d[B(t)]];w!==void 0&&i[w]++}return i}function Pn(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>L.some((o,a)=>t[n[B(a)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(L.flatMap((o,a)=>[[`b${a}`,t[n[B(a)]]],[`c${a}`,n[st(a)]],[`p${a}`,n[it(a)]]]))}}))}}function j(e,t){let n=Object.entries(Y).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Y.none[t]]}function pt(e){return["interpolate",["linear"],["zoom"],9,["*",j(e,"size"),.45],12,j(e,"size"),16,["*",j(e,"size"),1.9]]}function mt(e){e.addSource(Le,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:G,type:"circle",source:Le,paint:{"circle-color":j(0,"color"),"circle-radius":pt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function _e(e,t,n){return I=await b(`/api/change?radius=${t}`),e.getSource(Le).setData(Pn(I)),$e(e,n),I}function $e(e,t){let n=L.indexOf(t);e.setPaintProperty(G,"circle-color",j(n,"color")),e.setPaintProperty(G,"circle-radius",pt(n)),xe(e,t)}function yt(e,t,n){C.has(t)?C.delete(t):C.add(t),xe(e,n)}function ft(e,t){C.clear(),xe(e,t)}function xe(e,t){let n=L.indexOf(t),o=["none",...C];e.setFilter(G,["!",["in",["get",`b${n}`],["literal",o]]])}function ht(e,t,n){let o=L.indexOf(t),a=e[`b${o}`],r=n.find(u=>u.key===a)?.label??a,l=e[`c${o}`],i=e[`p${o}`];return`<b>${r}</b><br>${l} \u2192 ${i} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Oe="surface",W="surface-fill",gt="#6b7280",De=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,gt],[.138,gt],[1,"#12a163"],[2,"#0b7a48"]],k="#e8232f",_="#0f79c9",bt=2,V=null,wt=!1;function Z(){return V}function vt(){return wt}function Lt(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-bt,Math.min(bt,n))}function St(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function kt(e,t,n,o,a,r,l,i){let d={gone:0,less:0,same:0,more:0,new:0};for(let u of e){let p=l.lat0+(u[1]+.5)*l.dlat,w=l.lon0+(u[0]+.5)*l.dlon;if(p<o||p>r||w<n||w>a)continue;let M=u[he(t)],P=u[ge(t)],me=St(M,P);if(me!=="none")if(me==="ramp"){let et=Lt(M,P);d[et<-.138?"less":et>.138?"more":"same"]+=i}else d[me]+=i}return d}function jn(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let l=t+r[1]*o,i=l+o,d=n+r[0]*a,u=d+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[d,l],[u,l],[u,i],[d,i],[d,l]]]},properties:Object.fromEntries(L.flatMap((p,w)=>{let M=r[he(w)],P=r[ge(w)];return[[`k${w}`,St(M,P)],[`v${w}`,Lt(M,P)??0]]}))}})}}function _t(e){return["case",["==",["get",`k${e}`],"gone"],k,["==",["get",`k${e}`],"new"],_,["interpolate",["linear"],["get",`v${e}`],...De.flatMap(([t,n])=>[t,n])]]}function T(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function $t(e,t){e.addSource(Oe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:W,type:"fill",source:Oe,layout:{visibility:"none"},paint:{"fill-color":_t(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,T(0,.85),13,T(0,.62),16,T(0,.45)]}},t)}async function Re(e,t,n){return V=await b(`/api/surface?radius=${t}`),e.getSource(Oe).setData(jn(V)),Ce(e,n),V}function Ce(e,t){let n=L.indexOf(t);e.setPaintProperty(W,"fill-color",_t(n)),e.setPaintProperty(W,"fill-opacity",["interpolate",["linear"],["zoom"],9,T(n,.85),13,T(n,.62),16,T(n,.45)])}function xt(e,t){wt=t,e.setLayoutProperty(W,"visibility",t?"visible":"none")}var Te="corridor",Ot="corridor-lines",Q="#8b929c",Nn="#6f7783",q={lost:k,added:_,kept:Q};var U=null,Dt=!1;function X(){return U}function Ee(){return Dt}function Fn(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Rt(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function An(){let e=t=>["match",["get","klass"],"lost",q.lost,"added",q.added,t];return["interpolate",["linear"],["zoom"],9,e(Nn),14,e(Q)]}function Jn(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Hn(){return["match",["get","klass"],"kept",.85,.9]}function Ct(e,t){e.addSource(Te,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ot,type:"line",source:Te,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":An(),"line-width":Jn(),"line-opacity":Hn()}},t)}async function Me(e,t){return U=await b(`/api/corridors?day=${t}`),e.getSource(Te).setData(Fn(U)),U}async function Tt(e,t){L.includes(t)&&await Me(e,t)}function Et(e,t){Dt=t,e.setLayoutProperty(Ot,"visibility",t?"visible":"none")}var je="#2b3038",Mt="#b9bec6",N={loses:{color:k,size:6},gains:{color:_,size:6},keeps:{color:Q,size:3},here:{color:je,size:3.5},none:{color:Mt,size:1.8}},te=["loses","gains","keeps","none","here"],Pe="oneseat",Pt="oneseat-dots",ee=null,jt=!1;function E(){return ee}function Ne(){return jt}function Nt(e,t,n,o,a,r){let l={};for(let i of t)l[i]=0;for(let i of e){let d=i[0],u=i[1];if(d<o||d>r||u<n||u>a)continue;let p=t[i[3]];p!==void 0&&l[p]++}return l}function zn(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Bn(){return["match",["get","status"],...Object.entries(N).flatMap(([e,t])=>[e,t.color]),Mt]}function Kn(){let e=["match",["get","status"],...Object.entries(N).flatMap(([t,n])=>[t,n.size]),N.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Ft(e,t){e.addSource(Pe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Pt,type:"circle",source:Pe,layout:{visibility:"none"},paint:{"circle-color":Bn(),"circle-radius":Kn(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function In(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Yn="pin";function At(e){return"key"in e?e.key:Yn}var ne="any";function Gn(e,t,n){return`radius=${e}&${In(t)}&day=${n}`}function Jt(e,t){return e?t:ne}function Ht(e,t){return e!=="oneseat"||t}async function Fe(e,t,n,o=ne){return ee=await b(`/api/oneseat?${Gn(t,n,o)}`),e.getSource(Pe).setData(zn(ee)),ee}function zt(e,t){jt=t,e.setLayoutProperty(Pt,"visibility",t?"visible":"none")}function Ae(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Bt(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=i=>i.length?i.join(", "):"none",l=Ae(t);return e.status==="here"?`<b>at ${l}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${l}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var Je={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Vn(e){return e.buckets.filter(t=>t.key!=="none")}function Wn(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=kt(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=i=>i.toFixed(i<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${De.map(([i,d])=>`${d} ${((i+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${k}"></i>loses all service</span>
        <span><i style="background:${_}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var Zn=["lost","added","kept"],Un={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},qn={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Kt(e,t){let{lostPct:n,addedPct:o}=Rt(t.km),a=i=>i.toFixed(1),l=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${l}</b> km of street, citywide \u2014 ${qn[t.day]}
    </div>
    ${Zn.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${q[i]}"></i>
        <span class="lg-lab">${m(Un[i])}</span>
        <span class="lg-n">${a(t.km[i])} km</span>
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
      what you can still reach on foot.</div>`}function It(e,t,n){let o=t.statuses.map(p=>p.key),a=Nt(t.points,o,n.west,n.south,n.east,n.north),r=p=>t.statuses.find(w=>w.key===p)?.label??p,l=te.reduce((p,w)=>p+(a[w]??0),0),i=Ae(t),d=t.day&&t.day!==ne,u=d?`Restricted to routes running on ${Je[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${m(i)}</b>
      <span class="muted">\xB7 ${l.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${d?` \xB7 ${Je[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${te.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${N[p].color}"></i>
        <span class="lg-lab">${m(r(p))}</span>
        <span class="lg-n">${(a[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${te.map(p=>`${(t.counts[p]??0).toLocaleString()} ${m(r(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${m(i)} without transferring?
      ${u} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Yt(e,t,n,o,a){let r=t.buckets.map(u=>u.key),l=ut(t.points,t.days.indexOf(n),r,o.west,o.south,o.east,o.north),i=Vn(t),d=i.reduce((u,p)=>u+l[p.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${d.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${Je[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${i.map(u=>`
      <button class="lg-row ${ke(u.key)?"off":""}" data-bucket="${m(u.key)}"
              aria-pressed="${!ke(u.key)}">
        <i style="background:${Y[u.key]?.color??"#666"}"></i>
        <span class="lg-lab">${m(u.label)}</span>
        <span class="lg-n">${l[u.key].toLocaleString()}</span>
      </button>`).join("")}
    ${a?Wn(a,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var oe="ondemand",He="ondemand-fill",ze="ondemand-line",F="#7c5cd6",Gt="#b3a0ec",Qn="rgba(124, 92, 214, 0.22)",ae=null,Vt=!1;function Be(){return ae}function re(){return Vt}function Xn(e){return{type:"FeatureCollection",features:e.zones.map(t=>({type:"Feature",geometry:{type:"MultiPolygon",coordinates:t.geometry},properties:{name:t.name,vehicles_weekday:t.vehicles_weekday,weekday_hours:t.weekday_hours,zone_km2:t.zone_km2,lost_km2_inside:t.lost_km2_inside}}))}}function eo(e){return e==null?"an unstated number of vehicles":e===1?"1 vehicle":`${e} vehicles`}function Wt(e){let t=e.lost_km2_inside,n=e.zone_km2,o=t==null?"":`<div class="muted">${t.toFixed(1)} km\xB2 of it loses all fixed-route service under the plan</div>`;return`<strong>${m(e.name??"On-demand zone")}</strong><div>Proposed on-demand service: ${eo(e.vehicles_weekday)}${n?` for ${n.toFixed(0)} km\xB2`:""}${e.weekday_hours?`, ${m(e.weekday_hours)} weekdays`:""}</div>`+o}function Zt(e){let t=e.lost_pct_inside===null?`${e.lost_km2_inside.toFixed(1)} km\xB2 of the ground that loses all fixed-route service is inside one`:`${Math.round(e.lost_pct_inside)}% of the ${e.lost_km2_citywide.toFixed(1)} km\xB2 that loses all fixed-route service is inside one`;return`<div class="lg-foot lg-zone" style="color:${Gt};border-left-color:${F}"><i style="border-color:${F}"></i>${e.zones} proposed on-demand zones. ${t}. All ten together run ${e.vehicles_weekday} vehicles over ${e.zone_km2.toFixed(0)} km\xB2, 7am\u20139pm \u2014 a fallback, not a replacement. Nothing on this map is netted off against them.</div>`}function Ut(e,t){e.style.color=t?Gt:"",e.style.background=t?Qn:"",e.style.boxShadow=t?`inset 0 0 0 1px ${F}`:""}function qt(e,t){e.addSource(oe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:He,type:"fill",source:oe,layout:{visibility:"none"},paint:{"fill-color":F,"fill-opacity":.08}},t),e.addLayer({id:ze,type:"line",source:oe,layout:{visibility:"none","line-join":"round"},paint:{"line-color":F,"line-width":2,"line-opacity":.9,"line-dasharray":[3,2]}},t)}async function Qt(e){return ae=await b("/api/zones"),e.getSource(oe).setData(Xn(ae)),ae}function Xt(e,t){Vt=t;for(let n of[He,ze])e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Ke=[He,ze];var Ie="#4aa3ff",sn="#ffa23a",Ye="headline",se="journey",ln="journey-rides",cn="journey-walks",to=[ln,cn],dn=null,un=!1;function le(){return dn}function Ge(){return un}function no(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let l of r.legs){let i=l.from??e.origin,d=l.to??e.destination,u=[[i.lon,i.lat],[d.lon,d.lat]],p=l.path?.length?l.path:u;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:a,kind:l.kind,route:l.route}})}}return{type:"FeatureCollection",features:o}}function en(){return["match",["get","side"],"current",Ie,"proposed",sn,Ie]}function tn(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function pn(e,t){e.addSource(se,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ln,type:"line",source:se,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":en(),"line-width":tn(1),"line-opacity":.85}},t),e.addLayer({id:cn,type:"line",source:se,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":en(),"line-width":tn(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function mn(e,t){un=t;for(let n of to)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Ve(e,t){dn=t;let n=t?no(t,Ye):{type:"FeatureCollection",features:[]};e.getSource(se).setData(n)}function yn(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var nn=e=>`${e.toFixed(1)} min`;function fn(e){return e==null?"\u2014":e===0?"no change":e>0?`${nn(e)} slower`:`${nn(-e)} faster`}function on(e,t){return e?e.name?m(e.name):`stop ${m(e.stop_id)}`:t}function oo(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=on(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${m(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${on(e.to,"the destination")}</span></div>`}function an(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(oo(a,t)),o=a}return n.join("")}var ao={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function ie(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function ro(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function so(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${ie(t.current)} \u2192
        ${ie(t.proposed)} min</span>
        <span class="muted">${fn(t.change_min)}</span></div>
      ${o}
    </div>`}function rn(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function We(e,t){let n=e.radii[Ye],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${m(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${O(e.window.start_min)}
        and ${O(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${ao[n.classification]??""}</p>
      </div>
      ${rn(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${ie(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${ie(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${fn(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${ro(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?an(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?an(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${so(e)}
    ${rn(e)}`}function hn(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${m(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function gn(e){let t=e?e.radii[Ye].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Ie}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${sn}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Ze=" \xB7 ",io={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"},lo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},co=["oneseat","journey"];function uo(e){return e!=="journey"}function po(e){let t=[io[e.view]??e.view];return co.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":lo[e.day]),uo(e.view)&&t.push(`${e.radius} m walk`),t.join(Ze)}function bn(e){let[t,...n]=po(e).split(Ze);return`<b>${m(t)}</b>${n.map(o=>Ze+m(o)).join("")}`}var mo=[-79.9959,40.4406],yo="#e2574c",S=400,A=null,f=null,x=0,g={key:"downtown"},$=null,vn=!1,z=!1,y="dots",qe=[],s=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:mo,zoom:12});s.addControl(new maplibregl.NavigationControl,"top-right");s.on("load",()=>{ot(s),mt(s),$t(s,"change-dots"),Ct(s,"change-dots"),Ft(s,"walk-fill"),qt(s,"change-dots"),pn(s),we(c("panel")),s.on("click",t=>{if(vn){Ue({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(r=>s.getLayoutProperty(r,"visibility")!=="none"),o=s.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];$n(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});s.on("mouseenter","change-dots",()=>{s.getCanvas().style.cursor="pointer"}),s.on("mouseleave","change-dots",()=>{s.getCanvas().style.cursor="",e.remove()}),s.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=Se();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(ht(n.properties,v(),o.buckets)).addTo(s)}),s.on("mouseenter","oneseat-dots",()=>{s.getCanvas().style.cursor="pointer"}),s.on("mouseleave","oneseat-dots",()=>{s.getCanvas().style.cursor="",e.remove()}),s.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=E();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Bt(n.properties,o)).addTo(s)}),s.on("mousemove",Ke[0],t=>{let n=t.features?.[0];!n||!re()||e.setLngLat(t.lngLat).setHTML(Wt(n.properties)).addTo(s)}),s.on("mouseleave",Ke[0],()=>{e.remove()}),s.on("moveend",h),J("[data-radius]",t=>{S=Number(t.dataset.radius),_e(s,S,v()).then(h),Z()&&Re(s,S,v()).then(h),E()&&ce(),f&&H(f.lat,f.lon)}),J("[data-day]",t=>{let n=t.dataset.day;dt(n),$e(s,n),Ce(s,n),y==="journey"&&f&&Qe(f.lat,f.lon),X()&&Tt(s,n).then(h),z&&E()&&(ce(),f&&H(f.lat,f.lon)),h()}),J("[data-oneseat-day]",t=>{z=t.dataset.oneseatDay==="selected",wn(),ce(),f&&H(f.lat,f.lon)}),J("[data-view]",t=>{let n=y;y=t.dataset.view,s.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),go(y==="surface"||y==="both"),wo(y==="corridors"),So(y==="oneseat"),Lo(y==="journey",n==="journey"),vo(y!=="corridors"&&y!=="journey");let o=y==="oneseat"||y==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),wn(),o||de(!1),Sn()}),c("zone-toggle").addEventListener("click",()=>{bo(!re())}),J("[data-dest]",t=>{let n=t.dataset.dest;if(n==="pin"){de(!0);return}de(!1),Ue({key:n})}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(yt(s,n.dataset.bucket,v()),h())}),c("legend-reset").addEventListener("click",()=>{ft(s,v()),h()}),c("legend-collapse").addEventListener("click",()=>{let n=c("legend-box").classList.toggle("collapsed"),o=c("legend-collapse");o.textContent=n?"+":"\u2013",o.title=n?"Show the key":"Collapse the key",o.setAttribute("aria-expanded",String(!n))}),c("side-toggle").addEventListener("click",fo),pe(),_e(s,S,v()).then(h),$o(),_o()});function J(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n),pe()})})}function pe(){c("statebar").innerHTML=bn({view:y,day:v(),radius:S,oneSeatRestricted:z,destination:ue()})}function fo(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),s.resize()}function h(){if(ho(),!re())return;let e=Be();e&&c("legend").insertAdjacentHTML("beforeend",Zt(e.totals))}function ho(){if(c("legend-reset").classList.toggle("hidden",Ee()||Ne()||Ge()),Ge()){c("legend").innerHTML=gn(le());return}if(Ee()){let n=X();n&&Kt(c("legend"),n);return}if(Ne()){let n=E();if(!n)return;let o=s.getBounds();It(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Se();if(!e)return;let t=s.getBounds();Yt(c("legend"),e,v(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},vt()?Z():null)}async function go(e){if(e&&!Z()){c("legend").classList.add("loading");try{await Re(s,S,v())}finally{c("legend").classList.remove("loading")}}xt(s,e),h()}async function bo(e){e&&!Be()&&await Qt(s),Xt(s,e),c("zone-toggle").classList.toggle("active",e),Ut(c("zone-toggle"),e),h()}async function wo(e){if(e&&!X()){c("legend").classList.add("loading");try{await Me(s,v())}finally{c("legend").classList.remove("loading")}}Et(s,e),h()}function vo(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function Lo(e,t=!1){if(mn(s,e),h(),!e){t&&(f?H(f.lat,f.lon):we(c("panel")));return}le()&&f?c("panel").innerHTML=We(le(),ue()):c("panel").innerHTML=hn(ue())}async function Qe(e,t){let n=++x;f={lat:e,lon:t},_n(e,t);let o=kn(),a=m(ue());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await b(yn({lat:e,lon:t},o,v()));if(n!==x)return;Ve(s,r),c("panel").innerHTML=We(r,a),h()}catch(r){if(n!==x)return;Ve(s,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function wn(){c("day-controls").classList.toggle("hidden",!Ht(y,z))}function Xe(){return Jt(z,v())}async function So(e){e&&!E()&&await Ln(()=>Fe(s,S,g,Xe())),zt(s,e),h()}async function ce(){await Ln(()=>Fe(s,S,g,Xe())),h()}async function Ln(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Ue(e){if(g=e,de(!1),ko(),Sn(),pe(),y==="journey"){f&&Qe(f.lat,f.lon),h();return}ce()}function Sn(){let e=kn();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in g))){$?.remove(),$=null;return}$?$.setLngLat([e.lon,e.lat]).addTo(s):($=new maplibregl.Marker({color:je,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(s),$.on("dragend",()=>{let n=$.getLngLat();Ue({lat:n.lat,lon:n.lng})}))}function ko(){let e=At(g);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function kn(){if("lat"in g)return{lat:g.lat,lon:g.lon};let e=g.key,t=qe.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ue(){if("lat"in g)return`${g.lat.toFixed(4)}, ${g.lon.toFixed(4)}`;let e=g.key;return qe.find(t=>t.key===e)?.name??e}function de(e){vn=e,s.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function H(e,t){let n=++x;f={lat:e,lon:t},c("panel").classList.add("loading"),_n(e,t);try{let o="lat"in g?`&dest_lat=${g.lat.toFixed(6)}&dest_lon=${g.lon.toFixed(6)}`:"",a=await b(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${S}${o}&oneseat_day=${Xe()}`);if(n!==x)return;at(s,e,t,S,a.current.stops,a.proposed.stops),ve(a)}catch(o){if(n!==x)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===x&&c("panel").classList.remove("loading")}}function _n(e,t){A?A.setLngLat([t,e]):(A=new maplibregl.Marker({color:yo,draggable:!0}).setLngLat([t,e]).addTo(s),A.on("dragend",()=>{let n=A.getLngLat();$n(n.lat,n.lng)}))}function $n(e,t){if(y==="journey"){Qe(e,t);return}H(e,t)}async function _o(){try{qe=await b("/api/destinations"),pe()}catch{}}async function $o(){try{let e=await b("/api/meta");c("feedline").textContent=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`,c("caveats").innerHTML=e.caveats.map(t=>`<li>${t.text}</li>`).join("")}catch{}}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
