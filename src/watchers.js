// здесь будет View. Блок, где происходит отрисовка //
import onChange from 'on-change';

const renderInitial = () => {
  const formEl = document.querySelector('form');
  formEl.focus();
  formEl.reset();
};

const renderInputField = (val) => {
  const inputEl = document.querySelector('[id="url-input"]');
  if (!val) {
    inputEl.classList.add('is-invalid');
  } else {
    inputEl.classList.remove('is-invalid');
  }
};

const renderMsg = (msg, isValid) => {
  const feedbackEl = document.getElementsByClassName('feedback')[0];
  feedbackEl.textContent = msg;
  const classOfInvalidMsg = 'text-danger';
  const classOfValidMsg = 'text-success';
  if (isValid) {
    feedbackEl.classList.remove(classOfInvalidMsg);
    feedbackEl.classList.add(classOfValidMsg);
  } else {
    feedbackEl.classList.add(classOfInvalidMsg);
    feedbackEl.classList.remove(classOfValidMsg);
  }
};

const state = {
  arrayOfValidUrl: [],
  isValid: true,
  feedbackMsg: '',
};

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

export { state, watchedState };
