/*
import { Client } from './src/client';

const client = new Client();

client.ready().subscribe(() => {
    console.log('ready?...');
    client.request('methods', []).subscribe((data) => {
        console.log('methods:', data);
    });

    client.request('crypto.sha256', [new Buffer('abcde')]).subscribe((data) => {
        console.log('sha256', data);
    });

    client.request('document.list', [new Buffer('abcde')]).subscribe((data) => {
        console.log('list', data);
    });

    client.request('wish', [{ op: 'identity.list', args: [] }]).subscribe((data) => {
        console.log('identity list', data);
    });
});

import { Cli } from './src/cli-impl';

const cli1 = new Cli('ws://localhost:8080');

cli1.on('ready', () => {
    console.log('run ready...');
});
*/
import { Cli } from './src/cli';

const cli = new Cli();
