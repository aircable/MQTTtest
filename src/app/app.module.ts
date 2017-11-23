import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { BackgroundMode } from '@ionic-native/background-mode';

import { ColorPickerComponent } from "../components/color-picker/color-picker";
import { ChartsModule } from 'ng2-charts';
import { MqttMessage, MqttModule, MqttService } from 'ngx-mqtt';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';


export const MQTT_SERVICE_OPTIONS = {
        connectOnCreate: false,
        hostname: 'aircable.net',
        port: 8883, // unsecured web socket port ws:// will not work on Progressive Web App via https://
        protocol: 'wss',
        path: '',
        username: 'aircable',
        password: 'aircable',
    };

export function mqttServiceFactory() {
    return new MqttService( MQTT_SERVICE_OPTIONS );
}

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ColorPickerComponent
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot({
            name: "__mydb",
            driverOrder: ["localstorage", "indexeddb", "sqlite", "websql"]
        }),
        ChartsModule,
        MqttModule.forRoot({
            provide: MqttService,
            useFactory: mqttServiceFactory
        }),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        BackgroundMode,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
    ]
})
export class AppModule {
}
