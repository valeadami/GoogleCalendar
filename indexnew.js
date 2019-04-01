//01/04/2019 inizio sviluppo GoogleCalendar come alternativa a HeadDemo per prenotazione (aule, eventi ecc.)
/****************************************** */
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
/*********** */
const request = require('request');
const querystring = require('querystring');
const path = require("path");
const https = require('https');
const google = require('googleapis');


/*** DIALOGFLOW FULFILLMENT */
const {WebhookClient} = require('dialogflow-fulfillment');
/*** ACTIONS ON GOOGLE */


/** utilità */
const fs = require("fs");
const utf8=require('utf8');
//file di configurazione
const env = require('node-env-file');
env(__dirname + '/.env');

var app = express();
var bot='HEAD'; // modificato in data 14/03/2019 in HEAD -->HEADdemo FarmaInfoBot
/*app.set("views", path.join(__dirname, "views"));
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
    
    req.session.username='';
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
 //IL MIO ID DEL CALENDARIO
const calendarId = 'jqrf3mfgduhrrg0n6guig97tos@group.calendar.google.com'; // Example: 6ujc6j6rgfk02cp02vg6h38cs0@group.calendar.google.com
const serviceAccount = {
 "type": "service_account",
  "project_id": "calendar-1f4a3",
  "private_key_id": "ec74f0b64833d6c0a15ca9cc0c8dbe201d583c15",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDKCFunL9/O72sb\no9wYzHli7+2bRchDC8zCcymV5F6apt+Ut3cpqX068OkfWJSxdjwiC9YUSwNwDV32\nG41wXUFStz8HOgU3dbKfvvNdtdMPamQXh+sRaT1p3VjlyhuydW1RCAGMuGRg9k5h\nNjUWdPu6HLAGXLGovai6RMD+AYTriqicRFRnV9qhjBTm22Laa7+vo731DuTYWFwC\nW59JFJ2YnrtUdxh+aUAz0IWuVypcHxVXlFJ6l+qyTrvcX3N/zfXkgPPyBiWxkB8C\nm8AjMNMNMlJ8o4Kbw2LjvHcqCOeDnbTELeINJ2wUvepNZ9TFfbl/2nSl9WVZhgq7\nDlO/5Yu1AgMBAAECggEACgy4YmyjOWv3a/yOqj0hnKZKr3qdJ5iiqtmHrAkcG51J\naeBmcRAZRqFNN130p482Fot4LrI8jYpcri1Yr8ozwaWT4Qwlzkhwhjm9aV/uC8pD\nCFiefNM7VtTH40ZWcl4c/fbj/Nf/RkN6SqOjqGZRT0S2DNr3i2lDx2A8KWZx8jVw\n5MJX2yOoQSb88YD9srWDPQ7CoXPcZWsSmluk1HJoPgYZQ/qi+7vT8G2Z8XFeF0iU\noClIFg2Tf04bTcZ517cGzKDlJ5vlMIBTiKqb3JMWCMNB7eOfRXFo3e7ummuaP46t\nJ3PkrAC+jjyV69wRQZYrAGxaXiLjSzwLJCtOv4eeAQKBgQDnRd5QMHwBp/6dcoIb\n5WFobwIw9yho76B6GMz0WYvKd/SLpEgJiPeDtLazHKQS01HE199Pele7PHaxG/hN\nKV2+wvQ4GosUJ+/vWXr8/S1nwNhBxK5IYd9WSp50bakS2uB186bEFfkKlPuotacR\nLp+Q2YU8uUPg/T18UbT8jDYBlQKBgQDfoii3dHZv/5SGzqkft4lnEfxaZz7rAPJO\nKwep/HkQqM4M+RCr0+2Fgc6QXezsw6UdjgGinw9gZHEfffxh2LnVeESplW9iO5t4\nxTrKwFL/kfue66oQXaVcHqFER1ofzCk+VVBzudGEcgFhSHDkcOfZmsLwHKdaasjX\nRLhJeOsZoQKBgHzk/mnPxSgf0SC19g2akkATsts+nlQNFFzbh9NtiFCO90FyNnTv\nwrsdnIydqv1/oWjsK2yAZWB4BqEeubjx3e5m2fxyWSlJaAmaCREWqK6fNipOTNBK\nCpJPOcMmdWf5S75nFmhOdW+BhWZWsyJUS1euIIXqhv25xLqeZV79WS0BAoGAIlkz\ny8m1j0pAM9x2GYsFLbGTgwcsoMfKb7soODGxHp/u1gtDRkEM0F65rW7fvxXlvH5d\nPe8UW4fR4DZnl1fEY0dPtIRhUUM6g/g3KYEUvnBbp3Mm8dCQX2/M8UHMU+n1w78y\n1jOKPL+N+rU3sb6tvbyJiHu+MKMKKhZB//b0lUECgYEArJu8OR0fPSaFAT5fQ6R5\nz7vPHsZQKLzeVNQjS3DjNCO7nlISDGi5cb0805GLGNBCH+bc2p42mHYo3clbyRcs\nDrD8/USASqNj/Q8fWy0Dw+FCLdgBBGe3asV42d44KAPrhoxFFdgroJV35UPQVofh\nVCvaEB5NgBGezgHr0ym7/f0=\n-----END PRIVATE KEY-----\n",
  "client_email": "calendariotest@calendar-1f4a3.iam.gserviceaccount.com",
  "client_id": "100717085875499488433",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/calendariotest%40calendar-1f4a3.iam.gserviceaccount.com"
}; 


// Set up Google Calendar service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements

const timeZone = 'Europe/Rome';  // Change it to your time zone
const timeZoneOffset = '+01:00';

//PER TEST APPLICATIVO

app.get('/testLocale', function(req, res, next) {
    
    res.send('ok')
    

});
    //PER TEST APPLICATIVO
app.get('/testSessione', function(req, res, next) {
    
        res.setHeader('Content-Type', 'text/html')
        res.write("sono nella root ");
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p> id sessione ' + req.session.id  +' expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    
        res.end()
    
    })


 function WebhookProcessing(req, res) {
    const agent = new WebhookClient({request: req, response: res});
    //10/01/2019
    //copiato codice da progetto api
    console.log('------sono su GoogleCalendar app ----- la richiesta proviene da '+ agent.requestSource);
    var name=req.body.queryResult.intent.name;
    var displayname=req.body.queryResult.intent.displayName;
    console.log('nome intent '+name+ ' , display name '+ displayname);
    //******************************************* */
  
    //recupero la sessionId della conversazione
    
    agent.sessionId=req.body.session.split('/').pop();
  //assegno all'agente il parametro di ricerca da invare sotto forma di searchText a Panloquacity
    agent.parameters['Command']=req.body.queryResult.parameters.Command;
   /* if (req.body.queryResult.parameters.esame){

      console.log(' ho esame =' + req.body.queryResult.parameters.esame);
      agent.parameters['esame']=req.body.queryResult.parameters.esame;
    }*/
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
//callAva attuale al 10/01/2019
//rinominata callAvaOriginale in data 21/03/2019

 
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
    var strOutput=agent.fulfillmentText; //è la risposta statica da DF messa da Roberto
    console.log('strOutput agente prima di EsseTre :' + strOutput);
    var dateTimeStart = agent.parameters.date;
    console.log('**********data richiesta =' +dateTimeStart);
    //HO ESAME?? Risolvo la entity esame
    /*if(agent.parameters.esame){

      var paramEsame=agent.parameters.esame;
      console.log('in callAvanew ho esame '+ paramEsame);
    }*/
    //recupero la variabile legata al contesto
    //21/03/2019 rinominato da contesto in vardisessione e inserito anche nell'agente 
    //in welcome nav impostato a 1000
   /* var ctx=agent.context.get('vardisessione'); //per utente
   
    if (ctx){
      console.log('ho già il contesto quindi recupero id esame: lookup da params esami');
      console.log('LEGGO DAL CONTESTO UID '+ctx.parameters.userId);
    
      var userId=ctx.parameters.userId;
      var matId=ctx.parameters.matId;
      console.log('LEGGO DAL CONTESTO matricola ID ='+matId);
     
       var cdsId=ctx.parameters.cdsId;
       console.log('LEGGO DAL CONTESTO corso di studio id  ='+cdsId);
    
      if (ctx.parameters.esami){
        var idEsame='';
        var idAppello='';
        for(var i =0;i<ctx.parameters.esami.length;i++){
        
            if (ctx.parameters.esami[i]===paramEsame){
              console.log('******** TROVATO ESAME IN CTX ESAMI*******');
              idEsame=ctx.parameters.adsceId[i];
           
           
              idAppello=ctx.parameters.idAppelli[i];
              console.log('************ ID DI ESAME = '+idEsame + ' e con idAppello '+idAppello);
              break;
            }
          }
      }

    }
  */
    //IN BASE AL COMANDO ASSOCIATO ALL'INTENT ESEGUO AZIONE SU ESSETRE
      switch (strRicerca) {
        case 'getAppuntamenti':
          console.log('sono nel getAppuntamenti');
        
          controller.getLibretto().then((libretto)=> {
            var strTemp='';
           
           
           
            if (Array.isArray(libretto)){
              
              for(var i=0; i<libretto.length; i++){
                
                
                strTemp+=  libretto[i].adDes+ ', frequentato  nell \'anno ' +libretto[i].aaFreqId +', anno di corso ' +
                libretto[i].annoCorso + '\n';
    
              }
              
            }
            //qui devo fare replace della @, che si trova in tmp[0]
            var str=strOutput;
            str=str.replace(/(@)/gi, strTemp);
            strOutput=str;
            agent.add(strOutput);
            console.log('strOutput con replace '+ strOutput);
           
            resolve(agent);
          }).catch((error) => {
            console.log('Si è verificato errore : ' +error);
            
          
          });
          break;
          //28/01/2019
        case 'getInformazioni':
  
              //14/03/2109 il nuovo user è s262502 userId
              controller.getCarriera(userId).then((carriera)=> {
              var strTemp='';
              strTemp+='Ti sei immatricolato nell anno '+ carriera.aaId + ' , con numero matricola  '+ carriera.matricola + ', nel corso di laurea '+ carriera.cdsDes +', tipo di corso di laurea '+ carriera.tipoCorsoDes; + 'percorso '+carriera.pdsDes +', stato attuale :' +carriera.motStastuDes
              console.log('sono nella carriera ...');
              // console.log('ho lo studente '+studente.codFisc + 'matricola ID '+ studente.trattiCarriera[0].matId);
              // agent.setContext({ name: 'matricola', lifespan: 5, parameters: { matID: studente.trattiCarriera[0].matId }});
              
              var str=strOutput;
              str=str.replace(/(@)/gi, strTemp);
              strOutput=str;
              agent.add(strOutput);
              console.log('strOutput con replace '+ strOutput);
              resolve(agent);
              
              }).catch((error) => {
                console.log('Si è verificato errore : ' +error);
                
            
              });
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
         
          case 'getInizializzazione':
              //faccio login con utente di test
              var uID=''; //userId
              var matricolaID=''; //matId
              var cdsId='';//10094 per giurisprundenza-> per la prenotazione
              var arAdId=[]; //array per adId per la prenotazione
              var arIDS=[]; //adsceId degli esami del libretto
              var arEsami=[]; //descrizioni degli esami del libretto
              
              controller.doLogin().then((stud) => { 
               console.log('sono in getInizializzazione doLogin');
               console.log('questo il valore di studente '+ JSON.stringify(stud));
               uID=stud.userId;
               console.log('uID = '+uID);
               matricolaID=stud.trattiCarriera[0].matId;
               console.log('matricolaId ='+matricolaID);
               //MODIFICA DEL 25/03/2019
               cdsId=stud.trattiCarriera[0].cdsId;
               console.log('CORSO DI STUDIO ID  ='+cdsId);
               //modifica del  20/03/2019   così ho in un contesto solo tutti i dati *******************
                  controller.getLibretto().then((libretto)=> {
                  
                    if (Array.isArray(libretto)){
                      console.log('sono in getInizializzazione getLibretto');
                      for(var i=0; i<libretto.length; i++){
                      
                        arIDS.push(libretto[i].adsceId);
                        console.log('->inserito in arIDS '+arIDS[i]);
                        arEsami.push(libretto[i].adDes);
                        console.log('->inserito in arEsami '+arEsami[i]);
                        //modifica del 25/03/2019
                        arAdId.push(libretto[i].chiaveADContestualizzata.adId);
                        console.log('-> inserito adId '+libretto[i].chiaveADContestualizzata.adId);
                      }
                      
                    //25/03/2019 AGGIUNTO cdsId E idAppelli PER LE PRENOTAZIONI APPELLI
                    agent.context.set({ name: 'vardisessione', lifespan: 1000, parameters: {  "userId": uID, "matId":matricolaID,"adsceId":arIDS, "esami":arEsami, "cdsId":cdsId,"idAppelli":arAdId}});
                    agent.add(strOutput);
                    resolve(agent); 
                  
                    }
                    }).catch((error) => {
                      console.log('Si è verificato errore in getInizializzazione -getLibretto: ' +error);
                    });

            
                
            }).catch((error) => {
                  console.log('Si è verificato errore in getInizializzazione -doLogin: ' +error);
                 
            });
           
           
            
          break;
         
          case 'getPrenotazioneAppelli':
          var idAp=''; 
       
            controller.getAppelloDaPrenotare(cdsId,111218).then((appelliDaPrenotare)=>{
              if (Array.isArray(appelliDaPrenotare)){
                console.log('2) sono dentro getAppelloDaPrenotare');
                var strTemp='';
                for(var i=0; i<appelliDaPrenotare.length; i++){
  
                  strTemp+= 'Appello di ' + appelliDaPrenotare[i].adDes + ', in data '+ appelliDaPrenotare[i].dataInizioApp +', iscrizione aperta dal '+  
                            appelliDaPrenotare[i].dataInizioIscr + ' fino al '+ appelliDaPrenotare[i].dataFineIscr +'\n';
                 
                  }
                }
                  console.log('Valore di strTemp '+ strTemp);
                  return strTemp;
              }).then(function (strTemp)  {

            
                var str=strOutput;
                str=str.replace(/(@)/gi, strTemp);
                strOutput=str;
                agent.add(strOutput);
                console.log('strOutput con replace in  getPrenotazioneAppelli-> getAppelloDaPrenotare '+ strOutput);
                resolve(agent);
             }).catch((error) => {
            console.log('Si è verificato errore in getPrenotazioneAppelli-> getAppelloDaPrenotare ' +error);
          });
 
              break;
        default:
          //console.log('nel default ho solo strOutput :' +responseFromPlq.strOutput);
          console.log('nel default ');
          agent.add('sono nel default');
          resolve(agent);
          break;
      } //fine switch
        
     
       }).catch((error) => {
      
         console.log('errore '+ error);
       
      });  
  // });
  
} 

