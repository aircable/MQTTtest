import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/delay';


import { Storage } from '@ionic/storage';

// background task, keeps timer running
import { BackgroundMode } from '@ionic-native/background-mode';

// bar graph
import { Chart } from 'chart.js';

// MQTT
import { MqttMessage, MqttModule, MqttService } from 'ngx-mqtt';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {

    @ViewChild('barCanvas') private barCanvas: ElementRef;
    barChart: any;

    private isIos: boolean;
    private isCordova:boolean;



    // status, progress bar
    public a = 0;
    public b = 0;

    private MQTT_SERVICE_OPTIONS = {
        connectOnCreate: false,
        hostname: 'aircable.net',
        port: 8883, // unsecured web socket port ws:// will not work on Progressive Web App via https://
        protocol: 'wss',
        path: '',
        username: 'aircable',
        password: 'aircable',
    };
    private MQTTconnected = false;
    // define a json object we want to send through MQTT
    // will be mapped to a typescript class
    private MQTTmessage = {
        id: 0 as number,    // unique identifier
        A: <number> 0,  // number
        B: <number> 0
    };


    constructor(
        private platform: Platform,
        public navCtrl: NavController,
        private storage: Storage,
        private backgroundMode: BackgroundMode,
        private zone: NgZone,
        private mqtt: MqttService,)
    {

        this.isIos = this.platform.is("ios");
        this.isCordova = this.platform.is("cordova");

        console.log( "plastform "+this.platform );

        // check native BLE access
        if( this.isCordova ) {
            console.log("Native BLE is enabled");
        } else {
            console.log("Web Bluetooth");
        }

        // MQTT connection
        this.mqtt.onConnect.subscribe((e) => {
            console.log('mqtt: onConnect', e);
            this.zone.run(() => {
                this.MQTTconnected = true;
                this.mqtt.observe('MQTTtest').subscribe((message:MqttMessage) => {
                    // payload is Uint8Array, no duplicates
                    console.log('mqtt: ' + message.payload.toString() + message.dup);
                    if (message.dup == false) {
                        this.remoteCommand(message.payload);
                    }
                });
            });
        });
        this.mqtt.onError.subscribe((e) => console.log('mqtt: onError', e));
        this.mqtt.onClose.subscribe(() => {
            console.log('mqtt: onClose');
            this.MQTTconnected = false;
        });
        this.mqtt.onReconnect.subscribe(() => console.log('mqtt: onReconnect'));
        // connect and subscribe in method
        this.mqtt.onMessage.subscribe((e) => console.log('mqtt: onMessage ', e));

    }


    ionViewDidLoad() {

        let context = this.barCanvas.nativeElement;
        this.barChart = new Chart( context, {
            type: 'horizontalBar',
            data: {
                datasets: [
                    {
                        data: [0],
                        backgroundColor: "#cc65fe", // purple
                    },
                    {
                        data: [0],
                        backgroundColor: "#ff6384", // red
                    }
                ],
            },
            options: {
                legend: {display: false},
                scaleShowVerticalLines: false,
                //responsive: true.
                scales: { xAxes: [{ display: false, ticks: { beginAtZero: true, max: 100 } }] }
            }
        });

        console.log( "init chart "+ this.barChart.data.datasets[0].data );


    }





    // command coming from MQTT server
    private remoteCommand( cmd: Uint8Array ) {
        console.log( "got mqtt msg"+cmd.toString());
        // we are getting a JSON string, need to parse
        let jsonobj = JSON.parse( cmd.toString() );

        if( jsonobj.id !== this.MQTTmessage.id ) {
            // ignore owr own messages
            let A = jsonobj.A;
            let B = jsonobj.B;
            console.log( "remote: "+A+" "+B );
        }

    }




    // UI call from color selector component
    receiveCmd( coordinate: string ) {
        console.log( "set color "+ coordinate );

        if( coordinate.indexOf( "UP" ) > 0 ) {
            // found
            //this.sendCommand( 0, 0 );
        } else {
            // down or move envent, change to number
            let A = +coordinate.substr( 1, 2 ) * 10;
            let B = +coordinate.substr( 4, 2 ) * 10;

            // send to MQTT as original string to easy parse later
            this.MQTTmessage.A = A;
            this.MQTTmessage.B = B;
            try {
                this.mqtt.unsafePublish("MQTTtest", JSON.stringify( this.MQTTmessage ), {qos: 0, retain: false});
            } catch(e) {
                // ignore when not connected
            }
        }
    }



    connectMQTT() {
        if( this.MQTTconnected ){
            this.mqtt.disconnect();
        } else {
            this.mqtt.connect(this.MQTT_SERVICE_OPTIONS);
        }

    }


}
