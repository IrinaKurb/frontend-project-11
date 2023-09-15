/* eslint-disable import/no-extraneous-dependencies */
/* eslint no-param-reassign: "error" */
import * as yup from 'yup';
import * as lodash from 'lodash';
import axios from 'axios';
import { state, watchedState } from './watchers';
import i18next from 'i18next';
import locales from './locales';

const defaultLng = 'ru';

// it is asinc fN!
/* const i18nEl = i18next.createInstance();
i18nEl.init({
  lig: defaultLng,
  debag: false,
  locales,
});*/

const correctUrl = /^(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

yup.setLocale({
  mixed: {
    notOneOf: () => ({ key: 'msgText.rssExist' }),
  },
  string: {
    url: () => ({ key: 'msgText.invalidUrl' }),
    matches: ({ key: 'msgText.rssLoaded' }),
  },
});

const schema = yup.object({
  inputUrl: yup.string().matches(correctUrl, 'URL is not valid'),
});

const app = () => {
  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const urlForCheck = { inputUrl: event.target.url.value };
    schema.validate(urlForCheck)
      .then(() => {
        if (state.arrayOfValidUrl.includes(urlForCheck.inputUrl)) {
          watchedState.isValid = false;
          watchedState.feedbackMsg = 'RSS уже существует';
        } else {
          watchedState.arrayOfValidUrl.push(urlForCheck.inputUrl);
          watchedState.isValid = true;
          watchedState.feedbackMsg = 'RSS успешно загружен';
        }
      })
      .catch(() => {
        watchedState.isValid = false;
        watchedState.feedbackMsg = 'Ссылка должна быть валидным URL';
      });
  });
};

export default app;
