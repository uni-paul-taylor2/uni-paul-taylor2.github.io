//just writing a lil bit more stuff... establishing some kind of "work flow" here
//won't take too long, u can watch
let elem=m=>document.createElement(m);

//helper functions
function appendBirdMainStyle(bird){//making a template based on the data in bird_
  //appends the bird in the style of index.html (very trashy rn and subject to change)
  //oh yeah, elem and not document.createElement because of line 3's declaration
  //let name=elem('header')
  //let div2=elem('div')*
  let div=elem('div') //div element
  let figure=elem('figure') //figure element
  let img=elem('img') //etc.......
  let caption=elem('figcaption')
  let p=elem('p')
  //div2.innerText=bird.comName*
  div.append(figure,p) //put figure element then p element just inside div
  /*
  <div>
    <figure>...</figure>
    <p>...</p>
  </div>
  */
  figure.append(img,caption) //append works the same here for putting <img> and <figcaption> inside <figure>
  caption.innerText=bird.locName
  img.src=bird.image
  p.innerText=`uh, idk the bird's species is ${bird.species}, scientific name ${bird.sciName}, genus of ${bird.genus}`
  //document.querySelector('header').appendChild(div2)*for one bird not here
  document.querySelector('main').appendChild(div) //finally, put <div> inside <main>
}
function urlFromBirdData(bird){
  let u=new URL(location.href)
  let keys=Object.keys(bird)
  for(let i=0;i<keys.length;i++){
    u.searchParams.append(keys[i],bird[keys[i]])
  }
  u.pathname="/onebird.html"
  return u.href
}

async function handleSearch(){
  let text=document.getElementById('searchbutton').value
  try{
    let result=await lib.specificBird(text)
    location.href=urlFromBirdData(result)
  }
  catch(err){
    location.pathname="/notfound.html"
  }
}
function appendBirdMainStyle(bird){
  let div=elem('div') //div element
  let figure=elem('figure') //figure element
  let img=elem('img') //etc.......
  let caption=elem('figcaption')
  let p=elem('p')
  div.append(figure,p) //put figure element then p element just inside div
  figure.append(img,caption) //append works the same here for putting <img> and <figcaption> inside <figure>
  caption.innerText=bird.locName
  img.src=bird.image
  p.innerText=`uh, idk the bird's species is ${bird.species}, scientific name ${bird.sciName}, genus of ${bird.genus}`
  document.querySelector('main').appendChild(div) //finally, put <div> inside <main>
}
function appendBirdOneStyle(bird){
  //okay so yeah just load the bird data into the page
  //so guys I think yall can do this one
  //you got this
}

/*
example bird data
eg 1: bird.speciesCode==="musduc"
eg 2: bird.kingdom==="Animalia"
{
  "speciesCode": "musduc",
  "comName": "Muscovy Duck",
  "sciName": "Cairina moschata",
  "locId": "L622107",
  "locName": "Pointe a Pierre Wildfowl Trust",
  "obsDt": "2023-07-20 13:47",
  "howMany": 8,
  "lat": 10.3306148,
  "lng": -61.451844,
  "obsValid": false,
  "obsReviewed": false,
  "locationPrivate": false,
  "subId": "S145144822",
  "image": "https://live.staticflickr.com/65535/52966310999_c09b97dc65_m.jpg",
  "scientificName": "Cairina moschata (Linnaeus, 1758)",
  "canonicalName": "Cairina moschata",
  "confidence": 98,
  "kingdom": "Animalia",
  "phylum": "Chordata",
  "order": "Anseriformes",
  "family": "Anatidae",
  "genus": "Cairina",
  "species": "Cairina moschata",
  "class": "Aves"
}
*/




//functions that mightn't be needed start
async function ABOUT(lib){
  //this would be for the about us page
  //mightn't need this one
  //hm.... real ig
}
async function NOTFOUND(lib){
  //this will be for the notfound page
  //can load the featured birds below the notfound message, but in cards like all birds with less info
}
async function RESULTS(lib){ //this entire page might be useless
  //this will be for the results page
  //can load cards for the results, all cards will link to the one bird page of that bird on the card
  //might need to do js if statement, if input for search is equal to the comname or scientific name, to display those cards
}
//functions that mightn't be needed end


async function ALLBIRDS(lib){
  //this will be for the allbirds page  also, 
  //only common name, location, image, in card format
  let birds=await lib.birdsNear() 
  
  //first set loaded immediately
  let i=0; //will be added by 9
  let end=Math.min(i+9,birds.length)
  await lib.loadMoreOn(birds,i,end-1);
  for(i;i<end;i++)
    appendBirdMainStyle(birds[i]);

  //all other sets loaded in 5 second gaps
  let s=setInterval(async function(){
    let end=Math.min(i+9,birds.length)
    await lib.loadMoreOn(birds,i,end-1);
    for(i;i<end;i++)
      appendBirdMainStyle(birds[i]);
    if(i>=birds.length-1) clearInterval(s);
  },5e3)
}
async function ONEBIRD(lib){
  //this will be on the page displaying one bird
  //as much data as possible for user to know, want image left data on right in a list maybe
  let q=new URLSearchParams(location.search)
  let bird={__proto__:null}
  q.forEach(function(value,key){
    bird[key]=value
  })
  //appendBirdMainStyle(bird);
  console.log(bird)
  appendBirdMainStyle(bird)
}
async function INDEX(lib){
  //this will be for the home page
  let notable=await lib.birdsOfNote()
  await lib.loadMoreOn(notable,0,9-1)
  //I set numbers here cuz all is like 190 and loading more on ALL AT ONCE isn't epic
  //ok, test twelve
  for(let i=0;i<9;i++){
    appendBirdMainStyle(notable[i]);
  }
  //basically without brackets u can only have "one" statement in it, everything else after is after the for loop
  //with brackets, everything inside the curly braces run
}




//code for respective pages, study above
const pageScripts={
  'about.html': ABOUT,
  'allbirds.html': ALLBIRDS,
  'index.html': INDEX,
  'notfound.html': NOTFOUND,
  'onebird.html': ONEBIRD,
  '': INDEX,
  __proto__: null
}
function intMain(lib){
  window.lib=lib //didn't wanna do this but gonna fix later
  let searchbar=document.getElementById('searchbutton')
  let searchbtn=document.getElementById('searchicon')
  searchbtn.addEventListener('click',handleSearch)
  searchbar.addEventListener('keypress',function(e){
    if(e.key==='Enter') handleSearch();
  })
  let page=location.pathname.substr(1);
  if(pageScripts[page]) pageScripts[page](lib);
}