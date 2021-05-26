import { Component, ViewChild } from '@angular/core'
import { NavController, NavParams, Content, AlertController, Platform } from 'ionic-angular'
import { ProductService } from '../../providers/service/product-service'
import { Values } from '../../providers/service/values'
import { Functions } from '../../providers/service/functions'
import { md5 } from './md5'
import { CartPage } from '../cart/cart'
import { AccountLogin } from '../account/login/login'
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar'
import moment from 'moment'
import { TranslateService } from '@ngx-translate/core'
import { ProductsListPage } from '../products-list/products-list'
import { OneSignal } from '@ionic-native/onesignal';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { Service } from '../../providers/service/service';
@Component({
  templateUrl: 'product.html',
})
export class ProductPage {
  @ViewChild(Content) content: Content
  providerOneSignal:any
  product: any = {}
  id: any
  type: any
  status: any
  options: any
  optionss: any
  opt: any
  message: any
  wishlist: any
  quantity: any
  reviews: any
  reviewForm: any
  nickname: any
  details: any
  BookNow: any
  disableSubmit: boolean = true
  wishlistIcon: boolean = false
  usedVariationAttributes: any = []
  selectedService: any
  selectedTime: any
  mon: any = []
  day: any
  month: any = 1
  year: any
  disableWeekDays = []
  daysConfig: DayConfig[] = []
  optionsMulti: CalendarComponentOptions = {
    pickMode: 'single',
    daysConfig: this.daysConfig,
    disableWeeks: this.disableWeekDays,
  }
  schedule: any
  NoBlockAvailable = 'NoBlockAvailable'
  WhatTime = 'WhatTime'
  lan: any = {};
  miLatitude = 0;
  miLongitude = 0;
  lat: string;
  long:string;
  autocomplete: { input: string; };
  address:string;

  date:any = '2021-03-03';
  hourInit:any = '08:00';
  hourEnd:any = '22:00';

  processDate:any;
  processHour:any;
  product_slot:any = []

  customers: any;
  addresses: any;
  addressesCustomer: any;

  constructor(
    public alert:AlertController,
    public translate: TranslateService,
    public nav: NavController,
    public service: ProductService,
    public servi:Service,
    public otherservice: Service,
    params: NavParams,
    public functions: Functions,
    public values: Values,
    private platform: Platform,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,

  ) {
    console.log("prueba id onesignal", this.values.userId);

    this.lat = '';
    this.long = '';
    this.options = []
    this.optionss = []
    this.quantity = '1'
    this.BookNow = 'BookNow'


    this.otherservice.getCustomer()
    .then((results) => this.handleCustomer(results));

    this.otherservice.getAddress()
    .then((resultsAddresses) =>  this.handleAddress(resultsAddresses));


    if (params.data.id) {
      this.selectedService = null
      this.product.product = params.data.id
      this.id = params.data.id

      this.product_slot = params.data.product_sl;

     this.date = params.data.date;
     this.hourInit = params.data.hourInit;
     this.hourEnd = params.data.hourEnd;

    //  this.selectedTime = this.date+'T'+this.hourInit

      this.options.product_id = this.id

      this.usedVariationAttributes = (this.product.product
        .resources_full as Array<any>).map(item => item)

      console.log('usedVariationAttributes:', this.usedVariationAttributes)
      this.loadDataProduct();
    } else {
      // this.options.product_id = this.id
       this.service
        .getProduct(params.data.id)
        .then(results => this.handleProductResults(results))
    }

    this.getReviews()
    platform.ready().then(() => {
      const subscription = this.geolocation.watchPosition()
        .filter((p) => p.coords !== undefined) //Filter Out Errors
        .subscribe(position => {
          this.miLatitude = position.coords.latitude;
          this.miLongitude = position.coords.longitude;
          // console.log("locomiLocation=" + position.coords.latitude + ' ' + position.coords.longitude);
        });
    });

    this.servi.getHomerOneSignal(this.product.product.id).then((result:any) => this.providerOneSignal = result.providers[0].onesignal);


    //con esto antes obtenia el providerOneSignal
    // for (let i = 0; i < this.values.homerOneSignal.length; i++) {
    //   if(this.values.homerOneSignal[i].product == this.product.product.id){
    //     this.providerOneSignal = this.values.homerOneSignal[i].providerOneSignal
    //   }
    // }

  }

