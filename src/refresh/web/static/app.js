"use strict";(()=>{function l(e){let t=document.getElementById(e);if(!t)throw new Error(`missing element #${e}`);return t}async function L(e){let t=await fetch(e);if(!t.ok){let n=t.statusText;try{n=(await t.json()).detail??n}catch{}throw new Error(n)}return t.json()}function h(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function j(e){if(e==null)return"\u2014";let t=e%1440,n=Math.floor(t/60),o=Math.round(t%60),a=n<12?"am":"pm";return`${n%12===0?12:n%12}:${String(o).padStart(2,"0")}${a}`}function Ne(e){return e>0?`+${e}`:String(e)}function Ot(e,t){return e?`${t>=e?"+":""}${((t-e)/e*100).toFixed(1)}%`:t?"new":"\u2014"}var ko="#4aa3ff",$o="#ffa23a";function xo(e,t,n,o=96){let a=[],r=n/111320,i=n/(111320*Math.cos(e*Math.PI/180));for(let s=0;s<=o;s++){let c=s/o*2*Math.PI;a.push([t+i*Math.cos(c),e+r*Math.sin(c)])}return{type:"Feature",geometry:{type:"Polygon",coordinates:[a]},properties:{}}}function U(e){return{type:"FeatureCollection",features:e}}function Rt(e,t){return e.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n.lon,n.lat]},properties:{...n,side:t}}))}function _t(e){e.addSource("walk",{type:"geojson",data:U([])}),e.addSource("stops-now",{type:"geojson",data:U([])}),e.addSource("stops-prop",{type:"geojson",data:U([])}),e.addLayer({id:"walk-fill",type:"fill",source:"walk",paint:{"fill-color":"#8fb7ff","fill-opacity":.12}}),e.addLayer({id:"walk-line",type:"line",source:"walk",paint:{"line-color":"#8fb7ff","line-width":1.5,"line-dasharray":[2,2]}}),e.addLayer({id:"stops-prop-c",type:"circle",source:"stops-prop",paint:{"circle-radius":7,"circle-color":$o,"circle-opacity":.85,"circle-stroke-width":1,"circle-stroke-color":"#3a2a10"}}),e.addLayer({id:"stops-now-c",type:"circle",source:"stops-now",paint:{"circle-radius":4,"circle-color":ko,"circle-stroke-width":1,"circle-stroke-color":"#0d2036"}});let t=new maplibregl.Popup({closeButton:!1,offset:10});for(let n of["stops-now-c","stops-prop-c"])e.on("mouseenter",n,()=>{e.getCanvas().style.cursor="pointer"}),e.on("mouseleave",n,()=>{e.getCanvas().style.cursor="",t.remove()}),e.on("mousemove",n,o=>{let a=o.features?.[0];if(!a)return;let r=a.properties;t.setLngLat(o.lngLat).setHTML(`<b>${r.name}</b><br>${r.side==="current"?"today":"proposed"}
                  \xB7 stop ${r.stop_id} \xB7 ${r.metres} m`).addTo(e)})}function Dt(e,t,n,o,a,r){e.getSource("walk").setData(U([xo(t,n,o)])),e.getSource("stops-now").setData(U(Rt(a,"current"))),e.getSource("stops-prop").setData(U(Rt(r,"proposed")))}var x=["weekday","saturday","sunday"],Fe=["early_4_6a","am_6_9a","mid_9a_3p","pm_3_6p","eve_6_8p","late_8_11p","owl_11p_4a"],Pt={early_4_6a:"4\u20136am",am_6_9a:"6\u20139am",mid_9a_3p:"9am\u20133pm",pm_3_6p:"3\u20136pm",eve_6_8p:"6\u20138pm",late_8_11p:"8\u201311pm",owl_11p_4a:"11pm\u20134am"},ce=4,Tt=e=>3+ce*e,Ct=e=>4+ce*e,Q=e=>5+ce*e,Oo=e=>6+ce*e;var E=(e,t)=>e[t],Et=(e,t)=>e[Oo(t)],He=e=>2+2*e,je=e=>3+2*e,ue=4,Mt=e=>2+ue*e,At=e=>3+ue*e,Nt=e=>4+ue*e,Ft=e=>5+ue*e;var Ue="weekday";function k(){return Ue}function Ut(e){Ue=e}function Bt(e){e.innerHTML=`
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
    </div>`}function Ro(e,t){return e&&t?'<span class="tier keep">hourly or better, before and after</span>':!e&&t?'<span class="tier gain">rises to hourly or better</span>':e&&!t?'<span class="tier loss">drops below hourly</span>':'<span class="tier none">below hourly, before and after</span>'}function _o(e,t){let n=Math.max(1,...Fe.map(o=>Math.max(e.periods[o]??0,t.periods[o]??0)));return Fe.map(o=>{let a=e.periods[o]??0,r=t.periods[o]??0,i=r-a,s=i>0?"up":i<0?"down":"flat";return`
      <tr>
        <th>${Pt[o]}</th>
        <td class="bar">
          <span class="b-now" style="width:${a/n*100}%"></span>
          <span class="b-prop" style="width:${r/n*100}%"></span>
        </td>
        <td class="n">${a}</td>
        <td class="n">${r}</td>
        <td class="n ${s}">${i===0?"\xB7":Ne(i)}</td>
      </tr>`}).join("")}function T(e){return e.length?e.map(t=>`<span class="route">${h(t)}</span>`).join(" "):'<span class="muted">none</span>'}function Ht(e){return e.first==null?'<span class="muted">no service</span>':`${j(e.first)} \u2013 ${j(e.last)}`}function jt(e){let t=Object.values(e.headways).map(n=>n.median).filter(n=>n!=null);return t.length?Math.min(...t):null}var Do={here:"you are here",keeps:"keeps a one-seat ride",gains:"gains a one-seat ride",loses:"loses its one-seat ride",none:"no one-seat ride either way"},Po={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function To(e,t="any"){return e.length?`
    <div class="oneseat">
      <h3>Getting there without changing bus</h3>
      ${e.map(o=>{let a=T(o.current),r=T(o.proposed),i=o.status==="here"?'<div class="muted">no one-seat ride needed</div>':`<div class="rrow"><span class="rlab">today</span>${a}</div>
         <div class="rrow"><span class="rlab">proposed</span>${r}</div>`;return`
      <div class="os-row">
        <div class="os-head">
          <span class="os-name">${h(o.name)}</span>
          <span class="os-status ${h(o.status)}">${Do[o.status]??o.status}</span>
        </div>
        <div class="os-routes">${i}</div>
      </div>`}).join("")}
      <p class="note">A one-seat ride means some single route serves both this
        spot and the destination. ${t==="any"?`Counted on any calendar, which is the published measure \u2014 no day
             type enters it.`:`Restricted to routes running on ${Po[t]??t},
             which is not the published measure \u2014 that one counts a route
             calling here on any calendar.`}
        It says nothing about how long the trip takes
        or how often it runs \u2014 check the timetable above for that. This is the
        only figure on the panel that counts the T and the inclines: they are
        unchanged by the Refresh, but leaving them out would show the South
        Hills losing Downtown rides the Blue Line still runs.</p>
    </div>`:""}function Z(e){return e.place?.hood||e.place?.muni||"this location"}function Jt(e){return e==="weekday"?"weekday":e}function It(e,t){let n=e.current.days[t],o=e.proposed.days[t];return`${n.trips} \u2192 ${o.trips} buses per ${Jt(t)}`}function Be(e,t,n=""){let o=e.current.days[t],a=e.proposed.days[t],r=a.trips-o.trips,i=r>0?"up":r<0?"down":"flat",s=jt(o),c=jt(a);return`
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
        ${r===0?"no change":`${Ne(r)} trips`}
        <div class="muted">${Ot(o.trips,a.trips)}</div>
      </div>
    </div>
    <div class="sub">buses per ${Jt(t)}, both directions</div>

    <div class="tiers">${Ro(o.hourly,a.hourly)}</div>

    <table class="periods">
      <thead><tr><th></th><th></th><th class="n">now</th><th class="n">prop.</th><th class="n">\u0394</th></tr></thead>
      <tbody>${_o(o,a)}</tbody>
    </table>
    <div class="legend">
      <span><i class="sw-now"></i> today</span>
      <span><i class="sw-prop"></i> proposed</span>
      <span><i class="sw-walk"></i> the ${e.radius} m walk</span>
      <span><i class="sw-pin"></i> where you clicked</span>
    </div>
    <div class="key-note">The same colours mark the map: each dot is one stop,
      blue for today and orange for the plan. A stop both networks keep at the
      same spot draws as a blue dot inside an orange ring rather than as two
      marks; one the plan nudges across the intersection draws as two, which is
      renumbering rather than a change in service. Only the stops inside the
      dashed circle are counted above.</div>

    <dl class="facts">
      <dt>First and last bus</dt>
      <dd>${Ht(o)} <span class="muted">\u2192</span> ${Ht(a)}</dd>
      <dt>Typical wait, better direction, 6am\u20136pm</dt>
      <dd>${s==null?"\u2014":`${s} min`} <span class="muted">\u2192</span> ${c==null?"\u2014":`${c} min`}</dd>
      <dt>Stops within ${e.radius} m</dt>
      <dd>${e.current.stops.length} <span class="muted">\u2192</span> ${e.proposed.stops.length}</dd>
    </dl>

    ${n}

    <div class="routes">
      <h3>Routes serving this spot</h3>
      <div class="rrow"><span class="rlab">today</span>${T(o.routes)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${T(a.routes)}</div>
      <p class="note">Renumbering is not replacement \u2014 the 61A\u2013D become the
         60X/61X/62X, and the P-flyers become L-limiteds. Differences between
         these two lists overstate how much actually changes on the ground.</p>
    </div>`}function zt(e){let t=document.getElementById("panel");t.innerHTML=`
    <div class="place-head">
      <h2>${h(Z(e))}</h2>
      <div class="muted">
        ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7 within ${e.radius} m
      </div>
    </div>
    ${Be(e,Ue,To(e.oneseat??[],e.oneseat_day??"any"))}`}var Co={keeps:"Keeps its one-seat ride",gains:"Gains a one-seat ride",loses:"Loses its one-seat ride",none:"No one-seat ride, before or after",here:"You are already there"},Eo={keeps:"Some single route serves both ends today and still does under the plan.",gains:"No single route serves both ends today; one does under the plan.",loses:"A single route serves both ends today; none does under the plan.",none:"Reaching it means changing bus on both networks \u2014 for Oakland that is most of the county, before and after.",here:"This point is inside the destination, so no one-seat ride is needed to reach it."},Mo={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function Ao(e,t){let n=e.oneseat??[];return"lat"in t?n.find(o=>o.key===null)??null:n.find(o=>o.key===t.key)??null}function Je(e,t){return t.length?`<div class="rrow"><span class="rlab">${e}</span>${T(t)}</div>`:""}function No(e){let t=Je("kept",e.kept)+Je("lost",e.lost)+Je("gained",e.gained);if(!t)return"";let n=e.lost.length&&e.gained.length?`Renumbering is not replacement, so a route in <b>lost</b> beside a
       similar number in <b>gained</b> is likely the same bus renamed.`:"";return`
    <div class="routes">
      <h3>The rides that make the verdict</h3>
      ${t}
      <p class="note">These are the routes serving both this spot and the
         destination \u2014 not everything that stops here. ${n}</p>
    </div>`}function Fo(e){return`
    <div class="routes">
      <h3>Routes reaching it from here</h3>
      <div class="rrow"><span class="rlab">today</span>${T(e.current)}</div>
      <div class="rrow"><span class="rlab">proposed</span>${T(e.proposed)}</div>
    </div>`}function Ho(e,t){let n=(e.oneseat??[]).filter(a=>a!==t&&a.key!==null);return n.length?`
    <div class="oneseat">
      <h3>From here to the others</h3>
      <div class="os-others">${n.map(a=>`
    <button class="os-other" data-goto-dest="${h(a.key)}">
      <span class="os-name">${h(a.name)}</span>
      <span class="os-status ${h(a.status)}">${jo[a.status]}</span>
    </button>`).join("")}</div>
      <p class="note">Click one to measure the whole map to it instead.</p>
    </div>`:""}var jo={here:"you are here",keeps:"keeps",gains:"gains",loses:"loses",none:"no ride either way"};function Uo(e){return e==="any"?`Counted on any calendar, which is the published measure \u2014 no day type
       enters it.`:`Restricted to routes running on ${Mo[e]??e}, which is
       <b>not the published measure</b>: that one counts a route calling here
       on any calendar.`}function Kt(e,t,n){let o=Ao(e,t);if(!o)return"";let a=e.oneseat_day??"any",r=o.status==="here"?"":No(o)+Fo(o);return`
    <div class="place-head">
      <h2>One-seat ride to ${h(o.name)}</h2>
      <div class="muted">
        from ${h(Z(e))} \xB7 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)} \xB7
        within ${e.radius} m
      </div>
    </div>

    <div class="os-verdict ${h(o.status)}">${Co[o.status]}</div>
    <p class="note">${Eo[o.status]} ${Uo(a)}</p>

    ${r}

    ${Ho(e,o)}

    <details class="svc">
      <summary>Service at this spot: ${It(e,n)}</summary>
      ${Be(e,n)}
    </details>

    <p class="note">A one-seat ride says nothing about how long the trip takes
       or how often it runs \u2014 a surviving ride may be hourly on a Sunday. The
       counts above answer how often; <b>Travel time</b> answers how long. This
       is also the only figure on the site that counts the T and the inclines:
       they are outside the Refresh, but leaving them out would show the South
       Hills losing Downtown rides the Blue Line still runs.</p>`}function Wt(e){return`
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
    </div>`}var pe={gone:{color:"#e8232f",size:6},halved:{color:"#ef5c33",size:4.5},less:{color:"#b06a55",size:3},same:{color:"#6b7280",size:2.5},more:{color:"#478a68",size:3},doubled:{color:"#12a163",size:4.5},new:{color:"#0f79c9",size:6},none:{color:"#3a3f4a",size:2}},Ie="change",me="change-dots",de=null,B=new Set;function ze(){return de}function Ke(e){return B.has(e)}function Yt(e,t,n,o,a,r,i){let s={};for(let c of n)s[c]=0;for(let c of e){if(!Vt(c,o,a,r,i))continue;let d=n[E(c,Q(t))];d!==void 0&&s[d]++}return s}function Vt(e,t,n,o,a){let r=E(e,0),i=E(e,1);return r>=n&&r<=a&&i>=t&&i<=o}function Gt(e,t,n,o,a,r,i){let s={riders:{},measured:{},unmeasured:0};for(let c of n)s.riders[c]=0,s.measured[c]=0;for(let c of e){if(!Vt(c,o,a,r,i))continue;let d=n[E(c,Q(t))];if(d===void 0)continue;let p=Et(c,t);if(p===null){d!=="none"&&s.unmeasured++;continue}s.riders[d]+=p,s.measured[d]++}return s}function Bo(e){let t=e.buckets.map(n=>n.key);return{type:"FeatureCollection",features:e.points.filter(n=>x.some((o,a)=>t[E(n,Q(a))]!=="none")).map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{published:n[2],...Object.fromEntries(x.flatMap((o,a)=>[[`b${a}`,t[E(n,Q(a))]],[`c${a}`,n[Tt(a)]],[`p${a}`,n[Ct(a)]]]))}}))}}function ee(e,t){let n=Object.entries(pe).flatMap(([o,a])=>[o,a[t]]);return["match",["get",`b${e}`],...n,pe.none[t]]}function qt(e){return["interpolate",["linear"],["zoom"],9,["*",ee(e,"size"),.45],12,ee(e,"size"),16,["*",ee(e,"size"),1.9]]}function Xt(e){e.addSource(Ie,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:me,type:"circle",source:Ie,paint:{"circle-color":ee(0,"color"),"circle-radius":qt(0),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.5,12,1,16,1.6]}},"walk-fill")}async function We(e,t,n){return de=await L(`/api/change?radius=${t}`),e.getSource(Ie).setData(Bo(de)),Ye(e,n),de}function Ye(e,t){let n=x.indexOf(t);e.setPaintProperty(me,"circle-color",ee(n,"color")),e.setPaintProperty(me,"circle-radius",qt(n)),Ve(e,t)}function Qt(e,t,n){B.has(t)?B.delete(t):B.add(t),Ve(e,n)}function Zt(e,t){B.clear(),Ve(e,t)}function Ve(e,t){let n=x.indexOf(t),o=["none",...B];e.setFilter(me,["!",["in",["get",`b${n}`],["literal",o]]])}function en(e,t,n){let o=x.indexOf(t),a=e[`b${o}`],r=n.find(d=>d.key===a)?.label??a,i=e[`c${o}`],s=e[`p${o}`];return`<b>${r}</b><br>${i} \u2192 ${s} buses per ${t==="weekday"?"weekday":t}<br><span style="opacity:.6">click for the full comparison</span>`}var Ge="surface",ye="surface-fill",tn="#6b7280",qe=[[-2,"#d01c2f"],[-1,"#ef5c33"],[-.138,tn],[.138,tn],[1,"#12a163"],[2,"#0b7a48"]],M="#e8232f",A="#0f79c9",nn=2,he=null,on=!1;function fe(){return he}function Xe(){return on}function an(e,t){if(e<=0||t<=0)return null;let n=Math.log2(t/e);return Math.max(-nn,Math.min(nn,n))}function rn(e,t){return e<=0&&t<=0?"none":e<=0?"new":t<=0?"gone":"ramp"}function sn(e,t,n,o,a,r,i,s){let c={gone:0,less:0,same:0,more:0,new:0};for(let d of e){let p=i.lat0+(d[1]+.5)*i.dlat,w=i.lon0+(d[0]+.5)*i.dlon;if(p<o||p>r||w<n||w>a)continue;let R=d[He(t)],_=d[je(t)],P=rn(R,_);if(P!=="none")if(P==="ramp"){let m=an(R,_);c[m<-.138?"less":m>.138?"more":"same"]+=s}else c[P]+=s}return c}function Jo(e){let{lat0:t,lon0:n,dlat:o,dlon:a}=e.origin;return{type:"FeatureCollection",features:e.cells.map(r=>{let i=t+r[1]*o,s=i+o,c=n+r[0]*a,d=c+a;return{type:"Feature",geometry:{type:"Polygon",coordinates:[[[c,i],[d,i],[d,s],[c,s],[c,i]]]},properties:Object.fromEntries(x.flatMap((p,w)=>{let R=r[He(w)],_=r[je(w)];return[[`k${w}`,rn(R,_)],[`v${w}`,an(R,_)??0]]}))}})}}function ln(e){return["case",["==",["get",`k${e}`],"gone"],M,["==",["get",`k${e}`],"new"],A,["interpolate",["linear"],["get",`v${e}`],...qe.flatMap(([t,n])=>[t,n])]]}function J(e,t){return["case",["in",["get",`k${e}`],["literal",["gone","new"]]],t,["interpolate",["linear"],["abs",["get",`v${e}`]],0,t*.45,1,t]]}function cn(e,t){e.addSource(Ge,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:ye,type:"fill",source:Ge,layout:{visibility:"none"},paint:{"fill-color":ln(0),"fill-antialias":!1,"fill-opacity":["interpolate",["linear"],["zoom"],9,J(0,.85),13,J(0,.62),16,J(0,.45)]}},t)}async function Qe(e,t,n){return he=await L(`/api/surface?radius=${t}`),e.getSource(Ge).setData(Jo(he)),Ze(e,n),he}function Ze(e,t){let n=x.indexOf(t);e.setPaintProperty(ye,"fill-color",ln(n)),e.setPaintProperty(ye,"fill-opacity",["interpolate",["linear"],["zoom"],9,J(n,.85),13,J(n,.62),16,J(n,.45)])}function un(e,t){on=t,e.setLayoutProperty(ye,"visibility",t?"visible":"none")}var et=null;function ge(){return et}async function tt(e){return et=await L(`/api/population?radius=${e}`),et}function dn(e,t,n,o,a,r,i){let s={lost:0,gained:0,kept:0,none:0};for(let c of e){let d=i.lat0+(c[1]+.5)*i.dlat,p=i.lon0+(c[0]+.5)*i.dlon;d<o||d>r||p<n||p>a||(s.lost+=c[Mt(t)],s.gained+=c[At(t)],s.kept+=c[Nt(t)],s.none+=c[Ft(t)])}return s}var nt="corridor",pn="corridor-lines",ve="#8b929c",Io="#6f7783",we={lost:M,added:A,kept:ve};var be=null,mn=!1;function Se(){return be}function ot(){return mn}function zo(e){return{type:"FeatureCollection",features:e.runs.map(t=>({type:"Feature",geometry:{type:"LineString",coordinates:t.geometry},properties:{klass:t.klass,length_m:t.length_m}}))}}function hn(e){let t=e.kept+e.lost;return{lostPct:t>0?e.lost/t*100:0,addedPct:t>0?e.added/t*100:0}}function Ko(){let e=t=>["match",["get","klass"],"lost",we.lost,"added",we.added,t];return["interpolate",["linear"],["zoom"],9,e(Io),14,e(ve)]}function Wo(){let e=["match",["get","klass"],"kept",.85,1];return["interpolate",["linear"],["zoom"],9,["*",e,1.2],13,["*",e,2.6],16,["*",e,6]]}function Yo(){return["match",["get","klass"],"kept",.85,.9]}function yn(e,t){e.addSource(nt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:pn,type:"line",source:nt,layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Ko(),"line-width":Wo(),"line-opacity":Yo()}},t)}async function at(e,t){return be=await L(`/api/corridors?day=${t}`),e.getSource(nt).setData(zo(be)),be}async function fn(e,t){x.includes(t)&&await at(e,t)}function gn(e,t){mn=t,e.setLayoutProperty(pn,"visibility",t?"visible":"none")}var st="#2b3038",bn="#b9bec6",te={loses:{color:M,size:6},gains:{color:A,size:6},keeps:{color:ve,size:3},here:{color:st,size:3.5},none:{color:bn,size:1.8}},ke=["loses","gains","keeps","none","here"],rt="oneseat",wn="oneseat-dots",Le=null,vn=!1;function I(){return Le}function it(){return vn}function Sn(e,t,n,o,a,r){let i={};for(let s of t)i[s]=0;for(let s of e){let c=s[0],d=s[1];if(c<o||c>r||d<n||d>a)continue;let p=t[s[3]];p!==void 0&&i[p]++}return i}function Vo(e){let t=e.statuses.map(n=>n.key);return{type:"FeatureCollection",features:e.points.map(n=>({type:"Feature",geometry:{type:"Point",coordinates:[n[1],n[0]]},properties:{status:t[n[3]],current:n[4],proposed:n[5]}}))}}function Go(){return["match",["get","status"],...Object.entries(te).flatMap(([e,t])=>[e,t.color]),bn]}function qo(){let e=["match",["get","status"],...Object.entries(te).flatMap(([t,n])=>[t,n.size]),te.none.size];return["interpolate",["linear"],["zoom"],9,["*",e,.45],12,e,16,["*",e,1.9]]}function Ln(e,t){e.addSource(rt,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:wn,type:"circle",source:rt,layout:{visibility:"none"},paint:{"circle-color":Go(),"circle-radius":qo(),"circle-opacity":.85,"circle-stroke-color":"rgba(255,255,255,.9)","circle-stroke-width":["interpolate",["linear"],["zoom"],9,.4,12,.9,16,1.5]}},t)}function Xo(e){return"key"in e?`dest=${encodeURIComponent(e.key)}`:`dest_lat=${e.lat.toFixed(6)}&dest_lon=${e.lon.toFixed(6)}`}var Qo="pin";function kn(e){return"key"in e?e.key:Qo}var $e="any";function Zo(e,t,n){return`radius=${e}&${Xo(t)}&day=${n}`}function $n(e,t){return e?t:$e}function xn(e,t){return e!=="oneseat"||t}async function lt(e,t,n,o=$e){return Le=await L(`/api/oneseat?${Zo(t,n,o)}`),e.getSource(rt).setData(Vo(Le)),Le}function On(e,t){vn=t,e.setLayoutProperty(wn,"visibility",t?"visible":"none")}function ct(e){let t=e.destination;return t.name?t.name:t.lat!=null&&t.lon!=null?`${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`:"the destination"}function Rn(e,t){let n=t.statuses.find(s=>s.key===e.status)?.label??e.status,o=(e.current||"").split(";").filter(Boolean),a=(e.proposed||"").split(";").filter(Boolean),r=s=>s.length?s.join(", "):"none",i=ct(t);return e.status==="here"?`<b>at ${i}</b><br><span style="opacity:.6">no one-seat ride needed</span>`:`<b>${n}</b> \u2014 ${i}<br>today: ${r(o)}<br>proposed: ${r(a)}`}var ut={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"};function ea(e){return e.buckets.filter(t=>t.key!=="none")}var _n={area:"Ground",people:"People"};function ta(e,t,n){let o=e.cell_m*e.cell_m/1e6,a=sn(e.cells,e.days.indexOf(t),n.west,n.south,n.east,n.north,e.origin,o),r=i=>i.toFixed(i<10?1:0);return`
      <div class="lg-area">
        <span><b>${r(a.gone)}</b> km\xB2 lose all service</span>
        <span><b>${r(a.less)}</b> km\xB2 less</span>
        <span><b>${r(a.more)}</b> km\xB2 more</span>
        <span><b>${r(a.new)}</b> km\xB2 new</span>
      </div>
      <div class="lg-ends" style="margin-top:4px">of ground in view, not of people</div>`}function na(e,t,n){let o='<div class="lg-ends" style="margin-top:4px">where people live in view \u2014 2020 census, counted at home, not where they board</div>';if(!n)return`<div class="lg-area"><span class="muted">loading\u2026</span></div>${o}`;let a=dn(n.cells,n.days.indexOf(e),t.west,t.south,t.east,t.north,n.origin),r=i=>Math.round(i).toLocaleString();return`
      <div class="lg-area">
        <span><b>${r(a.lost)}</b> people lose all service</span>
        <span><b>${r(a.gained)}</b> gain service</span>
        <span><b>${r(a.kept)}</b> keep a bus</span>
        <span><b>${r(a.none)}</b> have no bus either way</span>
      </div>
      ${o}`}function oa(e){let{layer:t,day:n,bounds:o,unit:a,population:r}=e;return`
    <div class="lg-ramp">
      <div class="lg-lab">Surface \u2014 buses per day, proposed vs today</div>
      <div class="lg-bar" style="background:linear-gradient(90deg, ${qe.map(([s,c])=>`${c} ${((s+2)/4*100).toFixed(1)}%`).join(", ")})"></div>
      <div class="lg-ends"><span>\xBC or less</span><span>same</span><span>4\xD7 or more</span></div>
      <div class="lg-steps">
        <span><i style="background:${M}"></i>loses all service</span>
        <span><i style="background:${A}"></i>new service</span>
      </div>
      <div class="seg lg-weight" role="group" aria-label="Show the surface as">
        ${Object.keys(_n).map(s=>`
          <button data-surface-unit="${s}" aria-pressed="${a===s}"
                  class="${a===s?"active":""}">${_n[s]}</button>`).join("")}
      </div>
      ${a==="people"?na(n,o,r):ta(t,n,o)}
    </div>`}var aa=["lost","added","kept"],ra={lost:"loses its bus",added:"gains a bus",kept:"keeps its bus"},sa={weekday:"weekday",saturday:"Saturday",sunday:"Sunday"};function Pn(e,t){let{lostPct:n,addedPct:o}=hn(t.km),a=s=>s.toFixed(1),i=(t.km.kept+t.km.lost+t.km.added).toLocaleString(void 0,{minimumFractionDigits:1,maximumFractionDigits:1});e.innerHTML=`
    <div class="lg-head">
      <b>${i}</b> km of street, citywide \u2014 ${sa[t.day]}
    </div>
    ${aa.map(s=>`
      <div class="lg-row lg-static">
        <i style="background:${we[s]}"></i>
        <span class="lg-lab">${h(ra[s])}</span>
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
      what you can still reach on foot.</div>`}function Tn(e,t,n){let o=t.statuses.map(p=>p.key),a=Sn(t.points,o,n.west,n.south,n.east,n.north),r=p=>t.statuses.find(w=>w.key===p)?.label??p,i=ke.reduce((p,w)=>p+(a[w]??0),0),s=ct(t),c=t.day&&t.day!==$e,d=c?`Restricted to routes running on ${ut[t.day]} at both ends \u2014 <b>not</b> the published day-free answer, which counts a
      route that calls here on any calendar. A ride shown here as surviving
      still may run only hourly on that day.`:`No day type enters this \u2014 a route serves a place or it doesn't \u2014 so a
      one-seat ride that survives may still be hourly on a Sunday, or take an
      hour to make. Switch the one-seat control to "Selected day" to ask
      about one day instead.`;e.innerHTML=`
    <div class="lg-head">
      One-seat ride to <b>${h(s)}</b>
      <span class="muted">\xB7 ${i.toLocaleString()} locations in view
      \xB7 ${t.radius} m walk${c?` \xB7 ${ut[t.day]}`:" \xB7 any day"}</span>
    </div>
    ${ke.map(p=>`
      <div class="lg-row lg-static">
        <i style="background:${te[p].color}"></i>
        <span class="lg-lab">${h(r(p))}</span>
        <span class="lg-n">${(a[p]??0).toLocaleString()}</span>
      </div>`).join("")}
    <div class="lg-ends" style="margin-top:4px">
      citywide: ${ke.map(p=>`${(t.counts[p]??0).toLocaleString()} ${h(r(p))}`).join(" \xB7 ")}
    </div>
    <div class="lg-foot">Can a rider reach ${h(s)} without transferring?
      ${d} No travel time enters it either, so a surviving ride may take
      an hour to make. Click a dot for that location's actual
      timetable. This is also the only view that counts the T and the inclines:
      they are unchanged by the Refresh, but leaving them out would show the
      South Hills losing rides the Blue Line still runs.</div>`}function Cn(e){return`
    <div class="pk-head">Around the pin</div>
    <span><i class="sw-pin"></i>the pin</span>
    <span><i class="sw-walk"></i>the ${e} m walk</span>
    <span><i class="sw-now"></i>stop today</span>
    <span><i class="sw-prop"></i>stop proposed</span>
    <span><i class="sw-both"></i>both, same spot</span>`}var Dn={locations:"Locations",riders:"Riders"};function ia(e){let n=`${e.toLocaleString()} location${e===1?"":"s"} in view`;return`<div class="lg-foot lg-foot-riders">${e?`<b>${n}</b> ${e===1?"gains":"gain"} a bus where none stops today, so there is no ridership to weigh there \u2014 this weighting can measure what is at risk and never what is gained.`:"Nothing observed can weigh a location the plan adds a bus to, so this weighting measures what is at risk and never what is gained."}
    Boardings are PRT's May 2025 daily averages at stops that exist today \u2014
    unlinked trips, not people, and by PRT's own disclaimer unofficial totals
    that may understate ridership by up to 30%.</div>`}function En(e,t){let{layer:n,day:o,bounds:a,weight:r,surface:i,unit:s="area",population:c}=t,d=n.buckets.map(g=>g.key),p=n.days.indexOf(o),{west:w,south:R,east:_,north:P}=a,m=ea(n),q=Yt(n.points,p,d,w,R,_,P),O=r==="riders"?Gt(n.points,p,d,w,R,_,P):null,X=g=>O?O.measured[g]?Math.round(O.riders[g]).toLocaleString():"\u2014":q[g].toLocaleString(),Lo=O?`<b>${Math.round(m.reduce((g,Ae)=>g+O.riders[Ae.key],0)).toLocaleString()}</b> daily boardings in view`:`<b>${m.reduce((g,Ae)=>g+q[Ae.key],0).toLocaleString()}</b>
       locations in view`;e.innerHTML=`
    <div class="lg-head">
      ${Lo}
      <span class="muted">\xB7 ${ut[o]} \xB7 ${n.radius} m walk</span>
    </div>
    <div class="seg lg-weight" role="group" aria-label="Count the dots by">
      ${Object.keys(Dn).map(g=>`
        <button data-weight="${g}" aria-pressed="${r===g}"
                class="${r===g?"active":""}">${Dn[g]}</button>`).join("")}
    </div>
    ${m.map(g=>`
      <button class="lg-row ${Ke(g.key)?"off":""}" data-bucket="${h(g.key)}"
              aria-pressed="${!Ke(g.key)}">
        <i style="background:${pe[g.key]?.color??"#666"}"></i>
        <span class="lg-lab">${h(g.label)}</span>
        <span class="lg-n">${X(g.key)}</span>
      </button>`).join("")}
    ${i?oa({layer:i,day:o,bounds:a,unit:s,population:c}):""}
    ${O?ia(O.unmeasured):`
    <div class="lg-foot">Buses per day within the walk radius, both directions.
      Counts are locations, not riders.</div>`}`}var dt="#4aa3ff",Un="#ffa23a",pt="headline",xe="journey",Bn="journey-rides",Jn="journey-walks",la=[Bn,Jn],In=null,zn=!1;function Re(){return In}function mt(){return zn}function ca(e,t){let n=e.radii[t],o=[];for(let a of["current","proposed"]){let r=n[a].itinerary;if(r)for(let i of r.legs){let s=i.from??e.origin,c=i.to??e.destination,d=[[s.lon,s.lat],[c.lon,c.lat]],p=i.path?.length?i.path:d;o.push({type:"Feature",geometry:{type:"LineString",coordinates:p},properties:{side:a,kind:i.kind,route:i.route}})}}return{type:"FeatureCollection",features:o}}function Mn(){return["match",["get","side"],"current",dt,"proposed",Un,dt]}function An(e){let t=(n,o)=>["match",["get","side"],"proposed",o*e,n*e];return["interpolate",["linear"],["zoom"],9,t(3.5,2),14,t(7,4)]}function Kn(e,t){e.addSource(xe,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),e.addLayer({id:Bn,type:"line",source:xe,filter:["==",["get","kind"],"ride"],layout:{visibility:"none","line-cap":"round","line-join":"round"},paint:{"line-color":Mn(),"line-width":An(1),"line-opacity":.85}},t),e.addLayer({id:Jn,type:"line",source:xe,filter:["==",["get","kind"],"walk"],layout:{visibility:"none","line-cap":"butt","line-join":"round"},paint:{"line-color":Mn(),"line-width":An(.6),"line-opacity":.8,"line-dasharray":[1.5,1.5]}},t)}function Wn(e,t){zn=t;for(let n of la)e.setLayoutProperty(n,"visibility",t?"visible":"none")}function ht(e,t){In=t;let n=t?ca(t,pt):{type:"FeatureCollection",features:[]};e.getSource(xe).setData(n)}function Yn(e,t,n){return`/api/journey?lat=${e.lat.toFixed(6)}&lon=${e.lon.toFixed(6)}&dest_lat=${t.lat.toFixed(6)}&dest_lon=${t.lon.toFixed(6)}&day=${n}`}var Nn=e=>`${e.toFixed(1)} min`;function Vn(e){return e==null?"\u2014":e===0?"no change":e>0?`${Nn(e)} slower`:`${Nn(-e)} faster`}function Fn(e,t){return e?e.name?h(e.name):`stop ${h(e.stop_id)}`:t}function ua(e,t){let n=Math.round(e.arrive-e.depart);if(e.kind==="walk"){let o=Fn(e.to,"the destination");return`<div class="jl"><span class="jl-what">walk ${n} min</span>
            <span class="muted">to ${o}</span></div>`}return`<div class="jl"><span class="jl-what">ride
          <span class="route">${h(e.route??"?")}</span> ${n} min</span>
          <span class="muted">to ${Fn(e.to,"the destination")}</span></div>`}function Hn(e,t){let n=[],o=null;for(let a of e.legs){let r=o?Math.round(a.depart-o.arrive):0;r>0&&n.push(`<div class="jl jl-wait"><span class="jl-what">wait ${r} min</span></div>`),n.push(ua(a,t)),o=a}return n.join("")}var da={no_origin_coverage:"No bus stops within a walk of this point on one or both networks, so there is no trip to time from here. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_dest_coverage:"No bus stops within a walk of the destination on one or both networks, so there is nothing to arrive at. That is a coverage answer rather than a travel-time one \u2014 the Locations and Surface views are where it is measured.",no_journey:"Both ends have buses, but no trip connects them inside this window on one or both networks \u2014 within the transfer walk below, and with a change of bus allowed."};function Oe(e){return e.median_min==null?"\u2014":e.median_min.toFixed(1)}function pa(e){return`
    <table class="periods jt">
      <thead><tr><th></th><th class="n">today</th><th class="n">prop.</th></tr></thead>
      <tbody>${[["Fastest minute to be ready",n=>n.best_min==null?"\u2014":n.best_min.toFixed(1)],["Slowest minute to be ready",n=>n.worst_min==null?"\u2014":n.worst_min.toFixed(1)],["Typical wait, included above",n=>n.median_wait_min==null?"\u2014":n.median_wait_min.toFixed(1)],["Changes of bus",n=>n.median_transfers==null?"\u2014":String(n.median_transfers)],["Minutes the trip can be made at all",n=>`${Math.round(n.reachable_fraction*100)}%`]].map(([n,o])=>`
        <tr><th>${n}</th>
          <td class="n">${o(e.current)}</td>
          <td class="n">${o(e.proposed)}</td></tr>`).join("")}
      </tbody>
    </table>`}function ma(e){let t=e.radii.strict,n=t.transfer_walk_m,o=e.sign_flips?`<p class="js-flip"><b>These two disagree about which network is
        faster.</b> The connections in this answer are invented \u2014 neither feed
        publishes them \u2014 and this trip is close enough to the line that the
        assumed transfer walk decides its direction. For this pair the
        disagreement is the finding; neither figure should be quoted on its
        own.</p>`:"";return`
    <div class="routes">
      <h3>If riders will only walk ${n} m to change bus</h3>
      <div class="jl"><span class="jl-what">${Oe(t.current)} \u2192
        ${Oe(t.proposed)} min</span>
        <span class="muted">${Vn(t.change_min)}</span></div>
      ${o}
    </div>`}function jn(e){let t=e.constants;return`<p class="note">Schedule against schedule: today's side is compared
    at its scheduled times, not the times its buses actually run, because the
    proposed network has no observed times and never will. Transfers are not
    published by either feed and are invented here \u2014 a rider is assumed to walk
    up to ${t.max_transfer_walk_m} m between stops at
    ${t.walk_speed_m_per_min} m per minute, with
    ${t.min_transfer_buffer_min} minutes of slack. Times are the median across
    every minute of the window, so half of them are worse.</p>`}function yt(e,t){let n=e.radii[pt],o=n.change_min==null?"flat":n.change_min>0?"down":n.change_min<0?"up":"flat",a=`
    <div class="place-head">
      <h2>Travel time to ${h(t)}</h2>
      <div class="muted">
        from ${e.origin.lat.toFixed(5)}, ${e.origin.lon.toFixed(5)} \xB7
        ${e.day} \xB7 ready at any minute between ${j(e.window.start_min)}
        and ${j(e.window.end_min)}
      </div>
    </div>`;return n.classification!=="comparable"?`${a}
      <div class="empty">
        <h2>No comparable trip</h2>
        <p>${da[n.classification]??""}</p>
      </div>
      ${jn(e)}`:`${a}
    <div class="headline">
      <div class="hl-side">
        <div class="hl-label">today</div>
        <div class="hl-n">${Oe(n.current)}</div>
      </div>
      <div class="hl-arrow">\u2192</div>
      <div class="hl-side">
        <div class="hl-label">proposed</div>
        <div class="hl-n">${Oe(n.proposed)}</div>
      </div>
      <div class="hl-delta ${o}">${Vn(n.change_min)}</div>
    </div>
    <div class="sub">minutes door to door, including the wait for the bus</div>

    ${pa(n)}

    <div class="routes">
      <h3>The trip that takes the median time</h3>
      <div class="rrow"><span class="rlab">today</span></div>
      ${n.current.itinerary?Hn(n.current.itinerary,e):""}
      <div class="rrow"><span class="rlab">proposed</span></div>
      ${n.proposed.itinerary?Hn(n.proposed.itinerary,e):""}
      <p class="note">One real trip out of the ${e.window.minutes} the window
        holds \u2014 the one that takes the median time \u2014 not a summary of several.</p>
    </div>

    ${ma(e)}
    ${jn(e)}`}function Gn(e){return`
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
    </div>`}function qn(e){let t=e?e.radii[pt].transfer_walk_m:400;return`
    <div class="lg-head"><b>The median morning trip</b></div>
    <div class="lg-row lg-static"><i style="background:${dt}"></i>
      <span class="lg-lab">today</span></div>
    <div class="lg-row lg-static"><i style="background:${Un}"></i>
      <span class="lg-lab">proposed</span></div>
    <p class="lg-foot">Rides follow the street the bus drives; dashed sections
      are walks, routed on sidewalks, alleys and steps. Assumes a rider will
      walk up to ${t} m to change bus \u2014 a number nobody publishes, so the
      panel answers at a stricter one too.</p>`}var ft=" \xB7 ",gt={dots:"Locations",surface:"Surface",both:"Locations + surface",corridors:"Streets",oneseat:"One-seat ride",journey:"Travel time"},Xn=Object.keys(gt);function Qn(e){return gt[e]??e}var ha={weekday:"a weekday",saturday:"a Saturday",sunday:"a Sunday"},ya=["oneseat","journey"];function fa(e){return e!=="journey"}function ga(e){let t=[gt[e.view]??e.view];return ya.includes(e.view)&&(t[0]+=` to ${e.destination}`),t.push(e.view==="oneseat"&&!e.oneSeatRestricted?"any day":ha[e.day]),fa(e.view)&&t.push(`${e.radius} m walk`),t.join(ft)}function Zn(e){let[t,...n]=ga(e).split(ft);return`<b>${h(t)}</b>${n.map(o=>ft+h(o)).join("")}`}var b={view:"view",day:"day",radius:"radius",oneSeatDay:"oneseatday",dest:"dest",weight:"weight",surfaceUnit:"surfaceunit",at:"at",camera:"map"},_e={any:"any",selected:"selected"},ba="pin",eo=5;function no(e){try{return e.self!==e.top}catch{return!0}}function oo(e){let t=new URLSearchParams;return t.set(b.view,e.view),t.set(b.day,e.day),t.set(b.radius,String(e.radius)),t.set(b.oneSeatDay,e.oneSeatRestricted?_e.selected:_e.any),t.set(b.dest,"key"in e.dest?e.dest.key:bt(e.dest)),e.weight==="riders"&&t.set(b.weight,e.weight),e.surfaceUnit==="people"&&t.set(b.surfaceUnit,e.surfaceUnit),e.at&&t.set(b.at,bt(e.at)),e.camera&&t.set(b.camera,`${bt(e.camera)},${e.camera.zoom.toFixed(2)}`),`?${t}`}function ao(e){let t=new URLSearchParams(e),n={},o=t.get(b.view);o&&Xn.includes(o)&&(n.view=o);let a=t.get(b.day);a&&x.includes(a)&&(n.day=a);let r=Number(t.get(b.radius));t.has(b.radius)&&Number.isFinite(r)&&r>0&&(n.radius=r),t.get(b.weight)==="riders"?n.weight="riders":t.get(b.weight)==="locations"&&(n.weight="locations"),t.get(b.surfaceUnit)==="people"?n.surfaceUnit="people":t.get(b.surfaceUnit)==="area"&&(n.surfaceUnit="area");let i=t.get(b.oneSeatDay);i===_e.selected?n.oneSeatRestricted=!0:i===_e.any&&(n.oneSeatRestricted=!1);let s=t.get(b.dest);if(s&&s!==ba){let p=to(s);p?n.dest=p:s.includes(",")||(n.dest={key:s})}let c=to(t.get(b.at));c&&(n.at=c);let d=wa(t.get(b.camera));return d&&(n.camera=d),n}function bt(e){return`${e.lat.toFixed(eo)},${e.lon.toFixed(eo)}`}function to(e){let t=ro(e,2);return t?{lat:t[0],lon:t[1]}:null}function wa(e){let t=ro(e,3);return t?{lat:t[0],lon:t[1],zoom:t[2]}:null}function ro(e,t){if(!e)return null;let n=e.split(",").map(Number);return n.length!==t||!n.every(Number.isFinite)?null:n}var wt="embed";var va=["1","true","yes"];function so(e){let t=new URLSearchParams(e).get(wt);return t!==null&&va.includes(t.toLowerCase())}function io(e){let t=new URLSearchParams(e);return t.set(wt,"1"),`?${t}`}function lo(e){let t=new URLSearchParams(e);t.delete(wt);let n=String(t);return n?`?${n}`:""}function co(e){return(e?`Full answer for ${e}`:"Open the full map")+" \u2197"}var C=["peek","half","full"],Sa=192,La=.3,ka=.55,$a=.9,xa=.6,Oa=.45;function De(e,t){return e==="peek"?Math.min(Sa,t*La):e==="half"?t*ka:t*$a}function Ra(e,t,n=0){let o=C.map(r=>Math.abs(De(r,t)-e)),a=o.indexOf(Math.min(...o));return Math.abs(n)>xa&&(a=Math.max(0,Math.min(C.length-1,a+(n>0?1:-1)))),C[a]}function uo(e){return C[(C.indexOf(e)+1)%C.length]}function _a(e,t){return Math.min(e,t*Oa)}function z(){return getComputedStyle(document.documentElement).getPropertyValue("--compact").trim()==="1"}function vt(e){let t=null,n=()=>{let o=z();o!==t&&(t=o,e(o))};return window.addEventListener("resize",n),n(),n}var Da=8,Pa=400;function po(e){let t=l("side"),n=l("sheet-handle"),o="peek",a=!1,r=0,i=0,s=0,c={y:0,t:0};function d(){return window.innerHeight}function p(m){t.style.height=`${m}px`,e.onMove(m,_a(m,d()))}function w(m){o=m,t.dataset.snap=m,p(De(m,d()))}n.addEventListener("pointerdown",m=>{z()&&(a=!0,r=m.clientY,i=t.getBoundingClientRect().height,s=m.timeStamp,c={y:m.clientY,t:m.timeStamp},t.classList.add("dragging"),n.setPointerCapture(m.pointerId))}),n.addEventListener("pointermove",m=>{if(!a)return;let q=i+(r-m.clientY),O=De("peek",d()),X=De("full",d());p(Math.max(O,Math.min(X,q))),c={y:m.clientY,t:m.timeStamp}});function R(m){if(!a)return;if(a=!1,t.classList.remove("dragging"),!(Math.abs(m.clientY-r)>Da)&&m.timeStamp-s<Pa){w(uo(o));return}let O=m.timeStamp-c.t,X=O>0?(c.y-m.clientY)/O:0;w(Ra(t.getBoundingClientRect().height,d(),X))}n.addEventListener("pointerup",R),n.addEventListener("pointercancel",R),n.addEventListener("keydown",m=>{m.key!=="Enter"&&m.key!==" "||(m.preventDefault(),z()&&w(uo(o)))});let _=vt(e.onLayoutChange);function P(){if(_(),!z()){t.style.height="",t.removeAttribute("data-snap"),e.onMove(0,0);return}w(o)}return window.addEventListener("resize",P),P(),{at:()=>z()?o:"full",atLeast(m){z()&&C.indexOf(m)>C.indexOf(o)&&w(m)}}}var Ta=[-79.9959,40.4406],Ca=12,Ea="#e2574c",D={radius:"data-radius",day:"data-day",oneSeatDay:"data-oneseat-day",view:"data-view",dest:"data-dest"},re=ao(location.search),ie=so(location.search);ie&&l("app").classList.add("embed");var Ma={at:()=>"full",atLeast(){}},ho=null,$=400,ne=null,f=null,K=null,F=0,S={key:"downtown"},N=null,yo=!1,V=!1,Ce="locations",G="area",y="dots",fo,Lt=[],u=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/positron",center:re.camera?[re.camera.lon,re.camera.lat]:Ta,zoom:re.camera?.zoom??Ca,cooperativeGestures:no(window),attributionControl:{compact:!0}});u.addControl(new maplibregl.NavigationControl,"top-right");u.on("load",()=>{_t(u),Xt(u),cn(u,"change-dots"),yn(u,"change-dots"),Ln(u,"walk-fill"),Kn(u),W(),u.on("click",t=>{if(yo){se({lat:t.lngLat.lat,lon:t.lngLat.lng});return}let n=["change-dots","oneseat-dots"].filter(r=>u.getLayoutProperty(r,"visibility")!=="none"),o=u.queryRenderedFeatures(t.point,{layers:n})[0],a=o?o.geometry.coordinates:[t.lngLat.lng,t.lngLat.lat];xt(a[1],a[0])});let e=new maplibregl.Popup({closeButton:!1,offset:8});u.on("mouseenter","change-dots",()=>{u.getCanvas().style.cursor="pointer"}),u.on("mouseleave","change-dots",()=>{u.getCanvas().style.cursor="",e.remove()}),u.on("mousemove","change-dots",t=>{let n=t.features?.[0],o=ze();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(en(n.properties,k(),o.buckets)).addTo(u)}),u.on("mouseenter","oneseat-dots",()=>{u.getCanvas().style.cursor="pointer"}),u.on("mouseleave","oneseat-dots",()=>{u.getCanvas().style.cursor="",e.remove()}),u.on("mousemove","oneseat-dots",t=>{let n=t.features?.[0],o=I();!n||!o||e.setLngLat(n.geometry.coordinates).setHTML(Rn(n.properties,o)).addTo(u)}),u.on("moveend",()=>{let t=u.getCenter();ho={lat:t.lat,lon:t.lng,zoom:u.getZoom()},v(),H()}),oe(D.radius,t=>{$=Number(t.dataset.radius),We(u,$,k()).then(v),fe()&&Qe(u,$,k()).then(v),ge()&&tt($).then(v),I()&&Pe(),f&&Y(f.lat,f.lon)}),oe(D.day,t=>{let n=t.dataset.day;Ut(n),y!=="journey"&&W(),Ye(u,n),Ze(u,n),y==="journey"&&f&&kt(f.lat,f.lon),Se()&&fn(u,n).then(v),V&&I()&&(Pe(),f&&Y(f.lat,f.lon)),v()}),oe(D.oneSeatDay,t=>{V=t.dataset.oneseatDay==="selected",mo(),Pe(),f&&Y(f.lat,f.lon)}),oe(D.view,t=>{let n=y;y=t.dataset.view,u.setLayoutProperty("change-dots","visibility",y==="dots"||y==="both"?"visible":"none"),Ua(y==="surface"||y==="both"),Ja(y==="corridors"),Ka(y==="oneseat"),za(y==="journey",n==="journey"),y!=="journey"&&n!=="journey"&&(y==="oneseat"||n==="oneseat")&&W({scrollToTop:!0}),Ia(y!=="corridors"&&y!=="journey");let o=y==="oneseat"||y==="journey";l("dest-controls").classList.toggle("hidden",!o),l("oneseat-day-controls").classList.toggle("hidden",y!=="oneseat"),mo(),o||Te(!1),wo()}),oe(D.dest,t=>{let n=t.dataset.dest;if(n==="pin"){Te(!0);return}Te(!1),se({key:n})}),l("legend").addEventListener("click",t=>{let n=t.target.closest("[data-weight]");if(n){Ce=n.dataset.weight,v(),H();return}let o=t.target.closest("[data-surface-unit]");if(o){G=o.dataset.surfaceUnit,Ba(G),H();return}let a=t.target.closest("[data-bucket]");a&&(Qt(u,a.dataset.bucket,k()),v())}),l("legend-reset").addEventListener("click",()=>{Zt(u,k()),v()}),l("legend-collapse").addEventListener("click",()=>{St(!l("legend-box").classList.contains("collapsed"))}),l("panel").addEventListener("click",t=>{let n=t.target.closest("[data-goto-dest]");n&&se({key:n.dataset.gotoDest})}),l("side-toggle").addEventListener("click",Ha),ie&&vt(St),fo=ie?Ma:po({onMove(t,n){document.documentElement.style.setProperty("--sheet-h",`${t}px`),u.setPadding({top:0,right:0,bottom:n,left:0})},onLayoutChange:St}),Na(),Me(),Ee(),Aa(re)||We(u,$,k()).then(v),Ga(),Va()});function oe(e,t){let n=`[${e}]`;document.querySelectorAll(n).forEach(o=>{o.addEventListener("click",()=>{document.querySelectorAll(n).forEach(a=>a.classList.toggle("active",a===o)),t(o),Me(),H()})})}function ae(e,t){let n=document.querySelector(`[${e}="${t}"]`);return n?.click(),n!==null}function Aa(e){let t=!1;return e.radius!==void 0&&(t=ae(D.radius,String(e.radius))||t),e.day&&(t=ae(D.day,e.day)||t),e.oneSeatRestricted!==void 0&&ae(D.oneSeatDay,e.oneSeatRestricted?"selected":"any"),e.weight&&(Ce=e.weight),e.surfaceUnit&&(G=e.surfaceUnit),e.dest&&("key"in e.dest?ae(D.dest,e.dest.key):se(e.dest)),e.view&&ae(D.view,e.view),e.at&&xt(e.at.lat,e.at.lon),t}function H(){let e={view:y,day:k(),radius:$,oneSeatRestricted:V,weight:Ce,surfaceUnit:G,dest:S,at:f,camera:ho},t=oo(e);history.replaceState(null,"",(ie?io(t):t)+location.hash),Ee(t)}function Ee(e=lo(location.search)){if(!ie)return;let t=l("embed-link");t.href=`${location.pathname}${e}${location.hash}`;let n=f?K?Z(K):"this point":null;t.querySelector(".el-action").textContent=co(n)}function Me(){l("statebar").innerHTML=Zn({view:y,day:k(),radius:$,oneSeatRestricted:V,destination:le()}),Fa()}function St(e){l("legend-box").classList.toggle("collapsed",e);let t=l("legend-collapse");t.textContent=e?"+":"\u2013",t.title=e?"Show the key":"Collapse the key",t.setAttribute("aria-expanded",String(!e))}function Na(){let e=t=>{l("app").classList.toggle("controls-open",t),l("controls-toggle").setAttribute("aria-expanded",String(t))};l("controls-toggle").addEventListener("click",()=>{e(!l("app").classList.contains("controls-open"))}),l("controls-scrim").addEventListener("click",()=>e(!1)),document.addEventListener("keydown",t=>{t.key==="Escape"&&e(!1)})}function Fa(){l("controls-toggle").firstChild?.remove(),l("controls-toggle").prepend(document.createTextNode(Qn(y)))}function Ha(){let e=l("app").classList.toggle("side-collapsed"),t=l("side-toggle");t.textContent=e?"\u203A":"\u2039",t.title=e?"Show the panel":"Hide the panel",t.setAttribute("aria-expanded",String(!e)),u.resize()}function v(){ja()}function ja(){if(l("legend-reset").classList.toggle("hidden",ot()||it()||mt()),mt()){l("legend").innerHTML=qn(Re());return}if(ot()){let n=Se();n&&Pn(l("legend"),n);return}if(it()){let n=I();if(!n)return;let o=u.getBounds();Tn(l("legend"),n,{west:o.getWest(),south:o.getSouth(),east:o.getEast(),north:o.getNorth()});return}let e=ze();if(!e)return;let t=u.getBounds();En(l("legend"),{layer:e,day:k(),bounds:{west:t.getWest(),south:t.getSouth(),east:t.getEast(),north:t.getNorth()},weight:Ce,surface:Xe()?fe():null,unit:G,population:ge()})}async function Ua(e){if(e&&!fe()){l("legend").classList.add("loading");try{await Qe(u,$,k())}finally{l("legend").classList.remove("loading")}}un(u,e),e&&G==="people"&&await go(),v()}async function go(){if(!ge()){l("legend").classList.add("loading");try{await tt($)}finally{l("legend").classList.remove("loading")}}}async function Ba(e){e==="people"&&Xe()&&await go(),v()}async function Ja(e){if(e&&!Se()){l("legend").classList.add("loading");try{await at(u,k())}finally{l("legend").classList.remove("loading")}}gn(u,e),v()}function Ia(e){document.querySelectorAll("[data-radius]").forEach(t=>{t.disabled=!e})}function W({scrollToTop:e=!1}={}){if(e&&(l("panel").scrollTop=0),Ee(),!K){y==="oneseat"?l("panel").innerHTML=Wt(le()):Bt(l("panel"));return}if(y==="oneseat"){let t=Kt(K,S,k());if(t){l("panel").innerHTML=t;return}}zt(K)}function za(e,t=!1){if(Wn(u,e),v(),!e){t&&(f?Y(f.lat,f.lon):W());return}Re()&&f?l("panel").innerHTML=yt(Re(),le()):l("panel").innerHTML=Gn(le())}async function kt(e,t){let n=++F;f={lat:e,lon:t},H(),So(e,t);let o=vo(),a=h(le());if(!o){l("panel").innerHTML=`<div class="empty"><h2>No destination yet</h2>
      <p class="muted">Still fetching where ${a} is. Try again in a
         moment, or pick a point on the map instead.</p></div>`;return}l("panel").innerHTML=`<div class="empty"><h2>Timing the trip\u2026</h2>
    <p class="muted">Routing both networks from this point to
       ${a}, at two transfer distances. A few seconds.</p></div>`;try{let r=await L(Yn({lat:e,lon:t},o,k()));if(n!==F)return;ht(u,r),l("panel").innerHTML=yt(r,a),v(),Ee()}catch(r){if(n!==F)return;ht(u,null),l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${r.message}</p></div>`}}function mo(){l("day-controls").classList.toggle("hidden",!xn(y,V))}function $t(){return $n(V,k())}async function Ka(e){e&&!I()&&await bo(()=>lt(u,$,S,$t())),On(u,e),v()}async function Pe(){await bo(()=>lt(u,$,S,$t())),v()}async function bo(e){l("legend").classList.add("loading");try{return await e()}finally{l("legend").classList.remove("loading")}}function se(e){if(S=e,Te(!1),Wa(),wo(),Me(),H(),y==="journey"){f&&kt(f.lat,f.lon),v();return}f?Y(f.lat,f.lon):W({scrollToTop:!0}),Pe()}function wo(){let e=vo();if(!(e!==null&&(y==="journey"||y==="oneseat"&&"lat"in S))){N?.remove(),N=null;return}N?N.setLngLat([e.lon,e.lat]).addTo(u):(N=new maplibregl.Marker({color:st,draggable:!0}).setLngLat([e.lon,e.lat]).addTo(u),N.on("dragend",()=>{let n=N.getLngLat();se({lat:n.lat,lon:n.lng})}))}function Wa(){let e=kn(S);document.querySelectorAll("[data-dest]").forEach(t=>{t.classList.toggle("active",t.dataset.dest===e)})}function vo(){if("lat"in S)return{lat:S.lat,lon:S.lon};let e=S.key,t=Lt.find(n=>n.key===e);return t?{lat:t.lat,lon:t.lon}:null}function le(){if("lat"in S)return`${S.lat.toFixed(4)}, ${S.lon.toFixed(4)}`;let e=S.key;return Lt.find(t=>t.key===e)?.name??e}function Te(e){yo=e,u.getCanvas().style.cursor=e?"crosshair":"",document.querySelectorAll('[data-dest="pin"]').forEach(t=>{t.classList.toggle("armed",e),t.textContent=e?"click the map\u2026":"Pick a point"})}async function Y(e,t){let n=++F;f={lat:e,lon:t},H(),l("panel").classList.add("loading"),So(e,t);try{let o="lat"in S?`&dest_lat=${S.lat.toFixed(6)}&dest_lon=${S.lon.toFixed(6)}`:"",a=await L(`/api/place?lat=${e.toFixed(6)}&lon=${t.toFixed(6)}&radius=${$}${o}&oneseat_day=${$t()}`);if(n!==F)return;Dt(u,e,t,$,a.current.stops,a.proposed.stops),Ya(),K=a,W({scrollToTop:!0})}catch(o){if(n!==F)return;l("panel").innerHTML=`<div class="empty"><h2>No answer for that point</h2>
       <p class="muted">${o.message}</p></div>`}finally{n===F&&l("panel").classList.remove("loading")}}function Ya(){l("pin-key").innerHTML=Cn($),l("pin-key").classList.remove("hidden")}function So(e,t){ne?ne.setLngLat([t,e]):(ne=new maplibregl.Marker({color:Ea,draggable:!0}).setLngLat([t,e]).addTo(u),ne.on("dragend",()=>{let n=ne.getLngLat();xt(n.lat,n.lng)}))}function xt(e,t){if(fo.atLeast("half"),y==="journey"){kt(e,t);return}Y(e,t)}async function Va(){try{Lt=await L("/api/destinations"),Me()}catch{}}async function Ga(){try{let e=await L("/api/meta"),t=`today: ${e.feeds.current_feed_version||"current GTFS"} \xB7 proposed: ${e.feeds.proposed_feed_version||"proposed-network feed"}`;l("feedline").textContent=t,l("feedline-methods").textContent=t,l("caveats").innerHTML=e.caveats.map(n=>`<li>${n.text}</li>`).join("")}catch{}}l("methods-open").addEventListener("click",()=>l("methods").classList.add("open"));l("methods-close").addEventListener("click",()=>l("methods").classList.remove("open"));})();
