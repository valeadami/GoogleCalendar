//01/04/2019 inizio sviluppo prototipo
/****************************************** */
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
/*********** */
const request = require('request');
const {google} = require('googleapis');
const querystring = require('querystring');
//const readline = require('readline');
//const path = require("path");
const https = require('https');


/*** DIALOGFLOW FULFILLMENT */
const {WebhookClient} = require('dialogflow-fulfillment');
/*** ACTIONS ON GOOGLE */

/** utilità */
const fs = require("fs");
const utf8=require('utf8');
//file di configurazione
/*const env = require('node-env-file');
env(__dirname + '/.env');*/

//const TOKEN_PATH = 'token.json';

var app = express();
/*var bot='HEAD'; // modificato in data 14/03/2019 in HEAD -->HEADdemo FarmaInfoBot
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

//inizializzo la sessione
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, maxAge: 180000,name:'JSESSIONID'}
  }));
//uso le variabili di sessione
app.use(function (req, res, next) {
   
    req.session.client_email=process.env.GOOGLE_CLIENT_EMAIL;
    var fixedKey = process.env.GOOGLE_CLIENT_PRIVATE_KEY;
    req.session.private_key= process.env.GOOGLE_CLIENT_PRIVATE_KEY; //fixedKey;
    console.log('sti cazzi de var de sessione in app.use '+ req.session.client_email + ', chiave '+req.session.private_key);

    fixedKey=fixedKey.replace(new RegExp("\\\\n", "\g"), "\n");
    console.log('DOPO REPLACE DE sto cazzo de fixedKey '+ fixedKey);

  
    
   
    next();
  })
  postData = querystring.stringify({
    'searchText': 'ciao',
    'user':'',
    'pwd':'',
    'ava':'FarmaInfoBot'
    
  });
  //questo diventerà un modulo con la conessione a PLQ
   const options = {
     //modifica del 12/11/2018 : cambiato porta per supportare HTTPS
     
    hostname: '86.107.98.69', 
    /*port: 8080,*/
    port: 8443,
    rejectUnauthorized: false, 
    path: '/AVA/rest/searchService/search_2?searchText=', 
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json', 
      'Cookie':'' // +avaSession 
    }
  };

  const SCOPES = 'https://www.googleapis.com/auth/calendar';
  const calendarId = process.env.GOOGLE_CALENDAR_ID; //'jqrf3mfgduhrrg0n6guig97tos@group.calendar.google.com';
  
  var serviceAccountAuth={}; //verrà dalla lettura delle var di ambiente di Heroku
  
  const calendar = google.calendar('v3');
  //process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements
  
  const timeZone = 'Europe/Rome';  // Change it to your time zone
  const timeZoneOffset = '+01:00'; 
  
 //PER TEST

   
    app.get('/', function(req, res, next) {
      
       // res.send('ok')
        res.send('<p>chiave: ' + req.session.private_key + ', email ' +req.session.client_email +'</p>');
       
     });
    app.get('/testLocale', function(req, res, next) {
      
       res.send('ok')
       //provo a leggere le variabili di ambiente settate su Heroku
       /*res.send('i valori di process.env.GOOGLE_CLIENT_EMAIL ' + process.env.GOOGLE_CLIENT_EMAIL + ', e di  process.env.GOOGLE_CLIENT_PRIVATE_KEY ' +  process.env.GOOGLE_CLIENT_PRIVATE_KEY);
       
        
         // Set up Google Calendar service account credentials
         serviceAccountAuth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_CLIENT_PRIVATE_KEY,
            scopes: SCOPES
        });
       console.log('questi i valori di serviceAccountAuth: email ' + serviceAccountAuth.email + ', key: ' +serviceAccountAuth.key +', con scope '+ SCOPES);
       */
       
        /* fs.writeFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, process.env.GOOGLE_CONFIG, (err) => {
            if (err) {
                console.log('ERRORE '+err);
                throw err;
              
              } else {
              console.log('SCRIVO IL FILE : '+process.env.GOOGLE_CONFIG);
              
              }
        });*/
    });
