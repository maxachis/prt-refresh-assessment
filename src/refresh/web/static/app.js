"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function P(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Dn=new Map;function Y(e){let t=Dn.get(e);if(t)return t;let n=P(e).catch(o=>{throw Dn.delete(e),o});return Dn.set(e,n),n}function l(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function we(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function On(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Pn(e){return e>0?`+${e}`:String(e)}function wr(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Kl="#15181e",vr="#ffa23a",Yl="#ffffff";function Jl(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let c=i/o*2*Math.PI;r.push([t+a*Math.cos(c),e+s*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function J(e){return{type:"FeatureCollection",features:e}}function Vl(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function zl(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function Mn(e){return e!=="corridors"&&e!=="journey"&&e!=="places"&&e!=="routes"}function Cn(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(J([]))}function Rr(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Lr(e){e.addSource("walk",{type:"geojson",data:J([])}),e.addSource("stops-now",{type:"geojson",data:J([])}),e.addSource("stops-prop",{type:"geojson",data:J([])}),e.addSource("stop-moves",{type:"geojson",data:J([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":vr,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Yl,"circle-stroke-width":3,"circle-stroke-color":vr}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Kl,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function $r(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>zl(n.properties,e(o))}))}function _r(e,t,n,o,r,s){e.getSource("walk").setData(J([Jl(t,n,o)])),e.getSource("stops-now").setData(J(Rr(r,"current"))),e.getSource("stops-prop").setData(J(Rr(s,"proposed"))),e.getSource("stop-moves").setData(J(Vl(s)))}var k=["weekday","saturday","sunday"],An=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],kr={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},gt=4,ft=6,xr=e=>ft+gt*e,Er=e=>ft+1+gt*e,Ke=e=>ft+2+gt*e,ql=e=>ft+3+gt*e,ht=2,Xl=3,Ye=4,Tr=5,ve=e=>e[Xl],A=(e,t)=>e[t],Dr=(e,t)=>e[ql(t)],Fn=e=>2+2*e,Hn=e=>3+2*e,yt=4,Or=e=>2+yt*e,Pr=e=>3+yt*e,Mr=e=>4+yt*e,Cr=e=>5+yt*e;var Zl=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],Ql=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],Ar=1e-6,ec=32;function Nr(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=Zl.map(([i,c])=>(e+i*r+c*s)**3);return Ql.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function Fr(e,t,n){return Nr(e,t,n).every(o=>o>=-Ar&&o<=1+Ar)}function tc(e,t,n){if(Fr(e,t,n))return t;let o=0,r=t;for(let s=0;s<ec;s++){let a=(o+r)/2;Fr(e,a,n)?o=a:r=a}return o}function nc(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function oc(e,t,n){let[o,r,s]=Nr(e,tc(e,t,n),n);return`#${[o,r,s].map(a=>nc(a).toString(16).padStart(2,"0")).join("")}`}var Hr=/(\d+)/;function rc(e,t){let n=e.split(Hr),o=t.split(Hr);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function Je(e){let t=[...new Set(e)].sort(rc);return new Map(t.map((n,o)=>[n,oc(.55,.16,o*360/t.length)]))}var Br="at this stop",Ir=e=>`within ${e} m`,sc="both directions",ac="one or both directions",Bn="weekday";function v(){return Bn}function Yr(e){Bn=e}function Jr(e){e.innerHTML=`
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
    </div>`}function Vr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function ic(e,t){let n=Math.max(1,...An.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return An.map(o=>{let r=e.periods[o]??0,s=t.periods[o]??0,a=s-r,i=a>0?"up":a<0?"down":"flat";return`
      <tr>
        <th>${kr[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${a===0?"\xB7":Pn(a)}</td>
      </tr>`}).join("")}function zr(e){return e.length?e.map(t=>`<span class="route">${l(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Ur(e){return e.first==null?'<span class="muted">no service</span>':`${we(e.first)}\u2013${we(e.last)}`}function jr(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var lc={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},cc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function uc(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':bt(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${l(o.name)}</span>
          <span class="os-status ${l(o.status)}">${lc[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${cc[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${ce("one-seat")}</p>
    </div>`:""}function ce(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ve(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function Gr(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Wr(e){return e.first==null||e.last==null?null:e.last-e.first}function bt(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Kr(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Kr(t,o,"prop",r("proposed"))}</div>
    </div>`}function Kr(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${l(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var Nn=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,dc="Allegheny";function qe(e){let t=e.place?.muni?.trim()??"",n=Nn.exec(t)?.[1],o=n===dc?t.replace(Nn,""):n?`${t.replace(Nn,"")} (${n})`:t;return e.place?.hood||o||"this location"}function ze(e){return e==="weekday"?"weekday":e}function qr(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${ze(t)}`}function pc(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function mc(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function gc(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${ce("one-direction")}</dt>
      ${Ve(r(n,e.routes),r(o,t.routes))}`}function Xr(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${ze(t)}, today only</span>`;return`<dt>Boardings ${l(n)}</dt><dd>${s}${r}</dd>`}function Zr(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${ce("boardings")}</p>`}function fc(e){if(!e)return"";let t=l(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose all buses
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains all buses under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in
        <button type="button" class="place-link" data-goto-place="${l(e.key)}">${t}</button>
      </h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${ce("place-population")}</p>
    </div>`}function Qr(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
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
        ${s===0?"no change":`${Pn(s)} trips`}
        <div class="muted">${wr(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${ze(n)} ${l(o)}${r?`, ${l(r)}`:""}</div>`}function es(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${ic(e,t)}</tbody>
    </table>`}function ts(e,t){let n=jr(e),o=jr(t),r=Wr(e),s=Wr(t);return`
      <dt>First and last</dt>
      ${Ve(Ur(e),Ur(t))}
      <dt>Hours between</dt>
      ${Ve(On(r),On(s),Gr(r,s,"more"))}
      <dt>Typical wait</dt>
      ${Ve(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,Gr(n,o,"less"))}`}function ns(e,t,n,o){return`
    <div class="routes">
      <h3>${l(n)}</h3>
      ${bt(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${ce("location-not-route")}</p>
    </div>`}function hc(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${ze(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${ze(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${ce("stop-routes")}</p>`}function yc(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:Je((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${l(i)}
        <span class="muted">\xB7 PRT stop ${l(e.stop_id)}</span></div>
      ${Qr(o,r,t,Br)}
      <div class="tiers">${Vr(o.hourly,r.hourly)}</div>
      ${es(o,r)}
      <dl class="facts">
        ${ts(o,r)}
        ${Xr(o.boardings,t,Br)}
      </dl>
      ${Zr(o.boardings)}
      ${ns(o,r,"Routes calling at this stop",a)}
      ${hc(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${ce("kerb")}</p>
    </section>`}function In(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],s=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Qr(o,r,t,Ir(e.radius),{directions:s?ac:sc})}

    <div class="tiers">${Vr(o.hourly,r.hourly)}</div>

    ${es(o,r)}
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
      ${ts(o,r)}
      ${gc(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Ve(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${mc(e.current.stops)}
      ${pc(e.proposed.stops)}
      ${Xr(o.boardings,t,Ir(e.radius))}
    </dl>
    ${Zr(o.boardings)}

    ${n}

    ${fc(e.population)}

    ${ns(o,r,"Routes serving this spot")}`}function bc(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,s=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${l(qe(e))}</h2>
      <div class="muted">${s}</div>
    </div>
    ${r?yc(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${In(e,t,uc(e.oneseat??[],e.oneseat_day??"any"))}`}function os(e,t={}){document.getElementById("panel").innerHTML=bc(e,Bn,t)}var Sc={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},wc={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},vc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Rc(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Un(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${zr(t)}</div>`:""}function Lc(e){let t=Un("kept",e.kept)+Un("lost",e.lost)+Un("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function $c(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${bt(e.current,e.proposed)}
    </div>`}function _c(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${l(r.key)}">
      <span class="os-name">${l(r.name)}</span>
      <span class="os-status ${l(r.status)}">${kc[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var kc={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function xc(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${vc[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function rs(e,t,n){let o=Rc(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":Lc(o)+$c(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${l(o.name)}</h2>
      <div class="muted">
        from ${l(qe(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${l(o.status)}">${Sc[o.status]}</div>
    <p class="note">${wc[o.status]} ${xc(r)}</p>

    ${s}

    ${_c(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${qr(e,n)}</summary>
      ${In(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function ss(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${l(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var ee={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Re="change",te="change-dots",ue=["boolean",["feature-state","selected"],!1],as="#15181e",de=["==",["get","published"],0],vt="newplace",Ec="#15181e",Tc=5,wt=["==",["get","removed"],1],Rt="removedstop",Ze="change-removed",Wn="change-removed-selected",jn="removed-cross",ls="#e8232f";function Dc(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,ls]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var Kn=["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1];function Yn(e){return e.hasImage(jn)||e.addImage(jn,Dc(),{pixelRatio:2}),jn}var St=null,Q=new Set,j=new Set,Oc=[te,Wn,Ze],Lt=[te,Ze],Qe=te;function cs(e,t){for(let n of Oc)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function $t(){return St}function et(e){return Q.has(e)}function us(e,t,n,o){return r=>Cc(r,e,t,n,o)}function ds(e){return t=>e.has(ve(t))}function ps(){return j}function ms(){return[...j].sort()}function gs(){return j.size}function Jn(e,t){let n=0;for(let o of t)j.has(o)||(j.add(o),Xe(e,o,!0),n++);return n}function fs(e,t){j.delete(t)?Xe(e,t,!1):(j.add(t),Xe(e,t,!0))}function hs(e,t){Vn(e),Jn(e,t)}function Vn(e){for(let t of j)Xe(e,t,!1);j.clear()}function Xe(e,t,n){try{e.setFeatureState({source:Re,id:t},{selected:n})}catch{}}function Pc(e){for(let t of j)Xe(e,t,!0)}function Mc(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function zn(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[te,Ze].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[c,p]=i.geometry.coordinates,g=e.project([c,p]);return{id:i.id,x:g.x,y:g.y}});return Mc(t,n,o,a)}function ys(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||A(s,ht)===0||A(s,Ye)===1)continue;let a=n[A(s,Ke(t))];a!==void 0&&r[a]++}return r}function bs(e,t){let n=0;for(let o of e)t(o)&&A(o,ht)===0&&n++;return n}function Ss(e,t){let n=0;for(let o of e)t(o)&&A(o,Ye)===1&&n++;return n}function Cc(e,t,n,o,r){let s=A(e,0),a=A(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function ws(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||A(s,ht)===0)continue;let a=n[A(s,Ke(t))];if(a===void 0)continue;let i=Dr(s,t),c=A(s,Ye)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(c){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function Ac(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>k.some((o,r)=>t[A(n,Ke(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ve(n),published:n[2],removed:n[Ye],name:n[Tr],moved:e.moved?.[ve(n)]??null,replacement:e.replacement?.[ve(n)]?.[0]??null,nearestStraight:e.replacement?.[ve(n)]?.[1]??null,...Object.fromEntries(k.flatMap((o,r)=>[[`b${r}`,t[A(n,Ke(r))]],[`sc${r}`,n[xr(r)]],[`sp${r}`,n[Er(r)]]]))}}))}}function vs(e,t){let n=Object.entries(ee).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,ee.none[t]]}function Rs(e){return["case",de,"rgba(0,0,0,0)",vs(e,"color")]}function Gn(e){return["case",de,Tc,vs(e,"size")]}function Ls(e){return["interpolate",["linear"],["zoom"],9,["*",Gn(e),.45],12,Gn(e),16,["*",Gn(e),1.9]]}function $s(e){e.addSource(Re,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:te,type:"circle",source:Re,paint:{"circle-color":Rs(0),"circle-radius":Ls(0),"circle-opacity":.85,"circle-stroke-color":["case",ue,as,de,Ec,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ue,1.6,de,.9,.5],12,["case",ue,2.4,de,1.5,1],16,["case",ue,3.2,de,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Wn,type:"circle",source:Re,filter:wt,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":as,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ue,1.6,0],12,["case",ue,2.4,0],16,["case",ue,3.2,0]]}},"walk-fill"),e.addLayer({id:Ze,type:"symbol",source:Re,filter:wt,layout:{"icon-image":Yn(e),"icon-size":Kn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function qn(e,t,n){return St=await Y(`/api/change?radius=${t}`),e.getSource(Re).setData(Ac(St)),Pc(e),Xn(e,n),St}function Xn(e,t){let n=k.indexOf(t);e.setPaintProperty(te,"circle-color",Rs(n)),e.setPaintProperty(te,"circle-radius",Ls(n)),Zn(e,t)}function _s(e,t,n){Q.has(t)?Q.delete(t):Q.add(t),Zn(e,n)}function ks(e,t){Q.clear(),Zn(e,t)}function Zn(e,t){let n=k.indexOf(t),o=["none",...Q],r=["case",de,!Q.has(vt),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(te,["all",["!",wt],r]);let s=["all",wt,!Q.has(Rt)];e.setFilter(Ze,s),e.setFilter(Wn,s)}function Fc(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function Qn(e,t,n,{pole:o=!0}={}){let r=k.indexOf(t),s=e[`b${r}`],a=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(h=>h.key===s)?.label??s,c=e[`sc${r}`],p=e[`sp${r}`],g=t==="weekday"?"weekday":t,b=a?`Currently ${c}`:`${c} \u2192 ${p}`;return`${o?Fc(e):""}${Nc(e)}${b} buses per ${g} at this stop<br>${a?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var Hc=1.5,is=800;function Nc(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??is,r=n!=null&&o>n*Hc?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${is} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${ls}">Stop removed</b> \u2014 ${s}<br>`}var eo="surface",kt="surface-fill",xs="#6b7280",to=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,xs],[.138,xs],[1,"#bd60e7"],[2,"#961bed"]],F="#e8232f",H="#0f79c9",Es=2,_t=null,Ts=!1;function xt(){return _t}function no(){return Ts}function Ds(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Es,Math.min(Es,n))}function Os(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Ps(e,t,n,o,r,s,a,i){let c={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let g=a.lat0+(p[1]+.5)*a.dlat,b=a.lon0+(p[0]+.5)*a.dlon;if(g<o||g>s||b<n||b>r)continue;let h=p[Fn(t)],w=p[Hn(t)],_=Os(h,w);if(_!=="none")if(_==="ramp"){let m=Ds(h,w);c[m<-.138?"less":m>.138?"more":"same"]+=i}else c[_]+=i}return c}function Bc(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,c=n+s[0]*r,p=c+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,a],[p,a],[p,i],[c,i],[c,a]]]},properties:Object.fromEntries(k.flatMap((g,b)=>{let h=s[Fn(b)],w=s[Hn(b)];return[[`k${b}`,Os(h,w)],[`v${b}`,Ds(h,w)??0]]}))}})}}function Ms(e){return["case",["==",["get",`k${e}`],"gone"],F,["==",["get",`k${e}`],"new"],H,["interpolate",["linear"],["get",`v${e}`],...to.flatMap(([t,n])=>[t,n])]]}function Le(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Cs(e,t){e.addSource(eo,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:kt,type:"fill",source:eo,layout:{visibility:"none"},paint:{"fill-color":Ms(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,Le(0,.85),13,Le(0,.62),16,Le(0,.45)]}},t)}async function oo(e,t,n){return _t=await Y(`/api/surface?radius=${t}`),e.getSource(eo).setData(Bc(_t)),ro(e,n),_t}function ro(e,t){let n=k.indexOf(t);e.setPaintProperty(kt,"fill-color",Ms(n)),e.setPaintProperty(kt,"fill-opacity",["interpolate",["linear"],["zoom"],9,Le(n,.85),13,Le(n,.62),16,Le(n,.45)])}function As(e,t){Ts=t,e.setLayoutProperty(kt,"visibility",t?"visible":"none")}var so=null;function Et(){return so}async function ao(e){return so=await Y(`/api/population?radius=${e}`),so}function Fs(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let c of e){let p=a.lat0+(c[1]+.5)*a.dlat,g=a.lon0+(c[0]+.5)*a.dlon;p<o||p>s||g<n||g>r||(i.lost+=c[Or(t)],i.gained+=c[Pr(t)],i.kept+=c[Mr(t)],i.none+=c[Cr(t)])}return i}var io="corridor",Hs="corridor-lines",$e="#8b929c",Ic="#6f7783",Dt={lost:F,added:H,kept:$e};var Tt=null,Ns=!1;function Ot(){return Tt}function lo(){return Ns}function Uc(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Bs(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function jc(){let e=t=>["match",["get","klass"],"lost",Dt.lost,"added",Dt.added,t];return["interpolate",["linear"],["zoom"],9,e(Ic),14,e($e)]}function Gc(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Wc(){return["match",["get","klass"],"kept",.85,.9]}function Is(e,t){e.addSource(io,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Hs,type:"line",source:io,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":jc(),"line-width":Gc(),"line-opacity":Wc()}},t)}async function co(e,t){return Tt=await P(`/api/corridors?day=${t}`),e.getSource(io).setData(Uc(Tt)),Tt}async function Us(e,t){k.includes(t)&&await co(e,t)}function js(e,t){Ns=t,e.setLayoutProperty(Hs,"visibility",t?"visible":"none")}var uo="#2b3038",Ws="#b9bec6",tt={loses:{color:F,size:6},gains:{color:H,size:6},keeps:{color:$e,size:3},here:{color:uo,size:3.5},none:{color:Ws,size:1.8}};var V="loses_retired",Ct=["loses",V,"gains","keeps","none","here"];function po(e,t){let n=e===V?"loses":e,o=t.find(r=>r.key===n)?.label??n;return e==="loses"?`${o} \u2014 stop kept`:e===V?`${o} \u2014 stop retired`:o}function Ks(e){return{...e.counts,loses:e.counts.loses-e.retired.loses,[V]:e.retired.loses}}var Pt="oneseat",Ys="oneseat-dots",Js="oneseat-removed",Gs=["all",["==",["get","status"],"loses"],["==",["get","removed"],1]],At=[Ys,Js],Mt=null,Vs=!1;function _e(){return Mt}function mo(){return Vs}function zs(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;a[V]=0;for(let i of e){let c=i[0],p=i[1];if(c<o||c>s||p<n||p>r)continue;let g=t[i[3]];g!==void 0&&a[g==="loses"&&i[6]===1?V:g]++}return a}function Kc(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5],removed:n[6]??0}}))}}function Yc(){return["match",["get","status"],...Object.entries(tt).flatMap(([e,t])=>[e,t.color]),Ws]}function Jc(){let e=["match",["get","status"],...Object.entries(tt).flatMap(([t,n])=>[t,n.size]),tt.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function qs(e,t){e.addSource(Pt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ys,type:"circle",source:Pt,filter:["!",Gs],layout:{visibility:"none"},paint:{"circle-color":Yc(),"circle-radius":Jc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t),e.addLayer({id:Js,type:"symbol",source:Pt,filter:Gs,layout:{visibility:"none","icon-image":Yn(e),"icon-size":Kn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},t)}function Vc(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var zc="pin";function Xs(e){return"key"in e?e.key:zc}var Ft="any";function qc(e,t,n){return`radius=${e}&${Vc(t)}&day=${n}`}function Zs(e,t){return e?t:Ft}function Qs(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function go(e,t,n,o=Ft){return Mt=await P(`/api/oneseat?${qc(t,n,o)}`),e.getSource(Pt).setData(Kc(Mt)),Mt}function ea(e,t){Vs=t;for(let n of At)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function fo(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function ta(e,t){let n=e.status==="loses"&&e.removed===1?V:e.status,o=po(n,t.statuses),r=(e.current||"").split(";").filter(Boolean),s=(e.proposed||"").split(";").filter(Boolean),a=c=>c.length?c.join(", "):"none",i=fo(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${o}</b> \u2014 ${i}<br>today: ${a(r)}<br>proposed: ${a(s)}`}var Ht={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ho={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Xc=new Set(["gone","new"]),Zc="stop kept";function Qc(e,t,n){return Xc.has(e)?`${t}, ${Zc} (${ho[n]})`:t}function eu(e){return e.buckets.filter(t=>t.key!=="none")}var na={area:"Ground",people:"People"};function tu(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=Ps(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function nu(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=Fs(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var ou=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function oa(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1}=e,c=to.map(([p,g])=>`${g} ${((p+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${c})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${F}"></i>loses all service
          (${ho[n]})</span>
        <span><i style="background:${H}"></i>new service
          (${ho[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(na).map(p=>`
          <button data-surface-unit="${p}" aria-pressed="${r===p}"
                  class="${r===p?"active":""}">${na[p]}</button>`).join("")}
      </div>
      ${a?ou:r==="people"?nu(n,o,s):tu(t,n,o)}
    </div>`}var ru=["lost","added","kept"],su={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},au={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function sa(e,t){let{lostPct:n,addedPct:o}=Bs(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${au[t.day]}
    </div>
    ${ru.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${Dt[i]}"></i>
        <span class="lg-lab">${l(su[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function aa(e,t,n){let o=t.statuses.map(h=>h.key),r=zs(t.points,o,n.west,n.south,n.east,n.north),s=Ks(t),a=h=>po(h,t.statuses),i=h=>h===V?'<i class="lg-cross"></i>':`<i style="background:${tt[h].color}"></i>`,c=Ct.reduce((h,w)=>h+(r[w]??0),0),p=fo(t),g=t.day&&t.day!==Ft,b=g?`Restricted to routes running on ${Ht[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${l(p)}</b>
      <span class="muted">\xB7 ${c.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${g?` \xB7 ${Ht[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Ct.map(h=>`
      <div class="lg-row lg-static">
        ${i(h)}
        <span class="lg-lab">${l(a(h))}</span>
        <span class="lg-n">${(r[h]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Ct.map(h=>`${(s[h]??0).toLocaleString()} ${l(a(h))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${l(p)} without transferring?
      ${b} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      A cross is a stop the plan retires, as in Stop-by-stop \u2014 decided at the
      stop, not the walk \u2014 so the ride may survive at a stop a block away;
      a retired stop that keeps its ride stays a plain dot.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function ia(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var ra={locations:"Stops",riders:"Riders"};function iu(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function lu(e){if(!e)return"";let t=et(vt);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${vt}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function cu(e,t){if(!e)return"";let n=et(Rt);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Rt}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop \u2014 no bus here on any day</span>
      <span class="lg-n">${t}</span>
    </button>`}function uu(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${lu(e)}
      ${cu(t,n)}
    </div>`}function la(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:c,selection:p,dots:g=!0}=t,b=n.buckets.map($=>$.key),h=n.days.indexOf(o),{west:w,south:_,east:m,north:L}=r,D=eu(n),O=p&&p.size>0?p:null,M=O?ds(O):us(w,_,m,L),br=ys(n.points,h,b,M),xn=bs(n.points,M),En=Ss(n.points,M),I=s==="riders"?ws(n.points,h,b,M):null,Bl=$=>I?I.measured[$]?Math.round(I.riders[$]).toLocaleString():"\u2014":br[$].toLocaleString(),Il=I?I.removedMeasured?Math.round(I.removedRiders).toLocaleString():"\u2014":En.toLocaleString(),Ul=O?`at ${O.size.toLocaleString()} selected stop${O.size===1?"":"s"}`:"in view",Sr=D.reduce(($,Tn)=>$+br[Tn.key],0)+xn+En,jl=I?`<b>${Math.round(D.reduce(($,Tn)=>$+I.riders[Tn.key],0)+I.removedRiders).toLocaleString()}</b> daily boardings ${Ul}`:O?`<b>${Sr.toLocaleString()}</b>
         of ${O.size.toLocaleString()} selected stops`:`<b>${Sr.toLocaleString()}</b>
         stops in view`,Gl=a?` \xB7 surface: ${n.radius} m walk`:"",Wl=!g&&!!a;e.innerHTML=Wl?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${Ht[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${oa({layer:a,day:o,bounds:r,unit:i,population:c,scoped:!!O,named:!0})}`:`
    <div class="lg-head">
      ${jl}
      <span class="muted">\xB7 ${Ht[o]}${Gl}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(ra).map($=>`
        <button data-weight="${$}" aria-pressed="${s===$}"
                class="${s===$?"active":""}">${ra[$]}</button>`).join("")}
    </div>
    ${D.map($=>`
      <button class="lg-row ${et($.key)?"off":""}" data-bucket="${l($.key)}"
              aria-pressed="${!et($.key)}">
        <i style="background:${ee[$.key]?.color??"#666"}"></i>
        <span class="lg-lab">${l(Qc($.key,$.label,o))}</span>
        <span class="lg-n">${Bl($.key)}</span>
      </button>`).join("")}
    ${uu(xn,En,Il)}
    ${a?oa({layer:a,day:o,bounds:r,unit:i,population:c,scoped:!!O}):""}
    ${I?iu(I.unmeasured,xn):""}
    ${O?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var ke="#4aa3ff",nt="#ffa23a",yo="headline",Nt="journey",It="journey-rides",fa="journey-walks",du=[It,fa],ha=null,ya=!1;function Ut(){return ha}function bo(){return ya}function pu(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,c=a.to??e.destination,p=[[i.lon,i.lat],[c.lon,c.lat]],g=a.path?.length?a.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:g},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function ca(){return["match",["get","side"],"current",ke,"proposed",nt,ke]}function ua(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function ba(e,t){e.addSource(Nt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:It,type:"line",source:Nt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ca(),"line-width":ua(1),"line-opacity":.85}},t),e.addLayer({id:fa,type:"line",source:Nt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ca(),"line-width":ua(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Sa(e,t){ya=t;for(let n of du)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function So(e,t){ha=t;let n=t?pu(t,yo):{type:"FeatureCollection",features:[]};e.getSource(Nt).setData(n)}function wa(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var da=e=>`${e.toFixed(1)} min`;function va(e){return e==null?"\u2014":e===0?"no change":e>0?`${da(e)} slower`:`${da(-e)} faster`}function pa(e,t){return e?e.name?l(e.name):`stop ${l(e.stop_id)}`:t}function mu(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=pa(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${l(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${pa(e.to,"the destination")}</span></div>`}function ma(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(mu(r,t)),o=r}return n.join("")}var gu={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Bt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function fu(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function hu(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Bt(t.current)} \u2192
        ${Bt(t.proposed)} min</span>
        <span class="muted">${va(t.change_min)}</span></div>
      ${o}
    </div>`}function ga(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function wo(e,t){let n=e.radii[yo],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${l(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${we(e.window.start_min)}
        and ${we(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${gu[n.classification]??""}</p>
      </div>
      ${ga(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Bt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Bt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${va(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${fu(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ma(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ma(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${hu(e)}
    ${ga(e)}`}function Ra(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${l(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function La(e){let t=e?e.radii[yo].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${ke}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${nt}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var jt="off",yu="stoproutes",Gt="stoproutes-lines",bu="stoproutes-flow",Su="stoproutes-arrows",vo="stoproutes-arrow",wu=3.5,_a=null;function Wt(){return _a}function ka(){return xe.isVisible()}function xa(e,t){return e!==null&&e[t].length>0}function vu(e,t){let n=t==="current"?e.current:e.proposed,o=Je(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function Ru(e){return["interpolate",["linear"],["zoom"],9,e*.6,14,e]}function Lu(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function Ro({ids:e,width:t=wu}){let n=[e.lines,e.flow,e.arrows],o=!1,r=xu(e.flow);return{init(s,a){s.addSource(e.source,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),s.addLayer({id:e.lines,type:"line",source:e.source,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Ru(t),"line-opacity":.85}},a),s.addLayer({id:e.flow,type:"line",source:e.source,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},a),s.hasImage(vo)||s.addImage(vo,Lu(),{pixelRatio:2,sdf:!0}),s.addLayer({id:e.arrows,type:"symbol",source:e.source,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":vo,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},a)},setVisible(s,a){o=a;for(let i of n)s.setLayoutProperty(i,"visibility",a?"visible":"none");a||r.stop()},setData(s,a){s.getSource(e.source).setData(a)},startFlow:r.start,stopFlow:r.stop,isVisible:()=>o}}var xe=Ro({ids:{source:yu,lines:Gt,flow:bu,arrows:Su}});function Ea(e,t){xe.init(e,t)}function Kt(e,t){xe.setVisible(e,t)}function Ee(e,t,n){_a=t,xe.setData(e,t?vu(t,n):{type:"FeatureCollection",features:[]}),t||xe.stopFlow()}function Ta(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var Lo={current:"today",proposed:"proposed"};function $o(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${l(e.color)}"></i> <b>${l(e.route)}</b>${e.name?` \u2014 ${l(e.name)}`:""}<br><span style="opacity:.75">${Lo[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var $u=20;function _u(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var $a=_u(3,4,24);function ku(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function xu(e){let t=null,n=0,o=0,r=null,s=i=>{r&&(t=requestAnimationFrame(s),!(i-o<1e3/$u)&&(o=i,n=(n+1)%$a.length,r.setPaintProperty(e,"line-dasharray",$a[n])))},a=()=>{r&&(document.hidden?t!==null&&(cancelAnimationFrame(t),t=null):t===null&&(o=0,t=requestAnimationFrame(s)))};return{start(i){ku()||r||(r=i,n=0,o=0,document.addEventListener("visibilitychange",a),t=requestAnimationFrame(s))},stop(){t!==null&&(cancelAnimationFrame(t),t=null),document.removeEventListener("visibilitychange",a),r=null}}}function Da(e){xe.startFlow(e)}var Yt=" \xB7 ",_o={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places",routes:"Route changes"},Oa=Object.keys(_o);function Pa(e){return _o[e]??e}var ko={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Jt(e){return ko[e]}var Eu=["oneseat","journey"],Tu=["dots","both"],Du={current:"routes today",proposed:"routes proposed"};function Ou(e){return e!=="journey"&&e!=="routes"}function Pu(e){let t=[_o[e.view]??e.view];return e.view==="places"?t[0]:(Eu.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":ko[e.day]),Ou(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&Tu.includes(e.view)&&t.push(Du[e.stopRoutes]),t.join(Yt))}function Ma(e){return Ca(Pu(e))}function Ca(e){let[t,...n]=e.split(Yt);return`<b>${l(t)}</b>${n.map(o=>Yt+l(o)).join("")}`}var Mu={current:"today",proposed:"proposed"};function Cu(e){return["Route "+e.short_name,Mu[e.side],ko[e.day]].join(Yt)}function Aa(e){return Ca(Cu(e))}var Au="#c026d3",Fu=4.5,Na={source:"routeview",lines:"routeview-lines",flow:"routeview-flow",arrows:"routeview-arrows"},Ba=Na.lines,ot=Ro({ids:Na,width:Fu});function Ia(e,t){return`/api/route?${new URLSearchParams({side:e.side,route_id:e.route_id,day:t})}`}function Ua(e){return e?e.startsWith("#")?e:`#${e}`:Au}function Hu(e){let t=Ua(e.color);return{type:"FeatureCollection",features:e.features.map(o=>({type:"Feature",geometry:{type:"LineString",coordinates:o.points},properties:{side:e.side,route:e.short_name,name:e.long_name||null,pattern_id:o.pattern_id,color:t}}))}}function ja(e,t){ot.init(e,t)}function xo(e,t){let n=t?Hu(t):{type:"FeatureCollection",features:[]};ot.setData(e,n);let o=n.features.length>0;ot.setVisible(e,o),o?ot.startFlow(e):ot.stopFlow()}var Nu={current:"today",proposed:"the plan"},Bu={current:"today",proposed:"proposed"},Fa={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"};function Ha(e,t){return e.length<=1?e.join(""):`${e.slice(0,-1).join(", ")} ${t} ${e[e.length-1]}`}function Iu(e){let t=k.filter(r=>e.includes(r)),n=k.filter(r=>!e.includes(r));if(t.length===0)return"Does not run on any day type in this feed.";let o=`Runs on ${Ha(t.map(r=>Fa[r]),"and")}`;return n.length===0?`${o}.`:`${o}; does not run on ${Ha(n.map(r=>Fa[r]),"or")}.`}function Ga(e){let n=e.features.length>0?'<span class="pk-note">arrows: direction of travel</span>':`<span class="pk-note">does not run on ${l(Jt(e.day))} \u2014 nothing drawn</span>`;return`
    <div class="pk-head rk-head">
      <i class="sw-route" style="background:${l(Ua(e.color))}"></i>
      <span class="rk-name"><b>${l(e.short_name)}</b>${e.long_name?` ${l(e.long_name)}`:""}
        \xB7 ${Bu[e.side]} \xB7 ${l(Jt(e.day))}</span>
      <button type="button" class="rk-clear" data-clear-route
              aria-label="Clear the drawn route" title="Clear the drawn route">\xD7</button>
    </div>
    ${n}`}function Uu(e){let t=e.crosswalk;if(!t)return"<p>PRT's crosswalk has no row for this route.</p>";let n=e.side==="current"?t.final_route:t.current_route,o=t.related_routes?` Related: ${l(t.related_routes)}`:"",r=t.route_page?`<p><a class="link" href="${l(t.route_page)}" target="_blank" rel="noopener">PRT's page for this route \u2197</a></p>`:"";return`<p>PRT's crosswalk: ${l(t.category)} \xB7 ${l(n)}.${o}</p>${r}`}function Wa(e){let t=e.features.length>0,n=`Route ${l(e.short_name)}${e.long_name?` \xB7 ${l(e.long_name)}`:""}`,o=t?"":`
      <p class="note">It does not run on ${l(Jt(e.day))}, so nothing is
        drawn for the day the toolbar is set to; switch the day to see it.</p>`;return`
    <div class="route-card">
      <div class="place-head">
        <h2>${n}</h2>
        <div class="sub">${Nu[e.side]==="today"?"today's network":"the plan"}</div>
      </div>
      <p>${l(Iu(e.days))}</p>${o}
      <h3 class="scope-head">What PRT says it becomes</h3>
      ${Uu(e)}
      <p class="note">This is PRT's own labelling of which route replaces
        which. It is not a comparison \u2014 this site never measures a route
        against its successor, because the plan re-splits corridors and a
        route can "lose half its trips" while every stop on it keeps them.
        To see what changes for the riders along this line, click a stop on
        it.</p>
      <p class="note">Drawn from the feed's shapes \u2014 for drawing only; buses
        only, so a train on the same street is not shown.</p>
    </div>`}var ju="/api/search",Gu=8,Wu=150,Ka=1,Ku={current:"today",proposed:"plan"},Vt=" \xB7 ",Ya={places:"Places",stops:"Stops",routes:"Routes",addresses:"Addresses"},Yu="Nothing found",Ja="search-opt-";function Va(e,t=Gu){return{url:ju,init:{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q:e,limit:t})}}}function Ju(e,t=null){let o=["current","proposed"].filter(r=>e.includes(r)).map(r=>Ku[r]);return[t,...o].filter(Boolean).join(Vt)}function Vu(e){return[Lo[e.side],e.long_name].filter(Boolean).join(Vt)}var zu="street";function qu(e){return e.kind==="street"?[zu,e.place].filter(Boolean).join(Vt):[e.place,e.zip].filter(Boolean).join(Vt)}function To(e){let t={places:e.places.map(n=>({kind:"place",place:n})),stops:e.stops.map(n=>({kind:"stop",stop:n})),routes:e.routes.map(n=>({kind:"route",route:n})),addresses:e.addresses.map(n=>({kind:"address",address:n}))};return za(e.q).flatMap(n=>t[n])}var Xu=/^\d+\s+[a-z]/i;function za(e){let t=e.trim();return Xu.test(t)?["addresses","routes","places","stops"]:/^\d/.test(t)?["routes","places","stops","addresses"]:["places","stops","routes","addresses"]}function Zu(e,t,n){return n===0?null:e===null?t>0?0:n-1:(e+t+n)%n}function Qu(e){switch(e.kind){case"place":return{name:e.place.name,tag:e.place.kind};case"stop":return{name:e.stop.name,tag:Ju(e.stop.sides,e.stop.place)};case"route":return{name:e.route.short_name,tag:Vu(e.route)};case"address":return{name:e.address.label,tag:qu(e.address)}}}function ed(e,t,n){let{name:o,tag:r}=Qu(e);return`<div id="${Ja}${t}" role="option" aria-selected="${n}" class="sr-row${n?" hl":""}" data-idx="${t}"><span class="sr-name">${l(o)}</span><span class="sr-tag">${l(r)}</span></div>`}function td(e,t){let n=To(e);if(n.length===0)return`<div class="sr-empty">${Yu}</div>`;let o={places:"place",stops:"stop",routes:"route",addresses:"address"},r=0;return za(e.q).map(s=>{let a=n.filter(c=>c.kind===o[s]);if(a.length===0)return"";let i=a.map(c=>ed(c,r,r++===t)).join("");return`<div class="sr-group" role="group" aria-label="${Ya[s]}"><div class="sr-head">${Ya[s]}</div>${i}</div>`}).join("")}var nd=14,od=15;function qa(e,t){let{bounds:n}=e;return t.lon>=n.west&&t.lon<=n.east&&t.lat>=n.south&&t.lat<=n.north&&e.zoom>=nd?null:{lat:t.lat,lon:t.lon,zoom:Math.max(e.zoom,od)}}var Eo="open";function Xa({elements:e,search:t,onPick:n}){let{group:o,input:r,list:s,opener:a}=e,i=0,c=null,p=null,g=null,b=m=>{o.classList.toggle(Eo,m),r.setAttribute("aria-expanded",String(m)),m||(g=null,r.removeAttribute("aria-activedescendant"))},h=()=>{p&&(s.innerHTML=td(p,g),g===null?r.removeAttribute("aria-activedescendant"):(r.setAttribute("aria-activedescendant",`${Ja}${g}`),s.querySelector(`[data-idx="${g}"]`)?.scrollIntoView({block:"nearest"})))},w=m=>{let L=++i;t(m).then(D=>{L===i&&(p=D,g=null,h(),b(!0))}).catch(()=>{L===i&&(p={q:m,places:[],stops:[],routes:[],addresses:[]},g=null,h(),b(!0))})},_=m=>{if(!p)return;let L=To(p)[m];L&&(b(!1),n(L))};return r.addEventListener("input",()=>{c&&clearTimeout(c);let m=r.value.trim();if(m.length<Ka){i++,p=null,b(!1);return}c=setTimeout(()=>w(m),Wu)}),r.addEventListener("focus",()=>{p&&r.value.trim().length>=Ka&&b(!0)}),r.addEventListener("keydown",m=>{let L=p?To(p).length:0,D=o.classList.contains(Eo);m.key==="ArrowDown"||m.key==="ArrowUp"?(m.preventDefault(),!D&&p&&b(!0),g=Zu(g,m.key==="ArrowDown"?1:-1,L),h()):m.key==="Enter"?D&&g!==null&&(m.preventDefault(),_(g)):m.key==="Escape"&&(D&&(m.stopPropagation(),b(!1)),r.blur())}),s.addEventListener("mousedown",m=>m.preventDefault()),s.addEventListener("click",m=>{let L=m.target.closest("[data-idx]");L&&_(Number(L.dataset.idx))}),document.addEventListener("click",m=>{if(!o.classList.contains(Eo))return;let L=m.target;o.contains(L)||a?.contains(L)||b(!1)}),{focus(){r.focus(),r.select()}}}var Xt="places",ei="places-points",Do="places-boundaries",me="places-fill",De="lost",rd=100,sd={lost:"share_lost",gained:"share_gained"};function oe(e,t){return`service_${e}_${t}`}var ti={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ad="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",pe={lost:F,gained:H},zt=null,ne=null,Te=null,ni=!1,qt=null;function Oo(){return zt}function oi(){return ne}function ri(){return qt}function Po(){return Te}function rt(){return ni}function id(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function ld(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function cd(e){return Math.max(e.residents_lost,e.residents_gained)}var Za=4,ud=16,dd=1e3;function pd(e){let t=Math.min(1,Math.sqrt(e/dd));return Za+t*(ud-Za)}function md(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:ld(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:pd(cd(t))}}))}}function gd(){return["match",["get","klass"],"lost",pe.lost,"gained",pe.gained,pe.lost]}function fd(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var z=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var q=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function si(e,t){return e==="service"?["step",["abs",["coalesce",["get",oe(t,"pct")],0]],q[0].opacity,q[0].max,q[1].opacity,q[1].max,q[2].opacity,q[2].max,q[3].opacity]:["step",["coalesce",["get",sd[e]],0],z[0].opacity,Number.EPSILON,z[1].opacity,z[1].max,z[2].opacity,z[2].max,z[3].opacity,z[3].max,z[4].opacity]}function ai(e,t){return e==="service"?["case",[">=",["coalesce",["get",oe(t,"pct")],0],0],H,F]:pe[e]}function hd(e,t){let n=oe(t,"now"),o=oe(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var yd=3;function bd(e){if(e.length===0)return"";let t=e.slice(0,yd),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function ii(e,t){e.addSource(Do,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:me,type:"fill",source:Do,layout:{visibility:"none"},paint:{"fill-color":ai(De),"fill-opacity":si(De),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ei,type:"circle",source:Xt,layout:{visibility:"none"},paint:{"circle-color":gd(),"circle-radius":fd(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Zt(e,t,n){e.setPaintProperty(me,"fill-color",ai(t,n)),e.setPaintProperty(me,"fill-opacity",si(t,n))}async function li(){return zt||(zt=await P("/api/places")),zt}async function ci(e){return Te||(Te=await P("/api/boundaries"),e.getSource(Do).setData(Te)),Te}function Sd(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function ui(e,t){let n=Sd(Te,t);if(n)return ne=null,qt=n,e.getSource(Xt)?.setData({type:"FeatureCollection",features:[]}),null;try{ne=await P(`/api/places/${encodeURIComponent(t)}`)}catch{return ne=null,qt=null,null}return qt=null,e.getSource(Xt).setData(md(ne)),e.flyTo({center:[ne.lon,ne.lat],zoom:13}),ne}function di(e,t){ni=t,e.setLayoutProperty(ei,"visibility",t?"visible":"none"),e.setLayoutProperty(me,"visibility",t?"visible":"none")}function wd(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${l(e.key)}">
      <span class="place-name">${l(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var vd="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function pi(e,t,n,o){let r=id(e,t).map(s=>wd(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${ad}</p>
    ${o==="service"?`<p class="note">${vd}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function mi(e,t){return e?`<div class="lg-head"><b>${l(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${l(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Rd(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Ld(e,t,n,o){let r=q.map((c,p)=>({band:c,prevMax:p===0?0:q[p-1].max})).filter(({band:c})=>c.opacity>0).flatMap(({band:c,prevMax:p})=>{let g=Rd(c,p);return[`<div class="lg-row lg-static">
          <i style="background:${F};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${l(g)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${H};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${l(g)} more trips</span></div>`]}).join(""),s=o?hd(o,n):[],a=bd(s),i=a?`<div class="lg-foot">${l(a)}</div>`:"";return`
    ${mi(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${l(ti[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function gi({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return Ld(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=z.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${pe[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${l(i.label)} of the place's own residents ${l(s)}</span>
    </div>`).join("");return`
    ${mi(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${l(s)}</div>
    ${a}
    <div class="lg-row lg-static"><i style="background:${pe.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${pe.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function $d(e,t){let n=e[oe(t,"now")],o=e[oe(t,"proposed")],r=e[oe(t,"pct")],s=e[oe(t,"rail_proposed")],a=ti[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function fi(e,t,n){if(t==="service")return`<b>${l(e.place)}</b> <span class="muted">\xB7 ${l(e.kind)}</span><br>
      ${$d(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${l(e.place)}</b> <span class="muted">\xB7 ${l(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=Qa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Qa("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${l(e.place)}</b> <span class="muted">\xB7 ${l(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Qa(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${rd} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Si=["discontinued","new","reshaped","one-to-one"],wi={discontinued:["discontinued"],new:["new"],reshaped:["split","merged"],"one-to-one":["one-to-one"]},No=["one-to-one"];function sn(e){return Si.includes(e)}function Bo(e){return Si.filter(t=>e.includes(t))}var Io="status",_d={status:"What happened",service:"How much service"};function an(e){return e==="status"||e==="service"}var st=["gone","halved","less","same","more","doubled","new"],Uo={gone:"loses all service",halved:"halved or worse",less:"less service",same:"about the same",more:"more service",doubled:"doubled or better",new:"new service",none:"no service either way"},kd={gone:1.7,halved:1.35,less:1,same:.75,more:1,doubled:1.35,new:1.7,none:.75};function ln(e){return st.includes(e)}function jo(e){return st.filter(t=>e.includes(t))}var hi="#8e44ad",vi={discontinued:F,new:H,split:hi,merged:hi,"one-to-one":$e},Go={discontinued:"discontinued",new:"new",split:"split",merged:"merged","one-to-one":"one-to-one"},xd=["discontinued","new","split","merged","one-to-one"],Ed="route-changes",Td=.12,Ri=.9,Li=1,Dd=/^[cp]:[\w-]{1,64}$/;function $i(e){return Dd.test(e)}var Pe={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Od={current:"today",proposed:"proposed"},_i=" \u2192 ",on="\u2014";function Qt(e,{named:t=!0}={}){return e.length===0?on:e.map(n=>t&&n.name?`${n.route} ${n.name}`:n.route).join(", ")}function at(e,{farSideNamed:t=!0}={}){return e.current.length===0?Qt(e.proposed):e.proposed.length===0?Qt(e.current):`${Qt(e.current)}${_i}${Qt(e.proposed,{named:t})}`}function rn(e){if(e===null)return on;let t=Math.round(e);return t===0?"0%":t>0?`+${t}%`:`\u2212${Math.abs(t)}%`}function Pd(e){let t=Object.fromEntries(xd.map(n=>[n,0]));for(let n of e)t[n.status]+=1;return t}var ki="routechange",re="routechange-lines",it="routechange-arrows",cn="routechange-selected",un="routechange-selected-lines",Wo="routechange-selected-plan",Ko="routechange-selected-arrows",Md=[re,it,un,Wo,Ko],Yo=[Wo,un,re],Cd=[0,2.5],yi={current:["==",["get","side"],"current"],proposed:["==",["get","side"],"proposed"]},Co="routechange-arrow",Mo=2.6,Ad=1.5,Fd=2.8,xi={bucket:"none",pct_trips:null};function Ao(e,t,n,o,r){return{type:"Feature",geometry:{type:"LineString",coordinates:e.points},properties:{key:e.key,side:e.side,route:e.route,name:e.name,status:e.status,pattern_id:e.pattern_id,color:t,sort:n,w:o,bucket:r.bucket,scolor:ee[r.bucket].color,sw:kd[r.bucket],pct:r.pct_trips}}}function Hd(e){let t=new Map(e.groups.map(o=>[o.key,o.service[e.day]]));return{type:"FeatureCollection",features:e.features.map(o=>Ao(o,vi[o.status],o.status==="one-to-one"?0:1,1,t.get(o.key)??xi)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Nd(e){let t=e.service[e.day]??xi;return{type:"FeatureCollection",features:e.features.map(o=>o.side==="current"?Ao(o,ke,0,Fd,t):Ao(o,nt,1,Ad,t)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Bd(e){let t=1/0,n=1/0,o=-1/0,r=-1/0;for(let s of e)for(let[a,i]of s.points)a<t&&(t=a),a>o&&(o=a),i<n&&(n=i),i>r&&(r=i);return Number.isFinite(t)?[[t,n],[o,r]]:null}function Id(e){if(e.length===0)return null;let t=e.flatMap(n=>wi[n]);return["!",["in",["get","status"],["literal",t]]]}function Ud(e){return e.length===0?null:["!",["in",["get","bucket"],["literal",[...e]]]]}var Fo={status:{color:"color",width:"w"},service:{color:"scolor",width:"sw"}};function Jo(e){let t=n=>["*",["get",Fo[e].width],n];return["interpolate",["linear"],["zoom"],9,t(Mo*.5),14,t(Mo),16,t(Mo*1.6)]}function jd(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function bi(e,t,n,o,r,s){e.addSource(t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:n,type:"line",source:t,layout:{visibility:"none","line-cap":"round","line-join":"round","line-sort-key":["get","sort"]},paint:{"line-color":["get","color"],"line-width":Jo("status"),"line-opacity":s}},r),e.addLayer({id:o,type:"symbol",source:t,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":140,"symbol-sort-key":["get","sort"],"icon-image":Co,"icon-size":["interpolate",["linear"],["zoom"],12,.45,16,.8],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"],"icon-opacity":s}},r)}function Ei(e,t){e.hasImage(Co)||e.addImage(Co,jd(),{pixelRatio:2,sdf:!0}),bi(e,ki,re,it,t,Ri),bi(e,cn,un,Ko,t,Li),Gd(e,t),He(e)}function Gd(e,t){e.setFilter(un,yi.current),e.addLayer({id:Wo,type:"line",source:cn,filter:yi.proposed,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Jo("status"),"line-opacity":Li,"line-dasharray":Cd}},Ko)}var tn=null,Oe=null,Ti=!1,Me=new Set(No),Ce=new Set,Vo=Io;function zo(){return tn?.groups??null}function ge(){return Oe}function Ae(){return Ti}function Wd(e){return`/api/route_changes?day=${e}`}function Kd(e,t){return`/api/route_changes/${encodeURIComponent(e)}?day=${t}`}async function qo(e,t){if(!k.includes(t))throw new Error(`no such day type: ${t}`);return tn=await Y(Wd(t)),e.getSource(ki).setData(Hd(tn)),tn}async function Xo(e,t,n,{fly:o=!0}={}){try{Oe=await Y(Kd(t,n))}catch{return Zo(e),null}e.getSource(cn).setData(Nd(Oe)),Di(e,!0);let r=Bd(Oe.features);return o&&r&&e.fitBounds(r,{padding:60,maxZoom:14}),Oe}function Zo(e){Oe=null,e.getSource(cn)?.setData({type:"FeatureCollection",features:[]}),e.getLayer(re)&&Di(e,!1)}function Di(e,t){let n=t?Td:Ri;e.setPaintProperty(re,"line-opacity",n),e.setPaintProperty(it,"icon-opacity",n)}function dn(){return Bo([...Me])}function Oi(e,t){Me.has(t)?Me.delete(t):Me.add(t),He(e)}function Qo(e,t){Me.clear();for(let n of t)Me.add(n);He(e)}function pn(){return jo([...Ce])}function Pi(e,t){Ce.has(t)?Ce.delete(t):Ce.add(t),He(e)}function er(e,t){Ce.clear();for(let n of t)Ce.add(n);He(e)}function Fe(){return Vo}function tr(e,t){Vo=t,e.setPaintProperty(re,"line-color",["get",Fo[t].color]),e.setPaintProperty(re,"line-width",Jo(t)),e.setPaintProperty(it,"icon-color",["get",Fo[t].color]),He(e)}function He(e){let t=Vo==="status"?Id(dn()):Ud(pn());e.setFilter(re,t),e.setFilter(it,t)}function Mi(e,t){Ti=t;for(let n of Md)e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Yd="A route group is PRT\u2019s own mapping of today\u2019s route numbers onto the plan\u2019s \u2014 the routes it says replace each other. It is not a corridor: a street can lose one group\u2019s buses and gain another\u2019s, and only the location, surface and street views can see that.";function Ci(){return` <button class="howto" data-caveat="${Ed}">method</button>`}var Ai={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Jd(e,t){if(e.current.length===0||e.proposed.length===0)return"";let n=e.service[t].pct_trips,o=`${Ai[t]} trips, today to plan`;return`<span class="rc-pct ${Ho(n)}" title="${l(o)}">${rn(n)}</span>`}function Ho(e){return e===null||Math.round(e)===0?"flat":e>0?"up":"down"}function Vd(e,{reading:t,day:n}){let o=l(at(e,{farSideNamed:!1}));return t==="service"?`<span class="rc-map" style="color:${ee[e.service[n].bucket].color}">${o}</span>`:`<span class="${e.status==="one-to-one"?"rc-map":`rc-map ${e.status}`}">${o}</span>`}function Fi(e,t,n){return`
    <button type="button" class="rc-row${t?" selected":""}"
            data-select-route="${l(e.key)}">
      ${Vd(e,n)}
      ${Jd(e,n.day)}
    </button>`}function nn(e,t,n,o){return`
    <div class="scope-head">${l(e)} (${t.length})</div>
    <div class="rc-list">${t.map(r=>Fi(r,r.key===n,o)).join("")}</div>`}function zd(e){return e.charAt(0).toUpperCase()+e.slice(1)}function Hi(e,t,n={reading:"status",day:"weekday"}){let o=`
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${e.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${Yd}${Ci()}</p>`;if(n.reading==="service")return o+qd(e,t,n);let r=a=>e.filter(i=>a.includes(i.status)),s=r(["one-to-one"]);return`${o}
    ${nn("Discontinued",r(["discontinued"]),t,n)}
    ${nn("New",r(["new"]),t,n)}
    ${nn("Split or merged",r(["split","merged"]),t,n)}
    <details class="svc rc-kept">
      <summary>One-to-one (${s.length}) \u2014 one number on each side; how its service changed</summary>
      <div class="rc-list">${s.map(a=>Fi(a,a.key===t,n)).join("")}</div>
    </details>`}function qd(e,t,n){let o=a=>e.filter(i=>i.service[n.day].bucket===a),r=o("none").length,s=r===0?"":`
    <p class="muted rc-idle">${r} group${r===1?" runs":"s run"} on neither network on ${l(Pe[n.day])},
      so ${r===1?"it has":"they have"} no line to draw.</p>`;return`
    <div class="muted rc-by">Grouped by ${l(Ai[n.day])} trips, today \u2192 plan</div>
    ${st.map(a=>{let i=o(a);return i.length?nn(zd(Uo[a]),i,t,n):""}).join("")}
    ${s}`}function Xd(e,t){return`
    <tr><th>${e}</th>
      <td class="n">${t.cur_trips.toLocaleString()}</td>
      <td class="n">${t.prop_trips.toLocaleString()}</td>
      <td class="n ${Ho(t.pct_trips)}">${rn(t.pct_trips)}</td>
      <td class="n">${t.cur_hours.toFixed(1)}</td>
      <td class="n">${t.prop_hours.toFixed(1)}</td>
      <td class="n ${Ho(t.pct_hours)}">${rn(t.pct_hours)}</td></tr>`}function Zd(e){return e.prt.length===0?'<p class="muted">PRT\u2019s table has no row for this group.</p>':e.prt.map(n=>{let o=n.related_routes?`<div class="muted">PRT points riders to: ${l(n.related_routes)}</div>`:"",r=n.route_page?`<div><a class="link" href="${l(n.route_page)}" target="_blank" rel="noopener">PRT\u2019s page for this route \u2197</a></div>`:"";return`<div class="rc-prt">
      <div><b>${l(n.current_route||on)}${_i}${l(n.final_route||on)}</b>
        <span class="rc-cat">${l(n.category)}</span></div>
      ${o}${r}</div>`}).join("")}function Ni(e){let t=e.status==="new"?"":`
    <p class="rc-riders">${Math.round(e.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">\xB7 WPRDC route ridership, average weekday</span></p>`;return`
    <button type="button" class="link rc-back" data-select-route="">\u2190 All routes</button>
    <div class="place-head">
      <h2>${l(at(e))}</h2>
      <span class="rc-status ${l(e.status)}">${l(Go[e.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today \u2192 plan</th>
        <th class="n" colspan="3">revenue hours today \u2192 plan</th></tr></thead>
      <tbody>${k.map(n=>Xd(n,e.service[n])).join("")}</tbody>
    </table>
    ${t}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today\u2019s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT\u2019s own account, from its route crosswalk.</p>
    ${Zd(e)}

    <p class="note">This is a route group, not a corridor. One group\u2019s loss
      can be another group\u2019s gain: Carrick\u2019s 51 reads as \u221210% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${Ci()}</p>`}function Qd(e,t){return`<div class="lg-row lg-static"><i style="background:${e};border-radius:2px"></i>
    <span class="lg-lab">${t}</span></div>`}function ep(e,t){return`<div class="lg-row lg-static"><i class="lg-dotted" style="border-color:${e}"></i>
    <span class="lg-lab">${t}</span></div>`}function Bi(e,t,n,o,r,s){return`
    <button class="lg-row ${s?"off":""}" ${e}="${t}"
            aria-pressed="${!s}">
      <i style="background:${n};border-radius:2px"></i>
      <span class="lg-lab">${o}</span>
      <span class="lg-n">${r}</span>
    </button>`}function en(e,t,n,o){let r=vi[wi[e][0]];return Bi("data-route-bucket",e,r,t,n,o.includes(e))}function tp(e,t,n){return Bi("data-route-service",e,ee[e].color,Uo[e],t,n.includes(e))}function Ii(e){return`
    <div class="seg lg-weight" role="group" aria-label="Colour the routes by">
      ${["status","service"].map(n=>`
        <button data-route-reading="${n}" aria-pressed="${e===n}"
                class="${e===n?"active":""}">${_d[n]}</button>`).join("")}
    </div>`}function np(e,t){let n=Object.fromEntries([...st,"none"].map(o=>[o,0]));for(let o of e)n[o.service[t].bucket]+=1;return n}function op(e,t,n){let o=np(e,t),r=o.gone+o.halved+o.less,s=o.more+o.doubled+o.new,a=`${e.length.toLocaleString()} route groups \xB7 ${r} fewer trips \xB7 ${o.same} about the same \xB7 ${s} more \xB7 ${Pe[t]}`;return`
    <div class="lg-head"><b>${l(a)}</b></div>
    ${Ii("service")}
    ${st.filter(i=>o[i]>0).map(i=>tp(i,o[i],n)).join("")}
    <div class="lg-foot">Each group\u2019s trips today \u2192 plan on ${l(Pe[t])}, in the
      Stop-by-stop key\u2019s buckets and colours \u2014 a \xB110% band around no change.
      Route by route, which is not how access is measured: a group is
      not a corridor, and the 51 reads fewer trips while the new 45 runs much
      of the same street. Click a row to show or hide its lines; click a line to
      select its group.</div>`}function Ui({groups:e,day:t,hidden:n,serviceHidden:o,reading:r,selected:s}){if(s)return`
      <div class="lg-head"><b>${l(at(s))}</b>
        <span class="muted">\xB7 ${l(Go[s.status])} \xB7 ${l(Pe[t])}</span></div>
      ${Qd(ke,"today's alignment")}
      ${ep(nt,"proposed alignment")}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;if(!e)return'<div class="lg-head"><b>Route changes</b></div>';if(r==="service")return op(e,t,o);let a=Pd(e),i=a.split+a.merged,c=`${e.length.toLocaleString()} route groups \xB7 ${a.discontinued} discontinued \xB7 ${a.new} new \xB7 ${i} split or merged \xB7 ${Pe[t]}`;return`
    <div class="lg-head"><b>${l(c)}</b></div>
    ${Ii("status")}
    ${en("discontinued","discontinued \u2014 today\u2019s alignment",a.discontinued,n)}
    ${en("new","new \u2014 proposed alignment",a.new,n)}
    ${en("reshaped","split or merged \u2014 proposed alignment",i,n)}
    ${en("one-to-one","one-to-one \u2014 proposed alignment",a["one-to-one"],n)}
    <div class="lg-foot">A route group is PRT\u2019s own mapping of today\u2019s
      numbers onto the plan\u2019s, not a corridor. Patterns are the ones that
      run on ${l(Pe[t])}. Click a row to show or hide its lines;
      click a line to select its group.</div>`}function ji(e,{selected:t,reading:n="status"}){let o=l(e.name?`${e.route} ${e.name}`:e.route),r=l(Od[e.side]),s=l(Go[e.status]),a=n==="service"?` \xB7 ${l(Uo[e.bucket])}${e.pct===null?"":` (${rn(e.pct)} trips)`}`:"";return t?`${o} \xB7 <b>${r}</b> \xB7 ${s}${a}`:`<b>${o}</b> \xB7 ${r} \xB7 ${s}${a}`}var y={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes",route:"route",routeHidden:"routehide",routeReading:"routecolor",serviceHidden:"servicehide",drawnRoute:"drawn"},Ki=":",rp=/^[cp]:[\w.:-]{1,32}$/,mn={any:"any",selected:"selected"},sp="pin",Gi=5,Yi="none",gn=",";function Ji(e){try{return e.self!==e.top}catch{return!0}}function Vi(e){let t=new URLSearchParams;return t.set(y.view,e.view),t.set(y.day,e.day),t.set(y.radius,String(e.radius)),t.set(y.oneSeatDay,e.oneSeatRestricted?mn.selected:mn.any),t.set(y.dest,"key"in e.dest?e.dest.key:nr(e.dest)),e.weight==="riders"&&t.set(y.weight,e.weight),e.surfaceUnit==="people"&&t.set(y.surfaceUnit,e.surfaceUnit),e.at&&t.set(y.at,nr(e.at)),e.camera&&t.set(y.camera,`${nr(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(y.place,e.place),e.placeFill!==De&&t.set(y.placeFill,e.placeFill),e.selection.length&&t.set(y.selection,e.selection.join(",")),t.set(y.stopRoutes,e.stopRoutes??jt),e.route&&t.set(y.route,e.route),e.routeHidden&&!ap(e.routeHidden,No)&&t.set(y.routeHidden,e.routeHidden.length?e.routeHidden.join(gn):Yi),e.routeReading&&e.routeReading!==Io&&t.set(y.routeReading,e.routeReading),e.serviceHidden?.length&&t.set(y.serviceHidden,e.serviceHidden.join(gn)),e.drawnRoute&&t.set(y.drawnRoute,`${e.drawnRoute.side}${Ki}${e.drawnRoute.route_id}`),`?${t}`}function zi(e){let t=new URLSearchParams(e),n={},o=t.get(y.view);o&&Oa.includes(o)&&(n.view=o);let r=t.get(y.day);r&&k.includes(r)&&(n.day=r);let s=Number(t.get(y.radius));t.has(y.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(y.weight)==="riders"?n.weight="riders":t.get(y.weight)==="locations"&&(n.weight="locations"),t.get(y.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(y.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(y.oneSeatDay);a===mn.selected?n.oneSeatRestricted=!0:a===mn.any&&(n.oneSeatRestricted=!1);let i=t.get(y.dest);if(i&&i!==sp){let M=Wi(i);M?n.dest=M:i.includes(",")||(n.dest={key:i})}let c=Wi(t.get(y.at));c&&(n.at=c);let p=lp(t.get(y.camera));p&&(n.camera=p);let g=t.get(y.place);g&&(n.place=g);let b=t.get(y.selection);b!==null&&(n.selection=b.split(",").filter(M=>rp.test(M)));let h=t.get(y.placeFill);(h==="lost"||h==="gained"||h==="service")&&(n.placeFill=h);let w=t.get(y.stopRoutes);(w==="off"||w==="current"||w==="proposed")&&(n.stopRoutes=w);let _=t.get(y.route);_&&$i(_)&&(n.route=_);let m=t.get(y.routeHidden);if(m===Yi)n.routeHidden=[];else if(m){let M=Bo(m.split(gn).filter(sn));M.length&&(n.routeHidden=M)}let L=t.get(y.routeReading);L&&an(L)&&(n.routeReading=L);let D=t.get(y.serviceHidden);if(D){let M=jo(D.split(gn).filter(ln));M.length&&(n.serviceHidden=M)}let O=ip(t.get(y.drawnRoute));return O&&(n.drawnRoute=O),n}function ap(e,t){return e.length===t.length&&e.every((n,o)=>n===t[o])}function ip(e){if(!e)return null;let t=e.indexOf(Ki);if(t<0)return null;let n=e.slice(0,t),o=e.slice(t+1);return n!=="current"&&n!=="proposed"||!o?null:{side:n,route_id:o}}function nr(e){return`${e.lat.toFixed(Gi)},${e.lon.toFixed(Gi)}`}function Wi(e){let t=qi(e,2);return t?{lat:t[0],lon:t[1]}:null}function lp(e){let t=qi(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function qi(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var or="embed";var cp=["1","true","yes"];function Xi(e){let t=new URLSearchParams(e).get(or);return t!==null&&cp.includes(t.toLowerCase())}function Zi(e){let t=new URLSearchParams(e);return t.set(or,"1"),`?${t}`}function Qi(e){let t=new URLSearchParams(e);t.delete(or);let n=String(t);return n?`?${n}`:""}function el(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var tl="{view}";function nl(e,t){return e.includes(tl)?e.replace(tl,encodeURIComponent(t)):null}var se=["peek","half","full"],up=192,dp=.3,pp=.55,mp=.9,gp=.6,fp=.45;function fn(e,t){return e==="peek"?Math.min(up,t*dp):e==="half"?t*pp:t*mp}function hp(e,t,n=0){let o=se.map(s=>Math.abs(fn(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>gp&&(r=Math.max(0,Math.min(se.length-1,r+(n>0?1:-1)))),se[r]}function ol(e){return se[(se.indexOf(e)+1)%se.length]}function yp(e,t){return Math.min(e,t*fp)}function Ne(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function rr(e){let t=null,n=()=>{let o=Ne();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var bp=8,Sp=400;function rl(e){let t=d("side"),n=d("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,c={y:0,t:0};function p(){return window.innerHeight}function g(m){t.style.height=`${m}px`,e.onMove(m,yp(m,p()))}function b(m){o=m,t.dataset.snap=m,g(fn(m,p()))}n.addEventListener("pointerdown",m=>{Ne()&&(r=!0,s=m.clientY,a=t.getBoundingClientRect().height,i=m.timeStamp,c={y:m.clientY,t:m.timeStamp},t.classList.add("dragging"),n.setPointerCapture(m.pointerId))}),n.addEventListener("pointermove",m=>{if(!r)return;let L=a+(s-m.clientY),D=fn("peek",p()),O=fn("full",p());g(Math.max(D,Math.min(O,L))),c={y:m.clientY,t:m.timeStamp}});function h(m){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(m.clientY-s)>bp)&&m.timeStamp-i<Sp){b(ol(o));return}let D=m.timeStamp-c.t,O=D>0?(c.y-m.clientY)/D:0;b(hp(t.getBoundingClientRect().height,p(),O))}n.addEventListener("pointerup",h),n.addEventListener("pointercancel",h),n.addEventListener("keydown",m=>{m.key!=="Enter"&&m.key!==" "||(m.preventDefault(),Ne()&&b(ol(o)))});let w=rr(e.onLayoutChange);function _(){if(w(),!Ne()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",_),_(),{at:()=>Ne()?o:"full",atLeast(m){Ne()&&se.indexOf(m)>se.indexOf(o)&&b(m)}}}var wp=["llvmpipe","swiftshader","softpipe","basic render","software"];function sr(e){if(!e)return!1;let t=e.toLowerCase();return wp.some(n=>t.includes(n))}function al(e){let t=sr(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function il(e){return sr(e.renderer)?0:vp}var vp=300,Rp="https://tiles.openfreemap.org/styles/positron",Lp=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],sl=[],$p=19,_p='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',kp=!1;function ll(e){return!kp||!sr(e.renderer)?Rp:xp()}function xp(){let e=o=>({type:"raster",tileSize:256,attribution:_p,tiles:o,maxzoom:$p}),t={basemap:e(Lp)},n=[{id:"basemap",type:"raster",source:"basemap"}];return sl.length&&(t["basemap-labels"]=e(sl),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function cl(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Ep(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function ul(e,t,n){let o=new Map(n.map(c=>[c.layer,c])),r=null,s="",a=c=>{s!==c&&(s=c,e.getCanvas().style.cursor=c)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",c=>{let p=n.map(L=>L.layer).filter(L=>e.getLayer(L)&&e.getLayoutProperty(L,"visibility")!=="none");if(!p.length){i();return}let[g,...b]=e.queryRenderedFeatures(c.point,{layers:p});if(!g){i();return}a("pointer");let h=Ep(g);if(h===r)return;let w=o.get(g.layer?.id),_=w?w.html(g,b):null;if(_==null){r=null,t.remove();return}r=h;let m=w.anchor?w.anchor(g,c):c.lngLat;t.setLngLat(m).setHTML(_).addTo(e)}),e.on("mouseout",i),i}function Tp(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function Dp(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var Op="seg-current",dl="dd",Pp="open",pl="armed";function Mp(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(pl)}));return Tp(t)}function ml(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let c=a===n;i.group.classList.toggle(Pp,c),i.trigger.setAttribute("aria-expanded",String(c))}},r=s=>o(Dp(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let c=s.id||`controls-${a}`,p=s.querySelector(".lbl")?.textContent??"",g=document.createElement("button");g.type="button",g.className=Op,g.setAttribute("aria-haspopup","true"),g.setAttribute("aria-expanded","false");let b=document.createElement("div");b.className=dl,i.replaceWith(b),b.append(g,i);let h=()=>{let w=Mp(i);g.textContent=w.label,g.disabled=w.disabled,g.classList.toggle(pl,w.armed),g.setAttribute("aria-label",p?`${p}: ${w.label}`:w.label)};h(),new MutationObserver(h).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),g.addEventListener("click",()=>{r({kind:"trigger",group:c}),n===c&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",w=>{if(!w.target.closest("button"))return;let _=n===c;r({kind:"pick"}),_&&g.focus()}),t.set(c,{group:s,trigger:g,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${dl}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var gl="draft-stops-notice-dismissed-v1";function fl(e){if(e.embedded)return!1;try{return e.storage?.getItem(gl)!=="1"}catch{return!0}}function hl(e){try{e?.setItem(gl,"1")}catch{}}function yl(){try{return window.localStorage}catch{return null}}var Cp=[-79.9959,40.4406],Ap=12,Fp="#e2574c",hn=5,C={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},ct=zi(location.search),Ue=Xi(location.search);Ue&&d("app").classList.add("embed");{let e=yl(),t=d("notice");fl({embedded:Ue,storage:e})&&(t.addEventListener("close",()=>hl(e)),t.showModal())}var Hp={at:()=>"full",atLeast(){}},Ll=null,N=400,lt=null,R=null,ie=null,ye=0,T={key:"downtown"},fe=null,$l=!1,je=!1,$n="locations",Ge="area",U=jt,ar=0,X=null,be=null,bn=0,K="point",_l=60,kl=15;function Sn(){return U==="off"?"current":U}var xl="count",Rn=null,G=De,Se=null,W=!1,f="dots",ur,mr=[],dr=null,bl=()=>{},ir=cl(),u=new maplibregl.Map({container:"map",style:ll(ir),pixelRatio:al(ir),fadeDuration:il(ir),renderWorldCopies:!1,center:ct.camera?[ct.camera.lon,ct.camera.lat]:Cp,zoom:ct.camera?.zoom??Ap,cooperativeGestures:Ji(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{Lr(u),$s(u),Cs(u,Qe),Is(u,Qe),qs(u,"walk-fill"),ba(u),Ea(u,It),ja(u,Gt),ii(u,Qe),Ei(u,Qe),x(),u.on("click",t=>{if(W)return;if($l){pt({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(f==="places"){let s=u.queryRenderedFeatures(t.point,{layers:[me]})[0];s&&dt(s.properties.key);return}if(f==="routes"){let{x:s,y:a}=t.point,i=[[s-hn,a-hn],[s+hn,a+hn]],c=u.queryRenderedFeatures(i,{layers:Yo})[0];c?(ur.atLeast("half"),pr(c.properties.key)):wl();return}let n=[...Lt,...At].filter(s=>u.getLayoutProperty(s,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];kn(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});bl=ul(u,e,[...$r(t=>{let n=$t(),o=t.find(r=>Lt.includes(r.layer?.id));return n&&o?Qn(o.properties,v(),n.buckets,{pole:!1}):null}),...Lt.map(t=>({layer:t,html:n=>{let o=$t();return o?Qn(n.properties,v(),o.buckets):null},anchor:n=>n.geometry.coordinates})),...At.map(t=>({layer:t,html:n=>{let o=_e();return o?ta(n.properties,o):null},anchor:n=>n.geometry.coordinates})),{layer:Gt,html:t=>$o(t.properties)},{layer:Ba,html:t=>$o(t.properties)},...Yo.map(t=>({layer:t,html:n=>ji(n.properties,{selected:ge()!==null,reading:Fe()})})),{layer:me,html:t=>fi(t.properties,G,v())}]),am(),u.on("moveend",()=>{let t=u.getCenter();Ll={lat:t.lat,lon:t.lng,zoom:u.getZoom()},S(),E()}),he(C.radius,t=>{N=Number(t.dataset.radius),qn(u,N,v()).then(S),xt()&&oo(u,N,v()).then(S),Et()&&ao(N).then(S),_e()&&wn(),R&&Be(R.lat,R.lon)}),he(C.day,t=>{let n=t.dataset.day;Yr(n),f!=="journey"&&x(),Xn(u,n),Ln(),tm(),ro(u,n),f==="journey"&&R&&gr(R.lat,R.lon),Ot()&&Us(u,n).then(S),je&&_e()&&(wn(),R&&Be(R.lat,R.lon)),rt()&&G==="service"&&Zt(u,G,n),Ae()&&qp(),S()}),he(C.oneSeatDay,t=>{je=t.dataset.oneseatDay==="selected",cr(),wn(),R&&Be(R.lat,R.lon)}),he(C.view,t=>{let n=f;f=t.dataset.view,bl(),(f==="journey"||f==="places"||f==="routes")&&yr(),cs(u,f==="dots"||f==="both"),Kp(f==="surface"||f==="both"),Jp(f==="corridors"),Qp(f==="oneseat"),Zp(f==="journey",n==="journey"),Vp(f==="places"),zp(f==="routes"),f!=="journey"&&n!=="journey"&&(f==="oneseat"||n==="oneseat")&&x({scrollToTop:!0}),Xp(Mn(f)),Pl();let o=f==="oneseat"||f==="journey";d("dest-controls").classList.toggle("hidden",!o),d("oneseat-day-controls").classList.toggle("hidden",f!=="oneseat"),d("place-fill-controls").classList.toggle("hidden",f!=="places"),Hl(),Z()||vl(!1),Ie(),cr(),o||vn(!1),Dl()}),he(C.dest,t=>{let n=t.dataset.dest;if(n==="pin"){vn(!0);return}vn(!1),pt({key:n})}),he(C.placeFill,t=>{G=t.dataset.placeFill,rt()&&Zt(u,G,v()),x(),S(),cr()}),he(C.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=U!=="off"&&Wt()!==null;U=n,x(),o&&n!=="off"?(Ee(u,Wt(),n),B&&hr(B.radius)):Ln()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){$n=n.dataset.weight,S(),E();return}let o=t.target.closest("[data-surface-unit]");if(o){Ge=o.dataset.surfaceUnit,Yp(Ge),E();return}let r=t.target.closest("[data-route-bucket]");if(r&&sn(r.dataset.routeBucket)){Oi(u,r.dataset.routeBucket),S(),E();return}let s=t.target.closest("[data-route-service]");if(s&&ln(s.dataset.routeService)){Pi(u,s.dataset.routeService),S(),E();return}let a=t.target.closest("[data-route-reading]");if(a&&an(a.dataset.routeReading)){tr(u,a.dataset.routeReading),S(),Ae()&&x(),E();return}let i=t.target.closest("[data-bucket]");i&&(_s(u,i.dataset.bucket,v()),S())}),d("legend-reset").addEventListener("click",()=>{if(Ae()){Fe()==="service"?er(u,[]):Qo(u,[]),S(),E();return}ks(u,v()),S()}),d("legend-select").addEventListener("click",()=>vl(!W)),d("legend-clear").addEventListener("click",()=>{Vn(u),Ie(),S(),E()}),d("legend-collapse").addEventListener("click",()=>{lr(!d("legend-box").classList.contains("collapsed"))}),d("route-key").addEventListener("click",t=>{t.target.closest("[data-clear-route]")&&Al()}),d("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&pt({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&cm(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&dt(r.dataset.selectPlace);let s=t.target.closest("[data-select-route]");if(s){let c=s.dataset.selectRoute;c?pr(c):wl()}let a=t.target.closest("[data-sort-places]");a&&(xl=a.dataset.sortPlaces,x());let i=t.target.closest("[data-goto-place]");i&&(f!=="places"&&ae(C.view,"places"),dt(i.dataset.gotoPlace))}),d("side-toggle").addEventListener("click",Gp),Ue&&rr(lr),ur=Ue?Hp:rl({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:lr}),Bp(),Ip(),ml(),le(),Ie(),_n(),Np(ct),qn(u,N,v()).then(S),lm(),im()});function he(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),le(),E()})})}function ae(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Np(e){e.radius!==void 0&&ae(C.radius,String(e.radius)),e.day&&ae(C.day,e.day),e.oneSeatRestricted!==void 0&&ae(C.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&($n=e.weight),e.surfaceUnit&&(Ge=e.surfaceUnit),e.placeFill&&ae(C.placeFill,e.placeFill),e.routeHidden&&Qo(u,e.routeHidden),e.serviceHidden&&er(u,e.serviceHidden),e.routeReading&&tr(u,e.routeReading),e.dest&&("key"in e.dest?ae(C.dest,e.dest.key):pt(e.dest)),e.selection&&hs(u,e.selection),e.stopRoutes&&ae(C.stopRoutes,e.stopRoutes),e.view&&ae(C.view,e.view),e.drawnRoute&&Ml(e.drawnRoute,{fit:!e.camera}),e.at&&kn(e.at.lat,e.at.lon),e.place&&dt(e.place),e.route&&pr(e.route,{fly:!e.camera})}function E(){let e={view:f,day:v(),radius:N,oneSeatRestricted:je,weight:$n,surfaceUnit:Ge,dest:T,at:R,camera:Ll,place:Rn,placeFill:G,selection:ms(),stopRoutes:U,route:Se,routeHidden:dn(),routeReading:Fe(),serviceHidden:pn(),drawnRoute:X},t=Vi(e);history.replaceState(null,"",(Ue?Zi(t):t)+location.hash),_n(t),El()}function _n(e=Qi(location.search)){if(!Ue)return;let t=d("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f==="routes"?ge()?at(ge()):null:R?ie?qe(ie):"this point":null;t.querySelector(".el-action").textContent=el(n)}function El(){let e=d("report-link"),t=dr&&nl(dr,location.href);if(!t){e.classList.add("hidden");return}e.classList.remove("hidden"),e.href=t}function le(){d("statebar").innerHTML=K==="route"&&X&&be?Aa({short_name:be.short_name,side:X.side,day:v()}):Ma({view:f,day:v(),radius:N,oneSeatRestricted:je,destination:mt(),stopRoutes:U}),jp()}function lr(e){d("legend-box").classList.toggle("collapsed",e);let t=d("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Bp(){d("controls-toggle").addEventListener("click",()=>{ut(!d("app").classList.contains("controls-open"))}),d("controls-scrim").addEventListener("click",()=>ut(!1)),document.addEventListener("keydown",e=>{e.key==="Escape"&&ut(!1)})}function ut(e){d("app").classList.toggle("controls-open",e),d("controls-toggle").setAttribute("aria-expanded",String(e))}function Ip(){let e=Xa({elements:{group:d("search-controls"),input:d("search-input"),list:d("search-results"),opener:d("search-toggle")},search:async t=>{let{url:n,init:o}=Va(t),r=await fetch(n,o);if(!r.ok)throw new Error(r.statusText);return r.json()},onPick:t=>{switch(ut(!1),t.kind){case"stop":Sl(t.stop);break;case"address":Sl(t.address);break;case"place":Up(t.place);break;case"route":Ml({side:t.route.side,route_id:t.route.route_id},{fit:!0});break}}});d("search-toggle").addEventListener("click",()=>{ut(!0),e.focus()})}function Sl(e){let t=u.getBounds(),n=qa({zoom:u.getZoom(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()}},e);n&&u.easeTo({center:[n.lon,n.lat],zoom:n.zoom}),f!=="places"&&kn(e.lat,e.lon)}function Up(e){u.fitBounds(e.bbox,{padding:_l,maxZoom:kl}),f==="places"&&dt(e.key)}function jp(){d("controls-toggle").firstChild?.remove(),d("controls-toggle").prepend(document.createTextNode(Pa(f)))}function Gp(){let e=d("app").classList.toggle("side-collapsed"),t=d("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function S(){Wp()}function Wp(){if(d("legend-reset").classList.toggle("hidden",lo()||mo()||bo()||rt()||!(Z()||Ae())),bo()){d("legend").innerHTML=La(Ut());return}if(Ae()){d("legend").innerHTML=Ui({groups:zo(),day:v(),hidden:dn(),serviceHidden:pn(),reading:Fe(),selected:ge()});return}if(rt()){d("legend").innerHTML=gi({selected:oi(),fill:G,day:v(),boundaries:Po(),unchanged:ri()});return}if(lo()){let n=Ot();n&&sa(d("legend"),n);return}if(mo()){let n=_e();if(!n)return;let o=u.getBounds();aa(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=$t();if(!e)return;let t=u.getBounds();la(d("legend"),{layer:e,day:v(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:$n,dots:Z(),surface:no()?xt():null,unit:Ge,population:Et(),selection:ps()})}async function Kp(e){if(e&&!xt()){d("legend").classList.add("loading");try{await oo(u,N,v())}finally{d("legend").classList.remove("loading")}}As(u,e),e&&Ge==="people"&&await Tl(),S()}async function Tl(){if(!Et()){d("legend").classList.add("loading");try{await ao(N)}finally{d("legend").classList.remove("loading")}}}async function Yp(e){e==="people"&&no()&&await Tl(),S()}async function Jp(e){if(e&&!Ot()){d("legend").classList.add("loading");try{await co(u,v())}finally{d("legend").classList.remove("loading")}}js(u,e),S()}async function Vp(e){if(e&&(!Oo()||!Po())){d("legend").classList.add("loading");try{await Promise.all([li(),ci(u)])}finally{d("legend").classList.remove("loading")}}di(u,e),e&&Zt(u,G,v()),e&&x(),S()}async function dt(e){Rn=await We(()=>ui(u,e))?e:null,f==="places"&&(x(),Rn&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),S(),E()}async function zp(e){e&&await We(()=>qo(u,v())),Mi(u,e),e&&x({scrollToTop:!0}),S()}async function pr(e,{fly:t=!0}={}){Se=await We(()=>Xo(u,e,v(),{fly:t}))?e:null,f==="routes"&&x({scrollToTop:!0}),S(),E()}function wl(){!Se&&!ge()||(Zo(u),Se=null,f==="routes"&&x({scrollToTop:!0}),S(),E())}async function qp(){await We(async()=>{await qo(u,v()),Se&&await Xo(u,Se,v(),{fly:!1})}),f==="routes"&&x(),S()}function Xp(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function x({scrollToTop:e=!1}={}){if(e&&(d("panel").scrollTop=0),_n(),f==="places"){d("panel").innerHTML=pi(Oo()??[],xl,Rn,G);return}if(f==="routes"){let t=ge();d("panel").innerHTML=t?Ni(t):Hi(zo()??[],Se,{reading:Fe(),day:v()});return}if(K==="route"&&X){d("panel").innerHTML=be?Wa(be):rm();return}if(!ie){f==="oneseat"?d("panel").innerHTML=ss(mt()):Jr(d("panel"));return}if(f==="oneseat"){let t=rs(ie,T,v());if(t){d("panel").innerHTML=t;return}}os(ie,{withKerb:Z(),routes:U})}function Zp(e,t=!1){if(Sa(u,e),S(),!e){t&&(R?Be(R.lat,R.lon):x());return}Ut()&&R?d("panel").innerHTML=wo(Ut(),mt()):d("panel").innerHTML=Ra(mt())}async function gr(e,t){let n=++ye;R={lat:e,lon:t},yr(),E(),Fl(e,t);let o=Ol(),r=l(mt());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await P(wa({lat:e,lon:t},o,v()));if(n!==ye)return;So(u,s),d("panel").innerHTML=wo(s,r),S(),_n()}catch(s){if(n!==ye)return;So(u,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function cr(){d("day-controls").classList.toggle("hidden",!Qs(f,je,G))}function fr(){return Zs(je,v())}async function Qp(e){e&&!_e()&&await We(()=>go(u,N,T,fr())),ea(u,e),S()}async function wn(){await We(()=>go(u,N,T,fr())),S()}async function We(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function pt(e){if(T=e,vn(!1),em(),Dl(),le(),E(),f==="journey"){R&&gr(R.lat,R.lon),S();return}R?Be(R.lat,R.lon):x({scrollToTop:!0}),wn()}function Dl(){let e=Ol();if(!(e!==null&&(f==="journey"||f==="oneseat"&&"lat"in T))){fe?.remove(),fe=null;return}fe?fe.setLngLat([e.lon,e.lat]).addTo(u):(fe=new maplibregl.Marker({color:uo,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),fe.on("dragend",()=>{let n=fe.getLngLat();pt({lat:n.lat,lon:n.lng})}))}function em(){let e=Xs(T);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Ol(){if("lat"in T)return{lat:T.lat,lon:T.lon};let e=T.key,t=mr.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function mt(){if("lat"in T)return`${T.lat.toFixed(4)}, ${T.lon.toFixed(4)}`;let e=T.key;return mr.find(t=>t.key===e)?.name??e}function vn(e){$l=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Be(e,t){let n=++ye;R={lat:e,lon:t},yr(),E(),d("panel").classList.add("loading"),Fl(e,t),Cn(u),Ee(u,null,Sn()),d("pin-key").classList.add("hidden");try{let o="lat"in T?`&dest_lat=${T.lat.toFixed(6)}&dest_lon=${T.lon.toFixed(6)}`:"",r=await P(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${N}${o}&oneseat_day=${fr()}`);if(n!==ye)return;B={lat:e,lon:t,radius:N,now:r.current.stops,proposed:r.proposed.stops},ie=r,Hl(),Pl(),x({scrollToTop:!0})}catch(o){if(n!==ye)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ye&&d("panel").classList.remove("loading")}}var B=null;function Pl(){if(!B||!Mn(f)){Cn(u),d("pin-key").classList.add("hidden"),Ln();return}_r(u,B.lat,B.lon,B.radius,B.now,B.proposed),hr(B.radius),Ln()}function Ln(){let e=++ar,t=()=>{B&&hr(B.radius)};U!=="off"&&Z()&&R&&ie?.kerb?P(Ta(R,v())).then(n=>{e===ar&&(Ee(u,n,Sn()),Kt(u,!0),Da(u),t())}).catch(()=>{e===ar&&(Ee(u,null,Sn()),Kt(u,!1),t())}):(Ee(u,null,Sn()),Kt(u,!1),t())}function hr(e){let t=U!=="off"&&ka()&&xa(Wt(),U)?U:!1;d("pin-key").innerHTML=ia(e,{routes:t}),d("pin-key").classList.remove("hidden")}function yr(){K!=="point"&&(K="point",le())}function Ml(e,{fit:t}){K="route",Cl(e,{fit:t})}function tm(){X&&Cl(X,{fit:!1})}function nm(e,t){return e!==null&&e.side===t.side&&e.route_id===t.route_id}async function Cl(e,{fit:t}){let n=++bn;nm(X,e)||(be=null),X=e,E(),le(),K==="route"&&x({scrollToTop:!0});try{let o=await P(Ia(e,v()));if(n!==bn)return;be=o,xo(u,o),om(o),t&&o.bbox&&u.fitBounds(o.bbox,{padding:_l,maxZoom:kl}),le(),K==="route"&&x({scrollToTop:!0})}catch(o){if(n!==bn)return;let r=K==="route";Al(),r&&(d("panel").innerHTML=`<div class="empty"><h2>No such route</h2>
        <p class="muted">${l(o.message)}</p></div>`)}}function Al(){bn++,X=null,be=null,xo(u,null),d("route-key").classList.add("hidden"),K==="route"&&(K="point",x({scrollToTop:!0})),le(),E()}function om(e){d("route-key").innerHTML=Ga(e),d("route-key").classList.remove("hidden")}function rm(){return`<div class="empty"><h2>Finding the route\u2026</h2>
    <p class="muted">Fetching its shapes and PRT's crosswalk row.</p></div>`}function Fl(e,t){lt?lt.setLngLat([t,e]):(lt=new maplibregl.Marker({color:Fp,draggable:!0}).setLngLat([t,e]).addTo(u),lt.on("dragend",()=>{let n=lt.getLngLat();kn(n.lat,n.lng)}))}var yn=14;function Z(){return f==="dots"||f==="both"}function vl(e){W=e&&Z(),W?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=W?"none":"",W||Nl(),Ie()}function Hl(){let e=Z()&&!!ie?.kerb;d("stop-routes-controls").classList.toggle("hidden",!e)}function Ie(){let e=d("legend-select");e.classList.toggle("hidden",!Z()),e.setAttribute("aria-pressed",String(W)),e.textContent=W?"Selecting":"Select stops",d("legend-clear").classList.toggle("hidden",!Z()||!gs())}function sm(e,t){let n=d("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!W}function Rl(e){d("brush").classList.toggle("painting",e)}function Nl(){d("brush").hidden=!0}function am(){let e=d("brush");e.style.width=`${yn*2}px`,e.style.height=`${yn*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Ie(),S()}))},s=()=>{W&&(t=!0,n=!1,Rl(!0))},a=c=>{if(sm(c.point.x,c.point.y),!t)return;n=!0,Jn(u,zn(u,c.point.x,c.point.y,yn))&&r()},i=c=>{if(Rl(!1),!!t){if(t=!1,!n){let[p]=zn(u,c.point.x,c.point.y,yn);p&&fs(u,p)}Ie(),S(),E()}};u.on("mousedown",s),u.on("mousemove",a),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",Nl),u.on("touchstart",s),u.on("touchmove",a),u.on("touchend",i)}function kn(e,t){if(ur.atLeast("half"),f==="journey"){gr(e,t);return}f!=="places"&&f!=="routes"&&Be(e,t)}async function im(){try{mr=await P("/api/destinations"),le()}catch{}}async function lm(){try{let e=await P("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;d("feedline").textContent=t,d("feedline-methods").textContent=t,d("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join(""),dr=e.feedback?.url_template??null,El()}catch{}}function cm(e){d("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
