
import debug from 'debug';

import * as ciao from '@homebridge/ciao';

const logDebug = debug('leap:sim:adv');

export function startAdvertiser() {

    const responder = ciao.getResponder();

    const service = responder.createService({
        name: 'Fake Lutron Status',
        type: 'lutron',
        hostname: 'Lutron-a1b2c3d4',
        port: 8081,
        txt: {
            MACADDR: 'DE:AD:BE:EF:CA:FE',
            CODEVER: '08.08.21f000',
            DEVCLASS: '08040100',
            FW_STATUS: '1:NoUpdate',
            NW_STATUS: 'InternetWorking',
            ST_STATUS: 'good',
            SYSTYPE: 'SmartBridge',
        },
    });


    service.advertise().then(() => {
        logDebug('Fake Lutron Status service published');
    });

    return service;
}
