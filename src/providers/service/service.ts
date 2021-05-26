import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { LoadingController } from 'ionic-angular'
import { Config } from './config'
import { Values } from './values'
import { URLSearchParams } from '@angular/http'
import { NativeStorage } from '@ionic-native/native-storage'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/forkJoin'
import { HTTP } from '@ionic-native/http'
import { Functions } from '../../providers/service/functions'
import { ProductsPage } from '../../pages/products/products'
import { dateDataSortValue } from 'ionic-angular/umd/util/datetime-util'


@Injectable()
export class Service {
  product_slot:any = [];
  header:any = new Headers();
  data: any
  categories: any
  banners: any
  orders: any
  order: any
  isloggedIn: any
  status: any
  address: any
  products: any
  product: any
  cart: any
  configuration: any
  loader: any
  loginStatus: any
  mainCategories: any
  country: any
  user: any
  login_nonce: any
  dir: any = 'left'
  filter: any = {}
  has_more_items: boolean = true
  blocks: any = []
  customer: any
  dataSearchProduct: any = []
  includeProduct: any
  constructor(
    private reqhttp: HTTP,
    private http: Http,
    private config: Config,
    private values: Values,
    public loadingCtrl: LoadingController,
    private nativeStorage: NativeStorage,
    public functions: Functions,
  ) {
    this.mainCategories = []
    this.filter.page = 1
  }
  load() {
    return new Promise(resolve => {
      this.http
        .get(this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-keys')
        .map(res => res.json())
        .subscribe(data => {
          this.values.data = data
          this.values.settings = data.settings
          this.blocks = data.blocks
          for (let item in this.blocks) {
            var filter
            if (this.blocks[item].block_type == 'product_block') {
              if (this.blocks[item].filter_by == 'tag')
                filter = { tag: this.blocks[item].link_id, status: 'publish' }
              else
                filter = {
                  category: this.blocks[item].link_id,
                  status: 'publish',
                }
              this.http
                .get(
                  this.config.setUrl(
                    'GET',
                    '/wp-json/wc/v2/products/?',
                    filter,
                  ),
                )
                .map(res => res.json())
                .subscribe(data => {
                  this.blocks[item].products = data
                })
            }
            if (this.blocks[item].block_type == 'flash_sale_block') {
              if (this.blocks[item].filter_by == 'tag')
                filter = { tag: this.blocks[item].link_id, status: 'publish' }
              else
                filter = {
                  category: this.blocks[item].link_id,
                  status: 'publish',
                }
              this.http
                .get(
                  this.config.setUrl(
                    'GET',
                    '/wp-json/wc/v2/products/?',
                    filter,
                  ),
                )
                .map(res => res.json())
                .subscribe(data => {
                  this.blocks[item].products = data
                })
              this.blocks[item].interval = setInterval(() => {
                var countDownDate = new Date(
                  this.blocks[item].sale_ends,
                ).getTime()
                var now = new Date().getTime()
                var distance = countDownDate - now
                this.blocks[item].days = Math.floor(
                  distance / (1000 * 60 * 60 * 24),
                )
                this.blocks[item].hours = Math.floor(
                  (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                )
                this.blocks[item].minutes = Math.floor(
                  (distance % (1000 * 60 * 60)) / (1000 * 60),
                )
                this.blocks[item].seconds = Math.floor(
                  (distance % (1000 * 60)) / 1000,
                )
                if (distance < 0) {
                  clearInterval(this.blocks[item].interval)
                  this.blocks[item].hide = true
                }
              }, 1000)
            }
          }
          this.values.currency = data.currency
          this.login_nonce = data.login_nonce
          if (data.user && data.user.data != undefined) {
            this.values.isLoggedIn = data.user.data.status
            this.values.customerId = data.user.data.ID
            this.values.customerName = data.user.data.display_name
            //this.values.avatar = data.user.data.avatar_url;
            this.values.logoutUrl = this.encodeUrl(data.user.data.url)
            this.nativeStorage.getItem('loginData').then(
              data => {
                if (data.type == 'social') {
                  this.values.customerName = data.displayName
                  //this.values.avatar = data.avatar;
                }
              },
              error => console.error(error),
            )
          } else {
            this.nativeStorage.getItem('loginData').then(
              data => {
                if (data.type == 'woo') {
                  this.login(data)
                } else if (data.type == 'social') {
                  this.values.customerName = data.displayName
                }
              },
              error => console.error(error),
            )
          }
          this.nativeStorage.setItem('blocks', data).then(
            data => console.log('Saved'),
            error => console.error(error),
          )
          this.getCategories(1)
          this.nativeStorage.getItem('loginData').then(
            data => this.login(data),
            error => console.error(error),
          )
          this.http
            .get(
              this.config.url +
              '/wp-admin/admin-ajax.php?action=mstoreapp-cart',
            )
            .map(res => res.json())
            .subscribe(data => {
              this.cart = data
              this.values.cartNonce = data.cart_nonce
              this.values.updateCart(this.cart)
            })
          resolve(true)
        })
    })
  }
  getCategories(page) {
    this.http
      .get(
        this.config.setUrl('GET', '/wp-json/wc/v2/products/categories?', {
          per_page: 100,
          page: page,
        }),
      )
      .map(res => res.json())
      .subscribe(data => {
        if (page == 1) this.categories = data
        else {
          this.categories.push.apply(this.categories, data)
        }
        if (data.length == 100) this.getCategories(page + 1)
        else {
          this.categories = this.categories.filter(
            item => item.name !== 'Uncategorized',
          )
          this.mainCategories = this.categories.filter(
            item => item.parent === 0,
          )
          this.nativeStorage.setItem('categories', this.categories).then(
            data => console.log('Saved'),
            error => console.error(error),
          )
        }
      })
  }
  getNonce() {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-nonce',
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          resolve(data)
        })
    })
  }
  getNonceResendKey(username) {
    var params = new URLSearchParams()
    params.append('username', username)
    return new Promise(resolve => {
      this.http
        .get(
          this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-nonce&' + params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          resolve(data)
        })
    })
  }

  login(loginData) {
    var params = new URLSearchParams()
    params.append('username', loginData.username)
    params.append('password', encodeURIComponent(loginData.password))
    params.append('_wpnonce', this.login_nonce)
    params.append('login', 'Login')
    params.append(
      'redirect',
      this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-userdata',
    )
    return new Promise(resolve => {
      this.http
        .post(
          this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-login',
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(
          data => {
            console.log('data login 1 : ',data)
            if (!data.errors) {
              console.log('data login : ',data)
              this.values.isLoggedIn = data.data.status
              this.values.customerName = data.data.display_name
              this.values.customerId = data.data.ID
              this.values.logoutUrl = this.encodeUrl(data.data.url)
              console.log(this.values.logoutUrl)
              //this.values.vendor = data.allcaps.vendor
              params = new URLSearchParams()
              params.append('customer_id', this.values.customerId.toString())
              this.http
                .post(
                  this.config.url +
                  '/wp-admin/admin-ajax.php?action=mstoreapp-get_wishlist',
                  params,
                  this.config.options,
                )
                .map(res => res.json())
                .subscribe(data => {
                  for (let item in data) {
                    this.values.wishlistId[data[item].id] = data[item].id
                  }
                })
              params = new URLSearchParams()
              params.append('customer_id', this.values.customerId.toString())
              this.http
                .post(
                  this.config.url +
                  '/wp-admin/admin-ajax.php?action=mstoreapp-get_wishlist',
                  params,
                  this.config.options,
                )
                .map(res => res.json())
                .subscribe(data => {
                  console.log(data)
                })
              this.nativeStorage
                .setItem('loginData', {
                  username: loginData.username,
                  password: loginData.password,
                })
                .then(
                  data => console.log('Login Details Stored'),
                  error => console.error(error),
                )
            }
            resolve(data)
          },
          err => {
            resolve(JSON.parse(err._body))
          },
        )
    })
  }
  encodeUrl(href) {
    return href.replace(/&amp;/g, '&')
  }
  logout() {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.url + '/wp-admin/admin-ajax.php?action=mstoreapp-logout',
          // this.values.logoutUrl + '&redirect_to=http://localhost:8100',
          this.config.options,
        )
        .subscribe(data => {
          console.log('data sesion:' + data)
          this.values.isLoggedIn = false
          this.values.customerName = ''
          this.nativeStorage.setItem('loginData', {}).then(
            data => console.log('Login Data cleared'),
            error => console.error(error),
          )
          this.http
            .get(
              this.config.url +
              '/wp-admin/admin-ajax.php?action=mstoreapp-cart',
              this.config.options,
            )
            .map(res => res.json())
            .subscribe(data => {
              this.cart = data
              this.values.updateCart(this.cart)
            })
          resolve(this.cart)
        })
    })
  }
  passwordreset(email, nonce, url) {
    var params = new URLSearchParams()
    params.append('user_login', email)
    params.append('wc_reset_password', 'true')
    params.append('_wpnonce', nonce)
    params.append('_wp_http_referer', '/my-account/lost-password/')
    return new Promise(resolve => {
      this.http
        .post(this.config.url + '/my-account/lost-password/', params)
        .subscribe(status => {
          resolve(status)
        })
    })
  }
  getMessage(data){
    return new Promise(resolve => {
      this.header.append('Content-Type', 'application/json');
      this.http
      .post(
        this.config.urlApi + '/message/getmessages',
        {
          'roomName': data.roomName
        },
        this.header
      )
      .map(res => res.json())
      .subscribe(
        data => {
          resolve(data);
        });
    })
  }
  passwordResetNonce() {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-passwordreset',
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          resolve(data)
        })
    })
  }
  resendKey(usernameKey, nonceKey) {
    console.log(nonceKey);
    return new Promise(resolve => {
      this.http
        .get(
          this.config.url +
          '/my-account/?action=resend_key&user_login=' + usernameKey + '&nonce=' + nonceKey + '',
        )
        .map(res => res)
        .subscribe(data => {
          resolve(data)
          if (data.statusText == "OK")
            this.functions.showAlert("SUCCESS", "Check email for new verification link. ");
          else
            this.functions.showAlert("ERROR", "an error has occurred please check. ");
        })
    })
  }
  getAddress() {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl(
            'GET',
            '/wc-api/v3/customers/' + this.values.customerId + '?',
            false,
          ),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.address = data
          resolve(this.address)
        })
    })
  }
  getCustomer() {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl(
            'GET',
            '/wc-api/v3/customers/' + this.values.customerId + '?',
            false,
          ),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.customer = data
          resolve(this.customer)
        })
    })
  }
  checkAvatar() {
    let result = ''
    if (this.values.customerId != null) {
      if (
        this.customer.customer.avatar_url.indexOf(
          '8ab2424adb5aafd0f6fc73775cd77668',
        ) != -1
      ) {
        result = 'avatar'
      } else if (
        this.customer.customer.avatar_url.indexOf(
          '8ab2424adb5aafd0f6fc73775cd77668',
        ) == -1
      ) {
        result = 'image'
      }
    } else result = 'false'
    return result
  }
  saveAddress(address) {
    var params = {
      customer: address,
    }
    this.reqhttp.setHeader(
      this.config.url,
      'Content-Type',
      'application/json; charset=UTF-8',
    )
    this.reqhttp.setDataSerializer('json')
    this.reqhttp.clearCookies()
    return new Promise(resolve => {
      this.reqhttp
        .put(
          this.config.setUrl(
            'PUT',
            '/wc-api/v3/customers/' + this.values.customerId + '?',
            false,
          ),
          params,
          {},
        )
        .then(data => {
          resolve(JSON.parse(data.data))
        })
    })
  }
  pushNotification(notification) {
    var params = new URLSearchParams()
    params.append('device_id', notification.device_id)
    params.append('platform', notification.platform)
    params.append('email', notification.email)
    params.append('city', notification.city)
    params.append('state', notification.state)
    params.append('country', notification.country)
    params.append('pincode', notification.pincode)
    return new Promise(resolve => {
      this.http
        .post(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-user-subcribe-notify',
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.status = data
          resolve(this.status)
        })
    })
  }
  pushNotify(deviceId, platform) {
    var params = new URLSearchParams()
    params.append('device_id', deviceId)
    params.append('platform', platform)
    return new Promise(resolve => {
      this.http
        .post(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-user-subcribe-notify',
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.status = data
          resolve(this.status)
        })
    })
  }
  getOrder(id) {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl('GET', '/wc-api/v3/orders/' + id + '?', false),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.order = data
          resolve(this.order)
        })
    })
  }
  getBooking(idOrder, idVendor) {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl('GET', '/wp-json/custom-api/v1/get_vendor_order?id_vendor=' + idVendor + '&id=' + idOrder + '&', false),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.order = data
          resolve(this.order)
        })
    })
  }
  getCountry() {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-get_country',
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.country = data
          resolve(this.country)
        })
    })
  }
  registerCustomer(customer) {
    var params = {
      customer: customer,
    }
    return new Promise(resolve => {
      this.http
        .post(
          this.config.setUrl('POST', '/wc-api/v3/customers?', false),
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(
          data => {
            this.user = data
            resolve(this.user)
          },
          err => {
            resolve(err.json())
          },
        )
    })
  }
  getOrders(filter) {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl('GET', '/wc-api/v3/orders?', filter),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.orders = data
          resolve(this.orders)
        })
    })
  }
  getOrdersVendor(filter) {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl('GET', '/wp-json/custom-api/v1/get_vendor_orders?', filter),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.orders = data
          resolve(this.orders)
        })
    })
  }
  getBookingsVendor(filter) {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl('GET', '/wp-json/custom-api/v1/get_vendor_orders?', filter),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.orders = data
          resolve(this.orders)
        })
    })
  }
  updateOrder(data, id) {
    this.reqhttp.setHeader(
      this.config.url,
      'Content-Type',
      'application/json; charset=UTF-8',
    )
    this.reqhttp.setDataSerializer('json')
    this.reqhttp.clearCookies()
    return new Promise(resolve => {
      this.reqhttp
        .put(
          this.config.setUrl('PUT', '/wc-api/v3/orders/' + id + '?', false),
          data,
          {},
        )
        .then(
          data => {
            this.status = JSON.parse(data.data)
            resolve(this.status)
          },
          err => {
            console.log(JSON.parse(err.error))
            resolve(JSON.parse(err.error))
          },
        )
    })
  }
  presentLoading(text) {
    this.loader = this.loadingCtrl.create({
      content: text,
    })
    this.loader.present()
  }
  dismissLoading() {
    this.loader.dismiss()
  }
  getPage(id: any) {
    var params = new URLSearchParams()
    params.append('page_id', id)
    return new Promise(resolve => {
      this.http
        .post(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-page_content',
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          resolve(data)
        })
    })
  }
  getProducts() {
    this.http
      .get(
        this.config.setUrl('GET', '/wp-json/wc-bookings/v1/products?', false),
        this.config.options,
      )
      .map(res => res.json())
      .subscribe(data => {
        this.products = data

        for (let index = 0; index < this.products.length; index++) {
          const element = this.products[index]
          let resources = element.resource_block_costs
          let prices = new Array()
          for (var key in resources) {
            prices = [...prices, resources[key]]
          }
          if (Object.keys(resources).length) {
            let minPrice = Math.min(...prices)
            this.products.map(function (element) {
              return (element.minPrice = minPrice)
            })
          }
        }
      })
  }
  loadMore() {
    this.filter.page += 1
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl(
            'GET',
            '/wp-json/wc-bookings/v1/products?',
            this.filter,
          ),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.handleMore(data)
          resolve(true)
        })
    })
  }
  loadMoreProvider(filter) {
    return new Promise(resolve => {
      this.http
        .get(
          this.config.setUrl(
            'GET',
            '/wp-json/wc-bookings/v1/products?',
            filter,
          ),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.handleMore(data)
          resolve(true)
        })
    })
  }
  handleMore(results) {
    console.log(results.length)
    // if (results.products == undefined) {
    //   console.log('No hay mas productos que mostrar...', results.products)
    //   this.has_more_items = false
    //   return
    // }
    if (results != undefined) {
      for (var i = 0; i < results.length; i++) {
        this.products.push(results[i])
      }
    }
    if (results.length == 0) {
      this.has_more_items = false
    }
  }
  addToWishlist(id) {
    return new Promise(resolve => {
      var params = new URLSearchParams()
      params.append('product_id', id)
      params.append('customer_id', this.values.customerId.toString())
      this.http
        .post(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-add_wishlist',
          params,
          this.config.options,
        )
        .subscribe(data => {
          this.status = data
          resolve(this.status)
        })
    })
  }
  deleteItem(id) {
    var params = new URLSearchParams()
    params.append('product_id', id)
    params.append('customer_id', this.values.customerId.toString())
    return new Promise(resolve => {
      this.http
        .post(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-remove_wishlist',
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          resolve(data)
        })
    })
  }
  subscribeNotification(data) {
    var params = new URLSearchParams()
    params.append('onesignal_user_id', data.userId)
    params.append('onesignal_push_token', data.pushToken)
    return new Promise(resolve => {
      this.http
        .post(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-update_user_notification',
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          resolve(data)
        })
    })
  }
  getLocationFromProduct3(min_date, max_date, filter) {
      let urlPath = 'https://websockethomer.herokuapp.com/api/v1'

      return new Promise(resolve => {
        this.header.append('Content-Type', 'application/json');
        this.http
        .get(
          this.config.setUrl(
            'GET',
          `/wp-json/wc-bookings/v1/products/slots?min_date=${min_date}&max_date=${max_date}&`,
          null
          ),
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {

            this.status = data;

            this.dataSearchProduct = this.status;
            this.includeProduct = '';

            if (this.dataSearchProduct === undefined || this.dataSearchProduct.length == 0) {
              this.includeProduct = '0';
            }else{

              for (var key in this.dataSearchProduct.records) {
                let product = this.dataSearchProduct.records[key]

                if(product.available != 1){
                  break;
                }else{
                  this.product_slot.push({
                    date: product.date,
                    product_id: product.product_id
                  })
                  this.includeProduct += product.product_id + ',';
                }
                // this.includeProduct.split(",")
                // if(!this.includeProduct.includes(product.product_id)){
                // }
              }
              resolve({includeProduct:this.includeProduct, product_slot:this.product_slot})
            }

          })
      })
    }

  // getLocationFromProduct2(lat, long, radius) {
  //   let urlPath = 'https://websockethomer.herokuapp.com/api/v1'

  //   return new Promise(resolve => {
  //     this.header.append('Content-Type', 'application/json');
  //     this.http
  //       .post(
  //         urlPath +
  //         '/search',
  //        {
  //         "lat":lat,
  //         "lng":long,
  //         "distance":radius
  //        },
  //        this.header
  //       )
  //       .map(res => res.json())
  //       .subscribe(data => {

  //         this.status = data;

  //         this.dataSearchProduct = this.status.data;
  //         this.includeProduct = '';

  //         if (this.dataSearchProduct === undefined || this.dataSearchProduct.length == 0) {
  //           this.includeProduct = '0';
  //         }else{
  //           for (let i = 0; i < this.dataSearchProduct.length; i++) {
  //             let product = this.dataSearchProduct[i]
  //             this.values.homerOneSignal.push({product:product.ui,providerOneSignal:this.dataSearchProduct[i].onesignal})
  //             this.includeProduct += product.ui + ',';
  //           }
  //            this.includeProduct = this.includeProduct.slice(0, -1);
  //         }

  //         resolve(this.includeProduct)

  //       })
  //   })
  // }

  getHomerOneSignal(product) {
    let urlPath = 'https://websockethomer.herokuapp.com/api/v1'

    return new Promise(resolve => {
      this.header.append('Content-Type', 'application/json');
      this.http
        .post(
          urlPath +
          '/provider/getonesignal',
          {
            "product":product
          },
          this.header
        )
        .map(res => res.json())
        .subscribe(data => {
             resolve(data)
        })
    })
  }

  getLocationFromProduct(lat, long, radius) {
    var params = new URLSearchParams();
    params.append('latitude', lat);
    params.append('longitude', long);
    params.append('use_radius', 'on');
    params.append('radius', radius);

    return new Promise(resolve => {
      this.http
        .post(
          this.config.url +
          '/wp-admin/admin-ajax.php?action=mstoreapp-geolocation_process',
          params,
          this.config.options,
        )
        .map(res => res.json())
        .subscribe(data => {
          this.status = data

          console.log('data:', this.status.data);

          this.dataSearchProduct = this.status.data;
          this.includeProduct = '';

          if (this.dataSearchProduct === undefined || this.dataSearchProduct.length == 0) {
            this.includeProduct = '0';
          }else{
            for (var key in this.dataSearchProduct) {
              let prices = this.dataSearchProduct[key]
              this.includeProduct += prices.ID + ',';
            }
            this.includeProduct = this.includeProduct.slice(0, -1);
          }

          resolve(this.includeProduct)
        })
    })
  }

}
