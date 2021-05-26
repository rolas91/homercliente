import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController, Platform, Content, NavParams, ViewController,ModalController, AlertController } from 'ionic-angular';
import { Service } from '../../providers/service/service';
import { Values } from '../../providers/service/values';
import { CartPage } from '../cart/cart';
import { ProductsPage } from '../products/products';
import { SearchPage } from '../search/search';
import { ProductPage } from '../product/product';
import { Post } from '../post/post';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {Socket}  from 'ngx-socket-io';
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { TabsPage } from '../tabs/tabs';


declare var google;

@Component({
  selector: "page-products-list",
    templateUrl: 'products-list.html'
})

export class ProductsListPage {
    @ViewChild('map') mapContainer: ElementRef;
    @ViewChild('pageTop') pageTop: Content;

//  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address:string;
  lat: string;
  long: string;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  PredictionArray: any[];

  date:any = "";
  hourInit:any = "";
  hourEnd:any = "";

  processDate:any;
  processHour:any;

  location: any;
  placeid: any;
  GoogleAutocomplete: any;

  categoriesValue:any;
  categories:any = [];

  selectedCategory: string;
  HiddenList: boolean = true;
  HiddenListCat: boolean = true;
  HiddenSearchLocation: boolean = false;
  HideRadius: boolean = false;
  HideBtnSearch: boolean = false;
  autocompleteCat: { input: string; };

  itemsCategory: any;
  radius: any = 0;
  originalCoords;
  miLatitude = 0;
  miLongitude = 0;

    status: any;
    items: any;
    product_slot:any;
    product: any;
    options: any;
    id: any;
    variationID: any;
    time: any;
    has_more_items: boolean = true;
    loading: boolean = true;
    texto:any = `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim praesentium quisquam dignissimos, ipsa odit tempore saepe! Debitis enim, dolor quis repellendus eveniet incidunt sapiente asperiores at quibusdam consequatur, laborum iusto?
    Beatae, assumenda qui nulla molestiae dolores delectus! Nulla explicabo itaque recusandae similique excepturi ea cumque sequi nostrum, laudantium nihil minima dolore, rerum deserunt fugit. At nulla nobis eos quibusdam quo!
    Molestias, voluptatem ex numquam asperiores explicabo eius quam sequi atque voluptates delectus incidunt minima molestiae tempore libero reprehenderit non sunt fugit repellendus ipsum rem totam quo suscipit assumenda. Nisi, enim.
    Officia illo sint quod facere laborum dolore perspiciatis expedita sit atque dignissimos blanditiis ab consectetur molestias iusto nobis obcaecati corporis odit, hic vitae reprehenderit iste. Dolores alias asperiores maxime porro.
    Recusandae inventore, accusantium, eveniet suscipit sed, delectus earum error libero fugit dolores iure repellat? Dolorum voluptate eos voluptas officia repellendus eaque similique a fugit ipsa, odit sapiente quia quae exercitationem!`;

    myDate: String = new Date().toISOString();
  minTime = "00:00";
  minutesVal = "0,30";
  hourValues = [];
  myDateCustom: any

    constructor(
        public alert:AlertController,
        public modalCtrl: ModalController,
        private platform: Platform,
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
        public zone: NgZone,
        public toastCtrl: ToastController,
        public nav: NavController,
        public service: Service,
        public values: Values,
        private socket: Socket) {
        this.items = [];
        this.product_slot = [];
        this.options = [];
        this.service.getProducts();

        this.autocomplete = { input: '' };
        this.autocompleteItems = [];

        this.autocompleteCat = { input: '' };
        this.itemsCategory = [];

        this.lat = '';
        this.long = '';

        this.categories = [];
        this.service.getCategories(1);

        this.getCategory = this.service.mainCategories;

        platform.ready().then(() => {
          const subscription = this.geolocation.watchPosition()
            .filter((p) => p.coords !== undefined) //Filter Out Errors
            .subscribe(position => {
              this.miLatitude = position.coords.latitude;
              this.miLongitude = position.coords.longitude;
              // console.log("miLocation=" + position.coords.latitude + ' ' + position.coords.longitude);
            });
        });
    }

    openModal(characterNum) {
      let modal = this.modalCtrl.create(ModalContentPage, characterNum);
      modal.present();
    }

    getDate(date){
      this.processDate = date
    }

    getTime(time){
      this.processHour = time
    }

    getTime2(time){

      this.processHour = time


      var hrsmin = time
      var hrsminSplit = hrsmin.split(":", 2)

      var hr = Number(hrsminSplit[0]) + 1





      console.log(hr)
      this.setHoursTime2(hr, hrsminSplit[1]);
    }

