"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function x(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Gt=new Map;function de(e){let t=Gt.get(e);if(t)return t;let n=x(e).catch(o=>{throw Gt.delete(e),o});return Gt.set(e,n),n}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function pe(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function Wt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Yt(e){return e>0?`+${e}`:String(e)}function io(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Aa="#15181e",lo="#ffa23a",Fa="#ffffff";function Na(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;r.push([t+a*Math.cos(l),e+s*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function K(e){return{type:"FeatureCollection",features:e}}function Ha(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Ia(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function zt(e){return e!=="corridors"&&e!=="journey"&&e!=="places"}function Vt(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(K([]))}function co(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function uo(e){e.addSource("walk",{type:"geojson",data:K([])}),e.addSource("stops-now",{type:"geojson",data:K([])}),e.addSource("stops-prop",{type:"geojson",data:K([])}),e.addSource("stop-moves",{type:"geojson",data:K([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":lo,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Fa,"circle-stroke-width":3,"circle-stroke-color":lo}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Aa,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function po(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Ia(n.properties,e(o))}))}function mo(e,t,n,o,r,s){e.getSource("walk").setData(K([Na(t,n,o)])),e.getSource("stops-now").setData(K(co(r,"current"))),e.getSource("stops-prop").setData(K(co(s,"proposed"))),e.getSource("stop-moves").setData(K(Ha(s)))}var O=["weekday","saturday","sunday"],qt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],go={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ke=4,Ge=6,fo=e=>Ge+Ke*e,yo=e=>Ge+1+Ke*e,xe=e=>Ge+2+Ke*e,Ba=e=>Ge+3+Ke*e,We=2,Ua=3,ke=4,ho=5,me=e=>e[Ua],P=(e,t)=>e[t],bo=(e,t)=>e[Ba(t)],Xt=e=>2+2*e,Zt=e=>3+2*e,Ye=4,So=e=>2+Ye*e,vo=e=>3+Ye*e,wo=e=>4+Ye*e,Lo=e=>5+Ye*e;var ja=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],Ja=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],$o=1e-6,Ka=32;function xo(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=ja.map(([i,l])=>(e+i*r+l*s)**3);return Ja.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function _o(e,t,n){return xo(e,t,n).every(o=>o>=-$o&&o<=1+$o)}function Ga(e,t,n){if(_o(e,t,n))return t;let o=0,r=t;for(let s=0;s<Ka;s++){let a=(o+r)/2;_o(e,a,n)?o=a:r=a}return o}function Wa(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function Ya(e,t,n){let[o,r,s]=xo(e,Ga(e,t,n),n);return`#${[o,r,s].map(a=>Wa(a).toString(16).padStart(2,"0")).join("")}`}var Ro=/(\d+)/;function za(e,t){let n=e.split(Ro),o=t.split(Ro);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function Ee(e){let t=[...new Set(e)].sort(za);return new Map(t.map((n,o)=>[n,Ya(.55,.16,o*360/t.length)]))}var ko="at this stop",Eo=e=>`within ${e} m`,Va="both directions",qa="one or both directions",en="weekday";function $(){return en}function Co(e){en=e}function Ao(e){e.innerHTML=`
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
    </div>`}function Fo(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Xa(e,t){let n=Math.max(1,...qt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return qt.map(o=>{let r=e.periods[o]??0,s=t.periods[o]??0,a=s-r,i=a>0?"up":a<0?"down":"flat";return`
      <tr>
        <th>${go[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${a===0?"\xB7":Yt(a)}</td>
      </tr>`}).join("")}function No(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Oo(e){return e.first==null?'<span class="muted">no service</span>':`${pe(e.first)}\u2013${pe(e.last)}`}function Po(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Za={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Qa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ei(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':ze(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${Za[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Qa[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${oe("one-seat")}</p>
    </div>`:""}function oe(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Oe(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function Do(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function To(e){return e.first==null||e.last==null?null:e.last-e.first}function ze(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Mo(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Mo(t,o,"prop",r("proposed"))}</div>
    </div>`}function Mo(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${d(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var Qt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,ti="Allegheny";function De(e){let t=e.place?.muni?.trim()??"",n=Qt.exec(t)?.[1],o=n===ti?t.replace(Qt,""):n?`${t.replace(Qt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Pe(e){return e==="weekday"?"weekday":e}function Ho(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Pe(t)}`}function ni(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function oi(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function ri(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${oe("one-direction")}</dt>
      ${Oe(r(n,e.routes),r(o,t.routes))}`}function Io(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Pe(t)}, today only</span>`;return`<dt>Boardings ${d(n)}</dt><dd>${s}${r}</dd>`}function Bo(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${oe("boardings")}</p>`}function si(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose all buses
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains all buses under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in
        <button type="button" class="place-link" data-goto-place="${d(e.key)}">${t}</button>
      </h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${oe("place-population")}</p>
    </div>`}function Uo(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
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
        ${s===0?"no change":`${Yt(s)} trips`}
        <div class="muted">${io(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Pe(n)} ${d(o)}${r?`, ${d(r)}`:""}</div>`}function jo(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Xa(e,t)}</tbody>
    </table>`}function Jo(e,t){let n=Po(e),o=Po(t),r=To(e),s=To(t);return`
      <dt>First and last</dt>
      ${Oe(Oo(e),Oo(t))}
      <dt>Hours between</dt>
      ${Oe(Wt(r),Wt(s),Do(r,s,"more"))}
      <dt>Typical wait</dt>
      ${Oe(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,Do(n,o,"less"))}`}function Ko(e,t,n,o){return`
    <div class="routes">
      <h3>${d(n)}</h3>
      ${ze(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${oe("location-not-route")}</p>
    </div>`}function ai(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${Pe(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${Pe(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${oe("stop-routes")}</p>`}function ii(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:Ee((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${d(i)}
        <span class="muted">\xB7 PRT stop ${d(e.stop_id)}</span></div>
      ${Uo(o,r,t,ko)}
      <div class="tiers">${Fo(o.hourly,r.hourly)}</div>
      ${jo(o,r)}
      <dl class="facts">
        ${Jo(o,r)}
        ${Io(o.boardings,t,ko)}
      </dl>
      ${Bo(o.boardings)}
      ${Ko(o,r,"Routes calling at this stop",a)}
      ${ai(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${oe("kerb")}</p>
    </section>`}function tn(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],s=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Uo(o,r,t,Eo(e.radius),{directions:s?qa:Va})}

    <div class="tiers">${Fo(o.hourly,r.hourly)}</div>

    ${jo(o,r)}
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
      ${Jo(o,r)}
      ${ri(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Oe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${oi(e.current.stops)}
      ${ni(e.proposed.stops)}
      ${Io(o.boardings,t,Eo(e.radius))}
    </dl>
    ${Bo(o.boardings)}

    ${n}

    ${si(e.population)}

    ${Ko(o,r,"Routes serving this spot")}`}function li(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,s=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${d(De(e))}</h2>
      <div class="muted">${s}</div>
    </div>
    ${r?ii(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${tn(e,t,ei(e.oneseat??[],e.oneseat_day??"any"))}`}function Go(e,t={}){document.getElementById("panel").innerHTML=li(e,en,t)}var ci={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},ui={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},di={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function pi(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function nn(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${No(t)}</div>`:""}function mi(e){let t=nn("kept",e.kept)+nn("lost",e.lost)+nn("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function gi(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${ze(e.current,e.proposed)}
    </div>`}function fi(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${d(r.key)}">
      <span class="os-name">${d(r.name)}</span>
      <span class="os-status ${d(r.status)}">${yi[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var yi={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function hi(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${di[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Wo(e,t,n){let o=pi(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":mi(o)+gi(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(De(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${ci[o.status]}</div>
    <p class="note">${ui[o.status]} ${hi(r)}</p>

    ${s}

    ${fi(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Ho(e,n)}</summary>
      ${tn(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Yo(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${d(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var qe={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ge="change",X="change-dots",re=["boolean",["feature-state","selected"],!1],zo="#15181e",se=["==",["get","published"],0],Ze="newplace",bi="#15181e",Si=5,Xe=["==",["get","removed"],1],Qe="removedstop",Me="change-removed",sn="change-removed-selected",on="removed-cross",qo="#e8232f";function vi(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,qo]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var an=["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1];function ln(e){return e.hasImage(on)||e.addImage(on,vi(),{pixelRatio:2}),on}var Ve=null,q=new Set,H=new Set,wi=[X,sn,Me],et=[X,Me],tt=X;function Xo(e,t){for(let n of wi)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function nt(){return Ve}function Ce(e){return q.has(e)}function Zo(e,t,n,o){return r=>_i(r,e,t,n,o)}function Qo(e){return t=>e.has(me(t))}function er(){return H}function tr(){return[...H].sort()}function nr(){return H.size}function cn(e,t){let n=0;for(let o of t)H.has(o)||(H.add(o),Te(e,o,!0),n++);return n}function or(e,t){H.delete(t)?Te(e,t,!1):(H.add(t),Te(e,t,!0))}function rr(e,t){un(e),cn(e,t)}function un(e){for(let t of H)Te(e,t,!1);H.clear()}function Te(e,t,n){try{e.setFeatureState({source:ge,id:t},{selected:n})}catch{}}function Li(e){for(let t of H)Te(e,t,!0)}function $i(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function dn(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[X,Me].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[l,p]=i.geometry.coordinates,m=e.project([l,p]);return{id:i.id,x:m.x,y:m.y}});return $i(t,n,o,a)}function sr(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||P(s,We)===0||P(s,ke)===1)continue;let a=n[P(s,xe(t))];a!==void 0&&r[a]++}return r}function ar(e,t){let n=0;for(let o of e)t(o)&&P(o,We)===0&&n++;return n}function ir(e,t){let n=0;for(let o of e)t(o)&&P(o,ke)===1&&n++;return n}function _i(e,t,n,o,r){let s=P(e,0),a=P(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function lr(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||P(s,We)===0)continue;let a=n[P(s,xe(t))];if(a===void 0)continue;let i=bo(s,t),l=P(s,ke)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(l){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function Ri(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>O.some((o,r)=>t[P(n,xe(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:me(n),published:n[2],removed:n[ke],name:n[ho],moved:e.moved?.[me(n)]??null,replacement:e.replacement?.[me(n)]?.[0]??null,nearestStraight:e.replacement?.[me(n)]?.[1]??null,...Object.fromEntries(O.flatMap((o,r)=>[[`b${r}`,t[P(n,xe(r))]],[`sc${r}`,n[fo(r)]],[`sp${r}`,n[yo(r)]]]))}}))}}function cr(e,t){let n=Object.entries(qe).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,qe.none[t]]}function ur(e){return["case",se,"rgba(0,0,0,0)",cr(e,"color")]}function rn(e){return["case",se,Si,cr(e,"size")]}function dr(e){return["interpolate",["linear"],["zoom"],9,["*",rn(e),.45],12,rn(e),16,["*",rn(e),1.9]]}function pr(e){e.addSource(ge,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:X,type:"circle",source:ge,paint:{"circle-color":ur(0),"circle-radius":dr(0),"circle-opacity":.85,"circle-stroke-color":["case",re,zo,se,bi,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",re,1.6,se,.9,.5],12,["case",re,2.4,se,1.5,1],16,["case",re,3.2,se,2.2,1.6]]}},"walk-fill"),e.addLayer({id:sn,type:"circle",source:ge,filter:Xe,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":zo,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",re,1.6,0],12,["case",re,2.4,0],16,["case",re,3.2,0]]}},"walk-fill"),e.addLayer({id:Me,type:"symbol",source:ge,filter:Xe,layout:{"icon-image":ln(e),"icon-size":an,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function pn(e,t,n){return Ve=await de(`/api/change?radius=${t}`),e.getSource(ge).setData(Ri(Ve)),Li(e),mn(e,n),Ve}function mn(e,t){let n=O.indexOf(t);e.setPaintProperty(X,"circle-color",ur(n)),e.setPaintProperty(X,"circle-radius",dr(n)),gn(e,t)}function mr(e,t,n){q.has(t)?q.delete(t):q.add(t),gn(e,n)}function gr(e,t){q.clear(),gn(e,t)}function gn(e,t){let n=O.indexOf(t),o=["none",...q],r=["case",se,!q.has(Ze),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(X,["all",["!",Xe],r]);let s=["all",Xe,!q.has(Qe)];e.setFilter(Me,s),e.setFilter(sn,s)}function xi(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function fn(e,t,n,{pole:o=!0}={}){let r=O.indexOf(t),s=e[`b${r}`],a=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(g=>g.key===s)?.label??s,l=e[`sc${r}`],p=e[`sp${r}`],m=t==="weekday"?"weekday":t,h=a?`Currently ${l}`:`${l} \u2192 ${p}`;return`${o?xi(e):""}${Ei(e)}${h} buses per ${m} at this stop<br>${a?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var ki=1.5,Vo=800;function Ei(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??Vo,r=n!=null&&o>n*ki?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${Vo} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${qo}">Stop removed</b> \u2014 ${s}<br>`}var yn="surface",rt="surface-fill",fr="#6b7280",hn=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,fr],[.138,fr],[1,"#bd60e7"],[2,"#961bed"]],C="#e8232f",A="#0f79c9",yr=2,ot=null,hr=!1;function st(){return ot}function bn(){return hr}function br(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-yr,Math.min(yr,n))}function Sr(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function vr(e,t,n,o,r,s,a,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=a.lat0+(p[1]+.5)*a.dlat,h=a.lon0+(p[0]+.5)*a.dlon;if(m<o||m>s||h<n||h>r)continue;let g=p[Xt(t)],b=p[Zt(t)],_=Sr(g,b);if(_!=="none")if(_==="ramp"){let y=br(g,b);l[y<-.138?"less":y>.138?"more":"same"]+=i}else l[_]+=i}return l}function Oi(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,l=n+s[0]*r,p=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,a],[p,a],[p,i],[l,i],[l,a]]]},properties:Object.fromEntries(O.flatMap((m,h)=>{let g=s[Xt(h)],b=s[Zt(h)];return[[`k${h}`,Sr(g,b)],[`v${h}`,br(g,b)??0]]}))}})}}function wr(e){return["case",["==",["get",`k${e}`],"gone"],C,["==",["get",`k${e}`],"new"],A,["interpolate",["linear"],["get",`v${e}`],...hn.flatMap(([t,n])=>[t,n])]]}function fe(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Lr(e,t){e.addSource(yn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:rt,type:"fill",source:yn,layout:{visibility:"none"},paint:{"fill-color":wr(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,fe(0,.85),13,fe(0,.62),16,fe(0,.45)]}},t)}async function Sn(e,t,n){return ot=await de(`/api/surface?radius=${t}`),e.getSource(yn).setData(Oi(ot)),vn(e,n),ot}function vn(e,t){let n=O.indexOf(t);e.setPaintProperty(rt,"fill-color",wr(n)),e.setPaintProperty(rt,"fill-opacity",["interpolate",["linear"],["zoom"],9,fe(n,.85),13,fe(n,.62),16,fe(n,.45)])}function $r(e,t){hr=t,e.setLayoutProperty(rt,"visibility",t?"visible":"none")}var wn=null;function at(){return wn}async function Ln(e){return wn=await de(`/api/population?radius=${e}`),wn}function _r(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let p=a.lat0+(l[1]+.5)*a.dlat,m=a.lon0+(l[0]+.5)*a.dlon;p<o||p>s||m<n||m>r||(i.lost+=l[So(t)],i.gained+=l[vo(t)],i.kept+=l[wo(t)],i.none+=l[Lo(t)])}return i}var $n="corridor",Rr="corridor-lines",ct="#8b929c",Pi="#6f7783",lt={lost:C,added:A,kept:ct};var it=null,xr=!1;function ut(){return it}function _n(){return xr}function Di(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function kr(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Ti(){let e=t=>["match",["get","klass"],"lost",lt.lost,"added",lt.added,t];return["interpolate",["linear"],["zoom"],9,e(Pi),14,e(ct)]}function Mi(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Ci(){return["match",["get","klass"],"kept",.85,.9]}function Er(e,t){e.addSource($n,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Rr,type:"line",source:$n,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Ti(),"line-width":Mi(),"line-opacity":Ci()}},t)}async function Rn(e,t){return it=await x(`/api/corridors?day=${t}`),e.getSource($n).setData(Di(it)),it}async function Or(e,t){O.includes(t)&&await Rn(e,t)}function Pr(e,t){xr=t,e.setLayoutProperty(Rr,"visibility",t?"visible":"none")}var xn="#2b3038",Tr="#b9bec6",Ae={loses:{color:C,size:6},gains:{color:A,size:6},keeps:{color:ct,size:3},here:{color:xn,size:3.5},none:{color:Tr,size:1.8}};var G="loses_retired",mt=["loses",G,"gains","keeps","none","here"];function kn(e,t){let n=e===G?"loses":e,o=t.find(r=>r.key===n)?.label??n;return e==="loses"?`${o} \u2014 stop kept`:e===G?`${o} \u2014 stop retired`:o}function Mr(e){return{...e.counts,loses:e.counts.loses-e.retired.loses,[G]:e.retired.loses}}var dt="oneseat",Cr="oneseat-dots",Ar="oneseat-removed",Dr=["all",["==",["get","status"],"loses"],["==",["get","removed"],1]],gt=[Cr,Ar],pt=null,Fr=!1;function ye(){return pt}function En(){return Fr}function Nr(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;a[G]=0;for(let i of e){let l=i[0],p=i[1];if(l<o||l>s||p<n||p>r)continue;let m=t[i[3]];m!==void 0&&a[m==="loses"&&i[6]===1?G:m]++}return a}function Ai(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5],removed:n[6]??0}}))}}function Fi(){return["match",["get","status"],...Object.entries(Ae).flatMap(([e,t])=>[e,t.color]),Tr]}function Ni(){let e=["match",["get","status"],...Object.entries(Ae).flatMap(([t,n])=>[t,n.size]),Ae.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Hr(e,t){e.addSource(dt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Cr,type:"circle",source:dt,filter:["!",Dr],layout:{visibility:"none"},paint:{"circle-color":Fi(),"circle-radius":Ni(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t),e.addLayer({id:Ar,type:"symbol",source:dt,filter:Dr,layout:{visibility:"none","icon-image":ln(e),"icon-size":an,"icon-allow-overlap":!0,"icon-ignore-placement":!0}},t)}function Hi(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Ii="pin";function Ir(e){return"key"in e?e.key:Ii}var ft="any";function Bi(e,t,n){return`radius=${e}&${Hi(t)}&day=${n}`}function Br(e,t){return e?t:ft}function Ur(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function On(e,t,n,o=ft){return pt=await x(`/api/oneseat?${Bi(t,n,o)}`),e.getSource(dt).setData(Ai(pt)),pt}function jr(e,t){Fr=t;for(let n of gt)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Pn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Jr(e,t){let n=e.status==="loses"&&e.removed===1?G:e.status,o=kn(n,t.statuses),r=(e.current||"").split(";").filter(Boolean),s=(e.proposed||"").split(";").filter(Boolean),a=l=>l.length?l.join(", "):"none",i=Pn(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${o}</b> \u2014 ${i}<br>today: ${a(r)}<br>proposed: ${a(s)}`}var yt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Dn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Ui=new Set(["gone","new"]);function ji(e,t,n){return Ui.has(e)?`${t} (${Dn[n]})`:t}function Ji(e){return e.buckets.filter(t=>t.key!=="none")}var Kr={area:"Ground",people:"People"};function Ki(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=vr(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Gi(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=_r(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Wi=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function Gr(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1}=e,l=hn.map(([p,m])=>`${m} ${((p+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${l})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${C}"></i>loses all service
          (${Dn[n]})</span>
        <span><i style="background:${A}"></i>new service
          (${Dn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Kr).map(p=>`
          <button data-surface-unit="${p}" aria-pressed="${r===p}"
                  class="${r===p?"active":""}">${Kr[p]}</button>`).join("")}
      </div>
      ${a?Wi:r==="people"?Gi(n,o,s):Ki(t,n,o)}
    </div>`}var Yi=["lost","added","kept"],zi={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Vi={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Yr(e,t){let{lostPct:n,addedPct:o}=kr(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${Vi[t.day]}
    </div>
    ${Yi.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${lt[i]}"></i>
        <span class="lg-lab">${d(zi[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function zr(e,t,n){let o=t.statuses.map(g=>g.key),r=Nr(t.points,o,n.west,n.south,n.east,n.north),s=Mr(t),a=g=>kn(g,t.statuses),i=g=>g===G?'<i class="lg-cross"></i>':`<i style="background:${Ae[g].color}"></i>`,l=mt.reduce((g,b)=>g+(r[b]??0),0),p=Pn(t),m=t.day&&t.day!==ft,h=m?`Restricted to routes running on ${yt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(p)}</b>
      <span class="muted">\xB7 ${l.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${m?` \xB7 ${yt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${mt.map(g=>`
      <div class="lg-row lg-static">
        ${i(g)}
        <span class="lg-lab">${d(a(g))}</span>
        <span class="lg-n">${(r[g]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${mt.map(g=>`${(s[g]??0).toLocaleString()} ${d(a(g))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(p)} without transferring?
      ${h} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      A cross is a stop the plan retires, as in Stop-by-stop \u2014 decided at the
      stop, not the walk \u2014 so the ride may survive at a stop a block away;
      a retired stop that keeps its ride stays a plain dot.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function Vr(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var Wr={locations:"Stops",riders:"Riders"};function qi(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Xi(e){if(!e)return"";let t=Ce(Ze);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Ze}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Zi(e,t){if(!e)return"";let n=Ce(Qe);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Qe}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Qi(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Xi(e)}
      ${Zi(t,n)}
    </div>`}function qr(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:l,selection:p,dots:m=!0}=t,h=n.buckets.map(L=>L.key),g=n.days.indexOf(o),{west:b,south:_,east:y,north:J}=r,V=Ji(n),E=p&&p.size>0?p:null,Je=E?Qo(E):Zo(b,_,y,J),so=sr(n.points,g,h,Je),jt=ar(n.points,Je),Jt=ir(n.points,Je),M=s==="riders"?lr(n.points,g,h,Je):null,Oa=L=>M?M.measured[L]?Math.round(M.riders[L]).toLocaleString():"\u2014":so[L].toLocaleString(),Pa=M?M.removedMeasured?Math.round(M.removedRiders).toLocaleString():"\u2014":Jt.toLocaleString(),Da=E?`at ${E.size.toLocaleString()} selected stop${E.size===1?"":"s"}`:"in view",ao=V.reduce((L,Kt)=>L+so[Kt.key],0)+jt+Jt,Ta=M?`<b>${Math.round(V.reduce((L,Kt)=>L+M.riders[Kt.key],0)+M.removedRiders).toLocaleString()}</b> daily boardings ${Da}`:E?`<b>${ao.toLocaleString()}</b>
         of ${E.size.toLocaleString()} selected stops`:`<b>${ao.toLocaleString()}</b>
         stops in view`,Ma=a?` \xB7 surface: ${n.radius} m walk`:"",Ca=!m&&!!a;e.innerHTML=Ca?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${yt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${Gr({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!E,named:!0})}`:`
    <div class="lg-head">
      ${Ta}
      <span class="muted">\xB7 ${yt[o]}${Ma}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Wr).map(L=>`
        <button data-weight="${L}" aria-pressed="${s===L}"
                class="${s===L?"active":""}">${Wr[L]}</button>`).join("")}
    </div>
    ${V.map(L=>`
      <button class="lg-row ${Ce(L.key)?"off":""}" data-bucket="${d(L.key)}"
              aria-pressed="${!Ce(L.key)}">
        <i style="background:${qe[L.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(ji(L.key,L.label,o))}</span>
        <span class="lg-n">${Oa(L.key)}</span>
      </button>`).join("")}
    ${Qi(jt,Jt,Pa)}
    ${a?Gr({layer:a,day:o,bounds:r,unit:i,population:l,scoped:!!E}):""}
    ${M?qi(M.unmeasured,jt):""}
    ${E?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Tn="#4aa3ff",os="#ffa23a",Mn="headline",ht="journey",St="journey-rides",rs="journey-walks",el=[St,rs],ss=null,as=!1;function vt(){return ss}function Cn(){return as}function tl(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,l=a.to??e.destination,p=[[i.lon,i.lat],[l.lon,l.lat]],m=a.path?.length?a.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function Xr(){return["match",["get","side"],"current",Tn,"proposed",os,Tn]}function Zr(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function is(e,t){e.addSource(ht,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:St,type:"line",source:ht,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Xr(),"line-width":Zr(1),"line-opacity":.85}},t),e.addLayer({id:rs,type:"line",source:ht,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Xr(),"line-width":Zr(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ls(e,t){as=t;for(let n of el)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function An(e,t){ss=t;let n=t?tl(t,Mn):{type:"FeatureCollection",features:[]};e.getSource(ht).setData(n)}function cs(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Qr=e=>`${e.toFixed(1)} min`;function us(e){return e==null?"\u2014":e===0?"no change":e>0?`${Qr(e)} slower`:`${Qr(-e)} faster`}function es(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function nl(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=es(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${es(e.to,"the destination")}</span></div>`}function ts(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(nl(r,t)),o=r}return n.join("")}var ol={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function bt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function rl(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function sl(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${bt(t.current)} \u2192
        ${bt(t.proposed)} min</span>
        <span class="muted">${us(t.change_min)}</span></div>
      ${o}
    </div>`}function ns(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Fn(e,t){let n=e.radii[Mn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${pe(e.window.start_min)}
        and ${pe(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${ol[n.classification]??""}</p>
      </div>
      ${ns(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${bt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${bt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${us(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${rl(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ts(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ts(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${sl(e)}
    ${ns(e)}`}function ds(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${d(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function ps(e){let t=e?e.radii[Mn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Tn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${os}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var $t="off",Fe="stoproutes",fs="stoproutes-lines",Hn="stoproutes-flow",ys="stoproutes-arrows",al=[fs,Hn,ys],Nn="stoproutes-arrow",ms=3.5,hs=null,bs=!1;function _t(){return hs}function Ss(){return bs}function vs(e,t){return e!==null&&e[t].length>0}function il(e,t){let n=t==="current"?e.current:e.proposed,o=Ee(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function ll(){return["interpolate",["linear"],["zoom"],9,ms*.6,14,ms]}function cl(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function ws(e,t){e.addSource(Fe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:fs,type:"line",source:Fe,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":ll(),"line-opacity":.85}},t),e.addLayer({id:Hn,type:"line",source:Fe,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},t),e.hasImage(Nn)||e.addImage(Nn,cl(),{pixelRatio:2,sdf:!0}),e.addLayer({id:ys,type:"symbol",source:Fe,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":Nn,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},t)}function Rt(e,t){bs=t;for(let n of al)e.setLayoutProperty(n,"visibility",t?"visible":"none");t||xs()}function be(e,t,n){hs=t;let o=t?il(t,n):{type:"FeatureCollection",features:[]};e.getSource(Fe).setData(o),t||xs()}function Ls(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var ul={current:"today",proposed:"proposed"};function $s(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${d(e.color)}"></i> <b>${d(e.route)}</b>${e.name?` \u2014 ${d(e.name)}`:""}<br><span style="opacity:.75">${ul[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var dl=20;function pl(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var gs=pl(3,4,24),I=null,wt=0,Lt=0,he=null;function ml(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function In(e){he&&(I=requestAnimationFrame(In),!(e-Lt<1e3/dl)&&(Lt=e,wt=(wt+1)%gs.length,he.setPaintProperty(Hn,"line-dasharray",gs[wt])))}function _s(){he&&(document.hidden?I!==null&&(cancelAnimationFrame(I),I=null):I===null&&(Lt=0,I=requestAnimationFrame(In)))}function Rs(e){ml()||he||(he=e,wt=0,Lt=0,document.addEventListener("visibilitychange",_s),I=requestAnimationFrame(In))}function xs(){I!==null&&(cancelAnimationFrame(I),I=null),document.removeEventListener("visibilitychange",_s),he=null}var Et="places",Os="places-points",Bn="places-boundaries",ie="places-fill",ve="lost",gl=100,fl={lost:"share_lost",gained:"share_gained"};function Q(e,t){return`service_${e}_${t}`}var Ps={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},yl="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",ae={lost:C,gained:A},xt=null,Z=null,Se=null,Ds=!1,kt=null;function Un(){return xt}function Ts(){return Z}function Ms(){return kt}function jn(){return Se}function Ne(){return Ds}function hl(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function bl(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Sl(e){return Math.max(e.residents_lost,e.residents_gained)}var ks=4,vl=16,wl=1e3;function Ll(e){let t=Math.min(1,Math.sqrt(e/wl));return ks+t*(vl-ks)}function $l(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:bl(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Ll(Sl(t))}}))}}function _l(){return["match",["get","klass"],"lost",ae.lost,"gained",ae.gained,ae.lost]}function Rl(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var W=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var Y=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Cs(e,t){return e==="service"?["step",["abs",["coalesce",["get",Q(t,"pct")],0]],Y[0].opacity,Y[0].max,Y[1].opacity,Y[1].max,Y[2].opacity,Y[2].max,Y[3].opacity]:["step",["coalesce",["get",fl[e]],0],W[0].opacity,Number.EPSILON,W[1].opacity,W[1].max,W[2].opacity,W[2].max,W[3].opacity,W[3].max,W[4].opacity]}function As(e,t){return e==="service"?["case",[">=",["coalesce",["get",Q(t,"pct")],0],0],A,C]:ae[e]}function xl(e,t){let n=Q(t,"now"),o=Q(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var kl=3;function El(e){if(e.length===0)return"";let t=e.slice(0,kl),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function Fs(e,t){e.addSource(Bn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ie,type:"fill",source:Bn,layout:{visibility:"none"},paint:{"fill-color":As(ve),"fill-opacity":Cs(ve),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Et,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Os,type:"circle",source:Et,layout:{visibility:"none"},paint:{"circle-color":_l(),"circle-radius":Rl(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ot(e,t,n){e.setPaintProperty(ie,"fill-color",As(t,n)),e.setPaintProperty(ie,"fill-opacity",Cs(t,n))}async function Ns(){return xt||(xt=await x("/api/places")),xt}async function Hs(e){return Se||(Se=await x("/api/boundaries"),e.getSource(Bn).setData(Se)),Se}function Ol(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Is(e,t){let n=Ol(Se,t);if(n)return Z=null,kt=n,e.getSource(Et)?.setData({type:"FeatureCollection",features:[]}),null;try{Z=await x(`/api/places/${encodeURIComponent(t)}`)}catch{return Z=null,kt=null,null}return kt=null,e.getSource(Et).setData($l(Z)),e.flyTo({center:[Z.lon,Z.lat],zoom:13}),Z}function Bs(e,t){Ds=t,e.setLayoutProperty(Os,"visibility",t?"visible":"none"),e.setLayoutProperty(ie,"visibility",t?"visible":"none")}function Pl(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Dl="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Us(e,t,n,o){let r=hl(e,t).map(s=>Pl(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${yl}</p>
    ${o==="service"?`<p class="note">${Dl}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function js(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Tl(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Ml(e,t,n,o){let r=Y.map((l,p)=>({band:l,prevMax:p===0?0:Y[p-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:p})=>{let m=Tl(l,p);return[`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${A};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=o?xl(o,n):[],a=El(s),i=a?`<div class="lg-foot">${d(a)}</div>`:"";return`
    ${js(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(Ps[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Js({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return Ml(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=W.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${ae[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(i.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${js(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${a}
    <div class="lg-row lg-static"><i style="background:${ae.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${ae.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Cl(e,t){let n=e[Q(t,"now")],o=e[Q(t,"proposed")],r=e[Q(t,"pct")],s=e[Q(t,"rail_proposed")],a=Ps[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function Ks(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${Cl(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=Es("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Es("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Es(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${gl} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Jn=" \xB7 ",Kn={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Gs=Object.keys(Kn);function Ws(e){return Kn[e]??e}var Al={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Fl=["oneseat","journey"],Nl=["dots","both"],Hl={current:"routes today",proposed:"routes proposed"};function Il(e){return e!=="journey"}function Bl(e){let t=[Kn[e.view]??e.view];return e.view==="places"?t[0]:(Fl.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Al[e.day]),Il(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&Nl.includes(e.view)&&t.push(Hl[e.stopRoutes]),t.join(Jn))}function Ys(e){let[t,...n]=Bl(e).split(Jn);return`<b>${d(t)}</b>${n.map(o=>Jn+d(o)).join("")}`}var S={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes"},Ul=/^[cp]:[\w.:-]{1,32}$/,Pt={any:"any",selected:"selected"},jl="pin",zs=5;function qs(e){try{return e.self!==e.top}catch{return!0}}function Xs(e){let t=new URLSearchParams;return t.set(S.view,e.view),t.set(S.day,e.day),t.set(S.radius,String(e.radius)),t.set(S.oneSeatDay,e.oneSeatRestricted?Pt.selected:Pt.any),t.set(S.dest,"key"in e.dest?e.dest.key:Gn(e.dest)),e.weight==="riders"&&t.set(S.weight,e.weight),e.surfaceUnit==="people"&&t.set(S.surfaceUnit,e.surfaceUnit),e.at&&t.set(S.at,Gn(e.at)),e.camera&&t.set(S.camera,`${Gn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(S.place,e.place),e.placeFill!==ve&&t.set(S.placeFill,e.placeFill),e.selection.length&&t.set(S.selection,e.selection.join(",")),t.set(S.stopRoutes,e.stopRoutes??$t),`?${t}`}function Zs(e){let t=new URLSearchParams(e),n={},o=t.get(S.view);o&&Gs.includes(o)&&(n.view=o);let r=t.get(S.day);r&&O.includes(r)&&(n.day=r);let s=Number(t.get(S.radius));t.has(S.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(S.weight)==="riders"?n.weight="riders":t.get(S.weight)==="locations"&&(n.weight="locations"),t.get(S.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(S.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(S.oneSeatDay);a===Pt.selected?n.oneSeatRestricted=!0:a===Pt.any&&(n.oneSeatRestricted=!1);let i=t.get(S.dest);if(i&&i!==jl){let _=Vs(i);_?n.dest=_:i.includes(",")||(n.dest={key:i})}let l=Vs(t.get(S.at));l&&(n.at=l);let p=Jl(t.get(S.camera));p&&(n.camera=p);let m=t.get(S.place);m&&(n.place=m);let h=t.get(S.selection);h!==null&&(n.selection=h.split(",").filter(_=>Ul.test(_)));let g=t.get(S.placeFill);(g==="lost"||g==="gained"||g==="service")&&(n.placeFill=g);let b=t.get(S.stopRoutes);return(b==="off"||b==="current"||b==="proposed")&&(n.stopRoutes=b),n}function Gn(e){return`${e.lat.toFixed(zs)},${e.lon.toFixed(zs)}`}function Vs(e){let t=Qs(e,2);return t?{lat:t[0],lon:t[1]}:null}function Jl(e){let t=Qs(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Qs(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Wn="embed";var Kl=["1","true","yes"];function ea(e){let t=new URLSearchParams(e).get(Wn);return t!==null&&Kl.includes(t.toLowerCase())}function ta(e){let t=new URLSearchParams(e);return t.set(Wn,"1"),`?${t}`}function na(e){let t=new URLSearchParams(e);t.delete(Wn);let n=String(t);return n?`?${n}`:""}function oa(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var ee=["peek","half","full"],Gl=192,Wl=.3,Yl=.55,zl=.9,Vl=.6,ql=.45;function Dt(e,t){return e==="peek"?Math.min(Gl,t*Wl):e==="half"?t*Yl:t*zl}function Xl(e,t,n=0){let o=ee.map(s=>Math.abs(Dt(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>Vl&&(r=Math.max(0,Math.min(ee.length-1,r+(n>0?1:-1)))),ee[r]}function ra(e){return ee[(ee.indexOf(e)+1)%ee.length]}function Zl(e,t){return Math.min(e,t*ql)}function we(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Yn(e){let t=null,n=()=>{let o=we();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Ql=8,ec=400;function sa(e){let t=c("side"),n=c("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,l={y:0,t:0};function p(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,Zl(y,p()))}function h(y){o=y,t.dataset.snap=y,m(Dt(y,p()))}n.addEventListener("pointerdown",y=>{we()&&(r=!0,s=y.clientY,a=t.getBoundingClientRect().height,i=y.timeStamp,l={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!r)return;let J=a+(s-y.clientY),V=Dt("peek",p()),E=Dt("full",p());m(Math.max(V,Math.min(E,J))),l={y:y.clientY,t:y.timeStamp}});function g(y){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-s)>Ql)&&y.timeStamp-i<ec){h(ra(o));return}let V=y.timeStamp-l.t,E=V>0?(l.y-y.clientY)/V:0;h(Xl(t.getBoundingClientRect().height,p(),E))}n.addEventListener("pointerup",g),n.addEventListener("pointercancel",g),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),we()&&h(ra(o)))});let b=Yn(e.onLayoutChange);function _(){if(b(),!we()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}h(o)}return window.addEventListener("resize",_),_(),{at:()=>we()?o:"full",atLeast(y){we()&&ee.indexOf(y)>ee.indexOf(o)&&h(y)}}}var tc=["llvmpipe","swiftshader","softpipe","basic render","software"];function zn(e){if(!e)return!1;let t=e.toLowerCase();return tc.some(n=>t.includes(n))}function ia(e){let t=zn(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function la(e){return zn(e.renderer)?0:nc}var nc=300,oc="https://tiles.openfreemap.org/styles/positron",rc=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],aa=[],sc=19,ac='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',ic=!1;function ca(e){return!ic||!zn(e.renderer)?oc:lc()}function lc(){let e=o=>({type:"raster",tileSize:256,attribution:ac,tiles:o,maxzoom:sc}),t={basemap:e(rc)},n=[{id:"basemap",type:"raster",source:"basemap"}];return aa.length&&(t["basemap-labels"]=e(aa),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function ua(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function cc(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function da(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),r=null,s="",a=l=>{s!==l&&(s=l,e.getCanvas().style.cursor=l)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",l=>{let p=n.map(J=>J.layer).filter(J=>e.getLayer(J)&&e.getLayoutProperty(J,"visibility")!=="none");if(!p.length){i();return}let[m,...h]=e.queryRenderedFeatures(l.point,{layers:p});if(!m){i();return}a("pointer");let g=cc(m);if(g===r)return;let b=o.get(m.layer?.id),_=b?b.html(m,h):null;if(_==null){r=null,t.remove();return}r=g;let y=b.anchor?b.anchor(m,l):l.lngLat;t.setLngLat(y).setHTML(_).addTo(e)}),e.on("mouseout",i),i}function uc(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function dc(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var pc="seg-current",pa="dd",mc="open",ma="armed";function gc(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(ma)}));return uc(t)}function ga(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let l=a===n;i.group.classList.toggle(mc,l),i.trigger.setAttribute("aria-expanded",String(l))}},r=s=>o(dc(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let l=s.id||`controls-${a}`,p=s.querySelector(".lbl")?.textContent??"",m=document.createElement("button");m.type="button",m.className=pc,m.setAttribute("aria-haspopup","true"),m.setAttribute("aria-expanded","false");let h=document.createElement("div");h.className=pa,i.replaceWith(h),h.append(m,i);let g=()=>{let b=gc(i);m.textContent=b.label,m.disabled=b.disabled,m.classList.toggle(ma,b.armed),m.setAttribute("aria-label",p?`${p}: ${b.label}`:b.label)};g(),new MutationObserver(g).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),m.addEventListener("click",()=>{r({kind:"trigger",group:l}),n===l&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",b=>{if(!b.target.closest("button"))return;let _=n===l;r({kind:"pick"}),_&&m.focus()}),t.set(l,{group:s,trigger:m,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${pa}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var fc=[-79.9959,40.4406],yc=12,hc="#e2574c",k={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},Ie=Zs(location.search),Ue=ea(location.search);Ue&&c("app").classList.add("embed");var bc={at:()=>"full",atLeast(){}},ba=null,D=400,He=null,v=null,ne=null,ue=0,R={key:"downtown"},le=null,Sa=!1,_e=!1,It="locations",Re="area",N=$t,Vn=0;function Mt(){return N==="off"?"current":N}var va="count",Nt=null,B=ve,U=!1,f="dots",wa,Qn=[],fa=()=>{},qn=ua(),u=new maplibregl.Map({container:"map",style:ca(qn),pixelRatio:ia(qn),fadeDuration:la(qn),renderWorldCopies:!1,center:Ie.camera?[Ie.camera.lon,Ie.camera.lat]:fc,zoom:Ie.camera?.zoom??yc,cooperativeGestures:qs(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{uo(u),pr(u),Lr(u,tt),Er(u,tt),Hr(u,"walk-fill"),is(u),ws(u,St),Fs(u,tt),F(),u.on("click",t=>{if(U)return;if(Sa){Be({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(f==="places"){let s=u.queryRenderedFeatures(t.point,{layers:[ie]})[0];s&&Ct(s.properties.key);return}let n=[...et,...gt].filter(s=>u.getLayoutProperty(s,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];ro(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});fa=da(u,e,[...po(t=>{let n=nt(),o=t.find(r=>et.includes(r.layer?.id));return n&&o?fn(o.properties,$(),n.buckets,{pole:!1}):null}),...et.map(t=>({layer:t,html:n=>{let o=nt();return o?fn(n.properties,$(),o.buckets):null},anchor:n=>n.geometry.coordinates})),...gt.map(t=>({layer:t,html:n=>{let o=ye();return o?Jr(n.properties,o):null},anchor:n=>n.geometry.coordinates})),{layer:"stoproutes-lines",html:t=>$s(t.properties)},{layer:ie,html:t=>Ks(t.properties,B,$())}]),Mc(),u.on("moveend",()=>{let t=u.getCenter();ba={lat:t.lat,lon:t.lng,zoom:u.getZoom()},w(),j()}),ce(k.radius,t=>{D=Number(t.dataset.radius),pn(u,D,$()).then(w),st()&&Sn(u,D,$()).then(w),at()&&Ln(D).then(w),ye()&&At(),v&&Le(v.lat,v.lon)}),ce(k.day,t=>{let n=t.dataset.day;Co(n),f!=="journey"&&F(),mn(u,n),Ht(),vn(u,n),f==="journey"&&v&&eo(v.lat,v.lon),ut()&&Or(u,n).then(w),_e&&ye()&&(At(),v&&Le(v.lat,v.lon)),Ne()&&B==="service"&&Ot(u,B,n),w()}),ce(k.oneSeatDay,t=>{_e=t.dataset.oneseatDay==="selected",Zn(),At(),v&&Le(v.lat,v.lon)}),ce(k.view,t=>{let n=f;f=t.dataset.view,fa(),Xo(u,f==="dots"||f==="both"),_c(f==="surface"||f==="both"),xc(f==="corridors"),Pc(f==="oneseat"),Oc(f==="journey",n==="journey"),kc(f==="places"),f!=="journey"&&n!=="journey"&&(f==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),Ec(zt(f)),Ra();let o=f==="oneseat"||f==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",f!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",f!=="places"),ka(),z()||ya(!1),$e(),Zn(),o||Ft(!1),$a()}),ce(k.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Ft(!0);return}Ft(!1),Be({key:n})}),ce(k.placeFill,t=>{B=t.dataset.placeFill,Ne()&&Ot(u,B,$()),F(),w(),Zn()}),ce(k.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=N!=="off"&&_t()!==null;N=n,F(),o&&n!=="off"?(be(u,_t(),n),T&&oo(T.radius)):Ht()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){It=n.dataset.weight,w(),j();return}let o=t.target.closest("[data-surface-unit]");if(o){Re=o.dataset.surfaceUnit,Rc(Re),j();return}let r=t.target.closest("[data-bucket]");r&&(mr(u,r.dataset.bucket,$()),w())}),c("legend-reset").addEventListener("click",()=>{gr(u,$()),w()}),c("legend-select").addEventListener("click",()=>ya(!U)),c("legend-clear").addEventListener("click",()=>{un(u),$e(),w(),j()}),c("legend-collapse").addEventListener("click",()=>{Xn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Be({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Fc(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&Ct(r.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(va=s.dataset.sortPlaces,F());let a=t.target.closest("[data-goto-place]");a&&(f!=="places"&&te(k.view,"places"),Ct(a.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Lc),Ue&&Yn(Xn),wa=Ue?bc:sa({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Xn}),vc(),ga(),Ut(),$e(),Bt(),Sc(Ie),pn(u,D,$()).then(w),Ac(),Cc()});function ce(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),Ut(),j()})})}function te(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Sc(e){e.radius!==void 0&&te(k.radius,String(e.radius)),e.day&&te(k.day,e.day),e.oneSeatRestricted!==void 0&&te(k.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(It=e.weight),e.surfaceUnit&&(Re=e.surfaceUnit),e.placeFill&&te(k.placeFill,e.placeFill),e.dest&&("key"in e.dest?te(k.dest,e.dest.key):Be(e.dest)),e.selection&&rr(u,e.selection),e.stopRoutes&&te(k.stopRoutes,e.stopRoutes),e.view&&te(k.view,e.view),e.at&&ro(e.at.lat,e.at.lon),e.place&&Ct(e.place)}function j(){let e={view:f,day:$(),radius:D,oneSeatRestricted:_e,weight:It,surfaceUnit:Re,dest:R,at:v,camera:ba,place:Nt,placeFill:B,selection:tr(),stopRoutes:N},t=Xs(e);history.replaceState(null,"",(Ue?ta(t):t)+location.hash),Bt(t)}function Bt(e=na(location.search)){if(!Ue)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=v?ne?De(ne):"this point":null;t.querySelector(".el-action").textContent=oa(n)}function Ut(){c("statebar").innerHTML=Ys({view:f,day:$(),radius:D,oneSeatRestricted:_e,destination:je(),stopRoutes:N}),wc()}function Xn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function vc(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function wc(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Ws(f)))}function Lc(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function w(){$c()}function $c(){if(c("legend-reset").classList.toggle("hidden",_n()||En()||Cn()||Ne()||!z()),Cn()){c("legend").innerHTML=ps(vt());return}if(Ne()){c("legend").innerHTML=Js({selected:Ts(),fill:B,day:$(),boundaries:jn(),unchanged:Ms()});return}if(_n()){let n=ut();n&&Yr(c("legend"),n);return}if(En()){let n=ye();if(!n)return;let o=u.getBounds();zr(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=nt();if(!e)return;let t=u.getBounds();qr(c("legend"),{layer:e,day:$(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:It,dots:z(),surface:bn()?st():null,unit:Re,population:at(),selection:er()})}async function _c(e){if(e&&!st()){c("legend").classList.add("loading");try{await Sn(u,D,$())}finally{c("legend").classList.remove("loading")}}$r(u,e),e&&Re==="people"&&await La(),w()}async function La(){if(!at()){c("legend").classList.add("loading");try{await Ln(D)}finally{c("legend").classList.remove("loading")}}}async function Rc(e){e==="people"&&bn()&&await La(),w()}async function xc(e){if(e&&!ut()){c("legend").classList.add("loading");try{await Rn(u,$())}finally{c("legend").classList.remove("loading")}}Pr(u,e),w()}async function kc(e){if(e&&(!Un()||!jn())){c("legend").classList.add("loading");try{await Promise.all([Ns(),Hs(u)])}finally{c("legend").classList.remove("loading")}}Bs(u,e),e&&Ot(u,B,$()),e&&F(),w()}async function Ct(e){Nt=await no(()=>Is(u,e))?e:null,f==="places"&&(F(),Nt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),w(),j()}function Ec(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),Bt(),f==="places"){c("panel").innerHTML=Us(Un()??[],va,Nt,B);return}if(!ne){f==="oneseat"?c("panel").innerHTML=Yo(je()):Ao(c("panel"));return}if(f==="oneseat"){let t=Wo(ne,R,$());if(t){c("panel").innerHTML=t;return}}Go(ne,{withKerb:z(),routes:N})}function Oc(e,t=!1){if(ls(u,e),w(),!e){t&&(v?Le(v.lat,v.lon):F());return}vt()&&v?c("panel").innerHTML=Fn(vt(),je()):c("panel").innerHTML=ds(je())}async function eo(e,t){let n=++ue;v={lat:e,lon:t},j(),xa(e,t);let o=_a(),r=d(je());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await x(cs({lat:e,lon:t},o,$()));if(n!==ue)return;An(u,s),c("panel").innerHTML=Fn(s,r),w(),Bt()}catch(s){if(n!==ue)return;An(u,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Zn(){c("day-controls").classList.toggle("hidden",!Ur(f,_e,B))}function to(){return Br(_e,$())}async function Pc(e){e&&!ye()&&await no(()=>On(u,D,R,to())),jr(u,e),w()}async function At(){await no(()=>On(u,D,R,to())),w()}async function no(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Be(e){if(R=e,Ft(!1),Dc(),$a(),Ut(),j(),f==="journey"){v&&eo(v.lat,v.lon),w();return}v?Le(v.lat,v.lon):F({scrollToTop:!0}),At()}function $a(){let e=_a();if(!(e!==null&&(f==="journey"||f==="oneseat"&&"lat"in R))){le?.remove(),le=null;return}le?le.setLngLat([e.lon,e.lat]).addTo(u):(le=new maplibregl.Marker({color:xn,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),le.on("dragend",()=>{let n=le.getLngLat();Be({lat:n.lat,lon:n.lng})}))}function Dc(){let e=Ir(R);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function _a(){if("lat"in R)return{lat:R.lat,lon:R.lon};let e=R.key,t=Qn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function je(){if("lat"in R)return`${R.lat.toFixed(4)}, ${R.lon.toFixed(4)}`;let e=R.key;return Qn.find(t=>t.key===e)?.name??e}function Ft(e){Sa=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Le(e,t){let n=++ue;v={lat:e,lon:t},j(),c("panel").classList.add("loading"),xa(e,t),Vt(u),be(u,null,Mt()),c("pin-key").classList.add("hidden");try{let o="lat"in R?`&dest_lat=${R.lat.toFixed(6)}&dest_lon=${R.lon.toFixed(6)}`:"",r=await x(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${D}${o}&oneseat_day=${to()}`);if(n!==ue)return;T={lat:e,lon:t,radius:D,now:r.current.stops,proposed:r.proposed.stops},ne=r,ka(),Ra(),F({scrollToTop:!0})}catch(o){if(n!==ue)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ue&&c("panel").classList.remove("loading")}}var T=null;function Ra(){if(!T||!zt(f)){Vt(u),c("pin-key").classList.add("hidden"),Ht();return}mo(u,T.lat,T.lon,T.radius,T.now,T.proposed),oo(T.radius),Ht()}function Ht(){let e=++Vn,t=()=>{T&&oo(T.radius)};N!=="off"&&z()&&v&&ne?.kerb?x(Ls(v,$())).then(n=>{e===Vn&&(be(u,n,Mt()),Rt(u,!0),Rs(u),t())}).catch(()=>{e===Vn&&(be(u,null,Mt()),Rt(u,!1),t())}):(be(u,null,Mt()),Rt(u,!1),t())}function oo(e){let t=N!=="off"&&Ss()&&vs(_t(),N)?N:!1;c("pin-key").innerHTML=Vr(e,{routes:t}),c("pin-key").classList.remove("hidden")}function xa(e,t){He?He.setLngLat([t,e]):(He=new maplibregl.Marker({color:hc,draggable:!0}).setLngLat([t,e]).addTo(u),He.on("dragend",()=>{let n=He.getLngLat();ro(n.lat,n.lng)}))}var Tt=14;function z(){return f==="dots"||f==="both"}function ya(e){U=e&&z(),U?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=U?"none":"",U||Ea(),$e()}function ka(){let e=z()&&!!ne?.kerb;c("stop-routes-controls").classList.toggle("hidden",!e)}function $e(){let e=c("legend-select");e.classList.toggle("hidden",!z()),e.setAttribute("aria-pressed",String(U)),e.textContent=U?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!z()||!nr())}function Tc(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!U}function ha(e){c("brush").classList.toggle("painting",e)}function Ea(){c("brush").hidden=!0}function Mc(){let e=c("brush");e.style.width=`${Tt*2}px`,e.style.height=`${Tt*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,$e(),w()}))},s=()=>{U&&(t=!0,n=!1,ha(!0))},a=l=>{if(Tc(l.point.x,l.point.y),!t)return;n=!0,cn(u,dn(u,l.point.x,l.point.y,Tt))&&r()},i=l=>{if(ha(!1),!!t){if(t=!1,!n){let[p]=dn(u,l.point.x,l.point.y,Tt);p&&or(u,p)}$e(),w(),j()}};u.on("mousedown",s),u.on("mousemove",a),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",Ea),u.on("touchstart",s),u.on("touchmove",a),u.on("touchend",i)}function ro(e,t){if(wa.atLeast("half"),f==="journey"){eo(e,t);return}f!=="places"&&Le(e,t)}async function Cc(){try{Qn=await x("/api/destinations"),Ut()}catch{}}async function Ac(){try{let e=await x("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Fc(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
