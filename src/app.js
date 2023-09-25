/* eslint-disable import/no-extraneous-dependencies */
/* eslint no-param-reassign: "error" */
import * as yup from 'yup';
import * as lodash from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import { watchedState, state, renderInterface } from './watchers';
import resources from './locales';
import parser from './flowParser.js';


const defaultLng = 'ru';

const interfaceElements = {
  title: document.querySelector('.display-3'),
  subTitle: document.querySelector('.lead'),
  placeholderName: document.querySelector('[for="url-input"]'),
  example: document.querySelector('.text-muted'),
  btn: document.querySelector('[class="h-100 btn btn-lg btn-primary px-sm-5"]'),
};

const i18nEl = i18next.createInstance();
i18nEl.init({
  lng: defaultLng,
  debag: false,
  resources,
});

yup.setLocale({
  mixed: {
    notOneOf: () => ({ key: 'errorMsg.rssExist' }),
  },
  string: {
    url: () => ({ key: 'errorMsg.invalidUrl' }),
  },
});

const validateUrl = (url, links) => {
  const schema = yup.string().trim().required().url().notOneOf(links);
  return schema.validate(url);
};

const sendAxiousRequest = (currentUrl) => {
  const urlForProxyOrigins = new URL('/get', 'https://allorigins.hexlet.app');
  urlForProxyOrigins.searchParams.set('url', currentUrl);
  urlForProxyOrigins.searchParams.set('disableCache', true);
  axios.get(urlForProxyOrigins.toString())
  .then((response) => {
    const parsedResponse = parser(response.data);

    const feedId = lodash.uniqueId();
    parsedResponse.feed.Id = feedId;
    parsedResponse.posts.map((post) => post.feedID = feedId);

    watchedState.posts = parsedResponse.posts;
    watchedState.feeds = parsedResponse.feed;
    watchedState.arrayOfValidUrl.push(currentUrl);
    watchedState.isValid = true;
    watchedState.networkError = false;

    const msg = i18nEl.t('rssLoaded');
    console.log("msg: " + msg);
    watchedState.feedbackMsg = msg;
  })
  .catch(() => {
    const errorKey = 'errorMsg.errorNetwork';
    watchedState.feedbackMsg = i18nEl.t(errorKey);
    watchedState.isValid = true;
    watchedState.networkError = true;   
  });
};

const getPost = (state) => {

};

const app = () => {
  renderInterface(i18nEl, interfaceElements);

  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const inputUrl = event.target.url.value;

    validateUrl(inputUrl, state.arrayOfValidUrl)
      .then((validUrl) => {
          sendAxiousRequest(validUrl)      
      })
      .catch((err) => {
        watchedState.isValid = false;
        err.errors.forEach((error) => {
          watchedState.feedbackMsg = i18nEl.t(error.key);
        });
      });
  });
};

export default app;
