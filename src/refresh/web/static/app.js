"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function w(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Z(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function mt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function yt(e){return e>0?`+${e}`:String(e)}function Sn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var es="#4aa3ff",ts="#ffa23a";function ns(e,t,n,o=96){let a=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let c=0;c<=o;c++){let u=c/o*2*Math.PI;a.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function ee(e){return{type:"FeatureCollection",features:e}}function wn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Ln(e){e.addSource("walk",{type:"geojson",data:ee([])}),e.addSource("stops-now",{type:"geojson",data:ee([])}),e.addSource("stops-prop",{type:"geojson",data:ee([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":ts,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":es,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function $n(e,t,n,o,a,s){e.getSource("walk").setData(ee([ns(t,n,o)])),e.getSource("stops-now").setData(ee(wn(a,"current"))),e.getSource("stops-prop").setData(ee(wn(s,"proposed")))}var k=["weekday","saturday","sunday"],gt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],kn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},De=4,xn=e=>4+De*e,_n=e=>5+De*e,me=e=>6+De*e,os=e=>7+De*e;var as=3,ht=e=>e[as],K=(e,t)=>e[t],Pn=(e,t)=>e[os(t)],ft=e=>2+2*e,bt=e=>3+2*e,Oe=4,Dn=e=>2+Oe*e,On=e=>3+Oe*e,Rn=e=>4+Oe*e,Tn=e=>5+Oe*e;var St="weekday";function L(){return St}function Nn(e){St=e}function Hn(e){e.innerHTML=`
    <div class="empty">
      <h2>What changes here?</h2>
      <p>The map draws the whole city at once, one of five ways depending on
         the view chosen in the toolbar on the map. Pan and zoom to read a
         neighbourhood.</p>
      <p><b>Locations</b> draws one dot per place a bus stops today, coloured
         by what the plan does to the buses within a short walk. Its key counts
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
    </div>`}function ss(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function rs(e,t){let n=Math.max(1,...gt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return gt.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,r=s-a,c=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${kn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${c}">${r===0?"\xB7":yt(r)}</td>
      </tr>`}).join("")}function Bn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function En(e){return e.first==null?'<span class="muted">no service</span>':`${Z(e.first)}\u2013${Z(e.last)}`}function Cn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var is={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},ls={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function cs(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Ee(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${is[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${ls[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Te("one-seat")}</p>
    </div>`:""}function Te(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Re(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function Mn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function An(e){return e.first==null||e.last==null?null:e.last-e.first}function Ee(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Fn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Fn(t,n,"prop")}</div>
    </div>`}function Fn(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${d(o)}</span>`).join(" "):'<span class="muted">none</span>'}var vt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,us="Allegheny";function ye(e){let t=e.place?.muni?.trim()??"",n=vt.exec(t)?.[1],o=n===us?t.replace(vt,""):n?`${t.replace(vt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function wt(e){return e==="weekday"?"weekday":e}function jn(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${wt(t)}`}function ds(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${wt(t)}, today only</span>`}${o}</dd>`}function ps(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Te("boardings")}</p>`}function ms(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${Te("place-population")}</p>
    </div>`}function Lt(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,r=s>0?"up":s<0?"down":"flat",c=Cn(o),u=Cn(a),p=An(o),m=An(a);return`
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
        ${s===0?"no change":`${yt(s)} trips`}
        <div class="muted">${Sn(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${wt(t)}, both directions</div>

    <div class="tiers">${ss(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${rs(o,a)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
      <span><i class="sw-walk"></i> the ${e.radius} m walk</span>
      <span><i class="sw-pin"></i> where you clicked</span>
    </div>
    <div class="key-note">A stop both networks keep draws as a blue dot in an
      orange ring. Two marks mean the plan nudged it across the intersection \u2014
      renumbering, not a change in service.</div>

    <dl class="facts">
      <dt>First and last</dt>
      ${Re(En(o),En(a))}
      <dt>Hours between</dt>
      ${Re(mt(p),mt(m),Mn(p,m,"more"))}
      <dt>Typical wait</dt>
      ${Re(c==null?"\u2014":`${c} min`,u==null?"\u2014":`${u} min`,Mn(c,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Re(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${ds(o.boardings,t)}
    </dl>
    ${ps(o.boardings)}

    ${n}

    ${ms(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Ee(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Te("location-not-route")}</p>
    </div>`}function In(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(ye(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Lt(e,St,cs(e.oneseat??[],e.oneseat_day??"any"))}`}var ys={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},gs={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},hs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function fs(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function $t(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Bn(t)}</div>`:""}function bs(e){let t=$t("kept",e.kept)+$t("lost",e.lost)+$t("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function vs(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Ee(e.current,e.proposed)}
    </div>`}function Ss(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${d(a.key)}">
      <span class="os-name">${d(a.name)}</span>
      <span class="os-status ${d(a.status)}">${ws[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var ws={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Ls(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${hs[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Un(e,t,n){let o=fs(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":bs(o)+vs(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(ye(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${ys[o.status]}</div>
    <p class="note">${gs[o.status]} ${Ls(a)}</p>

    ${s}

    ${Ss(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${jn(e,n)}</summary>
      ${Lt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Jn(e){return`
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
    </div>`}var Ae={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Fe="change",he="change-dots",Ce=["boolean",["feature-state","selected"],!1],$s="#15181e",Me=null,te=new Set,C=new Set;function kt(){return Me}function xt(e){return te.has(e)}function zn(e,t,n,o){return a=>_s(a,e,t,n,o)}function Gn(e){return t=>e.has(ht(t))}function Vn(){return C}function Yn(){return[...C].sort()}function Kn(){return C.size}function _t(e,t){let n=0;for(let o of t)C.has(o)||(C.add(o),fe(e,o,!0),n++);return n}function Wn(e,t){C.delete(t)?fe(e,t,!1):(C.add(t),fe(e,t,!0))}function qn(e,t){Pt(e),_t(e,t)}function Pt(e){for(let t of C)fe(e,t,!1);C.clear()}function fe(e,t,n){try{e.setFeatureState({source:Fe,id:t},{selected:n})}catch{}}function ks(e){for(let t of C)fe(e,t,!0)}function xs(e,t,n,o){let a=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=a).map(s=>s.id)}function Dt(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],s=e.queryRenderedFeatures(a,{layers:[he]}).filter(r=>r.id!==void 0).map(r=>{let[c,u]=r.geometry.coordinates,p=e.project([c,u]);return{id:r.id,x:p.x,y:p.y}});return xs(t,n,o,s)}function Xn(e,t,n,o){let a={};for(let s of n)a[s]=0;for(let s of e){if(!o(s))continue;let r=n[K(s,me(t))];r!==void 0&&a[r]++}return a}function _s(e,t,n,o,a){let s=K(e,0),r=K(e,1);return s>=n&&s<=a&&r>=t&&r<=o}function Qn(e,t,n,o){let a={riders:{},measured:{},unmeasured:0};for(let s of n)a.riders[s]=0,a.measured[s]=0;for(let s of e){if(!o(s))continue;let r=n[K(s,me(t))];if(r===void 0)continue;let c=Pn(s,t);if(c===null){r!=="none"&&a.unmeasured++;continue}a.riders[r]+=c,a.measured[r]++}return a}function Ps(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>k.some((o,a)=>t[K(n,me(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ht(n),published:n[2],...Object.fromEntries(k.flatMap((o,a)=>[[`b${a}`,t[K(n,me(a))]],[`c${a}`,n[xn(a)]],[`p${a}`,n[_n(a)]]]))}}))}}function ge(e,t){let n=Object.entries(Ae).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Ae.none[t]]}function Zn(e){return["interpolate",["linear"],["zoom"],9,["*",ge(e,"size"),.45],12,ge(e,"size"),16,["*",ge(e,"size"),1.9]]}function eo(e){e.addSource(Fe,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:he,type:"circle",source:Fe,paint:{"circle-color":ge(0,"color"),"circle-radius":Zn(0),"circle-opacity":.85,"circle-stroke-color":["case",Ce,$s,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",Ce,1.6,.5],12,["case",Ce,2.4,1],16,["case",Ce,3.2,1.6]]}},"walk-fill")}async function Ot(e,t,n){return Me=await w(`/api/change?radius=${t}`),e.getSource(Fe).setData(Ps(Me)),ks(e),Rt(e,n),Me}function Rt(e,t){let n=k.indexOf(t);e.setPaintProperty(he,"circle-color",ge(n,"color")),e.setPaintProperty(he,"circle-radius",Zn(n)),Tt(e,t)}function to(e,t,n){te.has(t)?te.delete(t):te.add(t),Tt(e,n)}function no(e,t){te.clear(),Tt(e,t)}function Tt(e,t){let n=k.indexOf(t),o=["none",...te];e.setFilter(he,["!",["in",["get",`b${n}`],["literal",o]]])}function oo(e,t,n){let o=k.indexOf(t),a=e[`b${o}`],s=n.find(p=>p.key===a)?.label??a,r=e[`c${o}`],c=e[`p${o}`];return`<b>${s}</b><br>${r} \u2192 ${c} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Et="surface",He="surface-fill",ao="#6b7280",Ct=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,ao],[.138,ao],[1,"#bd60e7"],[2,"#961bed"]],E="#e8232f",T="#0f79c9",so=2,Ne=null,ro=!1;function Be(){return Ne}function Mt(){return ro}function io(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-so,Math.min(so,n))}function lo(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function co(e,t,n,o,a,s,r,c){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=r.lat0+(p[1]+.5)*r.dlat,v=r.lon0+(p[0]+.5)*r.dlon;if(m<o||m>s||v<n||v>a)continue;let _=p[ft(t)],P=p[bt(t)],R=lo(_,P);if(R!=="none")if(R==="ramp"){let g=io(_,P);u[g<-.138?"less":g>.138?"more":"same"]+=c}else u[R]+=c}return u}function Ds(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*o,c=r+o,u=n+s[0]*a,p=u+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[p,r],[p,c],[u,c],[u,r]]]},properties:Object.fromEntries(k.flatMap((m,v)=>{let _=s[ft(v)],P=s[bt(v)];return[[`k${v}`,lo(_,P)],[`v${v}`,io(_,P)??0]]}))}})}}function uo(e){return["case",["==",["get",`k${e}`],"gone"],E,["==",["get",`k${e}`],"new"],T,["interpolate",["linear"],["get",`v${e}`],...Ct.flatMap(([t,n])=>[t,n])]]}function ne(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function po(e,t){e.addSource(Et,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:He,type:"fill",source:Et,layout:{visibility:"none"},paint:{"fill-color":uo(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,ne(0,.85),13,ne(0,.62),16,ne(0,.45)]}},t)}async function At(e,t,n){return Ne=await w(`/api/surface?radius=${t}`),e.getSource(Et).setData(Ds(Ne)),Ft(e,n),Ne}function Ft(e,t){let n=k.indexOf(t);e.setPaintProperty(He,"fill-color",uo(n)),e.setPaintProperty(He,"fill-opacity",["interpolate",["linear"],["zoom"],9,ne(n,.85),13,ne(n,.62),16,ne(n,.45)])}function mo(e,t){ro=t,e.setLayoutProperty(He,"visibility",t?"visible":"none")}var Nt=null;function je(){return Nt}async function Ht(e){return Nt=await w(`/api/population?radius=${e}`),Nt}function yo(e,t,n,o,a,s,r){let c={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;p<o||p>s||m<n||m>a||(c.lost+=u[Dn(t)],c.gained+=u[On(t)],c.kept+=u[Rn(t)],c.none+=u[Tn(t)])}return c}var Bt="corridor",go="corridor-lines",Je="#8b929c",Os="#6f7783",Ue={lost:E,added:T,kept:Je};var Ie=null,ho=!1;function ze(){return Ie}function jt(){return ho}function Rs(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function fo(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Ts(){let e=t=>["match",["get","klass"],"lost",Ue.lost,"added",Ue.added,t];return["interpolate",["linear"],["zoom"],9,e(Os),14,e(Je)]}function Es(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Cs(){return["match",["get","klass"],"kept",.85,.9]}function bo(e,t){e.addSource(Bt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:go,type:"line",source:Bt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Ts(),"line-width":Es(),"line-opacity":Cs()}},t)}async function It(e,t){return Ie=await w(`/api/corridors?day=${t}`),e.getSource(Bt).setData(Rs(Ie)),Ie}async function vo(e,t){k.includes(t)&&await It(e,t)}function So(e,t){ho=t,e.setLayoutProperty(go,"visibility",t?"visible":"none")}var Ut="added-stops",be="added-stop-rings",Jt=T,Ms="#ffffff",Ge=null,wo=!1;function zt(){return Ge}function Lo(){return wo}function As(e){return{type:"FeatureCollection",features:e.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{stop_id:t.stop_id,name:t.name,routes:t.routes.join(", "),...Object.fromEntries(k.map(n=>[n,t.trips[n]??0]))}}))}}function $o(e,t,n,o,a){return e.filter(s=>s.lon>=t&&s.lon<=o&&s.lat>=n&&s.lat<=a).length}function Fs(e,t){let n=Number(e[t]??0);return`<b>${e.name}</b><br>a stop the plan adds \xB7 route ${e.routes}
    <br>${n} ${n===1?"call":"calls"} on a ${t==="weekday"?"weekday":t==="saturday"?"Saturday":"Sunday"}`}function Ns(){return["interpolate",["linear"],["zoom"],9,2.5,13,4.5,16,7]}function Hs(){return["interpolate",["linear"],["zoom"],9,1,13,1.6,16,2.4]}function ko(e,t){e.addSource(Ut,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:be,type:"circle",source:Ut,layout:{visibility:"none"},paint:{"circle-radius":Ns(),"circle-color":Ms,"circle-opacity":.95,"circle-stroke-width":Hs(),"circle-stroke-color":Jt}},t)}async function xo(e){return Ge=await w("/api/added-stops"),e.getSource(Ut).setData(As(Ge)),Ge}function _o(e,t){wo=t,e.setLayoutProperty(be,"visibility",t?"visible":"none")}function Po(e,t){let n=new maplibregl.Popup({closeButton:!1,offset:10});e.on("mouseenter",be,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",be,()=>{e.getCanvas().style.cursor="",n.remove()}),e.on("mousemove",be,o=>{let a=o.features?.[0];a&&n.setLngLat(o.lngLat).setHTML(Fs(a.properties,t())).addTo(e)})}var Vt="#2b3038",Do="#b9bec6",ve={loses:{color:E,size:6},gains:{color:T,size:6},keeps:{color:Je,size:3},here:{color:Vt,size:3.5},none:{color:Do,size:1.8}},Ye=["loses","gains","keeps","none","here"],Gt="oneseat",Oo="oneseat-dots",Ve=null,Ro=!1;function oe(){return Ve}function Yt(){return Ro}function To(e,t,n,o,a,s){let r={};for(let c of t)r[c]=0;for(let c of e){let u=c[0],p=c[1];if(u<o||u>s||p<n||p>a)continue;let m=t[c[3]];m!==void 0&&r[m]++}return r}function Bs(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function js(){return["match",["get","status"],...Object.entries(ve).flatMap(([e,t])=>[e,t.color]),Do]}function Is(){let e=["match",["get","status"],...Object.entries(ve).flatMap(([t,n])=>[t,n.size]),ve.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Eo(e,t){e.addSource(Gt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Oo,type:"circle",source:Gt,layout:{visibility:"none"},paint:{"circle-color":js(),"circle-radius":Is(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Us(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Js="pin";function Co(e){return"key"in e?e.key:Js}var Ke="any";function zs(e,t,n){return`radius=${e}&${Us(t)}&day=${n}`}function Mo(e,t){return e?t:Ke}function Ao(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function Kt(e,t,n,o=Ke){return Ve=await w(`/api/oneseat?${zs(t,n,o)}`),e.getSource(Gt).setData(Bs(Ve)),Ve}function Fo(e,t){Ro=t,e.setLayoutProperty(Oo,"visibility",t?"visible":"none")}function Wt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function No(e,t){let n=t.statuses.find(c=>c.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=c=>c.length?c.join(", "):"none",r=Wt(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var qt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Gs(e){return e.buckets.filter(t=>t.key!=="none")}var Ho={area:"Ground",people:"People"};function Vs(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=co(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Ys(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=yo(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(a.lost)}</b> people lose all service</span>
        <span><b>${s(a.gained)}</b> gain service</span>
        <span><b>${s(a.kept)}</b> keep a bus</span>
        <span><b>${s(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Ks=`
      <div class="lg-ends" style="margin-top:6px">Ground and people are
        measured across the view, not the stops you selected \u2014 a 100 m cell
        has no stop to select. Clear the selection to count them.</div>`;function Ws(e){let{layer:t,day:n,bounds:o,unit:a,population:s,scoped:r=!1}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Ct.map(([u,p])=>`${p} ${((u+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${E}"></i>loses all service</span>
        <span><i style="background:${T}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Ho).map(u=>`
          <button data-surface-unit="${u}" aria-pressed="${a===u}"
                  class="${a===u?"active":""}">${Ho[u]}</button>`).join("")}
      </div>
      ${r?Ks:a==="people"?Ys(n,o,s):Vs(t,n,o)}
    </div>`}var qs=["lost","added","kept"],Xs={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Qs={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function jo(e,t){let{lostPct:n,addedPct:o}=fo(t.km),a=c=>c.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${Qs[t.day]}
    </div>
    ${qs.map(c=>`
      <div class="lg-row lg-static">
        <i style="background:${Ue[c]}"></i>
        <span class="lg-lab">${d(Xs[c])}</span>
        <span class="lg-n">${a(t.km[c])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${a(n)}%</b> of today's pavement lost</span>
      <span><b>${a(o)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A piece of street either has a bus on it or it doesn't \u2014
      this is not a walk-access question, so there is no radius here. A place
      can keep full walk access while a specific street loses its only bus, if
      a parallel block picks up the trip instead. See Locations or Surface for
      what you can still reach on foot.</div>`}function Io(e,t,n){let o=t.statuses.map(m=>m.key),a=To(t.points,o,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(v=>v.key===m)?.label??m,r=Ye.reduce((m,v)=>m+(a[v]??0),0),c=Wt(t),u=t.day&&t.day!==Ke,p=u?`Restricted to routes running on ${qt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(c)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${qt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Ye.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${ve[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Ye.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(c)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Uo(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Bo={locations:"Locations",riders:"Riders"};function Zs(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function er(e){return`<div class="lg-foot">Dots mark the places a bus stops today, plus the
    ground the plan adds a bus to where nothing stops within the walk radius
    now. So a stop the plan adds beside one that already exists changes a dot's
    colour rather than adding one &mdash; ${e?"the rings are those stops themselves. Streets colours the pavement.":"Streets colours the pavement itself, and shows the rest."}</div>`}function tr(e,t,n){let o=n?e.length:$o(e,t.west,t.south,t.east,t.north);return`
    <div class="lg-row lg-static">
      <i class="lg-ring" style="box-shadow:inset 0 0 0 2px ${Jt}"></i>
      <span class="lg-lab">stop the plan adds${n?" (citywide)":""}</span>
      <span class="lg-n">${o.toLocaleString()}</span>
    </div>`}function Jo(e,t){let{layer:n,day:o,bounds:a,weight:s,surface:r,unit:c="area",population:u,selection:p,added:m}=t,v=n.buckets.map(S=>S.key),_=n.days.indexOf(o),{west:P,south:R,east:g,north:Pe}=a,B=Gs(n),D=p&&p.size>0?p:null,vn=D?Gn(D):zn(P,R,g,Pe),pt=Xn(n.points,_,v,vn),Y=s==="riders"?Qn(n.points,_,v,vn):null,Xa=S=>Y?Y.measured[S]?Math.round(Y.riders[S]).toLocaleString():"\u2014":pt[S].toLocaleString(),Qa=D?`at ${D.size.toLocaleString()} selected stop${D.size===1?"":"s"}`:"in view",Za=Y?`<b>${Math.round(B.reduce((S,pe)=>S+Y.riders[pe.key],0)).toLocaleString()}</b> daily boardings ${Qa}`:D?`<b>${B.reduce((S,pe)=>S+pt[pe.key],0).toLocaleString()}</b>
         of ${D.size.toLocaleString()} selected stops`:`<b>${B.reduce((S,pe)=>S+pt[pe.key],0).toLocaleString()}</b>
         locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${Za}
      <span class="muted">\xB7 ${qt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Bo).map(S=>`
        <button data-weight="${S}" aria-pressed="${s===S}"
                class="${s===S?"active":""}">${Bo[S]}</button>`).join("")}
    </div>
    ${B.map(S=>`
      <button class="lg-row ${xt(S.key)?"off":""}" data-bucket="${d(S.key)}"
              aria-pressed="${!xt(S.key)}">
        <i style="background:${Ae[S.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(S.label)}</span>
        <span class="lg-n">${Xa(S.key)}</span>
      </button>`).join("")}
    ${m?tr(m,a,!!D):""}
    ${r?Ws({layer:r,day:o,bounds:a,unit:c,population:u,scoped:!!D}):""}
    ${Y?Zs(Y.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}
    ${er(!!m)}
    ${D?`
    <div class="lg-foot">These are the stops you painted, not everything on
      screen \u2014 a selection you chose by hand, so quote it as one. The link in
      your address bar carries it.</div>`:""}`}var Xt="#4aa3ff",qo="#ffa23a",Qt="headline",We="journey",Xo="journey-rides",Qo="journey-walks",nr=[Xo,Qo],Zo=null,ea=!1;function Xe(){return Zo}function Zt(){return ea}function or(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let r of s.legs){let c=r.from??e.origin,u=r.to??e.destination,p=[[c.lon,c.lat],[u.lon,u.lat]],m=r.path?.length?r.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:o}}function zo(){return["match",["get","side"],"current",Xt,"proposed",qo,Xt]}function Go(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function ta(e,t){e.addSource(We,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Xo,type:"line",source:We,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":zo(),"line-width":Go(1),"line-opacity":.85}},t),e.addLayer({id:Qo,type:"line",source:We,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":zo(),"line-width":Go(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function na(e,t){ea=t;for(let n of nr)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function en(e,t){Zo=t;let n=t?or(t,Qt):{type:"FeatureCollection",features:[]};e.getSource(We).setData(n)}function oa(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Vo=e=>`${e.toFixed(1)} min`;function aa(e){return e==null?"\u2014":e===0?"no change":e>0?`${Vo(e)} slower`:`${Vo(-e)} faster`}function Yo(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function ar(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Yo(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Yo(e.to,"the destination")}</span></div>`}function Ko(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(ar(a,t)),o=a}return n.join("")}var sr={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function qe(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function rr(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function ir(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${qe(t.current)} \u2192
        ${qe(t.proposed)} min</span>
        <span class="muted">${aa(t.change_min)}</span></div>
      ${o}
    </div>`}function Wo(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function tn(e,t){let n=e.radii[Qt],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${Z(e.window.start_min)}
        and ${Z(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${sr[n.classification]??""}</p>
      </div>
      ${Wo(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${qe(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${qe(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${aa(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${rr(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Ko(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Ko(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${ir(e)}
    ${Wo(e)}`}function sa(e){return`
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
    </div>`}function ra(e){let t=e?e.radii[Qt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Xt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${qo}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var et="places",ca="places-points",nn="places-boundaries",M="places-fill",se="lost",lr=100,cr={lost:"share_lost",gained:"share_gained"};function z(e,t){return`service_${e}_${t}`}var ua={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ur="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",W={lost:E,gained:T},Qe=null,J=null,ae=null,da=!1,Ze=null;function on(){return Qe}function pa(){return J}function ma(){return Ze}function an(){return ae}function Se(){return da}function dr(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function pr(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function mr(e){return Math.max(e.residents_lost,e.residents_gained)}var ia=4,yr=16,gr=1e3;function hr(e){let t=Math.min(1,Math.sqrt(e/gr));return ia+t*(yr-ia)}function fr(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:pr(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:hr(mr(t))}}))}}function br(){return["match",["get","klass"],"lost",W.lost,"gained",W.gained,W.lost]}function vr(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var j=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var I=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function ya(e,t){return e==="service"?["step",["abs",["coalesce",["get",z(t,"pct")],0]],I[0].opacity,I[0].max,I[1].opacity,I[1].max,I[2].opacity,I[2].max,I[3].opacity]:["step",["coalesce",["get",cr[e]],0],j[0].opacity,Number.EPSILON,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity,j[3].max,j[4].opacity]}function ga(e,t){return e==="service"?["case",[">=",["coalesce",["get",z(t,"pct")],0],0],T,E]:W[e]}function Sr(e,t){let n=z(t,"now"),o=z(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var wr=3;function Lr(e){if(e.length===0)return"";let t=e.slice(0,wr),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function ha(e,t){e.addSource(nn,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:M,type:"fill",source:nn,layout:{visibility:"none"},paint:{"fill-color":ga(se),"fill-opacity":ya(se),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(et,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ca,type:"circle",source:et,layout:{visibility:"none"},paint:{"circle-color":br(),"circle-radius":vr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function tt(e,t,n){e.setPaintProperty(M,"fill-color",ga(t,n)),e.setPaintProperty(M,"fill-opacity",ya(t,n))}async function fa(){return Qe||(Qe=await w("/api/places")),Qe}async function ba(e){return ae||(ae=await w("/api/boundaries"),e.getSource(nn).setData(ae)),ae}function $r(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function va(e,t){let n=$r(ae,t);if(n)return J=null,Ze=n,e.getSource(et)?.setData({type:"FeatureCollection",features:[]}),null;try{J=await w(`/api/places/${encodeURIComponent(t)}`)}catch{return J=null,Ze=null,null}return Ze=null,e.getSource(et).setData(fr(J)),e.flyTo({center:[J.lon,J.lat],zoom:13}),J}function Sa(e,t){da=t,e.setLayoutProperty(ca,"visibility",t?"visible":"none"),e.setLayoutProperty(M,"visibility",t?"visible":"none")}function kr(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var xr="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function wa(e,t,n,o){let a=dr(e,t).map(s=>kr(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${ur}</p>
    ${o==="service"?`<p class="note">${xr}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function La(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function _r(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Pr(e,t,n,o){let a=I.map((u,p)=>({band:u,prevMax:p===0?0:I[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=_r(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${E};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=o?Sr(o,n):[],r=Lr(s),c=r?`<div class="lg-foot">${d(r)}</div>`:"";return`
    ${La(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(ua[n])}</div>
    ${a}
    ${c}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function $a({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return Pr(e,a??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",r=j.filter(c=>c.opacity>0).map(c=>`
    <div class="lg-row lg-static">
      <i style="background:${W[t]};opacity:${c.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(c.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${La(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${W.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${W.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Dr(e,t){let n=e[z(t,"now")],o=e[z(t,"proposed")],a=e[z(t,"pct")],s=e[z(t,"rail_proposed")],r=ua[t];if(o===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${r} (0 \u2192 ${o} trips).`;let c=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${r} (${c}).`}function ka(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${Dr(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=la("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?la("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[a,s]:[s,a]).filter(c=>c!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function la(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${lr} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var sn=" \xB7 ",rn={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},xa=Object.keys(rn);function _a(e){return rn[e]??e}var Or={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Rr=["oneseat","journey"];function Tr(e){return e!=="journey"}function Er(e){let t=[rn[e.view]??e.view];return e.view==="places"?t[0]:(Rr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Or[e.day]),Tr(e.view)&&t.push(`${e.radius} m walk`),t.join(sn))}function Pa(e){let[t,...n]=Er(e).split(sn);return`<b>${d(t)}</b>${n.map(o=>sn+d(o)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",addedStops:"newstops"},Cr=/^[cp]:[\w.:-]{1,32}$/,nt={any:"any",selected:"selected"},Mr="pin",Da=5;function Ra(e){try{return e.self!==e.top}catch{return!0}}function Ta(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?nt.selected:nt.any),t.set(h.dest,"key"in e.dest?e.dest.key:ln(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,ln(e.at)),e.camera&&t.set(h.camera,`${ln(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==se&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),t.set(h.addedStops,e.addedStops?"on":"off"),`?${t}`}function Ea(e){let t=new URLSearchParams(e),n={},o=t.get(h.view);o&&xa.includes(o)&&(n.view=o);let a=t.get(h.day);a&&k.includes(a)&&(n.day=a);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(h.oneSeatDay);r===nt.selected?n.oneSeatRestricted=!0:r===nt.any&&(n.oneSeatRestricted=!1);let c=t.get(h.dest);if(c&&c!==Mr){let R=Oa(c);R?n.dest=R:c.includes(",")||(n.dest={key:c})}let u=Oa(t.get(h.at));u&&(n.at=u);let p=Ar(t.get(h.camera));p&&(n.camera=p);let m=t.get(h.place);m&&(n.place=m);let v=t.get(h.selection);v!==null&&(n.selection=v.split(",").filter(R=>Cr.test(R)));let _=t.get(h.addedStops);_==="off"?n.addedStops=!1:_==="on"&&(n.addedStops=!0);let P=t.get(h.placeFill);return(P==="lost"||P==="gained"||P==="service")&&(n.placeFill=P),n}function ln(e){return`${e.lat.toFixed(Da)},${e.lon.toFixed(Da)}`}function Oa(e){let t=Ca(e,2);return t?{lat:t[0],lon:t[1]}:null}function Ar(e){let t=Ca(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ca(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var cn="embed";var Fr=["1","true","yes"];function Ma(e){let t=new URLSearchParams(e).get(cn);return t!==null&&Fr.includes(t.toLowerCase())}function Aa(e){let t=new URLSearchParams(e);return t.set(cn,"1"),`?${t}`}function Fa(e){let t=new URLSearchParams(e);t.delete(cn);let n=String(t);return n?`?${n}`:""}function Na(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var G=["peek","half","full"],Nr=192,Hr=.3,Br=.55,jr=.9,Ir=.6,Ur=.45;function ot(e,t){return e==="peek"?Math.min(Nr,t*Hr):e==="half"?t*Br:t*jr}function Jr(e,t,n=0){let o=G.map(s=>Math.abs(ot(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>Ir&&(a=Math.max(0,Math.min(G.length-1,a+(n>0?1:-1)))),G[a]}function Ha(e){return G[(G.indexOf(e)+1)%G.length]}function zr(e,t){return Math.min(e,t*Ur)}function re(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function un(e){let t=null,n=()=>{let o=re();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Gr=8,Vr=400;function Ba(e){let t=l("side"),n=l("sheet-handle"),o="peek",a=!1,s=0,r=0,c=0,u={y:0,t:0};function p(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,zr(g,p()))}function v(g){o=g,t.dataset.snap=g,m(ot(g,p()))}n.addEventListener("pointerdown",g=>{re()&&(a=!0,s=g.clientY,r=t.getBoundingClientRect().height,c=g.timeStamp,u={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!a)return;let Pe=r+(s-g.clientY),B=ot("peek",p()),D=ot("full",p());m(Math.max(B,Math.min(D,Pe))),u={y:g.clientY,t:g.timeStamp}});function _(g){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-s)>Gr)&&g.timeStamp-c<Vr){v(Ha(o));return}let B=g.timeStamp-u.t,D=B>0?(u.y-g.clientY)/B:0;v(Jr(t.getBoundingClientRect().height,p(),D))}n.addEventListener("pointerup",_),n.addEventListener("pointercancel",_),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),re()&&v(Ha(o)))});let P=un(e.onLayoutChange);function R(){if(P(),!re()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}v(o)}return window.addEventListener("resize",R),R(),{at:()=>re()?o:"full",atLeast(g){re()&&G.indexOf(g)>G.indexOf(o)&&v(g)}}}var Yr=[-79.9959,40.4406],Kr=12,Wr="#e2574c",x={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill",addedStops:"data-added-stops"},Le=Ea(location.search),xe=Ma(location.search);xe&&l("app").classList.add("embed");var qr={at:()=>"full",atLeast(){}},Ua=null,O=400,we=null,f=null,ie=null,Q=0,$={key:"downtown"},q=null,Ja=!1,ue=!1,ct="locations",de="area",za="count",lt=null,A=se,N=!1,y="dots",$e=!0,Ga,yn=[],i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Le.camera?[Le.camera.lon,Le.camera.lat]:Yr,zoom:Le.camera?.zoom??Kr,cooperativeGestures:Ra(window),attributionControl:{compact:!0}});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{Ln(i),eo(i),po(i,"change-dots"),bo(i,"change-dots"),Eo(i,"walk-fill"),ta(i),ha(i,"change-dots"),ko(i,"walk-fill"),Po(i,L),F(),i.on("click",t=>{if(N)return;if(Ja){ke({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(y==="places"){let s=i.queryRenderedFeatures(t.point,{layers:[M]})[0];s&&st(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>i.getLayoutProperty(s,"visibility")!=="none"),o=i.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];bn(a[1],a[0])}),i.on("mouseenter",M,()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave",M,()=>{i.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=kt();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(oo(n.properties,L(),o.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=oe();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(No(n.properties,o)).addTo(i)}),i.on("mouseleave",M,()=>e.remove()),i.on("mousemove",M,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(ka(n.properties,A,L())).addTo(i)}),pi(),i.on("moveend",()=>{let t=i.getCenter();Ua={lat:t.lat,lon:t.lng,zoom:i.getZoom()},b(),H()}),X(x.radius,t=>{O=Number(t.dataset.radius),Ot(i,O,L()).then(b),Be()&&At(i,O,L()).then(b),je()&&Ht(O).then(b),oe()&&rt(),f&&le(f.lat,f.lon)}),X(x.day,t=>{let n=t.dataset.day;Nn(n),y!=="journey"&&F(),Rt(i,n),Ft(i,n),y==="journey"&&f&&gn(f.lat,f.lon),ze()&&vo(i,n).then(b),ue&&oe()&&(rt(),f&&le(f.lat,f.lon)),Se()&&A==="service"&&tt(i,A,n),b()}),X(x.oneSeatDay,t=>{ue=t.dataset.oneseatDay==="selected",mn(),rt(),f&&le(f.lat,f.lon)}),X(x.view,t=>{let n=y;y=t.dataset.view,i.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),ni(y==="surface"||y==="both"),ai(y==="corridors"),li(y==="oneseat"),ii(y==="journey",n==="journey"),si(y==="places"),pn(U()&&$e),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),ri(y!=="corridors"&&y!=="journey"&&y!=="places");let o=y==="oneseat"||y==="journey";l("dest-controls").classList.toggle("hidden",!o),l("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),l("place-fill-controls").classList.toggle("hidden",y!=="places"),l("added-stops-controls").classList.toggle("hidden",!U()),U()||ja(!1),ce(),mn(),o||it(!1),Ya()}),X(x.dest,t=>{let n=t.dataset.dest;if(n==="pin"){it(!0);return}it(!1),ke({key:n})}),X(x.addedStops,t=>{$e=t.dataset.addedStops==="on",pn(U()&&$e)}),X(x.placeFill,t=>{A=t.dataset.placeFill,Se()&&tt(i,A,L()),F(),b(),mn()}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){ct=n.dataset.weight,b(),H();return}let o=t.target.closest("[data-surface-unit]");if(o){de=o.dataset.surfaceUnit,oi(de),H();return}let a=t.target.closest("[data-bucket]");a&&(to(i,a.dataset.bucket,L()),b())}),l("legend-reset").addEventListener("click",()=>{no(i,L()),b()}),l("legend-select").addEventListener("click",()=>ja(!N)),l("legend-clear").addEventListener("click",()=>{Pt(i),ce(),b(),H()}),l("legend-collapse").addEventListener("click",()=>{dn(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&ke({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&gi(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&st(a.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(za=s.dataset.sortPlaces,F());let r=t.target.closest("[data-goto-place]");r&&(y!=="places"&&V(x.view,"places"),st(r.dataset.gotoPlace))}),l("side-toggle").addEventListener("click",ei),xe&&un(dn),Ga=xe?qr:Ba({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),i.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:dn}),Qr(),dt(),ce(),ut(),Xr(Le)||Ot(i,O,L()).then(b),pn(U()&&$e),l("added-stops-controls").classList.toggle("hidden",!U()),yi(),mi()});function X(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),dt(),H()})})}function V(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Xr(e){let t=!1;return e.radius!==void 0&&(t=V(x.radius,String(e.radius))||t),e.day&&(t=V(x.day,e.day)||t),e.oneSeatRestricted!==void 0&&V(x.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(ct=e.weight),e.surfaceUnit&&(de=e.surfaceUnit),e.placeFill&&V(x.placeFill,e.placeFill),e.addedStops!==void 0&&V(x.addedStops,e.addedStops?"on":"off"),e.dest&&("key"in e.dest?V(x.dest,e.dest.key):ke(e.dest)),e.selection&&qn(i,e.selection),e.view&&V(x.view,e.view),e.at&&bn(e.at.lat,e.at.lon),e.place&&st(e.place),t}function H(){let e={view:y,day:L(),radius:O,oneSeatRestricted:ue,weight:ct,surfaceUnit:de,dest:$,at:f,camera:Ua,place:lt,placeFill:A,selection:Yn(),addedStops:$e},t=Ta(e);history.replaceState(null,"",(xe?Aa(t):t)+location.hash),ut(t)}function ut(e=Fa(location.search)){if(!xe)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?ie?ye(ie):"this point":null;t.querySelector(".el-action").textContent=Na(n)}function dt(){l("statebar").innerHTML=Pa({view:y,day:L(),radius:O,oneSeatRestricted:ue,destination:_e()}),Zr()}function dn(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Qr(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Zr(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(_a(y)))}function ei(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),i.resize()}function b(){ti()}function ti(){if(l("legend-reset").classList.toggle("hidden",jt()||Yt()||Zt()||Se()),Zt()){l("legend").innerHTML=ra(Xe());return}if(Se()){l("legend").innerHTML=$a({selected:pa(),fill:A,day:L(),boundaries:an(),unchanged:ma()});return}if(jt()){let n=ze();n&&jo(l("legend"),n);return}if(Yt()){let n=oe();if(!n)return;let o=i.getBounds();Io(l("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=kt();if(!e)return;let t=i.getBounds();Jo(l("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:ct,surface:Mt()?Be():null,unit:de,population:je(),selection:Vn(),added:Lo()?zt():null})}async function ni(e){if(e&&!Be()){l("legend").classList.add("loading");try{await At(i,O,L())}finally{l("legend").classList.remove("loading")}}mo(i,e),e&&de==="people"&&await Va(),b()}async function Va(){if(!je()){l("legend").classList.add("loading");try{await Ht(O)}finally{l("legend").classList.remove("loading")}}}async function oi(e){e==="people"&&Mt()&&await Va(),b()}async function pn(e){if(e&&!zt())try{await xo(i)}catch(t){console.error("added stops failed to load",t);return}_o(i,e),b()}async function ai(e){if(e&&!ze()){l("legend").classList.add("loading");try{await It(i,L())}finally{l("legend").classList.remove("loading")}}So(i,e),b()}async function si(e){if(e&&(!on()||!an())){l("legend").classList.add("loading");try{await Promise.all([fa(),ba(i)])}finally{l("legend").classList.remove("loading")}}Sa(i,e),e&&tt(i,A,L()),e&&F(),b()}async function st(e){lt=await fn(()=>va(i,e))?e:null,y==="places"&&(F(),lt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),H()}function ri(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),ut(),y==="places"){l("panel").innerHTML=wa(on()??[],za,lt,A);return}if(!ie){y==="oneseat"?l("panel").innerHTML=Jn(_e()):Hn(l("panel"));return}if(y==="oneseat"){let t=Un(ie,$,L());if(t){l("panel").innerHTML=t;return}}In(ie)}function ii(e,t=!1){if(na(i,e),b(),!e){t&&(f?le(f.lat,f.lon):F());return}Xe()&&f?l("panel").innerHTML=tn(Xe(),_e()):l("panel").innerHTML=sa(_e())}async function gn(e,t){let n=++Q;f={lat:e,lon:t},H(),Wa(e,t);let o=Ka(),a=d(_e());if(!o){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await w(oa({lat:e,lon:t},o,L()));if(n!==Q)return;en(i,s),l("panel").innerHTML=tn(s,a),b(),ut()}catch(s){if(n!==Q)return;en(i,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function mn(){l("day-controls").classList.toggle("hidden",!Ao(y,ue,A))}function hn(){return Mo(ue,L())}async function li(e){e&&!oe()&&await fn(()=>Kt(i,O,$,hn())),Fo(i,e),b()}async function rt(){await fn(()=>Kt(i,O,$,hn())),b()}async function fn(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function ke(e){if($=e,it(!1),ci(),Ya(),dt(),H(),y==="journey"){f&&gn(f.lat,f.lon),b();return}f?le(f.lat,f.lon):F({scrollToTop:!0}),rt()}function Ya(){let e=Ka();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in $))){q?.remove(),q=null;return}q?q.setLngLat([e.lon,e.lat]).addTo(i):(q=new maplibregl.Marker({color:Vt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(i),q.on("dragend",()=>{let n=q.getLngLat();ke({lat:n.lat,lon:n.lng})}))}function ci(){let e=Co($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Ka(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=yn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function _e(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return yn.find(t=>t.key===e)?.name??e}function it(e){Ja=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function le(e,t){let n=++Q;f={lat:e,lon:t},H(),l("panel").classList.add("loading"),Wa(e,t);try{let o="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",a=await w(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${O}${o}&oneseat_day=${hn()}`);if(n!==Q)return;$n(i,e,t,O,a.current.stops,a.proposed.stops),ui(),ie=a,F({scrollToTop:!0})}catch(o){if(n!==Q)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===Q&&l("panel").classList.remove("loading")}}function ui(){l("pin-key").innerHTML=Uo(O),l("pin-key").classList.remove("hidden")}function Wa(e,t){we?we.setLngLat([t,e]):(we=new maplibregl.Marker({color:Wr,draggable:!0}).setLngLat([t,e]).addTo(i),we.on("dragend",()=>{let n=we.getLngLat();bn(n.lat,n.lng)}))}var at=14;function U(){return y==="dots"||y==="both"}function ja(e){N=e&&U(),N?i.dragPan.disable():i.dragPan.enable(),i.getCanvas().style.cursor=N?"none":"",N||qa(),ce()}function ce(){let e=l("legend-select");e.classList.toggle("hidden",!U()),e.setAttribute("aria-pressed",String(N)),e.textContent=N?"Selecting":"Select stops",l("legend-clear").classList.toggle("hidden",!U()||!Kn())}function di(e,t){let n=l("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!N}function Ia(e){l("brush").classList.toggle("painting",e)}function qa(){l("brush").hidden=!0}function pi(){let e=l("brush");e.style.width=`${at*2}px`,e.style.height=`${at*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,ce(),b()}))},s=()=>{N&&(t=!0,n=!1,Ia(!0))},r=u=>{if(di(u.point.x,u.point.y),!t)return;n=!0,_t(i,Dt(i,u.point.x,u.point.y,at))&&a()},c=u=>{if(Ia(!1),!!t){if(t=!1,!n){let[p]=Dt(i,u.point.x,u.point.y,at);p&&Wn(i,p)}ce(),b(),H()}};i.on("mousedown",s),i.on("mousemove",r),i.on("mouseup",c),i.getCanvas().addEventListener("mouseleave",qa),i.on("touchstart",s),i.on("touchmove",r),i.on("touchend",c)}function bn(e,t){if(Ga.atLeast("half"),y==="journey"){gn(e,t);return}y!=="places"&&le(e,t)}async function mi(){try{yn=await w("/api/destinations"),dt()}catch{}}async function yi(){try{let e=await w("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function gi(e){l("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
