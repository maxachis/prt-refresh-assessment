"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function O(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Hn=new Map;function q(e){let t=Hn.get(e);if(t)return t;let n=O(e).catch(o=>{throw Hn.delete(e),o});return Hn.set(e,n),n}function c(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function $e(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function Nn(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Bn(e){return e>0?`+${e}`:String(e)}function _r(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Xl="#15181e",kr="#ffa23a",Zl="#ffffff";function Ql(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;r.push([t+a*Math.cos(l),e+s*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function X(e){return{type:"FeatureCollection",features:e}}function ec(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function tc(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function In(e){return e!=="corridors"&&e!=="journey"&&e!=="places"&&e!=="routes"}function Un(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(X([]))}function xr(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Er(e){e.addSource("walk",{type:"geojson",data:X([])}),e.addSource("stops-now",{type:"geojson",data:X([])}),e.addSource("stops-prop",{type:"geojson",data:X([])}),e.addSource("stop-moves",{type:"geojson",data:X([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":kr,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Zl,"circle-stroke-width":3,"circle-stroke-color":kr}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Xl,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function Tr(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>tc(n.properties,e(o))}))}function Dr(e,t,n,o,r,s){e.getSource("walk").setData(X([Ql(t,n,o)])),e.getSource("stops-now").setData(X(xr(r,"current"))),e.getSource("stops-prop").setData(X(xr(s,"proposed"))),e.getSource("stop-moves").setData(X(ec(s)))}var E=["weekday","saturday","sunday"],ze=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Z={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},R="all",wt=4,vt=6,Pr=e=>vt+wt*e,Or=e=>vt+1+wt*e,qe=e=>vt+2+wt*e,nc=e=>vt+3+wt*e,Rt=2,oc=3,Xe=4,Mr=5,_e=e=>e[oc],N=(e,t)=>e[t],Cr=(e,t)=>e[nc(t)],jn=e=>2+2*e,Gn=e=>3+2*e,Lt=4,Ar=e=>2+Lt*e,Fr=e=>3+Lt*e,Hr=e=>4+Lt*e,Nr=e=>5+Lt*e;var rc=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],sc=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],Br=1e-6,ac=32;function jr(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=rc.map(([i,l])=>(e+i*r+l*s)**3);return sc.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function Ir(e,t,n){return jr(e,t,n).every(o=>o>=-Br&&o<=1+Br)}function ic(e,t,n){if(Ir(e,t,n))return t;let o=0,r=t;for(let s=0;s<ac;s++){let a=(o+r)/2;Ir(e,a,n)?o=a:r=a}return o}function lc(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function cc(e,t,n){let[o,r,s]=jr(e,ic(e,t,n),n);return`#${[o,r,s].map(a=>lc(a).toString(16).padStart(2,"0")).join("")}`}var Ur=/(\d+)/;function uc(e,t){let n=e.split(Ur),o=t.split(Ur);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function Ze(e){let t=[...new Set(e)].sort(uc);return new Map(t.map((n,o)=>[n,cc(.55,.16,o*360/t.length)]))}var Gr="at this stop",Wr=e=>`within ${e} m`,dc="both directions",pc="one or both directions",Yn="weekday";function v(){return Yn}function qr(e){Yn=e}function Xr(e){e.innerHTML=`
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
    </div>`}function Zr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function mc(e,t,n=R){let o=Math.max(1,...ze.map(r=>Math.max(e.periods[r]??0,t.periods[r]??0)));return ze.map(r=>{let s=e.periods[r]??0,a=t.periods[r]??0,i=a-s,l=i>0?"up":i<0?"down":"flat";return`
      <tr class="${r===n?"sel":""}">
        <th>${Z[r]}</th>
        <td class="bar">
          <span class="b-now" style="width:${s/o*100}%"></span>
          <span class="b-prop" style="width:${a/o*100}%"></span>
        </td>
        <td class="n">${s}</td>
        <td class="n">${a}</td>
        <td class="n ${l}">${i===0?"\xB7":Bn(i)}</td>
      </tr>`}).join("")}function Qr(e){return e.length?e.map(t=>`<span class="route">${c(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Yr(e){return e.first==null?'<span class="muted">no service</span>':`${$e(e.first)}\u2013${$e(e.last)}`}function Kr(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var gc={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},fc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function hc(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':$t(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${c(o.name)}</span>
          <span class="os-status ${c(o.status)}">${gc[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${fc[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${me("one-seat")}</p>
    </div>`:""}function me(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Qe(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function Jr(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Vr(e){return e.first==null||e.last==null?null:e.last-e.first}function $t(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${zr(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${zr(t,o,"prop",r("proposed"))}</div>
    </div>`}function zr(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${c(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var Wn=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,yc="Allegheny";function tt(e){let t=e.place?.muni?.trim()??"",n=Wn.exec(t)?.[1],o=n===yc?t.replace(Wn,""):n?`${t.replace(Wn,"")} (${n})`:t;return e.place?.hood||o||"this location"}function et(e){return e==="weekday"?"weekday":e}function es(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${et(t)}`}function bc(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Sc(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function wc(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${me("one-direction")}</dt>
      ${Qe(r(n,e.routes),r(o,t.routes))}`}function ts(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${et(t)}, today only</span>`;return`<dt>Boardings ${c(n)}</dt><dd>${s}${r}</dd>`}function ns(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${me("boardings")}</p>`}function vc(e){if(!e)return"";let t=c(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose all buses
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains all buses under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in
        <button type="button" class="place-link" data-goto-place="${c(e.key)}">${t}</button>
      </h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${me("place-population")}</p>
    </div>`}function os(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
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
        ${s===0?"no change":`${Bn(s)} trips`}
        <div class="muted">${_r(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${et(n)} ${c(o)}${r?`, ${c(r)}`:""}</div>`}function rs(e,t,n=R){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${mc(e,t,n)}</tbody>
    </table>`}function ss(e,t){let n=Kr(e),o=Kr(t),r=Vr(e),s=Vr(t);return`
      <dt>First and last</dt>
      ${Qe(Yr(e),Yr(t))}
      <dt>Hours between</dt>
      ${Qe(Nn(r),Nn(s),Jr(r,s,"more"))}
      <dt>Typical wait</dt>
      ${Qe(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,Jr(n,o,"less"))}`}function as(e,t,n,o){return`
    <div class="routes">
      <h3>${c(n)}</h3>
      ${$t(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${me("location-not-route")}</p>
    </div>`}function Rc(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${et(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${et(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${me("stop-routes")}</p>`}function Lc(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:Ze((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${c(i)}
        <span class="muted">\xB7 PRT stop ${c(e.stop_id)}</span></div>
      ${os(o,r,t,Gr)}
      <div class="tiers">${Zr(o.hourly,r.hourly)}</div>
      ${rs(o,r,n.period)}
      <dl class="facts">
        ${ss(o,r)}
        ${ts(o.boardings,t,Gr)}
      </dl>
      ${ns(o.boardings)}
      ${as(o,r,"Routes calling at this stop",a)}
      ${Rc(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${me("kerb")}</p>
    </section>`}function Kn(e,t,n="",o=R){let r=e.current.days[t],s=e.proposed.days[t],a=r.one_direction_routes?.length||s.one_direction_routes?.length;return`
    ${os(r,s,t,Wr(e.radius),{directions:a?pc:dc})}

    <div class="tiers">${Zr(r.hourly,s.hourly)}</div>

    ${rs(r,s,o)}
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
      ${ss(r,s)}
      ${wc(r,s)}
      <dt>Stops within ${e.radius} m</dt>
      ${Qe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Sc(e.current.stops)}
      ${bc(e.proposed.stops)}
      ${ts(r.boardings,t,Wr(e.radius))}
    </dl>
    ${ns(r.boardings)}

    ${n}

    ${vc(e.population)}

    ${as(r,s,"Routes serving this spot")}`}function $c(e,t,{withKerb:n=!1,routes:o="off",period:r}={}){let s=n?e.kerb??null:null,a=s?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${c(tt(e))}</h2>
      <div class="muted">${a}</div>
    </div>
    ${s?Lc(s,t,{routes:o,period:r}):""}
    ${s?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${Kn(e,t,hc(e.oneseat??[],e.oneseat_day??"any"),r)}`}function is(e,t={}){document.getElementById("panel").innerHTML=$c(e,Yn,t)}var _c={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},kc={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},xc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ec(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Jn(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Qr(t)}</div>`:""}function Tc(e){let t=Jn("kept",e.kept)+Jn("lost",e.lost)+Jn("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Dc(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${$t(e.current,e.proposed)}
    </div>`}function Pc(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${c(r.key)}">
      <span class="os-name">${c(r.name)}</span>
      <span class="os-status ${c(r.status)}">${Oc[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Oc={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Mc(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${xc[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function ls(e,t,n){let o=Ec(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":Tc(o)+Dc(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${c(o.name)}</h2>
      <div class="muted">
        from ${c(tt(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${c(o.status)}">${_c[o.status]}</div>
    <p class="note">${kc[o.status]} ${Mc(r)}</p>

    ${s}

    ${Pc(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${es(e,n)}</summary>
      ${Kn(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function cs(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${c(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var se={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ke="change",ae="change-dots",ge=["boolean",["feature-state","selected"],!1],us="#15181e",fe=["==",["get","published"],0],xt="newplace",Cc="#15181e",Ac=5,kt=["==",["get","removed"],1],Et="removedstop",ot="change-removed",qn="change-removed-selected",Vn="removed-cross",ps="#e8232f";function Fc(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,ps]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var Xn=["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1];function Zn(e){return e.hasImage(Vn)||e.addImage(Vn,Fc(),{pixelRatio:2}),Vn}var Hc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},_t=null,re=new Set,Y=new Set,Nc=[ae,qn,ot],Tt=[ae,ot],rt=ae;function ms(e,t){for(let n of Nc)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Dt(){return _t}function st(e){return re.has(e)}function gs(e,t,n,o){return r=>Uc(r,e,t,n,o)}function fs(e){return t=>e.has(_e(t))}function hs(){return Y}function ys(){return[...Y].sort()}function bs(){return Y.size}function Qn(e,t){let n=0;for(let o of t)Y.has(o)||(Y.add(o),nt(e,o,!0),n++);return n}function Ss(e,t){Y.delete(t)?nt(e,t,!1):(Y.add(t),nt(e,t,!0))}function ws(e,t){eo(e),Qn(e,t)}function eo(e){for(let t of Y)nt(e,t,!1);Y.clear()}function nt(e,t,n){try{e.setFeatureState({source:ke,id:t},{selected:n})}catch{}}function Bc(e){for(let t of Y)nt(e,t,!0)}function Ic(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function to(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[ae,ot].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[l,m]=i.geometry.coordinates,g=e.project([l,m]);return{id:i.id,x:g.x,y:g.y}});return Ic(t,n,o,a)}function vs(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||N(s,Rt)===0||N(s,Xe)===1)continue;let a=n[N(s,qe(t))];a!==void 0&&r[a]++}return r}function Rs(e,t){let n=0;for(let o of e)t(o)&&N(o,Rt)===0&&n++;return n}function Ls(e,t){let n=0;for(let o of e)t(o)&&N(o,Xe)===1&&n++;return n}function Uc(e,t,n,o,r){let s=N(e,0),a=N(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function $s(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||N(s,Rt)===0)continue;let a=n[N(s,qe(t))];if(a===void 0)continue;let i=Cr(s,t),l=N(s,Xe)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(l){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function jc(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>E.some((o,r)=>t[N(n,qe(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:_e(n),published:n[2],removed:n[Xe],name:n[Mr],moved:e.moved?.[_e(n)]??null,replacement:e.replacement?.[_e(n)]?.[0]??null,nearestStraight:e.replacement?.[_e(n)]?.[1]??null,...Object.fromEntries(E.flatMap((o,r)=>[[`b${r}`,t[N(n,qe(r))]],[`sc${r}`,n[Pr(r)]],[`sp${r}`,n[Or(r)]]]))}}))}}function _s(e,t){let n=Object.entries(se).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,se.none[t]]}function ks(e){return["case",fe,"rgba(0,0,0,0)",_s(e,"color")]}function zn(e){return["case",fe,Ac,_s(e,"size")]}function xs(e){return["interpolate",["linear"],["zoom"],9,["*",zn(e),.45],12,zn(e),16,["*",zn(e),1.9]]}function Es(e){e.addSource(ke,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ae,type:"circle",source:ke,paint:{"circle-color":ks(0),"circle-radius":xs(0),"circle-opacity":.85,"circle-stroke-color":["case",ge,us,fe,Cc,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ge,1.6,fe,.9,.5],12,["case",ge,2.4,fe,1.5,1],16,["case",ge,3.2,fe,2.2,1.6]]}},"walk-fill"),e.addLayer({id:qn,type:"circle",source:ke,filter:kt,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":us,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ge,1.6,0],12,["case",ge,2.4,0],16,["case",ge,3.2,0]]}},"walk-fill"),e.addLayer({id:ot,type:"symbol",source:ke,filter:kt,layout:{"icon-image":Zn(e),"icon-size":Xn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Pt(e,t,n,o=R){let r=o===R?"":`&period=${o}`;return _t=await q(`/api/change?radius=${t}${r}`),e.getSource(ke).setData(jc(_t)),Bc(e),no(e,n),_t}function no(e,t){let n=E.indexOf(t);e.setPaintProperty(ae,"circle-color",ks(n)),e.setPaintProperty(ae,"circle-radius",xs(n)),oo(e,t)}function Ts(e,t,n){re.has(t)?re.delete(t):re.add(t),oo(e,n)}function Ds(e,t){re.clear(),oo(e,t)}function oo(e,t){let n=E.indexOf(t),o=["none",...re],r=["case",fe,!re.has(xt),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(ae,["all",["!",kt],r]);let s=["all",kt,!re.has(Et)];e.setFilter(ot,s),e.setFilter(qn,s)}function Gc(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function ro(e,t,n,{pole:o=!0,period:r=R}={}){let s=E.indexOf(t),a=e[`b${s}`],i=e.removed===1,l=e.published===0?"the plan adds a stop here":n.find(_=>_.key===a)?.label??a,m=e[`sc${s}`],g=e[`sp${s}`],y=t==="weekday"?"weekday":t,h=i?`Currently ${m}`:`${m} \u2192 ${g}`,S=r===R?`per ${y}`:`${Z[r]} on ${Hc[t]}`;return`${o?Gc(e):""}${Yc(e)}${h} buses ${S} at this stop<br>${i?"":`<b>${l}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var Wc=1.5,ds=800;function Yc(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??ds,r=n!=null&&o>n*Wc?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${ds} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${ps}">Stop removed</b> \u2014 ${s}<br>`}var so="surface",Mt="surface-fill",Ps="#6b7280",ao=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Ps],[.138,Ps],[1,"#bd60e7"],[2,"#961bed"]],B="#e8232f",I="#0f79c9",Os=2,Ot=null,Ms=!1;function at(){return Ot}function io(){return Ms}function Cs(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Os,Math.min(Os,n))}function As(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Fs(e,t,n,o,r,s,a,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let m of e){let g=a.lat0+(m[1]+.5)*a.dlat,y=a.lon0+(m[0]+.5)*a.dlon;if(g<o||g>s||y<n||y>r)continue;let h=m[jn(t)],S=m[Gn(t)],_=As(h,S);if(_!=="none")if(_==="ramp"){let p=Cs(h,S);l[p<-.138?"less":p>.138?"more":"same"]+=i}else l[_]+=i}return l}function Kc(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,l=n+s[0]*r,m=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,a],[m,a],[m,i],[l,i],[l,a]]]},properties:Object.fromEntries(E.flatMap((g,y)=>{let h=s[jn(y)],S=s[Gn(y)];return[[`k${y}`,As(h,S)],[`v${y}`,Cs(h,S)??0]]}))}})}}function Hs(e){return["case",["==",["get",`k${e}`],"gone"],B,["==",["get",`k${e}`],"new"],I,["interpolate",["linear"],["get",`v${e}`],...ao.flatMap(([t,n])=>[t,n])]]}function xe(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Ns(e,t){e.addSource(so,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Mt,type:"fill",source:so,layout:{visibility:"none"},paint:{"fill-color":Hs(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,xe(0,.85),13,xe(0,.62),16,xe(0,.45)]}},t)}async function Ct(e,t,n,o=R){let r=o===R?"":`&period=${o}`;return Ot=await q(`/api/surface?radius=${t}${r}`),e.getSource(so).setData(Kc(Ot)),lo(e,n),Ot}function lo(e,t){let n=E.indexOf(t);e.setPaintProperty(Mt,"fill-color",Hs(n)),e.setPaintProperty(Mt,"fill-opacity",["interpolate",["linear"],["zoom"],9,xe(n,.85),13,xe(n,.62),16,xe(n,.45)])}function Bs(e,t){Ms=t,e.setLayoutProperty(Mt,"visibility",t?"visible":"none")}var co=null;function At(){return co}async function uo(e){return co=await q(`/api/population?radius=${e}`),co}function Is(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let m=a.lat0+(l[1]+.5)*a.dlat,g=a.lon0+(l[0]+.5)*a.dlon;m<o||m>s||g<n||g>r||(i.lost+=l[Ar(t)],i.gained+=l[Fr(t)],i.kept+=l[Hr(t)],i.none+=l[Nr(t)])}return i}var po="corridor",Us="corridor-lines",Ee="#8b929c",Jc="#6f7783",Ht={lost:B,added:I,kept:Ee};var Ft=null,js=!1;function Nt(){return Ft}function mo(){return js}function Vc(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Gs(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function zc(){let e=t=>["match",["get","klass"],"lost",Ht.lost,"added",Ht.added,t];return["interpolate",["linear"],["zoom"],9,e(Jc),14,e(Ee)]}function qc(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Xc(){return["match",["get","klass"],"kept",.85,.9]}function Ws(e,t){e.addSource(po,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Us,type:"line",source:po,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":zc(),"line-width":qc(),"line-opacity":Xc()}},t)}async function go(e,t){return Ft=await O(`/api/corridors?day=${t}`),e.getSource(po).setData(Vc(Ft)),Ft}async function Ys(e,t){E.includes(t)&&await go(e,t)}function Ks(e,t){js=t,e.setLayoutProperty(Us,"visibility",t?"visible":"none")}var fo="#2b3038",Vs="#b9bec6",it={loses:{color:B,size:6},gains:{color:I,size:6},keeps:{color:Ee,size:3},here:{color:fo,size:3.5},none:{color:Vs,size:1.8}};var Q="loses_retired",Ut=["loses",Q,"gains","keeps","none","here"];function ho(e,t){let n=e===Q?"loses":e,o=t.find(r=>r.key===n)?.label??n;return e==="loses"?`${o} \u2014 stop kept`:e===Q?`${o} \u2014 stop retired`:o}function zs(e){return{...e.counts,loses:e.counts.loses-e.retired.loses,[Q]:e.retired.loses}}var Bt="oneseat",qs="oneseat-dots",Xs="oneseat-removed",Js=["all",["==",["get","status"],"loses"],["==",["get","removed"],1]],jt=[qs,Xs],It=null,Zs=!1;function Te(){return It}function yo(){return Zs}function Qs(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;a[Q]=0;for(let i of e){let l=i[0],m=i[1];if(l<o||l>s||m<n||m>r)continue;let g=t[i[3]];g!==void 0&&a[g==="loses"&&i[6]===1?Q:g]++}return a}function Zc(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5],removed:n[6]??0}}))}}function Qc(){return["match",["get","status"],...Object.entries(it).flatMap(([e,t])=>[e,t.color]),Vs]}function eu(){let e=["match",["get","status"],...Object.entries(it).flatMap(([t,n])=>[t,n.size]),it.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function ea(e,t){e.addSource(Bt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:qs,type:"circle",source:Bt,filter:["!",Js],layout:{visibility:"none"},paint:{"circle-color":Qc(),"circle-radius":eu(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t),e.addLayer({id:Xs,type:"symbol",source:Bt,filter:Js,layout:{visibility:"none","icon-image":Zn(e),"icon-size":Xn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},t)}function tu(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var nu="pin";function ta(e){return"key"in e?e.key:nu}var Gt="any";function ou(e,t,n){return`radius=${e}&${tu(t)}&day=${n}`}function na(e,t){return e?t:Gt}function oa(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function bo(e,t,n,o=Gt){return It=await O(`/api/oneseat?${ou(t,n,o)}`),e.getSource(Bt).setData(Zc(It)),It}function ra(e,t){Zs=t;for(let n of jt)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function So(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function sa(e,t){let n=e.status==="loses"&&e.removed===1?Q:e.status,o=ho(n,t.statuses),r=(e.current||"").split(";").filter(Boolean),s=(e.proposed||"").split(";").filter(Boolean),a=l=>l.length?l.join(", "):"none",i=So(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${o}</b> \u2014 ${i}<br>today: ${a(r)}<br>proposed: ${a(s)}`}var Wt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},wo={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},ru=new Set(["gone","new"]),su="stop kept";function au(e,t,n){return ru.has(e)?`${t}, ${su} (${wo[n]})`:t}function iu(e){return e.buckets.filter(t=>t.key!=="none")}var aa={area:"Ground",people:"People"};function lu(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=Fs(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function cu(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=Is(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var uu=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function ia(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1,period:l=R}=e,m=ao.map(([h,S])=>`${S} ${((h+2)/4*100).toFixed(1)}%`).join(", "),g=l===R?r:"area",y=l===R?"per day":Z[l];return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} ${y},
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${m})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${B}"></i>loses all service
          (${wo[n]})</span>
        <span><i style="background:${I}"></i>new service
          (${wo[n]})</span>
      </div>
      ${l===R?`
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(aa).map(h=>`
          <button data-surface-unit="${h}" aria-pressed="${r===h}"
                  class="${r===h?"active":""}">${aa[h]}</button>`).join("")}
      </div>`:""}
      ${a?uu:g==="people"?cu(n,o,s):lu(t,n,o)}
    </div>`}var du=["lost","added","kept"],pu={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},mu={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ua(e,t){let{lostPct:n,addedPct:o}=Gs(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${mu[t.day]}
    </div>
    ${du.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${Ht[i]}"></i>
        <span class="lg-lab">${c(pu[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function da(e,t,n){let o=t.statuses.map(h=>h.key),r=Qs(t.points,o,n.west,n.south,n.east,n.north),s=zs(t),a=h=>ho(h,t.statuses),i=h=>h===Q?'<i class="lg-cross"></i>':`<i style="background:${it[h].color}"></i>`,l=Ut.reduce((h,S)=>h+(r[S]??0),0),m=So(t),g=t.day&&t.day!==Gt,y=g?`Restricted to routes running on ${Wt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${c(m)}</b>
      <span class="muted">\xB7 ${l.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${g?` \xB7 ${Wt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Ut.map(h=>`
      <div class="lg-row lg-static">
        ${i(h)}
        <span class="lg-lab">${c(a(h))}</span>
        <span class="lg-n">${(r[h]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Ut.map(h=>`${(s[h]??0).toLocaleString()} ${c(a(h))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${c(m)} without transferring?
      ${y} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      A cross is a stop the plan retires, as in Stop-by-stop \u2014 decided at the
      stop, not the walk \u2014 so the ride may survive at a stop a block away;
      a retired stop that keeps its ride stays a plain dot.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function pa(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var la={locations:"Stops",riders:"Riders"};function gu(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function fu(e){if(!e)return"";let t=st(xt);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${xt}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function hu(e,t){if(!e)return"";let n=st(Et);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Et}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop \u2014 no bus here on any day</span>
      <span class="lg-n">${t}</span>
    </button>`}function yu(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${fu(e)}
      ${hu(t,n)}
    </div>`}function ca(e){return e===R?"":`
    <div class="lg-foot">PRT records boardings per day, not per hour, so the
      key counts stops here; the People reading is per day too. Everything
      else is the same map with only the buses in this window counted.</div>`}function ma(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:l,selection:m,dots:g=!0,period:y=R}=t,h=n.buckets.map(k=>k.key),S=n.days.indexOf(o),{west:_,south:p,east:$,north:P}=r,W=iu(n),H=m&&m.size>0?m:null,M=H?fs(H):gs(_,p,$,P),Wl=y===R?s:"locations",Rr=vs(n.points,S,h,M),Cn=Rs(n.points,M),An=Ls(n.points,M),j=Wl==="riders"?$s(n.points,S,h,M):null,Yl=k=>j?j.measured[k]?Math.round(j.riders[k]).toLocaleString():"\u2014":Rr[k].toLocaleString(),Kl=j?j.removedMeasured?Math.round(j.removedRiders).toLocaleString():"\u2014":An.toLocaleString(),Jl=H?`at ${H.size.toLocaleString()} selected stop${H.size===1?"":"s"}`:"in view",Lr=W.reduce((k,Fn)=>k+Rr[Fn.key],0)+Cn+An,Vl=j?`<b>${Math.round(W.reduce((k,Fn)=>k+j.riders[Fn.key],0)+j.removedRiders).toLocaleString()}</b> daily boardings ${Jl}`:H?`<b>${Lr.toLocaleString()}</b>
         of ${H.size.toLocaleString()} selected stops`:`<b>${Lr.toLocaleString()}</b>
         stops in view`,zl=a?` \xB7 surface: ${n.radius} m walk`:"",$r=y===R?"":` \xB7 ${Z[y]}`,ql=!g&&!!a;e.innerHTML=ql?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${Wt[o]}${$r} \xB7 ${n.radius} m walk</span>
    </div>
    ${ia({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!H,named:!0,period:y})}
    ${ca(y)}`:`
    <div class="lg-head">
      ${Vl}
      <span class="muted">\xB7 ${Wt[o]}${$r}${zl}</span>
    </div>
    ${y===R?`
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(la).map(k=>`
        <button data-weight="${k}" aria-pressed="${s===k}"
                class="${s===k?"active":""}">${la[k]}</button>`).join("")}
    </div>`:""}
    ${W.map(k=>`
      <button class="lg-row ${st(k.key)?"off":""}" data-bucket="${c(k.key)}"
              aria-pressed="${!st(k.key)}">
        <i style="background:${se[k.key]?.color??"#666"}"></i>
        <span class="lg-lab">${c(au(k.key,k.label,o))}</span>
        <span class="lg-n">${Yl(k.key)}</span>
      </button>`).join("")}
    ${yu(Cn,An,Kl)}
    ${a?ia({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!H,period:y}):""}
    ${j?gu(j.unmeasured,Cn):""}
    ${H?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}
    ${ca(y)}`}var De="#4aa3ff",lt="#ffa23a",vo="headline",Yt="journey",Jt="journey-rides",wa="journey-walks",bu=[Jt,wa],va=null,Ra=!1;function Vt(){return va}function Ro(){return Ra}function Su(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,l=a.to??e.destination,m=[[i.lon,i.lat],[l.lon,l.lat]],g=a.path?.length?a.path:m;o.push({type:"Feature",geometry:{type:"LineString",coordinates:g},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function ga(){return["match",["get","side"],"current",De,"proposed",lt,De]}function fa(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function La(e,t){e.addSource(Yt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Jt,type:"line",source:Yt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ga(),"line-width":fa(1),"line-opacity":.85}},t),e.addLayer({id:wa,type:"line",source:Yt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ga(),"line-width":fa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function $a(e,t){Ra=t;for(let n of bu)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Lo(e,t){va=t;let n=t?Su(t,vo):{type:"FeatureCollection",features:[]};e.getSource(Yt).setData(n)}function _a(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var ha=e=>`${e.toFixed(1)} min`;function ka(e){return e==null?"\u2014":e===0?"no change":e>0?`${ha(e)} slower`:`${ha(-e)} faster`}function ya(e,t){return e?e.name?c(e.name):`stop ${c(e.stop_id)}`:t}function wu(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=ya(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${c(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ya(e.to,"the destination")}</span></div>`}function ba(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(wu(r,t)),o=r}return n.join("")}var vu={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Kt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Ru(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Lu(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Kt(t.current)} \u2192
        ${Kt(t.proposed)} min</span>
        <span class="muted">${ka(t.change_min)}</span></div>
      ${o}
    </div>`}function Sa(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function $o(e,t){let n=e.radii[vo],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${c(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${$e(e.window.start_min)}
        and ${$e(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${vu[n.classification]??""}</p>
      </div>
      ${Sa(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Kt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Kt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${ka(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Ru(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ba(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ba(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Lu(e)}
    ${Sa(e)}`}function xa(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${c(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function Ea(e){let t=e?e.radii[vo].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${De}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${lt}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var zt="off",$u="stoproutes",qt="stoproutes-lines",_u="stoproutes-flow",ku="stoproutes-arrows",_o="stoproutes-arrow",xu=3.5,Da=null;function Xt(){return Da}function Pa(){return Pe.isVisible()}function Oa(e,t){return e!==null&&e[t].length>0}function Eu(e,t){let n=t==="current"?e.current:e.proposed,o=Ze(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function Tu(e){return["interpolate",["linear"],["zoom"],9,e*.6,14,e]}function Du(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function ko({ids:e,width:t=xu}){let n=[e.lines,e.flow,e.arrows],o=!1,r=Cu(e.flow);return{init(s,a){s.addSource(e.source,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),s.addLayer({id:e.lines,type:"line",source:e.source,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Tu(t),"line-opacity":.85}},a),s.addLayer({id:e.flow,type:"line",source:e.source,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},a),s.hasImage(_o)||s.addImage(_o,Du(),{pixelRatio:2,sdf:!0}),s.addLayer({id:e.arrows,type:"symbol",source:e.source,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":_o,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},a)},setVisible(s,a){o=a;for(let i of n)s.setLayoutProperty(i,"visibility",a?"visible":"none");a||r.stop()},setData(s,a){s.getSource(e.source).setData(a)},startFlow:r.start,stopFlow:r.stop,isVisible:()=>o}}var Pe=ko({ids:{source:$u,lines:qt,flow:_u,arrows:ku}});function Ma(e,t){Pe.init(e,t)}function Zt(e,t){Pe.setVisible(e,t)}function Oe(e,t,n){Da=t,Pe.setData(e,t?Eu(t,n):{type:"FeatureCollection",features:[]}),t||Pe.stopFlow()}function Ca(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var xo={current:"today",proposed:"proposed"};function Eo(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${c(e.color)}"></i> <b>${c(e.route)}</b>${e.name?` \u2014 ${c(e.name)}`:""}<br><span style="opacity:.75">${xo[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var Pu=20;function Ou(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var Ta=Ou(3,4,24);function Mu(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function Cu(e){let t=null,n=0,o=0,r=null,s=i=>{r&&(t=requestAnimationFrame(s),!(i-o<1e3/Pu)&&(o=i,n=(n+1)%Ta.length,r.setPaintProperty(e,"line-dasharray",Ta[n])))},a=()=>{r&&(document.hidden?t!==null&&(cancelAnimationFrame(t),t=null):t===null&&(o=0,t=requestAnimationFrame(s)))};return{start(i){Mu()||r||(r=i,n=0,o=0,document.addEventListener("visibilitychange",a),t=requestAnimationFrame(s))},stop(){t!==null&&(cancelAnimationFrame(t),t=null),document.removeEventListener("visibilitychange",a),r=null}}}function Aa(e){Pe.startFlow(e)}var Qt=" \xB7 ",Au=["dots","surface","both"],To={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places",routes:"Route changes"},Fa=Object.keys(To);function Ha(e){return To[e]??e}var Do={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function en(e){return Do[e]}var Fu=["oneseat","journey"],Hu=["dots","both"],Nu={current:"routes today",proposed:"routes proposed"};function Bu(e){return e!=="journey"&&e!=="routes"}function Iu(e){let t=[To[e.view]??e.view];if(e.view==="places")return t[0];Fu.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Do[e.day]);let n=e.period??R;return n!==R&&Au.includes(e.view)&&t.push(Z[n]),Bu(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&Hu.includes(e.view)&&t.push(Nu[e.stopRoutes]),t.join(Qt)}function Na(e){return Ba(Iu(e))}function Ba(e){let[t,...n]=e.split(Qt);return`<b>${c(t)}</b>${n.map(o=>Qt+c(o)).join("")}`}var Uu={current:"today",proposed:"proposed"};function ju(e){return["Route "+e.short_name,Uu[e.side],Do[e.day]].join(Qt)}function Ia(e){return Ba(ju(e))}var Gu="#c026d3",Wu=4.5,Ga={source:"routeview",lines:"routeview-lines",flow:"routeview-flow",arrows:"routeview-arrows"},Wa=Ga.lines,ct=ko({ids:Ga,width:Wu});function Ya(e,t){return`/api/route?${new URLSearchParams({side:e.side,route_id:e.route_id,day:t})}`}function Ka(e){return e?e.startsWith("#")?e:`#${e}`:Gu}function Yu(e){let t=Ka(e.color);return{type:"FeatureCollection",features:e.features.map(o=>({type:"Feature",geometry:{type:"LineString",coordinates:o.points},properties:{side:e.side,route:e.short_name,name:e.long_name||null,pattern_id:o.pattern_id,color:t}}))}}function Ja(e,t){ct.init(e,t)}function Po(e,t){let n=t?Yu(t):{type:"FeatureCollection",features:[]};ct.setData(e,n);let o=n.features.length>0;ct.setVisible(e,o),o?ct.startFlow(e):ct.stopFlow()}var Ku={current:"today",proposed:"the plan"},Ju={current:"today",proposed:"proposed"},Ua={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"};function ja(e,t){return e.length<=1?e.join(""):`${e.slice(0,-1).join(", ")} ${t} ${e[e.length-1]}`}function Vu(e){let t=E.filter(r=>e.includes(r)),n=E.filter(r=>!e.includes(r));if(t.length===0)return"Does not run on any day type in this feed.";let o=`Runs on ${ja(t.map(r=>Ua[r]),"and")}`;return n.length===0?`${o}.`:`${o}; does not run on ${ja(n.map(r=>Ua[r]),"or")}.`}function Va(e){let n=e.features.length>0?'<span class="pk-note">arrows: direction of travel</span>':`<span class="pk-note">does not run on ${c(en(e.day))} \u2014 nothing drawn</span>`;return`
    <div class="pk-head rk-head">
      <i class="sw-route" style="background:${c(Ka(e.color))}"></i>
      <span class="rk-name"><b>${c(e.short_name)}</b>${e.long_name?` ${c(e.long_name)}`:""}
        \xB7 ${Ju[e.side]} \xB7 ${c(en(e.day))}</span>
      <button type="button" class="rk-clear" data-clear-route
              aria-label="Clear the drawn route" title="Clear the drawn route">\xD7</button>
    </div>
    ${n}`}function zu(e){let t=e.crosswalk;if(!t)return"<p>PRT's crosswalk has no row for this route.</p>";let n=e.side==="current"?t.final_route:t.current_route,o=t.related_routes?` Related: ${c(t.related_routes)}`:"",r=t.route_page?`<p><a class="link" href="${c(t.route_page)}" target="_blank" rel="noopener">PRT's page for this route \u2197</a></p>`:"";return`<p>PRT's crosswalk: ${c(t.category)} \xB7 ${c(n)}.${o}</p>${r}`}function za(e){let t=e.features.length>0,n=`Route ${c(e.short_name)}${e.long_name?` \xB7 ${c(e.long_name)}`:""}`,o=t?"":`
      <p class="note">It does not run on ${c(en(e.day))}, so nothing is
        drawn for the day the toolbar is set to; switch the day to see it.</p>`;return`
    <div class="route-card">
      <div class="place-head">
        <h2>${n}</h2>
        <div class="sub">${Ku[e.side]==="today"?"today's network":"the plan"}</div>
      </div>
      <p>${c(Vu(e.days))}</p>${o}
      <h3 class="scope-head">What PRT says it becomes</h3>
      ${zu(e)}
      <p class="note">This is PRT's own labelling of which route replaces
        which. It is not a comparison \u2014 this site never measures a route
        against its successor, because the plan re-splits corridors and a
        route can "lose half its trips" while every stop on it keeps them.
        To see what changes for the riders along this line, click a stop on
        it.</p>
      <p class="note">Drawn from the feed's shapes \u2014 for drawing only; buses
        only, so a train on the same street is not shown.</p>
    </div>`}var qu="/api/search",Xu=8,Zu=150,qa=1,Qu={current:"today",proposed:"plan"},tn=" \xB7 ",Xa={places:"Places",stops:"Stops",routes:"Routes",addresses:"Addresses"},ed="Nothing found",Za="search-opt-";function Qa(e,t=Xu){return{url:qu,init:{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q:e,limit:t})}}}function td(e,t=null){let o=["current","proposed"].filter(r=>e.includes(r)).map(r=>Qu[r]);return[t,...o].filter(Boolean).join(tn)}function nd(e){return[xo[e.side],e.long_name].filter(Boolean).join(tn)}var od="street";function rd(e){return e.kind==="street"?[od,e.place].filter(Boolean).join(tn):[e.place,e.zip].filter(Boolean).join(tn)}function Mo(e){let t={places:e.places.map(n=>({kind:"place",place:n})),stops:e.stops.map(n=>({kind:"stop",stop:n})),routes:e.routes.map(n=>({kind:"route",route:n})),addresses:e.addresses.map(n=>({kind:"address",address:n}))};return ei(e.q).flatMap(n=>t[n])}var sd=/^\d+\s+[a-z]/i;function ei(e){let t=e.trim();return sd.test(t)?["addresses","routes","places","stops"]:/^\d/.test(t)?["routes","places","stops","addresses"]:["places","stops","routes","addresses"]}function ad(e,t,n){return n===0?null:e===null?t>0?0:n-1:(e+t+n)%n}function id(e){switch(e.kind){case"place":return{name:e.place.name,tag:e.place.kind};case"stop":return{name:e.stop.name,tag:td(e.stop.sides,e.stop.place)};case"route":return{name:e.route.short_name,tag:nd(e.route)};case"address":return{name:e.address.label,tag:rd(e.address)}}}function ld(e,t,n){let{name:o,tag:r}=id(e);return`<div id="${Za}${t}" role="option" aria-selected="${n}" class="sr-row${n?" hl":""}" data-idx="${t}"><span class="sr-name">${c(o)}</span><span class="sr-tag">${c(r)}</span></div>`}function cd(e,t){let n=Mo(e);if(n.length===0)return`<div class="sr-empty">${ed}</div>`;let o={places:"place",stops:"stop",routes:"route",addresses:"address"},r=0;return ei(e.q).map(s=>{let a=n.filter(l=>l.kind===o[s]);if(a.length===0)return"";let i=a.map(l=>ld(l,r,r++===t)).join("");return`<div class="sr-group" role="group" aria-label="${Xa[s]}"><div class="sr-head">${Xa[s]}</div>${i}</div>`}).join("")}var ud=14,dd=15;function ti(e,t){let{bounds:n}=e;return t.lon>=n.west&&t.lon<=n.east&&t.lat>=n.south&&t.lat<=n.north&&e.zoom>=ud?null:{lat:t.lat,lon:t.lon,zoom:Math.max(e.zoom,dd)}}var Oo="open";function ni({elements:e,search:t,onPick:n}){let{group:o,input:r,list:s,opener:a}=e,i=0,l=null,m=null,g=null,y=p=>{o.classList.toggle(Oo,p),r.setAttribute("aria-expanded",String(p)),p||(g=null,r.removeAttribute("aria-activedescendant"))},h=()=>{m&&(s.innerHTML=cd(m,g),g===null?r.removeAttribute("aria-activedescendant"):(r.setAttribute("aria-activedescendant",`${Za}${g}`),s.querySelector(`[data-idx="${g}"]`)?.scrollIntoView({block:"nearest"})))},S=p=>{let $=++i;t(p).then(P=>{$===i&&(m=P,g=null,h(),y(!0))}).catch(()=>{$===i&&(m={q:p,places:[],stops:[],routes:[],addresses:[]},g=null,h(),y(!0))})},_=p=>{if(!m)return;let $=Mo(m)[p];$&&(y(!1),n($))};return r.addEventListener("input",()=>{l&&clearTimeout(l);let p=r.value.trim();if(p.length<qa){i++,m=null,y(!1);return}l=setTimeout(()=>S(p),Zu)}),r.addEventListener("focus",()=>{m&&r.value.trim().length>=qa&&y(!0)}),r.addEventListener("keydown",p=>{let $=m?Mo(m).length:0,P=o.classList.contains(Oo);p.key==="ArrowDown"||p.key==="ArrowUp"?(p.preventDefault(),!P&&m&&y(!0),g=ad(g,p.key==="ArrowDown"?1:-1,$),h()):p.key==="Enter"?P&&g!==null&&(p.preventDefault(),_(g)):p.key==="Escape"&&(P&&(p.stopPropagation(),y(!1)),r.blur())}),s.addEventListener("mousedown",p=>p.preventDefault()),s.addEventListener("click",p=>{let $=p.target.closest("[data-idx]");$&&_(Number($.dataset.idx))}),document.addEventListener("click",p=>{if(!o.classList.contains(Oo))return;let $=p.target;o.contains($)||a?.contains($)||y(!1)}),{focus(){r.focus(),r.select()}}}var rn="places",si="places-points",Co="places-boundaries",ye="places-fill",Ce="lost",pd=100,md={lost:"share_lost",gained:"share_gained"};function le(e,t){return`service_${e}_${t}`}var ai={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},gd="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",he={lost:B,gained:I},nn=null,ie=null,Me=null,ii=!1,on=null;function Ao(){return nn}function li(){return ie}function ci(){return on}function Fo(){return Me}function ut(){return ii}function fd(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function hd(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function yd(e){return Math.max(e.residents_lost,e.residents_gained)}var oi=4,bd=16,Sd=1e3;function wd(e){let t=Math.min(1,Math.sqrt(e/Sd));return oi+t*(bd-oi)}function vd(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:hd(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:wd(yd(t))}}))}}function Rd(){return["match",["get","klass"],"lost",he.lost,"gained",he.gained,he.lost]}function Ld(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var ee=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var te=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function ui(e,t){return e==="service"?["step",["abs",["coalesce",["get",le(t,"pct")],0]],te[0].opacity,te[0].max,te[1].opacity,te[1].max,te[2].opacity,te[2].max,te[3].opacity]:["step",["coalesce",["get",md[e]],0],ee[0].opacity,Number.EPSILON,ee[1].opacity,ee[1].max,ee[2].opacity,ee[2].max,ee[3].opacity,ee[3].max,ee[4].opacity]}function di(e,t){return e==="service"?["case",[">=",["coalesce",["get",le(t,"pct")],0],0],I,B]:he[e]}function $d(e,t){let n=le(t,"now"),o=le(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var _d=3;function kd(e){if(e.length===0)return"";let t=e.slice(0,_d),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function pi(e,t){e.addSource(Co,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ye,type:"fill",source:Co,layout:{visibility:"none"},paint:{"fill-color":di(Ce),"fill-opacity":ui(Ce),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(rn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:si,type:"circle",source:rn,layout:{visibility:"none"},paint:{"circle-color":Rd(),"circle-radius":Ld(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function sn(e,t,n){e.setPaintProperty(ye,"fill-color",di(t,n)),e.setPaintProperty(ye,"fill-opacity",ui(t,n))}async function mi(){return nn||(nn=await O("/api/places")),nn}async function gi(e){return Me||(Me=await O("/api/boundaries"),e.getSource(Co).setData(Me)),Me}function xd(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function fi(e,t){let n=xd(Me,t);if(n)return ie=null,on=n,e.getSource(rn)?.setData({type:"FeatureCollection",features:[]}),null;try{ie=await O(`/api/places/${encodeURIComponent(t)}`)}catch{return ie=null,on=null,null}return on=null,e.getSource(rn).setData(vd(ie)),e.flyTo({center:[ie.lon,ie.lat],zoom:13}),ie}function hi(e,t){ii=t,e.setLayoutProperty(si,"visibility",t?"visible":"none"),e.setLayoutProperty(ye,"visibility",t?"visible":"none")}function Ed(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${c(e.key)}">
      <span class="place-name">${c(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Td="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function yi(e,t,n,o){let r=fd(e,t).map(s=>Ed(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${gd}</p>
    ${o==="service"?`<p class="note">${Td}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function bi(e,t){return e?`<div class="lg-head"><b>${c(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${c(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Dd(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Pd(e,t,n,o){let r=te.map((l,m)=>({band:l,prevMax:m===0?0:te[m-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:m})=>{let g=Dd(l,m);return[`<div class="lg-row lg-static">
          <i style="background:${B};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${c(g)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${I};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${c(g)} more trips</span></div>`]}).join(""),s=o?$d(o,n):[],a=kd(s),i=a?`<div class="lg-foot">${c(a)}</div>`:"";return`
    ${bi(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${c(ai[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Si({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return Pd(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=ee.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${he[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${c(i.label)} of the place's own residents ${c(s)}</span>
    </div>`).join("");return`
    ${bi(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${c(s)}</div>
    ${a}
    <div class="lg-row lg-static"><i style="background:${he.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${he.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Od(e,t){let n=e[le(t,"now")],o=e[le(t,"proposed")],r=e[le(t,"pct")],s=e[le(t,"rail_proposed")],a=ai[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function wi(e,t,n){if(t==="service")return`<b>${c(e.place)}</b> <span class="muted">\xB7 ${c(e.kind)}</span><br>
      ${Od(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${c(e.place)}</b> <span class="muted">\xB7 ${c(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=ri("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?ri("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${c(e.place)}</b> <span class="muted">\xB7 ${c(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function ri(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${pd} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var $i=["discontinued","new","reshaped","one-to-one"],_i={discontinued:["discontinued"],new:["new"],reshaped:["split","merged"],"one-to-one":["one-to-one"]},jo=["one-to-one"];function mn(e){return $i.includes(e)}function Go(e){return $i.filter(t=>e.includes(t))}var Wo="status",Md={status:"What happened",service:"How much service"};function gn(e){return e==="status"||e==="service"}var dt=["gone","halved","less","same","more","doubled","new"],Yo={gone:"loses all service",halved:"halved or worse",less:"less service",same:"about the same",more:"more service",doubled:"doubled or better",new:"new service",none:"no service either way"},Cd={gone:1.7,halved:1.35,less:1,same:.75,more:1,doubled:1.35,new:1.7,none:.75};function fn(e){return dt.includes(e)}function Ko(e){return dt.filter(t=>e.includes(t))}var vi="#8e44ad",ki={discontinued:B,new:I,split:vi,merged:vi,"one-to-one":Ee},Jo={discontinued:"discontinued",new:"new",split:"split",merged:"merged","one-to-one":"one-to-one"},Ad=["discontinued","new","split","merged","one-to-one"],Fd="route-changes",Hd=.12,xi=.9,Ei=1,Nd=/^[cp]:[\w-]{1,64}$/;function Ti(e){return Nd.test(e)}var Fe={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Bd={current:"today",proposed:"proposed"},Di=" \u2192 ",dn="\u2014";function an(e,{named:t=!0}={}){return e.length===0?dn:e.map(n=>t&&n.name?`${n.route} ${n.name}`:n.route).join(", ")}function pt(e,{farSideNamed:t=!0}={}){return e.current.length===0?an(e.proposed):e.proposed.length===0?an(e.current):`${an(e.current)}${Di}${an(e.proposed,{named:t})}`}function pn(e){if(e===null)return dn;let t=Math.round(e);return t===0?"0%":t>0?`+${t}%`:`\u2212${Math.abs(t)}%`}function Id(e){let t=Object.fromEntries(Ad.map(n=>[n,0]));for(let n of e)t[n.status]+=1;return t}var Pi="routechange",ce="routechange-lines",mt="routechange-arrows",hn="routechange-selected",yn="routechange-selected-lines",Vo="routechange-selected-plan",zo="routechange-selected-arrows",Ud=[ce,mt,yn,Vo,zo],qo=[Vo,yn,ce],jd=[0,2.5],Ri={current:["==",["get","side"],"current"],proposed:["==",["get","side"],"proposed"]},No="routechange-arrow",Ho=2.6,Gd=1.5,Wd=2.8,Oi={bucket:"none",pct_trips:null};function Bo(e,t,n,o,r){return{type:"Feature",geometry:{type:"LineString",coordinates:e.points},properties:{key:e.key,side:e.side,route:e.route,name:e.name,status:e.status,pattern_id:e.pattern_id,color:t,sort:n,w:o,bucket:r.bucket,scolor:se[r.bucket].color,sw:Cd[r.bucket],pct:r.pct_trips}}}function Yd(e){let t=new Map(e.groups.map(o=>[o.key,o.service[e.day]]));return{type:"FeatureCollection",features:e.features.map(o=>Bo(o,ki[o.status],o.status==="one-to-one"?0:1,1,t.get(o.key)??Oi)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Kd(e){let t=e.service[e.day]??Oi;return{type:"FeatureCollection",features:e.features.map(o=>o.side==="current"?Bo(o,De,0,Wd,t):Bo(o,lt,1,Gd,t)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Jd(e){let t=1/0,n=1/0,o=-1/0,r=-1/0;for(let s of e)for(let[a,i]of s.points)a<t&&(t=a),a>o&&(o=a),i<n&&(n=i),i>r&&(r=i);return Number.isFinite(t)?[[t,n],[o,r]]:null}function Vd(e){if(e.length===0)return null;let t=e.flatMap(n=>_i[n]);return["!",["in",["get","status"],["literal",t]]]}function zd(e){return e.length===0?null:["!",["in",["get","bucket"],["literal",[...e]]]]}var Io={status:{color:"color",width:"w"},service:{color:"scolor",width:"sw"}};function Xo(e){let t=n=>["*",["get",Io[e].width],n];return["interpolate",["linear"],["zoom"],9,t(Ho*.5),14,t(Ho),16,t(Ho*1.6)]}function qd(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function Li(e,t,n,o,r,s){e.addSource(t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:n,type:"line",source:t,layout:{visibility:"none","line-cap":"round","line-join":"round","line-sort-key":["get","sort"]},paint:{"line-color":["get","color"],"line-width":Xo("status"),"line-opacity":s}},r),e.addLayer({id:o,type:"symbol",source:t,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":140,"symbol-sort-key":["get","sort"],"icon-image":No,"icon-size":["interpolate",["linear"],["zoom"],12,.45,16,.8],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"],"icon-opacity":s}},r)}function Mi(e,t){e.hasImage(No)||e.addImage(No,qd(),{pixelRatio:2,sdf:!0}),Li(e,Pi,ce,mt,t,xi),Li(e,hn,yn,zo,t,Ei),Xd(e,t),Ue(e)}function Xd(e,t){e.setFilter(yn,Ri.current),e.addLayer({id:Vo,type:"line",source:hn,filter:Ri.proposed,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Xo("status"),"line-opacity":Ei,"line-dasharray":jd}},zo)}var cn=null,Ae=null,Ci=!1,He=new Set(jo),Ne=new Set,Zo=Wo;function Qo(){return cn?.groups??null}function be(){return Ae}function Be(){return Ci}function Zd(e){return`/api/route_changes?day=${e}`}function Qd(e,t){return`/api/route_changes/${encodeURIComponent(e)}?day=${t}`}async function er(e,t){if(!E.includes(t))throw new Error(`no such day type: ${t}`);return cn=await q(Zd(t)),e.getSource(Pi).setData(Yd(cn)),cn}async function tr(e,t,n,{fly:o=!0}={}){try{Ae=await q(Qd(t,n))}catch{return nr(e),null}e.getSource(hn).setData(Kd(Ae)),Ai(e,!0);let r=Jd(Ae.features);return o&&r&&e.fitBounds(r,{padding:60,maxZoom:14}),Ae}function nr(e){Ae=null,e.getSource(hn)?.setData({type:"FeatureCollection",features:[]}),e.getLayer(ce)&&Ai(e,!1)}function Ai(e,t){let n=t?Hd:xi;e.setPaintProperty(ce,"line-opacity",n),e.setPaintProperty(mt,"icon-opacity",n)}function bn(){return Go([...He])}function Fi(e,t){He.has(t)?He.delete(t):He.add(t),Ue(e)}function or(e,t){He.clear();for(let n of t)He.add(n);Ue(e)}function Sn(){return Ko([...Ne])}function Hi(e,t){Ne.has(t)?Ne.delete(t):Ne.add(t),Ue(e)}function rr(e,t){Ne.clear();for(let n of t)Ne.add(n);Ue(e)}function Ie(){return Zo}function sr(e,t){Zo=t,e.setPaintProperty(ce,"line-color",["get",Io[t].color]),e.setPaintProperty(ce,"line-width",Xo(t)),e.setPaintProperty(mt,"icon-color",["get",Io[t].color]),Ue(e)}function Ue(e){let t=Zo==="status"?Vd(bn()):zd(Sn());e.setFilter(ce,t),e.setFilter(mt,t)}function Ni(e,t){Ci=t;for(let n of Ud)e.setLayoutProperty(n,"visibility",t?"visible":"none")}var ep="A route group is PRT\u2019s own mapping of today\u2019s route numbers onto the plan\u2019s \u2014 the routes it says replace each other. It is not a corridor: a street can lose one group\u2019s buses and gain another\u2019s, and only the location, surface and street views can see that.";function Bi(){return` <button class="howto" data-caveat="${Fd}">method</button>`}var Ii={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function tp(e,t){if(e.current.length===0||e.proposed.length===0)return"";let n=e.service[t].pct_trips,o=`${Ii[t]} trips, today to plan`;return`<span class="rc-pct ${Uo(n)}" title="${c(o)}">${pn(n)}</span>`}function Uo(e){return e===null||Math.round(e)===0?"flat":e>0?"up":"down"}function np(e,{reading:t,day:n}){let o=c(pt(e,{farSideNamed:!1}));return t==="service"?`<span class="rc-map" style="color:${se[e.service[n].bucket].color}">${o}</span>`:`<span class="${e.status==="one-to-one"?"rc-map":`rc-map ${e.status}`}">${o}</span>`}function Ui(e,t,n){return`
    <button type="button" class="rc-row${t?" selected":""}"
            data-select-route="${c(e.key)}">
      ${np(e,n)}
      ${tp(e,n.day)}
    </button>`}function un(e,t,n,o){return`
    <div class="scope-head">${c(e)} (${t.length})</div>
    <div class="rc-list">${t.map(r=>Ui(r,r.key===n,o)).join("")}</div>`}function op(e){return e.charAt(0).toUpperCase()+e.slice(1)}function ji(e,t,n={reading:"status",day:"weekday"}){let o=`
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${e.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${ep}${Bi()}</p>`;if(n.reading==="service")return o+rp(e,t,n);let r=a=>e.filter(i=>a.includes(i.status)),s=r(["one-to-one"]);return`${o}
    ${un("Discontinued",r(["discontinued"]),t,n)}
    ${un("New",r(["new"]),t,n)}
    ${un("Split or merged",r(["split","merged"]),t,n)}
    <details class="svc rc-kept">
      <summary>One-to-one (${s.length}) \u2014 one number on each side; how its service changed</summary>
      <div class="rc-list">${s.map(a=>Ui(a,a.key===t,n)).join("")}</div>
    </details>`}function rp(e,t,n){let o=a=>e.filter(i=>i.service[n.day].bucket===a),r=o("none").length,s=r===0?"":`
    <p class="muted rc-idle">${r} group${r===1?" runs":"s run"} on neither network on ${c(Fe[n.day])},
      so ${r===1?"it has":"they have"} no line to draw.</p>`;return`
    <div class="muted rc-by">Grouped by ${c(Ii[n.day])} trips, today \u2192 plan</div>
    ${dt.map(a=>{let i=o(a);return i.length?un(op(Yo[a]),i,t,n):""}).join("")}
    ${s}`}function sp(e,t){return`
    <tr><th>${e}</th>
      <td class="n">${t.cur_trips.toLocaleString()}</td>
      <td class="n">${t.prop_trips.toLocaleString()}</td>
      <td class="n ${Uo(t.pct_trips)}">${pn(t.pct_trips)}</td>
      <td class="n">${t.cur_hours.toFixed(1)}</td>
      <td class="n">${t.prop_hours.toFixed(1)}</td>
      <td class="n ${Uo(t.pct_hours)}">${pn(t.pct_hours)}</td></tr>`}function ap(e){return e.prt.length===0?'<p class="muted">PRT\u2019s table has no row for this group.</p>':e.prt.map(n=>{let o=n.related_routes?`<div class="muted">PRT points riders to: ${c(n.related_routes)}</div>`:"",r=n.route_page?`<div><a class="link" href="${c(n.route_page)}" target="_blank" rel="noopener">PRT\u2019s page for this route \u2197</a></div>`:"";return`<div class="rc-prt">
      <div><b>${c(n.current_route||dn)}${Di}${c(n.final_route||dn)}</b>
        <span class="rc-cat">${c(n.category)}</span></div>
      ${o}${r}</div>`}).join("")}function Gi(e){let t=e.status==="new"?"":`
    <p class="rc-riders">${Math.round(e.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">\xB7 WPRDC route ridership, average weekday</span></p>`;return`
    <button type="button" class="link rc-back" data-select-route="">\u2190 All routes</button>
    <div class="place-head">
      <h2>${c(pt(e))}</h2>
      <span class="rc-status ${c(e.status)}">${c(Jo[e.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today \u2192 plan</th>
        <th class="n" colspan="3">revenue hours today \u2192 plan</th></tr></thead>
      <tbody>${E.map(n=>sp(n,e.service[n])).join("")}</tbody>
    </table>
    ${t}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today\u2019s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT\u2019s own account, from its route crosswalk.</p>
    ${ap(e)}

    <p class="note">This is a route group, not a corridor. One group\u2019s loss
      can be another group\u2019s gain: Carrick\u2019s 51 reads as \u221210% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${Bi()}</p>`}function ip(e,t){return`<div class="lg-row lg-static"><i style="background:${e};border-radius:2px"></i>
    <span class="lg-lab">${t}</span></div>`}function lp(e,t){return`<div class="lg-row lg-static"><i class="lg-dotted" style="border-color:${e}"></i>
    <span class="lg-lab">${t}</span></div>`}function Wi(e,t,n,o,r,s){return`
    <button class="lg-row ${s?"off":""}" ${e}="${t}"
            aria-pressed="${!s}">
      <i style="background:${n};border-radius:2px"></i>
      <span class="lg-lab">${o}</span>
      <span class="lg-n">${r}</span>
    </button>`}function ln(e,t,n,o){let r=ki[_i[e][0]];return Wi("data-route-bucket",e,r,t,n,o.includes(e))}function cp(e,t,n){return Wi("data-route-service",e,se[e].color,Yo[e],t,n.includes(e))}function Yi(e){return`
    <div class="seg lg-weight" role="group" aria-label="Colour the routes by">
      ${["status","service"].map(n=>`
        <button data-route-reading="${n}" aria-pressed="${e===n}"
                class="${e===n?"active":""}">${Md[n]}</button>`).join("")}
    </div>`}function up(e,t){let n=Object.fromEntries([...dt,"none"].map(o=>[o,0]));for(let o of e)n[o.service[t].bucket]+=1;return n}function dp(e,t,n){let o=up(e,t),r=o.gone+o.halved+o.less,s=o.more+o.doubled+o.new,a=`${e.length.toLocaleString()} route groups \xB7 ${r} fewer trips \xB7 ${o.same} about the same \xB7 ${s} more \xB7 ${Fe[t]}`;return`
    <div class="lg-head"><b>${c(a)}</b></div>
    ${Yi("service")}
    ${dt.filter(i=>o[i]>0).map(i=>cp(i,o[i],n)).join("")}
    <div class="lg-foot">Each group\u2019s trips today \u2192 plan on ${c(Fe[t])}, in the
      Stop-by-stop key\u2019s buckets and colours \u2014 a \xB110% band around no change.
      Route by route, which is not how access is measured: a group is
      not a corridor, and the 51 reads fewer trips while the new 45 runs much
      of the same street. Click a row to show or hide its lines; click a line to
      select its group.</div>`}function Ki({groups:e,day:t,hidden:n,serviceHidden:o,reading:r,selected:s}){if(s)return`
      <div class="lg-head"><b>${c(pt(s))}</b>
        <span class="muted">\xB7 ${c(Jo[s.status])} \xB7 ${c(Fe[t])}</span></div>
      ${ip(De,"today's alignment")}
      ${lp(lt,"proposed alignment")}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;if(!e)return'<div class="lg-head"><b>Route changes</b></div>';if(r==="service")return dp(e,t,o);let a=Id(e),i=a.split+a.merged,l=`${e.length.toLocaleString()} route groups \xB7 ${a.discontinued} discontinued \xB7 ${a.new} new \xB7 ${i} split or merged \xB7 ${Fe[t]}`;return`
    <div class="lg-head"><b>${c(l)}</b></div>
    ${Yi("status")}
    ${ln("discontinued","discontinued \u2014 today\u2019s alignment",a.discontinued,n)}
    ${ln("new","new \u2014 proposed alignment",a.new,n)}
    ${ln("reshaped","split or merged \u2014 proposed alignment",i,n)}
    ${ln("one-to-one","one-to-one \u2014 proposed alignment",a["one-to-one"],n)}
    <div class="lg-foot">A route group is PRT\u2019s own mapping of today\u2019s
      numbers onto the plan\u2019s, not a corridor. Patterns are the ones that
      run on ${c(Fe[t])}. Click a row to show or hide its lines;
      click a line to select its group.</div>`}function Ji(e,{selected:t,reading:n="status"}){let o=c(e.name?`${e.route} ${e.name}`:e.route),r=c(Bd[e.side]),s=c(Jo[e.status]),a=n==="service"?` \xB7 ${c(Yo[e.bucket])}${e.pct===null?"":` (${pn(e.pct)} trips)`}`:"";return t?`${o} \xB7 <b>${r}</b> \xB7 ${s}${a}`:`<b>${o}</b> \xB7 ${r} \xB7 ${s}${a}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",period:"period",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes",route:"route",routeHidden:"routehide",routeReading:"routecolor",serviceHidden:"servicehide",drawnRoute:"drawn"},qi=":",pp=/^[cp]:[\w.:-]{1,32}$/,wn={any:"any",selected:"selected"},mp="pin",Vi=5,Xi="none",vn=",";function Zi(e){try{return e.self!==e.top}catch{return!0}}function Qi(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?wn.selected:wn.any),t.set(b.dest,"key"in e.dest?e.dest.key:ar(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.period!==R&&t.set(b.period,e.period),e.at&&t.set(b.at,ar(e.at)),e.camera&&t.set(b.camera,`${ar(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(b.place,e.place),e.placeFill!==Ce&&t.set(b.placeFill,e.placeFill),e.selection.length&&t.set(b.selection,e.selection.join(",")),t.set(b.stopRoutes,e.stopRoutes??zt),e.route&&t.set(b.route,e.route),e.routeHidden&&!gp(e.routeHidden,jo)&&t.set(b.routeHidden,e.routeHidden.length?e.routeHidden.join(vn):Xi),e.routeReading&&e.routeReading!==Wo&&t.set(b.routeReading,e.routeReading),e.serviceHidden?.length&&t.set(b.serviceHidden,e.serviceHidden.join(vn)),e.drawnRoute&&t.set(b.drawnRoute,`${e.drawnRoute.side}${qi}${e.drawnRoute.route_id}`),`?${t}`}function el(e){let t=new URLSearchParams(e),n={},o=t.get(b.view);o&&Fa.includes(o)&&(n.view=o);let r=t.get(b.day);r&&E.includes(r)&&(n.day=r);let s=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(b.period);(a===R||a&&ze.includes(a))&&(n.period=a);let i=t.get(b.oneSeatDay);i===wn.selected?n.oneSeatRestricted=!0:i===wn.any&&(n.oneSeatRestricted=!1);let l=t.get(b.dest);if(l&&l!==mp){let M=zi(l);M?n.dest=M:l.includes(",")||(n.dest={key:l})}let m=zi(t.get(b.at));m&&(n.at=m);let g=hp(t.get(b.camera));g&&(n.camera=g);let y=t.get(b.place);y&&(n.place=y);let h=t.get(b.selection);h!==null&&(n.selection=h.split(",").filter(M=>pp.test(M)));let S=t.get(b.placeFill);(S==="lost"||S==="gained"||S==="service")&&(n.placeFill=S);let _=t.get(b.stopRoutes);(_==="off"||_==="current"||_==="proposed")&&(n.stopRoutes=_);let p=t.get(b.route);p&&Ti(p)&&(n.route=p);let $=t.get(b.routeHidden);if($===Xi)n.routeHidden=[];else if($){let M=Go($.split(vn).filter(mn));M.length&&(n.routeHidden=M)}let P=t.get(b.routeReading);P&&gn(P)&&(n.routeReading=P);let W=t.get(b.serviceHidden);if(W){let M=Ko(W.split(vn).filter(fn));M.length&&(n.serviceHidden=M)}let H=fp(t.get(b.drawnRoute));return H&&(n.drawnRoute=H),n}function gp(e,t){return e.length===t.length&&e.every((n,o)=>n===t[o])}function fp(e){if(!e)return null;let t=e.indexOf(qi);if(t<0)return null;let n=e.slice(0,t),o=e.slice(t+1);return n!=="current"&&n!=="proposed"||!o?null:{side:n,route_id:o}}function ar(e){return`${e.lat.toFixed(Vi)},${e.lon.toFixed(Vi)}`}function zi(e){let t=tl(e,2);return t?{lat:t[0],lon:t[1]}:null}function hp(e){let t=tl(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function tl(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var ir="embed";var yp=["1","true","yes"];function nl(e){let t=new URLSearchParams(e).get(ir);return t!==null&&yp.includes(t.toLowerCase())}function ol(e){let t=new URLSearchParams(e);return t.set(ir,"1"),`?${t}`}function rl(e){let t=new URLSearchParams(e);t.delete(ir);let n=String(t);return n?`?${n}`:""}function sl(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var al="{view}";function il(e,t){return e.includes(al)?e.replace(al,encodeURIComponent(t)):null}var ue=["peek","half","full"],bp=192,Sp=.3,wp=.55,vp=.9,Rp=.6,Lp=.45;function Rn(e,t){return e==="peek"?Math.min(bp,t*Sp):e==="half"?t*wp:t*vp}function $p(e,t,n=0){let o=ue.map(s=>Math.abs(Rn(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>Rp&&(r=Math.max(0,Math.min(ue.length-1,r+(n>0?1:-1)))),ue[r]}function ll(e){return ue[(ue.indexOf(e)+1)%ue.length]}function _p(e,t){return Math.min(e,t*Lp)}function je(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function lr(e){let t=null,n=()=>{let o=je();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var kp=8,xp=400;function cl(e){let t=d("side"),n=d("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,l={y:0,t:0};function m(){return window.innerHeight}function g(p){t.style.height=`${p}px`,e.onMove(p,_p(p,m()))}function y(p){o=p,t.dataset.snap=p,g(Rn(p,m()))}n.addEventListener("pointerdown",p=>{je()&&(r=!0,s=p.clientY,a=t.getBoundingClientRect().height,i=p.timeStamp,l={y:p.clientY,t:p.timeStamp},t.classList.add("dragging"),n.setPointerCapture(p.pointerId))}),n.addEventListener("pointermove",p=>{if(!r)return;let $=a+(s-p.clientY),P=Rn("peek",m()),W=Rn("full",m());g(Math.max(P,Math.min(W,$))),l={y:p.clientY,t:p.timeStamp}});function h(p){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(p.clientY-s)>kp)&&p.timeStamp-i<xp){y(ll(o));return}let P=p.timeStamp-l.t,W=P>0?(l.y-p.clientY)/P:0;y($p(t.getBoundingClientRect().height,m(),W))}n.addEventListener("pointerup",h),n.addEventListener("pointercancel",h),n.addEventListener("keydown",p=>{p.key!=="Enter"&&p.key!==" "||(p.preventDefault(),je()&&y(ll(o)))});let S=lr(e.onLayoutChange);function _(){if(S(),!je()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}y(o)}return window.addEventListener("resize",_),_(),{at:()=>je()?o:"full",atLeast(p){je()&&ue.indexOf(p)>ue.indexOf(o)&&y(p)}}}var Ep=["llvmpipe","swiftshader","softpipe","basic render","software"];function cr(e){if(!e)return!1;let t=e.toLowerCase();return Ep.some(n=>t.includes(n))}function dl(e){let t=cr(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function pl(e){return cr(e.renderer)?0:Tp}var Tp=300,Dp="https://tiles.openfreemap.org/styles/positron",Pp=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],ul=[],Op=19,Mp='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Cp=!1;function ml(e){return!Cp||!cr(e.renderer)?Dp:Ap()}function Ap(){let e=o=>({type:"raster",tileSize:256,attribution:Mp,tiles:o,maxzoom:Op}),t={basemap:e(Pp)},n=[{id:"basemap",type:"raster",source:"basemap"}];return ul.length&&(t["basemap-labels"]=e(ul),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function gl(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Fp(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function fl(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),r=null,s="",a=l=>{s!==l&&(s=l,e.getCanvas().style.cursor=l)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",l=>{let m=n.map($=>$.layer).filter($=>e.getLayer($)&&e.getLayoutProperty($,"visibility")!=="none");if(!m.length){i();return}let[g,...y]=e.queryRenderedFeatures(l.point,{layers:m});if(!g){i();return}a("pointer");let h=Fp(g);if(h===r)return;let S=o.get(g.layer?.id),_=S?S.html(g,y):null;if(_==null){r=null,t.remove();return}r=h;let p=S.anchor?S.anchor(g,l):l.lngLat;t.setLngLat(p).setHTML(_).addTo(e)}),e.on("mouseout",i),i}function Hp(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function Np(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var Bp="seg-current",hl="dd",Ip="open",yl="armed";function Up(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(yl)}));return Hp(t)}function bl(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let l=a===n;i.group.classList.toggle(Ip,l),i.trigger.setAttribute("aria-expanded",String(l))}},r=s=>o(Np(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let l=s.id||`controls-${a}`,m=s.querySelector(".lbl")?.textContent??"",g=document.createElement("button");g.type="button",g.className=Bp,g.setAttribute("aria-haspopup","true"),g.setAttribute("aria-expanded","false");let y=document.createElement("div");y.className=hl,i.replaceWith(y),y.append(g,i);let h=()=>{let S=Up(i);g.textContent=S.label,g.disabled=S.disabled,g.classList.toggle(yl,S.armed),g.setAttribute("aria-label",m?`${m}: ${S.label}`:S.label)};h(),new MutationObserver(h).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),g.addEventListener("click",()=>{r({kind:"trigger",group:l}),n===l&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",S=>{if(!S.target.closest("button"))return;let _=n===l;r({kind:"pick"}),_&&g.focus()}),t.set(l,{group:s,trigger:g,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${hl}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var Sl="draft-stops-notice-dismissed-v1";function wl(e){if(e.embedded)return!1;try{return e.storage?.getItem(Sl)!=="1"}catch{return!0}}function vl(e){try{e?.setItem(Sl,"1")}catch{}}function Rl(){try{return window.localStorage}catch{return null}}var jp=[-79.9959,40.4406],Gp=12,Wp="#e2574c",Ln=5,C={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},ft=el(location.search),Ye=nl(location.search);Ye&&d("app").classList.add("embed");{let e=Rl(),t=d("notice");wl({embedded:Ye,storage:e})&&(t.addEventListener("close",()=>vl(e)),t.showModal())}var Yp={at:()=>"full",atLeast(){}},El=null,A=400,gt=null,L=null,pe=null,ve=0,D={key:"downtown"},Se=null,Tl=!1,Ke=!1,Pn="locations",Je="area",F=R,G=zt,ur=0,ne=null,Re=null,_n=0,V="point",Dl=60,Pl=15;function kn(){return G==="off"?"current":G}var Ol="count",Tn=null,K=Ce,Le=null,J=!1,f="dots",gr,yr=[],fr=null,Ll=()=>{},dr=gl(),u=new maplibregl.Map({container:"map",style:ml(dr),pixelRatio:dl(dr),fadeDuration:pl(dr),renderWorldCopies:!1,center:ft.camera?[ft.camera.lon,ft.camera.lat]:jp,zoom:ft.camera?.zoom??Gp,cooperativeGestures:Zi(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{Er(u),Es(u),Ns(u,rt),Ws(u,rt),ea(u,"walk-fill"),La(u),Ma(u,Jt),Ja(u,qt),pi(u,rt),Mi(u,rt),x(),u.on("click",t=>{if(J)return;if(Tl){bt({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(f==="places"){let s=u.queryRenderedFeatures(t.point,{layers:[ye]})[0];s&&yt(s.properties.key);return}if(f==="routes"){let{x:s,y:a}=t.point,i=[[s-Ln,a-Ln],[s+Ln,a+Ln]],l=u.queryRenderedFeatures(i,{layers:qo})[0];l?(gr.atLeast("half"),hr(l.properties.key)):_l();return}let n=[...Tt,...jt].filter(s=>u.getLayoutProperty(s,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Mn(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});Ll=fl(u,e,[...Tr(t=>{let n=Dt(),o=t.find(r=>Tt.includes(r.layer?.id));return n&&o?ro(o.properties,v(),n.buckets,{pole:!1,period:F}):null}),...Tt.map(t=>({layer:t,html:n=>{let o=Dt();return o?ro(n.properties,v(),o.buckets,{period:F}):null},anchor:n=>n.geometry.coordinates})),...jt.map(t=>({layer:t,html:n=>{let o=Te();return o?sa(n.properties,o):null},anchor:n=>n.geometry.coordinates})),{layer:qt,html:t=>Eo(t.properties)},{layer:Wa,html:t=>Eo(t.properties)},...qo.map(t=>({layer:t,html:n=>Ji(n.properties,{selected:be()!==null,reading:Ie()})})),{layer:ye,html:t=>wi(t.properties,K,v())}]),fm(),u.on("moveend",()=>{let t=u.getCenter();El={lat:t.lat,lon:t.lng,zoom:u.getZoom()},w(),T()}),we(C.radius,t=>{A=Number(t.dataset.radius),Pt(u,A,v(),F).then(w),at()&&Ct(u,A,v(),F).then(w),At()&&uo(A).then(w),Te()&&xn(),L&&Ge(L.lat,L.lon)}),we(C.day,t=>{let n=t.dataset.day;qr(n),f!=="journey"&&x(),no(u,n),Dn(),um(),lo(u,n),f==="journey"&&L&&br(L.lat,L.lon),Nt()&&Ys(u,n).then(w),Ke&&Te()&&(xn(),L&&Ge(L.lat,L.lon)),ut()&&K==="service"&&sn(u,K,n),Be()&&rm(),w()}),we(C.oneSeatDay,t=>{Ke=t.dataset.oneseatDay==="selected",mr(),xn(),L&&Ge(L.lat,L.lon)}),we(C.view,t=>{let n=f;f=t.dataset.view,Ll(),(f==="journey"||f==="places"||f==="routes")&&vr(),ms(u,f==="dots"||f==="both"),Qp(f==="surface"||f==="both"),tm(f==="corridors"),lm(f==="oneseat"),am(f==="journey",n==="journey"),nm(f==="places"),om(f==="routes"),f!=="journey"&&n!=="journey"&&(f==="oneseat"||n==="oneseat")&&x({scrollToTop:!0}),sm(In(f)),Hl();let o=f==="oneseat"||f==="journey";d("dest-controls").classList.toggle("hidden",!o),d("oneseat-day-controls").classList.toggle("hidden",f!=="oneseat"),d("place-fill-controls").classList.toggle("hidden",f!=="places"),d("time-controls").classList.toggle("hidden",!im(f)),jl(),oe()||kl(!1),We(),mr(),o||En(!1),Al()}),we(C.dest,t=>{let n=t.dataset.dest;if(n==="pin"){En(!0);return}En(!1),bt({key:n})}),we(C.placeFill,t=>{K=t.dataset.placeFill,ut()&&sn(u,K,v()),x(),w(),mr()}),we(C.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=G!=="off"&&Xt()!==null;G=n,x(),o&&n!=="off"?(Oe(u,Xt(),n),U&&wr(U.radius)):Dn()}),d("period-select").addEventListener("change",t=>{F=t.target.value,x();let n=Pt(u,A,v(),F),o=at()?Ct(u,A,v(),F):Promise.resolve();Promise.all([n,o]).then(w),z(),T()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Pn=n.dataset.weight,w(),T();return}let o=t.target.closest("[data-surface-unit]");if(o){Je=o.dataset.surfaceUnit,em(Je),T();return}let r=t.target.closest("[data-route-bucket]");if(r&&mn(r.dataset.routeBucket)){Fi(u,r.dataset.routeBucket),w(),T();return}let s=t.target.closest("[data-route-service]");if(s&&fn(s.dataset.routeService)){Hi(u,s.dataset.routeService),w(),T();return}let a=t.target.closest("[data-route-reading]");if(a&&gn(a.dataset.routeReading)){sr(u,a.dataset.routeReading),w(),Be()&&x(),T();return}let i=t.target.closest("[data-bucket]");i&&(Ts(u,i.dataset.bucket,v()),w())}),d("legend-reset").addEventListener("click",()=>{if(Be()){Ie()==="service"?rr(u,[]):or(u,[]),w(),T();return}Ds(u,v()),w()}),d("legend-select").addEventListener("click",()=>kl(!J)),d("legend-clear").addEventListener("click",()=>{eo(u),We(),w(),T()}),d("legend-collapse").addEventListener("click",()=>{pr(!d("legend-box").classList.contains("collapsed"))}),d("route-key").addEventListener("click",t=>{t.target.closest("[data-clear-route]")&&Il()}),d("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&bt({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&bm(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&yt(r.dataset.selectPlace);let s=t.target.closest("[data-select-route]");if(s){let l=s.dataset.selectRoute;l?hr(l):_l()}let a=t.target.closest("[data-sort-places]");a&&(Ol=a.dataset.sortPlaces,x());let i=t.target.closest("[data-goto-place]");i&&(f!=="places"&&de(C.view,"places"),yt(i.dataset.gotoPlace))}),d("side-toggle").addEventListener("click",Xp),Ye&&lr(pr),gr=Ye?Yp:cl({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:pr}),Jp(),Vp(),bl(),z(),We(),On(),Kp(ft),Pt(u,A,v(),F).then(w),ym(),hm()});function we(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),z(),T()})})}function de(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Kp(e){e.radius!==void 0&&de(C.radius,String(e.radius)),e.day&&de(C.day,e.day),e.oneSeatRestricted!==void 0&&de(C.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Pn=e.weight),e.surfaceUnit&&(Je=e.surfaceUnit),e.period&&(F=e.period,d("period-select").value=e.period,z()),e.placeFill&&de(C.placeFill,e.placeFill),e.routeHidden&&or(u,e.routeHidden),e.serviceHidden&&rr(u,e.serviceHidden),e.routeReading&&sr(u,e.routeReading),e.dest&&("key"in e.dest?de(C.dest,e.dest.key):bt(e.dest)),e.selection&&ws(u,e.selection),e.stopRoutes&&de(C.stopRoutes,e.stopRoutes),e.view&&de(C.view,e.view),e.drawnRoute&&Nl(e.drawnRoute,{fit:!e.camera}),e.at&&Mn(e.at.lat,e.at.lon),e.place&&yt(e.place),e.route&&hr(e.route,{fly:!e.camera})}function T(){let e={view:f,day:v(),radius:A,oneSeatRestricted:Ke,weight:Pn,surfaceUnit:Je,period:F,dest:D,at:L,camera:El,place:Tn,placeFill:K,selection:ys(),stopRoutes:G,route:Le,routeHidden:bn(),routeReading:Ie(),serviceHidden:Sn(),drawnRoute:ne},t=Qi(e);history.replaceState(null,"",(Ye?ol(t):t)+location.hash),On(t),Ml()}function On(e=rl(location.search)){if(!Ye)return;let t=d("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f==="routes"?be()?pt(be()):null:L?pe?tt(pe):"this point":null;t.querySelector(".el-action").textContent=sl(n)}function Ml(){let e=d("report-link"),t=fr&&il(fr,location.href);if(!t){e.classList.add("hidden");return}e.classList.remove("hidden"),e.href=t}function z(){d("statebar").innerHTML=V==="route"&&ne&&Re?Ia({short_name:Re.short_name,side:ne.side,day:v()}):Na({view:f,day:v(),radius:A,oneSeatRestricted:Ke,destination:St(),stopRoutes:G,period:F}),qp()}function pr(e){d("legend-box").classList.toggle("collapsed",e);let t=d("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Jp(){d("controls-toggle").addEventListener("click",()=>{ht(!d("app").classList.contains("controls-open"))}),d("controls-scrim").addEventListener("click",()=>ht(!1)),document.addEventListener("keydown",e=>{e.key==="Escape"&&ht(!1)})}function ht(e){d("app").classList.toggle("controls-open",e),d("controls-toggle").setAttribute("aria-expanded",String(e))}function Vp(){let e=ni({elements:{group:d("search-controls"),input:d("search-input"),list:d("search-results"),opener:d("search-toggle")},search:async t=>{let{url:n,init:o}=Qa(t),r=await fetch(n,o);if(!r.ok)throw new Error(r.statusText);return r.json()},onPick:t=>{switch(ht(!1),t.kind){case"stop":$l(t.stop);break;case"address":$l(t.address);break;case"place":zp(t.place);break;case"route":Nl({side:t.route.side,route_id:t.route.route_id},{fit:!0});break}}});d("search-toggle").addEventListener("click",()=>{ht(!0),e.focus()})}function $l(e){let t=u.getBounds(),n=ti({zoom:u.getZoom(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()}},e);n&&u.easeTo({center:[n.lon,n.lat],zoom:n.zoom}),f!=="places"&&Mn(e.lat,e.lon)}function zp(e){u.fitBounds(e.bbox,{padding:Dl,maxZoom:Pl}),f==="places"&&yt(e.key)}function qp(){d("controls-toggle").firstChild?.remove(),d("controls-toggle").prepend(document.createTextNode(Ha(f)))}function Xp(){let e=d("app").classList.toggle("side-collapsed"),t=d("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function w(){Zp()}function Zp(){if(d("legend-reset").classList.toggle("hidden",mo()||yo()||Ro()||ut()||!(oe()||Be())),Ro()){d("legend").innerHTML=Ea(Vt());return}if(Be()){d("legend").innerHTML=Ki({groups:Qo(),day:v(),hidden:bn(),serviceHidden:Sn(),reading:Ie(),selected:be()});return}if(ut()){d("legend").innerHTML=Si({selected:li(),fill:K,day:v(),boundaries:Fo(),unchanged:ci()});return}if(mo()){let n=Nt();n&&ua(d("legend"),n);return}if(yo()){let n=Te();if(!n)return;let o=u.getBounds();da(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Dt();if(!e)return;let t=u.getBounds();ma(d("legend"),{layer:e,day:v(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Pn,dots:oe(),surface:io()?at():null,unit:Je,population:At(),selection:hs(),period:F})}async function Qp(e){if(e&&!at()){d("legend").classList.add("loading");try{await Ct(u,A,v(),F)}finally{d("legend").classList.remove("loading")}}Bs(u,e),e&&Je==="people"&&await Cl(),w()}async function Cl(){if(!At()){d("legend").classList.add("loading");try{await uo(A)}finally{d("legend").classList.remove("loading")}}}async function em(e){e==="people"&&io()&&await Cl(),w()}async function tm(e){if(e&&!Nt()){d("legend").classList.add("loading");try{await go(u,v())}finally{d("legend").classList.remove("loading")}}Ks(u,e),w()}async function nm(e){if(e&&(!Ao()||!Fo())){d("legend").classList.add("loading");try{await Promise.all([mi(),gi(u)])}finally{d("legend").classList.remove("loading")}}hi(u,e),e&&sn(u,K,v()),e&&x(),w()}async function yt(e){Tn=await Ve(()=>fi(u,e))?e:null,f==="places"&&(x(),Tn&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),w(),T()}async function om(e){e&&await Ve(()=>er(u,v())),Ni(u,e),e&&x({scrollToTop:!0}),w()}async function hr(e,{fly:t=!0}={}){Le=await Ve(()=>tr(u,e,v(),{fly:t}))?e:null,f==="routes"&&x({scrollToTop:!0}),w(),T()}function _l(){!Le&&!be()||(nr(u),Le=null,f==="routes"&&x({scrollToTop:!0}),w(),T())}async function rm(){await Ve(async()=>{await er(u,v()),Le&&await tr(u,Le,v(),{fly:!1})}),f==="routes"&&x(),w()}function sm(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function x({scrollToTop:e=!1}={}){if(e&&(d("panel").scrollTop=0),On(),f==="places"){d("panel").innerHTML=yi(Ao()??[],Ol,Tn,K);return}if(f==="routes"){let t=be();d("panel").innerHTML=t?Gi(t):ji(Qo()??[],Le,{reading:Ie(),day:v()});return}if(V==="route"&&ne){d("panel").innerHTML=Re?za(Re):mm();return}if(!pe){f==="oneseat"?d("panel").innerHTML=cs(St()):Xr(d("panel"));return}if(f==="oneseat"){let t=ls(pe,D,v());if(t){d("panel").innerHTML=t;return}}is(pe,{withKerb:oe(),routes:G,period:F})}function am(e,t=!1){if($a(u,e),w(),!e){t&&(L?Ge(L.lat,L.lon):x());return}Vt()&&L?d("panel").innerHTML=$o(Vt(),St()):d("panel").innerHTML=xa(St())}async function br(e,t){let n=++ve;L={lat:e,lon:t},vr(),T(),Ul(e,t);let o=Fl(),r=c(St());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await O(_a({lat:e,lon:t},o,v()));if(n!==ve)return;Lo(u,s),d("panel").innerHTML=$o(s,r),w(),On()}catch(s){if(n!==ve)return;Lo(u,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function mr(){d("day-controls").classList.toggle("hidden",!oa(f,Ke,K))}function im(e){return e==="dots"||e==="surface"||e==="both"}function Sr(){return na(Ke,v())}async function lm(e){e&&!Te()&&await Ve(()=>bo(u,A,D,Sr())),ra(u,e),w()}async function xn(){await Ve(()=>bo(u,A,D,Sr())),w()}async function Ve(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function bt(e){if(D=e,En(!1),cm(),Al(),z(),T(),f==="journey"){L&&br(L.lat,L.lon),w();return}L?Ge(L.lat,L.lon):x({scrollToTop:!0}),xn()}function Al(){let e=Fl();if(!(e!==null&&(f==="journey"||f==="oneseat"&&"lat"in D))){Se?.remove(),Se=null;return}Se?Se.setLngLat([e.lon,e.lat]).addTo(u):(Se=new maplibregl.Marker({color:fo,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),Se.on("dragend",()=>{let n=Se.getLngLat();bt({lat:n.lat,lon:n.lng})}))}function cm(){let e=ta(D);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Fl(){if("lat"in D)return{lat:D.lat,lon:D.lon};let e=D.key,t=yr.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function St(){if("lat"in D)return`${D.lat.toFixed(4)}, ${D.lon.toFixed(4)}`;let e=D.key;return yr.find(t=>t.key===e)?.name??e}function En(e){Tl=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Ge(e,t){let n=++ve;L={lat:e,lon:t},vr(),T(),d("panel").classList.add("loading"),Ul(e,t),Un(u),Oe(u,null,kn()),d("pin-key").classList.add("hidden");try{let o="lat"in D?`&dest_lat=${D.lat.toFixed(6)}&dest_lon=${D.lon.toFixed(6)}`:"",r=await O(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${A}${o}&oneseat_day=${Sr()}`);if(n!==ve)return;U={lat:e,lon:t,radius:A,now:r.current.stops,proposed:r.proposed.stops},pe=r,jl(),Hl(),x({scrollToTop:!0})}catch(o){if(n!==ve)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ve&&d("panel").classList.remove("loading")}}var U=null;function Hl(){if(!U||!In(f)){Un(u),d("pin-key").classList.add("hidden"),Dn();return}Dr(u,U.lat,U.lon,U.radius,U.now,U.proposed),wr(U.radius),Dn()}function Dn(){let e=++ur,t=()=>{U&&wr(U.radius)};G!=="off"&&oe()&&L&&pe?.kerb?O(Ca(L,v())).then(n=>{e===ur&&(Oe(u,n,kn()),Zt(u,!0),Aa(u),t())}).catch(()=>{e===ur&&(Oe(u,null,kn()),Zt(u,!1),t())}):(Oe(u,null,kn()),Zt(u,!1),t())}function wr(e){let t=G!=="off"&&Pa()&&Oa(Xt(),G)?G:!1;d("pin-key").innerHTML=pa(e,{routes:t}),d("pin-key").classList.remove("hidden")}function vr(){V!=="point"&&(V="point",z())}function Nl(e,{fit:t}){V="route",Bl(e,{fit:t})}function um(){ne&&Bl(ne,{fit:!1})}function dm(e,t){return e!==null&&e.side===t.side&&e.route_id===t.route_id}async function Bl(e,{fit:t}){let n=++_n;dm(ne,e)||(Re=null),ne=e,T(),z(),V==="route"&&x({scrollToTop:!0});try{let o=await O(Ya(e,v()));if(n!==_n)return;Re=o,Po(u,o),pm(o),t&&o.bbox&&u.fitBounds(o.bbox,{padding:Dl,maxZoom:Pl}),z(),V==="route"&&x({scrollToTop:!0})}catch(o){if(n!==_n)return;let r=V==="route";Il(),r&&(d("panel").innerHTML=`<div class="empty"><h2>No such route</h2>
        <p class="muted">${c(o.message)}</p></div>`)}}function Il(){_n++,ne=null,Re=null,Po(u,null),d("route-key").classList.add("hidden"),V==="route"&&(V="point",x({scrollToTop:!0})),z(),T()}function pm(e){d("route-key").innerHTML=Va(e),d("route-key").classList.remove("hidden")}function mm(){return`<div class="empty"><h2>Finding the route\u2026</h2>
    <p class="muted">Fetching its shapes and PRT's crosswalk row.</p></div>`}function Ul(e,t){gt?gt.setLngLat([t,e]):(gt=new maplibregl.Marker({color:Wp,draggable:!0}).setLngLat([t,e]).addTo(u),gt.on("dragend",()=>{let n=gt.getLngLat();Mn(n.lat,n.lng)}))}var $n=14;function oe(){return f==="dots"||f==="both"}function kl(e){J=e&&oe(),J?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=J?"none":"",J||Gl(),We()}function jl(){let e=oe()&&!!pe?.kerb;d("stop-routes-controls").classList.toggle("hidden",!e)}function We(){let e=d("legend-select");e.classList.toggle("hidden",!oe()),e.setAttribute("aria-pressed",String(J)),e.textContent=J?"Selecting":"Select stops",d("legend-clear").classList.toggle("hidden",!oe()||!bs())}function gm(e,t){let n=d("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!J}function xl(e){d("brush").classList.toggle("painting",e)}function Gl(){d("brush").hidden=!0}function fm(){let e=d("brush");e.style.width=`${$n*2}px`,e.style.height=`${$n*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,We(),w()}))},s=()=>{J&&(t=!0,n=!1,xl(!0))},a=l=>{if(gm(l.point.x,l.point.y),!t)return;n=!0,Qn(u,to(u,l.point.x,l.point.y,$n))&&r()},i=l=>{if(xl(!1),!!t){if(t=!1,!n){let[m]=to(u,l.point.x,l.point.y,$n);m&&Ss(u,m)}We(),w(),T()}};u.on("mousedown",s),u.on("mousemove",a),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",Gl),u.on("touchstart",s),u.on("touchmove",a),u.on("touchend",i)}function Mn(e,t){if(gr.atLeast("half"),f==="journey"){br(e,t);return}f!=="places"&&f!=="routes"&&Ge(e,t)}async function hm(){try{yr=await O("/api/destinations"),z()}catch{}}async function ym(){try{let e=await O("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;d("feedline").textContent=t,d("feedline-methods").textContent=t,d("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join(""),fr=e.feedback?.url_template??null,Ml()}catch{}}function bm(e){d("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
