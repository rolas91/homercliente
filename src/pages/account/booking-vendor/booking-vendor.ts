import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Service } from '../../../providers/service/service';
import { Values } from '../../../providers/service/values';
import { Functions } from '../../../providers/service/functions';
import { Http } from '@angular/http';
import { Config } from '../../../providers/service/config';
import { URLSearchParams } from '@angular/http'
import { BookingDetails } from '../booking-details/booking-details';
import { TranslateService } from '@ngx-translate/core';



@Component({
    templateUrl: 'booking-vendor.html',
})
export class BookingVendor {
    orders: any;
    slug: any;
    count: any;
    offset: any;
    has_more_items: boolean = true;
    quantity: any;
    page: number = 1;
    id: any;
    idVendor: any;
    filter: any;
    status: any;
    dataVendor: any = {}
    lan: any = {};

    constructor(public translate: TranslateService, private config: Config, private http: Http, public nav: NavController, public service: Service, public values: Values, public functions: Functions) {
        
    }
    ionViewDidEnter() {
      this.filter = {};
        this.filter.page = 1;
        this.count = 10;
        this.offset = 0;
        this.quantity = "1";
        this.idVendor = this.values.customerId;
        this.filter['id'] = this.values.customerId.toString();
        this.service.getBookingsVendor(this.filter)
            .then((results) => this.orders = results);
    } 
    doInfinite(infiniteScroll) {
        this.filter.page += 1;
        this.service.getBookingsVendor(this.filter)
            .then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        this.filter.page += 1;
        if (results.orders != undefined) {
            for (var i = 0; i < results.orders.length; i++) {
                this.orders.orders.push(results.orders[i]);
            };
        }
        if (results.orders.length == 0) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }
    getBookingDetails(idOrder) {
      var idVendor = this.idVendor;
      this.nav.push(BookingDetails, {idOrder, idVendor});
    }
    confirm(bookingId) {
        var params = new URLSearchParams();
        params.append('bookingid', bookingId)
        return new Promise(resolve => {
        console.log(params);
          this.http
            .post(
              this.config.url +
                '/wp-admin/admin-ajax.php?action=mstoreapp-process_confirm',
              params,
              this.config.options,
            )
            .map(res => res.json())
            .subscribe(data => {
              this.status = data
              resolve(this.status)
              console.log(this.status);
              console.log(data);
              console.log(this.status.message);

              if(this.status.message == "success"){
                this.functions.showAlert("SUCCESS", "Booking Confirmed. ");
                this.ionViewDidEnter();
              }
              else
                this.functions.showAlert("ERROR", "an error has occurred please check. ");
            })
        })
      }
    unconfirm(bookingId) {
        var params = new URLSearchParams();
        params.append('bookingid', bookingId)

        return new Promise(resolve => {
        console.log(params);

          this.http
            .post(
              this.config.url +
                '/wp-admin/admin-ajax.php?action=mstoreapp-process_unconfirm',
              params,
              this.config.options,
            )
            .map(res => res.json())
            .subscribe(data => {
              this.status = data
              resolve(this.status)
              console.log(this.status);
              console.log(data);
              console.log(this.status.message);
              if(this.status.message == "success"){
                this.functions.showAlert("SUCCESS", "Booking Unconfirmed. ");
                this.ionViewDidEnter();
              }
              else
                this.functions.showAlert("ERROR", "an error has occurred please check. ");
            })
        })
      }

      ngOnInit() {
        this.translate.get(['SUCCESS', 'Please Select']).subscribe(translations => {
            this.lan.oops = translations['Oops!'];
            this.lan.oops = translations['Oops!'];
        });
    }
}