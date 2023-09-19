/* eslint-disable import/no-extraneous-dependencies */
/* eslint no-param-reassign: "error" */
import * as yup from 'yup';
import * as lodash from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import { watchedState, state, renderInterface } from './watchers';
import resources from './locales';

const defaultLng = 'ru';

const interfaceElements = {
  title: document.querySelector('.display-3'),
  subTitle: document.querySelector('.lead'),
  placeholderName: document.querySelector('[for="url-input"]'),
  example: document.querySelector('.text-muted'),
  btn: document.querySelector('[class="h-100 btn btn-lg btn-primary px-sm-5"]'),
};

console.log(interfaceElements);

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
};

export default app;
