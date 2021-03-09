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
    client.request('document.list', []).subscribe({
        next: (data) => {
            client.disconnect();
        },
        error: (error) => {
            console.log('Error in example.js:', error.toString());
            client.disconnect();
        }
    });
});
```
