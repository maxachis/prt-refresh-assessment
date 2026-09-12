"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function D(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Ln=new Map;function J(e){let t=Ln.get(e);if(t)return t;let n=D(e).catch(o=>{throw Ln.delete(e),o});return Ln.set(e,n),n}function u(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function he(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function $n(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function _n(e){return e>0?`+${e}`:String(e)}function lr(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var ll="#15181e",cr="#ffa23a",cl="#ffffff";function ul(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;r.push([t+a*Math.cos(l),e+s*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function Y(e){return{type:"FeatureCollection",features:e}}function dl(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function pl(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function kn(e){return e!=="corridors"&&e!=="journey"&&e!=="places"&&e!=="routes"}function xn(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(Y([]))}function ur(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function dr(e){e.addSource("walk",{type:"geojson",data:Y([])}),e.addSource("stops-now",{type:"geojson",data:Y([])}),e.addSource("stops-prop",{type:"geojson",data:Y([])}),e.addSource("stop-moves",{type:"geojson",data:Y([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":cr,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":cl,"circle-stroke-width":3,"circle-stroke-color":cr}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":ll,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function pr(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>pl(n.properties,e(o))}))}function mr(e,t,n,o,r,s){e.getSource("walk").setData(Y([ul(t,n,o)])),e.getSource("stops-now").setData(Y(ur(r,"current"))),e.getSource("stops-prop").setData(Y(ur(s,"proposed"))),e.getSource("stop-moves").setData(Y(dl(s)))}var x=["weekday","saturday","sunday"],En=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],gr={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ct=4,ut=6,fr=e=>ut+ct*e,hr=e=>ut+1+ct*e,Ie=e=>ut+2+ct*e,ml=e=>ut+3+ct*e,dt=2,gl=3,Ue=4,yr=5,ye=e=>e[gl],M=(e,t)=>e[t],br=(e,t)=>e[ml(t)],On=e=>2+2*e,Dn=e=>3+2*e,pt=4,Sr=e=>2+pt*e,vr=e=>3+pt*e,wr=e=>4+pt*e,Rr=e=>5+pt*e;var fl=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],hl=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],Lr=1e-6,yl=32;function kr(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=fl.map(([i,l])=>(e+i*r+l*s)**3);return hl.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function $r(e,t,n){return kr(e,t,n).every(o=>o>=-Lr&&o<=1+Lr)}function bl(e,t,n){if($r(e,t,n))return t;let o=0,r=t;for(let s=0;s<yl;s++){let a=(o+r)/2;$r(e,a,n)?o=a:r=a}return o}function Sl(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function vl(e,t,n){let[o,r,s]=kr(e,bl(e,t,n),n);return`#${[o,r,s].map(a=>Sl(a).toString(16).padStart(2,"0")).join("")}`}var _r=/(\d+)/;function wl(e,t){let n=e.split(_r),o=t.split(_r);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function je(e){let t=[...new Set(e)].sort(wl);return new Map(t.map((n,o)=>[n,vl(.55,.16,o*360/t.length)]))}var xr="at this stop",Er=e=>`within ${e} m`,Rl="both directions",Ll="one or both directions",Pn="weekday";function R(){return Pn}function Cr(e){Pn=e}function Ar(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
         the view chosen in the toolbar on the map. Pan and zoom to read a
         neighbourhood.</p>
      <p><b>Stop-by-stop</b> draws one dot per stop a bus calls at today,
         coloured by what the plan does to the buses at that stop \u2014 its own
         kerb, not the neighbourhood around it. Each dot says one thing:
         either the plan takes this stop away \u2014 a red cross, on every day of
         the week \u2014 or the stop stays and the colour tells you whether it
         gains or loses buses. A hollow ring is a stop the plan adds, drawn
         wherever the plan adds it. To see what a crossed-out stop leaves
         behind, read the dots around it. Its key counts those stops, or \u2014 on
         the Riders setting \u2014 the boardings PRT records at them, which is the
         same map read as who is affected rather than where. Boardings exist
         only where a bus stops today, so that reading can weigh what is at
         risk and never what is gained.
         <b>Surface</b> asks the other half: not what happens at one kerb but
         what a rider can reach on foot, comparing the buses within a short
         walk at every point on a 100 m grid, so it can also show ground the
         plan adds a bus to \u2014 but it is extent, not people: a hillside counts
         like a city block. A stop can lose its buses while the ground around
         it keeps them, and the two views are how you tell.</p>
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
    </div>`}function Fr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function $l(e,t){let n=Math.max(1,...En.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return En.map(o=>{let r=e.periods[o]??0,s=t.periods[o]??0,a=s-r,i=a>0?"up":a<0?"down":"flat";return`
      <tr>
        <th>${gr[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${a===0?"\xB7":_n(a)}</td>
      </tr>`}).join("")}function Nr(e){return e.length?e.map(t=>`<span class="route">${u(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Or(e){return e.first==null?'<span class="muted">no service</span>':`${he(e.first)}\u2013${he(e.last)}`}function Dr(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var _l={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},kl={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function xl(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':mt(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${u(o.name)}</span>
          <span class="os-status ${u(o.status)}">${_l[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${kl[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${ae("one-seat")}</p>
    </div>`:""}function ae(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ge(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function Tr(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Pr(e){return e.first==null||e.last==null?null:e.last-e.first}function mt(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Mr(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Mr(t,o,"prop",r("proposed"))}</div>
    </div>`}function Mr(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${u(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var Tn=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,El="Allegheny";function Je(e){let t=e.place?.muni?.trim()??"",n=Tn.exec(t)?.[1],o=n===El?t.replace(Tn,""):n?`${t.replace(Tn,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Ke(e){return e==="weekday"?"weekday":e}function Hr(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ke(t)}`}function Ol(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Dl(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function Tl(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${ae("one-direction")}</dt>
      ${Ge(r(n,e.routes),r(o,t.routes))}`}function Br(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Ke(t)}, today only</span>`;return`<dt>Boardings ${u(n)}</dt><dd>${s}${r}</dd>`}function Ir(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${ae("boardings")}</p>`}function Pl(e){if(!e)return"";let t=u(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose all buses
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains all buses under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in
        <button type="button" class="place-link" data-goto-place="${u(e.key)}">${t}</button>
      </h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${ae("place-population")}</p>
    </div>`}function Ur(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${e.trips}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${t.trips}</div>
      </div>
      <div class="hl-delta ${a}">
        ${s===0?"no change":`${_n(s)} trips`}
        <div class="muted">${lr(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ke(n)} ${u(o)}${r?`, ${u(r)}`:""}</div>`}function jr(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${$l(e,t)}</tbody>
    </table>`}function Gr(e,t){let n=Dr(e),o=Dr(t),r=Pr(e),s=Pr(t);return`
      <dt>First and last</dt>
      ${Ge(Or(e),Or(t))}
      <dt>Hours between</dt>
      ${Ge($n(r),$n(s),Tr(r,s,"more"))}
      <dt>Typical wait</dt>
      ${Ge(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,Tr(n,o,"less"))}`}function Kr(e,t,n,o){return`
    <div class="routes">
      <h3>${u(n)}</h3>
      ${mt(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${ae("location-not-route")}</p>
    </div>`}function Ml(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${Ke(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${Ke(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${ae("stop-routes")}</p>`}function Cl(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:je((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${u(i)}
        <span class="muted">\xB7 PRT stop ${u(e.stop_id)}</span></div>
      ${Ur(o,r,t,xr)}
      <div class="tiers">${Fr(o.hourly,r.hourly)}</div>
      ${jr(o,r)}
      <dl class="facts">
        ${Gr(o,r)}
        ${Br(o.boardings,t,xr)}
      </dl>
      ${Ir(o.boardings)}
      ${Kr(o,r,"Routes calling at this stop",a)}
      ${Ml(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${ae("kerb")}</p>
    </section>`}function Mn(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],s=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Ur(o,r,t,Er(e.radius),{directions:s?Ll:Rl})}

    <div class="tiers">${Fr(o.hourly,r.hourly)}</div>

    ${jr(o,r)}
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
      <span><i class="sw-walk"></i> the ${e.radius} m walk</span>
      <span><i class="sw-pin"></i> where you clicked</span>
    </div>
    <div class="key-note">A stop both networks keep draws as an ink dot in an
      orange ring; a dashed line joins a pole the plan moves to where it stands
      today. Two marks with no line are a renumbering.</div>

    <dl class="facts">
      ${Gr(o,r)}
      ${Tl(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Ge(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Dl(e.current.stops)}
      ${Ol(e.proposed.stops)}
      ${Br(o.boardings,t,Er(e.radius))}
    </dl>
    ${Ir(o.boardings)}

    ${n}

    ${Pl(e.population)}

    ${Kr(o,r,"Routes serving this spot")}`}function Al(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,s=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${u(Je(e))}</h2>
      <div class="muted">${s}</div>
    </div>
    ${r?Cl(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${Mn(e,t,xl(e.oneseat??[],e.oneseat_day??"any"))}`}function Jr(e,t={}){document.getElementById("panel").innerHTML=Al(e,Pn,t)}var Fl={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Nl={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Hl={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Bl(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Cn(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Nr(t)}</div>`:""}function Il(e){let t=Cn("kept",e.kept)+Cn("lost",e.lost)+Cn("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Ul(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${mt(e.current,e.proposed)}
    </div>`}function jl(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${u(r.key)}">
      <span class="os-name">${u(r.name)}</span>
      <span class="os-status ${u(r.status)}">${Gl[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Gl={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Kl(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Hl[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Yr(e,t,n){let o=Bl(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":Il(o)+Ul(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${u(o.name)}</h2>
      <div class="muted">
        from ${u(Je(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${u(o.status)}">${Fl[o.status]}</div>
    <p class="note">${Nl[o.status]} ${Kl(r)}</p>

    ${s}

    ${jl(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Hr(e,n)}</summary>
      ${Mn(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Wr(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${u(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var Z={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},be="change",Q="change-dots",ie=["boolean",["feature-state","selected"],!1],Vr="#15181e",le=["==",["get","published"],0],ht="newplace",Jl="#15181e",Yl=5,ft=["==",["get","removed"],1],yt="removedstop",We="change-removed",Nn="change-removed-selected",An="removed-cross",qr="#e8232f";function Wl(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,qr]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var Hn=["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1];function Bn(e){return e.hasImage(An)||e.addImage(An,Wl(),{pixelRatio:2}),An}var gt=null,X=new Set,U=new Set,Vl=[Q,Nn,We],bt=[Q,We],Ve=Q;function Xr(e,t){for(let n of Vl)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function St(){return gt}function ze(e){return X.has(e)}function Zr(e,t,n,o){return r=>Xl(r,e,t,n,o)}function Qr(e){return t=>e.has(ye(t))}function es(){return U}function ts(){return[...U].sort()}function ns(){return U.size}function In(e,t){let n=0;for(let o of t)U.has(o)||(U.add(o),Ye(e,o,!0),n++);return n}function os(e,t){U.delete(t)?Ye(e,t,!1):(U.add(t),Ye(e,t,!0))}function rs(e,t){Un(e),In(e,t)}function Un(e){for(let t of U)Ye(e,t,!1);U.clear()}function Ye(e,t,n){try{e.setFeatureState({source:be,id:t},{selected:n})}catch{}}function zl(e){for(let t of U)Ye(e,t,!0)}function ql(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function jn(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[Q,We].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[l,p]=i.geometry.coordinates,m=e.project([l,p]);return{id:i.id,x:m.x,y:m.y}});return ql(t,n,o,a)}function ss(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||M(s,dt)===0||M(s,Ue)===1)continue;let a=n[M(s,Ie(t))];a!==void 0&&r[a]++}return r}function as(e,t){let n=0;for(let o of e)t(o)&&M(o,dt)===0&&n++;return n}function is(e,t){let n=0;for(let o of e)t(o)&&M(o,Ue)===1&&n++;return n}function Xl(e,t,n,o,r){let s=M(e,0),a=M(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function ls(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||M(s,dt)===0)continue;let a=n[M(s,Ie(t))];if(a===void 0)continue;let i=br(s,t),l=M(s,Ue)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(l){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function Zl(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((o,r)=>t[M(n,Ie(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ye(n),published:n[2],removed:n[Ue],name:n[yr],moved:e.moved?.[ye(n)]??null,replacement:e.replacement?.[ye(n)]?.[0]??null,nearestStraight:e.replacement?.[ye(n)]?.[1]??null,...Object.fromEntries(x.flatMap((o,r)=>[[`b${r}`,t[M(n,Ie(r))]],[`sc${r}`,n[fr(r)]],[`sp${r}`,n[hr(r)]]]))}}))}}function cs(e,t){let n=Object.entries(Z).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,Z.none[t]]}function us(e){return["case",le,"rgba(0,0,0,0)",cs(e,"color")]}function Fn(e){return["case",le,Yl,cs(e,"size")]}function ds(e){return["interpolate",["linear"],["zoom"],9,["*",Fn(e),.45],12,Fn(e),16,["*",Fn(e),1.9]]}function ps(e){e.addSource(be,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Q,type:"circle",source:be,paint:{"circle-color":us(0),"circle-radius":ds(0),"circle-opacity":.85,"circle-stroke-color":["case",ie,Vr,le,Jl,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ie,1.6,le,.9,.5],12,["case",ie,2.4,le,1.5,1],16,["case",ie,3.2,le,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Nn,type:"circle",source:be,filter:ft,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":Vr,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ie,1.6,0],12,["case",ie,2.4,0],16,["case",ie,3.2,0]]}},"walk-fill"),e.addLayer({id:We,type:"symbol",source:be,filter:ft,layout:{"icon-image":Bn(e),"icon-size":Hn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Gn(e,t,n){return gt=await J(`/api/change?radius=${t}`),e.getSource(be).setData(Zl(gt)),zl(e),Kn(e,n),gt}function Kn(e,t){let n=x.indexOf(t);e.setPaintProperty(Q,"circle-color",us(n)),e.setPaintProperty(Q,"circle-radius",ds(n)),Jn(e,t)}function ms(e,t,n){X.has(t)?X.delete(t):X.add(t),Jn(e,n)}function gs(e,t){X.clear(),Jn(e,t)}function Jn(e,t){let n=x.indexOf(t),o=["none",...X],r=["case",le,!X.has(ht),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(Q,["all",["!",ft],r]);let s=["all",ft,!X.has(yt)];e.setFilter(We,s),e.setFilter(Nn,s)}function Ql(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function Yn(e,t,n,{pole:o=!0}={}){let r=x.indexOf(t),s=e[`b${r}`],a=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(f=>f.key===s)?.label??s,l=e[`sc${r}`],p=e[`sp${r}`],m=t==="weekday"?"weekday":t,S=a?`Currently ${l}`:`${l} \u2192 ${p}`;return`${o?Ql(e):""}${tc(e)}${S} buses per ${m} at this stop<br>${a?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var ec=1.5,zr=800;function tc(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??zr,r=n!=null&&o>n*ec?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${zr} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${qr}">Stop removed</b> \u2014 ${s}<br>`}var Wn="surface",wt="surface-fill",fs="#6b7280",Vn=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,fs],[.138,fs],[1,"#bd60e7"],[2,"#961bed"]],C="#e8232f",A="#0f79c9",hs=2,vt=null,ys=!1;function Rt(){return vt}function zn(){return ys}function bs(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-hs,Math.min(hs,n))}function Ss(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function vs(e,t,n,o,r,s,a,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=a.lat0+(p[1]+.5)*a.dlat,S=a.lon0+(p[0]+.5)*a.dlon;if(m<o||m>s||S<n||S>r)continue;let f=p[On(t)],v=p[Dn(t)],_=Ss(f,v);if(_!=="none")if(_==="ramp"){let h=bs(f,v);l[h<-.138?"less":h>.138?"more":"same"]+=i}else l[_]+=i}return l}function nc(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,l=n+s[0]*r,p=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,a],[p,a],[p,i],[l,i],[l,a]]]},properties:Object.fromEntries(x.flatMap((m,S)=>{let f=s[On(S)],v=s[Dn(S)];return[[`k${S}`,Ss(f,v)],[`v${S}`,bs(f,v)??0]]}))}})}}function ws(e){return["case",["==",["get",`k${e}`],"gone"],C,["==",["get",`k${e}`],"new"],A,["interpolate",["linear"],["get",`v${e}`],...Vn.flatMap(([t,n])=>[t,n])]]}function Se(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Rs(e,t){e.addSource(Wn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:wt,type:"fill",source:Wn,layout:{visibility:"none"},paint:{"fill-color":ws(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,Se(0,.85),13,Se(0,.62),16,Se(0,.45)]}},t)}async function qn(e,t,n){return vt=await J(`/api/surface?radius=${t}`),e.getSource(Wn).setData(nc(vt)),Xn(e,n),vt}function Xn(e,t){let n=x.indexOf(t);e.setPaintProperty(wt,"fill-color",ws(n)),e.setPaintProperty(wt,"fill-opacity",["interpolate",["linear"],["zoom"],9,Se(n,.85),13,Se(n,.62),16,Se(n,.45)])}function Ls(e,t){ys=t,e.setLayoutProperty(wt,"visibility",t?"visible":"none")}var Zn=null;function Lt(){return Zn}async function Qn(e){return Zn=await J(`/api/population?radius=${e}`),Zn}function $s(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let p=a.lat0+(l[1]+.5)*a.dlat,m=a.lon0+(l[0]+.5)*a.dlon;p<o||p>s||m<n||m>r||(i.lost+=l[Sr(t)],i.gained+=l[vr(t)],i.kept+=l[wr(t)],i.none+=l[Rr(t)])}return i}var eo="corridor",_s="corridor-lines",ve="#8b929c",oc="#6f7783",_t={lost:C,added:A,kept:ve};var $t=null,ks=!1;function kt(){return $t}function to(){return ks}function rc(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function xs(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function sc(){let e=t=>["match",["get","klass"],"lost",_t.lost,"added",_t.added,t];return["interpolate",["linear"],["zoom"],9,e(oc),14,e(ve)]}function ac(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function ic(){return["match",["get","klass"],"kept",.85,.9]}function Es(e,t){e.addSource(eo,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:_s,type:"line",source:eo,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":sc(),"line-width":ac(),"line-opacity":ic()}},t)}async function no(e,t){return $t=await D(`/api/corridors?day=${t}`),e.getSource(eo).setData(rc($t)),$t}async function Os(e,t){x.includes(t)&&await no(e,t)}function Ds(e,t){ks=t,e.setLayoutProperty(_s,"visibility",t?"visible":"none")}var oo="#2b3038",Ps="#b9bec6",qe={loses:{color:C,size:6},gains:{color:A,size:6},keeps:{color:ve,size:3},here:{color:oo,size:3.5},none:{color:Ps,size:1.8}};var W="loses_retired",Ot=["loses",W,"gains","keeps","none","here"];function ro(e,t){let n=e===W?"loses":e,o=t.find(r=>r.key===n)?.label??n;return e==="loses"?`${o} \u2014 stop kept`:e===W?`${o} \u2014 stop retired`:o}function Ms(e){return{...e.counts,loses:e.counts.loses-e.retired.loses,[W]:e.retired.loses}}var xt="oneseat",Cs="oneseat-dots",As="oneseat-removed",Ts=["all",["==",["get","status"],"loses"],["==",["get","removed"],1]],Dt=[Cs,As],Et=null,Fs=!1;function we(){return Et}function so(){return Fs}function Ns(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;a[W]=0;for(let i of e){let l=i[0],p=i[1];if(l<o||l>s||p<n||p>r)continue;let m=t[i[3]];m!==void 0&&a[m==="loses"&&i[6]===1?W:m]++}return a}function lc(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5],removed:n[6]??0}}))}}function cc(){return["match",["get","status"],...Object.entries(qe).flatMap(([e,t])=>[e,t.color]),Ps]}function uc(){let e=["match",["get","status"],...Object.entries(qe).flatMap(([t,n])=>[t,n.size]),qe.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Hs(e,t){e.addSource(xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Cs,type:"circle",source:xt,filter:["!",Ts],layout:{visibility:"none"},paint:{"circle-color":cc(),"circle-radius":uc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t),e.addLayer({id:As,type:"symbol",source:xt,filter:Ts,layout:{visibility:"none","icon-image":Bn(e),"icon-size":Hn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},t)}function dc(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var pc="pin";function Bs(e){return"key"in e?e.key:pc}var Tt="any";function mc(e,t,n){return`radius=${e}&${dc(t)}&day=${n}`}function Is(e,t){return e?t:Tt}function Us(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function ao(e,t,n,o=Tt){return Et=await D(`/api/oneseat?${mc(t,n,o)}`),e.getSource(xt).setData(lc(Et)),Et}function js(e,t){Fs=t;for(let n of Dt)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function io(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Gs(e,t){let n=e.status==="loses"&&e.removed===1?W:e.status,o=ro(n,t.statuses),r=(e.current||"").split(";").filter(Boolean),s=(e.proposed||"").split(";").filter(Boolean),a=l=>l.length?l.join(", "):"none",i=io(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${o}</b> \u2014 ${i}<br>today: ${a(r)}<br>proposed: ${a(s)}`}var Pt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},lo={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},gc=new Set(["gone","new"]),fc="stop kept";function hc(e,t,n){return gc.has(e)?`${t}, ${fc} (${lo[n]})`:t}function yc(e){return e.buckets.filter(t=>t.key!=="none")}var Ks={area:"Ground",people:"People"};function bc(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=vs(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Sc(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=$s(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var vc=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function Js(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1}=e,l=Vn.map(([p,m])=>`${m} ${((p+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${l})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${C}"></i>loses all service
          (${lo[n]})</span>
        <span><i style="background:${A}"></i>new service
          (${lo[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Ks).map(p=>`
          <button data-surface-unit="${p}" aria-pressed="${r===p}"
                  class="${r===p?"active":""}">${Ks[p]}</button>`).join("")}
      </div>
      ${a?vc:r==="people"?Sc(n,o,s):bc(t,n,o)}
    </div>`}var wc=["lost","added","kept"],Rc={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Lc={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Ws(e,t){let{lostPct:n,addedPct:o}=xs(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${Lc[t.day]}
    </div>
    ${wc.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${_t[i]}"></i>
        <span class="lg-lab">${u(Rc[i])}</span>
        <span class="lg-n">${r(t.km[i])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${r(n)}%</b> of today's pavement lost</span>
      <span><b>${r(o)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A street either has a bus on it or it doesn't, so
      there is no walk radius here. A street can lose its only bus while the
      block beside it keeps one: for what a rider can still reach on foot, see
      Stop-by-stop or Surface.</div>`}function Vs(e,t,n){let o=t.statuses.map(f=>f.key),r=Ns(t.points,o,n.west,n.south,n.east,n.north),s=Ms(t),a=f=>ro(f,t.statuses),i=f=>f===W?'<i class="lg-cross"></i>':`<i style="background:${qe[f].color}"></i>`,l=Ot.reduce((f,v)=>f+(r[v]??0),0),p=io(t),m=t.day&&t.day!==Tt,S=m?`Restricted to routes running on ${Pt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${u(p)}</b>
      <span class="muted">\xB7 ${l.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${m?` \xB7 ${Pt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Ot.map(f=>`
      <div class="lg-row lg-static">
        ${i(f)}
        <span class="lg-lab">${u(a(f))}</span>
        <span class="lg-n">${(r[f]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Ot.map(f=>`${(s[f]??0).toLocaleString()} ${u(a(f))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${u(p)} without transferring?
      ${S} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      A cross is a stop the plan retires, as in Stop-by-stop \u2014 decided at the
      stop, not the walk \u2014 so the ride may survive at a stop a block away;
      a retired stop that keeps its ride stays a plain dot.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function zs(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var Ys={locations:"Stops",riders:"Riders"};function $c(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function _c(e){if(!e)return"";let t=ze(ht);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${ht}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function kc(e,t){if(!e)return"";let n=ze(yt);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${yt}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop \u2014 no bus here on any day</span>
      <span class="lg-n">${t}</span>
    </button>`}function xc(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${_c(e)}
      ${kc(t,n)}
    </div>`}function qs(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:l,selection:p,dots:m=!0}=t,S=n.buckets.map($=>$.key),f=n.days.indexOf(o),{west:v,south:_,east:h,north:P}=r,H=yc(n),L=p&&p.size>0?p:null,lt=L?Qr(L):Zr(v,_,h,P),ar=ss(n.points,f,S,lt),vn=as(n.points,lt),wn=is(n.points,lt),B=s==="riders"?ls(n.points,f,S,lt):null,nl=$=>B?B.measured[$]?Math.round(B.riders[$]).toLocaleString():"\u2014":ar[$].toLocaleString(),ol=B?B.removedMeasured?Math.round(B.removedRiders).toLocaleString():"\u2014":wn.toLocaleString(),rl=L?`at ${L.size.toLocaleString()} selected stop${L.size===1?"":"s"}`:"in view",ir=H.reduce(($,Rn)=>$+ar[Rn.key],0)+vn+wn,sl=B?`<b>${Math.round(H.reduce(($,Rn)=>$+B.riders[Rn.key],0)+B.removedRiders).toLocaleString()}</b> daily boardings ${rl}`:L?`<b>${ir.toLocaleString()}</b>
         of ${L.size.toLocaleString()} selected stops`:`<b>${ir.toLocaleString()}</b>
         stops in view`,al=a?` \xB7 surface: ${n.radius} m walk`:"",il=!m&&!!a;e.innerHTML=il?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${Pt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${Js({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!L,named:!0})}`:`
    <div class="lg-head">
      ${sl}
      <span class="muted">\xB7 ${Pt[o]}${al}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Ys).map($=>`
        <button data-weight="${$}" aria-pressed="${s===$}"
                class="${s===$?"active":""}">${Ys[$]}</button>`).join("")}
    </div>
    ${H.map($=>`
      <button class="lg-row ${ze($.key)?"off":""}" data-bucket="${u($.key)}"
              aria-pressed="${!ze($.key)}">
        <i style="background:${Z[$.key]?.color??"#666"}"></i>
        <span class="lg-lab">${u(hc($.key,$.label,o))}</span>
        <span class="lg-n">${nl($.key)}</span>
      </button>`).join("")}
    ${xc(vn,wn,ol)}
    ${a?Js({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!L}):""}
    ${B?$c(B.unmeasured,vn):""}
    ${L?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Re="#4aa3ff",Xe="#ffa23a",co="headline",Mt="journey",At="journey-rides",oa="journey-walks",Ec=[At,oa],ra=null,sa=!1;function Ft(){return ra}function uo(){return sa}function Oc(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,l=a.to??e.destination,p=[[i.lon,i.lat],[l.lon,l.lat]],m=a.path?.length?a.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function Xs(){return["match",["get","side"],"current",Re,"proposed",Xe,Re]}function Zs(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function aa(e,t){e.addSource(Mt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:At,type:"line",source:Mt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Xs(),"line-width":Zs(1),"line-opacity":.85}},t),e.addLayer({id:oa,type:"line",source:Mt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Xs(),"line-width":Zs(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ia(e,t){sa=t;for(let n of Ec)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function po(e,t){ra=t;let n=t?Oc(t,co):{type:"FeatureCollection",features:[]};e.getSource(Mt).setData(n)}function la(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Qs=e=>`${e.toFixed(1)} min`;function ca(e){return e==null?"\u2014":e===0?"no change":e>0?`${Qs(e)} slower`:`${Qs(-e)} faster`}function ea(e,t){return e?e.name?u(e.name):`stop ${u(e.stop_id)}`:t}function Dc(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=ea(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${u(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ea(e.to,"the destination")}</span></div>`}function ta(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Dc(r,t)),o=r}return n.join("")}var Tc={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Ct(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Pc(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Mc(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Ct(t.current)} \u2192
        ${Ct(t.proposed)} min</span>
        <span class="muted">${ca(t.change_min)}</span></div>
      ${o}
    </div>`}function na(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function mo(e,t){let n=e.radii[co],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${u(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${he(e.window.start_min)}
        and ${he(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Tc[n.classification]??""}</p>
      </div>
      ${na(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Ct(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Ct(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${ca(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Pc(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ta(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ta(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Mc(e)}
    ${na(e)}`}function ua(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${u(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function da(e){let t=e?e.radii[co].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Re}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Xe}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Bt="off",Ze="stoproutes",ga="stoproutes-lines",fo="stoproutes-flow",fa="stoproutes-arrows",Cc=[ga,fo,fa],go="stoproutes-arrow",pa=3.5,ha=null,ya=!1;function It(){return ha}function ba(){return ya}function Sa(e,t){return e!==null&&e[t].length>0}function Ac(e,t){let n=t==="current"?e.current:e.proposed,o=je(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function Fc(){return["interpolate",["linear"],["zoom"],9,pa*.6,14,pa]}function Nc(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function va(e,t){e.addSource(Ze,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ga,type:"line",source:Ze,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Fc(),"line-opacity":.85}},t),e.addLayer({id:fo,type:"line",source:Ze,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},t),e.hasImage(go)||e.addImage(go,Nc(),{pixelRatio:2,sdf:!0}),e.addLayer({id:fa,type:"symbol",source:Ze,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":go,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},t)}function Ut(e,t){ya=t;for(let n of Cc)e.setLayoutProperty(n,"visibility",t?"visible":"none");t||_a()}function $e(e,t,n){ha=t;let o=t?Ac(t,n):{type:"FeatureCollection",features:[]};e.getSource(Ze).setData(o),t||_a()}function wa(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var Hc={current:"today",proposed:"proposed"};function Ra(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${u(e.color)}"></i> <b>${u(e.route)}</b>${e.name?` \u2014 ${u(e.name)}`:""}<br><span style="opacity:.75">${Hc[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var Bc=20;function Ic(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var ma=Ic(3,4,24),j=null,Nt=0,Ht=0,Le=null;function Uc(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function ho(e){Le&&(j=requestAnimationFrame(ho),!(e-Ht<1e3/Bc)&&(Ht=e,Nt=(Nt+1)%ma.length,Le.setPaintProperty(fo,"line-dasharray",ma[Nt])))}function La(){Le&&(document.hidden?j!==null&&(cancelAnimationFrame(j),j=null):j===null&&(Ht=0,j=requestAnimationFrame(ho)))}function $a(e){Uc()||Le||(Le=e,Nt=0,Ht=0,document.addEventListener("visibilitychange",La),j=requestAnimationFrame(ho))}function _a(){j!==null&&(cancelAnimationFrame(j),j=null),document.removeEventListener("visibilitychange",La),Le=null}var Kt="places",Ea="places-points",yo="places-boundaries",ue="places-fill",ke="lost",jc=100,Gc={lost:"share_lost",gained:"share_gained"};function te(e,t){return`service_${e}_${t}`}var Oa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Kc="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",ce={lost:C,gained:A},jt=null,ee=null,_e=null,Da=!1,Gt=null;function bo(){return jt}function Ta(){return ee}function Pa(){return Gt}function So(){return _e}function Qe(){return Da}function Jc(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function Yc(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Wc(e){return Math.max(e.residents_lost,e.residents_gained)}var ka=4,Vc=16,zc=1e3;function qc(e){let t=Math.min(1,Math.sqrt(e/zc));return ka+t*(Vc-ka)}function Xc(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Yc(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:qc(Wc(t))}}))}}function Zc(){return["match",["get","klass"],"lost",ce.lost,"gained",ce.gained,ce.lost]}function Qc(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var V=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var z=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Ma(e,t){return e==="service"?["step",["abs",["coalesce",["get",te(t,"pct")],0]],z[0].opacity,z[0].max,z[1].opacity,z[1].max,z[2].opacity,z[2].max,z[3].opacity]:["step",["coalesce",["get",Gc[e]],0],V[0].opacity,Number.EPSILON,V[1].opacity,V[1].max,V[2].opacity,V[2].max,V[3].opacity,V[3].max,V[4].opacity]}function Ca(e,t){return e==="service"?["case",[">=",["coalesce",["get",te(t,"pct")],0],0],A,C]:ce[e]}function eu(e,t){let n=te(t,"now"),o=te(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var tu=3;function nu(e){if(e.length===0)return"";let t=e.slice(0,tu),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function Aa(e,t){e.addSource(yo,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ue,type:"fill",source:yo,layout:{visibility:"none"},paint:{"fill-color":Ca(ke),"fill-opacity":Ma(ke),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Kt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ea,type:"circle",source:Kt,layout:{visibility:"none"},paint:{"circle-color":Zc(),"circle-radius":Qc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Jt(e,t,n){e.setPaintProperty(ue,"fill-color",Ca(t,n)),e.setPaintProperty(ue,"fill-opacity",Ma(t,n))}async function Fa(){return jt||(jt=await D("/api/places")),jt}async function Na(e){return _e||(_e=await D("/api/boundaries"),e.getSource(yo).setData(_e)),_e}function ou(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Ha(e,t){let n=ou(_e,t);if(n)return ee=null,Gt=n,e.getSource(Kt)?.setData({type:"FeatureCollection",features:[]}),null;try{ee=await D(`/api/places/${encodeURIComponent(t)}`)}catch{return ee=null,Gt=null,null}return Gt=null,e.getSource(Kt).setData(Xc(ee)),e.flyTo({center:[ee.lon,ee.lat],zoom:13}),ee}function Ba(e,t){Da=t,e.setLayoutProperty(Ea,"visibility",t?"visible":"none"),e.setLayoutProperty(ue,"visibility",t?"visible":"none")}function ru(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${u(e.key)}">
      <span class="place-name">${u(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var su="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ia(e,t,n,o){let r=Jc(e,t).map(s=>ru(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Kc}</p>
    ${o==="service"?`<p class="note">${su}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function Ua(e,t){return e?`<div class="lg-head"><b>${u(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${u(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function au(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function iu(e,t,n,o){let r=z.map((l,p)=>({band:l,prevMax:p===0?0:z[p-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:p})=>{let m=au(l,p);return[`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${A};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(m)} more trips</span></div>`]}).join(""),s=o?eu(o,n):[],a=nu(s),i=a?`<div class="lg-foot">${u(a)}</div>`:"";return`
    ${Ua(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${u(Oa[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ja({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return iu(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=V.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${ce[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${u(i.label)} of the place's own residents ${u(s)}</span>
    </div>`).join("");return`
    ${Ua(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${u(s)}</div>
    ${a}
    <div class="lg-row lg-static"><i style="background:${ce.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${ce.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function lu(e,t){let n=e[te(t,"now")],o=e[te(t,"proposed")],r=e[te(t,"pct")],s=e[te(t,"rail_proposed")],a=Oa[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function Ga(e,t,n){if(t==="service")return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      ${lu(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=xa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?xa("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function xa(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${jc} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Wa=["discontinued","new","reshaped","one-to-one"],Va={discontinued:["discontinued"],new:["new"],reshaped:["split","merged"],"one-to-one":["one-to-one"]},_o=["one-to-one"];function Zt(e){return Wa.includes(e)}function ko(e){return Wa.filter(t=>e.includes(t))}var xo="status",cu={status:"What happened",service:"How much service"};function Qt(e){return e==="status"||e==="service"}var et=["gone","halved","less","same","more","doubled","new"],Eo={gone:"loses all service",halved:"halved or worse",less:"less service",same:"about the same",more:"more service",doubled:"doubled or better",new:"new service",none:"no service either way"},uu={gone:1.7,halved:1.35,less:1,same:.75,more:1,doubled:1.35,new:1.7,none:.75};function en(e){return et.includes(e)}function Oo(e){return et.filter(t=>e.includes(t))}var Ka="#8e44ad",za={discontinued:C,new:A,split:Ka,merged:Ka,"one-to-one":ve},Do={discontinued:"discontinued",new:"new",split:"split",merged:"merged","one-to-one":"one-to-one"},du=["discontinued","new","split","merged","one-to-one"],pu="route-changes",mu=.12,qa=.9,Xa=1,gu=/^[cp]:[\w-]{1,64}$/;function Za(e){return gu.test(e)}var Ee={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},fu={current:"today",proposed:"proposed"},Qa=" \u2192 ",qt="\u2014";function Yt(e,{named:t=!0}={}){return e.length===0?qt:e.map(n=>t&&n.name?`${n.route} ${n.name}`:n.route).join(", ")}function tt(e,{farSideNamed:t=!0}={}){return e.current.length===0?Yt(e.proposed):e.proposed.length===0?Yt(e.current):`${Yt(e.current)}${Qa}${Yt(e.proposed,{named:t})}`}function Xt(e){if(e===null)return qt;let t=Math.round(e);return t===0?"0%":t>0?`+${t}%`:`\u2212${Math.abs(t)}%`}function hu(e){let t=Object.fromEntries(du.map(n=>[n,0]));for(let n of e)t[n.status]+=1;return t}var ei="routechange",ne="routechange-lines",nt="routechange-arrows",tn="routechange-selected",nn="routechange-selected-lines",To="routechange-selected-plan",Po="routechange-selected-arrows",yu=[ne,nt,nn,To,Po],Mo=[To,nn,ne],bu=[0,2.5],Ja={current:["==",["get","side"],"current"],proposed:["==",["get","side"],"proposed"]},wo="routechange-arrow",vo=2.6,Su=1.5,vu=2.8,ti={bucket:"none",pct_trips:null};function Ro(e,t,n,o,r){return{type:"Feature",geometry:{type:"LineString",coordinates:e.points},properties:{key:e.key,side:e.side,route:e.route,name:e.name,status:e.status,pattern_id:e.pattern_id,color:t,sort:n,w:o,bucket:r.bucket,scolor:Z[r.bucket].color,sw:uu[r.bucket],pct:r.pct_trips}}}function wu(e){let t=new Map(e.groups.map(o=>[o.key,o.service[e.day]]));return{type:"FeatureCollection",features:e.features.map(o=>Ro(o,za[o.status],o.status==="one-to-one"?0:1,1,t.get(o.key)??ti)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Ru(e){let t=e.service[e.day]??ti;return{type:"FeatureCollection",features:e.features.map(o=>o.side==="current"?Ro(o,Re,0,vu,t):Ro(o,Xe,1,Su,t)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Lu(e){let t=1/0,n=1/0,o=-1/0,r=-1/0;for(let s of e)for(let[a,i]of s.points)a<t&&(t=a),a>o&&(o=a),i<n&&(n=i),i>r&&(r=i);return Number.isFinite(t)?[[t,n],[o,r]]:null}function $u(e){if(e.length===0)return null;let t=e.flatMap(n=>Va[n]);return["!",["in",["get","status"],["literal",t]]]}function _u(e){return e.length===0?null:["!",["in",["get","bucket"],["literal",[...e]]]]}var Lo={status:{color:"color",width:"w"},service:{color:"scolor",width:"sw"}};function Co(e){let t=n=>["*",["get",Lo[e].width],n];return["interpolate",["linear"],["zoom"],9,t(vo*.5),14,t(vo),16,t(vo*1.6)]}function ku(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function Ya(e,t,n,o,r,s){e.addSource(t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:n,type:"line",source:t,layout:{visibility:"none","line-cap":"round","line-join":"round","line-sort-key":["get","sort"]},paint:{"line-color":["get","color"],"line-width":Co("status"),"line-opacity":s}},r),e.addLayer({id:o,type:"symbol",source:t,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":140,"symbol-sort-key":["get","sort"],"icon-image":wo,"icon-size":["interpolate",["linear"],["zoom"],12,.45,16,.8],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"],"icon-opacity":s}},r)}function ni(e,t){e.hasImage(wo)||e.addImage(wo,ku(),{pixelRatio:2,sdf:!0}),Ya(e,ei,ne,nt,t,qa),Ya(e,tn,nn,Po,t,Xa),xu(e,t),Me(e)}function xu(e,t){e.setFilter(nn,Ja.current),e.addLayer({id:To,type:"line",source:tn,filter:Ja.proposed,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Co("status"),"line-opacity":Xa,"line-dasharray":bu}},Po)}var Vt=null,xe=null,oi=!1,Oe=new Set(_o),De=new Set,Ao=xo;function Fo(){return Vt?.groups??null}function de(){return xe}function Te(){return oi}function Eu(e){return`/api/route_changes?day=${e}`}function Ou(e,t){return`/api/route_changes/${encodeURIComponent(e)}?day=${t}`}async function No(e,t){if(!x.includes(t))throw new Error(`no such day type: ${t}`);return Vt=await J(Eu(t)),e.getSource(ei).setData(wu(Vt)),Vt}async function Ho(e,t,n,{fly:o=!0}={}){try{xe=await J(Ou(t,n))}catch{return Bo(e),null}e.getSource(tn).setData(Ru(xe)),ri(e,!0);let r=Lu(xe.features);return o&&r&&e.fitBounds(r,{padding:60,maxZoom:14}),xe}function Bo(e){xe=null,e.getSource(tn)?.setData({type:"FeatureCollection",features:[]}),e.getLayer(ne)&&ri(e,!1)}function ri(e,t){let n=t?mu:qa;e.setPaintProperty(ne,"line-opacity",n),e.setPaintProperty(nt,"icon-opacity",n)}function on(){return ko([...Oe])}function si(e,t){Oe.has(t)?Oe.delete(t):Oe.add(t),Me(e)}function Io(e,t){Oe.clear();for(let n of t)Oe.add(n);Me(e)}function rn(){return Oo([...De])}function ai(e,t){De.has(t)?De.delete(t):De.add(t),Me(e)}function Uo(e,t){De.clear();for(let n of t)De.add(n);Me(e)}function Pe(){return Ao}function jo(e,t){Ao=t,e.setPaintProperty(ne,"line-color",["get",Lo[t].color]),e.setPaintProperty(ne,"line-width",Co(t)),e.setPaintProperty(nt,"icon-color",["get",Lo[t].color]),Me(e)}function Me(e){let t=Ao==="status"?$u(on()):_u(rn());e.setFilter(ne,t),e.setFilter(nt,t)}function ii(e,t){oi=t;for(let n of yu)e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Du="A route group is PRT\u2019s own mapping of today\u2019s route numbers onto the plan\u2019s \u2014 the routes it says replace each other. It is not a corridor: a street can lose one group\u2019s buses and gain another\u2019s, and only the location, surface and street views can see that.";function li(){return` <button class="howto" data-caveat="${pu}">method</button>`}var ci={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Tu(e,t){if(e.current.length===0||e.proposed.length===0)return"";let n=e.service[t].pct_trips,o=`${ci[t]} trips, today to plan`;return`<span class="rc-pct ${$o(n)}" title="${u(o)}">${Xt(n)}</span>`}function $o(e){return e===null||Math.round(e)===0?"flat":e>0?"up":"down"}function Pu(e,{reading:t,day:n}){let o=u(tt(e,{farSideNamed:!1}));return t==="service"?`<span class="rc-map" style="color:${Z[e.service[n].bucket].color}">${o}</span>`:`<span class="${e.status==="one-to-one"?"rc-map":`rc-map ${e.status}`}">${o}</span>`}function ui(e,t,n){return`
    <button type="button" class="rc-row${t?" selected":""}"
            data-select-route="${u(e.key)}">
      ${Pu(e,n)}
      ${Tu(e,n.day)}
    </button>`}function zt(e,t,n,o){return`
    <div class="scope-head">${u(e)} (${t.length})</div>
    <div class="rc-list">${t.map(r=>ui(r,r.key===n,o)).join("")}</div>`}function Mu(e){return e.charAt(0).toUpperCase()+e.slice(1)}function di(e,t,n={reading:"status",day:"weekday"}){let o=`
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${e.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${Du}${li()}</p>`;if(n.reading==="service")return o+Cu(e,t,n);let r=a=>e.filter(i=>a.includes(i.status)),s=r(["one-to-one"]);return`${o}
    ${zt("Discontinued",r(["discontinued"]),t,n)}
    ${zt("New",r(["new"]),t,n)}
    ${zt("Split or merged",r(["split","merged"]),t,n)}
    <details class="svc rc-kept">
      <summary>One-to-one (${s.length}) \u2014 one number on each side; how its service changed</summary>
      <div class="rc-list">${s.map(a=>ui(a,a.key===t,n)).join("")}</div>
    </details>`}function Cu(e,t,n){let o=a=>e.filter(i=>i.service[n.day].bucket===a),r=o("none").length,s=r===0?"":`
    <p class="muted rc-idle">${r} group${r===1?" runs":"s run"} on neither network on ${u(Ee[n.day])},
      so ${r===1?"it has":"they have"} no line to draw.</p>`;return`
    <div class="muted rc-by">Grouped by ${u(ci[n.day])} trips, today \u2192 plan</div>
    ${et.map(a=>{let i=o(a);return i.length?zt(Mu(Eo[a]),i,t,n):""}).join("")}
    ${s}`}function Au(e,t){return`
    <tr><th>${e}</th>
      <td class="n">${t.cur_trips.toLocaleString()}</td>
      <td class="n">${t.prop_trips.toLocaleString()}</td>
      <td class="n ${$o(t.pct_trips)}">${Xt(t.pct_trips)}</td>
      <td class="n">${t.cur_hours.toFixed(1)}</td>
      <td class="n">${t.prop_hours.toFixed(1)}</td>
      <td class="n ${$o(t.pct_hours)}">${Xt(t.pct_hours)}</td></tr>`}function Fu(e){return e.prt.length===0?'<p class="muted">PRT\u2019s table has no row for this group.</p>':e.prt.map(n=>{let o=n.related_routes?`<div class="muted">PRT points riders to: ${u(n.related_routes)}</div>`:"",r=n.route_page?`<div><a class="link" href="${u(n.route_page)}" target="_blank" rel="noopener">PRT\u2019s page for this route \u2197</a></div>`:"";return`<div class="rc-prt">
      <div><b>${u(n.current_route||qt)}${Qa}${u(n.final_route||qt)}</b>
        <span class="rc-cat">${u(n.category)}</span></div>
      ${o}${r}</div>`}).join("")}function pi(e){let t=e.status==="new"?"":`
    <p class="rc-riders">${Math.round(e.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">\xB7 WPRDC route ridership, average weekday</span></p>`;return`
    <button type="button" class="link rc-back" data-select-route="">\u2190 All routes</button>
    <div class="place-head">
      <h2>${u(tt(e))}</h2>
      <span class="rc-status ${u(e.status)}">${u(Do[e.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today \u2192 plan</th>
        <th class="n" colspan="3">revenue hours today \u2192 plan</th></tr></thead>
      <tbody>${x.map(n=>Au(n,e.service[n])).join("")}</tbody>
    </table>
    ${t}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today\u2019s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT\u2019s own account, from its route crosswalk.</p>
    ${Fu(e)}

    <p class="note">This is a route group, not a corridor. One group\u2019s loss
      can be another group\u2019s gain: Carrick\u2019s 51 reads as \u221210% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${li()}</p>`}function Nu(e,t){return`<div class="lg-row lg-static"><i style="background:${e};border-radius:2px"></i>
    <span class="lg-lab">${t}</span></div>`}function Hu(e,t){return`<div class="lg-row lg-static"><i class="lg-dotted" style="border-color:${e}"></i>
    <span class="lg-lab">${t}</span></div>`}function mi(e,t,n,o,r,s){return`
    <button class="lg-row ${s?"off":""}" ${e}="${t}"
            aria-pressed="${!s}">
      <i style="background:${n};border-radius:2px"></i>
      <span class="lg-lab">${o}</span>
      <span class="lg-n">${r}</span>
    </button>`}function Wt(e,t,n,o){let r=za[Va[e][0]];return mi("data-route-bucket",e,r,t,n,o.includes(e))}function Bu(e,t,n){return mi("data-route-service",e,Z[e].color,Eo[e],t,n.includes(e))}function gi(e){return`
    <div class="seg lg-weight" role="group" aria-label="Colour the routes by">
      ${["status","service"].map(n=>`
        <button data-route-reading="${n}" aria-pressed="${e===n}"
                class="${e===n?"active":""}">${cu[n]}</button>`).join("")}
    </div>`}function Iu(e,t){let n=Object.fromEntries([...et,"none"].map(o=>[o,0]));for(let o of e)n[o.service[t].bucket]+=1;return n}function Uu(e,t,n){let o=Iu(e,t),r=o.gone+o.halved+o.less,s=o.more+o.doubled+o.new,a=`${e.length.toLocaleString()} route groups \xB7 ${r} fewer trips \xB7 ${o.same} about the same \xB7 ${s} more \xB7 ${Ee[t]}`;return`
    <div class="lg-head"><b>${u(a)}</b></div>
    ${gi("service")}
    ${et.filter(i=>o[i]>0).map(i=>Bu(i,o[i],n)).join("")}
    <div class="lg-foot">Each group\u2019s trips today \u2192 plan on ${u(Ee[t])}, in the
      Stop-by-stop key\u2019s buckets and colours \u2014 a \xB110% band around no change.
      Route by route, which is not how access is measured: a group is
      not a corridor, and the 51 reads fewer trips while the new 45 runs much
      of the same street. Click a row to show or hide its lines; click a line to
      select its group.</div>`}function fi({groups:e,day:t,hidden:n,serviceHidden:o,reading:r,selected:s}){if(s)return`
      <div class="lg-head"><b>${u(tt(s))}</b>
        <span class="muted">\xB7 ${u(Do[s.status])} \xB7 ${u(Ee[t])}</span></div>
      ${Nu(Re,"today's alignment")}
      ${Hu(Xe,"proposed alignment")}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;if(!e)return'<div class="lg-head"><b>Route changes</b></div>';if(r==="service")return Uu(e,t,o);let a=hu(e),i=a.split+a.merged,l=`${e.length.toLocaleString()} route groups \xB7 ${a.discontinued} discontinued \xB7 ${a.new} new \xB7 ${i} split or merged \xB7 ${Ee[t]}`;return`
    <div class="lg-head"><b>${u(l)}</b></div>
    ${gi("status")}
    ${Wt("discontinued","discontinued \u2014 today\u2019s alignment",a.discontinued,n)}
    ${Wt("new","new \u2014 proposed alignment",a.new,n)}
    ${Wt("reshaped","split or merged \u2014 proposed alignment",i,n)}
    ${Wt("one-to-one","one-to-one \u2014 proposed alignment",a["one-to-one"],n)}
    <div class="lg-foot">A route group is PRT\u2019s own mapping of today\u2019s
      numbers onto the plan\u2019s, not a corridor. Patterns are the ones that
      run on ${u(Ee[t])}. Click a row to show or hide its lines;
      click a line to select its group.</div>`}function hi(e,{selected:t,reading:n="status"}){let o=u(e.name?`${e.route} ${e.name}`:e.route),r=u(fu[e.side]),s=u(Do[e.status]),a=n==="service"?` \xB7 ${u(Eo[e.bucket])}${e.pct===null?"":` (${Xt(e.pct)} trips)`}`:"";return t?`${o} \xB7 <b>${r}</b> \xB7 ${s}${a}`:`<b>${o}</b> \xB7 ${r} \xB7 ${s}${a}`}var Go=" \xB7 ",Ko={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places",routes:"Route changes"},yi=Object.keys(Ko);function bi(e){return Ko[e]??e}var ju={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Gu=["oneseat","journey"],Ku=["dots","both"],Ju={current:"routes today",proposed:"routes proposed"};function Yu(e){return e!=="journey"&&e!=="routes"}function Wu(e){let t=[Ko[e.view]??e.view];return e.view==="places"?t[0]:(Gu.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":ju[e.day]),Yu(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&Ku.includes(e.view)&&t.push(Ju[e.stopRoutes]),t.join(Go))}function Si(e){let[t,...n]=Wu(e).split(Go);return`<b>${u(t)}</b>${n.map(o=>Go+u(o)).join("")}`}var y={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes",route:"route",routeHidden:"routehide",routeReading:"routecolor",serviceHidden:"servicehide"},Vu=/^[cp]:[\w.:-]{1,32}$/,sn={any:"any",selected:"selected"},zu="pin",vi=5,Ri="none",an=",";function Li(e){try{return e.self!==e.top}catch{return!0}}function $i(e){let t=new URLSearchParams;return t.set(y.view,e.view),t.set(y.day,e.day),t.set(y.radius,String(e.radius)),t.set(y.oneSeatDay,e.oneSeatRestricted?sn.selected:sn.any),t.set(y.dest,"key"in e.dest?e.dest.key:Jo(e.dest)),e.weight==="riders"&&t.set(y.weight,e.weight),e.surfaceUnit==="people"&&t.set(y.surfaceUnit,e.surfaceUnit),e.at&&t.set(y.at,Jo(e.at)),e.camera&&t.set(y.camera,`${Jo(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(y.place,e.place),e.placeFill!==ke&&t.set(y.placeFill,e.placeFill),e.selection.length&&t.set(y.selection,e.selection.join(",")),t.set(y.stopRoutes,e.stopRoutes??Bt),e.route&&t.set(y.route,e.route),e.routeHidden&&!qu(e.routeHidden,_o)&&t.set(y.routeHidden,e.routeHidden.length?e.routeHidden.join(an):Ri),e.routeReading&&e.routeReading!==xo&&t.set(y.routeReading,e.routeReading),e.serviceHidden?.length&&t.set(y.serviceHidden,e.serviceHidden.join(an)),`?${t}`}function _i(e){let t=new URLSearchParams(e),n={},o=t.get(y.view);o&&yi.includes(o)&&(n.view=o);let r=t.get(y.day);r&&x.includes(r)&&(n.day=r);let s=Number(t.get(y.radius));t.has(y.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(y.weight)==="riders"?n.weight="riders":t.get(y.weight)==="locations"&&(n.weight="locations"),t.get(y.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(y.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(y.oneSeatDay);a===sn.selected?n.oneSeatRestricted=!0:a===sn.any&&(n.oneSeatRestricted=!1);let i=t.get(y.dest);if(i&&i!==zu){let L=wi(i);L?n.dest=L:i.includes(",")||(n.dest={key:i})}let l=wi(t.get(y.at));l&&(n.at=l);let p=Xu(t.get(y.camera));p&&(n.camera=p);let m=t.get(y.place);m&&(n.place=m);let S=t.get(y.selection);S!==null&&(n.selection=S.split(",").filter(L=>Vu.test(L)));let f=t.get(y.placeFill);(f==="lost"||f==="gained"||f==="service")&&(n.placeFill=f);let v=t.get(y.stopRoutes);(v==="off"||v==="current"||v==="proposed")&&(n.stopRoutes=v);let _=t.get(y.route);_&&Za(_)&&(n.route=_);let h=t.get(y.routeHidden);if(h===Ri)n.routeHidden=[];else if(h){let L=ko(h.split(an).filter(Zt));L.length&&(n.routeHidden=L)}let P=t.get(y.routeReading);P&&Qt(P)&&(n.routeReading=P);let H=t.get(y.serviceHidden);if(H){let L=Oo(H.split(an).filter(en));L.length&&(n.serviceHidden=L)}return n}function qu(e,t){return e.length===t.length&&e.every((n,o)=>n===t[o])}function Jo(e){return`${e.lat.toFixed(vi)},${e.lon.toFixed(vi)}`}function wi(e){let t=ki(e,2);return t?{lat:t[0],lon:t[1]}:null}function Xu(e){let t=ki(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function ki(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Yo="embed";var Zu=["1","true","yes"];function xi(e){let t=new URLSearchParams(e).get(Yo);return t!==null&&Zu.includes(t.toLowerCase())}function Ei(e){let t=new URLSearchParams(e);return t.set(Yo,"1"),`?${t}`}function Oi(e){let t=new URLSearchParams(e);t.delete(Yo);let n=String(t);return n?`?${n}`:""}function Di(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var oe=["peek","half","full"],Qu=192,ed=.3,td=.55,nd=.9,od=.6,rd=.45;function ln(e,t){return e==="peek"?Math.min(Qu,t*ed):e==="half"?t*td:t*nd}function sd(e,t,n=0){let o=oe.map(s=>Math.abs(ln(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>od&&(r=Math.max(0,Math.min(oe.length-1,r+(n>0?1:-1)))),oe[r]}function Ti(e){return oe[(oe.indexOf(e)+1)%oe.length]}function ad(e,t){return Math.min(e,t*rd)}function Ce(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Wo(e){let t=null,n=()=>{let o=Ce();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var id=8,ld=400;function Pi(e){let t=d("side"),n=d("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,l={y:0,t:0};function p(){return window.innerHeight}function m(h){t.style.height=`${h}px`,e.onMove(h,ad(h,p()))}function S(h){o=h,t.dataset.snap=h,m(ln(h,p()))}n.addEventListener("pointerdown",h=>{Ce()&&(r=!0,s=h.clientY,a=t.getBoundingClientRect().height,i=h.timeStamp,l={y:h.clientY,t:h.timeStamp},t.classList.add("dragging"),n.setPointerCapture(h.pointerId))}),n.addEventListener("pointermove",h=>{if(!r)return;let P=a+(s-h.clientY),H=ln("peek",p()),L=ln("full",p());m(Math.max(H,Math.min(L,P))),l={y:h.clientY,t:h.timeStamp}});function f(h){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(h.clientY-s)>id)&&h.timeStamp-i<ld){S(Ti(o));return}let H=h.timeStamp-l.t,L=H>0?(l.y-h.clientY)/H:0;S(sd(t.getBoundingClientRect().height,p(),L))}n.addEventListener("pointerup",f),n.addEventListener("pointercancel",f),n.addEventListener("keydown",h=>{h.key!=="Enter"&&h.key!==" "||(h.preventDefault(),Ce()&&S(Ti(o)))});let v=Wo(e.onLayoutChange);function _(){if(v(),!Ce()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}S(o)}return window.addEventListener("resize",_),_(),{at:()=>Ce()?o:"full",atLeast(h){Ce()&&oe.indexOf(h)>oe.indexOf(o)&&S(h)}}}var cd=["llvmpipe","swiftshader","softpipe","basic render","software"];function Vo(e){if(!e)return!1;let t=e.toLowerCase();return cd.some(n=>t.includes(n))}function Ci(e){let t=Vo(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function Ai(e){return Vo(e.renderer)?0:ud}var ud=300,dd="https://tiles.openfreemap.org/styles/positron",pd=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],Mi=[],md=19,gd='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',fd=!1;function Fi(e){return!fd||!Vo(e.renderer)?dd:hd()}function hd(){let e=o=>({type:"raster",tileSize:256,attribution:gd,tiles:o,maxzoom:md}),t={basemap:e(pd)},n=[{id:"basemap",type:"raster",source:"basemap"}];return Mi.length&&(t["basemap-labels"]=e(Mi),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function Ni(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function yd(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function Hi(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),r=null,s="",a=l=>{s!==l&&(s=l,e.getCanvas().style.cursor=l)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",l=>{let p=n.map(P=>P.layer).filter(P=>e.getLayer(P)&&e.getLayoutProperty(P,"visibility")!=="none");if(!p.length){i();return}let[m,...S]=e.queryRenderedFeatures(l.point,{layers:p});if(!m){i();return}a("pointer");let f=yd(m);if(f===r)return;let v=o.get(m.layer?.id),_=v?v.html(m,S):null;if(_==null){r=null,t.remove();return}r=f;let h=v.anchor?v.anchor(m,l):l.lngLat;t.setLngLat(h).setHTML(_).addTo(e)}),e.on("mouseout",i),i}function bd(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function Sd(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var vd="seg-current",Bi="dd",wd="open",Ii="armed";function Rd(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(Ii)}));return bd(t)}function Ui(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let l=a===n;i.group.classList.toggle(wd,l),i.trigger.setAttribute("aria-expanded",String(l))}},r=s=>o(Sd(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let l=s.id||`controls-${a}`,p=s.querySelector(".lbl")?.textContent??"",m=document.createElement("button");m.type="button",m.className=vd,m.setAttribute("aria-haspopup","true"),m.setAttribute("aria-expanded","false");let S=document.createElement("div");S.className=Bi,i.replaceWith(S),S.append(m,i);let f=()=>{let v=Rd(i);m.textContent=v.label,m.disabled=v.disabled,m.classList.toggle(Ii,v.armed),m.setAttribute("aria-label",p?`${p}: ${v.label}`:v.label)};f(),new MutationObserver(f).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),m.addEventListener("click",()=>{r({kind:"trigger",group:l}),n===l&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",v=>{if(!v.target.closest("button"))return;let _=n===l;r({kind:"pick"}),_&&m.focus()}),t.set(l,{group:s,trigger:m,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${Bi}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var Ld=[-79.9959,40.4406],$d=12,_d="#e2574c",cn=5,T={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},rt=_i(location.search),at=xi(location.search);at&&d("app").classList.add("embed");var kd={at:()=>"full",atLeast(){}},Yi=null,F=400,ot=null,w=null,se=null,ge=0,k={key:"downtown"},pe=null,Wi=!1,Ne=!1,yn="locations",He="area",I=Bt,zo=0;function dn(){return I==="off"?"current":I}var Vi="count",fn=null,G=ke,fe=null,K=!1,g="dots",Qo,tr=[],ji=()=>{},qo=Ni(),c=new maplibregl.Map({container:"map",style:Fi(qo),pixelRatio:Ci(qo),fadeDuration:Ai(qo),renderWorldCopies:!1,center:rt.camera?[rt.camera.lon,rt.camera.lat]:Ld,zoom:rt.camera?.zoom??$d,cooperativeGestures:Li(window),attributionControl:{compact:!0}});c.addControl(new maplibregl.NavigationControl,"top-right");c.on("load",()=>{dr(c),ps(c),Rs(c,Ve),Es(c,Ve),Hs(c,"walk-fill"),aa(c),va(c,At),Aa(c,Ve),ni(c,Ve),O(),c.on("click",t=>{if(K)return;if(Wi){st({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=c.queryRenderedFeatures(t.point,{layers:[ue]})[0];s&&pn(s.properties.key);return}if(g==="routes"){let{x:s,y:a}=t.point,i=[[s-cn,a-cn],[s+cn,a+cn]],l=c.queryRenderedFeatures(i,{layers:Mo})[0];l?(Qo.atLeast("half"),er(l.properties.key)):Gi();return}let n=[...bt,...Dt].filter(s=>c.getLayoutProperty(s,"visibility")!=="none"),o=c.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];sr(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});ji=Hi(c,e,[...pr(t=>{let n=St(),o=t.find(r=>bt.includes(r.layer?.id));return n&&o?Yn(o.properties,R(),n.buckets,{pole:!1}):null}),...bt.map(t=>({layer:t,html:n=>{let o=St();return o?Yn(n.properties,R(),o.buckets):null},anchor:n=>n.geometry.coordinates})),...Dt.map(t=>({layer:t,html:n=>{let o=we();return o?Gs(n.properties,o):null},anchor:n=>n.geometry.coordinates})),{layer:"stoproutes-lines",html:t=>Ra(t.properties)},...Mo.map(t=>({layer:t,html:n=>hi(n.properties,{selected:de()!==null,reading:Pe()})})),{layer:ue,html:t=>Ga(t.properties,G,R())}]),Gd(),c.on("moveend",()=>{let t=c.getCenter();Yi={lat:t.lat,lon:t.lng,zoom:c.getZoom()},b(),E()}),me(T.radius,t=>{F=Number(t.dataset.radius),Gn(c,F,R()).then(b),Rt()&&qn(c,F,R()).then(b),Lt()&&Qn(F).then(b),we()&&mn(),w&&Ae(w.lat,w.lon)}),me(T.day,t=>{let n=t.dataset.day;Cr(n),g!=="journey"&&O(),Kn(c,n),hn(),Xn(c,n),g==="journey"&&w&&nr(w.lat,w.lon),kt()&&Os(c,n).then(b),Ne&&we()&&(mn(),w&&Ae(w.lat,w.lon)),Qe()&&G==="service"&&Jt(c,G,n),Te()&&Nd(),b()}),me(T.oneSeatDay,t=>{Ne=t.dataset.oneseatDay==="selected",Zo(),mn(),w&&Ae(w.lat,w.lon)}),me(T.view,t=>{let n=g;g=t.dataset.view,ji(),Xr(c,g==="dots"||g==="both"),Pd(g==="surface"||g==="both"),Cd(g==="corridors"),Id(g==="oneseat"),Bd(g==="journey",n==="journey"),Ad(g==="places"),Fd(g==="routes"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&O({scrollToTop:!0}),Hd(kn(g)),Zi();let o=g==="oneseat"||g==="journey";d("dest-controls").classList.toggle("hidden",!o),d("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),d("place-fill-controls").classList.toggle("hidden",g!=="places"),el(),q()||Ki(!1),Fe(),Zo(),o||gn(!1),qi()}),me(T.dest,t=>{let n=t.dataset.dest;if(n==="pin"){gn(!0);return}gn(!1),st({key:n})}),me(T.placeFill,t=>{G=t.dataset.placeFill,Qe()&&Jt(c,G,R()),O(),b(),Zo()}),me(T.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=I!=="off"&&It()!==null;I=n,O(),o&&n!=="off"?($e(c,It(),n),N&&rr(N.radius)):hn()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){yn=n.dataset.weight,b(),E();return}let o=t.target.closest("[data-surface-unit]");if(o){He=o.dataset.surfaceUnit,Md(He),E();return}let r=t.target.closest("[data-route-bucket]");if(r&&Zt(r.dataset.routeBucket)){si(c,r.dataset.routeBucket),b(),E();return}let s=t.target.closest("[data-route-service]");if(s&&en(s.dataset.routeService)){ai(c,s.dataset.routeService),b(),E();return}let a=t.target.closest("[data-route-reading]");if(a&&Qt(a.dataset.routeReading)){jo(c,a.dataset.routeReading),b(),Te()&&O(),E();return}let i=t.target.closest("[data-bucket]");i&&(ms(c,i.dataset.bucket,R()),b())}),d("legend-reset").addEventListener("click",()=>{if(Te()){Pe()==="service"?Uo(c,[]):Io(c,[]),b(),E();return}gs(c,R()),b()}),d("legend-select").addEventListener("click",()=>Ki(!K)),d("legend-clear").addEventListener("click",()=>{Un(c),Fe(),b(),E()}),d("legend-collapse").addEventListener("click",()=>{Xo(!d("legend-box").classList.contains("collapsed"))}),d("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&st({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Yd(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&pn(r.dataset.selectPlace);let s=t.target.closest("[data-select-route]");if(s){let l=s.dataset.selectRoute;l?er(l):Gi()}let a=t.target.closest("[data-sort-places]");a&&(Vi=a.dataset.sortPlaces,O());let i=t.target.closest("[data-goto-place]");i&&(g!=="places"&&re(T.view,"places"),pn(i.dataset.gotoPlace))}),d("side-toggle").addEventListener("click",Dd),at&&Wo(Xo),Qo=at?kd:Pi({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),c.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Xo}),Ed(),Ui(),Sn(),Fe(),bn(),xd(rt),Gn(c,F,R()).then(b),Jd(),Kd()});function me(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),Sn(),E()})})}function re(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function xd(e){e.radius!==void 0&&re(T.radius,String(e.radius)),e.day&&re(T.day,e.day),e.oneSeatRestricted!==void 0&&re(T.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(yn=e.weight),e.surfaceUnit&&(He=e.surfaceUnit),e.placeFill&&re(T.placeFill,e.placeFill),e.routeHidden&&Io(c,e.routeHidden),e.serviceHidden&&Uo(c,e.serviceHidden),e.routeReading&&jo(c,e.routeReading),e.dest&&("key"in e.dest?re(T.dest,e.dest.key):st(e.dest)),e.selection&&rs(c,e.selection),e.stopRoutes&&re(T.stopRoutes,e.stopRoutes),e.view&&re(T.view,e.view),e.at&&sr(e.at.lat,e.at.lon),e.place&&pn(e.place),e.route&&er(e.route,{fly:!e.camera})}function E(){let e={view:g,day:R(),radius:F,oneSeatRestricted:Ne,weight:yn,surfaceUnit:He,dest:k,at:w,camera:Yi,place:fn,placeFill:G,selection:ts(),stopRoutes:I,route:fe,routeHidden:on(),routeReading:Pe(),serviceHidden:rn()},t=$i(e);history.replaceState(null,"",(at?Ei(t):t)+location.hash),bn(t)}function bn(e=Oi(location.search)){if(!at)return;let t=d("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g==="routes"?de()?tt(de()):null:w?se?Je(se):"this point":null;t.querySelector(".el-action").textContent=Di(n)}function Sn(){d("statebar").innerHTML=Si({view:g,day:R(),radius:F,oneSeatRestricted:Ne,destination:it(),stopRoutes:I}),Od()}function Xo(e){d("legend-box").classList.toggle("collapsed",e);let t=d("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Ed(){let e=t=>{d("app").classList.toggle("controls-open",t),d("controls-toggle").setAttribute("aria-expanded",String(t))};d("controls-toggle").addEventListener("click",()=>{e(!d("app").classList.contains("controls-open"))}),d("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Od(){d("controls-toggle").firstChild?.remove(),d("controls-toggle").prepend(document.createTextNode(bi(g)))}function Dd(){let e=d("app").classList.toggle("side-collapsed"),t=d("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),c.resize()}function b(){Td()}function Td(){if(d("legend-reset").classList.toggle("hidden",to()||so()||uo()||Qe()||!(q()||Te())),uo()){d("legend").innerHTML=da(Ft());return}if(Te()){d("legend").innerHTML=fi({groups:Fo(),day:R(),hidden:on(),serviceHidden:rn(),reading:Pe(),selected:de()});return}if(Qe()){d("legend").innerHTML=ja({selected:Ta(),fill:G,day:R(),boundaries:So(),unchanged:Pa()});return}if(to()){let n=kt();n&&Ws(d("legend"),n);return}if(so()){let n=we();if(!n)return;let o=c.getBounds();Vs(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=St();if(!e)return;let t=c.getBounds();qs(d("legend"),{layer:e,day:R(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:yn,dots:q(),surface:zn()?Rt():null,unit:He,population:Lt(),selection:es()})}async function Pd(e){if(e&&!Rt()){d("legend").classList.add("loading");try{await qn(c,F,R())}finally{d("legend").classList.remove("loading")}}Ls(c,e),e&&He==="people"&&await zi(),b()}async function zi(){if(!Lt()){d("legend").classList.add("loading");try{await Qn(F)}finally{d("legend").classList.remove("loading")}}}async function Md(e){e==="people"&&zn()&&await zi(),b()}async function Cd(e){if(e&&!kt()){d("legend").classList.add("loading");try{await no(c,R())}finally{d("legend").classList.remove("loading")}}Ds(c,e),b()}async function Ad(e){if(e&&(!bo()||!So())){d("legend").classList.add("loading");try{await Promise.all([Fa(),Na(c)])}finally{d("legend").classList.remove("loading")}}Ba(c,e),e&&Jt(c,G,R()),e&&O(),b()}async function pn(e){fn=await Be(()=>Ha(c,e))?e:null,g==="places"&&(O(),fn&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),E()}async function Fd(e){e&&await Be(()=>No(c,R())),ii(c,e),e&&O({scrollToTop:!0}),b()}async function er(e,{fly:t=!0}={}){fe=await Be(()=>Ho(c,e,R(),{fly:t}))?e:null,g==="routes"&&O({scrollToTop:!0}),b(),E()}function Gi(){!fe&&!de()||(Bo(c),fe=null,g==="routes"&&O({scrollToTop:!0}),b(),E())}async function Nd(){await Be(async()=>{await No(c,R()),fe&&await Ho(c,fe,R(),{fly:!1})}),g==="routes"&&O(),b()}function Hd(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function O({scrollToTop:e=!1}={}){if(e&&(d("panel").scrollTop=0),bn(),g==="places"){d("panel").innerHTML=Ia(bo()??[],Vi,fn,G);return}if(g==="routes"){let t=de();d("panel").innerHTML=t?pi(t):di(Fo()??[],fe,{reading:Pe(),day:R()});return}if(!se){g==="oneseat"?d("panel").innerHTML=Wr(it()):Ar(d("panel"));return}if(g==="oneseat"){let t=Yr(se,k,R());if(t){d("panel").innerHTML=t;return}}Jr(se,{withKerb:q(),routes:I})}function Bd(e,t=!1){if(ia(c,e),b(),!e){t&&(w?Ae(w.lat,w.lon):O());return}Ft()&&w?d("panel").innerHTML=mo(Ft(),it()):d("panel").innerHTML=ua(it())}async function nr(e,t){let n=++ge;w={lat:e,lon:t},E(),Qi(e,t);let o=Xi(),r=u(it());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await D(la({lat:e,lon:t},o,R()));if(n!==ge)return;po(c,s),d("panel").innerHTML=mo(s,r),b(),bn()}catch(s){if(n!==ge)return;po(c,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Zo(){d("day-controls").classList.toggle("hidden",!Us(g,Ne,G))}function or(){return Is(Ne,R())}async function Id(e){e&&!we()&&await Be(()=>ao(c,F,k,or())),js(c,e),b()}async function mn(){await Be(()=>ao(c,F,k,or())),b()}async function Be(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function st(e){if(k=e,gn(!1),Ud(),qi(),Sn(),E(),g==="journey"){w&&nr(w.lat,w.lon),b();return}w?Ae(w.lat,w.lon):O({scrollToTop:!0}),mn()}function qi(){let e=Xi();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in k))){pe?.remove(),pe=null;return}pe?pe.setLngLat([e.lon,e.lat]).addTo(c):(pe=new maplibregl.Marker({color:oo,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(c),pe.on("dragend",()=>{let n=pe.getLngLat();st({lat:n.lat,lon:n.lng})}))}function Ud(){let e=Bs(k);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Xi(){if("lat"in k)return{lat:k.lat,lon:k.lon};let e=k.key,t=tr.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function it(){if("lat"in k)return`${k.lat.toFixed(4)}, ${k.lon.toFixed(4)}`;let e=k.key;return tr.find(t=>t.key===e)?.name??e}function gn(e){Wi=e,c.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Ae(e,t){let n=++ge;w={lat:e,lon:t},E(),d("panel").classList.add("loading"),Qi(e,t),xn(c),$e(c,null,dn()),d("pin-key").classList.add("hidden");try{let o="lat"in k?`&dest_lat=${k.lat.toFixed(6)}&dest_lon=${k.lon.toFixed(6)}`:"",r=await D(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${F}${o}&oneseat_day=${or()}`);if(n!==ge)return;N={lat:e,lon:t,radius:F,now:r.current.stops,proposed:r.proposed.stops},se=r,el(),Zi(),O({scrollToTop:!0})}catch(o){if(n!==ge)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ge&&d("panel").classList.remove("loading")}}var N=null;function Zi(){if(!N||!kn(g)){xn(c),d("pin-key").classList.add("hidden"),hn();return}mr(c,N.lat,N.lon,N.radius,N.now,N.proposed),rr(N.radius),hn()}function hn(){let e=++zo,t=()=>{N&&rr(N.radius)};I!=="off"&&q()&&w&&se?.kerb?D(wa(w,R())).then(n=>{e===zo&&($e(c,n,dn()),Ut(c,!0),$a(c),t())}).catch(()=>{e===zo&&($e(c,null,dn()),Ut(c,!1),t())}):($e(c,null,dn()),Ut(c,!1),t())}function rr(e){let t=I!=="off"&&ba()&&Sa(It(),I)?I:!1;d("pin-key").innerHTML=zs(e,{routes:t}),d("pin-key").classList.remove("hidden")}function Qi(e,t){ot?ot.setLngLat([t,e]):(ot=new maplibregl.Marker({color:_d,draggable:!0}).setLngLat([t,e]).addTo(c),ot.on("dragend",()=>{let n=ot.getLngLat();sr(n.lat,n.lng)}))}var un=14;function q(){return g==="dots"||g==="both"}function Ki(e){K=e&&q(),K?c.dragPan.disable():c.dragPan.enable(),c.getCanvas().style.cursor=K?"none":"",K||tl(),Fe()}function el(){let e=q()&&!!se?.kerb;d("stop-routes-controls").classList.toggle("hidden",!e)}function Fe(){let e=d("legend-select");e.classList.toggle("hidden",!q()),e.setAttribute("aria-pressed",String(K)),e.textContent=K?"Selecting":"Select stops",d("legend-clear").classList.toggle("hidden",!q()||!ns())}function jd(e,t){let n=d("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!K}function Ji(e){d("brush").classList.toggle("painting",e)}function tl(){d("brush").hidden=!0}function Gd(){let e=d("brush");e.style.width=`${un*2}px`,e.style.height=`${un*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Fe(),b()}))},s=()=>{K&&(t=!0,n=!1,Ji(!0))},a=l=>{if(jd(l.point.x,l.point.y),!t)return;n=!0,In(c,jn(c,l.point.x,l.point.y,un))&&r()},i=l=>{if(Ji(!1),!!t){if(t=!1,!n){let[p]=jn(c,l.point.x,l.point.y,un);p&&os(c,p)}Fe(),b(),E()}};c.on("mousedown",s),c.on("mousemove",a),c.on("mouseup",i),c.getCanvas().addEventListener("mouseleave",tl),c.on("touchstart",s),c.on("touchmove",a),c.on("touchend",i)}function sr(e,t){if(Qo.atLeast("half"),g==="journey"){nr(e,t);return}g!=="places"&&g!=="routes"&&Ae(e,t)}async function Kd(){try{tr=await D("/api/destinations"),Sn()}catch{}}async function Jd(){try{let e=await D("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;d("feedline").textContent=t,d("feedline-methods").textContent=t,d("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Yd(e){d("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
