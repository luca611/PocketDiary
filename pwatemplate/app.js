
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
let subjects = [];
let currentYear, currentMonth;
let events = {};
let lastSelectedDate = null;
let flagEvents = false;

//costanti del sito
let minNameLength = 3;
let maxNameLength = 20;
let maxDescLength = 1000;
let notAvailableChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "|", "!", "?", '"', "£", "$", "%", "&", "/", "*", "+", "=", "^", "(", ")", "{", "}", "[", "]", "ç", "@", "°", "#", "§", ";", ",", ":", ".", ">", "<"];

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
        //console.log(e);
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
  funzione specifica per non dover aggiungere alla mainApp la classe hidden
 */
function renderHomePage() {
  document.getElementById("appContainer").classList.remove("mainAppNotVisible")
  document.getElementById("appContainer").classList.add("mainAppVisible")
  document.getElementById("mainApp").classList.remove("mainAppNotVisible")
  document.getElementById("mainApp").classList.add("mainAppVisible")
}

/*
  verifica se gli eventi sono ancora ne futuro ed elimina quelli passati
*/
function updateHomepageEvent() {
  for (i = 0; i < eventS.length; i++) {
    if (eventS[i].date.getTime() < new Date().setHours(0, 0, 0, 0)) {
      eventS.splice(i, 1)
    }
  }
  save()
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

  if (tempName.length <= minNameLength) {
    throw "Il nome è troppo corto.";
  }

  if (tempName.length >= maxNameLength) {
    throw "Il nome è troppo lungo.";
  }

  if (!isValidString(tempName)) {
    throw "Il nome contiene caratteri non validi.";
  }

  if (tempDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
    throw "La data inserita è nel passato.";
  }

  if (tempDesc.length >= maxDescLength) {
    throw "La descrizione è troppo lunga.";
  }

  // Se siamo arrivati fin qui, l'input è valido, possiamo confermare l'evento
  let e = new Event(tempName, tempDate, tempDesc);
  eventS.push(e);
  save();
  regenerateEventList();

  //debug
  /*console.log("Evento confermato:");
  console.log("Nome:", tempName);
  console.log("Data:", tempDate.toDateString());
  console.log("Descrizione:", tempDesc);*/

  // Ripuliamo i campi del form
  document.getElementById("inputName").value = "";
  document.getElementById("inputDate").value = "";
  document.getElementById("inputDesc").value = "";

  //per semplicità chiamo questa anche se non viene cancellato l'evento
  cancelEvent();
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
  document.getElementById("eventView").classList.add("hidden");
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
      b.innerText = eventS[i].date.getDate() + "/" + (eventS[i].date.getMonth() + 1) + "/" + eventS[i].date.getFullYear(); //fix: getDay() restituisce il giorno della settimana (da 0 a 6) e non il giorno del mese
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
  carica il nome utente, il tema scelto, le materie e gli eventi salvati dal localstorage
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
      for (let i = 0; i < eventS.length; i++) {
        eventS[i] = new Event(eventS[i].name, eventS[i].date, eventS[i].desc);
        //console.log(eventS[i]);
      }
    } catch (ex) {
      eventS = [];
    }

    // Caricamento delle materie
    try {
      let s = JSON.parse(localStorage.subjects);
      for (let i = 0; i < s.length; i++) {
        subjects[i] = s[i];
      }
    } catch (ex) {
      subjects = [];
    }
    generateWeek();
    let inputs = document.querySelectorAll('.subject, .color');
    for (let i = 0; i < inputs.length; i++) {
      if (subjects[i]) {
        inputs[i].value = subjects[i];
        //console.log("s"+i)
      }
      inputs[i].addEventListener('change', save);
    }

    //console.log("Nome: " + name + "\nTema: " + theme);
    updateHomepageEvent()
    renderHomePage()
    toSlide("home");
  } catch (ex) {
    toSlide("start");
    //welcome();
  }
}


/*
  salva nome, materie, tema ed eventi nel localstorage
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
    //console.log("ciao")
    subjects = [];
    let inputs = document.querySelectorAll('.subject, .color');
    //console.log("Nnnnnnn")
    for (let i = 0; i < inputs.length; i++) {
      subjects.push(inputs[i].value);
      //console.log("aaaaa")
    }
    //console.log("addio")
    localStorage.subjects = JSON.stringify(subjects);

  } catch (ex) {
    console.log("Errore di salvataggio");
  }
}


/*
  cambia la slide visualizzata a schermo rendendo intabbabile le altre
*/
function toSlide(id) {
  //console.log("Chiamata a toSlide con ID:", id);

  // Nascondi tutti i div con la classe "slide"
  document.querySelectorAll("div.slide").forEach(function (e) {
    e.classList.add("hidden");
    e.querySelectorAll("*").forEach(function (e2) {
      e2.tabIndex = "-1";
    });
  });

  // Mostra il div con l'ID specificato
  let d = document.getElementById(id);
  if (d) {
    //console.log("Elemento con ID", id, " trovato. Mostrando...");
    d.classList.remove("hidden");
    d.querySelectorAll("*").forEach(function (e2) {
      e2.tabIndex = "";
    });
  } else {
    //console.error("Elemento con ID", id, " non trovato.");
  }
}

