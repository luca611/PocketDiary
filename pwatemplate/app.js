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
let modifying = -1;     //indice dell'evento che l'utente sta modificando

//costanti del sito
let minNameLength = 3;
let maxNameLength = 20;
let maxDescLength = 1000;
let notAvailableChars = ["|", "!", "?", '"', "£", "$", "%", "&", "/", "*", "+", "-", "=", "^", "(", ")", "{", "}", "[", "]", "ç", "@", "°", "#", "§", ";", ",", ":", ".", ">", "<"];

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

/*
  funzione eseguita alla'apertura dell'app la prima volta
  rileva il nome scelto (>= di 3 caratteri), lo scrive nella homepage e lo salva
*/
function welcome() {
  n = document.getElementById("input_nome").value;
  //console.log(n);
  if (n.length > minNameLength && n.length < maxNameLength && isValidString(n)) {
    document.getElementById("displayUsername").innerText = n;
    name = n.trim();
    save();
  } else {
    document.getElementById("nomeNonDisponibile").classList.remove("hidden");
    throw "Nome non disponibile";
  }
}

/*
  funzione per verificare se una stringa è valida
  una stringa è valida se non contiene i caratteri speciali presenti in notAvailableChars
*/
function isValidString(n) {
  try {
    notAvailableChars.forEach(function (e) {
      if (n.includes(e)) {
        console.log(e);
        throw "carattere proibito trovato"
      }
    });
  } catch (ex) {
    return false;
  }
  return true;
}

/*
  fa l'animazione della selezione dei pulsanti del tema
  rileva e imposta il tema dell'app
*/
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
  aggiunge un nuovo evento all'elenco prendendo i valori inseriti nel popUp
*/
function confirmEvent() {
  let tempName = document.getElementById("inputName").value;
  let tempDate = new Date(document.getElementById("inputDate").value);
  let tempDesc = document.getElementById("inputDesc").value;
  if (tempName.length > minNameLength && tempName.length < maxNameLength && isValidString(tempName) && tempDate.getTime() > Date.now() && tempDesc.length < maxDescLength) {
    let e = new Event(tempName, tempDate, tempDesc);
    //console.log(e);
    events.push(e);
    save();
    regenerateEventList();
    document.getElementById("inputName").value = "";
    document.getElementById("inputDate").value = "";
    document.getElementById("inputDesc").value = "";
    cancelEvent();  //per semplicità chiamo questa anche se non viene cancellato l'evento
  } else {
    throw "input non disponibili";
  }
}

