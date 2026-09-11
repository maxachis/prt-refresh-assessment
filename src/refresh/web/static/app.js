"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function R(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Ut=new Map;function ue(e){let t=Ut.get(e);if(t)return t;let n=R(e).catch(o=>{throw Ut.delete(e),o});return Ut.set(e,n),n}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function de(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),r=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${r}`}function jt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Jt(e){return e>0?`+${e}`:String(e)}function no(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var $s="#15181e",oo="#ffa23a",_s="#ffffff";function xs(e,t,n,o=96){let r=[],a=n/111320,s=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let u=i/o*2*Math.PI;r.push([t+s*Math.cos(u),e+a*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[r]},properties:{}}}function K(e){return{type:"FeatureCollection",features:e}}function Rs(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function ks(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",r=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${r}`}function Kt(e){return e!=="corridors"&&e!=="journey"&&e!=="places"}function Gt(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(K([]))}function ro(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function ao(e){e.addSource("walk",{type:"geojson",data:K([])}),e.addSource("stops-now",{type:"geojson",data:K([])}),e.addSource("stops-prop",{type:"geojson",data:K([])}),e.addSource("stop-moves",{type:"geojson",data:K([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":oo,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":_s,"circle-stroke-width":3,"circle-stroke-color":oo}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":$s,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function so(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>ks(n.properties,e(o))}))}function io(e,t,n,o,r,a){e.getSource("walk").setData(K([xs(t,n,o)])),e.getSource("stops-now").setData(K(ro(r,"current"))),e.getSource("stops-prop").setData(K(ro(a,"proposed"))),e.getSource("stop-moves").setData(K(Rs(a)))}var E=["weekday","saturday","sunday"],Wt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],lo={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},je=4,Je=6,co=e=>Je+je*e,uo=e=>Je+1+je*e,xe=e=>Je+2+je*e,Ps=e=>Je+3+je*e,Ke=2,Es=3,Re=4,po=5,pe=e=>e[Es],O=(e,t)=>e[t],mo=(e,t)=>e[Ps(t)],Yt=e=>2+2*e,zt=e=>3+2*e,Ge=4,fo=e=>2+Ge*e,go=e=>3+Ge*e,ho=e=>4+Ge*e,yo=e=>5+Ge*e;var Os=[[.3963377774,.2158037573],[-.1055613458,-.0638541728],[-.0894841775,-1.291485548]],Ds=[[4.0767416621,-3.3077115913,.2309699292],[-1.2684380046,2.6097574011,-.3413193965],[-.0041960863,-.7034186147,1.707614701]],bo=1e-6,Ts=32;function wo(e,t,n){let o=n*Math.PI/180,r=t*Math.cos(o),a=t*Math.sin(o),s=Os.map(([i,u])=>(e+i*r+u*a)**3);return Ds.map(i=>i[0]*s[0]+i[1]*s[1]+i[2]*s[2])}function So(e,t,n){return wo(e,t,n).every(o=>o>=-bo&&o<=1+bo)}function Ms(e,t,n){if(So(e,t,n))return t;let o=0,r=t;for(let a=0;a<Ts;a++){let s=(o+r)/2;So(e,s,n)?o=s:r=s}return o}function Cs(e){let t=Math.min(1,Math.max(0,e)),n=t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,n))*255)}function As(e,t,n){let[o,r,a]=wo(e,Ms(e,t,n),n);return`#${[o,r,a].map(s=>Cs(s).toString(16).padStart(2,"0")).join("")}`}var vo=/(\d+)/;function Fs(e,t){let n=e.split(vo),o=t.split(vo);for(let r=0;r<Math.max(n.length,o.length);r++){let a=n[r]??"",s=o[r]??"";if(a!==s)return r%2?Number(a)-Number(s):a<s?-1:1}return 0}function ke(e){let t=[...new Set(e)].sort(Fs);return new Map(t.map((n,o)=>[n,As(.55,.16,o*360/t.length)]))}var Lo="at this stop",$o=e=>`within ${e} m`,Ns="both directions",Hs="one or both directions",qt="weekday";function w(){return qt}function Eo(e){qt=e}function Oo(e){e.innerHTML=`
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
    </div>`}function Do(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Bs(e,t){let n=Math.max(1,...Wt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Wt.map(o=>{let r=e.periods[o]??0,a=t.periods[o]??0,s=a-r,i=s>0?"up":s<0?"down":"flat";return`
      <tr>
        <th>${lo[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${r/n*100}%"></span>
          <span class="b-prop" style="width:${a/n*100}%"></span>
        </td>
        <td class="n">${r}</td>
        <td class="n">${a}</td>
        <td class="n ${i}">${s===0?"\xB7":Jt(s)}</td>
      </tr>`}).join("")}function To(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function _o(e){return e.first==null?'<span class="muted">no service</span>':`${de(e.first)}\u2013${de(e.last)}`}function xo(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Is={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Us={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function js(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let r=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':We(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${Is[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${r}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Us[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${ne("one-seat")}</p>
    </div>`:""}function ne(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Pe(e,t,n=null){let o=e===t?" same":"",r=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${r}">${t}</span></dd>`}function Ro(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function ko(e){return e.first==null||e.last==null?null:e.last-e.first}function We(e,t,n){let o=new Set(e.filter(a=>t.includes(a))),r=a=>n&&n.side===a?n.colors:void 0;return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Po(e,o,"now",r("current"))}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Po(t,o,"prop",r("proposed"))}</div>
    </div>`}function Po(e,t,n,o){return e.length?e.map(r=>{let a=t.has(r)?"both":`only-${n}`,s=o?.get(r),i=s?` style="--route-color:${s}"`:"";return`<span class="route ${a}"${i}>${d(r)}</span>`}).join(" "):'<span class="muted">none</span>'}var Vt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Js="Allegheny";function Ee(e){let t=e.place?.muni?.trim()??"",n=Vt.exec(t)?.[1],o=n===Js?t.replace(Vt,""):n?`${t.replace(Vt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Ye(e){return e==="weekday"?"weekday":e}function Mo(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ye(t)}`}function Ks(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Gs(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,r=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",a=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",s=[r,a].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${s}</div></dd>`}function Ws(e,t){let n=e.one_direction_routes??[],o=t.one_direction_routes??[];if(!n.length&&!o.length)return"";let r=(a,s)=>`${a.length} of ${s.length}`;return`
      <dt>Routes in one direction only${ne("one-direction")}</dt>
      ${Pe(r(n,e.routes),r(o,t.routes))}`}function Co(e,t,n){if(!e)return"";let o=e.measured+e.unmeasured,r=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${o} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"",a=e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Ye(t)}, today only</span>`;return`<dt>Boardings ${d(n)}</dt><dd>${a}${r}</dd>`}function Ao(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${ne("boardings")}</p>`}function Ys(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        ${a===0?"no change":`${Jt(a)} trips`}
        <div class="muted">${no(e.trips,t.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ye(n)} ${d(o)}${r?`, ${d(r)}`:""}</div>`}function No(e,t){return`
    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Bs(e,t)}</tbody>
    </table>`}function Ho(e,t){let n=xo(e),o=xo(t),r=ko(e),a=ko(t);return`
      <dt>First and last</dt>
      ${Pe(_o(e),_o(t))}
      <dt>Hours between</dt>
      ${Pe(jt(r),jt(a),Ro(r,a,"more"))}
      <dt>Typical wait</dt>
      ${Pe(n==null?"\u2014":`${n} min`,o==null?"\u2014":`${o} min`,Ro(n,o,"less"))}`}function Bo(e,t,n,o){return`
    <div class="routes">
      <h3>${d(n)}</h3>
      ${We(e.routes,t.routes,o)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${ne("location-not-route")}</p>
    </div>`}function zs(e,t){if(t==="off")return"";let n=t==="current"?"on today's network":"under the plan";return`
    <p class="note">Every route calling here on a ${Ye(e)}, ${n},
      one colour per route, drawn end to end along the street it runs; arrows
      point the direction of travel. Buses only: a train serving this stop is
      not drawn.${ne("stop-routes")}</p>`}function Vs(e,t,n={}){let o=e.current.days[t],r=e.proposed.days[t],a=n.routes??"off",s=a==="off"?void 0:{side:a,colors:ke((a==="current"?o:r).routes)},i=e.names.length?e.names.join(" \xB7 "):`stop ${e.stop_id}`;return`
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
      ${zs(t,a)}
      <p class="note">This kerb only \u2014 every pole within ${e.dedup_m} m of it,
        on both networks, so a corner PRT splits into two stop ids reads as
        one. It is the same count the dot's colour and its hover use, and it
        is <b>not the published measure</b>: what
        <code>docs/answers/</code> publishes is the walk radius
        below.${ne("kerb")}</p>
    </section>`}function Xt(e,t,n=""){let o=e.current.days[t],r=e.proposed.days[t],a=o.one_direction_routes?.length||r.one_direction_routes?.length;return`
    ${Fo(o,r,t,$o(e.radius),{directions:a?Hs:Ns})}

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
      ${Ws(o,r)}
      <dt>Stops within ${e.radius} m</dt>
      ${Pe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Gs(e.current.stops)}
      ${Ks(e.proposed.stops)}
      ${Co(o.boardings,t,$o(e.radius))}
    </dl>
    ${Ao(o.boardings)}

    ${n}

    ${Ys(e.population)}

    ${Bo(o,r,"Routes serving this spot")}`}function qs(e,t,{withKerb:n=!1,routes:o="off"}={}){let r=n?e.kerb??null:null,a=r?`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}`:`${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m`;return`
    <div class="place-head">
      <h2>${d(Ee(e))}</h2>
      <div class="muted">${a}</div>
    </div>
    ${r?Vs(r,t,{routes:o}):""}
    ${r?`<h3 class="scope-head">Within a ${e.radius} m walk</h3>
      <div class="scope-sub">The published unit: every stop a rider can walk
        to, on both networks, measured in the same circle.</div>`:""}
    ${Xt(e,t,js(e.oneseat??[],e.oneseat_day??"any"))}`}function Io(e,t={}){document.getElementById("panel").innerHTML=qs(e,qt,t)}var Xs={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Qs={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Zs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ei(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Qt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${To(t)}</div>`:""}function ti(e){let t=Qt("kept",e.kept)+Qt("lost",e.lost)+Qt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ni(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${We(e.current,e.proposed)}
    </div>`}function oi(e,t){let n=(e.oneseat??[]).filter(r=>r!==t&&r.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(r=>`
    <button class="os-other" data-goto-dest="${d(r.key)}">
      <span class="os-name">${d(r.name)}</span>
      <span class="os-status ${d(r.status)}">${ri[r.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var ri={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function ai(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Zs[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Uo(e,t,n){let o=ei(e,t);if(!o)return"";let r=e.oneseat_day??"any",a=o.status==="here"?"":ti(o)+ni(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(Ee(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${Xs[o.status]}</div>
    <p class="note">${Qs[o.status]} ${ai(r)}</p>

    ${a}

    ${oi(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Mo(e,n)}</summary>
      ${Xt(e,n)}
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
    </div>`}var Ve={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},me="change",q="change-dots",oe=["boolean",["feature-state","selected"],!1],Jo="#15181e",re=["==",["get","published"],0],Xe="newplace",si="#15181e",ii=5,qe=["==",["get","removed"],1],Qe="removedstop",De="change-removed",tn="change-removed-selected",Zt="removed-cross",Go="#e8232f";function li(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),r=t*.2;o.lineCap="round";for(let[a,s]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,Go]])o.lineWidth=a,o.strokeStyle=s,o.beginPath(),o.moveTo(r,r),o.lineTo(t-r,t-r),o.moveTo(t-r,r),o.lineTo(r,t-r),o.stroke();return o.getImageData(0,0,t,t)}var ze=null,V=new Set,N=new Set,ci=[q,tn,De],Ze=[q,De],et=q;function Wo(e,t){for(let n of ci)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function tt(){return ze}function Te(e){return V.has(e)}function Yo(e,t,n,o){return r=>pi(r,e,t,n,o)}function zo(e){return t=>e.has(pe(t))}function Vo(){return N}function qo(){return[...N].sort()}function Xo(){return N.size}function nn(e,t){let n=0;for(let o of t)N.has(o)||(N.add(o),Oe(e,o,!0),n++);return n}function Qo(e,t){N.delete(t)?Oe(e,t,!1):(N.add(t),Oe(e,t,!0))}function Zo(e,t){on(e),nn(e,t)}function on(e){for(let t of N)Oe(e,t,!1);N.clear()}function Oe(e,t,n){try{e.setFeatureState({source:me,id:t},{selected:n})}catch{}}function ui(e){for(let t of N)Oe(e,t,!0)}function di(e,t,n,o){let r=n*n;return o.filter(a=>(a.x-e)**2+(a.y-t)**2<=r).map(a=>a.id)}function rn(e,t,n,o){let r=[[t-o,n-o],[t+o,n+o]],a=[q,De].filter(i=>e.getLayer(i)),s=e.queryRenderedFeatures(r,{layers:a}).filter(i=>i.id!==void 0).map(i=>{let[u,p]=i.geometry.coordinates,m=e.project([u,p]);return{id:i.id,x:m.x,y:m.y}});return di(t,n,o,s)}function er(e,t,n,o){let r={};for(let a of n)r[a]=0;for(let a of e){if(!o(a)||O(a,Ke)===0||O(a,Re)===1)continue;let s=n[O(a,xe(t))];s!==void 0&&r[s]++}return r}function tr(e,t){let n=0;for(let o of e)t(o)&&O(o,Ke)===0&&n++;return n}function nr(e,t){let n=0;for(let o of e)t(o)&&O(o,Re)===1&&n++;return n}function pi(e,t,n,o,r){let a=O(e,0),s=O(e,1);return a>=n&&a<=r&&s>=t&&s<=o}function or(e,t,n,o){let r={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let a of n)r.riders[a]=0,r.measured[a]=0;for(let a of e){if(!o(a)||O(a,Ke)===0)continue;let s=n[O(a,xe(t))];if(s===void 0)continue;let i=mo(a,t),u=O(a,Re)===1;if(i===null){s!=="none"&&r.unmeasured++;continue}if(u){r.removedRiders+=i,r.removedMeasured++;continue}r.riders[s]+=i,r.measured[s]++}return r}function mi(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>E.some((o,r)=>t[O(n,xe(r))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:pe(n),published:n[2],removed:n[Re],name:n[po],moved:e.moved?.[pe(n)]??null,replacement:e.replacement?.[pe(n)]?.[0]??null,nearestStraight:e.replacement?.[pe(n)]?.[1]??null,...Object.fromEntries(E.flatMap((o,r)=>[[`b${r}`,t[O(n,xe(r))]],[`sc${r}`,n[co(r)]],[`sp${r}`,n[uo(r)]]]))}}))}}function rr(e,t){let n=Object.entries(Ve).flatMap(([o,r])=>[o,r[t]]);return["match",["get",`b${e}`],...n,Ve.none[t]]}function ar(e){return["case",re,"rgba(0,0,0,0)",rr(e,"color")]}function en(e){return["case",re,ii,rr(e,"size")]}function sr(e){return["interpolate",["linear"],["zoom"],9,["*",en(e),.45],12,en(e),16,["*",en(e),1.9]]}function ir(e){e.addSource(me,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:q,type:"circle",source:me,paint:{"circle-color":ar(0),"circle-radius":sr(0),"circle-opacity":.85,"circle-stroke-color":["case",oe,Jo,re,si,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",oe,1.6,re,.9,.5],12,["case",oe,2.4,re,1.5,1],16,["case",oe,3.2,re,2.2,1.6]]}},"walk-fill"),e.addLayer({id:tn,type:"circle",source:me,filter:qe,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":Jo,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",oe,1.6,0],12,["case",oe,2.4,0],16,["case",oe,3.2,0]]}},"walk-fill"),e.hasImage(Zt)||e.addImage(Zt,li(),{pixelRatio:2}),e.addLayer({id:De,type:"symbol",source:me,filter:qe,layout:{"icon-image":Zt,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function an(e,t,n){return ze=await ue(`/api/change?radius=${t}`),e.getSource(me).setData(mi(ze)),ui(e),sn(e,n),ze}function sn(e,t){let n=E.indexOf(t);e.setPaintProperty(q,"circle-color",ar(n)),e.setPaintProperty(q,"circle-radius",sr(n)),ln(e,t)}function lr(e,t,n){V.has(t)?V.delete(t):V.add(t),ln(e,n)}function cr(e,t){V.clear(),ln(e,t)}function ln(e,t){let n=E.indexOf(t),o=["none",...V],r=["case",re,!V.has(Xe),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(q,["all",["!",qe],r]);let a=["all",qe,!V.has(Qe)];e.setFilter(De,a),e.setFilter(tn,a)}function fi(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function cn(e,t,n,{pole:o=!0}={}){let r=E.indexOf(t),a=e[`b${r}`],s=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(b=>b.key===a)?.label??a,u=e[`sc${r}`],p=e[`sp${r}`],m=t==="weekday"?"weekday":t;return`${o?fi(e):""}${hi(e)}${u} \u2192 ${p} buses per ${m} at this stop<br>${s?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var gi=1.5,Ko=800;function hi(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??Ko,r=n!=null&&o>n*gi?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",a=t==null?`no other stop within a ${Ko} m walk${r}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${r}`;return`<b style="color:${Go}">Stop removed</b> \u2014 ${a}<br>`}var un="surface",ot="surface-fill",ur="#6b7280",dn=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,ur],[.138,ur],[1,"#bd60e7"],[2,"#961bed"]],C="#e8232f",A="#0f79c9",dr=2,nt=null,pr=!1;function rt(){return nt}function pn(){return pr}function mr(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-dr,Math.min(dr,n))}function fr(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function gr(e,t,n,o,r,a,s,i){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=s.lat0+(p[1]+.5)*s.dlat,b=s.lon0+(p[0]+.5)*s.dlon;if(m<o||m>a||b<n||b>r)continue;let L=p[Yt(t)],$=p[zt(t)],x=fr(L,$);if(x!=="none")if(x==="ramp"){let g=mr(L,$);u[g<-.138?"less":g>.138?"more":"same"]+=i}else u[x]+=i}return u}function yi(e){let{lat0:t,lon0:n,dlat:o,dlon:r}=e.origin;return{type:"FeatureCollection",features:e.cells.map(a=>{let s=t+a[1]*o,i=s+o,u=n+a[0]*r,p=u+r;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,s],[p,s],[p,i],[u,i],[u,s]]]},properties:Object.fromEntries(E.flatMap((m,b)=>{let L=a[Yt(b)],$=a[zt(b)];return[[`k${b}`,fr(L,$)],[`v${b}`,mr(L,$)??0]]}))}})}}function hr(e){return["case",["==",["get",`k${e}`],"gone"],C,["==",["get",`k${e}`],"new"],A,["interpolate",["linear"],["get",`v${e}`],...dn.flatMap(([t,n])=>[t,n])]]}function fe(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function yr(e,t){e.addSource(un,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ot,type:"fill",source:un,layout:{visibility:"none"},paint:{"fill-color":hr(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,fe(0,.85),13,fe(0,.62),16,fe(0,.45)]}},t)}async function mn(e,t,n){return nt=await ue(`/api/surface?radius=${t}`),e.getSource(un).setData(yi(nt)),fn(e,n),nt}function fn(e,t){let n=E.indexOf(t);e.setPaintProperty(ot,"fill-color",hr(n)),e.setPaintProperty(ot,"fill-opacity",["interpolate",["linear"],["zoom"],9,fe(n,.85),13,fe(n,.62),16,fe(n,.45)])}function br(e,t){pr=t,e.setLayoutProperty(ot,"visibility",t?"visible":"none")}var gn=null;function at(){return gn}async function hn(e){return gn=await ue(`/api/population?radius=${e}`),gn}function Sr(e,t,n,o,r,a,s){let i={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=s.lat0+(u[1]+.5)*s.dlat,m=s.lon0+(u[0]+.5)*s.dlon;p<o||p>a||m<n||m>r||(i.lost+=u[fo(t)],i.gained+=u[go(t)],i.kept+=u[ho(t)],i.none+=u[yo(t)])}return i}var yn="corridor",vr="corridor-lines",lt="#8b929c",bi="#6f7783",it={lost:C,added:A,kept:lt};var st=null,wr=!1;function ct(){return st}function bn(){return wr}function Si(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Lr(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function vi(){let e=t=>["match",["get","klass"],"lost",it.lost,"added",it.added,t];return["interpolate",["linear"],["zoom"],9,e(bi),14,e(lt)]}function wi(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Li(){return["match",["get","klass"],"kept",.85,.9]}function $r(e,t){e.addSource(yn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vr,type:"line",source:yn,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":vi(),"line-width":wi(),"line-opacity":Li()}},t)}async function Sn(e,t){return st=await R(`/api/corridors?day=${t}`),e.getSource(yn).setData(Si(st)),st}async function _r(e,t){E.includes(t)&&await Sn(e,t)}function xr(e,t){wr=t,e.setLayoutProperty(vr,"visibility",t?"visible":"none")}var wn="#2b3038",Rr="#b9bec6",Me={loses:{color:C,size:6},gains:{color:A,size:6},keeps:{color:lt,size:3},here:{color:wn,size:3.5},none:{color:Rr,size:1.8}},dt=["loses","gains","keeps","none","here"],vn="oneseat",kr="oneseat-dots",ut=null,Pr=!1;function ge(){return ut}function Ln(){return Pr}function Er(e,t,n,o,r,a){let s={};for(let i of t)s[i]=0;for(let i of e){let u=i[0],p=i[1];if(u<o||u>a||p<n||p>r)continue;let m=t[i[3]];m!==void 0&&s[m]++}return s}function $i(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function _i(){return["match",["get","status"],...Object.entries(Me).flatMap(([e,t])=>[e,t.color]),Rr]}function xi(){let e=["match",["get","status"],...Object.entries(Me).flatMap(([t,n])=>[t,n.size]),Me.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Or(e,t){e.addSource(vn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:kr,type:"circle",source:vn,layout:{visibility:"none"},paint:{"circle-color":_i(),"circle-radius":xi(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ri(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var ki="pin";function Dr(e){return"key"in e?e.key:ki}var pt="any";function Pi(e,t,n){return`radius=${e}&${Ri(t)}&day=${n}`}function Tr(e,t){return e?t:pt}function Mr(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function $n(e,t,n,o=pt){return ut=await R(`/api/oneseat?${Pi(t,n,o)}`),e.getSource(vn).setData($i(ut)),ut}function Cr(e,t){Pr=t,e.setLayoutProperty(kr,"visibility",t?"visible":"none")}function _n(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Ar(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),r=(e.proposed||"").split(";").filter(Boolean),a=i=>i.length?i.join(", "):"none",s=_n(t);return e.status==="here"?`<b>at ${s}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${s}<br>today: ${a(o)}<br>proposed: ${a(r)}`}var mt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},xn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Ei=new Set(["gone","new"]);function Oi(e,t,n){return Ei.has(e)?`${t} (${xn[n]})`:t}function Di(e){return e.buckets.filter(t=>t.key!=="none")}var Fr={area:"Ground",people:"People"};function Ti(e,t,n){let o=e.cell_m*e.cell_m/1e6,r=gr(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),a=s=>s.toFixed(s<10?1:0);return`
      <div class="lg-area">
        <span><b>${a(r.gone)}</b> km\xB2 lose all service</span>
        <span><b>${a(r.less)}</b> km\xB2 less</span>
        <span><b>${a(r.more)}</b> km\xB2 more</span>
        <span><b>${a(r.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Mi(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let r=Sr(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),a=s=>Math.round(s).toLocaleString();return`
      <div class="lg-area">
        <span><b>${a(r.lost)}</b> people lose all service</span>
        <span><b>${a(r.gained)}</b> gain service</span>
        <span><b>${a(r.kept)}</b> keep a bus</span>
        <span><b>${a(r.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Ci=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function Nr(e){let{layer:t,day:n,bounds:o,unit:r,population:a,scoped:s=!1,named:i=!1}=e,u=dn.map(([p,m])=>`${m} ${((p+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${u})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${C}"></i>loses all service
          (${xn[n]})</span>
        <span><i style="background:${A}"></i>new service
          (${xn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Fr).map(p=>`
          <button data-surface-unit="${p}" aria-pressed="${r===p}"
                  class="${r===p?"active":""}">${Fr[p]}</button>`).join("")}
      </div>
      ${s?Ci:r==="people"?Mi(n,o,a):Ti(t,n,o)}
    </div>`}var Ai=["lost","added","kept"],Fi={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Ni={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Br(e,t){let{lostPct:n,addedPct:o}=Lr(t.km),r=i=>i.toFixed(1),s=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${s}</b> km of street, citywide \u2014 ${Ni[t.day]}
    </div>
    ${Ai.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${it[i]}"></i>
        <span class="lg-lab">${d(Fi[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function Ir(e,t,n){let o=t.statuses.map(m=>m.key),r=Er(t.points,o,n.west,n.south,n.east,n.north),a=m=>t.statuses.find(b=>b.key===m)?.label??m,s=dt.reduce((m,b)=>m+(r[b]??0),0),i=_n(t),u=t.day&&t.day!==pt,p=u?`Restricted to routes running on ${mt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(i)}</b>
      <span class="muted">\xB7 ${s.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${mt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${dt.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${Me[m].color}"></i>
        <span class="lg-lab">${d(a(m))}</span>
        <span class="lg-n">${(r[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${dt.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(a(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(i)} without transferring?
      ${p} No frequency or travel time enters it: a surviving ride may
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
    <span class="pk-note">arrows: direction of travel</span>`:""}`}var Hr={locations:"Stops",riders:"Riders"};function Hi(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,a=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",s=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${a}${s}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Bi(e){if(!e)return"";let t=Te(Xe);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Xe}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Ii(e,t){if(!e)return"";let n=Te(Qe);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Qe}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Ui(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Bi(e)}
      ${Ii(t,n)}
    </div>`}function jr(e,t){let{layer:n,day:o,bounds:r,weight:a,surface:s,unit:i="area",population:u,selection:p,dots:m=!0}=t,b=n.buckets.map(v=>v.key),L=n.days.indexOf(o),{west:$,south:x,east:g,north:J}=r,z=Di(n),P=p&&p.size>0?p:null,Ue=P?zo(P):Yo($,x,g,J),eo=er(n.points,L,b,Ue),Ht=tr(n.points,Ue),Bt=nr(n.points,Ue),M=a==="riders"?or(n.points,L,b,Ue):null,ys=v=>M?M.measured[v]?Math.round(M.riders[v]).toLocaleString():"\u2014":eo[v].toLocaleString(),bs=M?M.removedMeasured?Math.round(M.removedRiders).toLocaleString():"\u2014":Bt.toLocaleString(),Ss=P?`at ${P.size.toLocaleString()} selected stop${P.size===1?"":"s"}`:"in view",to=z.reduce((v,It)=>v+eo[It.key],0)+Ht+Bt,vs=M?`<b>${Math.round(z.reduce((v,It)=>v+M.riders[It.key],0)+M.removedRiders).toLocaleString()}</b> daily boardings ${Ss}`:P?`<b>${to.toLocaleString()}</b>
         of ${P.size.toLocaleString()} selected stops`:`<b>${to.toLocaleString()}</b>
         stops in view`,ws=s?` \xB7 surface: ${n.radius} m walk`:"",Ls=!m&&!!s;e.innerHTML=Ls?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${mt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${Nr({layer:s,day:o,bounds:r,unit:i,population:u,scoped:!!P,named:!0})}`:`
    <div class="lg-head">
      ${vs}
      <span class="muted">\xB7 ${mt[o]}${ws}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Hr).map(v=>`
        <button data-weight="${v}" aria-pressed="${a===v}"
                class="${a===v?"active":""}">${Hr[v]}</button>`).join("")}
    </div>
    ${z.map(v=>`
      <button class="lg-row ${Te(v.key)?"off":""}" data-bucket="${d(v.key)}"
              aria-pressed="${!Te(v.key)}">
        <i style="background:${Ve[v.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(Oi(v.key,v.label,o))}</span>
        <span class="lg-n">${ys(v.key)}</span>
      </button>`).join("")}
    ${Ui(Ht,Bt,bs)}
    ${s?Nr({layer:s,day:o,bounds:r,unit:i,population:u,scoped:!!P}):""}
    ${M?Hi(M.unmeasured,Ht):""}
    ${P?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Rn="#4aa3ff",Vr="#ffa23a",kn="headline",ft="journey",ht="journey-rides",qr="journey-walks",ji=[ht,qr],Xr=null,Qr=!1;function yt(){return Xr}function Pn(){return Qr}function Ji(e,t){let n=e.radii[t],o=[];for(let r of["current","proposed"]){let a=n[r].itinerary;if(a)for(let s of a.legs){let i=s.from??e.origin,u=s.to??e.destination,p=[[i.lon,i.lat],[u.lon,u.lat]],m=s.path?.length?s.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:r,kind:s.kind,route:s.route}})}}return{type:"FeatureCollection",features:o}}function Jr(){return["match",["get","side"],"current",Rn,"proposed",Vr,Rn]}function Kr(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Zr(e,t){e.addSource(ft,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ht,type:"line",source:ft,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Jr(),"line-width":Kr(1),"line-opacity":.85}},t),e.addLayer({id:qr,type:"line",source:ft,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Jr(),"line-width":Kr(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ea(e,t){Qr=t;for(let n of ji)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function En(e,t){Xr=t;let n=t?Ji(t,kn):{type:"FeatureCollection",features:[]};e.getSource(ft).setData(n)}function ta(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Gr=e=>`${e.toFixed(1)} min`;function na(e){return e==null?"\u2014":e===0?"no change":e>0?`${Gr(e)} slower`:`${Gr(-e)} faster`}function Wr(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function Ki(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Wr(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Wr(e.to,"the destination")}</span></div>`}function Yr(e,t){let n=[],o=null;for(let r of e.legs){let a=o?Math.round(r.depart-o.arrive):0;a>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${a} min</span></div>`),n.push(Ki(r,t)),o=r}return n.join("")}var Gi={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function gt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Wi(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Yi(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${gt(t.current)} \u2192
        ${gt(t.proposed)} min</span>
        <span class="muted">${na(t.change_min)}</span></div>
      ${o}
    </div>`}function zr(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function On(e,t){let n=e.radii[kn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",r=`
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
        <p>${Gi[n.classification]??""}</p>
      </div>
      ${zr(e)}`:`${r}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${gt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${gt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${na(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Wi(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Yr(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Yr(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Yi(e)}
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
    </div>`}function ra(e){let t=e?e.radii[kn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Rn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Vr}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var vt="off",Ce="stoproutes",ia="stoproutes-lines",Tn="stoproutes-flow",la="stoproutes-arrows",zi=[ia,Tn,la],Dn="stoproutes-arrow",aa=3.5,ca=null,ua=!1;function Mn(){return ca}function da(){return ua}function Vi(e,t){let n=t==="current"?e.current:e.proposed,o=ke(n.map(a=>a.route));return{type:"FeatureCollection",features:n.map(a=>({type:"Feature",geometry:{type:"LineString",coordinates:a.points},properties:{side:t,route:a.route,name:a.name,pattern_id:a.pattern_id,color:o.get(a.route)}}))}}function qi(){return["interpolate",["linear"],["zoom"],9,aa*.6,14,aa]}function Xi(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d");o.fillStyle="#ffffff","filter"in o&&(o.filter=`blur(${Math.round(t*.06)}px)`);let r=t*.24;return o.beginPath(),o.moveTo(t-r,t/2),o.lineTo(r,r),o.lineTo(r,t-r),o.closePath(),o.fill(),o.getImageData(0,0,t,t)}function pa(e,t){e.addSource(Ce,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ia,type:"line",source:Ce,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":["get","color"],"line-width":qi(),"line-opacity":.85}},t),e.addLayer({id:Tn,type:"line",source:Ce,layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":"#ffffff","line-width":1.4,"line-opacity":.5,"line-dasharray":[0,3,4]}},t),e.hasImage(Dn)||e.addImage(Dn,Xi(),{pixelRatio:2,sdf:!0}),e.addLayer({id:la,type:"symbol",source:Ce,layout:{visibility:"none","symbol-placement":"line","symbol-spacing":90,"icon-image":Dn,"icon-size":["interpolate",["linear"],["zoom"],12,.55,16,.9],"icon-rotation-alignment":"map","icon-allow-overlap":!0,"icon-ignore-placement":!0},paint:{"icon-color":["get","color"]}},t)}function wt(e,t){ua=t;for(let n of zi)e.setLayoutProperty(n,"visibility",t?"visible":"none");t||ya()}function ye(e,t,n){ca=t;let o=t?Vi(t,n):{type:"FeatureCollection",features:[]};e.getSource(Ce).setData(o),t||ya()}function ma(e,t){return`/api/kerb_routes?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&day=${t}`}var Qi={current:"today",proposed:"proposed"};function fa(e){return`<i style="display:inline-block;width:9px;height:9px;border-radius:2px;vertical-align:baseline;background:${d(e.color)}"></i> <b>${d(e.route)}</b>${e.name?` \u2014 ${d(e.name)}`:""}<br><span style="opacity:.75">${Qi[e.side]}</span><br><span style="opacity:.6">arrows: direction of travel</span>`}var Zi=20;function el(e,t,n){let o=Math.max(1,Math.floor(n/2)),r=Math.max(1,n-o),a=[];for(let s=0;s<o;s++){let i=s/o*e;a.push([i,t,e-i])}for(let s=0;s<r;s++){let i=s/r*e;a.push([0,i,t,e-i])}return a}var sa=el(3,4,24),H=null,bt=0,St=0,he=null;function tl(){return typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}function Cn(e){he&&(H=requestAnimationFrame(Cn),!(e-St<1e3/Zi)&&(St=e,bt=(bt+1)%sa.length,he.setPaintProperty(Tn,"line-dasharray",sa[bt])))}function ga(){he&&(document.hidden?H!==null&&(cancelAnimationFrame(H),H=null):H===null&&(St=0,H=requestAnimationFrame(Cn)))}function ha(e){tl()||he||(he=e,bt=0,St=0,document.addEventListener("visibilitychange",ga),H=requestAnimationFrame(Cn))}function ya(){H!==null&&(cancelAnimationFrame(H),H=null),document.removeEventListener("visibilitychange",ga),he=null}var _t="places",va="places-points",An="places-boundaries",se="places-fill",Se="lost",nl=100,ol={lost:"share_lost",gained:"share_gained"};function Q(e,t){return`service_${e}_${t}`}var wa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},rl="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",ae={lost:C,gained:A},Lt=null,X=null,be=null,La=!1,$t=null;function Fn(){return Lt}function $a(){return X}function _a(){return $t}function Nn(){return be}function Ae(){return La}function al(e,t){let n=[...e];return t==="count"?n.sort((o,r)=>r.residents_lost-o.residents_lost):n.sort((o,r)=>(r.share_lost??-1)-(o.share_lost??-1))}function sl(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function il(e){return Math.max(e.residents_lost,e.residents_gained)}var ba=4,ll=16,cl=1e3;function ul(e){let t=Math.min(1,Math.sqrt(e/cl));return ba+t*(ll-ba)}function dl(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:sl(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:ul(il(t))}}))}}function pl(){return["match",["get","klass"],"lost",ae.lost,"gained",ae.gained,ae.lost]}function ml(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var G=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var W=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function xa(e,t){return e==="service"?["step",["abs",["coalesce",["get",Q(t,"pct")],0]],W[0].opacity,W[0].max,W[1].opacity,W[1].max,W[2].opacity,W[2].max,W[3].opacity]:["step",["coalesce",["get",ol[e]],0],G[0].opacity,Number.EPSILON,G[1].opacity,G[1].max,G[2].opacity,G[2].max,G[3].opacity,G[3].max,G[4].opacity]}function Ra(e,t){return e==="service"?["case",[">=",["coalesce",["get",Q(t,"pct")],0],0],A,C]:ae[e]}function fl(e,t){let n=Q(t,"now"),o=Q(t,"proposed");return e.features.filter(r=>r.properties[n]===0&&r.properties[o]>0).map(r=>r.properties.place)}var gl=3;function hl(e){if(e.length===0)return"";let t=e.slice(0,gl),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,r=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${r}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${r}.`}function ka(e,t){e.addSource(An,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:se,type:"fill",source:An,layout:{visibility:"none"},paint:{"fill-color":Ra(Se),"fill-opacity":xa(Se),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(_t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:va,type:"circle",source:_t,layout:{visibility:"none"},paint:{"circle-color":pl(),"circle-radius":ml(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function xt(e,t,n){e.setPaintProperty(se,"fill-color",Ra(t,n)),e.setPaintProperty(se,"fill-opacity",xa(t,n))}async function Pa(){return Lt||(Lt=await R("/api/places")),Lt}async function Ea(e){return be||(be=await R("/api/boundaries"),e.getSource(An).setData(be)),be}function yl(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Oa(e,t){let n=yl(be,t);if(n)return X=null,$t=n,e.getSource(_t)?.setData({type:"FeatureCollection",features:[]}),null;try{X=await R(`/api/places/${encodeURIComponent(t)}`)}catch{return X=null,$t=null,null}return $t=null,e.getSource(_t).setData(dl(X)),e.flyTo({center:[X.lon,X.lat],zoom:13}),X}function Da(e,t){La=t,e.setLayoutProperty(va,"visibility",t?"visible":"none"),e.setLayoutProperty(se,"visibility",t?"visible":"none")}function bl(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Sl="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ta(e,t,n,o){let r=al(e,t).map(a=>bl(a,a.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${rl}</p>
    ${o==="service"?`<p class="note">${Sl}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${r}</div>`}function Ma(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function vl(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function wl(e,t,n,o){let r=W.map((u,p)=>({band:u,prevMax:p===0?0:W[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=vl(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${A};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),a=o?fl(o,n):[],s=hl(a),i=s?`<div class="lg-foot">${d(s)}</div>`:"";return`
    ${Ma(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(wa[n])}</div>
    ${r}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Ca({selected:e,fill:t,day:n,boundaries:o,unchanged:r}){if(t==="service")return wl(e,r??null,n,o??null);let a=t==="lost"?"lose all buses":"gain a bus",s=G.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${ae[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(i.label)} of the place's own residents ${d(a)}</span>
    </div>`).join("");return`
    ${Ma(e,r??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(a)}</div>
    ${s}
    <div class="lg-row lg-static"><i style="background:${ae.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${ae.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Ll(e,t){let n=e[Q(t,"now")],o=e[Q(t,"proposed")],r=e[Q(t,"pct")],a=e[Q(t,"rail_proposed")],s=wa[t];if(o===0&&n>0)return`Loses all buses on ${s} (${n} \u2192 0 trips)${a?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${s} (0 \u2192 ${o} trips).`;let i=r==null?"\u2014":`${r>0?"+":""}${r.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${s} (${i}).`}function Aa(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${Ll(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let r=Sa("lose all buses",e.residents_lost,e.share_lost),a=e.residents_gained>0?Sa("gain a bus",e.residents_gained,e.share_gained):null,s=(t==="lost"?[r,a]:[a,r]).filter(i=>i!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${s.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Sa(e,t,n){let o=Math.round(t).toLocaleString(),r=n==null?`share withheld \u2014 under ${nl} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${r})`}var Hn=" \xB7 ",Bn={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Fa=Object.keys(Bn);function Na(e){return Bn[e]??e}var $l={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},_l=["oneseat","journey"],xl=["dots","both"],Rl={current:"routes today",proposed:"routes proposed"};function kl(e){return e!=="journey"}function Pl(e){let t=[Bn[e.view]??e.view];return e.view==="places"?t[0]:(_l.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":$l[e.day]),kl(e.view)&&t.push(`${e.radius} m walk`),e.stopRoutes!=="off"&&xl.includes(e.view)&&t.push(Rl[e.stopRoutes]),t.join(Hn))}function Ha(e){let[t,...n]=Pl(e).split(Hn);return`<b>${d(t)}</b>${n.map(o=>Hn+d(o)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",stopRoutes:"stoproutes"},El=/^[cp]:[\w.:-]{1,32}$/,Rt={any:"any",selected:"selected"},Ol="pin",Ba=5;function Ua(e){try{return e.self!==e.top}catch{return!0}}function ja(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?Rt.selected:Rt.any),t.set(h.dest,"key"in e.dest?e.dest.key:In(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,In(e.at)),e.camera&&t.set(h.camera,`${In(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==Se&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),t.set(h.stopRoutes,e.stopRoutes??vt),`?${t}`}function Ja(e){let t=new URLSearchParams(e),n={},o=t.get(h.view);o&&Fa.includes(o)&&(n.view=o);let r=t.get(h.day);r&&E.includes(r)&&(n.day=r);let a=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(a)&&a>0&&(n.radius=a),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let s=t.get(h.oneSeatDay);s===Rt.selected?n.oneSeatRestricted=!0:s===Rt.any&&(n.oneSeatRestricted=!1);let i=t.get(h.dest);if(i&&i!==Ol){let x=Ia(i);x?n.dest=x:i.includes(",")||(n.dest={key:i})}let u=Ia(t.get(h.at));u&&(n.at=u);let p=Dl(t.get(h.camera));p&&(n.camera=p);let m=t.get(h.place);m&&(n.place=m);let b=t.get(h.selection);b!==null&&(n.selection=b.split(",").filter(x=>El.test(x)));let L=t.get(h.placeFill);(L==="lost"||L==="gained"||L==="service")&&(n.placeFill=L);let $=t.get(h.stopRoutes);return($==="off"||$==="current"||$==="proposed")&&(n.stopRoutes=$),n}function In(e){return`${e.lat.toFixed(Ba)},${e.lon.toFixed(Ba)}`}function Ia(e){let t=Ka(e,2);return t?{lat:t[0],lon:t[1]}:null}function Dl(e){let t=Ka(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ka(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Un="embed";var Tl=["1","true","yes"];function Ga(e){let t=new URLSearchParams(e).get(Un);return t!==null&&Tl.includes(t.toLowerCase())}function Wa(e){let t=new URLSearchParams(e);return t.set(Un,"1"),`?${t}`}function Ya(e){let t=new URLSearchParams(e);t.delete(Un);let n=String(t);return n?`?${n}`:""}function za(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var Z=["peek","half","full"],Ml=192,Cl=.3,Al=.55,Fl=.9,Nl=.6,Hl=.45;function kt(e,t){return e==="peek"?Math.min(Ml,t*Cl):e==="half"?t*Al:t*Fl}function Bl(e,t,n=0){let o=Z.map(a=>Math.abs(kt(a,t)-e)),r=o.indexOf(Math.min(...o));return Math.abs(n)>Nl&&(r=Math.max(0,Math.min(Z.length-1,r+(n>0?1:-1)))),Z[r]}function Va(e){return Z[(Z.indexOf(e)+1)%Z.length]}function Il(e,t){return Math.min(e,t*Hl)}function ve(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function jn(e){let t=null,n=()=>{let o=ve();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Ul=8,jl=400;function qa(e){let t=l("side"),n=l("sheet-handle"),o="peek",r=!1,a=0,s=0,i=0,u={y:0,t:0};function p(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,Il(g,p()))}function b(g){o=g,t.dataset.snap=g,m(kt(g,p()))}n.addEventListener("pointerdown",g=>{ve()&&(r=!0,a=g.clientY,s=t.getBoundingClientRect().height,i=g.timeStamp,u={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!r)return;let J=s+(a-g.clientY),z=kt("peek",p()),P=kt("full",p());m(Math.max(z,Math.min(P,J))),u={y:g.clientY,t:g.timeStamp}});function L(g){if(!r)return;if(r=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-a)>Ul)&&g.timeStamp-i<jl){b(Va(o));return}let z=g.timeStamp-u.t,P=z>0?(u.y-g.clientY)/z:0;b(Bl(t.getBoundingClientRect().height,p(),P))}n.addEventListener("pointerup",L),n.addEventListener("pointercancel",L),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),ve()&&b(Va(o)))});let $=jn(e.onLayoutChange);function x(){if($(),!ve()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",x),x(),{at:()=>ve()?o:"full",atLeast(g){ve()&&Z.indexOf(g)>Z.indexOf(o)&&b(g)}}}var Jl=["llvmpipe","swiftshader","softpipe","basic render","software"];function Jn(e){if(!e)return!1;let t=e.toLowerCase();return Jl.some(n=>t.includes(n))}function Qa(e){let t=Jn(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function Za(e){return Jn(e.renderer)?0:Kl}var Kl=300,Gl="https://tiles.openfreemap.org/styles/positron",Wl=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],Xa=[],Yl=19,zl='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Vl=!1;function es(e){return!Vl||!Jn(e.renderer)?Gl:ql()}function ql(){let e=o=>({type:"raster",tileSize:256,attribution:zl,tiles:o,maxzoom:Yl}),t={basemap:e(Wl)},n=[{id:"basemap",type:"raster",source:"basemap"}];return Xa.length&&(t["basemap-labels"]=e(Xa),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function ts(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),r=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof r=="string"?r:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Xl(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function ns(e,t,n){let o=new Map(n.map(u=>[u.layer,u])),r=null,a="",s=u=>{a!==u&&(a=u,e.getCanvas().style.cursor=u)},i=()=>{r=null,s(""),t.remove()};return e.on("mousemove",u=>{let p=n.map(J=>J.layer).filter(J=>e.getLayer(J)&&e.getLayoutProperty(J,"visibility")!=="none");if(!p.length){i();return}let[m,...b]=e.queryRenderedFeatures(u.point,{layers:p});if(!m){i();return}s("pointer");let L=Xl(m);if(L===r)return;let $=o.get(m.layer?.id),x=$?$.html(m,b):null;if(x==null){r=null,t.remove();return}r=L;let g=$.anchor?$.anchor(m,u):u.lngLat;t.setLngLat(g).setHTML(x).addTo(e)}),e.on("mouseout",i),i}var Ql=[-79.9959,40.4406],Zl=12,ec="#e2574c",k={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",stopRoutes:"data-stop-routes"},Ne=Ja(location.search),Be=Ga(location.search);Be&&l("app").classList.add("embed");var tc={at:()=>"full",atLeast(){}},ss=null,D=400,Fe=null,y=null,te=null,ce=0,_={key:"downtown"},ie=null,is=!1,$e=!1,At="locations",_e="area",j=vt,Kn=0;function Et(){return j==="off"?"current":j}var ls="count",Mt=null,B=Se,I=!1,f="dots",cs,zn=[],os=()=>{},Gn=ts(),c=new maplibregl.Map({container:"map",style:es(Gn),pixelRatio:Qa(Gn),fadeDuration:Za(Gn),renderWorldCopies:!1,center:Ne.camera?[Ne.camera.lon,Ne.camera.lat]:Ql,zoom:Ne.camera?.zoom??Zl,cooperativeGestures:Ua(window),attributionControl:{compact:!0}});c.addControl(new maplibregl.NavigationControl,"top-right");c.on("load",()=>{ao(c),ir(c),yr(c,et),$r(c,et),Or(c,"walk-fill"),Zr(c),pa(c,ht),ka(c,et),F(),c.on("click",t=>{if(I)return;if(is){He({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(f==="places"){let a=c.queryRenderedFeatures(t.point,{layers:[se]})[0];a&&Ot(a.properties.key);return}let n=[...Ze,"oneseat-dots"].filter(a=>c.getLayoutProperty(a,"visibility")!=="none"),o=c.queryRenderedFeatures(t.point,{layers:n})[0],r=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Zn(r[1],r[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});os=ns(c,e,[...so(t=>{let n=tt(),o=t.find(r=>Ze.includes(r.layer?.id));return n&&o?cn(o.properties,w(),n.buckets,{pole:!1}):null}),...Ze.map(t=>({layer:t,html:n=>{let o=tt();return o?cn(n.properties,w(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=ge();return n?Ar(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:"stoproutes-lines",html:t=>fa(t.properties)},{layer:se,html:t=>Aa(t.properties,B,w())}]),hc(),c.on("moveend",()=>{let t=c.getCenter();ss={lat:t.lat,lon:t.lng,zoom:c.getZoom()},S(),U()}),le(k.radius,t=>{D=Number(t.dataset.radius),an(c,D,w()).then(S),rt()&&mn(c,D,w()).then(S),at()&&hn(D).then(S),ge()&&Dt(),y&&we(y.lat,y.lon)}),le(k.day,t=>{let n=t.dataset.day;Eo(n),f!=="journey"&&F(),sn(c,n),Ct(),fn(c,n),f==="journey"&&y&&Vn(y.lat,y.lon),ct()&&_r(c,n).then(S),$e&&ge()&&(Dt(),y&&we(y.lat,y.lon)),Ae()&&B==="service"&&xt(c,B,n),S()}),le(k.oneSeatDay,t=>{$e=t.dataset.oneseatDay==="selected",Yn(),Dt(),y&&we(y.lat,y.lon)}),le(k.view,t=>{let n=f;f=t.dataset.view,os(),Wo(c,f==="dots"||f==="both"),ic(f==="surface"||f==="both"),cc(f==="corridors"),mc(f==="oneseat"),pc(f==="journey",n==="journey"),uc(f==="places"),f!=="journey"&&n!=="journey"&&(f==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),dc(Kt(f)),ms();let o=f==="oneseat"||f==="journey";l("dest-controls").classList.toggle("hidden",!o),l("oneseat-day-controls").classList.toggle("hidden",f!=="oneseat"),l("place-fill-controls").classList.toggle("hidden",f!=="places"),gs(),Y()||rs(!1),Le(),Yn(),o||Tt(!1),ds()}),le(k.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Tt(!0);return}Tt(!1),He({key:n})}),le(k.placeFill,t=>{B=t.dataset.placeFill,Ae()&&xt(c,B,w()),F(),S(),Yn()}),le(k.stopRoutes,t=>{let n=t.dataset.stopRoutes,o=j!=="off"&&Mn()!==null;j=n,F(),o&&n!=="off"?(ye(c,Mn(),n),T&&Qn(T.radius)):Ct()}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){At=n.dataset.weight,S(),U();return}let o=t.target.closest("[data-surface-unit]");if(o){_e=o.dataset.surfaceUnit,lc(_e),U();return}let r=t.target.closest("[data-bucket]");r&&(lr(c,r.dataset.bucket,w()),S())}),l("legend-reset").addEventListener("click",()=>{cr(c,w()),S()}),l("legend-select").addEventListener("click",()=>rs(!I)),l("legend-clear").addEventListener("click",()=>{on(c),Le(),S(),U()}),l("legend-collapse").addEventListener("click",()=>{Wn(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&He({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Sc(o.dataset.caveat);let r=t.target.closest("[data-select-place]");r&&Ot(r.dataset.selectPlace);let a=t.target.closest("[data-sort-places]");a&&(ls=a.dataset.sortPlaces,F());let s=t.target.closest("[data-goto-place]");s&&(f!=="places"&&ee(k.view,"places"),Ot(s.dataset.gotoPlace))}),l("side-toggle").addEventListener("click",ac),Be&&jn(Wn),cs=Be?tc:qa({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),c.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Wn}),oc(),Nt(),Le(),Ft(),nc(Ne),an(c,D,w()).then(S),bc(),yc()});function le(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(r=>r.classList.toggle("active",r===o)),t(o),Nt(),U()})})}function ee(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function nc(e){e.radius!==void 0&&ee(k.radius,String(e.radius)),e.day&&ee(k.day,e.day),e.oneSeatRestricted!==void 0&&ee(k.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(At=e.weight),e.surfaceUnit&&(_e=e.surfaceUnit),e.placeFill&&ee(k.placeFill,e.placeFill),e.dest&&("key"in e.dest?ee(k.dest,e.dest.key):He(e.dest)),e.selection&&Zo(c,e.selection),e.stopRoutes&&ee(k.stopRoutes,e.stopRoutes),e.view&&ee(k.view,e.view),e.at&&Zn(e.at.lat,e.at.lon),e.place&&Ot(e.place)}function U(){let e={view:f,day:w(),radius:D,oneSeatRestricted:$e,weight:At,surfaceUnit:_e,dest:_,at:y,camera:ss,place:Mt,placeFill:B,selection:qo(),stopRoutes:j},t=ja(e);history.replaceState(null,"",(Be?Wa(t):t)+location.hash),Ft(t)}function Ft(e=Ya(location.search)){if(!Be)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=y?te?Ee(te):"this point":null;t.querySelector(".el-action").textContent=za(n)}function Nt(){l("statebar").innerHTML=Ha({view:f,day:w(),radius:D,oneSeatRestricted:$e,destination:Ie(),stopRoutes:j}),rc()}function Wn(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function oc(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function rc(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(Na(f)))}function ac(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),c.resize()}function S(){sc()}function sc(){if(l("legend-reset").classList.toggle("hidden",bn()||Ln()||Pn()||Ae()||!Y()),Pn()){l("legend").innerHTML=ra(yt());return}if(Ae()){l("legend").innerHTML=Ca({selected:$a(),fill:B,day:w(),boundaries:Nn(),unchanged:_a()});return}if(bn()){let n=ct();n&&Br(l("legend"),n);return}if(Ln()){let n=ge();if(!n)return;let o=c.getBounds();Ir(l("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=tt();if(!e)return;let t=c.getBounds();jr(l("legend"),{layer:e,day:w(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:At,dots:Y(),surface:pn()?rt():null,unit:_e,population:at(),selection:Vo()})}async function ic(e){if(e&&!rt()){l("legend").classList.add("loading");try{await mn(c,D,w())}finally{l("legend").classList.remove("loading")}}br(c,e),e&&_e==="people"&&await us(),S()}async function us(){if(!at()){l("legend").classList.add("loading");try{await hn(D)}finally{l("legend").classList.remove("loading")}}}async function lc(e){e==="people"&&pn()&&await us(),S()}async function cc(e){if(e&&!ct()){l("legend").classList.add("loading");try{await Sn(c,w())}finally{l("legend").classList.remove("loading")}}xr(c,e),S()}async function uc(e){if(e&&(!Fn()||!Nn())){l("legend").classList.add("loading");try{await Promise.all([Pa(),Ea(c)])}finally{l("legend").classList.remove("loading")}}Da(c,e),e&&xt(c,B,w()),e&&F(),S()}async function Ot(e){Mt=await Xn(()=>Oa(c,e))?e:null,f==="places"&&(F(),Mt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),S(),U()}function dc(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),Ft(),f==="places"){l("panel").innerHTML=Ta(Fn()??[],ls,Mt,B);return}if(!te){f==="oneseat"?l("panel").innerHTML=jo(Ie()):Oo(l("panel"));return}if(f==="oneseat"){let t=Uo(te,_,w());if(t){l("panel").innerHTML=t;return}}Io(te,{withKerb:Y(),routes:j})}function pc(e,t=!1){if(ea(c,e),S(),!e){t&&(y?we(y.lat,y.lon):F());return}yt()&&y?l("panel").innerHTML=On(yt(),Ie()):l("panel").innerHTML=oa(Ie())}async function Vn(e,t){let n=++ce;y={lat:e,lon:t},U(),fs(e,t);let o=ps(),r=d(Ie());if(!o){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${r} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${r}, at two transfer distances. A few seconds.</p></div>`;try{let a=await R(ta({lat:e,lon:t},o,w()));if(n!==ce)return;En(c,a),l("panel").innerHTML=On(a,r),S(),Ft()}catch(a){if(n!==ce)return;En(c,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}}function Yn(){l("day-controls").classList.toggle("hidden",!Mr(f,$e,B))}function qn(){return Tr($e,w())}async function mc(e){e&&!ge()&&await Xn(()=>$n(c,D,_,qn())),Cr(c,e),S()}async function Dt(){await Xn(()=>$n(c,D,_,qn())),S()}async function Xn(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function He(e){if(_=e,Tt(!1),fc(),ds(),Nt(),U(),f==="journey"){y&&Vn(y.lat,y.lon),S();return}y?we(y.lat,y.lon):F({scrollToTop:!0}),Dt()}function ds(){let e=ps();if(!(e!==null&&(f==="journey"||f==="oneseat"&&"lat"in _))){ie?.remove(),ie=null;return}ie?ie.setLngLat([e.lon,e.lat]).addTo(c):(ie=new maplibregl.Marker({color:wn,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(c),ie.on("dragend",()=>{let n=ie.getLngLat();He({lat:n.lat,lon:n.lng})}))}function fc(){let e=Dr(_);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function ps(){if("lat"in _)return{lat:_.lat,lon:_.lon};let e=_.key,t=zn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Ie(){if("lat"in _)return`${_.lat.toFixed(4)}, ${_.lon.toFixed(4)}`;let e=_.key;return zn.find(t=>t.key===e)?.name??e}function Tt(e){is=e,c.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function we(e,t){let n=++ce;y={lat:e,lon:t},U(),l("panel").classList.add("loading"),fs(e,t),Gt(c),ye(c,null,Et()),l("pin-key").classList.add("hidden");try{let o="lat"in _?`&dest_lat=${_.lat.toFixed(6)}&dest_lon=${_.lon.toFixed(6)}`:"",r=await R(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${D}${o}&oneseat_day=${qn()}`);if(n!==ce)return;T={lat:e,lon:t,radius:D,now:r.current.stops,proposed:r.proposed.stops},te=r,gs(),ms(),F({scrollToTop:!0})}catch(o){if(n!==ce)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ce&&l("panel").classList.remove("loading")}}var T=null;function ms(){if(!T||!Kt(f)){Gt(c),l("pin-key").classList.add("hidden"),Ct();return}io(c,T.lat,T.lon,T.radius,T.now,T.proposed),Qn(T.radius),Ct()}function Ct(){let e=++Kn,t=()=>{T&&Qn(T.radius)};j!=="off"&&Y()&&y&&te?.kerb?R(ma(y,w())).then(n=>{e===Kn&&(ye(c,n,Et()),wt(c,!0),ha(c),t())}).catch(()=>{e===Kn&&(ye(c,null,Et()),wt(c,!1),t())}):(ye(c,null,Et()),wt(c,!1),t())}function Qn(e){l("pin-key").innerHTML=Ur(e,{routes:j!=="off"&&da()?j:!1}),l("pin-key").classList.remove("hidden")}function fs(e,t){Fe?Fe.setLngLat([t,e]):(Fe=new maplibregl.Marker({color:ec,draggable:!0}).setLngLat([t,e]).addTo(c),Fe.on("dragend",()=>{let n=Fe.getLngLat();Zn(n.lat,n.lng)}))}var Pt=14;function Y(){return f==="dots"||f==="both"}function rs(e){I=e&&Y(),I?c.dragPan.disable():c.dragPan.enable(),c.getCanvas().style.cursor=I?"none":"",I||hs(),Le()}function gs(){let e=Y()&&!!te?.kerb;l("stop-routes-controls").classList.toggle("hidden",!e)}function Le(){let e=l("legend-select");e.classList.toggle("hidden",!Y()),e.setAttribute("aria-pressed",String(I)),e.textContent=I?"Selecting":"Select stops",l("legend-clear").classList.toggle("hidden",!Y()||!Xo())}function gc(e,t){let n=l("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!I}function as(e){l("brush").classList.toggle("painting",e)}function hs(){l("brush").hidden=!0}function hc(){let e=l("brush");e.style.width=`${Pt*2}px`,e.style.height=`${Pt*2}px`;let t=!1,n=!1,o=!1,r=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,Le(),S()}))},a=()=>{I&&(t=!0,n=!1,as(!0))},s=u=>{if(gc(u.point.x,u.point.y),!t)return;n=!0,nn(c,rn(c,u.point.x,u.point.y,Pt))&&r()},i=u=>{if(as(!1),!!t){if(t=!1,!n){let[p]=rn(c,u.point.x,u.point.y,Pt);p&&Qo(c,p)}Le(),S(),U()}};c.on("mousedown",a),c.on("mousemove",s),c.on("mouseup",i),c.getCanvas().addEventListener("mouseleave",hs),c.on("touchstart",a),c.on("touchmove",s),c.on("touchend",i)}function Zn(e,t){if(cs.atLeast("half"),f==="journey"){Vn(e,t);return}f!=="places"&&we(e,t)}async function yc(){try{zn=await R("/api/destinations"),Nt()}catch{}}async function bc(){try{let e=await R("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Sc(e){l("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
