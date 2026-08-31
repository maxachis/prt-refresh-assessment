"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function m(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function B(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function Ue(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Je(e){return e>0?`+${e}`:String(e)}function Bt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Ga="#4aa3ff",qa="#ffa23a";function Xa(e,t,n,a=96){let o=[],s=n/111320,i=n/(111320*Math.cos(e*Math.PI/180));for(let r=0;r<=a;r++){let u=r/a*2*Math.PI;o.push([t+i*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function U(e){return{type:"FeatureCollection",features:e}}function Ut(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Jt(e){e.addSource("walk",{type:"geojson",data:U([])}),e.addSource("stops-now",{type:"geojson",data:U([])}),e.addSource("stops-prop",{type:"geojson",data:U([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":qa,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Ga,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let s=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function It(e,t,n,a,o,s){e.getSource("walk").setData(U([Xa(t,n,a)])),e.getSource("stops-now").setData(U(Ut(o,"current"))),e.getSource("stops-prop").setData(U(Ut(s,"proposed")))}var x=["weekday","saturday","sunday"],Ie=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],zt={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ue=4,Kt=e=>3+ue*e,Vt=e=>4+ue*e,Z=e=>5+ue*e,Qa=e=>6+ue*e;var N=(e,t)=>e[t],Wt=(e,t)=>e[Qa(t)],ze=e=>2+2*e,Ke=e=>3+2*e,de=4,Yt=e=>2+de*e,Gt=e=>3+de*e,qt=e=>4+de*e,Xt=e=>5+de*e;var We="weekday";function k(){return We}function an(e){We=e}function on(e){e.innerHTML=`
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
    </div>`}function Za(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function eo(e,t){let n=Math.max(1,...Ie.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return Ie.map(a=>{let o=e.periods[a]??0,s=t.periods[a]??0,i=s-o,r=i>0?"up":i<0?"down":"flat";return`
      <tr>
        <th>${zt[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${s}</td>
        <td class="n ${r}">${i===0?"\xB7":Je(i)}</td>
      </tr>`}).join("")}function sn(e){return e.length?e.map(t=>`<span class="route">${m(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Qt(e){return e.first==null?'<span class="muted">no service</span>':`${B(e.first)}\u2013${B(e.last)}`}function Zt(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var to={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},no={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ao(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':he(a.current,a.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${m(a.name)}</span>
          <span class="os-status ${m(a.status)}">${to[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${o}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${no[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${me("one-seat")}</p>
    </div>`:""}function me(e){return` <button class="howto" data-caveat="${e}">method</button>`}function pe(e,t,n=null){let a=e===t?" same":"",o=n?` ${n}`:"";return`<dd class="cmp${a}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${o}">${t}</span></dd>`}function en(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function tn(e){return e.first==null||e.last==null?null:e.last-e.first}function he(e,t){let n=new Set(e.filter(a=>t.includes(a)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${nn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${nn(t,n,"prop")}</div>
    </div>`}function nn(e,t,n){return e.length?e.map(a=>`<span class="route ${t.has(a)?"both":`only-${n}`}">${m(a)}</span>`).join(" "):'<span class="muted">none</span>'}var Ve=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,oo="Allegheny";function ee(e){let t=e.place?.muni?.trim()??"",n=Ve.exec(t)?.[1],a=n===oo?t.replace(Ve,""):n?`${t.replace(Ve,"")} (${n})`:t;return e.place?.hood||a||"this location"}function Ye(e){return e==="weekday"?"weekday":e}function rn(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${Ye(t)}`}function so(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Ye(t)}, today only</span>`}${a}</dd>`}function ro(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${me("boardings")}</p>`}function io(e){if(!e)return"";let t=m(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose every bus
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains every bus under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in
        <button type="button" class="place-link" data-goto-place="${m(e.key)}">${t}</button>
      </h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${me("place-population")}</p>
    </div>`}function Ge(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],s=o.trips-a.trips,i=s>0?"up":s<0?"down":"flat",r=Zt(a),u=Zt(o),d=tn(a),p=tn(o);return`
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
        ${s===0?"no change":`${Je(s)} trips`}
        <div class="muted">${Bt(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ye(t)}, both directions</div>

    <div class="tiers">${Za(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${eo(a,o)}</tbody>
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
      ${pe(Qt(a),Qt(o))}
      <dt>Hours between</dt>
      ${pe(Ue(d),Ue(p),en(d,p,"more"))}
      <dt>Typical wait</dt>
      ${pe(r==null?"\u2014":`${r} min`,u==null?"\u2014":`${u} min`,en(r,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${pe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${so(a.boardings,t)}
    </dl>
    ${ro(a.boardings)}

    ${n}

    ${io(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${he(a.routes,o.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${me("location-not-route")}</p>
    </div>`}function ln(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${m(ee(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ge(e,We,ao(e.oneseat??[],e.oneseat_day??"any"))}`}var lo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},co={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},uo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function po(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function qe(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${sn(t)}</div>`:""}function mo(e){let t=qe("kept",e.kept)+qe("lost",e.lost)+qe("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ho(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${he(e.current,e.proposed)}
    </div>`}function yo(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${m(o.key)}">
      <span class="os-name">${m(o.name)}</span>
      <span class="os-status ${m(o.status)}">${go[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var go={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function fo(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${uo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function cn(e,t,n){let a=po(e,t);if(!a)return"";let o=e.oneseat_day??"any",s=a.status==="here"?"":mo(a)+ho(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${m(a.name)}</h2>
      <div class="muted">
        from ${m(ee(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${m(a.status)}">${lo[a.status]}</div>
    <p class="note">${co[a.status]} ${fo(o)}</p>

    ${s}

    ${yo(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${rn(e,n)}</summary>
      ${Ge(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function un(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${m(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var ge={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Xe="change",fe="change-dots",ye=null,J=new Set;function Qe(){return ye}function Ze(e){return J.has(e)}function dn(e,t,n,a,o,s,i){let r={};for(let u of n)r[u]=0;for(let u of e){if(!pn(u,a,o,s,i))continue;let d=n[N(u,Z(t))];d!==void 0&&r[d]++}return r}function pn(e,t,n,a,o){let s=N(e,0),i=N(e,1);return s>=n&&s<=o&&i>=t&&i<=a}function mn(e,t,n,a,o,s,i){let r={riders:{},measured:{},unmeasured:0};for(let u of n)r.riders[u]=0,r.measured[u]=0;for(let u of e){if(!pn(u,a,o,s,i))continue;let d=n[N(u,Z(t))];if(d===void 0)continue;let p=Wt(u,t);if(p===null){d!=="none"&&r.unmeasured++;continue}r.riders[d]+=p,r.measured[d]++}return r}function bo(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((a,o)=>t[N(n,Z(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(x.flatMap((a,o)=>[[`b${o}`,t[N(n,Z(o))]],[`c${o}`,n[Kt(o)]],[`p${o}`,n[Vt(o)]]]))}}))}}function te(e,t){let n=Object.entries(ge).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,ge.none[t]]}function hn(e){return["interpolate",["linear"],["zoom"],9,["*",te(e,"size"),.45],12,te(e,"size"),16,["*",te(e,"size"),1.9]]}function yn(e){e.addSource(Xe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:fe,type:"circle",source:Xe,paint:{"circle-color":te(0,"color"),"circle-radius":hn(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function et(e,t,n){return ye=await S(`/api/change?radius=${t}`),e.getSource(Xe).setData(bo(ye)),tt(e,n),ye}function tt(e,t){let n=x.indexOf(t);e.setPaintProperty(fe,"circle-color",te(n,"color")),e.setPaintProperty(fe,"circle-radius",hn(n)),nt(e,t)}function gn(e,t,n){J.has(t)?J.delete(t):J.add(t),nt(e,n)}function fn(e,t){J.clear(),nt(e,t)}function nt(e,t){let n=x.indexOf(t),a=["none",...J];e.setFilter(fe,["!",["in",["get",`b${n}`],["literal",a]]])}function bn(e,t,n){let a=x.indexOf(t),o=e[`b${a}`],s=n.find(d=>d.key===o)?.label??o,i=e[`c${a}`],r=e[`p${a}`];return`<b>${s}</b><br>${i} \u2192 ${r} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var at="surface",we="surface-fill",wn="#6b7280",ot=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,wn],[.138,wn],[1,"#12a163"],[2,"#0b7a48"]],T="#e8232f",C="#0f79c9",vn=2,be=null,Sn=!1;function ve(){return be}function st(){return Sn}function Ln(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-vn,Math.min(vn,n))}function kn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function $n(e,t,n,a,o,s,i,r){let u={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let p=i.lat0+(d[1]+.5)*i.dlat,f=i.lon0+(d[0]+.5)*i.dlon;if(p<a||p>s||f<n||f>o)continue;let P=d[ze(t)],R=d[Ke(t)],D=kn(P,R);if(D!=="none")if(D==="ramp"){let h=Ln(P,R);u[h<-.138?"less":h>.138?"more":"same"]+=r}else u[D]+=r}return u}function wo(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let i=t+s[1]*a,r=i+a,u=n+s[0]*o,d=u+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,i],[d,i],[d,r],[u,r],[u,i]]]},properties:Object.fromEntries(x.flatMap((p,f)=>{let P=s[ze(f)],R=s[Ke(f)];return[[`k${f}`,kn(P,R)],[`v${f}`,Ln(P,R)??0]]}))}})}}function xn(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...ot.flatMap(([t,n])=>[t,n])]]}function I(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function _n(e,t){e.addSource(at,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:we,type:"fill",source:at,layout:{visibility:"none"},paint:{"fill-color":xn(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,I(0,.85),13,I(0,.62),16,I(0,.45)]}},t)}async function rt(e,t,n){return be=await S(`/api/surface?radius=${t}`),e.getSource(at).setData(wo(be)),it(e,n),be}function it(e,t){let n=x.indexOf(t);e.setPaintProperty(we,"fill-color",xn(n)),e.setPaintProperty(we,"fill-opacity",["interpolate",["linear"],["zoom"],9,I(n,.85),13,I(n,.62),16,I(n,.45)])}function Pn(e,t){Sn=t,e.setLayoutProperty(we,"visibility",t?"visible":"none")}var lt=null;function Se(){return lt}async function ct(e){return lt=await S(`/api/population?radius=${e}`),lt}function On(e,t,n,a,o,s,i){let r={lost:0,gained:0,kept:0,none:0};for(let u of e){let d=i.lat0+(u[1]+.5)*i.dlat,p=i.lon0+(u[0]+.5)*i.dlon;d<a||d>s||p<n||p>o||(r.lost+=u[Yt(t)],r.gained+=u[Gt(t)],r.kept+=u[qt(t)],r.none+=u[Xt(t)])}return r}var ut="corridor",Rn="corridor-lines",$e="#8b929c",vo="#6f7783",ke={lost:T,added:C,kept:$e};var Le=null,Dn=!1;function xe(){return Le}function dt(){return Dn}function So(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Tn(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Lo(){let e=t=>["match",["get","klass"],"lost",ke.lost,"added",ke.added,t];return["interpolate",["linear"],["zoom"],9,e(vo),14,e($e)]}function ko(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function $o(){return["match",["get","klass"],"kept",.85,.9]}function Cn(e,t){e.addSource(ut,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Rn,type:"line",source:ut,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Lo(),"line-width":ko(),"line-opacity":$o()}},t)}async function pt(e,t){return Le=await S(`/api/corridors?day=${t}`),e.getSource(ut).setData(So(Le)),Le}async function En(e,t){x.includes(t)&&await pt(e,t)}function Mn(e,t){Dn=t,e.setLayoutProperty(Rn,"visibility",t?"visible":"none")}var ht="#2b3038",An="#b9bec6",ne={loses:{color:T,size:6},gains:{color:C,size:6},keeps:{color:$e,size:3},here:{color:ht,size:3.5},none:{color:An,size:1.8}},Pe=["loses","gains","keeps","none","here"],mt="oneseat",Nn="oneseat-dots",_e=null,Hn=!1;function z(){return _e}function yt(){return Hn}function Fn(e,t,n,a,o,s){let i={};for(let r of t)i[r]=0;for(let r of e){let u=r[0],d=r[1];if(u<a||u>s||d<n||d>o)continue;let p=t[r[3]];p!==void 0&&i[p]++}return i}function xo(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function _o(){return["match",["get","status"],...Object.entries(ne).flatMap(([e,t])=>[e,t.color]),An]}function Po(){let e=["match",["get","status"],...Object.entries(ne).flatMap(([t,n])=>[t,n.size]),ne.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function jn(e,t){e.addSource(mt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Nn,type:"circle",source:mt,layout:{visibility:"none"},paint:{"circle-color":_o(),"circle-radius":Po(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Oo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Ro="pin";function Bn(e){return"key"in e?e.key:Ro}var Oe="any";function Do(e,t,n){return`radius=${e}&${Oo(t)}&day=${n}`}function Un(e,t){return e?t:Oe}function Jn(e,t){return e==="places"?!1:e!=="oneseat"||t}async function gt(e,t,n,a=Oe){return _e=await S(`/api/oneseat?${Do(t,n,a)}`),e.getSource(mt).setData(xo(_e)),_e}function In(e,t){Hn=t,e.setLayoutProperty(Nn,"visibility",t?"visible":"none")}function ft(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function zn(e,t){let n=t.statuses.find(r=>r.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),s=r=>r.length?r.join(", "):"none",i=ft(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${i}<br>today: ${s(a)}<br>proposed: ${s(o)}`}var bt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function To(e){return e.buckets.filter(t=>t.key!=="none")}var Kn={area:"Ground",people:"People"};function Co(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=$n(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),s=i=>i.toFixed(i<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(o.less)}</b> km\xB2 less</span>
        <span><b>${s(o.more)}</b> km\xB2 more</span>
        <span><b>${s(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Eo(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=On(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=i=>Math.round(i).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(o.lost)}</b> people lose all service</span>
        <span><b>${s(o.gained)}</b> gain service</span>
        <span><b>${s(o.kept)}</b> keep a bus</span>
        <span><b>${s(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}function Mo(e){let{layer:t,day:n,bounds:a,unit:o,population:s}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${ot.map(([r,u])=>`${u} ${((r+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service</span>
        <span><i style="background:${C}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Kn).map(r=>`
          <button data-surface-unit="${r}" aria-pressed="${o===r}"
                  class="${o===r?"active":""}">${Kn[r]}</button>`).join("")}
      </div>
      ${o==="people"?Eo(n,a,s):Co(t,n,a)}
    </div>`}var Ao=["lost","added","kept"],No={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Ho={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Wn(e,t){let{lostPct:n,addedPct:a}=Tn(t.km),o=r=>r.toFixed(1),i=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${i}</b> km of street, citywide \u2014 ${Ho[t.day]}
    </div>
    ${Ao.map(r=>`
      <div class="lg-row lg-static">
        <i style="background:${ke[r]}"></i>
        <span class="lg-lab">${m(No[r])}</span>
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
      what you can still reach on foot.</div>`}function Yn(e,t,n){let a=t.statuses.map(p=>p.key),o=Fn(t.points,a,n.west,n.south,n.east,n.north),s=p=>t.statuses.find(f=>f.key===p)?.label??p,i=Pe.reduce((p,f)=>p+(o[f]??0),0),r=ft(t),u=t.day&&t.day!==Oe,d=u?`Restricted to routes running on ${bt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${m(r)}</b>
      <span class="muted">\xB7 ${i.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${bt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Pe.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${ne[p].color}"></i>
        <span class="lg-lab">${m(s(p))}</span>
        <span class="lg-n">${(o[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Pe.map(p=>`${(t.counts[p]??0).toLocaleString()} ${m(s(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${m(r)} without transferring?
      ${d} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Gn(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Vn={locations:"Locations",riders:"Riders"};function Fo(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function qn(e,t){let{layer:n,day:a,bounds:o,weight:s,surface:i,unit:r="area",population:u}=t,d=n.buckets.map(w=>w.key),p=n.days.indexOf(a),{west:f,south:P,east:R,north:D}=o,h=To(n),X=dn(n.points,p,d,f,P,R,D),_=s==="riders"?mn(n.points,p,d,f,P,R,D):null,Q=w=>_?_.measured[w]?Math.round(_.riders[w]).toLocaleString():"\u2014":X[w].toLocaleString(),Ya=_?`<b>${Math.round(h.reduce((w,Be)=>w+_.riders[Be.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${h.reduce((w,Be)=>w+X[Be.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${Ya}
      <span class="muted">\xB7 ${bt[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Vn).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${Vn[w]}</button>`).join("")}
    </div>
    ${h.map(w=>`
      <button class="lg-row ${Ze(w.key)?"off":""}" data-bucket="${m(w.key)}"
              aria-pressed="${!Ze(w.key)}">
        <i style="background:${ge[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${m(w.label)}</span>
        <span class="lg-n">${Q(w.key)}</span>
      </button>`).join("")}
    ${i?Mo({layer:i,day:a,bounds:o,unit:r,population:u}):""}
    ${_?Fo(_.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var wt="#4aa3ff",aa="#ffa23a",vt="headline",Re="journey",oa="journey-rides",sa="journey-walks",jo=[oa,sa],ra=null,ia=!1;function Te(){return ra}function St(){return ia}function Bo(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let s=n[o].itinerary;if(s)for(let i of s.legs){let r=i.from??e.origin,u=i.to??e.destination,d=[[r.lon,r.lat],[u.lon,u.lat]],p=i.path?.length?i.path:d;a.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:o,kind:i.kind,route:i.route}})}}return{type:"FeatureCollection",features:a}}function Xn(){return["match",["get","side"],"current",wt,"proposed",aa,wt]}function Qn(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function la(e,t){e.addSource(Re,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:oa,type:"line",source:Re,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Xn(),"line-width":Qn(1),"line-opacity":.85}},t),e.addLayer({id:sa,type:"line",source:Re,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Xn(),"line-width":Qn(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ca(e,t){ia=t;for(let n of jo)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Lt(e,t){ra=t;let n=t?Bo(t,vt):{type:"FeatureCollection",features:[]};e.getSource(Re).setData(n)}function ua(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Zn=e=>`${e.toFixed(1)} min`;function da(e){return e==null?"\u2014":e===0?"no change":e>0?`${Zn(e)} slower`:`${Zn(-e)} faster`}function ea(e,t){return e?e.name?m(e.name):`stop ${m(e.stop_id)}`:t}function Uo(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=ea(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${m(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${ea(e.to,"the destination")}</span></div>`}function ta(e,t){let n=[],a=null;for(let o of e.legs){let s=a?Math.round(o.depart-a.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Uo(o,t)),a=o}return n.join("")}var Jo={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function De(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Io(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function zo(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${De(t.current)} \u2192
        ${De(t.proposed)} min</span>
        <span class="muted">${da(t.change_min)}</span></div>
      ${a}
    </div>`}function na(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function kt(e,t){let n=e.radii[vt],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
    <div class="place-head">
      <h2>Travel time to ${m(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${B(e.window.start_min)}
        and ${B(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${o}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Jo[n.classification]??""}</p>
      </div>
      ${na(e)}`:`${o}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${De(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${De(n.proposed)}</div>
      </div>
      <div class="hl-delta ${a}">${da(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Io(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ta(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ta(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${zo(e)}
    ${na(e)}`}function pa(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${m(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function ma(e){let t=e?e.radii[vt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${wt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${aa}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var $t="places",ya="places-points",Ko="Named places only, Allegheny County. 151 of the county's 68,989 residents who lose every bus live beyond 2 km of a labelled PRT stop, take no place name, and are not in this list. Every figure here is day-free \u2014 losing every bus on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is listed but given no share: a denominator that small cannot carry one.",ae={lost:T,gained:C},Ce=null,H=null,ga=!1;function xt(){return Ce}function fa(){return H}function _t(){return ga}function Vo(e,t){let n=[...e];return t==="count"?n.sort((a,o)=>o.residents_lost-a.residents_lost):n.sort((a,o)=>(o.share_lost??-1)-(a.share_lost??-1))}function Wo(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function Yo(e){return Math.max(e.residents_lost,e.residents_gained)}var ha=4,Go=16,qo=1e3;function Xo(e){let t=Math.min(1,Math.sqrt(e/qo));return ha+t*(Go-ha)}function Qo(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Wo(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:Xo(Yo(t))}}))}}function Zo(){return["match",["get","klass"],"lost",ae.lost,"gained",ae.gained,ae.lost]}function es(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}function ba(e,t){e.addSource($t,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ya,type:"circle",source:$t,layout:{visibility:"none"},paint:{"circle-color":Zo(),"circle-radius":es(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}async function wa(){return Ce||(Ce=await S("/api/places")),Ce}async function va(e,t){try{H=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return H=null,null}return e.getSource($t).setData(Qo(H)),e.flyTo({center:[H.lon,H.lat],zoom:13}),H}function Sa(e,t){ga=t,e.setLayoutProperty(ya,"visibility",t?"visible":"none")}function ts(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${m(e.key)}">
      <span class="place-name">${m(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}function La(e,t,n){let a=Vo(e,t).map(o=>ts(o,o.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Ko}</p>
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function ka(e){return`
    ${e?`<div class="lg-head"><b>${m(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}
    <div class="lg-row lg-static"><i style="background:${ae.lost}"></i>
      <span class="lg-lab">loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${ae.gained}"></i>
      <span class="lg-lab">gains more than it loses</span></div>
    <div class="lg-foot">Points, not a filled area: this repo has no place
      boundaries, only the nearest surviving PRT stop each block group is
      named for. Size is the larger of a block group's losses or gains.</div>`}var Pt=" \xB7 ",Ot={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},$a=Object.keys(Ot);function xa(e){return Ot[e]??e}var ns={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},as=["oneseat","journey"];function os(e){return e!=="journey"}function ss(e){let t=[Ot[e.view]??e.view];return e.view==="places"?t[0]:(as.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":ns[e.day]),os(e.view)&&t.push(`${e.radius} m walk`),t.join(Pt))}function _a(e){let[t,...n]=ss(e).split(Pt);return`<b>${m(t)}</b>${n.map(a=>Pt+m(a)).join("")}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place"},Ee={any:"any",selected:"selected"},rs="pin",Pa=5;function Ra(e){try{return e.self!==e.top}catch{return!0}}function Da(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?Ee.selected:Ee.any),t.set(b.dest,"key"in e.dest?e.dest.key:Rt(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.at&&t.set(b.at,Rt(e.at)),e.camera&&t.set(b.camera,`${Rt(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(b.place,e.place),`?${t}`}function Ta(e){let t=new URLSearchParams(e),n={},a=t.get(b.view);a&&$a.includes(a)&&(n.view=a);let o=t.get(b.day);o&&x.includes(o)&&(n.day=o);let s=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let i=t.get(b.oneSeatDay);i===Ee.selected?n.oneSeatRestricted=!0:i===Ee.any&&(n.oneSeatRestricted=!1);let r=t.get(b.dest);if(r&&r!==rs){let f=Oa(r);f?n.dest=f:r.includes(",")||(n.dest={key:r})}let u=Oa(t.get(b.at));u&&(n.at=u);let d=is(t.get(b.camera));d&&(n.camera=d);let p=t.get(b.place);return p&&(n.place=p),n}function Rt(e){return`${e.lat.toFixed(Pa)},${e.lon.toFixed(Pa)}`}function Oa(e){let t=Ca(e,2);return t?{lat:t[0],lon:t[1]}:null}function is(e){let t=Ca(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ca(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Dt="embed";var ls=["1","true","yes"];function Ea(e){let t=new URLSearchParams(e).get(Dt);return t!==null&&ls.includes(t.toLowerCase())}function Ma(e){let t=new URLSearchParams(e);return t.set(Dt,"1"),`?${t}`}function Aa(e){let t=new URLSearchParams(e);t.delete(Dt);let n=String(t);return n?`?${n}`:""}function Na(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var M=["peek","half","full"],cs=192,us=.3,ds=.55,ps=.9,ms=.6,hs=.45;function Me(e,t){return e==="peek"?Math.min(cs,t*us):e==="half"?t*ds:t*ps}function ys(e,t,n=0){let a=M.map(s=>Math.abs(Me(s,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>ms&&(o=Math.max(0,Math.min(M.length-1,o+(n>0?1:-1)))),M[o]}function Ha(e){return M[(M.indexOf(e)+1)%M.length]}function gs(e,t){return Math.min(e,t*hs)}function K(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Tt(e){let t=null,n=()=>{let a=K();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var fs=8,bs=400;function Fa(e){let t=l("side"),n=l("sheet-handle"),a="peek",o=!1,s=0,i=0,r=0,u={y:0,t:0};function d(){return window.innerHeight}function p(h){t.style.height=`${h}px`,e.onMove(h,gs(h,d()))}function f(h){a=h,t.dataset.snap=h,p(Me(h,d()))}n.addEventListener("pointerdown",h=>{K()&&(o=!0,s=h.clientY,i=t.getBoundingClientRect().height,r=h.timeStamp,u={y:h.clientY,t:h.timeStamp},t.classList.add("dragging"),n.setPointerCapture(h.pointerId))}),n.addEventListener("pointermove",h=>{if(!o)return;let X=i+(s-h.clientY),_=Me("peek",d()),Q=Me("full",d());p(Math.max(_,Math.min(Q,X))),u={y:h.clientY,t:h.timeStamp}});function P(h){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(h.clientY-s)>fs)&&h.timeStamp-r<bs){f(Ha(a));return}let _=h.timeStamp-u.t,Q=_>0?(u.y-h.clientY)/_:0;f(ys(t.getBoundingClientRect().height,d(),Q))}n.addEventListener("pointerup",P),n.addEventListener("pointercancel",P),n.addEventListener("keydown",h=>{h.key!=="Enter"&&h.key!==" "||(h.preventDefault(),K()&&f(Ha(a)))});let R=Tt(e.onLayoutChange);function D(){if(R(),!K()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}f(a)}return window.addEventListener("resize",D),D(),{at:()=>K()?a:"full",atLeast(h){K()&&M.indexOf(h)>M.indexOf(a)&&f(h)}}}var ws=[-79.9959,40.4406],vs=12,Ss="#e2574c",O={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},re=Ta(location.search),le=Ea(location.search);le&&l("app").classList.add("embed");var Ls={at:()=>"full",atLeast(){}},Ba=null,$=400,oe=null,g=null,W=null,j=0,L={key:"downtown"},F=null,Ua=!1,G=!1,He="locations",q="area",Ja="count",Mt=null,y="dots",Ia,At=[],c=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:re.camera?[re.camera.lon,re.camera.lat]:ws,zoom:re.camera?.zoom??vs,cooperativeGestures:Ra(window),attributionControl:{compact:!0}});c.addControl(new maplibregl.NavigationControl,"top-right");c.on("load",()=>{Jt(c),yn(c),_n(c,"change-dots"),Cn(c,"change-dots"),jn(c,"walk-fill"),la(c),ba(c,"change-dots"),E(),c.on("click",t=>{if(Ua){ie({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(s=>c.getLayoutProperty(s,"visibility")!=="none"),a=c.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];jt(o[1],o[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});c.on("mouseenter","change-dots",()=>{c.getCanvas().style.cursor="pointer"}),c.on("mouseleave","change-dots",()=>{c.getCanvas().style.cursor="",e.remove()}),c.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=Qe();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(bn(n.properties,k(),a.buckets)).addTo(c)}),c.on("mouseenter","oneseat-dots",()=>{c.getCanvas().style.cursor="pointer"}),c.on("mouseleave","oneseat-dots",()=>{c.getCanvas().style.cursor="",e.remove()}),c.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=z();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(zn(n.properties,a)).addTo(c)}),c.on("moveend",()=>{let t=c.getCenter();Ba={lat:t.lat,lon:t.lng,zoom:c.getZoom()},v(),A()}),se(O.radius,t=>{$=Number(t.dataset.radius),et(c,$,k()).then(v),ve()&&rt(c,$,k()).then(v),Se()&&ct($).then(v),z()&&Ae(),g&&Y(g.lat,g.lon)}),se(O.day,t=>{let n=t.dataset.day;an(n),y!=="journey"&&E(),tt(c,n),it(c,n),y==="journey"&&g&&Nt(g.lat,g.lon),xe()&&En(c,n).then(v),G&&z()&&(Ae(),g&&Y(g.lat,g.lon)),v()}),se(O.oneSeatDay,t=>{G=t.dataset.oneseatDay==="selected",ja(),Ae(),g&&Y(g.lat,g.lon)}),se(O.view,t=>{let n=y;y=t.dataset.view,c.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),Os(y==="surface"||y==="both"),Ds(y==="corridors"),Ms(y==="oneseat"),Es(y==="journey",n==="journey"),Ts(y==="places"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&E({scrollToTop:!0}),Cs(y!=="corridors"&&y!=="journey"&&y!=="places");let a=y==="oneseat"||y==="journey";l("dest-controls").classList.toggle("hidden",!a),l("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),ja(),a||Ne(!1),Ka()}),se(O.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Ne(!0);return}Ne(!1),ie({key:n})}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){He=n.dataset.weight,v(),A();return}let a=t.target.closest("[data-surface-unit]");if(a){q=a.dataset.surfaceUnit,Rs(q),A();return}let o=t.target.closest("[data-bucket]");o&&(gn(c,o.dataset.bucket,k()),v())}),l("legend-reset").addEventListener("click",()=>{fn(c,k()),v()}),l("legend-collapse").addEventListener("click",()=>{Ct(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&ie({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&js(a.dataset.caveat);let o=t.target.closest("[data-select-place]");o&&Et(o.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(Ja=s.dataset.sortPlaces,E());let i=t.target.closest("[data-goto-place]");i&&(y!=="places"&&V(O.view,"places"),Et(i.dataset.gotoPlace))}),l("side-toggle").addEventListener("click",_s),le&&Tt(Ct),Ia=le?Ls:Fa({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),c.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Ct}),$s(),je(),Fe(),ks(re)||et(c,$,k()).then(v),Fs(),Hs()});function se(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),je(),A()})})}function V(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function ks(e){let t=!1;return e.radius!==void 0&&(t=V(O.radius,String(e.radius))||t),e.day&&(t=V(O.day,e.day)||t),e.oneSeatRestricted!==void 0&&V(O.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(He=e.weight),e.surfaceUnit&&(q=e.surfaceUnit),e.dest&&("key"in e.dest?V(O.dest,e.dest.key):ie(e.dest)),e.view&&V(O.view,e.view),e.at&&jt(e.at.lat,e.at.lon),e.place&&Et(e.place),t}function A(){let e={view:y,day:k(),radius:$,oneSeatRestricted:G,weight:He,surfaceUnit:q,dest:L,at:g,camera:Ba,place:Mt},t=Da(e);history.replaceState(null,"",(le?Ma(t):t)+location.hash),Fe(t)}function Fe(e=Aa(location.search)){if(!le)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g?W?ee(W):"this point":null;t.querySelector(".el-action").textContent=Na(n)}function je(){l("statebar").innerHTML=_a({view:y,day:k(),radius:$,oneSeatRestricted:G,destination:ce()}),xs()}function Ct(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function $s(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function xs(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(xa(y)))}function _s(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),c.resize()}function v(){Ps()}function Ps(){if(l("legend-reset").classList.toggle("hidden",dt()||yt()||St()||_t()),St()){l("legend").innerHTML=ma(Te());return}if(_t()){l("legend").innerHTML=ka(fa());return}if(dt()){let n=xe();n&&Wn(l("legend"),n);return}if(yt()){let n=z();if(!n)return;let a=c.getBounds();Yn(l("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=Qe();if(!e)return;let t=c.getBounds();qn(l("legend"),{layer:e,day:k(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:He,surface:st()?ve():null,unit:q,population:Se()})}async function Os(e){if(e&&!ve()){l("legend").classList.add("loading");try{await rt(c,$,k())}finally{l("legend").classList.remove("loading")}}Pn(c,e),e&&q==="people"&&await za(),v()}async function za(){if(!Se()){l("legend").classList.add("loading");try{await ct($)}finally{l("legend").classList.remove("loading")}}}async function Rs(e){e==="people"&&st()&&await za(),v()}async function Ds(e){if(e&&!xe()){l("legend").classList.add("loading");try{await pt(c,k())}finally{l("legend").classList.remove("loading")}}Mn(c,e),v()}async function Ts(e){if(e&&!xt()){l("legend").classList.add("loading");try{await wa()}finally{l("legend").classList.remove("loading")}}Sa(c,e),e&&E(),v()}async function Et(e){Mt=e,await Ft(()=>va(c,e)),y==="places"&&(E(),document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),A()}function Cs(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function E({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),Fe(),y==="places"){l("panel").innerHTML=La(xt()??[],Ja,Mt);return}if(!W){y==="oneseat"?l("panel").innerHTML=un(ce()):on(l("panel"));return}if(y==="oneseat"){let t=cn(W,L,k());if(t){l("panel").innerHTML=t;return}}ln(W)}function Es(e,t=!1){if(ca(c,e),v(),!e){t&&(g?Y(g.lat,g.lon):E());return}Te()&&g?l("panel").innerHTML=kt(Te(),ce()):l("panel").innerHTML=pa(ce())}async function Nt(e,t){let n=++j;g={lat:e,lon:t},A(),Wa(e,t);let a=Va(),o=m(ce());if(!a){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(ua({lat:e,lon:t},a,k()));if(n!==j)return;Lt(c,s),l("panel").innerHTML=kt(s,o),v(),Fe()}catch(s){if(n!==j)return;Lt(c,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function ja(){l("day-controls").classList.toggle("hidden",!Jn(y,G))}function Ht(){return Un(G,k())}async function Ms(e){e&&!z()&&await Ft(()=>gt(c,$,L,Ht())),In(c,e),v()}async function Ae(){await Ft(()=>gt(c,$,L,Ht())),v()}async function Ft(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function ie(e){if(L=e,Ne(!1),As(),Ka(),je(),A(),y==="journey"){g&&Nt(g.lat,g.lon),v();return}g?Y(g.lat,g.lon):E({scrollToTop:!0}),Ae()}function Ka(){let e=Va();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in L))){F?.remove(),F=null;return}F?F.setLngLat([e.lon,e.lat]).addTo(c):(F=new maplibregl.Marker({color:ht,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(c),F.on("dragend",()=>{let n=F.getLngLat();ie({lat:n.lat,lon:n.lng})}))}function As(){let e=Bn(L);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Va(){if("lat"in L)return{lat:L.lat,lon:L.lon};let e=L.key,t=At.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ce(){if("lat"in L)return`${L.lat.toFixed(4)}, ${L.lon.toFixed(4)}`;let e=L.key;return At.find(t=>t.key===e)?.name??e}function Ne(e){Ua=e,c.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Y(e,t){let n=++j;g={lat:e,lon:t},A(),l("panel").classList.add("loading"),Wa(e,t);try{let a="lat"in L?`&dest_lat=${L.lat.toFixed(6)}&dest_lon=${L.lon.toFixed(6)}`:"",o=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${$}${a}&oneseat_day=${Ht()}`);if(n!==j)return;It(c,e,t,$,o.current.stops,o.proposed.stops),Ns(),W=o,E({scrollToTop:!0})}catch(a){if(n!==j)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===j&&l("panel").classList.remove("loading")}}function Ns(){l("pin-key").innerHTML=Gn($),l("pin-key").classList.remove("hidden")}function Wa(e,t){oe?oe.setLngLat([t,e]):(oe=new maplibregl.Marker({color:Ss,draggable:!0}).setLngLat([t,e]).addTo(c),oe.on("dragend",()=>{let n=oe.getLngLat();jt(n.lat,n.lng)}))}function jt(e,t){if(Ia.atLeast("half"),y==="journey"){Nt(e,t);return}y!=="places"&&Y(e,t)}async function Hs(){try{At=await S("/api/destinations"),je()}catch{}}async function Fs(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function js(e){l("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
