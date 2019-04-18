/************* 18/04/2019: classe clsCalendar con le funzioni per gestire calendario */
const {google} = require('googleapis');
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendarId = process.env.GOOGLE_CALENDAR_ID; //'jqrf3mfgduhrrg0n6guig97tos@group.calendar.google.com';
var serviceAccountAuth={}; //verrà dalla lettura delle var di ambiente di Heroku
const calendar = google.calendar('v3');

// Define the length of the appointment to be one hour.
const appointmentDuration = 1;
const maxRis=10; //al massimo restituisci 10 appuntamenti
const timeZone = 'Europe/Rome';  // Change it to your time zone
const timeZoneOffset = '+02:00'; 

//recupero le credenziali dalle impostazioni di heroku app
var mail=process.env.GOOGLE_CLIENT_EMAIL;
var fixedKey = process.env.GOOGLE_CLIENT_PRIVATE_KEY;
fixedKey=fixedKey.replace(new RegExp("\\\\n", "\g"), "\n");
//console.log('mail cal '+ mail + ', chiave '+fixedKey);
serviceAccountAuth = new google.auth.JWT({
  email: mail,
  key: fixedKey,
  scopes: SCOPES
});

//funzioni per elencare, modificare eliminare eventi
 function listEvents(paramDate) {
    return new Promise((resolve, reject) => {
     var pd=convertParametersDateMia(paramDate,true);
     var fine=convertParametersDateMia(paramDate,false);
     var events=[];
       console.log('////////////////la data di inizio è ' + pd + ', fine è ' + fine);
  calendar.events.list({
    auth: serviceAccountAuth,
    calendarId: calendarId,
    timeMin: pd, // paramDate proviene dai params (new Date()).toISOString(),
    timeMax:fine,
    maxResults: maxRis,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error da listEvent: ' + err);
     events = res.data.items;
    if (events.length) {
      console.log('HO TROVATO EVENTI');
     
    } 
    resolve(events);
  }); 
});
}


//dataRichiesta,dateTimeStart,titolo
  function createAppointment (dateTimeStart, dateTimeEnd,titleSummary) {
    return new Promise((resolve, reject) => {
      console.log('in createAppointment il valore di dateTimeStart '+dateTimeStart);
      var nuovaData=convertParametersDate(dateTimeStart, dateTimeEnd);
      console.log('il tipo di nuovaData '+ typeof nuovaData + ' e con valore '+nuovaData); // object ok è una data
      var termine=addHours(nuovaData,appointmentDuration);
     
      console.log('ho aggiunto 1 ora in nuovadata quindi termina il ' + termine);
      //nuovaData=nuovaData.toISOString();
      //abilito il check se slot già occupato;
      calendar.events.list({  // List all events in the specified time period
        auth: serviceAccountAuth,
        calendarId: calendarId,
        timeMin:  nuovaData.toISOString(),// dinizio,
        timeMax: termine.toISOString()//dateTimeEnd.toISOString() .toISOString()
      }, (err, calendarResponse) => {
       
        if (err || calendarResponse.data.items.length > 0) {
          reject(err || new Error('Orario già occupato da un altro evento'));
        } else { //era commentato fino a qua
          // Create an event for the requested time period
          calendar.events.insert({ auth: serviceAccountAuth,
            calendarId: calendarId,
            resource: {summary: titleSummary,
              start: {dateTime: nuovaData}, //dateTimeStart
              end: {dateTime:  termine}}//dateTimeEnd nuovaData ->2019-04-05T10:00:00.000Z
          }, (err, event) => {
            err ? reject(err) : resolve(event);
          }
          );
       }
      });
    });
  }
  //05/04/2019 ELIMINARE EVENTO
  //recupero id degli eventi per cancellarli quindi prima lst
  //paramDate è dataRichiesta
