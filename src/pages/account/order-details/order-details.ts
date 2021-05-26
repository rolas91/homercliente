import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Service } from '../../../providers/service/service';
import { Values } from '../../../providers/service/values';
import { Config } from '../../../providers/service/config';
import { HTTP } from '@ionic-native/http';
import { Http } from '@angular/http';


@Component({
    templateUrl: 'order-details.html',
})
export class OrderDetails {
    orderDetails: any;
    id: any;
    dataOrder: any;
    constructor(public nav: NavController, public service: Service, params: NavParams, 
        public actionSheetCtrl: ActionSheetController,
        private config: Config,
        private reqhttp: HTTP,
        private http: Http,
        public values: Values) {
            console.log(params);
        this.id = params.data;
        this.service.getOrder(this.id)
            .then((results) => this.orderDetails = results);
    }

    confirmOrder(){
    
        const actionSheet = this.actionSheetCtrl.create({
          title: 'Change Your Order Status ...',
          cssClass: 'myaction',
          buttons: [
            {
            text: 'Processing',
            cssClass: 'processing',
            handler: () => {
            let params = {
              status: 'processing'
            };
    
            new Promise(resolve => {
              this.http
                .post(
                  this.config.setUrl +
                    '/wc-api/v3/orders/'+ this.id,
                  params,
                  this.config.options,
                )
                .map(res => res.json())
                .subscribe(data => {
                })
            })
    
            //  this.WooCommerce.putAsync("orders/" + this.order.id, data).then( (data) => {
            //   console.log(JSON.parse(data.body));
            //   this.navCtrl.push("OrderPage");
            // }, (err) => {
            //   console.log(err);
            // });
    
    
            }
          },
           {
            text: 'Cancel',
            cssClass: 'cancel',
            handler: () => {
            let params = {
              status: 'cancelled'
            };
    
            return new Promise(resolve => {
                this.http
                  .post(
                    this.config.setUrl('POST', '/wc-api/v3/orders/', false),
                    params,
                    this.config.options,
                  )
                  .map(res => res.json())
                  .subscribe(
                    data => {
                      this.dataOrder = data
                      resolve(this.dataOrder)
                      console.log(this.dataOrder)
                    },
                    err => {
                      resolve(err.json())
                    },
                  )
              })
    
    
            }
          }
          ]
        });
        actionSheet.present();
        
        }

}