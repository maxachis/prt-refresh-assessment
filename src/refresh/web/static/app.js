"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Y(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function et(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function tt(e){return e>0?`+${e}`:String(e)}function Qt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var ho="#4aa3ff",go="#ffa23a";function fo(e,t,n,a=96){let o=[],s=n/111320,i=n/(111320*Math.cos(e*Math.PI/180));for(let r=0;r<=a;r++){let u=r/a*2*Math.PI;o.push([t+i*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function V(e){return{type:"FeatureCollection",features:e}}function Zt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function en(e){e.addSource("walk",{type:"geojson",data:V([])}),e.addSource("stops-now",{type:"geojson",data:V([])}),e.addSource("stops-prop",{type:"geojson",data:V([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":go,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":ho,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let s=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function tn(e,t,n,a,o,s){e.getSource("walk").setData(V([fo(t,n,a)])),e.getSource("stops-now").setData(V(Zt(o,"current"))),e.getSource("stops-prop").setData(V(Zt(s,"proposed")))}var x=["weekday","saturday","sunday"],nt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],nn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},be=4,an=e=>3+be*e,on=e=>4+be*e,le=e=>5+be*e,bo=e=>6+be*e;var J=(e,t)=>e[t],sn=(e,t)=>e[bo(t)],at=e=>2+2*e,ot=e=>3+2*e,ve=4,rn=e=>2+ve*e,ln=e=>3+ve*e,cn=e=>4+ve*e,un=e=>5+ve*e;var rt="weekday";function L(){return rt}function gn(e){rt=e}function fn(e){e.innerHTML=`
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
    </div>`}function vo(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function wo(e,t){let n=Math.max(1,...nt.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return nt.map(a=>{let o=e.periods[a]??0,s=t.periods[a]??0,i=s-o,r=i>0?"up":i<0?"down":"flat";return`
      <tr>
        <th>${nn[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${s}</td>
        <td class="n ${r}">${i===0?"\xB7":tt(i)}</td>
      </tr>`}).join("")}function bn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function dn(e){return e.first==null?'<span class="muted">no service</span>':`${Y(e.first)}\u2013${Y(e.last)}`}function pn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var So={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Lo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function $o(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':Le(a.current,a.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(a.name)}</span>
          <span class="os-status ${d(a.status)}">${So[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${o}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Lo[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Se("one-seat")}</p>
    </div>`:""}function Se(e){return` <button class="howto" data-caveat="${e}">method</button>`}function we(e,t,n=null){let a=e===t?" same":"",o=n?` ${n}`:"";return`<dd class="cmp${a}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${o}">${t}</span></dd>`}function mn(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function yn(e){return e.first==null||e.last==null?null:e.last-e.first}function Le(e,t){let n=new Set(e.filter(a=>t.includes(a)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${hn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${hn(t,n,"prop")}</div>
    </div>`}function hn(e,t,n){return e.length?e.map(a=>`<span class="route ${t.has(a)?"both":`only-${n}`}">${d(a)}</span>`).join(" "):'<span class="muted">none</span>'}var st=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,ko="Allegheny";function ce(e){let t=e.place?.muni?.trim()??"",n=st.exec(t)?.[1],a=n===ko?t.replace(st,""):n?`${t.replace(st,"")} (${n})`:t;return e.place?.hood||a||"this location"}function it(e){return e==="weekday"?"weekday":e}function vn(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${it(t)}`}function _o(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${it(t)}, today only</span>`}${a}</dd>`}function xo(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Se("boardings")}</p>`}function Po(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${Se("place-population")}</p>
    </div>`}function lt(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],s=o.trips-a.trips,i=s>0?"up":s<0?"down":"flat",r=pn(a),u=pn(o),p=yn(a),m=yn(o);return`
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
        ${s===0?"no change":`${tt(s)} trips`}
        <div class="muted">${Qt(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${it(t)}, both directions</div>

    <div class="tiers">${vo(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${wo(a,o)}</tbody>
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
      ${we(dn(a),dn(o))}
      <dt>Hours between</dt>
      ${we(et(p),et(m),mn(p,m,"more"))}
      <dt>Typical wait</dt>
      ${we(r==null?"\u2014":`${r} min`,u==null?"\u2014":`${u} min`,mn(r,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${we(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${_o(a.boardings,t)}
    </dl>
    ${xo(a.boardings)}

    ${n}

    ${Po(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Le(a.routes,o.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Se("location-not-route")}</p>
    </div>`}function wn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(ce(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${lt(e,rt,$o(e.oneseat??[],e.oneseat_day??"any"))}`}var Oo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Do={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Ro={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function To(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function ct(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${bn(t)}</div>`:""}function Eo(e){let t=ct("kept",e.kept)+ct("lost",e.lost)+ct("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Co(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Le(e.current,e.proposed)}
    </div>`}function Mo(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${d(o.key)}">
      <span class="os-name">${d(o.name)}</span>
      <span class="os-status ${d(o.status)}">${Fo[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Fo={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function No(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Ro[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Sn(e,t,n){let a=To(e,t);if(!a)return"";let o=e.oneseat_day??"any",s=a.status==="here"?"":Eo(a)+Co(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(a.name)}</h2>
      <div class="muted">
        from ${d(ce(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(a.status)}">${Oo[a.status]}</div>
    <p class="note">${Do[a.status]} ${No(o)}</p>

    ${s}

    ${Mo(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${vn(e,n)}</summary>
      ${lt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Ln(e){return`
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
    </div>`}var ke={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},ut="change",_e="change-dots",$e=null,W=new Set;function dt(){return $e}function pt(e){return W.has(e)}function $n(e,t,n,a,o,s,i){let r={};for(let u of n)r[u]=0;for(let u of e){if(!kn(u,a,o,s,i))continue;let p=n[J(u,le(t))];p!==void 0&&r[p]++}return r}function kn(e,t,n,a,o){let s=J(e,0),i=J(e,1);return s>=n&&s<=o&&i>=t&&i<=a}function _n(e,t,n,a,o,s,i){let r={riders:{},measured:{},unmeasured:0};for(let u of n)r.riders[u]=0,r.measured[u]=0;for(let u of e){if(!kn(u,a,o,s,i))continue;let p=n[J(u,le(t))];if(p===void 0)continue;let m=sn(u,t);if(m===null){p!=="none"&&r.unmeasured++;continue}r.riders[p]+=m,r.measured[p]++}return r}function Ao(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((a,o)=>t[J(n,le(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(x.flatMap((a,o)=>[[`b${o}`,t[J(n,le(o))]],[`c${o}`,n[an(o)]],[`p${o}`,n[on(o)]]]))}}))}}function ue(e,t){let n=Object.entries(ke).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,ke.none[t]]}function xn(e){return["interpolate",["linear"],["zoom"],9,["*",ue(e,"size"),.45],12,ue(e,"size"),16,["*",ue(e,"size"),1.9]]}function Pn(e){e.addSource(ut,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:_e,type:"circle",source:ut,paint:{"circle-color":ue(0,"color"),"circle-radius":xn(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function mt(e,t,n){return $e=await S(`/api/change?radius=${t}`),e.getSource(ut).setData(Ao($e)),yt(e,n),$e}function yt(e,t){let n=x.indexOf(t);e.setPaintProperty(_e,"circle-color",ue(n,"color")),e.setPaintProperty(_e,"circle-radius",xn(n)),ht(e,t)}function On(e,t,n){W.has(t)?W.delete(t):W.add(t),ht(e,n)}function Dn(e,t){W.clear(),ht(e,t)}function ht(e,t){let n=x.indexOf(t),a=["none",...W];e.setFilter(_e,["!",["in",["get",`b${n}`],["literal",a]]])}function Rn(e,t,n){let a=x.indexOf(t),o=e[`b${a}`],s=n.find(p=>p.key===o)?.label??o,i=e[`c${a}`],r=e[`p${a}`];return`<b>${s}</b><br>${i} \u2192 ${r} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var gt="surface",Pe="surface-fill",Tn="#6b7280",ft=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,Tn],[.138,Tn],[1,"#12a163"],[2,"#0b7a48"]],D="#e8232f",R="#0f79c9",En=2,xe=null,Cn=!1;function Oe(){return xe}function bt(){return Cn}function Mn(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-En,Math.min(En,n))}function Fn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function Nn(e,t,n,a,o,s,i,r){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=i.lat0+(p[1]+.5)*i.dlat,f=i.lon0+(p[0]+.5)*i.dlon;if(m<a||m>s||f<n||f>o)continue;let k=p[at(t)],T=p[ot(t)],F=Fn(k,T);if(F!=="none")if(F==="ramp"){let y=Mn(k,T);u[y<-.138?"less":y>.138?"more":"same"]+=r}else u[F]+=r}return u}function Ho(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let i=t+s[1]*a,r=i+a,u=n+s[0]*o,p=u+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,i],[p,i],[p,r],[u,r],[u,i]]]},properties:Object.fromEntries(x.flatMap((m,f)=>{let k=s[at(f)],T=s[ot(f)];return[[`k${f}`,Fn(k,T)],[`v${f}`,Mn(k,T)??0]]}))}})}}function An(e){return["case",["==",["get",`k${e}`],"gone"],D,["==",["get",`k${e}`],"new"],R,["interpolate",["linear"],["get",`v${e}`],...ft.flatMap(([t,n])=>[t,n])]]}function q(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Hn(e,t){e.addSource(gt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Pe,type:"fill",source:gt,layout:{visibility:"none"},paint:{"fill-color":An(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,q(0,.85),13,q(0,.62),16,q(0,.45)]}},t)}async function vt(e,t,n){return xe=await S(`/api/surface?radius=${t}`),e.getSource(gt).setData(Ho(xe)),wt(e,n),xe}function wt(e,t){let n=x.indexOf(t);e.setPaintProperty(Pe,"fill-color",An(n)),e.setPaintProperty(Pe,"fill-opacity",["interpolate",["linear"],["zoom"],9,q(n,.85),13,q(n,.62),16,q(n,.45)])}function Bn(e,t){Cn=t,e.setLayoutProperty(Pe,"visibility",t?"visible":"none")}var St=null;function De(){return St}async function Lt(e){return St=await S(`/api/population?radius=${e}`),St}function jn(e,t,n,a,o,s,i){let r={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=i.lat0+(u[1]+.5)*i.dlat,m=i.lon0+(u[0]+.5)*i.dlon;p<a||p>s||m<n||m>o||(r.lost+=u[rn(t)],r.gained+=u[ln(t)],r.kept+=u[cn(t)],r.none+=u[un(t)])}return r}var $t="corridor",Un="corridor-lines",Ee="#8b929c",Bo="#6f7783",Te={lost:D,added:R,kept:Ee};var Re=null,Jn=!1;function Ce(){return Re}function kt(){return Jn}function jo(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function In(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Uo(){let e=t=>["match",["get","klass"],"lost",Te.lost,"added",Te.added,t];return["interpolate",["linear"],["zoom"],9,e(Bo),14,e(Ee)]}function Jo(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Io(){return["match",["get","klass"],"kept",.85,.9]}function Gn(e,t){e.addSource($t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Un,type:"line",source:$t,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Uo(),"line-width":Jo(),"line-opacity":Io()}},t)}async function _t(e,t){return Re=await S(`/api/corridors?day=${t}`),e.getSource($t).setData(jo(Re)),Re}async function Kn(e,t){x.includes(t)&&await _t(e,t)}function zn(e,t){Jn=t,e.setLayoutProperty(Un,"visibility",t?"visible":"none")}var Pt="#2b3038",Yn="#b9bec6",de={loses:{color:D,size:6},gains:{color:R,size:6},keeps:{color:Ee,size:3},here:{color:Pt,size:3.5},none:{color:Yn,size:1.8}},Fe=["loses","gains","keeps","none","here"],xt="oneseat",Vn="oneseat-dots",Me=null,Wn=!1;function X(){return Me}function Ot(){return Wn}function qn(e,t,n,a,o,s){let i={};for(let r of t)i[r]=0;for(let r of e){let u=r[0],p=r[1];if(u<a||u>s||p<n||p>o)continue;let m=t[r[3]];m!==void 0&&i[m]++}return i}function Go(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Ko(){return["match",["get","status"],...Object.entries(de).flatMap(([e,t])=>[e,t.color]),Yn]}function zo(){let e=["match",["get","status"],...Object.entries(de).flatMap(([t,n])=>[t,n.size]),de.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Xn(e,t){e.addSource(xt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Vn,type:"circle",source:xt,layout:{visibility:"none"},paint:{"circle-color":Ko(),"circle-radius":zo(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Yo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Vo="pin";function Qn(e){return"key"in e?e.key:Vo}var Ne="any";function Wo(e,t,n){return`radius=${e}&${Yo(t)}&day=${n}`}function Zn(e,t){return e?t:Ne}function ea(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function Dt(e,t,n,a=Ne){return Me=await S(`/api/oneseat?${Wo(t,n,a)}`),e.getSource(xt).setData(Go(Me)),Me}function ta(e,t){Wn=t,e.setLayoutProperty(Vn,"visibility",t?"visible":"none")}function Rt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function na(e,t){let n=t.statuses.find(r=>r.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),s=r=>r.length?r.join(", "):"none",i=Rt(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${i}<br>today: ${s(a)}<br>proposed: ${s(o)}`}var Tt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function qo(e){return e.buckets.filter(t=>t.key!=="none")}var aa={area:"Ground",people:"People"};function Xo(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=Nn(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),s=i=>i.toFixed(i<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(o.less)}</b> km\xB2 less</span>
        <span><b>${s(o.more)}</b> km\xB2 more</span>
        <span><b>${s(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Qo(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=jn(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=i=>Math.round(i).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(o.lost)}</b> people lose all service</span>
        <span><b>${s(o.gained)}</b> gain service</span>
        <span><b>${s(o.kept)}</b> keep a bus</span>
        <span><b>${s(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}function Zo(e){let{layer:t,day:n,bounds:a,unit:o,population:s}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${ft.map(([r,u])=>`${u} ${((r+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${D}"></i>loses all service</span>
        <span><i style="background:${R}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(aa).map(r=>`
          <button data-surface-unit="${r}" aria-pressed="${o===r}"
                  class="${o===r?"active":""}">${aa[r]}</button>`).join("")}
      </div>
      ${o==="people"?Qo(n,a,s):Xo(t,n,a)}
    </div>`}var es=["lost","added","kept"],ts={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},ns={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function sa(e,t){let{lostPct:n,addedPct:a}=In(t.km),o=r=>r.toFixed(1),i=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${i}</b> km of street, citywide \u2014 ${ns[t.day]}
    </div>
    ${es.map(r=>`
      <div class="lg-row lg-static">
        <i style="background:${Te[r]}"></i>
        <span class="lg-lab">${d(ts[r])}</span>
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
      what you can still reach on foot.</div>`}function ra(e,t,n){let a=t.statuses.map(m=>m.key),o=qn(t.points,a,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(f=>f.key===m)?.label??m,i=Fe.reduce((m,f)=>m+(o[f]??0),0),r=Rt(t),u=t.day&&t.day!==Ne,p=u?`Restricted to routes running on ${Tt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(r)}</b>
      <span class="muted">\xB7 ${i.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${Tt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Fe.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${de[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(o[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Fe.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(r)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function ia(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var oa={locations:"Locations",riders:"Riders"};function as(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function la(e,t){let{layer:n,day:a,bounds:o,weight:s,surface:i,unit:r="area",population:u}=t,p=n.buckets.map(v=>v.key),m=n.days.indexOf(a),{west:f,south:k,east:T,north:F}=o,y=qo(n),re=$n(n.points,m,p,f,k,T,F),O=s==="riders"?_n(n.points,m,p,f,k,T,F):null,ie=v=>O?O.measured[v]?Math.round(O.riders[v]).toLocaleString():"\u2014":re[v].toLocaleString(),yo=O?`<b>${Math.round(y.reduce((v,Ze)=>v+O.riders[Ze.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${y.reduce((v,Ze)=>v+re[Ze.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${yo}
      <span class="muted">\xB7 ${Tt[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(oa).map(v=>`
        <button data-weight="${v}" aria-pressed="${s===v}"
                class="${s===v?"active":""}">${oa[v]}</button>`).join("")}
    </div>
    ${y.map(v=>`
      <button class="lg-row ${pt(v.key)?"off":""}" data-bucket="${d(v.key)}"
              aria-pressed="${!pt(v.key)}">
        <i style="background:${ke[v.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(v.label)}</span>
        <span class="lg-n">${ie(v.key)}</span>
      </button>`).join("")}
    ${i?Zo({layer:i,day:a,bounds:o,unit:r,population:u}):""}
    ${O?as(O.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var Et="#4aa3ff",ha="#ffa23a",Ct="headline",Ae="journey",ga="journey-rides",fa="journey-walks",os=[ga,fa],ba=null,va=!1;function Be(){return ba}function Mt(){return va}function ss(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let s=n[o].itinerary;if(s)for(let i of s.legs){let r=i.from??e.origin,u=i.to??e.destination,p=[[r.lon,r.lat],[u.lon,u.lat]],m=i.path?.length?i.path:p;a.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:o,kind:i.kind,route:i.route}})}}return{type:"FeatureCollection",features:a}}function ca(){return["match",["get","side"],"current",Et,"proposed",ha,Et]}function ua(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function wa(e,t){e.addSource(Ae,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ga,type:"line",source:Ae,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ca(),"line-width":ua(1),"line-opacity":.85}},t),e.addLayer({id:fa,type:"line",source:Ae,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ca(),"line-width":ua(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Sa(e,t){va=t;for(let n of os)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Ft(e,t){ba=t;let n=t?ss(t,Ct):{type:"FeatureCollection",features:[]};e.getSource(Ae).setData(n)}function La(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var da=e=>`${e.toFixed(1)} min`;function $a(e){return e==null?"\u2014":e===0?"no change":e>0?`${da(e)} slower`:`${da(-e)} faster`}function pa(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function rs(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=pa(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${pa(e.to,"the destination")}</span></div>`}function ma(e,t){let n=[],a=null;for(let o of e.legs){let s=a?Math.round(o.depart-a.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(rs(o,t)),a=o}return n.join("")}var is={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function He(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function ls(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function cs(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${He(t.current)} \u2192
        ${He(t.proposed)} min</span>
        <span class="muted">${$a(t.change_min)}</span></div>
      ${a}
    </div>`}function ya(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Nt(e,t){let n=e.radii[Ct],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
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
        <p>${is[n.classification]??""}</p>
      </div>
      ${ya(e)}`:`${o}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${He(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${He(n.proposed)}</div>
      </div>
      <div class="hl-delta ${a}">${$a(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${ls(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ma(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ma(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${cs(e)}
    ${ya(e)}`}function ka(e){return`
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
    </div>`}function _a(e){let t=e?e.radii[Ct].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Et}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ha}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Je="places",Oa="places-points",At="places-boundaries",E="places-fill",Z="lost",us=100,ds={lost:"share_lost",gained:"share_gained"};function B(e,t){return`service_${e}_${t}`}var Da={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ps="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",I={lost:D,gained:R},je=null,H=null,Q=null,Ra=!1,Ue=null;function Ht(){return je}function Ta(){return H}function Ea(){return Ue}function Bt(){return Q}function pe(){return Ra}function ms(e,t){let n=[...e];return t==="count"?n.sort((a,o)=>o.residents_lost-a.residents_lost):n.sort((a,o)=>(o.share_lost??-1)-(a.share_lost??-1))}function ys(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function hs(e){return Math.max(e.residents_lost,e.residents_gained)}var xa=4,gs=16,fs=1e3;function bs(e){let t=Math.min(1,Math.sqrt(e/fs));return xa+t*(gs-xa)}function vs(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:ys(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:bs(hs(t))}}))}}function ws(){return["match",["get","klass"],"lost",I.lost,"gained",I.gained,I.lost]}function Ss(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var N=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var A=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function Ca(e,t){return e==="service"?["step",["abs",["coalesce",["get",B(t,"pct")],0]],A[0].opacity,A[0].max,A[1].opacity,A[1].max,A[2].opacity,A[2].max,A[3].opacity]:["step",["coalesce",["get",ds[e]],0],N[0].opacity,Number.EPSILON,N[1].opacity,N[1].max,N[2].opacity,N[2].max,N[3].opacity,N[3].max,N[4].opacity]}function Ma(e,t){return e==="service"?["case",[">=",["coalesce",["get",B(t,"pct")],0],0],R,D]:I[e]}function Ls(e,t){let n=B(t,"now"),a=B(t,"proposed");return e.features.filter(o=>o.properties[n]===0&&o.properties[a]>0).map(o=>o.properties.place)}var $s=3;function ks(e){if(e.length===0)return"";let t=e.slice(0,$s),n=e.length-t.length,a=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,o=n>0?`${a} (and ${n} more)`:a;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${o}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${o}.`}function Fa(e,t){e.addSource(At,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:E,type:"fill",source:At,layout:{visibility:"none"},paint:{"fill-color":Ma(Z),"fill-opacity":Ca(Z),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Je,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Oa,type:"circle",source:Je,layout:{visibility:"none"},paint:{"circle-color":ws(),"circle-radius":Ss(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ie(e,t,n){e.setPaintProperty(E,"fill-color",Ma(t,n)),e.setPaintProperty(E,"fill-opacity",Ca(t,n))}async function Na(){return je||(je=await S("/api/places")),je}async function Aa(e){return Q||(Q=await S("/api/boundaries"),e.getSource(At).setData(Q)),Q}function _s(e,t){let n=e?.features.find(a=>a.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function Ha(e,t){let n=_s(Q,t);if(n)return H=null,Ue=n,e.getSource(Je)?.setData({type:"FeatureCollection",features:[]}),null;try{H=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return H=null,Ue=null,null}return Ue=null,e.getSource(Je).setData(vs(H)),e.flyTo({center:[H.lon,H.lat],zoom:13}),H}function Ba(e,t){Ra=t,e.setLayoutProperty(Oa,"visibility",t?"visible":"none"),e.setLayoutProperty(E,"visibility",t?"visible":"none")}function xs(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var Ps="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function ja(e,t,n,a){let o=ms(e,t).map(s=>xs(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${ps}</p>
    ${a==="service"?`<p class="note">${Ps}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${o}</div>`}function Ua(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Os(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Ds(e,t,n,a){let o=A.map((u,p)=>({band:u,prevMax:p===0?0:A[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=Os(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${D};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${R};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=a?Ls(a,n):[],i=ks(s),r=i?`<div class="lg-foot">${d(i)}</div>`:"";return`
    ${Ua(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(Da[n])}</div>
    ${o}
    ${r}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function Ja({selected:e,fill:t,day:n,boundaries:a,unchanged:o}){if(t==="service")return Ds(e,o??null,n,a??null);let s=t==="lost"?"lose all buses":"gain a bus",i=N.filter(r=>r.opacity>0).map(r=>`
    <div class="lg-row lg-static">
      <i style="background:${I[t]};opacity:${r.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(r.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${Ua(e,o??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${i}
    <div class="lg-row lg-static"><i style="background:${I.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${I.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Rs(e,t){let n=e[B(t,"now")],a=e[B(t,"proposed")],o=e[B(t,"pct")],s=e[B(t,"rail_proposed")],i=Da[t];if(a===0&&n>0)return`Loses all buses on ${i} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&a>0)return`Gets its first bus on ${i} (0 \u2192 ${a} trips).`;let r=o==null?"\u2014":`${o>0?"+":""}${o.toFixed(1)}%`;return`${n} \u2192 ${a} trips on ${i} (${r}).`}function Ia(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${Rs(e,n)}`;let a=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${a} residents lose or gain a bus.`;let o=Pa("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?Pa("gain a bus",e.residents_gained,e.share_gained):null,i=(t==="lost"?[o,s]:[s,o]).filter(r=>r!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${i.join("<br>")}<br>
    <span class="muted">${a} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function Pa(e,t,n){let a=Math.round(t).toLocaleString(),o=n==null?`share withheld \u2014 under ${us} residents`:`${(n*100).toFixed(1)}%`;return`${a} ${e} (${o})`}var jt=" \xB7 ",Ut={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Ga=Object.keys(Ut);function Ka(e){return Ut[e]??e}var Ts={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Es=["oneseat","journey"];function Cs(e){return e!=="journey"}function Ms(e){let t=[Ut[e.view]??e.view];return e.view==="places"?t[0]:(Es.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Ts[e.day]),Cs(e.view)&&t.push(`${e.radius} m walk`),t.join(jt))}function za(e){let[t,...n]=Ms(e).split(jt);return`<b>${d(t)}</b>${n.map(a=>jt+d(a)).join("")}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill"},Ge={any:"any",selected:"selected"},Fs="pin",Ya=5;function Wa(e){try{return e.self!==e.top}catch{return!0}}function qa(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?Ge.selected:Ge.any),t.set(b.dest,"key"in e.dest?e.dest.key:Jt(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.at&&t.set(b.at,Jt(e.at)),e.camera&&t.set(b.camera,`${Jt(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(b.place,e.place),e.placeFill!==Z&&t.set(b.placeFill,e.placeFill),`?${t}`}function Xa(e){let t=new URLSearchParams(e),n={},a=t.get(b.view);a&&Ga.includes(a)&&(n.view=a);let o=t.get(b.day);o&&x.includes(o)&&(n.day=o);let s=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let i=t.get(b.oneSeatDay);i===Ge.selected?n.oneSeatRestricted=!0:i===Ge.any&&(n.oneSeatRestricted=!1);let r=t.get(b.dest);if(r&&r!==Fs){let k=Va(r);k?n.dest=k:r.includes(",")||(n.dest={key:r})}let u=Va(t.get(b.at));u&&(n.at=u);let p=Ns(t.get(b.camera));p&&(n.camera=p);let m=t.get(b.place);m&&(n.place=m);let f=t.get(b.placeFill);return(f==="lost"||f==="gained"||f==="service")&&(n.placeFill=f),n}function Jt(e){return`${e.lat.toFixed(Ya)},${e.lon.toFixed(Ya)}`}function Va(e){let t=Qa(e,2);return t?{lat:t[0],lon:t[1]}:null}function Ns(e){let t=Qa(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Qa(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var It="embed";var As=["1","true","yes"];function Za(e){let t=new URLSearchParams(e).get(It);return t!==null&&As.includes(t.toLowerCase())}function eo(e){let t=new URLSearchParams(e);return t.set(It,"1"),`?${t}`}function to(e){let t=new URLSearchParams(e);t.delete(It);let n=String(t);return n?`?${n}`:""}function no(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var j=["peek","half","full"],Hs=192,Bs=.3,js=.55,Us=.9,Js=.6,Is=.45;function Ke(e,t){return e==="peek"?Math.min(Hs,t*Bs):e==="half"?t*js:t*Us}function Gs(e,t,n=0){let a=j.map(s=>Math.abs(Ke(s,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>Js&&(o=Math.max(0,Math.min(j.length-1,o+(n>0?1:-1)))),j[o]}function ao(e){return j[(j.indexOf(e)+1)%j.length]}function Ks(e,t){return Math.min(e,t*Is)}function ee(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Gt(e){let t=null,n=()=>{let a=ee();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var zs=8,Ys=400;function oo(e){let t=c("side"),n=c("sheet-handle"),a="peek",o=!1,s=0,i=0,r=0,u={y:0,t:0};function p(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,Ks(y,p()))}function f(y){a=y,t.dataset.snap=y,m(Ke(y,p()))}n.addEventListener("pointerdown",y=>{ee()&&(o=!0,s=y.clientY,i=t.getBoundingClientRect().height,r=y.timeStamp,u={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!o)return;let re=i+(s-y.clientY),O=Ke("peek",p()),ie=Ke("full",p());m(Math.max(O,Math.min(ie,re))),u={y:y.clientY,t:y.timeStamp}});function k(y){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-s)>zs)&&y.timeStamp-r<Ys){f(ao(a));return}let O=y.timeStamp-u.t,ie=O>0?(u.y-y.clientY)/O:0;f(Gs(t.getBoundingClientRect().height,p(),ie))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),ee()&&f(ao(a)))});let T=Gt(e.onLayoutChange);function F(){if(T(),!ee()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}f(a)}return window.addEventListener("resize",F),F(),{at:()=>ee()?a:"full",atLeast(y){ee()&&j.indexOf(y)>j.indexOf(a)&&f(y)}}}var Vs=[-79.9959,40.4406],Ws=12,qs="#e2574c",P={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},ye=Xa(location.search),ge=Za(location.search);ge&&c("app").classList.add("embed");var Xs={at:()=>"full",atLeast(){}},so=null,_=400,me=null,g=null,ne=null,z=0,$={key:"downtown"},G=null,ro=!1,oe=!1,qe="locations",se="area",io="count",We=null,C=Z,h="dots",lo,Yt=[],l=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ye.camera?[ye.camera.lon,ye.camera.lat]:Vs,zoom:ye.camera?.zoom??Ws,cooperativeGestures:Wa(window),attributionControl:{compact:!0}});l.addControl(new maplibregl.NavigationControl,"top-right");l.on("load",()=>{en(l),Pn(l),Hn(l,"change-dots"),Gn(l,"change-dots"),Xn(l,"walk-fill"),wa(l),Fa(l,"change-dots"),M(),l.on("click",t=>{if(ro){he({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(h==="places"){let s=l.queryRenderedFeatures(t.point,{layers:[E]})[0];s&&ze(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>l.getLayoutProperty(s,"visibility")!=="none"),a=l.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Xt(o[1],o[0])}),l.on("mouseenter",E,()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave",E,()=>{l.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});l.on("mouseenter","change-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","change-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=dt();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Rn(n.properties,L(),a.buckets)).addTo(l)}),l.on("mouseenter","oneseat-dots",()=>{l.getCanvas().style.cursor="pointer"}),l.on("mouseleave","oneseat-dots",()=>{l.getCanvas().style.cursor="",e.remove()}),l.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=X();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(na(n.properties,a)).addTo(l)}),l.on("mouseleave",E,()=>e.remove()),l.on("mousemove",E,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(Ia(n.properties,C,L())).addTo(l)}),l.on("moveend",()=>{let t=l.getCenter();so={lat:t.lat,lon:t.lng,zoom:l.getZoom()},w(),U()}),te(P.radius,t=>{_=Number(t.dataset.radius),mt(l,_,L()).then(w),Oe()&&vt(l,_,L()).then(w),De()&&Lt(_).then(w),X()&&Ye(),g&&ae(g.lat,g.lon)}),te(P.day,t=>{let n=t.dataset.day;gn(n),h!=="journey"&&M(),yt(l,n),wt(l,n),h==="journey"&&g&&Vt(g.lat,g.lon),Ce()&&Kn(l,n).then(w),oe&&X()&&(Ye(),g&&ae(g.lat,g.lon)),pe()&&C==="service"&&Ie(l,C,n),w()}),te(P.oneSeatDay,t=>{oe=t.dataset.oneseatDay==="selected",zt(),Ye(),g&&ae(g.lat,g.lon)}),te(P.view,t=>{let n=h;h=t.dataset.view,l.setLayoutProperty("change-dots","visibility",h==="dots"||h==="both"?"visible":"none"),ar(h==="surface"||h==="both"),sr(h==="corridors"),cr(h==="oneseat"),lr(h==="journey",n==="journey"),rr(h==="places"),h!=="journey"&&n!=="journey"&&(h==="oneseat"||n==="oneseat")&&M({scrollToTop:!0}),ir(h!=="corridors"&&h!=="journey"&&h!=="places");let a=h==="oneseat"||h==="journey";c("dest-controls").classList.toggle("hidden",!a),c("oneseat-day-controls").classList.toggle("hidden",h!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",h!=="places"),zt(),a||Ve(!1),uo()}),te(P.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Ve(!0);return}Ve(!1),he({key:n})}),te(P.placeFill,t=>{C=t.dataset.placeFill,pe()&&Ie(l,C,L()),M(),w(),zt()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){qe=n.dataset.weight,w(),U();return}let a=t.target.closest("[data-surface-unit]");if(a){se=a.dataset.surfaceUnit,or(se),U();return}let o=t.target.closest("[data-bucket]");o&&(On(l,o.dataset.bucket,L()),w())}),c("legend-reset").addEventListener("click",()=>{Dn(l,L()),w()}),c("legend-collapse").addEventListener("click",()=>{Kt(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&he({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&yr(a.dataset.caveat);let o=t.target.closest("[data-select-place]");o&&ze(o.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(io=s.dataset.sortPlaces,M());let i=t.target.closest("[data-goto-place]");i&&(h!=="places"&&K(P.view,"places"),ze(i.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",tr),ge&&Gt(Kt),lo=ge?Xs:oo({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),l.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Kt}),Zs(),Qe(),Xe(),Qs(ye)||mt(l,_,L()).then(w),mr(),pr()});function te(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),Qe(),U()})})}function K(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Qs(e){let t=!1;return e.radius!==void 0&&(t=K(P.radius,String(e.radius))||t),e.day&&(t=K(P.day,e.day)||t),e.oneSeatRestricted!==void 0&&K(P.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(qe=e.weight),e.surfaceUnit&&(se=e.surfaceUnit),e.placeFill&&K(P.placeFill,e.placeFill),e.dest&&("key"in e.dest?K(P.dest,e.dest.key):he(e.dest)),e.view&&K(P.view,e.view),e.at&&Xt(e.at.lat,e.at.lon),e.place&&ze(e.place),t}function U(){let e={view:h,day:L(),radius:_,oneSeatRestricted:oe,weight:qe,surfaceUnit:se,dest:$,at:g,camera:so,place:We,placeFill:C},t=qa(e);history.replaceState(null,"",(ge?eo(t):t)+location.hash),Xe(t)}function Xe(e=to(location.search)){if(!ge)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g?ne?ce(ne):"this point":null;t.querySelector(".el-action").textContent=no(n)}function Qe(){c("statebar").innerHTML=za({view:h,day:L(),radius:_,oneSeatRestricted:oe,destination:fe()}),er()}function Kt(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Zs(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function er(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Ka(h)))}function tr(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),l.resize()}function w(){nr()}function nr(){if(c("legend-reset").classList.toggle("hidden",kt()||Ot()||Mt()||pe()),Mt()){c("legend").innerHTML=_a(Be());return}if(pe()){c("legend").innerHTML=Ja({selected:Ta(),fill:C,day:L(),boundaries:Bt(),unchanged:Ea()});return}if(kt()){let n=Ce();n&&sa(c("legend"),n);return}if(Ot()){let n=X();if(!n)return;let a=l.getBounds();ra(c("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=dt();if(!e)return;let t=l.getBounds();la(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:qe,surface:bt()?Oe():null,unit:se,population:De()})}async function ar(e){if(e&&!Oe()){c("legend").classList.add("loading");try{await vt(l,_,L())}finally{c("legend").classList.remove("loading")}}Bn(l,e),e&&se==="people"&&await co(),w()}async function co(){if(!De()){c("legend").classList.add("loading");try{await Lt(_)}finally{c("legend").classList.remove("loading")}}}async function or(e){e==="people"&&bt()&&await co(),w()}async function sr(e){if(e&&!Ce()){c("legend").classList.add("loading");try{await _t(l,L())}finally{c("legend").classList.remove("loading")}}zn(l,e),w()}async function rr(e){if(e&&(!Ht()||!Bt())){c("legend").classList.add("loading");try{await Promise.all([Na(),Aa(l)])}finally{c("legend").classList.remove("loading")}}Ba(l,e),e&&Ie(l,C,L()),e&&M(),w()}async function ze(e){We=await qt(()=>Ha(l,e))?e:null,h==="places"&&(M(),We&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),w(),U()}function ir(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function M({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),Xe(),h==="places"){c("panel").innerHTML=ja(Ht()??[],io,We,C);return}if(!ne){h==="oneseat"?c("panel").innerHTML=Ln(fe()):fn(c("panel"));return}if(h==="oneseat"){let t=Sn(ne,$,L());if(t){c("panel").innerHTML=t;return}}wn(ne)}function lr(e,t=!1){if(Sa(l,e),w(),!e){t&&(g?ae(g.lat,g.lon):M());return}Be()&&g?c("panel").innerHTML=Nt(Be(),fe()):c("panel").innerHTML=ka(fe())}async function Vt(e,t){let n=++z;g={lat:e,lon:t},U(),mo(e,t);let a=po(),o=d(fe());if(!a){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(La({lat:e,lon:t},a,L()));if(n!==z)return;Ft(l,s),c("panel").innerHTML=Nt(s,o),w(),Xe()}catch(s){if(n!==z)return;Ft(l,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function zt(){c("day-controls").classList.toggle("hidden",!ea(h,oe,C))}function Wt(){return Zn(oe,L())}async function cr(e){e&&!X()&&await qt(()=>Dt(l,_,$,Wt())),ta(l,e),w()}async function Ye(){await qt(()=>Dt(l,_,$,Wt())),w()}async function qt(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function he(e){if($=e,Ve(!1),ur(),uo(),Qe(),U(),h==="journey"){g&&Vt(g.lat,g.lon),w();return}g?ae(g.lat,g.lon):M({scrollToTop:!0}),Ye()}function uo(){let e=po();if(!(e!==null&&(h==="journey"||h==="oneseat"&&"lat"in $))){G?.remove(),G=null;return}G?G.setLngLat([e.lon,e.lat]).addTo(l):(G=new maplibregl.Marker({color:Pt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(l),G.on("dragend",()=>{let n=G.getLngLat();he({lat:n.lat,lon:n.lng})}))}function ur(){let e=Qn($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function po(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=Yt.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function fe(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return Yt.find(t=>t.key===e)?.name??e}function Ve(e){ro=e,l.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function ae(e,t){let n=++z;g={lat:e,lon:t},U(),c("panel").classList.add("loading"),mo(e,t);try{let a="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",o=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${_}${a}&oneseat_day=${Wt()}`);if(n!==z)return;tn(l,e,t,_,o.current.stops,o.proposed.stops),dr(),ne=o,M({scrollToTop:!0})}catch(a){if(n!==z)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===z&&c("panel").classList.remove("loading")}}function dr(){c("pin-key").innerHTML=ia(_),c("pin-key").classList.remove("hidden")}function mo(e,t){me?me.setLngLat([t,e]):(me=new maplibregl.Marker({color:qs,draggable:!0}).setLngLat([t,e]).addTo(l),me.on("dragend",()=>{let n=me.getLngLat();Xt(n.lat,n.lng)}))}function Xt(e,t){if(lo.atLeast("half"),h==="journey"){Vt(e,t);return}h!=="places"&&ae(e,t)}async function pr(){try{Yt=await S("/api/destinations"),Qe()}catch{}}async function mr(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function yr(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
