import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Searchbar } from 'ionic-angular';
import { SearchService } from '../../providers/service/search-service';
import { Values } from '../../providers/service/values';
import { CartPage } from '../cart/cart';
import { ProductPage } from '../product/product';
import { CategoryService } from '../../providers/service/category-service';

@Component({
    templateUrl: 'search.html'
})

export class SearchPage {
    @ViewChild(Searchbar) searchbar: Searchbar;

    search: any;
    slug: any;
    id: any;
    categories: any;
    searchKey: any;
    count: any;
    offset: any;
    has_more_items: boolean = true;
    options: any;
    status: any;
    products: any;
    moreProducts: any;
    quantity: any;
    page: number = 1;
    filter: any;
    myInput: any;
    shouldShowCancel: boolean = true;
    subCategories: any;
    showSearch: boolean = true;
    showFilters: boolean = false
    constructor(public nav: NavController,
        public categoryService: CategoryService,
        public service: SearchService, public values: Values, params: NavParams) {
        this.filter = {};
        this.filter.page = 1
        this.count = 10;
        this.offset = 0;
        this.values.filter = {};
        this.options = [];
        this.quantity = "1";
        this.myInput = "";
    }
    ionViewDidEnter() {
        setTimeout(() => {
            this.searchbar.setFocus();
        }, 0);
    }
    ionViewWillLeave() {
        // this.showSearch = false;
    }
    getCart() {
        this.nav.push(CartPage);
    }
    onInput($event) {
        this.filter['filter[q]'] = $event.srcElement.value;
        this.values.filter = {};
        this.service.getSearch(this.filter)
            .then((results) => this.products = results);
    }
    onCancel($event) {
        console.log('cancelled');
    }
    getProduct(item) {
        this.nav.push(ProductPage, item);
    }
    doInfinite(infiniteScroll) {
        this.filter.page += 1
        // this.page += 1;
        this.service.getSearch(this.filter)
            .then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        // if (results.products == undefined) {
        //     console.log('No hay mas productos que mostrar...', results.products)
        //     this.has_more_items = false
        //     infiniteScroll.complete()
        //     return
        // }
        console.log(results)
        if (results != undefined) {
            for (var i = 0; i < results.length; i++) {
                this.products.push(results[i]);
            };
        }
        if (results.length == 0) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }
    deleteFromCart(id) {
        this.service.deleteFromCart(id)
            .then((results) => this.status = results);
    }
    addToCart(id) {
        var text = '{';
        var i;
        for (i = 0; i < this.options.length; i++) {
            var res = this.options[i].split(":");
            text += '"' + res[0] + '":"' + res[1] + '",';
        }
        text += '"product_id":"' + id + '",';
        text += '"quantity":"' + this.quantity + '"}';
        var obj = JSON.parse(text);
        this.service.addToCart(obj)
            .then((results) => this.updateCart(results));
    }
    updateCart(a) {
    }
    setListView() {
        this.values.listview = true;
    }
    setGridView() {
        this.values.listview = false;
    }
    updateToCart(id) {
        this.service.updateToCart(id)
            .then((results) => this.status = results);
    }

    //Filter shit

    getFilter() {
        this.showFilters = true
        this.has_more_items = false
    }
    cancel() {
        this.showFilters = false
        this.has_more_items = true
    }
    chnageFilter(sort) {
        this.showFilters = false
        this.has_more_items = true
        this.filter.page = 1
        // if (sort == 0) {
        //   this.filter['filter[order]'] = 'ASC'
        //   this.filter['filter[orderby]'] = 'date'
        // }
        // if (sort == 1) {
        //   this.filter['filter[order]'] = 'ASC'
        //   this.filter['filter[orderby]'] = 'name'
        // } else if (sort == 2) {
        //   this.filter['filter[order]'] = 'DESC'
        //   this.filter['filter[orderby]'] = 'name'
        // } else if (sort == 3) {
        //   this.filter['filter[order]'] = 'ASC'
        //   this.filter['filter[orderby]'] = 'meta_value_num'
        //   this.filter['filter[orderby_meta_key]'] = '_price'
        // } else if (sort == 4) {
        //   this.filter['filter[order]'] = 'DESC'
        //   this.filter['filter[orderby]'] = 'meta_value_num'
        //   this.filter['filter[orderby_meta_key]'] = '_price'
        // }
        // FILTROS SHIT EN FUNCION
        if (sort == 5) {
            this.filter['orderby'] = 'menu_order'
        }
        else if (sort == 6) {
            this.filter['orderby'] = 'popularity'
        }
        else if (sort == 7) {
            this.filter['orderby'] = 'rating'
        }
        else if (sort == 8) {
            this.filter['orderby'] = 'date'
            this.filter['order'] = 'asc'
        }
        else if (sort == 9) {
            this.filter['orderby'] = 'date'
            this.filter['order'] = 'desc'
        }
        else if (sort == 10) {
            this.filter['orderby'] = 'price'
            this.filter['order'] = 'asc'
        }
        else if (sort == 11) {
            this.filter['orderby'] = 'price'
            this.filter['order'] = 'desc'
        }
        else if (sort == 12) {
            this.filter['orderby'] = 'title'
            this.filter['order'] = 'asc'
        }
        else if (sort == 13) {
            this.filter['orderby'] = 'title'
            this.filter['order'] = 'desc'
        }


        /*this.filter['filter[meta_query][key]'] = "_price";
            this.filter['filter[meta_query][value]'] = '[0,10]';
            this.filter['filter[meta_query][compare]'] = "BETWEEN";*/
        this.categoryService.load(this.filter).then(results => (this.products = results))
    }

}