  loadDataProduct(){
    //según el horario, deshabilitamos los dias de la semana que no están definidos en el Available
    this.disableWeekDays = [0, 1, 2, 3, 4, 5, 6]
    this.product.product.availability.forEach(element => {
      let day = Number((element.type as string).split(':')[1])
      console.log({ day })
      const index = this.disableWeekDays.indexOf(day)
      if (index > -1) {
        this.disableWeekDays.splice(index, 1)
      }
    })

    console.log('this.daysConfig', this.daysConfig)
    console.log('this.disableWeekDays', this.disableWeekDays)

    //Ponemos los dias as marked (para que aparezcan de un color azul) 6 meses hacia adelante
    for (let index = 0; index < 180; index++) {
      let cur_day = moment()
        .add(index, 'days')
        .toDate()
        .getDay()
      const index_cur_day = this.disableWeekDays.indexOf(cur_day)
      if (index_cur_day > -1) {
        this.daysConfig.push({
          date: moment()
            .add(index, 'days')
            .toDate(),
          disable: true,
        })
      }

      this.daysConfig.push({
        date: moment()
          .add(index, 'days')
          .toDate(),
        marked: true,
      })
    }

    //Por defecto iniciamos con el booking deshabilitado
    this.disableSubmit = true
  }

  handleAddress(result){
    this.addresses = result
    this.addressesCustomer = this.addresses.customer.billing_address.address_1
    console.log(this.addressesCustomer)
  }

  handleCustomer(result){
    this.customers = result
  }

  handleProductResults(results) {

    this.selectedService = null
    this.product.product = results
    this.id = results.id
    console.log('producto', this.product.product)
    this.options.product_id = this.id
    console.log('Product: ', this.product.product.resources_full)
    this.usedVariationAttributes = (this.product.product
      .resources_full as Array<any>).map(item => item)
    console.log('usedVariationAttributes:', this.usedVariationAttributes)

    this.loadDataProduct();

    // this.product = results
    // this.usedVariationAttributes = this.product.product.attributes.filter(
    //   function(attribute) {
    //     return attribute.variation == true
    //   },
    // )
  }
  getProduct(id) {
    this.nav.push(ProductPage, id)
    console.log(id)
  }
  addToCart() {
    // if (!this.values.isLoggedIn) {
    //   this.functions.showAlert(
    //     'Options',
    //     'Please login or create an account to continue',
    //   )
    //   this.nav.push(AccountLogin)
    // }
    //Validamos se el producto contiene resources
    // if (
    //   this.product.product.resources_full.length > 0 &&
    //   !this.selectedService
    // ) {
    //   this.functions.showAlert(
    //     'Options',
    //     'Select a service and booking information',
    //   )
    //   return
    // }
    var resource_id = !this.selectedService
      ? null
      : this.selectedService.resource_id
      ? this.selectedService.resource_id
      : null
    this.getAddressFromCoords();

    var date = moment(this.date)
    var year = date.year()
    var month = date.month()
    var day = date.day()



    this.service.addOrders({
      "clientUi": this.values.customerId,
      "nameClient": this.values.customerName,
      "productUi": this.product.product.id,
      "productName": this.product.product.name,
      "date": year+'/'+month+'/'+day,
      "hour": this.hourInit,
      "lat":this.lat,
      "lng":this.long,
      "onesignal":this.values.userId,
      "location" : this.addressesCustomer
    });

    this.service.sendNotification({
      "title":"Nueva solicitud",
      "content":`Usted ha recibido una solicitud de servicio de ${this.values.customerName}`,
      "onesignalid":this.providerOneSignal
    })



    this.disableSubmit = true
    this.BookNow = 'PleaseWait'


    // var date = new Date(this.selectedTime);



    this.product_slot.map(result => {

      if(this.product.product.id == result.product_id)
      {
        var date = new Date(new Date(result.date))
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()

        this.service
          .addToCart(
            resource_id,
            month,
            day,
            year,
            result.date,
            this.product.product,
          )
          .then(results => {
           console.log(results)
          })
          this.values.count += parseInt(this.quantity)
      }
    })

      this.disableSubmit = false
      this.BookNow = 'BookNow'
      this.showAlert('Solicitud enviada', '<strong>Exito:</strong> Has enviado una solicitud a tu homer correctamente');
      this.returnHome()
    // }
  }