//PER TEST
app.get('/testSessione', function(req, res, next) {
    
        res.setHeader('Content-Type', 'text/html')
        res.write("sono nella root ");
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p> id sessione ' + req.session.id  +' expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    
        res.end()
    
    })


 function WebhookProcessing(req, res) {
    const agent = new WebhookClient({request: req, response: res});
    console.log('DA WebhookProcessing con SESSIONE : questi i valori di serviceAccountAuth: email ' + req.session.client_email + ', key: ' +req.session.private_key +', con scope '+ SCOPES);
    if (req.session.client_email && req.session.private_key){


        serviceAccountAuth = new google.auth.JWT({
            email: req.session.client_email,
            key: req.session.private_key,
            scopes: SCOPES
        });
    }else{
        console.log('sono in webhook per prendere chiave');
        const fixedKey = process.env.GOOGLE_SERVICE_PRIVATE_KEY.replace(new RegExp("\\\\n", "\g"), "\n");
       
        serviceAccountAuth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: fixedKey,
            scopes: SCOPES
        });
    }
    
    //10/01/2019
    //copiato codice da progetto api
    console.log('------sono su HeadDemo app ----- la richiesta proviene da '+ agent.requestSource);
    var name=req.body.queryResult.intent.name;
    var displayname=req.body.queryResult.intent.displayName;
    console.log('nome intent '+name+ ' , display name '+ displayname);
    //******************************************* */
  
    //recupero la sessionId della conversazione
    
    agent.sessionId=req.body.session.split('/').pop();
  //assegno all'agente il parametro di ricerca da invare sotto forma di searchText a Panloquacity
    agent.parameters['Command']=req.body.queryResult.parameters.Command;
    //recupero la data

    agent.parameters['date']=req.body.queryResult.parameters.date;
   console.log('la data = '+req.body.queryResult.parameters.date);
    //fulfillment text
    agent.fulfillmentText=req.body.queryResult.fulfillmentText;
    console.log('----> fulfillment text =' +agent.fulfillmentText);
    console.info(` sessione agente ` + agent.sessionId +` con parametri` + agent.parameters.Command);
  //20/03/2019 fallback su plq
    if (req.body.queryResult.parameters.searchText){

      console.log(' ho param searchText per PLQ =' + req.body.queryResult.parameters.searchText);
      agent.parameters['searchText']=req.body.queryResult.parameters.searchText;
    }
    //gestione degli intent
    //nuovo del 21/03/2019 fallback intent
      var blnIsFallback=req.body.queryResult.intent.isFallback;
      console.log('blnIsFallback ?? '+blnIsFallback);
     
     //la funzione callAva sostiutisce la funzione welcome 
     // callAVA anytext AnyText sostituisce 'qualunquetesto'
      let intentMap = new Map();
      if (blnIsFallback){
  
        //recupero il query text del body
        var stringa=req.body.queryResult.queryText;
        console.log('query text del fallback :'+stringa);
        agent.queryText=stringa;
        intentMap.set(displayname, callAVA);
        console.log('funzione callAva per default fallback');
      } else{
        intentMap.set(displayname, callAVANEW); 
        console.log('funzione callAVANEW per tutto il resto');
      }
    agent.handleRequest(intentMap);
  }
  
  //app.post('/fulfillment', appDFActions);
  app.post("/fulfillment", function (req,res){

    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('DIALOGFLOW Request body: ' + JSON.stringify(req.body));
    //console.log('vedo le var di sessione di Express ?? '+ req.session.id );
  //  autenticate();
    WebhookProcessing(req, res); 
  
  
  });

 // 18/12/2018
 function getComandi(arComandi)
  {

    var comandi=arComandi;
    if (comandi.length>0){
        //prosegui con il parsing
        //caso 1: ho solo un comando, ad esempio lo stop->prosegui con il parsing
        switch (comandi.length){
          case 1:
            comandi=arComandi;
            break;

          case 2:
          //caso 2: ho due comandi, stop e img=path image, quindi devo scomporre comandi[1] 
            var temp=arComandi[1].toString();
            //temp=img=https.....
            //splitto temp in un array con due elementi divisi da uguale
            temp=temp.split("=");
            console.log('valore di temp[1]= ' +temp[1]);
            arComandi[1]=temp[1];
            comandi=arComandi;

            //scompongo arComandi[1]
            break;

          default:
            //
            console.log('sono in default');

        }
       return comandi; //ritorno array come mi serve STOP oppure STOP, PATH img
      
    } else {
      console.log('non ci sono comandi')

      //non ci sono comandi quindi non fare nulla
      return undefined;
    }
   
  } 

 function callAVA(agent) {
  return new Promise((resolve, reject) => {
 
  let strRicerca=agent.queryText;
   console.log('valore di strRicerca ' + strRicerca);
  
  var str= utf8.encode(strRicerca); 
  if (str) {
    strRicerca=querystring.escape(str); 
    options.path+=strRicerca+'&user=&pwd=&ava='+bot;
  }
 
   let data = '';
    let strOutput='';
 
    const req = https.request(options, (res) => {
    console.log(`STATUS DELLA RISPOSTA: ${res.statusCode}`);
    console.log(`HEADERS DELLA RISPOSTA: ${JSON.stringify(res.headers)}`);


    res.setEncoding('utf8');
    res.on('data', (chunk) => {
     console.log(`BODY: ${chunk}`);
     data += chunk;
  
     let c=JSON.parse(data);
      strOutput=c.output[0].output;
      strOutput=strOutput.replace(/(<\/p>|<p>|<b>|<\/b>|<br>|<\/br>|<strong>|<\/strong>|<div>|<\/div>|<ul>|<li>|<\/ul>|<\/li>|&nbsp;|)/gi, '');
      agent.add(strOutput); 
      resolve(agent);
    });
    res.on('end', () => {
      console.log('No more data in response.');
      options.path='/AVA/rest/searchService/search_2?searchText=';      
      console.log('valore di options.path FINE ' +  options.path);
 
    });
  });
   req.on('error', (e) => {
   console.error(`problem with request: ${e.message}`);
   strOutput="si è verificato errore " + e.message;

  });

   req.write(postData);
  req.end();
  });
 }
 /* fine modifica del 21/03/2019 */

