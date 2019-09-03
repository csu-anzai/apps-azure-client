import { Component, OnInit } from '@angular/core';
import { SubscriptionClient } from "@azure/arm-subscriptions";
import {  TokenCredentials } from '@azure/ms-rest-js';
import { HttpClient,HttpParams } from '@angular/common/http';
import {  SubscriptionsListResponse, Subscription } from '@azure/arm-subscriptions/esm/models';
import { TokenResult } from './token-result';
import { CustomEncoder } from './custom-encoder';
import { link } from '@chase/apps-client-sdk'
import { CreateLinkRequest } from '@chase/apps-client-sdk/create-link-request';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements  OnInit {

  clientId:string;
  tenantId : string;

  clientSecret:string;

  credsValid:boolean;
  linkExists:boolean;


  subscriptions : Subscription[];

  selectedSubscription : string;

  subscriptionName : string;

  constructor(private http : HttpClient)
  {

  }

  async credChanged(){

    this.credsValid=undefined;
    this.subscriptions = undefined;

    if ( !this.clientId || !this.clientSecret || !this.tenantId)
        return;

  let params = new HttpParams({ encoder : new CustomEncoder() })
                  .set('client_id',this.clientId)
                  .set('client_secret', this.clientSecret)
                  .set('scope','https://management.azure.com/.default')
                  .set('grant_type','client_credentials');

    let tokenResult : TokenResult;

    try
    {
      tokenResult = await this.http.post<TokenResult>(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,params)
                  .toPromise();

    }
    catch(e)
    {
      console.log(e);
    }

     if( !tokenResult  || !tokenResult.access_token )
     {
          this.credsValid = false;
          return;
     }


    const credentials =new TokenCredentials(tokenResult.access_token)

    let response : SubscriptionsListResponse;
    let nextLink : string = null;
    const client = new SubscriptionClient(credentials);

    let subs : Subscription[] = [];
    do
    {
      if(!nextLink)
        response  = await client.subscriptions.list();
      else
        response = await client.subscriptions.listNext(nextLink);

      nextLink = response.nextLink;
      subs = subs.concat(response);

    } while(nextLink != undefined);


    this.subscriptions = subs;

    if(subs.length == 1)
    {
        this.selectedSubscription = subs[0].subscriptionId;
    }

    this.credsValid = true;

  }

  async save() {

    const selected  = this.subscriptions.filter(s => s.subscriptionId == this.selectedSubscription)[0];

    let secrets = {
        clientId: this.clientId,
        clientSecret : this.clientSecret ,
        tenantId : this.tenantId,
        subscriptionId : selected.subscriptionId
    };

    let settings = {
          clientId: this.clientId,
          subscriptionName : selected.displayName,
          subscriptionId : selected.id
    };

    this.subscriptionName = selected.displayName;

    let name = "Client " + this.clientId + " with Subscription " + this.subscriptionName;
    let key = "app-"+this.clientId+"##"+selected.id;

    let request : CreateLinkRequest = {
      key : key,
      name : name,
      secrets :secrets,
      settings : settings,
    }

    await link.create(request);

    this.linkExists=true;
    this.clientSecret=null;

  }


  async ngOnInit()
  {
    let link = await chase.link.get();

    if ( link )
    {
      this.linkExists= true;
      this.clientId =link.settings.clientId;
      this.subscriptionName = link.settings.subscriptionName;
    }
    else
      {
        this.linkExists = false;
      }
  }
}
