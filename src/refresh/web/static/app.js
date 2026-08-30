"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function L(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function h(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function H(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function He(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function je(e){return e>0?`+${e}`:String(e)}function Tt(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var To="#4aa3ff",Co="#ffa23a";function Eo(e,t,n,o=96){let a=[],r=n/111320,i=n/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=o;s++){let c=s/o*2*Math.PI;a.push([t+i*Math.cos(c),e+r*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function j(e){return{type:"FeatureCollection",features:e}}function Ct(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Et(e){e.addSource("walk",{type:"geojson",data:j([])}),e.addSource("stops-now",{type:"geojson",data:j([])}),e.addSource("stops-prop",{type:"geojson",data:j([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Co,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":To,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let r=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${r.name}</b><br>${r.side==="current"?"today":"proposed"}
                  \xB7 stop ${r.stop_id} \xB7 ${r.metres} m`).addTo(e)})}function Mt(e,t,n,o,a,r){e.getSource("walk").setData(j([Eo(t,n,o)])),e.getSource("stops-now").setData(j(Ct(a,"current"))),e.getSource("stops-prop").setData(j(Ct(r,"proposed")))}var x=["weekday","saturday","sunday"],Be=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Nt={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},le=4,At=e=>3+le*e,Ft=e=>4+le*e,X=e=>5+le*e,Mo=e=>6+le*e;var C=(e,t)=>e[t],Ht=(e,t)=>e[Mo(t)],Ue=e=>2+2*e,Je=e=>3+2*e,ce=4,jt=e=>2+ce*e,Bt=e=>3+ce*e,Ut=e=>4+ce*e,Jt=e=>5+ce*e;var ze="weekday";function k(){return ze}function Vt(e){ze=e}function Gt(e){e.innerHTML=`
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
    </div>`}function No(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Ao(e,t){let n=Math.max(1,...Be.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Be.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,i=r-a,s=i>0?"up":i<0?"down":"flat";return`
      <tr>
        <th>${Nt[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${s}">${i===0?"\xB7":je(i)}</td>
      </tr>`}).join("")}function qt(e){return e.length?e.map(t=>`<span class="route">${h(t)}</span>`).join(" "):'<span class="muted">none</span>'}function It(e){return e.first==null?'<span class="muted">no service</span>':`${H(e.first)}\u2013${H(e.last)}`}function zt(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Fo={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Ho={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function jo(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':pe(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${h(o.name)}</span>
          <span class="os-status ${h(o.status)}">${Fo[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Ho[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${de("one-seat")}</p>
    </div>`:""}function de(e){return` <button class="howto" data-caveat="${e}">method</button>`}function ue(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function Kt(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Wt(e){return e.first==null||e.last==null?null:e.last-e.first}function pe(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Yt(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Yt(t,n,"prop")}</div>
    </div>`}function Yt(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${h(o)}</span>`).join(" "):'<span class="muted">none</span>'}var Ie=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,Bo="Allegheny";function Q(e){let t=e.place?.muni?.trim()??"",n=Ie.exec(t)?.[1],o=n===Bo?t.replace(Ie,""):n?`${t.replace(Ie,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Ke(e){return e==="weekday"?"weekday":e}function Xt(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Ke(t)}`}function Uo(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Ke(t)}, today only</span>`}${o}</dd>`}function Jo(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${de("boardings")}</p>`}function Io(e){if(!e)return"";let t=h(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose every bus
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains every bus under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in ${t}</h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${de("place-population")}</p>
    </div>`}function We(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],r=a.trips-o.trips,i=r>0?"up":r<0?"down":"flat",s=zt(o),c=zt(a),d=Wt(o),p=Wt(a);return`
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
      <div class="hl-delta ${i}">
        ${r===0?"no change":`${je(r)} trips`}
        <div class="muted">${Tt(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Ke(t)}, both directions</div>

    <div class="tiers">${No(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Ao(o,a)}</tbody>
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
      ${ue(It(o),It(a))}
      <dt>Hours between</dt>
      ${ue(He(d),He(p),Kt(d,p,"more"))}
      <dt>Typical wait</dt>
      ${ue(s==null?"\u2014":`${s} min`,c==null?"\u2014":`${c} min`,Kt(s,c,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${ue(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${Uo(o.boardings,t)}
    </dl>
    ${Jo(o.boardings)}

    ${n}

    ${Io(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${pe(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${de("location-not-route")}</p>
    </div>`}function Qt(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${h(Q(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${We(e,ze,jo(e.oneseat??[],e.oneseat_day??"any"))}`}var zo={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Ko={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Wo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Yo(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Ye(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${qt(t)}</div>`:""}function Vo(e){let t=Ye("kept",e.kept)+Ye("lost",e.lost)+Ye("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Go(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${pe(e.current,e.proposed)}
    </div>`}function qo(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${h(a.key)}">
      <span class="os-name">${h(a.name)}</span>
      <span class="os-status ${h(a.status)}">${Xo[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Xo={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Qo(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Wo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Zt(e,t,n){let o=Yo(e,t);if(!o)return"";let a=e.oneseat_day??"any",r=o.status==="here"?"":Vo(o)+Go(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${h(o.name)}</h2>
      <div class="muted">
        from ${h(Q(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${h(o.status)}">${zo[o.status]}</div>
    <p class="note">${Ko[o.status]} ${Qo(a)}</p>

    ${r}

    ${qo(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${Xt(e,n)}</summary>
      ${We(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function en(e){return`
    <div class="empty">
      <h2>Who keeps a one-seat ride?</h2>
      <p>The map is coloured by whether each place can still reach
         <b>${h(e)}</b> without changing bus \u2014 red loses it, blue
         gains it. Click anywhere for the routes behind that verdict.</p>
      <p>Drag the dark marker, or pick a point, to ask about somewhere else;
         the whole map recolours to the destination you choose.</p>
      <p class="muted">A route serves a place or it does not, so by default no
         day type enters this \u2014 which also means a surviving ride may run
         hourly, or only on weekdays. It is the only view here that counts the
         T and the inclines.</p>
    </div>`}var he={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Ve="change",ye="change-dots",me=null,B=new Set;function Ge(){return me}function qe(e){return B.has(e)}function tn(e,t,n,o,a,r,i){let s={};for(let c of n)s[c]=0;for(let c of e){if(!nn(c,o,a,r,i))continue;let d=n[C(c,X(t))];d!==void 0&&s[d]++}return s}function nn(e,t,n,o,a){let r=C(e,0),i=C(e,1);return r>=n&&r<=a&&i>=t&&i<=o}function on(e,t,n,o,a,r,i){let s={riders:{},measured:{},unmeasured:0};for(let c of n)s.riders[c]=0,s.measured[c]=0;for(let c of e){if(!nn(c,o,a,r,i))continue;let d=n[C(c,X(t))];if(d===void 0)continue;let p=Ht(c,t);if(p===null){d!=="none"&&s.unmeasured++;continue}s.riders[d]+=p,s.measured[d]++}return s}function Zo(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((o,a)=>t[C(n,X(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(x.flatMap((o,a)=>[[`b${a}`,t[C(n,X(a))]],[`c${a}`,n[At(a)]],[`p${a}`,n[Ft(a)]]]))}}))}}function Z(e,t){let n=Object.entries(he).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,he.none[t]]}function an(e){return["interpolate",["linear"],["zoom"],9,["*",Z(e,"size"),.45],12,Z(e,"size"),16,["*",Z(e,"size"),1.9]]}function rn(e){e.addSource(Ve,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ye,type:"circle",source:Ve,paint:{"circle-color":Z(0,"color"),"circle-radius":an(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function Xe(e,t,n){return me=await L(`/api/change?radius=${t}`),e.getSource(Ve).setData(Zo(me)),Qe(e,n),me}function Qe(e,t){let n=x.indexOf(t);e.setPaintProperty(ye,"circle-color",Z(n,"color")),e.setPaintProperty(ye,"circle-radius",an(n)),Ze(e,t)}function sn(e,t,n){B.has(t)?B.delete(t):B.add(t),Ze(e,n)}function ln(e,t){B.clear(),Ze(e,t)}function Ze(e,t){let n=x.indexOf(t),o=["none",...B];e.setFilter(ye,["!",["in",["get",`b${n}`],["literal",o]]])}function cn(e,t,n){let o=x.indexOf(t),a=e[`b${o}`],r=n.find(d=>d.key===a)?.label??a,i=e[`c${o}`],s=e[`p${o}`];return`<b>${r}</b><br>${i} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var et="surface",ge="surface-fill",un="#6b7280",tt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,un],[.138,un],[1,"#12a163"],[2,"#0b7a48"]],E="#e8232f",M="#0f79c9",dn=2,fe=null,pn=!1;function be(){return fe}function nt(){return pn}function mn(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-dn,Math.min(dn,n))}function hn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function yn(e,t,n,o,a,r,i,s){let c={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let p=i.lat0+(d[1]+.5)*i.dlat,w=i.lon0+(d[0]+.5)*i.dlon;if(p<o||p>r||w<n||w>a)continue;let R=d[Ue(t)],_=d[Je(t)],P=hn(R,_);if(P!=="none")if(P==="ramp"){let m=mn(R,_);c[m<-.138?"less":m>.138?"more":"same"]+=s}else c[P]+=s}return c}function ea(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let i=t+r[1]*o,s=i+o,c=n+r[0]*a,d=c+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,i],[d,i],[d,s],[c,s],[c,i]]]},properties:Object.fromEntries(x.flatMap((p,w)=>{let R=r[Ue(w)],_=r[Je(w)];return[[`k${w}`,hn(R,_)],[`v${w}`,mn(R,_)??0]]}))}})}}function fn(e){return["case",["==",["get",`k${e}`],"gone"],E,["==",["get",`k${e}`],"new"],M,["interpolate",["linear"],["get",`v${e}`],...tt.flatMap(([t,n])=>[t,n])]]}function U(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function gn(e,t){e.addSource(et,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ge,type:"fill",source:et,layout:{visibility:"none"},paint:{"fill-color":fn(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,U(0,.85),13,U(0,.62),16,U(0,.45)]}},t)}async function ot(e,t,n){return fe=await L(`/api/surface?radius=${t}`),e.getSource(et).setData(ea(fe)),at(e,n),fe}function at(e,t){let n=x.indexOf(t);e.setPaintProperty(ge,"fill-color",fn(n)),e.setPaintProperty(ge,"fill-opacity",["interpolate",["linear"],["zoom"],9,U(n,.85),13,U(n,.62),16,U(n,.45)])}function bn(e,t){pn=t,e.setLayoutProperty(ge,"visibility",t?"visible":"none")}var rt=null;function we(){return rt}async function st(e){return rt=await L(`/api/population?radius=${e}`),rt}function wn(e,t,n,o,a,r,i){let s={lost:0,gained:0,kept:0,none:0};for(let c of e){let d=i.lat0+(c[1]+.5)*i.dlat,p=i.lon0+(c[0]+.5)*i.dlon;d<o||d>r||p<n||p>a||(s.lost+=c[jt(t)],s.gained+=c[Bt(t)],s.kept+=c[Ut(t)],s.none+=c[Jt(t)])}return s}var it="corridor",vn="corridor-lines",Le="#8b929c",ta="#6f7783",Se={lost:E,added:M,kept:Le};var ve=null,Sn=!1;function ke(){return ve}function lt(){return Sn}function na(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function Ln(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function oa(){let e=t=>["match",["get","klass"],"lost",Se.lost,"added",Se.added,t];return["interpolate",["linear"],["zoom"],9,e(ta),14,e(Le)]}function aa(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function ra(){return["match",["get","klass"],"kept",.85,.9]}function kn(e,t){e.addSource(it,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vn,type:"line",source:it,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":oa(),"line-width":aa(),"line-opacity":ra()}},t)}async function ct(e,t){return ve=await L(`/api/corridors?day=${t}`),e.getSource(it).setData(na(ve)),ve}async function $n(e,t){x.includes(t)&&await ct(e,t)}function xn(e,t){Sn=t,e.setLayoutProperty(vn,"visibility",t?"visible":"none")}var dt="#2b3038",On="#b9bec6",ee={loses:{color:E,size:6},gains:{color:M,size:6},keeps:{color:Le,size:3},here:{color:dt,size:3.5},none:{color:On,size:1.8}},xe=["loses","gains","keeps","none","here"],ut="oneseat",Rn="oneseat-dots",$e=null,_n=!1;function J(){return $e}function pt(){return _n}function Dn(e,t,n,o,a,r){let i={};for(let s of t)i[s]=0;for(let s of e){let c=s[0],d=s[1];if(c<o||c>r||d<n||d>a)continue;let p=t[s[3]];p!==void 0&&i[p]++}return i}function sa(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function ia(){return["match",["get","status"],...Object.entries(ee).flatMap(([e,t])=>[e,t.color]),On]}function la(){let e=["match",["get","status"],...Object.entries(ee).flatMap(([t,n])=>[t,n.size]),ee.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Pn(e,t){e.addSource(ut,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Rn,type:"circle",source:ut,layout:{visibility:"none"},paint:{"circle-color":ia(),"circle-radius":la(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function ca(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var ua="pin";function Tn(e){return"key"in e?e.key:ua}var Oe="any";function da(e,t,n){return`radius=${e}&${ca(t)}&day=${n}`}function Cn(e,t){return e?t:Oe}function En(e,t){return e!=="oneseat"||t}async function mt(e,t,n,o=Oe){return $e=await L(`/api/oneseat?${da(t,n,o)}`),e.getSource(ut).setData(sa($e)),$e}function Mn(e,t){_n=t,e.setLayoutProperty(Rn,"visibility",t?"visible":"none")}function ht(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Nn(e,t){let n=t.statuses.find(s=>s.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=s=>s.length?s.join(", "):"none",i=ht(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${i}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var yt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function pa(e){return e.buckets.filter(t=>t.key!=="none")}var An={area:"Ground",people:"People"};function ma(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=yn(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=i=>i.toFixed(i<10?1:0);return`
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function ha(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=wn(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),r=i=>Math.round(i).toLocaleString();return`
      <div class="lg-area">
        <span><b>${r(a.lost)}</b> people lose all service</span>
        <span><b>${r(a.gained)}</b> gain service</span>
        <span><b>${r(a.kept)}</b> keep a bus</span>
        <span><b>${r(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}function ya(e){let{layer:t,day:n,bounds:o,unit:a,population:r}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${tt.map(([s,c])=>`${c} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${E}"></i>loses all service</span>
        <span><i style="background:${M}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(An).map(s=>`
          <button data-surface-unit="${s}" aria-pressed="${a===s}"
                  class="${a===s?"active":""}">${An[s]}</button>`).join("")}
      </div>
      ${a==="people"?ha(n,o,r):ma(t,n,o)}
    </div>`}var fa=["lost","added","kept"],ga={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},ba={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Hn(e,t){let{lostPct:n,addedPct:o}=Ln(t.km),a=s=>s.toFixed(1),i=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${i}</b> km of street, citywide \u2014 ${ba[t.day]}
    </div>
    ${fa.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${Se[s]}"></i>
        <span class="lg-lab">${h(ga[s])}</span>
        <span class="lg-n">${a(t.km[s])} km</span>
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
      what you can still reach on foot.</div>`}function jn(e,t,n){let o=t.statuses.map(p=>p.key),a=Dn(t.points,o,n.west,n.south,n.east,n.north),r=p=>t.statuses.find(w=>w.key===p)?.label??p,i=xe.reduce((p,w)=>p+(a[w]??0),0),s=ht(t),c=t.day&&t.day!==Oe,d=c?`Restricted to routes running on ${yt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${h(s)}</b>
      <span class="muted">\xB7 ${i.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${c?` \xB7 ${yt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${xe.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${ee[p].color}"></i>
        <span class="lg-lab">${h(r(p))}</span>
        <span class="lg-n">${(a[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${xe.map(p=>`${(t.counts[p]??0).toLocaleString()} ${h(r(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${h(s)} without transferring?
      ${d} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Bn(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Fn={locations:"Locations",riders:"Riders"};function wa(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function Un(e,t){let{layer:n,day:o,bounds:a,weight:r,surface:i,unit:s="area",population:c}=t,d=n.buckets.map(g=>g.key),p=n.days.indexOf(o),{west:w,south:R,east:_,north:P}=a,m=pa(n),G=tn(n.points,p,d,w,R,_,P),O=r==="riders"?on(n.points,p,d,w,R,_,P):null,q=g=>O?O.measured[g]?Math.round(O.riders[g]).toLocaleString():"\u2014":G[g].toLocaleString(),Po=O?`<b>${Math.round(m.reduce((g,Fe)=>g+O.riders[Fe.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${m.reduce((g,Fe)=>g+G[Fe.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${Po}
      <span class="muted">\xB7 ${yt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Fn).map(g=>`
        <button data-weight="${g}" aria-pressed="${r===g}"
                class="${r===g?"active":""}">${Fn[g]}</button>`).join("")}
    </div>
    ${m.map(g=>`
      <button class="lg-row ${qe(g.key)?"off":""}" data-bucket="${h(g.key)}"
              aria-pressed="${!qe(g.key)}">
        <i style="background:${he[g.key]?.color??"#666"}"></i>
        <span class="lg-lab">${h(g.label)}</span>
        <span class="lg-n">${q(g.key)}</span>
      </button>`).join("")}
    ${i?ya({layer:i,day:o,bounds:a,unit:s,population:c}):""}
    ${O?wa(O.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var ft="#4aa3ff",Vn="#ffa23a",gt="headline",Re="journey",Gn="journey-rides",qn="journey-walks",va=[Gn,qn],Xn=null,Qn=!1;function De(){return Xn}function bt(){return Qn}function Sa(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let i of r.legs){let s=i.from??e.origin,c=i.to??e.destination,d=[[s.lon,s.lat],[c.lon,c.lat]],p=i.path?.length?i.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:a,kind:i.kind,route:i.route}})}}return{type:"FeatureCollection",features:o}}function Jn(){return["match",["get","side"],"current",ft,"proposed",Vn,ft]}function In(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Zn(e,t){e.addSource(Re,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Gn,type:"line",source:Re,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Jn(),"line-width":In(1),"line-opacity":.85}},t),e.addLayer({id:qn,type:"line",source:Re,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Jn(),"line-width":In(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function eo(e,t){Qn=t;for(let n of va)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function wt(e,t){Xn=t;let n=t?Sa(t,gt):{type:"FeatureCollection",features:[]};e.getSource(Re).setData(n)}function to(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var zn=e=>`${e.toFixed(1)} min`;function no(e){return e==null?"\u2014":e===0?"no change":e>0?`${zn(e)} slower`:`${zn(-e)} faster`}function Kn(e,t){return e?e.name?h(e.name):`stop ${h(e.stop_id)}`:t}function La(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Kn(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${h(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Kn(e.to,"the destination")}</span></div>`}function Wn(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(La(a,t)),o=a}return n.join("")}var ka={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function _e(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function $a(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function xa(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${_e(t.current)} \u2192
        ${_e(t.proposed)} min</span>
        <span class="muted">${no(t.change_min)}</span></div>
      ${o}
    </div>`}function Yn(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function vt(e,t){let n=e.radii[gt],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${h(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${H(e.window.start_min)}
        and ${H(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${ka[n.classification]??""}</p>
      </div>
      ${Yn(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${_e(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${_e(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${no(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${$a(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Wn(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Wn(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${xa(e)}
    ${Yn(e)}`}function oo(e){return`
    <div class="empty">
      <h2>How long does the trip take?</h2>
      <p>Click anywhere on the map to time the trip from there to
         <b>${h(e)}</b>, on today's network and under the plan.</p>
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
    </div>`}function ao(e){let t=e?e.radii[gt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${ft}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Vn}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var St=" \xB7 ",Lt={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"},ro=Object.keys(Lt);function so(e){return Lt[e]??e}var Oa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Ra=["oneseat","journey"];function _a(e){return e!=="journey"}function Da(e){let t=[Lt[e.view]??e.view];return Ra.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Oa[e.day]),_a(e.view)&&t.push(`${e.radius} m walk`),t.join(St)}function io(e){let[t,...n]=Da(e).split(St);return`<b>${h(t)}</b>${n.map(o=>St+h(o)).join("")}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map"},Pe={any:"any",selected:"selected"},Pa="pin",lo=5;function uo(e){try{return e.self!==e.top}catch{return!0}}function po(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?Pe.selected:Pe.any),t.set(b.dest,"key"in e.dest?e.dest.key:kt(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.at&&t.set(b.at,kt(e.at)),e.camera&&t.set(b.camera,`${kt(e.camera)},${e.camera.zoom.toFixed(2)}`),`?${t}`}function mo(e){let t=new URLSearchParams(e),n={},o=t.get(b.view);o&&ro.includes(o)&&(n.view=o);let a=t.get(b.day);a&&x.includes(a)&&(n.day=a);let r=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let i=t.get(b.oneSeatDay);i===Pe.selected?n.oneSeatRestricted=!0:i===Pe.any&&(n.oneSeatRestricted=!1);let s=t.get(b.dest);if(s&&s!==Pa){let p=co(s);p?n.dest=p:s.includes(",")||(n.dest={key:s})}let c=co(t.get(b.at));c&&(n.at=c);let d=Ta(t.get(b.camera));return d&&(n.camera=d),n}function kt(e){return`${e.lat.toFixed(lo)},${e.lon.toFixed(lo)}`}function co(e){let t=ho(e,2);return t?{lat:t[0],lon:t[1]}:null}function Ta(e){let t=ho(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function ho(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var $t="embed";var Ca=["1","true","yes"];function yo(e){let t=new URLSearchParams(e).get($t);return t!==null&&Ca.includes(t.toLowerCase())}function fo(e){let t=new URLSearchParams(e);return t.set($t,"1"),`?${t}`}function go(e){let t=new URLSearchParams(e);t.delete($t);let n=String(t);return n?`?${n}`:""}function bo(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var T=["peek","half","full"],Ea=192,Ma=.3,Na=.55,Aa=.9,Fa=.6,Ha=.45;function Te(e,t){return e==="peek"?Math.min(Ea,t*Ma):e==="half"?t*Na:t*Aa}function ja(e,t,n=0){let o=T.map(r=>Math.abs(Te(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>Fa&&(a=Math.max(0,Math.min(T.length-1,a+(n>0?1:-1)))),T[a]}function wo(e){return T[(T.indexOf(e)+1)%T.length]}function Ba(e,t){return Math.min(e,t*Ha)}function I(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function xt(e){let t=null,n=()=>{let o=I();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Ua=8,Ja=400;function vo(e){let t=l("side"),n=l("sheet-handle"),o="peek",a=!1,r=0,i=0,s=0,c={y:0,t:0};function d(){return window.innerHeight}function p(m){t.style.height=`${m}px`,e.onMove(m,Ba(m,d()))}function w(m){o=m,t.dataset.snap=m,p(Te(m,d()))}n.addEventListener("pointerdown",m=>{I()&&(a=!0,r=m.clientY,i=t.getBoundingClientRect().height,s=m.timeStamp,c={y:m.clientY,t:m.timeStamp},t.classList.add("dragging"),n.setPointerCapture(m.pointerId))}),n.addEventListener("pointermove",m=>{if(!a)return;let G=i+(r-m.clientY),O=Te("peek",d()),q=Te("full",d());p(Math.max(O,Math.min(q,G))),c={y:m.clientY,t:m.timeStamp}});function R(m){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(m.clientY-r)>Ua)&&m.timeStamp-s<Ja){w(wo(o));return}let O=m.timeStamp-c.t,q=O>0?(c.y-m.clientY)/O:0;w(ja(t.getBoundingClientRect().height,d(),q))}n.addEventListener("pointerup",R),n.addEventListener("pointercancel",R),n.addEventListener("keydown",m=>{m.key!=="Enter"&&m.key!==" "||(m.preventDefault(),I()&&w(wo(o)))});let _=xt(e.onLayoutChange);function P(){if(_(),!I()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}w(o)}return window.addEventListener("resize",P),P(),{at:()=>I()?o:"full",atLeast(m){I()&&T.indexOf(m)>T.indexOf(o)&&w(m)}}}var Ia=[-79.9959,40.4406],za=12,Ka="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},ae=mo(location.search),se=yo(location.search);se&&l("app").classList.add("embed");var Wa={at:()=>"full",atLeast(){}},Lo=null,$=400,te=null,f=null,z=null,A=0,S={key:"downtown"},N=null,ko=!1,Y=!1,Me="locations",V="area",y="dots",$o,Rt=[],u=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ae.camera?[ae.camera.lon,ae.camera.lat]:Ia,zoom:ae.camera?.zoom??za,cooperativeGestures:uo(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{Et(u),rn(u),gn(u,"change-dots"),kn(u,"change-dots"),Pn(u,"walk-fill"),Zn(u),K(),u.on("click",t=>{if(ko){re({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(r=>u.getLayoutProperty(r,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Pt(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});u.on("mouseenter","change-dots",()=>{u.getCanvas().style.cursor="pointer"}),u.on("mouseleave","change-dots",()=>{u.getCanvas().style.cursor="",e.remove()}),u.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=Ge();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(cn(n.properties,k(),o.buckets)).addTo(u)}),u.on("mouseenter","oneseat-dots",()=>{u.getCanvas().style.cursor="pointer"}),u.on("mouseleave","oneseat-dots",()=>{u.getCanvas().style.cursor="",e.remove()}),u.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=J();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Nn(n.properties,o)).addTo(u)}),u.on("moveend",()=>{let t=u.getCenter();Lo={lat:t.lat,lon:t.lng,zoom:u.getZoom()},v(),F()}),ne(D.radius,t=>{$=Number(t.dataset.radius),Xe(u,$,k()).then(v),be()&&ot(u,$,k()).then(v),we()&&st($).then(v),J()&&Ce(),f&&W(f.lat,f.lon)}),ne(D.day,t=>{let n=t.dataset.day;Vt(n),y!=="journey"&&K(),Qe(u,n),at(u,n),y==="journey"&&f&&_t(f.lat,f.lon),ke()&&$n(u,n).then(v),Y&&J()&&(Ce(),f&&W(f.lat,f.lon)),v()}),ne(D.oneSeatDay,t=>{Y=t.dataset.oneseatDay==="selected",So(),Ce(),f&&W(f.lat,f.lon)}),ne(D.view,t=>{let n=y;y=t.dataset.view,u.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),Qa(y==="surface"||y==="both"),er(y==="corridors"),or(y==="oneseat"),nr(y==="journey",n==="journey"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&K({scrollToTop:!0}),tr(y!=="corridors"&&y!=="journey");let o=y==="oneseat"||y==="journey";l("dest-controls").classList.toggle("hidden",!o),l("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),So(),o||Ee(!1),Ro()}),ne(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Ee(!0);return}Ee(!1),re({key:n})}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Me=n.dataset.weight,v(),F();return}let o=t.target.closest("[data-surface-unit]");if(o){V=o.dataset.surfaceUnit,Za(V),F();return}let a=t.target.closest("[data-bucket]");a&&(sn(u,a.dataset.bucket,k()),v())}),l("legend-reset").addEventListener("click",()=>{ln(u,k()),v()}),l("legend-collapse").addEventListener("click",()=>{Ot(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&re({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&lr(o.dataset.caveat)}),l("side-toggle").addEventListener("click",qa),se&&xt(Ot),$o=se?Wa:vo({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:Ot}),Va(),Ae(),Ne(),Ya(ae)||Xe(u,$,k()).then(v),ir(),sr()});function ne(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),Ae(),F()})})}function oe(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Ya(e){let t=!1;return e.radius!==void 0&&(t=oe(D.radius,String(e.radius))||t),e.day&&(t=oe(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&oe(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Me=e.weight),e.surfaceUnit&&(V=e.surfaceUnit),e.dest&&("key"in e.dest?oe(D.dest,e.dest.key):re(e.dest)),e.view&&oe(D.view,e.view),e.at&&Pt(e.at.lat,e.at.lon),t}function F(){let e={view:y,day:k(),radius:$,oneSeatRestricted:Y,weight:Me,surfaceUnit:V,dest:S,at:f,camera:Lo},t=po(e);history.replaceState(null,"",(se?fo(t):t)+location.hash),Ne(t)}function Ne(e=go(location.search)){if(!se)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?z?Q(z):"this point":null;t.querySelector(".el-action").textContent=bo(n)}function Ae(){l("statebar").innerHTML=io({view:y,day:k(),radius:$,oneSeatRestricted:Y,destination:ie()}),Ga()}function Ot(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Va(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Ga(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(so(y)))}function qa(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function v(){Xa()}function Xa(){if(l("legend-reset").classList.toggle("hidden",lt()||pt()||bt()),bt()){l("legend").innerHTML=ao(De());return}if(lt()){let n=ke();n&&Hn(l("legend"),n);return}if(pt()){let n=J();if(!n)return;let o=u.getBounds();jn(l("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=Ge();if(!e)return;let t=u.getBounds();Un(l("legend"),{layer:e,day:k(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Me,surface:nt()?be():null,unit:V,population:we()})}async function Qa(e){if(e&&!be()){l("legend").classList.add("loading");try{await ot(u,$,k())}finally{l("legend").classList.remove("loading")}}bn(u,e),e&&V==="people"&&await xo(),v()}async function xo(){if(!we()){l("legend").classList.add("loading");try{await st($)}finally{l("legend").classList.remove("loading")}}}async function Za(e){e==="people"&&nt()&&await xo(),v()}async function er(e){if(e&&!ke()){l("legend").classList.add("loading");try{await ct(u,k())}finally{l("legend").classList.remove("loading")}}xn(u,e),v()}function tr(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function K({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),Ne(),!z){y==="oneseat"?l("panel").innerHTML=en(ie()):Gt(l("panel"));return}if(y==="oneseat"){let t=Zt(z,S,k());if(t){l("panel").innerHTML=t;return}}Qt(z)}function nr(e,t=!1){if(eo(u,e),v(),!e){t&&(f?W(f.lat,f.lon):K());return}De()&&f?l("panel").innerHTML=vt(De(),ie()):l("panel").innerHTML=oo(ie())}async function _t(e,t){let n=++A;f={lat:e,lon:t},F(),Do(e,t);let o=_o(),a=h(ie());if(!o){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await L(to({lat:e,lon:t},o,k()));if(n!==A)return;wt(u,r),l("panel").innerHTML=vt(r,a),v(),Ne()}catch(r){if(n!==A)return;wt(u,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function So(){l("day-controls").classList.toggle("hidden",!En(y,Y))}function Dt(){return Cn(Y,k())}async function or(e){e&&!J()&&await Oo(()=>mt(u,$,S,Dt())),Mn(u,e),v()}async function Ce(){await Oo(()=>mt(u,$,S,Dt())),v()}async function Oo(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function re(e){if(S=e,Ee(!1),ar(),Ro(),Ae(),F(),y==="journey"){f&&_t(f.lat,f.lon),v();return}f?W(f.lat,f.lon):K({scrollToTop:!0}),Ce()}function Ro(){let e=_o();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in S))){N?.remove(),N=null;return}N?N.setLngLat([e.lon,e.lat]).addTo(u):(N=new maplibregl.Marker({color:dt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),N.on("dragend",()=>{let n=N.getLngLat();re({lat:n.lat,lon:n.lng})}))}function ar(){let e=Tn(S);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function _o(){if("lat"in S)return{lat:S.lat,lon:S.lon};let e=S.key,t=Rt.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function ie(){if("lat"in S)return`${S.lat.toFixed(4)}, ${S.lon.toFixed(4)}`;let e=S.key;return Rt.find(t=>t.key===e)?.name??e}function Ee(e){ko=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function W(e,t){let n=++A;f={lat:e,lon:t},F(),l("panel").classList.add("loading"),Do(e,t);try{let o="lat"in S?`&dest_lat=${S.lat.toFixed(6)}&dest_lon=${S.lon.toFixed(6)}`:"",a=await L(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${$}${o}&oneseat_day=${Dt()}`);if(n!==A)return;Mt(u,e,t,$,a.current.stops,a.proposed.stops),rr(),z=a,K({scrollToTop:!0})}catch(o){if(n!==A)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===A&&l("panel").classList.remove("loading")}}function rr(){l("pin-key").innerHTML=Bn($),l("pin-key").classList.remove("hidden")}function Do(e,t){te?te.setLngLat([t,e]):(te=new maplibregl.Marker({color:Ka,draggable:!0}).setLngLat([t,e]).addTo(u),te.on("dragend",()=>{let n=te.getLngLat();Pt(n.lat,n.lng)}))}function Pt(e,t){if($o.atLeast("half"),y==="journey"){_t(e,t);return}W(e,t)}async function sr(){try{Rt=await L("/api/destinations"),Ae()}catch{}}async function ir(){try{let e=await L("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function lr(e){l("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