//mia nuova che non funziona 
function callAVANEW(agent) { 
    return new Promise((resolve, reject) => {
  
    let strRicerca='';
   
    let sessionId = agent.sessionId /*.split('/').pop()*/;
    console.log('dentro call ava il mio session id '+sessionId);
//questo lo tengo perchè mi serve per recuperare parametro comando proveniente dall'agente
    var str= utf8.encode(agent.parameters.Command); 
    if (str) {
      strRicerca=querystring.escape(str); //lo tengo comunque
     // options.path+=strRicerca+'&user=&pwd=&ava='+bot;
    
      console.log('il comando da passare : '+ strRicerca);
    }  
    var dataRichiesta=agent.parameters.date;
    var strOutput=agent.fulfillmentText; //è la risposta statica da DF messa da Roberto
    console.log('strOutput agente prima di EsseTre :' + strOutput);
   
    
    //IN BASE AL COMANDO ASSOCIATO ALL'INTENT ESEGUO AZIONE SU ESSETRE
      switch (strRicerca) {
        case 'getAppuntamenti':
            console.log('sono nel getAppuntamenti con data richiesta '+ dataRichiesta);
           /* agent.add('sono nel getAppuntamenti con data richiesta '+ dataRichiesta);
            resolve(agent);*/
            listAppointment(agent);
            break;
          
          
          
        
          //28/01/2019 AGGIUNTO ANCHE LO STOP
          case 'STOP':
          if (agent.requestSource=="ACTIONS_ON_GOOGLE"){
                  
          

            let conv = agent.conv();
  
            console.log(' ---- la conversazione PRIMA ----- ' + JSON.stringify(conv));
            
            conv.close(strOutput);
            console.log(' ---- la conversazione DOPO CHIUSURA ----- ' + JSON.stringify(conv));
            
            agent.add(conv);
            //altrimenti ritorna la strOutput
          } else{
            agent.add(strOutput);
          }
          resolve(agent);
          break;
        
        default:
          //console.log('nel default ho solo strOutput :' +responseFromPlq.strOutput);
          console.log('nel default ');
          agent.add('sono nel default');
          resolve(agent);
          break;
      } //fine switch
        
      /* agent.add('il comando è '+ tmp[0]);
       resolve(agent);*/
        
       }).catch((error) => {
      
         console.log('errore '+ error);
       
      });  
  // });
  
} 
/*************  */
 //funzione mia
 function listAppointment (agent) {
 
     var pd=convertParametersDateMia(agent.parameters.date,true);
     var fine=convertParametersDateMia(agent.parameters.date,false);
   
     
    console.log('la data di inizio è ' + pd + ', fine è ' + fine);
  

    return listEvents(pd).then((events) => {
      console.log('sono in listEvents');
        var strTemp='';
   
       if (events.length){
          for(var i=0; i<events.length; i++){
             var start=new Date(events[i].start.dateTime).toDateString();
             start=start.toLocaleString('it-IT', { weekday: 'long',day: 'numeric', month: 'long',  timeZone: timeZone });
           
            strTemp+='Il giorno  '+start + ' hai questi appuntamenti: '+ events[i].summary;
            console.log('strTemp ' + strTemp);
          }
          agent.add(strTemp);
          resolve(agent);
        }else{
          agent.add('Non hai eventi per questa data ' + (new Date(pd)).toDateString());
          resolve(agent);
        }
     
  
    }).catch(() => {
      agent.add('PD: qualcosa è andato storto');
      resolve(agent);
    });
}
  function listEvents(paramDate) {
    return new Promise((resolve, reject) => {
     var pd=convertParametersDateMia(paramDate,true);
     var fine=convertParametersDateMia(paramDate,false);
       console.log('////////////////la data di inizio è ' + pd + ', fine è ' + fine);
  calendar.events.list({
    auth: serviceAccountAuth,
    calendarId: calendarId,
    timeMin: pd, // paramDate proviene dai params (new Date()).toISOString(),
    timeMax:fine,
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error da listEvent: ' + err);
    const events = res.data.items;
    if (events.length) {
      //console.log('Upcoming 10 events:');
      events.map((event, i) => {
        var start = event.start.dateTime || event.start.date;
       
        console.log(`${start} - ${event.summary}`);
        start=new Date(start).toDateString();
        console.log('start ora : ' + start);
        /*if(start===paramDate)
            console.log('DATA TROVATA');*/
        
      });
     
    } else {
      console.log('Non ci sono appuntamenti nel futuro.');
      //resolve('No upcoming events found');
    }
    //risolvo events, caricati o meno
     resolve(events);
  });
});
}
// A helper function that adds the integer value of 'hoursToAdd' to the Date instance 'dateObj' and returns a new Data instance.
function addHours(dateObj, hoursToAdd){
    return new Date(new Date(dateObj).setHours(dateObj.getHours() + hoursToAdd));
  }
  
  // A helper function that converts the Date instance 'dateObj' into a string that represents this time in English.
  function getLocaleTimeString(dateObj){
    return dateObj.toLocaleTimeString('it-IT', { hour: 'numeric', hour12: true, timeZone: timeZone });
  }
  
  // A helper function that converts the Date instance 'dateObj' into a string that represents this date in English.
  function getLocaleDateString(dateObj){
    return dateObj.toLocaleDateString('it-IT', { weekday: 'long',day: 'numeric', month: 'long',  timeZone: timeZone });
  } 
  function convertParametersDate(date, time){
    return new Date(Date.parse(date.split('T')[0] + 'T' + time.split('T')[1].split('+')[0] + timeZoneOffset));
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
app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port " + process.env.PORT );
  });
