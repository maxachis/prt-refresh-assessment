"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function x(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Rt=new Map;function re(e){let t=Rt.get(e);if(t)return t;let n=x(e).catch(o=>{throw Rt.delete(e),o});return Rt.set(e,n),n}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function se(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Pt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Et(e){return e>0?`+${e}`:String(e)}function Nn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var jr="#15181e",Hn="#ffa23a",Ur="#ffffff";function Jr(e,t,n,o=96){let a=[],r=n/111320,s=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let c=i/o*2*Math.PI;a.push([t+s*Math.cos(c),e+r*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function j(e){return{type:"FeatureCollection",features:e}}function Gr(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Yr(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",a=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${a}`}function Ot(e){return e!=="corridors"&&e!=="journey"&&e!=="places"}function Dt(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(j([]))}function Bn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function In(e){e.addSource("walk",{type:"geojson",data:j([])}),e.addSource("stops-now",{type:"geojson",data:j([])}),e.addSource("stops-prop",{type:"geojson",data:j([])}),e.addSource("stop-moves",{type:"geojson",data:j([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Hn,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Ur,"circle-stroke-width":3,"circle-stroke-color":Hn}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":jr,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function jn(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Yr(n.properties,e(o))}))}function Un(e,t,n,o,a,r){e.getSource("walk").setData(j([Jr(t,n,o)])),e.getSource("stops-now").setData(j(Bn(a,"current"))),e.getSource("stops-prop").setData(j(Bn(r,"proposed"))),e.getSource("stop-moves").setData(j(Gr(r)))}var R=["weekday","saturday","sunday"],Tt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Jn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Fe=4,Ne=6,Gn=e=>Ne+Fe*e,Yn=e=>Ne+1+Fe*e,Se=e=>Ne+2+Fe*e,Kr=e=>Ne+3+Fe*e,He=2,zr=3,Le=4,Kn=5,ie=e=>e[zr],P=(e,t)=>e[t],zn=(e,t)=>e[Kr(t)],Mt=e=>2+2*e,Ct=e=>3+2*e,Be=4,Wn=e=>2+Be*e,Vn=e=>3+Be*e,qn=e=>4+Be*e,Xn=e=>5+Be*e;var Zn="at this stop",Qn=e=>`within ${e} m`,Wr="both directions",Vr="one or both directions",Ft="weekday";function S(){return Ft}function ro(e){Ft=e}function so(e){e.innerHTML=`
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
    </div>`}function io(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function qr(e,t){let n=Math.max(1,...Tt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Tt.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,s=r-a,i=s>0?"up":s<0?"down":"flat";return`
      <tr>
        <th>${Jn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${i}">${s===0?"\xB7":Et(s)}</td>
      </tr>`}).join("")}function lo(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function eo(e){return e.first==null?'<span class="muted">no service</span>':`${se(e.first)}\u2013${se(e.last)}`}function to(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Xr={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Zr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Qr(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Ie(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${Xr[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Zr[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${le("one-seat")}</p>
    </div>`:""}function le(e){return` <button class="howto" data-caveat="${e}">method</button>`}function $e(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function no(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function oo(e){return e.first==null||e.last==null?null:e.last-e.first}function Ie(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${ao(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${ao(t,n,"prop")}</div>
    </div>`}function ao(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${d(o)}</span>`).join(" "):'<span class="muted">none</span>'}var At=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,es="Allegheny";function _e(e){let t=e.place?.muni?.trim()??"",n=At.exec(t)?.[1],o=n===es?t.replace(At,""):n?`${t.replace(At,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Nt(e){return e==="weekday"?"weekday":e}function co(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Nt(t)}`}function ts(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function ns(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",r=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",s=[a,r].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${s}</div></dd>`}function os(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let a=(r,s)=>`${r.length} of ${s.length}`;return`
      <dt>Routes in one direction only${le("one-direction")}</dt>
      ${$e(a(n,e.routes),a(o,t.routes))}`}function uo(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",r=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Nt(t)}, today only</span>`;return`<dt>Boardings ${d(n)}</dt><dd>${r}${a}</dd>`}function po(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${le("boardings")}</p>`}function as(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${le("place-population")}</p>
    </div>`}function mo(e,t,n,o,{directions:a}={}){let r=t.trips-e.trips,s=r>0?"up":r<0?"down":"flat";return`
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
      <div class="hl-delta ${s}">
        ${r===0?"no change":`${Et(r)} trips`}
        <div class="muted">${Nn(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Nt(n)} ${d(o)}${a?`, ${d(a)}`:""}</div>`}function ho(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${qr(e,t)}</tbody>
    </table>`}function go(e,t){let n=to(e),o=to(t),a=oo(e),r=oo(t);return`
      <dt>First and last</dt>
      ${$e(eo(e),eo(t))}
      <dt>Hours between</dt>
      ${$e(Pt(a),Pt(r),no(a,r,"more"))}
      <dt>Typical wait</dt>
      ${$e(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,no(n,o,"less"))}`}function yo(e,t,n){return`
    <div class="routes">
      <h3>${d(n)}</h3>
      ${Ie(e.routes,t.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${le("location-not-route")}</p>
    </div>`}function rs(e,t){let n=e.current.days[t],o=e.proposed.days[t],a=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${d(a)}
        <span class="muted">\xB7 PRT stop ${d(e.stop_id)}</span></div>
      ${mo(n,o,t,Zn)}
      <div class="tiers">${io(n.hourly,o.hourly)}</div>
      ${ho(n,o)}
      <dl class="facts">
        ${go(n,o)}
        ${uo(n.boardings,t,Zn)}
      </dl>
      ${po(n.boardings)}
      ${yo(n,o,"Routes calling at this stop")}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${le("kerb")}</p>
    </section>`}function Ht(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],r=o.one_direction_routes?.length||a.one_direction_routes?.length;return`
    ${mo(o,a,t,Qn(e.radius),{directions:r?Vr:Wr})}

    <div class="tiers">${io(o.hourly,a.hourly)}</div>

    ${ho(o,a)}
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
      ${go(o,a)}
      ${os(o,a)}
      <dt>Stops within ${e.radius} m</dt>
      ${$e(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${ns(e.current.stops)}
      ${ts(e.proposed.stops)}
      ${uo(o.boardings,t,Qn(e.radius))}
    </dl>
    ${po(o.boardings)}

    ${n}

    ${as(e.population)}

    ${yo(o,a,"Routes serving this spot")}`}function ss(e,t,{withKerb:n=!1}={}){let o=n?e.kerb??null:null,a=o?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${d(_e(e))}</h2>
      <div class="muted">${a}</div>
    </div>
    ${o?rs(o,t):""}
    ${o?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${Ht(e,t,Qr(e.oneseat??[],e.oneseat_day??"any"))}`}function fo(e,t={}){document.getElementById("panel").innerHTML=ss(e,Ft,t)}var is={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},ls={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},cs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function us(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Bt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${lo(t)}</div>`:""}function ds(e){let t=Bt("kept",e.kept)+Bt("lost",e.lost)+Bt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ps(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Ie(e.current,e.proposed)}
    </div>`}function ms(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${d(a.key)}">
      <span class="os-name">${d(a.name)}</span>
      <span class="os-status ${d(a.status)}">${hs[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var hs={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function gs(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${cs[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function bo(e,t,n){let o=us(e,t);if(!o)return"";let a=e.oneseat_day??"any",r=o.status==="here"?"":ds(o)+ps(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(_e(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${is[o.status]}</div>
    <p class="note">${ls[o.status]} ${gs(a)}</p>

    ${r}

    ${ms(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${co(e,n)}</summary>
      ${Ht(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function vo(e){return`
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
    </div>`}var Ue={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ce="change",K="change-dots",X=["boolean",["feature-state","selected"],!1],wo="#15181e",Z=["==",["get","published"],0],Ge="newplace",ys="#15181e",fs=5,Je=["==",["get","removed"],1],Ye="removedstop",xe="change-removed",Ut="change-removed-selected",It="removed-cross",Lo="#e8232f";function bs(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[r,s]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,Lo]])o.lineWidth=r,o.strokeStyle=s,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var je=null,Y=new Set,A=new Set,vs=[K,Ut,xe],Ke=[K,xe],ze=K;function $o(e,t){for(let n of vs)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function We(){return je}function Re(e){return Y.has(e)}function _o(e,t,n,o){return a=>Ls(a,e,t,n,o)}function ko(e){return t=>e.has(ie(t))}function xo(){return A}function Ro(){return[...A].sort()}function Po(){return A.size}function Jt(e,t){let n=0;for(let o of t)A.has(o)||(A.add(o),ke(e,o,!0),n++);return n}function Eo(e,t){A.delete(t)?ke(e,t,!1):(A.add(t),ke(e,t,!0))}function Oo(e,t){Gt(e),Jt(e,t)}function Gt(e){for(let t of A)ke(e,t,!1);A.clear()}function ke(e,t,n){try{e.setFeatureState({source:ce,id:t},{selected:n})}catch{}}function ws(e){for(let t of A)ke(e,t,!0)}function Ss(e,t,n,o){let a=n*n;return o.filter(r=>(r.x-e)**2+(r.y-t)**2<=a).map(r=>r.id)}function Yt(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],r=[K,xe].filter(i=>e.getLayer(i)),s=e.queryRenderedFeatures(a,{layers:r}).filter(i=>i.id!==void 0).map(i=>{let[c,p]=i.geometry.coordinates,m=e.project([c,p]);return{id:i.id,x:m.x,y:m.y}});return Ss(t,n,o,s)}function Do(e,t,n,o){let a={};for(let r of n)a[r]=0;for(let r of e){if(!o(r)||P(r,He)===0||P(r,Le)===1)continue;let s=n[P(r,Se(t))];s!==void 0&&a[s]++}return a}function To(e,t){let n=0;for(let o of e)t(o)&&P(o,He)===0&&n++;return n}function Mo(e,t){let n=0;for(let o of e)t(o)&&P(o,Le)===1&&n++;return n}function Ls(e,t,n,o,a){let r=P(e,0),s=P(e,1);return r>=n&&r<=a&&s>=t&&s<=o}function Co(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let r of n)a.riders[r]=0,a.measured[r]=0;for(let r of e){if(!o(r)||P(r,He)===0)continue;let s=n[P(r,Se(t))];if(s===void 0)continue;let i=zn(r,t),c=P(r,Le)===1;if(i===null){s!=="none"&&a.unmeasured++;continue}if(c){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[s]+=i,a.measured[s]++}return a}function $s(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>R.some((o,a)=>t[P(n,Se(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ie(n),published:n[2],removed:n[Le],name:n[Kn],moved:e.moved?.[ie(n)]??null,replacement:e.replacement?.[ie(n)]?.[0]??null,nearestStraight:e.replacement?.[ie(n)]?.[1]??null,...Object.fromEntries(R.flatMap((o,a)=>[[`b${a}`,t[P(n,Se(a))]],[`sc${a}`,n[Gn(a)]],[`sp${a}`,n[Yn(a)]]]))}}))}}function Ao(e,t){let n=Object.entries(Ue).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Ue.none[t]]}function Fo(e){return["case",Z,"rgba(0,0,0,0)",Ao(e,"color")]}function jt(e){return["case",Z,fs,Ao(e,"size")]}function No(e){return["interpolate",["linear"],["zoom"],9,["*",jt(e),.45],12,jt(e),16,["*",jt(e),1.9]]}function Ho(e){e.addSource(ce,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:K,type:"circle",source:ce,paint:{"circle-color":Fo(0),"circle-radius":No(0),"circle-opacity":.85,"circle-stroke-color":["case",X,wo,Z,ys,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,Z,.9,.5],12,["case",X,2.4,Z,1.5,1],16,["case",X,3.2,Z,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Ut,type:"circle",source:ce,filter:Je,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":wo,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,0],12,["case",X,2.4,0],16,["case",X,3.2,0]]}},"walk-fill"),e.hasImage(It)||e.addImage(It,bs(),{pixelRatio:2}),e.addLayer({id:xe,type:"symbol",source:ce,filter:Je,layout:{"icon-image":It,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Kt(e,t,n){return je=await re(`/api/change?radius=${t}`),e.getSource(ce).setData($s(je)),ws(e),zt(e,n),je}function zt(e,t){let n=R.indexOf(t);e.setPaintProperty(K,"circle-color",Fo(n)),e.setPaintProperty(K,"circle-radius",No(n)),Wt(e,t)}function Bo(e,t,n){Y.has(t)?Y.delete(t):Y.add(t),Wt(e,n)}function Io(e,t){Y.clear(),Wt(e,t)}function Wt(e,t){let n=R.indexOf(t),o=["none",...Y],a=["case",Z,!Y.has(Ge),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(K,["all",["!",Je],a]);let r=["all",Je,!Y.has(Ye)];e.setFilter(xe,r),e.setFilter(Ut,r)}function _s(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function Vt(e,t,n,{pole:o=!0}={}){let a=R.indexOf(t),r=e[`b${a}`],s=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(y=>y.key===r)?.label??r,c=e[`sc${a}`],p=e[`sp${a}`],m=t==="weekday"?"weekday":t;return`${o?_s(e):""}${xs(e)}${c} \u2192 ${p} buses per ${m} at this stop<br>${s?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var ks=1.5,So=800;function xs(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??So,a=n!=null&&o>n*ks?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",r=t==null?`no other stop within a ${So} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${Lo}">Stop removed</b> \u2014 ${r}<br>`}var qt="surface",qe="surface-fill",jo="#6b7280",Xt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,jo],[.138,jo],[1,"#bd60e7"],[2,"#961bed"]],M="#e8232f",C="#0f79c9",Uo=2,Ve=null,Jo=!1;function Xe(){return Ve}function Zt(){return Jo}function Go(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Uo,Math.min(Uo,n))}function Yo(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Ko(e,t,n,o,a,r,s,i){let c={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=s.lat0+(p[1]+.5)*s.dlat,y=s.lon0+(p[0]+.5)*s.dlon;if(m<o||m>r||y<n||y>a)continue;let L=p[Mt(t)],$=p[Ct(t)],D=Yo(L,$);if(D!=="none")if(D==="ramp"){let g=Go(L,$);c[g<-.138?"less":g>.138?"more":"same"]+=i}else c[D]+=i}return c}function Rs(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let s=t+r[1]*o,i=s+o,c=n+r[0]*a,p=c+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,s],[p,s],[p,i],[c,i],[c,s]]]},properties:Object.fromEntries(R.flatMap((m,y)=>{let L=r[Mt(y)],$=r[Ct(y)];return[[`k${y}`,Yo(L,$)],[`v${y}`,Go(L,$)??0]]}))}})}}function zo(e){return["case",["==",["get",`k${e}`],"gone"],M,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Xt.flatMap(([t,n])=>[t,n])]]}function ue(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Wo(e,t){e.addSource(qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:qe,type:"fill",source:qt,layout:{visibility:"none"},paint:{"fill-color":zo(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,ue(0,.85),13,ue(0,.62),16,ue(0,.45)]}},t)}async function Qt(e,t,n){return Ve=await re(`/api/surface?radius=${t}`),e.getSource(qt).setData(Rs(Ve)),en(e,n),Ve}function en(e,t){let n=R.indexOf(t);e.setPaintProperty(qe,"fill-color",zo(n)),e.setPaintProperty(qe,"fill-opacity",["interpolate",["linear"],["zoom"],9,ue(n,.85),13,ue(n,.62),16,ue(n,.45)])}function Vo(e,t){Jo=t,e.setLayoutProperty(qe,"visibility",t?"visible":"none")}var tn=null;function Ze(){return tn}async function nn(e){return tn=await re(`/api/population?radius=${e}`),tn}function qo(e,t,n,o,a,r,s){let i={lost:0,gained:0,kept:0,none:0};for(let c of e){let p=s.lat0+(c[1]+.5)*s.dlat,m=s.lon0+(c[0]+.5)*s.dlon;p<o||p>r||m<n||m>a||(i.lost+=c[Wn(t)],i.gained+=c[Vn(t)],i.kept+=c[qn(t)],i.none+=c[Xn(t)])}return i}var on="corridor",Xo="corridor-lines",tt="#8b929c",Ps="#6f7783",et={lost:M,added:C,kept:tt};var Qe=null,Zo=!1;function nt(){return Qe}function an(){return Zo}function Es(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Qo(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Os(){let e=t=>["match",["get","klass"],"lost",et.lost,"added",et.added,t];return["interpolate",["linear"],["zoom"],9,e(Ps),14,e(tt)]}function Ds(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Ts(){return["match",["get","klass"],"kept",.85,.9]}function ea(e,t){e.addSource(on,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Xo,type:"line",source:on,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Os(),"line-width":Ds(),"line-opacity":Ts()}},t)}async function rn(e,t){return Qe=await x(`/api/corridors?day=${t}`),e.getSource(on).setData(Es(Qe)),Qe}async function ta(e,t){R.includes(t)&&await rn(e,t)}function na(e,t){Zo=t,e.setLayoutProperty(Xo,"visibility",t?"visible":"none")}var ln="#2b3038",oa="#b9bec6",Pe={loses:{color:M,size:6},gains:{color:C,size:6},keeps:{color:tt,size:3},here:{color:ln,size:3.5},none:{color:oa,size:1.8}},at=["loses","gains","keeps","none","here"],sn="oneseat",aa="oneseat-dots",ot=null,ra=!1;function de(){return ot}function cn(){return ra}function sa(e,t,n,o,a,r){let s={};for(let i of t)s[i]=0;for(let i of e){let c=i[0],p=i[1];if(c<o||c>r||p<n||p>a)continue;let m=t[i[3]];m!==void 0&&s[m]++}return s}function Ms(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Cs(){return["match",["get","status"],...Object.entries(Pe).flatMap(([e,t])=>[e,t.color]),oa]}function As(){let e=["match",["get","status"],...Object.entries(Pe).flatMap(([t,n])=>[t,n.size]),Pe.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function ia(e,t){e.addSource(sn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:aa,type:"circle",source:sn,layout:{visibility:"none"},paint:{"circle-color":Cs(),"circle-radius":As(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Fs(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Ns="pin";function la(e){return"key"in e?e.key:Ns}var rt="any";function Hs(e,t,n){return`radius=${e}&${Fs(t)}&day=${n}`}function ca(e,t){return e?t:rt}function ua(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function un(e,t,n,o=rt){return ot=await x(`/api/oneseat?${Hs(t,n,o)}`),e.getSource(sn).setData(Ms(ot)),ot}function da(e,t){ra=t,e.setLayoutProperty(aa,"visibility",t?"visible":"none")}function dn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function pa(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=i=>i.length?i.join(", "):"none",s=dn(t);return e.status==="here"?`<b>at ${s}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${s}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var st={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},pn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Bs=new Set(["gone","new"]);function Is(e,t,n){return Bs.has(e)?`${t} (${pn[n]})`:t}function js(e){return e.buckets.filter(t=>t.key!=="none")}var ma={area:"Ground",people:"People"};function Us(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Ko(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=s=>s.toFixed(s<10?1:0);return`
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Js(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=qo(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),r=s=>Math.round(s).toLocaleString();return`
      <div class="lg-area">
        <span><b>${r(a.lost)}</b> people lose all service</span>
        <span><b>${r(a.gained)}</b> gain service</span>
        <span><b>${r(a.kept)}</b> keep a bus</span>
        <span><b>${r(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Gs=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function ha(e){let{layer:t,day:n,bounds:o,unit:a,population:r,scoped:s=!1,named:i=!1}=e,c=Xt.map(([p,m])=>`${m} ${((p+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${c})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${M}"></i>loses all service
          (${pn[n]})</span>
        <span><i style="background:${C}"></i>new service
          (${pn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(ma).map(p=>`
          <button data-surface-unit="${p}" aria-pressed="${a===p}"
                  class="${a===p?"active":""}">${ma[p]}</button>`).join("")}
      </div>
      ${s?Gs:a==="people"?Js(n,o,r):Us(t,n,o)}
    </div>`}var Ys=["lost","added","kept"],Ks={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},zs={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ya(e,t){let{lostPct:n,addedPct:o}=Qo(t.km),a=i=>i.toFixed(1),s=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${s}</b> km of street, citywide \u2014 ${zs[t.day]}
    </div>
    ${Ys.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${et[i]}"></i>
        <span class="lg-lab">${d(Ks[i])}</span>
        <span class="lg-n">${a(t.km[i])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${a(n)}%</b> of today's pavement lost</span>
      <span><b>${a(o)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A street either has a bus on it or it doesn't, so
      there is no walk radius here. A street can lose its only bus while the
      block beside it keeps one: for what a rider can still reach on foot, see
      Stop-by-stop or Surface.</div>`}function fa(e,t,n){let o=t.statuses.map(m=>m.key),a=sa(t.points,o,n.west,n.south,n.east,n.north),r=m=>t.statuses.find(y=>y.key===m)?.label??m,s=at.reduce((m,y)=>m+(a[y]??0),0),i=dn(t),c=t.day&&t.day!==rt,p=c?`Restricted to routes running on ${st[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(i)}</b>
      <span class="muted">\xB7 ${s.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${c?` \xB7 ${st[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${at.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${Pe[m].color}"></i>
        <span class="lg-lab">${d(r(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${at.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(r(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(i)} without transferring?
      ${p} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function ba(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var ga={locations:"Stops",riders:"Riders"};function Ws(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,r=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",s=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${r}${s}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Vs(e){if(!e)return"";let t=Re(Ge);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Ge}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function qs(e,t){if(!e)return"";let n=Re(Ye);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Ye}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Xs(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Vs(e)}
      ${qs(t,n)}
    </div>`}function va(e,t){let{layer:n,day:o,bounds:a,weight:r,surface:s,unit:i="area",population:c,selection:p,dots:m=!0}=t,y=n.buckets.map(w=>w.key),L=n.days.indexOf(o),{west:$,south:D,east:g,north:I}=a,G=js(n),k=p&&p.size>0?p:null,Ae=k?ko(k):_o($,D,g,I),An=Do(n.points,L,y,Ae),_t=To(n.points,Ae),kt=Mo(n.points,Ae),T=r==="riders"?Co(n.points,L,y,Ae):null,Ar=w=>T?T.measured[w]?Math.round(T.riders[w]).toLocaleString():"\u2014":An[w].toLocaleString(),Fr=T?T.removedMeasured?Math.round(T.removedRiders).toLocaleString():"\u2014":kt.toLocaleString(),Nr=k?`at ${k.size.toLocaleString()} selected stop${k.size===1?"":"s"}`:"in view",Fn=G.reduce((w,xt)=>w+An[xt.key],0)+_t+kt,Hr=T?`<b>${Math.round(G.reduce((w,xt)=>w+T.riders[xt.key],0)+T.removedRiders).toLocaleString()}</b> daily boardings ${Nr}`:k?`<b>${Fn.toLocaleString()}</b>
         of ${k.size.toLocaleString()} selected stops`:`<b>${Fn.toLocaleString()}</b>
         stops in view`,Br=s?` \xB7 surface: ${n.radius} m walk`:"",Ir=!m&&!!s;e.innerHTML=Ir?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${st[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${ha({layer:s,day:o,bounds:a,unit:i,population:c,scoped:!!k,named:!0})}`:`
    <div class="lg-head">
      ${Hr}
      <span class="muted">\xB7 ${st[o]}${Br}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(ga).map(w=>`
        <button data-weight="${w}" aria-pressed="${r===w}"
                class="${r===w?"active":""}">${ga[w]}</button>`).join("")}
    </div>
    ${G.map(w=>`
      <button class="lg-row ${Re(w.key)?"off":""}" data-bucket="${d(w.key)}"
              aria-pressed="${!Re(w.key)}">
        <i style="background:${Ue[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(Is(w.key,w.label,o))}</span>
        <span class="lg-n">${Ar(w.key)}</span>
      </button>`).join("")}
    ${Xs(_t,kt,Fr)}
    ${s?ha({layer:s,day:o,bounds:a,unit:i,population:c,scoped:!!k}):""}
    ${T?Ws(T.unmeasured,_t):""}
    ${k?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var mn="#4aa3ff",xa="#ffa23a",hn="headline",it="journey",Ra="journey-rides",Pa="journey-walks",Zs=[Ra,Pa],Ea=null,Oa=!1;function ct(){return Ea}function gn(){return Oa}function Qs(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let s of r.legs){let i=s.from??e.origin,c=s.to??e.destination,p=[[i.lon,i.lat],[c.lon,c.lat]],m=s.path?.length?s.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:s.kind,route:s.route}})}}return{type:"FeatureCollection",features:o}}function wa(){return["match",["get","side"],"current",mn,"proposed",xa,mn]}function Sa(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Da(e,t){e.addSource(it,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ra,type:"line",source:it,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":wa(),"line-width":Sa(1),"line-opacity":.85}},t),e.addLayer({id:Pa,type:"line",source:it,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":wa(),"line-width":Sa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Ta(e,t){Oa=t;for(let n of Zs)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function yn(e,t){Ea=t;let n=t?Qs(t,hn):{type:"FeatureCollection",features:[]};e.getSource(it).setData(n)}function Ma(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var La=e=>`${e.toFixed(1)} min`;function Ca(e){return e==null?"\u2014":e===0?"no change":e>0?`${La(e)} slower`:`${La(-e)} faster`}function $a(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function ei(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=$a(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${$a(e.to,"the destination")}</span></div>`}function _a(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(ei(a,t)),o=a}return n.join("")}var ti={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function lt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function ni(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function oi(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${lt(t.current)} \u2192
        ${lt(t.proposed)} min</span>
        <span class="muted">${Ca(t.change_min)}</span></div>
      ${o}
    </div>`}function ka(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function fn(e,t){let n=e.radii[hn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${se(e.window.start_min)}
        and ${se(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${ti[n.classification]??""}</p>
      </div>
      ${ka(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${lt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${lt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Ca(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${ni(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?_a(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?_a(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${oi(e)}
    ${ka(e)}`}function Aa(e){return`
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
    </div>`}function Fa(e){let t=e?e.radii[hn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${mn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${xa}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var pt="places",Ba="places-points",bn="places-boundaries",ee="places-fill",me="lost",ai=100,ri={lost:"share_lost",gained:"share_gained"};function W(e,t){return`service_${e}_${t}`}var Ia={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},si="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Q={lost:M,gained:C},ut=null,z=null,pe=null,ja=!1,dt=null;function vn(){return ut}function Ua(){return z}function Ja(){return dt}function wn(){return pe}function Ee(){return ja}function ii(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function li(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function ci(e){return Math.max(e.residents_lost,e.residents_gained)}var Na=4,ui=16,di=1e3;function pi(e){let t=Math.min(1,Math.sqrt(e/di));return Na+t*(ui-Na)}function mi(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:li(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:pi(ci(t))}}))}}function hi(){return["match",["get","klass"],"lost",Q.lost,"gained",Q.gained,Q.lost]}function gi(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var U=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var J=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Ga(e,t){return e==="service"?["step",["abs",["coalesce",["get",W(t,"pct")],0]],J[0].opacity,J[0].max,J[1].opacity,J[1].max,J[2].opacity,J[2].max,J[3].opacity]:["step",["coalesce",["get",ri[e]],0],U[0].opacity,Number.EPSILON,U[1].opacity,U[1].max,U[2].opacity,U[2].max,U[3].opacity,U[3].max,U[4].opacity]}function Ya(e,t){return e==="service"?["case",[">=",["coalesce",["get",W(t,"pct")],0],0],C,M]:Q[e]}function yi(e,t){let n=W(t,"now"),o=W(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var fi=3;function bi(e){if(e.length===0)return"";let t=e.slice(0,fi),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function Ka(e,t){e.addSource(bn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ee,type:"fill",source:bn,layout:{visibility:"none"},paint:{"fill-color":Ya(me),"fill-opacity":Ga(me),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(pt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ba,type:"circle",source:pt,layout:{visibility:"none"},paint:{"circle-color":hi(),"circle-radius":gi(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function mt(e,t,n){e.setPaintProperty(ee,"fill-color",Ya(t,n)),e.setPaintProperty(ee,"fill-opacity",Ga(t,n))}async function za(){return ut||(ut=await x("/api/places")),ut}async function Wa(e){return pe||(pe=await x("/api/boundaries"),e.getSource(bn).setData(pe)),pe}function vi(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Va(e,t){let n=vi(pe,t);if(n)return z=null,dt=n,e.getSource(pt)?.setData({type:"FeatureCollection",features:[]}),null;try{z=await x(`/api/places/${encodeURIComponent(t)}`)}catch{return z=null,dt=null,null}return dt=null,e.getSource(pt).setData(mi(z)),e.flyTo({center:[z.lon,z.lat],zoom:13}),z}function qa(e,t){ja=t,e.setLayoutProperty(Ba,"visibility",t?"visible":"none"),e.setLayoutProperty(ee,"visibility",t?"visible":"none")}function wi(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Si="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Xa(e,t,n,o){let a=ii(e,t).map(r=>wi(r,r.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${si}</p>
    ${o==="service"?`<p class="note">${Si}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Za(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Li(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function $i(e,t,n,o){let a=J.map((c,p)=>({band:c,prevMax:p===0?0:J[p-1].max})).filter(({band:c})=>c.opacity>0).flatMap(({band:c,prevMax:p})=>{let m=Li(c,p);return[`<div class="lg-row lg-static">
          <i style="background:${M};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),r=o?yi(o,n):[],s=bi(r),i=s?`<div class="lg-foot">${d(s)}</div>`:"";return`
    ${Za(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(Ia[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Qa({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return $i(e,a??null,n,o??null);let r=t==="lost"?"lose all buses":"gain a bus",s=U.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${Q[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(i.label)} of the place's own residents ${d(r)}</span>
    </div>`).join("");return`
    ${Za(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(r)}</div>
    ${s}
    <div class="lg-row lg-static"><i style="background:${Q.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Q.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function _i(e,t){let n=e[W(t,"now")],o=e[W(t,"proposed")],a=e[W(t,"pct")],r=e[W(t,"rail_proposed")],s=Ia[t];if(o===0&&n>0)return`Loses all buses on ${s} (${n} \u2192 0 trips)${r?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${s} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${s} (${i}).`}function er(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${_i(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=Ha("lose all buses",e.residents_lost,e.share_lost),r=e.residents_gained>0?Ha("gain a bus",e.residents_gained,e.share_gained):null,s=(t==="lost"?[a,r]:[r,a]).filter(i=>i!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${s.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Ha(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${ai} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var Sn=" \xB7 ",Ln={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},tr=Object.keys(Ln);function nr(e){return Ln[e]??e}var ki={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},xi=["oneseat","journey"];function Ri(e){return e!=="journey"}function Pi(e){let t=[Ln[e.view]??e.view];return e.view==="places"?t[0]:(xi.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":ki[e.day]),Ri(e.view)&&t.push(`${e.radius} m walk`),t.join(Sn))}function or(e){let[t,...n]=Pi(e).split(Sn);return`<b>${d(t)}</b>${n.map(o=>Sn+d(o)).join("")}`}var f={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},Ei=/^[cp]:[\w.:-]{1,32}$/,ht={any:"any",selected:"selected"},Oi="pin",ar=5;function sr(e){try{return e.self!==e.top}catch{return!0}}function ir(e){let t=new URLSearchParams;return t.set(f.view,e.view),t.set(f.day,e.day),t.set(f.radius,String(e.radius)),t.set(f.oneSeatDay,e.oneSeatRestricted?ht.selected:ht.any),t.set(f.dest,"key"in e.dest?e.dest.key:$n(e.dest)),e.weight==="riders"&&t.set(f.weight,e.weight),e.surfaceUnit==="people"&&t.set(f.surfaceUnit,e.surfaceUnit),e.at&&t.set(f.at,$n(e.at)),e.camera&&t.set(f.camera,`${$n(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(f.place,e.place),e.placeFill!==me&&t.set(f.placeFill,e.placeFill),e.selection.length&&t.set(f.selection,e.selection.join(",")),`?${t}`}function lr(e){let t=new URLSearchParams(e),n={},o=t.get(f.view);o&&tr.includes(o)&&(n.view=o);let a=t.get(f.day);a&&R.includes(a)&&(n.day=a);let r=Number(t.get(f.radius));t.has(f.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(f.weight)==="riders"?n.weight="riders":t.get(f.weight)==="locations"&&(n.weight="locations"),t.get(f.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(f.surfaceUnit)==="area"&&(n.surfaceUnit="area");let s=t.get(f.oneSeatDay);s===ht.selected?n.oneSeatRestricted=!0:s===ht.any&&(n.oneSeatRestricted=!1);let i=t.get(f.dest);if(i&&i!==Oi){let $=rr(i);$?n.dest=$:i.includes(",")||(n.dest={key:i})}let c=rr(t.get(f.at));c&&(n.at=c);let p=Di(t.get(f.camera));p&&(n.camera=p);let m=t.get(f.place);m&&(n.place=m);let y=t.get(f.selection);y!==null&&(n.selection=y.split(",").filter($=>Ei.test($)));let L=t.get(f.placeFill);return(L==="lost"||L==="gained"||L==="service")&&(n.placeFill=L),n}function $n(e){return`${e.lat.toFixed(ar)},${e.lon.toFixed(ar)}`}function rr(e){let t=cr(e,2);return t?{lat:t[0],lon:t[1]}:null}function Di(e){let t=cr(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function cr(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var _n="embed";var Ti=["1","true","yes"];function ur(e){let t=new URLSearchParams(e).get(_n);return t!==null&&Ti.includes(t.toLowerCase())}function dr(e){let t=new URLSearchParams(e);return t.set(_n,"1"),`?${t}`}function pr(e){let t=new URLSearchParams(e);t.delete(_n);let n=String(t);return n?`?${n}`:""}function mr(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var V=["peek","half","full"],Mi=192,Ci=.3,Ai=.55,Fi=.9,Ni=.6,Hi=.45;function gt(e,t){return e==="peek"?Math.min(Mi,t*Ci):e==="half"?t*Ai:t*Fi}function Bi(e,t,n=0){let o=V.map(r=>Math.abs(gt(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>Ni&&(a=Math.max(0,Math.min(V.length-1,a+(n>0?1:-1)))),V[a]}function hr(e){return V[(V.indexOf(e)+1)%V.length]}function Ii(e,t){return Math.min(e,t*Hi)}function he(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function kn(e){let t=null,n=()=>{let o=he();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var ji=8,Ui=400;function gr(e){let t=l("side"),n=l("sheet-handle"),o="peek",a=!1,r=0,s=0,i=0,c={y:0,t:0};function p(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,Ii(g,p()))}function y(g){o=g,t.dataset.snap=g,m(gt(g,p()))}n.addEventListener("pointerdown",g=>{he()&&(a=!0,r=g.clientY,s=t.getBoundingClientRect().height,i=g.timeStamp,c={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!a)return;let I=s+(r-g.clientY),G=gt("peek",p()),k=gt("full",p());m(Math.max(G,Math.min(k,I))),c={y:g.clientY,t:g.timeStamp}});function L(g){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-r)>ji)&&g.timeStamp-i<Ui){y(hr(o));return}let G=g.timeStamp-c.t,k=G>0?(c.y-g.clientY)/G:0;y(Bi(t.getBoundingClientRect().height,p(),k))}n.addEventListener("pointerup",L),n.addEventListener("pointercancel",L),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),he()&&y(hr(o)))});let $=kn(e.onLayoutChange);function D(){if($(),!he()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}y(o)}return window.addEventListener("resize",D),D(),{at:()=>he()?o:"full",atLeast(g){he()&&V.indexOf(g)>V.indexOf(o)&&y(g)}}}var Ji=["llvmpipe","swiftshader","softpipe","basic render","software"];function xn(e){if(!e)return!1;let t=e.toLowerCase();return Ji.some(n=>t.includes(n))}function fr(e){let t=xn(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function br(e){return xn(e.renderer)?0:Gi}var Gi=300,Yi="https://tiles.openfreemap.org/styles/positron",Ki=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],yr=[],zi=19,Wi='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Vi=!1;function vr(e){return!Vi||!xn(e.renderer)?Yi:qi()}function qi(){let e=o=>({type:"raster",tileSize:256,attribution:Wi,tiles:o,maxzoom:zi}),t={basemap:e(Ki)},n=[{id:"basemap",type:"raster",source:"basemap"}];return yr.length&&(t["basemap-labels"]=e(yr),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function wr(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),a=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof a=="string"?a:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Xi(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function Sr(e,t,n){let o=new Map(n.map(c=>[c.layer,c])),a=null,r="",s=c=>{r!==c&&(r=c,e.getCanvas().style.cursor=c)},i=()=>{a=null,s(""),t.remove()};return e.on("mousemove",c=>{let p=n.map(I=>I.layer).filter(I=>e.getLayer(I)&&e.getLayoutProperty(I,"visibility")!=="none");if(!p.length){i();return}let[m,...y]=e.queryRenderedFeatures(c.point,{layers:p});if(!m){i();return}s("pointer");let L=Xi(m);if(L===a)return;let $=o.get(m.layer?.id),D=$?$.html(m,y):null;if(D==null){a=null,t.remove();return}a=L;let g=$.anchor?$.anchor(m,c):c.lngLat;t.setLngLat(g).setHTML(D).addTo(e)}),e.on("mouseout",i),i}var Zi=[-79.9959,40.4406],Qi=12,el="#e2574c",E={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},De=lr(location.search),Me=ur(location.search);Me&&l("app").classList.add("embed");var tl={at:()=>"full",atLeast(){}},kr=null,O=400,Oe=null,b=null,ye=null,oe=0,_={key:"downtown"},te=null,xr=!1,ve=!1,St="locations",we="area",Rr="count",wt=null,F=me,H=!1,h="dots",Pr,On=[],Lr=()=>{},Rn=wr(),u=new maplibregl.Map({container:"map",style:vr(Rn),pixelRatio:fr(Rn),fadeDuration:br(Rn),renderWorldCopies:!1,center:De.camera?[De.camera.lon,De.camera.lat]:Zi,zoom:De.camera?.zoom??Qi,cooperativeGestures:sr(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{In(u),Ho(u),Wo(u,ze),ea(u,ze),ia(u,"walk-fill"),Da(u),Ka(u,ze),N(),u.on("click",t=>{if(H)return;if(xr){Te({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(h==="places"){let r=u.queryRenderedFeatures(t.point,{layers:[ee]})[0];r&&ft(r.properties.key);return}let n=[...Ke,"oneseat-dots"].filter(r=>u.getLayoutProperty(r,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Cn(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});Lr=Sr(u,e,[...jn(t=>{let n=We(),o=t.find(a=>Ke.includes(a.layer?.id));return n&&o?Vt(o.properties,S(),n.buckets,{pole:!1}):null}),...Ke.map(t=>({layer:t,html:n=>{let o=We();return o?Vt(n.properties,S(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=de();return n?pa(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:ee,html:t=>er(t.properties,F,S())}]),fl(),u.on("moveend",()=>{let t=u.getCenter();kr={lat:t.lat,lon:t.lng,zoom:u.getZoom()},v(),B()}),ge(E.radius,t=>{O=Number(t.dataset.radius),Kt(u,O,S()).then(v),Xe()&&Qt(u,O,S()).then(v),Ze()&&nn(O).then(v),de()&&bt(),b&&fe(b.lat,b.lon)}),ge(E.day,t=>{let n=t.dataset.day;ro(n),h!=="journey"&&N(),zt(u,n),en(u,n),h==="journey"&&b&&Dn(b.lat,b.lon),nt()&&ta(u,n).then(v),ve&&de()&&(bt(),b&&fe(b.lat,b.lon)),Ee()&&F==="service"&&mt(u,F,n),v()}),ge(E.oneSeatDay,t=>{ve=t.dataset.oneseatDay==="selected",En(),bt(),b&&fe(b.lat,b.lon)}),ge(E.view,t=>{let n=h;h=t.dataset.view,Lr(),$o(u,h==="dots"||h==="both"),il(h==="surface"||h==="both"),cl(h==="corridors"),ml(h==="oneseat"),pl(h==="journey",n==="journey"),ul(h==="places"),h!=="journey"&&n!=="journey"&&(h==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),dl(Ot(h)),Tr();let o=h==="oneseat"||h==="journey";l("dest-controls").classList.toggle("hidden",!o),l("oneseat-day-controls").classList.toggle("hidden",h!=="oneseat"),l("place-fill-controls").classList.toggle("hidden",h!=="places"),ae()||$r(!1),be(),En(),o||vt(!1),Or()}),ge(E.dest,t=>{let n=t.dataset.dest;if(n==="pin"){vt(!0);return}vt(!1),Te({key:n})}),ge(E.placeFill,t=>{F=t.dataset.placeFill,Ee()&&mt(u,F,S()),N(),v(),En()}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){St=n.dataset.weight,v(),B();return}let o=t.target.closest("[data-surface-unit]");if(o){we=o.dataset.surfaceUnit,ll(we),B();return}let a=t.target.closest("[data-bucket]");a&&(Bo(u,a.dataset.bucket,S()),v())}),l("legend-reset").addEventListener("click",()=>{Io(u,S()),v()}),l("legend-select").addEventListener("click",()=>$r(!H)),l("legend-clear").addEventListener("click",()=>{Gt(u),be(),v(),B()}),l("legend-collapse").addEventListener("click",()=>{Pn(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Te({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&wl(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&ft(a.dataset.selectPlace);let r=t.target.closest("[data-sort-places]");r&&(Rr=r.dataset.sortPlaces,N());let s=t.target.closest("[data-goto-place]");s&&(h!=="places"&&ne(E.view,"places"),ft(s.dataset.gotoPlace))}),l("side-toggle").addEventListener("click",rl),Me&&kn(Pn),Pr=Me?tl:gr({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Pn}),ol(),$t(),be(),Lt(),nl(De),Kt(u,O,S()).then(v),vl(),bl()});function ge(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),$t(),B()})})}function ne(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function nl(e){e.radius!==void 0&&ne(E.radius,String(e.radius)),e.day&&ne(E.day,e.day),e.oneSeatRestricted!==void 0&&ne(E.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(St=e.weight),e.surfaceUnit&&(we=e.surfaceUnit),e.placeFill&&ne(E.placeFill,e.placeFill),e.dest&&("key"in e.dest?ne(E.dest,e.dest.key):Te(e.dest)),e.selection&&Oo(u,e.selection),e.view&&ne(E.view,e.view),e.at&&Cn(e.at.lat,e.at.lon),e.place&&ft(e.place)}function B(){let e={view:h,day:S(),radius:O,oneSeatRestricted:ve,weight:St,surfaceUnit:we,dest:_,at:b,camera:kr,place:wt,placeFill:F,selection:Ro()},t=ir(e);history.replaceState(null,"",(Me?dr(t):t)+location.hash),Lt(t)}function Lt(e=pr(location.search)){if(!Me)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=b?ye?_e(ye):"this point":null;t.querySelector(".el-action").textContent=mr(n)}function $t(){l("statebar").innerHTML=or({view:h,day:S(),radius:O,oneSeatRestricted:ve,destination:Ce()}),al()}function Pn(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function ol(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function al(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(nr(h)))}function rl(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function v(){sl()}function sl(){if(l("legend-reset").classList.toggle("hidden",an()||cn()||gn()||Ee()||!ae()),gn()){l("legend").innerHTML=Fa(ct());return}if(Ee()){l("legend").innerHTML=Qa({selected:Ua(),fill:F,day:S(),boundaries:wn(),unchanged:Ja()});return}if(an()){let n=nt();n&&ya(l("legend"),n);return}if(cn()){let n=de();if(!n)return;let o=u.getBounds();fa(l("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=We();if(!e)return;let t=u.getBounds();va(l("legend"),{layer:e,day:S(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:St,dots:ae(),surface:Zt()?Xe():null,unit:we,population:Ze(),selection:xo()})}async function il(e){if(e&&!Xe()){l("legend").classList.add("loading");try{await Qt(u,O,S())}finally{l("legend").classList.remove("loading")}}Vo(u,e),e&&we==="people"&&await Er(),v()}async function Er(){if(!Ze()){l("legend").classList.add("loading");try{await nn(O)}finally{l("legend").classList.remove("loading")}}}async function ll(e){e==="people"&&Zt()&&await Er(),v()}async function cl(e){if(e&&!nt()){l("legend").classList.add("loading");try{await rn(u,S())}finally{l("legend").classList.remove("loading")}}na(u,e),v()}async function ul(e){if(e&&(!vn()||!wn())){l("legend").classList.add("loading");try{await Promise.all([za(),Wa(u)])}finally{l("legend").classList.remove("loading")}}qa(u,e),e&&mt(u,F,S()),e&&N(),v()}async function ft(e){wt=await Mn(()=>Va(u,e))?e:null,h==="places"&&(N(),wt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),B()}function dl(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),Lt(),h==="places"){l("panel").innerHTML=Xa(vn()??[],Rr,wt,F);return}if(!ye){h==="oneseat"?l("panel").innerHTML=vo(Ce()):so(l("panel"));return}if(h==="oneseat"){let t=bo(ye,_,S());if(t){l("panel").innerHTML=t;return}}fo(ye,{withKerb:ae()})}function pl(e,t=!1){if(Ta(u,e),v(),!e){t&&(b?fe(b.lat,b.lon):N());return}ct()&&b?l("panel").innerHTML=fn(ct(),Ce()):l("panel").innerHTML=Aa(Ce())}async function Dn(e,t){let n=++oe;b={lat:e,lon:t},B(),Mr(e,t);let o=Dr(),a=d(Ce());if(!o){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await x(Ma({lat:e,lon:t},o,S()));if(n!==oe)return;yn(u,r),l("panel").innerHTML=fn(r,a),v(),Lt()}catch(r){if(n!==oe)return;yn(u,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function En(){l("day-controls").classList.toggle("hidden",!ua(h,ve,F))}function Tn(){return ca(ve,S())}async function ml(e){e&&!de()&&await Mn(()=>un(u,O,_,Tn())),da(u,e),v()}async function bt(){await Mn(()=>un(u,O,_,Tn())),v()}async function Mn(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function Te(e){if(_=e,vt(!1),hl(),Or(),$t(),B(),h==="journey"){b&&Dn(b.lat,b.lon),v();return}b?fe(b.lat,b.lon):N({scrollToTop:!0}),bt()}function Or(){let e=Dr();if(!(e!==null&&(h==="journey"||h==="oneseat"&&"lat"in _))){te?.remove(),te=null;return}te?te.setLngLat([e.lon,e.lat]).addTo(u):(te=new maplibregl.Marker({color:ln,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),te.on("dragend",()=>{let n=te.getLngLat();Te({lat:n.lat,lon:n.lng})}))}function hl(){let e=la(_);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Dr(){if("lat"in _)return{lat:_.lat,lon:_.lon};let e=_.key,t=On.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Ce(){if("lat"in _)return`${_.lat.toFixed(4)}, ${_.lon.toFixed(4)}`;let e=_.key;return On.find(t=>t.key===e)?.name??e}function vt(e){xr=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function fe(e,t){let n=++oe;b={lat:e,lon:t},B(),l("panel").classList.add("loading"),Mr(e,t),Dt(u),l("pin-key").classList.add("hidden");try{let o="lat"in _?`&dest_lat=${_.lat.toFixed(6)}&dest_lon=${_.lon.toFixed(6)}`:"",a=await x(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${O}${o}&oneseat_day=${Tn()}`);if(n!==oe)return;q={lat:e,lon:t,radius:O,now:a.current.stops,proposed:a.proposed.stops},Tr(),ye=a,N({scrollToTop:!0})}catch(o){if(n!==oe)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===oe&&l("panel").classList.remove("loading")}}var q=null;function Tr(){if(!q||!Ot(h)){Dt(u),l("pin-key").classList.add("hidden");return}Un(u,q.lat,q.lon,q.radius,q.now,q.proposed),gl(q.radius)}function gl(e){l("pin-key").innerHTML=ba(e),l("pin-key").classList.remove("hidden")}function Mr(e,t){Oe?Oe.setLngLat([t,e]):(Oe=new maplibregl.Marker({color:el,draggable:!0}).setLngLat([t,e]).addTo(u),Oe.on("dragend",()=>{let n=Oe.getLngLat();Cn(n.lat,n.lng)}))}var yt=14;function ae(){return h==="dots"||h==="both"}function $r(e){H=e&&ae(),H?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=H?"none":"",H||Cr(),be()}function be(){let e=l("legend-select");e.classList.toggle("hidden",!ae()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",l("legend-clear").classList.toggle("hidden",!ae()||!Po())}function yl(e,t){let n=l("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function _r(e){l("brush").classList.toggle("painting",e)}function Cr(){l("brush").hidden=!0}function fl(){let e=l("brush");e.style.width=`${yt*2}px`,e.style.height=`${yt*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,be(),v()}))},r=()=>{H&&(t=!0,n=!1,_r(!0))},s=c=>{if(yl(c.point.x,c.point.y),!t)return;n=!0,Jt(u,Yt(u,c.point.x,c.point.y,yt))&&a()},i=c=>{if(_r(!1),!!t){if(t=!1,!n){let[p]=Yt(u,c.point.x,c.point.y,yt);p&&Eo(u,p)}be(),v(),B()}};u.on("mousedown",r),u.on("mousemove",s),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",Cr),u.on("touchstart",r),u.on("touchmove",s),u.on("touchend",i)}function Cn(e,t){if(Pr.atLeast("half"),h==="journey"){Dn(e,t);return}h!=="places"&&fe(e,t)}async function bl(){try{On=await x("/api/destinations"),$t()}catch{}}async function vl(){try{let e=await x("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function wl(e){l("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
