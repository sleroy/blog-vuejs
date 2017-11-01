/**
 * Module containing url utility functions.
 */

import global from '@/config/global';

 /**
  * Computes absolute URL for assets.
  * @param assetURL the relative assert url.
  */
 export function remoteUrl(route, assetURL) {
  if (assetURL.startsWith('http:')) {
    // Remote picture
  } else {
    // Local picture, adding assets folder.
    assetURL = global.assetFolder + route.path + assetURL;
  }
  console.log(assetURL);
  return assetURL;
 }
