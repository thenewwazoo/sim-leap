import { Server, TLSSocket, SecureContextOptions, createSecureContext, createServer } from 'tls';
import {readFileSync} from 'fs';
import * as util from 'util';

import { Message, Response, ResponseParser, ResponseStatus, OnePingResponse } from 'lutron-leap';

class ParserResponder {
    private responseParser: ResponseParser;

    constructor(public socket: TLSSocket) {
        console.log("new ParserResponder");
        this.responseParser = new ResponseParser();
        this.responseParser.on('response', this.handleParsedResponse.bind(this));
        console.log("wired up response handler");
    }

    handleSocketData(data: Buffer): void {
        const s = data.toString();
        console.log('got data from socket:', s);
        try {
            console.log('parsing line', s);
            this.responseParser.handleData(s);
        } catch (e) {
            console.log('malformed response:', e, ' caused by', s);
        }
    }

    handleParsedResponse(request: Response) { // `request` is actually a Message
        console.log("got a parsed response: ", util.inspect(request));

        const tag = request.Header.ClientTag;

        if (request.CommuniqueType == 'ReadRequest') {
            if (request.Header.Url == "/server/1/status/ping") {

                let response = new Response();

                response.CommuniqueType = "ReadResponse";

                response.Header.ClientTag = tag;
                response.Header.Url = request.Header.Url;
                response.Header.StatusCode = new ResponseStatus("OK", 200);
                response.Header.MessageBodyType = "OnePingResponse";

                response.Body = new OnePingResponse();
                response.Body.PingResponse = { LEAPVersion: 1.115 };

                this.socket.write(JSON.stringify(response) + '\n', () => {
                    console.log("responded to tag ", tag, " successfully");
                });

            } else {
                console.log(`Unknown URL ${request.Header.Url}`);
            }

        } else {

            console.log(`Incoming was ${util.inspect(request)}`);
            console.log("tag was ", request.Header.ClientTag);

        }
    }
}

export class FakeLeapServer {

    private server: Server;
    private connections: Array<ParserResponder>;

    constructor(keyFileName: string, certFileName: string) {

        this.connections = new Array();

        const tlsOptions = {
            key: readFileSync(keyFileName),
            cert: readFileSync(certFileName),
        };

        this.server = createServer(tlsOptions, socket => {
            console.log("new connection");
            const r = new ParserResponder(socket);
            socket.on('data', r.handleSocketData.bind(r));
            this.connections.push(r);
        });
    }

    public startServer() {
        this.server.listen(8081, '127.0.0.1', function() {
            console.log("listening");
        });

    }

    public die() {
        this.server.close();
        for (const conn of this.connections) {
            conn.socket.destroy();
        }
    }
}
