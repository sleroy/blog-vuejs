"use strict";

require("es6-promise/auto");

import Vue from "vue";

import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "application/json";

import Spinner from "vue-simple-spinner";
import VueFormGenerator from "vue-form-generator";
import VueWebsocket from "vue-websocket";
import * as vueScrollTo from "vue-scroll-to";

import Filters from "./core/filters";
import VueI18Next from "./core/i18next.js";
import store from "./core/store";
import App from "./core/App";

/**Components */
import Nav from "./core/components/partial/nav";
import copyright from "./core/components/partial/copyright";
import postPaginator from "./core/components/partial/postPaginator";
import postList from "./modules/post/postList";
import blogAside from "./core/components/partial/blog-aside";


Vue.use(Filters);

Vue.use(VueFormGenerator);
Vue.use(VueWebsocket);

Vue.use(vueScrollTo);

Vue.config.productionTip = true;
Vue.config.debug = true;
Vue.config.devtools = true;

/**
 * Default components
 */
Vue.component("spinner", Spinner);
Vue.component("navbar", Nav);
Vue.component("copyright", copyright);
Vue.component("post-paginator", postPaginator);
Vue.component("post-list", postList);
Vue.component("blog-aside", blogAside);


/**
 * Event BUS
 */
const EventBus = new Vue();

Object.defineProperties(Vue.prototype, {
  $eventBus: {
    get() {
      return EventBus;
    }
  }
});

window.addEventListener("error", err => {
  alert(`window.onerror-\n${err.message}`);
});




//Vue.http.headers.common['X-CSRF-TOKEN'] = $('input[name="csrf"]').val();

// Register i18next localization module. We need to
// wait it before start the application!
Vue.use(VueI18Next, (i18next) => {
	let router = require("./core/router").default; // Load only after i18next initialized

	new Vue({
		el: "#app",
		components: {
			App
		},
		router,
		store,
		render: h => h("app")
	});
});
