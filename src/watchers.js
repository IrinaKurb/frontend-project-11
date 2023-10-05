/* eslint no-param-reassign: "error" */
// здесь будет View. Блок, где происходит отрисовка //
import onChange from 'on-change';

const renderInterface = (i18nInstance, elements) => {
  elements.initEl.title.textContent = i18nInstance.t('title');
  elements.initEl.subTitle.textContent = i18nInstance.t('subTitle');
  elements.initEl.placeholderName.textContent = i18nInstance.t('placeholderName');
  elements.initEl.example.textContent = i18nInstance.t('example');
  elements.initEl.btnAddText.textContent = i18nInstance.t('btns.btnAdd');
  elements.initEl.authorInf.innerHTML = `${i18nInstance.t('author')} <a href="https://github.com/IrinaKurb" target="_blank">IrinaKurb</a>`;
  elements.initEl.modalReadBtn.textContent = i18nInstance.t('btns.btnReadMore');
  elements.initEl.modalCloseEl.textContent = i18nInstance.t('btns.btnClose');
};

const renderStatus = (val, elements) => {
  const btnEl = elements.initEl.btnAddText;
  if (val === 'loading') {
    btnEl.setAttribute('disabled', 'disabled');
  } else {
    btnEl.removeAttribute('disabled');
  }
};

const renderInitial = (elements) => {
  const { formEl } = elements.initEl;
  formEl.focus();
  formEl.reset();
};

const renderInputField = (val, elements) => {
  const inputEl = elements.initEl.inputFieldEl;
  if (!val) {
    inputEl.classList.add('is-invalid');
  } else {
    inputEl.classList.remove('is-invalid');
  }
};

const renderNetworkError = (isErorr, elements) => {
  if (!isErorr) return;
  renderInputField(isErorr, elements);
  const { feedbackEl } = elements.initEl;
  const classOfInvalidMsg = 'text-danger';
  const classOfValidMsg = 'text-success';
  feedbackEl.classList.add(classOfInvalidMsg);
  feedbackEl.classList.remove(classOfValidMsg);
};

const renderMsg = (msg, isValid, elements) => {
  const { feedbackEl } = elements.initEl;
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

const renderFeedAndPostCommomPart = (el, elements) => {
  const divElLevel1 = document.createElement('div');
  divElLevel1.classList.add('card', 'border-0');
  el.append(divElLevel1);
  const divElLevel2 = document.createElement('div');
  divElLevel2.classList.add('card-body');
  divElLevel1.append(divElLevel2);
  const h2El = document.createElement('h2');
  if (el.classList.contains('posts')) {
    h2El.textContent = elements.feedAndPostsEl.postTitleEl;
  } else {
    h2El.textContent = elements.feedAndPostsEl.feedTitleEl;
  }
  h2El.classList.add('card-title', 'h4');
  divElLevel2.append(h2El);
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  el.append(ulEl);
};

const renderFeed = (val, elements) => {
  const feedEl = elements.feedAndPostsEl.feedsFieldEl;
  if (!feedEl.querySelectorAll('div').length) {
    renderFeedAndPostCommomPart(feedEl, elements);
  }
  const lastAddedFeed = val.at(-1);
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
  const h3eEl = document.createElement('h3');
  h3eEl.classList.add('h6', 'm-0');
  h3eEl.textContent = lastAddedFeed.channelTitle;
  const pEl = document.createElement('p');
  pEl.classList.add('m-0', 'small', 'text-black-50');
  pEl.textContent = lastAddedFeed.channelDescription;
  feedEl.querySelector('ul').prepend(liEl);
  liEl.append(h3eEl);
  h3eEl.append(pEl);
};

const renderPosts = (val, elements) => {
  const postsEl = elements.feedAndPostsEl.postsFieldEl;
  if (!postsEl.querySelectorAll('div').length) {
    renderFeedAndPostCommomPart(postsEl, elements);
  }
  const lastAddedRss = val.at(-1);
  lastAddedRss.forEach((eachPost) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const aEl = document.createElement('a');
    aEl.setAttribute('href', `${eachPost.link}`);
    aEl.setAttribute('class', 'fw-bold');
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('data-id', `${eachPost.postId}`);
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = eachPost.title;
    liEl.append(aEl);
    postsEl.querySelector('ul').prepend(liEl);

    const btnEl = document.createElement('button');
    btnEl.setAttribute('type', 'button');
    btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btnEl.setAttribute('data-id', `${eachPost.postId}`);
    btnEl.setAttribute('data-bs-toggle', 'modal');
    btnEl.setAttribute('data-bs-target', '#modal');

    btnEl.textContent = elements.feedAndPostsEl.viewBtn;

    liEl.append(btnEl);
  });
};

const renderClickedPost = (val) => {
  const lastAddedClicked = val.at(-1);
  lastAddedClicked.clickedPost.classList.remove('class', 'fw-bold');
  lastAddedClicked.clickedPost.classList.add('class', 'fw-normal');
  lastAddedClicked.clickedPost.classList.add('class', 'link-secondary');
};

const renderModalWindow = (val, elements) => {
  const { modalTitleEl, modalDescEl } = elements.modalWinEl;
  const { modalReadBtn } = elements.initEl;

  modalTitleEl.textContent = val.title;
  modalDescEl.textContent = val.decription;
  modalReadBtn.setAttribute('href', val.link);
};

const buildWatchedState = (state, elements) => onChange(state, (pathToEl, value) => {
  switch (pathToEl) {
    case 'status':
      renderStatus(value, elements);
      break;
    case 'isValid':
      renderInputField(value, elements);
      break;
    case 'arrayOfValidUrl':
      renderInitial(elements);
      break;
    case 'feedbackMsg':
      renderMsg(value, state.isValid, elements);
      break;
    case 'feeds':
      renderFeed(value, elements);
      break;
    case 'networkError':
      renderNetworkError(value, elements);
      break;
    case 'posts':
      renderPosts(value, elements);
      break;
    case 'stateUI.clickedIdPosts':
      renderClickedPost(value);
      break;
    case 'stateUI.modalWinContent':
      renderModalWindow(value, elements);
      break;
    default:
      break;
  }
});

export { renderInterface, buildWatchedState };
