import request from 'superagent';
import * as superagentCache from 'superagent-cache';
superagentCache(request);

const backendURL = 'http://localhost:3000';

export function loadPosts(pageIndex) {
  if (pageIndex === undefined) pageIndex = 0;
  return new Promise((resolve, reject) =>
    request
      .get(`${backendURL}/api/hexoposts/pages`)
      .query({ skip: pageIndex * 5, limit: 5 })
      .then((res, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body.data);
        }
      })
  );
}

export function getNumberOfPages(pageIndex) {
  return new Promise((resolve, reject) =>
    request.get(`${backendURL}/api/hexoposts/pageCount`).then((res, err) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.body.data);
      }
    })
  );
}

/**
 * Fetchs a post with the given ID.
 * Returns a promise containing (res, err)
 * @param {*} postID
 */
export function getPost(postID) {
  return request.get(`${backendURL}/api/hexoposts/${postID}`);
}

/**
 * Loads the content of a post.
 * Returns a promise containing (res, err)
 * @param {*} postID
 */
export function loadContent(postID) {
  return request.get(`${backendURL}/api/posts/${postID}/content`);
}

/**
 * Fetch a post for the given date.
* Returns a promise containing (res, err)
 * @param {*} articleName
 */
export function getPostFromDate(year, month, day, articleName) {
  // TODO:: handle multiple posts per date
  return request
    .get(`${backendURL}/api/hexoposts`)
    .query({
      slug: articleName
    })
    .then((res, err) => {
      return new Promise((resolve, reject) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body.data[0]);
        }
      });
    });
}

export function loadCategories(categoryIDs) {
  return new Promise(function(resolve, reject) {
    const categories = [];
    request.get(`${backendURL}/api/categories`).then((res, err) => {
      if (err) {
        reject(err);
      } else {
        const queryParams = new Array(categories.length);

        for (let i = 0; i < categoryIDs.length; ++i) {
          queryParams[i] = [];
        }

        for (let i = 0; i < categoryIDs.length; ++i) {
          const cID = categoryIDs[i];
          const categoryIdx = 'category' + (i + 1);
          let categoryName = '';

          if (res.body.hasOwnProperty(cID)) {
            categoryName = res.body[cID].name;
            for (let j = 0; j < categoryIDs.length; ++j) {
              queryParams[j][categoryIdx] = categoryName;
            }

            categories.push({
              name: categoryName,
              link: categoryIdx,
              params: queryParams[i]
            });
          }
        }
        resolve(categories);
      }
    });
  });
}