function generateWeek() {
  let week = document.getElementById('week');

  // Cancella tutto il contenuto di week
  week.innerHTML = '';
  let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < days.length; i++) {
    let weekday = document.createElement('div');
    weekday.className = 'weekday'; // Modificato il nome della classe
    weekday.classList.add('bGreen'); // Aggiunto il tema
    let heading = document.createElement('h2');
    heading.textContent = days[i];
    weekday.appendChild(heading);

    let slotsContainer = document.createElement('div');
    slotsContainer.className = 'slots-container';

    for (let j = 0; j < 8; j++) {
      let slot = document.createElement('div');
      slot.className = 'slot';

      let subjectInput = document.createElement('input');
      subjectInput.type = 'text';
      subjectInput.className = 'subject';
      subjectInput.placeholder = 'Insert subject';

      slot.appendChild(subjectInput); // Rimuovo l'elemento colorInput

      slotsContainer.appendChild(slot);
    }

    weekday.appendChild(slotsContainer);
    week.appendChild(weekday);
  }
}


function mostraForm() {
  document.getElementById("iniziaButton").style.display = "none";
  document.getElementById("previousVotesContainer").style.display = "none"; // Nascondi i voti salvati durante l'inserimento del voto
  document.getElementById("formContainer").style.display = "block";
}

function isValidDate(d) {
  notAvailableDateChars = notAvailableChars.splice(0, 1)
  notAvailableChars.push(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"])
  try {
    notAvailableDateChars.forEach(function (e) {
      if (d.includes(e)) {
        //console.log(e);
        throw "carattere proibito trovato";
      }
    });
  } catch (ex) {
    return false;
  }
  return true;
}

function inserisciVoto() {

  var materia = document.getElementById("inputMateria").value;
  var data = new Date(document.getElementById("inputData").value);
  var voto = document.getElementById("inputVoto").value;
  if (materia == null || data == null || voto == null || !isValidString(materia) || data.getTime() < new Date().setHours(0, 0, 0, 0) || voto < 0 || voto > 10) {
    console.log("Input non validi")
    return;
  }
  
  // Calcoliamo il numero del voto
  var voteNumber = document.querySelectorAll(".vote-container").length + 1;

  // Creiamo il nuovo rettangolo del voto
  var newVoteContainer = document.createElement("div");
  newVoteContainer.classList.add("vote-container");

  // Aggiungiamo le informazioni del voto
  var voteInfo = document.createElement("p");
  voteInfo.textContent =  " Materia: " + materia + "  Data: " + data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear() + "  Voto: " + voto;
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
  document.getElementById("iniziaButton").style.display = "block";

}

window.onload = function () {
  //loadFromStorage(); // Carica i voti salvati solo all'avvio della pagina
  document.getElementById("iniziaButton").addEventListener("click", mostraForm);
  document.getElementById("inserisciButton").addEventListener("click", function () {
    inserisciVoto();
    //mostraForm(); // Dopo l'inserimento del voto, torna alla pagina iniziale
  });
};

function initializeCalendar() {
  const currentDate = new Date();
  currentYear = currentDate.getFullYear();
  currentMonth = currentDate.getMonth();
  loadEvents();
  generateCalendar(currentYear, currentMonth);
  set_theme();
  updateEventList();
}


function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function generateCalendar(year, month) {
  const calendarDiv = document.getElementById('calendar');
  calendarDiv.innerHTML = '';

  const today = new Date();
  const currentDay = today.getDate();

  const lastDay = getLastDayOfMonth(year, month);
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDayIndex = new Date(year, month, lastDay).getDay();

  const prevLastDay = getLastDayOfMonth(year, month - 1);
  const nextFirstDay = new Date(year, month + 1, 1).getDay();

  const days = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ day: prevLastDay - i, month: month - 1, year: year });
  }

  for (let i = 1; i <= lastDay; i++) {
    days.push({ day: i, month: month, year: year });
  }

  for (let i = 1; i <= 6 - lastDayIndex; i++) {
    days.push({ day: i, month: month + 1, year: year });
  }

  days.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    dayDiv.dataset.date = `${day.year}-${(day.month + 1).toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`;

    if (day.month === today.getMonth() && day.year === today.getFullYear() && day.day === currentDay) {
      dayDiv.classList.add('current-day');
    }

    const fullDateDiv = document.createElement('div');
    fullDateDiv.textContent = `${day.day}/${day.month + 1}/${day.year}`;
    fullDateDiv.classList.add('full-date');

    dayDiv.appendChild(fullDateDiv);

    const eventsDiv = document.createElement('div');
    eventsDiv.classList.add('eventsCalendar');

    eventsDiv.classList.add('bGreen'); // Aggiunto il tema
    const dayKey = `${day.year}-${(day.month + 1).toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`;

    if (events[dayKey] && events[dayKey].length > 0) {
      events[dayKey].forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.textContent = event.name + ' (' + event.time + ')';
        eventElement.style.color = event.color;
        eventsDiv.appendChild(eventElement);
      });
    }



    dayDiv.appendChild(eventsDiv);

    calendarDiv.appendChild(dayDiv);
    calendarDiv.classList.remove('fc', 'fc-media-screen', 'fc-direction-ltr', 'fc-theme-standard');
  });
  set_theme();
}

