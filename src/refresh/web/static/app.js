"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function m(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function J(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function Ge(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function Ke(e){return e>0?`+${e}`:String(e)}function zt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var to="#4aa3ff",no="#ffa23a";function ao(e,t,n,a=96){let o=[],s=n/111320,i=n/(111320*Math.cos(e*Math.PI/180));for(let r=0;r<=a;r++){let u=r/a*2*Math.PI;o.push([t+i*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function I(e){return{type:"FeatureCollection",features:e}}function Gt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Kt(e){e.addSource("walk",{type:"geojson",data:I([])}),e.addSource("stops-now",{type:"geojson",data:I([])}),e.addSource("stops-prop",{type:"geojson",data:I([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":no,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":to,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let s=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function Yt(e,t,n,a,o,s){e.getSource("walk").setData(I([ao(t,n,a)])),e.getSource("stops-now").setData(I(Gt(o,"current"))),e.getSource("stops-prop").setData(I(Gt(s,"proposed")))}var x=["weekday","saturday","sunday"],Ye=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Vt={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},me=4,Wt=e=>3+me*e,qt=e=>4+me*e,ne=e=>5+me*e,oo=e=>6+me*e;var F=(e,t)=>e[t],Xt=(e,t)=>e[oo(t)],Ve=e=>2+2*e,We=e=>3+2*e,ye=4,Qt=e=>2+ye*e,Zt=e=>3+ye*e,en=e=>4+ye*e,tn=e=>5+ye*e;var Xe="weekday";function k(){return Xe}function ln(e){Xe=e}function cn(e){e.innerHTML=`
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
    </div>`}function so(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function ro(e,t){let n=Math.max(1,...Ye.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return Ye.map(a=>{let o=e.periods[a]??0,s=t.periods[a]??0,i=s-o,r=i>0?"up":i<0?"down":"flat";return`
      <tr>
        <th>${Vt[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${s}</td>
        <td class="n ${r}">${i===0?"\xB7":Ke(i)}</td>
      </tr>`}).join("")}function un(e){return e.length?e.map(t=>`<span class="route">${m(t)}</span>`).join(" "):'<span class="muted">none</span>'}function nn(e){return e.first==null?'<span class="muted">no service</span>':`${J(e.first)}\u2013${J(e.last)}`}function an(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var io={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},lo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function co(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':fe(a.current,a.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${m(a.name)}</span>
          <span class="os-status ${m(a.status)}">${io[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${o}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${lo[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${ge("one-seat")}</p>
    </div>`:""}function ge(e){return` <button class="howto" data-caveat="${e}">method</button>`}function he(e,t,n=null){let a=e===t?" same":"",o=n?` ${n}`:"";return`<dd class="cmp${a}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${o}">${t}</span></dd>`}function on(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function sn(e){return e.first==null||e.last==null?null:e.last-e.first}function fe(e,t){let n=new Set(e.filter(a=>t.includes(a)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${rn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${rn(t,n,"prop")}</div>
    </div>`}function rn(e,t,n){return e.length?e.map(a=>`<span class="route ${t.has(a)?"both":`only-${n}`}">${m(a)}</span>`).join(" "):'<span class="muted">none</span>'}var qe=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,uo="Allegheny";function ae(e){let t=e.place?.muni?.trim()??"",n=qe.exec(t)?.[1],a=n===uo?t.replace(qe,""):n?`${t.replace(qe,"")} (${n})`:t;return e.place?.hood||a||"this location"}function Qe(e){return e==="weekday"?"weekday":e}function dn(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${Qe(t)}`}function po(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Qe(t)}, today only</span>`}${a}</dd>`}function mo(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${ge("boardings")}</p>`}function yo(e){if(!e)return"";let t=m(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${ge("place-population")}</p>
    </div>`}function Ze(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],s=o.trips-a.trips,i=s>0?"up":s<0?"down":"flat",r=an(a),u=an(o),d=sn(a),p=sn(o);return`
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
        ${s===0?"no change":`${Ke(s)} trips`}
        <div class="muted">${zt(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Qe(t)}, both directions</div>

    <div class="tiers">${so(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${ro(a,o)}</tbody>
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
      ${he(nn(a),nn(o))}
      <dt>Hours between</dt>
      ${he(Ge(d),Ge(p),on(d,p,"more"))}
      <dt>Typical wait</dt>
      ${he(r==null?"\u2014":`${r} min`,u==null?"\u2014":`${u} min`,on(r,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${he(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${po(a.boardings,t)}
    </dl>
    ${mo(a.boardings)}

    ${n}

    ${yo(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${fe(a.routes,o.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${ge("location-not-route")}</p>
    </div>`}function pn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${m(ae(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ze(e,Xe,co(e.oneseat??[],e.oneseat_day??"any"))}`}var ho={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},go={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},fo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function bo(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function et(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${un(t)}</div>`:""}function wo(e){let t=et("kept",e.kept)+et("lost",e.lost)+et("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function vo(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${fe(e.current,e.proposed)}
    </div>`}function So(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${m(o.key)}">
      <span class="os-name">${m(o.name)}</span>
      <span class="os-status ${m(o.status)}">${Lo[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Lo={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function ko(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${fo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function mn(e,t,n){let a=bo(e,t);if(!a)return"";let o=e.oneseat_day??"any",s=a.status==="here"?"":wo(a)+vo(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${m(a.name)}</h2>
      <div class="muted">
        from ${m(ae(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${m(a.status)}">${ho[a.status]}</div>
    <p class="note">${go[a.status]} ${ko(o)}</p>

    ${s}

    ${So(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${dn(e,n)}</summary>
      ${Ze(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function yn(e){return`
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
    </div>`}var we={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},tt="change",ve="change-dots",be=null,z=new Set;function nt(){return be}function at(e){return z.has(e)}function hn(e,t,n,a,o,s,i){let r={};for(let u of n)r[u]=0;for(let u of e){if(!gn(u,a,o,s,i))continue;let d=n[F(u,ne(t))];d!==void 0&&r[d]++}return r}function gn(e,t,n,a,o){let s=F(e,0),i=F(e,1);return s>=n&&s<=o&&i>=t&&i<=a}function fn(e,t,n,a,o,s,i){let r={riders:{},measured:{},unmeasured:0};for(let u of n)r.riders[u]=0,r.measured[u]=0;for(let u of e){if(!gn(u,a,o,s,i))continue;let d=n[F(u,ne(t))];if(d===void 0)continue;let p=Xt(u,t);if(p===null){d!=="none"&&r.unmeasured++;continue}r.riders[d]+=p,r.measured[d]++}return r}function $o(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((a,o)=>t[F(n,ne(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(x.flatMap((a,o)=>[[`b${o}`,t[F(n,ne(o))]],[`c${o}`,n[Wt(o)]],[`p${o}`,n[qt(o)]]]))}}))}}function oe(e,t){let n=Object.entries(we).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,we.none[t]]}function bn(e){return["interpolate",["linear"],["zoom"],9,["*",oe(e,"size"),.45],12,oe(e,"size"),16,["*",oe(e,"size"),1.9]]}function wn(e){e.addSource(tt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ve,type:"circle",source:tt,paint:{"circle-color":oe(0,"color"),"circle-radius":bn(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function ot(e,t,n){return be=await S(`/api/change?radius=${t}`),e.getSource(tt).setData($o(be)),st(e,n),be}function st(e,t){let n=x.indexOf(t);e.setPaintProperty(ve,"circle-color",oe(n,"color")),e.setPaintProperty(ve,"circle-radius",bn(n)),rt(e,t)}function vn(e,t,n){z.has(t)?z.delete(t):z.add(t),rt(e,n)}function Sn(e,t){z.clear(),rt(e,t)}function rt(e,t){let n=x.indexOf(t),a=["none",...z];e.setFilter(ve,["!",["in",["get",`b${n}`],["literal",a]]])}function Ln(e,t,n){let a=x.indexOf(t),o=e[`b${a}`],s=n.find(d=>d.key===o)?.label??o,i=e[`c${a}`],r=e[`p${a}`];return`<b>${s}</b><br>${i} \u2192 ${r} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var it="surface",Le="surface-fill",kn="#6b7280",lt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,kn],[.138,kn],[1,"#12a163"],[2,"#0b7a48"]],T="#e8232f",C="#0f79c9",$n=2,Se=null,xn=!1;function ke(){return Se}function ct(){return xn}function _n(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-$n,Math.min($n,n))}function Pn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function On(e,t,n,a,o,s,i,r){let u={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let p=i.lat0+(d[1]+.5)*i.dlat,f=i.lon0+(d[0]+.5)*i.dlon;if(p<a||p>s||f<n||f>o)continue;let P=d[Ve(t)],R=d[We(t)],D=Pn(P,R);if(D!=="none")if(D==="ramp"){let y=_n(P,R);u[y<-.138?"less":y>.138?"more":"same"]+=r}else u[D]+=r}return u}function xo(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let i=t+s[1]*a,r=i+a,u=n+s[0]*o,d=u+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,i],[d,i],[d,r],[u,r],[u,i]]]},properties:Object.fromEntries(x.flatMap((p,f)=>{let P=s[Ve(f)],R=s[We(f)];return[[`k${f}`,Pn(P,R)],[`v${f}`,_n(P,R)??0]]}))}})}}function Rn(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],C,["interpolate",["linear"],["get",`v${e}`],...lt.flatMap(([t,n])=>[t,n])]]}function G(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function Dn(e,t){e.addSource(it,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Le,type:"fill",source:it,layout:{visibility:"none"},paint:{"fill-color":Rn(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,G(0,.85),13,G(0,.62),16,G(0,.45)]}},t)}async function ut(e,t,n){return Se=await S(`/api/surface?radius=${t}`),e.getSource(it).setData(xo(Se)),dt(e,n),Se}function dt(e,t){let n=x.indexOf(t);e.setPaintProperty(Le,"fill-color",Rn(n)),e.setPaintProperty(Le,"fill-opacity",["interpolate",["linear"],["zoom"],9,G(n,.85),13,G(n,.62),16,G(n,.45)])}function Tn(e,t){xn=t,e.setLayoutProperty(Le,"visibility",t?"visible":"none")}var pt=null;function $e(){return pt}async function mt(e){return pt=await S(`/api/population?radius=${e}`),pt}function Cn(e,t,n,a,o,s,i){let r={lost:0,gained:0,kept:0,none:0};for(let u of e){let d=i.lat0+(u[1]+.5)*i.dlat,p=i.lon0+(u[0]+.5)*i.dlon;d<a||d>s||p<n||p>o||(r.lost+=u[Qt(t)],r.gained+=u[Zt(t)],r.kept+=u[en(t)],r.none+=u[tn(t)])}return r}var yt="corridor",En="corridor-lines",Pe="#8b929c",_o="#6f7783",_e={lost:T,added:C,kept:Pe};var xe=null,Mn=!1;function Oe(){return xe}function ht(){return Mn}function Po(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Nn(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Oo(){let e=t=>["match",["get","klass"],"lost",_e.lost,"added",_e.added,t];return["interpolate",["linear"],["zoom"],9,e(_o),14,e(Pe)]}function Ro(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Do(){return["match",["get","klass"],"kept",.85,.9]}function An(e,t){e.addSource(yt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:En,type:"line",source:yt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Oo(),"line-width":Ro(),"line-opacity":Do()}},t)}async function gt(e,t){return xe=await S(`/api/corridors?day=${t}`),e.getSource(yt).setData(Po(xe)),xe}async function Fn(e,t){x.includes(t)&&await gt(e,t)}function Hn(e,t){Mn=t,e.setLayoutProperty(En,"visibility",t?"visible":"none")}var bt="#2b3038",Bn="#b9bec6",se={loses:{color:T,size:6},gains:{color:C,size:6},keeps:{color:Pe,size:3},here:{color:bt,size:3.5},none:{color:Bn,size:1.8}},De=["loses","gains","keeps","none","here"],ft="oneseat",jn="oneseat-dots",Re=null,Un=!1;function K(){return Re}function wt(){return Un}function Jn(e,t,n,a,o,s){let i={};for(let r of t)i[r]=0;for(let r of e){let u=r[0],d=r[1];if(u<a||u>s||d<n||d>o)continue;let p=t[r[3]];p!==void 0&&i[p]++}return i}function To(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Co(){return["match",["get","status"],...Object.entries(se).flatMap(([e,t])=>[e,t.color]),Bn]}function Eo(){let e=["match",["get","status"],...Object.entries(se).flatMap(([t,n])=>[t,n.size]),se.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function In(e,t){e.addSource(ft,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:jn,type:"circle",source:ft,layout:{visibility:"none"},paint:{"circle-color":Co(),"circle-radius":Eo(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Mo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var No="pin";function zn(e){return"key"in e?e.key:No}var Te="any";function Ao(e,t,n){return`radius=${e}&${Mo(t)}&day=${n}`}function Gn(e,t){return e?t:Te}function Kn(e,t){return e==="places"?!1:e!=="oneseat"||t}async function vt(e,t,n,a=Te){return Re=await S(`/api/oneseat?${Ao(t,n,a)}`),e.getSource(ft).setData(To(Re)),Re}function Yn(e,t){Un=t,e.setLayoutProperty(jn,"visibility",t?"visible":"none")}function St(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Vn(e,t){let n=t.statuses.find(r=>r.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),s=r=>r.length?r.join(", "):"none",i=St(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${i}<br>today: ${s(a)}<br>proposed: ${s(o)}`}var Lt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Fo(e){return e.buckets.filter(t=>t.key!=="none")}var Wn={area:"Ground",people:"People"};function Ho(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=On(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),s=i=>i.toFixed(i<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(o.less)}</b> km\xB2 less</span>
        <span><b>${s(o.more)}</b> km\xB2 more</span>
        <span><b>${s(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Bo(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=Cn(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=i=>Math.round(i).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(o.lost)}</b> people lose all service</span>
        <span><b>${s(o.gained)}</b> gain service</span>
        <span><b>${s(o.kept)}</b> keep a bus</span>
        <span><b>${s(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}function jo(e){let{layer:t,day:n,bounds:a,unit:o,population:s}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${lt.map(([r,u])=>`${u} ${((r+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service</span>
        <span><i style="background:${C}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Wn).map(r=>`
          <button data-surface-unit="${r}" aria-pressed="${o===r}"
                  class="${o===r?"active":""}">${Wn[r]}</button>`).join("")}
      </div>
      ${o==="people"?Bo(n,a,s):Ho(t,n,a)}
    </div>`}var Uo=["lost","added","kept"],Jo={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Io={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Xn(e,t){let{lostPct:n,addedPct:a}=Nn(t.km),o=r=>r.toFixed(1),i=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${i}</b> km of street, citywide \u2014 ${Io[t.day]}
    </div>
    ${Uo.map(r=>`
      <div class="lg-row lg-static">
        <i style="background:${_e[r]}"></i>
        <span class="lg-lab">${m(Jo[r])}</span>
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
      what you can still reach on foot.</div>`}function Qn(e,t,n){let a=t.statuses.map(p=>p.key),o=Jn(t.points,a,n.west,n.south,n.east,n.north),s=p=>t.statuses.find(f=>f.key===p)?.label??p,i=De.reduce((p,f)=>p+(o[f]??0),0),r=St(t),u=t.day&&t.day!==Te,d=u?`Restricted to routes running on ${Lt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${m(r)}</b>
      <span class="muted">\xB7 ${i.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${Lt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${De.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${se[p].color}"></i>
        <span class="lg-lab">${m(s(p))}</span>
        <span class="lg-n">${(o[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${De.map(p=>`${(t.counts[p]??0).toLocaleString()} ${m(s(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${m(r)} without transferring?
      ${d} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Zn(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var qn={locations:"Locations",riders:"Riders"};function zo(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function ea(e,t){let{layer:n,day:a,bounds:o,weight:s,surface:i,unit:r="area",population:u}=t,d=n.buckets.map(w=>w.key),p=n.days.indexOf(a),{west:f,south:P,east:R,north:D}=o,y=Fo(n),ee=hn(n.points,p,d,f,P,R,D),_=s==="riders"?fn(n.points,p,d,f,P,R,D):null,te=w=>_?_.measured[w]?Math.round(_.riders[w]).toLocaleString():"\u2014":ee[w].toLocaleString(),eo=_?`<b>${Math.round(y.reduce((w,ze)=>w+_.riders[ze.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${y.reduce((w,ze)=>w+ee[ze.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${eo}
      <span class="muted">\xB7 ${Lt[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(qn).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${qn[w]}</button>`).join("")}
    </div>
    ${y.map(w=>`
      <button class="lg-row ${at(w.key)?"off":""}" data-bucket="${m(w.key)}"
              aria-pressed="${!at(w.key)}">
        <i style="background:${we[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${m(w.label)}</span>
        <span class="lg-n">${te(w.key)}</span>
      </button>`).join("")}
    ${i?jo({layer:i,day:a,bounds:o,unit:r,population:u}):""}
    ${_?zo(_.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var kt="#4aa3ff",ia="#ffa23a",$t="headline",Ce="journey",la="journey-rides",ca="journey-walks",Go=[la,ca],ua=null,da=!1;function Me(){return ua}function xt(){return da}function Ko(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let s=n[o].itinerary;if(s)for(let i of s.legs){let r=i.from??e.origin,u=i.to??e.destination,d=[[r.lon,r.lat],[u.lon,u.lat]],p=i.path?.length?i.path:d;a.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:o,kind:i.kind,route:i.route}})}}return{type:"FeatureCollection",features:a}}function ta(){return["match",["get","side"],"current",kt,"proposed",ia,kt]}function na(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function pa(e,t){e.addSource(Ce,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:la,type:"line",source:Ce,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":ta(),"line-width":na(1),"line-opacity":.85}},t),e.addLayer({id:ca,type:"line",source:Ce,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":ta(),"line-width":na(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function ma(e,t){da=t;for(let n of Go)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function _t(e,t){ua=t;let n=t?Ko(t,$t):{type:"FeatureCollection",features:[]};e.getSource(Ce).setData(n)}function ya(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var aa=e=>`${e.toFixed(1)} min`;function ha(e){return e==null?"\u2014":e===0?"no change":e>0?`${aa(e)} slower`:`${aa(-e)} faster`}function oa(e,t){return e?e.name?m(e.name):`stop ${m(e.stop_id)}`:t}function Yo(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=oa(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${m(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${oa(e.to,"the destination")}</span></div>`}function sa(e,t){let n=[],a=null;for(let o of e.legs){let s=a?Math.round(o.depart-a.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Yo(o,t)),a=o}return n.join("")}var Vo={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Ee(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Wo(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function qo(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Ee(t.current)} \u2192
        ${Ee(t.proposed)} min</span>
        <span class="muted">${ha(t.change_min)}</span></div>
      ${a}
    </div>`}function ra(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Pt(e,t){let n=e.radii[$t],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
    <div class="place-head">
      <h2>Travel time to ${m(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${J(e.window.start_min)}
        and ${J(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${o}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${Vo[n.classification]??""}</p>
      </div>
      ${ra(e)}`:`${o}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Ee(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Ee(n.proposed)}</div>
      </div>
      <div class="hl-delta ${a}">${ha(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Wo(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?sa(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?sa(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${qo(e)}
    ${ra(e)}`}function ga(e){return`
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
    </div>`}function fa(e){let t=e?e.radii[$t].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${kt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${ia}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Ot="places",wa="places-points",Rt="places-boundaries",Y="places-fill",Xo="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing every bus on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",B={lost:T,gained:C},Ne=null,H=null,re=null,va=!1;function Dt(){return Ne}function Sa(){return H}function La(){return re}function Tt(){return va}function Qo(e,t){let n=[...e];return t==="count"?n.sort((a,o)=>o.residents_lost-a.residents_lost):n.sort((a,o)=>(o.share_lost??-1)-(a.share_lost??-1))}function Zo(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function es(e){return Math.max(e.residents_lost,e.residents_gained)}var ba=4,ts=16,ns=1e3;function as(e){let t=Math.min(1,Math.sqrt(e/ns));return ba+t*(ts-ba)}function os(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:Zo(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:as(es(t))}}))}}function ss(){return["match",["get","klass"],"lost",B.lost,"gained",B.gained,B.lost]}function rs(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var E=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];function is(){return["step",["coalesce",["get","share_lost"],0],E[0].opacity,Number.EPSILON,E[1].opacity,E[1].max,E[2].opacity,E[2].max,E[3].opacity,E[3].max,E[4].opacity]}function ka(e,t){e.addSource(Rt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Y,type:"fill",source:Rt,layout:{visibility:"none"},paint:{"fill-color":B.lost,"fill-opacity":is(),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Ot,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:wa,type:"circle",source:Ot,layout:{visibility:"none"},paint:{"circle-color":ss(),"circle-radius":rs(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}async function $a(){return Ne||(Ne=await S("/api/places")),Ne}async function xa(e){return re||(re=await S("/api/boundaries"),e.getSource(Rt).setData(re)),re}async function _a(e,t){try{H=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return H=null,null}return e.getSource(Ot).setData(os(H)),e.flyTo({center:[H.lon,H.lat],zoom:13}),H}function Pa(e,t){va=t,e.setLayoutProperty(wa,"visibility",t?"visible":"none"),e.setLayoutProperty(Y,"visibility",t?"visible":"none")}function ls(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${m(e.key)}">
      <span class="place-name">${m(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}function Oa(e,t,n){let a=Qo(e,t).map(o=>ls(o,o.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${Xo}</p>
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function Ra(e){let t=e?`<div class="lg-head"><b>${m(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:'<div class="lg-head">Click a place to see its changed block groups</div>',n=E.filter(a=>a.opacity>0).map(a=>`
    <div class="lg-row lg-static">
      <i style="background:${B.lost};opacity:${a.opacity};border-radius:2px"></i>
      <span class="lg-lab">${m(a.label)} of the place's own residents</span>
    </div>`).join("");return`
    ${t}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who lose every bus</div>
    ${n}
    <div class="lg-row lg-static"><i style="background:${B.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${B.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost \u2014 a raw count would just draw where people live. Click a place to
      select it. Points are the changed census block groups inside it; size is
      the larger of a block group's losses or gains.</div>`}var Ct=" \xB7 ",Et={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},Da=Object.keys(Et);function Ta(e){return Et[e]??e}var cs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},us=["oneseat","journey"];function ds(e){return e!=="journey"}function ps(e){let t=[Et[e.view]??e.view];return e.view==="places"?t[0]:(us.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":cs[e.day]),ds(e.view)&&t.push(`${e.radius} m walk`),t.join(Ct))}function Ca(e){let[t,...n]=ps(e).split(Ct);return`<b>${m(t)}</b>${n.map(a=>Ct+m(a)).join("")}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place"},Ae={any:"any",selected:"selected"},ms="pin",Ea=5;function Na(e){try{return e.self!==e.top}catch{return!0}}function Aa(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?Ae.selected:Ae.any),t.set(b.dest,"key"in e.dest?e.dest.key:Mt(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.at&&t.set(b.at,Mt(e.at)),e.camera&&t.set(b.camera,`${Mt(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(b.place,e.place),`?${t}`}function Fa(e){let t=new URLSearchParams(e),n={},a=t.get(b.view);a&&Da.includes(a)&&(n.view=a);let o=t.get(b.day);o&&x.includes(o)&&(n.day=o);let s=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let i=t.get(b.oneSeatDay);i===Ae.selected?n.oneSeatRestricted=!0:i===Ae.any&&(n.oneSeatRestricted=!1);let r=t.get(b.dest);if(r&&r!==ms){let f=Ma(r);f?n.dest=f:r.includes(",")||(n.dest={key:r})}let u=Ma(t.get(b.at));u&&(n.at=u);let d=ys(t.get(b.camera));d&&(n.camera=d);let p=t.get(b.place);return p&&(n.place=p),n}function Mt(e){return`${e.lat.toFixed(Ea)},${e.lon.toFixed(Ea)}`}function Ma(e){let t=Ha(e,2);return t?{lat:t[0],lon:t[1]}:null}function ys(e){let t=Ha(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ha(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var Nt="embed";var hs=["1","true","yes"];function Ba(e){let t=new URLSearchParams(e).get(Nt);return t!==null&&hs.includes(t.toLowerCase())}function ja(e){let t=new URLSearchParams(e);return t.set(Nt,"1"),`?${t}`}function Ua(e){let t=new URLSearchParams(e);t.delete(Nt);let n=String(t);return n?`?${n}`:""}function Ja(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var N=["peek","half","full"],gs=192,fs=.3,bs=.55,ws=.9,vs=.6,Ss=.45;function Fe(e,t){return e==="peek"?Math.min(gs,t*fs):e==="half"?t*bs:t*ws}function Ls(e,t,n=0){let a=N.map(s=>Math.abs(Fe(s,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>vs&&(o=Math.max(0,Math.min(N.length-1,o+(n>0?1:-1)))),N[o]}function Ia(e){return N[(N.indexOf(e)+1)%N.length]}function ks(e,t){return Math.min(e,t*Ss)}function V(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function At(e){let t=null,n=()=>{let a=V();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var $s=8,xs=400;function za(e){let t=l("side"),n=l("sheet-handle"),a="peek",o=!1,s=0,i=0,r=0,u={y:0,t:0};function d(){return window.innerHeight}function p(y){t.style.height=`${y}px`,e.onMove(y,ks(y,d()))}function f(y){a=y,t.dataset.snap=y,p(Fe(y,d()))}n.addEventListener("pointerdown",y=>{V()&&(o=!0,s=y.clientY,i=t.getBoundingClientRect().height,r=y.timeStamp,u={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!o)return;let ee=i+(s-y.clientY),_=Fe("peek",d()),te=Fe("full",d());p(Math.max(_,Math.min(te,ee))),u={y:y.clientY,t:y.timeStamp}});function P(y){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-s)>$s)&&y.timeStamp-r<xs){f(Ia(a));return}let _=y.timeStamp-u.t,te=_>0?(u.y-y.clientY)/_:0;f(Ls(t.getBoundingClientRect().height,d(),te))}n.addEventListener("pointerup",P),n.addEventListener("pointercancel",P),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),V()&&f(Ia(a)))});let R=At(e.onLayoutChange);function D(){if(R(),!V()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}f(a)}return window.addEventListener("resize",D),D(),{at:()=>V()?a:"full",atLeast(y){V()&&N.indexOf(y)>N.indexOf(a)&&f(y)}}}var _s=[-79.9959,40.4406],Ps=12,Os="#e2574c",O={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},ce=Fa(location.search),de=Ba(location.search);de&&l("app").classList.add("embed");var Rs={at:()=>"full",atLeast(){}},Ka=null,$=400,ie=null,g=null,q=null,U=0,L={key:"downtown"},j=null,Ya=!1,Q=!1,Ue="locations",Z="area",Va="count",Ht=null,h="dots",Wa,Bt=[],c=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ce.camera?[ce.camera.lon,ce.camera.lat]:_s,zoom:ce.camera?.zoom??Ps,cooperativeGestures:Na(window),attributionControl:{compact:!0}});c.addControl(new maplibregl.NavigationControl,"top-right");c.on("load",()=>{Kt(c),wn(c),Dn(c,"change-dots"),An(c,"change-dots"),In(c,"walk-fill"),pa(c),ka(c,"change-dots"),M(),c.on("click",t=>{if(Ya){ue({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(h==="places"){let s=c.queryRenderedFeatures(t.point,{layers:[Y]})[0];s&&He(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>c.getLayoutProperty(s,"visibility")!=="none"),a=c.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];It(o[1],o[0])}),c.on("mouseenter",Y,()=>{c.getCanvas().style.cursor="pointer"}),c.on("mouseleave",Y,()=>{c.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});c.on("mouseenter","change-dots",()=>{c.getCanvas().style.cursor="pointer"}),c.on("mouseleave","change-dots",()=>{c.getCanvas().style.cursor="",e.remove()}),c.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=nt();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Ln(n.properties,k(),a.buckets)).addTo(c)}),c.on("mouseenter","oneseat-dots",()=>{c.getCanvas().style.cursor="pointer"}),c.on("mouseleave","oneseat-dots",()=>{c.getCanvas().style.cursor="",e.remove()}),c.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=K();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Vn(n.properties,a)).addTo(c)}),c.on("moveend",()=>{let t=c.getCenter();Ka={lat:t.lat,lon:t.lng,zoom:c.getZoom()},v(),A()}),le(O.radius,t=>{$=Number(t.dataset.radius),ot(c,$,k()).then(v),ke()&&ut(c,$,k()).then(v),$e()&&mt($).then(v),K()&&Be(),g&&X(g.lat,g.lon)}),le(O.day,t=>{let n=t.dataset.day;ln(n),h!=="journey"&&M(),st(c,n),dt(c,n),h==="journey"&&g&&jt(g.lat,g.lon),Oe()&&Fn(c,n).then(v),Q&&K()&&(Be(),g&&X(g.lat,g.lon)),v()}),le(O.oneSeatDay,t=>{Q=t.dataset.oneseatDay==="selected",Ga(),Be(),g&&X(g.lat,g.lon)}),le(O.view,t=>{let n=h;h=t.dataset.view,c.setLayoutProperty("change-dots","visibility",h==="dots"||h==="both"?"visible":"none"),Ns(h==="surface"||h==="both"),Fs(h==="corridors"),Us(h==="oneseat"),js(h==="journey",n==="journey"),Hs(h==="places"),h!=="journey"&&n!=="journey"&&(h==="oneseat"||n==="oneseat")&&M({scrollToTop:!0}),Bs(h!=="corridors"&&h!=="journey"&&h!=="places");let a=h==="oneseat"||h==="journey";l("dest-controls").classList.toggle("hidden",!a),l("oneseat-day-controls").classList.toggle("hidden",h!=="oneseat"),Ga(),a||je(!1),Xa()}),le(O.dest,t=>{let n=t.dataset.dest;if(n==="pin"){je(!0);return}je(!1),ue({key:n})}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Ue=n.dataset.weight,v(),A();return}let a=t.target.closest("[data-surface-unit]");if(a){Z=a.dataset.surfaceUnit,As(Z),A();return}let o=t.target.closest("[data-bucket]");o&&(vn(c,o.dataset.bucket,k()),v())}),l("legend-reset").addEventListener("click",()=>{Sn(c,k()),v()}),l("legend-collapse").addEventListener("click",()=>{Ft(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&ue({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&Ks(a.dataset.caveat);let o=t.target.closest("[data-select-place]");o&&He(o.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(Va=s.dataset.sortPlaces,M());let i=t.target.closest("[data-goto-place]");i&&(h!=="places"&&W(O.view,"places"),He(i.dataset.gotoPlace))}),l("side-toggle").addEventListener("click",Es),de&&At(Ft),Wa=de?Rs:za({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),c.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Ft}),Ts(),Ie(),Je(),Ds(ce)||ot(c,$,k()).then(v),Gs(),zs()});function le(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),Ie(),A()})})}function W(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Ds(e){let t=!1;return e.radius!==void 0&&(t=W(O.radius,String(e.radius))||t),e.day&&(t=W(O.day,e.day)||t),e.oneSeatRestricted!==void 0&&W(O.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Ue=e.weight),e.surfaceUnit&&(Z=e.surfaceUnit),e.dest&&("key"in e.dest?W(O.dest,e.dest.key):ue(e.dest)),e.view&&W(O.view,e.view),e.at&&It(e.at.lat,e.at.lon),e.place&&He(e.place),t}function A(){let e={view:h,day:k(),radius:$,oneSeatRestricted:Q,weight:Ue,surfaceUnit:Z,dest:L,at:g,camera:Ka,place:Ht},t=Aa(e);history.replaceState(null,"",(de?ja(t):t)+location.hash),Je(t)}function Je(e=Ua(location.search)){if(!de)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=g?q?ae(q):"this point":null;t.querySelector(".el-action").textContent=Ja(n)}function Ie(){l("statebar").innerHTML=Ca({view:h,day:k(),radius:$,oneSeatRestricted:Q,destination:pe()}),Cs()}function Ft(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Ts(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Cs(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(Ta(h)))}function Es(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),c.resize()}function v(){Ms()}function Ms(){if(l("legend-reset").classList.toggle("hidden",ht()||wt()||xt()||Tt()),xt()){l("legend").innerHTML=fa(Me());return}if(Tt()){l("legend").innerHTML=Ra(Sa());return}if(ht()){let n=Oe();n&&Xn(l("legend"),n);return}if(wt()){let n=K();if(!n)return;let a=c.getBounds();Qn(l("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=nt();if(!e)return;let t=c.getBounds();ea(l("legend"),{layer:e,day:k(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Ue,surface:ct()?ke():null,unit:Z,population:$e()})}async function Ns(e){if(e&&!ke()){l("legend").classList.add("loading");try{await ut(c,$,k())}finally{l("legend").classList.remove("loading")}}Tn(c,e),e&&Z==="people"&&await qa(),v()}async function qa(){if(!$e()){l("legend").classList.add("loading");try{await mt($)}finally{l("legend").classList.remove("loading")}}}async function As(e){e==="people"&&ct()&&await qa(),v()}async function Fs(e){if(e&&!Oe()){l("legend").classList.add("loading");try{await gt(c,k())}finally{l("legend").classList.remove("loading")}}Hn(c,e),v()}async function Hs(e){if(e&&(!Dt()||!La())){l("legend").classList.add("loading");try{await Promise.all([$a(),xa(c)])}finally{l("legend").classList.remove("loading")}}Pa(c,e),e&&M(),v()}async function He(e){Ht=e,await Jt(()=>_a(c,e)),h==="places"&&(M(),document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),v(),A()}function Bs(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function M({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),Je(),h==="places"){l("panel").innerHTML=Oa(Dt()??[],Va,Ht);return}if(!q){h==="oneseat"?l("panel").innerHTML=yn(pe()):cn(l("panel"));return}if(h==="oneseat"){let t=mn(q,L,k());if(t){l("panel").innerHTML=t;return}}pn(q)}function js(e,t=!1){if(ma(c,e),v(),!e){t&&(g?X(g.lat,g.lon):M());return}Me()&&g?l("panel").innerHTML=Pt(Me(),pe()):l("panel").innerHTML=ga(pe())}async function jt(e,t){let n=++U;g={lat:e,lon:t},A(),Za(e,t);let a=Qa(),o=m(pe());if(!a){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(ya({lat:e,lon:t},a,k()));if(n!==U)return;_t(c,s),l("panel").innerHTML=Pt(s,o),v(),Je()}catch(s){if(n!==U)return;_t(c,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function Ga(){l("day-controls").classList.toggle("hidden",!Kn(h,Q))}function Ut(){return Gn(Q,k())}async function Us(e){e&&!K()&&await Jt(()=>vt(c,$,L,Ut())),Yn(c,e),v()}async function Be(){await Jt(()=>vt(c,$,L,Ut())),v()}async function Jt(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function ue(e){if(L=e,je(!1),Js(),Xa(),Ie(),A(),h==="journey"){g&&jt(g.lat,g.lon),v();return}g?X(g.lat,g.lon):M({scrollToTop:!0}),Be()}function Xa(){let e=Qa();if(!(e!==null&&(h==="journey"||h==="oneseat"&&"lat"in L))){j?.remove(),j=null;return}j?j.setLngLat([e.lon,e.lat]).addTo(c):(j=new maplibregl.Marker({color:bt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(c),j.on("dragend",()=>{let n=j.getLngLat();ue({lat:n.lat,lon:n.lng})}))}function Js(){let e=zn(L);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Qa(){if("lat"in L)return{lat:L.lat,lon:L.lon};let e=L.key,t=Bt.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function pe(){if("lat"in L)return`${L.lat.toFixed(4)}, ${L.lon.toFixed(4)}`;let e=L.key;return Bt.find(t=>t.key===e)?.name??e}function je(e){Ya=e,c.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function X(e,t){let n=++U;g={lat:e,lon:t},A(),l("panel").classList.add("loading"),Za(e,t);try{let a="lat"in L?`&dest_lat=${L.lat.toFixed(6)}&dest_lon=${L.lon.toFixed(6)}`:"",o=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${$}${a}&oneseat_day=${Ut()}`);if(n!==U)return;Yt(c,e,t,$,o.current.stops,o.proposed.stops),Is(),q=o,M({scrollToTop:!0})}catch(a){if(n!==U)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===U&&l("panel").classList.remove("loading")}}function Is(){l("pin-key").innerHTML=Zn($),l("pin-key").classList.remove("hidden")}function Za(e,t){ie?ie.setLngLat([t,e]):(ie=new maplibregl.Marker({color:Os,draggable:!0}).setLngLat([t,e]).addTo(c),ie.on("dragend",()=>{let n=ie.getLngLat();It(n.lat,n.lng)}))}function It(e,t){if(Wa.atLeast("half"),h==="journey"){jt(e,t);return}h!=="places"&&X(e,t)}async function zs(){try{Bt=await S("/api/destinations"),Ie()}catch{}}async function Gs(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function Ks(e){l("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
