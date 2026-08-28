"use strict";(()=>{function i(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function L(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function h(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function A(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Re(e){return e>0?`+${e}`:String(e)}function yt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var eo="#4aa3ff",to="#ffa23a";function no(e,t,n,o=96){let a=[],s=n/111320,c=n/(111320*Math.cos(e*Math.PI/180));for(let r=0;r<=o;r++){let d=r/o*2*Math.PI;a.push([t+c*Math.cos(d),e+s*Math.sin(d)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function N(e){return{type:"FeatureCollection",features:e}}function ft(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function gt(e){e.addSource("walk",{type:"geojson",data:N([])}),e.addSource("stops-now",{type:"geojson",data:N([])}),e.addSource("stops-prop",{type:"geojson",data:N([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":to,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":eo,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function bt(e,t,n,o,a,s){e.getSource("walk").setData(N([no(t,n,o)])),e.getSource("stops-now").setData(N(ft(a,"current"))),e.getSource("stops-prop").setData(N(ft(s,"proposed")))}var k=["weekday","saturday","sunday"],_e=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],wt={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},vt=e=>3+3*e,St=e=>4+3*e,oe=e=>5+3*e;var De=e=>2+2*e,Te=e=>3+2*e;var Ce="weekday";function w(){return Ce}function $t(e){Ce=e}function xt(e){e.innerHTML=`
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
    </div>`}function oo(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function ao(e,t){let n=Math.max(1,..._e.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return _e.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,c=s-a,r=c>0?"up":c<0?"down":"flat";return`
      <tr>
        <th>${wt[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${r}">${c===0?"\xB7":Re(c)}</td>
      </tr>`}).join("")}function R(e){return e.length?e.map(t=>`<span class="route">${h(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Lt(e){return e.first==null?'<span class="muted">no service</span>':`${A(e.first)} \u2013 ${A(e.last)}`}function kt(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var so={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},ro={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function io(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=R(o.current),s=R(o.proposed),c=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${a}</div>
         <div class="rrow"><span class="rlab">proposed</span>${s}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${h(o.name)}</span>
          <span class="os-status ${h(o.status)}">${so[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${c}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. ${t==="any"?`Counted on any calendar, which is the published measure \u2014 no day
             type enters it.`:`Restricted to routes running on ${ro[t]??t},
             which is not the published measure \u2014 that one counts a route
             calling here on any calendar.`}
        It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function U(e){return e.place?.hood||e.place?.muni||"this location"}function Ot(e){return e==="weekday"?"weekday":e}function Rt(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ot(t)}`}function Ee(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,c=s>0?"up":s<0?"down":"flat",r=kt(o),d=kt(a);return`
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
        ${s===0?"no change":`${Re(s)} trips`}
        <div class="muted">${yt(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ot(t)}, both directions</div>

    <div class="tiers">${oo(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${ao(o,a)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
      <span><i class="sw-walk"></i> the ${e.radius} m walk</span>
      <span><i class="sw-pin"></i> where you clicked</span>
    </div>
    <div class="key-note">The same colours mark the map: each dot is one stop,
      blue for today and orange for the plan. A stop both networks keep at the
      same spot draws as a blue dot inside an orange ring rather than as two
      marks; one the plan nudges across the intersection draws as two, which is
      renumbering rather than a change in service. Only the stops inside the
      dashed circle are counted above.</div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${Lt(o)} <span class="muted">\u2192</span> ${Lt(a)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${r==null?"\u2014":`${r} min`} <span class="muted">\u2192</span> ${d==null?"\u2014":`${d} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${n}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${R(o.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${R(a.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}function _t(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${h(U(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ee(e,Ce,io(e.oneseat??[],e.oneseat_day??"any"))}`}var lo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},co={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},uo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function po(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Me(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${R(t)}</div>`:""}function mo(e){let t=Me("kept",e.kept)+Me("lost",e.lost)+Me("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ho(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      <div class="rrow"><span class="rlab">today</span>${R(e.current)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${R(e.proposed)}</div>
    </div>`}function yo(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${h(a.key)}">
      <span class="os-name">${h(a.name)}</span>
      <span class="os-status ${h(a.status)}">${fo[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var fo={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function go(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${uo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Dt(e,t,n){let o=po(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":mo(o)+ho(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${h(o.name)}</h2>
      <div class="muted">
        from ${h(U(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${h(o.status)}">${lo[o.status]}</div>
    <p class="note">${co[o.status]} ${go(a)}</p>

    ${s}

    ${yo(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Rt(e,n)}</summary>
      ${Ee(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Tt(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${h(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var se={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Pe="change",re="change-dots",ae=null,F=new Set;function Ae(){return ae}function Ne(e){return F.has(e)}function Ct(e,t,n,o,a,s,c){let r={};for(let d of n)r[d]=0;for(let d of e){let u=d[0],p=d[1];if(u<a||u>c||p<o||p>s)continue;let g=n[d[oe(t)]];g!==void 0&&r[g]++}return r}function bo(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>k.some((o,a)=>t[n[oe(a)]]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(k.flatMap((o,a)=>[[`b${a}`,t[n[oe(a)]]],[`c${a}`,n[vt(a)]],[`p${a}`,n[St(a)]]]))}}))}}function Y(e,t){let n=Object.entries(se).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,se.none[t]]}function Et(e){return["interpolate",["linear"],["zoom"],9,["*",Y(e,"size"),.45],12,Y(e,"size"),16,["*",Y(e,"size"),1.9]]}function Mt(e){e.addSource(Pe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:re,type:"circle",source:Pe,paint:{"circle-color":Y(0,"color"),"circle-radius":Et(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function Fe(e,t,n){return ae=await L(`/api/change?radius=${t}`),e.getSource(Pe).setData(bo(ae)),He(e,n),ae}function He(e,t){let n=k.indexOf(t);e.setPaintProperty(re,"circle-color",Y(n,"color")),e.setPaintProperty(re,"circle-radius",Et(n)),je(e,t)}function Pt(e,t,n){F.has(t)?F.delete(t):F.add(t),je(e,n)}function At(e,t){F.clear(),je(e,t)}function je(e,t){let n=k.indexOf(t),o=["none",...F];e.setFilter(re,["!",["in",["get",`b${n}`],["literal",o]]])}function Nt(e,t,n){let o=k.indexOf(t),a=e[`b${o}`],s=n.find(u=>u.key===a)?.label??a,c=e[`c${o}`],r=e[`p${o}`];return`<b>${s}</b><br>${c} \u2192 ${r} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Je="surface",le="surface-fill",Ft="#6b7280",Be=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Ft],[.138,Ft],[1,"#12a163"],[2,"#0b7a48"]],T="#e8232f",C="#0f79c9",Ht=2,ie=null,jt=!1;function ce(){return ie}function Jt(){return jt}function Bt(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Ht,Math.min(Ht,n))}function It(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function zt(e,t,n,o,a,s,c,r){let d={gone:0,less:0,same:0,more:0,new:0};for(let u of e){let p=c.lat0+(u[1]+.5)*c.dlat,g=c.lon0+(u[0]+.5)*c.dlon;if(p<o||p>s||g<n||g>a)continue;let O=u[De(t)],D=u[Te(t)],P=It(O,D);if(P!=="none")if(P==="ramp"){let m=Bt(O,D);d[m<-.138?"less":m>.138?"more":"same"]+=r}else d[P]+=r}return d}function wo(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let c=t+s[1]*o,r=c+o,d=n+s[0]*a,u=d+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[d,c],[u,c],[u,r],[d,r],[d,c]]]},properties:Object.fromEntries(k.flatMap((p,g)=>{let O=s[De(g)],D=s[Te(g)];return[[`k${g}`,It(O,D)],[`v${g}`,Bt(O,D)??0]]}))}})}}function Kt(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Be.flatMap(([t,n])=>[t,n])]]}function H(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Ut(e,t){e.addSource(Je,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:le,type:"fill",source:Je,layout:{visibility:"none"},paint:{"fill-color":Kt(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,H(0,.85),13,H(0,.62),16,H(0,.45)]}},t)}async function Ie(e,t,n){return ie=await L(`/api/surface?radius=${t}`),e.getSource(Je).setData(wo(ie)),ze(e,n),ie}function ze(e,t){let n=k.indexOf(t);e.setPaintProperty(le,"fill-color",Kt(n)),e.setPaintProperty(le,"fill-opacity",["interpolate",["linear"],["zoom"],9,H(n,.85),13,H(n,.62),16,H(n,.45)])}function Yt(e,t){jt=t,e.setLayoutProperty(le,"visibility",t?"visible":"none")}var Ke="corridor",Vt="corridor-lines",pe="#8b929c",vo="#6f7783",ue={lost:T,added:C,kept:pe};var de=null,Wt=!1;function me(){return de}function Ue(){return Wt}function So(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Gt(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Lo(){let e=t=>["match",["get","klass"],"lost",ue.lost,"added",ue.added,t];return["interpolate",["linear"],["zoom"],9,e(vo),14,e(pe)]}function ko(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function $o(){return["match",["get","klass"],"kept",.85,.9]}function qt(e,t){e.addSource(Ke,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Vt,type:"line",source:Ke,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Lo(),"line-width":ko(),"line-opacity":$o()}},t)}async function Ye(e,t){return de=await L(`/api/corridors?day=${t}`),e.getSource(Ke).setData(So(de)),de}async function Xt(e,t){k.includes(t)&&await Ye(e,t)}function Qt(e,t){Wt=t,e.setLayoutProperty(Vt,"visibility",t?"visible":"none")}var We="#2b3038",Zt="#b9bec6",V={loses:{color:T,size:6},gains:{color:C,size:6},keeps:{color:pe,size:3},here:{color:We,size:3.5},none:{color:Zt,size:1.8}},ye=["loses","gains","keeps","none","here"],Ve="oneseat",en="oneseat-dots",he=null,tn=!1;function j(){return he}function Ge(){return tn}function nn(e,t,n,o,a,s){let c={};for(let r of t)c[r]=0;for(let r of e){let d=r[0],u=r[1];if(d<o||d>s||u<n||u>a)continue;let p=t[r[3]];p!==void 0&&c[p]++}return c}function xo(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Oo(){return["match",["get","status"],...Object.entries(V).flatMap(([e,t])=>[e,t.color]),Zt]}function Ro(){let e=["match",["get","status"],...Object.entries(V).flatMap(([t,n])=>[t,n.size]),V.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function on(e,t){e.addSource(Ve,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:en,type:"circle",source:Ve,layout:{visibility:"none"},paint:{"circle-color":Oo(),"circle-radius":Ro(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function _o(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Do="pin";function an(e){return"key"in e?e.key:Do}var fe="any";function To(e,t,n){return`radius=${e}&${_o(t)}&day=${n}`}function sn(e,t){return e?t:fe}function rn(e,t){return e!=="oneseat"||t}async function qe(e,t,n,o=fe){return he=await L(`/api/oneseat?${To(t,n,o)}`),e.getSource(Ve).setData(xo(he)),he}function ln(e,t){tn=t,e.setLayoutProperty(en,"visibility",t?"visible":"none")}function Xe(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function cn(e,t){let n=t.statuses.find(r=>r.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=r=>r.length?r.join(", "):"none",c=Xe(t);return e.status==="here"?`<b>at ${c}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${c}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var Qe={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Co(e){return e.buckets.filter(t=>t.key!=="none")}function Eo(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=zt(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Be.map(([r,d])=>`${d} ${((r+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service</span>
        <span><i style="background:${C}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var Mo=["lost","added","kept"],Po={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Ao={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function dn(e,t){let{lostPct:n,addedPct:o}=Gt(t.km),a=r=>r.toFixed(1),c=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${c}</b> km of street, citywide \u2014 ${Ao[t.day]}
    </div>
    ${Mo.map(r=>`
      <div class="lg-row lg-static">
        <i style="background:${ue[r]}"></i>
        <span class="lg-lab">${h(Po[r])}</span>
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
      what you can still reach on foot.</div>`}function un(e,t,n){let o=t.statuses.map(p=>p.key),a=nn(t.points,o,n.west,n.south,n.east,n.north),s=p=>t.statuses.find(g=>g.key===p)?.label??p,c=ye.reduce((p,g)=>p+(a[g]??0),0),r=Xe(t),d=t.day&&t.day!==fe,u=d?`Restricted to routes running on ${Qe[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${h(r)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${d?` \xB7 ${Qe[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${ye.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${V[p].color}"></i>
        <span class="lg-lab">${h(s(p))}</span>
        <span class="lg-n">${(a[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${ye.map(p=>`${(t.counts[p]??0).toLocaleString()} ${h(s(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${h(r)} without transferring?
      ${u} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function pn(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}function mn(e,t,n,o,a){let s=t.buckets.map(u=>u.key),c=Ct(t.points,t.days.indexOf(n),s,o.west,o.south,o.east,o.north),r=Co(t),d=r.reduce((u,p)=>u+c[p.key],0);e.innerHTML=`
    <div class="lg-head">
      <b>${d.toLocaleString()}</b> locations in view
      <span class="muted">\xB7 ${Qe[n]} \xB7 ${t.radius} m walk</span>
    </div>
    ${r.map(u=>`
      <button class="lg-row ${Ne(u.key)?"off":""}" data-bucket="${h(u.key)}"
              aria-pressed="${!Ne(u.key)}">
        <i style="background:${se[u.key]?.color??"#666"}"></i>
        <span class="lg-lab">${h(u.label)}</span>
        <span class="lg-n">${c[u.key].toLocaleString()}</span>
      </button>`).join("")}
    ${a?Eo(a,n,o):""}
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}var Ze="#4aa3ff",vn="#ffa23a",et="headline",ge="journey",Sn="journey-rides",Ln="journey-walks",No=[Sn,Ln],kn=null,$n=!1;function we(){return kn}function tt(){return $n}function Fo(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let c of s.legs){let r=c.from??e.origin,d=c.to??e.destination,u=[[r.lon,r.lat],[d.lon,d.lat]],p=c.path?.length?c.path:u;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:a,kind:c.kind,route:c.route}})}}return{type:"FeatureCollection",features:o}}function hn(){return["match",["get","side"],"current",Ze,"proposed",vn,Ze]}function yn(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function xn(e,t){e.addSource(ge,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Sn,type:"line",source:ge,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":hn(),"line-width":yn(1),"line-opacity":.85}},t),e.addLayer({id:Ln,type:"line",source:ge,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":hn(),"line-width":yn(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function On(e,t){$n=t;for(let n of No)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function nt(e,t){kn=t;let n=t?Fo(t,et):{type:"FeatureCollection",features:[]};e.getSource(ge).setData(n)}function Rn(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var fn=e=>`${e.toFixed(1)} min`;function _n(e){return e==null?"\u2014":e===0?"no change":e>0?`${fn(e)} slower`:`${fn(-e)} faster`}function gn(e,t){return e?e.name?h(e.name):`stop ${h(e.stop_id)}`:t}function Ho(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=gn(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${h(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${gn(e.to,"the destination")}</span></div>`}function bn(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Ho(a,t)),o=a}return n.join("")}var jo={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function be(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Jo(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Bo(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${be(t.current)} \u2192
        ${be(t.proposed)} min</span>
        <span class="muted">${_n(t.change_min)}</span></div>
      ${o}
    </div>`}function wn(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function ot(e,t){let n=e.radii[et],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${h(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${A(e.window.start_min)}
        and ${A(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${jo[n.classification]??""}</p>
      </div>
      ${wn(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${be(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${be(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${_n(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Jo(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?bn(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?bn(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Bo(e)}
    ${wn(e)}`}function Dn(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${h(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function Tn(e){let t=e?e.radii[et].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Ze}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${vn}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var at=" \xB7 ",st={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"},Cn=Object.keys(st);function En(e){return st[e]??e}var Io={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},zo=["oneseat","journey"];function Ko(e){return e!=="journey"}function Uo(e){let t=[st[e.view]??e.view];return zo.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Io[e.day]),Ko(e.view)&&t.push(`${e.radius} m walk`),t.join(at)}function Mn(e){let[t,...n]=Uo(e).split(at);return`<b>${h(t)}</b>${n.map(o=>at+h(o)).join("")}`}var v={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",at:"at",camera:"map"},ve={any:"any",selected:"selected"},Yo="pin",Pn=5;function Nn(e){try{return e.self!==e.top}catch{return!0}}function Fn(e){let t=new URLSearchParams;return t.set(v.view,e.view),t.set(v.day,e.day),t.set(v.radius,String(e.radius)),t.set(v.oneSeatDay,e.oneSeatRestricted?ve.selected:ve.any),t.set(v.dest,"key"in e.dest?e.dest.key:rt(e.dest)),e.at&&t.set(v.at,rt(e.at)),e.camera&&t.set(v.camera,`${rt(e.camera)},${e.camera.zoom.toFixed(2)}`),`?${t}`}function Hn(e){let t=new URLSearchParams(e),n={},o=t.get(v.view);o&&Cn.includes(o)&&(n.view=o);let a=t.get(v.day);a&&k.includes(a)&&(n.day=a);let s=Number(t.get(v.radius));t.has(v.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s);let c=t.get(v.oneSeatDay);c===ve.selected?n.oneSeatRestricted=!0:c===ve.any&&(n.oneSeatRestricted=!1);let r=t.get(v.dest);if(r&&r!==Yo){let p=An(r);p?n.dest=p:r.includes(",")||(n.dest={key:r})}let d=An(t.get(v.at));d&&(n.at=d);let u=Vo(t.get(v.camera));return u&&(n.camera=u),n}function rt(e){return`${e.lat.toFixed(Pn)},${e.lon.toFixed(Pn)}`}function An(e){let t=jn(e,2);return t?{lat:t[0],lon:t[1]}:null}function Vo(e){let t=jn(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function jn(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var it="embed";var Wo=["1","true","yes"];function Jn(e){let t=new URLSearchParams(e).get(it);return t!==null&&Wo.includes(t.toLowerCase())}function Bn(e){let t=new URLSearchParams(e);return t.set(it,"1"),`?${t}`}function In(e){let t=new URLSearchParams(e);t.delete(it);let n=String(t);return n?`?${n}`:""}function zn(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var _=["peek","half","full"],Go=192,qo=.3,Xo=.55,Qo=.9,Zo=.6,ea=.45;function Se(e,t){return e==="peek"?Math.min(Go,t*qo):e==="half"?t*Xo:t*Qo}function ta(e,t,n=0){let o=_.map(s=>Math.abs(Se(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>Zo&&(a=Math.max(0,Math.min(_.length-1,a+(n>0?1:-1)))),_[a]}function Kn(e){return _[(_.indexOf(e)+1)%_.length]}function na(e,t){return Math.min(e,t*ea)}function J(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function lt(e){let t=null,n=()=>{let o=J();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var oa=8,aa=400;function Un(e){let t=i("side"),n=i("sheet-handle"),o="peek",a=!1,s=0,c=0,r=0,d={y:0,t:0};function u(){return window.innerHeight}function p(m){t.style.height=`${m}px`,e.onMove(m,na(m,u()))}function g(m){o=m,t.dataset.snap=m,p(Se(m,u()))}n.addEventListener("pointerdown",m=>{J()&&(a=!0,s=m.clientY,c=t.getBoundingClientRect().height,r=m.timeStamp,d={y:m.clientY,t:m.timeStamp},t.classList.add("dragging"),n.setPointerCapture(m.pointerId))}),n.addEventListener("pointermove",m=>{if(!a)return;let ht=c+(s-m.clientY),ne=Se("peek",u()),Oe=Se("full",u());p(Math.max(ne,Math.min(Oe,ht))),d={y:m.clientY,t:m.timeStamp}});function O(m){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(m.clientY-s)>oa)&&m.timeStamp-r<aa){g(Kn(o));return}let ne=m.timeStamp-d.t,Oe=ne>0?(d.y-m.clientY)/ne:0;g(ta(t.getBoundingClientRect().height,u(),Oe))}n.addEventListener("pointerup",O),n.addEventListener("pointercancel",O),n.addEventListener("keydown",m=>{m.key!=="Enter"&&m.key!==" "||(m.preventDefault(),J()&&g(Kn(o)))});let D=lt(e.onLayoutChange);function P(){if(D(),!J()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}g(o)}return window.addEventListener("resize",P),P(),{at:()=>J()?o:"full",atLeast(m){J()&&_.indexOf(m)>_.indexOf(o)&&g(m)}}}var sa=[-79.9959,40.4406],ra=12,ia="#e2574c",x={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},X=Hn(location.search),Z=Jn(location.search);Z&&i("app").classList.add("embed");var la={at:()=>"full",atLeast(){}},Vn=null,$=400,W=null,f=null,B=null,M=0,b={key:"downtown"},E=null,Wn=!1,K=!1,y="dots",Gn,dt=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:X.camera?[X.camera.lon,X.camera.lat]:sa,zoom:X.camera?.zoom??ra,cooperativeGestures:Nn(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{gt(l),Mt(l),Ut(l,"change-dots"),qt(l,"change-dots"),on(l,"walk-fill"),xn(l),I(),l.on("click",t=>{if(Wn){Q({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];mt(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});l.on("mouseenter","change-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","change-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=Ae();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Nt(n.properties,w(),o.buckets)).addTo(l)}),l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=j();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(cn(n.properties,o)).addTo(l)}),l.on("moveend",()=>{let t=l.getCenter();Vn={lat:t.lat,lon:t.lng,zoom:l.getZoom()},S(),te()}),G(x.radius,t=>{$=Number(t.dataset.radius),Fe(l,$,w()).then(S),ce()&&Ie(l,$,w()).then(S),j()&&Le(),f&&z(f.lat,f.lon)}),G(x.day,t=>{let n=t.dataset.day;$t(n),y!=="journey"&&I(),He(l,n),ze(l,n),y==="journey"&&f&&ut(f.lat,f.lon),me()&&Xt(l,n).then(S),K&&j()&&(Le(),f&&z(f.lat,f.lon)),S()}),G(x.oneSeatDay,t=>{K=t.dataset.oneseatDay==="selected",Yn(),Le(),f&&z(f.lat,f.lon)}),G(x.view,t=>{let n=y;y=t.dataset.view,l.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),ha(y==="surface"||y==="both"),ya(y==="corridors"),ba(y==="oneseat"),ga(y==="journey",n==="journey"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&I({scrollToTop:!0}),fa(y!=="corridors"&&y!=="journey");let o=y==="oneseat"||y==="journey";i("dest-controls").classList.toggle("hidden",!o),i("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),Yn(),o||ke(!1),Xn()}),G(x.dest,t=>{let n=t.dataset.dest;if(n==="pin"){ke(!0);return}ke(!1),Q({key:n})}),i("legend").addEventListener("click",t=>{let n=t.target.closest("[data-bucket]");n&&(Pt(l,n.dataset.bucket,w()),S())}),i("legend-reset").addEventListener("click",()=>{At(l,w()),S()}),i("legend-collapse").addEventListener("click",()=>{ct(!i("legend-box").classList.contains("collapsed"))}),i("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Q({key:n.dataset.gotoDest})}),i("side-toggle").addEventListener("click",pa),Z&&lt(ct),Gn=Z?la:Un({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:ct}),da(),xe(),$e(),ca(X)||Fe(l,$,w()).then(S),La(),Sa()});function G(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),xe(),te()})})}function q(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function ca(e){let t=!1;return e.radius!==void 0&&(t=q(x.radius,String(e.radius))||t),e.day&&(t=q(x.day,e.day)||t),e.oneSeatRestricted!==void 0&&q(x.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.dest&&("key"in e.dest?q(x.dest,e.dest.key):Q(e.dest)),e.view&&q(x.view,e.view),e.at&&mt(e.at.lat,e.at.lon),t}function te(){let e={view:y,day:w(),radius:$,oneSeatRestricted:K,dest:b,at:f,camera:Vn},t=Fn(e);history.replaceState(null,"",(Z?Bn(t):t)+location.hash),$e(t)}function $e(e=In(location.search)){if(!Z)return;let t=i("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?B?U(B):"this point":null;t.querySelector(".el-action").textContent=zn(n)}function xe(){i("statebar").innerHTML=Mn({view:y,day:w(),radius:$,oneSeatRestricted:K,destination:ee()}),ua()}function ct(e){i("legend-box").classList.toggle("collapsed",e);let t=i("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function da(){let e=t=>{i("app").classList.toggle("controls-open",t),i("controls-toggle").setAttribute("aria-expanded",String(t))};i("controls-toggle").addEventListener("click",()=>{e(!i("app").classList.contains("controls-open"))}),i("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function ua(){i("controls-toggle").firstChild?.remove(),i("controls-toggle").prepend(document.createTextNode(En(y)))}function pa(){let e=i("app").classList.toggle("side-collapsed"),t=i("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function S(){ma()}function ma(){if(i("legend-reset").classList.toggle("hidden",Ue()||Ge()||tt()),tt()){i("legend").innerHTML=Tn(we());return}if(Ue()){let n=me();n&&dn(i("legend"),n);return}if(Ge()){let n=j();if(!n)return;let o=l.getBounds();un(i("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Ae();if(!e)return;let t=l.getBounds();mn(i("legend"),e,w(),{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},Jt()?ce():null)}async function ha(e){if(e&&!ce()){i("legend").classList.add("loading");try{await Ie(l,$,w())}finally{i("legend").classList.remove("loading")}}Yt(l,e),S()}async function ya(e){if(e&&!me()){i("legend").classList.add("loading");try{await Ye(l,w())}finally{i("legend").classList.remove("loading")}}Qt(l,e),S()}function fa(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function I({scrollToTop:e=!1}={}){if(e&&(i("panel").scrollTop=0),$e(),!B){y==="oneseat"?i("panel").innerHTML=Tt(ee()):xt(i("panel"));return}if(y==="oneseat"){let t=Dt(B,b,w());if(t){i("panel").innerHTML=t;return}}_t(B)}function ga(e,t=!1){if(On(l,e),S(),!e){t&&(f?z(f.lat,f.lon):I());return}we()&&f?i("panel").innerHTML=ot(we(),ee()):i("panel").innerHTML=Dn(ee())}async function ut(e,t){let n=++M;f={lat:e,lon:t},te(),Zn(e,t);let o=Qn(),a=h(ee());if(!o){i("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}i("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await L(Rn({lat:e,lon:t},o,w()));if(n!==M)return;nt(l,s),i("panel").innerHTML=ot(s,a),S(),$e()}catch(s){if(n!==M)return;nt(l,null),i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Yn(){i("day-controls").classList.toggle("hidden",!rn(y,K))}function pt(){return sn(K,w())}async function ba(e){e&&!j()&&await qn(()=>qe(l,$,b,pt())),ln(l,e),S()}async function Le(){await qn(()=>qe(l,$,b,pt())),S()}async function qn(e){i("legend").classList.add("loading");try{return await e()}finally{i("legend").classList.remove("loading")}}function Q(e){if(b=e,ke(!1),wa(),Xn(),xe(),te(),y==="journey"){f&&ut(f.lat,f.lon),S();return}f?z(f.lat,f.lon):I({scrollToTop:!0}),Le()}function Xn(){let e=Qn();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in b))){E?.remove(),E=null;return}E?E.setLngLat([e.lon,e.lat]).addTo(l):(E=new maplibregl.Marker({color:We,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),E.on("dragend",()=>{let n=E.getLngLat();Q({lat:n.lat,lon:n.lng})}))}function wa(){let e=an(b);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Qn(){if("lat"in b)return{lat:b.lat,lon:b.lon};let e=b.key,t=dt.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ee(){if("lat"in b)return`${b.lat.toFixed(4)}, ${b.lon.toFixed(4)}`;let e=b.key;return dt.find(t=>t.key===e)?.name??e}function ke(e){Wn=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function z(e,t){let n=++M;f={lat:e,lon:t},te(),i("panel").classList.add("loading"),Zn(e,t);try{let o="lat"in b?`&dest_lat=${b.lat.toFixed(6)}&dest_lon=${b.lon.toFixed(6)}`:"",a=await L(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${$}${o}&oneseat_day=${pt()}`);if(n!==M)return;bt(l,e,t,$,a.current.stops,a.proposed.stops),va(),B=a,I({scrollToTop:!0})}catch(o){if(n!==M)return;i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===M&&i("panel").classList.remove("loading")}}function va(){i("pin-key").innerHTML=pn($),i("pin-key").classList.remove("hidden")}function Zn(e,t){W?W.setLngLat([t,e]):(W=new maplibregl.Marker({color:ia,draggable:!0}).setLngLat([t,e]).addTo(l),W.on("dragend",()=>{let n=W.getLngLat();mt(n.lat,n.lng)}))}function mt(e,t){if(Gn.atLeast("half"),y==="journey"){ut(e,t);return}z(e,t)}async function Sa(){try{dt=await L("/api/destinations"),xe()}catch{}}async function La(){try{let e=await L("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;i("feedline").textContent=t,i("feedline-methods").textContent=t,i("caveats").innerHTML=e.caveats.map(n=>`<li>${n.text}</li>`).join("")}catch{}}i("methods-open").addEventListener("click",()=>i("methods").classList.add("open"));i("methods-close").addEventListener("click",()=>i("methods").classList.remove("open"));})();
