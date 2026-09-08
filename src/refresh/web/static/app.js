"use strict";(()=>{function c(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function S(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function d(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Z(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function yt(e){if(e==null)return"\u2014";let t=Math.floor(e/60),n=Math.round(e%60);return t?`${t}h ${String(n).padStart(2,"0")}m`:`${n}m`}function gt(e){return e>0?`+${e}`:String(e)}function Sn(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var ts="#4aa3ff",ns="#ffa23a";function os(e,t,n,o=96){let a=[],s=n/111320,r=n/(111320*Math.cos(e*Math.PI/180));for(let l=0;l<=o;l++){let u=l/o*2*Math.PI;a.push([t+r*Math.cos(u),e+s*Math.sin(u)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function ee(e){return{type:"FeatureCollection",features:e}}function Ln(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function $n(e){e.addSource("walk",{type:"geojson",data:ee([])}),e.addSource("stops-now",{type:"geojson",data:ee([])}),e.addSource("stops-prop",{type:"geojson",data:ee([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":ns,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":ts,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let s=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${s.name}</b><br>${s.side==="current"?"today":"proposed"}
                  \xB7 stop ${s.stop_id} \xB7 ${s.metres} m`).addTo(e)})}function kn(e,t,n,o,a,s){e.getSource("walk").setData(ee([os(t,n,o)])),e.getSource("stops-now").setData(ee(Ln(a,"current"))),e.getSource("stops-prop").setData(ee(Ln(s,"proposed")))}var x=["weekday","saturday","sunday"],ft=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],xn={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},Oe=4,_n=e=>4+Oe*e,Pn=e=>5+Oe*e,ye=e=>6+Oe*e,as=e=>7+Oe*e;var ss=3,ht=e=>e[ss],V=(e,t)=>e[t],Dn=(e,t)=>e[as(t)],bt=e=>2+2*e,vt=e=>3+2*e,Re=4,On=e=>2+Re*e,Rn=e=>3+Re*e,Tn=e=>4+Re*e,En=e=>5+Re*e;var St="weekday";function L(){return St}function Hn(e){St=e}function Bn(e){e.innerHTML=`
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
    </div>`}function rs(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function is(e,t){let n=Math.max(1,...ft.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return ft.map(o=>{let a=e.periods[o]??0,s=t.periods[o]??0,r=s-a,l=r>0?"up":r<0?"down":"flat";return`
      <tr>
        <th>${xn[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${s/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${s}</td>
        <td class="n ${l}">${r===0?"\xB7":gt(r)}</td>
      </tr>`}).join("")}function jn(e){return e.length?e.map(t=>`<span class="route">${d(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Cn(e){return e.first==null?'<span class="muted">no service</span>':`${Z(e.first)}\u2013${Z(e.last)}`}function Mn(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var ls={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},cs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function us(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':Ce(o.current,o.proposed);return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${d(o.name)}</span>
          <span class="os-status ${d(o.status)}">${ls[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${a}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${cs[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${Ee("one-seat")}</p>
    </div>`:""}function Ee(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Te(e,t,n=null){let o=e===t?" same":"",a=n?` ${n}`:"";return`<dd class="cmp${o}"><span class="cmp-a">${e}</span><span class="cmp-arrow muted">\u2192</span><span class="cmp-b${a}">${t}</span></dd>`}function An(e,t,n){return e==null||t==null||e===t?null:t>e===(n==="more")?"better":"worse"}function Fn(e){return e.first==null||e.last==null?null:e.last-e.first}function Ce(e,t){let n=new Set(e.filter(o=>t.includes(o)));return`<div class="rpair">
      <div class="rside"><span class="rlab">today</span>
        ${Nn(e,n,"now")}</div>
      <div class="rside"><span class="rlab">proposed</span>
        ${Nn(t,n,"prop")}</div>
    </div>`}function Nn(e,t,n){return e.length?e.map(o=>`<span class="route ${t.has(o)?"both":`only-${n}`}">${d(o)}</span>`).join(" "):'<span class="muted">none</span>'}var wt=/\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$/,ds="Allegheny";function ge(e){let t=e.place?.muni?.trim()??"",n=wt.exec(t)?.[1],o=n===ds?t.replace(wt,""):n?`${t.replace(wt,"")} (${n})`:t;return e.place?.hood||o||"this location"}function Lt(e){return e==="weekday"?"weekday":e}function In(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Lt(t)}`}function ps(e,t){if(!e)return"";let n=e.measured+e.unmeasured,o=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Lt(t)}, today only</span>`}${o}</dd>`}function ms(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${Ee("boardings")}</p>`}function ys(e){if(!e)return"";let t=d(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
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
        move with the day above.${Ee("place-population")}</p>
    </div>`}function $t(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],s=a.trips-o.trips,r=s>0?"up":s<0?"down":"flat",l=Mn(o),u=Mn(a),p=Fn(o),m=Fn(a);return`
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
        ${s===0?"no change":`${gt(s)} trips`}
        <div class="muted">${Sn(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Lt(t)}, both directions</div>

    <div class="tiers">${rs(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${is(o,a)}</tbody>
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
      ${Te(Cn(o),Cn(a))}
      <dt>Hours between</dt>
      ${Te(yt(p),yt(m),An(p,m,"more"))}
      <dt>Typical wait</dt>
      ${Te(l==null?"\u2014":`${l} min`,u==null?"\u2014":`${u} min`,An(l,u,"less"))}
      <dt>Stops within ${e.radius} m</dt>
      ${Te(String(e.current.stops.length),String(e.proposed.stops.length))}
      ${ps(o.boardings,t)}
    </dl>
    ${ms(o.boardings)}

    ${n}

    ${ys(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      ${Ce(o.routes,a.routes)}
      <p class="note"><span class="k-now">Blue</span> runs here only today,
         <span class="k-prop">orange</span> only under the plan,
         <span class="k-shared">grey</span> both. Renumbering is not
         replacement: the 61A\u2013D become the
         60X/61X/62X.${Ee("location-not-route")}</p>
    </div>`}function Un(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${d(ge(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${$t(e,St,us(e.oneseat??[],e.oneseat_day??"any"))}`}var gs={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},fs={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},hs={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function bs(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function kt(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${jn(t)}</div>`:""}function vs(e){let t=kt("kept",e.kept)+kt("lost",e.lost)+kt("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function ws(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      ${Ce(e.current,e.proposed)}
    </div>`}function Ss(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${d(a.key)}">
      <span class="os-name">${d(a.name)}</span>
      <span class="os-status ${d(a.status)}">${Ls[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Ls={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function $s(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${hs[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Jn(e,t,n){let o=bs(e,t);if(!o)return"";let a=e.oneseat_day??"any",s=o.status==="here"?"":vs(o)+ws(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${d(o.name)}</h2>
      <div class="muted">
        from ${d(ge(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${d(o.status)}">${gs[o.status]}</div>
    <p class="note">${fs[o.status]} ${$s(a)}</p>

    ${s}

    ${Ss(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${In(e,n)}</summary>
      ${$t(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function zn(e){return`
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
    </div>`}var Fe={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#996cb4",size:3},doubled:{color:"#bd60e7",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Ne="change",he="change-dots",Me=["boolean",["feature-state","selected"],!1],ks="#15181e",Ae=null,te=new Set,M=new Set;function xt(){return Ae}function _t(e){return te.has(e)}function Gn(e,t,n,o){return a=>Ps(a,e,t,n,o)}function Vn(e){return t=>e.has(ht(t))}function Yn(){return M}function Kn(){return[...M].sort()}function Wn(){return M.size}function Pt(e,t){let n=0;for(let o of t)M.has(o)||(M.add(o),be(e,o,!0),n++);return n}function qn(e,t){M.delete(t)?be(e,t,!1):(M.add(t),be(e,t,!0))}function Xn(e,t){Dt(e),Pt(e,t)}function Dt(e){for(let t of M)be(e,t,!1);M.clear()}function be(e,t,n){try{e.setFeatureState({source:Ne,id:t},{selected:n})}catch{}}function xs(e){for(let t of M)be(e,t,!0)}function _s(e,t,n,o){let a=n*n;return o.filter(s=>(s.x-e)**2+(s.y-t)**2<=a).map(s=>s.id)}function Ot(e,t,n,o){let a=[[t-o,n-o],[t+o,n+o]],s=e.queryRenderedFeatures(a,{layers:[he]}).filter(r=>r.id!==void 0).map(r=>{let[l,u]=r.geometry.coordinates,p=e.project([l,u]);return{id:r.id,x:p.x,y:p.y}});return _s(t,n,o,s)}function Qn(e,t,n,o){let a={};for(let s of n)a[s]=0;for(let s of e){if(!o(s))continue;let r=n[V(s,ye(t))];r!==void 0&&a[r]++}return a}function Ps(e,t,n,o,a){let s=V(e,0),r=V(e,1);return s>=n&&s<=a&&r>=t&&r<=o}function Zn(e,t,n,o){let a={riders:{},measured:{},unmeasured:0};for(let s of n)a.riders[s]=0,a.measured[s]=0;for(let s of e){if(!o(s))continue;let r=n[V(s,ye(t))];if(r===void 0)continue;let l=Dn(s,t);if(l===null){r!=="none"&&a.unmeasured++;continue}a.riders[r]+=l,a.measured[r]++}return a}function Ds(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((o,a)=>t[V(n,ye(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{id:ht(n),published:n[2],...Object.fromEntries(x.flatMap((o,a)=>[[`b${a}`,t[V(n,ye(a))]],[`c${a}`,n[_n(a)]],[`p${a}`,n[Pn(a)]]]))}}))}}function fe(e,t){let n=Object.entries(Fe).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,Fe.none[t]]}function eo(e){return["interpolate",["linear"],["zoom"],9,["*",fe(e,"size"),.45],12,fe(e,"size"),16,["*",fe(e,"size"),1.9]]}function to(e){e.addSource(Ne,{type:"geojson",promoteId:"id",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:he,type:"circle",source:Ne,paint:{"circle-color":fe(0,"color"),"circle-radius":eo(0),"circle-opacity":.85,"circle-stroke-color":["case",Me,ks,"rgba(255,255,255,.9)"],"circle-stroke-width":["interpolate",["linear"],["zoom"],9,["case",Me,1.6,.5],12,["case",Me,2.4,1],16,["case",Me,3.2,1.6]]}},"walk-fill")}async function Rt(e,t,n){return Ae=await S(`/api/change?radius=${t}`),e.getSource(Ne).setData(Ds(Ae)),xs(e),Tt(e,n),Ae}function Tt(e,t){let n=x.indexOf(t);e.setPaintProperty(he,"circle-color",fe(n,"color")),e.setPaintProperty(he,"circle-radius",eo(n)),Et(e,t)}function no(e,t,n){te.has(t)?te.delete(t):te.add(t),Et(e,n)}function oo(e,t){te.clear(),Et(e,t)}function Et(e,t){let n=x.indexOf(t),o=["none",...te];e.setFilter(he,["!",["in",["get",`b${n}`],["literal",o]]])}function ao(e,t,n){let o=x.indexOf(t),a=e[`b${o}`],s=n.find(p=>p.key===a)?.label??a,r=e[`c${o}`],l=e[`p${o}`];return`<b>${s}</b><br>${r} \u2192 ${l} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Ct="surface",Be="surface-fill",so="#6b7280",Mt=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,so],[.138,so],[1,"#bd60e7"],[2,"#961bed"]],T="#e8232f",O="#0f79c9",ro=2,He=null,io=!1;function je(){return He}function At(){return io}function lo(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-ro,Math.min(ro,n))}function co(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function uo(e,t,n,o,a,s,r,l){let u={gone:0,less:0,same:0,more:0,new:0};for(let p of e){let m=r.lat0+(p[1]+.5)*r.dlat,v=r.lon0+(p[0]+.5)*r.dlon;if(m<o||m>s||v<n||v>a)continue;let _=p[bt(t)],k=p[vt(t)],D=co(_,k);if(D!=="none")if(D==="ramp"){let g=lo(_,k);u[g<-.138?"less":g>.138?"more":"same"]+=l}else u[D]+=l}return u}function Os(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(s=>{let r=t+s[1]*o,l=r+o,u=n+s[0]*a,p=u+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[u,r],[p,r],[p,l],[u,l],[u,r]]]},properties:Object.fromEntries(x.flatMap((m,v)=>{let _=s[bt(v)],k=s[vt(v)];return[[`k${v}`,co(_,k)],[`v${v}`,lo(_,k)??0]]}))}})}}function po(e){return["case",["==",["get",`k${e}`],"gone"],T,["==",["get",`k${e}`],"new"],O,["interpolate",["linear"],["get",`v${e}`],...Mt.flatMap(([t,n])=>[t,n])]]}function ne(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function mo(e,t){e.addSource(Ct,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Be,type:"fill",source:Ct,layout:{visibility:"none"},paint:{"fill-color":po(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,ne(0,.85),13,ne(0,.62),16,ne(0,.45)]}},t)}async function Ft(e,t,n){return He=await S(`/api/surface?radius=${t}`),e.getSource(Ct).setData(Os(He)),Nt(e,n),He}function Nt(e,t){let n=x.indexOf(t);e.setPaintProperty(Be,"fill-color",po(n)),e.setPaintProperty(Be,"fill-opacity",["interpolate",["linear"],["zoom"],9,ne(n,.85),13,ne(n,.62),16,ne(n,.45)])}function yo(e,t){io=t,e.setLayoutProperty(Be,"visibility",t?"visible":"none")}var Ht=null;function Ie(){return Ht}async function Bt(e){return Ht=await S(`/api/population?radius=${e}`),Ht}function go(e,t,n,o,a,s,r){let l={lost:0,gained:0,kept:0,none:0};for(let u of e){let p=r.lat0+(u[1]+.5)*r.dlat,m=r.lon0+(u[0]+.5)*r.dlon;p<o||p>s||m<n||m>a||(l.lost+=u[On(t)],l.gained+=u[Rn(t)],l.kept+=u[Tn(t)],l.none+=u[En(t)])}return l}var jt="corridor",fo="corridor-lines",ze="#8b929c",Rs="#6f7783",Je={lost:T,added:O,kept:ze};var Ue=null,ho=!1;function Ge(){return Ue}function It(){return ho}function Ts(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function bo(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Es(){let e=t=>["match",["get","klass"],"lost",Je.lost,"added",Je.added,t];return["interpolate",["linear"],["zoom"],9,e(Rs),14,e(ze)]}function Cs(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Ms(){return["match",["get","klass"],"kept",.85,.9]}function vo(e,t){e.addSource(jt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:fo,type:"line",source:jt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Es(),"line-width":Cs(),"line-opacity":Ms()}},t)}async function Ut(e,t){return Ue=await S(`/api/corridors?day=${t}`),e.getSource(jt).setData(Ts(Ue)),Ue}async function wo(e,t){x.includes(t)&&await Ut(e,t)}function So(e,t){ho=t,e.setLayoutProperty(fo,"visibility",t?"visible":"none")}var Jt="added-stops",ve="added-stop-rings",zt=O,As="#ffffff",Ve=null,Lo=!1;function Gt(){return Ve}function $o(){return Lo}function Fs(e){return{type:"FeatureCollection",features:e.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{stop_id:t.stop_id,name:t.name,routes:t.routes.join(", "),...Object.fromEntries(x.map(n=>[n,t.trips[n]??0]))}}))}}function ko(e,t,n,o,a){return e.filter(s=>s.lon>=t&&s.lon<=o&&s.lat>=n&&s.lat<=a).length}function Ns(e,t){let n=Number(e[t]??0);return`<b>${e.name}</b><br>a stop the plan adds \xB7 route ${e.routes}
    <br>${n} ${n===1?"call":"calls"} on a ${t==="weekday"?"weekday":t==="saturday"?"Saturday":"Sunday"}`}function Hs(){return["interpolate",["linear"],["zoom"],9,2.5,13,4.5,16,7]}function Bs(){return["interpolate",["linear"],["zoom"],9,1,13,1.6,16,2.4]}function xo(e,t){e.addSource(Jt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ve,type:"circle",source:Jt,layout:{visibility:"none"},paint:{"circle-radius":Hs(),"circle-color":As,"circle-opacity":.95,"circle-stroke-width":Bs(),"circle-stroke-color":zt}},t)}async function _o(e){return Ve=await S("/api/added-stops"),e.getSource(Jt).setData(Fs(Ve)),Ve}function Po(e,t){Lo=t,e.setLayoutProperty(ve,"visibility",t?"visible":"none")}function Do(e,t){let n=new maplibregl.Popup({closeButton:!1,offset:10});e.on("mouseenter",ve,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",ve,()=>{e.getCanvas().style.cursor="",n.remove()}),e.on("mousemove",ve,o=>{let a=o.features?.[0];a&&n.setLngLat(o.lngLat).setHTML(Ns(a.properties,t())).addTo(e)})}var Yt="#2b3038",Oo="#b9bec6",we={loses:{color:T,size:6},gains:{color:O,size:6},keeps:{color:ze,size:3},here:{color:Yt,size:3.5},none:{color:Oo,size:1.8}},Ke=["loses","gains","keeps","none","here"],Vt="oneseat",Ro="oneseat-dots",Ye=null,To=!1;function oe(){return Ye}function Kt(){return To}function Eo(e,t,n,o,a,s){let r={};for(let l of t)r[l]=0;for(let l of e){let u=l[0],p=l[1];if(u<o||u>s||p<n||p>a)continue;let m=t[l[3]];m!==void 0&&r[m]++}return r}function js(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Is(){return["match",["get","status"],...Object.entries(we).flatMap(([e,t])=>[e,t.color]),Oo]}function Us(){let e=["match",["get","status"],...Object.entries(we).flatMap(([t,n])=>[t,n.size]),we.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Co(e,t){e.addSource(Vt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Ro,type:"circle",source:Vt,layout:{visibility:"none"},paint:{"circle-color":Is(),"circle-radius":Us(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Js(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var zs="pin";function Mo(e){return"key"in e?e.key:zs}var We="any";function Gs(e,t,n){return`radius=${e}&${Js(t)}&day=${n}`}function Ao(e,t){return e?t:We}function Fo(e,t,n){return e==="places"?n==="service":e!=="oneseat"||t}async function Wt(e,t,n,o=We){return Ye=await S(`/api/oneseat?${Gs(t,n,o)}`),e.getSource(Vt).setData(js(Ye)),Ye}function No(e,t){To=t,e.setLayoutProperty(Ro,"visibility",t?"visible":"none")}function qt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Ho(e,t){let n=t.statuses.find(l=>l.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),s=l=>l.length?l.join(", "):"none",r=qt(t);return e.status==="here"?`<b>at ${r}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${r}<br>today: ${s(o)}<br>proposed: ${s(a)}`}var Xt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Vs(e){return e.buckets.filter(t=>t.key!=="none")}var Bo={area:"Ground",people:"People"};function Ys(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=uo(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),s=r=>r.toFixed(r<10?1:0);return`
      <div class="lg-area">
        <span><b>${s(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${s(a.less)}</b> km\xB2 less</span>
        <span><b>${s(a.more)}</b> km\xB2 more</span>
        <span><b>${s(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function Ks(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=go(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),s=r=>Math.round(r).toLocaleString();return`
      <div class="lg-area">
        <span><b>${s(a.lost)}</b> people lose all service</span>
        <span><b>${s(a.gained)}</b> gain service</span>
        <span><b>${s(a.kept)}</b> keep a bus</span>
        <span><b>${s(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}var Ws=`
      <div class="lg-ends" style="margin-top:6px">Ground and people are
        measured across the view, not the stops you selected \u2014 a 100 m cell
        has no stop to select. Clear the selection to count them.</div>`;function qs(e){let{layer:t,day:n,bounds:o,unit:a,population:s,scoped:r=!1}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Mt.map(([u,p])=>`${p} ${((u+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${T}"></i>loses all service</span>
        <span><i style="background:${O}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Bo).map(u=>`
          <button data-surface-unit="${u}" aria-pressed="${a===u}"
                  class="${a===u?"active":""}">${Bo[u]}</button>`).join("")}
      </div>
      ${r?Ws:a==="people"?Ks(n,o,s):Ys(t,n,o)}
    </div>`}var Xs=["lost","added","kept"],Qs={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},Zs={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Io(e,t){let{lostPct:n,addedPct:o}=bo(t.km),a=l=>l.toFixed(1),r=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${r}</b> km of street, citywide \u2014 ${Zs[t.day]}
    </div>
    ${Xs.map(l=>`
      <div class="lg-row lg-static">
        <i style="background:${Je[l]}"></i>
        <span class="lg-lab">${d(Qs[l])}</span>
        <span class="lg-n">${a(t.km[l])} km</span>
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
      what you can still reach on foot.</div>`}function Uo(e,t,n){let o=t.statuses.map(m=>m.key),a=Eo(t.points,o,n.west,n.south,n.east,n.north),s=m=>t.statuses.find(v=>v.key===m)?.label??m,r=Ke.reduce((m,v)=>m+(a[v]??0),0),l=qt(t),u=t.day&&t.day!==We,p=u?`Restricted to routes running on ${Xt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${d(l)}</b>
      <span class="muted">\xB7 ${r.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${u?` \xB7 ${Xt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${Ke.map(m=>`
      <div class="lg-row lg-static">
        <i style="background:${we[m].color}"></i>
        <span class="lg-lab">${d(s(m))}</span>
        <span class="lg-n">${(a[m]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${Ke.map(m=>`${(t.counts[m]??0).toLocaleString()} ${d(s(m))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${d(l)} without transferring?
      ${p} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Jo(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var jo={locations:"Locations",riders:"Riders"};function er(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function tr(e){return`<div class="lg-foot">Dots mark the places a bus stops today, plus the
    ground the plan adds a bus to where nothing stops within the walk radius
    now. So a stop the plan adds beside one that already exists changes a dot's
    colour rather than adding one &mdash; ${e?"the rings are those stops themselves. Streets colours the pavement.":"Streets colours the pavement itself, and shows the rest."}</div>`}function nr(e,t,n,o){let a=n?e.length:ko(e,t.west,t.south,t.east,t.north);return`
    <button class="lg-row ${o?"":"off"}" data-added-stops
            aria-pressed="${o}">
      <i class="lg-ring" style="box-shadow:inset 0 0 0 2px ${zt}"></i>
      <span class="lg-lab">stop the plan adds${n?" (citywide)":""}</span>
      <span class="lg-n">${a.toLocaleString()}</span>
    </button>`}function zo(e,t){let{layer:n,day:o,bounds:a,weight:s,surface:r,unit:l="area",population:u,selection:p,added:m,addedVisible:v=!1}=t,_=n.buckets.map(w=>w.key),k=n.days.indexOf(o),{west:D,south:g,east:De,north:Q}=a,I=Vs(n),C=p&&p.size>0?p:null,wn=C?Vn(C):Gn(D,g,De,Q),mt=Qn(n.points,k,_,wn),G=s==="riders"?Zn(n.points,k,_,wn):null,Qa=w=>G?G.measured[w]?Math.round(G.riders[w]).toLocaleString():"\u2014":mt[w].toLocaleString(),Za=C?`at ${C.size.toLocaleString()} selected stop${C.size===1?"":"s"}`:"in view",es=G?`<b>${Math.round(I.reduce((w,me)=>w+G.riders[me.key],0)).toLocaleString()}</b> daily boardings ${Za}`:C?`<b>${I.reduce((w,me)=>w+mt[me.key],0).toLocaleString()}</b>
         of ${C.size.toLocaleString()} selected stops`:`<b>${I.reduce((w,me)=>w+mt[me.key],0).toLocaleString()}</b>
         locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${es}
      <span class="muted">\xB7 ${Xt[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(jo).map(w=>`
        <button data-weight="${w}" aria-pressed="${s===w}"
                class="${s===w?"active":""}">${jo[w]}</button>`).join("")}
    </div>
    ${I.map(w=>`
      <button class="lg-row ${_t(w.key)?"off":""}" data-bucket="${d(w.key)}"
              aria-pressed="${!_t(w.key)}">
        <i style="background:${Fe[w.key]?.color??"#666"}"></i>
        <span class="lg-lab">${d(w.label)}</span>
        <span class="lg-n">${Qa(w.key)}</span>
      </button>`).join("")}
    ${m?nr(m,a,!!C,v):""}
    ${r?qs({layer:r,day:o,bounds:a,unit:l,population:u,scoped:!!C}):""}
    ${G?er(G.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}
    ${tr(v)}
    ${C?`
    <div class="lg-foot">These are the stops you painted, not everything on
      screen \u2014 a selection you chose by hand, so quote it as one. The link in
      your address bar carries it.</div>`:""}`}var Qt="#4aa3ff",Xo="#ffa23a",Zt="headline",qe="journey",Qo="journey-rides",Zo="journey-walks",or=[Qo,Zo],ea=null,ta=!1;function Qe(){return ea}function en(){return ta}function ar(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let s=n[a].itinerary;if(s)for(let r of s.legs){let l=r.from??e.origin,u=r.to??e.destination,p=[[l.lon,l.lat],[u.lon,u.lat]],m=r.path?.length?r.path:p;o.push({type:"Feature",geometry:{type:"LineString",coordinates:m},properties:{side:a,kind:r.kind,route:r.route}})}}return{type:"FeatureCollection",features:o}}function Go(){return["match",["get","side"],"current",Qt,"proposed",Xo,Qt]}function Vo(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function na(e,t){e.addSource(qe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Qo,type:"line",source:qe,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Go(),"line-width":Vo(1),"line-opacity":.85}},t),e.addLayer({id:Zo,type:"line",source:qe,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Go(),"line-width":Vo(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function oa(e,t){ta=t;for(let n of or)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function tn(e,t){ea=t;let n=t?ar(t,Zt):{type:"FeatureCollection",features:[]};e.getSource(qe).setData(n)}function aa(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Yo=e=>`${e.toFixed(1)} min`;function sa(e){return e==null?"\u2014":e===0?"no change":e>0?`${Yo(e)} slower`:`${Yo(-e)} faster`}function Ko(e,t){return e?e.name?d(e.name):`stop ${d(e.stop_id)}`:t}function sr(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Ko(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${d(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Ko(e.to,"the destination")}</span></div>`}function Wo(e,t){let n=[],o=null;for(let a of e.legs){let s=o?Math.round(a.depart-o.arrive):0;s>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${s} min</span></div>`),n.push(sr(a,t)),o=a}return n.join("")}var rr={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Xe(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function ir(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function lr(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Xe(t.current)} \u2192
        ${Xe(t.proposed)} min</span>
        <span class="muted">${sa(t.change_min)}</span></div>
      ${o}
    </div>`}function qo(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function nn(e,t){let n=e.radii[Zt],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
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
        <p>${rr[n.classification]??""}</p>
      </div>
      ${qo(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Xe(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Xe(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${sa(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${ir(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Wo(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Wo(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${lr(e)}
    ${qo(e)}`}function ra(e){return`
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
    </div>`}function ia(e){let t=e?e.radii[Zt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${Qt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Xo}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var tt="places",ua="places-points",on="places-boundaries",A="places-fill",se="lost",cr=100,ur={lost:"share_lost",gained:"share_gained"};function J(e,t){return`service_${e}_${t}`}var da={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},dr="Every one of Allegheny County's 1,238,177 residents is in a named place: places are assigned by boundary, not by distance to a labelled stop, so nobody here goes unnamed. Every figure is Allegheny-only and day-free \u2014 losing all buses on any day of the week \u2014 so it does not move with the toolbar's day switch. A place with under 100 residents is shown without a share: a denominator that small cannot carry one.",Y={lost:T,gained:O},Ze=null,U=null,ae=null,pa=!1,et=null;function an(){return Ze}function ma(){return U}function ya(){return et}function sn(){return ae}function Se(){return pa}function pr(e,t){let n=[...e];return t==="count"?n.sort((o,a)=>a.residents_lost-o.residents_lost):n.sort((o,a)=>(a.share_lost??-1)-(o.share_lost??-1))}function mr(e){return e.residents_gained>e.residents_lost?"gained":"lost"}function yr(e){return Math.max(e.residents_lost,e.residents_gained)}var la=4,gr=16,fr=1e3;function hr(e){let t=Math.min(1,Math.sqrt(e/fr));return la+t*(gr-la)}function br(e){return{type:"FeatureCollection",features:e.changed.map(t=>({type:"Feature",geometry:{type:"Point",coordinates:[t.lon,t.lat]},properties:{geoid:t.geoid,klass:mr(t),residents_lost:t.residents_lost,residents_gained:t.residents_gained,radius:hr(yr(t))}}))}}function vr(){return["match",["get","klass"],"lost",Y.lost,"gained",Y.gained,Y.lost]}function wr(){return["interpolate",["linear"],["zoom"],9,["*",["get","radius"],.5],12,["get","radius"],16,["*",["get","radius"],1.6]]}var B=[{max:0,label:"No loss, or too few residents to share",opacity:0},{max:.05,label:"Up to 5%",opacity:.15},{max:.15,label:"5\u201315%",opacity:.35},{max:.3,label:"15\u201330%",opacity:.55},{max:null,label:"Over 30%",opacity:.8}];var j=[{max:10,opacity:0},{max:30,opacity:.3},{max:60,opacity:.55},{max:1/0,opacity:.8}];function ga(e,t){return e==="service"?["step",["abs",["coalesce",["get",J(t,"pct")],0]],j[0].opacity,j[0].max,j[1].opacity,j[1].max,j[2].opacity,j[2].max,j[3].opacity]:["step",["coalesce",["get",ur[e]],0],B[0].opacity,Number.EPSILON,B[1].opacity,B[1].max,B[2].opacity,B[2].max,B[3].opacity,B[3].max,B[4].opacity]}function fa(e,t){return e==="service"?["case",[">=",["coalesce",["get",J(t,"pct")],0],0],O,T]:Y[e]}function Sr(e,t){let n=J(t,"now"),o=J(t,"proposed");return e.features.filter(a=>a.properties[n]===0&&a.properties[o]>0).map(a=>a.properties.place)}var Lr=3;function $r(e){if(e.length===0)return"";let t=e.slice(0,Lr),n=e.length-t.length,o=t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`,a=n>0?`${o} (and ${n} more)`:o;return e.length===1?`1 place gets its first bus and cannot be shown as a percentage: ${a}.`:`${e.length} places get their first bus and cannot be shown as a percentage: ${a}.`}function ha(e,t){e.addSource(on,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:A,type:"fill",source:on,layout:{visibility:"none"},paint:{"fill-color":fa(se),"fill-opacity":ga(se),"fill-outline-color":"rgba(255,255,255,.25)"}},t),e.addSource(tt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ua,type:"circle",source:tt,layout:{visibility:"none"},paint:{"circle-color":vr(),"circle-radius":wr(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function nt(e,t,n){e.setPaintProperty(A,"fill-color",fa(t,n)),e.setPaintProperty(A,"fill-opacity",ga(t,n))}async function ba(){return Ze||(Ze=await S("/api/places")),Ze}async function va(e){return ae||(ae=await S("/api/boundaries"),e.getSource(on).setData(ae)),ae}function kr(e,t){let n=e?.features.find(o=>o.properties.key===t);return n&&n.properties.changed_block_groups===0?n.properties.place:null}async function wa(e,t){let n=kr(ae,t);if(n)return U=null,et=n,e.getSource(tt)?.setData({type:"FeatureCollection",features:[]}),null;try{U=await S(`/api/places/${encodeURIComponent(t)}`)}catch{return U=null,et=null,null}return et=null,e.getSource(tt).setData(br(U)),e.flyTo({center:[U.lon,U.lat],zoom:13}),U}function Sa(e,t){pa=t,e.setLayoutProperty(ua,"visibility",t?"visible":"none"),e.setLayoutProperty(A,"visibility",t?"visible":"none")}function xr(e,t){let n=e.share_lost==null?`<span class="place-share muted" title="Too few residents here to put a share on: this place's measured population is under 100.">\u2014</span>`:`<span class="place-share muted">${(e.share_lost*100).toFixed(1)}% of the place</span>`;return`
    <button type="button" class="place-row${t?" selected":""}"
            data-select-place="${d(e.key)}">
      <span class="place-name">${d(e.place)}</span>
      <span class="place-figs">
        <span class="place-lost">${Math.round(e.residents_lost).toLocaleString()} lost</span>
        ${n}
        ${e.residents_gained?`<span class="place-gained">${Math.round(e.residents_gained).toLocaleString()} gained</span>`:""}
      </span>
    </button>`}var _r="Unlike the two residents readings above, this one moves with the toolbar's day switch: it is asking about the plan's actual weekday, Saturday or Sunday service, not residents' day-free losses and gains.";function La(e,t,n,o){let a=pr(e,t).map(s=>xr(s,s.key===n)).join("");return`
    <div class="place-head">
      <h2>Places</h2>
      <div class="muted">${e.length.toLocaleString()} named places the plan changes</div>
    </div>
    <p class="note">${dr}</p>
    ${o==="service"?`<p class="note">${_r}</p>`:""}
    <div class="seg place-sort">
      <button type="button" data-sort-places="count"${t==="count"?' class="active"':""}>By count</button>
      <button type="button" data-sort-places="share"${t==="share"?' class="active"':""}>By share</button>
    </div>
    <div class="place-list">${a}</div>`}function $a(e,t){return e?`<div class="lg-head"><b>${d(e.place)}</b>
        <span class="muted">\xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span></div>`:t?`<div class="lg-head"><b>${d(t)}</b>
        <span class="muted">\xB7 the plan changes nothing here</span></div>
      <div class="lg-foot muted">No block group in it loses or gains all
        service. Shaded places are the ones with something to show.</div>`:'<div class="lg-head">Click a place to see its changed block groups</div>'}function Pr(e,t){return e.max===1/0?`Over ${t}%`:`${t}\u2013${e.max}%`}function Dr(e,t,n,o){let a=j.map((u,p)=>({band:u,prevMax:p===0?0:j[p-1].max})).filter(({band:u})=>u.opacity>0).flatMap(({band:u,prevMax:p})=>{let m=Pr(u,p);return[`<div class="lg-row lg-static">
          <i style="background:${T};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} fewer trips</span></div>`,`<div class="lg-row lg-static">
          <i style="background:${O};opacity:${u.opacity};border-radius:2px"></i>
          <span class="lg-lab">${d(m)} more trips</span></div>`]}).join(""),s=o?Sr(o,n):[],r=$r(s),l=r?`<div class="lg-foot">${d(r)}</div>`:"";return`
    ${$a(e,t)}
    <div class="lg-lab">Fill \u2014 percent change in the place's own bus trips
      on ${d(da[n])}</div>
    ${a}
    ${l}
    <div class="lg-foot">Fill is signed: red where a place's own trips fall,
      blue where they rise, by how much. Unlike the two residents readings,
      this one moves with the toolbar's day switch. Click a place to select
      it.</div>`}function ka({selected:e,fill:t,day:n,boundaries:o,unchanged:a}){if(t==="service")return Dr(e,a??null,n,o??null);let s=t==="lost"?"lose all buses":"gain a bus",r=B.filter(l=>l.opacity>0).map(l=>`
    <div class="lg-row lg-static">
      <i style="background:${Y[t]};opacity:${l.opacity};border-radius:2px"></i>
      <span class="lg-lab">${d(l.label)} of the place's own residents ${d(s)}</span>
    </div>`).join("");return`
    ${$a(e,a??null)}
    <div class="lg-lab">Fill \u2014 share of a place's own residents who ${d(s)}</div>
    ${r}
    <div class="lg-row lg-static"><i style="background:${Y.lost}"></i>
      <span class="lg-lab">point: block group loses more than it gains</span></div>
    <div class="lg-row lg-static"><i style="background:${Y.gained}"></i>
      <span class="lg-lab">point: block group gains more than it loses</span></div>
    <div class="lg-foot">Fill is coloured by SHARE, not by count of residents
      lost or gained \u2014 a raw count would just draw where people live. Click a
      place to select it. Points are the changed census block groups inside
      it; size is the larger of a block group's losses or gains.</div>`}function Or(e,t){let n=e[J(t,"now")],o=e[J(t,"proposed")],a=e[J(t,"pct")],s=e[J(t,"rail_proposed")],r=da[t];if(o===0&&n>0)return`Loses all buses on ${r} (${n} \u2192 0 trips)${s?"; the T still calls here":""}.`;if(n===0&&o>0)return`Gets its first bus on ${r} (0 \u2192 ${o} trips).`;let l=a==null?"\u2014":`${a>0?"+":""}${a.toFixed(1)}%`;return`${n} \u2192 ${o} trips on ${r} (${l}).`}function xa(e,t,n){if(t==="service")return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      ${Or(e,n)}`;let o=Math.round(e.residents_total??0).toLocaleString();if(e.changed_block_groups===0)return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
      None of its ${o} residents lose or gain a bus.`;let a=ca("lose all buses",e.residents_lost,e.share_lost),s=e.residents_gained>0?ca("gain a bus",e.residents_gained,e.share_gained):null,r=(t==="lost"?[a,s]:[s,a]).filter(l=>l!==null);return`<b>${d(e.place)}</b> <span class="muted">\xB7 ${d(e.kind)}</span><br>
    ${r.join("<br>")}<br>
    <span class="muted">${o} residents total \xB7 ${e.changed_block_groups} block group${e.changed_block_groups===1?"":"s"} changed</span>`}function ca(e,t,n){let o=Math.round(t).toLocaleString(),a=n==null?`share withheld \u2014 under ${cr} residents`:`${(n*100).toFixed(1)}%`;return`${o} ${e} (${a})`}var rn=" \xB7 ",ln={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time",places:"Places"},_a=Object.keys(ln);function Pa(e){return ln[e]??e}var Rr={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},Tr=["oneseat","journey"];function Er(e){return e!=="journey"}function Cr(e){let t=[ln[e.view]??e.view];return e.view==="places"?t[0]:(Tr.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":Rr[e.day]),Er(e.view)&&t.push(`${e.radius} m walk`),t.join(rn))}function Da(e){let[t,...n]=Cr(e).split(rn);return`<b>${d(t)}</b>${n.map(o=>rn+d(o)).join("")}`}var f={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map",place:"place",placeFill:"placefill",selection:"sel",addedStops:"newstops"},Mr=/^[cp]:[\w.:-]{1,32}$/,ot={any:"any",selected:"selected"},Ar="pin",Oa=5;function Ta(e){try{return e.self!==e.top}catch{return!0}}function Ea(e){let t=new URLSearchParams;return t.set(f.view,e.view),t.set(f.day,e.day),t.set(f.radius,String(e.radius)),t.set(f.oneSeatDay,e.oneSeatRestricted?ot.selected:ot.any),t.set(f.dest,"key"in e.dest?e.dest.key:cn(e.dest)),e.weight==="riders"&&t.set(f.weight,e.weight),e.surfaceUnit==="people"&&t.set(f.surfaceUnit,e.surfaceUnit),e.at&&t.set(f.at,cn(e.at)),e.camera&&t.set(f.camera,`${cn(e.camera)},${e.camera.zoom.toFixed(2)}`),e.place&&t.set(f.place,e.place),e.placeFill!==se&&t.set(f.placeFill,e.placeFill),e.selection.length&&t.set(f.selection,e.selection.join(",")),t.set(f.addedStops,e.addedStops?"on":"off"),`?${t}`}function Ca(e){let t=new URLSearchParams(e),n={},o=t.get(f.view);o&&_a.includes(o)&&(n.view=o);let a=t.get(f.day);a&&x.includes(a)&&(n.day=a);let s=Number(t.get(f.radius));t.has(f.radius)&&Number.isFinite(s)&&s>0&&(n.radius=s),t.get(f.weight)==="riders"?n.weight="riders":t.get(f.weight)==="locations"&&(n.weight="locations"),t.get(f.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(f.surfaceUnit)==="area"&&(n.surfaceUnit="area");let r=t.get(f.oneSeatDay);r===ot.selected?n.oneSeatRestricted=!0:r===ot.any&&(n.oneSeatRestricted=!1);let l=t.get(f.dest);if(l&&l!==Ar){let D=Ra(l);D?n.dest=D:l.includes(",")||(n.dest={key:l})}let u=Ra(t.get(f.at));u&&(n.at=u);let p=Fr(t.get(f.camera));p&&(n.camera=p);let m=t.get(f.place);m&&(n.place=m);let v=t.get(f.selection);v!==null&&(n.selection=v.split(",").filter(D=>Mr.test(D)));let _=t.get(f.addedStops);_==="off"?n.addedStops=!1:_==="on"&&(n.addedStops=!0);let k=t.get(f.placeFill);return(k==="lost"||k==="gained"||k==="service")&&(n.placeFill=k),n}function cn(e){return`${e.lat.toFixed(Oa)},${e.lon.toFixed(Oa)}`}function Ra(e){let t=Ma(e,2);return t?{lat:t[0],lon:t[1]}:null}function Fr(e){let t=Ma(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function Ma(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var un="embed";var Nr=["1","true","yes"];function Aa(e){let t=new URLSearchParams(e).get(un);return t!==null&&Nr.includes(t.toLowerCase())}function Fa(e){let t=new URLSearchParams(e);return t.set(un,"1"),`?${t}`}function Na(e){let t=new URLSearchParams(e);t.delete(un);let n=String(t);return n?`?${n}`:""}function Ha(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var z=["peek","half","full"],Hr=192,Br=.3,jr=.55,Ir=.9,Ur=.6,Jr=.45;function at(e,t){return e==="peek"?Math.min(Hr,t*Br):e==="half"?t*jr:t*Ir}function zr(e,t,n=0){let o=z.map(s=>Math.abs(at(s,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>Ur&&(a=Math.max(0,Math.min(z.length-1,a+(n>0?1:-1)))),z[a]}function Ba(e){return z[(z.indexOf(e)+1)%z.length]}function Gr(e,t){return Math.min(e,t*Jr)}function re(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function dn(e){let t=null,n=()=>{let o=re();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Vr=8,Yr=400;function ja(e){let t=c("side"),n=c("sheet-handle"),o="peek",a=!1,s=0,r=0,l=0,u={y:0,t:0};function p(){return window.innerHeight}function m(g){t.style.height=`${g}px`,e.onMove(g,Gr(g,p()))}function v(g){o=g,t.dataset.snap=g,m(at(g,p()))}n.addEventListener("pointerdown",g=>{re()&&(a=!0,s=g.clientY,r=t.getBoundingClientRect().height,l=g.timeStamp,u={y:g.clientY,t:g.timeStamp},t.classList.add("dragging"),n.setPointerCapture(g.pointerId))}),n.addEventListener("pointermove",g=>{if(!a)return;let De=r+(s-g.clientY),Q=at("peek",p()),I=at("full",p());m(Math.max(Q,Math.min(I,De))),u={y:g.clientY,t:g.timeStamp}});function _(g){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(g.clientY-s)>Vr)&&g.timeStamp-l<Yr){v(Ba(o));return}let Q=g.timeStamp-u.t,I=Q>0?(u.y-g.clientY)/Q:0;v(zr(t.getBoundingClientRect().height,p(),I))}n.addEventListener("pointerup",_),n.addEventListener("pointercancel",_),n.addEventListener("keydown",g=>{g.key!=="Enter"&&g.key!==" "||(g.preventDefault(),re()&&v(Ba(o)))});let k=dn(e.onLayoutChange);function D(){if(k(),!re()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}v(o)}return window.addEventListener("resize",D),D(),{at:()=>re()?o:"full",atLeast(g){re()&&z.indexOf(g)>z.indexOf(o)&&v(g)}}}var Kr=[-79.9959,40.4406],Wr=12,qr="#e2574c",R={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest",placeFill:"data-place-fill"},$e=Ca(location.search),xe=Aa(location.search);xe&&c("app").classList.add("embed");var Xr={at:()=>"full",atLeast(){}},Ja=null,P=400,Le=null,h=null,le=null,q=0,$={key:"downtown"},K=null,za=!1,de=!1,ut="locations",pe="area",Ga="count",ct=null,F=se,H=!1,y="dots",_e=!0,Va,gn=[],i=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:$e.camera?[$e.camera.lon,$e.camera.lat]:Kr,zoom:$e.camera?.zoom??Wr,cooperativeGestures:Ta(window),attributionControl:{compact:!0}});i.addControl(new maplibregl.NavigationControl,"top-right");i.on("load",()=>{$n(i),to(i),mo(i,"change-dots"),vo(i,"change-dots"),Co(i,"walk-fill"),na(i),ha(i,"change-dots"),xo(i,"walk-fill"),Do(i,L),N(),i.on("click",t=>{if(H)return;if(za){ke({lat:t.lngLat.lat,lon:t.lngLat.lng});return}if(y==="places"){let s=i.queryRenderedFeatures(t.point,{layers:[A]})[0];s&&rt(s.properties.key);return}let n=["change-dots","oneseat-dots"].filter(s=>i.getLayoutProperty(s,"visibility")!=="none"),o=i.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];vn(a[1],a[0])}),i.on("mouseenter",A,()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave",A,()=>{i.getCanvas().style.cursor=""});let e=new maplibregl.Popup({closeButton:!1,offset:8});i.on("mouseenter","change-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","change-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=xt();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(ao(n.properties,L(),o.buckets)).addTo(i)}),i.on("mouseenter","oneseat-dots",()=>{i.getCanvas().style.cursor="pointer"}),i.on("mouseleave","oneseat-dots",()=>{i.getCanvas().style.cursor="",e.remove()}),i.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=oe();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Ho(n.properties,o)).addTo(i)}),i.on("mouseleave",A,()=>e.remove()),i.on("mousemove",A,t=>{let n=t.features?.[0];n&&e.setLngLat(t.lngLat).setHTML(xa(n.properties,F,L())).addTo(i)}),mi(),i.on("moveend",()=>{let t=i.getCenter();Ja={lat:t.lat,lon:t.lng,zoom:i.getZoom()},b(),E()}),ie(R.radius,t=>{P=Number(t.dataset.radius),Rt(i,P,L()).then(b),je()&&Ft(i,P,L()).then(b),Ie()&&Bt(P).then(b),oe()&&it(),h&&ce(h.lat,h.lon)}),ie(R.day,t=>{let n=t.dataset.day;Hn(n),y!=="journey"&&N(),Tt(i,n),Nt(i,n),y==="journey"&&h&&fn(h.lat,h.lon),Ge()&&wo(i,n).then(b),de&&oe()&&(it(),h&&ce(h.lat,h.lon)),Se()&&F==="service"&&nt(i,F,n),b()}),ie(R.oneSeatDay,t=>{de=t.dataset.oneseatDay==="selected",yn(),it(),h&&ce(h.lat,h.lon)}),ie(R.view,t=>{let n=y;y=t.dataset.view,i.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),oi(y==="surface"||y==="both"),si(y==="corridors"),ci(y==="oneseat"),li(y==="journey",n==="journey"),ri(y==="places"),mn(X()),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&N({scrollToTop:!0}),ii(y!=="corridors"&&y!=="journey"&&y!=="places");let o=y==="oneseat"||y==="journey";c("dest-controls").classList.toggle("hidden",!o),c("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),c("place-fill-controls").classList.toggle("hidden",y!=="places"),X()||Ia(!1),ue(),yn(),o||lt(!1),Ka()}),ie(R.dest,t=>{let n=t.dataset.dest;if(n==="pin"){lt(!0);return}lt(!1),ke({key:n})}),ie(R.placeFill,t=>{F=t.dataset.placeFill,Se()&&nt(i,F,L()),N(),b(),yn()}),c("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){ut=n.dataset.weight,b(),E();return}let o=t.target.closest("[data-surface-unit]");if(o){pe=o.dataset.surfaceUnit,ai(pe),E();return}if(t.target.closest("[data-added-stops]")){_e=!_e,mn(X()),E();return}let s=t.target.closest("[data-bucket]");s&&(no(i,s.dataset.bucket,L()),b())}),c("legend-reset").addEventListener("click",()=>{oo(i,L()),b()}),c("legend-select").addEventListener("click",()=>Ia(!H)),c("legend-clear").addEventListener("click",()=>{Dt(i),ue(),b(),E()}),c("legend-collapse").addEventListener("click",()=>{pn(!c("legend-box").classList.contains("collapsed"))}),c("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&ke({key:n.dataset.gotoDest});let o=t.target.closest("[data-caveat]");o&&fi(o.dataset.caveat);let a=t.target.closest("[data-select-place]");a&&rt(a.dataset.selectPlace);let s=t.target.closest("[data-sort-places]");s&&(Ga=s.dataset.sortPlaces,N());let r=t.target.closest("[data-goto-place]");r&&(y!=="places"&&W(R.view,"places"),rt(r.dataset.gotoPlace))}),c("side-toggle").addEventListener("click",ti),xe&&dn(pn),Va=xe?Xr:ja({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),i.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:pn}),Zr(),pt(),ue(),dt(),Qr($e)||Rt(i,P,L()).then(b),mn(X()),gi(),yi()});function ie(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),pt(),E()})})}function W(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Qr(e){let t=!1;return e.radius!==void 0&&(t=W(R.radius,String(e.radius))||t),e.day&&(t=W(R.day,e.day)||t),e.oneSeatRestricted!==void 0&&W(R.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(ut=e.weight),e.surfaceUnit&&(pe=e.surfaceUnit),e.placeFill&&W(R.placeFill,e.placeFill),e.addedStops!==void 0&&(_e=e.addedStops),e.dest&&("key"in e.dest?W(R.dest,e.dest.key):ke(e.dest)),e.selection&&Xn(i,e.selection),e.view&&W(R.view,e.view),e.at&&vn(e.at.lat,e.at.lon),e.place&&rt(e.place),t}function E(){let e={view:y,day:L(),radius:P,oneSeatRestricted:de,weight:ut,surfaceUnit:pe,dest:$,at:h,camera:Ja,place:ct,placeFill:F,selection:Kn(),addedStops:_e},t=Ea(e);history.replaceState(null,"",(xe?Fa(t):t)+location.hash),dt(t)}function dt(e=Na(location.search)){if(!xe)return;let t=c("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=h?le?ge(le):"this point":null;t.querySelector(".el-action").textContent=Ha(n)}function pt(){c("statebar").innerHTML=Da({view:y,day:L(),radius:P,oneSeatRestricted:de,destination:Pe()}),ei()}function pn(e){c("legend-box").classList.toggle("collapsed",e);let t=c("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Zr(){let e=t=>{c("app").classList.toggle("controls-open",t),c("controls-toggle").setAttribute("aria-expanded",String(t))};c("controls-toggle").addEventListener("click",()=>{e(!c("app").classList.contains("controls-open"))}),c("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function ei(){c("controls-toggle").firstChild?.remove(),c("controls-toggle").prepend(document.createTextNode(Pa(y)))}function ti(){let e=c("app").classList.toggle("side-collapsed"),t=c("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),i.resize()}function b(){ni()}function ni(){if(c("legend-reset").classList.toggle("hidden",It()||Kt()||en()||Se()),en()){c("legend").innerHTML=ia(Qe());return}if(Se()){c("legend").innerHTML=ka({selected:ma(),fill:F,day:L(),boundaries:sn(),unchanged:ya()});return}if(It()){let n=Ge();n&&Io(c("legend"),n);return}if(Kt()){let n=oe();if(!n)return;let o=i.getBounds();Uo(c("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=xt();if(!e)return;let t=i.getBounds();zo(c("legend"),{layer:e,day:L(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:ut,surface:At()?je():null,unit:pe,population:Ie(),selection:Yn(),added:Gt(),addedVisible:$o()})}async function oi(e){if(e&&!je()){c("legend").classList.add("loading");try{await Ft(i,P,L())}finally{c("legend").classList.remove("loading")}}yo(i,e),e&&pe==="people"&&await Ya(),b()}async function Ya(){if(!Ie()){c("legend").classList.add("loading");try{await Bt(P)}finally{c("legend").classList.remove("loading")}}}async function ai(e){e==="people"&&At()&&await Ya(),b()}async function mn(e){if(e&&!Gt())try{await _o(i)}catch(t){console.error("added stops failed to load",t);return}Po(i,e&&_e),b()}async function si(e){if(e&&!Ge()){c("legend").classList.add("loading");try{await Ut(i,L())}finally{c("legend").classList.remove("loading")}}So(i,e),b()}async function ri(e){if(e&&(!an()||!sn())){c("legend").classList.add("loading");try{await Promise.all([ba(),va(i)])}finally{c("legend").classList.remove("loading")}}Sa(i,e),e&&nt(i,F,L()),e&&N(),b()}async function rt(e){ct=await bn(()=>wa(i,e))?e:null,y==="places"&&(N(),ct&&document.querySelector(`[data-select-place="${CSS.escape(e)}"]`)?.scrollIntoView({block:"nearest"})),b(),E()}function ii(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function N({scrollToTop:e=!1}={}){if(e&&(c("panel").scrollTop=0),dt(),y==="places"){c("panel").innerHTML=La(an()??[],Ga,ct,F);return}if(!le){y==="oneseat"?c("panel").innerHTML=zn(Pe()):Bn(c("panel"));return}if(y==="oneseat"){let t=Jn(le,$,L());if(t){c("panel").innerHTML=t;return}}Un(le)}function li(e,t=!1){if(oa(i,e),b(),!e){t&&(h?ce(h.lat,h.lon):N());return}Qe()&&h?c("panel").innerHTML=nn(Qe(),Pe()):c("panel").innerHTML=ra(Pe())}async function fn(e,t){let n=++q;h={lat:e,lon:t},E(),qa(e,t);let o=Wa(),a=d(Pe());if(!o){c("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}c("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let s=await S(aa({lat:e,lon:t},o,L()));if(n!==q)return;tn(i,s),c("panel").innerHTML=nn(s,a),b(),dt()}catch(s){if(n!==q)return;tn(i,null),c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${s.message}</p></div>`}}function yn(){c("day-controls").classList.toggle("hidden",!Fo(y,de,F))}function hn(){return Ao(de,L())}async function ci(e){e&&!oe()&&await bn(()=>Wt(i,P,$,hn())),No(i,e),b()}async function it(){await bn(()=>Wt(i,P,$,hn())),b()}async function bn(e){c("legend").classList.add("loading");try{return await e()}finally{c("legend").classList.remove("loading")}}function ke(e){if($=e,lt(!1),ui(),Ka(),pt(),E(),y==="journey"){h&&fn(h.lat,h.lon),b();return}h?ce(h.lat,h.lon):N({scrollToTop:!0}),it()}function Ka(){let e=Wa();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in $))){K?.remove(),K=null;return}K?K.setLngLat([e.lon,e.lat]).addTo(i):(K=new maplibregl.Marker({color:Yt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(i),K.on("dragend",()=>{let n=K.getLngLat();ke({lat:n.lat,lon:n.lng})}))}function ui(){let e=Mo($);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function Wa(){if("lat"in $)return{lat:$.lat,lon:$.lon};let e=$.key,t=gn.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function Pe(){if("lat"in $)return`${$.lat.toFixed(4)}, ${$.lon.toFixed(4)}`;let e=$.key;return gn.find(t=>t.key===e)?.name??e}function lt(e){za=e,i.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function ce(e,t){let n=++q;h={lat:e,lon:t},E(),c("panel").classList.add("loading"),qa(e,t);try{let o="lat"in $?`&dest_lat=${$.lat.toFixed(6)}&dest_lon=${$.lon.toFixed(6)}`:"",a=await S(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${P}${o}&oneseat_day=${hn()}`);if(n!==q)return;kn(i,e,t,P,a.current.stops,a.proposed.stops),di(),le=a,N({scrollToTop:!0})}catch(o){if(n!==q)return;c("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===q&&c("panel").classList.remove("loading")}}function di(){c("pin-key").innerHTML=Jo(P),c("pin-key").classList.remove("hidden")}function qa(e,t){Le?Le.setLngLat([t,e]):(Le=new maplibregl.Marker({color:qr,draggable:!0}).setLngLat([t,e]).addTo(i),Le.on("dragend",()=>{let n=Le.getLngLat();vn(n.lat,n.lng)}))}var st=14;function X(){return y==="dots"||y==="both"}function Ia(e){H=e&&X(),H?i.dragPan.disable():i.dragPan.enable(),i.getCanvas().style.cursor=H?"none":"",H||Xa(),ue()}function ue(){let e=c("legend-select");e.classList.toggle("hidden",!X()),e.setAttribute("aria-pressed",String(H)),e.textContent=H?"Selecting":"Select stops",c("legend-clear").classList.toggle("hidden",!X()||!Wn())}function pi(e,t){let n=c("brush");n.style.left=`${e}px`,n.style.top=`${t}px`,n.hidden=!H}function Ua(e){c("brush").classList.toggle("painting",e)}function Xa(){c("brush").hidden=!0}function mi(){let e=c("brush");e.style.width=`${st*2}px`,e.style.height=`${st*2}px`;let t=!1,n=!1,o=!1,a=()=>{o||(o=!0,requestAnimationFrame(()=>{o=!1,ue(),b()}))},s=()=>{H&&(t=!0,n=!1,Ua(!0))},r=u=>{if(pi(u.point.x,u.point.y),!t)return;n=!0,Pt(i,Ot(i,u.point.x,u.point.y,st))&&a()},l=u=>{if(Ua(!1),!!t){if(t=!1,!n){let[p]=Ot(i,u.point.x,u.point.y,st);p&&qn(i,p)}ue(),b(),E()}};i.on("mousedown",s),i.on("mousemove",r),i.on("mouseup",l),i.getCanvas().addEventListener("mouseleave",Xa),i.on("touchstart",s),i.on("touchmove",r),i.on("touchend",l)}function vn(e,t){if(Va.atLeast("half"),y==="journey"){fn(e,t);return}y!=="places"&&ce(e,t)}async function yi(){try{gn=await S("/api/destinations"),pt()}catch{}}async function gi(){try{let e=await S("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;c("feedline").textContent=t,c("feedline-methods").textContent=t,c("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function fi(e){c("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}c("methods-open").addEventListener("click",()=>c("methods").classList.add("open"));c("methods-close").addEventListener("click",()=>c("methods").classList.remove("open"));})();
