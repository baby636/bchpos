import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import {Helmet} from 'react-helmet';
import {Button} from 'react-bootstrap';
import axios from 'axios';

import Display from "../../components/Display";
import ButtonPanel from "../../components/ButtonPanel";
import calculate from "../../components/logic/calculate";
import './style.scss';
import QRCode from 'qrcode-react';
import NumPad from 'react-numpad';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:3000');
let BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;
let BITBOX = new BITBOXCli();

import QRCode from 'qrcode-react';

import {getBIP21URL, generateNewAddress} from '../../services/paymentApi';

let lang = langs[Math.floor(Math.random() * langs.length)];

let xpub = "xpub6C6EThH99dAScJJP16oobAKyaVmviS9uNZR4n1dRZxz4icFuaYvLHRt8aKpaMQYsWNH17JxpcwS4" +
    "EGcTv47UrH821UoY2utXaATFswDdiZK";

export default class CashierPOS extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this
      .handleClick
      .bind(this);
    this.state = {
      cryptoPrice: [],
      isLoading: false,
      url: xpub,
      amount: ''

    }
    this.sendSocketIO = this
      .sendSocketIO
      .bind(this);
  }
  sendSocketIO(msg) {
    socket.emit('event', msg);
  }

  componentDidMount() {
    axios
      .get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BCH,BTC,ETC,ETH,LTC&tsym' +
        's=AUD,CAD,EUR,GBP,USD')
      .then(res => {
        const cryptos = res.data;
        this.setState({cryptoPrice: cryptos});
      });
  }

  // hard coded xpub index "5", payment amount "0.5 BCH", and label text "Sample
  // Text"
  handleClick = () => {
    this.setState({isLoading: true});
    let paymentAddress = generateNewAddress(xpub, 5);
    let paymentURL = getBIP21URL(paymentAddress, 0.5, "Sample Text");
    this.setState({url: paymentURL});
  }

  render() {
    const {isLoading, url} = this.state;
    return (
      <article>
        <Helmet>
          <title>Cashier POS Page</title>
          <meta name="description" content="CashierPOS Page"/>
        </Helmet>
        <h1>CashierPOS</h1>
        <div className="component-app">
          <QRCode value={url}/>
          <Button
            disabled={isLoading}
            onClick={!isLoading
            ? this.handleClick
            : null}>
            {isLoading
              ? 'Loading...'
              : 'Loading state'}
          </Button>
          {/*
            <Display value={this.state.next || this.state.total || "0"} />
            <ButtonPanel clickHandler={this.handleClick} />
          */}
          <div className="pad">
            <NumPad.Number
              onChange={(value) => {
              this.setState({
                amount: value
              }, () => console.log(this.state.amount));
            }}
              label={'Total'}
              placeholder={'my placeholder'}
              position={'startBottomLeft'}
              value={100}/>
            <button
              type="button"
              className="btn btn-default pay"
              onClick={() => this.sendSocketIO(this.state.amount)}>Pay with BCH</button>
          </div>
        </div>
      </article>
    );
  }
}