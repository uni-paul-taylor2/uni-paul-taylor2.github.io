(async function(){
  //treat this as a script library that's simply included, more info in script.js
  //that said, if this does interest you, feel free to scroll through it
  let random=(n=2**32)=>crypto.getRandomValues(new Uint32Array(1))[0]%n;
  Array.prototype.random=function(){
    return this[random(this.length)];
  }
  Math.random=function(){
    return random()/2**32;
  }
  async function qfetch(url,headers={},method="GET",returnType='json'){
    let options={method,headers};
    return await(await fetch(url,options))[returnType]();
  }

  //
  try{var IP=(await qfetch("https://api.iplocation.net/?cmd=get-ip")).ip} //to stop the "Not secure" sign
  catch{var IP=(await qfetch("https://ipv4.iplocation.net")).ip} //order of which url tried first switched
  var IPData=await qfetch("https://api.iplocation.net/?ip="+IP)
  let tag=IPData.country_code2, {country}=IPData, birdKey="4pbeve7calpf";
  //

  let filterAttrs=['rank','status','synonym','matchType']
  let uselessKey=key=>key.includes('Key')||filterAttrs.includes(key);
  async function loadMoreOn(birds,start=0,stop){
    if(typeof stop!=="number") stop=start+10;
    stop=Math.min(stop,birds.length-1);
    let promises=Array(stop-start+1);
    for(let i=start;i<=stop;i++){
      promises[i]=new Promise(async function(work,fail){
        try{
          let rebound="https://api-forwarder.paulrytaylor.repl.co/"
          let baseUrl="api.flickr.com/services/feeds/photos_public.gne?nojsoncallback=1&format=json&tagmode=all&tags="
          let data=await qfetch(rebound+baseUrl+encodeURI(birds[i].sciName))
          birds[i].image=data.items.random().media.m
          let taxonomy=await qfetch("https://api.gbif.org/v1/species/match?name="+encodeURI(birds[i].sciName))
          Object.keys(taxonomy).forEach(attribute=>{
            if(uselessKey(attribute)) return null;
            birds[i][attribute]=taxonomy[attribute];
          })
          work(birds[i])
        }
        catch(reason){console.warn(reason);fail(reason)}
      })
    }
    return await Promise.allSettled(promises)
  }
  async function birdsOfNote(){
    let testData=await qfetch("https://api.ebird.org/v2/data/obs/"+tag+"/recent/notable",{'X-eBirdApiToken':birdKey});
    let birds={__proto__:null}
    for(let i=0;i<testData.length;i++)
      if(!birds[testData[i].speciesCode]) birds[testData[i].speciesCode]=testData[i];
    return Object.values(birds);
  }
  async function birdsNear(){
    let testData=await qfetch("https://api.ebird.org/v2/data/obs/"+tag+"/recent",{'X-eBirdApiToken':birdKey});
    let birds={__proto__:null}
    for(let i=0;i<testData.length;i++)
      if(!birds[testData[i].speciesCode]) birds[testData[i].speciesCode]=testData[i];
    return Object.values(birds);
  }
  const birdRepo={__proto__:null};
  ([...await birdsNear(),...await birdsOfNote()]).forEach(part=>{
    birdRepo[part.sciName]=part
    birdRepo[part.comName]=part
    birdRepo[part.speciesCode]=part
    birdRepo[part.sciName.toLowerCase()]=part
    birdRepo[part.comName.toLowerCase()]=part
    birdRepo[part.speciesCode.toLowerCase()]=part
  })
  async function specificBird(birdName){
    let bird=birdRepo[birdName]
    if(!bird) throw '404';
    await loadMoreOn([bird],0,0);
    return bird;
  }
  let s=setInterval(_=>{
    if(typeof intMain==="function"){
      clearInterval(s);
      intMain({specificBird,birdsNear,birdsOfNote,loadMoreOn});
    }
  },20)
})()