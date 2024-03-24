const cacheName = "pwaname"; //PWA id here
//Register PWA service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
//Redirect HTTP to HTTPS
if (location.protocol == "http:") {
  location.href = "https" + location.href.substring(4);
}
//Check for updates
let xhr = new XMLHttpRequest();
xhr.onload = function () {
  let v = xhr.responseText.trim();
  if (!localStorage.pwaversion) {
    localStorage.pwaversion = v;
  } else if (localStorage.pwaversion != v) {
    console.log("Updating PWA");
    delete localStorage.pwaversion;
    caches.delete(cacheName).then((_) => {
      location.reload();
    });
  }
};
xhr.onerror = function () {
  console.log("Update check failed");
};
xhr.open("GET", "pwaversion.txt?t=" + Date.now());
xhr.send();

//Your code here
let name;               //nome dell'utente
let theme = "bGreen";   //tema scelto, preimpostato a verde, chiamato come la classe del css per comodità
let events = [];        //elenco degli eventi

function Event(name, date, desc) {
  this.name = name;
  this.date = new Date(date);   //nel formato MM:GG:AA hh:mm:ss
  this.desc = desc;
}

Event.prototype = {
  constructor: Event,
  getName: function () {
    return name;
  },
  getDesc: function () {
    return desc;
  },
  //funzione per tornare quanto manca all'evento
  dateDiff: function () {
    let diff = new Date(this.date - Date.now());
    return diff.getUTCFullYear() - 1970;
  },
  getDate: function () {
    return date;
  },
};

function welcome() {
  name = document.getElementById("input_nome").value;
  //console.log(name);
  if (name.length < 3) {
    throw "Nome non disponibile";
  }
  document.getElementById("displayUsername").innerText = name;
  save();
}

function theme_choose(idB) {
  document.getElementById("greenB").classList.remove("selected_m");
  document.getElementById("greenI").classList.remove("selected");
  document.getElementById("blueB").classList.remove("selected_m");
  document.getElementById("blueI").classList.remove("selected");
  document.getElementById("yellowB").classList.remove("selected_m");
  document.getElementById("yellowI").classList.remove("selected");
  theme = idB.slice(0, -1);
  //console.log(theme)
  if (theme === undefined) {
    theme = "bGreen";
  }
  if (idB == "bGreenB") {
    document.getElementById("greenB").classList.add("selected_m");
    document.getElementById("greenI").classList.add("selected");
  }
  if (idB == "bBlueB") {
    document.getElementById("blueI").classList.add("selected_m");
    document.getElementById("blueI").classList.add("selected");
  }
  if (idB == "bYellowB") {
    document.getElementById("yellowB").classList.add("selected_m");
    document.getElementById("yellowI").classList.add("selected");
  }
  save();
  set_theme();
}

/*
  funzione per cambiare il tema dell'app
  prende tutti gli elementi con le classi css dei 3 colori principali
  e li cambia
*/
function set_theme() {
  document.getElementById("displayUsername").classList.add(theme.slice(1, theme.length).toLowerCase());
  //classi bx
  document.querySelectorAll(".bYellow").forEach(function (e) {
    e.classList.remove("bYellow");
    e.classList.add(theme);
  });
  document.querySelectorAll(".bBlue").forEach(function (e) {
    e.classList.remove("bBlue");
    e.classList.add(theme);
  });
  document.querySelectorAll(".bGreen").forEach(function (e) {
    e.classList.remove("bGreen");
    e.classList.add(theme);
  });
  //classi x
  /*document.querySelectorAll(".yellow").forEach(function (e) {
    e.classList.remove("yellow");
    e.classList.add(theme);
  });
  document.querySelectorAll(".blue").forEach(function (e) {
    e.classList.remove("blue");
    e.classList.add(theme);
  });
  document.querySelectorAll(".green").forEach(function (e) {
    e.classList.remove("green");
    e.classList.add(theme);
  });*/
  //classi bxD
  document.querySelectorAll(".bYellowD").forEach(function (e) {
    e.classList.remove("bYellowD");
    e.classList.add(theme + "D");
  });
  document.querySelectorAll(".bBlueD").forEach(function (e) {
    e.classList.remove("bBlueD");
    e.classList.add(theme + "D");
  });
  document.querySelectorAll(".bGreenD").forEach(function (e) {
    e.classList.remove("bGreenD");
    e.classList.add(theme + "D");
  });
}
/*
  funzione eseguita la clic del +
  mette il popup in sovraimpressione alla homepage
*/
function openEventCreation() {
  document.querySelectorAll("div.homepage").forEach(function (e) {
    e.querySelectorAll("*").forEach(function (e2) {
      e2.tabIndex = "-1";
    });
  });  
  document.getElementById("blackscreen").querySelectorAll("*").forEach(function (e) {
    e.tabIndex = "";
  });
  document.getElementById("blackscreen").classList.remove("hidden");
  document.getElementById("createEvent").classList.remove("hidden");
  document.getElementById("eventView").style.zIndex = "-2"; //non è il modo piu' etico che ci sia ma fa il suo lavoro per ora

}

/*
  fa sparire il popup e torna alla home normale
  i dati messi nei form restano ma non sono memorizzati
*/
function annullaEvento(){
  document.querySelectorAll("div.homepage").forEach(function (e) {
    e.querySelectorAll("*").forEach(function (e2) {
      e2.tabIndex = "0";
    });
  });
  document.getElementById("blackscreen").querySelectorAll("*").forEach(function (e) {
    e.tabIndex = "-1";
  });
  document.getElementById("blackscreen").classList.add("hidden");
  document.getElementById("createEvent").classList.add("hidden");
}

function apriChiudiBarra() {
  //document.getElementById("barraLaterale").classList.toggle("chiusa");
}

function loadFromStorage() {
  try {
    name = JSON.parse(localStorage.name);
    theme = JSON.parse(localStorage.theme);
    document.getElementById("displayUsername").innerText = name;
    console.log("Nome: " + name + "\nTema: " + theme);
  } catch (ex) {
    document.getElementById("start").classList.remove("hidden");
    welcome();
  }
  toSlide("home");
}

function save() {
  localStorage.name = JSON.stringify(name);
  localStorage.theme = JSON.stringify(theme);
}

function toSlide(id) {
  document.querySelectorAll("div.slide").forEach(function (e) {
    e.classList.add("hidden");
    e.querySelectorAll("*").forEach(function (e2) {
      e2.tabIndex = "-1";
    });
  });
  let d = document.getElementById(id);
  d.classList.remove("hidden");
  d.querySelectorAll("*").forEach(function (e2) {
    e2.tabIndex = "";
  });
}
