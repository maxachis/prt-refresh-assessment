"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function x(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Pt=new Map;function ae(e){let t=Pt.get(e);if(t)return t;let n=x(e).catch(o=>{throw Pt.delete(e),o});return Pt.set(e,n),n}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function re(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Rt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Et(e){return e>0?`+${e}`:String(e)}function Nn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Tr="#15181e",Hn="#ffa23a",Mr="#ffffff";function Cr(e,t,n,o=96){let a=[],r=n/111320,s=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;a.push([t+s*Math.cos(l),e+r*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function j(e){return{type:"FeatureCollection",features:e}}function Ar(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Fr(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",a=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${a}`}function Ot(e){return e!=="corridors"&&e!=="journey"&&e!=="places"}function Dt(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(j([]))}function Bn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function In(e){e.addSource("walk",{type:"geojson",data:j([])}),e.addSource("stops-now",{type:"geojson",data:j([])}),e.addSource("stops-prop",{type:"geojson",data:j([])}),e.addSource("stop-moves",{type:"geojson",data:j([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Hn,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Mr,"circle-stroke-width":3,"circle-stroke-color":Hn}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Tr,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function jn(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Fr(n.properties,e(o))}))}function Un(e,t,n,o,a,r){e.getSource("walk").setData(j([Cr(t,n,o)])),e.getSource("stops-now").setData(j(Bn(a,"current"))),e.getSource("stops-prop").setData(j(Bn(r,"proposed"))),e.getSource("stop-moves").setData(j(Ar(r)))}var P=["weekday","saturday","sunday"],Tt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Jn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ce=4,Ae=6,Gn=e=>Ae+Ce*e,Yn=e=>Ae+1+Ce*e,we=e=>Ae+2+Ce*e,Nr=e=>Ae+3+Ce*e,Fe=2,Hr=3,Se=4,zn=5,se=e=>e[Hr],R=(e,t)=>e[t],Vn=(e,t)=>e[Nr(t)],Mt=e=>2+2*e,Ct=e=>3+2*e,Ne=4,Wn=e=>2+Ne*e,Kn=e=>3+Ne*e,qn=e=>4+Ne*e,Xn=e=>5+Ne*e;var Ft="weekday";function S(){return Ft}function oo(e){Ft=e}function ao(e){e.innerHTML=`
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
    </div>`}function Br(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Ir(e,t){let n=Math.max(1,...Tt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Tt.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,s=r-a,i=s>0?"up":s<0?"down":"flat";return`
      <tr>
        <th>${Jn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${i}">${s===0?"\xB7":Et(s)}</td>
      </tr>`}).join("")}function ro(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Zn(e){return e.first==null?'<span class="muted">no service</span>':`${re(e.first)}\u2013${re(e.last)}`}function Qn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var jr={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Ur={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Jr(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Ie(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(o.name)}</span>
          <span class="os-status ${p(o.status)}">${jr[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Ur[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Be("one-seat")}</p>
    </div>`:""}function Be(e){return` <button class="howto" data-caveat="${e}">method</button>`}function He(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function eo(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function to(e){return e.first==null||e.last==null?null:e.last-e.first}function Ie(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${no(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${no(t,n,"prop")}</div>
    </div>`}function no(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${p(o)}</span>`).join(" "):'<span class="muted">none</span>'}var At=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Gr="Allegheny";function Le(e){let t=e.place?.muni?.trim()??"",n=At.exec(t)?.[1],o=n===Gr?t.replace(At,""):n?`${t.replace(At,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Nt(e){return e==="weekday"?"weekday":e}function so(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Nt(t)}`}function Yr(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function zr(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",r=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",s=[a,r].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${s}</div></dd>`}function Vr(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Nt(t)}, today only</span>`}${o}</dd>`}function Wr(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Be("boardings")}</p>`}function Kr(e){if(!e)return"";let t=p(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${Be("place-population")}</p>
    </div>`}function Ht(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],r=a.trips-o.trips,s=r>0?"up":r<0?"down":"flat",i=Qn(o),l=Qn(a),d=to(o),m=to(a);return`
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
        ${r===0?"no change":`${Et(r)} trips`}
        <div class="muted">${Nn(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Nt(t)}, both directions</div>

    <div class="tiers">${Br(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Ir(o,a)}</tbody>
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
      ${He(Zn(o),Zn(a))}
      <dt>Hours between</dt>
      ${He(Rt(d),Rt(m),eo(d,m,"more"))}
      <dt>Typical wait</dt>
      ${He(i==null?"\u2014":`${i} min`,l==null?"\u2014":`${l} min`,eo(i,l,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${He(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${zr(e.current.stops)}
      ${Yr(e.proposed.stops)}
      ${Vr(o.boardings,t)}
    </dl>
    ${Wr(o.boardings)}

    ${n}

    ${Kr(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Ie(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Be("location-not-route")}</p>
    </div>`}function io(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${p(Le(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ht(e,Ft,Jr(e.oneseat??[],e.oneseat_day??"any"))}`}var qr={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Xr={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Zr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Qr(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Bt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${ro(t)}</div>`:""}function es(e){let t=Bt("kept",e.kept)+Bt("lost",e.lost)+Bt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ts(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Ie(e.current,e.proposed)}
    </div>`}function ns(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${p(a.key)}">
      <span class="os-name">${p(a.name)}</span>
      <span class="os-status ${p(a.status)}">${os[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var os={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function as(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Zr[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function lo(e,t,n){let o=Qr(e,t);if(!o)return"";let a=e.oneseat_day??"any",r=o.status==="here"?"":es(o)+ts(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${p(o.name)}</h2>
      <div class="muted">
        from ${p(Le(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${p(o.status)}">${qr[o.status]}</div>
    <p class="note">${Xr[o.status]} ${as(a)}</p>

    ${r}

    ${ns(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${so(e,n)}</summary>
      ${Ht(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function co(e){return`
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
    </div>`}var Ue={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ie="change",z="change-dots",X=["boolean",["feature-state","selected"],!1],uo="#15181e",Z=["==",["get","published"],0],Ge="newplace",rs="#15181e",ss=5,Je=["==",["get","removed"],1],Ye="removedstop",ke="change-removed",Ut="change-removed-selected",It="removed-cross",mo="#e8232f";function is(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[r,s]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,mo]])o.lineWidth=r,o.strokeStyle=s,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var je=null,Y=new Set,A=new Set,ls=[z,Ut,ke],ze=[z,ke],Ve=z;function go(e,t){for(let n of ls)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function We(){return je}function _e(e){return Y.has(e)}function yo(e,t,n,o){return a=>ds(a,e,t,n,o)}function ho(e){return t=>e.has(se(t))}function fo(){return A}function bo(){return[...A].sort()}function vo(){return A.size}function Jt(e,t){let n=0;for(let o of t)A.has(o)||(A.add(o),$e(e,o,!0),n++);return n}function wo(e,t){A.delete(t)?$e(e,t,!1):(A.add(t),$e(e,t,!0))}function So(e,t){Gt(e),Jt(e,t)}function Gt(e){for(let t of A)$e(e,t,!1);A.clear()}function $e(e,t,n){try{e.setFeatureState({source:ie,id:t},{selected:n})}catch{}}function cs(e){for(let t of A)$e(e,t,!0)}function us(e,t,n,o){let a=n*n;return o.filter(r=>(r.x-e)**2+(r.y-t)**2<=a).map(r=>r.id)}function Yt(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],r=[z,ke].filter(i=>e.getLayer(i)),s=e.queryRenderedFeatures(a,{layers:r}).filter(i=>i.id!==void 0).map(i=>{let[l,d]=i.geometry.coordinates,m=e.project([l,d]);return{id:i.id,x:m.x,y:m.y}});return us(t,n,o,s)}function Lo(e,t,n,o){let a={};for(let r of n)a[r]=0;for(let r of e){if(!o(r)||R(r,Fe)===0||R(r,Se)===1)continue;let s=n[R(r,we(t))];s!==void 0&&a[s]++}return a}function $o(e,t){let n=0;for(let o of e)t(o)&&R(o,Fe)===0&&n++;return n}function ko(e,t){let n=0;for(let o of e)t(o)&&R(o,Se)===1&&n++;return n}function ds(e,t,n,o,a){let r=R(e,0),s=R(e,1);return r>=n&&r<=a&&s>=t&&s<=o}function _o(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let r of n)a.riders[r]=0,a.measured[r]=0;for(let r of e){if(!o(r)||R(r,Fe)===0)continue;let s=n[R(r,we(t))];if(s===void 0)continue;let i=Vn(r,t),l=R(r,Se)===1;if(i===null){s!=="none"&&a.unmeasured++;continue}if(l){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[s]+=i,a.measured[s]++}return a}function ps(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>P.some((o,a)=>t[R(n,we(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:se(n),published:n[2],removed:n[Se],name:n[zn],moved:e.moved?.[se(n)]??null,replacement:e.replacement?.[se(n)]?.[0]??null,nearestStraight:e.replacement?.[se(n)]?.[1]??null,...Object.fromEntries(P.flatMap((o,a)=>[[`b${a}`,t[R(n,we(a))]],[`sc${a}`,n[Gn(a)]],[`sp${a}`,n[Yn(a)]]]))}}))}}function xo(e,t){let n=Object.entries(Ue).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Ue.none[t]]}function Po(e){return["case",Z,"rgba(0,0,0,0)",xo(e,"color")]}function jt(e){return["case",Z,ss,xo(e,"size")]}function Ro(e){return["interpolate",["linear"],["zoom"],9,["*",jt(e),.45],12,jt(e),16,["*",jt(e),1.9]]}function Eo(e){e.addSource(ie,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:z,type:"circle",source:ie,paint:{"circle-color":Po(0),"circle-radius":Ro(0),"circle-opacity":.85,"circle-stroke-color":["case",X,uo,Z,rs,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,Z,.9,.5],12,["case",X,2.4,Z,1.5,1],16,["case",X,3.2,Z,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Ut,type:"circle",source:ie,filter:Je,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":uo,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,0],12,["case",X,2.4,0],16,["case",X,3.2,0]]}},"walk-fill"),e.hasImage(It)||e.addImage(It,is(),{pixelRatio:2}),e.addLayer({id:ke,type:"symbol",source:ie,filter:Je,layout:{"icon-image":It,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function zt(e,t,n){return je=await ae(`/api/change?radius=${t}`),e.getSource(ie).setData(ps(je)),cs(e),Vt(e,n),je}function Vt(e,t){let n=P.indexOf(t);e.setPaintProperty(z,"circle-color",Po(n)),e.setPaintProperty(z,"circle-radius",Ro(n)),Wt(e,t)}function Oo(e,t,n){Y.has(t)?Y.delete(t):Y.add(t),Wt(e,n)}function Do(e,t){Y.clear(),Wt(e,t)}function Wt(e,t){let n=P.indexOf(t),o=["none",...Y],a=["case",Z,!Y.has(Ge),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(z,["all",["!",Je],a]);let r=["all",Je,!Y.has(Ye)];e.setFilter(ke,r),e.setFilter(Ut,r)}function ms(e){let t=String(e.id??"").split(":")[1]??"",n=e.moved!=null?`<br>the plan stands this pole ${e.moved} m away`:"";return`<b>${e.name}</b><br>stop ${t}${n}<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)"></div>`}function Kt(e,t,n,{pole:o=!0}={}){let a=P.indexOf(t),r=e[`b${a}`],s=e.removed===1,i=e.published===0?"the plan adds a stop here":n.find(h=>h.key===r)?.label??r,l=e[`sc${a}`],d=e[`sp${a}`],m=t==="weekday"?"weekday":t;return`${o?ms(e):""}${ys(e)}${l} \u2192 ${d} buses per ${m} at this stop<br>${s?"":`<b>${i}</b><br>`}<span style="opacity:.6">click for the full comparison</span>`}var gs=1.5,po=800;function ys(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??po,a=n!=null&&o>n*gs?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",r=t==null?`no other stop within a ${po} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${mo}">Stop removed</b> \u2014 ${r}<br>`}var qt="surface",qe="surface-fill",To="#6b7280",Xt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,To],[.138,To],[1,"#bd60e7"],[2,"#961bed"]],M="#e8232f",C="#0f79c9",Mo=2,Ke=null,Co=!1;function Xe(){return Ke}function Zt(){return Co}function Ao(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Mo,Math.min(Mo,n))}function Fo(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function No(e,t,n,o,a,r,s,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let m=s.lat0+(d[1]+.5)*s.dlat,h=s.lon0+(d[0]+.5)*s.dlon;if(m<o||m>r||h<n||h>a)continue;let L=d[Mt(t)],$=d[Ct(t)],D=Fo(L,$);if(D!=="none")if(D==="ramp"){let y=Ao(L,$);l[y<-.138?"less":y>.138?"more":"same"]+=i}else l[D]+=i}return l}function hs(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let s=t+r[1]*o,i=s+o,l=n+r[0]*a,d=l+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,s],[d,s],[d,i],[l,i],[l,s]]]},properties:Object.fromEntries(P.flatMap((m,h)=>{let L=r[Mt(h)],$=r[Ct(h)];return[[`k${h}`,Fo(L,$)],[`v${h}`,Ao(L,$)??0]]}))}})}}function Ho(e){return["case",["==",["get",`k${e}`],"gone"],M,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Xt.flatMap(([t,n])=>[t,n])]]}function le(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Bo(e,t){e.addSource(qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:qe,type:"fill",source:qt,layout:{visibility:"none"},paint:{"fill-color":Ho(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,le(0,.85),13,le(0,.62),16,le(0,.45)]}},t)}async function Qt(e,t,n){return Ke=await ae(`/api/surface?radius=${t}`),e.getSource(qt).setData(hs(Ke)),en(e,n),Ke}function en(e,t){let n=P.indexOf(t);e.setPaintProperty(qe,"fill-color",Ho(n)),e.setPaintProperty(qe,"fill-opacity",["interpolate",["linear"],["zoom"],9,le(n,.85),13,le(n,.62),16,le(n,.45)])}function Io(e,t){Co=t,e.setLayoutProperty(qe,"visibility",t?"visible":"none")}var tn=null;function Ze(){return tn}async function nn(e){return tn=await ae(`/api/population?radius=${e}`),tn}function jo(e,t,n,o,a,r,s){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let d=s.lat0+(l[1]+.5)*s.dlat,m=s.lon0+(l[0]+.5)*s.dlon;d<o||d>r||m<n||m>a||(i.lost+=l[Wn(t)],i.gained+=l[Kn(t)],i.kept+=l[qn(t)],i.none+=l[Xn(t)])}return i}var on="corridor",Uo="corridor-lines",tt="#8b929c",fs="#6f7783",et={lost:M,added:C,kept:tt};var Qe=null,Jo=!1;function nt(){return Qe}function an(){return Jo}function bs(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Go(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function vs(){let e=t=>["match",["get","klass"],"lost",et.lost,"added",et.added,t];return["interpolate",["linear"],["zoom"],9,e(fs),14,e(tt)]}function ws(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Ss(){return["match",["get","klass"],"kept",.85,.9]}function Yo(e,t){e.addSource(on,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Uo,type:"line",source:on,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":vs(),"line-width":ws(),"line-opacity":Ss()}},t)}async function rn(e,t){return Qe=await x(`/api/corridors?day=${t}`),e.getSource(on).setData(bs(Qe)),Qe}async function zo(e,t){P.includes(t)&&await rn(e,t)}function Vo(e,t){Jo=t,e.setLayoutProperty(Uo,"visibility",t?"visible":"none")}var ln="#2b3038",Wo="#b9bec6",xe={loses:{color:M,size:6},gains:{color:C,size:6},keeps:{color:tt,size:3},here:{color:ln,size:3.5},none:{color:Wo,size:1.8}},at=["loses","gains","keeps","none","here"],sn="oneseat",Ko="oneseat-dots",ot=null,qo=!1;function ce(){return ot}function cn(){return qo}function Xo(e,t,n,o,a,r){let s={};for(let i of t)s[i]=0;for(let i of e){let l=i[0],d=i[1];if(l<o||l>r||d<n||d>a)continue;let m=t[i[3]];m!==void 0&&s[m]++}return s}function Ls(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function $s(){return["match",["get","status"],...Object.entries(xe).flatMap(([e,t])=>[e,t.color]),Wo]}function ks(){let e=["match",["get","status"],...Object.entries(xe).flatMap(([t,n])=>[t,n.size]),xe.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Zo(e,t){e.addSource(sn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ko,type:"circle",source:sn,layout:{visibility:"none"},paint:{"circle-color":$s(),"circle-radius":ks(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function _s(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var xs="pin";function Qo(e){return"key"in e?e.key:xs}var rt="any";function Ps(e,t,n){return`radius=${e}&${_s(t)}&day=${n}`}function ea(e,t){return e?t:rt}function ta(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function un(e,t,n,o=rt){return ot=await x(`/api/oneseat?${Ps(t,n,o)}`),e.getSource(sn).setData(Ls(ot)),ot}function na(e,t){qo=t,e.setLayoutProperty(Ko,"visibility",t?"visible":"none")}function dn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function oa(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=i=>i.length?i.join(", "):"none",s=dn(t);return e.status==="here"?`<b>at ${s}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${s}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var st={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},pn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},Rs=new Set(["gone","new"]);function Es(e,t,n){return Rs.has(e)?`${t} (${pn[n]})`:t}function Os(e){return e.buckets.filter(t=>t.key!=="none")}var aa={area:"Ground",people:"People"};function Ds(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=No(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=s=>s.toFixed(s<10?1:0);return`
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Ts(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=jo(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),r=s=>Math.round(s).toLocaleString();return`
      <div class="lg-area">
        <span><b>${r(a.lost)}</b> people lose all service</span>
        <span><b>${r(a.gained)}</b> gain service</span>
        <span><b>${r(a.kept)}</b> keep a bus</span>
        <span><b>${r(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Ms=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function ra(e){let{layer:t,day:n,bounds:o,unit:a,population:r,scoped:s=!1,named:i=!1}=e,l=Xt.map(([d,m])=>`${m} ${((d+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${l})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${M}"></i>loses all service
          (${pn[n]})</span>
        <span><i style="background:${C}"></i>new service
          (${pn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(aa).map(d=>`
          <button data-surface-unit="${d}" aria-pressed="${a===d}"
                  class="${a===d?"active":""}">${aa[d]}</button>`).join("")}
      </div>
      ${s?Ms:a==="people"?Ts(n,o,r):Ds(t,n,o)}
    </div>`}var Cs=["lost","added","kept"],As={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Fs={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ia(e,t){let{lostPct:n,addedPct:o}=Go(t.km),a=i=>i.toFixed(1),s=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${s}</b> km of street, citywide \u2014 ${Fs[t.day]}
    </div>
    ${Cs.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${et[i]}"></i>
        <span class="lg-lab">${p(As[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function la(e,t,n){let o=t.statuses.map(m=>m.key),a=Xo(t.points,o,n.west,n.south,n.east,n.north),r=m=>t.statuses.find(h=>h.key===m)?.label??m,s=at.reduce((m,h)=>m+(a[h]??0),0),i=dn(t),l=t.day&&t.day!==rt,d=l?`Restricted to routes running on ${st[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(i)}</b>
      <span class="muted">\xB7 ${s.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${l?` \xB7 ${st[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${at.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${xe[m].color}"></i>
        <span class="lg-lab">${p(r(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${at.map(m=>`${(t.counts[m]??0).toLocaleString()} ${p(r(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${p(i)} without transferring?
      ${d} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function ca(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var sa={locations:"Stops",riders:"Riders"};function Ns(e,t){let o=`${t.toLocaleString()} stop${t===1?"":"s"} in view`,r=t?`<b>${o}</b> ${t===1?"gains":"gain"} a kerb where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",s=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${r}${s}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Hs(e){if(!e)return"";let t=_e(Ge);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Ge}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Bs(e,t){if(!e)return"";let n=_e(Ye);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Ye}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Is(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Hs(e)}
      ${Bs(t,n)}
    </div>`}function ua(e,t){let{layer:n,day:o,bounds:a,weight:r,surface:s,unit:i="area",population:l,selection:d,dots:m=!0}=t,h=n.buckets.map(w=>w.key),L=n.days.indexOf(o),{west:$,south:D,east:y,north:I}=a,G=Os(n),_=d&&d.size>0?d:null,Me=_?ho(_):yo($,D,y,I),An=Lo(n.points,L,h,Me),kt=$o(n.points,Me),_t=ko(n.points,Me),T=r==="riders"?_o(n.points,L,h,Me):null,xr=w=>T?T.measured[w]?Math.round(T.riders[w]).toLocaleString():"\u2014":An[w].toLocaleString(),Pr=T?T.removedMeasured?Math.round(T.removedRiders).toLocaleString():"\u2014":_t.toLocaleString(),Rr=_?`at ${_.size.toLocaleString()} selected stop${_.size===1?"":"s"}`:"in view",Fn=G.reduce((w,xt)=>w+An[xt.key],0)+kt+_t,Er=T?`<b>${Math.round(G.reduce((w,xt)=>w+T.riders[xt.key],0)+T.removedRiders).toLocaleString()}</b> daily boardings ${Rr}`:_?`<b>${Fn.toLocaleString()}</b>
         of ${_.size.toLocaleString()} selected stops`:`<b>${Fn.toLocaleString()}</b>
         stops in view`,Or=s?` \xB7 surface: ${n.radius} m walk`:"",Dr=!m&&!!s;e.innerHTML=Dr?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${st[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${ra({layer:s,day:o,bounds:a,unit:i,population:l,scoped:!!_,named:!0})}`:`
    <div class="lg-head">
      ${Er}
      <span class="muted">\xB7 ${st[o]}${Or}</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(sa).map(w=>`
        <button data-weight="${w}" aria-pressed="${r===w}"
                class="${r===w?"active":""}">${sa[w]}</button>`).join("")}
    </div>
    ${G.map(w=>`
      <button class="lg-row ${_e(w.key)?"off":""}" data-bucket="${p(w.key)}"
              aria-pressed="${!_e(w.key)}">
        <i style="background:${Ue[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(Es(w.key,w.label,o))}</span>
        <span class="lg-n">${xr(w.key)}</span>
      </button>`).join("")}
    ${Is(kt,_t,Pr)}
    ${s?ra({layer:s,day:o,bounds:a,unit:i,population:l,scoped:!!_}):""}
    ${T?Ns(T.unmeasured,kt):""}
    ${_?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var mn="#4aa3ff",fa="#ffa23a",gn="headline",it="journey",ba="journey-rides",va="journey-walks",js=[ba,va],wa=null,Sa=!1;function ct(){return wa}function yn(){return Sa}function Us(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let s of r.legs){let i=s.from??e.origin,l=s.to??e.destination,d=[[i.lon,i.lat],[l.lon,l.lat]],m=s.path?.length?s.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:s.kind,route:s.route}})}}return{type:"FeatureCollection",features:o}}function da(){return["match",["get","side"],"current",mn,"proposed",fa,mn]}function pa(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function La(e,t){e.addSource(it,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ba,type:"line",source:it,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":da(),"line-width":pa(1),"line-opacity":.85}},t),e.addLayer({id:va,type:"line",source:it,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":da(),"line-width":pa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function $a(e,t){Sa=t;for(let n of js)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function hn(e,t){wa=t;let n=t?Us(t,gn):{type:"FeatureCollection",features:[]};e.getSource(it).setData(n)}function ka(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var ma=e=>`${e.toFixed(1)} min`;function _a(e){return e==null?"\u2014":e===0?"no change":e>0?`${ma(e)} slower`:`${ma(-e)} faster`}function ga(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function Js(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=ga(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ga(e.to,"the destination")}</span></div>`}function ya(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(Js(a,t)),o=a}return n.join("")}var Gs={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function lt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Ys(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function zs(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${lt(t.current)} \u2192
        ${lt(t.proposed)} min</span>
        <span class="muted">${_a(t.change_min)}</span></div>
      ${o}
    </div>`}function ha(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function fn(e,t){let n=e.radii[gn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${p(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${re(e.window.start_min)}
        and ${re(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Gs[n.classification]??""}</p>
      </div>
      ${ha(e)}`:`${a}
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
      <div class="hl-delta ${o}">${_a(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Ys(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ya(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ya(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${zs(e)}
    ${ha(e)}`}function xa(e){return`
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
    </div>`}function Pa(e){let t=e?e.radii[gn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${mn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${fa}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var pt="places",Oa="places-points",bn="places-boundaries",ee="places-fill",de="lost",Vs=100,Ws={lost:"share_lost",gained:"share_gained"};function W(e,t){return`service_${e}_${t}`}var Da={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Ks="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Q={lost:M,gained:C},ut=null,V=null,ue=null,Ta=!1,dt=null;function vn(){return ut}function Ma(){return V}function Ca(){return dt}function wn(){return ue}function Pe(){return Ta}function qs(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function Xs(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Zs(e){return Math.max(e.residents_lost,e.residents_gained)}var Ra=4,Qs=16,ei=1e3;function ti(e){let t=Math.min(1,Math.sqrt(e/ei));return Ra+t*(Qs-Ra)}function ni(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Xs(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:ti(Zs(t))}}))}}function oi(){return["match",["get","klass"],"lost",Q.lost,"gained",Q.gained,Q.lost]}function ai(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var U=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var J=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Aa(e,t){return e==="service"?["step",["abs",["coalesce",["get",W(t,"pct")],0]],J[0].opacity,J[0].max,J[1].opacity,J[1].max,J[2].opacity,J[2].max,J[3].opacity]:["step",["coalesce",["get",Ws[e]],0],U[0].opacity,Number.EPSILON,U[1].opacity,U[1].max,U[2].opacity,U[2].max,U[3].opacity,U[3].max,U[4].opacity]}function Fa(e,t){return e==="service"?["case",[">=",["coalesce",["get",W(t,"pct")],0],0],C,M]:Q[e]}function ri(e,t){let n=W(t,"now"),o=W(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var si=3;function ii(e){if(e.length===0)return"";let t=e.slice(0,si),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function Na(e,t){e.addSource(bn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ee,type:"fill",source:bn,layout:{visibility:"none"},paint:{"fill-color":Fa(de),"fill-opacity":Aa(de),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(pt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Oa,type:"circle",source:pt,layout:{visibility:"none"},paint:{"circle-color":oi(),"circle-radius":ai(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function mt(e,t,n){e.setPaintProperty(ee,"fill-color",Fa(t,n)),e.setPaintProperty(ee,"fill-opacity",Aa(t,n))}async function Ha(){return ut||(ut=await x("/api/places")),ut}async function Ba(e){return ue||(ue=await x("/api/boundaries"),e.getSource(bn).setData(ue)),ue}function li(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Ia(e,t){let n=li(ue,t);if(n)return V=null,dt=n,e.getSource(pt)?.setData({type:"FeatureCollection",features:[]}),null;try{V=await x(`/api/places/${encodeURIComponent(t)}`)}catch{return V=null,dt=null,null}return dt=null,e.getSource(pt).setData(ni(V)),e.flyTo({center:[V.lon,V.lat],zoom:13}),V}function ja(e,t){Ta=t,e.setLayoutProperty(Oa,"visibility",t?"visible":"none"),e.setLayoutProperty(ee,"visibility",t?"visible":"none")}function ci(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${p(e.key)}">
      <span class="place-name">${p(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var ui="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ua(e,t,n,o){let a=qs(e,t).map(r=>ci(r,r.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Ks}</p>
    ${o==="service"?`<p class="note">${ui}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Ja(e,t){return e?`<div class="lg-head"><b>${p(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${p(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function di(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function pi(e,t,n,o){let a=J.map((l,d)=>({band:l,prevMax:d===0?0:J[d-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:d})=>{let m=di(l,d);return[`<div class="lg-row lg-static">
          <i style="background:${M};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} more trips</span></div>`]}).join(""),r=o?ri(o,n):[],s=ii(r),i=s?`<div class="lg-foot">${p(s)}</div>`:"";return`
    ${Ja(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${p(Da[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Ga({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return pi(e,a??null,n,o??null);let r=t==="lost"?"lose all buses":"gain a bus",s=U.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${Q[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${p(i.label)} of the place's own residents ${p(r)}</span>
    </div>`).join("");return`
    ${Ja(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${p(r)}</div>
    ${s}
    <div class="lg-row lg-static"><i style="background:${Q.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Q.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function mi(e,t){let n=e[W(t,"now")],o=e[W(t,"proposed")],a=e[W(t,"pct")],r=e[W(t,"rail_proposed")],s=Da[t];if(o===0&&n>0)return`Loses all buses on ${s} (${n} \u2192 0 trips)${r?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${s} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${s} (${i}).`}function Ya(e,t,n){if(t==="service")return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      ${mi(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=Ea("lose all buses",e.residents_lost,e.share_lost),r=e.residents_gained>0?Ea("gain a bus",e.residents_gained,e.share_gained):null,s=(t==="lost"?[a,r]:[r,a]).filter(i=>i!==null);return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
    ${s.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Ea(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Vs} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var Sn=" \xB7 ",Ln={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},za=Object.keys(Ln);function Va(e){return Ln[e]??e}var gi={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},yi=["oneseat","journey"];function hi(e){return e!=="journey"}function fi(e){let t=[Ln[e.view]??e.view];return e.view==="places"?t[0]:(yi.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":gi[e.day]),hi(e.view)&&t.push(`${e.radius} m walk`),t.join(Sn))}function Wa(e){let[t,...n]=fi(e).split(Sn);return`<b>${p(t)}</b>${n.map(o=>Sn+p(o)).join("")}`}var f={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},bi=/^[cp]:[\w.:-]{1,32}$/,gt={any:"any",selected:"selected"},vi="pin",Ka=5;function Xa(e){try{return e.self!==e.top}catch{return!0}}function Za(e){let t=new URLSearchParams;return t.set(f.view,e.view),t.set(f.day,e.day),t.set(f.radius,String(e.radius)),t.set(f.oneSeatDay,e.oneSeatRestricted?gt.selected:gt.any),t.set(f.dest,"key"in e.dest?e.dest.key:$n(e.dest)),e.weight==="riders"&&t.set(f.weight,e.weight),e.surfaceUnit==="people"&&t.set(f.surfaceUnit,e.surfaceUnit),e.at&&t.set(f.at,$n(e.at)),e.camera&&t.set(f.camera,`${$n(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(f.place,e.place),e.placeFill!==de&&t.set(f.placeFill,e.placeFill),e.selection.length&&t.set(f.selection,e.selection.join(",")),`?${t}`}function Qa(e){let t=new URLSearchParams(e),n={},o=t.get(f.view);o&&za.includes(o)&&(n.view=o);let a=t.get(f.day);a&&P.includes(a)&&(n.day=a);let r=Number(t.get(f.radius));t.has(f.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(f.weight)==="riders"?n.weight="riders":t.get(f.weight)==="locations"&&(n.weight="locations"),t.get(f.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(f.surfaceUnit)==="area"&&(n.surfaceUnit="area");let s=t.get(f.oneSeatDay);s===gt.selected?n.oneSeatRestricted=!0:s===gt.any&&(n.oneSeatRestricted=!1);let i=t.get(f.dest);if(i&&i!==vi){let $=qa(i);$?n.dest=$:i.includes(",")||(n.dest={key:i})}let l=qa(t.get(f.at));l&&(n.at=l);let d=wi(t.get(f.camera));d&&(n.camera=d);let m=t.get(f.place);m&&(n.place=m);let h=t.get(f.selection);h!==null&&(n.selection=h.split(",").filter($=>bi.test($)));let L=t.get(f.placeFill);return(L==="lost"||L==="gained"||L==="service")&&(n.placeFill=L),n}function $n(e){return`${e.lat.toFixed(Ka)},${e.lon.toFixed(Ka)}`}function qa(e){let t=er(e,2);return t?{lat:t[0],lon:t[1]}:null}function wi(e){let t=er(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function er(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var kn="embed";var Si=["1","true","yes"];function tr(e){let t=new URLSearchParams(e).get(kn);return t!==null&&Si.includes(t.toLowerCase())}function nr(e){let t=new URLSearchParams(e);return t.set(kn,"1"),`?${t}`}function or(e){let t=new URLSearchParams(e);t.delete(kn);let n=String(t);return n?`?${n}`:""}function ar(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var K=["peek","half","full"],Li=192,$i=.3,ki=.55,_i=.9,xi=.6,Pi=.45;function yt(e,t){return e==="peek"?Math.min(Li,t*$i):e==="half"?t*ki:t*_i}function Ri(e,t,n=0){let o=K.map(r=>Math.abs(yt(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>xi&&(a=Math.max(0,Math.min(K.length-1,a+(n>0?1:-1)))),K[a]}function rr(e){return K[(K.indexOf(e)+1)%K.length]}function Ei(e,t){return Math.min(e,t*Pi)}function pe(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function _n(e){let t=null,n=()=>{let o=pe();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Oi=8,Di=400;function sr(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,r=0,s=0,i=0,l={y:0,t:0};function d(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,Ei(y,d()))}function h(y){o=y,t.dataset.snap=y,m(yt(y,d()))}n.addEventListener("pointerdown",y=>{pe()&&(a=!0,r=y.clientY,s=t.getBoundingClientRect().height,i=y.timeStamp,l={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!a)return;let I=s+(r-y.clientY),G=yt("peek",d()),_=yt("full",d());m(Math.max(G,Math.min(_,I))),l={y:y.clientY,t:y.timeStamp}});function L(y){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-r)>Oi)&&y.timeStamp-i<Di){h(rr(o));return}let G=y.timeStamp-l.t,_=G>0?(l.y-y.clientY)/G:0;h(Ri(t.getBoundingClientRect().height,d(),_))}n.addEventListener("pointerup",L),n.addEventListener("pointercancel",L),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),pe()&&h(rr(o)))});let $=_n(e.onLayoutChange);function D(){if($(),!pe()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}h(o)}return window.addEventListener("resize",D),D(),{at:()=>pe()?o:"full",atLeast(y){pe()&&K.indexOf(y)>K.indexOf(o)&&h(y)}}}var Ti=["llvmpipe","swiftshader","softpipe","basic render","software"];function xn(e){if(!e)return!1;let t=e.toLowerCase();return Ti.some(n=>t.includes(n))}function lr(e){let t=xn(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function cr(e){return xn(e.renderer)?0:Mi}var Mi=300,Ci="https://tiles.openfreemap.org/styles/positron",Ai=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],ir=[],Fi=19,Ni='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Hi=!1;function ur(e){return!Hi||!xn(e.renderer)?Ci:Bi()}function Bi(){let e=o=>({type:"raster",tileSize:256,attribution:Ni,tiles:o,maxzoom:Fi}),t={basemap:e(Ai)},n=[{id:"basemap",type:"raster",source:"basemap"}];return ir.length&&(t["basemap-labels"]=e(ir),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function dr(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),a=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof a=="string"?a:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Ii(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function pr(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),a=null,r="",s=l=>{r!==l&&(r=l,e.getCanvas().style.cursor=l)},i=()=>{a=null,s(""),t.remove()};return e.on("mousemove",l=>{let d=n.map(I=>I.layer).filter(I=>e.getLayer(I)&&e.getLayoutProperty(I,"visibility")!=="none");if(!d.length){i();return}let[m,...h]=e.queryRenderedFeatures(l.point,{layers:d});if(!m){i();return}s("pointer");let L=Ii(m);if(L===a)return;let $=o.get(m.layer?.id),D=$?$.html(m,h):null;if(D==null){a=null,t.remove();return}a=L;let y=$.anchor?$.anchor(m,l):l.lngLat;t.setLngLat(y).setHTML(D).addTo(e)}),e.on("mouseout",i),i}var ji=[-79.9959,40.4406],Ui=12,Ji="#e2574c",E={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},Ee=Qa(location.search),De=tr(location.search);De&&c("app").classList.add("embed");var Gi={at:()=>"full",atLeast(){}},hr=null,O=400,Re=null,b=null,ge=null,oe=0,k={key:"downtown"},te=null,fr=!1,fe=!1,St="locations",be="area",br="count",wt=null,F=de,H=!1,g="dots",vr,On=[],mr=()=>{},Pn=dr(),u=new maplibregl.Map({container:"map",style:ur(Pn),pixelRatio:lr(Pn),fadeDuration:cr(Pn),renderWorldCopies:!1,center:Ee.camera?[Ee.camera.lon,Ee.camera.lat]:ji,zoom:Ee.camera?.zoom??Ui,cooperativeGestures:Xa(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{In(u),Eo(u),Bo(u,Ve),Yo(u,Ve),Zo(u,"walk-fill"),La(u),Na(u,Ve),N(),u.on("click",t=>{if(H)return;if(fr){Oe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let r=u.queryRenderedFeatures(t.point,{layers:[ee]})[0];r&&ft(r.properties.key);return}let n=[...ze,"oneseat-dots"].filter(r=>u.getLayoutProperty(r,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Cn(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});mr=pr(u,e,[...jn(t=>{let n=We(),o=t.find(a=>ze.includes(a.layer?.id));return n&&o?Kt(o.properties,S(),n.buckets,{pole:!1}):null}),...ze.map(t=>({layer:t,html:n=>{let o=We();return o?Kt(n.properties,S(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=ce();return n?oa(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:ee,html:t=>Ya(t.properties,F,S())}]),sl(),u.on("moveend",()=>{let t=u.getCenter();hr={lat:t.lat,lon:t.lng,zoom:u.getZoom()},v(),B()}),me(E.radius,t=>{O=Number(t.dataset.radius),zt(u,O,S()).then(v),Xe()&&Qt(u,O,S()).then(v),Ze()&&nn(O).then(v),ce()&&bt(),b&&ye(b.lat,b.lon)}),me(E.day,t=>{let n=t.dataset.day;oo(n),g!=="journey"&&N(),Vt(u,n),en(u,n),g==="journey"&&b&&Dn(b.lat,b.lon),nt()&&zo(u,n).then(v),fe&&ce()&&(bt(),b&&ye(b.lat,b.lon)),Pe()&&F==="service"&&mt(u,F,n),v()}),me(E.oneSeatDay,t=>{fe=t.dataset.oneseatDay==="selected",En(),bt(),b&&ye(b.lat,b.lon)}),me(E.view,t=>{let n=g;g=t.dataset.view,mr(),go(u,g==="dots"||g==="both"),qi(g==="surface"||g==="both"),Zi(g==="corridors"),nl(g==="oneseat"),tl(g==="journey",n==="journey"),Qi(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),el(Ot(g)),$r();let o=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),ve()||gr(!1),he(),En(),o||vt(!1),Sr()}),me(E.dest,t=>{let n=t.dataset.dest;if(n==="pin"){vt(!0);return}vt(!1),Oe({key:n})}),me(E.placeFill,t=>{F=t.dataset.placeFill,Pe()&&mt(u,F,S()),N(),v(),En()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){St=n.dataset.weight,v(),B();return}let o=t.target.closest("[data-surface-unit]");if(o){be=o.dataset.surfaceUnit,Xi(be),B();return}let a=t.target.closest("[data-bucket]");a&&(Oo(u,a.dataset.bucket,S()),v())}),c("legend-reset").addEventListener("click",()=>{Do(u,S()),v()}),c("legend-select").addEventListener("click",()=>gr(!H)),c("legend-clear").addEventListener("click",()=>{Gt(u),he(),v(),B()}),c("legend-collapse").addEventListener("click",()=>{Rn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Oe({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&cl(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&ft(a.dataset.selectPlace);let r=t.target.closest("[data-sort-places]");r&&(br=r.dataset.sortPlaces,N());let s=t.target.closest("[data-goto-place]");s&&(g!=="places"&&ne(E.view,"places"),ft(s.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Wi),De&&_n(Rn),vr=De?Gi:sr({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Rn}),zi(),$t(),he(),Lt(),Yi(Ee),zt(u,O,S()).then(v),ll(),il()});function me(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),$t(),B()})})}function ne(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Yi(e){e.radius!==void 0&&ne(E.radius,String(e.radius)),e.day&&ne(E.day,e.day),e.oneSeatRestricted!==void 0&&ne(E.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(St=e.weight),e.surfaceUnit&&(be=e.surfaceUnit),e.placeFill&&ne(E.placeFill,e.placeFill),e.dest&&("key"in e.dest?ne(E.dest,e.dest.key):Oe(e.dest)),e.selection&&So(u,e.selection),e.view&&ne(E.view,e.view),e.at&&Cn(e.at.lat,e.at.lon),e.place&&ft(e.place)}function B(){let e={view:g,day:S(),radius:O,oneSeatRestricted:fe,weight:St,surfaceUnit:be,dest:k,at:b,camera:hr,place:wt,placeFill:F,selection:bo()},t=Za(e);history.replaceState(null,"",(De?nr(t):t)+location.hash),Lt(t)}function Lt(e=or(location.search)){if(!De)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=b?ge?Le(ge):"this point":null;t.querySelector(".el-action").textContent=ar(n)}function $t(){c("statebar").innerHTML=Wa({view:g,day:S(),radius:O,oneSeatRestricted:fe,destination:Te()}),Vi()}function Rn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function zi(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Vi(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Va(g)))}function Wi(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function v(){Ki()}function Ki(){if(c("legend-reset").classList.toggle("hidden",an()||cn()||yn()||Pe()||!ve()),yn()){c("legend").innerHTML=Pa(ct());return}if(Pe()){c("legend").innerHTML=Ga({selected:Ma(),fill:F,day:S(),boundaries:wn(),unchanged:Ca()});return}if(an()){let n=nt();n&&ia(c("legend"),n);return}if(cn()){let n=ce();if(!n)return;let o=u.getBounds();la(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=We();if(!e)return;let t=u.getBounds();ua(c("legend"),{layer:e,day:S(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:St,dots:ve(),surface:Zt()?Xe():null,unit:be,population:Ze(),selection:fo()})}async function qi(e){if(e&&!Xe()){c("legend").classList.add("loading");try{await Qt(u,O,S())}finally{c("legend").classList.remove("loading")}}Io(u,e),e&&be==="people"&&await wr(),v()}async function wr(){if(!Ze()){c("legend").classList.add("loading");try{await nn(O)}finally{c("legend").classList.remove("loading")}}}async function Xi(e){e==="people"&&Zt()&&await wr(),v()}async function Zi(e){if(e&&!nt()){c("legend").classList.add("loading");try{await rn(u,S())}finally{c("legend").classList.remove("loading")}}Vo(u,e),v()}async function Qi(e){if(e&&(!vn()||!wn())){c("legend").classList.add("loading");try{await Promise.all([Ha(),Ba(u)])}finally{c("legend").classList.remove("loading")}}ja(u,e),e&&mt(u,F,S()),e&&N(),v()}async function ft(e){wt=await Mn(()=>Ia(u,e))?e:null,g==="places"&&(N(),wt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),B()}function el(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),Lt(),g==="places"){c("panel").innerHTML=Ua(vn()??[],br,wt,F);return}if(!ge){g==="oneseat"?c("panel").innerHTML=co(Te()):ao(c("panel"));return}if(g==="oneseat"){let t=lo(ge,k,S());if(t){c("panel").innerHTML=t;return}}io(ge)}function tl(e,t=!1){if($a(u,e),v(),!e){t&&(b?ye(b.lat,b.lon):N());return}ct()&&b?c("panel").innerHTML=fn(ct(),Te()):c("panel").innerHTML=xa(Te())}async function Dn(e,t){let n=++oe;b={lat:e,lon:t},B(),kr(e,t);let o=Lr(),a=p(Te());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await x(ka({lat:e,lon:t},o,S()));if(n!==oe)return;hn(u,r),c("panel").innerHTML=fn(r,a),v(),Lt()}catch(r){if(n!==oe)return;hn(u,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function En(){c("day-controls").classList.toggle("hidden",!ta(g,fe,F))}function Tn(){return ea(fe,S())}async function nl(e){e&&!ce()&&await Mn(()=>un(u,O,k,Tn())),na(u,e),v()}async function bt(){await Mn(()=>un(u,O,k,Tn())),v()}async function Mn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Oe(e){if(k=e,vt(!1),ol(),Sr(),$t(),B(),g==="journey"){b&&Dn(b.lat,b.lon),v();return}b?ye(b.lat,b.lon):N({scrollToTop:!0}),bt()}function Sr(){let e=Lr();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in k))){te?.remove(),te=null;return}te?te.setLngLat([e.lon,e.lat]).addTo(u):(te=new maplibregl.Marker({color:ln,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),te.on("dragend",()=>{let n=te.getLngLat();Oe({lat:n.lat,lon:n.lng})}))}function ol(){let e=Qo(k);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Lr(){if("lat"in k)return{lat:k.lat,lon:k.lon};let e=k.key,t=On.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Te(){if("lat"in k)return`${k.lat.toFixed(4)}, ${k.lon.toFixed(4)}`;let e=k.key;return On.find(t=>t.key===e)?.name??e}function vt(e){fr=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function ye(e,t){let n=++oe;b={lat:e,lon:t},B(),c("panel").classList.add("loading"),kr(e,t),Dt(u),c("pin-key").classList.add("hidden");try{let o="lat"in k?`&dest_lat=${k.lat.toFixed(6)}&dest_lon=${k.lon.toFixed(6)}`:"",a=await x(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${O}${o}&oneseat_day=${Tn()}`);if(n!==oe)return;q={lat:e,lon:t,radius:O,now:a.current.stops,proposed:a.proposed.stops},$r(),ge=a,N({scrollToTop:!0})}catch(o){if(n!==oe)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===oe&&c("panel").classList.remove("loading")}}var q=null;function $r(){if(!q||!Ot(g)){Dt(u),c("pin-key").classList.add("hidden");return}Un(u,q.lat,q.lon,q.radius,q.now,q.proposed),al(q.radius)}function al(e){c("pin-key").innerHTML=ca(e),c("pin-key").classList.remove("hidden")}function kr(e,t){Re?Re.setLngLat([t,e]):(Re=new maplibregl.Marker({color:Ji,draggable:!0}).setLngLat([t,e]).addTo(u),Re.on("dragend",()=>{let n=Re.getLngLat();Cn(n.lat,n.lng)}))}var ht=14;function ve(){return g==="dots"||g==="both"}function gr(e){H=e&&ve(),H?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=H?"none":"",H||_r(),he()}function he(){let e=c("legend-select");e.classList.toggle("hidden",!ve()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!ve()||!vo())}function rl(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function yr(e){c("brush").classList.toggle("painting",e)}function _r(){c("brush").hidden=!0}function sl(){let e=c("brush");e.style.width=`${ht*2}px`,e.style.height=`${ht*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,he(),v()}))},r=()=>{H&&(t=!0,n=!1,yr(!0))},s=l=>{if(rl(l.point.x,l.point.y),!t)return;n=!0,Jt(u,Yt(u,l.point.x,l.point.y,ht))&&a()},i=l=>{if(yr(!1),!!t){if(t=!1,!n){let[d]=Yt(u,l.point.x,l.point.y,ht);d&&wo(u,d)}he(),v(),B()}};u.on("mousedown",r),u.on("mousemove",s),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",_r),u.on("touchstart",r),u.on("touchmove",s),u.on("touchend",i)}function Cn(e,t){if(vr.atLeast("half"),g==="journey"){Dn(e,t);return}g!=="places"&&ye(e,t)}async function il(){try{On=await x("/api/destinations"),$t()}catch{}}async function ll(){try{let e=await x("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function cl(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
