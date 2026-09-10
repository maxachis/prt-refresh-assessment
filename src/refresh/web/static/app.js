"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function x(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var Rt=new Map;function ae(e){let t=Rt.get(e);if(t)return t;let n=x(e).catch(o=>{throw Rt.delete(e),o});return Rt.set(e,n),n}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function re(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Pt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Et(e){return e>0?`+${e}`:String(e)}function Nn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Or="#15181e",Hn="#ffa23a",Dr="#ffffff";function Tr(e,t,n,o=96){let a=[],r=n/111320,s=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let l=i/o*2*Math.PI;a.push([t+s*Math.cos(l),e+r*Math.sin(l)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function j(e){return{type:"FeatureCollection",features:e}}function Mr(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Cr(e,t){let n=e.side==="current"?"today":"proposed",o=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"",a=t?`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.18)">${t}</div>`:"";return`<b>${e.name}</b><br>${n} \xB7 stop ${e.stop_id}${o}${a}`}function Ot(e){return e!=="corridors"&&e!=="journey"&&e!=="places"}function Dt(e){for(let t of["walk","stops-now","stops-prop","stop-moves"])e.getSource(t)?.setData(j([]))}function Bn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function In(e){e.addSource("walk",{type:"geojson",data:j([])}),e.addSource("stops-now",{type:"geojson",data:j([])}),e.addSource("stops-prop",{type:"geojson",data:j([])}),e.addSource("stop-moves",{type:"geojson",data:j([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Hn,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Dr,"circle-stroke-width":3,"circle-stroke-color":Hn}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Or,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}})}function jn(e){return["stops-now-c","stops-prop-c"].map(t=>({layer:t,html:(n,o=[])=>Cr(n.properties,e(o))}))}function Un(e,t,n,o,a,r){e.getSource("walk").setData(j([Tr(t,n,o)])),e.getSource("stops-now").setData(j(Bn(a,"current"))),e.getSource("stops-prop").setData(j(Bn(r,"proposed"))),e.getSource("stop-moves").setData(j(Mr(r)))}var R=["weekday","saturday","sunday"],Tt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Jn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ce=4,Ae=5,Gn=e=>Ae+Ce*e,Yn=e=>Ae+1+Ce*e,ve=e=>Ae+2+Ce*e,Ar=e=>Ae+3+Ce*e,Fe=2,Fr=3,we=4,Se=e=>e[Fr],P=(e,t)=>e[t],zn=(e,t)=>e[Ar(t)],Mt=e=>2+2*e,Ct=e=>3+2*e,Ne=4,Vn=e=>2+Ne*e,Wn=e=>3+Ne*e,Kn=e=>4+Ne*e,qn=e=>5+Ne*e;var Ft="weekday";function S(){return Ft}function no(e){Ft=e}function oo(e){e.innerHTML=`
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
    </div>`}function Nr(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Hr(e,t){let n=Math.max(1,...Tt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Tt.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,s=r-a,i=s>0?"up":s<0?"down":"flat";return`
      <tr>
        <th>${Jn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${i}">${s===0?"\xB7":Et(s)}</td>
      </tr>`}).join("")}function ao(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Xn(e){return e.first==null?'<span class="muted">no service</span>':`${re(e.first)}\u2013${re(e.last)}`}function Zn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Br={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Ir={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function jr(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Ie(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(o.name)}</span>
          <span class="os-status ${p(o.status)}">${Br[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Ir[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Be("one-seat")}</p>
    </div>`:""}function Be(e){return` <button class="howto" data-caveat="${e}">method</button>`}function He(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function Qn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function eo(e){return e.first==null||e.last==null?null:e.last-e.first}function Ie(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${to(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${to(t,n,"prop")}</div>
    </div>`}function to(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${p(o)}</span>`).join(" "):'<span class="muted">none</span>'}var At=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Ur="Allegheny";function Le(e){let t=e.place?.muni?.trim()??"",n=At.exec(t)?.[1],o=n===Ur?t.replace(At,""):n?`${t.replace(At,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Nt(e){return e==="weekday"?"weekday":e}function ro(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Nt(t)}`}function Jr(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Gr(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",r=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",s=[a,r].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${s}</div></dd>`}function Yr(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Nt(t)}, today only</span>`}${o}</dd>`}function zr(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Be("boardings")}</p>`}function Vr(e){if(!e)return"";let t=p(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
    </div>`}function Ht(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],r=a.trips-o.trips,s=r>0?"up":r<0?"down":"flat",i=Zn(o),l=Zn(a),d=eo(o),m=eo(a);return`
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

    <div class="tiers">${Nr(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Hr(o,a)}</tbody>
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
      ${He(Xn(o),Xn(a))}
      <dt>Hours between</dt>
      ${He(Pt(d),Pt(m),Qn(d,m,"more"))}
      <dt>Typical wait</dt>
      ${He(i==null?"\u2014":`${i} min`,l==null?"\u2014":`${l} min`,Qn(i,l,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${He(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Gr(e.current.stops)}
      ${Jr(e.proposed.stops)}
      ${Yr(o.boardings,t)}
    </dl>
    ${zr(o.boardings)}

    ${n}

    ${Vr(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Ie(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Be("location-not-route")}</p>
    </div>`}function so(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${p(Le(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ht(e,Ft,jr(e.oneseat??[],e.oneseat_day??"any"))}`}var Wr={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Kr={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},qr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Xr(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Bt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${ao(t)}</div>`:""}function Zr(e){let t=Bt("kept",e.kept)+Bt("lost",e.lost)+Bt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Qr(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Ie(e.current,e.proposed)}
    </div>`}function es(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${p(a.key)}">
      <span class="os-name">${p(a.name)}</span>
      <span class="os-status ${p(a.status)}">${ts[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var ts={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function ns(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${qr[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function io(e,t,n){let o=Xr(e,t);if(!o)return"";let a=e.oneseat_day??"any",r=o.status==="here"?"":Zr(o)+Qr(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${p(o.name)}</h2>
      <div class="muted">
        from ${p(Le(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${p(o.status)}">${Wr[o.status]}</div>
    <p class="note">${Kr[o.status]} ${ns(a)}</p>

    ${r}

    ${es(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${ro(e,n)}</summary>
      ${Ht(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function lo(e){return`
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
    </div>`}var Ue={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},se="change",z="change-dots",X=["boolean",["feature-state","selected"],!1],co="#15181e",Z=["==",["get","published"],0],Ge="newplace",os="#15181e",as=5,Je=["==",["get","removed"],1],Ye="removedstop",ke="change-removed",Ut="change-removed-selected",It="removed-cross",po="#e8232f";function rs(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[r,s]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,po]])o.lineWidth=r,o.strokeStyle=s,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var je=null,Y=new Set,A=new Set,ss=[z,Ut,ke],ze=[z,ke],Ve=z;function mo(e,t){for(let n of ss)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function We(){return je}function _e(e){return Y.has(e)}function go(e,t,n,o){return a=>cs(a,e,t,n,o)}function yo(e){return t=>e.has(Se(t))}function ho(){return A}function fo(){return[...A].sort()}function bo(){return A.size}function Jt(e,t){let n=0;for(let o of t)A.has(o)||(A.add(o),$e(e,o,!0),n++);return n}function vo(e,t){A.delete(t)?$e(e,t,!1):(A.add(t),$e(e,t,!0))}function wo(e,t){Gt(e),Jt(e,t)}function Gt(e){for(let t of A)$e(e,t,!1);A.clear()}function $e(e,t,n){try{e.setFeatureState({source:se,id:t},{selected:n})}catch{}}function is(e){for(let t of A)$e(e,t,!0)}function ls(e,t,n,o){let a=n*n;return o.filter(r=>(r.x-e)**2+(r.y-t)**2<=a).map(r=>r.id)}function Yt(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],r=[z,ke].filter(i=>e.getLayer(i)),s=e.queryRenderedFeatures(a,{layers:r}).filter(i=>i.id!==void 0).map(i=>{let[l,d]=i.geometry.coordinates,m=e.project([l,d]);return{id:i.id,x:m.x,y:m.y}});return ls(t,n,o,s)}function So(e,t,n,o){let a={};for(let r of n)a[r]=0;for(let r of e){if(!o(r)||P(r,Fe)===0||P(r,we)===1)continue;let s=n[P(r,ve(t))];s!==void 0&&a[s]++}return a}function Lo(e,t){let n=0;for(let o of e)t(o)&&P(o,Fe)===0&&n++;return n}function $o(e,t){let n=0;for(let o of e)t(o)&&P(o,we)===1&&n++;return n}function cs(e,t,n,o,a){let r=P(e,0),s=P(e,1);return r>=n&&r<=a&&s>=t&&s<=o}function ko(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let r of n)a.riders[r]=0,a.measured[r]=0;for(let r of e){if(!o(r)||P(r,Fe)===0)continue;let s=n[P(r,ve(t))];if(s===void 0)continue;let i=zn(r,t),l=P(r,we)===1;if(i===null){s!=="none"&&a.unmeasured++;continue}if(l){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[s]+=i,a.measured[s]++}return a}function us(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>R.some((o,a)=>t[P(n,ve(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:Se(n),published:n[2],removed:n[we],replacement:e.replacement?.[Se(n)]?.[0]??null,nearestStraight:e.replacement?.[Se(n)]?.[1]??null,...Object.fromEntries(R.flatMap((o,a)=>[[`b${a}`,t[P(n,ve(a))]],[`c${a}`,n[Gn(a)]],[`p${a}`,n[Yn(a)]]]))}}))}}function _o(e,t){let n=Object.entries(Ue).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Ue.none[t]]}function xo(e){return["case",Z,"rgba(0,0,0,0)",_o(e,"color")]}function jt(e){return["case",Z,as,_o(e,"size")]}function Ro(e){return["interpolate",["linear"],["zoom"],9,["*",jt(e),.45],12,jt(e),16,["*",jt(e),1.9]]}function Po(e){e.addSource(se,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:z,type:"circle",source:se,paint:{"circle-color":xo(0),"circle-radius":Ro(0),"circle-opacity":.85,"circle-stroke-color":["case",X,co,Z,os,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,Z,.9,.5],12,["case",X,2.4,Z,1.5,1],16,["case",X,3.2,Z,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Ut,type:"circle",source:se,filter:Je,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":co,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,0],12,["case",X,2.4,0],16,["case",X,3.2,0]]}},"walk-fill"),e.hasImage(It)||e.addImage(It,rs(),{pixelRatio:2}),e.addLayer({id:ke,type:"symbol",source:se,filter:Je,layout:{"icon-image":It,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function zt(e,t,n){return je=await ae(`/api/change?radius=${t}`),e.getSource(se).setData(us(je)),is(e),Vt(e,n),je}function Vt(e,t){let n=R.indexOf(t);e.setPaintProperty(z,"circle-color",xo(n)),e.setPaintProperty(z,"circle-radius",Ro(n)),Wt(e,t)}function Eo(e,t,n){Y.has(t)?Y.delete(t):Y.add(t),Wt(e,n)}function Oo(e,t){Y.clear(),Wt(e,t)}function Wt(e,t){let n=R.indexOf(t),o=["none",...Y],a=["case",Z,!Y.has(Ge),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(z,["all",["!",Je],a]);let r=["all",Je,!Y.has(Ye)];e.setFilter(ke,r),e.setFilter(Ut,r)}function Kt(e,t,n){let o=R.indexOf(t),a=e[`b${o}`],r=e.removed===1,s=e.published===0?"the plan adds a stop here":n.find(h=>h.key===a)?.label??a,i=e[`c${o}`],l=e[`p${o}`],d=t==="weekday"?"weekday":t,m=e.published===0||r?" within a walk":"";return`${r?"":`<b>${s}</b><br>`}${ps(e)}${i} \u2192 ${l} buses per ${d}${m}<br><span style="opacity:.6">click for the full comparison</span>`}var ds=1.5,uo=800;function ps(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??uo,a=n!=null&&o>n*ds?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",r=t==null?`no other stop within a ${uo} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${po}">Stop removed</b> \u2014 ${r}<br>`}var qt="surface",qe="surface-fill",Do="#6b7280",Xt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Do],[.138,Do],[1,"#bd60e7"],[2,"#961bed"]],M="#e8232f",C="#0f79c9",To=2,Ke=null,Mo=!1;function Xe(){return Ke}function Zt(){return Mo}function Co(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-To,Math.min(To,n))}function Ao(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Fo(e,t,n,o,a,r,s,i){let l={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let m=s.lat0+(d[1]+.5)*s.dlat,h=s.lon0+(d[0]+.5)*s.dlon;if(m<o||m>r||h<n||h>a)continue;let L=d[Mt(t)],$=d[Ct(t)],D=Ao(L,$);if(D!=="none")if(D==="ramp"){let y=Co(L,$);l[y<-.138?"less":y>.138?"more":"same"]+=i}else l[D]+=i}return l}function ms(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let s=t+r[1]*o,i=s+o,l=n+r[0]*a,d=l+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[l,s],[d,s],[d,i],[l,i],[l,s]]]},properties:Object.fromEntries(R.flatMap((m,h)=>{let L=r[Mt(h)],$=r[Ct(h)];return[[`k${h}`,Ao(L,$)],[`v${h}`,Co(L,$)??0]]}))}})}}function No(e){return["case",["==",["get",`k${e}`],"gone"],M,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Xt.flatMap(([t,n])=>[t,n])]]}function ie(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Ho(e,t){e.addSource(qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:qe,type:"fill",source:qt,layout:{visibility:"none"},paint:{"fill-color":No(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,ie(0,.85),13,ie(0,.62),16,ie(0,.45)]}},t)}async function Qt(e,t,n){return Ke=await ae(`/api/surface?radius=${t}`),e.getSource(qt).setData(ms(Ke)),en(e,n),Ke}function en(e,t){let n=R.indexOf(t);e.setPaintProperty(qe,"fill-color",No(n)),e.setPaintProperty(qe,"fill-opacity",["interpolate",["linear"],["zoom"],9,ie(n,.85),13,ie(n,.62),16,ie(n,.45)])}function Bo(e,t){Mo=t,e.setLayoutProperty(qe,"visibility",t?"visible":"none")}var tn=null;function Ze(){return tn}async function nn(e){return tn=await ae(`/api/population?radius=${e}`),tn}function Io(e,t,n,o,a,r,s){let i={lost:0,gained:0,kept:0,none:0};for(let l of e){let d=s.lat0+(l[1]+.5)*s.dlat,m=s.lon0+(l[0]+.5)*s.dlon;d<o||d>r||m<n||m>a||(i.lost+=l[Vn(t)],i.gained+=l[Wn(t)],i.kept+=l[Kn(t)],i.none+=l[qn(t)])}return i}var on="corridor",jo="corridor-lines",tt="#8b929c",gs="#6f7783",et={lost:M,added:C,kept:tt};var Qe=null,Uo=!1;function nt(){return Qe}function an(){return Uo}function ys(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Jo(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function hs(){let e=t=>["match",["get","klass"],"lost",et.lost,"added",et.added,t];return["interpolate",["linear"],["zoom"],9,e(gs),14,e(tt)]}function fs(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function bs(){return["match",["get","klass"],"kept",.85,.9]}function Go(e,t){e.addSource(on,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:jo,type:"line",source:on,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":hs(),"line-width":fs(),"line-opacity":bs()}},t)}async function rn(e,t){return Qe=await x(`/api/corridors?day=${t}`),e.getSource(on).setData(ys(Qe)),Qe}async function Yo(e,t){R.includes(t)&&await rn(e,t)}function zo(e,t){Uo=t,e.setLayoutProperty(jo,"visibility",t?"visible":"none")}var ln="#2b3038",Vo="#b9bec6",xe={loses:{color:M,size:6},gains:{color:C,size:6},keeps:{color:tt,size:3},here:{color:ln,size:3.5},none:{color:Vo,size:1.8}},at=["loses","gains","keeps","none","here"],sn="oneseat",Wo="oneseat-dots",ot=null,Ko=!1;function le(){return ot}function cn(){return Ko}function qo(e,t,n,o,a,r){let s={};for(let i of t)s[i]=0;for(let i of e){let l=i[0],d=i[1];if(l<o||l>r||d<n||d>a)continue;let m=t[i[3]];m!==void 0&&s[m]++}return s}function vs(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function ws(){return["match",["get","status"],...Object.entries(xe).flatMap(([e,t])=>[e,t.color]),Vo]}function Ss(){let e=["match",["get","status"],...Object.entries(xe).flatMap(([t,n])=>[t,n.size]),xe.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Xo(e,t){e.addSource(sn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Wo,type:"circle",source:sn,layout:{visibility:"none"},paint:{"circle-color":ws(),"circle-radius":Ss(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ls(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var $s="pin";function Zo(e){return"key"in e?e.key:$s}var rt="any";function ks(e,t,n){return`radius=${e}&${Ls(t)}&day=${n}`}function Qo(e,t){return e?t:rt}function ea(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function un(e,t,n,o=rt){return ot=await x(`/api/oneseat?${ks(t,n,o)}`),e.getSource(sn).setData(vs(ot)),ot}function ta(e,t){Ko=t,e.setLayoutProperty(Wo,"visibility",t?"visible":"none")}function dn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function na(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=i=>i.length?i.join(", "):"none",s=dn(t);return e.status==="here"?`<b>at ${s}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${s}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var st={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},pn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},_s=new Set(["gone","new"]);function xs(e,t,n){return _s.has(e)?`${t} (${pn[n]})`:t}function Rs(e){return e.buckets.filter(t=>t.key!=="none")}var oa={area:"Ground",people:"People"};function Ps(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Fo(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=s=>s.toFixed(s<10?1:0);return`
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Es(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=Io(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),r=s=>Math.round(s).toLocaleString();return`
      <div class="lg-area">
        <span><b>${r(a.lost)}</b> people lose all service</span>
        <span><b>${r(a.gained)}</b> gain service</span>
        <span><b>${r(a.kept)}</b> keep a bus</span>
        <span><b>${r(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Os=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function aa(e){let{layer:t,day:n,bounds:o,unit:a,population:r,scoped:s=!1,named:i=!1}=e,l=Xt.map(([d,m])=>`${m} ${((d+2)/4*100).toFixed(1)}%`).join(", ");return`
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
        ${Object.keys(oa).map(d=>`
          <button data-surface-unit="${d}" aria-pressed="${a===d}"
                  class="${a===d?"active":""}">${oa[d]}</button>`).join("")}
      </div>
      ${s?Os:a==="people"?Es(n,o,r):Ps(t,n,o)}
    </div>`}var Ds=["lost","added","kept"],Ts={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Ms={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function sa(e,t){let{lostPct:n,addedPct:o}=Jo(t.km),a=i=>i.toFixed(1),s=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${s}</b> km of street, citywide \u2014 ${Ms[t.day]}
    </div>
    ${Ds.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${et[i]}"></i>
        <span class="lg-lab">${p(Ts[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function ia(e,t,n){let o=t.statuses.map(m=>m.key),a=qo(t.points,o,n.west,n.south,n.east,n.north),r=m=>t.statuses.find(h=>h.key===m)?.label??m,s=at.reduce((m,h)=>m+(a[h]??0),0),i=dn(t),l=t.day&&t.day!==rt,d=l?`Restricted to routes running on ${st[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
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
      South Hills would read as losing rides the Blue Line still runs.</div>`}function la(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var ra={locations:"Locations",riders:"Riders"};function Cs(e,t){let o=`${t.toLocaleString()} location${t===1?"":"s"} in view`,r=t?`<b>${o}</b> ${t===1?"gains":"gain"} a stop where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",s=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${r}${s}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function As(e){if(!e)return"";let t=_e(Ge);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Ge}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Fs(e,t){if(!e)return"";let n=_e(Ye);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Ye}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Ns(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${As(e)}
      ${Fs(t,n)}
    </div>`}function ca(e,t){let{layer:n,day:o,bounds:a,weight:r,surface:s,unit:i="area",population:l,selection:d,dots:m=!0}=t,h=n.buckets.map(w=>w.key),L=n.days.indexOf(o),{west:$,south:D,east:y,north:I}=a,G=Rs(n),_=d&&d.size>0?d:null,Me=_?yo(_):go($,D,y,I),An=So(n.points,L,h,Me),kt=Lo(n.points,Me),_t=$o(n.points,Me),T=r==="riders"?ko(n.points,L,h,Me):null,_r=w=>T?T.measured[w]?Math.round(T.riders[w]).toLocaleString():"\u2014":An[w].toLocaleString(),xr=T?T.removedMeasured?Math.round(T.removedRiders).toLocaleString():"\u2014":_t.toLocaleString(),Rr=_?`at ${_.size.toLocaleString()} selected stop${_.size===1?"":"s"}`:"in view",Fn=G.reduce((w,xt)=>w+An[xt.key],0)+kt+_t,Pr=T?`<b>${Math.round(G.reduce((w,xt)=>w+T.riders[xt.key],0)+T.removedRiders).toLocaleString()}</b> daily boardings ${Rr}`:_?`<b>${Fn.toLocaleString()}</b>
         of ${_.size.toLocaleString()} selected stops`:`<b>${Fn.toLocaleString()}</b>
         locations in view`,Er=!m&&!!s;e.innerHTML=Er?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${st[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${aa({layer:s,day:o,bounds:a,unit:i,population:l,scoped:!!_,named:!0})}`:`
    <div class="lg-head">
      ${Pr}
      <span class="muted">\xB7 ${st[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(ra).map(w=>`
        <button data-weight="${w}" aria-pressed="${r===w}"
                class="${r===w?"active":""}">${ra[w]}</button>`).join("")}
    </div>
    ${G.map(w=>`
      <button class="lg-row ${_e(w.key)?"off":""}" data-bucket="${p(w.key)}"
              aria-pressed="${!_e(w.key)}">
        <i style="background:${Ue[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(xs(w.key,w.label,o))}</span>
        <span class="lg-n">${_r(w.key)}</span>
      </button>`).join("")}
    ${Ns(kt,_t,xr)}
    ${s?aa({layer:s,day:o,bounds:a,unit:i,population:l,scoped:!!_}):""}
    ${T?Cs(T.unmeasured,kt):""}
    ${_?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var mn="#4aa3ff",ha="#ffa23a",gn="headline",it="journey",fa="journey-rides",ba="journey-walks",Hs=[fa,ba],va=null,wa=!1;function ct(){return va}function yn(){return wa}function Bs(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let s of r.legs){let i=s.from??e.origin,l=s.to??e.destination,d=[[i.lon,i.lat],[l.lon,l.lat]],m=s.path?.length?s.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:s.kind,route:s.route}})}}return{type:"FeatureCollection",features:o}}function ua(){return["match",["get","side"],"current",mn,"proposed",ha,mn]}function da(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Sa(e,t){e.addSource(it,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:fa,type:"line",source:it,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ua(),"line-width":da(1),"line-opacity":.85}},t),e.addLayer({id:ba,type:"line",source:it,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ua(),"line-width":da(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function La(e,t){wa=t;for(let n of Hs)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function hn(e,t){va=t;let n=t?Bs(t,gn):{type:"FeatureCollection",features:[]};e.getSource(it).setData(n)}function $a(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var pa=e=>`${e.toFixed(1)} min`;function ka(e){return e==null?"\u2014":e===0?"no change":e>0?`${pa(e)} slower`:`${pa(-e)} faster`}function ma(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function Is(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=ma(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ma(e.to,"the destination")}</span></div>`}function ga(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(Is(a,t)),o=a}return n.join("")}var js={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function lt(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Us(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Js(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${lt(t.current)} \u2192
        ${lt(t.proposed)} min</span>
        <span class="muted">${ka(t.change_min)}</span></div>
      ${o}
    </div>`}function ya(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
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
        <p>${js[n.classification]??""}</p>
      </div>
      ${ya(e)}`:`${a}
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
      <div class="hl-delta ${o}">${ka(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Us(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ga(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ga(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Js(e)}
    ${ya(e)}`}function _a(e){return`
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
    </div>`}function xa(e){let t=e?e.radii[gn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${mn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ha}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var pt="places",Ea="places-points",bn="places-boundaries",ee="places-fill",ue="lost",Gs=100,Ys={lost:"share_lost",gained:"share_gained"};function W(e,t){return`service_${e}_${t}`}var Oa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},zs="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Q={lost:M,gained:C},ut=null,V=null,ce=null,Da=!1,dt=null;function vn(){return ut}function Ta(){return V}function Ma(){return dt}function wn(){return ce}function Re(){return Da}function Vs(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function Ws(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Ks(e){return Math.max(e.residents_lost,e.residents_gained)}var Ra=4,qs=16,Xs=1e3;function Zs(e){let t=Math.min(1,Math.sqrt(e/Xs));return Ra+t*(qs-Ra)}function Qs(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Ws(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Zs(Ks(t))}}))}}function ei(){return["match",["get","klass"],"lost",Q.lost,"gained",Q.gained,Q.lost]}function ti(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var U=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var J=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Ca(e,t){return e==="service"?["step",["abs",["coalesce",["get",W(t,"pct")],0]],J[0].opacity,J[0].max,J[1].opacity,J[1].max,J[2].opacity,J[2].max,J[3].opacity]:["step",["coalesce",["get",Ys[e]],0],U[0].opacity,Number.EPSILON,U[1].opacity,U[1].max,U[2].opacity,U[2].max,U[3].opacity,U[3].max,U[4].opacity]}function Aa(e,t){return e==="service"?["case",[">=",["coalesce",["get",W(t,"pct")],0],0],C,M]:Q[e]}function ni(e,t){let n=W(t,"now"),o=W(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var oi=3;function ai(e){if(e.length===0)return"";let t=e.slice(0,oi),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function Fa(e,t){e.addSource(bn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ee,type:"fill",source:bn,layout:{visibility:"none"},paint:{"fill-color":Aa(ue),"fill-opacity":Ca(ue),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(pt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ea,type:"circle",source:pt,layout:{visibility:"none"},paint:{"circle-color":ei(),"circle-radius":ti(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function mt(e,t,n){e.setPaintProperty(ee,"fill-color",Aa(t,n)),e.setPaintProperty(ee,"fill-opacity",Ca(t,n))}async function Na(){return ut||(ut=await x("/api/places")),ut}async function Ha(e){return ce||(ce=await x("/api/boundaries"),e.getSource(bn).setData(ce)),ce}function ri(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Ba(e,t){let n=ri(ce,t);if(n)return V=null,dt=n,e.getSource(pt)?.setData({type:"FeatureCollection",features:[]}),null;try{V=await x(`/api/places/${encodeURIComponent(t)}`)}catch{return V=null,dt=null,null}return dt=null,e.getSource(pt).setData(Qs(V)),e.flyTo({center:[V.lon,V.lat],zoom:13}),V}function Ia(e,t){Da=t,e.setLayoutProperty(Ea,"visibility",t?"visible":"none"),e.setLayoutProperty(ee,"visibility",t?"visible":"none")}function si(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${p(e.key)}">
      <span class="place-name">${p(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var ii="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function ja(e,t,n,o){let a=Vs(e,t).map(r=>si(r,r.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${zs}</p>
    ${o==="service"?`<p class="note">${ii}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Ua(e,t){return e?`<div class="lg-head"><b>${p(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${p(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function li(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function ci(e,t,n,o){let a=J.map((l,d)=>({band:l,prevMax:d===0?0:J[d-1].max})).filter(({band:l})=>l.opacity>0).flatMap(({band:l,prevMax:d})=>{let m=li(l,d);return[`<div class="lg-row lg-static">
          <i style="background:${M};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${l.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} more trips</span></div>`]}).join(""),r=o?ni(o,n):[],s=ai(r),i=s?`<div class="lg-foot">${p(s)}</div>`:"";return`
    ${Ua(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${p(Oa[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Ja({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return ci(e,a??null,n,o??null);let r=t==="lost"?"lose all buses":"gain a bus",s=U.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${Q[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${p(i.label)} of the place's own residents ${p(r)}</span>
    </div>`).join("");return`
    ${Ua(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${p(r)}</div>
    ${s}
    <div class="lg-row lg-static"><i style="background:${Q.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Q.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function ui(e,t){let n=e[W(t,"now")],o=e[W(t,"proposed")],a=e[W(t,"pct")],r=e[W(t,"rail_proposed")],s=Oa[t];if(o===0&&n>0)return`Loses all buses on ${s} (${n} \u2192 0 trips)${r?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${s} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${s} (${i}).`}function Ga(e,t,n){if(t==="service")return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      ${ui(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=Pa("lose all buses",e.residents_lost,e.share_lost),r=e.residents_gained>0?Pa("gain a bus",e.residents_gained,e.share_gained):null,s=(t==="lost"?[a,r]:[r,a]).filter(i=>i!==null);return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
    ${s.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Pa(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Gs} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var Sn=" \xB7 ",Ln={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Ya=Object.keys(Ln);function za(e){return Ln[e]??e}var di={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},pi=["oneseat","journey"];function mi(e){return e!=="journey"}function gi(e){let t=[Ln[e.view]??e.view];return e.view==="places"?t[0]:(pi.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":di[e.day]),mi(e.view)&&t.push(`${e.radius} m walk`),t.join(Sn))}function Va(e){let[t,...n]=gi(e).split(Sn);return`<b>${p(t)}</b>${n.map(o=>Sn+p(o)).join("")}`}var f={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},yi=/^[cp]:[\w.:-]{1,32}$/,gt={any:"any",selected:"selected"},hi="pin",Wa=5;function qa(e){try{return e.self!==e.top}catch{return!0}}function Xa(e){let t=new URLSearchParams;return t.set(f.view,e.view),t.set(f.day,e.day),t.set(f.radius,String(e.radius)),t.set(f.oneSeatDay,e.oneSeatRestricted?gt.selected:gt.any),t.set(f.dest,"key"in e.dest?e.dest.key:$n(e.dest)),e.weight==="riders"&&t.set(f.weight,e.weight),e.surfaceUnit==="people"&&t.set(f.surfaceUnit,e.surfaceUnit),e.at&&t.set(f.at,$n(e.at)),e.camera&&t.set(f.camera,`${$n(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(f.place,e.place),e.placeFill!==ue&&t.set(f.placeFill,e.placeFill),e.selection.length&&t.set(f.selection,e.selection.join(",")),`?${t}`}function Za(e){let t=new URLSearchParams(e),n={},o=t.get(f.view);o&&Ya.includes(o)&&(n.view=o);let a=t.get(f.day);a&&R.includes(a)&&(n.day=a);let r=Number(t.get(f.radius));t.has(f.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(f.weight)==="riders"?n.weight="riders":t.get(f.weight)==="locations"&&(n.weight="locations"),t.get(f.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(f.surfaceUnit)==="area"&&(n.surfaceUnit="area");let s=t.get(f.oneSeatDay);s===gt.selected?n.oneSeatRestricted=!0:s===gt.any&&(n.oneSeatRestricted=!1);let i=t.get(f.dest);if(i&&i!==hi){let $=Ka(i);$?n.dest=$:i.includes(",")||(n.dest={key:i})}let l=Ka(t.get(f.at));l&&(n.at=l);let d=fi(t.get(f.camera));d&&(n.camera=d);let m=t.get(f.place);m&&(n.place=m);let h=t.get(f.selection);h!==null&&(n.selection=h.split(",").filter($=>yi.test($)));let L=t.get(f.placeFill);return(L==="lost"||L==="gained"||L==="service")&&(n.placeFill=L),n}function $n(e){return`${e.lat.toFixed(Wa)},${e.lon.toFixed(Wa)}`}function Ka(e){let t=Qa(e,2);return t?{lat:t[0],lon:t[1]}:null}function fi(e){let t=Qa(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Qa(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var kn="embed";var bi=["1","true","yes"];function er(e){let t=new URLSearchParams(e).get(kn);return t!==null&&bi.includes(t.toLowerCase())}function tr(e){let t=new URLSearchParams(e);return t.set(kn,"1"),`?${t}`}function nr(e){let t=new URLSearchParams(e);t.delete(kn);let n=String(t);return n?`?${n}`:""}function or(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var K=["peek","half","full"],vi=192,wi=.3,Si=.55,Li=.9,$i=.6,ki=.45;function yt(e,t){return e==="peek"?Math.min(vi,t*wi):e==="half"?t*Si:t*Li}function _i(e,t,n=0){let o=K.map(r=>Math.abs(yt(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>$i&&(a=Math.max(0,Math.min(K.length-1,a+(n>0?1:-1)))),K[a]}function ar(e){return K[(K.indexOf(e)+1)%K.length]}function xi(e,t){return Math.min(e,t*ki)}function de(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function _n(e){let t=null,n=()=>{let o=de();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Ri=8,Pi=400;function rr(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,r=0,s=0,i=0,l={y:0,t:0};function d(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,xi(y,d()))}function h(y){o=y,t.dataset.snap=y,m(yt(y,d()))}n.addEventListener("pointerdown",y=>{de()&&(a=!0,r=y.clientY,s=t.getBoundingClientRect().height,i=y.timeStamp,l={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!a)return;let I=s+(r-y.clientY),G=yt("peek",d()),_=yt("full",d());m(Math.max(G,Math.min(_,I))),l={y:y.clientY,t:y.timeStamp}});function L(y){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-r)>Ri)&&y.timeStamp-i<Pi){h(ar(o));return}let G=y.timeStamp-l.t,_=G>0?(l.y-y.clientY)/G:0;h(_i(t.getBoundingClientRect().height,d(),_))}n.addEventListener("pointerup",L),n.addEventListener("pointercancel",L),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),de()&&h(ar(o)))});let $=_n(e.onLayoutChange);function D(){if($(),!de()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}h(o)}return window.addEventListener("resize",D),D(),{at:()=>de()?o:"full",atLeast(y){de()&&K.indexOf(y)>K.indexOf(o)&&h(y)}}}var Ei=["llvmpipe","swiftshader","softpipe","basic render","software"];function xn(e){if(!e)return!1;let t=e.toLowerCase();return Ei.some(n=>t.includes(n))}function ir(e){let t=xn(e.renderer)?1:2;return Math.min(e.dpr||1,t)}function lr(e){return xn(e.renderer)?0:Oi}var Oi=300,Di="https://tiles.openfreemap.org/styles/positron",Ti=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],sr=[],Mi=19,Ci='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',Ai=!1;function cr(e){return!Ai||!xn(e.renderer)?Di:Fi()}function Fi(){let e=o=>({type:"raster",tileSize:256,attribution:Ci,tiles:o,maxzoom:Mi}),t={basemap:e(Ti)},n=[{id:"basemap",type:"raster",source:"basemap"}];return sr.length&&(t["basemap-labels"]=e(sr),n.push({id:"basemap-labels",type:"raster",source:"basemap-labels"})),{version:8,sources:t,layers:n}}function ur(e=window){let t=e.devicePixelRatio||1;try{let n=e.document.createElement("canvas").getContext("webgl2")??e.document.createElement("canvas").getContext("webgl");if(!n)return{renderer:null,dpr:t};let o=n.getExtension("WEBGL_debug_renderer_info"),a=o?n.getParameter(o.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER);return{renderer:typeof a=="string"?a:null,dpr:t}}catch{return{renderer:null,dpr:t}}}function Ni(e){return`${e.layer?.id}:${e.id??JSON.stringify(e.geometry?.coordinates)}`}function dr(e,t,n){let o=new Map(n.map(l=>[l.layer,l])),a=null,r="",s=l=>{r!==l&&(r=l,e.getCanvas().style.cursor=l)},i=()=>{a=null,s(""),t.remove()};return e.on("mousemove",l=>{let d=n.map(I=>I.layer).filter(I=>e.getLayer(I)&&e.getLayoutProperty(I,"visibility")!=="none");if(!d.length){i();return}let[m,...h]=e.queryRenderedFeatures(l.point,{layers:d});if(!m){i();return}s("pointer");let L=Ni(m);if(L===a)return;let $=o.get(m.layer?.id),D=$?$.html(m,h):null;if(D==null){a=null,t.remove();return}a=L;let y=$.anchor?$.anchor(m,l):l.lngLat;t.setLngLat(y).setHTML(D).addTo(e)}),e.on("mouseout",i),i}var Hi=[-79.9959,40.4406],Bi=12,Ii="#e2574c",E={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},Ee=Za(location.search),De=er(location.search);De&&c("app").classList.add("embed");var ji={at:()=>"full",atLeast(){}},yr=null,O=400,Pe=null,b=null,me=null,oe=0,k={key:"downtown"},te=null,hr=!1,he=!1,St="locations",fe="area",fr="count",wt=null,F=ue,H=!1,g="dots",br,On=[],pr=()=>{},Rn=ur(),u=new maplibregl.Map({container:"map",style:cr(Rn),pixelRatio:ir(Rn),fadeDuration:lr(Rn),renderWorldCopies:!1,center:Ee.camera?[Ee.camera.lon,Ee.camera.lat]:Hi,zoom:Ee.camera?.zoom??Bi,cooperativeGestures:qa(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{In(u),Po(u),Ho(u,Ve),Go(u,Ve),Xo(u,"walk-fill"),Sa(u),Fa(u,Ve),N(),u.on("click",t=>{if(H)return;if(hr){Oe({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let r=u.queryRenderedFeatures(t.point,{layers:[ee]})[0];r&&ft(r.properties.key);return}let n=[...ze,"oneseat-dots"].filter(r=>u.getLayoutProperty(r,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Cn(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});pr=dr(u,e,[...jn(t=>{let n=We(),o=t.find(a=>ze.includes(a.layer?.id));return n&&o?Kt(o.properties,S(),n.buckets):null}),...ze.map(t=>({layer:t,html:n=>{let o=We();return o?Kt(n.properties,S(),o.buckets):null},anchor:n=>n.geometry.coordinates})),{layer:"oneseat-dots",html:t=>{let n=le();return n?na(t.properties,n):null},anchor:t=>t.geometry.coordinates},{layer:ee,html:t=>Ga(t.properties,F,S())}]),ol(),u.on("moveend",()=>{let t=u.getCenter();yr={lat:t.lat,lon:t.lng,zoom:u.getZoom()},v(),B()}),pe(E.radius,t=>{O=Number(t.dataset.radius),zt(u,O,S()).then(v),Xe()&&Qt(u,O,S()).then(v),Ze()&&nn(O).then(v),le()&&bt(),b&&ge(b.lat,b.lon)}),pe(E.day,t=>{let n=t.dataset.day;no(n),g!=="journey"&&N(),Vt(u,n),en(u,n),g==="journey"&&b&&Dn(b.lat,b.lon),nt()&&Yo(u,n).then(v),he&&le()&&(bt(),b&&ge(b.lat,b.lon)),Re()&&F==="service"&&mt(u,F,n),v()}),pe(E.oneSeatDay,t=>{he=t.dataset.oneseatDay==="selected",En(),bt(),b&&ge(b.lat,b.lon)}),pe(E.view,t=>{let n=g;g=t.dataset.view,pr(),mo(u,g==="dots"||g==="both"),Vi(g==="surface"||g==="both"),Ki(g==="corridors"),Qi(g==="oneseat"),Zi(g==="journey",n==="journey"),qi(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),Xi(Ot(g)),Lr();let o=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),be()||mr(!1),ye(),En(),o||vt(!1),wr()}),pe(E.dest,t=>{let n=t.dataset.dest;if(n==="pin"){vt(!0);return}vt(!1),Oe({key:n})}),pe(E.placeFill,t=>{F=t.dataset.placeFill,Re()&&mt(u,F,S()),N(),v(),En()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){St=n.dataset.weight,v(),B();return}let o=t.target.closest("[data-surface-unit]");if(o){fe=o.dataset.surfaceUnit,Wi(fe),B();return}let a=t.target.closest("[data-bucket]");a&&(Eo(u,a.dataset.bucket,S()),v())}),c("legend-reset").addEventListener("click",()=>{Oo(u,S()),v()}),c("legend-select").addEventListener("click",()=>mr(!H)),c("legend-clear").addEventListener("click",()=>{Gt(u),ye(),v(),B()}),c("legend-collapse").addEventListener("click",()=>{Pn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Oe({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&sl(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&ft(a.dataset.selectPlace);let r=t.target.closest("[data-sort-places]");r&&(fr=r.dataset.sortPlaces,N());let s=t.target.closest("[data-goto-place]");s&&(g!=="places"&&ne(E.view,"places"),ft(s.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Yi),De&&_n(Pn),br=De?ji:rr({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Pn}),Ji(),$t(),ye(),Lt(),Ui(Ee)||zt(u,O,S()).then(v),rl(),al()});function pe(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),$t(),B()})})}function ne(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Ui(e){let t=!1;return e.radius!==void 0&&(t=ne(E.radius,String(e.radius))||t),e.day&&(t=ne(E.day,e.day)||t),e.oneSeatRestricted!==void 0&&ne(E.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(St=e.weight),e.surfaceUnit&&(fe=e.surfaceUnit),e.placeFill&&ne(E.placeFill,e.placeFill),e.dest&&("key"in e.dest?ne(E.dest,e.dest.key):Oe(e.dest)),e.selection&&wo(u,e.selection),e.view&&ne(E.view,e.view),e.at&&Cn(e.at.lat,e.at.lon),e.place&&ft(e.place),t}function B(){let e={view:g,day:S(),radius:O,oneSeatRestricted:he,weight:St,surfaceUnit:fe,dest:k,at:b,camera:yr,place:wt,placeFill:F,selection:fo()},t=Xa(e);history.replaceState(null,"",(De?tr(t):t)+location.hash),Lt(t)}function Lt(e=nr(location.search)){if(!De)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=b?me?Le(me):"this point":null;t.querySelector(".el-action").textContent=or(n)}function $t(){c("statebar").innerHTML=Va({view:g,day:S(),radius:O,oneSeatRestricted:he,destination:Te()}),Gi()}function Pn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Ji(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Gi(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(za(g)))}function Yi(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function v(){zi()}function zi(){if(c("legend-reset").classList.toggle("hidden",an()||cn()||yn()||Re()||!be()),yn()){c("legend").innerHTML=xa(ct());return}if(Re()){c("legend").innerHTML=Ja({selected:Ta(),fill:F,day:S(),boundaries:wn(),unchanged:Ma()});return}if(an()){let n=nt();n&&sa(c("legend"),n);return}if(cn()){let n=le();if(!n)return;let o=u.getBounds();ia(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=We();if(!e)return;let t=u.getBounds();ca(c("legend"),{layer:e,day:S(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:St,dots:be(),surface:Zt()?Xe():null,unit:fe,population:Ze(),selection:ho()})}async function Vi(e){if(e&&!Xe()){c("legend").classList.add("loading");try{await Qt(u,O,S())}finally{c("legend").classList.remove("loading")}}Bo(u,e),e&&fe==="people"&&await vr(),v()}async function vr(){if(!Ze()){c("legend").classList.add("loading");try{await nn(O)}finally{c("legend").classList.remove("loading")}}}async function Wi(e){e==="people"&&Zt()&&await vr(),v()}async function Ki(e){if(e&&!nt()){c("legend").classList.add("loading");try{await rn(u,S())}finally{c("legend").classList.remove("loading")}}zo(u,e),v()}async function qi(e){if(e&&(!vn()||!wn())){c("legend").classList.add("loading");try{await Promise.all([Na(),Ha(u)])}finally{c("legend").classList.remove("loading")}}Ia(u,e),e&&mt(u,F,S()),e&&N(),v()}async function ft(e){wt=await Mn(()=>Ba(u,e))?e:null,g==="places"&&(N(),wt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),B()}function Xi(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),Lt(),g==="places"){c("panel").innerHTML=ja(vn()??[],fr,wt,F);return}if(!me){g==="oneseat"?c("panel").innerHTML=lo(Te()):oo(c("panel"));return}if(g==="oneseat"){let t=io(me,k,S());if(t){c("panel").innerHTML=t;return}}so(me)}function Zi(e,t=!1){if(La(u,e),v(),!e){t&&(b?ge(b.lat,b.lon):N());return}ct()&&b?c("panel").innerHTML=fn(ct(),Te()):c("panel").innerHTML=_a(Te())}async function Dn(e,t){let n=++oe;b={lat:e,lon:t},B(),$r(e,t);let o=Sr(),a=p(Te());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await x($a({lat:e,lon:t},o,S()));if(n!==oe)return;hn(u,r),c("panel").innerHTML=fn(r,a),v(),Lt()}catch(r){if(n!==oe)return;hn(u,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function En(){c("day-controls").classList.toggle("hidden",!ea(g,he,F))}function Tn(){return Qo(he,S())}async function Qi(e){e&&!le()&&await Mn(()=>un(u,O,k,Tn())),ta(u,e),v()}async function bt(){await Mn(()=>un(u,O,k,Tn())),v()}async function Mn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Oe(e){if(k=e,vt(!1),el(),wr(),$t(),B(),g==="journey"){b&&Dn(b.lat,b.lon),v();return}b?ge(b.lat,b.lon):N({scrollToTop:!0}),bt()}function wr(){let e=Sr();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in k))){te?.remove(),te=null;return}te?te.setLngLat([e.lon,e.lat]).addTo(u):(te=new maplibregl.Marker({color:ln,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),te.on("dragend",()=>{let n=te.getLngLat();Oe({lat:n.lat,lon:n.lng})}))}function el(){let e=Zo(k);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Sr(){if("lat"in k)return{lat:k.lat,lon:k.lon};let e=k.key,t=On.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Te(){if("lat"in k)return`${k.lat.toFixed(4)}, ${k.lon.toFixed(4)}`;let e=k.key;return On.find(t=>t.key===e)?.name??e}function vt(e){hr=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function ge(e,t){let n=++oe;b={lat:e,lon:t},B(),c("panel").classList.add("loading"),$r(e,t),Dt(u),c("pin-key").classList.add("hidden");try{let o="lat"in k?`&dest_lat=${k.lat.toFixed(6)}&dest_lon=${k.lon.toFixed(6)}`:"",a=await x(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${O}${o}&oneseat_day=${Tn()}`);if(n!==oe)return;q={lat:e,lon:t,radius:O,now:a.current.stops,proposed:a.proposed.stops},Lr(),me=a,N({scrollToTop:!0})}catch(o){if(n!==oe)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===oe&&c("panel").classList.remove("loading")}}var q=null;function Lr(){if(!q||!Ot(g)){Dt(u),c("pin-key").classList.add("hidden");return}Un(u,q.lat,q.lon,q.radius,q.now,q.proposed),tl(q.radius)}function tl(e){c("pin-key").innerHTML=la(e),c("pin-key").classList.remove("hidden")}function $r(e,t){Pe?Pe.setLngLat([t,e]):(Pe=new maplibregl.Marker({color:Ii,draggable:!0}).setLngLat([t,e]).addTo(u),Pe.on("dragend",()=>{let n=Pe.getLngLat();Cn(n.lat,n.lng)}))}var ht=14;function be(){return g==="dots"||g==="both"}function mr(e){H=e&&be(),H?u.dragPan.disable():u.dragPan.enable(),u.getCanvas().style.cursor=H?"none":"",H||kr(),ye()}function ye(){let e=c("legend-select");e.classList.toggle("hidden",!be()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!be()||!bo())}function nl(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function gr(e){c("brush").classList.toggle("painting",e)}function kr(){c("brush").hidden=!0}function ol(){let e=c("brush");e.style.width=`${ht*2}px`,e.style.height=`${ht*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,ye(),v()}))},r=()=>{H&&(t=!0,n=!1,gr(!0))},s=l=>{if(nl(l.point.x,l.point.y),!t)return;n=!0,Jt(u,Yt(u,l.point.x,l.point.y,ht))&&a()},i=l=>{if(gr(!1),!!t){if(t=!1,!n){let[d]=Yt(u,l.point.x,l.point.y,ht);d&&vo(u,d)}ye(),v(),B()}};u.on("mousedown",r),u.on("mousemove",s),u.on("mouseup",i),u.getCanvas().addEventListener("mouseleave",kr),u.on("touchstart",r),u.on("touchmove",s),u.on("touchend",i)}function Cn(e,t){if(br.atLeast("half"),g==="journey"){Dn(e,t);return}g!=="places"&&ge(e,t)}async function al(){try{On=await x("/api/destinations"),$t()}catch{}}async function rl(){try{let e=await x("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function sl(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
