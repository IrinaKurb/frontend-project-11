/* eslint no-param-reassign: "error" */
// здесь будет View. Блок, где происходит отрисовка //
import onChange from 'on-change';

const state = {
  status: 'filling',
  arrayOfValidUrl: [],
  isValid: true,
  feedbackMsg: '',
  posts: [],
  feeds: [],
  networkError: false,
  stateUI: {
    clickedIdPosts: [],
    modalWinContent: null,
  },
  elements: {
    feedTitleEl: null,
    postTitleEl: null,
    viewBtn: null,
    readBtn: null,
    closeBtn: null,
  },
};

const renderInterface = (i18nInstance, elements) => {
  elements.title.textContent = i18nInstance.t('title');
  elements.subTitle.textContent = i18nInstance.t('subTitle');
  elements.placeholderName.textContent = i18nInstance.t('placeholderName');
  elements.example.textContent = i18nInstance.t('example');
  elements.btnAddText.textContent = i18nInstance.t('btns.btnAdd');
};

const renderStatus = (val) => {
  const btnEl = document.querySelector('[type="submit"]');
  if (val === 'loading') {
    btnEl.setAttribute('disabled', 'disabled');
  } else {
    btnEl.removeAttribute('disabled');
  }
};

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

const renderNetworkError = (isErorr) => {
  if (!isErorr) return;
  renderInputField(isErorr);
  const feedbackEl = document.getElementsByClassName('feedback')[0];
  const classOfInvalidMsg = 'text-danger';
  const classOfValidMsg = 'text-success';
  feedbackEl.classList.add(classOfInvalidMsg);
  feedbackEl.classList.remove(classOfValidMsg);
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

const renderFeedAndPostCommomPart = (el) => {
  const divElLevel1 = document.createElement('div');
  divElLevel1.classList.add('card', 'border-0');
  el.append(divElLevel1);
  const divElLevel2 = document.createElement('div');
  divElLevel2.classList.add('card-body');
  divElLevel1.append(divElLevel2);
  const h2El = document.createElement('h2');
  if (el.classList.contains('posts')) {
    h2El.textContent = state.elements.postTitleEl;
  } else {
    h2El.textContent = state.elements.feedTitleEl;
  }
  h2El.classList.add('card-title', 'h4');
  divElLevel2.append(h2El);
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  el.append(ulEl);
};

const renderFeed = (val) => {
  const feedEl = document.getElementsByClassName('feeds')[0];
  if (!feedEl.querySelectorAll('div').length) {
    renderFeedAndPostCommomPart(feedEl);
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

const renderPosts = (val) => {
  const postsEl = document.getElementsByClassName('posts')[0];
  if (!postsEl.querySelectorAll('div').length) {
    renderFeedAndPostCommomPart(postsEl);
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

    btnEl.textContent = state.elements.viewBtn;

    liEl.append(btnEl);
  });
};

const renderClickedPost = (val) => {
  const lastAddedClicked = val.at(-1);
  lastAddedClicked.clickedPost.classList.remove('class', 'fw-bold');
  lastAddedClicked.clickedPost.classList.add('class', 'fw-normal');
  lastAddedClicked.clickedPost.classList.add('class', 'link-secondary');
};

const renderModalWindow = (val) => {
  const modalTitle = document.querySelector('[class="modal-title"]');
  const modalDesc = document.querySelector('[class="modal-body text-break"]');
  const modalReadBtn = document.querySelector('[class="btn btn-primary full-article"]');
  const modalCloseEl = document.querySelector('[class="btn btn-secondary"]');
  modalReadBtn.textContent = state.elements.readBtn;
  modalCloseEl.textContent = state.elements.closeBtn;
  modalTitle.textContent = val.title;
  modalDesc.textContent = val.decription;
  modalReadBtn.setAttribute('href', val.link);
};

const watchedState = onChange(state, (pathToEl, value) => {
  switch (pathToEl) {
    case 'status':
      renderStatus(value);
      break;
    case 'isValid':
      renderInputField(value);
      break;
    case 'arrayOfValidUrl':
      renderInitial();
      break;
    case 'feedbackMsg':
      renderMsg(value, state.isValid);
      break;
    case 'feeds':
      renderFeed(value);
      break;
    case 'networkError':
      renderNetworkError(value);
      break;
    case 'posts':
      renderPosts(value);
      break;
    case 'stateUI.clickedIdPosts':
      renderClickedPost(value);
      break;
    case 'stateUI.modalWinContent':
      renderModalWindow(value);
      break;
    default:
      break;
  }
});

export { state, watchedState, renderInterface };
