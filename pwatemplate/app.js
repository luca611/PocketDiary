const cacheName='pwaname'; //PWA id here
//Register PWA service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
//Redirect HTTP to HTTPS
if(location.protocol=="http:"){
    location.href="https"+location.href.substring(4);
}
//Check for updates
let xhr=new XMLHttpRequest();
xhr.onload=function(){
    let v=xhr.responseText.trim()
    if(!localStorage.pwaversion){
        localStorage.pwaversion=v
    }else if(localStorage.pwaversion!=v){
        console.log("Updating PWA")
        delete(localStorage.pwaversion)
        caches.delete(cacheName).then(_=>{location.reload()})
    }
}
xhr.onerror=function(){
    console.log("Update check failed")
}
xhr.open("GET","pwaversion.txt?t="+Date.now())
xhr.send();

//Your code here
let name;               //nome dell'utente
let theme='green';      //tema scelto, preimpostato a verde
let events=[];          //elenco degli eventi

function Event(name,date,desc){
    this.name=name;
    this.date=new Date(date);
    this.desc=desc;
}

Event.prototype={
    constructor:Event,
    getName:function(){
        return name;
    },
    getDesc:function(){
        return desc;
    },
    dateDiff:function(){        //funzione per tornare quanto manca all'evento
        let diff=new Date(this.date-Date.now());
        return diff.getUTCFullYear()-1970;
    },
    getDate:function(){
        return date;
    }
}

function welcome(){
    name=document.getElementById("input_nome").value;
    //console.log(name);
    if(name.length<3){
        throw "Nome non disponibile";
    }
    document.getElementById('displayUsername').innerText=name;
    save();
    toSlide('themes');
}

function theme_choose(idB,idI){
    document.getElementById('greenB').classList.remove('selected_m');
    document.getElementById('greenI').classList.remove('selected');
    document.getElementById('blueB').classList.remove('selected_m');
    document.getElementById('blueI').classList.remove('selected');
    document.getElementById('yellowB').classList.remove('selected_m');
    document.getElementById('yellowI').classList.remove('selected');
    theme=idB.slice(0,-1);
    //console.log(theme)
    if(theme===undefined){
        theme='green';
    }
    document.getElementById(idB).classList.add('selected_m');
    document.getElementById(idI).classList.add('selected');
    save();
}

function eventCreation(){       //funzione eseguita al clic del +

}

function toEventSlide(id){
    document.querySelectorAll("div.slide").forEach(function(e){
        e.querySelectorAll("*").forEach(function(e2){
            e2.tabIndex="-1";
        });
    });
    let d=document.getElementById(id);
    d.classList.remove("hidden");
    d.querySelectorAll("*").forEach(function(e2){
        e2.tabIndex="";
    });
}

function loadFromStorage(){
    try{
        name=JSON.parse(localStorage.name);
        theme=JSON.parse(localStorage.theme);
        document.getElementById('displayUsername').innerText=name;
        console.log("Nome: "+name+"\nTema: "+theme);
    }catch(ex){
        document.getElementById('start').classList.remove('hidden');
        welcome();
    }
    toSlide('home');
}

function save(){
    localStorage.name=JSON.stringify(name);
    localStorage.theme=JSON.stringify(theme);
}

function toSlide(id){
    document.querySelectorAll("div.slide").forEach(function(e){
        e.classList.add("hidden");
        e.querySelectorAll("*").forEach(function(e2){
            e2.tabIndex="-1";
        });
    });
    let d=document.getElementById(id);
    d.classList.remove("hidden");
    d.querySelectorAll("*").forEach(function(e2){
        e2.tabIndex="";
    });
}

