'use strict';
var request = require('request');
var keys = Object.keys || require('object-keys');

var toString = function(results , query) {
    var body = '';
    var header;
    if (results.length == 0) {
        return '[Nenhum Pull request aberto]';
    }

    if(query == 'all'){
       header = 'Todos os Pull Requests abertos'; 
       for(var i in results){
          body += results[i].title + "\n";
       }
    }else if(query == 'old'){
       header = 'Pull Requests com mais de 5 dias';
       var datePR;
       var date = new Date(); 
       var todaysDate = date.getFullYear() + (date.getMonth()+1) + date.getDate();
       var quantDays;
       for(var i in results){
          datePR = results[i].created_at;
          datePR = parseInt(datePR.slice(0, 4)) + parseInt(datePR.slice(5, 7)) + parseInt(datePR.slice(8, 10));
          quantDays = todaysDate - datePR;
          if(quantDays > 5){
              body += results[i].title + "\n";
          } 
       } 
    }else{
        return '[Faltam parametros para executar o comando]';
    }

    return header + ':\n'+ body;
};


module.exports = {
   search: function(){
      var searchString;
      var repository;
      var tipeSearch ;
      var callback = arguments[0]; 
      
      if (arguments.length === 2) {
          searchString = arguments[0];
          callback = arguments[1];
          searchString = searchString.split(" ");

          if(searchString.length === 2){
            repository = searchString[0];
            tipeSearch = searchString[1]; 
          }
      }

      var options = {
             url: 'https://api.github.com/repos/dataeasy/' + repository + '/pulls?state=open',
             headers: {
                'User-Agent': 'request'
             }
      };

      request(options, function (erro, response, body){ 
            var objeto = JSON.parse(body);
            return callback(toString(objeto, tipeSearch)); 
      });

   }
	
}

