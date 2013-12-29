var system = require('system');

if (system.args.length < 2) {
    console.log("Missing arguments.");
    phantom.exit();
}

var server = require('webserver').create();
var port = parseInt(system.args[1]);

var renderHtml = function(url, cb) {
    var page = require('webpage').create();
    page.settings.loadImages = false;
    page.settings.localToRemoteUrlAccessEnabled = true;
    
    page.onCallback = function() {
        cb(page.content);
        page.close();
    };
    
    // page.onConsoleMessage = function(msg, lineNum, sourceId) {
    //    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    // };
    
    page.onInitialized = function() {
       page.evaluate(function() {
            setTimeout(function() {
                window.callPhantom();
            }, 10000);
        });
    };
    
    page.open(url);
};

server.listen(port, function (request, response) {
    var urlPrefix = 'http://' + request.headers.Host;
    var route = request.url.replace("?_escaped_fragment_=","#");
    var url = urlPrefix + decodeURIComponent(route);
    renderHtml(url , function(html) {
        response.statusCode = 200;
        response.write(html);
        response.close();
    });
});

console.log('Listening on ' + port + '...');
console.log('Press Ctrl+C to stop.');