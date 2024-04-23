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
let eventS = [];        //elenco degli eventi
let modifying = -1;     //indice dell'evento che l'utente sta modificando
var votes = [];        // Array per salvare i voti

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
        throw "carattere proibito trovato";
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
  e li cambia in base a theme
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
    eventS.push(e);
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
    eventS.splice(modifying, 1, e);
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
  document.getElementById("inputNameM").value = eventS[i].name;
  document.getElementById("inputDateM").value = eventS[0].date.toISOString().split('T')[0];
  document.getElementById("inputDescM").value = eventS[i].desc;
}

/*
  elimina l'evento che si sta modificando
*/
function deleteEvent() {
  eventS.splice(modifying, 1);
  modifying = -1;
  cancelModifyEvent();
  save();
  regenerateEventList();
}

/*
  funzione per generare la lista degli eventi nella home
  quando è vuota fa visualizzare l'immagine e testo placeholder
*/
function regenerateEventList() {
  if (eventS.length > 0) {
    let elenco = document.getElementById("upcomingEvents");
    elenco.innerHTML = "";
    for (let i = 0; i < eventS.length; i++) {
      let evento = document.createElement("div");
      evento.classList.add("events");
      //aggiunta titolo
      let b = document.createElement("div");
      b.innerText = eventS[i].name;
      evento.appendChild(b);
      //aggiunta data
      b = document.createElement("div");
      b.innerText = eventS[i].date.getDay() + "/" + eventS[i].date.getMonth() + "/" + eventS[i].date.getFullYear();
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
        document.getElementById("eventDesc").innerText = eventS[i].desc;
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

    // Caricamento dei voti
    try {
      votes = JSON.parse(localStorage.votes);

      var container = document.getElementById("previousVotesContainer");
      container.innerHTML = ""; // Cancella i contenuti precedenti

      // Mostra i voti salvati precedentemente in ordine inverso
      for (var i = votes.length - 1; i >= 0; i--) {
        var vote = votes[i];

        var voteContainer = document.createElement("div");
        voteContainer.classList.add("vote-container");

        var materiaInfo = document.createElement("p");
        materiaInfo.textContent = "Materia: " + vote.materia;
        voteContainer.appendChild(materiaInfo);

        var dataInfo = document.createElement("p");
        dataInfo.textContent = "Data: " + vote.data;
        voteContainer.appendChild(dataInfo);

        var votoInfo = document.createElement("p");
        votoInfo.textContent = "Voto: " + vote.voto;
        voteContainer.appendChild(votoInfo);

        container.appendChild(voteContainer);
      }
    } catch (ex) {
      // Se non ci sono voti salvati o c'è un errore nel caricamento, gestiamo l'eccezione
      console.log("Nessun voto salvato o errore nel caricamento dei voti.");
    }

    // Caricamento degli eventi
    try {
      eventS = JSON.parse(localStorage.eventS);
      for (let i = 0; i < events.length; i++) {
        eventS[i] = new Event(eventS[i].name, eventS[i].date, eventS[i].desc);
        console.log(eventS[i]);
      }
    } catch (ex) {
      eventS = [];
    }

    // Caricamento delle materie
    try {
      subjects = JSON.parse(localStorage.subjects);
      let inputs = document.querySelectorAll('.subject, .color');
      for (let i = 0; i < inputs.length; i++) {
        if (subjects[i]) {
          inputs[i].value = subjects[i];
        }
      }
    } catch (ex) {
      subjects = [];
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
    localStorage.eventS = JSON.stringify(eventS);

    // Salvataggio dei voti 
    let voteContainers = document.querySelectorAll('.vote-container');
    voteContainers.forEach(container => {
      let vote = {
        materia: container.querySelector('.materia').textContent,
        data: container.querySelector('.data').textContent,
        voto: container.querySelector('.voto').textContent
      };
      votes.push(vote); // Aggiungiamo il voto all'array dei voti
    });
    localStorage.votes = JSON.stringify(votes); // Salviamo l'array dei voti

    // Salvataggio delle materie
    let subjects = [];
    let inputs = document.querySelectorAll('.subject, .color');
    for (let i = 0; i < inputs.length; i++) {
      subjects[i] = inputs[i].value;
    }
    localStorage.subjects = JSON.stringify(subjects);

  } catch (ex) {
    console.log("Errore di salvataggio");
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

//il codice per il mannaggia delle materie, però non va YIUPPE
function initializeSubjects() {
  console.log("Inizializzazione materie");

  // Carica le materie dal local storage
  loadFromStorage();

  // Genera i giorni della settimana e gli slot orari
  generateWeek();

  // Aggiungi un event listener a ogni input
  let inputs = document.querySelectorAll('.subject, .color');
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', save);
  }

  toSlide('subjects');
}

function generateWeek() {
  let week = document.getElementById('week');
  let days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  for (let i = 0; i < days.length; i++) {
    let day = document.createElement('div');
    day.className = 'day';
    day.innerHTML = '<h2>' + days[i] + '</h2>';
    for (let j = 0; j < 24; j++) {
      let hour = document.createElement('div');
      hour.className = 'hour';
      hour.innerHTML = '<input type="text" class="subject" placeholder="Inserisci la materia">' +
                       '<input type="color" class="color">';
      day.appendChild(hour);
    }
    week.appendChild(day);
  }
}
//tolgo il disturbo.

function mostraForm() {
  document.getElementById("introContainer").style.display = "none";
  document.getElementById("previousVotesContainer").style.display = "none"; // Nascondi i voti salvati durante l'inserimento del voto
  document.getElementById("formContainer").style.display = "block";
}

function inserisciVoto() {   
  
  var materia = document.getElementById("inputMateria").value;
  var data = document.getElementById("inputData").value;
  var voto = document.getElementById("inputVoto").value;

  // Calcoliamo il numero del voto
  var voteNumber = document.querySelectorAll(".vote-container").length + 1;

  // Creiamo il nuovo rettangolo del voto
  var newVoteContainer = document.createElement("div");
  newVoteContainer.classList.add("vote-container");

  // Aggiungiamo le informazioni del voto
  var voteInfo = document.createElement("p");
  voteInfo.textContent = "Voto #" + voteNumber + ": Materia: " + materia + ", Data: " + data + ", Voto: " + voto;
  newVoteContainer.appendChild(voteInfo);

  var previousVotesContainer = document.getElementById("previousVotesContainer");

  // Aggiungiamo il nuovo rettangolo del voto alla fine della lista
  previousVotesContainer.appendChild(newVoteContainer);

  // Aggiungiamo il voto alla memoria locale
  var votoInfo = {
      materia: materia,
      data: data,
      voto: voto
  };

  votes.push(votoInfo);
  localStorage.setItem("voti", JSON.stringify(votes));

  // Nascondiamo il modulo di inserimento del voto e mostriamo i voti salvati
  document.getElementById("formContainer").style.display = "none";
  document.getElementById("previousVotesContainer").style.display = "block";  
  
}

window.onload = function() {
  loadFromStorage(); // Carica i voti salvati solo all'avvio della pagina
  document.getElementById("iniziaButton").addEventListener("click", mostraForm);
  document.getElementById("inserisciButton").addEventListener("click", function() {
      inserisciVoto();
      //mostraForm(); // Dopo l'inserimento del voto, torna alla pagina iniziale
  });
};