function getEventsForDelete(paramDate) {
    return new Promise((resolve, reject) => {
     var pd=convertParametersDateMia(paramDate,true);
     var fine=convertParametersDateMia(paramDate,false);
      var id=[]; //array per id
       console.log('////////////////la data di inizio in getEventsForDelete è ' + pd + ', fine è ' + fine);
  calendar.events.list({
    auth: serviceAccountAuth,
    calendarId: calendarId,
    timeMin: pd, // paramDate proviene dai params (new Date()).toISOString(),
    timeMax:fine,
    maxResults: maxRis, //maxResults
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error da listEvent: ' + err);
    const events = res.data.items;
    if (events.length) {
      //console.log('Upcoming 10 events:');
      events.map((event, i) => {
        id[i] = event.id;
       
       // console.log(`${id} - ${event.id}`);
        console.log('----------- inserito in  id[i]= '+  id[i]);
       
        
      });
     
    } else {
      console.log('Non ci sono eventi in getEventsForDelete');
      //resolve('No upcoming events found');
    }
    //risolvo events, caricati o meno
     resolve(id);
  });
});
}
//funzione che elimina eventi
function deleteEvents(arIDs) {
    return new Promise((resolve, reject) => {
   console.log(' son in deleteEvents');
      if (arIDs.length){
        console.log('sono in deleteEvents e arIDs.length = ' +arIDs.length);
        for (var i=0;i<arIDs.length;i++){
          console.log('sto eliminando id evento : ' +arIDs[i]);
          calendar.events.delete({
          auth: serviceAccountAuth,
          calendarId: calendarId,
          eventId:arIDs[i]
		 });
         resolve('OK eliminato gli appuntamenti!');
       }  //chiudo for   
       
  }//chiudo if
    else {
      console.log('arIDs non pervenuto ');
      resolve('NOK');
    }
});
}
//per test
function deleteEventoSingolo(stringaID) {
  return new Promise((resolve, reject) => {
 console.log(' son in deleteEventoSingolo');
   
      console.log('sono in deleteEventoSingolo = ' +stringaID);
     
        
        calendar.events.delete({
        auth: serviceAccountAuth,
        calendarId: calendarId,
        eventId:stringaID
   });
       resolve('OK eliminato sto appuntamento del cazzo');
 
});
}
//FINE ELIMINAZIONE
/****************** */
/**** 08/04/2019 MODIFICA */
function getEventByIdEdit(dateStart,OraStart,titolo) {
  return new Promise((resolve, reject) => {
  console.log('*************sono in getEventByIdEdit con dateStart '+ dateStart +', OraStart '+ OraStart +', titolo '+ titolo);
   //recupero evento da spostare 
calendar.events.list({
  auth: serviceAccountAuth,
  calendarId: calendarId,
  auth: serviceAccountAuth,
  timeMin: convertParametersDate(dateStart,OraStart), 
  singleEvents: true,

  q: titolo //any

}, (err, res) => {
  if (err) return console.log('The API returned an error da listEvent: ' + err);
  const events = res.data.items;
  if (events.length) {
  
    events.map((event, i) => {
      var start = event.start.dateTime || event.start.date;
      var id=event.id; 
     console.log('il valore di id evento in getEventByIdEdit ' + id);

    });
   
  } else {
    console.log('Non ho trovato appuntamento con questo filtro');
    //resolve('No upcoming events found');
  }
  //risolvo events, caricati o meno
   resolve(events);
});
});
}
function getUpdate(IDEvent, dateStart2,oraStart2,titoloApp) {
  return new Promise((resolve, reject) => {
   
     console.log('IN getUpdate con idEvent '+ IDEvent);
    //da modificare le date come fatto in createAppointment
    // const appointmentDuration = 1;
      
    var nuovaData=convertParametersDate(dateStart2,oraStart2);
    console.log('in getUpdate nuovaData con valore '+nuovaData); 
    var termine=addHours(nuovaData,appointmentDuration);
    console.log('in getUpdate data termine con valore '+nuovaData); 
    //prima di inserire appuntamento modificato, controlla che non vada in sovrapposizione con esistente

    calendar.events.list({  // List all events in the specified time period
      auth: serviceAccountAuth,
      calendarId: calendarId,
      timeMin:  nuovaData.toISOString(),// dinizio,
      timeMax: termine.toISOString()//dateTimeEnd.toISOString() .toISOString()
    }, (err, calendarResponse) => {
     
      if (err || calendarResponse.data.items.length > 0) {
        reject(err || new Error('Orario già occupato da un altro evento'));
      } 
    });
    //se range temporale è libero, procedi con update
    calendar.events.update({ auth: serviceAccountAuth,
        calendarId: calendarId,
         eventId:IDEvent,
           //qui faccio le modifiche che servono                  
        resource: {summary: titoloApp, //ci vuole comunque il titoloApp altrimenti crea evento senza titolo
          start: {dateTime: nuovaData }, //	questo deve cambiare
          end: {dateTime: termine
         }},
          
      }, (err, res) => {
  if (err) return console.log('The API returned an error da updateEvent: ' + err);

      const event = res.data.id;
      console.log('res.data.id '+ event);
 
  if (event) {
   
    console.log('Modificato evento con id '+event);
  } else {
   
    console.log('Non ho modificato evento');
   
     
  }
  //risolvo events, caricati o meno
   resolve(event);
});
});
}

/***** helper functions */
// A helper function that adds the integer value of 'hoursToAdd' to the Date instance 'dateObj' and returns a new Data instance.
function addHours(dateObj, hoursToAdd) {
    return new Date(new Date(dateObj).setHours(dateObj.getHours() + hoursToAdd));
 }
  
  // A helper function that converts the Date instance 'dateObj' into a string that represents this time in English.
  function getLocaleTimeString(dateObj){
    return dateObj.toLocaleTimeString('it-IT', { hour: 'numeric', hour12: false, timeZone: timeZone });
  }
  
  // A helper function that converts the Date instance 'dateObj' into a string that represents this date in English.
  function getLocaleDateString(dateObj){
    return dateObj.toLocaleDateString('it-IT', { weekday: 'long',day: 'numeric', month: 'long',  timeZone: timeZone });
  } 
  function convertParametersDate(date, time){
      console.log('data: '+date + ' e  time: ' + time + ' con timeZoneOffset' +timeZoneOffset);
      var v=new Date(Date.parse(date.split('T')[0] + 'T' + time.split('T')[1].split('+')[0] + timeZoneOffset));
      console.log('dopo convert '+v);
      return v;
    //new Date(Date.parse(date.split('T')[0] + 'T' + time.split('T')[1].split('+')[0] + timeZoneOffset));
  }
  //funzione mia per recuperare la data solo
  function convertParametersDateMia(date, blnStart=true){
    var strData=[];
  
    strData=date.split('T');
    var s=strData[0];
    console.log('strData[0] = '+  s);
    
    if (blnStart)
        s+='T'+'00:00:00'+timeZoneOffset;
    else
      s+='T'+'23:59:59'+timeZoneOffset;
    console.log('la data ottenuta infine è ' + s);  
    return s;
  
  }
  exports.listEvents= listEvents;
  exports.addHours=addHours;
  exports.getLocaleTimeString=getLocaleTimeString;
  exports.getLocaleDateString=getLocaleDateString;
  exports.convertParametersDate=convertParametersDate;
  exports.convertParametersDateMia=convertParametersDateMia;
  exports.createAppointment=createAppointment;
  exports.getEventByIdEdit=getEventByIdEdit;
  exports.deleteEvents=deleteEvents;
  exports.getEventsForDelete=getEventsForDelete;
  exports.getUpdate=getUpdate;