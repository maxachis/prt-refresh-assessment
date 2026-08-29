"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function L(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function h(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function j(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),a=Math.round(t%60),o=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(a).padStart(2,"0")}${o}`}function Fe(e){return e>0?`+${e}`:String(e)}function _t(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var ka="#4aa3ff",$a="#ffa23a";function xa(e,t,n,a=96){let o=[],r=n/111320,i=n/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=a;s++){let c=s/a*2*Math.PI;o.push([t+i*Math.cos(c),e+r*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[o]},properties:{}}}function B(e){return{type:"FeatureCollection",features:e}}function Dt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function Pt(e){e.addSource("walk",{type:"geojson",data:B([])}),e.addSource("stops-now",{type:"geojson",data:B([])}),e.addSource("stops-prop",{type:"geojson",data:B([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":$a,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":ka,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,a=>{let o=a.features?.[0];if(!o)return;let r=o.properties;t.setLngLat(a.lngLat).setHTML(`<b>${r.name}</b><br>${r.side==="current"?"today":"proposed"}
                  \xB7 stop ${r.stop_id} \xB7 ${r.metres} m`).addTo(e)})}function Tt(e,t,n,a,o,r){e.getSource("walk").setData(B([xa(t,n,a)])),e.getSource("stops-now").setData(B(Dt(o,"current"))),e.getSource("stops-prop").setData(B(Dt(r,"proposed")))}var x=["weekday","saturday","sunday"],He=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Ct={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ce=4,Et=e=>3+ce*e,Mt=e=>4+ce*e,Q=e=>5+ce*e,Oa=e=>6+ce*e;var E=(e,t)=>e[t],Nt=(e,t)=>e[Oa(t)],je=e=>2+2*e,Be=e=>3+2*e,ue=4,At=e=>2+ue*e,Ft=e=>3+ue*e,Ht=e=>4+ue*e,jt=e=>5+ue*e;var Ue="weekday";function k(){return Ue}function Jt(e){Ue=e}function It(e){e.innerHTML=`
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
    </div>`}function Ra(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function _a(e,t){let n=Math.max(1,...He.map(a=>Math.max(e.periods[a]??0,t.periods[a]??0)));return He.map(a=>{let o=e.periods[a]??0,r=t.periods[a]??0,i=r-o,s=i>0?"up":i<0?"down":"flat";return`
      <tr>
        <th>${Ct[a]}</th>
        <td class="bar">
          <span class="b-now" style="width:${o/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${o}</td>
        <td class="n">${r}</td>
        <td class="n ${s}">${i===0?"\xB7":Fe(i)}</td>
      </tr>`}).join("")}function T(e){return e.length?e.map(t=>`<span class="route">${h(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Bt(e){return e.first==null?'<span class="muted">no service</span>':`${j(e.first)} \u2013 ${j(e.last)}`}function Ut(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Da={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Pa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ta(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(a=>{let o=T(a.current),r=T(a.proposed),i=a.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${o}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${h(a.name)}</span>
          <span class="os-status ${h(a.status)}">${Da[a.status]??a.status}</span>
        </div>
        <div class="os-routes">${i}</div>
      </div>`}).join("")}
      <p class="note">${t==="any"?`One route serving both ends, on any calendar \u2014 the published
             measure.`:`Only routes running on ${Pa[t]??t} \u2014 not the
             published measure, which counts any calendar.`}
        No frequency: a surviving ride may be hourly on a Sunday. Counts the T
        and the inclines.${de("one-seat")}</p>
    </div>`:""}function de(e){return` <button class="howto" data-caveat="${e}">method</button>`}function Z(e){return e.place?.hood||e.place?.muni||"this location"}function Je(e){return e==="weekday"?"weekday":e}function zt(e,t){let n=e.current.days[t],a=e.proposed.days[t];return`${n.trips} \u2192 ${a.trips} buses per ${Je(t)}`}function Ca(e,t){if(!e)return"";let n=e.measured+e.unmeasured,a=e.unmeasured?`<div class="muted">${e.unmeasured} of the ${n} stops
         ${e.unmeasured===1?"has":"have"} no count of their own</div>`:"";return`<dt>Boardings at those stops</dt><dd>${e.total==null?'<span class="muted">not counted here</span>':`${Math.round(e.total).toLocaleString()}
       <span class="muted">on an average ${Je(t)}, today only</span>`}${a}</dd>`}function Ea(e){return!e||e.total==null?"":`<p class="note">Today's stops only \u2014 the plan's gains have no riders
    to weigh. PRT calls these unofficial totals that may understate ridership
    by up to 30%.${de("boardings")}</p>`}function Ma(e){if(!e)return"";let t=h(e.place),n=e.lost||e.gained?`<p class="people-n"><b>${Math.round(e.lost).toLocaleString()}</b>
         residents lose every bus
         <span class="muted">\xB7</span>
         <b>${Math.round(e.gained).toLocaleString()}</b> gain one</p>`:`<p class="people-n">Nobody in ${t} loses or gains every bus under
         the plan.</p>`;return`
    <div class="people">
      <h3>Who lives in ${t}</h3>
      ${n}
      <p class="note">The whole of ${t}, any day of the week \u2014 it does not
        move with the day above.${de("place-population")}</p>
    </div>`}function Ie(e,t,n=""){let a=e.current.days[t],o=e.proposed.days[t],r=o.trips-a.trips,i=r>0?"up":r<0?"down":"flat",s=Ut(a),c=Ut(o);return`
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
        ${r===0?"no change":`${Fe(r)} trips`}
        <div class="muted">${_t(a.trips,o.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Je(t)}, both directions</div>

    <div class="tiers">${Ra(a.hourly,o.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${_a(a,o)}</tbody>
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
      <dt>First and last bus</dt>
      <dd>${Bt(a)} <span class="muted">\u2192</span> ${Bt(o)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${c==null?"\u2014":`${c} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
      ${Ca(a.boardings,t)}
    </dl>
    ${Ea(a.boardings)}

    ${n}

    ${Ma(e.population)}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${T(a.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${T(o.routes)}</div>
      <p class="note">Renumbering is not replacement: the 61A\u2013D become the
         60X/61X/62X.${de("location-not-route")}</p>
    </div>`}function Kt(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${h(Z(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Ie(e,Ue,Ta(e.oneseat??[],e.oneseat_day??"any"))}`}var Na={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Aa={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Fa={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ha(e,t){let n=e.oneseat??[];return"lat"in t?n.find(a=>a.key===null)??null:n.find(a=>a.key===t.key)??null}function ze(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${T(t)}</div>`:""}function ja(e){let t=ze("kept",e.kept)+ze("lost",e.lost)+ze("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Ba(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      <div class="rrow"><span class="rlab">today</span>${T(e.current)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${T(e.proposed)}</div>
    </div>`}function Ua(e,t){let n=(e.oneseat??[]).filter(o=>o!==t&&o.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(o=>`
    <button class="os-other" data-goto-dest="${h(o.key)}">
      <span class="os-name">${h(o.name)}</span>
      <span class="os-status ${h(o.status)}">${Ja[o.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var Ja={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Ia(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Fa[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Wt(e,t,n){let a=Ha(e,t);if(!a)return"";let o=e.oneseat_day??"any",r=a.status==="here"?"":ja(a)+Ba(a);return`
    <div class="place-head">
      <h2>One-seat ride to ${h(a.name)}</h2>
      <div class="muted">
        from ${h(Z(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${h(a.status)}">${Na[a.status]}</div>
    <p class="note">${Aa[a.status]} ${Ia(o)}</p>

    ${r}

    ${Ua(e,a)}

    <details class="svc">
      <summary>Service at this spot: ${zt(e,n)}</summary>
      ${Ie(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Yt(e){return`
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
    </div>`}var me={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Ke="change",he="change-dots",pe=null,U=new Set;function We(){return pe}function Ye(e){return U.has(e)}function Vt(e,t,n,a,o,r,i){let s={};for(let c of n)s[c]=0;for(let c of e){if(!Gt(c,a,o,r,i))continue;let d=n[E(c,Q(t))];d!==void 0&&s[d]++}return s}function Gt(e,t,n,a,o){let r=E(e,0),i=E(e,1);return r>=n&&r<=o&&i>=t&&i<=a}function qt(e,t,n,a,o,r,i){let s={riders:{},measured:{},unmeasured:0};for(let c of n)s.riders[c]=0,s.measured[c]=0;for(let c of e){if(!Gt(c,a,o,r,i))continue;let d=n[E(c,Q(t))];if(d===void 0)continue;let p=Nt(c,t);if(p===null){d!=="none"&&s.unmeasured++;continue}s.riders[d]+=p,s.measured[d]++}return s}function za(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((a,o)=>t[E(n,Q(o))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(x.flatMap((a,o)=>[[`b${o}`,t[E(n,Q(o))]],[`c${o}`,n[Et(o)]],[`p${o}`,n[Mt(o)]]]))}}))}}function ee(e,t){let n=Object.entries(me).flatMap(([a,o])=>[a,o[t]]);return["match",["get",`b${e}`],...n,me.none[t]]}function Xt(e){return["interpolate",["linear"],["zoom"],9,["*",ee(e,"size"),.45],12,ee(e,"size"),16,["*",ee(e,"size"),1.9]]}function Qt(e){e.addSource(Ke,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:he,type:"circle",source:Ke,paint:{"circle-color":ee(0,"color"),"circle-radius":Xt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function Ve(e,t,n){return pe=await L(`/api/change?radius=${t}`),e.getSource(Ke).setData(za(pe)),Ge(e,n),pe}function Ge(e,t){let n=x.indexOf(t);e.setPaintProperty(he,"circle-color",ee(n,"color")),e.setPaintProperty(he,"circle-radius",Xt(n)),qe(e,t)}function Zt(e,t,n){U.has(t)?U.delete(t):U.add(t),qe(e,n)}function en(e,t){U.clear(),qe(e,t)}function qe(e,t){let n=x.indexOf(t),a=["none",...U];e.setFilter(he,["!",["in",["get",`b${n}`],["literal",a]]])}function tn(e,t,n){let a=x.indexOf(t),o=e[`b${a}`],r=n.find(d=>d.key===o)?.label??o,i=e[`c${a}`],s=e[`p${a}`];return`<b>${r}</b><br>${i} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Xe="surface",fe="surface-fill",nn="#6b7280",Qe=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,nn],[.138,nn],[1,"#12a163"],[2,"#0b7a48"]],M="#e8232f",N="#0f79c9",an=2,ye=null,on=!1;function ge(){return ye}function Ze(){return on}function rn(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-an,Math.min(an,n))}function sn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function ln(e,t,n,a,o,r,i,s){let c={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let p=i.lat0+(d[1]+.5)*i.dlat,w=i.lon0+(d[0]+.5)*i.dlon;if(p<a||p>r||w<n||w>o)continue;let R=d[je(t)],_=d[Be(t)],P=sn(R,_);if(P!=="none")if(P==="ramp"){let m=rn(R,_);c[m<-.138?"less":m>.138?"more":"same"]+=s}else c[P]+=s}return c}function Ka(e){let{lat0:t,lon0:n,dlat:a,dlon:o}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let i=t+r[1]*a,s=i+a,c=n+r[0]*o,d=c+o;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,i],[d,i],[d,s],[c,s],[c,i]]]},properties:Object.fromEntries(x.flatMap((p,w)=>{let R=r[je(w)],_=r[Be(w)];return[[`k${w}`,sn(R,_)],[`v${w}`,rn(R,_)??0]]}))}})}}function cn(e){return["case",["==",["get",`k${e}`],"gone"],M,["==",["get",`k${e}`],"new"],N,["interpolate",["linear"],["get",`v${e}`],...Qe.flatMap(([t,n])=>[t,n])]]}function J(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function un(e,t){e.addSource(Xe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:fe,type:"fill",source:Xe,layout:{visibility:"none"},paint:{"fill-color":cn(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,J(0,.85),13,J(0,.62),16,J(0,.45)]}},t)}async function et(e,t,n){return ye=await L(`/api/surface?radius=${t}`),e.getSource(Xe).setData(Ka(ye)),tt(e,n),ye}function tt(e,t){let n=x.indexOf(t);e.setPaintProperty(fe,"fill-color",cn(n)),e.setPaintProperty(fe,"fill-opacity",["interpolate",["linear"],["zoom"],9,J(n,.85),13,J(n,.62),16,J(n,.45)])}function dn(e,t){on=t,e.setLayoutProperty(fe,"visibility",t?"visible":"none")}var nt=null;function be(){return nt}async function at(e){return nt=await L(`/api/population?radius=${e}`),nt}function pn(e,t,n,a,o,r,i){let s={lost:0,gained:0,kept:0,none:0};for(let c of e){let d=i.lat0+(c[1]+.5)*i.dlat,p=i.lon0+(c[0]+.5)*i.dlon;d<a||d>r||p<n||p>o||(s.lost+=c[At(t)],s.gained+=c[Ft(t)],s.kept+=c[Ht(t)],s.none+=c[jt(t)])}return s}var ot="corridor",mn="corridor-lines",Se="#8b929c",Wa="#6f7783",ve={lost:M,added:N,kept:Se};var we=null,hn=!1;function Le(){return we}function rt(){return hn}function Ya(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function yn(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Va(){let e=t=>["match",["get","klass"],"lost",ve.lost,"added",ve.added,t];return["interpolate",["linear"],["zoom"],9,e(Wa),14,e(Se)]}function Ga(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function qa(){return["match",["get","klass"],"kept",.85,.9]}function fn(e,t){e.addSource(ot,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:mn,type:"line",source:ot,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Va(),"line-width":Ga(),"line-opacity":qa()}},t)}async function st(e,t){return we=await L(`/api/corridors?day=${t}`),e.getSource(ot).setData(Ya(we)),we}async function gn(e,t){x.includes(t)&&await st(e,t)}function bn(e,t){hn=t,e.setLayoutProperty(mn,"visibility",t?"visible":"none")}var lt="#2b3038",wn="#b9bec6",te={loses:{color:M,size:6},gains:{color:N,size:6},keeps:{color:Se,size:3},here:{color:lt,size:3.5},none:{color:wn,size:1.8}},$e=["loses","gains","keeps","none","here"],it="oneseat",vn="oneseat-dots",ke=null,Sn=!1;function I(){return ke}function ct(){return Sn}function Ln(e,t,n,a,o,r){let i={};for(let s of t)i[s]=0;for(let s of e){let c=s[0],d=s[1];if(c<a||c>r||d<n||d>o)continue;let p=t[s[3]];p!==void 0&&i[p]++}return i}function Xa(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Qa(){return["match",["get","status"],...Object.entries(te).flatMap(([e,t])=>[e,t.color]),wn]}function Za(){let e=["match",["get","status"],...Object.entries(te).flatMap(([t,n])=>[t,n.size]),te.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function kn(e,t){e.addSource(it,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:vn,type:"circle",source:it,layout:{visibility:"none"},paint:{"circle-color":Qa(),"circle-radius":Za(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function eo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var to="pin";function $n(e){return"key"in e?e.key:to}var xe="any";function no(e,t,n){return`radius=${e}&${eo(t)}&day=${n}`}function xn(e,t){return e?t:xe}function On(e,t){return e!=="oneseat"||t}async function ut(e,t,n,a=xe){return ke=await L(`/api/oneseat?${no(t,n,a)}`),e.getSource(it).setData(Xa(ke)),ke}function Rn(e,t){Sn=t,e.setLayoutProperty(vn,"visibility",t?"visible":"none")}function dt(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function _n(e,t){let n=t.statuses.find(s=>s.key===e.status)?.label??e.status,a=(e.current||"").split(";").filter(Boolean),o=(e.proposed||"").split(";").filter(Boolean),r=s=>s.length?s.join(", "):"none",i=dt(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${i}<br>today: ${r(a)}<br>proposed: ${r(o)}`}var pt={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ao(e){return e.buckets.filter(t=>t.key!=="none")}var Dn={area:"Ground",people:"People"};function oo(e,t,n){let a=e.cell_m*e.cell_m/1e6,o=ln(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,a),r=i=>i.toFixed(i<10?1:0);return`
      <div class="lg-area">
        <span><b>${r(o.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(o.less)}</b> km\xB2 less</span>
        <span><b>${r(o.more)}</b> km\xB2 more</span>
        <span><b>${r(o.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function ro(e,t,n){let a='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${a}`;let o=pn(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),r=i=>Math.round(i).toLocaleString();return`
      <div class="lg-area">
        <span><b>${r(o.lost)}</b> people lose all service</span>
        <span><b>${r(o.gained)}</b> gain service</span>
        <span><b>${r(o.kept)}</b> keep a bus</span>
        <span><b>${r(o.none)}</b> have no bus either way</span>
      </div>
      ${a}`}function so(e){let{layer:t,day:n,bounds:a,unit:o,population:r}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${Qe.map(([s,c])=>`${c} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${M}"></i>loses all service</span>
        <span><i style="background:${N}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(Dn).map(s=>`
          <button data-surface-unit="${s}" aria-pressed="${o===s}"
                  class="${o===s?"active":""}">${Dn[s]}</button>`).join("")}
      </div>
      ${o==="people"?ro(n,a,r):oo(t,n,a)}
    </div>`}var io=["lost","added","kept"],lo={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},co={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Tn(e,t){let{lostPct:n,addedPct:a}=yn(t.km),o=s=>s.toFixed(1),i=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${i}</b> km of street, citywide \u2014 ${co[t.day]}
    </div>
    ${io.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${ve[s]}"></i>
        <span class="lg-lab">${h(lo[s])}</span>
        <span class="lg-n">${o(t.km[s])} km</span>
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
      what you can still reach on foot.</div>`}function Cn(e,t,n){let a=t.statuses.map(p=>p.key),o=Ln(t.points,a,n.west,n.south,n.east,n.north),r=p=>t.statuses.find(w=>w.key===p)?.label??p,i=$e.reduce((p,w)=>p+(o[w]??0),0),s=dt(t),c=t.day&&t.day!==xe,d=c?`Restricted to routes running on ${pt[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${h(s)}</b>
      <span class="muted">\xB7 ${i.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${c?` \xB7 ${pt[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${$e.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${te[p].color}"></i>
        <span class="lg-lab">${h(r(p))}</span>
        <span class="lg-n">${(o[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${$e.map(p=>`${(t.counts[p]??0).toLocaleString()} ${h(r(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${h(s)} without transferring?
      ${d} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function En(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Pn={locations:"Locations",riders:"Riders"};function uo(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function Mn(e,t){let{layer:n,day:a,bounds:o,weight:r,surface:i,unit:s="area",population:c}=t,d=n.buckets.map(g=>g.key),p=n.days.indexOf(a),{west:w,south:R,east:_,north:P}=o,m=ao(n),q=Vt(n.points,p,d,w,R,_,P),O=r==="riders"?qt(n.points,p,d,w,R,_,P):null,X=g=>O?O.measured[g]?Math.round(O.riders[g]).toLocaleString():"\u2014":q[g].toLocaleString(),La=O?`<b>${Math.round(m.reduce((g,Ae)=>g+O.riders[Ae.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${m.reduce((g,Ae)=>g+q[Ae.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${La}
      <span class="muted">\xB7 ${pt[a]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Pn).map(g=>`
        <button data-weight="${g}" aria-pressed="${r===g}"
                class="${r===g?"active":""}">${Pn[g]}</button>`).join("")}
    </div>
    ${m.map(g=>`
      <button class="lg-row ${Ye(g.key)?"off":""}" data-bucket="${h(g.key)}"
              aria-pressed="${!Ye(g.key)}">
        <i style="background:${me[g.key]?.color??"#666"}"></i>
        <span class="lg-lab">${h(g.label)}</span>
        <span class="lg-n">${X(g.key)}</span>
      </button>`).join("")}
    ${i?so({layer:i,day:a,bounds:o,unit:s,population:c}):""}
    ${O?uo(O.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var mt="#4aa3ff",Un="#ffa23a",ht="headline",Oe="journey",Jn="journey-rides",In="journey-walks",po=[Jn,In],zn=null,Kn=!1;function _e(){return zn}function yt(){return Kn}function mo(e,t){let n=e.radii[t],a=[];for(let o of["current","proposed"]){let r=n[o].itinerary;if(r)for(let i of r.legs){let s=i.from??e.origin,c=i.to??e.destination,d=[[s.lon,s.lat],[c.lon,c.lat]],p=i.path?.length?i.path:d;a.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:o,kind:i.kind,route:i.route}})}}return{type:"FeatureCollection",features:a}}function Nn(){return["match",["get","side"],"current",mt,"proposed",Un,mt]}function An(e){let t=(n,a)=>["match",["get","side"],"proposed",a*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Wn(e,t){e.addSource(Oe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Jn,type:"line",source:Oe,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Nn(),"line-width":An(1),"line-opacity":.85}},t),e.addLayer({id:In,type:"line",source:Oe,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Nn(),"line-width":An(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Yn(e,t){Kn=t;for(let n of po)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function ft(e,t){zn=t;let n=t?mo(t,ht):{type:"FeatureCollection",features:[]};e.getSource(Oe).setData(n)}function Vn(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Fn=e=>`${e.toFixed(1)} min`;function Gn(e){return e==null?"\u2014":e===0?"no change":e>0?`${Fn(e)} slower`:`${Fn(-e)} faster`}function Hn(e,t){return e?e.name?h(e.name):`stop ${h(e.stop_id)}`:t}function ho(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let a=Hn(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${a}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${h(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Hn(e.to,"the destination")}</span></div>`}function jn(e,t){let n=[],a=null;for(let o of e.legs){let r=a?Math.round(o.depart-a.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(ho(o,t)),a=o}return n.join("")}var yo={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Re(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function fo(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,a])=>`
        <tr><th>${n}</th>
          <td class="n">${a(e.current)}</td>
          <td class="n">${a(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function go(e){let t=e.radii.strict,n=t.transfer_walk_m,a=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Re(t.current)} \u2192
        ${Re(t.proposed)} min</span>
        <span class="muted">${Gn(t.change_min)}</span></div>
      ${a}
    </div>`}function Bn(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function gt(e,t){let n=e.radii[ht],a=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",o=`
    <div class="place-head">
      <h2>Travel time to ${h(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${j(e.window.start_min)}
        and ${j(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${o}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${yo[n.classification]??""}</p>
      </div>
      ${Bn(e)}`:`${o}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Re(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Re(n.proposed)}</div>
      </div>
      <div class="hl-delta ${a}">${Gn(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${fo(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?jn(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?jn(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${go(e)}
    ${Bn(e)}`}function qn(e){return`
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
    </div>`}function Xn(e){let t=e?e.radii[ht].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${mt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Un}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var bt=" \xB7 ",wt={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"},Qn=Object.keys(wt);function Zn(e){return wt[e]??e}var bo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},wo=["oneseat","journey"];function vo(e){return e!=="journey"}function So(e){let t=[wt[e.view]??e.view];return wo.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":bo[e.day]),vo(e.view)&&t.push(`${e.radius} m walk`),t.join(bt)}function ea(e){let[t,...n]=So(e).split(bt);return`<b>${h(t)}</b>${n.map(a=>bt+h(a)).join("")}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map"},De={any:"any",selected:"selected"},Lo="pin",ta=5;function aa(e){try{return e.self!==e.top}catch{return!0}}function oa(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?De.selected:De.any),t.set(b.dest,"key"in e.dest?e.dest.key:vt(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.at&&t.set(b.at,vt(e.at)),e.camera&&t.set(b.camera,`${vt(e.camera)},${e.camera.zoom.toFixed(2)}`),`?${t}`}function ra(e){let t=new URLSearchParams(e),n={},a=t.get(b.view);a&&Qn.includes(a)&&(n.view=a);let o=t.get(b.day);o&&x.includes(o)&&(n.day=o);let r=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let i=t.get(b.oneSeatDay);i===De.selected?n.oneSeatRestricted=!0:i===De.any&&(n.oneSeatRestricted=!1);let s=t.get(b.dest);if(s&&s!==Lo){let p=na(s);p?n.dest=p:s.includes(",")||(n.dest={key:s})}let c=na(t.get(b.at));c&&(n.at=c);let d=ko(t.get(b.camera));return d&&(n.camera=d),n}function vt(e){return`${e.lat.toFixed(ta)},${e.lon.toFixed(ta)}`}function na(e){let t=sa(e,2);return t?{lat:t[0],lon:t[1]}:null}function ko(e){let t=sa(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function sa(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var St="embed";var $o=["1","true","yes"];function ia(e){let t=new URLSearchParams(e).get(St);return t!==null&&$o.includes(t.toLowerCase())}function la(e){let t=new URLSearchParams(e);return t.set(St,"1"),`?${t}`}function ca(e){let t=new URLSearchParams(e);t.delete(St);let n=String(t);return n?`?${n}`:""}function ua(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var C=["peek","half","full"],xo=192,Oo=.3,Ro=.55,_o=.9,Do=.6,Po=.45;function Pe(e,t){return e==="peek"?Math.min(xo,t*Oo):e==="half"?t*Ro:t*_o}function To(e,t,n=0){let a=C.map(r=>Math.abs(Pe(r,t)-e)),o=a.indexOf(Math.min(...a));return Math.abs(n)>Do&&(o=Math.max(0,Math.min(C.length-1,o+(n>0?1:-1)))),C[o]}function da(e){return C[(C.indexOf(e)+1)%C.length]}function Co(e,t){return Math.min(e,t*Po)}function z(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function Lt(e){let t=null,n=()=>{let a=z();a!==t&&(t=a,e(a))};return window.addEventListener("resize",n),n(),n}var Eo=8,Mo=400;function pa(e){let t=l("side"),n=l("sheet-handle"),a="peek",o=!1,r=0,i=0,s=0,c={y:0,t:0};function d(){return window.innerHeight}function p(m){t.style.height=`${m}px`,e.onMove(m,Co(m,d()))}function w(m){a=m,t.dataset.snap=m,p(Pe(m,d()))}n.addEventListener("pointerdown",m=>{z()&&(o=!0,r=m.clientY,i=t.getBoundingClientRect().height,s=m.timeStamp,c={y:m.clientY,t:m.timeStamp},t.classList.add("dragging"),n.setPointerCapture(m.pointerId))}),n.addEventListener("pointermove",m=>{if(!o)return;let q=i+(r-m.clientY),O=Pe("peek",d()),X=Pe("full",d());p(Math.max(O,Math.min(X,q))),c={y:m.clientY,t:m.timeStamp}});function R(m){if(!o)return;if(o=!1,t.classList.remove("dragging"),!(Math.abs(m.clientY-r)>Eo)&&m.timeStamp-s<Mo){w(da(a));return}let O=m.timeStamp-c.t,X=O>0?(c.y-m.clientY)/O:0;w(To(t.getBoundingClientRect().height,d(),X))}n.addEventListener("pointerup",R),n.addEventListener("pointercancel",R),n.addEventListener("keydown",m=>{m.key!=="Enter"&&m.key!==" "||(m.preventDefault(),z()&&w(da(a)))});let _=Lt(e.onLayoutChange);function P(){if(_(),!z()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}w(a)}return window.addEventListener("resize",P),P(),{at:()=>z()?a:"full",atLeast(m){z()&&C.indexOf(m)>C.indexOf(a)&&w(m)}}}var No=[-79.9959,40.4406],Ao=12,Fo="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},re=ra(location.search),ie=ia(location.search);ie&&l("app").classList.add("embed");var Ho={at:()=>"full",atLeast(){}},ha=null,$=400,ne=null,f=null,K=null,F=0,S={key:"downtown"},A=null,ya=!1,V=!1,Ee="locations",G="area",y="dots",fa,$t=[],u=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:re.camera?[re.camera.lon,re.camera.lat]:No,zoom:re.camera?.zoom??Ao,cooperativeGestures:aa(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{Pt(u),Qt(u),un(u,"change-dots"),fn(u,"change-dots"),kn(u,"walk-fill"),Wn(u),W(),u.on("click",t=>{if(ya){se({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(r=>u.getLayoutProperty(r,"visibility")!=="none"),a=u.queryRenderedFeatures(t.point,{layers:n})[0],o=a?a.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];Rt(o[1],o[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});u.on("mouseenter","change-dots",()=>{u.getCanvas().style.cursor="pointer"}),u.on("mouseleave","change-dots",()=>{u.getCanvas().style.cursor="",e.remove()}),u.on("mousemove","change-dots",t=>{let n=t.features?.[0],a=We();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(tn(n.properties,k(),a.buckets)).addTo(u)}),u.on("mouseenter","oneseat-dots",()=>{u.getCanvas().style.cursor="pointer"}),u.on("mouseleave","oneseat-dots",()=>{u.getCanvas().style.cursor="",e.remove()}),u.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],a=I();!n||!a||e.setLngLat(n.geometry.coordinates).setHTML(_n(n.properties,a)).addTo(u)}),u.on("moveend",()=>{let t=u.getCenter();ha={lat:t.lat,lon:t.lng,zoom:u.getZoom()},v(),H()}),ae(D.radius,t=>{$=Number(t.dataset.radius),Ve(u,$,k()).then(v),ge()&&et(u,$,k()).then(v),be()&&at($).then(v),I()&&Te(),f&&Y(f.lat,f.lon)}),ae(D.day,t=>{let n=t.dataset.day;Jt(n),y!=="journey"&&W(),Ge(u,n),tt(u,n),y==="journey"&&f&&xt(f.lat,f.lon),Le()&&gn(u,n).then(v),V&&I()&&(Te(),f&&Y(f.lat,f.lon)),v()}),ae(D.oneSeatDay,t=>{V=t.dataset.oneseatDay==="selected",ma(),Te(),f&&Y(f.lat,f.lon)}),ae(D.view,t=>{let n=y;y=t.dataset.view,u.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),zo(y==="surface"||y==="both"),Wo(y==="corridors"),Go(y==="oneseat"),Vo(y==="journey",n==="journey"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&W({scrollToTop:!0}),Yo(y!=="corridors"&&y!=="journey");let a=y==="oneseat"||y==="journey";l("dest-controls").classList.toggle("hidden",!a),l("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),ma(),a||Ce(!1),wa()}),ae(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Ce(!0);return}Ce(!1),se({key:n})}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Ee=n.dataset.weight,v(),H();return}let a=t.target.closest("[data-surface-unit]");if(a){G=a.dataset.surfaceUnit,Ko(G),H();return}let o=t.target.closest("[data-bucket]");o&&(Zt(u,o.dataset.bucket,k()),v())}),l("legend-reset").addEventListener("click",()=>{en(u,k()),v()}),l("legend-collapse").addEventListener("click",()=>{kt(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&se({key:n.dataset.gotoDest});let a=t.target.closest("[data-caveat]");a&&er(a.dataset.caveat)}),l("side-toggle").addEventListener("click",Jo),ie&&Lt(kt),fa=ie?Ho:pa({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:kt}),Bo(),Ne(),Me(),jo(re)||Ve(u,$,k()).then(v),Zo(),Qo()});function ae(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(n).forEach(o=>o.classList.toggle("active",o===a)),t(a),Ne(),H()})})}function oe(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function jo(e){let t=!1;return e.radius!==void 0&&(t=oe(D.radius,String(e.radius))||t),e.day&&(t=oe(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&oe(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Ee=e.weight),e.surfaceUnit&&(G=e.surfaceUnit),e.dest&&("key"in e.dest?oe(D.dest,e.dest.key):se(e.dest)),e.view&&oe(D.view,e.view),e.at&&Rt(e.at.lat,e.at.lon),t}function H(){let e={view:y,day:k(),radius:$,oneSeatRestricted:V,weight:Ee,surfaceUnit:G,dest:S,at:f,camera:ha},t=oa(e);history.replaceState(null,"",(ie?la(t):t)+location.hash),Me(t)}function Me(e=ca(location.search)){if(!ie)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?K?Z(K):"this point":null;t.querySelector(".el-action").textContent=ua(n)}function Ne(){l("statebar").innerHTML=ea({view:y,day:k(),radius:$,oneSeatRestricted:V,destination:le()}),Uo()}function kt(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Bo(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Uo(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(Zn(y)))}function Jo(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function v(){Io()}function Io(){if(l("legend-reset").classList.toggle("hidden",rt()||ct()||yt()),yt()){l("legend").innerHTML=Xn(_e());return}if(rt()){let n=Le();n&&Tn(l("legend"),n);return}if(ct()){let n=I();if(!n)return;let a=u.getBounds();Cn(l("legend"),n,{west:a.getWest(),south:a.getSouth(),east:a.getEast(),north:a.getNorth()});return}let e=We();if(!e)return;let t=u.getBounds();Mn(l("legend"),{layer:e,day:k(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Ee,surface:Ze()?ge():null,unit:G,population:be()})}async function zo(e){if(e&&!ge()){l("legend").classList.add("loading");try{await et(u,$,k())}finally{l("legend").classList.remove("loading")}}dn(u,e),e&&G==="people"&&await ga(),v()}async function ga(){if(!be()){l("legend").classList.add("loading");try{await at($)}finally{l("legend").classList.remove("loading")}}}async function Ko(e){e==="people"&&Ze()&&await ga(),v()}async function Wo(e){if(e&&!Le()){l("legend").classList.add("loading");try{await st(u,k())}finally{l("legend").classList.remove("loading")}}bn(u,e),v()}function Yo(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function W({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),Me(),!K){y==="oneseat"?l("panel").innerHTML=Yt(le()):It(l("panel"));return}if(y==="oneseat"){let t=Wt(K,S,k());if(t){l("panel").innerHTML=t;return}}Kt(K)}function Vo(e,t=!1){if(Yn(u,e),v(),!e){t&&(f?Y(f.lat,f.lon):W());return}_e()&&f?l("panel").innerHTML=gt(_e(),le()):l("panel").innerHTML=qn(le())}async function xt(e,t){let n=++F;f={lat:e,lon:t},H(),Sa(e,t);let a=va(),o=h(le());if(!a){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${o} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${o}, at two transfer distances. A few seconds.</p></div>`;try{let r=await L(Vn({lat:e,lon:t},a,k()));if(n!==F)return;ft(u,r),l("panel").innerHTML=gt(r,o),v(),Me()}catch(r){if(n!==F)return;ft(u,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function ma(){l("day-controls").classList.toggle("hidden",!On(y,V))}function Ot(){return xn(V,k())}async function Go(e){e&&!I()&&await ba(()=>ut(u,$,S,Ot())),Rn(u,e),v()}async function Te(){await ba(()=>ut(u,$,S,Ot())),v()}async function ba(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function se(e){if(S=e,Ce(!1),qo(),wa(),Ne(),H(),y==="journey"){f&&xt(f.lat,f.lon),v();return}f?Y(f.lat,f.lon):W({scrollToTop:!0}),Te()}function wa(){let e=va();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in S))){A?.remove(),A=null;return}A?A.setLngLat([e.lon,e.lat]).addTo(u):(A=new maplibregl.Marker({color:lt,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),A.on("dragend",()=>{let n=A.getLngLat();se({lat:n.lat,lon:n.lng})}))}function qo(){let e=$n(S);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function va(){if("lat"in S)return{lat:S.lat,lon:S.lon};let e=S.key,t=$t.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function le(){if("lat"in S)return`${S.lat.toFixed(4)}, ${S.lon.toFixed(4)}`;let e=S.key;return $t.find(t=>t.key===e)?.name??e}function Ce(e){ya=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Y(e,t){let n=++F;f={lat:e,lon:t},H(),l("panel").classList.add("loading"),Sa(e,t);try{let a="lat"in S?`&dest_lat=${S.lat.toFixed(6)}&dest_lon=${S.lon.toFixed(6)}`:"",o=await L(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${$}${a}&oneseat_day=${Ot()}`);if(n!==F)return;Tt(u,e,t,$,o.current.stops,o.proposed.stops),Xo(),K=o,W({scrollToTop:!0})}catch(a){if(n!==F)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${a.message}</p></div>`}finally{n===F&&l("panel").classList.remove("loading")}}function Xo(){l("pin-key").innerHTML=En($),l("pin-key").classList.remove("hidden")}function Sa(e,t){ne?ne.setLngLat([t,e]):(ne=new maplibregl.Marker({color:Fo,draggable:!0}).setLngLat([t,e]).addTo(u),ne.on("dragend",()=>{let n=ne.getLngLat();Rt(n.lat,n.lng)}))}function Rt(e,t){if(fa.atLeast("half"),y==="journey"){xt(e,t);return}Y(e,t)}async function Qo(){try{$t=await L("/api/destinations"),Ne()}catch{}}async function Zo(){try{let e=await L("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li id="caveat-${n.id}">${n.text}</li>`).join("")}catch{}}function er(e){l("methods").classList.add("open");let t=document.getElementById(`caveat-${e}`);t&&(t.scrollIntoView({block:"center"}),t.classList.remove("asked"),t.offsetWidth,t.classList.add("asked"))}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
