"use strict";(()=>{function r(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function m(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function E(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function be(e){return e>0?`+${e}`:String(e)}function tt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Cn="#4aa3ff",Tn="#ffa23a";function Mn(e,t,n,o=96){let a=[],s=n/111320,c=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let d=i/o*2*Math.PI;a.push([t+c*Math.cos(d),e+s*Math.sin(d)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function P(e){return{type:"FeatureCollection",features:e}}function nt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ot(e){e.addSource("walk",{type:"geojson",data:P([])}),e.addSource("stops-now",{type:"geojson",data:P([])}),e.addSource("stops-prop",{type:"geojson",data:P([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Tn,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Cn,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function at(e,t,n,o,a,s){e.getSource("walk").setData(P([Mn(t,n,o)])),e.getSource("stops-now").setData(P(nt(a,"current"))),e.getSource("stops-prop").setData(P(nt(s,"proposed")))}var L=["weekday","saturday","sunday"],ve=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],st={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},rt=e=>3+3*e,it=e=>4+3*e,G=e=>5+3*e;var we=e=>2+2*e,Se=e=>3+2*e;var Le="weekday";function w(){return Le}function dt(e){Le=e}function ut(e){e.innerHTML=`
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
    </div>`}function En(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Pn(e,t){let n=Math.max(1,...ve.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return ve.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,c=s-a,i=c>0?"up":c<0?"down":"flat";return`
      <tr>
        <th>${st[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${c===0?"\xB7":be(c)}</td>
      </tr>`}).join("")}function _(e){return e.length?e.map(t=>`<span class="route">${m(t)}</span>`).join(" "):'<span class="muted">none</span>'}function lt(e){return e.first==null?'<span class="muted">no service</span>':`${E(e.first)} \u2013 ${E(e.last)}`}function ct(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var An={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},jn={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Nn(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=_(o.current),s=_(o.proposed),c=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${a}</div>
         <div class="rrow"><span class="rlab">proposed</span>${s}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${m(o.name)}</span>
          <span class="os-status ${m(o.status)}">${An[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${c}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. ${t==="any"?`Counted on any calendar, which is the published measure \u2014 no day
             type enters it.`:`Restricted to routes running on ${jn[t]??t},
             which is not the published measure \u2014 that one counts a route
             calling here on any calendar.`}
        It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function ke(e){return e.place?.hood||e.place?.muni||"this location"}function pt(e){return e==="weekday"?"weekday":e}function mt(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${pt(t)}`}function $e(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,c=s>0?"up":s<0?"down":"flat",i=ct(o),d=ct(a);return`
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${o.trips}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${a.trips}</div>
      </div>
      <div class="hl-delta ${c}">
        ${s===0?"no change":`${be(s)} trips`}
        <div class="muted">${tt(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${pt(t)}, both directions</div>

    <div class="tiers">${En(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Pn(o,a)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
    </div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${lt(o)} <span class="muted">\u2192</span> ${lt(a)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${i==null?"\u2014":`${i} min`} <span class="muted">\u2192</span> ${d==null?"\u2014":`${d} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${n}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${_(o.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${_(a.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}function ht(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${m(ke(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${$e(e,Le,Nn(e.oneseat??[],e.oneseat_day??"any"))}`}var Fn={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Hn={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Jn={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Bn(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function xe(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${_(t)}</div>`:""}function In(e){let t=xe("kept",e.kept)+xe("lost",e.lost)+xe("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Kn(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      <div class="rrow"><span class="rlab">today</span>${_(e.current)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${_(e.proposed)}</div>
    </div>`}function zn(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${m(a.key)}">
      <span class="os-name">${m(a.name)}</span>
      <span class="os-status ${m(a.status)}">${Yn[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Yn={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Vn(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Jn[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function yt(e,t,n){let o=Bn(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":In(o)+Kn(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${m(o.name)}</h2>
      <div class="muted">
        from ${m(ke(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${m(o.status)}">${Fn[o.status]}</div>
    <p class="note">${Hn[o.status]} ${Vn(a)}</p>

    ${s}

    ${zn(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${mt(e,n)}</summary>
      ${$e(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function ft(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${m(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var q={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},_e="change",X="change-dots",U=null,A=new Set;function Oe(){return U}function Re(e){return A.has(e)}function gt(e,t,n,o,a,s,c){let i={};for(let d of n)i[d]=0;for(let d of e){let p=d[0],h=d[1];if(p<a||p>c||h<o||h>s)continue;let g=n[d[G(t)]];g!==void 0&&i[g]++}return i}function Wn(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>L.some((o,a)=>t[n[G(a)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(L.flatMap((o,a)=>[[`b${a}`,t[n[G(a)]]],[`c${a}`,n[rt(a)]],[`p${a}`,n[it(a)]]]))}}))}}function J(e,t){let n=Object.entries(q).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,q.none[t]]}function bt(e){return["interpolate",["linear"],["zoom"],9,["*",J(e,"size"),.45],12,J(e,"size"),16,["*",J(e,"size"),1.9]]}function vt(e){e.addSource(_e,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:X,type:"circle",source:_e,paint:{"circle-color":J(0,"color"),"circle-radius":bt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function De(e,t,n){return U=await S(`/api/change?radius=${t}`),e.getSource(_e).setData(Wn(U)),Ce(e,n),U}function Ce(e,t){let n=L.indexOf(t);e.setPaintProperty(X,"circle-color",J(n,"color")),e.setPaintProperty(X,"circle-radius",bt(n)),Te(e,t)}function wt(e,t,n){A.has(t)?A.delete(t):A.add(t),Te(e,n)}function St(e,t){A.clear(),Te(e,t)}function Te(e,t){let n=L.indexOf(t),o=["none",...A];e.setFilter(X,["!",["in",["get",`b${n}`],["literal",o]]])}function Lt(e,t,n){let o=L.indexOf(t),a=e[`b${o}`],s=n.find(p=>p.key===a)?.label??a,c=e[`c${o}`],i=e[`p${o}`];return`<b>${s}</b><br>${c} \u2192 ${i} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Me="surface",Z="surface-fill",kt="#6b7280",Ee=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,kt],[.138,kt],[1,"#12a163"],[2,"#0b7a48"]],R="#e8232f",D="#0f79c9",$t=2,Q=null,xt=!1;function ee(){return Q}function _t(){return xt}function Ot(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-$t,Math.min($t,n))}function Rt(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Dt(e,t,n,o,a,s,c,i){let d={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let h=c.lat0+(p[1]+.5)*c.dlat,g=c.lon0+(p[0]+.5)*c.dlon;if(h<o||h>s||g<n||g>a)continue;let $=p[we(t)],x=p[Se(t)],M=Rt($,x);if(M!=="none")if(M==="ramp"){let u=Ot($,x);d[u<-.138?"less":u>.138?"more":"same"]+=i}else d[M]+=i}return d}function Gn(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let c=t+s[1]*o,i=c+o,d=n+s[0]*a,p=d+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[d,c],[p,c],[p,i],[d,i],[d,c]]]},properties:Object.fromEntries(L.flatMap((h,g)=>{let $=s[we(g)],x=s[Se(g)];return[[`k${g}`,Rt($,x)],[`v${g}`,Ot($,x)??0]]}))}})}}function Ct(e){return["case",["==",["get",`k${e}`],"gone"],R,["==",["get",`k${e}`],"new"],D,["interpolate",["linear"],["get",`v${e}`],...Ee.flatMap(([t,n])=>[t,n])]]}function j(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Tt(e,t){e.addSource(Me,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Z,type:"fill",source:Me,layout:{visibility:"none"},paint:{"fill-color":Ct(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,j(0,.85),13,j(0,.62),16,j(0,.45)]}},t)}async function Pe(e,t,n){return Q=await S(`/api/surface?radius=${t}`),e.getSource(Me).setData(Gn(Q)),Ae(e,n),Q}function Ae(e,t){let n=L.indexOf(t);e.setPaintProperty(Z,"fill-color",Ct(n)),e.setPaintProperty(Z,"fill-opacity",["interpolate",["linear"],["zoom"],9,j(n,.85),13,j(n,.62),16,j(n,.45)])}function Mt(e,t){xt=t,e.setLayoutProperty(Z,"visibility",t?"visible":"none")}var je="corridor",Et="corridor-lines",oe="#8b929c",Un="#6f7783",ne={lost:R,added:D,kept:oe};var te=null,Pt=!1;function ae(){return te}function Ne(){return Pt}function qn(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function At(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Xn(){let e=t=>["match",["get","klass"],"lost",ne.lost,"added",ne.added,t];return["interpolate",["linear"],["zoom"],9,e(Un),14,e(oe)]}function Qn(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Zn(){return["match",["get","klass"],"kept",.85,.9]}function jt(e,t){e.addSource(je,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Et,type:"line",source:je,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Xn(),"line-width":Qn(),"line-opacity":Zn()}},t)}async function Fe(e,t){return te=await S(`/api/corridors?day=${t}`),e.getSource(je).setData(qn(te)),te}async function Nt(e,t){L.includes(t)&&await Fe(e,t)}function Ft(e,t){Pt=t,e.setLayoutProperty(Et,"visibility",t?"visible":"none")}var Je="#2b3038",Ht="#b9bec6",B={loses:{color:R,size:6},gains:{color:D,size:6},keeps:{color:oe,size:3},here:{color:Je,size:3.5},none:{color:Ht,size:1.8}},re=["loses","gains","keeps","none","here"],He="oneseat",Jt="oneseat-dots",se=null,Bt=!1;function N(){return se}function Be(){return Bt}function It(e,t,n,o,a,s){let c={};for(let i of t)c[i]=0;for(let i of e){let d=i[0],p=i[1];if(d<o||d>s||p<n||p>a)continue;let h=t[i[3]];h!==void 0&&c[h]++}return c}function eo(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function to(){return["match",["get","status"],...Object.entries(B).flatMap(([e,t])=>[e,t.color]),Ht]}function no(){let e=["match",["get","status"],...Object.entries(B).flatMap(([t,n])=>[t,n.size]),B.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Kt(e,t){e.addSource(He,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Jt,type:"circle",source:He,layout:{visibility:"none"},paint:{"circle-color":to(),"circle-radius":no(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function oo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var ao="pin";function zt(e){return"key"in e?e.key:ao}var ie="any";function so(e,t,n){return`radius=${e}&${oo(t)}&day=${n}`}function Yt(e,t){return e?t:ie}function Vt(e,t){return e!=="oneseat"||t}async function Ie(e,t,n,o=ie){return se=await S(`/api/oneseat?${so(t,n,o)}`),e.getSource(He).setData(eo(se)),se}function Wt(e,t){Bt=t,e.setLayoutProperty(Jt,"visibility",t?"visible":"none")}function Ke(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Gt(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",c=Ke(t);return e.status==="here"?`<b>at ${c}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${c}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var ze={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ro(e){return e.buckets.filter(t=>t.key!=="none")}function io(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Dt(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=i=>i.toFixed(i<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Ee.map(([i,d])=>`${d} ${((i+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${R}"></i>loses all service</span>
        <span><i style="background:${D}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var lo=["lost","added","kept"],co={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},uo={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Ut(e,t){let{lostPct:n,addedPct:o}=At(t.km),a=i=>i.toFixed(1),c=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${c}</b> km of street, citywide \u2014 ${uo[t.day]}
    </div>
    ${lo.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${ne[i]}"></i>
        <span class="lg-lab">${m(co[i])}</span>
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
      what you can still reach on foot.</div>`}function qt(e,t,n){let o=t.statuses.map(h=>h.key),a=It(t.points,o,n.west,n.south,n.east,n.north),s=h=>t.statuses.find(g=>g.key===h)?.label??h,c=re.reduce((h,g)=>h+(a[g]??0),0),i=Ke(t),d=t.day&&t.day!==ie,p=d?`Restricted to routes running on ${ze[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${m(i)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${d?` \xB7 ${ze[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${re.map(h=>`
      <div class="lg-row lg-static">
        <i style="background:${B[h].color}"></i>
        <span class="lg-lab">${m(s(h))}</span>
        <span class="lg-n">${(a[h]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${re.map(h=>`${(t.counts[h]??0).toLocaleString()} ${m(s(h))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${m(i)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Xt(e,t,n,o,a){let s=t.buckets.map(p=>p.key),c=gt(t.points,t.days.indexOf(n),s,o.west,o.south,o.east,o.north),i=ro(t),d=i.reduce((p,h)=>p+c[h.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${d.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${ze[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${i.map(p=>`
      <button class="lg-row ${Re(p.key)?"off":""}" data-bucket="${m(p.key)}"
              aria-pressed="${!Re(p.key)}">
        <i style="background:${q[p.key]?.color??"#666"}"></i>
        <span class="lg-lab">${m(p.label)}</span>
        <span class="lg-n">${c[p.key].toLocaleString()}</span>
      </button>`).join("")}
    ${a?io(a,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var Ye="#4aa3ff",an="#ffa23a",Ve="headline",le="journey",sn="journey-rides",rn="journey-walks",po=[sn,rn],ln=null,cn=!1;function de(){return ln}function We(){return cn}function mo(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let c of s.legs){let i=c.from??e.origin,d=c.to??e.destination,p=[[i.lon,i.lat],[d.lon,d.lat]],h=c.path?.length?c.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:h},properties:{side:a,kind:c.kind,route:c.route}})}}return{type:"FeatureCollection",features:o}}function Qt(){return["match",["get","side"],"current",Ye,"proposed",an,Ye]}function Zt(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function dn(e,t){e.addSource(le,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:sn,type:"line",source:le,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Qt(),"line-width":Zt(1),"line-opacity":.85}},t),e.addLayer({id:rn,type:"line",source:le,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Qt(),"line-width":Zt(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function un(e,t){cn=t;for(let n of po)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Ge(e,t){ln=t;let n=t?mo(t,Ve):{type:"FeatureCollection",features:[]};e.getSource(le).setData(n)}function pn(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var en=e=>`${e.toFixed(1)} min`;function mn(e){return e==null?"\u2014":e===0?"no change":e>0?`${en(e)} slower`:`${en(-e)} faster`}function tn(e,t){return e?e.name?m(e.name):`stop ${m(e.stop_id)}`:t}function ho(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=tn(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${m(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${tn(e.to,"the destination")}</span></div>`}function nn(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(ho(a,t)),o=a}return n.join("")}var yo={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function ce(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function fo(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function go(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${ce(t.current)} \u2192
        ${ce(t.proposed)} min</span>
        <span class="muted">${mn(t.change_min)}</span></div>
      ${o}
    </div>`}function on(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Ue(e,t){let n=e.radii[Ve],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${m(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${E(e.window.start_min)}
        and ${E(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${yo[n.classification]??""}</p>
      </div>
      ${on(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${ce(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${ce(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${mn(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${fo(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?nn(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?nn(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${go(e)}
    ${on(e)}`}function hn(e){return`
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
    </div>`}function yn(e){let t=e?e.radii[Ve].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Ye}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${an}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var qe=" \xB7 ",fn={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"};function gn(e){return fn[e]??e}var bo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},vo=["oneseat","journey"];function wo(e){return e!=="journey"}function So(e){let t=[fn[e.view]??e.view];return vo.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":bo[e.day]),wo(e.view)&&t.push(`${e.radius} m walk`),t.join(qe)}function bn(e){let[t,...n]=So(e).split(qe);return`<b>${m(t)}</b>${n.map(o=>qe+m(o)).join("")}`}var O=["peek","half","full"],Lo=192,ko=.3,$o=.55,xo=.9,_o=.6,Oo=.45;function ue(e,t){return e==="peek"?Math.min(Lo,t*ko):e==="half"?t*$o:t*xo}function Ro(e,t,n=0){let o=O.map(s=>Math.abs(ue(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>_o&&(a=Math.max(0,Math.min(O.length-1,a+(n>0?1:-1)))),O[a]}function vn(e){return O[(O.indexOf(e)+1)%O.length]}function Do(e,t){return Math.min(e,t*Oo)}function I(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}var Co=8,To=400;function wn(e){let t=r("side"),n=r("sheet-handle"),o="peek",a=!1,s=0,c=0,i=0,d={y:0,t:0};function p(){return window.innerHeight}function h(u){t.style.height=`${u}px`,e.onMove(u,Do(u,p()))}function g(u){o=u,t.dataset.snap=u,h(ue(u,p()))}n.addEventListener("pointerdown",u=>{I()&&(a=!0,s=u.clientY,c=t.getBoundingClientRect().height,i=u.timeStamp,d={y:u.clientY,t:u.timeStamp},t.classList.add("dragging"),n.setPointerCapture(u.pointerId))}),n.addEventListener("pointermove",u=>{if(!a)return;let et=c+(s-u.clientY),W=ue("peek",p()),ge=ue("full",p());h(Math.max(W,Math.min(ge,et))),d={y:u.clientY,t:u.timeStamp}});function $(u){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(u.clientY-s)>Co)&&u.timeStamp-i<To){g(vn(o));return}let W=u.timeStamp-d.t,ge=W>0?(d.y-u.clientY)/W:0;g(Ro(t.getBoundingClientRect().height,p(),ge))}n.addEventListener("pointerup",$),n.addEventListener("pointercancel",$),n.addEventListener("keydown",u=>{u.key!=="Enter"&&u.key!==" "||(u.preventDefault(),I()&&g(vn(o)))});let x=null;function M(){let u=I();if(u!==x&&(x=u,e.onLayoutChange(u)),!u){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}g(o)}return window.addEventListener("resize",M),M(),{at:()=>I()?o:"full",atLeast(u){I()&&O.indexOf(u)>O.indexOf(o)&&g(u)}}}var Mo=[-79.9959,40.4406],Eo="#e2574c",k=400,K=null,f=null,pe=null,T=0,b={key:"downtown"},C=null,kn=!1,Y=!1,y="dots",$n,Xe=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Mo,zoom:12,attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{ot(l),vt(l),Tt(l,"change-dots"),jt(l,"change-dots"),Kt(l,"walk-fill"),dn(l),F(),l.on("click",t=>{if(kn){he({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Dn(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});l.on("mouseenter","change-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","change-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=Oe();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Lt(n.properties,w(),o.buckets)).addTo(l)}),l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=N();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Gt(n.properties,o)).addTo(l)}),l.on("moveend",v),z("[data-radius]",t=>{k=Number(t.dataset.radius),De(l,k,w()).then(v),ee()&&Pe(l,k,w()).then(v),N()&&me(),f&&H(f.lat,f.lon)}),z("[data-day]",t=>{let n=t.dataset.day;dt(n),y!=="journey"&&F(),Ce(l,n),Ae(l,n),y==="journey"&&f&&Qe(f.lat,f.lon),ae()&&Nt(l,n).then(v),Y&&N()&&(me(),f&&H(f.lat,f.lon)),v()}),z("[data-oneseat-day]",t=>{Y=t.dataset.oneseatDay==="selected",Ln(),me(),f&&H(f.lat,f.lon)}),z("[data-view]",t=>{let n=y;y=t.dataset.view,l.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),Fo(y==="surface"||y==="both"),Ho(y==="corridors"),Io(y==="oneseat"),Bo(y==="journey",n==="journey"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),Jo(y!=="corridors"&&y!=="journey");let o=y==="oneseat"||y==="journey";r("dest-controls").classList.toggle("hidden",!o),r("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),Ln(),o||ye(!1),_n()}),z("[data-dest]",t=>{let n=t.dataset.dest;if(n==="pin"){ye(!0);return}ye(!1),he({key:n})}),r("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(wt(l,n.dataset.bucket,w()),v())}),r("legend-reset").addEventListener("click",()=>{St(l,w()),v()}),r("legend-collapse").addEventListener("click",()=>{Sn(!r("legend-box").classList.contains("collapsed"))}),r("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&he({key:n.dataset.gotoDest})}),r("side-toggle").addEventListener("click",jo),$n=wn({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Sn}),Po(),fe(),De(l,k,w()).then(v),Yo(),zo()});function z(e,t){document.querySelectorAll(e).forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(e).forEach(o=>o.classList.toggle("active",o===n)),t(n),fe()})})}function fe(){r("statebar").innerHTML=bn({view:y,day:w(),radius:k,oneSeatRestricted:Y,destination:V()}),Ao()}function Sn(e){r("legend-box").classList.toggle("collapsed",e);let t=r("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Po(){let e=t=>{r("app").classList.toggle("controls-open",t),r("controls-toggle").setAttribute("aria-expanded",String(t))};r("controls-toggle").addEventListener("click",()=>{e(!r("app").classList.contains("controls-open"))}),r("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Ao(){r("controls-toggle").firstChild?.remove(),r("controls-toggle").prepend(document.createTextNode(gn(y)))}function jo(){let e=r("app").classList.toggle("side-collapsed"),t=r("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function v(){No()}function No(){if(r("legend-reset").classList.toggle("hidden",Ne()||Be()||We()),We()){r("legend").innerHTML=yn(de());return}if(Ne()){let n=ae();n&&Ut(r("legend"),n);return}if(Be()){let n=N();if(!n)return;let o=l.getBounds();qt(r("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Oe();if(!e)return;let t=l.getBounds();Xt(r("legend"),e,w(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},_t()?ee():null)}async function Fo(e){if(e&&!ee()){r("legend").classList.add("loading");try{await Pe(l,k,w())}finally{r("legend").classList.remove("loading")}}Mt(l,e),v()}async function Ho(e){if(e&&!ae()){r("legend").classList.add("loading");try{await Fe(l,w())}finally{r("legend").classList.remove("loading")}}Ft(l,e),v()}function Jo(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(r("panel").scrollTop=0),!pe){y==="oneseat"?r("panel").innerHTML=ft(V()):ut(r("panel"));return}if(y==="oneseat"){let t=yt(pe,b,w());if(t){r("panel").innerHTML=t;return}}ht(pe)}function Bo(e,t=!1){if(un(l,e),v(),!e){t&&(f?H(f.lat,f.lon):F());return}de()&&f?r("panel").innerHTML=Ue(de(),V()):r("panel").innerHTML=hn(V())}async function Qe(e,t){let n=++T;f={lat:e,lon:t},Rn(e,t);let o=On(),a=m(V());if(!o){r("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}r("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(pn({lat:e,lon:t},o,w()));if(n!==T)return;Ge(l,s),r("panel").innerHTML=Ue(s,a),v()}catch(s){if(n!==T)return;Ge(l,null),r("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Ln(){r("day-controls").classList.toggle("hidden",!Vt(y,Y))}function Ze(){return Yt(Y,w())}async function Io(e){e&&!N()&&await xn(()=>Ie(l,k,b,Ze())),Wt(l,e),v()}async function me(){await xn(()=>Ie(l,k,b,Ze())),v()}async function xn(e){r("legend").classList.add("loading");try{return await e()}finally{r("legend").classList.remove("loading")}}function he(e){if(b=e,ye(!1),Ko(),_n(),fe(),y==="journey"){f&&Qe(f.lat,f.lon),v();return}f?H(f.lat,f.lon):F({scrollToTop:!0}),me()}function _n(){let e=On();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in b))){C?.remove(),C=null;return}C?C.setLngLat([e.lon,e.lat]).addTo(l):(C=new maplibregl.Marker({color:Je,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),C.on("dragend",()=>{let n=C.getLngLat();he({lat:n.lat,lon:n.lng})}))}function Ko(){let e=zt(b);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function On(){if("lat"in b)return{lat:b.lat,lon:b.lon};let e=b.key,t=Xe.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function V(){if("lat"in b)return`${b.lat.toFixed(4)}, ${b.lon.toFixed(4)}`;let e=b.key;return Xe.find(t=>t.key===e)?.name??e}function ye(e){kn=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function H(e,t){let n=++T;f={lat:e,lon:t},r("panel").classList.add("loading"),Rn(e,t);try{let o="lat"in b?`&dest_lat=${b.lat.toFixed(6)}&dest_lon=${b.lon.toFixed(6)}`:"",a=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${k}${o}&oneseat_day=${Ze()}`);if(n!==T)return;at(l,e,t,k,a.current.stops,a.proposed.stops),pe=a,F({scrollToTop:!0})}catch(o){if(n!==T)return;r("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===T&&r("panel").classList.remove("loading")}}function Rn(e,t){K?K.setLngLat([t,e]):(K=new maplibregl.Marker({color:Eo,draggable:!0}).setLngLat([t,e]).addTo(l),K.on("dragend",()=>{let n=K.getLngLat();Dn(n.lat,n.lng)}))}function Dn(e,t){if($n.atLeast("half"),y==="journey"){Qe(e,t);return}H(e,t)}async function zo(){try{Xe=await S("/api/destinations"),fe()}catch{}}async function Yo(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;r("feedline").textContent=t,r("feedline-methods").textContent=t,r("caveats").innerHTML=e.caveats.map(n=>`<li>${n.text}</li>`).join("")}catch{}}r("methods-open").addEventListener("click",()=>r("methods").classList.add("open"));r("methods-close").addEventListener("click",()=>r("methods").classList.remove("open"));})();
