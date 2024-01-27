import SerialPort = require('serialport')
import {MessageCallback, SmartKnobCore, SmartKnobCoreOptions} from 'smartknobjs-core'

export class SmartKnobNode extends SmartKnobCore {
    private port: SerialPort | null

    constructor(serialPath: string, onMessage: MessageCallback, options?: SmartKnobCoreOptions) {
        super(
            onMessage,
            (packet: Uint8Array) => {
                this.port?.write(Buffer.from(packet))
            },
            options,
        )
        this.port = new SerialPort(serialPath, {
            baudRate: this.baudRate,
        })
        this.port.on('data', (data) => {
            this.onReceivedData(data)
        })
        this.portAvailable = true
    }
}