    ionSelected() {
      console.log("productlist Page has been selected");
      // do your stuff here
      this.nav.setRoot(TabsPage);
      this.pageTop.scrollToTop();
    }
    gohome() {
      this.nav.parent.select(0);
    }
    getCart() {
      this.nav.parent.select(2);
    }
    // ionViewDidEnter() {
    //   console.log('mierda2')
    //   //scroll to page top
    //   this.pageTop.scrollToTop();
    // }

    clickSearch(){
      this.autocompleteCat.input = ' ';
      this.getItemsCat()
      console.log("probando auto complete",this.autocompleteCat.input)
    }

    doRefresh(refresher){
        this.service.load().then((results) => {
            this.handleService(results);
            refresher.complete();
        });
    }
    handleService(results){
       //
    }
    getCategory(id, slug, name) {
        this.items.id = id;
        this.items.slug = slug;
        this.items.name = name;
        this.items.categories =  this.service.categories.filter(item => item.parent === parseInt(id));
        this.nav.push(ProductsPage, this.items);
    }
    presentToastLoginAlert() {
        let toast = this.toastCtrl.create({
          message: 'You must login to add item to wishlist',
          duration: 1000,
           position: 'bottom'
        });
        toast.present();
    }
    addToWishlist(id) {
        if (this.values.isLoggedIn) {
            this.values.wishlistId[id] = true;
            this.service.addToWishlist(id).then((results) => this.update(results, id));
        } else {
            this.presentToastLoginAlert();
        }
    }
    update(results, id) {
        if (results.success == "Success") {
            this.values.wishlistId[id] = true;
        } else {}
    }
    removeFromWishlist(id) {
        this.values.wishlistId[id] = false;
        this.service.deleteItem(id).then((results) => this.updateWish(results, id));
    }
    updateWish(results, id) {
        if (results.status == "success") {
            this.values.wishlistId[id] = false;
        }
    }

    getSearch() {
        this.nav.push(SearchPage);
    }
    mySlideOptions = {
        initialSlide: 1,
        loop: true,
        autoplay: 5800,
        pager: true
    }
    getId() {
        var i;
        if (this.options.length >= 1)
            var resa = this.options[0].split(":");
        if (this.options.length >= 2)
            var resb = this.options[1].split(":");
        if (this.options.length >= 1)
            for (i = 0; i < this.product.product.variations.length; i++) {
                if (this.product.product.variations[i].attributes[0].option == resa[1]) {
                    if (this.options.length == 1) {
                        break;
                    }
                    else if (this.product.product.variations[i].attributes[1].option == resb[1]) {
                        break;
                    }
                }
            }
    }
    goto(data){
        if(data.description == "product"){
            this.nav.push(ProductPage, data.url);
        }
        else if(data.description == "category"){
            this.items.id = data.url;
            this.items.name = data.title;
            this.items.categories =  this.service.categories.filter(item => item.parent === parseInt(this.items.id));
            this.nav.push(ProductsPage, this.items);
        }

        else if(data.description == "post"){
            this.nav.push(Post, data.url);
        }
    }
    doInfinite(infiniteScroll) {
        this.service.loadMore().then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        if (!results) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }
    getProduct(item) {
        this.nav.push(ProductPage, item);
    }
    hideLoading(){
        this.loading = false;
    }
    getSubCategories(id){
        const results = this.service.categories.filter(item => item.parent === parseInt(id));
        return results;
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


    // this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
    //   .then((result: NativeGeocoderReverseResult[]) => {
    //     this.address = "";
    //     let responseAddress = [];
    //     // for (let [key, value] of Object.entries(result[0])) {
    //     //   if(value.length>0)
    //     //   responseAddress.push(value);
    //     // }
    //     responseAddress.reverse();
    //     for (let value of responseAddress) {
    //       this.address += value+", ";
    //     }
    //     this.address = this.address.slice(0, -2);
    //   })
    //   .catch((error: any) =>{
    //     this.address = "Address Not Available!";
    //   });
  }

  getCoordsFromAddress(Adrress) {
    console.log("getCoordsFromAddress "+Adrress);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.forwardGeocode(Adrress, options)
    .then((result: NativeGeocoderForwardResult[]) => {
       console.log('The coordinates are latitude=' + result[0].latitude + ' and longitude=' + result[0].longitude)
      this.lat = result[0].latitude;
      this.long = result[0].longitude;
    })
    .catch((error: any) => console.log(error));
  }

