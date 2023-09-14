// здесь будет View. Блок, где происходит отрисовка //

export const renderInitial = () => {
  const formEl = document.querySelector('form');
  formEl.focus();
  formEl.reset();
};

export const renderInputField = (val) => {
  const inputEl = document.querySelector('[id="url-input"]');
  if (!val) {
    inputEl.classList.add('is-invalid');
  } else {
    inputEl.classList.remove('is-invalid');
  }
};

export const renderMsg = (msg, isValid) => {
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
