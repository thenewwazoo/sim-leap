import * as keypress from 'keypress';

import { FakeSmartBridge } from './Server';
import { startAdvertiser } from './resolver';

startAdvertiser();

keypress(process.stdin);

const srv = new FakeSmartBridge('./key.pem', './cert.pem');

process.stdin.on('keypress', (ch, key) => {

    if (key && key.ctrl && key.name === 'c') {
        process.stdin.pause();
        srv.die();
        process.exit();
    } else if (key && key.name === 'k') {
        console.log('killing server');
        srv.die();
    } else if (key && key.name === 's') {
        console.log('starting server');
        srv.startServer();
    } else {
        console.log('^c to quit. k to kill server, s to start');
    }

});

process.stdin.setRawMode(true);
process.stdin.resume();
