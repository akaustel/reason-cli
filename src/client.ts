import { Observable, Observer } from 'rxjs';
import * as bson from 'bson-buffer'
import * as WebSocket from 'ws';

const BSON = new bson();

interface RpcCallback {
    cb: (err: Error, end: boolean, data?: any) => void;
}

interface ClientOpts {
    host?: string
}

/**
 * Reason Client
 *
 * Allows connecting to the Reason Backend and running rpc commands
 */
export class Client {
    id = 0;
    cbs: { [key: number]: RpcCallback } = {};
    port = process.env.PORT || 8080;
    host = 'ws://localhost:' + this.port;
    socket: WebSocket;
    readyCb = [];
    readyState = false;
    
    constructor(opts: ClientOpts = {}) {
        this.socket = new WebSocket(opts.host || this.host);
        
        this.socket.on('open', () => {
            this.socket.on('message', (ev) => {
                let msg: any;
                
                try {
                    msg = BSON.deserialize(ev, {});
                } catch (e) { return console.log('Error:', e, ev); }
                
                if (msg.err) {
                    return this.cbs[msg.err].cb(msg.data, true);
                }
                if (msg.ack || msg.sig) {
                    this.cbs[msg.ack || msg.sig].cb(null, !msg.sig, msg.data);
                }
            });
            
            this.socket.on('close', function() {
                console.log('WebSocket closed.');
            });
            
            this.readyState = true;
            this.readyCb.forEach((cb) => cb());
            this.readyCb = [];
        });
    }
    
    public ready() {
        if (this.readyState) {
            return Observable.create((observer: Observer<any>) => {
                observer.next(null);
                observer.complete();
            });
        }
        
        return Observable.create((observer: Observer<any>) => {
            this.readyCb.push(() => {
                observer.next(null);
                observer.complete();
            });
        });
    }
    
    public request(op: string, args: any) {
        if (this.socket.readyState !== this.socket.OPEN) {
            return Observable.create((observer: Observer<any>) => {
                observer.error({ code: 7, msg: "We're not connected yet.", op, args });
            });
        }
        
        this.socket.send(BSON.serialize({ op: op, args: args, id: ++this.id }, {}));
        
        return Observable.create((observer: Observer<any>) => {
            this.cbs[this.id] = { cb: (err, end, data) => {
                if (err) {
                    observer.error(err);
                    return;
                }
                
                observer.next(data);
                if (end) {
                    observer.complete();
                }
            }};
        });
    }

    disconnect() {
        this.socket.close();
    }
}
