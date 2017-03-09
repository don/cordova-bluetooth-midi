var MIDI_SERVICE_UUID = '03B80E5A-EDE8-4B33-A751-6CE34EC4C700';
var MIDI_CHARACTERISTIC_UUID = '7772E5DB-3868-4112-A1A9-F2669D106BF3';

var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {

        blePeripheral.onWriteRequest(app.didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(app.onBluetoothStateChange);
        document.querySelector('#topLeft').addEventListener('touchstart', app.drum, false);

        app.createServiceJSON();

    },
    createServiceJSON: function () {

        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        var midiService = {
            uuid: MIDI_SERVICE_UUID,
            characteristics: [
                {
                    uuid: MIDI_CHARACTERISTIC_UUID,
                    properties: property.WRITE | property.READ | property.NOTIFY,
                    permissions: permission.WRITEABLE | permission.READABLE,
                    descriptors: [
                        {
                            uuid: '2901',
                            value: 'MIDI'
                        }
                    ]
                }
            ]
        };

        Promise.all([
            blePeripheral.createServiceFromJSON(midiService),
            blePeripheral.startAdvertising(midiService.uuid, 'Cordova')
        ]).then(
            function () { console.log('Created MIDI Service'); },
            app.onError
            );
    },
    drum: function () {
        var drumOn = new Uint8Array([0x80, 0x80, 0x90 + 10, 41, 127]).buffer;
        var drumOff = new Uint8Array([0x80, 0x80, 0x80 + 10, 41, 0]).buffer;
        app.sendData(drumOn);
        setTimeout(app.sendData, 15, drumOff);
    },
    sendData: function (buffer) {

        var success = function () {
            console.log('Sent ' + input.value);
        };
        var failure = function () {
            console.log('Error sending.');
        };

        blePeripheral.setCharacteristicValue(MIDI_SERVICE_UUID, MIDI_CHARACTERISTIC_UUID, buffer).
            then(success, failure);

    },
    didReceiveWriteRequest: function (request) {
        console.log(request);
    },
    onBluetoothStateChange: function (state) {
        console.log('Bluetooth State is', state);
        outputDiv.innerHTML += 'Bluetooth  is ' + state + '<br/>';
    }
};

app.initialize();