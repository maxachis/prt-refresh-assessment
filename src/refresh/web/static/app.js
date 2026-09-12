"use strict";(()=>{function d(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function P(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var vn=new Map;function J(e){let t=vn.get(e);if(t)return t;let n=P(e).catch(o=>{throw vn.delete(e),o});return vn.set(e,n),n}function u(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function fe(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function wn(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Rn(e){return e>0?`+${e}`:String(e)}function or(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var el="#15181e",rr="#ffa23a",tl="#ffffff";function nl(e,t,n,o=96){let r=[],s=n/111320,a=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let c=i/o*2*Math.PI;r.push([t+a*Math.cos(c),e+s*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function W(e){return{type:"FeatureCollection",features:e}}function ol(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function rl(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function Ln(e){return e!=="corridors"&&e!=="journey"&&e!=="places"&&e!=="routes"}function $n(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(W([]))}function sr(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ar(e){e.addSource("walk",{type:"geojson",data:W([])}),e.addSource("stops-now",{type:"geojson",data:W([])}),e.addSource("stops-prop",{type:"geojson",data:W([])}),e.addSource("stop-moves",{type:"geojson",data:W([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":rr,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":tl,"circle-stroke-width":3,"circle-stroke-color":rr}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":el,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function ir(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>rl(n.properties,e(o))}))}function lr(e,t,n,o,r,s){e.getSource("walk").setData(W([nl(t,n,o)])),e.getSource("stops-now").setData(W(sr(r,"current"))),e.getSource("stops-prop").setData(W(sr(s,"proposed"))),e.getSource("stop-moves").setData(W(ol(s)))}var x=["weekday","saturday","sunday"],kn=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],cr={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},lt=4,ct=6,ur=e=>ct+lt*e,dr=e=>ct+1+lt*e,Be=e=>ct+2+lt*e,sl=e=>ct+3+lt*e,ut=2,al=3,Ie=4,pr=5,he=e=>e[al],M=(e,t)=>e[t],mr=(e,t)=>e[sl(t)],_n=e=>2+2*e,xn=e=>3+2*e,dt=4,gr=e=>2+dt*e,fr=e=>3+dt*e,hr=e=>4+dt*e,yr=e=>5+dt*e;var il=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],ll=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],br=1e-6,cl=32;function wr(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),s=t*Math.sin(o),a=il.map(([i,c])=>(e+i*r+c*s)**3);return ll.map(i=>i[0]*a[0]+i[1]*a[1]+i[2]*a[2])}function Sr(e,t,n){return wr(e,t,n).every(o=>o>=-br&&o<=1+br)}function ul(e,t,n){if(Sr(e,t,n))return t;let o=0,r=t;for(let s=0;s<cl;s++){let a=(o+r)/2;Sr(e,a,n)?o=a:r=a}return o}function dl(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function pl(e,t,n){let[o,r,s]=wr(e,ul(e,t,n),n);return`#${[o,r,s].map(a=>dl(a).toString(16).padStart(2,"0")).join("")}`}var vr=/(\d+)/;function ml(e,t){let n=e.split(vr),o=t.split(vr);for(let r=0;r<Math.max(n.length,o.length);r++){let s=n[r]??"",a=o[r]??"";if(s!==a)return r%2?Number(s)-Number(a):s<a?-1:1}return 0}function Ue(e){let t=[...new Set(e)].sort(ml);return new Map(t.map((n,o)=>[n,pl(.55,.16,o*360/t.length)]))}var Rr="at this stop",Lr=e=>`within ${e} m`,gl="both directions",fl="one or both directions",Dn="weekday";function w(){return Dn}function Dr(e){Dn=e}function Pr(e){e.innerHTML=`
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
    </div>`}function Or(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function hl(e,t){let n=Math.max(1,...kn.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return kn.map(o=>{let r=e.periods[o]??0,s=t.periods[o]??0,a=s-r,i=a>0?"up":a<0?"down":"flat";return`
      <tr>
        <th>${cr[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${a===0?"\xB7":Rn(a)}</td>
      </tr>`}).join("")}function Tr(e){return e.length?e.map(t=>`<span class="route">${u(t)}</span>`).join(" "):'<span class="muted">none</span>'}function $r(e){return e.first==null?'<span class="muted">no service</span>':`${fe(e.first)}\u2013${fe(e.last)}`}function kr(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var yl={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},bl={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Sl(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':pt(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${u(o.name)}</span>
          <span class="os-status ${u(o.status)}">${yl[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${bl[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${se("one-seat")}</p>
    </div>`:""}function se(e){return` <button class="howto" data-caveat="${e}">method</button>`}function je(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function _r(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function xr(e){return e.first==null||e.last==null?null:e.last-e.first}function pt(e,t,n){let o=new Set(e.filter(s=>t.includes(s))),r=s=>n&&n.side===s?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Er(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Er(t,o,"prop",r("proposed"))}</div>
    </div>`}function Er(e,t,n,o){return e.length?e.map(r=>{let s=t.has(r)?"both":`only-${n}`,a=o?.get(r),i=a?` style="--route-color:${a}"`:"";return`<span class="route ${s}"${i}>${u(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var En=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,vl="Allegheny";function Ke(e){let t=e.place?.muni?.trim()??"",n=En.exec(t)?.[1],o=n===vl?t.replace(En,""):n?`${t.replace(En,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Ge(e){return e==="weekday"?"weekday":e}function Mr(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ge(t)}`}function wl(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Rl(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",a=[r,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${a}</div></dd>`}function Ll(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(s,a)=>`${s.length} of ${a.length}`;return`
      <dt>Routes in one direction only${se("one-direction")}</dt>
      ${je(r(n,e.routes),r(o,t.routes))}`}function Cr(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",s=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Ge(t)}, today only</span>`;return`<dt>Boardings ${u(n)}</dt><dd>${s}${r}</dd>`}function Ar(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${se("boardings")}</p>`}function $l(e){if(!e)return"";let t=u(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${se("place-population")}</p>
    </div>`}function Fr(e,t,n,o,{directions:r}={}){let s=t.trips-e.trips,a=s>0?"up":s<0?"down":"flat";return`
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
        ${s===0?"no change":`${Rn(s)} trips`}
        <div class="muted">${or(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ge(n)} ${u(o)}${r?`, ${u(r)}`:""}</div>`}function Nr(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${hl(e,t)}</tbody>
    </table>`}function Hr(e,t){let n=kr(e),o=kr(t),r=xr(e),s=xr(t);return`
      <dt>First and last</dt>
      ${je($r(e),$r(t))}
      <dt>Hours between</dt>
      ${je(wn(r),wn(s),_r(r,s,"more"))}
      <dt>Typical wait</dt>
      ${je(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,_r(n,o,"less"))}`}function Br(e,t,n,o){return`
    <div class="routes">
      <h3>${u(n)}</h3>
      ${pt(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${se("location-not-route")}</p>
    </div>`}function kl(e,t,n){if(t==="off")return"";let o=t==="current"?"on today's network":"under the plan";if(n.length===0){let r=t==="current"?"Proposed":"Today";return`
    <p class="note">No bus calls at this stop ${o} on a ${Ge(e)},
      so there is nothing to draw; the other network's routes are under
      <b>${r}</b>.</p>`}return`
    <p class="note">Every route calling here on a ${Ge(e)}, ${o},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${se("stop-routes")}</p>`}function _l(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],s=n.routes??"off",a=s==="off"?void 0:{side:s,colors:Ue((s==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
    <section class="scope kerb-scope">
      <h3 class="scope-head">At this stop</h3>
      <div class="scope-sub">${u(i)}
        <span class="muted">\xB7 PRT stop ${u(e.stop_id)}</span></div>
      ${Fr(o,r,t,Rr)}
      <div class="tiers">${Or(o.hourly,r.hourly)}</div>
      ${Nr(o,r)}
      <dl class="facts">
        ${Hr(o,r)}
        ${Cr(o.boardings,t,Rr)}
      </dl>
      ${Ar(o.boardings)}
      ${Br(o,r,"Routes calling at this stop",a)}
      ${kl(t,s,(s==="current"?o:r).routes)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${se("kerb")}</p>
    </section>`}function Pn(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],s=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Fr(o,r,t,Lr(e.radius),{directions:s?fl:gl})}

    <div class="tiers">${Or(o.hourly,r.hourly)}</div>

    ${Nr(o,r)}
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
      ${Hr(o,r)}
      ${Ll(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${je(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Rl(e.current.stops)}
      ${wl(e.proposed.stops)}
      ${Cr(o.boardings,t,Lr(e.radius))}
    </dl>
    ${Ar(o.boardings)}

    ${n}

    ${$l(e.population)}

    ${Br(o,r,"Routes serving this spot")}`}function xl(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,s=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${u(Ke(e))}</h2>
      <div class="muted">${s}</div>
    </div>
    ${r?_l(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${Pn(e,t,Sl(e.oneseat??[],e.oneseat_day??"any"))}`}function Ir(e,t={}){document.getElementById("panel").innerHTML=xl(e,Dn,t)}var El={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Dl={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Pl={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ol(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function On(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Tr(t)}</div>`:""}function Tl(e){let t=On("kept",e.kept)+On("lost",e.lost)+On("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Ml(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${pt(e.current,e.proposed)}
    </div>`}function Cl(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${u(r.key)}">
      <span class="os-name">${u(r.name)}</span>
      <span class="os-status ${u(r.status)}">${Al[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Al={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Fl(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Pl[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Ur(e,t,n){let o=Ol(e,t);if(!o)return"";let r=e.oneseat_day??"any",s=o.status==="here"?"":Tl(o)+Ml(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${u(o.name)}</h2>
      <div class="muted">
        from ${u(Ke(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${u(o.status)}">${El[o.status]}</div>
    <p class="note">${Dl[o.status]} ${Fl(r)}</p>

    ${s}

    ${Cl(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Mr(e,n)}</summary>
      ${Pn(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function jr(e){return`
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
    </div>`}var X={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ye="change",Q="change-dots",ae=["boolean",["feature-state","selected"],!1],Gr="#15181e",ie=["==",["get","published"],0],ft="newplace",Nl="#15181e",Hl=5,gt=["==",["get","removed"],1],ht="removedstop",We="change-removed",Cn="change-removed-selected",Tn="removed-cross",Jr="#e8232f";function Bl(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[s,a]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,Jr]])o.lineWidth=s,o.strokeStyle=a,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var mt=null,q=new Set,U=new Set,Il=[Q,Cn,We],yt=[Q,We],Ye=Q;function Wr(e,t){for(let n of Il)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function bt(){return mt}function Ve(e){return q.has(e)}function Yr(e,t,n,o){return r=>Gl(r,e,t,n,o)}function Vr(e){return t=>e.has(he(t))}function zr(){return U}function qr(){return[...U].sort()}function Xr(){return U.size}function An(e,t){let n=0;for(let o of t)U.has(o)||(U.add(o),Je(e,o,!0),n++);return n}function Qr(e,t){U.delete(t)?Je(e,t,!1):(U.add(t),Je(e,t,!0))}function Zr(e,t){Fn(e),An(e,t)}function Fn(e){for(let t of U)Je(e,t,!1);U.clear()}function Je(e,t,n){try{e.setFeatureState({source:ye,id:t},{selected:n})}catch{}}function Ul(e){for(let t of U)Je(e,t,!0)}function jl(e,t,n,o){let r=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=r).map(s=>s.id)}function Nn(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],s=[Q,We].filter(i=>e.getLayer(i)),a=e.queryRenderedFeatures(r,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[c,m]=i.geometry.coordinates,p=e.project([c,m]);return{id:i.id,x:p.x,y:p.y}});return jl(t,n,o,a)}function es(e,t,n,o){let r={};for(let s of n)r[s]=0;for(let s of e){if(!o(s)||M(s,ut)===0||M(s,Ie)===1)continue;let a=n[M(s,Be(t))];a!==void 0&&r[a]++}return r}function ts(e,t){let n=0;for(let o of e)t(o)&&M(o,ut)===0&&n++;return n}function ns(e,t){let n=0;for(let o of e)t(o)&&M(o,Ie)===1&&n++;return n}function Gl(e,t,n,o,r){let s=M(e,0),a=M(e,1);return s>=n&&s<=r&&a>=t&&a<=o}function os(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)r.riders[s]=0,r.measured[s]=0;for(let s of e){if(!o(s)||M(s,ut)===0)continue;let a=n[M(s,Be(t))];if(a===void 0)continue;let i=mr(s,t),c=M(s,Ie)===1;if(i===null){a!=="none"&&r.unmeasured++;continue}if(c){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[a]+=i,r.measured[a]++}return r}function Kl(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((o,r)=>t[M(n,Be(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:he(n),published:n[2],removed:n[Ie],name:n[pr],moved:e.moved?.[he(n)]??null,replacement:e.replacement?.[he(n)]?.[0]??null,nearestStraight:e.replacement?.[he(n)]?.[1]??null,...Object.fromEntries(x.flatMap((o,r)=>[[`b${r}`,t[M(n,Be(r))]],[`sc${r}`,n[ur(r)]],[`sp${r}`,n[dr(r)]]]))}}))}}function rs(e,t){let n=Object.entries(X).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,X.none[t]]}function ss(e){return["case",ie,"rgba(0,0,0,0)",rs(e,"color")]}function Mn(e){return["case",ie,Hl,rs(e,"size")]}function as(e){return["interpolate",["linear"],["zoom"],9,["*",Mn(e),.45],12,Mn(e),16,["*",Mn(e),1.9]]}function is(e){e.addSource(ye,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Q,type:"circle",source:ye,paint:{"circle-color":ss(0),"circle-radius":as(0),"circle-opacity":.85,"circle-stroke-color":["case",ae,Gr,ie,Nl,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ae,1.6,ie,.9,.5],12,["case",ae,2.4,ie,1.5,1],16,["case",ae,3.2,ie,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Cn,type:"circle",source:ye,filter:gt,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":Gr,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",ae,1.6,0],12,["case",ae,2.4,0],16,["case",ae,3.2,0]]}},"walk-fill"),e.hasImage(Tn)||e.addImage(Tn,Bl(),{pixelRatio:2}),e.addLayer({id:We,type:"symbol",source:ye,filter:gt,layout:{"icon-image":Tn,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Hn(e,t,n){return mt=await J(`/api/change?radius=${t}`),e.getSource(ye).setData(Kl(mt)),Ul(e),Bn(e,n),mt}function Bn(e,t){let n=x.indexOf(t);e.setPaintProperty(Q,"circle-color",ss(n)),e.setPaintProperty(Q,"circle-radius",as(n)),In(e,t)}function ls(e,t,n){q.has(t)?q.delete(t):q.add(t),In(e,n)}function cs(e,t){q.clear(),In(e,t)}function In(e,t){let n=x.indexOf(t),o=["none",...q],r=["case",ie,!q.has(ft),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(Q,["all",["!",gt],r]);let s=["all",gt,!q.has(ht)];e.setFilter(We,s),e.setFilter(Cn,s)}function Jl(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function Un(e,t,n,{pole:o=!0}={}){let r=x.indexOf(t),s=e[`b${r}`],a=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(L=>L.key===s)?.label??s,c=e[`sc${r}`],m=e[`sp${r}`],p=t==="weekday"?"weekday":t,b=a?`Currently ${c}`:`${c} \u2192 ${m}`;return`${o?Jl(e):""}${Yl(e)}${b} buses per ${p} at this stop<br>${a?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var Wl=1.5,Kr=800;function Yl(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??Kr,r=n!=null&&o>n*Wl?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${Kr} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${Jr}">Stop removed</b> \u2014 ${s}<br>`}var jn="surface",vt="surface-fill",us="#6b7280",Gn=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,us],[.138,us],[1,"#bd60e7"],[2,"#961bed"]],C="#e8232f",A="#0f79c9",ds=2,St=null,ps=!1;function wt(){return St}function Kn(){return ps}function ms(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-ds,Math.min(ds,n))}function gs(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function fs(e,t,n,o,r,s,a,i){let c={gone:0,less:0,same:0,more:0,new:0};for(let m of e){let p=a.lat0+(m[1]+.5)*a.dlat,b=a.lon0+(m[0]+.5)*a.dlon;if(p<o||p>s||b<n||b>r)continue;let L=m[_n(t)],v=m[xn(t)],k=gs(L,v);if(k!=="none")if(k==="ramp"){let f=ms(L,v);c[f<-.138?"less":f>.138?"more":"same"]+=i}else c[k]+=i}return c}function Vl(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let a=t+s[1]*o,i=a+o,c=n+s[0]*r,m=c+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,a],[m,a],[m,i],[c,i],[c,a]]]},properties:Object.fromEntries(x.flatMap((p,b)=>{let L=s[_n(b)],v=s[xn(b)];return[[`k${b}`,gs(L,v)],[`v${b}`,ms(L,v)??0]]}))}})}}function hs(e){return["case",["==",["get",`k${e}`],"gone"],C,["==",["get",`k${e}`],"new"],A,["interpolate",["linear"],["get",`v${e}`],...Gn.flatMap(([t,n])=>[t,n])]]}function be(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function ys(e,t){e.addSource(jn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vt,type:"fill",source:jn,layout:{visibility:"none"},paint:{"fill-color":hs(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,be(0,.85),13,be(0,.62),16,be(0,.45)]}},t)}async function Jn(e,t,n){return St=await J(`/api/surface?radius=${t}`),e.getSource(jn).setData(Vl(St)),Wn(e,n),St}function Wn(e,t){let n=x.indexOf(t);e.setPaintProperty(vt,"fill-color",hs(n)),e.setPaintProperty(vt,"fill-opacity",["interpolate",["linear"],["zoom"],9,be(n,.85),13,be(n,.62),16,be(n,.45)])}function bs(e,t){ps=t,e.setLayoutProperty(vt,"visibility",t?"visible":"none")}var Yn=null;function Rt(){return Yn}async function Vn(e){return Yn=await J(`/api/population?radius=${e}`),Yn}function Ss(e,t,n,o,r,s,a){let i={lost:0,gained:0,kept:0,none:0};for(let c of e){let m=a.lat0+(c[1]+.5)*a.dlat,p=a.lon0+(c[0]+.5)*a.dlon;m<o||m>s||p<n||p>r||(i.lost+=c[gr(t)],i.gained+=c[fr(t)],i.kept+=c[hr(t)],i.none+=c[yr(t)])}return i}var zn="corridor",vs="corridor-lines",Se="#8b929c",zl="#6f7783",$t={lost:C,added:A,kept:Se};var Lt=null,ws=!1;function kt(){return Lt}function qn(){return ws}function ql(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Rs(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Xl(){let e=t=>["match",["get","klass"],"lost",$t.lost,"added",$t.added,t];return["interpolate",["linear"],["zoom"],9,e(zl),14,e(Se)]}function Ql(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Zl(){return["match",["get","klass"],"kept",.85,.9]}function Ls(e,t){e.addSource(zn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vs,type:"line",source:zn,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Xl(),"line-width":Ql(),"line-opacity":Zl()}},t)}async function Xn(e,t){return Lt=await P(`/api/corridors?day=${t}`),e.getSource(zn).setData(ql(Lt)),Lt}async function $s(e,t){x.includes(t)&&await Xn(e,t)}function ks(e,t){ws=t,e.setLayoutProperty(vs,"visibility",t?"visible":"none")}var Zn="#2b3038",_s="#b9bec6",ze={loses:{color:C,size:6},gains:{color:A,size:6},keeps:{color:Se,size:3},here:{color:Zn,size:3.5},none:{color:_s,size:1.8}},xt=["loses","gains","keeps","none","here"],Qn="oneseat",xs="oneseat-dots",_t=null,Es=!1;function ve(){return _t}function eo(){return Es}function Ds(e,t,n,o,r,s){let a={};for(let i of t)a[i]=0;for(let i of e){let c=i[0],m=i[1];if(c<o||c>s||m<n||m>r)continue;let p=t[i[3]];p!==void 0&&a[p]++}return a}function ec(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function tc(){return["match",["get","status"],...Object.entries(ze).flatMap(([e,t])=>[e,t.color]),_s]}function nc(){let e=["match",["get","status"],...Object.entries(ze).flatMap(([t,n])=>[t,n.size]),ze.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Ps(e,t){e.addSource(Qn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:xs,type:"circle",source:Qn,layout:{visibility:"none"},paint:{"circle-color":tc(),"circle-radius":nc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function oc(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var rc="pin";function Os(e){return"key"in e?e.key:rc}var Et="any";function sc(e,t,n){return`radius=${e}&${oc(t)}&day=${n}`}function Ts(e,t){return e?t:Et}function Ms(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function to(e,t,n,o=Et){return _t=await P(`/api/oneseat?${sc(t,n,o)}`),e.getSource(Qn).setData(ec(_t)),_t}function Cs(e,t){Es=t,e.setLayoutProperty(xs,"visibility",t?"visible":"none")}function no(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function As(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),r=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",a=no(t);return e.status==="here"?`<b>at ${a}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${a}<br>today: ${s(o)}<br>proposed: ${s(r)}`}var Dt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},oo={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},ac=new Set(["gone","new"]),ic="stop kept";function lc(e,t,n){return ac.has(e)?`${t}, ${ic} (${oo[n]})`:t}function cc(e){return e.buckets.filter(t=>t.key!=="none")}var Fs={area:"Ground",people:"People"};function uc(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=fs(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=a=>a.toFixed(a<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(r.less)}</b> km\xB2 less</span>
        <span><b>${s(r.more)}</b> km\xB2 more</span>
        <span><b>${s(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function dc(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=Ss(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=a=>Math.round(a).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(r.lost)}</b> people lose all service</span>
        <span><b>${s(r.gained)}</b> gain service</span>
        <span><b>${s(r.kept)}</b> keep a bus</span>
        <span><b>${s(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var pc=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function Ns(e){let{layer:t,day:n,bounds:o,unit:r,population:s,scoped:a=!1,named:i=!1}=e,c=Gn.map(([m,p])=>`${p} ${((m+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${c})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${C}"></i>loses all service
          (${oo[n]})</span>
        <span><i style="background:${A}"></i>new service
          (${oo[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Fs).map(m=>`
          <button data-surface-unit="${m}" aria-pressed="${r===m}"
                  class="${r===m?"active":""}">${Fs[m]}</button>`).join("")}
      </div>
      ${a?pc:r==="people"?dc(n,o,s):uc(t,n,o)}
    </div>`}var mc=["lost","added","kept"],gc={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},fc={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Bs(e,t){let{lostPct:n,addedPct:o}=Rs(t.km),r=i=>i.toFixed(1),a=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${a}</b> km of street, citywide \u2014 ${fc[t.day]}
    </div>
    ${mc.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${$t[i]}"></i>
        <span class="lg-lab">${u(gc[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function Is(e,t,n){let o=t.statuses.map(p=>p.key),r=Ds(t.points,o,n.west,n.south,n.east,n.north),s=p=>t.statuses.find(b=>b.key===p)?.label??p,a=xt.reduce((p,b)=>p+(r[b]??0),0),i=no(t),c=t.day&&t.day!==Et,m=c?`Restricted to routes running on ${Dt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${u(i)}</b>
      <span class="muted">\xB7 ${a.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${c?` \xB7 ${Dt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${xt.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${ze[p].color}"></i>
        <span class="lg-lab">${u(s(p))}</span>
        <span class="lg-n">${(r[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${xt.map(p=>`${(t.counts[p]??0).toLocaleString()} ${u(s(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${u(i)} without transferring?
      ${m} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function Us(e,{routes:t=!1}={}){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>${t?`
    <span class="pk-note">routes, ${t==="current"?"today's network":"under the plan"} \u2014 one colour each, keyed in the panel</span>
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var Hs={locations:"Stops",riders:"Riders"};function hc(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",a=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${a}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function yc(e){if(!e)return"";let t=Ve(ft);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${ft}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function bc(e,t){if(!e)return"";let n=Ve(ht);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${ht}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop \u2014 no bus here on any day</span>
      <span class="lg-n">${t}</span>
    </button>`}function Sc(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${yc(e)}
      ${bc(t,n)}
    </div>`}function js(e,t){let{layer:n,day:o,bounds:r,weight:s,surface:a,unit:i="area",population:c,selection:m,dots:p=!0}=t,b=n.buckets.map($=>$.key),L=n.days.indexOf(o),{west:v,south:k,east:f,north:T}=r,H=cc(n),R=m&&m.size>0?m:null,it=R?Vr(R):Yr(v,k,f,T),tr=es(n.points,L,b,it),yn=ts(n.points,it),bn=ns(n.points,it),B=s==="riders"?os(n.points,L,b,it):null,Vi=$=>B?B.measured[$]?Math.round(B.riders[$]).toLocaleString():"\u2014":tr[$].toLocaleString(),zi=B?B.removedMeasured?Math.round(B.removedRiders).toLocaleString():"\u2014":bn.toLocaleString(),qi=R?`at ${R.size.toLocaleString()} selected stop${R.size===1?"":"s"}`:"in view",nr=H.reduce(($,Sn)=>$+tr[Sn.key],0)+yn+bn,Xi=B?`<b>${Math.round(H.reduce(($,Sn)=>$+B.riders[Sn.key],0)+B.removedRiders).toLocaleString()}</b> daily boardings ${qi}`:R?`<b>${nr.toLocaleString()}</b>
         of ${R.size.toLocaleString()} selected stops`:`<b>${nr.toLocaleString()}</b>
         stops in view`,Qi=a?` \xB7 surface: ${n.radius} m walk`:"",Zi=!p&&!!a;e.innerHTML=Zi?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${Dt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${Ns({layer:a,day:o,bounds:r,unit:i,population:c,scoped:!!R,named:!0})}`:`
    <div class="lg-head">
      ${Xi}
      <span class="muted">\xB7 ${Dt[o]}${Qi}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Hs).map($=>`
        <button data-weight="${$}" aria-pressed="${s===$}"
                class="${s===$?"active":""}">${Hs[$]}</button>`).join("")}
    </div>
    ${H.map($=>`
      <button class="lg-row ${Ve($.key)?"off":""}" data-bucket="${u($.key)}"
              aria-pressed="${!Ve($.key)}">
        <i style="background:${X[$.key]?.color??"#666"}"></i>
        <span class="lg-lab">${u(lc($.key,$.label,o))}</span>
        <span class="lg-n">${Vi($.key)}</span>
      </button>`).join("")}
    ${Sc(yn,bn,zi)}
    ${a?Ns({layer:a,day:o,bounds:r,unit:i,population:c,scoped:!!R}):""}
    ${B?hc(B.unmeasured,yn):""}
    ${R?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var we="#4aa3ff",qe="#ffa23a",ro="headline",Pt="journey",Tt="journey-rides",zs="journey-walks",vc=[Tt,zs],qs=null,Xs=!1;function Mt(){return qs}function so(){return Xs}function wc(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let s=n[r].itinerary;if(s)for(let a of s.legs){let i=a.from??e.origin,c=a.to??e.destination,m=[[i.lon,i.lat],[c.lon,c.lat]],p=a.path?.length?a.path:m;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:r,kind:a.kind,route:a.route}})}}return{type:"FeatureCollection",features:o}}function Gs(){return["match",["get","side"],"current",we,"proposed",qe,we]}function Ks(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Qs(e,t){e.addSource(Pt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Tt,type:"line",source:Pt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Gs(),"line-width":Ks(1),"line-opacity":.85}},t),e.addLayer({id:zs,type:"line",source:Pt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Gs(),"line-width":Ks(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Zs(e,t){Xs=t;for(let n of vc)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function ao(e,t){qs=t;let n=t?wc(t,ro):{type:"FeatureCollection",features:[]};e.getSource(Pt).setData(n)}function ea(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Js=e=>`${e.toFixed(1)} min`;function ta(e){return e==null?"\u2014":e===0?"no change":e>0?`${Js(e)} slower`:`${Js(-e)} faster`}function Ws(e,t){return e?e.name?u(e.name):`stop ${u(e.stop_id)}`:t}function Rc(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Ws(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${u(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Ws(e.to,"the destination")}</span></div>`}function Ys(e,t){let n=[],o=null;for(let r of e.legs){let s=o?Math.round(r.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Rc(r,t)),o=r}return n.join("")}var Lc={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Ot(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function $c(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function kc(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Ot(t.current)} \u2192
        ${Ot(t.proposed)} min</span>
        <span class="muted">${ta(t.change_min)}</span></div>
      ${o}
    </div>`}function Vs(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function io(e,t){let n=e.radii[ro],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
    <div class="place-head">
      <h2>Travel time to ${u(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${fe(e.window.start_min)}
        and ${fe(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${r}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Lc[n.classification]??""}</p>
      </div>
      ${Vs(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Ot(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Ot(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${ta(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${$c(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Ys(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Ys(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${kc(e)}
    ${Vs(e)}`}function na(e){return`
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
    </div>`}function oa(e){let t=e?e.radii[ro].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${we}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${qe}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Ft="off",Xe="stoproutes",aa="stoproutes-lines",co="stoproutes-flow",ia="stoproutes-arrows",_c=[aa,co,ia],lo="stoproutes-arrow",ra=3.5,la=null,ca=!1;function Nt(){return la}function ua(){return ca}function da(e,t){return e!==null&&e[t].length>0}function xc(e,t){let n=t==="current"?e.current:e.proposed,o=Ue(n.map(s=>s.route));return{type:"FeatureCollection",features:n.map(s=>({type:"Feature",geometry:{type:"LineString",coordinates:s.points},properties:{side:t,route:s.route,name:s.name,pattern_id:s.pattern_id,color:o.get(s.route)}}))}}function Ec(){return["interpolate",["linear"],["zoom"],9,ra*.6,14,ra]}function Dc(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function pa(e,t){e.addSource(Xe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:aa,type:"line",source:Xe,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Ec(),"line-opacity":.85}},t),e.addLayer({id:co,type:"line",source:Xe,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},t),e.hasImage(lo)||e.addImage(lo,Dc(),{pixelRatio:2,sdf:!0}),e.addLayer({id:ia,type:"symbol",source:Xe,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":lo,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},t)}function Ht(e,t){ca=t;for(let n of _c)e.setLayoutProperty(n,"visibility",t?"visible":"none");t||ya()}function Le(e,t,n){la=t;let o=t?xc(t,n):{type:"FeatureCollection",features:[]};e.getSource(Xe).setData(o),t||ya()}function ma(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var Pc={current:"today",proposed:"proposed"};function ga(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${u(e.color)}"></i> <b>${u(e.route)}</b>${e.name?` \u2014 ${u(e.name)}`:""}<br><span style="opacity:.75">${Pc[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var Oc=20;function Tc(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),s=[];for(let a=0;a<o;a++){let i=a/o*e;s.push([i,t,e-i])}for(let a=0;a<r;a++){let i=a/r*e;s.push([0,i,t,e-i])}return s}var sa=Tc(3,4,24),j=null,Ct=0,At=0,Re=null;function Mc(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function uo(e){Re&&(j=requestAnimationFrame(uo),!(e-At<1e3/Oc)&&(At=e,Ct=(Ct+1)%sa.length,Re.setPaintProperty(co,"line-dasharray",sa[Ct])))}function fa(){Re&&(document.hidden?j!==null&&(cancelAnimationFrame(j),j=null):j===null&&(At=0,j=requestAnimationFrame(uo)))}function ha(e){Mc()||Re||(Re=e,Ct=0,At=0,document.addEventListener("visibilitychange",fa),j=requestAnimationFrame(uo))}function ya(){j!==null&&(cancelAnimationFrame(j),j=null),document.removeEventListener("visibilitychange",fa),Re=null}var Ut="places",va="places-points",po="places-boundaries",ce="places-fill",ke="lost",Cc=100,Ac={lost:"share_lost",gained:"share_gained"};function ee(e,t){return`service_${e}_${t}`}var wa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Fc="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",le={lost:C,gained:A},Bt=null,Z=null,$e=null,Ra=!1,It=null;function mo(){return Bt}function La(){return Z}function $a(){return It}function go(){return $e}function Qe(){return Ra}function Nc(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function Hc(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Bc(e){return Math.max(e.residents_lost,e.residents_gained)}var ba=4,Ic=16,Uc=1e3;function jc(e){let t=Math.min(1,Math.sqrt(e/Uc));return ba+t*(Ic-ba)}function Gc(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Hc(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:jc(Bc(t))}}))}}function Kc(){return["match",["get","klass"],"lost",le.lost,"gained",le.gained,le.lost]}function Jc(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var Y=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var V=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function ka(e,t){return e==="service"?["step",["abs",["coalesce",["get",ee(t,"pct")],0]],V[0].opacity,V[0].max,V[1].opacity,V[1].max,V[2].opacity,V[2].max,V[3].opacity]:["step",["coalesce",["get",Ac[e]],0],Y[0].opacity,Number.EPSILON,Y[1].opacity,Y[1].max,Y[2].opacity,Y[2].max,Y[3].opacity,Y[3].max,Y[4].opacity]}function _a(e,t){return e==="service"?["case",[">=",["coalesce",["get",ee(t,"pct")],0],0],A,C]:le[e]}function Wc(e,t){let n=ee(t,"now"),o=ee(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var Yc=3;function Vc(e){if(e.length===0)return"";let t=e.slice(0,Yc),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function xa(e,t){e.addSource(po,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ce,type:"fill",source:po,layout:{visibility:"none"},paint:{"fill-color":_a(ke),"fill-opacity":ka(ke),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Ut,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:va,type:"circle",source:Ut,layout:{visibility:"none"},paint:{"circle-color":Kc(),"circle-radius":Jc(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function jt(e,t,n){e.setPaintProperty(ce,"fill-color",_a(t,n)),e.setPaintProperty(ce,"fill-opacity",ka(t,n))}async function Ea(){return Bt||(Bt=await P("/api/places")),Bt}async function Da(e){return $e||($e=await P("/api/boundaries"),e.getSource(po).setData($e)),$e}function zc(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Pa(e,t){let n=zc($e,t);if(n)return Z=null,It=n,e.getSource(Ut)?.setData({type:"FeatureCollection",features:[]}),null;try{Z=await P(`/api/places/${encodeURIComponent(t)}`)}catch{return Z=null,It=null,null}return It=null,e.getSource(Ut).setData(Gc(Z)),e.flyTo({center:[Z.lon,Z.lat],zoom:13}),Z}function Oa(e,t){Ra=t,e.setLayoutProperty(va,"visibility",t?"visible":"none"),e.setLayoutProperty(ce,"visibility",t?"visible":"none")}function qc(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${u(e.key)}">
      <span class="place-name">${u(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Xc="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ta(e,t,n,o){let r=Nc(e,t).map(s=>qc(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Fc}</p>
    ${o==="service"?`<p class="note">${Xc}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function Ma(e,t){return e?`<div class="lg-head"><b>${u(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${u(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Qc(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Zc(e,t,n,o){let r=V.map((c,m)=>({band:c,prevMax:m===0?0:V[m-1].max})).filter(({band:c})=>c.opacity>0).flatMap(({band:c,prevMax:m})=>{let p=Qc(c,m);return[`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(p)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${A};opacity:${c.opacity};border-radius:2px"></i>
          <span class="lg-lab">${u(p)} more trips</span></div>`]}).join(""),s=o?Wc(o,n):[],a=Vc(s),i=a?`<div class="lg-foot">${u(a)}</div>`:"";return`
    ${Ma(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${u(wa[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Ca({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return Zc(e,r??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",a=Y.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${le[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${u(i.label)} of the place's own residents ${u(s)}</span>
    </div>`).join("");return`
    ${Ma(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${u(s)}</div>
    ${a}
    <div class="lg-row lg-static"><i style="background:${le.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${le.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function eu(e,t){let n=e[ee(t,"now")],o=e[ee(t,"proposed")],r=e[ee(t,"pct")],s=e[ee(t,"rail_proposed")],a=wa[t];if(o===0&&n>0)return`Loses all buses on ${a} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${a} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${a} (${i}).`}function Aa(e,t,n){if(t==="service")return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      ${eu(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=Sa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Sa("gain a bus",e.residents_gained,e.share_gained):null,a=(t==="lost"?[r,s]:[s,r]).filter(i=>i!==null);return`<b>${u(e.place)}</b> <span class="muted">\xB7 ${u(e.kind)}</span><br>
    ${a.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Sa(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${Cc} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Ba=["discontinued","new","reshaped","one-to-one"],Ia={discontinued:["discontinued"],new:["new"],reshaped:["split","merged"],"one-to-one":["one-to-one"]},vo=["one-to-one"];function zt(e){return Ba.includes(e)}function wo(e){return Ba.filter(t=>e.includes(t))}var Ro="status",tu={status:"What happened",service:"How much service"};function qt(e){return e==="status"||e==="service"}var Ze=["gone","halved","less","same","more","doubled","new"],Lo={gone:"loses all service",halved:"halved or worse",less:"less service",same:"about the same",more:"more service",doubled:"doubled or better",new:"new service",none:"no service either way"},nu={gone:1.7,halved:1.35,less:1,same:.75,more:1,doubled:1.35,new:1.7,none:.75};function Xt(e){return Ze.includes(e)}function $o(e){return Ze.filter(t=>e.includes(t))}var Fa="#8e44ad",Ua={discontinued:C,new:A,split:Fa,merged:Fa,"one-to-one":Se},ko={discontinued:"discontinued",new:"new",split:"split",merged:"merged","one-to-one":"one-to-one"},ou=["discontinued","new","split","merged","one-to-one"],ru="route-changes",su=.12,ja=.9,Ga=1,au=/^[cp]:[\w-]{1,64}$/;function Ka(e){return au.test(e)}var xe={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},iu={current:"today",proposed:"proposed"},Ja=" \u2192 ",Yt="\u2014";function Gt(e,{named:t=!0}={}){return e.length===0?Yt:e.map(n=>t&&n.name?`${n.route} ${n.name}`:n.route).join(", ")}function et(e,{farSideNamed:t=!0}={}){return e.current.length===0?Gt(e.proposed):e.proposed.length===0?Gt(e.current):`${Gt(e.current)}${Ja}${Gt(e.proposed,{named:t})}`}function Vt(e){if(e===null)return Yt;let t=Math.round(e);return t===0?"0%":t>0?`+${t}%`:`\u2212${Math.abs(t)}%`}function lu(e){let t=Object.fromEntries(ou.map(n=>[n,0]));for(let n of e)t[n.status]+=1;return t}var Wa="routechange",te="routechange-lines",tt="routechange-arrows",Qt="routechange-selected",Zt="routechange-selected-lines",_o="routechange-selected-plan",xo="routechange-selected-arrows",cu=[te,tt,Zt,_o,xo],Eo=[_o,Zt,te],uu=[0,2.5],Na={current:["==",["get","side"],"current"],proposed:["==",["get","side"],"proposed"]},ho="routechange-arrow",fo=2.6,du=1.5,pu=2.8,Ya={bucket:"none",pct_trips:null};function yo(e,t,n,o,r){return{type:"Feature",geometry:{type:"LineString",coordinates:e.points},properties:{key:e.key,side:e.side,route:e.route,name:e.name,status:e.status,pattern_id:e.pattern_id,color:t,sort:n,w:o,bucket:r.bucket,scolor:X[r.bucket].color,sw:nu[r.bucket],pct:r.pct_trips}}}function mu(e){let t=new Map(e.groups.map(o=>[o.key,o.service[e.day]]));return{type:"FeatureCollection",features:e.features.map(o=>yo(o,Ua[o.status],o.status==="one-to-one"?0:1,1,t.get(o.key)??Ya)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function gu(e){let t=e.service[e.day]??Ya;return{type:"FeatureCollection",features:e.features.map(o=>o.side==="current"?yo(o,we,0,pu,t):yo(o,qe,1,du,t)).sort((o,r)=>o.properties.sort-r.properties.sort)}}function fu(e){let t=1/0,n=1/0,o=-1/0,r=-1/0;for(let s of e)for(let[a,i]of s.points)a<t&&(t=a),a>o&&(o=a),i<n&&(n=i),i>r&&(r=i);return Number.isFinite(t)?[[t,n],[o,r]]:null}function hu(e){if(e.length===0)return null;let t=e.flatMap(n=>Ia[n]);return["!",["in",["get","status"],["literal",t]]]}function yu(e){return e.length===0?null:["!",["in",["get","bucket"],["literal",[...e]]]]}var bo={status:{color:"color",width:"w"},service:{color:"scolor",width:"sw"}};function Do(e){let t=n=>["*",["get",bo[e].width],n];return["interpolate",["linear"],["zoom"],9,t(fo*.5),14,t(fo),16,t(fo*1.6)]}function bu(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function Ha(e,t,n,o,r,s){e.addSource(t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:n,type:"line",source:t,layout:{visibility:"none","line-cap":"round","line-join":"round","line-sort-key":["get","sort"]},paint:{"line-color":["get","color"],"line-width":Do("status"),"line-opacity":s}},r),e.addLayer({id:o,type:"symbol",source:t,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":140,"symbol-sort-key":["get","sort"],"icon-image":ho,"icon-size":["interpolate",["linear"],["zoom"],12,.45,16,.8],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"],"icon-opacity":s}},r)}function Va(e,t){e.hasImage(ho)||e.addImage(ho,bu(),{pixelRatio:2,sdf:!0}),Ha(e,Wa,te,tt,t,ja),Ha(e,Qt,Zt,xo,t,Ga),Su(e,t),Te(e)}function Su(e,t){e.setFilter(Zt,Na.current),e.addLayer({id:_o,type:"line",source:Qt,filter:Na.proposed,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":Do("status"),"line-opacity":Ga,"line-dasharray":uu}},xo)}var Jt=null,_e=null,za=!1,Ee=new Set(vo),De=new Set,Po=Ro;function Oo(){return Jt?.groups??null}function ue(){return _e}function Pe(){return za}function vu(e){return`/api/route_changes?day=${e}`}function wu(e,t){return`/api/route_changes/${encodeURIComponent(e)}?day=${t}`}async function To(e,t){if(!x.includes(t))throw new Error(`no such day type: ${t}`);return Jt=await J(vu(t)),e.getSource(Wa).setData(mu(Jt)),Jt}async function Mo(e,t,n,{fly:o=!0}={}){try{_e=await J(wu(t,n))}catch{return Co(e),null}e.getSource(Qt).setData(gu(_e)),qa(e,!0);let r=fu(_e.features);return o&&r&&e.fitBounds(r,{padding:60,maxZoom:14}),_e}function Co(e){_e=null,e.getSource(Qt)?.setData({type:"FeatureCollection",features:[]}),e.getLayer(te)&&qa(e,!1)}function qa(e,t){let n=t?su:ja;e.setPaintProperty(te,"line-opacity",n),e.setPaintProperty(tt,"icon-opacity",n)}function en(){return wo([...Ee])}function Xa(e,t){Ee.has(t)?Ee.delete(t):Ee.add(t),Te(e)}function Ao(e,t){Ee.clear();for(let n of t)Ee.add(n);Te(e)}function tn(){return $o([...De])}function Qa(e,t){De.has(t)?De.delete(t):De.add(t),Te(e)}function Fo(e,t){De.clear();for(let n of t)De.add(n);Te(e)}function Oe(){return Po}function No(e,t){Po=t,e.setPaintProperty(te,"line-color",["get",bo[t].color]),e.setPaintProperty(te,"line-width",Do(t)),e.setPaintProperty(tt,"icon-color",["get",bo[t].color]),Te(e)}function Te(e){let t=Po==="status"?hu(en()):yu(tn());e.setFilter(te,t),e.setFilter(tt,t)}function Za(e,t){za=t;for(let n of cu)e.setLayoutProperty(n,"visibility",t?"visible":"none")}var Ru="A route group is PRT\u2019s own mapping of today\u2019s route numbers onto the plan\u2019s \u2014 the routes it says replace each other. It is not a corridor: a street can lose one group\u2019s buses and gain another\u2019s, and only the location, surface and street views can see that.";function ei(){return` <button class="howto" data-caveat="${ru}">method</button>`}var ti={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Lu(e,t){if(e.current.length===0||e.proposed.length===0)return"";let n=e.service[t].pct_trips,o=`${ti[t]} trips, today to plan`;return`<span class="rc-pct ${So(n)}" title="${u(o)}">${Vt(n)}</span>`}function So(e){return e===null||Math.round(e)===0?"flat":e>0?"up":"down"}function $u(e,{reading:t,day:n}){let o=u(et(e,{farSideNamed:!1}));return t==="service"?`<span class="rc-map" style="color:${X[e.service[n].bucket].color}">${o}</span>`:`<span class="${e.status==="one-to-one"?"rc-map":`rc-map ${e.status}`}">${o}</span>`}function ni(e,t,n){return`
    <button type="button" class="rc-row${t?" selected":""}"
            data-select-route="${u(e.key)}">
      ${$u(e,n)}
      ${Lu(e,n.day)}
    </button>`}function Wt(e,t,n,o){return`
    <div class="scope-head">${u(e)} (${t.length})</div>
    <div class="rc-list">${t.map(r=>ni(r,r.key===n,o)).join("")}</div>`}function ku(e){return e.charAt(0).toUpperCase()+e.slice(1)}function oi(e,t,n={reading:"status",day:"weekday"}){let o=`
    <div class="place-head">
      <h2>Route changes</h2>
      <div class="muted">${e.length.toLocaleString()} route groups, ranked by weekday riders</div>
    </div>
    <p class="note">${Ru}${ei()}</p>`;if(n.reading==="service")return o+_u(e,t,n);let r=a=>e.filter(i=>a.includes(i.status)),s=r(["one-to-one"]);return`${o}
    ${Wt("Discontinued",r(["discontinued"]),t,n)}
    ${Wt("New",r(["new"]),t,n)}
    ${Wt("Split or merged",r(["split","merged"]),t,n)}
    <details class="svc rc-kept">
      <summary>One-to-one (${s.length}) \u2014 one number on each side; how its service changed</summary>
      <div class="rc-list">${s.map(a=>ni(a,a.key===t,n)).join("")}</div>
    </details>`}function _u(e,t,n){let o=a=>e.filter(i=>i.service[n.day].bucket===a),r=o("none").length,s=r===0?"":`
    <p class="muted rc-idle">${r} group${r===1?" runs":"s run"} on neither network on ${u(xe[n.day])},
      so ${r===1?"it has":"they have"} no line to draw.</p>`;return`
    <div class="muted rc-by">Grouped by ${u(ti[n.day])} trips, today \u2192 plan</div>
    ${Ze.map(a=>{let i=o(a);return i.length?Wt(ku(Lo[a]),i,t,n):""}).join("")}
    ${s}`}function xu(e,t){return`
    <tr><th>${e}</th>
      <td class="n">${t.cur_trips.toLocaleString()}</td>
      <td class="n">${t.prop_trips.toLocaleString()}</td>
      <td class="n ${So(t.pct_trips)}">${Vt(t.pct_trips)}</td>
      <td class="n">${t.cur_hours.toFixed(1)}</td>
      <td class="n">${t.prop_hours.toFixed(1)}</td>
      <td class="n ${So(t.pct_hours)}">${Vt(t.pct_hours)}</td></tr>`}function Eu(e){return e.prt.length===0?'<p class="muted">PRT\u2019s table has no row for this group.</p>':e.prt.map(n=>{let o=n.related_routes?`<div class="muted">PRT points riders to: ${u(n.related_routes)}</div>`:"",r=n.route_page?`<div><a class="link" href="${u(n.route_page)}" target="_blank" rel="noopener">PRT\u2019s page for this route \u2197</a></div>`:"";return`<div class="rc-prt">
      <div><b>${u(n.current_route||Yt)}${Ja}${u(n.final_route||Yt)}</b>
        <span class="rc-cat">${u(n.category)}</span></div>
      ${o}${r}</div>`}).join("")}function ri(e){let t=e.status==="new"?"":`
    <p class="rc-riders">${Math.round(e.riders_weekday).toLocaleString()} weekday riders today
      <span class="muted">\xB7 WPRDC route ridership, average weekday</span></p>`;return`
    <button type="button" class="link rc-back" data-select-route="">\u2190 All routes</button>
    <div class="place-head">
      <h2>${u(et(e))}</h2>
      <span class="rc-status ${u(e.status)}">${u(ko[e.status])}</span>
    </div>

    <div class="scope-head">Service, all three days</div>
    <table class="periods rc">
      <thead><tr><th></th>
        <th class="n" colspan="3">trips today \u2192 plan</th>
        <th class="n" colspan="3">revenue hours today \u2192 plan</th></tr></thead>
      <tbody>${x.map(n=>xu(n,e.service[n])).join("")}</tbody>
    </table>
    ${t}
    <p class="note">Revenue hours are in-service time only, not a cost figure. Both
      sides are counted from timetables: today\u2019s published feed and the
      proposed feed PRT supplied.</p>

    <div class="scope-head">What PRT says</div>
    <p class="muted rc-prt-lede">PRT\u2019s own account, from its route crosswalk.</p>
    ${Eu(e)}

    <p class="note">This is a route group, not a corridor. One group\u2019s loss
      can be another group\u2019s gain: Carrick\u2019s 51 reads as \u221210% weekday
      trips while the new 45 runs much of the same street as a separate group.
      Access is measured in the location, surface and street views, not
      here.${ei()}</p>`}function Du(e,t){return`<div class="lg-row lg-static"><i style="background:${e};border-radius:2px"></i>
    <span class="lg-lab">${t}</span></div>`}function Pu(e,t){return`<div class="lg-row lg-static"><i class="lg-dotted" style="border-color:${e}"></i>
    <span class="lg-lab">${t}</span></div>`}function si(e,t,n,o,r,s){return`
    <button class="lg-row ${s?"off":""}" ${e}="${t}"
            aria-pressed="${!s}">
      <i style="background:${n};border-radius:2px"></i>
      <span class="lg-lab">${o}</span>
      <span class="lg-n">${r}</span>
    </button>`}function Kt(e,t,n,o){let r=Ua[Ia[e][0]];return si("data-route-bucket",e,r,t,n,o.includes(e))}function Ou(e,t,n){return si("data-route-service",e,X[e].color,Lo[e],t,n.includes(e))}function ai(e){return`
    <div class="seg lg-weight" role="group" aria-label="Colour the routes by">
      ${["status","service"].map(n=>`
        <button data-route-reading="${n}" aria-pressed="${e===n}"
                class="${e===n?"active":""}">${tu[n]}</button>`).join("")}
    </div>`}function Tu(e,t){let n=Object.fromEntries([...Ze,"none"].map(o=>[o,0]));for(let o of e)n[o.service[t].bucket]+=1;return n}function Mu(e,t,n){let o=Tu(e,t),r=o.gone+o.halved+o.less,s=o.more+o.doubled+o.new,a=`${e.length.toLocaleString()} route groups \xB7 ${r} fewer trips \xB7 ${o.same} about the same \xB7 ${s} more \xB7 ${xe[t]}`;return`
    <div class="lg-head"><b>${u(a)}</b></div>
    ${ai("service")}
    ${Ze.filter(i=>o[i]>0).map(i=>Ou(i,o[i],n)).join("")}
    <div class="lg-foot">Each group\u2019s trips today \u2192 plan on ${u(xe[t])}, in the
      Stop-by-stop key\u2019s buckets and colours \u2014 a \xB110% band around no change.
      Route by route, which is not how access is measured: a group is
      not a corridor, and the 51 reads fewer trips while the new 45 runs much
      of the same street. Click a row to show or hide its lines; click a line to
      select its group.</div>`}function ii({groups:e,day:t,hidden:n,serviceHidden:o,reading:r,selected:s}){if(s)return`
      <div class="lg-head"><b>${u(et(s))}</b>
        <span class="muted">\xB7 ${u(ko[s.status])} \xB7 ${u(xe[t])}</span></div>
      ${Du(we,"today's alignment")}
      ${Pu(qe,"proposed alignment")}
      <div class="lg-foot">The rest of the network is dimmed. Click a line to
        select another group, or empty map to clear. Lines are drawing only:
        nothing is measured off their length.</div>`;if(!e)return'<div class="lg-head"><b>Route changes</b></div>';if(r==="service")return Mu(e,t,o);let a=lu(e),i=a.split+a.merged,c=`${e.length.toLocaleString()} route groups \xB7 ${a.discontinued} discontinued \xB7 ${a.new} new \xB7 ${i} split or merged \xB7 ${xe[t]}`;return`
    <div class="lg-head"><b>${u(c)}</b></div>
    ${ai("status")}
    ${Kt("discontinued","discontinued \u2014 today\u2019s alignment",a.discontinued,n)}
    ${Kt("new","new \u2014 proposed alignment",a.new,n)}
    ${Kt("reshaped","split or merged \u2014 proposed alignment",i,n)}
    ${Kt("one-to-one","one-to-one \u2014 proposed alignment",a["one-to-one"],n)}
    <div class="lg-foot">A route group is PRT\u2019s own mapping of today\u2019s
      numbers onto the plan\u2019s, not a corridor. Patterns are the ones that
      run on ${u(xe[t])}. Click a row to show or hide its lines;
      click a line to select its group.</div>`}function li(e,{selected:t,reading:n="status"}){let o=u(e.name?`${e.route} ${e.name}`:e.route),r=u(iu[e.side]),s=u(ko[e.status]),a=n==="service"?` \xB7 ${u(Lo[e.bucket])}${e.pct===null?"":` (${Vt(e.pct)} trips)`}`:"";return t?`${o} \xB7 <b>${r}</b> \xB7 ${s}${a}`:`<b>${o}</b> \xB7 ${r} \xB7 ${s}${a}`}var Ho=" \xB7 ",Bo={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places",routes:"Route changes"},ci=Object.keys(Bo);function ui(e){return Bo[e]??e}var Cu={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Au=["oneseat","journey"],Fu=["dots","both"],Nu={current:"routes today",proposed:"routes proposed"};function Hu(e){return e!=="journey"&&e!=="routes"}function Bu(e){let t=[Bo[e.view]??e.view];return e.view==="places"?t[0]:(Au.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Cu[e.day]),Hu(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&Fu.includes(e.view)&&t.push(Nu[e.stopRoutes]),t.join(Ho))}function di(e){let[t,...n]=Bu(e).split(Ho);return`<b>${u(t)}</b>${n.map(o=>Ho+u(o)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes",route:"route",routeHidden:"routehide",routeReading:"routecolor",serviceHidden:"servicehide"},Iu=/^[cp]:[\w.:-]{1,32}$/,nn={any:"any",selected:"selected"},Uu="pin",pi=5,gi="none",on=",";function fi(e){try{return e.self!==e.top}catch{return!0}}function hi(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?nn.selected:nn.any),t.set(h.dest,"key"in e.dest?e.dest.key:Io(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,Io(e.at)),e.camera&&t.set(h.camera,`${Io(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==ke&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),t.set(h.stopRoutes,e.stopRoutes??Ft),e.route&&t.set(h.route,e.route),e.routeHidden&&!ju(e.routeHidden,vo)&&t.set(h.routeHidden,e.routeHidden.length?e.routeHidden.join(on):gi),e.routeReading&&e.routeReading!==Ro&&t.set(h.routeReading,e.routeReading),e.serviceHidden?.length&&t.set(h.serviceHidden,e.serviceHidden.join(on)),`?${t}`}function yi(e){let t=new URLSearchParams(e),n={},o=t.get(h.view);o&&ci.includes(o)&&(n.view=o);let r=t.get(h.day);r&&x.includes(r)&&(n.day=r);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let a=t.get(h.oneSeatDay);a===nn.selected?n.oneSeatRestricted=!0:a===nn.any&&(n.oneSeatRestricted=!1);let i=t.get(h.dest);if(i&&i!==Uu){let R=mi(i);R?n.dest=R:i.includes(",")||(n.dest={key:i})}let c=mi(t.get(h.at));c&&(n.at=c);let m=Gu(t.get(h.camera));m&&(n.camera=m);let p=t.get(h.place);p&&(n.place=p);let b=t.get(h.selection);b!==null&&(n.selection=b.split(",").filter(R=>Iu.test(R)));let L=t.get(h.placeFill);(L==="lost"||L==="gained"||L==="service")&&(n.placeFill=L);let v=t.get(h.stopRoutes);(v==="off"||v==="current"||v==="proposed")&&(n.stopRoutes=v);let k=t.get(h.route);k&&Ka(k)&&(n.route=k);let f=t.get(h.routeHidden);if(f===gi)n.routeHidden=[];else if(f){let R=wo(f.split(on).filter(zt));R.length&&(n.routeHidden=R)}let T=t.get(h.routeReading);T&&qt(T)&&(n.routeReading=T);let H=t.get(h.serviceHidden);if(H){let R=$o(H.split(on).filter(Xt));R.length&&(n.serviceHidden=R)}return n}function ju(e,t){return e.length===t.length&&e.every((n,o)=>n===t[o])}function Io(e){return`${e.lat.toFixed(pi)},${e.lon.toFixed(pi)}`}function mi(e){let t=bi(e,2);return t?{lat:t[0],lon:t[1]}:null}function Gu(e){let t=bi(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function bi(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Uo="embed";var Ku=["1","true","yes"];function Si(e){let t=new URLSearchParams(e).get(Uo);return t!==null&&Ku.includes(t.toLowerCase())}function vi(e){let t=new URLSearchParams(e);return t.set(Uo,"1"),`?${t}`}function wi(e){let t=new URLSearchParams(e);t.delete(Uo);let n=String(t);return n?`?${n}`:""}function Ri(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var ne=["peek","half","full"],Ju=192,Wu=.3,Yu=.55,Vu=.9,zu=.6,qu=.45;function rn(e,t){return e==="peek"?Math.min(Ju,t*Wu):e==="half"?t*Yu:t*Vu}function Xu(e,t,n=0){let o=ne.map(s=>Math.abs(rn(s,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>zu&&(r=Math.max(0,Math.min(ne.length-1,r+(n>0?1:-1)))),ne[r]}function Li(e){return ne[(ne.indexOf(e)+1)%ne.length]}function Qu(e,t){return Math.min(e,t*qu)}function Me(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function jo(e){let t=null,n=()=>{let o=Me();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Zu=8,ed=400;function $i(e){let t=d("side"),n=d("sheet-handle"),o="peek",r=!1,s=0,a=0,i=0,c={y:0,t:0};function m(){return window.innerHeight}function p(f){t.style.height=`${f}px`,e.onMove(f,Qu(f,m()))}function b(f){o=f,t.dataset.snap=f,p(rn(f,m()))}n.addEventListener("pointerdown",f=>{Me()&&(r=!0,s=f.clientY,a=t.getBoundingClientRect().height,i=f.timeStamp,c={y:f.clientY,t:f.timeStamp},t.classList.add("dragging"),n.setPointerCapture(f.pointerId))}),n.addEventListener("pointermove",f=>{if(!r)return;let T=a+(s-f.clientY),H=rn("peek",m()),R=rn("full",m());p(Math.max(H,Math.min(R,T))),c={y:f.clientY,t:f.timeStamp}});function L(f){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(f.clientY-s)>Zu)&&f.timeStamp-i<ed){b(Li(o));return}let H=f.timeStamp-c.t,R=H>0?(c.y-f.clientY)/H:0;b(Xu(t.getBoundingClientRect().height,m(),R))}n.addEventListener("pointerup",L),n.addEventListener("pointercancel",L),n.addEventListener("keydown",f=>{f.key!=="Enter"&&f.key!==" "||(f.preventDefault(),Me()&&b(Li(o)))});let v=jo(e.onLayoutChange);function k(){if(v(),!Me()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",k),k(),{at:()=>Me()?o:"full",atLeast(f){Me()&&ne.indexOf(f)>ne.indexOf(o)&&b(f)}}}var td=["llvmpipe","swiftshader","softpipe","basic render","software"];function Go(e){if(!e)return!1;let t=e.toLowerCase();return td.some(n=>t.includes(n))}function _i(e){let t=Go(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function xi(e){return Go(e.renderer)?0:nd}var nd=300,od="https://tiles.openfreemap.org/styles/positron",rd=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],ki=[],sd=19,ad='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',id=!1;function Ei(e){return!id||!Go(e.renderer)?od:ld()}function ld(){let e=o=>({type:"raster",tileSize:256,attribution:ad,tiles:o,maxzoom:sd}),t={basemap:e(rd)},n=[{id:"basemap",type:"raster",source:"basemap"}];return ki.length&&(t["basemap-labels"]=e(ki),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function Di(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function cd(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function Pi(e,t,n){let o=new Map(n.map(c=>[c.layer,c])),r=null,s="",a=c=>{s!==c&&(s=c,e.getCanvas().style.cursor=c)},i=()=>{r=null,a(""),t.remove()};return e.on("mousemove",c=>{let m=n.map(T=>T.layer).filter(T=>e.getLayer(T)&&e.getLayoutProperty(T,"visibility")!=="none");if(!m.length){i();return}let[p,...b]=e.queryRenderedFeatures(c.point,{layers:m});if(!p){i();return}a("pointer");let L=cd(p);if(L===r)return;let v=o.get(p.layer?.id),k=v?v.html(p,b):null;if(k==null){r=null,t.remove();return}r=L;let f=v.anchor?v.anchor(p,c):c.lngLat;t.setLngLat(f).setHTML(k).addTo(e)}),e.on("mouseout",i),i}function ud(e){let t=e.find(n=>n.active)??e[0];return t?{label:t.label,disabled:t.disabled,armed:t.armed}:{label:"",disabled:!0,armed:!1}}function dd(e,t){return t.kind!=="trigger"||e===t.group?null:t.group}var pd="seg-current",Oi="dd",md="open",Ti="armed";function gd(e){let t=Array.from(e.querySelectorAll("button")).map(n=>({label:n.textContent??"",active:n.classList.contains("active"),disabled:n.disabled,armed:n.classList.contains(Ti)}));return ud(t)}function Mi(e=document){let t=new Map,n=null,o=s=>{n=s;for(let[a,i]of t){let c=a===n;i.group.classList.toggle(md,c),i.trigger.setAttribute("aria-expanded",String(c))}},r=s=>o(dd(n,s));e.querySelectorAll(".controls").forEach((s,a)=>{let i=s.querySelector(".seg");if(!i)return;let c=s.id||`controls-${a}`,m=s.querySelector(".lbl")?.textContent??"",p=document.createElement("button");p.type="button",p.className=pd,p.setAttribute("aria-haspopup","true"),p.setAttribute("aria-expanded","false");let b=document.createElement("div");b.className=Oi,i.replaceWith(b),b.append(p,i);let L=()=>{let v=gd(i);p.textContent=v.label,p.disabled=v.disabled,p.classList.toggle(Ti,v.armed),p.setAttribute("aria-label",m?`${m}: ${v.label}`:v.label)};L(),new MutationObserver(L).observe(i,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["class","disabled"]}),p.addEventListener("click",()=>{r({kind:"trigger",group:c}),n===c&&i.querySelector("button.active")?.focus()}),i.addEventListener("click",v=>{if(!v.target.closest("button"))return;let k=n===c;r({kind:"pick"}),k&&p.focus()}),t.set(c,{group:s,trigger:p,seg:i})}),document.addEventListener("click",s=>{if(n===null)return;s.target.closest(`.${Oi}`)||r({kind:"outside"})}),document.addEventListener("keydown",s=>{if(s.key!=="Escape"||n===null)return;let a=t.get(n);r({kind:"escape"}),a&&a.seg.contains(document.activeElement)&&a.trigger.focus()})}var fd=[-79.9959,40.4406],hd=12,yd="#e2574c",sn=5,O={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},ot=yi(location.search),st=Si(location.search);st&&d("app").classList.add("embed");var bd={at:()=>"full",atLeast(){}},Hi=null,F=400,nt=null,S=null,re=null,me=0,_={key:"downtown"},de=null,Bi=!1,Fe=!1,gn="locations",Ne="area",I=Ft,Ko=0;function ln(){return I==="off"?"current":I}var Ii="count",pn=null,G=ke,ge=null,K=!1,g="dots",Vo,qo=[],Ci=()=>{},Jo=Di(),l=new maplibregl.Map({container:"map",style:Ei(Jo),pixelRatio:_i(Jo),fadeDuration:xi(Jo),renderWorldCopies:!1,center:ot.camera?[ot.camera.lon,ot.camera.lat]:fd,zoom:ot.camera?.zoom??hd,cooperativeGestures:fi(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{ar(l),is(l),ys(l,Ye),Ls(l,Ye),Ps(l,"walk-fill"),Qs(l),pa(l,Tt),xa(l,Ye),Va(l,Ye),D(),l.on("click",t=>{if(K)return;if(Bi){rt({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=l.queryRenderedFeatures(t.point,{layers:[ce]})[0];s&&cn(s.properties.key);return}if(g==="routes"){let{x:s,y:a}=t.point,i=[[s-sn,a-sn],[s+sn,a+sn]],c=l.queryRenderedFeatures(i,{layers:Eo})[0];c?(Vo.atLeast("half"),zo(c.properties.key)):Ai();return}let n=[...yt,"oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];er(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});Ci=Pi(l,e,[...ir(t=>{let n=bt(),o=t.find(r=>yt.includes(r.layer?.id));return n&&o?Un(o.properties,w(),n.buckets,{pole:!1}):null}),...yt.map(t=>({layer:t,html:n=>{let o=bt();return o?Un(n.properties,w(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=ve();return n?As(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:"stoproutes-lines",html:t=>ga(t.properties)},...Eo.map(t=>({layer:t,html:n=>li(n.properties,{selected:ue()!==null,reading:Oe()})})),{layer:ce,html:t=>Aa(t.properties,G,w())}]),Ad(),l.on("moveend",()=>{let t=l.getCenter();Hi={lat:t.lat,lon:t.lng,zoom:l.getZoom()},y(),E()}),pe(O.radius,t=>{F=Number(t.dataset.radius),Hn(l,F,w()).then(y),wt()&&Jn(l,F,w()).then(y),Rt()&&Vn(F).then(y),ve()&&un(),S&&Ce(S.lat,S.lon)}),pe(O.day,t=>{let n=t.dataset.day;Dr(n),g!=="journey"&&D(),Bn(l,n),mn(),Wn(l,n),g==="journey"&&S&&Xo(S.lat,S.lon),kt()&&$s(l,n).then(y),Fe&&ve()&&(un(),S&&Ce(S.lat,S.lon)),Qe()&&G==="service"&&jt(l,G,n),Pe()&&Dd(),y()}),pe(O.oneSeatDay,t=>{Fe=t.dataset.oneseatDay==="selected",Yo(),un(),S&&Ce(S.lat,S.lon)}),pe(O.view,t=>{let n=g;g=t.dataset.view,Ci(),Wr(l,g==="dots"||g==="both"),$d(g==="surface"||g==="both"),_d(g==="corridors"),Td(g==="oneseat"),Od(g==="journey",n==="journey"),xd(g==="places"),Ed(g==="routes"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&D({scrollToTop:!0}),Pd(Ln(g)),Ki();let o=g==="oneseat"||g==="journey";d("dest-controls").classList.toggle("hidden",!o),d("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),d("place-fill-controls").classList.toggle("hidden",g!=="places"),Wi(),z()||Fi(!1),Ae(),Yo(),o||dn(!1),ji()}),pe(O.dest,t=>{let n=t.dataset.dest;if(n==="pin"){dn(!0);return}dn(!1),rt({key:n})}),pe(O.placeFill,t=>{G=t.dataset.placeFill,Qe()&&jt(l,G,w()),D(),y(),Yo()}),pe(O.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=I!=="off"&&Nt()!==null;I=n,D(),o&&n!=="off"?(Le(l,Nt(),n),N&&Zo(N.radius)):mn()}),d("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){gn=n.dataset.weight,y(),E();return}let o=t.target.closest("[data-surface-unit]");if(o){Ne=o.dataset.surfaceUnit,kd(Ne),E();return}let r=t.target.closest("[data-route-bucket]");if(r&&zt(r.dataset.routeBucket)){Xa(l,r.dataset.routeBucket),y(),E();return}let s=t.target.closest("[data-route-service]");if(s&&Xt(s.dataset.routeService)){Qa(l,s.dataset.routeService),y(),E();return}let a=t.target.closest("[data-route-reading]");if(a&&qt(a.dataset.routeReading)){No(l,a.dataset.routeReading),y(),Pe()&&D(),E();return}let i=t.target.closest("[data-bucket]");i&&(ls(l,i.dataset.bucket,w()),y())}),d("legend-reset").addEventListener("click",()=>{if(Pe()){Oe()==="service"?Fo(l,[]):Ao(l,[]),y(),E();return}cs(l,w()),y()}),d("legend-select").addEventListener("click",()=>Fi(!K)),d("legend-clear").addEventListener("click",()=>{Fn(l),Ae(),y(),E()}),d("legend-collapse").addEventListener("click",()=>{Wo(!d("legend-box").classList.contains("collapsed"))}),d("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&rt({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Hd(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&cn(r.dataset.selectPlace);let s=t.target.closest("[data-select-route]");if(s){let c=s.dataset.selectRoute;c?zo(c):Ai()}let a=t.target.closest("[data-sort-places]");a&&(Ii=a.dataset.sortPlaces,D());let i=t.target.closest("[data-goto-place]");i&&(g!=="places"&&oe(O.view,"places"),cn(i.dataset.gotoPlace))}),d("side-toggle").addEventListener("click",Rd),st&&jo(Wo),Vo=st?bd:$i({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Wo}),vd(),Mi(),hn(),Ae(),fn(),Sd(ot),Hn(l,F,w()).then(y),Nd(),Fd()});function pe(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),hn(),E()})})}function oe(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Sd(e){e.radius!==void 0&&oe(O.radius,String(e.radius)),e.day&&oe(O.day,e.day),e.oneSeatRestricted!==void 0&&oe(O.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(gn=e.weight),e.surfaceUnit&&(Ne=e.surfaceUnit),e.placeFill&&oe(O.placeFill,e.placeFill),e.routeHidden&&Ao(l,e.routeHidden),e.serviceHidden&&Fo(l,e.serviceHidden),e.routeReading&&No(l,e.routeReading),e.dest&&("key"in e.dest?oe(O.dest,e.dest.key):rt(e.dest)),e.selection&&Zr(l,e.selection),e.stopRoutes&&oe(O.stopRoutes,e.stopRoutes),e.view&&oe(O.view,e.view),e.at&&er(e.at.lat,e.at.lon),e.place&&cn(e.place),e.route&&zo(e.route,{fly:!e.camera})}function E(){let e={view:g,day:w(),radius:F,oneSeatRestricted:Fe,weight:gn,surfaceUnit:Ne,dest:_,at:S,camera:Hi,place:pn,placeFill:G,selection:qr(),stopRoutes:I,route:ge,routeHidden:en(),routeReading:Oe(),serviceHidden:tn()},t=hi(e);history.replaceState(null,"",(st?vi(t):t)+location.hash),fn(t)}function fn(e=wi(location.search)){if(!st)return;let t=d("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g==="routes"?ue()?et(ue()):null:S?re?Ke(re):"this point":null;t.querySelector(".el-action").textContent=Ri(n)}function hn(){d("statebar").innerHTML=di({view:g,day:w(),radius:F,oneSeatRestricted:Fe,destination:at(),stopRoutes:I}),wd()}function Wo(e){d("legend-box").classList.toggle("collapsed",e);let t=d("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function vd(){let e=t=>{d("app").classList.toggle("controls-open",t),d("controls-toggle").setAttribute("aria-expanded",String(t))};d("controls-toggle").addEventListener("click",()=>{e(!d("app").classList.contains("controls-open"))}),d("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function wd(){d("controls-toggle").firstChild?.remove(),d("controls-toggle").prepend(document.createTextNode(ui(g)))}function Rd(){let e=d("app").classList.toggle("side-collapsed"),t=d("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function y(){Ld()}function Ld(){if(d("legend-reset").classList.toggle("hidden",qn()||eo()||so()||Qe()||!(z()||Pe())),so()){d("legend").innerHTML=oa(Mt());return}if(Pe()){d("legend").innerHTML=ii({groups:Oo(),day:w(),hidden:en(),serviceHidden:tn(),reading:Oe(),selected:ue()});return}if(Qe()){d("legend").innerHTML=Ca({selected:La(),fill:G,day:w(),boundaries:go(),unchanged:$a()});return}if(qn()){let n=kt();n&&Bs(d("legend"),n);return}if(eo()){let n=ve();if(!n)return;let o=l.getBounds();Is(d("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=bt();if(!e)return;let t=l.getBounds();js(d("legend"),{layer:e,day:w(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:gn,dots:z(),surface:Kn()?wt():null,unit:Ne,population:Rt(),selection:zr()})}async function $d(e){if(e&&!wt()){d("legend").classList.add("loading");try{await Jn(l,F,w())}finally{d("legend").classList.remove("loading")}}bs(l,e),e&&Ne==="people"&&await Ui(),y()}async function Ui(){if(!Rt()){d("legend").classList.add("loading");try{await Vn(F)}finally{d("legend").classList.remove("loading")}}}async function kd(e){e==="people"&&Kn()&&await Ui(),y()}async function _d(e){if(e&&!kt()){d("legend").classList.add("loading");try{await Xn(l,w())}finally{d("legend").classList.remove("loading")}}ks(l,e),y()}async function xd(e){if(e&&(!mo()||!go())){d("legend").classList.add("loading");try{await Promise.all([Ea(),Da(l)])}finally{d("legend").classList.remove("loading")}}Oa(l,e),e&&jt(l,G,w()),e&&D(),y()}async function cn(e){pn=await He(()=>Pa(l,e))?e:null,g==="places"&&(D(),pn&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),y(),E()}async function Ed(e){e&&await He(()=>To(l,w())),Za(l,e),e&&D({scrollToTop:!0}),y()}async function zo(e,{fly:t=!0}={}){ge=await He(()=>Mo(l,e,w(),{fly:t}))?e:null,g==="routes"&&D({scrollToTop:!0}),y(),E()}function Ai(){!ge&&!ue()||(Co(l),ge=null,g==="routes"&&D({scrollToTop:!0}),y(),E())}async function Dd(){await He(async()=>{await To(l,w()),ge&&await Mo(l,ge,w(),{fly:!1})}),g==="routes"&&D(),y()}function Pd(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function D({scrollToTop:e=!1}={}){if(e&&(d("panel").scrollTop=0),fn(),g==="places"){d("panel").innerHTML=Ta(mo()??[],Ii,pn,G);return}if(g==="routes"){let t=ue();d("panel").innerHTML=t?ri(t):oi(Oo()??[],ge,{reading:Oe(),day:w()});return}if(!re){g==="oneseat"?d("panel").innerHTML=jr(at()):Pr(d("panel"));return}if(g==="oneseat"){let t=Ur(re,_,w());if(t){d("panel").innerHTML=t;return}}Ir(re,{withKerb:z(),routes:I})}function Od(e,t=!1){if(Zs(l,e),y(),!e){t&&(S?Ce(S.lat,S.lon):D());return}Mt()&&S?d("panel").innerHTML=io(Mt(),at()):d("panel").innerHTML=na(at())}async function Xo(e,t){let n=++me;S={lat:e,lon:t},E(),Ji(e,t);let o=Gi(),r=u(at());if(!o){d("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}d("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let s=await P(ea({lat:e,lon:t},o,w()));if(n!==me)return;ao(l,s),d("panel").innerHTML=io(s,r),y(),fn()}catch(s){if(n!==me)return;ao(l,null),d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Yo(){d("day-controls").classList.toggle("hidden",!Ms(g,Fe,G))}function Qo(){return Ts(Fe,w())}async function Td(e){e&&!ve()&&await He(()=>to(l,F,_,Qo())),Cs(l,e),y()}async function un(){await He(()=>to(l,F,_,Qo())),y()}async function He(e){d("legend").classList.add("loading");try{return await e()}finally{d("legend").classList.remove("loading")}}function rt(e){if(_=e,dn(!1),Md(),ji(),hn(),E(),g==="journey"){S&&Xo(S.lat,S.lon),y();return}S?Ce(S.lat,S.lon):D({scrollToTop:!0}),un()}function ji(){let e=Gi();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in _))){de?.remove(),de=null;return}de?de.setLngLat([e.lon,e.lat]).addTo(l):(de=new maplibregl.Marker({color:Zn,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),de.on("dragend",()=>{let n=de.getLngLat();rt({lat:n.lat,lon:n.lng})}))}function Md(){let e=Os(_);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Gi(){if("lat"in _)return{lat:_.lat,lon:_.lon};let e=_.key,t=qo.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function at(){if("lat"in _)return`${_.lat.toFixed(4)}, ${_.lon.toFixed(4)}`;let e=_.key;return qo.find(t=>t.key===e)?.name??e}function dn(e){Bi=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Ce(e,t){let n=++me;S={lat:e,lon:t},E(),d("panel").classList.add("loading"),Ji(e,t),$n(l),Le(l,null,ln()),d("pin-key").classList.add("hidden");try{let o="lat"in _?`&dest_lat=${_.lat.toFixed(6)}&dest_lon=${_.lon.toFixed(6)}`:"",r=await P(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${F}${o}&oneseat_day=${Qo()}`);if(n!==me)return;N={lat:e,lon:t,radius:F,now:r.current.stops,proposed:r.proposed.stops},re=r,Wi(),Ki(),D({scrollToTop:!0})}catch(o){if(n!==me)return;d("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===me&&d("panel").classList.remove("loading")}}var N=null;function Ki(){if(!N||!Ln(g)){$n(l),d("pin-key").classList.add("hidden"),mn();return}lr(l,N.lat,N.lon,N.radius,N.now,N.proposed),Zo(N.radius),mn()}function mn(){let e=++Ko,t=()=>{N&&Zo(N.radius)};I!=="off"&&z()&&S&&re?.kerb?P(ma(S,w())).then(n=>{e===Ko&&(Le(l,n,ln()),Ht(l,!0),ha(l),t())}).catch(()=>{e===Ko&&(Le(l,null,ln()),Ht(l,!1),t())}):(Le(l,null,ln()),Ht(l,!1),t())}function Zo(e){let t=I!=="off"&&ua()&&da(Nt(),I)?I:!1;d("pin-key").innerHTML=Us(e,{routes:t}),d("pin-key").classList.remove("hidden")}function Ji(e,t){nt?nt.setLngLat([t,e]):(nt=new maplibregl.Marker({color:yd,draggable:!0}).setLngLat([t,e]).addTo(l),nt.on("dragend",()=>{let n=nt.getLngLat();er(n.lat,n.lng)}))}var an=14;function z(){return g==="dots"||g==="both"}function Fi(e){K=e&&z(),K?l.dragPan.disable():l.dragPan.enable(),l.getCanvas().style.cursor=K?"none":"",K||Yi(),Ae()}function Wi(){let e=z()&&!!re?.kerb;d("stop-routes-controls").classList.toggle("hidden",!e)}function Ae(){let e=d("legend-select");e.classList.toggle("hidden",!z()),e.setAttribute("aria-pressed",String(K)),e.textContent=K?"Selecting":"Select stops",d("legend-clear").classList.toggle("hidden",!z()||!Xr())}function Cd(e,t){let n=d("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!K}function Ni(e){d("brush").classList.toggle("painting",e)}function Yi(){d("brush").hidden=!0}function Ad(){let e=d("brush");e.style.width=`${an*2}px`,e.style.height=`${an*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Ae(),y()}))},s=()=>{K&&(t=!0,n=!1,Ni(!0))},a=c=>{if(Cd(c.point.x,c.point.y),!t)return;n=!0,An(l,Nn(l,c.point.x,c.point.y,an))&&r()},i=c=>{if(Ni(!1),!!t){if(t=!1,!n){let[m]=Nn(l,c.point.x,c.point.y,an);m&&Qr(l,m)}Ae(),y(),E()}};l.on("mousedown",s),l.on("mousemove",a),l.on("mouseup",i),l.getCanvas().addEventListener("mouseleave",Yi),l.on("touchstart",s),l.on("touchmove",a),l.on("touchend",i)}function er(e,t){if(Vo.atLeast("half"),g==="journey"){Xo(e,t);return}g!=="places"&&g!=="routes"&&Ce(e,t)}async function Fd(){try{qo=await P("/api/destinations"),hn()}catch{}}async function Nd(){try{let e=await P("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;d("feedline").textContent=t,d("feedline-methods").textContent=t,d("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Hd(e){d("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}d("methods-open").addEventListener("click",()=>d("methods").classList.add("open"));d("methods-close").addEventListener("click",()=>d("methods").classList.remove("open"));})();
