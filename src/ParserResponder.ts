import { TLSSocket } from 'tls';
import * as util from 'util';

import { Message, Response, ResponseParser, ResponseStatus, OnePingResponse } from 'lutron-leap';

export class ParserResponder {
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
