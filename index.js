//18/04/2019: refactoring codice: creo cartella Classi con file clsCalendar.js dove metto le funzioni per gestire calendario
//01/04/2019 inizio sviluppo prototipo
/****************************************** */
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
/*********** */
const request = require('request');
//const {google} = require('googleapis');
const querystring = require('querystring');
//modifica del 18/04/2019
//var cld = require('./Classi/clsCalendar.js');

//******************** */
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
   /*
    req.session.client_email=process.env.GOOGLE_CLIENT_EMAIL;
    var fixedKey = process.env.GOOGLE_CLIENT_PRIVATE_KEY;
    req.session.private_key= process.env.GOOGLE_CLIENT_PRIVATE_KEY; //fixedKey;
    //console.log('sti cazzi de var de sessione in app.use '+ req.session.client_email + ', chiave '+req.session.private_key);

    fixedKey=fixedKey.replace(new RegExp("\\\\n", "\g"), "\n");
    //console.log('DOPO REPLACE DE sto cazzo de fixedKey '+ fixedKey);
    req.session.private_key= fixedKey;
    //console.log('CALENDARIO DI NOME '+calendarId);
  
    
   
    next();*/
    req.session.pd='porco dio';
    req.session.matId='';
    req.session.stuId='';
  
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
/* commentato in data 18/04/2019
  const SCOPES = 'https://www.googleapis.com/auth/calendar';
  const calendarId = process.env.GOOGLE_CALENDAR_ID; //'jqrf3mfgduhrrg0n6guig97tos@group.calendar.google.com';
  
  var serviceAccountAuth={}; //verrà dalla lettura delle var di ambiente di Heroku

  const calendar = google.calendar('v3');

  const timeZone = 'Europe/Rome';  
  const timeZoneOffset = '+02:00'; */
  
 //PER TEST

   
    app.get('/', function(req, res, next) {
      
        res.send('ok');
      /*
  
        var date =	'2019-04-04T12:00:00+02:00';
        var time = 	'2019-04-04T16:00:00+02:00';
        var timeZone='Europe/Rome';
        var timeZoneOffset='+02:00';
        var nuovaData=cld.convertParametersDate(date,time);
        console.log('il tipo di nuovaData '+ typeof nuovaData + ' e con valore '+nuovaData); // object ok è una data
        nuovaData=cld.addHours(nuovaData,2)
        var options={
            weekday: 'long', month: 'long', day: 'numeric', timeZone: timeZone 
        }
        var nd2=nuovaData.toLocaleDateString('it-IT',options); // 2019-4-5 16:00:00 toLocaleString()
        console.log('valore di nd2 '+nd2);
      
       res.send('<p>nuova data con aggiunta di 2 ore' + nuovaData +', e con ISOString ' + nuovaData.toISOString()+'</p>');*/
     });
    app.get('/testLocale', function(req, res, next) {
      
       res.send('ok');
      
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
   // console.log('DA WebhookProcessing con SESSIONE : questi i valori di serviceAccountAuth: email ' + req.session.client_email + ', key: ' +req.session.private_key +', con scope '+ SCOPES);
   /* if (req.session.client_email && req.session.private_key){


        serviceAccountAuth = new google.auth.JWT({
            email: req.session.client_email,
            key: req.session.private_key,
            scopes: SCOPES
        });
    }else{
        console.log('sono in webhook per prendere chiave');
        var fixedKey = process.env.GOOGLE_CLIENT_PRIVATE_KEY.replace(new RegExp("\\\\n", "\g"), "\n");
       
        serviceAccountAuth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: fixedKey,
            scopes: SCOPES
        });
    }*/
    
    //10/01/2019
    //copiato codice da progetto api
    console.log('------sono su HeadDemo app ----- la richiesta proviene da '+ agent.requestSource);
    var name=req.body.queryResult.intent.name;
    var displayname=req.body.queryResult.intent.displayName;
    console.log('nome intent '+name+ ' , display name '+ displayname);
    //******************************************* */
  
    //recupero la sessionId della conversazione
    
    agent.sessionId=req.body.session.split('/').pop();
    //console.info(` sessione agente ` + agent.sessionId +` con parametri` + agent.parameters.Command);
  //assegno all'agente il parametro di ricerca da invare sotto forma di searchText a Panloquacity
    if (req.body.queryResult.parameters.Command){
        agent.parameters['Command']=req.body.queryResult.parameters.Command;
    }
    //recupero la data
    if (req.body.queryResult.parameters.date){
        agent.parameters['date']=req.body.queryResult.parameters.date;
        console.log('la data = '+req.body.queryResult.parameters.date);
    }
    if (req.body.queryResult.parameters.time){
      agent.parameters['time']=req.body.queryResult.parameters.time;
      console.log('**************orario del evento da CREARE ' + req.body.queryResult.parameters.time);
    }
    //03/04/2019
    if (req.body.queryResult.parameters.any){
        agent.parameters['any']=req.body.queryResult.parameters.any;
        console.log('titolo del evento da creare ' + req.body.queryResult.parameters.any);
    }
    
    //09/04/2019 per update
    if (req.body.queryResult.parameters.date_update){
      agent.parameters['date_update']=req.body.queryResult.parameters.date_update;
      console.log('la date_update DI MODIFICA = '+req.body.queryResult.parameters.date_update);
    }
    if (req.body.queryResult.parameters.time_update){
    agent.parameters['time_update']=req.body.queryResult.parameters.time_update;
    console.log('**************time_update del evento da MODIFICARE ' + req.body.queryResult.parameters.time_update);
    }
  //fine 09/04/2019
  

    //fulfillment text
    if (req.body.queryResult.fulfillmentText){
        agent.fulfillmentText=req.body.queryResult.fulfillmentText;
        console.log('----> fulfillment text =' +agent.fulfillmentText);
    }

    
  //20/03/2019 fallback su plq
    if (req.body.queryResult.parameters.searchText){

      console.log(' ho param searchText per PLQ =' + req.body.queryResult.parameters.searchText);
      agent.parameters['searchText']=req.body.queryResult.parameters.searchText;
    }
  
    //gestione degli intent
    //nuovo del 21/03/2019 fallback intent
    var blnIsFallback=false;
    if (req.body.queryResult.intent.isFallback){
        blnIsFallback=req.body.queryResult.intent.isFallback;
        console.log('blnIsFallback ?? '+blnIsFallback);
    }
 
     
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
        //DATA RICHIESTA: PARAM PER ELENCARE EVENTI E PER INSERIRE LA DATA DI INSERIMENTO APPUNTAMENTO
        //IN CASO DI INSERT, MI INTERESSA SOLOA LA PRIMA PARTE 	2019-04-08T15:43:45+02:00
        //FINO AL PRIMO T
        var dataRichiesta=agent.parameters.date;
        var strOutput=agent.fulfillmentText; //è la risposta statica da DF messa da Roberto
        //03/04/2019 per inserimento appuntamento
        var titoloApp=agent.parameters.any;
        //QUANDO VIENE FISSATO APPUNTAMENTO ad esempio in formato 	2019-04-06T13:00:00+02:00
        // mi interessa solo la parte dopo il T 
        var dateTimeStart=agent.parameters.time; 
        console.log('strOutput agente prima di EsseTre :' + strOutput + ' e con dateTimeStart '+dateTimeStart);
        //***************** /09/04/2019 PER MODIFICA, RECUPERO DATE_UPDATE E TIME_UPDATE ossia la nuova data*/
        var dateStart2=agent.parameters.date_update;
        var oraStart2=agent.parameters.time_update;
        console.log('Ho i dati per la modifica: dateStart2 '+dateStart2 + ', e oraStart2 '+oraStart2);
        /************************************** */
       
        //05/04/2019 per eliminazione: recupero il contesto per avere la data richiesta 
        var ctx=agent.context.get('delappointment-followup');
        var dataDaEliminare ='';
        var titoloAppDaEliminare='';
        var startOraStartDaEliminare='';
        if (ctx){
            dataDaEliminare = ctx.parameters.date;
            titoloAppDaEliminare=ctx.parameters.any;
            oraStartDaEliminare=ctx.parameters.time;
            console.log('in contesto delappointment-followup elimino eventi in data '+dataDaEliminare +', titoloDaElim '+titoloAppDaEliminare + ', ora evento da elim '+ oraStartDaEliminare);
    
        }
    
    //IN BASE AL COMANDO ASSOCIATO ALL'INTENT ESEGUO AZIONE SU ESSETRE
      switch (strRicerca) {
        case 'getAppuntamenti':
            console.log('sono nel getAppuntamenti con data richiesta '+ dataRichiesta);
          
            var strTemp='';
            cld.listEvents(dataRichiesta).then((events)=>{
                //if (Array.isArray(events)){
                if (events.length){
                   // strTemp='Il giorno  '+ new Date(dataRichiesta).toDateString()+ ' hai questi appuntamenti:\n';
                    for(var i=0; i<events.length; i++){
                        var start=cld.getLocaleDateString(new Date(events[i].start.dateTime));
                      
                        console.log('-----  con toLocaleString '+ start);
                       
                       strTemp+= events[i].summary +' alle ore ' + getLocaleTimeString(new Date(events[i].start.dateTime))  +'\n';
                       console.log('strTemp ' + strTemp);
                     }
                }   // fine if
                else{

                strTemp='Non ho trovato eventi per la data ' +new Date(dataRichiesta).toDateString();
                }
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                console.log('strOutput con replace '+ strOutput);
                //agent.add(strTemp);
                resolve(agent);
             }).catch((error) => {
                console.log('Si è verificato errore in listEvents: ' +error);

              });
            //listAppointment(agent);
            break;
        //03/04/2019
            case 'creaAppuntamento':
            console.log('sono nel creaAppuntamento con data richiesta '+ dataRichiesta + ', titolo '+ titoloApp + ' e con dateTimeStart '+dateTimeStart);
           //data richiesta  2019-04-05T12:00:00+02:00, titolo Marco e con orario 2019-04-05T09:00:00+02:00
            var strTemp='';
            var titolo=utf8.encode(titoloApp);
           // console.log('Il tipo di dateTimeStart =' +typeof dateTimeStart); //è una stringa
           
    
            //return new Date(new Date(dateObj).setHours(dateObj.getHours() + hoursToAdd));
            //console.log('*********dateTimeStart '+dateTimeStart);
            cld.createAppointment(dataRichiesta,dateTimeStart,titolo).then((event)=>{
                console.log('ho inserito appuntamento in calendario con id ' +event.data.id); // -> da event.eventId a event.id o event.data.id

                strTemp= event.data.id;
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                console.log('strOutput con replace '+ strOutput);
            
                resolve(agent);

            }).catch((error) => {
                console.log('Si è verificato errore in creaAppuntamento: ' +error);
                agent.add('Ops...' +error);
                resolve(agent);
            });
            break;
            //05/04/2019 eliminare evento
            case 'deleteAppointment':
            //recupero la lista degli eventi per la data richiesta
            //la recupero dal contesto
            
            console.log('sono in deleteAppointment');
            if (titoloAppDaEliminare && oraStartDaEliminare){
              console.log('ELIMINAZIONE SINGOLA: titolo '+ titoloAppDaEliminare + ', data da eliminare '+ oraStartDaEliminare);
              cld.getEventByIdEdit(dataDaEliminare,oraStartDaEliminare,titoloAppDaEliminare).then((event)=>{
                if (event.length){
                  console.log('event è un array...')
                  var id=[]; //deve essere un array di stringhe
                  id[0]=event[0].id;
              
                  console.log('ho recuperato evento con id PER ELIMINAZIONE SINGOLA: ' +id[0]);
               
                
                  cld.deleteEvents(id).then((strId)=>{ 
              
               
                    agent.add('Ho eliminato evento con id '+id); //
                    resolve(agent);

                  }).catch((error) => {
                    console.log('Si è verificato errore in deleteAppointment: ' +error);
                    agent.add('Ops...' +error);
                    resolve(agent);
                });
                
              } 
            });
          }else{ //ELIMINAZIONE BATCH 
            cld.getEventsForDelete(dataDaEliminare).then((arIDs)=>{
              console.log('sono in getEventsForDelete (BATCH) con dataDaEliminare '+ dataDaEliminare);
              //elimino effettivamente gli eventi tramite id
              if (arIDs.length){
                  console.log('sto per eliminare evt e arIDs.length = ' +arIDs.length);
                  for (var i=0;i<arIDs.length;i++){
                    console.log('sto eliminando id evento : ' +arIDs[i]);
                   /*   calendar.events.delete({
                      auth: serviceAccountAuth,
                      calendarId: calendarId,
                      eventId:arIDs[i]
                      });*/
                 
                  }//chiudo for
              }//chiudo if

              else {
                console.log('arIDs non pervenuto ');
               
              }
              console.log('eliminazione avvenuta');
              agent.add('eliminazione avvenuta. Cosa vuoi fare ora?');
              resolve(agent);

          }).catch((error) => {
              console.log('Si è verificato errore in deleteAppointment: ' +error);
              agent.add('Ops...' +error);
              resolve(agent);
          });
         }
                
            

            break;
              //28/01/2019 AGGIUNTO ANCHE LO STOP
            //08/04/2019 UPDATE MODIFICA APPUNTAMENTO PER ID EVENTO
            //prima recupero id e poi faccio update
          case 'updateAppuntamento':
                console.log('sono in updateAppuntamento');

                var options={
                  weekday: 'long', month: 'long', hour12: false, day: 'numeric', timeZone: 'Europe/Rome' , timeZoneOffset:'+02:00',
              }

              cld.getEventByIdEdit(dataRichiesta,dateTimeStart,titoloApp).then((event)=>{
                  if (event.length){
                    var id=event[0].id;
                    console.log('ho recuperato evento con id ' +id); 
                    cld.getUpdate(id, dateStart2,oraStart2,titoloApp).then((strId)=>{
                     
                      //agent.add('ok spostato appuntamento ' +titoloApp +' in DATA ' + new Date(dateStart2).toLocaleDateString('it-IT') +',  alle ORE '+nndata);
                      agent.add(strOutput);
                      resolve(agent);

                    }).catch((error) => {
                      console.log('Si è verificato errore in getUpdate: ' +error);
                      agent.add('Ops...' +error);
                      resolve(agent);
                  });
                    
                  }
                 

                //questo ok
                  
  
              }).catch((error) => {
                  console.log('Si è verificato errore in updateAppuntamento: ' +error);
                  agent.add('Ops...' +error);
                  resolve(agent);
              });


          break;
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


app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port " + process.env.PORT );
  });
