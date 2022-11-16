import debug from 'debug';
import { TLSSocket } from 'tls';
import * as util from 'util';

import { Response, ResponseParser, ResponseStatus, OnePingResponse } from 'lutron-leap';

const logDebug = debug('leap:sim:parser');

export class ParserResponder {
    private responseParser: ResponseParser;

    constructor(public socket: TLSSocket) {
        logDebug('new ParserResponder');
        this.responseParser = new ResponseParser();
        this.responseParser.on('response', this.handleParsedResponse.bind(this));
        logDebug('wired up response handler');
    }

    handleSocketData(data: Buffer): void {
        const s = data.toString();
        logDebug('got data from socket:', s);
        try {
            logDebug('parsing line', s);
            this.responseParser.handleData(s);
        } catch (e) {
            logDebug('malformed response:', e, ' caused by', s);
        }
    }

    handleParsedResponse(request: Response) { // `request` is actually a Message
        logDebug('got a parsed response: ', util.inspect(request));

        const tag = request.Header.ClientTag;

        if (request.CommuniqueType === 'ReadRequest') {
            if (request.Header.Url === '/server/1/status/ping') {

                const response = new Response();

                response.CommuniqueType = 'ReadResponse';

                response.Header.ClientTag = tag;
                response.Header.Url = request.Header.Url;
                response.Header.StatusCode = new ResponseStatus('OK', 200);
                response.Header.MessageBodyType = 'OnePingResponse';

                response.Body = new OnePingResponse();
                response.Body.PingResponse = { LEAPVersion: 1.115 };

                this.socket.write(JSON.stringify(response) + '\n', () => {
                    logDebug('responded to tag ', tag, ' successfully');
                });

            } else {
                logDebug(`Unknown URL ${request.Header.Url}`);
            }

        } else {

            logDebug(`Incoming was ${util.inspect(request)}`);
            logDebug('tag was ', request.Header.ClientTag);

        }
    }
}
