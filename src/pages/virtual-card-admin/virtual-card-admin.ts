import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Service } from '../../providers/service/service';
import { Values } from '../../providers/service/values';
import {NewCardPage} from '../new-card/new-card';

/**
 * Generated class for the VirtualCardAdminPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-virtual-card-admin',
  templateUrl: 'virtual-card-admin.html',
})
export class VirtualCardAdminPage {

  customers: any;
  addresses: any;
  address: any;
  status: any;
  form: any;
  cards:any = [];
  constructor(public nav: NavController, public service: Service, public values: Values) {
      this.service.getCustomer()
          .then((results) => this.customers = results);

      this.service.getAddress()
          .then((resultsAddresses) => this.addresses = resultsAddresses);
  }

  ngOnInit() {
    let data = JSON.parse(localStorage.getItem("cardData"));
    console.log(data);
    if(data != null){
      this.cards = Object.keys(data).map(i => data[i]);
    }else{
      this.cards = null
    }

  }

  delete(){
    localStorage.removeItem('cardData')
    this.nav.setRoot(VirtualCardAdminPage);
  }

  gohome(){
    this.nav.parent.select(0);
  }

  newCard(){
    this.nav.push(NewCardPage)
  }



   checkAvatar() {
     return this.service.checkAvatar();
   }

}