function listAppointment (dateTimeStart) {
 
  
     var pd=convertParametersDateMia(dateTimeStart,true);
     var fine=convertParametersDateMia(dateTimeStart,false);
      //var pd=new Date(dateTimeStart).toISOString();
     
    console.log('la data di inizio è ' + pd + ', fine è ' + fine);
    agent.add('la data di inizio è ' + pd + ', fine è ' + fine);
   resolve(agent);
  /*
    return listEvents(pd).then((events) => {
      console.log('sono in listEvents');
        var strTemp='';
       // if (Array.isArray(events)){
       if (events.length){
          for(var i=0; i<events.length; i++){
             var start=new Date(events[i].start.dateTime).toDateString();
             start=start.toLocaleString('it-IT', { weekday: 'long',day: 'numeric', month: 'long',  timeZone: timeZone });
           
            strTemp+='Il giorno  '+start + ' hai questi appuntamenti: '+ events[i].summary;
            console.log('strTemp ' + strTemp);
          }
          agent.add(strTemp);
        }else{
          agent.add('Non hai eventi per questa data ' + (new Date(pd)).toDateString());
        }
   
  
    }).catch(() => {
      agent.add('PD: qualcosa è andato storto');
    });  */
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
  } //weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  
app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port " + process.env.PORT );
  });


    