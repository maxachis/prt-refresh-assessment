"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function oe(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function St(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Lt(e){return e>0?`+${e}`:String(e)}function Rn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var ds="#15181e",Dn="#ffa23a",ps="#ffffff";function ms(e,t,n,o=96){let a=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let u=i/o*2*Math.PI;a.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function G(e){return{type:"FeatureCollection",features:e}}function gs(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function hs(e){let t=e.side==="current"?"today":"proposed",n=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"";return`<b>${e.name}</b><br>${t} \xB7 stop ${e.stop_id} \xB7 ${e.metres} m${n}`}function On(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function En(e){e.addSource("walk",{type:"geojson",data:G([])}),e.addSource("stops-now",{type:"geojson",data:G([])}),e.addSource("stops-prop",{type:"geojson",data:G([])}),e.addSource("stop-moves",{type:"geojson",data:G([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Dn,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":ps,"circle-stroke-width":3,"circle-stroke-color":Dn}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":ds,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(hs(s)).addTo(e)})}function Tn(e,t,n,o,a,s){e.getSource("walk").setData(G([ms(t,n,o)])),e.getSource("stops-now").setData(G(On(a,"current"))),e.getSource("stops-prop").setData(G(On(s,"proposed"))),e.getSource("stop-moves").setData(G(gs(s)))}var R=["weekday","saturday","sunday"],$t=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Cn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ee=4,Te=5,Mn=e=>Te+Ee*e,An=e=>Te+1+Ee*e,ye=e=>Te+2+Ee*e,ys=e=>Te+3+Ee*e,Ce=2,fs=3,fe=4,be=e=>e[fs],D=(e,t)=>e[t],Fn=(e,t)=>e[ys(t)],kt=e=>2+2*e,_t=e=>3+2*e,Me=4,Nn=e=>2+Me*e,Hn=e=>3+Me*e,Bn=e=>4+Me*e,In=e=>5+Me*e;var Pt="weekday";function L(){return Pt}function zn(e){Pt=e}function Vn(e){e.innerHTML=`
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
    </div>`}function bs(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function vs(e,t){let n=Math.max(1,...$t.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return $t.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,r=s-a,i=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${Cn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${r===0?"\xB7":Lt(r)}</td>
      </tr>`}).join("")}function Kn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function jn(e){return e.first==null?'<span class="muted">no service</span>':`${oe(e.first)}\u2013${oe(e.last)}`}function Un(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var ws={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Ss={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ls(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Ne(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${ws[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Ss[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Fe("one-seat")}</p>
    </div>`:""}function Fe(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ae(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function Jn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Gn(e){return e.first==null||e.last==null?null:e.last-e.first}function Ne(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Yn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Yn(t,n,"prop")}</div>
    </div>`}function Yn(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${d(o)}</span>`).join(" "):'<span class="muted">none</span>'}var xt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,$s="Allegheny";function ve(e){let t=e.place?.muni?.trim()??"",n=xt.exec(t)?.[1],o=n===$s?t.replace(xt,""):n?`${t.replace(xt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Rt(e){return e==="weekday"?"weekday":e}function Wn(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Rt(t)}`}function ks(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds where none stands within 150 m</dt>
    <dd>${t} of ${e.length}</dd>`:""}function _s(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",r=[a,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${r}</div></dd>`}function xs(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Rt(t)}, today only</span>`}${o}</dd>`}function Ps(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Fe("boardings")}</p>`}function Rs(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${Fe("place-population")}</p>
    </div>`}function Dt(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,r=s>0?"up":s<0?"down":"flat",i=Un(o),u=Un(a),p=Gn(o),m=Gn(a);return`
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
        ${s===0?"no change":`${Lt(s)} trips`}
        <div class="muted">${Rn(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Rt(t)}, both directions</div>

    <div class="tiers">${bs(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${vs(o,a)}</tbody>
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
      ${Ae(jn(o),jn(a))}
      <dt>Hours between</dt>
      ${Ae(St(p),St(m),Jn(p,m,"more"))}
      <dt>Typical wait</dt>
      ${Ae(i==null?"\u2014":`${i} min`,u==null?"\u2014":`${u} min`,Jn(i,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Ae(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${_s(e.current.stops)}
      ${ks(e.proposed.stops)}
      ${xs(o.boardings,t)}
    </dl>
    ${Ps(o.boardings)}

    ${n}

    ${Rs(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Ne(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Fe("location-not-route")}</p>
    </div>`}function qn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(ve(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Dt(e,Pt,Ls(e.oneseat??[],e.oneseat_day??"any"))}`}var Ds={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Os={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Es={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ts(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Ot(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Kn(t)}</div>`:""}function Cs(e){let t=Ot("kept",e.kept)+Ot("lost",e.lost)+Ot("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Ms(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Ne(e.current,e.proposed)}
    </div>`}function As(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${d(a.key)}">
      <span class="os-name">${d(a.name)}</span>
      <span class="os-status ${d(a.status)}">${Fs[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Fs={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Ns(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Es[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Xn(e,t,n){let o=Ts(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":Cs(o)+Ms(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(ve(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${Ds[o.status]}</div>
    <p class="note">${Os[o.status]} ${Ns(a)}</p>

    ${s}

    ${As(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Wn(e,n)}</summary>
      ${Dt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Qn(e){return`
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
    </div>`}var Be={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ae="change",z="change-dots",q=["boolean",["feature-state","selected"],!1],Zn="#15181e",X=["==",["get","published"],0],je="newplace",Hs="#15181e",Bs=5,Ie=["==",["get","removed"],1],Ue="removedstop",Se="change-removed",Ct="change-removed-selected",Et="removed-cross",to="#e8232f";function Is(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[s,r]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,to]])o.lineWidth=s,o.strokeStyle=r,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var He=null,Y=new Set,M=new Set,js=[z,Ct,Se],Mt=[z,Se],Je=z;function no(e,t){for(let n of js)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function At(){return He}function Le(e){return Y.has(e)}function oo(e,t,n,o){return a=>Gs(a,e,t,n,o)}function ao(e){return t=>e.has(be(t))}function so(){return M}function ro(){return[...M].sort()}function io(){return M.size}function Ft(e,t){let n=0;for(let o of t)M.has(o)||(M.add(o),we(e,o,!0),n++);return n}function lo(e,t){M.delete(t)?we(e,t,!1):(M.add(t),we(e,t,!0))}function co(e,t){Nt(e),Ft(e,t)}function Nt(e){for(let t of M)we(e,t,!1);M.clear()}function we(e,t,n){try{e.setFeatureState({source:ae,id:t},{selected:n})}catch{}}function Us(e){for(let t of M)we(e,t,!0)}function Js(e,t,n,o){let a=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=a).map(s=>s.id)}function Ht(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],s=[z,Se].filter(i=>e.getLayer(i)),r=e.queryRenderedFeatures(a,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[u,p]=i.geometry.coordinates,m=e.project([u,p]);return{id:i.id,x:m.x,y:m.y}});return Js(t,n,o,r)}function uo(e,t,n,o){let a={};for(let s of n)a[s]=0;for(let s of e){if(!o(s)||D(s,Ce)===0||D(s,fe)===1)continue;let r=n[D(s,ye(t))];r!==void 0&&a[r]++}return a}function po(e,t){let n=0;for(let o of e)t(o)&&D(o,Ce)===0&&n++;return n}function mo(e,t){let n=0;for(let o of e)t(o)&&D(o,fe)===1&&n++;return n}function Gs(e,t,n,o,a){let s=D(e,0),r=D(e,1);return s>=n&&s<=a&&r>=t&&r<=o}function go(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)a.riders[s]=0,a.measured[s]=0;for(let s of e){if(!o(s)||D(s,Ce)===0)continue;let r=n[D(s,ye(t))];if(r===void 0)continue;let i=Fn(s,t),u=D(s,fe)===1;if(i===null){r!=="none"&&a.unmeasured++;continue}if(u){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[r]+=i,a.measured[r]++}return a}function Ys(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>R.some((o,a)=>t[D(n,ye(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:be(n),published:n[2],removed:n[fe],replacement:e.replacement?.[be(n)]?.[0]??null,nearestStraight:e.replacement?.[be(n)]?.[1]??null,...Object.fromEntries(R.flatMap((o,a)=>[[`b${a}`,t[D(n,ye(a))]],[`c${a}`,n[Mn(a)]],[`p${a}`,n[An(a)]]]))}}))}}function ho(e,t){let n=Object.entries(Be).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Be.none[t]]}function yo(e){return["case",X,"rgba(0,0,0,0)",ho(e,"color")]}function Tt(e){return["case",X,Bs,ho(e,"size")]}function fo(e){return["interpolate",["linear"],["zoom"],9,["*",Tt(e),.45],12,Tt(e),16,["*",Tt(e),1.9]]}function bo(e){e.addSource(ae,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:z,type:"circle",source:ae,paint:{"circle-color":yo(0),"circle-radius":fo(0),"circle-opacity":.85,"circle-stroke-color":["case",q,Zn,X,Hs,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",q,1.6,X,.9,.5],12,["case",q,2.4,X,1.5,1],16,["case",q,3.2,X,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Ct,type:"circle",source:ae,filter:Ie,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":Zn,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",q,1.6,0],12,["case",q,2.4,0],16,["case",q,3.2,0]]}},"walk-fill"),e.hasImage(Et)||e.addImage(Et,Is(),{pixelRatio:2}),e.addLayer({id:Se,type:"symbol",source:ae,filter:Ie,layout:{"icon-image":Et,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Bt(e,t,n){return He=await S(`/api/change?radius=${t}`),e.getSource(ae).setData(Ys(He)),Us(e),It(e,n),He}function It(e,t){let n=R.indexOf(t);e.setPaintProperty(z,"circle-color",yo(n)),e.setPaintProperty(z,"circle-radius",fo(n)),jt(e,t)}function vo(e,t,n){Y.has(t)?Y.delete(t):Y.add(t),jt(e,n)}function wo(e,t){Y.clear(),jt(e,t)}function jt(e,t){let n=R.indexOf(t),o=["none",...Y],a=["case",X,!Y.has(je),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(z,["all",["!",Ie],a]);let s=["all",Ie,!Y.has(Ue)];e.setFilter(Se,s),e.setFilter(Ct,s)}function So(e,t,n){let o=R.indexOf(t),a=e[`b${o}`],s=e.removed===1,r=e.published===0?"the plan adds a stop here":n.find(b=>b.key===a)?.label??a,i=e[`c${o}`],u=e[`p${o}`],p=t==="weekday"?"weekday":t,m=e.published===0||s?" within a walk":"";return`${s?"":`<b>${r}</b><br>`}${Vs(e)}${i} \u2192 ${u} buses per ${p}${m}<br><span style="opacity:.6">click for the full comparison</span>`}var zs=1.5,eo=800;function Vs(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??eo,a=n!=null&&o>n*zs?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${eo} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${to}">Stop removed</b> \u2014 ${s}<br>`}var Ut="surface",Ye="surface-fill",Lo="#6b7280",Jt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Lo],[.138,Lo],[1,"#bd60e7"],[2,"#961bed"]],T="#e8232f",C="#0f79c9",$o=2,Ge=null,ko=!1;function ze(){return Ge}function Gt(){return ko}function _o(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-$o,Math.min($o,n))}function xo(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Po(e,t,n,o,a,s,r,i){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=r.lat0+(p[1]+.5)*r.dlat,b=r.lon0+(p[0]+.5)*r.dlon;if(m<o||m>s||b<n||b>a)continue;let k=p[kt(t)],_=p[_t(t)],U=xo(k,_);if(U!=="none")if(U==="ramp"){let h=_o(k,_);u[h<-.138?"less":h>.138?"more":"same"]+=i}else u[U]+=i}return u}function Ks(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*o,i=r+o,u=n+s[0]*a,p=u+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[p,r],[p,i],[u,i],[u,r]]]},properties:Object.fromEntries(R.flatMap((m,b)=>{let k=s[kt(b)],_=s[_t(b)];return[[`k${b}`,xo(k,_)],[`v${b}`,_o(k,_)??0]]}))}})}}function Ro(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Jt.flatMap(([t,n])=>[t,n])]]}function se(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Do(e,t){e.addSource(Ut,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ye,type:"fill",source:Ut,layout:{visibility:"none"},paint:{"fill-color":Ro(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,se(0,.85),13,se(0,.62),16,se(0,.45)]}},t)}async function Yt(e,t,n){return Ge=await S(`/api/surface?radius=${t}`),e.getSource(Ut).setData(Ks(Ge)),zt(e,n),Ge}function zt(e,t){let n=R.indexOf(t);e.setPaintProperty(Ye,"fill-color",Ro(n)),e.setPaintProperty(Ye,"fill-opacity",["interpolate",["linear"],["zoom"],9,se(n,.85),13,se(n,.62),16,se(n,.45)])}function Oo(e,t){ko=t,e.setLayoutProperty(Ye,"visibility",t?"visible":"none")}var Vt=null;function Ve(){return Vt}async function Kt(e){return Vt=await S(`/api/population?radius=${e}`),Vt}function Eo(e,t,n,o,a,s,r){let i={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;p<o||p>s||m<n||m>a||(i.lost+=u[Nn(t)],i.gained+=u[Hn(t)],i.kept+=u[Bn(t)],i.none+=u[In(t)])}return i}var Wt="corridor",To="corridor-lines",qe="#8b929c",Ws="#6f7783",We={lost:T,added:C,kept:qe};var Ke=null,Co=!1;function Xe(){return Ke}function qt(){return Co}function qs(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Mo(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Xs(){let e=t=>["match",["get","klass"],"lost",We.lost,"added",We.added,t];return["interpolate",["linear"],["zoom"],9,e(Ws),14,e(qe)]}function Qs(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Zs(){return["match",["get","klass"],"kept",.85,.9]}function Ao(e,t){e.addSource(Wt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:To,type:"line",source:Wt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Xs(),"line-width":Qs(),"line-opacity":Zs()}},t)}async function Xt(e,t){return Ke=await S(`/api/corridors?day=${t}`),e.getSource(Wt).setData(qs(Ke)),Ke}async function Fo(e,t){R.includes(t)&&await Xt(e,t)}function No(e,t){Co=t,e.setLayoutProperty(To,"visibility",t?"visible":"none")}var Zt="#2b3038",Ho="#b9bec6",$e={loses:{color:T,size:6},gains:{color:C,size:6},keeps:{color:qe,size:3},here:{color:Zt,size:3.5},none:{color:Ho,size:1.8}},Ze=["loses","gains","keeps","none","here"],Qt="oneseat",Bo="oneseat-dots",Qe=null,Io=!1;function re(){return Qe}function en(){return Io}function jo(e,t,n,o,a,s){let r={};for(let i of t)r[i]=0;for(let i of e){let u=i[0],p=i[1];if(u<o||u>s||p<n||p>a)continue;let m=t[i[3]];m!==void 0&&r[m]++}return r}function er(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function tr(){return["match",["get","status"],...Object.entries($e).flatMap(([e,t])=>[e,t.color]),Ho]}function nr(){let e=["match",["get","status"],...Object.entries($e).flatMap(([t,n])=>[t,n.size]),$e.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Uo(e,t){e.addSource(Qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Bo,type:"circle",source:Qt,layout:{visibility:"none"},paint:{"circle-color":tr(),"circle-radius":nr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function or(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var ar="pin";function Jo(e){return"key"in e?e.key:ar}var et="any";function sr(e,t,n){return`radius=${e}&${or(t)}&day=${n}`}function Go(e,t){return e?t:et}function Yo(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function tn(e,t,n,o=et){return Qe=await S(`/api/oneseat?${sr(t,n,o)}`),e.getSource(Qt).setData(er(Qe)),Qe}function zo(e,t){Io=t,e.setLayoutProperty(Bo,"visibility",t?"visible":"none")}function nn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Vo(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",r=nn(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var on={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},an={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},rr=new Set(["gone","new"]);function ir(e,t,n){return rr.has(e)?`${t} (${an[n]})`:t}function lr(e){return e.buckets.filter(t=>t.key!=="none")}var Ko={area:"Ground",people:"People"};function cr(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Po(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function ur(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=Eo(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(a.lost)}</b> people lose all service</span>
        <span><b>${s(a.gained)}</b> gain service</span>
        <span><b>${s(a.kept)}</b> keep a bus</span>
        <span><b>${s(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var dr=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function pr(e){let{layer:t,day:n,bounds:o,unit:a,population:s,scoped:r=!1}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Jt.map(([u,p])=>`${p} ${((u+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service
          (${an[n]})</span>
        <span><i style="background:${C}"></i>new service
          (${an[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Ko).map(u=>`
          <button data-surface-unit="${u}" aria-pressed="${a===u}"
                  class="${a===u?"active":""}">${Ko[u]}</button>`).join("")}
      </div>
      ${r?dr:a==="people"?ur(n,o,s):cr(t,n,o)}
    </div>`}var mr=["lost","added","kept"],gr={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},hr={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function qo(e,t){let{lostPct:n,addedPct:o}=Mo(t.km),a=i=>i.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${hr[t.day]}
    </div>
    ${mr.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${We[i]}"></i>
        <span class="lg-lab">${d(gr[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function Xo(e,t,n){let o=t.statuses.map(m=>m.key),a=jo(t.points,o,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(b=>b.key===m)?.label??m,r=Ze.reduce((m,b)=>m+(a[b]??0),0),i=nn(t),u=t.day&&t.day!==et,p=u?`Restricted to routes running on ${on[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(i)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${on[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Ze.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${$e[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Ze.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(i)} without transferring?
      ${p} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function Qo(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Wo={locations:"Locations",riders:"Riders"};function yr(e,t){let o=`${t.toLocaleString()} location${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a stop where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",r=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${r}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function fr(){return`<div class="lg-foot">Dots mark today's stops, plus the places the plan
    puts a stop where none stands within 150 m. A stop the plan takes away is
    drawn as a cross instead of a colour \u2014 for what the buses near it do, read
    the dots around it. A stop added right beside an existing one changes a
    dot's colour rather than adding one; Streets colours the pavement itself,
    and shows the rest.</div>`}function br(e){return e?`<div class="lg-foot">A removed stop is not the same as a corner
    losing its bus: countywide, of the 972 stops the plan removes, 245 have
    another stop within a 400 m walk and 193 more within 800 m. The remaining
    534 have none.</div>`:""}function vr(e){if(!e)return"";let t=Le(je);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${je}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function wr(e,t){if(!e)return"";let n=Le(Ue);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Ue}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Sr(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${vr(e)}
      ${wr(t,n)}
    </div>`}function Zo(e,t){let{layer:n,day:o,bounds:a,weight:s,surface:r,unit:i="area",population:u,selection:p}=t,m=n.buckets.map(w=>w.key),b=n.days.indexOf(o),{west:k,south:_,east:U,north:h}=a,ne=lr(n),x=p&&p.size>0?p:null,J=x?ao(x):oo(k,_,U,h),xn=uo(n.points,b,m,J),vt=po(n.points,J),Oe=mo(n.points,J),E=s==="riders"?go(n.points,b,m,J):null,is=w=>E?E.measured[w]?Math.round(E.riders[w]).toLocaleString():"\u2014":xn[w].toLocaleString(),ls=E?E.removedMeasured?Math.round(E.removedRiders).toLocaleString():"\u2014":Oe.toLocaleString(),cs=x?`at ${x.size.toLocaleString()} selected stop${x.size===1?"":"s"}`:"in view",Pn=ne.reduce((w,wt)=>w+xn[wt.key],0)+vt+Oe,us=E?`<b>${Math.round(ne.reduce((w,wt)=>w+E.riders[wt.key],0)+E.removedRiders).toLocaleString()}</b> daily boardings ${cs}`:x?`<b>${Pn.toLocaleString()}</b>
         of ${x.size.toLocaleString()} selected stops`:`<b>${Pn.toLocaleString()}</b>
         locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${us}
      <span class="muted">\xB7 ${on[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Wo).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${Wo[w]}</button>`).join("")}
    </div>
    ${ne.map(w=>`
      <button class="lg-row ${Le(w.key)?"off":""}" data-bucket="${d(w.key)}"
              aria-pressed="${!Le(w.key)}">
        <i style="background:${Be[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(ir(w.key,w.label,o))}</span>
        <span class="lg-n">${is(w.key)}</span>
      </button>`).join("")}
    ${Sr(vt,Oe,ls)}
    ${r?pr({layer:r,day:o,bounds:a,unit:i,population:u,scoped:!!x}):""}
    ${E?yr(E.unmeasured,vt):`
    <div class="lg-foot">Buses per day within the walk radius, both
      directions \u2014 counting locations, not riders.</div>`}
    ${fr()}
    ${br(Oe)}
    ${x?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var sn="#4aa3ff",ra="#ffa23a",rn="headline",tt="journey",ia="journey-rides",la="journey-walks",Lr=[ia,la],ca=null,ua=!1;function ot(){return ca}function ln(){return ua}function $r(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let r of s.legs){let i=r.from??e.origin,u=r.to??e.destination,p=[[i.lon,i.lat],[u.lon,u.lat]],m=r.path?.length?r.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:o}}function ea(){return["match",["get","side"],"current",sn,"proposed",ra,sn]}function ta(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function da(e,t){e.addSource(tt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ia,type:"line",source:tt,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ea(),"line-width":ta(1),"line-opacity":.85}},t),e.addLayer({id:la,type:"line",source:tt,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ea(),"line-width":ta(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function pa(e,t){ua=t;for(let n of Lr)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function cn(e,t){ca=t;let n=t?$r(t,rn):{type:"FeatureCollection",features:[]};e.getSource(tt).setData(n)}function ma(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var na=e=>`${e.toFixed(1)} min`;function ga(e){return e==null?"\u2014":e===0?"no change":e>0?`${na(e)} slower`:`${na(-e)} faster`}function oa(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function kr(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=oa(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${oa(e.to,"the destination")}</span></div>`}function aa(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(kr(a,t)),o=a}return n.join("")}var _r={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function nt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function xr(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Pr(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${nt(t.current)} \u2192
        ${nt(t.proposed)} min</span>
        <span class="muted">${ga(t.change_min)}</span></div>
      ${o}
    </div>`}function sa(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function un(e,t){let n=e.radii[rn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${oe(e.window.start_min)}
        and ${oe(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${_r[n.classification]??""}</p>
      </div>
      ${sa(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${nt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${nt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${ga(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${xr(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?aa(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?aa(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Pr(e)}
    ${sa(e)}`}function ha(e){return`
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
    </div>`}function ya(e){let t=e?e.radii[rn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${sn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ra}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var rt="places",va="places-points",dn="places-boundaries",A="places-fill",le="lost",Rr=100,Dr={lost:"share_lost",gained:"share_gained"};function K(e,t){return`service_${e}_${t}`}var wa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Or="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Q={lost:T,gained:C},at=null,V=null,ie=null,Sa=!1,st=null;function pn(){return at}function La(){return V}function $a(){return st}function mn(){return ie}function ke(){return Sa}function Er(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function Tr(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Cr(e){return Math.max(e.residents_lost,e.residents_gained)}var fa=4,Mr=16,Ar=1e3;function Fr(e){let t=Math.min(1,Math.sqrt(e/Ar));return fa+t*(Mr-fa)}function Nr(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Tr(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Fr(Cr(t))}}))}}function Hr(){return["match",["get","klass"],"lost",Q.lost,"gained",Q.gained,Q.lost]}function Br(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var I=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var j=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function ka(e,t){return e==="service"?["step",["abs",["coalesce",["get",K(t,"pct")],0]],j[0].opacity,j[0].max,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity]:["step",["coalesce",["get",Dr[e]],0],I[0].opacity,Number.EPSILON,I[1].opacity,I[1].max,I[2].opacity,I[2].max,I[3].opacity,I[3].max,I[4].opacity]}function _a(e,t){return e==="service"?["case",[">=",["coalesce",["get",K(t,"pct")],0],0],C,T]:Q[e]}function Ir(e,t){let n=K(t,"now"),o=K(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var jr=3;function Ur(e){if(e.length===0)return"";let t=e.slice(0,jr),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function xa(e,t){e.addSource(dn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:A,type:"fill",source:dn,layout:{visibility:"none"},paint:{"fill-color":_a(le),"fill-opacity":ka(le),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(rt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:va,type:"circle",source:rt,layout:{visibility:"none"},paint:{"circle-color":Hr(),"circle-radius":Br(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function it(e,t,n){e.setPaintProperty(A,"fill-color",_a(t,n)),e.setPaintProperty(A,"fill-opacity",ka(t,n))}async function Pa(){return at||(at=await S("/api/places")),at}async function Ra(e){return ie||(ie=await S("/api/boundaries"),e.getSource(dn).setData(ie)),ie}function Jr(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Da(e,t){let n=Jr(ie,t);if(n)return V=null,st=n,e.getSource(rt)?.setData({type:"FeatureCollection",features:[]}),null;try{V=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return V=null,st=null,null}return st=null,e.getSource(rt).setData(Nr(V)),e.flyTo({center:[V.lon,V.lat],zoom:13}),V}function Oa(e,t){Sa=t,e.setLayoutProperty(va,"visibility",t?"visible":"none"),e.setLayoutProperty(A,"visibility",t?"visible":"none")}function Gr(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Yr="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ea(e,t,n,o){let a=Er(e,t).map(s=>Gr(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Or}</p>
    ${o==="service"?`<p class="note">${Yr}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Ta(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function zr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Vr(e,t,n,o){let a=j.map((u,p)=>({band:u,prevMax:p===0?0:j[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=zr(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=o?Ir(o,n):[],r=Ur(s),i=r?`<div class="lg-foot">${d(r)}</div>`:"";return`
    ${Ta(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(wa[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Ca({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return Vr(e,a??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",r=I.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${Q[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(i.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${Ta(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Q.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Q.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Kr(e,t){let n=e[K(t,"now")],o=e[K(t,"proposed")],a=e[K(t,"pct")],s=e[K(t,"rail_proposed")],r=wa[t];if(o===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${r} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${r} (${i}).`}function Ma(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${Kr(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=ba("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?ba("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[a,s]:[s,a]).filter(i=>i!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function ba(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Rr} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var gn=" \xB7 ",hn={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Aa=Object.keys(hn);function Fa(e){return hn[e]??e}var Wr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},qr=["oneseat","journey"];function Xr(e){return e!=="journey"}function Qr(e){let t=[hn[e.view]??e.view];return e.view==="places"?t[0]:(qr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Wr[e.day]),Xr(e.view)&&t.push(`${e.radius} m walk`),t.join(gn))}function Na(e){let[t,...n]=Qr(e).split(gn);return`<b>${d(t)}</b>${n.map(o=>gn+d(o)).join("")}`}var y={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},Zr=/^[cp]:[\w.:-]{1,32}$/,lt={any:"any",selected:"selected"},ei="pin",Ha=5;function Ia(e){try{return e.self!==e.top}catch{return!0}}function ja(e){let t=new URLSearchParams;return t.set(y.view,e.view),t.set(y.day,e.day),t.set(y.radius,String(e.radius)),t.set(y.oneSeatDay,e.oneSeatRestricted?lt.selected:lt.any),t.set(y.dest,"key"in e.dest?e.dest.key:yn(e.dest)),e.weight==="riders"&&t.set(y.weight,e.weight),e.surfaceUnit==="people"&&t.set(y.surfaceUnit,e.surfaceUnit),e.at&&t.set(y.at,yn(e.at)),e.camera&&t.set(y.camera,`${yn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(y.place,e.place),e.placeFill!==le&&t.set(y.placeFill,e.placeFill),e.selection.length&&t.set(y.selection,e.selection.join(",")),`?${t}`}function Ua(e){let t=new URLSearchParams(e),n={},o=t.get(y.view);o&&Aa.includes(o)&&(n.view=o);let a=t.get(y.day);a&&R.includes(a)&&(n.day=a);let s=Number(t.get(y.radius));t.has(y.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(y.weight)==="riders"?n.weight="riders":t.get(y.weight)==="locations"&&(n.weight="locations"),t.get(y.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(y.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(y.oneSeatDay);r===lt.selected?n.oneSeatRestricted=!0:r===lt.any&&(n.oneSeatRestricted=!1);let i=t.get(y.dest);if(i&&i!==ei){let _=Ba(i);_?n.dest=_:i.includes(",")||(n.dest={key:i})}let u=Ba(t.get(y.at));u&&(n.at=u);let p=ti(t.get(y.camera));p&&(n.camera=p);let m=t.get(y.place);m&&(n.place=m);let b=t.get(y.selection);b!==null&&(n.selection=b.split(",").filter(_=>Zr.test(_)));let k=t.get(y.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function yn(e){return`${e.lat.toFixed(Ha)},${e.lon.toFixed(Ha)}`}function Ba(e){let t=Ja(e,2);return t?{lat:t[0],lon:t[1]}:null}function ti(e){let t=Ja(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ja(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var fn="embed";var ni=["1","true","yes"];function Ga(e){let t=new URLSearchParams(e).get(fn);return t!==null&&ni.includes(t.toLowerCase())}function Ya(e){let t=new URLSearchParams(e);return t.set(fn,"1"),`?${t}`}function za(e){let t=new URLSearchParams(e);t.delete(fn);let n=String(t);return n?`?${n}`:""}function Va(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var W=["peek","half","full"],oi=192,ai=.3,si=.55,ri=.9,ii=.6,li=.45;function ct(e,t){return e==="peek"?Math.min(oi,t*ai):e==="half"?t*si:t*ri}function ci(e,t,n=0){let o=W.map(s=>Math.abs(ct(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>ii&&(a=Math.max(0,Math.min(W.length-1,a+(n>0?1:-1)))),W[a]}function Ka(e){return W[(W.indexOf(e)+1)%W.length]}function ui(e,t){return Math.min(e,t*li)}function ce(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function bn(e){let t=null,n=()=>{let o=ce();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var di=8,pi=400;function Wa(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,s=0,r=0,i=0,u={y:0,t:0};function p(){return window.innerHeight}function m(h){t.style.height=`${h}px`,e.onMove(h,ui(h,p()))}function b(h){o=h,t.dataset.snap=h,m(ct(h,p()))}n.addEventListener("pointerdown",h=>{ce()&&(a=!0,s=h.clientY,r=t.getBoundingClientRect().height,i=h.timeStamp,u={y:h.clientY,t:h.timeStamp},t.classList.add("dragging"),n.setPointerCapture(h.pointerId))}),n.addEventListener("pointermove",h=>{if(!a)return;let ne=r+(s-h.clientY),x=ct("peek",p()),J=ct("full",p());m(Math.max(x,Math.min(J,ne))),u={y:h.clientY,t:h.timeStamp}});function k(h){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(h.clientY-s)>di)&&h.timeStamp-i<pi){b(Ka(o));return}let x=h.timeStamp-u.t,J=x>0?(u.y-h.clientY)/x:0;b(ci(t.getBoundingClientRect().height,p(),J))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",h=>{h.key!=="Enter"&&h.key!==" "||(h.preventDefault(),ce()&&b(Ka(o)))});let _=bn(e.onLayoutChange);function U(){if(_(),!ce()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",U),U(),{at:()=>ce()?o:"full",atLeast(h){ce()&&W.indexOf(h)>W.indexOf(o)&&b(h)}}}var mi=[-79.9959,40.4406],gi=12,hi="#e2574c",O={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},xe=Ua(location.search),Re=Ga(location.search);Re&&c("app").classList.add("embed");var yi={at:()=>"full",atLeast(){}},Qa=null,P=400,_e=null,f=null,de=null,te=0,$={key:"downtown"},Z=null,Za=!1,ge=!1,yt="locations",he="area",es="count",gt=null,F=le,H=!1,g="dots",ts,Sn=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:xe.camera?[xe.camera.lon,xe.camera.lat]:mi,zoom:xe.camera?.zoom??gi,cooperativeGestures:Ia(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{En(l),bo(l),Do(l,Je),Ao(l,Je),Uo(l,"walk-fill"),da(l),xa(l,Je),N(),l.on("click",t=>{if(H)return;if(Za){Pe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=l.queryRenderedFeatures(t.point,{layers:[A]})[0];s&&dt(s.properties.key);return}let n=[...Mt,"oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];_n(a[1],a[0])}),l.on("mouseenter",A,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",A,()=>{l.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});for(let t of Mt)l.on("mouseenter",t,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",t,()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove",t,n=>{let o=n.features?.[0],a=At();!o||!a||e.setLngLat(o.geometry.coordinates).setHTML(So(o.properties,L(),a.buckets)).addTo(l)});l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=re();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Vo(n.properties,o)).addTo(l)}),l.on("mouseleave",A,()=>e.remove()),l.on("mousemove",A,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(Ma(n.properties,F,L())).addTo(l)}),Ti(),l.on("moveend",()=>{let t=l.getCenter();Qa={lat:t.lat,lon:t.lng,zoom:l.getZoom()},v(),B()}),ue(O.radius,t=>{P=Number(t.dataset.radius),Bt(l,P,L()).then(v),ze()&&Yt(l,P,L()).then(v),Ve()&&Kt(P).then(v),re()&&pt(),f&&pe(f.lat,f.lon)}),ue(O.day,t=>{let n=t.dataset.day;zn(n),g!=="journey"&&N(),It(l,n),zt(l,n),g==="journey"&&f&&Ln(f.lat,f.lon),Xe()&&Fo(l,n).then(v),ge&&re()&&(pt(),f&&pe(f.lat,f.lon)),ke()&&F==="service"&&it(l,F,n),v()}),ue(O.oneSeatDay,t=>{ge=t.dataset.oneseatDay==="selected",wn(),pt(),f&&pe(f.lat,f.lon)}),ue(O.view,t=>{let n=g;g=t.dataset.view,e.remove(),no(l,g==="dots"||g==="both"),Li(g==="surface"||g==="both"),ki(g==="corridors"),Ri(g==="oneseat"),Pi(g==="journey",n==="journey"),_i(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),xi(g!=="corridors"&&g!=="journey"&&g!=="places");let o=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),ht()||qa(!1),me(),wn(),o||mt(!1),os()}),ue(O.dest,t=>{let n=t.dataset.dest;if(n==="pin"){mt(!0);return}mt(!1),Pe({key:n})}),ue(O.placeFill,t=>{F=t.dataset.placeFill,ke()&&it(l,F,L()),N(),v(),wn()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){yt=n.dataset.weight,v(),B();return}let o=t.target.closest("[data-surface-unit]");if(o){he=o.dataset.surfaceUnit,$i(he),B();return}let a=t.target.closest("[data-bucket]");a&&(vo(l,a.dataset.bucket,L()),v())}),c("legend-reset").addEventListener("click",()=>{wo(l,L()),v()}),c("legend-select").addEventListener("click",()=>qa(!H)),c("legend-clear").addEventListener("click",()=>{Nt(l),me(),v(),B()}),c("legend-collapse").addEventListener("click",()=>{vn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Pe({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Ai(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&dt(a.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(es=s.dataset.sortPlaces,N());let r=t.target.closest("[data-goto-place]");r&&(g!=="places"&&ee(O.view,"places"),dt(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",wi),Re&&bn(vn),ts=Re?yi:Wa({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:vn}),bi(),bt(),me(),ft(),fi(xe)||Bt(l,P,L()).then(v),Mi(),Ci()});function ue(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),bt(),B()})})}function ee(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function fi(e){let t=!1;return e.radius!==void 0&&(t=ee(O.radius,String(e.radius))||t),e.day&&(t=ee(O.day,e.day)||t),e.oneSeatRestricted!==void 0&&ee(O.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(yt=e.weight),e.surfaceUnit&&(he=e.surfaceUnit),e.placeFill&&ee(O.placeFill,e.placeFill),e.dest&&("key"in e.dest?ee(O.dest,e.dest.key):Pe(e.dest)),e.selection&&co(l,e.selection),e.view&&ee(O.view,e.view),e.at&&_n(e.at.lat,e.at.lon),e.place&&dt(e.place),t}function B(){let e={view:g,day:L(),radius:P,oneSeatRestricted:ge,weight:yt,surfaceUnit:he,dest:$,at:f,camera:Qa,place:gt,placeFill:F,selection:ro()},t=ja(e);history.replaceState(null,"",(Re?Ya(t):t)+location.hash),ft(t)}function ft(e=za(location.search)){if(!Re)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?de?ve(de):"this point":null;t.querySelector(".el-action").textContent=Va(n)}function bt(){c("statebar").innerHTML=Na({view:g,day:L(),radius:P,oneSeatRestricted:ge,destination:De()}),vi()}function vn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function bi(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function vi(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Fa(g)))}function wi(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function v(){Si()}function Si(){if(c("legend-reset").classList.toggle("hidden",qt()||en()||ln()||ke()),ln()){c("legend").innerHTML=ya(ot());return}if(ke()){c("legend").innerHTML=Ca({selected:La(),fill:F,day:L(),boundaries:mn(),unchanged:$a()});return}if(qt()){let n=Xe();n&&qo(c("legend"),n);return}if(en()){let n=re();if(!n)return;let o=l.getBounds();Xo(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=At();if(!e)return;let t=l.getBounds();Zo(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:yt,surface:Gt()?ze():null,unit:he,population:Ve(),selection:so()})}async function Li(e){if(e&&!ze()){c("legend").classList.add("loading");try{await Yt(l,P,L())}finally{c("legend").classList.remove("loading")}}Oo(l,e),e&&he==="people"&&await ns(),v()}async function ns(){if(!Ve()){c("legend").classList.add("loading");try{await Kt(P)}finally{c("legend").classList.remove("loading")}}}async function $i(e){e==="people"&&Gt()&&await ns(),v()}async function ki(e){if(e&&!Xe()){c("legend").classList.add("loading");try{await Xt(l,L())}finally{c("legend").classList.remove("loading")}}No(l,e),v()}async function _i(e){if(e&&(!pn()||!mn())){c("legend").classList.add("loading");try{await Promise.all([Pa(),Ra(l)])}finally{c("legend").classList.remove("loading")}}Oa(l,e),e&&it(l,F,L()),e&&N(),v()}async function dt(e){gt=await kn(()=>Da(l,e))?e:null,g==="places"&&(N(),gt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),B()}function xi(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),ft(),g==="places"){c("panel").innerHTML=Ea(pn()??[],es,gt,F);return}if(!de){g==="oneseat"?c("panel").innerHTML=Qn(De()):Vn(c("panel"));return}if(g==="oneseat"){let t=Xn(de,$,L());if(t){c("panel").innerHTML=t;return}}qn(de)}function Pi(e,t=!1){if(pa(l,e),v(),!e){t&&(f?pe(f.lat,f.lon):N());return}ot()&&f?c("panel").innerHTML=un(ot(),De()):c("panel").innerHTML=ha(De())}async function Ln(e,t){let n=++te;f={lat:e,lon:t},B(),ss(e,t);let o=as(),a=d(De());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(ma({lat:e,lon:t},o,L()));if(n!==te)return;cn(l,s),c("panel").innerHTML=un(s,a),v(),ft()}catch(s){if(n!==te)return;cn(l,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function wn(){c("day-controls").classList.toggle("hidden",!Yo(g,ge,F))}function $n(){return Go(ge,L())}async function Ri(e){e&&!re()&&await kn(()=>tn(l,P,$,$n())),zo(l,e),v()}async function pt(){await kn(()=>tn(l,P,$,$n())),v()}async function kn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Pe(e){if($=e,mt(!1),Di(),os(),bt(),B(),g==="journey"){f&&Ln(f.lat,f.lon),v();return}f?pe(f.lat,f.lon):N({scrollToTop:!0}),pt()}function os(){let e=as();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in $))){Z?.remove(),Z=null;return}Z?Z.setLngLat([e.lon,e.lat]).addTo(l):(Z=new maplibregl.Marker({color:Zt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),Z.on("dragend",()=>{let n=Z.getLngLat();Pe({lat:n.lat,lon:n.lng})}))}function Di(){let e=Jo($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function as(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=Sn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function De(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return Sn.find(t=>t.key===e)?.name??e}function mt(e){Za=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function pe(e,t){let n=++te;f={lat:e,lon:t},B(),c("panel").classList.add("loading"),ss(e,t);try{let o="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",a=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${o}&oneseat_day=${$n()}`);if(n!==te)return;Tn(l,e,t,P,a.current.stops,a.proposed.stops),Oi(),de=a,N({scrollToTop:!0})}catch(o){if(n!==te)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===te&&c("panel").classList.remove("loading")}}function Oi(){c("pin-key").innerHTML=Qo(P),c("pin-key").classList.remove("hidden")}function ss(e,t){_e?_e.setLngLat([t,e]):(_e=new maplibregl.Marker({color:hi,draggable:!0}).setLngLat([t,e]).addTo(l),_e.on("dragend",()=>{let n=_e.getLngLat();_n(n.lat,n.lng)}))}var ut=14;function ht(){return g==="dots"||g==="both"}function qa(e){H=e&&ht(),H?l.dragPan.disable():l.dragPan.enable(),l.getCanvas().style.cursor=H?"none":"",H||rs(),me()}function me(){let e=c("legend-select");e.classList.toggle("hidden",!ht()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!ht()||!io())}function Ei(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function Xa(e){c("brush").classList.toggle("painting",e)}function rs(){c("brush").hidden=!0}function Ti(){let e=c("brush");e.style.width=`${ut*2}px`,e.style.height=`${ut*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,me(),v()}))},s=()=>{H&&(t=!0,n=!1,Xa(!0))},r=u=>{if(Ei(u.point.x,u.point.y),!t)return;n=!0,Ft(l,Ht(l,u.point.x,u.point.y,ut))&&a()},i=u=>{if(Xa(!1),!!t){if(t=!1,!n){let[p]=Ht(l,u.point.x,u.point.y,ut);p&&lo(l,p)}me(),v(),B()}};l.on("mousedown",s),l.on("mousemove",r),l.on("mouseup",i),l.getCanvas().addEventListener("mouseleave",rs),l.on("touchstart",s),l.on("touchmove",r),l.on("touchend",i)}function _n(e,t){if(ts.atLeast("half"),g==="journey"){Ln(e,t);return}g!=="places"&&pe(e,t)}async function Ci(){try{Sn=await S("/api/destinations"),bt()}catch{}}async function Mi(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Ai(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
