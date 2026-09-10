"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function x(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}var kt=new Map;function ne(e){let t=kt.get(e);if(t)return t;let n=x(e).catch(o=>{throw kt.delete(e),o});return kt.set(e,n),n}function p(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function oe(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function _t(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function xt(e){return e>0?`+${e}`:String(e)}function En(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var hs="#15181e",Tn="#ffa23a",fs="#ffffff";function bs(e,t,n,o=96){let a=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let i=0;i<=o;i++){let u=i/o*2*Math.PI;a.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function G(e){return{type:"FeatureCollection",features:e}}function vs(e){return e.filter(t=>t.moved_m!=null).map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:[[t.moved_lon,t.moved_lat],[t.lon,t.lat]]},properties:{stop_id:t.stop_id,moved_m:t.moved_m}}))}function ws(e){let t=e.side==="current"?"today":"proposed",n=e.moved_m!=null?`<br>moved ${e.moved_m} m from where it stands today`:"";return`<b>${e.name}</b><br>${t} \xB7 stop ${e.stop_id}${n}`}function Cn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Mn(e){e.addSource("walk",{type:"geojson",data:G([])}),e.addSource("stops-now",{type:"geojson",data:G([])}),e.addSource("stops-prop",{type:"geojson",data:G([])}),e.addSource("stop-moves",{type:"geojson",data:G([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stop-moves-l",type:"line",source:"stop-moves",paint:{"line-color":Tn,"line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":fs,"circle-stroke-width":3,"circle-stroke-color":Tn}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":hs,"circle-stroke-width":1,"circle-stroke-color":"rgba(255,255,255,.9)"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(ws(s)).addTo(e)})}function An(e,t,n,o,a,s){e.getSource("walk").setData(G([bs(t,n,o)])),e.getSource("stops-now").setData(G(Cn(a,"current"))),e.getSource("stops-prop").setData(G(Cn(s,"proposed"))),e.getSource("stop-moves").setData(G(vs(s)))}var R=["weekday","saturday","sunday"],Pt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Fn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Ce=4,Me=5,Nn=e=>Me+Ce*e,Hn=e=>Me+1+Ce*e,fe=e=>Me+2+Ce*e,Ss=e=>Me+3+Ce*e,Ae=2,Ls=3,be=4,ve=e=>e[Ls],O=(e,t)=>e[t],Bn=(e,t)=>e[Ss(t)],Rt=e=>2+2*e,Ot=e=>3+2*e,Fe=4,In=e=>2+Fe*e,jn=e=>3+Fe*e,Un=e=>4+Fe*e,Jn=e=>5+Fe*e;var Et="weekday";function S(){return Et}function Wn(e){Et=e}function qn(e){e.innerHTML=`
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
    </div>`}function $s(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function ks(e,t){let n=Math.max(1,...Pt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Pt.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,r=s-a,i=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${Fn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${i}">${r===0?"\xB7":xt(r)}</td>
      </tr>`}).join("")}function Xn(e){return e.length?e.map(t=>`<span class="route">${p(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Gn(e){return e.first==null?'<span class="muted">no service</span>':`${oe(e.first)}\u2013${oe(e.last)}`}function Yn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var _s={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},xs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ps(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Be(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${p(o.name)}</span>
          <span class="os-status ${p(o.status)}">${_s[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${xs[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${He("one-seat")}</p>
    </div>`:""}function He(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Ne(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function zn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Vn(e){return e.first==null||e.last==null?null:e.last-e.first}function Be(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Kn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Kn(t,n,"prop")}</div>
    </div>`}function Kn(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${p(o)}</span>`).join(" "):'<span class="muted">none</span>'}var Dt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Rs="Allegheny";function we(e){let t=e.place?.muni?.trim()??"",n=Dt.exec(t)?.[1],o=n===Rs?t.replace(Dt,""):n?`${t.replace(Dt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Tt(e){return e==="weekday"?"weekday":e}function Qn(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Tt(t)}`}function Os(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds</dt>
    <dd>${t} of ${e.length}</dd>`:""}function Ds(e){let t=e.filter(i=>i.removed);if(!t.length)return"";let n=t.map(i=>i.replacement_walk_m).filter(i=>i!=null),o=t.length-n.length,a=n.length?n.length===1||Math.min(...n)===Math.max(...n)?`nearest stop a ${Math.round(n[0]).toLocaleString()} m walk`:`nearest stop a ${Math.round(Math.min(...n)).toLocaleString()}\u2013${Math.round(Math.max(...n)).toLocaleString()} m walk`:"",s=o?`${n.length?`${o} with `:""}no other stop within an 800 m walk`:"",r=[a,s].filter(Boolean).join("; ");return`<dt>Stops the plan removes</dt>
    <dd>${t.length} of ${e.length}<div class="muted">${r}</div></dd>`}function Es(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Tt(t)}, today only</span>`}${o}</dd>`}function Ts(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${He("boardings")}</p>`}function Cs(e){if(!e)return"";let t=p(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
    </div>`}function Ct(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,r=s>0?"up":s<0?"down":"flat",i=Yn(o),u=Yn(a),d=Vn(o),m=Vn(a);return`
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
        ${s===0?"no change":`${xt(s)} trips`}
        <div class="muted">${En(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Tt(t)}, both directions</div>

    <div class="tiers">${$s(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${ks(o,a)}</tbody>
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
      ${Ne(Gn(o),Gn(a))}
      <dt>Hours between</dt>
      ${Ne(_t(d),_t(m),zn(d,m,"more"))}
      <dt>Typical wait</dt>
      ${Ne(i==null?"\u2014":`${i} min`,u==null?"\u2014":`${u} min`,zn(i,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Ne(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Ds(e.current.stops)}
      ${Os(e.proposed.stops)}
      ${Es(o.boardings,t)}
    </dl>
    ${Ts(o.boardings)}

    ${n}

    ${Cs(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Be(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${He("location-not-route")}</p>
    </div>`}function Zn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${p(we(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ct(e,Et,Ps(e.oneseat??[],e.oneseat_day??"any"))}`}var Ms={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},As={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Fs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ns(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Mt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Xn(t)}</div>`:""}function Hs(e){let t=Mt("kept",e.kept)+Mt("lost",e.lost)+Mt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Bs(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Be(e.current,e.proposed)}
    </div>`}function Is(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${p(a.key)}">
      <span class="os-name">${p(a.name)}</span>
      <span class="os-status ${p(a.status)}">${js[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var js={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Us(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Fs[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function eo(e,t,n){let o=Ns(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":Hs(o)+Bs(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${p(o.name)}</h2>
      <div class="muted">
        from ${p(we(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${p(o.status)}">${Ms[o.status]}</div>
    <p class="note">${As[o.status]} ${Us(a)}</p>

    ${s}

    ${Is(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Qn(e,n)}</summary>
      ${Ct(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function to(e){return`
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
    </div>`}var je={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ae="change",z="change-dots",q=["boolean",["feature-state","selected"],!1],no="#15181e",X=["==",["get","published"],0],Je="newplace",Js="#15181e",Gs=5,Ue=["==",["get","removed"],1],Ge="removedstop",Le="change-removed",Nt="change-removed-selected",At="removed-cross",ao="#e8232f";function Ys(e=2){let t=16*e,n=document.createElement("canvas");n.width=t,n.height=t;let o=n.getContext("2d"),a=t*.2;o.lineCap="round";for(let[s,r]of[[t*.26,"rgba(255,255,255,.95)"],[t*.14,ao]])o.lineWidth=s,o.strokeStyle=r,o.beginPath(),o.moveTo(a,a),o.lineTo(t-a,t-a),o.moveTo(t-a,a),o.lineTo(a,t-a),o.stroke();return o.getImageData(0,0,t,t)}var Ie=null,Y=new Set,M=new Set,zs=[z,Nt,Le],Ht=[z,Le],Ye=z;function so(e,t){for(let n of zs)e.getLayer(n)&&e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Bt(){return Ie}function $e(e){return Y.has(e)}function ro(e,t,n,o){return a=>Ws(a,e,t,n,o)}function io(e){return t=>e.has(ve(t))}function lo(){return M}function co(){return[...M].sort()}function uo(){return M.size}function It(e,t){let n=0;for(let o of t)M.has(o)||(M.add(o),Se(e,o,!0),n++);return n}function po(e,t){M.delete(t)?Se(e,t,!1):(M.add(t),Se(e,t,!0))}function mo(e,t){jt(e),It(e,t)}function jt(e){for(let t of M)Se(e,t,!1);M.clear()}function Se(e,t,n){try{e.setFeatureState({source:ae,id:t},{selected:n})}catch{}}function Vs(e){for(let t of M)Se(e,t,!0)}function Ks(e,t,n,o){let a=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=a).map(s=>s.id)}function Ut(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],s=[z,Le].filter(i=>e.getLayer(i)),r=e.queryRenderedFeatures(a,{layers:s}).filter(i=>i.id!==void 0).map(i=>{let[u,d]=i.geometry.coordinates,m=e.project([u,d]);return{id:i.id,x:m.x,y:m.y}});return Ks(t,n,o,r)}function go(e,t,n,o){let a={};for(let s of n)a[s]=0;for(let s of e){if(!o(s)||O(s,Ae)===0||O(s,be)===1)continue;let r=n[O(s,fe(t))];r!==void 0&&a[r]++}return a}function yo(e,t){let n=0;for(let o of e)t(o)&&O(o,Ae)===0&&n++;return n}function ho(e,t){let n=0;for(let o of e)t(o)&&O(o,be)===1&&n++;return n}function Ws(e,t,n,o,a){let s=O(e,0),r=O(e,1);return s>=n&&s<=a&&r>=t&&r<=o}function fo(e,t,n,o){let a={riders:{},measured:{},unmeasured:0,removedRiders:0,removedMeasured:0};for(let s of n)a.riders[s]=0,a.measured[s]=0;for(let s of e){if(!o(s)||O(s,Ae)===0)continue;let r=n[O(s,fe(t))];if(r===void 0)continue;let i=Bn(s,t),u=O(s,be)===1;if(i===null){r!=="none"&&a.unmeasured++;continue}if(u){a.removedRiders+=i,a.removedMeasured++;continue}a.riders[r]+=i,a.measured[r]++}return a}function qs(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>R.some((o,a)=>t[O(n,fe(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ve(n),published:n[2],removed:n[be],replacement:e.replacement?.[ve(n)]?.[0]??null,nearestStraight:e.replacement?.[ve(n)]?.[1]??null,...Object.fromEntries(R.flatMap((o,a)=>[[`b${a}`,t[O(n,fe(a))]],[`c${a}`,n[Nn(a)]],[`p${a}`,n[Hn(a)]]]))}}))}}function bo(e,t){let n=Object.entries(je).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,je.none[t]]}function vo(e){return["case",X,"rgba(0,0,0,0)",bo(e,"color")]}function Ft(e){return["case",X,Gs,bo(e,"size")]}function wo(e){return["interpolate",["linear"],["zoom"],9,["*",Ft(e),.45],12,Ft(e),16,["*",Ft(e),1.9]]}function So(e){e.addSource(ae,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:z,type:"circle",source:ae,paint:{"circle-color":vo(0),"circle-radius":wo(0),"circle-opacity":.85,"circle-stroke-color":["case",q,no,X,Js,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",q,1.6,X,.9,.5],12,["case",q,2.4,X,1.5,1],16,["case",q,3.2,X,2.2,1.6]]}},"walk-fill"),e.addLayer({id:Nt,type:"circle",source:ae,filter:Ue,paint:{"circle-color":"rgba(0,0,0,0)","circle-stroke-color":no,"circle-radius":["interpolate",["linear"],["zoom"],9,3.5,12,6,16,10],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",q,1.6,0],12,["case",q,2.4,0],16,["case",q,3.2,0]]}},"walk-fill"),e.hasImage(At)||e.addImage(At,Ys(),{pixelRatio:2}),e.addLayer({id:Le,type:"symbol",source:ae,filter:Ue,layout:{"icon-image":At,"icon-size":["interpolate",["linear"],["zoom"],9,.34,12,.55,16,1],"icon-allow-overlap":!0,"icon-ignore-placement":!0}},"walk-fill")}async function Jt(e,t,n){return Ie=await ne(`/api/change?radius=${t}`),e.getSource(ae).setData(qs(Ie)),Vs(e),Gt(e,n),Ie}function Gt(e,t){let n=R.indexOf(t);e.setPaintProperty(z,"circle-color",vo(n)),e.setPaintProperty(z,"circle-radius",wo(n)),Yt(e,t)}function Lo(e,t,n){Y.has(t)?Y.delete(t):Y.add(t),Yt(e,n)}function $o(e,t){Y.clear(),Yt(e,t)}function Yt(e,t){let n=R.indexOf(t),o=["none",...Y],a=["case",X,!Y.has(Je),["!",["in",["get",`b${n}`],["literal",o]]]];e.setFilter(z,["all",["!",Ue],a]);let s=["all",Ue,!Y.has(Ge)];e.setFilter(Le,s),e.setFilter(Nt,s)}function ko(e,t,n){let o=R.indexOf(t),a=e[`b${o}`],s=e.removed===1,r=e.published===0?"the plan adds a stop here":n.find(b=>b.key===a)?.label??a,i=e[`c${o}`],u=e[`p${o}`],d=t==="weekday"?"weekday":t,m=e.published===0||s?" within a walk":"";return`${s?"":`<b>${r}</b><br>`}${Qs(e)}${i} \u2192 ${u} buses per ${d}${m}<br><span style="opacity:.6">click for the full comparison</span>`}var Xs=1.5,oo=800;function Qs(e){if(e.removed!==1)return"";let t=e.replacement,n=e.nearestStraight,o=t??oo,a=n!=null&&o>n*Xs?`; the nearest in a straight line is ${Math.round(n).toLocaleString()} m`:"",s=t==null?`no other stop within a ${oo} m walk${a}`:`nearest stop is a ${Math.round(t).toLocaleString()} m walk${a}`;return`<b style="color:${ao}">Stop removed</b> \u2014 ${s}<br>`}var zt="surface",Ve="surface-fill",_o="#6b7280",Vt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,_o],[.138,_o],[1,"#bd60e7"],[2,"#961bed"]],T="#e8232f",C="#0f79c9",xo=2,ze=null,Po=!1;function Ke(){return ze}function Kt(){return Po}function Ro(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-xo,Math.min(xo,n))}function Oo(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Do(e,t,n,o,a,s,r,i){let u={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let m=r.lat0+(d[1]+.5)*r.dlat,b=r.lon0+(d[0]+.5)*r.dlon;if(m<o||m>s||b<n||b>a)continue;let $=d[Rt(t)],k=d[Ot(t)],U=Oo($,k);if(U!=="none")if(U==="ramp"){let y=Ro($,k);u[y<-.138?"less":y>.138?"more":"same"]+=i}else u[U]+=i}return u}function Zs(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*o,i=r+o,u=n+s[0]*a,d=u+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[d,r],[d,i],[u,i],[u,r]]]},properties:Object.fromEntries(R.flatMap((m,b)=>{let $=s[Rt(b)],k=s[Ot(b)];return[[`k${b}`,Oo($,k)],[`v${b}`,Ro($,k)??0]]}))}})}}function Eo(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...Vt.flatMap(([t,n])=>[t,n])]]}function se(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function To(e,t){e.addSource(zt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ve,type:"fill",source:zt,layout:{visibility:"none"},paint:{"fill-color":Eo(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,se(0,.85),13,se(0,.62),16,se(0,.45)]}},t)}async function Wt(e,t,n){return ze=await ne(`/api/surface?radius=${t}`),e.getSource(zt).setData(Zs(ze)),qt(e,n),ze}function qt(e,t){let n=R.indexOf(t);e.setPaintProperty(Ve,"fill-color",Eo(n)),e.setPaintProperty(Ve,"fill-opacity",["interpolate",["linear"],["zoom"],9,se(n,.85),13,se(n,.62),16,se(n,.45)])}function Co(e,t){Po=t,e.setLayoutProperty(Ve,"visibility",t?"visible":"none")}var Xt=null;function We(){return Xt}async function Qt(e){return Xt=await ne(`/api/population?radius=${e}`),Xt}function Mo(e,t,n,o,a,s,r){let i={lost:0,gained:0,kept:0,none:0};for(let u of e){let d=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;d<o||d>s||m<n||m>a||(i.lost+=u[In(t)],i.gained+=u[jn(t)],i.kept+=u[Un(t)],i.none+=u[Jn(t)])}return i}var Zt="corridor",Ao="corridor-lines",Qe="#8b929c",er="#6f7783",Xe={lost:T,added:C,kept:Qe};var qe=null,Fo=!1;function Ze(){return qe}function en(){return Fo}function tr(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function No(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function nr(){let e=t=>["match",["get","klass"],"lost",Xe.lost,"added",Xe.added,t];return["interpolate",["linear"],["zoom"],9,e(er),14,e(Qe)]}function or(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function ar(){return["match",["get","klass"],"kept",.85,.9]}function Ho(e,t){e.addSource(Zt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ao,type:"line",source:Zt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":nr(),"line-width":or(),"line-opacity":ar()}},t)}async function tn(e,t){return qe=await x(`/api/corridors?day=${t}`),e.getSource(Zt).setData(tr(qe)),qe}async function Bo(e,t){R.includes(t)&&await tn(e,t)}function Io(e,t){Fo=t,e.setLayoutProperty(Ao,"visibility",t?"visible":"none")}var on="#2b3038",jo="#b9bec6",ke={loses:{color:T,size:6},gains:{color:C,size:6},keeps:{color:Qe,size:3},here:{color:on,size:3.5},none:{color:jo,size:1.8}},tt=["loses","gains","keeps","none","here"],nn="oneseat",Uo="oneseat-dots",et=null,Jo=!1;function re(){return et}function an(){return Jo}function Go(e,t,n,o,a,s){let r={};for(let i of t)r[i]=0;for(let i of e){let u=i[0],d=i[1];if(u<o||u>s||d<n||d>a)continue;let m=t[i[3]];m!==void 0&&r[m]++}return r}function sr(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function rr(){return["match",["get","status"],...Object.entries(ke).flatMap(([e,t])=>[e,t.color]),jo]}function ir(){let e=["match",["get","status"],...Object.entries(ke).flatMap(([t,n])=>[t,n.size]),ke.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Yo(e,t){e.addSource(nn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Uo,type:"circle",source:nn,layout:{visibility:"none"},paint:{"circle-color":rr(),"circle-radius":ir(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function lr(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var cr="pin";function zo(e){return"key"in e?e.key:cr}var nt="any";function ur(e,t,n){return`radius=${e}&${lr(t)}&day=${n}`}function Vo(e,t){return e?t:nt}function Ko(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function sn(e,t,n,o=nt){return et=await x(`/api/oneseat?${ur(t,n,o)}`),e.getSource(nn).setData(sr(et)),et}function Wo(e,t){Jo=t,e.setLayoutProperty(Uo,"visibility",t?"visible":"none")}function rn(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function qo(e,t){let n=t.statuses.find(i=>i.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=i=>i.length?i.join(", "):"none",r=rn(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var ot={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ln={weekday:"weekdays",saturday:"Saturdays",sunday:"Sundays"},dr=new Set(["gone","new"]);function pr(e,t,n){return dr.has(e)?`${t} (${ln[n]})`:t}function mr(e){return e.buckets.filter(t=>t.key!=="none")}var Xo={area:"Ground",people:"People"};function gr(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=Do(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function yr(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=Mo(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(a.lost)}</b> people lose all service</span>
        <span><b>${s(a.gained)}</b> gain service</span>
        <span><b>${s(a.kept)}</b> keep a bus</span>
        <span><b>${s(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var hr=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function Qo(e){let{layer:t,day:n,bounds:o,unit:a,population:s,scoped:r=!1,named:i=!1}=e,u=Vt.map(([d,m])=>`${m} ${((d+2)/4*100).toFixed(1)}%`).join(", ");return`
    <div class="lg-ramp">
      <div class="lg-lab">${i?"Buses":"Surface \u2014 buses"} per day,
        proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${u})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service
          (${ln[n]})</span>
        <span><i style="background:${C}"></i>new service
          (${ln[n]})</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Xo).map(d=>`
          <button data-surface-unit="${d}" aria-pressed="${a===d}"
                  class="${a===d?"active":""}">${Xo[d]}</button>`).join("")}
      </div>
      ${r?hr:a==="people"?yr(n,o,s):gr(t,n,o)}
    </div>`}var fr=["lost","added","kept"],br={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},vr={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ea(e,t){let{lostPct:n,addedPct:o}=No(t.km),a=i=>i.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${vr[t.day]}
    </div>
    ${fr.map(i=>`
      <div class="lg-row lg-static">
        <i style="background:${Xe[i]}"></i>
        <span class="lg-lab">${p(br[i])}</span>
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
      Stop-by-stop or Surface.</div>`}function ta(e,t,n){let o=t.statuses.map(m=>m.key),a=Go(t.points,o,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(b=>b.key===m)?.label??m,r=tt.reduce((m,b)=>m+(a[b]??0),0),i=rn(t),u=t.day&&t.day!==nt,d=u?`Restricted to routes running on ${ot[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${p(i)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${ot[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${tt.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${ke[m].color}"></i>
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
      South Hills would read as losing rides the Blue Line still runs.</div>`}function na(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Zo={locations:"Locations",riders:"Riders"};function wr(e,t){let o=`${t.toLocaleString()} location${t===1?"":"s"} in view`,s=t?`<b>${o}</b> ${t===1?"gains":"gain"} a stop where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",r=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${r}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Sr(e){if(!e)return"";let t=$e(Je);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Je}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Lr(e,t){if(!e)return"";let n=$e(Ge);return`
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
    </div>`}function oa(e,t){let{layer:n,day:o,bounds:a,weight:s,surface:r,unit:i="area",population:u,selection:d,dots:m=!0}=t,b=n.buckets.map(w=>w.key),$=n.days.indexOf(o),{west:k,south:U,east:y,north:Ee}=a,J=mr(n),_=d&&d.size>0?d:null,Te=_?io(_):ro(k,U,y,Ee),On=go(n.points,$,b,Te),St=yo(n.points,Te),Lt=ho(n.points,Te),E=s==="riders"?fo(n.points,$,b,Te):null,ds=w=>E?E.measured[w]?Math.round(E.riders[w]).toLocaleString():"\u2014":On[w].toLocaleString(),ps=E?E.removedMeasured?Math.round(E.removedRiders).toLocaleString():"\u2014":Lt.toLocaleString(),ms=_?`at ${_.size.toLocaleString()} selected stop${_.size===1?"":"s"}`:"in view",Dn=J.reduce((w,$t)=>w+On[$t.key],0)+St+Lt,gs=E?`<b>${Math.round(J.reduce((w,$t)=>w+E.riders[$t.key],0)+E.removedRiders).toLocaleString()}</b> daily boardings ${ms}`:_?`<b>${Dn.toLocaleString()}</b>
         of ${_.size.toLocaleString()} selected stops`:`<b>${Dn.toLocaleString()}</b>
         locations in view`,ys=!m&&!!r;e.innerHTML=ys?`
    <div class="lg-head">
      <b>Surface</b>
      <span class="muted">\xB7 ${ot[o]} \xB7 ${n.radius} m walk</span>
    </div>
    ${Qo({layer:r,day:o,bounds:a,unit:i,population:u,scoped:!!_,named:!0})}`:`
    <div class="lg-head">
      ${gs}
      <span class="muted">\xB7 ${ot[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Zo).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${Zo[w]}</button>`).join("")}
    </div>
    ${J.map(w=>`
      <button class="lg-row ${$e(w.key)?"off":""}" data-bucket="${p(w.key)}"
              aria-pressed="${!$e(w.key)}">
        <i style="background:${je[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${p(pr(w.key,w.label,o))}</span>
        <span class="lg-n">${ds(w.key)}</span>
      </button>`).join("")}
    ${$r(St,Lt,ps)}
    ${r?Qo({layer:r,day:o,bounds:a,unit:i,population:u,scoped:!!_}):""}
    ${E?wr(E.unmeasured,St):""}
    ${_?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var cn="#4aa3ff",ua="#ffa23a",un="headline",at="journey",da="journey-rides",pa="journey-walks",kr=[da,pa],ma=null,ga=!1;function rt(){return ma}function dn(){return ga}function _r(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let r of s.legs){let i=r.from??e.origin,u=r.to??e.destination,d=[[i.lon,i.lat],[u.lon,u.lat]],m=r.path?.length?r.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:o}}function aa(){return["match",["get","side"],"current",cn,"proposed",ua,cn]}function sa(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function ya(e,t){e.addSource(at,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:da,type:"line",source:at,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":aa(),"line-width":sa(1),"line-opacity":.85}},t),e.addLayer({id:pa,type:"line",source:at,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":aa(),"line-width":sa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ha(e,t){ga=t;for(let n of kr)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function pn(e,t){ma=t;let n=t?_r(t,un):{type:"FeatureCollection",features:[]};e.getSource(at).setData(n)}function fa(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var ra=e=>`${e.toFixed(1)} min`;function ba(e){return e==null?"\u2014":e===0?"no change":e>0?`${ra(e)} slower`:`${ra(-e)} faster`}function ia(e,t){return e?e.name?p(e.name):`stop ${p(e.stop_id)}`:t}function xr(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=ia(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${p(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ia(e.to,"the destination")}</span></div>`}function la(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(xr(a,t)),o=a}return n.join("")}var Pr={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Stop-by-stop and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function st(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Rr(e){return`
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
        <span class="muted">${ba(t.change_min)}</span></div>
      ${o}
    </div>`}function ca(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
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
        <p>${Pr[n.classification]??""}</p>
      </div>
      ${ca(e)}`:`${a}
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
      <div class="hl-delta ${o}">${ba(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Rr(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?la(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?la(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Or(e)}
    ${ca(e)}`}function va(e){return`
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
    </div>`}function wa(e){let t=e?e.radii[un].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${cn}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ua}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var ct="places",$a="places-points",gn="places-boundaries",A="places-fill",le="lost",Dr=100,Er={lost:"share_lost",gained:"share_gained"};function K(e,t){return`service_${e}_${t}`}var ka={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Tr="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Q={lost:T,gained:C},it=null,V=null,ie=null,_a=!1,lt=null;function yn(){return it}function xa(){return V}function Pa(){return lt}function hn(){return ie}function _e(){return _a}function Cr(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function Mr(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Ar(e){return Math.max(e.residents_lost,e.residents_gained)}var Sa=4,Fr=16,Nr=1e3;function Hr(e){let t=Math.min(1,Math.sqrt(e/Nr));return Sa+t*(Fr-Sa)}function Br(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Mr(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Hr(Ar(t))}}))}}function Ir(){return["match",["get","klass"],"lost",Q.lost,"gained",Q.gained,Q.lost]}function jr(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var I=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var j=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Ra(e,t){return e==="service"?["step",["abs",["coalesce",["get",K(t,"pct")],0]],j[0].opacity,j[0].max,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity]:["step",["coalesce",["get",Er[e]],0],I[0].opacity,Number.EPSILON,I[1].opacity,I[1].max,I[2].opacity,I[2].max,I[3].opacity,I[3].max,I[4].opacity]}function Oa(e,t){return e==="service"?["case",[">=",["coalesce",["get",K(t,"pct")],0],0],C,T]:Q[e]}function Ur(e,t){let n=K(t,"now"),o=K(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var Jr=3;function Gr(e){if(e.length===0)return"";let t=e.slice(0,Jr),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function Da(e,t){e.addSource(gn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:A,type:"fill",source:gn,layout:{visibility:"none"},paint:{"fill-color":Oa(le),"fill-opacity":Ra(le),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(ct,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:$a,type:"circle",source:ct,layout:{visibility:"none"},paint:{"circle-color":Ir(),"circle-radius":jr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function ut(e,t,n){e.setPaintProperty(A,"fill-color",Oa(t,n)),e.setPaintProperty(A,"fill-opacity",Ra(t,n))}async function Ea(){return it||(it=await x("/api/places")),it}async function Ta(e){return ie||(ie=await x("/api/boundaries"),e.getSource(gn).setData(ie)),ie}function Yr(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Ca(e,t){let n=Yr(ie,t);if(n)return V=null,lt=n,e.getSource(ct)?.setData({type:"FeatureCollection",features:[]}),null;try{V=await x(`/api/places/${encodeURIComponent(t)}`)}catch{return V=null,lt=null,null}return lt=null,e.getSource(ct).setData(Br(V)),e.flyTo({center:[V.lon,V.lat],zoom:13}),V}function Ma(e,t){_a=t,e.setLayoutProperty($a,"visibility",t?"visible":"none"),e.setLayoutProperty(A,"visibility",t?"visible":"none")}function zr(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${p(e.key)}">
      <span class="place-name">${p(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Vr="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Aa(e,t,n,o){let a=Cr(e,t).map(s=>zr(s,s.key===n)).join("");return`
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
    <div class="place-list">${a}</div>`}function Fa(e,t){return e?`<div class="lg-head"><b>${p(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${p(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Kr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Wr(e,t,n,o){let a=j.map((u,d)=>({band:u,prevMax:d===0?0:j[d-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:d})=>{let m=Kr(u,d);return[`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${C};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${p(m)} more trips</span></div>`]}).join(""),s=o?Ur(o,n):[],r=Gr(s),i=r?`<div class="lg-foot">${p(r)}</div>`:"";return`
    ${Fa(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${p(ka[n])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Na({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return Wr(e,a??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",r=I.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${Q[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${p(i.label)} of the place's own residents ${p(s)}</span>
    </div>`).join("");return`
    ${Fa(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${p(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Q.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Q.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function qr(e,t){let n=e[K(t,"now")],o=e[K(t,"proposed")],a=e[K(t,"pct")],s=e[K(t,"rail_proposed")],r=ka[t];if(o===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${r} (0 \u2192 ${o} trips).`;let i=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${r} (${i}).`}function Ha(e,t,n){if(t==="service")return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      ${qr(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=La("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?La("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[a,s]:[s,a]).filter(i=>i!==null);return`<b>${p(e.place)}</b> <span class="muted">\xB7 ${p(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function La(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Dr} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var fn=" \xB7 ",bn={dots:"Stop-by-stop",surface:"Surface",both:"Stop-by-stop + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Ba=Object.keys(bn);function Ia(e){return bn[e]??e}var Xr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Qr=["oneseat","journey"];function Zr(e){return e!=="journey"}function ei(e){let t=[bn[e.view]??e.view];return e.view==="places"?t[0]:(Qr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Xr[e.day]),Zr(e.view)&&t.push(`${e.radius} m walk`),t.join(fn))}function ja(e){let[t,...n]=ei(e).split(fn);return`<b>${p(t)}</b>${n.map(o=>fn+p(o)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},ti=/^[cp]:[\w.:-]{1,32}$/,dt={any:"any",selected:"selected"},ni="pin",Ua=5;function Ga(e){try{return e.self!==e.top}catch{return!0}}function Ya(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?dt.selected:dt.any),t.set(h.dest,"key"in e.dest?e.dest.key:vn(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,vn(e.at)),e.camera&&t.set(h.camera,`${vn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==le&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),`?${t}`}function za(e){let t=new URLSearchParams(e),n={},o=t.get(h.view);o&&Ba.includes(o)&&(n.view=o);let a=t.get(h.day);a&&R.includes(a)&&(n.day=a);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(h.oneSeatDay);r===dt.selected?n.oneSeatRestricted=!0:r===dt.any&&(n.oneSeatRestricted=!1);let i=t.get(h.dest);if(i&&i!==ni){let k=Ja(i);k?n.dest=k:i.includes(",")||(n.dest={key:i})}let u=Ja(t.get(h.at));u&&(n.at=u);let d=oi(t.get(h.camera));d&&(n.camera=d);let m=t.get(h.place);m&&(n.place=m);let b=t.get(h.selection);b!==null&&(n.selection=b.split(",").filter(k=>ti.test(k)));let $=t.get(h.placeFill);return($==="lost"||$==="gained"||$==="service")&&(n.placeFill=$),n}function vn(e){return`${e.lat.toFixed(Ua)},${e.lon.toFixed(Ua)}`}function Ja(e){let t=Va(e,2);return t?{lat:t[0],lon:t[1]}:null}function oi(e){let t=Va(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Va(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var wn="embed";var ai=["1","true","yes"];function Ka(e){let t=new URLSearchParams(e).get(wn);return t!==null&&ai.includes(t.toLowerCase())}function Wa(e){let t=new URLSearchParams(e);return t.set(wn,"1"),`?${t}`}function qa(e){let t=new URLSearchParams(e);t.delete(wn);let n=String(t);return n?`?${n}`:""}function Xa(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var W=["peek","half","full"],si=192,ri=.3,ii=.55,li=.9,ci=.6,ui=.45;function pt(e,t){return e==="peek"?Math.min(si,t*ri):e==="half"?t*ii:t*li}function di(e,t,n=0){let o=W.map(s=>Math.abs(pt(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>ci&&(a=Math.max(0,Math.min(W.length-1,a+(n>0?1:-1)))),W[a]}function Qa(e){return W[(W.indexOf(e)+1)%W.length]}function pi(e,t){return Math.min(e,t*ui)}function ce(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Sn(e){let t=null,n=()=>{let o=ce();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var mi=8,gi=400;function Za(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,s=0,r=0,i=0,u={y:0,t:0};function d(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,pi(y,d()))}function b(y){o=y,t.dataset.snap=y,m(pt(y,d()))}n.addEventListener("pointerdown",y=>{ce()&&(a=!0,s=y.clientY,r=t.getBoundingClientRect().height,i=y.timeStamp,u={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!a)return;let Ee=r+(s-y.clientY),J=pt("peek",d()),_=pt("full",d());m(Math.max(J,Math.min(_,Ee))),u={y:y.clientY,t:y.timeStamp}});function $(y){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-s)>mi)&&y.timeStamp-i<gi){b(Qa(o));return}let J=y.timeStamp-u.t,_=J>0?(u.y-y.clientY)/J:0;b(di(t.getBoundingClientRect().height,d(),_))}n.addEventListener("pointerup",$),n.addEventListener("pointercancel",$),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),ce()&&b(Qa(o)))});let k=Sn(e.onLayoutChange);function U(){if(k(),!ce()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(o)}return window.addEventListener("resize",U),U(),{at:()=>ce()?o:"full",atLeast(y){ce()&&W.indexOf(y)>W.indexOf(o)&&b(y)}}}var yi=[-79.9959,40.4406],hi=12,fi="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},Pe=za(location.search),Oe=Ka(location.search);Oe&&c("app").classList.add("embed");var bi={at:()=>"full",atLeast(){}},ns=null,P=400,xe=null,f=null,de=null,te=0,L={key:"downtown"},Z=null,os=!1,ge=!1,bt="locations",ye="area",as="count",ft=null,F=le,H=!1,g="dots",ss,kn=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Pe.camera?[Pe.camera.lon,Pe.camera.lat]:yi,zoom:Pe.camera?.zoom??hi,cooperativeGestures:Ga(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{Mn(l),So(l),To(l,Ye),Ho(l,Ye),Yo(l,"walk-fill"),ya(l),Da(l,Ye),N(),l.on("click",t=>{if(H)return;if(os){Re({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=l.queryRenderedFeatures(t.point,{layers:[A]})[0];s&&gt(s.properties.key);return}let n=[...Ht,"oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),o=l.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Rn(a[1],a[0])}),l.on("mouseenter",A,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",A,()=>{l.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});for(let t of Ht)l.on("mouseenter",t,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",t,()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove",t,n=>{let o=n.features?.[0],a=Bt();!o||!a||e.setLngLat(o.geometry.coordinates).setHTML(ko(o.properties,S(),a.buckets)).addTo(l)});l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=re();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(qo(n.properties,o)).addTo(l)}),l.on("mouseleave",A,()=>e.remove()),l.on("mousemove",A,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(Ha(n.properties,F,S())).addTo(l)}),Mi(),l.on("moveend",()=>{let t=l.getCenter();ns={lat:t.lat,lon:t.lng,zoom:l.getZoom()},v(),B()}),ue(D.radius,t=>{P=Number(t.dataset.radius),Jt(l,P,S()).then(v),Ke()&&Wt(l,P,S()).then(v),We()&&Qt(P).then(v),re()&&yt(),f&&pe(f.lat,f.lon)}),ue(D.day,t=>{let n=t.dataset.day;Wn(n),g!=="journey"&&N(),Gt(l,n),qt(l,n),g==="journey"&&f&&_n(f.lat,f.lon),Ze()&&Bo(l,n).then(v),ge&&re()&&(yt(),f&&pe(f.lat,f.lon)),_e()&&F==="service"&&ut(l,F,n),v()}),ue(D.oneSeatDay,t=>{ge=t.dataset.oneseatDay==="selected",$n(),yt(),f&&pe(f.lat,f.lon)}),ue(D.view,t=>{let n=g;g=t.dataset.view,e.remove(),so(l,g==="dots"||g==="both"),ki(g==="surface"||g==="both"),xi(g==="corridors"),Di(g==="oneseat"),Oi(g==="journey",n==="journey"),Pi(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),Ri(g!=="corridors"&&g!=="journey"&&g!=="places");let o=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),he()||es(!1),me(),$n(),o||ht(!1),is()}),ue(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){ht(!0);return}ht(!1),Re({key:n})}),ue(D.placeFill,t=>{F=t.dataset.placeFill,_e()&&ut(l,F,S()),N(),v(),$n()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){bt=n.dataset.weight,v(),B();return}let o=t.target.closest("[data-surface-unit]");if(o){ye=o.dataset.surfaceUnit,_i(ye),B();return}let a=t.target.closest("[data-bucket]");a&&(Lo(l,a.dataset.bucket,S()),v())}),c("legend-reset").addEventListener("click",()=>{$o(l,S()),v()}),c("legend-select").addEventListener("click",()=>es(!H)),c("legend-clear").addEventListener("click",()=>{jt(l),me(),v(),B()}),c("legend-collapse").addEventListener("click",()=>{Ln(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Re({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&Ni(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&gt(a.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(as=s.dataset.sortPlaces,N());let r=t.target.closest("[data-goto-place]");r&&(g!=="places"&&ee(D.view,"places"),gt(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Li),Oe&&Sn(Ln),ss=Oe?bi:Za({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Ln}),wi(),wt(),me(),vt(),vi(Pe)||Jt(l,P,S()).then(v),Fi(),Ai()});function ue(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),wt(),B()})})}function ee(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function vi(e){let t=!1;return e.radius!==void 0&&(t=ee(D.radius,String(e.radius))||t),e.day&&(t=ee(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&ee(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(bt=e.weight),e.surfaceUnit&&(ye=e.surfaceUnit),e.placeFill&&ee(D.placeFill,e.placeFill),e.dest&&("key"in e.dest?ee(D.dest,e.dest.key):Re(e.dest)),e.selection&&mo(l,e.selection),e.view&&ee(D.view,e.view),e.at&&Rn(e.at.lat,e.at.lon),e.place&&gt(e.place),t}function B(){let e={view:g,day:S(),radius:P,oneSeatRestricted:ge,weight:bt,surfaceUnit:ye,dest:L,at:f,camera:ns,place:ft,placeFill:F,selection:co()},t=Ya(e);history.replaceState(null,"",(Oe?Wa(t):t)+location.hash),vt(t)}function vt(e=qa(location.search)){if(!Oe)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?de?we(de):"this point":null;t.querySelector(".el-action").textContent=Xa(n)}function wt(){c("statebar").innerHTML=ja({view:g,day:S(),radius:P,oneSeatRestricted:ge,destination:De()}),Si()}function Ln(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function wi(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Si(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Ia(g)))}function Li(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function v(){$i()}function $i(){if(c("legend-reset").classList.toggle("hidden",en()||an()||dn()||_e()||!he()),dn()){c("legend").innerHTML=wa(rt());return}if(_e()){c("legend").innerHTML=Na({selected:xa(),fill:F,day:S(),boundaries:hn(),unchanged:Pa()});return}if(en()){let n=Ze();n&&ea(c("legend"),n);return}if(an()){let n=re();if(!n)return;let o=l.getBounds();ta(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Bt();if(!e)return;let t=l.getBounds();oa(c("legend"),{layer:e,day:S(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:bt,dots:he(),surface:Kt()?Ke():null,unit:ye,population:We(),selection:lo()})}async function ki(e){if(e&&!Ke()){c("legend").classList.add("loading");try{await Wt(l,P,S())}finally{c("legend").classList.remove("loading")}}Co(l,e),e&&ye==="people"&&await rs(),v()}async function rs(){if(!We()){c("legend").classList.add("loading");try{await Qt(P)}finally{c("legend").classList.remove("loading")}}}async function _i(e){e==="people"&&Kt()&&await rs(),v()}async function xi(e){if(e&&!Ze()){c("legend").classList.add("loading");try{await tn(l,S())}finally{c("legend").classList.remove("loading")}}Io(l,e),v()}async function Pi(e){if(e&&(!yn()||!hn())){c("legend").classList.add("loading");try{await Promise.all([Ea(),Ta(l)])}finally{c("legend").classList.remove("loading")}}Ma(l,e),e&&ut(l,F,S()),e&&N(),v()}async function gt(e){ft=await Pn(()=>Ca(l,e))?e:null,g==="places"&&(N(),ft&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),B()}function Ri(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),vt(),g==="places"){c("panel").innerHTML=Aa(yn()??[],as,ft,F);return}if(!de){g==="oneseat"?c("panel").innerHTML=to(De()):qn(c("panel"));return}if(g==="oneseat"){let t=eo(de,L,S());if(t){c("panel").innerHTML=t;return}}Zn(de)}function Oi(e,t=!1){if(ha(l,e),v(),!e){t&&(f?pe(f.lat,f.lon):N());return}rt()&&f?c("panel").innerHTML=mn(rt(),De()):c("panel").innerHTML=va(De())}async function _n(e,t){let n=++te;f={lat:e,lon:t},B(),cs(e,t);let o=ls(),a=p(De());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await x(fa({lat:e,lon:t},o,S()));if(n!==te)return;pn(l,s),c("panel").innerHTML=mn(s,a),v(),vt()}catch(s){if(n!==te)return;pn(l,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function $n(){c("day-controls").classList.toggle("hidden",!Ko(g,ge,F))}function xn(){return Vo(ge,S())}async function Di(e){e&&!re()&&await Pn(()=>sn(l,P,L,xn())),Wo(l,e),v()}async function yt(){await Pn(()=>sn(l,P,L,xn())),v()}async function Pn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Re(e){if(L=e,ht(!1),Ei(),is(),wt(),B(),g==="journey"){f&&_n(f.lat,f.lon),v();return}f?pe(f.lat,f.lon):N({scrollToTop:!0}),yt()}function is(){let e=ls();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in L))){Z?.remove(),Z=null;return}Z?Z.setLngLat([e.lon,e.lat]).addTo(l):(Z=new maplibregl.Marker({color:on,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),Z.on("dragend",()=>{let n=Z.getLngLat();Re({lat:n.lat,lon:n.lng})}))}function Ei(){let e=zo(L);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function ls(){if("lat"in L)return{lat:L.lat,lon:L.lon};let e=L.key,t=kn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function De(){if("lat"in L)return`${L.lat.toFixed(4)}, ${L.lon.toFixed(4)}`;let e=L.key;return kn.find(t=>t.key===e)?.name??e}function ht(e){os=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function pe(e,t){let n=++te;f={lat:e,lon:t},B(),c("panel").classList.add("loading"),cs(e,t);try{let o="lat"in L?`&dest_lat=${L.lat.toFixed(6)}&dest_lon=${L.lon.toFixed(6)}`:"",a=await x(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${o}&oneseat_day=${xn()}`);if(n!==te)return;An(l,e,t,P,a.current.stops,a.proposed.stops),Ti(),de=a,N({scrollToTop:!0})}catch(o){if(n!==te)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===te&&c("panel").classList.remove("loading")}}function Ti(){c("pin-key").innerHTML=na(P),c("pin-key").classList.remove("hidden")}function cs(e,t){xe?xe.setLngLat([t,e]):(xe=new maplibregl.Marker({color:fi,draggable:!0}).setLngLat([t,e]).addTo(l),xe.on("dragend",()=>{let n=xe.getLngLat();Rn(n.lat,n.lng)}))}var mt=14;function he(){return g==="dots"||g==="both"}function es(e){H=e&&he(),H?l.dragPan.disable():l.dragPan.enable(),l.getCanvas().style.cursor=H?"none":"",H||us(),me()}function me(){let e=c("legend-select");e.classList.toggle("hidden",!he()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!he()||!uo())}function Ci(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function ts(e){c("brush").classList.toggle("painting",e)}function us(){c("brush").hidden=!0}function Mi(){let e=c("brush");e.style.width=`${mt*2}px`,e.style.height=`${mt*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,me(),v()}))},s=()=>{H&&(t=!0,n=!1,ts(!0))},r=u=>{if(Ci(u.point.x,u.point.y),!t)return;n=!0,It(l,Ut(l,u.point.x,u.point.y,mt))&&a()},i=u=>{if(ts(!1),!!t){if(t=!1,!n){let[d]=Ut(l,u.point.x,u.point.y,mt);d&&po(l,d)}me(),v(),B()}};l.on("mousedown",s),l.on("mousemove",r),l.on("mouseup",i),l.getCanvas().addEventListener("mouseleave",us),l.on("touchstart",s),l.on("touchmove",r),l.on("touchend",i)}function Rn(e,t){if(ss.atLeast("half"),g==="journey"){_n(e,t);return}g!=="places"&&pe(e,t)}async function Ai(){try{kn=await x("/api/destinations"),wt()}catch{}}async function Fi(){try{let e=await x("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Ni(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
