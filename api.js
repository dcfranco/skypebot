var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: 'f552747b-a141-42f1-b241-487e9e33317d',
    appPassword: 'fZXvaaFFZ729YBpstGLAGrZ'
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var ywcc_ptbr = [
    ['0', 'Tornado'],
    ['1', 'Tempestade tropical'],
    ['2', 'Furacão'],
    ['3', 'Tempestade severa'],
    ['4', 'Trovoadas'],
    ['5', 'Chuva e neve'],
    ['6', 'Chuva e granizo fino'],
    ['7', 'Neve e granizo fino'],
    ['8', 'Garoa gélida'],
    ['9', 'Garoa'],
    ['10', 'Chuva gélida'],
    ['11', 'Chuvisco'],
    ['12', 'Chuva'],
    ['13', 'Neve em flocos finos'],
    ['14', 'Leve precipitação de neve'],
    ['15', 'Ventos com neve'],
    ['16', 'Neve'],
    ['17', 'Chuva de granizo'],
    ['18', 'Pouco granizo'],
    ['19', 'Pó em suspensão'],
    ['20', 'Neblina'],
    ['21', 'Névoa seca'],
    ['22', 'Enfumaçado'],
    ['23', 'Vendaval'],
    ['24', 'Ventando'],
    ['25', 'Frio'],
    ['26', 'Nublado'],
    ['27', 'Muitas nuvens (noite)'],
    ['28', 'Muitas nuvens (dia)'],
    ['29', 'Parcialmente nublado (noite)'],
    ['30', 'Parcialmente nublado (dia)'],
    ['31', 'Céu limpo (noite)'],
    ['32', 'Ensolarado'],
    ['33', 'Tempo bom (noite)'],
    ['34', 'Tempo bom (dia)'],
    ['35', 'Chuva e granizo'],
    ['36', 'Quente'],
    ['37', 'Tempestades isoladas'],
    ['38', 'Tempestades esparsas'],
    ['39', 'Tempestades esparsas'],
    ['40', 'Chuvas esparsas'],
    ['41', 'Nevasca'],
    ['42', 'Tempestades de neve esparsas'],
    ['43', 'Nevasca'],
    ['44', 'Parcialmente nublado'],
    ['45', 'Chuva com trovoadas'],
    ['46', 'Tempestade de neve'],
    ['47', 'Relâmpagos e chuvas isoladas'],
    ['3200', 'Não disponível']
];

function translateCode(code) {
    var arrayLength = ywcc_ptbr.length;
    for (var i = 0; i < arrayLength; i++) {
        if (code == ywcc_ptbr[i][0]) {
            return ywcc_ptbr[i][1];
        }
    }
};

var savedSession;

var sendTempo = function(session, dias, frase){
    var tempoLink = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Blumenau%2C%20SC%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
    request({
        url: tempoLink,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            var temps = body.query.results.channel.item.forecast;
            var temperaturaTotal = [];
            var counter = 0;

            temps.map(temp => {
                if (counter < dias)
                    temperaturaTotal.push(new builder.ThumbnailCard(session)
                        .images([
                            builder.CardImage.create(session, "http://l.yimg.com/a/i/us/we/52/"+temp.code+".gif")
                        ])
                        .title(frase ? frase : temp.date)
                        .subtitle(translateCode(temp.code))
                        .text("- Mínima: " + parseFloat((5 / 9) * (parseInt(temp.low) - 32)).toFixed(0) + "° \r\n" +
                        "- Máxima: " + parseFloat((5 / 9) * (parseInt(temp.high) - 32)).toFixed(0) + "° \r\n")
                        );
                counter++;
            });

            var msg = new builder.Message(session)
                .textFormat(builder.TextFormat.xml)
                .attachments(temperaturaTotal);
            session.send(msg);
        }
    });
}

var bot = new builder.UniversalBot(connector, function (session) {
    savedSession = session;
    
    if (session.message.text.substring(0, 8) != "@JS Crew")
        return;

    var searchItem = session.message.text.substring(8, session.message.text.length);

    if(session.message.user.name == "Gilleady Daboit - Philips Clinical Informatics") {
        session.send("Hoje não Daboit hehhehe");
    } else if (searchItem.indexOf("/tempo") >= 0) {
        sendTempo(session, 3);
        console.log("[/tempo] - Recv");
    } else if(searchItem.indexOf("/gif") >= 0){
        console.log("[/gif] - Recv");
        var toSearch = searchItem.substring(6, searchItem.length);
        var arr = toSearch.split(' ');
        var linkAppend = "";
        arr.map(item => {
            if (linkAppend == "") linkAppend += item;
            else linkAppend += '+' + item;
        });

        var link = "http://api.giphy.com/v1/gifs/search?q=" + linkAppend + "&api_key=dc6zaTOxFJmzC"
        console.log("[/gif] - Link: " + link);

        request({
            url: link,
            json: true
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                if (body.data && body.data.length > 0) {
                    var gifIndex = Math.floor(Math.random() * body.data.length);
                    var gifLink = body.data[gifIndex].images.original.url;
                    if (gifLink) {
                        var msg = new builder.Message(session)
                            .attachments([{
                                contentType: "image/gif",
                                contentUrl: gifLink
                            }]);
                        session.send(gifLink);
                        console.log("[/gif] - Sended");
                    }
                }
            }
        });
    } else if(searchItem.indexOf("/imagem") >= 0){
        console.log("[/imagem] - Recv");
        var toSearch = searchItem.substring(9, searchItem.length);
        var arr = toSearch.split(' ');
        var linkAppend = "";
        arr.map(item => {
            if (linkAppend == "") linkAppend += item;
            else linkAppend += ',' + item;
        });

        var link = "https://api.flickr.com/services/feeds/photos_public.gne?tags=" + linkAppend + "&format=json"
        console.log("[/imagem] - Link: " + link);
        var jsonFlickrFeed = function(body) {
            if (body.items && body.items.length > 0) {
                var gifIndex = Math.floor(Math.random() * body.items.length);
                var gifLink = body.items[gifIndex].media.m;
                if (gifLink) {
                    var msg = new builder.Message(session)
                        .attachments([{
                            contentType: "image/jpg",
                            contentUrl: gifLink
                        }]);
                    session.send(gifLink);
                    console.log("[/imagem] - Sended");
                }
            }
        }

        request({
            url: link,
            json: true
        }, (error, response, body) => {
            if (!error && response.statusCode === 200)
                eval(body);
        });
    }
});

var bomDia = false;
setInterval(() => {
    if(!savedSession) return;

    var date = new Date();
    
    if(date.getHours() == 8 && date.getMinutes() == 45) {
        if(bomDia) return;
        var link = "http://api.giphy.com/v1/gifs/search?q=good+morning&api_key=dc6zaTOxFJmzC"        
        request({
            url: link,
            json: true
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                if (body.data && body.data.length > 0) {
                    var gifIndex = Math.floor(Math.random() * body.data.length);
                    var gifLink = body.data[gifIndex].images.original.url;
                    if (gifLink) {
                        var card = new builder.HeroCard(savedSession)
                            .title("#JS Crew")
                            .text("Um bom dia pra rapa #lifeCrazy");

                        var msg = new builder.Message(savedSession).attachments([card]);
                        savedSession.send(msg);
                        savedSession.send(gifLink);
                        sendTempo(savedSession, 1, "Previsão de hoje");
                        bomDia = true;
                    }
                }
            }
        });
    } else 
        bomDia = false;
}, 5000);