/*
  fa sparire il popup e torna alla home normale
  i dati messi nei form restano ma non sono memorizzati
*/
function cancelEvent() {
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

/*
  chiude il popup di modifica dell'evento
*/
function cancelModifyEvent() {
  document.querySelectorAll("div.homepage").forEach(function (e) {
    e.querySelectorAll("*").forEach(function (e2) {
      e2.tabIndex = "0";
    });
  });
  document.getElementById("blackscreen").querySelectorAll("*").forEach(function (e) {
    e.tabIndex = "-1";
  });
  document.getElementById("blackscreen").classList.add("hidden");
  document.getElementById("modifyEvent").classList.add("hidden");
}

/*
  funzione per modificare un evento, elimina il vecchio evento e sostituisce col nuovo allo stesso indice
*/
function modifyEvent() {
  let tempName = document.getElementById("inputNameM").value;
  let tempDate = new Date(document.getElementById("inputDateM").value);
  let tempDesc = document.getElementById("inputDescM").value;
  if (tempName.length > minNameLength && tempName.length < maxNameLength && isValidString(tempName) && tempDate.getTime() > Date.now() && tempDesc.length < maxDescLength) {
    let e = new Event(tempName, tempDate, tempDesc);
    //console.log(e);
    events.splice(modifying, 1, e);
    save();
    modifying = -1;
    regenerateEventList();
    cancelModifyEvent();
    document.getElementById("inputNameM").value = "";
    document.getElementById("inputDateM").value = "";
    document.getElementById("inputDescM").value = "";
  } else {
    throw "input non disponibili";
  }
}

/*
  apre il popup di modifica dell'evento
*/
function openEventModify(i) {
  document.querySelectorAll("div.homepage").forEach(function (e) {
    e.querySelectorAll("*").forEach(function (e2) {
      e2.tabIndex = "-1";
    });
  });
  document.getElementById("blackscreen").querySelectorAll("*").forEach(function (e) {
    e.tabIndex = "";
  });
  document.getElementById("blackscreen").classList.remove("hidden");
  document.getElementById("modifyEvent").classList.remove("hidden");
  document.getElementById("eventView").style.zIndex = "-2";
  document.getElementById("inputNameM").value = events[i].name;
  document.getElementById("inputDateM").value = events[i].date.getFullYear + "-" + events[i].date.getMonth + "-" + events[i].date.getDay;
  document.getElementById("inputDescM").value = events[i].desc;
}

/*
  elimina l'evento che si sta modificando
*/
function deleteEvent() {
  events.splice(modifying, 1);
  modifying = -1;
  cancelModifyEvent();
  save();
  regenerateEventList();
}

/*
  funzione per generare la lista degli eventi nella home
  quando è vuota fa visualizzare l'immagine etesto placeholder
*/
function regenerateEventList() {
  if (events.length > 0) {
    let elenco = document.getElementById("upcomingEvents");
    elenco.innerHTML = "";
    for (let i = 0; i < events.length; i++) {
      let evento = document.createElement("div");
      evento.classList.add("events");
      //aggiunta titolo
      let b = document.createElement("div");
      b.innerText = events[i].name;
      evento.appendChild(b);
      //aggiunta data
      b = document.createElement("div");
      b.innerText = events[i].date.getDay() + "/" + events[i].date.getMonth() + "/" + events[i].date.getFullYear();
      evento.appendChild(b);
      //aggiunta pulsante descrizione a capo
      b = document.createElement("br");
      evento.appendChild(b);
      b = document.createElement("button");
      b.innerText = "Description";
      b.classList.add("defButton");
      b.classList.add("bGreen");
      b.classList.add("utilityButton");
      b.classList.add("inLabel");
      b.onclick = function () {
        document.querySelectorAll("div.homepage").forEach(function (e) {
          e.querySelectorAll("*").forEach(function (e2) {
            e2.tabIndex = "-1";
          });
        });
        document.getElementById("blackscreen").querySelectorAll("*").forEach(function (e) {
          e.tabIndex = "";
        });
        document.getElementById("blackscreen").classList.remove("hidden");
        document.getElementById("createEvent").classList.add("hidden");
        document.getElementById("eventView").classList.remove("hidden");
        document.getElementById("eventView").style.zIndex = "0";
        document.getElementById("eventDesc").innerText = events[i].desc;
      };
      evento.appendChild(b);
      //aggiunta modifica
      b = document.createElement("button");
      b.innerText = "Modify";
      b.classList.add("inLabel");
      b.classList.add("defButton");
      b.classList.add("utilityButton");
      b.classList.add("bGreen");
      b.onclick = function () {
        modifying = i;
        openEventModify(i);
      };
      evento.appendChild(b);
      elenco.appendChild(evento);
    }
    set_theme();
  } else {
    let placeholder = document.getElementById("upcomingEvents");
    placeholder.innerHTML = "";
    let img = document.createElement("img");
    img.src = "resources/notingToDo.svg";
    img.classList.add("motivationalImg");
    img.classList.add("bGreen");
    placeholder.appendChild(img);
    placeholder.appendChild(document.createElement("br"));
    let testo = document.createElement("p");
    testo.classList.add("white");
    testo.innerText = "Seems like you have nothing left to do, enjoy a break!";
    placeholder.appendChild(testo);
    set_theme();
  }
}

/*
  modifica alcune classi di alcuni elementi per far apparire la barra laterale
*/
function openSideBar() {
  document.getElementById("barraChiusa").classList.remove("barraLaterale");
  document.getElementById("barraChiusa").classList.add("aperta");
  document.getElementById("scuro").classList.remove("hidden");
  document.getElementById("scuro").classList.add("scuro");
  document.getElementById("iconeRid").classList.add("hidden");
  document.getElementById("barraAperta").classList.remove("hidden");
}

/*
  modifica alcune classi di alcuni elementi per far scomparire la barra laterale
*/
function closeSideBar() {
  document.getElementById("barraChiusa").classList.remove("aperta");
  document.getElementById("barraChiusa").classList.add("barraLaterale");
  document.getElementById("scuro").classList.remove("scuro");
  document.getElementById("scuro").classList.add("hidden");
  document.getElementById("iconeRid").classList.remove("hidden");
  document.getElementById("barraAperta").classList.add("hidden");
}

/*
  carica il nome utente, il tema scelto e gli eventi salvati dal localstorage
*/
function loadFromStorage() {
  try {
    name = JSON.parse(localStorage.name);
    theme = JSON.parse(localStorage.theme);
    document.getElementById("displayUsername").innerText = name;
    try {
      events = JSON.parse(localStorage.events);
      for (let i = 0; i < events.length; i++) {
        events[i] = new Event(events[i].name, events[i].date, events[i].desc);
        console.log(events[i]);
      }
    } catch (ex) {
      events = [];
    }
    console.log("Nome: " + name + "\nTema: " + theme);
    toSlide("home");
  } catch (ex) {
    toSlide("start");
    //welcome();
  }

}

/*
  salva nome, tema ed eventi nel localstorage
*/
function save() {
  try {
    localStorage.name = JSON.stringify(name);
    localStorage.theme = JSON.stringify(theme);
    localStorage.events = JSON.stringify(events);
  } catch (ex) {
    console.log("Errore di salvatggio");
  }
}

/*
  cambia la slide visualizzata a schermo rendendo intabbabile le altre
*/
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
