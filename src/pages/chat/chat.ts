import { Component, ViewChild } from '@angular/core';
import {
  ToastController,
  AlertController,
  Content,
  NavParams
} from 'ionic-angular';

import {Values} from '../../providers/service/values';
import {Service} from '../../providers/service/service';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild(Content) content: Content;
  messages = [];
  nickname = '';
  roomName='';

  messageForm: any;
  chatBox: any;

  constructor(
    private socket: Socket,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public values:Values,
    public navParams:NavParams,
    public service:Service
  ) {
    this.messageForm = formBuilder.group({
      message: new FormControl('')
    });
      this.chatBox = '';
      this.nickname = this.values.customerName;
      this.roomName = this.navParams.get('order');
      console.log("name"+this.nickname, "roomName"+this.roomName);
  }

  ionViewWillEnter(){
      this.socket.connect();
      this.socket.emit('set-nickname', {"userName":this.nickname, "roomName":this.roomName});

      this.getMessages().subscribe(message => {
        console.log("mensaje", message);
        console.log("mensajes", this.messages)

        this.messages.push(message);
        this.scrollToBottom();
      });

      this.getUsers().subscribe(data => {
        let user = data['user'];
        // if (data['event'] === 'left') {
        //   this.showToast('User left: ' + user);
        // } else {
        //   this.showToast('User joined: ' + user);
        // }
      });
  }

  ionViewDidEnter(){
    this.service.getMessage({roomName:this.roomName}).then((chat:any) => {
      for(let message of chat.data){
        this.messages.push(message);
      }
    });
    this.scrollToBottom();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }
  public sendMessage(message: string): void {
    if (!message || message === '') return;

    this.socket.emit('add-message', { "text": message, "roomName":this.roomName });
    this.chatBox = '';
  }

  getMessages(): Observable<{}> {
    let observable = new Observable(observer => {
      this.socket.on('message', data => {
        observer.next(data);
      });
    });
    return observable;
  }

  getUsers(): Observable<{}> {
    let observable = new Observable(observer => {
      this.socket.on('users-changed', data => {
        console.log('users',data);

        observer.next(data);
      });
    });
    return observable;
  }

  ionViewWillLeave(): void {
    this.socket.disconnect();
  }

  showToast(msg: string): void {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  presentPrompt(): Promise<string> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'Nickname',
        inputs: [
          {
            name: 'nickname',
            placeholder: 'doretta'
          }
        ],
        buttons: [
          {
            text: 'Random',
            role: 'cancel',
            handler: data => {
              resolve('random_' + Math.round(Math.random() * 100));
            }
          },
          {
            text: 'Go on',
            handler: data => {
              resolve(data.nickname);
            }
          }
        ]
      });
      alert.present();
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 100);
  }

}
