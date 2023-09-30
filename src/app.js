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
document.getElementsByClassName('feeds')[0]

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

const urlForAxious = (currentUrl) => {
  const urlForProxyOrigins = new URL('/get', 'https://allorigins.hexlet.app');
  urlForProxyOrigins.searchParams.set('url', currentUrl);
  urlForProxyOrigins.searchParams.set('disableCache', true);
  return urlForProxyOrigins.toString();
};

const createFeedObj = (parsedFeed, fId, validUrl) => {
  parsedFeed.feedId = fId;
  parsedFeed.url = validUrl;
  //state.feeds.push(parsedFeed);
  return parsedFeed;
};

const createPostObj = (parsedPosts, fId) => {
  parsedPosts.map((post) => {
    post.feedId = fId;
    post.postId = lodash.uniqueId();
  });
  //state.posts.push(postsWithId);
  return parsedPosts;
};

const checkOldPostsForNewPosts = (oldPosts, newPosts) => {
  return newPosts.filter((newPost) => !oldPosts.includes(newPost));
}

const markClickedLinks = () => {
  const allPostsEl = document.querySelector('[class="list-group border-0 rounded-0"]');
  const allLiEl = allPostsEl.querySelectorAll('a');
  allLiEl.forEach((eachLiEl) => {
    eachLiEl.addEventListener('click', (event) => {
      const clickedPost = event.target;
      const idClickedPost = eachLiEl.getAttribute('data-id');
      //console.log('id clicked post: '+ idClickedPost);
      console.log('click!!!!!' + JSON.stringify({ clickedPost, idClickedPost }));
      watchedState.stateUI.clickedIdPosts.push({ clickedPost, idClickedPost });
    });
  });
}

const markClickedButtons = () => {
  const allPostsEl = document.querySelector('[class="list-group border-0 rounded-0"]');
  allPostsEl.querySelectorAll('button').forEach((eachBtnEl) => {
    eachBtnEl.addEventListener('click', (event) => {
      console.log("clicked");
      const clickedBtn = event.target;
      const idClickedBtn = clickedBtn.getAttribute('data-id');
      const joinArrayOfPosts = lodash.flattenDeep(state.posts);
      const infForClikedPost = joinArrayOfPosts.filter((el) => el.postId === idClickedBtn);
      console.log(infForClikedPost);
      const titleClickedPost = infForClikedPost[0].title;
      const descClikedPost = infForClikedPost[0].description;
      const linkClickedPost = infForClikedPost[0].link;

      const siblingBtnLink = clickedBtn.previousSibling;

      watchedState.stateUI.clickedIdPosts.push({ clickedPost: siblingBtnLink, idClickedPost: idClickedBtn });
      watchedState.stateUI.modalWinContent = { title: titleClickedPost, decription: descClikedPost, link: linkClickedPost };
    });
  })
}

const addPosts = (state, chosenUrl) => {
  const urlForReqest = urlForAxious(chosenUrl);
  axios.get(urlForReqest)
    .then((response) => {
      const newPosts = parser(response.data).posts.map(element => element.title);
      const chosenFeedObj = state.feeds.filter((feed) => feed.url === chosenUrl);
      const chosenUrlId = chosenFeedObj[0].feedId;
      const postsForChosenUrl = state.posts.flat().filter((item) => chosenUrlId === item.feedId);
      // console.log('state.posts: ' + JSON.stringify(state.posts));
      const oldPosts = postsForChosenUrl.map((el) => el.title);
      // console.log('postsForChosenUrl: ' + JSON.stringify(postsForChosenUrl));
      // console.log(oldPosts);
      const postsForAdd = checkOldPostsForNewPosts(oldPosts, newPosts);
      // console.log('postsForAdd ' + JSON.stringify(postsForAdd));
      if (postsForAdd.length > 0) {
        const postObjForAdd = parser(response.data).posts.filter((el) => postsForAdd.includes(el.title));
        // console.log('postObjForAdd: ' + JSON.stringify(postObjForAdd));
        const postObjs = createPostObj(postObjForAdd, chosenUrlId);
        watchedState.posts.push(postObjs);
      }
      markClickedButtons();
      markClickedLinks();
    })
    .catch((err) => (console.log('axious error! ' + err)));
};

const checkActualRss = (watchedState) => {
  const newPostsToPromises = Promise.all(state.arrayOfValidUrl.map((eachUrl) => {
    console.log('updating: ' + eachUrl);
    return addPosts(watchedState, eachUrl);
  }));

  newPostsToPromises.finally(setTimeout(() => {
    checkActualRss(watchedState);
  }, 5000))
};

const app = () => {
  renderInterface(i18nEl, interfaceElements);

  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const inputUrl = event.target.url.value;

    validateUrl(inputUrl, state.arrayOfValidUrl)
      .then((validUrl) => {
        axios.get(urlForAxious(validUrl))
          .then((response) => {
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
            checkActualRss(state);
          })
          .catch(() => {
            const errorKey = 'errorMsg.errorNetwork';
            watchedState.feedbackMsg = i18nEl.t(errorKey);
            watchedState.isValid = true;
            watchedState.networkError = true;
          });
      })
      .catch((err) => {
        watchedState.isValid = false;
        err.errors.forEach((error) => {
          watchedState.feedbackMsg = i18nEl.t(error.key);
        });
      });
  })
};

export default app;
