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

const app = () => {
  const getProxyUrl = (currentUrl) => {
    const urlForProxyOrigins = new URL('/get', 'https://allorigins.hexlet.app');
    urlForProxyOrigins.searchParams.set('url', currentUrl);
    urlForProxyOrigins.searchParams.set('disableCache', true);
    return urlForProxyOrigins.toString();
  };

  const a = getProxyUrl('https://aljazeera.com/xml/rss/all.xml');

  const loadedPost = (data) => {
    watchedState.status = 'postLoading';
    axios.get(getProxyUrl(data))
    .then((response) => {
      const parsedResponse = parser(response.data.contents);
      // console.log(response.data.contents);
      // console.log('parserResp: '+JSON.stringify(parsedResponse)); 
      parsedResponse.forEach((item) =>console.log(item.link))
    })
  };

  console.log('aaaa:  ' + loadedPost(a));

  renderInterface(i18nEl, interfaceElements);
  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const schema = yup.object({
      inputUrl: yup.string().url(),
      inputUrlCheckDouble: yup.mixed().notOneOf(state.arrayOfValidUrl),
    });

    const urlForCheck = {
      inputUrl: event.target.url.value,
      inputUrlCheckDouble: event.target.url.value,
    };
    schema.validate(urlForCheck)
      .then(() => {
        watchedState.arrayOfValidUrl.push(urlForCheck.inputUrl);
        watchedState.isValid = true;
        watchedState.feedbackMsg = i18nEl.t('rssLoaded');
      })
      .catch((err) => {
        watchedState.isValid = false;
        err.errors.forEach((error) => {
          watchedState.feedbackMsg = i18nEl.t(error.key);
        });
      });
  });
  loadedPost();
};

export default app;