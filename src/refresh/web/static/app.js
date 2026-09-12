"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function P(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Tn=new Map;function J(e){let t=Tn.get(e);if(t)return t;let n=P(e).catch(o=>{throw Tn.delete(e),o});return Tn.set(e,n),n}function l(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function we(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function On(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Dn(e){return e>0?`+${e}`:String(e)}function Sr(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Il="#15181e",wr="#ffa23a",Ul="#ffffff";function jl(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let c=i/o*2*Math.PI;r.push([t+a*Math.cos(c),e+s*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function Y(e){return{type:"FeatureCollection",features:e}}function Gl(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Wl(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function Pn(e){return e!=="corridors"&&e!=="journey"&&e!=="places"&&e!=="routes"}function Mn(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(Y([]))}function vr(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Rr(e){e.addSource("walk",{type:"geojson",data:Y([])}),e.addSource("stops-now",{type:"geojson",data:Y([])}),e.addSource("stops-prop",{type:"geojson",data:Y([])}),e.addSource("stop-moves",{type:"geojson",data:Y([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":wr,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Ul,"circle-stroke-width":3,"circle-stroke-color":wr}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Il,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function Lr(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Wl(n.properties,e(o))}))}function $r(e,t,n,o,r,s){e.getSource("walk").setData(Y([jl(t,n,o)])),e.getSource("stops-now").setData(Y(vr(r,"current"))),e.getSource("stops-prop").setData(Y(vr(s,"proposed"))),e.getSource("stop-moves").setData(Y(Gl(s)))}var k=["weekday","saturday","sunday"],Cn=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],_r={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},gt=4,ft=6,kr=e=>ft+gt*e,xr=e=>ft+1+gt*e,We=e=>ft+2+gt*e,Kl=e=>ft+3+gt*e,ht=2,Jl=3,Ke=4,Er=5,ve=e=>e[Jl],A=(e,t)=>e[t],Tr=(e,t)=>e[Kl(t)],An=e=>2+2*e,Fn=e=>3+2*e,yt=4,Or=e=>2+yt*e,Dr=e=>3+yt*e,Pr=e=>4+yt*e,Mr=e=>5+yt*e;var Yl=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],Vl=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],Cr=1e-6,zl=32;function Hr(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=Yl.map(([i,c])=>(e+i*r+c*s)**3);return Vl.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function Ar(e,t,n){return Hr(e,t,n).every(o=>o>=-Cr&&o<=1+Cr)}function ql(e,t,n){if(Ar(e,t,n))return t;let o=0,r=t;for(let s=0;s<zl;s++){let a=(o+r)/2;Ar(e,a,n)?o=a:r=a}return o}function Xl(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function Zl(e,t,n){let[o,r,s]=Hr(e,ql(e,t,n),n);return`#${[o,r,s].map(a=>Xl(a).toString(16).padStart(2,"0")).join("")}`}var Fr=/(\d+)/;function Ql(e,t){let n=e.split(Fr),o=t.split(Fr);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function Je(e){let t=[...new Set(e)].sort(Ql);return new Map(t.map((n,o)=>[n,Zl(.55,.16,o*360/t.length)]))}var Nr="at this stop",Br=e=>`within ${e} m`,ec="both directions",tc="one or both directions",Nn="weekday";function v(){return Nn}function Kr(e){Nn=e}function Jr(e){e.innerHTML=`
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
    </div>`}function Yr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function nc(e,t){let n=Math.max(1,...Cn.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Cn.map(o=>{let r=e.periods[o]??0,s=t.periods[o]??0,a=s-r,i=a>0?"up":a<0?"down":"flat";return`
      <tr>
        <th>${_r[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${a===0?"\xB7":Dn(a)}</td>
      </tr>`}).join("")}function Vr(e){return e.length?e.map(t=>`<span class="route">${l(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Ir(e){return e.first==null?'<span class="muted">no service</span>':`${we(e.first)}\u2013${we(e.last)}`}function Ur(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var oc={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},rc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function sc(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':bt(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${l(o.name)}</span>
          <span class="os-status ${l(o.status)}">${oc[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${rc[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${ce("one-seat")}</p>
    </div>`:""}function ce(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ye(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function jr(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Gr(e){return e.first==null||e.last==null?null:e.last-e.first}function bt(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Wr(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Wr(t,o,"prop",r("proposed"))}</div>
    </div>`}function Wr(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${l(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var Hn=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,ac="Allegheny";function ze(e){let t=e.place?.muni?.trim()??"",n=Hn.exec(t)?.[1],o=n===ac?t.replace(Hn,""):n?`${t.replace(Hn,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Ve(e){return e==="weekday"?"weekday":e}function zr(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ve(t)}`}function ic(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function lc(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function cc(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${ce("one-direction")}</dt>
      ${Ye(r(n,e.routes),r(o,t.routes))}`}function qr(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Ve(t)}, today only</span>`;return`<dt>Boardings ${l(n)}</dt><dd>${s}${r}</dd>`}function Xr(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${ce("boardings")}</p>`}function uc(e){if(!e)return"";let t=l(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
    </div>`}function Zr(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
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
        ${s===0?"no change":`${Dn(s)} trips`}
        <div class="muted">${Sr(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ve(n)} ${l(o)}${r?`, ${l(r)}`:""}</div>`}function Qr(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${nc(e,t)}</tbody>
    </table>`}function es(e,t){let n=Ur(e),o=Ur(t),r=Gr(e),s=Gr(t);return`
      <dt>First and last</dt>
      ${Ye(Ir(e),Ir(t))}
      <dt>Hours between</dt>
      ${Ye(On(r),On(s),jr(r,s,"more"))}
      <dt>Typical wait</dt>
      ${Ye(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,jr(n,o,"less"))}`}function ts(e,t,n,o){return`
    <div class="routes">
      <h3>${l(n)}</h3>
      ${bt(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${ce("location-not-route")}</p>
    </div>`}function dc(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${Ve(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${Ve(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${ce("stop-routes")}</p>`}function pc(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:Je((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${l(i)}
        <span class="muted">\xB7 PRT stop ${l(e.stop_id)}</span></div>
      ${Zr(o,r,t,Nr)}
      <div class="tiers">${Yr(o.hourly,r.hourly)}</div>
      ${Qr(o,r)}
      <dl class="facts">
        ${es(o,r)}
        ${qr(o.boardings,t,Nr)}
      </dl>
      ${Xr(o.boardings)}
      ${ts(o,r,"Routes calling at this stop",a)}
      ${dc(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${ce("kerb")}</p>
    </section>`}function Bn(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],s=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Zr(o,r,t,Br(e.radius),{directions:s?tc:ec})}

    <div class="tiers">${Yr(o.hourly,r.hourly)}</div>

    ${Qr(o,r)}
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
      ${es(o,r)}
      ${cc(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Ye(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${lc(e.current.stops)}
      ${ic(e.proposed.stops)}
      ${qr(o.boardings,t,Br(e.radius))}
    </dl>
    ${Xr(o.boardings)}

    ${n}

    ${uc(e.population)}

    ${ts(o,r,"Routes serving this spot")}`}function mc(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,s=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${l(ze(e))}</h2>
      <div class="muted">${s}</div>
    </div>
    ${r?pc(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${Bn(e,t,sc(e.oneseat??[],e.oneseat_day??"any"))}`}function ns(e,t={}){document.getElementById("panel").innerHTML=mc(e,Nn,t)}var gc={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},fc={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},hc={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function yc(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function In(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Vr(t)}</div>`:""}function bc(e){let t=In("kept",e.kept)+In("lost",e.lost)+In("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Sc(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${bt(e.current,e.proposed)}
    </div>`}function wc(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${l(r.key)}">
      <span class="os-name">${l(r.name)}</span>
      <span class="os-status ${l(r.status)}">${vc[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var vc={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Rc(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${hc[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function os(e,t,n){let o=yc(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":bc(o)+Sc(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${l(o.name)}</h2>
      <div class="muted">
        from ${l(ze(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${l(o.status)}">${gc[o.status]}</div>
    <p class="note">${fc[o.status]} ${Rc(r)}</p>

    ${s}

    ${wc(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${zr(e,n)}</summary>
      ${Bn(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function rs(e){return`
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
    </div>`}var ee={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Re="change",te="change-dots",ue=["boolean",["feature-state","selected"],!1],ss="#15181e",de=["==",["get","published"],0],vt="newplace",Lc="#15181e",$c=5,wt=["==",["get","removed"],1],Rt="removedstop",Xe="change-removed",Gn="change-removed-selected",Un="removed-cross",is="#e8232f";function _c(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,is]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var Wn=["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1];function Kn(e){return e.hasImage(Un)||e.addImage(Un,_c(),{pixelRatio:2}),Un}var St=null,Q=new Set,j=new Set,kc=[te,Gn,Xe],Lt=[te,Xe],Ze=te;function ls(e,t){for(let n of kc)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function $t(){return St}function Qe(e){return Q.has(e)}function cs(e,t,n,o){return r=>Tc(r,e,t,n,o)}function us(e){return t=>e.has(ve(t))}function ds(){return j}function ps(){return[...j].sort()}function ms(){return j.size}function Jn(e,t){let n=0;for(let o of t)j.has(o)||(j.add(o),qe(e,o,!0),n++);return n}function gs(e,t){j.delete(t)?qe(e,t,!1):(j.add(t),qe(e,t,!0))}function fs(e,t){Yn(e),Jn(e,t)}function Yn(e){for(let t of j)qe(e,t,!1);j.clear()}function qe(e,t,n){try{e.setFeatureState({source:Re,id:t},{selected:n})}catch{}}function xc(e){for(let t of j)qe(e,t,!0)}function Ec(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function Vn(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[te,Xe].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[c,p]=i.geometry.coordinates,g=e.project([c,p]);return{id:i.id,x:g.x,y:g.y}});return Ec(t,n,o,a)}function hs(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||A(s,ht)===0||A(s,Ke)===1)continue;let a=n[A(s,We(t))];a!==void 0&&r[a]++}return r}function ys(e,t){let n=0;for(let o of e)t(o)&&A(o,ht)===0&&n++;return n}function bs(e,t){let n=0;for(let o of e)t(o)&&A(o,Ke)===1&&n++;return n}function Tc(e,t,n,o,r){let s=A(e,0),a=A(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function Ss(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||A(s,ht)===0)continue;let a=n[A(s,We(t))];if(a===void 0)continue;let i=Tr(s,t),c=A(s,Ke)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(c){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function Oc(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>k.some((o,r)=>t[A(n,We(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ve(n),published:n[2],removed:n[Ke],name:n[Er],moved:e.moved?.[ve(n)]??null,replacement:e.replacement?.[ve(n)]?.[0]??null,nearestStraight:e.replacement?.[ve(n)]?.[1]??null,...Object.fromEntries(k.flatMap((o,r)=>[[`b${r}`,t[A(n,We(r))]],[`sc${r}`,n[kr(r)]],[`sp${r}`,n[xr(r)]]]))}}))}}function ws(e,t){let n=Object.entries(ee).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,ee.none[t]]}function vs(e){return["case",de,"rgba(0,0,0,0)",ws(e,"color")]}function jn(e){return["case",de,$c,ws(e,"size")]}function Rs(e){return["interpolate",["linear"],["zoom"],9,["*",jn(e),.45],12,jn(e),16,["*",jn(e),1.9]]}function Ls(e){e.addSource(Re,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:te,type:"circle",source:Re,paint:{"circle-color":vs(0),"circle-radius":Rs(0),"circle-opacity":.85,"circle-stroke-color":["case",ue,ss,de,Lc,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ue,1.6,de,.9,.5],12,["case",ue,2.4,de,1.5,1],16,["case",ue,3.2,de,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Gn,type:"circle",source:Re,filter:wt,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":ss,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ue,1.6,0],12,["case",ue,2.4,0],16,["case",ue,3.2,0]]}},"walk-fill"),e.addLayer({id:Xe,type:"symbol",source:Re,filter:wt,layout:{"icon-image":Kn(e),"icon-size":Wn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function zn(e,t,n){return St=await J(`/api/change?radius=${t}`),e.getSource(Re).setData(Oc(St)),xc(e),qn(e,n),St}function qn(e,t){let n=k.indexOf(t);e.setPaintProperty(te,"circle-color",vs(n)),e.setPaintProperty(te,"circle-radius",Rs(n)),Xn(e,t)}function $s(e,t,n){Q.has(t)?Q.delete(t):Q.add(t),Xn(e,n)}function _s(e,t){Q.clear(),Xn(e,t)}function Xn(e,t){let n=k.indexOf(t),o=["none",...Q],r=["case",de,!Q.has(vt),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(te,["all",["!",wt],r]);let s=["all",wt,!Q.has(Rt)];e.setFilter(Xe,s),e.setFilter(Gn,s)}function Dc(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function Zn(e,t,n,{pole:o=!0}={}){let r=k.indexOf(t),s=e[`b${r}`],a=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(h=>h.key===s)?.label??s,c=e[`sc${r}`],p=e[`sp${r}`],g=t==="weekday"?"weekday":t,b=a?`Currently ${c}`:`${c} \u2192 ${p}`;return`${o?Dc(e):""}${Mc(e)}${b} buses per ${g} at this stop<br>${a?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var Pc=1.5,as=800;function Mc(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??as,r=n!=null&&o>n*Pc?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${as} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${is}">Stop removed</b> \u2014 ${s}<br>`}var Qn="surface",kt="surface-fill",ks="#6b7280",eo=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,ks],[.138,ks],[1,"#bd60e7"],[2,"#961bed"]],F="#e8232f",H="#0f79c9",xs=2,_t=null,Es=!1;function xt(){return _t}function to(){return Es}function Ts(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-xs,Math.min(xs,n))}function Os(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Ds(e,t,n,o,r,s,a,i){let c={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let g=a.lat0+(p[1]+.5)*a.dlat,b=a.lon0+(p[0]+.5)*a.dlon;if(g<o||g>s||b<n||b>r)continue;let h=p[An(t)],w=p[Fn(t)],_=Os(h,w);if(_!=="none")if(_==="ramp"){let m=Ts(h,w);c[m<-.138?"less":m>.138?"more":"same"]+=i}else c[_]+=i}return c}function Cc(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,c=n+s[0]*r,p=c+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,a],[p,a],[p,i],[c,i],[c,a]]]},properties:Object.fromEntries(k.flatMap((g,b)=>{let h=s[An(b)],w=s[Fn(b)];return[[`k${b}`,Os(h,w)],[`v${b}`,Ts(h,w)??0]]}))}})}}function Ps(e){return["case",["==",["get",`k${e}`],"gone"],F,["==",["get",`k${e}`],"new"],H,["interpolate",["linear"],["get",`v${e}`],...eo.flatMap(([t,n])=>[t,n])]]}function Le(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Ms(e,t){e.addSource(Qn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:kt,type:"fill",source:Qn,layout:{visibility:"none"},paint:{"fill-color":Ps(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,Le(0,.85),13,Le(0,.62),16,Le(0,.45)]}},t)}async function no(e,t,n){return _t=await J(`/api/surface?radius=${t}`),e.getSource(Qn).setData(Cc(_t)),oo(e,n),_t}function oo(e,t){let n=k.indexOf(t);e.setPaintProperty(kt,"fill-color",Ps(n)),e.setPaintProperty(kt,"fill-opacity",["interpolate",["linear"],["zoom"],9,Le(n,.85),13,Le(n,.62),16,Le(n,.45)])}function Cs(e,t){Es=t,e.setLayoutProperty(kt,"visibility",t?"visible":"none")}var ro=null;function Et(){return ro}async function so(e){return ro=await J(`/api/population?radius=${e}`),ro}function As(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let c of e){let p=a.lat0+(c[1]+.5)*a.dlat,g=a.lon0+(c[0]+.5)*a.dlon;p<o||p>s||g<n||g>r||(i.lost+=c[Or(t)],i.gained+=c[Dr(t)],i.kept+=c[Pr(t)],i.none+=c[Mr(t)])}return i}var ao="corridor",Fs="corridor-lines",$e="#8b929c",Ac="#6f7783",Ot={lost:F,added:H,kept:$e};var Tt=null,Hs=!1;function Dt(){return Tt}function io(){return Hs}function Fc(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Ns(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Hc(){let e=t=>["match",["get","klass"],"lost",Ot.lost,"added",Ot.added,t];return["interpolate",["linear"],["zoom"],9,e(Ac),14,e($e)]}function Nc(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Bc(){return["match",["get","klass"],"kept",.85,.9]}function Bs(e,t){e.addSource(ao,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Fs,type:"line",source:ao,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Hc(),"line-width":Nc(),"line-opacity":Bc()}},t)}async function lo(e,t){return Tt=await P(`/api/corridors?day=${t}`),e.getSource(ao).setData(Fc(Tt)),Tt}async function Is(e,t){k.includes(t)&&await lo(e,t)}function Us(e,t){Hs=t,e.setLayoutProperty(Fs,"visibility",t?"visible":"none")}var co="#2b3038",Gs="#b9bec6",et={loses:{color:F,size:6},gains:{color:H,size:6},keeps:{color:$e,size:3},here:{color:co,size:3.5},none:{color:Gs,size:1.8}};var V="loses_retired",Ct=["loses",V,"gains","keeps","none","here"];function uo(e,t){let n=e===V?"loses":e,o=t.find(r=>r.key===n)?.label??n;return e==="loses"?`${o} \u2014 stop kept`:e===V?`${o} \u2014 stop retired`:o}function Ws(e){return{...e.counts,loses:e.counts.loses-e.retired.loses,[V]:e.retired.loses}}var Pt="oneseat",Ks="oneseat-dots",Js="oneseat-removed",js=["all",["==",["get","status"],"loses"],["==",["get","removed"],1]],At=[Ks,Js],Mt=null,Ys=!1;function _e(){return Mt}function po(){return Ys}function Vs(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;a[V]=0;for(let i of e){let c=i[0],p=i[1];if(c<o||c>s||p<n||p>r)continue;let g=t[i[3]];g!==void 0&&a[g==="loses"&&i[6]===1?V:g]++}return a}function Ic(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5],removed:n[6]??0}}))}}function Uc(){return["match",["get","status"],...Object.entries(et).flatMap(([e,t])=>[e,t.color]),Gs]}function jc(){let e=["match",["get","status"],...Object.entries(et).flatMap(([t,n])=>[t,n.size]),et.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function zs(e,t){e.addSource(Pt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ks,type:"circle",source:Pt,filter:["!",js],layout:{visibility:"none"},paint:{"circle-color":Uc(),"circle-radius":jc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t),e.addLayer({id:Js,type:"symbol",source:Pt,filter:js,layout:{visibility:"none","icon-image":Kn(e),"icon-size":Wn,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},t)}function Gc(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Wc="pin";function qs(e){return"key"in e?e.key:Wc}var Ft="any";function Kc(e,t,n){return`radius=${e}&${Gc(t)}&day=${n}`}function Xs(e,t){return e?t:Ft}function Zs(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function mo(e,t,n,o=Ft){return Mt=await P(`/api/oneseat?${Kc(t,n,o)}`),e.getSource(Pt).setData(Ic(Mt)),Mt}function Qs(e,t){Ys=t;for(let n of At)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function go(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function ea(e,t){let n=e.status==="loses"&&e.removed===1?V:e.status,o=uo(n,t.statuses),r=(e.current||"").split(";").filter(Boolean),s=(e.proposed||"").split(";").filter(Boolean),a=c=>c.length?c.join(", "):"none",i=go(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${o}</b> \u2014 ${i}<br>today: ${a(r)}<br>proposed: ${a(s)}`}var Ht={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},fo={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Jc=new Set(["gone","new"]),Yc="stop kept";function Vc(e,t,n){return Jc.has(e)?`${t}, ${Yc} (${fo[n]})`:t}function zc(e){return e.buckets.filter(t=>t.key!=="none")}var ta={area:"Ground",people:"People"};function qc(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=Ds(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Xc(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=As(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Zc=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function na(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1}=e,c=eo.map(([p,g])=>`${g} ${((p+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${c})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${F}"></i>loses all service
          (${fo[n]})</span>
        <span><i style="background:${H}"></i>new service
          (${fo[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(ta).map(p=>`
          <button data-surface-unit="${p}" aria-pressed="${r===p}"
                  class="${r===p?"active":""}">${ta[p]}</button>`).join("")}
      </div>
      ${a?Zc:r==="people"?Xc(n,o,s):qc(t,n,o)}
    </div>`}var Qc=["lost","added","kept"],eu={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},tu={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ra(e,t){let{lostPct:n,addedPct:o}=Ns(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${tu[t.day]}
    </div>
    ${Qc.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${Ot[i]}"></i>
        <span class="lg-lab">${l(eu[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function sa(e,t,n){let o=t.statuses.map(h=>h.key),r=Vs(t.points,o,n.west,n.south,n.east,n.north),s=Ws(t),a=h=>uo(h,t.statuses),i=h=>h===V?'<i class="lg-cross"></i>':`<i style="background:${et[h].color}"></i>`,c=Ct.reduce((h,w)=>h+(r[w]??0),0),p=go(t),g=t.day&&t.day!==Ft,b=g?`Restricted to routes running on ${Ht[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
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
      South Hills would read as losing rides the Blue Line still runs.</div>`}function aa(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var oa={locations:"Stops",riders:"Riders"};function nu(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function ou(e){if(!e)return"";let t=Qe(vt);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${vt}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function ru(e,t){if(!e)return"";let n=Qe(Rt);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Rt}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop \u2014 no bus here on any day</span>
      <span class="lg-n">${t}</span>
    </button>`}function su(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${ou(e)}
      ${ru(t,n)}
    </div>`}function ia(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:c,selection:p,dots:g=!0}=t,b=n.buckets.map($=>$.key),h=n.days.indexOf(o),{west:w,south:_,east:m,north:L}=r,O=zc(n),D=p&&p.size>0?p:null,M=D?us(D):cs(w,_,m,L),yr=hs(n.points,h,b,M),kn=ys(n.points,M),xn=bs(n.points,M),I=s==="riders"?Ss(n.points,h,b,M):null,Cl=$=>I?I.measured[$]?Math.round(I.riders[$]).toLocaleString():"\u2014":yr[$].toLocaleString(),Al=I?I.removedMeasured?Math.round(I.removedRiders).toLocaleString():"\u2014":xn.toLocaleString(),Fl=D?`at ${D.size.toLocaleString()} selected stop${D.size===1?"":"s"}`:"in view",br=O.reduce(($,En)=>$+yr[En.key],0)+kn+xn,Hl=I?`<b>${Math.round(O.reduce(($,En)=>$+I.riders[En.key],0)+I.removedRiders).toLocaleString()}</b> daily boardings ${Fl}`:D?`<b>${br.toLocaleString()}</b>
         of ${D.size.toLocaleString()} selected stops`:`<b>${br.toLocaleString()}</b>
         stops in view`,Nl=a?` \xB7 surface: ${n.radius} m walk`:"",Bl=!g&&!!a;e.innerHTML=Bl?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${Ht[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${na({layer:a,day:o,bounds:r,unit:i,population:c,scoped:!!D,named:!0})}`:`
    <div class="lg-head">
      ${Hl}
      <span class="muted">\xB7 ${Ht[o]}${Nl}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(oa).map($=>`
        <button data-weight="${$}" aria-pressed="${s===$}"
                class="${s===$?"active":""}">${oa[$]}</button>`).join("")}
    </div>
    ${O.map($=>`
      <button class="lg-row ${Qe($.key)?"off":""}" data-bucket="${l($.key)}"
              aria-pressed="${!Qe($.key)}">
        <i style="background:${ee[$.key]?.color??"#666"}"></i>
        <span class="lg-lab">${l(Vc($.key,$.label,o))}</span>
        <span class="lg-n">${Cl($.key)}</span>
      </button>`).join("")}
    ${su(kn,xn,Al)}
    ${a?na({layer:a,day:o,bounds:r,unit:i,population:c,scoped:!!D}):""}
    ${I?nu(I.unmeasured,kn):""}
    ${D?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var ke="#4aa3ff",tt="#ffa23a",ho="headline",Nt="journey",It="journey-rides",ga="journey-walks",au=[It,ga],fa=null,ha=!1;function Ut(){return fa}function yo(){return ha}function iu(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,c=a.to??e.destination,p=[[i.lon,i.lat],[c.lon,c.lat]],g=a.path?.length?a.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:g},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function la(){return["match",["get","side"],"current",ke,"proposed",tt,ke]}function ca(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function ya(e,t){e.addSource(Nt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:It,type:"line",source:Nt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":la(),"line-width":ca(1),"line-opacity":.85}},t),e.addLayer({id:ga,type:"line",source:Nt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":la(),"line-width":ca(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ba(e,t){ha=t;for(let n of au)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function bo(e,t){fa=t;let n=t?iu(t,ho):{type:"FeatureCollection",features:[]};e.getSource(Nt).setData(n)}function Sa(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var ua=e=>`${e.toFixed(1)} min`;function wa(e){return e==null?"\u2014":e===0?"no change":e>0?`${ua(e)} slower`:`${ua(-e)} faster`}function da(e,t){return e?e.name?l(e.name):`stop ${l(e.stop_id)}`:t}function lu(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=da(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${l(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${da(e.to,"the destination")}</span></div>`}function pa(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(lu(r,t)),o=r}return n.join("")}var cu={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Bt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function uu(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function du(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Bt(t.current)} \u2192
        ${Bt(t.proposed)} min</span>
        <span class="muted">${wa(t.change_min)}</span></div>
      ${o}
    </div>`}function ma(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function So(e,t){let n=e.radii[ho],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
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
        <p>${cu[n.classification]??""}</p>
      </div>
      ${ma(e)}`:`${r}
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
      <div class="hl-delta ${o}">${wa(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${uu(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?pa(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?pa(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${du(e)}
    ${ma(e)}`}function va(e){return`
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
    </div>`}function Ra(e){let t=e?e.radii[ho].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${ke}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${tt}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var jt="off",pu="stoproutes",Gt="stoproutes-lines",mu="stoproutes-flow",gu="stoproutes-arrows",wo="stoproutes-arrow",fu=3.5,$a=null;function Wt(){return $a}function _a(){return xe.isVisible()}function ka(e,t){return e!==null&&e[t].length>0}function hu(e,t){let n=t==="current"?e.current:e.proposed,o=Je(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function yu(e){return["interpolate",["linear"],["zoom"],9,e*.6,14,e]}function bu(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function vo({ids:e,width:t=fu}){let n=[e.lines,e.flow,e.arrows],o=!1,r=Ru(e.flow);return{init(s,a){s.addSource(e.source,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),s.addLayer({id:e.lines,type:"line",source:e.source,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":yu(t),"line-opacity":.85}},a),s.addLayer({id:e.flow,type:"line",source:e.source,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},a),s.hasImage(wo)||s.addImage(wo,bu(),{pixelRatio:2,sdf:!0}),s.addLayer({id:e.arrows,type:"symbol",source:e.source,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":wo,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},a)},setVisible(s,a){o=a;for(let i of n)s.setLayoutProperty(i,"visibility",a?"visible":"none");a||r.stop()},setData(s,a){s.getSource(e.source).setData(a)},startFlow:r.start,stopFlow:r.stop,isVisible:()=>o}}var xe=vo({ids:{source:pu,lines:Gt,flow:mu,arrows:gu}});function xa(e,t){xe.init(e,t)}function Kt(e,t){xe.setVisible(e,t)}function Ee(e,t,n){$a=t,xe.setData(e,t?hu(t,n):{type:"FeatureCollection",features:[]}),t||xe.stopFlow()}function Ea(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var Ro={current:"today",proposed:"proposed"};function Lo(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${l(e.color)}"></i> <b>${l(e.route)}</b>${e.name?` \u2014 ${l(e.name)}`:""}<br><span style="opacity:.75">${Ro[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var Su=20;function wu(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var La=wu(3,4,24);function vu(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function Ru(e){let t=null,n=0,o=0,r=null,s=i=>{r&&(t=requestAnimationFrame(s),!(i-o<1e3/Su)&&(o=i,n=(n+1)%La.length,r.setPaintProperty(e,"line-dasharray",La[n])))},a=()=>{r&&(document.hidden?t!==null&&(cancelAnimationFrame(t),t=null):t===null&&(o=0,t=requestAnimationFrame(s)))};return{start(i){vu()||r||(r=i,n=0,o=0,document.addEventListener("visibilitychange",a),t=requestAnimationFrame(s))},stop(){t!==null&&(cancelAnimationFrame(t),t=null),document.removeEventListener("visibilitychange",a),r=null}}}function Ta(e){xe.startFlow(e)}var Jt=" \xB7 ",$o={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places",routes:"Route changes"},Oa=Object.keys($o);function Da(e){return $o[e]??e}var _o={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Yt(e){return _o[e]}var Lu=["oneseat","journey"],$u=["dots","both"],_u={current:"routes today",proposed:"routes proposed"};function ku(e){return e!=="journey"&&e!=="routes"}function xu(e){let t=[$o[e.view]??e.view];return e.view==="places"?t[0]:(Lu.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":_o[e.day]),ku(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&$u.includes(e.view)&&t.push(_u[e.stopRoutes]),t.join(Jt))}function Pa(e){return Ma(xu(e))}function Ma(e){let[t,...n]=e.split(Jt);return`<b>${l(t)}</b>${n.map(o=>Jt+l(o)).join("")}`}var Eu={current:"today",proposed:"proposed"};function Tu(e){return["Route "+e.short_name,Eu[e.side],_o[e.day]].join(Jt)}function Ca(e){return Ma(Tu(e))}var Ou="#c026d3",Du=4.5,Ha={source:"routeview",lines:"routeview-lines",flow:"routeview-flow",arrows:"routeview-arrows"},Na=Ha.lines,nt=vo({ids:Ha,width:Du});function Ba(e,t){return`/api/route?${new URLSearchParams({side:e.side,route_id:e.route_id,day:t})}`}function Ia(e){return e?e.startsWith("#")?e:`#${e}`:Ou}function Pu(e){let t=Ia(e.color);return{type:"FeatureCollection",features:e.features.map(o=>({type:"Feature",geometry:{type:"LineString",coordinates:o.points},properties:{side:e.side,route:e.short_name,name:e.long_name||null,pattern_id:o.pattern_id,color:t}}))}}function Ua(e,t){nt.init(e,t)}function ko(e,t){let n=t?Pu(t):{type:"FeatureCollection",features:[]};nt.setData(e,n);let o=n.features.length>0;nt.setVisible(e,o),o?nt.startFlow(e):nt.stopFlow()}var Mu={current:"today",proposed:"the plan"},Cu={current:"today",proposed:"proposed"},Aa={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"};function Fa(e,t){return e.length<=1?e.join(""):`${e.slice(0,-1).join(", ")} ${t} ${e[e.length-1]}`}function Au(e){let t=k.filter(r=>e.includes(r)),n=k.filter(r=>!e.includes(r));if(t.length===0)return"Does not run on any day type in this feed.";let o=`Runs on ${Fa(t.map(r=>Aa[r]),"and")}`;return n.length===0?`${o}.`:`${o}; does not run on ${Fa(n.map(r=>Aa[r]),"or")}.`}function ja(e){let n=e.features.length>0?'<span class="pk-note">arrows: direction of travel</span>':`<span class="pk-note">does not run on ${l(Yt(e.day))} \u2014 nothing drawn</span>`;return`
    <div class="pk-head rk-head">
      <i class="sw-route" style="background:${l(Ia(e.color))}"></i>
      <span class="rk-name"><b>${l(e.short_name)}</b>${e.long_name?` ${l(e.long_name)}`:""}
        \xB7 ${Cu[e.side]} \xB7 ${l(Yt(e.day))}</span>
      <button type="button" class="rk-clear" data-clear-route
              aria-label="Clear the drawn route" title="Clear the drawn route">\xD7</button>
    </div>
    ${n}`}function Fu(e){let t=e.crosswalk;if(!t)return"<p>PRT's crosswalk has no row for this route.</p>";let n=e.side==="current"?t.final_route:t.current_route,o=t.related_routes?` Related: ${l(t.related_routes)}`:"",r=t.route_page?`<p><a class="link" href="${l(t.route_page)}" target="_blank" rel="noopener">PRT's page for this route \u2197</a></p>`:"";return`<p>PRT's crosswalk: ${l(t.category)} \xB7 ${l(n)}.${o}</p>${r}`}function Ga(e){let t=e.features.length>0,n=`Route ${l(e.short_name)}${e.long_name?` \xB7 ${l(e.long_name)}`:""}`,o=t?"":`
      <p class="note">It does not run on ${l(Yt(e.day))}, so nothing is
        drawn for the day the toolbar is set to; switch the day to see it.</p>`;return`
    <div class="route-card">
      <div class="place-head">
        <h2>${n}</h2>
        <div class="sub">${Mu[e.side]==="today"?"today's network":"the plan"}</div>
      </div>
      <p>${l(Au(e.days))}</p>${o}
      <h3 class="scope-head">What PRT says it becomes</h3>
      ${Fu(e)}
      <p class="note">This is PRT's own labelling of which route replaces
        which. It is not a comparison \u2014 this site never measures a route
        against its successor, because the plan re-splits corridors and a
        route can "lose half its trips" while every stop on it keeps them.
        To see what changes for the riders along this line, click a stop on
        it.</p>
      <p class="note">Drawn from the feed's shapes \u2014 for drawing only; buses
        only, so a train on the same street is not shown.</p>
    </div>`}var Hu="/api/search",Nu=8,Bu=150,Wa=1,Iu={current:"today",proposed:"plan"},Ja=" \xB7 ",Ka={places:"Places",stops:"Stops",routes:"Routes"},Uu="Nothing found",Ya="search-opt-";function Va(e,t=Nu){return{url:Hu,init:{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q:e,limit:t})}}}function ju(e,t=null){let o=["current","proposed"].filter(r=>e.includes(r)).map(r=>Iu[r]);return[t,...o].filter(Boolean).join(Ja)}function Gu(e){return[Ro[e.side],e.long_name].filter(Boolean).join(Ja)}function Eo(e){let t={places:e.places.map(n=>({kind:"place",place:n})),stops:e.stops.map(n=>({kind:"stop",stop:n})),routes:e.routes.map(n=>({kind:"route",route:n}))};return za(e.q).flatMap(n=>t[n])}function za(e){return/^\d/.test(e.trim())?["routes","places","stops"]:["places","stops","routes"]}function Wu(e,t,n){return n===0?null:e===null?t>0?0:n-1:(e+t+n)%n}function Ku(e){switch(e.kind){case"place":return{name:e.place.name,tag:e.place.kind};case"stop":return{name:e.stop.name,tag:ju(e.stop.sides,e.stop.place)};case"route":return{name:e.route.short_name,tag:Gu(e.route)}}}function Ju(e,t,n){let{name:o,tag:r}=Ku(e);return`<div id="${Ya}${t}" role="option" aria-selected="${n}" class="sr-row${n?" hl":""}" data-idx="${t}"><span class="sr-name">${l(o)}</span><span class="sr-tag">${l(r)}</span></div>`}function Yu(e,t){let n=Eo(e);if(n.length===0)return`<div class="sr-empty">${Uu}</div>`;let o={places:"place",stops:"stop",routes:"route"},r=0;return za(e.q).map(s=>{let a=n.filter(c=>c.kind===o[s]);if(a.length===0)return"";let i=a.map(c=>Ju(c,r,r++===t)).join("");return`<div class="sr-group" role="group" aria-label="${Ka[s]}"><div class="sr-head">${Ka[s]}</div>${i}</div>`}).join("")}var Vu=14,zu=15;function qa(e,t){let{bounds:n}=e;return t.lon>=n.west&&t.lon<=n.east&&t.lat>=n.south&&t.lat<=n.north&&e.zoom>=Vu?null:{lat:t.lat,lon:t.lon,zoom:Math.max(e.zoom,zu)}}var xo="open";function Xa({elements:e,search:t,onPick:n}){let{group:o,input:r,list:s,opener:a}=e,i=0,c=null,p=null,g=null,b=m=>{o.classList.toggle(xo,m),r.setAttribute("aria-expanded",String(m)),m||(g=null,r.removeAttribute("aria-activedescendant"))},h=()=>{p&&(s.innerHTML=Yu(p,g),g===null?r.removeAttribute("aria-activedescendant"):(r.setAttribute("aria-activedescendant",`${Ya}${g}`),s.querySelector(`[data-idx="${g}"]`)?.scrollIntoView({block:"nearest"})))},w=m=>{let L=++i;t(m).then(O=>{L===i&&(p=O,g=null,h(),b(!0))}).catch(()=>{L===i&&(p={q:m,places:[],stops:[],routes:[]},g=null,h(),b(!0))})},_=m=>{if(!p)return;let L=Eo(p)[m];L&&(b(!1),n(L))};return r.addEventListener("input",()=>{c&&clearTimeout(c);let m=r.value.trim();if(m.length<Wa){i++,p=null,b(!1);return}c=setTimeout(()=>w(m),Bu)}),r.addEventListener("focus",()=>{p&&r.value.trim().length>=Wa&&b(!0)}),r.addEventListener("keydown",m=>{let L=p?Eo(p).length:0,O=o.classList.contains(xo);m.key==="ArrowDown"||m.key==="ArrowUp"?(m.preventDefault(),!O&&p&&b(!0),g=Wu(g,m.key==="ArrowDown"?1:-1,L),h()):m.key==="Enter"?O&&g!==null&&(m.preventDefault(),_(g)):m.key==="Escape"&&(O&&(m.stopPropagation(),b(!1)),r.blur())}),s.addEventListener("mousedown",m=>m.preventDefault()),s.addEventListener("click",m=>{let L=m.target.closest("[data-idx]");L&&_(Number(L.dataset.idx))}),document.addEventListener("click",m=>{if(!o.classList.contains(xo))return;let L=m.target;o.contains(L)||a?.contains(L)||b(!1)}),{focus(){r.focus(),r.select()}}}var qt="places",ei="places-points",To="places-boundaries",me="places-fill",Oe="lost",qu=100,Xu={lost:"share_lost",gained:"share_gained"};function oe(e,t){return`service_${e}_${t}`}var ti={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Zu="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",pe={lost:F,gained:H},Vt=null,ne=null,Te=null,ni=!1,zt=null;function Oo(){return Vt}function oi(){return ne}function ri(){return zt}function Do(){return Te}function ot(){return ni}function Qu(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function ed(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function td(e){return Math.max(e.residents_lost,e.residents_gained)}var Za=4,nd=16,od=1e3;function rd(e){let t=Math.min(1,Math.sqrt(e/od));return Za+t*(nd-Za)}function sd(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:ed(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:rd(td(t))}}))}}function ad(){return["match",["get","klass"],"lost",pe.lost,"gained",pe.gained,pe.lost]}function id(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var z=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var q=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function si(e,t){return e==="service"?["step",["abs",["coalesce",["get",oe(t,"pct")],0]],q[0].opacity,q[0].max,q[1].opacity,q[1].max,q[2].opacity,q[2].max,q[3].opacity]:["step",["coalesce",["get",Xu[e]],0],z[0].opacity,Number.EPSILON,z[1].opacity,z[1].max,z[2].opacity,z[2].max,z[3].opacity,z[3].max,z[4].opacity]}function ai(e,t){return e==="service"?["case",[">=",["coalesce",["get",oe(t,"pct")],0],0],H,F]:pe[e]}function ld(e,t){let n=oe(t,"now"),o=oe(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var cd=3;function ud(e){if(e.length===0)return"";let t=e.slice(0,cd),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function ii(e,t){e.addSource(To,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:me,type:"fill",source:To,layout:{visibility:"none"},paint:{"fill-color":ai(Oe),"fill-opacity":si(Oe),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ei,type:"circle",source:qt,layout:{visibility:"none"},paint:{"circle-color":ad(),"circle-radius":id(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Xt(e,t,n){e.setPaintProperty(me,"fill-color",ai(t,n)),e.setPaintProperty(me,"fill-opacity",si(t,n))}async function li(){return Vt||(Vt=await P("/api/places")),Vt}async function ci(e){return Te||(Te=await P("/api/boundaries"),e.getSource(To).setData(Te)),Te}function dd(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function ui(e,t){let n=dd(Te,t);if(n)return ne=null,zt=n,e.getSource(qt)?.setData({type:"FeatureCollection",features:[]}),null;try{ne=await P(`/api/places/${encodeURIComponent(t)}`)}catch{return ne=null,zt=null,null}return zt=null,e.getSource(qt).setData(sd(ne)),e.flyTo({center:[ne.lon,ne.lat],zoom:13}),ne}function di(e,t){ni=t,e.setLayoutProperty(ei,"visibility",t?"visible":"none"),e.setLayoutProperty(me,"visibility",t?"visible":"none")}function pd(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${l(e.key)}">
      <span class="place-name">${l(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var md="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function pi(e,t,n,o){let r=Qu(e,t).map(s=>pd(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Zu}</p>
    ${o==="service"?`<p class="note">${md}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function mi(e,t){return e?`<div class="lg-head"><b>${l(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${l(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function gd(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function fd(e,t,n,o){let r=q.map((c,p)=>({band:c,prevMax:p===0?0:q[p-1].max})).filter(({band:c})=>c.opacity>0).flatMap(({band:c,prevMax:p})=>{let g=gd(c,p);return[`<div class="lg-row lg-static">
          <i style="background:${F};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${l(g)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${H};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${l(g)} more trips</span></div>`]}).join(""),s=o?ld(o,n):[],a=ud(s),i=a?`<div class="lg-foot">${l(a)}</div>`:"";return`
    ${mi(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${l(ti[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function gi({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return fd(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=z.filter(i=>i.opacity>0).map(i=>`
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
      it; size is the larger of a block group's losses or gains.</div>`}function hd(e,t){let n=e[oe(t,"now")],o=e[oe(t,"proposed")],r=e[oe(t,"pct")],s=e[oe(t,"rail_proposed")],a=ti[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function fi(e,t,n){if(t==="service")return`<b>${l(e.place)}</b> <span class="muted">\xB7 ${l(e.kind)}</span><br>
      ${hd(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${l(e.place)}</b> <span class="muted">\xB7 ${l(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=Qa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Qa("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${l(e.place)}</b> <span class="muted">\xB7 ${l(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Qa(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${qu} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Si=["discontinued","new","reshaped","one-to-one"],wi={discontinued:["discontinued"],new:["new"],reshaped:["split","merged"],"one-to-one":["one-to-one"]},Ho=["one-to-one"];function rn(e){return Si.includes(e)}function No(e){return Si.filter(t=>e.includes(t))}var Bo="status",yd={status:"What happened",service:"How much service"};function sn(e){return e==="status"||e==="service"}var rt=["gone","halved","less","same","more","doubled","new"],Io={gone:"loses all service",halved:"halved or worse",less:"less service",same:"about the same",more:"more service",doubled:"doubled or better",new:"new service",none:"no service either way"},bd={gone:1.7,halved:1.35,less:1,same:.75,more:1,doubled:1.35,new:1.7,none:.75};function an(e){return rt.includes(e)}function Uo(e){return rt.filter(t=>e.includes(t))}var hi="#8e44ad",vi={discontinued:F,new:H,split:hi,merged:hi,"one-to-one":$e},jo={discontinued:"discontinued",new:"new",split:"split",merged:"merged","one-to-one":"one-to-one"},Sd=["discontinued","new","split","merged","one-to-one"],wd="route-changes",vd=.12,Ri=.9,Li=1,Rd=/^[cp]:[\w-]{1,64}$/;function $i(e){return Rd.test(e)}var Pe={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Ld={current:"today",proposed:"proposed"},_i=" \u2192 ",nn="\u2014";function Zt(e,{named:t=!0}={}){return e.length===0?nn:e.map(n=>t&&n.name?`${n.route} ${n.name}`:n.route).join(", ")}function st(e,{farSideNamed:t=!0}={}){return e.current.length===0?Zt(e.proposed):e.proposed.length===0?Zt(e.current):`${Zt(e.current)}${_i}${Zt(e.proposed,{named:t})}`}function on(e){if(e===null)return nn;let t=Math.round(e);return t===0?"0%":t>0?`+${t}%`:`\u2212${Math.abs(t)}%`}function $d(e){let t=Object.fromEntries(Sd.map(n=>[n,0]));for(let n of e)t[n.status]+=1;return t}var ki="routechange",re="routechange-lines",at="routechange-arrows",ln="routechange-selected",cn="routechange-selected-lines",Go="routechange-selected-plan",Wo="routechange-selected-arrows",_d=[re,at,cn,Go,Wo],Ko=[Go,cn,re],kd=[0,2.5],yi={current:["==",["get","side"],"current"],proposed:["==",["get","side"],"proposed"]},Mo="routechange-arrow",Po=2.6,xd=1.5,Ed=2.8,xi={bucket:"none",pct_trips:null};function Co(e,t,n,o,r){return{type:"Feature",geometry:{type:"LineString",coordinates:e.points},properties:{key:e.key,side:e.side,route:e.route,name:e.name,status:e.status,pattern_id:e.pattern_id,color:t,sort:n,w:o,bucket:r.bucket,scolor:ee[r.bucket].color,sw:bd[r.bucket],pct:r.pct_trips}}}function Td(e){let t=new Map(e.groups.map(o=>[o.key,o.service[e.day]]));return{type:"FeatureCollection",features:e.features.map(o=>Co(o,vi[o.status],o.status==="one-to-one"?0:1,1,t.get(o.key)??xi)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Od(e){let t=e.service[e.day]??xi;return{type:"FeatureCollection",features:e.features.map(o=>o.side==="current"?Co(o,ke,0,Ed,t):Co(o,tt,1,xd,t)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function Dd(e){let t=1/0,n=1/0,o=-1/0,r=-1/0;for(let s of e)for(let[a,i]of s.points)a<t&&(t=a),a>o&&(o=a),i<n&&(n=i),i>r&&(r=i);return Number.isFinite(t)?[[t,n],[o,r]]:null}function Pd(e){if(e.length===0)return null;let t=e.flatMap(n=>wi[n]);return["!",["in",["get","status"],["literal",t]]]}function Md(e){return e.length===0?null:["!",["in",["get","bucket"],["literal",[...e]]]]}var Ao={status:{color:"color",width:"w"},service:{color:"scolor",width:"sw"}};function Jo(e){let t=n=>["*",["get",Ao[e].width],n];return["interpolate",["linear"],["zoom"],9,t(Po*.5),14,t(Po),16,t(Po*1.6)]}function Cd(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function bi(e,t,n,o,r,s){e.addSource(t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:n,type:"line",source:t,layout:{visibility:"none","line-cap":"round","line-join":"round","line-sort-key":["get","sort"]},paint:{"line-color":["get","color"],"line-width":Jo("status"),"line-opacity":s}},r),e.addLayer({id:o,type:"symbol",source:t,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":140,"symbol-sort-key":["get","sort"],"icon-image":Mo,"icon-size":["interpolate",["linear"],["zoom"],12,.45,16,.8],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"],"icon-opacity":s}},r)}function Ei(e,t){e.hasImage(Mo)||e.addImage(Mo,Cd(),{pixelRatio:2,sdf:!0}),bi(e,ki,re,at,t,Ri),bi(e,ln,cn,Wo,t,Li),Ad(e,t),He(e)}function Ad(e,t){e.setFilter(cn,yi.current),e.addLayer({id:Go,type:"line",source:ln,filter:yi.proposed,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Jo("status"),"line-opacity":Li,"line-dasharray":kd}},Wo)}var en=null,De=null,Ti=!1,Me=new Set(Ho),Ce=new Set,Yo=Bo;function Vo(){return en?.groups??null}function ge(){return De}function Ae(){return Ti}function Fd(e){return`/api/route_changes?day=${e}`}function Hd(e,t){return`/api/route_changes/${encodeURIComponent(e)}?day=${t}`}async function zo(e,t){if(!k.includes(t))throw new Error(`no such day type: ${t}`);return en=await J(Fd(t)),e.getSource(ki).setData(Td(en)),en}async function qo(e,t,n,{fly:o=!0}={}){try{De=await J(Hd(t,n))}catch{return Xo(e),null}e.getSource(ln).setData(Od(De)),Oi(e,!0);let r=Dd(De.features);return o&&r&&e.fitBounds(r,{padding:60,maxZoom:14}),De}function Xo(e){De=null,e.getSource(ln)?.setData({type:"FeatureCollection",features:[]}),e.getLayer(re)&&Oi(e,!1)}function Oi(e,t){let n=t?vd:Ri;e.setPaintProperty(re,"line-opacity",n),e.setPaintProperty(at,"icon-opacity",n)}function un(){return No([...Me])}function Di(e,t){Me.has(t)?Me.delete(t):Me.add(t),He(e)}function Zo(e,t){Me.clear();for(let n of t)Me.add(n);He(e)}function dn(){return Uo([...Ce])}function Pi(e,t){Ce.has(t)?Ce.delete(t):Ce.add(t),He(e)}function Qo(e,t){Ce.clear();for(let n of t)Ce.add(n);He(e)}function Fe(){return Yo}function er(e,t){Yo=t,e.setPaintProperty(re,"line-color",["get",Ao[t].color]),e.setPaintProperty(re,"line-width",Jo(t)),e.setPaintProperty(at,"icon-color",["get",Ao[t].color]),He(e)}function He(e){let t=Yo==="status"?Pd(un()):Md(dn());e.setFilter(re,t),e.setFilter(at,t)}function Mi(e,t){Ti=t;for(let n of _d)e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Nd="A route group is PRT\u2019s own mapping of today\u2019s route numbers onto the plan\u2019s \u2014 the routes it says replace each other. It is not a corridor: a street can lose one group\u2019s buses and gain another\u2019s, and only the location, surface and street views can see that.";function Ci(){return` <button class="howto" data-caveat="${wd}">method</button>`}var Ai={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Bd(e,t){if(e.current.length===0||e.proposed.length===0)return"";let n=e.service[t].pct_trips,o=`${Ai[t]} trips, today to plan`;return`<span class="rc-pct ${Fo(n)}" title="${l(o)}">${on(n)}</span>`}function Fo(e){return e===null||Math.round(e)===0?"flat":e>0?"up":"down"}function Id(e,{reading:t,day:n}){let o=l(st(e,{farSideNamed:!1}));return t==="service"?`<span class="rc-map" style="color:${ee[e.service[n].bucket].color}">${o}</span>`:`<span class="${e.status==="one-to-one"?"rc-map":`rc-map ${e.status}`}">${o}</span>`}function Fi(e,t,n){return`
    <button type="button" class="rc-row${t?" selected":""}"
            data-select-route="${l(e.key)}">
      ${Id(e,n)}
      ${Bd(e,n.day)}
    </button>`}function tn(e,t,n,o){return`
    <div class="scope-head">${l(e)} (${t.length})</div>
    <div class="rc-list">${t.map(r=>Fi(r,r.key===n,o)).join("")}</div>`}function Ud(e){return e.charAt(0).toUpperCase()+e.slice(1)}function Hi(e,t,n={reading:"status",day:"weekday"}){let o=`
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${e.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${Nd}${Ci()}</p>`;if(n.reading==="service")return o+jd(e,t,n);let r=a=>e.filter(i=>a.includes(i.status)),s=r(["one-to-one"]);return`${o}
    ${tn("Discontinued",r(["discontinued"]),t,n)}
    ${tn("New",r(["new"]),t,n)}
    ${tn("Split or merged",r(["split","merged"]),t,n)}
    <details class="svc rc-kept">
      <summary>One-to-one (${s.length}) \u2014 one number on each side; how its service changed</summary>
      <div class="rc-list">${s.map(a=>Fi(a,a.key===t,n)).join("")}</div>
    </details>`}function jd(e,t,n){let o=a=>e.filter(i=>i.service[n.day].bucket===a),r=o("none").length,s=r===0?"":`
    <p class="muted rc-idle">${r} group${r===1?" runs":"s run"} on neither network on ${l(Pe[n.day])},
      so ${r===1?"it has":"they have"} no line to draw.</p>`;return`
    <div class="muted rc-by">Grouped by ${l(Ai[n.day])} trips, today \u2192 plan</div>
    ${rt.map(a=>{let i=o(a);return i.length?tn(Ud(Io[a]),i,t,n):""}).join("")}
    ${s}`}function Gd(e,t){return`
    <tr><th>${e}</th>
      <td class="n">${t.cur_trips.toLocaleString()}</td>
      <td class="n">${t.prop_trips.toLocaleString()}</td>
      <td class="n ${Fo(t.pct_trips)}">${on(t.pct_trips)}</td>
      <td class="n">${t.cur_hours.toFixed(1)}</td>
      <td class="n">${t.prop_hours.toFixed(1)}</td>
      <td class="n ${Fo(t.pct_hours)}">${on(t.pct_hours)}</td></tr>`}function Wd(e){return e.prt.length===0?'<p class="muted">PRT\u2019s table has no row for this group.</p>':e.prt.map(n=>{let o=n.related_routes?`<div class="muted">PRT points riders to: ${l(n.related_routes)}</div>`:"",r=n.route_page?`<div><a class="link" href="${l(n.route_page)}" target="_blank" rel="noopener">PRT\u2019s page for this route \u2197</a></div>`:"";return`<div class="rc-prt">
      <div><b>${l(n.current_route||nn)}${_i}${l(n.final_route||nn)}</b>
        <span class="rc-cat">${l(n.category)}</span></div>
      ${o}${r}</div>`}).join("")}function Ni(e){let t=e.status==="new"?"":`
    <p class="rc-riders">${Math.round(e.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">\xB7 WPRDC route ridership, average weekday</span></p>`;return`
    <button type="button" class="link rc-back" data-select-route="">\u2190 All routes</button>
    <div class="place-head">
      <h2>${l(st(e))}</h2>
      <span class="rc-status ${l(e.status)}">${l(jo[e.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today \u2192 plan</th>
        <th class="n" colspan="3">revenue hours today \u2192 plan</th></tr></thead>
      <tbody>${k.map(n=>Gd(n,e.service[n])).join("")}</tbody>
    </table>
    ${t}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today\u2019s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT\u2019s own account, from its route crosswalk.</p>
    ${Wd(e)}

    <p class="note">This is a route group, not a corridor. One group\u2019s loss
      can be another group\u2019s gain: Carrick\u2019s 51 reads as \u221210% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${Ci()}</p>`}function Kd(e,t){return`<div class="lg-row lg-static"><i style="background:${e};border-radius:2px"></i>
    <span class="lg-lab">${t}</span></div>`}function Jd(e,t){return`<div class="lg-row lg-static"><i class="lg-dotted" style="border-color:${e}"></i>
    <span class="lg-lab">${t}</span></div>`}function Bi(e,t,n,o,r,s){return`
    <button class="lg-row ${s?"off":""}" ${e}="${t}"
            aria-pressed="${!s}">
      <i style="background:${n};border-radius:2px"></i>
      <span class="lg-lab">${o}</span>
      <span class="lg-n">${r}</span>
    </button>`}function Qt(e,t,n,o){let r=vi[wi[e][0]];return Bi("data-route-bucket",e,r,t,n,o.includes(e))}function Yd(e,t,n){return Bi("data-route-service",e,ee[e].color,Io[e],t,n.includes(e))}function Ii(e){return`
    <div class="seg lg-weight" role="group" aria-label="Colour the routes by">
      ${["status","service"].map(n=>`
        <button data-route-reading="${n}" aria-pressed="${e===n}"
                class="${e===n?"active":""}">${yd[n]}</button>`).join("")}
    </div>`}function Vd(e,t){let n=Object.fromEntries([...rt,"none"].map(o=>[o,0]));for(let o of e)n[o.service[t].bucket]+=1;return n}function zd(e,t,n){let o=Vd(e,t),r=o.gone+o.halved+o.less,s=o.more+o.doubled+o.new,a=`${e.length.toLocaleString()} route groups \xB7 ${r} fewer trips \xB7 ${o.same} about the same \xB7 ${s} more \xB7 ${Pe[t]}`;return`
    <div class="lg-head"><b>${l(a)}</b></div>
    ${Ii("service")}
    ${rt.filter(i=>o[i]>0).map(i=>Yd(i,o[i],n)).join("")}
    <div class="lg-foot">Each group\u2019s trips today \u2192 plan on ${l(Pe[t])}, in the
      Stop-by-stop key\u2019s buckets and colours \u2014 a \xB110% band around no change.
      Route by route, which is not how access is measured: a group is
      not a corridor, and the 51 reads fewer trips while the new 45 runs much
      of the same street. Click a row to show or hide its lines; click a line to
      select its group.</div>`}function Ui({groups:e,day:t,hidden:n,serviceHidden:o,reading:r,selected:s}){if(s)return`
      <div class="lg-head"><b>${l(st(s))}</b>
        <span class="muted">\xB7 ${l(jo[s.status])} \xB7 ${l(Pe[t])}</span></div>
      ${Kd(ke,"today's alignment")}
      ${Jd(tt,"proposed alignment")}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;if(!e)return'<div class="lg-head"><b>Route changes</b></div>';if(r==="service")return zd(e,t,o);let a=$d(e),i=a.split+a.merged,c=`${e.length.toLocaleString()} route groups \xB7 ${a.discontinued} discontinued \xB7 ${a.new} new \xB7 ${i} split or merged \xB7 ${Pe[t]}`;return`
    <div class="lg-head"><b>${l(c)}</b></div>
    ${Ii("status")}
    ${Qt("discontinued","discontinued \u2014 today\u2019s alignment",a.discontinued,n)}
    ${Qt("new","new \u2014 proposed alignment",a.new,n)}
    ${Qt("reshaped","split or merged \u2014 proposed alignment",i,n)}
    ${Qt("one-to-one","one-to-one \u2014 proposed alignment",a["one-to-one"],n)}
    <div class="lg-foot">A route group is PRT\u2019s own mapping of today\u2019s
      numbers onto the plan\u2019s, not a corridor. Patterns are the ones that
      run on ${l(Pe[t])}. Click a row to show or hide its lines;
      click a line to select its group.</div>`}function ji(e,{selected:t,reading:n="status"}){let o=l(e.name?`${e.route} ${e.name}`:e.route),r=l(Ld[e.side]),s=l(jo[e.status]),a=n==="service"?` \xB7 ${l(Io[e.bucket])}${e.pct===null?"":` (${on(e.pct)} trips)`}`:"";return t?`${o} \xB7 <b>${r}</b> \xB7 ${s}${a}`:`<b>${o}</b> \xB7 ${r} \xB7 ${s}${a}`}var y={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes",route:"route",routeHidden:"routehide",routeReading:"routecolor",serviceHidden:"servicehide",drawnRoute:"drawn"},Ki=":",qd=/^[cp]:[\w.:-]{1,32}$/,pn={any:"any",selected:"selected"},Xd="pin",Gi=5,Ji="none",mn=",";function Yi(e){try{return e.self!==e.top}catch{return!0}}function Vi(e){let t=new URLSearchParams;return t.set(y.view,e.view),t.set(y.day,e.day),t.set(y.radius,String(e.radius)),t.set(y.oneSeatDay,e.oneSeatRestricted?pn.selected:pn.any),t.set(y.dest,"key"in e.dest?e.dest.key:tr(e.dest)),e.weight==="riders"&&t.set(y.weight,e.weight),e.surfaceUnit==="people"&&t.set(y.surfaceUnit,e.surfaceUnit),e.at&&t.set(y.at,tr(e.at)),e.camera&&t.set(y.camera,`${tr(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(y.place,e.place),e.placeFill!==Oe&&t.set(y.placeFill,e.placeFill),e.selection.length&&t.set(y.selection,e.selection.join(",")),t.set(y.stopRoutes,e.stopRoutes??jt),e.route&&t.set(y.route,e.route),e.routeHidden&&!Zd(e.routeHidden,Ho)&&t.set(y.routeHidden,e.routeHidden.length?e.routeHidden.join(mn):Ji),e.routeReading&&e.routeReading!==Bo&&t.set(y.routeReading,e.routeReading),e.serviceHidden?.length&&t.set(y.serviceHidden,e.serviceHidden.join(mn)),e.drawnRoute&&t.set(y.drawnRoute,`${e.drawnRoute.side}${Ki}${e.drawnRoute.route_id}`),`?${t}`}function zi(e){let t=new URLSearchParams(e),n={},o=t.get(y.view);o&&Oa.includes(o)&&(n.view=o);let r=t.get(y.day);r&&k.includes(r)&&(n.day=r);let s=Number(t.get(y.radius));t.has(y.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(y.weight)==="riders"?n.weight="riders":t.get(y.weight)==="locations"&&(n.weight="locations"),t.get(y.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(y.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(y.oneSeatDay);a===pn.selected?n.oneSeatRestricted=!0:a===pn.any&&(n.oneSeatRestricted=!1);let i=t.get(y.dest);if(i&&i!==Xd){let M=Wi(i);M?n.dest=M:i.includes(",")||(n.dest={key:i})}let c=Wi(t.get(y.at));c&&(n.at=c);let p=ep(t.get(y.camera));p&&(n.camera=p);let g=t.get(y.place);g&&(n.place=g);let b=t.get(y.selection);b!==null&&(n.selection=b.split(",").filter(M=>qd.test(M)));let h=t.get(y.placeFill);(h==="lost"||h==="gained"||h==="service")&&(n.placeFill=h);let w=t.get(y.stopRoutes);(w==="off"||w==="current"||w==="proposed")&&(n.stopRoutes=w);let _=t.get(y.route);_&&$i(_)&&(n.route=_);let m=t.get(y.routeHidden);if(m===Ji)n.routeHidden=[];else if(m){let M=No(m.split(mn).filter(rn));M.length&&(n.routeHidden=M)}let L=t.get(y.routeReading);L&&sn(L)&&(n.routeReading=L);let O=t.get(y.serviceHidden);if(O){let M=Uo(O.split(mn).filter(an));M.length&&(n.serviceHidden=M)}let D=Qd(t.get(y.drawnRoute));return D&&(n.drawnRoute=D),n}function Zd(e,t){return e.length===t.length&&e.every((n,o)=>n===t[o])}function Qd(e){if(!e)return null;let t=e.indexOf(Ki);if(t<0)return null;let n=e.slice(0,t),o=e.slice(t+1);return n!=="current"&&n!=="proposed"||!o?null:{side:n,route_id:o}}function tr(e){return`${e.lat.toFixed(Gi)},${e.lon.toFixed(Gi)}`}function Wi(e){let t=qi(e,2);return t?{lat:t[0],lon:t[1]}:null}function ep(e){let t=qi(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function qi(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var nr="embed";var tp=["1","true","yes"];function Xi(e){let t=new URLSearchParams(e).get(nr);return t!==null&&tp.includes(t.toLowerCase())}function Zi(e){let t=new URLSearchParams(e);return t.set(nr,"1"),`?${t}`}function Qi(e){let t=new URLSearchParams(e);t.delete(nr);let n=String(t);return n?`?${n}`:""}function el(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var tl="{view}";function nl(e,t){return e.includes(tl)?e.replace(tl,encodeURIComponent(t)):null}var se=["peek","half","full"],np=192,op=.3,rp=.55,sp=.9,ap=.6,ip=.45;function gn(e,t){return e==="peek"?Math.min(np,t*op):e==="half"?t*rp:t*sp}function lp(e,t,n=0){let o=se.map(s=>Math.abs(gn(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>ap&&(r=Math.max(0,Math.min(se.length-1,r+(n>0?1:-1)))),se[r]}function ol(e){return se[(se.indexOf(e)+1)%se.length]}function cp(e,t){return Math.min(e,t*ip)}function Ne(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function or(e){let t=null,n=()=>{let o=Ne();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var up=8,dp=400;function rl(e){let t=d("side"),n=d("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,c={y:0,t:0};function p(){return window.innerHeight}function g(m){t.style.height=`${m}px`,e.onMove(m,cp(m,p()))}function b(m){o=m,t.dataset.snap=m,g(gn(m,p()))}n.addEventListener("pointerdown",m=>{Ne()&&(r=!0,s=m.clientY,a=t.getBoundingClientRect().height,i=m.timeStamp,c={y:m.clientY,t:m.timeStamp},t.classList.add("dragging"),n.setPointerCapture(m.pointerId))}),n.addEventListener("pointermove",m=>{if(!r)return;let L=a+(s-m.clientY),O=gn("peek",p()),D=gn("full",p());g(Math.max(O,Math.min(D,L))),c={y:m.clientY,t:m.timeStamp}});function h(m){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(m.clientY-s)>up)&&m.timeStamp-i<dp){b(ol(o));return}let O=m.timeStamp-c.t,D=O>0?(c.y-m.clientY)/O:0;b(lp(t.getBoundingClientRect().height,p(),D))}n.addEventListener("pointerup",h),n.addEventListener("pointercancel",h),n.addEventListener("keydown",m=>{m.key!=="Enter"&&m.key!==" "||(m.preventDefault(),Ne()&&b(ol(o)))});let w=or(e.onLayoutChange);function _(){if(w(),!Ne()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",_),_(),{at:()=>Ne()?o:"full",atLeast(m){Ne()&&se.indexOf(m)>se.indexOf(o)&&b(m)}}}var pp=["llvmpipe","swiftshader","softpipe","basic render","software"];function rr(e){if(!e)return!1;let t=e.toLowerCase();return pp.some(n=>t.includes(n))}function al(e){let t=rr(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function il(e){return rr(e.renderer)?0:mp}var mp=300,gp="https://tiles.openfreemap.org/styles/positron",fp=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],sl=[],hp=19,yp='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',bp=!1;function ll(e){return!bp||!rr(e.renderer)?gp:Sp()}function Sp(){let e=o=>({type:"raster",tileSize:256,attribution:yp,tiles:o,maxzoom:hp}),t={basemap:e(fp)},n=[{id:"basemap",type:"raster",source:"basemap"}];return sl.length&&(t["basemap-labels"]=e(sl),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function cl(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function wp(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function ul(e,t,n){let o=new Map(n.map(c=>[c.layer,c])),r=null,s="",a=c=>{s!==c&&(s=c,e.getCanvas().style.cursor=c)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",c=>{let p=n.map(L=>L.layer).filter(L=>e.getLayer(L)&&e.getLayoutProperty(L,"visibility")!=="none");if(!p.length){i();return}let[g,...b]=e.queryRenderedFeatures(c.point,{layers:p});if(!g){i();return}a("pointer");let h=wp(g);if(h===r)return;let w=o.get(g.layer?.id),_=w?w.html(g,b):null;if(_==null){r=null,t.remove();return}r=h;let m=w.anchor?w.anchor(g,c):c.lngLat;t.setLngLat(m).setHTML(_).addTo(e)}),e.on("mouseout",i),i}function vp(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function Rp(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var Lp="seg-current",dl="dd",$p="open",pl="armed";function _p(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(pl)}));return vp(t)}function ml(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let c=a===n;i.group.classList.toggle($p,c),i.trigger.setAttribute("aria-expanded",String(c))}},r=s=>o(Rp(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let c=s.id||`controls-${a}`,p=s.querySelector(".lbl")?.textContent??"",g=document.createElement("button");g.type="button",g.className=Lp,g.setAttribute("aria-haspopup","true"),g.setAttribute("aria-expanded","false");let b=document.createElement("div");b.className=dl,i.replaceWith(b),b.append(g,i);let h=()=>{let w=_p(i);g.textContent=w.label,g.disabled=w.disabled,g.classList.toggle(pl,w.armed),g.setAttribute("aria-label",p?`${p}: ${w.label}`:w.label)};h(),new MutationObserver(h).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),g.addEventListener("click",()=>{r({kind:"trigger",group:c}),n===c&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",w=>{if(!w.target.closest("button"))return;let _=n===c;r({kind:"pick"}),_&&g.focus()}),t.set(c,{group:s,trigger:g,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${dl}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var kp=[-79.9959,40.4406],xp=12,Ep="#e2574c",fn=5,C={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},lt=zi(location.search),pt=Xi(location.search);pt&&d("app").classList.add("embed");var Tp={at:()=>"full",atLeast(){}},bl=null,N=400,it=null,R=null,ie=null,ye=0,T={key:"downtown"},fe=null,Sl=!1,Ue=!1,Ln="locations",je="area",U=jt,sr=0,X=null,be=null,yn=0,K="point",wl=60,vl=15;function bn(){return U==="off"?"current":U}var Rl="count",vn=null,G=Oe,Se=null,W=!1,f="dots",cr,pr=[],ur=null,gl=()=>{},ar=cl(),u=new maplibregl.Map({container:"map",style:ll(ar),pixelRatio:al(ar),fadeDuration:il(ar),renderWorldCopies:!1,center:lt.camera?[lt.camera.lon,lt.camera.lat]:kp,zoom:lt.camera?.zoom??xp,cooperativeGestures:Yi(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{Rr(u),Ls(u),Ms(u,Ze),Bs(u,Ze),zs(u,"walk-fill"),ya(u),xa(u,It),Ua(u,Gt),ii(u,Ze),Ei(u,Ze),x(),u.on("click",t=>{if(W)return;if(Sl){dt({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(f==="places"){let s=u.queryRenderedFeatures(t.point,{layers:[me]})[0];s&&ut(s.properties.key);return}if(f==="routes"){let{x:s,y:a}=t.point,i=[[s-fn,a-fn],[s+fn,a+fn]],c=u.queryRenderedFeatures(i,{layers:Ko})[0];c?(cr.atLeast("half"),dr(c.properties.key)):fl();return}let n=[...Lt,...At].filter(s=>u.getLayoutProperty(s,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];_n(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});gl=ul(u,e,[...Lr(t=>{let n=$t(),o=t.find(r=>Lt.includes(r.layer?.id));return n&&o?Zn(o.properties,v(),n.buckets,{pole:!1}):null}),...Lt.map(t=>({layer:t,html:n=>{let o=$t();return o?Zn(n.properties,v(),o.buckets):null},anchor:n=>n.geometry.coordinates})),...At.map(t=>({layer:t,html:n=>{let o=_e();return o?ea(n.properties,o):null},anchor:n=>n.geometry.coordinates})),{layer:Gt,html:t=>Lo(t.properties)},{layer:Na,html:t=>Lo(t.properties)},...Ko.map(t=>({layer:t,html:n=>ji(n.properties,{selected:ge()!==null,reading:Fe()})})),{layer:me,html:t=>fi(t.properties,G,v())}]),Qp(),u.on("moveend",()=>{let t=u.getCenter();bl={lat:t.lat,lon:t.lng,zoom:u.getZoom()},S(),E()}),he(C.radius,t=>{N=Number(t.dataset.radius),zn(u,N,v()).then(S),xt()&&no(u,N,v()).then(S),Et()&&so(N).then(S),_e()&&Sn(),R&&Be(R.lat,R.lon)}),he(C.day,t=>{let n=t.dataset.day;Kr(n),f!=="journey"&&x(),qn(u,n),Rn(),Vp(),oo(u,n),f==="journey"&&R&&mr(R.lat,R.lon),Dt()&&Is(u,n).then(S),Ue&&_e()&&(Sn(),R&&Be(R.lat,R.lon)),ot()&&G==="service"&&Xt(u,G,n),Ae()&&Gp(),S()}),he(C.oneSeatDay,t=>{Ue=t.dataset.oneseatDay==="selected",lr(),Sn(),R&&Be(R.lat,R.lon)}),he(C.view,t=>{let n=f;f=t.dataset.view,gl(),(f==="journey"||f==="places"||f==="routes")&&hr(),ls(u,f==="dots"||f==="both"),Np(f==="surface"||f==="both"),Ip(f==="corridors"),Jp(f==="oneseat"),Kp(f==="journey",n==="journey"),Up(f==="places"),jp(f==="routes"),f!=="journey"&&n!=="journey"&&(f==="oneseat"||n==="oneseat")&&x({scrollToTop:!0}),Wp(Pn(f)),xl();let o=f==="oneseat"||f==="journey";d("dest-controls").classList.toggle("hidden",!o),d("oneseat-day-controls").classList.toggle("hidden",f!=="oneseat"),d("place-fill-controls").classList.toggle("hidden",f!=="places"),Pl(),Z()||hl(!1),Ie(),lr(),o||wn(!1),_l()}),he(C.dest,t=>{let n=t.dataset.dest;if(n==="pin"){wn(!0);return}wn(!1),dt({key:n})}),he(C.placeFill,t=>{G=t.dataset.placeFill,ot()&&Xt(u,G,v()),x(),S(),lr()}),he(C.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=U!=="off"&&Wt()!==null;U=n,x(),o&&n!=="off"?(Ee(u,Wt(),n),B&&fr(B.radius)):Rn()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Ln=n.dataset.weight,S(),E();return}let o=t.target.closest("[data-surface-unit]");if(o){je=o.dataset.surfaceUnit,Bp(je),E();return}let r=t.target.closest("[data-route-bucket]");if(r&&rn(r.dataset.routeBucket)){Di(u,r.dataset.routeBucket),S(),E();return}let s=t.target.closest("[data-route-service]");if(s&&an(s.dataset.routeService)){Pi(u,s.dataset.routeService),S(),E();return}let a=t.target.closest("[data-route-reading]");if(a&&sn(a.dataset.routeReading)){er(u,a.dataset.routeReading),S(),Ae()&&x(),E();return}let i=t.target.closest("[data-bucket]");i&&($s(u,i.dataset.bucket,v()),S())}),d("legend-reset").addEventListener("click",()=>{if(Ae()){Fe()==="service"?Qo(u,[]):Zo(u,[]),S(),E();return}_s(u,v()),S()}),d("legend-select").addEventListener("click",()=>hl(!W)),d("legend-clear").addEventListener("click",()=>{Yn(u),Ie(),S(),E()}),d("legend-collapse").addEventListener("click",()=>{ir(!d("legend-box").classList.contains("collapsed"))}),d("route-key").addEventListener("click",t=>{t.target.closest("[data-clear-route]")&&Ol()}),d("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&dt({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&nm(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&ut(r.dataset.selectPlace);let s=t.target.closest("[data-select-route]");if(s){let c=s.dataset.selectRoute;c?dr(c):fl()}let a=t.target.closest("[data-sort-places]");a&&(Rl=a.dataset.sortPlaces,x());let i=t.target.closest("[data-goto-place]");i&&(f!=="places"&&ae(C.view,"places"),ut(i.dataset.gotoPlace))}),d("side-toggle").addEventListener("click",Fp),pt&&or(ir),cr=pt?Tp:rl({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:ir}),Dp(),Pp(),ml(),le(),Ie(),$n(),Op(lt),zn(u,N,v()).then(S),tm(),em()});function he(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),le(),E()})})}function ae(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Op(e){e.radius!==void 0&&ae(C.radius,String(e.radius)),e.day&&ae(C.day,e.day),e.oneSeatRestricted!==void 0&&ae(C.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Ln=e.weight),e.surfaceUnit&&(je=e.surfaceUnit),e.placeFill&&ae(C.placeFill,e.placeFill),e.routeHidden&&Zo(u,e.routeHidden),e.serviceHidden&&Qo(u,e.serviceHidden),e.routeReading&&er(u,e.routeReading),e.dest&&("key"in e.dest?ae(C.dest,e.dest.key):dt(e.dest)),e.selection&&fs(u,e.selection),e.stopRoutes&&ae(C.stopRoutes,e.stopRoutes),e.view&&ae(C.view,e.view),e.drawnRoute&&El(e.drawnRoute,{fit:!e.camera}),e.at&&_n(e.at.lat,e.at.lon),e.place&&ut(e.place),e.route&&dr(e.route,{fly:!e.camera})}function E(){let e={view:f,day:v(),radius:N,oneSeatRestricted:Ue,weight:Ln,surfaceUnit:je,dest:T,at:R,camera:bl,place:vn,placeFill:G,selection:ps(),stopRoutes:U,route:Se,routeHidden:un(),routeReading:Fe(),serviceHidden:dn(),drawnRoute:X},t=Vi(e);history.replaceState(null,"",(pt?Zi(t):t)+location.hash),$n(t),Ll()}function $n(e=Qi(location.search)){if(!pt)return;let t=d("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f==="routes"?ge()?st(ge()):null:R?ie?ze(ie):"this point":null;t.querySelector(".el-action").textContent=el(n)}function Ll(){let e=d("report-link"),t=ur&&nl(ur,location.href);if(!t){e.classList.add("hidden");return}e.classList.remove("hidden"),e.href=t}function le(){d("statebar").innerHTML=K==="route"&&X&&be?Ca({short_name:be.short_name,side:X.side,day:v()}):Pa({view:f,day:v(),radius:N,oneSeatRestricted:Ue,destination:mt(),stopRoutes:U}),Ap()}function ir(e){d("legend-box").classList.toggle("collapsed",e);let t=d("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Dp(){d("controls-toggle").addEventListener("click",()=>{ct(!d("app").classList.contains("controls-open"))}),d("controls-scrim").addEventListener("click",()=>ct(!1)),document.addEventListener("keydown",e=>{e.key==="Escape"&&ct(!1)})}function ct(e){d("app").classList.toggle("controls-open",e),d("controls-toggle").setAttribute("aria-expanded",String(e))}function Pp(){let e=Xa({elements:{group:d("search-controls"),input:d("search-input"),list:d("search-results"),opener:d("search-toggle")},search:async t=>{let{url:n,init:o}=Va(t),r=await fetch(n,o);if(!r.ok)throw new Error(r.statusText);return r.json()},onPick:t=>{switch(ct(!1),t.kind){case"stop":Mp(t.stop);break;case"place":Cp(t.place);break;case"route":El({side:t.route.side,route_id:t.route.route_id},{fit:!0});break}}});d("search-toggle").addEventListener("click",()=>{ct(!0),e.focus()})}function Mp(e){let t=u.getBounds(),n=qa({zoom:u.getZoom(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()}},e);n&&u.easeTo({center:[n.lon,n.lat],zoom:n.zoom}),f!=="places"&&_n(e.lat,e.lon)}function Cp(e){u.fitBounds(e.bbox,{padding:wl,maxZoom:vl}),f==="places"&&ut(e.key)}function Ap(){d("controls-toggle").firstChild?.remove(),d("controls-toggle").prepend(document.createTextNode(Da(f)))}function Fp(){let e=d("app").classList.toggle("side-collapsed"),t=d("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function S(){Hp()}function Hp(){if(d("legend-reset").classList.toggle("hidden",io()||po()||yo()||ot()||!(Z()||Ae())),yo()){d("legend").innerHTML=Ra(Ut());return}if(Ae()){d("legend").innerHTML=Ui({groups:Vo(),day:v(),hidden:un(),serviceHidden:dn(),reading:Fe(),selected:ge()});return}if(ot()){d("legend").innerHTML=gi({selected:oi(),fill:G,day:v(),boundaries:Do(),unchanged:ri()});return}if(io()){let n=Dt();n&&ra(d("legend"),n);return}if(po()){let n=_e();if(!n)return;let o=u.getBounds();sa(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=$t();if(!e)return;let t=u.getBounds();ia(d("legend"),{layer:e,day:v(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Ln,dots:Z(),surface:to()?xt():null,unit:je,population:Et(),selection:ds()})}async function Np(e){if(e&&!xt()){d("legend").classList.add("loading");try{await no(u,N,v())}finally{d("legend").classList.remove("loading")}}Cs(u,e),e&&je==="people"&&await $l(),S()}async function $l(){if(!Et()){d("legend").classList.add("loading");try{await so(N)}finally{d("legend").classList.remove("loading")}}}async function Bp(e){e==="people"&&to()&&await $l(),S()}async function Ip(e){if(e&&!Dt()){d("legend").classList.add("loading");try{await lo(u,v())}finally{d("legend").classList.remove("loading")}}Us(u,e),S()}async function Up(e){if(e&&(!Oo()||!Do())){d("legend").classList.add("loading");try{await Promise.all([li(),ci(u)])}finally{d("legend").classList.remove("loading")}}di(u,e),e&&Xt(u,G,v()),e&&x(),S()}async function ut(e){vn=await Ge(()=>ui(u,e))?e:null,f==="places"&&(x(),vn&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),S(),E()}async function jp(e){e&&await Ge(()=>zo(u,v())),Mi(u,e),e&&x({scrollToTop:!0}),S()}async function dr(e,{fly:t=!0}={}){Se=await Ge(()=>qo(u,e,v(),{fly:t}))?e:null,f==="routes"&&x({scrollToTop:!0}),S(),E()}function fl(){!Se&&!ge()||(Xo(u),Se=null,f==="routes"&&x({scrollToTop:!0}),S(),E())}async function Gp(){await Ge(async()=>{await zo(u,v()),Se&&await qo(u,Se,v(),{fly:!1})}),f==="routes"&&x(),S()}function Wp(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function x({scrollToTop:e=!1}={}){if(e&&(d("panel").scrollTop=0),$n(),f==="places"){d("panel").innerHTML=pi(Oo()??[],Rl,vn,G);return}if(f==="routes"){let t=ge();d("panel").innerHTML=t?Ni(t):Hi(Vo()??[],Se,{reading:Fe(),day:v()});return}if(K==="route"&&X){d("panel").innerHTML=be?Ga(be):Xp();return}if(!ie){f==="oneseat"?d("panel").innerHTML=rs(mt()):Jr(d("panel"));return}if(f==="oneseat"){let t=os(ie,T,v());if(t){d("panel").innerHTML=t;return}}ns(ie,{withKerb:Z(),routes:U})}function Kp(e,t=!1){if(ba(u,e),S(),!e){t&&(R?Be(R.lat,R.lon):x());return}Ut()&&R?d("panel").innerHTML=So(Ut(),mt()):d("panel").innerHTML=va(mt())}async function mr(e,t){let n=++ye;R={lat:e,lon:t},hr(),E(),Dl(e,t);let o=kl(),r=l(mt());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await P(Sa({lat:e,lon:t},o,v()));if(n!==ye)return;bo(u,s),d("panel").innerHTML=So(s,r),S(),$n()}catch(s){if(n!==ye)return;bo(u,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function lr(){d("day-controls").classList.toggle("hidden",!Zs(f,Ue,G))}function gr(){return Xs(Ue,v())}async function Jp(e){e&&!_e()&&await Ge(()=>mo(u,N,T,gr())),Qs(u,e),S()}async function Sn(){await Ge(()=>mo(u,N,T,gr())),S()}async function Ge(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function dt(e){if(T=e,wn(!1),Yp(),_l(),le(),E(),f==="journey"){R&&mr(R.lat,R.lon),S();return}R?Be(R.lat,R.lon):x({scrollToTop:!0}),Sn()}function _l(){let e=kl();if(!(e!==null&&(f==="journey"||f==="oneseat"&&"lat"in T))){fe?.remove(),fe=null;return}fe?fe.setLngLat([e.lon,e.lat]).addTo(u):(fe=new maplibregl.Marker({color:co,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),fe.on("dragend",()=>{let n=fe.getLngLat();dt({lat:n.lat,lon:n.lng})}))}function Yp(){let e=qs(T);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function kl(){if("lat"in T)return{lat:T.lat,lon:T.lon};let e=T.key,t=pr.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function mt(){if("lat"in T)return`${T.lat.toFixed(4)}, ${T.lon.toFixed(4)}`;let e=T.key;return pr.find(t=>t.key===e)?.name??e}function wn(e){Sl=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Be(e,t){let n=++ye;R={lat:e,lon:t},hr(),E(),d("panel").classList.add("loading"),Dl(e,t),Mn(u),Ee(u,null,bn()),d("pin-key").classList.add("hidden");try{let o="lat"in T?`&dest_lat=${T.lat.toFixed(6)}&dest_lon=${T.lon.toFixed(6)}`:"",r=await P(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${N}${o}&oneseat_day=${gr()}`);if(n!==ye)return;B={lat:e,lon:t,radius:N,now:r.current.stops,proposed:r.proposed.stops},ie=r,Pl(),xl(),x({scrollToTop:!0})}catch(o){if(n!==ye)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ye&&d("panel").classList.remove("loading")}}var B=null;function xl(){if(!B||!Pn(f)){Mn(u),d("pin-key").classList.add("hidden"),Rn();return}$r(u,B.lat,B.lon,B.radius,B.now,B.proposed),fr(B.radius),Rn()}function Rn(){let e=++sr,t=()=>{B&&fr(B.radius)};U!=="off"&&Z()&&R&&ie?.kerb?P(Ea(R,v())).then(n=>{e===sr&&(Ee(u,n,bn()),Kt(u,!0),Ta(u),t())}).catch(()=>{e===sr&&(Ee(u,null,bn()),Kt(u,!1),t())}):(Ee(u,null,bn()),Kt(u,!1),t())}function fr(e){let t=U!=="off"&&_a()&&ka(Wt(),U)?U:!1;d("pin-key").innerHTML=aa(e,{routes:t}),d("pin-key").classList.remove("hidden")}function hr(){K!=="point"&&(K="point",le())}function El(e,{fit:t}){K="route",Tl(e,{fit:t})}function Vp(){X&&Tl(X,{fit:!1})}function zp(e,t){return e!==null&&e.side===t.side&&e.route_id===t.route_id}async function Tl(e,{fit:t}){let n=++yn;zp(X,e)||(be=null),X=e,E(),le(),K==="route"&&x({scrollToTop:!0});try{let o=await P(Ba(e,v()));if(n!==yn)return;be=o,ko(u,o),qp(o),t&&o.bbox&&u.fitBounds(o.bbox,{padding:wl,maxZoom:vl}),le(),K==="route"&&x({scrollToTop:!0})}catch(o){if(n!==yn)return;let r=K==="route";Ol(),r&&(d("panel").innerHTML=`<div class="empty"><h2>No such route</h2>
        <p class="muted">${l(o.message)}</p></div>`)}}function Ol(){yn++,X=null,be=null,ko(u,null),d("route-key").classList.add("hidden"),K==="route"&&(K="point",x({scrollToTop:!0})),le(),E()}function qp(e){d("route-key").innerHTML=ja(e),d("route-key").classList.remove("hidden")}function Xp(){return`<div class="empty"><h2>Finding the route\u2026</h2>
    <p class="muted">Fetching its shapes and PRT's crosswalk row.</p></div>`}function Dl(e,t){it?it.setLngLat([t,e]):(it=new maplibregl.Marker({color:Ep,draggable:!0}).setLngLat([t,e]).addTo(u),it.on("dragend",()=>{let n=it.getLngLat();_n(n.lat,n.lng)}))}var hn=14;function Z(){return f==="dots"||f==="both"}function hl(e){W=e&&Z(),W?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=W?"none":"",W||Ml(),Ie()}function Pl(){let e=Z()&&!!ie?.kerb;d("stop-routes-controls").classList.toggle("hidden",!e)}function Ie(){let e=d("legend-select");e.classList.toggle("hidden",!Z()),e.setAttribute("aria-pressed",String(W)),e.textContent=W?"Selecting":"Select stops",d("legend-clear").classList.toggle("hidden",!Z()||!ms())}function Zp(e,t){let n=d("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!W}function yl(e){d("brush").classList.toggle("painting",e)}function Ml(){d("brush").hidden=!0}function Qp(){let e=d("brush");e.style.width=`${hn*2}px`,e.style.height=`${hn*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Ie(),S()}))},s=()=>{W&&(t=!0,n=!1,yl(!0))},a=c=>{if(Zp(c.point.x,c.point.y),!t)return;n=!0,Jn(u,Vn(u,c.point.x,c.point.y,hn))&&r()},i=c=>{if(yl(!1),!!t){if(t=!1,!n){let[p]=Vn(u,c.point.x,c.point.y,hn);p&&gs(u,p)}Ie(),S(),E()}};u.on("mousedown",s),u.on("mousemove",a),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",Ml),u.on("touchstart",s),u.on("touchmove",a),u.on("touchend",i)}function _n(e,t){if(cr.atLeast("half"),f==="journey"){mr(e,t);return}f!=="places"&&f!=="routes"&&Be(e,t)}async function em(){try{pr=await P("/api/destinations"),le()}catch{}}async function tm(){try{let e=await P("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;d("feedline").textContent=t,d("feedline-methods").textContent=t,d("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join(""),ur=e.feedback?.url_template??null,Ll()}catch{}}function nm(e){d("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
