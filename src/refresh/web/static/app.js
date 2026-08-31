"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Y(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function Xe(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Qe(e){return e>0?`+${e}`:String(e)}function Xt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var mo="#4aa3ff",yo="#ffa23a";function ho(e,t,n,a=96){let o=[],s=n/111320,i=n/(111320*Math.cos(e*Math.PI/180));for(let r=0;r<=a;r++){let u=r/a*2*Math.PI;o.push([t+i*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function K(e){return{type:"FeatureCollection",features:e}}function Qt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Zt(e){e.addSource("walk",{type:"geojson",data:K([])}),e.addSource("stops-now",{type:"geojson",data:K([])}),e.addSource("stops-prop",{type:"geojson",data:K([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":yo,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":mo,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let s=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function en(e,t,n,a,o,s){e.getSource("walk").setData(K([ho(t,n,a)])),e.getSource("stops-now").setData(K(Qt(o,"current"))),e.getSource("stops-prop").setData(K(Qt(s,"proposed")))}var x=["weekday","saturday","sunday"],Ze=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],tn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},fe=4,nn=e=>3+fe*e,an=e=>4+fe*e,re=e=>5+fe*e,go=e=>6+fe*e;var U=(e,t)=>e[t],on=(e,t)=>e[go(t)],et=e=>2+2*e,tt=e=>3+2*e,be=4,sn=e=>2+be*e,rn=e=>3+be*e,ln=e=>4+be*e,cn=e=>5+be*e;var at="weekday";function L(){return at}function hn(e){at=e}function gn(e){e.innerHTML=`
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
    </div>`}function fo(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function bo(e,t){let n=Math.max(1,...Ze.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return Ze.map(a=>{let o=e.periods[a]??0,s=t.periods[a]??0,i=s-o,r=i>0?"up":i<0?"down":"flat";return`
      <tr>
        <th>${tn[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${s}</td>
        <td class="n ${r}">${i===0?"\xB7":Qe(i)}</td>
      </tr>`}).join("")}function fn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function un(e){return e.first==null?'<span class="muted">no service</span>':`${Y(e.first)}\u2013${Y(e.last)}`}function dn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var vo={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},wo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function So(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':Se(a.current,a.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(a.name)}</span>
          <span class="os-status ${d(a.status)}">${vo[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${o}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${wo[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${we("one-seat")}</p>
    </div>`:""}function we(e){return` <button class="howto" data-caveat="${e}">method</button>`}function ve(e,t,n=null){let a=e===t?" same":"",o=n?` ${n}`:"";return`<dd class="cmp${a}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${o}">${t}</span></dd>`}function pn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function mn(e){return e.first==null||e.last==null?null:e.last-e.first}function Se(e,t){let n=new Set(e.filter(a=>t.includes(a)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${yn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${yn(t,n,"prop")}</div>
    </div>`}function yn(e,t,n){return e.length?e.map(a=>`<span class="route ${t.has(a)?"both":`only-${n}`}">${d(a)}</span>`).join(" "):'<span class="muted">none</span>'}var nt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Lo="Allegheny";function ie(e){let t=e.place?.muni?.trim()??"",n=nt.exec(t)?.[1],a=n===Lo?t.replace(nt,""):n?`${t.replace(nt,"")} (${n})`:t;return e.place?.hood||a||"this location"}function ot(e){return e==="weekday"?"weekday":e}function bn(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${ot(t)}`}function $o(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${ot(t)}, today only</span>`}${a}</dd>`}function ko(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${we("boardings")}</p>`}function _o(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${we("place-population")}</p>
    </div>`}function st(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],s=o.trips-a.trips,i=s>0?"up":s<0?"down":"flat",r=dn(a),u=dn(o),p=mn(a),m=mn(o);return`
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
      <div class="hl-delta ${i}">
        ${s===0?"no change":`${Qe(s)} trips`}
        <div class="muted">${Xt(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${ot(t)}, both directions</div>

    <div class="tiers">${fo(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${bo(a,o)}</tbody>
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
      ${ve(un(a),un(o))}
      <dt>Hours between</dt>
      ${ve(Xe(p),Xe(m),pn(p,m,"more"))}
      <dt>Typical wait</dt>
      ${ve(r==null?"\u2014":`${r} min`,u==null?"\u2014":`${u} min`,pn(r,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${ve(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${$o(a.boardings,t)}
    </dl>
    ${ko(a.boardings)}

    ${n}

    ${_o(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Se(a.routes,o.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${we("location-not-route")}</p>
    </div>`}function vn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(ie(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${st(e,at,So(e.oneseat??[],e.oneseat_day??"any"))}`}var xo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Po={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Oo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Do(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function rt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${fn(t)}</div>`:""}function Ro(e){let t=rt("kept",e.kept)+rt("lost",e.lost)+rt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function To(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Se(e.current,e.proposed)}
    </div>`}function Eo(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${d(o.key)}">
      <span class="os-name">${d(o.name)}</span>
      <span class="os-status ${d(o.status)}">${Co[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Co={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Mo(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Oo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function wn(e,t,n){let a=Do(e,t);if(!a)return"";let o=e.oneseat_day??"any",s=a.status==="here"?"":Ro(a)+To(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(a.name)}</h2>
      <div class="muted">
        from ${d(ie(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(a.status)}">${xo[a.status]}</div>
    <p class="note">${Po[a.status]} ${Mo(o)}</p>

    ${s}

    ${Eo(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${bn(e,n)}</summary>
      ${st(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Sn(e){return`
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
    </div>`}var $e={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},it="change",ke="change-dots",Le=null,V=new Set;function lt(){return Le}function ct(e){return V.has(e)}function Ln(e,t,n,a,o,s,i){let r={};for(let u of n)r[u]=0;for(let u of e){if(!$n(u,a,o,s,i))continue;let p=n[U(u,re(t))];p!==void 0&&r[p]++}return r}function $n(e,t,n,a,o){let s=U(e,0),i=U(e,1);return s>=n&&s<=o&&i>=t&&i<=a}function kn(e,t,n,a,o,s,i){let r={riders:{},measured:{},unmeasured:0};for(let u of n)r.riders[u]=0,r.measured[u]=0;for(let u of e){if(!$n(u,a,o,s,i))continue;let p=n[U(u,re(t))];if(p===void 0)continue;let m=on(u,t);if(m===null){p!=="none"&&r.unmeasured++;continue}r.riders[p]+=m,r.measured[p]++}return r}function Fo(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((a,o)=>t[U(n,re(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(x.flatMap((a,o)=>[[`b${o}`,t[U(n,re(o))]],[`c${o}`,n[nn(o)]],[`p${o}`,n[an(o)]]]))}}))}}function le(e,t){let n=Object.entries($e).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,$e.none[t]]}function _n(e){return["interpolate",["linear"],["zoom"],9,["*",le(e,"size"),.45],12,le(e,"size"),16,["*",le(e,"size"),1.9]]}function xn(e){e.addSource(it,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ke,type:"circle",source:it,paint:{"circle-color":le(0,"color"),"circle-radius":_n(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function ut(e,t,n){return Le=await S(`/api/change?radius=${t}`),e.getSource(it).setData(Fo(Le)),dt(e,n),Le}function dt(e,t){let n=x.indexOf(t);e.setPaintProperty(ke,"circle-color",le(n,"color")),e.setPaintProperty(ke,"circle-radius",_n(n)),pt(e,t)}function Pn(e,t,n){V.has(t)?V.delete(t):V.add(t),pt(e,n)}function On(e,t){V.clear(),pt(e,t)}function pt(e,t){let n=x.indexOf(t),a=["none",...V];e.setFilter(ke,["!",["in",["get",`b${n}`],["literal",a]]])}function Dn(e,t,n){let a=x.indexOf(t),o=e[`b${a}`],s=n.find(p=>p.key===o)?.label??o,i=e[`c${a}`],r=e[`p${a}`];return`<b>${s}</b><br>${i} \u2192 ${r} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var mt="surface",xe="surface-fill",Rn="#6b7280",yt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Rn],[.138,Rn],[1,"#12a163"],[2,"#0b7a48"]],O="#e8232f",D="#0f79c9",Tn=2,_e=null,En=!1;function Pe(){return _e}function ht(){return En}function Cn(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-Tn,Math.min(Tn,n))}function Mn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Fn(e,t,n,a,o,s,i,r){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=i.lat0+(p[1]+.5)*i.dlat,f=i.lon0+(p[0]+.5)*i.dlon;if(m<a||m>s||f<n||f>o)continue;let k=p[et(t)],E=p[tt(t)],F=Mn(k,E);if(F!=="none")if(F==="ramp"){let y=Cn(k,E);u[y<-.138?"less":y>.138?"more":"same"]+=r}else u[F]+=r}return u}function Ao(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let i=t+s[1]*a,r=i+a,u=n+s[0]*o,p=u+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,i],[p,i],[p,r],[u,r],[u,i]]]},properties:Object.fromEntries(x.flatMap((m,f)=>{let k=s[et(f)],E=s[tt(f)];return[[`k${f}`,Mn(k,E)],[`v${f}`,Cn(k,E)??0]]}))}})}}function An(e){return["case",["==",["get",`k${e}`],"gone"],O,["==",["get",`k${e}`],"new"],D,["interpolate",["linear"],["get",`v${e}`],...yt.flatMap(([t,n])=>[t,n])]]}function W(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Nn(e,t){e.addSource(mt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:xe,type:"fill",source:mt,layout:{visibility:"none"},paint:{"fill-color":An(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,W(0,.85),13,W(0,.62),16,W(0,.45)]}},t)}async function gt(e,t,n){return _e=await S(`/api/surface?radius=${t}`),e.getSource(mt).setData(Ao(_e)),ft(e,n),_e}function ft(e,t){let n=x.indexOf(t);e.setPaintProperty(xe,"fill-color",An(n)),e.setPaintProperty(xe,"fill-opacity",["interpolate",["linear"],["zoom"],9,W(n,.85),13,W(n,.62),16,W(n,.45)])}function Hn(e,t){En=t,e.setLayoutProperty(xe,"visibility",t?"visible":"none")}var bt=null;function Oe(){return bt}async function vt(e){return bt=await S(`/api/population?radius=${e}`),bt}function Bn(e,t,n,a,o,s,i){let r={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=i.lat0+(u[1]+.5)*i.dlat,m=i.lon0+(u[0]+.5)*i.dlon;p<a||p>s||m<n||m>o||(r.lost+=u[sn(t)],r.gained+=u[rn(t)],r.kept+=u[ln(t)],r.none+=u[cn(t)])}return r}var wt="corridor",jn="corridor-lines",Te="#8b929c",No="#6f7783",Re={lost:O,added:D,kept:Te};var De=null,Un=!1;function Ee(){return De}function St(){return Un}function Ho(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Jn(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Bo(){let e=t=>["match",["get","klass"],"lost",Re.lost,"added",Re.added,t];return["interpolate",["linear"],["zoom"],9,e(No),14,e(Te)]}function jo(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Uo(){return["match",["get","klass"],"kept",.85,.9]}function In(e,t){e.addSource(wt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:jn,type:"line",source:wt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Bo(),"line-width":jo(),"line-opacity":Uo()}},t)}async function Lt(e,t){return De=await S(`/api/corridors?day=${t}`),e.getSource(wt).setData(Ho(De)),De}async function Gn(e,t){x.includes(t)&&await Lt(e,t)}function zn(e,t){Un=t,e.setLayoutProperty(jn,"visibility",t?"visible":"none")}var kt="#2b3038",Yn="#b9bec6",ce={loses:{color:O,size:6},gains:{color:D,size:6},keeps:{color:Te,size:3},here:{color:kt,size:3.5},none:{color:Yn,size:1.8}},Me=["loses","gains","keeps","none","here"],$t="oneseat",Kn="oneseat-dots",Ce=null,Vn=!1;function q(){return Ce}function _t(){return Vn}function Wn(e,t,n,a,o,s){let i={};for(let r of t)i[r]=0;for(let r of e){let u=r[0],p=r[1];if(u<a||u>s||p<n||p>o)continue;let m=t[r[3]];m!==void 0&&i[m]++}return i}function Jo(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Io(){return["match",["get","status"],...Object.entries(ce).flatMap(([e,t])=>[e,t.color]),Yn]}function Go(){let e=["match",["get","status"],...Object.entries(ce).flatMap(([t,n])=>[t,n.size]),ce.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function qn(e,t){e.addSource($t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Kn,type:"circle",source:$t,layout:{visibility:"none"},paint:{"circle-color":Io(),"circle-radius":Go(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function zo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Yo="pin";function Xn(e){return"key"in e?e.key:Yo}var Fe="any";function Ko(e,t,n){return`radius=${e}&${zo(t)}&day=${n}`}function Qn(e,t){return e?t:Fe}function Zn(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function xt(e,t,n,a=Fe){return Ce=await S(`/api/oneseat?${Ko(t,n,a)}`),e.getSource($t).setData(Jo(Ce)),Ce}function ea(e,t){Vn=t,e.setLayoutProperty(Kn,"visibility",t?"visible":"none")}function Pt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function ta(e,t){let n=t.statuses.find(r=>r.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),s=r=>r.length?r.join(", "):"none",i=Pt(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${i}<br>today: ${s(a)}<br>proposed: ${s(o)}`}var Ot={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Vo(e){return e.buckets.filter(t=>t.key!=="none")}var na={area:"Ground",people:"People"};function Wo(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=Fn(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),s=i=>i.toFixed(i<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(o.less)}</b> km\xB2 less</span>
        <span><b>${s(o.more)}</b> km\xB2 more</span>
        <span><b>${s(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function qo(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=Bn(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=i=>Math.round(i).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(o.lost)}</b> people lose all service</span>
        <span><b>${s(o.gained)}</b> gain service</span>
        <span><b>${s(o.kept)}</b> keep a bus</span>
        <span><b>${s(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}function Xo(e){let{layer:t,day:n,bounds:a,unit:o,population:s}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${yt.map(([r,u])=>`${u} ${((r+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${O}"></i>loses all service</span>
        <span><i style="background:${D}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(na).map(r=>`
          <button data-surface-unit="${r}" aria-pressed="${o===r}"
                  class="${o===r?"active":""}">${na[r]}</button>`).join("")}
      </div>
      ${o==="people"?qo(n,a,s):Wo(t,n,a)}
    </div>`}var Qo=["lost","added","kept"],Zo={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},es={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function oa(e,t){let{lostPct:n,addedPct:a}=Jn(t.km),o=r=>r.toFixed(1),i=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${i}</b> km of street, citywide \u2014 ${es[t.day]}
    </div>
    ${Qo.map(r=>`
      <div class="lg-row lg-static">
        <i style="background:${Re[r]}"></i>
        <span class="lg-lab">${d(Zo[r])}</span>
        <span class="lg-n">${o(t.km[r])} km</span>
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
      what you can still reach on foot.</div>`}function sa(e,t,n){let a=t.statuses.map(m=>m.key),o=Wn(t.points,a,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(f=>f.key===m)?.label??m,i=Me.reduce((m,f)=>m+(o[f]??0),0),r=Pt(t),u=t.day&&t.day!==Fe,p=u?`Restricted to routes running on ${Ot[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(r)}</b>
      <span class="muted">\xB7 ${i.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${Ot[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Me.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${ce[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(o[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Me.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(r)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function ra(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var aa={locations:"Locations",riders:"Riders"};function ts(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function ia(e,t){let{layer:n,day:a,bounds:o,weight:s,surface:i,unit:r="area",population:u}=t,p=n.buckets.map(v=>v.key),m=n.days.indexOf(a),{west:f,south:k,east:E,north:F}=o,y=Vo(n),oe=Ln(n.points,m,p,f,k,E,F),P=s==="riders"?kn(n.points,m,p,f,k,E,F):null,se=v=>P?P.measured[v]?Math.round(P.riders[v]).toLocaleString():"\u2014":oe[v].toLocaleString(),po=P?`<b>${Math.round(y.reduce((v,qe)=>v+P.riders[qe.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${y.reduce((v,qe)=>v+oe[qe.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${po}
      <span class="muted">\xB7 ${Ot[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(aa).map(v=>`
        <button data-weight="${v}" aria-pressed="${s===v}"
                class="${s===v?"active":""}">${aa[v]}</button>`).join("")}
    </div>
    ${y.map(v=>`
      <button class="lg-row ${ct(v.key)?"off":""}" data-bucket="${d(v.key)}"
              aria-pressed="${!ct(v.key)}">
        <i style="background:${$e[v.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(v.label)}</span>
        <span class="lg-n">${se(v.key)}</span>
      </button>`).join("")}
    ${i?Xo({layer:i,day:a,bounds:o,unit:r,population:u}):""}
    ${P?ts(P.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var Dt="#4aa3ff",ya="#ffa23a",Rt="headline",Ae="journey",ha="journey-rides",ga="journey-walks",ns=[ha,ga],fa=null,ba=!1;function He(){return fa}function Tt(){return ba}function as(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let s=n[o].itinerary;if(s)for(let i of s.legs){let r=i.from??e.origin,u=i.to??e.destination,p=[[r.lon,r.lat],[u.lon,u.lat]],m=i.path?.length?i.path:p;a.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:o,kind:i.kind,route:i.route}})}}return{type:"FeatureCollection",features:a}}function la(){return["match",["get","side"],"current",Dt,"proposed",ya,Dt]}function ca(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function va(e,t){e.addSource(Ae,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ha,type:"line",source:Ae,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":la(),"line-width":ca(1),"line-opacity":.85}},t),e.addLayer({id:ga,type:"line",source:Ae,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":la(),"line-width":ca(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function wa(e,t){ba=t;for(let n of ns)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Et(e,t){fa=t;let n=t?as(t,Rt):{type:"FeatureCollection",features:[]};e.getSource(Ae).setData(n)}function Sa(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var ua=e=>`${e.toFixed(1)} min`;function La(e){return e==null?"\u2014":e===0?"no change":e>0?`${ua(e)} slower`:`${ua(-e)} faster`}function da(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function os(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=da(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${da(e.to,"the destination")}</span></div>`}function pa(e,t){let n=[],a=null;for(let o of e.legs){let s=a?Math.round(o.depart-a.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(os(o,t)),a=o}return n.join("")}var ss={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Ne(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function rs(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function is(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Ne(t.current)} \u2192
        ${Ne(t.proposed)} min</span>
        <span class="muted">${La(t.change_min)}</span></div>
      ${a}
    </div>`}function ma(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Ct(e,t){let n=e.radii[Rt],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${Y(e.window.start_min)}
        and ${Y(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${o}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${ss[n.classification]??""}</p>
      </div>
      ${ma(e)}`:`${o}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Ne(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Ne(n.proposed)}</div>
      </div>
      <div class="hl-delta ${a}">${La(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${rs(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?pa(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?pa(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${is(e)}
    ${ma(e)}`}function $a(e){return`
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
    </div>`}function ka(e){let t=e?e.radii[Rt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Dt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ya}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Mt="places",Pa="places-points",Ft="places-boundaries",C="places-fill",X="lost",ls=100,cs={lost:"share_lost",gained:"share_gained"};function B(e,t){return`service_${e}_${t}`}var Oa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},us="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",I={lost:O,gained:D},Be=null,J=null,ue=null,Da=!1;function At(){return Be}function Ra(){return J}function Nt(){return ue}function je(){return Da}function ds(e,t){let n=[...e];return t==="count"?n.sort((a,o)=>o.residents_lost-a.residents_lost):n.sort((a,o)=>(o.share_lost??-1)-(a.share_lost??-1))}function ps(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function ms(e){return Math.max(e.residents_lost,e.residents_gained)}var _a=4,ys=16,hs=1e3;function gs(e){let t=Math.min(1,Math.sqrt(e/hs));return _a+t*(ys-_a)}function fs(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:ps(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:gs(ms(t))}}))}}function bs(){return["match",["get","klass"],"lost",I.lost,"gained",I.gained,I.lost]}function vs(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var A=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var N=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Ta(e,t){return e==="service"?["step",["abs",["coalesce",["get",B(t,"pct")],0]],N[0].opacity,N[0].max,N[1].opacity,N[1].max,N[2].opacity,N[2].max,N[3].opacity]:["step",["coalesce",["get",cs[e]],0],A[0].opacity,Number.EPSILON,A[1].opacity,A[1].max,A[2].opacity,A[2].max,A[3].opacity,A[3].max,A[4].opacity]}function Ea(e,t){return e==="service"?["case",[">=",["coalesce",["get",B(t,"pct")],0],0],D,O]:I[e]}function ws(e,t){let n=B(t,"now"),a=B(t,"proposed");return e.features.filter(o=>o.properties[n]===0&&o.properties[a]>0).map(o=>o.properties.place)}var Ss=3;function Ls(e){if(e.length===0)return"";let t=e.slice(0,Ss),n=e.length-t.length,a=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,o=n>0?`${a} (and ${n} more)`:a;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${o}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${o}.`}function Ca(e,t){e.addSource(Ft,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:C,type:"fill",source:Ft,layout:{visibility:"none"},paint:{"fill-color":Ea(X),"fill-opacity":Ta(X),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Mt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Pa,type:"circle",source:Mt,layout:{visibility:"none"},paint:{"circle-color":bs(),"circle-radius":vs(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ue(e,t,n){e.setPaintProperty(C,"fill-color",Ea(t,n)),e.setPaintProperty(C,"fill-opacity",Ta(t,n))}async function Ma(){return Be||(Be=await S("/api/places")),Be}async function Fa(e){return ue||(ue=await S("/api/boundaries"),e.getSource(Ft).setData(ue)),ue}async function Aa(e,t){try{J=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return J=null,null}return e.getSource(Mt).setData(fs(J)),e.flyTo({center:[J.lon,J.lat],zoom:13}),J}function Na(e,t){Da=t,e.setLayoutProperty(Pa,"visibility",t?"visible":"none"),e.setLayoutProperty(C,"visibility",t?"visible":"none")}function $s(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var ks="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function Ha(e,t,n,a){let o=ds(e,t).map(s=>$s(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${us}</p>
    ${a==="service"?`<p class="note">${ks}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="seg place-fill">
      <button type="button" data-place-fill="lost"${a==="lost"?' class="active"':""}>Map losses</button>
      <button type="button" data-place-fill="gained"${a==="gained"?' class="active"':""}>Map gains</button>
      <button type="button" data-place-fill="service"${a==="service"?' class="active"':""}>Map service</button>
    </div>
    <div class="place-list">${o}</div>`}function Ba(e){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function _s(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function xs(e,t,n){let a=N.map((r,u)=>({band:r,prevMax:u===0?0:N[u-1].max})).filter(({band:r})=>r.opacity>0).flatMap(({band:r,prevMax:u})=>{let p=_s(r,u);return[`<div class="lg-row lg-static">
          <i style="background:${O};opacity:${r.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(p)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${D};opacity:${r.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(p)} more trips</span></div>`]}).join(""),o=n?ws(n,t):[],s=Ls(o),i=s?`<div class="lg-foot">${d(s)}</div>`:"";return`
    ${Ba(e)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(Oa[t])}</div>
    ${a}
    ${i}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ja(e,t,n,a){if(t==="service")return xs(e,n,a??null);let o=t==="lost"?"lose all buses":"gain a bus",s=A.filter(i=>i.opacity>0).map(i=>`
    <div class="lg-row lg-static">
      <i style="background:${I[t]};opacity:${i.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(i.label)} of the place's own residents ${d(o)}</span>
    </div>`).join("");return`
    ${Ba(e)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(o)}</div>
    ${s}
    <div class="lg-row lg-static"><i style="background:${I.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${I.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Ps(e,t){let n=e[B(t,"now")],a=e[B(t,"proposed")],o=e[B(t,"pct")],s=e[B(t,"rail_proposed")],i=Oa[t];if(a===0&&n>0)return`Loses all buses on ${i} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&a>0)return`Gets its first bus on ${i} (0 \u2192 ${a} trips).`;let r=o==null?"\u2014":`${o>0?"+":""}${o.toFixed(1)}%`;return`${n} \u2192 ${a} trips on ${i} (${r}).`}function Ua(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${Ps(e,n)}`;let a=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${a} residents lose or gain a bus.`;let o=xa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?xa("gain a bus",e.residents_gained,e.share_gained):null,i=(t==="lost"?[o,s]:[s,o]).filter(r=>r!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${i.join("<br>")}<br>
    <span class="muted">${a} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function xa(e,t,n){let a=Math.round(t).toLocaleString(),o=n==null?`share withheld \u2014 under ${ls} residents`:`${(n*100).toFixed(1)}%`;return`${a} ${e} (${o})`}var Ht=" \xB7 ",Bt={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Ja=Object.keys(Bt);function Ia(e){return Bt[e]??e}var Os={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Ds=["oneseat","journey"];function Rs(e){return e!=="journey"}function Ts(e){let t=[Bt[e.view]??e.view];return e.view==="places"?t[0]:(Ds.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Os[e.day]),Rs(e.view)&&t.push(`${e.radius} m walk`),t.join(Ht))}function Ga(e){let[t,...n]=Ts(e).split(Ht);return`<b>${d(t)}</b>${n.map(a=>Ht+d(a)).join("")}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill"},Je={any:"any",selected:"selected"},Es="pin",za=5;function Ka(e){try{return e.self!==e.top}catch{return!0}}function Va(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?Je.selected:Je.any),t.set(b.dest,"key"in e.dest?e.dest.key:jt(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.at&&t.set(b.at,jt(e.at)),e.camera&&t.set(b.camera,`${jt(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(b.place,e.place),e.placeFill!==X&&t.set(b.placeFill,e.placeFill),`?${t}`}function Wa(e){let t=new URLSearchParams(e),n={},a=t.get(b.view);a&&Ja.includes(a)&&(n.view=a);let o=t.get(b.day);o&&x.includes(o)&&(n.day=o);let s=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let i=t.get(b.oneSeatDay);i===Je.selected?n.oneSeatRestricted=!0:i===Je.any&&(n.oneSeatRestricted=!1);let r=t.get(b.dest);if(r&&r!==Es){let k=Ya(r);k?n.dest=k:r.includes(",")||(n.dest={key:r})}let u=Ya(t.get(b.at));u&&(n.at=u);let p=Cs(t.get(b.camera));p&&(n.camera=p);let m=t.get(b.place);m&&(n.place=m);let f=t.get(b.placeFill);return(f==="lost"||f==="gained"||f==="service")&&(n.placeFill=f),n}function jt(e){return`${e.lat.toFixed(za)},${e.lon.toFixed(za)}`}function Ya(e){let t=qa(e,2);return t?{lat:t[0],lon:t[1]}:null}function Cs(e){let t=qa(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function qa(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Ut="embed";var Ms=["1","true","yes"];function Xa(e){let t=new URLSearchParams(e).get(Ut);return t!==null&&Ms.includes(t.toLowerCase())}function Qa(e){let t=new URLSearchParams(e);return t.set(Ut,"1"),`?${t}`}function Za(e){let t=new URLSearchParams(e);t.delete(Ut);let n=String(t);return n?`?${n}`:""}function eo(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var j=["peek","half","full"],Fs=192,As=.3,Ns=.55,Hs=.9,Bs=.6,js=.45;function Ie(e,t){return e==="peek"?Math.min(Fs,t*As):e==="half"?t*Ns:t*Hs}function Us(e,t,n=0){let a=j.map(s=>Math.abs(Ie(s,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>Bs&&(o=Math.max(0,Math.min(j.length-1,o+(n>0?1:-1)))),j[o]}function to(e){return j[(j.indexOf(e)+1)%j.length]}function Js(e,t){return Math.min(e,t*js)}function Q(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Jt(e){let t=null,n=()=>{let a=Q();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var Is=8,Gs=400;function no(e){let t=c("side"),n=c("sheet-handle"),a="peek",o=!1,s=0,i=0,r=0,u={y:0,t:0};function p(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,Js(y,p()))}function f(y){a=y,t.dataset.snap=y,m(Ie(y,p()))}n.addEventListener("pointerdown",y=>{Q()&&(o=!0,s=y.clientY,i=t.getBoundingClientRect().height,r=y.timeStamp,u={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!o)return;let oe=i+(s-y.clientY),P=Ie("peek",p()),se=Ie("full",p());m(Math.max(P,Math.min(se,oe))),u={y:y.clientY,t:y.timeStamp}});function k(y){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-s)>Is)&&y.timeStamp-r<Gs){f(to(a));return}let P=y.timeStamp-u.t,se=P>0?(u.y-y.clientY)/P:0;f(Us(t.getBoundingClientRect().height,p(),se))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),Q()&&f(to(a)))});let E=Jt(e.onLayoutChange);function F(){if(E(),!Q()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}f(a)}return window.addEventListener("resize",F),F(),{at:()=>Q()?a:"full",atLeast(y){Q()&&j.indexOf(y)>j.indexOf(a)&&f(y)}}}var zs=[-79.9959,40.4406],Ys=12,Ks="#e2574c",R={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},me=Wa(location.search),he=Xa(location.search);he&&c("app").classList.add("embed");var Vs={at:()=>"full",atLeast(){}},ao=null,_=400,de=null,g=null,ee=null,z=0,$={key:"downtown"},G=null,oo=!1,ne=!1,Ke="locations",ae="area",so="count",zt=null,T=X,h="dots",ro,Yt=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:me.camera?[me.camera.lon,me.camera.lat]:zs,zoom:me.camera?.zoom??Ys,cooperativeGestures:Ka(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{Zt(l),xn(l),Nn(l,"change-dots"),In(l,"change-dots"),qn(l,"walk-fill"),va(l),Ca(l,"change-dots"),M(),l.on("click",t=>{if(oo){ye({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(h==="places"){let s=l.queryRenderedFeatures(t.point,{layers:[C]})[0];s&&Ge(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),a=l.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];qt(o[1],o[0])}),l.on("mouseenter",C,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",C,()=>{l.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});l.on("mouseenter","change-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","change-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=lt();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Dn(n.properties,L(),a.buckets)).addTo(l)}),l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=q();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(ta(n.properties,a)).addTo(l)}),l.on("mouseleave",C,()=>e.remove()),l.on("mousemove",C,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(Ua(n.properties,T,L())).addTo(l)}),l.on("moveend",()=>{let t=l.getCenter();ao={lat:t.lat,lon:t.lng,zoom:l.getZoom()},w(),H()}),pe(R.radius,t=>{_=Number(t.dataset.radius),ut(l,_,L()).then(w),Pe()&&gt(l,_,L()).then(w),Oe()&&vt(_).then(w),q()&&ze(),g&&te(g.lat,g.lon)}),pe(R.day,t=>{let n=t.dataset.day;hn(n),h!=="journey"&&M(),dt(l,n),ft(l,n),h==="journey"&&g&&Kt(g.lat,g.lon),Ee()&&Gn(l,n).then(w),ne&&q()&&(ze(),g&&te(g.lat,g.lon)),je()&&T==="service"&&Ue(l,T,n),w()}),pe(R.oneSeatDay,t=>{ne=t.dataset.oneseatDay==="selected",Gt(),ze(),g&&te(g.lat,g.lon)}),pe(R.view,t=>{let n=h;h=t.dataset.view,l.setLayoutProperty("change-dots","visibility",h==="dots"||h==="both"?"visible":"none"),er(h==="surface"||h==="both"),nr(h==="corridors"),rr(h==="oneseat"),sr(h==="journey",n==="journey"),ar(h==="places"),h!=="journey"&&n!=="journey"&&(h==="oneseat"||n==="oneseat")&&M({scrollToTop:!0}),or(h!=="corridors"&&h!=="journey"&&h!=="places");let a=h==="oneseat"||h==="journey";c("dest-controls").classList.toggle("hidden",!a),c("oneseat-day-controls").classList.toggle("hidden",h!=="oneseat"),Gt(),a||Ye(!1),lo()}),pe(R.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Ye(!0);return}Ye(!1),ye({key:n})}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Ke=n.dataset.weight,w(),H();return}let a=t.target.closest("[data-surface-unit]");if(a){ae=a.dataset.surfaceUnit,tr(ae),H();return}let o=t.target.closest("[data-bucket]");o&&(Pn(l,o.dataset.bucket,L()),w())}),c("legend-reset").addEventListener("click",()=>{On(l,L()),w()}),c("legend-collapse").addEventListener("click",()=>{It(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&ye({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&dr(a.dataset.caveat);let o=t.target.closest("[data-select-place]");o&&Ge(o.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(so=s.dataset.sortPlaces,M());let i=t.target.closest("[data-place-fill]");i&&(T=i.dataset.placeFill,Ue(l,T,L()),M(),w(),Gt(),H());let r=t.target.closest("[data-goto-place]");r&&(h!=="places"&&Z(R.view,"places"),Ge(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Qs),he&&Jt(It),ro=he?Vs:no({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:It}),qs(),We(),Ve(),Ws(me)||ut(l,_,L()).then(w),ur(),cr()});function pe(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),We(),H()})})}function Z(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Ws(e){let t=!1;return e.radius!==void 0&&(t=Z(R.radius,String(e.radius))||t),e.day&&(t=Z(R.day,e.day)||t),e.oneSeatRestricted!==void 0&&Z(R.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Ke=e.weight),e.surfaceUnit&&(ae=e.surfaceUnit),e.placeFill&&(T=e.placeFill),e.dest&&("key"in e.dest?Z(R.dest,e.dest.key):ye(e.dest)),e.view&&Z(R.view,e.view),e.at&&qt(e.at.lat,e.at.lon),e.place&&Ge(e.place),t}function H(){let e={view:h,day:L(),radius:_,oneSeatRestricted:ne,weight:Ke,surfaceUnit:ae,dest:$,at:g,camera:ao,place:zt,placeFill:T},t=Va(e);history.replaceState(null,"",(he?Qa(t):t)+location.hash),Ve(t)}function Ve(e=Za(location.search)){if(!he)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g?ee?ie(ee):"this point":null;t.querySelector(".el-action").textContent=eo(n)}function We(){c("statebar").innerHTML=Ga({view:h,day:L(),radius:_,oneSeatRestricted:ne,destination:ge()}),Xs()}function It(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function qs(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Xs(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Ia(h)))}function Qs(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function w(){Zs()}function Zs(){if(c("legend-reset").classList.toggle("hidden",St()||_t()||Tt()||je()),Tt()){c("legend").innerHTML=ka(He());return}if(je()){c("legend").innerHTML=ja(Ra(),T,L(),Nt());return}if(St()){let n=Ee();n&&oa(c("legend"),n);return}if(_t()){let n=q();if(!n)return;let a=l.getBounds();sa(c("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=lt();if(!e)return;let t=l.getBounds();ia(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Ke,surface:ht()?Pe():null,unit:ae,population:Oe()})}async function er(e){if(e&&!Pe()){c("legend").classList.add("loading");try{await gt(l,_,L())}finally{c("legend").classList.remove("loading")}}Hn(l,e),e&&ae==="people"&&await io(),w()}async function io(){if(!Oe()){c("legend").classList.add("loading");try{await vt(_)}finally{c("legend").classList.remove("loading")}}}async function tr(e){e==="people"&&ht()&&await io(),w()}async function nr(e){if(e&&!Ee()){c("legend").classList.add("loading");try{await Lt(l,L())}finally{c("legend").classList.remove("loading")}}zn(l,e),w()}async function ar(e){if(e&&(!At()||!Nt())){c("legend").classList.add("loading");try{await Promise.all([Ma(),Fa(l)])}finally{c("legend").classList.remove("loading")}}Na(l,e),e&&Ue(l,T,L()),e&&M(),w()}async function Ge(e){zt=e,await Wt(()=>Aa(l,e)),h==="places"&&(M(),document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),w(),H()}function or(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function M({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),Ve(),h==="places"){c("panel").innerHTML=Ha(At()??[],so,zt,T);return}if(!ee){h==="oneseat"?c("panel").innerHTML=Sn(ge()):gn(c("panel"));return}if(h==="oneseat"){let t=wn(ee,$,L());if(t){c("panel").innerHTML=t;return}}vn(ee)}function sr(e,t=!1){if(wa(l,e),w(),!e){t&&(g?te(g.lat,g.lon):M());return}He()&&g?c("panel").innerHTML=Ct(He(),ge()):c("panel").innerHTML=$a(ge())}async function Kt(e,t){let n=++z;g={lat:e,lon:t},H(),uo(e,t);let a=co(),o=d(ge());if(!a){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(Sa({lat:e,lon:t},a,L()));if(n!==z)return;Et(l,s),c("panel").innerHTML=Ct(s,o),w(),Ve()}catch(s){if(n!==z)return;Et(l,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Gt(){c("day-controls").classList.toggle("hidden",!Zn(h,ne,T))}function Vt(){return Qn(ne,L())}async function rr(e){e&&!q()&&await Wt(()=>xt(l,_,$,Vt())),ea(l,e),w()}async function ze(){await Wt(()=>xt(l,_,$,Vt())),w()}async function Wt(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function ye(e){if($=e,Ye(!1),ir(),lo(),We(),H(),h==="journey"){g&&Kt(g.lat,g.lon),w();return}g?te(g.lat,g.lon):M({scrollToTop:!0}),ze()}function lo(){let e=co();if(!(e!==null&&(h==="journey"||h==="oneseat"&&"lat"in $))){G?.remove(),G=null;return}G?G.setLngLat([e.lon,e.lat]).addTo(l):(G=new maplibregl.Marker({color:kt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),G.on("dragend",()=>{let n=G.getLngLat();ye({lat:n.lat,lon:n.lng})}))}function ir(){let e=Xn($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function co(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=Yt.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ge(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return Yt.find(t=>t.key===e)?.name??e}function Ye(e){oo=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function te(e,t){let n=++z;g={lat:e,lon:t},H(),c("panel").classList.add("loading"),uo(e,t);try{let a="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",o=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${_}${a}&oneseat_day=${Vt()}`);if(n!==z)return;en(l,e,t,_,o.current.stops,o.proposed.stops),lr(),ee=o,M({scrollToTop:!0})}catch(a){if(n!==z)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===z&&c("panel").classList.remove("loading")}}function lr(){c("pin-key").innerHTML=ra(_),c("pin-key").classList.remove("hidden")}function uo(e,t){de?de.setLngLat([t,e]):(de=new maplibregl.Marker({color:Ks,draggable:!0}).setLngLat([t,e]).addTo(l),de.on("dragend",()=>{let n=de.getLngLat();qt(n.lat,n.lng)}))}function qt(e,t){if(ro.atLeast("half"),h==="journey"){Kt(e,t);return}h!=="places"&&te(e,t)}async function cr(){try{Yt=await S("/api/destinations"),We()}catch{}}async function ur(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function dr(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
