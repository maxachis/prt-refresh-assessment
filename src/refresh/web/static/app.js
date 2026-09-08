"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Q(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function ut(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function dt(e){return e>0?`+${e}`:String(e)}function mn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var za="#4aa3ff",Ga="#ffa23a";function Ka(e,t,n,o=96){let a=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let l=0;l<=o;l++){let u=l/o*2*Math.PI;a.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function Z(e){return{type:"FeatureCollection",features:e}}function yn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function gn(e){e.addSource("walk",{type:"geojson",data:Z([])}),e.addSource("stops-now",{type:"geojson",data:Z([])}),e.addSource("stops-prop",{type:"geojson",data:Z([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Ga,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":za,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function hn(e,t,n,o,a,s){e.getSource("walk").setData(Z([Ka(t,n,o)])),e.getSource("stops-now").setData(Z(yn(a,"current"))),e.getSource("stops-prop").setData(Z(yn(s,"proposed")))}var O=["weekday","saturday","sunday"],pt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],fn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},_e=4,bn=e=>4+_e*e,vn=e=>5+_e*e,ge=e=>6+_e*e,Wa=e=>7+_e*e,wn=2,Ya=3,mt=e=>e[Ya],I=(e,t)=>e[t],Sn=(e,t)=>e[Wa(t)],yt=e=>2+2*e,gt=e=>3+2*e,Pe=4,Ln=e=>2+Pe*e,$n=e=>3+Pe*e,kn=e=>4+Pe*e,xn=e=>5+Pe*e;var ft="weekday";function L(){return ft}function Tn(e){ft=e}function En(e){e.innerHTML=`
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
    </div>`}function Va(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function qa(e,t){let n=Math.max(1,...pt.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return pt.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,r=s-a,l=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${fn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${l}">${r===0?"\xB7":dt(r)}</td>
      </tr>`}).join("")}function Cn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function _n(e){return e.first==null?'<span class="muted">no service</span>':`${Q(e.first)}\u2013${Q(e.last)}`}function Pn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Xa={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Qa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Za(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Re(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${Xa[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Qa[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${De("one-seat")}</p>
    </div>`:""}function De(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Oe(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function On(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Dn(e){return e.first==null||e.last==null?null:e.last-e.first}function Re(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Rn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Rn(t,n,"prop")}</div>
    </div>`}function Rn(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${d(o)}</span>`).join(" "):'<span class="muted">none</span>'}var ht=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,es="Allegheny";function he(e){let t=e.place?.muni?.trim()??"",n=ht.exec(t)?.[1],o=n===es?t.replace(ht,""):n?`${t.replace(ht,"")} (${n})`:t;return e.place?.hood||o||"this location"}function bt(e){return e==="weekday"?"weekday":e}function Mn(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${bt(t)}`}function ts(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${bt(t)}, today only</span>`}${o}</dd>`}function ns(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${De("boardings")}</p>`}function os(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${De("place-population")}</p>
    </div>`}function vt(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,r=s>0?"up":s<0?"down":"flat",l=Pn(o),u=Pn(a),p=Dn(o),m=Dn(a);return`
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
        ${s===0?"no change":`${dt(s)} trips`}
        <div class="muted">${mn(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${bt(t)}, both directions</div>

    <div class="tiers">${Va(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${qa(o,a)}</tbody>
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
      ${Oe(_n(o),_n(a))}
      <dt>Hours between</dt>
      ${Oe(ut(p),ut(m),On(p,m,"more"))}
      <dt>Typical wait</dt>
      ${Oe(l==null?"\u2014":`${l} min`,u==null?"\u2014":`${u} min`,On(l,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Oe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${ts(o.boardings,t)}
    </dl>
    ${ns(o.boardings)}

    ${n}

    ${os(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Re(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${De("location-not-route")}</p>
    </div>`}function Fn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(he(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${vt(e,ft,Za(e.oneseat??[],e.oneseat_day??"any"))}`}var as={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},ss={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},rs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function is(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function wt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Cn(t)}</div>`:""}function ls(e){let t=wt("kept",e.kept)+wt("lost",e.lost)+wt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function cs(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Re(e.current,e.proposed)}
    </div>`}function us(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${d(a.key)}">
      <span class="os-name">${d(a.name)}</span>
      <span class="os-status ${d(a.status)}">${ds[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var ds={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function ps(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${rs[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Nn(e,t,n){let o=is(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":ls(o)+cs(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(he(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${as[o.status]}</div>
    <p class="note">${ss[o.status]} ${ps(a)}</p>

    ${s}

    ${us(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Mn(e,n)}</summary>
      ${vt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function An(e){return`
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
    </div>`}var Ce={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},fe="change",ne="change-dots",Te=["boolean",["feature-state","selected"],!1],ms="#15181e",St="change-new-place-rings",Bn=["==",["get","published"],0],ys="#15181e",gs={9:1.4,12:2.2,16:3.4},Ee=null,ee=new Set,E=new Set;function Lt(){return Ee}function $t(e){return ee.has(e)}function Hn(e,t,n,o){return a=>bs(a,e,t,n,o)}function jn(e){return t=>e.has(mt(t))}function In(){return E}function Un(){return[...E].sort()}function Jn(){return E.size}function kt(e,t){let n=0;for(let o of t)E.has(o)||(E.add(o),be(e,o,!0),n++);return n}function zn(e,t){E.delete(t)?be(e,t,!1):(E.add(t),be(e,t,!0))}function Gn(e,t){xt(e),kt(e,t)}function xt(e){for(let t of E)be(e,t,!1);E.clear()}function be(e,t,n){try{e.setFeatureState({source:fe,id:t},{selected:n})}catch{}}function hs(e){for(let t of E)be(e,t,!0)}function fs(e,t,n,o){let a=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=a).map(s=>s.id)}function _t(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],s=e.queryRenderedFeatures(a,{layers:[ne]}).filter(r=>r.id!==void 0).map(r=>{let[l,u]=r.geometry.coordinates,p=e.project([l,u]);return{id:r.id,x:p.x,y:p.y}});return fs(t,n,o,s)}function Kn(e,t,n,o){let a={};for(let s of n)a[s]=0;for(let s of e){if(!o(s))continue;let r=n[I(s,ge(t))];r!==void 0&&a[r]++}return a}function Wn(e,t){let n=0;for(let o of e)t(o)&&I(o,wn)===0&&n++;return n}function bs(e,t,n,o,a){let s=I(e,0),r=I(e,1);return s>=n&&s<=a&&r>=t&&r<=o}function Yn(e,t,n,o){let a={riders:{},measured:{},unmeasured:0};for(let s of n)a.riders[s]=0,a.measured[s]=0;for(let s of e){if(!o(s))continue;let r=n[I(s,ge(t))];if(r===void 0)continue;let l=Sn(s,t);if(l===null){r!=="none"&&a.unmeasured++;continue}a.riders[r]+=l,a.measured[r]++}return a}function vs(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>O.some((o,a)=>t[I(n,ge(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:mt(n),published:n[2],...Object.fromEntries(O.flatMap((o,a)=>[[`b${a}`,t[I(n,ge(a))]],[`c${a}`,n[bn(a)]],[`p${a}`,n[vn(a)]]]))}}))}}function te(e,t){let n=Object.entries(Ce).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Ce.none[t]]}function Vn(e){return["interpolate",["linear"],["zoom"],9,["*",te(e,"size"),.45],12,te(e,"size"),16,["*",te(e,"size"),1.9]]}function qn(e){let t=(n,o)=>["+",["*",te(e,"size"),o],gs[n]];return["interpolate",["linear"],["zoom"],9,t(9,.45),12,t(12,1),16,t(16,1.9)]}function Xn(e){e.addSource(fe,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ne,type:"circle",source:fe,paint:{"circle-color":te(0,"color"),"circle-radius":Vn(0),"circle-opacity":.85,"circle-stroke-color":["case",Te,ms,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",Te,1.6,.5],12,["case",Te,2.4,1],16,["case",Te,3.2,1.6]]}},"walk-fill"),e.addLayer({id:St,type:"circle",source:fe,filter:Bn,paint:{"circle-color":"rgba(0,0,0,0)","circle-radius":qn(0),"circle-stroke-color":ys,"circle-stroke-opacity":.55,"circle-stroke-width":["interpolate",["linear"],["zoom"],9,.6,12,1,16,1.4]}},ne)}async function Pt(e,t,n){return Ee=await S(`/api/change?radius=${t}`),e.getSource(fe).setData(vs(Ee)),hs(e),Ot(e,n),Ee}function Ot(e,t){let n=O.indexOf(t);e.setPaintProperty(ne,"circle-color",te(n,"color")),e.setPaintProperty(ne,"circle-radius",Vn(n)),e.setPaintProperty(St,"circle-radius",qn(n)),Dt(e,t)}function Qn(e,t,n){ee.has(t)?ee.delete(t):ee.add(t),Dt(e,n)}function Zn(e,t){ee.clear(),Dt(e,t)}function Dt(e,t){let n=O.indexOf(t),o=["none",...ee],a=["!",["in",["get",`b${n}`],["literal",o]]];e.setFilter(ne,a),e.setFilter(St,["all",a,Bn])}function eo(e,t,n){let o=O.indexOf(t),a=e[`b${o}`],s=n.find(p=>p.key===a)?.label??a,r=e[`c${o}`],l=e[`p${o}`];return`<b>${s}</b><br>${r} \u2192 ${l} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Rt="surface",Fe="surface-fill",to="#6b7280",Tt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,to],[.138,to],[1,"#bd60e7"],[2,"#961bed"]],R="#e8232f",T="#0f79c9",no=2,Me=null,oo=!1;function Ne(){return Me}function Et(){return oo}function ao(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-no,Math.min(no,n))}function so(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function ro(e,t,n,o,a,s,r,l){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=r.lat0+(p[1]+.5)*r.dlat,v=r.lon0+(p[0]+.5)*r.dlon;if(m<o||m>s||v<n||v>a)continue;let k=p[yt(t)],x=p[gt(t)],j=so(k,x);if(j!=="none")if(j==="ramp"){let g=ao(k,x);u[g<-.138?"less":g>.138?"more":"same"]+=l}else u[j]+=l}return u}function ws(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*o,l=r+o,u=n+s[0]*a,p=u+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[p,r],[p,l],[u,l],[u,r]]]},properties:Object.fromEntries(O.flatMap((m,v)=>{let k=s[yt(v)],x=s[gt(v)];return[[`k${v}`,so(k,x)],[`v${v}`,ao(k,x)??0]]}))}})}}function io(e){return["case",["==",["get",`k${e}`],"gone"],R,["==",["get",`k${e}`],"new"],T,["interpolate",["linear"],["get",`v${e}`],...Tt.flatMap(([t,n])=>[t,n])]]}function oe(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function lo(e,t){e.addSource(Rt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Fe,type:"fill",source:Rt,layout:{visibility:"none"},paint:{"fill-color":io(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,oe(0,.85),13,oe(0,.62),16,oe(0,.45)]}},t)}async function Ct(e,t,n){return Me=await S(`/api/surface?radius=${t}`),e.getSource(Rt).setData(ws(Me)),Mt(e,n),Me}function Mt(e,t){let n=O.indexOf(t);e.setPaintProperty(Fe,"fill-color",io(n)),e.setPaintProperty(Fe,"fill-opacity",["interpolate",["linear"],["zoom"],9,oe(n,.85),13,oe(n,.62),16,oe(n,.45)])}function co(e,t){oo=t,e.setLayoutProperty(Fe,"visibility",t?"visible":"none")}var Ft=null;function Ae(){return Ft}async function Nt(e){return Ft=await S(`/api/population?radius=${e}`),Ft}function uo(e,t,n,o,a,s,r){let l={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;p<o||p>s||m<n||m>a||(l.lost+=u[Ln(t)],l.gained+=u[$n(t)],l.kept+=u[kn(t)],l.none+=u[xn(t)])}return l}var At="corridor",po="corridor-lines",je="#8b929c",Ss="#6f7783",He={lost:R,added:T,kept:je};var Be=null,mo=!1;function Ie(){return Be}function Bt(){return mo}function Ls(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function yo(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function $s(){let e=t=>["match",["get","klass"],"lost",He.lost,"added",He.added,t];return["interpolate",["linear"],["zoom"],9,e(Ss),14,e(je)]}function ks(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function xs(){return["match",["get","klass"],"kept",.85,.9]}function go(e,t){e.addSource(At,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:po,type:"line",source:At,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":$s(),"line-width":ks(),"line-opacity":xs()}},t)}async function Ht(e,t){return Be=await S(`/api/corridors?day=${t}`),e.getSource(At).setData(Ls(Be)),Be}async function ho(e,t){O.includes(t)&&await Ht(e,t)}function fo(e,t){mo=t,e.setLayoutProperty(po,"visibility",t?"visible":"none")}var It="#2b3038",bo="#b9bec6",ve={loses:{color:R,size:6},gains:{color:T,size:6},keeps:{color:je,size:3},here:{color:It,size:3.5},none:{color:bo,size:1.8}},Je=["loses","gains","keeps","none","here"],jt="oneseat",vo="oneseat-dots",Ue=null,wo=!1;function ae(){return Ue}function Ut(){return wo}function So(e,t,n,o,a,s){let r={};for(let l of t)r[l]=0;for(let l of e){let u=l[0],p=l[1];if(u<o||u>s||p<n||p>a)continue;let m=t[l[3]];m!==void 0&&r[m]++}return r}function _s(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Ps(){return["match",["get","status"],...Object.entries(ve).flatMap(([e,t])=>[e,t.color]),bo]}function Os(){let e=["match",["get","status"],...Object.entries(ve).flatMap(([t,n])=>[t,n.size]),ve.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Lo(e,t){e.addSource(jt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vo,type:"circle",source:jt,layout:{visibility:"none"},paint:{"circle-color":Ps(),"circle-radius":Os(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ds(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Rs="pin";function $o(e){return"key"in e?e.key:Rs}var ze="any";function Ts(e,t,n){return`radius=${e}&${Ds(t)}&day=${n}`}function ko(e,t){return e?t:ze}function xo(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function Jt(e,t,n,o=ze){return Ue=await S(`/api/oneseat?${Ts(t,n,o)}`),e.getSource(jt).setData(_s(Ue)),Ue}function _o(e,t){wo=t,e.setLayoutProperty(vo,"visibility",t?"visible":"none")}function zt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Po(e,t){let n=t.statuses.find(l=>l.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=l=>l.length?l.join(", "):"none",r=zt(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var Gt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Es(e){return e.buckets.filter(t=>t.key!=="none")}var Oo={area:"Ground",people:"People"};function Cs(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=ro(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Ms(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=uo(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(a.lost)}</b> people lose all service</span>
        <span><b>${s(a.gained)}</b> gain service</span>
        <span><b>${s(a.kept)}</b> keep a bus</span>
        <span><b>${s(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Fs=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function Ns(e){let{layer:t,day:n,bounds:o,unit:a,population:s,scoped:r=!1}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Tt.map(([u,p])=>`${p} ${((u+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${R}"></i>loses all service</span>
        <span><i style="background:${T}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Oo).map(u=>`
          <button data-surface-unit="${u}" aria-pressed="${a===u}"
                  class="${a===u?"active":""}">${Oo[u]}</button>`).join("")}
      </div>
      ${r?Fs:a==="people"?Ms(n,o,s):Cs(t,n,o)}
    </div>`}var As=["lost","added","kept"],Bs={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Hs={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Ro(e,t){let{lostPct:n,addedPct:o}=yo(t.km),a=l=>l.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${Hs[t.day]}
    </div>
    ${As.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${He[l]}"></i>
        <span class="lg-lab">${d(Bs[l])}</span>
        <span class="lg-n">${a(t.km[l])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${a(n)}%</b> of today's pavement lost</span>
      <span><b>${a(o)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A street either has a bus on it or it doesn't, so
      there is no walk radius here. A street can lose its only bus while the
      block beside it keeps one: for what a rider can still reach on foot, see
      Locations or Surface.</div>`}function To(e,t,n){let o=t.statuses.map(m=>m.key),a=So(t.points,o,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(v=>v.key===m)?.label??m,r=Je.reduce((m,v)=>m+(a[v]??0),0),l=zt(t),u=t.day&&t.day!==ze,p=u?`Restricted to routes running on ${Gt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(l)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${Gt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Je.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${ve[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Je.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(l)} without transferring?
      ${p} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function Eo(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Do={locations:"Locations",riders:"Riders"};function js(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained."}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Is(){return`<div class="lg-foot">Dots mark today's stops, plus the places the plan
    puts a stop where none stands within 150 m. A stop added right beside an
    existing one changes a dot's colour rather than adding one; Streets colours
    the pavement itself, and shows the rest.</div>`}function Us(e){return e<1?"":`
    <div class="lg-row lg-static lg-key">
      <i class="lg-ring"></i>
      <span class="lg-lab">New stop location</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </div>`}function Co(e,t){let{layer:n,day:o,bounds:a,weight:s,surface:r,unit:l="area",population:u,selection:p}=t,m=n.buckets.map(w=>w.key),v=n.days.indexOf(o),{west:k,south:x,east:j,north:g}=a,G=Es(n),_=p&&p.size>0?p:null,K=_?jn(_):Hn(k,x,j,g),ct=Kn(n.points,v,m,K),W=s==="riders"?Yn(n.points,v,m,K):null,Ia=w=>W?W.measured[w]?Math.round(W.riders[w]).toLocaleString():"\u2014":ct[w].toLocaleString(),Ua=_?`at ${_.size.toLocaleString()} selected stop${_.size===1?"":"s"}`:"in view",Ja=W?`<b>${Math.round(G.reduce((w,ye)=>w+W.riders[ye.key],0)).toLocaleString()}</b> daily boardings ${Ua}`:_?`<b>${G.reduce((w,ye)=>w+ct[ye.key],0).toLocaleString()}</b>
         of ${_.size.toLocaleString()} selected stops`:`<b>${G.reduce((w,ye)=>w+ct[ye.key],0).toLocaleString()}</b>
         locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${Ja}
      <span class="muted">\xB7 ${Gt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Do).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${Do[w]}</button>`).join("")}
    </div>
    ${G.map(w=>`
      <button class="lg-row ${$t(w.key)?"off":""}" data-bucket="${d(w.key)}"
              aria-pressed="${!$t(w.key)}">
        <i style="background:${Ce[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(w.label)}</span>
        <span class="lg-n">${Ia(w.key)}</span>
      </button>`).join("")}
    ${Us(Wn(n.points,K))}
    ${r?Ns({layer:r,day:o,bounds:a,unit:l,population:u,scoped:!!_}):""}
    ${W?js(W.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both
      directions \u2014 counting locations, not riders.</div>`}
    ${Is()}
    ${_?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Kt="#4aa3ff",jo="#ffa23a",Wt="headline",Ge="journey",Io="journey-rides",Uo="journey-walks",Js=[Io,Uo],Jo=null,zo=!1;function We(){return Jo}function Yt(){return zo}function zs(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let r of s.legs){let l=r.from??e.origin,u=r.to??e.destination,p=[[l.lon,l.lat],[u.lon,u.lat]],m=r.path?.length?r.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:o}}function Mo(){return["match",["get","side"],"current",Kt,"proposed",jo,Kt]}function Fo(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Go(e,t){e.addSource(Ge,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Io,type:"line",source:Ge,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Mo(),"line-width":Fo(1),"line-opacity":.85}},t),e.addLayer({id:Uo,type:"line",source:Ge,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Mo(),"line-width":Fo(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Ko(e,t){zo=t;for(let n of Js)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Vt(e,t){Jo=t;let n=t?zs(t,Wt):{type:"FeatureCollection",features:[]};e.getSource(Ge).setData(n)}function Wo(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var No=e=>`${e.toFixed(1)} min`;function Yo(e){return e==null?"\u2014":e===0?"no change":e>0?`${No(e)} slower`:`${No(-e)} faster`}function Ao(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function Gs(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Ao(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Ao(e.to,"the destination")}</span></div>`}function Bo(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Gs(a,t)),o=a}return n.join("")}var Ks={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Ke(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Ws(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Ys(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Ke(t.current)} \u2192
        ${Ke(t.proposed)} min</span>
        <span class="muted">${Yo(t.change_min)}</span></div>
      ${o}
    </div>`}function Ho(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function qt(e,t){let n=e.radii[Wt],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${Q(e.window.start_min)}
        and ${Q(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Ks[n.classification]??""}</p>
      </div>
      ${Ho(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Ke(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Ke(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Yo(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Ws(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Bo(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Bo(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Ys(e)}
    ${Ho(e)}`}function Vo(e){return`
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
    </div>`}function qo(e){let t=e?e.radii[Wt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Kt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${jo}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var qe="places",Zo="places-points",Xt="places-boundaries",C="places-fill",re="lost",Vs=100,qs={lost:"share_lost",gained:"share_gained"};function J(e,t){return`service_${e}_${t}`}var ea={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Xs="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Y={lost:R,gained:T},Ye=null,U=null,se=null,ta=!1,Ve=null;function Qt(){return Ye}function na(){return U}function oa(){return Ve}function Zt(){return se}function we(){return ta}function Qs(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function Zs(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function er(e){return Math.max(e.residents_lost,e.residents_gained)}var Xo=4,tr=16,nr=1e3;function or(e){let t=Math.min(1,Math.sqrt(e/nr));return Xo+t*(tr-Xo)}function ar(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Zs(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:or(er(t))}}))}}function sr(){return["match",["get","klass"],"lost",Y.lost,"gained",Y.gained,Y.lost]}function rr(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var B=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var H=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function aa(e,t){return e==="service"?["step",["abs",["coalesce",["get",J(t,"pct")],0]],H[0].opacity,H[0].max,H[1].opacity,H[1].max,H[2].opacity,H[2].max,H[3].opacity]:["step",["coalesce",["get",qs[e]],0],B[0].opacity,Number.EPSILON,B[1].opacity,B[1].max,B[2].opacity,B[2].max,B[3].opacity,B[3].max,B[4].opacity]}function sa(e,t){return e==="service"?["case",[">=",["coalesce",["get",J(t,"pct")],0],0],T,R]:Y[e]}function ir(e,t){let n=J(t,"now"),o=J(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var lr=3;function cr(e){if(e.length===0)return"";let t=e.slice(0,lr),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function ra(e,t){e.addSource(Xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:C,type:"fill",source:Xt,layout:{visibility:"none"},paint:{"fill-color":sa(re),"fill-opacity":aa(re),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(qe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Zo,type:"circle",source:qe,layout:{visibility:"none"},paint:{"circle-color":sr(),"circle-radius":rr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Xe(e,t,n){e.setPaintProperty(C,"fill-color",sa(t,n)),e.setPaintProperty(C,"fill-opacity",aa(t,n))}async function ia(){return Ye||(Ye=await S("/api/places")),Ye}async function la(e){return se||(se=await S("/api/boundaries"),e.getSource(Xt).setData(se)),se}function ur(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function ca(e,t){let n=ur(se,t);if(n)return U=null,Ve=n,e.getSource(qe)?.setData({type:"FeatureCollection",features:[]}),null;try{U=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return U=null,Ve=null,null}return Ve=null,e.getSource(qe).setData(ar(U)),e.flyTo({center:[U.lon,U.lat],zoom:13}),U}function ua(e,t){ta=t,e.setLayoutProperty(Zo,"visibility",t?"visible":"none"),e.setLayoutProperty(C,"visibility",t?"visible":"none")}function dr(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var pr="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function da(e,t,n,o){let a=Qs(e,t).map(s=>dr(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Xs}</p>
    ${o==="service"?`<p class="note">${pr}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function pa(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function mr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function yr(e,t,n,o){let a=H.map((u,p)=>({band:u,prevMax:p===0?0:H[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=mr(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${R};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=o?ir(o,n):[],r=cr(s),l=r?`<div class="lg-foot">${d(r)}</div>`:"";return`
    ${pa(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(ea[n])}</div>
    ${a}
    ${l}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ma({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return yr(e,a??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",r=B.filter(l=>l.opacity>0).map(l=>`
    <div class="lg-row lg-static">
      <i style="background:${Y[t]};opacity:${l.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(l.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${pa(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Y.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Y.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function gr(e,t){let n=e[J(t,"now")],o=e[J(t,"proposed")],a=e[J(t,"pct")],s=e[J(t,"rail_proposed")],r=ea[t];if(o===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${r} (0 \u2192 ${o} trips).`;let l=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${r} (${l}).`}function ya(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${gr(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=Qo("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Qo("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[a,s]:[s,a]).filter(l=>l!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Qo(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${Vs} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var en=" \xB7 ",tn={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},ga=Object.keys(tn);function ha(e){return tn[e]??e}var hr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},fr=["oneseat","journey"];function br(e){return e!=="journey"}function vr(e){let t=[tn[e.view]??e.view];return e.view==="places"?t[0]:(fr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":hr[e.day]),br(e.view)&&t.push(`${e.radius} m walk`),t.join(en))}function fa(e){let[t,...n]=vr(e).split(en);return`<b>${d(t)}</b>${n.map(o=>en+d(o)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},wr=/^[cp]:[\w.:-]{1,32}$/,Qe={any:"any",selected:"selected"},Sr="pin",ba=5;function wa(e){try{return e.self!==e.top}catch{return!0}}function Sa(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?Qe.selected:Qe.any),t.set(h.dest,"key"in e.dest?e.dest.key:nn(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,nn(e.at)),e.camera&&t.set(h.camera,`${nn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==re&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),`?${t}`}function La(e){let t=new URLSearchParams(e),n={},o=t.get(h.view);o&&ga.includes(o)&&(n.view=o);let a=t.get(h.day);a&&O.includes(a)&&(n.day=a);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(h.oneSeatDay);r===Qe.selected?n.oneSeatRestricted=!0:r===Qe.any&&(n.oneSeatRestricted=!1);let l=t.get(h.dest);if(l&&l!==Sr){let x=va(l);x?n.dest=x:l.includes(",")||(n.dest={key:l})}let u=va(t.get(h.at));u&&(n.at=u);let p=Lr(t.get(h.camera));p&&(n.camera=p);let m=t.get(h.place);m&&(n.place=m);let v=t.get(h.selection);v!==null&&(n.selection=v.split(",").filter(x=>wr.test(x)));let k=t.get(h.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function nn(e){return`${e.lat.toFixed(ba)},${e.lon.toFixed(ba)}`}function va(e){let t=$a(e,2);return t?{lat:t[0],lon:t[1]}:null}function Lr(e){let t=$a(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function $a(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var on="embed";var $r=["1","true","yes"];function ka(e){let t=new URLSearchParams(e).get(on);return t!==null&&$r.includes(t.toLowerCase())}function xa(e){let t=new URLSearchParams(e);return t.set(on,"1"),`?${t}`}function _a(e){let t=new URLSearchParams(e);t.delete(on);let n=String(t);return n?`?${n}`:""}function Pa(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var z=["peek","half","full"],kr=192,xr=.3,_r=.55,Pr=.9,Or=.6,Dr=.45;function Ze(e,t){return e==="peek"?Math.min(kr,t*xr):e==="half"?t*_r:t*Pr}function Rr(e,t,n=0){let o=z.map(s=>Math.abs(Ze(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>Or&&(a=Math.max(0,Math.min(z.length-1,a+(n>0?1:-1)))),z[a]}function Oa(e){return z[(z.indexOf(e)+1)%z.length]}function Tr(e,t){return Math.min(e,t*Dr)}function ie(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function an(e){let t=null,n=()=>{let o=ie();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Er=8,Cr=400;function Da(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,s=0,r=0,l=0,u={y:0,t:0};function p(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,Tr(g,p()))}function v(g){o=g,t.dataset.snap=g,m(Ze(g,p()))}n.addEventListener("pointerdown",g=>{ie()&&(a=!0,s=g.clientY,r=t.getBoundingClientRect().height,l=g.timeStamp,u={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!a)return;let G=r+(s-g.clientY),_=Ze("peek",p()),K=Ze("full",p());m(Math.max(_,Math.min(K,G))),u={y:g.clientY,t:g.timeStamp}});function k(g){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-s)>Er)&&g.timeStamp-l<Cr){v(Oa(o));return}let _=g.timeStamp-u.t,K=_>0?(u.y-g.clientY)/_:0;v(Rr(t.getBoundingClientRect().height,p(),K))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),ie()&&v(Oa(o)))});let x=an(e.onLayoutChange);function j(){if(x(),!ie()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}v(o)}return window.addEventListener("resize",j),j(),{at:()=>ie()?o:"full",atLeast(g){ie()&&z.indexOf(g)>z.indexOf(o)&&v(g)}}}var Mr=[-79.9959,40.4406],Fr=12,Nr="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},Le=La(location.search),ke=ka(location.search);ke&&c("app").classList.add("embed");var Ar={at:()=>"full",atLeast(){}},Ea=null,P=400,Se=null,f=null,ce=null,X=0,$={key:"downtown"},V=null,Ca=!1,pe=!1,rt="locations",me="area",Ma="count",at=null,M=re,N=!1,y="dots",Fa,ln=[],i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Le.camera?[Le.camera.lon,Le.camera.lat]:Mr,zoom:Le.camera?.zoom??Fr,cooperativeGestures:wa(window),attributionControl:{compact:!0}});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{gn(i),Xn(i),lo(i,"change-dots"),go(i,"change-dots"),Lo(i,"walk-fill"),Go(i),ra(i,"change-dots"),F(),i.on("click",t=>{if(N)return;if(Ca){$e({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(y==="places"){let s=i.queryRenderedFeatures(t.point,{layers:[C]})[0];s&&tt(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>i.getLayoutProperty(s,"visibility")!=="none"),o=i.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];pn(a[1],a[0])}),i.on("mouseenter",C,()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave",C,()=>{i.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=Lt();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(eo(n.properties,L(),o.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=ae();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Po(n.properties,o)).addTo(i)}),i.on("mouseleave",C,()=>e.remove()),i.on("mousemove",C,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(ya(n.properties,M,L())).addTo(i)}),Zr(),i.on("moveend",()=>{let t=i.getCenter();Ea={lat:t.lat,lon:t.lng,zoom:i.getZoom()},b(),A()}),le(D.radius,t=>{P=Number(t.dataset.radius),Pt(i,P,L()).then(b),Ne()&&Ct(i,P,L()).then(b),Ae()&&Nt(P).then(b),ae()&&nt(),f&&ue(f.lat,f.lon)}),le(D.day,t=>{let n=t.dataset.day;Tn(n),y!=="journey"&&F(),Ot(i,n),Mt(i,n),y==="journey"&&f&&cn(f.lat,f.lon),Ie()&&ho(i,n).then(b),pe&&ae()&&(nt(),f&&ue(f.lat,f.lon)),we()&&M==="service"&&Xe(i,M,n),b()}),le(D.oneSeatDay,t=>{pe=t.dataset.oneseatDay==="selected",rn(),nt(),f&&ue(f.lat,f.lon)}),le(D.view,t=>{let n=y;y=t.dataset.view,i.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),Jr(y==="surface"||y==="both"),Gr(y==="corridors"),Vr(y==="oneseat"),Yr(y==="journey",n==="journey"),Kr(y==="places"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),Wr(y!=="corridors"&&y!=="journey"&&y!=="places");let o=y==="oneseat"||y==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",y!=="places"),st()||Ra(!1),de(),rn(),o||ot(!1),Aa()}),le(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){ot(!0);return}ot(!1),$e({key:n})}),le(D.placeFill,t=>{M=t.dataset.placeFill,we()&&Xe(i,M,L()),F(),b(),rn()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){rt=n.dataset.weight,b(),A();return}let o=t.target.closest("[data-surface-unit]");if(o){me=o.dataset.surfaceUnit,zr(me),A();return}let a=t.target.closest("[data-bucket]");a&&(Qn(i,a.dataset.bucket,L()),b())}),c("legend-reset").addEventListener("click",()=>{Zn(i,L()),b()}),c("legend-select").addEventListener("click",()=>Ra(!N)),c("legend-clear").addEventListener("click",()=>{xt(i),de(),b(),A()}),c("legend-collapse").addEventListener("click",()=>{sn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&$e({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&ni(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&tt(a.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(Ma=s.dataset.sortPlaces,F());let r=t.target.closest("[data-goto-place]");r&&(y!=="places"&&q(D.view,"places"),tt(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Ir),ke&&an(sn),Fa=ke?Ar:Da({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),i.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:sn}),Hr(),lt(),de(),it(),Br(Le)||Pt(i,P,L()).then(b),ti(),ei()});function le(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),lt(),A()})})}function q(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Br(e){let t=!1;return e.radius!==void 0&&(t=q(D.radius,String(e.radius))||t),e.day&&(t=q(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&q(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(rt=e.weight),e.surfaceUnit&&(me=e.surfaceUnit),e.placeFill&&q(D.placeFill,e.placeFill),e.dest&&("key"in e.dest?q(D.dest,e.dest.key):$e(e.dest)),e.selection&&Gn(i,e.selection),e.view&&q(D.view,e.view),e.at&&pn(e.at.lat,e.at.lon),e.place&&tt(e.place),t}function A(){let e={view:y,day:L(),radius:P,oneSeatRestricted:pe,weight:rt,surfaceUnit:me,dest:$,at:f,camera:Ea,place:at,placeFill:M,selection:Un()},t=Sa(e);history.replaceState(null,"",(ke?xa(t):t)+location.hash),it(t)}function it(e=_a(location.search)){if(!ke)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?ce?he(ce):"this point":null;t.querySelector(".el-action").textContent=Pa(n)}function lt(){c("statebar").innerHTML=fa({view:y,day:L(),radius:P,oneSeatRestricted:pe,destination:xe()}),jr()}function sn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Hr(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function jr(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(ha(y)))}function Ir(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),i.resize()}function b(){Ur()}function Ur(){if(c("legend-reset").classList.toggle("hidden",Bt()||Ut()||Yt()||we()),Yt()){c("legend").innerHTML=qo(We());return}if(we()){c("legend").innerHTML=ma({selected:na(),fill:M,day:L(),boundaries:Zt(),unchanged:oa()});return}if(Bt()){let n=Ie();n&&Ro(c("legend"),n);return}if(Ut()){let n=ae();if(!n)return;let o=i.getBounds();To(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Lt();if(!e)return;let t=i.getBounds();Co(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:rt,surface:Et()?Ne():null,unit:me,population:Ae(),selection:In()})}async function Jr(e){if(e&&!Ne()){c("legend").classList.add("loading");try{await Ct(i,P,L())}finally{c("legend").classList.remove("loading")}}co(i,e),e&&me==="people"&&await Na(),b()}async function Na(){if(!Ae()){c("legend").classList.add("loading");try{await Nt(P)}finally{c("legend").classList.remove("loading")}}}async function zr(e){e==="people"&&Et()&&await Na(),b()}async function Gr(e){if(e&&!Ie()){c("legend").classList.add("loading");try{await Ht(i,L())}finally{c("legend").classList.remove("loading")}}fo(i,e),b()}async function Kr(e){if(e&&(!Qt()||!Zt())){c("legend").classList.add("loading");try{await Promise.all([ia(),la(i)])}finally{c("legend").classList.remove("loading")}}ua(i,e),e&&Xe(i,M,L()),e&&F(),b()}async function tt(e){at=await dn(()=>ca(i,e))?e:null,y==="places"&&(F(),at&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),A()}function Wr(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),it(),y==="places"){c("panel").innerHTML=da(Qt()??[],Ma,at,M);return}if(!ce){y==="oneseat"?c("panel").innerHTML=An(xe()):En(c("panel"));return}if(y==="oneseat"){let t=Nn(ce,$,L());if(t){c("panel").innerHTML=t;return}}Fn(ce)}function Yr(e,t=!1){if(Ko(i,e),b(),!e){t&&(f?ue(f.lat,f.lon):F());return}We()&&f?c("panel").innerHTML=qt(We(),xe()):c("panel").innerHTML=Vo(xe())}async function cn(e,t){let n=++X;f={lat:e,lon:t},A(),Ha(e,t);let o=Ba(),a=d(xe());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(Wo({lat:e,lon:t},o,L()));if(n!==X)return;Vt(i,s),c("panel").innerHTML=qt(s,a),b(),it()}catch(s){if(n!==X)return;Vt(i,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function rn(){c("day-controls").classList.toggle("hidden",!xo(y,pe,M))}function un(){return ko(pe,L())}async function Vr(e){e&&!ae()&&await dn(()=>Jt(i,P,$,un())),_o(i,e),b()}async function nt(){await dn(()=>Jt(i,P,$,un())),b()}async function dn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function $e(e){if($=e,ot(!1),qr(),Aa(),lt(),A(),y==="journey"){f&&cn(f.lat,f.lon),b();return}f?ue(f.lat,f.lon):F({scrollToTop:!0}),nt()}function Aa(){let e=Ba();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in $))){V?.remove(),V=null;return}V?V.setLngLat([e.lon,e.lat]).addTo(i):(V=new maplibregl.Marker({color:It,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(i),V.on("dragend",()=>{let n=V.getLngLat();$e({lat:n.lat,lon:n.lng})}))}function qr(){let e=$o($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Ba(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=ln.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function xe(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return ln.find(t=>t.key===e)?.name??e}function ot(e){Ca=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function ue(e,t){let n=++X;f={lat:e,lon:t},A(),c("panel").classList.add("loading"),Ha(e,t);try{let o="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",a=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${o}&oneseat_day=${un()}`);if(n!==X)return;hn(i,e,t,P,a.current.stops,a.proposed.stops),Xr(),ce=a,F({scrollToTop:!0})}catch(o){if(n!==X)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===X&&c("panel").classList.remove("loading")}}function Xr(){c("pin-key").innerHTML=Eo(P),c("pin-key").classList.remove("hidden")}function Ha(e,t){Se?Se.setLngLat([t,e]):(Se=new maplibregl.Marker({color:Nr,draggable:!0}).setLngLat([t,e]).addTo(i),Se.on("dragend",()=>{let n=Se.getLngLat();pn(n.lat,n.lng)}))}var et=14;function st(){return y==="dots"||y==="both"}function Ra(e){N=e&&st(),N?i.dragPan.disable():i.dragPan.enable(),i.getCanvas().style.cursor=N?"none":"",N||ja(),de()}function de(){let e=c("legend-select");e.classList.toggle("hidden",!st()),e.setAttribute("aria-pressed",String(N)),e.textContent=N?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!st()||!Jn())}function Qr(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!N}function Ta(e){c("brush").classList.toggle("painting",e)}function ja(){c("brush").hidden=!0}function Zr(){let e=c("brush");e.style.width=`${et*2}px`,e.style.height=`${et*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,de(),b()}))},s=()=>{N&&(t=!0,n=!1,Ta(!0))},r=u=>{if(Qr(u.point.x,u.point.y),!t)return;n=!0,kt(i,_t(i,u.point.x,u.point.y,et))&&a()},l=u=>{if(Ta(!1),!!t){if(t=!1,!n){let[p]=_t(i,u.point.x,u.point.y,et);p&&zn(i,p)}de(),b(),A()}};i.on("mousedown",s),i.on("mousemove",r),i.on("mouseup",l),i.getCanvas().addEventListener("mouseleave",ja),i.on("touchstart",s),i.on("touchmove",r),i.on("touchend",l)}function pn(e,t){if(Fa.atLeast("half"),y==="journey"){cn(e,t);return}y!=="places"&&ue(e,t)}async function ei(){try{ln=await S("/api/destinations"),lt()}catch{}}async function ti(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function ni(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
