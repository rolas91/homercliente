import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Service } from '../../../providers/service/service';
import { Values } from '../../../providers/service/values';
import { Config } from '../../../providers/service/config';
import { HTTP } from '@ionic-native/http';
import { Http } from '@angular/http';


@Component({
    templateUrl: 'booking-details.html',
})
export class BookingDetails {
    orderDetails: any;
    idOrder: any;
    idVendor: any;

    dataOrder: any;
    constructor(public nav: NavController, public service: Service, params: NavParams, 
        public actionSheetCtrl: ActionSheetController,
        private config: Config,
        private reqhttp: HTTP,
        private http: Http,
        public values: Values) {
        console.log(params);
        this.idOrder = params.data.idOrder;
        this.idVendor = params.data.idVendor;
        this.service.getBooking(this.idOrder,this.idVendor)
            .then((results) => this.orderDetails = results);
    }

}