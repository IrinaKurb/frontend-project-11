/* eslint-disable import/no-extraneous-dependencies */
/* eslint no-param-reassign: "error" */
import * as yup from 'yup';
import * as lodash from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import { renderInputField, renderInitial, renderMsg } from './view';

const state = {
  arrayOfValidUrl: [],
  isValid: true,
  feedbackMsg: '',
};

const correctUrl = /^(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
const schema = yup.object({
  inputUrl: yup.string().matches(correctUrl, 'URL is not valid'),
});

const watchedState = onChange(state, (pathToEl, value) => {
  switch (pathToEl) {
    case 'isValid':
      renderInputField(value);
      break;
    case 'arrayOfValidUrl':
      renderInitial();
      break;
    case 'feedbackMsg':
      renderMsg(value, state.isValid);
      break;
    default:
      break;
  }
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
