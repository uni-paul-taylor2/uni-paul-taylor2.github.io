let elem=m=>document.createElement(m);

//Search Button Functions Start
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
//Search Button Functions End^^^


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


//Template Functions Start

//INDEX/Home Page
function appendBirdMainStyle(bird){
  let div=elem('div')
  let main=elem('main')
  let aside=elem('aside')
  let link=elem('a')
  let figure=elem('figure')
  let img=elem('img')
  let caption=elem('figcaption')
  let p=elem('p')
  div.append(aside, main)
  link.append(img)
  link.href=urlFromBirdData(bird)
  aside.append(figure)
  figure.append(link,caption)
  caption.innerText=`${bird.comName}`
  img.src=bird.image
  main.append(p)
  p.innerText=`This bird is commonly known as the ${bird.comName}, but is scientifically referred to as the ${bird.sciName}. \nIt is of the ${bird.genus} genus, hails from the ${bird.order} order and is a member of the ${bird.family} family. \nIn the image, it was recently spotted at ${bird.locName}.`
  document.querySelector('div').appendChild(div)
}

//One Bird
function appendBirdOneStyle(bird){
  let birdHeader=document.querySelector('header')
  birdHeader.innerText=bird.comName;
  let data=elem('p'), img=elem('img'), text=elem('p')
  data.innerText=`\n${bird.sciName} Taxonomy:\n\n Kingdom: ${bird.kingdom}\nPhylum: ${bird.phylum}\nClass: ${bird.class}\nOrder: ${bird.order}\nFamily: ${bird.family}\nGenus: ${bird.genus}\nSpecies: ${bird.species}`
  
  img.src=bird.image
  
  let bold=t=>`<b>${t}</b>`
  let content=`This bird is commonly known as the ${bold(bird.comName)}, but is scientifically referred to as the ${bold(bird.sciName)}.`
  content+=`<br>It is of the ${bold(bird.genus)} genus, hails from the ${bold(bird.order)} order and is a member of the ${bold(bird.family)} family.`
  content+=`<br>In the image, it was recently spotted at <i>${bird.locName}</i>.`
  text.innerHTML=content
  
  document.getElementById('onebirdimage').appendChild(img)
  document.querySelector('main').appendChild(text)
  document.querySelector('main').appendChild(data)
  
}

//All Birds
function appendBirdAllStyle(bird){
  let div=elem('article')
  let link=elem('a')
  let img=elem('img')
  let name=elem('p')
  name.style="word-wrap:break-word; max-width:50%";
  link.append(img)
  link.href=urlFromBirdData(bird)
  div.append(link, name)
  img.src=bird.image
  name.innerText=`${bird.comName}\n${bird.sciName}\n${bird.locName}`
  document.querySelector('main').appendChild(div)
}

//Template Functions End^^^




//Functions to Get Data Start

//All Birds
async function ALLBIRDS(lib){
  //this will be for the allbirds page  also, 
  //only common name, location, image, in card format
  let birds=await lib.birdsNear() 
  
  //first set loaded immediately
  let i=0;//will be added by 9
  let end=Math.min(i+9,birds.length)
  await lib.loadMoreOn(birds,i,end-1);
  for(i;i<end;i++)
    appendBirdAllStyle(birds[i]);

  //another set loaded ONLY WHEN user is near the bottom (checks every second)
  let b1=document.body, b2=document.documentElement, isLoading=false
  let isNearBottom=_=>b1.clientHeight-Math.max(b1.scrollTop,b2.scrollTop)<outerHeight*1.5;
  let s=setInterval(async function(){
    if(isLoading||!isNearBottom()) return null;
    isLoading=true;
    let end=Math.min(i+9,birds.length)
    await lib.loadMoreOn(birds,i,end-1);
    for(i;i<end;i++)
      appendBirdAllStyle(birds[i]);
    if(i>=birds.length-1) clearInterval(s);
    isLoading=false;
  },1e3)
}


//One Bird
async function ONEBIRD(lib){
  let q=new URLSearchParams(location.search)
  let bird={__proto__:null}
  q.forEach(function(value,key){
    bird[key]=value
  })
  document.title="Trinidad Birds | "+bird.comName;
  console.log(bird)
  appendBirdOneStyle(bird)
  //appendBirdMainStyle(bird)
}


//Index/Home Page
async function INDEX(lib){
  let notable=await lib.birdsOfNote()
  await lib.loadMoreOn(notable,0,9-1)
  for(let i=0;i<9;i++){
    appendBirdMainStyle(notable[i]);
  }
}

//Functions to Get Data End^^^


//code for respective pages, study above
const pageScripts={
  'allbirds.html': ALLBIRDS,
  'index.html': INDEX,
  'onebird.html': ONEBIRD,
  '': INDEX,
  __proto__: null
}

function intMain(lib){
  window.lib=lib
  let searchbar=document.getElementById('searchbutton')
  let searchbtn=document.getElementById('searchicon')
  searchbtn.addEventListener('click',handleSearch)
  searchbar.addEventListener('keypress',function(e){
    if(e.key==='Enter') handleSearch();
  })
  let page=location.pathname.substr(1);
  if(pageScripts[page]) pageScripts[page](lib);
}

function scrollToTop() {
  // Scroll to the top of the document
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function() {
  var button = document.getElementById('backToTopButton');
  if(!button) return null;
  // Show the button when the user scrolls down 20px from the top of the document
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
});