"use strict";(()=>{function i(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function k(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function h(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function H(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Ee(e){return e>0?`+${e}`:String(e)}function wt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var lo="#4aa3ff",co="#ffa23a";function uo(e,t,n,o=96){let a=[],r=n/111320,l=n/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=o;s++){let d=s/o*2*Math.PI;a.push([t+l*Math.cos(d),e+r*Math.sin(d)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function j(e){return{type:"FeatureCollection",features:e}}function vt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function St(e){e.addSource("walk",{type:"geojson",data:j([])}),e.addSource("stops-now",{type:"geojson",data:j([])}),e.addSource("stops-prop",{type:"geojson",data:j([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":co,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":lo,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let r=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${r.name}</b><br>${r.side==="current"?"today":"proposed"}
                  \xB7 stop ${r.stop_id} \xB7 ${r.metres} m`).addTo(e)})}function Lt(e,t,n,o,a,r){e.getSource("walk").setData(j([uo(t,n,o)])),e.getSource("stops-now").setData(j(vt(a,"current"))),e.getSource("stops-prop").setData(j(vt(r,"proposed")))}var $=["weekday","saturday","sunday"],Me=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],kt={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ie=4,$t=e=>3+ie*e,xt=e=>4+ie*e,G=e=>5+ie*e,po=e=>6+ie*e;var E=(e,t)=>e[t],Rt=(e,t)=>e[po(t)],Pe=e=>2+2*e,Ae=e=>3+2*e;var Ne="weekday";function L(){return Ne}function Dt(e){Ne=e}function Tt(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
         the view chosen in the toolbar on the map. Pan and zoom to read a
         neighbourhood.</p>
      <p><b>Locations</b> draws one dot per place a bus stops today, coloured
         by what the plan does to the buses within a short walk. Its key counts
         those places, or \u2014 on the Riders setting \u2014 the boardings PRT records
         at them, which is the same map read as who is affected rather than
         where. Boardings exist only where a bus stops today, so that reading
         can weigh what is at risk and never what is gained.
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
    </div>`}function mo(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function ho(e,t){let n=Math.max(1,...Me.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Me.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,l=r-a,s=l>0?"up":l<0?"down":"flat";return`
      <tr>
        <th>${kt[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${s}">${l===0?"\xB7":Ee(l)}</td>
      </tr>`}).join("")}function T(e){return e.length?e.map(t=>`<span class="route">${h(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Ot(e){return e.first==null?'<span class="muted">no service</span>':`${H(e.first)} \u2013 ${H(e.last)}`}function _t(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var yo={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},fo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function go(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=T(o.current),r=T(o.proposed),l=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${a}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${h(o.name)}</span>
          <span class="os-status ${h(o.status)}">${yo[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${l}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. ${t==="any"?`Counted on any calendar, which is the published measure \u2014 no day
             type enters it.`:`Restricted to routes running on ${fo[t]??t},
             which is not the published measure \u2014 that one counts a route
             calling here on any calendar.`}
        It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function q(e){return e.place?.hood||e.place?.muni||"this location"}function Ct(e){return e==="weekday"?"weekday":e}function Et(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ct(t)}`}function Fe(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],r=a.trips-o.trips,l=r>0?"up":r<0?"down":"flat",s=_t(o),d=_t(a);return`
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
      <div class="hl-delta ${l}">
        ${r===0?"no change":`${Ee(r)} trips`}
        <div class="muted">${wt(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ct(t)}, both directions</div>

    <div class="tiers">${mo(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${ho(o,a)}</tbody>
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
      <dd>${Ot(o)} <span class="muted">\u2192</span> ${Ot(a)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${d==null?"\u2014":`${d} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${n}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${T(o.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${T(a.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}function Mt(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${h(q(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Fe(e,Ne,go(e.oneseat??[],e.oneseat_day??"any"))}`}var bo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},wo={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},vo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function So(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function He(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${T(t)}</div>`:""}function Lo(e){let t=He("kept",e.kept)+He("lost",e.lost)+He("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ko(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      <div class="rrow"><span class="rlab">today</span>${T(e.current)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${T(e.proposed)}</div>
    </div>`}function $o(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${h(a.key)}">
      <span class="os-name">${h(a.name)}</span>
      <span class="os-status ${h(a.status)}">${xo[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var xo={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Ro(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${vo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Pt(e,t,n){let o=So(e,t);if(!o)return"";let a=e.oneseat_day??"any",r=o.status==="here"?"":Lo(o)+ko(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${h(o.name)}</h2>
      <div class="muted">
        from ${h(q(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${h(o.status)}">${bo[o.status]}</div>
    <p class="note">${wo[o.status]} ${Ro(a)}</p>

    ${r}

    ${$o(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Et(e,n)}</summary>
      ${Fe(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function At(e){return`
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
    </div>`}var ce={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},je="change",de="change-dots",le=null,J=new Set;function Je(){return le}function Be(e){return J.has(e)}function Nt(e,t,n,o,a,r,l){let s={};for(let d of n)s[d]=0;for(let d of e){if(!Ft(d,o,a,r,l))continue;let p=n[E(d,G(t))];p!==void 0&&s[p]++}return s}function Ft(e,t,n,o,a){let r=E(e,0),l=E(e,1);return r>=n&&r<=a&&l>=t&&l<=o}function Ht(e,t,n,o,a,r,l){let s={riders:{},measured:{},unmeasured:0};for(let d of n)s.riders[d]=0,s.measured[d]=0;for(let d of e){if(!Ft(d,o,a,r,l))continue;let p=n[E(d,G(t))];if(p===void 0)continue;let m=Rt(d,t);if(m===null){p!=="none"&&s.unmeasured++;continue}s.riders[p]+=m,s.measured[p]++}return s}function Oo(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>$.some((o,a)=>t[E(n,G(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries($.flatMap((o,a)=>[[`b${a}`,t[E(n,G(a))]],[`c${a}`,n[$t(a)]],[`p${a}`,n[xt(a)]]]))}}))}}function X(e,t){let n=Object.entries(ce).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,ce.none[t]]}function jt(e){return["interpolate",["linear"],["zoom"],9,["*",X(e,"size"),.45],12,X(e,"size"),16,["*",X(e,"size"),1.9]]}function Jt(e){e.addSource(je,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:de,type:"circle",source:je,paint:{"circle-color":X(0,"color"),"circle-radius":jt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function Ie(e,t,n){return le=await k(`/api/change?radius=${t}`),e.getSource(je).setData(Oo(le)),ze(e,n),le}function ze(e,t){let n=$.indexOf(t);e.setPaintProperty(de,"circle-color",X(n,"color")),e.setPaintProperty(de,"circle-radius",jt(n)),Ke(e,t)}function Bt(e,t,n){J.has(t)?J.delete(t):J.add(t),Ke(e,n)}function It(e,t){J.clear(),Ke(e,t)}function Ke(e,t){let n=$.indexOf(t),o=["none",...J];e.setFilter(de,["!",["in",["get",`b${n}`],["literal",o]]])}function zt(e,t,n){let o=$.indexOf(t),a=e[`b${o}`],r=n.find(p=>p.key===a)?.label??a,l=e[`c${o}`],s=e[`p${o}`];return`<b>${r}</b><br>${l} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var We="surface",pe="surface-fill",Kt="#6b7280",Ue=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Kt],[.138,Kt],[1,"#12a163"],[2,"#0b7a48"]],M="#e8232f",P="#0f79c9",Wt=2,ue=null,Ut=!1;function me(){return ue}function Yt(){return Ut}function Vt(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Wt,Math.min(Wt,n))}function Gt(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function qt(e,t,n,o,a,r,l,s){let d={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=l.lat0+(p[1]+.5)*l.dlat,b=l.lon0+(p[0]+.5)*l.dlon;if(m<o||m>r||b<n||b>a)continue;let R=p[Pe(t)],O=p[Ae(t)],D=Gt(R,O);if(D!=="none")if(D==="ramp"){let u=Vt(R,O);d[u<-.138?"less":u>.138?"more":"same"]+=s}else d[D]+=s}return d}function _o(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let l=t+r[1]*o,s=l+o,d=n+r[0]*a,p=d+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[d,l],[p,l],[p,s],[d,s],[d,l]]]},properties:Object.fromEntries($.flatMap((m,b)=>{let R=r[Pe(b)],O=r[Ae(b)];return[[`k${b}`,Gt(R,O)],[`v${b}`,Vt(R,O)??0]]}))}})}}function Xt(e){return["case",["==",["get",`k${e}`],"gone"],M,["==",["get",`k${e}`],"new"],P,["interpolate",["linear"],["get",`v${e}`],...Ue.flatMap(([t,n])=>[t,n])]]}function B(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Qt(e,t){e.addSource(We,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:pe,type:"fill",source:We,layout:{visibility:"none"},paint:{"fill-color":Xt(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,B(0,.85),13,B(0,.62),16,B(0,.45)]}},t)}async function Ye(e,t,n){return ue=await k(`/api/surface?radius=${t}`),e.getSource(We).setData(_o(ue)),Ve(e,n),ue}function Ve(e,t){let n=$.indexOf(t);e.setPaintProperty(pe,"fill-color",Xt(n)),e.setPaintProperty(pe,"fill-opacity",["interpolate",["linear"],["zoom"],9,B(n,.85),13,B(n,.62),16,B(n,.45)])}function Zt(e,t){Ut=t,e.setLayoutProperty(pe,"visibility",t?"visible":"none")}var Ge="corridor",en="corridor-lines",fe="#8b929c",Do="#6f7783",ye={lost:M,added:P,kept:fe};var he=null,tn=!1;function ge(){return he}function qe(){return tn}function To(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function nn(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Co(){let e=t=>["match",["get","klass"],"lost",ye.lost,"added",ye.added,t];return["interpolate",["linear"],["zoom"],9,e(Do),14,e(fe)]}function Eo(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Mo(){return["match",["get","klass"],"kept",.85,.9]}function on(e,t){e.addSource(Ge,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:en,type:"line",source:Ge,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Co(),"line-width":Eo(),"line-opacity":Mo()}},t)}async function Xe(e,t){return he=await k(`/api/corridors?day=${t}`),e.getSource(Ge).setData(To(he)),he}async function an(e,t){$.includes(t)&&await Xe(e,t)}function rn(e,t){tn=t,e.setLayoutProperty(en,"visibility",t?"visible":"none")}var Ze="#2b3038",sn="#b9bec6",Q={loses:{color:M,size:6},gains:{color:P,size:6},keeps:{color:fe,size:3},here:{color:Ze,size:3.5},none:{color:sn,size:1.8}},we=["loses","gains","keeps","none","here"],Qe="oneseat",ln="oneseat-dots",be=null,cn=!1;function I(){return be}function et(){return cn}function dn(e,t,n,o,a,r){let l={};for(let s of t)l[s]=0;for(let s of e){let d=s[0],p=s[1];if(d<o||d>r||p<n||p>a)continue;let m=t[s[3]];m!==void 0&&l[m]++}return l}function Po(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Ao(){return["match",["get","status"],...Object.entries(Q).flatMap(([e,t])=>[e,t.color]),sn]}function No(){let e=["match",["get","status"],...Object.entries(Q).flatMap(([t,n])=>[t,n.size]),Q.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function un(e,t){e.addSource(Qe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ln,type:"circle",source:Qe,layout:{visibility:"none"},paint:{"circle-color":Ao(),"circle-radius":No(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Fo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Ho="pin";function pn(e){return"key"in e?e.key:Ho}var ve="any";function jo(e,t,n){return`radius=${e}&${Fo(t)}&day=${n}`}function mn(e,t){return e?t:ve}function hn(e,t){return e!=="oneseat"||t}async function tt(e,t,n,o=ve){return be=await k(`/api/oneseat?${jo(t,n,o)}`),e.getSource(Qe).setData(Po(be)),be}function yn(e,t){cn=t,e.setLayoutProperty(ln,"visibility",t?"visible":"none")}function nt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function fn(e,t){let n=t.statuses.find(s=>s.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=s=>s.length?s.join(", "):"none",l=nt(t);return e.status==="here"?`<b>at ${l}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${l}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var ot={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Jo(e){return e.buckets.filter(t=>t.key!=="none")}function Bo(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=qt(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=s=>s.toFixed(s<10?1:0);return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Ue.map(([s,d])=>`${d} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${M}"></i>loses all service</span>
        <span><i style="background:${P}"></i>new service</span>
      </div>
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>
    </div>`}var Io=["lost","added","kept"],zo={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Ko={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function bn(e,t){let{lostPct:n,addedPct:o}=nn(t.km),a=s=>s.toFixed(1),l=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${l}</b> km of street, citywide \u2014 ${Ko[t.day]}
    </div>
    ${Io.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${ye[s]}"></i>
        <span class="lg-lab">${h(zo[s])}</span>
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
      what you can still reach on foot.</div>`}function wn(e,t,n){let o=t.statuses.map(m=>m.key),a=dn(t.points,o,n.west,n.south,n.east,n.north),r=m=>t.statuses.find(b=>b.key===m)?.label??m,l=we.reduce((m,b)=>m+(a[b]??0),0),s=nt(t),d=t.day&&t.day!==ve,p=d?`Restricted to routes running on ${ot[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${h(s)}</b>
      <span class="muted">\xB7 ${l.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${d?` \xB7 ${ot[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${we.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${Q[m].color}"></i>
        <span class="lg-lab">${h(r(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${we.map(m=>`${(t.counts[m]??0).toLocaleString()} ${h(r(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${h(s)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function vn(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var gn={locations:"Locations",riders:"Riders"};function Wo(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function Sn(e,t){let{layer:n,day:o,bounds:a,weight:r,surface:l}=t,s=n.buckets.map(g=>g.key),d=n.days.indexOf(o),{west:p,south:m,east:b,north:R}=a,O=Jo(n),D=Nt(n.points,d,s,p,m,b,R),u=r==="riders"?Ht(n.points,d,s,p,m,b,R):null,se=g=>u?u.measured[g]?Math.round(u.riders[g]).toLocaleString():"\u2014":D[g].toLocaleString(),F=u?`<b>${Math.round(O.reduce((g,Ce)=>g+u.riders[Ce.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${O.reduce((g,Ce)=>g+D[Ce.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${F}
      <span class="muted">\xB7 ${ot[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(gn).map(g=>`
        <button data-weight="${g}" aria-pressed="${r===g}"
                class="${r===g?"active":""}">${gn[g]}</button>`).join("")}
    </div>
    ${O.map(g=>`
      <button class="lg-row ${Be(g.key)?"off":""}" data-bucket="${h(g.key)}"
              aria-pressed="${!Be(g.key)}">
        <i style="background:${ce[g.key]?.color??"#666"}"></i>
        <span class="lg-lab">${h(g.label)}</span>
        <span class="lg-n">${se(g.key)}</span>
      </button>`).join("")}
    ${l?Bo(l,o,a):""}
    ${u?Wo(u.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var at="#4aa3ff",_n="#ffa23a",rt="headline",Se="journey",Dn="journey-rides",Tn="journey-walks",Uo=[Dn,Tn],Cn=null,En=!1;function ke(){return Cn}function st(){return En}function Yo(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let l of r.legs){let s=l.from??e.origin,d=l.to??e.destination,p=[[s.lon,s.lat],[d.lon,d.lat]],m=l.path?.length?l.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:l.kind,route:l.route}})}}return{type:"FeatureCollection",features:o}}function Ln(){return["match",["get","side"],"current",at,"proposed",_n,at]}function kn(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Mn(e,t){e.addSource(Se,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Dn,type:"line",source:Se,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Ln(),"line-width":kn(1),"line-opacity":.85}},t),e.addLayer({id:Tn,type:"line",source:Se,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Ln(),"line-width":kn(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Pn(e,t){En=t;for(let n of Uo)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function it(e,t){Cn=t;let n=t?Yo(t,rt):{type:"FeatureCollection",features:[]};e.getSource(Se).setData(n)}function An(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var $n=e=>`${e.toFixed(1)} min`;function Nn(e){return e==null?"\u2014":e===0?"no change":e>0?`${$n(e)} slower`:`${$n(-e)} faster`}function xn(e,t){return e?e.name?h(e.name):`stop ${h(e.stop_id)}`:t}function Vo(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=xn(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${h(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${xn(e.to,"the destination")}</span></div>`}function Rn(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(Vo(a,t)),o=a}return n.join("")}var Go={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Le(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function qo(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Xo(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Le(t.current)} \u2192
        ${Le(t.proposed)} min</span>
        <span class="muted">${Nn(t.change_min)}</span></div>
      ${o}
    </div>`}function On(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function lt(e,t){let n=e.radii[rt],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${h(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${H(e.window.start_min)}
        and ${H(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Go[n.classification]??""}</p>
      </div>
      ${On(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Le(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Le(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Nn(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${qo(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Rn(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Rn(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Xo(e)}
    ${On(e)}`}function Fn(e){return`
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
    </div>`}function Hn(e){let t=e?e.radii[rt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${at}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${_n}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var ct=" \xB7 ",dt={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"},jn=Object.keys(dt);function Jn(e){return dt[e]??e}var Qo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Zo=["oneseat","journey"];function ea(e){return e!=="journey"}function ta(e){let t=[dt[e.view]??e.view];return Zo.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Qo[e.day]),ea(e.view)&&t.push(`${e.radius} m walk`),t.join(ct)}function Bn(e){let[t,...n]=ta(e).split(ct);return`<b>${h(t)}</b>${n.map(o=>ct+h(o)).join("")}`}var w={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",at:"at",camera:"map"},$e={any:"any",selected:"selected"},na="pin",In=5;function Kn(e){try{return e.self!==e.top}catch{return!0}}function Wn(e){let t=new URLSearchParams;return t.set(w.view,e.view),t.set(w.day,e.day),t.set(w.radius,String(e.radius)),t.set(w.oneSeatDay,e.oneSeatRestricted?$e.selected:$e.any),t.set(w.dest,"key"in e.dest?e.dest.key:ut(e.dest)),e.weight==="riders"&&t.set(w.weight,e.weight),e.at&&t.set(w.at,ut(e.at)),e.camera&&t.set(w.camera,`${ut(e.camera)},${e.camera.zoom.toFixed(2)}`),`?${t}`}function Un(e){let t=new URLSearchParams(e),n={},o=t.get(w.view);o&&jn.includes(o)&&(n.view=o);let a=t.get(w.day);a&&$.includes(a)&&(n.day=a);let r=Number(t.get(w.radius));t.has(w.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(w.weight)==="riders"?n.weight="riders":t.get(w.weight)==="locations"&&(n.weight="locations");let l=t.get(w.oneSeatDay);l===$e.selected?n.oneSeatRestricted=!0:l===$e.any&&(n.oneSeatRestricted=!1);let s=t.get(w.dest);if(s&&s!==na){let m=zn(s);m?n.dest=m:s.includes(",")||(n.dest={key:s})}let d=zn(t.get(w.at));d&&(n.at=d);let p=oa(t.get(w.camera));return p&&(n.camera=p),n}function ut(e){return`${e.lat.toFixed(In)},${e.lon.toFixed(In)}`}function zn(e){let t=Yn(e,2);return t?{lat:t[0],lon:t[1]}:null}function oa(e){let t=Yn(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Yn(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var pt="embed";var aa=["1","true","yes"];function Vn(e){let t=new URLSearchParams(e).get(pt);return t!==null&&aa.includes(t.toLowerCase())}function Gn(e){let t=new URLSearchParams(e);return t.set(pt,"1"),`?${t}`}function qn(e){let t=new URLSearchParams(e);t.delete(pt);let n=String(t);return n?`?${n}`:""}function Xn(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var C=["peek","half","full"],ra=192,sa=.3,ia=.55,la=.9,ca=.6,da=.45;function xe(e,t){return e==="peek"?Math.min(ra,t*sa):e==="half"?t*ia:t*la}function ua(e,t,n=0){let o=C.map(r=>Math.abs(xe(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>ca&&(a=Math.max(0,Math.min(C.length-1,a+(n>0?1:-1)))),C[a]}function Qn(e){return C[(C.indexOf(e)+1)%C.length]}function pa(e,t){return Math.min(e,t*da)}function z(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function mt(e){let t=null,n=()=>{let o=z();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var ma=8,ha=400;function Zn(e){let t=i("side"),n=i("sheet-handle"),o="peek",a=!1,r=0,l=0,s=0,d={y:0,t:0};function p(){return window.innerHeight}function m(u){t.style.height=`${u}px`,e.onMove(u,pa(u,p()))}function b(u){o=u,t.dataset.snap=u,m(xe(u,p()))}n.addEventListener("pointerdown",u=>{z()&&(a=!0,r=u.clientY,l=t.getBoundingClientRect().height,s=u.timeStamp,d={y:u.clientY,t:u.timeStamp},t.classList.add("dragging"),n.setPointerCapture(u.pointerId))}),n.addEventListener("pointermove",u=>{if(!a)return;let se=l+(r-u.clientY),F=xe("peek",p()),g=xe("full",p());m(Math.max(F,Math.min(g,se))),d={y:u.clientY,t:u.timeStamp}});function R(u){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(u.clientY-r)>ma)&&u.timeStamp-s<ha){b(Qn(o));return}let F=u.timeStamp-d.t,g=F>0?(d.y-u.clientY)/F:0;b(ua(t.getBoundingClientRect().height,p(),g))}n.addEventListener("pointerup",R),n.addEventListener("pointercancel",R),n.addEventListener("keydown",u=>{u.key!=="Enter"&&u.key!==" "||(u.preventDefault(),z()&&b(Qn(o)))});let O=mt(e.onLayoutChange);function D(){if(O(),!z()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",D),D(),{at:()=>z()?o:"full",atLeast(u){z()&&C.indexOf(u)>C.indexOf(o)&&b(u)}}}var ya=[-79.9959,40.4406],fa=12,ga="#e2574c",_={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},ne=Un(location.search),ae=Vn(location.search);ae&&i("app").classList.add("embed");var ba={at:()=>"full",atLeast(){}},to=null,x=400,Z=null,f=null,K=null,N=0,v={key:"downtown"},A=null,no=!1,Y=!1,_e="locations",y="dots",oo,yt=[],c=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ne.camera?[ne.camera.lon,ne.camera.lat]:ya,zoom:ne.camera?.zoom??fa,cooperativeGestures:Kn(window),attributionControl:{compact:!0}});c.addControl(new maplibregl.NavigationControl,"top-right");c.on("load",()=>{St(c),Jt(c),Qt(c,"change-dots"),on(c,"change-dots"),un(c,"walk-fill"),Mn(c),W(),c.on("click",t=>{if(no){oe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(r=>c.getLayoutProperty(r,"visibility")!=="none"),o=c.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];bt(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});c.on("mouseenter","change-dots",()=>{c.getCanvas().style.cursor="pointer"}),c.on("mouseleave","change-dots",()=>{c.getCanvas().style.cursor="",e.remove()}),c.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=Je();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(zt(n.properties,L(),o.buckets)).addTo(c)}),c.on("mouseenter","oneseat-dots",()=>{c.getCanvas().style.cursor="pointer"}),c.on("mouseleave","oneseat-dots",()=>{c.getCanvas().style.cursor="",e.remove()}),c.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=I();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(fn(n.properties,o)).addTo(c)}),c.on("moveend",()=>{let t=c.getCenter();to={lat:t.lat,lon:t.lng,zoom:c.getZoom()},S(),V()}),ee(_.radius,t=>{x=Number(t.dataset.radius),Ie(c,x,L()).then(S),me()&&Ye(c,x,L()).then(S),I()&&Re(),f&&U(f.lat,f.lon)}),ee(_.day,t=>{let n=t.dataset.day;Dt(n),y!=="journey"&&W(),ze(c,n),Ve(c,n),y==="journey"&&f&&ft(f.lat,f.lon),ge()&&an(c,n).then(S),Y&&I()&&(Re(),f&&U(f.lat,f.lon)),S()}),ee(_.oneSeatDay,t=>{Y=t.dataset.oneseatDay==="selected",eo(),Re(),f&&U(f.lat,f.lon)}),ee(_.view,t=>{let n=y;y=t.dataset.view,c.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),$a(y==="surface"||y==="both"),xa(y==="corridors"),_a(y==="oneseat"),Oa(y==="journey",n==="journey"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&W({scrollToTop:!0}),Ra(y!=="corridors"&&y!=="journey");let o=y==="oneseat"||y==="journey";i("dest-controls").classList.toggle("hidden",!o),i("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),eo(),o||Oe(!1),ro()}),ee(_.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Oe(!0);return}Oe(!1),oe({key:n})}),i("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){_e=n.dataset.weight,S(),V();return}let o=t.target.closest("[data-bucket]");o&&(Bt(c,o.dataset.bucket,L()),S())}),i("legend-reset").addEventListener("click",()=>{It(c,L()),S()}),i("legend-collapse").addEventListener("click",()=>{ht(!i("legend-box").classList.contains("collapsed"))}),i("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&oe({key:n.dataset.gotoDest})}),i("side-toggle").addEventListener("click",La),ae&&mt(ht),oo=ae?ba:Zn({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),c.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:ht}),va(),Te(),De(),wa(ne)||Ie(c,x,L()).then(S),Ea(),Ca()});function ee(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),Te(),V()})})}function te(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function wa(e){let t=!1;return e.radius!==void 0&&(t=te(_.radius,String(e.radius))||t),e.day&&(t=te(_.day,e.day)||t),e.oneSeatRestricted!==void 0&&te(_.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(_e=e.weight),e.dest&&("key"in e.dest?te(_.dest,e.dest.key):oe(e.dest)),e.view&&te(_.view,e.view),e.at&&bt(e.at.lat,e.at.lon),t}function V(){let e={view:y,day:L(),radius:x,oneSeatRestricted:Y,weight:_e,dest:v,at:f,camera:to},t=Wn(e);history.replaceState(null,"",(ae?Gn(t):t)+location.hash),De(t)}function De(e=qn(location.search)){if(!ae)return;let t=i("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?K?q(K):"this point":null;t.querySelector(".el-action").textContent=Xn(n)}function Te(){i("statebar").innerHTML=Bn({view:y,day:L(),radius:x,oneSeatRestricted:Y,destination:re()}),Sa()}function ht(e){i("legend-box").classList.toggle("collapsed",e);let t=i("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function va(){let e=t=>{i("app").classList.toggle("controls-open",t),i("controls-toggle").setAttribute("aria-expanded",String(t))};i("controls-toggle").addEventListener("click",()=>{e(!i("app").classList.contains("controls-open"))}),i("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Sa(){i("controls-toggle").firstChild?.remove(),i("controls-toggle").prepend(document.createTextNode(Jn(y)))}function La(){let e=i("app").classList.toggle("side-collapsed"),t=i("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),c.resize()}function S(){ka()}function ka(){if(i("legend-reset").classList.toggle("hidden",qe()||et()||st()),st()){i("legend").innerHTML=Hn(ke());return}if(qe()){let n=ge();n&&bn(i("legend"),n);return}if(et()){let n=I();if(!n)return;let o=c.getBounds();wn(i("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Je();if(!e)return;let t=c.getBounds();Sn(i("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:_e,surface:Yt()?me():null})}async function $a(e){if(e&&!me()){i("legend").classList.add("loading");try{await Ye(c,x,L())}finally{i("legend").classList.remove("loading")}}Zt(c,e),S()}async function xa(e){if(e&&!ge()){i("legend").classList.add("loading");try{await Xe(c,L())}finally{i("legend").classList.remove("loading")}}rn(c,e),S()}function Ra(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function W({scrollToTop:e=!1}={}){if(e&&(i("panel").scrollTop=0),De(),!K){y==="oneseat"?i("panel").innerHTML=At(re()):Tt(i("panel"));return}if(y==="oneseat"){let t=Pt(K,v,L());if(t){i("panel").innerHTML=t;return}}Mt(K)}function Oa(e,t=!1){if(Pn(c,e),S(),!e){t&&(f?U(f.lat,f.lon):W());return}ke()&&f?i("panel").innerHTML=lt(ke(),re()):i("panel").innerHTML=Fn(re())}async function ft(e,t){let n=++N;f={lat:e,lon:t},V(),io(e,t);let o=so(),a=h(re());if(!o){i("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}i("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await k(An({lat:e,lon:t},o,L()));if(n!==N)return;it(c,r),i("panel").innerHTML=lt(r,a),S(),De()}catch(r){if(n!==N)return;it(c,null),i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function eo(){i("day-controls").classList.toggle("hidden",!hn(y,Y))}function gt(){return mn(Y,L())}async function _a(e){e&&!I()&&await ao(()=>tt(c,x,v,gt())),yn(c,e),S()}async function Re(){await ao(()=>tt(c,x,v,gt())),S()}async function ao(e){i("legend").classList.add("loading");try{return await e()}finally{i("legend").classList.remove("loading")}}function oe(e){if(v=e,Oe(!1),Da(),ro(),Te(),V(),y==="journey"){f&&ft(f.lat,f.lon),S();return}f?U(f.lat,f.lon):W({scrollToTop:!0}),Re()}function ro(){let e=so();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in v))){A?.remove(),A=null;return}A?A.setLngLat([e.lon,e.lat]).addTo(c):(A=new maplibregl.Marker({color:Ze,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(c),A.on("dragend",()=>{let n=A.getLngLat();oe({lat:n.lat,lon:n.lng})}))}function Da(){let e=pn(v);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function so(){if("lat"in v)return{lat:v.lat,lon:v.lon};let e=v.key,t=yt.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function re(){if("lat"in v)return`${v.lat.toFixed(4)}, ${v.lon.toFixed(4)}`;let e=v.key;return yt.find(t=>t.key===e)?.name??e}function Oe(e){no=e,c.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function U(e,t){let n=++N;f={lat:e,lon:t},V(),i("panel").classList.add("loading"),io(e,t);try{let o="lat"in v?`&dest_lat=${v.lat.toFixed(6)}&dest_lon=${v.lon.toFixed(6)}`:"",a=await k(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${x}${o}&oneseat_day=${gt()}`);if(n!==N)return;Lt(c,e,t,x,a.current.stops,a.proposed.stops),Ta(),K=a,W({scrollToTop:!0})}catch(o){if(n!==N)return;i("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===N&&i("panel").classList.remove("loading")}}function Ta(){i("pin-key").innerHTML=vn(x),i("pin-key").classList.remove("hidden")}function io(e,t){Z?Z.setLngLat([t,e]):(Z=new maplibregl.Marker({color:ga,draggable:!0}).setLngLat([t,e]).addTo(c),Z.on("dragend",()=>{let n=Z.getLngLat();bt(n.lat,n.lng)}))}function bt(e,t){if(oo.atLeast("half"),y==="journey"){ft(e,t);return}U(e,t)}async function Ca(){try{yt=await k("/api/destinations"),Te()}catch{}}async function Ea(){try{let e=await k("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;i("feedline").textContent=t,i("feedline-methods").textContent=t,i("caveats").innerHTML=e.caveats.map(n=>`<li>${n.text}</li>`).join("")}catch{}}i("methods-open").addEventListener("click",()=>i("methods").classList.add("open"));i("methods-close").addEventListener("click",()=>i("methods").classList.remove("open"));})();
