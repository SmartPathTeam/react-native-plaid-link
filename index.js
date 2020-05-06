import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import { PropTypes } from 'prop-types';
import omit from 'object.omit';

const injectedJavaScript = `(function() {
  window.postMessage = function(data) {
    window.ReactNativeWebView.postMessage(data);
  };
})()`;

class PlaidAuthenticator extends Component {
  render() {
    const {
      publicKey,
      selectAccount,
      env,
      product,
      clientName,
      webhook,
      style,
      token,
      publicToken,
      countryCodes
    } = this.props;

    let uri = `https://cdn.plaid.com/link/v2/stable/link.html?key=${
      publicKey
    }&apiVersion=v2&env=${env}&product=${product}&clientName=${
      clientName
    }&isWebView=true&isMobile=true&selectAccount=${
      selectAccount
    }`;
  
    uri = token !== undefined ? `${uri}&token=${token}` : uri;
    uri = webhook !== undefined ? `${uri}&webhook=${webhook}` : uri;
    uri = publicToken !== undefined ? `${uri}&token=${publicToken}` : uri;
    uri = countryCodes !== undefined ? `${uri}&countryCodes=${countryCodes}` : uri;
 
    return (
      <WebView
        {...omit(this.props, [
          'publicKey',
          'selectAccount',
          'env',
          'product',
          'clientName',
          'countryCodes',
          'webhook',
          'token',
          'publicToken',
          'ref'
        ])}
        style={style}
        ref={this.props.plaidRef}
        source={{ uri }}
        onMessage={this.onMessage}
        useWebKit
        injectedJavaScript={injectedJavaScript}
      />
    );
  }

  /*
    Response example for success
    {
      "action": "plaid_link-undefined::connected",
      "metadata": {
        "account": {
          "id": null,
          "name": null
        },
        "account_id": null,
        "public_token": "public-sandbox-e697e666-9ac2-4538-b152-7e56a4e59365",
        "institution": {
          "name": "Chase",
          "institution_id": "ins_3"
        }
      }
    }
  */
 onMessage = event => { 
    try { 
      this.props.onMessage(JSON.parse(event.nativeEvent.data));
    } catch (error){
      this.props.onMessage({ data: { error } });
    }
  };
}

PlaidAuthenticator.propTypes = {
  publicKey: PropTypes.string.isRequired,
  onMessage: PropTypes.func.isRequired,
  env: PropTypes.string.isRequired,
  product: PropTypes.string.isRequired,
  clientName: PropTypes.string,
  webhook: PropTypes.string,
  plaidRef: PropTypes.func,
  publicToken: PropTypes.string,
  countryCodes: PropTypes.string
};

PlaidAuthenticator.defaultProps = {
  clientName: '',
  plaidRef: () => {}
};

export default PlaidAuthenticator;
