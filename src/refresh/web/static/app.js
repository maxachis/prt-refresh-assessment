"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Q(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function ct(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function ut(e){return e>0?`+${e}`:String(e)}function dn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Ao="#4aa3ff",Ho="#ffa23a";function Bo(e,t,n,a=96){let o=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let l=0;l<=a;l++){let u=l/a*2*Math.PI;o.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function Z(e){return{type:"FeatureCollection",features:e}}function pn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function mn(e){e.addSource("walk",{type:"geojson",data:Z([])}),e.addSource("stops-now",{type:"geojson",data:Z([])}),e.addSource("stops-prop",{type:"geojson",data:Z([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Ho,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Ao,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let s=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function yn(e,t,n,a,o,s){e.getSource("walk").setData(Z([Bo(t,n,a)])),e.getSource("stops-now").setData(Z(pn(o,"current"))),e.getSource("stops-prop").setData(Z(pn(s,"proposed")))}var O=["weekday","saturday","sunday"],dt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],gn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},xe=4,hn=e=>4+xe*e,fn=e=>5+xe*e,pe=e=>6+xe*e,jo=e=>7+xe*e;var Uo=3,pt=e=>e[Uo],K=(e,t)=>e[t],bn=(e,t)=>e[jo(t)],mt=e=>2+2*e,yt=e=>3+2*e,_e=4,vn=e=>2+_e*e,wn=e=>3+_e*e,Sn=e=>4+_e*e,Ln=e=>5+_e*e;var ht="weekday";function L(){return ht}function On(e){ht=e}function Dn(e){e.innerHTML=`
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
    </div>`}function Io(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Jo(e,t){let n=Math.max(1,...dt.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return dt.map(a=>{let o=e.periods[a]??0,s=t.periods[a]??0,r=s-o,l=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${gn[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${s}</td>
        <td class="n ${l}">${r===0?"\xB7":ut(r)}</td>
      </tr>`}).join("")}function Rn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function $n(e){return e.first==null?'<span class="muted">no service</span>':`${Q(e.first)}\u2013${Q(e.last)}`}function kn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var zo={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Go={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ko(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':De(a.current,a.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(a.name)}</span>
          <span class="os-status ${d(a.status)}">${zo[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${o}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Go[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Oe("one-seat")}</p>
    </div>`:""}function Oe(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Pe(e,t,n=null){let a=e===t?" same":"",o=n?` ${n}`:"";return`<dd class="cmp${a}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${o}">${t}</span></dd>`}function xn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function _n(e){return e.first==null||e.last==null?null:e.last-e.first}function De(e,t){let n=new Set(e.filter(a=>t.includes(a)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Pn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Pn(t,n,"prop")}</div>
    </div>`}function Pn(e,t,n){return e.length?e.map(a=>`<span class="route ${t.has(a)?"both":`only-${n}`}">${d(a)}</span>`).join(" "):'<span class="muted">none</span>'}var gt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Yo="Allegheny";function me(e){let t=e.place?.muni?.trim()??"",n=gt.exec(t)?.[1],a=n===Yo?t.replace(gt,""):n?`${t.replace(gt,"")} (${n})`:t;return e.place?.hood||a||"this location"}function ft(e){return e==="weekday"?"weekday":e}function Tn(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${ft(t)}`}function Vo(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${ft(t)}, today only</span>`}${a}</dd>`}function Wo(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Oe("boardings")}</p>`}function qo(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${Oe("place-population")}</p>
    </div>`}function bt(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],s=o.trips-a.trips,r=s>0?"up":s<0?"down":"flat",l=kn(a),u=kn(o),p=_n(a),m=_n(o);return`
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${a.trips}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${o.trips}</div>
      </div>
      <div class="hl-delta ${r}">
        ${s===0?"no change":`${ut(s)} trips`}
        <div class="muted">${dn(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${ft(t)}, both directions</div>

    <div class="tiers">${Io(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Jo(a,o)}</tbody>
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
      ${Pe($n(a),$n(o))}
      <dt>Hours between</dt>
      ${Pe(ct(p),ct(m),xn(p,m,"more"))}
      <dt>Typical wait</dt>
      ${Pe(l==null?"\u2014":`${l} min`,u==null?"\u2014":`${u} min`,xn(l,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Pe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Vo(a.boardings,t)}
    </dl>
    ${Wo(a.boardings)}

    ${n}

    ${qo(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${De(a.routes,o.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Oe("location-not-route")}</p>
    </div>`}function En(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(me(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${bt(e,ht,Ko(e.oneseat??[],e.oneseat_day??"any"))}`}var Xo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Qo={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Zo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function es(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function vt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Rn(t)}</div>`:""}function ts(e){let t=vt("kept",e.kept)+vt("lost",e.lost)+vt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ns(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${De(e.current,e.proposed)}
    </div>`}function as(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${d(o.key)}">
      <span class="os-name">${d(o.name)}</span>
      <span class="os-status ${d(o.status)}">${os[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var os={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function ss(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Zo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Cn(e,t,n){let a=es(e,t);if(!a)return"";let o=e.oneseat_day??"any",s=a.status==="here"?"":ts(a)+ns(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(a.name)}</h2>
      <div class="muted">
        from ${d(me(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(a.status)}">${Xo[a.status]}</div>
    <p class="note">${Qo[a.status]} ${ss(o)}</p>

    ${s}

    ${as(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${Tn(e,n)}</summary>
      ${bt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Mn(e){return`
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
    </div>`}var Ee={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Ce="change",ge="change-dots",Re=["boolean",["feature-state","selected"],!1],rs="#15181e",Te=null,ee=new Set,E=new Set;function wt(){return Te}function St(e){return ee.has(e)}function Fn(e,t,n,a){return o=>ls(o,e,t,n,a)}function Nn(e){return t=>e.has(pt(t))}function An(){return E}function Hn(){return[...E].sort()}function Bn(){return E.size}function Lt(e,t){for(let n of t)E.has(n)||(E.add(n),he(e,n,!0))}function jn(e,t){E.delete(t)?he(e,t,!1):(E.add(t),he(e,t,!0))}function Un(e,t){$t(e),Lt(e,t)}function $t(e){for(let t of E)he(e,t,!1);E.clear()}function he(e,t,n){try{e.setFeatureState({source:Ce,id:t},{selected:n})}catch{}}function is(e){for(let t of E)he(e,t,!0)}function kt(e,t,n,a){let o=[[t-a,n-a],[t+a,n+a]];return e.queryRenderedFeatures(o,{layers:[ge]}).map(s=>s.id).filter(s=>s!==void 0)}function In(e,t,n,a){let o={};for(let s of n)o[s]=0;for(let s of e){if(!a(s))continue;let r=n[K(s,pe(t))];r!==void 0&&o[r]++}return o}function ls(e,t,n,a,o){let s=K(e,0),r=K(e,1);return s>=n&&s<=o&&r>=t&&r<=a}function Jn(e,t,n,a){let o={riders:{},measured:{},unmeasured:0};for(let s of n)o.riders[s]=0,o.measured[s]=0;for(let s of e){if(!a(s))continue;let r=n[K(s,pe(t))];if(r===void 0)continue;let l=bn(s,t);if(l===null){r!=="none"&&o.unmeasured++;continue}o.riders[r]+=l,o.measured[r]++}return o}function cs(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>O.some((a,o)=>t[K(n,pe(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:pt(n),published:n[2],...Object.fromEntries(O.flatMap((a,o)=>[[`b${o}`,t[K(n,pe(o))]],[`c${o}`,n[hn(o)]],[`p${o}`,n[fn(o)]]]))}}))}}function ye(e,t){let n=Object.entries(Ee).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,Ee.none[t]]}function zn(e){return["interpolate",["linear"],["zoom"],9,["*",ye(e,"size"),.45],12,ye(e,"size"),16,["*",ye(e,"size"),1.9]]}function Gn(e){e.addSource(Ce,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ge,type:"circle",source:Ce,paint:{"circle-color":ye(0,"color"),"circle-radius":zn(0),"circle-opacity":.85,"circle-stroke-color":["case",Re,rs,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",Re,1.6,.5],12,["case",Re,2.4,1],16,["case",Re,3.2,1.6]]}},"walk-fill")}async function xt(e,t,n){return Te=await S(`/api/change?radius=${t}`),e.getSource(Ce).setData(cs(Te)),is(e),_t(e,n),Te}function _t(e,t){let n=O.indexOf(t);e.setPaintProperty(ge,"circle-color",ye(n,"color")),e.setPaintProperty(ge,"circle-radius",zn(n)),Pt(e,t)}function Kn(e,t,n){ee.has(t)?ee.delete(t):ee.add(t),Pt(e,n)}function Yn(e,t){ee.clear(),Pt(e,t)}function Pt(e,t){let n=O.indexOf(t),a=["none",...ee];e.setFilter(ge,["!",["in",["get",`b${n}`],["literal",a]]])}function Vn(e,t,n){let a=O.indexOf(t),o=e[`b${a}`],s=n.find(p=>p.key===o)?.label??o,r=e[`c${a}`],l=e[`p${a}`];return`<b>${s}</b><br>${r} \u2192 ${l} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Ot="surface",Fe="surface-fill",Wn="#6b7280",Dt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Wn],[.138,Wn],[1,"#12a163"],[2,"#0b7a48"]],R="#e8232f",T="#0f79c9",qn=2,Me=null,Xn=!1;function Ne(){return Me}function Rt(){return Xn}function Qn(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-qn,Math.min(qn,n))}function Zn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function ea(e,t,n,a,o,s,r,l){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=r.lat0+(p[1]+.5)*r.dlat,b=r.lon0+(p[0]+.5)*r.dlon;if(m<a||m>s||b<n||b>o)continue;let k=p[mt(t)],x=p[yt(t)],B=Zn(k,x);if(B!=="none")if(B==="ramp"){let g=Qn(k,x);u[g<-.138?"less":g>.138?"more":"same"]+=l}else u[B]+=l}return u}function us(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*a,l=r+a,u=n+s[0]*o,p=u+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[p,r],[p,l],[u,l],[u,r]]]},properties:Object.fromEntries(O.flatMap((m,b)=>{let k=s[mt(b)],x=s[yt(b)];return[[`k${b}`,Zn(k,x)],[`v${b}`,Qn(k,x)??0]]}))}})}}function ta(e){return["case",["==",["get",`k${e}`],"gone"],R,["==",["get",`k${e}`],"new"],T,["interpolate",["linear"],["get",`v${e}`],...Dt.flatMap(([t,n])=>[t,n])]]}function te(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function na(e,t){e.addSource(Ot,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Fe,type:"fill",source:Ot,layout:{visibility:"none"},paint:{"fill-color":ta(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,te(0,.85),13,te(0,.62),16,te(0,.45)]}},t)}async function Tt(e,t,n){return Me=await S(`/api/surface?radius=${t}`),e.getSource(Ot).setData(us(Me)),Et(e,n),Me}function Et(e,t){let n=O.indexOf(t);e.setPaintProperty(Fe,"fill-color",ta(n)),e.setPaintProperty(Fe,"fill-opacity",["interpolate",["linear"],["zoom"],9,te(n,.85),13,te(n,.62),16,te(n,.45)])}function aa(e,t){Xn=t,e.setLayoutProperty(Fe,"visibility",t?"visible":"none")}var Ct=null;function Ae(){return Ct}async function Mt(e){return Ct=await S(`/api/population?radius=${e}`),Ct}function oa(e,t,n,a,o,s,r){let l={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;p<a||p>s||m<n||m>o||(l.lost+=u[vn(t)],l.gained+=u[wn(t)],l.kept+=u[Sn(t)],l.none+=u[Ln(t)])}return l}var Ft="corridor",sa="corridor-lines",je="#8b929c",ds="#6f7783",Be={lost:R,added:T,kept:je};var He=null,ra=!1;function Ue(){return He}function Nt(){return ra}function ps(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function ia(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function ms(){let e=t=>["match",["get","klass"],"lost",Be.lost,"added",Be.added,t];return["interpolate",["linear"],["zoom"],9,e(ds),14,e(je)]}function ys(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function gs(){return["match",["get","klass"],"kept",.85,.9]}function la(e,t){e.addSource(Ft,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:sa,type:"line",source:Ft,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ms(),"line-width":ys(),"line-opacity":gs()}},t)}async function At(e,t){return He=await S(`/api/corridors?day=${t}`),e.getSource(Ft).setData(ps(He)),He}async function ca(e,t){O.includes(t)&&await At(e,t)}function ua(e,t){ra=t,e.setLayoutProperty(sa,"visibility",t?"visible":"none")}var Bt="#2b3038",da="#b9bec6",fe={loses:{color:R,size:6},gains:{color:T,size:6},keeps:{color:je,size:3},here:{color:Bt,size:3.5},none:{color:da,size:1.8}},Je=["loses","gains","keeps","none","here"],Ht="oneseat",pa="oneseat-dots",Ie=null,ma=!1;function ne(){return Ie}function jt(){return ma}function ya(e,t,n,a,o,s){let r={};for(let l of t)r[l]=0;for(let l of e){let u=l[0],p=l[1];if(u<a||u>s||p<n||p>o)continue;let m=t[l[3]];m!==void 0&&r[m]++}return r}function hs(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function fs(){return["match",["get","status"],...Object.entries(fe).flatMap(([e,t])=>[e,t.color]),da]}function bs(){let e=["match",["get","status"],...Object.entries(fe).flatMap(([t,n])=>[t,n.size]),fe.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function ga(e,t){e.addSource(Ht,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:pa,type:"circle",source:Ht,layout:{visibility:"none"},paint:{"circle-color":fs(),"circle-radius":bs(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function vs(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var ws="pin";function ha(e){return"key"in e?e.key:ws}var ze="any";function Ss(e,t,n){return`radius=${e}&${vs(t)}&day=${n}`}function fa(e,t){return e?t:ze}function ba(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function Ut(e,t,n,a=ze){return Ie=await S(`/api/oneseat?${Ss(t,n,a)}`),e.getSource(Ht).setData(hs(Ie)),Ie}function va(e,t){ma=t,e.setLayoutProperty(pa,"visibility",t?"visible":"none")}function It(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function wa(e,t){let n=t.statuses.find(l=>l.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),s=l=>l.length?l.join(", "):"none",r=It(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(a)}<br>proposed: ${s(o)}`}var Jt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ls(e){return e.buckets.filter(t=>t.key!=="none")}var Sa={area:"Ground",people:"People"};function $s(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=ea(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(o.less)}</b> km\xB2 less</span>
        <span><b>${s(o.more)}</b> km\xB2 more</span>
        <span><b>${s(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function ks(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=oa(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(o.lost)}</b> people lose all service</span>
        <span><b>${s(o.gained)}</b> gain service</span>
        <span><b>${s(o.kept)}</b> keep a bus</span>
        <span><b>${s(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}var xs=`
      <div class="lg-ends" style="margin-top:6px">Ground and people are
        measured across the view, not the stops you selected \u2014 a 100 m cell
        has no stop to select. Clear the selection to count them.</div>`;function _s(e){let{layer:t,day:n,bounds:a,unit:o,population:s,scoped:r=!1}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Dt.map(([u,p])=>`${p} ${((u+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${R}"></i>loses all service</span>
        <span><i style="background:${T}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Sa).map(u=>`
          <button data-surface-unit="${u}" aria-pressed="${o===u}"
                  class="${o===u?"active":""}">${Sa[u]}</button>`).join("")}
      </div>
      ${r?xs:o==="people"?ks(n,a,s):$s(t,n,a)}
    </div>`}var Ps=["lost","added","kept"],Os={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Ds={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function $a(e,t){let{lostPct:n,addedPct:a}=ia(t.km),o=l=>l.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${Ds[t.day]}
    </div>
    ${Ps.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${Be[l]}"></i>
        <span class="lg-lab">${d(Os[l])}</span>
        <span class="lg-n">${o(t.km[l])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${o(n)}%</b> of today's pavement lost</span>
      <span><b>${o(a)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A piece of street either has a bus on it or it doesn't \u2014
      this is not a walk-access question, so there is no radius here. A place
      can keep full walk access while a specific street loses its only bus, if
      a parallel block picks up the trip instead. See Locations or Surface for
      what you can still reach on foot.</div>`}function ka(e,t,n){let a=t.statuses.map(m=>m.key),o=ya(t.points,a,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(b=>b.key===m)?.label??m,r=Je.reduce((m,b)=>m+(o[b]??0),0),l=It(t),u=t.day&&t.day!==ze,p=u?`Restricted to routes running on ${Jt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(l)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${Jt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Je.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${fe[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(o[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Je.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(l)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function xa(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var La={locations:"Locations",riders:"Riders"};function Rs(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function _a(e,t){let{layer:n,day:a,bounds:o,weight:s,surface:r,unit:l="area",population:u,selection:p}=t,m=n.buckets.map(v=>v.key),b=n.days.indexOf(a),{west:k,south:x,east:B,north:g}=o,z=Ls(n),_=p&&p.size>0?p:null,X=_?Nn(_):Fn(k,x,B,g),lt=In(n.points,b,m,X),G=s==="riders"?Jn(n.points,b,m,X):null,Mo=v=>G?G.measured[v]?Math.round(G.riders[v]).toLocaleString():"\u2014":lt[v].toLocaleString(),Fo=_?`at ${_.size.toLocaleString()} selected stop${_.size===1?"":"s"}`:"in view",No=G?`<b>${Math.round(z.reduce((v,de)=>v+G.riders[de.key],0)).toLocaleString()}</b> daily boardings ${Fo}`:_?`<b>${z.reduce((v,de)=>v+lt[de.key],0).toLocaleString()}</b>
         of ${_.size.toLocaleString()} selected stops`:`<b>${z.reduce((v,de)=>v+lt[de.key],0).toLocaleString()}</b>
         locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${No}
      <span class="muted">\xB7 ${Jt[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(La).map(v=>`
        <button data-weight="${v}" aria-pressed="${s===v}"
                class="${s===v?"active":""}">${La[v]}</button>`).join("")}
    </div>
    ${z.map(v=>`
      <button class="lg-row ${St(v.key)?"off":""}" data-bucket="${d(v.key)}"
              aria-pressed="${!St(v.key)}">
        <i style="background:${Ee[v.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(v.label)}</span>
        <span class="lg-n">${Mo(v.key)}</span>
      </button>`).join("")}
    ${r?_s({layer:r,day:a,bounds:o,unit:l,population:u,scoped:!!_}):""}
    ${G?Rs(G.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}
    ${_?`
    <div class="lg-foot">These are the stops you painted, not everything on
      screen \u2014 a selection you chose by hand, so quote it as one. The link in
      your address bar carries it.</div>`:""}`}var zt="#4aa3ff",Ca="#ffa23a",Gt="headline",Ge="journey",Ma="journey-rides",Fa="journey-walks",Ts=[Ma,Fa],Na=null,Aa=!1;function Ye(){return Na}function Kt(){return Aa}function Es(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let s=n[o].itinerary;if(s)for(let r of s.legs){let l=r.from??e.origin,u=r.to??e.destination,p=[[l.lon,l.lat],[u.lon,u.lat]],m=r.path?.length?r.path:p;a.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:o,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:a}}function Pa(){return["match",["get","side"],"current",zt,"proposed",Ca,zt]}function Oa(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Ha(e,t){e.addSource(Ge,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ma,type:"line",source:Ge,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Pa(),"line-width":Oa(1),"line-opacity":.85}},t),e.addLayer({id:Fa,type:"line",source:Ge,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Pa(),"line-width":Oa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Ba(e,t){Aa=t;for(let n of Ts)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Yt(e,t){Na=t;let n=t?Es(t,Gt):{type:"FeatureCollection",features:[]};e.getSource(Ge).setData(n)}function ja(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Da=e=>`${e.toFixed(1)} min`;function Ua(e){return e==null?"\u2014":e===0?"no change":e>0?`${Da(e)} slower`:`${Da(-e)} faster`}function Ra(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function Cs(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=Ra(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Ra(e.to,"the destination")}</span></div>`}function Ta(e,t){let n=[],a=null;for(let o of e.legs){let s=a?Math.round(o.depart-a.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Cs(o,t)),a=o}return n.join("")}var Ms={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Ke(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Fs(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Ns(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Ke(t.current)} \u2192
        ${Ke(t.proposed)} min</span>
        <span class="muted">${Ua(t.change_min)}</span></div>
      ${a}
    </div>`}function Ea(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Vt(e,t){let n=e.radii[Gt],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${Q(e.window.start_min)}
        and ${Q(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${o}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Ms[n.classification]??""}</p>
      </div>
      ${Ea(e)}`:`${o}
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
      <div class="hl-delta ${a}">${Ua(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Fs(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Ta(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Ta(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Ns(e)}
    ${Ea(e)}`}function Ia(e){return`
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
    </div>`}function Ja(e){let t=e?e.radii[Gt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${zt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Ca}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var qe="places",Ka="places-points",Wt="places-boundaries",C="places-fill",oe="lost",As=100,Hs={lost:"share_lost",gained:"share_gained"};function U(e,t){return`service_${e}_${t}`}var Ya={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Bs="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Y={lost:R,gained:T},Ve=null,j=null,ae=null,Va=!1,We=null;function qt(){return Ve}function Wa(){return j}function qa(){return We}function Xt(){return ae}function be(){return Va}function js(e,t){let n=[...e];return t==="count"?n.sort((a,o)=>o.residents_lost-a.residents_lost):n.sort((a,o)=>(o.share_lost??-1)-(a.share_lost??-1))}function Us(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Is(e){return Math.max(e.residents_lost,e.residents_gained)}var za=4,Js=16,zs=1e3;function Gs(e){let t=Math.min(1,Math.sqrt(e/zs));return za+t*(Js-za)}function Ks(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Us(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Gs(Is(t))}}))}}function Ys(){return["match",["get","klass"],"lost",Y.lost,"gained",Y.gained,Y.lost]}function Vs(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var A=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var H=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Xa(e,t){return e==="service"?["step",["abs",["coalesce",["get",U(t,"pct")],0]],H[0].opacity,H[0].max,H[1].opacity,H[1].max,H[2].opacity,H[2].max,H[3].opacity]:["step",["coalesce",["get",Hs[e]],0],A[0].opacity,Number.EPSILON,A[1].opacity,A[1].max,A[2].opacity,A[2].max,A[3].opacity,A[3].max,A[4].opacity]}function Qa(e,t){return e==="service"?["case",[">=",["coalesce",["get",U(t,"pct")],0],0],T,R]:Y[e]}function Ws(e,t){let n=U(t,"now"),a=U(t,"proposed");return e.features.filter(o=>o.properties[n]===0&&o.properties[a]>0).map(o=>o.properties.place)}var qs=3;function Xs(e){if(e.length===0)return"";let t=e.slice(0,qs),n=e.length-t.length,a=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,o=n>0?`${a} (and ${n} more)`:a;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${o}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${o}.`}function Za(e,t){e.addSource(Wt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:C,type:"fill",source:Wt,layout:{visibility:"none"},paint:{"fill-color":Qa(oe),"fill-opacity":Xa(oe),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(qe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ka,type:"circle",source:qe,layout:{visibility:"none"},paint:{"circle-color":Ys(),"circle-radius":Vs(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Xe(e,t,n){e.setPaintProperty(C,"fill-color",Qa(t,n)),e.setPaintProperty(C,"fill-opacity",Xa(t,n))}async function eo(){return Ve||(Ve=await S("/api/places")),Ve}async function to(e){return ae||(ae=await S("/api/boundaries"),e.getSource(Wt).setData(ae)),ae}function Qs(e,t){let n=e?.features.find(a=>a.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function no(e,t){let n=Qs(ae,t);if(n)return j=null,We=n,e.getSource(qe)?.setData({type:"FeatureCollection",features:[]}),null;try{j=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return j=null,We=null,null}return We=null,e.getSource(qe).setData(Ks(j)),e.flyTo({center:[j.lon,j.lat],zoom:13}),j}function ao(e,t){Va=t,e.setLayoutProperty(Ka,"visibility",t?"visible":"none"),e.setLayoutProperty(C,"visibility",t?"visible":"none")}function Zs(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var er="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function oo(e,t,n,a){let o=js(e,t).map(s=>Zs(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Bs}</p>
    ${a==="service"?`<p class="note">${er}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${o}</div>`}function so(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function tr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function nr(e,t,n,a){let o=H.map((u,p)=>({band:u,prevMax:p===0?0:H[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=tr(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${R};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=a?Ws(a,n):[],r=Xs(s),l=r?`<div class="lg-foot">${d(r)}</div>`:"";return`
    ${so(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(Ya[n])}</div>
    ${o}
    ${l}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ro({selected:e,fill:t,day:n,boundaries:a,unchanged:o}){if(t==="service")return nr(e,o??null,n,a??null);let s=t==="lost"?"lose all buses":"gain a bus",r=A.filter(l=>l.opacity>0).map(l=>`
    <div class="lg-row lg-static">
      <i style="background:${Y[t]};opacity:${l.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(l.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${so(e,o??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Y.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Y.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function ar(e,t){let n=e[U(t,"now")],a=e[U(t,"proposed")],o=e[U(t,"pct")],s=e[U(t,"rail_proposed")],r=Ya[t];if(a===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&a>0)return`Gets its first bus on ${r} (0 \u2192 ${a} trips).`;let l=o==null?"\u2014":`${o>0?"+":""}${o.toFixed(1)}%`;return`${n} \u2192 ${a} trips on ${r} (${l}).`}function io(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${ar(e,n)}`;let a=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${a} residents lose or gain a bus.`;let o=Ga("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Ga("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[o,s]:[s,o]).filter(l=>l!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${a} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Ga(e,t,n){let a=Math.round(t).toLocaleString(),o=n==null?`share withheld \u2014 under ${As} residents`:`${(n*100).toFixed(1)}%`;return`${a} ${e} (${o})`}var Qt=" \xB7 ",Zt={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},lo=Object.keys(Zt);function co(e){return Zt[e]??e}var or={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},sr=["oneseat","journey"];function rr(e){return e!=="journey"}function ir(e){let t=[Zt[e.view]??e.view];return e.view==="places"?t[0]:(sr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":or[e.day]),rr(e.view)&&t.push(`${e.radius} m walk`),t.join(Qt))}function uo(e){let[t,...n]=ir(e).split(Qt);return`<b>${d(t)}</b>${n.map(a=>Qt+d(a)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},lr=/^[cp]:[\w.:-]{1,32}$/,Qe={any:"any",selected:"selected"},cr="pin",po=5;function yo(e){try{return e.self!==e.top}catch{return!0}}function go(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?Qe.selected:Qe.any),t.set(h.dest,"key"in e.dest?e.dest.key:en(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,en(e.at)),e.camera&&t.set(h.camera,`${en(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==oe&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),`?${t}`}function ho(e){let t=new URLSearchParams(e),n={},a=t.get(h.view);a&&lo.includes(a)&&(n.view=a);let o=t.get(h.day);o&&O.includes(o)&&(n.day=o);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(h.oneSeatDay);r===Qe.selected?n.oneSeatRestricted=!0:r===Qe.any&&(n.oneSeatRestricted=!1);let l=t.get(h.dest);if(l&&l!==cr){let x=mo(l);x?n.dest=x:l.includes(",")||(n.dest={key:l})}let u=mo(t.get(h.at));u&&(n.at=u);let p=ur(t.get(h.camera));p&&(n.camera=p);let m=t.get(h.place);m&&(n.place=m);let b=t.get(h.selection);b!==null&&(n.selection=b.split(",").filter(x=>lr.test(x)));let k=t.get(h.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function en(e){return`${e.lat.toFixed(po)},${e.lon.toFixed(po)}`}function mo(e){let t=fo(e,2);return t?{lat:t[0],lon:t[1]}:null}function ur(e){let t=fo(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function fo(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var tn="embed";var dr=["1","true","yes"];function bo(e){let t=new URLSearchParams(e).get(tn);return t!==null&&dr.includes(t.toLowerCase())}function vo(e){let t=new URLSearchParams(e);return t.set(tn,"1"),`?${t}`}function wo(e){let t=new URLSearchParams(e);t.delete(tn);let n=String(t);return n?`?${n}`:""}function So(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var I=["peek","half","full"],pr=192,mr=.3,yr=.55,gr=.9,hr=.6,fr=.45;function Ze(e,t){return e==="peek"?Math.min(pr,t*mr):e==="half"?t*yr:t*gr}function br(e,t,n=0){let a=I.map(s=>Math.abs(Ze(s,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>hr&&(o=Math.max(0,Math.min(I.length-1,o+(n>0?1:-1)))),I[o]}function Lo(e){return I[(I.indexOf(e)+1)%I.length]}function vr(e,t){return Math.min(e,t*fr)}function se(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function nn(e){let t=null,n=()=>{let a=se();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var wr=8,Sr=400;function $o(e){let t=c("side"),n=c("sheet-handle"),a="peek",o=!1,s=0,r=0,l=0,u={y:0,t:0};function p(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,vr(g,p()))}function b(g){a=g,t.dataset.snap=g,m(Ze(g,p()))}n.addEventListener("pointerdown",g=>{se()&&(o=!0,s=g.clientY,r=t.getBoundingClientRect().height,l=g.timeStamp,u={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!o)return;let z=r+(s-g.clientY),_=Ze("peek",p()),X=Ze("full",p());m(Math.max(_,Math.min(X,z))),u={y:g.clientY,t:g.timeStamp}});function k(g){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-s)>wr)&&g.timeStamp-l<Sr){b(Lo(a));return}let _=g.timeStamp-u.t,X=_>0?(u.y-g.clientY)/_:0;b(br(t.getBoundingClientRect().height,p(),X))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),se()&&b(Lo(a)))});let x=nn(e.onLayoutChange);function B(){if(x(),!se()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}b(a)}return window.addEventListener("resize",B),B(),{at:()=>se()?a:"full",atLeast(g){se()&&I.indexOf(g)>I.indexOf(a)&&b(g)}}}var Lr=[-79.9959,40.4406],$r=12,kr="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},we=ho(location.search),$e=bo(location.search);$e&&c("app").classList.add("embed");var xr={at:()=>"full",atLeast(){}},_o=null,P=400,ve=null,f=null,ie=null,q=0,$={key:"downtown"},V=null,Po=!1,ce=!1,st="locations",ue="area",Oo="count",at=null,M=oe,J=!1,y="dots",Do,sn=[],i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:we.camera?[we.camera.lon,we.camera.lat]:Lr,zoom:we.camera?.zoom??$r,cooperativeGestures:yo(window),attributionControl:{compact:!0}});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{mn(i),Gn(i),na(i,"change-dots"),la(i,"change-dots"),ga(i,"walk-fill"),Ha(i),Za(i,"change-dots"),F(),i.on("click",t=>{if(J)return;if(Po){Se({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(y==="places"){let s=i.queryRenderedFeatures(t.point,{layers:[C]})[0];s&&et(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>i.getLayoutProperty(s,"visibility")!=="none"),a=i.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];un(o[1],o[0])}),i.on("mouseenter",C,()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave",C,()=>{i.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=wt();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Vn(n.properties,L(),a.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=ne();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(wa(n.properties,a)).addTo(i)}),i.on("mouseleave",C,()=>e.remove()),i.on("mousemove",C,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(io(n.properties,M,L())).addTo(i)}),jr(),i.on("moveend",()=>{let t=i.getCenter();_o={lat:t.lat,lon:t.lng,zoom:i.getZoom()},w(),N()}),re(D.radius,t=>{P=Number(t.dataset.radius),xt(i,P,L()).then(w),Ne()&&Tt(i,P,L()).then(w),Ae()&&Mt(P).then(w),ne()&&tt(),f&&le(f.lat,f.lon)}),re(D.day,t=>{let n=t.dataset.day;On(n),y!=="journey"&&F(),_t(i,n),Et(i,n),y==="journey"&&f&&rn(f.lat,f.lon),Ue()&&ca(i,n).then(w),ce&&ne()&&(tt(),f&&le(f.lat,f.lon)),be()&&M==="service"&&Xe(i,M,n),w()}),re(D.oneSeatDay,t=>{ce=t.dataset.oneseatDay==="selected",on(),tt(),f&&le(f.lat,f.lon)}),re(D.view,t=>{let n=y;y=t.dataset.view,i.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),Tr(y==="surface"||y==="both"),Cr(y==="corridors"),Ar(y==="oneseat"),Nr(y==="journey",n==="journey"),Mr(y==="places"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),Fr(y!=="corridors"&&y!=="journey"&&y!=="places");let a=y==="oneseat"||y==="journey";c("dest-controls").classList.toggle("hidden",!a),c("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",y!=="places"),ot()||xo(!1),Le(),on(),a||nt(!1),To()}),re(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){nt(!0);return}nt(!1),Se({key:n})}),re(D.placeFill,t=>{M=t.dataset.placeFill,be()&&Xe(i,M,L()),F(),w(),on()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){st=n.dataset.weight,w(),N();return}let a=t.target.closest("[data-surface-unit]");if(a){ue=a.dataset.surfaceUnit,Er(ue),N();return}let o=t.target.closest("[data-bucket]");o&&(Kn(i,o.dataset.bucket,L()),w())}),c("legend-reset").addEventListener("click",()=>{Yn(i,L()),w()}),c("legend-select").addEventListener("click",()=>xo(!J)),c("legend-clear").addEventListener("click",()=>{$t(i),Le(),w(),N()}),c("legend-collapse").addEventListener("click",()=>{an(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Se({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&Jr(a.dataset.caveat);let o=t.target.closest("[data-select-place]");o&&et(o.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(Oo=s.dataset.sortPlaces,F());let r=t.target.closest("[data-goto-place]");r&&(y!=="places"&&W(D.view,"places"),et(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Dr),$e&&nn(an),Do=$e?xr:$o({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),i.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:an}),Pr(),it(),Le(),rt(),_r(we)||xt(i,P,L()).then(w),Ir(),Ur()});function re(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),it(),N()})})}function W(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function _r(e){let t=!1;return e.radius!==void 0&&(t=W(D.radius,String(e.radius))||t),e.day&&(t=W(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&W(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(st=e.weight),e.surfaceUnit&&(ue=e.surfaceUnit),e.placeFill&&W(D.placeFill,e.placeFill),e.dest&&("key"in e.dest?W(D.dest,e.dest.key):Se(e.dest)),e.selection&&Un(i,e.selection),e.view&&W(D.view,e.view),e.at&&un(e.at.lat,e.at.lon),e.place&&et(e.place),t}function N(){let e={view:y,day:L(),radius:P,oneSeatRestricted:ce,weight:st,surfaceUnit:ue,dest:$,at:f,camera:_o,place:at,placeFill:M,selection:Hn()},t=go(e);history.replaceState(null,"",($e?vo(t):t)+location.hash),rt(t)}function rt(e=wo(location.search)){if(!$e)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?ie?me(ie):"this point":null;t.querySelector(".el-action").textContent=So(n)}function it(){c("statebar").innerHTML=uo({view:y,day:L(),radius:P,oneSeatRestricted:ce,destination:ke()}),Or()}function an(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Pr(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Or(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(co(y)))}function Dr(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),i.resize()}function w(){Rr()}function Rr(){if(c("legend-reset").classList.toggle("hidden",Nt()||jt()||Kt()||be()),Kt()){c("legend").innerHTML=Ja(Ye());return}if(be()){c("legend").innerHTML=ro({selected:Wa(),fill:M,day:L(),boundaries:Xt(),unchanged:qa()});return}if(Nt()){let n=Ue();n&&$a(c("legend"),n);return}if(jt()){let n=ne();if(!n)return;let a=i.getBounds();ka(c("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=wt();if(!e)return;let t=i.getBounds();_a(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:st,surface:Rt()?Ne():null,unit:ue,population:Ae(),selection:An()})}async function Tr(e){if(e&&!Ne()){c("legend").classList.add("loading");try{await Tt(i,P,L())}finally{c("legend").classList.remove("loading")}}aa(i,e),e&&ue==="people"&&await Ro(),w()}async function Ro(){if(!Ae()){c("legend").classList.add("loading");try{await Mt(P)}finally{c("legend").classList.remove("loading")}}}async function Er(e){e==="people"&&Rt()&&await Ro(),w()}async function Cr(e){if(e&&!Ue()){c("legend").classList.add("loading");try{await At(i,L())}finally{c("legend").classList.remove("loading")}}ua(i,e),w()}async function Mr(e){if(e&&(!qt()||!Xt())){c("legend").classList.add("loading");try{await Promise.all([eo(),to(i)])}finally{c("legend").classList.remove("loading")}}ao(i,e),e&&Xe(i,M,L()),e&&F(),w()}async function et(e){at=await cn(()=>no(i,e))?e:null,y==="places"&&(F(),at&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),w(),N()}function Fr(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),rt(),y==="places"){c("panel").innerHTML=oo(qt()??[],Oo,at,M);return}if(!ie){y==="oneseat"?c("panel").innerHTML=Mn(ke()):Dn(c("panel"));return}if(y==="oneseat"){let t=Cn(ie,$,L());if(t){c("panel").innerHTML=t;return}}En(ie)}function Nr(e,t=!1){if(Ba(i,e),w(),!e){t&&(f?le(f.lat,f.lon):F());return}Ye()&&f?c("panel").innerHTML=Vt(Ye(),ke()):c("panel").innerHTML=Ia(ke())}async function rn(e,t){let n=++q;f={lat:e,lon:t},N(),Co(e,t);let a=Eo(),o=d(ke());if(!a){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(ja({lat:e,lon:t},a,L()));if(n!==q)return;Yt(i,s),c("panel").innerHTML=Vt(s,o),w(),rt()}catch(s){if(n!==q)return;Yt(i,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function on(){c("day-controls").classList.toggle("hidden",!ba(y,ce,M))}function ln(){return fa(ce,L())}async function Ar(e){e&&!ne()&&await cn(()=>Ut(i,P,$,ln())),va(i,e),w()}async function tt(){await cn(()=>Ut(i,P,$,ln())),w()}async function cn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Se(e){if($=e,nt(!1),Hr(),To(),it(),N(),y==="journey"){f&&rn(f.lat,f.lon),w();return}f?le(f.lat,f.lon):F({scrollToTop:!0}),tt()}function To(){let e=Eo();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in $))){V?.remove(),V=null;return}V?V.setLngLat([e.lon,e.lat]).addTo(i):(V=new maplibregl.Marker({color:Bt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(i),V.on("dragend",()=>{let n=V.getLngLat();Se({lat:n.lat,lon:n.lng})}))}function Hr(){let e=ha($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Eo(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=sn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ke(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return sn.find(t=>t.key===e)?.name??e}function nt(e){Po=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function le(e,t){let n=++q;f={lat:e,lon:t},N(),c("panel").classList.add("loading"),Co(e,t);try{let a="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",o=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${a}&oneseat_day=${ln()}`);if(n!==q)return;yn(i,e,t,P,o.current.stops,o.proposed.stops),Br(),ie=o,F({scrollToTop:!0})}catch(a){if(n!==q)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===q&&c("panel").classList.remove("loading")}}function Br(){c("pin-key").innerHTML=xa(P),c("pin-key").classList.remove("hidden")}function Co(e,t){ve?ve.setLngLat([t,e]):(ve=new maplibregl.Marker({color:kr,draggable:!0}).setLngLat([t,e]).addTo(i),ve.on("dragend",()=>{let n=ve.getLngLat();un(n.lat,n.lng)}))}var ko=14;function ot(){return y==="dots"||y==="both"}function xo(e){J=e&&ot(),J?i.dragPan.disable():i.dragPan.enable(),i.getCanvas().style.cursor=J?"crosshair":"",Le()}function Le(){let e=c("legend-select");e.classList.toggle("hidden",!ot()),e.setAttribute("aria-pressed",String(J)),e.textContent=J?"Done selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!ot()||!Bn())}function jr(){let e=!1,t=!1,n=()=>{J&&(e=!0,t=!1)},a=s=>{e&&(t=!0,Lt(i,kt(i,s.point.x,s.point.y,ko)))},o=s=>{if(e){if(e=!1,!t){let[r]=kt(i,s.point.x,s.point.y,ko);r&&jn(i,r)}Le(),w(),N()}};i.on("mousedown",n),i.on("mousemove",a),i.on("mouseup",o),i.on("touchstart",n),i.on("touchmove",a),i.on("touchend",o)}function un(e,t){if(Do.atLeast("half"),y==="journey"){rn(e,t);return}y!=="places"&&le(e,t)}async function Ur(){try{sn=await S("/api/destinations"),it()}catch{}}async function Ir(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Jr(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
