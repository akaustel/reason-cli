# Reason CLI

A Command Line interface to Reason. It can also be used to programmatically access Reason.

## Usage as Cli

All backend Socket API commands are available in the CLI.

Tab completion is available.

The result of each command is stored in the `result` variable.

### Install 

```sh
npm install -g https://reason.wishtech.org/reason.tgz
```

### Run on Linux or OSX

```sh
reason-cli
```

### Run on Windows

```sh
reason-cli
```

### Example usage

Example usage:

```javascript
documents.list()
```

## Programmatic Usage

```javascript
const { Client } = require('reason-cli');

const client = new Client('ws://localhost:8080');

client.ready().subscribe(() => {
    cli.request('document.add', [arguments]).subscribe((data) => {
        if (err) { return console.log('Failed posting to wall', err, data); }

        console.log('wall2.new_post response:', data);

        setTimeout(() => {
            cli.request('document.list', []).subscribe((data) => {
                cli.disconnect();
            }); 
        }, 5000);
    })
});
```