function loadEvents() {
  const storedEvents = localStorage.getItem('events');
  if (storedEvents) {
    events = JSON.parse(storedEvents);
  }
}

function updateEventList() {
  const eventList = document.getElementById('eventsUl');
  eventList.innerHTML = '';

  // Creazione di un array di coppie [data, eventi] per ogni giorno con eventi
  const sortedEvents = Object.entries(events)
    .map(([dayKey, dayEvents]) => ({ date: dayKey, events: dayEvents }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Iterazione sugli eventi ordinati e aggiunta alla lista
  sortedEvents.forEach(({ date, events }) => {
    events.forEach((event) => {
      const eventListItem = document.createElement('li');
      const formattedDate = new Date(date).toLocaleDateString('it-IT');
      eventListItem.textContent = `${formattedDate}: ${event.name} (${event.time})`;

      eventList.appendChild(eventListItem);
    });
  });

  // Aggiorna il titolo della lista base
  /*const baseEventListTitle = document.getElementById('baseEventListTitle');
  baseEventListTitle.textContent = 'Eventi';*/
}

function prevMonth() {
  currentMonth -= 1;
  if (currentMonth < 0) {
    currentYear -= 1;
    currentMonth = 11;
  }
  generateCalendar(currentYear, currentMonth);
}

function nextMonth() {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentYear += 1;
    currentMonth = 0;
  }
  generateCalendar(currentYear, currentMonth);
}

function goToToday() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  generateCalendar(currentYear, currentMonth);
  updateEventList();
}

function showAddEventForm() {
  document.getElementById('addEventForm').style.display = 'block';
}

function addEvent() {
  const eventDate = document.getElementById('eventDateCalendar').value;
  const eventTime = document.getElementById('eventTimeCalendar').value;
  const eventName = document.getElementById('eventNameCalendar').value;
  const eventColor = document.getElementById('eventColorCalendar').value;

  // Assicurati che tutti i campi del form siano compilati
  if (!eventDate || !eventTime || !eventName || !eventColor) {
    alert('Si prega di compilare tutti i campi del form.');
    return;
  }

  const event = { name: eventName, time: eventTime, color: eventColor };

  try {
    const dayKey = new Date(eventDate).toISOString().split('T')[0];

    let storedEvents = localStorage.getItem('events');
    if (!storedEvents) {
      events = {};
    } else {
      events = JSON.parse(storedEvents);
    }

    if (!events[dayKey]) {
      events[dayKey] = [];
    }
    events[dayKey].push(event);

    localStorage.setItem('events', JSON.stringify(events));

    generateCalendar(currentYear, currentMonth);
    showAllEventsForDate();

    // Resetta i valori del form
    document.getElementById('eventDateCalendar').value = '';
    document.getElementById('eventTimeCalendar').value = '';
    document.getElementById('eventNameCalendar').value = '';
    document.getElementById('eventColorCalendar').value = '';

    // Nascondi il form dopo l'aggiunta di un nuovo evento
    document.getElementById('addEventForm').style.display = 'none';
  } catch (error) {
    //console.error('Errore durante il salvataggio degli eventi nel localStorage:', error);
  }
  set_theme();
  updateEventList();
}




