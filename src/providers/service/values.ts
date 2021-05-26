import { Injectable } from '@angular/core';

@Injectable()
export class Values {
  homerOneSignal:Array<any> = []
  pushToken:any
  userId:any
  count: number = 0;
  filter: any = 10;
  isLoggedIn: boolean = false;
  vendor: boolean = false;
  customerName: string = "";
  customerId: number = null;
  listview: boolean = false;
  cart: Array<number> = [];
  filterUpdate: boolean = false;
  lan: any;
  logoutUrl: any;
  cartItem: any;
  cartNonce: any;
  avatar: any = "assets/image/logo.png";
  card:any = "assets/image/card.png";
  slider: any = "assets/image/bghome.png";
  houseTop: any = "assets/image/house-top2.jpg";
  headerLogin: any = "assets/image/header-login.png";
  camarero:any = "assets/image/camarero.png";
  cuido:any = "assets/image/cuido.png";
  limpieza:any = "assets/image/limpieza.png";
  planchado:any = "assets/image/planchado.png";
  homeClean: any = "assets/image/homeClean.jpg";
  currency: any = "USD";
  data: any;
  dir: any = 'left';
  deviceId: any;
  platform: any;
  wishlistId: any = [];
  blockslistId: any = [];
  dimensions: any = {imageGridViewHeight: 100, imageProductViewHeight: 100, scrollProductHeight: 100, productSliderWidth : 42};
  settings: any = {"show_featured":"1","show_onsale":"1","show_latest":"1","pull_to_refresh":"1","onesignal_app_id":"8ad1c280-92da-4d39-b49c-cf0a81e0d1fc","google_project_id":"575406525034","google_web_client_id":"575406529046-r69ss57ceip6vv9mm858qh2hg3j0sl7u.apps.googleusercontent.com","rate_app_ios_id":"","rate_app_android_id":"https://play.google.com/store/apps/details?id=numu.digital.homer","rate_app_windows_id":"","share_app_android_link":"https://play.google.com/store/apps/details?id=numu.digital.homer","share_app_ios_link":"https://play.google.com/store/apps/details?id=numu.digital.homer","support_email":"support@example.com","image_height":"100","product_slider_width":"42","enable_product_chat":"","enable_home_chat":"","whatsapp_number":"+91XXXXXXXX","app_dir":"left","language":"spanish"};
  constructor() {
  	this.filter = {};
    this.logoutUrl = "";
  }
  updateCart(crt) {
    console.log(crt);
     this.cartItem = crt.cart_contents;
     this.cart = [];
     this.count = 0;
     for (let item in crt.cart_contents) {
         this.cart[crt.cart_contents[item].product_id] = parseInt(crt.cart_contents[item].quantity);
         this.count += parseInt(crt.cart_contents[item].quantity);
     }
 }
 updateCartTwo(crt) {
  console.log(crt);
     this.cart = [];
     this.count = 0;
     this.cartItem = crt;
     for (let item in crt) {
         this.cart[crt[item].product_id] = parseInt(crt[item].quantity);
         this.count += parseInt(crt[item].quantity);
     }
 }
 calc(width){
      var devide = this.getDevide(width);
      this.dimensions.imageGridViewHeight = this.settings.image_height/100 * (width/devide);
      if(width >= 769){
        this.dimensions.productSliderWidth = this.settings.product_slider_width * 0.7;
        this.dimensions.productSliderHeight = this.settings.imageGridViewHeight * 0.6;
        this.dimensions.imageProductViewHeight = (this.settings.image_height/100 * 0.6) * width;
      }
      else {
        this.dimensions.imageProductViewHeight = this.settings.image_height/100 * width;
        this.dimensions.productSliderWidth = this.settings.product_slider_width;
      }
      this.dimensions.productSliderHeight = this.settings.imageGridViewHeight * 0.6;
      this.dimensions.scrollProductHeight = this.settings.image_height/100 * (width * this.dimensions.productSliderWidth/100);
      this.dimensions.imageListViewHeight = (this.settings.image_height/100 * 11);
   }
   getDevide(width){

      if (width >= 1025) {
        return 5;
      }

      if (width >= 769) {
        return 4;
      }

      if (width >= 481) {
        return 3;
      }

      else {
        return 2;
      }
   }
 }
