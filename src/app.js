import * as yup from 'yup';
import * as lodash from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import parser from './flowParser.js';
import { buildWatchedState, renderInterface } from './watchers';

const defaultLng = 'ru';

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
  const schema = yup.string().trim().required().url()
    .notOneOf(links);
  return schema.validate(url);
};

const urlForAxious = (currentUrl) => {
  const urlForProxyOrigins = new URL('/get', 'https://allorigins.hexlet.app');
  urlForProxyOrigins.searchParams.set('url', currentUrl);
  urlForProxyOrigins.searchParams.set('disableCache', true);
  return urlForProxyOrigins.toString();
};

const createFeedObj = (parsedFeed, fId, validUrl) => {
  parsedFeed.feedId = fId;
  parsedFeed.url = validUrl;
  return parsedFeed;
};

const createPostObj = (parsedPosts, fId) => {
  parsedPosts.forEach((post) => {
    post.feedId = fId;
    post.postId = lodash.uniqueId();
  });
  return parsedPosts;
};

const checkOldPostsForNewPosts = (oldPosts, newPosts) => (
  newPosts.filter((newPost) => !oldPosts.includes(newPost)));

const markClickedElements = (state, watchedState, elements) => {
  const allPostsEl = elements.initEl.parentElForPosts;
  allPostsEl.addEventListener('click', (event) => {
    const clickedPost = event.target;
    const idClickedPost = clickedPost.getAttribute('data-id');
    if (idClickedPost === undefined || idClickedPost === null) return;
    watchedState.stateUI.clickedIdPosts.push(idClickedPost);

    const joinArrayOfPosts = lodash.flattenDeep(state.posts);
    const infForClikedPost = joinArrayOfPosts.filter((el) => el.postId === idClickedPost);
    const titleClickedPost = infForClikedPost[0].title;
    const descClikedPost = infForClikedPost[0].description;
    const linkClickedPost = infForClikedPost[0].link;

    watchedState.stateUI.modalWinContent = {
      title: titleClickedPost,
      decription: descClikedPost,
      link: linkClickedPost,
    };
  });
};

const addNewPostsAfterUpdate = (stateEl, chosenUrl, watchedState) => {
  const urlForReqest = urlForAxious(chosenUrl);
  axios.get(urlForReqest)
    .then((response) => {
      const newPosts = parser(response.data).posts.map((element) => element.title);
      const chosenFeedObj = stateEl.feeds.filter((feed) => feed.url === chosenUrl);
      const chosenUrlId = chosenFeedObj[0].feedId;
      const postsForChosenUrl = stateEl.posts.flat().filter((item) => chosenUrlId === item.feedId);
      const oldPosts = postsForChosenUrl.map((el) => el.title);
      const postsForAdd = checkOldPostsForNewPosts(oldPosts, newPosts);
      if (postsForAdd.length > 0) {
        const postObjForAdd = parser(response.data)
          .posts.filter((el) => postsForAdd
            .includes(el.title));
        const postObjs = createPostObj(postObjForAdd, chosenUrlId);
        watchedState.posts.push(postObjs);
      }
    })
    .catch((err) => console.log(err));
};

const checkActualRss = (currentState, elements, watchedState) => {
  const newPostsToPromises = Promise.all(currentState.arrayOfValidUrl.map(
    (eachUrl) => addNewPostsAfterUpdate(currentState, eachUrl, watchedState),
  ));
  newPostsToPromises.finally(setTimeout(() => {
    checkActualRss(currentState, elements, watchedState);
  }, 5000));
};

const app = () => {
  const interfaceElements = {
    initEl: {
      title: document.querySelector('.display-3'),
      subTitle: document.querySelector('.lead'),
      placeholderName: document.querySelector('[for="url-input"]'),
      example: document.querySelector('.text-muted'),
      btnAddText: document.querySelector('[class="h-100 btn btn-lg btn-primary px-sm-5"]'),
      authorInf: document.querySelector('[class="text-center"]'),
      modalReadBtn: document.querySelector('[class="btn btn-primary full-article"]'),
      modalCloseEl: document.querySelector('[class="btn btn-secondary"]'),
      formEl: document.querySelector('form'),
      inputFieldEl: document.querySelector('[id="url-input"]'),
      feedbackEl: document.getElementsByClassName('feedback')[0],
      parentElForPosts: document.querySelector('[class="col-md-10 col-lg-8 order-1 mx-auto posts"]'),
    },
    feedAndPostsEl: {
      feedsFieldEl: document.getElementsByClassName('feeds')[0],
      postsFieldEl: document.getElementsByClassName('posts')[0],
      feedTitleEl: i18nEl.t('feedElTitle'),
      postTitleEl: i18nEl.t('postElTitle'),
      viewBtn: i18nEl.t('btns.btnWatch'),
    },
    modalWinEl: {
      modalTitleEl: document.querySelector('[class="modal-title"]'),
      modalDescEl: document.querySelector('[class="modal-body text-break"]'),
    },
  };

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
  };

  const watchedState = buildWatchedState(state, interfaceElements);

  renderInterface(i18nEl, interfaceElements);

  markClickedElements(state, watchedState, interfaceElements);

  interfaceElements.initEl.formEl.addEventListener('submit', (event) => {
    event.preventDefault();

    const inputUrl = event.target.url.value;
    validateUrl(inputUrl, state.arrayOfValidUrl)
      .then((validUrl) => {
        watchedState.status = 'loading';
        axios.get(urlForAxious(validUrl))
          .then((response) => {
            watchedState.status = 'filling';
            const feedId = lodash.uniqueId();
            const parsedResponse = parser(response.data);

            const genFeed = createFeedObj(parsedResponse.feed, feedId, validUrl);
            const genPosts = createPostObj(parsedResponse.posts, feedId);

            watchedState.feeds.push(genFeed);
            watchedState.posts.push(genPosts);

            watchedState.arrayOfValidUrl.push(validUrl);
            watchedState.isValid = true;
            watchedState.networkError = false;
            const msg = i18nEl.t('rssLoaded');
            watchedState.feedbackMsg = msg;

            checkActualRss(state, interfaceElements, watchedState);
          })
          .catch((err) => {
            watchedState.status = 'filling';
            watchedState.isValid = false;
            if (err.message === 'The XML parser does not represent well-formed XML!') {
              watchedState.feedbackMsg = i18nEl.t('errorMsg.wrongRss');
              watchedState.networkError = false;
            } else {
              const errorKey = 'errorMsg.errorNetwork';
              watchedState.feedbackMsg = i18nEl.t(errorKey);
              watchedState.networkError = true;
            }
          });
      })
      .catch((err) => {
        watchedState.isValid = false;
        watchedState.status = 'filling';
        err.errors.forEach((error) => {
          watchedState.feedbackMsg = i18nEl.t(error.key);
        });
      });
  });
};

export default app;
