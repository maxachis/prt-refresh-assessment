"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function O(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var an=new Map;function J(e){let t=an.get(e);if(t)return t;let n=O(e).catch(o=>{throw an.delete(e),o});return an.set(e,n),n}function u(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function me(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function ln(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function cn(e){return e>0?`+${e}`:String(e)}function No(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var $i="#15181e",Ho="#ffa23a",_i="#ffffff";function xi(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;r.push([t+a*Math.cos(l),e+s*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function W(e){return{type:"FeatureCollection",features:e}}function ki(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Oi(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function un(e){return e!=="corridors"&&e!=="journey"&&e!=="places"&&e!=="routes"}function dn(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(W([]))}function Io(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Bo(e){e.addSource("walk",{type:"geojson",data:W([])}),e.addSource("stops-now",{type:"geojson",data:W([])}),e.addSource("stops-prop",{type:"geojson",data:W([])}),e.addSource("stop-moves",{type:"geojson",data:W([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Ho,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":_i,"circle-stroke-width":3,"circle-stroke-color":Ho}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":$i,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function Uo(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Oi(n.properties,e(o))}))}function jo(e,t,n,o,r,s){e.getSource("walk").setData(W([xi(t,n,o)])),e.getSource("stops-now").setData(W(Io(r,"current"))),e.getSource("stops-prop").setData(W(Io(s,"proposed"))),e.getSource("stop-moves").setData(W(ki(s)))}var k=["weekday","saturday","sunday"],pn=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Go={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ot=4,rt=6,Jo=e=>rt+ot*e,Wo=e=>rt+1+ot*e,Ce=e=>rt+2+ot*e,Ei=e=>rt+3+ot*e,st=2,Ti=3,Ae=4,Ko=5,ge=e=>e[Ti],D=(e,t)=>e[t],Yo=(e,t)=>e[Ei(t)],mn=e=>2+2*e,gn=e=>3+2*e,at=4,zo=e=>2+at*e,Vo=e=>3+at*e,qo=e=>4+at*e,Xo=e=>5+at*e;var Pi=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],Di=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],Zo=1e-6,Mi=32;function tr(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=Pi.map(([i,l])=>(e+i*r+l*s)**3);return Di.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function Qo(e,t,n){return tr(e,t,n).every(o=>o>=-Zo&&o<=1+Zo)}function Ci(e,t,n){if(Qo(e,t,n))return t;let o=0,r=t;for(let s=0;s<Mi;s++){let a=(o+r)/2;Qo(e,a,n)?o=a:r=a}return o}function Ai(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function Fi(e,t,n){let[o,r,s]=tr(e,Ci(e,t,n),n);return`#${[o,r,s].map(a=>Ai(a).toString(16).padStart(2,"0")).join("")}`}var er=/(\d+)/;function Ni(e,t){let n=e.split(er),o=t.split(er);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function Fe(e){let t=[...new Set(e)].sort(Ni);return new Map(t.map((n,o)=>[n,Fi(.55,.16,o*360/t.length)]))}var nr="at this stop",or=e=>`within ${e} m`,Hi="both directions",Ii="one or both directions",hn="weekday";function w(){return hn}function cr(e){hn=e}function ur(e){e.innerHTML=`
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
    </div>`}function dr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Bi(e,t){let n=Math.max(1,...pn.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return pn.map(o=>{let r=e.periods[o]??0,s=t.periods[o]??0,a=s-r,i=a>0?"up":a<0?"down":"flat";return`
      <tr>
        <th>${Go[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${a===0?"\xB7":cn(a)}</td>
      </tr>`}).join("")}function pr(e){return e.length?e.map(t=>`<span class="route">${u(t)}</span>`).join(" "):'<span class="muted">none</span>'}function rr(e){return e.first==null?'<span class="muted">no service</span>':`${me(e.first)}\u2013${me(e.last)}`}function sr(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Ui={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},ji={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Gi(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':it(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${u(o.name)}</span>
          <span class="os-status ${u(o.status)}">${Ui[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${ji[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${re("one-seat")}</p>
    </div>`:""}function re(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ne(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function ar(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function ir(e){return e.first==null||e.last==null?null:e.last-e.first}function it(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${lr(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${lr(t,o,"prop",r("proposed"))}</div>
    </div>`}function lr(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${u(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var fn=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Ji="Allegheny";function Ie(e){let t=e.place?.muni?.trim()??"",n=fn.exec(t)?.[1],o=n===Ji?t.replace(fn,""):n?`${t.replace(fn,"")} (${n})`:t;return e.place?.hood||o||"this location"}function He(e){return e==="weekday"?"weekday":e}function mr(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${He(t)}`}function Wi(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Ki(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function Yi(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${re("one-direction")}</dt>
      ${Ne(r(n,e.routes),r(o,t.routes))}`}function gr(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${He(t)}, today only</span>`;return`<dt>Boardings ${u(n)}</dt><dd>${s}${r}</dd>`}function fr(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${re("boardings")}</p>`}function zi(e){if(!e)return"";let t=u(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${re("place-population")}</p>
    </div>`}function hr(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
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
        <div class="muted">${No(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${He(n)} ${u(o)}${r?`, ${u(r)}`:""}</div>`}function yr(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Bi(e,t)}</tbody>
    </table>`}function br(e,t){let n=sr(e),o=sr(t),r=ir(e),s=ir(t);return`
      <dt>First and last</dt>
      ${Ne(rr(e),rr(t))}
      <dt>Hours between</dt>
      ${Ne(ln(r),ln(s),ar(r,s,"more"))}
      <dt>Typical wait</dt>
      ${Ne(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,ar(n,o,"less"))}`}function Sr(e,t,n,o){return`
    <div class="routes">
      <h3>${u(n)}</h3>
      ${it(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${re("location-not-route")}</p>
    </div>`}function Vi(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${He(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${He(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${re("stop-routes")}</p>`}function qi(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:Fe((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${u(i)}
        <span class="muted">\xB7 PRT stop ${u(e.stop_id)}</span></div>
      ${hr(o,r,t,nr)}
      <div class="tiers">${dr(o.hourly,r.hourly)}</div>
      ${yr(o,r)}
      <dl class="facts">
        ${br(o,r)}
        ${gr(o.boardings,t,nr)}
      </dl>
      ${fr(o.boardings)}
      ${Sr(o,r,"Routes calling at this stop",a)}
      ${Vi(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${re("kerb")}</p>
    </section>`}function yn(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],s=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${hr(o,r,t,or(e.radius),{directions:s?Ii:Hi})}

    <div class="tiers">${dr(o.hourly,r.hourly)}</div>

    ${yr(o,r)}
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
      ${br(o,r)}
      ${Yi(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Ne(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Ki(e.current.stops)}
      ${Wi(e.proposed.stops)}
      ${gr(o.boardings,t,or(e.radius))}
    </dl>
    ${fr(o.boardings)}

    ${n}

    ${zi(e.population)}

    ${Sr(o,r,"Routes serving this spot")}`}function Xi(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,s=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${u(Ie(e))}</h2>
      <div class="muted">${s}</div>
    </div>
    ${r?qi(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${yn(e,t,Gi(e.oneseat??[],e.oneseat_day??"any"))}`}function vr(e,t={}){document.getElementById("panel").innerHTML=Xi(e,hn,t)}var Zi={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Qi={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},el={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function tl(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function bn(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${pr(t)}</div>`:""}function nl(e){let t=bn("kept",e.kept)+bn("lost",e.lost)+bn("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ol(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${it(e.current,e.proposed)}
    </div>`}function rl(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${u(r.key)}">
      <span class="os-name">${u(r.name)}</span>
      <span class="os-status ${u(r.status)}">${sl[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var sl={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function al(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${el[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function wr(e,t,n){let o=tl(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":nl(o)+ol(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${u(o.name)}</h2>
      <div class="muted">
        from ${u(Ie(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${u(o.status)}">${Zi[o.status]}</div>
    <p class="note">${Qi[o.status]} ${al(r)}</p>

    ${s}

    ${rl(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${mr(e,n)}</summary>
      ${yn(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Rr(e){return`
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
    </div>`}var ct={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},fe="change",Z="change-dots",se=["boolean",["feature-state","selected"],!1],Lr="#15181e",ae=["==",["get","published"],0],dt="newplace",il="#15181e",ll=5,ut=["==",["get","removed"],1],pt="removedstop",Ue="change-removed",wn="change-removed-selected",Sn="removed-cross",_r="#e8232f";function cl(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,_r]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var lt=null,X=new Set,B=new Set,ul=[Z,wn,Ue],mt=[Z,Ue],je=Z;function xr(e,t){for(let n of ul)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function gt(){return lt}function Ge(e){return X.has(e)}function kr(e,t,n,o){return r=>ml(r,e,t,n,o)}function Or(e){return t=>e.has(ge(t))}function Er(){return B}function Tr(){return[...B].sort()}function Pr(){return B.size}function Rn(e,t){let n=0;for(let o of t)B.has(o)||(B.add(o),Be(e,o,!0),n++);return n}function Dr(e,t){B.delete(t)?Be(e,t,!1):(B.add(t),Be(e,t,!0))}function Mr(e,t){Ln(e),Rn(e,t)}function Ln(e){for(let t of B)Be(e,t,!1);B.clear()}function Be(e,t,n){try{e.setFeatureState({source:fe,id:t},{selected:n})}catch{}}function dl(e){for(let t of B)Be(e,t,!0)}function pl(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function $n(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[Z,Ue].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[l,m]=i.geometry.coordinates,p=e.project([l,m]);return{id:i.id,x:p.x,y:p.y}});return pl(t,n,o,a)}function Cr(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||D(s,st)===0||D(s,Ae)===1)continue;let a=n[D(s,Ce(t))];a!==void 0&&r[a]++}return r}function Ar(e,t){let n=0;for(let o of e)t(o)&&D(o,st)===0&&n++;return n}function Fr(e,t){let n=0;for(let o of e)t(o)&&D(o,Ae)===1&&n++;return n}function ml(e,t,n,o,r){let s=D(e,0),a=D(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function Nr(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||D(s,st)===0)continue;let a=n[D(s,Ce(t))];if(a===void 0)continue;let i=Yo(s,t),l=D(s,Ae)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(l){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function gl(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>k.some((o,r)=>t[D(n,Ce(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ge(n),published:n[2],removed:n[Ae],name:n[Ko],moved:e.moved?.[ge(n)]??null,replacement:e.replacement?.[ge(n)]?.[0]??null,nearestStraight:e.replacement?.[ge(n)]?.[1]??null,...Object.fromEntries(k.flatMap((o,r)=>[[`b${r}`,t[D(n,Ce(r))]],[`sc${r}`,n[Jo(r)]],[`sp${r}`,n[Wo(r)]]]))}}))}}function Hr(e,t){let n=Object.entries(ct).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,ct.none[t]]}function Ir(e){return["case",ae,"rgba(0,0,0,0)",Hr(e,"color")]}function vn(e){return["case",ae,ll,Hr(e,"size")]}function Br(e){return["interpolate",["linear"],["zoom"],9,["*",vn(e),.45],12,vn(e),16,["*",vn(e),1.9]]}function Ur(e){e.addSource(fe,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Z,type:"circle",source:fe,paint:{"circle-color":Ir(0),"circle-radius":Br(0),"circle-opacity":.85,"circle-stroke-color":["case",se,Lr,ae,il,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",se,1.6,ae,.9,.5],12,["case",se,2.4,ae,1.5,1],16,["case",se,3.2,ae,2.2,1.6]]}},"walk-fill"),e.addLayer({id:wn,type:"circle",source:fe,filter:ut,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":Lr,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",se,1.6,0],12,["case",se,2.4,0],16,["case",se,3.2,0]]}},"walk-fill"),e.hasImage(Sn)||e.addImage(Sn,cl(),{pixelRatio:2}),e.addLayer({id:Ue,type:"symbol",source:fe,filter:ut,layout:{"icon-image":Sn,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function _n(e,t,n){return lt=await J(`/api/change?radius=${t}`),e.getSource(fe).setData(gl(lt)),dl(e),xn(e,n),lt}function xn(e,t){let n=k.indexOf(t);e.setPaintProperty(Z,"circle-color",Ir(n)),e.setPaintProperty(Z,"circle-radius",Br(n)),kn(e,t)}function jr(e,t,n){X.has(t)?X.delete(t):X.add(t),kn(e,n)}function Gr(e,t){X.clear(),kn(e,t)}function kn(e,t){let n=k.indexOf(t),o=["none",...X],r=["case",ae,!X.has(dt),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(Z,["all",["!",ut],r]);let s=["all",ut,!X.has(pt)];e.setFilter(Ue,s),e.setFilter(wn,s)}function fl(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function On(e,t,n,{pole:o=!0}={}){let r=k.indexOf(t),s=e[`b${r}`],a=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(R=>R.key===s)?.label??s,l=e[`sc${r}`],m=e[`sp${r}`],p=t==="weekday"?"weekday":t,y=a?`Currently ${l}`:`${l} \u2192 ${m}`;return`${o?fl(e):""}${yl(e)}${y} buses per ${p} at this stop<br>${a?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var hl=1.5,$r=800;function yl(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??$r,r=n!=null&&o>n*hl?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${$r} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${_r}">Stop removed</b> \u2014 ${s}<br>`}var En="surface",ht="surface-fill",Jr="#6b7280",Tn=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Jr],[.138,Jr],[1,"#bd60e7"],[2,"#961bed"]],M="#e8232f",C="#0f79c9",Wr=2,ft=null,Kr=!1;function yt(){return ft}function Pn(){return Kr}function Yr(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Wr,Math.min(Wr,n))}function zr(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Vr(e,t,n,o,r,s,a,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let m of e){let p=a.lat0+(m[1]+.5)*a.dlat,y=a.lon0+(m[0]+.5)*a.dlon;if(p<o||p>s||y<n||y>r)continue;let R=m[mn(t)],v=m[gn(t)],$=zr(R,v);if($!=="none")if($==="ramp"){let f=Yr(R,v);l[f<-.138?"less":f>.138?"more":"same"]+=i}else l[$]+=i}return l}function bl(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,l=n+s[0]*r,m=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,a],[m,a],[m,i],[l,i],[l,a]]]},properties:Object.fromEntries(k.flatMap((p,y)=>{let R=s[mn(y)],v=s[gn(y)];return[[`k${y}`,zr(R,v)],[`v${y}`,Yr(R,v)??0]]}))}})}}function qr(e){return["case",["==",["get",`k${e}`],"gone"],M,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Tn.flatMap(([t,n])=>[t,n])]]}function he(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Xr(e,t){e.addSource(En,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ht,type:"fill",source:En,layout:{visibility:"none"},paint:{"fill-color":qr(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,he(0,.85),13,he(0,.62),16,he(0,.45)]}},t)}async function Dn(e,t,n){return ft=await J(`/api/surface?radius=${t}`),e.getSource(En).setData(bl(ft)),Mn(e,n),ft}function Mn(e,t){let n=k.indexOf(t);e.setPaintProperty(ht,"fill-color",qr(n)),e.setPaintProperty(ht,"fill-opacity",["interpolate",["linear"],["zoom"],9,he(n,.85),13,he(n,.62),16,he(n,.45)])}function Zr(e,t){Kr=t,e.setLayoutProperty(ht,"visibility",t?"visible":"none")}var Cn=null;function bt(){return Cn}async function An(e){return Cn=await J(`/api/population?radius=${e}`),Cn}function Qr(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let m=a.lat0+(l[1]+.5)*a.dlat,p=a.lon0+(l[0]+.5)*a.dlon;m<o||m>s||p<n||p>r||(i.lost+=l[zo(t)],i.gained+=l[Vo(t)],i.kept+=l[qo(t)],i.none+=l[Xo(t)])}return i}var Fn="corridor",es="corridor-lines",ye="#8b929c",Sl="#6f7783",vt={lost:M,added:C,kept:ye};var St=null,ts=!1;function wt(){return St}function Nn(){return ts}function vl(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function ns(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function wl(){let e=t=>["match",["get","klass"],"lost",vt.lost,"added",vt.added,t];return["interpolate",["linear"],["zoom"],9,e(Sl),14,e(ye)]}function Rl(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Ll(){return["match",["get","klass"],"kept",.85,.9]}function os(e,t){e.addSource(Fn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:es,type:"line",source:Fn,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":wl(),"line-width":Rl(),"line-opacity":Ll()}},t)}async function Hn(e,t){return St=await O(`/api/corridors?day=${t}`),e.getSource(Fn).setData(vl(St)),St}async function rs(e,t){k.includes(t)&&await Hn(e,t)}function ss(e,t){ts=t,e.setLayoutProperty(es,"visibility",t?"visible":"none")}var Bn="#2b3038",as="#b9bec6",Je={loses:{color:M,size:6},gains:{color:C,size:6},keeps:{color:ye,size:3},here:{color:Bn,size:3.5},none:{color:as,size:1.8}},Lt=["loses","gains","keeps","none","here"],In="oneseat",is="oneseat-dots",Rt=null,ls=!1;function be(){return Rt}function Un(){return ls}function cs(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;for(let i of e){let l=i[0],m=i[1];if(l<o||l>s||m<n||m>r)continue;let p=t[i[3]];p!==void 0&&a[p]++}return a}function $l(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function _l(){return["match",["get","status"],...Object.entries(Je).flatMap(([e,t])=>[e,t.color]),as]}function xl(){let e=["match",["get","status"],...Object.entries(Je).flatMap(([t,n])=>[t,n.size]),Je.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function us(e,t){e.addSource(In,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:is,type:"circle",source:In,layout:{visibility:"none"},paint:{"circle-color":_l(),"circle-radius":xl(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function kl(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Ol="pin";function ds(e){return"key"in e?e.key:Ol}var $t="any";function El(e,t,n){return`radius=${e}&${kl(t)}&day=${n}`}function ps(e,t){return e?t:$t}function ms(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function jn(e,t,n,o=$t){return Rt=await O(`/api/oneseat?${El(t,n,o)}`),e.getSource(In).setData($l(Rt)),Rt}function gs(e,t){ls=t,e.setLayoutProperty(is,"visibility",t?"visible":"none")}function Gn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function fs(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),r=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",a=Gn(t);return e.status==="here"?`<b>at ${a}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${a}<br>today: ${s(o)}<br>proposed: ${s(r)}`}var _t={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Jn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Tl=new Set(["gone","new"]);function Pl(e,t,n){return Tl.has(e)?`${t} (${Jn[n]})`:t}function Dl(e){return e.buckets.filter(t=>t.key!=="none")}var hs={area:"Ground",people:"People"};function Ml(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=Vr(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Cl(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=Qr(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Al=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function ys(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1}=e,l=Tn.map(([m,p])=>`${p} ${((m+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${l})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${M}"></i>loses all service
          (${Jn[n]})</span>
        <span><i style="background:${C}"></i>new service
          (${Jn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(hs).map(m=>`
          <button data-surface-unit="${m}" aria-pressed="${r===m}"
                  class="${r===m?"active":""}">${hs[m]}</button>`).join("")}
      </div>
      ${a?Al:r==="people"?Cl(n,o,s):Ml(t,n,o)}
    </div>`}var Fl=["lost","added","kept"],Nl={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Hl={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Ss(e,t){let{lostPct:n,addedPct:o}=ns(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${Hl[t.day]}
    </div>
    ${Fl.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${vt[i]}"></i>
        <span class="lg-lab">${u(Nl[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function vs(e,t,n){let o=t.statuses.map(p=>p.key),r=cs(t.points,o,n.west,n.south,n.east,n.north),s=p=>t.statuses.find(y=>y.key===p)?.label??p,a=Lt.reduce((p,y)=>p+(r[y]??0),0),i=Gn(t),l=t.day&&t.day!==$t,m=l?`Restricted to routes running on ${_t[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${u(i)}</b>
      <span class="muted">\xB7 ${a.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${l?` \xB7 ${_t[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Lt.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${Je[p].color}"></i>
        <span class="lg-lab">${u(s(p))}</span>
        <span class="lg-n">${(r[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Lt.map(p=>`${(t.counts[p]??0).toLocaleString()} ${u(s(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${u(i)} without transferring?
      ${m} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function ws(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var bs={locations:"Stops",riders:"Riders"};function Il(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Bl(e){if(!e)return"";let t=Ge(dt);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${dt}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Ul(e,t){if(!e)return"";let n=Ge(pt);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${pt}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function jl(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Bl(e)}
      ${Ul(t,n)}
    </div>`}function Rs(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:l,selection:m,dots:p=!0}=t,y=n.buckets.map(L=>L.key),R=n.days.indexOf(o),{west:v,south:$,east:f,north:T}=r,q=Dl(n),P=m&&m.size>0?m:null,nt=P?Or(P):kr(v,$,f,T),Ao=Cr(n.points,R,y,nt),on=Ar(n.points,nt),rn=Fr(n.points,nt),H=s==="riders"?Nr(n.points,R,y,nt):null,bi=L=>H?H.measured[L]?Math.round(H.riders[L]).toLocaleString():"\u2014":Ao[L].toLocaleString(),Si=H?H.removedMeasured?Math.round(H.removedRiders).toLocaleString():"\u2014":rn.toLocaleString(),vi=P?`at ${P.size.toLocaleString()} selected stop${P.size===1?"":"s"}`:"in view",Fo=q.reduce((L,sn)=>L+Ao[sn.key],0)+on+rn,wi=H?`<b>${Math.round(q.reduce((L,sn)=>L+H.riders[sn.key],0)+H.removedRiders).toLocaleString()}</b> daily boardings ${vi}`:P?`<b>${Fo.toLocaleString()}</b>
         of ${P.size.toLocaleString()} selected stops`:`<b>${Fo.toLocaleString()}</b>
         stops in view`,Ri=a?` \xB7 surface: ${n.radius} m walk`:"",Li=!p&&!!a;e.innerHTML=Li?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${_t[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${ys({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!P,named:!0})}`:`
    <div class="lg-head">
      ${wi}
      <span class="muted">\xB7 ${_t[o]}${Ri}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(bs).map(L=>`
        <button data-weight="${L}" aria-pressed="${s===L}"
                class="${s===L?"active":""}">${bs[L]}</button>`).join("")}
    </div>
    ${q.map(L=>`
      <button class="lg-row ${Ge(L.key)?"off":""}" data-bucket="${u(L.key)}"
              aria-pressed="${!Ge(L.key)}">
        <i style="background:${ct[L.key]?.color??"#666"}"></i>
        <span class="lg-lab">${u(Pl(L.key,L.label,o))}</span>
        <span class="lg-n">${bi(L.key)}</span>
      </button>`).join("")}
    ${jl(on,rn,Si)}
    ${a?ys({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!P}):""}
    ${H?Il(H.unmeasured,on):""}
    ${P?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Se="#4aa3ff",We="#ffa23a",Wn="headline",xt="journey",Ot="journey-rides",Es="journey-walks",Gl=[Ot,Es],Ts=null,Ps=!1;function Et(){return Ts}function Kn(){return Ps}function Jl(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,l=a.to??e.destination,m=[[i.lon,i.lat],[l.lon,l.lat]],p=a.path?.length?a.path:m;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function Ls(){return["match",["get","side"],"current",Se,"proposed",We,Se]}function $s(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Ds(e,t){e.addSource(xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ot,type:"line",source:xt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Ls(),"line-width":$s(1),"line-opacity":.85}},t),e.addLayer({id:Es,type:"line",source:xt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Ls(),"line-width":$s(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Ms(e,t){Ps=t;for(let n of Gl)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Yn(e,t){Ts=t;let n=t?Jl(t,Wn):{type:"FeatureCollection",features:[]};e.getSource(xt).setData(n)}function Cs(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var _s=e=>`${e.toFixed(1)} min`;function As(e){return e==null?"\u2014":e===0?"no change":e>0?`${_s(e)} slower`:`${_s(-e)} faster`}function xs(e,t){return e?e.name?u(e.name):`stop ${u(e.stop_id)}`:t}function Wl(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=xs(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${u(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${xs(e.to,"the destination")}</span></div>`}function ks(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Wl(r,t)),o=r}return n.join("")}var Kl={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function kt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Yl(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function zl(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${kt(t.current)} \u2192
        ${kt(t.proposed)} min</span>
        <span class="muted">${As(t.change_min)}</span></div>
      ${o}
    </div>`}function Os(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function zn(e,t){let n=e.radii[Wn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
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
        <p>${Kl[n.classification]??""}</p>
      </div>
      ${Os(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${kt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${kt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${As(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Yl(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ks(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ks(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${zl(e)}
    ${Os(e)}`}function Fs(e){return`
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
    </div>`}function Ns(e){let t=e?e.radii[Wn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Se}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${We}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Dt="off",Ke="stoproutes",Bs="stoproutes-lines",qn="stoproutes-flow",Us="stoproutes-arrows",Vl=[Bs,qn,Us],Vn="stoproutes-arrow",Hs=3.5,js=null,Gs=!1;function Mt(){return js}function Js(){return Gs}function Ws(e,t){return e!==null&&e[t].length>0}function ql(e,t){let n=t==="current"?e.current:e.proposed,o=Fe(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function Xl(){return["interpolate",["linear"],["zoom"],9,Hs*.6,14,Hs]}function Zl(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function Ks(e,t){e.addSource(Ke,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Bs,type:"line",source:Ke,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Xl(),"line-opacity":.85}},t),e.addLayer({id:qn,type:"line",source:Ke,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},t),e.hasImage(Vn)||e.addImage(Vn,Zl(),{pixelRatio:2,sdf:!0}),e.addLayer({id:Us,type:"symbol",source:Ke,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":Vn,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},t)}function Ct(e,t){Gs=t;for(let n of Vl)e.setLayoutProperty(n,"visibility",t?"visible":"none");t||Xs()}function we(e,t,n){js=t;let o=t?ql(t,n):{type:"FeatureCollection",features:[]};e.getSource(Ke).setData(o),t||Xs()}function Ys(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var Ql={current:"today",proposed:"proposed"};function zs(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${u(e.color)}"></i> <b>${u(e.route)}</b>${e.name?` \u2014 ${u(e.name)}`:""}<br><span style="opacity:.75">${Ql[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var ec=20;function tc(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var Is=tc(3,4,24),U=null,Tt=0,Pt=0,ve=null;function nc(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function Xn(e){ve&&(U=requestAnimationFrame(Xn),!(e-Pt<1e3/ec)&&(Pt=e,Tt=(Tt+1)%Is.length,ve.setPaintProperty(qn,"line-dasharray",Is[Tt])))}function Vs(){ve&&(document.hidden?U!==null&&(cancelAnimationFrame(U),U=null):U===null&&(Pt=0,U=requestAnimationFrame(Xn)))}function qs(e){nc()||ve||(ve=e,Tt=0,Pt=0,document.addEventListener("visibilitychange",Vs),U=requestAnimationFrame(Xn))}function Xs(){U!==null&&(cancelAnimationFrame(U),U=null),document.removeEventListener("visibilitychange",Vs),ve=null}var Nt="places",ea="places-points",Zn="places-boundaries",le="places-fill",Le="lost",oc=100,rc={lost:"share_lost",gained:"share_gained"};function ee(e,t){return`service_${e}_${t}`}var ta={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},sc="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",ie={lost:M,gained:C},At=null,Q=null,Re=null,na=!1,Ft=null;function Qn(){return At}function oa(){return Q}function ra(){return Ft}function eo(){return Re}function Ye(){return na}function ac(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function ic(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function lc(e){return Math.max(e.residents_lost,e.residents_gained)}var Zs=4,cc=16,uc=1e3;function dc(e){let t=Math.min(1,Math.sqrt(e/uc));return Zs+t*(cc-Zs)}function pc(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:ic(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:dc(lc(t))}}))}}function mc(){return["match",["get","klass"],"lost",ie.lost,"gained",ie.gained,ie.lost]}function gc(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var K=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var Y=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function sa(e,t){return e==="service"?["step",["abs",["coalesce",["get",ee(t,"pct")],0]],Y[0].opacity,Y[0].max,Y[1].opacity,Y[1].max,Y[2].opacity,Y[2].max,Y[3].opacity]:["step",["coalesce",["get",rc[e]],0],K[0].opacity,Number.EPSILON,K[1].opacity,K[1].max,K[2].opacity,K[2].max,K[3].opacity,K[3].max,K[4].opacity]}function aa(e,t){return e==="service"?["case",[">=",["coalesce",["get",ee(t,"pct")],0],0],C,M]:ie[e]}function fc(e,t){let n=ee(t,"now"),o=ee(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var hc=3;function yc(e){if(e.length===0)return"";let t=e.slice(0,hc),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function ia(e,t){e.addSource(Zn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:le,type:"fill",source:Zn,layout:{visibility:"none"},paint:{"fill-color":aa(Le),"fill-opacity":sa(Le),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Nt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ea,type:"circle",source:Nt,layout:{visibility:"none"},paint:{"circle-color":mc(),"circle-radius":gc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ht(e,t,n){e.setPaintProperty(le,"fill-color",aa(t,n)),e.setPaintProperty(le,"fill-opacity",sa(t,n))}async function la(){return At||(At=await O("/api/places")),At}async function ca(e){return Re||(Re=await O("/api/boundaries"),e.getSource(Zn).setData(Re)),Re}function bc(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function ua(e,t){let n=bc(Re,t);if(n)return Q=null,Ft=n,e.getSource(Nt)?.setData({type:"FeatureCollection",features:[]}),null;try{Q=await O(`/api/places/${encodeURIComponent(t)}`)}catch{return Q=null,Ft=null,null}return Ft=null,e.getSource(Nt).setData(pc(Q)),e.flyTo({center:[Q.lon,Q.lat],zoom:13}),Q}function da(e,t){na=t,e.setLayoutProperty(ea,"visibility",t?"visible":"none"),e.setLayoutProperty(le,"visibility",t?"visible":"none")}function Sc(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${u(e.key)}">
      <span class="place-name">${u(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var vc="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function pa(e,t,n,o){let r=ac(e,t).map(s=>Sc(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${sc}</p>
    ${o==="service"?`<p class="note">${vc}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function ma(e,t){return e?`<div class="lg-head"><b>${u(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${u(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function wc(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Rc(e,t,n,o){let r=Y.map((l,m)=>({band:l,prevMax:m===0?0:Y[m-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:m})=>{let p=wc(l,m);return[`<div class="lg-row lg-static">
          <i style="background:${M};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(p)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(p)} more trips</span></div>`]}).join(""),s=o?fc(o,n):[],a=yc(s),i=a?`<div class="lg-foot">${u(a)}</div>`:"";return`
    ${ma(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${u(ta[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ga({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return Rc(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=K.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${ie[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${u(i.label)} of the place's own residents ${u(s)}</span>
    </div>`).join("");return`
    ${ma(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${u(s)}</div>
    ${a}
    <div class="lg-row lg-static"><i style="background:${ie.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${ie.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Lc(e,t){let n=e[ee(t,"now")],o=e[ee(t,"proposed")],r=e[ee(t,"pct")],s=e[ee(t,"rail_proposed")],a=ta[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function fa(e,t,n){if(t==="service")return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      ${Lc(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=Qs("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Qs("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Qs(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${oc} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var ze="hidden",ro="#8e44ad",It={discontinued:M,new:C,split:ro,merged:ro,"one-to-one":ye},co={discontinued:"discontinued",new:"new",split:"split",merged:"merged","one-to-one":"one-to-one"},$c=["discontinued","new","split","merged","one-to-one"],_c="route-changes",xc=.12,Sa=.9,kc=1,Oc=/^[cp]:[\w-]{1,64}$/;function va(e){return Oc.test(e)}var to={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Ec={current:"today",proposed:"proposed"},wa=" \u2192 ",Ut="\u2014";function ha(e,{named:t=!0}={}){return e.length===0?Ut:e.map(n=>t&&n.name?`${n.route} ${n.name}`:n.route).join(", ")}function Ve(e,{farSideNamed:t=!0}={}){let n=ha(e.current),o=ha(e.proposed,{named:t||e.current.length===0});return`${n}${wa}${o}`}function so(e){if(e===null)return Ut;let t=Math.round(e);return t===0?"0%":t>0?`+${t}%`:`\u2212${Math.abs(t)}%`}function Tc(e){let t=Object.fromEntries($c.map(n=>[n,0]));for(let n of e)t[n.status]+=1;return t}var Ra="routechange",xe="routechange-lines",jt="routechange-arrows",uo="routechange-selected",po="routechange-selected-lines",La="routechange-selected-arrows",Pc=[xe,jt,po,La],mo=[po,xe],ao="routechange-arrow",no=2.6,Dc=1.5,Mc=2.8;function io(e,t,n,o=1){return{type:"Feature",geometry:{type:"LineString",coordinates:e.points},properties:{key:e.key,side:e.side,route:e.route,name:e.name,status:e.status,pattern_id:e.pattern_id,color:t,sort:n,w:o}}}function Cc(e){return{type:"FeatureCollection",features:e.features.map(n=>io(n,It[n.status],n.status==="one-to-one"?0:1)).sort((n,o)=>n.properties.sort-o.properties.sort)}}function Ac(e){return{type:"FeatureCollection",features:e.features.map(n=>n.side==="current"?io(n,Se,0,Mc):io(n,We,1,Dc)).sort((n,o)=>n.properties.sort-o.properties.sort)}}function Fc(e){let t=1/0,n=1/0,o=-1/0,r=-1/0;for(let s of e)for(let[a,i]of s.points)a<t&&(t=a),a>o&&(o=a),i<n&&(n=i),i>r&&(r=i);return Number.isFinite(t)?[[t,n],[o,r]]:null}function ya(e){return e==="hidden"?["!=",["get","status"],"one-to-one"]:null}function Nc(){let e=t=>["*",["get","w"],t];return["interpolate",["linear"],["zoom"],9,e(no*.5),14,e(no),16,e(no*1.6)]}function Hc(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function ba(e,t,n,o,r,s){e.addSource(t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:n,type:"line",source:t,layout:{visibility:"none","line-cap":"round","line-join":"round","line-sort-key":["get","sort"]},paint:{"line-color":["get","color"],"line-width":Nc(),"line-opacity":s}},r),e.addLayer({id:o,type:"symbol",source:t,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":140,"symbol-sort-key":["get","sort"],"icon-image":ao,"icon-size":["interpolate",["linear"],["zoom"],12,.45,16,.8],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"],"icon-opacity":s}},r)}function $a(e,t){e.hasImage(ao)||e.addImage(ao,Hc(),{pixelRatio:2,sdf:!0}),ba(e,Ra,xe,jt,t,Sa),ba(e,uo,po,La,t,kc),qe(e,ze)}var Bt=null,_e=null,_a=!1;function go(){return Bt?.groups??null}function ce(){return _e}function Gt(){return _a}function Ic(e){return`/api/route_changes?day=${e}`}function Bc(e,t){return`/api/route_changes/${encodeURIComponent(e)}?day=${t}`}async function fo(e,t){if(!k.includes(t))throw new Error(`no such day type: ${t}`);return Bt=await J(Ic(t)),e.getSource(Ra).setData(Cc(Bt)),Bt}async function ho(e,t,n,{fly:o=!0}={}){try{_e=await J(Bc(t,n))}catch{return yo(e),null}e.getSource(uo).setData(Ac(_e)),xa(e,!0);let r=Fc(_e.features);return o&&r&&e.fitBounds(r,{padding:60,maxZoom:14}),_e}function yo(e){_e=null,e.getSource(uo)?.setData({type:"FeatureCollection",features:[]}),e.getLayer(xe)&&xa(e,!1)}function xa(e,t){let n=t?xc:Sa;e.setPaintProperty(xe,"line-opacity",n),e.setPaintProperty(jt,"icon-opacity",n)}function qe(e,t){e.setFilter(xe,ya(t)),e.setFilter(jt,ya(t))}function ka(e,t){_a=t;for(let n of Pc)e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Uc="A route group is PRT\u2019s own mapping of today\u2019s route numbers onto the plan\u2019s \u2014 the routes it says replace each other. It is not a corridor: a street can lose one group\u2019s buses and gain another\u2019s, and only the location, surface and street views can see that.";function Oa(){return` <button class="howto" data-caveat="${_c}">method</button>`}function jc(e){if(e.current.length===0||e.proposed.length===0)return"";let t=e.service.weekday.pct_trips;return`<span class="rc-pct ${lo(t)}" title="Weekday trips, today to plan">${so(t)}</span>`}function lo(e){return e===null||Math.round(e)===0?"flat":e>0?"up":"down"}function Ea(e,t){return`
    <button type="button" class="rc-row${t?" selected":""}"
            data-select-route="${u(e.key)}">
      <span class="rc-map">${u(Ve(e,{farSideNamed:!1}))}</span>
      ${jc(e)}
    </button>`}function oo(e,t,n){return`
    <div class="scope-head">${u(e)} (${t.length})</div>
    <div class="rc-list">${t.map(o=>Ea(o,o.key===n)).join("")}</div>`}function Ta(e,t){let n=r=>e.filter(s=>r.includes(s.status)),o=n(["one-to-one"]);return`
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${e.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${Uc}${Oa()}</p>
    ${oo("Discontinued",n(["discontinued"]),t)}
    ${oo("New",n(["new"]),t)}
    ${oo("Split or merged",n(["split","merged"]),t)}
    <details class="svc rc-kept">
      <summary>One-to-one (${o.length}) \u2014 one number on each side; how its service changed</summary>
      <div class="rc-list">${o.map(r=>Ea(r,r.key===t)).join("")}</div>
    </details>`}function Gc(e,t){return`
    <tr><th>${e}</th>
      <td class="n">${t.cur_trips.toLocaleString()}</td>
      <td class="n">${t.prop_trips.toLocaleString()}</td>
      <td class="n ${lo(t.pct_trips)}">${so(t.pct_trips)}</td>
      <td class="n">${t.cur_hours.toFixed(1)}</td>
      <td class="n">${t.prop_hours.toFixed(1)}</td>
      <td class="n ${lo(t.pct_hours)}">${so(t.pct_hours)}</td></tr>`}function Jc(e){return e.prt.length===0?'<p class="muted">PRT\u2019s table has no row for this group.</p>':e.prt.map(n=>{let o=n.related_routes?`<div class="muted">PRT points riders to: ${u(n.related_routes)}</div>`:"",r=n.route_page?`<div><a class="link" href="${u(n.route_page)}" target="_blank" rel="noopener">PRT\u2019s page for this route \u2197</a></div>`:"";return`<div class="rc-prt">
      <div><b>${u(n.current_route||Ut)}${wa}${u(n.final_route||Ut)}</b>
        <span class="rc-cat">${u(n.category)}</span></div>
      ${o}${r}</div>`}).join("")}function Pa(e){let t=e.status==="new"?"":`
    <p class="rc-riders">${Math.round(e.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">\xB7 WPRDC route ridership, average weekday</span></p>`;return`
    <button type="button" class="link rc-back" data-select-route="">\u2190 All routes</button>
    <div class="place-head">
      <h2>${u(Ve(e))}</h2>
      <span class="rc-status ${u(e.status)}">${u(co[e.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today \u2192 plan</th>
        <th class="n" colspan="3">revenue hours today \u2192 plan</th></tr></thead>
      <tbody>${k.map(n=>Gc(n,e.service[n])).join("")}</tbody>
    </table>
    ${t}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today\u2019s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT\u2019s own account, from its route crosswalk.</p>
    ${Jc(e)}

    <p class="note">This is a route group, not a corridor. One group\u2019s loss
      can be another group\u2019s gain: Carrick\u2019s 51 reads as \u221210% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${Oa()}</p>`}function $e(e,t,n){return`<div class="lg-row lg-static"><i style="background:${e};border-radius:2px"></i>
    <span class="lg-lab">${t}</span>${n===void 0?"":`<span class="lg-n">${n}</span>`}</div>`}function Da({groups:e,day:t,oneToOne:n,selected:o}){if(o)return`
      <div class="lg-head"><b>${u(Ve(o))}</b>
        <span class="muted">\xB7 ${u(co[o.status])} \xB7 ${u(to[t])}</span></div>
      ${$e(Se,"today's alignment")}
      ${$e(We,"proposed alignment")}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;if(!e)return'<div class="lg-head"><b>Route changes</b></div>';let r=Tc(e),s=r.split+r.merged,a=`${e.length.toLocaleString()} route groups \xB7 ${r.discontinued} discontinued \xB7 ${r.new} new \xB7 ${s} split or merged \xB7 ${to[t]}`;return`
    <div class="lg-head"><b>${u(a)}</b></div>
    ${$e(It.discontinued,"discontinued \u2014 today\u2019s alignment",String(r.discontinued))}
    ${$e(It.new,"new \u2014 proposed alignment",String(r.new))}
    ${$e(ro,"split or merged \u2014 proposed alignment",String(s))}
    ${$e(It["one-to-one"],`one-to-one (${n})`,String(r["one-to-one"]))}
    <div class="lg-foot">A route group is PRT\u2019s own mapping of today\u2019s
      numbers onto the plan\u2019s, not a corridor. Patterns are the ones that
      run on ${u(to[t])}. Click a line to select its group.</div>`}function Ma(e,{selected:t}){let n=u(e.name?`${e.route} ${e.name}`:e.route),o=u(Ec[e.side]),r=u(co[e.status]);return t?`${n} \xB7 <b>${o}</b> \xB7 ${r}`:`<b>${n}</b> \xB7 ${o} \xB7 ${r}`}var bo=" \xB7 ",So={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places",routes:"Route changes"},Ca=Object.keys(So);function Aa(e){return So[e]??e}var Wc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Kc=["oneseat","journey"],Yc=["dots","both"],zc={current:"routes today",proposed:"routes proposed"};function Vc(e){return e!=="journey"&&e!=="routes"}function qc(e){let t=[So[e.view]??e.view];return e.view==="places"?t[0]:(Kc.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Wc[e.day]),Vc(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&Yc.includes(e.view)&&t.push(zc[e.stopRoutes]),t.join(bo))}function Fa(e){let[t,...n]=qc(e).split(bo);return`<b>${u(t)}</b>${n.map(o=>bo+u(o)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes",route:"route",oneToOne:"onetoone"},Xc=/^[cp]:[\w.:-]{1,32}$/,Jt={any:"any",selected:"selected"},Zc="pin",Na=5;function Ia(e){try{return e.self!==e.top}catch{return!0}}function Ba(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?Jt.selected:Jt.any),t.set(h.dest,"key"in e.dest?e.dest.key:vo(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,vo(e.at)),e.camera&&t.set(h.camera,`${vo(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==Le&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),t.set(h.stopRoutes,e.stopRoutes??Dt),e.route&&t.set(h.route,e.route),t.set(h.oneToOne,e.oneToOne??ze),`?${t}`}function Ua(e){let t=new URLSearchParams(e),n={},o=t.get(h.view);o&&Ca.includes(o)&&(n.view=o);let r=t.get(h.day);r&&k.includes(r)&&(n.day=r);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(h.oneSeatDay);a===Jt.selected?n.oneSeatRestricted=!0:a===Jt.any&&(n.oneSeatRestricted=!1);let i=t.get(h.dest);if(i&&i!==Zc){let T=Ha(i);T?n.dest=T:i.includes(",")||(n.dest={key:i})}let l=Ha(t.get(h.at));l&&(n.at=l);let m=Qc(t.get(h.camera));m&&(n.camera=m);let p=t.get(h.place);p&&(n.place=p);let y=t.get(h.selection);y!==null&&(n.selection=y.split(",").filter(T=>Xc.test(T)));let R=t.get(h.placeFill);(R==="lost"||R==="gained"||R==="service")&&(n.placeFill=R);let v=t.get(h.stopRoutes);(v==="off"||v==="current"||v==="proposed")&&(n.stopRoutes=v);let $=t.get(h.route);$&&va($)&&(n.route=$);let f=t.get(h.oneToOne);return(f==="hidden"||f==="shown")&&(n.oneToOne=f),n}function vo(e){return`${e.lat.toFixed(Na)},${e.lon.toFixed(Na)}`}function Ha(e){let t=ja(e,2);return t?{lat:t[0],lon:t[1]}:null}function Qc(e){let t=ja(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function ja(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var wo="embed";var eu=["1","true","yes"];function Ga(e){let t=new URLSearchParams(e).get(wo);return t!==null&&eu.includes(t.toLowerCase())}function Ja(e){let t=new URLSearchParams(e);return t.set(wo,"1"),`?${t}`}function Wa(e){let t=new URLSearchParams(e);t.delete(wo);let n=String(t);return n?`?${n}`:""}function Ka(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var te=["peek","half","full"],tu=192,nu=.3,ou=.55,ru=.9,su=.6,au=.45;function Wt(e,t){return e==="peek"?Math.min(tu,t*nu):e==="half"?t*ou:t*ru}function iu(e,t,n=0){let o=te.map(s=>Math.abs(Wt(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>su&&(r=Math.max(0,Math.min(te.length-1,r+(n>0?1:-1)))),te[r]}function Ya(e){return te[(te.indexOf(e)+1)%te.length]}function lu(e,t){return Math.min(e,t*au)}function ke(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Ro(e){let t=null,n=()=>{let o=ke();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var cu=8,uu=400;function za(e){let t=d("side"),n=d("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,l={y:0,t:0};function m(){return window.innerHeight}function p(f){t.style.height=`${f}px`,e.onMove(f,lu(f,m()))}function y(f){o=f,t.dataset.snap=f,p(Wt(f,m()))}n.addEventListener("pointerdown",f=>{ke()&&(r=!0,s=f.clientY,a=t.getBoundingClientRect().height,i=f.timeStamp,l={y:f.clientY,t:f.timeStamp},t.classList.add("dragging"),n.setPointerCapture(f.pointerId))}),n.addEventListener("pointermove",f=>{if(!r)return;let T=a+(s-f.clientY),q=Wt("peek",m()),P=Wt("full",m());p(Math.max(q,Math.min(P,T))),l={y:f.clientY,t:f.timeStamp}});function R(f){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(f.clientY-s)>cu)&&f.timeStamp-i<uu){y(Ya(o));return}let q=f.timeStamp-l.t,P=q>0?(l.y-f.clientY)/q:0;y(iu(t.getBoundingClientRect().height,m(),P))}n.addEventListener("pointerup",R),n.addEventListener("pointercancel",R),n.addEventListener("keydown",f=>{f.key!=="Enter"&&f.key!==" "||(f.preventDefault(),ke()&&y(Ya(o)))});let v=Ro(e.onLayoutChange);function $(){if(v(),!ke()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}y(o)}return window.addEventListener("resize",$),$(),{at:()=>ke()?o:"full",atLeast(f){ke()&&te.indexOf(f)>te.indexOf(o)&&y(f)}}}var du=["llvmpipe","swiftshader","softpipe","basic render","software"];function Lo(e){if(!e)return!1;let t=e.toLowerCase();return du.some(n=>t.includes(n))}function qa(e){let t=Lo(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function Xa(e){return Lo(e.renderer)?0:pu}var pu=300,mu="https://tiles.openfreemap.org/styles/positron",gu=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],Va=[],fu=19,hu='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',yu=!1;function Za(e){return!yu||!Lo(e.renderer)?mu:bu()}function bu(){let e=o=>({type:"raster",tileSize:256,attribution:hu,tiles:o,maxzoom:fu}),t={basemap:e(gu)},n=[{id:"basemap",type:"raster",source:"basemap"}];return Va.length&&(t["basemap-labels"]=e(Va),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function Qa(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Su(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function ei(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),r=null,s="",a=l=>{s!==l&&(s=l,e.getCanvas().style.cursor=l)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",l=>{let m=n.map(T=>T.layer).filter(T=>e.getLayer(T)&&e.getLayoutProperty(T,"visibility")!=="none");if(!m.length){i();return}let[p,...y]=e.queryRenderedFeatures(l.point,{layers:m});if(!p){i();return}a("pointer");let R=Su(p);if(R===r)return;let v=o.get(p.layer?.id),$=v?v.html(p,y):null;if($==null){r=null,t.remove();return}r=R;let f=v.anchor?v.anchor(p,l):l.lngLat;t.setLngLat(f).setHTML($).addTo(e)}),e.on("mouseout",i),i}function vu(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function wu(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var Ru="seg-current",ti="dd",Lu="open",ni="armed";function $u(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(ni)}));return vu(t)}function oi(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let l=a===n;i.group.classList.toggle(Lu,l),i.trigger.setAttribute("aria-expanded",String(l))}},r=s=>o(wu(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let l=s.id||`controls-${a}`,m=s.querySelector(".lbl")?.textContent??"",p=document.createElement("button");p.type="button",p.className=Ru,p.setAttribute("aria-haspopup","true"),p.setAttribute("aria-expanded","false");let y=document.createElement("div");y.className=ti,i.replaceWith(y),y.append(p,i);let R=()=>{let v=$u(i);p.textContent=v.label,p.disabled=v.disabled,p.classList.toggle(ni,v.armed),p.setAttribute("aria-label",m?`${m}: ${v.label}`:v.label)};R(),new MutationObserver(R).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),p.addEventListener("click",()=>{r({kind:"trigger",group:l}),n===l&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",v=>{if(!v.target.closest("button"))return;let $=n===l;r({kind:"pick"}),$&&p.focus()}),t.set(l,{group:s,trigger:p,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${ti}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var _u=[-79.9959,40.4406],xu=12,ku="#e2574c",Kt=5,x={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes",oneToOne:"data-onetoone"},Ze=Ua(location.search),et=Ga(location.search);et&&d("app").classList.add("embed");var Ou={at:()=>"full",atLeast(){}},li=null,A=400,Xe=null,S=null,oe=null,de=0,_={key:"downtown"},ue=null,ci=!1,Te=!1,en="locations",Pe="area",I=Dt,$o=0;function zt(){return I==="off"?"current":I}var ui="count",Zt=null,j=Le,pe=null,De=ze,G=!1,g="dots",Oo,To=[],ri=()=>{},_o=Qa(),c=new maplibregl.Map({container:"map",style:Za(_o),pixelRatio:qa(_o),fadeDuration:Xa(_o),renderWorldCopies:!1,center:Ze.camera?[Ze.camera.lon,Ze.camera.lat]:_u,zoom:Ze.camera?.zoom??xu,cooperativeGestures:Ia(window),attributionControl:{compact:!0}});c.addControl(new maplibregl.NavigationControl,"top-right");c.on("load",()=>{Bo(c),Ur(c),Xr(c,je),os(c,je),us(c,"walk-fill"),Ds(c),Ks(c,Ot),ia(c,je),$a(c,je),E(),c.on("click",t=>{if(G)return;if(ci){Qe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=c.queryRenderedFeatures(t.point,{layers:[le]})[0];s&&Vt(s.properties.key);return}if(g==="routes"){let{x:s,y:a}=t.point,i=[[s-Kt,a-Kt],[s+Kt,a+Kt]],l=c.queryRenderedFeatures(i,{layers:mo})[0];l?(Oo.atLeast("half"),Eo(l.properties.key)):si();return}let n=[...mt,"oneseat-dots"].filter(s=>c.getLayoutProperty(s,"visibility")!=="none"),o=c.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Co(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});ri=ei(c,e,[...Uo(t=>{let n=gt(),o=t.find(r=>mt.includes(r.layer?.id));return n&&o?On(o.properties,w(),n.buckets,{pole:!1}):null}),...mt.map(t=>({layer:t,html:n=>{let o=gt();return o?On(n.properties,w(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=be();return n?fs(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:"stoproutes-lines",html:t=>zs(t.properties)},...mo.map(t=>({layer:t,html:n=>Ma(n.properties,{selected:ce()!==null})})),{layer:le,html:t=>fa(t.properties,j,w())}]),Wu(),c.on("moveend",()=>{let t=c.getCenter();li={lat:t.lat,lon:t.lng,zoom:c.getZoom()},b(),N()}),ne(x.radius,t=>{A=Number(t.dataset.radius),_n(c,A,w()).then(b),yt()&&Dn(c,A,w()).then(b),bt()&&An(A).then(b),be()&&qt(),S&&Oe(S.lat,S.lon)}),ne(x.day,t=>{let n=t.dataset.day;cr(n),g!=="journey"&&E(),xn(c,n),Qt(),Mn(c,n),g==="journey"&&S&&Po(S.lat,S.lon),wt()&&rs(c,n).then(b),Te&&be()&&(qt(),S&&Oe(S.lat,S.lon)),Ye()&&j==="service"&&Ht(c,j,n),Gt()&&Iu(),b()}),ne(x.oneSeatDay,t=>{Te=t.dataset.oneseatDay==="selected",ko(),qt(),S&&Oe(S.lat,S.lon)}),ne(x.view,t=>{let n=g;g=t.dataset.view,ri(),xr(c,g==="dots"||g==="both"),Cu(g==="surface"||g==="both"),Fu(g==="corridors"),ju(g==="oneseat"),Uu(g==="journey",n==="journey"),Nu(g==="places"),Hu(g==="routes"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&E({scrollToTop:!0}),Bu(un(g)),gi();let o=g==="oneseat"||g==="journey";d("dest-controls").classList.toggle("hidden",!o),d("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),d("place-fill-controls").classList.toggle("hidden",g!=="places"),d("route-onetoone-controls").classList.toggle("hidden",g!=="routes"),hi(),V()||ai(!1),Ee(),ko(),o||Xt(!1),pi()}),ne(x.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Xt(!0);return}Xt(!1),Qe({key:n})}),ne(x.placeFill,t=>{j=t.dataset.placeFill,Ye()&&Ht(c,j,w()),E(),b(),ko()}),ne(x.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=I!=="off"&&Mt()!==null;I=n,E(),o&&n!=="off"?(we(c,Mt(),n),F&&Mo(F.radius)):Qt()}),ne(x.oneToOne,t=>{De=t.dataset.onetoone,qe(c,De),b()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){en=n.dataset.weight,b(),N();return}let o=t.target.closest("[data-surface-unit]");if(o){Pe=o.dataset.surfaceUnit,Au(Pe),N();return}let r=t.target.closest("[data-bucket]");r&&(jr(c,r.dataset.bucket,w()),b())}),d("legend-reset").addEventListener("click",()=>{Gr(c,w()),b()}),d("legend-select").addEventListener("click",()=>ai(!G)),d("legend-clear").addEventListener("click",()=>{Ln(c),Ee(),b(),N()}),d("legend-collapse").addEventListener("click",()=>{xo(!d("legend-box").classList.contains("collapsed"))}),d("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Qe({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&zu(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&Vt(r.dataset.selectPlace);let s=t.target.closest("[data-select-route]");if(s){let l=s.dataset.selectRoute;l?Eo(l):si()}let a=t.target.closest("[data-sort-places]");a&&(ui=a.dataset.sortPlaces,E());let i=t.target.closest("[data-goto-place]");i&&(g!=="places"&&z(x.view,"places"),Vt(i.dataset.gotoPlace))}),d("side-toggle").addEventListener("click",Du),et&&Ro(xo),Oo=et?Ou:za({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),c.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:xo}),Tu(),oi(),nn(),Ee(),tn(),Eu(Ze),_n(c,A,w()).then(b),Yu(),Ku()});function ne(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),nn(),N()})})}function z(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Eu(e){e.radius!==void 0&&z(x.radius,String(e.radius)),e.day&&z(x.day,e.day),e.oneSeatRestricted!==void 0&&z(x.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(en=e.weight),e.surfaceUnit&&(Pe=e.surfaceUnit),e.placeFill&&z(x.placeFill,e.placeFill),e.oneToOne&&z(x.oneToOne,e.oneToOne),e.dest&&("key"in e.dest?z(x.dest,e.dest.key):Qe(e.dest)),e.selection&&Mr(c,e.selection),e.stopRoutes&&z(x.stopRoutes,e.stopRoutes),e.view&&z(x.view,e.view),e.at&&Co(e.at.lat,e.at.lon),e.place&&Vt(e.place),e.route&&Eo(e.route,{fly:!e.camera})}function N(){let e={view:g,day:w(),radius:A,oneSeatRestricted:Te,weight:en,surfaceUnit:Pe,dest:_,at:S,camera:li,place:Zt,placeFill:j,selection:Tr(),stopRoutes:I,route:pe,oneToOne:De},t=Ba(e);history.replaceState(null,"",(et?Ja(t):t)+location.hash),tn(t)}function tn(e=Wa(location.search)){if(!et)return;let t=d("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g==="routes"?ce()?Ve(ce()):null:S?oe?Ie(oe):"this point":null;t.querySelector(".el-action").textContent=Ka(n)}function nn(){d("statebar").innerHTML=Fa({view:g,day:w(),radius:A,oneSeatRestricted:Te,destination:tt(),stopRoutes:I}),Pu()}function xo(e){d("legend-box").classList.toggle("collapsed",e);let t=d("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Tu(){let e=t=>{d("app").classList.toggle("controls-open",t),d("controls-toggle").setAttribute("aria-expanded",String(t))};d("controls-toggle").addEventListener("click",()=>{e(!d("app").classList.contains("controls-open"))}),d("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Pu(){d("controls-toggle").firstChild?.remove(),d("controls-toggle").prepend(document.createTextNode(Aa(g)))}function Du(){let e=d("app").classList.toggle("side-collapsed"),t=d("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),c.resize()}function b(){Mu()}function Mu(){if(d("legend-reset").classList.toggle("hidden",Nn()||Un()||Kn()||Ye()||Gt()||!V()),Kn()){d("legend").innerHTML=Ns(Et());return}if(Gt()){d("legend").innerHTML=Da({groups:go(),day:w(),oneToOne:De,selected:ce()});return}if(Ye()){d("legend").innerHTML=ga({selected:oa(),fill:j,day:w(),boundaries:eo(),unchanged:ra()});return}if(Nn()){let n=wt();n&&Ss(d("legend"),n);return}if(Un()){let n=be();if(!n)return;let o=c.getBounds();vs(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=gt();if(!e)return;let t=c.getBounds();Rs(d("legend"),{layer:e,day:w(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:en,dots:V(),surface:Pn()?yt():null,unit:Pe,population:bt(),selection:Er()})}async function Cu(e){if(e&&!yt()){d("legend").classList.add("loading");try{await Dn(c,A,w())}finally{d("legend").classList.remove("loading")}}Zr(c,e),e&&Pe==="people"&&await di(),b()}async function di(){if(!bt()){d("legend").classList.add("loading");try{await An(A)}finally{d("legend").classList.remove("loading")}}}async function Au(e){e==="people"&&Pn()&&await di(),b()}async function Fu(e){if(e&&!wt()){d("legend").classList.add("loading");try{await Hn(c,w())}finally{d("legend").classList.remove("loading")}}ss(c,e),b()}async function Nu(e){if(e&&(!Qn()||!eo())){d("legend").classList.add("loading");try{await Promise.all([la(),ca(c)])}finally{d("legend").classList.remove("loading")}}da(c,e),e&&Ht(c,j,w()),e&&E(),b()}async function Vt(e){Zt=await Me(()=>ua(c,e))?e:null,g==="places"&&(E(),Zt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),N()}async function Hu(e){e&&(await Me(()=>fo(c,w())),qe(c,De)),ka(c,e),e&&E({scrollToTop:!0}),b()}async function Eo(e,{fly:t=!0}={}){pe=await Me(()=>ho(c,e,w(),{fly:t}))?e:null,g==="routes"&&E({scrollToTop:!0}),b(),N()}function si(){!pe&&!ce()||(yo(c),pe=null,g==="routes"&&E({scrollToTop:!0}),b(),N())}async function Iu(){await Me(async()=>{await fo(c,w()),qe(c,De),pe&&await ho(c,pe,w(),{fly:!1})}),g==="routes"&&E(),b()}function Bu(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function E({scrollToTop:e=!1}={}){if(e&&(d("panel").scrollTop=0),tn(),g==="places"){d("panel").innerHTML=pa(Qn()??[],ui,Zt,j);return}if(g==="routes"){let t=ce();d("panel").innerHTML=t?Pa(t):Ta(go()??[],pe);return}if(!oe){g==="oneseat"?d("panel").innerHTML=Rr(tt()):ur(d("panel"));return}if(g==="oneseat"){let t=wr(oe,_,w());if(t){d("panel").innerHTML=t;return}}vr(oe,{withKerb:V(),routes:I})}function Uu(e,t=!1){if(Ms(c,e),b(),!e){t&&(S?Oe(S.lat,S.lon):E());return}Et()&&S?d("panel").innerHTML=zn(Et(),tt()):d("panel").innerHTML=Fs(tt())}async function Po(e,t){let n=++de;S={lat:e,lon:t},N(),fi(e,t);let o=mi(),r=u(tt());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await O(Cs({lat:e,lon:t},o,w()));if(n!==de)return;Yn(c,s),d("panel").innerHTML=zn(s,r),b(),tn()}catch(s){if(n!==de)return;Yn(c,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function ko(){d("day-controls").classList.toggle("hidden",!ms(g,Te,j))}function Do(){return ps(Te,w())}async function ju(e){e&&!be()&&await Me(()=>jn(c,A,_,Do())),gs(c,e),b()}async function qt(){await Me(()=>jn(c,A,_,Do())),b()}async function Me(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function Qe(e){if(_=e,Xt(!1),Gu(),pi(),nn(),N(),g==="journey"){S&&Po(S.lat,S.lon),b();return}S?Oe(S.lat,S.lon):E({scrollToTop:!0}),qt()}function pi(){let e=mi();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in _))){ue?.remove(),ue=null;return}ue?ue.setLngLat([e.lon,e.lat]).addTo(c):(ue=new maplibregl.Marker({color:Bn,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(c),ue.on("dragend",()=>{let n=ue.getLngLat();Qe({lat:n.lat,lon:n.lng})}))}function Gu(){let e=ds(_);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function mi(){if("lat"in _)return{lat:_.lat,lon:_.lon};let e=_.key,t=To.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function tt(){if("lat"in _)return`${_.lat.toFixed(4)}, ${_.lon.toFixed(4)}`;let e=_.key;return To.find(t=>t.key===e)?.name??e}function Xt(e){ci=e,c.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Oe(e,t){let n=++de;S={lat:e,lon:t},N(),d("panel").classList.add("loading"),fi(e,t),dn(c),we(c,null,zt()),d("pin-key").classList.add("hidden");try{let o="lat"in _?`&dest_lat=${_.lat.toFixed(6)}&dest_lon=${_.lon.toFixed(6)}`:"",r=await O(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${A}${o}&oneseat_day=${Do()}`);if(n!==de)return;F={lat:e,lon:t,radius:A,now:r.current.stops,proposed:r.proposed.stops},oe=r,hi(),gi(),E({scrollToTop:!0})}catch(o){if(n!==de)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===de&&d("panel").classList.remove("loading")}}var F=null;function gi(){if(!F||!un(g)){dn(c),d("pin-key").classList.add("hidden"),Qt();return}jo(c,F.lat,F.lon,F.radius,F.now,F.proposed),Mo(F.radius),Qt()}function Qt(){let e=++$o,t=()=>{F&&Mo(F.radius)};I!=="off"&&V()&&S&&oe?.kerb?O(Ys(S,w())).then(n=>{e===$o&&(we(c,n,zt()),Ct(c,!0),qs(c),t())}).catch(()=>{e===$o&&(we(c,null,zt()),Ct(c,!1),t())}):(we(c,null,zt()),Ct(c,!1),t())}function Mo(e){let t=I!=="off"&&Js()&&Ws(Mt(),I)?I:!1;d("pin-key").innerHTML=ws(e,{routes:t}),d("pin-key").classList.remove("hidden")}function fi(e,t){Xe?Xe.setLngLat([t,e]):(Xe=new maplibregl.Marker({color:ku,draggable:!0}).setLngLat([t,e]).addTo(c),Xe.on("dragend",()=>{let n=Xe.getLngLat();Co(n.lat,n.lng)}))}var Yt=14;function V(){return g==="dots"||g==="both"}function ai(e){G=e&&V(),G?c.dragPan.disable():c.dragPan.enable(),c.getCanvas().style.cursor=G?"none":"",G||yi(),Ee()}function hi(){let e=V()&&!!oe?.kerb;d("stop-routes-controls").classList.toggle("hidden",!e)}function Ee(){let e=d("legend-select");e.classList.toggle("hidden",!V()),e.setAttribute("aria-pressed",String(G)),e.textContent=G?"Selecting":"Select stops",d("legend-clear").classList.toggle("hidden",!V()||!Pr())}function Ju(e,t){let n=d("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!G}function ii(e){d("brush").classList.toggle("painting",e)}function yi(){d("brush").hidden=!0}function Wu(){let e=d("brush");e.style.width=`${Yt*2}px`,e.style.height=`${Yt*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Ee(),b()}))},s=()=>{G&&(t=!0,n=!1,ii(!0))},a=l=>{if(Ju(l.point.x,l.point.y),!t)return;n=!0,Rn(c,$n(c,l.point.x,l.point.y,Yt))&&r()},i=l=>{if(ii(!1),!!t){if(t=!1,!n){let[m]=$n(c,l.point.x,l.point.y,Yt);m&&Dr(c,m)}Ee(),b(),N()}};c.on("mousedown",s),c.on("mousemove",a),c.on("mouseup",i),c.getCanvas().addEventListener("mouseleave",yi),c.on("touchstart",s),c.on("touchmove",a),c.on("touchend",i)}function Co(e,t){if(Oo.atLeast("half"),g==="journey"){Po(e,t);return}g!=="places"&&g!=="routes"&&Oe(e,t)}async function Ku(){try{To=await O("/api/destinations"),nn()}catch{}}async function Yu(){try{let e=await O("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;d("feedline").textContent=t,d("feedline-methods").textContent=t,d("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function zu(e){d("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
