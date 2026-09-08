"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function ee(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function mt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function gt(e){return e>0?`+${e}`:String(e)}function fn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var Yo="#4aa3ff",Wo="#ffa23a";function Vo(e,t,n,a=96){let o=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let l=0;l<=a;l++){let u=l/a*2*Math.PI;o.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function te(e){return{type:"FeatureCollection",features:e}}function bn(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function wn(e){e.addSource("walk",{type:"geojson",data:te([])}),e.addSource("stops-now",{type:"geojson",data:te([])}),e.addSource("stops-prop",{type:"geojson",data:te([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":Wo,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":Yo,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let s=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function vn(e,t,n,a,o,s){e.getSource("walk").setData(te([Vo(t,n,a)])),e.getSource("stops-now").setData(te(bn(o,"current"))),e.getSource("stops-prop").setData(te(bn(s,"proposed")))}var O=["weekday","saturday","sunday"],yt=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Sn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ke=4,Ln=e=>4+ke*e,$n=e=>5+ke*e,me=e=>6+ke*e,qo=e=>7+ke*e,xe=2,Xo=3,ht=e=>e[Xo],T=(e,t)=>e[t],kn=(e,t)=>e[qo(t)],ft=e=>2+2*e,bt=e=>3+2*e,_e=4,xn=e=>2+_e*e,_n=e=>3+_e*e,Pn=e=>4+_e*e,On=e=>5+_e*e;var vt="weekday";function L(){return vt}function Mn(e){vt=e}function Fn(e){e.innerHTML=`
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
    </div>`}function Qo(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function Zo(e,t){let n=Math.max(1,...yt.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return yt.map(a=>{let o=e.periods[a]??0,s=t.periods[a]??0,r=s-o,l=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${Sn[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${s}</td>
        <td class="n ${l}">${r===0?"\xB7":gt(r)}</td>
      </tr>`}).join("")}function Nn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Dn(e){return e.first==null?'<span class="muted">no service</span>':`${ee(e.first)}\u2013${ee(e.last)}`}function Rn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var es={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},ts={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ns(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':De(a.current,a.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(a.name)}</span>
          <span class="os-status ${d(a.status)}">${es[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${o}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${ts[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Oe("one-seat")}</p>
    </div>`:""}function Oe(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Pe(e,t,n=null){let a=e===t?" same":"",o=n?` ${n}`:"";return`<dd class="cmp${a}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${o}">${t}</span></dd>`}function En(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Tn(e){return e.first==null||e.last==null?null:e.last-e.first}function De(e,t){let n=new Set(e.filter(a=>t.includes(a)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Cn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Cn(t,n,"prop")}</div>
    </div>`}function Cn(e,t,n){return e.length?e.map(a=>`<span class="route ${t.has(a)?"both":`only-${n}`}">${d(a)}</span>`).join(" "):'<span class="muted">none</span>'}var wt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,as="Allegheny";function ge(e){let t=e.place?.muni?.trim()??"",n=wt.exec(t)?.[1],a=n===as?t.replace(wt,""):n?`${t.replace(wt,"")} (${n})`:t;return e.place?.hood||a||"this location"}function St(e){return e==="weekday"?"weekday":e}function An(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${St(t)}`}function os(e){let t=e.filter(n=>n.new_place).length;return t?`<dt>Stops the plan adds where none stands within 150 m</dt>
    <dd>${t} of ${e.length}</dd>`:""}function ss(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${St(t)}, today only</span>`}${a}</dd>`}function rs(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Oe("boardings")}</p>`}function is(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
    </div>`}function Lt(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],s=o.trips-a.trips,r=s>0?"up":s<0?"down":"flat",l=Rn(a),u=Rn(o),p=Tn(a),m=Tn(o);return`
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
        ${s===0?"no change":`${gt(s)} trips`}
        <div class="muted">${fn(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${St(t)}, both directions</div>

    <div class="tiers">${Qo(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${Zo(a,o)}</tbody>
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
      ${Pe(Dn(a),Dn(o))}
      <dt>Hours between</dt>
      ${Pe(mt(p),mt(m),En(p,m,"more"))}
      <dt>Typical wait</dt>
      ${Pe(l==null?"\u2014":`${l} min`,u==null?"\u2014":`${u} min`,En(l,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Pe(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${os(e.proposed.stops)}
      ${ss(a.boardings,t)}
    </dl>
    ${rs(a.boardings)}

    ${n}

    ${is(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${De(a.routes,o.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Oe("location-not-route")}</p>
    </div>`}function Bn(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(ge(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Lt(e,vt,ns(e.oneseat??[],e.oneseat_day??"any"))}`}var ls={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},cs={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},us={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ds(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function $t(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${Nn(t)}</div>`:""}function ps(e){let t=$t("kept",e.kept)+$t("lost",e.lost)+$t("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ms(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${De(e.current,e.proposed)}
    </div>`}function gs(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${d(o.key)}">
      <span class="os-name">${d(o.name)}</span>
      <span class="os-status ${d(o.status)}">${ys[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var ys={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function hs(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${us[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Hn(e,t,n){let a=ds(e,t);if(!a)return"";let o=e.oneseat_day??"any",s=a.status==="here"?"":ps(a)+ms(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(a.name)}</h2>
      <div class="muted">
        from ${d(ge(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(a.status)}">${ls[a.status]}</div>
    <p class="note">${cs[a.status]} ${hs(o)}</p>

    ${s}

    ${gs(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${An(e,n)}</summary>
      ${Lt(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function jn(e){return`
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
    </div>`}var Te={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Ce="change",ye="change-dots",Re=["boolean",["feature-state","selected"],!1],fs="#15181e",Y=["==",["get","published"],0],Me="newplace",bs="#15181e",ws=5,Ee=null,W=new Set,C=new Set;function xt(){return Ee}function Fe(e){return W.has(e)}function In(e,t,n,a){return o=>Ls(o,e,t,n,a)}function Un(e){return t=>e.has(ht(t))}function Jn(){return C}function zn(){return[...C].sort()}function Gn(){return C.size}function _t(e,t){let n=0;for(let a of t)C.has(a)||(C.add(a),he(e,a,!0),n++);return n}function Kn(e,t){C.delete(t)?he(e,t,!1):(C.add(t),he(e,t,!0))}function Yn(e,t){Pt(e),_t(e,t)}function Pt(e){for(let t of C)he(e,t,!1);C.clear()}function he(e,t,n){try{e.setFeatureState({source:Ce,id:t},{selected:n})}catch{}}function vs(e){for(let t of C)he(e,t,!0)}function Ss(e,t,n,a){let o=n*n;return a.filter(s=>(s.x-e)**2+(s.y-t)**2<=o).map(s=>s.id)}function Ot(e,t,n,a){let o=[[t-a,n-a],[t+a,n+a]],s=e.queryRenderedFeatures(o,{layers:[ye]}).filter(r=>r.id!==void 0).map(r=>{let[l,u]=r.geometry.coordinates,p=e.project([l,u]);return{id:r.id,x:p.x,y:p.y}});return Ss(t,n,a,s)}function Wn(e,t,n,a){let o={};for(let s of n)o[s]=0;for(let s of e){if(!a(s)||T(s,xe)===0)continue;let r=n[T(s,me(t))];r!==void 0&&o[r]++}return o}function Vn(e,t){let n=0;for(let a of e)t(a)&&T(a,xe)===0&&n++;return n}function Ls(e,t,n,a,o){let s=T(e,0),r=T(e,1);return s>=n&&s<=o&&r>=t&&r<=a}function qn(e,t,n,a){let o={riders:{},measured:{},unmeasured:0};for(let s of n)o.riders[s]=0,o.measured[s]=0;for(let s of e){if(!a(s)||T(s,xe)===0)continue;let r=n[T(s,me(t))];if(r===void 0)continue;let l=kn(s,t);if(l===null){r!=="none"&&o.unmeasured++;continue}o.riders[r]+=l,o.measured[r]++}return o}function $s(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>O.some((a,o)=>t[T(n,me(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ht(n),published:n[2],...Object.fromEntries(O.flatMap((a,o)=>[[`b${o}`,t[T(n,me(o))]],[`c${o}`,n[Ln(o)]],[`p${o}`,n[$n(o)]]]))}}))}}function Xn(e,t){let n=Object.entries(Te).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,Te.none[t]]}function Qn(e){return["case",Y,"rgba(0,0,0,0)",Xn(e,"color")]}function kt(e){return["case",Y,ws,Xn(e,"size")]}function Zn(e){return["interpolate",["linear"],["zoom"],9,["*",kt(e),.45],12,kt(e),16,["*",kt(e),1.9]]}function ea(e){e.addSource(Ce,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ye,type:"circle",source:Ce,paint:{"circle-color":Qn(0),"circle-radius":Zn(0),"circle-opacity":.85,"circle-stroke-color":["case",Re,fs,Y,bs,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",Re,1.6,Y,.9,.5],12,["case",Re,2.4,Y,1.5,1],16,["case",Re,3.2,Y,2.2,1.6]]}},"walk-fill")}async function Dt(e,t,n){return Ee=await S(`/api/change?radius=${t}`),e.getSource(Ce).setData($s(Ee)),vs(e),Rt(e,n),Ee}function Rt(e,t){let n=O.indexOf(t);e.setPaintProperty(ye,"circle-color",Qn(n)),e.setPaintProperty(ye,"circle-radius",Zn(n)),Et(e,t)}function ta(e,t,n){W.has(t)?W.delete(t):W.add(t),Et(e,n)}function na(e,t){W.clear(),Et(e,t)}function Et(e,t){let n=O.indexOf(t),a=["none",...W];e.setFilter(ye,["case",Y,!W.has(Me),["!",["in",["get",`b${n}`],["literal",a]]]])}function aa(e,t,n){let a=O.indexOf(t),o=e[`b${a}`],s=e.published===0?"the plan adds a stop here":n.find(m=>m.key===o)?.label??o,r=e[`c${a}`],l=e[`p${a}`],u=t==="weekday"?"weekday":t,p=e.published===0?" within a walk":"";return`<b>${s}</b><br>${r} \u2192 ${l} buses per ${u}${p}<br><span style="opacity:.6">click for the full comparison</span>`}var Tt="surface",Ae="surface-fill",oa="#6b7280",Ct=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,oa],[.138,oa],[1,"#bd60e7"],[2,"#961bed"]],R="#e8232f",E="#0f79c9",sa=2,Ne=null,ra=!1;function Be(){return Ne}function Mt(){return ra}function ia(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-sa,Math.min(sa,n))}function la(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function ca(e,t,n,a,o,s,r,l){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=r.lat0+(p[1]+.5)*r.dlat,w=r.lon0+(p[0]+.5)*r.dlon;if(m<a||m>s||w<n||w>o)continue;let k=p[ft(t)],x=p[bt(t)],I=la(k,x);if(I!=="none")if(I==="ramp"){let y=ia(k,x);u[y<-.138?"less":y>.138?"more":"same"]+=l}else u[I]+=l}return u}function ks(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*a,l=r+a,u=n+s[0]*o,p=u+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[p,r],[p,l],[u,l],[u,r]]]},properties:Object.fromEntries(O.flatMap((m,w)=>{let k=s[ft(w)],x=s[bt(w)];return[[`k${w}`,la(k,x)],[`v${w}`,ia(k,x)??0]]}))}})}}function ua(e){return["case",["==",["get",`k${e}`],"gone"],R,["==",["get",`k${e}`],"new"],E,["interpolate",["linear"],["get",`v${e}`],...Ct.flatMap(([t,n])=>[t,n])]]}function ne(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function da(e,t){e.addSource(Tt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ae,type:"fill",source:Tt,layout:{visibility:"none"},paint:{"fill-color":ua(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,ne(0,.85),13,ne(0,.62),16,ne(0,.45)]}},t)}async function Ft(e,t,n){return Ne=await S(`/api/surface?radius=${t}`),e.getSource(Tt).setData(ks(Ne)),Nt(e,n),Ne}function Nt(e,t){let n=O.indexOf(t);e.setPaintProperty(Ae,"fill-color",ua(n)),e.setPaintProperty(Ae,"fill-opacity",["interpolate",["linear"],["zoom"],9,ne(n,.85),13,ne(n,.62),16,ne(n,.45)])}function pa(e,t){ra=t,e.setLayoutProperty(Ae,"visibility",t?"visible":"none")}var At=null;function He(){return At}async function Bt(e){return At=await S(`/api/population?radius=${e}`),At}function ma(e,t,n,a,o,s,r){let l={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;p<a||p>s||m<n||m>o||(l.lost+=u[xn(t)],l.gained+=u[_n(t)],l.kept+=u[Pn(t)],l.none+=u[On(t)])}return l}var Ht="corridor",ga="corridor-lines",Ue="#8b929c",xs="#6f7783",Ie={lost:R,added:E,kept:Ue};var je=null,ya=!1;function Je(){return je}function jt(){return ya}function _s(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function ha(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Ps(){let e=t=>["match",["get","klass"],"lost",Ie.lost,"added",Ie.added,t];return["interpolate",["linear"],["zoom"],9,e(xs),14,e(Ue)]}function Os(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Ds(){return["match",["get","klass"],"kept",.85,.9]}function fa(e,t){e.addSource(Ht,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ga,type:"line",source:Ht,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Ps(),"line-width":Os(),"line-opacity":Ds()}},t)}async function It(e,t){return je=await S(`/api/corridors?day=${t}`),e.getSource(Ht).setData(_s(je)),je}async function ba(e,t){O.includes(t)&&await It(e,t)}function wa(e,t){ya=t,e.setLayoutProperty(ga,"visibility",t?"visible":"none")}var Jt="#2b3038",va="#b9bec6",fe={loses:{color:R,size:6},gains:{color:E,size:6},keeps:{color:Ue,size:3},here:{color:Jt,size:3.5},none:{color:va,size:1.8}},Ge=["loses","gains","keeps","none","here"],Ut="oneseat",Sa="oneseat-dots",ze=null,La=!1;function ae(){return ze}function zt(){return La}function $a(e,t,n,a,o,s){let r={};for(let l of t)r[l]=0;for(let l of e){let u=l[0],p=l[1];if(u<a||u>s||p<n||p>o)continue;let m=t[l[3]];m!==void 0&&r[m]++}return r}function Rs(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Es(){return["match",["get","status"],...Object.entries(fe).flatMap(([e,t])=>[e,t.color]),va]}function Ts(){let e=["match",["get","status"],...Object.entries(fe).flatMap(([t,n])=>[t,n.size]),fe.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function ka(e,t){e.addSource(Ut,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Sa,type:"circle",source:Ut,layout:{visibility:"none"},paint:{"circle-color":Es(),"circle-radius":Ts(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Cs(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Ms="pin";function xa(e){return"key"in e?e.key:Ms}var Ke="any";function Fs(e,t,n){return`radius=${e}&${Cs(t)}&day=${n}`}function _a(e,t){return e?t:Ke}function Pa(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function Gt(e,t,n,a=Ke){return ze=await S(`/api/oneseat?${Fs(t,n,a)}`),e.getSource(Ut).setData(Rs(ze)),ze}function Oa(e,t){La=t,e.setLayoutProperty(Sa,"visibility",t?"visible":"none")}function Kt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Da(e,t){let n=t.statuses.find(l=>l.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),s=l=>l.length?l.join(", "):"none",r=Kt(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(a)}<br>proposed: ${s(o)}`}var Yt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ns(e){return e.buckets.filter(t=>t.key!=="none")}var Ra={area:"Ground",people:"People"};function As(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=ca(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(o.less)}</b> km\xB2 less</span>
        <span><b>${s(o.more)}</b> km\xB2 more</span>
        <span><b>${s(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Bs(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=ma(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(o.lost)}</b> people lose all service</span>
        <span><b>${s(o.gained)}</b> gain service</span>
        <span><b>${s(o.kept)}</b> keep a bus</span>
        <span><b>${s(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}var Hs=`
      <div class="lg-ends" style="margin-top:6px">Ground and people count the
        whole view, not the stops you selected \u2014 a 100 m cell has no stop to
        select. Clear the selection to count them.</div>`;function js(e){let{layer:t,day:n,bounds:a,unit:o,population:s,scoped:r=!1}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Ct.map(([u,p])=>`${p} ${((u+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${R}"></i>loses all service</span>
        <span><i style="background:${E}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Ra).map(u=>`
          <button data-surface-unit="${u}" aria-pressed="${o===u}"
                  class="${o===u?"active":""}">${Ra[u]}</button>`).join("")}
      </div>
      ${r?Hs:o==="people"?Bs(n,a,s):As(t,n,a)}
    </div>`}var Is=["lost","added","kept"],Us={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Js={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Ta(e,t){let{lostPct:n,addedPct:a}=ha(t.km),o=l=>l.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${Js[t.day]}
    </div>
    ${Is.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${Ie[l]}"></i>
        <span class="lg-lab">${d(Us[l])}</span>
        <span class="lg-n">${o(t.km[l])} km</span>
      </div>`).join("")}
    <div class="lg-area">
      <span><b>${o(n)}%</b> of today's pavement lost</span>
      <span><b>${o(a)}%</b> of today's pavement gained</span>
    </div>
    <div class="lg-ends" style="margin-top:4px">citywide, not in view</div>
    <div class="lg-foot">A street either has a bus on it or it doesn't, so
      there is no walk radius here. A street can lose its only bus while the
      block beside it keeps one: for what a rider can still reach on foot, see
      Locations or Surface.</div>`}function Ca(e,t,n){let a=t.statuses.map(m=>m.key),o=$a(t.points,a,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(w=>w.key===m)?.label??m,r=Ge.reduce((m,w)=>m+(o[w]??0),0),l=Kt(t),u=t.day&&t.day!==Ke,p=u?`Restricted to routes running on ${Yt[t.day]} at both ends \u2014 <b>not</b> the published answer, which counts a route
      calling here on any calendar.`:`No day type enters this, as published \u2014 a route serves a place or it
      doesn't. Switch the one-seat control to "Selected day" for one day.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(l)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${Yt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Ge.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${fe[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(o[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Ge.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(l)} without transferring?
      ${p} No frequency or travel time enters it: a surviving ride may
      run hourly, or take an hour. Click a dot for that location's timetable.
      The only view here that counts the T and the inclines \u2014 without them the
      South Hills would read as losing rides the Blue Line still runs.</div>`}function Ma(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Ea={locations:"Locations",riders:"Riders"};function zs(e,t){let a=`${t.toLocaleString()} location${t===1?"":"s"} in view`,s=t?`<b>${a}</b> ${t===1?"gains":"gain"} a stop where none stands today: no boardings to weigh. This counts what is at risk, never what is gained.`:"Boardings exist only where a bus stops today, so this counts what is at risk, never what is gained.",r=e?` ${e.toLocaleString()} stop${e===1?" has":"s have"} no figure in the extract, and are left out rather than counted as none.`:"";return`<div class="lg-foot lg-foot-riders">${s}${r}
    Boardings are PRT's May 2025 daily averages: unlinked trips,
    not people, and by PRT's own disclaimer up to 30% low.</div>`}function Gs(){return`<div class="lg-foot">Dots mark today's stops, plus the places the plan
    puts a stop where none stands within 150 m. A stop added right beside an
    existing one changes a dot's colour rather than adding one; Streets colours
    the pavement itself, and shows the rest.</div>`}function Ks(e){if(!e)return"";let t=Fe(Me);return`
    <button class="lg-row ${t?"off":""}" data-bucket="${Me}"
            aria-pressed="${!t}">
      <i class="lg-hollow"></i>
      <span class="lg-lab">the plan adds a stop here</span>
      <span class="lg-n">${e.toLocaleString()}</span>
    </button>`}function Fa(e,t){let{layer:n,day:a,bounds:o,weight:s,surface:r,unit:l="area",population:u,selection:p}=t,m=n.buckets.map(v=>v.key),w=n.days.indexOf(a),{west:k,south:x,east:I,north:y}=o,Z=Ns(n),_=p&&p.size>0?p:null,G=_?Un(_):In(k,x,I,y),yn=Wn(n.points,w,m,G),dt=Vn(n.points,G),K=s==="riders"?qn(n.points,w,m,G):null,zo=v=>K?K.measured[v]?Math.round(K.riders[v]).toLocaleString():"\u2014":yn[v].toLocaleString(),Go=_?`at ${_.size.toLocaleString()} selected stop${_.size===1?"":"s"}`:"in view",hn=Z.reduce((v,pt)=>v+yn[pt.key],0)+dt,Ko=K?`<b>${Math.round(Z.reduce((v,pt)=>v+K.riders[pt.key],0)).toLocaleString()}</b> daily boardings ${Go}`:_?`<b>${hn.toLocaleString()}</b>
         of ${_.size.toLocaleString()} selected stops`:`<b>${hn.toLocaleString()}</b>
         locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${Ko}
      <span class="muted">\xB7 ${Yt[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Ea).map(v=>`
        <button data-weight="${v}" aria-pressed="${s===v}"
                class="${s===v?"active":""}">${Ea[v]}</button>`).join("")}
    </div>
    ${Z.map(v=>`
      <button class="lg-row ${Fe(v.key)?"off":""}" data-bucket="${d(v.key)}"
              aria-pressed="${!Fe(v.key)}">
        <i style="background:${Te[v.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(v.label)}</span>
        <span class="lg-n">${zo(v.key)}</span>
      </button>`).join("")}
    ${Ks(dt)}
    ${r?js({layer:r,day:a,bounds:o,unit:l,population:u,scoped:!!_}):""}
    ${K?zs(K.unmeasured,dt):`
    <div class="lg-foot">Buses per day within the walk radius, both
      directions \u2014 counting locations, not riders.</div>`}
    ${Gs()}
    ${_?`
    <div class="lg-foot">The stops you painted, not everything on screen \u2014
      hand-picked, so quote it as a sample. The link in your address bar
      carries it.</div>`:""}`}var Wt="#4aa3ff",Ua="#ffa23a",Vt="headline",Ye="journey",Ja="journey-rides",za="journey-walks",Ys=[Ja,za],Ga=null,Ka=!1;function Ve(){return Ga}function qt(){return Ka}function Ws(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let s=n[o].itinerary;if(s)for(let r of s.legs){let l=r.from??e.origin,u=r.to??e.destination,p=[[l.lon,l.lat],[u.lon,u.lat]],m=r.path?.length?r.path:p;a.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:o,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:a}}function Na(){return["match",["get","side"],"current",Wt,"proposed",Ua,Wt]}function Aa(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Ya(e,t){e.addSource(Ye,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ja,type:"line",source:Ye,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Na(),"line-width":Aa(1),"line-opacity":.85}},t),e.addLayer({id:za,type:"line",source:Ye,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Na(),"line-width":Aa(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Wa(e,t){Ka=t;for(let n of Ys)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function Xt(e,t){Ga=t;let n=t?Ws(t,Vt):{type:"FeatureCollection",features:[]};e.getSource(Ye).setData(n)}function Va(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Ba=e=>`${e.toFixed(1)} min`;function qa(e){return e==null?"\u2014":e===0?"no change":e>0?`${Ba(e)} slower`:`${Ba(-e)} faster`}function Ha(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function Vs(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=Ha(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Ha(e.to,"the destination")}</span></div>`}function ja(e,t){let n=[],a=null;for(let o of e.legs){let s=a?Math.round(o.depart-a.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(Vs(o,t)),a=o}return n.join("")}var qs={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function We(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function Xs(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function Qs(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${We(t.current)} \u2192
        ${We(t.proposed)} min</span>
        <span class="muted">${qa(t.change_min)}</span></div>
      ${a}
    </div>`}function Ia(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function Qt(e,t){let n=e.radii[Vt],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
    <div class="place-head">
      <h2>Travel time to ${d(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${ee(e.window.start_min)}
        and ${ee(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${o}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${qs[n.classification]??""}</p>
      </div>
      ${Ia(e)}`:`${o}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${We(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${We(n.proposed)}</div>
      </div>
      <div class="hl-delta ${a}">${qa(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${Xs(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?ja(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?ja(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${Qs(e)}
    ${Ia(e)}`}function Xa(e){return`
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
    </div>`}function Qa(e){let t=e?e.radii[Vt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Wt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Ua}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var Qe="places",to="places-points",Zt="places-boundaries",M="places-fill",se="lost",Zs=100,er={lost:"share_lost",gained:"share_gained"};function J(e,t){return`service_${e}_${t}`}var no={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},tr="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",V={lost:R,gained:E},qe=null,U=null,oe=null,ao=!1,Xe=null;function en(){return qe}function oo(){return U}function so(){return Xe}function tn(){return oe}function be(){return ao}function nr(e,t){let n=[...e];return t==="count"?n.sort((a,o)=>o.residents_lost-a.residents_lost):n.sort((a,o)=>(o.share_lost??-1)-(a.share_lost??-1))}function ar(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function or(e){return Math.max(e.residents_lost,e.residents_gained)}var Za=4,sr=16,rr=1e3;function ir(e){let t=Math.min(1,Math.sqrt(e/rr));return Za+t*(sr-Za)}function lr(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:ar(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:ir(or(t))}}))}}function cr(){return["match",["get","klass"],"lost",V.lost,"gained",V.gained,V.lost]}function ur(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var H=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var j=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function ro(e,t){return e==="service"?["step",["abs",["coalesce",["get",J(t,"pct")],0]],j[0].opacity,j[0].max,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity]:["step",["coalesce",["get",er[e]],0],H[0].opacity,Number.EPSILON,H[1].opacity,H[1].max,H[2].opacity,H[2].max,H[3].opacity,H[3].max,H[4].opacity]}function io(e,t){return e==="service"?["case",[">=",["coalesce",["get",J(t,"pct")],0],0],E,R]:V[e]}function dr(e,t){let n=J(t,"now"),a=J(t,"proposed");return e.features.filter(o=>o.properties[n]===0&&o.properties[a]>0).map(o=>o.properties.place)}var pr=3;function mr(e){if(e.length===0)return"";let t=e.slice(0,pr),n=e.length-t.length,a=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,o=n>0?`${a} (and ${n} more)`:a;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${o}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${o}.`}function lo(e,t){e.addSource(Zt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:M,type:"fill",source:Zt,layout:{visibility:"none"},paint:{"fill-color":io(se),"fill-opacity":ro(se),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(Qe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:to,type:"circle",source:Qe,layout:{visibility:"none"},paint:{"circle-color":cr(),"circle-radius":ur(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Ze(e,t,n){e.setPaintProperty(M,"fill-color",io(t,n)),e.setPaintProperty(M,"fill-opacity",ro(t,n))}async function co(){return qe||(qe=await S("/api/places")),qe}async function uo(e){return oe||(oe=await S("/api/boundaries"),e.getSource(Zt).setData(oe)),oe}function gr(e,t){let n=e?.features.find(a=>a.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function po(e,t){let n=gr(oe,t);if(n)return U=null,Xe=n,e.getSource(Qe)?.setData({type:"FeatureCollection",features:[]}),null;try{U=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return U=null,Xe=null,null}return Xe=null,e.getSource(Qe).setData(lr(U)),e.flyTo({center:[U.lon,U.lat],zoom:13}),U}function mo(e,t){ao=t,e.setLayoutProperty(to,"visibility",t?"visible":"none"),e.setLayoutProperty(M,"visibility",t?"visible":"none")}function yr(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var hr="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function go(e,t,n,a){let o=nr(e,t).map(s=>yr(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${tr}</p>
    ${a==="service"?`<p class="note">${hr}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${o}</div>`}function yo(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function fr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function br(e,t,n,a){let o=j.map((u,p)=>({band:u,prevMax:p===0?0:j[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=fr(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${R};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${E};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=a?dr(a,n):[],r=mr(s),l=r?`<div class="lg-foot">${d(r)}</div>`:"";return`
    ${yo(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(no[n])}</div>
    ${o}
    ${l}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ho({selected:e,fill:t,day:n,boundaries:a,unchanged:o}){if(t==="service")return br(e,o??null,n,a??null);let s=t==="lost"?"lose all buses":"gain a bus",r=H.filter(l=>l.opacity>0).map(l=>`
    <div class="lg-row lg-static">
      <i style="background:${V[t]};opacity:${l.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(l.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${yo(e,o??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${V.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${V.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function wr(e,t){let n=e[J(t,"now")],a=e[J(t,"proposed")],o=e[J(t,"pct")],s=e[J(t,"rail_proposed")],r=no[t];if(a===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&a>0)return`Gets its first bus on ${r} (0 \u2192 ${a} trips).`;let l=o==null?"\u2014":`${o>0?"+":""}${o.toFixed(1)}%`;return`${n} \u2192 ${a} trips on ${r} (${l}).`}function fo(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${wr(e,n)}`;let a=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${a} residents lose or gain a bus.`;let o=eo("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?eo("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[o,s]:[s,o]).filter(l=>l!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${a} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function eo(e,t,n){let a=Math.round(t).toLocaleString(),o=n==null?`share withheld \u2014 under ${Zs} residents`:`${(n*100).toFixed(1)}%`;return`${a} ${e} (${o})`}var nn=" \xB7 ",an={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},bo=Object.keys(an);function wo(e){return an[e]??e}var vr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Sr=["oneseat","journey"];function Lr(e){return e!=="journey"}function $r(e){let t=[an[e.view]??e.view];return e.view==="places"?t[0]:(Sr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":vr[e.day]),Lr(e.view)&&t.push(`${e.radius} m walk`),t.join(nn))}function vo(e){let[t,...n]=$r(e).split(nn);return`<b>${d(t)}</b>${n.map(a=>nn+d(a)).join("")}`}var h={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel"},kr=/^[cp]:[\w.:-]{1,32}$/,et={any:"any",selected:"selected"},xr="pin",So=5;function $o(e){try{return e.self!==e.top}catch{return!0}}function ko(e){let t=new URLSearchParams;return t.set(h.view,e.view),t.set(h.day,e.day),t.set(h.radius,String(e.radius)),t.set(h.oneSeatDay,e.oneSeatRestricted?et.selected:et.any),t.set(h.dest,"key"in e.dest?e.dest.key:on(e.dest)),e.weight==="riders"&&t.set(h.weight,e.weight),e.surfaceUnit==="people"&&t.set(h.surfaceUnit,e.surfaceUnit),e.at&&t.set(h.at,on(e.at)),e.camera&&t.set(h.camera,`${on(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(h.place,e.place),e.placeFill!==se&&t.set(h.placeFill,e.placeFill),e.selection.length&&t.set(h.selection,e.selection.join(",")),`?${t}`}function xo(e){let t=new URLSearchParams(e),n={},a=t.get(h.view);a&&bo.includes(a)&&(n.view=a);let o=t.get(h.day);o&&O.includes(o)&&(n.day=o);let s=Number(t.get(h.radius));t.has(h.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(h.weight)==="riders"?n.weight="riders":t.get(h.weight)==="locations"&&(n.weight="locations"),t.get(h.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(h.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(h.oneSeatDay);r===et.selected?n.oneSeatRestricted=!0:r===et.any&&(n.oneSeatRestricted=!1);let l=t.get(h.dest);if(l&&l!==xr){let x=Lo(l);x?n.dest=x:l.includes(",")||(n.dest={key:l})}let u=Lo(t.get(h.at));u&&(n.at=u);let p=_r(t.get(h.camera));p&&(n.camera=p);let m=t.get(h.place);m&&(n.place=m);let w=t.get(h.selection);w!==null&&(n.selection=w.split(",").filter(x=>kr.test(x)));let k=t.get(h.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function on(e){return`${e.lat.toFixed(So)},${e.lon.toFixed(So)}`}function Lo(e){let t=_o(e,2);return t?{lat:t[0],lon:t[1]}:null}function _r(e){let t=_o(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function _o(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var sn="embed";var Pr=["1","true","yes"];function Po(e){let t=new URLSearchParams(e).get(sn);return t!==null&&Pr.includes(t.toLowerCase())}function Oo(e){let t=new URLSearchParams(e);return t.set(sn,"1"),`?${t}`}function Do(e){let t=new URLSearchParams(e);t.delete(sn);let n=String(t);return n?`?${n}`:""}function Ro(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var z=["peek","half","full"],Or=192,Dr=.3,Rr=.55,Er=.9,Tr=.6,Cr=.45;function tt(e,t){return e==="peek"?Math.min(Or,t*Dr):e==="half"?t*Rr:t*Er}function Mr(e,t,n=0){let a=z.map(s=>Math.abs(tt(s,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>Tr&&(o=Math.max(0,Math.min(z.length-1,o+(n>0?1:-1)))),z[o]}function Eo(e){return z[(z.indexOf(e)+1)%z.length]}function Fr(e,t){return Math.min(e,t*Cr)}function re(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function rn(e){let t=null,n=()=>{let a=re();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var Nr=8,Ar=400;function To(e){let t=c("side"),n=c("sheet-handle"),a="peek",o=!1,s=0,r=0,l=0,u={y:0,t:0};function p(){return window.innerHeight}function m(y){t.style.height=`${y}px`,e.onMove(y,Fr(y,p()))}function w(y){a=y,t.dataset.snap=y,m(tt(y,p()))}n.addEventListener("pointerdown",y=>{re()&&(o=!0,s=y.clientY,r=t.getBoundingClientRect().height,l=y.timeStamp,u={y:y.clientY,t:y.timeStamp},t.classList.add("dragging"),n.setPointerCapture(y.pointerId))}),n.addEventListener("pointermove",y=>{if(!o)return;let Z=r+(s-y.clientY),_=tt("peek",p()),G=tt("full",p());m(Math.max(_,Math.min(G,Z))),u={y:y.clientY,t:y.timeStamp}});function k(y){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(y.clientY-s)>Nr)&&y.timeStamp-l<Ar){w(Eo(a));return}let _=y.timeStamp-u.t,G=_>0?(u.y-y.clientY)/_:0;w(Mr(t.getBoundingClientRect().height,p(),G))}n.addEventListener("pointerup",k),n.addEventListener("pointercancel",k),n.addEventListener("keydown",y=>{y.key!=="Enter"&&y.key!==" "||(y.preventDefault(),re()&&w(Eo(a)))});let x=rn(e.onLayoutChange);function I(){if(x(),!re()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}w(a)}return window.addEventListener("resize",I),I(),{at:()=>re()?a:"full",atLeast(y){re()&&z.indexOf(y)>z.indexOf(a)&&w(y)}}}var Br=[-79.9959,40.4406],Hr=12,jr="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},ve=xo(location.search),Le=Po(location.search);Le&&c("app").classList.add("embed");var Ir={at:()=>"full",atLeast(){}},Fo=null,P=400,we=null,f=null,le=null,Q=0,$={key:"downtown"},q=null,No=!1,de=!1,lt="locations",pe="area",Ao="count",rt=null,F=se,A=!1,g="dots",Bo,un=[],i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:ve.camera?[ve.camera.lon,ve.camera.lat]:Br,zoom:ve.camera?.zoom??Hr,cooperativeGestures:$o(window),attributionControl:{compact:!0}});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{wn(i),ea(i),da(i,"change-dots"),fa(i,"change-dots"),ka(i,"walk-fill"),Ya(i),lo(i,"change-dots"),N(),i.on("click",t=>{if(A)return;if(No){Se({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(g==="places"){let s=i.queryRenderedFeatures(t.point,{layers:[M]})[0];s&&at(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>i.getLayoutProperty(s,"visibility")!=="none"),a=i.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];gn(o[1],o[0])}),i.on("mouseenter",M,()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave",M,()=>{i.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=xt();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(aa(n.properties,L(),a.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=ae();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(Da(n.properties,a)).addTo(i)}),i.on("mouseleave",M,()=>e.remove()),i.on("mousemove",M,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(fo(n.properties,F,L())).addTo(i)}),ai(),i.on("moveend",()=>{let t=i.getCenter();Fo={lat:t.lat,lon:t.lng,zoom:i.getZoom()},b(),B()}),ie(D.radius,t=>{P=Number(t.dataset.radius),Dt(i,P,L()).then(b),Be()&&Ft(i,P,L()).then(b),He()&&Bt(P).then(b),ae()&&ot(),f&&ce(f.lat,f.lon)}),ie(D.day,t=>{let n=t.dataset.day;Mn(n),g!=="journey"&&N(),Rt(i,n),Nt(i,n),g==="journey"&&f&&dn(f.lat,f.lon),Je()&&ba(i,n).then(b),de&&ae()&&(ot(),f&&ce(f.lat,f.lon)),be()&&F==="service"&&Ze(i,F,n),b()}),ie(D.oneSeatDay,t=>{de=t.dataset.oneseatDay==="selected",cn(),ot(),f&&ce(f.lat,f.lon)}),ie(D.view,t=>{let n=g;g=t.dataset.view,i.setLayoutProperty("change-dots","visibility",g==="dots"||g==="both"?"visible":"none"),Yr(g==="surface"||g==="both"),Vr(g==="corridors"),Zr(g==="oneseat"),Qr(g==="journey",n==="journey"),qr(g==="places"),g!=="journey"&&n!=="journey"&&(g==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),Xr(g!=="corridors"&&g!=="journey"&&g!=="places");let a=g==="oneseat"||g==="journey";c("dest-controls").classList.toggle("hidden",!a),c("oneseat-day-controls").classList.toggle("hidden",g!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",g!=="places"),it()||Co(!1),ue(),cn(),a||st(!1),jo()}),ie(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){st(!0);return}st(!1),Se({key:n})}),ie(D.placeFill,t=>{F=t.dataset.placeFill,be()&&Ze(i,F,L()),N(),b(),cn()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){lt=n.dataset.weight,b(),B();return}let a=t.target.closest("[data-surface-unit]");if(a){pe=a.dataset.surfaceUnit,Wr(pe),B();return}let o=t.target.closest("[data-bucket]");o&&(ta(i,o.dataset.bucket,L()),b())}),c("legend-reset").addEventListener("click",()=>{na(i,L()),b()}),c("legend-select").addEventListener("click",()=>Co(!A)),c("legend-clear").addEventListener("click",()=>{Pt(i),ue(),b(),B()}),c("legend-collapse").addEventListener("click",()=>{ln(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&Se({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&ri(a.dataset.caveat);let o=t.target.closest("[data-select-place]");o&&at(o.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(Ao=s.dataset.sortPlaces,N());let r=t.target.closest("[data-goto-place]");r&&(g!=="places"&&X(D.view,"places"),at(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",Gr),Le&&rn(ln),Bo=Le?Ir:To({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),i.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:ln}),Jr(),ut(),ue(),ct(),Ur(ve)||Dt(i,P,L()).then(b),si(),oi()});function ie(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),ut(),B()})})}function X(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Ur(e){let t=!1;return e.radius!==void 0&&(t=X(D.radius,String(e.radius))||t),e.day&&(t=X(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&X(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(lt=e.weight),e.surfaceUnit&&(pe=e.surfaceUnit),e.placeFill&&X(D.placeFill,e.placeFill),e.dest&&("key"in e.dest?X(D.dest,e.dest.key):Se(e.dest)),e.selection&&Yn(i,e.selection),e.view&&X(D.view,e.view),e.at&&gn(e.at.lat,e.at.lon),e.place&&at(e.place),t}function B(){let e={view:g,day:L(),radius:P,oneSeatRestricted:de,weight:lt,surfaceUnit:pe,dest:$,at:f,camera:Fo,place:rt,placeFill:F,selection:zn()},t=ko(e);history.replaceState(null,"",(Le?Oo(t):t)+location.hash),ct(t)}function ct(e=Do(location.search)){if(!Le)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?le?ge(le):"this point":null;t.querySelector(".el-action").textContent=Ro(n)}function ut(){c("statebar").innerHTML=vo({view:g,day:L(),radius:P,oneSeatRestricted:de,destination:$e()}),zr()}function ln(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Jr(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function zr(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(wo(g)))}function Gr(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),i.resize()}function b(){Kr()}function Kr(){if(c("legend-reset").classList.toggle("hidden",jt()||zt()||qt()||be()),qt()){c("legend").innerHTML=Qa(Ve());return}if(be()){c("legend").innerHTML=ho({selected:oo(),fill:F,day:L(),boundaries:tn(),unchanged:so()});return}if(jt()){let n=Je();n&&Ta(c("legend"),n);return}if(zt()){let n=ae();if(!n)return;let a=i.getBounds();Ca(c("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=xt();if(!e)return;let t=i.getBounds();Fa(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:lt,surface:Mt()?Be():null,unit:pe,population:He(),selection:Jn()})}async function Yr(e){if(e&&!Be()){c("legend").classList.add("loading");try{await Ft(i,P,L())}finally{c("legend").classList.remove("loading")}}pa(i,e),e&&pe==="people"&&await Ho(),b()}async function Ho(){if(!He()){c("legend").classList.add("loading");try{await Bt(P)}finally{c("legend").classList.remove("loading")}}}async function Wr(e){e==="people"&&Mt()&&await Ho(),b()}async function Vr(e){if(e&&!Je()){c("legend").classList.add("loading");try{await It(i,L())}finally{c("legend").classList.remove("loading")}}wa(i,e),b()}async function qr(e){if(e&&(!en()||!tn())){c("legend").classList.add("loading");try{await Promise.all([co(),uo(i)])}finally{c("legend").classList.remove("loading")}}mo(i,e),e&&Ze(i,F,L()),e&&N(),b()}async function at(e){rt=await mn(()=>po(i,e))?e:null,g==="places"&&(N(),rt&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),B()}function Xr(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),ct(),g==="places"){c("panel").innerHTML=go(en()??[],Ao,rt,F);return}if(!le){g==="oneseat"?c("panel").innerHTML=jn($e()):Fn(c("panel"));return}if(g==="oneseat"){let t=Hn(le,$,L());if(t){c("panel").innerHTML=t;return}}Bn(le)}function Qr(e,t=!1){if(Wa(i,e),b(),!e){t&&(f?ce(f.lat,f.lon):N());return}Ve()&&f?c("panel").innerHTML=Qt(Ve(),$e()):c("panel").innerHTML=Xa($e())}async function dn(e,t){let n=++Q;f={lat:e,lon:t},B(),Uo(e,t);let a=Io(),o=d($e());if(!a){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(Va({lat:e,lon:t},a,L()));if(n!==Q)return;Xt(i,s),c("panel").innerHTML=Qt(s,o),b(),ct()}catch(s){if(n!==Q)return;Xt(i,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function cn(){c("day-controls").classList.toggle("hidden",!Pa(g,de,F))}function pn(){return _a(de,L())}async function Zr(e){e&&!ae()&&await mn(()=>Gt(i,P,$,pn())),Oa(i,e),b()}async function ot(){await mn(()=>Gt(i,P,$,pn())),b()}async function mn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function Se(e){if($=e,st(!1),ei(),jo(),ut(),B(),g==="journey"){f&&dn(f.lat,f.lon),b();return}f?ce(f.lat,f.lon):N({scrollToTop:!0}),ot()}function jo(){let e=Io();if(!(e!==null&&(g==="journey"||g==="oneseat"&&"lat"in $))){q?.remove(),q=null;return}q?q.setLngLat([e.lon,e.lat]).addTo(i):(q=new maplibregl.Marker({color:Jt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(i),q.on("dragend",()=>{let n=q.getLngLat();Se({lat:n.lat,lon:n.lng})}))}function ei(){let e=xa($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Io(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=un.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function $e(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return un.find(t=>t.key===e)?.name??e}function st(e){No=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function ce(e,t){let n=++Q;f={lat:e,lon:t},B(),c("panel").classList.add("loading"),Uo(e,t);try{let a="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",o=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${a}&oneseat_day=${pn()}`);if(n!==Q)return;vn(i,e,t,P,o.current.stops,o.proposed.stops),ti(),le=o,N({scrollToTop:!0})}catch(a){if(n!==Q)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===Q&&c("panel").classList.remove("loading")}}function ti(){c("pin-key").innerHTML=Ma(P),c("pin-key").classList.remove("hidden")}function Uo(e,t){we?we.setLngLat([t,e]):(we=new maplibregl.Marker({color:jr,draggable:!0}).setLngLat([t,e]).addTo(i),we.on("dragend",()=>{let n=we.getLngLat();gn(n.lat,n.lng)}))}var nt=14;function it(){return g==="dots"||g==="both"}function Co(e){A=e&&it(),A?i.dragPan.disable():i.dragPan.enable(),i.getCanvas().style.cursor=A?"none":"",A||Jo(),ue()}function ue(){let e=c("legend-select");e.classList.toggle("hidden",!it()),e.setAttribute("aria-pressed",String(A)),e.textContent=A?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!it()||!Gn())}function ni(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!A}function Mo(e){c("brush").classList.toggle("painting",e)}function Jo(){c("brush").hidden=!0}function ai(){let e=c("brush");e.style.width=`${nt*2}px`,e.style.height=`${nt*2}px`;let t=!1,n=!1,a=!1,o=()=>{a||(a=!0,requestAnimationFrame(()=>{a=!1,ue(),b()}))},s=()=>{A&&(t=!0,n=!1,Mo(!0))},r=u=>{if(ni(u.point.x,u.point.y),!t)return;n=!0,_t(i,Ot(i,u.point.x,u.point.y,nt))&&o()},l=u=>{if(Mo(!1),!!t){if(t=!1,!n){let[p]=Ot(i,u.point.x,u.point.y,nt);p&&Kn(i,p)}ue(),b(),B()}};i.on("mousedown",s),i.on("mousemove",r),i.on("mouseup",l),i.getCanvas().addEventListener("mouseleave",Jo),i.on("touchstart",s),i.on("touchmove",r),i.on("touchend",l)}function gn(e,t){if(Bo.atLeast("half"),g==="journey"){dn(e,t);return}g!=="places"&&ce(e,t)}async function oi(){try{un=await S("/api/destinations"),ut()}catch{}}async function si(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function ri(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
