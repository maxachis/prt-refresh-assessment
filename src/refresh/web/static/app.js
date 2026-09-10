"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function x(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var _t=new Map;function ne(e){let t=_t.get(e);if(t)return t;let n=x(e).catch(o=>{throw _t.delete(e),o});return _t.set(e,n),n}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function oe(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function kt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function xt(e){return e>0?`+${e}`:String(e)}function Mn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var xr="#15181e",Cn="#ffa23a",Pr="#ffffff";function Rr(e,t,n,o=96){let a=[],r=n/111320,s=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;a.push([t+s*Math.cos(l),e+r*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function J(e){return{type:"FeatureCollection",features:e}}function Er(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Or(e){let t=e.side==="current"?"today":"proposed",n=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"";return`<b>${e.name}</b><br>${t} \xB7 stop ${e.stop_id}${n}`}function An(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Fn(e){e.addSource("walk",{type:"geojson",data:J([])}),e.addSource("stops-now",{type:"geojson",data:J([])}),e.addSource("stops-prop",{type:"geojson",data:J([])}),e.addSource("stop-moves",{type:"geojson",data:J([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Cn,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Pr,"circle-stroke-width":3,"circle-stroke-color":Cn}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":xr,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function Nn(){return["stops-now-c","stops-prop-c"].map(e=>({layer:e,html:t=>Or(t.properties)}))}function Hn(e,t,n,o,a,r){e.getSource("walk").setData(J([Rr(t,n,o)])),e.getSource("stops-now").setData(J(An(a,"current"))),e.getSource("stops-prop").setData(J(An(r,"proposed"))),e.getSource("stop-moves").setData(J(Er(r)))}var R=["weekday","saturday","sunday"],Pt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Bn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Me=4,Ce=5,In=e=>Ce+Me*e,jn=e=>Ce+1+Me*e,fe=e=>Ce+2+Me*e,Dr=e=>Ce+3+Me*e,Ae=2,Tr=3,be=4,ve=e=>e[Tr],E=(e,t)=>e[t],Un=(e,t)=>e[Dr(t)],Rt=e=>2+2*e,Et=e=>3+2*e,Fe=4,Jn=e=>2+Fe*e,Gn=e=>3+Fe*e,Yn=e=>4+Fe*e,zn=e=>5+Fe*e;var Dt="weekday";function L(){return Dt}function Zn(e){Dt=e}function Qn(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
         the view chosen in the toolbar on the map. Pan and zoom to read a
         neighbourhood.</p>
      <p><b>Stop-by-stop</b> draws one dot per place a bus stops today, coloured
         by what the plan does to the buses within a short walk. Each dot says
         one thing: either the plan takes this stop away \u2014 a red cross, on
         every day of the week \u2014 or the stop stays and the colour tells you
         what the buses near it do. A hollow ring is a stop the plan adds,
         drawn wherever the plan adds it. To see what a crossed-out stop
         leaves behind, read the dots around it. Its key counts
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
    </div>`}function Mr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Cr(e,t){let n=Math.max(1,...Pt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Pt.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,s=r-a,i=s>0?"up":s<0?"down":"flat";return`
      <tr>
        <th>${Bn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${i}">${s===0?"\xB7":xt(s)}</td>
      </tr>`}).join("")}function eo(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Vn(e){return e.first==null?'<span class="muted">no service</span>':`${oe(e.first)}\u2013${oe(e.last)}`}function Kn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Ar={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Fr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Nr(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Be(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(o.name)}</span>
          <span class="os-status ${p(o.status)}">${Ar[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Fr[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${He("one-seat")}</p>
    </div>`:""}function He(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ne(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function Wn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function qn(e){return e.first==null||e.last==null?null:e.last-e.first}function Be(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Xn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Xn(t,n,"prop")}</div>
    </div>`}function Xn(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${p(o)}</span>`).join(" "):'<span class="muted">none</span>'}var Ot=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Hr="Allegheny";function we(e){let t=e.place?.muni?.trim()??"",n=Ot.exec(t)?.[1],o=n===Hr?t.replace(Ot,""):n?`${t.replace(Ot,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Tt(e){return e==="weekday"?"weekday":e}function to(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Tt(t)}`}function Br(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Ir(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",r=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",s=[a,r].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${s}</div></dd>`}function jr(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Tt(t)}, today only</span>`}${o}</dd>`}function Ur(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${He("boardings")}</p>`}function Jr(e){if(!e)return"";let t=p(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
    </div>`}function Mt(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],r=a.trips-o.trips,s=r>0?"up":r<0?"down":"flat",i=Kn(o),l=Kn(a),d=qn(o),m=qn(a);return`
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
      <div class="hl-delta ${s}">
        ${r===0?"no change":`${xt(r)} trips`}
        <div class="muted">${Mn(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Tt(t)}, both directions</div>

    <div class="tiers">${Mr(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Cr(o,a)}</tbody>
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
      ${Ne(Vn(o),Vn(a))}
      <dt>Hours between</dt>
      ${Ne(kt(d),kt(m),Wn(d,m,"more"))}
      <dt>Typical wait</dt>
      ${Ne(i==null?"\u2014":`${i} min`,l==null?"\u2014":`${l} min`,Wn(i,l,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Ne(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Ir(e.current.stops)}
      ${Br(e.proposed.stops)}
      ${jr(o.boardings,t)}
    </dl>
    ${Ur(o.boardings)}

    ${n}

    ${Jr(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Be(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${He("location-not-route")}</p>
    </div>`}function no(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${p(we(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Mt(e,Dt,Nr(e.oneseat??[],e.oneseat_day??"any"))}`}var Gr={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Yr={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},zr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Vr(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Ct(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${eo(t)}</div>`:""}function Kr(e){let t=Ct("kept",e.kept)+Ct("lost",e.lost)+Ct("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Wr(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Be(e.current,e.proposed)}
    </div>`}function qr(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${p(a.key)}">
      <span class="os-name">${p(a.name)}</span>
      <span class="os-status ${p(a.status)}">${Xr[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Xr={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Zr(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${zr[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function oo(e,t,n){let o=Vr(e,t);if(!o)return"";let a=e.oneseat_day??"any",r=o.status==="here"?"":Kr(o)+Wr(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${p(o.name)}</h2>
      <div class="muted">
        from ${p(we(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${p(o.status)}">${Gr[o.status]}</div>
    <p class="note">${Yr[o.status]} ${Zr(a)}</p>

    ${r}

    ${qr(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${to(e,n)}</summary>
      ${Mt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function ao(e){return`
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
    </div>`}var je={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ae="change",Y="change-dots",W=["boolean",["feature-state","selected"],!1],ro="#15181e",q=["==",["get","published"],0],Je="newplace",Qr="#15181e",es=5,Ue=["==",["get","removed"],1],Ge="removedstop",Le="change-removed",Nt="change-removed-selected",At="removed-cross",io="#e8232f";function ts(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[r,s]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,io]])o.lineWidth=r,o.strokeStyle=s,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var Ie=null,G=new Set,A=new Set,ns=[Y,Nt,Le],Ht=[Y,Le],Ye=Y;function lo(e,t){for(let n of ns)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Bt(){return Ie}function $e(e){return G.has(e)}function co(e,t,n,o){return a=>rs(a,e,t,n,o)}function uo(e){return t=>e.has(ve(t))}function po(){return A}function mo(){return[...A].sort()}function go(){return A.size}function It(e,t){let n=0;for(let o of t)A.has(o)||(A.add(o),Se(e,o,!0),n++);return n}function yo(e,t){A.delete(t)?Se(e,t,!1):(A.add(t),Se(e,t,!0))}function ho(e,t){jt(e),It(e,t)}function jt(e){for(let t of A)Se(e,t,!1);A.clear()}function Se(e,t,n){try{e.setFeatureState({source:ae,id:t},{selected:n})}catch{}}function os(e){for(let t of A)Se(e,t,!0)}function as(e,t,n,o){let a=n*n;return o.filter(r=>(r.x-e)**2+(r.y-t)**2<=a).map(r=>r.id)}function Ut(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],r=[Y,Le].filter(i=>e.getLayer(i)),s=e.queryRenderedFeatures(a,{layers:r}).filter(i=>i.id!==void 0).map(i=>{let[l,d]=i.geometry.coordinates,m=e.project([l,d]);return{id:i.id,x:m.x,y:m.y}});return as(t,n,o,s)}function fo(e,t,n,o){let a={};for(let r of n)a[r]=0;for(let r of e){if(!o(r)||E(r,Ae)===0||E(r,be)===1)continue;let s=n[E(r,fe(t))];s!==void 0&&a[s]++}return a}function bo(e,t){let n=0;for(let o of e)t(o)&&E(o,Ae)===0&&n++;return n}function vo(e,t){let n=0;for(let o of e)t(o)&&E(o,be)===1&&n++;return n}function rs(e,t,n,o,a){let r=E(e,0),s=E(e,1);return r>=n&&r<=a&&s>=t&&s<=o}function wo(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let r of n)a.riders[r]=0,a.measured[r]=0;for(let r of e){if(!o(r)||E(r,Ae)===0)continue;let s=n[E(r,fe(t))];if(s===void 0)continue;let i=Un(r,t),l=E(r,be)===1;if(i===null){s!=="none"&&a.unmeasured++;continue}if(l){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[s]+=i,a.measured[s]++}return a}function ss(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>R.some((o,a)=>t[E(n,fe(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ve(n),published:n[2],removed:n[be],replacement:e.replacement?.[ve(n)]?.[0]??null,nearestStraight:e.replacement?.[ve(n)]?.[1]??null,...Object.fromEntries(R.flatMap((o,a)=>[[`b${a}`,t[E(n,fe(a))]],[`c${a}`,n[In(a)]],[`p${a}`,n[jn(a)]]]))}}))}}function So(e,t){let n=Object.entries(je).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,je.none[t]]}function Lo(e){return["case",q,"rgba(0,0,0,0)",So(e,"color")]}function Ft(e){return["case",q,es,So(e,"size")]}function $o(e){return["interpolate",["linear"],["zoom"],9,["*",Ft(e),.45],12,Ft(e),16,["*",Ft(e),1.9]]}function _o(e){e.addSource(ae,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Y,type:"circle",source:ae,paint:{"circle-color":Lo(0),"circle-radius":$o(0),"circle-opacity":.85,"circle-stroke-color":["case",W,ro,q,Qr,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",W,1.6,q,.9,.5],12,["case",W,2.4,q,1.5,1],16,["case",W,3.2,q,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Nt,type:"circle",source:ae,filter:Ue,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":ro,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",W,1.6,0],12,["case",W,2.4,0],16,["case",W,3.2,0]]}},"walk-fill"),e.hasImage(At)||e.addImage(At,ts(),{pixelRatio:2}),e.addLayer({id:Le,type:"symbol",source:ae,filter:Ue,layout:{"icon-image":At,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Jt(e,t,n){return Ie=await ne(`/api/change?radius=${t}`),e.getSource(ae).setData(ss(Ie)),os(e),Gt(e,n),Ie}function Gt(e,t){let n=R.indexOf(t);e.setPaintProperty(Y,"circle-color",Lo(n)),e.setPaintProperty(Y,"circle-radius",$o(n)),Yt(e,t)}function ko(e,t,n){G.has(t)?G.delete(t):G.add(t),Yt(e,n)}function xo(e,t){G.clear(),Yt(e,t)}function Yt(e,t){let n=R.indexOf(t),o=["none",...G],a=["case",q,!G.has(Je),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(Y,["all",["!",Ue],a]);let r=["all",Ue,!G.has(Ge)];e.setFilter(Le,r),e.setFilter(Nt,r)}function Po(e,t,n){let o=R.indexOf(t),a=e[`b${o}`],r=e.removed===1,s=e.published===0?"the plan adds a stop here":n.find(h=>h.key===a)?.label??a,i=e[`c${o}`],l=e[`p${o}`],d=t==="weekday"?"weekday":t,m=e.published===0||r?" within a walk":"";return`${r?"":`<b>${s}</b><br>`}${ls(e)}${i} \u2192 ${l} buses per ${d}${m}<br><span style="opacity:.6">click for the full comparison</span>`}var is=1.5,so=800;function ls(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??so,a=n!=null&&o>n*is?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",r=t==null?`no other stop within a ${so} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${io}">Stop removed</b> \u2014 ${r}<br>`}var zt="surface",Ve="surface-fill",Ro="#6b7280",Vt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Ro],[.138,Ro],[1,"#bd60e7"],[2,"#961bed"]],T="#e8232f",M="#0f79c9",Eo=2,ze=null,Oo=!1;function Ke(){return ze}function Kt(){return Oo}function Do(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Eo,Math.min(Eo,n))}function To(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Mo(e,t,n,o,a,r,s,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let m=s.lat0+(d[1]+.5)*s.dlat,h=s.lon0+(d[0]+.5)*s.dlon;if(m<o||m>r||h<n||h>a)continue;let S=d[Rt(t)],$=d[Et(t)],C=To(S,$);if(C!=="none")if(C==="ramp"){let g=Do(S,$);l[g<-.138?"less":g>.138?"more":"same"]+=i}else l[C]+=i}return l}function cs(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let s=t+r[1]*o,i=s+o,l=n+r[0]*a,d=l+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,s],[d,s],[d,i],[l,i],[l,s]]]},properties:Object.fromEntries(R.flatMap((m,h)=>{let S=r[Rt(h)],$=r[Et(h)];return[[`k${h}`,To(S,$)],[`v${h}`,Do(S,$)??0]]}))}})}}function Co(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],M,["interpolate",["linear"],["get",`v${e}`],...Vt.flatMap(([t,n])=>[t,n])]]}function re(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Ao(e,t){e.addSource(zt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ve,type:"fill",source:zt,layout:{visibility:"none"},paint:{"fill-color":Co(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,re(0,.85),13,re(0,.62),16,re(0,.45)]}},t)}async function Wt(e,t,n){return ze=await ne(`/api/surface?radius=${t}`),e.getSource(zt).setData(cs(ze)),qt(e,n),ze}function qt(e,t){let n=R.indexOf(t);e.setPaintProperty(Ve,"fill-color",Co(n)),e.setPaintProperty(Ve,"fill-opacity",["interpolate",["linear"],["zoom"],9,re(n,.85),13,re(n,.62),16,re(n,.45)])}function Fo(e,t){Oo=t,e.setLayoutProperty(Ve,"visibility",t?"visible":"none")}var Xt=null;function We(){return Xt}async function Zt(e){return Xt=await ne(`/api/population?radius=${e}`),Xt}function No(e,t,n,o,a,r,s){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let d=s.lat0+(l[1]+.5)*s.dlat,m=s.lon0+(l[0]+.5)*s.dlon;d<o||d>r||m<n||m>a||(i.lost+=l[Jn(t)],i.gained+=l[Gn(t)],i.kept+=l[Yn(t)],i.none+=l[zn(t)])}return i}var Qt="corridor",Ho="corridor-lines",Ze="#8b929c",us="#6f7783",Xe={lost:T,added:M,kept:Ze};var qe=null,Bo=!1;function Qe(){return qe}function en(){return Bo}function ds(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Io(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function ps(){let e=t=>["match",["get","klass"],"lost",Xe.lost,"added",Xe.added,t];return["interpolate",["linear"],["zoom"],9,e(us),14,e(Ze)]}function ms(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function gs(){return["match",["get","klass"],"kept",.85,.9]}function jo(e,t){e.addSource(Qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ho,type:"line",source:Qt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ps(),"line-width":ms(),"line-opacity":gs()}},t)}async function tn(e,t){return qe=await x(`/api/corridors?day=${t}`),e.getSource(Qt).setData(ds(qe)),qe}async function Uo(e,t){R.includes(t)&&await tn(e,t)}function Jo(e,t){Bo=t,e.setLayoutProperty(Ho,"visibility",t?"visible":"none")}var on="#2b3038",Go="#b9bec6",_e={loses:{color:T,size:6},gains:{color:M,size:6},keeps:{color:Ze,size:3},here:{color:on,size:3.5},none:{color:Go,size:1.8}},tt=["loses","gains","keeps","none","here"],nn="oneseat",Yo="oneseat-dots",et=null,zo=!1;function se(){return et}function an(){return zo}function Vo(e,t,n,o,a,r){let s={};for(let i of t)s[i]=0;for(let i of e){let l=i[0],d=i[1];if(l<o||l>r||d<n||d>a)continue;let m=t[i[3]];m!==void 0&&s[m]++}return s}function ys(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function hs(){return["match",["get","status"],...Object.entries(_e).flatMap(([e,t])=>[e,t.color]),Go]}function fs(){let e=["match",["get","status"],...Object.entries(_e).flatMap(([t,n])=>[t,n.size]),_e.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Ko(e,t){e.addSource(nn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Yo,type:"circle",source:nn,layout:{visibility:"none"},paint:{"circle-color":hs(),"circle-radius":fs(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function bs(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var vs="pin";function Wo(e){return"key"in e?e.key:vs}var nt="any";function ws(e,t,n){return`radius=${e}&${bs(t)}&day=${n}`}function qo(e,t){return e?t:nt}function Xo(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function rn(e,t,n,o=nt){return et=await x(`/api/oneseat?${ws(t,n,o)}`),e.getSource(nn).setData(ys(et)),et}function Zo(e,t){zo=t,e.setLayoutProperty(Yo,"visibility",t?"visible":"none")}function sn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Qo(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=i=>i.length?i.join(", "):"none",s=sn(t);return e.status==="here"?`<b>at ${s}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${s}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var ot={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ln={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Ss=new Set(["gone","new"]);function Ls(e,t,n){return Ss.has(e)?`${t} (${ln[n]})`:t}function $s(e){return e.buckets.filter(t=>t.key!=="none")}var ea={area:"Ground",people:"People"};function _s(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Mo(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=s=>s.toFixed(s<10?1:0);return`
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function ks(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=No(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),r=s=>Math.round(s).toLocaleString();return`
      <div class="lg-area">
        <span><b>${r(a.lost)}</b> people lose all service</span>
        <span><b>${r(a.gained)}</b> gain service</span>
        <span><b>${r(a.kept)}</b> keep a bus</span>
        <span><b>${r(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var xs=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function ta(e){let{layer:t,day:n,bounds:o,unit:a,population:r,scoped:s=!1,named:i=!1}=e,l=Vt.map(([d,m])=>`${m} ${((d+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${l})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service
          (${ln[n]})</span>
        <span><i style="background:${M}"></i>new service
          (${ln[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(ea).map(d=>`
          <button data-surface-unit="${d}" aria-pressed="${a===d}"
                  class="${a===d?"active":""}">${ea[d]}</button>`).join("")}
      </div>
      ${s?xs:a==="people"?ks(n,o,r):_s(t,n,o)}
    </div>`}var Ps=["lost","added","kept"],Rs={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Es={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function oa(e,t){let{lostPct:n,addedPct:o}=Io(t.km),a=i=>i.toFixed(1),s=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${s}</b> km of street, citywide \u2014 ${Es[t.day]}
    </div>
    ${Ps.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${Xe[i]}"></i>
        <span class="lg-lab">${p(Rs[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function aa(e,t,n){let o=t.statuses.map(m=>m.key),a=Vo(t.points,o,n.west,n.south,n.east,n.north),r=m=>t.statuses.find(h=>h.key===m)?.label??m,s=tt.reduce((m,h)=>m+(a[h]??0),0),i=sn(t),l=t.day&&t.day!==nt,d=l?`Restricted to routes running on ${ot[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(i)}</b>
      <span class="muted">\xB7 ${s.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${l?` \xB7 ${ot[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${tt.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${_e[m].color}"></i>
        <span class="lg-lab">${p(r(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${tt.map(m=>`${(t.counts[m]??0).toLocaleString()} ${p(r(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${p(i)} without transferring?
      ${d} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function ra(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var na={locations:"Locations",riders:"Riders"};function Os(e,t){let o=`${t.toLocaleString()} location${t===1?"":"s"} in view`,r=t?`<b>${o}</b> ${t===1?"gains":"gain"} a stop where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",s=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${r}${s}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Ds(e){if(!e)return"";let t=$e(Je);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Je}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Ts(e,t){if(!e)return"";let n=$e(Ge);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Ge}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Ms(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Ds(e)}
      ${Ts(t,n)}
    </div>`}function sa(e,t){let{layer:n,day:o,bounds:a,weight:r,surface:s,unit:i="area",population:l,selection:d,dots:m=!0}=t,h=n.buckets.map(w=>w.key),S=n.days.indexOf(o),{west:$,south:C,east:g,north:De}=a,U=$s(n),k=d&&d.size>0?d:null,Te=k?uo(k):co($,C,g,De),Dn=fo(n.points,S,h,Te),St=bo(n.points,Te),Lt=vo(n.points,Te),D=r==="riders"?wo(n.points,S,h,Te):null,Sr=w=>D?D.measured[w]?Math.round(D.riders[w]).toLocaleString():"\u2014":Dn[w].toLocaleString(),Lr=D?D.removedMeasured?Math.round(D.removedRiders).toLocaleString():"\u2014":Lt.toLocaleString(),$r=k?`at ${k.size.toLocaleString()} selected stop${k.size===1?"":"s"}`:"in view",Tn=U.reduce((w,$t)=>w+Dn[$t.key],0)+St+Lt,_r=D?`<b>${Math.round(U.reduce((w,$t)=>w+D.riders[$t.key],0)+D.removedRiders).toLocaleString()}</b> daily boardings ${$r}`:k?`<b>${Tn.toLocaleString()}</b>
         of ${k.size.toLocaleString()} selected stops`:`<b>${Tn.toLocaleString()}</b>
         locations in view`,kr=!m&&!!s;e.innerHTML=kr?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${ot[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${ta({layer:s,day:o,bounds:a,unit:i,population:l,scoped:!!k,named:!0})}`:`
    <div class="lg-head">
      ${_r}
      <span class="muted">\xB7 ${ot[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(na).map(w=>`
        <button data-weight="${w}" aria-pressed="${r===w}"
                class="${r===w?"active":""}">${na[w]}</button>`).join("")}
    </div>
    ${U.map(w=>`
      <button class="lg-row ${$e(w.key)?"off":""}" data-bucket="${p(w.key)}"
              aria-pressed="${!$e(w.key)}">
        <i style="background:${je[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(Ls(w.key,w.label,o))}</span>
        <span class="lg-n">${Sr(w.key)}</span>
      </button>`).join("")}
    ${Ms(St,Lt,Lr)}
    ${s?ta({layer:s,day:o,bounds:a,unit:i,population:l,scoped:!!k}):""}
    ${D?Os(D.unmeasured,St):""}
    ${k?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var cn="#4aa3ff",ma="#ffa23a",un="headline",at="journey",ga="journey-rides",ya="journey-walks",Cs=[ga,ya],ha=null,fa=!1;function st(){return ha}function dn(){return fa}function As(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let s of r.legs){let i=s.from??e.origin,l=s.to??e.destination,d=[[i.lon,i.lat],[l.lon,l.lat]],m=s.path?.length?s.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:s.kind,route:s.route}})}}return{type:"FeatureCollection",features:o}}function ia(){return["match",["get","side"],"current",cn,"proposed",ma,cn]}function la(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function ba(e,t){e.addSource(at,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ga,type:"line",source:at,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ia(),"line-width":la(1),"line-opacity":.85}},t),e.addLayer({id:ya,type:"line",source:at,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ia(),"line-width":la(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function va(e,t){fa=t;for(let n of Cs)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function pn(e,t){ha=t;let n=t?As(t,un):{type:"FeatureCollection",features:[]};e.getSource(at).setData(n)}function wa(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var ca=e=>`${e.toFixed(1)} min`;function Sa(e){return e==null?"\u2014":e===0?"no change":e>0?`${ca(e)} slower`:`${ca(-e)} faster`}function ua(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function Fs(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=ua(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ua(e.to,"the destination")}</span></div>`}function da(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(Fs(a,t)),o=a}return n.join("")}var Ns={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function rt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Hs(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Bs(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${rt(t.current)} \u2192
        ${rt(t.proposed)} min</span>
        <span class="muted">${Sa(t.change_min)}</span></div>
      ${o}
    </div>`}function pa(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function mn(e,t){let n=e.radii[un],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${p(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${oe(e.window.start_min)}
        and ${oe(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Ns[n.classification]??""}</p>
      </div>
      ${pa(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${rt(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${rt(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Sa(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Hs(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?da(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?da(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Bs(e)}
    ${pa(e)}`}function La(e){return`
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
    </div>`}function $a(e){let t=e?e.radii[un].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${cn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ma}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var ct="places",xa="places-points",gn="places-boundaries",Z="places-fill",le="lost",Is=100,js={lost:"share_lost",gained:"share_gained"};function V(e,t){return`service_${e}_${t}`}var Pa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Us="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",X={lost:T,gained:M},it=null,z=null,ie=null,Ra=!1,lt=null;function yn(){return it}function Ea(){return z}function Oa(){return lt}function hn(){return ie}function ke(){return Ra}function Js(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function Gs(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Ys(e){return Math.max(e.residents_lost,e.residents_gained)}var _a=4,zs=16,Vs=1e3;function Ks(e){let t=Math.min(1,Math.sqrt(e/Vs));return _a+t*(zs-_a)}function Ws(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Gs(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Ks(Ys(t))}}))}}function qs(){return["match",["get","klass"],"lost",X.lost,"gained",X.gained,X.lost]}function Xs(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var I=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var j=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Da(e,t){return e==="service"?["step",["abs",["coalesce",["get",V(t,"pct")],0]],j[0].opacity,j[0].max,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity]:["step",["coalesce",["get",js[e]],0],I[0].opacity,Number.EPSILON,I[1].opacity,I[1].max,I[2].opacity,I[2].max,I[3].opacity,I[3].max,I[4].opacity]}function Ta(e,t){return e==="service"?["case",[">=",["coalesce",["get",V(t,"pct")],0],0],M,T]:X[e]}function Zs(e,t){let n=V(t,"now"),o=V(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var Qs=3;function ei(e){if(e.length===0)return"";let t=e.slice(0,Qs),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function Ma(e,t){e.addSource(gn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Z,type:"fill",source:gn,layout:{visibility:"none"},paint:{"fill-color":Ta(le),"fill-opacity":Da(le),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(ct,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:xa,type:"circle",source:ct,layout:{visibility:"none"},paint:{"circle-color":qs(),"circle-radius":Xs(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function ut(e,t,n){e.setPaintProperty(Z,"fill-color",Ta(t,n)),e.setPaintProperty(Z,"fill-opacity",Da(t,n))}async function Ca(){return it||(it=await x("/api/places")),it}async function Aa(e){return ie||(ie=await x("/api/boundaries"),e.getSource(gn).setData(ie)),ie}function ti(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Fa(e,t){let n=ti(ie,t);if(n)return z=null,lt=n,e.getSource(ct)?.setData({type:"FeatureCollection",features:[]}),null;try{z=await x(`/api/places/${encodeURIComponent(t)}`)}catch{return z=null,lt=null,null}return lt=null,e.getSource(ct).setData(Ws(z)),e.flyTo({center:[z.lon,z.lat],zoom:13}),z}function Na(e,t){Ra=t,e.setLayoutProperty(xa,"visibility",t?"visible":"none"),e.setLayoutProperty(Z,"visibility",t?"visible":"none")}function ni(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${p(e.key)}">
      <span class="place-name">${p(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var oi="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ha(e,t,n,o){let a=Js(e,t).map(r=>ni(r,r.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Us}</p>
    ${o==="service"?`<p class="note">${oi}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Ba(e,t){return e?`<div class="lg-head"><b>${p(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${p(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function ai(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function ri(e,t,n,o){let a=j.map((l,d)=>({band:l,prevMax:d===0?0:j[d-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:d})=>{let m=ai(l,d);return[`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${M};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} more trips</span></div>`]}).join(""),r=o?Zs(o,n):[],s=ei(r),i=s?`<div class="lg-foot">${p(s)}</div>`:"";return`
    ${Ba(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${p(Pa[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Ia({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return ri(e,a??null,n,o??null);let r=t==="lost"?"lose all buses":"gain a bus",s=I.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${X[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${p(i.label)} of the place's own residents ${p(r)}</span>
    </div>`).join("");return`
    ${Ba(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${p(r)}</div>
    ${s}
    <div class="lg-row lg-static"><i style="background:${X.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${X.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function si(e,t){let n=e[V(t,"now")],o=e[V(t,"proposed")],a=e[V(t,"pct")],r=e[V(t,"rail_proposed")],s=Pa[t];if(o===0&&n>0)return`Loses all buses on ${s} (${n} \u2192 0 trips)${r?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${s} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${s} (${i}).`}function ja(e,t,n){if(t==="service")return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      ${si(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=ka("lose all buses",e.residents_lost,e.share_lost),r=e.residents_gained>0?ka("gain a bus",e.residents_gained,e.share_gained):null,s=(t==="lost"?[a,r]:[r,a]).filter(i=>i!==null);return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
    ${s.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function ka(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Is} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var fn=" \xB7 ",bn={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Ua=Object.keys(bn);function Ja(e){return bn[e]??e}var ii={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},li=["oneseat","journey"];function ci(e){return e!=="journey"}function ui(e){let t=[bn[e.view]??e.view];return e.view==="places"?t[0]:(li.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":ii[e.day]),ci(e.view)&&t.push(`${e.radius} m walk`),t.join(fn))}function Ga(e){let[t,...n]=ui(e).split(fn);return`<b>${p(t)}</b>${n.map(o=>fn+p(o)).join("")}`}var f={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},di=/^[cp]:[\w.:-]{1,32}$/,dt={any:"any",selected:"selected"},pi="pin",Ya=5;function Va(e){try{return e.self!==e.top}catch{return!0}}function Ka(e){let t=new URLSearchParams;return t.set(f.view,e.view),t.set(f.day,e.day),t.set(f.radius,String(e.radius)),t.set(f.oneSeatDay,e.oneSeatRestricted?dt.selected:dt.any),t.set(f.dest,"key"in e.dest?e.dest.key:vn(e.dest)),e.weight==="riders"&&t.set(f.weight,e.weight),e.surfaceUnit==="people"&&t.set(f.surfaceUnit,e.surfaceUnit),e.at&&t.set(f.at,vn(e.at)),e.camera&&t.set(f.camera,`${vn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(f.place,e.place),e.placeFill!==le&&t.set(f.placeFill,e.placeFill),e.selection.length&&t.set(f.selection,e.selection.join(",")),`?${t}`}function Wa(e){let t=new URLSearchParams(e),n={},o=t.get(f.view);o&&Ua.includes(o)&&(n.view=o);let a=t.get(f.day);a&&R.includes(a)&&(n.day=a);let r=Number(t.get(f.radius));t.has(f.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(f.weight)==="riders"?n.weight="riders":t.get(f.weight)==="locations"&&(n.weight="locations"),t.get(f.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(f.surfaceUnit)==="area"&&(n.surfaceUnit="area");let s=t.get(f.oneSeatDay);s===dt.selected?n.oneSeatRestricted=!0:s===dt.any&&(n.oneSeatRestricted=!1);let i=t.get(f.dest);if(i&&i!==pi){let $=za(i);$?n.dest=$:i.includes(",")||(n.dest={key:i})}let l=za(t.get(f.at));l&&(n.at=l);let d=mi(t.get(f.camera));d&&(n.camera=d);let m=t.get(f.place);m&&(n.place=m);let h=t.get(f.selection);h!==null&&(n.selection=h.split(",").filter($=>di.test($)));let S=t.get(f.placeFill);return(S==="lost"||S==="gained"||S==="service")&&(n.placeFill=S),n}function vn(e){return`${e.lat.toFixed(Ya)},${e.lon.toFixed(Ya)}`}function za(e){let t=qa(e,2);return t?{lat:t[0],lon:t[1]}:null}function mi(e){let t=qa(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function qa(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var wn="embed";var gi=["1","true","yes"];function Xa(e){let t=new URLSearchParams(e).get(wn);return t!==null&&gi.includes(t.toLowerCase())}function Za(e){let t=new URLSearchParams(e);return t.set(wn,"1"),`?${t}`}function Qa(e){let t=new URLSearchParams(e);t.delete(wn);let n=String(t);return n?`?${n}`:""}function er(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var K=["peek","half","full"],yi=192,hi=.3,fi=.55,bi=.9,vi=.6,wi=.45;function pt(e,t){return e==="peek"?Math.min(yi,t*hi):e==="half"?t*fi:t*bi}function Si(e,t,n=0){let o=K.map(r=>Math.abs(pt(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>vi&&(a=Math.max(0,Math.min(K.length-1,a+(n>0?1:-1)))),K[a]}function tr(e){return K[(K.indexOf(e)+1)%K.length]}function Li(e,t){return Math.min(e,t*wi)}function ce(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Sn(e){let t=null,n=()=>{let o=ce();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var $i=8,_i=400;function nr(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,r=0,s=0,i=0,l={y:0,t:0};function d(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,Li(g,d()))}function h(g){o=g,t.dataset.snap=g,m(pt(g,d()))}n.addEventListener("pointerdown",g=>{ce()&&(a=!0,r=g.clientY,s=t.getBoundingClientRect().height,i=g.timeStamp,l={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!a)return;let De=s+(r-g.clientY),U=pt("peek",d()),k=pt("full",d());m(Math.max(U,Math.min(k,De))),l={y:g.clientY,t:g.timeStamp}});function S(g){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-r)>$i)&&g.timeStamp-i<_i){h(tr(o));return}let U=g.timeStamp-l.t,k=U>0?(l.y-g.clientY)/U:0;h(Si(t.getBoundingClientRect().height,d(),k))}n.addEventListener("pointerup",S),n.addEventListener("pointercancel",S),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),ce()&&h(tr(o)))});let $=Sn(e.onLayoutChange);function C(){if($(),!ce()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}h(o)}return window.addEventListener("resize",C),C(),{at:()=>ce()?o:"full",atLeast(g){ce()&&K.indexOf(g)>K.indexOf(o)&&h(g)}}}var ki=["llvmpipe","swiftshader","softpipe","basic render","software"];function Ln(e){if(!e)return!1;let t=e.toLowerCase();return ki.some(n=>t.includes(n))}function ar(e){let t=Ln(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function rr(e){return Ln(e.renderer)?0:xi}var xi=300,Pi="https://tiles.openfreemap.org/styles/positron",Ri=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],or=[],Ei=19,Oi='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Di=!1;function sr(e){return!Di||!Ln(e.renderer)?Pi:Ti()}function Ti(){let e=o=>({type:"raster",tileSize:256,attribution:Oi,tiles:o,maxzoom:Ei}),t={basemap:e(Ri)},n=[{id:"basemap",type:"raster",source:"basemap"}];return or.length&&(t["basemap-labels"]=e(or),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function ir(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),a=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof a=="string"?a:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Mi(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function lr(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),a=null,r="",s=l=>{r!==l&&(r=l,e.getCanvas().style.cursor=l)},i=()=>{a=null,s(""),t.remove()};return e.on("mousemove",l=>{let d=n.map(g=>g.layer).filter(g=>e.getLayer(g)&&e.getLayoutProperty(g,"visibility")!=="none");if(!d.length){i();return}let[m]=e.queryRenderedFeatures(l.point,{layers:d});if(!m){i();return}s("pointer");let h=Mi(m);if(h===a)return;let S=o.get(m.layer?.id),$=S?S.html(m):null;if($==null){a=null,t.remove();return}a=h;let C=S.anchor?S.anchor(m,l):l.lngLat;t.setLngLat(C).setHTML($).addTo(e)}),e.on("mouseout",i),i}var Ci=[-79.9959,40.4406],Ai=12,Fi="#e2574c",O={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},Pe=Wa(location.search),Ee=Xa(location.search);Ee&&c("app").classList.add("embed");var Ni={at:()=>"full",atLeast(){}},pr=null,P=400,xe=null,b=null,de=null,te=0,_={key:"downtown"},Q=null,mr=!1,ge=!1,bt="locations",ye="area",gr="count",ft=null,F=le,H=!1,y="dots",yr,xn=[],cr=()=>{},$n=ir(),u=new maplibregl.Map({container:"map",style:sr($n),pixelRatio:ar($n),fadeDuration:rr($n),renderWorldCopies:!1,center:Pe.camera?[Pe.camera.lon,Pe.camera.lat]:Ci,zoom:Pe.camera?.zoom??Ai,cooperativeGestures:Va(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{Fn(u),_o(u),Ao(u,Ye),jo(u,Ye),Ko(u,"walk-fill"),ba(u),Ma(u,Ye),N(),u.on("click",t=>{if(H)return;if(mr){Re({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(y==="places"){let r=u.queryRenderedFeatures(t.point,{layers:[Z]})[0];r&&gt(r.properties.key);return}let n=[...Ht,"oneseat-dots"].filter(r=>u.getLayoutProperty(r,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];On(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});cr=lr(u,e,[...Nn(),...Ht.map(t=>({layer:t,html:n=>{let o=Bt();return o?Po(n.properties,L(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=se();return n?Qo(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:Z,html:t=>ja(t.properties,F,L())}]),Qi(),u.on("moveend",()=>{let t=u.getCenter();pr={lat:t.lat,lon:t.lng,zoom:u.getZoom()},v(),B()}),ue(O.radius,t=>{P=Number(t.dataset.radius),Jt(u,P,L()).then(v),Ke()&&Wt(u,P,L()).then(v),We()&&Zt(P).then(v),se()&&yt(),b&&pe(b.lat,b.lon)}),ue(O.day,t=>{let n=t.dataset.day;Zn(n),y!=="journey"&&N(),Gt(u,n),qt(u,n),y==="journey"&&b&&Pn(b.lat,b.lon),Qe()&&Uo(u,n).then(v),ge&&se()&&(yt(),b&&pe(b.lat,b.lon)),ke()&&F==="service"&&ut(u,F,n),v()}),ue(O.oneSeatDay,t=>{ge=t.dataset.oneseatDay==="selected",kn(),yt(),b&&pe(b.lat,b.lon)}),ue(O.view,t=>{let n=y;y=t.dataset.view,cr(),lo(u,y==="dots"||y==="both"),Ji(y==="surface"||y==="both"),Yi(y==="corridors"),Wi(y==="oneseat"),Ki(y==="journey",n==="journey"),zi(y==="places"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),Vi(y!=="corridors"&&y!=="journey"&&y!=="places");let o=y==="oneseat"||y==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",y!=="places"),he()||ur(!1),me(),kn(),o||ht(!1),fr()}),ue(O.dest,t=>{let n=t.dataset.dest;if(n==="pin"){ht(!0);return}ht(!1),Re({key:n})}),ue(O.placeFill,t=>{F=t.dataset.placeFill,ke()&&ut(u,F,L()),N(),v(),kn()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){bt=n.dataset.weight,v(),B();return}let o=t.target.closest("[data-surface-unit]");if(o){ye=o.dataset.surfaceUnit,Gi(ye),B();return}let a=t.target.closest("[data-bucket]");a&&(ko(u,a.dataset.bucket,L()),v())}),c("legend-reset").addEventListener("click",()=>{xo(u,L()),v()}),c("legend-select").addEventListener("click",()=>ur(!H)),c("legend-clear").addEventListener("click",()=>{jt(u),me(),v(),B()}),c("legend-collapse").addEventListener("click",()=>{_n(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Re({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&nl(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&gt(a.dataset.selectPlace);let r=t.target.closest("[data-sort-places]");r&&(gr=r.dataset.sortPlaces,N());let s=t.target.closest("[data-goto-place]");s&&(y!=="places"&&ee(O.view,"places"),gt(s.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",ji),Ee&&Sn(_n),yr=Ee?Ni:nr({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:_n}),Bi(),wt(),me(),vt(),Hi(Pe)||Jt(u,P,L()).then(v),tl(),el()});function ue(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),wt(),B()})})}function ee(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Hi(e){let t=!1;return e.radius!==void 0&&(t=ee(O.radius,String(e.radius))||t),e.day&&(t=ee(O.day,e.day)||t),e.oneSeatRestricted!==void 0&&ee(O.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(bt=e.weight),e.surfaceUnit&&(ye=e.surfaceUnit),e.placeFill&&ee(O.placeFill,e.placeFill),e.dest&&("key"in e.dest?ee(O.dest,e.dest.key):Re(e.dest)),e.selection&&ho(u,e.selection),e.view&&ee(O.view,e.view),e.at&&On(e.at.lat,e.at.lon),e.place&&gt(e.place),t}function B(){let e={view:y,day:L(),radius:P,oneSeatRestricted:ge,weight:bt,surfaceUnit:ye,dest:_,at:b,camera:pr,place:ft,placeFill:F,selection:mo()},t=Ka(e);history.replaceState(null,"",(Ee?Za(t):t)+location.hash),vt(t)}function vt(e=Qa(location.search)){if(!Ee)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=b?de?we(de):"this point":null;t.querySelector(".el-action").textContent=er(n)}function wt(){c("statebar").innerHTML=Ga({view:y,day:L(),radius:P,oneSeatRestricted:ge,destination:Oe()}),Ii()}function _n(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Bi(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Ii(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Ja(y)))}function ji(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function v(){Ui()}function Ui(){if(c("legend-reset").classList.toggle("hidden",en()||an()||dn()||ke()||!he()),dn()){c("legend").innerHTML=$a(st());return}if(ke()){c("legend").innerHTML=Ia({selected:Ea(),fill:F,day:L(),boundaries:hn(),unchanged:Oa()});return}if(en()){let n=Qe();n&&oa(c("legend"),n);return}if(an()){let n=se();if(!n)return;let o=u.getBounds();aa(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Bt();if(!e)return;let t=u.getBounds();sa(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:bt,dots:he(),surface:Kt()?Ke():null,unit:ye,population:We(),selection:po()})}async function Ji(e){if(e&&!Ke()){c("legend").classList.add("loading");try{await Wt(u,P,L())}finally{c("legend").classList.remove("loading")}}Fo(u,e),e&&ye==="people"&&await hr(),v()}async function hr(){if(!We()){c("legend").classList.add("loading");try{await Zt(P)}finally{c("legend").classList.remove("loading")}}}async function Gi(e){e==="people"&&Kt()&&await hr(),v()}async function Yi(e){if(e&&!Qe()){c("legend").classList.add("loading");try{await tn(u,L())}finally{c("legend").classList.remove("loading")}}Jo(u,e),v()}async function zi(e){if(e&&(!yn()||!hn())){c("legend").classList.add("loading");try{await Promise.all([Ca(),Aa(u)])}finally{c("legend").classList.remove("loading")}}Na(u,e),e&&ut(u,F,L()),e&&N(),v()}async function gt(e){ft=await En(()=>Fa(u,e))?e:null,y==="places"&&(N(),ft&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),B()}function Vi(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),vt(),y==="places"){c("panel").innerHTML=Ha(yn()??[],gr,ft,F);return}if(!de){y==="oneseat"?c("panel").innerHTML=ao(Oe()):Qn(c("panel"));return}if(y==="oneseat"){let t=oo(de,_,L());if(t){c("panel").innerHTML=t;return}}no(de)}function Ki(e,t=!1){if(va(u,e),v(),!e){t&&(b?pe(b.lat,b.lon):N());return}st()&&b?c("panel").innerHTML=mn(st(),Oe()):c("panel").innerHTML=La(Oe())}async function Pn(e,t){let n=++te;b={lat:e,lon:t},B(),vr(e,t);let o=br(),a=p(Oe());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await x(wa({lat:e,lon:t},o,L()));if(n!==te)return;pn(u,r),c("panel").innerHTML=mn(r,a),v(),vt()}catch(r){if(n!==te)return;pn(u,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function kn(){c("day-controls").classList.toggle("hidden",!Xo(y,ge,F))}function Rn(){return qo(ge,L())}async function Wi(e){e&&!se()&&await En(()=>rn(u,P,_,Rn())),Zo(u,e),v()}async function yt(){await En(()=>rn(u,P,_,Rn())),v()}async function En(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Re(e){if(_=e,ht(!1),qi(),fr(),wt(),B(),y==="journey"){b&&Pn(b.lat,b.lon),v();return}b?pe(b.lat,b.lon):N({scrollToTop:!0}),yt()}function fr(){let e=br();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in _))){Q?.remove(),Q=null;return}Q?Q.setLngLat([e.lon,e.lat]).addTo(u):(Q=new maplibregl.Marker({color:on,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),Q.on("dragend",()=>{let n=Q.getLngLat();Re({lat:n.lat,lon:n.lng})}))}function qi(){let e=Wo(_);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function br(){if("lat"in _)return{lat:_.lat,lon:_.lon};let e=_.key,t=xn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Oe(){if("lat"in _)return`${_.lat.toFixed(4)}, ${_.lon.toFixed(4)}`;let e=_.key;return xn.find(t=>t.key===e)?.name??e}function ht(e){mr=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function pe(e,t){let n=++te;b={lat:e,lon:t},B(),c("panel").classList.add("loading"),vr(e,t);try{let o="lat"in _?`&dest_lat=${_.lat.toFixed(6)}&dest_lon=${_.lon.toFixed(6)}`:"",a=await x(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${o}&oneseat_day=${Rn()}`);if(n!==te)return;Hn(u,e,t,P,a.current.stops,a.proposed.stops),Xi(),de=a,N({scrollToTop:!0})}catch(o){if(n!==te)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===te&&c("panel").classList.remove("loading")}}function Xi(){c("pin-key").innerHTML=ra(P),c("pin-key").classList.remove("hidden")}function vr(e,t){xe?xe.setLngLat([t,e]):(xe=new maplibregl.Marker({color:Fi,draggable:!0}).setLngLat([t,e]).addTo(u),xe.on("dragend",()=>{let n=xe.getLngLat();On(n.lat,n.lng)}))}var mt=14;function he(){return y==="dots"||y==="both"}function ur(e){H=e&&he(),H?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=H?"none":"",H||wr(),me()}function me(){let e=c("legend-select");e.classList.toggle("hidden",!he()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!he()||!go())}function Zi(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function dr(e){c("brush").classList.toggle("painting",e)}function wr(){c("brush").hidden=!0}function Qi(){let e=c("brush");e.style.width=`${mt*2}px`,e.style.height=`${mt*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,me(),v()}))},r=()=>{H&&(t=!0,n=!1,dr(!0))},s=l=>{if(Zi(l.point.x,l.point.y),!t)return;n=!0,It(u,Ut(u,l.point.x,l.point.y,mt))&&a()},i=l=>{if(dr(!1),!!t){if(t=!1,!n){let[d]=Ut(u,l.point.x,l.point.y,mt);d&&yo(u,d)}me(),v(),B()}};u.on("mousedown",r),u.on("mousemove",s),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",wr),u.on("touchstart",r),u.on("touchmove",s),u.on("touchend",i)}function On(e,t){if(yr.atLeast("half"),y==="journey"){Pn(e,t);return}y!=="places"&&pe(e,t)}async function el(){try{xn=await x("/api/destinations"),wt()}catch{}}async function tl(){try{let e=await x("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function nl(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