  //FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' +this.lat+', long'+this.long )
  }

  //AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults(){
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      this.lat = '';
      this.long = '';
      this.HiddenList = false;
      this.HideBtnSearch = false;
      this.HideRadius = false;
      return;
    }

    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();



    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input, types: ['(cities)'], componentRestrictions: {country: 'es'}   },
    (predictions, status) => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          this.autocompleteItems.push(prediction);
          this.HiddenList = true;
          this.HideBtnSearch = true;
          this.HideRadius = true;
        });
      });
    });

  }

  //wE CALL THIS FROM EACH ITEM.
  SelectSearchResult(item) {
    ///WE CAN CONFIGURE MORE COMPLEX FUNCTIONS SUCH AS UPLOAD DATA TO FIRESTORE OR LINK IT TO SOMETHING
    // alert(JSON.stringify(item))
    this.placeid = item.place_id
    this.autocomplete.input = item.description;

    let description;
    description = item.description;
    this.getCoordsFromAddress(description);
    this.HiddenList = false;
    this.HideBtnSearch = false;
    this.HideRadius = false;

  }


  //lET'S BE CLEAN! THIS WILL JUST CLEAN THE LIST WHEN WE CLOSE THE SEARCH BAR.
  ClearAutocomplete(){
    this.autocompleteItems = [];
    this.autocomplete.input = '';
    this.HideBtnSearch = false;
    this.HideRadius = false;
    this.lat = '';
    this.long = '';
  }

  //sIMPLE EXAMPLE TO OPEN AN URL WITH THE PLACEID AS PARAMETER.
  GoTo(){
    return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+this.placeid;
  }

  ClearAutocompleteCat(){
    this.itemsCategory = [];
    this.items = [];
    this.autocompleteCat.input = '';
    this.HiddenSearchLocation = false;
    this.HideBtnSearch = false;
    this.HideRadius = false;
  }

  onChange(evt) {
    if(this.categories.length == 0){
      this.categories.push({id:evt.id, name:evt.name});
      this.categoriesValue = [];
    }else{
      if(this.categories.id != evt){
        this.categories.push({id:evt.id, name:evt.name});
        this.categoriesValue = [];
      }
    }
    this.categoriesValue = [];
  }

  SelectSearchResultCat(item) {
    ///WE CAN CONFIGURE MORE COMPLEX FUNCTIONS SUCH AS UPLOAD DATA TO FIRESTORE OR LINK IT TO SOMETHING
    // alert(JSON.stringify(item))

    if(this.categories.length == 0){
      // this.categories.push({id:item.id, name:item.name});
      this.categories.push({id:item.id, slug:item.slug});
      this.categoriesValue = [];
    }else{
      if(this.categories.id != item){
        this.categories.push({id:item.id, slug:item.slug});
        this.categoriesValue = [];
      }
    }
    console.log('my',this.categories);

    this.categoriesValue = [];

    this.autocompleteCat.input = item.name;
    this.selectedCategory = item.slug;

    this.items.id = item.id;
    this.items.slug = item.slug;
    this.items.name = item.name;
    this.items.categories =  this.service.categories.filter(item => item.parent === parseInt(item.id));

    console.log(this.items.categories)

    this.HiddenListCat = false;
    this.HiddenSearchLocation = false;
    this.HideBtnSearch = false;
    this.HideRadius = false;
  }

  getItemsCat() {

    // const target = ev.target as HTMLTextAreaElement;
    // let val = target.value;

    if (this.autocompleteCat.input == '') {
      this.itemsCategory = [];
      this.HiddenListCat = false;
      this.HiddenSearchLocation = false;
      this.HideBtnSearch = false;
      this.HideRadius = false;
      this.items = [];
      return;
    }
    this.itemsCategory = this.service.mainCategories;

    // if the value is an empty string don't filter the items
    // if (this.autocompleteCat.input && this.autocompleteCat.input.trim() != '') {
      console.log('entra')

      this.HiddenListCat = true;
      this.HiddenSearchLocation = true;
      this.HideBtnSearch = true;
      this.HideRadius = true;
      this.itemsCategory = this.itemsCategory.filter((itemsCategory) => {
        return (itemsCategory.name.toLowerCase().indexOf(this.autocompleteCat.input.toLowerCase()) > -1);
      })

    // }
  }
  searchProduct(){
    let min_date = this.date+'T'+this.hourInit;
    let max_date = this.date+'T'+this.hourEnd;

    this.getAddressFromCoords();
    this.items.productslocation = ''

    // if( this.miLatitude.toString() != '' && this.miLongitude.toString() != ''){
    //   let midata =  this.service.getLocationFromProduct3(min_date, max_date, null)
    //   // let midata =  this.service.getLocationFromProduct(this.lat, this.long, this.radius)
    //   .then((results) => this.handleLocationInit(results));
    // }
    // else{
    //   this.showAlert('<strong>Estimado Usuario</strong>', 'Active el GPS por favor');
    //   // this.nav.push(ProductsPage, this.items);
    //   //console.log("original=" + this.originalCoords + this.originalCoords.latitude + this.originalCoords.longitude);
    // }
    if( (this.date.toString() != '' && this.hourInit.toString() != '' && this.hourEnd.toString() != '' && this.autocompleteCat.input != '')){
      let midata =  this.service.getLocationFromProduct3(min_date, max_date, null)
      // let midata =  this.service.getLocationFromProduct(this.lat, this.long, this.radius)
      .then((results) => this.handleLocationInit(results));
    }
    else{
      this.showAlert('<strong>Estimado Usuario</strong><br/><br/>', 'Por favor Rellene todos los campos');
      // this.nav.push(ProductsPage, this.items);
      //console.log("original=" + this.originalCoords + this.originalCoords.latitude + this.originalCoords.longitude);
    }

  }
  async handleLocationInit(results) {

    let dataResult = results.includeProduct;
    let product_slot = results.product_slot;

    this.items.productslocation = dataResult;
    this.product_slot.array = product_slot;

    this.nav.push(ProductsPage, {items:this.items.productslocation, categories:this.categories, p_slot: this.product_slot.array, date:this.date, hourInit:this.hourInit, hourEnd:this.hourEnd});

    // this.nav.push(ProductsPage, {items:this.items.productslocation, categories:this.categories, date:this.date, hourInit:this.hourInit, hourEnd:this.hourEnd});
    // this.nav.push(ProductsPage, {categories:this.categories, date:this.processDate, hour:this.processHour});

  }



  deleteTipoServicio(id){
    let index = this.categories.map(result => result.id).indexOf(id);

    if(index > -1){
      this.categories.splice(index, 1);
    }
  }

  showAlert(title, text) {
    let alert = this.alert.create({
        title: title,
        subTitle: text,
        buttons: ['OK'],
    });
    alert.present();
  }

  // searchProduct(){

  //   // this.socket.fromEvent('validaactiveprovider').subscribe((data:any) => {
  //   //   this.homerProviders.push(data);
  //   //   console.log('data:',data)
  //   //   for(let provider of this.homerProviders){
  //   //     if(this.values.customerId == provider){
  //   //       this.values.isActive = true;
  //   //     }
  //   //   }
  //   // });

  //   this.items.productslocation = ''
  //     if(this.radius > 0 && this.lat != '' && this.long != ''){


  //       let midata =  this.service.getLocationFromProduct(this.lat, this.long, this.radius)
  //       .then((results:any) =>{
  //         // this.socket.connect();
  //         // console.log('products',[results]);

  //         // for(let i; i<results.length; i++){
  //         //   console.log('xoxo',results[i].id);

  //         // }

  //         // this.socket.emit('validaactiveprovider', results.id);
  //         // this.socket.fromEvent('validaactiveprovider').subscribe((data:any) => {
  //         //     console.log('data:',data)

  //         // });
  //         console.log(results);
  //         this.handleLocationInit(results);
  //       });
  //     }else{
  //      this.nav.push(ProductsPage, this.items);
  //     //  console.log(this.miLatitude);
  //     //  console.log("original=" + this.originalCoords + this.originalCoords.latitude + this.originalCoords.longitude);
  //     }
  // }
  // handleLocationInit(results) {
  //   let dataResult = results;
  //   this.items.productslocation = dataResult;
  //   this.nav.push(ProductsPage, this.items);

  // }

  setHoursTime2(hr, min) {
    this.hourEnd = ""
    //var hrs = hr + 2;
    //console.log("min: ",min)
    var currentHours2 = ("0" + hr).slice(-2);
    var horaCiclo = 0;
    this.hourValues = [];
    if (min == 30) {
      this.minutesVal = "30";
    } else {
      this.minutesVal = "0";
    }
    for (let i = hr; i <= 23; i = i + 1) {
      this.hourValues.push(i);
      //console.log("time 2: " + i);
    }
    //console.log(this.hourValues);
    var hrsMin = currentHours2 + ":" + min;
    this.minTime = hrsMin.toString();
    //console.log("hrsMin: ", hrsMin);
  }

}

@Component({
  template: `
<ion-content>
  <ion-buttons start>
      <button ion-button (click)="dismiss()">
        <ion-icon name="close"></ion-icon>
      </button>
    </ion-buttons>
    <ion-card style="margin-top:20px">
      <img src="{{imgModal}}"/>
      <ion-card-content>
        <ion-card-title>
          {{title}}
        </ion-card-title>
        <p>
          {{detail}}
        </p>
      </ion-card-content>
    </ion-card>
</ion-content>
`
})
export class ModalContentPage {
  title;
  detail;
  imgModal;
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public values: Values
  ) {
    this.title = this.params.get('title');
    this.detail = this.params.get('detail');
    this.imgModal = this.values.homeClean;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
