import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { CreditCardValidators, CreditCard } from 'angular-cc-library';
import { defer } from 'rxjs/observable/defer';
import { map } from 'rxjs/operators';
import { Values } from '../../providers/service/values';
import { VirtualCardAdminPage } from '../virtual-card-admin/virtual-card-admin';
/**
 * Generated class for the NewCardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-new-card',
  templateUrl: 'new-card.html',
})
export class NewCardPage implements OnInit {
    public demoForm: FormGroup;
    public submitted = false;

    public type$ = defer(() => this.demoForm.get('creditCard').valueChanges)
      .pipe(map((num: string) => CreditCard.cardType(num)));

    constructor(private fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams, public values:Values) {}

    public ngOnInit() {
      this.demoForm = this.fb.group({
        creditCard: ['', [CreditCardValidators.validateCCNumber]],
        expDate: ['', [CreditCardValidators.validateExpDate]],
        cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      });
    }

    public goToNextField(controlName: string, nextField: HTMLInputElement) {
      if (this.demoForm.get(controlName).valid) {
        nextField.focus();
      }
    }

    public onSubmit(demoForm: FormGroup) {
      this.submitted = true;
      localStorage.setItem('cardData',JSON.stringify(demoForm.value));
      this.navCtrl.setRoot(VirtualCardAdminPage);
    }


}
