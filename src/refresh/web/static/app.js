"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function ne(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function $t(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function kt(e){return e>0?`+${e}`:String(e)}function On(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var gs="#15181e",Dn="#ffa23a",hs="#ffffff";function ys(e,t,n,o=96){let a=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let u=i/o*2*Math.PI;a.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function G(e){return{type:"FeatureCollection",features:e}}function fs(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function bs(e){let t=e.side==="current"?"today":"proposed",n=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"";return`<b>${e.name}</b><br>${t} \xB7 stop ${e.stop_id}${n}`}function En(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Tn(e){e.addSource("walk",{type:"geojson",data:G([])}),e.addSource("stops-now",{type:"geojson",data:G([])}),e.addSource("stops-prop",{type:"geojson",data:G([])}),e.addSource("stop-moves",{type:"geojson",data:G([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Dn,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":hs,"circle-stroke-width":3,"circle-stroke-color":Dn}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":gs,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(bs(s)).addTo(e)})}function Cn(e,t,n,o,a,s){e.getSource("walk").setData(G([ys(t,n,o)])),e.getSource("stops-now").setData(G(En(a,"current"))),e.getSource("stops-prop").setData(G(En(s,"proposed"))),e.getSource("stop-moves").setData(G(fs(s)))}var R=["weekday","saturday","sunday"],_t=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Mn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ce=4,Me=5,An=e=>Me+Ce*e,Fn=e=>Me+1+Ce*e,ye=e=>Me+2+Ce*e,vs=e=>Me+3+Ce*e,Ae=2,ws=3,fe=4,be=e=>e[ws],O=(e,t)=>e[t],Nn=(e,t)=>e[vs(t)],xt=e=>2+2*e,Pt=e=>3+2*e,Fe=4,Hn=e=>2+Fe*e,Bn=e=>3+Fe*e,In=e=>4+Fe*e,jn=e=>5+Fe*e;var Ot="weekday";function L(){return Ot}function Vn(e){Ot=e}function Kn(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
         the view chosen in the toolbar on the map. Pan and zoom to read a
         neighbourhood.</p>
      <p><b>Stop-by-stop</b> draws one dot per place a bus stops today, coloured
         by what the plan does to the buses within a short walk. Each dot says
         one thing: either the plan takes this stop away \u2014 a red cross, on
         every day of the week \u2014 or the stop stays and the colour tells you
         what the buses near it do. A hollow ring is a place the plan puts a
         stop where none stands today. To see what a crossed-out stop leaves
         behind, read the dots around it. Its key counts
         those places, or \u2014 on the Riders setting \u2014 the boardings PRT records
         at them, which is the same map read as who is affected rather than
         where. Boardings exist only where a bus stops today, so that reading
         can weigh what is at risk and never what is gained.
         <b>Surface</b> measures that same walk-access comparison at every
         point on a 100 m grid, so it can also show ground the plan adds a bus
         to \u2014 but it is extent, not people: a hillside counts like a city
         block.</p>
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
    </div>`}function Ss(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Ls(e,t){let n=Math.max(1,..._t.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return _t.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,r=s-a,i=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${Mn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${r===0?"\xB7":kt(r)}</td>
      </tr>`}).join("")}function Wn(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Un(e){return e.first==null?'<span class="muted">no service</span>':`${ne(e.first)}\u2013${ne(e.last)}`}function Jn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var $s={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},ks={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function _s(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Be(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(o.name)}</span>
          <span class="os-status ${p(o.status)}">${$s[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${ks[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${He("one-seat")}</p>
    </div>`:""}function He(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ne(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function Gn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Yn(e){return e.first==null||e.last==null?null:e.last-e.first}function Be(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${zn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${zn(t,n,"prop")}</div>
    </div>`}function zn(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${p(o)}</span>`).join(" "):'<span class="muted">none</span>'}var Rt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,xs="Allegheny";function ve(e){let t=e.place?.muni?.trim()??"",n=Rt.exec(t)?.[1],o=n===xs?t.replace(Rt,""):n?`${t.replace(Rt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Dt(e){return e==="weekday"?"weekday":e}function qn(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Dt(t)}`}function Ps(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds where none stands within 150 m</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Rs(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",r=[a,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${r}</div></dd>`}function Os(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Dt(t)}, today only</span>`}${o}</dd>`}function Ds(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${He("boardings")}</p>`}function Es(e){if(!e)return"";let t=p(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose all buses
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains all buses under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in
        <button type="button" class="place-link" data-goto-place="${p(e.key)}">${t}</button>
      </h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${He("place-population")}</p>
    </div>`}function Et(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,r=s>0?"up":s<0?"down":"flat",i=Jn(o),u=Jn(a),d=Yn(o),m=Yn(a);return`
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${o.trips}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${a.trips}</div>
      </div>
      <div class="hl-delta ${r}">
        ${s===0?"no change":`${kt(s)} trips`}
        <div class="muted">${On(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Dt(t)}, both directions</div>

    <div class="tiers">${Ss(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Ls(o,a)}</tbody>
    </table>
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
      <dt>First and last</dt>
      ${Ne(Un(o),Un(a))}
      <dt>Hours between</dt>
      ${Ne($t(d),$t(m),Gn(d,m,"more"))}
      <dt>Typical wait</dt>
      ${Ne(i==null?"\u2014":`${i} min`,u==null?"\u2014":`${u} min`,Gn(i,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Ne(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Rs(e.current.stops)}
      ${Ps(e.proposed.stops)}
      ${Os(o.boardings,t)}
    </dl>
    ${Ds(o.boardings)}

    ${n}

    ${Es(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Be(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${He("location-not-route")}</p>
    </div>`}function Xn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${p(ve(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Et(e,Ot,_s(e.oneseat??[],e.oneseat_day??"any"))}`}var Ts={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Cs={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Ms={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function As(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Tt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Wn(t)}</div>`:""}function Fs(e){let t=Tt("kept",e.kept)+Tt("lost",e.lost)+Tt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Ns(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Be(e.current,e.proposed)}
    </div>`}function Hs(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${p(a.key)}">
      <span class="os-name">${p(a.name)}</span>
      <span class="os-status ${p(a.status)}">${Bs[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Bs={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Is(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Ms[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Qn(e,t,n){let o=As(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":Fs(o)+Ns(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${p(o.name)}</h2>
      <div class="muted">
        from ${p(ve(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${p(o.status)}">${Ts[o.status]}</div>
    <p class="note">${Cs[o.status]} ${Is(a)}</p>

    ${s}

    ${Hs(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${qn(e,n)}</summary>
      ${Et(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Zn(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${p(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var je={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},oe="change",z="change-dots",q=["boolean",["feature-state","selected"],!1],eo="#15181e",X=["==",["get","published"],0],Je="newplace",js="#15181e",Us=5,Ue=["==",["get","removed"],1],Ge="removedstop",Se="change-removed",At="change-removed-selected",Ct="removed-cross",no="#e8232f";function Js(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[s,r]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,no]])o.lineWidth=s,o.strokeStyle=r,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var Ie=null,Y=new Set,M=new Set,Gs=[z,At,Se],Ft=[z,Se],Ye=z;function oo(e,t){for(let n of Gs)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Nt(){return Ie}function Le(e){return Y.has(e)}function ao(e,t,n,o){return a=>Vs(a,e,t,n,o)}function so(e){return t=>e.has(be(t))}function ro(){return M}function io(){return[...M].sort()}function lo(){return M.size}function Ht(e,t){let n=0;for(let o of t)M.has(o)||(M.add(o),we(e,o,!0),n++);return n}function co(e,t){M.delete(t)?we(e,t,!1):(M.add(t),we(e,t,!0))}function uo(e,t){Bt(e),Ht(e,t)}function Bt(e){for(let t of M)we(e,t,!1);M.clear()}function we(e,t,n){try{e.setFeatureState({source:oe,id:t},{selected:n})}catch{}}function Ys(e){for(let t of M)we(e,t,!0)}function zs(e,t,n,o){let a=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=a).map(s=>s.id)}function It(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],s=[z,Se].filter(i=>e.getLayer(i)),r=e.queryRenderedFeatures(a,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[u,d]=i.geometry.coordinates,m=e.project([u,d]);return{id:i.id,x:m.x,y:m.y}});return zs(t,n,o,r)}function po(e,t,n,o){let a={};for(let s of n)a[s]=0;for(let s of e){if(!o(s)||O(s,Ae)===0||O(s,fe)===1)continue;let r=n[O(s,ye(t))];r!==void 0&&a[r]++}return a}function mo(e,t){let n=0;for(let o of e)t(o)&&O(o,Ae)===0&&n++;return n}function go(e,t){let n=0;for(let o of e)t(o)&&O(o,fe)===1&&n++;return n}function Vs(e,t,n,o,a){let s=O(e,0),r=O(e,1);return s>=n&&s<=a&&r>=t&&r<=o}function ho(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)a.riders[s]=0,a.measured[s]=0;for(let s of e){if(!o(s)||O(s,Ae)===0)continue;let r=n[O(s,ye(t))];if(r===void 0)continue;let i=Nn(s,t),u=O(s,fe)===1;if(i===null){r!=="none"&&a.unmeasured++;continue}if(u){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[r]+=i,a.measured[r]++}return a}function Ks(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>R.some((o,a)=>t[O(n,ye(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:be(n),published:n[2],removed:n[fe],replacement:e.replacement?.[be(n)]?.[0]??null,nearestStraight:e.replacement?.[be(n)]?.[1]??null,...Object.fromEntries(R.flatMap((o,a)=>[[`b${a}`,t[O(n,ye(a))]],[`c${a}`,n[An(a)]],[`p${a}`,n[Fn(a)]]]))}}))}}function yo(e,t){let n=Object.entries(je).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,je.none[t]]}function fo(e){return["case",X,"rgba(0,0,0,0)",yo(e,"color")]}function Mt(e){return["case",X,Us,yo(e,"size")]}function bo(e){return["interpolate",["linear"],["zoom"],9,["*",Mt(e),.45],12,Mt(e),16,["*",Mt(e),1.9]]}function vo(e){e.addSource(oe,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:z,type:"circle",source:oe,paint:{"circle-color":fo(0),"circle-radius":bo(0),"circle-opacity":.85,"circle-stroke-color":["case",q,eo,X,js,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",q,1.6,X,.9,.5],12,["case",q,2.4,X,1.5,1],16,["case",q,3.2,X,2.2,1.6]]}},"walk-fill"),e.addLayer({id:At,type:"circle",source:oe,filter:Ue,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":eo,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",q,1.6,0],12,["case",q,2.4,0],16,["case",q,3.2,0]]}},"walk-fill"),e.hasImage(Ct)||e.addImage(Ct,Js(),{pixelRatio:2}),e.addLayer({id:Se,type:"symbol",source:oe,filter:Ue,layout:{"icon-image":Ct,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function jt(e,t,n){return Ie=await S(`/api/change?radius=${t}`),e.getSource(oe).setData(Ks(Ie)),Ys(e),Ut(e,n),Ie}function Ut(e,t){let n=R.indexOf(t);e.setPaintProperty(z,"circle-color",fo(n)),e.setPaintProperty(z,"circle-radius",bo(n)),Jt(e,t)}function wo(e,t,n){Y.has(t)?Y.delete(t):Y.add(t),Jt(e,n)}function So(e,t){Y.clear(),Jt(e,t)}function Jt(e,t){let n=R.indexOf(t),o=["none",...Y],a=["case",X,!Y.has(Je),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(z,["all",["!",Ue],a]);let s=["all",Ue,!Y.has(Ge)];e.setFilter(Se,s),e.setFilter(At,s)}function Lo(e,t,n){let o=R.indexOf(t),a=e[`b${o}`],s=e.removed===1,r=e.published===0?"the plan adds a stop here":n.find(b=>b.key===a)?.label??a,i=e[`c${o}`],u=e[`p${o}`],d=t==="weekday"?"weekday":t,m=e.published===0||s?" within a walk":"";return`${s?"":`<b>${r}</b><br>`}${qs(e)}${i} \u2192 ${u} buses per ${d}${m}<br><span style="opacity:.6">click for the full comparison</span>`}var Ws=1.5,to=800;function qs(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??to,a=n!=null&&o>n*Ws?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${to} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${no}">Stop removed</b> \u2014 ${s}<br>`}var Gt="surface",Ve="surface-fill",$o="#6b7280",Yt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,$o],[.138,$o],[1,"#bd60e7"],[2,"#961bed"]],T="#e8232f",C="#0f79c9",ko=2,ze=null,_o=!1;function Ke(){return ze}function zt(){return _o}function xo(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-ko,Math.min(ko,n))}function Po(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Ro(e,t,n,o,a,s,r,i){let u={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let m=r.lat0+(d[1]+.5)*r.dlat,b=r.lon0+(d[0]+.5)*r.dlon;if(m<o||m>s||b<n||b>a)continue;let k=d[xt(t)],_=d[Pt(t)],U=Po(k,_);if(U!=="none")if(U==="ramp"){let h=xo(k,_);u[h<-.138?"less":h>.138?"more":"same"]+=i}else u[U]+=i}return u}function Xs(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*o,i=r+o,u=n+s[0]*a,d=u+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[d,r],[d,i],[u,i],[u,r]]]},properties:Object.fromEntries(R.flatMap((m,b)=>{let k=s[xt(b)],_=s[Pt(b)];return[[`k${b}`,Po(k,_)],[`v${b}`,xo(k,_)??0]]}))}})}}function Oo(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Yt.flatMap(([t,n])=>[t,n])]]}function ae(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Do(e,t){e.addSource(Gt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ve,type:"fill",source:Gt,layout:{visibility:"none"},paint:{"fill-color":Oo(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,ae(0,.85),13,ae(0,.62),16,ae(0,.45)]}},t)}async function Vt(e,t,n){return ze=await S(`/api/surface?radius=${t}`),e.getSource(Gt).setData(Xs(ze)),Kt(e,n),ze}function Kt(e,t){let n=R.indexOf(t);e.setPaintProperty(Ve,"fill-color",Oo(n)),e.setPaintProperty(Ve,"fill-opacity",["interpolate",["linear"],["zoom"],9,ae(n,.85),13,ae(n,.62),16,ae(n,.45)])}function Eo(e,t){_o=t,e.setLayoutProperty(Ve,"visibility",t?"visible":"none")}var Wt=null;function We(){return Wt}async function qt(e){return Wt=await S(`/api/population?radius=${e}`),Wt}function To(e,t,n,o,a,s,r){let i={lost:0,gained:0,kept:0,none:0};for(let u of e){let d=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;d<o||d>s||m<n||m>a||(i.lost+=u[Hn(t)],i.gained+=u[Bn(t)],i.kept+=u[In(t)],i.none+=u[jn(t)])}return i}var Xt="corridor",Co="corridor-lines",Qe="#8b929c",Qs="#6f7783",Xe={lost:T,added:C,kept:Qe};var qe=null,Mo=!1;function Ze(){return qe}function Qt(){return Mo}function Zs(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Ao(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function er(){let e=t=>["match",["get","klass"],"lost",Xe.lost,"added",Xe.added,t];return["interpolate",["linear"],["zoom"],9,e(Qs),14,e(Qe)]}function tr(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function nr(){return["match",["get","klass"],"kept",.85,.9]}function Fo(e,t){e.addSource(Xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Co,type:"line",source:Xt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":er(),"line-width":tr(),"line-opacity":nr()}},t)}async function Zt(e,t){return qe=await S(`/api/corridors?day=${t}`),e.getSource(Xt).setData(Zs(qe)),qe}async function No(e,t){R.includes(t)&&await Zt(e,t)}function Ho(e,t){Mo=t,e.setLayoutProperty(Co,"visibility",t?"visible":"none")}var tn="#2b3038",Bo="#b9bec6",$e={loses:{color:T,size:6},gains:{color:C,size:6},keeps:{color:Qe,size:3},here:{color:tn,size:3.5},none:{color:Bo,size:1.8}},tt=["loses","gains","keeps","none","here"],en="oneseat",Io="oneseat-dots",et=null,jo=!1;function se(){return et}function nn(){return jo}function Uo(e,t,n,o,a,s){let r={};for(let i of t)r[i]=0;for(let i of e){let u=i[0],d=i[1];if(u<o||u>s||d<n||d>a)continue;let m=t[i[3]];m!==void 0&&r[m]++}return r}function or(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function ar(){return["match",["get","status"],...Object.entries($e).flatMap(([e,t])=>[e,t.color]),Bo]}function sr(){let e=["match",["get","status"],...Object.entries($e).flatMap(([t,n])=>[t,n.size]),$e.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Jo(e,t){e.addSource(en,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Io,type:"circle",source:en,layout:{visibility:"none"},paint:{"circle-color":ar(),"circle-radius":sr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function rr(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var ir="pin";function Go(e){return"key"in e?e.key:ir}var nt="any";function lr(e,t,n){return`radius=${e}&${rr(t)}&day=${n}`}function Yo(e,t){return e?t:nt}function zo(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function on(e,t,n,o=nt){return et=await S(`/api/oneseat?${lr(t,n,o)}`),e.getSource(en).setData(or(et)),et}function Vo(e,t){jo=t,e.setLayoutProperty(Io,"visibility",t?"visible":"none")}function an(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Ko(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",r=an(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var ot={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},sn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},cr=new Set(["gone","new"]);function ur(e,t,n){return cr.has(e)?`${t} (${sn[n]})`:t}function dr(e){return e.buckets.filter(t=>t.key!=="none")}var Wo={area:"Ground",people:"People"};function pr(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Ro(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function mr(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=To(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(a.lost)}</b> people lose all service</span>
        <span><b>${s(a.gained)}</b> gain service</span>
        <span><b>${s(a.kept)}</b> keep a bus</span>
        <span><b>${s(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var gr=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function qo(e){let{layer:t,day:n,bounds:o,unit:a,population:s,scoped:r=!1,named:i=!1}=e,u=Yt.map(([d,m])=>`${m} ${((d+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${u})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service
          (${sn[n]})</span>
        <span><i style="background:${C}"></i>new service
          (${sn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Wo).map(d=>`
          <button data-surface-unit="${d}" aria-pressed="${a===d}"
                  class="${a===d?"active":""}">${Wo[d]}</button>`).join("")}
      </div>
      ${r?gr:a==="people"?mr(n,o,s):pr(t,n,o)}
    </div>`}var hr=["lost","added","kept"],yr={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},fr={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Qo(e,t){let{lostPct:n,addedPct:o}=Ao(t.km),a=i=>i.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${fr[t.day]}
    </div>
    ${hr.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${Xe[i]}"></i>
        <span class="lg-lab">${p(yr[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function Zo(e,t,n){let o=t.statuses.map(m=>m.key),a=Uo(t.points,o,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(b=>b.key===m)?.label??m,r=tt.reduce((m,b)=>m+(a[b]??0),0),i=an(t),u=t.day&&t.day!==nt,d=u?`Restricted to routes running on ${ot[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(i)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${ot[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${tt.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${$e[m].color}"></i>
        <span class="lg-lab">${p(s(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${tt.map(m=>`${(t.counts[m]??0).toLocaleString()} ${p(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${p(i)} without transferring?
      ${d} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function ea(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Xo={locations:"Locations",riders:"Riders"};function br(e,t){let o=`${t.toLocaleString()} location${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a stop where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",r=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${r}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function vr(){return`<div class="lg-foot">Dots mark today's stops, plus the places the plan
    puts a stop where none stands within 150 m. A stop the plan takes away is
    drawn as a cross instead of a colour \u2014 for what the buses near it do, read
    the dots around it. A stop added right beside an existing one changes a
    dot's colour rather than adding one; Streets colours the pavement itself,
    and shows the rest.</div>`}function wr(e){return e?`<div class="lg-foot">A removed stop is not the same as a corner
    losing its bus: countywide, of the 972 stops the plan removes, 245 have
    another stop within a 400 m walk and 193 more within 800 m. The remaining
    534 have none.</div>`:""}function Sr(e){if(!e)return"";let t=Le(Je);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Je}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Lr(e,t){if(!e)return"";let n=Le(Ge);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Ge}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function $r(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Sr(e)}
      ${Lr(t,n)}
    </div>`}function ta(e,t){let{layer:n,day:o,bounds:a,weight:s,surface:r,unit:i="area",population:u,selection:d,dots:m=!0}=t,b=n.buckets.map(w=>w.key),k=n.days.indexOf(o),{west:_,south:U,east:h,north:De}=a,J=dr(n),x=d&&d.size>0?d:null,Ee=x?so(x):ao(_,U,h,De),Pn=po(n.points,k,b,Ee),St=mo(n.points,Ee),Te=go(n.points,Ee),E=s==="riders"?ho(n.points,k,b,Ee):null,cs=w=>E?E.measured[w]?Math.round(E.riders[w]).toLocaleString():"\u2014":Pn[w].toLocaleString(),us=E?E.removedMeasured?Math.round(E.removedRiders).toLocaleString():"\u2014":Te.toLocaleString(),ds=x?`at ${x.size.toLocaleString()} selected stop${x.size===1?"":"s"}`:"in view",Rn=J.reduce((w,Lt)=>w+Pn[Lt.key],0)+St+Te,ps=E?`<b>${Math.round(J.reduce((w,Lt)=>w+E.riders[Lt.key],0)+E.removedRiders).toLocaleString()}</b> daily boardings ${ds}`:x?`<b>${Rn.toLocaleString()}</b>
         of ${x.size.toLocaleString()} selected stops`:`<b>${Rn.toLocaleString()}</b>
         locations in view`,ms=!m&&!!r;e.innerHTML=ms?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${ot[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${qo({layer:r,day:o,bounds:a,unit:i,population:u,scoped:!!x,named:!0})}`:`
    <div class="lg-head">
      ${ps}
      <span class="muted">\xB7 ${ot[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Xo).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${Xo[w]}</button>`).join("")}
    </div>
    ${J.map(w=>`
      <button class="lg-row ${Le(w.key)?"off":""}" data-bucket="${p(w.key)}"
              aria-pressed="${!Le(w.key)}">
        <i style="background:${je[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(ur(w.key,w.label,o))}</span>
        <span class="lg-n">${cs(w.key)}</span>
      </button>`).join("")}
    ${$r(St,Te,us)}
    ${r?qo({layer:r,day:o,bounds:a,unit:i,population:u,scoped:!!x}):""}
    ${E?br(E.unmeasured,St):`
    <div class="lg-foot">Buses per day within the walk radius, both
      directions \u2014 counting locations, not riders.</div>`}
    ${vr()}
    ${wr(Te)}
    ${x?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var rn="#4aa3ff",la="#ffa23a",ln="headline",at="journey",ca="journey-rides",ua="journey-walks",kr=[ca,ua],da=null,pa=!1;function rt(){return da}function cn(){return pa}function _r(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let r of s.legs){let i=r.from??e.origin,u=r.to??e.destination,d=[[i.lon,i.lat],[u.lon,u.lat]],m=r.path?.length?r.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:o}}function na(){return["match",["get","side"],"current",rn,"proposed",la,rn]}function oa(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function ma(e,t){e.addSource(at,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ca,type:"line",source:at,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":na(),"line-width":oa(1),"line-opacity":.85}},t),e.addLayer({id:ua,type:"line",source:at,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":na(),"line-width":oa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ga(e,t){pa=t;for(let n of kr)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function un(e,t){da=t;let n=t?_r(t,ln):{type:"FeatureCollection",features:[]};e.getSource(at).setData(n)}function ha(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var aa=e=>`${e.toFixed(1)} min`;function ya(e){return e==null?"\u2014":e===0?"no change":e>0?`${aa(e)} slower`:`${aa(-e)} faster`}function sa(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function xr(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=sa(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${sa(e.to,"the destination")}</span></div>`}function ra(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(xr(a,t)),o=a}return n.join("")}var Pr={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function st(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Rr(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Or(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${st(t.current)} \u2192
        ${st(t.proposed)} min</span>
        <span class="muted">${ya(t.change_min)}</span></div>
      ${o}
    </div>`}function ia(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function dn(e,t){let n=e.radii[ln],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${p(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${ne(e.window.start_min)}
        and ${ne(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Pr[n.classification]??""}</p>
      </div>
      ${ia(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${st(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${st(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${ya(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Rr(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ra(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ra(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Or(e)}
    ${ia(e)}`}function fa(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${p(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function ba(e){let t=e?e.radii[ln].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${rn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${la}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var ct="places",Sa="places-points",pn="places-boundaries",A="places-fill",ie="lost",Dr=100,Er={lost:"share_lost",gained:"share_gained"};function K(e,t){return`service_${e}_${t}`}var La={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Tr="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Q={lost:T,gained:C},it=null,V=null,re=null,$a=!1,lt=null;function mn(){return it}function ka(){return V}function _a(){return lt}function gn(){return re}function ke(){return $a}function Cr(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function Mr(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Ar(e){return Math.max(e.residents_lost,e.residents_gained)}var va=4,Fr=16,Nr=1e3;function Hr(e){let t=Math.min(1,Math.sqrt(e/Nr));return va+t*(Fr-va)}function Br(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Mr(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Hr(Ar(t))}}))}}function Ir(){return["match",["get","klass"],"lost",Q.lost,"gained",Q.gained,Q.lost]}function jr(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var I=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var j=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function xa(e,t){return e==="service"?["step",["abs",["coalesce",["get",K(t,"pct")],0]],j[0].opacity,j[0].max,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity]:["step",["coalesce",["get",Er[e]],0],I[0].opacity,Number.EPSILON,I[1].opacity,I[1].max,I[2].opacity,I[2].max,I[3].opacity,I[3].max,I[4].opacity]}function Pa(e,t){return e==="service"?["case",[">=",["coalesce",["get",K(t,"pct")],0],0],C,T]:Q[e]}function Ur(e,t){let n=K(t,"now"),o=K(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var Jr=3;function Gr(e){if(e.length===0)return"";let t=e.slice(0,Jr),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function Ra(e,t){e.addSource(pn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:A,type:"fill",source:pn,layout:{visibility:"none"},paint:{"fill-color":Pa(ie),"fill-opacity":xa(ie),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(ct,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Sa,type:"circle",source:ct,layout:{visibility:"none"},paint:{"circle-color":Ir(),"circle-radius":jr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function ut(e,t,n){e.setPaintProperty(A,"fill-color",Pa(t,n)),e.setPaintProperty(A,"fill-opacity",xa(t,n))}async function Oa(){return it||(it=await S("/api/places")),it}async function Da(e){return re||(re=await S("/api/boundaries"),e.getSource(pn).setData(re)),re}function Yr(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Ea(e,t){let n=Yr(re,t);if(n)return V=null,lt=n,e.getSource(ct)?.setData({type:"FeatureCollection",features:[]}),null;try{V=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return V=null,lt=null,null}return lt=null,e.getSource(ct).setData(Br(V)),e.flyTo({center:[V.lon,V.lat],zoom:13}),V}function Ta(e,t){$a=t,e.setLayoutProperty(Sa,"visibility",t?"visible":"none"),e.setLayoutProperty(A,"visibility",t?"visible":"none")}function zr(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${p(e.key)}">
      <span class="place-name">${p(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Vr="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ca(e,t,n,o){let a=Cr(e,t).map(s=>zr(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Tr}</p>
    ${o==="service"?`<p class="note">${Vr}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Ma(e,t){return e?`<div class="lg-head"><b>${p(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${p(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Kr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Wr(e,t,n,o){let a=j.map((u,d)=>({band:u,prevMax:d===0?0:j[d-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:d})=>{let m=Kr(u,d);return[`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} more trips</span></div>`]}).join(""),s=o?Ur(o,n):[],r=Gr(s),i=r?`<div class="lg-foot">${p(r)}</div>`:"";return`
    ${Ma(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${p(La[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Aa({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return Wr(e,a??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",r=I.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${Q[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${p(i.label)} of the place's own residents ${p(s)}</span>
    </div>`).join("");return`
    ${Ma(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${p(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Q.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Q.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function qr(e,t){let n=e[K(t,"now")],o=e[K(t,"proposed")],a=e[K(t,"pct")],s=e[K(t,"rail_proposed")],r=La[t];if(o===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${r} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${r} (${i}).`}function Fa(e,t,n){if(t==="service")return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      ${qr(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=wa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?wa("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[a,s]:[s,a]).filter(i=>i!==null);return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function wa(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Dr} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var hn=" \xB7 ",yn={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Na=Object.keys(yn);function Ha(e){return yn[e]??e}var Xr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Qr=["oneseat","journey"];function Zr(e){return e!=="journey"}function ei(e){let t=[yn[e.view]??e.view];return e.view==="places"?t[0]:(Qr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Xr[e.day]),Zr(e.view)&&t.push(`${e.radius} m walk`),t.join(hn))}function Ba(e){let[t,...n]=ei(e).split(hn);return`<b>${p(t)}</b>${n.map(o=>hn+p(o)).join("")}`}var y={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},ti=/^[cp]:[\w.:-]{1,32}$/,dt={any:"any",selected:"selected"},ni="pin",Ia=5;function Ua(e){try{return e.self!==e.top}catch{return!0}}function Ja(e){let t=new URLSearchParams;return t.set(y.view,e.view),t.set(y.day,e.day),t.set(y.radius,String(e.radius)),t.set(y.oneSeatDay,e.oneSeatRestricted?dt.selected:dt.any),t.set(y.dest,"key"in e.dest?e.dest.key:fn(e.dest)),e.weight==="riders"&&t.set(y.weight,e.weight),e.surfaceUnit==="people"&&t.set(y.surfaceUnit,e.surfaceUnit),e.at&&t.set(y.at,fn(e.at)),e.camera&&t.set(y.camera,`${fn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(y.place,e.place),e.placeFill!==ie&&t.set(y.placeFill,e.placeFill),e.selection.length&&t.set(y.selection,e.selection.join(",")),`?${t}`}function Ga(e){let t=new URLSearchParams(e),n={},o=t.get(y.view);o&&Na.includes(o)&&(n.view=o);let a=t.get(y.day);a&&R.includes(a)&&(n.day=a);let s=Number(t.get(y.radius));t.has(y.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(y.weight)==="riders"?n.weight="riders":t.get(y.weight)==="locations"&&(n.weight="locations"),t.get(y.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(y.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(y.oneSeatDay);r===dt.selected?n.oneSeatRestricted=!0:r===dt.any&&(n.oneSeatRestricted=!1);let i=t.get(y.dest);if(i&&i!==ni){let _=ja(i);_?n.dest=_:i.includes(",")||(n.dest={key:i})}let u=ja(t.get(y.at));u&&(n.at=u);let d=oi(t.get(y.camera));d&&(n.camera=d);let m=t.get(y.place);m&&(n.place=m);let b=t.get(y.selection);b!==null&&(n.selection=b.split(",").filter(_=>ti.test(_)));let k=t.get(y.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function fn(e){return`${e.lat.toFixed(Ia)},${e.lon.toFixed(Ia)}`}function ja(e){let t=Ya(e,2);return t?{lat:t[0],lon:t[1]}:null}function oi(e){let t=Ya(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ya(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var bn="embed";var ai=["1","true","yes"];function za(e){let t=new URLSearchParams(e).get(bn);return t!==null&&ai.includes(t.toLowerCase())}function Va(e){let t=new URLSearchParams(e);return t.set(bn,"1"),`?${t}`}function Ka(e){let t=new URLSearchParams(e);t.delete(bn);let n=String(t);return n?`?${n}`:""}function Wa(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var W=["peek","half","full"],si=192,ri=.3,ii=.55,li=.9,ci=.6,ui=.45;function pt(e,t){return e==="peek"?Math.min(si,t*ri):e==="half"?t*ii:t*li}function di(e,t,n=0){let o=W.map(s=>Math.abs(pt(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>ci&&(a=Math.max(0,Math.min(W.length-1,a+(n>0?1:-1)))),W[a]}function qa(e){return W[(W.indexOf(e)+1)%W.length]}function pi(e,t){return Math.min(e,t*ui)}function le(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function vn(e){let t=null,n=()=>{let o=le();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var mi=8,gi=400;function Xa(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,s=0,r=0,i=0,u={y:0,t:0};function d(){return window.innerHeight}function m(h){t.style.height=`${h}px`,e.onMove(h,pi(h,d()))}function b(h){o=h,t.dataset.snap=h,m(pt(h,d()))}n.addEventListener("pointerdown",h=>{le()&&(a=!0,s=h.clientY,r=t.getBoundingClientRect().height,i=h.timeStamp,u={y:h.clientY,t:h.timeStamp},t.classList.add("dragging"),n.setPointerCapture(h.pointerId))}),n.addEventListener("pointermove",h=>{if(!a)return;let De=r+(s-h.clientY),J=pt("peek",d()),x=pt("full",d());m(Math.max(J,Math.min(x,De))),u={y:h.clientY,t:h.timeStamp}});function k(h){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(h.clientY-s)>mi)&&h.timeStamp-i<gi){b(qa(o));return}let J=h.timeStamp-u.t,x=J>0?(u.y-h.clientY)/J:0;b(di(t.getBoundingClientRect().height,d(),x))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",h=>{h.key!=="Enter"&&h.key!==" "||(h.preventDefault(),le()&&b(qa(o)))});let _=vn(e.onLayoutChange);function U(){if(_(),!le()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",U),U(),{at:()=>le()?o:"full",atLeast(h){le()&&W.indexOf(h)>W.indexOf(o)&&b(h)}}}var hi=[-79.9959,40.4406],yi=12,fi="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},xe=Ga(location.search),Re=za(location.search);Re&&c("app").classList.add("embed");var bi={at:()=>"full",atLeast(){}},es=null,P=400,_e=null,f=null,ue=null,te=0,$={key:"downtown"},Z=null,ts=!1,me=!1,bt="locations",ge="area",ns="count",ft=null,F=ie,H=!1,g="dots",os,Ln=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:xe.camera?[xe.camera.lon,xe.camera.lat]:hi,zoom:xe.camera?.zoom??yi,cooperativeGestures:Ua(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{Tn(l),vo(l),Do(l,Ye),Fo(l,Ye),Jo(l,"walk-fill"),ma(l),Ra(l,Ye),N(),l.on("click",t=>{if(H)return;if(ts){Pe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=l.queryRenderedFeatures(t.point,{layers:[A]})[0];s&&gt(s.properties.key);return}let n=[...Ft,"oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];xn(a[1],a[0])}),l.on("mouseenter",A,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",A,()=>{l.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});for(let t of Ft)l.on("mouseenter",t,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",t,()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove",t,n=>{let o=n.features?.[0],a=Nt();!o||!a||e.setLngLat(o.geometry.coordinates).setHTML(Lo(o.properties,L(),a.buckets)).addTo(l)});l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=se();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Ko(n.properties,o)).addTo(l)}),l.on("mouseleave",A,()=>e.remove()),l.on("mousemove",A,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(Fa(n.properties,F,L())).addTo(l)}),Mi(),l.on("moveend",()=>{let t=l.getCenter();es={lat:t.lat,lon:t.lng,zoom:l.getZoom()},v(),B()}),ce(D.radius,t=>{P=Number(t.dataset.radius),jt(l,P,L()).then(v),Ke()&&Vt(l,P,L()).then(v),We()&&qt(P).then(v),se()&&ht(),f&&de(f.lat,f.lon)}),ce(D.day,t=>{let n=t.dataset.day;Vn(n),g!=="journey"&&N(),Ut(l,n),Kt(l,n),g==="journey"&&f&&$n(f.lat,f.lon),Ze()&&No(l,n).then(v),me&&se()&&(ht(),f&&de(f.lat,f.lon)),ke()&&F==="service"&&ut(l,F,n),v()}),ce(D.oneSeatDay,t=>{me=t.dataset.oneseatDay==="selected",Sn(),ht(),f&&de(f.lat,f.lon)}),ce(D.view,t=>{let n=g;g=t.dataset.view,e.remove(),oo(l,g==="dots"||g==="both"),ki(g==="surface"||g==="both"),xi(g==="corridors"),Di(g==="oneseat"),Oi(g==="journey",n==="journey"),Pi(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),Ri(g!=="corridors"&&g!=="journey"&&g!=="places");let o=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),he()||Qa(!1),pe(),Sn(),o||yt(!1),ss()}),ce(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){yt(!0);return}yt(!1),Pe({key:n})}),ce(D.placeFill,t=>{F=t.dataset.placeFill,ke()&&ut(l,F,L()),N(),v(),Sn()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){bt=n.dataset.weight,v(),B();return}let o=t.target.closest("[data-surface-unit]");if(o){ge=o.dataset.surfaceUnit,_i(ge),B();return}let a=t.target.closest("[data-bucket]");a&&(wo(l,a.dataset.bucket,L()),v())}),c("legend-reset").addEventListener("click",()=>{So(l,L()),v()}),c("legend-select").addEventListener("click",()=>Qa(!H)),c("legend-clear").addEventListener("click",()=>{Bt(l),pe(),v(),B()}),c("legend-collapse").addEventListener("click",()=>{wn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Pe({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Ni(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&gt(a.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(ns=s.dataset.sortPlaces,N());let r=t.target.closest("[data-goto-place]");r&&(g!=="places"&&ee(D.view,"places"),gt(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Li),Re&&vn(wn),os=Re?bi:Xa({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:wn}),wi(),wt(),pe(),vt(),vi(xe)||jt(l,P,L()).then(v),Fi(),Ai()});function ce(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),wt(),B()})})}function ee(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function vi(e){let t=!1;return e.radius!==void 0&&(t=ee(D.radius,String(e.radius))||t),e.day&&(t=ee(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&ee(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(bt=e.weight),e.surfaceUnit&&(ge=e.surfaceUnit),e.placeFill&&ee(D.placeFill,e.placeFill),e.dest&&("key"in e.dest?ee(D.dest,e.dest.key):Pe(e.dest)),e.selection&&uo(l,e.selection),e.view&&ee(D.view,e.view),e.at&&xn(e.at.lat,e.at.lon),e.place&&gt(e.place),t}function B(){let e={view:g,day:L(),radius:P,oneSeatRestricted:me,weight:bt,surfaceUnit:ge,dest:$,at:f,camera:es,place:ft,placeFill:F,selection:io()},t=Ja(e);history.replaceState(null,"",(Re?Va(t):t)+location.hash),vt(t)}function vt(e=Ka(location.search)){if(!Re)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?ue?ve(ue):"this point":null;t.querySelector(".el-action").textContent=Wa(n)}function wt(){c("statebar").innerHTML=Ba({view:g,day:L(),radius:P,oneSeatRestricted:me,destination:Oe()}),Si()}function wn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function wi(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Si(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Ha(g)))}function Li(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function v(){$i()}function $i(){if(c("legend-reset").classList.toggle("hidden",Qt()||nn()||cn()||ke()||!he()),cn()){c("legend").innerHTML=ba(rt());return}if(ke()){c("legend").innerHTML=Aa({selected:ka(),fill:F,day:L(),boundaries:gn(),unchanged:_a()});return}if(Qt()){let n=Ze();n&&Qo(c("legend"),n);return}if(nn()){let n=se();if(!n)return;let o=l.getBounds();Zo(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Nt();if(!e)return;let t=l.getBounds();ta(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:bt,dots:he(),surface:zt()?Ke():null,unit:ge,population:We(),selection:ro()})}async function ki(e){if(e&&!Ke()){c("legend").classList.add("loading");try{await Vt(l,P,L())}finally{c("legend").classList.remove("loading")}}Eo(l,e),e&&ge==="people"&&await as(),v()}async function as(){if(!We()){c("legend").classList.add("loading");try{await qt(P)}finally{c("legend").classList.remove("loading")}}}async function _i(e){e==="people"&&zt()&&await as(),v()}async function xi(e){if(e&&!Ze()){c("legend").classList.add("loading");try{await Zt(l,L())}finally{c("legend").classList.remove("loading")}}Ho(l,e),v()}async function Pi(e){if(e&&(!mn()||!gn())){c("legend").classList.add("loading");try{await Promise.all([Oa(),Da(l)])}finally{c("legend").classList.remove("loading")}}Ta(l,e),e&&ut(l,F,L()),e&&N(),v()}async function gt(e){ft=await _n(()=>Ea(l,e))?e:null,g==="places"&&(N(),ft&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),B()}function Ri(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),vt(),g==="places"){c("panel").innerHTML=Ca(mn()??[],ns,ft,F);return}if(!ue){g==="oneseat"?c("panel").innerHTML=Zn(Oe()):Kn(c("panel"));return}if(g==="oneseat"){let t=Qn(ue,$,L());if(t){c("panel").innerHTML=t;return}}Xn(ue)}function Oi(e,t=!1){if(ga(l,e),v(),!e){t&&(f?de(f.lat,f.lon):N());return}rt()&&f?c("panel").innerHTML=dn(rt(),Oe()):c("panel").innerHTML=fa(Oe())}async function $n(e,t){let n=++te;f={lat:e,lon:t},B(),is(e,t);let o=rs(),a=p(Oe());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(ha({lat:e,lon:t},o,L()));if(n!==te)return;un(l,s),c("panel").innerHTML=dn(s,a),v(),vt()}catch(s){if(n!==te)return;un(l,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Sn(){c("day-controls").classList.toggle("hidden",!zo(g,me,F))}function kn(){return Yo(me,L())}async function Di(e){e&&!se()&&await _n(()=>on(l,P,$,kn())),Vo(l,e),v()}async function ht(){await _n(()=>on(l,P,$,kn())),v()}async function _n(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Pe(e){if($=e,yt(!1),Ei(),ss(),wt(),B(),g==="journey"){f&&$n(f.lat,f.lon),v();return}f?de(f.lat,f.lon):N({scrollToTop:!0}),ht()}function ss(){let e=rs();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in $))){Z?.remove(),Z=null;return}Z?Z.setLngLat([e.lon,e.lat]).addTo(l):(Z=new maplibregl.Marker({color:tn,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),Z.on("dragend",()=>{let n=Z.getLngLat();Pe({lat:n.lat,lon:n.lng})}))}function Ei(){let e=Go($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function rs(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=Ln.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Oe(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return Ln.find(t=>t.key===e)?.name??e}function yt(e){ts=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function de(e,t){let n=++te;f={lat:e,lon:t},B(),c("panel").classList.add("loading"),is(e,t);try{let o="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",a=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${o}&oneseat_day=${kn()}`);if(n!==te)return;Cn(l,e,t,P,a.current.stops,a.proposed.stops),Ti(),ue=a,N({scrollToTop:!0})}catch(o){if(n!==te)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===te&&c("panel").classList.remove("loading")}}function Ti(){c("pin-key").innerHTML=ea(P),c("pin-key").classList.remove("hidden")}function is(e,t){_e?_e.setLngLat([t,e]):(_e=new maplibregl.Marker({color:fi,draggable:!0}).setLngLat([t,e]).addTo(l),_e.on("dragend",()=>{let n=_e.getLngLat();xn(n.lat,n.lng)}))}var mt=14;function he(){return g==="dots"||g==="both"}function Qa(e){H=e&&he(),H?l.dragPan.disable():l.dragPan.enable(),l.getCanvas().style.cursor=H?"none":"",H||ls(),pe()}function pe(){let e=c("legend-select");e.classList.toggle("hidden",!he()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!he()||!lo())}function Ci(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function Za(e){c("brush").classList.toggle("painting",e)}function ls(){c("brush").hidden=!0}function Mi(){let e=c("brush");e.style.width=`${mt*2}px`,e.style.height=`${mt*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,pe(),v()}))},s=()=>{H&&(t=!0,n=!1,Za(!0))},r=u=>{if(Ci(u.point.x,u.point.y),!t)return;n=!0,Ht(l,It(l,u.point.x,u.point.y,mt))&&a()},i=u=>{if(Za(!1),!!t){if(t=!1,!n){let[d]=It(l,u.point.x,u.point.y,mt);d&&co(l,d)}pe(),v(),B()}};l.on("mousedown",s),l.on("mousemove",r),l.on("mouseup",i),l.getCanvas().addEventListener("mouseleave",ls),l.on("touchstart",s),l.on("touchmove",r),l.on("touchend",i)}function xn(e,t){if(os.atLeast("half"),g==="journey"){$n(e,t);return}g!=="places"&&de(e,t)}async function Ai(){try{Ln=await S("/api/destinations"),wt()}catch{}}async function Fi(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Ni(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