  showAlert(title, text) {
    let alert = this.alert.create({
        title: title,
        subTitle: text,
        buttons: ['OK'],
    });
    alert.present();
  }

  setVariations() {
    this.product.product.attributes.forEach(item => {
      if (item.selected) {
        this.options['variation[attribute_pa_' + item.name + ']'] =
          item.selected
      }
    })
    for (var i = 0; i < this.product.product.attributes.length; i++) {
      console.log(this.product.product.attributes[i].name)
      if (
        this.product.product.attributes[i].variation &&
        this.product.product.attributes[i].selected == undefined
      ) {
        this.functions.showAlert(
          'Options',
          'Please Select Product ' +
            this.product.product.attributes[i].name +
            ' Option',
        )
        return false
      }
    }
    return true
  }

  onSelect($event, id) {
    let date = new Date($event.time)
    console.log({ date })
    this.month = date.getUTCMonth() + 1 //months from 1-12
    this.day = date.getUTCDate()
    this.year = date.getUTCFullYear()
    //si cambiamos la fecha reseteamos los horarios
    this.schedule = null
    this.selectedTime = null
    this.disableSubmit = true

    if (
      this.product.product.resources_full &&
      this.product.product.resources_full.length > 0 &&
      !this.selectedService
    ) {
      this.functions.showAlert('error', this.lan.pleaseSelect)
      return
    }

    var resource_id = !this.selectedService
      ? null
      : this.selectedService.resource_id
      ? this.selectedService.resource_id
      : null
    // if (this.values.isLoggedIn) {
    this.service
      .getBlocks(this.day, this.month, this.year, id, resource_id)
      .then(results => {
        let res = results as string
        let find = '<li class="block"'
        let regex = new RegExp(find, 'g')
        res = res.replace(
          regex,
          '<li class="block" ng-click="selectSchedule()" ',
        )
        console.log('schedule', res)
        var match = res.match(/data-value="(.*?)"/gi)
        if (!match) {
          this.schedule = null
          return
        }
        match.forEach((el, i, arr) => {
          arr[i] = el.replace('data-value=', '').replace(/"/g, '')
        })
        this.schedule = match
      })
  }
  update_blocks(a) {
    if (a.success == 'Success') {
      //this.functions.showAlert(a.success, a.message);
      this.values.blockslistId[this.product.product.id] = true
    } else {
      this.functions.showAlert('error', 'error')
    }
  }
  updateCart(a) {
    console.log('a:', a)
    this.disableSubmit = false
    this.values.count += parseInt(this.quantity)
    this.BookNow = 'BookNow'
    this.returnHome()
    // this.getCart()
  }
  returnHome(){
    this.nav.push(ProductsListPage);
  }
  getCart() {
    this.nav.parent.select(2);
  }
  mySlideOptions = {
    initialSlide: 1,
    loop: true,
    autoplay: 5800,
    pager: true,
  }
  getReviews() {
    this.service.getReviews(this.id).then(results => this.handleReview(results))
  }
  handleReview(a) {
    this.reviews = a
    for (let item in this.reviews.product_reviews) {
      this.reviews.product_reviews[item].avatar = md5(
        this.reviews.product_reviews[item].reviewer_email,
      )
    }
  }
  addToWishlist(id) {
    if (this.values.isLoggedIn) {
      this.service.addToWishlist(id).then(results => this.update(results))
    } else {
      this.functions.showAlert(
        'Warning',
        'Debe iniciar sesión para agregar un servicio a la lista de deseos',
      )
    }
  }
  update(a) {
    if (a.success == 'Success') {
      //this.functions.showAlert(a.success, a.message);
      this.values.wishlistId[this.product.product.id] = true
    } else {
      this.functions.showAlert('error', 'error')
    }
  }
  removeFromWishlist(id) {
    this.values.wishlistId[id] = false
    this.service.deleteItem(id).then(results => this.updateWish(results, id))
  }
  updateWish(results, id) {
    if (results.status == 'success') {
      this.values.wishlistId[id] = false
    }
  }
  chooseVariationOne(){
    this.chooseVariation(this.optionss);
  }
  chooseVariation(option) {
    console.log(option);

    console.log(this.selectedService);
    if (this.selectedService) {
      this.selectedService = null
      this.product.product.price = this.product.product.minPrice
    }
    this.product.product.resources_full.forEach(item => {
      if (item.resource_id == option.resource_id) {
        this.selectedService = option
        this.product.product.price = this.selectedService.price
        this.disableSubmit =
          (this.product.product.resources_full.length > 0 &&
            !this.selectedService) ||
          !this.selectedTime
      }
    })

    // this.product.product.variations.forEach(variation => {
    //   var test = new Array(this.usedVariationAttributes.length)
    //   test.fill(false)
    //   this.usedVariationAttributes.forEach(attribute => {
    //     if (variation.attributes.length == 0) {
    //       this.options.variation_id = variation.id
    //       this.product.product.in_stock = variation.in_stock
    //       this.product.product.price = variation.price
    //       this.product.product.sale_price = variation.sale_price
    //       this.product.product.regular_price = variation.regular_price
    //     } else {
    //       variation.attributes.forEach((item, index) => {
    //         if (
    //           attribute.selected &&
    //           item.name.toUpperCase() == attribute.name.toUpperCase() &&
    //           item.option.toUpperCase() == attribute.selected.toUpperCase()
    //         ) {
    //           test[index] = true
    //         }
    //       })
    //       if (test.every(v => v == true)) {
    //         this.options.variation_id = variation.id
    //         this.product.product.in_stock = variation.in_stock
    //         this.product.product.price = variation.price
    //         this.product.product.sale_price = variation.sale_price
    //         this.product.product.regular_price = variation.regular_price
    //         test.fill(false)
    //       }
    //     }
    //   })
    // })
  }

  selectTime(time) {
    this.selectedTime = time
    this.disableSubmit =
      (this.product.product.resources_full.length > 0 &&
        !this.selectedService) ||
      !this.selectedTime
  }

  getTime(item) {
    return moment(item).format('hh:mm a')
  }

  ngOnInit() {
    this.translate.get(['Please select a service']).subscribe(translations => {
        this.lan.pleaseSelect = translations['Please select a service'];
    });
  }

  getAddressFromCoords() {

    console.log("getAddressFromCoords "+this.miLatitude+" "+this.miLongitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(this.miLatitude, this.miLongitude, options)
    .then((result: NativeGeocoderReverseResult[]) => {
      console.log(JSON.stringify(result[0]))
      this.autocomplete.input = result[0].locality+', '+ result[0].administrativeArea+', '+ result[0].countryName;
    }
    )
    .catch((error: any) =>{
        this.address = "Address Not Available!";
        console.log(error)
      });
      this.lat = this.miLatitude.toString();
      this.long = this.miLongitude.toString();

  }

  getDate(date){
    this.processDate = date
  }

  getTime1(time){
    this.processHour = time
  }




}
