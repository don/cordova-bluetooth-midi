// Cordova MIDI Drum Machine
// (c) 2017 Don Coleman
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
        app.createServiceJSON();

        document.querySelector('#topLeft').addEventListener('touchstart', app.floorTom, false);
        document.querySelector('#topRight').addEventListener('touchstart', app.crashCymbal, false);
        document.querySelector('#bottomLeft').addEventListener('touchstart', app.snare, false);
        document.querySelector('#bottomRight').addEventListener('touchstart', app.base, false);
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
    cowbell: function() {
        app.drum(56, 127);
    },
    snare: function() {
        app.drum(38, 127);
    },
    base: function() {
        app.drum(36, 127);
    },
    floorTom: function() {
        app.drum(41, 127);
    },
    rideCymbal: function() {
        app.drum(51, 127);
    },
    crashCymbal: function() {
        app.drum(49, 127);
    },
    drum: function (midiNote, velocity) {
        var channel = 10;
        var drumOn = new Uint8Array([0x80, 0x80, 0x90 + channel, midiNote, velocity]).buffer;
        var drumOff = new Uint8Array([0x80, 0x80, 0x80 + channel, midiNote, 0]).buffer;
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
    }
};

app.initialize();