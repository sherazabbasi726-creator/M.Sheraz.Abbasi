"use strict";
const PointMatch=(()=>{
 function index(rows,step=2){let map=new Map();for(let p of rows){let k=Math.floor(p.easting/step)+','+Math.floor(p.northing/step);if(!map.has(k))map.set(k,[]);map.get(k).push(p)}return {map,step}}
 function nearest(ix,e,n,tolerance=1){let {map,step}=ix,ix0=Math.floor(e/step),iy0=Math.floor(n/step),hits=[],radius=Math.ceil(tolerance/step)+1;for(let x=ix0-radius;x<=ix0+radius;x++)for(let y=iy0-radius;y<=iy0+radius;y++)for(let p of map.get(x+','+y)||[]){let d=Math.hypot(p.easting-e,p.northing-n);if(d<=tolerance+1e-9)hits.push({p,d})}hits.sort((a,b)=>a.d-b.d);return hits}
 function classify(hits,epsilon=.02){if(!hits.length)return 'NO_MATCH';if(hits.length>1&&hits[1].d-hits[0].d<=epsilon)return 'AMBIGUOUS';return 'CANDIDATE'}
 function audit(observations,points,tolerance=1){let ix=index(points),result=[];for(let o of observations){let h=nearest(ix,o.easting,o.northing,tolerance),status=classify(h);result.push({...o,status,nearestId:h[0]?.p.pointNo||'',nearestDistance:h[0]?.d??null,candidateCount:h.length,designRL:h[0]?.p.designRL??null,nglRL:h[0]?.p.nglRL??null})}return result}
 return {index,nearest,classify,audit};})();if(typeof module!=='undefined')module.exports=PointMatch;
