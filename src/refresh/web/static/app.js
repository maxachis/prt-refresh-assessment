"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function ae(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Et(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Dt(e){return e>0?`+${e}`:String(e)}function Hn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var $s="#15181e",Fe="#ffa23a",ks="#ffffff";function _s(e,t,n,o=96){let a=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let u=i/o*2*Math.PI;a.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function z(e){return{type:"FeatureCollection",features:e}}function xs(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function Ps(e){let t=e.side==="current"?"today":"proposed",n=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"";return`<b>${e.name}</b><br>${t} \xB7 stop ${e.stop_id}${n}`}function Bn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function In(e){e.addSource("walk",{type:"geojson",data:z([])}),e.addSource("stops-now",{type:"geojson",data:z([])}),e.addSource("stops-prop",{type:"geojson",data:z([])}),e.addSource("stop-moves",{type:"geojson",data:z([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Fe,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":ks,"circle-stroke-width":3,"circle-stroke-color":Fe}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":$s,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(Ps(s)).addTo(e)})}function jn(e,t,n,o,a,s){e.getSource("walk").setData(z([_s(t,n,o)])),e.getSource("stops-now").setData(z(Bn(a,"current"))),e.getSource("stops-prop").setData(z(Bn(s,"proposed"))),e.getSource("stop-moves").setData(z(xs(s)))}var R=["weekday","saturday","sunday"],Tt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Un={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ne=4,He=5,Jn=e=>He+Ne*e,zn=e=>He+1+Ne*e,be=e=>He+2+Ne*e,Rs=e=>He+3+Ne*e,Be=2,Os=3,ve=4,we=e=>e[Os],O=(e,t)=>e[t],Gn=(e,t)=>e[Rs(t)],Ct=e=>2+2*e,Mt=e=>3+2*e,Ie=4,Yn=e=>2+Ie*e,Vn=e=>3+Ie*e,Kn=e=>4+Ie*e,Wn=e=>5+Ie*e;var Ft="weekday";function L(){return Ft}function to(e){Ft=e}function no(e){e.innerHTML=`
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
    </div>`}function Es(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Ds(e,t){let n=Math.max(1,...Tt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Tt.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,r=s-a,i=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${Un[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${r===0?"\xB7":Dt(r)}</td>
      </tr>`}).join("")}function oo(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function qn(e){return e.first==null?'<span class="muted">no service</span>':`${ae(e.first)}\u2013${ae(e.last)}`}function Xn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Ts={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Cs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ms(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Je(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(o.name)}</span>
          <span class="os-status ${p(o.status)}">${Ts[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Cs[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Ue("one-seat")}</p>
    </div>`:""}function Ue(e){return` <button class="howto" data-caveat="${e}">method</button>`}function je(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function Zn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Qn(e){return e.first==null||e.last==null?null:e.last-e.first}function Je(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${eo(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${eo(t,n,"prop")}</div>
    </div>`}function eo(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${p(o)}</span>`).join(" "):'<span class="muted">none</span>'}var At=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,As="Allegheny";function Se(e){let t=e.place?.muni?.trim()??"",n=At.exec(t)?.[1],o=n===As?t.replace(At,""):n?`${t.replace(At,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Nt(e){return e==="weekday"?"weekday":e}function ao(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Nt(t)}`}function Fs(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds where none stands within 150 m</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Ns(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",r=[a,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${r}</div></dd>`}function Hs(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Nt(t)}, today only</span>`}${o}</dd>`}function Bs(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Ue("boardings")}</p>`}function Is(e){if(!e)return"";let t=p(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${Ue("place-population")}</p>
    </div>`}function Ht(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,r=s>0?"up":s<0?"down":"flat",i=Xn(o),u=Xn(a),d=Qn(o),m=Qn(a);return`
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
        ${s===0?"no change":`${Dt(s)} trips`}
        <div class="muted">${Hn(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Nt(t)}, both directions</div>

    <div class="tiers">${Es(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Ds(o,a)}</tbody>
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
      ${je(qn(o),qn(a))}
      <dt>Hours between</dt>
      ${je(Et(d),Et(m),Zn(d,m,"more"))}
      <dt>Typical wait</dt>
      ${je(i==null?"\u2014":`${i} min`,u==null?"\u2014":`${u} min`,Zn(i,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${je(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Ns(e.current.stops)}
      ${Fs(e.proposed.stops)}
      ${Hs(o.boardings,t)}
    </dl>
    ${Bs(o.boardings)}

    ${n}

    ${Is(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Je(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Ue("location-not-route")}</p>
    </div>`}function so(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${p(Se(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ht(e,Ft,Ms(e.oneseat??[],e.oneseat_day??"any"))}`}var js={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Us={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Js={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function zs(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Bt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${oo(t)}</div>`:""}function Gs(e){let t=Bt("kept",e.kept)+Bt("lost",e.lost)+Bt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Ys(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Je(e.current,e.proposed)}
    </div>`}function Vs(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${p(a.key)}">
      <span class="os-name">${p(a.name)}</span>
      <span class="os-status ${p(a.status)}">${Ks[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Ks={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Ws(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Js[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function ro(e,t,n){let o=zs(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":Gs(o)+Ys(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${p(o.name)}</h2>
      <div class="muted">
        from ${p(Se(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${p(o.status)}">${js[o.status]}</div>
    <p class="note">${Us[o.status]} ${Ws(a)}</p>

    ${s}

    ${Vs(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${ao(e,n)}</summary>
      ${Ht(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function io(e){return`
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
    </div>`}var Ge={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},se="change",Y="change-dots",X=["boolean",["feature-state","selected"],!1],lo="#15181e",Z=["==",["get","published"],0],Ve="newplace",qs="#15181e",Xs=5,Ye=["==",["get","removed"],1],Ke="removedstop",$e="change-removed",Ut="change-removed-selected",It="removed-cross",uo="#e8232f";function Zs(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[s,r]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,uo]])o.lineWidth=s,o.strokeStyle=r,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var ze=null,G=new Set,F=new Set,Qs=[Y,Ut,$e],Jt=[Y,$e],We=Y;function po(e,t){for(let n of Qs)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function zt(){return ze}function ke(e){return G.has(e)}function mo(e,t,n,o){return a=>nr(a,e,t,n,o)}function go(e){return t=>e.has(we(t))}function yo(){return F}function fo(){return[...F].sort()}function ho(){return F.size}function Gt(e,t){let n=0;for(let o of t)F.has(o)||(F.add(o),Le(e,o,!0),n++);return n}function bo(e,t){F.delete(t)?Le(e,t,!1):(F.add(t),Le(e,t,!0))}function vo(e,t){Yt(e),Gt(e,t)}function Yt(e){for(let t of F)Le(e,t,!1);F.clear()}function Le(e,t,n){try{e.setFeatureState({source:se,id:t},{selected:n})}catch{}}function er(e){for(let t of F)Le(e,t,!0)}function tr(e,t,n,o){let a=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=a).map(s=>s.id)}function Vt(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],s=[Y,$e].filter(i=>e.getLayer(i)),r=e.queryRenderedFeatures(a,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[u,d]=i.geometry.coordinates,m=e.project([u,d]);return{id:i.id,x:m.x,y:m.y}});return tr(t,n,o,r)}function wo(e,t,n,o){let a={};for(let s of n)a[s]=0;for(let s of e){if(!o(s)||O(s,Be)===0||O(s,ve)===1)continue;let r=n[O(s,be(t))];r!==void 0&&a[r]++}return a}function So(e,t){let n=0;for(let o of e)t(o)&&O(o,Be)===0&&n++;return n}function Lo(e,t){let n=0;for(let o of e)t(o)&&O(o,ve)===1&&n++;return n}function nr(e,t,n,o,a){let s=O(e,0),r=O(e,1);return s>=n&&s<=a&&r>=t&&r<=o}function $o(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)a.riders[s]=0,a.measured[s]=0;for(let s of e){if(!o(s)||O(s,Be)===0)continue;let r=n[O(s,be(t))];if(r===void 0)continue;let i=Gn(s,t),u=O(s,ve)===1;if(i===null){r!=="none"&&a.unmeasured++;continue}if(u){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[r]+=i,a.measured[r]++}return a}function or(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>R.some((o,a)=>t[O(n,be(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:we(n),published:n[2],removed:n[ve],replacement:e.replacement?.[we(n)]?.[0]??null,nearestStraight:e.replacement?.[we(n)]?.[1]??null,...Object.fromEntries(R.flatMap((o,a)=>[[`b${a}`,t[O(n,be(a))]],[`c${a}`,n[Jn(a)]],[`p${a}`,n[zn(a)]]]))}}))}}function ko(e,t){let n=Object.entries(Ge).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Ge.none[t]]}function _o(e){return["case",Z,"rgba(0,0,0,0)",ko(e,"color")]}function jt(e){return["case",Z,Xs,ko(e,"size")]}function xo(e){return["interpolate",["linear"],["zoom"],9,["*",jt(e),.45],12,jt(e),16,["*",jt(e),1.9]]}function Po(e){e.addSource(se,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Y,type:"circle",source:se,paint:{"circle-color":_o(0),"circle-radius":xo(0),"circle-opacity":.85,"circle-stroke-color":["case",X,lo,Z,qs,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,Z,.9,.5],12,["case",X,2.4,Z,1.5,1],16,["case",X,3.2,Z,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Ut,type:"circle",source:se,filter:Ye,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":lo,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",X,1.6,0],12,["case",X,2.4,0],16,["case",X,3.2,0]]}},"walk-fill"),e.hasImage(It)||e.addImage(It,Zs(),{pixelRatio:2}),e.addLayer({id:$e,type:"symbol",source:se,filter:Ye,layout:{"icon-image":It,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Kt(e,t,n){return ze=await S(`/api/change?radius=${t}`),e.getSource(se).setData(or(ze)),er(e),Wt(e,n),ze}function Wt(e,t){let n=R.indexOf(t);e.setPaintProperty(Y,"circle-color",_o(n)),e.setPaintProperty(Y,"circle-radius",xo(n)),qt(e,t)}function Ro(e,t,n){G.has(t)?G.delete(t):G.add(t),qt(e,n)}function Oo(e,t){G.clear(),qt(e,t)}function qt(e,t){let n=R.indexOf(t),o=["none",...G],a=["case",Z,!G.has(Ve),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(Y,["all",["!",Ye],a]);let s=["all",Ye,!G.has(Ke)];e.setFilter($e,s),e.setFilter(Ut,s)}function Eo(e,t,n){let o=R.indexOf(t),a=e[`b${o}`],s=e.removed===1,r=e.published===0?"the plan adds a stop here":n.find(v=>v.key===a)?.label??a,i=e[`c${o}`],u=e[`p${o}`],d=t==="weekday"?"weekday":t,m=e.published===0||s?" within a walk":"";return`${s?"":`<b>${r}</b><br>`}${sr(e)}${i} \u2192 ${u} buses per ${d}${m}<br><span style="opacity:.6">click for the full comparison</span>`}var ar=1.5,co=800;function sr(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??co,a=n!=null&&o>n*ar?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${co} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${uo}">Stop removed</b> \u2014 ${s}<br>`}var Xt="plan-stops",Zt="plan-stops-c",xe=14,_e=null;function rr(e){return{type:"FeatureCollection",features:e.map(([t,n,o,a])=>({type:"Feature",geometry:{type:"Point",coordinates:[n,t]},properties:{stop_id:o,name:a}}))}}function Do(e,t){e.addSource(Xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Zt,type:"circle",source:Xt,minzoom:xe,layout:{visibility:"none"},paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":Fe,"circle-radius":["interpolate",["linear"],["zoom"],xe,3,16,5.5,18,8],"circle-stroke-width":["interpolate",["linear"],["zoom"],xe,1,16,1.5,18,2]}},t)}async function ir(e){return _e||(_e=await S("/api/stops/all?side=proposed")),e.getSource(Xt).setData(rr(_e)),_e}async function qe(e,t){t&&!_e&&await ir(e),e.getLayer(Zt)&&e.setLayoutProperty(Zt,"visibility",t?"visible":"none")}var Qt="surface",Ze="surface-fill",To="#6b7280",en=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,To],[.138,To],[1,"#bd60e7"],[2,"#961bed"]],T="#e8232f",C="#0f79c9",Co=2,Xe=null,Mo=!1;function Qe(){return Xe}function tn(){return Mo}function Ao(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Co,Math.min(Co,n))}function Fo(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function No(e,t,n,o,a,s,r,i){let u={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let m=r.lat0+(d[1]+.5)*r.dlat,v=r.lon0+(d[0]+.5)*r.dlon;if(m<o||m>s||v<n||v>a)continue;let P=d[Ct(t)],k=d[Mt(t)],_=Fo(P,k);if(_!=="none")if(_==="ramp"){let y=Ao(P,k);u[y<-.138?"less":y>.138?"more":"same"]+=i}else u[_]+=i}return u}function lr(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*o,i=r+o,u=n+s[0]*a,d=u+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[d,r],[d,i],[u,i],[u,r]]]},properties:Object.fromEntries(R.flatMap((m,v)=>{let P=s[Ct(v)],k=s[Mt(v)];return[[`k${v}`,Fo(P,k)],[`v${v}`,Ao(P,k)??0]]}))}})}}function Ho(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...en.flatMap(([t,n])=>[t,n])]]}function re(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Bo(e,t){e.addSource(Qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ze,type:"fill",source:Qt,layout:{visibility:"none"},paint:{"fill-color":Ho(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,re(0,.85),13,re(0,.62),16,re(0,.45)]}},t)}async function nn(e,t,n){return Xe=await S(`/api/surface?radius=${t}`),e.getSource(Qt).setData(lr(Xe)),on(e,n),Xe}function on(e,t){let n=R.indexOf(t);e.setPaintProperty(Ze,"fill-color",Ho(n)),e.setPaintProperty(Ze,"fill-opacity",["interpolate",["linear"],["zoom"],9,re(n,.85),13,re(n,.62),16,re(n,.45)])}function Io(e,t){Mo=t,e.setLayoutProperty(Ze,"visibility",t?"visible":"none")}var an=null;function et(){return an}async function sn(e){return an=await S(`/api/population?radius=${e}`),an}function jo(e,t,n,o,a,s,r){let i={lost:0,gained:0,kept:0,none:0};for(let u of e){let d=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;d<o||d>s||m<n||m>a||(i.lost+=u[Yn(t)],i.gained+=u[Vn(t)],i.kept+=u[Kn(t)],i.none+=u[Wn(t)])}return i}var rn="corridor",Uo="corridor-lines",ot="#8b929c",cr="#6f7783",nt={lost:T,added:C,kept:ot};var tt=null,Jo=!1;function at(){return tt}function ln(){return Jo}function ur(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function zo(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function dr(){let e=t=>["match",["get","klass"],"lost",nt.lost,"added",nt.added,t];return["interpolate",["linear"],["zoom"],9,e(cr),14,e(ot)]}function pr(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function mr(){return["match",["get","klass"],"kept",.85,.9]}function Go(e,t){e.addSource(rn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Uo,type:"line",source:rn,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":dr(),"line-width":pr(),"line-opacity":mr()}},t)}async function cn(e,t){return tt=await S(`/api/corridors?day=${t}`),e.getSource(rn).setData(ur(tt)),tt}async function Yo(e,t){R.includes(t)&&await cn(e,t)}function Vo(e,t){Jo=t,e.setLayoutProperty(Uo,"visibility",t?"visible":"none")}var dn="#2b3038",Ko="#b9bec6",Pe={loses:{color:T,size:6},gains:{color:C,size:6},keeps:{color:ot,size:3},here:{color:dn,size:3.5},none:{color:Ko,size:1.8}},rt=["loses","gains","keeps","none","here"],un="oneseat",Wo="oneseat-dots",st=null,qo=!1;function ie(){return st}function pn(){return qo}function Xo(e,t,n,o,a,s){let r={};for(let i of t)r[i]=0;for(let i of e){let u=i[0],d=i[1];if(u<o||u>s||d<n||d>a)continue;let m=t[i[3]];m!==void 0&&r[m]++}return r}function gr(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function yr(){return["match",["get","status"],...Object.entries(Pe).flatMap(([e,t])=>[e,t.color]),Ko]}function fr(){let e=["match",["get","status"],...Object.entries(Pe).flatMap(([t,n])=>[t,n.size]),Pe.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Zo(e,t){e.addSource(un,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Wo,type:"circle",source:un,layout:{visibility:"none"},paint:{"circle-color":yr(),"circle-radius":fr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function hr(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var br="pin";function Qo(e){return"key"in e?e.key:br}var it="any";function vr(e,t,n){return`radius=${e}&${hr(t)}&day=${n}`}function ea(e,t){return e?t:it}function ta(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function mn(e,t,n,o=it){return st=await S(`/api/oneseat?${vr(t,n,o)}`),e.getSource(un).setData(gr(st)),st}function na(e,t){qo=t,e.setLayoutProperty(Wo,"visibility",t?"visible":"none")}function gn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function oa(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",r=gn(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var lt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},yn={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},wr=new Set(["gone","new"]);function Sr(e,t,n){return wr.has(e)?`${t} (${yn[n]})`:t}function Lr(e){return e.buckets.filter(t=>t.key!=="none")}var aa={area:"Ground",people:"People"};function $r(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=No(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function kr(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=jo(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(a.lost)}</b> people lose all service</span>
        <span><b>${s(a.gained)}</b> gain service</span>
        <span><b>${s(a.kept)}</b> keep a bus</span>
        <span><b>${s(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var _r=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function sa(e){let{layer:t,day:n,bounds:o,unit:a,population:s,scoped:r=!1,named:i=!1}=e,u=en.map(([d,m])=>`${m} ${((d+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${u})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service
          (${yn[n]})</span>
        <span><i style="background:${C}"></i>new service
          (${yn[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(aa).map(d=>`
          <button data-surface-unit="${d}" aria-pressed="${a===d}"
                  class="${a===d?"active":""}">${aa[d]}</button>`).join("")}
      </div>
      ${r?_r:a==="people"?kr(n,o,s):$r(t,n,o)}
    </div>`}var xr=["lost","added","kept"],Pr={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Rr={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ia(e,t){let{lostPct:n,addedPct:o}=zo(t.km),a=i=>i.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${Rr[t.day]}
    </div>
    ${xr.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${nt[i]}"></i>
        <span class="lg-lab">${p(Pr[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function la(e,t,n){let o=t.statuses.map(m=>m.key),a=Xo(t.points,o,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(v=>v.key===m)?.label??m,r=rt.reduce((m,v)=>m+(a[v]??0),0),i=gn(t),u=t.day&&t.day!==it,d=u?`Restricted to routes running on ${lt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(i)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${lt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${rt.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${Pe[m].color}"></i>
        <span class="lg-lab">${p(s(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${rt.map(m=>`${(t.counts[m]??0).toLocaleString()} ${p(s(m))}`).join(" \xB7 ")}
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
    <span><i class="sw-both"></i>both, same spot</span>`}var ra={locations:"Locations",riders:"Riders"};function Or(e,t){let o=`${t.toLocaleString()} location${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a stop where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",r=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${r}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Er(e){if(!e)return"";let t=ke(Ve);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Ve}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Dr(e,t){if(!e)return"";let n=ke(Ke);return`
    <button class="lg-row ${n?"off":""}" data-bucket="${Ke}"
            aria-pressed="${!n}">
      <i class="lg-cross"></i>
      <span class="lg-lab">the plan removes this stop</span>
      <span class="lg-n">${t}</span>
    </button>`}function Tr(e,t){let n=t!=null&&t<xe;return`
    <button class="lg-row ${e?"":"off"}" data-planstops
            aria-pressed="${e}">
      <i class="lg-plan"></i>
      <span class="lg-lab">every stop the plan runs</span>
      ${e&&n?'<span class="lg-n muted">zoom in</span>':""}
    </button>`}function Cr(e,t,n){return!e&&!t?"":`
    <div class="lg-marks">
      <div class="lg-marks-head">and what happens to the stop itself</div>
      ${Er(e)}
      ${Dr(t,n)}
    </div>`}function ua(e,t){let{layer:n,day:o,bounds:a,weight:s,surface:r,unit:i="area",population:u,selection:d,dots:m=!0,planStops:v=!1,zoom:P}=t,k=n.buckets.map(w=>w.key),_=n.days.indexOf(o),{west:y,south:Me,east:oe,north:he}=a,xt=Lr(n),A=d&&d.size>0?d:null,Ae=A?go(A):mo(y,Me,oe,he),Fn=wo(n.points,_,k,Ae),Pt=So(n.points,Ae),Rt=Lo(n.points,Ae),D=s==="riders"?$o(n.points,_,k,Ae):null,bs=w=>D?D.measured[w]?Math.round(D.riders[w]).toLocaleString():"\u2014":Fn[w].toLocaleString(),vs=D?D.removedMeasured?Math.round(D.removedRiders).toLocaleString():"\u2014":Rt.toLocaleString(),ws=A?`at ${A.size.toLocaleString()} selected stop${A.size===1?"":"s"}`:"in view",Nn=xt.reduce((w,Ot)=>w+Fn[Ot.key],0)+Pt+Rt,Ss=D?`<b>${Math.round(xt.reduce((w,Ot)=>w+D.riders[Ot.key],0)+D.removedRiders).toLocaleString()}</b> daily boardings ${ws}`:A?`<b>${Nn.toLocaleString()}</b>
         of ${A.size.toLocaleString()} selected stops`:`<b>${Nn.toLocaleString()}</b>
         locations in view`,Ls=!m&&!!r;e.innerHTML=Ls?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${lt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${sa({layer:r,day:o,bounds:a,unit:i,population:u,scoped:!!A,named:!0})}`:`
    <div class="lg-head">
      ${Ss}
      <span class="muted">\xB7 ${lt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(ra).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${ra[w]}</button>`).join("")}
    </div>
    ${xt.map(w=>`
      <button class="lg-row ${ke(w.key)?"off":""}" data-bucket="${p(w.key)}"
              aria-pressed="${!ke(w.key)}">
        <i style="background:${Ge[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(Sr(w.key,w.label,o))}</span>
        <span class="lg-n">${bs(w.key)}</span>
      </button>`).join("")}
    ${Cr(Pt,Rt,vs)}
    ${Tr(v,P)}
    ${r?sa({layer:r,day:o,bounds:a,unit:i,population:u,scoped:!!A}):""}
    ${D?Or(D.unmeasured,Pt):""}
    ${A?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var fn="#4aa3ff",ha="#ffa23a",hn="headline",ct="journey",ba="journey-rides",va="journey-walks",Mr=[ba,va],wa=null,Sa=!1;function dt(){return wa}function bn(){return Sa}function Ar(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let r of s.legs){let i=r.from??e.origin,u=r.to??e.destination,d=[[i.lon,i.lat],[u.lon,u.lat]],m=r.path?.length?r.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:o}}function da(){return["match",["get","side"],"current",fn,"proposed",ha,fn]}function pa(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function La(e,t){e.addSource(ct,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ba,type:"line",source:ct,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":da(),"line-width":pa(1),"line-opacity":.85}},t),e.addLayer({id:va,type:"line",source:ct,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":da(),"line-width":pa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function $a(e,t){Sa=t;for(let n of Mr)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function vn(e,t){wa=t;let n=t?Ar(t,hn):{type:"FeatureCollection",features:[]};e.getSource(ct).setData(n)}function ka(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var ma=e=>`${e.toFixed(1)} min`;function _a(e){return e==null?"\u2014":e===0?"no change":e>0?`${ma(e)} slower`:`${ma(-e)} faster`}function ga(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function Fr(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=ga(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ga(e.to,"the destination")}</span></div>`}function ya(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Fr(a,t)),o=a}return n.join("")}var Nr={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function ut(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Hr(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Br(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${ut(t.current)} \u2192
        ${ut(t.proposed)} min</span>
        <span class="muted">${_a(t.change_min)}</span></div>
      ${o}
    </div>`}function fa(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function wn(e,t){let n=e.radii[hn],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${p(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${ae(e.window.start_min)}
        and ${ae(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Nr[n.classification]??""}</p>
      </div>
      ${fa(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${ut(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${ut(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${_a(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Hr(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ya(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ya(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Br(e)}
    ${fa(e)}`}function xa(e){return`
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
    </div>`}function Pa(e){let t=e?e.radii[hn].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${fn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ha}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var gt="places",Ea="places-points",Sn="places-boundaries",N="places-fill",ce="lost",Ir=100,jr={lost:"share_lost",gained:"share_gained"};function K(e,t){return`service_${e}_${t}`}var Da={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Ur="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Q={lost:T,gained:C},pt=null,V=null,le=null,Ta=!1,mt=null;function Ln(){return pt}function Ca(){return V}function Ma(){return mt}function $n(){return le}function Re(){return Ta}function Jr(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function zr(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Gr(e){return Math.max(e.residents_lost,e.residents_gained)}var Ra=4,Yr=16,Vr=1e3;function Kr(e){let t=Math.min(1,Math.sqrt(e/Vr));return Ra+t*(Yr-Ra)}function Wr(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:zr(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Kr(Gr(t))}}))}}function qr(){return["match",["get","klass"],"lost",Q.lost,"gained",Q.gained,Q.lost]}function Xr(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var j=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var U=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Aa(e,t){return e==="service"?["step",["abs",["coalesce",["get",K(t,"pct")],0]],U[0].opacity,U[0].max,U[1].opacity,U[1].max,U[2].opacity,U[2].max,U[3].opacity]:["step",["coalesce",["get",jr[e]],0],j[0].opacity,Number.EPSILON,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity,j[3].max,j[4].opacity]}function Fa(e,t){return e==="service"?["case",[">=",["coalesce",["get",K(t,"pct")],0],0],C,T]:Q[e]}function Zr(e,t){let n=K(t,"now"),o=K(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var Qr=3;function ei(e){if(e.length===0)return"";let t=e.slice(0,Qr),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function Na(e,t){e.addSource(Sn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:N,type:"fill",source:Sn,layout:{visibility:"none"},paint:{"fill-color":Fa(ce),"fill-opacity":Aa(ce),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(gt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ea,type:"circle",source:gt,layout:{visibility:"none"},paint:{"circle-color":qr(),"circle-radius":Xr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function yt(e,t,n){e.setPaintProperty(N,"fill-color",Fa(t,n)),e.setPaintProperty(N,"fill-opacity",Aa(t,n))}async function Ha(){return pt||(pt=await S("/api/places")),pt}async function Ba(e){return le||(le=await S("/api/boundaries"),e.getSource(Sn).setData(le)),le}function ti(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Ia(e,t){let n=ti(le,t);if(n)return V=null,mt=n,e.getSource(gt)?.setData({type:"FeatureCollection",features:[]}),null;try{V=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return V=null,mt=null,null}return mt=null,e.getSource(gt).setData(Wr(V)),e.flyTo({center:[V.lon,V.lat],zoom:13}),V}function ja(e,t){Ta=t,e.setLayoutProperty(Ea,"visibility",t?"visible":"none"),e.setLayoutProperty(N,"visibility",t?"visible":"none")}function ni(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${p(e.key)}">
      <span class="place-name">${p(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var oi="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ua(e,t,n,o){let a=Jr(e,t).map(s=>ni(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Ur}</p>
    ${o==="service"?`<p class="note">${oi}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Ja(e,t){return e?`<div class="lg-head"><b>${p(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${p(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function ai(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function si(e,t,n,o){let a=U.map((u,d)=>({band:u,prevMax:d===0?0:U[d-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:d})=>{let m=ai(u,d);return[`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} more trips</span></div>`]}).join(""),s=o?Zr(o,n):[],r=ei(s),i=r?`<div class="lg-foot">${p(r)}</div>`:"";return`
    ${Ja(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${p(Da[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function za({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return si(e,a??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",r=j.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${Q[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${p(i.label)} of the place's own residents ${p(s)}</span>
    </div>`).join("");return`
    ${Ja(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${p(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Q.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Q.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function ri(e,t){let n=e[K(t,"now")],o=e[K(t,"proposed")],a=e[K(t,"pct")],s=e[K(t,"rail_proposed")],r=Da[t];if(o===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${r} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${r} (${i}).`}function Ga(e,t,n){if(t==="service")return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      ${ri(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=Oa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Oa("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[a,s]:[s,a]).filter(i=>i!==null);return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Oa(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Ir} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var kn=" \xB7 ",_n={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Ya=Object.keys(_n);function Va(e){return _n[e]??e}var ii={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},li=["oneseat","journey"];function ci(e){return e!=="journey"}function ui(e){let t=[_n[e.view]??e.view];return e.view==="places"?t[0]:(li.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":ii[e.day]),ci(e.view)&&t.push(`${e.radius} m walk`),t.join(kn))}function Ka(e){let[t,...n]=ui(e).split(kn);return`<b>${p(t)}</b>${n.map(o=>kn+p(o)).join("")}`}var f={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",planStops:"plan"},di=/^[cp]:[\w.:-]{1,32}$/,ft={any:"any",selected:"selected"},pi="pin",Wa=5;function Xa(e){try{return e.self!==e.top}catch{return!0}}function Za(e){let t=new URLSearchParams;return t.set(f.view,e.view),t.set(f.day,e.day),t.set(f.radius,String(e.radius)),t.set(f.oneSeatDay,e.oneSeatRestricted?ft.selected:ft.any),t.set(f.dest,"key"in e.dest?e.dest.key:xn(e.dest)),e.weight==="riders"&&t.set(f.weight,e.weight),e.surfaceUnit==="people"&&t.set(f.surfaceUnit,e.surfaceUnit),e.at&&t.set(f.at,xn(e.at)),e.camera&&t.set(f.camera,`${xn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(f.place,e.place),e.placeFill!==ce&&t.set(f.placeFill,e.placeFill),e.selection.length&&t.set(f.selection,e.selection.join(",")),t.set(f.planStops,e.planStops?"1":"0"),`?${t}`}function Qa(e){let t=new URLSearchParams(e),n={},o=t.get(f.view);o&&Ya.includes(o)&&(n.view=o);let a=t.get(f.day);a&&R.includes(a)&&(n.day=a);let s=Number(t.get(f.radius));t.has(f.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(f.weight)==="riders"?n.weight="riders":t.get(f.weight)==="locations"&&(n.weight="locations"),t.get(f.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(f.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(f.oneSeatDay);r===ft.selected?n.oneSeatRestricted=!0:r===ft.any&&(n.oneSeatRestricted=!1);let i=t.get(f.dest);if(i&&i!==pi){let _=qa(i);_?n.dest=_:i.includes(",")||(n.dest={key:i})}let u=qa(t.get(f.at));u&&(n.at=u);let d=mi(t.get(f.camera));d&&(n.camera=d);let m=t.get(f.place);m&&(n.place=m);let v=t.get(f.selection);v!==null&&(n.selection=v.split(",").filter(_=>di.test(_)));let P=t.get(f.planStops);P==="1"?n.planStops=!0:P==="0"&&(n.planStops=!1);let k=t.get(f.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function xn(e){return`${e.lat.toFixed(Wa)},${e.lon.toFixed(Wa)}`}function qa(e){let t=es(e,2);return t?{lat:t[0],lon:t[1]}:null}function mi(e){let t=es(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function es(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Pn="embed";var gi=["1","true","yes"];function ts(e){let t=new URLSearchParams(e).get(Pn);return t!==null&&gi.includes(t.toLowerCase())}function ns(e){let t=new URLSearchParams(e);return t.set(Pn,"1"),`?${t}`}function os(e){let t=new URLSearchParams(e);t.delete(Pn);let n=String(t);return n?`?${n}`:""}function as(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var W=["peek","half","full"],yi=192,fi=.3,hi=.55,bi=.9,vi=.6,wi=.45;function ht(e,t){return e==="peek"?Math.min(yi,t*fi):e==="half"?t*hi:t*bi}function Si(e,t,n=0){let o=W.map(s=>Math.abs(ht(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>vi&&(a=Math.max(0,Math.min(W.length-1,a+(n>0?1:-1)))),W[a]}function ss(e){return W[(W.indexOf(e)+1)%W.length]}function Li(e,t){return Math.min(e,t*wi)}function ue(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Rn(e){let t=null,n=()=>{let o=ue();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var $i=8,ki=400;function rs(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,s=0,r=0,i=0,u={y:0,t:0};function d(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,Li(y,d()))}function v(y){o=y,t.dataset.snap=y,m(ht(y,d()))}n.addEventListener("pointerdown",y=>{ue()&&(a=!0,s=y.clientY,r=t.getBoundingClientRect().height,i=y.timeStamp,u={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!a)return;let Me=r+(s-y.clientY),oe=ht("peek",d()),he=ht("full",d());m(Math.max(oe,Math.min(he,Me))),u={y:y.clientY,t:y.timeStamp}});function P(y){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-s)>$i)&&y.timeStamp-i<ki){v(ss(o));return}let oe=y.timeStamp-u.t,he=oe>0?(u.y-y.clientY)/oe:0;v(Si(t.getBoundingClientRect().height,d(),he))}n.addEventListener("pointerup",P),n.addEventListener("pointercancel",P),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),ue()&&v(ss(o)))});let k=Rn(e.onLayoutChange);function _(){if(k(),!ue()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}v(o)}return window.addEventListener("resize",_),_(),{at:()=>ue()?o:"full",atLeast(y){ue()&&W.indexOf(y)>W.indexOf(o)&&v(y)}}}var _i=[-79.9959,40.4406],xi=12,Pi="#e2574c",E={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},Ee=Qa(location.search),Te=ts(location.search);Te&&c("app").classList.add("embed");var Ri={at:()=>"full",atLeast(){}},cs=null,x=400,Oe=null,b=null,pe=null,ne=0,$={key:"downtown"},ee=null,us=!1,ye=!1,$t="locations",fe="area",q=!0,ds="count",Lt=null,H=ce,I=!1,g="dots",ps,Dn=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Ee.camera?[Ee.camera.lon,Ee.camera.lat]:_i,zoom:Ee.camera?.zoom??xi,cooperativeGestures:Xa(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{In(l),Po(l),Bo(l,We),Go(l,We),Zo(l,"walk-fill"),La(l),Na(l,We),Do(l,"walk-fill"),B(),l.on("click",t=>{if(I)return;if(us){De({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=l.queryRenderedFeatures(t.point,{layers:[N]})[0];s&&vt(s.properties.key);return}let n=[...Jt,"oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];An(a[1],a[0])}),l.on("mouseenter",N,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",N,()=>{l.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});for(let t of Jt)l.on("mouseenter",t,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",t,()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove",t,n=>{let o=n.features?.[0],a=zt();!o||!a||e.setLngLat(o.geometry.coordinates).setHTML(Eo(o.properties,L(),a.buckets)).addTo(l)});l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=ie();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(oa(n.properties,o)).addTo(l)}),l.on("mouseleave",N,()=>e.remove()),l.on("mousemove",N,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(Ga(n.properties,H,L())).addTo(l)}),zi(),l.on("moveend",()=>{let t=l.getCenter();cs={lat:t.lat,lon:t.lng,zoom:l.getZoom()},h(),M()}),de(E.radius,t=>{x=Number(t.dataset.radius),Kt(l,x,L()).then(h),Qe()&&nn(l,x,L()).then(h),et()&&sn(x).then(h),ie()&&wt(),b&&me(b.lat,b.lon)}),de(E.day,t=>{let n=t.dataset.day;to(n),g!=="journey"&&B(),Wt(l,n),on(l,n),g==="journey"&&b&&Tn(b.lat,b.lon),at()&&Yo(l,n).then(h),ye&&ie()&&(wt(),b&&me(b.lat,b.lon)),Re()&&H==="service"&&yt(l,H,n),h()}),de(E.oneSeatDay,t=>{ye=t.dataset.oneseatDay==="selected",En(),wt(),b&&me(b.lat,b.lon)}),de(E.view,t=>{let n=g;g=t.dataset.view,e.remove(),po(l,g==="dots"||g==="both"),qe(l,q&&J()),Mi(g==="surface"||g==="both"),Fi(g==="corridors"),Ii(g==="oneseat"),Bi(g==="journey",n==="journey"),Ni(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&B({scrollToTop:!0}),Hi(g!=="corridors"&&g!=="journey"&&g!=="places");let o=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),J()||is(!1),ge(),En(),o||St(!1),gs()}),de(E.dest,t=>{let n=t.dataset.dest;if(n==="pin"){St(!0);return}St(!1),De({key:n})}),de(E.placeFill,t=>{H=t.dataset.placeFill,Re()&&yt(l,H,L()),B(),h(),En()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){$t=n.dataset.weight,h(),M();return}let o=t.target.closest("[data-surface-unit]");if(o){fe=o.dataset.surfaceUnit,Ai(fe),M();return}if(t.target.closest("[data-planstops]")){q=!q,qe(l,q&&J()),h(),M();return}let s=t.target.closest("[data-bucket]");s&&(Ro(l,s.dataset.bucket,L()),h())}),c("legend-reset").addEventListener("click",()=>{Oo(l,L()),h()}),c("legend-select").addEventListener("click",()=>is(!I)),c("legend-clear").addEventListener("click",()=>{Yt(l),ge(),h(),M()}),c("legend-collapse").addEventListener("click",()=>{On(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&De({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Vi(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&vt(a.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(ds=s.dataset.sortPlaces,B());let r=t.target.closest("[data-goto-place]");r&&(g!=="places"&&te(E.view,"places"),vt(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Ti),Te&&Rn(On),ps=Te?Ri:rs({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:On}),Ei(),_t(),ge(),kt(),Oi(Ee)||Kt(l,x,L()).then(h),qe(l,q&&J()).then(h),Yi(),Gi()});function de(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),_t(),M()})})}function te(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Oi(e){let t=!1;return e.radius!==void 0&&(t=te(E.radius,String(e.radius))||t),e.day&&(t=te(E.day,e.day)||t),e.oneSeatRestricted!==void 0&&te(E.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&($t=e.weight),e.surfaceUnit&&(fe=e.surfaceUnit),e.placeFill&&te(E.placeFill,e.placeFill),e.dest&&("key"in e.dest?te(E.dest,e.dest.key):De(e.dest)),e.selection&&vo(l,e.selection),e.planStops!==void 0&&(q=e.planStops),e.view&&te(E.view,e.view),e.at&&An(e.at.lat,e.at.lon),e.place&&vt(e.place),t}function M(){let e={view:g,day:L(),radius:x,oneSeatRestricted:ye,weight:$t,surfaceUnit:fe,dest:$,at:b,camera:cs,place:Lt,placeFill:H,selection:fo(),planStops:q},t=Za(e);history.replaceState(null,"",(Te?ns(t):t)+location.hash),kt(t)}function kt(e=os(location.search)){if(!Te)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=b?pe?Se(pe):"this point":null;t.querySelector(".el-action").textContent=as(n)}function _t(){c("statebar").innerHTML=Ka({view:g,day:L(),radius:x,oneSeatRestricted:ye,destination:Ce()}),Di()}function On(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Ei(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Di(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Va(g)))}function Ti(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function h(){Ci()}function Ci(){if(c("legend-reset").classList.toggle("hidden",ln()||pn()||bn()||Re()||!J()),bn()){c("legend").innerHTML=Pa(dt());return}if(Re()){c("legend").innerHTML=za({selected:Ca(),fill:H,day:L(),boundaries:$n(),unchanged:Ma()});return}if(ln()){let n=at();n&&ia(c("legend"),n);return}if(pn()){let n=ie();if(!n)return;let o=l.getBounds();la(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=zt();if(!e)return;let t=l.getBounds();ua(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:$t,dots:J(),planStops:q,zoom:l.getZoom(),surface:tn()?Qe():null,unit:fe,population:et(),selection:yo()})}async function Mi(e){if(e&&!Qe()){c("legend").classList.add("loading");try{await nn(l,x,L())}finally{c("legend").classList.remove("loading")}}Io(l,e),e&&fe==="people"&&await ms(),h()}async function ms(){if(!et()){c("legend").classList.add("loading");try{await sn(x)}finally{c("legend").classList.remove("loading")}}}async function Ai(e){e==="people"&&tn()&&await ms(),h()}async function Fi(e){if(e&&!at()){c("legend").classList.add("loading");try{await cn(l,L())}finally{c("legend").classList.remove("loading")}}Vo(l,e),h()}async function Ni(e){if(e&&(!Ln()||!$n())){c("legend").classList.add("loading");try{await Promise.all([Ha(),Ba(l)])}finally{c("legend").classList.remove("loading")}}ja(l,e),e&&yt(l,H,L()),e&&B(),h()}async function vt(e){Lt=await Mn(()=>Ia(l,e))?e:null,g==="places"&&(B(),Lt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),h(),M()}function Hi(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function B({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),kt(),g==="places"){c("panel").innerHTML=Ua(Ln()??[],ds,Lt,H);return}if(!pe){g==="oneseat"?c("panel").innerHTML=io(Ce()):no(c("panel"));return}if(g==="oneseat"){let t=ro(pe,$,L());if(t){c("panel").innerHTML=t;return}}so(pe)}function Bi(e,t=!1){if($a(l,e),h(),!e){t&&(b?me(b.lat,b.lon):B());return}dt()&&b?c("panel").innerHTML=wn(dt(),Ce()):c("panel").innerHTML=xa(Ce())}async function Tn(e,t){let n=++ne;b={lat:e,lon:t},M(),fs(e,t);let o=ys(),a=p(Ce());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(ka({lat:e,lon:t},o,L()));if(n!==ne)return;vn(l,s),c("panel").innerHTML=wn(s,a),h(),kt()}catch(s){if(n!==ne)return;vn(l,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function En(){c("day-controls").classList.toggle("hidden",!ta(g,ye,H))}function Cn(){return ea(ye,L())}async function Ii(e){e&&!ie()&&await Mn(()=>mn(l,x,$,Cn())),na(l,e),h()}async function wt(){await Mn(()=>mn(l,x,$,Cn())),h()}async function Mn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function De(e){if($=e,St(!1),ji(),gs(),_t(),M(),g==="journey"){b&&Tn(b.lat,b.lon),h();return}b?me(b.lat,b.lon):B({scrollToTop:!0}),wt()}function gs(){let e=ys();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in $))){ee?.remove(),ee=null;return}ee?ee.setLngLat([e.lon,e.lat]).addTo(l):(ee=new maplibregl.Marker({color:dn,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),ee.on("dragend",()=>{let n=ee.getLngLat();De({lat:n.lat,lon:n.lng})}))}function ji(){let e=Qo($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function ys(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=Dn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Ce(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return Dn.find(t=>t.key===e)?.name??e}function St(e){us=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function me(e,t){let n=++ne;b={lat:e,lon:t},M(),c("panel").classList.add("loading"),fs(e,t);try{let o="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",a=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${x}${o}&oneseat_day=${Cn()}`);if(n!==ne)return;jn(l,e,t,x,a.current.stops,a.proposed.stops),Ui(),pe=a,B({scrollToTop:!0})}catch(o){if(n!==ne)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===ne&&c("panel").classList.remove("loading")}}function Ui(){c("pin-key").innerHTML=ca(x),c("pin-key").classList.remove("hidden")}function fs(e,t){Oe?Oe.setLngLat([t,e]):(Oe=new maplibregl.Marker({color:Pi,draggable:!0}).setLngLat([t,e]).addTo(l),Oe.on("dragend",()=>{let n=Oe.getLngLat();An(n.lat,n.lng)}))}var bt=14;function J(){return g==="dots"||g==="both"}function is(e){I=e&&J(),I?l.dragPan.disable():l.dragPan.enable(),l.getCanvas().style.cursor=I?"none":"",I||hs(),ge()}function ge(){let e=c("legend-select");e.classList.toggle("hidden",!J()),e.setAttribute("aria-pressed",String(I)),e.textContent=I?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!J()||!ho())}function Ji(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!I}function ls(e){c("brush").classList.toggle("painting",e)}function hs(){c("brush").hidden=!0}function zi(){let e=c("brush");e.style.width=`${bt*2}px`,e.style.height=`${bt*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,ge(),h()}))},s=()=>{I&&(t=!0,n=!1,ls(!0))},r=u=>{if(Ji(u.point.x,u.point.y),!t)return;n=!0,Gt(l,Vt(l,u.point.x,u.point.y,bt))&&a()},i=u=>{if(ls(!1),!!t){if(t=!1,!n){let[d]=Vt(l,u.point.x,u.point.y,bt);d&&bo(l,d)}ge(),h(),M()}};l.on("mousedown",s),l.on("mousemove",r),l.on("mouseup",i),l.getCanvas().addEventListener("mouseleave",hs),l.on("touchstart",s),l.on("touchmove",r),l.on("touchend",i)}function An(e,t){if(ps.atLeast("half"),g==="journey"){Tn(e,t);return}g!=="places"&&me(e,t)}async function Gi(){try{Dn=await S("/api/destinations"),_t()}catch{}}async function Yi(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Vi(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
