import debug from 'debug';
import { Server, createServer } from 'tls';
import {readFileSync} from 'fs';

import { ParserResponder } from './ParserResponder';

const logDebug = debug('leap:sim:bridge');

export class FakeSmartBridge {

    private server: Server;
    private connections: Array<ParserResponder>;

    constructor(keyFileName: string, certFileName: string) {

        this.connections = [];

        const tlsOptions = {
            key: readFileSync(keyFileName),
            cert: readFileSync(certFileName),
        };

        this.server = createServer(tlsOptions, socket => {
            logDebug('new connection');
            const r = new ParserResponder(socket);
            socket.on('data', r.handleSocketData.bind(r));
            this.connections.push(r);
        });
    }

    public startServer() {
        this.server.listen(8081, '127.0.0.1', () => {
            logDebug('listening');
        });

    }

    public die() {
        this.server.close();
        for (const conn of this.connections) {
            conn.socket.destroy();
        }
    }
}
