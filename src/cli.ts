import { Client } from './client';

var colors = require('colors');
var { inspect } = require("util");

export class Cli {
    constructor() {
        var host = process.env.CORE || 'ws://localhost:8080';

        if (!host) {
            console.log("Defaulting to HOST=" + host);
        }
        
        const client = new Client({ host });
        
        client.ready().subscribe(() => {
            initMethods(client);
        });
        
        function initMethods(client) {
            var repl;
            var methods = {};
        
            client.request('methods', []).subscribe((_methods) => {
                //console.log('methods', _methods);
        
                var root = {};
        
                for (var i in _methods) {
                    var path = i.split('.');
                    //console.log("Root, path", path);
                    var node = root;
                    while (path.length>1) {
                        if (!node[path[0]]) {
                            node[path[0]] = {};
                        }
                        node = node[path[0]];
                        path.shift();
                        //console.log("shifted path", path);
                    }
        
                    node[path[0]] = (function(i) { 
                        return function() { 
                            var args = [];
                            var cb = arguments[arguments.length-1];
        
                            if ( typeof cb !== 'function') { 
                                cb = printResult; 
                                for (var j=0; j < arguments.length; j++) {
                                    args.push(arguments[j]);
                                }
                            } else {
                                for (var j=0; j < arguments.length-1; j++) {
                                    args.push(arguments[j]);
                                }
                            }
                            client.request(i, args).subscribe((data) => {
                                cb(null, data);
                            }, (err) => {
                                cb(err);
                            }); 
                        };
                    })(i);
                    //Init help hints
                    Object.defineProperty(node[path[0]], "cmd", { value : i });
                    Object.defineProperty(node[path[0]], "doc", { value : _methods[i].doc });
                    Object.defineProperty(node[path[0]], "args", { value : _methods[i].args });
                };
        
                methods = root;
        
                function syncctx(repl) {
                    repl.resetContext();
        
                    for(var i in methods) {
                        repl.context[i] = methods[i];
                    }
        
                    repl.context.cli = client;
        
                    repl.context.help = () => {
                        console.log('Reason API');
        
                        function enumerate(node, depth) {
                            for(var i in node) {
                                if (typeof node[i] === 'object') {
                                    console.log('  '.repeat(depth) + colors.yellow(i));
                                    enumerate(node[i], depth+1);
                                    continue;
                                }
        
                                console.log('  '.repeat(depth) + colors.yellow(i) + '(' + colors.blue(node[i].args || '') +')', colors.white(node[i].doc || ''));
                            }
                        }
        
                        enumerate(methods, 0);
                    };
                };
        
                function printResult(err, data) {
                    if(err) {
                        console.log("Error:", data);
                    } else {
                        console.log(inspect(data, { depth: 20, colors: true }));
                    }
                    repl.context.result = data;
                    repl.context.error = err;
                }
        
                function startRepl() {
        
                    var repl = require("repl").start({
                        prompt : "reason> ",
                        input : process.stdin,
                        output : process.stdout,
                        terminal : true,
                        ignoreUndefined: true,
                        writer : function (obj) {
                            if (obj.args) {
                                return console.log(colors.yellow(obj.cmd) + '(' + colors.blue(obj.args || '') +')', colors.white(obj.doc || ''));
                            }
        
                            return inspect(obj, { depth: 20, colors: true });
                        }
                    });
        
                    repl.on("exit", function () {
                        client.disconnect();
                        console.log("Bye!");
                    });
        
                    function println(msg) {
                        repl.outputStream.write(msg + "\n");
                    }
        
                    function error(msg) {
                        return "ERROR: " + msg;
                    }
        
                    return repl;
                }
        
                client.request('signals', []).subscribe((args) => {
                    if (args === 'ok') {
                        // signals registered
                        return;
                    }

                    switch (args[0]) {
                        case 'document.changed':
                            console.log('document.changed:', args[1]);
                            break;
                        default:
                            console.log('unknown signal from Reason:', args[0], args[1]);
                            break;
                    }
                });
        
                repl = startRepl();
        
                syncctx(repl);
            }); 
        }
    }
}

