"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function E(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var an=new Map;function J(e){let t=an.get(e);if(t)return t;let n=E(e).catch(o=>{throw an.delete(e),o});return an.set(e,n),n}function u(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function me(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function ln(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function cn(e){return e>0?`+${e}`:String(e)}function Io(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Mi="#15181e",Uo="#ffa23a",Ci="#ffffff";function Ai(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;r.push([t+a*Math.cos(l),e+s*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function K(e){return{type:"FeatureCollection",features:e}}function Fi(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Ni(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function un(e){return e!=="corridors"&&e!=="journey"&&e!=="places"&&e!=="routes"}function dn(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(K([]))}function jo(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Go(e){e.addSource("walk",{type:"geojson",data:K([])}),e.addSource("stops-now",{type:"geojson",data:K([])}),e.addSource("stops-prop",{type:"geojson",data:K([])}),e.addSource("stop-moves",{type:"geojson",data:K([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Uo,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Ci,"circle-stroke-width":3,"circle-stroke-color":Uo}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Mi,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function Jo(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Ni(n.properties,e(o))}))}function Ko(e,t,n,o,r,s){e.getSource("walk").setData(K([Ai(t,n,o)])),e.getSource("stops-now").setData(K(jo(r,"current"))),e.getSource("stops-prop").setData(K(jo(s,"proposed"))),e.getSource("stop-moves").setData(K(Fi(s)))}var x=["weekday","saturday","sunday"],pn=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Wo={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},tt=4,nt=6,Yo=e=>nt+tt*e,zo=e=>nt+1+tt*e,Me=e=>nt+2+tt*e,Hi=e=>nt+3+tt*e,ot=2,Bi=3,Ce=4,Vo=5,ge=e=>e[Bi],M=(e,t)=>e[t],qo=(e,t)=>e[Hi(t)],mn=e=>2+2*e,gn=e=>3+2*e,rt=4,Xo=e=>2+rt*e,Zo=e=>3+rt*e,Qo=e=>4+rt*e,er=e=>5+rt*e;var Ii=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],Ui=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],tr=1e-6,ji=32;function rr(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=Ii.map(([i,l])=>(e+i*r+l*s)**3);return Ui.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function nr(e,t,n){return rr(e,t,n).every(o=>o>=-tr&&o<=1+tr)}function Gi(e,t,n){if(nr(e,t,n))return t;let o=0,r=t;for(let s=0;s<ji;s++){let a=(o+r)/2;nr(e,a,n)?o=a:r=a}return o}function Ji(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function Ki(e,t,n){let[o,r,s]=rr(e,Gi(e,t,n),n);return`#${[o,r,s].map(a=>Ji(a).toString(16).padStart(2,"0")).join("")}`}var or=/(\d+)/;function Wi(e,t){let n=e.split(or),o=t.split(or);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function Ae(e){let t=[...new Set(e)].sort(Wi);return new Map(t.map((n,o)=>[n,Ki(.55,.16,o*360/t.length)]))}var sr="at this stop",ar=e=>`within ${e} m`,Yi="both directions",zi="one or both directions",hn="weekday";function v(){return hn}function pr(e){hn=e}function mr(e){e.innerHTML=`
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
    </div>`}function gr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Vi(e,t){let n=Math.max(1,...pn.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return pn.map(o=>{let r=e.periods[o]??0,s=t.periods[o]??0,a=s-r,i=a>0?"up":a<0?"down":"flat";return`
      <tr>
        <th>${Wo[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${a===0?"\xB7":cn(a)}</td>
      </tr>`}).join("")}function fr(e){return e.length?e.map(t=>`<span class="route">${u(t)}</span>`).join(" "):'<span class="muted">none</span>'}function ir(e){return e.first==null?'<span class="muted">no service</span>':`${me(e.first)}\u2013${me(e.last)}`}function lr(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var qi={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Xi={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Zi(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':st(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${u(o.name)}</span>
          <span class="os-status ${u(o.status)}">${qi[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Xi[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${oe("one-seat")}</p>
    </div>`:""}function oe(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Fe(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function cr(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function ur(e){return e.first==null||e.last==null?null:e.last-e.first}function st(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${dr(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${dr(t,o,"prop",r("proposed"))}</div>
    </div>`}function dr(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${u(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var fn=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Qi="Allegheny";function He(e){let t=e.place?.muni?.trim()??"",n=fn.exec(t)?.[1],o=n===Qi?t.replace(fn,""):n?`${t.replace(fn,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Ne(e){return e==="weekday"?"weekday":e}function hr(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ne(t)}`}function el(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function tl(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function nl(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${oe("one-direction")}</dt>
      ${Fe(r(n,e.routes),r(o,t.routes))}`}function yr(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Ne(t)}, today only</span>`;return`<dt>Boardings ${u(n)}</dt><dd>${s}${r}</dd>`}function br(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${oe("boardings")}</p>`}function ol(e){if(!e)return"";let t=u(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${oe("place-population")}</p>
    </div>`}function Sr(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
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
        ${s===0?"no change":`${cn(s)} trips`}
        <div class="muted">${Io(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ne(n)} ${u(o)}${r?`, ${u(r)}`:""}</div>`}function wr(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Vi(e,t)}</tbody>
    </table>`}function vr(e,t){let n=lr(e),o=lr(t),r=ur(e),s=ur(t);return`
      <dt>First and last</dt>
      ${Fe(ir(e),ir(t))}
      <dt>Hours between</dt>
      ${Fe(ln(r),ln(s),cr(r,s,"more"))}
      <dt>Typical wait</dt>
      ${Fe(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,cr(n,o,"less"))}`}function Rr(e,t,n,o){return`
    <div class="routes">
      <h3>${u(n)}</h3>
      ${st(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${oe("location-not-route")}</p>
    </div>`}function rl(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${Ne(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${Ne(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${oe("stop-routes")}</p>`}function sl(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:Ae((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${u(i)}
        <span class="muted">\xB7 PRT stop ${u(e.stop_id)}</span></div>
      ${Sr(o,r,t,sr)}
      <div class="tiers">${gr(o.hourly,r.hourly)}</div>
      ${wr(o,r)}
      <dl class="facts">
        ${vr(o,r)}
        ${yr(o.boardings,t,sr)}
      </dl>
      ${br(o.boardings)}
      ${Rr(o,r,"Routes calling at this stop",a)}
      ${rl(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${oe("kerb")}</p>
    </section>`}function yn(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],s=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Sr(o,r,t,ar(e.radius),{directions:s?zi:Yi})}

    <div class="tiers">${gr(o.hourly,r.hourly)}</div>

    ${wr(o,r)}
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
      ${vr(o,r)}
      ${nl(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Fe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${tl(e.current.stops)}
      ${el(e.proposed.stops)}
      ${yr(o.boardings,t,ar(e.radius))}
    </dl>
    ${br(o.boardings)}

    ${n}

    ${ol(e.population)}

    ${Rr(o,r,"Routes serving this spot")}`}function al(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,s=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${u(He(e))}</h2>
      <div class="muted">${s}</div>
    </div>
    ${r?sl(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${yn(e,t,Zi(e.oneseat??[],e.oneseat_day??"any"))}`}function Lr(e,t={}){document.getElementById("panel").innerHTML=al(e,hn,t)}var il={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},ll={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},cl={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ul(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function bn(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${fr(t)}</div>`:""}function dl(e){let t=bn("kept",e.kept)+bn("lost",e.lost)+bn("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function pl(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${st(e.current,e.proposed)}
    </div>`}function ml(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${u(r.key)}">
      <span class="os-name">${u(r.name)}</span>
      <span class="os-status ${u(r.status)}">${gl[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var gl={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function fl(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${cl[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function $r(e,t,n){let o=ul(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":dl(o)+pl(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${u(o.name)}</h2>
      <div class="muted">
        from ${u(He(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${u(o.status)}">${il[o.status]}</div>
    <p class="note">${ll[o.status]} ${fl(r)}</p>

    ${s}

    ${ml(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${hr(e,n)}</summary>
      ${yn(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function _r(e){return`
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
    </div>`}var it={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},fe="change",X="change-dots",re=["boolean",["feature-state","selected"],!1],kr="#15181e",se=["==",["get","published"],0],ct="newplace",hl="#15181e",yl=5,lt=["==",["get","removed"],1],ut="removedstop",Ie="change-removed",vn="change-removed-selected",Sn="removed-cross",Er="#e8232f";function bl(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,Er]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var at=null,q=new Set,I=new Set,Sl=[X,vn,Ie],dt=[X,Ie],Ue=X;function Pr(e,t){for(let n of Sl)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function pt(){return at}function je(e){return q.has(e)}function Dr(e,t,n,o){return r=>Rl(r,e,t,n,o)}function Or(e){return t=>e.has(ge(t))}function Tr(){return I}function Mr(){return[...I].sort()}function Cr(){return I.size}function Rn(e,t){let n=0;for(let o of t)I.has(o)||(I.add(o),Be(e,o,!0),n++);return n}function Ar(e,t){I.delete(t)?Be(e,t,!1):(I.add(t),Be(e,t,!0))}function Fr(e,t){Ln(e),Rn(e,t)}function Ln(e){for(let t of I)Be(e,t,!1);I.clear()}function Be(e,t,n){try{e.setFeatureState({source:fe,id:t},{selected:n})}catch{}}function wl(e){for(let t of I)Be(e,t,!0)}function vl(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function $n(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[X,Ie].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[l,m]=i.geometry.coordinates,p=e.project([l,m]);return{id:i.id,x:p.x,y:p.y}});return vl(t,n,o,a)}function Nr(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||M(s,ot)===0||M(s,Ce)===1)continue;let a=n[M(s,Me(t))];a!==void 0&&r[a]++}return r}function Hr(e,t){let n=0;for(let o of e)t(o)&&M(o,ot)===0&&n++;return n}function Br(e,t){let n=0;for(let o of e)t(o)&&M(o,Ce)===1&&n++;return n}function Rl(e,t,n,o,r){let s=M(e,0),a=M(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function Ir(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||M(s,ot)===0)continue;let a=n[M(s,Me(t))];if(a===void 0)continue;let i=qo(s,t),l=M(s,Ce)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(l){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function Ll(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((o,r)=>t[M(n,Me(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ge(n),published:n[2],removed:n[Ce],name:n[Vo],moved:e.moved?.[ge(n)]??null,replacement:e.replacement?.[ge(n)]?.[0]??null,nearestStraight:e.replacement?.[ge(n)]?.[1]??null,...Object.fromEntries(x.flatMap((o,r)=>[[`b${r}`,t[M(n,Me(r))]],[`sc${r}`,n[Yo(r)]],[`sp${r}`,n[zo(r)]]]))}}))}}function Ur(e,t){let n=Object.entries(it).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,it.none[t]]}function jr(e){return["case",se,"rgba(0,0,0,0)",Ur(e,"color")]}function wn(e){return["case",se,yl,Ur(e,"size")]}function Gr(e){return["interpolate",["linear"],["zoom"],9,["*",wn(e),.45],12,wn(e),16,["*",wn(e),1.9]]}function Jr(e){e.addSource(fe,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:X,type:"circle",source:fe,paint:{"circle-color":jr(0),"circle-radius":Gr(0),"circle-opacity":.85,"circle-stroke-color":["case",re,kr,se,hl,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",re,1.6,se,.9,.5],12,["case",re,2.4,se,1.5,1],16,["case",re,3.2,se,2.2,1.6]]}},"walk-fill"),e.addLayer({id:vn,type:"circle",source:fe,filter:lt,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":kr,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",re,1.6,0],12,["case",re,2.4,0],16,["case",re,3.2,0]]}},"walk-fill"),e.hasImage(Sn)||e.addImage(Sn,bl(),{pixelRatio:2}),e.addLayer({id:Ie,type:"symbol",source:fe,filter:lt,layout:{"icon-image":Sn,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function _n(e,t,n){return at=await J(`/api/change?radius=${t}`),e.getSource(fe).setData(Ll(at)),wl(e),kn(e,n),at}function kn(e,t){let n=x.indexOf(t);e.setPaintProperty(X,"circle-color",jr(n)),e.setPaintProperty(X,"circle-radius",Gr(n)),xn(e,t)}function Kr(e,t,n){q.has(t)?q.delete(t):q.add(t),xn(e,n)}function Wr(e,t){q.clear(),xn(e,t)}function xn(e,t){let n=x.indexOf(t),o=["none",...q],r=["case",se,!q.has(ct),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(X,["all",["!",lt],r]);let s=["all",lt,!q.has(ut)];e.setFilter(Ie,s),e.setFilter(vn,s)}function $l(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function En(e,t,n,{pole:o=!0}={}){let r=x.indexOf(t),s=e[`b${r}`],a=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(R=>R.key===s)?.label??s,l=e[`sc${r}`],m=e[`sp${r}`],p=t==="weekday"?"weekday":t,y=a?`Currently ${l}`:`${l} \u2192 ${m}`;return`${o?$l(e):""}${kl(e)}${y} buses per ${p} at this stop<br>${a?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var _l=1.5,xr=800;function kl(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??xr,r=n!=null&&o>n*_l?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${xr} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${Er}">Stop removed</b> \u2014 ${s}<br>`}var Pn="surface",gt="surface-fill",Yr="#6b7280",Dn=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Yr],[.138,Yr],[1,"#bd60e7"],[2,"#961bed"]],C="#e8232f",A="#0f79c9",zr=2,mt=null,Vr=!1;function ft(){return mt}function On(){return Vr}function qr(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-zr,Math.min(zr,n))}function Xr(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Zr(e,t,n,o,r,s,a,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let m of e){let p=a.lat0+(m[1]+.5)*a.dlat,y=a.lon0+(m[0]+.5)*a.dlon;if(p<o||p>s||y<n||y>r)continue;let R=m[mn(t)],w=m[gn(t)],$=Xr(R,w);if($!=="none")if($==="ramp"){let f=qr(R,w);l[f<-.138?"less":f>.138?"more":"same"]+=i}else l[$]+=i}return l}function xl(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,l=n+s[0]*r,m=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,a],[m,a],[m,i],[l,i],[l,a]]]},properties:Object.fromEntries(x.flatMap((p,y)=>{let R=s[mn(y)],w=s[gn(y)];return[[`k${y}`,Xr(R,w)],[`v${y}`,qr(R,w)??0]]}))}})}}function Qr(e){return["case",["==",["get",`k${e}`],"gone"],C,["==",["get",`k${e}`],"new"],A,["interpolate",["linear"],["get",`v${e}`],...Dn.flatMap(([t,n])=>[t,n])]]}function he(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function es(e,t){e.addSource(Pn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:gt,type:"fill",source:Pn,layout:{visibility:"none"},paint:{"fill-color":Qr(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,he(0,.85),13,he(0,.62),16,he(0,.45)]}},t)}async function Tn(e,t,n){return mt=await J(`/api/surface?radius=${t}`),e.getSource(Pn).setData(xl(mt)),Mn(e,n),mt}function Mn(e,t){let n=x.indexOf(t);e.setPaintProperty(gt,"fill-color",Qr(n)),e.setPaintProperty(gt,"fill-opacity",["interpolate",["linear"],["zoom"],9,he(n,.85),13,he(n,.62),16,he(n,.45)])}function ts(e,t){Vr=t,e.setLayoutProperty(gt,"visibility",t?"visible":"none")}var Cn=null;function ht(){return Cn}async function An(e){return Cn=await J(`/api/population?radius=${e}`),Cn}function ns(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let m=a.lat0+(l[1]+.5)*a.dlat,p=a.lon0+(l[0]+.5)*a.dlon;m<o||m>s||p<n||p>r||(i.lost+=l[Xo(t)],i.gained+=l[Zo(t)],i.kept+=l[Qo(t)],i.none+=l[er(t)])}return i}var Fn="corridor",os="corridor-lines",ye="#8b929c",El="#6f7783",bt={lost:C,added:A,kept:ye};var yt=null,rs=!1;function St(){return yt}function Nn(){return rs}function Pl(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function ss(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Dl(){let e=t=>["match",["get","klass"],"lost",bt.lost,"added",bt.added,t];return["interpolate",["linear"],["zoom"],9,e(El),14,e(ye)]}function Ol(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Tl(){return["match",["get","klass"],"kept",.85,.9]}function as(e,t){e.addSource(Fn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:os,type:"line",source:Fn,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Dl(),"line-width":Ol(),"line-opacity":Tl()}},t)}async function Hn(e,t){return yt=await E(`/api/corridors?day=${t}`),e.getSource(Fn).setData(Pl(yt)),yt}async function is(e,t){x.includes(t)&&await Hn(e,t)}function ls(e,t){rs=t,e.setLayoutProperty(os,"visibility",t?"visible":"none")}var In="#2b3038",cs="#b9bec6",Ge={loses:{color:C,size:6},gains:{color:A,size:6},keeps:{color:ye,size:3},here:{color:In,size:3.5},none:{color:cs,size:1.8}},vt=["loses","gains","keeps","none","here"],Bn="oneseat",us="oneseat-dots",wt=null,ds=!1;function be(){return wt}function Un(){return ds}function ps(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;for(let i of e){let l=i[0],m=i[1];if(l<o||l>s||m<n||m>r)continue;let p=t[i[3]];p!==void 0&&a[p]++}return a}function Ml(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Cl(){return["match",["get","status"],...Object.entries(Ge).flatMap(([e,t])=>[e,t.color]),cs]}function Al(){let e=["match",["get","status"],...Object.entries(Ge).flatMap(([t,n])=>[t,n.size]),Ge.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function ms(e,t){e.addSource(Bn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:us,type:"circle",source:Bn,layout:{visibility:"none"},paint:{"circle-color":Cl(),"circle-radius":Al(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Fl(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Nl="pin";function gs(e){return"key"in e?e.key:Nl}var Rt="any";function Hl(e,t,n){return`radius=${e}&${Fl(t)}&day=${n}`}function fs(e,t){return e?t:Rt}function hs(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function jn(e,t,n,o=Rt){return wt=await E(`/api/oneseat?${Hl(t,n,o)}`),e.getSource(Bn).setData(Ml(wt)),wt}function ys(e,t){ds=t,e.setLayoutProperty(us,"visibility",t?"visible":"none")}function Gn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function bs(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),r=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",a=Gn(t);return e.status==="here"?`<b>at ${a}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${a}<br>today: ${s(o)}<br>proposed: ${s(r)}`}var Lt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Jn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Bl=new Set(["gone","new"]);function Il(e,t,n){return Bl.has(e)?`${t} (${Jn[n]})`:t}function Ul(e){return e.buckets.filter(t=>t.key!=="none")}var Ss={area:"Ground",people:"People"};function jl(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=Zr(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Gl(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=ns(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Jl=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function ws(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1}=e,l=Dn.map(([m,p])=>`${p} ${((m+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${l})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${C}"></i>loses all service
          (${Jn[n]})</span>
        <span><i style="background:${A}"></i>new service
          (${Jn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Ss).map(m=>`
          <button data-surface-unit="${m}" aria-pressed="${r===m}"
                  class="${r===m?"active":""}">${Ss[m]}</button>`).join("")}
      </div>
      ${a?Jl:r==="people"?Gl(n,o,s):jl(t,n,o)}
    </div>`}var Kl=["lost","added","kept"],Wl={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Yl={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Rs(e,t){let{lostPct:n,addedPct:o}=ss(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${Yl[t.day]}
    </div>
    ${Kl.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${bt[i]}"></i>
        <span class="lg-lab">${u(Wl[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function Ls(e,t,n){let o=t.statuses.map(p=>p.key),r=ps(t.points,o,n.west,n.south,n.east,n.north),s=p=>t.statuses.find(y=>y.key===p)?.label??p,a=vt.reduce((p,y)=>p+(r[y]??0),0),i=Gn(t),l=t.day&&t.day!==Rt,m=l?`Restricted to routes running on ${Lt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${u(i)}</b>
      <span class="muted">\xB7 ${a.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${l?` \xB7 ${Lt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${vt.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${Ge[p].color}"></i>
        <span class="lg-lab">${u(s(p))}</span>
        <span class="lg-n">${(r[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${vt.map(p=>`${(t.counts[p]??0).toLocaleString()} ${u(s(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${u(i)} without transferring?
      ${m} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function $s(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var vs={locations:"Stops",riders:"Riders"};function zl(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Vl(e){if(!e)return"";let t=je(ct);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${ct}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function ql(e,t){if(!e)return"";let n=je(ut);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${ut}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Xl(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Vl(e)}
      ${ql(t,n)}
    </div>`}function _s(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:l,selection:m,dots:p=!0}=t,y=n.buckets.map(L=>L.key),R=n.days.indexOf(o),{west:w,south:$,east:f,north:k}=r,V=Ul(n),O=m&&m.size>0?m:null,et=O?Or(O):Dr(w,$,f,k),Ho=Nr(n.points,R,y,et),on=Hr(n.points,et),rn=Br(n.points,et),H=s==="riders"?Ir(n.points,R,y,et):null,xi=L=>H?H.measured[L]?Math.round(H.riders[L]).toLocaleString():"\u2014":Ho[L].toLocaleString(),Ei=H?H.removedMeasured?Math.round(H.removedRiders).toLocaleString():"\u2014":rn.toLocaleString(),Pi=O?`at ${O.size.toLocaleString()} selected stop${O.size===1?"":"s"}`:"in view",Bo=V.reduce((L,sn)=>L+Ho[sn.key],0)+on+rn,Di=H?`<b>${Math.round(V.reduce((L,sn)=>L+H.riders[sn.key],0)+H.removedRiders).toLocaleString()}</b> daily boardings ${Pi}`:O?`<b>${Bo.toLocaleString()}</b>
         of ${O.size.toLocaleString()} selected stops`:`<b>${Bo.toLocaleString()}</b>
         stops in view`,Oi=a?` \xB7 surface: ${n.radius} m walk`:"",Ti=!p&&!!a;e.innerHTML=Ti?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${Lt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${ws({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!O,named:!0})}`:`
    <div class="lg-head">
      ${Di}
      <span class="muted">\xB7 ${Lt[o]}${Oi}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(vs).map(L=>`
        <button data-weight="${L}" aria-pressed="${s===L}"
                class="${s===L?"active":""}">${vs[L]}</button>`).join("")}
    </div>
    ${V.map(L=>`
      <button class="lg-row ${je(L.key)?"off":""}" data-bucket="${u(L.key)}"
              aria-pressed="${!je(L.key)}">
        <i style="background:${it[L.key]?.color??"#666"}"></i>
        <span class="lg-lab">${u(Il(L.key,L.label,o))}</span>
        <span class="lg-n">${xi(L.key)}</span>
      </button>`).join("")}
    ${Xl(on,rn,Ei)}
    ${a?ws({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!O}):""}
    ${H?zl(H.unmeasured,on):""}
    ${O?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Se="#4aa3ff",Je="#ffa23a",Kn="headline",$t="journey",kt="journey-rides",Ts="journey-walks",Zl=[kt,Ts],Ms=null,Cs=!1;function xt(){return Ms}function Wn(){return Cs}function Ql(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,l=a.to??e.destination,m=[[i.lon,i.lat],[l.lon,l.lat]],p=a.path?.length?a.path:m;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function ks(){return["match",["get","side"],"current",Se,"proposed",Je,Se]}function xs(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function As(e,t){e.addSource($t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:kt,type:"line",source:$t,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ks(),"line-width":xs(1),"line-opacity":.85}},t),e.addLayer({id:Ts,type:"line",source:$t,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ks(),"line-width":xs(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Fs(e,t){Cs=t;for(let n of Zl)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Yn(e,t){Ms=t;let n=t?Ql(t,Kn):{type:"FeatureCollection",features:[]};e.getSource($t).setData(n)}function Ns(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Es=e=>`${e.toFixed(1)} min`;function Hs(e){return e==null?"\u2014":e===0?"no change":e>0?`${Es(e)} slower`:`${Es(-e)} faster`}function Ps(e,t){return e?e.name?u(e.name):`stop ${u(e.stop_id)}`:t}function ec(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Ps(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${u(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Ps(e.to,"the destination")}</span></div>`}function Ds(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(ec(r,t)),o=r}return n.join("")}var tc={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function _t(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function nc(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function oc(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${_t(t.current)} \u2192
        ${_t(t.proposed)} min</span>
        <span class="muted">${Hs(t.change_min)}</span></div>
      ${o}
    </div>`}function Os(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function zn(e,t){let n=e.radii[Kn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${u(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${me(e.window.start_min)}
        and ${me(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${tc[n.classification]??""}</p>
      </div>
      ${Os(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${_t(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${_t(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Hs(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${nc(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Ds(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Ds(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${oc(e)}
    ${Os(e)}`}function Bs(e){return`
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
    </div>`}function Is(e){let t=e?e.radii[Kn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Se}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Je}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Dt="off",Ke="stoproutes",Gs="stoproutes-lines",qn="stoproutes-flow",Js="stoproutes-arrows",rc=[Gs,qn,Js],Vn="stoproutes-arrow",Us=3.5,Ks=null,Ws=!1;function Ot(){return Ks}function Ys(){return Ws}function zs(e,t){return e!==null&&e[t].length>0}function sc(e,t){let n=t==="current"?e.current:e.proposed,o=Ae(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function ac(){return["interpolate",["linear"],["zoom"],9,Us*.6,14,Us]}function ic(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function Vs(e,t){e.addSource(Ke,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Gs,type:"line",source:Ke,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":ac(),"line-opacity":.85}},t),e.addLayer({id:qn,type:"line",source:Ke,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},t),e.hasImage(Vn)||e.addImage(Vn,ic(),{pixelRatio:2,sdf:!0}),e.addLayer({id:Js,type:"symbol",source:Ke,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":Vn,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},t)}function Tt(e,t){Ws=t;for(let n of rc)e.setLayoutProperty(n,"visibility",t?"visible":"none");t||ea()}function ve(e,t,n){Ks=t;let o=t?sc(t,n):{type:"FeatureCollection",features:[]};e.getSource(Ke).setData(o),t||ea()}function qs(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var lc={current:"today",proposed:"proposed"};function Xs(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${u(e.color)}"></i> <b>${u(e.route)}</b>${e.name?` \u2014 ${u(e.name)}`:""}<br><span style="opacity:.75">${lc[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var cc=20;function uc(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var js=uc(3,4,24),U=null,Et=0,Pt=0,we=null;function dc(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function Xn(e){we&&(U=requestAnimationFrame(Xn),!(e-Pt<1e3/cc)&&(Pt=e,Et=(Et+1)%js.length,we.setPaintProperty(qn,"line-dasharray",js[Et])))}function Zs(){we&&(document.hidden?U!==null&&(cancelAnimationFrame(U),U=null):U===null&&(Pt=0,U=requestAnimationFrame(Xn)))}function Qs(e){dc()||we||(we=e,Et=0,Pt=0,document.addEventListener("visibilitychange",Zs),U=requestAnimationFrame(Xn))}function ea(){U!==null&&(cancelAnimationFrame(U),U=null),document.removeEventListener("visibilitychange",Zs),we=null}var At="places",oa="places-points",Zn="places-boundaries",ie="places-fill",Le="lost",pc=100,mc={lost:"share_lost",gained:"share_gained"};function Q(e,t){return`service_${e}_${t}`}var ra={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},gc="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",ae={lost:C,gained:A},Mt=null,Z=null,Re=null,sa=!1,Ct=null;function Qn(){return Mt}function aa(){return Z}function ia(){return Ct}function eo(){return Re}function We(){return sa}function fc(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function hc(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function yc(e){return Math.max(e.residents_lost,e.residents_gained)}var ta=4,bc=16,Sc=1e3;function wc(e){let t=Math.min(1,Math.sqrt(e/Sc));return ta+t*(bc-ta)}function vc(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:hc(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:wc(yc(t))}}))}}function Rc(){return["match",["get","klass"],"lost",ae.lost,"gained",ae.gained,ae.lost]}function Lc(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var W=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var Y=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function la(e,t){return e==="service"?["step",["abs",["coalesce",["get",Q(t,"pct")],0]],Y[0].opacity,Y[0].max,Y[1].opacity,Y[1].max,Y[2].opacity,Y[2].max,Y[3].opacity]:["step",["coalesce",["get",mc[e]],0],W[0].opacity,Number.EPSILON,W[1].opacity,W[1].max,W[2].opacity,W[2].max,W[3].opacity,W[3].max,W[4].opacity]}function ca(e,t){return e==="service"?["case",[">=",["coalesce",["get",Q(t,"pct")],0],0],A,C]:ae[e]}function $c(e,t){let n=Q(t,"now"),o=Q(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var _c=3;function kc(e){if(e.length===0)return"";let t=e.slice(0,_c),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function ua(e,t){e.addSource(Zn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ie,type:"fill",source:Zn,layout:{visibility:"none"},paint:{"fill-color":ca(Le),"fill-opacity":la(Le),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(At,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:oa,type:"circle",source:At,layout:{visibility:"none"},paint:{"circle-color":Rc(),"circle-radius":Lc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ft(e,t,n){e.setPaintProperty(ie,"fill-color",ca(t,n)),e.setPaintProperty(ie,"fill-opacity",la(t,n))}async function da(){return Mt||(Mt=await E("/api/places")),Mt}async function pa(e){return Re||(Re=await E("/api/boundaries"),e.getSource(Zn).setData(Re)),Re}function xc(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function ma(e,t){let n=xc(Re,t);if(n)return Z=null,Ct=n,e.getSource(At)?.setData({type:"FeatureCollection",features:[]}),null;try{Z=await E(`/api/places/${encodeURIComponent(t)}`)}catch{return Z=null,Ct=null,null}return Ct=null,e.getSource(At).setData(vc(Z)),e.flyTo({center:[Z.lon,Z.lat],zoom:13}),Z}function ga(e,t){sa=t,e.setLayoutProperty(oa,"visibility",t?"visible":"none"),e.setLayoutProperty(ie,"visibility",t?"visible":"none")}function Ec(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${u(e.key)}">
      <span class="place-name">${u(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Pc="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function fa(e,t,n,o){let r=fc(e,t).map(s=>Ec(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${gc}</p>
    ${o==="service"?`<p class="note">${Pc}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function ha(e,t){return e?`<div class="lg-head"><b>${u(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${u(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Dc(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Oc(e,t,n,o){let r=Y.map((l,m)=>({band:l,prevMax:m===0?0:Y[m-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:m})=>{let p=Dc(l,m);return[`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(p)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${A};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(p)} more trips</span></div>`]}).join(""),s=o?$c(o,n):[],a=kc(s),i=a?`<div class="lg-foot">${u(a)}</div>`:"";return`
    ${ha(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${u(ra[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ya({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return Oc(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=W.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${ae[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${u(i.label)} of the place's own residents ${u(s)}</span>
    </div>`).join("");return`
    ${ha(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${u(s)}</div>
    ${a}
    <div class="lg-row lg-static"><i style="background:${ae.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${ae.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Tc(e,t){let n=e[Q(t,"now")],o=e[Q(t,"proposed")],r=e[Q(t,"pct")],s=e[Q(t,"rail_proposed")],a=ra[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function ba(e,t,n){if(t==="service")return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      ${Tc(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=na("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?na("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function na(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${pc} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Ra=["discontinued","new","reshaped","one-to-one"],La={discontinued:["discontinued"],new:["new"],reshaped:["split","merged"],"one-to-one":["one-to-one"]},lo=["one-to-one"];function Ut(e){return Ra.includes(e)}function co(e){return Ra.filter(t=>e.includes(t))}var Sa="#8e44ad",$a={discontinued:C,new:A,split:Sa,merged:Sa,"one-to-one":ye},uo={discontinued:"discontinued",new:"new",split:"split",merged:"merged","one-to-one":"one-to-one"},Mc=["discontinued","new","split","merged","one-to-one"],Cc="route-changes",Ac=.12,_a=.9,Fc=1,Nc=/^[cp]:[\w-]{1,64}$/;function ka(e){return Nc.test(e)}var to={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Hc={current:"today",proposed:"proposed"},xa=" \u2192 ",It="\u2014";function Nt(e,{named:t=!0}={}){return e.length===0?It:e.map(n=>t&&n.name?`${n.route} ${n.name}`:n.route).join(", ")}function Ye(e,{farSideNamed:t=!0}={}){return e.current.length===0?Nt(e.proposed):e.proposed.length===0?Nt(e.current):`${Nt(e.current)}${xa}${Nt(e.proposed,{named:t})}`}function ro(e){if(e===null)return It;let t=Math.round(e);return t===0?"0%":t>0?`+${t}%`:`\u2212${Math.abs(t)}%`}function Bc(e){let t=Object.fromEntries(Mc.map(n=>[n,0]));for(let n of e)t[n.status]+=1;return t}var Ea="routechange",ke="routechange-lines",jt="routechange-arrows",po="routechange-selected",mo="routechange-selected-lines",Pa="routechange-selected-arrows",Ic=[ke,jt,mo,Pa],go=[mo,ke],so="routechange-arrow",no=2.6,Uc=1.5,jc=2.8;function ao(e,t,n,o=1){return{type:"Feature",geometry:{type:"LineString",coordinates:e.points},properties:{key:e.key,side:e.side,route:e.route,name:e.name,status:e.status,pattern_id:e.pattern_id,color:t,sort:n,w:o}}}function Gc(e){return{type:"FeatureCollection",features:e.features.map(n=>ao(n,$a[n.status],n.status==="one-to-one"?0:1)).sort((n,o)=>n.properties.sort-o.properties.sort)}}function Jc(e){return{type:"FeatureCollection",features:e.features.map(n=>n.side==="current"?ao(n,Se,0,jc):ao(n,Je,1,Uc)).sort((n,o)=>n.properties.sort-o.properties.sort)}}function Kc(e){let t=1/0,n=1/0,o=-1/0,r=-1/0;for(let s of e)for(let[a,i]of s.points)a<t&&(t=a),a>o&&(o=a),i<n&&(n=i),i>r&&(r=i);return Number.isFinite(t)?[[t,n],[o,r]]:null}function Wc(e){if(e.length===0)return null;let t=e.flatMap(n=>La[n]);return["!",["in",["get","status"],["literal",t]]]}function Yc(){let e=t=>["*",["get","w"],t];return["interpolate",["linear"],["zoom"],9,e(no*.5),14,e(no),16,e(no*1.6)]}function zc(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function wa(e,t,n,o,r,s){e.addSource(t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:n,type:"line",source:t,layout:{visibility:"none","line-cap":"round","line-join":"round","line-sort-key":["get","sort"]},paint:{"line-color":["get","color"],"line-width":Yc(),"line-opacity":s}},r),e.addLayer({id:o,type:"symbol",source:t,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":140,"symbol-sort-key":["get","sort"],"icon-image":so,"icon-size":["interpolate",["linear"],["zoom"],12,.45,16,.8],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"],"icon-opacity":s}},r)}function Da(e,t){e.hasImage(so)||e.addImage(so,zc(),{pixelRatio:2,sdf:!0}),wa(e,Ea,ke,jt,t,_a),wa(e,po,mo,Pa,t,Fc),wo(e)}var Bt=null,$e=null,Oa=!1,_e=new Set(lo);function fo(){return Bt?.groups??null}function le(){return $e}function ze(){return Oa}function Vc(e){return`/api/route_changes?day=${e}`}function qc(e,t){return`/api/route_changes/${encodeURIComponent(e)}?day=${t}`}async function ho(e,t){if(!x.includes(t))throw new Error(`no such day type: ${t}`);return Bt=await J(Vc(t)),e.getSource(Ea).setData(Gc(Bt)),Bt}async function yo(e,t,n,{fly:o=!0}={}){try{$e=await J(qc(t,n))}catch{return bo(e),null}e.getSource(po).setData(Jc($e)),Ta(e,!0);let r=Kc($e.features);return o&&r&&e.fitBounds(r,{padding:60,maxZoom:14}),$e}function bo(e){$e=null,e.getSource(po)?.setData({type:"FeatureCollection",features:[]}),e.getLayer(ke)&&Ta(e,!1)}function Ta(e,t){let n=t?Ac:_a;e.setPaintProperty(ke,"line-opacity",n),e.setPaintProperty(jt,"icon-opacity",n)}function Gt(){return co([..._e])}function Ma(e,t){_e.has(t)?_e.delete(t):_e.add(t),wo(e)}function So(e,t){_e.clear();for(let n of t)_e.add(n);wo(e)}function wo(e){let t=Wc(Gt());e.setFilter(ke,t),e.setFilter(jt,t)}function Ca(e,t){Oa=t;for(let n of Ic)e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Xc="A route group is PRT\u2019s own mapping of today\u2019s route numbers onto the plan\u2019s \u2014 the routes it says replace each other. It is not a corridor: a street can lose one group\u2019s buses and gain another\u2019s, and only the location, surface and street views can see that.";function Aa(){return` <button class="howto" data-caveat="${Cc}">method</button>`}function Zc(e){if(e.current.length===0||e.proposed.length===0)return"";let t=e.service.weekday.pct_trips;return`<span class="rc-pct ${io(t)}" title="Weekday trips, today to plan">${ro(t)}</span>`}function io(e){return e===null||Math.round(e)===0?"flat":e>0?"up":"down"}function Qc(e){return e==="one-to-one"?"rc-map":`rc-map ${e}`}function Fa(e,t){return`
    <button type="button" class="rc-row${t?" selected":""}"
            data-select-route="${u(e.key)}">
      <span class="${Qc(e.status)}">${u(Ye(e,{farSideNamed:!1}))}</span>
      ${Zc(e)}
    </button>`}function oo(e,t,n){return`
    <div class="scope-head">${u(e)} (${t.length})</div>
    <div class="rc-list">${t.map(o=>Fa(o,o.key===n)).join("")}</div>`}function Na(e,t){let n=r=>e.filter(s=>r.includes(s.status)),o=n(["one-to-one"]);return`
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${e.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${Xc}${Aa()}</p>
    ${oo("Discontinued",n(["discontinued"]),t)}
    ${oo("New",n(["new"]),t)}
    ${oo("Split or merged",n(["split","merged"]),t)}
    <details class="svc rc-kept">
      <summary>One-to-one (${o.length}) \u2014 one number on each side; how its service changed</summary>
      <div class="rc-list">${o.map(r=>Fa(r,r.key===t)).join("")}</div>
    </details>`}function eu(e,t){return`
    <tr><th>${e}</th>
      <td class="n">${t.cur_trips.toLocaleString()}</td>
      <td class="n">${t.prop_trips.toLocaleString()}</td>
      <td class="n ${io(t.pct_trips)}">${ro(t.pct_trips)}</td>
      <td class="n">${t.cur_hours.toFixed(1)}</td>
      <td class="n">${t.prop_hours.toFixed(1)}</td>
      <td class="n ${io(t.pct_hours)}">${ro(t.pct_hours)}</td></tr>`}function tu(e){return e.prt.length===0?'<p class="muted">PRT\u2019s table has no row for this group.</p>':e.prt.map(n=>{let o=n.related_routes?`<div class="muted">PRT points riders to: ${u(n.related_routes)}</div>`:"",r=n.route_page?`<div><a class="link" href="${u(n.route_page)}" target="_blank" rel="noopener">PRT\u2019s page for this route \u2197</a></div>`:"";return`<div class="rc-prt">
      <div><b>${u(n.current_route||It)}${xa}${u(n.final_route||It)}</b>
        <span class="rc-cat">${u(n.category)}</span></div>
      ${o}${r}</div>`}).join("")}function Ha(e){let t=e.status==="new"?"":`
    <p class="rc-riders">${Math.round(e.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">\xB7 WPRDC route ridership, average weekday</span></p>`;return`
    <button type="button" class="link rc-back" data-select-route="">\u2190 All routes</button>
    <div class="place-head">
      <h2>${u(Ye(e))}</h2>
      <span class="rc-status ${u(e.status)}">${u(uo[e.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today \u2192 plan</th>
        <th class="n" colspan="3">revenue hours today \u2192 plan</th></tr></thead>
      <tbody>${x.map(n=>eu(n,e.service[n])).join("")}</tbody>
    </table>
    ${t}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today\u2019s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT\u2019s own account, from its route crosswalk.</p>
    ${tu(e)}

    <p class="note">This is a route group, not a corridor. One group\u2019s loss
      can be another group\u2019s gain: Carrick\u2019s 51 reads as \u221210% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${Aa()}</p>`}function va(e,t){return`<div class="lg-row lg-static"><i style="background:${e};border-radius:2px"></i>
    <span class="lg-lab">${t}</span></div>`}function Ht(e,t,n,o){let r=o.includes(e),s=$a[La[e][0]];return`
    <button class="lg-row ${r?"off":""}" data-route-bucket="${e}"
            aria-pressed="${!r}">
      <i style="background:${s};border-radius:2px"></i>
      <span class="lg-lab">${t}</span>
      <span class="lg-n">${n}</span>
    </button>`}function Ba({groups:e,day:t,hidden:n,selected:o}){if(o)return`
      <div class="lg-head"><b>${u(Ye(o))}</b>
        <span class="muted">\xB7 ${u(uo[o.status])} \xB7 ${u(to[t])}</span></div>
      ${va(Se,"today's alignment")}
      ${va(Je,"proposed alignment")}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;if(!e)return'<div class="lg-head"><b>Route changes</b></div>';let r=Bc(e),s=r.split+r.merged,a=`${e.length.toLocaleString()} route groups \xB7 ${r.discontinued} discontinued \xB7 ${r.new} new \xB7 ${s} split or merged \xB7 ${to[t]}`;return`
    <div class="lg-head"><b>${u(a)}</b></div>
    ${Ht("discontinued","discontinued \u2014 today\u2019s alignment",r.discontinued,n)}
    ${Ht("new","new \u2014 proposed alignment",r.new,n)}
    ${Ht("reshaped","split or merged \u2014 proposed alignment",s,n)}
    ${Ht("one-to-one","one-to-one \u2014 proposed alignment",r["one-to-one"],n)}
    <div class="lg-foot">A route group is PRT\u2019s own mapping of today\u2019s
      numbers onto the plan\u2019s, not a corridor. Patterns are the ones that
      run on ${u(to[t])}. Click a row to show or hide its lines;
      click a line to select its group.</div>`}function Ia(e,{selected:t}){let n=u(e.name?`${e.route} ${e.name}`:e.route),o=u(Hc[e.side]),r=u(uo[e.status]);return t?`${n} \xB7 <b>${o}</b> \xB7 ${r}`:`<b>${n}</b> \xB7 ${o} \xB7 ${r}`}var vo=" \xB7 ",Ro={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places",routes:"Route changes"},Ua=Object.keys(Ro);function ja(e){return Ro[e]??e}var nu={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ou=["oneseat","journey"],ru=["dots","both"],su={current:"routes today",proposed:"routes proposed"};function au(e){return e!=="journey"&&e!=="routes"}function iu(e){let t=[Ro[e.view]??e.view];return e.view==="places"?t[0]:(ou.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":nu[e.day]),au(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&ru.includes(e.view)&&t.push(su[e.stopRoutes]),t.join(vo))}function Ga(e){let[t,...n]=iu(e).split(vo);return`<b>${u(t)}</b>${n.map(o=>vo+u(o)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes",route:"route",routeHidden:"routehide"},lu=/^[cp]:[\w.:-]{1,32}$/,Jt={any:"any",selected:"selected"},cu="pin",Ja=5,Wa="none",Ya=",";function za(e){try{return e.self!==e.top}catch{return!0}}function Va(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?Jt.selected:Jt.any),t.set(h.dest,"key"in e.dest?e.dest.key:Lo(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,Lo(e.at)),e.camera&&t.set(h.camera,`${Lo(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==Le&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),t.set(h.stopRoutes,e.stopRoutes??Dt),e.route&&t.set(h.route,e.route),e.routeHidden&&!uu(e.routeHidden,lo)&&t.set(h.routeHidden,e.routeHidden.length?e.routeHidden.join(Ya):Wa),`?${t}`}function qa(e){let t=new URLSearchParams(e),n={},o=t.get(h.view);o&&Ua.includes(o)&&(n.view=o);let r=t.get(h.day);r&&x.includes(r)&&(n.day=r);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(h.oneSeatDay);a===Jt.selected?n.oneSeatRestricted=!0:a===Jt.any&&(n.oneSeatRestricted=!1);let i=t.get(h.dest);if(i&&i!==cu){let k=Ka(i);k?n.dest=k:i.includes(",")||(n.dest={key:i})}let l=Ka(t.get(h.at));l&&(n.at=l);let m=du(t.get(h.camera));m&&(n.camera=m);let p=t.get(h.place);p&&(n.place=p);let y=t.get(h.selection);y!==null&&(n.selection=y.split(",").filter(k=>lu.test(k)));let R=t.get(h.placeFill);(R==="lost"||R==="gained"||R==="service")&&(n.placeFill=R);let w=t.get(h.stopRoutes);(w==="off"||w==="current"||w==="proposed")&&(n.stopRoutes=w);let $=t.get(h.route);$&&ka($)&&(n.route=$);let f=t.get(h.routeHidden);if(f===Wa)n.routeHidden=[];else if(f){let k=co(f.split(Ya).filter(Ut));k.length&&(n.routeHidden=k)}return n}function uu(e,t){return e.length===t.length&&e.every((n,o)=>n===t[o])}function Lo(e){return`${e.lat.toFixed(Ja)},${e.lon.toFixed(Ja)}`}function Ka(e){let t=Xa(e,2);return t?{lat:t[0],lon:t[1]}:null}function du(e){let t=Xa(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Xa(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var $o="embed";var pu=["1","true","yes"];function Za(e){let t=new URLSearchParams(e).get($o);return t!==null&&pu.includes(t.toLowerCase())}function Qa(e){let t=new URLSearchParams(e);return t.set($o,"1"),`?${t}`}function ei(e){let t=new URLSearchParams(e);t.delete($o);let n=String(t);return n?`?${n}`:""}function ti(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var ee=["peek","half","full"],mu=192,gu=.3,fu=.55,hu=.9,yu=.6,bu=.45;function Kt(e,t){return e==="peek"?Math.min(mu,t*gu):e==="half"?t*fu:t*hu}function Su(e,t,n=0){let o=ee.map(s=>Math.abs(Kt(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>yu&&(r=Math.max(0,Math.min(ee.length-1,r+(n>0?1:-1)))),ee[r]}function ni(e){return ee[(ee.indexOf(e)+1)%ee.length]}function wu(e,t){return Math.min(e,t*bu)}function xe(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function _o(e){let t=null,n=()=>{let o=xe();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var vu=8,Ru=400;function oi(e){let t=d("side"),n=d("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,l={y:0,t:0};function m(){return window.innerHeight}function p(f){t.style.height=`${f}px`,e.onMove(f,wu(f,m()))}function y(f){o=f,t.dataset.snap=f,p(Kt(f,m()))}n.addEventListener("pointerdown",f=>{xe()&&(r=!0,s=f.clientY,a=t.getBoundingClientRect().height,i=f.timeStamp,l={y:f.clientY,t:f.timeStamp},t.classList.add("dragging"),n.setPointerCapture(f.pointerId))}),n.addEventListener("pointermove",f=>{if(!r)return;let k=a+(s-f.clientY),V=Kt("peek",m()),O=Kt("full",m());p(Math.max(V,Math.min(O,k))),l={y:f.clientY,t:f.timeStamp}});function R(f){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(f.clientY-s)>vu)&&f.timeStamp-i<Ru){y(ni(o));return}let V=f.timeStamp-l.t,O=V>0?(l.y-f.clientY)/V:0;y(Su(t.getBoundingClientRect().height,m(),O))}n.addEventListener("pointerup",R),n.addEventListener("pointercancel",R),n.addEventListener("keydown",f=>{f.key!=="Enter"&&f.key!==" "||(f.preventDefault(),xe()&&y(ni(o)))});let w=_o(e.onLayoutChange);function $(){if(w(),!xe()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}y(o)}return window.addEventListener("resize",$),$(),{at:()=>xe()?o:"full",atLeast(f){xe()&&ee.indexOf(f)>ee.indexOf(o)&&y(f)}}}var Lu=["llvmpipe","swiftshader","softpipe","basic render","software"];function ko(e){if(!e)return!1;let t=e.toLowerCase();return Lu.some(n=>t.includes(n))}function si(e){let t=ko(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function ai(e){return ko(e.renderer)?0:$u}var $u=300,_u="https://tiles.openfreemap.org/styles/positron",ku=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],ri=[],xu=19,Eu='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Pu=!1;function ii(e){return!Pu||!ko(e.renderer)?_u:Du()}function Du(){let e=o=>({type:"raster",tileSize:256,attribution:Eu,tiles:o,maxzoom:xu}),t={basemap:e(ku)},n=[{id:"basemap",type:"raster",source:"basemap"}];return ri.length&&(t["basemap-labels"]=e(ri),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function li(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Ou(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function ci(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),r=null,s="",a=l=>{s!==l&&(s=l,e.getCanvas().style.cursor=l)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",l=>{let m=n.map(k=>k.layer).filter(k=>e.getLayer(k)&&e.getLayoutProperty(k,"visibility")!=="none");if(!m.length){i();return}let[p,...y]=e.queryRenderedFeatures(l.point,{layers:m});if(!p){i();return}a("pointer");let R=Ou(p);if(R===r)return;let w=o.get(p.layer?.id),$=w?w.html(p,y):null;if($==null){r=null,t.remove();return}r=R;let f=w.anchor?w.anchor(p,l):l.lngLat;t.setLngLat(f).setHTML($).addTo(e)}),e.on("mouseout",i),i}function Tu(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function Mu(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var Cu="seg-current",ui="dd",Au="open",di="armed";function Fu(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(di)}));return Tu(t)}function pi(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let l=a===n;i.group.classList.toggle(Au,l),i.trigger.setAttribute("aria-expanded",String(l))}},r=s=>o(Mu(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let l=s.id||`controls-${a}`,m=s.querySelector(".lbl")?.textContent??"",p=document.createElement("button");p.type="button",p.className=Cu,p.setAttribute("aria-haspopup","true"),p.setAttribute("aria-expanded","false");let y=document.createElement("div");y.className=ui,i.replaceWith(y),y.append(p,i);let R=()=>{let w=Fu(i);p.textContent=w.label,p.disabled=w.disabled,p.classList.toggle(di,w.armed),p.setAttribute("aria-label",m?`${m}: ${w.label}`:w.label)};R(),new MutationObserver(R).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),p.addEventListener("click",()=>{r({kind:"trigger",group:l}),n===l&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",w=>{if(!w.target.closest("button"))return;let $=n===l;r({kind:"pick"}),$&&p.focus()}),t.set(l,{group:s,trigger:p,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${ui}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var Nu=[-79.9959,40.4406],Hu=12,Bu="#e2574c",Wt=5,P={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},qe=qa(location.search),Ze=Za(location.search);Ze&&d("app").classList.add("embed");var Iu={at:()=>"full",atLeast(){}},yi=null,F=400,Ve=null,S=null,ne=null,de=0,_={key:"downtown"},ce=null,bi=!1,De=!1,en="locations",Oe="area",B=Dt,xo=0;function zt(){return B==="off"?"current":B}var Si="count",Zt=null,j=Le,pe=null,G=!1,g="dots",Oo,Mo=[],mi=()=>{},Eo=li(),c=new maplibregl.Map({container:"map",style:ii(Eo),pixelRatio:si(Eo),fadeDuration:ai(Eo),renderWorldCopies:!1,center:qe.camera?[qe.camera.lon,qe.camera.lat]:Nu,zoom:qe.camera?.zoom??Hu,cooperativeGestures:za(window),attributionControl:{compact:!0}});c.addControl(new maplibregl.NavigationControl,"top-right");c.on("load",()=>{Go(c),Jr(c),es(c,Ue),as(c,Ue),ms(c,"walk-fill"),As(c),Vs(c,kt),ua(c,Ue),Da(c,Ue),D(),c.on("click",t=>{if(G)return;if(bi){Xe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=c.queryRenderedFeatures(t.point,{layers:[ie]})[0];s&&Vt(s.properties.key);return}if(g==="routes"){let{x:s,y:a}=t.point,i=[[s-Wt,a-Wt],[s+Wt,a+Wt]],l=c.queryRenderedFeatures(i,{layers:go})[0];l?(Oo.atLeast("half"),To(l.properties.key)):gi();return}let n=[...dt,"oneseat-dots"].filter(s=>c.getLayoutProperty(s,"visibility")!=="none"),o=c.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];No(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});mi=ci(c,e,[...Jo(t=>{let n=pt(),o=t.find(r=>dt.includes(r.layer?.id));return n&&o?En(o.properties,v(),n.buckets,{pole:!1}):null}),...dt.map(t=>({layer:t,html:n=>{let o=pt();return o?En(n.properties,v(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=be();return n?bs(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:"stoproutes-lines",html:t=>Xs(t.properties)},...go.map(t=>({layer:t,html:n=>Ia(n.properties,{selected:le()!==null})})),{layer:ie,html:t=>ba(t.properties,j,v())}]),od(),c.on("moveend",()=>{let t=c.getCenter();yi={lat:t.lat,lon:t.lng,zoom:c.getZoom()},b(),T()}),ue(P.radius,t=>{F=Number(t.dataset.radius),_n(c,F,v()).then(b),ft()&&Tn(c,F,v()).then(b),ht()&&An(F).then(b),be()&&qt(),S&&Ee(S.lat,S.lon)}),ue(P.day,t=>{let n=t.dataset.day;pr(n),g!=="journey"&&D(),kn(c,n),Qt(),Mn(c,n),g==="journey"&&S&&Co(S.lat,S.lon),St()&&is(c,n).then(b),De&&be()&&(qt(),S&&Ee(S.lat,S.lon)),We()&&j==="service"&&Ft(c,j,n),ze()&&Xu(),b()}),ue(P.oneSeatDay,t=>{De=t.dataset.oneseatDay==="selected",Do(),qt(),S&&Ee(S.lat,S.lon)}),ue(P.view,t=>{let n=g;g=t.dataset.view,mi(),Pr(c,g==="dots"||g==="both"),Wu(g==="surface"||g==="both"),zu(g==="corridors"),ed(g==="oneseat"),Qu(g==="journey",n==="journey"),Vu(g==="places"),qu(g==="routes"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&D({scrollToTop:!0}),Zu(un(g)),Li();let o=g==="oneseat"||g==="journey";d("dest-controls").classList.toggle("hidden",!o),d("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),d("place-fill-controls").classList.toggle("hidden",g!=="places"),_i(),z()||fi(!1),Pe(),Do(),o||Xt(!1),vi()}),ue(P.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Xt(!0);return}Xt(!1),Xe({key:n})}),ue(P.placeFill,t=>{j=t.dataset.placeFill,We()&&Ft(c,j,v()),D(),b(),Do()}),ue(P.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=B!=="off"&&Ot()!==null;B=n,D(),o&&n!=="off"?(ve(c,Ot(),n),N&&Fo(N.radius)):Qt()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){en=n.dataset.weight,b(),T();return}let o=t.target.closest("[data-surface-unit]");if(o){Oe=o.dataset.surfaceUnit,Yu(Oe),T();return}let r=t.target.closest("[data-route-bucket]");if(r&&Ut(r.dataset.routeBucket)){Ma(c,r.dataset.routeBucket),b(),T();return}let s=t.target.closest("[data-bucket]");s&&(Kr(c,s.dataset.bucket,v()),b())}),d("legend-reset").addEventListener("click",()=>{if(ze()){So(c,[]),b(),T();return}Wr(c,v()),b()}),d("legend-select").addEventListener("click",()=>fi(!G)),d("legend-clear").addEventListener("click",()=>{Ln(c),Pe(),b(),T()}),d("legend-collapse").addEventListener("click",()=>{Po(!d("legend-box").classList.contains("collapsed"))}),d("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Xe({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&ad(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&Vt(r.dataset.selectPlace);let s=t.target.closest("[data-select-route]");if(s){let l=s.dataset.selectRoute;l?To(l):gi()}let a=t.target.closest("[data-sort-places]");a&&(Si=a.dataset.sortPlaces,D());let i=t.target.closest("[data-goto-place]");i&&(g!=="places"&&te(P.view,"places"),Vt(i.dataset.gotoPlace))}),d("side-toggle").addEventListener("click",Ju),Ze&&_o(Po),Oo=Ze?Iu:oi({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),c.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Po}),ju(),pi(),nn(),Pe(),tn(),Uu(qe),_n(c,F,v()).then(b),sd(),rd()});function ue(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),nn(),T()})})}function te(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Uu(e){e.radius!==void 0&&te(P.radius,String(e.radius)),e.day&&te(P.day,e.day),e.oneSeatRestricted!==void 0&&te(P.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(en=e.weight),e.surfaceUnit&&(Oe=e.surfaceUnit),e.placeFill&&te(P.placeFill,e.placeFill),e.routeHidden&&So(c,e.routeHidden),e.dest&&("key"in e.dest?te(P.dest,e.dest.key):Xe(e.dest)),e.selection&&Fr(c,e.selection),e.stopRoutes&&te(P.stopRoutes,e.stopRoutes),e.view&&te(P.view,e.view),e.at&&No(e.at.lat,e.at.lon),e.place&&Vt(e.place),e.route&&To(e.route,{fly:!e.camera})}function T(){let e={view:g,day:v(),radius:F,oneSeatRestricted:De,weight:en,surfaceUnit:Oe,dest:_,at:S,camera:yi,place:Zt,placeFill:j,selection:Mr(),stopRoutes:B,route:pe,routeHidden:Gt()},t=Va(e);history.replaceState(null,"",(Ze?Qa(t):t)+location.hash),tn(t)}function tn(e=ei(location.search)){if(!Ze)return;let t=d("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g==="routes"?le()?Ye(le()):null:S?ne?He(ne):"this point":null;t.querySelector(".el-action").textContent=ti(n)}function nn(){d("statebar").innerHTML=Ga({view:g,day:v(),radius:F,oneSeatRestricted:De,destination:Qe(),stopRoutes:B}),Gu()}function Po(e){d("legend-box").classList.toggle("collapsed",e);let t=d("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function ju(){let e=t=>{d("app").classList.toggle("controls-open",t),d("controls-toggle").setAttribute("aria-expanded",String(t))};d("controls-toggle").addEventListener("click",()=>{e(!d("app").classList.contains("controls-open"))}),d("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Gu(){d("controls-toggle").firstChild?.remove(),d("controls-toggle").prepend(document.createTextNode(ja(g)))}function Ju(){let e=d("app").classList.toggle("side-collapsed"),t=d("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),c.resize()}function b(){Ku()}function Ku(){if(d("legend-reset").classList.toggle("hidden",Nn()||Un()||Wn()||We()||!(z()||ze())),Wn()){d("legend").innerHTML=Is(xt());return}if(ze()){d("legend").innerHTML=Ba({groups:fo(),day:v(),hidden:Gt(),selected:le()});return}if(We()){d("legend").innerHTML=ya({selected:aa(),fill:j,day:v(),boundaries:eo(),unchanged:ia()});return}if(Nn()){let n=St();n&&Rs(d("legend"),n);return}if(Un()){let n=be();if(!n)return;let o=c.getBounds();Ls(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=pt();if(!e)return;let t=c.getBounds();_s(d("legend"),{layer:e,day:v(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:en,dots:z(),surface:On()?ft():null,unit:Oe,population:ht(),selection:Tr()})}async function Wu(e){if(e&&!ft()){d("legend").classList.add("loading");try{await Tn(c,F,v())}finally{d("legend").classList.remove("loading")}}ts(c,e),e&&Oe==="people"&&await wi(),b()}async function wi(){if(!ht()){d("legend").classList.add("loading");try{await An(F)}finally{d("legend").classList.remove("loading")}}}async function Yu(e){e==="people"&&On()&&await wi(),b()}async function zu(e){if(e&&!St()){d("legend").classList.add("loading");try{await Hn(c,v())}finally{d("legend").classList.remove("loading")}}ls(c,e),b()}async function Vu(e){if(e&&(!Qn()||!eo())){d("legend").classList.add("loading");try{await Promise.all([da(),pa(c)])}finally{d("legend").classList.remove("loading")}}ga(c,e),e&&Ft(c,j,v()),e&&D(),b()}async function Vt(e){Zt=await Te(()=>ma(c,e))?e:null,g==="places"&&(D(),Zt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),T()}async function qu(e){e&&await Te(()=>ho(c,v())),Ca(c,e),e&&D({scrollToTop:!0}),b()}async function To(e,{fly:t=!0}={}){pe=await Te(()=>yo(c,e,v(),{fly:t}))?e:null,g==="routes"&&D({scrollToTop:!0}),b(),T()}function gi(){!pe&&!le()||(bo(c),pe=null,g==="routes"&&D({scrollToTop:!0}),b(),T())}async function Xu(){await Te(async()=>{await ho(c,v()),pe&&await yo(c,pe,v(),{fly:!1})}),g==="routes"&&D(),b()}function Zu(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function D({scrollToTop:e=!1}={}){if(e&&(d("panel").scrollTop=0),tn(),g==="places"){d("panel").innerHTML=fa(Qn()??[],Si,Zt,j);return}if(g==="routes"){let t=le();d("panel").innerHTML=t?Ha(t):Na(fo()??[],pe);return}if(!ne){g==="oneseat"?d("panel").innerHTML=_r(Qe()):mr(d("panel"));return}if(g==="oneseat"){let t=$r(ne,_,v());if(t){d("panel").innerHTML=t;return}}Lr(ne,{withKerb:z(),routes:B})}function Qu(e,t=!1){if(Fs(c,e),b(),!e){t&&(S?Ee(S.lat,S.lon):D());return}xt()&&S?d("panel").innerHTML=zn(xt(),Qe()):d("panel").innerHTML=Bs(Qe())}async function Co(e,t){let n=++de;S={lat:e,lon:t},T(),$i(e,t);let o=Ri(),r=u(Qe());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await E(Ns({lat:e,lon:t},o,v()));if(n!==de)return;Yn(c,s),d("panel").innerHTML=zn(s,r),b(),tn()}catch(s){if(n!==de)return;Yn(c,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Do(){d("day-controls").classList.toggle("hidden",!hs(g,De,j))}function Ao(){return fs(De,v())}async function ed(e){e&&!be()&&await Te(()=>jn(c,F,_,Ao())),ys(c,e),b()}async function qt(){await Te(()=>jn(c,F,_,Ao())),b()}async function Te(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function Xe(e){if(_=e,Xt(!1),td(),vi(),nn(),T(),g==="journey"){S&&Co(S.lat,S.lon),b();return}S?Ee(S.lat,S.lon):D({scrollToTop:!0}),qt()}function vi(){let e=Ri();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in _))){ce?.remove(),ce=null;return}ce?ce.setLngLat([e.lon,e.lat]).addTo(c):(ce=new maplibregl.Marker({color:In,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(c),ce.on("dragend",()=>{let n=ce.getLngLat();Xe({lat:n.lat,lon:n.lng})}))}function td(){let e=gs(_);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Ri(){if("lat"in _)return{lat:_.lat,lon:_.lon};let e=_.key,t=Mo.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Qe(){if("lat"in _)return`${_.lat.toFixed(4)}, ${_.lon.toFixed(4)}`;let e=_.key;return Mo.find(t=>t.key===e)?.name??e}function Xt(e){bi=e,c.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Ee(e,t){let n=++de;S={lat:e,lon:t},T(),d("panel").classList.add("loading"),$i(e,t),dn(c),ve(c,null,zt()),d("pin-key").classList.add("hidden");try{let o="lat"in _?`&dest_lat=${_.lat.toFixed(6)}&dest_lon=${_.lon.toFixed(6)}`:"",r=await E(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${F}${o}&oneseat_day=${Ao()}`);if(n!==de)return;N={lat:e,lon:t,radius:F,now:r.current.stops,proposed:r.proposed.stops},ne=r,_i(),Li(),D({scrollToTop:!0})}catch(o){if(n!==de)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===de&&d("panel").classList.remove("loading")}}var N=null;function Li(){if(!N||!un(g)){dn(c),d("pin-key").classList.add("hidden"),Qt();return}Ko(c,N.lat,N.lon,N.radius,N.now,N.proposed),Fo(N.radius),Qt()}function Qt(){let e=++xo,t=()=>{N&&Fo(N.radius)};B!=="off"&&z()&&S&&ne?.kerb?E(qs(S,v())).then(n=>{e===xo&&(ve(c,n,zt()),Tt(c,!0),Qs(c),t())}).catch(()=>{e===xo&&(ve(c,null,zt()),Tt(c,!1),t())}):(ve(c,null,zt()),Tt(c,!1),t())}function Fo(e){let t=B!=="off"&&Ys()&&zs(Ot(),B)?B:!1;d("pin-key").innerHTML=$s(e,{routes:t}),d("pin-key").classList.remove("hidden")}function $i(e,t){Ve?Ve.setLngLat([t,e]):(Ve=new maplibregl.Marker({color:Bu,draggable:!0}).setLngLat([t,e]).addTo(c),Ve.on("dragend",()=>{let n=Ve.getLngLat();No(n.lat,n.lng)}))}var Yt=14;function z(){return g==="dots"||g==="both"}function fi(e){G=e&&z(),G?c.dragPan.disable():c.dragPan.enable(),c.getCanvas().style.cursor=G?"none":"",G||ki(),Pe()}function _i(){let e=z()&&!!ne?.kerb;d("stop-routes-controls").classList.toggle("hidden",!e)}function Pe(){let e=d("legend-select");e.classList.toggle("hidden",!z()),e.setAttribute("aria-pressed",String(G)),e.textContent=G?"Selecting":"Select stops",d("legend-clear").classList.toggle("hidden",!z()||!Cr())}function nd(e,t){let n=d("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!G}function hi(e){d("brush").classList.toggle("painting",e)}function ki(){d("brush").hidden=!0}function od(){let e=d("brush");e.style.width=`${Yt*2}px`,e.style.height=`${Yt*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Pe(),b()}))},s=()=>{G&&(t=!0,n=!1,hi(!0))},a=l=>{if(nd(l.point.x,l.point.y),!t)return;n=!0,Rn(c,$n(c,l.point.x,l.point.y,Yt))&&r()},i=l=>{if(hi(!1),!!t){if(t=!1,!n){let[m]=$n(c,l.point.x,l.point.y,Yt);m&&Ar(c,m)}Pe(),b(),T()}};c.on("mousedown",s),c.on("mousemove",a),c.on("mouseup",i),c.getCanvas().addEventListener("mouseleave",ki),c.on("touchstart",s),c.on("touchmove",a),c.on("touchend",i)}function No(e,t){if(Oo.atLeast("half"),g==="journey"){Co(e,t);return}g!=="places"&&g!=="routes"&&Ee(e,t)}async function rd(){try{Mo=await E("/api/destinations"),nn()}catch{}}async function sd(){try{let e=await E("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;d("feedline").textContent=t,d("feedline-methods").textContent=t,d("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function ad(e){d("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
