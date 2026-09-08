"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Q(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function ut(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function dt(e){return e>0?`+${e}`:String(e)}function pn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Bo="#4aa3ff",jo="#ffa23a";function Uo(e,t,n,a=96){let o=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let l=0;l<=a;l++){let u=l/a*2*Math.PI;o.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function Z(e){return{type:"FeatureCollection",features:e}}function mn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function yn(e){e.addSource("walk",{type:"geojson",data:Z([])}),e.addSource("stops-now",{type:"geojson",data:Z([])}),e.addSource("stops-prop",{type:"geojson",data:Z([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":jo,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Bo,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let s=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function gn(e,t,n,a,o,s){e.getSource("walk").setData(Z([Uo(t,n,a)])),e.getSource("stops-now").setData(Z(mn(o,"current"))),e.getSource("stops-prop").setData(Z(mn(s,"proposed")))}var O=["weekday","saturday","sunday"],pt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],hn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},xe=4,fn=e=>4+xe*e,bn=e=>5+xe*e,me=e=>6+xe*e,Io=e=>7+xe*e;var Jo=3,mt=e=>e[Jo],K=(e,t)=>e[t],vn=(e,t)=>e[Io(t)],yt=e=>2+2*e,gt=e=>3+2*e,_e=4,wn=e=>2+_e*e,Sn=e=>3+_e*e,Ln=e=>4+_e*e,$n=e=>5+_e*e;var ft="weekday";function L(){return ft}function Dn(e){ft=e}function Rn(e){e.innerHTML=`
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
    </div>`}function zo(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Go(e,t){let n=Math.max(1,...pt.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return pt.map(a=>{let o=e.periods[a]??0,s=t.periods[a]??0,r=s-o,l=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${hn[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${s}</td>
        <td class="n ${l}">${r===0?"\xB7":dt(r)}</td>
      </tr>`}).join("")}function Tn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function kn(e){return e.first==null?'<span class="muted">no service</span>':`${Q(e.first)}\u2013${Q(e.last)}`}function xn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Ko={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Yo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Vo(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':De(a.current,a.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(a.name)}</span>
          <span class="os-status ${d(a.status)}">${Ko[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${o}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Yo[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Oe("one-seat")}</p>
    </div>`:""}function Oe(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Pe(e,t,n=null){let a=e===t?" same":"",o=n?` ${n}`:"";return`<dd class="cmp${a}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${o}">${t}</span></dd>`}function _n(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Pn(e){return e.first==null||e.last==null?null:e.last-e.first}function De(e,t){let n=new Set(e.filter(a=>t.includes(a)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${On(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${On(t,n,"prop")}</div>
    </div>`}function On(e,t,n){return e.length?e.map(a=>`<span class="route ${t.has(a)?"both":`only-${n}`}">${d(a)}</span>`).join(" "):'<span class="muted">none</span>'}var ht=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Wo="Allegheny";function ye(e){let t=e.place?.muni?.trim()??"",n=ht.exec(t)?.[1],a=n===Wo?t.replace(ht,""):n?`${t.replace(ht,"")} (${n})`:t;return e.place?.hood||a||"this location"}function bt(e){return e==="weekday"?"weekday":e}function En(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${bt(t)}`}function qo(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${bt(t)}, today only</span>`}${a}</dd>`}function Xo(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Oe("boardings")}</p>`}function Qo(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
    </div>`}function vt(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],s=o.trips-a.trips,r=s>0?"up":s<0?"down":"flat",l=xn(a),u=xn(o),p=Pn(a),m=Pn(o);return`
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
        ${s===0?"no change":`${dt(s)} trips`}
        <div class="muted">${pn(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${bt(t)}, both directions</div>

    <div class="tiers">${zo(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Go(a,o)}</tbody>
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
      ${Pe(kn(a),kn(o))}
      <dt>Hours between</dt>
      ${Pe(ut(p),ut(m),_n(p,m,"more"))}
      <dt>Typical wait</dt>
      ${Pe(l==null?"\u2014":`${l} min`,u==null?"\u2014":`${u} min`,_n(l,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Pe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${qo(a.boardings,t)}
    </dl>
    ${Xo(a.boardings)}

    ${n}

    ${Qo(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${De(a.routes,o.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Oe("location-not-route")}</p>
    </div>`}function Cn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(ye(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${vt(e,ft,Vo(e.oneseat??[],e.oneseat_day??"any"))}`}var Zo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},es={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},ts={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ns(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function wt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Tn(t)}</div>`:""}function as(e){let t=wt("kept",e.kept)+wt("lost",e.lost)+wt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function os(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${De(e.current,e.proposed)}
    </div>`}function ss(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${d(o.key)}">
      <span class="os-name">${d(o.name)}</span>
      <span class="os-status ${d(o.status)}">${rs[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var rs={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function is(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${ts[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Mn(e,t,n){let a=ns(e,t);if(!a)return"";let o=e.oneseat_day??"any",s=a.status==="here"?"":as(a)+os(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(a.name)}</h2>
      <div class="muted">
        from ${d(ye(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(a.status)}">${Zo[a.status]}</div>
    <p class="note">${es[a.status]} ${is(o)}</p>

    ${s}

    ${ss(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${En(e,n)}</summary>
      ${vt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Fn(e){return`
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
    </div>`}var Ee={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Ce="change",he="change-dots",Re=["boolean",["feature-state","selected"],!1],ls="#15181e",Te=null,ee=new Set,E=new Set;function St(){return Te}function Lt(e){return ee.has(e)}function Nn(e,t,n,a){return o=>ds(o,e,t,n,a)}function An(e){return t=>e.has(mt(t))}function Hn(){return E}function Bn(){return[...E].sort()}function jn(){return E.size}function $t(e,t){let n=0;for(let a of t)E.has(a)||(E.add(a),fe(e,a,!0),n++);return n}function Un(e,t){E.delete(t)?fe(e,t,!1):(E.add(t),fe(e,t,!0))}function In(e,t){kt(e),$t(e,t)}function kt(e){for(let t of E)fe(e,t,!1);E.clear()}function fe(e,t,n){try{e.setFeatureState({source:Ce,id:t},{selected:n})}catch{}}function cs(e){for(let t of E)fe(e,t,!0)}function us(e,t,n,a){let o=n*n;return a.filter(s=>(s.x-e)**2+(s.y-t)**2<=o).map(s=>s.id)}function xt(e,t,n,a){let o=[[t-a,n-a],[t+a,n+a]],s=e.queryRenderedFeatures(o,{layers:[he]}).filter(r=>r.id!==void 0).map(r=>{let[l,u]=r.geometry.coordinates,p=e.project([l,u]);return{id:r.id,x:p.x,y:p.y}});return us(t,n,a,s)}function Jn(e,t,n,a){let o={};for(let s of n)o[s]=0;for(let s of e){if(!a(s))continue;let r=n[K(s,me(t))];r!==void 0&&o[r]++}return o}function ds(e,t,n,a,o){let s=K(e,0),r=K(e,1);return s>=n&&s<=o&&r>=t&&r<=a}function zn(e,t,n,a){let o={riders:{},measured:{},unmeasured:0};for(let s of n)o.riders[s]=0,o.measured[s]=0;for(let s of e){if(!a(s))continue;let r=n[K(s,me(t))];if(r===void 0)continue;let l=vn(s,t);if(l===null){r!=="none"&&o.unmeasured++;continue}o.riders[r]+=l,o.measured[r]++}return o}function ps(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>O.some((a,o)=>t[K(n,me(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:mt(n),published:n[2],...Object.fromEntries(O.flatMap((a,o)=>[[`b${o}`,t[K(n,me(o))]],[`c${o}`,n[fn(o)]],[`p${o}`,n[bn(o)]]]))}}))}}function ge(e,t){let n=Object.entries(Ee).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,Ee.none[t]]}function Gn(e){return["interpolate",["linear"],["zoom"],9,["*",ge(e,"size"),.45],12,ge(e,"size"),16,["*",ge(e,"size"),1.9]]}function Kn(e){e.addSource(Ce,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:he,type:"circle",source:Ce,paint:{"circle-color":ge(0,"color"),"circle-radius":Gn(0),"circle-opacity":.85,"circle-stroke-color":["case",Re,ls,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",Re,1.6,.5],12,["case",Re,2.4,1],16,["case",Re,3.2,1.6]]}},"walk-fill")}async function _t(e,t,n){return Te=await S(`/api/change?radius=${t}`),e.getSource(Ce).setData(ps(Te)),cs(e),Pt(e,n),Te}function Pt(e,t){let n=O.indexOf(t);e.setPaintProperty(he,"circle-color",ge(n,"color")),e.setPaintProperty(he,"circle-radius",Gn(n)),Ot(e,t)}function Yn(e,t,n){ee.has(t)?ee.delete(t):ee.add(t),Ot(e,n)}function Vn(e,t){ee.clear(),Ot(e,t)}function Ot(e,t){let n=O.indexOf(t),a=["none",...ee];e.setFilter(he,["!",["in",["get",`b${n}`],["literal",a]]])}function Wn(e,t,n){let a=O.indexOf(t),o=e[`b${a}`],s=n.find(p=>p.key===o)?.label??o,r=e[`c${a}`],l=e[`p${a}`];return`<b>${s}</b><br>${r} \u2192 ${l} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Dt="surface",Fe="surface-fill",qn="#6b7280",Rt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,qn],[.138,qn],[1,"#12a163"],[2,"#0b7a48"]],R="#e8232f",T="#0f79c9",Xn=2,Me=null,Qn=!1;function Ne(){return Me}function Tt(){return Qn}function Zn(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Xn,Math.min(Xn,n))}function ea(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function ta(e,t,n,a,o,s,r,l){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=r.lat0+(p[1]+.5)*r.dlat,v=r.lon0+(p[0]+.5)*r.dlon;if(m<a||m>s||v<n||v>o)continue;let k=p[yt(t)],x=p[gt(t)],j=ea(k,x);if(j!=="none")if(j==="ramp"){let g=Zn(k,x);u[g<-.138?"less":g>.138?"more":"same"]+=l}else u[j]+=l}return u}function ms(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*a,l=r+a,u=n+s[0]*o,p=u+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[p,r],[p,l],[u,l],[u,r]]]},properties:Object.fromEntries(O.flatMap((m,v)=>{let k=s[yt(v)],x=s[gt(v)];return[[`k${v}`,ea(k,x)],[`v${v}`,Zn(k,x)??0]]}))}})}}function na(e){return["case",["==",["get",`k${e}`],"gone"],R,["==",["get",`k${e}`],"new"],T,["interpolate",["linear"],["get",`v${e}`],...Rt.flatMap(([t,n])=>[t,n])]]}function te(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function aa(e,t){e.addSource(Dt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Fe,type:"fill",source:Dt,layout:{visibility:"none"},paint:{"fill-color":na(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,te(0,.85),13,te(0,.62),16,te(0,.45)]}},t)}async function Et(e,t,n){return Me=await S(`/api/surface?radius=${t}`),e.getSource(Dt).setData(ms(Me)),Ct(e,n),Me}function Ct(e,t){let n=O.indexOf(t);e.setPaintProperty(Fe,"fill-color",na(n)),e.setPaintProperty(Fe,"fill-opacity",["interpolate",["linear"],["zoom"],9,te(n,.85),13,te(n,.62),16,te(n,.45)])}function oa(e,t){Qn=t,e.setLayoutProperty(Fe,"visibility",t?"visible":"none")}var Mt=null;function Ae(){return Mt}async function Ft(e){return Mt=await S(`/api/population?radius=${e}`),Mt}function sa(e,t,n,a,o,s,r){let l={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;p<a||p>s||m<n||m>o||(l.lost+=u[wn(t)],l.gained+=u[Sn(t)],l.kept+=u[Ln(t)],l.none+=u[$n(t)])}return l}var Nt="corridor",ra="corridor-lines",je="#8b929c",ys="#6f7783",Be={lost:R,added:T,kept:je};var He=null,ia=!1;function Ue(){return He}function At(){return ia}function gs(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function la(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function hs(){let e=t=>["match",["get","klass"],"lost",Be.lost,"added",Be.added,t];return["interpolate",["linear"],["zoom"],9,e(ys),14,e(je)]}function fs(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function bs(){return["match",["get","klass"],"kept",.85,.9]}function ca(e,t){e.addSource(Nt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ra,type:"line",source:Nt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":hs(),"line-width":fs(),"line-opacity":bs()}},t)}async function Ht(e,t){return He=await S(`/api/corridors?day=${t}`),e.getSource(Nt).setData(gs(He)),He}async function ua(e,t){O.includes(t)&&await Ht(e,t)}function da(e,t){ia=t,e.setLayoutProperty(ra,"visibility",t?"visible":"none")}var jt="#2b3038",pa="#b9bec6",be={loses:{color:R,size:6},gains:{color:T,size:6},keeps:{color:je,size:3},here:{color:jt,size:3.5},none:{color:pa,size:1.8}},Je=["loses","gains","keeps","none","here"],Bt="oneseat",ma="oneseat-dots",Ie=null,ya=!1;function ne(){return Ie}function Ut(){return ya}function ga(e,t,n,a,o,s){let r={};for(let l of t)r[l]=0;for(let l of e){let u=l[0],p=l[1];if(u<a||u>s||p<n||p>o)continue;let m=t[l[3]];m!==void 0&&r[m]++}return r}function vs(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function ws(){return["match",["get","status"],...Object.entries(be).flatMap(([e,t])=>[e,t.color]),pa]}function Ss(){let e=["match",["get","status"],...Object.entries(be).flatMap(([t,n])=>[t,n.size]),be.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function ha(e,t){e.addSource(Bt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ma,type:"circle",source:Bt,layout:{visibility:"none"},paint:{"circle-color":ws(),"circle-radius":Ss(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ls(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var $s="pin";function fa(e){return"key"in e?e.key:$s}var ze="any";function ks(e,t,n){return`radius=${e}&${Ls(t)}&day=${n}`}function ba(e,t){return e?t:ze}function va(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function It(e,t,n,a=ze){return Ie=await S(`/api/oneseat?${ks(t,n,a)}`),e.getSource(Bt).setData(vs(Ie)),Ie}function wa(e,t){ya=t,e.setLayoutProperty(ma,"visibility",t?"visible":"none")}function Jt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Sa(e,t){let n=t.statuses.find(l=>l.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),s=l=>l.length?l.join(", "):"none",r=Jt(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(a)}<br>proposed: ${s(o)}`}var zt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function xs(e){return e.buckets.filter(t=>t.key!=="none")}var La={area:"Ground",people:"People"};function _s(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=ta(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(o.less)}</b> km\xB2 less</span>
        <span><b>${s(o.more)}</b> km\xB2 more</span>
        <span><b>${s(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Ps(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=sa(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(o.lost)}</b> people lose all service</span>
        <span><b>${s(o.gained)}</b> gain service</span>
        <span><b>${s(o.kept)}</b> keep a bus</span>
        <span><b>${s(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}var Os=`
      <div class="lg-ends" style="margin-top:6px">Ground and people are
        measured across the view, not the stops you selected \u2014 a 100 m cell
        has no stop to select. Clear the selection to count them.</div>`;function Ds(e){let{layer:t,day:n,bounds:a,unit:o,population:s,scoped:r=!1}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Rt.map(([u,p])=>`${p} ${((u+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${R}"></i>loses all service</span>
        <span><i style="background:${T}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(La).map(u=>`
          <button data-surface-unit="${u}" aria-pressed="${o===u}"
                  class="${o===u?"active":""}">${La[u]}</button>`).join("")}
      </div>
      ${r?Os:o==="people"?Ps(n,a,s):_s(t,n,a)}
    </div>`}var Rs=["lost","added","kept"],Ts={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Es={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function ka(e,t){let{lostPct:n,addedPct:a}=la(t.km),o=l=>l.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${Es[t.day]}
    </div>
    ${Rs.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${Be[l]}"></i>
        <span class="lg-lab">${d(Ts[l])}</span>
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
      what you can still reach on foot.</div>`}function xa(e,t,n){let a=t.statuses.map(m=>m.key),o=ga(t.points,a,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(v=>v.key===m)?.label??m,r=Je.reduce((m,v)=>m+(o[v]??0),0),l=Jt(t),u=t.day&&t.day!==ze,p=u?`Restricted to routes running on ${zt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(l)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${zt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Je.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${be[m].color}"></i>
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
      South Hills losing rides the Blue Line still runs.</div>`}function _a(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var $a={locations:"Locations",riders:"Riders"};function Cs(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function Ms(){return`<div class="lg-foot">Dots mark the places a bus stops today, plus the
    ground the plan adds a bus to where nothing stops within the walk radius
    now. So a stop the plan adds beside one that already exists changes a dot's
    colour rather than adding one. Streets colours the pavement itself, and
    shows the rest.</div>`}function Pa(e,t){let{layer:n,day:a,bounds:o,weight:s,surface:r,unit:l="area",population:u,selection:p}=t,m=n.buckets.map(w=>w.key),v=n.days.indexOf(a),{west:k,south:x,east:j,north:g}=o,z=xs(n),_=p&&p.size>0?p:null,X=_?An(_):Nn(k,x,j,g),ct=Jn(n.points,v,m,X),G=s==="riders"?zn(n.points,v,m,X):null,No=w=>G?G.measured[w]?Math.round(G.riders[w]).toLocaleString():"\u2014":ct[w].toLocaleString(),Ao=_?`at ${_.size.toLocaleString()} selected stop${_.size===1?"":"s"}`:"in view",Ho=G?`<b>${Math.round(z.reduce((w,pe)=>w+G.riders[pe.key],0)).toLocaleString()}</b> daily boardings ${Ao}`:_?`<b>${z.reduce((w,pe)=>w+ct[pe.key],0).toLocaleString()}</b>
         of ${_.size.toLocaleString()} selected stops`:`<b>${z.reduce((w,pe)=>w+ct[pe.key],0).toLocaleString()}</b>
         locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${Ho}
      <span class="muted">\xB7 ${zt[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys($a).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${$a[w]}</button>`).join("")}
    </div>
    ${z.map(w=>`
      <button class="lg-row ${Lt(w.key)?"off":""}" data-bucket="${d(w.key)}"
              aria-pressed="${!Lt(w.key)}">
        <i style="background:${Ee[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(w.label)}</span>
        <span class="lg-n">${No(w.key)}</span>
      </button>`).join("")}
    ${r?Ds({layer:r,day:a,bounds:o,unit:l,population:u,scoped:!!_}):""}
    ${G?Cs(G.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}
    ${Ms()}
    ${_?`
    <div class="lg-foot">These are the stops you painted, not everything on
      screen \u2014 a selection you chose by hand, so quote it as one. The link in
      your address bar carries it.</div>`:""}`}var Gt="#4aa3ff",Ma="#ffa23a",Kt="headline",Ge="journey",Fa="journey-rides",Na="journey-walks",Fs=[Fa,Na],Aa=null,Ha=!1;function Ye(){return Aa}function Yt(){return Ha}function Ns(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let s=n[o].itinerary;if(s)for(let r of s.legs){let l=r.from??e.origin,u=r.to??e.destination,p=[[l.lon,l.lat],[u.lon,u.lat]],m=r.path?.length?r.path:p;a.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:o,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:a}}function Oa(){return["match",["get","side"],"current",Gt,"proposed",Ma,Gt]}function Da(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Ba(e,t){e.addSource(Ge,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Fa,type:"line",source:Ge,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Oa(),"line-width":Da(1),"line-opacity":.85}},t),e.addLayer({id:Na,type:"line",source:Ge,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Oa(),"line-width":Da(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ja(e,t){Ha=t;for(let n of Fs)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Vt(e,t){Aa=t;let n=t?Ns(t,Kt):{type:"FeatureCollection",features:[]};e.getSource(Ge).setData(n)}function Ua(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Ra=e=>`${e.toFixed(1)} min`;function Ia(e){return e==null?"\u2014":e===0?"no change":e>0?`${Ra(e)} slower`:`${Ra(-e)} faster`}function Ta(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function As(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=Ta(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Ta(e.to,"the destination")}</span></div>`}function Ea(e,t){let n=[],a=null;for(let o of e.legs){let s=a?Math.round(o.depart-a.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(As(o,t)),a=o}return n.join("")}var Hs={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Ke(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Bs(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function js(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Ke(t.current)} \u2192
        ${Ke(t.proposed)} min</span>
        <span class="muted">${Ia(t.change_min)}</span></div>
      ${a}
    </div>`}function Ca(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Wt(e,t){let n=e.radii[Kt],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
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
        <p>${Hs[n.classification]??""}</p>
      </div>
      ${Ca(e)}`:`${o}
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
      <div class="hl-delta ${a}">${Ia(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Bs(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Ea(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Ea(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${js(e)}
    ${Ca(e)}`}function Ja(e){return`
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
    </div>`}function za(e){let t=e?e.radii[Kt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Gt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Ma}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var qe="places",Ya="places-points",qt="places-boundaries",C="places-fill",oe="lost",Us=100,Is={lost:"share_lost",gained:"share_gained"};function I(e,t){return`service_${e}_${t}`}var Va={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Js="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Y={lost:R,gained:T},Ve=null,U=null,ae=null,Wa=!1,We=null;function Xt(){return Ve}function qa(){return U}function Xa(){return We}function Qt(){return ae}function ve(){return Wa}function zs(e,t){let n=[...e];return t==="count"?n.sort((a,o)=>o.residents_lost-a.residents_lost):n.sort((a,o)=>(o.share_lost??-1)-(a.share_lost??-1))}function Gs(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Ks(e){return Math.max(e.residents_lost,e.residents_gained)}var Ga=4,Ys=16,Vs=1e3;function Ws(e){let t=Math.min(1,Math.sqrt(e/Vs));return Ga+t*(Ys-Ga)}function qs(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Gs(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Ws(Ks(t))}}))}}function Xs(){return["match",["get","klass"],"lost",Y.lost,"gained",Y.gained,Y.lost]}function Qs(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var H=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var B=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Qa(e,t){return e==="service"?["step",["abs",["coalesce",["get",I(t,"pct")],0]],B[0].opacity,B[0].max,B[1].opacity,B[1].max,B[2].opacity,B[2].max,B[3].opacity]:["step",["coalesce",["get",Is[e]],0],H[0].opacity,Number.EPSILON,H[1].opacity,H[1].max,H[2].opacity,H[2].max,H[3].opacity,H[3].max,H[4].opacity]}function Za(e,t){return e==="service"?["case",[">=",["coalesce",["get",I(t,"pct")],0],0],T,R]:Y[e]}function Zs(e,t){let n=I(t,"now"),a=I(t,"proposed");return e.features.filter(o=>o.properties[n]===0&&o.properties[a]>0).map(o=>o.properties.place)}var er=3;function tr(e){if(e.length===0)return"";let t=e.slice(0,er),n=e.length-t.length,a=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,o=n>0?`${a} (and ${n} more)`:a;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${o}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${o}.`}function eo(e,t){e.addSource(qt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:C,type:"fill",source:qt,layout:{visibility:"none"},paint:{"fill-color":Za(oe),"fill-opacity":Qa(oe),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(qe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ya,type:"circle",source:qe,layout:{visibility:"none"},paint:{"circle-color":Xs(),"circle-radius":Qs(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Xe(e,t,n){e.setPaintProperty(C,"fill-color",Za(t,n)),e.setPaintProperty(C,"fill-opacity",Qa(t,n))}async function to(){return Ve||(Ve=await S("/api/places")),Ve}async function no(e){return ae||(ae=await S("/api/boundaries"),e.getSource(qt).setData(ae)),ae}function nr(e,t){let n=e?.features.find(a=>a.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function ao(e,t){let n=nr(ae,t);if(n)return U=null,We=n,e.getSource(qe)?.setData({type:"FeatureCollection",features:[]}),null;try{U=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return U=null,We=null,null}return We=null,e.getSource(qe).setData(qs(U)),e.flyTo({center:[U.lon,U.lat],zoom:13}),U}function oo(e,t){Wa=t,e.setLayoutProperty(Ya,"visibility",t?"visible":"none"),e.setLayoutProperty(C,"visibility",t?"visible":"none")}function ar(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var or="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function so(e,t,n,a){let o=zs(e,t).map(s=>ar(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Js}</p>
    ${a==="service"?`<p class="note">${or}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${o}</div>`}function ro(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function sr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function rr(e,t,n,a){let o=B.map((u,p)=>({band:u,prevMax:p===0?0:B[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=sr(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${R};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=a?Zs(a,n):[],r=tr(s),l=r?`<div class="lg-foot">${d(r)}</div>`:"";return`
    ${ro(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(Va[n])}</div>
    ${o}
    ${l}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function io({selected:e,fill:t,day:n,boundaries:a,unchanged:o}){if(t==="service")return rr(e,o??null,n,a??null);let s=t==="lost"?"lose all buses":"gain a bus",r=H.filter(l=>l.opacity>0).map(l=>`
    <div class="lg-row lg-static">
      <i style="background:${Y[t]};opacity:${l.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(l.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${ro(e,o??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Y.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Y.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function ir(e,t){let n=e[I(t,"now")],a=e[I(t,"proposed")],o=e[I(t,"pct")],s=e[I(t,"rail_proposed")],r=Va[t];if(a===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&a>0)return`Gets its first bus on ${r} (0 \u2192 ${a} trips).`;let l=o==null?"\u2014":`${o>0?"+":""}${o.toFixed(1)}%`;return`${n} \u2192 ${a} trips on ${r} (${l}).`}function lo(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${ir(e,n)}`;let a=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${a} residents lose or gain a bus.`;let o=Ka("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Ka("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[o,s]:[s,o]).filter(l=>l!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${a} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Ka(e,t,n){let a=Math.round(t).toLocaleString(),o=n==null?`share withheld \u2014 under ${Us} residents`:`${(n*100).toFixed(1)}%`;return`${a} ${e} (${o})`}var Zt=" \xB7 ",en={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},co=Object.keys(en);function uo(e){return en[e]??e}var lr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},cr=["oneseat","journey"];function ur(e){return e!=="journey"}function dr(e){let t=[en[e.view]??e.view];return e.view==="places"?t[0]:(cr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":lr[e.day]),ur(e.view)&&t.push(`${e.radius} m walk`),t.join(Zt))}function po(e){let[t,...n]=dr(e).split(Zt);return`<b>${d(t)}</b>${n.map(a=>Zt+d(a)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},pr=/^[cp]:[\w.:-]{1,32}$/,Qe={any:"any",selected:"selected"},mr="pin",mo=5;function go(e){try{return e.self!==e.top}catch{return!0}}function ho(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?Qe.selected:Qe.any),t.set(h.dest,"key"in e.dest?e.dest.key:tn(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,tn(e.at)),e.camera&&t.set(h.camera,`${tn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==oe&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),`?${t}`}function fo(e){let t=new URLSearchParams(e),n={},a=t.get(h.view);a&&co.includes(a)&&(n.view=a);let o=t.get(h.day);o&&O.includes(o)&&(n.day=o);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(h.oneSeatDay);r===Qe.selected?n.oneSeatRestricted=!0:r===Qe.any&&(n.oneSeatRestricted=!1);let l=t.get(h.dest);if(l&&l!==mr){let x=yo(l);x?n.dest=x:l.includes(",")||(n.dest={key:l})}let u=yo(t.get(h.at));u&&(n.at=u);let p=yr(t.get(h.camera));p&&(n.camera=p);let m=t.get(h.place);m&&(n.place=m);let v=t.get(h.selection);v!==null&&(n.selection=v.split(",").filter(x=>pr.test(x)));let k=t.get(h.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function tn(e){return`${e.lat.toFixed(mo)},${e.lon.toFixed(mo)}`}function yo(e){let t=bo(e,2);return t?{lat:t[0],lon:t[1]}:null}function yr(e){let t=bo(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function bo(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var nn="embed";var gr=["1","true","yes"];function vo(e){let t=new URLSearchParams(e).get(nn);return t!==null&&gr.includes(t.toLowerCase())}function wo(e){let t=new URLSearchParams(e);return t.set(nn,"1"),`?${t}`}function So(e){let t=new URLSearchParams(e);t.delete(nn);let n=String(t);return n?`?${n}`:""}function Lo(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var J=["peek","half","full"],hr=192,fr=.3,br=.55,vr=.9,wr=.6,Sr=.45;function Ze(e,t){return e==="peek"?Math.min(hr,t*fr):e==="half"?t*br:t*vr}function Lr(e,t,n=0){let a=J.map(s=>Math.abs(Ze(s,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>wr&&(o=Math.max(0,Math.min(J.length-1,o+(n>0?1:-1)))),J[o]}function $o(e){return J[(J.indexOf(e)+1)%J.length]}function $r(e,t){return Math.min(e,t*Sr)}function se(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function an(e){let t=null,n=()=>{let a=se();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var kr=8,xr=400;function ko(e){let t=c("side"),n=c("sheet-handle"),a="peek",o=!1,s=0,r=0,l=0,u={y:0,t:0};function p(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,$r(g,p()))}function v(g){a=g,t.dataset.snap=g,m(Ze(g,p()))}n.addEventListener("pointerdown",g=>{se()&&(o=!0,s=g.clientY,r=t.getBoundingClientRect().height,l=g.timeStamp,u={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!o)return;let z=r+(s-g.clientY),_=Ze("peek",p()),X=Ze("full",p());m(Math.max(_,Math.min(X,z))),u={y:g.clientY,t:g.timeStamp}});function k(g){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-s)>kr)&&g.timeStamp-l<xr){v($o(a));return}let _=g.timeStamp-u.t,X=_>0?(u.y-g.clientY)/_:0;v(Lr(t.getBoundingClientRect().height,p(),X))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),se()&&v($o(a)))});let x=an(e.onLayoutChange);function j(){if(x(),!se()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}v(a)}return window.addEventListener("resize",j),j(),{at:()=>se()?a:"full",atLeast(g){se()&&J.indexOf(g)>J.indexOf(a)&&v(g)}}}var _r=[-79.9959,40.4406],Pr=12,Or="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},Se=fo(location.search),$e=vo(location.search);$e&&c("app").classList.add("embed");var Dr={at:()=>"full",atLeast(){}},Po=null,P=400,we=null,f=null,ie=null,q=0,$={key:"downtown"},V=null,Oo=!1,ue=!1,rt="locations",de="area",Do="count",ot=null,M=oe,N=!1,y="dots",Ro,rn=[],i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:Se.camera?[Se.camera.lon,Se.camera.lat]:_r,zoom:Se.camera?.zoom??Pr,cooperativeGestures:go(window),attributionControl:{compact:!0}});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{yn(i),Kn(i),aa(i,"change-dots"),ca(i,"change-dots"),ha(i,"walk-fill"),Ba(i),eo(i,"change-dots"),F(),i.on("click",t=>{if(N)return;if(Oo){Le({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(y==="places"){let s=i.queryRenderedFeatures(t.point,{layers:[C]})[0];s&&tt(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>i.getLayoutProperty(s,"visibility")!=="none"),a=i.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];dn(o[1],o[0])}),i.on("mouseenter",C,()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave",C,()=>{i.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=St();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Wn(n.properties,L(),a.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=ne();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Sa(n.properties,a)).addTo(i)}),i.on("mouseleave",C,()=>e.remove()),i.on("mousemove",C,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(lo(n.properties,M,L())).addTo(i)}),Gr(),i.on("moveend",()=>{let t=i.getCenter();Po={lat:t.lat,lon:t.lng,zoom:i.getZoom()},b(),A()}),re(D.radius,t=>{P=Number(t.dataset.radius),_t(i,P,L()).then(b),Ne()&&Et(i,P,L()).then(b),Ae()&&Ft(P).then(b),ne()&&nt(),f&&le(f.lat,f.lon)}),re(D.day,t=>{let n=t.dataset.day;Dn(n),y!=="journey"&&F(),Pt(i,n),Ct(i,n),y==="journey"&&f&&ln(f.lat,f.lon),Ue()&&ua(i,n).then(b),ue&&ne()&&(nt(),f&&le(f.lat,f.lon)),ve()&&M==="service"&&Xe(i,M,n),b()}),re(D.oneSeatDay,t=>{ue=t.dataset.oneseatDay==="selected",sn(),nt(),f&&le(f.lat,f.lon)}),re(D.view,t=>{let n=y;y=t.dataset.view,i.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),Fr(y==="surface"||y==="both"),Ar(y==="corridors"),Ur(y==="oneseat"),jr(y==="journey",n==="journey"),Hr(y==="places"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&F({scrollToTop:!0}),Br(y!=="corridors"&&y!=="journey"&&y!=="places");let a=y==="oneseat"||y==="journey";c("dest-controls").classList.toggle("hidden",!a),c("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",y!=="places"),st()||xo(!1),ce(),sn(),a||at(!1),Eo()}),re(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){at(!0);return}at(!1),Le({key:n})}),re(D.placeFill,t=>{M=t.dataset.placeFill,ve()&&Xe(i,M,L()),F(),b(),sn()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){rt=n.dataset.weight,b(),A();return}let a=t.target.closest("[data-surface-unit]");if(a){de=a.dataset.surfaceUnit,Nr(de),A();return}let o=t.target.closest("[data-bucket]");o&&(Yn(i,o.dataset.bucket,L()),b())}),c("legend-reset").addEventListener("click",()=>{Vn(i,L()),b()}),c("legend-select").addEventListener("click",()=>xo(!N)),c("legend-clear").addEventListener("click",()=>{kt(i),ce(),b(),A()}),c("legend-collapse").addEventListener("click",()=>{on(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Le({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&Vr(a.dataset.caveat);let o=t.target.closest("[data-select-place]");o&&tt(o.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(Do=s.dataset.sortPlaces,F());let r=t.target.closest("[data-goto-place]");r&&(y!=="places"&&W(D.view,"places"),tt(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Cr),$e&&an(on),Ro=$e?Dr:ko({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),i.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:on}),Tr(),lt(),ce(),it(),Rr(Se)||_t(i,P,L()).then(b),Yr(),Kr()});function re(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),lt(),A()})})}function W(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Rr(e){let t=!1;return e.radius!==void 0&&(t=W(D.radius,String(e.radius))||t),e.day&&(t=W(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&W(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(rt=e.weight),e.surfaceUnit&&(de=e.surfaceUnit),e.placeFill&&W(D.placeFill,e.placeFill),e.dest&&("key"in e.dest?W(D.dest,e.dest.key):Le(e.dest)),e.selection&&In(i,e.selection),e.view&&W(D.view,e.view),e.at&&dn(e.at.lat,e.at.lon),e.place&&tt(e.place),t}function A(){let e={view:y,day:L(),radius:P,oneSeatRestricted:ue,weight:rt,surfaceUnit:de,dest:$,at:f,camera:Po,place:ot,placeFill:M,selection:Bn()},t=ho(e);history.replaceState(null,"",($e?wo(t):t)+location.hash),it(t)}function it(e=So(location.search)){if(!$e)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?ie?ye(ie):"this point":null;t.querySelector(".el-action").textContent=Lo(n)}function lt(){c("statebar").innerHTML=po({view:y,day:L(),radius:P,oneSeatRestricted:ue,destination:ke()}),Er()}function on(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Tr(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Er(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(uo(y)))}function Cr(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),i.resize()}function b(){Mr()}function Mr(){if(c("legend-reset").classList.toggle("hidden",At()||Ut()||Yt()||ve()),Yt()){c("legend").innerHTML=za(Ye());return}if(ve()){c("legend").innerHTML=io({selected:qa(),fill:M,day:L(),boundaries:Qt(),unchanged:Xa()});return}if(At()){let n=Ue();n&&ka(c("legend"),n);return}if(Ut()){let n=ne();if(!n)return;let a=i.getBounds();xa(c("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=St();if(!e)return;let t=i.getBounds();Pa(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:rt,surface:Tt()?Ne():null,unit:de,population:Ae(),selection:Hn()})}async function Fr(e){if(e&&!Ne()){c("legend").classList.add("loading");try{await Et(i,P,L())}finally{c("legend").classList.remove("loading")}}oa(i,e),e&&de==="people"&&await To(),b()}async function To(){if(!Ae()){c("legend").classList.add("loading");try{await Ft(P)}finally{c("legend").classList.remove("loading")}}}async function Nr(e){e==="people"&&Tt()&&await To(),b()}async function Ar(e){if(e&&!Ue()){c("legend").classList.add("loading");try{await Ht(i,L())}finally{c("legend").classList.remove("loading")}}da(i,e),b()}async function Hr(e){if(e&&(!Xt()||!Qt())){c("legend").classList.add("loading");try{await Promise.all([to(),no(i)])}finally{c("legend").classList.remove("loading")}}oo(i,e),e&&Xe(i,M,L()),e&&F(),b()}async function tt(e){ot=await un(()=>ao(i,e))?e:null,y==="places"&&(F(),ot&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),A()}function Br(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function F({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),it(),y==="places"){c("panel").innerHTML=so(Xt()??[],Do,ot,M);return}if(!ie){y==="oneseat"?c("panel").innerHTML=Fn(ke()):Rn(c("panel"));return}if(y==="oneseat"){let t=Mn(ie,$,L());if(t){c("panel").innerHTML=t;return}}Cn(ie)}function jr(e,t=!1){if(ja(i,e),b(),!e){t&&(f?le(f.lat,f.lon):F());return}Ye()&&f?c("panel").innerHTML=Wt(Ye(),ke()):c("panel").innerHTML=Ja(ke())}async function ln(e,t){let n=++q;f={lat:e,lon:t},A(),Mo(e,t);let a=Co(),o=d(ke());if(!a){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(Ua({lat:e,lon:t},a,L()));if(n!==q)return;Vt(i,s),c("panel").innerHTML=Wt(s,o),b(),it()}catch(s){if(n!==q)return;Vt(i,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function sn(){c("day-controls").classList.toggle("hidden",!va(y,ue,M))}function cn(){return ba(ue,L())}async function Ur(e){e&&!ne()&&await un(()=>It(i,P,$,cn())),wa(i,e),b()}async function nt(){await un(()=>It(i,P,$,cn())),b()}async function un(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Le(e){if($=e,at(!1),Ir(),Eo(),lt(),A(),y==="journey"){f&&ln(f.lat,f.lon),b();return}f?le(f.lat,f.lon):F({scrollToTop:!0}),nt()}function Eo(){let e=Co();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in $))){V?.remove(),V=null;return}V?V.setLngLat([e.lon,e.lat]).addTo(i):(V=new maplibregl.Marker({color:jt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(i),V.on("dragend",()=>{let n=V.getLngLat();Le({lat:n.lat,lon:n.lng})}))}function Ir(){let e=fa($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Co(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=rn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ke(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return rn.find(t=>t.key===e)?.name??e}function at(e){Oo=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function le(e,t){let n=++q;f={lat:e,lon:t},A(),c("panel").classList.add("loading"),Mo(e,t);try{let a="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",o=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${a}&oneseat_day=${cn()}`);if(n!==q)return;gn(i,e,t,P,o.current.stops,o.proposed.stops),Jr(),ie=o,F({scrollToTop:!0})}catch(a){if(n!==q)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===q&&c("panel").classList.remove("loading")}}function Jr(){c("pin-key").innerHTML=_a(P),c("pin-key").classList.remove("hidden")}function Mo(e,t){we?we.setLngLat([t,e]):(we=new maplibregl.Marker({color:Or,draggable:!0}).setLngLat([t,e]).addTo(i),we.on("dragend",()=>{let n=we.getLngLat();dn(n.lat,n.lng)}))}var et=14;function st(){return y==="dots"||y==="both"}function xo(e){N=e&&st(),N?i.dragPan.disable():i.dragPan.enable(),i.getCanvas().style.cursor=N?"none":"",N||Fo(),ce()}function ce(){let e=c("legend-select");e.classList.toggle("hidden",!st()),e.setAttribute("aria-pressed",String(N)),e.textContent=N?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!st()||!jn())}function zr(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!N}function _o(e){c("brush").classList.toggle("painting",e)}function Fo(){c("brush").hidden=!0}function Gr(){let e=c("brush");e.style.width=`${et*2}px`,e.style.height=`${et*2}px`;let t=!1,n=!1,a=!1,o=()=>{a||(a=!0,requestAnimationFrame(()=>{a=!1,ce(),b()}))},s=()=>{N&&(t=!0,n=!1,_o(!0))},r=u=>{if(zr(u.point.x,u.point.y),!t)return;n=!0,$t(i,xt(i,u.point.x,u.point.y,et))&&o()},l=u=>{if(_o(!1),!!t){if(t=!1,!n){let[p]=xt(i,u.point.x,u.point.y,et);p&&Un(i,p)}ce(),b(),A()}};i.on("mousedown",s),i.on("mousemove",r),i.on("mouseup",l),i.getCanvas().addEventListener("mouseleave",Fo),i.on("touchstart",s),i.on("touchmove",r),i.on("touchend",l)}function dn(e,t){if(Ro.atLeast("half"),y==="journey"){ln(e,t);return}y!=="places"&&le(e,t)}async function Kr(){try{rn=await S("/api/destinations"),lt()}catch{}}async function Yr(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Vr(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
