import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {
  message:string = '';
  showItem = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl:ViewController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  showOther(){
    this.showItem = !this.showItem;
  }

  acept(){
    this.viewCtrl.dismiss({result:true, message:this.message})
  }

  cancel(){
    this.viewCtrl.dismiss({result:false, message:''})
  }
  selectMessage(event: string){
    this.message = event
  }

}