function showEventsForDate(date) {
  const eventList = document.getElementById('eventsUl');
  eventList.innerHTML = '';

  // Ottieni la data selezionata e formatta il titolo degli eventi
  const selectedDate = new Date(date);
  lastSelectedDate = selectedDate;
  const formattedTitle = selectedDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  document.getElementById('eventList').getElementsByTagName('h2')[0].textContent = `Eventi ${formattedTitle}`;

  if (events[date] && events[date].length > 0) {
    events[date].forEach((event, index) => {
      const eventListItem = document.createElement('li');
      const eventContent = document.createElement('span');
      eventContent.textContent = `${date}: ${event.name} (${event.time})`;
      eventListItem.appendChild(eventContent);

      // Aggiungi il pulsante Modifica
      const editButton = document.createElement('button');
      editButton.textContent = 'Modifica';
      editButton.addEventListener('click', () => {
        editEventFromList(date, index);
      });
      eventListItem.appendChild(editButton);

      // Aggiungi il pulsante Elimina
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Elimina';
      deleteButton.addEventListener('click', () => {
        deleteEventFromList(date, index);
      });
      eventListItem.appendChild(deleteButton);

      eventList.appendChild(eventListItem);
    });

    // Aggiungi il pulsante "Visualizza tutti" alla fine della lista
    const viewAllButton = document.createElement('button');
    viewAllButton.textContent = 'Visualizza tutti';
    viewAllButton.addEventListener('click', () => {
      showAllEventsForDate(date);
    });
    eventList.appendChild(viewAllButton);
  } else {
    const noEventsMessage = document.createElement('li');
    noEventsMessage.textContent = 'Nessun evento per questa data.';
    eventList.appendChild(noEventsMessage);
    const viewAllButton = document.createElement('button');
    viewAllButton.textContent = 'Visualizza tutti';
    viewAllButton.addEventListener('click', () => {
      showAllEventsForDate(date);
    });
    eventList.appendChild(viewAllButton);
  }
}




function showAllEventsForDate(date) {
  // Ripristina il titolo predefinito della lista degli eventi
  const eventList = document.getElementById('eventsUl');
  eventList.innerHTML = '';
  //document.getElementById('eventList').getElementsByTagName('h2')[0].textContent = 'Eventi'; // Modifica il testo del titolo

  // Mostra tutti gli eventi per la data specificata
  const sortedEvents = Object.entries(events)
    .map(([dayKey, dayEvents]) => ({ date: dayKey, events: dayEvents }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedEvents.forEach(({ date, events }) => {
    events.forEach((event) => {
      const eventListItem = document.createElement('li');
      const formattedDate = new Date(date).toLocaleDateString('it-IT');
      eventListItem.textContent = `${formattedDate}: ${event.name} (${event.time})`;
      eventList.appendChild(eventListItem);
    });
  });
}




function editEventFromList(date, index) {
  const event = events[date][index];

  // Popola il form con i dettagli dell'evento
  document.getElementById('editEventForm').style.display = 'block';
  document.getElementById('editEventName').value = event.name;
  document.getElementById('editEventDate').value = date;
  document.getElementById('editEventTime').value = event.time;
  document.getElementById('editEventColor').value = event.color;

  // Quando viene cliccato "Salva modifiche", esegui la funzione updateEvent
  document.getElementById('saveEditEventButton').onclick = () => {
    updateEvent(date, index);
  };
}

function updateEvent(date, index) {
  const eventDate = document.getElementById('editEventDate').value;
  const eventTime = document.getElementById('editEventTime').value;
  const eventName = document.getElementById('editEventName').value;
  const eventColor = document.getElementById('editEventColor').value;

  // Rimuovi l'evento dalla data originale
  events[date].splice(index, 1);
  // Se non ci sono più eventi per la data originale, elimina la chiave
  if (events[date].length === 0) {
    delete events[date];
  }

  // Aggiungi l'evento alla nuova data
  const newDateKey = new Date(eventDate).toISOString().split('T')[0];
  if (!events[newDateKey]) {
    events[newDateKey] = [];
  }
  events[newDateKey].push({ name: eventName, time: eventTime, color: eventColor });

  // Salva gli eventi aggiornati nel localStorage
  localStorage.setItem('events', JSON.stringify(events));

  // Nascondi il form di modifica
  document.getElementById('editEventForm').style.display = 'none';

  // Genera il nuovo calendario e aggiorna la lista degli eventi
  generateCalendar(currentYear, currentMonth);
  showAllEventsForDate(date);
}

function deleteEventFromList(date, index) {
  const confirmDelete = confirm('Sei sicuro di voler eliminare questo evento?');
  if (confirmDelete) {
    events[date].splice(index, 1);
    if (events[date].length === 0) {
      delete events[date];
    }
    localStorage.setItem('events', JSON.stringify(events));

    generateCalendar(currentYear, currentMonth);
    showAllEventsForDate(date);
  }
}

function handleCalendarButtonClick() {
  initializeCalendar();
  toSlide('calendarDiv');
}

function showEvents() {
  let d = document.getElementById("eventList");
  if (!flagEvents) {
    d.classList.remove("hidden");
    flagEvents = true;
  } else {
    d.classList.add("hidden");
    flagEvents = false;
  }
  updateEventList();
}

function nascondiAggiunta() {
  document.getElementById("formContainer").style.display = "none";
  document.getElementById("previousVotesContainer").style.display = "block";
  document.getElementById("iniziaButton").style.display = "block";
}

function nascondiAggiuntaCalendario() {
  document.getElementById('addEventForm').style.display = 'none';
}