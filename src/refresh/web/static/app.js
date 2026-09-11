"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function k(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var jt=new Map;function ue(e){let t=jt.get(e);if(t)return t;let n=k(e).catch(o=>{throw jt.delete(e),o});return jt.set(e,n),n}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function de(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function Jt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Kt(e){return e>0?`+${e}`:String(e)}function no(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Rs="#15181e",oo="#ffa23a",Es="#ffffff";function Ps(e,t,n,o=96){let r=[],a=n/111320,s=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;r.push([t+s*Math.cos(l),e+a*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function K(e){return{type:"FeatureCollection",features:e}}function Os(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Ds(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function Gt(e){return e!=="corridors"&&e!=="journey"&&e!=="places"}function Wt(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(K([]))}function ro(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ao(e){e.addSource("walk",{type:"geojson",data:K([])}),e.addSource("stops-now",{type:"geojson",data:K([])}),e.addSource("stops-prop",{type:"geojson",data:K([])}),e.addSource("stop-moves",{type:"geojson",data:K([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":oo,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Es,"circle-stroke-width":3,"circle-stroke-color":oo}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Rs,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function so(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Ds(n.properties,e(o))}))}function io(e,t,n,o,r,a){e.getSource("walk").setData(K([Ps(t,n,o)])),e.getSource("stops-now").setData(K(ro(r,"current"))),e.getSource("stops-prop").setData(K(ro(a,"proposed"))),e.getSource("stop-moves").setData(K(Os(a)))}var P=["weekday","saturday","sunday"],Yt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],lo={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Je=4,Ke=6,co=e=>Ke+Je*e,uo=e=>Ke+1+Je*e,xe=e=>Ke+2+Je*e,Ts=e=>Ke+3+Je*e,Ge=2,Ms=3,ke=4,po=5,pe=e=>e[Ms],O=(e,t)=>e[t],mo=(e,t)=>e[Ts(t)],zt=e=>2+2*e,Vt=e=>3+2*e,We=4,go=e=>2+We*e,fo=e=>3+We*e,ho=e=>4+We*e,yo=e=>5+We*e;var Cs=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],As=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],bo=1e-6,Fs=32;function wo(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),a=t*Math.sin(o),s=Cs.map(([i,l])=>(e+i*r+l*a)**3);return As.map(i=>i[0]*s[0]+i[1]*s[1]+i[2]*s[2])}function So(e,t,n){return wo(e,t,n).every(o=>o>=-bo&&o<=1+bo)}function Ns(e,t,n){if(So(e,t,n))return t;let o=0,r=t;for(let a=0;a<Fs;a++){let s=(o+r)/2;So(e,s,n)?o=s:r=s}return o}function Hs(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function Bs(e,t,n){let[o,r,a]=wo(e,Ns(e,t,n),n);return`#${[o,r,a].map(s=>Hs(s).toString(16).padStart(2,"0")).join("")}`}var vo=/(\d+)/;function Is(e,t){let n=e.split(vo),o=t.split(vo);for(let r=0;r<Math.max(n.length,o.length);r++){let a=n[r]??"",s=o[r]??"";if(a!==s)return r%2?Number(a)-Number(s):a<s?-1:1}return 0}function Re(e){let t=[...new Set(e)].sort(Is);return new Map(t.map((n,o)=>[n,Bs(.55,.16,o*360/t.length)]))}var Lo="at this stop",$o=e=>`within ${e} m`,Us="both directions",js="one or both directions",Xt="weekday";function $(){return Xt}function Po(e){Xt=e}function Oo(e){e.innerHTML=`
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
    </div>`}function Do(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Js(e,t){let n=Math.max(1,...Yt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Yt.map(o=>{let r=e.periods[o]??0,a=t.periods[o]??0,s=a-r,i=s>0?"up":s<0?"down":"flat";return`
      <tr>
        <th>${lo[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${a/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${a}</td>
        <td class="n ${i}">${s===0?"\xB7":Kt(s)}</td>
      </tr>`}).join("")}function To(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function _o(e){return e.first==null?'<span class="muted">no service</span>':`${de(e.first)}\u2013${de(e.last)}`}function xo(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Ks={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Gs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ws(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Ye(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${Ks[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Gs[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${ne("one-seat")}</p>
    </div>`:""}function ne(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ee(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function ko(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Ro(e){return e.first==null||e.last==null?null:e.last-e.first}function Ye(e,t,n){let o=new Set(e.filter(a=>t.includes(a))),r=a=>n&&n.side===a?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Eo(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Eo(t,o,"prop",r("proposed"))}</div>
    </div>`}function Eo(e,t,n,o){return e.length?e.map(r=>{let a=t.has(r)?"both":`only-${n}`,s=o?.get(r),i=s?` style="--route-color:${s}"`:"";return`<span class="route ${a}"${i}>${d(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var qt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Ys="Allegheny";function Oe(e){let t=e.place?.muni?.trim()??"",n=qt.exec(t)?.[1],o=n===Ys?t.replace(qt,""):n?`${t.replace(qt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Pe(e){return e==="weekday"?"weekday":e}function Mo(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Pe(t)}`}function zs(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Vs(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",a=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",s=[r,a].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${s}</div></dd>`}function qs(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(a,s)=>`${a.length} of ${s.length}`;return`
      <dt>Routes in one direction only${ne("one-direction")}</dt>
      ${Ee(r(n,e.routes),r(o,t.routes))}`}function Co(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",a=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Pe(t)}, today only</span>`;return`<dt>Boardings ${d(n)}</dt><dd>${a}${r}</dd>`}function Ao(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${ne("boardings")}</p>`}function Xs(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${ne("place-population")}</p>
    </div>`}function Fo(e,t,n,o,{directions:r}={}){let a=t.trips-e.trips,s=a>0?"up":a<0?"down":"flat";return`
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
        ${a===0?"no change":`${Kt(a)} trips`}
        <div class="muted">${no(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Pe(n)} ${d(o)}${r?`, ${d(r)}`:""}</div>`}function No(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Js(e,t)}</tbody>
    </table>`}function Ho(e,t){let n=xo(e),o=xo(t),r=Ro(e),a=Ro(t);return`
      <dt>First and last</dt>
      ${Ee(_o(e),_o(t))}
      <dt>Hours between</dt>
      ${Ee(Jt(r),Jt(a),ko(r,a,"more"))}
      <dt>Typical wait</dt>
      ${Ee(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,ko(n,o,"less"))}`}function Bo(e,t,n,o){return`
    <div class="routes">
      <h3>${d(n)}</h3>
      ${Ye(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${ne("location-not-route")}</p>
    </div>`}function Qs(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${Pe(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${Pe(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${ne("stop-routes")}</p>`}function Zs(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],a=n.routes??"off",s=a==="off"?void 0:{side:a,colors:Re((a==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${d(i)}
        <span class="muted">\xB7 PRT stop ${d(e.stop_id)}</span></div>
      ${Fo(o,r,t,Lo)}
      <div class="tiers">${Do(o.hourly,r.hourly)}</div>
      ${No(o,r)}
      <dl class="facts">
        ${Ho(o,r)}
        ${Co(o.boardings,t,Lo)}
      </dl>
      ${Ao(o.boardings)}
      ${Bo(o,r,"Routes calling at this stop",s)}
      ${Qs(t,a,(a==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${ne("kerb")}</p>
    </section>`}function Qt(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],a=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Fo(o,r,t,$o(e.radius),{directions:a?js:Us})}

    <div class="tiers">${Do(o.hourly,r.hourly)}</div>

    ${No(o,r)}
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
      ${Ho(o,r)}
      ${qs(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Ee(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Vs(e.current.stops)}
      ${zs(e.proposed.stops)}
      ${Co(o.boardings,t,$o(e.radius))}
    </dl>
    ${Ao(o.boardings)}

    ${n}

    ${Xs(e.population)}

    ${Bo(o,r,"Routes serving this spot")}`}function ei(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,a=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${d(Oe(e))}</h2>
      <div class="muted">${a}</div>
    </div>
    ${r?Zs(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${Qt(e,t,Ws(e.oneseat??[],e.oneseat_day??"any"))}`}function Io(e,t={}){document.getElementById("panel").innerHTML=ei(e,Xt,t)}var ti={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},ni={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},oi={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ri(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Zt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${To(t)}</div>`:""}function ai(e){let t=Zt("kept",e.kept)+Zt("lost",e.lost)+Zt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function si(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Ye(e.current,e.proposed)}
    </div>`}function ii(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${d(r.key)}">
      <span class="os-name">${d(r.name)}</span>
      <span class="os-status ${d(r.status)}">${li[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var li={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function ci(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${oi[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Uo(e,t,n){let o=ri(e,t);if(!o)return"";let r=e.oneseat_day??"any",a=o.status==="here"?"":ai(o)+si(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(Oe(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${ti[o.status]}</div>
    <p class="note">${ni[o.status]} ${ci(r)}</p>

    ${a}

    ${ii(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Mo(e,n)}</summary>
      ${Qt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function jo(e){return`
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
    </div>`}var Ve={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},me="change",q="change-dots",oe=["boolean",["feature-state","selected"],!1],Jo="#15181e",re=["==",["get","published"],0],Xe="newplace",ui="#15181e",di=5,qe=["==",["get","removed"],1],Qe="removedstop",Te="change-removed",nn="change-removed-selected",en="removed-cross",Go="#e8232f";function pi(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[a,s]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,Go]])o.lineWidth=a,o.strokeStyle=s,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var ze=null,V=new Set,H=new Set,mi=[q,nn,Te],Ze=[q,Te],et=q;function Wo(e,t){for(let n of mi)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function tt(){return ze}function Me(e){return V.has(e)}function Yo(e,t,n,o){return r=>hi(r,e,t,n,o)}function zo(e){return t=>e.has(pe(t))}function Vo(){return H}function qo(){return[...H].sort()}function Xo(){return H.size}function on(e,t){let n=0;for(let o of t)H.has(o)||(H.add(o),De(e,o,!0),n++);return n}function Qo(e,t){H.delete(t)?De(e,t,!1):(H.add(t),De(e,t,!0))}function Zo(e,t){rn(e),on(e,t)}function rn(e){for(let t of H)De(e,t,!1);H.clear()}function De(e,t,n){try{e.setFeatureState({source:me,id:t},{selected:n})}catch{}}function gi(e){for(let t of H)De(e,t,!0)}function fi(e,t,n,o){let r=n*n;return o.filter(a=>(a.x-e)**2+(a.y-t)**2<=r).map(a=>a.id)}function an(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],a=[q,Te].filter(i=>e.getLayer(i)),s=e.queryRenderedFeatures(r,{layers:a}).filter(i=>i.id!==void 0).map(i=>{let[l,m]=i.geometry.coordinates,p=e.project([l,m]);return{id:i.id,x:p.x,y:p.y}});return fi(t,n,o,s)}function er(e,t,n,o){let r={};for(let a of n)r[a]=0;for(let a of e){if(!o(a)||O(a,Ge)===0||O(a,ke)===1)continue;let s=n[O(a,xe(t))];s!==void 0&&r[s]++}return r}function tr(e,t){let n=0;for(let o of e)t(o)&&O(o,Ge)===0&&n++;return n}function nr(e,t){let n=0;for(let o of e)t(o)&&O(o,ke)===1&&n++;return n}function hi(e,t,n,o,r){let a=O(e,0),s=O(e,1);return a>=n&&a<=r&&s>=t&&s<=o}function or(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let a of n)r.riders[a]=0,r.measured[a]=0;for(let a of e){if(!o(a)||O(a,Ge)===0)continue;let s=n[O(a,xe(t))];if(s===void 0)continue;let i=mo(a,t),l=O(a,ke)===1;if(i===null){s!=="none"&&r.unmeasured++;continue}if(l){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[s]+=i,r.measured[s]++}return r}function yi(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>P.some((o,r)=>t[O(n,xe(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:pe(n),published:n[2],removed:n[ke],name:n[po],moved:e.moved?.[pe(n)]??null,replacement:e.replacement?.[pe(n)]?.[0]??null,nearestStraight:e.replacement?.[pe(n)]?.[1]??null,...Object.fromEntries(P.flatMap((o,r)=>[[`b${r}`,t[O(n,xe(r))]],[`sc${r}`,n[co(r)]],[`sp${r}`,n[uo(r)]]]))}}))}}function rr(e,t){let n=Object.entries(Ve).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,Ve.none[t]]}function ar(e){return["case",re,"rgba(0,0,0,0)",rr(e,"color")]}function tn(e){return["case",re,di,rr(e,"size")]}function sr(e){return["interpolate",["linear"],["zoom"],9,["*",tn(e),.45],12,tn(e),16,["*",tn(e),1.9]]}function ir(e){e.addSource(me,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:q,type:"circle",source:me,paint:{"circle-color":ar(0),"circle-radius":sr(0),"circle-opacity":.85,"circle-stroke-color":["case",oe,Jo,re,ui,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",oe,1.6,re,.9,.5],12,["case",oe,2.4,re,1.5,1],16,["case",oe,3.2,re,2.2,1.6]]}},"walk-fill"),e.addLayer({id:nn,type:"circle",source:me,filter:qe,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":Jo,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",oe,1.6,0],12,["case",oe,2.4,0],16,["case",oe,3.2,0]]}},"walk-fill"),e.hasImage(en)||e.addImage(en,pi(),{pixelRatio:2}),e.addLayer({id:Te,type:"symbol",source:me,filter:qe,layout:{"icon-image":en,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function sn(e,t,n){return ze=await ue(`/api/change?radius=${t}`),e.getSource(me).setData(yi(ze)),gi(e),ln(e,n),ze}function ln(e,t){let n=P.indexOf(t);e.setPaintProperty(q,"circle-color",ar(n)),e.setPaintProperty(q,"circle-radius",sr(n)),cn(e,t)}function lr(e,t,n){V.has(t)?V.delete(t):V.add(t),cn(e,n)}function cr(e,t){V.clear(),cn(e,t)}function cn(e,t){let n=P.indexOf(t),o=["none",...V],r=["case",re,!V.has(Xe),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(q,["all",["!",qe],r]);let a=["all",qe,!V.has(Qe)];e.setFilter(Te,a),e.setFilter(nn,a)}function bi(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function un(e,t,n,{pole:o=!0}={}){let r=P.indexOf(t),a=e[`b${r}`],s=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(v=>v.key===a)?.label??a,l=e[`sc${r}`],m=e[`sp${r}`],p=t==="weekday"?"weekday":t,h=s?`Currently ${l}`:`${l} \u2192 ${m}`;return`${o?bi(e):""}${vi(e)}${h} buses per ${p} at this stop<br>${s?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var Si=1.5,Ko=800;function vi(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??Ko,r=n!=null&&o>n*Si?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",a=t==null?`no other stop within a ${Ko} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${Go}">Stop removed</b> \u2014 ${a}<br>`}var dn="surface",ot="surface-fill",ur="#6b7280",pn=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,ur],[.138,ur],[1,"#bd60e7"],[2,"#961bed"]],C="#e8232f",A="#0f79c9",dr=2,nt=null,pr=!1;function rt(){return nt}function mn(){return pr}function mr(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-dr,Math.min(dr,n))}function gr(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function fr(e,t,n,o,r,a,s,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let m of e){let p=s.lat0+(m[1]+.5)*s.dlat,h=s.lon0+(m[0]+.5)*s.dlon;if(p<o||p>a||h<n||h>r)continue;let v=m[zt(t)],S=m[Vt(t)],_=gr(v,S);if(_!=="none")if(_==="ramp"){let f=mr(v,S);l[f<-.138?"less":f>.138?"more":"same"]+=i}else l[_]+=i}return l}function wi(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(a=>{let s=t+a[1]*o,i=s+o,l=n+a[0]*r,m=l+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,s],[m,s],[m,i],[l,i],[l,s]]]},properties:Object.fromEntries(P.flatMap((p,h)=>{let v=a[zt(h)],S=a[Vt(h)];return[[`k${h}`,gr(v,S)],[`v${h}`,mr(v,S)??0]]}))}})}}function hr(e){return["case",["==",["get",`k${e}`],"gone"],C,["==",["get",`k${e}`],"new"],A,["interpolate",["linear"],["get",`v${e}`],...pn.flatMap(([t,n])=>[t,n])]]}function ge(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function yr(e,t){e.addSource(dn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ot,type:"fill",source:dn,layout:{visibility:"none"},paint:{"fill-color":hr(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,ge(0,.85),13,ge(0,.62),16,ge(0,.45)]}},t)}async function gn(e,t,n){return nt=await ue(`/api/surface?radius=${t}`),e.getSource(dn).setData(wi(nt)),fn(e,n),nt}function fn(e,t){let n=P.indexOf(t);e.setPaintProperty(ot,"fill-color",hr(n)),e.setPaintProperty(ot,"fill-opacity",["interpolate",["linear"],["zoom"],9,ge(n,.85),13,ge(n,.62),16,ge(n,.45)])}function br(e,t){pr=t,e.setLayoutProperty(ot,"visibility",t?"visible":"none")}var hn=null;function at(){return hn}async function yn(e){return hn=await ue(`/api/population?radius=${e}`),hn}function Sr(e,t,n,o,r,a,s){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let m=s.lat0+(l[1]+.5)*s.dlat,p=s.lon0+(l[0]+.5)*s.dlon;m<o||m>a||p<n||p>r||(i.lost+=l[go(t)],i.gained+=l[fo(t)],i.kept+=l[ho(t)],i.none+=l[yo(t)])}return i}var bn="corridor",vr="corridor-lines",lt="#8b929c",Li="#6f7783",it={lost:C,added:A,kept:lt};var st=null,wr=!1;function ct(){return st}function Sn(){return wr}function $i(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Lr(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function _i(){let e=t=>["match",["get","klass"],"lost",it.lost,"added",it.added,t];return["interpolate",["linear"],["zoom"],9,e(Li),14,e(lt)]}function xi(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function ki(){return["match",["get","klass"],"kept",.85,.9]}function $r(e,t){e.addSource(bn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vr,type:"line",source:bn,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":_i(),"line-width":xi(),"line-opacity":ki()}},t)}async function vn(e,t){return st=await k(`/api/corridors?day=${t}`),e.getSource(bn).setData($i(st)),st}async function _r(e,t){P.includes(t)&&await vn(e,t)}function xr(e,t){wr=t,e.setLayoutProperty(vr,"visibility",t?"visible":"none")}var Ln="#2b3038",kr="#b9bec6",Ce={loses:{color:C,size:6},gains:{color:A,size:6},keeps:{color:lt,size:3},here:{color:Ln,size:3.5},none:{color:kr,size:1.8}},dt=["loses","gains","keeps","none","here"],wn="oneseat",Rr="oneseat-dots",ut=null,Er=!1;function fe(){return ut}function $n(){return Er}function Pr(e,t,n,o,r,a){let s={};for(let i of t)s[i]=0;for(let i of e){let l=i[0],m=i[1];if(l<o||l>a||m<n||m>r)continue;let p=t[i[3]];p!==void 0&&s[p]++}return s}function Ri(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Ei(){return["match",["get","status"],...Object.entries(Ce).flatMap(([e,t])=>[e,t.color]),kr]}function Pi(){let e=["match",["get","status"],...Object.entries(Ce).flatMap(([t,n])=>[t,n.size]),Ce.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Or(e,t){e.addSource(wn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Rr,type:"circle",source:wn,layout:{visibility:"none"},paint:{"circle-color":Ei(),"circle-radius":Pi(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Oi(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Di="pin";function Dr(e){return"key"in e?e.key:Di}var pt="any";function Ti(e,t,n){return`radius=${e}&${Oi(t)}&day=${n}`}function Tr(e,t){return e?t:pt}function Mr(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function _n(e,t,n,o=pt){return ut=await k(`/api/oneseat?${Ti(t,n,o)}`),e.getSource(wn).setData(Ri(ut)),ut}function Cr(e,t){Er=t,e.setLayoutProperty(Rr,"visibility",t?"visible":"none")}function xn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Ar(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),r=(e.proposed||"").split(";").filter(Boolean),a=i=>i.length?i.join(", "):"none",s=xn(t);return e.status==="here"?`<b>at ${s}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${s}<br>today: ${a(o)}<br>proposed: ${a(r)}`}var mt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},kn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Mi=new Set(["gone","new"]);function Ci(e,t,n){return Mi.has(e)?`${t} (${kn[n]})`:t}function Ai(e){return e.buckets.filter(t=>t.key!=="none")}var Fr={area:"Ground",people:"People"};function Fi(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=fr(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),a=s=>s.toFixed(s<10?1:0);return`
      <div class="lg-area">
        <span><b>${a(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${a(r.less)}</b> km\xB2 less</span>
        <span><b>${a(r.more)}</b> km\xB2 more</span>
        <span><b>${a(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Ni(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=Sr(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),a=s=>Math.round(s).toLocaleString();return`
      <div class="lg-area">
        <span><b>${a(r.lost)}</b> people lose all service</span>
        <span><b>${a(r.gained)}</b> gain service</span>
        <span><b>${a(r.kept)}</b> keep a bus</span>
        <span><b>${a(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Hi=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function Nr(e){let{layer:t,day:n,bounds:o,unit:r,population:a,scoped:s=!1,named:i=!1}=e,l=pn.map(([m,p])=>`${p} ${((m+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${l})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${C}"></i>loses all service
          (${kn[n]})</span>
        <span><i style="background:${A}"></i>new service
          (${kn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Fr).map(m=>`
          <button data-surface-unit="${m}" aria-pressed="${r===m}"
                  class="${r===m?"active":""}">${Fr[m]}</button>`).join("")}
      </div>
      ${s?Hi:r==="people"?Ni(n,o,a):Fi(t,n,o)}
    </div>`}var Bi=["lost","added","kept"],Ii={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Ui={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Br(e,t){let{lostPct:n,addedPct:o}=Lr(t.km),r=i=>i.toFixed(1),s=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${s}</b> km of street, citywide \u2014 ${Ui[t.day]}
    </div>
    ${Bi.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${it[i]}"></i>
        <span class="lg-lab">${d(Ii[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function Ir(e,t,n){let o=t.statuses.map(p=>p.key),r=Pr(t.points,o,n.west,n.south,n.east,n.north),a=p=>t.statuses.find(h=>h.key===p)?.label??p,s=dt.reduce((p,h)=>p+(r[h]??0),0),i=xn(t),l=t.day&&t.day!==pt,m=l?`Restricted to routes running on ${mt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(i)}</b>
      <span class="muted">\xB7 ${s.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${l?` \xB7 ${mt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${dt.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${Ce[p].color}"></i>
        <span class="lg-lab">${d(a(p))}</span>
        <span class="lg-n">${(r[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${dt.map(p=>`${(t.counts[p]??0).toLocaleString()} ${d(a(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(i)} without transferring?
      ${m} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function Ur(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var Hr={locations:"Stops",riders:"Riders"};function ji(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,a=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",s=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${a}${s}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Ji(e){if(!e)return"";let t=Me(Xe);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Xe}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Ki(e,t){if(!e)return"";let n=Me(Qe);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Qe}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Gi(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Ji(e)}
      ${Ki(t,n)}
    </div>`}function jr(e,t){let{layer:n,day:o,bounds:r,weight:a,surface:s,unit:i="area",population:l,selection:m,dots:p=!0}=t,h=n.buckets.map(L=>L.key),v=n.days.indexOf(o),{west:S,south:_,east:f,north:J}=r,z=Ai(n),E=m&&m.size>0?m:null,je=E?zo(E):Yo(S,_,f,J),eo=er(n.points,v,h,je),Bt=tr(n.points,je),It=nr(n.points,je),M=a==="riders"?or(n.points,v,h,je):null,ws=L=>M?M.measured[L]?Math.round(M.riders[L]).toLocaleString():"\u2014":eo[L].toLocaleString(),Ls=M?M.removedMeasured?Math.round(M.removedRiders).toLocaleString():"\u2014":It.toLocaleString(),$s=E?`at ${E.size.toLocaleString()} selected stop${E.size===1?"":"s"}`:"in view",to=z.reduce((L,Ut)=>L+eo[Ut.key],0)+Bt+It,_s=M?`<b>${Math.round(z.reduce((L,Ut)=>L+M.riders[Ut.key],0)+M.removedRiders).toLocaleString()}</b> daily boardings ${$s}`:E?`<b>${to.toLocaleString()}</b>
         of ${E.size.toLocaleString()} selected stops`:`<b>${to.toLocaleString()}</b>
         stops in view`,xs=s?` \xB7 surface: ${n.radius} m walk`:"",ks=!p&&!!s;e.innerHTML=ks?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${mt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${Nr({layer:s,day:o,bounds:r,unit:i,population:l,scoped:!!E,named:!0})}`:`
    <div class="lg-head">
      ${_s}
      <span class="muted">\xB7 ${mt[o]}${xs}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Hr).map(L=>`
        <button data-weight="${L}" aria-pressed="${a===L}"
                class="${a===L?"active":""}">${Hr[L]}</button>`).join("")}
    </div>
    ${z.map(L=>`
      <button class="lg-row ${Me(L.key)?"off":""}" data-bucket="${d(L.key)}"
              aria-pressed="${!Me(L.key)}">
        <i style="background:${Ve[L.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(Ci(L.key,L.label,o))}</span>
        <span class="lg-n">${ws(L.key)}</span>
      </button>`).join("")}
    ${Gi(Bt,It,Ls)}
    ${s?Nr({layer:s,day:o,bounds:r,unit:i,population:l,scoped:!!E}):""}
    ${M?ji(M.unmeasured,Bt):""}
    ${E?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Rn="#4aa3ff",Vr="#ffa23a",En="headline",gt="journey",ht="journey-rides",qr="journey-walks",Wi=[ht,qr],Xr=null,Qr=!1;function yt(){return Xr}function Pn(){return Qr}function Yi(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let a=n[r].itinerary;if(a)for(let s of a.legs){let i=s.from??e.origin,l=s.to??e.destination,m=[[i.lon,i.lat],[l.lon,l.lat]],p=s.path?.length?s.path:m;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:r,kind:s.kind,route:s.route}})}}return{type:"FeatureCollection",features:o}}function Jr(){return["match",["get","side"],"current",Rn,"proposed",Vr,Rn]}function Kr(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Zr(e,t){e.addSource(gt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ht,type:"line",source:gt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Jr(),"line-width":Kr(1),"line-opacity":.85}},t),e.addLayer({id:qr,type:"line",source:gt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Jr(),"line-width":Kr(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ea(e,t){Qr=t;for(let n of Wi)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function On(e,t){Xr=t;let n=t?Yi(t,En):{type:"FeatureCollection",features:[]};e.getSource(gt).setData(n)}function ta(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Gr=e=>`${e.toFixed(1)} min`;function na(e){return e==null?"\u2014":e===0?"no change":e>0?`${Gr(e)} slower`:`${Gr(-e)} faster`}function Wr(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function zi(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Wr(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Wr(e.to,"the destination")}</span></div>`}function Yr(e,t){let n=[],o=null;for(let r of e.legs){let a=o?Math.round(r.depart-o.arrive):0;a>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${a} min</span></div>`),n.push(zi(r,t)),o=r}return n.join("")}var Vi={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function ft(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function qi(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Xi(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${ft(t.current)} \u2192
        ${ft(t.proposed)} min</span>
        <span class="muted">${na(t.change_min)}</span></div>
      ${o}
    </div>`}function zr(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Dn(e,t){let n=e.radii[En],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${de(e.window.start_min)}
        and ${de(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Vi[n.classification]??""}</p>
      </div>
      ${zr(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${ft(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${ft(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${na(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${qi(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Yr(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Yr(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Xi(e)}
    ${zr(e)}`}function oa(e){return`
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
    </div>`}function ra(e){let t=e?e.radii[En].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Rn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Vr}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var vt="off",Ae="stoproutes",ia="stoproutes-lines",Mn="stoproutes-flow",la="stoproutes-arrows",Qi=[ia,Mn,la],Tn="stoproutes-arrow",aa=3.5,ca=null,ua=!1;function wt(){return ca}function da(){return ua}function pa(e,t){return e!==null&&e[t].length>0}function Zi(e,t){let n=t==="current"?e.current:e.proposed,o=Re(n.map(a=>a.route));return{type:"FeatureCollection",features:n.map(a=>({type:"Feature",geometry:{type:"LineString",coordinates:a.points},properties:{side:t,route:a.route,name:a.name,pattern_id:a.pattern_id,color:o.get(a.route)}}))}}function el(){return["interpolate",["linear"],["zoom"],9,aa*.6,14,aa]}function tl(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function ma(e,t){e.addSource(Ae,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ia,type:"line",source:Ae,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":el(),"line-opacity":.85}},t),e.addLayer({id:Mn,type:"line",source:Ae,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},t),e.hasImage(Tn)||e.addImage(Tn,tl(),{pixelRatio:2,sdf:!0}),e.addLayer({id:la,type:"symbol",source:Ae,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":Tn,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},t)}function Lt(e,t){ua=t;for(let n of Qi)e.setLayoutProperty(n,"visibility",t?"visible":"none");t||ba()}function ye(e,t,n){ca=t;let o=t?Zi(t,n):{type:"FeatureCollection",features:[]};e.getSource(Ae).setData(o),t||ba()}function ga(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var nl={current:"today",proposed:"proposed"};function fa(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${d(e.color)}"></i> <b>${d(e.route)}</b>${e.name?` \u2014 ${d(e.name)}`:""}<br><span style="opacity:.75">${nl[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var ol=20;function rl(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),a=[];for(let s=0;s<o;s++){let i=s/o*e;a.push([i,t,e-i])}for(let s=0;s<r;s++){let i=s/r*e;a.push([0,i,t,e-i])}return a}var sa=rl(3,4,24),B=null,bt=0,St=0,he=null;function al(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function Cn(e){he&&(B=requestAnimationFrame(Cn),!(e-St<1e3/ol)&&(St=e,bt=(bt+1)%sa.length,he.setPaintProperty(Mn,"line-dasharray",sa[bt])))}function ha(){he&&(document.hidden?B!==null&&(cancelAnimationFrame(B),B=null):B===null&&(St=0,B=requestAnimationFrame(Cn)))}function ya(e){al()||he||(he=e,bt=0,St=0,document.addEventListener("visibilitychange",ha),B=requestAnimationFrame(Cn))}function ba(){B!==null&&(cancelAnimationFrame(B),B=null),document.removeEventListener("visibilitychange",ha),he=null}var xt="places",wa="places-points",An="places-boundaries",se="places-fill",Se="lost",sl=100,il={lost:"share_lost",gained:"share_gained"};function Q(e,t){return`service_${e}_${t}`}var La={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ll="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",ae={lost:C,gained:A},$t=null,X=null,be=null,$a=!1,_t=null;function Fn(){return $t}function _a(){return X}function xa(){return _t}function Nn(){return be}function Fe(){return $a}function cl(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function ul(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function dl(e){return Math.max(e.residents_lost,e.residents_gained)}var Sa=4,pl=16,ml=1e3;function gl(e){let t=Math.min(1,Math.sqrt(e/ml));return Sa+t*(pl-Sa)}function fl(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:ul(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:gl(dl(t))}}))}}function hl(){return["match",["get","klass"],"lost",ae.lost,"gained",ae.gained,ae.lost]}function yl(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var G=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var W=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function ka(e,t){return e==="service"?["step",["abs",["coalesce",["get",Q(t,"pct")],0]],W[0].opacity,W[0].max,W[1].opacity,W[1].max,W[2].opacity,W[2].max,W[3].opacity]:["step",["coalesce",["get",il[e]],0],G[0].opacity,Number.EPSILON,G[1].opacity,G[1].max,G[2].opacity,G[2].max,G[3].opacity,G[3].max,G[4].opacity]}function Ra(e,t){return e==="service"?["case",[">=",["coalesce",["get",Q(t,"pct")],0],0],A,C]:ae[e]}function bl(e,t){let n=Q(t,"now"),o=Q(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var Sl=3;function vl(e){if(e.length===0)return"";let t=e.slice(0,Sl),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function Ea(e,t){e.addSource(An,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:se,type:"fill",source:An,layout:{visibility:"none"},paint:{"fill-color":Ra(Se),"fill-opacity":ka(Se),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:wa,type:"circle",source:xt,layout:{visibility:"none"},paint:{"circle-color":hl(),"circle-radius":yl(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function kt(e,t,n){e.setPaintProperty(se,"fill-color",Ra(t,n)),e.setPaintProperty(se,"fill-opacity",ka(t,n))}async function Pa(){return $t||($t=await k("/api/places")),$t}async function Oa(e){return be||(be=await k("/api/boundaries"),e.getSource(An).setData(be)),be}function wl(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Da(e,t){let n=wl(be,t);if(n)return X=null,_t=n,e.getSource(xt)?.setData({type:"FeatureCollection",features:[]}),null;try{X=await k(`/api/places/${encodeURIComponent(t)}`)}catch{return X=null,_t=null,null}return _t=null,e.getSource(xt).setData(fl(X)),e.flyTo({center:[X.lon,X.lat],zoom:13}),X}function Ta(e,t){$a=t,e.setLayoutProperty(wa,"visibility",t?"visible":"none"),e.setLayoutProperty(se,"visibility",t?"visible":"none")}function Ll(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var $l="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ma(e,t,n,o){let r=cl(e,t).map(a=>Ll(a,a.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${ll}</p>
    ${o==="service"?`<p class="note">${$l}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function Ca(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function _l(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function xl(e,t,n,o){let r=W.map((l,m)=>({band:l,prevMax:m===0?0:W[m-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:m})=>{let p=_l(l,m);return[`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(p)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${A};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(p)} more trips</span></div>`]}).join(""),a=o?bl(o,n):[],s=vl(a),i=s?`<div class="lg-foot">${d(s)}</div>`:"";return`
    ${Ca(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(La[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Aa({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return xl(e,r??null,n,o??null);let a=t==="lost"?"lose all buses":"gain a bus",s=G.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${ae[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(i.label)} of the place's own residents ${d(a)}</span>
    </div>`).join("");return`
    ${Ca(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(a)}</div>
    ${s}
    <div class="lg-row lg-static"><i style="background:${ae.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${ae.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function kl(e,t){let n=e[Q(t,"now")],o=e[Q(t,"proposed")],r=e[Q(t,"pct")],a=e[Q(t,"rail_proposed")],s=La[t];if(o===0&&n>0)return`Loses all buses on ${s} (${n} \u2192 0 trips)${a?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${s} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${s} (${i}).`}function Fa(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${kl(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=va("lose all buses",e.residents_lost,e.share_lost),a=e.residents_gained>0?va("gain a bus",e.residents_gained,e.share_gained):null,s=(t==="lost"?[r,a]:[a,r]).filter(i=>i!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${s.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function va(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${sl} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Hn=" \xB7 ",Bn={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Na=Object.keys(Bn);function Ha(e){return Bn[e]??e}var Rl={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},El=["oneseat","journey"],Pl=["dots","both"],Ol={current:"routes today",proposed:"routes proposed"};function Dl(e){return e!=="journey"}function Tl(e){let t=[Bn[e.view]??e.view];return e.view==="places"?t[0]:(El.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Rl[e.day]),Dl(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&Pl.includes(e.view)&&t.push(Ol[e.stopRoutes]),t.join(Hn))}function Ba(e){let[t,...n]=Tl(e).split(Hn);return`<b>${d(t)}</b>${n.map(o=>Hn+d(o)).join("")}`}var y={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes"},Ml=/^[cp]:[\w.:-]{1,32}$/,Rt={any:"any",selected:"selected"},Cl="pin",Ia=5;function ja(e){try{return e.self!==e.top}catch{return!0}}function Ja(e){let t=new URLSearchParams;return t.set(y.view,e.view),t.set(y.day,e.day),t.set(y.radius,String(e.radius)),t.set(y.oneSeatDay,e.oneSeatRestricted?Rt.selected:Rt.any),t.set(y.dest,"key"in e.dest?e.dest.key:In(e.dest)),e.weight==="riders"&&t.set(y.weight,e.weight),e.surfaceUnit==="people"&&t.set(y.surfaceUnit,e.surfaceUnit),e.at&&t.set(y.at,In(e.at)),e.camera&&t.set(y.camera,`${In(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(y.place,e.place),e.placeFill!==Se&&t.set(y.placeFill,e.placeFill),e.selection.length&&t.set(y.selection,e.selection.join(",")),t.set(y.stopRoutes,e.stopRoutes??vt),`?${t}`}function Ka(e){let t=new URLSearchParams(e),n={},o=t.get(y.view);o&&Na.includes(o)&&(n.view=o);let r=t.get(y.day);r&&P.includes(r)&&(n.day=r);let a=Number(t.get(y.radius));t.has(y.radius)&&Number.isFinite(a)&&a>0&&(n.radius=a),t.get(y.weight)==="riders"?n.weight="riders":t.get(y.weight)==="locations"&&(n.weight="locations"),t.get(y.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(y.surfaceUnit)==="area"&&(n.surfaceUnit="area");let s=t.get(y.oneSeatDay);s===Rt.selected?n.oneSeatRestricted=!0:s===Rt.any&&(n.oneSeatRestricted=!1);let i=t.get(y.dest);if(i&&i!==Cl){let _=Ua(i);_?n.dest=_:i.includes(",")||(n.dest={key:i})}let l=Ua(t.get(y.at));l&&(n.at=l);let m=Al(t.get(y.camera));m&&(n.camera=m);let p=t.get(y.place);p&&(n.place=p);let h=t.get(y.selection);h!==null&&(n.selection=h.split(",").filter(_=>Ml.test(_)));let v=t.get(y.placeFill);(v==="lost"||v==="gained"||v==="service")&&(n.placeFill=v);let S=t.get(y.stopRoutes);return(S==="off"||S==="current"||S==="proposed")&&(n.stopRoutes=S),n}function In(e){return`${e.lat.toFixed(Ia)},${e.lon.toFixed(Ia)}`}function Ua(e){let t=Ga(e,2);return t?{lat:t[0],lon:t[1]}:null}function Al(e){let t=Ga(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ga(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Un="embed";var Fl=["1","true","yes"];function Wa(e){let t=new URLSearchParams(e).get(Un);return t!==null&&Fl.includes(t.toLowerCase())}function Ya(e){let t=new URLSearchParams(e);return t.set(Un,"1"),`?${t}`}function za(e){let t=new URLSearchParams(e);t.delete(Un);let n=String(t);return n?`?${n}`:""}function Va(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var Z=["peek","half","full"],Nl=192,Hl=.3,Bl=.55,Il=.9,Ul=.6,jl=.45;function Et(e,t){return e==="peek"?Math.min(Nl,t*Hl):e==="half"?t*Bl:t*Il}function Jl(e,t,n=0){let o=Z.map(a=>Math.abs(Et(a,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>Ul&&(r=Math.max(0,Math.min(Z.length-1,r+(n>0?1:-1)))),Z[r]}function qa(e){return Z[(Z.indexOf(e)+1)%Z.length]}function Kl(e,t){return Math.min(e,t*jl)}function ve(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function jn(e){let t=null,n=()=>{let o=ve();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Gl=8,Wl=400;function Xa(e){let t=c("side"),n=c("sheet-handle"),o="peek",r=!1,a=0,s=0,i=0,l={y:0,t:0};function m(){return window.innerHeight}function p(f){t.style.height=`${f}px`,e.onMove(f,Kl(f,m()))}function h(f){o=f,t.dataset.snap=f,p(Et(f,m()))}n.addEventListener("pointerdown",f=>{ve()&&(r=!0,a=f.clientY,s=t.getBoundingClientRect().height,i=f.timeStamp,l={y:f.clientY,t:f.timeStamp},t.classList.add("dragging"),n.setPointerCapture(f.pointerId))}),n.addEventListener("pointermove",f=>{if(!r)return;let J=s+(a-f.clientY),z=Et("peek",m()),E=Et("full",m());p(Math.max(z,Math.min(E,J))),l={y:f.clientY,t:f.timeStamp}});function v(f){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(f.clientY-a)>Gl)&&f.timeStamp-i<Wl){h(qa(o));return}let z=f.timeStamp-l.t,E=z>0?(l.y-f.clientY)/z:0;h(Jl(t.getBoundingClientRect().height,m(),E))}n.addEventListener("pointerup",v),n.addEventListener("pointercancel",v),n.addEventListener("keydown",f=>{f.key!=="Enter"&&f.key!==" "||(f.preventDefault(),ve()&&h(qa(o)))});let S=jn(e.onLayoutChange);function _(){if(S(),!ve()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}h(o)}return window.addEventListener("resize",_),_(),{at:()=>ve()?o:"full",atLeast(f){ve()&&Z.indexOf(f)>Z.indexOf(o)&&h(f)}}}var Yl=["llvmpipe","swiftshader","softpipe","basic render","software"];function Jn(e){if(!e)return!1;let t=e.toLowerCase();return Yl.some(n=>t.includes(n))}function Za(e){let t=Jn(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function es(e){return Jn(e.renderer)?0:zl}var zl=300,Vl="https://tiles.openfreemap.org/styles/positron",ql=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],Qa=[],Xl=19,Ql='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Zl=!1;function ts(e){return!Zl||!Jn(e.renderer)?Vl:ec()}function ec(){let e=o=>({type:"raster",tileSize:256,attribution:Ql,tiles:o,maxzoom:Xl}),t={basemap:e(ql)},n=[{id:"basemap",type:"raster",source:"basemap"}];return Qa.length&&(t["basemap-labels"]=e(Qa),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function ns(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function tc(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function os(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),r=null,a="",s=l=>{a!==l&&(a=l,e.getCanvas().style.cursor=l)},i=()=>{r=null,s(""),t.remove()};return e.on("mousemove",l=>{let m=n.map(J=>J.layer).filter(J=>e.getLayer(J)&&e.getLayoutProperty(J,"visibility")!=="none");if(!m.length){i();return}let[p,...h]=e.queryRenderedFeatures(l.point,{layers:m});if(!p){i();return}s("pointer");let v=tc(p);if(v===r)return;let S=o.get(p.layer?.id),_=S?S.html(p,h):null;if(_==null){r=null,t.remove();return}r=v;let f=S.anchor?S.anchor(p,l):l.lngLat;t.setLngLat(f).setHTML(_).addTo(e)}),e.on("mouseout",i),i}function nc(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function oc(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var rc="seg-current",rs="dd",ac="open",as="armed";function sc(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(as)}));return nc(t)}function ss(e=document){let t=new Map,n=null,o=a=>{n=a;for(let[s,i]of t){let l=s===n;i.group.classList.toggle(ac,l),i.trigger.setAttribute("aria-expanded",String(l))}},r=a=>o(oc(n,a));e.querySelectorAll(".controls").forEach((a,s)=>{let i=a.querySelector(".seg");if(!i)return;let l=a.id||`controls-${s}`,m=a.querySelector(".lbl")?.textContent??"",p=document.createElement("button");p.type="button",p.className=rc,p.setAttribute("aria-haspopup","true"),p.setAttribute("aria-expanded","false");let h=document.createElement("div");h.className=rs,i.replaceWith(h),h.append(p,i);let v=()=>{let S=sc(i);p.textContent=S.label,p.disabled=S.disabled,p.classList.toggle(as,S.armed),p.setAttribute("aria-label",m?`${m}: ${S.label}`:S.label)};v(),new MutationObserver(v).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),p.addEventListener("click",()=>{r({kind:"trigger",group:l}),n===l&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",S=>{if(!S.target.closest("button"))return;let _=n===l;r({kind:"pick"}),_&&p.focus()}),t.set(l,{group:a,trigger:p,seg:i})}),document.addEventListener("click",a=>{if(n===null)return;a.target.closest(`.${rs}`)||r({kind:"outside"})}),document.addEventListener("keydown",a=>{if(a.key!=="Escape"||n===null)return;let s=t.get(n);r({kind:"escape"}),s&&s.seg.contains(document.activeElement)&&s.trigger.focus()})}var ic=[-79.9959,40.4406],lc=12,cc="#e2574c",R={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},He=Ka(location.search),Ie=Wa(location.search);Ie&&c("app").classList.add("embed");var uc={at:()=>"full",atLeast(){}},us=null,D=400,Ne=null,b=null,te=null,ce=0,x={key:"downtown"},ie=null,ds=!1,$e=!1,Ft="locations",_e="area",N=vt,Kn=0;function Ot(){return N==="off"?"current":N}var ps="count",Ct=null,I=Se,U=!1,g="dots",ms,zn=[],is=()=>{},Gn=ns(),u=new maplibregl.Map({container:"map",style:ts(Gn),pixelRatio:Za(Gn),fadeDuration:es(Gn),renderWorldCopies:!1,center:He.camera?[He.camera.lon,He.camera.lat]:ic,zoom:He.camera?.zoom??lc,cooperativeGestures:ja(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{ao(u),ir(u),yr(u,et),$r(u,et),Or(u,"walk-fill"),Zr(u),ma(u,ht),Ea(u,et),F(),u.on("click",t=>{if(U)return;if(ds){Be({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let a=u.queryRenderedFeatures(t.point,{layers:[se]})[0];a&&Dt(a.properties.key);return}let n=[...Ze,"oneseat-dots"].filter(a=>u.getLayoutProperty(a,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Zn(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});is=os(u,e,[...so(t=>{let n=tt(),o=t.find(r=>Ze.includes(r.layer?.id));return n&&o?un(o.properties,$(),n.buckets,{pole:!1}):null}),...Ze.map(t=>({layer:t,html:n=>{let o=tt();return o?un(n.properties,$(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=fe();return n?Ar(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:"stoproutes-lines",html:t=>fa(t.properties)},{layer:se,html:t=>Fa(t.properties,I,$())}]),xc(),u.on("moveend",()=>{let t=u.getCenter();us={lat:t.lat,lon:t.lng,zoom:u.getZoom()},w(),j()}),le(R.radius,t=>{D=Number(t.dataset.radius),sn(u,D,$()).then(w),rt()&&gn(u,D,$()).then(w),at()&&yn(D).then(w),fe()&&Tt(),b&&we(b.lat,b.lon)}),le(R.day,t=>{let n=t.dataset.day;Po(n),g!=="journey"&&F(),ln(u,n),At(),fn(u,n),g==="journey"&&b&&Vn(b.lat,b.lon),ct()&&_r(u,n).then(w),$e&&fe()&&(Tt(),b&&we(b.lat,b.lon)),Fe()&&I==="service"&&kt(u,I,n),w()}),le(R.oneSeatDay,t=>{$e=t.dataset.oneseatDay==="selected",Yn(),Tt(),b&&we(b.lat,b.lon)}),le(R.view,t=>{let n=g;g=t.dataset.view,is(),Wo(u,g==="dots"||g==="both"),hc(g==="surface"||g==="both"),bc(g==="corridors"),Lc(g==="oneseat"),wc(g==="journey",n==="journey"),Sc(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),vc(Gt(g)),ys();let o=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),Ss(),Y()||ls(!1),Le(),Yn(),o||Mt(!1),fs()}),le(R.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Mt(!0);return}Mt(!1),Be({key:n})}),le(R.placeFill,t=>{I=t.dataset.placeFill,Fe()&&kt(u,I,$()),F(),w(),Yn()}),le(R.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=N!=="off"&&wt()!==null;N=n,F(),o&&n!=="off"?(ye(u,wt(),n),T&&Qn(T.radius)):At()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Ft=n.dataset.weight,w(),j();return}let o=t.target.closest("[data-surface-unit]");if(o){_e=o.dataset.surfaceUnit,yc(_e),j();return}let r=t.target.closest("[data-bucket]");r&&(lr(u,r.dataset.bucket,$()),w())}),c("legend-reset").addEventListener("click",()=>{cr(u,$()),w()}),c("legend-select").addEventListener("click",()=>ls(!U)),c("legend-clear").addEventListener("click",()=>{rn(u),Le(),w(),j()}),c("legend-collapse").addEventListener("click",()=>{Wn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Be({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Ec(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&Dt(r.dataset.selectPlace);let a=t.target.closest("[data-sort-places]");a&&(ps=a.dataset.sortPlaces,F());let s=t.target.closest("[data-goto-place]");s&&(g!=="places"&&ee(R.view,"places"),Dt(s.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",gc),Ie&&jn(Wn),ms=Ie?uc:Xa({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Wn}),pc(),ss(),Ht(),Le(),Nt(),dc(He),sn(u,D,$()).then(w),Rc(),kc()});function le(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),Ht(),j()})})}function ee(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function dc(e){e.radius!==void 0&&ee(R.radius,String(e.radius)),e.day&&ee(R.day,e.day),e.oneSeatRestricted!==void 0&&ee(R.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Ft=e.weight),e.surfaceUnit&&(_e=e.surfaceUnit),e.placeFill&&ee(R.placeFill,e.placeFill),e.dest&&("key"in e.dest?ee(R.dest,e.dest.key):Be(e.dest)),e.selection&&Zo(u,e.selection),e.stopRoutes&&ee(R.stopRoutes,e.stopRoutes),e.view&&ee(R.view,e.view),e.at&&Zn(e.at.lat,e.at.lon),e.place&&Dt(e.place)}function j(){let e={view:g,day:$(),radius:D,oneSeatRestricted:$e,weight:Ft,surfaceUnit:_e,dest:x,at:b,camera:us,place:Ct,placeFill:I,selection:qo(),stopRoutes:N},t=Ja(e);history.replaceState(null,"",(Ie?Ya(t):t)+location.hash),Nt(t)}function Nt(e=za(location.search)){if(!Ie)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=b?te?Oe(te):"this point":null;t.querySelector(".el-action").textContent=Va(n)}function Ht(){c("statebar").innerHTML=Ba({view:g,day:$(),radius:D,oneSeatRestricted:$e,destination:Ue(),stopRoutes:N}),mc()}function Wn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function pc(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function mc(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Ha(g)))}function gc(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function w(){fc()}function fc(){if(c("legend-reset").classList.toggle("hidden",Sn()||$n()||Pn()||Fe()||!Y()),Pn()){c("legend").innerHTML=ra(yt());return}if(Fe()){c("legend").innerHTML=Aa({selected:_a(),fill:I,day:$(),boundaries:Nn(),unchanged:xa()});return}if(Sn()){let n=ct();n&&Br(c("legend"),n);return}if($n()){let n=fe();if(!n)return;let o=u.getBounds();Ir(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=tt();if(!e)return;let t=u.getBounds();jr(c("legend"),{layer:e,day:$(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Ft,dots:Y(),surface:mn()?rt():null,unit:_e,population:at(),selection:Vo()})}async function hc(e){if(e&&!rt()){c("legend").classList.add("loading");try{await gn(u,D,$())}finally{c("legend").classList.remove("loading")}}br(u,e),e&&_e==="people"&&await gs(),w()}async function gs(){if(!at()){c("legend").classList.add("loading");try{await yn(D)}finally{c("legend").classList.remove("loading")}}}async function yc(e){e==="people"&&mn()&&await gs(),w()}async function bc(e){if(e&&!ct()){c("legend").classList.add("loading");try{await vn(u,$())}finally{c("legend").classList.remove("loading")}}xr(u,e),w()}async function Sc(e){if(e&&(!Fn()||!Nn())){c("legend").classList.add("loading");try{await Promise.all([Pa(),Oa(u)])}finally{c("legend").classList.remove("loading")}}Ta(u,e),e&&kt(u,I,$()),e&&F(),w()}async function Dt(e){Ct=await Xn(()=>Da(u,e))?e:null,g==="places"&&(F(),Ct&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),w(),j()}function vc(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),Nt(),g==="places"){c("panel").innerHTML=Ma(Fn()??[],ps,Ct,I);return}if(!te){g==="oneseat"?c("panel").innerHTML=jo(Ue()):Oo(c("panel"));return}if(g==="oneseat"){let t=Uo(te,x,$());if(t){c("panel").innerHTML=t;return}}Io(te,{withKerb:Y(),routes:N})}function wc(e,t=!1){if(ea(u,e),w(),!e){t&&(b?we(b.lat,b.lon):F());return}yt()&&b?c("panel").innerHTML=Dn(yt(),Ue()):c("panel").innerHTML=oa(Ue())}async function Vn(e,t){let n=++ce;b={lat:e,lon:t},j(),bs(e,t);let o=hs(),r=d(Ue());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let a=await k(ta({lat:e,lon:t},o,$()));if(n!==ce)return;On(u,a),c("panel").innerHTML=Dn(a,r),w(),Nt()}catch(a){if(n!==ce)return;On(u,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}}function Yn(){c("day-controls").classList.toggle("hidden",!Mr(g,$e,I))}function qn(){return Tr($e,$())}async function Lc(e){e&&!fe()&&await Xn(()=>_n(u,D,x,qn())),Cr(u,e),w()}async function Tt(){await Xn(()=>_n(u,D,x,qn())),w()}async function Xn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Be(e){if(x=e,Mt(!1),$c(),fs(),Ht(),j(),g==="journey"){b&&Vn(b.lat,b.lon),w();return}b?we(b.lat,b.lon):F({scrollToTop:!0}),Tt()}function fs(){let e=hs();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in x))){ie?.remove(),ie=null;return}ie?ie.setLngLat([e.lon,e.lat]).addTo(u):(ie=new maplibregl.Marker({color:Ln,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),ie.on("dragend",()=>{let n=ie.getLngLat();Be({lat:n.lat,lon:n.lng})}))}function $c(){let e=Dr(x);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function hs(){if("lat"in x)return{lat:x.lat,lon:x.lon};let e=x.key,t=zn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Ue(){if("lat"in x)return`${x.lat.toFixed(4)}, ${x.lon.toFixed(4)}`;let e=x.key;return zn.find(t=>t.key===e)?.name??e}function Mt(e){ds=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function we(e,t){let n=++ce;b={lat:e,lon:t},j(),c("panel").classList.add("loading"),bs(e,t),Wt(u),ye(u,null,Ot()),c("pin-key").classList.add("hidden");try{let o="lat"in x?`&dest_lat=${x.lat.toFixed(6)}&dest_lon=${x.lon.toFixed(6)}`:"",r=await k(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${D}${o}&oneseat_day=${qn()}`);if(n!==ce)return;T={lat:e,lon:t,radius:D,now:r.current.stops,proposed:r.proposed.stops},te=r,Ss(),ys(),F({scrollToTop:!0})}catch(o){if(n!==ce)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ce&&c("panel").classList.remove("loading")}}var T=null;function ys(){if(!T||!Gt(g)){Wt(u),c("pin-key").classList.add("hidden"),At();return}io(u,T.lat,T.lon,T.radius,T.now,T.proposed),Qn(T.radius),At()}function At(){let e=++Kn,t=()=>{T&&Qn(T.radius)};N!=="off"&&Y()&&b&&te?.kerb?k(ga(b,$())).then(n=>{e===Kn&&(ye(u,n,Ot()),Lt(u,!0),ya(u),t())}).catch(()=>{e===Kn&&(ye(u,null,Ot()),Lt(u,!1),t())}):(ye(u,null,Ot()),Lt(u,!1),t())}function Qn(e){let t=N!=="off"&&da()&&pa(wt(),N)?N:!1;c("pin-key").innerHTML=Ur(e,{routes:t}),c("pin-key").classList.remove("hidden")}function bs(e,t){Ne?Ne.setLngLat([t,e]):(Ne=new maplibregl.Marker({color:cc,draggable:!0}).setLngLat([t,e]).addTo(u),Ne.on("dragend",()=>{let n=Ne.getLngLat();Zn(n.lat,n.lng)}))}var Pt=14;function Y(){return g==="dots"||g==="both"}function ls(e){U=e&&Y(),U?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=U?"none":"",U||vs(),Le()}function Ss(){let e=Y()&&!!te?.kerb;c("stop-routes-controls").classList.toggle("hidden",!e)}function Le(){let e=c("legend-select");e.classList.toggle("hidden",!Y()),e.setAttribute("aria-pressed",String(U)),e.textContent=U?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!Y()||!Xo())}function _c(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!U}function cs(e){c("brush").classList.toggle("painting",e)}function vs(){c("brush").hidden=!0}function xc(){let e=c("brush");e.style.width=`${Pt*2}px`,e.style.height=`${Pt*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Le(),w()}))},a=()=>{U&&(t=!0,n=!1,cs(!0))},s=l=>{if(_c(l.point.x,l.point.y),!t)return;n=!0,on(u,an(u,l.point.x,l.point.y,Pt))&&r()},i=l=>{if(cs(!1),!!t){if(t=!1,!n){let[m]=an(u,l.point.x,l.point.y,Pt);m&&Qo(u,m)}Le(),w(),j()}};u.on("mousedown",a),u.on("mousemove",s),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",vs),u.on("touchstart",a),u.on("touchmove",s),u.on("touchend",i)}function Zn(e,t){if(ms.atLeast("half"),g==="journey"){Vn(e,t);return}g!=="places"&&we(e,t)}async function kc(){try{zn=await k("/api/destinations"),Ht()}catch{}}async function Rc(){try{let e=await k("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Ec(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
